import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  CheckCircle, 
  ShieldAlert, 
  Store, 
  FileEdit, 
  RotateCcw, 
  History 
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../../services/store';
import { Inventory, InventoryLine } from '../../types';

export const DiscrepanciesModule: React.FC = () => {
  const store = useALUStore();
  const inventories = store.getInventories();
  const shops = store.getShops();

  const [selectedShopId, setSelectedShopId] = useState('TOUS');
  const [filterOnlyDamaged, setFilterOnlyDamaged] = useState(true);

  // Collecter toutes les lignes signalant des anomalies ou des articles gâtés
  const allDiscrepancyLines: { line: InventoryLine; inventory: Inventory }[] = [];

  inventories.forEach(inv => {
    if (selectedShopId === 'TOUS' || inv.shopId === selectedShopId) {
      inv.lines.forEach(line => {
        if (filterOnlyDamaged) {
          if (line.qtyDamaged > 0 || line.wasCorrected || line.observation) {
            allDiscrepancyLines.push({ line, inventory: inv });
          }
        } else {
          allDiscrepancyLines.push({ line, inventory: inv });
        }
      });
    }
  });

  const totalDamagedAmount = allDiscrepancyLines.reduce((s, item) => s + item.line.amountDamaged, 0);
  const totalDamagedUnits = allDiscrepancyLines.reduce((s, item) => s + item.line.qtyDamaged, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#dc2626', fontSize: '1rem' }}>MODULE 10</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              Gestion des Écarts, Anomalies & Freinte Matière
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Identification des dégradations, déformations, erreurs de comptage et traçabilité indélébile des motifs.
          </p>
        </div>
      </div>

      {/* Règle de conservation de l'historique des corrections */}
      <div className="alert-banner warning" style={{ marginBottom: '20px' }}>
        <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Règle d'Intégrité de Réconciliation (Article 10) :</strong> Chaque correction de comptage ou réévaluation d'un article 
          abîmé conserve l'ancienne valeur, la nouvelle valeur, le motif circonstancié et l'identité de l'agent habilité.
        </div>
      </div>

      {/* Synthèse globale des anomalies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Unités Dégradées Déclarées
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }} className="tabular-nums">
            {totalDamagedUnits} unités
          </div>
          <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>
            Sur {allDiscrepancyLines.length} références concernées
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Valorisation de la Freinte / Perte
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }} className="tabular-nums">
            {formatFCFA(totalDamagedAmount)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Au tarif officiel ALUTRACO
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Filtre Périmètre Boutique
          </div>
          <select 
            className="form-select"
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            style={{ marginTop: '4px', fontSize: '0.8125rem' }}
          >
            <option value="TOUS">Toutes les boutiques et chantiers</option>
            {shops.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLEAU DES LIGNES AVEC ANOMALIES & DÉGRADATIONS */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Article / Profilé</th>
              <th>Boutique & Dossier</th>
              <th style={{ textAlign: 'center' }}>Bon État</th>
              <th style={{ textAlign: 'center' }}>Quantité Gâtée</th>
              <th>Motif de Dégradation</th>
              <th>Observations & Traces</th>
              <th style={{ textAlign: 'right' }}>Montant Dégradation</th>
              <th>Statut Dossier</th>
            </tr>
          </thead>
          <tbody>
            {allDiscrepancyLines.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Aucune anomalie ou article endommagé détecté pour les filtres sélectionnés.
                </td>
              </tr>
            ) : (
              allDiscrepancyLines.map(({ line, inventory }) => (
                <tr key={line.id} style={{ backgroundColor: line.qtyDamaged > 0 ? '#fffcfc' : undefined }}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{line.designation}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{line.color || line.category} • {line.unit}</div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{inventory.shopName}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{inventory.code}</div>
                  </td>

                  <td style={{ textAlign: 'center', fontWeight: 600, color: '#059669' }} className="tabular-nums">
                    {line.qtyGood}
                  </td>

                  <td style={{ textAlign: 'center', fontWeight: 800, color: line.qtyDamaged > 0 ? '#dc2626' : '#94a3b8' }} className="tabular-nums">
                    {line.qtyDamaged}
                  </td>

                  <td>
                    {line.qtyDamaged > 0 ? (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: '#fef2f2',
                        color: '#991b1b',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #fecaca',
                        display: 'inline-block'
                      }}>
                        {line.damageReason || 'Dégradation non spécifiée'}
                      </span>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>—</span>
                    )}
                  </td>

                  <td style={{ fontSize: '0.8125rem', color: '#475569', maxWidth: '240px' }}>
                    {line.observation || '—'}
                    {line.wasCorrected && (
                      <div style={{ fontSize: '0.6875rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                        Ligne rectifiée en phase de contrôle
                      </div>
                    )}
                  </td>

                  <td style={{ textAlign: 'right', fontWeight: 700, color: line.amountDamaged > 0 ? '#dc2626' : '#64748b' }} className="tabular-nums">
                    {formatFCFA(line.amountDamaged)}
                  </td>

                  <td>
                    <span className={`status-pill ${
                      inventory.status === 'Validé et clôturé' ? 'success' : 'warning'
                    }`}>
                      {inventory.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
