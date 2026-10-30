import React, { useState, useRef, useEffect } from 'react';
import { 
  Crown, 
  Building2, 
  Boxes, 
  ShieldCheck, 
  CheckCircle2, 
  ScanLine, 
  Store, 
  ChevronDown, 
  Check, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '../../types';
import { useALUStore } from '../../services/store';

export type WorkspaceId = 
  | 'PDG' 
  | 'SECRETARY' 
  | 'WAREHOUSE' 
  | 'ADMIN' 
  | 'CONTROL' 
  | 'COUNTER' 
  | 'SHOP_MANAGER';

interface GlobalSpaceBarProps {
  currentSpace: WorkspaceId;
  onSelectSpace: (spaceId: WorkspaceId) => void;
}

export interface SpaceConfig {
  id: WorkspaceId;
  name: string;
  shortName: string;
  icon: typeof Crown;
  role: UserRole;
  defaultUserId: string;
  userName: string;
  theme: {
    bg: string;
    border: string;
    text: string;
    activeBg: string;
    activeText: string;
    accentColor: string;
    badgeBg: string;
  };
  description: string;
}

export const ALUCOUNT_SPACES: SpaceConfig[] = [
  {
    id: 'PDG',
    name: '👑 Espace PDG (Direction)',
    shortName: '👑 PDG (Direction)',
    icon: Crown,
    role: 'PDG',
    defaultUserId: 'usr_pdg_01',
    userName: 'El Hadj Alassane Traoré',
    theme: {
      bg: '#0f172a',
      border: '#f59e0b',
      text: '#facc15',
      activeBg: '#f59e0b',
      activeText: '#0f172a',
      accentColor: '#d97706',
      badgeBg: 'rgba(245, 158, 11, 0.2)'
    },
    description: 'Haute Direction • Spectateur Souverain & Arbitre Suprême'
  },
  {
    id: 'SECRETARY',
    name: '🏢 Espace Secrétariat',
    shortName: '🏢 Secrétariat',
    icon: Building2,
    role: 'SECRETAIRE_DIRECTION',
    defaultUserId: 'usr_sec_01',
    userName: 'Chantal Hounnou',
    theme: {
      bg: '#083344',
      border: '#06b6d4',
      text: '#67e8f9',
      activeBg: '#06b6d4',
      activeText: '#083344',
      accentColor: '#0891b2',
      badgeBg: 'rgba(6, 182, 212, 0.2)'
    },
    description: 'Organisation • Création Boutiques, Chefs d\'Agence & Utilisateurs'
  },
  {
    id: 'WAREHOUSE',
    name: '📦 Espace Magasinier',
    shortName: '📦 Magasinier',
    icon: Boxes,
    role: 'MAGASINIER',
    defaultUserId: 'usr_mag_01',
    userName: 'Ousmane Sow',
    theme: {
      bg: '#172554',
      border: '#3b82f6',
      text: '#93c5fd',
      activeBg: '#3b82f6',
      activeText: '#ffffff',
      accentColor: '#2563eb',
      badgeBg: 'rgba(59, 130, 246, 0.2)'
    },
    description: 'Magasin Central • Monopole Prix, Articles & Couleurs'
  },
  {
    id: 'ADMIN',
    name: '🛡️ Espace Admin SaaS',
    shortName: '🛡️ Admin SaaS',
    icon: ShieldCheck,
    role: 'ADMIN',
    defaultUserId: 'usr_admin_01',
    userName: 'Administrateur Plateforme',
    theme: {
      bg: '#2e1065',
      border: '#a855f7',
      text: '#d8b4fe',
      activeBg: '#a855f7',
      activeText: '#ffffff',
      accentColor: '#7c3aed',
      badgeBg: 'rgba(168, 85, 247, 0.2)'
    },
    description: 'Supervision Technique • Sécurité, Couvre-Feu & Base de Données'
  },
  {
    id: 'CONTROL',
    name: '🔍 Espace Contrôle',
    shortName: '🔍 Contrôle & Audit',
    icon: CheckCircle2,
    role: 'CONTROLEUR',
    defaultUserId: 'usr_ctrl_01',
    userName: 'Marc Tossou',
    theme: {
      bg: '#451a03',
      border: '#f97316',
      text: '#fdba74',
      activeBg: '#f97316',
      activeText: '#ffffff',
      accentColor: '#ea580c',
      badgeBg: 'rgba(249, 115, 22, 0.2)'
    },
    description: 'Contrôle & Traitement • Stock Initial, Commission Libre, Écarts'
  },
  {
    id: 'COUNTER',
    name: '📋 Espace Inventoriste',
    shortName: '📋 Inventoriste',
    icon: ScanLine,
    role: 'INVENTORISTE',
    defaultUserId: 'usr_inv_01',
    userName: 'Paul Dossou',
    theme: {
      bg: '#1e1b4b',
      border: '#6366f1',
      text: '#a5b4fc',
      activeBg: '#6366f1',
      activeText: '#ffffff',
      accentColor: '#4f46e5',
      badgeBg: 'rgba(99, 102, 241, 0.2)'
    },
    description: 'Terrain Mobile • Saisie Physique Bon État / Gâté (Sans finances)'
  },
  {
    id: 'SHOP_MANAGER',
    name: '🏪 Espace Responsable Boutique',
    shortName: '🏪 Chef Boutique',
    icon: Store,
    role: 'RESPONSABLE_BOUTIQUE',
    defaultUserId: 'usr_chef_01',
    userName: 'Jean Akindès',
    theme: {
      bg: '#022c22',
      border: '#10b981',
      text: '#6ee7b7',
      activeBg: '#10b981',
      activeText: '#022c22',
      accentColor: '#059669',
      badgeBg: 'rgba(16, 185, 129, 0.2)'
    },
    description: 'Agence Locale • Suivi des Stocks & Rapports de sa Boutique'
  }
];

export const GlobalSpaceBar: React.FC<GlobalSpaceBarProps> = ({ currentSpace, onSelectSpace }) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const currentCfg = ALUCOUNT_SPACES.find(s => s.id === currentSpace) || ALUCOUNT_SPACES[0];
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const CurrentIcon = currentCfg.icon;

  const handleSwitch = (space: SpaceConfig) => {
    store.switchUser(space.defaultUserId);
    onSelectSpace(space.id);
    setIsOpen(false);
  };

  // Fermer le menu lors d'un clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      backgroundColor: '#070b14',
      borderBottom: '1px solid #1e293b',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      {/* ── GAUCHE : LOGO ALUCOUNT + BADGE ESPACE ACTUEL ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '6px',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '0.85rem',
          letterSpacing: '-0.02em',
          flexShrink: 0
        }}>
          <span style={{ color: '#38bdf8' }}>ALU</span>COUNT
        </div>

        {/* Badge de l'espace actif avec sa couleur officielle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '6px',
          backgroundColor: currentCfg.theme.bg,
          border: `1px solid ${currentCfg.theme.border}`,
          color: currentCfg.theme.text,
          fontSize: '0.75rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          <CurrentIcon size={14} color={currentCfg.theme.accentColor} />
          <span>{currentCfg.name}</span>
        </div>
      </div>

      {/* ── COIN DROIT : SÉLECTEUR VERTICAL D'ESPACES ET PROFIL CONNECTÉ ── */}
      <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
        
        {/* Bouton de déclenchement dans le coin supérieur droit */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '5px 12px',
            borderRadius: '8px',
            backgroundColor: isOpen ? '#1e293b' : '#0f172a',
            border: isOpen ? `1px solid ${currentCfg.theme.border}` : '1px solid #334155',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
          title="Cliquez pour ouvrir la liste verticale des 7 Espaces Métier"
        >
          {/* Avatar initiales */}
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: currentCfg.theme.accentColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.75rem',
            flexShrink: 0
          }}>
            {currentUser.name.charAt(0)}
          </div>

          {/* Nom & Rôle */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap' }}>
              {currentUser.name}
            </span>
            <span style={{ fontSize: '0.625rem', color: currentCfg.theme.text, fontWeight: 600 }}>
              {currentUser.role.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Badge bouton "Changer d'Espace" */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: currentCfg.theme.badgeBg,
            color: currentCfg.theme.text,
            fontSize: '0.6875rem',
            fontWeight: 700,
            border: `1px solid ${currentCfg.theme.border}`
          }}>
            <Layers size={12} />
            <span style={{ display: 'inline' }}>Espaces</span>
            <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>
        </button>

        {/* ── MENU DÉROULANT VERTICAL ANCRÉ DANS LE COIN DROIT ── */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '320px',
            maxWidth: 'calc(100vw - 24px)',
            backgroundColor: '#0b1120',
            border: '1px solid #334155',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.65)',
            padding: '10px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {/* En-tête du menu vertical */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              borderBottom: '1px solid #1e293b',
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                7 Espaces Séparés (Chacun son rôle)
              </span>
              <span style={{ fontSize: '0.625rem', backgroundColor: '#1e293b', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                ALUCOUNT
              </span>
            </div>

            {/* LISTE VERTICALE DES 7 ESPACES DISTINCTS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '420px', overflowY: 'auto' }}>
              {ALUCOUNT_SPACES.map((space) => {
                const isActive = currentSpace === space.id;
                const Icon = space.icon;

                return (
                  <button
                    key={space.id}
                    onClick={() => handleSwitch(space)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isActive ? `1.5px solid ${space.theme.border}` : '1px solid #1e293b',
                      backgroundColor: isActive ? space.theme.bg : '#0f172a',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#1e293b';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#0f172a';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Icône avec couleur de fond de l'espace */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: space.theme.accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={16} color="#ffffff" />
                      </div>

                      {/* Libellé et utilisateur associé */}
                      <div>
                        <div style={{
                          fontSize: '0.8125rem',
                          fontWeight: 800,
                          color: isActive ? space.theme.text : '#f1f5f9',
                          lineHeight: 1.2
                        }}>
                          {space.name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
                          {space.userName} ({space.role.replace(/_/g, ' ')})
                        </div>
                      </div>
                    </div>

                    {/* Indicateur Actif ou Flèche */}
                    <div style={{ flexShrink: 0 }}>
                      {isActive ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: space.theme.activeBg,
                          color: space.theme.activeText,
                          fontSize: '0.625rem',
                          fontWeight: 800
                        }}>
                          <Check size={11} strokeWidth={3} />
                          <span>ACTIF</span>
                        </div>
                      ) : (
                        <ArrowRight size={13} color="#475569" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Note informative en bas du menu */}
            <div style={{
              padding: '6px 8px',
              borderTop: '1px solid #1e293b',
              marginTop: '4px',
              fontSize: '0.6875rem',
              color: '#64748b',
              textAlign: 'center'
            }}>
              Chaque espace est totalement séparé avec ses propres droits et son thème.
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
