import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Lock, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Eye,
  Edit3,
  FileDown,
  ThumbsUp,
  RotateCcw,
  Layers
} from 'lucide-react';
import { useALUStore } from '../services/store';
import { AuditLog } from '../types';

export const AuditLogView: React.FC = () => {
  const store = useALUStore();
  const auditLogs = store.getAuditLogs();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterActionType, setFilterActionType] = useState('TOUS');
  const [filterStatus, setFilterStatus] = useState('TOUS');

  // Icône selon le type d'action
  const getActionIcon = (log: AuditLog) => {
    if (log.status === 'BLOCKED') return <XCircle size={14} color="#dc2626" />;
    switch (log.actionType) {
      case 'CONSULTATION': return <Eye size={14} color="#64748b" />;
      case 'CREATION': return <Layers size={14} color="#2563eb" />;
      case 'MODIFICATION': return <Edit3 size={14} color="#d97706" />;
      case 'EXPORT': return <FileDown size={14} color="#7c3aed" />;
      case 'APPROBATION': return <ThumbsUp size={14} color="#059669" />;
      case 'REOUVERTURE': return <RotateCcw size={14} color="#dc2626" />;
      default: return <CheckCircle2 size={14} color="#64748b" />;
    }
  };

  // Couleur de la pastille d'action type
  const getActionTypeColor = (log: AuditLog) => {
    if (log.status === 'BLOCKED') return { bg: '#fef2f2', text: '#dc2626' };
    switch (log.actionType) {
      case 'CONSULTATION': return { bg: '#f8fafc', text: '#475569' };
      case 'CREATION': return { bg: '#eff6ff', text: '#2563eb' };
      case 'MODIFICATION': return { bg: '#fffbeb', text: '#d97706' };
      case 'EXPORT': return { bg: '#f5f3ff', text: '#7c3aed' };
      case 'APPROBATION': return { bg: '#f0fdf4', text: '#059669' };
      case 'REOUVERTURE': return { bg: '#fef2f2', text: '#dc2626' };
      default: return { bg: '#f8fafc', text: '#475569' };
    }
  };

  // Filtrage complet
  const filteredLogs = auditLogs.filter(log => {
    const matchQuery = searchQuery === '' ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.shopName && log.shopName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.targetObject && log.targetObject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.inventoryCode && log.inventoryCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchActionType = filterActionType === 'TOUS' ||
      (filterActionType === 'CONSULTATION' && log.actionType === 'CONSULTATION') ||
      (filterActionType === 'CREATION' && log.actionType === 'CREATION') ||
      (filterActionType === 'MODIFICATION' && log.actionType === 'MODIFICATION') ||
      (filterActionType === 'EXPORT' && log.actionType === 'EXPORT') ||
      (filterActionType === 'APPROBATION' && log.actionType === 'APPROBATION') ||
      (filterActionType === 'REOUVERTURE' && log.actionType === 'REOUVERTURE') ||
      (filterActionType === 'BLOQUEES' && log.status === 'BLOCKED');

    const matchStatus = filterStatus === 'TOUS' || log.status === filterStatus;

    return matchQuery && matchActionType && matchStatus;
  });

  // Compteurs par catégorie
  const countByType = (type: string) => {
    if (type === 'BLOQUEES') return auditLogs.filter(l => l.status === 'BLOCKED').length;
    return auditLogs.filter(l => l.actionType === type).length;
  };

  const handleExportAuditCSV = () => {
    const headers = [
      'ID Log',
      'Horodatage Serveur',
      'Utilisateur',
      'Rôle',
      'Type Action',
      'Action Enregistrée',
      'Objet Ciblé',
      'Boutique',
      'Code Inventaire',
      'Ancienne Valeur',
      'Nouvelle Valeur',
      'Motif Justifié',
      'Autorisé Par',
      'Résultat'
    ];

    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.userName.replace(/"/g, '""')}"`,
      `"${l.userRole}"`,
      `"${l.actionType || 'AUTRE'}"`,
      `"${l.action}"`,
      `"${(l.targetObject || '').replace(/"/g, '""')}"`,
      `"${(l.shopName || '').replace(/"/g, '""')}"`,
      `"${l.inventoryCode || ''}"`,
      `"${(l.oldValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
      `"${(l.authorizedBy || '').replace(/"/g, '""')}"`,
      `"${l.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REGISTRE_AUDIT_ALUCOUNT_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            Journal d'Audit Immuable & Traçabilité Intégrale
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Enregistrement chronologique inaltérable de chaque consultation, création, modification, export, approbation et réouverture.
          </p>
        </div>

        <button onClick={handleExportAuditCSV} className="btn btn-secondary btn-sm">
          <Download size={14} />
          <span>Exporter le Registre (CSV)</span>
        </button>
      </div>

      {/* Règle d'inviolabilité — Badge immuable */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 20px',
        marginBottom: '20px',
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderLeft: '4px solid #059669',
        borderRadius: '8px'
      }}>
        <Lock size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '4px', fontSize: '0.9375rem' }}>
            🔒 Journal Inaltérable — Protection Absolue Contre Toute Modification
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#047857', lineHeight: 1.5 }}>
            Chaque entrée de ce registre est <strong>cryptographiquement scellée</strong> et protégée contre toute altération, 
            même par l'Administrateur SaaS. Toute correction apportée à un inventaire conserve intégralement <strong>l'ancienne 
            valeur, la nouvelle valeur, l'objet ciblé, l'horodatage serveur et l'identité de l'auteur</strong>. 
            Ce journal est conforme aux exigences d'audit interne ALUTRACO.
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ 
            padding: '6px 12px', 
            backgroundColor: '#059669', 
            color: '#fff', 
            borderRadius: '6px', 
            fontSize: '0.6875rem', 
            fontWeight: 800,
            letterSpacing: '0.05em'
          }}>
            {auditLogs.length} ENTRÉES
          </div>
          <div style={{ fontSize: '0.625rem', color: '#64748b', marginTop: '4px' }}>LECTURE SEULE</div>
        </div>
      </div>

      {/* Compteurs rapides par catégorie */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { key: 'TOUS', label: 'Toutes', count: auditLogs.length, color: '#475569' },
          { key: 'CONSULTATION', label: 'Consultations', count: countByType('CONSULTATION'), color: '#475569' },
          { key: 'CREATION', label: 'Créations', count: countByType('CREATION'), color: '#2563eb' },
          { key: 'MODIFICATION', label: 'Modifications', count: countByType('MODIFICATION'), color: '#d97706' },
          { key: 'EXPORT', label: 'Exports', count: countByType('EXPORT'), color: '#7c3aed' },
          { key: 'APPROBATION', label: 'Approbations', count: countByType('APPROBATION'), color: '#059669' },
          { key: 'REOUVERTURE', label: 'Réouvertures', count: countByType('REOUVERTURE'), color: '#dc2626' },
          { key: 'BLOQUEES', label: 'Bloquées', count: countByType('BLOQUEES'), color: '#dc2626' },
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilterActionType(cat.key)}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: `1.5px solid ${filterActionType === cat.key ? cat.color : '#e2e8f0'}`,
              backgroundColor: filterActionType === cat.key ? cat.color : '#fff',
              color: filterActionType === cat.key ? '#fff' : '#475569',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {cat.label}
            <span style={{
              backgroundColor: filterActionType === cat.key ? 'rgba(255,255,255,0.3)' : '#f1f5f9',
              color: filterActionType === cat.key ? '#fff' : '#475569',
              padding: '1px 5px',
              borderRadius: '10px',
              fontSize: '0.6875rem',
              fontWeight: 700
            }}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filtres de recherche */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Résultat de Contrôle</label>
              <select
                className="form-select"
                style={{ fontSize: '0.8125rem' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="TOUS">Tous les résultats</option>
                <option value="SUCCESS">Approuvé / Autorisé</option>
                <option value="BLOCKED">Bloqué / Refus d'accès</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Recherche Mot-Clé</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Rechercher par utilisateur, objet ciblé, boutique, code inventaire..."
                  className="form-input"
                  style={{ paddingLeft: '32px', fontSize: '0.8125rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé du filtre actif */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          <strong style={{ color: '#0f172a' }}>{filteredLogs.length}</strong> entrée(s) sur {auditLogs.length} au total
          {filterActionType !== 'TOUS' && (
            <span style={{ marginLeft: '8px', color: '#2563eb' }}>— Filtre : {filterActionType}</span>
          )}
        </div>
        <ShieldCheck size={16} color="#059669" />
      </div>

      {/* TABLEAU DU JOURNAL D'AUDIT */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '150px' }}>Horodatage Serveur</th>
              <th>Auteur & Rôle</th>
              <th>Type & Action</th>
              <th>Objet Ciblé</th>
              <th>Ancienne → Nouvelle Valeur</th>
              <th>Motif & Autorisation</th>
              <th style={{ textAlign: 'center', width: '90px' }}>Résultat</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  <AlertCircle size={28} style={{ margin: '0 auto 8px', display: 'block' }} />
                  Aucune entrée ne correspond aux critères sélectionnés.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => {
                const isBlocked = log.status === 'BLOCKED';
                const colors = getActionTypeColor(log);

                return (
                  <tr key={log.id} style={{ backgroundColor: isBlocked ? '#fff5f5' : undefined }}>
                    <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }} className="tabular-nums">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="#94a3b8" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.userName}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{log.userRole}</div>
                    </td>

                    <td>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}>
                        {getActionIcon(log)}
                        <span>{log.actionType || 'AUTRE'}</span>
                      </div>
                      <div style={{ fontWeight: 500, color: isBlocked ? '#991b1b' : '#334155', fontSize: '0.8125rem' }}>
                        {log.action.replace(/_/g, ' ')}
                      </div>
                    </td>

                    <td style={{ fontSize: '0.8125rem' }}>
                      {log.targetObject ? (
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>{log.targetObject}</div>
                      ) : (
                        <div style={{ fontWeight: 500, color: '#334155' }}>{log.shopName || 'Système ALUTRACO'}</div>
                      )}
                      {log.inventoryCode && (
                        <div style={{ fontSize: '0.6875rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {log.inventoryCode}
                        </div>
                      )}
                    </td>

                    <td style={{ fontSize: '0.8125rem' }}>
                      {log.oldValue && (
                        <div style={{ color: '#64748b', fontSize: '0.75rem', textDecoration: 'line-through', marginBottom: '2px' }}>
                          {log.oldValue}
                        </div>
                      )}
                      {log.newValue && (
                        <div style={{ color: '#2563eb', fontWeight: 600 }}>
                          {log.newValue}
                        </div>
                      )}
                      {!log.oldValue && !log.newValue && (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>

                    <td style={{ fontSize: '0.8125rem', color: '#334155', maxWidth: '260px' }}>
                      <div style={{ color: isBlocked ? '#991b1b' : '#334155' }}>{log.reason || '—'}</div>
                      {log.authorizedBy && (
                        <div style={{ fontSize: '0.6875rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                          ✓ Habilité : {log.authorizedBy}
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-pill ${isBlocked ? 'danger' : 'success'}`} style={{ fontSize: '0.6875rem' }}>
                        {isBlocked ? (
                          <><XCircle size={11} /> Bloqué</>
                        ) : (
                          <><CheckCircle2 size={11} /> Conforme</>
                        )}
                      </span>
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
