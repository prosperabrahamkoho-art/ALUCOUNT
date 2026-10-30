import React from 'react';
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  X, 
  ShieldAlert, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Globe,
  AlertTriangle
} from 'lucide-react';
import { useALUStore } from '../../services/store';

interface AlutracoDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlutracoDevicesModal: React.FC<AlutracoDevicesModalProps> = ({
  isOpen,
  onClose
}) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const allSessions = store.getUserSessions();

  if (!isOpen) return null;

  // Filtrer les sessions de l'utilisateur actuel
  const userSessions = allSessions.filter(s => s.userId === currentUser.id && s.status === 'ACTIVE');

  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d.includes('phone') || d.includes('android') || d.includes('mobile')) {
      return <Smartphone size={20} color="#059669" />;
    }
    if (d.includes('tab') || d.includes('ipad')) {
      return <Tablet size={20} color="#2563eb" />;
    }
    return <Laptop size={20} color="#475569" />;
  };

  const handleDisconnectDevice = (sessionId: string) => {
    store.killUserSession(sessionId);
  };

  const handleDisconnectAll = () => {
    if (window.confirm('Voulez-vous vraiment déconnecter tous vos autres appareils actifs ?')) {
      store.killAllSessionsForUser(currentUser.id);
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
        maxWidth: '560px',
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
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Laptop size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Mes Appareils &amp; Sessions Actives
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Contrôlez les postes de travail, tablettes et smartphones connectés à votre compte.
            </p>
          </div>
        </div>

        {/* Corps */}
        <div style={{ padding: '24px 28px', maxHeight: '60vh', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
              {userSessions.length} session(s) active(s) détectée(s)
            </span>

            {userSessions.length > 1 && (
              <button
                onClick={handleDisconnectAll}
                style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LogOut size={13} />
                <span>Déconnecter tous mes appareils</span>
              </button>
            )}
          </div>

          {/* Liste des appareils */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {userSessions.map((session, index) => (
              <div
                key={session.id}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: index === 0 ? '#f0fdf4' : '#f8fafc',
                  border: index === 0 ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getDeviceIcon(session.device)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                        {session.device}
                      </span>
                      {index === 0 && (
                        <span style={{ fontSize: '0.625rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: '4px' }}>
                          CET APPAREIL
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#64748b', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        Dernière activité : {new Date(session.lastActiveAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} />
                        {session.location || 'Bénin'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Globe size={12} />
                        IP: {session.ipAddress}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleDisconnectDevice(session.id)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#dc2626',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                    title="Invalider immédiatement la session sur cet appareil"
                  >
                    <LogOut size={13} />
                    <span>Déconnecter</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Règle de sécurité */}
          <div style={{
            marginTop: '20px',
            padding: '12px 14px',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            fontSize: '0.75rem',
            color: '#1e40af',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Protection du compte :</strong> Si vous soupçonnez une utilisation non autorisée ou si vous avez égaré un appareil,
              cliquez sur <em>Déconnecter tous mes appareils</em> et réinitialisez immédiatement votre mot de passe personnel.
            </div>
          </div>

        </div>

        {/* Pied de modale */}
        <div style={{ padding: '16px 28px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
