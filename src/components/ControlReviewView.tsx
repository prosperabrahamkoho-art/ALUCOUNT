import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  KeyRound, 
  Lock, 
  Unlock, 
  Clock, 
  RotateCcw, 
  Check, 
  FileCheck, 
  Store, 
  ShieldCheck, 
  Search, 
  History,
  XCircle,
  FileText,
  MessageSquare,
  Paperclip,
  Image,
  ArrowRight,
  Send,
  Eye
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../services/store';
import { Inventory, InventoryLine, Category, InventoryMessage } from '../types';

interface ControlReviewViewProps {
  onOpenPermissionGrant?: (inv: Inventory) => void;
  onOpenFinalValidation?: (inv: Inventory) => void;
  onOpenReport?: (inv: Inventory) => void;
  onOpenReopening?: (inv: Inventory) => void;
  onOpenTreatment?: (invId: string) => void;
}

export const ControlReviewView: React.FC<ControlReviewViewProps> = ({
  onOpenPermissionGrant = () => {},
  onOpenFinalValidation = () => {},
  onOpenReport = () => {},
  onOpenReopening = () => {},
  onOpenTreatment
}) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const inventories = store.getInventories();
  const temporaryPermissions = store.getTemporaryPermissions();

  // Filtrer les inventaires qui concernent la phase de contrôle ou de validation
  const controlInventories = inventories.filter(i => 
    i.status === 'Comptage terminé' || 
    i.status === 'En contrôle' || 
    i.status === 'Prêt pour validation' ||
    i.status === 'Validé et clôturé'
  );

  const [selectedInvId, setSelectedInvId] = useState<string>(
    controlInventories.length > 0 ? controlInventories[0].id : ''
  );
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'LINES' | 'MESSAGES' | 'ATTACHMENTS'>('LINES');

  // Modal correction de ligne
  const [editingLine, setEditingLine] = useState<InventoryLine | null>(null);
  const [correctionQtyGood, setCorrectionQtyGood] = useState<number>(0);
  const [correctionQtyDamaged, setCorrectionQtyDamaged] = useState<number>(0);
  const [correctionNote, setCorrectionNote] = useState('');

  // Traitement d'un message d'inventoriste
  const [treatingMessage, setTreatingMessage] = useState<InventoryMessage | null>(null);
  const [messageDecision, setMessageDecision] = useState<'ACCEPTEE' | 'REFUSEE'>('ACCEPTEE');
  const [messageResponseNote, setMessageResponseNote] = useState('');
  const [applyQuantitiesCheck, setApplyQuantitiesCheck] = useState(true);

  const currentInventory = store.getInventoryById(selectedInvId);

  // Rôles
  const isPDG = currentUser.role === 'PDG' || currentUser.role === 'ADMIN';
  const isSecretaire = currentUser.role === 'SECRETAIRE_DIRECTION';
  const isControleur = currentUser.role === 'CONTROLEUR';
  const isRespInv = currentUser.role === 'RESPONSABLE_INVENTAIRE';

  // Règle formelle : Seuls les contrôleurs et les responsables peuvent changer les informations lors du contrôle
  const canModifyControlInfo = isControleur || isRespInv || currentUser.role === 'ADMIN';
  const isVerifierOnly = !canModifyControlInfo;

  // Capacité de correction directe des lignes en phase 'En contrôle'
  const canCorrectDirectly = currentInventory?.status === 'En contrôle' && canModifyControlInfo;

  const handleOpenControlSession = () => {
    if (!currentInventory) return;
    store.putInControl(currentInventory.id);
  };

  const handleCloseControlSubmitToResponsable = () => {
    if (!currentInventory) return;
    const res = store.closeControlAndSubmitToResponsable(currentInventory.id, 'Vérification et corrections de contrôle achevées par ' + currentUser.name);
    if (!res.success) alert(res.message);
  };

  const handleSubmitToPDG = () => {
    if (!currentInventory) return;
    const res = store.submitToPDG(currentInventory.id, 'Dossier finalisé et vérifié par ' + currentUser.name + ' (Responsable d\'inventaire)');
    if (!res.success) alert(res.message);
  };

  const handleConfirmRejectByPDG = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInventory || !rejectReason) return;
    const res = store.rejectAndReturnToControlByPDG(currentInventory.id, rejectReason);
    if (res.success) {
      setRejectModal(false);
      setRejectReason('');
    } else {
      alert(res.message);
    }
  };

  const handleStartLineCorrection = (line: InventoryLine) => {
    if (!canCorrectDirectly) {
      alert('La correction directe des quantités n\'est autorisée qu\'en phase « En contrôle » pour le personnel de contrôle habilité.');
      return;
    }
    setEditingLine(line);
    setCorrectionQtyGood(line.qtyGood);
    setCorrectionQtyDamaged(line.qtyDamaged);
    setCorrectionNote(line.observation || '');
  };

  const handleSaveLineCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInventory || !editingLine) return;

    const res = store.saveInventoryLine(currentInventory.id, {
      productId: editingLine.productId,
      qtyGood: Number(correctionQtyGood),
      qtyDamaged: Number(correctionQtyDamaged),
      observation: correctionNote || `Ajustement de conformité par le contrôleur ${currentUser.name}`
    });

    if (res.success) {
      setEditingLine(null);
    } else {
      alert(`Erreur : ${res.message}`);
    }
  };

  const handleProcessMessageDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInventory || !treatingMessage) return;

    const res = store.treatInventoryMessage({
      inventoryId: currentInventory.id,
      messageId: treatingMessage.id,
      decision: messageDecision,
      responseNote: messageResponseNote || (messageDecision === 'ACCEPTEE' ? 'Modification validée et appliquée par le contrôle' : 'Requête refusée après contre-visite'),
      applyQuantities: applyQuantitiesCheck
    });

    if (res.success) {
      setTreatingMessage(null);
      setMessageResponseNote('');
    } else {
      alert(res.message);
    }
  };

  if (!currentInventory) {
    return (
      <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
        <CheckCircle2 size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#0f172a' }}>
          Aucun dossier en attente de contrôle
        </h3>
        <p style={{ color: '#64748b' }}>
          Tous les comptages sont à jour ou en phase terrain.
        </p>
      </div>
    );
  }

  const totalGoodAmount = currentInventory.lines.reduce((s, l) => s + l.amountGood, 0);
  const totalDamagedAmount = currentInventory.lines.reduce((s, l) => s + l.amountDamaged, 0);
  const totalGeneral = totalGoodAmount + totalDamagedAmount;
  const totalDamagedUnits = currentInventory.lines.reduce((s, l) => s + l.qtyDamaged, 0);

  const filteredLines = currentInventory.lines.filter(l => 
    searchQuery === '' || 
    l.designation.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (l.color && l.color.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      {/* Sélecteur de dossier d'inventaire */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563eb', fontSize: '1rem' }}>MODULE 09</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              Contrôle, Vérification & Décision Direction
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Correction directe par les contrôleurs, revue des demandes écrites, finalisation et arbitrage par le PDG.
          </p>
        </div>

        {/* Choix de l'inventaire */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Dossier actif :</span>
          <select 
            value={currentInventory.id} 
            onChange={(e) => setSelectedInvId(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontWeight: 600 }}
          >
            {controlInventories.map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.code} — {inv.shopName} ({inv.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BANNIÈRE SI REJET PAR LE PDG AVEC JUSTIFICATIF OBLIGATOIRE */}
      {currentInventory.rejectionReason && currentInventory.status === 'En contrôle' && (
        <div className="alert-banner danger" style={{ marginBottom: '20px', borderLeft: '4px solid #dc2626' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.9375rem', marginBottom: '4px' }}>
              Dossier Rejeté par la Direction Générale & Renvoyé en Contrôle :
            </div>
            <div style={{ fontSize: '0.875rem', color: '#7f1d1d', fontStyle: 'italic', marginBottom: '6px' }}>
              « {currentInventory.rejectionReason} »
            </div>
            <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
              Motif consigné par <strong>{currentInventory.rejectedBy || 'Le PDG'}</strong> le {currentInventory.rejectedAt?.replace('T', ' à ').substring(0, 19)}. 
              Veuillez réexaminer les points discordants et ajuster les quantités avant re-soumission.
            </div>
          </div>
        </div>
      )}

      {/* ── INDICATEUR DE STATUT DE VÉRIFICATION CONTRÔLE (POUR TOUS LES UTILISATEURS) ── */}
      {(() => {
        const isMarkedVerified = currentInventory.status === 'Prêt pour validation' || currentInventory.status === 'Validé et clôturé';
        const isInProgress = currentInventory.status === 'En contrôle';

        if (isMarkedVerified) {
          return (
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '14px 18px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={24} color="#059669" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.9375rem' }}>
                    INVENTAIRE MARQUÉ COMME VÉRIFIÉ PAR LE CONTRÔLE
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#047857' }}>
                    La revue de conformité a été effectuée et certifiée. Les chiffres sont audités et vérifiés.
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', backgroundColor: '#059669', color: '#ffffff', borderRadius: '20px' }}>
                STATUT : VÉRIFIÉ ✓
              </span>
            </div>
          );
        } else if (isInProgress) {
          return (
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '14px 18px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={24} color="#d97706" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.9375rem' }}>
                    INVENTAIRE EN COURS DE VÉRIFICATION PAR LES CONTRÔLEURS
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#b45309' }}>
                    Session de contrôle ouverte. Les contrôleurs habilités effectuent le pointage contradictoire.
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', backgroundColor: '#d97706', color: '#ffffff', borderRadius: '20px' }}>
                STATUT : EN CONTRÔLE ⏳
              </span>
            </div>
          );
        } else {
          return (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 18px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={24} color="#64748b" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#334155', fontSize: '0.9375rem' }}>
                    COMPTAGE TRANSMIS — NON ENCORE MARQUÉ COMME VÉRIFIÉ
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    Le comptage initial est enregistré. La session de contrôle contradictoire n'a pas encore été clôturée.
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', backgroundColor: '#64748b', color: '#ffffff', borderRadius: '20px' }}>
                NON VÉRIFIÉ
              </span>
            </div>
          );
        }
      })()}

      {/* Règle métier : Information pour les rôles en consultation vérification uniquement */}
      {isVerifierOnly && (
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem', color: '#1e40af' }}>
          <Eye size={18} style={{ flexShrink: 0, color: '#2563eb' }} />
          <div>
            <strong>Mode Consultation & Suivi de Vérification :</strong> En tant que <strong>{currentUser.role.replace(/_/g, ' ')}</strong>, vous avez accès à ce module pour vérifier si cet inventaire est marqué comme vérifié. Conformément aux règles ALUTRACO, <strong>seuls les Contrôleurs et les Responsables d'inventaire</strong> peuvent modifier les informations et les quantités lors du contrôle.
          </div>
        </div>
      )}

      {/* BANNIÈRE D'ÉTAT DU DOSSIER & ACTIONS SELON LE RÔLE */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className={`status-pill ${
                  currentInventory.status === 'Validé et clôturé' ? 'success' :
                  currentInventory.status === 'Prêt pour validation' ? 'info' : 
                  currentInventory.status === 'En contrôle' ? 'warning' : 'info'
                }`}>
                  {currentInventory.status}
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentInventory.code}
                </span>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Version {currentInventory.version}.0
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8125rem', color: '#475569', flexWrap: 'wrap' }}>
                <span>Boutique : <strong>{currentInventory.shopName}</strong></span>
                <span>•</span>
                <span>Catégorie : <strong>{currentInventory.category}</strong></span>
                <span>•</span>
                <span>Inventoriste : {currentInventory.assignedCounterName || 'Terrain'}</span>
              </div>
            </div>

            {/* Actions précises du cycle de vie */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Étape 1 : Le PDG ou la Secrétaire met en contrôle */}
              {currentInventory.status === 'Comptage terminé' && (isPDG || isSecretaire) && (
                <button onClick={handleOpenControlSession} className="btn btn-primary btn-sm">
                  <Unlock size={15} />
                  <span>Mettre l'Inventaire en Contrôle</span>
                </button>
              )}

              {/* Étape 2 : Le Contrôleur clôture le contrôle et soumet au Responsable d'inventaire */}
              {currentInventory.status === 'En contrôle' && (isControleur || isPDG || isRespInv) && (
                <button onClick={handleCloseControlSubmitToResponsable} className="btn btn-primary btn-sm" style={{ backgroundColor: '#0f172a' }}>
                  <CheckCircle2 size={15} />
                  <span>Clôturer Contrôle & Soumettre au Responsable</span>
                </button>
              )}

              {/* Étape 3 : Le Responsable d'inventaire finalise et soumet au PDG */}
              {currentInventory.status === 'Prêt pour validation' && (isRespInv || isPDG) && (
                <button onClick={handleSubmitToPDG} className="btn btn-secondary btn-sm" style={{ borderColor: '#2563eb', color: '#2563eb' }}>
                  <Send size={15} />
                  <span>Transmettre au PDG pour Arbitrage</span>
                </button>
              )}

              {/* Étape 4 : Décision du PDG -> Valider OU Rejeter avec motif */}
              {currentInventory.status === 'Prêt pour validation' && isPDG && (
                <>
                  <button onClick={() => setRejectModal(true)} className="btn btn-danger btn-sm" title="Rejeter et renvoyer en contrôle avec justificatif obligatoire">
                    <RotateCcw size={15} />
                    <span>Rejeter (Renvoyer en Contrôle)</span>
                  </button>

                  <button 
                    onClick={() => onOpenFinalValidation(currentInventory)} 
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                    title="Valider définitivement et clôturer l'inventaire"
                  >
                    <ShieldCheck size={16} />
                    <span>Valider & Clôturer Définitivement</span>
                  </button>
                </>
              )}

              {/* Si déjà validé */}
              {currentInventory.status === 'Validé et clôturé' && (
                <>
                  <button onClick={() => onOpenReport(currentInventory)} className="btn btn-primary btn-sm">
                    <FileText size={15} />
                    <span>Consulter le Rapport Officiel Certifié</span>
                  </button>

                  {isPDG && (
                    <button onClick={() => onOpenReopening(currentInventory)} className="btn btn-secondary btn-sm" style={{ color: '#b91c1c' }}>
                      <AlertTriangle size={15} />
                      <span>Réouverture Exceptionnelle</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SOUS-ONGLETS : Lignes d'inventaire / Demandes écrites des inventoristes / Pièces jointes des boutiques */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          className={`btn ${activeSubTab === 'LINES' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveSubTab('LINES')}
        >
          <FileCheck size={15} />
          <span>Lignes & Rectifications Contrôleurs ({currentInventory.lines.length})</span>
        </button>

        <button
          className={`btn ${activeSubTab === 'MESSAGES' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveSubTab('MESSAGES')}
        >
          <MessageSquare size={15} />
          <span>Demandes Écrites Inventoristes ({currentInventory.messages?.length || 0})</span>
        </button>

        <button
          className={`btn ${activeSubTab === 'ATTACHMENTS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveSubTab('ATTACHMENTS')}
        >
          <Paperclip size={15} />
          <span>Justificatifs & Photos Boutiques ({currentInventory.attachments?.length || 0})</span>
        </button>
      </div>

      {/* VUE 1 : LIGNES D'INVENTAIRE & RECTIFICATION DIRECTE DES CONTRÔLEURS */}
      {activeSubTab === 'LINES' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              {canCorrectDirectly ? (
                <span style={{ color: '#059669', fontWeight: 600 }}>
                  ✓ Pouvoir de correction actif : Vous pouvez cliquer sur "Rectifier" pour corriger toute quantité mal saisie.
                </span>
              ) : (
                <span>Mode consultation. Les modifications directes sont réservées à la phase de contrôle.</span>
              )}
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Filtrer article, couleur..."
                className="form-input"
                style={{ paddingLeft: '32px', fontSize: '0.8125rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Prix Catalogue</th>
                  <th style={{ textAlign: 'center' }}>Qté Bon État</th>
                  <th style={{ textAlign: 'center' }}>Qté Gâtée</th>
                  <th style={{ textAlign: 'right' }}>Valorisation</th>
                  <th>Statut Contrôle</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLines.map(line => (
                  <tr key={line.id} style={{ backgroundColor: line.wasCorrected ? '#fefce8' : undefined }}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{line.designation}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {line.color || line.category} • {line.unit}
                      </div>
                    </td>

                    <td className="tabular-nums" style={{ color: '#64748b' }}>
                      {formatFCFA(line.officialPriceSnapshot)}
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#059669' }} className="tabular-nums">
                      {line.qtyGood}
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: 700, color: line.qtyDamaged > 0 ? '#dc2626' : '#64748b' }} className="tabular-nums">
                      {line.qtyDamaged}
                      {line.damageReason && (
                        <div style={{ fontSize: '0.6875rem', color: '#991b1b', fontWeight: 400 }}>
                          {line.damageReason}
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 700 }} className="tabular-nums">
                      {formatFCFA(line.totalAmount)}
                    </td>

                    <td>
                      {line.wasCorrected ? (
                        <span className="status-pill warning" style={{ fontSize: '0.6875rem' }} title="Quantité rectifiée en phase de contrôle">
                          Rectifié par Contrôleur
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Conforme terrain</span>
                      )}
                      {line.observation && (
                        <div style={{ fontSize: '0.6875rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                          « {line.observation} »
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {canCorrectDirectly ? (
                        <button
                          onClick={() => handleStartLineCorrection(line)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                        >
                          <span>Rectifier</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* VUE 2 : TRAITEMENT DES DEMANDES ÉCRITES DES INVENTORISTES */}
      {activeSubTab === 'MESSAGES' && (
        <div>
          {(!currentInventory.messages || currentInventory.messages.length === 0) ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              <MessageSquare size={36} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <div>Aucune demande écrite de modification émise par les inventoristes pour cette session.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentInventory.messages.map(msg => (
                <div key={msg.id} className="card" style={{ borderLeft: msg.status === 'EN_ATTENTE' ? '4px solid #f59e0b' : msg.status === 'ACCEPTEE' ? '4px solid #10b981' : '4px solid #ef4444' }}>
                  <div className="card-body" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{msg.senderName}</span>
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>{msg.senderRole}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>le {msg.timestamp.replace('T', ' à ').substring(0, 16)}</span>
                      </div>

                      <span className={`status-pill ${msg.status === 'ACCEPTEE' ? 'success' : msg.status === 'REFUSEE' ? 'danger' : 'warning'}`}>
                        {msg.status === 'EN_ATTENTE' ? 'En attente d\'arbitrage' : msg.status === 'ACCEPTEE' ? 'Acceptée' : 'Refusée'}
                      </span>
                    </div>

                    {msg.lineDesignation && (
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563eb', marginBottom: '4px' }}>
                        Article ciblé : {msg.lineDesignation} 
                        {msg.proposedQtyGood !== undefined && ` • Proposé Bon État: ${msg.proposedQtyGood}`}
                        {msg.proposedQtyDamaged !== undefined && ` • Proposé Gâté: ${msg.proposedQtyDamaged}`}
                      </div>
                    )}

                    <div style={{ fontSize: '0.875rem', color: '#334155', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', marginBottom: '8px' }}>
                      « {msg.content} »
                    </div>

                    {/* Pièce jointe / photo de la demande */}
                    {msg.attachmentName && (
                      <div style={{ marginBottom: '8px', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <Image size={16} color="#2563eb" />
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1d4ed8' }}>
                            Pièce jointe : {msg.attachmentName}
                          </span>
                        </div>
                        {msg.attachmentUrl && msg.attachmentUrl.startsWith('data:image') ? (
                          <img
                            src={msg.attachmentUrl}
                            alt={msg.attachmentName}
                            style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '4px', objectFit: 'contain', border: '1px solid #e2e8f0' }}
                          />
                        ) : msg.attachmentUrl ? (
                          <a href={msg.attachmentUrl} download={msg.attachmentName} style={{ fontSize: '0.8125rem', color: '#2563eb', textDecoration: 'underline' }}>
                            📥 Télécharger le document justificatif
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fichier joint (aperçu non disponible)</span>
                        )}
                      </div>
                    )}

                    {msg.responseNote && (
                      <div style={{ fontSize: '0.8125rem', color: '#047857', marginTop: '6px' }}>
                        <strong>Réponse du Contrôle :</strong> {msg.responseNote} — par {msg.treatedBy}
                      </div>
                    )}

                    {/* Actions de traitement réservées aux contrôleurs et responsables */}
                    {msg.status === 'EN_ATTENTE' && (isControleur || isRespInv || isPDG) && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => {
                            setTreatingMessage(msg);
                            setMessageDecision('ACCEPTEE');
                            setMessageResponseNote('Ajustement validé par le contrôle de conformité');
                            setApplyQuantitiesCheck(true);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                        >
                          <Check size={14} />
                          <span>Accepter & Appliquer</span>
                        </button>

                        <button
                          onClick={() => {
                            setTreatingMessage(msg);
                            setMessageDecision('REFUSEE');
                            setMessageResponseNote('Recomptage contradictoire : quantité initiale confirmée');
                            setApplyQuantitiesCheck(false);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#dc2626' }}
                        >
                          <XCircle size={14} />
                          <span>Refuser la demande</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VUE 3 : PIÈCES JOINTES & PHOTOS JUSTIFICATIVES BOUTIQUE */}
      {activeSubTab === 'ATTACHMENTS' && (
        <div>
          {(!currentInventory.attachments || currentInventory.attachments.length === 0) ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              <Paperclip size={36} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <div>Aucune photo ou document justificatif n'a été rattaché à cet inventaire.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {currentInventory.attachments.map(att => (
                <div key={att.id} className="card">
                  <div className="card-body" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                        <Image size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{att.fileName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{(att.fileSize / 1024).toFixed(1)} Ko • {att.uploadedAt.substring(0, 10)}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#334155', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                      {att.notes || 'Justificatif apporté par l\'agence'}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                      Téléversé par : <strong>{att.uploadedByName}</strong> ({att.uploadedRole})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1 : RECTIFICATION DIRECTE D'UNE QUANTITÉ PAR LE CONTRÔLEUR */}
      {editingLine && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <CheckCircle2 size={18} color="#2563eb" />
                <span>Rectification de Quantité (Contrôleur)</span>
              </div>
            </div>

            <form onSubmit={handleSaveLineCorrection}>
              <div className="modal-body">
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{editingLine.designation}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Prix unitaire figé : {formatFCFA(editingLine.officialPriceSnapshot)}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Quantité Bon État Réelle *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="form-input"
                      value={correctionQtyGood}
                      onChange={(e) => setCorrectionQtyGood(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Quantité Gâtée Réelle *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="form-input"
                      value={correctionQtyDamaged}
                      onChange={(e) => setCorrectionQtyDamaged(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Motif de la rectification / Contrôle contradictoire *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ex: Recomptage physique effectué avec le magasinier. Correction de 2 barres mal déclarées initialement..."
                    className="form-input"
                    value={correctionNote}
                    onChange={(e) => setCorrectionNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setEditingLine(null)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Enregistrer la Rectification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : REJET DU RAPPORT PAR LE PDG AVEC JUSTIFICATIF OBLIGATOIRE */}
      {rejectModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#dc2626' }}>
                <RotateCcw size={18} />
                <span>Rejet du Rapport & Renvoi en Contrôle (Décision PDG)</span>
              </div>
            </div>

            <form onSubmit={handleConfirmRejectByPDG}>
              <div className="modal-body">
                <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '16px' }}>
                  En tant que <strong>PDG</strong>, vous avez le pouvoir de rejeter ce rapport d'inventaire et d'exiger une contre-expertise complète par l'équipe de contrôle.
                </p>

                <div className="form-group">
                  <label className="form-label">
                    <span>Justificatif motivé obligatoire du rejet *</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Précisez impérativement les anomalies constatées ou les points à vérifier (ex: écart injustifié de 350 000 FCFA sur l'Aluminium Blanc)..."
                    className="form-input"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Ce justificatif sera consigné de façon immuable dans le dossier d'audit et transmis immédiatement aux contrôleurs.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setRejectModal(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-danger">
                  <XCircle size={16} />
                  <span>Confirmer le Rejet & Renvoyer en Contrôle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3 : ARBITRAGE D'UNE DEMANDE ÉCRITE D'INVENTORISTE */}
      {treatingMessage && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <MessageSquare size={18} color="#2563eb" />
                <span>Arbitrage de la Demande Écrite</span>
              </div>
            </div>

            <form onSubmit={handleProcessMessageDecision}>
              <div className="modal-body">
                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '8px' }}>
                  Demande formulée par : <strong>{treatingMessage.senderName}</strong>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '14px' }}>
                  « {treatingMessage.content} »
                </div>

                <div className="form-group">
                  <label className="form-label">Décision du Contrôle</label>
                  <select
                    className="form-select"
                    value={messageDecision}
                    onChange={(e) => setMessageDecision(e.target.value as any)}
                  >
                    <option value="ACCEPTEE">Accepter la demande et ajuster la ligne</option>
                    <option value="REFUSEE">Refuser la demande</option>
                  </select>
                </div>

                {messageDecision === 'ACCEPTEE' && treatingMessage.lineId && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', marginBottom: '14px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={applyQuantitiesCheck}
                      onChange={(e) => setApplyQuantitiesCheck(e.target.checked)}
                    />
                    <span>Appliquer directement les nouvelles quantités proposées sur l'article</span>
                  </label>
                )}

                <div className="form-group">
                  <label className="form-label">Commentaire écrit d'arbitrage *</label>
                  <textarea
                    rows={3}
                    required
                    className="form-input"
                    value={messageResponseNote}
                    onChange={(e) => setMessageResponseNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setTreatingMessage(null)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Enregistrer la Décision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
