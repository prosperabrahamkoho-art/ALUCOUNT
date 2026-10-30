import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  FileCheck 
} from 'lucide-react';

interface SecurityGuideProps {
  onClose: () => void;
}

export const SecurityGuideModal: React.FC<SecurityGuideProps> = ({ onClose }) => {
  const principles = [
    {
      num: 1,
      title: 'Maîtrise Suprême des Droits',
      desc: 'La Direction contrôle les comptes, les rôles et les autorisations. Seul le PDG attribue ou révoque les délégations stratégiques.'
    },
    {
      num: 2,
      title: 'Cloisonnement Strict par Boutique',
      desc: 'Chaque boutique dispose de ses propres inventaires. Un responsable de boutique ne peut jamais consulter une autre boutique.'
    },
    {
      num: 3,
      title: 'Référentiel des Prix & Articles',
      desc: 'Les articles sont enregistrés avec leur couleur et prix officiel. Toute révision de prix préserve les valorisations historiques passées.'
    },
    {
      num: 4,
      title: 'Permissions Temporaires de Contrôle',
      desc: 'Les contrôleurs ne peuvent modifier les données que sous couvert d\'une autorisation formelle, bornée dans le temps avec motif obligatoire.'
    },
    {
      num: 5,
      title: 'Clôture Définitive Inaltérable',
      desc: 'Seules les personnes spécialement habilitées peuvent clôturer. Toute modification ultérieure exige une réouverture motivée (V2).'
    },
    {
      num: 6,
      title: 'Journal d\'Audit Inviolable',
      desc: 'Toutes les actions sensibles sont enregistrées de façon immuable côté serveur. Aucun utilisateur ordinaire ne peut les effacer.'
    }
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '760px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a' }}>
            <ShieldCheck size={20} color="#059669" />
            <span>ALUCOUNT — Les Six Principes Fondamentaux de Sécurité ALUTRACO</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '20px' }}>
            ALUCOUNT repose sur une architecture de confiance zéro (Zero Trust) conçue pour les opérations industrielles multi-sites. 
            Cacher un bouton ne suffit pas : toutes les règles sont validées et journalisées côté serveur.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {principles.map(p => (
              <div 
                key={p.num} 
                style={{ 
                  padding: '14px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0', 
                  backgroundColor: '#f8fafc' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: '#0f172a', 
                    color: '#ffffff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.75rem', 
                    fontWeight: 700 
                  }}>
                    {p.num}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                    {p.title}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.45 }}>
                  {p.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Hiérarchie & Pouvoirs */}
          <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e40af', marginBottom: '8px' }}>
              Protection Anti-Bypass (« Mot de Passe de Garde ») :
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#1e3a8a', lineHeight: 1.5 }}>
              Aucun mot de passe maître n'est partagé entre employés. Les opérations sensibles (Clôture Définitive, Réouverture) 
              exigent une confirmation renforcée individuelle avec code d'autorisation (<code>ALU-2026</code>) et inscription indélébile au journal d'audit.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Compris</button>
        </div>
      </div>
    </div>
  );
};
