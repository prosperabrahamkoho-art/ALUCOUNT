import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Lock, 
  KeyRound, 
  Mail, 
  UserCheck, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  Check,
  ChevronRight
} from 'lucide-react';
import { useALUStore } from '../../services/store';

interface AlutracoActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AlutracoActivationModal: React.FC<AlutracoActivationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const store = useALUStore();
  const invitations = store.getInvitations();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [uniqueIdentifier, setUniqueIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calcul de la force du mot de passe
  const getPasswordStrength = (pwd: string): { label: string; color: string; score: number } => {
    if (!pwd) return { label: 'Non renseigné', color: '#94a3b8', score: 0 };
    if (pwd.length < 8) return { label: '❌ Trop faible (8 car. min)', color: '#dc2626', score: 1 };
    
    let score = 1;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { label: '❌ Faible', color: '#dc2626', score: 1 };
    if (score === 3 || score === 4) return { label: '🟠 Moyen', color: '#ea580c', score: 2 };
    return { label: '🟢 Fort (Conforme ALUTRACO)', color: '#16a34a', score: 3 };
  };

  const strength = getPasswordStrength(newPassword);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!uniqueIdentifier.trim() || !email.trim()) {
      setErrorMessage('Veuillez renseigner votre identifiant unique et votre adresse e-mail.');
      return;
    }

    // Vérifier si l'invitation ou l'utilisateur existe
    const cleanId = uniqueIdentifier.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const inv = invitations.find(i => 
      (i.uniqueIdentifier && i.uniqueIdentifier.toLowerCase() === cleanId) ||
      (i.recipientEmail && i.recipientEmail.toLowerCase() === cleanEmail)
    );

    const user = store.getUsers().find(u => 
      (u.uniqueIdentifier && u.uniqueIdentifier.toLowerCase() === cleanId) ||
      u.email.toLowerCase() === cleanEmail
    );

    if (!inv && !user) {
      setErrorMessage('Aucun dossier d\'invitation ne correspond à cet identifiant et cette adresse e-mail. Vérifiez les informations transmises par votre secrétariat.');
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 8) {
      setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Les deux mots de passe ne correspondent pas.');
      return;
    }

    if (strength.score < 2) {
      setErrorMessage('Le mot de passe est trop faible. Veuillez inclure des majuscules, minuscules et des chiffres.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = store.activateUserWithInvitation({
        uniqueIdentifier,
        email,
        password: newPassword
      });
      setIsSubmitting(false);

      if (result.success) {
        setStep(3);
      } else {
        setErrorMessage(result.message);
      }
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Bouton fermeture */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        {/* En-tête */}
        <div style={{ padding: '28px 32px 20px 32px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 12px auto'
          }}>
            <Sparkles size={24} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            Activation de votre compte ALUTRACO
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Première connexion sécurisée via lien d'invitation officiel
          </p>
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <div style={{
            margin: '16px 32px 0 32px',
            padding: '12px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#991b1b',
            fontSize: '0.8125rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── ÉTAPE 1 : Identification de l'invitation ── */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} style={{ padding: '24px 32px 32px 32px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Identifiant unique attribué
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <UserCheck size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={uniqueIdentifier}
                  onChange={(e) => setUniqueIdentifier(e.target.value)}
                  placeholder="ex: ALT-INV-00254"
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '4px' }}>
                Mentionné dans votre message de convocation WhatsApp ou email.
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Adresse e-mail professionnelle
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pierre@alutraco.bj"
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
              }}
            >
              <span>Continuer</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* ── ÉTAPE 2 : Création du premier mot de passe ── */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} style={{ padding: '24px 32px 32px 32px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Nouveau mot de passe personnel
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Indicateur de force */}
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Force :</span>
                <span style={{ fontWeight: 700, color: strength.color }}>{strength.label}</span>
              </div>
              <div style={{ height: '4px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '999px', marginTop: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: strength.score === 1 ? '33%' : strength.score === 2 ? '66%' : strength.score === 3 ? '100%' : '0%',
                  backgroundColor: strength.color,
                  transition: 'all 0.3s'
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Confirmer le mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Retour
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 2,
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
                }}
              >
                <span>{isSubmitting ? 'Activation...' : 'ACTIVER MON COMPTE'}</span>
                <Check size={16} />
              </button>
            </div>
          </form>
        )}

        {/* ── ÉTAPE 3 : Confirmation & Redirection ── */}
        {step === 3 && (
          <div style={{ padding: '36px 32px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '2px solid #86efac'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Compte activé avec succès !
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
              Votre mot de passe personnel a été enregistré et certifié. Vous êtes désormais habilité à accéder à votre espace de travail ALUTRACO.
            </p>

            <button
              onClick={() => {
                onClose();
                onSuccess();
              }}
              style={{
                width: '100%',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
              }}
            >
              <span>Accéder à mon espace de travail</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
