"""Endpoint tests against the committed models and match history."""
import pytest
from fastapi import HTTPException

import app as server


@pytest.fixture(scope="module", autouse=True)
def loaded_models():
    server._load_models()
    if server._history is None:
        pytest.skip("models/ not trained; run python train.py")


def fixture(home, away, sport_key="soccer_epl"):
    return server.FixtureInput(sport_key=sport_key, home_team=home, away_team=away)


def test_team_stats_returns_season_form_and_meetings_in_app_names():
    stats = server.team_stats(fixture("Arsenal", "Tottenham Hotspur"))
    assert stats["teams_matched"] == {"home": "Arsenal", "away": "Tottenham"}
    for side in ("home", "away"):
        record = stats[side]
        assert set(record["form"]) <= set("WDL")
        assert record["games_played"] == len(record["form"])
    assert stats["h2h"], "Arsenal and Tottenham have met since 2012"
    assert {m["home_team"] for m in stats["h2h"]} <= {"Arsenal", "Tottenham Hotspur"}


def test_team_stats_rejects_unknown_teams():
    with pytest.raises(HTTPException) as err:
        server.team_stats(fixture("Nowhere FC", "Arsenal"))
    assert err.value.status_code == 422


def test_team_stats_rejects_leagues_without_history():
    with pytest.raises(HTTPException) as err:
        server.team_stats(fixture("LA Galaxy", "Inter Miami", sport_key="soccer_usa_mls"))
    assert err.value.status_code == 422


def test_predict_returns_probabilities_that_sum_to_100():
    result = server.predict(server.MatchInput(
        sport_key="soccer_epl", home_team="Arsenal", away_team="Tottenham Hotspur",
        odds_home=1.6, odds_draw=4.2, odds_away=5.5, odds_ou25_over=1.8, odds_ou25_under=2.0,
    ))
    outcome = result["outcome"]
    assert abs(outcome["home_win"] + outcome["draw"] + outcome["away_win"] - 100) < 0.5
    assert abs(result["over_under_25"]["over"] + result["over_under_25"]["under"] - 100) < 0.5
