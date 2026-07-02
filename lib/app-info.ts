import { Translation } from '@/lib/phrasebook-types';

export const AppInfo = {
  name: 'Namibia Phrasebook',
  tagline: 'Practical travel phrases for everyday moments across Namibia.',
  summary:
    'Browse useful phrases in Afrikaans, Oshiwambo, and Nama-Damara for greetings, food, transport, directions, health, and local etiquette.',
  offlineNote:
    'Works offline after installation. The launch build ships with workbook-backed phrases bundled into the app.',
  supportEmail: 'support@namibiaphrasebook.app',
  supportSubject: 'Namibia Phrasebook support',
  supportNote:
    'Use this inbox for launch feedback, phrase corrections, or install issues. Update it before submission if you plan to use a different public support address.',
  privacyHighlights: [
    'No account is required in this guest-first launch build.',
    'The phrase content is bundled into the app instead of depending on live user accounts.',
    'The current v1 build does not include ads, purchases, or analytics.',
    'If a later release adds accounts, payments, or tracking, update the policy and store disclosures before release.',
  ],
} as const;

export function getSupportMailtoUrl() {
  const subject = encodeURIComponent(AppInfo.supportSubject);
  return `mailto:${AppInfo.supportEmail}?subject=${subject}`;
}

export function getPhraseReportMailtoUrl(item: Translation) {
  const subject = encodeURIComponent(`${AppInfo.name} phrase feedback: ${item.english_text}`);
  const body = encodeURIComponent([
    'Hello, I would like to suggest a correction or note for this phrase:',
    '',
    `Language: ${item.language_name}`,
    `Category: ${item.category}`,
    `English: ${item.english_text}`,
    `Local phrase: ${item.translated_text}`,
    `Pronunciation: ${item.pronunciation ?? 'n/a'}`,
    `Usage note: ${item.notes ?? 'n/a'}`,
    '',
    'Suggested correction or comment:',
    '',
  ].join('\n'));

  return `mailto:${AppInfo.supportEmail}?subject=${subject}&body=${body}`;
}
