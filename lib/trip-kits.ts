import { Translation } from '@/lib/phrasebook-types';

export type TripKit = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  categories: string[];
  keywords: string[];
};

export const tripKits: TripKit[] = [
  {
    id: 'airport',
    title: 'Airport Arrival',
    emoji: '🛬',
    description: 'Landing, finding your ride, and getting oriented quickly.',
    categories: ['Transport', 'Directions', 'Time'],
    keywords: ['airport', 'flight', 'arrive', 'departure', 'ticket', 'luggage', 'passport', 'taxi'],
  },
  {
    id: 'taxi',
    title: 'Taxi & Combi',
    emoji: '🚕',
    description: 'Short phrases for drivers, stops, fares, and getting around town.',
    categories: ['Transport', 'Directions', 'Numbers'],
    keywords: ['taxi', 'combi', 'driver', 'stop', 'change', 'left', 'right', 'straight'],
  },
  {
    id: 'lodge',
    title: 'Lodge Stay',
    emoji: '🛏️',
    description: 'Check in, ask for room help, and settle into your stay.',
    categories: ['Accommodation', 'Food & Drink', 'Health'],
    keywords: ['room', 'bed', 'bathroom', 'blanket', 'shower', 'water', 'hotel', 'lodge'],
  },
  {
    id: 'market',
    title: 'Market Bargaining',
    emoji: '🛍️',
    description: 'Prices, payment, and everyday shopping conversations.',
    categories: ['Shopping', 'Numbers', 'Food & Drink'],
    keywords: ['how much', 'price', 'market', 'card', 'cash', 'buy', 'change', 'cheaper'],
  },
  {
    id: 'restaurant',
    title: 'Restaurant Table',
    emoji: '🍽️',
    description: 'Ordering food and drinks with the polite basics you need most.',
    categories: ['Food & Drink', 'Greetings'],
    keywords: ['water', 'food', 'drink', 'menu', 'tea', 'coffee', 'vegetarian', 'bill'],
  },
  {
    id: 'safari',
    title: 'Safari Day',
    emoji: '🦁',
    description: 'Wildlife names, guide talk, and practical park communication.',
    categories: ['Wildlife', 'Directions', 'Culture'],
    keywords: ['lion', 'elephant', 'zebra', 'giraffe', 'guide', 'photo', 'park', 'safari'],
  },
  {
    id: 'emergency',
    title: 'Emergency Help',
    emoji: '🚨',
    description: 'Urgent help, safety, and medical support phrases.',
    categories: ['Emergency', 'Health', 'Directions'],
    keywords: ['help', 'doctor', 'hospital', 'police', 'problem', 'pain', 'emergency'],
  },
  {
    id: 'elders',
    title: 'Greeting Elders',
    emoji: '🤝',
    description: 'Respectful greetings and cultural etiquette for first meetings.',
    categories: ['Greetings', 'Culture'],
    keywords: ['good morning', 'good afternoon', 'thank you', 'please', 'respect', 'elder', 'grandparent'],
  },
];

function normalizeText(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function scoreTripKitPhrase(item: Translation, tripKit: TripKit) {
  const content = [
    item.english_text,
    item.translated_text,
    item.pronunciation,
    item.category,
    item.notes,
  ].map((value) => normalizeText(value)).join(' ');

  let score = 0;

  if (tripKit.categories.includes(item.category)) {
    score += 55;
  }

  for (const keyword of tripKit.keywords) {
    const normalizedKeyword = normalizeText(keyword);

    if (content.includes(normalizedKeyword)) {
      score += normalizedKeyword.includes(' ') ? 24 : 14;
    }
  }

  if (item.difficulty === 'basic') {
    score += 8;
  }

  if (item.type === 'phrase') {
    score += 5;
  }

  return score;
}

function sortTripKitPhrases(left: Translation, right: Translation, scoreById: Map<string, number>) {
  return (
    (scoreById.get(right.id) ?? 0) - (scoreById.get(left.id) ?? 0)
    || left.english_text.localeCompare(right.english_text)
    || left.translated_text.localeCompare(right.translated_text)
  );
}

export function getTripKitPhrases(translations: Translation[], tripKit: TripKit, limit = 8) {
  const scoreById = new Map<string, number>();

  for (const item of translations) {
    scoreById.set(item.id, scoreTripKitPhrase(item, tripKit));
  }

  return translations
    .filter((item) => (scoreById.get(item.id) ?? 0) > 0)
    .sort((left, right) => sortTripKitPhrases(left, right, scoreById))
    .slice(0, limit);
}

function getDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function hashValue(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function getTodayTripKit(languageCode: string, date = new Date()) {
  const dayKey = getDayKey(date);
  const tripKitIndex = hashValue(`${languageCode}:${dayKey}`) % tripKits.length;

  return tripKits[tripKitIndex];
}

export function getQuickPracticeSessionKey(languageCode: string, tripKitId: string, date = new Date()) {
  return `${getDayKey(date)}:${languageCode}:${tripKitId}`;
}
