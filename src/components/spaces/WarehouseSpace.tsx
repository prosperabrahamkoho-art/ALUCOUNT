import React, { useState } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  History, 
  ChevronRight,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useALUStore } from '../../services/store';
import { CatalogView } from '../CatalogView';
import { DiscrepanciesModule } from '../modules/DiscrepanciesModule';
import { ArchivesModule } from '../modules/ArchivesModule';

export const WarehouseSpace: React.FC = () => {
  const store = useALUStore();
  const catalog = store.getCatalog();
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'DISCREPANCIES' | 'ARCHIVES'>('CATALOG');

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 60px)', backgroundColor: '#f8fafc' }}>
      
      {/* ── SIDEBAR VERTICALE À GAUCHE (MODULES DU MAGASINIER) ── */}
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
          
          {/* En-tête Espace Magasinier */}
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
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Boxes size={16} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1d4ed8' }}>
                Magasin Central
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              Monopole Articles, Couleurs &amp; Tarifs
            </div>
          </div>

          <div style={{ padding: '6px 12px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Gestion des Articles
          </div>

          {/* 1. Catalogue & Tarifs */}
          <button
            onClick={() => setActiveTab('CATALOG')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'CATALOG' ? '#eff6ff' : 'transparent',
              color: activeTab === 'CATALOG' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'CATALOG' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={17} color={activeTab === 'CATALOG' ? '#1d4ed8' : '#64748b'} />
              <span>1. Catalogue &amp; Tarifs Officiels</span>
            </div>
            {activeTab === 'CATALOG' && <ChevronRight size={14} color="#1d4ed8" />}
          </button>

          <div style={{ padding: '12px 12px 6px 12px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Écarts &amp; Consultation
          </div>

          {/* 2. Rapprochement des écarts */}
          <button
            onClick={() => setActiveTab('DISCREPANCIES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'DISCREPANCIES' ? '#eff6ff' : 'transparent',
              color: activeTab === 'DISCREPANCIES' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'DISCREPANCIES' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={17} color={activeTab === 'DISCREPANCIES' ? '#1d4ed8' : '#64748b'} />
              <span>2. Écarts &amp; Freinte Matière</span>
            </div>
            {activeTab === 'DISCREPANCIES' && <ChevronRight size={14} color="#1d4ed8" />}
          </button>

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
              backgroundColor: activeTab === 'ARCHIVES' ? '#eff6ff' : 'transparent',
              color: activeTab === 'ARCHIVES' ? '#1d4ed8' : '#334155',
              fontWeight: activeTab === 'ARCHIVES' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={17} color={activeTab === 'ARCHIVES' ? '#1d4ed8' : '#64748b'} />
              <span>3. Inventaires Clôturés &amp; PV</span>
            </div>
            {activeTab === 'ARCHIVES' && <ChevronRight size={14} color="#1d4ed8" />}
          </button>
        </div>

        {/* Info Magasin en bas de sidebar */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '10px',
          margin: '0 4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: '#1e40af' }}>Articles Référencés :</span>
            <strong style={{ color: '#1d4ed8' }}>{catalog.length}</strong>
          </div>
        </div>
      </nav>

      {/* ── ZONE DE TRAVAIL PRINCIPALE (À DROITE DE LA SIDEBAR) ── */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {activeTab === 'CATALOG' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <CatalogView />
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
