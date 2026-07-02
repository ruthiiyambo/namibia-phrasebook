#!/usr/bin/env python3

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
import sys
import zipfile

import generate_demo_data as generator


WORKBOOK_PATH = Path("namibian_phrasebook_updated.xlsx")
OUTPUT_PATH = Path("docs/content-qa.md")
LANGUAGE_SHEETS = [
    ("Afrikaans", "xl/worksheets/sheet1.xml"),
    ("Oshiwambo", "xl/worksheets/sheet2.xml"),
    ("Nama-Damara", "xl/worksheets/sheet3.xml"),
]
NOTE_RISK_MARKERS = (
    "from guide",
    "always free",
    "keep emergency free",
    "tourists love this",
    "added from researched",
)


@dataclass(frozen=True)
class RowRef:
    row_number: int
    concept_id: str
    english: str
    translation: str
    category: str
    phrase_type: str
    notes: str


def load_workbook_rows() -> tuple[dict[str, list[RowRef]], list[str]]:
    if not WORKBOOK_PATH.exists():
        raise SystemExit(f"Workbook not found: {WORKBOOK_PATH}")

    language_rows: dict[str, list[RowRef]] = {}

    with zipfile.ZipFile(WORKBOOK_PATH) as archive:
        strings = generator.get_shared_strings(archive)
        category_rows = generator.parse_sheet_rows(
            archive,
            "xl/worksheets/sheet4.xml",
            strings,
        )
        categories = [
            row.get("category", "").strip()
            for row in category_rows
            if row.get("category", "").strip()
        ]

        for language_name, sheet_path in LANGUAGE_SHEETS:
            rows = generator.parse_sheet_rows(archive, sheet_path, strings)
            parsed: list[RowRef] = []
            for row_number, row in enumerate(rows, start=2):
                concept_id = row.get("id", "").strip()
                english = row.get("english", "").strip()
                translation = row.get("translation", "").strip()

                if not concept_id or not english or not translation:
                    continue

                parsed.append(
                    RowRef(
                        row_number=row_number,
                        concept_id=concept_id,
                        english=english,
                        translation=translation,
                        category=row.get("category", "").strip() or "General",
                        phrase_type=row.get("type", "").strip() or "word",
                        notes=row.get("notes", "").strip(),
                    )
                )

            language_rows[language_name] = parsed

    return language_rows, categories


def format_row(item: RowRef) -> str:
    note_suffix = f" | note: {item.notes}" if item.notes else ""
    return (
        f"- row {item.row_number} | {item.concept_id} | {item.english} -> "
        f"{item.translation} | {item.category} | {item.phrase_type}{note_suffix}"
    )


def find_exact_duplicates(rows: list[RowRef]) -> list[list[RowRef]]:
    groups: dict[tuple[str, str, str], list[RowRef]] = defaultdict(list)

    for item in rows:
        key = (
            item.english.casefold(),
            item.translation.casefold(),
            item.category.casefold(),
        )
        groups[key].append(item)

    return sorted(
        (group for group in groups.values() if len(group) > 1),
        key=lambda group: (group[0].english.casefold(), group[0].translation.casefold()),
    )


def find_same_english_variants(rows: list[RowRef]) -> list[tuple[str, list[RowRef]]]:
    groups: dict[str, list[RowRef]] = defaultdict(list)
    issues: list[tuple[str, list[RowRef]]] = []

    for item in rows:
        groups[item.english.casefold()].append(item)

    for key, group in groups.items():
        variants = {(item.translation.casefold(), item.category.casefold()) for item in group}
        if len(variants) > 1:
            issues.append((key, sorted(group, key=lambda item: item.row_number)))

    return sorted(issues, key=lambda pair: pair[0])


def find_same_translation_variants(rows: list[RowRef]) -> list[tuple[str, list[RowRef]]]:
    groups: dict[str, list[RowRef]] = defaultdict(list)
    issues: list[tuple[str, list[RowRef]]] = []

    for item in rows:
        groups[item.translation.casefold()].append(item)

    for key, group in groups.items():
        meanings = {(item.english.casefold(), item.category.casefold()) for item in group}
        if len(meanings) > 1:
            issues.append((key, sorted(group, key=lambda item: item.row_number)))

    return sorted(issues, key=lambda pair: pair[0])


def analyze_notes(rows: list[RowRef]) -> tuple[int, int, list[tuple[RowRef, str]]]:
    changed: list[tuple[RowRef, str]] = []
    risky: list[tuple[RowRef, str]] = []

    for item in rows:
        cleaned = generator.clean_note(item.notes or "")
        raw = item.notes.strip()
        normalized_cleaned = cleaned or ""
        if raw and normalized_cleaned != raw:
            changed.append((item, normalized_cleaned))
        if raw and any(marker in raw.casefold() for marker in NOTE_RISK_MARKERS):
            risky.append((item, normalized_cleaned))

    samples = risky[:12] if risky else changed[:12]
    return len(changed), len(risky), samples


def find_concept_id_collisions(language_rows: dict[str, list[RowRef]]) -> list[str]:
    by_id: dict[str, list[tuple[str, RowRef]]] = defaultdict(list)

    for language_name, rows in language_rows.items():
        for item in rows:
            by_id[item.concept_id].append((language_name, item))

    collisions: list[str] = []
    for concept_id, entries in sorted(by_id.items()):
        english_values = {item.english for _, item in entries}
        if len(english_values) > 1:
            details = "; ".join(
                f"{language_name}: {item.english} ({item.category})"
                for language_name, item in entries
            )
            collisions.append(f"- {concept_id}: {details}")

    return collisions[:12]


def build_report() -> str:
    language_rows, categories = load_workbook_rows()
    category_set = set(categories)
    total_exact_duplicates = 0
    total_risky_notes = 0
    total_english_variants = 0
    total_translation_variants = 0
    languages_missing_categories: list[str] = []

    lines: list[str] = [
        "# Content QA",
        "",
        "Generated from `namibian_phrasebook_updated.xlsx` by `scripts/audit_demo_data.py`.",
        "",
        "## Summary",
        "",
    ]

    for language_name, rows in language_rows.items():
        counts = Counter(item.category for item in rows)
        missing_categories = [category for category in categories if category not in counts]
        dominant = counts.most_common(1)[0]

        lines.append(f"### {language_name}")
        lines.append("")
        lines.append(f"- Valid rows: {len(rows)}")
        lines.append(f"- Categories present: {len(counts)} / {len(categories)}")
        lines.append(f"- Largest category: {dominant[0]} ({dominant[1]} phrases)")
        if missing_categories:
            lines.append(f"- Missing categories: {', '.join(missing_categories)}")
            languages_missing_categories.append(language_name)
        lines.append("")

        lines.append("| Category | Count |")
        lines.append("| --- | ---: |")
        for category in categories:
            if category in counts:
                lines.append(f"| {category} | {counts[category]} |")
        lines.append("")

    lines.extend(
        [
            "## Findings",
            "",
        ]
    )

    for language_name, rows in language_rows.items():
        exact_duplicates = find_exact_duplicates(rows)
        english_variants = find_same_english_variants(rows)
        translation_variants = find_same_translation_variants(rows)
        cleaned_count, risky_note_count, cleaned_examples = analyze_notes(rows)
        total_exact_duplicates += len(exact_duplicates)
        total_risky_notes += risky_note_count
        total_english_variants += len(english_variants)
        total_translation_variants += len(translation_variants)

        lines.append(f"### {language_name}")
        lines.append("")
        lines.append(f"- Exact duplicate rows: {len(exact_duplicates)}")
        lines.append(f"- Same English with multiple translations or category placements: {len(english_variants)}")
        lines.append(f"- Same translation reused for multiple meanings: {len(translation_variants)}")
        lines.append(f"- Notes normalized before display: {cleaned_count}")
        lines.append(f"- Provenance or editorial notes still living in the workbook: {risky_note_count}")
        lines.append("")

        if exact_duplicates:
            lines.append("#### Exact duplicates")
            lines.append("")
            for group in exact_duplicates:
                for item in group:
                    lines.append(format_row(item))
                lines.append("")

        if english_variants:
            lines.append("#### Same English, multiple variants")
            lines.append("")
            for _, group in english_variants[:12]:
                lines.append(f"- {group[0].english}")
                for item in group:
                    lines.append(
                        f"  - row {item.row_number} | {item.concept_id} | {item.translation} | "
                        f"{item.category} | {item.phrase_type}"
                    )
            lines.append("")

        if translation_variants:
            lines.append("#### Same translation, multiple meanings")
            lines.append("")
            for _, group in translation_variants[:12]:
                lines.append(f"- {group[0].translation}")
                for item in group:
                    lines.append(
                        f"  - row {item.row_number} | {item.concept_id} | {item.english} | "
                        f"{item.category} | {item.phrase_type}"
                    )
            lines.append("")

        if cleaned_examples:
            lines.append("#### Note cleanup examples")
            lines.append("")
            for item, cleaned in cleaned_examples:
                lines.append(
                    f"- row {item.row_number} | {item.concept_id} | raw: {item.notes!r} | "
                    f"cleaned: {cleaned!r}"
                )
            lines.append("")

    concept_id_collisions = find_concept_id_collisions(language_rows)
    if concept_id_collisions:
        lines.extend(
            [
                "## Cross-language concept ID warning",
                "",
                "The workbook does not currently use one shared concept map across all three language sheets.",
                "The same `concept_id` often points at different English phrases in different sheets, so it is safe",
                "to treat `concept_id` as sheet-local metadata for now.",
                "",
                "Examples:",
                "",
            ]
        )
        lines.extend(concept_id_collisions)
        lines.append("")

    recommendations: list[str] = []
    if total_english_variants:
        recommendations.append(
            "Decide which remaining same-English variants should stay as separate learner-facing entries and which should be collapsed."
        )
    else:
        recommendations.append(
            "The workbook no longer has same-English variant collisions; the remaining cleanup is mostly about meaning and category clarity."
        )

    if total_translation_variants:
        recommendations.append(
            "Review phrases that share one translation across multiple meanings to make sure each entry is intentionally distinct rather than an accidental duplicate."
        )

    if languages_missing_categories:
        recommendations.append(
            f"Fill the missing category coverage that still remains, especially: {', '.join(sorted(set(languages_missing_categories)))}."
        )

    recommendations.append(
        "Confirm category placement for entries that still span multiple contexts, such as House / Hut, Cow / Cattle, and any remaining animal-vs-food distinctions."
    )

    if concept_id_collisions:
        recommendations.append(
            "If you want cross-language switching to land on equivalent phrases later, rebuild the workbook so `concept_id` means the same concept in every language sheet."
        )

    lines.extend(
        [
            "## Recommended workbook fixes",
            "",
        ]
    )
    for index, item in enumerate(recommendations, start=1):
        lines.append(f"{index}. {item}")
    lines.append("")

    if total_exact_duplicates == 0:
        lines.append("_Exact duplicate rows have been cleaned from the workbook._")
        lines.append("")

    if total_risky_notes == 0:
        lines.append("_Provenance and internal planning notes have been cleaned out of the workbook display fields._")
        lines.append("")

    if total_english_variants == 0:
        lines.append("_Same-English variant collisions have been disambiguated into clearer learner-facing labels._")
        lines.append("")

    if not languages_missing_categories:
        lines.append("_Every language sheet currently covers all defined categories._")
        lines.append("")

    # Guardrail in case the categories sheet drifts.
    unknown_categories = sorted(
        {
            item.category
            for rows in language_rows.values()
            for item in rows
            if item.category not in category_set
        }
    )
    if unknown_categories:
        lines.append(f"_Unexpected categories found:_ {', '.join(unknown_categories)}")
        lines.append("")

    return "\n".join(lines)


def main() -> None:
    report = build_report()
    OUTPUT_PATH.write_text(report, encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    sys.exit(main())
