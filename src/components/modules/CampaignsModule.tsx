import React, { useState } from 'react';
import { 
  CalendarRange, 
  Plus, 
  Store, 
  HardHat, 
  Calendar, 
  UserCheck, 
  Check, 
  X, 
  Boxes, 
  Clock,
  Send,
  MessageCircle,
  Mail,
  FileText,
  Download,
  BellRing,
  Share2,
  Lock
} from 'lucide-react';
import { useALUStore } from '../../services/store';
import { Campaign, LocationType, Category, Shop } from '../../types';

interface CampaignsModuleProps {
  onStartInventoryFromCampaign?: (camp: Campaign) => void;
}

export const CampaignsModule: React.FC<CampaignsModuleProps> = ({ onStartInventoryFromCampaign = () => {} }) => {
  const store = useALUStore();
  const campaigns = store.getCampaigns();
  const shops = store.getShops();
  const users = store.getUsers();
  const currentUser = store.getCurrentUser();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10));
  const [type, setType] = useState<LocationType>('BOUTIQUE');
  const [selectedShopId, setSelectedShopId] = useState<string>('TOUTES');
  const [selectedCategory, setSelectedCategory] = useState<'Aluminium' | 'Accessoires' | 'TOUTES'>('Aluminium');
  const [consignes, setConsignes] = useState('Comptage physique contradictoire, distinction stricte profilés gâtés / bon état, scellement immédiat des fiches.');

  const supervisors = users.filter(u => u.role === 'RESPONSABLE_INVENTAIRE' || u.role === 'PDG');
  const [supervisorId, setSupervisorId] = useState(supervisors[0]?.id || '');

  // Modal de notification Chef d'Agence (WhatsApp, Mail, PDF)
  const [notifTargetCamp, setNotifTargetCamp] = useState<Campaign | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  const canPlan = ['ADMIN', 'PDG', 'SECRETAIRE_DIRECTION', 'MAGASINIER', 'RESPONSABLE_INVENTAIRE'].includes(currentUser.role);
  // RÈGLE MÉTIER STRICTE : Seule la Secrétaire de Direction (ou l'Admin SaaS) est habilitée à notifier et convoquer le chef d'agence
  const canNotifyShopManager = currentUser.role === 'SECRETAIRE_DIRECTION' || currentUser.role === 'ADMIN';

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = users.find(u => u.id === supervisorId);

    const shopsToCover = selectedShopId === 'TOUTES' 
      ? shops.filter(s => s.type === type).map(s => s.id)
      : [selectedShopId];

    const categoriesToCover: Category[] = selectedCategory === 'TOUTES'
      ? ['Aluminium', 'Accessoires']
      : [selectedCategory];

    const res = store.createCampaign({
      name,
      description,
      startDate,
      endDate,
      status: 'PLANIFIEE',
      shopsCovered: shopsToCover,
      categories: categoriesToCover,
      type,
      supervisorId: sup?.id || currentUser.id,
      supervisorName: sup?.name || currentUser.name,
      consignes
    });

    if (res.success && res.campaign) {
      setShowModal(false);
      setName('');
      setDescription('');
      // Ouvrir immédiatement la convocation / notification pour le Chef d'Agence
      setNotifTargetCamp(res.campaign);
    }
  };

  // Génération du texte automatisé de convocation pour le Chef d'Agence
  const getAutomatedNotificationMessage = (camp: Campaign) => {
    const coveredShops = shops.filter(s => camp.shopsCovered.includes(s.id));
    const shopNames = coveredShops.map(s => s.name).join(', ') || 'Réseau Agences ALUTRACO';
    
    return `*ALUTRACO BÉNIN — ORDRE DE MISSION & NOTIFICATION OFFICIELLE D'INVENTAIRE*
--------------------------------------------------
À l'attention du : *Chef d'Agence & Responsable Boutique*
Concerne : *${shopNames}*

Monsieur/Madame le Responsable,

La Direction Générale et le Secrétariat vous informent qu'une session d'inventaire officiel est programmée pour votre agence :

📅 *Intitulé de la mission :* ${camp.name}
🗓️ *Période fixée :* Du ${camp.startDate} au ${camp.endDate}
👤 *Superviseur Habilité :* ${camp.supervisorName}
📦 *Périmètre :* Aluminium (profilés par déclinaison couleur) & Accessoires
🏷️ *Type d'emplacement :* ${camp.type === 'CHANTIER' ? 'Chantier Extérieur' : 'Boutique / Dépôt Magasin'}

📝 *Consignes impératives :*
${camp.consignes || 'Préparer les zones de stockage, figer les mouvements d\'entrée/sortie et assister la commission.'}

📄 *Ordre de Mission PDF :* Généré et téléchargeable sur la plateforme ALUCOUNT (Réf: NOTIF-ORDRE-${camp.id.toUpperCase()}).

Merci de prendre toutes les dispositions logistiques requises.
_Par ordre du Secrétariat de Direction ALUTRACO — Service Inventaires & Contrôle_`;
  };

  const handleSendWhatsApp = (camp: Campaign) => {
    const text = getAutomatedNotificationMessage(camp);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = (camp: Campaign) => {
    const text = getAutomatedNotificationMessage(camp);
    const coveredShops = shops.filter(s => camp.shopsCovered.includes(s.id));
    const targetShop = coveredShops[0];
    const shopManager = users.find(u => u.shopId === targetShop?.id && u.role === 'RESPONSABLE_BOUTIQUE');
    const recipient = shopManager?.email || 'chef.agence@alutraco.bj';

    const subject = `[ALUTRACO] Convocation Officielle d'Inventaire — ${camp.name}`;
    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.open(mailto, '_blank');
  };

  const handlePrintPDF = (camp: Campaign) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const coveredShops = shops.filter(s => camp.shopsCovered.includes(s.id));
    const shopNames = coveredShops.map(s => s.name).join(', ') || 'Réseau Agences ALUTRACO';

    printWindow.document.write(`
      <html>
        <head>
          <title>Ordre de Mission & Convocation Inventaire - ${camp.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; }
            .badge { display: inline-block; background-color: #2563eb; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .title { font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 16px 0 8px 0; }
            .box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .label { color: #64748b; font-weight: 600; width: 220px; }
            .val { font-weight: 700; color: #0f172a; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; }
            .signature-box { border-top: 1px solid #94a3b8; width: 220px; padding-top: 8px; font-size: 13px; font-weight: 600; }
            .watermark { position: fixed; top: 40%; left: 25%; font-size: 60px; color: rgba(37,99,235,0.06); font-weight: 900; transform: rotate(-30deg); pointer-events: none; }
          </style>
        </head>
        <body>
          <div class="watermark">ALUTRACO OFFICIEL</div>
          <div class="header">
            <div>
              <div style="font-size: 20px; font-weight: 900; color: #2563eb; letter-spacing: 1px;">ALUTRACO BÉNIN SARL</div>
              <div style="font-size: 12px; color: #64748b;">Société d'Importation & Distribution Aluminium et Accessoires</div>
              <div style="font-size: 11px; color: #64748b;">Cotonou, République du Bénin • RCCM RB/COT/18 B 21049</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">ORDRE DE MISSION OFFICIEL</span>
              <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Réf : NOTIF-ORDRE-${camp.id.substring(5, 12).toUpperCase()}</div>
              <div style="font-size: 12px; color: #64748b;">Date émission : ${new Date().toLocaleDateString('fr-FR')}</div>
            </div>
          </div>

          <div class="title">CONVOCATION & ORDRE DE MISSION D'INVENTAIRE</div>
          <p style="font-size: 14px; color: #334155;">
            Le présent document notifie officiellement l'ouverture programmée de la session d'inventaire contradictoire. Le Chef d'Agence et ses équipes sont tenus de prêter concours à la commission.
          </p>

          <div class="box">
            <div class="row"><span class="label">Intitulé de la Mission :</span><span class="val">${camp.name}</span></div>
            <div class="row"><span class="label">Agence / Boutique concernée :</span><span class="val">${shopNames}</span></div>
            <div class="row"><span class="label">Date de démarrage officiel :</span><span class="val">${camp.startDate}</span></div>
            <div class="row"><span class="label">Date d'achèvement prévue :</span><span class="val">${camp.endDate}</span></div>
            <div class="row"><span class="label">Superviseur Général mandaté :</span><span class="val">${camp.supervisorName}</span></div>
            <div class="row"><span class="label">Périmètre des stocks :</span><span class="val">Aluminium (Profilés classés par couleur) et Accessoires</span></div>
            <div class="row"><span class="label">Emplacement opérationnel :</span><span class="val">${camp.type === 'CHANTIER' ? 'Mode Chantier Extérieur' : 'Boutique & Dépôts Magasin'}</span></div>
          </div>

          <div class="box" style="background-color: #fffbeb; border-color: #fde68a;">
            <div style="font-weight: 700; color: #92400e; margin-bottom: 6px; font-size: 13px;">CONSIGNES OPÉRATIONNELLES OBLIGATOIRES :</div>
            <div style="font-size: 13px; color: #78350f;">
              ${camp.consignes || '1. Arrêt complet des mouvements de stock non enregistrés.<br/>2. Mise à disposition des registres et bons de livraison.<br/>3. Comptage contradictoire en présence du personnel de contrôle.'}
            </div>
          </div>

          <div class="footer">
            <div class="signature-box">
              Pour le Chef d'Agence<br/>
              (Accusé de réception & Visa)
            </div>
            <div class="signature-box">
              Le Secrétariat de Direction / PDG<br/>
              (Signature Habilitée & Cachet)
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563eb', fontSize: '1rem' }}>MODULE 07</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              Planification d'inventaire & Mode Chantier
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Programmation des inventaires, assignation des superviseurs et transmission automatisée des convocations (in-app, WhatsApp, Email et PDF) aux chefs d'agence.
          </p>
        </div>

        {canPlan && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>Planifier un Inventaire</span>
          </button>
        )}
      </div>

      {/* Cartes des inventaires planifiés */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {campaigns.map(camp => {
          const isChantier = camp.type === 'CHANTIER';
          const coveredShops = shops.filter(s => camp.shopsCovered.includes(s.id));

          return (
            <div key={camp.id} className="card" style={{ borderLeft: isChantier ? '4px solid #d97706' : '4px solid #2563eb' }}>
              <div className="card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    {isChantier ? (
                      <span className="status-pill warning" style={{ fontSize: '0.6875rem' }}>
                        <HardHat size={12} />
                        Mode Chantier
                      </span>
                    ) : (
                      <span className="status-pill info" style={{ fontSize: '0.6875rem' }}>
                        <Store size={12} />
                        Réseau Boutiques
                      </span>
                    )}

                    <span className="status-pill success" style={{ fontSize: '0.6875rem' }}>
                      {camp.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                    {camp.name}
                  </div>
                </div>
              </div>

              <div className="card-body">
                <p style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '14px' }}>
                  {camp.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: '#334155', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#64748b" />
                    <span>Période : <strong>{camp.startDate}</strong> au <strong>{camp.endDate}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={14} color="#64748b" />
                    <span>Superviseur Habilité : <strong>{camp.supervisorName}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Store size={14} color="#64748b" />
                    <span>Agences : <strong>{coveredShops.map(s => s.name).join(', ') || 'Global'}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Boxes size={14} color="#64748b" />
                    <span>Catégorie(s) : <strong>{camp.categories && camp.categories.length > 0 ? camp.categories.join(' & ') : 'Aluminium & Accessoires'}</strong></span>
                  </div>
                </div>

                {camp.consignes && (
                  <div style={{ 
                    padding: '10px 12px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0', 
                    fontSize: '0.75rem',
                    color: '#475569',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>Consignes de comptage :</div>
                    <div>{camp.consignes}</div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {canNotifyShopManager ? (
                    <button 
                      onClick={() => setNotifTargetCamp(camp)}
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: '#2563eb', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      title="Envoyer la convocation officielle par WhatsApp, Email et PDF au chef d'agence (Secrétaire de Direction)"
                    >
                      <BellRing size={13} />
                      <span>Notifier Chef Agence</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => alert("Accès restreint : Seule la Secrétaire de Direction a l'habilitation exclusive pour notifier et convoquer officiellement le Chef d'Agence.")}
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: '#e2e8f0', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#f8fafc', cursor: 'not-allowed' }}
                      title="Notification réservée exclusivement à la Secrétaire de Direction"
                    >
                      <Lock size={13} />
                      <span>Notifier Chef (Secrétaire)</span>
                    </button>
                  )}

                  <button 
                    onClick={() => onStartInventoryFromCampaign(camp)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <span>Voir Inventaires</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL PLANIFICATION D'INVENTAIRE */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <CalendarRange size={18} color="#2563eb" />
                <span>Planifier un Nouvel Inventaire ALUTRACO</span>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Titre de la Planification d'Inventaire *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Ex: Inventaire Officiel Q3 2026 — Dépôt Cotonou..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Périmètre de la mission</label>
                  <textarea 
                    rows={2} 
                    className="form-textarea" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Précisez les objectifs et dépôts concernés..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Type d'Emplacement *</label>
                    <select 
                      className="form-select" 
                      value={type} 
                      onChange={(e) => setType(e.target.value as LocationType)}
                    >
                      <option value="BOUTIQUE">Boutiques & Dépôts Magasins</option>
                      <option value="CHANTIER">Mode Chantier (Emplacements Extérieurs)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Boutique / Agence Ciblée</label>
                    <select 
                      className="form-select" 
                      value={selectedShopId} 
                      onChange={(e) => setSelectedShopId(e.target.value)}
                    >
                      <option value="TOUTES">Toutes les agences du périmètre</option>
                      {shops.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Superviseur d'Inventaire *</label>
                    <select 
                      className="form-select" 
                      value={supervisorId} 
                      onChange={(e) => setSupervisorId(e.target.value)}
                    >
                      {supervisors.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date de Démarrage</label>
                    <input 
                      type="date" 
                      required 
                      className="form-input" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date Limite de Clôture</label>
                    <input 
                      type="date" 
                      required 
                      className="form-input" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Catégorie d'Articles Ciblée *</label>
                    <select
                      className="form-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as 'Aluminium' | 'Accessoires' | 'TOUTES')}
                    >
                      <option value="Aluminium">Aluminium (Profilés classés par couleur)</option>
                      <option value="Accessoires">Accessoires (Quincaillerie, serrures, roulettes)</option>
                      <option value="TOUTES">Inventaire Complet (Aluminium & Accessoires)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Consignes Spécifiques pour le Chef d'Agence et les Équipes</label>
                  <textarea 
                    rows={2} 
                    className="form-textarea" 
                    value={consignes} 
                    onChange={(e) => setConsignes(e.target.value)} 
                    placeholder="Consignes particulières pour l'inventaire..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Enregistrer & Convoquer le Chef d'Agence</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL DE NOTIFICATION AUTOMATISÉE DU CHEF D'AGENCE
          (In-App, WhatsApp avec Message Automatisé, Email & PDF)
         ════════════════════════════════════════════════════════════════ */}
      {notifTargetCamp && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <BellRing size={18} color="#2563eb" />
                <span>Notification Officielle du Chef d'Agence — {notifTargetCamp.name}</span>
              </div>
              <button onClick={() => setNotifTargetCamp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Statut in-app */}
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Check size={20} color="#059669" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.8125rem', color: '#065f46' }}>
                  <strong>Notification in-app active :</strong> Le Chef d'Agence a automatiquement reçu cette alerte de mission dans son espace ALUCOUNT.
                </div>
              </div>

              {/* Aperçu du message automatisé */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>Message Automatisé de Convocation :</label>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(getAutomatedNotificationMessage(notifTargetCamp));
                      setCopiedText(true);
                      setTimeout(() => setCopiedText(false), 2000);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                  >
                    {copiedText ? '✓ Copié !' : 'Copier le message'}
                  </button>
                </div>
                <div style={{ 
                  backgroundColor: '#0f172a', 
                  color: '#e2e8f0', 
                  padding: '14px', 
                  borderRadius: '6px', 
                  fontFamily: 'monospace', 
                  fontSize: '0.75rem', 
                  maxHeight: '160px', 
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5
                }}>
                  {getAutomatedNotificationMessage(notifTargetCamp)}
                </div>
              </div>

              {/* Les 3 canaux d'envoi automatisé */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                {/* 1. WhatsApp avec PDF / texte */}
                <button
                  onClick={() => handleSendWhatsApp(notifTargetCamp)}
                  className="btn"
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    fontWeight: 700
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageCircle size={18} />
                    <span>Envoyer sur WhatsApp au Chef d'Agence</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                    Message automatisé prêt
                  </span>
                </button>

                {/* 2. Email officiel */}
                <button
                  onClick={() => handleSendEmail(notifTargetCamp)}
                  className="btn"
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    fontWeight: 700
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Mail size={18} />
                    <span>Envoyer par Email Officiel (Mailto)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                    Convocation formelle
                  </span>
                </button>

                {/* 3. Téléchargement PDF de l'ordre de mission */}
                <button
                  onClick={() => handlePrintPDF(notifTargetCamp)}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    fontWeight: 700
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} color="#2563eb" />
                    <span>Générer / Imprimer l'Ordre de Mission & Notification PDF</span>
                  </div>
                  <Download size={16} color="#64748b" />
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setNotifTargetCamp(null)} className="btn btn-primary" style={{ width: '100%' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
