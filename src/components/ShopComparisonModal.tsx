import React, { useState } from 'react';
import { 
  GitCompare, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Store, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../services/store';

interface ShopComparisonProps {
  onClose: () => void;
}

export const ShopComparisonModal: React.FC<ShopComparisonProps> = ({ onClose }) => {
  const store = useALUStore();
  const shops = store.getShops();
  const inventories = store.getInventories();

  const [selectedShopId, setSelectedShopId] = useState<string>(shops[0]?.id || '');

  // Trouver les inventaires pour cette boutique
  const shopInventories = inventories.filter(i => i.shopId === selectedShopId);

  const [inv1Id, setInv1Id] = useState<string>(shopInventories[0]?.id || '');
  const [inv2Id, setInv2Id] = useState<string>(shopInventories[1]?.id || shopInventories[0]?.id || '');

  const inv1 = inventories.find(i => i.id === inv1Id);
  const inv2 = inventories.find(i => i.id === inv2Id);

  // Établir la comparaison produit par produit
  const comparisonRows: {
    designation: string;
    category: string;
    color?: string;
    price: number;
    qty1Good: number;
    qty2Good: number;
    deltaGood: number;
    qty1Damaged: number;
    qty2Damaged: number;
    deltaDamaged: number;
    val1: number;
    val2: number;
    deltaVal: number;
  }[] = [];

  if (inv1 && inv2) {
    const allProductIds = Array.from(new Set([
      ...inv1.lines.map(l => l.productId),
      ...inv2.lines.map(l => l.productId)
    ]));

    allProductIds.forEach(pId => {
      const line1 = inv1.lines.find(l => l.productId === pId);
      const line2 = inv2.lines.find(l => l.productId === pId);

      const designation = line1?.designation || line2?.designation || 'Article';
      const category = line1?.category || line2?.category || 'Aluminium';
      const color = line1?.color || line2?.color;
      const price = line2?.officialPriceSnapshot || line1?.officialPriceSnapshot || 0;

      const qty1Good = line1?.qtyGood || 0;
      const qty2Good = line2?.qtyGood || 0;
      const deltaGood = qty2Good - qty1Good;

      const qty1Damaged = line1?.qtyDamaged || 0;
      const qty2Damaged = line2?.qtyDamaged || 0;
      const deltaDamaged = qty2Damaged - qty1Damaged;

      const val1 = line1?.totalAmount || 0;
      const val2 = line2?.totalAmount || 0;
      const deltaVal = val2 - val1;

      comparisonRows.push({
        designation,
        category,
        color,
        price,
        qty1Good,
        qty2Good,
        deltaGood,
        qty1Damaged,
        qty2Damaged,
        deltaDamaged,
        val1,
        val2,
        deltaVal
      });
    });
  }

  const totalDeltaVal = comparisonRows.reduce((s, r) => s + r.deltaVal, 0);

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '980px', maxHeight: '92vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
            <GitCompare size={18} color="#2563eb" />
            <span>Rapprochement & Comparaison Entre Deux Inventaires (Article 14.3)</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Sélection de la boutique et des deux inventaires */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label className="form-label">Boutique Analysée</label>
              <select
                className="form-select"
                value={selectedShopId}
                onChange={(e) => {
                  setSelectedShopId(e.target.value);
                  const matching = inventories.filter(i => i.shopId === e.target.value);
                  setInv1Id(matching[0]?.id || '');
                  setInv2Id(matching[1]?.id || matching[0]?.id || '');
                }}
              >
                {shops.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Inventaire Antérieur (Référence)</label>
              <select
                className="form-select"
                value={inv1Id}
                onChange={(e) => setInv1Id(e.target.value)}
              >
                {shopInventories.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.code} ({inv.status})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Inventaire Récent (Contemporain)</label>
              <select
                className="form-select"
                value={inv2Id}
                onChange={(e) => setInv2Id(e.target.value)}
              >
                {shopInventories.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.code} ({inv.status})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Synthèse du différentiel */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            backgroundColor: '#f8fafc', 
            padding: '14px 18px', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0', 
            marginBottom: '20px' 
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Variation Globale Nette du Stock
              </div>
              <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: 800, 
                color: totalDeltaVal >= 0 ? '#059669' : '#dc2626' 
              }} className="tabular-nums">
                {totalDeltaVal >= 0 ? '+' : ''}{formatFCFA(totalDeltaVal)}
              </div>
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
              Rapprochement automatisé sur <strong>{comparisonRows.length}</strong> références croisées.
            </div>
          </div>

          {/* TABLEAU COMPARATIF */}
          <div className="table-container">
            <table className="data-table" style={{ fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Article / Profilé</th>
                  <th>Couleur</th>
                  <th style={{ textAlign: 'center' }}>Qté Réf</th>
                  <th style={{ textAlign: 'center' }}>Qté Actuelle</th>
                  <th style={{ textAlign: 'center' }}>Écart Bon État</th>
                  <th style={{ textAlign: 'center' }}>Écart Gâté</th>
                  <th style={{ textAlign: 'right' }}>Variation Valeur FCFA</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((r, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.designation}</div>
                    </td>
                    <td>{r.color || '—'}</td>
                    <td style={{ textAlign: 'center' }} className="tabular-nums">{r.qty1Good}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }} className="tabular-nums">{r.qty2Good}</td>
                    <td style={{ textAlign: 'center' }} className="tabular-nums">
                      <span style={{ 
                        fontWeight: 700, 
                        color: r.deltaGood > 0 ? '#059669' : r.deltaGood < 0 ? '#dc2626' : '#64748b' 
                      }}>
                        {r.deltaGood > 0 ? `+${r.deltaGood}` : r.deltaGood}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }} className="tabular-nums">
                      <span style={{ 
                        fontWeight: 700, 
                        color: r.deltaDamaged > 0 ? '#dc2626' : r.deltaDamaged < 0 ? '#059669' : '#64748b' 
                      }}>
                        {r.deltaDamaged > 0 ? `+${r.deltaDamaged} (Aggravation)` : r.deltaDamaged === 0 ? '0' : `${r.deltaDamaged} (Résolu)`}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }} className="tabular-nums">
                      <span style={{ color: r.deltaVal >= 0 ? '#059669' : '#dc2626' }}>
                        {r.deltaVal >= 0 ? `+${formatFCFA(r.deltaVal)}` : `-${formatFCFA(Math.abs(r.deltaVal))}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Fermer</button>
        </div>
      </div>
    </div>
  );
};
