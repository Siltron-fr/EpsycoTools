/* Logique de la matrice. Les données et les codes viennent de matrix-data.js */
const ICON = { bad: '✕', warn: '⚠' };
const ANGLE = 60, SIN = Math.sin(ANGLE * Math.PI / 180), COS = Math.cos(ANGLE * Math.PI / 180);
const CODE_KEYS = {};
Object.keys(CODES).forEach(k => CODE_KEYS[k.toLowerCase()] = k);

// Texte de la case -> clé de CODES ('' si vide). Un mot inconnu devient un ⚠ avec lui-même en message.
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

// Relation entre le job j et la sélection : { s: 'sel'|'bad'|'warn'|'ok'|'', reasons: [{from, code}] }
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

const openState = {}; // mémorise les catégories dépliées / repliées
const CATS = [['all', 'Tous les jobs'], ['sel', 'Sélection'], ['ok', 'Compatibles'], ['warn', 'Sous conditions'], ['bad', 'Incompatibles']];

// Liste : Sélection, puis Compatibles (haut) -> Sous conditions -> Incompatibles (bas)
function renderPanel(info) {
  const { jobs } = data;
  const multi = selected.size > 1;
  const g = { all: [], sel: [], ok: [], warn: [], bad: [] };
  info.forEach((x, j) => (selected.size ? g[x.s] : g.all).push(j));
  const item = (j, cat) => `<div class="it ${cat === 'all' ? '' : 'st-' + cat}" data-job="${j}">
    <input type="checkbox" class="cb" tabindex="-1" ${selected.has(j) ? 'checked' : ''}>
    <div><b>${esc(jobs[j])}</b>${(cat === 'warn' || cat === 'bad') ? info[j].reasons.map(r =>
      `<small>${multi ? esc(jobs[r.from]) + ' : ' : ''}${ICON[typeOf(r.code)]} ${esc(CODES[r.code].message)}</small>`).join('') : ''}</div></div>`;
  $('panelBody').innerHTML = CATS.filter(([k]) => g[k].length).map(([k, label]) =>
    `<details class="cat ${k}" data-cat="${k}" ${openState[k] === false ? '' : 'open'}><summary>${label}<i>${g[k].length}</i></summary>
     <div class="items">${g[k].map(j => item(j, k)).join('')}</div></details>`).join('');
}

// Cellules carrées, toutes de même taille, calculées pour tout faire tenir sans scroll.
function fit() {
  const n = data.jobs.length;
  if (!n) return;
  if ($('wrap').clientWidth < 60) return; // matrice repliée
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
  if (e.target.closest('label')) return; // le label relaie le clic à la case
  toggle(+th.dataset.job);
});
$('panelBody').addEventListener('click', e => {
  const it = e.target.closest('[data-job]');
  if (it) toggle(+it.dataset.job);
});
$('panelBody').addEventListener('toggle', e => { if (e.target.dataset.cat) openState[e.target.dataset.cat] = e.target.open; }, true);
$('btnMatrix').onclick = () => {
  const open = $('split').classList.toggle('open');
  $('btnMatrix').textContent = open ? '▦ Masquer la matrice' : '▦ Afficher la matrice';
  $('btnMatrix').setAttribute('aria-expanded', open);
  fit();
};
$('btnClear').onclick = () => { selected.clear(); render(); };
new ResizeObserver(fit).observe($('wrap'));
render();
