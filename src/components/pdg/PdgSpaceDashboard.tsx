import React, { useState } from 'react';
import { 
  Crown, 
  Building2, 
  Eye, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileSpreadsheet, 
  ShieldCheck, 
  FileText, 
  Store, 
  Boxes, 
  History, 
  FileSearch,
  Activity,
  ArrowRight,
  LogOut,
  UserCheck,
  Search,
  Sliders,
  DollarSign,
  TrendingUp,
  AlertOctagon
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../../services/store';
import { Inventory, Shop, UserRole } from '../../types';
import { PdgSupervisionModule } from '../modules/PdgSupervisionModule';
import { InventoryTreatmentModule } from '../modules/InventoryTreatmentModule';
import { ArchivesModule } from '../modules/ArchivesModule';
import { AuditLogView } from '../AuditLogView';
import { CatalogView } from '../CatalogView';
import { ShopsView } from '../ShopsView';

interface PdgSpaceDashboardProps {
  onSwitchWorkspace?: (role: UserRole) => void;
  onOpenReportModal?: (inv: Inventory) => void;
}

type PdgTab = 
  | 'SUPERVISION' 
  | 'TREATMENT' 
  | 'SHOPS' 
  | 'CATALOG' 
  | 'ARCHIVES' 
  | 'AUDIT';

export const PdgSpaceDashboard: React.FC<PdgSpaceDashboardProps> = ({
  onSwitchWorkspace,
  onOpenReportModal
}) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const users = store.getUsers();
  const inventories = store.getInventories();
  const shops = store.getShops();
  const catalog = store.getCatalog();

  const [activeTab, setActiveTab] = useState<PdgTab>('SUPERVISION');
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | undefined>(inventories[0]?.id);

  // Statistiques Haute Direction
  const totalInventoriesCount = inventories.length;
  const closedInventoriesCount = inventories.filter(i => i.status === 'Validé et clôturé').length;
  const inProgressInventoriesCount = inventories.filter(i => i.status !== 'Validé et clôturé').length;
  const readyForArbitrationCount = inventories.filter(i => i.status === 'Prêt pour validation' || i.status === 'En contrôle').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc' }}>
      
      {/* ── HEADER SOUVERAIN HAUTE DIRECTION ── */}
      <header style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }}>
        {/* Identité Haute Direction */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            backgroundColor: '#f59e0b',
            backgroundImage: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
            fontWeight: 900,
            fontSize: '1.25rem',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
          }}>
            <Crown size={24} color="#0f172a" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.0625rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>
                ESPACE HAUTE DIRECTION PDG
              </span>
              <span style={{
                fontSize: '0.625rem',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#facc15',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 800,
                border: '1px solid rgba(245, 158, 11, 0.3)',
                letterSpacing: '0.5px'
              }}>
                FONDATEUR &amp; CRÉATEUR DE L'ENTREPRISE
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Supervision Souveraine • Arbitrage Impartial • Spectre d'accès à 100% des Données ALUTRACO
            </div>
          </div>
        </div>

        {/* Sélecteur d'espaces & Profil Connecté */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Badge utilisateur actuel */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #334155'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8125rem'
            }}>
              P
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#facc15' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>
                Président Directeur Général (Spectateur Souverain)
              </div>
            </div>
          </div>

          {/* Switcher d'espace direct */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            padding: '4px 10px',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600 }}>Basculer vers un autre espace :</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                store.switchUser(e.target.value);
              }}
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Changer d'espace utilisateur"
            >
              <optgroup label="👑 Haute Direction — Fondateur & Créateur">
                {users.filter(u => u.role === 'PDG' || u.role === 'DG' || u.role === 'ADJOINT_PDG').map(u => (
                  <option key={u.id} value={u.id} style={{ backgroundColor: '#0f172a', color: '#facc15' }}>
                    👑 {u.name} (Espace PDG)
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏢 Secrétariat de Direction">
                {users.filter(u => u.role === 'SECRETAIRE_DIRECTION').map(u => (
                  <option key={u.id} value={u.id} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                    🏢 {u.name} (Espace Secrétariat)
                  </option>
                ))}
              </optgroup>
              <optgroup label="📦 Magasin Central — Tarifs & Articles">
                {users.filter(u => u.role === 'MAGASINIER').map(u => (
                  <option key={u.id} value={u.id} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                    📦 {u.name} (Espace Magasinier)
                  </option>
                ))}
              </optgroup>
              <optgroup label="🛡️ Administration SaaS">
                {users.filter(u => u.role === 'ADMIN').map(u => (
                  <option key={u.id} value={u.id} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                    🛡️ {u.name} (Espace Admin SaaS)
                  </option>
                ))}
              </optgroup>
              <optgroup label="🔍 Contrôle & Audit">
                {users.filter(u => u.role === 'CONTROLEUR' || u.role === 'RESPONSABLE_INVENTAIRE').map(u => (
                  <option key={u.id} value={u.id} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                    🔍 {u.name} ({u.role})
                  </option>
                ))}
              </optgroup>
              <optgroup label="📋 Inventoristes Terrain">
                {users.filter(u => u.role === 'INVENTORISTE').map(u => (
                  <option key={u.id} value={u.id} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                    📋 {u.name} (Comptage Terrain)
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏪 Responsables Boutiques">
                {users.filter(u => u.role === 'RESPONSABLE_BOUTIQUE').map(u => (
                  <option key={u.id} value={u.id} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                    🏪 {u.name} (Espace Boutique)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </header>

      {/* ── CORPS DE L'ESPACE PDG : BARRE LATÉRALE ET ZONE DE TRAVAIL ── */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* Navigation Propre à l'Espace PDG */}
        <nav style={{
          width: '270px',
          backgroundColor: '#0b1120',
          borderRight: '1px solid #1e293b',
          padding: '16px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flexShrink: 0
        }}>
          <div style={{ padding: '6px 12px 10px', fontSize: '0.6875rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px' }}>
            👑 PRÉROGATIVES HAUTE DIRECTION
          </div>

          <button
            onClick={() => setActiveTab('SUPERVISION')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'SUPERVISION' ? '#f59e0b' : 'transparent',
              color: activeTab === 'SUPERVISION' ? '#0f172a' : '#cbd5e1',
              fontWeight: activeTab === 'SUPERVISION' ? 800 : 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <Crown size={17} color={activeTab === 'SUPERVISION' ? '#0f172a' : '#f59e0b'} />
            <span>1. Supervision & Arbitrage</span>
          </button>

          <button
            onClick={() => setActiveTab('TREATMENT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'TREATMENT' ? '#f59e0b' : 'transparent',
              color: activeTab === 'TREATMENT' ? '#0f172a' : '#cbd5e1',
              fontWeight: activeTab === 'TREATMENT' ? 800 : 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <Activity size={17} color={activeTab === 'TREATMENT' ? '#0f172a' : '#38bdf8'} />
            <span>2. Traitement des Inventaires</span>
          </button>

          <button
            onClick={() => setActiveTab('ARCHIVES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'ARCHIVES' ? '#f59e0b' : 'transparent',
              color: activeTab === 'ARCHIVES' ? '#0f172a' : '#cbd5e1',
              fontWeight: activeTab === 'ARCHIVES' ? 800 : 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <History size={17} color={activeTab === 'ARCHIVES' ? '#0f172a' : '#a855f7'} />
            <span>3. Inventaires Clôturés & PV</span>
          </button>

          <div style={{ padding: '16px 12px 6px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🏢 VUE GLOBALE ENTREPRISE
          </div>

          <button
            onClick={() => setActiveTab('SHOPS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'SHOPS' ? '#f59e0b' : 'transparent',
              color: activeTab === 'SHOPS' ? '#0f172a' : '#cbd5e1',
              fontWeight: activeTab === 'SHOPS' ? 800 : 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <Store size={17} color={activeTab === 'SHOPS' ? '#0f172a' : '#10b981'} />
            <span>4. Réseau des Boutiques ({shops.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CATALOG')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'CATALOG' ? '#f59e0b' : 'transparent',
              color: activeTab === 'CATALOG' ? '#0f172a' : '#cbd5e1',
              fontWeight: activeTab === 'CATALOG' ? 800 : 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <Boxes size={17} color={activeTab === 'CATALOG' ? '#0f172a' : '#f97316'} />
            <span>5. Tarifs & Articles ({catalog.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'AUDIT' ? '#f59e0b' : 'transparent',
              color: activeTab === 'AUDIT' ? '#0f172a' : '#cbd5e1',
              fontWeight: activeTab === 'AUDIT' ? 800 : 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <FileSearch size={17} color={activeTab === 'AUDIT' ? '#0f172a' : '#ef4444'} />
            <span>6. Journal d'Audit Intégral</span>
          </button>

          {/* Indicateur de rôle souverain */}
          <div style={{ marginTop: 'auto', padding: '14px', backgroundColor: 'rgba(245, 158, 11, 0.08)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15', fontSize: '0.75rem', fontWeight: 800 }}>
              <ShieldCheck size={16} />
              <span>Pouvoir Spectateur</span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Accès souverain total sans saisie physique. Vos annotations et arbitrages font foi pour la clôture définitive.
            </p>
          </div>
        </nav>

        {/* Zone de travail du PDG */}
        <main style={{ flex: 1, padding: '24px', backgroundColor: '#0f172a', overflowY: 'auto' }}>
          
          {/* ONGLET 1 : SUPERVISION & ARBITRAGE DU PDG */}
          {activeTab === 'SUPERVISION' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Résumé exécutif en haut de page */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Dossiers Inventaires Totaux</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#facc15', margin: '4px 0' }}>{totalInventoriesCount}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Sur l'ensemble des {shops.length} agences</div>
                </div>

                <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>En attente d'Arbitrage PDG</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f59e0b', margin: '4px 0' }}>{readyForArbitrationCount}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#eab308' }}>Nécessitent votre décision ou annotation</div>
                </div>

                <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Inventaires Validés &amp; Clôturés</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>{closedInventoriesCount}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#34d399' }}>Scellés irrévocablement avec PV</div>
                </div>

                <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Boutiques / Dépôts Actifs</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38bdf8', margin: '4px 0' }}>{shops.length}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#7dd3fc' }}>Toutes rattachées à ALUTRACO</div>
                </div>
              </div>

              {/* Module de supervision souveraine */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', color: '#0f172a' }}>
                <PdgSupervisionModule
                  onOpenReport={(inv) => {
                    if (onOpenReportModal) onOpenReportModal(inv);
                  }}
                  onNavigateToTreatment={(invId) => {
                    setSelectedInventoryId(invId);
                    setActiveTab('TREATMENT');
                  }}
                />
              </div>
            </div>
          )}

          {/* ONGLET 2 : TRAITEMENT DE L'INVENTAIRE */}
          {activeTab === 'TREATMENT' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', color: '#0f172a' }}>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Consultation Haute Direction du Traitement Métier
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                    Le PDG consulte l'intégralité des calculs : stock initial modifiable, pourcentage libre de commission, ventes reportées et dettes clients.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('SUPERVISION')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Crown size={14} color="#d97706" />
                  <span>Retour à l'Arbitrage PDG</span>
                </button>
              </div>

              <InventoryTreatmentModule initialInventoryId={selectedInventoryId} />
            </div>
          )}

          {/* ONGLET 3 : ARCHIVES & INVENTAIRES CLÔTURÉS */}
          {activeTab === 'ARCHIVES' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', color: '#0f172a' }}>
              <ArchivesModule />
            </div>
          )}

          {/* ONGLET 4 : RÉSEAU DES BOUTIQUES & CHEFS ASSIGNÉS */}
          {activeTab === 'SHOPS' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', color: '#0f172a' }}>
              <ShopsView />
            </div>
          )}

          {/* ONGLET 5 : TARIFS ET CATALOGUE OFFICIEL */}
          {activeTab === 'CATALOG' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', color: '#0f172a' }}>
              <CatalogView />
            </div>
          )}

          {/* ONGLET 6 : JOURNAL D'AUDIT COMPLET */}
          {activeTab === 'AUDIT' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', color: '#0f172a' }}>
              <AuditLogView />
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
