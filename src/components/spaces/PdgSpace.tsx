import React, { useState } from 'react';
import { 
  Crown, 
  Activity, 
  History, 
  FileSearch,
  ChevronRight,
  ShieldAlert,
  Send,
  MessageSquare
} from 'lucide-react';
import { useALUStore } from '../../services/store';
import { PdgSupervisionModule } from '../modules/PdgSupervisionModule';
import { InventoryTreatmentModule } from '../modules/InventoryTreatmentModule';
import { ArchivesModule } from '../modules/ArchivesModule';
import { AuditLogView } from '../AuditLogView';

export const PdgSpace: React.FC = () => {
  const store = useALUStore();
  const inventories = store.getInventories();
  const shops = store.getShops();

  const [activeTab, setActiveTab] = useState<'SUPERVISION' | 'TREATMENT' | 'ARCHIVES' | 'AUDIT'>('SUPERVISION');
  const [selectedInventoryForTreatment, setSelectedInventoryForTreatment] = useState<string | undefined>(undefined);

  const readyCount = inventories.filter(i => i.status === 'Prêt pour validation').length;
  const closedCount = inventories.filter(i => i.status === 'Validé et clôturé').length;

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 60px)', backgroundColor: '#f8fafc' }}>
      
      {/* ── SIDEBAR VERTICALE À GAUCHE (MODULES DU PDG) ── */}
      <nav style={{
        width: '280px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '16px 8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          
          {/* En-tête Espace PDG */}
          <div style={{
            padding: '10px 12px 14px 12px',
            borderBottom: '1px solid #f1f5f9',
            marginBottom: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: '#b45309',
                backgroundImage: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(180, 83, 9, 0.25)'
              }}>
                <Crown size={16} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400e' }}>
                Haute Direction (PDG)
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              Créateur &amp; Fondateur Souverain
            </div>
          </div>

          <div style={{ padding: '6px 12px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Arbitrage &amp; Supervision
          </div>

          {/* 1. Supervision & Arbitrage */}
          <button
            onClick={() => setActiveTab('SUPERVISION')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'SUPERVISION' ? '#fef3c7' : 'transparent',
              color: activeTab === 'SUPERVISION' ? '#92400e' : '#334155',
              fontWeight: activeTab === 'SUPERVISION' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Crown size={17} color={activeTab === 'SUPERVISION' ? '#b45309' : '#64748b'} />
              <span>1. Supervision &amp; Arbitrage</span>
            </div>
            {activeTab === 'SUPERVISION' && <ChevronRight size={14} color="#b45309" />}
          </button>

          {/* 2. Traitement des Inventaires */}
          <button
            onClick={() => setActiveTab('TREATMENT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'TREATMENT' ? '#fef3c7' : 'transparent',
              color: activeTab === 'TREATMENT' ? '#92400e' : '#334155',
              fontWeight: activeTab === 'TREATMENT' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={17} color={activeTab === 'TREATMENT' ? '#b45309' : '#64748b'} />
              <span>2. Traitement Inventaires</span>
            </div>
            {activeTab === 'TREATMENT' && <ChevronRight size={14} color="#b45309" />}
          </button>

          <div style={{ padding: '12px 12px 6px 12px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Validation &amp; Audit
          </div>

          {/* 3. Archives */}
          <button
            onClick={() => setActiveTab('ARCHIVES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'ARCHIVES' ? '#fef3c7' : 'transparent',
              color: activeTab === 'ARCHIVES' ? '#92400e' : '#334155',
              fontWeight: activeTab === 'ARCHIVES' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={17} color={activeTab === 'ARCHIVES' ? '#b45309' : '#64748b'} />
              <span>3. Clôtures &amp; PV Scellés</span>
            </div>
            {activeTab === 'ARCHIVES' && <ChevronRight size={14} color="#b45309" />}
          </button>

          {/* 4. Journal d'Audit */}
          <button
            onClick={() => setActiveTab('AUDIT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'AUDIT' ? '#fef3c7' : 'transparent',
              color: activeTab === 'AUDIT' ? '#92400e' : '#334155',
              fontWeight: activeTab === 'AUDIT' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileSearch size={17} color={activeTab === 'AUDIT' ? '#b45309' : '#64748b'} />
              <span>4. Journal d'Audit Intégral</span>
            </div>
            {activeTab === 'AUDIT' && <ChevronRight size={14} color="#b45309" />}
          </button>
        </div>

        {/* Indicateurs Direction en bas de la sidebar */}
        <div style={{
          backgroundColor: '#fefce8',
          border: '1px solid #fef08a',
          borderRadius: '8px',
          padding: '10px',
          margin: '0 4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem' }}>
            <span style={{ color: '#854d0e' }}>Arbitrages requis :</span>
            <strong style={{ color: '#b45309' }}>{readyCount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: '#854d0e' }}>Clôturés scellés :</span>
            <strong style={{ color: '#15803d' }}>{closedCount}</strong>
          </div>
        </div>
      </nav>

      {/* ── ZONE DE TRAVAIL PRINCIPALE (À DROITE DE LA SIDEBAR) ── */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {activeTab === 'SUPERVISION' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <PdgSupervisionModule
                onNavigateToTreatment={(invId: string) => {
                  setSelectedInventoryForTreatment(invId);
                  setActiveTab('TREATMENT');
                }}
              />
            </div>
          )}

          {activeTab === 'TREATMENT' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <InventoryTreatmentModule initialInventoryId={selectedInventoryForTreatment} />
            </div>
          )}

          {activeTab === 'ARCHIVES' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <ArchivesModule />
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <AuditLogView />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
