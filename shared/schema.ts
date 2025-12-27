import { z } from "zod";

// Enums and Types
export const userRoles = ["admin", "employee", "customer", "support"] as const;
export type UserRole = typeof userRoles[number];

export const employeePermissions = [
  "orders.view", "orders.edit", "orders.refund",
  "products.view", "products.edit",
  "customers.view", "wallet.adjust",
  "reports.view", "staff.manage",
  "pos.access", "settings.manage"
] as const;
export type EmployeePermission = typeof employeePermissions[number];

export const orderStatuses = ["new", "processing", "shipped", "completed", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];

export const orderTypes = ["online", "pos"] as const;
export type OrderType = typeof orderTypes[number];

// User Schema
export const insertUserSchema = z.object({
  name: z.string().min(1, "اسم العميل مطلوب"),
  phone: z.string().regex(/^5\d{8}$/, "رقم الهاتف يجب أن يبدأ بـ 5 ويتكون من 9 أرقام"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().optional().default(""),
  role: z.enum(userRoles).default("customer"),
  permissions: z.array(z.string()).default([]),
  branchId: z.string().optional(),
  loginType: z.enum(["dashboard", "pos", "both"]).default("dashboard"),
  isActive: z.boolean().default(true),
  username: z.string().optional(),
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
export type User = InsertUser & { _id: string; id: string; createdAt: Date; __v?: number };

// Cash Shift Schema
export const insertCashShiftSchema = z.object({
  branchId: z.string(),
  cashierId: z.string(),
  status: z.enum(["open", "closed"]).default("open"),
  openingBalance: z.number(),
  closingBalance: z.number().optional(),
  actualCash: z.number().optional(),
  difference: z.number().optional(),
  openedAt: z.date().optional(),
  closedAt: z.date().optional(),
});

export type InsertCashShift = z.infer<typeof insertCashShiftSchema>;
export type CashShift = InsertCashShift & { _id: string; id: string };

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
    cost: z.number().default(0), // COGS per SKU
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
  type: z.enum(orderTypes).default("online"),
  branchId: z.string().optional(),
  cashierId: z.string().optional(),
  total: z.string(),
  subtotal: z.string(),
  vatAmount: z.string(),
  shippingCost: z.string(),
  tapCommission: z.string(),
  netProfit: z.string(),
  couponCode: z.string().optional(),
  discountAmount: z.string().default("0"),
  items: z.array(z.object({
    productId: z.string(),
    variantSku: z.string(),
    quantity: z.number(),
    price: z.number(),
    cost: z.number(), // Added cost per item at time of purchase
    title: z.string(),
  })),
  shippingMethod: z.enum(["pickup", "delivery"]),
  shippingAddress: z.object({
    city: z.string().optional(),
    street: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  pickupBranch: z.string().optional(),
  paymentMethod: z.enum(["cod", "bank_transfer", "apple_pay", "card", "cash", "wallet"]),
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

// Branch Schema
export const insertBranchSchema = z.object({
  name: z.string().min(1, "اسم الفرع مطلوب"),
  location: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = InsertBranch & { _id: string; id: string };

// Banner Schema
export const insertBannerSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  image: z.string().min(1, "الصورة مطلوبة"),
  link: z.string().optional(),
  type: z.enum(["banner", "popup"]).default("banner"),
  isActive: z.boolean().default(true),
});

export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = InsertBanner & { _id: string; id: string };

// Branch Inventory Schema
export const insertBranchInventorySchema = z.object({
  branchId: z.string(),
  productId: z.string(),
  variantSku: z.string(),
  stock: z.number().default(0),
  minStockLevel: z.number().default(5),
});

export type InsertBranchInventory = z.infer<typeof insertBranchInventorySchema>;
export type BranchInventory = InsertBranchInventory & { _id: string; id: string; updatedAt: Date };

// API Types
export type LoginRequest = { username: string; password: string };
export type AuthResponse = User;
