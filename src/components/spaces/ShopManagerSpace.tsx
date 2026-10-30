import React, { useState } from 'react';
import { 
  Store, 
  BarChart3, 
  History, 
  ChevronRight,
  ShieldCheck,
  Boxes
} from 'lucide-react';
import { useALUStore } from '../../services/store';
import { InventoriesListView } from '../InventoriesListView';
import { ReportsView } from '../ReportsView';
import { ArchivesModule } from '../modules/ArchivesModule';

export const ShopManagerSpace: React.FC = () => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const shops = store.getShops();
  const userShop = shops.find(s => s.id === currentUser.shopId) || shops[0];

  const [activeTab, setActiveTab] = useState<'INVENTORIES' | 'REPORTS' | 'ARCHIVES'>('INVENTORIES');

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 60px)', backgroundColor: '#f8fafc' }}>
      
      {/* ── SIDEBAR VERTICALE À GAUCHE (MODULES DU CHEF BOUTIQUE) ── */}
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
          
          {/* En-tête Espace Chef Boutique */}
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
                backgroundColor: '#059669',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Store size={16} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46' }}>
                Chef d'Agence
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              Boutique : {userShop ? userShop.name : 'Mon Agence'}
            </div>
          </div>

          <div style={{ padding: '6px 12px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Activité de la Boutique
          </div>

          {/* 1. Inventaires de l'agence */}
          <button
            onClick={() => setActiveTab('INVENTORIES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'INVENTORIES' ? '#f0fdf4' : 'transparent',
              color: activeTab === 'INVENTORIES' ? '#059669' : '#334155',
              fontWeight: activeTab === 'INVENTORIES' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Boxes size={17} color={activeTab === 'INVENTORIES' ? '#059669' : '#64748b'} />
              <span>1. Inventaires de mon Agence</span>
            </div>
            {activeTab === 'INVENTORIES' && <ChevronRight size={14} color="#059669" />}
          </button>

          {/* 2. Rapports & Bilans */}
          <button
            onClick={() => setActiveTab('REPORTS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'REPORTS' ? '#f0fdf4' : 'transparent',
              color: activeTab === 'REPORTS' ? '#059669' : '#334155',
              fontWeight: activeTab === 'REPORTS' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={17} color={activeTab === 'REPORTS' ? '#059669' : '#64748b'} />
              <span>2. Bilans &amp; Statistiques</span>
            </div>
            {activeTab === 'REPORTS' && <ChevronRight size={14} color="#059669" />}
          </button>

          <div style={{ padding: '12px 12px 6px 12px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Historique Officiel
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
              backgroundColor: activeTab === 'ARCHIVES' ? '#f0fdf4' : 'transparent',
              color: activeTab === 'ARCHIVES' ? '#059669' : '#334155',
              fontWeight: activeTab === 'ARCHIVES' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={17} color={activeTab === 'ARCHIVES' ? '#059669' : '#64748b'} />
              <span>3. Inventaires Clôturés</span>
            </div>
            {activeTab === 'ARCHIVES' && <ChevronRight size={14} color="#059669" />}
          </button>
        </div>

        {/* Emplacement info boutique */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '10px',
          margin: '0 4px',
          fontSize: '0.75rem',
          color: '#166534'
        }}>
          Agence certifiée : <strong>{userShop ? userShop.name : 'ALUTRACO'}</strong>
        </div>
      </nav>

      {/* ── ZONE DE TRAVAIL PRINCIPALE (À DROITE DE LA SIDEBAR) ── */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {activeTab === 'INVENTORIES' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <InventoriesListView onOpenCounting={() => {}} onOpenControl={() => {}} />
            </div>
          )}

          {activeTab === 'REPORTS' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <ReportsView />
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
