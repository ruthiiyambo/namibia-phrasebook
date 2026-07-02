#!/usr/bin/env python3

from __future__ import annotations

import zipfile
from pathlib import Path

import generate_demo_data as generator


WORKBOOK_PATH = Path("namibian_phrasebook_updated.xlsx")
KNOWN_TYPES = {"word", "phrase", "sentence"}
KNOWN_TIERS = {"free", "paid"}
KNOWN_DIFFICULTIES = {"basic", "intermediate", "advanced"}
MAX_ISSUES = 25


def add_issue(issues: list[str], message: str) -> None:
    if len(issues) < MAX_ISSUES:
        issues.append(message)


def main() -> None:
    if not WORKBOOK_PATH.exists():
        raise SystemExit(f"Workbook not found: {WORKBOOK_PATH}")

    issues: list[str] = []
    summary: list[str] = []

    with zipfile.ZipFile(WORKBOOK_PATH) as archive:
        strings = generator.get_shared_strings(archive)

        category_rows = generator.parse_sheet_rows(
            archive,
            "xl/worksheets/sheet4.xml",
            strings,
        )
        known_categories = {
            row.get("category", "").strip()
            for row in category_rows
            if row.get("category", "").strip()
        }

        if not known_categories:
            add_issue(issues, "No category definitions were found in sheet4.")

        language_sheets = [
            ("Afrikaans", "xl/worksheets/sheet1.xml"),
            ("Oshiwambo", "xl/worksheets/sheet2.xml"),
            ("Nama-Damara", "xl/worksheets/sheet3.xml"),
        ]

        for sheet_name, sheet_path in language_sheets:
            rows = generator.parse_sheet_rows(archive, sheet_path, strings)
            seen_ids: set[str] = set()
            valid_rows = 0

            for row_number, row in enumerate(rows, start=2):
                concept_id = row.get("id", "").strip()
                english = row.get("english", "").strip()
                translation = row.get("translation", "").strip()
                category = row.get("category", "").strip()
                phrase_type = row.get("type", "").strip()
                tier = row.get("tier", "").strip()
                difficulty = row.get("difficulty", "").strip()

                if not concept_id:
                    add_issue(issues, f"{sheet_name} row {row_number}: missing phrase id.")
                    continue

                if concept_id in seen_ids:
                    add_issue(issues, f"{sheet_name} row {row_number}: duplicate phrase id {concept_id}.")
                seen_ids.add(concept_id)

                if not english:
                    add_issue(issues, f"{sheet_name} row {row_number}: missing English text for {concept_id}.")
                if not translation:
                    add_issue(
                        issues,
                        f"{sheet_name} row {row_number}: missing translation text for {concept_id}.",
                    )

                if category and known_categories and category not in known_categories:
                    add_issue(
                        issues,
                        f"{sheet_name} row {row_number}: unknown category {category!r} for {concept_id}.",
                    )

                if phrase_type and phrase_type not in KNOWN_TYPES:
                    add_issue(
                        issues,
                        f"{sheet_name} row {row_number}: unexpected type {phrase_type!r} for {concept_id}.",
                    )

                if tier and tier not in KNOWN_TIERS:
                    add_issue(
                        issues,
                        f"{sheet_name} row {row_number}: unexpected tier {tier!r} for {concept_id}.",
                    )

                if difficulty and difficulty not in KNOWN_DIFFICULTIES:
                    add_issue(
                        issues,
                        f"{sheet_name} row {row_number}: unexpected difficulty {difficulty!r} for {concept_id}.",
                    )

                if english and translation and concept_id:
                    valid_rows += 1

            summary.append(f"{sheet_name}: {valid_rows} valid rows checked")

    if issues:
        print("Workbook validation failed:")
        for issue in issues:
            print(f"- {issue}")
        if len(issues) >= MAX_ISSUES:
            print(f"- Stopped after {MAX_ISSUES} issues.")
        raise SystemExit(1)

    print("Workbook validation passed.")
    for item in summary:
        print(f"- {item}")


if __name__ == "__main__":
    main()
