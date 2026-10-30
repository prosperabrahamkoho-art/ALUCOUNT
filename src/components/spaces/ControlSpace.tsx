import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Activity, 
  AlertTriangle, 
  History, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useALUStore } from '../../services/store';
import { ControlReviewView } from '../ControlReviewView';
import { InventoryTreatmentModule } from '../modules/InventoryTreatmentModule';
import { DiscrepanciesModule } from '../modules/DiscrepanciesModule';
import { ArchivesModule } from '../modules/ArchivesModule';

export const ControlSpace: React.FC = () => {
  const store = useALUStore();
  const [activeTab, setActiveTab] = useState<'REVIEW' | 'TREATMENT' | 'DISCREPANCIES' | 'ARCHIVES'>('REVIEW');
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | undefined>(undefined);

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 60px)', backgroundColor: '#f8fafc' }}>
      
      {/* ── SIDEBAR VERTICALE À GAUCHE (MODULES DU CONTRÔLE) ── */}
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
          
          {/* En-tête Espace Contrôle */}
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
                backgroundColor: '#ea580c',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={16} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c2410c' }}>
                Espace Contrôle
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              Traitement Officiel &amp; Certification
            </div>
          </div>

          <div style={{ padding: '6px 12px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Vérification &amp; Traitement
          </div>

          {/* 1. Vérification */}
          <button
            onClick={() => setActiveTab('REVIEW')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'REVIEW' ? '#fff7ed' : 'transparent',
              color: activeTab === 'REVIEW' ? '#ea580c' : '#334155',
              fontWeight: activeTab === 'REVIEW' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={17} color={activeTab === 'REVIEW' ? '#ea580c' : '#64748b'} />
              <span>1. Vérification Comptages</span>
            </div>
            {activeTab === 'REVIEW' && <ChevronRight size={14} color="#ea580c" />}
          </button>

          {/* 2. Traitement officiel */}
          <button
            onClick={() => setActiveTab('TREATMENT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'TREATMENT' ? '#fff7ed' : 'transparent',
              color: activeTab === 'TREATMENT' ? '#ea580c' : '#334155',
              fontWeight: activeTab === 'TREATMENT' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={17} color={activeTab === 'TREATMENT' ? '#ea580c' : '#64748b'} />
              <span>2. Traitement Officiel</span>
            </div>
            {activeTab === 'TREATMENT' && <ChevronRight size={14} color="#ea580c" />}
          </button>

          <div style={{ padding: '12px 12px 6px 12px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Rapprochement &amp; Archives
          </div>

          {/* 3. Écarts */}
          <button
            onClick={() => setActiveTab('DISCREPANCIES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'DISCREPANCIES' ? '#fff7ed' : 'transparent',
              color: activeTab === 'DISCREPANCIES' ? '#ea580c' : '#334155',
              fontWeight: activeTab === 'DISCREPANCIES' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={17} color={activeTab === 'DISCREPANCIES' ? '#ea580c' : '#64748b'} />
              <span>3. Écarts &amp; Freinte</span>
            </div>
            {activeTab === 'DISCREPANCIES' && <ChevronRight size={14} color="#ea580c" />}
          </button>

          {/* 4. Archives */}
          <button
            onClick={() => setActiveTab('ARCHIVES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'ARCHIVES' ? '#fff7ed' : 'transparent',
              color: activeTab === 'ARCHIVES' ? '#ea580c' : '#334155',
              fontWeight: activeTab === 'ARCHIVES' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={17} color={activeTab === 'ARCHIVES' ? '#ea580c' : '#64748b'} />
              <span>4. Inventaires Clôturés &amp; PV</span>
            </div>
            {activeTab === 'ARCHIVES' && <ChevronRight size={14} color="#ea580c" />}
          </button>
        </div>

        {/* Note de conformité contrôle */}
        <div style={{
          backgroundColor: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '8px',
          padding: '10px',
          margin: '0 4px',
          fontSize: '0.75rem',
          color: '#9a3412'
        }}>
          Stock Initial Boutique &amp; Commission Libre activés
        </div>
      </nav>

      {/* ── ZONE DE TRAVAIL PRINCIPALE (À DROITE DE LA SIDEBAR) ── */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {activeTab === 'REVIEW' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <ControlReviewView
                onOpenTreatment={(invId: string) => {
                  setSelectedInventoryId(invId);
                  setActiveTab('TREATMENT');
                }}
              />
            </div>
          )}

          {activeTab === 'TREATMENT' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <InventoryTreatmentModule initialInventoryId={selectedInventoryId} />
            </div>
          )}

          {activeTab === 'DISCREPANCIES' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <DiscrepanciesModule />
            </div>
          )}

          {activeTab === 'ARCHIVES' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <ArchivesModule />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
