import React, { useState } from 'react';
import { 
  Plus, 
  Store, 
  Boxes, 
  UserCheck, 
  X, 
  Check, 
  AlertCircle,
  MessageCircle,
  Mail,
  FileText,
  BellRing,
  ArrowRight
} from 'lucide-react';
import { useALUStore } from '../services/store';
import { Category, Shop } from '../types';

interface CreateInventoryModalProps {
  onClose: () => void;
  onSuccess: (invId: string) => void;
}

export const CreateInventoryModal: React.FC<CreateInventoryModalProps> = ({ onClose, onSuccess }) => {
  const store = useALUStore();
  const shops = store.getShops();
  const users = store.getUsers();

  const counters = users.filter(u => u.role === 'INVENTORISTE' || u.role === 'CONTROLEUR');

  const [shopId, setShopId] = useState(shops[0]?.id || '');
  const [category, setCategory] = useState<Category>('Aluminium');
  const [campaignName, setCampaignName] = useState('Planification d\'Inventaire Q3 2026');
  const [assignedCounterId, setAssignedCounterId] = useState(counters[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState('');

  // État de confirmation après création
  const [createdInvId, setCreatedInvId] = useState<string | null>(null);

  const selectedShop = shops.find(s => s.id === shopId);
  const selectedCounter = users.find(u => u.id === assignedCounterId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = store.createInventory({
      shopId,
      category,
      campaignName,
      assignedCounterId
    });

    if (res.success && res.inventoryId) {
      setCreatedInvId(res.inventoryId);
    } else {
      setErrorMsg(res.message);
    }
  };

  const getAutomatedNotificationMessage = () => {
    return `*ALUTRACO BÉNIN — NOTIFICATION DE PROGRAMMATION D'INVENTAIRE*
--------------------------------------------------
À l'attention du Chef d'Agence de : *${selectedShop?.name || 'Boutique'}*

Un nouvel inventaire officiel vient d'être programmé par la Direction :

📦 *Catégorie :* ${category} (Profilés alu par couleur / Accessoires)
🗓️ *Date de planification :* ${new Date().toLocaleDateString('fr-FR')}
👤 *Inventoriste assigné :* ${selectedCounter?.name || 'Équipe terrain'}
📋 *Campagne :* ${campaignName}

Une notification a été émise dans votre application ALUCOUNT. Merci de préparer vos dépôts et de vérifier vos registres.`;
  };

  const handleSendWhatsApp = () => {
    const text = getAutomatedNotificationMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendEmail = () => {
    const text = getAutomatedNotificationMessage();
    const shopManager = users.find(u => u.shopId === selectedShop?.id && u.role === 'RESPONSABLE_BOUTIQUE');
    const recipient = shopManager?.email || 'chef.agence@alutraco.bj';
    const subject = `[ALUTRACO] Programmation d'Inventaire — ${selectedShop?.name}`;
    window.open(`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Ordre de Mission & Notification - ${selectedShop?.name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #0f172a; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 15px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="color: #2563eb; margin: 0;">ALUTRACO BÉNIN SARL</h2>
            <p style="margin: 4px 0; color: #64748b;">Ordre de Mission & Convocation Officielle d'Inventaire</p>
          </div>
          <h3>AVIS OFFICIEL DE PROGRAMMATION D'INVENTAIRE</h3>
          <div class="box">
            <div class="row"><strong>Agence / Dépôt :</strong><span>${selectedShop?.name} (${selectedShop?.code})</span></div>
            <div class="row"><strong>Catégorie inventoriée :</strong><span>${category}</span></div>
            <div class="row"><strong>Inventoriste délégué :</strong><span>${selectedCounter?.name || 'Terrain'}</span></div>
            <div class="row"><strong>Intitulé session :</strong><span>${campaignName}</span></div>
            <div class="row"><strong>Date d'émission :</strong><span>${new Date().toLocaleDateString('fr-FR')}</span></div>
          </div>
          <p style="font-size: 13px; color: #475569;">Le Chef d'Agence est tenu de mettre à disposition les accès aux zones de stockage et d'accompagner l'inventoriste.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
            <Plus size={18} color="#2563eb" />
            <span>{createdInvId ? 'Inventaire Programmé avec Succès' : 'Initier une Nouvelle Session d\'Inventaire'}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {!createdInvId ? (
          <form onSubmit={handleCreate}>
            <div className="modal-body">
              {errorMsg && (
                <div className="alert-banner danger" style={{ marginBottom: '16px' }}>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  <span>Boutique ou Dépôt Concerné</span>
                  <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                >
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Catégorie Principale</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                  >
                    <option value="Aluminium">Aluminium (Profilés classés par couleur)</option>
                    <option value="Accessoires">Accessoires & Quincaillerie</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Inventoriste Assigné</label>
                  <select
                    className="form-select"
                    value={assignedCounterId}
                    onChange={(e) => setAssignedCounterId(e.target.value)}
                  >
                    {counters.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Intitulé de la Planification d'Inventaire</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              <div className="alert-banner info">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.8125rem' }}>
                  Dès la programmation, le <strong>Chef d'Agence</strong> recevra automatiquement une alerte dans l'application, et vous pourrez lui transmettre la convocation par WhatsApp, Email et PDF.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} />
                <span>Programmer l'Inventaire</span>
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="modal-body">
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#10b981', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <Check size={26} />
                </div>
                <div style={{ fontWeight: 800, color: '#065f46', fontSize: '1rem', marginBottom: '4px' }}>
                  Inventaire Programmé avec Succès !
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#047857' }}>
                  Le Chef d'Agence de <strong>{selectedShop?.name}</strong> a reçu une notification instantanée dans l'application.
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', marginBottom: '12px' }}>
                Transmettre la Convocation & Ordre de Mission :
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="btn"
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    fontWeight: 600
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageCircle size={16} />
                    <span>Envoyer sur WhatsApp (Message automatisé)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>wa.me</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="btn"
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    fontWeight: 600
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} />
                    <span>Envoyer par Email au Chef d'Agence</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Email officiel</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    fontWeight: 600
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#2563eb" />
                    <span>Télécharger / Imprimer la Convocation PDF</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>PDF officiel</span>
                </button>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Fermer
              </button>

              <button
                type="button"
                onClick={() => {
                  onSuccess(createdInvId);
                  onClose();
                }}
                className="btn btn-primary"
              >
                <span>Accéder au Comptage Terrain</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
