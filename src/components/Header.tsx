import {
  UserCheck,
  HelpCircle,
  Bell,
  Menu,
  Settings,
  Crown,
  Laptop,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useALUStore } from '../services/store';
import { UserRole, ModuleId } from '../types';
import { ALUCOUNT_MODULES } from '../data/modulesConfig';

interface HeaderProps {
  activeModule: ModuleId;
  onSelectModule?: (modId: ModuleId) => void;
  onOpenSecurityGuide: () => void;
  onOpenNotifications: () => void;
  onToggleSidebar: () => void;
  onOpenSettings?: () => void;
  onToggleAdminView?: () => void;
  onOpenDevices?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onSelectModule,
  onOpenSecurityGuide,
  onOpenNotifications,
  onToggleSidebar,
  onOpenSettings,
  onToggleAdminView,
  onOpenDevices,
  onLogout,
}) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const users = store.getUsers();
  const notifications = store.getNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const currentModDef = ALUCOUNT_MODULES.find(m => m.id === activeModule);

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return { bg: '#4c1d95', text: '#ffffff' };
      case 'PDG': return { bg: '#0f172a', text: '#ffffff' };
      case 'MAGASINIER': return { bg: '#1e3a8a', text: '#ffffff' };
      case 'SECRETAIRE_DIRECTION': return { bg: '#0e7490', text: '#ffffff' };
      case 'RESPONSABLE_INVENTAIRE': return { bg: '#047857', text: '#ffffff' };
      case 'CONTROLEUR': return { bg: '#b45309', text: '#ffffff' };
      case 'INVENTORISTE': return { bg: '#4338ca', text: '#ffffff' };
      case 'RESPONSABLE_BOUTIQUE': return { bg: '#475569', text: '#ffffff' };
      default: return { bg: '#64748b', text: '#ffffff' };
    }
  };

  const roleStyle = getRoleBadgeStyle(currentUser.role);

  return (
    <header className="top-nav">
      <div className="top-nav-inner">

        {/* ── BOUTON HAMBURGER (mobile/tablette) ── */}
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          title="Ouvrir le menu"
          aria-label="Ouvrir la navigation"
        >
          <Menu size={20} />
        </button>

        {/* ── FIL D'ARIANE ── */}
        <div className="nav-breadcrumb">
          <div
            className="nav-module-badge"
            style={{
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: '0.75rem',
              backgroundColor: '#f1f5f9',
              color: '#2563eb',
              padding: '3px 8px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            MODULE {currentModDef?.number || '01'}
          </div>

          <span style={{ color: '#cbd5e1', flexShrink: 0 }}>/</span>

          <span className="nav-breadcrumb-title">
            {currentModDef?.name || 'Tableau de bord'}
          </span>
        </div>

        {/* ── ACTIONS DROITE ── */}
        <div className="nav-actions">

          {/* Accès direct à l'Espace PDG pour le PDG */}
          {currentUser.role === 'PDG' && onSelectModule && (
            <button
              onClick={() => onSelectModule('01_pdg_supervision')}
              className="btn btn-sm"
              style={{
                backgroundColor: activeModule === '01_pdg_supervision' ? '#f59e0b' : '#fef3c7',
                color: activeModule === '01_pdg_supervision' ? '#ffffff' : '#92400e',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #facc15',
                padding: '6px 12px',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(245, 158, 11, 0.25)',
                cursor: 'pointer'
              }}
              title="Accéder directement à mon Espace Haute Direction PDG (Supervision & Arbitrage)"
            >
              <Crown size={15} color={activeModule === '01_pdg_supervision' ? '#ffffff' : '#ca8a04'} />
              <span>👑 Mon Espace PDG</span>
            </button>
          )}

          {/* Accès direct à l'Espace Magasinier */}
          {currentUser.role === 'MAGASINIER' && onSelectModule && (
            <button
              onClick={() => onSelectModule('06_catalog_tariffs')}
              className="btn btn-sm"
              style={{
                backgroundColor: activeModule === '06_catalog_tariffs' ? '#1d4ed8' : '#eff6ff',
                color: activeModule === '06_catalog_tariffs' ? '#ffffff' : '#1e40af',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #bfdbfe',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Accéder à mon Espace Magasin Central & Gestion des Tarifs"
            >
              <span>📦 Mon Espace Magasinier</span>
            </button>
          )}

          {/* Bascule directe Administrateur SaaS / Vue Métier ALUTRACO */}
          {currentUser.role === 'ADMIN' && onToggleAdminView && (
            <button
              onClick={onToggleAdminView}
              className="btn btn-sm"
              style={{
                backgroundColor: activeModule === '02_admin_security' ? '#0f172a' : '#7c3aed',
                color: '#ffffff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                boxShadow: '0 2px 4px rgba(124, 58, 237, 0.25)'
              }}
              title="Basculer entre la Console SaaS Administrateur et les Écrans Métier ALUTRACO"
            >
              <ShieldCheck size={15} />
              <span>{activeModule === '02_admin_security' ? '🏢 Vue Métier ALUTRACO' : '🛡️ Console Admin SaaS'}</span>
            </button>
          )}

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="btn btn-secondary btn-sm"
            style={{ position: 'relative', padding: '6px 10px' }}
            title="Consulter les notifications et alertes"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontSize: '0.625rem',
                fontWeight: 800,
                borderRadius: '10px',
                padding: '1px 5px',
                border: '2px solid #ffffff',
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Paramètres & Profil pour TOUS les utilisateurs */}
          <button
            onClick={onOpenSettings}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Mon Profil, Photo, Sécurité & Paramètres Personnels"
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <Settings size={15} color="#2563eb" />
            )}
            <span className="nav-label-desktop">Mon Profil</span>
          </button>

          {/* Mes appareils & sessions */}
          {onOpenDevices && (
            <button
              onClick={onOpenDevices}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Gérer mes postes de travail, tablettes et smartphones connectés"
            >
              <Laptop size={15} color="#059669" />
              <span className="nav-label-desktop">Mes Appareils</span>
            </button>
          )}

          {/* Guide sécurité */}
          <button
            onClick={onOpenSecurityGuide}
            className="btn btn-secondary btn-sm"
            title="Les 6 principes fondamentaux d'intégrité"
          >
            <HelpCircle size={15} />
            <span className="nav-label-desktop">Principes &amp; Règles</span>
          </button>

          {/* Bouton Se Déconnecter */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                color: '#dc2626',
                borderColor: '#fecaca',
                backgroundColor: '#fff5f5'
              }}
              title="Fermer ma session et revenir à la page de garde"
            >
              <LogOut size={14} />
              <span className="nav-label-desktop">Déconnexion</span>
            </button>
          )}

          {/* Switcher de rôle */}
          <div className="role-switcher">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #bfdbfe' }}
              />
            ) : (
              <UserCheck size={14} color="#475569" style={{ flexShrink: 0 }} />
            )}

            <div className="role-switcher-info">
              <div className="role-name">{currentUser.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.625rem',
                  backgroundColor: roleStyle.bg,
                  color: roleStyle.text,
                  padding: '0 4px',
                  borderRadius: '2px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  {currentUser.role.replace(/_/g, ' ')}
                </span>
                {currentUser.isDesignatedByPDG && (
                  <span style={{ fontSize: '0.5625rem', color: '#059669', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Habilité PDG
                  </span>
                )}
              </div>
            </div>

            <select
              value={currentUser.id}
              onChange={(e) => store.switchUser(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#2563eb',
                cursor: 'pointer',
                outline: 'none',
                flexShrink: 0,
              }}
              title="Tester les permissions avec un autre profil"
            >
              <optgroup label="👑 Super Administration SaaS (Propriétaire)">
                {users.filter(u => u.role === 'ADMIN').map(u => (
                  <option key={u.id} value={u.id}>ADMIN SAAS — {u.name}</option>
                ))}
              </optgroup>
              <optgroup label="👑 Haute Direction — Créateur & Fondateur">
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
              <optgroup label="Membres Administration — Resp. Inventaire">
                {users.filter(u => u.role === 'RESPONSABLE_INVENTAIRE').map(u => (
                  <option key={u.id} value={u.id}>RESP. INV — {u.name}</option>
                ))}
              </optgroup>
              <optgroup label="Membres Administration — Contrôleurs">
                {users.filter(u => u.role === 'CONTROLEUR').map(u => (
                  <option key={u.id} value={u.id}>CONTRÔLEUR — {u.name}</option>
                ))}
              </optgroup>
              <optgroup label="Inventoristes Terrain">
                {users.filter(u => u.role === 'INVENTORISTE').map(u => (
                  <option key={u.id} value={u.id}>INVENTORISTE — {u.name}</option>
                ))}
              </optgroup>
              <optgroup label="Responsables Boutiques (Restreint)">
                {users.filter(u => u.role === 'RESPONSABLE_BOUTIQUE').map(u => (
                  <option key={u.id} value={u.id}>RESP. BOUTIQUE — {u.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
