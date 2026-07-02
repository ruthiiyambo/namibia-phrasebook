import { useEffect, useState } from 'react';
import { getDemoTranslations } from '@/lib/demo-data';
import { searchTranslations } from '@/lib/phrasebook';
import { Translation } from '@/lib/phrasebook-types';

export function useTranslations(languageCode: string, category?: string) {
  const [translations, setTranslations] = useState<Translation[]>(
    () => getDemoTranslations(languageCode, category),
  );

  useEffect(() => {
    setTranslations(getDemoTranslations(languageCode, category));
  }, [languageCode, category]);

  return {
    translations,
    loading: false,
    error: null,
    refetch: async () => undefined,
  };
}

export function useSearch(languageCode: string, query: string) {
  const {
    translations,
  } = useTranslations(languageCode);
  const [results, setResults] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let isActive = true;

    const timeout = setTimeout(() => {
      if (!isActive) return;

      setResults(searchTranslations(translations, query).slice(0, 30));
      setLoading(false);
    }, 200);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [languageCode, query, translations]);

  return {
    results,
    loading,
    error: null,
  };
}
