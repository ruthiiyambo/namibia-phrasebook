#!/usr/bin/env python3

import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


WORKBOOK_PATH = Path("namibian_phrasebook_updated.xlsx")
OUTPUT_PATH = Path("lib/demo-data.ts")
NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

LANGUAGE_META = {
    "Afrikaans": {"code": "af", "flag_emoji": "🇳🇦", "sort_order": 1},
    "Oshiwambo": {"code": "osh", "flag_emoji": "🇳🇦", "sort_order": 2},
    "Nama-Damara": {"code": "naq", "flag_emoji": "🇳🇦", "sort_order": 3},
}


def get_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    return [
        "".join((node.text or "") for node in item.iterfind(".//a:t", NS))
        for item in root.findall("a:si", NS)
    ]


def column_name(cell_ref: str) -> str:
    return re.match(r"([A-Z]+)", cell_ref).group(1)


def cell_value(cell: ET.Element, strings: list[str]) -> str:
    inline_parts = cell.iterfind(".//a:is//a:t", NS)
    inline_text = "".join((part.text or "") for part in inline_parts)
    if inline_text:
        return inline_text

    value = cell.find("a:v", NS)
    if value is None:
        return ""

    raw = value.text or ""
    if cell.attrib.get("t") == "s":
        return strings[int(raw)]

    return raw


def clean_note(value: str) -> str | None:
    note = value.strip()
    if not note:
        return None

    note = re.sub(r"^Note:\s*", "", note).strip()
    note = re.sub(r"\s*From guide(?:\s+Ch\.\d+| / [A-Za-z-]+)?\.?$", "", note).strip()
    note = re.sub(r"(^|\s)Always free\.?", " ", note, flags=re.IGNORECASE).strip()
    note = re.sub(
        r"^Added from researched [A-Za-z -]+ phrasebook sources\.?$",
        "",
        note,
        flags=re.IGNORECASE,
    ).strip()
    note = re.sub(
        r"\s*; already in sheet as [A-Z0-9]+ for \".+?\" — variant use\.?$",
        "",
        note,
        flags=re.IGNORECASE,
    ).strip()

    replacements = {
        "Keep Emergency free": "",
        "tourists love this": "useful in travel situations",
    }

    for source, target in replacements.items():
        note = note.replace(source, target)

    note = re.sub(r"\s{2,}", " ", note)
    note = re.sub(r"\s+([,.;!?])", r"\1", note)
    note = re.sub(r"\.\.+", ".", note)
    note = note.strip(" -;,.")

    if not note:
        return None

    significant = note.rstrip("\"')]} ")
    if significant and significant[-1].isalnum():
        note = f"{note}."

    return note


def parse_sheet_rows(archive: zipfile.ZipFile, path: str, strings: list[str]) -> list[dict[str, str]]:
    root = ET.fromstring(archive.read(path))
    rows = root.find("a:sheetData", NS).findall("a:row", NS)
    header_row = rows[0]
    header = {
        column_name(cell.attrib["r"]): cell_value(cell, strings) or column_name(cell.attrib["r"])
        for cell in header_row.findall("a:c", NS)
    }

    parsed_rows: list[dict[str, str]] = []
    for row in rows[1:]:
        row_values = {
            header.get(column_name(cell.attrib["r"]), column_name(cell.attrib["r"])): cell_value(cell, strings)
            for cell in row.findall("a:c", NS)
        }
        parsed_rows.append(row_values)

    return parsed_rows


def main() -> None:
    if not WORKBOOK_PATH.exists():
        raise SystemExit(f"Workbook not found: {WORKBOOK_PATH}")

    with zipfile.ZipFile(WORKBOOK_PATH) as archive:
        strings = get_shared_strings(archive)

        language_sheets = [
            ("Afrikaans", "xl/worksheets/sheet1.xml"),
            ("Oshiwambo", "xl/worksheets/sheet2.xml"),
            ("Nama-Damara", "xl/worksheets/sheet3.xml"),
        ]

        categories_rows = parse_sheet_rows(archive, "xl/worksheets/sheet4.xml", strings)
        demo_categories = [
            {
                "name": row["category"],
                "description": row.get("B", "").strip(),
                "sort_order": index + 1,
            }
            for index, row in enumerate(categories_rows)
            if row.get("category")
        ]

        demo_languages = []
        demo_translations = []

        for sheet_name, sheet_path in language_sheets:
            meta = LANGUAGE_META[sheet_name]
            demo_languages.append(
                {
                    "id": f"lang-{meta['code']}",
                    "code": meta["code"],
                    "name": sheet_name,
                    "flag_emoji": meta["flag_emoji"],
                    "sort_order": meta["sort_order"],
                }
            )

            rows = parse_sheet_rows(archive, sheet_path, strings)
            for row in rows:
                english = row.get("english", "").strip()
                translation = row.get("translation", "").strip()
                concept_id = row.get("id", "").strip()
                if not english or not translation or not concept_id:
                    continue

                demo_translations.append(
                    {
                        "id": f"{meta['code']}-{concept_id}",
                        "concept_id": concept_id,
                        "language_code": meta["code"],
                        "language_name": sheet_name,
                        "english_text": english,
                        "translated_text": translation,
                        "pronunciation": row.get("pronunciation", "").strip() or None,
                        "audio_file": row.get("audio_file", "").strip() or None,
                        "category": row.get("category", "").strip() or "General",
                        "type": row.get("type", "").strip() or "word",
                        "tier": row.get("tier", "").strip() or "free",
                        "difficulty": row.get("difficulty", "").strip() or None,
                        "word_count": len(english.split()),
                        "notes": clean_note(row.get("notes", "")),
                    }
                )

    output = f"""import {{ Language, Translation }} from '@/lib/phrasebook-types';

// Generated from namibian_phrasebook_updated.xlsx by scripts/generate_demo_data.py

export type DemoCategory = {{
  name: string;
  description: string;
  sort_order: number;
}};

export const demoLanguages: Language[] = {json.dumps(demo_languages, ensure_ascii=False, indent=2)} as Language[];

export const demoCategories: DemoCategory[] = {json.dumps(demo_categories, ensure_ascii=False, indent=2)} as DemoCategory[];

export const demoTranslations: Translation[] = {json.dumps(demo_translations, ensure_ascii=False, indent=2)} as Translation[];

export function getDemoTranslations(languageCode: string, category?: string) {{
  return demoTranslations.filter((item) => (
    item.language_code === languageCode && (!category || item.category === category)
  ));
}}

export function searchDemoTranslations(languageCode: string, query: string) {{
  const normalized = query.trim().toLowerCase();

  return demoTranslations.filter((item) => (
    item.language_code === languageCode
    && (
      item.english_text.toLowerCase().includes(normalized)
      || item.translated_text.toLowerCase().includes(normalized)
    )
  ));
}}
"""

    OUTPUT_PATH.write_text(output, encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
