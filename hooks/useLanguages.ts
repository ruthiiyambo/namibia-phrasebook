import { useMemo } from 'react';
import { demoLanguages } from '@/lib/demo-data';
import { Language } from '@/lib/phrasebook-types';

export function useLanguages() {
  const languages = useMemo(() => demoLanguages as Language[], []);

  return {
    languages,
    loading: false,
    error: null,
  };
}
