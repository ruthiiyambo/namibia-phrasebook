import { useEffect, useState, useCallback } from 'react';
import { supabase, Translation } from '@/lib/supabase';

export function useTranslations(languageCode: string, category?: string) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('phrase_card')
        .select('*')
        .eq('language_code', languageCode)
        .order('category')
        .order('concept_id');

      if (category) query = query.eq('category', category);

      const { data, error: err } = await query;
      if (err) throw err;
      setTranslations((data as Translation[]) ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load phrases');
    } finally {
      setLoading(false);
    }
  }, [languageCode, category]);

  useEffect(() => { fetch(); }, [fetch]);

  return { translations, loading, error, refetch: fetch };
}

export function useSearch(languageCode: string, query: string) {
  const [results, setResults] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);

    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('phrase_card')
        .select('*')
        .eq('language_code', languageCode)
        .or(`english_text.ilike.%${query}%,translated_text.ilike.%${query}%`)
        .limit(30);
      setResults((data as Translation[]) ?? []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [languageCode, query]);

  return { results, loading };
}
