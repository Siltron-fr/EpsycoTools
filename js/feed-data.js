/* =====================================================================
   FEED DE L'ACCUEIL  (seul fichier à modifier pour changer les cases)
   ---------------------------------------------------------------------
   Le feed est découpé en PÉRIODES (saisons, mois…). Chaque période est une page. Aucun nom de
   période n'est affiché : deux flèches (gauche / droite) les font défiler EN BOUCLE (ou ← → au clavier,
   ou en glissant sur mobile). Le nom de la période suivante apparaît en infobulle sur la flèche.
   Si une période contient beaucoup de cases, elle défile verticalement.
   S'il n'y a qu'une seule période, les flèches disparaissent.

   1) PERIODS : la liste des périodes, de la plus récente (à gauche) à la plus ancienne.
        id    : identifiant court (sans espace)
        label : nom de la période (infobulle des flèches)

   2) FEED : une ligne = une case. Champs :
        period  : id de la période où ranger la case (par défaut : la première)
        title   : titre affiché au survol
        text    : petit texte affiché au survol (facultatif)
        tag     : petite étiquette en haut à gauche (facultatif)
        date    : date de la news, 'AAAA-MM-JJ' (facultatif, affichée en haut à droite)
        image   : image de la case (facultatif). Accepte :
                    - un lien Imgur de page  : 'https://imgur.com/abc123'
                    - un lien direct         : 'https://i.imgur.com/abc123.png'
                    - un raccourci           : 'imgur:abc123'
                    - une autre URL ou un chemin local : 'images/news1.jpg'
                  (un album Imgur /a/... n'est pas utilisable : prends le lien d'une image)
        color   : [couleur1, couleur2] du dégradé si pas d'image (facultatif)
        href    : lien ouvert au clic
        newTab  : true pour ouvrir dans un nouvel onglet (facultatif)
        w, h    : taille de la case en colonnes × lignes de la grille (défaut 1 × 1).
                  Ex. w: 2, h: 2 = une grosse case « à la une ».
                  Une case seule dans sa période remplit tout l'écran.
        L'ordre des lignes = l'ordre d'affichage dans la période.
   ===================================================================== */
const PERIODS = [
  { id: 's8',     label: 'Saison 8' },
  { id: 'outils', label: 'Outils & liens' }
  // { id: 's7', label: 'Saison 7' },
];

const FEED = [
  { period: 's8', title: 'La saison 8 d\'Epsyco est en approche', text: 'Ouverture le 16 octobre 2026', date: '2026-10-16',
    image: 'https://i.imgur.com/9JoDeFP.png',
    href: 'https://discord.com/channels/939954016585150504/939954016585150507', newTab: true, w: 3, h: 2 },

  { period: 'outils', title: 'Matrice de compatibilité', text: 'Vois en un clic quels jobs sont compatibles, incompatibles ou sous conditions.',
    image: 'https://static.wikia.nocookie.net/serveur-epsyco/images/9/9f/Intm%C3%A9tier.png/revision/latest?cb=20240415090320&path-prefix=fr', tag: 'Outil',
    href: 'html/matrice.html' },
  { period: 'outils', title: 'Ecognome', text: 'Calculateur de prix', image: 'https://i.imgur.com/F22FNWb.png', tag: 'Outil',
    href: 'https://eco-gnome.com', newTab: true },
  { period: 'outils', title: 'Map Intéractive', text: 'Carte en ligne de la saison en cours', image: 'https://i.imgur.com/L5GufKL.png', tag: 'Outil',
    href: 'http://82.64.73.60:3001/index.html', newTab: true },
  { period: 'outils', title: 'Fandom', text: 'Wiki officiel d\'Epsyco.', image: 'https://i.imgur.com/gJDEOYf.png', tag: 'Outil',
    href: 'https://serveur-epsyco.fandom.com/fr/wiki/Wiki_Serveur_EpsyCo', newTab: true }
];
