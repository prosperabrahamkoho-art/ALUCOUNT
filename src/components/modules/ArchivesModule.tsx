import React, { useState, useMemo } from 'react';
import {
  Archive,
  Search,
  Download,
  Eye,
  FileText,
  Store,
  Calendar,
  Tag,
  Lock,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  Package,
  AlertTriangle,
  RotateCcw,
  Banknote
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../../services/store';
import { Inventory } from '../../types';

interface ArchivesModuleProps {
  onOpenReport?: (inv: Inventory) => void;
  onOpenReopenModal?: (inv: Inventory) => void;
}

type SortField = 'date' | 'montant' | 'boutique' | 'code';
type SortDir = 'asc' | 'desc';

export const ArchivesModule: React.FC<ArchivesModuleProps> = ({
  onOpenReport = () => {},
  onOpenReopenModal
}) => {
  const store = useALUStore();
  const currentUser = store.getCurrentUser();
  const inventories = store.getInventories();
  const shops = store.getShops();

  const archivedInventories = inventories.filter(i => i.status === 'Validé et clôturé');

  const [searchQuery, setSearchQuery] = useState('');
  const [shopFilter, setShopFilter] = useState('TOUS');
  const [categoryFilter, setCategoryFilter] = useState('TOUS');
  const [yearFilter, setYearFilter] = useState('TOUS');
  const [versionFilter, setVersionFilter] = useState('TOUS');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canReopen =
    currentUser.role === 'PDG' ||
    (currentUser.role === 'RESPONSABLE_INVENTAIRE' && currentUser.isDesignatedByPDG);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    archivedInventories.forEach(inv => {
      const yr = inv.closedAt?.substring(6, 10) || inv.createdAt?.substring(6, 10);
      if (yr) years.add(yr);
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [archivedInventories]);

  const filtered = useMemo(() => {
    return archivedInventories.filter(inv => {
      const yr = inv.closedAt?.substring(6, 10) || inv.createdAt?.substring(6, 10);
      const matchYear = yearFilter === 'TOUS' || yr === yearFilter;
      const matchShop = shopFilter === 'TOUS' || inv.shopId === shopFilter;
      const matchCat = categoryFilter === 'TOUS' || inv.category === categoryFilter;
      const matchVer =
        versionFilter === 'TOUS' ||
        (versionFilter === 'REOUVERT' && inv.version > 1) ||
        (versionFilter === 'ORIGINAL' && inv.version === 1);
      const matchSearch =
        searchQuery === '' ||
        inv.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.validatedByName || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchYear && matchShop && matchCat && matchVer && matchSearch;
    });
  }, [archivedInventories, yearFilter, shopFilter, categoryFilter, versionFilter, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date': {
          const da = a.closedAt || a.createdAt || '';
          const db = b.closedAt || b.createdAt || '';
          cmp = da.localeCompare(db);
          break;
        }
        case 'montant': {
          const ma = a.lines.reduce((s, l) => s + l.totalAmount, 0);
          const mb = b.lines.reduce((s, l) => s + l.totalAmount, 0);
          cmp = ma - mb;
          break;
        }
        case 'boutique':
          cmp = a.shopName.localeCompare(b.shopName);
          break;
        case 'code':
          cmp = a.code.localeCompare(b.code);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const totalMontant = filtered.reduce((s, inv) => s + inv.lines.reduce((ss, l) => ss + l.totalAmount, 0), 0);
  const totalUnites = filtered.reduce((s, inv) => s + inv.lines.reduce((ss, l) => ss + l.qtyGood + l.qtyDamaged, 0), 0);
  const totalGatesGlobal = filtered.reduce((s, inv) => s + inv.lines.reduce((ss, l) => ss + l.qtyDamaged, 0), 0);
  const nbReouverts = filtered.filter(inv => inv.version > 1).length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={12} color="#94a3b8" />;
    return sortDir === 'asc' ? <ChevronUp size={12} color="#2563eb" /> : <ChevronDown size={12} color="#2563eb" />;
  };

  const exportCSV = () => {
    const headers = ['Code', 'Boutique', 'Catégorie', 'Campagne', 'Version', 'Clôturé le', 'Signataire', 'Total FCFA'];
    const rows = sorted.map(inv => [
      inv.code,
      inv.shopName,
      inv.category,
      inv.campaignName,
      `V${inv.version}.0`,
      inv.closedAt || inv.createdAt || '',
      inv.validatedByName || '',
      inv.lines.reduce((s, l) => s + l.totalAmount, 0)
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ALUCOUNT_Archives_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* En-tête */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Archive size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#7c3aed', fontSize: '0.875rem' }}>MODULE 17</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a' }}>
                Archives des Inventaires Clôturés
              </h1>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Registre officiel ALUTRACO — consultation, filtrage et export des procès-verbaux scellés.
            </p>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="btn btn-secondary btn-sm"
          disabled={sorted.length === 0}
        >
          <Download size={15} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Bandeau légal */}
      <div className="alert-banner info" style={{ marginBottom: '20px' }}>
        <ShieldCheck size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8125rem' }}>
          <strong>Registre d'Archives Officiel :</strong> Chaque inventaire archivé dispose d'un PV scellé et d'un registre
          de versions immuable. Aucune modification n'est possible sans réouverture exceptionnelle autorisée par le PDG.
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {[
          { icon: <Archive size={18} color="#7c3aed" />, label: 'Inventaires Archivés', value: filtered.length, sub: `sur ${archivedInventories.length} au total`, bg: '#f5f3ff', border: '#ddd6fe' },
          { icon: <Banknote size={18} color="#059669" />, label: 'Valeur Totale Certifiée', value: formatFCFA(totalMontant), sub: 'Stocks valorisés FCFA', bg: '#f0fdf4', border: '#a7f3d0' },
          { icon: <Package size={18} color="#2563eb" />, label: 'Unités Dénombrées', value: totalUnites.toLocaleString('fr-FR'), sub: `dont ${totalGatesGlobal} gâtées`, bg: '#eff6ff', border: '#bfdbfe' },
          { icon: <RotateCcw size={18} color="#dc2626" />, label: 'Réouvertures', value: nbReouverts, sub: 'Dossiers multi-versions', bg: '#fef2f2', border: '#fecaca' }
        ].map((kpi, i) => (
          <div key={i} style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: kpi.bg, border: `1px solid ${kpi.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {kpi.icon}
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }} className="tabular-nums">{kpi.value}</div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '12px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Recherche libre</label>
              <input type="text" className="form-input" placeholder="Code, boutique, campagne..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ fontSize: '0.8125rem' }} />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Exercice Fiscal</label>
              <select className="form-select" value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{ fontSize: '0.8125rem' }}>
                <option value="TOUS">Toutes les années</option>
                {availableYears.map(yr => <option key={yr} value={yr}>{yr}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Boutique / Site</label>
              <select className="form-select" value={shopFilter} onChange={e => setShopFilter(e.target.value)} style={{ fontSize: '0.8125rem' }}>
                <option value="TOUS">Toutes les boutiques</option>
                {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Catégorie</label>
              <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ fontSize: '0.8125rem' }}>
                <option value="TOUS">Toutes catégories</option>
                <option value="Aluminium">Aluminium</option>
                <option value="Accessoires">Accessoires</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Versions</label>
              <select className="form-select" value={versionFilter} onChange={e => setVersionFilter(e.target.value)} style={{ fontSize: '0.8125rem' }}>
                <option value="TOUS">Toutes versions</option>
                <option value="ORIGINAL">Version originelle V1.0</option>
                <option value="REOUVERT">Avec réouverture(s)</option>
              </select>
            </div>
          </div>
          {(searchQuery || shopFilter !== 'TOUS' || categoryFilter !== 'TOUS' || yearFilter !== 'TOUS' || versionFilter !== 'TOUS') && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>
                {sorted.length} résultat{sorted.length > 1 ? 's' : ''}
              </span>
              <button onClick={() => { setSearchQuery(''); setShopFilter('TOUS'); setCategoryFilter('TOUS'); setYearFilter('TOUS'); setVersionFilter('TOUS'); }}
                style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Résultats */}
      {sorted.length === 0 ? (
        <div className="card" style={{ padding: '56px', textAlign: 'center' }}>
          <Archive size={52} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.125rem', color: '#0f172a', marginBottom: '8px' }}>
            {archivedInventories.length === 0 ? 'Aucun inventaire archivé pour le moment' : 'Aucun résultat pour ces filtres'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {archivedInventories.length === 0
              ? 'Les inventaires validés et clôturés apparaîtront ici automatiquement.'
              : 'Modifiez ou réinitialisez les filtres pour afficher les archives.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* En-tête colonnes */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2.5fr 2fr 1fr 1fr 1.5fr 130px',
            gap: '12px', padding: '8px 16px', borderRadius: '6px',
            backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
            fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase'
          }}>
            {(['code', 'boutique'] as SortField[]).map(f => (
              <button key={f} onClick={() => handleSort(f)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'inherit', textTransform: 'inherit', fontSize: 'inherit' }}>
                {f === 'code' ? 'Référence' : 'Boutique'} <SortIcon field={f} />
              </button>
            ))}
            <span>Catégorie</span>
            <span>Version</span>
            <button onClick={() => handleSort('montant')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'inherit', textTransform: 'inherit', fontSize: 'inherit', justifyContent: 'flex-end' }}>
              Montant FCFA <SortIcon field="montant" />
            </button>
            <span style={{ textAlign: 'center' }}>Actions</span>
          </div>

          {sorted.map(inv => {
            const total = inv.lines.reduce((s, l) => s + l.totalAmount, 0);
            const gatesInv = inv.lines.reduce((s, l) => s + l.qtyDamaged, 0);
            const unitsInv = inv.lines.reduce((s, l) => s + l.qtyGood + l.qtyDamaged, 0);
            const isExpanded = expandedId === inv.id;
            const closedDate = inv.closedAt || inv.createdAt || '—';

            return (
              <div key={inv.id} className="card" style={{
                border: inv.version > 1 ? '1px solid #fbbf24' : '1px solid #e2e8f0',
                transition: 'box-shadow 0.2s'
              }}>
                {/* Ligne */}
                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 2fr 1fr 1fr 1.5fr 130px', gap: '12px', padding: '14px 16px', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lock size={13} color="#7c3aed" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{inv.code}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', paddingLeft: '21px' }}>{inv.campaignName}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', paddingLeft: '21px', marginTop: '1px' }}>
                      <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                      Clôturé : {closedDate}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>{inv.shopName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Par : {inv.validatedByName || 'Direction'}</div>
                  </div>

                  <div>
                    <span style={{
                      fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px',
                      backgroundColor: inv.category === 'Aluminium' ? '#f1f5f9' : '#fffbeb',
                      color: inv.category === 'Aluminium' ? '#0f172a' : '#b45309',
                      fontWeight: 600, border: '1px solid #e2e8f0', whiteSpace: 'nowrap'
                    }}>
                      {inv.category}
                    </span>
                  </div>

                  <div>
                    {inv.version > 1 ? (
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#fffbeb', color: '#92400e', fontWeight: 700, border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <RotateCcw size={10} /> V{inv.version}.0
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f0fdf4', color: '#065f46', fontWeight: 700, border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={10} /> V1.0
                      </span>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem' }} className="tabular-nums">{formatFCFA(total)}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                      {unitsInv.toLocaleString('fr-FR')} unités
                      {gatesInv > 0 && <span style={{ color: '#b91c1c', marginLeft: '4px' }}>· {gatesInv} gâtées</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'stretch' }}>
                    <button onClick={() => onOpenReport(inv)} className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem', justifyContent: 'center' }}>
                      <Eye size={13} /><span>PV Officiel</span>
                    </button>
                    <button onClick={() => setExpandedId(isExpanded ? null : inv.id)} className="btn btn-secondary btn-sm" style={{ padding: '3px 10px', fontSize: '0.75rem', justifyContent: 'center' }}>
                      <FileText size={12} /><span>{isExpanded ? 'Replier' : 'Détails'}</span>
                    </button>
                  </div>
                </div>

                {/* Panneau détails */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '18px 20px', backgroundColor: '#fafbfc', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>

                      {/* Fiche d'archive */}
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
                          Fiche d'Archive
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
                          {[
                            ['Référence', inv.code], ['Campagne', inv.campaignName],
                            ['Boutique', inv.shopName], ['Inventoriste', inv.assignedCounterName || '—'],
                            ['Contrôleur', inv.assignedControllerName || '—'],
                            ['Signataire', inv.validatedByName || 'Direction habilitée'],
                            ['Date de clôture', closedDate],
                            ['Nb. lignes', `${inv.lines.length} références`],
                          ].map(([label, val]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                              <span style={{ color: '#64748b' }}>{label} :</span>
                              <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Registre versions */}
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
                          Registre des Versions
                        </div>
                        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #a7f3d0', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 800, color: '#065f46', fontSize: '0.875rem' }}>V{inv.version}.0 — En Vigueur</span>
                            <span className="status-pill success" style={{ fontSize: '0.6875rem' }}>Scellée</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#166534' }}>{formatFCFA(total)} · {closedDate}</div>
                        </div>
                        {inv.versionsHistory.length > 0 ? (
                          inv.versionsHistory.map((ver, i) => (
                            <div key={i} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #fde68a', backgroundColor: '#fffbeb', marginBottom: '6px', fontSize: '0.8125rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#92400e', marginBottom: '3px' }}>
                                <span>V{ver.versionNumber}.0 (Archivée)</span>
                                <span className="tabular-nums">{formatFCFA(ver.totalGeneral)}</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#78350f' }}>
                                {ver.closedAt ? ver.closedAt.substring(0, 10) : '—'} · {ver.closedByName}
                              </div>
                              {ver.reopeningReason && (
                                <div style={{ marginTop: '4px', padding: '4px 8px', backgroundColor: '#fef3c7', borderRadius: '4px', fontSize: '0.75rem', color: '#92400e' }}>
                                  <AlertTriangle size={10} style={{ display: 'inline', marginRight: '4px' }} />
                                  {ver.reopeningReason}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontStyle: 'italic' }}>Version originelle intègre, aucune réouverture.</div>
                        )}
                        {canReopen && onOpenReopenModal && (
                          <button onClick={() => onOpenReopenModal(inv)} className="btn btn-secondary btn-sm"
                            style={{ marginTop: '10px', color: '#dc2626', borderColor: '#fecaca', width: '100%', justifyContent: 'center' }}>
                            <RotateCcw size={13} /><span>Réouverture Exceptionnelle</span>
                          </button>
                        )}
                      </div>

                      {/* Synthèse comptable */}
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
                          Synthèse Comptable Certifiée
                        </div>
                        {[
                          { label: 'Stock Bon État', val: formatFCFA(inv.lines.reduce((s, l) => s + l.amountGood, 0)), color: '#065f46', bg: '#f0fdf4', border: '#a7f3d0', bold: false },
                          { label: 'Stock Gâté / Freinte', val: formatFCFA(inv.lines.reduce((s, l) => s + l.amountDamaged, 0)), color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', bold: false },
                          { label: 'Total Certifié Général', val: formatFCFA(total), color: '#0f172a', bg: '#f8fafc', border: '#e2e8f0', bold: true }
                        ].map((item, i) => (
                          <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: item.bg, border: `1px solid ${item.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.8125rem', color: item.color }}>{item.label}</span>
                            <span style={{ fontWeight: item.bold ? 800 : 700, color: item.color, fontSize: item.bold ? '0.9375rem' : '0.875rem' }} className="tabular-nums">{item.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pied légal */}
      <div style={{ marginTop: '24px', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: '#64748b' }}>
        <Lock size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
        <span>
          <strong>ALUTRACO SARL</strong> — Archives officielles certifiées et immuables.
          Toute modification est soumise à réouverture exceptionnelle tracée dans le journal d'audit (Article 12).
        </span>
      </div>
    </div>
  );
};
