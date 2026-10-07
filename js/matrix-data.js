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
