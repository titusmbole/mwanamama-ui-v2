import { BASE_URL } from "../config/api.config";

export const APIS = {
  // ================== AUTH ==================
  LOGIN: `${BASE_URL}/auth/login`,
  LOGIN_ACTIVITIES: `${BASE_URL}/auth/login-activities`,
  UPDATE_PROFILE: `${BASE_URL}/settings/update-profile`,
  CHANGE_PASSWORD: `${BASE_URL}/settings/change-password`,
  CREATE_BRANCH: `${BASE_URL}/branches/create`,
  ROLES: `${BASE_URL}/users/roles`,
  ALL_PERMISSONS: `${BASE_URL}/users/permissions`,
  ROLE_PERMISSONS: `${BASE_URL}/users/role/permissions/`,
  ROLE_PERMISSONS_UPDATE: `${BASE_URL}/users/role/permissions/update/`,

  // ================== GROUPS & CLIENTS ==================
  CREATE_GROUP: `${BASE_URL}/groups/create`,
  CREATE_BULK_CLIENTS: `${BASE_URL}/clients/bulk-create`,
  LOAD_GROUPS: `${BASE_URL}/groups/list`,
  LOAD_GROUPS_UNPAGINATED: `${BASE_URL}/groups/unpaginated`,
  LOAD_GROUPS_INFO: `${BASE_URL}/groups/collection/info`,
  LOAD_GROUP_MEMBERS: `${BASE_URL}/groups/members`,
  UPDATE_GROUP: `${BASE_URL}/groups/update`,
  ACTIVATE_DEACTIVATE_GROUP: `${BASE_URL}/groups/activate-deactivate`,
  APPROVE_GROUP: `${BASE_URL}/groups/verify`,
  LOAD_UNPAGINATED_CUSTOMERS: `${BASE_URL}/clients/unpaginated`,
  UPDATE_MEMBER: `${BASE_URL}/clients/update`,
  AVAILABLE_CLIENTS: `${BASE_URL}/clients/available`,
  ADD_GROUP_MEMBERS: `${BASE_URL}/groups/members/add`,
  GROUP_MEMBERS: `${BASE_URL}/groups/members`,
  REMOVE_GROUP_MEMBER: `${BASE_URL}/groups/members/remove`,

  // ================== PRODUCTS & CATEGORIES ==================
  LOAD_CATEGORIES: `${BASE_URL}/categories`,
  LOAD_CATEGORIES_UNPAGINATED: `${BASE_URL}/categories/unpaginated`,
  LOAD_SUBCATEGORIES: `${BASE_URL}/subcategories`,
  DELETE_CATEGORIES: `${BASE_URL}/categories`,
  DELETE_SUBCATEGORIES: `${BASE_URL}/subcategories`,
  CREATE_CATEGORY: `${BASE_URL}/categories`,
  CREATE_SUBCATEGORY: `${BASE_URL}/subcategories`,
  UPDATE_CATEGORY: `${BASE_URL}/categories`,
  SEARCH_PRODUCT: `${BASE_URL}/products/search`,
  LOAD_PRODUCTS: `${BASE_URL}/products/list`,
  CREATE_PRODUCTS: `${BASE_URL}/products/create`,
  UPDATE_PRODUCTS: `${BASE_URL}/products/update`,
  DELETE_PRODUCTS: `${BASE_URL}/products/products`,

  // ================== STOCK ==================
  LOAD_STOCK: `${BASE_URL}/products/adjustments`,
  CREATE_STOCK: `${BASE_URL}/products/adjust/stock`,

  // ================== USERS ==================
  LOAD_USERS_UNPAGINATED: `${BASE_URL}/users/unpaginated`,
  LIST_USERS: `${BASE_URL}/users/list`,
  UPDATE_PASSWORD: `${BASE_URL}/users/password/update`,
  CREATE_USER: `${BASE_URL}/users/create`,
  UPDATE_USER: `${BASE_URL}/users/update`,
  ACTIVATEDEACTIVATE: `${BASE_URL}/users/activate-deactivate`,

  // ================== LOANS ==================
  CREATE_LOAN: `${BASE_URL}/loans/create`,
  LIST_LOANS: `${BASE_URL}/loans/list`,
  REPAY_LOAN: `${BASE_URL}/loans/repay`,
  UPDATE_STATUS: `${BASE_URL}/loans/update/status`,
  MANUAL_ELIGIBLES: `${BASE_URL}/loans/eligible`,

  // ================== COLLECTIONS ==================
  ALL_PAYMENTS: `${BASE_URL}/collections/payments`,
  ALLOCATE_PAYMENT: `${BASE_URL}/collections/allocate`,
  POST_COLLECTIONS: `${BASE_URL}/collections/post`,
  LOAD_COLLECTION_SHEETS: `${BASE_URL}/collections/sheets/list`,
  ADD_DEPOSIT: `${BASE_URL}/collections/deposit/`,
  ADD_REGISTRATION_FEE: `${BASE_URL}/collections/deposit/registration-fee`,

  // ================== BRANCHES ==================
  LOAD_BRANCHES: `${BASE_URL}/branches/list`,
  UNPAGINATED_BRANCHES: `${BASE_URL}/branches/unpaginated`,
  UPDATE_BRANCH: `${BASE_URL}/branches/update`,
  BRANCH_INFO: `${BASE_URL}/branches/`,

  // ================== MPESA ==================
  MPESA_TRANSACTIONS: `${BASE_URL}/mpesa/transactions`,
  MPESA_TRANSACTION_BY_CODE: `${BASE_URL}/mpesa/transactions/code`,
  VALIDATE_MPESA_TRANSACTION: `${BASE_URL}/mpesa/validate`,
  POST_COLLECTIONS_WITH_MPESA: `${BASE_URL}/collections/with-mpesa`,
  MPESA_WEBHOOK_CALLBACK: `${BASE_URL}/mpesa/callback`,
  MPESA_STK_PUSH: `${BASE_URL}/mpesa/stk-push`,
  MPESA_QUERY_STATUS: `${BASE_URL}/mpesa/query-status`,

  // ================== SMS ==================
  SEND_SMS: `${BASE_URL}/sms/send`,
  LOAD_SMS: `${BASE_URL}/sms`,

  // ================== REPORTS ==================
  CLIENTS_REPORT: `${BASE_URL}/report/clients`,
  CLIENT_DETAIL: `${BASE_URL}/report/clients`,
  LOANS_DUE_REPORT: `${BASE_URL}/report/loans/due`,
  LOANS_ARREARS_REPORT: `${BASE_URL}/report/loans/arrears`,
  PROFIT_AND_LOSS_REPORT: `${BASE_URL}/report/profit-and-loss`,

  // Sales Performance Reports
  SALES_PERFORMANCE_SUMMARY: `${BASE_URL}/report/branch/summary`,
  SALES_PERFORMANCE_BY_OFFICER: `${BASE_URL}/report/sales-performance/officers`,
  SALES_PERFORMANCE_BY_PRODUCT: `${BASE_URL}/report/sales-performance/products`,
  SALES_PERFORMANCE_BY_BRANCH: `${BASE_URL}/report/sales-performance/branches`,
  BRANCH_PERFORMANCE: `${BASE_URL}/report/branch/performance`,

  // ================== DASHBOARD ==================
  DASHBOARD: `${BASE_URL}/dashboard`,

  // ================== SUPPLIERS ==================
  CREATE_SUPPLIER: `${BASE_URL}/suppliers`,
  LIST_SUPPLIERS: `${BASE_URL}/suppliers`,
  LIST_SUPPLIERS_UNPAGINATED: `${BASE_URL}/suppliers/unpaginated`,
  UPDATE_SUPPLIER: `${BASE_URL}/suppliers`,
  DELETE_SUPPLIER: `${BASE_URL}/suppliers`,

  // ================== PURCHASES ==================
  LIST_PURCHASES: `${BASE_URL}/products/purchases`,
  CREATE_PURCHASE: `${BASE_URL}/products/purchase/add`,
  PURCHASE_UPDATE_STATUS: `${BASE_URL}/products/purchase/status/`,
  PURCHASE_ALLOCATE: `${BASE_URL}/products/purchase/allocate`,

  // ================== BRANDS ==================
  CREATE_BRANDS: `${BASE_URL}/brands`,
  LIST_BRANDS: `${BASE_URL}/brands`,
  LIST_BRANDS_UNPAGINATED: `${BASE_URL}/brands/unpaginated`,
  UPDATE_BRANDS: `${BASE_URL}/brands`,
  DELETE_BRANDS: `${BASE_URL}/brands`,

  // ================== ORDERS ==================
  LOAD_ORDERS: `${BASE_URL}/orders`,
  UPDATE_ORDER_STATUS: `${BASE_URL}/orders/update/status`,
  SET_ORDER_LOAN: `${BASE_URL}/orders/set/loan`,
  CREATE_LOAN_FROM_ORDER: `${BASE_URL}/loans/from-order`,

  // ================== INDIVIDUAL LOANS ==================
  CREATE_INDIVIDUAL_LOAN: `${BASE_URL}/loans/individual/create`,
  GET_INDIVIDUAL_LOANS: `${BASE_URL}/loans/individual/all`,
  CREATE_HIRE_PURCHASE: `${BASE_URL}/loans/hire/create`,
  GET_HIRE_PURCHASE_LOANS: `${BASE_URL}/loans/hire/all`,

  // ================== INDIVIDUAL CUSTOMERS ==================
  GET_CUSTOMERS: `${BASE_URL}/individual/customers`,
  CREATE_CUSTOMER: `${BASE_URL}/individual/customers`,
  GET_SALES: `${BASE_URL}/individual/customers/purchases`,

  // ================== AUDIT ==================
  AUDIT_TRAIL: `${BASE_URL}/audit`,
  DOWNLOAD_AUDIT_REPORT: `${BASE_URL}/audit/download`,

  // ================== SETTINGS ==================
  LOAD_BACKUPS: `${BASE_URL}/settings/backups`,
  RESTORE_BACKUP: `${BASE_URL}/settings/backups/restore/`,
  DELETE_BACKUP: `${BASE_URL}/settings/backups/`,

  // ================== MOTORBIKES ==================
  LIST_MOTOR_MODELS: `${BASE_URL}/motors/models`,
  CREATE_MOTOR_MODELS: `${BASE_URL}/motors/models`,
  UPDATE_MOTOR_MODELS: `${BASE_URL}/motors/models`,
  CREATE_MOTORBIKE: `${BASE_URL}/motors/create`,
  UPDATE_MOTORBIKE: `${BASE_URL}/motors/`,
  GET_MOTORBIKES: `${BASE_URL}/motors`,
  LOAD_MOTORBIKES: `${BASE_URL}/motors`,
  DELETE_MOTORBIKE: `${BASE_URL}/motors`,
  LOAD_MOTORBIKE_MODELS: `${BASE_URL}/motors/models`,
  CREATE_MOTORBIKE_MODEL: `${BASE_URL}/motors/models`,
  UPDATE_MOTORBIKE_MODEL: `${BASE_URL}/motors/models`,
  DELETE_MOTORBIKE_MODEL: `${BASE_URL}/motors/models`,

  // ================== SPARE PARTS ==================
  LIST_SPARE_PARTS: `${BASE_URL}/motors/spare-parts`,
  LOAD_SPARE_PARTS: `${BASE_URL}/motors/spare-parts/load`,
  CREATE_SPARE_PART: `${BASE_URL}/motors/spare-parts/create`,
  UPDATE_SPARE_PART: `${BASE_URL}/motors/spare-parts/update`,
  DELETE_SPARE_PART: `${BASE_URL}/motors/spare-parts/delete`,

  // ================== ONLINE SALES ==================
  LOAD_ONLINE_CUSTOMERS: `${BASE_URL}/online/customers`,
  CREATE_ONLINE_CUSTOMER: `${BASE_URL}/online/customers`,
  UPDATE_ONLINE_CUSTOMER: `${BASE_URL}/online/customers`,
  LOAD_ONLINE_SALES: `${BASE_URL}/online/sales`,
  ONLINE_SALES_STATS: `${BASE_URL}/online/sales/stats`,

  // ================== REPORTS ==================
  PROFIT_LOSS_REPORT: `${BASE_URL}/reports/profit-loss`,
  SALES_PERFORMANCE_REPORT: `${BASE_URL}/reports/sales-performance`,

  // ================== APP MANAGEMENT ==================
  LIST_APPS: `${BASE_URL}/apps/list`,
  GET_ALL_APPS: `${BASE_URL}/apps/list`,
  ADD_APP_TO_ROLE: `${BASE_URL}/apps/role`,
  REMOVE_APP_FROM_ROLE: `${BASE_URL}/apps/role`,
  ADD_APP_TO_USER: `${BASE_URL}/apps/user`,
  REMOVE_APP_FROM_USER: `${BASE_URL}/apps/user`,
  GET_USER_APPS: `${BASE_URL}/apps/user`,
  GET_ROLE_APPS: `${BASE_URL}/apps/role`,
  ASSIGN_ROLE_APPS: `${BASE_URL}/apps/role/assign`,
  ASSIGN_USER_APPS: `${BASE_URL}/apps/user/assign`,
};
