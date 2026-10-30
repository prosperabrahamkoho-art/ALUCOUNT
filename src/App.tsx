import React, { useState, useEffect } from 'react';
import './App.css';
import { useALUStore } from './services/store';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ModuleId, Inventory } from './types';
import { ALUCOUNT_MODULES, canUserAccessModule } from './data/modulesConfig';

// Import de l'ensemble des modules complets
import { SaasAdminDashboard } from './components/admin/SaasAdminDashboard';
import { PdgSupervisionModule } from './components/modules/PdgSupervisionModule';
import { AdminSecurityModule } from './components/modules/AdminSecurityModule';
import { UsersModule } from './components/modules/UsersModule';
import { TemporaryPermissionsManager } from './components/TemporaryPermissionsModal';
import { ShopsView } from './components/ShopsView';
import { CatalogView } from './components/CatalogView';
import { CampaignsModule } from './components/modules/CampaignsModule';
import { CountingModuleView } from './components/CountingModuleView';
import { ControlReviewView } from './components/ControlReviewView';
import { DiscrepanciesModule } from './components/modules/DiscrepanciesModule';
import { InventoryTreatmentModule } from './components/modules/InventoryTreatmentModule';
import { HistoryReopenModule } from './components/modules/HistoryReopenModule';
import { ReportsView } from './components/ReportsView';
import { ArchivesModule } from './components/modules/ArchivesModule';
import { NotificationsModule } from './components/modules/NotificationsModule';
import { AuditLogView } from './components/AuditLogView';

// Modals
import { SecurityGuideModal } from './components/SecurityGuideModal';
import { OfficialReportModal } from './components/OfficialReportModal';
import { UserSettingsModal } from './components/modules/UserSettingsModal';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();

  // Module actif par défaut selon le rôle
  const getDefaultModuleForRole = (role: string): ModuleId => {
    switch (role) {
      case 'ADMIN': return '02_admin_security';
      case 'PDG':
      case 'DG':
      case 'ADJOINT_PDG': return '01_pdg_supervision';
      case 'MAGASINIER': return '06_catalog_tariffs';
      case 'SECRETAIRE_DIRECTION': return '03_users';
      case 'CONTROLEUR':
      case 'RESPONSABLE_INVENTAIRE': return '09_control_verification';
      case 'INVENTORISTE': return '08_physical_counting';
      case 'RESPONSABLE_BOUTIQUE': return '05_shops';
      default: return '01_pdg_supervision';
    }
  };

  const [activeModule, setActiveModule] = useState<ModuleId>(() => getDefaultModuleForRole(currentUser.role));
  const [isAdminConsoleView, setIsAdminConsoleView] = useState<boolean>(currentUser.role === 'ADMIN');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals d'actions
  const [showSecurityGuide, setShowSecurityGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedReportInventory, setSelectedReportInventory] = useState<Inventory | null>(null);

  // Synchroniser le module par défaut lors d'un changement de profil dans le coin droit
  useEffect(() => {
    const defaultMod = getDefaultModuleForRole(currentUser.role);
    setActiveModule(defaultMod);
    setIsAdminConsoleView(currentUser.role === 'ADMIN');
  }, [currentUser.id]);

  // Rendu du module sélectionné
  const renderModuleContent = () => {
    // Vérification de sécurité des permissions d'accès au module
    if (!canUserAccessModule(currentUser.role, activeModule)) {
      return (
        <div className="card" style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center', padding: '40px 30px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            border: '2px solid #fecaca',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Accès Strictement Restreint (Principe de Cloisonnement)
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '24px' }}>
            Votre profil actuel (<strong>{currentUser.role.replace(/_/g, ' ')}</strong>) n'a pas les droits nécessaires pour accéder à ce module.
          </p>
          <button
            onClick={() => setActiveModule(getDefaultModuleForRole(currentUser.role))}
            className="btn btn-primary"
            style={{ margin: '0 auto' }}
          >
            <span>Retourner à mon espace principal</span>
            <ArrowRight size={16} />
          </button>
        </div>
      );
    }

    // Si Administrateur SaaS en mode Console Développeur & Système
    if (currentUser.role === 'ADMIN' && isAdminConsoleView && activeModule === '02_admin_security') {
      return (
        <SaasAdminDashboard
          onSwitchToBusinessView={() => setIsAdminConsoleView(false)}
          onNavigateToModule={(modId) => {
            setActiveModule(modId);
            setIsAdminConsoleView(false);
          }}
        />
      );
    }

    switch (activeModule) {
      // 1. Haute Direction & Administration
      case '01_pdg_supervision':
        return (
          <PdgSupervisionModule
            onOpenReport={(inv) => setSelectedReportInventory(inv)}
            onNavigateToTreatment={(invId) => {
              setActiveModule('11_validation_closing');
            }}
          />
        );

      case '02_admin_security':
        return <AdminSecurityModule />;

      case '03_users':
        return <UsersModule />;

      case '04_roles_permissions':
        return <TemporaryPermissionsManager />;

      case '05_shops':
        return <ShopsView />;

      // 2. Gestion des articles & des inventaires
      case '06_catalog_tariffs':
        return <CatalogView />;

      case '07_campaigns':
        return (
          <CampaignsModule
            onStartInventoryFromCampaign={() => setActiveModule('08_physical_counting')}
          />
        );

      case '08_physical_counting':
        return (
          <CountingModuleView
            onSubmittedToControl={() => setActiveModule('09_control_verification')}
          />
        );

      case '09_control_verification':
        return (
          <ControlReviewView
            onOpenTreatment={(invId) => setActiveModule('11_validation_closing')}
            onOpenReport={(inv) => setSelectedReportInventory(inv)}
          />
        );

      case '10_discrepancies':
        return <DiscrepanciesModule />;

      case '11_validation_closing':
        return <InventoryTreatmentModule />;

      case '12_history_reopen':
        return (
          <HistoryReopenModule
            onOpenReport={(inv) => setSelectedReportInventory(inv)}
          />
        );

      // 3. Consultation, notifications & suivi
      case '13_reports_stats':
        return (
          <ReportsView
            onViewReport={(inv) => setSelectedReportInventory(inv)}
          />
        );

      case '14_documents_exports':
      case '17_archives':
        return (
          <ArchivesModule
            onOpenReport={(inv) => setSelectedReportInventory(inv)}
          />
        );

      case '15_notifications':
        return (
          <NotificationsModule
            onNavigateToModule={(modId) => setActiveModule(modId)}
          />
        );

      case '16_audit_security':
        return <AuditLogView />;

      default:
        return <PdgSupervisionModule />;
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex' }}>
      
      {/* ── SIDEBAR VERTICALE COMPLÈTE AVEC TOUS LES MODULES (01 À 17, NOTIFICATIONS, ETC.) ── */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={(modId) => {
          setActiveModule(modId);
          setIsAdminConsoleView(false);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* ── ZONE PRINCIPALE À DROITE ── */}
      <div className="content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Header avec sélecteur vertical dans le coin droit */}
        <Header
          activeModule={activeModule}
          onSelectModule={(modId) => setActiveModule(modId)}
          onOpenSecurityGuide={() => setShowSecurityGuide(true)}
          onOpenNotifications={() => setActiveModule('15_notifications')}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSettings={() => setShowSettings(true)}
          onToggleAdminView={() => setIsAdminConsoleView(!isAdminConsoleView)}
        />

        {/* Contenu du module sélectionné */}
        <main className="main-content" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {renderModuleContent()}
        </main>
      </div>

      {/* ── MODALES GLOBALES ── */}
      {showSecurityGuide && (
        <SecurityGuideModal onClose={() => setShowSecurityGuide(false)} />
      )}

      {showSettings && (
        <UserSettingsModal onClose={() => setShowSettings(false)} />
      )}

      {selectedReportInventory && (
        <OfficialReportModal
          inventory={selectedReportInventory}
          onClose={() => setSelectedReportInventory(null)}
        />
      )}
    </div>
  );
};

export default App;
