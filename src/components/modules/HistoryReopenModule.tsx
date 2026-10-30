import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Check, 
  Eye, 
  Calendar 
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../../services/store';
import { Inventory } from '../../types';

interface HistoryReopenModuleProps {
  onOpenReopenModal?: (inv: Inventory) => void;
  onOpenReport?: (inv: Inventory) => void;
}

export const HistoryReopenModule: React.FC<HistoryReopenModuleProps> = ({ 
  onOpenReopenModal = () => {},
  onOpenReport = () => {} 
}) => {
  const store = useALUStore();
  const inventories = store.getInventories();
  const currentUser = store.getCurrentUser();

  // Les inventaires avec des versions ou clôturés
  const historicalInventories = inventories.filter(i => 
    i.status === 'Validé et clôturé' || i.versionsHistory.length > 0 || i.version > 1
  );

  const [selectedInvId, setSelectedInvId] = useState<string>(historicalInventories[0]?.id || '');
  const selectedInventory = store.getInventoryById(selectedInvId);

  const canReopen = currentUser.role === 'PDG' || (currentUser.role === 'RESPONSABLE_INVENTAIRE' && currentUser.isDesignatedByPDG);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563eb', fontSize: '1rem' }}>MODULE 12</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              Historique des Versions & Procédures de Réouverture
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Conservation inaltérable des versions antérieures, traçabilité des scellements et encadrement des réouvertures.
          </p>
        </div>

        {selectedInventory && selectedInventory.status === 'Validé et clôturé' && canReopen && (
          <button 
            onClick={() => onOpenReopenModal(selectedInventory)} 
            className="btn btn-secondary btn-sm"
            style={{ color: '#dc2626' }}
          >
            <RotateCcw size={15} />
            <span>Initier Réouverture Exceptionnelle</span>
          </button>
        )}
      </div>

      {/* Règle de conservation de version */}
      <div className="alert-banner info" style={{ marginBottom: '24px' }}>
        <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Garantie de non-écrasement (Article 12) :</strong> Lorsqu'une réouverture exceptionnelle est autorisée, 
          la version antérieure V1.0 n'est jamais supprimée. Une nouvelle version V2.0 est initialisée et le procès-verbal précise 
          expressément qu'il remplace la version précédente, conservant l'audit des corrections.
        </div>
      </div>

      {historicalInventories.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <History size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.125rem', color: '#0f172a', marginBottom: '6px' }}>
            Aucun historique de version clôturée pour le moment
          </h3>
          <p style={{ color: '#64748b' }}>
            Dès qu'un inventaire est validé et scellé, son registre de versions immuables apparaîtra ici.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Liste des dossiers historisés */}
          <div className="card">
            <div className="card-header">
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Dossiers d'Inventaire Clôturés</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{historicalInventories.length} scellés</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {historicalInventories.map(inv => {
                  const isSelected = inv.id === selectedInvId;
                  return (
                    <button
                      key={inv.id}
                      onClick={() => setSelectedInvId(inv.id)}
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid #f1f5f9',
                        borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                        backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        borderTop: 'none',
                        borderRight: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                          {inv.code}
                        </span>
                        <span className="status-pill success" style={{ fontSize: '0.6875rem' }}>
                          V{inv.version}.0 Scellée
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                        {inv.shopName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Validateur : {inv.validatedByName || 'Direction Habilitée'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Détail du registre des versions pour le dossier sélectionné */}
          {selectedInventory && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                  <History size={17} color="#2563eb" />
                  <span>Registre des Versions — {selectedInventory.code}</span>
                </div>

                <button 
                  onClick={() => onOpenReport(selectedInventory)} 
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  <Eye size={13} />
                  <span>Consulter PV Officiel</span>
                </button>
              </div>

              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Version active actuelle */}
                  <div style={{ 
                    padding: '16px', 
                    borderRadius: '8px', 
                    border: '1px solid #a7f3d0', 
                    backgroundColor: '#f0fdf4' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800, color: '#065f46', fontSize: '1rem' }}>
                        Version {selectedInventory.version}.0 (Version Légale en Vigueur)
                      </span>
                      <span className="status-pill success">Définitive</span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#166534', marginBottom: '8px' }}>
                      Date de clôture : {selectedInventory.closedAt || 'Clôturé'} • Scellé par : {selectedInventory.validatedByName || 'Jean-Baptiste Koffi'}
                    </div>

                    <div style={{ 
                      padding: '10px 12px', 
                      backgroundColor: '#ffffff', 
                      borderRadius: '6px', 
                      border: '1px solid #bbf7d0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }}>
                      <span>Montant Certifié :</span>
                      <span className="tabular-nums" style={{ color: '#0f172a' }}>
                        {formatFCFA(selectedInventory.lines.reduce((s, l) => s + l.totalAmount, 0))}
                      </span>
                    </div>
                  </div>

                  {/* Versions précédentes archivées */}
                  {selectedInventory.versionsHistory.length > 0 ? (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Archives des versions antérieures :
                      </div>
                      {selectedInventory.versionsHistory.map((ver, idx) => (
                        <div key={idx} style={{ 
                          padding: '12px 14px', 
                          borderRadius: '6px', 
                          border: '1px solid #e2e8f0', 
                          backgroundColor: '#f8fafc',
                          marginBottom: '8px',
                          fontSize: '0.8125rem' 
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                            <span>Version {ver.versionNumber}.0 (Archivée)</span>
                            <span className="tabular-nums">{formatFCFA(ver.totalGeneral)}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Scellée le : {ver.closedAt ? ver.closedAt.substring(0, 10) : '2026-03-31'} par {ver.closedByName}
                          </div>
                          {ver.reopeningReason && (
                            <div style={{ marginTop: '6px', padding: '6px 8px', backgroundColor: '#fffbeb', borderRadius: '4px', fontSize: '0.75rem', color: '#92400e' }}>
                              <strong>Motif de réouverture :</strong> {ver.reopeningReason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8125rem', color: '#64748b', fontStyle: 'italic' }}>
                      Aucune réouverture antérieure enregistrée sur ce dossier. Version originelle intègre.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
