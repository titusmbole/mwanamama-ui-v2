import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const ServerError: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '40px 20px',
      }}
    >
      <Result
        status="500"
        title="500"
        subTitle="Sorry, something went wrong on our server."
        extra={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <Button type="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default ServerError;
