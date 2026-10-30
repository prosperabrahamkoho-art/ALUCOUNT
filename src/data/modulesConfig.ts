import { ModuleDefinition, UserRole, ModuleId } from '../types';

export const ALUCOUNT_MODULES: ModuleDefinition[] = [
  // --- 1. Modules de haute direction et d'administration ---
  {
    id: '01_pdg_supervision',
    number: '01',
    name: 'Espace Haute Direction PDG',
    category: '1. Gestion & Administration',
    shortDesc: 'Supervision souveraine spectateur : annotations, renvoi en contrôle, mise en attente et déclaration finalisée',
    allowedRoles: ['PDG', 'ADMIN', 'DG', 'ADJOINT_PDG']
  },
  {
    id: '02_admin_security',
    number: '02',
    name: 'Administration générale et sécurité',
    category: '1. Gestion & Administration',
    shortDesc: 'Paramètres système, règles d\'accès et mot de passe de garde (Réservé Direction & Magasinier)',
    // Réservé exclusivement à la Haute Direction et au Magasinier — Accès supprimé pour les responsables et contrôleurs
    allowedRoles: ['ADMIN', 'PDG', 'MAGASINIER']
  },
  {
    id: '03_users',
    number: '03',
    name: 'Gestion des utilisateurs',
    category: '1. Gestion & Administration',
    shortDesc: 'Création de comptes, invitations WhatsApp/Email, activation et statuts',
    allowedRoles: ['PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE']
  },
  {
    id: '04_roles_permissions',
    number: '04',
    name: 'Rôles, permissions et délégations',
    category: '1. Gestion & Administration',
    shortDesc: 'Délégations nominatives et permissions temporaires de contrôle',
    allowedRoles: ['PDG', 'MAGASINIER', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR']
  },
  {
    id: '05_shops',
    number: '05',
    name: 'Gestion des boutiques et agences',
    category: '1. Gestion & Administration',
    shortDesc: 'Boutiques, dépôts, mode chantier et cloisonnement strict des accès',
    allowedRoles: ['PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR']
  },

  // --- 2. Modules de gestion des articles et des inventaires ---
  {
    id: '06_catalog_tariffs',
    number: '06',
    name: 'Base des articles et tarifs',
    category: '2. Articles & Inventaires',
    shortDesc: 'Catalogue Aluminium par couleur, Accessoires et grille tarifaire officielle',
    // Tout le monde peut consulter — seule la modification de prix est restreinte
    allowedRoles: ['ADMIN', 'PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR', 'INVENTORISTE', 'RESPONSABLE_BOUTIQUE']
  },
  {
    id: '07_campaigns',
    number: '07',
    name: 'Planification d\'inventaire',
    category: '2. Articles & Inventaires',
    shortDesc: 'Planification des inventaires, convocation automatique chef d\'agence (in-app, mail, WhatsApp PDF) et calendrier',
    allowedRoles: ['PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR', 'INVENTORISTE']
  },
  {
    id: '08_physical_counting',
    number: '08',
    name: 'Saisie de l\'inventaire physique',
    category: '2. Articles & Inventaires',
    shortDesc: 'Comptage terrain, séparation bon état / gâté, mobile et autosave',
    // Seuls les inventoristes sur le terrain peuvent saisir le comptage
    allowedRoles: ['INVENTORISTE']
  },
  {
    id: '09_control_verification',
    number: '09',
    name: 'Contrôle et vérification',
    category: '2. Articles & Inventaires',
    shortDesc: 'Vérification du statut d\'inventaire certifié (ouvert à tous), modifications réservées aux contrôleurs et responsables',
    // Accessible à tous les collaborateurs pour vérifier le statut des inventaires
    allowedRoles: ['ADMIN', 'PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR', 'INVENTORISTE', 'RESPONSABLE_BOUTIQUE']
  },
  {
    id: '10_discrepancies',
    number: '10',
    name: 'Gestion des écarts et anomalies',
    category: '2. Articles & Inventaires',
    shortDesc: 'Rapprochement des écarts, freinte matière, justification des dégradations',
    allowedRoles: ['ADMIN', 'PDG', 'MAGASINIER', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR']
  },
  {
    id: '11_validation_closing',
    number: '11',
    name: 'Traitement & Validation',
    category: '2. Articles & Inventaires',
    shortDesc: 'Traitement officiel, calcul des écarts, stock initial modifiable, commission libre — Consultation ouverte à tous sauf Inventoristes',
    // RÈGLE : Tous peuvent consulter les inventaires clôturés et leur traitement, SAUF les Inventoristes
    allowedRoles: ['ADMIN', 'PDG', 'DG', 'ADJOINT_PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR', 'RESPONSABLE_BOUTIQUE']
  },
  {
    id: '12_history_reopen',
    number: '12',
    name: 'Historique, versions & réouverture',
    category: '2. Articles & Inventaires',
    shortDesc: 'Archives des versions V1/V2 et procédure exceptionnelle de réouverture — Consultation ouverte à tous sauf Inventoristes',
    // RÈGLE : Tous peuvent consulter l'historique des inventaires validés, SAUF les Inventoristes
    allowedRoles: ['ADMIN', 'PDG', 'DG', 'ADJOINT_PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR', 'RESPONSABLE_BOUTIQUE']
  },

  // --- 3. Modules de consultation et de suivi ---
  {
    id: '13_reports_stats',
    number: '13',
    name: 'Rapports et statistiques',
    category: '3. Consultation & Suivi',
    shortDesc: 'Valorisation globale FCFA, ventilation par couleur et analyse de freinte',
    allowedRoles: ['ADMIN', 'PDG', 'DG', 'ADJOINT_PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR', 'RESPONSABLE_BOUTIQUE']
  },
  {
    id: '14_documents_exports',
    number: '14',
    name: 'Documents et exports',
    category: '3. Consultation & Suivi',
    shortDesc: 'Procès-verbaux scellés, exports PDF, Excel, CSV et certificats officiels',
    allowedRoles: ['ADMIN', 'PDG', 'DG', 'ADJOINT_PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR', 'RESPONSABLE_BOUTIQUE']
  },
  {
    id: '15_notifications',
    number: '15',
    name: 'Messagerie, Preuves & Notifications',
    category: '3. Consultation & Suivi',
    shortDesc: 'Messagerie collaborative administration-utilisateurs, envoi de pièces justificatives / photos et alertes système',
    allowedRoles: ['ADMIN', 'PDG', 'DG', 'ADJOINT_PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR', 'INVENTORISTE', 'RESPONSABLE_BOUTIQUE']
  },
  {
    id: '16_audit_security',
    number: '16',
    name: 'Journal d\'audit & surveillance',
    category: '3. Consultation & Suivi',
    shortDesc: 'Historique immuable de chaque opération, tentatives bloquées et intégrité',
    allowedRoles: ['ADMIN', 'PDG', 'DG', 'ADJOINT_PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR']
  },
  {
    id: '17_archives',
    number: '17',
    name: 'Archives des inventaires clôturés',
    category: '3. Consultation & Suivi',
    // RÈGLE UNIVERSELLE : TOUS les utilisateurs peuvent consulter les inventaires clôturés, SAUF les Inventoristes
    shortDesc: 'Registre officiel des PV scellés, filtrage par exercice / boutique et export CSV — Ouvert à tous sauf Inventoristes',
    allowedRoles: ['ADMIN', 'PDG', 'DG', 'ADJOINT_PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR', 'RESPONSABLE_BOUTIQUE']
  }
];

export function canUserAccessModule(role: UserRole, moduleId: ModuleId): boolean {
  // L'Administrateur SaaS a accès à tous les modules
  if (role === 'ADMIN') return true;

  // PDG, DG, Adjoint PDG ont accès à tous les modules en mode souverain/spectateur (sauf saisie comptage terrain 08)
  if (role === 'PDG' || role === 'DG' || role === 'ADJOINT_PDG') {
    if (moduleId === '08_physical_counting') return false;
    return true;
  }

  // RÈGLE UNIVERSELLE CLÔTURE : Tout le monde SAUF les INVENTORISTES peut voir les inventaires
  // clôturés, leur traitement et leurs rapports (modules 11, 12, 17)
  if (role !== 'INVENTORISTE' && (
    moduleId === '11_validation_closing' || 
    moduleId === '12_history_reopen' || 
    moduleId === '17_archives'
  )) {
    return true;
  }

  const mod = ALUCOUNT_MODULES.find(m => m.id === moduleId);
  if (!mod) return false;
  return mod.allowedRoles.includes(role);
}
