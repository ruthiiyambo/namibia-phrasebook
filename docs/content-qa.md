# Content QA

Generated from `namibian_phrasebook_updated.xlsx` by `scripts/audit_demo_data.py`.

## Summary

### Afrikaans

- Valid rows: 188
- Categories present: 13 / 13
- Largest category: Greetings (29 phrases)

| Category | Count |
| --- | ---: |
| Greetings | 29 |
| Emergency | 7 |
| Directions | 14 |
| Food & Drink | 22 |
| Shopping | 11 |
| Transport | 9 |
| Accommodation | 4 |
| Wildlife | 13 |
| Numbers | 18 |
| Health | 9 |
| Culture | 27 |
| Time | 17 |
| Colors | 8 |

### Oshiwambo

- Valid rows: 448
- Categories present: 13 / 13
- Largest category: Culture (154 phrases)

| Category | Count |
| --- | ---: |
| Greetings | 48 |
| Emergency | 8 |
| Directions | 14 |
| Food & Drink | 62 |
| Shopping | 24 |
| Transport | 24 |
| Accommodation | 4 |
| Wildlife | 25 |
| Numbers | 20 |
| Health | 34 |
| Culture | 154 |
| Time | 22 |
| Colors | 9 |

### Nama-Damara

- Valid rows: 233
- Categories present: 12 / 13
- Largest category: Culture (70 phrases)
- Missing categories: Accommodation

| Category | Count |
| --- | ---: |
| Greetings | 28 |
| Emergency | 2 |
| Directions | 15 |
| Food & Drink | 30 |
| Shopping | 10 |
| Transport | 5 |
| Wildlife | 16 |
| Numbers | 15 |
| Health | 19 |
| Culture | 70 |
| Time | 17 |
| Colors | 6 |

## Findings

### Afrikaans

- Exact duplicate rows: 0
- Same English with multiple translations or category placements: 0
- Same translation reused for multiple meanings: 1
- Notes normalized before display: 0
- Provenance or editorial notes still living in the workbook: 0

#### Same translation, multiple meanings

- Verskoon my
  - row 35 | C108 | Excuse me | Greetings | phrase
  - row 134 | C242 | Excuse me / I'm sorry | Culture | phrase

### Oshiwambo

- Exact duplicate rows: 0
- Same English with multiple translations or category placements: 0
- Same translation reused for multiple meanings: 12
- Notes normalized before display: 0
- Provenance or editorial notes still living in the workbook: 0

#### Same translation, multiple meanings

- Fikama
  - row 291 | C463 | Stop (verb) | Transport | word
  - row 397 | C572 | Stand up | Culture | word
- Hasho?
  - row 145 | C281 | Is that so? / Really? | Culture | phrase
  - row 419 | C594 | Is that so? / Is it not? | Culture | phrase
- Kala po nawa
  - row 22 | C100 | Goodbye | Greetings | phrase
  - row 111 | C233 | Stay well | Greetings | phrase
- Nangala po nawa
  - row 23 | C101 | Good night | Greetings | phrase
  - row 207 | C377 | Sleep well (to someone staying) | Greetings | phrase
- Onda kuta
  - row 93 | C215 | I’m full | Food & Drink | sentence
  - row 115 | C240 | I'm full | Food & Drink | sentence
  - row 219 | C390 | I am full / satisfied | Food & Drink | sentence
- Ondjuwo
  - row 53 | C138 | Room | Accommodation | word
  - row 429 | C608 | House / Hut | Accommodation | word
- Ongolo
  - row 56 | C141 | Zebra | Wildlife | word
  - row 315 | C487 | Knee | Health | word
- Ongombe
  - row 185 | C341 | Cow | Wildlife | word
  - row 435 | C616 | Cattle / Cow | Culture | word
- Ongula
  - row 165 | C303 | Tomorrow | Time | word
  - row 200 | C370 | Morning | Greetings | word
- Oshi li nawa
  - row 31 | C110 | You're welcome | Greetings | phrase
  - row 107 | C229 | It is going well | Culture | phrase
- Oshimaliwa
  - row 16 | C015 | Left | Directions | word
  - row 47 | C131 | Money | Shopping | word
- Ove
  - row 210 | C380 | You (singular) | Culture | word
  - row 447 | C628 | They / Them | Culture | word

### Nama-Damara

- Exact duplicate rows: 0
- Same English with multiple translations or category placements: 0
- Same translation reused for multiple meanings: 0
- Notes normalized before display: 0
- Provenance or editorial notes still living in the workbook: 0

## Cross-language concept ID warning

The workbook does not currently use one shared concept map across all three language sheets.
The same `concept_id` often points at different English phrases in different sheets, so it is safe
to treat `concept_id` as sheet-local metadata for now.

Examples:

- C002: Afrikaans: Good evening (Greetings); Oshiwambo: Good evening (Greetings); Nama-Damara: Good afternoon (Greetings)
- C003: Afrikaans: Hello (Greetings); Oshiwambo: Hello (Greetings); Nama-Damara: Good evening (Greetings)
- C004: Afrikaans: Thank you (Greetings); Oshiwambo: Thank you (Greetings); Nama-Damara: Morning (informal) (Greetings)
- C005: Afrikaans: Thank you very much (Greetings); Oshiwambo: Thank you very much (Greetings); Nama-Damara: Good afternoon (informal) (Greetings)
- C006: Afrikaans: Please (Greetings); Oshiwambo: Please (Greetings); Nama-Damara: Good evening (informal) (Greetings)
- C007: Afrikaans: Yes (Greetings); Oshiwambo: Yes (Greetings); Nama-Damara: How are you? (Greetings)
- C008: Afrikaans: No (Greetings); Oshiwambo: No (Greetings); Nama-Damara: What's up? (Greetings)
- C009: Afrikaans: Help! (Emergency); Oshiwambo: Help! (Emergency); Nama-Damara: I am fine (Greetings)
- C010: Afrikaans: I need a doctor (Emergency); Oshiwambo: I need a doctor (Emergency); Nama-Damara: And you? (Greetings)
- C011: Afrikaans: Call the police (Emergency); Oshiwambo: Call the police (Emergency); Nama-Damara: My name is ... (Greetings)
- C012: Afrikaans: Where is the bathroom? (Directions); Oshiwambo: Where is the bathroom? (Directions); Nama-Damara: What is your name? (Greetings)
- C013: Afrikaans: How much does this cost? (Shopping); Oshiwambo: How much does this cost? (Shopping); Nama-Damara: Where are you from? (Greetings)

## Recommended workbook fixes

1. The workbook no longer has same-English variant collisions; the remaining cleanup is mostly about meaning and category clarity.
2. Review phrases that share one translation across multiple meanings to make sure each entry is intentionally distinct rather than an accidental duplicate.
3. Fill the missing category coverage that still remains, especially: Nama-Damara.
4. Confirm category placement for entries that still span multiple contexts, such as House / Hut, Cow / Cattle, and any remaining animal-vs-food distinctions.
5. If you want cross-language switching to land on equivalent phrases later, rebuild the workbook so `concept_id` means the same concept in every language sheet.

_Exact duplicate rows have been cleaned from the workbook._

_Provenance and internal planning notes have been cleaned out of the workbook display fields._

_Same-English variant collisions have been disambiguated into clearer learner-facing labels._
