import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Edit3,
  History,
  AlertCircle,
  Check,
  Lock,
  ShieldAlert,
  X,
  FileSpreadsheet,
  Send,
  Clock,
  CheckCircle2,
  Eye,
  Plus,
  Palette,
  Tag
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../services/store';
import { CatalogItem, AluminiumColor, Category } from '../types';

// ──────────────────────────────────────────────────────
// Types locaux pour le workflow de demande de prix
// ──────────────────────────────────────────────────────
interface PriceRequest {
  id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
  submittedBy: string;
  submittedByRole: string;
  submittedAt: string;
  status: 'EN_ATTENTE' | 'APPROUVEE' | 'REFUSEE';
}

export const CatalogView: React.FC = () => {
  const store = useALUStore();
  const catalog = store.getCatalog();
  const priceHistories = store.getPriceHistories();
  const currentUser = store.getCurrentUser();

  const [selectedCategory, setSelectedCategory] = useState<Category>('Aluminium');
  const [searchQuery, setSearchQuery] = useState('');

  // States pour la demande / validation de prix
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [newPriceInput, setNewPriceInput] = useState<number>(0);
  const [editDesignation, setEditDesignation] = useState('');
  const [editColor, setEditColor] = useState<string>('Blanche');
  const [isEditCustomColor, setIsEditCustomColor] = useState(false);
  const [editCustomColor, setEditCustomColor] = useState('');
  const [editUnit, setEditUnit] = useState('Barre de 6m');
  const [priceReason, setPriceReason] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  // States pour la création d'un nouvel article (Magasinier / PDG / Admin)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createCategory, setCreateCategory] = useState<Category>('Aluminium');
  const [createCode, setCreateCode] = useState('');
  const [createDesignation, setCreateDesignation] = useState('');
  const [createColor, setCreateColor] = useState<string>('Blanche');
  const [isCreateCustomColor, setIsCreateCustomColor] = useState(false);
  const [createCustomColor, setCreateCustomColor] = useState('');
  const [createPrice, setCreatePrice] = useState<number>(0);
  const [createUnit, setCreateUnit] = useState('Barre de 6m');
  const [createFeedback, setCreateFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // States import fichier
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importNotes, setImportNotes] = useState('Actualisation officielle des barèmes');
  const [importRows] = useState<{ code: string; newPrice: number; designation?: string }[]>([
    { code: 'ALT-ALU-001', designation: 'RAIL 3V BLANC', newPrice: 38500 },
    { code: 'ALT-ALU-002', designation: 'MONTANT NOIR', newPrice: 32000 },
    { code: 'ALT-ACC-001', designation: 'SERRURE A CLE', newPrice: 9500 },
  ]);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // ── Demandes de prix en attente (simulation locale) ──
  const [priceRequests, setPriceRequests] = useState<PriceRequest[]>([
    {
      id: 'req_demo_01',
      productId: 'ALT-ALU-001',
      productName: 'RAIL 3V BLANC',
      oldPrice: 35000,
      newPrice: 38500,
      reason: 'Révision suite à hausse des coûts d\'importation matières premières Q3 2026.',
      submittedBy: 'Bertrand Konan',
      submittedByRole: 'MAGASINIER',
      submittedAt: '23/10/2026 09:14',
      status: 'EN_ATTENTE',
    }
  ]);

  // ── Permissions selon le rôle ──
  const role = currentUser.role;
  const isPDG = role === 'PDG';
  const isMagasinier = role === 'MAGASINIER';
  const isSecretaire = role === 'SECRETAIRE_DIRECTION';
  const isAdmin = role === 'ADMIN';

  // Le Magasinier, le Secrétaire, le PDG et l'Admin peuvent gérer le catalogue et les prix
  const canManageCatalog = isMagasinier || isPDG || isAdmin || isSecretaire;
  const canSubmitPriceRequest = canManageCatalog;
  const canApprovePriceRequest = isPDG || isAdmin;
  const canImportFile = canManageCatalog;

  const pendingRequests = priceRequests.filter(r => r.status === 'EN_ATTENTE');

  const defaultAluminiumColors = ['Blanche', 'Grise', 'Bronze', 'Satinée', 'Beige', 'Noire', 'Champagne', 'Bois'];

  // Récupère dynamiquement toutes les couleurs existantes du catalogue, y compris celles ajoutées par le Magasinier
  const distinctCatalogColors = useMemo(() => {
    const customColors = catalog
      .filter(i => i.category === 'Aluminium' && i.color && !defaultAluminiumColors.includes(i.color))
      .map(i => i.color as string);
    return Array.from(new Set([...defaultAluminiumColors, ...customColors]));
  }, [catalog]);

  const getColorSwatch = (color: string) => {
    switch (color) {
      case 'Blanche': return { bg: '#ffffff', border: '#cbd5e1', label: 'Blanc Pur' };
      case 'Grise': return { bg: '#94a3b8', border: '#64748b', label: 'Gris Anodisé' };
      case 'Bronze': return { bg: '#78350f', border: '#451a03', label: 'Bronze Électro' };
      case 'Satinée': return { bg: '#e2e8f0', border: '#94a3b8', label: 'Alu Satiné' };
      case 'Beige': return { bg: '#fef3c7', border: '#d97706', label: 'Beige Crème' };
      case 'Noire': return { bg: '#0f172a', border: '#020617', label: 'Noir Mat' };
      case 'Champagne': return { bg: '#fef08a', border: '#ca8a04', label: 'Champagne' };
      case 'Bois': return { bg: '#78350f', border: '#451a03', label: 'Effet Bois' };
      default: return { bg: '#38bdf8', border: '#0284c7', label: color };
    }
  };

  // Ouvre le formulaire de modification complète d'un article
  const handleOpenEditForm = (item: CatalogItem) => {
    setEditingItem(item);
    setNewPriceInput(item.officialPrice);
    setEditDesignation(item.designation);
    setEditUnit(item.unit || (item.category === 'Aluminium' ? 'Barre de 6m' : 'Pièce'));
    if (item.color && !defaultAluminiumColors.includes(item.color)) {
      setIsEditCustomColor(true);
      setEditCustomColor(item.color);
      setEditColor('CUSTOM');
    } else {
      setIsEditCustomColor(false);
      setEditCustomColor('');
      setEditColor(item.color || 'Blanche');
    }
    setPriceReason('');
    setFeedbackMsg(null);
  };

  // Modification DIRECTE du prix par le Magasinier ou le Secrétaire (ou PDG/Admin)
  // Pas d'obligation de soumission : prise d'effet immédiate + enregistrement dans la base d'audit
  // Enregistrement des modifications d'un article existant
  const handleSubmitPriceChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (newPriceInput <= 0) {
      setFeedbackMsg({ type: 'error', text: 'Le prix doit être strictement supérieur à 0 FCFA.' });
      return;
    }
    if (!editDesignation.trim()) {
      setFeedbackMsg({ type: 'error', text: 'La désignation de l\'article est obligatoire.' });
      return;
    }

    const finalColor = editingItem.category === 'Aluminium'
      ? (isEditCustomColor ? editCustomColor.trim() : editColor)
      : undefined;

    const res = store.updateCatalogItem(editingItem.id, {
      designation: editDesignation,
      officialPrice: Number(newPriceInput),
      color: finalColor,
      unit: editUnit,
      reason: priceReason || `Mise à jour par ${currentUser.name} (${currentUser.role})`
    });

    if (res.success) {
      setFeedbackMsg({
        type: 'success',
        text: `✅ ${res.message}`
      });

      setTimeout(() => {
        setEditingItem(null);
        setFeedbackMsg(null);
      }, 1200);
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  // Création d'un nouvel article au catalogue par le Magasinier / PDG
  const handleCreateNewArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createDesignation.trim()) {
      setCreateFeedback({ type: 'error', text: 'Veuillez saisir une désignation pour l\'article.' });
      return;
    }
    if (createPrice <= 0) {
      setCreateFeedback({ type: 'error', text: 'Le prix officiel doit être supérieur à 0 FCFA.' });
      return;
    }

    const finalColor = createCategory === 'Aluminium'
      ? (isCreateCustomColor ? createCustomColor.trim() : createColor)
      : undefined;

    if (createCategory === 'Aluminium' && !finalColor) {
      setCreateFeedback({ type: 'error', text: 'Veuillez sélectionner ou saisir une couleur pour l\'aluminium.' });
      return;
    }

    const res = store.addCatalogItem({
      code: createCode.trim() || undefined,
      designation: createDesignation,
      category: createCategory,
      color: finalColor,
      officialPrice: Number(createPrice),
      unit: createUnit
    });

    if (res.success) {
      setCreateFeedback({ type: 'success', text: `✅ ${res.message}` });
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateFeedback(null);
        setCreateDesignation('');
        setCreateCode('');
        setCreatePrice(0);
        setCreateCustomColor('');
        setIsCreateCustomColor(false);
      }, 1300);
    } else {
      setCreateFeedback({ type: 'error', text: res.message });
    }
  };

  // Approbation d'une demande par le PDG
  const handleApproveRequest = (req: PriceRequest) => {
    const res = store.updateCatalogPrice({
      productId: req.productId,
      newPrice: req.newPrice,
      reason: `[Approuvé par PDG] ${req.reason} — Soumis par ${req.submittedBy}`
    });

    if (res.success) {
      setPriceRequests(prev =>
        prev.map(r => r.id === req.id ? { ...r, status: 'APPROUVEE' } : r)
      );
    } else {
      alert(res.message);
    }
  };

  // Refus d'une demande par le PDG
  const handleRejectRequest = (req: PriceRequest) => {
    setPriceRequests(prev =>
      prev.map(r => r.id === req.id ? { ...r, status: 'REFUSEE' } : r)
    );
  };

  const handleExecuteImport = (e: React.FormEvent) => {
    e.preventDefault();
    const res = store.uploadCatalogPriceFile({
      fileName: importFileName || 'Grille_Prix_Actualisee_2026.xlsx',
      items: importRows,
      notes: importNotes
    });

    if (res.success) {
      setImportFeedback(res.message);
      setTimeout(() => {
        setShowImportModal(false);
        setImportFeedback(null);
      }, 1600);
    } else {
      alert(res.message);
    }
  };

  // ── BADGE STATUT DEMANDE ──
  const getRequestBadge = (status: PriceRequest['status']) => {
    switch (status) {
      case 'EN_ATTENTE': return { bg: '#fffbeb', color: '#92400e', label: 'En attente PDG' };
      case 'APPROUVEE': return { bg: '#ecfdf5', color: '#065f46', label: 'Approuvée' };
      case 'REFUSEE': return { bg: '#fef2f2', color: '#991b1b', label: 'Refusée' };
    }
  };

  // ── RENDU BOUTON D'ACTION DANS LE TABLEAU ──
  const renderActionCell = (item: CatalogItem) => {
    if (canManageCatalog) {
      return (
        <button
          onClick={() => handleOpenEditForm(item)}
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#2563eb', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          title="Modifier le prix, la couleur ou la désignation de cet article"
        >
          <Edit3 size={13} />
          <span>Modifier</span>
        </button>
      );
    }
    return (
      <span title="Consultation uniquement" style={{ color: '#94a3b8' }}>
        <Eye size={15} />
      </span>
    );
  };

  return (
    <div>
      {/* En-tête */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563eb', fontSize: '1rem' }}>MODULE 06</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              Base Centrale des Articles &amp; Grille Tarifaire
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Consultation ouverte à tous les profils.{' '}
            Révision des prix : soumission par le <strong>Magasinier</strong> ou le <strong>Secrétaire</strong>, validation exclusive par le <strong>PDG</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Bouton Nouvel Article pour le Magasinier, PDG et Admin */}
          {canManageCatalog && (
            <button
              onClick={() => {
                setShowCreateModal(true);
                setCreateCategory(selectedCategory);
                setCreateFeedback(null);
                setCreatePrice(0);
                setCreateDesignation('');
                setCreateCode('');
                setCreateColor('Blanche');
                setIsCreateCustomColor(false);
                setCreateCustomColor('');
                setCreateUnit(selectedCategory === 'Aluminium' ? 'Barre de 6m' : 'Pièce');
              }}
              className="btn btn-sm"
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                boxShadow: '0 2px 4px rgba(37,99,235,0.25)'
              }}
              title="Ajouter un nouvel article, définir son prix et sa couleur"
            >
              <Plus size={16} />
              <span>+ Nouvel Article</span>
            </button>
          )}

          {/* Bouton demandes en attente (PDG/Admin) */}
          {canApprovePriceRequest && pendingRequests.length > 0 && (
            <button
              onClick={() => setShowRequestsModal(true)}
              className="btn btn-accent btn-sm"
              title="Valider ou rejeter les demandes de révision tarifaire"
            >
              <Clock size={15} />
              <span>Demandes de prix ({pendingRequests.length})</span>
            </button>
          )}

          {canApprovePriceRequest && pendingRequests.length === 0 && (
            <button
              onClick={() => setShowRequestsModal(true)}
              className="btn btn-secondary btn-sm"
            >
              <CheckCircle2 size={15} />
              <span>Historique demandes</span>
            </button>
          )}

          {/* Importer fichier tarifaire */}
          {canImportFile && (
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-secondary btn-sm"
              title="Importer un fichier Excel/CSV de tarifs"
            >
              <FileSpreadsheet size={16} />
              <span>Importer Fichier</span>
            </button>
          )}

          <button
            onClick={() => setShowHistoryModal(true)}
            className="btn btn-secondary btn-sm"
          >
            <History size={16} />
            <span>Historique Tarifs ({priceHistories.length})</span>
          </button>
        </div>
      </div>

      {/* Bannière d'information selon le rôle */}
      <div className={`alert-banner ${canSubmitPriceRequest ? 'warning' : canApprovePriceRequest ? 'info' : 'neutral'}`} style={{ marginBottom: '20px' }}>
        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          {canSubmitPriceRequest && (
            <>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>Votre rôle : Soumission de demande de révision tarifaire</div>
              <div>Vous pouvez soumettre une demande de changement de prix. Elle sera transmise au <strong>PDG</strong> pour validation avant d'être appliquée.</div>
            </>
          )}
          {canApprovePriceRequest && (
            <>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>Votre rôle : Validation des révisions tarifaires</div>
              <div>Vous approuvez ou refusez les demandes soumises par le Magasinier ou le Secrétaire. Seule votre validation rend le prix effectif.</div>
            </>
          )}
          {!canSubmitPriceRequest && !canApprovePriceRequest && (
            <>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>Consultation — Lecture seule</div>
              <div>Vous consultez la base des articles et les prix officiels. La modification de prix est réservée au Magasinier et au Secrétaire (avec validation PDG).</div>
            </>
          )}
        </div>
      </div>

      {/* Barre de filtre & Catégories */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`btn ${selectedCategory === 'Aluminium' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory('Aluminium')}
          >
            <Boxes size={16} />
            <span>Aluminium (Classé par Couleur)</span>
          </button>

          <button
            className={`btn ${selectedCategory === 'Accessoires' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory('Accessoires')}
          >
            <span>Accessoires &amp; Quincaillerie</span>
          </button>
        </div>

        <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Rechercher par article, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* SECTION ALUMINIUM */}
      {selectedCategory === 'Aluminium' && (
        <div>
          {distinctCatalogColors.map(color => {
            const swatch = getColorSwatch(color);
            const items = catalog.filter(i =>
              i.category === 'Aluminium' &&
              i.color === color &&
              (searchQuery === '' || i.designation.toLowerCase().includes(searchQuery.toLowerCase()) || i.code.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            if (items.length === 0) return null;

            return (
              <div key={color} style={{ marginBottom: '28px' }}>
                <div className="color-group-header">
                  <div className="color-swatch-badge">
                    <span className="color-dot" style={{ backgroundColor: swatch.bg, borderColor: swatch.border }} />
                    <span>COULEUR : {color.toUpperCase()}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                    {items.length} profilés enregistrés
                  </span>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '120px' }}>Code Article</th>
                        <th>Désignation Officielle</th>
                        <th>Unité</th>
                        <th style={{ textAlign: 'right' }}>Prix Officiel FCFA</th>
                        <th>Dernière Révision</th>
                        <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600, color: '#475569', fontSize: '0.8125rem' }} className="tabular-nums">
                            {item.code}
                          </td>
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.designation}</td>
                          <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{item.unit}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }} className="tabular-nums">
                            {formatFCFA(item.officialPrice)}
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{item.lastPriceUpdate}</td>
                          <td style={{ textAlign: 'center' }}>
                            {renderActionCell(item)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Profilés aluminium universels / sans déclinaison couleur obligatoire */}
          {(() => {
            const universalItems = catalog.filter(i =>
              i.category === 'Aluminium' &&
              !i.color &&
              (searchQuery === '' || i.designation.toLowerCase().includes(searchQuery.toLowerCase()) || i.code.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            if (universalItems.length === 0) return null;

            return (
              <div style={{ marginBottom: '28px' }}>
                <div className="color-group-header">
                  <div className="color-swatch-badge">
                    <span className="color-dot" style={{ backgroundColor: '#64748b', borderColor: '#475569' }} />
                    <span>ÉQUERRES, VOLETS ROULANTS, TUBES INOX & QUINCAILLERIE D'ALUMINIUM</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                    {universalItems.length} profilés enregistrés
                  </span>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '120px' }}>Code Article</th>
                        <th>Désignation Officielle</th>
                        <th>Unité</th>
                        <th style={{ textAlign: 'right' }}>Prix Officiel FCFA</th>
                        <th>Dernière Révision</th>
                        <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {universalItems.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600, color: '#475569', fontSize: '0.8125rem' }} className="tabular-nums">
                            {item.code}
                          </td>
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.designation}</td>
                          <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{item.unit}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }} className="tabular-nums">
                            {formatFCFA(item.officialPrice)}
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{item.lastPriceUpdate}</td>
                          <td style={{ textAlign: 'center' }}>
                            {renderActionCell(item)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* SECTION ACCESSOIRES */}
      {selectedCategory === 'Accessoires' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Code Article</th>
                <th>Désignation de l'Accessoire</th>
                <th>Conditionnement</th>
                <th style={{ textAlign: 'right' }}>Prix Officiel FCFA</th>
                <th>Dernière Révision</th>
                <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {catalog
                .filter(i => i.category === 'Accessoires' &&
                  (searchQuery === '' || i.designation.toLowerCase().includes(searchQuery.toLowerCase()) || i.code.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: '#475569', fontSize: '0.8125rem' }} className="tabular-nums">
                      {item.code}
                    </td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.designation}</td>
                    <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{item.unit}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }} className="tabular-nums">
                      {formatFCFA(item.officialPrice)}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{item.lastPriceUpdate}</td>
                    <td style={{ textAlign: 'center' }}>
                      {renderActionCell(item)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL : MODIFICATION D'ARTICLE (PRIX, COULEUR, DÉSIGNATION)
          (ACCESSIBLE AU MAGASINIER, PDG, ADMIN)
         ══════════════════════════════════════════════════ */}
      {editingItem && canManageCatalog && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <Edit3 size={18} color="#2563eb" />
                <span>Modifier l'Article — {editingItem.code}</span>
              </div>
              <button onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPriceChange}>
              <div className="modal-body">
                {feedbackMsg && (
                  <div className={`alert-banner ${feedbackMsg.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: '16px' }}>
                    <span>{feedbackMsg.text}</span>
                  </div>
                )}

                <div className="alert-banner info" style={{ marginBottom: '16px' }}>
                  <Clock size={16} style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '0.8125rem' }}>
                    ⚡ <strong>Gestion par le Magasinier :</strong> Vous avez les pleins droits pour actualiser la désignation, le prix officiel et la couleur. Toute modification sera enregistrée dans le journal d'activité.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Désignation de l'Article</span>
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                  />
                </div>

                {editingItem.category === 'Aluminium' && (
                  <div className="form-group">
                    <label className="form-label">
                      <span>Couleur Aluminium</span>
                      <span className="required">*</span>
                    </label>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
                      {!isEditCustomColor ? (
                        <select
                          className="form-select"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                        >
                          {defaultAluminiumColors.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          placeholder="Ex: Gris Anthracite RAL 7016, Chêne Doré..."
                          className="form-input"
                          value={editCustomColor}
                          onChange={(e) => setEditCustomColor(e.target.value)}
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsEditCustomColor(!isEditCustomColor);
                          if (!isEditCustomColor) setEditCustomColor('');
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <Palette size={14} />
                        <span>{isEditCustomColor ? 'Couleurs standards' : '+ Autre couleur'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Prix Actuel en Vigueur</label>
                    <div style={{ padding: '10px 14px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontWeight: 700, color: '#475569' }} className="tabular-nums">
                      {formatFCFA(editingItem.officialPrice)}
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      <span>Nouveau Prix Officiel (FCFA)</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      step="500"
                      min="100"
                      required
                      className="form-input tabular-nums"
                      value={newPriceInput}
                      onChange={(e) => setNewPriceInput(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Unité de Mesure</label>
                  <select
                    className="form-select"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                  >
                    <option value="Barre de 6m">Barre de 6m</option>
                    <option value="Pièce">Pièce</option>
                    <option value="Paquet">Paquet</option>
                    <option value="Mètre linéaire">Mètre linéaire</option>
                    <option value="Paire">Paire</option>
                    <option value="Boîte">Boîte</option>
                    <option value="Rouleau">Rouleau</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Motif / Justification du changement</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Révision tarifaire suite au nouveau barème fournisseur..."
                    className="form-textarea"
                    value={priceReason}
                    onChange={(e) => setPriceReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setEditingItem(null)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>
                  <Check size={16} />
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL : AJOUT D'UN NOUVEL ARTICLE AU CATALOGUE
          (ACCESSIBLE AU MAGASINIER, PDG, ADMIN)
         ══════════════════════════════════════════════════ */}
      {showCreateModal && canManageCatalog && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <Plus size={18} color="#2563eb" />
                <span>Ajouter un Nouvel Article au Catalogue</span>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNewArticle}>
              <div className="modal-body">
                {createFeedback && (
                  <div className={`alert-banner ${createFeedback.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: '16px' }}>
                    <span>{createFeedback.text}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Catégorie d'Article</label>
                    <select
                      className="form-select"
                      value={createCategory}
                      onChange={(e) => {
                        const cat = e.target.value as Category;
                        setCreateCategory(cat);
                        setCreateUnit(cat === 'Aluminium' ? 'Barre de 6m' : 'Pièce');
                      }}
                    >
                      <option value="Aluminium">Aluminium (Profilés)</option>
                      <option value="Accessoires">Accessoires &amp; Quincaillerie</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      <span>Code Article (Optionnel)</span>
                    </label>
                    <input
                      type="text"
                      placeholder={createCategory === 'Aluminium' ? 'Auto: ALT-ALU-xxx' : 'Auto: ALT-ACC-xxx'}
                      className="form-input"
                      value={createCode}
                      onChange={(e) => setCreateCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Désignation Officielle</span>
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: CORNIERE 25X25, COULISSE 2V, SERRURE A LARDER..."
                    className="form-input"
                    value={createDesignation}
                    onChange={(e) => setCreateDesignation(e.target.value)}
                  />
                </div>

                {createCategory === 'Aluminium' && (
                  <div className="form-group">
                    <label className="form-label">
                      <span>Couleur Aluminium</span>
                      <span className="required">*</span>
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
                      {!isCreateCustomColor ? (
                        <select
                          className="form-select"
                          value={createColor}
                          onChange={(e) => setCreateColor(e.target.value)}
                        >
                          {defaultAluminiumColors.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          placeholder="Saisissez la nouvelle couleur (ex: Bleu Nuit, Chêne Clair, RAL 7016...)"
                          className="form-input"
                          value={createCustomColor}
                          onChange={(e) => setCreateCustomColor(e.target.value)}
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateCustomColor(!isCreateCustomColor);
                          if (!isCreateCustomColor) setCreateCustomColor('');
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <Palette size={14} />
                        <span>{isCreateCustomColor ? 'Couleurs standards' : '+ Autre couleur'}</span>
                      </button>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      Vous pouvez choisir une couleur existante ou taper directement n'importe quelle nouvelle couleur.
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      <span>Prix Officiel (FCFA)</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      step="500"
                      min="100"
                      required
                      placeholder="Ex: 35000"
                      className="form-input tabular-nums"
                      value={createPrice || ''}
                      onChange={(e) => setCreatePrice(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Unité de Conditionnement</label>
                    <select
                      className="form-select"
                      value={createUnit}
                      onChange={(e) => setCreateUnit(e.target.value)}
                    >
                      <option value="Barre de 6m">Barre de 6m</option>
                      <option value="Pièce">Pièce</option>
                      <option value="Paquet">Paquet</option>
                      <option value="Mètre linéaire">Mètre linéaire</option>
                      <option value="Paire">Paire</option>
                      <option value="Boîte">Boîte</option>
                      <option value="Rouleau">Rouleau</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}>
                  <Plus size={16} />
                  <span>Ajouter au Catalogue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL : VALIDATION DES DEMANDES (PDG / ADMIN)
         ══════════════════════════════════════════════════ */}
      {showRequestsModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span>Demandes de Révision Tarifaire — Validation PDG</span>
                {pendingRequests.length > 0 && (
                  <span style={{ backgroundColor: '#d97706', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {pendingRequests.length} en attente
                  </span>
                )}
              </div>
              <button onClick={() => setShowRequestsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: 0 }}>
              {priceRequests.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <CheckCircle2 size={36} color="#a7f3d0" style={{ margin: '0 auto 12px' }} />
                  <p>Aucune demande de révision tarifaire en cours.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th style={{ textAlign: 'right' }}>Prix actuel</th>
                      <th style={{ textAlign: 'right' }}>Prix demandé</th>
                      <th>Soumis par</th>
                      <th>Date</th>
                      <th>Justification</th>
                      <th>Statut</th>
                      {canApprovePriceRequest && <th style={{ textAlign: 'center' }}>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {priceRequests.map(req => {
                      const badge = getRequestBadge(req.status);
                      return (
                        <tr key={req.id}>
                          <td style={{ fontWeight: 600 }}>{req.productName}</td>
                          <td style={{ textAlign: 'right', color: '#64748b' }} className="tabular-nums">
                            {formatFCFA(req.oldPrice)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }} className="tabular-nums">
                            {formatFCFA(req.newPrice)}
                          </td>
                          <td style={{ fontSize: '0.8125rem' }}>
                            <div style={{ fontWeight: 600 }}>{req.submittedBy}</div>
                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{req.submittedByRole.replace(/_/g, ' ')}</div>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.submittedAt}</td>
                          <td style={{ fontSize: '0.8125rem', color: '#334155', maxWidth: '200px' }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.reason}>
                              {req.reason}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: badge.bg, color: badge.color, padding: '2px 8px', borderRadius: '10px' }}>
                              {badge.label}
                            </span>
                          </td>
                          {canApprovePriceRequest && (
                            <td style={{ textAlign: 'center' }}>
                              {req.status === 'EN_ATTENTE' ? (
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => handleApproveRequest(req)}
                                    className="btn btn-sm"
                                    style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '3px 8px' }}
                                    title="Approuver et appliquer ce tarif"
                                  >
                                    <Check size={13} />
                                    <span>Valider</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectRequest(req)}
                                    className="btn btn-sm"
                                    style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '3px 8px' }}
                                    title="Refuser cette demande"
                                  >
                                    <X size={13} />
                                    <span>Refuser</span>
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowRequestsModal(false)} className="btn btn-secondary">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL : HISTORIQUE DES TARIFS
         ══════════════════════════════════════════════════ */}
      {showHistoryModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <History size={18} color="#0f172a" />
                <span>Registre Historique des Évolutions Tarifaires ALUTRACO</span>
              </div>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date &amp; Heure</th>
                    <th>Article</th>
                    <th style={{ textAlign: 'right' }}>Ancien Tarif</th>
                    <th style={{ textAlign: 'right' }}>Nouveau Tarif</th>
                    <th>Auteur</th>
                    <th>Motif</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistories.map(h => (
                    <tr key={h.id}>
                      <td style={{ fontSize: '0.75rem', color: '#64748b' }} className="tabular-nums">{h.changedAt}</td>
                      <td style={{ fontWeight: 600 }}>{h.productName}</td>
                      <td style={{ textAlign: 'right', color: '#64748b' }} className="tabular-nums">{formatFCFA(h.oldPrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }} className="tabular-nums">{formatFCFA(h.newPrice)}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{h.changedByName}</td>
                      <td style={{ fontSize: '0.8125rem', color: '#334155' }}>{h.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowHistoryModal(false)} className="btn btn-secondary">
                Fermer le Registre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL : IMPORTATION FICHIER TARIFAIRE
         ══════════════════════════════════════════════════ */}
      {showImportModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <FileSpreadsheet size={18} color="#2563eb" />
                <span>Importation Grille Tarifaire Officielle</span>
              </div>
              <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleExecuteImport}>
              <div className="modal-body">
                {importFeedback && (
                  <div className="alert-banner success" style={{ marginBottom: '16px' }}>
                    <Check size={16} />
                    <span>{importFeedback}</span>
                  </div>
                )}

                <div className="alert-banner info" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.8125rem' }}>
                    <strong>Workflow :</strong> L'importation de tarifs doit être soumise et approuvée par le <strong>PDG</strong> avant d'être appliquée aux inventaires futurs.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Sélectionner le fichier de prix (.xlsx, .csv)</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="form-input"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImportFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Fichier : <strong>{importFileName || 'Grille_Officielle_Prix_ALUTRACO_2026.xlsx'}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Motif officiel de révision *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={importNotes}
                    onChange={(e) => setImportNotes(e.target.value)}
                    placeholder="Ex: Révision tarifaire trimestrielle validée par la Direction"
                  />
                </div>

                <div>
                  <label className="form-label">Aperçu ({importRows.length} articles)</label>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', maxHeight: '180px', overflowY: 'auto' }}>
                    <table className="data-table" style={{ margin: 0, fontSize: '0.8125rem' }}>
                      <thead style={{ backgroundColor: '#f8fafc' }}>
                        <tr>
                          <th>Code Article</th>
                          <th>Désignation</th>
                          <th style={{ textAlign: 'right' }}>Nouveau Tarif FCFA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importRows.map((r, idx) => (
                          <tr key={idx}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.code}</td>
                            <td>{r.designation}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                              {formatFCFA(r.newPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowImportModal(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-accent">
                  <Send size={16} />
                  <span>Soumettre pour validation PDG</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
