import { z } from "zod";

// Enums and Types
export const userRoles = ["admin", "employee", "customer", "support"] as const;
export type UserRole = typeof userRoles[number];

export const employeePermissions = ["orders", "products", "support", "accounting", "customers"] as const;
export type EmployeePermission = typeof employeePermissions[number];

export const orderStatuses = ["new", "processing", "shipped", "completed", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];

// User Schema
export const insertUserSchema = z.object({
  name: z.string().min(1, "اسم العميل مطلوب"),
  phone: z.string().min(10, "رقم الهاتف غير صحيح"),
  password: z.string().optional().default(""),
  role: z.enum(userRoles).default("customer"),
  permissions: z.array(z.enum(employeePermissions)).default([]),
  username: z.string().optional(),
  email: z.string().optional(),
  walletBalance: z.string().default("0"),
  addresses: z.array(z.object({
    id: z.string(),
    name: z.string(),
    city: z.string(),
    street: z.string(),
    isDefault: z.boolean().default(false),
  })).default([]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = InsertUser & { _id: string; id: string; createdAt: Date };

// Employee Activity Log
export const insertActivityLogSchema = z.object({
  employeeId: z.string(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string().optional(),
  details: z.string().optional(),
  createdAt: z.date().optional(),
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = InsertActivityLog & { _id: string; id: string; createdAt: Date };

// Coupon Schema
export const insertCouponSchema = z.object({
  code: z.string().min(1),
  type: z.enum(["percentage", "fixed"]),
  value: z.number(),
  expiryDate: z.date().optional(),
  usageLimit: z.number().optional(),
  perUserLimit: z.number().default(1),
  minOrderAmount: z.number().optional(),
  targetCategoryIds: z.array(z.string()).default([]),
  targetProductIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = InsertCoupon & { _id: string; id: string; usageCount: number };

// Product Schema
export const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.string(),
  cost: z.string(),
  images: z.array(z.string()),
  categoryId: z.string().optional(),
  variants: z.array(z.object({
    color: z.string(),
    size: z.string(),
    sku: z.string(),
    stock: z.number(),
  })).default([]),
  isFeatured: z.boolean().default(false),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = InsertProduct & { _id: string; id: string; createdAt: Date };

// Category Schema
export const insertCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = InsertCategory & { _id: string; id: string };

// Order Schema
export const insertOrderSchema = z.object({
  userId: z.string(),
  total: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    variantSku: z.string(),
    quantity: z.number(),
    price: z.number(),
    title: z.string(),
  })),
  shippingMethod: z.enum(["pickup", "delivery"]),
  shippingAddress: z.object({
    city: z.string().optional(),
    street: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  pickupBranch: z.string().optional(),
  paymentMethod: z.enum(["cod", "bank_transfer", "apple_pay", "card"]),
  bankTransferReceipt: z.string().optional(),
  status: z.enum(orderStatuses).default("new"),
  paymentStatus: z.enum(["pending", "paid", "refunded"]).default("pending"),
  shippingProvider: z.string().optional(), // e.g., "Storage Station"
  trackingNumber: z.string().optional(),
  returnRequest: z.object({
    status: z.enum(["none", "pending", "approved", "rejected"]).default("none"),
    reason: z.string().optional(),
    type: z.enum(["return", "exchange"]).optional(),
    createdAt: z.date().optional(),
  }).optional(),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = InsertOrder & {
  _id: string;
  id: string;
  status: OrderStatus;
  paymentStatus: string;
  createdAt: Date;
};

// Wallet Transaction Schema
export const insertWalletTransactionSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  type: z.enum(["deposit", "withdrawal", "payment", "refund"]),
  description: z.string(),
  createdAt: z.date().optional(),
});

export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = InsertWalletTransaction & { _id: string; id: string; createdAt: Date };

// API Types
export type LoginRequest = { username: string; password: string };
export type AuthResponse = User;
