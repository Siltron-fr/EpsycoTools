/* Détection de mise à jour du site (GitHub Pages garde les fichiers en cache ~10 min).
   On compare ce que le navigateur a en cache avec la version en ligne. S'il y a une différence,
   on re-télécharge les fichiers en contournant le cache puis on recharge la page : l'équivalent d'un Maj + F5. */
(function () {
  const ROOT = new URL('../', document.currentScript.src).href;
  const FILES = ['index.html', 'html/matrice.html', 'style/style.css', 'js/feed-data.js', 'js/feed.js',
                 'js/matrix-data.js', 'js/nav.js', 'js/script.js', 'js/timer-data.js', 'js/timer.js', 'js/update-check.js'];
  const urls = FILES.map(f => ROOT + f).concat(location.href.split('#')[0]);
  const GUARD = 'epsyco:reloaded', LAST = 'epsyco:checked';
  const now = Date.now();
  try {
    if (now - (+sessionStorage.getItem(GUARD) || 0) < 30000) return; // on vient de recharger : pas de boucle
    if (now - (+localStorage.getItem(LAST) || 0) < 60000) return;    // déjà vérifié il y a moins d'une minute
    localStorage.setItem(LAST, now);
  } catch (e) { return; }

  const get = (u, cache) => fetch(u, { cache }).then(r => r.ok ? r.text() : Promise.reject());
  const changed = u => Promise.all([get(u, 'default'), get(u, 'no-store')]).then(([a, b]) => a !== b).catch(() => false);

  function run() {
    Promise.all(urls.map(changed)).then(res => {
      if (!res.some(Boolean)) return;
      try { sessionStorage.setItem(GUARD, Date.now()); } catch (e) {}
      // 'reload' remplace les copies en cache par les versions en ligne, puis on recharge
      return Promise.all(urls.map(u => fetch(u, { cache: 'reload' }).catch(() => {}))).then(() => location.reload());
    }).catch(() => {});
  }
  addEventListener('load', () => (window.requestIdleCallback || setTimeout)(run));
})();
