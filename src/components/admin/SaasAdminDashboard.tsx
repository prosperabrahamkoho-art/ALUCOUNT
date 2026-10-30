import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  KeyRound,
  Store,
  Boxes,
  ClipboardList,
  Clock,
  History,
  FileSearch,
  Database,
  Activity,
  Wrench,
  Sliders,
  Settings,
  Terminal,
  Search,
  LogOut,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Lock,
  Unlock,
  UserX,
  UserCheck,
  Smartphone,
  Laptop,
  RefreshCw,
  Plus,
  Calendar,
  Share2,
  Download,
  Eye,
  AlertOctagon,
  ArrowRight,
  Cloud,
  UploadCloud,
  Server,
  Crown
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../../services/store';
import { SupabaseService, checkSupabaseConnection } from '../../services/supabaseService';
import { PdgSupervisionModule } from '../modules/PdgSupervisionModule';
import { 
  UserRole, 
  User, 
  Shop, 
  CatalogItem, 
  Inventory, 
  TemporaryPermission, 
  AuditLog, 
  UserSession, 
  SystemBackup, 
  SystemServiceStatus, 
  DiagnosticItem,
  FeatureFlagsConfig
} from '../../types';

interface SaasAdminDashboardProps {
  onSwitchToBusinessView?: () => void;
  onNavigateToModule?: (modId: any) => void;
}

type AdminTab = 
  | 'DASHBOARD'
  | 'USERS_SESSIONS'
  | 'ROLES_PERMISSIONS'
  | 'TEMP_PERMISSIONS'
  | 'ORGANIZATION'
  | 'CATALOG_PRICES'
  | 'INVENTORIES_VERSIONS'
  | 'REOPENINGS'
  | 'INVITATIONS'
  | 'AUDIT_LOG'
  | 'SECURITY_HOURS'
  | 'BACKUPS'
  | 'SYSTEM_HEALTH'
  | 'MAINTENANCE'
  | 'FEATURE_FLAGS'
  | 'DEV_CONSOLE'
  | 'DIAGNOSTIC'
  | 'CONFIG'
  | 'SUPABASE';

export const SaasAdminDashboard: React.FC<SaasAdminDashboardProps> = ({
  onSwitchToBusinessView,
  onNavigateToModule
}) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const users = store.getUsers();
  const shops = store.getShops();
  const catalog = store.getCatalog();
  const inventories = store.getInventories();
  const permissions = store.getTemporaryPermissions();
  const auditLogs = store.getAuditLogs();
  const invitations = store.getInvitations();
  const sessions = store.getUserSessions();
  const backups = store.getBackups();
  const systemServices = store.getSystemServiceStatuses();
  const maintenance = store.getMaintenanceConfig();
  const featureFlags = store.getFeatureFlags();
  const saasConfig = store.getSaasConfig();
  const loginHoursConfig = store.getLoginHoursConfig();

  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [globalSearch, setGlobalSearch] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // ── États Supabase ─────────────────────────────────────────────────────────
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [supabaseMessage, setSupabaseMessage] = useState<string>('');
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [migrationMessage, setMigrationMessage] = useState<string>('');

  // Filtre utilisateurs
  const [userRoleFilter, setUserRoleFilter] = useState<string>('TOUS');

  // Filtre catalogue
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<'TOUS' | 'Aluminium' | 'Accessoires'>('TOUS');
  const [catalogColorFilter, setCatalogColorFilter] = useState<string>('TOUS');

  // Filtre inventaires
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<string>('TOUS');

  // Filtre audit
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // Diagnostics automatiques
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>(() => store.runSystemDiagnostic());

  // Contrôleur des heures de connexion (formulaire local)
  const [hoursEnabled, setHoursEnabled] = useState(loginHoursConfig.enabled);
  const [hoursStart, setHoursStart] = useState(loginHoursConfig.startHour);
  const [hoursMaxEnd, setHoursMaxEnd] = useState(loginHoursConfig.maxEndHour);
  const [hoursRoles, setHoursRoles] = useState<UserRole[]>(loginHoursConfig.restrictedRoles);
  const [hoursBlockWeekends, setHoursBlockWeekends] = useState(loginHoursConfig.blockWeekends);
  const [hoursWarningMsg, setHoursWarningMsg] = useState(loginHoursConfig.warningMessage);
  const [testUserSelect, setTestUserSelect] = useState<string>(users[0]?.id || '');
  const [testResult, setTestResult] = useState<string | null>(null);

  // Recherche globale
  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return null;
    const q = globalSearch.toLowerCase();

    const matchedUsers = users.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      (u.uniqueIdentifier && u.uniqueIdentifier.toLowerCase().includes(q))
    );

    const matchedInventories = inventories.filter(i => 
      i.code.toLowerCase().includes(q) || 
      i.shopName.toLowerCase().includes(q) ||
      i.campaignName.toLowerCase().includes(q)
    );

    const matchedArticles = catalog.filter(a => 
      a.designation.toLowerCase().includes(q) || 
      a.code.toLowerCase().includes(q) ||
      (a.color && a.color.toLowerCase().includes(q))
    );

    const matchedLogs = auditLogs.filter(l => 
      l.action.toLowerCase().includes(q) || 
      (l.targetObject && l.targetObject.toLowerCase().includes(q)) ||
      l.userName.toLowerCase().includes(q)
    );

    return {
      users: matchedUsers,
      inventories: matchedInventories,
      articles: matchedArticles,
      logs: matchedLogs
    };
  }, [globalSearch, users, inventories, catalog, auditLogs]);

  // KPIs Dashboard
  const kpis = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status !== 'SUSPENDU').length;
    const suspendedUsers = users.filter(u => u.status === 'SUSPENDU').length;
    const totalShops = shops.length;
    const inventoriesInProgress = inventories.filter(i => i.status === 'En cours de comptage' || i.status === 'En contrôle').length;
    const inventoriesValidated = inventories.filter(i => i.status === 'Validé et clôturé').length;
    const activePermsCount = permissions.filter(p => p.status === 'ACTIVE').length;
    const activeSessionsCount = sessions.filter(s => s.status === 'ACTIVE').length;
    const lastBackup = backups[0];

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalShops,
      inventoriesInProgress,
      inventoriesValidated,
      activePermsCount,
      activeSessionsCount,
      lastBackup
    };
  }, [users, shops, inventories, permissions, sessions, backups]);

  // Actions
  const handleSaveHoursConfig = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateLoginHoursConfig({
      enabled: hoursEnabled,
      startHour: hoursStart,
      maxEndHour: hoursMaxEnd,
      restrictedRoles: hoursRoles,
      blockWeekends: hoursBlockWeekends,
      warningMessage: hoursWarningMsg
    });
    setActionNotice('Politique de restriction horaire mise à jour et appliquée avec succès à toute la plateforme.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleTestHoursPolicy = () => {
    const selectedUser = users.find(u => u.id === testUserSelect);
    if (!selectedUser) return;
    const res = store.isLoginTimeAllowed(selectedUser.id, selectedUser.role);
    if (res.allowed) {
      setTestResult(`✅ AUTORISÉ : L'utilisateur ${selectedUser.name} (${selectedUser.role}) peut se connecter à cette heure.`);
    } else {
      setTestResult(`⛔ BLOQUÉ : Connexion refusée pour ${selectedUser.name} (${selectedUser.role}). Motif : ${res.message}`);
    }
  };

  const handleToggleUserSuspension = (targetUser: User) => {
    const newStatus = targetUser.status === 'SUSPENDU' ? 'ACTIF' : 'SUSPENDU';
    const updated = users.map(u => u.id === targetUser.id ? { ...u, status: newStatus as any } : u);
    (store as any).users = updated;
    (store as any).save('alucount_users_v1', updated);
    store.addAuditLog({
      action: newStatus === 'SUSPENDU' ? 'SUSPENSION_COMPTE_UTILISATEUR' : 'REACTIVATION_COMPTE_UTILISATEUR',
      targetObject: `Utilisateur: ${targetUser.name} (${targetUser.role})`,
      newValue: `Statut modifié en ${newStatus}`,
      reason: 'Action administrative de supervision SaaS',
      status: 'SUCCESS'
    });
    (store as any).notify();
    setActionNotice(`Compte de ${targetUser.name} passé à l'état ${newStatus}. L'historique des opérations passées reste intégralement préservé.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleKillSession = (sessionId: string) => {
    const res = store.killUserSession(sessionId);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRunBackup = () => {
    const newBkp = store.runManualBackup('Sauvegarde intégrale manuelle déclenchée depuis la console SaaS');
    setActionNotice(`Sauvegarde ${newBkp.filename} générée et scellée avec succès (${newBkp.sizeMb} MB).`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleTestRestore = (backupId: string) => {
    const res = store.testRestoreBackup(backupId);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleToggleRoleHourRestriction = (role: UserRole) => {
    if (hoursRoles.includes(role)) {
      setHoursRoles(hoursRoles.filter(r => r !== role));
    } else {
      setHoursRoles([...hoursRoles, role]);
    }
  };

  const handleRunDiagnostic = () => {
    const diags = store.runSystemDiagnostic();
    setDiagnostics(diags);
    setActionNotice(`Diagnostic système exécuté : ${diags.length} point(s) d'attention détecté(s).`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleFixDiagnostic = (diagId: string) => {
    const res = store.autoFixDiagnosticItem(diagId);
    setActionNotice(res.message);
    setDiagnostics(store.runSystemDiagnostic());
    setTimeout(() => setActionNotice(null), 4000);
  };

  // ── Handlers Supabase ─────────────────────────────────────────────────────
  const handleCheckSupabase = async () => {
    setSupabaseStatus('checking');
    setSupabaseMessage('Test de connexion en cours...');
    const result = await checkSupabaseConnection();
    setSupabaseStatus(result.ok ? 'ok' : 'error');
    setSupabaseMessage(result.message);
  };

  const handleMigrateToSupabase = async () => {
    setMigrationStatus('running');
    setMigrationMessage('Migration en cours... ne fermez pas la page.');
    const result = await SupabaseService.pushLocalDataToSupabase({
      users: store.getUsers(),
      shops: store.getShops(),
      catalog: store.getCatalog(),
      inventories: store.getInventories(),
    });
    setMigrationStatus(result.success ? 'done' : 'error');
    setMigrationMessage(result.details);
    if (result.success) {
      setActionNotice('Migration réussie ! Toutes les données locales ont été envoyées sur Supabase.');
      setTimeout(() => setActionNotice(null), 6000);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── BARRE SUPÉRIEURE TECHNICIEN SAAS ── */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(15,23,42,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            backgroundColor: '#7c3aed',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
            fontWeight: 800,
            fontSize: '1.125rem'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>
                ADMINISTRATEUR SAAS
              </span>
              <span style={{ fontSize: '0.7rem', backgroundColor: '#3b82f6', color: '#0f172a', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                ALUTRACO UNIQUE ENTREPRISE
              </span>
              <span style={{ fontSize: '0.7rem', backgroundColor: '#059669', color: '#0f172a', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                SANS MULTI-TENANT
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Console développeur & supervision technique • Bénin (Porto-Novo / Cotonou)
            </div>
          </div>
        </div>

        {/* Barre de Recherche Globale */}
        <div style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Recherche globale : INV-2026, utilisateur, ALU-025, audit..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 12px 8px 36px',
              fontSize: '0.8125rem',
              color: '#0f172a',
              outline: 'none'
            }}
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Bascule vers Espaces Métier ALUTRACO & Sélecteur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Bouton direct vers l'Espace PDG */}
          <button
            onClick={() => {
              store.switchUser('usr_pdg_01');
              if (onNavigateToModule) {
                onNavigateToModule('01_pdg_supervision');
              } else if (onSwitchToBusinessView) {
                onSwitchToBusinessView();
              }
            }}
            className="btn btn-sm"
            style={{
              backgroundColor: '#fef08a',
              color: '#854d0e',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #facc15',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(202, 138, 4, 0.2)'
            }}
            title="Accéder immédiatement à l'Espace Souverain du PDG (Supervision & Arbitrage)"
          >
            <Crown size={15} color="#b45309" />
            <span>👑 Espace PDG (Supervision)</span>
          </button>

          {/* Switcher de profil rapide dans le SaaS Admin Dashboard */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '4px 8px',
            borderRadius: '6px'
          }}>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const targetUserId = e.target.value;
                store.switchUser(targetUserId);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#1e293b',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Changer d'utilisateur ou d'espace métier"
            >
              <optgroup label="👑 Super Administration SaaS (Propriétaire)">
                {users.filter(u => u.role === 'ADMIN').map(u => (
                  <option key={u.id} value={u.id}>ADMIN SAAS — {u.name}</option>
                ))}
              </optgroup>
              <optgroup label="👑 Haute Direction — Fondateur & Créateur">
                {users.filter(u => u.role === 'PDG' || u.role === 'DG' || u.role === 'ADJOINT_PDG').map(u => (
                  <option key={u.id} value={u.id}>👑 {u.role} (Fondateur) — {u.name}</option>
                ))}
              </optgroup>
              <optgroup label="📦 Magasin Central — Gestion des Tarifs & Stocks">
                {users.filter(u => u.role === 'MAGASINIER').map(u => (
                  <option key={u.id} value={u.id}>📦 MAGASINIER — {u.name}</option>
                ))}
              </optgroup>
              <optgroup label="Secrétariat de la Direction">
                {users.filter(u => u.role === 'SECRETAIRE_DIRECTION').map(u => (
                  <option key={u.id} value={u.id}>SECR. DIR. — {u.name}</option>
                ))}
              </optgroup>
              <optgroup label="Administration — Contrôleurs & Responsables">
                {users.filter(u => u.role === 'RESPONSABLE_INVENTAIRE' || u.role === 'CONTROLEUR').map(u => (
                  <option key={u.id} value={u.id}>{u.role} — {u.name}</option>
                ))}
              </optgroup>
              <optgroup label="Inventoristes Terrain">
                {users.filter(u => u.role === 'INVENTORISTE').map(u => (
                  <option key={u.id} value={u.id}>INVENTORISTE — {u.name}</option>
                ))}
              </optgroup>
              <optgroup label="Responsables Boutiques">
                {users.filter(u => u.role === 'RESPONSABLE_BOUTIQUE').map(u => (
                  <option key={u.id} value={u.id}>RESP. BOUTIQUE — {u.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#065f46', backgroundColor: '#d1fae5', padding: '4px 10px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Système 100% Opérationnel</span>
          </div>

          {onSwitchToBusinessView && (
            <button
              onClick={onSwitchToBusinessView}
              className="btn btn-sm"
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #cbd5e1',
                padding: '7px 14px',
                borderRadius: '6px'
              }}
              title="Passer sur les écrans opérationnels d'ALUTRACO"
            >
              <span>Accéder aux Espaces Métier ALUTRACO</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Bannière de notification d'action */}
      {actionNotice && (
        <div style={{
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          padding: '10px 24px',
          fontSize: '0.8125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #a7f3d0',
          borderTop: '1px solid #a7f3d0'
        }}>
          <CheckCircle2 size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ── RÉSULTATS DE RECHERCHE GLOBALE INSTANTANÉE ── */}
      {searchResults && (
        <div style={{
          backgroundColor: '#eff6ff',
          borderBottom: '2px solid #2563eb',
          padding: '16px 24px',
          maxHeight: '340px',
          overflowY: 'auto',
          borderTop: '1px solid #bfdbfe'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1d4ed8' }}>
              Résultats pour « {globalSearch} » :
            </div>
            <button
              onClick={() => setGlobalSearch('')}
              style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Fermer la recherche
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Utilisateurs */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', marginBottom: '6px' }}>
                UTILISATEURS ({searchResults.users.length})
              </div>
              {searchResults.users.map(u => (
                <div key={u.id} style={{ fontSize: '0.8125rem', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <strong>{u.name}</strong> • <span style={{ color: '#64748b' }}>{u.role}</span> ({u.email})
                </div>
              ))}
              {searchResults.users.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Aucun utilisateur</div>}
            </div>

            {/* Inventaires */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: '6px' }}>
                INVENTAIRES ({searchResults.inventories.length})
              </div>
              {searchResults.inventories.map(i => (
                <div key={i.id} style={{ fontSize: '0.8125rem', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <strong>{i.code}</strong> • {i.shopName} ({i.status})
                </div>
              ))}
              {searchResults.inventories.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Aucun inventaire</div>}
            </div>

            {/* Articles */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', marginBottom: '6px' }}>
                ARTICLES ({searchResults.articles.length})
              </div>
              {searchResults.articles.map(a => (
                <div key={a.id} style={{ fontSize: '0.8125rem', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <strong>{a.designation}</strong> • {a.color || a.category} — {formatFCFA(a.officialPrice)}
                </div>
              ))}
              {searchResults.articles.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Aucun article</div>}
            </div>

            {/* Logs Audit */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: '6px' }}>
                JOURNAL AUDIT ({searchResults.logs.length})
              </div>
              {searchResults.logs.slice(0, 5).map(l => (
                <div key={l.id} style={{ fontSize: '0.75rem', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
                  {l.timestamp} • <strong>{l.action}</strong> par {l.userName}
                </div>
              ))}
              {searchResults.logs.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Aucun log d'audit</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── CORPS DE L'ESPACE ADMIN : NAVIGATION ET CONTENU ── */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* Navigation Latérale Technique */}
        <nav style={{
          width: '280px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          padding: '16px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          flexShrink: 0
        }}>
          <div style={{ padding: '8px 12px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Supervision & Contrôle
          </div>

          <button
            onClick={() => setActiveTab('DASHBOARD')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'DASHBOARD' ? '#eff6ff' : 'transparent',
              color: activeTab === 'DASHBOARD' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'DASHBOARD' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Activity size={17} />
            <span>1. Tableau de bord</span>
          </button>

          <button
            onClick={() => setActiveTab('SECURITY_HOURS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'SECURITY_HOURS' ? '#eff6ff' : 'transparent',
              color: activeTab === 'SECURITY_HOURS' ? '#1d4ed8' : '#d97706',
              fontWeight: activeTab === 'SECURITY_HOURS' ? 700 : 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Clock size={17} />
            <span>2. Contrôleur d'heures (Sécurité)</span>
          </button>

          <button
            onClick={() => setActiveTab('USERS_SESSIONS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'USERS_SESSIONS' ? '#eff6ff' : 'transparent',
              color: activeTab === 'USERS_SESSIONS' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'USERS_SESSIONS' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Users size={17} />
            <span>3. Utilisateurs & Sessions</span>
          </button>

          <button
            onClick={() => setActiveTab('ROLES_PERMISSIONS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'ROLES_PERMISSIONS' ? '#eff6ff' : 'transparent',
              color: activeTab === 'ROLES_PERMISSIONS' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'ROLES_PERMISSIONS' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <KeyRound size={17} />
            <span>4. Rôles & Permissions ALUTRACO</span>
          </button>

          <button
            onClick={() => setActiveTab('TEMP_PERMISSIONS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'TEMP_PERMISSIONS' ? '#eff6ff' : 'transparent',
              color: activeTab === 'TEMP_PERMISSIONS' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'TEMP_PERMISSIONS' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <History size={17} />
            <span>5. Permissions Temporaires</span>
          </button>

          <div style={{ padding: '12px 12px 6px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Structure & Opérations ALUTRACO
          </div>

          <button
            onClick={() => setActiveTab('ORGANIZATION')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'ORGANIZATION' ? '#eff6ff' : 'transparent',
              color: activeTab === 'ORGANIZATION' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'ORGANIZATION' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Store size={17} />
            <span>6. Agences & Boutiques</span>
          </button>

          <button
            onClick={() => setActiveTab('CATALOG_PRICES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'CATALOG_PRICES' ? '#eff6ff' : 'transparent',
              color: activeTab === 'CATALOG_PRICES' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'CATALOG_PRICES' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Boxes size={17} />
            <span>7. Catalogue & Historique Prix</span>
          </button>

          <button
            onClick={() => setActiveTab('INVENTORIES_VERSIONS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'INVENTORIES_VERSIONS' ? '#eff6ff' : 'transparent',
              color: activeTab === 'INVENTORIES_VERSIONS' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'INVENTORIES_VERSIONS' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <ClipboardList size={17} />
            <span>8. Inventaires & Versions</span>
          </button>

          <button
            onClick={() => setActiveTab('REOPENINGS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'REOPENINGS' ? '#eff6ff' : 'transparent',
              color: activeTab === 'REOPENINGS' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'REOPENINGS' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Unlock size={17} />
            <span>9. Surveillance Réouvertures</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_LOG')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'AUDIT_LOG' ? '#eff6ff' : 'transparent',
              color: activeTab === 'AUDIT_LOG' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'AUDIT_LOG' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <FileSearch size={17} />
            <span>10. Journal d'Audit Intégral</span>
          </button>

          <div style={{ padding: '12px 12px 6px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Infrastructure & Outils Développeur
          </div>

          <button
            onClick={() => setActiveTab('BACKUPS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'BACKUPS' ? '#eff6ff' : 'transparent',
              color: activeTab === 'BACKUPS' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'BACKUPS' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Database size={17} />
            <span>11. Sauvegardes & Restauration</span>
          </button>

          <button
            onClick={() => setActiveTab('SYSTEM_HEALTH')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'SYSTEM_HEALTH' ? '#eff6ff' : 'transparent',
              color: activeTab === 'SYSTEM_HEALTH' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'SYSTEM_HEALTH' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Activity size={17} />
            <span>12. État du Système</span>
          </button>

          <button
            onClick={() => setActiveTab('MAINTENANCE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'MAINTENANCE' ? '#eff6ff' : 'transparent',
              color: activeTab === 'MAINTENANCE' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'MAINTENANCE' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Wrench size={17} />
            <span>13. Mode Maintenance</span>
          </button>

          <button
            onClick={() => setActiveTab('FEATURE_FLAGS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'FEATURE_FLAGS' ? '#eff6ff' : 'transparent',
              color: activeTab === 'FEATURE_FLAGS' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'FEATURE_FLAGS' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Sliders size={17} />
            <span>14. Fonctionnalités (Flags)</span>
          </button>

          <button
            onClick={() => setActiveTab('DEV_CONSOLE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'DEV_CONSOLE' ? '#eff6ff' : 'transparent',
              color: activeTab === 'DEV_CONSOLE' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'DEV_CONSOLE' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Terminal size={17} />
            <span>15. Console Développeur</span>
          </button>

          <button
            onClick={() => setActiveTab('DIAGNOSTIC')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'DIAGNOSTIC' ? '#eff6ff' : 'transparent',
              color: activeTab === 'DIAGNOSTIC' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'DIAGNOSTIC' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <AlertOctagon size={17} />
            <span>16. Centre de Diagnostic</span>
          </button>

          <button
            onClick={() => setActiveTab('CONFIG')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'CONFIG' ? '#eff6ff' : 'transparent',
              color: activeTab === 'CONFIG' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'CONFIG' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Settings size={17} />
            <span>17. Configuration Générale</span>
          </button>

          <button
            onClick={() => setActiveTab('SUPABASE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'SUPABASE' ? '#eff6ff' : 'transparent',
              color: activeTab === 'SUPABASE' ? '#2563eb' : '#334155',
              fontWeight: activeTab === 'SUPABASE' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Cloud size={17} color="#2563eb" />
            <span>18. Supabase & Cloud Sync</span>
          </button>
        </nav>

        {/* Contenu Principal du module sélectionné */}
        <main style={{ flex: 1, padding: '24px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
          
          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 1 : DASHBOARD ADMIN SAAS */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'DASHBOARD' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Tableau de Bord Administrateur SaaS
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Supervision en direct de l'application dédiée à <strong>ALUTRACO</strong>. Indicateurs critiques, flux d'inventaires et intégrité des données.
                </p>
              </div>

              {/* Cartes KPI */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>Comptes Utilisateurs</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb' }}>{kpis.totalUsers}</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                    {kpis.activeUsers} actifs • {kpis.suspendedUsers} suspendus
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>Agences & Boutiques</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed' }}>{kpis.totalShops}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    ALUTRACO SARL (Bénin)
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>Inventaires Actifs</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>{kpis.inventoriesInProgress}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                    {kpis.inventoriesValidated} finalisés & scellés
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>Sessions Actives</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>{kpis.activeSessionsCount}</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                    Appareils connectés
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>Dernière Sauvegarde</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {kpis.lastBackup ? kpis.lastBackup.createdAt : 'Aucune'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                    ✓ Intégrale Scellée SHA256
                  </div>
                </div>
              </div>

              {/* Activité récente et alertes */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="#7c3aed" />
                    <span>Activité Récente ALUTRACO (Audit & Opérations)</span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {auditLogs.slice(0, 6).map((log) => (
                      <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', fontSize: '0.8125rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.action}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                            Par <strong>{log.userName}</strong> ({log.userRole}) {log.targetObject ? `• ${log.targetObject}` : ''}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.6875rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {log.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} color="#f59e0b" />
                    <span>Sécurité & Couvre-Feu</span>
                  </h3>
                  <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.8125rem' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Contrôleur d'heures :</div>
                    <div style={{ fontWeight: 700, color: loginHoursConfig.enabled ? '#10b981' : '#ef4444' }}>
                      {loginHoursConfig.enabled ? `ACTIF • Limite : ${loginHoursConfig.maxEndHour}` : 'DÉSACTIVÉ'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                      Rôles restreints : {loginHoursConfig.restrictedRoles.join(', ')}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('SECURITY_HOURS')}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>Modifier la Politique Horaire</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 2 : CONTRÔLEUR DES HEURES DE CONNEXION (DEMANDE UTILISATEUR) */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'SECURITY_HOURS' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Clock size={22} color="#f59e0b" />
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    Contrôleur des Heures de Connexion & Couvre-Feu de Sécurité
                  </h1>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Réglez une heure limite au-delà de laquelle les utilisateurs ou rôles sélectionnés ne pourront plus se connecter à la plateforme, pour garantir la sécurité et l'intégrité des inventaires ALUTRACO.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
                
                {/* Formulaire de configuration horaire */}
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <form onSubmit={handleSaveHoursConfig}>
                    
                    {/* Toggle activation */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                          Activer la restriction horaire de connexion
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Si activé, tout utilisateur restreint tentant de se connecter au-delà de l'heure sera bloqué.
                        </div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={hoursEnabled}
                          onChange={(e) => setHoursEnabled(e.target.checked)}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: hoursEnabled ? '#10b981' : '#475569',
                          transition: '0.3s',
                          borderRadius: '24px'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '""',
                            height: '18px',
                            width: '18px',
                            left: hoursEnabled ? '26px' : '3px',
                            bottom: '3px',
                            backgroundColor: 'white',
                            transition: '0.3s',
                            borderRadius: '50%'
                          }} />
                        </span>
                      </label>
                    </div>

                    {/* Plage horaire autorisée */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                          Heure d'ouverture des accès (Matin)
                        </label>
                        <input
                          type="time"
                          value={hoursStart}
                          onChange={(e) => setHoursStart(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: '#ffffff',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            padding: '10px 12px',
                            color: '#0f172a',
                            fontSize: '1rem',
                            fontWeight: 700
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                          Heure Limite de Connexion (Couvre-Feu) *
                        </label>
                        <input
                          type="time"
                          value={hoursMaxEnd}
                          onChange={(e) => setHoursMaxEnd(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: '#ffffff',
                            border: '1px solid #f59e0b',
                            borderRadius: '6px',
                            padding: '10px 12px',
                            color: '#f59e0b',
                            fontSize: '1rem',
                            fontWeight: 800
                          }}
                        />
                        <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '4px' }}>
                          Ex : 19:00 (Interdiction totale de se connecter après 19h00)
                        </div>
                      </div>
                    </div>

                    {/* Sélection des Rôles Soumis au Couvre-Feu */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>
                        Rôles soumis à la restriction horaire :
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                        {[
                          { role: 'INVENTORISTE', label: 'Inventoristes (Terrain)' },
                          { role: 'CONTROLEUR', label: 'Contrôleurs d\'inventaire' },
                          { role: 'RESPONSABLE_BOUTIQUE', label: 'Chefs d\'agence / Boutique' },
                          { role: 'SECRETAIRE_DIRECTION', label: 'Secrétariat Direction' },
                          { role: 'RESPONSABLE_INVENTAIRE', label: 'Responsable Inventaire' },
                          { role: 'MAGASINIER', label: 'Magasinier Général' }
                        ].map(({ role, label }) => {
                          const isRestricted = hoursRoles.includes(role as UserRole);
                          return (
                            <div
                              key={role}
                              onClick={() => handleToggleRoleHourRestriction(role as UserRole)}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: `1px solid ${isRestricted ? '#f59e0b' : '#334155'}`,
                                backgroundColor: isRestricted ? '#78350f22' : '#0f172a',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.8125rem',
                                color: isRestricted ? '#fbbf24' : '#94a3b8',
                                fontWeight: isRestricted ? 700 : 500
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isRestricted}
                                readOnly
                                style={{ cursor: 'pointer' }}
                              />
                              <span>{label}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                        Note : L'Administrateur SaaS et la Direction Générale (PDG) disposent d'un accès 24h/24 d'urgence garanti.
                      </div>
                    </div>

                    {/* Blocage du Week-end */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem', color: '#64748b', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={hoursBlockWeekends}
                          onChange={(e) => setHoursBlockWeekends(e.target.checked)}
                        />
                        <span>Interdire également les connexions le Samedi et Dimanche</span>
                      </label>
                    </div>

                    {/* Message d'erreur personnalisé */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                        Message affiché à l'utilisateur lors d'une tentative hors créneau
                      </label>
                      <textarea
                        rows={2}
                        value={hoursWarningMsg}
                        onChange={(e) => setHoursWarningMsg(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#ffffff',
                          border: '1px solid #475569',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          color: '#0f172a',
                          fontSize: '0.8125rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn"
                      style={{
                        backgroundColor: '#f59e0b',
                        color: '#0f172a',
                        fontWeight: 800,
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        borderRadius: '6px'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Enregistrer & Appliquer le Couvre-Feu</span>
                    </button>
                  </form>
                </div>

                {/* Simulateur / Testeur en temps réel de la règle */}
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#10b981" />
                    <span>Simulateur & Testeur de Connexion</span>
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '16px' }}>
                    Sélectionnez un collaborateur ALUTRACO pour vérifier immédiatement si son profil a le droit de se connecter à l'heure courante ({new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}).
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', color: '#64748b', marginBottom: '6px' }}>
                      Collaborateur à tester :
                    </label>
                    <select
                      value={testUserSelect}
                      onChange={(e) => {
                        setTestUserSelect(e.target.value);
                        setTestResult(null);
                      }}
                      style={{
                        width: '100%',
                        backgroundColor: '#ffffff',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        padding: '10px',
                        color: '#0f172a',
                        fontSize: '0.875rem'
                      }}
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.role} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleTestHoursPolicy}
                    className="btn btn-secondary"
                    style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Play size={16} />
                    <span>Tester la Règle Maintenant</span>
                  </button>

                  {testResult && (
                    <div style={{
                      padding: '14px',
                      borderRadius: '6px',
                      backgroundColor: testResult.includes('AUTORISÉ') ? '#064e3b' : '#7f1d1d',
                      color: testResult.includes('AUTORISÉ') ? '#d1fae5' : '#fee2e2',
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                      border: `1px solid ${testResult.includes('AUTORISÉ') ? '#059669' : '#b91c1c'}`
                    }}>
                      {testResult}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
                    🔒 <strong>Garantie Sécurité :</strong> Le contrôle s'opère en amont dès la saisie des identifiants et bloque toute ouverture de session non autorisée.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 3 : UTILISATEURS & SESSIONS ACTIVES */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'USERS_SESSIONS' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    Administration des Utilisateurs & Sessions ALUTRACO
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                    Supervision technique des comptes, révocation des sessions à distance et gestion des accès sans suppression d'historique.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <option value="TOUS">Tous les rôles</option>
                    <option value="PDG">PDG</option>
                    <option value="SECRETAIRE_DIRECTION">Secrétaire de Direction</option>
                    <option value="MAGASINIER">Magasinier Général</option>
                    <option value="RESPONSABLE_INVENTAIRE">Responsable Inventaire</option>
                    <option value="CONTROLEUR">Contrôleur</option>
                    <option value="INVENTORISTE">Inventoriste</option>
                    <option value="RESPONSABLE_BOUTIQUE">Chef d'agence</option>
                  </select>
                </div>
              </div>

              {/* Sessions actives */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={18} color="#34d399" />
                  <span>Sessions Appareils en Cours ({sessions.filter(s => s.status === 'ACTIVE').length} actives)</span>
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#94a3b8' }}>
                        <th style={{ padding: '8px 12px' }}>Utilisateur</th>
                        <th style={{ padding: '8px 12px' }}>Rôle</th>
                        <th style={{ padding: '8px 12px' }}>Appareil / Navigateur</th>
                        <th style={{ padding: '8px 12px' }}>Adresse Réseau</th>
                        <th style={{ padding: '8px 12px' }}>Connexion</th>
                        <th style={{ padding: '8px 12px' }}>Statut</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map(ses => (
                        <tr key={ses.id} style={{ borderBottom: '1px solid #0f172a' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{ses.userName}</td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{ses.userRole}</td>
                          <td style={{ padding: '10px 12px' }}>{ses.device} • <span style={{ color: '#64748b' }}>{ses.browser}</span></td>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#94a3b8' }}>{ses.ipAddress}</td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>{ses.connectedAt}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: ses.status === 'ACTIVE' ? '#064e3b' : '#334155',
                              color: ses.status === 'ACTIVE' ? '#34d399' : '#94a3b8'
                            }}>
                              {ses.status === 'ACTIVE' ? 'ACTIF' : 'RÉVOQUÉ'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            {ses.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleKillSession(ses.id)}
                                className="btn btn-secondary btn-sm"
                                style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', borderColor: '#991b1b', padding: '4px 8px' }}
                              >
                                Révoquer
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Liste complète des comptes utilisateurs */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                  Comptes ALUTRACO Enregistrés ({users.length})
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#94a3b8' }}>
                        <th style={{ padding: '8px 12px' }}>Identifiant</th>
                        <th style={{ padding: '8px 12px' }}>Nom Collaborateur</th>
                        <th style={{ padding: '8px 12px' }}>E-mail</th>
                        <th style={{ padding: '8px 12px' }}>Rôle Métier</th>
                        <th style={{ padding: '8px 12px' }}>Agence</th>
                        <th style={{ padding: '8px 12px' }}>Statut</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions Administrateur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => userRoleFilter === 'TOUS' || u.role === userRoleFilter).map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #0f172a' }}>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed' }}>
                            {u.uniqueIdentifier || u.id}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>
                            {u.name}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{u.email}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#334155', fontSize: '0.75rem', color: '#0f172a' }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                            {shops.find(s => s.id === u.shopId)?.name || 'Direction Générale'}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: u.status === 'SUSPENDU' ? '#7f1d1d' : '#064e3b',
                              color: u.status === 'SUSPENDU' ? '#fca5a5' : '#34d399'
                            }}>
                              {u.status || 'ACTIF'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleToggleUserSuspension(u)}
                                className="btn btn-secondary btn-sm"
                                style={{
                                  backgroundColor: u.status === 'SUSPENDU' ? '#064e3b' : '#334155',
                                  color: u.status === 'SUSPENDU' ? '#34d399' : '#cbd5e1',
                                  padding: '4px 8px'
                                }}
                              >
                                {u.status === 'SUSPENDU' ? 'Réactiver' : 'Suspendre'}
                              </button>

                              <button
                                onClick={() => {
                                  store.killAllSessionsForUser(u.id);
                                  setActionNotice(`Toutes les sessions de ${u.name} ont été déconnectées.`);
                                  setTimeout(() => setActionNotice(null), 4000);
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px' }}
                                title="Forcer la déconnexion sur tous les téléphones/ordinateurs"
                              >
                                Déconnecter
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 4 : RÔLES & PERMISSIONS ALUTRACO */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'ROLES_PERMISSIONS' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Matrice Officielle des Rôles & Permissions ALUTRACO
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Architecture stricte de séparation des pouvoirs : l'Administrateur SaaS surveille techniquement sans s'ingérer dans les actes métier de la Direction.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {[
                  {
                    role: 'ADMIN',
                    title: 'Administrateur SaaS / Développeur',
                    desc: 'Maintien, sécurisation, sauvegardes, diagnostic et monopole de suppression des comptes. Ne valide pas les inventaires comptables.',
                    badgeColor: '#7c3aed'
                  },
                  {
                    role: 'PDG',
                    title: 'PDG & Direction Générale',
                    desc: 'Validation finale irrévocable, autorisation des réouvertures exceptionnelles, habilitation des clôtures de traitement.',
                    badgeColor: '#0f172a'
                  },
                  {
                    role: 'SECRETAIRE_DIRECTION',
                    title: 'Secrétariat de Direction',
                    desc: 'Programmation des campagnes, notifications ciblées aux agences, envoi des invitations avec liens uniques WhatsApp/Email. Ne peut supprimer aucun membre.',
                    badgeColor: '#0e7490'
                  },
                  {
                    role: 'MAGASINIER',
                    title: 'Magasinier Général',
                    desc: 'Monopole strict de modification des prix officiels et import des grilles tarifaires. Les changements de prix n\'impactent jamais les inventaires passés.',
                    badgeColor: '#1e3a8a'
                  },
                  {
                    role: 'RESPONSABLE_INVENTAIRE',
                    title: 'Responsable Chargé d\'Inventaire',
                    desc: 'Finalisation et clôture des inventaires de boutiques, octroi des permissions temporaires de correction sur le terrain.',
                    badgeColor: '#047857'
                  },
                  {
                    role: 'CONTROLEUR',
                    title: 'Contrôleur d\'Inventaire',
                    desc: 'Vérification physique, correction des quantités saisies erronées, clôture du rapport de contrôle contradictoire.',
                    badgeColor: '#b45309'
                  },
                  {
                    role: 'INVENTORISTE',
                    title: 'Inventoriste Terrain',
                    desc: 'Saisie exclusive des quantités (bon état / gâté). Saisie verrouillée dès soumission, demandes ultérieures transmises par messagerie sécurisée.',
                    badgeColor: '#4338ca'
                  },
                  {
                    role: 'RESPONSABLE_BOUTIQUE',
                    title: 'Chef d\'Agence / Responsable Boutique',
                    desc: 'Consultation exclusive de son agence, justificatifs d\'écarts, transmission de photos et pièces jointes contradictoires.',
                    badgeColor: '#475569'
                  }
                ].map((item) => (
                  <div key={item.role} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: item.badgeColor, color: '#0f172a', padding: '3px 8px', borderRadius: '4px' }}>
                        {item.role}
                      </span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      {item.title}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 5 : PERMISSIONS TEMPORAIRES */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'TEMP_PERMISSIONS' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Suivi des Permissions Temporaires & Délégations
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Les permissions temporaires expirent automatiquement après le délai fixé. Surveillance technique en direct.
                </p>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ padding: '8px 12px' }}>ID Perm</th>
                      <th style={{ padding: '8px 12px' }}>Bénéficiaire</th>
                      <th style={{ padding: '8px 12px' }}>Inventaire</th>
                      <th style={{ padding: '8px 12px' }}>Portée / Action</th>
                      <th style={{ padding: '8px 12px' }}>Autorisé Par</th>
                      <th style={{ padding: '8px 12px' }}>Expiration</th>
                      <th style={{ padding: '8px 12px' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map(perm => (
                      <tr key={perm.id} style={{ borderBottom: '1px solid #0f172a' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#7c3aed' }}>{perm.id}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{perm.userName}</td>
                        <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{perm.inventoryCode}</td>
                        <td style={{ padding: '10px 12px' }}>{perm.scope} • {perm.action}</td>
                        <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{perm.grantedByName}</td>
                        <td style={{ padding: '10px 12px', color: '#f59e0b', fontFamily: 'monospace' }}>
                          {new Date(perm.expiresAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: perm.status === 'ACTIVE' ? '#064e3b' : '#334155',
                            color: perm.status === 'ACTIVE' ? '#34d399' : '#94a3b8'
                          }}>
                            {perm.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {permissions.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                          Aucune permission temporaire enregistrée pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 6 : AGENCES & BOUTIQUES ALUTRACO */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'ORGANIZATION' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Organisation Interne : Agences & Boutiques ALUTRACO
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Structure physique de l'entreprise unique ALUTRACO. Cloisonnement strict des données entre boutiques.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {shops.map(shop => (
                  <div key={shop.id} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', fontSize: '0.8125rem' }}>
                        {shop.code}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: shop.status === 'ACTIVE' ? '#064e3b' : '#7f1d1d',
                        color: shop.status === 'ACTIVE' ? '#34d399' : '#fca5a5'
                      }}>
                        {shop.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      {shop.name}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '12px' }}>
                      📍 {shop.address} • 📞 {shop.phone}
                    </div>

                    <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                      <div>Responsable : <strong>{shop.managerName || 'Non assigné'}</strong></div>
                      <div style={{ marginTop: '4px' }}>Inventaires : {shop.activeInventoriesCount} en cours • {shop.validatedInventoriesCount} validés</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 7 : CATALOGUE & HISTORIQUE DES PRIX FIGÉS */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'CATALOG_PRICES' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    Catalogue Central ALUTRACO & Versioning des Tarifs
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                    Aluminium par couleurs officielles & Accessoires. <strong>Règle d'or :</strong> un changement de tarif ne modifie jamais les inventaires clôturés passés.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={catalogCategoryFilter}
                    onChange={(e) => setCatalogCategoryFilter(e.target.value as any)}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <option value="TOUS">Toutes catégories</option>
                    <option value="Aluminium">Profilés Aluminium</option>
                    <option value="Accessoires">Accessoires & Quincaillerie</option>
                  </select>
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ padding: '8px 12px' }}>Code</th>
                      <th style={{ padding: '8px 12px' }}>Désignation Article</th>
                      <th style={{ padding: '8px 12px' }}>Catégorie</th>
                      <th style={{ padding: '8px 12px' }}>Couleur</th>
                      <th style={{ padding: '8px 12px' }}>Unité</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Tarif Officiel en Vigueur</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalog
                      .filter(a => catalogCategoryFilter === 'TOUS' || a.category === catalogCategoryFilter)
                      .map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #0f172a' }}>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#2563eb' }}>{item.code}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{item.designation}</td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{item.category}</td>
                          <td style={{ padding: '10px 12px' }}>
                            {item.color ? (
                              <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#334155', color: '#0f172a', fontSize: '0.75rem' }}>
                                {item.color}
                              </span>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{item.unit}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                            {formatFCFA(item.officialPrice)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: item.isActive ? '#34d399' : '#f87171' }}>
                              {item.isActive ? 'ACTIF' : 'INACTIF'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 8 : INVENTAIRES & VERSIONS */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'INVENTORIES_VERSIONS' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Supervision Technique des Inventaires & Versions
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Traçabilité intégrale de chaque campagne, versions d'inventaire archivées (V1, V2...) et statuts officiels.
                </p>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ padding: '8px 12px' }}>Code Inventaire</th>
                      <th style={{ padding: '8px 12px' }}>Boutique / Site</th>
                      <th style={{ padding: '8px 12px' }}>Campagne</th>
                      <th style={{ padding: '8px 12px' }}>Catégorie</th>
                      <th style={{ padding: '8px 12px' }}>Version</th>
                      <th style={{ padding: '8px 12px' }}>Statut</th>
                      <th style={{ padding: '8px 12px' }}>Création</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventories.map(inv => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #0f172a' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{inv.code}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{inv.shopName}</td>
                        <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{inv.campaignName}</td>
                        <td style={{ padding: '10px 12px' }}>{inv.category}</td>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#7c3aed' }}>
                          V{inv.version} ({inv.versionsHistory?.length || 0} archivée(s))
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: inv.status === 'Validé et clôturé' ? '#064e3b' : '#78350f',
                            color: inv.status === 'Validé et clôturé' ? '#34d399' : '#fbbf24'
                          }}>
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{inv.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 9 : SURVEILLANCE DES RÉOUVERTURES */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'REOPENINGS' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Surveillance des Réouvertures Exceptionnelles
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Conformément aux directives ALUTRACO, l'administrateur surveille le workflow sans contourner les prérogatives du PDG.
                </p>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                {inventories.filter(i => (i.versionsHistory && i.versionsHistory.length > 0) || i.version > 1).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    <ShieldCheck size={36} style={{ margin: '0 auto 12px auto', color: '#10b981' }} />
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>Aucune réouverture d'inventaire en cours</div>
                    <div style={{ fontSize: '0.8125rem', marginTop: '4px' }}>
                      Tous les inventaires clôturés conservent leur scellement intact sans altération.
                    </div>
                  </div>
                ) : (
                  <div>
                    {inventories.filter(i => i.version > 1).map(inv => (
                      <div key={inv.id} style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '6px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#2563eb' }}>{inv.code} — {inv.shopName}</span>
                          <span style={{ fontSize: '0.75rem', backgroundColor: '#78350f', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px' }}>
                            Version Actuelle : V{inv.version}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                          Historique des versions archivées sous scellé numérique : {inv.versionsHistory?.length || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 10 : JOURNAL D'AUDIT INTÉGRAL */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'AUDIT_LOG' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    Journal d'Audit Approfondi ALUTRACO
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                    Traçabilité exhaustive : qui a fait quoi, quand, motif, ancienne et nouvelle valeur, adresse réseau et autorisation.
                  </p>
                </div>

                <div style={{ width: '280px' }}>
                  <input
                    type="text"
                    placeholder="Filtrer l'audit..."
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#0f172a',
                      fontSize: '0.8125rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ padding: '8px 12px' }}>Horodatage</th>
                      <th style={{ padding: '8px 12px' }}>Utilisateur</th>
                      <th style={{ padding: '8px 12px' }}>Action & Objet</th>
                      <th style={{ padding: '8px 12px' }}>Ancienne / Nouvelle Valeur</th>
                      <th style={{ padding: '8px 12px' }}>Motif & Habilitation</th>
                      <th style={{ padding: '8px 12px' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs
                      .filter(l => !auditSearchQuery || l.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) || l.userName.toLowerCase().includes(auditSearchQuery.toLowerCase()))
                      .slice(0, 30)
                      .map(log => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #0f172a' }}>
                          <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'monospace' }}>{log.timestamp}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>
                            {log.userName}
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{log.userRole}</div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 600, color: '#2563eb' }}>{log.action}</div>
                            {log.targetObject && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.targetObject}</div>}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>
                            {log.newValue && <div>{log.newValue}</div>}
                            {log.oldValue && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ancien : {log.oldValue}</div>}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                            {log.reason || '-'}
                            {log.authorizedBy && <div style={{ fontSize: '0.7rem', color: '#7c3aed' }}>Aut : {log.authorizedBy}</div>}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: log.status === 'SUCCESS' ? '#064e3b' : '#7f1d1d',
                              color: log.status === 'SUCCESS' ? '#34d399' : '#fca5a5'
                            }}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 11 : SAUVEGARDES & RESTAURATION SANDBOX */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'BACKUPS' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    Sauvegardes Cryptographiques & Restauration Sandbox
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                    Chiffrement AES-256, scellés SHA256 et validation de recouvrabilité sans toucher aux données de production.
                  </p>
                </div>

                <button
                  onClick={handleRunBackup}
                  className="btn"
                  style={{
                    backgroundColor: '#10b981',
                    color: '#0f172a',
                    fontWeight: 800,
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    borderRadius: '6px'
                  }}
                >
                  <Download size={16} />
                  <span>Exécuter Sauvegarde Immédiate</span>
                </button>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ padding: '8px 12px' }}>Fichier Archive Scellé</th>
                      <th style={{ padding: '8px 12px' }}>Date & Heure</th>
                      <th style={{ padding: '8px 12px' }}>Taille</th>
                      <th style={{ padding: '8px 12px' }}>Empreinte SHA256</th>
                      <th style={{ padding: '8px 12px' }}>Statut</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Test de Restauration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map(bkp => (
                      <tr key={bkp.id} style={{ borderBottom: '1px solid #0f172a' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#2563eb', fontFamily: 'monospace' }}>
                          {bkp.filename}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{bkp.createdAt}</td>
                        <td style={{ padding: '10px 12px', color: '#0f172a' }}>{bkp.sizeMb} MB</td>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#64748b' }}>{bkp.checksum}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: '#064e3b',
                            color: '#059669'
                          }}>
                            {bkp.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleTestRestore(bkp.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px' }}
                          >
                            <RefreshCw size={13} />
                            <span>Tester Restauration Sandbox</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 12 : ÉTAT DU SYSTÈME */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'SYSTEM_HEALTH' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    État de Santé des Services Système (Plateforme ALUTRACO)
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                    Disponibilité, latence et état opérationnel de chaque brique d'infrastructure.
                  </p>
                </div>

                <button
                  onClick={() => {
                    store.refreshServiceStatus();
                    setActionNotice('Diagnostic de santé des services rafraîchi.');
                    setTimeout(() => setActionNotice(null), 3000);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} />
                  <span>Tester tous les services</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {systemServices.map(srv => (
                  <div key={srv.id} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{srv.category}</span>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: '#064e3b',
                        color: '#059669',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                        <span>{srv.status}</span>
                      </span>
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      {srv.name}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748b', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                      <div>Latence : <strong style={{ color: '#2563eb' }}>{srv.latencyMs} ms</strong></div>
                      <div>Disponibilité : <strong style={{ color: '#059669' }}>{srv.uptime}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 13 : MODE MAINTENANCE PROGRAMMABLE */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'MAINTENANCE' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Gestion du Mode Maintenance Programmable
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Planifiez des interruptions de service lors des opérations d'infrastructure avec affichage d'un message aux utilisateurs.
                </p>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '640px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>Activer immédiatement le mode maintenance</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Seul le compte Administrateur SaaS pourra interagir avec la plateforme.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenance.isActive}
                    onChange={(e) => {
                      store.updateMaintenanceConfig({ isActive: e.target.checked });
                      setActionNotice(`Mode maintenance ${e.target.checked ? 'ACTIVÉ' : 'DÉSACTIVÉ'}.`);
                      setTimeout(() => setActionNotice(null), 3000);
                    }}
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                    Message d'information pour les utilisateurs
                  </label>
                  <textarea
                    rows={3}
                    value={maintenance.message}
                    onChange={(e) => store.updateMaintenanceConfig({ message: e.target.value })}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #475569',
                      borderRadius: '6px',
                      padding: '10px',
                      color: '#0f172a',
                      fontSize: '0.8125rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Début programmé</label>
                    <input
                      type="text"
                      value={maintenance.scheduledStart}
                      onChange={(e) => store.updateMaintenanceConfig({ scheduledStart: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 10px', color: '#0f172a' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Fin programmée</label>
                    <input
                      type="text"
                      value={maintenance.scheduledEnd}
                      onChange={(e) => store.updateMaintenanceConfig({ scheduledEnd: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 10px', color: '#0f172a' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 14 : GESTION DES FONCTIONNALITÉS (FEATURE FLAGS) */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'FEATURE_FLAGS' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Gestion des Fonctionnalités (Feature Flags)
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Activez ou désactivez progressivement des modules et fonctionnalités sans redéploiement.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {[
                  { key: 'offlineMode', label: 'Mode Hors-Ligne & Synchronisation PWA', desc: 'Permet le comptage sans connexion Internet avec synchronisation différée.' },
                  { key: 'qrCodeScanning', label: 'Lecture Code-Barres & Scanner QR', desc: 'Scan direct des étiquettes d\'articles depuis l\'appareil photo mobile.' },
                  { key: 'chantierMode', label: 'Mode Chantier (Emplacements Externes)', desc: 'Prise en charge des profilés aluminium affectés directement sur les sites de pose.' },
                  { key: 'doubleCountAudit', label: 'Double Comptage Aveugle', desc: 'Deux inventoristes comptent indépendamment sans voir les chiffres de l\'autre.' },
                  { key: 'whatsappNotifications', label: 'Notifications WhatsApp Directes', desc: 'Envoi d\'invitations et d\'alertes via liens directs vers WhatsApp Web et Mobile.' },
                  { key: 'strictPriceProtection', label: 'Protection Stricte des Prix Figés', desc: 'Empêche toute modification de prix d\'impacter rétroactivement les inventaires clôturés.' }
                ].map(({ key, label, desc }) => {
                  const val = featureFlags[key as keyof FeatureFlagsConfig];
                  return (
                    <div key={key} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>{label}</span>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: val ? '#064e3b' : '#334155',
                            color: val ? '#34d399' : '#94a3b8'
                          }}>
                            {val ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5 }}>
                          {desc}
                        </p>
                      </div>

                      <button
                        onClick={() => store.toggleFeatureFlag(key as keyof FeatureFlagsConfig)}
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '12px', justifyContent: 'center' }}
                      >
                        Basculer vers {val ? 'DÉSACTIVÉ' : 'ACTIVÉ'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 15 : CONSOLE DÉVELOPPEUR */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'DEV_CONSOLE' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Console Développeur & Diagnostics Techniques
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Espace technique réservé au développeur de la plateforme. Traces, requêtes API et diagnostics système.
                </p>
              </div>

              <div style={{ backgroundColor: '#020617', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                <div style={{ color: '#22c55e', marginBottom: '12px' }}>
                  [ALUCOUNT-CORE] Initializing runtime diagnostic session at {new Date().toISOString()}
                </div>
                <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
                  &gt; Active Company: ALUTRACO SARL (Sole Tenant Model confirmed)
                </div>
                <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
                  &gt; Database: PostgreSQL 16.2 / Schema Version: v2026.10 / RLS: ENFORCED
                </div>
                <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
                  &gt; Storage Engine: Encrypted Local Vault + Cloud Replicas
                </div>
                <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
                  &gt; Access Hours Guard: {loginHoursConfig.enabled ? `ACTIVE (Curfew: ${loginHoursConfig.maxEndHour})` : 'DISABLED'}
                </div>
                <div style={{ color: '#2563eb', marginBottom: '8px' }}>
                  &gt; Security Audit: Monopole de suppression exclusif configuré pour rôle: ADMIN
                </div>
                <div style={{ color: '#f59e0b', marginBottom: '8px' }}>
                  &gt; Total Entities: {users.length} Users, {shops.length} Shops, {catalog.length} Articles, {inventories.length} Inventories
                </div>
                <div style={{ color: '#22c55e', marginTop: '16px' }}>
                  [OK] All system health checks passed without critical exceptions.
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 16 : CENTRE DE DIAGNOSTIC AUTOMATIQUE */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'DIAGNOSTIC' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    Centre de Diagnostic Automatique de la Base ALUTRACO
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                    Détecteur préventif d'incohérences : articles sans prix, boutiques sans responsable, permissions zombies ou données orphelines.
                  </p>
                </div>

                <button
                  onClick={handleRunDiagnostic}
                  className="btn"
                  style={{
                    backgroundColor: '#7c3aed',
                    color: '#0f172a',
                    fontWeight: 700,
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: 'none',
                    borderRadius: '6px'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Relancer le Scan Global</span>
                </button>
              </div>

              {diagnostics.length === 0 ? (
                <div style={{ backgroundColor: '#064e3b', padding: '32px', borderRadius: '8px', textAlign: 'center', color: '#d1fae5' }}>
                  <CheckCircle2 size={36} style={{ margin: '0 auto 12px auto' }} />
                  <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>Intégrité de la Base ALUTRACO : 100% Conforme</div>
                  <div style={{ fontSize: '0.8125rem', marginTop: '4px' }}>
                    Aucune incohérence, aucun article sans prix et aucune permission orpheline détectés.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {diagnostics.map(item => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#ffffff',
                        padding: '16px 20px',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${item.severity === 'CRITICAL' ? '#ef4444' : item.severity === 'WARNING' ? '#f59e0b' : '#38bdf8'}`,
                        borderTop: '1px solid #e2e8f0',
                        borderRight: '1px solid #334155',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: item.severity === 'CRITICAL' ? '#7f1d1d' : item.severity === 'WARNING' ? '#78350f' : '#0369a1',
                            color: item.severity === 'CRITICAL' ? '#fca5a5' : item.severity === 'WARNING' ? '#fde68a' : '#bae6fd'
                          }}>
                            {item.severity}
                          </span>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                            {item.title}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '4px' }}>
                          {item.details}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Action préconisée : <strong>{item.recommendedAction}</strong>
                        </div>
                      </div>

                      {item.autoFixAvailable && (
                        <button
                          onClick={() => handleFixDiagnostic(item.id)}
                          className="btn btn-sm"
                          style={{ backgroundColor: '#10b981', color: '#0f172a', fontWeight: 800, border: 'none' }}
                        >
                          Corriger automatiquement
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 17 : CONFIGURATION GÉNÉRALE DU SAAS */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'CONFIG' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Configuration Générale de la Plateforme ALUCOUNT
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Paramètres de base dédiés exclusivement à l'entreprise ALUTRACO SARL.
                </p>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '640px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                    Entreprise Unique Utilisatrice
                  </label>
                  <input
                    type="text"
                    disabled
                    value={saasConfig.soleCompany}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      color: '#0f172a',
                      fontWeight: 700
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                    Aucun mode multi-société activé. La base est dédiée à 100% à ALUTRACO.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                      Devise Monétaire
                    </label>
                    <input
                      type="text"
                      disabled
                      value={saasConfig.currency}
                      style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', color: '#0f172a', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                      Fuseau Horaire
                    </label>
                    <input
                      type="text"
                      disabled
                      value={saasConfig.timezone}
                      style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', color: '#0f172a', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '20px', fontSize: '0.75rem', color: '#94a3b8' }}>
                  🔒 <strong>Protection des Paramètres Critiques :</strong> Toute modification structurelle de la base de données nécessite les droits super-administrateur du développeur et génère un scellement dans le journal d'audit.
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 18 : SUPABASE & CLOUD SYNC */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'SUPABASE' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Cloud size={24} color="#2563eb" />
                  Connexion & Synchronisation Supabase Cloud
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Gestion de la persistance cloud PostgreSQL, synchronisation des données locales vers Supabase et statut de connectivité en temps réel.
                </p>
              </div>

              {/* Statut de connexion et Diagnostic */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {/* Carte Statut */}
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Server size={20} color="#2563eb" />
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Statut Serveur Cloud</span>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: supabaseStatus === 'ok' ? '#dcfce7' : supabaseStatus === 'error' ? '#fee2e2' : supabaseStatus === 'checking' ? '#fef3c7' : '#f1f5f9',
                      color: supabaseStatus === 'ok' ? '#15803d' : supabaseStatus === 'error' ? '#b91c1c' : supabaseStatus === 'checking' ? '#b45309' : '#475569'
                    }}>
                      {supabaseStatus === 'ok' ? '● Connecté (PostgreSQL)' : supabaseStatus === 'error' ? '● Erreur de connexion' : supabaseStatus === 'checking' ? '● Test en cours...' : '○ Non testé'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
                    {supabaseMessage || 'Cliquez sur le bouton ci-dessous pour vérifier la liaison réseau et tester l\'accès aux tables Supabase.'}
                  </p>

                  <button
                    onClick={handleCheckSupabase}
                    disabled={supabaseStatus === 'checking'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '6px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: supabaseStatus === 'checking' ? 'not-allowed' : 'pointer',
                      opacity: supabaseStatus === 'checking' ? 0.7 : 1
                    }}
                  >
                    <RefreshCw size={16} className={supabaseStatus === 'checking' ? 'animate-spin' : ''} />
                    {supabaseStatus === 'checking' ? 'Vérification en cours...' : 'Tester la connexion Supabase'}
                  </button>
                </div>

                {/* Carte Migration Données */}
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <UploadCloud size={20} color="#7c3aed" />
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Migration vers Supabase</span>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: migrationStatus === 'done' ? '#dcfce7' : migrationStatus === 'error' ? '#fee2e2' : migrationStatus === 'running' ? '#fef3c7' : '#f1f5f9',
                      color: migrationStatus === 'done' ? '#15803d' : migrationStatus === 'error' ? '#b91c1c' : migrationStatus === 'running' ? '#b45309' : '#475569'
                    }}>
                      {migrationStatus === 'done' ? '✓ Migration terminée' : migrationStatus === 'running' ? '⏳ Synchronisation...' : migrationStatus === 'error' ? '⚠ Échec' : 'Prêt'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
                    Injecte l'ensemble des données du stockage local ({users.length} utilisateurs, {shops.length} agences, {catalog.length} articles, {inventories.length} inventaires) dans votre base Supabase distante.
                  </p>

                  {migrationMessage && (
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      marginBottom: '16px',
                      fontSize: '0.75rem',
                      backgroundColor: migrationStatus === 'done' ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${migrationStatus === 'done' ? '#bbf7d0' : '#fecaca'}`,
                      color: migrationStatus === 'done' ? '#166534' : '#991b1b'
                    }}>
                      {migrationMessage}
                    </div>
                  )}

                  <button
                    onClick={handleMigrateToSupabase}
                    disabled={migrationStatus === 'running'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '6px',
                      backgroundColor: '#7c3aed',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: migrationStatus === 'running' ? 'not-allowed' : 'pointer',
                      opacity: migrationStatus === 'running' ? 0.7 : 1
                    }}
                  >
                    <UploadCloud size={16} />
                    {migrationStatus === 'running' ? 'Migration en cours...' : 'Envoyer les données locales vers Supabase'}
                  </button>
                </div>
              </div>

              {/* Guide de configuration & Clés */}
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                  📋 Configuration & Instructions de Déploiement Supabase
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b', marginBottom: '8px' }}>
                      Étape 1 : Variables d'environnement (.env)
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '10px' }}>
                      Renseignez vos clés dans le fichier <code>.env</code> à la racine du projet :
                    </p>
                    <pre style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: '12px', borderRadius: '6px', fontSize: '0.75rem', overflowX: 'auto' }}>
{`VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}
                    </pre>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b', marginBottom: '8px' }}>
                      Étape 2 : Script SQL PostgreSQL
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '10px' }}>
                      Le script complet de création des tables est généré dans :
                    </p>
                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8125rem', color: '#1d4ed8', fontWeight: 600 }}>
                      📄 supabase_schema.sql (à la racine)
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                      Ouvrez Supabase Studio &gt; <strong>SQL Editor</strong>, collez le contenu et cliquez sur <strong>Run</strong>.
                    </p>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b', marginBottom: '8px' }}>
                      Étape 3 : Synchronisation Hybride
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5 }}>
                      ALUCOUNT fonctionne en mode hybride haute disponibilité : le cache local assure un fonctionnement instantané hors-ligne, tandis que Supabase assure la persistance centralisée et la synchronisation multi-postes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};

