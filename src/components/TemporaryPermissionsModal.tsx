import React, { useState } from 'react';
import { 
  KeyRound, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  UserCheck, 
  X, 
  Check, 
  Store, 
  Calendar 
} from 'lucide-react';
import { useALUStore } from '../services/store';
import { Inventory, PermissionScope, PermissionAction } from '../types';

interface TemporaryPermissionsProps {
  initialInventory?: Inventory | null;
  onClose?: () => void;
  isModal?: boolean;
}

export const TemporaryPermissionsManager: React.FC<TemporaryPermissionsProps> = ({ 
  initialInventory, 
  onClose,
  isModal = false 
}) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const users = store.getUsers();
  const inventories = store.getInventories();
  const permissions = store.getTemporaryPermissions();

  const isAuthorizedToGrant = currentUser.role === 'PDG' || currentUser.role === 'MAGASINIER' || (currentUser.role === 'RESPONSABLE_INVENTAIRE' && currentUser.isDesignatedByPDG);

  // Candidats à l'autorisation : Contrôleurs et Inventoristes (pas les membres de direction)
  const assignableUsers = users.filter(u => ['CONTROLEUR', 'INVENTORISTE'].includes(u.role));

  const [targetUserId, setTargetUserId] = useState(assignableUsers[0]?.id || '');
  const [selectedInventoryId, setSelectedInventoryId] = useState(initialInventory?.id || inventories[0]?.id || '');
  const [scope, setScope] = useState<PermissionScope>('Aluminium');
  const [action, setAction] = useState<PermissionAction>('Corriger les quantités');
  const [durationMinutes, setDurationMinutes] = useState<number>(120); // 2 heures par défaut
  const [reason, setReason] = useState('Vérification et réconciliation des écarts de comptage constatés');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorizedToGrant) {
      alert('Seul le PDG ou un Responsable d\'inventaire habilité peut octroyer des permissions temporaires.');
      return;
    }

    const res = store.grantTemporaryPermission({
      userId: targetUserId,
      inventoryId: selectedInventoryId,
      scope,
      action,
      durationMinutes: Number(durationMinutes),
      reason
    });

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setReason('');
      if (isModal && onClose) {
        setTimeout(onClose, 1200);
      }
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleRevoke = (permId: string) => {
    if (window.confirm('Voulez-vous immédiatement révoquer cette permission ? Les modifications seront bloquées sur-le-champ.')) {
      store.revokePermission(permId);
    }
  };

  const content = (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
          Gestion des Permissions Temporaires de Contrôle (Article 4)
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Autoriser nominativement un contrôleur à intervenir sur un périmètre restreint pendant une durée bornée.
        </p>
      </div>

      {feedback && (
        <div className={`alert-banner ${feedback.type === 'success' ? 'success' : 'danger'}`}>
          <span>{feedback.text}</span>
        </div>
      )}

      {/* FORMULAIRE D'OCTROI DE PERMISSION NOUVELLE */}
      {isAuthorizedToGrant ? (
        <div className="card" style={{ marginBottom: '28px', borderLeft: '4px solid #2563eb' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0f172a' }}>
              <KeyRound size={17} color="#2563eb" />
              <span>Délivrer une Nouvelle Fiche d'Autorisation Temporaire</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Contrôlé côté serveur</span>
          </div>

          <form onSubmit={handleGrant}>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    <span>Personne Autorisée (Contrôleur)</span>
                    <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                  >
                    {assignableUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    <span>Boutique & Inventaire Concerné</span>
                    <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={selectedInventoryId}
                    onChange={(e) => setSelectedInventoryId(e.target.value)}
                  >
                    {inventories.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.code} — {inv.shopName} ({inv.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Périmètre Autorisé</label>
                  <select
                    className="form-select"
                    value={scope}
                    onChange={(e) => setScope(e.target.value as PermissionScope)}
                  >
                    <option value="Aluminium">Aluminium (Seulement)</option>
                    <option value="Accessoires">Accessoires (Seulement)</option>
                    <option value="Complet">Inventaire Complet</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Action Autorisée</label>
                  <select
                    className="form-select"
                    value={action}
                    onChange={(e) => setAction(e.target.value as PermissionAction)}
                  >
                    <option value="Corriger les quantités">Corriger les quantités</option>
                    <option value="Modifier observations">Modifier observations</option>
                    <option value="Contrôle complet">Contrôle complet</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Durée de la Permission</label>
                  <select
                    className="form-select"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 heure (60 min)</option>
                    <option value={120}>2 heures (120 min)</option>
                    <option value={240}>4 heures (240 min)</option>
                    <option value={480}>Journée complète (8h)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  <span>Motif Obligatoire de la Permission</span>
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vérification et réconciliation des écarts de comptage sur profilés déformés..."
                  className="form-input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            <div className="card-header" style={{ justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                <Check size={16} />
                <span>Valider & Accorder la Permission</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="alert-banner info" style={{ marginBottom: '20px' }}>
          <ShieldCheck size={18} />
          <div>
            Consultation des permissions : Seul le <strong>PDG</strong> et les <strong>Responsables d'inventaire habilités</strong> peuvent émettre des droits temporaires.
          </div>
        </div>
      )}

      {/* REGISTRE DES PERMISSIONS TEMPORAIRES ACTIVES & HISTORISÉES */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0f172a' }}>
            <Clock size={17} color="#0f172a" />
            <span>Registre des Permissions Déclarées ({permissions.length})</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Personne Autorisée</th>
                <th>Inventaire / Boutique</th>
                <th>Périmètre & Action</th>
                <th>Accordée Par</th>
                <th>Expiration / Délai</th>
                <th>Motif Déclaré</th>
                <th>Statut</th>
                <th style={{ textAlign: 'center' }}>Révocation</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map(perm => {
                const isExpired = perm.status === 'EXPIRED';
                const isRevoked = perm.status === 'REVOKED';
                const isActive = perm.status === 'ACTIVE';

                return (
                  <tr key={perm.id} style={{ opacity: isActive ? 1 : 0.65 }}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{perm.userName}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{perm.inventoryCode}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{perm.shopName}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{perm.scope}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{perm.action}</div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#334155' }}>
                      {perm.grantedByName}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }} className="tabular-nums">
                        {new Date(perm.expiresAt).toLocaleTimeString()}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        Durée : {perm.durationMinutes} min
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#475569', maxWidth: '240px' }}>
                      {perm.reason}
                    </td>
                    <td>
                      <span className={`status-pill ${
                        isActive ? 'success' : isRevoked ? 'danger' : 'neutral'
                      }`}>
                        {isActive ? 'Active' : isRevoked ? 'Révoquée' : 'Expirée'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isActive && isAuthorizedToGrant ? (
                        <button
                          onClick={() => handleRevoke(perm.id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          title="Révoquer immédiatement la permission"
                        >
                          <Trash2 size={13} />
                          <span>Révoquer</span>
                        </button>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="modal-backdrop">
        <div className="modal-content" style={{ maxWidth: '820px' }}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
              <KeyRound size={18} color="#2563eb" />
              <span>Permissions Temporaires de Contrôle</span>
            </div>
            {onClose && (
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            )}
          </div>
          <div className="modal-body">
            {content}
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-secondary">Fermer</button>
          </div>
        </div>
      </div>
    );
  }

  return content;
};
