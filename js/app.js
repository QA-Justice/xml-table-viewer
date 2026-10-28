import { parseXml, findRowPaths, buildRows, pivot, XmlParseError } from './xml-parser.js';
import { toMarkdown, toCsv, cellText, downloadText, copyText } from './exporter.js';
import { SAMPLE_XML } from './sample.js';

const $ = (sel) => document.querySelector(sel);

const state = {
  root: null,        // 파싱된 문서 루트 요소
  rowPaths: [],      // 행 후보 [{ path, count }]
  rowPath: null,     // 선택한 행 경로 (null = 문서 전체 1행)
  table: null,       // { columns, rows }
  pivoted: false,
  filter: '',
};

// ===== 알림 =====
let toastTimer = null;
function toast(message, isError = false) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.toggle('error', isError);
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2400);
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ===== 줄 번호 =====
function renderLineNumbers() {
  const ta = $('#xmlInput');
  const count = ta.value.split('\n').length || 1;
  let s = '';
  for (let i = 1; i <= count; i++) s += i + '\n';
  $('#lineNumbers').textContent = s;
  $('#lineNumbers').scrollTop = ta.scrollTop;
}

// 파싱 오류가 난 줄을 선택하고 화면 가운데로 스크롤
function focusError(line) {
  const ta = $('#xmlInput');
  const lines = ta.value.split('\n');
  let pos = 0;
  for (let i = 0; i < line - 1 && i < lines.length; i++) pos += lines[i].length + 1;
  const lineText = lines[line - 1] || '';
  ta.focus();
  ta.setSelectionRange(pos, pos + lineText.length);
  const lineHeight = parseFloat(getComputedStyle(ta).lineHeight) || 20;
  ta.scrollTop = Math.max(0, (line - 1) * lineHeight - ta.clientHeight / 2);
  renderLineNumbers();
}

// ===== 변환 =====
function showError(message) {
  const box = $('#errorBox');
  box.textContent = message;
  box.hidden = !message;
}

function convert({ quiet = false } = {}) {
  const text = $('#xmlInput').value.trim();
  if (!text) {
    showError('');
    resetResult();
    if (!quiet) toast('Please enter XML.', true);
    return;
  }

  try {
    state.root = parseXml(text);
  } catch (error) {
    resetResult();
    if (error instanceof XmlParseError && error.line) {
      showError(`⚠️ Line ${error.line}, column ${error.column}: ${error.message}`);
      focusError(error.line);
    } else {
      showError(`⚠️ ${error.message}`);
    }
    return;
  }

  showError('');
  state.rowPaths = findRowPaths(state.root);
  state.rowPath = state.rowPaths.length ? state.rowPaths[0].path : null;
  state.pivoted = false;
  rebuild();
  if (!quiet) toast(`✅ Converted ${state.table.rows.length} row(s).`);
}

function rebuild() {
  state.table = buildRows(state.root, state.rowPath, { attributes: $('#attrToggle').checked });
  render();
}

function resetResult() {
  state.root = null;
  state.rowPaths = [];
  state.rowPath = null;
  state.table = null;
  state.pivoted = false;
  render();
}

// ===== 렌더 =====
function viewTable() {
  if (!state.table) return null;
  const base = state.pivoted ? pivot(state.table) : state.table;
  const query = state.filter.trim().toLowerCase();
  if (!query) return base;
  const rows = base.rows.filter((row) =>
    base.columns.some((c) => cellText(row[c]).toLowerCase().includes(query)));
  return { columns: base.columns, rows };
}

function cellClass(value) {
  if (value === null) return 'cell-null';
  if (value === '' || value === undefined) return 'cell-empty';
  if (/^-?\d+(\.\d+)?$/.test(value)) return 'cell-number';
  return '';
}

function renderRowSelect() {
  const picker = $('#rowPicker');
  const select = $('#rowSelect');
  picker.hidden = !state.root;
  if (!state.root) return;
  const options = state.rowPaths.map(({ path, count }) =>
    `<option value="${escapeHtml(path)}">${escapeHtml(path)} (${count})</option>`);
  options.push('<option value="">Whole document (1 row)</option>');
  select.innerHTML = options.join('');
  select.value = state.rowPath || '';
}

function render() {
  renderRowSelect();
  const container = $('#tableWrap');
  const view = viewTable();
  const hasTable = !!state.table && state.table.rows.length > 0;

  document.querySelectorAll('.needs-table').forEach((el) => { el.disabled = !hasTable; });
  $('#filterInput').disabled = !hasTable;
  $('#pivotBtn').textContent = state.pivoted ? '🔄 Restore' : '🔄 Pivot';

  if (!view) {
    $('#status').textContent = '';
    container.innerHTML = `
      <div class="empty">
        <p class="empty-title">No data to display.</p>
        <p>Paste XML above and press Convert.</p>
      </div>`;
    return;
  }

  const total = state.pivoted ? state.table.columns.length : state.table.rows.length;
  const unit = state.pivoted ? 'fields' : 'rows';
  const shown = view.rows.length === total ? `${total} ${unit}` : `${view.rows.length} of ${total} ${unit}`;
  const width = state.pivoted ? state.table.rows.length : state.table.columns.length;
  $('#status').textContent = `${shown} × ${width} ${state.pivoted ? 'rows' : 'columns'}`;

  const head = view.columns.map((c) => `<th class="col">${escapeHtml(c)}</th>`).join('');
  const body = view.rows.length
    ? view.rows.map((row) => `<tr>${view.columns.map((c, i) => {
      const value = row[c];
      const cls = state.pivoted && i === 0 ? 'field' : cellClass(value);
      const text = escapeHtml(cellText(value));
      return `<td class="${cls}" title="${text}">${text}</td>`;
    }).join('')}</tr>`).join('')
    : `<tr><td class="no-match" colspan="${view.columns.length}">No rows match “${escapeHtml(state.filter)}”.</td></tr>`;

  container.innerHTML = `<table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  find.refresh();
}

// ===== 찾기 (Ctrl+F) =====
// 크롬 사이드패널에서는 브라우저 찾기 바가 열리지 않아서, 결과 표 안에서 찾는 기능을 직접 제공한다.
const find = {
  query: '',
  hits: [],
  index: -1,

  open() {
    const bar = $('#findBar');
    const input = $('#findInput');
    bar.hidden = false;
    // 표에서 선택한 글자가 있으면 검색어로 가져온다
    const selected = String(window.getSelection() || '').trim();
    if (selected && !selected.includes('\n') && document.activeElement !== $('#xmlInput')) input.value = selected;
    input.focus();
    input.select();
    this.search(input.value);
  },

  close() {
    $('#findBar').hidden = true;
    this.query = '';
    this.clear();
    this.updateCount();
  },

  clear() {
    document.querySelectorAll('#tableWrap mark.find-hit').forEach((mark) => {
      mark.replaceWith(document.createTextNode(mark.textContent));
    });
    $('#tableWrap').normalize();
    this.hits = [];
    this.index = -1;
  },

  search(query) {
    this.query = query;
    this.index = -1;
    this.refresh();
    if (this.hits.length) this.go(0);
  },

  // 표를 다시 그린 뒤 하이라이트를 다시 입힌다 (현재 위치는 가능한 한 유지)
  refresh() {
    const keep = this.index;
    this.clear();
    const query = this.query.toLowerCase();
    const table = $('#tableWrap table');
    if (!query || !table) { this.updateCount(); return; }

    const walker = document.createTreeWalker(table, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const text = node.nodeValue;
      const lower = text.toLowerCase();
      let at = lower.indexOf(query);
      if (at === -1) continue;
      const frag = document.createDocumentFragment();
      let last = 0;
      while (at !== -1) {
        frag.append(text.slice(last, at));
        const mark = document.createElement('mark');
        mark.className = 'find-hit';
        mark.textContent = text.slice(at, at + query.length);
        frag.append(mark);
        this.hits.push(mark);
        last = at + query.length;
        at = lower.indexOf(query, last);
      }
      frag.append(text.slice(last));
      node.replaceWith(frag);
    }

    if (this.hits.length && keep !== -1) this.go(Math.min(keep, this.hits.length - 1), { scroll: false });
    else this.updateCount();
  },

  go(i, { scroll = true } = {}) {
    if (!this.hits.length) return;
    if (this.index !== -1 && this.hits[this.index]) this.hits[this.index].classList.remove('current');
    this.index = (i + this.hits.length) % this.hits.length;
    const mark = this.hits[this.index];
    mark.classList.add('current');
    if (scroll) mark.scrollIntoView({ block: 'center', inline: 'nearest' });
    this.updateCount();
  },

  next() { this.go(this.index + 1); },
  prev() { this.go(this.index - 1); },

  updateCount() {
    const count = $('#findCount');
    const input = $('#findInput');
    if (!this.query) { count.textContent = ''; input.classList.remove('no-hit'); return; }
    count.textContent = this.hits.length ? `${this.index + 1}/${this.hits.length}` : '0/0';
    input.classList.toggle('no-hit', !this.hits.length);
  },
};

function initFind() {
  const input = $('#findInput');
  input.addEventListener('input', () => find.search(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); e.shiftKey ? find.prev() : find.next(); }
    else if (e.key === 'Escape') { e.preventDefault(); find.close(); }
  });
  $('#findNextBtn').addEventListener('click', () => find.next());
  $('#findPrevBtn').addEventListener('click', () => find.prev());
  $('#findCloseBtn').addEventListener('click', () => find.close());

  document.addEventListener('keydown', (e) => {
    const mod = (e.ctrlKey || e.metaKey) && !e.altKey;
    if (mod && e.key.toLowerCase() === 'f') { e.preventDefault(); find.open(); }
    else if (e.key === 'F3' || (mod && e.key.toLowerCase() === 'g')) {
      e.preventDefault();
      if ($('#findBar').hidden) find.open();
      else e.shiftKey ? find.prev() : find.next();
    } else if (e.key === 'Escape' && !$('#findBar').hidden) find.close();
  });
}

// ===== 입력 =====
function setInput(text) {
  const input = $('#xmlInput');
  input.value = text;
  input.focus();
  renderLineNumbers();
  convert();
}

// 패널에 포커스가 없으면(새 탭에서 주소창이 포커스를 가진 경우 등) 크롬은 Ctrl+V를 주소창으로 보낸다.
// 사이드패널이 코드로 그 포커스를 가져올 방법은 없어서, 안내를 띄우고 Paste 버튼을 제공한다.
async function pasteFromClipboard() {
  try {
    // clipboardRead는 optional 권한 — 사용자 제스처 안에서 await 전에 요청해야 한다
    if (typeof chrome !== 'undefined' && chrome.permissions) {
      const granted = await chrome.permissions.request({ permissions: ['clipboardRead'] });
      if (!granted) {
        toast('Clipboard permission denied. Click the input and press Ctrl+V instead.', true);
        return;
      }
    }
    const text = await navigator.clipboard.readText();
    if (!text.trim()) {
      toast('Clipboard is empty.', true);
      return;
    }
    setInput(text);
  } catch (_) {
    toast('Could not read the clipboard. Click the input and press Ctrl+V instead.', true);
  }
}

function initFocusHint() {
  const hint = $('#focusHint');
  const update = () => { hint.hidden = document.hasFocus(); };
  hint.addEventListener('click', () => { $('#xmlInput').focus(); update(); });
  window.addEventListener('focus', () => {
    // 사용자가 필터 등 다른 입력칸에 있으면 포커스를 뺏지 않는다
    const active = document.activeElement;
    if (!active || active === document.body) $('#xmlInput').focus();
    update();
  });
  window.addEventListener('blur', update);
  document.addEventListener('visibilitychange', update);
  update();
}

// 입력창 밖(빈 영역 등)에서 붙여넣어도 입력창 내용으로 받는다
function initPageLevelPaste() {
  document.addEventListener('paste', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, [contenteditable=""], [contenteditable="true"]')) return;
    const text = e.clipboardData ? e.clipboardData.getData('text') : '';
    if (!text.trim()) return;
    e.preventDefault();
    setInput(text);
  });
}

// ===== 배율(줌) =====
// 사이드패널에서는 크롬 확대/축소가 잘 안 먹어서 패널 전체 배율을 직접 제공한다. 마지막 배율은 기억.
function initZoom() {
  const KEY = 'xtv.zoom';
  const LEVELS = [0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];
  let index = LEVELS.indexOf(1);
  try {
    const saved = LEVELS.indexOf(parseFloat(localStorage.getItem(KEY)));
    if (saved !== -1) index = saved;
  } catch (_) { /* 저장소를 못 쓰면 100% */ }

  const apply = () => {
    document.documentElement.style.zoom = LEVELS[index];
    $('#zoomValue').textContent = Math.round(LEVELS[index] * 100) + '%';
    try { localStorage.setItem(KEY, LEVELS[index]); } catch (_) {}
  };
  const step = (d) => { index = Math.min(LEVELS.length - 1, Math.max(0, index + d)); apply(); };
  const reset = () => { index = LEVELS.indexOf(1); apply(); };

  $('#zoomOutBtn').addEventListener('click', () => step(-1));
  $('#zoomInBtn').addEventListener('click', () => step(1));
  $('#zoomValue').addEventListener('click', reset);
  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    if (e.key === '=' || e.key === '+') { e.preventDefault(); step(1); }
    else if (e.key === '-') { e.preventDefault(); step(-1); }
    else if (e.key === '0') { e.preventDefault(); reset(); }
  });
  document.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    step(e.deltaY < 0 ? 1 : -1);
  }, { passive: false });
  apply();
}

// ===== 이벤트 =====
function fileStem() {
  const date = new Date().toISOString().slice(0, 10);
  return `xml-table-${state.pivoted ? 'pivot' : 'table'}-${date}`;
}

function bindEvents() {
  const input = $('#xmlInput');
  input.addEventListener('input', renderLineNumbers);
  input.addEventListener('scroll', () => { $('#lineNumbers').scrollTop = input.scrollTop; });
  input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') convert();
  });

  $('#convertBtn').addEventListener('click', () => convert());
  $('#pasteBtn').addEventListener('click', pasteFromClipboard);
  $('#sampleBtn').addEventListener('click', () => setInput(SAMPLE_XML));
  $('#clearBtn').addEventListener('click', () => {
    input.value = '';
    renderLineNumbers();
    showError('');
    state.filter = '';
    $('#filterInput').value = '';
    resetResult();
    input.focus();
  });

  const fileInput = $('#fileInput');
  $('#uploadBtn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(String(reader.result));
    reader.onerror = () => toast('Could not read the file.', true);
    reader.readAsText(file, 'utf-8');
  });

  $('#attrToggle').addEventListener('change', () => { if (state.root) rebuild(); });

  $('#rowSelect').addEventListener('change', (e) => {
    state.rowPath = e.target.value || null;
    rebuild();
  });

  $('#filterInput').addEventListener('input', (e) => {
    state.filter = e.target.value;
    render();
  });

  $('#pivotBtn').addEventListener('click', () => {
    state.pivoted = !state.pivoted;
    render();
  });

  $('#mdBtn').addEventListener('click', async () => {
    const view = viewTable();
    const ok = await copyText(toMarkdown(view));
    toast(ok ? `📋 Copied ${view.rows.length} row(s) as Markdown.` : 'Copy failed.', !ok);
  });

  $('#csvBtn').addEventListener('click', () => {
    const view = viewTable();
    downloadText(toCsv(view), `${fileStem()}.csv`, 'text/csv;charset=utf-8');
    toast(`📥 CSV downloaded (${view.rows.length} rows).`);
  });
}

bindEvents();
initFocusHint();
initPageLevelPaste();
initZoom();
initFind();
renderLineNumbers();
render();
