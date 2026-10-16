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
// Recherche : insensible à la casse et aux accents
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
let query = '';

// ---- Catégories et prix (configurés dans matrix-data.js) ----
const key = s => norm(String(s)).replace(/\s+/g, ' ');
const STAR = '<svg class="star" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
const OTHER = { id: '_autre', name: 'Autres', icon: '📦' };
const ALL_CATS = [...CATEGORIES, OTHER];
const catById = Object.fromEntries(ALL_CATS.map(c => [c.id, c]));
const catOf = {}, priceRule = {};
Object.entries(JOB_CATEGORY).forEach(([n, id]) => {
  if (!catById[id]) console.warn(`Catégorie inconnue « ${id} » pour le job « ${n} »`);
  catOf[key(n)] = id;
});
Object.entries(PRICES).forEach(([n, r]) => priceRule[key(n)] = r);
const jobCat = j => catById[catOf[key(data.jobs[j])]] || OTHER;
const iconHtml = ic => /^https?:|\.(png|webp|svg|jpe?g|gif)(\?.*)?$/i.test(ic) ? `<img src="${esc(ic)}" alt="" loading="lazy">` : `<span>${esc(ic)}</span>`;
const fmt = v => String(+v.toFixed(2));

// Contexte donné aux règles de prix : qui est sélectionné ?
function makeCtx() {
  const names = new Set([...selected].map(i => key(data.jobs[i])));
  return {
    has: (...n) => n.some(x => names.has(key(x))),
    all: (...n) => n.every(x => names.has(key(x))),
    count: names.size
  };
}
function priceOf(j, ctx) {
  const r = priceRule[key(data.jobs[j])];
  let v = r;
  try { if (typeof r === 'function') v = r(ctx); } catch (e) { console.warn('Règle de prix en erreur pour', data.jobs[j], e); v = undefined; }
  return v != null && Number.isFinite(+v) ? +v : DEFAULT_PRICE;
}

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
  const n = selected.size;
  $('hint').textContent = n ? `${n} job${n > 1 ? 's' : ''} sélectionné${n > 1 ? 's' : ''}` : 'Coche un ou plusieurs jobs pour voir avec lesquels ils fonctionnent.';
  $('btnClear').disabled = !n;
  renderPanel(info);
  fit();
}

const openState = {}; // mémorise les catégories dépliées / repliées
const CATS = [['all', 'Tous les jobs'], ['sel', 'Sélection'], ['ok', 'Compatibles'], ['warn', 'Sous conditions'], ['bad', 'Incompatibles']];

// Liste : Sélection, puis Compatibles -> Sous conditions -> Incompatibles ; chaque groupe est rangé par catégorie de job
function renderPanel(info) {
  const { jobs } = data;
  const multi = selected.size > 1;
  const ctx = makeCtx();
  const prices = jobs.map((_, j) => priceOf(j, ctx));
  const g = { all: [], sel: [], ok: [], warn: [], bad: [] };
  info.forEach((x, j) => {
    if (x.s !== 'sel' && query && !norm(jobs[j]).includes(query) && !norm(jobCat(j).name).includes(query)) return;
    (selected.size ? g[x.s] : g.all).push(j);
  });
  const item = (j, cat) => `<div class="it ${cat === 'all' ? '' : 'st-' + cat}" data-job="${j}" tabindex="0" role="button">
    <input type="checkbox" class="cb" tabindex="-1" ${selected.has(j) ? 'checked' : ''}>
    <div class="it-main"><b>${esc(jobs[j])}</b>${(cat === 'warn' || cat === 'bad') ? info[j].reasons.map(r =>
      `<small>${multi ? esc(jobs[r.from]) + ' : ' : ''}${ICON[typeOf(r.code)]} ${esc(CODES[r.code].message)}</small>`).join('') : ''}</div>
    <span class="price" title="Prix en étoiles">${STAR}${fmt(prices[j])}</span></div>`;
  // Une colonne verticale par catégorie ; les colonnes se placent côte à côte (et passent à la ligne si la place manque)
  const byCat = (list, k) => `<div class="jcs">` + ALL_CATS.map(c => [c, list.filter(j => jobCat(j) === c)]).filter(([, l]) => l.length).map(([c, l]) =>
    `<section class="jc"><h4 class="jc-h"><span class="ico">${iconHtml(c.icon)}</span><span class="jc-n">${esc(c.name)}</span><i>${l.length}</i></h4>
     <div class="items">${l.map(j => item(j, k)).join('')}</div></section>`).join('') + `</div>`;
  const total = [...selected].reduce((a, j) => a + prices[j], 0);
  const body = CATS.filter(([k]) => g[k].length).map(([k, label]) =>
    `<details class="cat ${k}" data-cat="${k}" ${openState[k] === false ? '' : 'open'}><summary>${label}<i>${g[k].length}</i>${k === 'sel' ? `<span class="total" title="Total en étoiles de la sélection">${STAR}${fmt(total)}</span>` : ''}</summary>
     ${byCat(g[k], k)}</details>`).join('');
  $('panelBody').innerHTML = body || `<p class="empty">Aucun job ne correspond à « ${esc(query)} ».</p>`;
  layoutCols();
}

// Colonnes de catégories : si une 2e ligne est nécessaire, les catégories sont réparties à parts égales
// (ex. 7 catégories qui ne tiennent pas sur une ligne -> 4 + 3 au lieu de 6 + 1)
const COL_MIN = 200, COL_GAP = 12, COL_MAX = 320;
function layoutCols() {
  document.querySelectorAll('.jcs').forEach(el => {
    const n = el.children.length, W = el.clientWidth;
    if (!n || !W) return; // groupe replié
    const fit = Math.max(1, Math.floor((W + COL_GAP) / (COL_MIN + COL_GAP)));
    const rows = Math.ceil(n / fit), cols = Math.ceil(n / rows);
    el.style.gridTemplateColumns = `repeat(${cols}, minmax(0, ${COL_MAX}px))`;
  });
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
$('panelBody').addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const it = e.target.closest('.it');
  if (!it) return;
  e.preventDefault();
  const j = +it.dataset.job;
  toggle(j);
  const again = $('panelBody').querySelector(`.it[data-job="${j}"]`); if (again) again.focus(); // garde le focus clavier
});
$('search').addEventListener('input', e => { query = norm(e.target.value); renderPanel(data.jobs.map((_, j) => status(j))); });
$('panelBody').addEventListener('toggle', e => { if (e.target.dataset.cat) { openState[e.target.dataset.cat] = e.target.open; layoutCols(); } }, true);
$('btnMatrix').onclick = () => {
  const open = $('split').classList.toggle('open');
  const label = open ? 'Masquer la matrice' : 'Afficher la matrice';
  $('btnMatrix').setAttribute('aria-pressed', open);
  $('btnMatrix').setAttribute('aria-label', label);
  $('btnMatrix').title = label;
  fit();
};
$('btnClear').onclick = () => { selected.clear(); render(); };
new ResizeObserver(fit).observe($('wrap'));
new ResizeObserver(layoutCols).observe($('panelBody'));

// Étoiles : bouton pour tout masquer / afficher (choix mémorisé)
let stars = typeof SHOW_STARS === 'undefined' ? true : !!SHOW_STARS;
try { const v = localStorage.getItem('epsyco:stars'); if (v !== null) stars = v === '1'; } catch (e) {}
function setStars(on, save) {
  stars = on;
  $('split').classList.toggle('no-stars', !on);
  const b = $('btnStars'), label = on ? 'Masquer les étoiles' : 'Afficher les étoiles';
  b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', label); b.title = label;
  if (save) try { localStorage.setItem('epsyco:stars', on ? '1' : '0'); } catch (e) {}
}
$('btnStars').onclick = () => setStars(!stars, true);
setStars(stars, false);
render();
