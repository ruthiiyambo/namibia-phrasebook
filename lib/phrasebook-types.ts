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
