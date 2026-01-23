import React from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs }) => {
  const { user } = useAuth();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        padding: '16px 0',
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{title}</h2>
        
      </div>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/dashboard">
            <HomeOutlined /> Home
          </Link>
        </Breadcrumb.Item>
        {breadcrumbs.map((item, index) => (
          <Breadcrumb.Item key={index}>
            {item.path && index < breadcrumbs.length - 1 ? (
              <Link to={item.path}>{item.title}</Link>
            ) : (
              item.title
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </div>
  );
};

export default PageHeader;
