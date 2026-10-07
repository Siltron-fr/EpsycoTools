/* =====================================================================
   FEED DE L'ACCUEIL  (seul fichier à modifier pour changer les cases)
   ---------------------------------------------------------------------
   Une ligne = une case. Champs :
     title   : titre affiché au survol
     text    : petit texte affiché au survol (facultatif)
     tag     : petite étiquette en haut à gauche (facultatif)
     image   : image de la case (facultatif). Accepte :
                 - un lien Imgur de page  : 'https://imgur.com/abc123'
                 - un lien direct         : 'https://i.imgur.com/abc123.png'
                 - un raccourci           : 'imgur:abc123'
                 - une autre URL ou un chemin local : 'images/news1.jpg'
               (un album Imgur /a/... n'est pas utilisable : prends le lien d'une image)
     color   : [couleur1, couleur2] du dégradé si pas d'image (facultatif)
     href    : lien ouvert au clic
     newTab  : true pour ouvrir dans un nouvel onglet (facultatif)
     w, h    : poids de la case (sa surface relative = w × h, défaut 1 × 2).
               Plus c'est grand, plus la case est grosse. L'ensemble des cases
               remplit TOUJOURS tout l'écran, quelle que soit la taille de la fenêtre.
   ===================================================================== */
// matrice / Ecognome / Map Intéractive / Wiki fandom

   const FEED = [
  { title: 'La saison 8 d\'Epsyco est en approche', text: 'Ouverture le 16 octobre 2026', image: 'https://i.imgur.com/9JoDeFP.png', 
    href: 'https://discord.com/channels/939954016585150504/939954016585150507', newTab: true, w: 2, h: 15 },
  { title: 'Matrice de compatibilité', text: 'Vois en un clic quels jobs sont compatibles, incompatibles ou sous conditions.',image: 'https://static.wikia.nocookie.net/serveur-epsyco/images/9/9f/Intm%C3%A9tier.png/revision/latest?cb=20240415090320&path-prefix=fr', tag: 'Outil', 
    href: 'matrice.html', w: 1, h: 1 },
  { title: 'Ecognome', text: 'Calculateur de prix', image: 'https://i.imgur.com/F22FNWb.png', tag: 'Outil',
    href: 'https://eco-gnome.com', w: 1, h: 1 },
  { title: 'Map Intéractive', text: 'Carte en ligne de la saison en cours', image: 'https://i.imgur.com/L5GufKL.png', tag: 'Outil',
    href: 'http://82.64.73.60:3001/index.html', w: 1, h: 1 },
  { title: 'Fandom', text: 'Wiki officiel d\'Epsyco.', image: 'https://i.imgur.com/gJDEOYf.png', tag: 'Outil', 
    href: 'https://serveur-epsyco.fandom.com/fr/wiki/Wiki_Serveur_EpsyCo', w: 1, h: 1 }
];
