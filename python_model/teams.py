"""
Map the app's team names (The Odds API, e.g. "Manchester United") to the
football-data.co.uk names the history is keyed by (e.g. "Man United").

Matching is always restricted to teams that played in the same league, so a
loose match can never jump to a different country's club.
"""
import re
import unicodedata
from difflib import SequenceMatcher
from typing import Dict, Iterable, Optional

# The Odds API sport key -> League label used in the historical data
SPORT_KEY_TO_LEAGUE = {
    "soccer_epl":                   "EPL",
    "soccer_spain_la_liga":         "LaLiga",
    "soccer_germany_bundesliga":    "Bundesliga",
    "soccer_italy_serie_a":         "SerieA",
    "soccer_france_ligue_one":      "Ligue1",
    "soccer_efl_champ":             "Championship",
    "soccer_england_league1":       "League1",
    "soccer_england_league2":       "League2",
    "soccer_netherlands_eredivisie": "Eredivisie",
    "soccer_portugal_primeira_liga": "Portugal",
    "soccer_scotland_premiership":  "Scotland",
    "soccer_turkey_super_league":   "Turkey",
    "soccer_belgium_first_div":     "Belgium",
}

# Names token matching cannot resolve (normalised Odds API name -> football-data name)
ALIASES = {
    "atletico madrid": "Ath Madrid",
    "athletic bilbao": "Ath Bilbao",
    "inter milan": "Inter",
    "ac milan": "Milan",
    "paris saint germain": "Paris SG",
    "wolverhampton wanderers": "Wolves",
    "brighton and hove albion": "Brighton",
    "sporting lisbon": "Sp Lisbon",
    "braga": "Sp Braga",
    "borussia monchengladbach": "M'gladbach",
    "bayer leverkusen": "Leverkusen",
    "psg": "Paris SG",
    "queens park rangers": "QPR",
    "sheffield wednesday": "Sheffield Weds",
    "milton keynes dons": "Milton Keynes Dons",
    "stade rennais": "Rennes",
    "stade brestois 29": "Brest",
}

# Abbreviations used in football-data names, expanded before comparing
_EXPANSIONS = {
    "man": "manchester", "utd": "united", "ath": "athletic", "ein": "eintracht",
    "sp": "sporting", "st": "saint", "nottm": "nottingham", "mgladbach": "monchengladbach",
    "wolves": "wolverhampton", "weds": "wednesday", "qpr": "queens park rangers",
}
_NOISE = {"fc", "afc", "cf", "sc", "ac", "as", "ss", "us", "cd", "sd", "ud", "rc", "club", "de", "the",
          "and", "1", "05", "04", "1899", "1846", "1907", "calcio", "hotspur", "albion", "town", "city"}


def _normalise(name: str) -> str:
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    name = re.sub(r"['’.]", "", name.lower())
    return re.sub(r"[^a-z0-9]+", " ", name).strip()


def _tokens(name: str) -> set:
    toks = {_EXPANSIONS.get(t, t) for t in _normalise(name).split()}
    toks = set(" ".join(toks).split())  # expansions can add several words
    return (toks - _NOISE) or toks


def resolve_team(name: str, candidates: Iterable[str]) -> Optional[str]:
    """Best football-data name for `name` among `candidates` (one league), or None."""
    candidates = list(candidates)
    if not candidates:
        return None
    norm = _normalise(name)
    by_norm = {_normalise(c): c for c in candidates}
    if norm in by_norm:
        return by_norm[norm]
    alias = ALIASES.get(norm)
    if alias in candidates:
        return alias

    # Token overlap (Jaccard), e.g. "Newcastle United" vs "Newcastle"
    want = _tokens(name)
    scored = sorted(
        ((len(want & _tokens(c)) / len(want | _tokens(c)), c) for c in candidates),
        reverse=True,
    )
    if scored[0][0] >= 0.5 and (len(scored) == 1 or scored[0][0] > scored[1][0]):
        return scored[0][1]

    # Last resort: character similarity on the expanded names
    want_s = " ".join(sorted(want))
    ratio, best = max((SequenceMatcher(None, want_s, " ".join(sorted(_tokens(c)))).ratio(), c) for c in candidates)
    return best if ratio >= 0.8 else None


def league_teams(team_league: Dict[str, str], league: str) -> list:
    return [t for t, lg in team_league.items() if lg == league]
