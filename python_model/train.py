"""
Train and save the three prediction models:
  1. 1X2 outcome  (Home Win / Draw / Away Win)
  2. Over/Under 2.5 goals
  3. BTTS (Both Teams To Score)

Each model is an XGBClassifier wrapped in CalibratedClassifierCV for
well-calibrated probabilities (see modeling.py). Models are fitted on every
finished match and saved as .pkl files, together with the team history the
ML server needs to compute features for upcoming fixtures.

Model quality is measured separately by evaluate.py (walk-forward by season,
benchmarked against the betting market); its summary is copied into
model_metadata.json when available.

Before overwriting the saved models it runs the release gate (release_gate.py):
the latest evaluate.py report must show the deployed model kind is at least
level with the market. Run evaluate.py first after any modelling change.

Run: python train.py            (uses the downloaded data)
     python train.py --refresh  (re-downloads the current season first)
     python train.py --force    (skip the release gate; never for deployment)
"""
import os
import sys
import json
import joblib
import pandas as pd

# Allow imports from python_model root
sys.path.insert(0, os.path.dirname(__file__))
from data.download_data import download_data
from features import compute_rolling_features, TeamHistory, FEATURE_COLS
from modeling import TARGETS, fit_model, DEFAULT_KIND
from release_gate import gate_failures

MODELS_DIR    = os.path.join(os.path.dirname(__file__), "models")
DATA_COMBINED = os.path.join(os.path.dirname(__file__), "data", "raw", "combined.csv")
REPORT_PATH   = os.path.join(MODELS_DIR, "evaluation_report.json")
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_VERSION = "3.0.0"


def _evaluation_summary() -> dict:
    """Headline walk-forward numbers for the deployed feature set, if evaluate.py has run."""
    if not os.path.exists(REPORT_PATH):
        return {}
    with open(REPORT_PATH) as f:
        report = json.load(f).get(f"{DEFAULT_KIND}_full")
    if not report:
        return {}
    summary = {"test_matches": report["test_matches"], "test_seasons": report["test_seasons"]}
    for market in ("outcome", "ou25"):
        summary[market] = {
            "log_loss_vs_closing_line": report[market]["probability_quality"]["vs_close"],
            "backtest_at_avg_price_edge_over_5pct": report[market]["backtest"]["at_avg_price"].get("edge>5%"),
        }
    summary["btts"] = report["btts"]["probability_quality"]["vs_base_rate"]
    return summary


def train(refresh: bool = False, force: bool = False):
    # ── 0. Release gate: refuse to replace the models unless they passed evaluation
    failures = gate_failures()
    if failures is None:
        print("No evaluation report. Run 'python evaluate.py' first (or --force to skip).")
        if not force:
            sys.exit(1)
    elif failures:
        for market, _, detail in failures:
            print(f"  FAIL  {market}: {detail}")
        print("Release gate failed: the saved models were NOT replaced (--force to override).")
        if not force:
            sys.exit(1)

    # ── 1. Load or download raw data ──────────────────────────────────────────
    if refresh or not os.path.exists(DATA_COMBINED):
        print("Downloading data from football-data.co.uk...")
        raw = download_data()
    else:
        print("Loading existing combined dataset...")
        raw = pd.read_csv(DATA_COMBINED, encoding="latin1", low_memory=False)
    print(f"Raw dataset: {len(raw)} matches")

    # ── 2. Feature engineering (also builds the team history for serving) ─────
    print("\nEngineering rolling features...")
    history = TeamHistory()
    feat = compute_rolling_features(raw, history=history).dropna(subset=["target_outcome"])
    print(f"Feature dataset: {len(feat)} matches "
          f"({feat['date'].min():%Y-%m-%d} to {feat['date'].max():%Y-%m-%d})")

    # ── 3. Fit on all matches and save ────────────────────────────────────────
    for name, (col, _, _) in TARGETS.items():
        print(f"  Fitting {name} model...")
        model = fit_model(name, feat[FEATURE_COLS], feat[col].astype(int))
        joblib.dump(model, os.path.join(MODELS_DIR, f"{name}_model.pkl"))
    joblib.dump(history, os.path.join(MODELS_DIR, "team_history.pkl"))

    metadata = {
        "version": MODEL_VERSION,
        "training_samples": int(len(feat)),
        "leagues": sorted(feat["league"].unique().tolist()),
        "data_through": f"{history.last_match_date:%Y-%m-%d}",
        "model_kind": DEFAULT_KIND,
        "feature_cols": FEATURE_COLS,
        "evaluation_method": (
            "Walk-forward by season (evaluate.py): each season is predicted by models trained only on "
            "earlier seasons, then compared with Pinnacle's closing odds and backtested at market prices."
        ),
        "evaluation": _evaluation_summary(),
    }
    with open(os.path.join(MODELS_DIR, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print("\n" + "=" * 50)
    print(f"  Training complete. Data through {metadata['data_through']}.")
    print(f"  Models saved to: {MODELS_DIR}")
    if not metadata["evaluation"]:
        print("  Run 'python evaluate.py' to measure model quality.")
    print("=" * 50)


if __name__ == "__main__":
    train(refresh="--refresh" in sys.argv, force="--force" in sys.argv)
