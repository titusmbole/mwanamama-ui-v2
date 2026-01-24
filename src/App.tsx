// src/App.tsx
import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { message, ConfigProvider } from "antd";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "../src/components/common/Layout/Layout";
import PageLoader from "./components/common/PageLoader";
import NotificationProvider from "./context/NotificationProvider";
import { useNProgress } from "./utils/nprogress";

// Eager load critical pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import OtpVerification from "./pages/auth/OtpVerification";
import NotFound from "./pages/NotFound/NotFound";

// Lazy load error pages
const ServerError = lazy(() => import("./pages/ErrorPages/ServerError"));
const Unauthorized = lazy(() => import("./pages/ErrorPages/Unauthorized"));

// Lazy load main pages
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Branches = lazy(() => import("./pages/Onboarding/Branches"));
const Groups = lazy(() => import("./pages/Onboarding/Groups"));
const AddGroupMembers = lazy(() => import("./pages/Onboarding/AddGroupMembers"));
const ViewGroupMembers = lazy(() => import("./pages/Onboarding/ViewGroupMembers"));
const DepositSheet = lazy(() => import("./pages/BulkActions/DepositSheet"));
const CollectionSheet = lazy(() => import("./pages/BulkActions/CollectionSheet"));
const Loans = lazy(() => import("./pages/BulkActions/Loans"));
const ManualRepayment = lazy(() => import("./pages/BulkActions/ManualRepayment"));
const EMICalculator = lazy(() => import("./pages/BulkActions/EMICalculator"));
const AllPayments = lazy(() => import("./pages/Payments/AllPayments"));
const SuspendedAccounts = lazy(() => import("./pages/Payments/SuspendedAccounts"));
const DownPayments = lazy(() => import("./pages/Accounts/DownPayments"));
const LoanAccounts = lazy(() => import("./pages/Accounts/LoanAccounts"));
const Users = lazy(() => import("./pages/UserManagement/Users"));
const RolesAndPermissions = lazy(() => import("./pages/UserManagement/RolesAndPermissions"));
const Audit = lazy(() => import("./pages/UserManagement/Audit"));
const SMS = lazy(() => import("./pages/SMS/SMS"));
const Calendar = lazy(() => import("./pages/Calendar/Calendar"));
const ClientsReport = lazy(() => import("./pages/Reports/ClientsReport"));
const DuesReport = lazy(() => import("./pages/Reports/DuesReport"));
const ArrearsReport = lazy(() => import("./pages/Reports/ArrearsReport"));
const BranchPerformanceReport = lazy(() => import("./pages/Reports/BranchPerformanceReport"));
const ProfitAndLossReport = lazy(() => import("./pages/Reports/ProfitAndLossReport"));
const SalesPerformanceReport = lazy(() => import("./pages/Reports/SalesPerformanceReport"));
const Settings = lazy(() => import("./pages/Settings/Settings"));

// Lazy load Inventory Pages
const ProductCatalog = lazy(() => import("./pages/Inventory/ProductCatalog"));
const Categories = lazy(() => import("./pages/Inventory/Categories"));
const StockAdjustments = lazy(() => import("./pages/Inventory/StockAdjustments"));
const Brands = lazy(() => import("./pages/Inventory/Brands"));
const Suppliers = lazy(() => import("./pages/Inventory/Suppliers"));
const Purchases = lazy(() => import("./pages/Inventory/Purchases"));
const Orders = lazy(() => import("./pages/Inventory/Orders"));

// Lazy load Online Sales Pages
const Sales = lazy(() => import("./pages/OnlineSales/Sales"));
const Customers = lazy(() => import("./pages/OnlineSales/Customers"));

const App: React.FC = () => {
  // Use NProgress for route changes
  useNProgress();
  
  // Configure global message settings
  useEffect(() => {
    message.config({
      top: 80,
      duration: 3, 
      maxCount: 3,
    });
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ac202d',
          colorLink: '#ac202d',
          colorSuccess: '#ac202d',
        },
      }}
    >
      <AuthProvider>
        <NotificationProvider> 
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public / Auth routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/auth/verify-otp" element={<OtpVerification />} />

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

                  {/* Error Pages - inside layout to show sidebar and appbar */}
                  <Route path="500" element={<ServerError />} />
                  <Route path="unauthorized" element={<Unauthorized />} />

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
      </Suspense>
      </Router>
      </NotificationProvider>
    </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
