import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

if (
  process.env.EXPO_PUBLIC_SUPABASE_URL === undefined ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY === undefined
) {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is not set.\n' +
    'Copy .env.example to .env.local and fill in your Supabase project values.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,   // must be false for React Native
  },
});

// ── Types matching schema.sql ────────────────────────────────────────────────

export type Language = {
  id: string;
  code: string;
  name: string;
  flag_emoji: string | null;
  sort_order: number;
};

export type Translation = {
  id: string;
  concept_id: string;
  language_code: string;
  language_name: string;
  english_text: string;
  translated_text: string;
  pronunciation: string | null;
  audio_file: string | null;
  category: string;
  type: 'word' | 'phrase' | 'sentence';
  tier: 'free' | 'paid';
  difficulty: 'basic' | 'intermediate' | 'advanced' | null;
  word_count: number | null;
  notes: string | null;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: 'trip_pass' | 'monthly' | 'yearly' | 'lifetime';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_end: string | null;
};
