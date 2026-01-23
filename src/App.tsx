// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "../src/components/common/Layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Branches from "./pages/Onboarding/Branches";
import Groups from "./pages/Onboarding/Groups";
import AddGroupMembers from "./pages/Onboarding/AddGroupMembers";
import ViewGroupMembers from "./pages/Onboarding/ViewGroupMembers";
import DepositSheet from "./pages/BulkActions/DepositSheet";
import CollectionSheet from "./pages/BulkActions/CollectionSheet";
import Loans from "./pages/BulkActions/Loans";
import ManualRepayment from "./pages/BulkActions/ManualRepayment";
import EMICalculator from "./pages/BulkActions/EMICalculator";
import AllPayments from "./pages/Payments/AllPayments";
import SuspendedAccounts from "./pages/Payments/SuspendedAccounts";
import DownPayments from "./pages/Accounts/DownPayments";
import LoanAccounts from "./pages/Accounts/LoanAccounts";
import Users from "./pages/UserManagement/Users";
import RolesAndPermissions from "./pages/UserManagement/RolesAndPermissions";
import Audit from "./pages/UserManagement/Audit";
import SMS from "./pages/SMS/SMS";
import Calendar from "./pages/Calendar/Calendar";
import ClientsReport from "./pages/Reports/ClientsReport";
import DuesReport from "./pages/Reports/DuesReport";
import ArrearsReport from "./pages/Reports/ArrearsReport";
import BranchPerformanceReport from "./pages/Reports/BranchPerformanceReport";
import ProfitAndLossReport from "./pages/Reports/ProfitAndLossReport";
import SalesPerformanceReport from "./pages/Reports/SalesPerformanceReport";
import Settings from "./pages/Settings/Settings";
import NotFound from "./pages/NotFound/NotFound";

// Inventory Pages
import ProductCatalog from "./pages/Inventory/ProductCatalog";
import Categories from "./pages/Inventory/Categories";
import StockAdjustments from "./pages/Inventory/StockAdjustments";
import Brands from "./pages/Inventory/Brands";
import Suppliers from "./pages/Inventory/Suppliers";
import Purchases from "./pages/Inventory/Purchases";
import Orders from "./pages/Inventory/Orders";

// Online Sales Pages
import Sales from "./pages/OnlineSales/Sales";
import Customers from "./pages/OnlineSales/Customers";

// Motor Bikes Pages
import MotorbikeModels from "./pages/MotorBikes/Models";
import MotorBikesList from "./pages/MotorBikes/MotorBikes";
import SpareParts from "./pages/MotorBikes/SpareParts";

// Public/Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPassword from "./pages/auth/ForgotPassword";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public / Auth routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes wrapped with Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Onboarding */}
            <Route path="branches" element={<Branches />} />
            <Route path="groups" element={<Groups />} />
            <Route path="group/add-members" element={<AddGroupMembers />} />
            <Route path="group/members" element={<ViewGroupMembers />} />

            {/* Bulk Actions */}
            <Route path="collections" element={<DepositSheet />} />
            <Route path="collection/add" element={<CollectionSheet />} />
            <Route path="loans" element={<Loans />} />
            <Route path="manual" element={<ManualRepayment />} />
            <Route path="emi" element={<EMICalculator />} />

            {/* Payments */}
            <Route path="payments/all" element={<AllPayments />} />
            <Route path="payments/suspended" element={<SuspendedAccounts />} />

            {/* Accounts */}
            <Route path="accounts/savings" element={<DownPayments />} />
            <Route path="accounts/loans" element={<LoanAccounts />} />

            {/* Inventory */}
            <Route path="products" element={<ProductCatalog />} />
            <Route path="categories" element={<Categories />} />
            <Route path="stocks" element={<StockAdjustments />} />
            <Route path="brands" element={<Brands />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="orders" element={<Orders />} />

            {/* Online Sales */}
            <Route path="sales/sale" element={<Sales />} />
            <Route path="individual/customer" element={<Customers />} />

            {/* Motor Bikes */}
            <Route path="bike/models" element={<MotorbikeModels />} />
            <Route path="bike/list" element={<MotorBikesList />} />
            <Route path="bike/spare" element={<SpareParts />} />

            {/* User Management */}
            <Route path="users/all" element={<Users />} />
            <Route path="users/roles" element={<RolesAndPermissions />} />
            <Route path="users/audit" element={<Audit />} />

            {/* Direct Pages */}
            <Route path="sms" element={<SMS />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<Settings />} />

            {/* Reports */}
            <Route path="report/clients" element={<ClientsReport />} />
            <Route path="report/loans/due" element={<DuesReport />} />
            <Route path="report/loans/arrears" element={<ArrearsReport />} />
            <Route path="report/profit-and-loss" element={<ProfitAndLossReport />} />
            <Route path="report/BranchPerformance" element={<BranchPerformanceReport />} />
            <Route path="report/SalesPerformance" element={<SalesPerformanceReport />} />
          </Route>

          {/* 404 - public fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
