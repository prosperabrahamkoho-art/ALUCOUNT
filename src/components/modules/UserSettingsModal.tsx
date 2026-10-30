import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Shield, 
  Key, 
  Camera, 
  Bell, 
  Palette, 
  Lock, 
  Check, 
  X, 
  Upload, 
  Smartphone, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Trash2,
  Clock
} from 'lucide-react';
import { useALUStore } from '../../services/store';
import { User } from '../../types';

interface UserSettingsModalProps {
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
];

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ onClose }) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const shops = store.getShops();
  const auditLogs = store.getAuditLogs();

  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'security' | 'preferences' | 'logs'>('profile');

  // Formulaire Profil
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '+229 97 00 00 00');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar || '');

  // Formulaire Sécurité
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(currentUser.twoFactorEnabled ?? true);
  
  // Préférences
  const [themePref, setThemePref] = useState<'light' | 'dark' | 'system'>(currentUser.themePreference || 'light');
  const [notifyWA, setNotifyWA] = useState(currentUser.notifyWhatsApp ?? true);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Activités récentes de cet utilisateur
  const userLogs = auditLogs.filter(log => 
    log.authorizedBy?.includes(currentUser.name) || 
    log.reason?.includes(currentUser.name) ||
    log.newValue?.includes(currentUser.name)
  ).slice(0, 10);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const res = store.updateUserProfile(currentUser.id, {
      name,
      email,
      phone,
      avatar: avatarUrl,
      themePreference: themePref,
      notifyWhatsApp: notifyWA,
      twoFactorEnabled: twoFactor
    });

    if (res.success) {
      setFeedback({ type: 'success', text: '✅ Informations personnelles enregistrées avec succès.' });
      setTimeout(() => setFeedback(null), 2500);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setFeedback({ type: 'error', text: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: 'Les deux nouveaux mots de passe ne correspondent pas.' });
      return;
    }

    const res = store.updateUserProfile(currentUser.id, {
      password: newPassword,
      twoFactorEnabled: twoFactor
    });

    if (res.success) {
      setFeedback({ type: 'success', text: '🔐 Mot de passe mis à jour et sécurisé avec succès !' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatarUrl(base64);
      store.updateUserProfile(currentUser.id, { avatar: base64 });
      setFeedback({ type: 'success', text: '📸 Photo de profil mise à jour et enregistrée !' });
      setTimeout(() => setFeedback(null), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (url: string) => {
    setAvatarUrl(url);
    store.updateUserProfile(currentUser.id, { avatar: url });
    setFeedback({ type: 'success', text: '📸 Avatar appliqué avec succès !' });
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    store.updateUserProfile(currentUser.id, { avatar: undefined });
    setFeedback({ type: 'success', text: 'Photo de profil réinitialisée.' });
    setTimeout(() => setFeedback(null), 2000);
  };

  const currentShop = shops.find(s => s.id === currentUser.shopId);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '780px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="modal-header" style={{ paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.125rem',
              overflow: 'hidden',
              border: '2px solid #93c5fd'
            }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
                {name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>
                  {currentUser.uniqueIdentifier || 'ALU-USR-' + currentUser.id.slice(-4).toUpperCase()}
                </span>
                <span>•</span>
                <span style={{ backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, color: '#334155' }}>
                  {currentUser.role.replace(/_/g, ' ')}
                </span>
                {currentShop && (
                  <>
                    <span>•</span>
                    <span>{currentShop.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Message de confirmation */}
        {feedback && (
          <div className={`alert-banner ${feedback.type === 'success' ? 'success' : 'danger'}`} style={{ margin: '16px 20px 0' }}>
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Onglets de configuration */}
        <div style={{ display: 'flex', gap: '8px', padding: '16px 20px 0', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('profile')}
          >
            <UserIcon size={14} />
            <span>Mon Profil</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'avatar' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('avatar')}
          >
            <Camera size={14} />
            <span>Photo & Avatar</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={14} />
            <span>Sécurité & 2FA</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'preferences' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('preferences')}
          >
            <Palette size={14} />
            <span>Préférences</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('logs')}
          >
            <Activity size={14} />
            <span>Mon Activité</span>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {/* ══════════════════════════════════════════════════
              ONGLET 1 : MON PROFIL
             ══════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Nom et Prénom *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Adresse Email Professionnelle *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Numéro Téléphone / WhatsApp</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+229 97 00 00 00"
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Utilisé pour la réception automatique des ordres de mission et convocations PDF.
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Rôle Officiel & Habilitation</label>
                  <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
                    {currentUser.role.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', marginBottom: '4px' }}>
                  <Building2 size={15} color="#2563eb" />
                  <span>Agence & Cloisonnement des Données :</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                  {currentShop ? (
                    <span>Affecté à <strong>{currentShop.name} ({currentShop.code})</strong>. Vous ne recevez que les alertes et inventaires de votre propre agence.</span>
                  ) : (
                    <span>Profil transversal siège ALUTRACO (Accès national multisite).</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════
              ONGLET 2 : PHOTO DE PROFIL & AVATAR
             ══════════════════════════════════════════════════ */}
          {activeTab === 'avatar' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '2rem',
                  overflow: 'hidden',
                  border: '3px solid #bfdbfe',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
                    Image & Avatar de votre Profil
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.8125rem', color: '#64748b' }}>
                    Personnalisez votre apparence sur la plateforme ALUCOUNT (visible dans le header et les journaux de contrôle).
                  </p>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                      <Upload size={14} />
                      <span>Uploader une Photo</span>
                      <input 
                        type="file" 
                        accept="image/png,image/jpeg,image/webp" 
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                      />
                    </label>

                    {avatarUrl && (
                      <button 
                        type="button" 
                        onClick={handleRemoveAvatar} 
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        <Trash2 size={14} />
                        <span>Retirer l'image</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Ou choisir un avatar de style prédéfini :</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {PRESET_AVATARS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Avatar ${i}`}
                      onClick={() => handleSelectPresetAvatar(url)}
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        objectFit: 'cover',
                        border: avatarUrl === url ? '3px solid #2563eb' : '2px solid #e2e8f0',
                        transform: avatarUrl === url ? 'scale(1.08)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ONGLET 3 : SÉCURITÉ & 2FA
             ══════════════════════════════════════════════════ */}
          {activeTab === 'security' && (
            <div>
              {/* Double Authentification 2FA */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Smartphone size={22} color="#2563eb" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                        Double Authentification (2FA WhatsApp / SMS)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Exige la confirmation d'un code à usage unique lors des opérations sensibles (clôture, signatures).
                      </div>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={(e) => {
                        setTwoFactor(e.target.checked);
                        store.updateUserProfile(currentUser.id, { twoFactorEnabled: e.target.checked });
                      }}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: twoFactor ? '#16a34a' : '#64748b' }}>
                      {twoFactor ? 'Activée ✓' : 'Désactivée'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Contrôleur des Heures de Connexion (Couvre-Feu de Sécurité) */}
              <div style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={20} color="#d97706" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.875rem' }}>
                        Contrôleur des Heures de Connexion (Couvre-Feu de Sécurité)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#b45309' }}>
                        {store.getLoginHoursConfig().enabled 
                          ? `Restriction active : connexions interdites au-delà de ${store.getLoginHoursConfig().maxEndHour}.`
                          : 'Aucune restriction horaire active actuellement.'}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: store.getLoginHoursConfig().enabled ? '#fef3c7' : '#f1f5f9',
                    color: store.getLoginHoursConfig().enabled ? '#b45309' : '#64748b',
                    border: '1px solid #fcd34d'
                  }}>
                    {store.getLoginHoursConfig().enabled ? `Limite : ${store.getLoginHoursConfig().maxEndHour}` : 'Libre 24/24'}
                  </span>
                </div>

                {currentUser.role === 'ADMIN' ? (
                  <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #fde68a', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ color: '#451a03' }}>
                        Vous êtes <strong>Administrateur SaaS</strong> : vous pouvez ajuster l'heure limite et les rôles restreints.
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#78350f' }}>Heure limite :</label>
                        <input
                          type="time"
                          value={store.getLoginHoursConfig().maxEndHour}
                          onChange={(e) => {
                            store.updateLoginHoursConfig({ maxEndHour: e.target.value });
                            setFeedback({ type: 'success', text: `Heure limite de connexion mise à jour à ${e.target.value}.` });
                            setTimeout(() => setFeedback(null), 2500);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #d97706',
                            fontWeight: 700,
                            color: '#b45309',
                            backgroundColor: '#fffbeb'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#78350f', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '6px' }}>
                    ℹ️ Cette règle est administrée par le responsable de la sécurité informatique ALUTRACO. Au-delà de l'heure fixée, toute session expirera pour préserver l'intégrité des inventaires.
                  </div>
                )}
              </div>

              {/* Formulaire de changement de mot de passe */}
              <form onSubmit={handleSavePassword}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={16} color="#2563eb" />
                  <span>Changer mon Mot de Passe de Sécurité :</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Mot de Passe Actuel</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="form-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nouveau Mot de Passe (min. 6 car.)</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Confirmer le Nouveau Mot de Passe</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">
                    <Lock size={15} />
                    <span>Mettre à Jour le Mot de Passe</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ONGLET 4 : PRÉFÉRENCES & NOTIFICATIONS
             ══════════════════════════════════════════════════ */}
          {activeTab === 'preferences' && (
            <div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Thème & Affichage Visuel :</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <label style={{
                    border: themePref === 'light' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    padding: '14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: themePref === 'light' ? '#eff6ff' : '#ffffff'
                  }}>
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={themePref === 'light'}
                      onChange={() => {
                        setThemePref('light');
                        store.updateUserProfile(currentUser.id, { themePreference: 'light' });
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    <strong style={{ fontSize: '0.875rem' }}>☀️ Thème Clair</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Style haute lisibilité bureau</div>
                  </label>

                  <label style={{
                    border: themePref === 'dark' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    padding: '14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: themePref === 'dark' ? '#eff6ff' : '#ffffff'
                  }}>
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={themePref === 'dark'}
                      onChange={() => {
                        setThemePref('dark');
                        store.updateUserProfile(currentUser.id, { themePreference: 'dark' });
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    <strong style={{ fontSize: '0.875rem' }}>🌙 Mode Sombre / Dépôt</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Moins agressif en zone sombre</div>
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Canaux de Notification :</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem' }}>
                    <input
                      type="checkbox"
                      checked={notifyWA}
                      onChange={(e) => {
                        setNotifyWA(e.target.checked);
                        store.updateUserProfile(currentUser.id, { notifyWhatsApp: e.target.checked });
                      }}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>Recevoir les alertes d'inventaires prioritaires sur <strong>WhatsApp</strong></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ONGLET 5 : MON JOURNAL D'ACTIVITÉ PERSONNEL
             ══════════════════════════════════════════════════ */}
          {activeTab === 'logs' && (
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '14px' }}>
                Historique de vos 10 dernières opérations enregistrées de façon immuable dans le journal d'audit ALUTRACO :
              </div>

              {userLogs.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
                  Aucune activité récente enregistrée sous cette session.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {userLogs.map((log) => (
                    <div 
                      key={log.id}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8125rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.action.replace(/_/g, ' ')}</div>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>{log.targetObject || log.reason || log.newValue}</div>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textAlign: 'right' }}>
                        {log.timestamp.replace('T', ' à ').substring(0, 16)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
