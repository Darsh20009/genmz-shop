/**
 * Permission Hook
 * Frontend permission checking
 */

import { useAuth } from "./use-auth";

export function usePermission() {
  const { user } = useAuth();

  const hasPermission = (permission: string | string[]): boolean => {
    if (!user) return false;

    // Super admin has all permissions
    if (user.role === "admin") return true;

    const permissions = Array.isArray(permission) ? permission : [permission];
    const userPerms = user.permissions || [];

    return permissions.every((perm) => userPerms.includes(perm));
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;

    const userPerms = user.permissions || [];
    return permissions.some((perm) => userPerms.includes(perm));
  };

  const isCashier = user?.role === "cashier";
  const isAccountant = user?.role === "accountant";
  const isSupport = user?.role === "support";
  const isAdmin = user?.role === "admin";
  const isEmployee = ["admin", "employee", "cashier", "accountant", "support"].includes(
    user?.role || ""
  );

  return {
    hasPermission,
    hasAnyPermission,
    isCashier,
    isAccountant,
    isSupport,
    isAdmin,
    isEmployee,
    user,
  };
}
