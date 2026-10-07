/* Génère le feed à partir de feed-data.js.
   Mise en page « treemap » : les cases se partagent l'écran en proportion de leur poids (w × h),
   sans trou ni scroll, et se recalculent à chaque redimensionnement. */
(function () {
  const feed = document.getElementById('feed'), GAP = 14;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  if (!FEED.length) return;

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

  feed.innerHTML = FEED.map((f, i) => {
    const grad = (f.color || ['#4f6bff', '#8a5cff']).join(',');
    const img = resolveImage(f.image);
    const gradient = `linear-gradient(135deg,${grad})`;
    const bg = img ? '' : `background:${gradient};`;
    return `<a class="tile ${img ? '' : 'noimg'}" data-bg="${gradient}" href="${esc(f.href || '#')}" ${f.newTab ? 'target="_blank" rel="noopener"' : ''} style="--d:${i * 50}ms;${bg}">
      <div class="media">${img ? `<img src="${esc(img)}" alt="${esc(f.title)}" loading="lazy" referrerpolicy="no-referrer">` : ''}</div>
      ${f.tag ? `<span class="tag">${esc(f.tag)}</span>` : ''}
      <div class="cap"><h3>${esc(f.title)}</h3>${f.text ? `<p>${esc(f.text)}</p>` : ''}</div></a>`;
  }).join('');

  // Image introuvable : on retombe sur le dégradé, texte toujours visible
  feed.addEventListener('error', e => {
    if (e.target.tagName !== 'IMG') return;
    const t = e.target.closest('.tile');
    t.classList.add('noimg'); t.style.background = t.dataset.bg; e.target.remove();
  }, true);

  // Effet carte : légère inclinaison qui suit la souris
  const VARS = ['--rx', '--ry'];
  feed.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const t = e.target.closest('.tile');
    if (!t) return;
    const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    t.classList.add('tilt');
    const v = [(.5 - py) * 3 + 'deg', (px - .5) * 3 + 'deg'];
    VARS.forEach((k, i) => t.style.setProperty(k, v[i]));
  });
  feed.addEventListener('pointerout', e => {
    const t = e.target.closest('.tile');
    if (!t || t.contains(e.relatedTarget)) return;
    t.classList.remove('tilt'); VARS.forEach(k => t.style.removeProperty(k));
  });

  const tiles = [...feed.children];
  const weights = FEED.map(f => Math.max(0.5, (f.w || 1) * (f.h || 2)));

  // Découpe récursive du rectangle (x, y, w, h) entre les cases [a, b)
  function place(a, b, x, y, w, h) {
    if (b - a === 1) {
      const t = tiles[a].style;
      t.left = x + 'px'; t.top = y + 'px';
      t.width = (w - GAP) + 'px'; t.height = (h - GAP) + 'px';
      t.setProperty('--s', Math.min(w, h) - GAP + 'px');
      return;
    }
    let total = 0; for (let i = a; i < b; i++) total += weights[i];
    let cum = 0, k = a + 1, best = Infinity, kCum = 0;
    for (let i = a; i < b - 1; i++) {
      cum += weights[i];
      const d = Math.abs(cum - total / 2);
      if (d < best) { best = d; k = i + 1; kCum = cum; }
    }
    const r = kCum / total;
    if (w >= h) { place(a, k, x, y, w * r, h); place(k, b, x + w * r, y, w * (1 - r), h); }
    else        { place(a, k, x, y, w, h * r); place(k, b, x, y + h * r, w, h * (1 - r)); }
  }

  function layout() {
    const W = feed.clientWidth, H = feed.clientHeight;
    if (W < 50 || H < 50) return;
    place(0, tiles.length, 0, 0, W + GAP, H + GAP);
  }
  new ResizeObserver(layout).observe(feed);
  layout();
})();
