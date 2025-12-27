# The Odds API Setup Guide

This guide will walk you through setting up The Odds API integration for the Gexten app.

## Step 1: Get Your API Key

1. Go to [The Odds API website](https://the-odds-api.com/)
2. Click on "Get API Key" or "Sign Up"
3. Create a free account (or choose a paid plan for more requests)
4. Once logged in, you'll see your API key on the dashboard

### Free Tier Limits:
- **500 requests per month**
- Access to all sports and markets
- Updates every 10-15 minutes

### Pro Plans (if you need more):
- Start at $10/month for 10,000 requests
- More frequent updates
- Higher rate limits

## Step 2: Configure Your Environment Variables

1. Open the `.env.local` file in the project root (it was created automatically)
2. Replace `your_api_key_here` with your actual API key:

```env
NEXT_PUBLIC_ODDS_API_KEY=your_actual_api_key_from_the_odds_api
```

**Example:**
```env
NEXT_PUBLIC_ODDS_API_KEY=abc123def456ghi789jkl012mno345pq
```

⚠️ **Important Notes:**
- Never commit your API key to version control
- The `.env.local` file is already in `.gitignore`
- Use `NEXT_PUBLIC_` prefix because we're calling the API from the client-side
- Restart your dev server after changing environment variables

## Step 3: Verify the Setup

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. You should see:
   - A loading spinner initially
   - Real soccer matches loading from the API
   - Match count in the header
   - "Live Odds" indicator

4. Check the browser console (F12) for messages like:
   ```
   Fetching fresh soccer odds from The Odds API...
   API Requests - Used: 7, Remaining: 493
   Successfully fetched X soccer matches
   ```

## Step 4: Understanding the Integration

### What Soccer Leagues Are Included?
The app fetches odds from these leagues:
- ⚽ English Premier League
- ⚽ Spanish La Liga  
- ⚽ German Bundesliga
- ⚽ Italian Serie A
- ⚽ French Ligue 1
- ⚽ UEFA Champions League
- ⚽ UEFA Europa League

### What Data Is Fetched?
For each match, the app gets:
- **Head-to-Head (H2H)** odds: Home win, Draw, Away win
- **Totals (Over/Under 2.5)** odds: Over 2.5 goals, Under 2.5 goals
- **Both Teams to Score (BTTS)** odds: Yes, No
- Match date and time
- Available bookmakers

### How Often Does It Update?
- **Automatic refresh**: Every 5 minutes
- **Manual refresh**: Click the "Refresh" button in the header
- **Caching**: Data is cached for 5 minutes to save API requests

### Monitoring API Usage
The app logs your remaining API requests to the console. Keep an eye on this to avoid hitting your limit!

```
API Requests - Used: 10, Remaining: 490
```

## Troubleshooting

### Error: "Please set up your Odds API key in .env.local"
- ✅ Make sure you created the `.env.local` file
- ✅ Check that the API key is set correctly (no quotes needed)
- ✅ Restart your dev server after adding the key

### Error: "Invalid API key"
- ✅ Double-check your API key from the dashboard
- ✅ Make sure there are no extra spaces in the `.env.local` file
- ✅ Verify the key hasn't expired

### Error: "API rate limit exceeded"
- ✅ You've used all your monthly requests
- ✅ Wait until next month or upgrade your plan
- ✅ The app will show cached data when possible

### No matches showing up
- ✅ Check if there are upcoming matches in those leagues
- ✅ Try adjusting the odds filters
- ✅ Look at the browser console for API errors
- ✅ Some leagues may not have matches scheduled

## Advanced Configuration

### Changing the Refresh Interval
In `app/page.tsx`, find this line:
```typescript
}, 5 * 60 * 1000); // 5 minutes in milliseconds
```

Change `5` to your desired minutes. For example:
- `10 * 60 * 1000` for 10 minutes
- `15 * 60 * 1000` for 15 minutes

⚠️ Longer intervals = fewer API requests

### Adding More Soccer Leagues
In `lib/oddsAPI.ts`, add to the `SOCCER_SPORTS` array:
```typescript
const SOCCER_SPORTS = [
  'soccer_epl',
  // ... existing leagues
  'soccer_brazil_serie_a',  // Add Brazilian Serie A
  'soccer_portugal_primeira_liga',  // Add Portuguese League
];
```

See [The Odds API Sports Documentation](https://the-odds-api.com/sports-odds-data/soccer.html) for all available leagues.

### Changing Bookmaker Regions
In `lib/oddsAPI.ts`, modify the `regions` parameter:
```typescript
regions: 'uk,eu,us', // UK, EU, and US bookmakers
```

Available regions: `us`, `uk`, `eu`, `au` (Australia)

## API Cost Optimization Tips

1. **Use caching**: The app already caches for 5 minutes
2. **Increase refresh interval**: Less frequent updates = fewer requests
3. **Filter leagues**: Remove leagues you don't need from `SOCCER_SPORTS`
4. **Monitor usage**: Check console logs for request counts
5. **Manual refresh**: Use manual refresh instead of automatic for testing

## Need Help?

- 📖 [The Odds API Documentation](https://the-odds-api.com/liveapi/guides/v4/)
- 💬 [The Odds API Support](https://the-odds-api.com/contact)
- 🐛 Check browser console for error messages

---

Happy betting! 🎯⚽
