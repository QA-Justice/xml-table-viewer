# Chrome Web Store 등록 자료 — XML Table Viewer 1.1.0

개발자 대시보드(https://chrome.google.com/webstore/devconsole)의 각 탭에 그대로 복사해서 붙여넣으면 됩니다.
업로드할 패키지: `xml-table-viewer-1.1.0-store.zip` (이 폴더는 패키지에 포함되지 않습니다)

---

## 1. 패키지 (Package)

| 항목 | 값 |
| --- | --- |
| 파일 | `xml-table-viewer-1.1.0-store.zip` |
| 버전 | 1.1.0 (`manifest.json`) |
| Manifest | V3 |

---

## 2. 스토어 등록정보 (Store listing)

### 제품 세부정보

**이름** (manifest에서 자동으로 들어감)

```
XML Table Viewer
```

**요약** (manifest `description`에서 자동으로 들어감, 132자 이하)

```
Convert XML and SOAP responses to a table. Copy as Markdown, export CSV, pivot, and filter.
```

**설명** (Description) — 영어

```
Paste an XML or SOAP response and read it as a table — right in Chrome's side panel.

XML Table Viewer is built for people who read API responses all day: QA engineers, backend developers, and anyone checking SOAP or XML payloads. Instead of scrolling through nested tags, you get rows and columns you can scan, search, and paste into a bug report.

★ CONVERT
• Paste (📋 Paste button or Ctrl+V), type, or upload an .xml file
• Press Convert or Ctrl + Enter
• Repeated elements are detected and used as rows — switch the row element from a list, or view the whole document as one row

★ FLATTEN
• Nested elements become column paths: customer.address.city, items.item[0]
• Attributes become @ columns (total@currency), with a toggle to hide them
• Namespace prefixes are removed (soap:Envelope → Envelope)
• xsi:nil="true" is shown as null
• CDATA and mixed content are kept; Korean and other non-Latin text works as-is

★ FIND (Ctrl + F)
• Chrome's own find bar doesn't open in side panels — this one does
• Every match in the table is highlighted, with a 3/12-style counter
• Enter / Shift + Enter (or F3) to jump between matches, Esc to close

★ PIVOT & FILTER
• Pivot turns fields into rows, so wide records fit a narrow side panel
• Filter keeps only the rows that contain your text

★ COPY & EXPORT
• Copy as a Markdown table — paste straight into Jira, GitHub, Confluence, or Notion
• Download CSV (UTF-8 with BOM, opens correctly in Excel)
• Both follow the current view and filter

★ MORE
• Parse errors show the line and column, and the cursor jumps there
• Whole-panel zoom (−/+, Ctrl + = / - / 0, Ctrl + wheel)

★ PRIVATE BY DESIGN
• No tracking, no analytics, no network requests
• Everything runs locally in your browser — even offline (fonts are bundled)
• Your XML never leaves your computer

Sibling of JSON Table Viewer.
```

**설명 — 한국어** (한국어 등록정보를 따로 둘 경우)

> 참고: 언어별 등록정보를 따로 두려면 확장에 `_locales`와 `default_locale`이 있어야 합니다. 지금 패키지에는 없으므로, 한 언어만 쓸 수 있습니다. 영어 설명에 한국어 소개를 덧붙이는 방식도 가능합니다.

```
XML·SOAP 응답을 붙여넣으면 크롬 사이드 패널에서 바로 표로 볼 수 있습니다.

API 응답을 매일 들여다보는 QA 엔지니어, 백엔드 개발자를 위해 만들었습니다. 중첩된 태그를 스크롤하는 대신, 훑어보고·검색하고·버그 리포트에 붙여넣을 수 있는 행과 열로 보여줍니다.

★ 변환
• 📋 Paste 버튼, Ctrl+V, 직접 입력, .xml 파일 업로드
• Convert 버튼 또는 Ctrl + Enter
• 반복되는 요소를 찾아 행으로 사용 — 목록에서 행 요소를 바꾸거나, 문서 전체를 한 행으로 볼 수 있습니다

★ 펼치기
• 중첩 요소는 경로 컬럼으로: customer.address.city, items.item[0]
• 속성은 @ 컬럼으로 (total@currency), 숨기기 토글 제공
• 네임스페이스 접두사 제거 (soap:Envelope → Envelope)
• xsi:nil="true"는 null로 표시
• CDATA와 혼합 콘텐츠 유지, 한글 그대로 표시

★ 찾기 (Ctrl + F)
• 크롬 기본 찾기 바는 사이드 패널에서 열리지 않습니다 — 이 확장은 됩니다
• 표 안의 모든 일치 항목 하이라이트, 3/12 형식 개수 표시
• Enter / Shift + Enter(또는 F3)로 이동, Esc로 닫기

★ 피벗 & 필터
• 피벗: 필드를 행으로 돌려 좁은 패널에서도 넓은 레코드를 읽기 쉽게
• 필터: 입력한 글자가 들어간 행만 남기기

★ 복사 & 내보내기
• 마크다운 표로 복사 — Jira, GitHub, Confluence, Notion에 바로 붙여넣기
• CSV 다운로드 (UTF-8 BOM, 엑셀에서 한글 깨짐 없음)
• 둘 다 현재 보기와 필터를 따릅니다

★ 그 밖에
• 파싱 오류 시 줄·칸 번호를 알려주고 커서를 그 위치로 이동
• 패널 전체 확대/축소 (−/+, Ctrl + = / - / 0, Ctrl + 휠)

★ 개인정보 보호
• 추적·분석·네트워크 요청 없음
• 모든 처리는 브라우저 안에서 — 오프라인에서도 동작 (폰트 내장)
• XML 데이터는 컴퓨터 밖으로 나가지 않습니다
```

| 항목 | 값 |
| --- | --- |
| 카테고리 (Category) | **Developer Tools** |
| 언어 (Language) | **English** (한국어로 등록하려면 Korean) |

### 그래픽 저작물 (Graphic assets)

| 칸 | 파일 | 규격 | 필수 |
| --- | --- | --- | --- |
| 스토어 아이콘 | `store-icon-128.png` | 128×128, 투명 여백 16px | ✅ |
| 스크린샷 1 | `screenshot-1-convert-1280x800.png` | 1280×800 | ✅ (최소 1장) |
| 스크린샷 2 | `screenshot-2-flatten-1280x800.png` | 1280×800 | |
| 스크린샷 3 | `screenshot-3-pivot-1280x800.png` | 1280×800 | |
| 스크린샷 4 | `screenshot-4-find-1280x800.png` | 1280×800 | |
| 스크린샷 5 | `screenshot-5-export-1280x800.png` | 1280×800 | |
| 작은 프로모션 타일 | `small-promo-tile-440x280.png` | 440×280 | ✅ |
| 마키 프로모션 타일 | `marquee-promo-tile-1400x560.png` | 1400×560 | 선택 |

스크린샷과 타일은 알파 채널 없는 24비트 PNG입니다.
스크린샷은 1→5 순서로 올리면 변환 → 펼치기 → 피벗 → 찾기 → 내보내기 흐름이 됩니다.

### 추가 입력란

| 항목 | 값 |
| --- | --- |
| 공식 URL | 비워 둠 (Search Console 인증된 사이트가 있을 때만) |
| 홈페이지 URL | ⚠️ GitHub 저장소가 비공개라서 그대로 넣으면 404가 납니다. 공개 저장소나 소개 페이지가 생기면 입력 |
| 지원 URL | 위와 같음. 없으면 비워 둠 |
| 성인용 콘텐츠 | 아니요 |

---

## 3. 개인정보 보호 관행 (Privacy practices)

### 단일 목적 (Single purpose description)

```
Display XML and SOAP text that the user pastes or uploads as a table in Chrome's side panel, so it can be searched, filtered, pivoted, and copied as Markdown or exported as CSV.
```

### 권한 사용 이유 (Permission justification)

**sidePanel**

```
The extension's entire UI lives in Chrome's side panel. The sidePanel permission is used to open the viewer there when the user clicks the toolbar icon, so XML can be read next to the page being tested.
```

**clipboardRead** (optional permission)

```
Optional. Requested only when the user clicks the "📋 Paste" button, to read the XML text the user copied and put it into the input box. The clipboard is read only on that click, never in the background, and the text is processed locally and not stored or sent anywhere. Users who prefer can paste with Ctrl+V instead without granting it.
```

**호스트 권한 (Host permissions)**: 없음 — 입력란이 나오면 해당 없음

### 원격 코드 (Remote code)

```
No, I am not using remote code.
```

(모든 JS·폰트가 패키지 안에 있고, 외부 스크립트·eval·원격 리소스를 쓰지 않습니다.)

### 데이터 사용 (Data usage)

**수집하는 사용자 데이터**: 아래 항목 모두 체크하지 않음

- 개인 식별 정보 ☐
- 건강 정보 ☐
- 금융 및 결제 정보 ☐
- 인증 정보 ☐
- 개인 커뮤니케이션 ☐
- 위치 ☐
- 웹 기록 ☐
- 사용자 활동 ☐
- 웹사이트 콘텐츠 ☐

> 사용자가 붙여넣은 XML은 브라우저 안에서만 처리되고 저장·전송되지 않으므로 "수집"에 해당하지 않습니다. `localStorage`에는 패널 확대 배율(예: 1.25)만 저장합니다.

**인증 (3개 모두 체크)**

- ☑ I do not sell or transfer user data to third parties, outside of the approved use cases
- ☑ I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes

### 개인정보처리방침 URL

수집하는 데이터가 없으면 필수는 아닙니다. 그래도 입력을 요구받거나 넣고 싶다면, 아래 글을 공개된 곳(GitHub Gist, Notion 공개 페이지 등)에 올리고 그 URL을 넣으세요.

```
Privacy Policy — XML Table Viewer

XML Table Viewer does not collect, store, or transmit any personal or user data.

• All XML you paste, type, or upload is processed locally in your browser and is never sent to any server.
• The extension makes no network requests. It contains no analytics, tracking, or advertising.
• The optional clipboard permission is used only when you click "Paste", to read the text you copied into the input box. Nothing is stored.
• The only thing saved is your panel zoom level, in your browser's local storage on your device.

Contact: <연락받을 이메일 주소>
```

---

## 4. 배포 (Distribution)

| 항목 | 권장 |
| --- | --- |
| 공개 범위 | 공개 (Public) — 먼저 확인하고 싶으면 비공개(Unlisted) 후 전환 |
| 지역 | 모든 지역 |
| 가격 | 무료 |

---

## 5. 제출 전 체크리스트

- [ ] 개발자 계정 등록비($5, 1회) 결제됨
- [ ] 개발자 계정 이메일 인증 완료
- [ ] zip 업로드 → 버전 1.1.0 표시 확인
- [ ] 스토어 아이콘·스크린샷 1장 이상·작은 프로모션 타일 업로드
- [ ] 단일 목적·권한 사용 이유 2개·원격 코드 "No" 입력
- [ ] 데이터 사용 인증 3개 체크
- [ ] 카테고리 Developer Tools
- [ ] "검토를 위해 제출" — 보통 수일 내 결과 메일
