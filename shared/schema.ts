import { z } from "zod";

// Enums and Types
export const userRoles = ["admin", "employee", "customer", "support"] as const;
export type UserRole = typeof userRoles[number];

export const orderStatuses = ["new", "processing", "shipped", "completed", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];

// User Schema
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  role: z.enum(userRoles).default("customer"),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
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
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = InsertOrder & {
  _id: string;
  id: string;
  status: OrderStatus;
  paymentStatus: string;
  createdAt: Date;
};

// API Types
export type LoginRequest = { username: string; password: string };
export type AuthResponse = User;
