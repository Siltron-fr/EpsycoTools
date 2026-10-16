/* Timer de l'accueil : bloc en haut de .content (uniquement sur les pages qui chargent ce script).
   Jour, temps avant la maintenance / l'impact, et barre de progression de la météorite. Réglages : timer-data.js */
(function () {
  if (typeof TIMER_CONFIG === 'undefined' || TIMER_CONFIG.hidden) return;
  const C = TIMER_CONFIG, host = document.currentScript;
  const DAY = 864e5;

  // 'AAAA-MM-JJ HH:mm' = heure de Paris (peu importe le fuseau du visiteur) ; sinon date ISO classique
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
  const parisOffset = ts => {
    const p = {}; parts.formatToParts(new Date(ts)).forEach(x => p[x.type] = +x.value);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ts / 1000) * 1000;
  };
  function toTime(v) {
    if (!v) return NaN;
    const m = String(v).trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!m) return Date.parse(v);
    const guess = Date.UTC(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    return guess - parisOffset(guess - parisOffset(guess));
  }

  const open = toTime(C.open);
  if (isNaN(open)) return;

  // Maintenances : { s: début, d: durée en ms } (durée donnée en jours, 1 jour par défaut)
  const maints = (C.maintenances || []).map(m => {
    const o = typeof m === 'string' ? { start: m } : (m || {});
    return { s: toTime(o.start), d: (Number(o.days) > 0 ? Number(o.days) : 1) * DAY };
  }).filter(m => Number.isFinite(m.s) && m.s + m.d > open).sort((a, b) => a.s - b.s);
  const warn = (C.warnDays == null ? 2 : C.warnDays) * DAY;

  // Météorite : chaque maintenance qui démarre avant l'impact le repousse de sa durée
  const meteorBase = toTime(C.meteor);
  let meteor = meteorBase;
  if (Number.isFinite(meteor) && C.meteorPausedByMaintenance !== false)
    for (const m of maints) if (m.s >= open && m.s < meteor) meteor += m.d;

  // Temps de pause (maintenances) déjà écoulé depuis l'ouverture : il ne compte pas dans le numéro du jour
  function paused(now) {
    let p = 0;
    for (const m of maints) { const a = Math.max(m.s, open), b = Math.min(m.s + m.d, now); if (b > a) p += b - a; }
    return p;
  }

  // « 5 jours 2 heures 52 minutes et 3 secondes » ; les unités vides du début disparaissent, les secondes restent toujours
  const unit = (n, one, many) => `${n} ${n > 1 ? many : one}`;
  function words(ms) {
    const s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    const out = [];
    if (d) out.push(unit(d, 'jour', 'jours'));
    if (d || h) out.push(unit(h, 'heure', 'heures'));
    if (d || h || m) out.push(unit(m, 'minute', 'minutes'));
    const sec = unit(s % 60, 'seconde', 'secondes');
    const txt = out.length ? `${out.join(' ')} et ${sec}` : sec;
    return `<span class="tmv">${txt.replace(/\d/g, c => `<i>${c}</i>`)}</span>`; // chiffres en cases fixes : rien ne bouge
  }

  // Version compacte pour la météorite : « Impact dans 27d 0h 5m 9s » (unités vides du début retirées, secondes toujours là)
  function compact(ms) {
    const t = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(t / 86400), h = Math.floor(t % 86400 / 3600), m = Math.floor(t % 3600 / 60);
    const out = [];
    if (d) out.push(d + 'd');
    if (d || h) out.push(h + 'h');
    if (d || h || m) out.push(m + 'm');
    out.push(t % 60 + 's');
    return 'Impact dans ' + out.join(' ').replace(/\d/g, c => `<i>${c}</i>`);
  }

  // Avancement de la météorite : 0 à l'ouverture, 1 à l'explosion. Il se mesure en « temps de jeu » :
  // une maintenance (serveur en pause) met donc la barre en pause.
  function progress(now) {
    if (!Number.isFinite(meteorBase)) return null;
    const shifts = C.meteorPausedByMaintenance !== false;
    const total = (shifts ? meteorBase : meteor) - open;
    if (total <= 0) return 1;
    return Math.max(0, Math.min(1, ((shifts ? now - open - paused(now) : now - open)) / total));
  }

  function state(now) {
    if (now < open) return { k: 'before', icon: '🚀', t: words(open - now), big: true, p: null }; // avant l'ouverture : uniquement le temps
    const left = meteor - now, p = progress(now);
    const m = left > 0 ? compact(left) : 'Impact !';
    const cur = maints.find(x => now >= x.s && now < x.s + x.d);
    if (cur) return { k: 'maintenance', icon: '🔧', t: 'Maintenance', s: `Reprise dans ${words(cur.s + cur.d - now)}`, m, p };
    const day = Math.floor((now - open - paused(now)) / DAY) + 1;
    const next = maints.find(x => x.s > now);
    const s = next && next.s - now <= warn ? `🔧 Maintenance dans ${words(next.s - now)}` : '';
    return { k: s ? 'warn' : 'running', icon: '🌍', t: `Jour ${day}`, s, m, p };
  }

  // Le bloc est construit une seule fois ; ensuite on ne met à jour que les textes et la barre
  const el = document.createElement('section');
  el.className = 'timer';
  el.setAttribute('role', 'timer');
  el.innerHTML = `<span class="ti"></span><div class="tleft"><div class="tday"></div><div class="tinfo"></div></div>
    <div class="tbar" aria-hidden="true"><div class="ttrack"><div class="tfill"></div><span class="tmark">☄️</span><span class="tlabel"></span></div><span class="tend">💥</span></div>`;
  const $ = q => el.querySelector(q);
  const nodes = { ti: $('.ti'), day: $('.tday'), info: $('.tinfo'), label: $('.tlabel') }, fill = $('.tfill'), mark = $('.tmark'), track = $('.ttrack');
  const put = (n, html) => { if (n._h !== html) { n._h = html; n.innerHTML = html; } };

  // Le texte suit la météorite : à sa droite tant qu'il y a la place, sinon à sa gauche
  const RESERVE = 172;
  function placeLabel(p) {
    const W = track.clientWidth, x = p * W, roomR = W - x - 20, roomL = x - 20;
    const right = roomR >= RESERVE || (roomL < RESERVE && roomR >= roomL);
    const st = nodes.label.style;
    if (right) { st.left = (x + 20) + 'px'; st.right = 'auto'; }
    else { st.right = (W - x + 20) + 'px'; st.left = 'auto'; }
  }

  function render() {
    const st = state(Date.now());
    el.dataset.state = st.k;
    put(nodes.ti, st.icon); put(nodes.day, st.t); put(nodes.info, st.s || ''); put(nodes.label, st.m || '');
    nodes.day.classList.toggle('big', !!st.big);
    el.classList.toggle('nobar', st.p == null);
    el.classList.toggle('crashed', st.p === 1);
    if (st.p != null) { const pc = (st.p * 100).toFixed(3) + '%'; fill.style.width = pc; mark.style.left = pc; placeLabel(st.p); }
  }
  render();
  host.before(el);
  render(); // une fois en place, pour connaître la largeur de la barre
  if (window.ResizeObserver) new ResizeObserver(render).observe(track);
  setInterval(render, 1000);
})();
