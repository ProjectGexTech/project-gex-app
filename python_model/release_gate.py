"""
Release gate: models may only be deployed if the walk-forward evaluation
(evaluate.py) shows they are at least level with the benchmark.

  1X2, Over/Under 2.5  vs the market-average odds (margin removed)
  BTTS                 vs the training base rate (no BTTS odds in the data)

"At least level" means the paired-bootstrap 95% CI of (model log loss minus
benchmark log loss) reaches zero or below, i.e. the model is not significantly
worse. The Pinnacle closing line is reported but not gated on: no public model
is expected to beat it.

Run: python release_gate.py   (exit code 1 if the gate fails)
train.py runs the same check before overwriting the saved models.
"""
import json
import os
import sys
from typing import List, Optional, Tuple

sys.path.insert(0, os.path.dirname(__file__))
from modeling import DEFAULT_KIND

REPORT_PATH = os.path.join(os.path.dirname(__file__), "models", "evaluation_report.json")

# market -> (benchmark key in probability_quality, benchmark label)
GATED = {
    "outcome": ("vs_avg", "market average"),
    "ou25": ("vs_avg", "market average"),
    "btts": ("vs_base_rate", "base rate"),
}

Check = Tuple[str, bool, str]


def check_report(report: dict, kind: str = DEFAULT_KIND) -> List[Check]:
    """One (market, passed, explanation) per gated market for the deployed model kind."""
    section = report.get(f"{kind}_full")
    if section is None:
        return [("report", False, f"no '{kind}_full' section; run python evaluate.py")]

    checks = []
    for market, (key, label) in GATED.items():
        quality = section.get(market, {}).get("probability_quality", {}).get(key)
        if not quality:
            checks.append((market, False, f"no {key} result in the report"))
            continue
        low, high = quality["difference_95ci"]
        passed = low <= 0
        verdict = "level or better" if passed else "significantly worse"
        checks.append((
            market, passed,
            f"log loss vs {label}: {quality['difference']:+.4f} (95% CI {low:+.4f} to {high:+.4f}), {verdict}",
        ))
    return checks


def gate_failures(report_path: str = REPORT_PATH) -> Optional[List[Check]]:
    """Failed checks, [] if the gate passes, or None if there is no report at all."""
    if not os.path.exists(report_path):
        return None
    with open(report_path) as f:
        report = json.load(f)
    return [c for c in check_report(report) if not c[1]]


def main() -> int:
    if not os.path.exists(REPORT_PATH):
        print(f"No evaluation report at {REPORT_PATH}. Run python evaluate.py first.")
        return 1
    with open(REPORT_PATH) as f:
        checks = check_report(json.load(f))
    for market, passed, detail in checks:
        print(f"  {'PASS' if passed else 'FAIL'}  {market:8s} {detail}")
    ok = all(passed for _, passed, _ in checks)
    print("Release gate passed." if ok else "Release gate FAILED: do not deploy these models.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
