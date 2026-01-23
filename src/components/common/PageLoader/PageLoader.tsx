import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const PageLoader: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <Spin
          indicator={
            <LoadingOutlined
              style={{
                fontSize: 48,
                color: '#ac202d',
              }}
              spin
            />
          }
        />
        <p
          style={{
            marginTop: 16,
            color: '#666',
            fontSize: 16,
          }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
