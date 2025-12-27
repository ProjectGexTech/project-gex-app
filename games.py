print("Script is running...")

import requests
from datetime import datetime, timedelta

# Your API Key
API_KEY = 'cca7ab698d5f3c2e8707fe8d8381fa1f'  # ✫ Replace this with your real key

# Config
SPORT = 'soccer_epl'       # You can change to other leagues
REGIONS = 'eu'             # European bookmakers
MARKETS = 'h2h,totals'  # Multiple betting markets
ODDS_FORMAT = 'decimal'
DATE_FORMAT = 'iso'

# Trusted bookmakers only
allowed_bookmakers = ["1xBet", "888sport"]

# Weekly date range (7 days from April 17)
start_date = datetime.strptime("2025-12-20", "%Y-%m-%d").date()
end_date = start_date + timedelta(days=6)

# API Request
url = f'https://api.the-odds-api.com/v4/sports/{SPORT}/odds/'
params = {
    'apiKey': API_KEY,
    'regions': REGIONS,
    'markets': MARKETS,
    'oddsFormat': ODDS_FORMAT,
    'dateFormat': DATE_FORMAT
}

response = requests.get(url, params=params)

print(f"\nStatus Code: {response.status_code}")
if response.status_code != 200:
    print(f"Failed to fetch data: {response.text}")
else:
    data = response.json()
    print(f"\nFound {len(data)} upcoming matches total.")
    print(f"Showing matches between {start_date} and {end_date} with odds between 1.6 and 5.0\n")

    match_count = 0
    display_count = 1
    for match in data:
        home = match['home_team']
        away = match['away_team']
        commence = match['commence_time']
        commence_dt = datetime.strptime(commence, "%Y-%m-%dT%H:%M:%SZ").date()

        if not (start_date <= commence_dt <= end_date):
            continue

        kickoff = datetime.strptime(commence, "%Y-%m-%dT%H:%M:%SZ")
        time_str = kickoff.strftime("%A, %b %d %Y at %I:%M %p UTC")

        for site in match['bookmakers']:
            site_name = site['title']
            if site_name not in allowed_bookmakers:
                continue

            printed_site = False
            for market in site['markets']:
                market_type = market['key']
                for outcome in market['outcomes']:
                    odds = outcome['price']
                    if 1.6 <= odds <= 1.8:
                        if not printed_site:
                            print(f"\n🔹 Match {display_count}")
                            print(f"   Teams     : {home} vs {away}")
                            print(f"   Date/Time : {time_str}")
                            print(f"   Bookmaker : {site_name}")
                            printed_site = True

                        # Describe the type of bet
                        if market_type == 'h2h':
                            bet_type = f"Winner: {outcome['name']}"
                        elif market_type == 'totals':
                            bet_type = f"Total Goals: {outcome['name']}"
                        elif market_type == 'double_chance':
                            bet_type = f"Double Chance: {outcome['name']}"
                        elif market_type == 'btts':
                            bet_type = f"Both Teams to Score: {outcome['name']}"
                        else:
                            bet_type = f"Other: {outcome['name']}"

                        print(f"   Bet Type  : {bet_type} @ {odds}")

            if printed_site:
                display_count += 1
                match_count += 1

    if match_count == 0:
        print("No matches found in the date range with requested odds and bookmakers.")


