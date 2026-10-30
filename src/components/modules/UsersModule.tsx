import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Check, 
  X, 
  Store, 
  KeyRound, 
  Lock, 
  Share2,
  Trash2,
  Clock,
  Send,
  Copy,
  ExternalLink,
  AlertTriangle,
  UserCheck,
  Smartphone,
  MessageCircle,
  Mail,
  CheckCircle2,
  Key
} from 'lucide-react';
import { useALUStore } from '../../services/store';
import { User, UserRole, ShopInvitation } from '../../types';

export const UsersModule: React.FC = () => {
  const store = useALUStore();
  const users = store.getUsers();
  const shops = store.getShops();
  const invitations = store.getInvitations();
  const currentUser = store.getCurrentUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('TOUS');
  const [activeTab, setActiveTab] = useState<'USERS' | 'INVITATIONS'>('USERS');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [generatedInvitation, setGeneratedInvitation] = useState<ShopInvitation | null>(null);

  // Form states - Création directe
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('CONTROLEUR');
  const [newPhone, setNewPhone] = useState('');
  const [newShopId, setNewShopId] = useState('');
  const [isDesignated, setIsDesignated] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states - Invitation sécurisée renseignée par la Secrétaire de Direction
  const [invRecipientName, setInvRecipientName] = useState('');
  const [invRecipientEmail, setInvRecipientEmail] = useState('');
  const [invRecipientPhone, setInvRecipientPhone] = useState('');
  const [invRole, setInvRole] = useState<UserRole>('RESPONSABLE_BOUTIQUE');
  const [invShopId, setInvShopId] = useState('');
  const [invDurationHours, setInvDurationHours] = useState<number>(48);

  const isAdmin = currentUser.role === 'ADMIN';
  const isSecretaire = currentUser.role === 'SECRETAIRE_DIRECTION';

  // RÈGLE MÉTIER FORMELLE :
  // 1. La Secrétaire de Direction renseigne les données du nouveau membre et transmet l'invitation
  const canAddPeople = isSecretaire || isAdmin;

  // 2. MONOPOLE STRICT : Seul l'Administrateur du SaaS (Propriétaire de la plateforme) peut supprimer un membre.
  // LE SECRÉTAIRE NE PEUT PAS SUPPRIMER UN MEMBRE, NI LE PDG.
  const canDeletePeople = isAdmin;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = store.createUser({
      name: newName,
      email: newEmail,
      role: newRole,
      phone: newPhone,
      shopId: newShopId || undefined,
      isDesignatedByPDG: newRole === 'RESPONSABLE_INVENTAIRE' ? isDesignated : false
    });

    if (res.success) {
      setFeedback('Utilisateur créé avec succès ! Identifiant unique attribué.');
      setTimeout(() => {
        setShowCreateModal(false);
        setFeedback(null);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
      }, 1200);
    } else {
      alert(res.message);
    }
  };

  const handleGenerateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    const res = store.createShopInvitation({
      recipientName: invRecipientName,
      recipientEmail: invRecipientEmail,
      recipientPhone: invRecipientPhone,
      recipientContact: invRecipientPhone || invRecipientEmail,
      role: invRole,
      shopId: invShopId || undefined,
      durationHours: Number(invDurationHours)
    });

    if (res.success && res.invitation) {
      setGeneratedInvitation(res.invitation);
    } else {
      alert(res.message);
    }
  };

  // RÈGLE FORMELLE : Aucun code n'est généré d'avance dans le message !
  // Seul l'identifiant unique officiel (ID) et le lien sont générés.
  // L'invité clique sur le lien, renseigne son email et reçoit alors son code par email pour s'authentifier.
  const getAutomatedInvitationMessage = (inv: ShopInvitation) => {
    const activationUrl = `${window.location.origin}/?mode=activate&id=${inv.uniqueIdentifier}&email=${encodeURIComponent(inv.recipientEmail || '')}&token=${inv.token}`;

    return `🏛️ *INVITATION OFFICIELLE ALUCOUNT (ALUTRACO)*
Bonjour *${inv.recipientName}*,

Le Secrétariat de Direction vous convie officiellement à rejoindre l'application *ALUCOUNT* en qualité de *${inv.role.replace(/_/g, ' ')}* (${inv.shopName || 'Réseau Central'}).

📌 *VOTRE IDENTIFIANT UNIQUE OFFICIEL :*
👉 *${inv.uniqueIdentifier}* 👈

🔗 *VOTRE LIEN D'ACTIVATION SÉCURISÉ :*
${activationUrl}

⏱️ *Validité accordée :* ${inv.durationHours} heures.

📝 *COMMENT ACTIVER VOTRE ACCÈS (AUTHENTIFICATION EMAIL) :*
1️⃣ Cliquez sur le lien direct ci-dessus.
2️⃣ Renseignez votre adresse email : vous recevrez immédiatement un code de confirmation par mail.
3️⃣ Tapez le code de sécurité reçu pour valider votre email.
4️⃣ Choisissez enfin votre propre mot de passe personnel sécurisé.

Ce mot de passe et votre identifiant vous permettront désormais de vous connecter sur n'importe quel ordinateur, tablette ou smartphone.
_Secrétariat de Direction ALUTRACO — Service Central des Comptes_`;
  };

  const handleSendWhatsApp = (inv: ShopInvitation) => {
    const text = getAutomatedInvitationMessage(inv);
    const cleanPhone = (inv.recipientPhone || inv.recipientContact || '').replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = (inv: ShopInvitation) => {
    const text = getAutomatedInvitationMessage(inv);
    const recipient = inv.recipientEmail || (inv.recipientContact?.includes('@') ? inv.recipientContact : '');
    const subject = `[ALUTRACO] Invitation Officielle ALUCOUNT — Activation de votre accès (${inv.uniqueIdentifier})`;
    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.open(mailto, '_blank');
  };

  const handleDeleteUser = (user: User) => {
    if (!canDeletePeople) {
      alert('Action formellement interdite : Seul l\'Administrateur du SaaS détient le monopole exclusif de supprimer un utilisateur. Ni la Secrétaire de Direction ni le PDG ne peuvent supprimer un membre.');
      return;
    }

    if (window.confirm(`Confirmez-vous le retrait irrévocable de l'utilisateur ${user.name} (${user.role}) ? Seul l'Administrateur du SaaS détient cette habilitation.`)) {
      const res = store.deleteUser(user.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchRole = roleFilter === 'TOUS' || u.role === roleFilter;
    const matchSearch = searchQuery === '' || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.uniqueIdentifier && u.uniqueIdentifier.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchRole && matchSearch;
  });

  return (
    <div>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563eb', fontSize: '1rem' }}>MODULE 03</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              Gestion des Utilisateurs & Invitations Sécurisées
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Attribution des identifiants uniques, invitations WhatsApp/Email par la <strong>Secrétaire de Direction</strong> et monopole de suppression exclusif réservé à l'<strong>Administrateur du SaaS</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Bouton Invitation avec lien unique (accessible Secrétaire & Admin) */}
          {canAddPeople && (
            <button 
              onClick={() => {
                setGeneratedInvitation(null);
                setShowInvitationModal(true);
              }} 
              className="btn btn-secondary btn-sm"
              title="Générer un lien unique temporaire avec code à 6 chiffres"
            >
              <Share2 size={15} />
              <span>Inviter Collaborateur (WhatsApp / Email)</span>
            </button>
          )}

          {/* Bouton Création directe */}
          {canAddPeople && (
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
              <UserPlus size={15} />
              <span>Créer Utilisateur Direct</span>
            </button>
          )}
        </div>
      </div>

      {/* Règle de séparation des pouvoirs */}
      <div className="alert-banner info" style={{ marginBottom: '20px' }}>
        <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 600, marginBottom: '2px' }}>
            Règle de Gouvernance des Accès ALUCOUNT :
          </div>
          <div>
            La <strong>Secrétaire de Direction</strong> renseigne les coordonnées du nouveau membre et transmet l'invitation automatique directement par <strong>WhatsApp</strong> et par <strong>Email</strong> avec son code de confirmation à 6 chiffres. 
            <strong>LE SECRÉTAIRE NE PEUT PAS SUPPRIMER UN MEMBRE</strong>, ni le PDG. Seul l'<strong>Administrateur du SaaS</strong> (Propriétaire de la plateforme) détient le monopole exclusif et suprême de supprimer un utilisateur.
          </div>
        </div>
      </div>

      {/* Onglets Utilisateurs / Invitations */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          className={`btn ${activeTab === 'USERS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('USERS')}
        >
          <Users size={15} />
          <span>Comptes Utilisateurs Actifs ({users.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'INVITATIONS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('INVITATIONS')}
        >
          <Clock size={15} />
          <span>Invitations & Liens Temporaires ({invitations.length})</span>
        </button>
      </div>

      {activeTab === 'USERS' && (
        <>
          {/* Barre de filtres */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-body" style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Filtrer par Rôle</label>
                  <select 
                    className="form-select" 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    <option value="TOUS">Tous les rôles</option>
                    <option value="ADMIN">Administrateur SaaS (Fondateur)</option>
                    <option value="PDG">PDG / Direction Suprême</option>
                    <option value="MAGASINIER">Magasinier Général (monopole prix)</option>
                    <option value="SECRETAIRE_DIRECTION">Secrétaire de la Direction</option>
                    <option value="RESPONSABLE_INVENTAIRE">Responsables d'Inventaire</option>
                    <option value="CONTROLEUR">Personnel de Contrôle</option>
                    <option value="INVENTORISTE">Inventoristes</option>
                    <option value="RESPONSABLE_BOUTIQUE">Chefs d'agence / Responsables Boutique</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Rechercher un collaborateur (Nom, Email, ID Unique)</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    <input
                      type="text"
                      placeholder="Ex: ALU-USR, Dossou, paul@alutraco.bj..."
                      className="form-input"
                      style={{ paddingLeft: '32px', fontSize: '0.8125rem' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE DES UTILISATEURS */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Identifiant Unique</th>
                  <th>Collaborateur</th>
                  <th>Rôle Attribué</th>
                  <th>Agence / Périmètre</th>
                  <th>Contact Téléphone</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const shop = shops.find(s => s.id === user.shopId);
                  const isCurrentLogged = user.id === currentUser.id;

                  return (
                    <tr key={user.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', fontSize: '0.8125rem' }}>
                        {user.uniqueIdentifier || 'ALU-USR-' + user.id.replace('usr_', '').substring(0, 5).toUpperCase()}
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</div>
                      </td>

                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: user.role === 'ADMIN' ? '#f3e8ff' : '#f1f5f9',
                          color: user.role === 'ADMIN' ? '#6b21a8' : '#0f172a'
                        }}>
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.8125rem' }}>
                        {shop ? (
                          <span style={{ fontWeight: 600, color: '#334155' }}>{shop.name}</span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Réseau Global National</span>
                        )}
                      </td>

                      <td style={{ fontSize: '0.8125rem', color: '#475569' }} className="tabular-nums">
                        {user.phone || '—'}
                      </td>

                      <td>
                        <span className="status-pill success" style={{ fontSize: '0.6875rem' }}>
                          Actif
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {canDeletePeople ? (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={isCurrentLogged}
                            className="btn btn-secondary btn-sm"
                            style={{
                              color: isCurrentLogged ? '#cbd5e1' : '#dc2626',
                              borderColor: isCurrentLogged ? '#e2e8f0' : '#fca5a5',
                              padding: '4px 8px',
                              cursor: isCurrentLogged ? 'not-allowed' : 'pointer'
                            }}
                            title={isCurrentLogged ? 'Vous ne pouvez pas supprimer votre propre compte' : 'Retirer définitivement cet utilisateur (PDG ou Administrateur SaaS)'}
                          >
                            <Trash2 size={14} />
                            <span>Retirer</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ONGLET INVITATIONS & LIENS TEMPORAIRES */}
      {activeTab === 'INVITATIONS' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Identifiant Unique</th>
                <th>Destinataire</th>
                <th>Rôle Invité</th>
                <th>Agence / Boutique</th>
                <th>Expiration Accordée</th>
                <th>Statut</th>
                <th style={{ textAlign: 'center' }}>Transmission Directe</th>
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
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 6px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                      {inv.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>{inv.shopName || '—'}</td>
                  <td style={{ fontSize: '0.75rem', color: '#b45309' }}>
                    {inv.durationHours}h ({inv.expiresAt})
                  </td>
                  <td>
                    <span className={`status-pill ${inv.status === 'PENDING' ? 'warning' : inv.status === 'ACTIVATED' ? 'success' : 'danger'}`}>
                      {inv.status === 'PENDING' ? 'En attente' : inv.status === 'ACTIVATED' ? 'Activé' : 'Expiré'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleSendWhatsApp(inv)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#16a34a', borderColor: '#bbf7d0', padding: '3px 8px' }}
                        title="Transmettre par WhatsApp le lien sécurisé avec l'identifiant unique"
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleSendEmail(inv)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#2563eb', borderColor: '#bfdbfe', padding: '3px 8px' }}
                        title="Transmettre par Email"
                      >
                        <Mail size={13} />
                        <span>Email</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1 : CRÉATION DIRECTE */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <UserPlus size={18} color="#2563eb" />
                <span>Nouveau Profil Utilisateur ALUCOUNT</span>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                {feedback && (
                  <div className="alert-banner success" style={{ marginBottom: '16px' }}>
                    <span>{feedback}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Nom et Prénom complets *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    placeholder="Ex: M. Jean-Claude Agossou"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Adresse E-mail *</label>
                    <input 
                      type="email" 
                      required 
                      className="form-input" 
                      value={newEmail} 
                      onChange={(e) => setNewEmail(e.target.value)} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Téléphone / WhatsApp</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newPhone} 
                      onChange={(e) => setNewPhone(e.target.value)} 
                      placeholder="+229 97 00 00 00"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Rôle Attribué *</label>
                    <select 
                      className="form-select" 
                      value={newRole} 
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                    >
                      {isAdmin && <option value="PDG">PDG / Direction Suprême</option>}
                      {isAdmin && <option value="MAGASINIER">Magasinier Général (monopole prix)</option>}
                      {isAdmin && <option value="SECRETAIRE_DIRECTION">Secrétaire de la Direction</option>}
                      <option value="CONTROLEUR">Personnel de Contrôle</option>
                      <option value="INVENTORISTE">Inventoriste Terrain</option>
                      <option value="RESPONSABLE_INVENTAIRE">Responsable d'Inventaire</option>
                      <option value="RESPONSABLE_BOUTIQUE">Chef d'agence / Responsable Boutique</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Rattachement Agence / Boutique</label>
                    <select 
                      className="form-select" 
                      value={newShopId} 
                      onChange={(e) => setNewShopId(e.target.value)}
                    >
                      <option value="">-- Réseau Global / Central --</option>
                      {shops.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {newRole === 'RESPONSABLE_INVENTAIRE' && (currentUser.role === 'PDG' || isAdmin) && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', marginTop: '12px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isDesignated} 
                      onChange={(e) => setIsDesignated(e.target.checked)} 
                    />
                    <span>Déléguer expressément l'habilitation PDG de clôture définitive</span>
                  </label>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Enregistrer le Profil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : GÉNÉRATION D'INVITATION AVEC LIEN UNIQUE ET DURÉE PAR LE SECRÉTAIRE */}
      {showInvitationModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <Share2 size={18} color="#2563eb" />
                <span>Générer une Invitation & Lien Sécurisé d'Activation</span>
              </div>
              <button onClick={() => setShowInvitationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {!generatedInvitation ? (
              <form onSubmit={handleGenerateInvitation}>
                <div className="modal-body">
                  <div className="alert-banner info" style={{ marginBottom: '16px' }}>
                    <Clock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8125rem' }}>
                      Renseignez les données du collaborateur. Le système génère un <strong>identifiant unique</strong> et un <strong>lien sécurisé</strong> avec durée d'expiration que vous pourrez transmettre par WhatsApp ou Email.
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nom et Prénom du collaborateur *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={invRecipientName}
                      onChange={(e) => setInvRecipientName(e.target.value)}
                      placeholder="Ex: M. Bernard Zannou (Chef d'agence Parakou)"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Adresse E-mail *</label>
                      <input
                        type="email"
                        required
                        className="form-input"
                        value={invRecipientEmail}
                        onChange={(e) => setInvRecipientEmail(e.target.value)}
                        placeholder="bernard.zannou@alutraco.bj"
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Numéro WhatsApp / Téléphone *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={invRecipientPhone}
                        onChange={(e) => setInvRecipientPhone(e.target.value)}
                        placeholder="+229 97 00 11 22"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Rôle attribué *</label>
                      <select
                        className="form-select"
                        value={invRole}
                        onChange={(e) => setInvRole(e.target.value as UserRole)}
                      >
                        <option value="RESPONSABLE_BOUTIQUE">Chef d'agence / Responsable Boutique</option>
                        <option value="INVENTORISTE">Inventoriste Terrain</option>
                        <option value="CONTROLEUR">Contrôleur d'inventaire</option>
                        <option value="RESPONSABLE_INVENTAIRE">Responsable d'inventaire</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Agence / Boutique rattachée</label>
                      <select
                        className="form-select"
                        value={invShopId}
                        onChange={(e) => setInvShopId(e.target.value)}
                      >
                        <option value="">-- Réseau Global / Central --</option>
                        {shops.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Délai d'expiration du lien accordé par le Secrétaire *</span>
                    </label>
                    <select
                      className="form-select"
                      value={invDurationHours}
                      onChange={(e) => setInvDurationHours(Number(e.target.value))}
                    >
                      <option value={24}>24 heures (1 jour ouvré)</option>
                      <option value={48}>48 heures (2 jours ouvrés - Recommandé)</option>
                      <option value={72}>72 heures (3 jours ouvrés)</option>
                      <option value={168}>7 jours (1 semaine calendaire)</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowInvitationModal(false)} className="btn btn-secondary">
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Check size={16} />
                    <span>Générer Lien & Identifiant Unique</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="modal-body">
                <div className="alert-banner success" style={{ marginBottom: '16px' }}>
                  <CheckCircle2 size={18} />
                  <span>Invitation officielle générée ! Vous pouvez dès à présent la transmettre par WhatsApp et par Email.</span>
                </div>

                {/* Bloc récapitulatif de l'identifiant unique officiel */}
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Identifiant Unique Officiel (ID) :</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
                        {generatedInvitation.uniqueIdentifier}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="status-pill warning" style={{ fontSize: '0.75rem' }}>
                        En attente d'authentification email
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '8px' }}>
                    ⏰ Validité accordée : {generatedInvitation.durationHours} heures (Expire le {generatedInvitation.expiresAt})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '6px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                    🔒 <strong>Authentification sécurisée par email :</strong> Dès que le collaborateur cliquera sur le lien, il confirmera son email et recevra alors son code de vérification par mail pour définir son mot de passe.
                  </div>
                </div>

                {/* Message automatisé */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>Message Automatisé avec Lien & ID :</label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(getAutomatedInvitationMessage(generatedInvitation));
                        alert('Message copié dans le presse-papier !');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    >
                      <Copy size={12} />
                      <span>Copier</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    readOnly
                    className="form-input"
                    style={{ fontSize: '0.75rem', fontFamily: 'monospace', lineHeight: 1.45, backgroundColor: '#f8fafc' }}
                    value={getAutomatedInvitationMessage(generatedInvitation)}
                  />
                </div>

                {/* Boutons d'envoi direct WhatsApp et Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(generatedInvitation)}
                    className="btn"
                    style={{ backgroundColor: '#22c55e', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
                    title="Ouvrir WhatsApp avec le message pré-rempli contenant le lien et l'identifiant"
                  >
                    <MessageCircle size={16} />
                    <span>Envoyer sur WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendEmail(generatedInvitation)}
                    className="btn"
                    style={{ backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
                    title="Ouvrir le client Mail avec l'invitation officielle"
                  >
                    <Mail size={16} />
                    <span>Envoyer par Email</span>
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
