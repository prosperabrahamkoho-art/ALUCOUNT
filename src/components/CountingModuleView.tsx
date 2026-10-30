import React, { useState, useEffect } from 'react';
import { 
  ScanLine, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Send, 
  Plus, 
  Minus, 
  ChevronRight, 
  Store, 
  Clock, 
  Lock,
  Search,
  Check,
  MessageSquare,
  Paperclip,
  Image,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../services/store';
import { Inventory, InventoryLine, DamageReason, Category, AluminiumColor } from '../types';

interface CountingModuleViewProps {
  onSubmittedToControl: () => void;
}

export const CountingModuleView: React.FC<CountingModuleViewProps> = ({ onSubmittedToControl }) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const inventories = store.getInventories();
  
  // Les inventaires visibles pour le comptage physique
  const availableInventories = inventories.filter(inv => 
    inv.status === 'En cours de comptage' || 
    inv.status === 'Brouillon' ||
    inv.status === 'Comptage terminé' ||
    inv.status === 'En contrôle'
  );

  const [selectedInvId, setSelectedInvId] = useState<string>(
    availableInventories.length > 0 ? availableInventories[0].id : ''
  );
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('TOUS');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Enregistré automatiquement');
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);

  // States pour la messagerie écrite (demande de modification post-soumission)
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [msgLineId, setMsgLineId] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgQtyGood, setMsgQtyGood] = useState<number | undefined>(undefined);
  const [msgQtyDamaged, setMsgQtyDamaged] = useState<number | undefined>(undefined);
  const [msgFeedback, setMsgFeedback] = useState<string | null>(null);
  const [msgAttachName, setMsgAttachName] = useState<string>('');
  const [msgAttachUrl, setMsgAttachUrl] = useState<string>('');

  // States pour les pièces jointes / photos (chefs d'agence / boutique)
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attFileName, setAttFileName] = useState('');
  const [attNotes, setAttNotes] = useState('');
  const [attFeedback, setAttFeedback] = useState<string | null>(null);

  const currentInventory = store.getInventoryById(selectedInvId);

  // Mettre à jour automatiquement le selectedInvId si vide
  useEffect(() => {
    if (!selectedInvId && availableInventories.length > 0) {
      setSelectedInvId(availableInventories[0].id);
    }
  }, [availableInventories, selectedInvId]);

  const damageReasonsList: DamageReason[] = [
    'Déformé / Tordu',
    'Rayure profonde',
    'Oxydation / Taches',
    'Fissure / Cassé',
    'Incomplet',
    'Mauvais stockage',
    'Autre anomalie'
  ];

  // Règle formelle : dès que le comptage est soumis, l'inventoriste est verrouillé
  const isLockedForCurrentUser = () => {
    if (!currentInventory) return true;
    if (currentUser.role === 'INVENTORISTE') {
      return currentInventory.status !== 'En cours de comptage' && currentInventory.status !== 'Brouillon';
    }
    // Les autres rôles dépendent de hasActiveEditPermission
    return !store.hasActiveEditPermission(currentInventory.id, currentInventory.category).allowed;
  };

  const isLocked = isLockedForCurrentUser();

  const handleUpdateLine = (line: InventoryLine, field: 'qtyGood' | 'qtyDamaged' | 'damageReason' | 'observation', value: any) => {
    if (!currentInventory || isLocked) {
      if (isLocked) {
        alert('Le comptage est déjà clôturé et soumis : vous ne pouvez plus modifier directement. Veuillez utiliser le volet de demande de modification par message écrit.');
      }
      return;
    }

    const updatedData: any = {
      productId: line.productId,
    };

    if (field === 'qtyGood') {
      updatedData.qtyGood = Math.max(0, Number(value));
    } else if (field === 'qtyDamaged') {
      updatedData.qtyDamaged = Math.max(0, Number(value));
    } else if (field === 'damageReason') {
      updatedData.damageReason = value;
    } else if (field === 'observation') {
      updatedData.observation = value;
    }

    const res = store.saveInventoryLine(currentInventory.id, updatedData);
    if (res.success) {
      const now = new Date();
      setLastSavedTime(`Synchronisé à ${now.toLocaleTimeString()}`);
    } else {
      alert(`Erreur : ${res.message}`);
    }
  };

  const handleStartCounting = () => {
    if (!currentInventory) return;
    store.updateInventoryStatus(currentInventory.id, 'En cours de comptage', 'Démarrage du comptage terrain par ' + currentUser.name);
  };

  const handleSubmitCounting = () => {
    if (!currentInventory) return;
    store.submitCounting(currentInventory.id);
    setConfirmSubmitModal(false);
    onSubmittedToControl();
  };

  const handleSendModificationRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInventory) return;

    const targetLine = currentInventory.lines.find(l => l.id === msgLineId);

    const res = store.sendInventoryMessage({
      inventoryId: currentInventory.id,
      content: msgContent,
      lineId: msgLineId || undefined,
      lineDesignation: targetLine?.designation,
      proposedQtyGood: msgQtyGood,
      proposedQtyDamaged: msgQtyDamaged,
      attachmentUrl: msgAttachUrl || undefined,
      attachmentName: msgAttachName || undefined
    });

    if (res.success) {
      setMsgFeedback('Votre demande écrite a été transmise avec succès au personnel de contrôle !');
      setTimeout(() => {
        setShowMessageModal(false);
        setMsgFeedback(null);
        setMsgContent('');
        setMsgLineId('');
        setMsgQtyGood(undefined);
        setMsgQtyDamaged(undefined);
        setMsgAttachName('');
        setMsgAttachUrl('');
      }, 1500);
    } else {
      alert(res.message);
    }
  };

  const handleUploadAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInventory) return;

    const res = store.uploadInventoryAttachment({
      inventoryId: currentInventory.id,
      fileName: attFileName || 'Photo_Justificative_Stock.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024 * 450, // 450 Ko simulé
      notes: attNotes
    });

    if (res.success) {
      setAttFeedback('Pièce jointe / photo enregistrée avec succès pour cet inventaire !');
      setTimeout(() => {
        setShowAttachModal(false);
        setAttFeedback(null);
        setAttFileName('');
        setAttNotes('');
      }, 1500);
    } else {
      alert(res.message);
    }
  };

  if (!currentInventory) {
    return (
      <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
        <ScanLine size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#0f172a' }}>
          Aucune mission de comptage active
        </h3>
        <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto' }}>
          Tous les inventaires programmés sont actuellement au contrôle ou validés. Contactez le secrétariat ou le PDG pour lancer une session.
        </p>
      </div>
    );
  }

  // Calcul des totaux de l'inventaire en direct
  const totalQtyGood = currentInventory.lines.reduce((s, l) => s + l.qtyGood, 0);
  const totalQtyDamaged = currentInventory.lines.reduce((s, l) => s + l.qtyDamaged, 0);
  const totalGoodAmount = currentInventory.lines.reduce((s, l) => s + l.amountGood, 0);
  const totalDamagedAmount = currentInventory.lines.reduce((s, l) => s + l.amountDamaged, 0);
  const totalGeneral = totalGoodAmount + totalDamagedAmount;

  // Filtrage des lignes
  const filteredLines = currentInventory.lines.filter(l => {
    const matchSearch = searchQuery === '' || 
      l.designation.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (l.color && l.color.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchColor = selectedColorFilter === 'TOUS' || l.color === selectedColorFilter;
    return matchSearch && matchColor;
  });

  return (
    <div>
      {/* SÉLECTEUR DE SESSION D'INVENTAIRE ACTIF */}
      <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #2563eb' }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>INVENTAIRE EN COURS :</span>
                <select 
                  className="form-select" 
                  style={{ width: 'auto', fontWeight: 700, color: '#0f172a', padding: '4px 10px', fontSize: '0.875rem' }}
                  value={selectedInvId}
                  onChange={(e) => setSelectedInvId(e.target.value)}
                >
                  {availableInventories.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.code} — {inv.shopName} ({inv.category}) [{inv.status}]
                    </option>
                  ))}
                </select>
                
                <span className={`status-pill ${
                  currentInventory.status === 'En cours de comptage' ? 'warning' : 
                  currentInventory.status === 'Comptage terminé' ? 'info' : 
                  currentInventory.status === 'En contrôle' ? 'warning' : 'success'
                }`} style={{ fontSize: '0.75rem' }}>
                  {currentInventory.status}
                </span>
              </div>

              <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Store size={14} color="#64748b" />
                  {currentInventory.shopName}
                </span>
                <span>•</span>
                <span>Inventoriste assigné : <strong>{currentInventory.assignedCounterName || currentUser.name}</strong></span>
              </div>
            </div>

            {/* Actions : Démarrer, Soumettre, Message écrit, Fichiers justificatifs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '6px 12px', 
                backgroundColor: '#f0fdf4', 
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#15803d'
              }}>
                <Save size={14} color="#16a34a" />
                <span className="tabular-nums">{lastSavedTime}</span>
              </div>

              {currentInventory.status === 'Brouillon' && (
                <button onClick={handleStartCounting} className="btn btn-primary btn-sm">
                  <span>Démarrer le Comptage</span>
                </button>
              )}

              {currentInventory.status === 'En cours de comptage' && (
                <button 
                  onClick={() => setConfirmSubmitModal(true)} 
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#0f172a' }}
                >
                  <Send size={15} />
                  <span>Clôturer & Soumettre à l'Administration</span>
                </button>
              )}

              {/* Bouton pour émettre une demande écrite post-soumission */}
              {(currentInventory.status === 'Comptage terminé' || currentInventory.status === 'En contrôle') && (
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ borderColor: '#2563eb', color: '#2563eb' }}
                  title="Soumettre une demande écrite d'ajustement aux contrôleurs"
                >
                  <MessageSquare size={15} />
                  <span>Demande de modification par écrit ({currentInventory.messages?.length || 0})</span>
                </button>
              )}

              {/* Bouton pour joindre photos/fichiers justificatifs */}
              <button
                onClick={() => setShowAttachModal(true)}
                className="btn btn-secondary btn-sm"
                title="Joindre des photos ou documents justificatifs pour cette boutique"
              >
                <Paperclip size={15} />
                <span>Justificatifs & Photos ({currentInventory.attachments?.length || 0})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AVERTISSEMENT DE VERROUILLAGE SI LE COMPTAGE EST SOUMIS */}
      {isLocked && (
        <div className="alert-banner warning" style={{ marginBottom: '16px' }}>
          <Lock size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.875rem' }}>
            <strong>Saisie Verrouillée :</strong> Le comptage de cette mission a été clôturé et soumis à l'administration. 
            Les inventoristes n'ont plus la main pour modifier directement les quantités. Si une omission ou un ajustement est nécessaire, 
            veuillez cliquer sur <strong>"Demande de modification par écrit"</strong> ci-dessus pour notifier l'équipe de contrôle.
          </div>
        </div>
      )}

      {/* Résumé synthétique du comptage */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '12px', 
        marginBottom: '20px' 
      }}>
        <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Articles en Bon État
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }} className="tabular-nums">
            {totalQtyGood} barres / pcs
          </div>
          <div style={{ fontSize: '0.75rem', color: '#15803d' }} className="tabular-nums">
            {formatFCFA(totalGoodAmount)}
          </div>
        </div>

        <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Articles Gâtés / Dégradés
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626' }} className="tabular-nums">
            {totalQtyDamaged} barres / pcs
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b91c1c' }} className="tabular-nums">
            {formatFCFA(totalDamagedAmount)}
          </div>
        </div>

        <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Total Physique Retrouvé
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }} className="tabular-nums">
            {totalQtyGood + totalQtyDamaged} unités
          </div>
          <div style={{ fontSize: '0.75rem', color: '#475569' }} className="tabular-nums">
            Valeur : {formatFCFA(totalGeneral)}
          </div>
        </div>
      </div>

      {/* Barre de filtres et de recherche rapide */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '12px', 
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {currentInventory.category === 'Aluminium' && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['TOUS', 'Blanche', 'Grise', 'Bronze', 'Noire', 'Satinée'].map(col => (
              <button
                key={col}
                className={`btn btn-sm ${selectedColorFilter === col ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedColorFilter(col)}
              >
                <span>{col === 'TOUS' ? 'Toutes les Couleurs' : col}</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input 
            type="text"
            className="form-input"
            placeholder="Rechercher profilé, barre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px', fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {/* TABLE DES LIGNES DE COMPTAGE */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Désignation Article</th>
              <th style={{ width: '15%' }}>Prix Snapshot</th>
              <th style={{ width: '18%', textAlign: 'center' }}>Qté Bon État</th>
              <th style={{ width: '18%', textAlign: 'center' }}>Qté Gâtée</th>
              <th style={{ width: '14%' }}>Observation / Motif</th>
            </tr>
          </thead>
          <tbody>
            {filteredLines.map(line => {
              const hasDamage = line.qtyDamaged > 0;

              return (
                <tr key={line.id} style={{ backgroundColor: line.wasCorrected ? '#fefce8' : undefined }}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{line.designation}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {line.color ? `Couleur : ${line.color}` : line.category} • {line.unit}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: '#475569' }} className="tabular-nums">
                      {formatFCFA(line.officialPriceSnapshot)}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                      Snapshot catalogue
                    </div>
                  </td>

                  {/* Boutons d'incrémentation Bon État */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => handleUpdateLine(line, 'qtyGood', line.qtyGood - 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', minWidth: '28px', opacity: isLocked ? 0.4 : 1 }}
                      >
                        <Minus size={13} />
                      </button>

                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        className="form-input tabular-nums"
                        value={line.qtyGood}
                        onChange={(e) => handleUpdateLine(line, 'qtyGood', e.target.value)}
                        style={{ 
                          width: '65px', 
                          textAlign: 'center', 
                          padding: '5px', 
                          fontWeight: 700,
                          borderColor: '#a7f3d0',
                          backgroundColor: line.qtyGood > 0 ? '#f0fdf4' : '#ffffff',
                          opacity: isLocked ? 0.6 : 1
                        }}
                      />

                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => handleUpdateLine(line, 'qtyGood', line.qtyGood + 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', minWidth: '28px', opacity: isLocked ? 0.4 : 1 }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </td>

                  {/* Boutons d'incrémentation Gâté */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => handleUpdateLine(line, 'qtyDamaged', line.qtyDamaged - 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', minWidth: '28px', opacity: isLocked ? 0.4 : 1 }}
                      >
                        <Minus size={13} />
                      </button>

                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        className="form-input tabular-nums"
                        value={line.qtyDamaged}
                        onChange={(e) => handleUpdateLine(line, 'qtyDamaged', e.target.value)}
                        style={{ 
                          width: '65px', 
                          textAlign: 'center', 
                          padding: '5px', 
                          fontWeight: 700,
                          color: line.qtyDamaged > 0 ? '#991b1b' : '#0f172a',
                          borderColor: line.qtyDamaged > 0 ? '#fca5a5' : '#e2e8f0',
                          backgroundColor: line.qtyDamaged > 0 ? '#fef2f2' : '#ffffff',
                          opacity: isLocked ? 0.6 : 1
                        }}
                      />

                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => handleUpdateLine(line, 'qtyDamaged', line.qtyDamaged + 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', minWidth: '28px', opacity: isLocked ? 0.4 : 1 }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </td>

                  {/* Motif obligatoire si gâté & Observation */}
                  <td>
                    {hasDamage ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <select
                          className="form-select"
                          disabled={isLocked}
                          style={{ 
                            fontSize: '0.8125rem', 
                            padding: '4px 8px', 
                            borderColor: '#fca5a5',
                            backgroundColor: '#fffaf0',
                            opacity: isLocked ? 0.6 : 1
                          }}
                          value={line.damageReason || ''}
                          onChange={(e) => handleUpdateLine(line, 'damageReason', e.target.value as DamageReason)}
                        >
                          <option value="">-- Choisir motif dégradation --</option>
                          {damageReasonsList.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          disabled={isLocked}
                          placeholder="Observation sur l'anomalie..."
                          className="form-input"
                          style={{ fontSize: '0.75rem', padding: '4px 8px', opacity: isLocked ? 0.6 : 1 }}
                          value={line.observation || ''}
                          onChange={(e) => handleUpdateLine(line, 'observation', e.target.value)}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        disabled={isLocked}
                        placeholder="Observation éventuelle..."
                        className="form-input"
                        style={{ fontSize: '0.75rem', padding: '4px 8px', opacity: isLocked ? 0.6 : 1 }}
                        value={line.observation || ''}
                        onChange={(e) => handleUpdateLine(line, 'observation', e.target.value)}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL 1 : CONFIRMATION DE CLÔTURE & SOUMISSION À L'ADMINISTRATION */}
      {confirmSubmitModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <Send size={18} color="#2563eb" />
                <span>Clôture du Comptage & Soumission à l'Administration</span>
              </div>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '16px' }}>
                Vous êtes sur le point de clore votre phase de comptage pour la mission <strong>{currentInventory.code}</strong>.
              </p>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                  <span>Total articles en bon état :</span>
                  <strong className="tabular-nums">{totalQtyGood}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem', color: '#991b1b' }}>
                  <span>Total articles gâtés déclarés :</span>
                  <strong className="tabular-nums">{totalQtyDamaged}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontWeight: 700 }}>
                  <span>Montant valorisé total :</span>
                  <span className="tabular-nums" style={{ color: '#0f172a' }}>{formatFCFA(totalGeneral)}</span>
                </div>
              </div>

              <div className="alert-banner warning">
                <Lock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.8125rem' }}>
                  <strong>Règle de verrouillage stricte :</strong> Une fois le comptage soumis, vous n'aurez plus la main pour modifier 
                  directement l'inventaire. Toute rectification ultérieure devra obligatoirement être soumise par message écrit dans l'application.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setConfirmSubmitModal(false)} className="btn btn-secondary">
                Continuer le Comptage
              </button>
              <button onClick={handleSubmitCounting} className="btn btn-primary">
                <Check size={16} />
                <span>Confirmer, Clôturer & Soumettre</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2 : DEMANDE DE MODIFICATION PAR ÉCRIT DANS L'APPLICATION */}
      {showMessageModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <MessageSquare size={18} color="#2563eb" />
                <span>Demande de Modification par Écrit (Messagerie d'Inventaire)</span>
              </div>
              <button onClick={() => setShowMessageModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <Check size={20} />
              </button>
            </div>

            <form onSubmit={handleSendModificationRequest}>
              <div className="modal-body">
                {msgFeedback && (
                  <div className="alert-banner success" style={{ marginBottom: '16px' }}>
                    <Check size={16} />
                    <span>{msgFeedback}</span>
                  </div>
                )}

                <div className="alert-banner info" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.8125rem' }}>
                    Le comptage étant soumis, formulez ici par écrit votre justification ou rectification. Les contrôleurs examineront votre demande.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Article concerné (optionnel)</label>
                  <select
                    className="form-select"
                    value={msgLineId}
                    onChange={(e) => setMsgLineId(e.target.value)}
                  >
                    <option value="">-- Concerne l'ensemble de l'inventaire --</option>
                    {currentInventory.lines.map(l => (
                      <option key={l.id} value={l.id}>{l.designation} ({l.color || l.category})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Quantité Bon État proposée</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="Ex: 18"
                      value={msgQtyGood !== undefined ? msgQtyGood : ''}
                      onChange={(e) => setMsgQtyGood(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Quantité Gâtée proposée</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="Ex: 2"
                      value={msgQtyDamaged !== undefined ? msgQtyDamaged : ''}
                      onChange={(e) => setMsgQtyDamaged(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Explications & Justifications écrites obligatoires *</label>
                  <textarea
                    rows={4}
                    required
                    className="form-input"
                    value={msgContent}
                    onChange={(e) => setMsgContent(e.target.value)}
                    placeholder="Ex: J'ai recompte le fagot situé derrière le rack 3. Il contient 18 barres au lieu de 15 initialement saisies..."
                  />
                </div>

                {/* Pièce jointe photo pour appuyer la demande */}
                <div className="form-group">
                  <label className="form-label">Photo ou document justificatif (optionnel)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="form-input"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setMsgAttachName(file.name);
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setMsgAttachUrl((ev.target?.result as string) || '');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {msgAttachName && (
                    <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '4px', fontWeight: 600 }}>
                      📎 {msgAttachName} — joint à la demande
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    Joignez une photo du rayonnage, du bon de livraison ou du document prouvant l'erreur de saisie.
                  </div>
                </div>

                {/* Historique des requêtes émises sur cet inventaire */}
                {currentInventory.messages && currentInventory.messages.length > 0 && (
                  <div>
                    <label className="form-label">Requêtes déjà enregistrées ({currentInventory.messages.length})</label>
                    <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px' }}>
                      {currentInventory.messages.map(m => (
                        <div key={m.id} style={{ fontSize: '0.75rem', padding: '6px', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                            <span>{m.senderName} ({m.senderRole})</span>
                            <span className={`status-pill ${m.status === 'ACCEPTEE' ? 'success' : m.status === 'REFUSEE' ? 'danger' : 'warning'}`}>
                              {m.status}
                            </span>
                          </div>
                          <div style={{ color: '#475569', marginTop: '2px' }}>{m.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowMessageModal(false)} className="btn btn-secondary">
                  Fermer
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={15} />
                  <span>Transmettre la Demande Écrite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3 : ENVOI DE PIÈCES JOINTES & PHOTOS JUSTIFICATIVES (CHEFS D'AGENCE) */}
      {showAttachModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <Paperclip size={18} color="#2563eb" />
                <span>Pièces Jointes & Photos Justificatives (Boutique / Agence)</span>
              </div>
              <button onClick={() => setShowAttachModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <Check size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadAttachment}>
              <div className="modal-body">
                {attFeedback && (
                  <div className="alert-banner success" style={{ marginBottom: '16px' }}>
                    <Check size={16} />
                    <span>{attFeedback}</span>
                  </div>
                )}

                <div className="alert-banner info" style={{ marginBottom: '16px' }}>
                  <Image size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.8125rem' }}>
                    Les chefs d'agence et responsables peuvent téléverser des photos ou fichiers pour justifier des dégradations, 
                    des litiges de livraison ou des spécificités de leur inventaire.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Sélectionner une photo ou un document justificatif</label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    className="form-input"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAttFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Fichier : <strong>{attFileName || 'Photo_Fissure_Alu_Parakou.jpg'}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Commentaire ou justification écrite *</label>
                  <textarea
                    rows={3}
                    required
                    className="form-input"
                    value={attNotes}
                    onChange={(e) => setAttNotes(e.target.value)}
                    placeholder="Ex: Photo constatant l'oxydation humide sur le lot de barres grises suite à une infiltration d'eau..."
                  />
                </div>

                {/* Liste des justificatifs existants */}
                {currentInventory.attachments && currentInventory.attachments.length > 0 && (
                  <div>
                    <label className="form-label">Justificatifs rattachés ({currentInventory.attachments.length})</label>
                    <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px' }}>
                      {currentInventory.attachments.map(att => (
                        <div key={att.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{att.fileName}</div>
                            <div style={{ color: '#64748b' }}>{att.notes} — par {att.uploadedByName}</div>
                          </div>
                          <span style={{ color: '#2563eb', fontWeight: 600 }}>{(att.fileSize / 1024).toFixed(0)} Ko</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAttachModal(false)} className="btn btn-secondary">
                  Fermer
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={15} />
                  <span>Enregistrer le Justificatif</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
