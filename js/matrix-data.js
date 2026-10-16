const CODES = {
  'X':  { type: 'bad',  message: 'Incompatible' },
  '⚠':  { type: 'warn', message: 'Exception Entreprise Patronale' },
   'AbbattageXInge': { type: 'warn', message: 'Autorisé si vous n\'avez pas le job mineur' },
  '✕':  { type: 'bad',  message: 'Incompatible' }
};

const MATRIX_TSV = `	Abbatage	Agriculture	Agriculture Avancé	Apiculture	Artiste	Boucherie	Boulangerie	Boulangerie  avancée	Bricoleur	Chasse	Chimiste	Composite	Couture	Cuisine	Cuisine avancée	Cuisine FDC	Cuisine industrielle	Electronique	Fonte	Fonte avancée	Forgeron	Industrie	Ingé	Maçonnerie	Maçonnerie Avancée	Mécanique	Menuiserie	Menuisier Avancée	Mineur	Mixologie	Mouture	Pêche	Pétrole	Poissonnerie	Poterie	Travail du papier	Récolte	Travail du verre
Abbatage																					⚠														✕			
Agriculture					✕		✕	✕					⚠	✕	✕	✕	✕												⚠	✕		✕						
Agriculture Avancé					✕		✕	✕			✕		⚠	✕	✕	✕	✕												⚠	✕		✕						
Apiculture					✕		✕	✕						✕	✕	✕	✕											✕		✕								✕
Artiste		✕	✕	✕																											✕						✕	
Boucherie							✕	✕					✕	✕	✕	✕	✕				✕					⚠				✕	✕							
Boulangerie		✕	✕	✕		✕																									✕	✕		✕			✕	
Boulangerie  avancée		✕	✕	✕		✕																									✕	✕		✕			✕	
Bricoleur																			✕	✕				⚠			✕								⚠			
Chasse																✕																						
Chimiste			✕														✕								✕				⚠	✕								✕
Composite																										✕							✕					
Couture		⚠	⚠			✕												✕		✕		✕	⚠				✕						✕				✕	
Cuisine		✕	✕	✕		✕																									✕	✕		✕			✕	
Cuisine avancée		✕	✕	✕		✕																									✕	✕		✕			✕	
Cuisine FDC		✕	✕	✕		✕				✕																					✕	✕		✕			✕	
Cuisine industrielle		✕	✕	✕		✕					✕																				✕	✕		✕			✕	
Electronique													✕						✕	✕													✕					✕
Fonte									✕									✕				✕	✕			✕							✕				✕	
Fonte avancée									✕				✕					✕				✕		✕	✕	✕							✕		✕			
Forgeron	⚠					✕																✕					✕	✕					✕					✕
Industrie													✕						✕	✕	✕												✕					✕
Ingé													⚠						✕					✕			✕		✕									
Maçonnerie									⚠											✕			✕			⚠											✕	
Maçonnerie Avancée											✕									✕																		
Mécanique						⚠						✕							✕	✕				⚠				✕					✕					
Menuiserie									✕				✕								✕		✕															
Menuisier Avancée				✕																	✕					✕												
Mineur		⚠	⚠								⚠												✕															
Mixologie		✕	✕	✕		✕					✕																					✕		✕			✕	✕
Mouture					✕	✕	✕	✕						✕	✕	✕	✕																			✕		
Pêche		✕	✕				✕	✕						✕	✕	✕	✕													✕								
Pétrole												✕	✕					✕	✕	✕	✕	✕				✕												✕
Poissonnerie							✕	✕						✕	✕	✕	✕													✕								
Poterie	✕								⚠											✕																		
Travail du papier																															✕						✕	
Récolte					✕		✕	✕					✕	✕	✕	✕	✕		✕					✕						✕						✕		
Travail du verre				✕							✕							✕			✕	✕								✕			✕					`;


/* =====================================================================
   CATÉGORIES DE JOBS  (modifie / ajoute les tiennes ici)
   ---------------------------------------------------------------------
   id   : identifiant court (sans espace), utilisé dans JOB_CATEGORY plus bas
   name : nom affiché
   icon : une émoji ('🪓') OU un lien / chemin d'image ('assets/icons/mine.png', 'https://…/icone.svg')
   L'ordre de cette liste = l'ordre d'affichage dans la liste des jobs.
   Un job absent de JOB_CATEGORY (ou avec une catégorie inconnue) tombe dans « Autres ».
   ===================================================================== */
const CATEGORIES = [
  { id: 'agri',       name: 'Profession Agricole',       icon: '🌾' },
  { id: 'artistique', name: 'Profession Artistique',     icon: '🎨' },
  { id: 'chasse',     name: 'Profession Chasseur',       icon: '🏹' },
  { id: 'aliment',    name: 'Profession Cuisine',        icon: '🍞' },
  { id: 'forgeron',   name: 'Profession Forgeron',       icon: '⚒️' },
  { id: 'inge',       name: 'Profession Ingénieur',      icon: '👨‍🔧' },
  { id: 'macon',      name: 'Profession Maçonnerie',     icon: '🧱' },
  { id: 'menuiserie', name: 'Profession Menuiserie',     icon: '🪵' },
  { id: 'science',    name: 'Profession Scientifique',   icon: '🔬' }
];

/* Job -> id de catégorie. Les noms sont les mêmes que dans la matrice
   (accents, majuscules et doubles espaces ne comptent pas). */
const JOB_CATEGORY = {
  'Abbatage': 'menuiserie',
  'Agriculture': 'agri',
  'Agriculture Avancé': 'agri',
  'Apiculture': 'agri',
  'Artiste': 'artistique',
  'Boucherie': 'chasse',
  'Boulangerie': 'aliment',
  'Boulangerie  avancée': 'aliment',
  'Bricoleur': 'science',
  'Chasse': 'chasse',
  'Chimiste': 'science',
  'Composite': 'menuiserie',
  'Couture': 'artistique',
  'Cuisine': 'aliment',
  'Cuisine avancée': 'aliment',
  'Cuisine FDC': 'aliment',
  'Cuisine industrielle': 'aliment',
  'Electronique': 'inge',
  'Fonte': 'forgeron',
  'Fonte avancée': 'forgeron',
  'Forgeron': 'forgeron',
  'Industrie': 'inge',
  "Ingé": 'inge',
  'Maçonnerie': 'macon',
  'Maçonnerie Avancée': 'macon',
  'Mécanique': 'inge',
  'Menuiserie': 'menuiserie',
  'Menuisier Avancée': 'menuiserie',
  'Mineur': 'macon',
  'Mixologie': 'aliment',
  'Mouture': 'aliment',
  'Pêche': 'chasse',
  'Pétrole': 'science',
  'Poissonnerie': 'chasse',
  'Poterie': 'macon',
  'Travail du papier': 'artistique',
  'Récolte': 'agri',
  'Travail du verre': 'macon'
};

/* =====================================================================
   PRIX EN ÉTOILES ★  (à toi de choisir les calculs)
   ---------------------------------------------------------------------
   DEFAULT_PRICE : prix des jobs qui n'ont pas de règle ci-dessous.
   PRICES        : 'Nom du job' : un nombre fixe, OU une fonction (ctx) => nombre.

   Dans la fonction, ctx permet de regarder les jobs actuellement sélectionnés :
     ctx.has('Mineur', 'Abbatage')   -> vrai si AU MOINS UN de ces jobs est sélectionné   (OU)
     ctx.all('Mineur', 'Abbatage')   -> vrai si TOUS ces jobs sont sélectionnés           (ET)
     ctx.count                       -> nombre de jobs sélectionnés

   Exemples :
     'Travail du verre': ctx => ctx.has('Mineur', 'Abbatage') ? 1 : 2,
     'Forgeron':         ctx => 3 - (ctx.has('Fonte') ? 1 : 0),
     'Mineur':           2,

   Le prix affiché sur un job non sélectionné = ce qu'il coûterait avec ta sélection actuelle.
   ===================================================================== */
const SHOW_STARS = false;   // étoiles visibles par défaut (chaque visiteur peut les masquer avec le bouton ★, son choix est mémorisé)
const DEFAULT_PRICE = 1;
const PRICES = {
  // EXEMPLE (valeurs à remplacer) : Si Mineur ou Abbatage alors Travail du verre coûte 1, sinon 2
  'Travail du verre': ctx => ctx.has('Mineur', 'Abbatage') ? 1 : 2
};
