const EMBED = 'https://www.google.com/webhp?igu=1';
const ROOT = new URL('../', document.currentScript.src).href;
const TOOLS = [
  { id: 'home',   label: 'Epsyco',                   href: 'index.html',          icon: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>' },
  { id: 'matrix', label: 'Matrice de compatibilité', href: 'html/matrice.html',   icon: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>' },
  { id: 'shop',   label: 'EcoGnome',                 href: 'https://eco-gnome.com',  icon: '<path d="M12 2L6 11h12z"/><path d="M6 11c0 4.5 3 8 6 9s6-3.5 6-8H6z"/><path d="M12 10.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/><path d="M7 21h4v1H7zm6 0h4v1h-4z"/>', blank: true},
  { id: 'map',    label: 'Map Intéractive',          href: 'http://82.64.73.60:3001/index.html',       icon: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>', blank: true},
  { id: 'fandom', label: 'Wiki Fandom',              href: 'https://serveur-epsyco.fandom.com/fr/wiki/Wiki_Serveur_EpsyCo',    icon: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>', blank: true},
];
(function () {
  const page = document.body.dataset.page;
  const svg = p => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const items = TOOLS.map(t => {
    const finalHref = t.href.startsWith('http://') || t.href.startsWith('https://') ? t.href : new URL(t.href, ROOT).href;
    return `<a href="${finalHref}" class="${t.id === page ? 'active' : ''}" data-label="${t.label}" aria-label="${t.label}" ${t.blank ? 'target="_blank" rel="noopener"' : ''}>${svg(t.icon)}</a>`;
  }).join('');
    const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = `<div class="brand"><img src="${ROOT}assets/logo.webp" alt="Logo"></div>${items}`;
  document.querySelector('.shell').prepend(nav);
})();