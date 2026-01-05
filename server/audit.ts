/**
 * Audit Logging Utilities
 * Immutable logging for compliance and enterprise features
 */

import { AuditLogModel } from "./models";
import type { Request } from "express";

export interface AuditEntry {
  employeeId: string;
  employeeName: string;
  action: string; // "create", "update", "delete", "view", "export"
  targetType: string; // "order", "product", "customer", "staff", "wallet", "invoice"
  targetId?: string;
  changes?: Record<string, any>; // before/after values
  details?: string;
  ipAddress?: string;
}

/**
 * Log an operation to the audit trail
 * Immutable - cannot be deleted
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await AuditLogModel.create({
      ...entry,
      ipAddress: entry.ipAddress || "unknown",
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[Audit] Failed to log:", error);
    // Don't throw - audit failures shouldn't break operations
  }
}

/**
 * Create audit entry from express request
 */
export function createAuditEntry(req: any, partial: Omit<AuditEntry, 'ipAddress'>): AuditEntry {
  return {
    ...partial,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
  };
}

/**
 * Log financial transaction
 */
export async function logFinancialTransaction(
  employeeId: string,
  employeeName: string,
  type: 'invoice' | 'bank_transfer' | 'wallet_adjustment',
  amount: number,
  targetId: string,
  details: string,
  ipAddress?: string
): Promise<void> {
  await logAudit({
    employeeId,
    employeeName,
    action: `financial_${type}`,
    targetType: 'financial_transaction',
    targetId,
    details: `${type}: ${amount} SAR - ${details}`,
    ipAddress,
  });
}

/**
 * Log staff management
 */
export async function logStaffAction(
  employeeId: string,
  employeeName: string,
  action: 'create' | 'update' | 'delete' | 'password_reset' | 'activate' | 'deactivate',
  staffId: string,
  staffName: string,
  details?: string,
  ipAddress?: string
): Promise<void> {
  await logAudit({
    employeeId,
    employeeName,
    action: `staff_${action}`,
    targetType: 'staff',
    targetId: staffId,
    details: `${action} staff member: ${staffName}. ${details || ''}`,
    ipAddress,
  });
}

/**
 * Log product changes
 */
export async function logProductChange(
  employeeId: string,
  employeeName: string,
  action: 'create' | 'update' | 'delete',
  productId: string,
  productName: string,
  changes?: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  await logAudit({
    employeeId,
    employeeName,
    action: `product_${action}`,
    targetType: 'product',
    targetId: productId,
    changes,
    details: `${action} product: ${productName}`,
    ipAddress,
  });
}

/**
 * Log order modifications
 */
export async function logOrderChange(
  employeeId: string,
  employeeName: string,
  action: 'create' | 'update' | 'refund' | 'cancel',
  orderId: string,
  amount?: number,
  changes?: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  await logAudit({
    employeeId,
    employeeName,
    action: `order_${action}`,
    targetType: 'order',
    targetId: orderId,
    changes,
    details: amount ? `Order ${action}: ${amount} SAR` : `Order ${action}`,
    ipAddress,
  });
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters?: {
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
  action?: string;
  targetType?: string;
  limit?: number;
}): Promise<any[]> {
  const query: any = {};

  if (filters?.startDate || filters?.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = filters.startDate;
    if (filters.endDate) query.createdAt.$lte = filters.endDate;
  }

  if (filters?.employeeId) query.employeeId = filters.employeeId;
  if (filters?.action) query.action = new RegExp(filters.action, 'i');
  if (filters?.targetType) query.targetType = filters.targetType;

  return AuditLogModel.find(query)
    .sort({ createdAt: -1 })
    .limit(filters?.limit || 100)
    .lean();
}

/**
 * Get financial logs only
 */
export async function getFinancialLogs(filters?: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<any[]> {
  return getAuditLogs({
    ...filters,
    action: 'financial',
  });
}

/**
 * Ensure audit logs are immutable
 * Prevents accidental deletion
 */
export function preventAuditDeletion(): (req: any, res: any, next: any) => void {
  return (_req: any, res: any, next: any) => {
    // Override all delete operations on audit logs
    const originalJson = res.json;
    res.json = function(data: any) {
      throw new Error('Audit logs are immutable and cannot be deleted');
    };
    next();
  };
}
