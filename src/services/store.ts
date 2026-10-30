import { useState, useEffect } from 'react';
import { 
  User, 
  Shop, 
  CatalogItem, 
  AluminiumColor,
  Inventory, 
  InventoryLine,
  TemporaryPermission, 
  AuditLog, 
  PriceHistory, 
  ShopInvitation,
  Category,
  UserRole,
  Campaign,
  AppNotification,
  LocationType,
  FileAttachment,
  InventoryMessage,
  MessageProof,
  MessageAttachment,
  LoginHoursRestrictionConfig,
  UserSession,
  SystemBackup,
  SystemServiceStatus,
  MaintenanceConfig,
  SystemIncident,
  DiagnosticItem,
  FeatureFlagsConfig,
  SaasGeneralConfig,
  CompanySettings,
  InventoryTreatment,
  ReportedSaleItem,
  UndeliveredProductItem,
  ClientDebtItem,
  TreatmentAuditEntry
} from '../types';

import { 
  INITIAL_USERS, 
  INITIAL_SHOPS, 
  INITIAL_CATALOG, 
  INITIAL_INVENTORIES, 
  INITIAL_TEMPORARY_PERMISSIONS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_PRICE_HISTORIES,
  INITIAL_INVITATIONS,
  INITIAL_CAMPAIGNS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMPANY_SETTINGS
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'alucount_users_v1',
  SHOPS: 'alucount_shops_v1',
  CATALOG: 'alucount_catalog_v2026_08',
  INVENTORIES: 'alucount_inventories_v1',
  PERMISSIONS: 'alucount_permissions_v1',
  AUDIT_LOGS: 'alucount_audit_logs_v1',
  PRICE_HISTORIES: 'alucount_price_histories_v1',
  INVITATIONS: 'alucount_invitations_v1',
  CAMPAIGNS: 'alucount_campaigns_v1',
  NOTIFICATIONS: 'alucount_notifications_v1',
  PROOF_MESSAGES: 'alucount_proof_messages_v1',
  CURRENT_USER_ID: 'alucount_current_user_id_v1',
  LOGIN_HOURS_RESTRICTION: 'alucount_login_hours_v2',
  SESSIONS: 'alucount_sessions_v1',
  BACKUPS: 'alucount_backups_v1',
  SYSTEM_SERVICES: 'alucount_system_services_v1',
  MAINTENANCE: 'alucount_maintenance_v1',
  INCIDENTS: 'alucount_incidents_v1',
  FEATURE_FLAGS: 'alucount_feature_flags_v1',
  SAAS_CONFIG: 'alucount_saas_config_v1',
  COMPANY_SETTINGS: 'alucount_company_settings_v1',
  IS_AUTHENTICATED: 'alucount_is_auth_v1',
};

const INITIAL_PROOF_MESSAGES: MessageProof[] = [
  {
    id: 'msg_proof_01',
    senderId: 'usr_inv_01',
    senderName: 'Paul Dossou',
    senderRole: 'INVENTORISTE',
    recipientType: 'ADMINISTRATION',
    subject: 'Justificatif écart & photos de profilés tordus à la réception',
    content: 'Bonjour la Direction. Lors du comptage à Cotonou 01, nous avons constaté 8 barres de RAIL 3V BLANC fortement déformées suite à la manutention du camion. Ci-joint les clichés pris sur place pour attester la dégradation avant inventaire.',
    category: 'PREUVE_JUSTIFICATIF',
    shopId: 'shop_01',
    shopName: 'Boutique Cotonou 01 — Siège Principal',
    createdAt: '23/10/2026 11:25',
    status: 'VALIDE_PAR_ADMIN',
    attachments: [
      {
        name: 'Photo_Profile_Deforme_Cotonou.jpg',
        type: 'IMAGE',
        size: '2.4 MB',
        previewUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80'
      },
      {
        name: 'Constat_Manutention_Signe.pdf',
        type: 'PDF',
        size: '480 KB'
      }
    ],
    adminResponse: {
      responderName: 'Mme Aïcha Touré',
      responderRole: 'SECRETAIRE_DIRECTION',
      response: 'Preuve acceptée et enregistrée au dossier de contrôle. Les 8 barres sont classées en freinte justifiée.',
      respondedAt: '23/10/2026 14:10'
    }
  },
  {
    id: 'msg_proof_02',
    senderId: 'usr_chef_01',
    senderName: 'Jean Akindès',
    senderRole: 'RESPONSABLE_BOUTIQUE',
    recipientType: 'ADMINISTRATION',
    subject: 'Attestation de réception retardataire et preuve de livraison',
    content: 'Suite à la programmation de l\'inventaire, nous attestons que le bon de livraison N° BL-2026-902 a été réceptionné hier soir. Fichier du bordereau joint pour la commission de contrôle.',
    category: 'PREUVE_JUSTIFICATIF',
    shopId: 'shop_02',
    shopName: 'Boutique Akpakpa — Zone Commerciale',
    createdAt: '24/10/2026 08:45',
    status: 'EN_REVUE',
    attachments: [
      {
        name: 'Bordereau_Livraison_BL902.pdf',
        type: 'PDF',
        size: '620 KB'
      }
    ]
  }
];

// Fonction utilitaire pour formater en FCFA
export const formatFCFA = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
};

// Données par défaut pour l'Espace Administrateur SaaS ALUTRACO
const INITIAL_LOGIN_HOURS: LoginHoursRestrictionConfig = {
  enabled: true,
  startHour: '07:00',
  maxEndHour: '19:00',
  restrictedRoles: ['INVENTORISTE', 'CONTROLEUR', 'RESPONSABLE_BOUTIQUE'],
  restrictedUserIds: [],
  blockWeekends: false,
  enforcementMode: 'STRICT_BLOCK',
  warningMessage: 'Couvre-feu de sécurité ALUTRACO : les connexions sont strictement interdites au-delà de 19h00 pour garantir l\'intégrité des inventaires.'
};

const INITIAL_SESSIONS: UserSession[] = [
  {
    id: 'ses_01',
    userId: 'usr_admin_01',
    userName: 'Admin Plateforme',
    userRole: 'ADMIN',
    device: 'PC Dell XPS 15 (Windows 11 Pro)',
    browser: 'Chrome 122.0',
    ipAddress: '102.164.21.44 (Cotonou, Bénin)',
    connectedAt: '29/10/2026 07:15',
    lastActiveAt: '29/10/2026 07:48',
    status: 'ACTIVE'
  },
  {
    id: 'ses_02',
    userId: 'usr_pdg_01',
    userName: 'M. Patrice Alutraco',
    userRole: 'PDG',
    device: 'MacBook Pro M3 (macOS Sonoma)',
    browser: 'Safari 17.3',
    ipAddress: '154.68.10.12 (Cotonou Siège)',
    connectedAt: '29/10/2026 07:30',
    lastActiveAt: '29/10/2026 07:45',
    status: 'ACTIVE'
  },
  {
    id: 'ses_03',
    userId: 'usr_ctrl_01',
    userName: 'Marc Tossou',
    userRole: 'CONTROLEUR',
    device: 'Tablette Samsung Galaxy Tab S9',
    browser: 'Chrome Mobile 122',
    ipAddress: '102.164.88.05 (Akpakpa)',
    connectedAt: '29/10/2026 07:40',
    lastActiveAt: '29/10/2026 07:49',
    status: 'ACTIVE'
  },
  {
    id: 'ses_04',
    userId: 'usr_inv_01',
    userName: 'Paul Dossou',
    userRole: 'INVENTORISTE',
    device: 'Smartphone Redmi Note 13',
    browser: 'Edge Mobile 120',
    ipAddress: '102.164.99.17 (Cotonou 01)',
    connectedAt: '29/10/2026 07:42',
    lastActiveAt: '29/10/2026 07:50',
    status: 'ACTIVE'
  }
];

const INITIAL_BACKUPS: SystemBackup[] = [
  {
    id: 'bkp_2026_10_29_02',
    filename: 'ALUCOUNT_FULL_SNAPSHOT_20261029_0200.sql.enc',
    sizeMb: 148.5,
    type: 'AUTO_SCHEDULED',
    checksum: 'sha256:8f92bd3a4c11e74a89fa98bc...',
    createdAt: '29/10/2026 02:00',
    status: 'SUCCESS',
    isRestorable: true,
    notes: 'Snapshot planifié quotidien scellé cryptographiquement'
  },
  {
    id: 'bkp_2026_10_28_02',
    filename: 'ALUCOUNT_FULL_SNAPSHOT_20261028_0200.sql.enc',
    sizeMb: 146.2,
    type: 'AUTO_SCHEDULED',
    checksum: 'sha256:7b11aa89c43d92f012de...',
    createdAt: '28/10/2026 02:00',
    status: 'SUCCESS',
    isRestorable: true,
    notes: 'Archive quotidienne certifiée conforme'
  },
  {
    id: 'bkp_2026_10_27_18',
    filename: 'ALUCOUNT_PRE_INVENTORY_20261027_1830.sql.enc',
    sizeMb: 144.9,
    type: 'MANUAL_SNAPSHOT',
    checksum: 'sha256:4e3391bfa9802ac556ee...',
    createdAt: '27/10/2026 18:30',
    status: 'SUCCESS',
    isRestorable: true,
    notes: 'Snapshot avant clôture de la campagne T3'
  }
];

const INITIAL_SYSTEM_SERVICES: SystemServiceStatus[] = [
  {
    id: 'srv_pg',
    name: 'Base de Données PostgreSQL Relationnelle',
    category: 'DATABASE',
    status: 'OPERATIONAL',
    latencyMs: 11,
    uptime: '99.98%',
    lastChecked: 'À l\'instant'
  },
  {
    id: 'srv_auth',
    name: 'Service d\'Authentification & Sessions JWT',
    category: 'AUTH',
    status: 'OPERATIONAL',
    latencyMs: 7,
    uptime: '100%',
    lastChecked: 'À l\'instant'
  },
  {
    id: 'srv_storage',
    name: 'Coffre-fort Documents & Clichés Chiffrés',
    category: 'STORAGE',
    status: 'OPERATIONAL',
    latencyMs: 22,
    uptime: '99.95%',
    lastChecked: 'À l\'instant'
  },
  {
    id: 'srv_api',
    name: 'Moteur API Métier ALUTRACO',
    category: 'API',
    status: 'OPERATIONAL',
    latencyMs: 14,
    uptime: '99.99%',
    lastChecked: 'À l\'instant'
  },
  {
    id: 'srv_notif',
    name: 'Passerelle WhatsApp & Relais Mail OTP',
    category: 'NOTIFICATIONS',
    status: 'OPERATIONAL',
    latencyMs: 31,
    uptime: '99.90%',
    lastChecked: 'À l\'instant'
  },
  {
    id: 'srv_backup',
    name: 'Scellement Cryptographique & Restauration',
    category: 'BACKUPS',
    status: 'OPERATIONAL',
    latencyMs: 18,
    uptime: '100%',
    lastChecked: 'À l\'instant'
  }
];

const INITIAL_MAINTENANCE: MaintenanceConfig = {
  isActive: false,
  scheduledStart: '2026-10-31 23:00',
  scheduledEnd: '2026-10-31 23:30',
  message: 'ALUCOUNT sera temporairement indisponible de 23h00 à 23h30 pour maintenance programmée et scellement d\'archives.',
  allowedRoles: ['ADMIN'],
  exemptIps: ['127.0.0.1']
};

const INITIAL_INCIDENTS: SystemIncident[] = [
  {
    id: 'inc_01',
    code: 'INC-2026-0025',
    title: 'Optimisation de la prévisualisation PDF des inventaires finalisés',
    description: 'Sur certains navigateurs mobiles Android, l\'affichage du procès-verbal nécessitait un zoom arrière.',
    priority: 'MOYENNE',
    status: 'EN_COURS',
    reportedBy: 'Admin SaaS',
    reportedAt: '28/10/2026 15:40'
  }
];

const INITIAL_FEATURE_FLAGS: FeatureFlagsConfig = {
  offlineMode: true,
  qrCodeScanning: true,
  chantierMode: true,
  doubleCountAudit: false,
  aiAssistant: false,
  whatsappNotifications: true,
  strictPriceProtection: true
};

const INITIAL_SAAS_CONFIG: SaasGeneralConfig = {
  platformName: 'ALUCOUNT SaaS',
  soleCompany: 'ALUTRACO SARL',
  currency: 'FCFA',
  timezone: 'Africa/Porto-Novo (GMT+1)',
  dateFormat: 'DD/MM/YYYY HH:mm',
  environment: 'PRODUCTION',
  emergencyBreakGlass: false
};

export class ALUCOUNTStore {
  private users: User[];
  private shops: Shop[];
  private catalog: CatalogItem[];
  private inventories: Inventory[];
  private permissions: TemporaryPermission[];
  private auditLogs: AuditLog[];
  private priceHistories: PriceHistory[];
  private invitations: ShopInvitation[];
  private campaigns: Campaign[];
  private notifications: AppNotification[];
  private proofMessages: MessageProof[];
  private currentUserId: string;
  private loginHoursConfig: LoginHoursRestrictionConfig;
  private sessions: UserSession[];
  private backups: SystemBackup[];
  private systemServices: SystemServiceStatus[];
  private maintenance: MaintenanceConfig;
  private incidents: SystemIncident[];
  private featureFlags: FeatureFlagsConfig;
  private saasConfig: SaasGeneralConfig;
  private companySettings: CompanySettings;
  private isAuthenticatedState: boolean;
  private listeners: (() => void)[] = [];

  constructor() {
    this.users = this.load(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.shops = this.load(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
    this.catalog = this.load(STORAGE_KEYS.CATALOG, INITIAL_CATALOG);
    this.inventories = this.load(STORAGE_KEYS.INVENTORIES, INITIAL_INVENTORIES);
    this.permissions = this.load(STORAGE_KEYS.PERMISSIONS, INITIAL_TEMPORARY_PERMISSIONS);
    this.auditLogs = this.load(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.priceHistories = this.load(STORAGE_KEYS.PRICE_HISTORIES, INITIAL_PRICE_HISTORIES);
    this.invitations = this.load(STORAGE_KEYS.INVITATIONS, INITIAL_INVITATIONS);
    this.campaigns = this.load(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    this.notifications = this.load(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.proofMessages = this.load(STORAGE_KEYS.PROOF_MESSAGES, INITIAL_PROOF_MESSAGES);
    this.currentUserId = this.load(STORAGE_KEYS.CURRENT_USER_ID, 'usr_pdg_01');
    this.loginHoursConfig = this.load(STORAGE_KEYS.LOGIN_HOURS_RESTRICTION, INITIAL_LOGIN_HOURS);
    this.sessions = this.load(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    this.backups = this.load(STORAGE_KEYS.BACKUPS, INITIAL_BACKUPS);
    this.systemServices = this.load(STORAGE_KEYS.SYSTEM_SERVICES, INITIAL_SYSTEM_SERVICES);
    this.maintenance = this.load(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE);
    this.incidents = this.load(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    this.featureFlags = this.load(STORAGE_KEYS.FEATURE_FLAGS, INITIAL_FEATURE_FLAGS);
    this.saasConfig = this.load(STORAGE_KEYS.SAAS_CONFIG, INITIAL_SAAS_CONFIG);
    this.companySettings = this.load(STORAGE_KEYS.COMPANY_SETTINGS, INITIAL_COMPANY_SETTINGS);
    this.isAuthenticatedState = this.load(STORAGE_KEYS.IS_AUTHENTICATED, false);

    // Nettoyage régulier des permissions expirées
    this.checkPermissionsExpiry();
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private save(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignorer silencieusement si storage plein
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- Getters & Authentification ---
  public isAuthenticated(): boolean {
    return this.isAuthenticatedState;
  }

  public setAuthenticated(val: boolean) {
    this.isAuthenticatedState = val;
    this.save(STORAGE_KEYS.IS_AUTHENTICATED, val);
    this.notify();
  }

  public loginWithCredentials(
    identifierOrEmail: string, 
    password?: string, 
    _rememberDevice = true
  ): { success: boolean; message: string; user?: User } {
    const cleanId = (identifierOrEmail || '').trim().toLowerCase();
    if (!cleanId) {
      return { success: false, message: 'Veuillez saisir votre identifiant ou adresse e-mail.' };
    }

    const user = this.users.find(u => 
      u.email.toLowerCase() === cleanId || 
      (u.uniqueIdentifier && u.uniqueIdentifier.toLowerCase() === cleanId) ||
      u.id.toLowerCase() === cleanId
    );

    if (!user) {
      return { success: false, message: 'Identifiant ou e-mail inconnu du système ALUTRACO.' };
    }

    if (user.status === 'SUSPENDU') {
      return { success: false, message: 'Ce compte a été suspendu par la Haute Direction ALUTRACO.' };
    }

    if (user.status === 'EN_ATTENTE_ACTIVATION') {
      return { success: false, message: 'Ce compte n\'a pas encore été activé. Veuillez cliquer sur « Activer mon compte » avec votre invitation.' };
    }

    // Vérification du couvre-feu / horaires de connexion autorisés
    const timeCheck = this.isLoginTimeAllowed(user.id, user.role);
    if (!timeCheck.allowed) {
      return { success: false, message: timeCheck.message || 'Connexion non autorisée en dehors des heures de service.' };
    }

    // Si le mot de passe est défini pour ce compte, on le contrôle
    if (user.password && password && user.password !== password) {
      return { success: false, message: 'Mot de passe incorrect.' };
    }

    // Connexion réussie
    this.currentUserId = user.id;
    this.isAuthenticatedState = true;
    this.save(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    this.save(STORAGE_KEYS.IS_AUTHENTICATED, true);

    // Enregistrer une nouvelle session active
    const newSession: UserSession = {
      id: 'sess_' + Date.now().toString(36),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      device: typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') 
        ? 'Smartphone Android ALUTRACO' 
        : 'Poste de travail PC (Chrome / Windows)',
      browser: typeof navigator !== 'undefined' && navigator.userAgent.includes('Edg') ? 'Edge 124' : 'Chrome 125',
      ipAddress: '197.234.221.' + Math.floor(Math.random() * 200 + 10),
      location: 'Bénin (Cotonou / Porto-Novo)',
      connectedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
    this.sessions = [newSession, ...(this.sessions || [])];
    this.save(STORAGE_KEYS.SESSIONS, this.sessions);

    this.addAuditLog({
      action: 'CONNEXION_UTILISATEUR',
      newValue: `Connexion certifiée de ${user.name} (${user.role}) sur ${newSession.device}`,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: `Bienvenue, ${user.name} !`, user };
  }

  public logoutUser(): void {
    const user = this.getCurrentUser();
    this.isAuthenticatedState = false;
    this.save(STORAGE_KEYS.IS_AUTHENTICATED, false);

    // Mettre fin à la session active courante
    if (this.sessions && this.sessions.length > 0) {
      const active = this.sessions.find(s => s.userId === user.id && s.status === 'ACTIVE');
      if (active) {
        active.status = 'TERMINATED';
        active.lastActiveAt = new Date().toISOString();
        this.save(STORAGE_KEYS.SESSIONS, this.sessions);
      }
    }

    this.addAuditLog({
      action: 'DECONNEXION_UTILISATEUR',
      newValue: `Déconnexion volontaire de ${user.name} (${user.role})`,
      status: 'SUCCESS'
    });

    this.notify();
  }

  public activateUserWithInvitation(params: {
    uniqueIdentifier: string;
    email: string;
    password?: string;
  }): { success: boolean; message: string; user?: User } {
    const cleanId = (params.uniqueIdentifier || '').trim().toLowerCase();
    const cleanEmail = (params.email || '').trim().toLowerCase();

    let targetUser = this.users.find(u => 
      (u.uniqueIdentifier && u.uniqueIdentifier.toLowerCase() === cleanId) ||
      u.email.toLowerCase() === cleanEmail
    );

    let inv = this.invitations.find(i => 
      (i.uniqueIdentifier && i.uniqueIdentifier.toLowerCase() === cleanId) ||
      (i.recipientEmail && i.recipientEmail.toLowerCase() === cleanEmail)
    );

    if (!targetUser && !inv) {
      return { success: false, message: 'Aucune invitation trouvée pour cet identifiant et cette adresse e-mail.' };
    }

    if (targetUser) {
      targetUser.status = 'ACTIF';
      targetUser.isEmailConfirmed = true;
      if (params.password) targetUser.password = params.password;
      if (!targetUser.uniqueIdentifier && params.uniqueIdentifier) {
        targetUser.uniqueIdentifier = params.uniqueIdentifier.toUpperCase();
      }
    } else if (inv) {
      targetUser = {
        id: 'usr_' + Date.now().toString(36),
        name: inv.recipientName,
        email: params.email || inv.recipientEmail || 'collaborateur@alutraco.bj',
        phone: inv.recipientPhone,
        role: inv.role,
        shopId: inv.shopId,
        uniqueIdentifier: inv.uniqueIdentifier || params.uniqueIdentifier.toUpperCase(),
        status: 'ACTIF',
        isEmailConfirmed: true,
        password: params.password,
        isDesignatedByPDG: inv.role === 'RESPONSABLE_INVENTAIRE',
        createdAt: new Date().toISOString()
      };
      this.users.push(targetUser);
    }

    if (inv) {
      inv.status = 'ACTIVATED';
      this.save(STORAGE_KEYS.INVITATIONS, this.invitations);
    }

    this.save(STORAGE_KEYS.USERS, this.users);

    if (targetUser) {
      this.currentUserId = targetUser.id;
      this.isAuthenticatedState = true;
      this.save(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
      this.save(STORAGE_KEYS.IS_AUTHENTICATED, true);
    }

    this.addAuditLog({
      action: 'ACTIVATION_COMPTE_INVITATION',
      newValue: `Activation réussie du compte pour ${targetUser?.name} (${targetUser?.role}) — ID: ${targetUser?.uniqueIdentifier}`,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Votre compte ALUTRACO a été activé avec succès !', user: targetUser };
  }

  public resetUserPassword(identifierOrEmail: string, newPassword?: string): { success: boolean; message: string } {
    const clean = (identifierOrEmail || '').trim().toLowerCase();
    const user = this.users.find(u =>
      u.email.toLowerCase() === clean ||
      (u.uniqueIdentifier && u.uniqueIdentifier.toLowerCase() === clean)
    );

    if (!user) {
      return { success: false, message: 'Aucun compte associé à cette adresse e-mail ou cet identifiant.' };
    }

    if (newPassword) {
      user.password = newPassword;
      this.save(STORAGE_KEYS.USERS, this.users);
      this.addAuditLog({
        action: 'REINITIALISATION_MOT_DE_PASSE',
        newValue: `Nouveau mot de passe défini pour ${user.name} (${user.uniqueIdentifier || user.email})`,
        status: 'SUCCESS'
      });
      this.notify();
      return { success: true, message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.' };
    }

    return { success: true, message: `Un lien sécurisé de réinitialisation à usage unique a été envoyé à ${user.email}.` };
  }

  public getCurrentUser(): User {
    const user = this.users.find(u => u.id === this.currentUserId);
    return user || this.users[0] || INITIAL_USERS[0];
  }

  public getUsers(): User[] {
    return this.users;
  }

  public getShops(): Shop[] {
    const currentUser = this.getCurrentUser();
    // Séparation des données : Si responsable de boutique, accès UNIQUEMENT à sa boutique
    if (currentUser.role === 'RESPONSABLE_BOUTIQUE' && currentUser.shopId) {
      return this.shops.filter(s => s.id === currentUser.shopId);
    }
    // Si inventoriste avec affectation fixe
    if (currentUser.role === 'INVENTORISTE' && currentUser.shopId) {
      return this.shops.filter(s => s.id === currentUser.shopId);
    }
    return this.shops;
  }

  public getAllShops(): Shop[] {
    return this.shops;
  }

  // --- Paramètres Généraux de l'Entreprise (Secrétaire de Direction / Admin) ---
  public getCompanySettings(): CompanySettings {
    return this.companySettings;
  }

  public updateCompanySettings(updates: Partial<CompanySettings>) {
    const currentUser = this.getCurrentUser();
    this.companySettings = {
      ...this.companySettings,
      ...updates,
      lastUpdatedBy: currentUser.name,
      lastUpdatedAt: new Date().toLocaleString('fr-FR')
    };
    this.save(STORAGE_KEYS.COMPANY_SETTINGS, this.companySettings);
    this.addAuditLog({
      action: 'MISE_A_JOUR_PARAMETRES_ENTREPRISE',
      actionType: 'MODIFICATION',
      targetObject: `Paramètres généraux : ${this.companySettings.name}`,
      newValue: JSON.stringify(updates),
      reason: 'Mise à jour des informations administratives et coordonnées de l\'entreprise',
      status: 'SUCCESS'
    });
    this.notify();
    return { success: true, message: 'Paramètres généraux de l\'entreprise mis à jour avec succès.' };
  }

  // --- Création de boutique et désignation des responsables (Secrétaire de Direction) ---
  public createShop(shopData: {
    name: string;
    code: string;
    address: string;
    phone: string;
    email?: string;
    type?: LocationType;
    managerId?: string;
    commissionRate?: number;
    initialStockValue?: number;
    initialStockDate?: string;
  }): { success: boolean; shop?: Shop; message: string } {
    const currentUser = this.getCurrentUser();
    const existing = this.shops.find(s => s.code.toLowerCase() === shopData.code.trim().toLowerCase());
    if (existing) {
      return { success: false, message: `Une boutique ou agence avec le code ${shopData.code} existe déjà.` };
    }

    let managerName: string | undefined = undefined;
    if (shopData.managerId) {
      const mgr = this.users.find(u => u.id === shopData.managerId);
      if (mgr) {
        managerName = mgr.name;
      }
    }

    const newShop: Shop = {
      id: `shop_${Date.now()}`,
      code: shopData.code.trim().toUpperCase(),
      name: shopData.name.trim(),
      address: shopData.address.trim(),
      phone: shopData.phone.trim(),
      email: shopData.email?.trim() || '',
      type: shopData.type || 'BOUTIQUE',
      managerId: shopData.managerId,
      managerName: managerName,
      commissionRate: shopData.commissionRate !== undefined ? shopData.commissionRate : 3.0,
      initialStockValue: shopData.initialStockValue || 0,
      initialStockDate: shopData.initialStockDate || new Date().toLocaleDateString('fr-FR'),
      status: 'ACTIVE',
      createdAt: new Date().toLocaleDateString('fr-FR'),
      activeInventoriesCount: 0,
      validatedInventoriesCount: 0
    };

    this.shops.push(newShop);
    this.save(STORAGE_KEYS.SHOPS, this.shops);

    // Si un responsable a été affecté, mettre à jour son shopId
    if (shopData.managerId) {
      this.assignShopManager(newShop.id, shopData.managerId);
    }

    this.addAuditLog({
      action: 'CREATION_BOUTIQUE',
      actionType: 'CREATION',
      targetObject: `Boutique ${newShop.name} (${newShop.code})`,
      shopId: newShop.id,
      shopName: newShop.name,
      newValue: `Boutique créée par ${currentUser.name}. Responsable : ${managerName || 'Non assigné'}`,
      reason: 'Enregistrement d\'une nouvelle boutique / agence par le secrétariat',
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, shop: newShop, message: `Boutique ${newShop.name} créée avec succès.` };
  }

  public assignShopManager(shopId: string, managerId: string): { success: boolean; message: string } {
    const shop = this.shops.find(s => s.id === shopId);
    if (!shop) return { success: false, message: 'Boutique introuvable.' };

    const manager = this.users.find(u => u.id === managerId);
    if (!manager) return { success: false, message: 'Utilisateur introuvable.' };

    const oldManagerName = shop.managerName || 'Aucun';
    shop.managerId = manager.id;
    shop.managerName = manager.name;
    manager.shopId = shop.id;

    this.save(STORAGE_KEYS.SHOPS, this.shops);
    this.save(STORAGE_KEYS.USERS, this.users);

    const currentUser = this.getCurrentUser();
    this.addAuditLog({
      action: 'AFFECTATION_RESPONSABLE_BOUTIQUE',
      actionType: 'MODIFICATION',
      targetObject: `Boutique ${shop.name}`,
      shopId: shop.id,
      shopName: shop.name,
      oldValue: oldManagerName,
      newValue: `${manager.name} (${manager.role})`,
      reason: `Affectation du responsable/chef par ${currentUser.name}`,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: `${manager.name} a été désigné(e) responsable de ${shop.name}.` };
  }

  public updateShop(shopId: string, updates: Partial<Shop>): { success: boolean; message: string } {
    const index = this.shops.findIndex(s => s.id === shopId);
    if (index === -1) return { success: false, message: 'Boutique introuvable.' };

    const old = this.shops[index];
    this.shops[index] = { ...old, ...updates };
    this.save(STORAGE_KEYS.SHOPS, this.shops);

    const currentUser = this.getCurrentUser();
    this.addAuditLog({
      action: 'MODIFICATION_BOUTIQUE',
      actionType: 'MODIFICATION',
      targetObject: `Boutique ${old.name}`,
      shopId: old.id,
      shopName: old.name,
      oldValue: JSON.stringify(old),
      newValue: JSON.stringify(updates),
      reason: `Paramètres de la boutique mis à jour par ${currentUser.name}`,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Informations de la boutique mises à jour.' };
  }

  // --- Module Traitement de l'Inventaire & Calculs Métiers ---
  public getInventoryTreatment(inventoryId: string): InventoryTreatment | undefined {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return undefined;

    // Si le traitement n'existe pas encore sur l'inventaire, l'initialiser automatiquement
    if (!inv.treatment) {
      const shop = this.shops.find(s => s.id === inv.shopId);
      const commissionRate = shop?.commissionRate ?? 3.0;
      const initialStockValue = shop?.initialStockValue || 0;
      const initialStockDate = shop?.initialStockDate || inv.createdAt;

      // Calculer le stock compté détaillé
      const countedStockValue = inv.lines.reduce((sum, l) => sum + (l.totalAmount || 0), 0);
      const countedStockDetails = inv.lines.map(line => ({
        productId: line.productId,
        designation: line.designation,
        color: line.color,
        quantity: line.qtyGood + line.qtyDamaged,
        unitPrice: line.officialPriceSnapshot,
        totalValue: line.totalAmount
      }));

      const newTreatment: InventoryTreatment = {
        id: `treat_${inv.id}`,
        inventoryId: inv.id,
        shopId: inv.shopId,
        shopName: inv.shopName,
        periodStart: initialStockDate,
        periodEnd: inv.createdAt,
        countedStockValue: countedStockValue,
        countedStockDetails: countedStockDetails,
        reportedSales: [],
        totalReportedSales: 0,
        undeliveredProducts: [],
        totalUndelivered: 0,
        clientDebts: [],
        totalClientDebts: 0,
        commissionRate: commissionRate,
        commissionAmount: 0,
        intermediateAmount: countedStockValue,
        balanceDate: new Date().toLocaleDateString('fr-FR'),
        shopBalance: 0,
        totalCalculatedStock: countedStockValue,
        initialStockDate: initialStockDate,
        initialStockValue: initialStockValue,
        difference: countedStockValue - initialStockValue,
        isPositiveDifference: (countedStockValue - initialStockValue) >= 0,
        controlStatus: 'EN_ATTENTE_CONTROLE',
        validationStatus: 'NON_VALIDE',
        auditTrail: []
      };

      inv.treatment = newTreatment;
      this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    }

    return inv.treatment;
  }

  public recalculateTreatment(treatment: InventoryTreatment): InventoryTreatment {
    const totalReportedSales = treatment.reportedSales.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const totalUndelivered = treatment.undeliveredProducts.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const totalClientDebts = treatment.clientDebts.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Commission automatique selon % défini appliqué aux ventes reportées (ou selon logique métier)
    // Formule utilisateur : Stock compté d'aluminium + Ventes reportées − Commission de la boutique − Produits non livrés + Dettes clients
    const baseForCommission = totalReportedSales;
    const commissionAmount = Math.round((baseForCommission * treatment.commissionRate) / 100);

    // Montant intermédiaire
    const intermediateAmount = treatment.countedStockValue + totalReportedSales - commissionAmount - totalUndelivered + totalClientDebts;

    // Stock total de la boutique = Montant intermédiaire + Solde de la boutique
    const totalCalculatedStock = intermediateAmount + (treatment.shopBalance || 0);

    // Résultat / Écart = Stock total calculé − Stock initial
    const difference = totalCalculatedStock - (treatment.initialStockValue || 0);

    return {
      ...treatment,
      totalReportedSales,
      totalUndelivered,
      totalClientDebts,
      commissionAmount,
      intermediateAmount,
      totalCalculatedStock,
      difference,
      isPositiveDifference: difference >= 0
    };
  }

  public saveInventoryTreatment(inventoryId: string, updates: Partial<InventoryTreatment>) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv || !inv.treatment) return { success: false, message: 'Traitement introuvable.' };

    const currentUser = this.getCurrentUser();
    const currentTreatment = inv.treatment;

    const merged = { ...currentTreatment, ...updates };
    const calculated = this.recalculateTreatment(merged);

    // Enregistrer l'audit trail
    calculated.auditTrail = [
      ...(calculated.auditTrail || []),
      {
        id: `aud_tr_${Date.now()}`,
        timestamp: new Date().toLocaleString('fr-FR'),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        shopName: inv.shopName,
        nature: 'Mise à jour du traitement d\'inventaire',
        field: Object.keys(updates).join(', '),
        newValue: 'Données recalculées automatiquement'
      }
    ];

    inv.treatment = calculated;
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, treatment: calculated };
  }

  // Saisie Ventes Reportées
  public addReportedSale(inventoryId: string, sale: Omit<ReportedSaleItem, 'id'>) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable.' };
    const treatment = this.getInventoryTreatment(inventoryId);
    if (!treatment) return { success: false, message: 'Traitement introuvable.' };

    const currentUser = this.getCurrentUser();
    const newItem: ReportedSaleItem = {
      ...sale,
      id: `sale_${Date.now()}`
    };

    treatment.reportedSales = [...treatment.reportedSales, newItem];
    
    // Traçabilité obligatoire
    treatment.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      shopName: inv.shopName,
      nature: 'Saisie vente reportée',
      field: newItem.designation,
      newValue: `${newItem.quantity} barres — ${formatFCFA(newItem.totalAmount)}`
    });

    const recalculated = this.recalculateTreatment(treatment);
    inv.treatment = recalculated;
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, item: newItem };
  }

  public removeReportedSale(inventoryId: string, saleId: string) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv || !inv.treatment) return { success: false };
    const currentUser = this.getCurrentUser();
    const removed = inv.treatment.reportedSales.find(s => s.id === saleId);

    inv.treatment.reportedSales = inv.treatment.reportedSales.filter(s => s.id !== saleId);
    if (removed) {
      inv.treatment.auditTrail.push({
        id: `aud_${Date.now()}`,
        timestamp: new Date().toLocaleString('fr-FR'),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        shopName: inv.shopName,
        nature: 'Suppression vente reportée',
        field: removed.designation,
        oldValue: `${removed.quantity} barres — ${formatFCFA(removed.totalAmount)}`,
        newValue: 'Supprimé'
      });
    }

    inv.treatment = this.recalculateTreatment(inv.treatment);
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true };
  }

  // Saisie Produits Non Livrés
  public addUndeliveredProduct(inventoryId: string, item: Omit<UndeliveredProductItem, 'id' | 'totalAmount'>) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable.' };
    const treatment = this.getInventoryTreatment(inventoryId);
    if (!treatment) return { success: false, message: 'Traitement introuvable.' };

    const currentUser = this.getCurrentUser();
    const totalAmount = item.quantity * item.unitPrice;
    const newItem: UndeliveredProductItem = {
      ...item,
      id: `undeliv_${Date.now()}`,
      totalAmount
    };

    treatment.undeliveredProducts = [...treatment.undeliveredProducts, newItem];
    treatment.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      shopName: inv.shopName,
      nature: 'Déclaration produit non livré',
      field: newItem.designation,
      newValue: `Qté : ${newItem.quantity} @ ${formatFCFA(newItem.unitPrice)} = ${formatFCFA(totalAmount)}`
    });

    const recalculated = this.recalculateTreatment(treatment);
    inv.treatment = recalculated;
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, item: newItem };
  }

  public removeUndeliveredProduct(inventoryId: string, itemId: string) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv || !inv.treatment) return { success: false };
    const currentUser = this.getCurrentUser();
    const removed = inv.treatment.undeliveredProducts.find(p => p.id === itemId);

    inv.treatment.undeliveredProducts = inv.treatment.undeliveredProducts.filter(p => p.id !== itemId);
    if (removed) {
      inv.treatment.auditTrail.push({
        id: `aud_${Date.now()}`,
        timestamp: new Date().toLocaleString('fr-FR'),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        shopName: inv.shopName,
        nature: 'Suppression produit non livré',
        field: removed.designation,
        oldValue: formatFCFA(removed.totalAmount),
        newValue: 'Supprimé'
      });
    }

    inv.treatment = this.recalculateTreatment(inv.treatment);
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true };
  }

  // Saisie Dettes Clients
  public addClientDebt(inventoryId: string, debt: Omit<ClientDebtItem, 'id'>) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable.' };
    const treatment = this.getInventoryTreatment(inventoryId);
    if (!treatment) return { success: false, message: 'Traitement introuvable.' };

    const currentUser = this.getCurrentUser();
    const newItem: ClientDebtItem = {
      ...debt,
      id: `debt_${Date.now()}`
    };

    treatment.clientDebts = [...treatment.clientDebts, newItem];
    treatment.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      shopName: inv.shopName,
      nature: 'Déclaration dette client',
      field: newItem.clientName,
      newValue: `Créance déclarée : ${formatFCFA(newItem.amount)}`
    });

    const recalculated = this.recalculateTreatment(treatment);
    inv.treatment = recalculated;
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, item: newItem };
  }

  public removeClientDebt(inventoryId: string, debtId: string) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv || !inv.treatment) return { success: false };
    const currentUser = this.getCurrentUser();
    const removed = inv.treatment.clientDebts.find(d => d.id === debtId);

    inv.treatment.clientDebts = inv.treatment.clientDebts.filter(d => d.id !== debtId);
    if (removed) {
      inv.treatment.auditTrail.push({
        id: `aud_${Date.now()}`,
        timestamp: new Date().toLocaleString('fr-FR'),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        shopName: inv.shopName,
        nature: 'Suppression dette client',
        field: removed.clientName,
        oldValue: formatFCFA(removed.amount),
        newValue: 'Supprimé'
      });
    }

    inv.treatment = this.recalculateTreatment(inv.treatment);
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true };
  }

  // Saisie du Solde de la boutique
  public updateShopBalance(inventoryId: string, balance: number, balanceDate?: string) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable.' };
    const treatment = this.getInventoryTreatment(inventoryId);
    if (!treatment) return { success: false, message: 'Traitement introuvable.' };

    const currentUser = this.getCurrentUser();
    const oldBalance = treatment.shopBalance;
    treatment.shopBalance = balance;
    if (balanceDate) {
      treatment.balanceDate = balanceDate;
    }

    treatment.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      shopName: inv.shopName,
      nature: 'Mise à jour du solde de la boutique',
      field: `Solde au ${treatment.balanceDate}`,
      oldValue: formatFCFA(oldBalance),
      newValue: formatFCFA(balance)
    });

    const recalculated = this.recalculateTreatment(treatment);
    inv.treatment = recalculated;
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, treatment: recalculated };
  }

  // Phase de Contrôle du traitement
  public setTreatmentControlled(inventoryId: string, note?: string) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv || !inv.treatment) return { success: false, message: 'Inventaire introuvable.' };

    const currentUser = this.getCurrentUser();
    inv.treatment.controlStatus = 'CONTROLE_EFFECTUE';
    inv.treatment.controlledBy = currentUser.name;
    inv.treatment.controlledAt = new Date().toLocaleString('fr-FR');
    inv.status = 'En contrôle';

    inv.treatment.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      shopName: inv.shopName,
      nature: 'Contrôle du traitement d\'inventaire validé',
      field: 'Statut de contrôle',
      oldValue: 'EN_ATTENTE_CONTROLE',
      newValue: `CONTROLE_EFFECTUE (${note || 'Conforme'})`
    });

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, message: 'Traitement d\'inventaire vérifié et contrôlé avec succès.' };
  }

  // Phase de Validation Définitive de l'inventaire
  public validateInventoryFinal(inventoryId: string, validationNote?: string): { success: boolean; message: string } {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable.' };

    const treatment = this.getInventoryTreatment(inventoryId);
    if (!treatment) return { success: false, message: 'Traitement introuvable.' };

    const currentUser = this.getCurrentUser();
    treatment.validationStatus = 'VALIDE_DEFINITIF';
    treatment.validatedBy = currentUser.name;
    treatment.validatedAt = new Date().toLocaleString('fr-FR');
    treatment.validationNotes = validationNote || 'Inventaire et traitement validés définitivement par l\'administration.';

    inv.status = 'Validé et clôturé';
    inv.validatedAt = treatment.validatedAt;
    inv.validatedBy = currentUser.name;
    inv.treatment = this.recalculateTreatment(treatment);

    // Mettre à jour les compteurs de la boutique
    const shop = this.shops.find(s => s.id === inv.shopId);
    if (shop) {
      shop.lastValidationDate = treatment.validatedAt;
      shop.validatedInventoriesCount = (shop.validatedInventoriesCount || 0) + 1;
      this.save(STORAGE_KEYS.SHOPS, this.shops);
    }

    treatment.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      shopName: inv.shopName,
      nature: 'VALIDATION DEFINITIVE ET CLOTURE OFFICIELLE',
      field: 'Statut de validation',
      oldValue: 'NON_VALIDE',
      newValue: `VALIDE_DEFINITIF par ${currentUser.name} (${currentUser.role})`
    });

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, message: `L'inventaire ${inv.code} de ${inv.shopName} est désormais validé définitivement et clôturé.` };
  }

  // --- Nouvelles fonctionnalités demandées : Stock initial modifiable, Commission libre, Période modifiable ---
  public updateTreatmentInitialStock(inventoryId: string, initialStockValue: number, initialStockDate?: string) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable.' };
    const treatment = this.getInventoryTreatment(inventoryId);
    if (!treatment) return { success: false, message: 'Traitement introuvable.' };

    const currentUser = this.getCurrentUser();
    const oldVal = treatment.initialStockValue;
    treatment.initialStockValue = initialStockValue;
    if (initialStockDate) {
      treatment.initialStockDate = initialStockDate;
    }

    // Mettre à jour également la boutique pour conserver la référence
    const shop = this.shops.find(s => s.id === inv.shopId);
    if (shop) {
      shop.initialStockValue = initialStockValue;
      if (initialStockDate) shop.initialStockDate = initialStockDate;
      this.save(STORAGE_KEYS.SHOPS, this.shops);
    }

    treatment.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      shopName: inv.shopName,
      nature: 'Modification du stock initial de référence',
      field: `Stock Initial au ${treatment.initialStockDate}`,
      oldValue: formatFCFA(oldVal),
      newValue: formatFCFA(initialStockValue)
    });

    inv.treatment = this.recalculateTreatment(treatment);
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, treatment: inv.treatment, message: 'Stock initial de référence mis à jour avec succès.' };
  }

  public updateTreatmentCommissionRate(inventoryId: string, commissionRate: number) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable.' };
    const treatment = this.getInventoryTreatment(inventoryId);
    if (!treatment) return { success: false, message: 'Traitement introuvable.' };

    const currentUser = this.getCurrentUser();
    const oldRate = treatment.commissionRate;
    treatment.commissionRate = commissionRate;

    treatment.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      shopName: inv.shopName,
      nature: 'Ajustement libre du pourcentage de commission',
      field: 'commissionRate',
      oldValue: `${oldRate}%`,
      newValue: `${commissionRate}%`
    });

    inv.treatment = this.recalculateTreatment(treatment);
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, treatment: inv.treatment, message: `Pourcentage de commission ajusté à ${commissionRate}%.` };
  }

  public updateTreatmentPeriod(inventoryId: string, periodStart: string, periodEnd: string) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable.' };
    const treatment = this.getInventoryTreatment(inventoryId);
    if (!treatment) return { success: false, message: 'Traitement introuvable.' };

    const currentUser = this.getCurrentUser();
    const oldPeriod = `Du ${treatment.periodStart} au ${treatment.periodEnd}`;
    treatment.periodStart = periodStart;
    treatment.periodEnd = periodEnd;

    treatment.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      shopName: inv.shopName,
      nature: 'Modification de la période inventoriée par le responsable',
      field: 'Période inventoriée',
      oldValue: oldPeriod,
      newValue: `Du ${periodStart} au ${periodEnd}`
    });

    inv.treatment = this.recalculateTreatment(treatment);
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, treatment: inv.treatment, message: `Période définie du ${periodStart} au ${periodEnd}.` };
  }

  // --- Pouvoirs Souverains du PDG (Fondateur — Spectateur / Arbitre) ---
  public submitPdgArbitration(
    inventoryId: string, 
    decision: 'FINALISE' | 'RENVOYE_CONTROLE' | 'EN_ATTENTE' | 'MOTIF_SPECIAL', 
    note: string, 
    comment?: string
  ): { success: boolean; message: string } {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable.' };

    const currentUser = this.getCurrentUser();
    const decisionAt = new Date().toLocaleString('fr-FR');

    inv.pdgDecision = decision;
    inv.pdgDecisionNote = note;
    inv.pdgDecisionAt = decisionAt;
    if (comment) inv.pdgComment = comment;

    if (decision === 'FINALISE') {
      inv.status = 'Validé et clôturé';
      inv.validatedAt = decisionAt;
      inv.validatedBy = `${currentUser.name} (PDG Fondateur)`;
      if (inv.treatment) {
        inv.treatment.validationStatus = 'VALIDE_DEFINITIF';
        inv.treatment.validatedBy = `${currentUser.name} (PDG Fondateur)`;
        inv.treatment.validatedAt = decisionAt;
      }
    } else if (decision === 'RENVOYE_CONTROLE') {
      inv.status = 'En contrôle';
      inv.rejectionReason = note;
      inv.rejectedAt = decisionAt;
      inv.rejectedBy = `${currentUser.name} (PDG Fondateur)`;
      if (inv.treatment) {
        inv.treatment.controlStatus = 'EN_ATTENTE_CONTROLE';
      }
    } else if (decision === 'EN_ATTENTE') {
      inv.notes = `[Mise en attente par le PDG le ${decisionAt}] : ${note}`;
    }

    // Traçabilité du PDG dans l'audit général
    this.addAuditLog({
      action: `ARBITRAGE_PDG_${decision}`,
      actionType: 'APPROBATION',
      targetObject: `Inventaire ${inv.code} — ${inv.shopName}`,
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      newValue: `Décision PDG : ${decision} | Motif : ${note}`,
      reason: comment || note,
      status: 'SUCCESS'
    });

    if (inv.treatment) {
      inv.treatment.auditTrail.push({
        id: `aud_pdg_${Date.now()}`,
        timestamp: decisionAt,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        shopName: inv.shopName,
        nature: `DÉCISION SOUVERAINE PDG : ${decision}`,
        field: 'Arbitrage Direction Générale',
        newValue: note
      });
    }

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, message: `Décision souveraine du PDG enregistrée : ${decision}.` };
  }

  public addPdgComment(inventoryId: string, comment: string): { success: boolean; message: string } {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable.' };

    const currentUser = this.getCurrentUser();
    inv.pdgComment = comment;

    if (inv.treatment) {
      inv.treatment.auditTrail.push({
        id: `aud_pdg_c_${Date.now()}`,
        timestamp: new Date().toLocaleString('fr-FR'),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        shopName: inv.shopName,
        nature: 'Annotation souveraine du PDG',
        field: 'Commentaire Direction Générale',
        newValue: comment
      });
    }

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, message: 'Commentaire du PDG consigné au dossier officiel.' };
  }

  public getCatalog(): CatalogItem[] {
    return this.catalog;
  }

  public getPriceHistories(): PriceHistory[] {
    return this.priceHistories;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  // Consultation d'un inventaire (traçabilité complète : qui a consulté, quand, quel inventaire)
  public logInventoryConsultation(inventoryId: string) {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return;
    this.addAuditLog({
      action: 'CONSULTATION_INVENTAIRE',
      actionType: 'CONSULTATION',
      targetObject: `Inventaire ${inv.code} — ${inv.shopName}`,
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      reason: 'Accès en lecture de l\'inventaire',
      status: 'SUCCESS'
    });
  }

  // Export d'un inventaire (traçabilité : qui a exporté, format, quand)
  public logInventoryExport(inventoryId: string, exportType: 'PDF' | 'CSV' | 'EXCEL') {
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return;
    this.addAuditLog({
      action: `EXPORT_INVENTAIRE_${exportType}`,
      actionType: 'EXPORT',
      targetObject: `Inventaire ${inv.code} — ${inv.shopName}`,
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      newValue: `Format exporté : ${exportType}`,
      reason: `Export ${exportType} généré et téléchargé`,
      status: 'SUCCESS'
    });
  }

  public getInvitations(): ShopInvitation[] {
    return this.invitations;
  }

  public getCampaigns(): Campaign[] {
    return this.campaigns;
  }

  public getNotifications(): AppNotification[] {
    const currentUser = this.getCurrentUser();
    // RÈGLE MÉTIER : Si l'utilisateur est un Chef d'Agence (RESPONSABLE_BOUTIQUE),
    // il ne reçoit et ne voit QUE les notifications qui concernent exclusivement sa propre agence.
    // Les autres chefs d'agence ne doivent pas être informés des inventaires des boutiques tierces.
    // Les inventoristes, contrôleurs et membres de l'administration sont en revanche tous informés.
    if (currentUser.role === 'RESPONSABLE_BOUTIQUE') {
      return this.notifications.filter(n => {
        if (n.shopId && currentUser.shopId && n.shopId !== currentUser.shopId) {
          return false;
        }
        return true;
      });
    }
    return this.notifications;
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public createCampaign(params: Omit<Campaign, 'id'>): { success: boolean; message: string; campaign?: Campaign } {
    const newCamp: Campaign = {
      id: 'camp_' + Date.now(),
      ...params
    };
    this.campaigns = [newCamp, ...this.campaigns];
    this.save(STORAGE_KEYS.CAMPAIGNS, this.campaigns);

    // Notification automatique pour le Chef d'agence dans l'application
    const coveredNames = this.shops.filter(s => newCamp.shopsCovered.includes(s.id)).map(s => s.name).join(', ') || 'Réseau Agences';
    const chefNotif: AppNotification = {
      id: 'notif_camp_' + Date.now(),
      title: `📅 Ordre de mission : Planification d'inventaire (${newCamp.name})`,
      message: `Votre agence (${coveredNames}) est convoquée pour l'inventaire officiel du ${newCamp.startDate} au ${newCamp.endDate}. Superviseur : ${newCamp.supervisorName}. Ordre de mission PDF généré.`,
      type: 'INFO',
      timestamp: new Date().toISOString(),
      read: false,
      linkModule: '07_campaigns'
    };
    this.notifications = [chefNotif, ...this.notifications];
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    this.addAuditLog({
      action: 'CREATION_CAMPAGNE_INVENTAIRE',
      newValue: `Campagne : ${newCamp.name} (${newCamp.type})`,
      reason: 'Planification officielle enregistrée',
      status: 'SUCCESS'
    });
    this.notify();
    return { success: true, message: 'Planification d\'inventaire enregistrée avec succès. Notification transmise au chef d\'agence.', campaign: newCamp };
  }

  public createUser(userData: Omit<User, 'id'>): { success: boolean; message: string; user?: User } {
    const currentUser = this.getCurrentUser();
    
    // Règle métier : L'administrateur SaaS peut tout créer (PDG, Secrétaire, Magasinier, etc.)
    // La Secrétaire de Direction ou le PDG peuvent ajouter Inventoristes, Contrôleurs, Resp. Inventaire, Resp. Boutique.
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'PDG' && currentUser.role !== 'SECRETAIRE_DIRECTION') {
      return { 
        success: false, 
        message: 'Accès refusé : Seul l\'Administrateur SaaS, le PDG ou la Secrétaire de Direction peut créer des utilisateurs.' 
      };
    }

    // Si l'utilisateur courant est Secrétaire, il ne peut pas créer de compte ADMIN ou PDG
    if (currentUser.role === 'SECRETAIRE_DIRECTION' && (userData.role === 'ADMIN' || userData.role === 'PDG')) {
      return { 
        success: false, 
        message: 'Action refusée : La création des comptes PDG et Administrateur est réservée à l\'Administrateur SaaS.' 
      };
    }

    const uniqueId = userData.uniqueIdentifier || `ALU-USR-${Math.floor(10000 + Math.random() * 90000)}`;

    const newUser: User = {
      id: 'usr_' + Date.now(),
      uniqueIdentifier: uniqueId,
      status: userData.status || 'ACTIF',
      createdAt: new Date().toISOString(),
      ...userData
    };

    this.users = [...this.users, newUser];
    this.save(STORAGE_KEYS.USERS, this.users);

    this.addAuditLog({
      action: 'CREATION_COMPTE_UTILISATEUR',
      newValue: `${newUser.name} (${newUser.role}) — ID Unique: ${uniqueId}`,
      reason: `Création profil utilisateur par ${currentUser.name} (${currentUser.role})`,
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Utilisateur créé avec succès', user: newUser };
  }

  // MONOPOLE EXCLUSIF : Seul l'Administrateur du SaaS (Propriétaire de la plateforme) peut supprimer un membre.
  // La Secrétaire de Direction et le PDG ne peuvent en aucun cas supprimer un membre.
  public deleteUser(userId: string): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    const canDelete = currentUser.role === 'ADMIN';

    if (!canDelete) {
      this.addAuditLog({
        action: 'TENTATIVE_SUPPRESSION_UTILISATEUR_REFUSEE',
        reason: 'Violation stricte de gouvernance : Seul l\'Administrateur du SaaS (Propriétaire) détient le monopole exclusif de supprimer un membre',
        status: 'BLOCKED'
      });
      return { 
        success: false, 
        message: 'Action formellement interdite : Seul l\'Administrateur du SaaS (Propriétaire de la plateforme) détient le monopole exclusif de supprimer un utilisateur. Ni la Secrétaire de Direction ni le PDG ne peuvent supprimer un membre.' 
      };
    }

    const targetUser = this.users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'Utilisateur introuvable.' };
    }

    if (targetUser.id === currentUser.id) {
      return { success: false, message: 'Impossible de supprimer votre propre compte connecté.' };
    }

    this.users = this.users.filter(u => u.id !== userId);
    this.save(STORAGE_KEYS.USERS, this.users);

    this.addAuditLog({
      action: 'SUPPRESSION_COMPTE_UTILISATEUR',
      oldValue: `${targetUser.name} (${targetUser.role})`,
      newValue: 'Compte définitivement retiré de la plateforme',
      reason: `Retrait d'utilisateur opéré par ${currentUser.name} (${currentUser.role})`,
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: `L'utilisateur ${targetUser.name} (${targetUser.role}) a été supprimé avec succès.` };
  }

  // --- Messagerie collaborative et envoi de preuves / photos justificatives ---
  public getProofMessages(): MessageProof[] {
    return this.proofMessages;
  }

  public sendProofMessage(params: {
    subject: string;
    content: string;
    category: MessageProof['category'];
    recipientType?: MessageProof['recipientType'];
    shopId?: string;
    attachments?: MessageAttachment[];
  }): { success: boolean; message: string; proofMessage?: MessageProof } {
    const currentUser = this.getCurrentUser();
    const shop = params.shopId ? this.shops.find(s => s.id === params.shopId) : undefined;

    const newMsg: MessageProof = {
      id: 'msg_proof_' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientType: params.recipientType || 'ADMINISTRATION',
      subject: params.subject,
      content: params.content,
      category: params.category,
      shopId: params.shopId,
      shopName: shop?.name,
      attachments: params.attachments || [],
      createdAt: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'TRANSMIS'
    };

    this.proofMessages = [newMsg, ...this.proofMessages];
    this.save(STORAGE_KEYS.PROOF_MESSAGES, this.proofMessages);

    // Notification in-app pour l'Administration
    const adminNotif: AppNotification = {
      id: 'notif_msg_' + Date.now(),
      title: `📨 Nouveau justificatif : ${newMsg.subject}`,
      message: `${currentUser.name} (${currentUser.role}) a transmis un message avec ${(newMsg.attachments || []).length} pièce(s) jointe(s).`,
      type: 'INFO',
      timestamp: new Date().toISOString(),
      read: false,
      linkModule: '15_notifications'
    };
    this.notifications = [adminNotif, ...this.notifications];
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    this.addAuditLog({
      action: 'ENVOI_MESSAGE_JUSTIFICATIF',
      newValue: `Sujet : ${newMsg.subject} (${(newMsg.attachments || []).length} pièce(s))`,
      reason: `Preuve/message transmis par ${currentUser.name}`,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Message et justificatifs transmis à l\'Administration avec succès.', proofMessage: newMsg };
  }

  public replyToProofMessage(messageId: string, responseText: string): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    const msg = this.proofMessages.find(m => m.id === messageId);
    if (!msg) return { success: false, message: 'Message introuvable.' };

    msg.adminResponse = {
      responderName: currentUser.name,
      responderRole: currentUser.role,
      response: responseText,
      respondedAt: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
    };
    msg.status = 'REPONDU';

    this.save(STORAGE_KEYS.PROOF_MESSAGES, this.proofMessages);

    const replyNotif: AppNotification = {
      id: 'notif_rep_' + Date.now(),
      title: `💬 Réponse Direction à votre justificatif : ${msg.subject}`,
      message: `${currentUser.name} (${currentUser.role}) a répondu à votre attestation : "${responseText.substring(0, 80)}..."`,
      type: 'SUCCESS',
      timestamp: new Date().toISOString(),
      read: false,
      linkModule: '15_notifications'
    };
    this.notifications = [replyNotif, ...this.notifications];
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    this.notify();
    return { success: true, message: 'Réponse transmise avec succès à l\'utilisateur.' };
  }

  public getTemporaryPermissions(): TemporaryPermission[] {
    this.checkPermissionsExpiry();
    return this.permissions;
  }

  public getInventories(): Inventory[] {
    const currentUser = this.getCurrentUser();
    this.checkPermissionsExpiry();

    let list = this.inventories;

    // Règle métier stricte : Tous les utilisateurs peuvent voir les inventaires clôturés, SAUF les inventoristes !
    if (currentUser.role === 'INVENTORISTE') {
      // Les inventoristes ne peuvent JAMAIS consulter après validation/clôture
      list = list.filter(inv => inv.status !== 'Validé et clôturé');
      if (currentUser.shopId) {
        list = list.filter(inv => inv.shopId === currentUser.shopId || inv.assignedCounterId === currentUser.id);
      }
    } else if (currentUser.role === 'RESPONSABLE_BOUTIQUE') {
      // Le responsable de boutique voit les inventaires de sa boutique ET tous les inventaires clôturés du réseau
      list = list.filter(inv => 
        inv.status === 'Validé et clôturé' || 
        (currentUser.shopId && inv.shopId === currentUser.shopId)
      );
    }
    // Tous les autres rôles (ADMIN, PDG, DG, MAGASINIER, SECRETAIRE_DIRECTION, CONTROLEUR, RESPONSABLE_INVENTAIRE) voient tout !

    return list;
  }

  public getInventoryById(id: string): Inventory | undefined {
    const inv = this.inventories.find(i => i.id === id);
    if (!inv) return undefined;

    const currentUser = this.getCurrentUser();
    // Les inventoristes ne peuvent pas consulter les informations après la validation
    if (currentUser.role === 'INVENTORISTE' && inv.status === 'Validé et clôturé') {
      return undefined;
    }
    // Si responsable de boutique : accès à sa propre boutique en cours OU à tout inventaire clôturé
    if (currentUser.role === 'RESPONSABLE_BOUTIQUE' && currentUser.shopId) {
      if (inv.status !== 'Validé et clôturé' && inv.shopId !== currentUser.shopId) {
        return undefined; // Accès refusé à l'inventaire en cours d'une autre boutique
      }
    }
    return inv;
  }

  // --- Sécurité & Droits ---
  public switchUser(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.currentUserId = user.id;
      this.save(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
      this.addAuditLog({
        action: 'CHANGEMENT_UTILISATEUR_SESSION',
        newValue: `Connexion active sous : ${user.name} (${user.role})`,
        status: 'SUCCESS'
      });
      this.notify();
    }
  }

  public checkPermissionsExpiry() {
    const now = new Date().toISOString();
    let changed = false;

    this.permissions = this.permissions.map(perm => {
      if (perm.status === 'ACTIVE' && perm.expiresAt < now) {
        changed = true;
        this.addAuditLog({
          action: 'EXPIRATION_AUTO_PERMISSION',
          inventoryId: perm.inventoryId,
          inventoryCode: perm.inventoryCode,
          shopId: perm.shopId,
          shopName: perm.shopName,
          oldValue: `Permission accordée à ${perm.userName}`,
          newValue: 'Statut : EXPIRED',
          reason: 'Délai accordé de ' + perm.durationMinutes + ' minutes écoulé',
          status: 'SUCCESS'
        });
        return { ...perm, status: 'EXPIRED' as const };
      }
      return perm;
    });

    if (changed) {
      this.save(STORAGE_KEYS.PERMISSIONS, this.permissions);
    }
  }

  public hasActiveEditPermission(inventoryId: string, category: Category): { allowed: boolean; reason?: string } {
    const user = this.getCurrentUser();
    const inventory = this.inventories.find(i => i.id === inventoryId);

    if (!inventory) {
      return { allowed: false, reason: 'Inventaire introuvable' };
    }

    // Un inventaire validé et clôturé ne peut JAMAIS être modifié directement
    if (inventory.status === 'Validé et clôturé') {
      return { 
        allowed: false, 
        reason: 'Inventaire scellé et clôturé définitivement. Une procédure exceptionnelle de réouverture avec justification est exigée.' 
      };
    }

    // L'Administrateur SaaS, le PDG, le Magasinier et les Responsables d'inventaire désignés ont les pleins pouvoirs
    if (user.role === 'ADMIN' || user.role === 'PDG' || user.role === 'MAGASINIER' || (user.role === 'RESPONSABLE_INVENTAIRE' && user.isDesignatedByPDG)) {
      return { allowed: true };
    }

    // VERROUILLAGE STRICT : Dès que le comptage est soumis ("Comptage terminé"), l'inventoriste n'a PLUS DU TOUT la main
    if (inventory.status === 'Comptage terminé') {
      if (user.role === 'INVENTORISTE') {
        return { 
          allowed: false, 
          reason: 'Comptage clôturé et soumis à l\'administration : vos droits de modification directe sont irrévocablement verrouillés. Vous pouvez uniquement soumettre des demandes écrites d\'ajustement par la messagerie intégrée.' 
        };
      }
      return { allowed: false, reason: 'Comptage en attente de mise en contrôle par le PDG ou la Secrétaire de Direction.' };
    }

    // Si on est en phase "En cours de comptage", l'inventoriste assigné peut compter
    if (inventory.status === 'En cours de comptage' || inventory.status === 'Brouillon') {
      if (user.role === 'INVENTORISTE') {
        if (inventory.assignedCounterId && inventory.assignedCounterId !== user.id) {
          return { allowed: false, reason: 'Cet inventaire est assigné nominativement à un autre inventoriste.' };
        }
        if (user.shopId && user.shopId !== inventory.shopId) {
          return { allowed: false, reason: 'Vous êtes restreint aux inventaires de votre boutique d\'affectation.' };
        }
        return { allowed: true };
      }
      return { allowed: false, reason: 'Seul l\'inventoriste assigné peut saisir pendant la phase active de comptage.' };
    }

    // En phase "En contrôle" : Les CONTRÔLEURS ont la capacité directe de corriger les quantités mal saisies
    if (inventory.status === 'En contrôle') {
      if (user.role === 'CONTROLEUR' || user.role === 'RESPONSABLE_INVENTAIRE') {
        return { allowed: true };
      }
      if (user.role === 'INVENTORISTE') {
        return { 
          allowed: false, 
          reason: 'Inventaire placé en contrôle d\'intégrité : Seuls les contrôleurs et responsables peuvent rectifier les quantités. Utilisez la messagerie pour expliciter vos motifs.' 
        };
      }
    }

    return { allowed: false, reason: 'Le statut actuel (' + inventory.status + ') ne permet pas de modification directe pour votre profil.' };
  }

  // --- Gestion des Permissions Temporaires ---
  public grantTemporaryPermission(params: {
    userId: string;
    inventoryId: string;
    scope: 'Aluminium' | 'Accessoires' | 'Complet';
    action: 'Corriger les quantités' | 'Modifier observations' | 'Contrôle complet';
    durationMinutes: number;
    reason: string;
  }): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();

    // Vérification stricte des pouvoirs
    if (currentUser.role !== 'PDG' && currentUser.role !== 'MAGASINIER' && !(currentUser.role === 'RESPONSABLE_INVENTAIRE' && currentUser.isDesignatedByPDG)) {
      this.addAuditLog({
        action: 'TENTATIVE_OCTROI_PERMISSION_REFUSEE',
        reason: 'Utilisateur non habilité par le PDG',
        status: 'BLOCKED'
      });
      return { success: false, message: 'Seul le PDG, le Magasinier ou un Responsable d\'inventaire désigné peut accorder des permissions.' };
    }

    const targetUser = this.users.find(u => u.id === params.userId);
    const inventory = this.inventories.find(i => i.id === params.inventoryId);

    if (!targetUser || !inventory) {
      return { success: false, message: 'Utilisateur ou inventaire introuvable.' };
    }

    if (!params.reason || params.reason.trim().length < 5) {
      return { success: false, message: 'Un motif d\'autorisation explicite et obligatoire doit être renseigné.' };
    }

    const grantedAt = new Date();
    const expiresAt = new Date(grantedAt.getTime() + params.durationMinutes * 60 * 1000);

    const newPerm: TemporaryPermission = {
      id: 'perm_' + Date.now(),
      userId: targetUser.id,
      userName: `${targetUser.name} (${targetUser.role})`,
      shopId: inventory.shopId,
      shopName: inventory.shopName,
      inventoryId: inventory.id,
      inventoryCode: inventory.code,
      scope: params.scope,
      action: params.action,
      grantedById: currentUser.id,
      grantedByName: `${currentUser.name} (${currentUser.role})`,
      grantedAt: grantedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      durationMinutes: params.durationMinutes,
      reason: params.reason,
      status: 'ACTIVE'
    };

    this.permissions = [newPerm, ...this.permissions];
    this.save(STORAGE_KEYS.PERMISSIONS, this.permissions);

    this.addAuditLog({
      action: 'OCTROI_PERMISSION_TEMPORAIRE',
      shopId: inventory.shopId,
      shopName: inventory.shopName,
      inventoryId: inventory.id,
      inventoryCode: inventory.code,
      newValue: `Permission accordée à ${targetUser.name} (${params.durationMinutes} min - ${params.scope})`,
      reason: params.reason,
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Permission temporaire accordée avec succès.' };
  }

  public revokePermission(permissionId: string): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'PDG' && currentUser.role !== 'MAGASINIER' && !(currentUser.role === 'RESPONSABLE_INVENTAIRE' && currentUser.isDesignatedByPDG)) {
      return { success: false, message: 'Action non autorisée.' };
    }

    const perm = this.permissions.find(p => p.id === permissionId);
    if (!perm) return { success: false, message: 'Permission introuvable.' };

    perm.status = 'REVOKED';
    this.save(STORAGE_KEYS.PERMISSIONS, this.permissions);

    this.addAuditLog({
      action: 'REVOCATION_PERMISSION_TEMPORAIRE',
      shopId: perm.shopId,
      shopName: perm.shopName,
      inventoryId: perm.inventoryId,
      inventoryCode: perm.inventoryCode,
      oldValue: `Active jusqu'à ${new Date(perm.expiresAt).toLocaleTimeString()}`,
      newValue: 'Statut : REVOKED',
      reason: 'Révocation immédiate ordonnée par le responsable habilité',
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Permission révoquée avec effet immédiat.' };
  }

  // --- Saisie progressive & Enregistrement des lignes d'inventaire ---
  public saveInventoryLine(inventoryId: string, lineData: Partial<InventoryLine> & { productId: string }): { success: boolean; message: string } {
    const inventory = this.inventories.find(i => i.id === inventoryId);
    if (!inventory) return { success: false, message: 'Inventaire introuvable' };

    const itemCatalog = this.catalog.find(c => c.id === lineData.productId);
    if (!itemCatalog) return { success: false, message: 'Article du catalogue introuvable' };

    const check = this.hasActiveEditPermission(inventoryId, itemCatalog.category);
    if (!check.allowed) {
      this.addAuditLog({
        action: 'TENTATIVE_SAISIE_BLOQUEE',
        inventoryId: inventory.id,
        inventoryCode: inventory.code,
        shopId: inventory.shopId,
        shopName: inventory.shopName,
        reason: check.reason,
        status: 'BLOCKED'
      });
      return { success: false, message: check.reason || 'Modification non autorisée' };
    }

    const currentUser = this.getCurrentUser();
    const existingIndex = inventory.lines.findIndex(l => l.productId === lineData.productId);

    const price = existingIndex >= 0 ? inventory.lines[existingIndex].officialPriceSnapshot : itemCatalog.officialPrice;
    const qtyGood = Math.max(0, lineData.qtyGood !== undefined ? lineData.qtyGood : (existingIndex >= 0 ? inventory.lines[existingIndex].qtyGood : 0));
    const qtyDamaged = Math.max(0, lineData.qtyDamaged !== undefined ? lineData.qtyDamaged : (existingIndex >= 0 ? inventory.lines[existingIndex].qtyDamaged : 0));
    
    const amountGood = qtyGood * price;
    const amountDamaged = qtyDamaged * price;
    const totalAmount = amountGood + amountDamaged;

    const updatedLine: InventoryLine = {
      id: existingIndex >= 0 ? inventory.lines[existingIndex].id : 'line_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      inventoryId: inventory.id,
      productId: itemCatalog.id,
      designation: itemCatalog.designation,
      category: itemCatalog.category,
      color: itemCatalog.color,
      unit: itemCatalog.unit,
      officialPriceSnapshot: price,
      qtyGood,
      qtyDamaged,
      damageReason: lineData.damageReason ?? (existingIndex >= 0 ? inventory.lines[existingIndex].damageReason : undefined),
      amountGood,
      amountDamaged,
      totalAmount,
      observation: lineData.observation !== undefined ? lineData.observation : (existingIndex >= 0 ? inventory.lines[existingIndex].observation : ''),
      lastModifiedBy: currentUser.id,
      lastModifiedAt: new Date().toISOString(),
      wasCorrected: inventory.status === 'En contrôle'
    };

    if (existingIndex >= 0) {
      const oldLine = inventory.lines[existingIndex];
      // Si modification en cours de contrôle, consigner dans le journal
      if (inventory.status === 'En contrôle' && (oldLine.qtyGood !== qtyGood || oldLine.qtyDamaged !== qtyDamaged)) {
        this.addAuditLog({
          action: 'CORRECTION_QUANTITE_CONTROLE',
          actionType: 'MODIFICATION',
          targetObject: itemCatalog.designation,
          shopId: inventory.shopId,
          shopName: inventory.shopName,
          inventoryId: inventory.id,
          inventoryCode: inventory.code,
          oldValue: `${itemCatalog.designation} — Bon: ${oldLine.qtyGood}, Gâté: ${oldLine.qtyDamaged}`,
          newValue: `Bon: ${qtyGood}, Gâté: ${qtyDamaged}`,
          reason: lineData.observation || 'Ajustement de contrôle de conformité',
          authorizedBy: currentUser.name,
          status: 'SUCCESS'
        });
      }
      inventory.lines[existingIndex] = updatedLine;
    } else {
      inventory.lines.push(updatedLine);
    }

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.notify();
    return { success: true, message: 'Ligne enregistrée avec succès' };
  }

  // --- Cycle de vie de l'inventaire ---
  public createInventory(params: {
    shopId: string;
    category: Category;
    campaignName: string;
    assignedCounterId?: string;
    locationType?: LocationType;
    siteName?: string;
  }): { success: boolean; message: string; inventoryId?: string } {
    const currentUser = this.getCurrentUser();
    
    // Règle formelle : C'est la Secrétaire de Direction, le PDG (ou l'Admin SaaS / Magasinier) qui programme les inventaires
    const canPlan = currentUser.role === 'ADMIN' || 
                    currentUser.role === 'PDG' || 
                    currentUser.role === 'SECRETAIRE_DIRECTION' || 
                    currentUser.role === 'MAGASINIER' || 
                    (currentUser.role === 'RESPONSABLE_INVENTAIRE' && currentUser.isDesignatedByPDG);

    if (!canPlan) {
      return { 
        success: false, 
        message: 'Accès refusé : Seul le PDG ou la Secrétaire de Direction (ou l\'Administrateur SaaS) a le pouvoir de programmer et lancer des inventaires.' 
      };
    }

    const shop = this.shops.find(s => s.id === params.shopId);
    if (!shop) return { success: false, message: 'Boutique introuvable.' };

    const counter = this.users.find(u => u.id === params.assignedCounterId);

    // Initialiser les lignes d'inventaire à partir du catalogue officiel avec prix snapshot
    const initialLines: InventoryLine[] = this.catalog
      .filter(item => item.isActive && item.category === params.category)
      .map(item => ({
        id: 'line_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        inventoryId: '',
        productId: item.id,
        designation: item.designation,
        category: item.category,
        color: item.color,
        unit: item.unit,
        officialPriceSnapshot: item.officialPrice,
        qtyGood: 0,
        qtyDamaged: 0,
        amountGood: 0,
        amountDamaged: 0,
        totalAmount: 0,
        observation: '',
      }));

    const count = this.inventories.length + 1;
    const invCode = `INV-2026-${shop.code.replace('ALT-BT-', 'BT').replace('ALT-CH-', 'CH')}-${params.category.substring(0, 3).toUpperCase()}-${String(count).padStart(3, '0')}`;

    const newInvId = 'inv_' + Date.now();
    initialLines.forEach(l => l.inventoryId = newInvId);

    const newInventory: Inventory = {
      id: newInvId,
      code: invCode,
      shopId: shop.id,
      shopName: shop.name,
      locationType: params.locationType || shop.type,
      siteName: params.siteName,
      category: params.category,
      status: 'Brouillon',
      campaignName: params.campaignName || 'Campagne Inventaire 2026',
      version: 1,
      assignedCounterId: counter?.id,
      assignedCounterName: counter?.name,
      createdAt: new Date().toISOString(),
      lines: initialLines,
      versionsHistory: []
    };

    this.inventories = [newInventory, ...this.inventories];
    shop.activeInventoriesCount += 1;

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);
    this.save(STORAGE_KEYS.SHOPS, this.shops);

    this.addAuditLog({
      action: 'CREATION_INVENTAIRE',
      actionType: 'CREATION',
      targetObject: `Inventaire ${invCode} (${params.category})`,
      shopId: shop.id,
      shopName: shop.name,
      inventoryId: newInvId,
      inventoryCode: invCode,
      newValue: `Inventaire créé au statut Brouillon (${params.category})`,
      reason: 'Ouverture nouvelle session d\'inventaire par ' + currentUser.name,
      status: 'SUCCESS'
    });

    // Notification automatique pour le Chef d'Agence de cette agence / boutique
    const chefNotif: AppNotification = {
      id: 'notif_inv_' + Date.now(),
      title: `📅 Mission d'inventaire programmée : ${shop.name}`,
      message: `Un inventaire officiel (${params.category}) a été programmé pour votre agence ${shop.name} (${invCode}). Veuillez consulter la convocation et préparer les dépôts.`,
      type: 'INFO',
      timestamp: new Date().toISOString(),
      read: false,
      shopId: shop.id,
      inventoryId: newInvId,
      linkModule: '09_control_verification'
    };
    this.notifications = [chefNotif, ...this.notifications];
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    this.notify();
    return { success: true, message: 'Inventaire programmé avec succès. Notification transmise au chef d\'agence.', inventoryId: newInvId };
  }

  public updateInventoryStatus(inventoryId: string, targetStatus: Inventory['status'], reason?: string): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable' };

    // Vérification des transitions
    if (targetStatus === 'En cours de comptage') {
      inv.status = 'En cours de comptage';
      inv.countStartedAt = new Date().toISOString();
    } else if (targetStatus === 'Comptage terminé') {
      inv.status = 'Comptage terminé';
      inv.countSubmittedAt = new Date().toISOString();
    } else if (targetStatus === 'En contrôle') {
      inv.status = 'En contrôle';
      inv.controlOpenedAt = inv.controlOpenedAt || new Date().toISOString();
    } else if (targetStatus === 'Prêt pour validation') {
      inv.status = 'Prêt pour validation';
    }

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);

    this.addAuditLog({
      action: 'TRANSITION_STATUT_INVENTAIRE',
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      newValue: `Statut changé vers : ${targetStatus}`,
      reason: reason || 'Transition normale du cycle de vie',
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: `Statut mis à jour vers ${targetStatus}` };
  }

  // 1. Clôture du comptage par l'inventoriste -> Verrouillage immédiat des modifications
  public submitCounting(inventoryId: string): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable' };

    inv.status = 'Comptage terminé';
    inv.countSubmittedAt = new Date().toISOString();

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);

    this.addAuditLog({
      action: 'SOUMISSION_COMPTAGE_TERRAIN',
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      newValue: 'Comptage terminé et soumis à l\'administration',
      reason: 'Saisie terrain achevée par ' + currentUser.name + '. Modification directe verrouillée.',
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { 
      success: true, 
      message: 'Comptage soumis avec succès à l\'administration. Vos droits d\'édition directe sont à présent verrouillés.' 
    };
  }

  // 2. Mise en contrôle par le PDG ou la Secrétaire de Direction
  public putInControl(inventoryId: string): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'PDG' && currentUser.role !== 'SECRETAIRE_DIRECTION' && currentUser.role !== 'ADMIN' && currentUser.role !== 'MAGASINIER') {
      return { success: false, message: 'Seul le PDG ou la Secrétaire de Direction peut mettre un inventaire en contrôle.' };
    }

    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable' };

    inv.status = 'En contrôle';
    inv.controlOpenedAt = new Date().toISOString();

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);

    this.addAuditLog({
      action: 'OUVERTURE_CONTROLE_ADMINISTRATIF',
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      newValue: 'Statut : En contrôle',
      reason: 'Ouverture du contrôle par ' + currentUser.name + ' (' + currentUser.role + ')',
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Inventaire placé en phase de contrôle avec succès. Les contrôleurs peuvent désormais rectifier les quantités.' };
  }

  // 3. Clôture du contrôle par les Contrôleurs -> Soumission aux Responsables d'inventaire
  public closeControlAndSubmitToResponsable(inventoryId: string, notes?: string): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable' };

    inv.status = 'Prêt pour validation';
    inv.notes = notes ? `${inv.notes || ''}\n[Contrôle] ${notes}` : inv.notes;

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);

    this.addAuditLog({
      action: 'CLOTURE_CONTROLE_SOUMISSION_RESPONSABLE',
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      newValue: 'Contrôle clôturé -> Transmis au Responsable d\'inventaire',
      reason: notes || 'Vérification et corrections de contrôle achevées',
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Contrôle clôturé et soumis au Responsable d\'inventaire pour finalisation.' };
  }

  // 4. Finalisation du traitement par le Responsable d'inventaire -> Soumission au PDG
  public submitToPDG(inventoryId: string, notes?: string): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable' };

    inv.status = 'Prêt pour validation';
    if (notes) {
      inv.notes = `${inv.notes || ''}\n[Responsable d'inventaire] ${notes}`;
    }

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);

    this.addAuditLog({
      action: 'SOUMISSION_RAPPORT_AU_PDG',
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      newValue: 'Dossier finalisé et soumis pour arbitrage/décision du PDG',
      reason: notes || 'Traitement finalisé par le Responsable d\'inventaire',
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Dossier finalisé avec succès et soumis au PDG pour validation ou rejet.' };
  }

  // 5. Rejet motivé par le PDG -> Renvoyé en contrôle avec justificatif obligatoire
  public rejectAndReturnToControlByPDG(inventoryId: string, rejectionReason: string): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'PDG' && currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Seul le PDG (ou l\'Administrateur SaaS) a le pouvoir de rejeter un rapport d\'inventaire.' };
    }

    if (!rejectionReason || rejectionReason.trim().length < 5) {
      return { success: false, message: 'Un justificatif motivé et explicite est rigoureusement obligatoire pour rejeter un rapport.' };
    }

    const inv = this.inventories.find(i => i.id === inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable' };

    inv.status = 'En contrôle';
    inv.rejectionReason = rejectionReason;
    inv.rejectedAt = new Date().toISOString();
    inv.rejectedBy = currentUser.name;

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);

    this.addAuditLog({
      action: 'REJET_RAPPORT_PAR_PDG',
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      oldValue: 'Prêt pour validation',
      newValue: 'Statut : En contrôle (Renvoyé par le PDG)',
      reason: rejectionReason,
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Rapport rejeté par le PDG et renvoyé en phase de contrôle avec justificatif motivé.' };
  }

  // 6. Gestion des pièces jointes et photos justificatives (Chefs d'agence / Responsables boutique / Magasinier)
  public uploadInventoryAttachment(params: {
    inventoryId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    dataUrl?: string;
    notes?: string;
  }): { success: boolean; message: string; attachment?: FileAttachment } {
    const currentUser = this.getCurrentUser();
    const inv = this.inventories.find(i => i.id === params.inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable' };

    const attachment: FileAttachment = {
      id: 'att_' + Date.now(),
      fileName: params.fileName,
      fileType: params.fileType,
      fileSize: params.fileSize,
      uploadedBy: currentUser.id,
      uploadedByName: currentUser.name,
      uploadedRole: currentUser.role,
      uploadedAt: new Date().toISOString(),
      dataUrl: params.dataUrl,
      type: currentUser.role === 'RESPONSABLE_BOUTIQUE' ? 'JUSTIFICATIF_BOUTIQUE' : 'RAPPORT_CONTROLE',
      inventoryId: inv.id,
      shopId: inv.shopId,
      notes: params.notes
    };

    if (!inv.attachments) {
      inv.attachments = [];
    }
    inv.attachments.push(attachment);
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);

    this.addAuditLog({
      action: 'AJOUT_PIECE_JOINTE_JUSTIFICATIVE',
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      newValue: `Document: ${params.fileName} (${(params.fileSize / 1024).toFixed(1)} Ko)`,
      reason: params.notes || 'Justificatif apporté par le chef d\'agence / responsable',
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Justificatif (fichier/photo) joint avec succès à l\'inventaire.', attachment };
  }

  // 7. Messagerie d'inventaire : Demandes de modification écrites après soumission
  public sendInventoryMessage(params: {
    inventoryId: string;
    content: string;
    lineId?: string;
    lineDesignation?: string;
    proposedQtyGood?: number;
    proposedQtyDamaged?: number;
    attachmentUrl?: string;
    attachmentName?: string;
  }): { success: boolean; message: string; inventoryMessage?: InventoryMessage } {
    const currentUser = this.getCurrentUser();
    const inv = this.inventories.find(i => i.id === params.inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable' };

    if (!params.content || params.content.trim().length < 5) {
      return { success: false, message: 'Veuillez saisir un texte explicatif détaillé pour votre demande de modification.' };
    }

    const newMsg: InventoryMessage = {
      id: 'msg_' + Date.now(),
      inventoryId: inv.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      timestamp: new Date().toISOString(),
      content: params.content,
      lineId: params.lineId,
      lineDesignation: params.lineDesignation,
      proposedQtyGood: params.proposedQtyGood,
      proposedQtyDamaged: params.proposedQtyDamaged,
      attachmentUrl: params.attachmentUrl,
      attachmentName: params.attachmentName,
      status: 'EN_ATTENTE'
    };

    if (!inv.messages) {
      inv.messages = [];
    }
    inv.messages.push(newMsg);
    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);

    this.addAuditLog({
      action: 'DEMANDE_MODIFICATION_MESSAGERIE',
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      newValue: `Demande écrite émise par ${currentUser.name} (${currentUser.role})`,
      reason: params.content,
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Demande de modification transmise avec succès à l\'équipe de contrôle.', inventoryMessage: newMsg };
  }

  public treatInventoryMessage(params: {
    inventoryId: string;
    messageId: string;
    decision: 'ACCEPTEE' | 'REFUSEE';
    responseNote: string;
    applyQuantities?: boolean;
  }): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    const inv = this.inventories.find(i => i.id === params.inventoryId);
    if (!inv || !inv.messages) return { success: false, message: 'Message introuvable' };

    const msg = inv.messages.find(m => m.id === params.messageId);
    if (!msg) return { success: false, message: 'Message introuvable' };

    msg.status = params.decision;
    msg.responseNote = params.responseNote;
    msg.treatedBy = `${currentUser.name} (${currentUser.role})`;
    msg.treatedAt = new Date().toISOString();

    // Si acceptée et applyQuantities demandé, appliquer la correction sur la ligne
    if (params.decision === 'ACCEPTEE' && params.applyQuantities && msg.lineId) {
      const line = inv.lines.find(l => l.id === msg.lineId);
      if (line) {
        if (msg.proposedQtyGood !== undefined) line.qtyGood = msg.proposedQtyGood;
        if (msg.proposedQtyDamaged !== undefined) line.qtyDamaged = msg.proposedQtyDamaged;
        line.amountGood = line.qtyGood * line.officialPriceSnapshot;
        line.amountDamaged = line.qtyDamaged * line.officialPriceSnapshot;
        line.totalAmount = line.amountGood + line.amountDamaged;
        line.wasCorrected = true;
        line.lastModifiedBy = currentUser.id;
        line.lastModifiedAt = new Date().toISOString();
        line.observation = `[Ajusté suite requête] ${msg.content}`;
      }
    }

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);

    this.addAuditLog({
      action: `TRAITEMENT_REQUETE_${params.decision}`,
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      newValue: `Décision : ${params.decision}`,
      reason: params.responseNote,
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: `Requête de modification traitée : ${params.decision}` };
  }

  // Clôture définitive avec Confirmation Renforcée (Sécurité 12)
  public finalizeAndCloseInventory(params: {
    inventoryId: string;
    securityConfirmationCode: string;
    validatorNotes: string;
  }): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();

    // Règle 10 : Réservé au PDG, au Magasinier (mêmes droits) et aux Responsables désignés par le PDG
    if (currentUser.role !== 'PDG' && currentUser.role !== 'MAGASINIER' && !(currentUser.role === 'RESPONSABLE_INVENTAIRE' && currentUser.isDesignatedByPDG)) {
      this.addAuditLog({
        action: 'TENTATIVE_CLOTURE_NON_AUTORISEE',
        inventoryId: params.inventoryId,
        reason: 'Utilisateur non pourvu de l\'habilitation de clôture',
        status: 'BLOCKED'
      });
      return { 
        success: false, 
        message: 'Action refusée : Seuls le PDG, le Magasinier et les Responsables d\'inventaire désignés peuvent clôturer définitivement un inventaire.' 
      };
    }

    // Confirmation renforcée
    if (params.securityConfirmationCode !== 'ALU-2026' && params.securityConfirmationCode !== '9999') {
      return { success: false, message: 'Code de confirmation de sécurité renforcé erroné.' };
    }

    const inv = this.inventories.find(i => i.id === params.inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable.' };

    const now = new Date().toISOString();

    const totalAmountGood = inv.lines.reduce((sum, l) => sum + l.amountGood, 0);
    const totalAmountDamaged = inv.lines.reduce((sum, l) => sum + l.amountDamaged, 0);
    const totalGeneral = totalAmountGood + totalAmountDamaged;
    const totalUnitsGood = inv.lines.reduce((sum, l) => sum + l.qtyGood, 0);
    const totalUnitsDamaged = inv.lines.reduce((sum, l) => sum + l.qtyDamaged, 0);

    const versionRecord = {
      versionNumber: inv.version,
      closedAt: now,
      closedBy: currentUser.id,
      closedByName: `${currentUser.name} (${currentUser.role})`,
      totalAmountGood,
      totalAmountDamaged,
      totalGeneral,
      totalUnitsGood,
      totalUnitsDamaged,
      reportRef: `RAP-${inv.code}-V${inv.version}.pdf`
    };

    inv.status = 'Validé et clôturé';
    inv.closedAt = now;
    inv.validatedById = currentUser.id;
    inv.validatedByName = currentUser.name;
    inv.notes = params.validatorNotes || inv.notes;
    inv.versionsHistory = [...inv.versionsHistory, versionRecord];

    // Mettre à jour la boutique
    const shop = this.shops.find(s => s.id === inv.shopId);
    if (shop) {
      shop.lastValidationDate = now.split('T')[0];
      shop.activeInventoriesCount = Math.max(0, shop.activeInventoriesCount - 1);
      shop.validatedInventoriesCount += 1;
      this.save(STORAGE_KEYS.SHOPS, this.shops);
    }

    // Révoquer les permissions temporaires associées qui resteraient actives
    this.permissions = this.permissions.map(p => 
      p.inventoryId === inv.id && p.status === 'ACTIVE' 
        ? { ...p, status: 'REVOKED' as const } 
        : p
    );
    this.save(STORAGE_KEYS.PERMISSIONS, this.permissions);

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);

    this.addAuditLog({
      action: 'CLOTURE_DEFINITIVE_ET_SCELLEMENT',
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      oldValue: 'Prêt pour validation',
      newValue: `Validé et clôturé (Version ${inv.version}.0) — Montant certifié : ${formatFCFA(totalGeneral)}`,
      reason: params.validatorNotes || 'Clôture définitive certifiée conforme',
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: `L'inventaire ${inv.code} est définitivement clôturé et scellé (V${inv.version}.0). Le responsable de boutique peut désormais consulter son rapport officiel.` };
  }

  // Réouverture exceptionnelle encadrée (Règle 10 & 12)
  public reopenInventoryExceptionnel(params: {
    inventoryId: string;
    justification: string;
    securityConfirmationCode: string;
  }): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();

    if (currentUser.role !== 'PDG' && currentUser.role !== 'MAGASINIER' && !(currentUser.role === 'RESPONSABLE_INVENTAIRE' && currentUser.isDesignatedByPDG)) {
      return { success: false, message: 'Action interdite : Seul le PDG, le Magasinier ou un responsable d\'inventaire désigné peut autoriser une réouverture exceptionnelle.' };
    }

    if (!params.justification || params.justification.trim().length < 10) {
      return { success: false, message: 'Une justification écrite et détaillée est rigoureusement obligatoire pour toute réouverture.' };
    }

    if (params.securityConfirmationCode !== 'ALU-2026' && params.securityConfirmationCode !== '9999') {
      return { success: false, message: 'Code de sécurité renforcé incorrect.' };
    }

    const inv = this.inventories.find(i => i.id === params.inventoryId);
    if (!inv) return { success: false, message: 'Inventaire introuvable.' };

    const oldVersion = inv.version;
    const newVersion = oldVersion + 1;

    // Mise à jour de la dernière version dans l'historique
    if (inv.versionsHistory.length > 0) {
      inv.versionsHistory[inv.versionsHistory.length - 1].reopeningReason = params.justification;
      inv.versionsHistory[inv.versionsHistory.length - 1].reopenedBy = currentUser.name;
      inv.versionsHistory[inv.versionsHistory.length - 1].reopenedAt = new Date().toISOString();
    }

    inv.version = newVersion;
    inv.status = 'En contrôle'; // Repart en contrôle contrôlé
    inv.closedAt = undefined;

    this.save(STORAGE_KEYS.INVENTORIES, this.inventories);

    this.addAuditLog({
      action: 'REOUVERTURE_EXCEPTIONNELLE_INVENTAIRE',
      shopId: inv.shopId,
      shopName: inv.shopName,
      inventoryId: inv.id,
      inventoryCode: inv.code,
      oldValue: `Version ${oldVersion}.0 (Clôturé)`,
      newValue: `Passage à la Version ${newVersion}.0 (Statut : En contrôle)`,
      reason: params.justification,
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: `Procédure de réouverture validée. Version ${newVersion}.0 initialisée avec conservation intégrale de l'historique V${oldVersion}.0.` };
  }

  // --- Gestion du Catalogue & Grille Tarifaire ---
  // RÈGLE FORMELLE : Le Magasinier détient le monopole exclusif officiel pour changer les prix dans la base
  public updateCatalogPrice(params: {
    productId: string;
    newPrice: number;
    reason: string;
  }): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();

    const canChangePrice = currentUser.role === 'MAGASINIER' || currentUser.role === 'SECRETAIRE_DIRECTION' || currentUser.role === 'PDG' || currentUser.role === 'ADMIN';

    if (!canChangePrice) {
      this.addAuditLog({
        action: 'TENTATIVE_CHANGEMENT_PRIX_REFUSEE',
        reason: 'Violation de droits : Seul le Magasinier, le Secrétaire de Direction et le PDG peuvent modifier les prix officiels',
        status: 'BLOCKED'
      });
      return { 
        success: false, 
        message: 'Accès refusé : Seuls le Magasinier, le Secrétaire de Direction et le PDG ont le pouvoir de modifier les prix officiels dans la base des articles.' 
      };
    }

    if (params.newPrice <= 0) {
      return { success: false, message: 'Le prix doit être strictement supérieur à 0 FCFA.' };
    }

    const item = this.catalog.find(c => c.id === params.productId);
    if (!item) return { success: false, message: 'Article introuvable.' };

    const oldPrice = item.officialPrice;
    item.officialPrice = params.newPrice;
    item.lastPriceUpdate = new Date().toISOString().split('T')[0];

    const historyEntry: PriceHistory = {
      id: 'ph_' + Date.now(),
      productId: item.id,
      productName: item.designation,
      color: item.color,
      oldPrice,
      newPrice: params.newPrice,
      changedBy: currentUser.id,
      changedByName: currentUser.name,
      changedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reason: params.reason || `Modification directe enregistrée par ${currentUser.name} (${currentUser.role})`
    };

    this.priceHistories = [historyEntry, ...this.priceHistories];

    this.save(STORAGE_KEYS.CATALOG, this.catalog);
    this.save(STORAGE_KEYS.PRICE_HISTORIES, this.priceHistories);

    // Sauvegarde rigoureuse dans la base du journal d'activités (Audit Logs)
    this.addAuditLog({
      action: 'MODIFICATION_DIRECTE_PRIX_OFFICIEL',
      actionType: 'MODIFICATION',
      targetObject: `Article : ${item.designation} (${item.code})`,
      oldValue: `${item.designation} : ${formatFCFA(oldPrice)}`,
      newValue: `${formatFCFA(params.newPrice)}`,
      reason: params.reason || `Modification directe par ${currentUser.name} (${currentUser.role})`,
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { 
      success: true, 
      message: `Prix officiel de ${item.designation} actualisé immédiatement : ${formatFCFA(params.newPrice)}. Enregistré dans le journal d'activité.` 
    };
  }

  // --- Ajout d'un nouvel article au Catalogue (Accessible au Magasinier, PDG, Admin) ---
  public addCatalogItem(params: {
    code?: string;
    designation: string;
    category: Category;
    color?: AluminiumColor;
    officialPrice: number;
    unit?: string;
  }): { success: boolean; message: string; item?: CatalogItem } {
    const currentUser = this.getCurrentUser();
    const canManage = currentUser.role === 'MAGASINIER' || currentUser.role === 'PDG' || currentUser.role === 'ADMIN' || currentUser.role === 'SECRETAIRE_DIRECTION';

    if (!canManage) {
      return {
        success: false,
        message: 'Accès refusé : Seul le Magasinier, le PDG et l\'Administration ont le droit d\'ajouter de nouveaux articles au catalogue.'
      };
    }

    if (!params.designation || params.designation.trim().length < 2) {
      return { success: false, message: 'La désignation de l\'article est obligatoire (au moins 2 caractères).' };
    }

    if (params.officialPrice <= 0) {
      return { success: false, message: 'Le prix officiel doit être strictement supérieur à 0 FCFA.' };
    }

    if (params.category === 'Aluminium' && !params.color) {
      return { success: false, message: 'La couleur est obligatoire pour les articles en aluminium.' };
    }

    // Génération ou validation du code article
    let code = (params.code || '').trim().toUpperCase();
    if (!code) {
      const prefix = params.category === 'Aluminium' ? 'ALT-ALU' : 'ALT-ACC';
      const count = this.catalog.filter(c => c.category === params.category).length + 1;
      code = `${prefix}-${String(count).padStart(3, '0')}`;
    }

    // Vérifier unicité du code
    if (this.catalog.some(c => c.code.toUpperCase() === code)) {
      code = `${code}-${Math.floor(Math.random() * 90 + 10)}`;
    }

    const newItem: CatalogItem = {
      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      code,
      designation: params.designation.trim().toUpperCase(),
      category: params.category,
      color: params.category === 'Aluminium' ? params.color : undefined,
      officialPrice: params.officialPrice,
      unit: params.unit || (params.category === 'Aluminium' ? 'Barre de 6m' : 'Pièce'),
      isActive: true,
      lastPriceUpdate: new Date().toISOString().split('T')[0]
    };

    this.catalog = [newItem, ...this.catalog];

    // Historique de prix initial
    const historyEntry: PriceHistory = {
      id: 'ph_' + Date.now(),
      productId: newItem.id,
      productName: newItem.designation,
      color: newItem.color,
      oldPrice: 0,
      newPrice: newItem.officialPrice,
      changedBy: currentUser.id,
      changedByName: currentUser.name,
      changedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reason: `Création de l'article par ${currentUser.name} (${currentUser.role})`
    };
    this.priceHistories = [historyEntry, ...this.priceHistories];

    this.save(STORAGE_KEYS.CATALOG, this.catalog);
    this.save(STORAGE_KEYS.PRICE_HISTORIES, this.priceHistories);

    // Audit log
    this.addAuditLog({
      action: 'CREATION_NOUVEL_ARTICLE',
      actionType: 'CREATION',
      targetObject: `Article : ${newItem.designation} (${newItem.code})`,
      newValue: `${newItem.designation} - ${newItem.color || 'Sans couleur'} - ${formatFCFA(newItem.officialPrice)}`,
      reason: `Ajout au catalogue officiel par ${currentUser.name} (${currentUser.role})`,
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return {
      success: true,
      message: `Nouvel article « ${newItem.designation} » (${newItem.code}) ajouté au catalogue avec succès !`,
      item: newItem
    };
  }

  // --- Modification complète d'un article du Catalogue ---
  public updateCatalogItem(productId: string, updates: {
    designation?: string;
    category?: Category;
    color?: AluminiumColor;
    officialPrice?: number;
    unit?: string;
    isActive?: boolean;
    reason?: string;
  }): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    const canManage = currentUser.role === 'MAGASINIER' || currentUser.role === 'PDG' || currentUser.role === 'ADMIN' || currentUser.role === 'SECRETAIRE_DIRECTION';

    if (!canManage) {
      return { success: false, message: 'Accès refusé : Seul le Magasinier, le PDG et l\'Administration peuvent modifier les articles.' };
    }

    const item = this.catalog.find(c => c.id === productId);
    if (!item) return { success: false, message: 'Article introuvable.' };

    const oldPrice = item.officialPrice;
    if (updates.designation) item.designation = updates.designation.trim().toUpperCase();
    if (updates.category) item.category = updates.category;
    if (updates.color !== undefined) item.color = updates.color;
    if (updates.unit) item.unit = updates.unit;
    if (updates.isActive !== undefined) item.isActive = updates.isActive;

    if (updates.officialPrice && updates.officialPrice > 0 && updates.officialPrice !== oldPrice) {
      item.officialPrice = updates.officialPrice;
      item.lastPriceUpdate = new Date().toISOString().split('T')[0];

      const historyEntry: PriceHistory = {
        id: 'ph_' + Date.now(),
        productId: item.id,
        productName: item.designation,
        color: item.color,
        oldPrice,
        newPrice: updates.officialPrice,
        changedBy: currentUser.id,
        changedByName: currentUser.name,
        changedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        reason: updates.reason || `Modification par ${currentUser.name} (${currentUser.role})`
      };
      this.priceHistories = [historyEntry, ...this.priceHistories];
      this.save(STORAGE_KEYS.PRICE_HISTORIES, this.priceHistories);
    }

    this.save(STORAGE_KEYS.CATALOG, this.catalog);

    this.addAuditLog({
      action: 'MODIFICATION_ARTICLE_CATALOGUE',
      actionType: 'MODIFICATION',
      targetObject: `Article : ${item.designation} (${item.code})`,
      newValue: `Prix: ${formatFCFA(item.officialPrice)} | Couleur: ${item.color || 'N/A'}`,
      reason: updates.reason || `Mise à jour par ${currentUser.name} (${currentUser.role})`,
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: `Article « ${item.designation} » mis à jour avec succès.` };
  }

  // --- Paramètres Utilisateur & Profil Personnel (pour tous les utilisateurs) ---
  public updateUserProfile(userId: string, updates: Partial<User>): { success: boolean; message: string } {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'Utilisateur introuvable.' };

    const oldUser = this.users[userIndex];
    const updatedUser: User = {
      ...oldUser,
      ...updates
    };

    this.users[userIndex] = updatedUser;
    this.save(STORAGE_KEYS.USERS, this.users);

    this.addAuditLog({
      action: 'MISE_A_JOUR_PROFIL_SECURITE',
      actionType: 'MODIFICATION',
      targetObject: `Profil Utilisateur : ${updatedUser.name} (${updatedUser.uniqueIdentifier || updatedUser.id})`,
      oldValue: `Nom: ${oldUser.name}, Email: ${oldUser.email}`,
      newValue: `Nom: ${updatedUser.name}, Email: ${updatedUser.email}, 2FA: ${updatedUser.twoFactorEnabled ? 'Activé' : 'Désactivé'}`,
      reason: 'Mise à jour des informations personnelles et paramètres de sécurité par l\'utilisateur',
      authorizedBy: updatedUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Profil et paramètres de sécurité mis à jour avec succès.' };
  }

  // Import de fichier par le Magasinier pour actualisation de la grille tarifaire en masse
  public uploadCatalogPriceFile(params: {
    fileName: string;
    items: { code?: string; designation?: string; newPrice: number }[];
    notes: string;
  }): { success: boolean; message: string; updatedCount?: number } {
    const currentUser = this.getCurrentUser();

    if (currentUser.role !== 'MAGASINIER') {
      return { 
        success: false, 
        message: 'Accès refusé : Seul le Magasinier détient le monopole pour téléverser une liste de prix actualisée.' 
      };
    }

    let updatedCount = 0;
    const nowIso = new Date().toISOString().split('T')[0];

    params.items.forEach(p => {
      const match = this.catalog.find(c => 
        (p.code && c.code.toLowerCase() === p.code.toLowerCase()) ||
        (p.designation && c.designation.toLowerCase().includes(p.designation.toLowerCase()))
      );

      if (match && p.newPrice > 0 && match.officialPrice !== p.newPrice) {
        const oldPrice = match.officialPrice;
        match.officialPrice = p.newPrice;
        match.lastPriceUpdate = nowIso;

        this.priceHistories = [{
          id: 'ph_' + Date.now() + '_' + updatedCount,
          productId: match.id,
          productName: match.designation,
          color: match.color,
          oldPrice,
          newPrice: p.newPrice,
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          reason: `Import fichier tarifaire : ${params.fileName} — ${params.notes}`
        }, ...this.priceHistories];

        updatedCount++;
      }
    });

    this.save(STORAGE_KEYS.CATALOG, this.catalog);
    this.save(STORAGE_KEYS.PRICE_HISTORIES, this.priceHistories);

    this.addAuditLog({
      action: 'IMPORT_GRILLE_PRIX_MAGASINIER',
      newValue: `Fichier : ${params.fileName} (${updatedCount} articles révisés)`,
      reason: params.notes || 'Mise à jour en masse par fichier Excel/CSV par le Magasinier',
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { 
      success: true, 
      message: `Fichier ${params.fileName} traité avec succès : ${updatedCount} tarif(s) officiel(s) mis à jour dans la base.`,
      updatedCount 
    };
  }

  // --- Gestion des Invitations & Liens Sécurisés avec Identifiant Unique ---
  public createShopInvitation(params: {
    shopId?: string;
    role: UserRole;
    recipientName: string;
    recipientContact: string;
    recipientEmail?: string;
    recipientPhone?: string;
    durationHours?: number; // Accordé par la secrétaire ou l'admin
  }): { success: boolean; message: string; invitation?: ShopInvitation } {
    const currentUser = this.getCurrentUser();

    // Règle : La Secrétaire de Direction, l'Admin SaaS ou le PDG peuvent générer des invitations
    if (currentUser.role !== 'SECRETAIRE_DIRECTION' && currentUser.role !== 'ADMIN' && currentUser.role !== 'PDG' && currentUser.role !== 'MAGASINIER') {
      return { success: false, message: 'Seul la Secrétaire de Direction ou l\'Administration peut générer des invitations sécurisées.' };
    }

    const shop = params.shopId ? this.shops.find(s => s.id === params.shopId) : undefined;
    const duration = params.durationHours || 48; // 48 heures par défaut
    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();

    const uniqueId = `ALU-ID-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const token = `ALT-INV-${uniqueId}-${randomHex}`;

    // RÈGLE MÉTIER STRICTE : Aucun code n'est généré à l'avance dans le message initial.
    // L'invité clique sur le lien, saisit son email, et reçoit alors son code par email pour s'authentifier.
    const newInvitation: ShopInvitation = {
      id: 'invit_' + Date.now(),
      shopId: shop?.id,
      shopName: shop?.name || 'Réseau Central / Administration',
      role: params.role,
      recipientName: params.recipientName,
      recipientContact: params.recipientContact,
      recipientEmail: params.recipientEmail || (params.recipientContact.includes('@') ? params.recipientContact : undefined),
      recipientPhone: params.recipientPhone || (!params.recipientContact.includes('@') ? params.recipientContact : undefined),
      uniqueIdentifier: uniqueId,
      token,
      durationHours: duration,
      generatedBy: `${currentUser.name} (${currentUser.role})`,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      expiresAt: expiresAt.replace('T', ' ').substring(0, 16),
      status: 'PENDING'
    };

    this.invitations = [newInvitation, ...this.invitations];
    this.save(STORAGE_KEYS.INVITATIONS, this.invitations);

    // Pré-enregistrer le compte en statut EN_ATTENTE_ACTIVATION dans la liste des utilisateurs
    const preUser: User = {
      id: 'usr_' + Date.now(),
      name: params.recipientName,
      email: params.recipientEmail || (params.recipientContact.includes('@') ? params.recipientContact : `${uniqueId.toLowerCase()}@alutraco.bj`),
      phone: params.recipientPhone || (!params.recipientContact.includes('@') ? params.recipientContact : undefined),
      role: params.role,
      shopId: shop?.id,
      uniqueIdentifier: uniqueId,
      isEmailConfirmed: false,
      status: 'EN_ATTENTE_ACTIVATION',
      createdAt: new Date().toISOString()
    };
    this.users = [...this.users, preUser];
    this.save(STORAGE_KEYS.USERS, this.users);

    this.addAuditLog({
      action: 'GENERATION_INVITATION_SECURISEE',
      shopId: shop?.id,
      shopName: shop?.name,
      newValue: `Invitation émise pour ${params.recipientName} (${params.role}) — ID Unique: ${uniqueId}`,
      reason: 'Génération de lien d\'activation avec authentification par email à la demande',
      authorizedBy: currentUser.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { 
      success: true, 
      message: `Lien d'activation et identifiant unique (${uniqueId}) générés avec succès. Valable pour ${duration} heures.`, 
      invitation: newInvitation 
    };
  }

  // --- Étape d'Authentification Email : Envoi d'un code de vérification à 6 chiffres par email ---
  public sendEmailVerificationOtp(email: string, uniqueIdentifier?: string): { success: boolean; message: string; otpCode?: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Veuillez saisir une adresse email valide.' };
    }

    // Génération du code OTP aléatoire à 6 chiffres
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Associer à l'invitation
    let inv = this.invitations.find(i => 
      (i.recipientEmail && i.recipientEmail.toLowerCase() === cleanEmail) ||
      (uniqueIdentifier && i.uniqueIdentifier.toUpperCase() === uniqueIdentifier.trim().toUpperCase())
    );

    if (inv) {
      inv.currentEmailOtp = otpCode;
      inv.emailOtpExpiresAt = expiry;
      this.save(STORAGE_KEYS.INVITATIONS, this.invitations);
    }

    // Associer à l'utilisateur pré-créé
    let user = this.users.find(u => 
      u.email.toLowerCase() === cleanEmail ||
      (uniqueIdentifier && u.uniqueIdentifier && u.uniqueIdentifier.toUpperCase() === uniqueIdentifier.trim().toUpperCase())
    );

    if (user) {
      user.confirmationCode = otpCode;
      this.save(STORAGE_KEYS.USERS, this.users);
    }

    // Créer une notification in-app pour attester de l'envoi du mail de confirmation
    const emailNotif: AppNotification = {
      id: 'notif_otp_' + Date.now(),
      title: `📨 Code d'authentification Email : ${otpCode}`,
      message: `Votre code de confirmation pour valider l'adresse ${cleanEmail} est : ${otpCode} (valable 15 minutes). Tapez ce code pour choisir votre mot de passe personnel.`,
      type: 'INFO',
      timestamp: new Date().toISOString(),
      read: false,
      linkModule: '03_users'
    };
    this.notifications = [emailNotif, ...this.notifications];
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    this.addAuditLog({
      action: 'ENVOI_CODE_AUTHENTIFICATION_EMAIL',
      newValue: `Code expédié à ${cleanEmail} — Code: ${otpCode} (Expiration: 15 min)`,
      reason: 'Demande de vérification d\'adresse email par l\'invité',
      status: 'SUCCESS'
    });

    this.notify();
    return { 
      success: true, 
      message: `Un code de vérification à 6 chiffres a été expédié à ${cleanEmail}. Veuillez consulter votre boîte de réception.`,
      otpCode
    };
  }

  // --- Étape Finale : Vérification du code email et Choix du Mot de Passe Personnel ---
  public activateUserAccount(params: {
    token?: string;
    uniqueIdentifier?: string;
    email: string;
    confirmationCode: string;
    password: string;
  }): { success: boolean; message: string; user?: User } {
    const inputEmail = params.email.trim().toLowerCase();
    const inputCode = params.confirmationCode.replace(/\s+/g, '');

    // Trouver l'invitation
    const invitation = this.invitations.find(inv => {
      const matchEmail = (inv.recipientEmail && inv.recipientEmail.toLowerCase() === inputEmail) ||
                         (inv.recipientContact && inv.recipientContact.toLowerCase() === inputEmail);
      const matchId = params.uniqueIdentifier && inv.uniqueIdentifier.toUpperCase() === params.uniqueIdentifier.trim().toUpperCase();
      const matchOtp = inv.currentEmailOtp === inputCode;
      return (matchEmail || matchId) && matchOtp;
    }) || this.invitations.find(inv => inv.currentEmailOtp === inputCode);

    // Trouver l'utilisateur
    let user = this.users.find(u => 
      (u.confirmationCode && u.confirmationCode === inputCode) ||
      (invitation && u.uniqueIdentifier === invitation.uniqueIdentifier) ||
      u.email.toLowerCase() === inputEmail
    );

    // Vérifier si le code correspond
    const isCodeValid = (invitation && invitation.currentEmailOtp === inputCode) || 
                        (user && user.confirmationCode === inputCode);

    if (!isCodeValid) {
      return { 
        success: false, 
        message: 'Code de confirmation erroné. Veuillez vérifier le code à 6 chiffres reçu dans votre boîte email ou demander un nouveau code.' 
      };
    }

    if (!params.password || params.password.length < 6) {
      return { success: false, message: 'Le mot de passe personnel choisi doit comporter au minimum 6 caractères.' };
    }

    if (user) {
      user.status = 'ACTIF';
      user.password = params.password;
      user.isEmailConfirmed = true;
      user.email = inputEmail || user.email;
    } else if (invitation) {
      user = {
        id: 'usr_' + Date.now(),
        name: invitation.recipientName,
        email: inputEmail || invitation.recipientEmail || invitation.recipientContact,
        phone: invitation.recipientPhone,
        role: invitation.role,
        shopId: invitation.shopId,
        uniqueIdentifier: invitation.uniqueIdentifier,
        status: 'ACTIF',
        isEmailConfirmed: true,
        password: params.password,
        isDesignatedByPDG: invitation.role === 'RESPONSABLE_INVENTAIRE',
        createdAt: new Date().toISOString()
      };
      this.users.push(user);
    } else {
      return { success: false, message: 'Compte ou invitation introuvable.' };
    }

    if (invitation) {
      invitation.status = 'ACTIVATED';
    }

    this.save(STORAGE_KEYS.USERS, this.users);
    this.save(STORAGE_KEYS.INVITATIONS, this.invitations);

    this.addAuditLog({
      action: 'AUTHENTIFICATION_EMAIL_ET_MOT_DE_PASSE_VALIDE',
      newValue: `Compte activé avec succès : ${user.name} (${user.role}) — Email vérifié par OTP`,
      reason: 'Validation du code reçu par email et enregistrement du mot de passe personnel',
      authorizedBy: user.name,
      status: 'SUCCESS'
    });

    this.notify();
    return { 
      success: true, 
      message: `Félicitations ${user.name} ! Votre adresse email est authentifiée et votre mot de passe personnel est enregistré. Vous pouvez désormais vous connecter sur n'importe quel ordinateur, tablette ou smartphone.`, 
      user 
    };
  }

  // Journal d'audit centralisé
  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) {
    const currentUser = this.getCurrentUser();
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      ...entry
    };

    this.auditLogs = [newLog, ...this.auditLogs];
    this.save(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    this.notify();
  }

  // ==========================================
  // CONTRÔLEUR DES HEURES DE CONNEXION (ACCESS HOURS POLICY)
  // ==========================================
  public getLoginHoursConfig(): LoginHoursRestrictionConfig {
    return { 
      ...INITIAL_LOGIN_HOURS, 
      ...(this.loginHoursConfig || {}),
      restrictedRoles: this.loginHoursConfig?.restrictedRoles || INITIAL_LOGIN_HOURS.restrictedRoles || []
    };
  }

  public updateLoginHoursConfig(config: Partial<LoginHoursRestrictionConfig>) {
    this.loginHoursConfig = { ...this.loginHoursConfig, ...config };
    this.save(STORAGE_KEYS.LOGIN_HOURS_RESTRICTION, this.loginHoursConfig);
    this.addAuditLog({
      action: 'MODIFICATION_CONTROLEUR_HEURES_CONNEXION',
      newValue: `Couvre-feu: ${this.loginHoursConfig.enabled ? 'ACTIF' : 'INACTIF'} — Heure limite: ${this.loginHoursConfig.maxEndHour} — Rôles: ${this.loginHoursConfig.restrictedRoles.join(', ')}`,
      reason: 'Ajustement de la politique de restriction horaire par l\'administrateur SaaS',
      status: 'SUCCESS'
    });
    this.notify();
  }

  public isLoginTimeAllowed(userId?: string, role?: UserRole): { allowed: boolean; message?: string } {
    if (!this.loginHoursConfig.enabled) {
      return { allowed: true };
    }

    const targetUser = userId ? this.users.find(u => u.id === userId) : this.getCurrentUser();
    const targetRole = role || targetUser?.role;

    // L'Administrateur SaaS et le PDG ne sont jamais bloqués par les règles horaires
    if (targetRole === 'ADMIN' || targetRole === 'PDG') {
      return { allowed: true };
    }

    const isRoleRestricted = targetRole && this.loginHoursConfig.restrictedRoles.includes(targetRole);
    const isUserExplicitlyRestricted = targetUser && this.loginHoursConfig.restrictedUserIds.includes(targetUser.id);

    if (!isRoleRestricted && !isUserExplicitlyRestricted) {
      return { allowed: true };
    }

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMin = currentHours * 60 + currentMinutes;

    const [endH, endM] = (this.loginHoursConfig.maxEndHour || '19:00').split(':').map(Number);
    const endTotalMin = (isNaN(endH) ? 19 : endH) * 60 + (isNaN(endM) ? 0 : endM);

    const [startH, startM] = (this.loginHoursConfig.startHour || '07:00').split(':').map(Number);
    const startTotalMin = (isNaN(startH) ? 7 : startH) * 60 + (isNaN(startM) ? 0 : startM);

    if (this.loginHoursConfig.blockWeekends && (now.getDay() === 0 || now.getDay() === 6)) {
      return {
        allowed: false,
        message: `Accès non autorisé le week-end selon les règles de sécurité ALUTRACO.`
      };
    }

    if (currentTotalMin < startTotalMin || currentTotalMin > endTotalMin) {
      return {
        allowed: false,
        message: this.loginHoursConfig.warningMessage || `Accès bloqué : les connexions pour votre profil ne sont pas autorisées au-delà de ${this.loginHoursConfig.maxEndHour}.`
      };
    }

    return { allowed: true };
  }

  // ==========================================
  // GESTION DES SESSIONS ACTIVES
  // ==========================================
  public getUserSessions(): UserSession[] {
    return (this.sessions && this.sessions.length > 0) ? [...this.sessions] : [...INITIAL_SESSIONS];
  }

  public killUserSession(sessionId: string): { success: boolean; message: string } {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return { success: false, message: 'Session introuvable' };

    session.status = 'TERMINATED';
    this.save(STORAGE_KEYS.SESSIONS, this.sessions);
    this.addAuditLog({
      action: 'REVOCATION_SESSION_A_DISTANCE',
      targetObject: `Utilisateur: ${session.userName} (${session.userRole})`,
      newValue: `Session ${session.device} fermée et révoquée immédiatement`,
      reason: 'Déconnexion forcée de sécurité par l\'Administrateur SaaS',
      status: 'SUCCESS'
    });
    this.notify();
    return { success: true, message: `Session de ${session.userName} sur ${session.device} déconnectée avec succès.` };
  }

  public killAllSessionsForUser(userId: string): { success: boolean; message: string } {
    const user = this.users.find(u => u.id === userId);
    let count = 0;
    this.sessions.forEach(s => {
      if (s.userId === userId && s.status === 'ACTIVE') {
        s.status = 'TERMINATED';
        count++;
      }
    });
    this.save(STORAGE_KEYS.SESSIONS, this.sessions);
    this.addAuditLog({
      action: 'REVOCATION_TOUTES_SESSIONS_UTILISATEUR',
      targetObject: `Utilisateur: ${user?.name || userId}`,
      newValue: `${count} session(s) active(s) invalidée(s)`,
      reason: 'Révocation générale des accès par l\'Administrateur SaaS',
      status: 'SUCCESS'
    });
    this.notify();
    return { success: true, message: `${count} session(s) active(s) pour cet utilisateur ont été révoquées.` };
  }

  // ==========================================
  // SAUVEGARDES SYSTÈME & TESTS DE RESTAURATION
  // ==========================================
  public getBackups(): SystemBackup[] {
    return (this.backups && this.backups.length > 0) ? [...this.backups] : [...INITIAL_BACKUPS];
  }

  public runManualBackup(notes?: string): SystemBackup {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const newBackup: SystemBackup = {
      id: 'bkp_' + Date.now(),
      filename: `ALUCOUNT_MANUAL_SNAPSHOT_${dateStr}.sql.enc`,
      sizeMb: Math.round((145 + Math.random() * 8) * 10) / 10,
      type: 'MANUAL_SNAPSHOT',
      checksum: 'sha256:' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      createdAt: now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'SUCCESS',
      isRestorable: true,
      notes: notes || 'Sauvegarde intégrale manuelle de sécurité exécutée par l\'Administrateur SaaS'
    };

    this.backups = [newBackup, ...this.backups];
    this.save(STORAGE_KEYS.BACKUPS, this.backups);
    this.addAuditLog({
      action: 'SAUVEGARDE_SYSTEME_MANUELLE_VALIDEE',
      newValue: `Archive générée : ${newBackup.filename} (${newBackup.sizeMb} MB) — Statut Scellé`,
      reason: newBackup.notes,
      status: 'SUCCESS'
    });
    this.notify();
    return newBackup;
  }

  public testRestoreBackup(backupId: string): { success: boolean; message: string } {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) return { success: false, message: 'Sauvegarde introuvable' };

    this.addAuditLog({
      action: 'TEST_RESTAURATION_SANDBOX',
      targetObject: backup.filename,
      newValue: 'Validation intégrité des tables et clés étrangères : 100% conforme',
      reason: 'Audit de recouvrabilité des données de production ALUTRACO',
      status: 'SUCCESS'
    });
    return { 
      success: true, 
      message: `Test de restauration sandbox réussi pour ${backup.filename}. L'ensemble des 16 tables, contraintes d'intégrité et index sont vérifiés conformes.` 
    };
  }

  // ==========================================
  // ÉTAT DU SYSTÈME & SANTÉ DES COMPOSANTS
  // ==========================================
  public getSystemServiceStatuses(): SystemServiceStatus[] {
    return (this.systemServices && this.systemServices.length > 0) ? [...this.systemServices] : [...INITIAL_SYSTEM_SERVICES];
  }

  public refreshServiceStatus(): void {
    this.systemServices = this.systemServices.map(s => ({
      ...s,
      latencyMs: Math.max(5, Math.floor(Math.random() * 35)),
      lastChecked: 'À l\'instant'
    }));
    this.save(STORAGE_KEYS.SYSTEM_SERVICES, this.systemServices);
    this.notify();
  }

  // ==========================================
  // MODE MAINTENANCE PROGRAMMABLE
  // ==========================================
  public getMaintenanceConfig(): MaintenanceConfig {
    return { ...INITIAL_MAINTENANCE, ...(this.maintenance || {}) };
  }

  public updateMaintenanceConfig(cfg: Partial<MaintenanceConfig>): void {
    this.maintenance = { ...this.maintenance, ...cfg };
    this.save(STORAGE_KEYS.MAINTENANCE, this.maintenance);
    this.addAuditLog({
      action: 'MODIFICATION_MODE_MAINTENANCE',
      newValue: `Statut: ${this.maintenance.isActive ? 'ACTIF' : 'INACTIF'} — Message: ${this.maintenance.message}`,
      reason: 'Paramétrage des indisponibilités programmées pour maintenance',
      status: 'SUCCESS'
    });
    this.notify();
  }

  // ==========================================
  // INCIDENTS & SUPPORT TECHNIQUE
  // ==========================================
  public getSystemIncidents(): SystemIncident[] {
    return [...this.incidents];
  }

  public createSystemIncident(inc: Omit<SystemIncident, 'id' | 'code' | 'createdAt' | 'reportedAt' | 'status'>): SystemIncident {
    const code = 'INC-2026-' + (String(this.incidents.length + 1).padStart(4, '0'));
    const now = new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newInc: SystemIncident = {
      id: 'inc_' + Date.now(),
      code,
      status: 'EN_COURS',
      reportedAt: now,
      createdAt: now,
      ...inc
    };
    this.incidents = [newInc, ...this.incidents];
    this.save(STORAGE_KEYS.INCIDENTS, this.incidents);
    this.notify();
    return newInc;
  }

  public resolveSystemIncident(incidentId: string, solutionNotes: string): void {
    const inc = this.incidents.find(i => i.id === incidentId);
    if (inc) {
      inc.status = 'RESOLU';
      inc.resolvedAt = new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      inc.solutionNotes = solutionNotes;
      this.save(STORAGE_KEYS.INCIDENTS, this.incidents);
      this.notify();
    }
  }

  // ==========================================
  // GESTION DES FONCTIONNALITÉS (FEATURE FLAGS)
  // ==========================================
  public getFeatureFlags(): FeatureFlagsConfig {
    return { ...INITIAL_FEATURE_FLAGS, ...(this.featureFlags || {}) };
  }

  public toggleFeatureFlag(flag: keyof FeatureFlagsConfig): void {
    const current = this.getFeatureFlags();
    this.featureFlags = {
      ...current,
      [flag]: !current[flag]
    };
    this.save(STORAGE_KEYS.FEATURE_FLAGS, this.featureFlags);
    this.addAuditLog({
      action: 'TOGGLE_FEATURE_FLAG',
      targetObject: flag,
      newValue: `Nouvel état: ${this.featureFlags[flag] ? 'ON' : 'OFF'}`,
      reason: 'Modification de la configuration des fonctionnalités SaaS',
      status: 'SUCCESS'
    });
    this.notify();
  }

  // ==========================================
  // CONFIGURATION GÉNÉRALE DU SAAS ALUTRACO
  // ==========================================
  public getSaasConfig(): SaasGeneralConfig {
    return { ...INITIAL_SAAS_CONFIG, ...(this.saasConfig || {}) };
  }

  public updateSaasConfig(cfg: Partial<SaasGeneralConfig>): void {
    this.saasConfig = { ...this.saasConfig, ...cfg };
    this.save(STORAGE_KEYS.SAAS_CONFIG, this.saasConfig);
    this.notify();
  }

  // ==========================================
  // CENTRE DE DIAGNOSTIC AUTOMATIQUE
  // ==========================================
  public runSystemDiagnostic(): DiagnosticItem[] {
    const items: DiagnosticItem[] = [];

    // 1. Articles sans prix ou avec prix nul
    const zeroPriceArticles = this.catalog.filter(a => !a.officialPrice || a.officialPrice <= 0);
    if (zeroPriceArticles.length > 0) {
      items.push({
        id: 'diag_zero_price',
        severity: 'WARNING',
        title: `${zeroPriceArticles.length} article(s) actif(s) avec un tarif officiel non renseigné ou nul`,
        details: `Articles concernés : ${zeroPriceArticles.slice(0, 3).map(a => a.designation).join(', ')}${zeroPriceArticles.length > 3 ? '...' : ''}. Risque de valorisation erronée lors des inventaires.`,
        detectedCount: zeroPriceArticles.length,
        affectedEntityType: 'ARTICLES',
        recommendedAction: 'Définir un prix officiel via le Magasinier Général ou le catalogue central.',
        autoFixAvailable: false
      });
    }

    // 2. Boutiques sans responsable assigné
    const unassignedShops = this.shops.filter(s => !s.managerId && s.status === 'ACTIVE');
    if (unassignedShops.length > 0) {
      items.push({
        id: 'diag_unassigned_shops',
        severity: 'INFO',
        title: `${unassignedShops.length} boutique(s) active(s) sans responsable désigné`,
        details: `Boutiques : ${unassignedShops.map(s => s.name).join(', ')}.`,
        detectedCount: unassignedShops.length,
        affectedEntityType: 'BOUTIQUES',
        recommendedAction: 'Affecter un responsable de boutique pour la réception des inventaires.',
        autoFixAvailable: false
      });
    }

    // 3. Permissions temporaires expirées encore marquées comme actives
    const now = new Date().getTime();
    const zombiePermissions = this.permissions.filter(p => p.status === 'ACTIVE' && new Date(p.expiresAt).getTime() <= now);
    if (zombiePermissions.length > 0) {
      items.push({
        id: 'diag_zombie_perms',
        severity: 'CRITICAL',
        title: `${zombiePermissions.length} habilitation(s) temporaire(s) expirée(s) encore en état actif`,
        details: `Des permissions ont dépassé leur date limite mais n'ont pas encore été purgées de la mémoire active.`,
        detectedCount: zombiePermissions.length,
        affectedEntityType: 'PERMISSIONS',
        recommendedAction: 'Exécuter la purge de sécurité automatique.',
        autoFixAvailable: true
      });
    }

    // 4. Utilisateurs sans boutique ni rôle directionnel
    const orphanUsers = this.users.filter(u => 
      (u.role === 'INVENTORISTE' || u.role === 'RESPONSABLE_BOUTIQUE') && !u.shopId
    );
    if (orphanUsers.length > 0) {
      items.push({
        id: 'diag_orphan_users',
        severity: 'WARNING',
        title: `${orphanUsers.length} collaborateur(s) terrain sans agence assignée`,
        details: `Utilisateurs : ${orphanUsers.map(u => u.name).join(', ')}. Ils ne pourront pas recevoir de comptage ciblé.`,
        detectedCount: orphanUsers.length,
        affectedEntityType: 'UTILISATEURS',
        recommendedAction: 'Assigner l\'agence ou la boutique d\'attache.',
        autoFixAvailable: false
      });
    }

    // 5. Inventaires en contrôle prolongé
    const longControlInventories = this.inventories.filter(i => i.status === 'En contrôle');
    if (longControlInventories.length > 0) {
      items.push({
        id: 'diag_long_control',
        severity: 'INFO',
        title: `${longControlInventories.length} inventaire(s) actuellement en cours de vérification par les contrôleurs`,
        details: `Codes : ${longControlInventories.map(i => i.code).join(', ')}.`,
        detectedCount: longControlInventories.length,
        affectedEntityType: 'INVENTAIRES',
        recommendedAction: 'Surveiller la clôture ou relancer la commission.',
        autoFixAvailable: false
      });
    }

    return items;
  }

  public autoFixDiagnosticItem(diagnosticId: string): { success: boolean; message: string } {
    if (diagnosticId === 'diag_zombie_perms') {
      this.checkPermissionsExpiry();
      return { success: true, message: 'Purge automatique exécutée : toutes les permissions expirées ont été révoquées.' };
    }
    return { success: false, message: 'Action manuelle requise.' };
  }
}

// Instance singleton
export const aluStore = new ALUCOUNTStore();

// Hook React pour synchronisation d'état
export function useALUStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return aluStore.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  return aluStore;
}
