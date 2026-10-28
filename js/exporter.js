// 표 → Markdown / CSV. 값 규칙: null은 "null", 행에 없는 필드는 빈 칸.

export function cellText(value) {
  if (value === undefined) return '';
  if (value === null) return 'null';
  return String(value);
}

function toMatrix({ columns, rows }) {
  return rows.map((row) => columns.map((c) => cellText(row[c])));
}

// Markdown — | 는 \| 로, 줄바꿈은 <br> 로
export function toMarkdown(table) {
  if (table.columns.length === 0) return '';
  const esc = (v) => v.replace(/\|/g, '\\|').replace(/\r\n|\r|\n/g, '<br>');
  const line = (cells) => '| ' + cells.map(esc).join(' | ') + ' |';
  return [
    line(table.columns),
    '| ' + table.columns.map(() => '---').join(' | ') + ' |',
    ...toMatrix(table).map(line),
  ].join('\n');
}

// CSV — RFC 4180 따옴표 규칙, CRLF, 엑셀 한글 깨짐 방지용 UTF-8 BOM
export function toCsv(table) {
  const esc = (v) => (/[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
  return '﻿' + [table.columns, ...toMatrix(table)].map((cells) => cells.map(esc).join(',')).join('\r\n');
}

export function downloadText(text, filename, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
