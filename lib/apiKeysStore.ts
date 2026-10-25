import { create } from 'zustand';

// API keys typed into the app. Kept in sessionStorage (gone when the tab closes)
// or, if the user ticks "Remember on this device", in localStorage.

const STORAGE_KEY = 'gexten_api_keys';

interface StoredKeys {
  oddsApiKey: string;
  footballApiKey: string;
}

interface APIKeysStore extends StoredKeys {
  remember: boolean;
  loaded: boolean;
  isModalOpen: boolean;
  load: () => void;
  save: (keys: StoredKeys, remember: boolean) => void;
  clear: () => void;
  openModal: () => void;
  closeModal: () => void;
}

const read = (storage: Storage): StoredKeys | null => {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const removeEverywhere = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: nothing to remove
  }
};

export const useAPIKeysStore = create<APIKeysStore>((set) => ({
  oddsApiKey: '',
  footballApiKey: '',
  remember: false,
  loaded: false,
  isModalOpen: false,

  load: () => {
    if (typeof window === 'undefined') return;
    const session = read(sessionStorage);
    const remembered = session ? null : read(localStorage);
    const keys = session ?? remembered;
    set({
      oddsApiKey: keys?.oddsApiKey ?? '',
      footballApiKey: keys?.footballApiKey ?? '',
      remember: remembered !== null,
      loaded: true,
    });
  },

  save: (keys, remember) => {
    removeEverywhere();
    try {
      (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch {
      // Storage blocked: the keys still work until the page is reloaded
    }
    set({ ...keys, remember, isModalOpen: false });
  },

  clear: () => {
    removeEverywhere();
    set({ oddsApiKey: '', footballApiKey: '', remember: false });
  },

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
