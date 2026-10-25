"""
Download historical football data from football-data.co.uk.
Free CSV files, no API key needed.

If football-data.co.uk is unreachable (some networks block it), each file is
fetched from the Internet Archive's copy of the same URL instead.
"""
import os
import time
import requests
from datetime import datetime
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), "raw")
os.makedirs(DATA_DIR, exist_ok=True)

# League codes used by football-data.co.uk. Only leagues the app offers
# (lib/leagueConfig.ts) — lower leagues matter most: their markets are softer.
LEAGUES = {
    "EPL":          "E0",
    "LaLiga":       "SP1",
    "Bundesliga":   "D1",
    "SerieA":       "I1",
    "Ligue1":       "F1",
    "Championship": "E1",
    "League1":      "E2",
    "League2":      "E3",
    "Eredivisie":   "N1",
    "Portugal":     "P1",
    "Scotland":     "SC0",
    "Turkey":       "T1",
    "Belgium":      "B1",
}

# 2012/13 onwards: Pinnacle closing odds (needed for the backtest) start here
FIRST_SEASON = 2012
LAST_SEASON = 2026  # season starting in this year; it is refreshed on every download
SEASONS = [f"{y % 100:02d}{(y + 1) % 100:02d}" for y in range(FIRST_SEASON, LAST_SEASON + 1)]

BASE_URL = "https://www.football-data.co.uk/mmz4281/{season}/{league}.csv"
# Timestamp = now, so the archive serves its most recent snapshot (matters for the current season)
ARCHIVE_URL = "https://web.archive.org/web/" + datetime.now().strftime("%Y%m%d") + "id_/{url}"

# Pre-2019/20 files name the market average / maximum columns differently
LEGACY_COLUMNS = {
    "BbAvH": "AvgH", "BbAvD": "AvgD", "BbAvA": "AvgA",
    "BbMxH": "MaxH", "BbMxD": "MaxD", "BbMxA": "MaxA",
    "BbAv>2.5": "Avg>2.5", "BbAv<2.5": "Avg<2.5",
    "BbMx>2.5": "Max>2.5", "BbMx<2.5": "Max<2.5",
}


ARCHIVE_PACE = 5                 # seconds between archive requests
ARCHIVE_BACKOFF = [60, 180, 600]  # waits after successive failures

_direct_reachable = True


def _fetch(url: str) -> bytes:
    """Direct download, falling back to the Internet Archive copy.
    After one connection failure the direct site is skipped for the rest of the run."""
    global _direct_reachable
    if _direct_reachable:
        try:
            resp = requests.get(url, timeout=20)
            resp.raise_for_status()
            return resp.content
        except (requests.ConnectionError, requests.Timeout):
            _direct_reachable = False
        except requests.HTTPError:
            pass

    # The archive rate-limits (~15 requests/min) and briefly refuses connections when
    # exceeded, so pace requests and back off on connection errors.
    for wait in ARCHIVE_BACKOFF:
        time.sleep(ARCHIVE_PACE)
        try:
            resp = requests.get(ARCHIVE_URL.format(url=url), timeout=60)
            if resp.status_code != 429:
                resp.raise_for_status()
                return resp.content
        except (requests.ConnectionError, requests.Timeout):
            pass
        print(f"(archive busy, retrying in {wait}s)", end=" ", flush=True)
        time.sleep(wait)
    raise ConnectionError("Internet Archive unreachable")


def _is_match_csv(filepath: str) -> bool:
    """False for missing files and for error pages saved by mistake."""
    if not os.path.exists(filepath):
        return False
    with open(filepath, "rb") as f:
        return b"HomeTeam" in f.read(2000)


def _normalise(df: pd.DataFrame) -> pd.DataFrame:
    df = df.rename(columns=lambda c: c.replace("﻿", "").replace("ï»¿", "").strip())
    df = df.loc[:, ~df.columns.duplicated()]
    renames = {old: new for old, new in LEGACY_COLUMNS.items() if old in df.columns and new not in df.columns}
    return df.rename(columns=renames).dropna(subset=["HomeTeam", "AwayTeam"])


def download_data(fetch: bool = True) -> pd.DataFrame:
    """Download missing seasons (and refresh the current one), then rebuild combined.csv.
    With fetch=False, only combines the files already on disk."""
    all_dfs = []
    current = SEASONS[-1]

    for league_name, league_code in LEAGUES.items():
        for season in SEASONS:
            url = BASE_URL.format(season=season, league=league_code)
            filepath = os.path.join(DATA_DIR, f"{league_name}_{season}.csv")

            if fetch and (not _is_match_csv(filepath) or season == current):
                print(f"  Downloading {league_name} {season}...", end=" ", flush=True)
                try:
                    content = _fetch(url)
                    if b"HomeTeam" not in content[:2000]:
                        raise ValueError("not a match CSV")
                    with open(filepath, "wb") as f:
                        f.write(content)
                    print("done")
                except Exception as e:
                    print(f"FAILED ({e})")

            if not _is_match_csv(filepath):
                continue
            try:
                df = _normalise(pd.read_csv(filepath, encoding="latin1", low_memory=False, on_bad_lines="skip"))
                all_dfs.append(df.assign(League=league_name, Season=season))
            except Exception as e:
                print(f"  Could not parse {filepath}: {e}")

    if not all_dfs:
        raise RuntimeError("No data downloaded. Check your internet connection.")

    combined = pd.concat(all_dfs, ignore_index=True)
    out_path = os.path.join(DATA_DIR, "combined.csv")
    combined.to_csv(out_path, index=False)
    print(f"\nCombined dataset: {len(combined)} matches -> {out_path}")
    return combined


if __name__ == "__main__":
    import sys
    download_data(fetch="--offline" not in sys.argv)
