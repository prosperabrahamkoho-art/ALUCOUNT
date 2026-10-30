import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  KeyRound, 
  Store, 
  Boxes, 
  CalendarRange, 
  ScanLine, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  History, 
  BarChart3, 
  FileText, 
  Bell, 
  FileSearch,
  Search,
  ChevronDown,
  Building2,
  HardHat,
  Settings,
  Archive,
  Crown,
  X
} from 'lucide-react';
import { ALUCOUNT_MODULES, canUserAccessModule } from '../data/modulesConfig';
import { ModuleId } from '../types';
import { useALUStore } from '../services/store';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onSelectModule, isOpen = false, onClose, onOpenSettings }) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');

  const activePermissionsCount = store.getTemporaryPermissions().filter(p => p.status === 'ACTIVE').length;
  const unreadNotifsCount = store.getNotifications().filter(n => !n.read).length;
  const readyForValidationCount = store.getInventories().filter(i => i.status === 'Prêt pour validation').length;

  const getModuleIcon = (id: ModuleId) => {
    switch (id) {
      case '01_pdg_supervision': return Crown;
      case '02_admin_security': return ShieldCheck;
      case '03_users': return Users;
      case '04_roles_permissions': return KeyRound;
      case '05_shops': return Store;
      case '06_catalog_tariffs': return Boxes;
      case '07_campaigns': return CalendarRange;
      case '08_physical_counting': return ScanLine;
      case '09_control_verification': return CheckCircle2;
      case '10_discrepancies': return AlertTriangle;
      case '11_validation_closing': return ShieldAlert;
      case '12_history_reopen': return History;
      case '13_reports_stats': return BarChart3;
      case '14_documents_exports': return FileText;
      case '15_notifications': return Bell;
      case '16_audit_security': return FileSearch;
      case '17_archives': return Archive;
      default: return LayoutDashboard;
    }
  };

  const categories = [
    '1. Gestion & Administration',
    '2. Articles & Inventaires',
    '3. Consultation & Suivi'
  ] as const;

  return (
    <aside className={`sidebar-aside${isOpen ? ' sidebar-open' : ''}`}>
      {/* Brand Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1rem'
          }}>
            A
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                ALUCOUNT
              </span>
              <span style={{
                fontSize: '0.625rem',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                padding: '1px 5px',
                borderRadius: '3px',
                fontWeight: 700
              }}>
                ALUTRACO
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              17 Modules Métiers Certifiés
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            title="Fermer le menu de navigation"
            aria-label="Fermer la navigation"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Barre de recherche dans les modules */}
      <div style={{ padding: '12px 16px 8px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            placeholder="Rechercher un module (01 à 16)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Liste scrollable des 16 Modules */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 12px 20px',
        scrollbarWidth: 'thin'
      }}>
        {categories.map((catName) => {
          // Règle formelle : N'afficher STRICTEMENT QUE les modules accessibles pour le rôle de l'utilisateur
          const categoryModules = ALUCOUNT_MODULES.filter(m => 
            canUserAccessModule(currentUser.role, m.id) &&
            m.category === catName && 
            (searchQuery === '' || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.number.includes(searchQuery))
          );

          // Si aucun module de cette catégorie n'est accessible pour l'utilisateur, masquer la catégorie entière
          if (categoryModules.length === 0) return null;

          return (
            <div key={catName} style={{ marginBottom: '18px' }}>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '6px 8px 4px',
              }}>
                {catName}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {categoryModules.map(mod => {
                  const Icon = getModuleIcon(mod.id);
                  const isActive = activeModule === mod.id;
                  const isPdgModule = mod.id === '01_pdg_supervision';

                  return (
                    <button
                      key={mod.id}
                      onClick={() => onSelectModule(mod.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: isPdgModule ? '1px solid #fde68a' : 'none',
                        cursor: 'pointer',
                        backgroundColor: isActive 
                          ? (isPdgModule ? '#fef3c7' : '#f1f5f9') 
                          : (isPdgModule ? '#fffbeb' : 'transparent'),
                        color: isActive 
                          ? (isPdgModule ? '#92400e' : '#0f172a') 
                          : (isPdgModule ? '#78350f' : '#334155'),
                        fontWeight: isPdgModule ? 800 : (isActive ? 600 : 500),
                        fontSize: '0.8125rem',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                      title={mod.shortDesc}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.6875rem',
                          color: isPdgModule ? '#d97706' : (isActive ? '#2563eb' : '#64748b'),
                          fontWeight: 700
                        }}>
                          {mod.number}
                        </span>
                        <Icon size={15} color={isPdgModule ? '#d97706' : (isActive ? '#2563eb' : '#475569')} style={{ flexShrink: 0 }} />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {mod.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isPdgModule && (
                          <span style={{
                            backgroundColor: '#f59e0b',
                            color: '#ffffff',
                            fontSize: '0.5625rem',
                            padding: '1px 5px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            letterSpacing: '0.5px'
                          }}>
                            PDG
                          </span>
                        )}
                        {/* Badges contextuels selon module */}
                        {mod.id === '04_roles_permissions' && activePermissionsCount > 0 && (
                          <span style={{
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            fontSize: '0.625rem',
                            padding: '1px 5px',
                            borderRadius: '10px',
                            fontWeight: 700
                          }}>
                            {activePermissionsCount}
                          </span>
                        )}

                        {mod.id === '11_validation_closing' && readyForValidationCount > 0 && (
                          <span style={{
                            backgroundColor: '#d97706',
                            color: '#ffffff',
                            fontSize: '0.625rem',
                            padding: '1px 5px',
                            borderRadius: '10px',
                            fontWeight: 700
                          }}>
                            {readyForValidationCount}
                          </span>
                        )}

                        {mod.id === '15_notifications' && unreadNotifsCount > 0 && (
                          <span style={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            fontSize: '0.625rem',
                            padding: '1px 5px',
                            borderRadius: '10px',
                            fontWeight: 700
                          }}>
                            {unreadNotifsCount}
                          </span>
                        )}

                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Profil connecté & Accès Paramètres */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid #f1f5f9',
        backgroundColor: '#fafbfc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.75rem',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                currentUser.name.charAt(0).toUpperCase()
              )}
            </div>

            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.625rem', color: '#64748b' }}>
                {currentUser.role.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 7px', fontSize: '0.6875rem', flexShrink: 0, gap: '4px' }}
              title="Mon profil, photo et paramètres de sécurité"
            >
              <Settings size={12} color="#2563eb" />
              <span>Profil</span>
            </button>
          )}
        </div>

        <div style={{ fontSize: '0.6875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={12} color="#059669" />
          <span>Protection RLS & Audit active</span>
        </div>
      </div>
    </aside>
  );
};
