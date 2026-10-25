"""
GEX Football Prediction — ML API Server

Exposes three endpoints:
  GET  /health       — liveness probe; reports whether models are loaded
  GET  /model-info   — returns training metadata (walk-forward evaluation, version, etc.)
  POST /predict      — takes a fixture + odds, returns calibrated ML probabilities
  POST /team-stats   — this season's form and goals for both teams, plus past meetings

Team form, goals, shots, Elo and H2H come from the server's own match history
(models/team_history.pkl, built by train.py), so the app only sends the fixture
and the current odds.

Run: python app.py   (or via start.bat on Windows)
"""
import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

sys.path.insert(0, os.path.dirname(__file__))
from features import assemble_features, remove_margin, FEATURE_COLS, LEAGUE_TIER
from teams import SPORT_KEY_TO_LEAGUE, resolve_team

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
STALE_DAYS = 21  # a team's latest known match older than this -> history is likely out of date

# ── Model registry ────────────────────────────────────────────────────────────

_models = {}
_metadata = {}
_history = None


def _load_models():
    global _models, _metadata, _history
    try:
        _models["outcome"] = joblib.load(os.path.join(MODELS_DIR, "outcome_model.pkl"))
        _models["ou25"]    = joblib.load(os.path.join(MODELS_DIR, "ou25_model.pkl"))
        _models["btts"]    = joblib.load(os.path.join(MODELS_DIR, "btts_model.pkl"))
        _history = joblib.load(os.path.join(MODELS_DIR, "team_history.pkl"))
        with open(os.path.join(MODELS_DIR, "model_metadata.json")) as f:
            _metadata = json.load(f)
        print(f"Models loaded successfully (data through {_metadata.get('data_through', 'unknown')}).")
    except FileNotFoundError:
        _models.clear()
        print(
            "\nWARNING: Models not found. Run 'python train.py' first.\n"
            "The /predict endpoint will return 503 until models are available.\n"
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    _load_models()
    yield


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="GEX Football Prediction API",
    version="3.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


# ── Request schema ────────────────────────────────────────────────────────────

class MatchInput(BaseModel):
    """An upcoming fixture as the app knows it (The Odds API names and sport key)."""
    sport_key: str
    home_team: str
    away_team: str
    commence_time: Optional[str] = None  # ISO 8601; defaults to now
    # Decimal odds (cross-bookmaker average); null when unavailable
    odds_home: Optional[float] = None
    odds_draw: Optional[float] = None
    odds_away: Optional[float] = None
    odds_ou25_over: Optional[float] = None
    odds_ou25_under: Optional[float] = None


class FixtureInput(BaseModel):
    """A fixture by The Odds API names and sport key."""
    sport_key: str
    home_team: str
    away_team: str


def _candidates(league: str) -> list:
    """Teams that may appear in this league: its own, plus promotion/relegation neighbours."""
    leagues = {league} | (set(LEAGUE_TIER) if league in LEAGUE_TIER else set())
    return [t for t, lg in _history.team_league.items() if lg in leagues]


def _kickoff(commence_time: Optional[str]) -> pd.Timestamp:
    if commence_time:
        try:
            return pd.Timestamp(commence_time).tz_convert(None).normalize()
        except (ValueError, TypeError):
            try:
                return pd.Timestamp(commence_time).normalize()
            except ValueError:
                pass
    return pd.Timestamp(datetime.now(timezone.utc).replace(tzinfo=None)).normalize()


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    ready = len(_models) == 3 and _history is not None
    return {
        "status": "ok" if ready else "models_not_loaded",
        "models_ready": ready,
        "version": _metadata.get("version", "unknown"),
        "data_through": _metadata.get("data_through"),
    }


@app.get("/model-info")
def model_info():
    if not _metadata:
        raise HTTPException(503, "Models not loaded. Run python train.py first.")
    return _metadata


@app.post("/predict")
def predict(match: MatchInput):
    if len(_models) < 3 or _history is None:
        raise HTTPException(
            503,
            "Models not loaded. Run 'python train.py' first, then restart the server.",
        )

    league = SPORT_KEY_TO_LEAGUE.get(match.sport_key)
    if league is None:
        raise HTTPException(422, "The ML model does not cover this league yet.")

    candidates = _candidates(league)
    home = resolve_team(match.home_team, candidates)
    away = resolve_team(match.away_team, candidates)
    missing = [n for n, r in ((match.home_team, home), (match.away_team, away)) if r is None]
    if missing or home == away:
        raise HTTPException(422, f"No match history found for: {', '.join(missing) or match.home_team}.")

    # Build feature vector from the team history + the live odds
    kickoff = _kickoff(match.commence_time)
    season = _history.current_season.get(league, "")
    p_home, p_draw, p_away = remove_margin(match.odds_home, match.odds_draw, match.odds_away)
    p_over, p_under = remove_margin(match.odds_ou25_over, match.odds_ou25_under)
    feats = assemble_features(*_history.base_parts(home, away, league, season),
                              p_home, p_draw, p_away, p_over, p_under)
    feats.update(_history.extra_features(home, away, league, kickoff))
    X = pd.DataFrame([feats])[FEATURE_COLS]

    last_seen = [_history.last_date.get(t) for t in (home, away)]
    stale = any(d is None or (kickoff - d).days > STALE_DAYS for d in last_seen)

    # ── 1X2 outcome ───────────────────────────────────────────────────────────
    out_probs = _models["outcome"].predict_proba(X)[0]
    # Classes: 0=Home, 1=Draw, 2=Away  (matches training encoding)
    p_home, p_draw, p_away = (
        float(out_probs[0]),
        float(out_probs[1]),
        float(out_probs[2]),
    )

    # ── Over/Under 2.5 ───────────────────────────────────────────────────────
    ou_probs = _models["ou25"].predict_proba(X)[0]
    p_under, p_over = float(ou_probs[0]), float(ou_probs[1])

    # ── BTTS ─────────────────────────────────────────────────────────────────
    btts_probs = _models["btts"].predict_proba(X)[0]
    p_btts_no, p_btts_yes = float(btts_probs[0]), float(btts_probs[1])

    # ── Confidence ───────────────────────────────────────────────────────────
    max_outcome_prob = max(p_home, p_draw, p_away)
    if max_outcome_prob >= 0.60:
        confidence = "high"
    elif max_outcome_prob >= 0.45:
        confidence = "medium"
    else:
        confidence = "low"

    predicted_winner = ["home", "draw", "away"][int(np.argmax(out_probs))]

    return {
        "outcome": {
            "home_win": round(p_home * 100, 1),
            "draw":     round(p_draw * 100, 1),
            "away_win": round(p_away * 100, 1),
        },
        "over_under_25": {
            "over":  round(p_over * 100, 1),
            "under": round(p_under * 100, 1),
        },
        "btts": {
            "yes": round(p_btts_yes * 100, 1),
            "no":  round(p_btts_no * 100, 1),
        },
        "confidence":       confidence,
        "predicted_winner": predicted_winner,
        "model_version":    _metadata.get("version", "unknown"),
        "training_samples": _metadata.get("training_samples", 0),
        "teams_matched":    {"home": home, "away": away},
        "data_through":     _metadata.get("data_through"),
        "stale_history":    stale,
    }


@app.post("/team-stats")
def team_stats(match: FixtureInput):
    """
    Real results from the server's match history, for the app to show and use
    instead of API-Football (whose free plan has no current-season data).
    Form strings run oldest -> newest; meetings are most recent first.
    """
    if _history is None:
        raise HTTPException(503, "Match history not loaded. Run 'python train.py' first.")

    league = SPORT_KEY_TO_LEAGUE.get(match.sport_key)
    if league is None:
        raise HTTPException(422, "Our match history does not cover this league.")

    candidates = _candidates(league)
    home = resolve_team(match.home_team, candidates)
    away = resolve_team(match.away_team, candidates)
    missing = [n for n, r in ((match.home_team, home), (match.away_team, away)) if r is None]
    if missing or home == away:
        raise HTTPException(422, f"No match history found for: {', '.join(missing) or match.home_team}.")

    season = _history.current_season.get(league, "")

    def season_record(team: str) -> dict:
        # .get, not [], so reading never adds empty entries to the defaultdicts
        form = _history.form.get((league, season, team), "")
        h = _history.venue.get((league, season, team, "H"), [0.0, 0.0, 0])
        a = _history.venue.get((league, season, team, "A"), [0.0, 0.0, 0])
        last = _history.last_date.get(team)
        return {
            "form": form,
            "games_played": len(form),
            "goals_scored": int(h[0] + a[0]),
            "goals_conceded": int(h[1] + a[1]),
            "last_match": last.strftime("%Y-%m-%d") if last is not None else None,
        }

    # Report meetings with the app's own team names so it can tell the sides apart
    app_name = {home: match.home_team, away: match.away_team}
    meetings = []
    for g in reversed(_history.h2h.get(frozenset((home, away)), [])[-10:]):
        date = g.get("Date")  # absent in histories built before dates were stored
        meetings.append({
            "date": date.strftime("%Y-%m-%d") if date is not None and not pd.isna(date) else None,
            "home_team": app_name[g["HomeTeam"]],
            "away_team": app_name[g["AwayTeam"]],
            "home_goals": int(g["FTHG"]),
            "away_goals": int(g["FTAG"]),
        })

    return {
        "teams_matched": {"home": home, "away": away},
        "season": season,
        "data_through": _metadata.get("data_through"),
        "home": season_record(home),
        "away": season_record(away),
        "h2h": meetings,
    }


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
