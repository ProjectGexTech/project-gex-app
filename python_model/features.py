"""
Feature engineering for football match prediction.

All features are computed from pre-match data only — no in-game stats.

Training and live prediction share one code path: TeamHistory holds every
team's state, built from finished matches, and both read features from it.
Only the odds come from the live app.

  * Form (pts / win rate / draw rate): last FORM_WINDOW games of the CURRENT
    season, all venues.
  * Goals averages: season-to-date, venue-specific (home team's HOME games,
    away team's AWAY games).
  * H2H: last FORM_WINDOW meetings, any venue / season.
  * Elo rating difference, carried across seasons and divisions.
  * Last-ROLL_WINDOW goals and shots on target for/against, any venue / season.
  * Rest days since each team's previous match.
  * Odds: market-average odds with the bookmaker margin removed — mirrors the
    app's cross-bookmaker averaged odds.

Unknown values are NaN (never invented defaults); XGBoost handles missing
values natively.
"""
import numpy as np
import pandas as pd
from collections import defaultdict, deque
from typing import Dict, Any, Optional, List

FORM_WINDOW = 5  # Rolling window: last N games per team / last N H2H meetings

# Original feature set (form, venue goals, H2H, odds)
BASE_FEATURE_COLS = [
    "home_form_pts",
    "home_goals_scored_avg",
    "home_goals_conceded_avg",
    "home_win_rate",
    "home_draw_rate",
    "away_form_pts",
    "away_goals_scored_avg",
    "away_goals_conceded_avg",
    "away_win_rate",
    "away_draw_rate",
    "h2h_home_win_rate",
    "h2h_draw_rate",
    "h2h_goals_avg",
    "odds_home_prob",
    "odds_draw_prob",
    "odds_away_prob",
    "odds_ou25_over_prob",
    "odds_ou25_under_prob",
]

ODDS_FEATURE_COLS = [c for c in BASE_FEATURE_COLS if c.startswith("odds_")]

# Team-history features (Elo, Poisson goals model, last-10 goals / shots on target, rest)
HISTORY_FEATURE_COLS = [
    "elo_diff", "elo_home_expectancy",
    "pois_xg_home", "pois_xg_away", "pois_p_home", "pois_p_draw", "pois_p_away", "pois_p_over25", "pois_p_btts",
    "home_gf_l10", "home_ga_l10", "home_sot_for_l10", "home_sot_against_l10", "home_rest_days",
    "away_gf_l10", "away_ga_l10", "away_sot_for_l10", "away_sot_against_l10", "away_rest_days",
]

# Columns used as model inputs (must match between training and prediction)
FEATURE_COLS = BASE_FEATURE_COLS + HISTORY_FEATURE_COLS

NAN = float("nan")

# Raw decimal odds kept next to the features for evaluation / backtesting only —
# never model inputs. "max" = best price across bookmakers, "avg" = market average
# (both pre-match), "close" = Pinnacle closing odds (the sharpest public benchmark).
ODDS_COLS = {
    "max_h": "MaxH", "max_d": "MaxD", "max_a": "MaxA",
    "avg_h": "AvgH", "avg_d": "AvgD", "avg_a": "AvgA",
    "close_h": "PSCH", "close_d": "PSCD", "close_a": "PSCA",
    "max_over": "Max>2.5", "max_under": "Max<2.5",
    "avg_over": "Avg>2.5", "avg_under": "Avg<2.5",
    "close_over": "PC>2.5", "close_under": "PC<2.5",
}


# ── Shared helpers (used by both training and prediction) ─────────────────────

def _valid_odds(odds) -> bool:
    try:
        return odds is not None and float(odds) > 1.0
    except (TypeError, ValueError):
        return False


def remove_margin(*odds) -> List[float]:
    """Convert a full set of decimal odds to margin-free probabilities (NaN if any missing)."""
    if not all(_valid_odds(o) for o in odds):
        return [NAN] * len(odds)
    raw = [1.0 / float(o) for o in odds]
    total = sum(raw)
    return [p / total for p in raw]


def form_features(results: str) -> Dict[str, float]:
    """
    Form features from a W/D/L string, oldest → newest. Uses the last FORM_WINDOW games.
    Returns NaNs if there are no games.
    """
    chars = [c for c in (results or "").upper() if c in "WDL"][-FORM_WINDOW:]
    n = len(chars)
    if n == 0:
        return {"form_pts": NAN, "win_rate": NAN, "draw_rate": NAN}
    wins, draws = chars.count("W"), chars.count("D")
    return {
        "form_pts": (wins * 3 + draws) / (n * 3),
        "win_rate": wins / n,
        "draw_rate": draws / n,
    }


def goals_features(scored, conceded, games) -> Dict[str, float]:
    """Per-game goal averages from totals; NaN if games is unknown or zero."""
    try:
        g = float(games)
        if g <= 0:
            raise ValueError
        return {"goals_scored_avg": float(scored) / g, "goals_conceded_avg": float(conceded) / g}
    except (TypeError, ValueError):
        return {"goals_scored_avg": NAN, "goals_conceded_avg": NAN}


def h2h_features(meetings: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    H2H features from meetings, most recent first. Each meeting has
    `home_team_result` ('W'/'D'/'L' from the perspective of the CURRENT home team)
    and `total_goals`. Uses the most recent FORM_WINDOW meetings.
    """
    recent = (meetings or [])[:FORM_WINDOW]
    n = len(recent)
    if n == 0:
        return {"home_win_rate": NAN, "draw_rate": NAN, "goals_avg": NAN}
    return {
        "home_win_rate": sum(m["home_team_result"] == "W" for m in recent) / n,
        "draw_rate": sum(m["home_team_result"] == "D" for m in recent) / n,
        "goals_avg": float(np.mean([m["total_goals"] for m in recent])),
    }


def assemble_features(home_form, away_form, home_goals, away_goals, h2h,
                      p_home, p_draw, p_away, p_over, p_under) -> Dict[str, float]:
    return {
        "home_form_pts":           home_form["form_pts"],
        "home_goals_scored_avg":   home_goals["goals_scored_avg"],
        "home_goals_conceded_avg": home_goals["goals_conceded_avg"],
        "home_win_rate":           home_form["win_rate"],
        "home_draw_rate":          home_form["draw_rate"],
        "away_form_pts":           away_form["form_pts"],
        "away_goals_scored_avg":   away_goals["goals_scored_avg"],
        "away_goals_conceded_avg": away_goals["goals_conceded_avg"],
        "away_win_rate":           away_form["win_rate"],
        "away_draw_rate":          away_form["draw_rate"],
        "h2h_home_win_rate":       h2h["home_win_rate"],
        "h2h_draw_rate":           h2h["draw_rate"],
        "h2h_goals_avg":           h2h["goals_avg"],
        "odds_home_prob":          p_home,
        "odds_draw_prob":          p_draw,
        "odds_away_prob":          p_away,
        "odds_ou25_over_prob":     p_over,
        "odds_ou25_under_prob":    p_under,
    }


# ── Shared row helpers ────────────────────────────────────────────────────────

def _result_for(team: str, g) -> str:
    if g["FTR"] == "D":
        return "D"
    won = (g["HomeTeam"] == team and g["FTR"] == "H") or (g["AwayTeam"] == team and g["FTR"] == "A")
    return "W" if won else "L"


def _pick_odds(row, avg_cols: List[str], fallback_cols: List[str]) -> List[float]:
    """Market-average odds, falling back to Bet365 when the average is missing."""
    for cols in (avg_cols, fallback_cols):
        vals = [row.get(c, np.nan) for c in cols]
        if all(_valid_odds(v) for v in vals):
            return remove_margin(*vals)
    return [NAN] * len(avg_cols)


def _encode_result(ftr: str) -> float:
    return {"H": 0.0, "D": 1.0, "A": 2.0}.get(str(ftr).strip(), np.nan)


# ── Team history: all per-team state, shared by training and live serving ────

LEAGUE_TIER = {"EPL": 1, "Championship": 2, "League1": 3, "League2": 4}  # promotion links
ELO_START, ELO_K, ELO_HFA = 1500.0, 20.0, 60.0
ROLL_WINDOW = 10   # last N matches (any venue, any season) for shots / goals averages
REST_CAP = 21      # days; longer breaks behave like a fresh start

# Online Poisson goals model (Dixon-Coles style attack/defence strengths, updated
# by one gradient step on the Poisson log-likelihood after every match)
POIS_LR, POIS_LEAGUE_LR = 0.03, 0.002
POIS_START_MU, POIS_START_HA = np.log(1.3), 0.25   # log goals per team per match, log home advantage
MAX_GOALS = 10
_GOALS = np.arange(MAX_GOALS + 1)
_LOG_FACT = np.cumsum(np.log(np.maximum(_GOALS, 1)))


def _zero_venue():
    return [0.0, 0.0, 0]


def _recent_window():
    return deque(maxlen=ROLL_WINDOW)


def _mean(values) -> float:
    vals = [v for v in values if not np.isnan(v)]
    return float(np.mean(vals)) if vals else NAN


def _num(v) -> float:
    v = pd.to_numeric(v, errors="coerce")
    return float(v) if pd.notna(v) else NAN


def poisson_market_probs(xg_home: float, xg_away: float) -> Dict[str, float]:
    """1X2 / O/U 2.5 / BTTS probabilities from independent Poisson goal counts."""
    ph = np.exp(_GOALS * np.log(xg_home) - xg_home - _LOG_FACT)
    pa = np.exp(_GOALS * np.log(xg_away) - xg_away - _LOG_FACT)
    m = np.outer(ph, pa)  # m[i, j] = P(home scores i, away scores j)
    return {
        "pois_p_home":   float(np.tril(m, -1).sum()),
        "pois_p_draw":   float(np.trace(m)),
        "pois_p_away":   float(np.triu(m, 1).sum()),
        "pois_p_over25": float(1.0 - m[0, 0] - m[1, 0] - m[0, 1] - m[2, 0] - m[1, 1] - m[0, 2]),
        "pois_p_btts":   float((1.0 - ph[0]) * (1.0 - pa[0])),
    }


class TeamHistory:
    """
    Everything known about each team from finished matches. Training feeds it
    matches in date order (`update`) and reads features before each match day;
    the ML server loads a copy updated through the latest results and reads
    features for upcoming fixtures. Same code path, so no train/serve skew.
    """

    def __init__(self):
        self.form = defaultdict(str)              # (league, season, team) -> W/D/L, oldest -> newest
        self.venue = defaultdict(_zero_venue)     # (league, season, team, "H"/"A") -> scored, conceded, games
        self.h2h = defaultdict(list)              # frozenset({home, away}) -> past matches, oldest -> newest
        self.recent = defaultdict(_recent_window) # team -> (goals for, against, SoT for, against)
        self.elo = {}                             # team -> rating
        self.attack, self.defence = {}, {}        # team -> log-scale Poisson strengths
        self.league_mu, self.league_ha = {}, {}   # league -> log base goal rate, log home advantage
        self.team_league = {}                     # team -> league of its latest match
        self.last_date = {}                       # team -> date of its latest match
        self.current_season = {}                  # league -> latest season seen
        self.last_match_date = None

    # Elo ────────────────────────────────────────────────────────────────────
    def _newcomer_value(self, store: dict, team: str, league: str, default: float) -> float:
        """Value for a team new to this league: low end of the league if promoted, high end if relegated."""
        old_tier, new_tier = LEAGUE_TIER.get(self.team_league.get(team)), LEAGUE_TIER.get(league)
        relegated = old_tier is not None and new_tier is not None and new_tier > old_tier
        values = [store[t] for t, lg in self.team_league.items() if lg == league and t in store]
        # Unknown newcomers are almost always promoted from a division not in the data
        return float(np.percentile(values, 75 if relegated else 25)) if len(values) >= 6 else default

    def _team_value(self, store: dict, team: str, league: str, default: float) -> float:
        if team in store and self.team_league.get(team) == league:
            return store[team]
        return self._newcomer_value(store, team, league, default)

    def rating(self, team: str, league: str) -> float:
        return self._team_value(self.elo, team, league, ELO_START)

    def expected_goals(self, home: str, away: str, league: str):
        mu = self.league_mu.get(league, POIS_START_MU)
        ha = self.league_ha.get(league, POIS_START_HA)
        att_h, def_h = self._team_value(self.attack, home, league, 0.0), self._team_value(self.defence, home, league, 0.0)
        att_a, def_a = self._team_value(self.attack, away, league, 0.0), self._team_value(self.defence, away, league, 0.0)
        return float(np.exp(mu + ha + att_h - def_a)), float(np.exp(mu + att_a - def_h))

    # Features ───────────────────────────────────────────────────────────────
    def base_parts(self, home: str, away: str, league: str, season: str):
        """Inputs for assemble_features(): form, venue goals and H2H (current season)."""
        hv, av = self.venue[(league, season, home, "H")], self.venue[(league, season, away, "A")]
        meetings = [
            {"home_team_result": _result_for(home, g), "total_goals": g["FTHG"] + g["FTAG"]}
            for g in reversed(self.h2h[frozenset((home, away))][-FORM_WINDOW:])
        ]
        return (
            form_features(self.form[(league, season, home)]),
            form_features(self.form[(league, season, away)]),
            goals_features(hv[0], hv[1], hv[2]),
            goals_features(av[0], av[1], av[2]),
            h2h_features(meetings),
        )

    def extra_features(self, home: str, away: str, league: str, date) -> Dict[str, float]:
        elo_diff = self.rating(home, league) + ELO_HFA - self.rating(away, league)
        out = {"elo_diff": elo_diff, "elo_home_expectancy": 1.0 / (1.0 + 10 ** (-elo_diff / 400))}
        xg_h, xg_a = self.expected_goals(home, away, league)
        out.update({"pois_xg_home": xg_h, "pois_xg_away": xg_a, **poisson_market_probs(xg_h, xg_a)})
        for side, team in (("home", home), ("away", away)):
            games = self.recent[team]
            out[f"{side}_gf_l10"] = _mean(g[0] for g in games)
            out[f"{side}_ga_l10"] = _mean(g[1] for g in games)
            out[f"{side}_sot_for_l10"] = _mean(g[2] for g in games)
            out[f"{side}_sot_against_l10"] = _mean(g[3] for g in games)
            last = self.last_date.get(team)
            out[f"{side}_rest_days"] = min((date - last).days, REST_CAP) if last is not None else NAN
        return out

    # Update ─────────────────────────────────────────────────────────────────
    def update(self, row) -> None:
        home, away = row["HomeTeam"], row["AwayTeam"]
        lg, season = row["League"], row["Season"]
        hg, ag = float(row["FTHG"]), float(row["FTAG"])
        hs, as_ = _num(row.get("HST")), _num(row.get("AST"))

        # Elo with a goal-difference multiplier (World Football Elo style)
        rh, ra = self.rating(home, lg), self.rating(away, lg)
        expected = 1.0 / (1.0 + 10 ** ((ra - rh - ELO_HFA) / 400))
        actual = 1.0 if hg > ag else 0.5 if hg == ag else 0.0
        gd = abs(hg - ag)
        mult = 1.0 if gd <= 1 else 1.5 if gd == 2 else (11 + gd) / 8
        delta = ELO_K * mult * (actual - expected)
        self.elo[home], self.elo[away] = rh + delta, ra - delta

        # Poisson strengths: one gradient step on the log-likelihood of the observed score
        xg_h, xg_a = self.expected_goals(home, away, lg)
        err_h, err_a = hg - xg_h, ag - xg_a
        att_h, def_h = self._team_value(self.attack, home, lg, 0.0), self._team_value(self.defence, home, lg, 0.0)
        att_a, def_a = self._team_value(self.attack, away, lg, 0.0), self._team_value(self.defence, away, lg, 0.0)
        self.attack[home], self.defence[away] = att_h + POIS_LR * err_h, def_a - POIS_LR * err_h
        self.attack[away], self.defence[home] = att_a + POIS_LR * err_a, def_h - POIS_LR * err_a
        self.league_mu[lg] = self.league_mu.get(lg, POIS_START_MU) + POIS_LEAGUE_LR * (err_h + err_a)
        self.league_ha[lg] = self.league_ha.get(lg, POIS_START_HA) + POIS_LEAGUE_LR * err_h

        self.form[(lg, season, home)] += _result_for(home, row)
        self.form[(lg, season, away)] += _result_for(away, row)
        hv, av = self.venue[(lg, season, home, "H")], self.venue[(lg, season, away, "A")]
        hv[0] += hg; hv[1] += ag; hv[2] += 1
        av[0] += ag; av[1] += hg; av[2] += 1
        self.h2h[frozenset((home, away))].append(
            {k: row[k] for k in ("HomeTeam", "AwayTeam", "FTR", "FTHG", "FTAG")}
        )
        self.recent[home].append((hg, ag, hs, as_))
        self.recent[away].append((ag, hg, as_, hs))
        for team in (home, away):
            self.team_league[team] = lg
            self.last_date[team] = row["Date"]
        self.current_season[lg] = season
        self.last_match_date = row["Date"]


def prepare_raw(df: pd.DataFrame) -> pd.DataFrame:
    """Parse dates, drop unfinished/broken rows, sort chronologically."""
    df = df.copy()
    df["Date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")
    df = df.dropna(subset=["Date", "HomeTeam", "AwayTeam", "FTHG", "FTAG", "FTR"])
    df = df[df["FTR"].isin(["H", "D", "A"])]
    df = df.sort_values("Date", kind="stable").reset_index(drop=True)
    for col, default in (("Season", "all"), ("League", "")):
        if col not in df.columns:
            df[col] = default
    df["Season"] = df["Season"].astype(str)
    df["League"] = df["League"].fillna("").astype(str)
    return df


def compute_rolling_features(df: pd.DataFrame, history: Optional[TeamHistory] = None) -> pd.DataFrame:
    """
    Build a feature DataFrame from raw match CSV data.
    Each row is one match; features use only matches played on EARLIER dates.

    Single chronological pass: team history is updated after each match day,
    so all matches on the same day see the same (strictly earlier) history.
    Pass `history` to get the final state back (used for live serving).
    """
    df = prepare_raw(df)
    hist = history if history is not None else TeamHistory()

    records = []
    print(f"  Processing {len(df)} matches...", end="", flush=True)

    for _, day in df.groupby("Date", sort=True):
        rows = day.to_dict("records")

        for row in rows:
            home, away = row["HomeTeam"], row["AwayTeam"]
            p_home, p_draw, p_away = _pick_odds(row, ["AvgH", "AvgD", "AvgA"], ["B365H", "B365D", "B365A"])
            p_over, p_under = _pick_odds(row, ["Avg>2.5", "Avg<2.5"], ["B365>2.5", "B365<2.5"])

            record = assemble_features(
                *hist.base_parts(home, away, row["League"], row["Season"]),
                p_home, p_draw, p_away, p_over, p_under,
            )
            record.update(hist.extra_features(home, away, row["League"], row["Date"]))
            record.update({k: _num(row.get(c, np.nan)) for k, c in ODDS_COLS.items()})
            record.update({
                "date":           row["Date"],
                "season":         row["Season"],
                "league":         row["League"],
                "home_team":      home,
                "away_team":      away,
                "home_goals":     row["FTHG"],
                "away_goals":     row["FTAG"],
                "target_outcome": _encode_result(row["FTR"]),
                "target_ou25":    int((row["FTHG"] + row["FTAG"]) > 2.5),
                "target_btts":    int(row["FTHG"] > 0 and row["FTAG"] > 0),
            })
            records.append(record)

        # Update state only after the whole day — avoids same-day leakage
        for row in rows:
            hist.update(row)

    print(" done.\n")
    return pd.DataFrame(records)
