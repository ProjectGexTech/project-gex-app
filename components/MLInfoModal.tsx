'use client';

import { X, Database, Cpu, BarChart2, FlaskConical, GitBranch, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface MLInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEATURE_TABLE = [
  { name: 'home_form_pts',            group: 'Home Team',  description: 'Points earned as a fraction of maximum possible (W=3, D=1, L=0) over the last 5 games this season' },
  { name: 'home_goals_scored_avg',    group: 'Home Team',  description: 'Average goals scored per HOME game this season' },
  { name: 'home_goals_conceded_avg',  group: 'Home Team',  description: 'Average goals conceded per HOME game this season' },
  { name: 'home_win_rate',            group: 'Home Team',  description: 'Fraction of the last 5 games this season won' },
  { name: 'home_draw_rate',           group: 'Home Team',  description: 'Fraction of the last 5 games this season drawn' },
  { name: 'away_form_pts',            group: 'Away Team',  description: 'Points fraction over the last 5 games this season (same calculation as home)' },
  { name: 'away_goals_scored_avg',    group: 'Away Team',  description: 'Average goals scored per AWAY game this season' },
  { name: 'away_goals_conceded_avg',  group: 'Away Team',  description: 'Average goals conceded per AWAY game this season' },
  { name: 'away_win_rate',            group: 'Away Team',  description: 'Fraction of the last 5 games this season won' },
  { name: 'away_draw_rate',           group: 'Away Team',  description: 'Fraction of the last 5 games this season drawn' },
  { name: 'h2h_home_win_rate',        group: 'H2H',        description: 'How often the home team has won in the last 5 head-to-head meetings' },
  { name: 'h2h_draw_rate',            group: 'H2H',        description: 'Draw rate in the last 5 head-to-head meetings' },
  { name: 'h2h_goals_avg',            group: 'H2H',        description: 'Average total goals per game in the last 5 head-to-head meetings' },
  { name: 'odds_home_prob',           group: 'Odds',       description: 'Market-implied probability of a home win (bookmaker margin removed)' },
  { name: 'odds_draw_prob',           group: 'Odds',       description: 'Market-implied probability of a draw (bookmaker margin removed)' },
  { name: 'odds_away_prob',           group: 'Odds',       description: 'Market-implied probability of an away win (bookmaker margin removed)' },
  { name: 'odds_ou25_over_prob',      group: 'Odds',       description: 'Market-implied probability that total goals exceed 2.5 (bookmaker margin removed)' },
  { name: 'odds_ou25_under_prob',     group: 'Odds',       description: 'Market-implied probability that total goals are 2.5 or under (bookmaker margin removed)' },
  { name: 'elo_diff',                 group: 'Strength',   description: 'Elo rating difference incl. home advantage. Ratings carry across seasons and divisions (promoted teams start near the bottom of their new league)' },
  { name: 'elo_home_expectancy',      group: 'Strength',   description: 'Expected home score (win = 1, draw = 0.5) implied by the Elo difference' },
  { name: 'pois_xg_home / away',      group: 'Strength',   description: 'Expected goals for each side from a Poisson attack/defence model, updated after every match' },
  { name: 'pois_p_home / draw / away', group: 'Strength',  description: '1X2 probabilities implied by the Poisson goals model' },
  { name: 'pois_p_over25 / btts',     group: 'Strength',   description: 'Over 2.5 and both-teams-to-score probabilities implied by the Poisson goals model' },
  { name: '*_gf_l10 / *_ga_l10',      group: 'Recent',     description: 'Goals scored / conceded per game over each team’s last 10 matches (any venue or season)' },
  { name: '*_sot_for / against_l10',  group: 'Recent',     description: 'Shots on target for / against per game over the last 10 matches — a steadier signal than goals' },
  { name: '*_rest_days',              group: 'Recent',     description: 'Days since each team’s previous match (capped at 21)' },
];

const GROUP_COLORS: Record<string, string> = {
  'Home Team': 'bg-blue-100 text-blue-700',
  'Away Team': 'bg-red-100 text-red-700',
  'H2H':       'bg-amber-100 text-amber-700',
  'Odds':      'bg-green-100 text-green-700',
  'Strength':  'bg-violet-100 text-violet-700',
  'Recent':    'bg-slate-200 text-slate-700',
};

export default function MLInfoModal({ isOpen, onClose }: MLInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ── Sticky header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-violet-600 to-purple-700 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">ML Prediction Engine — Full Technical Reference</h2>
              <p className="text-violet-200 text-xs">XGBoost · CalibratedClassifierCV · football-data.co.uk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8">

          {/* ── 1. What This Is ─────────────────────────────────────────────── */}
          <section>
            <SectionHeader icon={<Info className="w-4 h-4" />} color="violet" title="What This Is" />
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              GEX runs <strong>two independent prediction systems side by side</strong>. The blue panel is a
              rule-based JavaScript engine built from weighted factors (odds, form, H2H, home advantage,
              goal trends). The purple panel is a <strong>trained machine learning model</strong> — it learned
              statistical patterns directly from thousands of real historical match outcomes and has never seen
              the match it is predicting.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed mt-2">
              The ML model produces <strong>calibrated probabilities</strong>, meaning if it outputs "60% home win",
              approximately 60% of matches with that score actually ended in a home win across the test set.
              The rule-based engine does not have this guarantee.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-bold text-blue-800 mb-1">Rule-Based Engine (Blue)</p>
                <p className="text-xs text-blue-700">Weighted formula using 6 explicit factors. Fast, interpretable, no training data needed. Probabilities can be over- or under-confident.</p>
              </div>
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                <p className="text-xs font-bold text-violet-800 mb-1">ML Model (Purple)</p>
                <p className="text-xs text-violet-700">Trained on tens of thousands of real matches. Starts from the market&apos;s odds and learns only the corrections the historical data supports.</p>
              </div>
            </div>
          </section>

          {/* ── 2. Dataset ──────────────────────────────────────────────────── */}
          <section>
            <SectionHeader icon={<Database className="w-4 h-4" />} color="blue" title="The Training Dataset" />
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              Training data comes from <strong>football-data.co.uk</strong> — a free, widely-used source of
              historical football match data with no API key required. The dataset used covers:
            </p>

            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { label: 'Leagues',  value: 'Up to 13', sub: 'Top 5 · EFL Championship, League One & Two · Netherlands · Portugal · Scotland · Turkey · Belgium' },
                { label: 'Seasons',  value: '2012/13+', sub: 'Through the current season, refreshed on retraining' },
                { label: 'Matches',  value: '20,000+',  sub: 'Exact count: GET /model-info' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">{s.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.sub}</div>
                </div>
              ))}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              Each CSV row is one match. The columns used during training are:
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left p-2 border border-slate-200 font-semibold">Column</th>
                    <th className="text-left p-2 border border-slate-200 font-semibold">Meaning</th>
                    <th className="text-left p-2 border border-slate-200 font-semibold">Used as</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['FTR',       'Full-time result',                     'Target: H=Home Win, D=Draw, A=Away Win'],
                    ['FTHG',      'Full-time home goals',                 'Target: goals > 2.5 (OU), goals > 0 (BTTS)'],
                    ['FTAG',      'Full-time away goals',                 'Target: goals > 2.5 (OU), goals > 0 (BTTS)'],
                    ['AvgH/D/A',  'Market-average 1X2 odds',              'Feature: margin-removed implied probability (Bet365 if missing)'],
                    ['Avg>2.5',   'Market-average over 2.5 goals odds',   'Feature: margin-removed implied probability (Bet365 if missing)'],
                    ['Avg<2.5',   'Market-average under 2.5 goals odds',  'Feature: margin-removed implied probability (Bet365 if missing)'],
                    ['HST/AST',   'Home / away shots on target',          'Feature: last-10-match shots on target for and against'],
                    ['PSCH/D/A',  'Pinnacle closing 1X2 odds',            'Evaluation only: the benchmark the model is scored against'],
                    ['Season',    'Season code (e.g. 2425)',              'Scopes form and goal averages to the current season'],
                    ['HomeTeam',  'Home team name',                       'Used to compute rolling form features'],
                    ['AwayTeam',  'Away team name',                       'Used to compute rolling form features'],
                    ['Date',      'Match date',                           'Ensures only earlier-dated matches are used'],
                  ].map(([col, meaning, used]) => (
                    <tr key={col} className="even:bg-slate-50">
                      <td className="p-2 border border-slate-200 font-mono text-violet-700">{col}</td>
                      <td className="p-2 border border-slate-200 text-slate-700">{meaning}</td>
                      <td className="p-2 border border-slate-200 text-slate-500">{used}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-green-800">
                <strong>No data leakage:</strong> For every match in the training set, features are computed
                using <em>only</em> matches played before that date. The model never sees the result it is
                trying to predict.
              </p>
            </div>
          </section>

          {/* ── 3. Feature Engineering ──────────────────────────────────────── */}
          <section>
            <SectionHeader icon={<GitBranch className="w-4 h-4" />} color="amber" title="Feature Engineering — 37 Input Features" />
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              Raw CSV data is transformed into 37 numerical features per match: <strong>current-season
              form</strong> (last 5 games), <strong>season-to-date goal averages at the relevant venue</strong>,
              the last 5 H2H meetings, <strong>team strength</strong> (Elo ratings and a Poisson
              attack/defence goals model), <strong>recent goals and shots on target</strong>, rest days, and
              <strong> market-average odds</strong>. All features represent the state of the world immediately
              before kick-off.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed mt-1">
              The server keeps every team&apos;s history itself. When the app asks for a prediction it only sends
              the fixture and the current odds; the server looks both teams up and computes the features with
              the same code used in training, so live and historical features can never drift apart.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left p-2 border border-slate-200 font-semibold">Feature</th>
                    <th className="text-left p-2 border border-slate-200 font-semibold">Group</th>
                    <th className="text-left p-2 border border-slate-200 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_TABLE.map(f => (
                    <tr key={f.name} className="even:bg-slate-50">
                      <td className="p-2 border border-slate-200 font-mono text-violet-700 whitespace-nowrap">{f.name}</td>
                      <td className="p-2 border border-slate-200">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${GROUP_COLORS[f.group]}`}>
                          {f.group}
                        </span>
                      </td>
                      <td className="p-2 border border-slate-200 text-slate-600">{f.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              When a feature is unavailable (e.g. no H2H history between two teams), XGBoost handles the
              missing value natively using its built-in NaN routing — no imputation needed.
            </p>
          </section>

          {/* ── 4. Model Architecture ───────────────────────────────────────── */}
          <section>
            <SectionHeader icon={<Cpu className="w-4 h-4" />} color="violet" title="Model Architecture" />
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              Three separate <strong>XGBoost models</strong> are trained — one per prediction market. Each one
              <strong> starts from a base probability</strong>: the market&apos;s margin-free odds for 1X2 and
              Over/Under, and the Poisson goals model for BTTS (there are no historical BTTS odds). The trees
              then learn only a small, heavily regularised correction on top.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed mt-2">
              Why: an earlier version learned everything from scratch and came out measurably <em>worse</em> than
              the odds it was given. Starting from the market means the model only moves away from the odds where
              the historical data supports it, and otherwise stays at the market.
            </p>

            <div className="mt-3 space-y-3">
              {[
                {
                  name: 'Model 1 — Match Outcome (1X2)',
                  badge: 'multi:softprob',
                  color: 'blue',
                  outputs: ['P(Home Win)', 'P(Draw)', 'P(Away Win)'],
                  note: '3-class softmax objective. Classes: 0=Home, 1=Draw, 2=Away.',
                },
                {
                  name: 'Model 2 — Over/Under 2.5 Goals',
                  badge: 'binary:logistic',
                  color: 'green',
                  outputs: ['P(Over 2.5)', 'P(Under 2.5)'],
                  note: 'Binary classification. Target = 1 if FTHG + FTAG > 2.5.',
                },
                {
                  name: 'Model 3 — Both Teams to Score',
                  badge: 'binary:logistic',
                  color: 'orange',
                  outputs: ['P(BTTS Yes)', 'P(BTTS No)'],
                  note: 'Binary classification. Target = 1 if FTHG > 0 AND FTAG > 0.',
                },
              ].map(m => (
                <div key={m.name} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">{m.name}</span>
                    <code className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{m.badge}</code>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{m.note}</p>
                  <div className="flex gap-2 flex-wrap">
                    {m.outputs.map(o => (
                      <span key={o} className="text-xs bg-white border border-slate-300 text-slate-700 px-2 py-1 rounded-md font-medium">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-bold text-slate-700 mb-2">Shared hyperparameters (all 3 models)</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  ['base_margin', 'market odds'],
                  ['n_estimators', '150 trees'],
                  ['max_depth', '3 levels'],
                  ['learning_rate', '0.02'],
                  ['min_child_weight', '50'],
                  ['reg_lambda', '20'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between bg-white border border-slate-200 rounded px-2 py-1">
                    <code className="text-violet-700">{k}</code>
                    <span className="text-slate-600 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 5. Calibration ──────────────────────────────────────────────── */}
          <section>
            <SectionHeader icon={<FlaskConical className="w-4 h-4" />} color="green" title="Probability Calibration" />
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              A raw XGBoost model produces scores, not true probabilities. For example, it might output
              "0.72" for a home win but the actual historical win rate at that score might only be 58%.
              This is called <strong>miscalibration</strong> — the model is overconfident.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed mt-2">
              Starting from the market solves most of this: margin-free closing-style odds are already very well
              calibrated, and the boosted correction is optimised directly on log loss, so it only shifts a
              probability when doing so made past predictions more accurate. The walk-forward evaluation below
              checks this on seasons the model never trained on.
            </p>
          </section>

          {/* ── 6. Training Process ─────────────────────────────────────────── */}
          <section>
            <SectionHeader icon={<BarChart2 className="w-4 h-4" />} color="blue" title="Training Process &amp; Evaluation" />
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              Each model follows the same training pipeline:
            </p>
            <ol className="mt-2 space-y-2 text-sm text-slate-700">
              {[
                'Download CSV data from football-data.co.uk (cached to disk; the current season is refreshed with --refresh)',
                'Replay every match in date order, computing 37 features from earlier matches only (no leakage)',
                'Walk-forward evaluation (evaluate.py): each recent season is predicted by models trained only on earlier seasons',
                'Score against Pinnacle closing odds — the sharpest public benchmark — with bootstrap confidence intervals',
                'Backtest a betting strategy at market prices, with a line-shopping control to separate skill from price-shopping',
                'Fit the final models on all matches and save them, plus the team history used for live features',
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { metric: 'Log Loss vs Market', models: '1X2 · OU2.5', desc: 'Model log loss minus the market’s on the same matches. Below 0 means the model beats the odds. Accuracy is not used: it ignores how confident a prediction was.' },
                { metric: 'Closing Line Value', models: '1X2 · OU2.5', desc: 'Expected value of each flagged bet measured against Pinnacle’s closing odds. Consistently positive CLV is the most reliable sign of a real edge.' },
                { metric: 'Backtest ROI', models: '1X2 · OU2.5', desc: 'Profit per unit staked when betting the flagged edges. Very noisy — always read it with its confidence interval.' },
              ].map(m => (
                <div key={m.metric} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-slate-900">{m.metric}</p>
                  <p className="text-xs text-violet-600 font-medium mb-1">{m.models}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 mt-3">
              You can view your trained model&apos;s actual scores by calling{' '}
              <code className="bg-slate-100 px-1 rounded">GET http://localhost:8000/model-info</code>{' '}
              while the server is running.
            </p>
          </section>

          {/* ── 7. Prediction Pipeline ──────────────────────────────────────── */}
          <section>
            <SectionHeader icon={<GitBranch className="w-4 h-4" />} color="violet" title="Live Prediction Pipeline" />
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              When you click "Show AI Analysis" on a match card, here is exactly what happens:
            </p>
            <div className="mt-3 space-y-2">
              {[
                { step: 'Browser', color: 'bg-blue-600', text: 'MatchCard calls getMLPrediction(match), which sends the league, team names, kick-off time and averaged odds.' },
                { step: 'Next.js', color: 'bg-slate-600', text: 'The request hits POST /api/ml-predict — a server-side proxy route that forwards the payload to the Python server, avoiding browser CORS restrictions.' },
                { step: 'Python', color: 'bg-violet-600', text: 'teams.py matches the team names to the historical data, then the saved team history produces the same 37 features the model was trained on. Leagues or teams without history return a clear "unavailable" message instead of a guess.' },
                { step: 'XGBoost', color: 'bg-green-600', text: 'All three calibrated models run inference in milliseconds. Each model returns a probability array.' },
                { step: 'Response', color: 'bg-amber-600', text: 'The server returns outcome probabilities (%), over/under probabilities (%), BTTS probabilities (%), confidence level, and model metadata.' },
                { step: 'UI', color: 'bg-blue-600', text: 'The ML panel renders the probabilities with the predicted winner highlighted. The rule-based panel above still shows independently.' },
              ].map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`${s.color} text-white text-xs font-bold px-2 py-1 rounded min-w-[64px] text-center flex-shrink-0 mt-0.5`}>
                    {s.step}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 8. Confidence Levels ────────────────────────────────────────── */}
          <section>
            <SectionHeader icon={<BarChart2 className="w-4 h-4" />} color="green" title="Confidence Levels" />
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              Confidence is derived from the highest of the three 1X2 outcome probabilities after calibration:
            </p>
            <div className="mt-3 space-y-2">
              {[
                { label: 'High',   range: 'max(home, draw, away) ≥ 60%', color: 'bg-green-100 text-green-800 border-green-200',  note: 'One outcome is clearly favoured. Model assigns a majority probability.' },
                { label: 'Medium', range: '45% ≤ max < 60%',             color: 'bg-yellow-100 text-yellow-800 border-yellow-200', note: 'One outcome is slightly favoured but the market is competitive.' },
                { label: 'Low',    range: 'max < 45%',                   color: 'bg-red-100 text-red-800 border-red-200',          note: 'Very even contest. No outcome holds a clear statistical edge.' },
              ].map(c => (
                <div key={c.label} className={`flex items-start gap-3 border rounded-lg p-3 ${c.color}`}>
                  <span className="font-bold text-sm w-14 flex-shrink-0">{c.label}</span>
                  <div>
                    <code className="text-xs font-mono">{c.range}</code>
                    <p className="text-xs mt-0.5 opacity-80">{c.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 9. Limitations ──────────────────────────────────────────────── */}
          <section>
            <SectionHeader icon={<AlertTriangle className="w-4 h-4" />} color="red" title="Limitations &amp; Honest Caveats" />
            <div className="mt-3 space-y-2">
              {[
                { title: 'The model matches the market — it does not beat it', body: 'On seasons it never trained on, the model is statistically level with the average bookmaker odds and slightly behind Pinnacle’s closing line. Betting its picks at average prices lost about the bookmaker margin in backtests. Treat it as a well-calibrated second opinion, not as a source of guaranteed value.' },
                { title: 'No injury, suspension, or lineup data', body: 'The model does not know that a key striker is injured or that a manager was sacked this week. These events can completely change the expected outcome and are not captured in historical form statistics.' },
                { title: 'No weather, pitch, or travel data', body: 'Venue conditions, away travel distance, altitude, and match importance (cup final vs. mid-table league game) are not features in the current model.' },
                { title: 'Limited league coverage', body: 'Predictions are only available for leagues with historical data (see the dataset section). Cup and European matches, and teams new to the data, return "unavailable" rather than a guess.' },
                { title: 'History must be kept current', body: 'Form, Elo and shot features come from the saved match history. If it is more than ~3 weeks behind, the panel warns you — retrain with python train.py --refresh.' },
                { title: 'Not financial advice', body: 'Predictions are for informational and educational purposes only. Betting carries inherent financial risk. Past model accuracy does not guarantee future results.' },
              ].map(l => (
                <div key={l.title} className="flex gap-3 bg-red-50 border border-red-100 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{l.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{l.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Source code: <code className="bg-slate-100 px-1 rounded">python_model/</code> ·
              Data: <code className="bg-slate-100 px-1 rounded">football-data.co.uk</code> ·
              Model info endpoint: <code className="bg-slate-100 px-1 rounded">GET localhost:8000/model-info</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component: section header ─────────────────────────────────────────────

function SectionHeader({ icon, color, title }: { icon: React.ReactNode; color: string; title: string }) {
  const colors: Record<string, string> = {
    violet: 'bg-violet-100 text-violet-700',
    blue:   'bg-blue-100 text-blue-700',
    green:  'bg-green-100 text-green-700',
    amber:  'bg-amber-100 text-amber-700',
    red:    'bg-red-100 text-red-700',
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <h3
        className="font-bold text-slate-900"
        dangerouslySetInnerHTML={{ __html: title }}
      />
    </div>
  );
}
