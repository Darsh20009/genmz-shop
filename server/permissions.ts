/**
 * Permission System Utilities
 * Granular permission checking and management
 */

export const PERMISSIONS = {
  // Orders
  ORDERS_VIEW: "orders.view",
  ORDERS_EDIT: "orders.edit",
  ORDERS_REFUND: "orders.refund",

  // Products
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_EDIT: "products.edit",

  // Customers
  CUSTOMERS_VIEW: "customers.view",

  // Wallet
  WALLET_ADJUST: "wallet.adjust",

  // Reporting
  REPORTS_VIEW: "reports.view",

  // Staff
  STAFF_MANAGE: "staff.manage",

  // POS
  POS_ACCESS: "pos.access",

  // Settings
  SETTINGS_MANAGE: "settings.manage",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Preset role definitions with their permissions
 */
export const PRESET_ROLES = {
  super_admin: {
    name: "Super Admin",
    description: "Full system access",
    permissions: Object.values(PERMISSIONS),
    isSystem: true,
  },
  admin: {
    name: "Admin",
    description: "Store owner/operator",
    permissions: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_EDIT,
      PERMISSIONS.ORDERS_REFUND,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_EDIT,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.WALLET_ADJUST,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.STAFF_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.POS_ACCESS,
    ],
    isSystem: true,
  },
  branch_manager: {
    name: "Branch Manager",
    description: "Manages single branch",
    permissions: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_EDIT,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.POS_ACCESS,
    ],
    isSystem: true,
  },
  cashier: {
    name: "Cashier",
    description: "Point of Sale operator",
    permissions: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_EDIT,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.POS_ACCESS,
      PERMISSIONS.WALLET_ADJUST,
    ],
    isSystem: true,
  },
  accountant: {
    name: "Accountant",
    description: "Financial reporting",
    permissions: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.WALLET_ADJUST,
    ],
    isSystem: true,
  },
  support: {
    name: "Support",
    description: "Customer support team",
    permissions: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.WALLET_ADJUST,
    ],
    isSystem: true,
  },
} as const;

/**
 * Check if user has required permission
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: Permission | Permission[]
): boolean {
  const permissions = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  return permissions.every((perm) => userPermissions.includes(perm));
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((perm) =>
    userPermissions.includes(perm)
  );
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(
  roleName: string
): Permission[] {
  const role = PRESET_ROLES[roleName as keyof typeof PRESET_ROLES];
  return role?.permissions || [];
}

/**
 * Validate permission exists
 */
export function isValidPermission(permission: string): permission is Permission {
  return Object.values(PERMISSIONS).includes(permission as Permission);
}

/**
 * Get human-readable permission label
 */
export function getPermissionLabel(permission: Permission): string {
  const labels: Record<Permission, string> = {
    "orders.view": "عرض الطلبات",
    "orders.edit": "تعديل الطلبات",
    "orders.refund": "استرجاع الأموال",
    "products.view": "عرض المنتجات",
    "products.edit": "تعديل المنتجات",
    "customers.view": "عرض العملاء",
    "wallet.adjust": "تعديل المحفظة",
    "reports.view": "عرض التقارير",
    "staff.manage": "إدارة الموظفين",
    "pos.access": "الوصول للنقطة البيعية",
    "settings.manage": "إدارة الإعدادات",
  };

  return labels[permission] || permission;
}
