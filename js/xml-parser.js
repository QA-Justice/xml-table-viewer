// XML → 평평한 행(row) 변환
//
// 규칙
// - 네임스페이스 접두사는 떼고 로컬 이름만 쓴다 (soap:Envelope → Envelope)
// - 자식 요소는 점(.)으로, 같은 이름이 반복되면 [i]로 경로를 만든다 (items.item[0].name)
// - 속성은 @로 붙인다 (price@currency). xmlns 선언은 무시
// - xsi:nil="true" 는 null
// - 행 = 반복되는 요소. 문서에서 반복 요소 경로를 찾아 그중 하나를 행으로 쓴다.
//   반복 요소가 없으면 문서 전체를 한 행으로 본다.

const XSI = 'http://www.w3.org/2001/XMLSchema-instance';
const XMLNS = 'http://www.w3.org/2000/xmlns/';

export class XmlParseError extends Error {
  constructor(message, line, column) {
    super(message);
    this.line = line;
    this.column = column;
  }
}

export function parseXml(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const error = doc.getElementsByTagName('parsererror')[0];
  if (error) {
    // 크롬 메시지 예: "error on line 3 at column 7: Opening and ending tag mismatch: ..."
    const raw = (error.textContent || '').replace(/\s+/g, ' ');
    const match = /line (\d+) at column (\d+):\s*(.*?)(?:\s*Below is a rendering.*)?$/i.exec(raw);
    if (match) {
      throw new XmlParseError(match[3].trim(), Number(match[1]), Number(match[2]));
    }
    throw new XmlParseError(raw.replace(/^This page contains the following errors:\s*/i, '') || 'Invalid XML');
  }
  return doc.documentElement;
}

function isNil(el) {
  const nil = el.getAttributeNS(XSI, 'nil');
  return nil === 'true' || nil === '1';
}

function isIgnoredAttribute(attr) {
  return attr.namespaceURI === XMLNS || attr.name === 'xmlns' || attr.namespaceURI === XSI;
}

// 반복되는 요소 경로(인덱스 없는 형태)를 모은다.
// 어떤 행에서는 item이 2개, 다른 행에서는 1개면 열 이름이 items.item[0] / items.item 으로 갈라지므로,
// 한 번이라도 반복된 경로는 모든 행에서 [0]부터 인덱스를 붙이기 위해 쓴다.
function collectRepeated(el, pattern, set) {
  const counts = {};
  for (const kid of el.children) counts[kid.localName] = (counts[kid.localName] || 0) + 1;
  for (const kid of el.children) {
    const p = pattern ? `${pattern}.${kid.localName}` : kid.localName;
    if (counts[kid.localName] > 1) set.add(p);
    collectRepeated(kid, p, set);
  }
  return set;
}

/**
 * 요소 하나를 { 경로: 값 } 으로 펼친다. 값은 문자열 또는 null.
 * prefix가 빈 문자열이면 경로는 이 요소 기준 상대 경로가 된다.
 * options.repeated: 항상 인덱스를 붙일 경로 집합 (collectRepeated 결과)
 */
export function flattenElement(el, options = {}, prefix = '', out = {}, pattern = prefix) {
  const { attributes = true, repeated = new Set() } = options;
  const key = prefix || el.localName;

  if (isNil(el)) {
    out[key] = null;
    return out;
  }

  let hasAttributes = false;
  if (attributes) {
    for (const attr of el.attributes) {
      if (isIgnoredAttribute(attr)) continue;
      out[`${prefix}@${attr.localName}`] = attr.value;
      hasAttributes = true;
    }
  }

  const kids = [...el.children];
  if (kids.length === 0) {
    const text = el.textContent.trim();
    // 속성만 있고 내용이 없는 요소(<img src=".."/>)는 빈 텍스트 열을 만들지 않는다
    if (text !== '' || !hasAttributes) out[key] = text;
    return out;
  }

  const counts = {};
  kids.forEach((k) => { counts[k.localName] = (counts[k.localName] || 0) + 1; });
  const seen = {};
  for (const kid of kids) {
    const name = kid.localName;
    const index = (seen[name] = (seen[name] ?? -1) + 1);
    const kidPattern = pattern ? `${pattern}.${name}` : name;
    const segment = counts[name] > 1 || repeated.has(kidPattern) ? `${name}[${index}]` : name;
    flattenElement(kid, options, prefix ? `${prefix}.${segment}` : segment, out, kidPattern);
  }

  // 자식 요소와 글자가 섞인 요소(mixed content)의 글자도 버리지 않는다
  const directText = [...el.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE || n.nodeType === Node.CDATA_SECTION_NODE)
    .map((n) => n.nodeValue)
    .join('')
    .trim();
  if (directText) out[prefix ? `${prefix}.#text` : '#text'] = directText;

  return out;
}

/**
 * 행 후보: 같은 부모 아래에서 2번 이상 반복되는 요소의 경로(인덱스 없이).
 * 얕은 경로 우선, 같은 깊이면 개수가 많은 순.
 */
export function findRowPaths(root) {
  const map = new Map();
  const walk = (el, path) => {
    const counts = {};
    for (const kid of el.children) counts[kid.localName] = (counts[kid.localName] || 0) + 1;
    for (const kid of el.children) {
      const childPath = `${path}.${kid.localName}`;
      const entry = map.get(childPath) || { path: childPath, count: 0, repeated: false };
      entry.count += 1;
      if (counts[kid.localName] > 1) entry.repeated = true;
      map.set(childPath, entry);
      walk(kid, childPath);
    }
  };
  walk(root, root.localName);

  const depth = (p) => p.split('.').length;
  return [...map.values()]
    .filter((e) => e.repeated)
    .map(({ path, count }) => ({ path, count }))
    .sort((a, b) => depth(a.path) - depth(b.path) || b.count - a.count);
}

export function elementsAtPath(root, path) {
  const [first, ...rest] = path.split('.');
  if (first !== root.localName) return [];
  let level = [root];
  for (const segment of rest) {
    level = level.flatMap((el) => [...el.children].filter((c) => c.localName === segment));
  }
  return level;
}

/**
 * @param rowPath 행으로 쓸 반복 요소 경로. null이면 문서 전체를 한 행으로.
 * @returns {{ columns: string[], rows: Record<string, string|null>[] }}
 */
export function buildRows(root, rowPath, options = {}) {
  let rows;
  if (rowPath) {
    const elements = elementsAtPath(root, rowPath);
    const repeated = new Set();
    elements.forEach((el) => collectRepeated(el, '', repeated));
    rows = elements.map((el) => flattenElement(el, { ...options, repeated }));
  } else {
    const repeated = collectRepeated(root, root.localName, new Set());
    rows = [flattenElement(root, { ...options, repeated }, root.localName)];
  }

  const columns = [];
  const seen = new Set();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }
  return { columns, rows };
}

// 피벗: 필드가 행이 되고, 원래 행이 Row 1, Row 2 … 열이 된다
export function pivot({ columns, rows }) {
  const pivotColumns = ['Field', ...rows.map((_, i) => `Row ${i + 1}`)];
  const pivotRows = columns.map((field) => {
    const row = { Field: field };
    rows.forEach((r, i) => { row[`Row ${i + 1}`] = field in r ? r[field] : ''; });
    return row;
  });
  return { columns: pivotColumns, rows: pivotRows };
}
