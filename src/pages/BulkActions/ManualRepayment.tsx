import React from 'react';
import { message } from 'antd';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';

const ManualRepayment: React.FC = () => {
  return (
    <div>
      <PageHeader 
        title="Manual Repayment" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Bulk Actions', path: '#' },
          { title: 'Manual Repayment' }
        ]} 
      />

      <PageCard>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ color: '#666', marginBottom: 16 }}>Manual Repayment</h2>
          <p style={{ color: '#999' }}>
            This feature allows manual entry of loan repayments for individual clients.
          </p>
          <p style={{ color: '#999', marginTop: 8 }}>
            Coming soon...
          </p>
        </div>
      </PageCard>
    </div>
  );
};

export default ManualRepayment;
