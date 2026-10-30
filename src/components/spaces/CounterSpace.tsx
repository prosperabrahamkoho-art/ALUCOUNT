import React from 'react';
import { 
  ScanLine, 
  Lock,
  ChevronRight,
  Tablet,
  CheckCircle2
} from 'lucide-react';
import { CountingModuleView } from '../CountingModuleView';

export const CounterSpace: React.FC = () => {
  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 60px)', backgroundColor: '#f8fafc' }}>
      
      {/* ── SIDEBAR VERTICALE À GAUCHE (MODULES DE L'INVENTORISTE) ── */}
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
          
          {/* En-tête Espace Inventoriste */}
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
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ScanLine size={16} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3730a3' }}>
                Inventoriste Terrain
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              Comptage Physique (Bon État / Gâté)
            </div>
          </div>

          <div style={{ padding: '6px 12px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Opérations Terrain
          </div>

          {/* 1. Comptage Physique */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#eef2ff',
              color: '#4338ca',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ScanLine size={17} color="#4f46e5" />
              <span>1. Saisie Comptage Terrain</span>
            </div>
            <ChevronRight size={14} color="#4f46e5" />
          </button>
        </div>

        {/* Verrouillage financier strict */}
        <div style={{
          backgroundColor: '#eef2ff',
          border: '1px solid #c7d2fe',
          borderRadius: '8px',
          padding: '12px',
          margin: '0 4px',
          fontSize: '0.75rem',
          color: '#3730a3',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <Lock size={14} color="#4338ca" />
            <span>Sécurité Financière</span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#4338ca', lineHeight: 1.3 }}>
            L'accès aux prix unitaires, valorisations et commissions est strictement verrouillé pour les inventoristes.
          </div>
        </div>
      </nav>

      {/* ── ZONE DE TRAVAIL PRINCIPALE (À DROITE DE LA SIDEBAR) ── */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <CountingModuleView onSubmittedToControl={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
};
