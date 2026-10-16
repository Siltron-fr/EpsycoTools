/* Génère le feed à partir de feed-data.js : une page par période, deux flèches (gauche / droite) qui les font défiler en boucle.
   Chaque période est une grille qui défile verticalement si elle déborde. */
(function () {
  const feed = document.getElementById('feed');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  if (!FEED.length) return;
  const periods = (typeof PERIODS !== 'undefined' && PERIODS.length) ? PERIODS : [{ id: '_', label: 'À la une' }];

  // Accepte : lien Imgur de page (imgur.com/abc123), lien direct (i.imgur.com/abc123.png),
  // raccourci "imgur:abc123", ou n'importe quelle autre URL / chemin local (inchangé).
  function resolveImage(u) {
    u = (u || '').trim();
    if (!u) return '';
    const fix = ext => (!ext || /^\.gifv$/i.test(ext)) ? (ext ? '.gif' : '.jpg') : ext;
    let m = u.match(/^imgur:([A-Za-z0-9]+)(\.\w+)?$/i);
    if (m) return `https://i.imgur.com/${m[1]}${fix(m[2])}`;
    m = u.match(/^(?:https?:\/\/)?(?:www\.|m\.)?imgur\.com\/(?:(a|gallery)\/)?([A-Za-z0-9]+)(\.\w+)?\/?(?:[?#].*)?$/i);
    if (m) {
      if (m[1]) { console.warn('Imgur : un album/galerie ne peut pas servir d\'image, utilise le lien d\'une image :', u); return ''; }
      return `https://i.imgur.com/${m[2]}${fix(m[3])}`;
    }
    m = u.match(/^(?:https?:\/\/)?i\.imgur\.com\/([A-Za-z0-9]+)(\.\w+)?(?:[?#].*)?$/i);
    if (m) return `https://i.imgur.com/${m[1]}${fix(m[2])}`;
    return u;
  }

  function fmtDate(d) {
    if (!d) return '';
    const t = /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + 'T12:00:00') : new Date(d);
    if (isNaN(t)) return String(d);
    const sameYear = t.getFullYear() === new Date().getFullYear();
    return t.toLocaleDateString('fr-FR', sameYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function tile(f) {
    const grad = (f.color || ['#2f6f3e', '#1d3b5c']).join(',');
    const img = resolveImage(f.image);
    const gradient = `linear-gradient(135deg,${grad})`;
    const w = Math.max(1, Math.floor(f.w) || 1), h = Math.max(1, Math.floor(f.h) || 1);
    const style = (w > 1 ? `grid-column:span ${w};` : '') + (h > 1 ? `grid-row:span ${h};` : '') + (img ? '' : `background:${gradient};`);
    return `<a class="tile ${img ? '' : 'noimg'}" data-bg="${gradient}" href="${esc(f.href || '#')}" ${f.newTab ? 'target="_blank" rel="noopener"' : ''} style="${style}">
      <div class="media">${img ? `<img src="${esc(img)}" alt="${esc(f.title)}" loading="lazy" referrerpolicy="no-referrer">` : ''}</div>
      ${f.tag ? `<span class="tag">${esc(f.tag)}</span>` : ''}${f.date ? `<span class="when">${esc(fmtDate(f.date))}</span>` : ''}
      <div class="cap"><h3>${esc(f.title)}</h3>${f.text ? `<p>${esc(f.text)}</p>` : ''}</div></a>`;
  }

  // Range chaque case dans sa période (période inconnue = première)
  const byPeriod = Object.fromEntries(periods.map(p => [p.id, []]));
  FEED.forEach(f => (byPeriod[f.period] || byPeriod[periods[0].id]).push(f));

  const multi = periods.length > 1;
  const chev = d => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  feed.innerHTML = (multi ? `<button class="fa prev" id="fPrev" aria-label="Période précédente">${chev('M15 6l-6 6 6 6')}</button>
      <button class="fa next" id="fNext" aria-label="Période suivante">${chev('M9 6l6 6-6 6')}</button>` : '') +
    `<div class="pager" id="pager">${periods.map(p =>
      `<section class="panel" aria-label="${esc(p.label)}">${byPeriod[p.id].map(tile).join('') || '<p class="pempty">Rien pour cette période.</p>'}</section>`).join('')}</div>`;

  // Image introuvable : on retombe sur le dégradé, texte toujours visible
  feed.addEventListener('error', e => {
    if (e.target.tagName !== 'IMG') return;
    const t = e.target.closest('.tile');
    t.classList.add('noimg'); t.style.background = t.dataset.bg; e.target.remove();
  }, true);

  if (!multi) return;
  const pager = document.getElementById('pager'), prev = document.getElementById('fPrev'), next = document.getElementById('fNext'), n = periods.length;
  const idx = () => Math.max(0, Math.min(n - 1, Math.round(pager.scrollLeft / (pager.clientWidth || 1))));
  // Les flèches font défiler les périodes EN BOUCLE : après la dernière, on revient à la première (et inversement)
  function go(dir) {
    const i = idx(), to = (i + dir + n) % n, wrapped = (dir > 0 && i === n - 1) || (dir < 0 && i === 0);
    pager.scrollTo({ left: to * (pager.clientWidth || 1), behavior: wrapped ? 'auto' : 'smooth' });
  }
  let cur = -1;
  function update() { // le nom de la période n'est pas affiché : il apparaît seulement en infobulle sur les flèches
    const i = idx();
    if (i === cur) return;
    cur = i;
    prev.title = periods[(i - 1 + n) % n].label; next.title = periods[(i + 1) % n].label;
  }
  let raf = 0;
  pager.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  prev.onclick = () => go(-1);
  next.onclick = () => go(1);
  addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1);
  });
  update();
  new ResizeObserver(() => { pager.scrollLeft = Math.max(cur, 0) * pager.clientWidth; }).observe(pager);
})();
