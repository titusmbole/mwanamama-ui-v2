import type { NavItem } from "../types/types";

import {
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  DollarCircleOutlined,
  DashboardOutlined,
  PlusOutlined,
  PieChartOutlined,
  CalendarOutlined,
  AccountBookOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { MessageCircle } from "lucide-react";

export const navItems: NavItem[] = [
  // ================= Dashboard =================
  {
    icon: <DashboardOutlined />,
    name: "Dashboard",
    path: "/dashboard",
  },

  // ================= Onboarding =================
  {
    name: "Onboarding",
    icon: <PlusOutlined />,
    subItems: [
      { name: "Branches", path: "/branches", pro: false },
      { name: "Groups", path: "/groups", pro: false },
    ],
  },

  // ================= Bulk Actions =================
  {
    name: "Bulk Actions",
    icon: <PieChartOutlined />,
    subItems: [
      { name: "Deposit Sheet", path: "/collections", pro: false },
      { name: "Collection Sheet", path: "/collection/add", pro: false },
      { name: "Loans", path: "/loans", pro: false },
      { name: "Manual Repayment", path: "/manual", pro: false },
      { name: "EMI Calculator", path: "/EMI", pro: false },
    ],
  },

  // ================= Payments =================
  {
    name: "Payments",
    icon: <DollarCircleOutlined />,
    subItems: [
      { name: "All Payments", path: "/payments/all", pro: false },
      { name: "Suspended Accounts", path: "/payments/suspended", pro: false },
    ],
  },

  // ================= Accounts =================
  {
    name: "Accounts",
    icon: <AccountBookOutlined />,
    subItems: [
      { name: "Down Payments", path: "/accounts/savings", pro: false },
      { name: "Loan Accounts", path: "/accounts/loans", pro: false },
    ],
  },

  // ================= User Management =================
  {
    name: "User Management",
    icon: <UserSwitchOutlined />,
    subItems: [
      { name: "Users", path: "/users/all", pro: false },
      { name: "Roles & Permissions", path: "/users/roles", pro: false },
      { name: "Audit", path: "/users/audit", pro: false },
    ],
  },

  // ================= SMS =================
  {
    icon: <MessageCircle />,
    name: "SMS",
    path: "/sms",
  },

  // ================= Calendar =================
  {
    icon: <CalendarOutlined />,
    name: "Calendar",
    path: "/calendar",
  },

  // ================= Reports =================
  {
    name: "Reports",
    icon: <BarChartOutlined />,
    subItems: [
      { name: "Clients", path: "/report/clients", pro: false },
      { name: "Dues", path: "/report/loans/due", pro: false },
      { name: "Arrears", path: "/report/loans/arrears", pro: false },
      { name: "Branch Performance", path: "/report/BranchPerformance", pro: false },
    ],
  },
];

// ================= Other Items (Bottom Settings) =================
export const othersItems: NavItem[] = [
  {
    icon: <SettingOutlined />,
    name: "Settings",
    path: "/settings",
  },
];