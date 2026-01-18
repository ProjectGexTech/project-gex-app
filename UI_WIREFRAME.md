# Gexten UI/UX Flow - Visual Wireframe

## 📱 Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                          HEADER (Sticky)                            │
│  ┌──────┐  Gexten                              💰 Balance    👤 JD  │
│  │  G   │  Professional Odds Platform          $1,250.00            │
│  └──────┘                                                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      ERROR BANNER (if any)                          │
│  ⚠️  Error loading matches: [error message]                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┬──────────────────────────────┐
│                                      │                              │
│      LEFT SECTION (66% width)        │   RIGHT SECTION (33% width)  │
│                                      │        (Sticky)               │
│  ┌────────────────────────────────┐  │                              │
│  │   FILTER SELECTION CARD        │  │   ┌────────────────────────┐ │
│  │                                │  │   │    BET SLIP CARD       │ │
│  │  🔷 Filter Settings            │  │   │                        │ │
│  │  Select preferences first       │  │   │  🎫 Bet Slip          │ │
│  │                                │  │   │                        │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │   │  [Empty State]         │ │
│  │                                │  │   │  🛒                     │ │
│  │  ① SELECT LEAGUES              │  │   │  No selections yet     │ │
│  │  [Premier] [La Liga] [Serie A] │  │   │                        │ │
│  │  [Bundesliga] [Ligue 1] [UCL]  │  │   │  OR                    │ │
│  │                                │  │   │                        │ │
│  │  ② SELECT DATE RANGE           │  │   │  [Selection Cards]     │ │
│  │  [Today] [3 Days] [7 Days] ✓   │  │   │  ┌──────────────────┐ │ │
│  │  [14 Days]                     │  │   │  │ Team A vs Team B │ │ │
│  │                                │  │   │  │ Home: 2.50   ❌  │ │ │
│  │  ③ SELECT MARKETS              │  │   │  └──────────────────┘ │ │
│  │  [🏆 Match Winner] ✓           │  │   │                        │ │
│  │  [⚽ Over/Under 2.5] ✓          │  │   │  Total Odds: 5.23     │ │
│  │                                │  │   │  2 selections          │ │
│  │  ODDS RANGE (Optional)         │  │   │                        │ │
│  │  Min: [1.2]  Max: [3.0]        │  │   │  [Bookmaker Selector] │ │
│  │                                │  │   │                        │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │   │  [Generate Code]  🔵  │ │
│  │                                │  │   │  [Clear All]      ⚪  │ │
│  │  [📈 Fetch Odds] 🔵 ENABLED    │  │   │                        │ │
│  │  OR                            │  │   └────────────────────────┘ │
│  │  [✅ 45 matches loaded]        │  │                              │
│  │                                │  │   OR (After Generation)      │
│  │  Reset button appears →        │  │                              │
│  └────────────────────────────────┘  │   ┌────────────────────────┐ │
│                                      │   │  ✅ Code Generated!    │ │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │                        │ │
│                                      │   │  🔵 BOOKING CODE       │ │
│  RESULTS AREA                        │   │  ┌──────────────────┐ │ │
│                                      │   │  │ ABC-DEF-123  📋  │ │ │
│  BEFORE FETCH:                       │   │  └──────────────────┘ │ │
│  ┌────────────────────────────────┐  │   │  Bet365              │ │
│  │  📈 Ready to Find Odds         │  │   │  Total: 5.23         │ │
│  │  Select filters above          │  │   │                        │ │
│  │                                │  │   │  [How to Use]          │ │
│  │  💡 Filter-first prevents      │  │   │  [Create New Bet]      │ │
│  │  unnecessary API calls         │  │   └────────────────────────┘ │
│  └────────────────────────────────┘  │                              │
│                                      │                              │
│  AFTER FETCH:                        │                              │
│  45 Matches Available • 🟢 Updated   │                              │
│                                      │                              │
│  ┌────────────────────────────────┐  │                              │
│  │  MATCH CARD                    │  │                              │
│  │  ┌───────────────────────────┐ │  │                              │
│  │  │ 📅 Jan 17 • 15:00 [EPL]   │ │  │                              │
│  │  ├───────────────────────────┤ │  │                              │
│  │  │ Manchester United  WWDLW  │ │  │                              │
│  │  │         VS                │ │  │                              │
│  │  │ Chelsea            LWWWD  │ │  │                              │
│  │  ├───────────────────────────┤ │  │                              │
│  │  │ ⚽ MATCH WINNER (1X2)      │ │  │                              │
│  │  │ [HOME 2.10] [DRAW 3.40]   │ │  │                              │
│  │  │ [AWAY 3.20]               │ │  │                              │
│  │  ├───────────────────────────┤ │  │                              │
│  │  │ 🤖 AI Prediction  [HIGH]  │ │  │                              │
│  │  │ Home: 45% Draw: 25%       │ │  │                              │
│  │  │ Away: 30%                 │ │  │                              │
│  │  └───────────────────────────┘ │  │                              │
│  └────────────────────────────────┘  │                              │
│                                      │                              │
│  [More match cards below...]         │                              │
│                                      │                              │
└──────────────────────────────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           FOOTER                                    │
│  Gexten © 2026 • Professional Odds Platform                         │
│  Terms • Privacy • Support                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Legend

- 🔵 = Primary Blue (Enabled Actions)
- ⚪ = Secondary Gray (Secondary Actions)
- 🟢 = Success Green (Status Indicators)
- 🔴 = Error Red (Warnings/Removals)
- ⚫ = Text (Primary/Secondary)

---

## 🔄 State Transitions

### Filter Card States

```
INITIAL STATE
├─ All filters unselected
├─ "Fetch Odds" button DISABLED (gray)
└─ Instructions visible

USER SELECTS FILTERS
├─ Step indicators turn blue (①②③)
├─ Selected options get blue border + checkmark
├─ Selection count updates
└─ "Fetch Odds" button becomes ENABLED (blue)

AFTER FETCH
├─ Success message replaces button
├─ Green checkmark + match count
├─ Filters become DISABLED (locked)
├─ Reset button appears
└─ Results populate below
```

### Results Area States

```
EMPTY (Before Fetch)
┌─────────────────────┐
│   📈                │
│   Ready to         │
│   Find Odds        │
│                     │
│   Select filters   │
│   above...         │
│                     │
│   💡 Why filter-   │
│   first?           │
└─────────────────────┘

LOADING
┌─────────────────────┐
│                     │
│       🔄            │
│   Loading matches   │
│                     │
│   Please wait...    │
└─────────────────────┘

NO RESULTS
┌─────────────────────┐
│   ⚽                │
│   No Matches       │
│   Found            │
│                     │
│   Try adjusting    │
│   your filters     │
│                     │
│   [Reset Filters]  │
└─────────────────────┘

WITH RESULTS
┌─────────────────────┐
│ 45 Matches • 🟢     │
├─────────────────────┤
│ [Match Card 1]      │
│ [Match Card 2]      │
│ [Match Card 3]      │
│ ...                 │
└─────────────────────┘
```

### Bet Slip States

```
EMPTY
┌─────────────────────┐
│  🎫 Bet Slip        │
├─────────────────────┤
│                     │
│      🛒             │
│  No selections yet  │
│                     │
│  Select matches     │
│  from the list      │
└─────────────────────┘

WITH SELECTIONS
┌─────────────────────┐
│  🎫 Bet Slip        │
├─────────────────────┤
│ [Selection Card 1]  │
│ [Selection Card 2]  │
├─────────────────────┤
│ Total Odds: 5.23    │
│ 2 selections        │
├─────────────────────┤
│ Bookmaker: [Bet365] │
│                     │
│ [Generate Code] 🔵  │
│ [Clear All]     ⚪  │
└─────────────────────┘

CODE GENERATED
┌─────────────────────┐
│  ✅ Code Generated! │
├─────────────────────┤
│ 🔵 BOOKING CODE     │
│ ┌─────────────────┐ │
│ │ ABC-DEF-123  📋 │ │
│ └─────────────────┘ │
│ Bet365              │
│ Total: 5.23         │
├─────────────────────┤
│ Your Selections:    │
│ • Team A vs Team B  │
│ • Team C vs Team D  │
├─────────────────────┤
│ 📖 How to Use:      │
│ 1. Copy code        │
│ 2. Visit Bet365     │
│ 3. Enter code       │
│ 4. Place bet        │
├─────────────────────┤
│ [Create New Bet] ⚪  │
└─────────────────────┘
```

---

## 📱 Responsive Breakpoints

### Desktop (1024px+)
```
┌────────────────────────────────────────┐
│           HEADER (Full)                │
├─────────────────┬──────────────────────┤
│   FILTERS +     │    BET SLIP          │
│   RESULTS       │    (Sticky)          │
│   (66%)         │    (33%)             │
└─────────────────┴──────────────────────┘
```

### Tablet (768-1023px)
```
┌────────────────────────────────────────┐
│           HEADER (Full)                │
├────────────────────────────────────────┤
│         FILTERS + RESULTS              │
│         (Full Width)                   │
├────────────────────────────────────────┤
│         BET SLIP                       │
│         (Full Width, Below)            │
└────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────┐
│   HEADER (Mobile)    │
│   [☰] Gexten [👤]    │
├──────────────────────┤
│   FILTERS            │
│   (Collapsible)      │
├──────────────────────┤
│   RESULTS            │
│   (Full Width)       │
├──────────────────────┤
│   BET SLIP           │
│   (Fixed Bottom)     │
└──────────────────────┘
```

---

## 🎯 User Interaction Flow

```
START
  ↓
┌─────────────────────┐
│  Land on page       │
│  All filters empty  │
└─────────────────────┘
  ↓
┌─────────────────────┐
│  Select leagues     │
│  (Premier, La Liga) │
└─────────────────────┘
  ↓
┌─────────────────────┐
│  Select date range  │
│  (Next 7 Days)      │
└─────────────────────┘
  ↓
┌─────────────────────┐
│  Select markets     │
│  (Match Winner)     │
└─────────────────────┘
  ↓
┌─────────────────────┐
│  Button ENABLED     │
│  Click "Fetch Odds" │
└─────────────────────┘
  ↓
┌─────────────────────┐
│  Loading...         │
│  (API call)         │
└─────────────────────┘
  ↓
┌─────────────────────┐
│  45 matches loaded  │
│  Browse results     │
└─────────────────────┘
  ↓
┌─────────────────────┐
│  Click odds on      │
│  match card         │
└─────────────────────┘
  ↓
┌─────────────────────┐
│  Added to bet slip  │
│  (right sidebar)    │
└─────────────────────┘
  ↓
┌─────────────────────┐
│  Select more or     │
│  generate code      │
└─────────────────────┘
  ↓
┌─────────────────────┐
│  Click "Generate    │
│  Booking Code"      │
└─────────────────────┘
  ↓
┌─────────────────────┐
│  Success! ✅        │
│  Code displayed     │
└─────────────────────┘
  ↓
┌─────────────────────┐
│  Copy code & use    │
│  OR create new bet  │
└─────────────────────┘
  ↓
END
```

---

## 🔒 API Protection Checkpoints

```
✅ CHECKPOINT 1: Page Load
   → NO API call made
   → Filters empty
   → Button disabled

✅ CHECKPOINT 2: Partial Selection
   → Selected: Leagues only
   → Button: Still disabled
   → NO API call

✅ CHECKPOINT 3: All Required Filters
   → Selected: Leagues + Markets
   → Button: NOW enabled
   → Still NO API call (waiting)

✅ CHECKPOINT 4: User Clicks Button
   → API call triggered
   → Loading state shown
   → Filters locked

✅ CHECKPOINT 5: Data Loaded
   → Results displayed
   → Filters remain locked
   → No accidental re-fetch

✅ CHECKPOINT 6: Reset
   → User must explicitly reset
   → All filters cleared
   → Return to CHECKPOINT 1
```

---

## 💎 Premium Design Elements

### Visual Cues
- ✨ Blue borders indicate selection/active state
- ✨ Checkmarks confirm user choices
- ✨ Numbered steps guide the flow
- ✨ Icons add visual clarity without clutter
- ✨ Shadows provide subtle depth
- ✨ Rounded corners feel modern and friendly
- ✨ Generous spacing prevents overwhelm

### Professional Touches
- 🎯 Consistent 2px borders throughout
- 🎯 Blue accent color for all primary actions
- 🎯 Gray for secondary/disabled states
- 🎯 Success green only for confirmations
- 🎯 Error red only for warnings/removals
- 🎯 Mono-spaced font for booking codes
- 🎯 Subtle hover states on all clickable elements

---

## 📊 Before vs After

### BEFORE (Old Design)
```
❌ Auto-loads data on page load
❌ Wasted API credits
❌ Cluttered gradients
❌ Dark mode inconsistency
❌ No clear user flow
❌ Filter sidebar hidden
❌ Unclear what to do first
```

### AFTER (New Design)
```
✅ NO auto-load (filter-first)
✅ Zero wasted credits
✅ Clean white/blue theme
✅ Consistent single theme
✅ Clear step-by-step flow
✅ Filters prominent and inline
✅ Obvious starting point
```

---

This wireframe document provides a clear visual reference for the entire application structure, state management, and user flow.
