import { create } from 'zustand';

interface APIKeysStore {
  oddsApiKey: string | null;
  footballApiKey: string | null;
  isConfigured: boolean;
  
  setOddsApiKey: (key: string) => void;
  setFootballApiKey: (key: string) => void;
  setApiKeys: (oddsKey: string, footballKey: string) => void;
  clearApiKeys: () => void;
  loadApiKeysFromStorage: () => void;
}

// Load API keys from localStorage
const loadKeysFromStorage = () => {
  if (typeof window === 'undefined') return { oddsKey: null, footballKey: null };
  
  try {
    const oddsKey = localStorage.getItem('gexten_odds_api_key');
    const footballKey = localStorage.getItem('gexten_football_api_key');
    return { oddsKey, footballKey };
  } catch (error) {
    console.error('Error loading API keys from storage:', error);
    return { oddsKey: null, footballKey: null };
  }
};

// Save API keys to localStorage
const saveKeysToStorage = (oddsKey: string, footballKey: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('gexten_odds_api_key', oddsKey);
    localStorage.setItem('gexten_football_api_key', footballKey);
  } catch (error) {
    console.error('Error saving API keys to storage:', error);
  }
};

// Clear API keys from localStorage
const clearKeysFromStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('gexten_odds_api_key');
    localStorage.removeItem('gexten_football_api_key');
  } catch (error) {
    console.error('Error clearing API keys from storage:', error);
  }
};

export const useAPIKeysStore = create<APIKeysStore>((set, get) => ({
  oddsApiKey: null,
  footballApiKey: null,
  isConfigured: false,
  
  setOddsApiKey: (key: string) => {
    set({ oddsApiKey: key });
    const { footballApiKey } = get();
    if (footballApiKey) {
      saveKeysToStorage(key, footballApiKey);
      set({ isConfigured: true });
    }
  },
  
  setFootballApiKey: (key: string) => {
    set({ footballApiKey: key });
    const { oddsApiKey } = get();
    if (oddsApiKey) {
      saveKeysToStorage(oddsApiKey, key);
      set({ isConfigured: true });
    }
  },
  
  setApiKeys: (oddsKey: string, footballKey: string) => {
    set({ 
      oddsApiKey: oddsKey, 
      footballApiKey: footballKey,
      isConfigured: true
    });
    saveKeysToStorage(oddsKey, footballKey);
  },
  
  clearApiKeys: () => {
    set({ 
      oddsApiKey: null, 
      footballApiKey: null,
      isConfigured: false
    });
    clearKeysFromStorage();
  },
  
  loadApiKeysFromStorage: () => {
    const { oddsKey, footballKey } = loadKeysFromStorage();
    if (oddsKey && footballKey) {
      set({ 
        oddsApiKey: oddsKey, 
        footballApiKey: footballKey,
        isConfigured: true
      });
    }
  },
}));
