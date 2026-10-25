from release_gate import check_report


def report(outcome_ci, ou25_ci=(-0.001, 0.001), btts_ci=(-0.007, -0.001)):
    def quality(ci):
        return {"difference": sum(ci) / 2, "difference_95ci": list(ci)}
    return {"residual_full": {
        "outcome": {"probability_quality": {"vs_avg": quality(outcome_ci)}},
        "ou25": {"probability_quality": {"vs_avg": quality(ou25_ci)}},
        "btts": {"probability_quality": {"vs_base_rate": quality(btts_ci)}},
    }}


def failed(checks):
    return [market for market, passed, _ in checks if not passed]


def test_passes_when_every_model_is_level_with_its_benchmark():
    assert failed(check_report(report(outcome_ci=(-0.0009, 0.0021)), kind="residual")) == []


def test_fails_a_model_that_is_significantly_worse_than_the_market():
    assert failed(check_report(report(outcome_ci=(0.016, 0.036)), kind="residual")) == ["outcome"]


def test_fails_when_the_deployed_model_kind_was_not_evaluated():
    assert failed(check_report(report(outcome_ci=(-0.001, 0.001)), kind="xgboost")) == ["report"]


def test_committed_report_passes():
    # The models in models/ must have passed the gate
    import json, os
    from release_gate import REPORT_PATH
    with open(REPORT_PATH) as f:
        assert failed(check_report(json.load(f))) == []
