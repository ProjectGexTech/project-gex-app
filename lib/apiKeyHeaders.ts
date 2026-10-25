import { useAPIKeysStore } from './apiKeysStore';
import { ODDS_KEY_HEADER, FOOTBALL_KEY_HEADER } from './apiKeyHeaderNames';

/** The entered keys as request headers; empty when none are entered (the server may have its own) */
export function apiKeyHeaders(): Record<string, string> {
  const { oddsApiKey, footballApiKey } = useAPIKeysStore.getState();
  const headers: Record<string, string> = {};
  if (oddsApiKey) headers[ODDS_KEY_HEADER] = oddsApiKey;
  if (footballApiKey) headers[FOOTBALL_KEY_HEADER] = footballApiKey;
  return headers;
}
