import React from 'react';
import { Card } from 'antd';

interface PageCardProps {
  title?: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
  loading?: boolean;
  bordered?: boolean;
  style?: React.CSSProperties;
}

const PageCard: React.FC<PageCardProps> = ({
  title,
  children,
  extra,
  loading = false,
  bordered = true,
  style,
}) => {
  return (
    <Card
      title={title}
      extra={extra}
      loading={loading}
      bordered={bordered}
      style={{ marginBottom: 24, ...style }}
    >
      {children}
    </Card>
  );
};

export default PageCard;
