const TOOLS = [
  { id: 'home',   label: 'Accueil',                  href: 'index.html',   icon: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>' },
  { id: 'matrix', label: 'Matrice de compatibilité', href: 'matrice.html', icon: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>' },
  { id: 'shop',   label: 'EcoGnome',                 href: 'https://eco-gnome.com', icon: '<path d="M12 2L6 11h12z"/><path d="M6 11c0 4.5 3 8 6 9s6-3.5 6-8H6z"/><path d="M12 10.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/><path d="M7 21h4v1H7zm6 0h4v1h-4z"/>' },
  { id: 'map',    label: 'Map Intéractive',          href: 'http://82.64.73.60:3001/index.html ', icon: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>' },
  { id: 'wiki',   label: 'Wiki Fandom',              href: 'https://serveur-epsyco.fandom.com/fr/wiki/Wiki_Serveur_EpsyCo', icon: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22V5.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5A2.5 2.5 0 0 1 20 22V5.5z"/><path d="M7 7h3M7 10h3M14 7h3M14 10h3"/>' },
];
(function () {
  const page = document.body.dataset.page;
  const svg = p => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const items = TOOLS.map(t =>
    `<a href="${t.href}" class="${t.id === page ? 'active' : ''}" data-label="${t.label}" aria-label="${t.label}">${svg(t.icon)}</a>`).join('');
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = `<div class="brand"><img src="logo.webp" alt="Logo"></div>${items}`;
  document.querySelector('.shell').prepend(nav);
})();
