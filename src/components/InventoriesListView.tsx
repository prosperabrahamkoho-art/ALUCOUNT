import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Store, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Lock,
  ScanLine
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../services/store';
import { Inventory, InventoryStatus, Category } from '../types';

interface InventoriesListViewProps {
  onOpenCounting?: (inv: Inventory) => void;
  onOpenControl?: (inv: Inventory) => void;
  onOpenReport?: (inv: Inventory) => void;
  onCreateNew?: () => void;
}

export const InventoriesListView: React.FC<InventoriesListViewProps> = ({
  onOpenCounting = () => {},
  onOpenControl = () => {},
  onOpenReport = () => {},
  onCreateNew = () => {}
}) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const inventories = store.getInventories();
  const shops = store.getShops();

  const [statusFilter, setStatusFilter] = useState<string>('TOUS');
  const [shopFilter, setShopFilter] = useState<string>('TOUS');
  const [categoryFilter, setCategoryFilter] = useState<string>('TOUS');
  const [searchQuery, setSearchQuery] = useState('');

  const canCreate = ['PDG', 'MAGASINIER', 'RESPONSABLE_INVENTAIRE'].includes(currentUser.role);

  const getStatusBadgeClass = (status: InventoryStatus) => {
    switch (status) {
      case 'Validé et clôturé': return 'status-pill success';
      case 'Prêt pour validation': return 'status-pill info';
      case 'En contrôle': return 'status-pill warning';
      case 'Comptage terminé': return 'status-pill warning';
      case 'En cours de comptage': return 'status-pill info';
      default: return 'status-pill neutral';
    }
  };

  const filteredInventories = inventories.filter(inv => {
    const matchStatus = statusFilter === 'TOUS' || inv.status === statusFilter;
    const matchShop = shopFilter === 'TOUS' || inv.shopId === shopFilter;
    const matchCat = categoryFilter === 'TOUS' || inv.category === categoryFilter;
    const matchQuery = searchQuery === '' || 
      inv.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      inv.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.campaignName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchShop && matchCat && matchQuery;
  });

  return (
    <div>
      {/* En-tête */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Gestion & Cycle de Vie des Inventaires
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Suivi des 6 états du cycle de vie, du comptage physique terrain à la clôture scellée.
          </p>
        </div>

        {canCreate && (
          <button onClick={onCreateNew} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Initier un Nouvel Inventaire</span>
          </button>
        )}
      </div>

      {/* Règle de séparation des données pour responsable boutique */}
      {currentUser.role === 'RESPONSABLE_BOUTIQUE' && (
        <div className="alert-banner info" style={{ marginBottom: '20px' }}>
          <Store size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Périmètre sécurisé Boutique :</strong> Conformément à l'Article 3.7 du cahier des charges, vous avez accès 
            exclusivement aux inventaires de votre boutique <strong>une fois entièrement validés et clôturés</strong> par les responsables désignés.
          </div>
        </div>
      )}

      {/* Barre de filtres */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Statut d'Inventaire</label>
              <select 
                className="form-select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="Brouillon">Brouillon</option>
                <option value="En cours de comptage">En cours de comptage</option>
                <option value="Comptage terminé">Comptage terminé</option>
                <option value="En contrôle">En contrôle</option>
                <option value="Prêt pour validation">Prêt pour validation</option>
                <option value="Validé et clôturé">Validé et clôturé</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Boutique</label>
              <select 
                className="form-select" 
                value={shopFilter} 
                onChange={(e) => setShopFilter(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              >
                <option value="TOUS">Toutes les boutiques</option>
                {shops.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Catégorie</label>
              <select 
                className="form-select" 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              >
                <option value="TOUS">Toutes catégories</option>
                <option value="Aluminium">Aluminium</option>
                <option value="Accessoires">Accessoires</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Recherche</label>
              <input
                type="text"
                placeholder="Code, campagne..."
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLEAU DES INVENTAIRES */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code / Réf</th>
              <th>Boutique Concernée</th>
              <th>Catégorie</th>
              <th>Statut & Version</th>
              <th>Personnel Affecté</th>
              <th style={{ textAlign: 'right' }}>Montant Total</th>
              <th style={{ textAlign: 'center', width: '130px' }}>Actions Métier</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventories.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Aucun inventaire correspondant aux filtres sélectionnés.
                </td>
              </tr>
            ) : (
              filteredInventories.map(inv => {
                const totalAmount = inv.lines.reduce((s, l) => s + l.totalAmount, 0);
                const damagedCount = inv.lines.reduce((s, l) => s + l.qtyDamaged, 0);

                return (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{inv.code}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inv.campaignName}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{inv.shopName}</div>
                    </td>

                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        backgroundColor: inv.category === 'Aluminium' ? '#f1f5f9' : '#fffbeb',
                        color: inv.category === 'Aluminium' ? '#0f172a' : '#b45309',
                        fontWeight: 600,
                        border: '1px solid #e2e8f0'
                      }}>
                        {inv.category}
                      </span>
                    </td>

                    <td>
                      <div style={{ marginBottom: '2px' }}>
                        <span className={getStatusBadgeClass(inv.status)}>
                          {inv.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        Version {inv.version}.0
                      </div>
                    </td>

                    <td style={{ fontSize: '0.8125rem' }}>
                      <div style={{ color: '#0f172a' }}>
                        Inv : {inv.assignedCounterName || '—'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Ctrl : {inv.assignedControllerName || '—'}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }} className="tabular-nums">
                        {formatFCFA(totalAmount)}
                      </div>
                      {damagedCount > 0 && (
                        <div style={{ fontSize: '0.6875rem', color: '#b91c1c' }}>
                          {damagedCount} unités gâtées
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {inv.status === 'Validé et clôturé' ? (
                          <button
                            onClick={() => onOpenReport(inv)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            title="Consulter le rapport officiel scellé"
                          >
                            <Eye size={13} />
                            <span>Rapport</span>
                          </button>
                        ) : (
                          <>
                            {(inv.status === 'En cours de comptage' || inv.status === 'Brouillon') && (
                              <button
                                onClick={() => onOpenCounting(inv)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                title="Accéder au module de comptage terrain"
                              >
                                <ScanLine size={13} />
                                <span>Compter</span>
                              </button>
                            )}

                            {(inv.status === 'Comptage terminé' || inv.status === 'En contrôle' || inv.status === 'Prêt pour validation') && (
                              <button
                                onClick={() => onOpenControl(inv)}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                title="Vérifier et contrôler le dossier"
                              >
                                <CheckCircle2 size={13} />
                                <span>Contrôle</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
