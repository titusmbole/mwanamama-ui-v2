import React, { useEffect, useState } from 'react';
import { message, Spin, Checkbox, Card, Tag } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';

interface UserAppManagementProps {
  userId: number;
}

type App = 'LOAN' | 'HRM' | 'POS' | 'SHOP';

interface AppData {
  id?: number;
  appName?: string;
  name?: string;
}

const UserAppManagement: React.FC<UserAppManagementProps> = ({ userId }) => {
  const [allApps, setAllApps] = useState<AppData[]>([]);
  const [userApps, setUserApps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadApps();
  }, [userId]);

  const loadApps = async () => {
    setLoading(true);
    try {
      // Load all available apps
      const appsResponse = await http.get(APIS.LIST_APPS);
      const apps = appsResponse.data || [];
      setAllApps(apps);

      // Load user's current apps
      const userAppsResponse = await http.get(`${APIS.GET_USER_APPS}/${userId}`);
      const userAppsData = userAppsResponse.data || [];
      
      // Extract app names from user apps (handle both string array and object array)
      const appNames = Array.isArray(userAppsData) 
        ? userAppsData.map((app: any) => typeof app === 'string' ? app : (app.appName || app.name || app))
        : [];
      
      setUserApps(appNames);
    } catch (error: any) {
      // Silently fail or show error based on status
      if (error.response?.status !== 403) {
        message.error(error.response?.data?.message || "Failed to load apps");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppToggle = async (appName: string, checked: boolean) => {
    setUpdating(true);
    try {
      if (checked) {
        // Add app to user
        await http.post(`${APIS.ADD_APP_TO_USER}/${userId}/add`, { app: appName });
        setUserApps((prev) => [...prev, appName]);
        message.success(`${appName} added successfully`);
      } else {
        // Remove app from user
        await http.post(`${APIS.REMOVE_APP_FROM_USER}/${userId}/remove`, { app: appName });
        setUserApps((prev) => prev.filter((a) => a !== appName));
        message.success(`${appName} removed successfully`);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to update ${appName}`);
      // Revert the change by reloading
      loadApps();
    } finally {
      setUpdating(false);
    }
  };

  const getAppColor = (app: string): string => {
    const colors: Record<string, string> = {
      LOAN: 'blue',
      HRM: 'green',
      POS: 'orange',
      SHOP: 'purple',
    };
    return colors[app.toUpperCase()] || 'default';
  };

  const getAppName = (app: AppData): string => {
    return app.appName || app.name || String(app);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '32px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card
      title={
        <span>
          <AppstoreAddOutlined style={{ marginRight: 8 }} />
          Application Access
        </span>
      }
      style={{ marginBottom: 16 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ color: '#8c8c8c', marginBottom: 16 }}>
          Select the applications this user can access:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {allApps.map((app) => {
            const appName = getAppName(app);
            return (
              <div
                key={app.id || appName}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  border: '1px solid #d9d9d9',
                  borderRadius: 8,
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Checkbox
                    checked={userApps.includes(appName)}
                    onChange={(e) => handleAppToggle(appName, e.target.checked)}
                    disabled={updating}
                  />
                  <Tag color={getAppColor(appName)}>{appName}</Tag>
                </div>
              </div>
            );
          })}
        </div>
        {allApps.length === 0 && (
          <div style={{ textAlign: 'center', padding: 16, color: '#8c8c8c' }}>
            No applications available
          </div>
        )}
        {userApps.length === 0 && allApps.length > 0 && (
          <div style={{ textAlign: 'center', padding: 16, color: '#8c8c8c' }}>
            No applications assigned yet
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserAppManagement;
