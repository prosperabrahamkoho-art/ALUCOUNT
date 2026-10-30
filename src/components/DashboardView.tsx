import React from 'react';
import { 
  Building2, 
  ClipboardCheck, 
  Clock, 
  AlertTriangle, 
  Coins, 
  CheckCircle, 
  ShieldCheck, 
  Plus, 
  ArrowUpRight 
} from 'lucide-react';
import { useALUStore, formatFCFA } from '../services/store';

interface DashboardViewProps {
  onCreateInventory: () => void;
  onOpenPermissions: () => void;
  onNavigateToInventories: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onCreateInventory, 
  onOpenPermissions,
  onNavigateToInventories 
}) => {
  const store = useALUStore();
  const shops = store.getShops();
  const inventories = store.getInventories();
  const currentUser = store.getCurrentUser();
  const auditLogs = store.getAuditLogs().slice(0, 5);

  // Calculs synthétiques
  const inProgressCount = inventories.filter(i => i.status === 'En cours de comptage' || i.status === 'Brouillon').length;
  const inReviewCount = inventories.filter(i => i.status === 'Comptage terminé' || i.status === 'En contrôle' || i.status === 'Prêt pour validation').length;
  const closedCount = inventories.filter(i => i.status === 'Validé et clôturé').length;

  // Calcul de la valorisation totale
  let totalGoodAmount = 0;
  let totalDamagedAmount = 0;
  let totalUnitsGood = 0;
  let totalUnitsDamaged = 0;

  inventories.forEach(inv => {
    inv.lines.forEach(line => {
      totalGoodAmount += line.amountGood;
      totalDamagedAmount += line.amountDamaged;
      totalUnitsGood += line.qtyGood;
      totalUnitsDamaged += line.qtyDamaged;
    });
  });

  const totalGeneralAmount = totalGoodAmount + totalDamagedAmount;
  const totalUnits = totalUnitsGood + totalUnitsDamaged;
  const damagedRate = totalUnits > 0 ? ((totalUnitsDamaged / totalUnits) * 100).toFixed(1) : '0.0';

  const canManage = ['PDG', 'MAGASINIER', 'RESPONSABLE_INVENTAIRE'].includes(currentUser.role);

  return (
    <div>
      {/* En-tête de bienvenue exécutif */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e2e8f0' 
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Vue Générale de la Direction — ALUCOUNT
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Supervision consolidée des stocks, contrôles en cours et clôtures certifiées ALUTRACO
          </p>
        </div>

        {canManage && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onOpenPermissions} className="btn btn-secondary btn-sm">
              <ShieldCheck size={16} />
              <span>Gérer les Permissions</span>
            </button>
            <button onClick={onCreateInventory} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Nouvel Inventaire</span>
            </button>
          </div>
        )}
      </div>

      {/* Grille des KPI Stratégiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            <span>Boutiques Couvertes</span>
            <Building2 size={16} color="#64748b" />
          </div>
          <div className="stat-value tabular-nums">{shops.length}</div>
          <div className="stat-sub">Réseau national ALUTRACO</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>En Cours de Comptage</span>
            <Clock size={16} color="#2563eb" />
          </div>
          <div className="stat-value tabular-nums" style={{ color: '#2563eb' }}>{inProgressCount}</div>
          <div className="stat-sub">Inventoristes sur le terrain</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>En Contrôle & Revue</span>
            <ClipboardCheck size={16} color="#d97706" />
          </div>
          <div className="stat-value tabular-nums" style={{ color: '#d97706' }}>{inReviewCount}</div>
          <div className="stat-sub">Vérifications & autorisations actives</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Inventaires Clôturés</span>
            <CheckCircle size={16} color="#059669" />
          </div>
          <div className="stat-value tabular-nums" style={{ color: '#059669' }}>{closedCount}</div>
          <div className="stat-sub">Scellés et certifiés définitifs</div>
        </div>
      </div>

      {/* Cartes de valorisation financière & Freinte */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0f172a' }}>
              <Coins size={18} color="#0f172a" />
              <span>Valorisation Globale du Stock Inventorié</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Devise : FCFA</span>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>
                Valeur Totale au Prix Officiel ALUTRACO
              </div>
              <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }} className="tabular-nums">
                {formatFCFA(totalGeneralAmount)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>
                  Articles en Bon État
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#14532d' }} className="tabular-nums">
                  {formatFCFA(totalGoodAmount)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
                  {totalUnitsGood} unités utilisables
                </div>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase' }}>
                  Articles Gâtés / Dégradés
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#7f1d1d' }} className="tabular-nums">
                  {formatFCFA(totalDamagedAmount)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                  {totalUnitsDamaged} unités dégradées ({damagedRate}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* État des Boutiques & Dernières Validations */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0f172a' }}>
              <Building2 size={18} color="#0f172a" />
              <span>Suivi par Boutique & Isolation</span>
            </div>
            <button onClick={onNavigateToInventories} className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
              <span>Voir tout</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Boutique</th>
                  <th>Responsable</th>
                  <th>En cours</th>
                  <th>Validés</th>
                  <th>Dernière Clôture</th>
                </tr>
              </thead>
              <tbody>
                {shops.map(shop => (
                  <tr key={shop.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{shop.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{shop.code}</div>
                    </td>
                    <td>{shop.managerName || 'Non assigné'}</td>
                    <td>
                      <span className="status-pill info tabular-nums">
                        {shop.activeInventoriesCount}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill success tabular-nums">
                        {shop.validatedInventoriesCount}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      {shop.lastValidationDate || 'En attente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Traçabilité récente — Journal d'audit synthétique */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0f172a' }}>
            <ShieldCheck size={18} color="#059669" />
            <span>Dernières Actions Sensibles & Journal d'Audit Immuable</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Aucun enregistrement ne peut être supprimé
          </span>
        </div>
        <div className="card-body" style={{ padding: '0' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Horodatage</th>
                <th>Utilisateur & Rôle</th>
                <th>Action & Événement</th>
                <th>Boutique / Inventaire</th>
                <th>Motif & Autorisation</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }} className="tabular-nums">
                    {log.timestamp}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.userName}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{log.userRole}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#0f172a' }}>{log.action.replace(/_/g, ' ')}</div>
                    {log.newValue && (
                      <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>{log.newValue}</div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {log.shopName || 'Système Central'}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: '#475569' }}>
                    <div>{log.reason || '—'}</div>
                    {log.authorizedBy && (
                      <div style={{ fontSize: '0.6875rem', color: '#059669' }}>
                        Autorisé par : {log.authorizedBy}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${log.status === 'SUCCESS' ? 'success' : 'danger'}`}>
                      {log.status === 'SUCCESS' ? 'Approuvé' : 'Bloqué'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
