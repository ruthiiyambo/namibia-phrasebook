import { DemoCategory } from '@/lib/demo-data';
import { Translation } from '@/lib/phrasebook-types';

export type CategorySummary = DemoCategory & {
  count: number;
};

const FALLBACK_CATEGORY_DESCRIPTION = 'Useful travel phrases for this situation.';

function normalizeText(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function scoreField(field: string, query: string) {
  if (!field) return 0;
  if (field === query) return 120;
  if (field.startsWith(query)) return 80;
  if (field.includes(query)) return 40;
  return 0;
}

function scoreTranslation(item: Translation, query: string, queryTerms: string[]) {
  const english = normalizeText(item.english_text);
  const translation = normalizeText(item.translated_text);
  const pronunciation = normalizeText(item.pronunciation);
  const category = normalizeText(item.category);
  const notes = normalizeText(item.notes);
  const haystack = [english, translation, pronunciation, category, notes].join(' ');

  let score = 0;

  score += scoreField(english, query) * 3;
  score += scoreField(translation, query) * 4;
  score += scoreField(pronunciation, query) * 2;
  score += scoreField(category, query);
  score += scoreField(notes, query);

  if (queryTerms.length > 1 && queryTerms.every((term) => haystack.includes(term))) {
    score += 25;
  }

  return score;
}

export function buildCategorySummaries(
  translations: Translation[],
  categories: DemoCategory[],
): CategorySummary[] {
  const categoryLookup = new Map(categories.map((category) => [category.name, category]));
  const countByCategory = new Map<string, number>();

  for (const item of translations) {
    const name = item.category.trim() || 'General';
    countByCategory.set(name, (countByCategory.get(name) ?? 0) + 1);
  }

  return Array.from(countByCategory.entries())
    .map(([name, count]) => {
      const knownCategory = categoryLookup.get(name);

      return {
        name,
        description: knownCategory?.description ?? FALLBACK_CATEGORY_DESCRIPTION,
        sort_order: knownCategory?.sort_order ?? categories.length + 100,
        count,
      };
    })
    .sort((left, right) => (
      left.sort_order - right.sort_order
      || left.name.localeCompare(right.name)
    ));
}

export function searchTranslations(translations: Translation[], rawQuery: string) {
  const query = normalizeText(rawQuery).trim();
  if (!query) return [];

  const queryTerms = query.split(/\s+/).filter(Boolean);

  return translations
    .map((item) => ({
      item,
      score: scoreTranslation(item, query, queryTerms),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => (
      right.score - left.score
      || left.item.english_text.localeCompare(right.item.english_text)
      || left.item.translated_text.localeCompare(right.item.translated_text)
    ))
    .map((entry) => entry.item);
}
