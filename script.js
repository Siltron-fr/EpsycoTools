const ICON = { bad: '✕', warn: '⚠' };
const ANGLE = 60, SIN = Math.sin(ANGLE * Math.PI / 180), COS = Math.cos(ANGLE * Math.PI / 180);
const CODE_KEYS = {};
Object.keys(CODES).forEach(k => CODE_KEYS[k.toLowerCase()] = k);

function cellCode(v) {
  v = (v || '').replace(/\uFE0F/g, '').trim();
  if (!v) return '';
  const k = CODE_KEYS[v.toLowerCase()];
  if (k) return k;
  CODES[v] = { type: 'warn', message: v };
  CODE_KEYS[v.toLowerCase()] = v;
  return v;
}

function parseTSV(txt) {
  const lines = txt.replace(/\r/g, '').split('\n').filter(l => l.trim() !== '');
  const jobs = (lines[0] || '').split('\t').map(s => s.trim()).filter(s => s && !/modifiable/i.test(s));
  const m = [];
  for (const line of lines.slice(1)) {
    if (m.length >= jobs.length) break;
    const cells = line.split('\t');
    const nameIdx = cells.findIndex(c => c.trim() && !/^(true|false)$/i.test(c.trim()));
    if (nameIdx < 0 || /s[ée]lectionn/i.test(cells[nameIdx])) continue;
    m.push(jobs.map((_, j) => cellCode(cells[nameIdx + 1 + j])));
  }
  while (m.length < jobs.length) m.push(jobs.map(() => ''));
  return { jobs, m };
}

const data = parseTSV(MATRIX_TSV);
const selected = new Set();
const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const typeOf = c => c ? CODES[c].type : '';


function status(j) {
  if (!selected.size) return { s: '', reasons: [] };
  if (selected.has(j)) return { s: 'sel', reasons: [] };
  const reasons = [];
  for (const i of selected) {
    const cands = [data.m[i][j], data.m[j][i]].filter(Boolean);
    const code = cands.find(c => typeOf(c) === 'bad') || cands[0];
    if (code) reasons.push({ from: i, code });
  }
  reasons.sort((a, b) => (typeOf(a.code) === 'bad' ? 0 : 1) - (typeOf(b.code) === 'bad' ? 0 : 1));
  const s = !reasons.length ? 'ok' : reasons.some(r => typeOf(r.code) === 'bad') ? 'bad' : 'warn';
  return { s, reasons };
}

function render() {
  const { jobs, m } = data;
  const info = jobs.map((_, j) => status(j));
  const st = info.map(x => x.s);
  let h = '<table><thead><tr><th></th>';
  jobs.forEach((n, j) => h += `<th class="col" data-job="${j}"><div class="${st[j] ? 'st-' + st[j] : ''}">${esc(n)}</div></th>`);
  h += '</tr></thead><tbody>';
  jobs.forEach((n, i) => {
    h += `<tr><th class="row ${st[i] ? 'st-' + st[i] : ''}" data-job="${i}"><label><input type="checkbox" class="cb" ${selected.has(i) ? 'checked' : ''}><span>${esc(n)}</span></label></th>`;
    jobs.forEach((_, j) => {
      const c = m[i][j], t = typeOf(c);
      const cls = ['c', i === j ? 'diag' : '', t === 'bad' ? 'v1' : t === 'warn' ? 'v2' : '', selected.has(i) || selected.has(j) ? 'hl' : ''].join(' ');
      h += `<td class="${cls}" title="${esc(n)} ↔ ${esc(jobs[j])}${c ? ' : ' + esc(CODES[c].message) : ''}">${ICON[t] || ''}</td>`;
    });
    h += '</tr>';
  });
  $('wrap').innerHTML = h + '</tbody></table>';
  renderPanel(info);
  fit();
}

function renderPanel(info) {
  const { jobs } = data;
  const body = $('panelBody');
  if (!selected.size) { body.innerHTML = '<span class="hint">Coche un job (ligne ou colonne) pour voir les compatibilités.</span>'; return; }
  const g = { bad: [], warn: [], ok: [] };
  info.forEach((x, j) => { if (g[x.s]) g[x.s].push(j); });
  const multi = selected.size > 1;
  const item = (j, cls) => `<div class="it st-${cls}" data-job="${j}"><b>${esc(jobs[j])}</b>${info[j].reasons.map(r =>
    `<small>${multi ? esc(jobs[r.from]) + ' : ' : ''}${ICON[typeOf(r.code)]} ${esc(CODES[r.code].message)}</small>`).join('')}</div>`;
  let h = `<div class="selbox">${[...selected].map(i => `<span class="chip">${esc(jobs[i])}<button data-rm="${i}" aria-label="Retirer">×</button></span>`).join('')}</div>`;
  if (g.bad.length)  h += `<section><h3 class="g bad">Incompatibles <i>${g.bad.length}</i></h3>${g.bad.map(j => item(j, 'bad')).join('')}</section>`;
  if (g.warn.length) h += `<section><h3 class="g warn">Sous conditions <i>${g.warn.length}</i></h3>${g.warn.map(j => item(j, 'warn')).join('')}</section>`;
  if (g.ok.length)   h += `<section><h3 class="g ok">Compatibles <i>${g.ok.length}</i></h3><div class="pills">${g.ok.map(j => `<span class="st-ok" data-job="${j}">${esc(jobs[j])}</span>`).join('')}</div></section>`;
  body.innerHTML = h;
}

function fit() {
  const n = data.jobs.length;
  if (!n) return;
  const w = $('wrap'), maxLen = Math.max(...data.jobs.map(s => s.length));
  const availW = w.clientWidth - 16, availH = w.clientHeight - 16;
  let fs = 11, label, colh, over, cell;
  for (let k = 0; k < 3; k++) {
    const L = maxLen * fs * .56;
    label = Math.min(L + 34, availW * .3);
    colh = L * SIN + fs + 16;
    over = L * COS + 14;
    cell = Math.floor(Math.min((availW - label - over) / n, (availH - colh) / n) - 1);
    cell = Math.max(5, Math.min(cell, 40));
    fs = Math.max(7.5, Math.min(cell * .48, 13));
  }
  const s = w.style;
  s.setProperty('--cell', cell + 'px'); s.setProperty('--fs', fs + 'px');
  s.setProperty('--label', label + 'px'); s.setProperty('--colh', colh + 'px');
  s.setProperty('--over', over + 'px');
  s.setProperty('--cb', Math.max(9, Math.min(cell * .6, 16)) + 'px');
}

function toggle(j) { selected.has(j) ? selected.delete(j) : selected.add(j); render(); }

$('wrap').addEventListener('click', e => {
  const th = e.target.closest('th[data-job]');
  if (!th) return;
  if (e.target.tagName === 'INPUT') return toggle(+th.dataset.job);
  if (e.target.closest('label')) return; 
  toggle(+th.dataset.job);
});
$('panelBody').addEventListener('click', e => {
  if (e.target.dataset.rm !== undefined) { selected.delete(+e.target.dataset.rm); return render(); }
  const it = e.target.closest('[data-job]');
  if (it) toggle(+it.dataset.job);
});
$('btnClear').onclick = () => { selected.clear(); render(); };
new ResizeObserver(fit).observe($('wrap'));
render();
