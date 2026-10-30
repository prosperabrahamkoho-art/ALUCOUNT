import React, { useState } from 'react';
import { 
  Building2, 
  Store, 
  Share2, 
  Check, 
  Clock, 
  ShieldAlert, 
  Calendar, 
  Phone, 
  MapPin, 
  X,
  MessageSquare,
  Plus,
  Settings,
  Percent,
  UserCheck
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../services/store';
import { Shop, ShopInvitation, CompanySettings, LocationType } from '../types';

export const ShopsView: React.FC = () => {
  const store = useALUStore();
  const shops = store.getShops();
  const allUsers = store.getUsers();
  const currentUser = store.getCurrentUser();
  const companySettings = store.getCompanySettings();

  // Modals
  const [selectedShopForInvite, setSelectedShopForInvite] = useState<Shop | null>(null);
  const [createShopModalOpen, setCreateShopModalOpen] = useState(false);
  const [assignManagerShop, setAssignManagerShop] = useState<Shop | null>(null);
  const [companySettingsModalOpen, setCompanySettingsModalOpen] = useState(false);

  // Formulaire nouvelle boutique (Secrétaire de direction)
  const [newShopData, setNewShopData] = useState({
    code: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    type: 'BOUTIQUE' as LocationType,
    managerId: '',
    commissionRate: 3.0,
    initialStockValue: 0,
    initialStockDate: new Date().toLocaleDateString('fr-FR')
  });

  // Formulaire Paramètres Généraux de l'Entreprise
  const [tempCompanySettings, setTempCompanySettings] = useState<CompanySettings>(companySettings);

  // Formulaire Invitation gérant
  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const [generatedInvitation, setGeneratedInvitation] = useState<ShopInvitation | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canManage = currentUser.role === 'SECRETAIRE_DIRECTION' || currentUser.role === 'ADMIN' || currentUser.role === 'PDG' || currentUser.role === 'DG';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopData.code || !newShopData.name) return;

    const res = store.createShop({
      code: newShopData.code,
      name: newShopData.name,
      address: newShopData.address,
      phone: newShopData.phone,
      email: newShopData.email,
      type: newShopData.type,
      managerId: newShopData.managerId || undefined,
      commissionRate: Number(newShopData.commissionRate),
      initialStockValue: Number(newShopData.initialStockValue),
      initialStockDate: newShopData.initialStockDate
    });

    if (res.success) {
      setCreateShopModalOpen(false);
      setNewShopData({
        code: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        type: 'BOUTIQUE',
        managerId: '',
        commissionRate: 3.0,
        initialStockValue: 0,
        initialStockDate: new Date().toLocaleDateString('fr-FR')
      });
      showToast(res.message);
    } else {
      alert(res.message);
    }
  };

  const handleAssignManager = (managerId: string) => {
    if (!assignManagerShop || !managerId) return;
    const res = store.assignShopManager(assignManagerShop.id, managerId);
    if (res.success) {
      setAssignManagerShop(null);
      showToast(res.message);
    } else {
      alert(res.message);
    }
  };

  const handleSaveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateCompanySettings(tempCompanySettings);
    setCompanySettingsModalOpen(false);
    showToast('Paramètres généraux de l\'entreprise mis à jour avec succès.');
  };

  const handleOpenInviteModal = (shop: Shop) => {
    setSelectedShopForInvite(shop);
    setRecipientName('');
    setRecipientContact('');
    setGeneratedInvitation(null);
  };

  const handleGenerateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopForInvite) return;

    const res = store.createShopInvitation({
      shopId: selectedShopForInvite.id,
      role: 'RESPONSABLE_BOUTIQUE',
      recipientName,
      recipientContact,
      durationHours: 72
    });

    if (res.success && res.invitation) {
      setGeneratedInvitation(res.invitation);
      showToast('Invitation sécurisée générée avec succès !');
    } else {
      alert(res.message);
    }
  };

  const getInvitationMessage = (inv: ShopInvitation) => {
    return `Bonjour ${inv.recipientName},

Vous avez été invité(e) par la Direction à accéder à ALUCOUNT, l'application officielle de gestion et validation des inventaires d'ALUTRACO pour la boutique : ${inv.shopName}.

Votre Identifiant Sécurisé : ${inv.token}
Lien d'activation à usage unique : https://alucount.alutraco.bj/activer?token=${inv.token}

Ce lien est valable 72 heures. Vous y définirez votre mot de passe personnel. Pour votre sécurité, ne partagez jamais ce code.

${companySettings.name} — ALUCOUNT`;
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#065f46',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <Check size={18} color="#a7f3d0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* En-tête avec actions Secrétaire */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.05em', marginBottom: '4px' }}>
            <Building2 size={15} />
            <span>Espace Secrétariat de Direction & Administration</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Gestion des Boutiques & Paramètres d'Entreprise
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px' }}>
            Création des boutiques, désignation des responsables et configuration des informations générales de l'entreprise.
          </p>
        </div>

        {canManage && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setTempCompanySettings(store.getCompanySettings());
                setCompanySettingsModalOpen(true);
              }}
              className="btn btn-secondary btn-sm"
            >
              <Settings size={15} color="#475569" />
              <span>Paramètres Généraux de l'Entreprise</span>
            </button>

            <button
              onClick={() => setCreateShopModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={15} />
              <span>+ Créer une Boutique / Agence</span>
            </button>
          </div>
        )}
      </div>

      {/* Règle de sécurité de cloisonnement */}
      <div className="alert-banner info">
        <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8125rem' }}>
          <strong>Cloisonnement & Responsabilités Métiers :</strong> Le Secrétaire crée la boutique dans le système, lui affecte son responsable/chef et définit son pourcentage de commission. Chaque boutique est enregistrée individuellement et dispose de ses propres données et rapports étanches.
        </div>
      </div>

      {/* Grille des Boutiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {shops.map(shop => (
          <div key={shop.id} className="card">
            <div className="card-header">
              <div>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  {shop.code}
                </span>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Store size={16} color="#64748b" />
                  <span>{shop.name}</span>
                </div>
              </div>
              <span className="status-pill success">{shop.status}</span>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#94a3b8" />
                  <span>{shop.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="#94a3b8" />
                  <span>{shop.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '2px' }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Percent size={13} color="#4f46e5" />
                    Commission boutique :
                  </span>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#4f46e5' }}>{shop.commissionRate ?? 3.0}%</span>
                </div>
                {shop.initialStockValue ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Stock initial réf. :</span>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>{formatFCFA(shop.initialStockValue)}</span>
                  </div>
                ) : null}
              </div>

              {/* Responsable de boutique assigné */}
              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Responsable / Chef</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    {shop.managerName || 'Aucun responsable'}
                  </span>
                </div>
                {canManage && (
                  <button
                    onClick={() => setAssignManagerShop(shop)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                  >
                    {shop.managerName ? 'Changer' : 'Désigner'}
                  </button>
                )}
              </div>

              {/* Actions */}
              {canManage && (
                <button
                  onClick={() => handleOpenInviteModal(shop)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <Share2 size={14} />
                  <span>Inviter le gérant par WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── MODAL CRÉATION DE BOUTIQUE (Secrétaire) ── */}
      {createShopModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a' }}>
                <Store size={18} color="#2563eb" />
                <span>Créer une Nouvelle Boutique / Agence</span>
              </div>
              <button onClick={() => setCreateShopModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateShop}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Code Boutique *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: ALT-BT-005"
                      value={newShopData.code}
                      onChange={(e) => setNewShopData({ ...newShopData, code: e.target.value.toUpperCase() })}
                      className="form-input"
                      style={{ fontWeight: 700, textTransform: 'uppercase' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Type de point</label>
                    <select
                      value={newShopData.type}
                      onChange={(e) => setNewShopData({ ...newShopData, type: e.target.value as LocationType })}
                      className="form-select"
                    >
                      <option value="BOUTIQUE">Boutique / Agence</option>
                      <option value="DEPOT_CENTRAL">Dépôt Central</option>
                      <option value="CHANTIER">Chantier</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nom de la Boutique / Agence *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Boutique Ganhi — Centre Affaires"
                    value={newShopData.name}
                    onChange={(e) => setNewShopData({ ...newShopData, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Adresse / Localisation *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Rue du Commerce, Ganhi"
                      value={newShopData.address}
                      onChange={(e) => setNewShopData({ ...newShopData, address: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Téléphone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+229 21 00 00 00"
                      value={newShopData.phone}
                      onChange={(e) => setNewShopData({ ...newShopData, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Commission Boutique (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={newShopData.commissionRate}
                      onChange={(e) => setNewShopData({ ...newShopData, commissionRate: Number(e.target.value) })}
                      className="form-input"
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Stock Initial Réf. (FCFA)</label>
                    <input
                      type="number"
                      min="0"
                      value={newShopData.initialStockValue}
                      onChange={(e) => setNewShopData({ ...newShopData, initialStockValue: Number(e.target.value) })}
                      className="form-input"
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Désigner le Chef / Responsable de boutique :</label>
                  <select
                    value={newShopData.managerId}
                    onChange={(e) => setNewShopData({ ...newShopData, managerId: e.target.value })}
                    className="form-select"
                  >
                    <option value="">-- Aucun responsable pour l'instant (désigner plus tard) --</option>
                    {allUsers
                      .filter(u => u.role === 'RESPONSABLE_BOUTIQUE' || u.role === 'INVENTORISTE' || u.role === 'CONTROLEUR')
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role}) {u.shopId ? '— Déjà assigné' : ''}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setCreateShopModalOpen(false)} className="btn btn-secondary btn-sm">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Créer la boutique
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL DÉSIGNATION DU RESPONSABLE ── */}
      {assignManagerShop && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a' }}>
                <UserCheck size={18} color="#4f46e5" />
                <span>Désignation du Chef de Boutique</span>
              </div>
              <button onClick={() => setAssignManagerShop(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Sélectionnez le responsable/chef à affecter à <strong>{assignManagerShop.name}</strong> ({assignManagerShop.code}).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {allUsers
                  .filter(u => u.role === 'RESPONSABLE_BOUTIQUE' || u.role === 'INVENTORISTE' || u.role === 'ADMIN')
                  .map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleAssignManager(u.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: assignManagerShop.managerId === u.id ? '#eff6ff' : '#ffffff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email} &bull; [{u.role}]</div>
                      </div>
                      {assignManagerShop.managerId === u.id && (
                        <span className="status-pill success" style={{ fontSize: '0.6875rem' }}>Actuel</span>
                      )}
                    </button>
                  ))}
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setAssignManagerShop(null)} className="btn btn-secondary btn-sm">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PARAMÈTRES GÉNÉRAUX DE L'ENTREPRISE (Secrétaire) ── */}
      {companySettingsModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a' }}>
                <Settings size={18} color="#2563eb" />
                <span>Paramètres Généraux de l'Entreprise</span>
              </div>
              <button onClick={() => setCompanySettingsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCompanySettings}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  Ces informations sont utilisées <strong>automatiquement</strong> dans tous les rapports, bordereaux et documents générés par l'application.
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    required
                    value={tempCompanySettings.name}
                    onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, name: e.target.value })}
                    className="form-input"
                    style={{ fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Adresse du Siège *</label>
                    <input
                      type="text"
                      required
                      value={tempCompanySettings.address}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, address: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Ville & Pays</label>
                    <input
                      type="text"
                      value={`${tempCompanySettings.city}, ${tempCompanySettings.country}`}
                      onChange={(e) => {
                        const [city, country] = e.target.value.split(',');
                        setTempCompanySettings({ ...tempCompanySettings, city: city?.trim() || '', country: country?.trim() || '' });
                      }}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Téléphone standard *</label>
                    <input
                      type="text"
                      required
                      value={tempCompanySettings.phone}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">E-mail officiel *</label>
                    <input
                      type="email"
                      required
                      value={tempCompanySettings.email}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, email: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">N° IFU</label>
                    <input
                      type="text"
                      value={tempCompanySettings.ifu || ''}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, ifu: e.target.value })}
                      className="form-input"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Registre de Commerce (RCCM)</label>
                    <input
                      type="text"
                      value={tempCompanySettings.rccm || ''}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, rccm: e.target.value })}
                      className="form-input"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setCompanySettingsModalOpen(false)} className="btn btn-secondary btn-sm">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Enregistrer les paramètres
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL INVITATION RESPONSABLE (WhatsApp) ── */}
      {selectedShopForInvite && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a' }}>
                <Share2 size={18} color="#2563eb" />
                <span>Invitation du Responsable de Boutique</span>
              </div>
              <button onClick={() => setSelectedShopForInvite(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            {!generatedInvitation ? (
              <form onSubmit={handleGenerateInvitation}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    Générez un lien d'accès nominatif pour le responsable de <strong>{selectedShopForInvite.name}</strong>.
                  </p>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nom & Prénoms du responsable *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean-Luc Kpadonou"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Numéro WhatsApp ou E-mail *</label>
                    <input
                      type="text"
                      required
                      placeholder="+229 97 00 00 00 ou email@alutraco.bj"
                      value={recipientContact}
                      onChange={(e) => setRecipientContact(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setSelectedShopForInvite(null)} className="btn btn-secondary btn-sm">
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Générer le lien d'invitation
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="alert-banner success">
                    <Check size={18} />
                    <span>Invitation créée avec succès pour {generatedInvitation.recipientName} !</span>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Message d'invitation prêt pour WhatsApp / Email :</label>
                    <textarea
                      rows={7}
                      readOnly
                      value={getInvitationMessage(generatedInvitation)}
                      className="form-textarea"
                      style={{ fontSize: '0.8125rem', backgroundColor: '#f8fafc', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyText(getInvitationMessage(generatedInvitation))}
                    className="btn btn-primary btn-sm"
                  >
                    {copiedMessage ? <Check size={14} /> : <MessageSquare size={14} />}
                    <span>{copiedMessage ? 'Copié !' : 'Copier le message'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
