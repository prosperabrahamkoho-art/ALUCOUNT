import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Clock, 
  AlertTriangle, 
  Share2, 
  Info, 
  CheckCheck, 
  MessageSquare, 
  ShieldCheck, 
  UserCheck,
  Send,
  Paperclip,
  Image,
  FileText,
  Plus,
  X,
  Eye,
  CornerDownRight,
  Store,
  Upload
} from 'lucide-react';
import { useALUStore } from '../../services/store';
import { ModuleId, MessageProof, MessageAttachment } from '../../types';

interface NotificationsModuleProps {
  onNavigateToModule: (moduleId: ModuleId) => void;
}

export const NotificationsModule: React.FC<NotificationsModuleProps> = ({ onNavigateToModule }) => {
  const store = useALUStore();
  const notifications = store.getNotifications();
  const invitations = store.getInvitations();
  const proofMessages = store.getProofMessages();
  const shops = store.getShops();
  const currentUser = store.getCurrentUser();

  const [activeTab, setActiveTab] = useState<'messages' | 'alerts' | 'invitations'>('messages');

  // Nouveau message / preuve
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MessageProof['category']>('PREUVE_JUSTIFICATIF');
  const [shopId, setShopId] = useState<string>(currentUser.shopId || shops[0]?.id || '');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Modal de réponse pour l'Administration (PDG, Secrétaire, Admin)
  const [replyingMessage, setReplyingMessage] = useState<MessageProof | null>(null);
  const [replyText, setReplyText] = useState('');

  const isAdminOrDirection = ['ADMIN', 'PDG', 'SECRETAIRE_DIRECTION'].includes(currentUser.role);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) store.markNotificationAsRead(n.id);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileUrl = event.target?.result as string;
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type: isImg ? 'IMAGE' : isPdf ? 'PDF' : 'DOCUMENT',
            size: (file.size / 1024).toFixed(1) + ' KB',
            previewUrl: isImg ? fileUrl : undefined
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Ajout rapide d'un justificatif type (exemple de photo dégradation)
  const handleAddSamplePhoto = () => {
    setAttachments(prev => [
      ...prev,
      {
        name: `Photo_Constat_${Date.now().toString().slice(-4)}.jpg`,
        type: 'IMAGE',
        size: '1.8 MB',
        previewUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80'
      }
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;

    const res = store.sendProofMessage({
      subject,
      content,
      category,
      shopId: shopId || undefined,
      attachments
    });

    if (res.success) {
      setShowNewMsgModal(false);
      setSubject('');
      setContent('');
      setAttachments([]);
    } else {
      alert(res.message);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingMessage || !replyText.trim()) return;

    const res = store.replyToProofMessage(replyingMessage.id, replyText);
    if (res.success) {
      setReplyingMessage(null);
      setReplyText('');
    } else {
      alert(res.message);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'WARNING': return <AlertTriangle size={16} color="#d97706" />;
      case 'SUCCESS': return <Check size={16} color="#059669" />;
      case 'ALERT': return <AlertTriangle size={16} color="#dc2626" />;
      default: return <Info size={16} color="#2563eb" />;
    }
  };

  return (
    <div>
      {/* En-tête du module */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563eb', fontSize: '1rem' }}>MODULE 15</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              Messagerie Collaborative, Preuves & Notifications
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Canal d'attestation officiel entre l'Administration (PDG, Secrétariat) et les équipes terrain pour l'envoi de preuves, justificatifs et photos.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => setShowNewMsgModal(true)} 
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} />
            <span>Envoyer Preuve / Message à la Direction</span>
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('messages')}
        >
          <MessageSquare size={14} />
          <span>Messagerie & Justificatifs Photos ({proofMessages.length})</span>
        </button>

        <button 
          className={`btn ${activeTab === 'alerts' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('alerts')}
        >
          <Bell size={14} />
          <span>Alertes & Missions Système ({notifications.length})</span>
        </button>

        <button 
          className={`btn ${activeTab === 'invitations' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('invitations')}
        >
          <Share2 size={14} />
          <span>Invitations Collaborateurs ({invitations.length})</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          ONGLET 1 : MESSAGERIE & PREUVES / JUSTIFICATIFS
         ══════════════════════════════════════════════════ */}
      {activeTab === 'messages' && (
        <div>
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="#2563eb" />
              <div style={{ fontSize: '0.8125rem', color: '#1e40af' }}>
                <strong>Attestations officielles :</strong> Tout utilisateur (Inventoriste, Chef de boutique, Contrôleur, Magasinier) peut transmettre des fichiers, photos et justificatifs pour attester un constat ou justifier un écart. L'Administration (PDG & Secrétariat) peut valider ou répondre à chaque preuve.
              </div>
            </div>
            <button 
              onClick={() => setShowNewMsgModal(true)} 
              className="btn btn-primary btn-sm"
              style={{ padding: '4px 12px', fontSize: '0.75rem' }}
            >
              <Plus size={14} />
              <span>Nouveau Justificatif</span>
            </button>
          </div>

          {proofMessages.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <MessageSquare size={36} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600, color: '#334155' }}>Aucun message ou justificatif envoyé pour le moment.</div>
              <p style={{ fontSize: '0.8125rem' }}>Cliquez sur le bouton ci-dessus pour envoyer votre première attestation ou photo à la Direction.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {proofMessages.map(msg => {
                const isFromCurrentUser = msg.senderId === currentUser.id;

                return (
                  <div key={msg.id} className="card" style={{ borderLeft: msg.status === 'VALIDE_PAR_ADMIN' ? '4px solid #10b981' : msg.status === 'REPONDU' ? '4px solid #2563eb' : '4px solid #f59e0b' }}>
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: msg.category === 'PREUVE_JUSTIFICATIF' ? '#eff6ff' : '#fef3c7',
                          color: msg.category === 'PREUVE_JUSTIFICATIF' ? '#1d4ed8' : '#b45309'
                        }}>
                          {msg.category.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                          {msg.subject}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`status-pill ${msg.status === 'VALIDE_PAR_ADMIN' ? 'success' : msg.status === 'REPONDU' ? 'info' : 'warning'}`}>
                          {msg.status === 'VALIDE_PAR_ADMIN' ? 'Validé par Direction' : msg.status === 'REPONDU' ? 'Réponse Reçue' : 'Transmis à la Direction'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {msg.createdAt}
                        </span>
                      </div>
                    </div>

                    <div className="card-body">
                      {/* Expéditeur & boutique */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8125rem', color: '#64748b', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <span>Émis par : <strong>{msg.senderName}</strong> ({msg.senderRole})</span>
                        {msg.shopName && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Store size={13} />
                              <strong>{msg.shopName}</strong>
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>Destinataire : <strong>Direction & Secrétariat</strong></span>
                      </div>

                      {/* Contenu du message */}
                      <div style={{ fontSize: '0.875rem', color: '#334155', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '6px', marginBottom: '14px', lineHeight: 1.6 }}>
                        {msg.content}
                      </div>

                      {/* Pièces jointes & photos */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Paperclip size={13} color="#2563eb" />
                            <span>Pièces Jointes & Preuves Photographiques ({msg.attachments.length}) :</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            {msg.attachments.map((att, idx) => (
                              <div 
                                key={idx} 
                                style={{
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  backgroundColor: '#ffffff'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                  {att.type === 'IMAGE' ? (
                                    <Image size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                                  ) : (
                                    <FileText size={16} color="#059669" style={{ flexShrink: 0 }} />
                                  )}
                                  <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {att.name}
                                    </div>
                                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                                      {att.size}
                                    </div>
                                  </div>
                                </div>

                                {att.previewUrl && (
                                  <button
                                    onClick={() => setPreviewImage(att.previewUrl || null)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '3px 8px', fontSize: '0.6875rem', color: '#2563eb' }}
                                    title="Agrandir la photo"
                                  >
                                    <Eye size={12} />
                                    <span>Voir</span>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Réponse de l'Administration */}
                      {msg.adminResponse && (
                        <div style={{
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '6px',
                          padding: '12px 14px',
                          marginTop: '10px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.8125rem', color: '#166534' }}>
                              <CornerDownRight size={14} />
                              <span>Réponse Officielle de la Direction :</span>
                            </div>
                            <span style={{ fontSize: '0.6875rem', color: '#15803d' }}>
                              {msg.adminResponse.respondedAt}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: '#14532d', marginBottom: '4px' }}>
                            « {msg.adminResponse.response} »
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#16a34a' }}>
                            Validé par <strong>{msg.adminResponse.responderName}</strong> ({msg.adminResponse.responderRole})
                          </div>
                        </div>
                      )}

                      {/* Bouton pour l'administration si non encore répondu */}
                      {isAdminOrDirection && !msg.adminResponse && (
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setReplyingMessage(msg);
                              setReplyText('');
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                          >
                            <Send size={13} />
                            <span>Répondre & Valider la Preuve</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ONGLET 2 : ALERTES & MISSIONS SYSTÈME
         ══════════════════════════════════════════════════ */}
      {activeTab === 'alerts' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>Flux des Alertes Opérationnelles</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
                <CheckCheck size={14} />
                <span>Tout Marquer comme Lu ({unreadCount})</span>
              </button>
            )}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {notifications.map(notif => (
              <div 
                key={notif.id}
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  backgroundColor: notif.read ? '#ffffff' : '#f8fafc',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ marginTop: '2px' }}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div>
                    <div style={{ fontWeight: notif.read ? 600 : 700, color: '#0f172a', fontSize: '0.875rem', marginBottom: '2px' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '4px' }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                      {notif.timestamp.replace('T', ' à ').substring(0, 16)}
                    </div>
                  </div>
                </div>

                {notif.linkModule && (
                  <button
                    onClick={() => {
                      if (!notif.read) store.markNotificationAsRead(notif.id);
                      onNavigateToModule(notif.linkModule!);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    <span>Consulter</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ONGLET 3 : INVITATIONS WHATSAPP / EMAIL
         ══════════════════════════════════════════════════ */}
      {activeTab === 'invitations' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Identifiant Unique</th>
                <th>Destinataire</th>
                <th>Rôle Invité</th>
                <th>Lien & Token</th>
                <th>Expiration</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563eb' }}>
                    {inv.uniqueIdentifier}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{inv.recipientName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inv.recipientContact}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontWeight: 600 }}>
                      {inv.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569' }}>
                    {inv.token.substring(0, 12)}...
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    {inv.expiresAt.substring(0, 10)}
                  </td>
                  <td>
                    <span className={`status-pill ${inv.status === 'ACTIVATED' ? 'success' : inv.status === 'PENDING' ? 'warning' : 'danger'}`}>
                      {inv.status === 'ACTIVATED' ? 'Activée' : inv.status === 'PENDING' ? 'En attente' : 'Révoquée'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL : NOUVEAU MESSAGE / PREUVE / JUSTIFICATIF
         ══════════════════════════════════════════════════ */}
      {showNewMsgModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <Paperclip size={18} color="#2563eb" />
                <span>Transmettre un Message & Preuves à la Direction</span>
              </div>
              <button onClick={() => setShowNewMsgModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendMessage}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nature de la Transmission *</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as MessageProof['category'])}
                    >
                      <option value="PREUVE_JUSTIFICATIF">Preuve / Justificatif d'Écart</option>
                      <option value="SIGNALEMENT_ANOMALIE">Photo de Dégradation / Anomalie</option>
                      <option value="DEMANDE_EXPLICATION">Bordereau / Attestation de Réception</option>
                      <option value="GENERAL">Demande & Communication Générale</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Agence / Boutique Concernée</label>
                    <select
                      className="form-select"
                      value={shopId}
                      onChange={(e) => setShopId(e.target.value)}
                    >
                      {shops.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Objet / Sujet de l'Attestation *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Photos de barres tordues lors du déchargement du camion..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Explications & Constat Détaillé *</label>
                  <textarea
                    rows={4}
                    required
                    className="form-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Décrivez précisément les faits, quantités constatées, causes du dommage ou références des pièces..."
                  />
                </div>

                {/* Pièces jointes & photos */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Joindre des Fichiers ou Photos (Preuves)</span>
                    <button
                      type="button"
                      onClick={handleAddSamplePhoto}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
                    >
                      + Ajouter exemple photo de profilé dégradé
                    </button>
                  </label>

                  <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '10px' }}>
                    <Upload size={24} color="#64748b" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '8px' }}>
                      Glissez vos photos ou cliquez pour parcourir vos fichiers
                    </div>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                      <span>Choisir un fichier (Photo / PDF / Document)</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  {attachments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {attachments.map((att, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {att.type === 'IMAGE' ? <Image size={14} color="#2563eb" /> : <FileText size={14} color="#2563eb" />}
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e40af' }}>{att.name} ({att.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewMsgModal(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={15} />
                  <span>Transmettre à la Direction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL : RÉPONSE DE L'ADMINISTRATION (PDG, SECRÉTAIRE)
         ══════════════════════════════════════════════════ */}
      {replyingMessage && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <CornerDownRight size={18} color="#2563eb" />
                <span>Arbitrage & Réponse Direction — {replyingMessage.subject}</span>
              </div>
              <button onClick={() => setReplyingMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendReply}>
              <div className="modal-body">
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>
                    Justificatif transmis par : <strong>{replyingMessage.senderName}</strong> ({replyingMessage.senderRole})
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#334155' }}>
                    « {replyingMessage.content} »
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Décision & Réponse Officielle de la Direction *</label>
                  <textarea
                    rows={4}
                    required
                    className="form-textarea"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Ex: Preuve photographique acceptée. Dégradation classée en freinte de transport justifiée. Le stock sera ajusté sans pénalité."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setReplyingMessage(null)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#059669', borderColor: '#059669' }}>
                  <Check size={16} />
                  <span>Valider & Transmettre la Décision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL DE VISUALISATION PLEINE PHOTO
         ══════════════════════════════════════════════════ */}
      {previewImage && (
        <div className="modal-backdrop" onClick={() => setPreviewImage(null)}>
          <div className="modal-content" style={{ maxWidth: '720px', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Preuve Photographique Jointure</span>
              <button onClick={() => setPreviewImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <img 
              src={previewImage} 
              alt="Preuve photographique" 
              style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
