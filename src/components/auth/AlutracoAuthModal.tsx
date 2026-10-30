import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  ArrowRight, 
  X, 
  UserCheck, 
  Sparkles,
  HelpCircle,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useALUStore } from '../../services/store';

interface AlutracoAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenActivation: () => void;
  onOpenForgotPassword: () => void;
}

export const AlutracoAuthModal: React.FC<AlutracoAuthModalProps> = ({
  isOpen,
  onClose,
  onOpenActivation,
  onOpenForgotPassword
}) => {
  const store = useALUStore();
  const users = store.getUsers();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const result = store.loginWithCredentials(identifier, password, rememberDevice);
      setIsSubmitting(false);

      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.message);
      }
    }, 400);
  };

  // Sélection rapide pour faciliter les tests et présentations
  const handleQuickDemoSelect = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setIdentifier(user.uniqueIdentifier || user.email);
      setPassword(user.password || 'Alutraco2026!');
      setErrorMessage('');
    }
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
        maxWidth: '480px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out'
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
            padding: '4px',
            borderRadius: '6px'
          }}
          title="Fermer"
        >
          <X size={20} />
        </button>

        {/* En-tête de la modale */}
        <div style={{ padding: '32px 32px 20px 32px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
          
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '1.75rem',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
          }}>
            A
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            Bienvenue sur ALUTRACO Inventaire
          </h2>
          
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Connectez-vous à votre espace de travail sécurisé.
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

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 32px 32px 32px' }}>
          
          {/* Champ Identifiant ou Email */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Identifiant ou adresse e-mail
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <UserCheck size={18} />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ex: ALT-INV-00254 ou pierre@alutraco.bj"
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
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '4px' }}>
              Saisissez l'identifiant attribué par votre administrateur ou votre e-mail professionnel.
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
                Mot de passe
              </label>
              <button
                type="button"
                onClick={onOpenForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <KeyRound size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe personnel"
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Option : Se souvenir de cet appareil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#059669' }}
            />
            <label htmlFor="remember" style={{ fontSize: '0.8125rem', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
              Se souvenir de cet appareil pour mes prochaines sessions
            </label>
          </div>

          {/* Bouton SE CONNECTER */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
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
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            <Lock size={16} />
            <span>{isSubmitting ? 'Authentification en cours...' : 'SE CONNECTER'}</span>
          </button>

          {/* RÈGLE 4 : Aucun bouton d'inscription publique */}
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: '#64748b'
          }}>
            <div>Vous n'avez pas encore de compte ?</div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
              Contactez l'administrateur ou le secrétaire habilité ALUTRACO.
            </div>

            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                onClick={onOpenActivation}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#059669',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={14} />
                <span>Vous avez reçu une invitation ? Activer mon compte</span>
              </button>
            </div>
          </div>

          {/* Sélecteur de test rapide démo */}
          <div style={{ marginTop: '20px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              ⚡ Raccourcis de test immédiat (Profils ALUTRACO) :
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {users.slice(0, 5).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickDemoSelect(u.id)}
                  style={{
                    fontSize: '0.6875rem',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#1e293b',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {u.role.replace(/_/g, ' ')} ({u.uniqueIdentifier || u.name.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

        </form>

      </div>

    </div>
  );
};
