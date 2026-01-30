# Filter-First Architecture Implementation

## Overview
This implementation creates a **filters-first** experience that prevents wasting API credits by ensuring the app never fires multiple requests just to populate options. The system follows a strict **Filters → Confirm → Fetch** flow.

## Key Features

### ✅ 1. Zero Unnecessary API Calls
- **No API calls on page load** - The app doesn't fetch any data until the user explicitly clicks "Fetch Matches"
- **Static league configuration** - All league metadata is stored locally in `lib/leagueConfig.ts`
- **Selective fetching** - Only selected leagues are fetched (1 request per selected league)

### ✅ 2. Step-by-Step Filter Flow
The `FilterWizard` component guides users through a logical progression:

1. **Sport Selection** (Auto-selected to Football)
2. **League Category** (Domestic / Cup / International)
3. **Specific Leagues** (Only shows leagues from selected category)
4. **Additional Filters** (Date range, Markets)

### ✅ 3. Smart Query Caching
The `oddsAPI` service implements a sophisticated caching layer:
- **Query-based cache** - Each unique combination of (leagues + markets + date range) is cached separately
- **5-minute cache duration** - Prevents redundant API calls for the same query
- **Automatic cache management** - Old cache entries are automatically handled

### ✅ 4. Validation & UX Rules
- **Disabled "Fetch" button** until required fields are selected
- **Clear summary** shows exactly what will be fetched before making API calls
- **API call counter** displays how many requests will be made
- **Filter reset behavior** - Keeps "safe" filters (date range, markets) when changing league category

## Architecture

### File Structure
```
lib/
  ├── leagueConfig.ts         # Static league metadata (NO API calls)
  ├── filterWizardStore.ts    # State management for wizard
  ├── oddsAPI.ts              # Modified with fetchSelectedLeagues()
  └── store.ts                # Added fetchSelectedLeagues() method

components/
  └── FilterWizard.tsx        # New filter wizard UI

app/
  └── page.tsx                # Integrated FilterWizard
```

### Data Flow

```
User Selects Filters (No API calls)
         ↓
FilterWizard validates selections
         ↓
User clicks "Fetch Matches"
         ↓
fetchSelectedLeagues() called with config
         ↓
API: 1 request per selected league
         ↓
Results cached and displayed
```

## Component Details

### 1. League Configuration (`lib/leagueConfig.ts`)
```typescript
- LEAGUE_CATEGORIES: Static list of league types
- LEAGUES_CONFIG: Complete metadata for 8 leagues
  - key: API identifier (e.g., 'soccer_epl')
  - name: Display name
  - category: domestic | cup | international
  - seasons: Available season list
  - supportsTeamFilter: Boolean flag
```

### 2. Filter Wizard Store (`lib/filterWizardStore.ts`)
```typescript
State Management:
- leagueCategory: Selected category
- selectedLeagues: Array of league keys
- dateRange: { start: Date, days: number }
- selectedMarkets: ['h2h', 'totals']
- isValidToFetch: Boolean validation flag

Key Methods:
- setLeagueCategory(): Updates category, resets leagues
- toggleLeague(): Add/remove league
- validateFilters(): Checks if ready to fetch
- getFilterSummary(): Generates human-readable summary
```

### 3. Optimized API Service (`lib/oddsAPI.ts`)
```typescript
New Method: fetchSelectedLeagues(leagueKeys, markets, dateRangeDays)
- Takes only selected league keys
- Makes 1 request per league (not all 8)
- Implements query-specific caching
- Cache key: leagues_markets_days

Example:
- Select 1 league → 1 API request
- Select 3 leagues → 3 API requests
- Fetch again with same selection → 0 API requests (cached)
```

### 4. Filter Wizard Component (`components/FilterWizard.tsx`)
```typescript
Props:
- onFetchData: Callback with filter config
- isLoading: Loading state

Features:
- Visual step indicators with checkmarks
- Progressive disclosure (steps unlock sequentially)
- Real-time validation
- Filter summary before fetching
- API request counter
- Reset functionality
```

## Usage Example

### Initial State (No API Calls)
```typescript
// Page loads
✓ Football (pre-selected)
❌ No league category selected
❌ No leagues selected
❌ "Fetch Matches" button disabled
📊 API calls made: 0
```

### User Flow
```typescript
// 1. User selects "Domestic Leagues"
✓ Football
✓ Domestic Leagues
❌ No leagues selected
❌ Button still disabled

// 2. User selects Premier League + La Liga
✓ Football
✓ Domestic Leagues
✓ 2 leagues selected
✓ Button enabled

// 3. User clicks "Fetch Matches"
API calls made: 2 (Premier League + La Liga)
Results: 15 matches loaded
Cache: Stored for 5 minutes

// 4. User changes filters and fetches again
Same selection → 0 API calls (cached)
Different selection → New API calls made
```

## API Credit Optimization

### Before (Old Implementation)
```
Page Load → 8 API requests (all leagues)
Filter change → 0 additional requests
Refresh → 8 API requests again
```

### After (New Implementation)
```
Page Load → 0 API requests
User selects 2 leagues → 2 API requests
Same query within 5 min → 0 API requests (cached)
User selects 3 different leagues → 3 API requests
```

### Credit Savings Example
```
Scenario: 10 users per day, each searches 3 times

Old:
- Page load: 10 users × 8 requests = 80 credits
- Searches: 10 users × 3 searches × 8 requests = 240 credits
- Total: 320 credits/day

New:
- Page load: 0 credits
- Searches: 10 users × 3 searches × 2 avg leagues = 60 credits
- Cache hits reduce by ~40%: 60 × 0.6 = 36 credits
- Total: 36 credits/day

Savings: 88.75% reduction in API calls
```

## Advanced Features

### Query Caching
```typescript
// Cache key generation
const cacheKey = `${leagueKeys.sort().join(',')}_${markets.sort().join(',')}_${dateRangeDays}`;

// Example cache keys:
'soccer_epl,soccer_spain_la_liga_h2h,totals_7'
'soccer_epl_h2h_14'
```

### Filter Dependencies
```typescript
When user changes league category:
- ✅ Leagues are reset (category-dependent)
- ✅ Date range is kept (safe filter)
- ✅ Markets are kept (safe filter)
- ❌ Season is reset (league-specific)
```

### Validation Rules
```typescript
isValidToFetch = 
  sport === 'football' &&
  leagueCategory !== null &&
  selectedLeagues.length > 0 &&
  selectedMarkets.length > 0
```

## Testing Checklist

- [ ] Page loads without API calls
- [ ] "Fetch" button disabled until leagues selected
- [ ] Selecting leagues updates UI correctly
- [ ] API call counter shows correct number
- [ ] Clicking "Fetch" makes only selected league requests
- [ ] Same query returns cached results (no API calls)
- [ ] Different query makes new API calls
- [ ] Changing league category resets selected leagues
- [ ] Reset button clears all selections
- [ ] Error handling works for failed API calls

## Future Enhancements

1. **Persistent Filters** - Save last used filters to localStorage
2. **Favorite Queries** - Save common filter combinations
3. **Batch Optimization** - Combine multiple league requests if API supports it
4. **Progressive Loading** - Fetch most popular leagues first, others on demand
5. **Analytics Dashboard** - Show API credit usage statistics

## Maintenance Notes

### Adding New Leagues
1. Update `LEAGUES_CONFIG` in `lib/leagueConfig.ts`
2. Add league to appropriate category
3. Ensure API key matches The Odds API documentation

### Modifying Cache Duration
```typescript
// In lib/oddsAPI.ts
private readonly CACHE_DURATION = 5 * 60 * 1000; // Adjust here
```

### Adding New Filter Steps
1. Add state to `filterWizardStore.ts`
2. Add UI section to `FilterWizard.tsx`
3. Update validation logic
4. Pass filter to `fetchSelectedLeagues()`

---

**Implementation Complete ✅**
- Zero API calls on page load
- 1 request per selected league (not 8)
- Smart query-based caching
- Clean separation of concerns
- User-friendly step-by-step flow
