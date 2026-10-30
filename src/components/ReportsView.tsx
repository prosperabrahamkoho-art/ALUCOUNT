import React, { useState } from 'react';
import { 
  FileText, 
  Eye, 
  Download, 
  GitCompare, 
  ShieldCheck, 
  Search, 
  Store, 
  Calendar 
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../services/store';
import { Inventory } from '../types';

interface ReportsViewProps {
  onViewReport?: (inv: Inventory) => void;
  onOpenComparison?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onViewReport = () => {}, onOpenComparison = () => {} }) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const inventories = store.getInventories();
  const shops = store.getShops();

  // Seuls les inventaires validés et clôturés disposent d'un rapport officiel
  const validatedInventories = inventories.filter(i => i.status === 'Validé et clôturé');

  const [shopFilter, setShopFilter] = useState('TOUS');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = validatedInventories.filter(inv => {
    const matchShop = shopFilter === 'TOUS' || inv.shopId === shopFilter;
    const matchQuery = searchQuery === '' ||
      inv.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.shopName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchShop && matchQuery;
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
            Rapports Officiels & Synthèses d'Inventaire Clôturés (Article 14)
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Procès-verbaux définitifs sous scellé numérique, ventilation par couleur et analyse comparative.
          </p>
        </div>

        <button onClick={onOpenComparison} className="btn btn-primary btn-sm">
          <GitCompare size={15} />
          <span>Comparer 2 Inventaires de Boutique</span>
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
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
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Recherche Rapport</label>
              <input
                type="text"
                placeholder="Réf inventaire, boutique..."
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLEAU DES RAPPORTS DISPONIBLES */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Réf Rapport Officiel</th>
              <th>Boutique</th>
              <th>Périmètre</th>
              <th>Date de Scellement</th>
              <th>Validateur Habilité</th>
              <th style={{ textAlign: 'right' }}>Montant Total Certifié</th>
              <th style={{ textAlign: 'center', width: '130px' }}>Consulter</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Aucun rapport clôturé disponible pour ces critères.
                </td>
              </tr>
            ) : (
              filtered.map(inv => {
                const totalAmount = inv.lines.reduce((s, l) => s + l.totalAmount, 0);
                const damagedUnits = inv.lines.reduce((s, l) => s + l.qtyDamaged, 0);

                return (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} color="#059669" />
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{inv.code}</span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        Version Finale {inv.version}.0
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{inv.shopName}</div>
                    </td>

                    <td>
                      <span className="status-pill neutral">{inv.category}</span>
                    </td>

                    <td style={{ fontSize: '0.8125rem', color: '#475569' }}>
                      {inv.closedAt ? inv.closedAt.substring(0, 16).replace('T', ' ') : '—'}
                    </td>

                    <td style={{ fontSize: '0.8125rem' }}>
                      <div style={{ fontWeight: 600, color: '#059669' }}>
                        {inv.validatedByName || 'Jean-Baptiste Koffi'}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        Habilité Direction PDG
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }} className="tabular-nums">
                        {formatFCFA(totalAmount)}
                      </div>
                      {damagedUnits > 0 && (
                        <div style={{ fontSize: '0.6875rem', color: '#dc2626' }}>
                          dont {damagedUnits} gâtés
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => onViewReport(inv)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} />
                        <span>Ouvrir PV</span>
                      </button>
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
