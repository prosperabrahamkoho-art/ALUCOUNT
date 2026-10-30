import React from 'react';
import { SaasAdminDashboard } from '../admin/SaasAdminDashboard';

export const AdminSpace: React.FC = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 54px)', backgroundColor: '#13082b' }}>
      <SaasAdminDashboard />
    </div>
  );
};
