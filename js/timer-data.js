/* =====================================================================
   TIMER DE L'ACCUEIL  (visible uniquement sur la page d'accueil, en haut du feed)
   ---------------------------------------------------------------------
   Dates au format 'AAAA-MM-JJ HH:mm' : toujours l'HEURE DE PARIS, quel que soit le fuseau
   du visiteur (l'heure d'été / d'hiver est gérée toute seule).

   Ce que le timer affiche (les temps s'écrivent « 5 jours 2 heures 52 minutes et 3 secondes »,
   et les unités vides du début disparaissent au fur et à mesure) :
     • avant l'ouverture              -> uniquement le temps avant l'ouverture
     • serveur ouvert                 -> « Jour N » + le temps avant l'impact, et une barre de progression
                                         qui va de l'ouverture jusqu'à l'explosion de la météorite (☄️ = où on en est)
     • peu avant une maintenance      -> idem + une ligne « Maintenance dans … »
     • pendant une maintenance        -> « Maintenance » + « Reprise dans … » (la barre est en pause)
   Pendant une maintenance le serveur est en pause : ces jours ne comptent pas dans le numéro du jour,
   n'avancent pas la barre et repoussent la météorite d'autant.

   ⚠ LES DATES CI-DESSOUS SONT DES EXEMPLES : remplace-les par les vraies.
   ===================================================================== */
const TIMER_CONFIG = {
  // Passe à true pour cacher le timer sur tout le site (par exemple quand la saison est finie)
  hidden: false,

  open:   '2026-10-16 20:00',   // ouverture du serveur = début du « Jour 1 » (le jour change chaque jour à cette heure)

  // Impact de la météorite : la date prévue SANS maintenance. Chaque maintenance
  // la repousse automatiquement de sa durée. null = timer météorite masqué.
  meteor: '2026-11-15 20:00',
  meteorPausedByMaintenance: true, // false = la date ci-dessus est une date réelle, jamais décalée

  warnDays: 2,                     // prévient X jours avant le début d'une maintenance

  // Maintenances : début + durée EN JOURS (days). Sans « days », la durée est de 1 jour.
  maintenances: [
    // { start: '2026-11-03 08:00', days: 2 },     // maintenance 1 : 2 jours
    // { start: '2026-11-24 08:00', days: 1 },     // maintenance 2 : 1 jour
  ]
};
