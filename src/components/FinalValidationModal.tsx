import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  KeyRound, 
  FileCheck 
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../services/store';
import { Inventory } from '../types';

interface FinalValidationModalProps {
  inventory: Inventory;
  onClose: () => void;
  onSuccess: () => void;
}

export const FinalValidationModal: React.FC<FinalValidationModalProps> = ({
  inventory,
  onClose,
  onSuccess
}) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();

  const [securityCode, setSecurityCode] = useState('');
  const [validatorNotes, setValidatorNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [checklist, setChecklist] = useState({
    allLinesChecked: true,
    discrepanciesJustified: true,
    totalsReconciled: true,
    powersConfirmed: true
  });

  const isDesignated = currentUser.role === 'PDG' || (currentUser.role === 'RESPONSABLE_INVENTAIRE' && currentUser.isDesignatedByPDG);

  const totalGoodAmount = inventory.lines.reduce((s, l) => s + l.amountGood, 0);
  const totalDamagedAmount = inventory.lines.reduce((s, l) => s + l.amountDamaged, 0);
  const totalGeneral = totalGoodAmount + totalDamagedAmount;
  const totalGoodUnits = inventory.lines.reduce((s, l) => s + l.qtyGood, 0);
  const totalDamagedUnits = inventory.lines.reduce((s, l) => s + l.qtyDamaged, 0);

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isDesignated) {
      setErrorMsg('Action rejetée : Seules les personnes formellement habilitées par le PDG peuvent clôturer un inventaire.');
      return;
    }

    if (!checklist.allLinesChecked || !checklist.discrepanciesJustified || !checklist.totalsReconciled || !checklist.powersConfirmed) {
      setErrorMsg('Veuillez cocher et certifier tous les points de contrôle d\'intégrité obligatoires.');
      return;
    }

    const res = store.finalizeAndCloseInventory({
      inventoryId: inventory.id,
      securityConfirmationCode: securityCode,
      validatorNotes: validatorNotes || 'Inventaire scellé et certifié conforme selon la procédure officielle ALUTRACO.'
    });

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #a7f3d0'
            }}>
              <ShieldCheck size={18} color="#059669" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#0f172a' }}>
                Clôture Définitive & Scellement Numérique
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Dossier : {inventory.code} — {inventory.shopName}
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFinalize}>
          <div className="modal-body">
            {errorMsg && (
              <div className="alert-banner danger" style={{ marginBottom: '16px' }}>
                <AlertTriangle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Récapitulatif certifié */}
            <div style={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: '8px', 
              padding: '16px', 
              border: '1px solid #e2e8f0', 
              marginBottom: '20px' 
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                Synthèse des Actifs Inventoriés pour Certification :
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Bon État</div>
                  <div style={{ fontWeight: 700, color: '#059669', fontSize: '0.9375rem' }} className="tabular-nums">
                    {formatFCFA(totalGoodAmount)}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{totalGoodUnits} unités</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Articles Gâtés</div>
                  <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.9375rem' }} className="tabular-nums">
                    {formatFCFA(totalDamagedAmount)}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{totalDamagedUnits} unités</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Total Général Certifié</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.0625rem' }} className="tabular-nums">
                    {formatFCFA(totalGeneral)}
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist d'intégrité (Section 10) */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Vérifications Préalables d'Intégrité (Obligatoires) :
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checklist.allLinesChecked}
                    onChange={(e) => setChecklist({ ...checklist, allLinesChecked: e.target.checked })}
                  />
                  <span>Toutes les lignes attendues sont vérifiées ou expressément justifiées</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checklist.discrepanciesJustified}
                    onChange={(e) => setChecklist({ ...checklist, discrepanciesJustified: e.target.checked })}
                  />
                  <span>Les articles dégradés/gâtés portent un motif de freinte auditable</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checklist.totalsReconciled}
                    onChange={(e) => setChecklist({ ...checklist, totalsReconciled: e.target.checked })}
                  />
                  <span>Les permissions temporaires de contrôle sont closes</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checklist.powersConfirmed}
                    onChange={(e) => setChecklist({ ...checklist, powersConfirmed: e.target.checked })}
                  />
                  <span>J'atteste agir au titre de ma désignation nominative par le PDG d'ALUTRACO</span>
                </label>
              </div>
            </div>

            {/* Observations du validateur */}
            <div className="form-group">
              <label className="form-label">Mention de Clôture & Observations Finales</label>
              <textarea
                rows={2}
                placeholder="Ex: Inventaire physique conforme, écarts mineurs de déchargement constatés et imputés..."
                className="form-textarea"
                value={validatorNotes}
                onChange={(e) => setValidatorNotes(e.target.value)}
              />
            </div>

            {/* Confirmation renforcée / Mot de passe de garde (Article 12) */}
            <div style={{ padding: '16px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>
                <KeyRound size={16} />
                <span>Confirmation Renforcée de Sécurité (Protection Anti-Bypass)</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#78350f', marginBottom: '12px' }}>
                Entrez votre code de confirmation renforcée d'authentification (code de référence : <code>ALU-2026</code>) :
              </p>
              <input
                type="password"
                required
                placeholder="Code de confirmation renforcée..."
                className="form-input"
                style={{ maxWidth: '280px', backgroundColor: '#ffffff', borderColor: '#d97706' }}
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ backgroundColor: '#059669', borderColor: '#059669' }}
            >
              <Lock size={15} />
              <span>Sceller & Clôturer Définitivement (V{inventory.version}.0)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
