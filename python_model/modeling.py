"""
Model definitions shared by training (train.py) and evaluation (evaluate.py),
so the backtest always measures exactly the models that get deployed.

Two model kinds:
  * "xgb"      — XGBoost on all features, isotonic-calibrated. Has to re-learn
                 everything the odds already say, which costs accuracy.
  * "residual" — starts from a base probability (the market's margin-free odds;
                 for BTTS, which has no odds, the Poisson goals model) and boosts
                 only a small, heavily regularised correction on top. With no
                 real signal it stays at the base instead of adding noise.
"""
import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from xgboost import XGBClassifier

# name -> (target column, XGBoost objective, number of classes)
TARGETS = {
    "outcome": ("target_outcome", "multi:softprob", 3),
    "ou25":    ("target_ou25",    "binary:logistic", None),
    "btts":    ("target_btts",    "binary:logistic", None),
}

# Base probability columns per target, in class order (O/U: 0 = under, 1 = over)
BASE_COLS = {
    "outcome": ["odds_home_prob", "odds_draw_prob", "odds_away_prob"],
    "ou25":    ["odds_ou25_under_prob", "odds_ou25_over_prob"],
    "btts":    [None, "pois_p_btts"],  # class 0 = 1 - P(BTTS)
}

DEFAULT_KIND = "residual"


def _make_xgb_base(objective: str, num_class: int = None, **overrides) -> XGBClassifier:
    kwargs = dict(
        objective=objective,
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        gamma=0.1,
        random_state=42,
    )
    kwargs.update(overrides)
    if num_class:
        kwargs["num_class"] = num_class
    return XGBClassifier(**kwargs)


class ResidualModel:
    """XGBoost boosted from a base probability (passed as base_margin)."""

    def __init__(self, name: str):
        self.name = name
        _, self.objective, self.num_class = TARGETS[name]

    def _base_probs(self, X) -> np.ndarray:
        cols = BASE_COLS[self.name]
        if cols[0] is None:  # binary target given only P(class 1)
            p1 = X[cols[1]].to_numpy(dtype=float)
            p = np.column_stack([1 - p1, p1])
        else:
            p = X[cols].to_numpy(dtype=float, copy=True)
        missing = np.isnan(p).any(axis=1)
        p[missing] = self.prior_  # no odds -> start from the training base rate
        return np.clip(p, 1e-4, 1 - 1e-4)

    def _margin(self, X) -> np.ndarray:
        p = self._base_probs(X)
        return np.log(p) if self.num_class else np.log(p[:, 1] / p[:, 0])

    def fit(self, X, y):
        counts = np.bincount(np.asarray(y), minlength=self.num_class or 2)
        self.prior_ = counts / counts.sum()
        self.model_ = _make_xgb_base(
            self.objective, self.num_class,
            n_estimators=150, max_depth=3, learning_rate=0.02,
            min_child_weight=50, reg_lambda=20.0, gamma=0.0,
        )
        self.model_.fit(X, y, base_margin=self._margin(X))
        return self

    def predict_proba(self, X) -> np.ndarray:
        return self.model_.predict_proba(X, base_margin=self._margin(X))


def fit_model(name: str, X, y, kind: str = DEFAULT_KIND):
    _, objective, num_class = TARGETS[name]
    if kind == "residual":
        return ResidualModel(name).fit(X, y)
    # XGBoost wrapped in isotonic calibration for well-calibrated probabilities
    model = CalibratedClassifierCV(_make_xgb_base(objective, num_class), method="isotonic", cv=3)
    model.fit(X, y)
    return model
