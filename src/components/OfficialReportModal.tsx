import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  CheckCircle, 
  Building2, 
  UserCheck 
} from 'lucide-react';
import { Inventory } from '../types';
import { formatFCFA } from '../services/store';

interface OfficialReportModalProps {
  inventory: Inventory;
  onClose: () => void;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({ inventory, onClose }) => {
  const totalGoodAmount = inventory.lines.reduce((s, l) => s + l.amountGood, 0);
  const totalDamagedAmount = inventory.lines.reduce((s, l) => s + l.amountDamaged, 0);
  const totalGeneral = totalGoodAmount + totalDamagedAmount;
  const totalGoodUnits = inventory.lines.reduce((s, l) => s + l.qtyGood, 0);
  const totalDamagedUnits = inventory.lines.reduce((s, l) => s + l.qtyDamaged, 0);

  const damagedLines = inventory.lines.filter(l => l.qtyDamaged > 0);

  // Regroupement des montants par couleur pour l'aluminium
  const colorBreakdown: { [color: string]: { goodUnits: number; damagedUnits: number; totalAmount: number } } = {};
  if (inventory.category === 'Aluminium') {
    inventory.lines.forEach(line => {
      const col = line.color || 'Standard';
      if (!colorBreakdown[col]) {
        colorBreakdown[col] = { goodUnits: 0, damagedUnits: 0, totalAmount: 0 };
      }
      colorBreakdown[col].goodUnits += line.qtyGood;
      colorBreakdown[col].damagedUnits += line.qtyDamaged;
      colorBreakdown[col].totalAmount += line.totalAmount;
    });
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Code Article',
      'Désignation',
      'Catégorie',
      'Couleur',
      'Unité',
      'Prix Unitaire FCFA',
      'Quantité Bon État',
      'Quantité Gâtée',
      'Motif Dégradation',
      'Valeur Bon État FCFA',
      'Valeur Gâtée FCFA',
      'Montant Total Ligne FCFA',
      'Observation'
    ];

    const rows = inventory.lines.map(line => [
      `"${line.productId}"`,
      `"${line.designation.replace(/"/g, '""')}"`,
      `"${line.category}"`,
      `"${line.color || ''}"`,
      `"${line.unit}"`,
      line.officialPriceSnapshot,
      line.qtyGood,
      line.qtyDamaged,
      `"${(line.damageReason || '').replace(/"/g, '""')}"`,
      line.amountGood,
      line.amountDamaged,
      line.totalAmount,
      `"${(line.observation || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RAPPORT_ALUCOUNT_${inventory.code}_V${inventory.version}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '960px', maxHeight: '95vh' }}>
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
            <FileText size={18} color="#059669" />
            <span>Procès-Verbal Officiel d'Inventaire — ALUTRACO</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={handleExportCSV} className="btn btn-secondary btn-sm">
              <Download size={14} />
              <span>Exporter Excel / CSV</span>
            </button>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={14} />
              <span>Imprimer / PDF</span>
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* DOCUMENT OFFICIEL DESTINÉ À L'IMPRESSION & L'ARCHIVAGE */}
        <div className="modal-body printable-report" style={{ backgroundColor: '#ffffff', padding: '36px' }}>
          {/* En-tête officiel entreprise */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            borderBottom: '2px solid #0f172a',
            paddingBottom: '20px',
            marginBottom: '24px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.625rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>
                  ALUTRACO
                </span>
                <span style={{ 
                  fontSize: '0.6875rem', 
                  backgroundColor: '#0f172a', 
                  color: '#ffffff', 
                  padding: '2px 8px', 
                  borderRadius: '3px',
                  fontWeight: 700 
                }}>
                  ALUCOUNT
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>
                Compagnie Béninoise de Transformation et Négoce d'Aluminium
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Siège social : Avenue Steinmetz, Cotonou, Bénin • Tél : +229 21 31 40 50
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '4px 10px', 
                backgroundColor: '#ecfdf5', 
                border: '1px solid #a7f3d0', 
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#065f46',
                marginBottom: '6px'
              }}>
                <ShieldCheck size={14} />
                <span>RAPPORT VALIDÉ & SCELLÉ</span>
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                Réf : {inventory.code}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Version Officielle {inventory.version}.0
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Date de clôture : {inventory.closedAt ? inventory.closedAt.substring(0, 10) : new Date().toISOString().substring(0, 10)}
              </div>
            </div>
          </div>

          {/* Métadonnées de l'inventaire */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            backgroundColor: '#f8fafc', 
            padding: '16px', 
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
            fontSize: '0.8125rem'
          }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>Boutique & Dépôt</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{inventory.shopName}</div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>Périmètre & Campagne</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{inventory.category} — {inventory.campaignName}</div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>Inventoriste Responsable</div>
              <div style={{ fontWeight: 600, color: '#334155' }}>{inventory.assignedCounterName || 'Éric Houndété'}</div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>Validateur Habilité (PDG)</div>
              <div style={{ fontWeight: 600, color: '#059669' }}>{inventory.validatedByName || 'Jean-Baptiste Koffi'}</div>
            </div>
          </div>

          {/* TABLEAU OFFICIEL DE SYNTHÈSE DE L'INVENTAIRE (CONFORME STRICTEMENT À LA CAPTURE 2) */}
          {inventory.treatment && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ border: '2px solid #000', marginBottom: '16px' }}>
                <div style={{ 
                  backgroundColor: '#ffffff', 
                  padding: '14px 10px', 
                  textAlign: 'center', 
                  borderBottom: '2px solid #000',
                  fontWeight: 900,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  color: '#000000',
                  letterSpacing: '0.02em'
                }}>
                  RAPPORT D'INVENTAIRE DU STOCK ALU DE {inventory.shopName.toUpperCase()} DU {inventory.treatment.periodStart.replace(/\//g, '-')} AU {inventory.treatment.periodEnd.replace(/\//g, '-')}
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', color: '#000' }}>
                  <tbody>
                    {/* LIGNE 1 : STOCK INITIAL (JAUNE) */}
                    <tr style={{ borderBottom: '2px solid #000' }}>
                      <td style={{ 
                        width: '50%', 
                        padding: '12px 16px', 
                        fontWeight: 900, 
                        fontSize: '1rem', 
                        textTransform: 'uppercase', 
                        borderRight: '2px solid #000',
                        backgroundColor: '#fef08a' 
                      }}>
                        STOCK DU {inventory.treatment.initialStockDate.replace(/\//g, '-')}
                      </td>
                      <td style={{ 
                        width: '50%', 
                        padding: '12px 16px', 
                        fontWeight: 900, 
                        fontSize: '1.25rem', 
                        fontFamily: 'monospace',
                        backgroundColor: '#fef08a' 
                      }}>
                        {new Intl.NumberFormat('fr-FR').format(inventory.treatment.initialStockValue)}
                      </td>
                    </tr>

                    {/* LIGNE 2 : SOLDE */}
                    <tr style={{ borderBottom: '2px solid #000' }}>
                      <td style={{ 
                        width: '50%', 
                        padding: '12px 16px', 
                        fontWeight: 900, 
                        fontSize: '1rem', 
                        textTransform: 'uppercase', 
                        borderRight: '2px solid #000',
                        backgroundColor: '#ffffff' 
                      }}>
                        SOLDE AU {inventory.treatment.balanceDate.toUpperCase()}
                      </td>
                      <td style={{ 
                        width: '50%', 
                        padding: '12px 16px', 
                        fontWeight: 900, 
                        fontSize: '1.25rem', 
                        fontFamily: 'monospace',
                        backgroundColor: '#ffffff' 
                      }}>
                        {new Intl.NumberFormat('fr-FR').format(inventory.treatment.shopBalance)}
                      </td>
                    </tr>

                    {/* LIGNE 3 : STOCK COMPTÉ LE ... */}
                    <tr style={{ borderBottom: '2px solid #000' }}>
                      <td style={{ 
                        width: '50%', 
                        padding: '12px 16px', 
                        fontWeight: 900, 
                        fontSize: '1rem', 
                        textTransform: 'uppercase', 
                        borderRight: '2px solid #000',
                        backgroundColor: '#ffffff' 
                      }}>
                        STOCK COMPTÉ LE {inventory.treatment.periodEnd.toUpperCase()}
                      </td>
                      <td style={{ 
                        width: '50%', 
                        padding: '12px 16px', 
                        fontWeight: 900, 
                        fontSize: '1.25rem', 
                        fontFamily: 'monospace',
                        backgroundColor: '#ffffff' 
                      }}>
                        {new Intl.NumberFormat('fr-FR').format(inventory.treatment.countedStockValue)}
                      </td>
                    </tr>

                    {/* LIGNE 4 : STOCK TOTAL */}
                    <tr style={{ borderBottom: '2px solid #000' }}>
                      <td style={{ 
                        width: '50%', 
                        padding: '12px 16px', 
                        fontWeight: 900, 
                        fontSize: '1rem', 
                        textTransform: 'uppercase', 
                        borderRight: '2px solid #000',
                        backgroundColor: '#ffffff' 
                      }}>
                        STOCK TOTAL
                      </td>
                      <td style={{ 
                        width: '50%', 
                        padding: '12px 16px', 
                        fontWeight: 900, 
                        fontSize: '1.25rem', 
                        fontFamily: 'monospace',
                        backgroundColor: '#ffffff' 
                      }}>
                        {new Intl.NumberFormat('fr-FR').format(inventory.treatment.totalCalculatedStock)}
                      </td>
                    </tr>

                    {/* LIGNE 5 : RESULTAT (ÉCART POSITIF) (JAUNE) */}
                    <tr>
                      <td style={{ 
                        width: '50%', 
                        padding: '12px 16px', 
                        fontWeight: 900, 
                        fontSize: '1rem', 
                        textTransform: 'uppercase', 
                        borderRight: '2px solid #000',
                        backgroundColor: '#fef08a' 
                      }}>
                        RESULTAT({inventory.treatment.isPositiveDifference ? 'ecart positif' : 'ecart negatif'})
                      </td>
                      <td style={{ 
                        width: '50%', 
                        padding: '12px 16px', 
                        fontWeight: 900, 
                        fontSize: '1.25rem', 
                        fontFamily: 'monospace',
                        backgroundColor: '#fef08a' 
                      }}>
                        {new Intl.NumberFormat('fr-FR').format(Math.abs(inventory.treatment.difference))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* DESCRIPTION TEXTUELLE SYNTHÉTIQUE DU RAPPORT */}
              <div style={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #cbd5e1', 
                borderRadius: '8px', 
                padding: '14px 16px',
                fontSize: '0.8125rem',
                color: '#1e293b',
                lineHeight: 1.6
              }}>
                <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', color: '#475569', marginBottom: '6px' }}>
                  Description de Synthèse du Rapport :
                </div>
                <p style={{ margin: '0 0 6px 0' }}>
                  Ce rapport présente de manière synthétique la situation du stock d’aluminium de <strong>{inventory.shopName}</strong> sur la période du {inventory.treatment.periodStart} au {inventory.treatment.periodEnd}.
                </p>
                <ul style={{ margin: '0 0 8px 16px', padding: 0 }}>
                  <li>Stock initial au {inventory.treatment.initialStockDate} : <strong>{new Intl.NumberFormat('fr-FR').format(inventory.treatment.initialStockValue)}</strong></li>
                  <li>Solde au {inventory.treatment.balanceDate} : <strong>{new Intl.NumberFormat('fr-FR').format(inventory.treatment.shopBalance)}</strong></li>
                  <li>Stock compté le {inventory.treatment.periodEnd} : <strong>{new Intl.NumberFormat('fr-FR').format(inventory.treatment.countedStockValue)}</strong></li>
                  <li>Stock total calculé : <strong>{new Intl.NumberFormat('fr-FR').format(inventory.treatment.totalCalculatedStock)}</strong></li>
                  <li>Résultat / {inventory.treatment.isPositiveDifference ? 'écart positif' : 'écart négatif'} : <strong>{new Intl.NumberFormat('fr-FR').format(Math.abs(inventory.treatment.difference))}</strong></li>
                </ul>
                <div style={{ fontWeight: 700, borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                  👉 En résumé, le stock total calculé est {inventory.treatment.isPositiveDifference ? 'supérieur' : 'inférieur'} au stock initial de {new Intl.NumberFormat('fr-FR').format(Math.abs(inventory.treatment.difference))}, ce qui donne un {inventory.treatment.isPositiveDifference ? 'écart positif' : 'écart négatif'} de {new Intl.NumberFormat('fr-FR').format(Math.abs(inventory.treatment.difference))}.
                </div>
              </div>
            </div>
          )}

          {/* RECAPITULATIF FINANCIER OFFICIEL */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '16px', 
            marginBottom: '24px' 
          }}>
            <div style={{ padding: '16px', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                Stock Utilisable (Bon État)
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#14532d' }} className="tabular-nums">
                {formatFCFA(totalGoodAmount)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
                {totalGoodUnits} unités en bon état
              </div>
            </div>

            <div style={{ padding: '16px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
                Articles Gâtés (Freinte)
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#7f1d1d' }} className="tabular-nums">
                {formatFCFA(totalDamagedAmount)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                {totalDamagedUnits} unités endommagées
              </div>
            </div>

            <div style={{ padding: '16px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Valeur Globale de Stock Certifiée
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#0f172a' }} className="tabular-nums">
                {formatFCFA(totalGeneral)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {totalGoodUnits + totalDamagedUnits} unités recensées
              </div>
            </div>
          </div>

          {/* Synthèse par Couleur (Aluminium) */}
          {inventory.category === 'Aluminium' && Object.keys(colorBreakdown).length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase' }}>
                Synthèse Consolidée par Nuance de Couleur Aluminium :
              </div>
              <table className="data-table" style={{ fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Couleur du Catalogue</th>
                    <th style={{ textAlign: 'center' }}>Unités Bon État</th>
                    <th style={{ textAlign: 'center' }}>Unités Gâtées</th>
                    <th style={{ textAlign: 'right' }}>Montant Total FCFA</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(colorBreakdown).map(([color, data]) => (
                    <tr key={color}>
                      <td style={{ fontWeight: 600 }}>{color}</td>
                      <td style={{ textAlign: 'center', color: '#059669', fontWeight: 600 }} className="tabular-nums">{data.goodUnits}</td>
                      <td style={{ textAlign: 'center', color: data.damagedUnits > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }} className="tabular-nums">{data.damagedUnits}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }} className="tabular-nums">{formatFCFA(data.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ÉTAT DÉTAILLÉ DES ARTICLES GÂTÉS (Section 8.3 & 14.1) */}
          {damagedLines.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#991b1b', marginBottom: '8px', textTransform: 'uppercase' }}>
                Relevé Spécifique des Dégradations & Freinte Matière :
              </div>
              <table className="data-table" style={{ fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fff5f5' }}>
                    <th>Article / Profilé</th>
                    <th>Couleur</th>
                    <th style={{ textAlign: 'center' }}>Quantité Gâtée</th>
                    <th>Motif de Dégradation Notifié</th>
                    <th>Observations Terrain / Contrôle</th>
                    <th style={{ textAlign: 'right' }}>Perte Estimée FCFA</th>
                  </tr>
                </thead>
                <tbody>
                  {damagedLines.map(line => (
                    <tr key={line.id}>
                      <td style={{ fontWeight: 600 }}>{line.designation}</td>
                      <td>{line.color || '—'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#dc2626' }} className="tabular-nums">
                        {line.qtyDamaged}
                      </td>
                      <td style={{ color: '#991b1b', fontWeight: 600 }}>
                        {line.damageReason || 'Non spécifié'}
                      </td>
                      <td style={{ color: '#475569' }}>
                        {line.observation || '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#b91c1c' }} className="tabular-nums">
                        {formatFCFA(line.amountDamaged)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* DÉTAIL COMPLET DES ARTICLES */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase' }}>
              Bordereau Intégral des Comptages :
            </div>
            <table className="data-table" style={{ fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Couleur</th>
                  <th style={{ textAlign: 'right' }}>Prix Unitaire</th>
                  <th style={{ textAlign: 'center' }}>Bon État</th>
                  <th style={{ textAlign: 'center' }}>Gâté</th>
                  <th style={{ textAlign: 'right' }}>Valorisation Totale</th>
                </tr>
              </thead>
              <tbody>
                {inventory.lines.map(line => (
                  <tr key={line.id}>
                    <td style={{ fontWeight: 600 }}>{line.designation}</td>
                    <td>{line.color || '—'}</td>
                    <td style={{ textAlign: 'right' }} className="tabular-nums">{formatFCFA(line.officialPriceSnapshot)}</td>
                    <td style={{ textAlign: 'center', color: '#059669', fontWeight: 600 }} className="tabular-nums">{line.qtyGood}</td>
                    <td style={{ textAlign: 'center', color: line.qtyDamaged > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }} className="tabular-nums">{line.qtyDamaged}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }} className="tabular-nums">{formatFCFA(line.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Zone des Signatures Officielles (Section 14.1) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '24px', 
            paddingTop: '20px', 
            borderTop: '2px solid #e2e8f0',
            pageBreakInside: 'avoid'
          }}>
            <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '40px' }}>
                L'Inventoriste Terrain
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                {inventory.assignedCounterName || 'Éric Houndété'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                Attestation de comptage physique
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '40px' }}>
                Le Personnel de Contrôle
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                {inventory.assignedControllerName || 'Paul Dossou'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                Vérification & réconciliation
              </div>
            </div>

            <div style={{ border: '1px solid #a7f3d0', backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '40px' }}>
                Le Responsable d'Inventaire Habilité (PDG)
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#14532d' }}>
                {inventory.validatedByName || 'Jean-Baptiste Koffi'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#15803d' }}>
                Scellé numérique certifié conforme
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button onClick={onClose} className="btn btn-secondary">
            Fermer le Rapport
          </button>
        </div>
      </div>
    </div>
  );
};
