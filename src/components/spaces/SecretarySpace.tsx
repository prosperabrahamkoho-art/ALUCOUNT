import React, { useState } from 'react';
import { 
  Building2, 
  Store, 
  Users, 
  CalendarRange, 
  History,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useALUStore } from '../../services/store';
import { ShopsView } from '../ShopsView';
import { UsersModule } from '../modules/UsersModule';
import { CampaignsModule } from '../modules/CampaignsModule';
import { ArchivesModule } from '../modules/ArchivesModule';

export const SecretarySpace: React.FC = () => {
  const store = useALUStore();
  const shops = store.getShops();
  const users = store.getUsers();

  const [activeTab, setActiveTab] = useState<'SHOPS' | 'USERS' | 'CAMPAIGNS' | 'ARCHIVES'>('SHOPS');

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 60px)', backgroundColor: '#f8fafc' }}>
      
      {/* ── SIDEBAR VERTICALE À GAUCHE (MODULES DU SECRÉTARIAT) ── */}
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
          
          {/* En-tête Espace Secrétariat */}
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
                backgroundColor: '#0891b2',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={16} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0e7490' }}>
                Secrétariat de Direction
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              Administration Générale &amp; Affectations
            </div>
          </div>

          <div style={{ padding: '6px 12px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Organisation &amp; Équipes
          </div>

          {/* 1. Création Boutiques */}
          <button
            onClick={() => setActiveTab('SHOPS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'SHOPS' ? '#ecfeff' : 'transparent',
              color: activeTab === 'SHOPS' ? '#0891b2' : '#334155',
              fontWeight: activeTab === 'SHOPS' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Store size={17} color={activeTab === 'SHOPS' ? '#0891b2' : '#64748b'} />
              <span>1. Boutiques &amp; Chefs</span>
            </div>
            {activeTab === 'SHOPS' && <ChevronRight size={14} color="#0891b2" />}
          </button>

          {/* 2. Gestion Utilisateurs */}
          <button
            onClick={() => setActiveTab('USERS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'USERS' ? '#ecfeff' : 'transparent',
              color: activeTab === 'USERS' ? '#0891b2' : '#334155',
              fontWeight: activeTab === 'USERS' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={17} color={activeTab === 'USERS' ? '#0891b2' : '#64748b'} />
              <span>2. Utilisateurs &amp; Invitations</span>
            </div>
            {activeTab === 'USERS' && <ChevronRight size={14} color="#0891b2" />}
          </button>

          <div style={{ padding: '12px 12px 6px 12px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Planification &amp; Historique
          </div>

          {/* 3. Campagnes */}
          <button
            onClick={() => setActiveTab('CAMPAIGNS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'CAMPAIGNS' ? '#ecfeff' : 'transparent',
              color: activeTab === 'CAMPAIGNS' ? '#0891b2' : '#334155',
              fontWeight: activeTab === 'CAMPAIGNS' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CalendarRange size={17} color={activeTab === 'CAMPAIGNS' ? '#0891b2' : '#64748b'} />
              <span>3. Planification Inventaires</span>
            </div>
            {activeTab === 'CAMPAIGNS' && <ChevronRight size={14} color="#0891b2" />}
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
              backgroundColor: activeTab === 'ARCHIVES' ? '#ecfeff' : 'transparent',
              color: activeTab === 'ARCHIVES' ? '#0891b2' : '#334155',
              fontWeight: activeTab === 'ARCHIVES' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={17} color={activeTab === 'ARCHIVES' ? '#0891b2' : '#64748b'} />
              <span>4. Inventaires Clôturés &amp; PV</span>
            </div>
            {activeTab === 'ARCHIVES' && <ChevronRight size={14} color="#0891b2" />}
          </button>
        </div>

        {/* Indicateurs Secrétariat en bas de la sidebar */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px',
          margin: '0 4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem' }}>
            <span style={{ color: '#64748b' }}>Boutiques :</span>
            <strong style={{ color: '#0e7490' }}>{shops.length}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: '#64748b' }}>Utilisateurs :</span>
            <strong style={{ color: '#0e7490' }}>{users.length}</strong>
          </div>
        </div>
      </nav>

      {/* ── ZONE DE TRAVAIL PRINCIPALE (À DROITE DE LA SIDEBAR) ── */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {activeTab === 'SHOPS' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <ShopsView />
            </div>
          )}

          {activeTab === 'USERS' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <UsersModule />
            </div>
          )}

          {activeTab === 'CAMPAIGNS' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <CampaignsModule />
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
