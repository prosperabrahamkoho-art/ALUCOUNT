import React, { useState } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  ShieldAlert, 
  X, 
  KeyRound, 
  History 
} from 'lucide-react';
import { useALUStore } from '../services/store';
import { Inventory } from '../types';

interface ReopeningModalProps {
  inventory: Inventory;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReopeningModal: React.FC<ReopeningModalProps> = ({
  inventory,
  onClose,
  onSuccess
}) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();

  const [justification, setJustification] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isAuthorized = currentUser.role === 'PDG' || (currentUser.role === 'RESPONSABLE_INVENTAIRE' && currentUser.isDesignatedByPDG);

  const handleReopen = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthorized) {
      setErrorMsg('Seul le PDG ou un responsable désigné par le PDG peut ordonner une réouverture exceptionnelle.');
      return;
    }

    const res = store.reopenInventoryExceptionnel({
      inventoryId: inventory.id,
      justification,
      securityConfirmationCode: securityCode
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
      <div className="modal-content" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontWeight: 800 }}>
            <AlertTriangle size={20} />
            <span>Procédure Exceptionnelle de Réouverture Post-Clôture</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleReopen}>
          <div className="modal-body">
            {errorMsg && (
              <div className="alert-banner danger" style={{ marginBottom: '16px' }}>
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="alert-banner warning" style={{ marginBottom: '16px' }}>
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8125rem' }}>
                <strong>Protection d'audit (Section 10) :</strong> La réouverture ne supprime jamais la version V{inventory.version}.0 antérieure. 
                Une nouvelle version V{inventory.version + 1}.0 sera générée et le journal conservera l'empreinte indélébile de la demande, 
                de l'auteur et de l'autorisation.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Justification Formelle Circonstanciée (Obligatoire)</span>
                <span className="required">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Précisez la découverte de l'anomalie, l'identité du demandeur et les éléments justifiant la rupture du scellé..."
                className="form-textarea"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
              />
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                Minimum 10 caractères. Inscrit au registre d'audit ALUTRACO.
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <label className="form-label" style={{ color: '#92400e' }}>
                <span>Code de Confirmation Renforcée (ALU-2026)</span>
                <span className="required">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Code de sécurité..."
                className="form-input"
                style={{ backgroundColor: '#ffffff', borderColor: '#d97706', maxWidth: '280px' }}
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-danger">
              <RotateCcw size={15} />
              <span>Autoriser la Réouverture (Créer V{inventory.version + 1}.0)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
