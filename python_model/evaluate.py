"""
Walk-forward evaluation and betting backtest.

For every season after the first, models are trained on all EARLIER seasons and
tested on that season — the same situation the live app is in. Pooled across
folds, three questions are answered:

  1. Probability quality — log loss / Brier vs the market. Two benchmarks:
     the pre-match market average (what the model sees as input) and Pinnacle's
     closing line (the sharpest public estimate). The gap is reported with a
     paired-bootstrap 95% CI; if the CI includes 0 the difference is noise.

  2. Betting backtest — per match, bet 1 unit on the outcome with the largest
     model edge (p_model * price - 1) when that edge clears a threshold.
     Run at the market-average price (realistic) and the best price across
     bookmakers (optimistic: some of those prices are stale or limited).

  3. Closing line value (CLV) — the expected value of each bet measured against
     Pinnacle's margin-free closing probabilities. Consistently positive CLV is
     the most reliable sign of a genuine edge; ROI alone is very noisy.

Run: python evaluate.py
"""
import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.metrics import log_loss

sys.path.insert(0, os.path.dirname(__file__))
from features import (compute_rolling_features, FEATURE_COLS, BASE_FEATURE_COLS,
                      ODDS_FEATURE_COLS)
from modeling import TARGETS, fit_model, DEFAULT_KIND

DATA_COMBINED = os.path.join(os.path.dirname(__file__), "data", "raw", "combined.csv")
REPORT_PATH = os.path.join(os.path.dirname(__file__), "models", "evaluation_report.json")

EDGE_THRESHOLDS = [0.0, 0.02, 0.05, 0.10]
N_TEST_SEASONS = 4  # most recent seasons used as walk-forward test folds

# Configurations (feature set, model kind) that can be compared side by side.
# "xgb_no_odds" never sees the market, so any disagreement with the odds is
# independent information (the value-bet setup). The deployed configuration is
# DEPLOYED_CONFIG; train.py copies its results into model_metadata.json.
CONFIGS = {
    "xgb_base":      (BASE_FEATURE_COLS, "xgb"),
    "xgb_full":      (FEATURE_COLS, "xgb"),
    "xgb_no_odds":   ([c for c in FEATURE_COLS if c not in ODDS_FEATURE_COLS], "xgb"),
    "residual_full": (FEATURE_COLS, "residual"),
}
DEPLOYED_CONFIG = f"{DEFAULT_KIND}_full"
N_BOOTSTRAP = 1000
RNG = np.random.default_rng(42)

# market -> (outcome keys, target column, how a row's target maps to an outcome index)
MARKETS = {
    "outcome": (["h", "d", "a"], "target_outcome"),
    "ou25":    (["over", "under"], "target_ou25"),
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _no_vig(odds: np.ndarray) -> np.ndarray:
    """Rows of decimal odds -> margin-free probabilities (NaN rows stay NaN)."""
    inv = 1.0 / np.where(odds > 1.0, odds, np.nan)
    return inv / inv.sum(axis=1, keepdims=True)


def _per_match_logloss(probs: np.ndarray, y: np.ndarray) -> np.ndarray:
    return -np.log(np.clip(probs[np.arange(len(y)), y], 1e-15, 1.0))


def _bootstrap_ci(values: np.ndarray) -> list:
    idx = RNG.integers(0, len(values), size=(N_BOOTSTRAP, len(values)))
    means = values[idx].mean(axis=1)
    return [round(float(np.percentile(means, 2.5)), 4), round(float(np.percentile(means, 97.5)), 4)]


def _outcome_index(df: pd.DataFrame, market: str) -> np.ndarray:
    """Index into the market's outcome list: 1X2 -> 0/1/2, O/U -> 0=over, 1=under."""
    y = df[MARKETS[market][1]].astype(int).to_numpy()
    return y if market == "outcome" else 1 - y


# ── 1. Probability quality ────────────────────────────────────────────────────

def compare_probabilities(p_model, df, market) -> dict:
    keys, _ = MARKETS[market]
    y = _outcome_index(df, market)
    result = {}
    for bench in ("avg", "close"):
        p_bench = _no_vig(df[[f"{bench}_{k}" for k in keys]].to_numpy(dtype=float))
        ok = ~np.isnan(p_bench).any(axis=1)
        diff = _per_match_logloss(p_model[ok], y[ok]) - _per_match_logloss(p_bench[ok], y[ok])
        result[f"vs_{bench}"] = {
            "matches": int(ok.sum()),
            "model_log_loss": round(float(_per_match_logloss(p_model[ok], y[ok]).mean()), 4),
            "market_log_loss": round(float(_per_match_logloss(p_bench[ok], y[ok]).mean()), 4),
            # Negative = model better than the market
            "difference": round(float(diff.mean()), 4),
            "difference_95ci": _bootstrap_ci(diff),
        }
    return result


# ── 2 + 3. Betting backtest with CLV ──────────────────────────────────────────

def backtest(p_model, df, market) -> dict:
    keys, _ = MARKETS[market]
    y = _outcome_index(df, market)
    p_close = _no_vig(df[[f"close_{k}" for k in keys]].to_numpy(dtype=float))
    result = {}
    for price_src in ("avg", "max"):
        prices = df[[f"{price_src}_{k}" for k in keys]].to_numpy(dtype=float)
        edges = p_model * prices - 1.0
        rows = np.arange(len(df))
        pick = np.nanargmax(np.where(np.isnan(edges), -np.inf, edges), axis=1)
        best_edge = edges[rows, pick]
        price = prices[rows, pick]
        won = pick == y
        profit = np.where(won, price - 1.0, -1.0)
        clv = price * p_close[rows, pick] - 1.0

        by_threshold = {}
        for t in EDGE_THRESHOLDS:
            bet = (best_edge > t) & ~np.isnan(price)
            n = int(bet.sum())
            if n == 0:
                by_threshold[f"edge>{t:.0%}"] = {"bets": 0}
                continue
            pr = profit[bet]
            cum = np.cumsum(pr)
            clv_ok = bet & ~np.isnan(clv)
            by_threshold[f"edge>{t:.0%}"] = {
                "bets": n,
                "bet_rate": round(n / len(df), 3),
                "avg_odds": round(float(price[bet].mean()), 2),
                "roi": round(float(pr.mean()), 4),
                "roi_95ci": _bootstrap_ci(pr),
                "max_drawdown_units": round(float((np.maximum.accumulate(np.maximum(cum, 0)) - cum).max()), 1),
                "avg_clv": round(float(clv[clv_ok].mean()), 4) if clv_ok.any() else None,
                "clv_positive_rate": round(float((clv[clv_ok] > 0).mean()), 3) if clv_ok.any() else None,
            }
        result[f"at_{price_src}_price"] = by_threshold
    return result


# ── Walk-forward driver ───────────────────────────────────────────────────────

def walk_forward(feat: pd.DataFrame, feature_cols: list, kind: str, n_test_seasons: int) -> pd.DataFrame:
    """Returns the test rows of every fold with model probabilities attached."""
    seasons = feat.groupby("season")["date"].min().sort_values().index.tolist()
    if len(seasons) < 2:
        raise RuntimeError("Walk-forward evaluation needs at least two seasons of data.")

    folds = []
    for test_season in seasons[1:][-n_test_seasons:]:
        train_df = feat[feat["date"] < feat.loc[feat["season"] == test_season, "date"].min()]
        test_df = feat[feat["season"] == test_season].copy()
        print(f"  Fold: train {len(train_df)} matches -> test season {test_season} ({len(test_df)} matches)")
        for name, (col, _, _) in TARGETS.items():
            model = fit_model(name, train_df[feature_cols], train_df[col].astype(int), kind)
            p = model.predict_proba(test_df[feature_cols])
            for i in range(p.shape[1]):
                test_df[f"p_{name}_{i}"] = p[:, i]
        folds.append(test_df)
    return pd.concat(folds, ignore_index=True)


def _market_probs(test: pd.DataFrame, market: str) -> np.ndarray:
    p = test[[c for c in test.columns if c.startswith(f"p_{market}_")]].to_numpy()
    # O/U model columns are [P(under), P(over)]; reorder to [over, under]
    return p if market == "outcome" else p[:, ::-1]


def by_league(test: pd.DataFrame) -> dict:
    """Per league: model log loss minus Pinnacle closing log loss (negative = model better)."""
    out = {}
    for league, g in test.groupby("league"):
        row = {"matches": len(g)}
        for market in MARKETS:
            r = compare_probabilities(_market_probs(g, market), g, market)["vs_close"]
            row[market] = {"difference": r["difference"], "difference_95ci": r["difference_95ci"]} if r["matches"] else None
        out[league] = row
    return out


def report_for(test: pd.DataFrame) -> dict:
    report = {"test_matches": len(test), "test_seasons": sorted(test["season"].unique().tolist())}
    for market in MARKETS:
        p = _market_probs(test, market)
        # Control: the same strategy using the market's own average probabilities. Any
        # profit/CLV it shows comes from line shopping alone, not from the model.
        p_market = _no_vig(test[[f"avg_{k}" for k in MARKETS[market][0]]].to_numpy(dtype=float))
        report[market] = {
            "probability_quality": compare_probabilities(p, test, market),
            "backtest": backtest(p, test, market),
            "backtest_market_control": backtest(p_market, test, market),
        }

    # BTTS: no historical BTTS odds, so only a base-rate comparison is possible
    y = test["target_btts"].astype(int).to_numpy()
    p_btts = test[["p_btts_0", "p_btts_1"]].to_numpy()
    base = np.tile([1 - y.mean(), y.mean()], (len(y), 1))  # optimistic: uses test-period rate
    diff = _per_match_logloss(p_btts, y) - _per_match_logloss(base, y)
    report["btts"] = {"probability_quality": {"vs_base_rate": {
        "model_log_loss": round(float(_per_match_logloss(p_btts, y).mean()), 4),
        "base_rate_log_loss": round(float(_per_match_logloss(base, y).mean()), 4),
        "difference": round(float(diff.mean()), 4),
        "difference_95ci": _bootstrap_ci(diff),
    }}}
    report["by_league_vs_close"] = by_league(test)
    return report


def evaluate(configs=None, n_test_seasons: int = N_TEST_SEASONS):
    configs = configs or [DEPLOYED_CONFIG, "xgb_full"]
    raw = pd.read_csv(DATA_COMBINED, encoding="latin1", low_memory=False)
    print(f"Raw dataset: {len(raw)} matches\n\nEngineering rolling features...")
    feat = compute_rolling_features(raw).dropna(subset=["target_outcome"])

    reports = {}
    for name in configs:
        cols, kind = CONFIGS[name]
        print(f"\nWalk-forward training - '{name}' ({kind} model, {len(cols)} features):")
        reports[name] = report_for(walk_forward(feat, cols, kind, n_test_seasons))
        print_report(name, reports[name])

    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w") as f:
        json.dump(reports, f, indent=2)
    print(f"\nFull report saved to: {REPORT_PATH}")
    return reports


def print_report(name: str, report: dict):
    print("\n" + "=" * 78)
    print(f"  [{name}] WALK-FORWARD RESULTS - {report['test_matches']} test matches, seasons {report['test_seasons']}")
    print("=" * 78)
    for market, label in [("outcome", "1X2"), ("ou25", "Over/Under 2.5")]:
        print(f"\n{label} - log loss (lower is better; diff < 0 means model beats market)")
        for bench, r in report[market]["probability_quality"].items():
            print(f"  {bench:<9} model {r['model_log_loss']:.4f}  market {r['market_log_loss']:.4f}  "
                  f"diff {r['difference']:+.4f}  95% CI {r['difference_95ci']}  (n={r['matches']})")
        for src, rows in report[market]["backtest"].items():
            print(f"  Backtest {src}:")
            for t, r in rows.items():
                if r["bets"] == 0:
                    print(f"    {t:<9} no bets")
                    continue
                clv = f"{r['avg_clv']:+.2%}" if r["avg_clv"] is not None else "n/a"
                print(f"    {t:<9} bets {r['bets']:>6}  ROI {r['roi']:+.2%}  95% CI "
                      f"[{r['roi_95ci'][0]:+.1%}, {r['roi_95ci'][1]:+.1%}]  CLV {clv}  "
                      f"drawdown {r['max_drawdown_units']}u")
        print("  Control (market probabilities, best price) - CLV here is line shopping, not skill:")
        for t, r in report[market]["backtest_market_control"]["at_max_price"].items():
            if r["bets"]:
                print(f"    {t:<9} bets {r['bets']:>6}  ROI {r['roi']:+.2%}  CLV {r['avg_clv']:+.2%}")
    r = report["btts"]["probability_quality"]["vs_base_rate"]
    print(f"\nBTTS - model {r['model_log_loss']:.4f}  base rate {r['base_rate_log_loss']:.4f}  "
          f"diff {r['difference']:+.4f}  95% CI {r['difference_95ci']}")
    print("\nBy league, 1X2 log loss vs Pinnacle close (diff < 0 = model better):")
    for league, r in sorted(report["by_league_vs_close"].items(), key=lambda kv: (kv[1]["outcome"] or {}).get("difference", 9)):
        o = r["outcome"]
        if o:
            print(f"  {league:<13} n={r['matches']:>5}  diff {o['difference']:+.4f}  95% CI {o['difference_95ci']}")


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--configs", default=f"{DEPLOYED_CONFIG},xgb_full",
                    help=f"comma-separated configurations to compare: {', '.join(CONFIGS)}")
    ap.add_argument("--test-seasons", type=int, default=N_TEST_SEASONS)
    args = ap.parse_args()
    evaluate(args.configs.split(","), args.test_seasons)
