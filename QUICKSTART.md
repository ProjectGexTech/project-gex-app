# 🚀 Quick Start: Setting Up The Odds API

Get your Gexten app running with live soccer odds in 5 minutes!

## Prerequisites
- Node.js installed
- A free account on [The Odds API](https://the-odds-api.com/)

## Setup Steps

### 1️⃣ Get Your API Key (2 minutes)

1. Visit https://the-odds-api.com/
2. Click **"Get API Key"** or **"Sign Up"**
3. Create a free account
4. Copy your API key from the dashboard

**Free tier includes:**
- ✅ 500 requests/month
- ✅ All soccer leagues
- ✅ Live odds updates

---

### 2️⃣ Configure Your API Key (1 minute)

Open `.env.local` file in your project root and add your API key:

```env
NEXT_PUBLIC_ODDS_API_KEY=paste_your_api_key_here
```

**Example:**
```env
NEXT_PUBLIC_ODDS_API_KEY=abc123def456ghi789jkl012mno345pq
```

💡 **Tip:** The `.env.local` file was already created for you!

---

### 3️⃣ Start the Development Server (1 minute)

```bash
npm run dev
```

---

### 4️⃣ Open Your Browser (30 seconds)

Navigate to: **http://localhost:3000**

You should see:
- 🔄 Loading spinner (initially)
- ⚽ Real soccer matches with live odds
- 📊 Match count in header
- 🎯 Refresh button

---

## ✅ Verify It's Working

Check the browser console (press F12) for messages like:

```
Fetching fresh soccer odds from The Odds API...
Successfully fetched 42 soccer matches
API Requests - Used: 7, Remaining: 493
```

---

## 🎯 What You Get

### Soccer Leagues Included:
- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 English Premier League
- 🇪🇸 Spanish La Liga
- 🇩🇪 German Bundesliga
- 🇮🇹 Italian Serie A
- 🇫🇷 French Ligue 1
- 🏆 UEFA Champions League
- 🏆 UEFA Europa League

### Odds Markets:
- **H2H**: Home, Draw, Away
- **Totals**: Over/Under 2.5 goals
- **BTTS**: Both teams to score

### Features:
- ⏰ Auto-refresh every 5 minutes
- 🔄 Manual refresh button
- 💾 Smart caching (saves API requests)
- 📊 Multiple bookmakers averaged
- 🎯 Real-time odds updates

---

## 🚨 Troubleshooting

### "Please set up your Odds API key"
1. Check `.env.local` exists in project root
2. Verify API key is correct (no quotes needed)
3. Restart dev server: `Ctrl+C` then `npm run dev`

### No matches showing
1. Check if matches are scheduled today
2. Adjust odds filters in the UI
3. Look at browser console for errors

### Rate limit exceeded
- You've used your 500 monthly requests
- Upgrade plan or wait until next month
- App will show cached data when possible

---

## 📚 Need More Details?

Read the comprehensive guide: [ODDS_API_SETUP.md](./ODDS_API_SETUP.md)

---

## 🎉 You're All Set!

Your app is now pulling live soccer odds from The Odds API!

**Next steps:**
- Filter matches by odds range
- Select bets and generate booking codes
- Monitor your API usage in the console

---

**Questions?** Check the [full documentation](./ODDS_API_SETUP.md) or [The Odds API docs](https://the-odds-api.com/liveapi/guides/v4/).
