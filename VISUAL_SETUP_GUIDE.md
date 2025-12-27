# 🎯 Visual Setup Guide

## Step-by-Step with Screenshots

---

## Step 1: Get Your API Key 🔑

### Go to The Odds API Website
👉 Visit: **https://the-odds-api.com/**

### What You'll See:
- Homepage with "Get API Key" button
- Free tier: 500 requests/month
- No credit card required

### Action Steps:
1. Click **"Get API Key"** or **"Sign Up"**
2. Fill in your email and password
3. Verify your email
4. Login to dashboard

### Find Your API Key:
```
Dashboard → API Key Section → Copy Key
```

It looks like this:
```
abc123def456ghi789jkl012mno345pqrstu678vwxyz901
```

---

## Step 2: Add API Key to Your Project 🔧

### Open Your Project
```bash
cd /Users/mac/Desktop/project-gex-app
```

### Edit .env.local File
The file already exists! Just open it:

```bash
# Use your favorite editor:
code .env.local        # VS Code
nano .env.local        # Terminal editor
open .env.local        # Mac default editor
```

### What You'll See in .env.local:
```env
# The Odds API Configuration
# Get your free API key at: https://the-odds-api.com/
NEXT_PUBLIC_ODDS_API_KEY=your_api_key_here
```

### Replace with Your Real Key:
```env
# The Odds API Configuration
# Get your free API key at: https://the-odds-api.com/
NEXT_PUBLIC_ODDS_API_KEY=abc123def456ghi789jkl012mno345pqrstu678vwxyz901
```

⚠️ **Important:**
- No quotes around the key
- No spaces before or after
- Replace the entire `your_api_key_here` text

### Save the File
- VS Code: `Cmd+S` (Mac) or `Ctrl+S` (Windows)
- Nano: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 3: Restart Dev Server 🔄

### Stop Current Server
In your terminal where the server is running:
```bash
Press: Ctrl+C
```

You'll see:
```
^C
 ✓ Compiled successfully
```

### Start Server Again
```bash
npm run dev
```

You'll see:
```bash
> gexten@0.1.0 dev
> next dev

   ▲ Next.js 16.0.5 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.26:3000

 ✓ Starting...
 ✓ Ready in 1857ms
```

---

## Step 4: Test in Browser 🌐

### Open Browser
Navigate to: **http://localhost:3000**

### What You Should See:

#### While Loading (First Few Seconds):
```
┌─────────────────────────────────────┐
│  🏆 Gexten                          │
│     Live Soccer Betting Odds        │
│                                     │
│  📊 0 Matches  ⚡ Live Odds         │
│  [🔄 Refreshing...]                 │
└─────────────────────────────────────┘

        Loading matches...
        🔄 (spinning icon)
    Fetching live odds from The Odds API
```

#### After Loading (Success):
```
┌─────────────────────────────────────┐
│  🏆 Gexten                          │
│     Live Soccer Betting Odds        │
│                                     │
│  📊 42 Matches  ⚡ Live Odds        │
│  [🔄 Refresh]                       │
│  Last updated: 3:45:12 PM           │
└─────────────────────────────────────┘

Available Matches (42)

┌─────────────────────────────────────┐
│ ⚽ Premier League                   │
│                                     │
│ Arsenal  vs  Chelsea                │
│ Today, 8:00 PM                      │
│                                     │
│ Home: 2.10  Draw: 3.40  Away: 3.20 │
│ [+ Add to Slip]                     │
└─────────────────────────────────────┘
```

---

## Step 5: Check Browser Console 🔍

### Open Developer Tools
- Chrome/Edge: Press `F12` or `Cmd+Option+I` (Mac)
- Firefox: Press `F12` or `Cmd+Shift+I` (Mac)
- Safari: Enable Dev Menu first, then `Cmd+Option+I`

### What You Should See in Console:
```javascript
Fetching fresh soccer odds from The Odds API...
API Requests - Used: 7, Remaining: 493
Successfully fetched 42 soccer matches
```

### Success Indicators:
✅ No red errors
✅ "Successfully fetched X matches" message
✅ "Remaining: XXX" shows you have requests left
✅ Matches appear on the page

---

## Troubleshooting Visual Guide 🔧

### ❌ Error: "Please set up your Odds API key"

**What You'll See:**
```
┌─────────────────────────────────────┐
│ ⚠️ Error loading matches            │
│                                     │
│ Please set up your Odds API key     │
│ in .env.local                       │
│                                     │
│ Please check your .env.local file   │
└─────────────────────────────────────┘
```

**Fix:**
1. Double-check `.env.local` exists
2. Verify API key is correct
3. No quotes or spaces
4. Restart server with `Ctrl+C` then `npm run dev`

---

### ❌ Error: "Invalid API key"

**What You'll See:**
```
Browser Console:
❌ Error fetching soccer odds: Invalid API key
```

**Fix:**
1. Go back to https://the-odds-api.com/account
2. Copy your API key again
3. Paste into `.env.local`
4. Make sure it's the full key with no spaces
5. Restart server

---

### ❌ No Matches Showing

**What You'll See:**
```
┌─────────────────────────────────────┐
│ Available Matches (0)               │
│                                     │
│     🏆 No matches found             │
│                                     │
│  Try adjusting your filters to      │
│  see more matches                   │
└─────────────────────────────────────┘
```

**Possible Reasons:**
1. **No matches scheduled today** - Check different day
2. **Filters too strict** - Adjust odds range
3. **API issue** - Check console for errors

---

### ✅ Success! Everything Working

**What You'll See:**

#### Header:
- ✅ Match count showing (e.g., "42 Matches")
- ✅ "Live Odds" indicator
- ✅ Refresh button clickable
- ✅ Last updated timestamp

#### Content:
- ✅ Multiple match cards displaying
- ✅ Odds showing for each match
- ✅ Different leagues visible
- ✅ Filters working on the left

#### Console:
- ✅ "Successfully fetched" messages
- ✅ API usage stats
- ✅ No red errors

---

## Features to Try 🎮

### 1. Filter Matches
```
Left Panel → Odds Range
- Adjust minimum: 1.2
- Adjust maximum: 3.0
- See matches update automatically
```

### 2. Select Bets
```
Match Card → Click "Add to Slip"
- Right panel shows selection
- Odds multiply together
- Total odds displayed
```

### 3. Generate Booking Code
```
Right Panel (Bet Slip)
- Select bookmaker
- Click "Generate Code"
- Copy code to clipboard
```

### 4. Manual Refresh
```
Header → Click "Refresh" button
- Spinner shows loading
- New odds fetched
- Last updated time changes
```

---

## API Usage Monitor 📊

### Where to Check Usage:

**Browser Console:**
```
API Requests - Used: 14, Remaining: 486
```

**The Odds API Dashboard:**
1. Go to https://the-odds-api.com/account
2. See usage graph
3. Monitor daily/monthly requests

**App Updates Every:**
- Auto: 5 minutes
- Manual: Click refresh button
- Each update = 7 requests (one per league)

---

## Quick Reference Card 📝

### URLs:
- **App**: http://localhost:3000
- **API Dashboard**: https://the-odds-api.com/account
- **API Docs**: https://the-odds-api.com/liveapi/guides/v4/

### Commands:
```bash
npm run dev     # Start server
Ctrl+C          # Stop server
F12             # Open console
```

### Files:
```
.env.local               # Your API key
QUICKSTART.md           # 5-min setup guide
ODDS_API_SETUP.md       # Full documentation
```

### Support:
- Console errors → Check `.env.local`
- No matches → Check filters
- Rate limit → Check dashboard

---

## 🎉 You Did It!

Your app is now fetching **LIVE SOCCER ODDS**!

**Next Steps:**
1. ⚽ Browse matches from 7 major leagues
2. 📊 Filter by odds and leagues
3. ✅ Add matches to your slip
4. 🎲 Generate booking codes

**Happy Betting! 🚀**
