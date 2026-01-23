import React, { useEffect } from "react";
import { useNotificationSetup } from "../utils/Notif";

interface NotificationProviderProps {
  children: React.ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  useNotificationSetup();
  
  return <>{children}</>;
};

export default NotificationProvider;
