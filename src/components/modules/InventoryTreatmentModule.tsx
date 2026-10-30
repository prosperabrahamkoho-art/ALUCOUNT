import React, { useState } from 'react';
import { 
  Calculator, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  History, 
  Printer, 
  Building2, 
  Package, 
  ShieldCheck, 
  Calendar, 
  User, 
  FileText, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Lock,
  Percent,
  Receipt,
  Truck,
  CreditCard,
  Wallet,
  Clock,
  X
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../../services/store';
import { InventoryTreatment } from '../../types';

interface InventoryTreatmentModuleProps {
  initialInventoryId?: string;
}

export const InventoryTreatmentModule: React.FC<InventoryTreatmentModuleProps> = ({ initialInventoryId }) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const companySettings = store.getCompanySettings();
  const inventories = store.getInventories();
  const shops = store.getShops();

  // Sélection de l'inventaire en cours d'examen
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>(() => {
    if (initialInventoryId && inventories.some(i => i.id === initialInventoryId)) {
      return initialInventoryId;
    }
    // Par défaut, choisir Porto 2 si disponible, sinon le premier inventaire
    const porto2 = inventories.find(i => i.shopName.includes('Porto 2') || i.shopId === 'ALT-BT-003' || i.id === 'inv_porto2_001');
    return porto2 ? porto2.id : (inventories[0]?.id || '');
  });

  // Onglet principal : 1. Traitement de l’inventaire | 2. Rapport officiel de l’inventaire
  const [activeTab, setActiveTab] = useState<'TREATMENT' | 'OFFICIAL_REPORT'>('TREATMENT');

  // Sous-sections du traitement
  const [treatmentSubSection, setTreatmentSubSection] = useState<'CALCULATION' | 'COUNTED' | 'SALES' | 'UNDELIVERED' | 'DEBTS' | 'BALANCE' | 'AUDIT'>('CALCULATION');

  // Formulaires locaux pour ajouts rapides
  const [newSale, setNewSale] = useState({ designation: '', color: '', quantity: 1, unitPrice: 0, totalAmount: 0, note: '' });
  const [newUndelivered, setNewUndelivered] = useState({ designation: '', color: '', quantity: 1, unitPrice: 0, clientName: '', invoiceRef: '' });
  const [newDebt, setNewDebt] = useState({ clientName: '', amount: 0, phone: '', invoiceRef: '', dueDate: '' });
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editBalanceDate, setEditBalanceDate] = useState<string>('');
  const [isEditingBalance, setIsEditingBalance] = useState<boolean>(false);
  const [validationModalOpen, setValidationModalOpen] = useState<boolean>(false);
  const [validationNote, setValidationNote] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Nouveaux états d'édition demandés : Stock initial, Commission libre, Période modifiable
  const [isEditingInitialStock, setIsEditingInitialStock] = useState<boolean>(false);
  const [tempInitialStockValue, setTempInitialStockValue] = useState<number>(0);
  const [tempInitialStockDate, setTempInitialStockDate] = useState<string>('');

  const [isEditingCommission, setIsEditingCommission] = useState<boolean>(false);
  const [tempCommissionRate, setTempCommissionRate] = useState<number>(3.0);

  const [isEditingPeriod, setIsEditingPeriod] = useState<boolean>(false);
  const [tempPeriodStart, setTempPeriodStart] = useState<string>('');
  const [tempPeriodEnd, setTempPeriodEnd] = useState<string>('');

  const selectedInventory = store.getInventoryById(selectedInventoryId) || inventories.find(i => i.id === selectedInventoryId);
  const treatment: InventoryTreatment | undefined = selectedInventoryId ? store.getInventoryTreatment(selectedInventoryId) : undefined;
  const targetShop = selectedInventory ? shops.find(s => s.id === selectedInventory.shopId) : undefined;

  // Rôles autorisés
  const isManager = currentUser.role === 'RESPONSABLE_BOUTIQUE';
  const isInventoriste = currentUser.role === 'INVENTORISTE';
  const isAdmin = ['ADMIN', 'PDG', 'DG', 'ADJOINT_PDG', 'SECRETAIRE_DIRECTION', 'RESPONSABLE_INVENTAIRE'].includes(currentUser.role);
  const isController = currentUser.role === 'CONTROLEUR';

  // Règle d'accès post-validation : l'inventoriste ne peut pas consulter après validation
  if (isInventoriste && selectedInventory && selectedInventory.status === 'Validé et clôturé') {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '32px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Lock size={48} color="#f59e0b" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Accès restreint après validation définitive
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
          Conformément aux règles de confidentialité de l'entreprise, les collaborateurs au profil <strong>Inventoriste</strong> ne peuvent plus consulter l'inventaire, son traitement ni son rapport une fois la clôture définitive validée par l'administration.
        </p>
      </div>
    );
  }

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventoryId || !newSale.designation || newSale.totalAmount <= 0) return;
    store.addReportedSale(selectedInventoryId, {
      designation: newSale.designation,
      color: newSale.color || undefined,
      quantity: Number(newSale.quantity),
      unitPrice: Number(newSale.unitPrice) || undefined,
      totalAmount: Number(newSale.totalAmount),
      date: new Date().toLocaleDateString('fr-FR'),
      note: newSale.note || undefined
    });
    setNewSale({ designation: '', color: '', quantity: 1, unitPrice: 0, totalAmount: 0, note: '' });
    showNotification('Vente reportée ajoutée et intégrée au calcul automatique.');
  };

  const handleAddUndelivered = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventoryId || !newUndelivered.designation || newUndelivered.quantity <= 0 || newUndelivered.unitPrice <= 0) return;
    store.addUndeliveredProduct(selectedInventoryId, {
      designation: newUndelivered.designation,
      color: newUndelivered.color || undefined,
      quantity: Number(newUndelivered.quantity),
      unitPrice: Number(newUndelivered.unitPrice),
      clientName: newUndelivered.clientName || undefined,
      invoiceRef: newUndelivered.invoiceRef || undefined
    });
    setNewUndelivered({ designation: '', color: '', quantity: 1, unitPrice: 0, clientName: '', invoiceRef: '' });
    showNotification('Produit non livré déclaré et déduit du montant intermédiaire.');
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventoryId || !newDebt.clientName || newDebt.amount <= 0) return;
    store.addClientDebt(selectedInventoryId, {
      clientName: newDebt.clientName,
      amount: Number(newDebt.amount),
      phone: newDebt.phone || undefined,
      invoiceRef: newDebt.invoiceRef || undefined,
      dueDate: newDebt.dueDate || undefined
    });
    setNewDebt({ clientName: '', amount: 0, phone: '', invoiceRef: '', dueDate: '' });
    showNotification('Créance client enregistrée et intégrée au calcul.');
  };

  const handleSaveBalance = () => {
    if (!selectedInventoryId) return;
    store.updateShopBalance(selectedInventoryId, editBalance, editBalanceDate || undefined);
    setIsEditingBalance(false);
    showNotification('Solde de la boutique actualisé. Stock total recalculé.');
  };

  const handleSaveInitialStock = () => {
    if (!selectedInventoryId) return;
    store.updateTreatmentInitialStock(selectedInventoryId, tempInitialStockValue, tempInitialStockDate || undefined);
    setIsEditingInitialStock(false);
    showNotification('Stock initial de référence mis à jour. Résultat / écart recalculé.');
  };

  const handleSaveCommissionRate = () => {
    if (!selectedInventoryId) return;
    store.updateTreatmentCommissionRate(selectedInventoryId, tempCommissionRate);
    setIsEditingCommission(false);
    showNotification(`Pourcentage de commission ajusté à ${tempCommissionRate}%. Calcul recalculé.`);
  };

  const handleSavePeriod = () => {
    if (!selectedInventoryId || !tempPeriodStart || !tempPeriodEnd) return;
    store.updateTreatmentPeriod(selectedInventoryId, tempPeriodStart, tempPeriodEnd);
    setIsEditingPeriod(false);
    showNotification(`Période définie du ${tempPeriodStart} au ${tempPeriodEnd}.`);
  };

  const handleControlTreatment = () => {
    if (!selectedInventoryId) return;
    store.setTreatmentControlled(selectedInventoryId, 'Traitement vérifié par le contrôleur');
    showNotification('Phase de contrôle validée avec succès. Prêt pour validation définitive.');
  };

  const handleValidateDefinitive = () => {
    if (!selectedInventoryId) return;
    const res = store.validateInventoryFinal(selectedInventoryId, validationNote);
    setValidationModalOpen(false);
    showNotification(res.message);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!selectedInventory || !treatment) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#334155' }}>Aucun inventaire sélectionné</h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Veuillez sélectionner un inventaire pour visualiser son traitement.</p>
      </div>
    );
  }

  const isClosed = selectedInventory.status === 'Validé et clôturé';
  const isControlled = treatment.controlStatus === 'CONTROLE_EFFECTUE' || selectedInventory.status === 'En contrôle' || isClosed;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#065f46',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} color="#a7f3d0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ── EN-TÊTE PRINCIPAL & SÉLECTEUR ── */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.05em', marginBottom: '4px' }}>
            <Calculator size={15} />
            <span>Module d'Inventaire Métier ALUTRACO</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Traitement & Rapport d'Inventaire
            </h1>

            {isClosed ? (
              <span className="status-pill success" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                <CheckCircle2 size={13} />
                <span>Validé & Clôturé</span>
              </span>
            ) : isControlled ? (
              <span className="status-pill warning" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                <ShieldCheck size={13} />
                <span>En Contrôle</span>
              </span>
            ) : (
              <span className="status-pill info" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                <Clock size={13} />
                <span>Saisie du Traitement</span>
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>Boutique : <strong style={{ color: '#0f172a' }}>{selectedInventory.shopName}</strong></span>
            <span>&bull;</span>
            {isEditingPeriod ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>Du :</span>
                <input
                  type="text"
                  value={tempPeriodStart}
                  onChange={(e) => setTempPeriodStart(e.target.value)}
                  placeholder="Ex: 19/04/2026"
                  className="form-input"
                  style={{ width: '110px', padding: '2px 6px', fontSize: '0.75rem' }}
                />
                <span>Au :</span>
                <input
                  type="text"
                  value={tempPeriodEnd}
                  onChange={(e) => setTempPeriodEnd(e.target.value)}
                  placeholder="Ex: 11/08/2026"
                  className="form-input"
                  style={{ width: '110px', padding: '2px 6px', fontSize: '0.75rem' }}
                />
                <button onClick={handleSavePeriod} className="btn btn-primary btn-sm" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                  Enregistrer
                </button>
                <button onClick={() => setIsEditingPeriod(false)} className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                  Annuler
                </button>
              </span>
            ) : (
              <span>
                Période : du <strong style={{ color: '#0f172a' }}>{treatment.periodStart}</strong> au <strong style={{ color: '#0f172a' }}>{treatment.periodEnd}</strong>
                {!isClosed && (
                  <button
                    onClick={() => {
                      setTempPeriodStart(treatment.periodStart);
                      setTempPeriodEnd(treatment.periodEnd);
                      setIsEditingPeriod(true);
                    }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', marginLeft: '6px', textDecoration: 'underline' }}
                  >
                    (Modifier la période)
                  </button>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Sélecteur d'inventaires */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} color="#64748b" />
            <span>Dossier :</span>
          </label>
          <select 
            value={selectedInventoryId} 
            onChange={(e) => setSelectedInventoryId(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontWeight: 600, fontSize: '0.8125rem', padding: '8px 12px', borderRadius: '8px' }}
          >
            {inventories.map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.shopName} — ({inv.code}) [{inv.status}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── LES DEUX GRANDES PARTIES PRINCIPALES (ONGLETS MAJEURS) ── */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
        <button
          onClick={() => setActiveTab('TREATMENT')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'TREATMENT' ? '3px solid #2563eb' : '3px solid transparent',
            backgroundColor: activeTab === 'TREATMENT' ? '#eff6ff' : 'transparent',
            color: activeTab === 'TREATMENT' ? '#1d4ed8' : '#64748b',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Calculator size={16} />
          <span>1. Traitement de l’inventaire</span>
        </button>

        <button
          onClick={() => setActiveTab('OFFICIAL_REPORT')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'OFFICIAL_REPORT' ? '3px solid #ca8a04' : '3px solid transparent',
            backgroundColor: activeTab === 'OFFICIAL_REPORT' ? '#fefce8' : 'transparent',
            color: activeTab === 'OFFICIAL_REPORT' ? '#854d0e' : '#64748b',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <FileSpreadsheet size={16} color="#ca8a04" />
          <span>2. Rapport de l’inventaire (Officiel & Validé — Capture 2)</span>
          {isClosed && (
            <span style={{ fontSize: '0.6875rem', backgroundColor: '#059669', color: '#ffffff', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
              Prêt
            </span>
          )}
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* PARTIE 1 : TRAITEMENT DE L'INVENTAIRE                                     */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'TREATMENT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* BANNIÈRE RÉCAPITULATIVE & FORMULE MÉTIER */}
          <div style={{
            backgroundColor: '#0f172a',
            backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(15,23,42,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93c5fd', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  <Sparkles size={14} />
                  <span>Formule Officielle du Traitement d'Inventaire</span>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
                  Calcul Automatique du Stock Total de la Boutique
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontFamily: 'monospace', backgroundColor: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '6px', display: 'inline-block' }}>
                  Stock compté + Ventes reportées − Commission ({treatment.commissionRate}%) − Non livrés + Dettes = <strong>Intermédiaire</strong> + Solde = <strong>Stock Total</strong>
                </div>
              </div>

              {/* 4 Blocs chiffrés clés */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', width: '100%', maxWidth: '640px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Stock Compté</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fde047', fontFamily: 'monospace' }}>
                    {formatFCFA(treatment.countedStockValue)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Intermédiaire</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#67e8f9', fontFamily: 'monospace' }}>
                    {formatFCFA(treatment.intermediateAmount)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Solde Boutique</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#86efac', fontFamily: 'monospace' }}>
                    {formatFCFA(treatment.shopBalance)}
                  </div>
                </div>

                <div style={{ backgroundColor: '#facc15', color: '#0f172a', padding: '10px 14px', borderRadius: '8px', fontWeight: 900 }}>
                  <div style={{ fontSize: '0.6875rem', color: '#713f12', textTransform: 'uppercase' }}>Stock Total</div>
                  <div style={{ fontSize: '1.05rem', fontFamily: 'monospace' }}>
                    {formatFCFA(treatment.totalCalculatedStock)}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions de validation & contrôle */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} color={isControlled ? '#4ade80' : '#facc15'} />
                  Contrôle : <strong>{treatment.controlStatus === 'CONTROLE_EFFECTUE' ? `Effectué (${treatment.controlledBy})` : 'En attente'}</strong>
                </span>
                <span>&bull;</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color={isClosed ? '#4ade80' : '#94a3b8'} />
                  Validation : <strong>{treatment.validationStatus === 'VALIDE_DEFINITIF' ? `Validé (${treatment.validatedBy})` : 'Non validé'}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {!isControlled && (isAdmin || isController) && (
                  <button
                    onClick={handleControlTreatment}
                    className="btn btn-sm"
                    style={{ backgroundColor: '#f59e0b', color: '#0f172a', fontWeight: 700 }}
                  >
                    <ShieldCheck size={14} />
                    <span>Valider le contrôle</span>
                  </button>
                )}

                {!isClosed && isAdmin && (
                  <button
                    onClick={() => {
                      setValidationNote('');
                      setValidationModalOpen(true);
                    }}
                    className="btn btn-sm"
                    style={{ backgroundColor: '#10b981', color: '#ffffff', fontWeight: 700 }}
                  >
                    <CheckCircle2 size={14} />
                    <span>Validation Définitive & Clôture</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── SOUS-ONGLETS DU TRAITEMENT (SYNTHÈSE, ARTICLES, VENTES, NON LIVRÉS, DETTES, SOLDE, AUDIT) ── */}
          <div style={{
            display: 'flex',
            gap: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '6px',
            borderRadius: '8px',
            overflowX: 'auto'
          }}>
            <button
              onClick={() => setTreatmentSubSection('CALCULATION')}
              style={{
                padding: '8px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: treatmentSubSection === 'CALCULATION' ? '#0f172a' : 'transparent',
                color: treatmentSubSection === 'CALCULATION' ? '#ffffff' : '#475569'
              }}
            >
              <Calculator size={14} />
              <span>Synthèse & Formule</span>
            </button>

            <button
              onClick={() => setTreatmentSubSection('COUNTED')}
              style={{
                padding: '8px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: treatmentSubSection === 'COUNTED' ? '#0f172a' : 'transparent',
                color: treatmentSubSection === 'COUNTED' ? '#ffffff' : '#475569'
              }}
            >
              <Package size={14} />
              <span>1. Stock compté Alu ({treatment.countedStockDetails?.length || 0})</span>
            </button>

            <button
              onClick={() => setTreatmentSubSection('SALES')}
              style={{
                padding: '8px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: treatmentSubSection === 'SALES' ? '#0f172a' : 'transparent',
                color: treatmentSubSection === 'SALES' ? '#ffffff' : '#475569'
              }}
            >
              <Receipt size={14} />
              <span>2. Ventes reportées ({treatment.reportedSales?.length || 0})</span>
            </button>

            <button
              onClick={() => setTreatmentSubSection('UNDELIVERED')}
              style={{
                padding: '8px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: treatmentSubSection === 'UNDELIVERED' ? '#0f172a' : 'transparent',
                color: treatmentSubSection === 'UNDELIVERED' ? '#ffffff' : '#475569'
              }}
            >
              <Truck size={14} />
              <span>3. Produits non livrés ({treatment.undeliveredProducts?.length || 0})</span>
            </button>

            <button
              onClick={() => setTreatmentSubSection('DEBTS')}
              style={{
                padding: '8px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: treatmentSubSection === 'DEBTS' ? '#0f172a' : 'transparent',
                color: treatmentSubSection === 'DEBTS' ? '#ffffff' : '#475569'
              }}
            >
              <CreditCard size={14} />
              <span>4. Dettes clients ({treatment.clientDebts?.length || 0})</span>
            </button>

            <button
              onClick={() => setTreatmentSubSection('BALANCE')}
              style={{
                padding: '8px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: treatmentSubSection === 'BALANCE' ? '#0f172a' : 'transparent',
                color: treatmentSubSection === 'BALANCE' ? '#ffffff' : '#475569'
              }}
            >
              <Wallet size={14} />
              <span>5. Solde boutique ({formatFCFA(treatment.shopBalance)})</span>
            </button>

            <button
              onClick={() => setTreatmentSubSection('AUDIT')}
              style={{
                padding: '8px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: treatmentSubSection === 'AUDIT' ? '#0f172a' : 'transparent',
                color: treatmentSubSection === 'AUDIT' ? '#ffffff' : '#475569'
              }}
            >
              <History size={14} />
              <span>Traçabilité ({treatment.auditTrail?.length || 0})</span>
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CONTENU 1 : SYNTHÈSE & CALCUL PAS À PAS                    */}
          {/* ─────────────────────────────────────────────────────────── */}
          {treatmentSubSection === 'CALCULATION' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {/* Carte Formule détaillée pas à pas */}
              <div className="card" style={{ gridColumn: 'span 2' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                    <Calculator size={18} color="#2563eb" />
                    <span>Détail du Calcul Pas à Pas du Traitement</span>
                  </div>
                  <span className="status-pill info">Automatisé</span>
                </div>

                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Étape 1 : Stock compté */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
                      1. Stock compté d'aluminium (quantités &times; prix)
                    </span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.9375rem', color: '#0f172a' }}>
                      {formatFCFA(treatment.countedStockValue)}
                    </span>
                  </div>

                  {/* Étape 2 : Ventes reportées */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <span style={{ fontWeight: 600, color: '#166534', fontSize: '0.875rem' }}>
                      + 2. Ventes reportées (saisies par le responsable)
                    </span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.9375rem', color: '#166534' }}>
                      + {formatFCFA(treatment.totalReportedSales)}
                    </span>
                  </div>

                  {/* Étape 3 : Commission boutique */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    <span style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.875rem' }}>
                      &minus; 3. Commission de la boutique ({treatment.commissionRate}%)
                    </span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.9375rem', color: '#991b1b' }}>
                      &minus; {formatFCFA(treatment.commissionAmount)}
                    </span>
                  </div>

                  {/* Étape 4 : Produits non livrés */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    <span style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.875rem' }}>
                      &minus; 4. Produits non livrés (déclarés par le responsable)
                    </span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.9375rem', color: '#991b1b' }}>
                      &minus; {formatFCFA(treatment.totalUndelivered)}
                    </span>
                  </div>

                  {/* Étape 5 : Dettes clients */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <span style={{ fontWeight: 600, color: '#166534', fontSize: '0.875rem' }}>
                      + 5. Dettes clients déclarées
                    </span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.9375rem', color: '#166534' }}>
                      + {formatFCFA(treatment.totalClientDebts)}
                    </span>
                  </div>

                  {/* Ligne Intermédiaire */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', backgroundColor: '#e0e7ff', borderRadius: '8px', border: '2px solid #a5b4fc', marginTop: '4px' }}>
                    <span style={{ fontWeight: 800, color: '#312e81', fontSize: '0.9375rem' }}>
                      = Montant Intermédiaire
                    </span>
                    <span style={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '1.125rem', color: '#1e1b4b' }}>
                      {formatFCFA(treatment.intermediateAmount)}
                    </span>
                  </div>

                  {/* Étape 6 : Solde boutique */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <span style={{ fontWeight: 600, color: '#166534', fontSize: '0.875rem' }}>
                      + 6. Solde de la boutique au {treatment.balanceDate}
                    </span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.9375rem', color: '#166534' }}>
                      + {formatFCFA(treatment.shopBalance)}
                    </span>
                  </div>

                  {/* TOTAL FINAL DU STOCK DE LA BOUTIQUE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: '#facc15', borderRadius: '10px', border: '2px solid #eab308', marginTop: '6px', color: '#0f172a' }}>
                    <span style={{ fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase' }}>
                      STOCK TOTAL DE LA BOUTIQUE
                    </span>
                    <span style={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '1.375rem' }}>
                      {formatFCFA(treatment.totalCalculatedStock)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Colonne latérale : Comparaison au Stock Initial */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card">
                  <div className="card-header">
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>Comparaison au Stock Initial</span>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.875rem' }}>
                      <span style={{ color: '#64748b' }}>Stock Initial ({treatment.initialStockDate}) :</span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatFCFA(treatment.initialStockValue)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.875rem' }}>
                      <span style={{ color: '#64748b' }}>Stock Total Calculé :</span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatFCFA(treatment.totalCalculatedStock)}</span>
                    </div>

                    <div style={{
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: treatment.isPositiveDifference ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${treatment.isPositiveDifference ? '#bbf7d0' : '#fecaca'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: treatment.isPositiveDifference ? '#166534' : '#991b1b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {treatment.isPositiveDifference ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          Résultat ({treatment.isPositiveDifference ? 'écart positif' : 'écart négatif'})
                        </span>
                        <span style={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '1.125rem', color: treatment.isPositiveDifference ? '#15803d' : '#b91c1c' }}>
                          {treatment.isPositiveDifference ? '+' : ''}{formatFCFA(treatment.difference)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                        {treatment.isPositiveDifference 
                          ? `Le stock total calculé est supérieur au stock initial de ${formatFCFA(treatment.difference)}, ce qui donne un écart positif conforme.`
                          : `Le stock total calculé présente un déficit de ${formatFCFA(Math.abs(treatment.difference))} par rapport au stock initial.`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Saisie rapide du Solde de la boutique */}
                <div className="card">
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                      <Wallet size={16} color="#059669" />
                      <span>Solde de la Boutique</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '14px' }}>
                      Renseigné par le responsable de boutique et réinjecté automatiquement dans le calcul.
                    </p>

                    {isEditingBalance ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Montant du solde (FCFA) :</label>
                          <input
                            type="number"
                            value={editBalance}
                            onChange={(e) => setEditBalance(Number(e.target.value))}
                            className="form-input"
                            style={{ fontWeight: 700, fontFamily: 'monospace' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Date du solde :</label>
                          <input
                            type="text"
                            placeholder="Ex: 10/08/2026"
                            value={editBalanceDate}
                            onChange={(e) => setEditBalanceDate(e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <button onClick={handleSaveBalance} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                            Enregistrer
                          </button>
                          <button onClick={() => setIsEditingBalance(false)} className="btn btn-secondary btn-sm">
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                          <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase' }}>Solde au {treatment.balanceDate}</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'monospace', color: '#0f172a' }}>
                            {formatFCFA(treatment.shopBalance)}
                          </div>
                        </div>

                        {!isClosed && (isManager || isAdmin) && (
                          <button
                            onClick={() => {
                              setEditBalance(treatment.shopBalance);
                              setEditBalanceDate(treatment.balanceDate);
                              setIsEditingBalance(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ width: '100%' }}
                          >
                            Modifier le solde
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CONTENU 2 : STOCK COMPTÉ ALUMINIUM DÉTAILLÉ                */}
          {/* ─────────────────────────────────────────────────────────── */}
          {treatmentSubSection === 'COUNTED' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>1. Stock Compté d'Aluminium</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Récupéré automatiquement de l'inventaire physique. Détaillé par article, couleur, quantité et valeur.</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Total Compté</span>
                  <span style={{ fontWeight: 900, fontFamily: 'monospace', color: '#2563eb', fontSize: '1.125rem' }}>
                    {formatFCFA(treatment.countedStockValue)}
                  </span>
                </div>
              </div>

              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Article / Profilé Aluminium</th>
                      <th>Couleur</th>
                      <th style={{ textAlign: 'right' }}>Quantité comptée</th>
                      <th style={{ textAlign: 'right' }}>Prix Unitaire</th>
                      <th style={{ textAlign: 'right' }}>Valeur Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatment.countedStockDetails?.map((line, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{line.designation}</td>
                        <td>
                          <span className="status-pill neutral" style={{ fontSize: '0.6875rem' }}>
                            {line.color || 'Standard'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>{line.quantity} barres</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#64748b' }}>{formatFCFA(line.unitPrice)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>{formatFCFA(line.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f8fafc', fontWeight: 800 }}>
                      <td colSpan={2} style={{ textTransform: 'uppercase', fontSize: '0.75rem', padding: '14px 16px' }}>Total Stock Compté</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', padding: '14px 16px' }}>
                        {treatment.countedStockDetails?.reduce((sum, l) => sum + l.quantity, 0)} barres
                      </td>
                      <td></td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '1rem', color: '#2563eb', padding: '14px 16px' }}>
                        {formatFCFA(treatment.countedStockValue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CONTENU 3 : VENTES REPORTÉES                               */}
          {/* ─────────────────────────────────────────────────────────── */}
          {treatmentSubSection === 'SALES' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>2. Ventes Reportées</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Renseignées par le responsable de boutique et intégrées automatiquement au calcul.</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Total Ventes Reportées</span>
                  <span style={{ fontWeight: 900, fontFamily: 'monospace', color: '#059669', fontSize: '1.125rem' }}>
                    + {formatFCFA(treatment.totalReportedSales)}
                  </span>
                </div>
              </div>

              <div className="card-body">
                {/* Formulaire de saisie pour responsable */}
                {!isClosed && (isManager || isAdmin) && (
                  <form onSubmit={handleAddSale} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus size={16} color="#059669" />
                      <span>Saisir une Vente Reportée</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Article / Profilé *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: TUBE RECTANGULAIRE 80x40"
                          value={newSale.designation}
                          onChange={(e) => setNewSale({ ...newSale, designation: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Couleur</label>
                        <input
                          type="text"
                          placeholder="BLANC / NOIR"
                          value={newSale.color}
                          onChange={(e) => setNewSale({ ...newSale, color: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Quantité</label>
                        <input
                          type="number"
                          min="1"
                          value={newSale.quantity}
                          onChange={(e) => setNewSale({ ...newSale, quantity: Number(e.target.value) })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Montant Total (FCFA) *</label>
                        <input
                          type="number"
                          required
                          value={newSale.totalAmount}
                          onChange={(e) => setNewSale({ ...newSale, totalAmount: Number(e.target.value) })}
                          className="form-input"
                          style={{ fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn btn-primary btn-sm">
                        <Plus size={14} />
                        <span>Ajouter la vente reportée</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Article</th>
                        <th>Couleur</th>
                        <th style={{ textAlign: 'right' }}>Quantité</th>
                        <th style={{ textAlign: 'right' }}>Montant Total</th>
                        <th>Date</th>
                        {!isClosed && (isManager || isAdmin) && <th style={{ textAlign: 'center' }}>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {treatment.reportedSales?.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontStyle: 'italic' }}>
                            Aucune vente reportée saisie pour cet inventaire.
                          </td>
                        </tr>
                      ) : (
                        treatment.reportedSales?.map((sale) => (
                          <tr key={sale.id}>
                            <td style={{ fontWeight: 600, color: '#0f172a' }}>{sale.designation}</td>
                            <td>{sale.color || 'Standard'}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>{sale.quantity}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#059669' }}>{formatFCFA(sale.totalAmount)}</td>
                            <td style={{ color: '#64748b' }}>{sale.date || '—'}</td>
                            {!isClosed && (isManager || isAdmin) && (
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  onClick={() => store.removeReportedSale(selectedInventoryId, sale.id)}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '3px 8px' }}
                                  title="Supprimer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CONTENU 4 : PRODUITS NON LIVRÉS                            */}
          {/* ─────────────────────────────────────────────────────────── */}
          {treatmentSubSection === 'UNDELIVERED' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>3. Produits Non Livrés</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Déclaration détaillée par le responsable (article, couleur, quantité, prix, montant déduit).</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Total Non Livré</span>
                  <span style={{ fontWeight: 900, fontFamily: 'monospace', color: '#dc2626', fontSize: '1.125rem' }}>
                    &minus; {formatFCFA(treatment.totalUndelivered)}
                  </span>
                </div>
              </div>

              <div className="card-body">
                {!isClosed && (isManager || isAdmin) && (
                  <form onSubmit={handleAddUndelivered} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus size={16} color="#dc2626" />
                      <span>Déclarer un Produit Non Livré</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Désignation *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: CORNIERE 25x25"
                          value={newUndelivered.designation}
                          onChange={(e) => setNewUndelivered({ ...newUndelivered, designation: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Couleur</label>
                        <input
                          type="text"
                          placeholder="BRONZE"
                          value={newUndelivered.color}
                          onChange={(e) => setNewUndelivered({ ...newUndelivered, color: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Quantité non livrée</label>
                        <input
                          type="number"
                          min="1"
                          value={newUndelivered.quantity}
                          onChange={(e) => setNewUndelivered({ ...newUndelivered, quantity: Number(e.target.value) })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Prix Unitaire (FCFA)</label>
                        <input
                          type="number"
                          min="0"
                          value={newUndelivered.unitPrice}
                          onChange={(e) => setNewUndelivered({ ...newUndelivered, unitPrice: Number(e.target.value) })}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn btn-primary btn-sm">
                        <Plus size={14} />
                        <span>Enregistrer le non-livré</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Article</th>
                        <th>Couleur</th>
                        <th style={{ textAlign: 'right' }}>Quantité Non Livrée</th>
                        <th style={{ textAlign: 'right' }}>Prix Unitaire</th>
                        <th style={{ textAlign: 'right' }}>Montant Correspondant</th>
                        {!isClosed && (isManager || isAdmin) && <th style={{ textAlign: 'center' }}>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {treatment.undeliveredProducts?.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontStyle: 'italic' }}>
                            Aucun produit non livré déclaré.
                          </td>
                        </tr>
                      ) : (
                        treatment.undeliveredProducts?.map((item) => (
                          <tr key={item.id}>
                            <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.designation}</td>
                            <td>{item.color || 'Standard'}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#64748b' }}>{formatFCFA(item.unitPrice)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#dc2626' }}>{formatFCFA(item.totalAmount)}</td>
                            {!isClosed && (isManager || isAdmin) && (
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  onClick={() => store.removeUndeliveredProduct(selectedInventoryId, item.id)}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '3px 8px' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CONTENU 5 : DETTES CLIENTS                                 */}
          {/* ─────────────────────────────────────────────────────────── */}
          {treatmentSubSection === 'DEBTS' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>4. Dettes Clients</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Saisies par le responsable de boutique et intégrées automatiquement au calcul.</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Total Dettes Clients</span>
                  <span style={{ fontWeight: 900, fontFamily: 'monospace', color: '#4f46e5', fontSize: '1.125rem' }}>
                    + {formatFCFA(treatment.totalClientDebts)}
                  </span>
                </div>
              </div>

              <div className="card-body">
                {!isClosed && (isManager || isAdmin) && (
                  <form onSubmit={handleAddDebt} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus size={16} color="#4f46e5" />
                      <span>Déclarer une Dette Client</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Nom du client / Entreprise *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Entreprise BATIMEN SARL"
                          value={newDebt.clientName}
                          onChange={(e) => setNewDebt({ ...newDebt, clientName: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Téléphone</label>
                        <input
                          type="text"
                          placeholder="+229 97 00 00 00"
                          value={newDebt.phone}
                          onChange={(e) => setNewDebt({ ...newDebt, phone: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Montant de la créance (FCFA) *</label>
                        <input
                          type="number"
                          required
                          value={newDebt.amount}
                          onChange={(e) => setNewDebt({ ...newDebt, amount: Number(e.target.value) })}
                          className="form-input"
                          style={{ fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn btn-primary btn-sm">
                        <Plus size={14} />
                        <span>Enregistrer la dette</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Contact</th>
                        <th style={{ textAlign: 'right' }}>Montant de la Créance</th>
                        {!isClosed && (isManager || isAdmin) && <th style={{ textAlign: 'center' }}>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {treatment.clientDebts?.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontStyle: 'italic' }}>
                            Aucune dette client déclarée pour cette période.
                          </td>
                        </tr>
                      ) : (
                        treatment.clientDebts?.map((debt) => (
                          <tr key={debt.id}>
                            <td style={{ fontWeight: 600, color: '#0f172a' }}>{debt.clientName}</td>
                            <td style={{ color: '#64748b' }}>{debt.phone || '—'}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#4f46e5' }}>{formatFCFA(debt.amount)}</td>
                            {!isClosed && (isManager || isAdmin) && (
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  onClick={() => store.removeClientDebt(selectedInventoryId, debt.id)}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '3px 8px' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CONTENU 6 : SOLDE & COMMISSION DE LA BOUTIQUE              */}
          {/* ─────────────────────────────────────────────────────────── */}
          {treatmentSubSection === 'BALANCE' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div className="card">
                <div className="card-header">
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>5. Solde de la Boutique</div>
                  <span className="status-pill info">Saisi par le responsable</span>
                </div>
                <div className="card-body">
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
                    Le solde de la boutique est saisi par le responsable d'agence au terme de la période inventoriée. Il s'additionne au montant intermédiaire pour former le stock total.
                  </p>

                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, marginBottom: '4px' }}>Solde au {treatment.balanceDate} :</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'monospace', color: '#14532d' }}>
                      {formatFCFA(treatment.shopBalance)}
                    </div>
                  </div>

                  {!isClosed && (isManager || isAdmin) && (
                    <button
                      onClick={() => {
                        setEditBalance(treatment.shopBalance);
                        setEditBalanceDate(treatment.balanceDate);
                        setIsEditingBalance(true);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%' }}
                    >
                      Mettre à jour le solde déclaré
                    </button>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>6. Commission de la Boutique</div>
                  <span className="status-pill warning">Taux fixé : {treatment.commissionRate}%</span>
                </div>
                <div className="card-body">
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
                    Le système applique automatiquement ce pourcentage sur les ventes concernées pour déterminer la commission accordée à la boutique. Le responsable n'a aucun calcul manuel à effectuer.
                  </p>

                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Assiette de commission (ventes) :</span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatFCFA(treatment.totalReportedSales)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Pourcentage défini pour l'agence :</span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{treatment.commissionRate}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontWeight: 800, color: '#dc2626' }}>
                      <span>Commission déduite au calcul :</span>
                      <span style={{ fontFamily: 'monospace' }}>&minus; {formatFCFA(treatment.commissionAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CONTENU 7 : TRAÇABILITÉ INTÉGRALE DES SAISIES              */}
          {/* ─────────────────────────────────────────────────────────── */}
          {treatmentSubSection === 'AUDIT' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Traçabilité & Historique des Saisies</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>L'administration peut vérifier précisément qui a renseigné quoi, quand et pour quelle boutique.</div>
                </div>
                <span className="status-pill info">{treatment.auditTrail?.length || 0} actions tracées</span>
              </div>

              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Horodatage</th>
                      <th>Auteur & Rôle</th>
                      <th>Boutique</th>
                      <th>Nature de l'Information</th>
                      <th>Champ / Cible</th>
                      <th>Valeur / Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatment.auditTrail?.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Aucune modification enregistrée pour le moment.
                        </td>
                      </tr>
                    ) : (
                      treatment.auditTrail?.slice().reverse().map((entry) => (
                        <tr key={entry.id}>
                          <td style={{ color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{entry.timestamp}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>
                            {entry.userName}
                            <span style={{ display: 'block', fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>[{entry.userRole}]</span>
                          </td>
                          <td style={{ color: '#334155' }}>{entry.shopName}</td>
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>{entry.nature}</td>
                          <td style={{ color: '#64748b', fontFamily: 'monospace' }}>{entry.field}</td>
                          <td style={{ fontWeight: 700, color: '#059669', fontFamily: 'monospace' }}>{entry.newValue}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* PARTIE 2 : RAPPORT DE L'INVENTAIRE (STRICTEMENT FIDÈLE À LA CAPTURE 2)    */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'OFFICIAL_REPORT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Actions d'impression */}
          <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#854d0e', textTransform: 'uppercase' }}>Document Officiel Certifié</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>Rapport d'Inventaire Final (Modèle Capture 2)</div>
            </div>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={15} />
              <span>Imprimer / PDF</span>
            </button>
          </div>

          {/* DOCUMENT DE RAPPORT OFFICIEL */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '12px',
            border: '2px solid #cbd5e1',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
            maxWidth: '850px',
            margin: '0 auto',
            width: '100%'
          }}>
            {/* En-tête société */}
            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                  {companySettings.name}
                </h2>
                <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '4px' }}>
                  {companySettings.address} &bull; Tél : {companySettings.phone}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  IFU : {companySettings.ifu} &bull; RCCM : {companySettings.rccm}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
                  {selectedInventory.code}
                </span>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Date : {treatment.periodEnd}</div>
              </div>
            </div>

            {/* TABLEAU EXACT DE LA CAPTURE 2 */}
            <div style={{ border: '2px solid #000000', marginBottom: '20px' }}>
              {/* Titre du tableau */}
              <div style={{
                backgroundColor: '#ffffff',
                padding: '14px 10px',
                textAlign: 'center',
                borderBottom: '2px solid #000000',
                fontWeight: 900,
                fontSize: '1.05rem',
                textTransform: 'uppercase',
                color: '#000000',
                letterSpacing: '0.02em'
              }}>
                RAPPORT D'INVENTAIRE DU STOCK ALU DE {selectedInventory.shopName.toUpperCase()} DU {treatment.periodStart.replace(/\//g, '-')} AU {treatment.periodEnd.replace(/\//g, '-')}
              </div>

              {/* Lignes du tableau officiel */}
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', color: '#000000' }}>
                <tbody>
                  {/* LIGNE 1 : STOCK INITIAL (JAUNE) */}
                  <tr style={{ borderBottom: '2px solid #000000' }}>
                    <td style={{
                      width: '50%',
                      padding: '14px 16px',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      textTransform: 'uppercase',
                      borderRight: '2px solid #000000',
                      backgroundColor: '#fef08a'
                    }}>
                      STOCK DU {treatment.initialStockDate.replace(/\//g, '-')}
                    </td>
                    <td style={{
                      width: '50%',
                      padding: '14px 16px',
                      fontWeight: 900,
                      fontSize: '1.35rem',
                      fontFamily: 'monospace',
                      backgroundColor: '#fef08a'
                    }}>
                      {new Intl.NumberFormat('fr-FR').format(treatment.initialStockValue)}
                    </td>
                  </tr>

                  {/* LIGNE 2 : SOLDE DE LA BOUTIQUE */}
                  <tr style={{ borderBottom: '2px solid #000000' }}>
                    <td style={{
                      width: '50%',
                      padding: '14px 16px',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      textTransform: 'uppercase',
                      borderRight: '2px solid #000000',
                      backgroundColor: '#ffffff'
                    }}>
                      SOLDE AU {treatment.balanceDate.toUpperCase()}
                    </td>
                    <td style={{
                      width: '50%',
                      padding: '14px 16px',
                      fontWeight: 900,
                      fontSize: '1.35rem',
                      fontFamily: 'monospace',
                      backgroundColor: '#ffffff'
                    }}>
                      {new Intl.NumberFormat('fr-FR').format(treatment.shopBalance)}
                    </td>
                  </tr>

                  {/* LIGNE 3 : STOCK COMPTÉ LE ... */}
                  <tr style={{ borderBottom: '2px solid #000000' }}>
                    <td style={{
                      width: '50%',
                      padding: '14px 16px',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      textTransform: 'uppercase',
                      borderRight: '2px solid #000000',
                      backgroundColor: '#ffffff'
                    }}>
                      STOCK COMPTÉ LE {treatment.periodEnd.toUpperCase()}
                    </td>
                    <td style={{
                      width: '50%',
                      padding: '14px 16px',
                      fontWeight: 900,
                      fontSize: '1.35rem',
                      fontFamily: 'monospace',
                      backgroundColor: '#ffffff'
                    }}>
                      {new Intl.NumberFormat('fr-FR').format(treatment.countedStockValue)}
                    </td>
                  </tr>

                  {/* LIGNE 4 : STOCK TOTAL */}
                  <tr style={{ borderBottom: '2px solid #000000' }}>
                    <td style={{
                      width: '50%',
                      padding: '14px 16px',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      textTransform: 'uppercase',
                      borderRight: '2px solid #000000',
                      backgroundColor: '#ffffff'
                    }}>
                      STOCK TOTAL
                    </td>
                    <td style={{
                      width: '50%',
                      padding: '14px 16px',
                      fontWeight: 900,
                      fontSize: '1.35rem',
                      fontFamily: 'monospace',
                      backgroundColor: '#ffffff'
                    }}>
                      {new Intl.NumberFormat('fr-FR').format(treatment.totalCalculatedStock)}
                    </td>
                  </tr>

                  {/* LIGNE 5 : RESULTAT (ÉCART POSITIF) (JAUNE) */}
                  <tr>
                    <td style={{
                      width: '50%',
                      padding: '14px 16px',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      textTransform: 'uppercase',
                      borderRight: '2px solid #000000',
                      backgroundColor: '#fef08a'
                    }}>
                      RESULTAT({treatment.isPositiveDifference ? 'ecart positif' : 'ecart negatif'})
                    </td>
                    <td style={{
                      width: '50%',
                      padding: '14px 16px',
                      fontWeight: 900,
                      fontSize: '1.35rem',
                      fontFamily: 'monospace',
                      backgroundColor: '#fef08a'
                    }}>
                      {new Intl.NumberFormat('fr-FR').format(Math.abs(treatment.difference))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DESCRIPTION MOT POUR MOT DU RAPPORT UTILISATEUR */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '16px 20px',
              fontSize: '0.875rem',
              color: '#1e293b',
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', color: '#475569', marginBottom: '8px' }}>
                Description du Rapport :
              </div>
              <p style={{ margin: '0 0 8px 0' }}>
                Ce rapport présente de manière synthétique la situation du stock d’aluminium de <strong>{selectedInventory.shopName}</strong> sur la période du {treatment.periodStart} au {treatment.periodEnd}.
              </p>
              <ul style={{ margin: '0 0 10px 20px', padding: 0 }}>
                <li>Stock initial au {treatment.initialStockDate} : <strong>{new Intl.NumberFormat('fr-FR').format(treatment.initialStockValue)}</strong></li>
                <li>Solde au {treatment.balanceDate} : <strong>{new Intl.NumberFormat('fr-FR').format(treatment.shopBalance)}</strong></li>
                <li>Stock compté le {treatment.periodEnd} : <strong>{new Intl.NumberFormat('fr-FR').format(treatment.countedStockValue)}</strong></li>
                <li>Stock total calculé : <strong>{new Intl.NumberFormat('fr-FR').format(treatment.totalCalculatedStock)}</strong></li>
                <li>Résultat / {treatment.isPositiveDifference ? 'écart positif' : 'écart négatif'} : <strong>{new Intl.NumberFormat('fr-FR').format(Math.abs(treatment.difference))}</strong></li>
              </ul>
              <div style={{ fontWeight: 700, borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                👉 En résumé, le stock total calculé est {treatment.isPositiveDifference ? 'supérieur' : 'inférieur'} au stock initial de {new Intl.NumberFormat('fr-FR').format(Math.abs(treatment.difference))}, ce qui donne un {treatment.isPositiveDifference ? 'écart positif' : 'écart négatif'} de {new Intl.NumberFormat('fr-FR').format(Math.abs(treatment.difference))}.
              </div>
            </div>

            {/* Signatures officielles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '48px', textAlign: 'center', fontSize: '0.8125rem' }}>
              <div>
                <div style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', marginBottom: '40px' }}>Le Responsable Boutique</div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', fontWeight: 600, color: '#334155' }}>
                  {targetShop?.managerName || 'Signature Gérant'}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', marginBottom: '40px' }}>Le Contrôleur d'Inventaire</div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', fontWeight: 600, color: '#334155' }}>
                  {treatment.controlledBy || 'Visa Commission'}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', marginBottom: '40px' }}>La Direction Générale</div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', fontWeight: 600, color: '#334155' }}>
                  {treatment.validatedBy || 'Approbation Clôture'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL VALIDATION DÉFINITIVE & CLÔTURE ── */}
      {validationModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#065f46' }}>
                <CheckCircle2 size={20} color="#059669" />
                <span>Validation Définitive & Clôture Officielle</span>
              </div>
              <button onClick={() => setValidationModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="alert-banner warning">
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                  Après validation définitive :
                  <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    <li>Le dossier sera <strong>scellé et clôturé</strong>.</li>
                    <li>L'administration et le magasinier auront accès complet à l'inventaire, au traitement et au rapport.</li>
                    <li>Les <strong>inventoristes ne pourront plus y accéder</strong>.</li>
                  </ul>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Visa / Observations de clôture :</label>
                <textarea
                  rows={3}
                  value={validationNote}
                  onChange={(e) => setValidationNote(e.target.value)}
                  placeholder="Ex: Procès-verbal conforme et certifié par la direction."
                  className="form-textarea"
                />
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setValidationModalOpen(false)} className="btn btn-secondary btn-sm">
                Annuler
              </button>
              <button onClick={handleValidateDefinitive} className="btn btn-primary btn-sm" style={{ backgroundColor: '#059669', borderColor: '#059669' }}>
                Confirmer la validation définitive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
