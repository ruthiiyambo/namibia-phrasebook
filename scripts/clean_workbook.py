#!/usr/bin/env python3

from __future__ import annotations

from collections import defaultdict
from copy import deepcopy
from pathlib import Path
import re
import shutil
import tempfile
import zipfile
from xml.etree import ElementTree as ET

import generate_demo_data as generator


WORKBOOK_PATH = Path("namibian_phrasebook_updated.xlsx")
BACKUP_PATH = Path("namibian_phrasebook_updated.pre_cleanup_backup.xlsx")
NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS = {"a": NS_MAIN}

LANGUAGE_SHEETS = [
    ("Afrikaans", "xl/worksheets/sheet1.xml"),
    ("Oshiwambo", "xl/worksheets/sheet2.xml"),
    ("Nama-Damara", "xl/worksheets/sheet3.xml"),
]

MANUAL_ROW_DROPS = {
    "xl/worksheets/sheet2.xml": {
        ("C400", "Candle", "Okalexita", "Food & Drink"),
    },
}

MANUAL_ROW_UPDATES = {
    "xl/worksheets/sheet2.xml": {
        "C201": {"english": "Good night (plural)"},
        "C209": {"english": "Please (alternative polite form)"},
        "C283": {"english": "What does ... mean? (Oshindonga)"},
        "C385": {"english": "Eleven (variant form)"},
        "C454": {"english": "Cheap (variant form)"},
        "C504": {"english": "Tuesday (variant form)"},
        "C589": {"english": "Now (flexible local timing)"},
        "C592": {"english": "What does ... mean? (Oshikwanyama)"},
    },
    "xl/worksheets/sheet3.xml": {
        "C097": {"english": "Chicken (food)"},
        "C098": {"english": "Goat (food)"},
    },
}

CATEGORY_DESCRIPTIONS = {
    "Greetings": "Hello, thanks, and everyday polite essentials.",
    "Emergency": "Urgent phrases for help, safety, and medical situations.",
    "Directions": "Ask where things are and understand where to go.",
    "Food & Drink": "Ordering meals, drinks, and dietary basics.",
    "Shopping": "Prices, markets, and buying everyday items.",
    "Transport": "Taxis, rides, fuel, and getting from place to place.",
    "Accommodation": "Check-in, room requests, and stay-related help.",
    "Wildlife": "Safari, park rules, and animal-related phrases.",
    "Numbers": "Counting, prices, times, and quantities.",
    "Health": "Symptoms, pharmacies, and medical support.",
    "Culture": "Polite customs, context, and local etiquette.",
    "Time": "Days, times of day, and talking about timing.",
    "Colors": "Basic color words for everyday use.",
}


def column_name(cell_ref: str) -> str:
    match = re.match(r"([A-Z]+)", cell_ref)
    if not match:
        raise ValueError(f"Unrecognised cell reference: {cell_ref}")
    return match.group(1)


def find_cell(row: ET.Element, target_column: str) -> ET.Element | None:
    for cell in row.findall("a:c", NS):
        if column_name(cell.attrib["r"]) == target_column:
            return cell
    return None


def get_cell_text(row: ET.Element, column: str, strings: list[str]) -> str:
    cell = find_cell(row, column)
    if cell is None:
        return ""
    return generator.cell_value(cell, strings).strip()


def set_inline_text(cell: ET.Element, text: str) -> None:
    for child in list(cell):
        cell.remove(child)

    cell.attrib.pop("t", None)

    if not text:
        return

    cell.set("t", "inlineStr")
    inline = ET.SubElement(cell, f"{{{NS_MAIN}}}is")
    text_node = ET.SubElement(inline, f"{{{NS_MAIN}}}t")
    text_node.text = text


def create_cell(row: ET.Element, column: str, style: str | None = None) -> ET.Element:
    cell = ET.Element(f"{{{NS_MAIN}}}c", {"r": f"{column}{row.attrib['r']}"})
    if style is not None:
        cell.set("s", style)
    row.append(cell)
    return cell


def ensure_cell(row: ET.Element, column: str) -> ET.Element:
    existing = find_cell(row, column)
    if existing is not None:
        return existing

    fallback_style = None
    existing_cells = row.findall("a:c", NS)
    if existing_cells:
        fallback_style = existing_cells[-1].attrib.get("s")

    return create_cell(row, column, fallback_style)


def build_header_map(sheet_root: ET.Element, strings: list[str]) -> dict[str, str]:
    sheet_data = sheet_root.find("a:sheetData", NS)
    rows = sheet_data.findall("a:row", NS)
    header_row = rows[0]
    return {
        column_name(cell.attrib["r"]): generator.cell_value(cell, strings).strip()
        for cell in header_row.findall("a:c", NS)
    }


def clean_category_sheet(sheet_root: ET.Element, strings: list[str]) -> int:
    header_map = build_header_map(sheet_root, strings)
    inverse_headers = {value: key for key, value in header_map.items()}
    category_col = inverse_headers["category"]
    description_col = "B"
    changes = 0

    sheet_data = sheet_root.find("a:sheetData", NS)
    for row in sheet_data.findall("a:row", NS)[1:]:
        category = get_cell_text(row, category_col, strings)
        desired = CATEGORY_DESCRIPTIONS.get(category)
        if not desired:
            continue

        cell = ensure_cell(row, description_col)
        current = get_cell_text(row, description_col, strings)
        if current != desired:
            set_inline_text(cell, desired)
            changes += 1

    return changes


def clean_language_sheet(
    sheet_root: ET.Element,
    strings: list[str],
    sheet_path: str,
) -> dict[str, int]:
    stats = {
        "removed_duplicates": 0,
        "cleaned_notes": 0,
        "merged_duplicate_notes": 0,
        "removed_manual_rows": 0,
        "updated_manual_rows": 0,
    }

    header_map = build_header_map(sheet_root, strings)
    inverse_headers = {value: key for key, value in header_map.items()}

    english_col = inverse_headers["english"]
    translation_col = inverse_headers["translation"]
    category_col = inverse_headers["category"]
    notes_col = inverse_headers["notes"]

    sheet_data = sheet_root.find("a:sheetData", NS)
    rows = sheet_data.findall("a:row", NS)

    manual_drops = MANUAL_ROW_DROPS.get(sheet_path, set())
    for row in list(rows[1:]):
        row_signature = (
            get_cell_text(row, inverse_headers["id"], strings),
            get_cell_text(row, english_col, strings),
            get_cell_text(row, translation_col, strings),
            get_cell_text(row, category_col, strings),
        )
        if row_signature in manual_drops:
            sheet_data.remove(row)
            stats["removed_manual_rows"] += 1

    rows = sheet_data.findall("a:row", NS)

    row_updates = MANUAL_ROW_UPDATES.get(sheet_path, {})
    if row_updates:
        id_col = inverse_headers["id"]
        for row in rows[1:]:
            concept_id = get_cell_text(row, id_col, strings)
            updates = row_updates.get(concept_id)
            if not updates:
                continue

            for field_name, value in updates.items():
                column = inverse_headers[field_name]
                cell = ensure_cell(row, column)
                current = get_cell_text(row, column, strings)
                if current != value:
                    set_inline_text(cell, value)
                    stats["updated_manual_rows"] += 1

    groups: dict[tuple[str, str, str], list[ET.Element]] = defaultdict(list)

    for row in rows[1:]:
        english = get_cell_text(row, english_col, strings)
        translation = get_cell_text(row, translation_col, strings)
        category = get_cell_text(row, category_col, strings)

        if not english or not translation or not category:
            continue

        key = (
            english.casefold(),
            translation.casefold(),
            category.casefold(),
        )
        groups[key].append(row)

    rows_to_remove: list[ET.Element] = []

    for group in groups.values():
        if len(group) <= 1:
            continue

        keep_row = group[0]
        duplicate_rows = group[1:]
        candidate_notes = [
            generator.clean_note(get_cell_text(row, notes_col, strings)) or ""
            for row in group
        ]
        best_note = max(candidate_notes, key=len, default="")
        keep_note = generator.clean_note(get_cell_text(keep_row, notes_col, strings)) or ""

        if best_note and keep_note != best_note:
            note_cell = ensure_cell(keep_row, notes_col)
            set_inline_text(note_cell, best_note)
            stats["merged_duplicate_notes"] += 1

        rows_to_remove.extend(duplicate_rows)
        stats["removed_duplicates"] += len(duplicate_rows)

    for row in rows_to_remove:
        sheet_data.remove(row)

    for row in sheet_data.findall("a:row", NS)[1:]:
        note_cell = ensure_cell(row, notes_col)
        raw_note = get_cell_text(row, notes_col, strings)
        cleaned_note = generator.clean_note(raw_note) or ""

        if raw_note != cleaned_note:
            stats["cleaned_notes"] += 1

        set_inline_text(note_cell, cleaned_note)

    return stats


def main() -> None:
    if not WORKBOOK_PATH.exists():
        raise SystemExit(f"Workbook not found: {WORKBOOK_PATH}")

    if not BACKUP_PATH.exists():
        shutil.copy2(WORKBOOK_PATH, BACKUP_PATH)

    ET.register_namespace("", NS_MAIN)

    with zipfile.ZipFile(WORKBOOK_PATH) as archive:
        strings = generator.get_shared_strings(archive)
        updated_files: dict[str, bytes] = {}
        summary: dict[str, dict[str, int]] = {}

        for _, sheet_path in LANGUAGE_SHEETS:
            root = ET.fromstring(archive.read(sheet_path))
            summary[sheet_path] = clean_language_sheet(root, strings, sheet_path)
            updated_files[sheet_path] = ET.tostring(root, encoding="utf-8", xml_declaration=True)

        category_root = ET.fromstring(archive.read("xl/worksheets/sheet4.xml"))
        category_changes = clean_category_sheet(category_root, strings)
        updated_files["xl/worksheets/sheet4.xml"] = ET.tostring(
            category_root,
            encoding="utf-8",
            xml_declaration=True,
        )

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as temp_file:
            temp_path = Path(temp_file.name)

        with zipfile.ZipFile(temp_path, "w", compression=zipfile.ZIP_DEFLATED) as output:
            for item in archive.infolist():
                data = updated_files.get(item.filename)
                if data is None:
                    data = archive.read(item.filename)
                output.writestr(item, data)

    shutil.move(temp_path, WORKBOOK_PATH)

    print(f"Backup saved to {BACKUP_PATH}")
    print(f"Updated {WORKBOOK_PATH}")
    print(f"Category description rows updated: {category_changes}")

    for language_name, sheet_path in LANGUAGE_SHEETS:
        stats = summary[sheet_path]
        print(
            f"- {language_name}: removed {stats['removed_duplicates']} duplicate rows, "
            f"removed {stats['removed_manual_rows']} manual rows, "
            f"cleaned {stats['cleaned_notes']} notes, merged {stats['merged_duplicate_notes']} notes"
        )


if __name__ == "__main__":
    main()
