import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'namibia_phrasebook_state_v1';
const RECENT_LIMIT = 24;

type StoredPhrasebookState = {
  favorites: string[];
  recent: string[];
  reported: string[];
  savedForTrip: string[];
  quickPractice: Record<string, string[]>;
};

type PhrasebookStateValue = StoredPhrasebookState & {
  hydrated: boolean;
  favoriteSet: Set<string>;
  recentSet: Set<string>;
  reportedSet: Set<string>;
  savedForTripSet: Set<string>;
  toggleFavorite: (phraseId: string) => void;
  toggleQuickPracticePhrase: (sessionKey: string, phraseId: string) => void;
  toggleSavedForTrip: (phraseId: string) => void;
  addRecent: (phraseId: string) => void;
  markReported: (phraseId: string) => void;
  resetQuickPractice: (sessionKey: string) => void;
  savePhrasesForTrip: (phraseIds: string[]) => void;
};

const defaultState: StoredPhrasebookState = {
  favorites: [],
  recent: [],
  reported: [],
  savedForTrip: [],
  quickPractice: {},
};

const PhrasebookStateContext = createContext<PhrasebookStateValue | null>(null);

function toUniqueStringArray(value: unknown, limit?: number) {
  if (!Array.isArray(value)) return [];

  const items = value.filter((item): item is string => typeof item === 'string');
  const uniqueItems = Array.from(new Set(items));

  if (typeof limit === 'number') {
    return uniqueItems.slice(0, limit);
  }

  return uniqueItems;
}

function sanitizeQuickPractice(value: unknown) {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string[]>>(
    (accumulator, [sessionKey, phraseIds]) => {
      accumulator[sessionKey] = toUniqueStringArray(phraseIds, 12);
      return accumulator;
    },
    {},
  );
}

function sanitizeState(value: unknown): StoredPhrasebookState {
  if (!value || typeof value !== 'object') {
    return defaultState;
  }

  const parsed = value as Partial<StoredPhrasebookState>;

  return {
    favorites: toUniqueStringArray(parsed.favorites),
    recent: toUniqueStringArray(parsed.recent, RECENT_LIMIT),
    reported: toUniqueStringArray(parsed.reported),
    savedForTrip: toUniqueStringArray(parsed.savedForTrip),
    quickPractice: sanitizeQuickPractice(parsed.quickPractice),
  };
}

function toggleListItem(items: string[], phraseId: string) {
  if (items.includes(phraseId)) {
    return items.filter((item) => item !== phraseId);
  }

  return [phraseId, ...items];
}

function prependRecent(items: string[], phraseId: string) {
  return [phraseId, ...items.filter((item) => item !== phraseId)].slice(0, RECENT_LIMIT);
}

export function PhrasebookStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredPhrasebookState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isActive = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((storedValue) => {
        if (!isActive || !storedValue) return;

        const parsedValue = JSON.parse(storedValue) as unknown;
        setState(sanitizeState(parsedValue));
      })
      .catch(() => undefined)
      .finally(() => {
        if (isActive) {
          setHydrated(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  const favoriteSet = useMemo(() => new Set(state.favorites), [state.favorites]);
  const recentSet = useMemo(() => new Set(state.recent), [state.recent]);
  const reportedSet = useMemo(() => new Set(state.reported), [state.reported]);
  const savedForTripSet = useMemo(() => new Set(state.savedForTrip), [state.savedForTrip]);

  const value: PhrasebookStateValue = {
    ...state,
    hydrated,
    favoriteSet,
    recentSet,
    reportedSet,
    savedForTripSet,
    toggleFavorite: (phraseId) => {
      setState((current) => ({
        ...current,
        favorites: toggleListItem(current.favorites, phraseId),
      }));
    },
    toggleQuickPracticePhrase: (sessionKey, phraseId) => {
      setState((current) => {
        const currentSession = current.quickPractice[sessionKey] ?? [];
        return {
          ...current,
          quickPractice: {
            ...current.quickPractice,
            [sessionKey]: toggleListItem(currentSession, phraseId),
          },
        };
      });
    },
    toggleSavedForTrip: (phraseId) => {
      setState((current) => ({
        ...current,
        savedForTrip: toggleListItem(current.savedForTrip, phraseId),
      }));
    },
    addRecent: (phraseId) => {
      setState((current) => ({
        ...current,
        recent: prependRecent(current.recent, phraseId),
      }));
    },
    markReported: (phraseId) => {
      setState((current) => ({
        ...current,
        reported: current.reported.includes(phraseId)
          ? current.reported
          : [phraseId, ...current.reported],
      }));
    },
    resetQuickPractice: (sessionKey) => {
      setState((current) => ({
        ...current,
        quickPractice: {
          ...current.quickPractice,
          [sessionKey]: [],
        },
      }));
    },
    savePhrasesForTrip: (phraseIds) => {
      const uniquePhraseIds = toUniqueStringArray(phraseIds);

      setState((current) => ({
        ...current,
        savedForTrip: [
          ...uniquePhraseIds.filter((phraseId) => !current.savedForTrip.includes(phraseId)),
          ...current.savedForTrip,
        ],
      }));
    },
  };

  return (
    <PhrasebookStateContext.Provider value={value}>
      {children}
    </PhrasebookStateContext.Provider>
  );
}

export function usePhrasebookState() {
  const context = useContext(PhrasebookStateContext);

  if (!context) {
    throw new Error('usePhrasebookState must be used within a PhrasebookStateProvider');
  }

  return context;
}
