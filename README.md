# XML Table Viewer

A Chrome side-panel extension that turns XML and SOAP responses into a table you can copy as Markdown or export as CSV. Sibling of [JSON Table Viewer](https://github.com/QA-Justice/json-table-viewer).

XML·SOAP 응답을 붙여넣으면 표로 펼쳐 보여주고, 마크다운 복사와 CSV 다운로드를 지원하는 크롬 확장 프로그램입니다.

![Version](https://img.shields.io/badge/Version-1.1.0-orange.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

- Paste (📋 Paste button), type, or upload `.xml` files; Convert with the button or Ctrl + Enter
- Detects repeated elements and uses them as rows; switch the row element from a list, or view the whole document as one row
- Flattens nested elements into column paths: `customer.address.city`, `items.item[0]`
- Attributes become `@` columns (`total@currency`), with a toggle to hide them
- Namespace prefixes are removed (`soap:Envelope` → `Envelope`); `xsi:nil="true"` shows as `null`
- CDATA and mixed content are kept
- Pivot view (fields as rows), filter
- Find in table with Ctrl + F (Chrome's own find bar doesn't work in side panels): highlights matches, Enter / Shift + Enter to move, Esc to close
- Copy as Markdown, download CSV (UTF-8 with BOM for Excel) — both follow the current view and filter
- Parse errors show the line and column and jump the cursor there
- Whole-panel zoom (−/+, Ctrl + = / - / 0, Ctrl + wheel)

No tracking. No data uploads. Everything runs locally, even offline (fonts are bundled).

## Install (development)

1. Open `chrome://extensions` and turn on **Developer mode**
2. **Load unpacked** → select this folder
3. Click the toolbar icon to open the side panel, then try **Sample**

## Structure

| File | Role |
| --- | --- |
| `js/xml-parser.js` | XML parsing, flattening, row detection, pivot |
| `js/exporter.js` | Markdown / CSV output |
| `js/app.js` | State, rendering, paste, zoom |

## Permissions

- `sidePanel` — show the viewer in Chrome's side panel
- `clipboardRead` (optional) — requested only when you click 📋 Paste

## Credits

UI design adapted from the StudioBlank Design System by Chef (@chef), licensed under the MIT License and available through DESIGN.md. This extension is independently developed and is not affiliated with or endorsed by the original creator or DESIGN.md. Fonts: Inter, IBM Plex Mono, Pretendard (SIL OFL, see `fonts/`).
