import math

from features import form_features, remove_margin
from teams import resolve_team


def test_remove_margin_gives_probabilities_that_sum_to_one():
    probs = remove_margin(2.0, 3.5, 4.0)
    assert math.isclose(sum(probs), 1.0)
    assert probs[0] > probs[1] > probs[2]


def test_remove_margin_is_nan_when_any_price_is_missing():
    assert all(math.isnan(p) for p in remove_margin(2.0, None, 4.0))


def test_form_features_use_only_the_latest_games():
    # Oldest -> newest: the five losses before the last five games are ignored
    form = form_features("LLLLLWWWWW")
    assert form["form_pts"] == 1.0
    assert form["win_rate"] == 1.0


def test_form_features_are_nan_without_games():
    assert math.isnan(form_features("")["form_pts"])


def test_resolve_team_maps_odds_api_names_to_football_data_names():
    epl = ["Arsenal", "Tottenham", "Wolves", "Man United", "Man City", "Brighton"]
    assert resolve_team("Wolverhampton Wanderers", epl) == "Wolves"
    assert resolve_team("Manchester United", epl) == "Man United"
    assert resolve_team("Tottenham Hotspur", epl) == "Tottenham"
    assert resolve_team("Brighton and Hove Albion", epl) == "Brighton"


def test_resolve_team_does_not_guess_unknown_teams():
    assert resolve_team("Nowhere FC", ["Arsenal", "Tottenham"]) is None
