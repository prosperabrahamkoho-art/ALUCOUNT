// ALUCOUNT — Types du domaine ALUTRACO
// Architecture officielle en 16 modules métiers

export type UserRole = 
  | 'ADMIN'                    // Administrateur SaaS / Créateur de l'espace (pleins pouvoirs, suppression exclusive)
  | 'PDG'                      // PDG Direction Générale
  | 'DG'                       // Directeur Général
  | 'ADJOINT_PDG'              // Adjoint au PDG
  | 'MAGASINIER'               // Magasinier Général (monopole exclusif des prix, import de grilles tarifaires)
  | 'SECRETAIRE_DIRECTION'     // Secrétaire de la direction (programmation inventaires, mise en contrôle, ajout d'utilisateurs/invitations)
  | 'RESPONSABLE_INVENTAIRE'   // Responsable chargé d'inventaire (finalisation et clôture de traitement, membre administration)
  | 'CONTROLEUR'               // Contrôleur d'inventaire (correction des quantités mal saisies, clôture du contrôle)
  | 'INVENTORISTE'             // Saisie terrain (comptage verrouillé après soumission, requêtes par messagerie)
  | 'RESPONSABLE_BOUTIQUE';    // Chef d'agence / Responsable boutique (consultation, justificatifs photos/documents)

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  shopId?: string;           // Assignation exclusive pour Responsable de boutique ou Inventoriste
  phone?: string;
  isDesignatedByPDG?: boolean; // Habilitation spéciale pour clore ou ouvrir un inventaire
  avatar?: string;
  uniqueIdentifier?: string; // Identifiant unique attribué (ex: ALU-USR-9281)
  status?: 'ACTIF' | 'SUSPENDU' | 'EN_ATTENTE_ACTIVATION';
  password?: string;
  confirmationCode?: string; // Code de confirmation reçu à 6 chiffres
  isEmailConfirmed?: boolean;
  twoFactorEnabled?: boolean;
  themePreference?: 'light' | 'dark' | 'system';
  notifyWhatsApp?: boolean;
  createdAt?: string;
}

export type LocationType = 'BOUTIQUE' | 'CHANTIER' | 'DEPOT_CENTRAL';

export interface Shop {
  id: string;
  code: string;               // Ex: ALT-BT-001
  name: string;               // Ex: Boutique Cotonou 01
  address: string;
  phone: string;
  email?: string;
  managerId?: string;
  managerName?: string;
  commissionRate?: number;    // % de commission défini (ex: 3.5%)
  initialStockValue?: number; // Stock de référence initial (ex: 98321613)
  initialStockDate?: string;  // Date stock initial (ex: 19/04/2026)
  status: 'ACTIVE' | 'SUSPENDUE' | 'INACTIVE' | 'ARCHIVEE';
  createdAt: string;
  lastValidationDate?: string;
  activeInventoriesCount: number;
  validatedInventoriesCount: number;
  type: LocationType;
}

// Paramètres généraux de l'entreprise (renseignés et personnalisés par la Secrétaire de Direction)
export interface CompanySettings {
  name: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  country: string;
  city: string;
  rccm?: string;
  ifu?: string;
  bankInfo?: string;
  legalNotice?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

// ── Traitement de l'Inventaire (Saisie Responsable Boutique & Calculs) ──
export interface ReportedSaleItem {
  id: string;
  designation: string;
  color?: string;
  quantity: number;
  unitPrice?: number;
  totalAmount: number;
  date?: string;
  note?: string;
}

export interface UndeliveredProductItem {
  id: string;
  designation: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number; // qty * unitPrice
  clientName?: string;
  invoiceRef?: string;
}

export interface ClientDebtItem {
  id: string;
  clientName: string;
  phone?: string;
  amount: number;
  invoiceRef?: string;
  dueDate?: string;
}

export interface TreatmentAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  shopName: string;
  nature: string;
  field: string;
  oldValue?: string;
  newValue: string;
}

export interface InventoryTreatment {
  id: string;
  inventoryId: string;
  shopId: string;
  shopName: string;
  periodStart: string;         // Ex: 19/04/2026
  periodEnd: string;           // Ex: 11/08/2026
  
  // 1. Stock compté d'aluminium (récupéré automatiquement du comptage physique)
  countedStockValue: number;   // Ex: 68 055 765
  countedStockDetails: {
    productId: string;
    designation: string;
    color?: string;
    quantity: number;
    unitPrice: number;
    totalValue: number;
  }[];

  // 2. Ventes reportées (saisies par le responsable de boutique)
  reportedSales: ReportedSaleItem[];
  totalReportedSales: number;

  // 3. Produits non livrés (déclarés par le responsable)
  undeliveredProducts: UndeliveredProductItem[];
  totalUndelivered: number;

  // 4. Dettes clients (saisies par le responsable)
  clientDebts: ClientDebtItem[];
  totalClientDebts: number;

  // 5. Commission de la boutique (appliquée automatiquement via le % défini)
  commissionRate: number;      // % ex: 3%
  commissionAmount: number;    // calculée automatiquement

  // Montant intermédiaire = Stock compté + Ventes reportées - Commission - Non livrés + Dettes
  intermediateAmount: number;

  // 6. Solde de la boutique (saisi par le responsable ou le responsable d'inventaire)
  balanceDate: string;         // Ex: 10/08/2026
  shopBalance: number;         // Ex: 30 428 022

  // Stock Total Calculé = Montant intermédiaire + Solde de la boutique
  // (Ou dans la présentation officielle : Stock Compté + Solde de la boutique = 98 483 787)
  totalCalculatedStock: number; // Ex: 98 483 787

  // Référence Stock Initial (ex: Capture 2)
  initialStockDate: string;    // Ex: 19/04/2026
  initialStockValue: number;   // Ex: 98 321 613

  // Résultat / Écart = Stock Total Calculé - Stock Initial
  gapAmount?: number;           // Ex: +162 174
  gapType?: 'POSITIF' | 'NEGATIF' | 'NUL';
  difference: number;          // Écart officiel calculé
  isPositiveDifference: boolean;

  // Contrôle & Validation officielle
  controlStatus: 'EN_ATTENTE_CONTROLE' | 'CONTROLE_EFFECTUE' | 'REJETE';
  controlledBy?: string;
  controlledAt?: string;
  validationStatus: 'NON_VALIDE' | 'VALIDE_DEFINITIF';
  validationNotes?: string;

  // Traçabilité des saisies
  auditTrail: TreatmentAuditEntry[];

  // Statut
  status?: 'SAISIE_EN_COURS' | 'SOUMIS_AU_CONTROLE' | 'VALIDE_DEFINITIF';
  lastEditedBy?: string;
  lastEditedAt?: string;
  validatedBy?: string;
  validatedAt?: string;
}

export type Category = 'Aluminium' | 'Accessoires';

export type AluminiumColor = 
  | 'Blanche' 
  | 'Grise' 
  | 'Bronze' 
  | 'Satinée' 
  | 'Beige' 
  | 'Noire'
  | 'Champagne'
  | 'Bois'
  | string;

export interface CatalogItem {
  id: string;
  code: string;
  category: Category;
  color?: AluminiumColor;     // Obligatoire pour Aluminium
  designation: string;        // Ex: RAIL 3V, SERRURE A CLE, etc.
  officialPrice: number;      // En FCFA
  unit: string;               // barre de 6m, pièce, paquet, mètre
  isActive: boolean;
  lastPriceUpdate: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  productName: string;
  color?: AluminiumColor;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  reason: string;
}

export type InventoryStatus = 
  | 'Brouillon'
  | 'En cours de comptage'
  | 'Comptage terminé'
  | 'En contrôle'
  | 'Prêt pour validation'
  | 'Validé et clôturé';

export type DamageReason = 
  | 'Déformé / Tordu'
  | 'Rayure profonde'
  | 'Oxydation / Taches'
  | 'Fissure / Cassé'
  | 'Incomplet'
  | 'Mauvais stockage'
  | 'Autre anomalie';

export interface InventoryLine {
  id: string;
  inventoryId: string;
  productId: string;
  designation: string;
  category: Category;
  color?: AluminiumColor;
  unit: string;
  officialPriceSnapshot: number; // Prix figé lors du comptage (FCFA)
  qtyGood: number;               // Quantité en bon état
  qtyDamaged: number;            // Quantité gâtée
  damageReason?: DamageReason;
  amountGood: number;            // Calculé: qtyGood * officialPriceSnapshot
  amountDamaged: number;         // Calculé: qtyDamaged * officialPriceSnapshot
  totalAmount: number;           // Montant total de la ligne
  observation?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  wasCorrected?: boolean;
}

export interface InventoryVersion {
  versionNumber: number;
  closedAt: string;
  closedBy: string;
  closedByName: string;
  totalAmountGood: number;
  totalAmountDamaged: number;
  totalGeneral: number;
  totalUnitsGood: number;
  totalUnitsDamaged: number;
  reportRef: string;
  reopeningReason?: string;
  reopenedBy?: string;
  reopenedAt?: string;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number; // en octets
  uploadedBy: string;
  uploadedByName: string;
  uploadedRole: UserRole;
  uploadedAt: string;
  dataUrl?: string; // base64 ou url simulée
  type: 'PRIX_MAGASINIER' | 'JUSTIFICATIF_BOUTIQUE' | 'RAPPORT_CONTROLE';
  inventoryId?: string;
  shopId?: string;
  notes?: string;
}

export interface InventoryMessage {
  id: string;
  inventoryId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  timestamp: string;
  content: string; // Explication / Motif écrit
  lineId?: string;
  lineDesignation?: string;
  proposedQtyGood?: number;
  proposedQtyDamaged?: number;
  attachmentUrl?: string; // Photo ou fichier joint pour appuyer la demande écrite
  attachmentName?: string;
  status: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
  responseNote?: string;
  treatedBy?: string;
  treatedAt?: string;
}

export interface Inventory {
  id: string;
  code: string;                  // Ex: INV-2026-COT-001
  shopId: string;
  shopName: string;
  locationType: LocationType;    // Boutique ou Chantier (Mode Chantier)
  siteName?: string;             // Nom du chantier (ex: Chantier Tour Administrative)
  category: Category;
  status: InventoryStatus;
  campaignName: string;          // Ex: Inventaire Général T1 2026
  version: number;               // 1 par défaut, s'incrémente en cas de réouverture exceptionnelle
  assignedCounterId?: string;
  assignedCounterName?: string;
  assignedControllerId?: string;
  assignedControllerName?: string;
  validatedById?: string;
  validatedByName?: string;
  validatedAt?: string;
  validatedBy?: string;
  createdAt: string;
  countStartedAt?: string;
  countSubmittedAt?: string;
  controlOpenedAt?: string;
  closedAt?: string;
  lines: InventoryLine[];
  versionsHistory: InventoryVersion[];
  notes?: string;
  attachments?: FileAttachment[];       // Pièces jointes / photos justificatives
  messages?: InventoryMessage[];         // Requêtes de modification écrites des inventoristes
  rejectionReason?: string;             // Motif obligatoire de rejet si renvoyé en contrôle par le PDG
  rejectedAt?: string;
  rejectedBy?: string;
  treatment?: InventoryTreatment;
  pdgComment?: string;                  // Commentaire souverain du PDG (Fondateur)
  pdgDecision?: 'FINALISE' | 'RENVOYE_CONTROLE' | 'EN_ATTENTE' | 'MOTIF_SPECIAL';
  pdgDecisionNote?: string;
  pdgDecisionAt?: string;
}

export type PermissionScope = 'Aluminium' | 'Accessoires' | 'Complet';
export type PermissionAction = 'Corriger les quantités' | 'Modifier observations' | 'Contrôle complet';

export interface TemporaryPermission {
  id: string;
  userId: string;
  userName: string;
  shopId: string;
  shopName: string;
  inventoryId: string;
  inventoryCode: string;
  scope: PermissionScope;
  action: PermissionAction;
  grantedById: string;
  grantedByName: string;
  grantedAt: string;
  expiresAt: string;           // ISO timestamp
  durationMinutes: number;
  reason: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  shopId?: string;
  shopName?: string;
  inventoryId?: string;
  inventoryCode?: string;
  action: string;              // Ex: 'CORRECTION_QUANTITE', 'CLOTURE_DEFINITIVE', 'OCTROI_PERMISSION'
  actionType?: 'CONSULTATION' | 'CREATION' | 'MODIFICATION' | 'EXPORT' | 'APPROBATION' | 'REOUVERTURE' | 'AUTRE';
  targetObject?: string;       // Objet concerné (ex: Article Tube 40x20, Inventaire INV-2026-COT-001)
  oldValue?: string;
  newValue?: string;
  reason?: string;
  authorizedBy?: string;
  status: 'SUCCESS' | 'BLOCKED';
  ipAddress?: string;
}

export interface ShopInvitation {
  id: string;
  shopId?: string;
  shopName?: string;
  role: UserRole;
  recipientName: string;
  recipientContact: string;    // Email ou Numéro WhatsApp
  recipientEmail?: string;
  recipientPhone?: string;
  uniqueIdentifier: string;     // Ex: ALU-USR-84920
  token: string;
  currentEmailOtp?: string;     // Code OTP envoyé par email à la demande de l'utilisateur
  emailOtpExpiresAt?: string;
  durationHours: number;        // Délai accordé par le secrétaire / admin (ex: 24, 48, 72h)
  generatedBy: string;
  generatedAt: string;
  expiresAt: string;
  status: 'PENDING' | 'ACTIVATED' | 'REVOKED';
}

// Module 7 : Planification des campagnes d'inventaire
export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'PLANIFIEE' | 'EN_COURS' | 'CLOTUREE';
  shopsCovered: string[];
  categories: Category[];
  type: LocationType;
  supervisorId: string;
  supervisorName: string;
  consignes: string;
}

// Module 15 : Notifications, Messagerie collaborative et Preuves / Photos
export interface MessageAttachment {
  name: string;
  type: 'IMAGE' | 'PDF' | 'DOCUMENT';
  size: string;
  url?: string;
  previewUrl?: string;
}

export interface MessageProof {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientType: 'ADMINISTRATION' | 'ALL' | 'SPECIFIC_USER';
  recipientName?: string;
  subject: string;
  content: string;
  category: 'PREUVE_JUSTIFICATIF' | 'DEMANDE_EXPLICATION' | 'SIGNALEMENT_ANOMALIE' | 'GENERAL';
  shopId?: string;
  shopName?: string;
  inventoryId?: string;
  attachments?: MessageAttachment[];
  createdAt: string;
  status: 'TRANSMIS' | 'EN_REVUE' | 'VALIDE_PAR_ADMIN' | 'REPONDU';
  adminResponse?: {
    responderName: string;
    responderRole: UserRole;
    response: string;
    respondedAt: string;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
  timestamp: string;
  read: boolean;
  targetRole?: UserRole;
  shopId?: string;
  inventoryId?: string;
  linkModule?: ModuleId;
}

// L'ORGANISATION EN 16 MODULES OFFICIELS ALUCOUNT
export type ModuleCategory = 
  | '1. Gestion & Administration'
  | '2. Articles & Inventaires'
  | '3. Consultation & Suivi';

export type ModuleId =
  | '01_pdg_supervision'
  | '02_admin_security'
  | '03_users'
  | '04_roles_permissions'
  | '05_shops'
  | '06_catalog_tariffs'
  | '07_campaigns'
  | '08_physical_counting'
  | '09_control_verification'
  | '10_discrepancies'
  | '11_validation_closing'
  | '12_history_reopen'
  | '13_reports_stats'
  | '14_documents_exports'
  | '15_notifications'
  | '16_audit_security'
  | '17_archives';

export interface ModuleDefinition {
  id: ModuleId;
  number: string;
  name: string;
  category: ModuleCategory;
  shortDesc: string;
  allowedRoles: UserRole[];
}

// ==========================================
// TYPES DE L'ESPACE ADMINISTRATEUR SAAS ALUTRACO
// ==========================================

// Contrôleur des Heures de Connexion (Access Hours Policy)
export interface LoginHoursRestrictionConfig {
  enabled: boolean;
  startHour: string;            // Ex: "07:00"
  maxEndHour: string;           // Ex: "19:00" (heure limite au-delà de laquelle la connexion est bloquée)
  restrictedRoles: UserRole[];  // Rôles soumis au couvre-feu (ex: INVENTORISTE, CONTROLEUR, etc.)
  restrictedUserIds: string[];  // Comptes spécifiques restreints
  blockWeekends: boolean;       // Bloquer le samedi et dimanche
  enforcementMode: 'STRICT_BLOCK' | 'WARN_AND_LOG';
  warningMessage: string;
}

// Sessions Utilisateurs Actives
export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  shopName?: string;
  device: string;               // Ex: "Mobile Android", "PC Windows 11", "iPad Pro"
  browser: string;              // Ex: "Chrome 122", "Safari 17"
  ipAddress: string;            // Ex: "102.164.21.44 (Cotonou, Bénin)"
  location?: string;            // Ex: "Cotonou, Bénin"
  connectedAt: string;
  lastActiveAt: string;
  status: 'ACTIVE' | 'TERMINATED';
}

// Sauvegardes Système & Sandbox
export interface SystemBackup {
  id: string;
  filename: string;
  sizeMb: number;
  type: 'AUTO_SCHEDULED' | 'MANUAL_SNAPSHOT';
  checksum: string;
  createdAt: string;
  status: 'SUCCESS' | 'FAILED' | 'RESTORING';
  isRestorable: boolean;
  notes?: string;
}

// État de Santé des Services Système
export interface SystemServiceStatus {
  id: string;
  name: string;
  category: 'DATABASE' | 'AUTH' | 'STORAGE' | 'API' | 'NOTIFICATIONS' | 'BACKUPS';
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  uptime: string;
  lastChecked: string;
}

// Mode Maintenance Programmable
export interface MaintenanceConfig {
  isActive: boolean;
  scheduledStart: string;
  scheduledEnd: string;
  message: string;
  allowedRoles: UserRole[];
  exemptIps: string[];
}

// Incidents & Support Technique
export interface SystemIncident {
  id: string;
  code: string;                 // Ex: INC-2026-0025
  title: string;
  description: string;
  priority: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  status: 'NOUVEAU' | 'EN_COURS' | 'RESOLU' | 'REJETE';
  reportedBy: string;
  reportedAt: string;
  createdAt?: string;
  resolvedAt?: string;
  solutionNotes?: string;
}

// Centre de Diagnostic Automatique
export interface DiagnosticItem {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  details: string;
  detectedCount: number;
  affectedEntityType: 'ARTICLES' | 'UTILISATEURS' | 'BOUTIQUES' | 'PERMISSIONS' | 'INVENTAIRES';
  recommendedAction: string;
  autoFixAvailable: boolean;
}

// Feature Flags (Gestion des Fonctionnalités)
export interface FeatureFlagsConfig {
  offlineMode: boolean;
  qrCodeScanning: boolean;
  chantierMode: boolean;
  doubleCountAudit: boolean;
  aiAssistant: boolean;
  whatsappNotifications: boolean;
  strictPriceProtection: boolean;
}

// Paramètres Généraux du SaaS ALUTRACO
export interface SaasGeneralConfig {
  platformName: string;
  soleCompany: string;          // "ALUTRACO SARL"
  currency: string;             // "FCFA"
  timezone: string;             // "Africa/Porto-Novo (GMT+1)"
  dateFormat: string;           // "DD/MM/YYYY HH:mm"
  environment: 'PRODUCTION' | 'TEST_SANDBOX';
  emergencyBreakGlass: boolean;
}

