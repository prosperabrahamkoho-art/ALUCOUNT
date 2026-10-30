import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  ScanLine, 
  CheckCircle2, 
  Boxes, 
  Store, 
  KeyRound, 
  FileText, 
  History 
} from 'lucide-react';
import { useALUStore } from '../services/store';

export type NavTab = 
  | 'dashboard' 
  | 'inventories' 
  | 'counting' 
  | 'control' 
  | 'catalog' 
  | 'shops' 
  | 'permissions' 
  | 'reports' 
  | 'audit';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const activePermissions = store.getTemporaryPermissions().filter(p => p.status === 'ACTIVE');

  // Définition des onglets autorisés selon le rôle
  // PDG et MAGASINIER ont accès à tout (canUserAccessModule retourne true pour eux)
  const canAccessDashboard = ['PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR'].includes(currentUser.role);
  const canAccessShops = ['PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR'].includes(currentUser.role);
  const canAccessCounting = ['INVENTORISTE', 'PDG', 'MAGASINIER', 'RESPONSABLE_INVENTAIRE'].includes(currentUser.role);
  const canAccessControl = ['CONTROLEUR', 'RESPONSABLE_INVENTAIRE', 'PDG', 'MAGASINIER'].includes(currentUser.role);
  const canAccessPermissions = ['PDG', 'MAGASINIER', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR'].includes(currentUser.role);
  const canAccessAudit = ['PDG', 'MAGASINIER', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE', 'CONTROLEUR'].includes(currentUser.role);

  return (
    <nav className="nav-tabs-bar">
      <div className="nav-tabs-inner">
        {canAccessDashboard && (
          <button 
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Tableau de Bord</span>
          </button>
        )}

        <button 
          className={`nav-tab-btn ${activeTab === 'inventories' ? 'active' : ''}`}
          onClick={() => onSelectTab('inventories')}
        >
          <ClipboardList size={16} />
          <span>Inventaires</span>
        </button>

        {canAccessCounting && (
          <button 
            className={`nav-tab-btn ${activeTab === 'counting' ? 'active' : ''}`}
            onClick={() => onSelectTab('counting')}
          >
            <ScanLine size={16} />
            <span>Comptage Terrain</span>
          </button>
        )}

        {canAccessControl && (
          <button 
            className={`nav-tab-btn ${activeTab === 'control' ? 'active' : ''}`}
            onClick={() => onSelectTab('control')}
          >
            <CheckCircle2 size={16} />
            <span>Contrôle & Validation</span>
          </button>
        )}

        <button 
          className={`nav-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => onSelectTab('catalog')}
        >
          <Boxes size={16} />
          <span>Catalogue & Prix Officiels</span>
        </button>

        {canAccessShops && (
          <button 
            className={`nav-tab-btn ${activeTab === 'shops' ? 'active' : ''}`}
            onClick={() => onSelectTab('shops')}
          >
            <Store size={16} />
            <span>Boutiques & Invitations</span>
          </button>
        )}

        {canAccessPermissions && (
          <button 
            className={`nav-tab-btn ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => onSelectTab('permissions')}
          >
            <KeyRound size={16} />
            <span>Permissions Temporaires</span>
            {activePermissions.length > 0 && (
              <span style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                fontSize: '0.6875rem',
                borderRadius: '10px',
                padding: '1px 6px',
                fontWeight: 700
              }}>
                {activePermissions.length}
              </span>
            )}
          </button>
        )}

        <button 
          className={`nav-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => onSelectTab('reports')}
        >
          <FileText size={16} />
          <span>Rapports & Synthèses</span>
        </button>

        {canAccessAudit && (
          <button 
            className={`nav-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => onSelectTab('audit')}
          >
            <History size={16} />
            <span>Journal d'Audit</span>
          </button>
        )}
      </div>
    </nav>
  );
};
