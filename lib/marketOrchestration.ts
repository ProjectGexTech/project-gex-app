import { BOOKMAKERS, getBookmakerByKey } from './bookmakersConfig';
import { getLeagueByKey, SportType } from './leagueConfig';
import { getAvailableMarketIdsBySport, getDefaultMarketIdsBySport } from './marketConfig';

export type MarketAvailabilityStatus = 'active' | 'limited' | 'unavailable';

export interface ExcludedMarketInfo {
  marketId: string;
  status: 'unavailable';
  reason: string;
}

export interface ResolveMarketsInput {
  selectedSport: SportType | null;
  selectedLeagueKeys: string[];
  selectedMarketIds: string[];
  selectedRegions: string[];
  selectedBookmakers: string[];
}

export interface ResolveMarketsOutput {
  requestedMarkets: string[];
  fallbackMarkets: string[];
  excludedMarkets: ExcludedMarketInfo[];
  marketStatuses: Record<string, MarketAvailabilityStatus>;
  marketsByLeague: Record<string, string[]>;
  fallbackMarketsByLeague: Record<string, string[]>;
  requestedCount: number;
  unavailableCount: number;
  debug: {
    sports: SportType[];
    bookmakerKeys: string[];
    leagueCount: number;
  };
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function getContextSports(selectedSport: SportType | null, selectedLeagueKeys: string[]): SportType[] {
  if (selectedSport) return [selectedSport];

  if (selectedLeagueKeys.length > 0) {
    const sportsFromLeagues = selectedLeagueKeys
      .map((leagueKey) => getLeagueByKey(leagueKey)?.sport)
      .filter((sport): sport is SportType => Boolean(sport));

    if (sportsFromLeagues.length > 0) {
      return unique(sportsFromLeagues);
    }
  }

  return ['football', 'basketball', 'americanfootball', 'baseball', 'icehockey', 'mma', 'rugby'];
}

function getContextBookmakers(selectedBookmakers: string[], selectedRegions: string[]) {
  if (selectedBookmakers.length > 0) {
    const explicitBookmakers = selectedBookmakers
      .map((key) => getBookmakerByKey(key))
      .filter((bookmaker): bookmaker is NonNullable<typeof bookmaker> => Boolean(bookmaker));

    if (explicitBookmakers.length > 0) {
      return explicitBookmakers;
    }
  }

  const regionSet = new Set(selectedRegions.length > 0 ? selectedRegions : ['uk', 'eu', 'us', 'au']);
  if (regionSet.has('all')) {
    return BOOKMAKERS;
  }

  const regionBookmakers = BOOKMAKERS.filter((bookmaker) => regionSet.has(bookmaker.region));
  return regionBookmakers.length > 0 ? regionBookmakers : BOOKMAKERS;
}

function intersectAll(sets: Set<string>[]): Set<string> {
  if (sets.length === 0) return new Set();
  const [first, ...rest] = sets;
  const out = new Set<string>();
  first.forEach((value) => {
    if (rest.every((set) => set.has(value))) {
      out.add(value);
    }
  });
  return out;
}

export function resolveMaxMarketsForSelection(input: ResolveMarketsInput): ResolveMarketsOutput {
  const sports = getContextSports(input.selectedSport, input.selectedLeagueKeys);
  const contextBookmakers = getContextBookmakers(input.selectedBookmakers, input.selectedRegions);

  const bySportRequested: Record<SportType, string[]> = {
    football: [],
    basketball: [],
    americanfootball: [],
    baseball: [],
    icehockey: [],
    mma: [],
    rugby: [],
  };

  const bySportFallback: Record<SportType, string[]> = {
    football: [],
    basketball: [],
    americanfootball: [],
    baseball: [],
    icehockey: [],
    mma: [],
    rugby: [],
  };

  const statusVotes = new Map<string, MarketAvailabilityStatus[]>();

  sports.forEach((sport) => {
    const supportedIds = getAvailableMarketIdsBySport(sport);

    const bookmakerMarketSets = contextBookmakers.map((bookmaker) => new Set(bookmaker.markets));
    const marketsSupportedByAnyBookmaker = unique(contextBookmakers.flatMap((bookmaker) => bookmaker.markets));
    const marketsSupportedByAllBookmakers = Array.from(intersectAll(bookmakerMarketSets));

    const anySet = new Set(marketsSupportedByAnyBookmaker);
    const allSet = new Set(marketsSupportedByAllBookmakers);

    const validForContext = supportedIds.filter((marketId) => anySet.has(marketId));

    bySportRequested[sport] = validForContext;

    const sportDefaults = getDefaultMarketIdsBySport(sport).filter((marketId) => anySet.has(marketId));
    bySportFallback[sport] = sportDefaults.length > 0 ? sportDefaults : validForContext.slice(0, 2);

    supportedIds.forEach((marketId) => {
      const status: MarketAvailabilityStatus = !anySet.has(marketId)
        ? 'unavailable'
        : allSet.has(marketId)
          ? 'active'
          : 'limited';

      const prev = statusVotes.get(marketId) || [];
      prev.push(status);
      statusVotes.set(marketId, prev);
    });
  });

  const marketStatuses: Record<string, MarketAvailabilityStatus> = {};
  statusVotes.forEach((votes, marketId) => {
    if (votes.every((vote) => vote === 'active')) {
      marketStatuses[marketId] = 'active';
      return;
    }
    if (votes.some((vote) => vote === 'limited' || vote === 'active')) {
      marketStatuses[marketId] = 'limited';
      return;
    }
    marketStatuses[marketId] = 'unavailable';
  });

  const requestedMarkets = unique(sports.flatMap((sport) => bySportRequested[sport]));
  const fallbackMarkets = unique(sports.flatMap((sport) => bySportFallback[sport]));

  const unavailableSelected = input.selectedMarketIds.filter((marketId) => marketStatuses[marketId] === 'unavailable');
  const excludedMarkets: ExcludedMarketInfo[] = unavailableSelected.map((marketId) => ({
    marketId,
    status: 'unavailable',
    reason: 'Unavailable for the selected sport/bookmaker/region combination',
  }));

  const marketsByLeague: Record<string, string[]> = {};
  const fallbackMarketsByLeague: Record<string, string[]> = {};

  input.selectedLeagueKeys.forEach((leagueKey) => {
    const league = getLeagueByKey(leagueKey);
    const sport = league?.sport ?? input.selectedSport ?? sports[0] ?? 'football';
    const requested = bySportRequested[sport];
    const fallback = bySportFallback[sport];

    marketsByLeague[leagueKey] = requested.length > 0 ? requested : fallback;
    fallbackMarketsByLeague[leagueKey] = fallback;
  });

  return {
    requestedMarkets,
    fallbackMarkets,
    excludedMarkets,
    marketStatuses,
    marketsByLeague,
    fallbackMarketsByLeague,
    requestedCount: requestedMarkets.length,
    unavailableCount: excludedMarkets.length,
    debug: {
      sports,
      bookmakerKeys: contextBookmakers.map((bookmaker) => bookmaker.key),
      leagueCount: input.selectedLeagueKeys.length,
    },
  };
}
