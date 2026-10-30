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
  HelpCircle,
  FileText,
  User,
  X
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../../services/store';
import { Inventory } from '../../types';

interface PdgSupervisionModuleProps {
  onOpenReport?: (inv: Inventory) => void;
  onNavigateToTreatment?: (inventoryId: string) => void;
}

export const PdgSupervisionModule: React.FC<PdgSupervisionModuleProps> = ({ 
  onOpenReport,
  onNavigateToTreatment 
}) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const inventories = store.getInventories();
  const shops = store.getShops();

  const [selectedInvId, setSelectedInvId] = useState<string>(inventories[0]?.id || '');
  const [arbitrationModalOpen, setArbitrationModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<'FINALISE' | 'RENVOYE_CONTROLE' | 'EN_ATTENTE' | 'MOTIF_SPECIAL'>('FINALISE');
  const [decisionNote, setDecisionNote] = useState('');
  const [commentText, setCommentText] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const selectedInventory = store.getInventoryById(selectedInvId) || inventories.find(i => i.id === selectedInvId);
  const treatment = selectedInvId ? store.getInventoryTreatment(selectedInvId) : undefined;

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleOpenArbitration = (decision: 'FINALISE' | 'RENVOYE_CONTROLE' | 'EN_ATTENTE' | 'MOTIF_SPECIAL') => {
    setDecisionType(decision);
    setDecisionNote('');
    setCommentText('');
    setArbitrationModalOpen(true);
  };

  const handleConfirmArbitration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvId || !decisionNote) return;

    const res = store.submitPdgArbitration(selectedInvId, decisionType, decisionNote, commentText || undefined);
    setArbitrationModalOpen(false);
    showNotification(res.message);
  };

  const handleAddQuickComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvId || !commentText) return;
    const res = store.addPdgComment(selectedInvId, commentText);
    setCommentText('');
    showNotification(res.message);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#0f172a',
          color: '#facc15',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontSize: '0.875rem',
          fontWeight: 700,
          border: '1px solid #ca8a04'
        }}>
          <Crown size={18} color="#facc15" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ── BANNIÈRE HAUTE DIRECTION SOUVERAINE ── */}
      <div style={{
        backgroundColor: '#0f172a',
        backgroundImage: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        border: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              <Crown size={16} />
              <span>Cabinet du Président Directeur Général — Fondateur</span>
            </div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 900, color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Espace Haute Direction PDG (Supervision & Arbitrage)
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0, maxWidth: '700px', lineHeight: 1.5 }}>
              En tant que <strong>créateur et garant de l'entreprise</strong>, vous disposez d'un accès souverain en <strong>mode spectateur</strong> à l'ensemble des inventaires, boutiques et traitements. Vous intervenez pour annoter, renvoyer en contrôle, déclarer finalisé ou mettre en attente.
            </p>
          </div>

          <div style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)', padding: '12px 18px', borderRadius: '8px', textAlign: 'right' }}>
            <div style={{ fontSize: '0.6875rem', color: '#fef08a', textTransform: 'uppercase', fontWeight: 700 }}>Statut Direction</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#facc15' }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Spectateur & Arbitre Suprême</div>
          </div>
        </div>
      </div>

      {/* ── SÉLECTEUR D'INVENTAIRE À SUPERVISER ── */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={18} color="#2563eb" />
            <span style={{ fontWeight: 700, color: '#0f172a' }}>Dossier d'Inventaire Sélectionné pour Supervision :</span>
          </div>

          <select
            value={selectedInvId}
            onChange={(e) => setSelectedInvId(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontWeight: 700, fontSize: '0.875rem' }}
          >
            {inventories.map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.shopName} — ({inv.code}) [{inv.status}]
              </option>
            ))}
          </select>
        </div>

        {selectedInventory && (
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Informations sur l'inventaire */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Boutique</span>
                <strong style={{ color: '#0f172a' }}>{selectedInventory.shopName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Statut Actuel</span>
                <span className="status-pill info">{selectedInventory.status}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Périmètre</span>
                <strong style={{ color: '#0f172a' }}>{selectedInventory.category}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Date de création</span>
                <span style={{ color: '#334155' }}>{selectedInventory.createdAt}</span>
              </div>
            </div>

            {/* Décision précédente du PDG si existante */}
            {selectedInventory.pdgDecision && (
              <div style={{
                backgroundColor: selectedInventory.pdgDecision === 'FINALISE' ? '#f0fdf4' : selectedInventory.pdgDecision === 'RENVOYE_CONTROLE' ? '#fef2f2' : '#fffbeb',
                border: `1px solid ${selectedInventory.pdgDecision === 'FINALISE' ? '#bbf7d0' : selectedInventory.pdgDecision === 'RENVOYE_CONTROLE' ? '#fecaca' : '#fde68a'}`,
                padding: '16px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: selectedInventory.pdgDecision === 'FINALISE' ? '#166534' : selectedInventory.pdgDecision === 'RENVOYE_CONTROLE' ? '#991b1b' : '#92400e', marginBottom: '6px' }}>
                  <Crown size={16} />
                  <span>Dernier Arbitrage Souverain du PDG : {selectedInventory.pdgDecision}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>({selectedInventory.pdgDecisionAt})</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#334155', fontStyle: 'italic' }}>
                  « {selectedInventory.pdgDecisionNote} »
                </div>
              </div>
            )}

            {/* Commentaire permanent de Direction */}
            {selectedInventory.pdgComment && (
              <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '14px 16px', borderRadius: '8px', fontSize: '0.8125rem' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                  Annotation de la Direction Générale :
                </span>
                <span style={{ color: '#334155' }}>{selectedInventory.pdgComment}</span>
              </div>
            )}

            {/* Données financières du traitement si disponible */}
            {treatment && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '10px' }}>
                  Aperçu du Traitement Financier (Boutique {treatment.shopName}) :
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', fontSize: '0.8125rem' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.6875rem', display: 'block' }}>Stock Initial Réf.</span>
                    <strong style={{ fontFamily: 'monospace' }}>{formatFCFA(treatment.initialStockValue)}</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.6875rem', display: 'block' }}>Stock Compté</span>
                    <strong style={{ fontFamily: 'monospace' }}>{formatFCFA(treatment.countedStockValue)}</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.6875rem', display: 'block' }}>Solde Boutique</span>
                    <strong style={{ fontFamily: 'monospace' }}>{formatFCFA(treatment.shopBalance)}</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.6875rem', display: 'block' }}>Stock Total Calculé</span>
                    <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{formatFCFA(treatment.totalCalculatedStock)}</strong>
                  </div>
                  <div style={{ backgroundColor: treatment.isPositiveDifference ? '#f0fdf4' : '#fef2f2', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ color: treatment.isPositiveDifference ? '#166534' : '#991b1b', fontSize: '0.6875rem', display: 'block' }}>
                      Écart / Résultat
                    </span>
                    <strong style={{ fontFamily: 'monospace', color: treatment.isPositiveDifference ? '#166534' : '#991b1b' }}>
                      {treatment.isPositiveDifference ? '+' : ''}{formatFCFA(treatment.difference)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* ── LES 4 ACTIONS SOUVERAINES DU PDG ── */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crown size={15} color="#ca8a04" />
                <span>Pouvoirs d'Arbitrage Exclusifs du PDG (Fondateur) :</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleOpenArbitration('FINALISE')}
                  className="btn btn-sm"
                  style={{ backgroundColor: '#059669', color: '#ffffff', fontWeight: 700 }}
                >
                  <CheckCircle2 size={15} />
                  <span>Déclarer Finalisé (Visa PDG)</span>
                </button>

                <button
                  onClick={() => handleOpenArbitration('RENVOYE_CONTROLE')}
                  className="btn btn-sm"
                  style={{ backgroundColor: '#dc2626', color: '#ffffff', fontWeight: 700 }}
                >
                  <AlertTriangle size={15} />
                  <span>Renvoyer en Contrôle</span>
                </button>

                <button
                  onClick={() => handleOpenArbitration('EN_ATTENTE')}
                  className="btn btn-sm"
                  style={{ backgroundColor: '#d97706', color: '#ffffff', fontWeight: 700 }}
                >
                  <Clock size={15} />
                  <span>Mettre en Attente</span>
                </button>

                <button
                  onClick={() => handleOpenArbitration('MOTIF_SPECIAL')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 700 }}
                >
                  <HelpCircle size={15} />
                  <span>Autre Motif d'Arbitrage</span>
                </button>

                {onNavigateToTreatment && (
                  <button
                    onClick={() => onNavigateToTreatment(selectedInventory.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ marginLeft: 'auto' }}
                  >
                    <Eye size={15} />
                    <span>Consulter le Traitement Complet</span>
                  </button>
                )}

                {onOpenReport && (
                  <button
                    onClick={() => onOpenReport(selectedInventory)}
                    className="btn btn-secondary btn-sm"
                  >
                    <FileSpreadsheet size={15} color="#ca8a04" />
                    <span>Rapport Officiel Capture 2</span>
                  </button>
                )}
              </div>
            </div>

            {/* Saisie d'une annotation directe */}
            <form onSubmit={handleAddQuickComment} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input
                type="text"
                placeholder="Ajouter une instruction ou annotation souveraine du PDG sur ce dossier..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.8125rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                <MessageSquare size={14} />
                <span>Consigner l'annotation</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── MODAL D'ARBITRAGE DU PDG ── */}
      {arbitrationModalOpen && selectedInventory && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a' }}>
                <Crown size={20} color="#ca8a04" />
                <span>
                  {decisionType === 'FINALISE' && 'Visa Souverain : Déclarer Finalisé'}
                  {decisionType === 'RENVOYE_CONTROLE' && 'Arbitrage PDG : Renvoyer en Contrôle'}
                  {decisionType === 'EN_ATTENTE' && 'Mise en Attente par le PDG'}
                  {decisionType === 'MOTIF_SPECIAL' && 'Autre Motif d\'Arbitrage de Direction'}
                </span>
              </div>
              <button onClick={() => setArbitrationModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmArbitration}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                  Dossier : <strong>{selectedInventory.code}</strong> — {selectedInventory.shopName}.
                </p>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    <span>Motif / Consigne obligatoire du PDG :</span>
                    <span className="required">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={
                      decisionType === 'FINALISE'
                        ? 'Ex: Dossier examiné et validé définitivement par le PDG. Clôture certifiée.'
                        : decisionType === 'RENVOYE_CONTROLE'
                        ? 'Ex: Écart important sur les coulisses bronze. Merci d\'effectuer un recomptage contradictoire.'
                        : 'Ex: En attente des justificatifs de livraison du bon BL-902 avant arbitrage final.'
                    }
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setArbitrationModalOpen(false)} className="btn btn-secondary btn-sm">
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{
                    backgroundColor: decisionType === 'FINALISE' ? '#059669' : decisionType === 'RENVOYE_CONTROLE' ? '#dc2626' : '#d97706',
                    borderColor: decisionType === 'FINALISE' ? '#059669' : decisionType === 'RENVOYE_CONTROLE' ? '#dc2626' : '#d97706'
                  }}
                >
                  Confirmer la décision du PDG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
