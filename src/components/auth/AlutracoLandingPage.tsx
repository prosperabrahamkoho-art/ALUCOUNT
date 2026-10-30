import React, { useState } from 'react';
import { 
  Lock, 
  Boxes, 
  ClipboardCheck, 
  Search, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  Layers,
  Wrench,
  HardHat,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface AlutracoLandingPageProps {
  onOpenLogin: () => void;
  onOpenActivation: () => void;
}

export const AlutracoLandingPage: React.FC<AlutracoLandingPageProps> = ({
  onOpenLogin,
  onOpenActivation,
}) => {
  const [activePole, setActivePole] = useState<'aluminium' | 'hardware'>('aluminium');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ── 1. EN-TÊTE PROFESSIONNEL ────────────────────────────────────────── */}
      <header style={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo ALUTRACO & Accroche */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              fontWeight: 900,
              fontSize: '1.4rem',
              color: '#ffffff'
            }}>
              A
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '0.04em', color: '#ffffff' }}>ALUTRACO</span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  ALUCOUNT v1.0
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '0.02em' }}>
                L'aluminium, notre métier — Système officiel de gestion des inventaires
              </div>
            </div>
          </div>

          {/* Boutons d'accès sécurisé (SANS AUCUNE INSCRIPTION PUBLIQUE) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onOpenActivation}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              <Sparkles size={15} color="#34d399" />
              <span>Activer un compte invité</span>
            </button>

            <button
              onClick={onOpenLogin}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '10px 22px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)';
              }}
            >
              <Lock size={16} />
              <span>Se connecter</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── 2. GRANDE SECTION PRINCIPALE (HERO) ─────────────────────────────── */}
      <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', padding: '48px 24px', display: 'flex', flexDirection: 'column', gap: '48px', width: '100%' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px', alignItems: 'center' }}>
          
          {/* PARTIE GAUCHE : Texte & Piliers */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(5, 150, 105, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '20px'
            }}>
              <ShieldCheck size={14} />
              <span>Système Fermé & Sécurisé • ALUTRACO SARL</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#ffffff',
              marginBottom: '18px',
              letterSpacing: '-0.02em'
            }}>
              Gestion intelligente des inventaires <span style={{ color: '#10b981' }}>ALUTRACO</span>
            </h1>

            <p style={{
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              color: '#94a3b8',
              marginBottom: '28px',
              maxWidth: '560px'
            }}>
              Une plateforme sécurisée pour planifier, réaliser, contrôler, valider et suivre 
              les inventaires des boutiques, dépôts centraux et agences ALUTRACO au Bénin.
            </p>

            {/* Les 5 Piliers Métiers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '32px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <Boxes size={18} color="#34d399" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9' }}>📦 Gestion des stocks</div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Profilés & accessoires ALUTRACO</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <ClipboardCheck size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9' }}>📋 Inventaires physiques</div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Comptage mobile bon état / gâté</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <Search size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9' }}>🔎 Contrôle & vérification</div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Certification stricte des écarts</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <BarChart3 size={18} color="#a78bfa" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9' }}>📊 Rapports & Freinte</div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Valorisation en Francs CFA</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', gridColumn: 'span 2' }}>
                <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9' }}>🔐 Sécurité & traçabilité indélébile</div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Journal d'audit horodaté, IP, appareil et motif pour chaque écart</div>
                </div>
              </div>

            </div>

            {/* Boutons d'action principaux */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', marginBottom: '24px' }}>
              <button
                onClick={onOpenLogin}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45)',
                  transition: 'all 0.2s'
                }}
              >
                <Lock size={18} />
                <span>Accéder à mon espace de travail</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={onOpenActivation}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f1f5f9',
                  padding: '14px 22px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Première connexion ? Activer mon compte</span>
              </button>
            </div>

            {/* Règle de non-inscription publique */}
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: '#fca5a5',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <Lock size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#f87171' }} />
              <div>
                <strong>Accès strictement restreint :</strong> Aucune inscription publique n'est possible. 
                Tous les comptes collaborateurs sont créés nominativement par l'Administrateur ou le Secrétariat habilité ALUTRACO.
              </div>
            </div>

          </div>

          {/* PARTIE DROITE : Double Présentation Visuelle Métiers ALUTRACO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Sélecteur de Pôle Métier (Profilés Aluminium vs Visserie/Accessoires/Casques) */}
            <div style={{
              display: 'flex',
              backgroundColor: '#1e293b',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button
                onClick={() => setActivePole('aluminium')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: activePole === 'aluminium' ? '#059669' : 'transparent',
                  color: activePole === 'aluminium' ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Layers size={16} />
                <span>Pôle Profilés Aluminium</span>
              </button>

              <button
                onClick={() => setActivePole('hardware')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: activePole === 'hardware' ? '#059669' : 'transparent',
                  color: activePole === 'hardware' ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Wrench size={16} />
                <span>Pôle Visserie &amp; Outillage</span>
              </button>
            </div>

            {/* Cadre de l'image réelle ALUTRACO */}
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: '#1e293b',
              aspectRatio: '16 / 11'
            }}>
              
              <img
                src={activePole === 'aluminium' ? '/assets/alutraco-aluminium-hero.jpg' : '/assets/alutraco-hardware-hero.jpg'}
                alt={activePole === 'aluminium' ? 'Comptage profils aluminium ALUTRACO' : 'Inventaire visserie et pièces ALUTRACO'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              {/* Dégradé supérieur et inférieur pour lisibilité */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.2) 50%, rgba(15, 23, 42, 0.7) 100%)',
                pointerEvents: 'none'
              }} />

              {/* Tag en haut à gauche */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                <span>{activePole === 'aluminium' ? 'Profilés Aluminium (Blanches, Grises, Noires)' : 'Accessoires : Visserie, Lames & Casques'}</span>
              </div>

              {/* Carte superposée d'inventaire en cours (Mobile / Agence) */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                padding: '16px',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.6)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, backgroundColor: '#dc2626', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>
                      EN COURS
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#ffffff' }}>
                      Agence Cotonou — Dépôt Principal
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>76% achevé</span>
                </div>

                {/* Barre de progression */}
                <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ height: '100%', width: '76%', backgroundColor: '#10b981', borderRadius: '999px' }} />
                </div>

                {/* Détails terrain */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span>Articles comptés : </span>
                    <strong style={{ color: '#ffffff' }}>128 références</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} color="#34d399" />
                    <span>4 inventoristes en ligne</span>
                  </div>

                  <button
                    onClick={onOpenLogin}
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid #10b981',
                      color: '#34d399',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Rejoindre</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ── 3. PIED DE PAGE SOLENNEL ────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: '#090d16',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: '#64748b'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ color: '#94a3b8' }}>ALUTRACO SARL</strong> — L'aluminium, notre métier. Tous droits réservés &copy; 2026.
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>Bénin (Porto-Novo • Cotonou • Parakou)</span>
            <span>•</span>
            <span style={{ color: '#10b981' }}>Intégrité &amp; Cloisonnement Certifiés</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
