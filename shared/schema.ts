import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums and Types
export const userRoles = ["admin", "employee", "customer", "support"] as const;
export type UserRole = typeof userRoles[number];

export const orderStatuses = ["new", "processing", "shipped", "completed", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Hashed
  role: text("role", { enum: userRoles }).default("customer").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  walletBalance: decimal("wallet_balance").default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products Table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price").notNull(),
  cost: decimal("cost").notNull(), // For accounting
  images: text("images").array().notNull(), // Array of image URLs
  categoryId: integer("category_id"), // Relation to categories
  // Variants stored as JSONB for flexibility (color, size, sku, stockQty)
  // Example: [{ color: "Red", size: "M", sku: "SKU-123", stock: 10 }]
  variants: jsonb("variants").$type<{ color: string; size: string; sku: string; stock: number }[]>().default([]).notNull(),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

// Orders Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Relation to users
  status: text("status", { enum: orderStatuses }).default("new").notNull(),
  total: decimal("total").notNull(),
  // Items snapshot: [{ productId: 1, variantSku: "SKU-123", qty: 2, price: 50 }]
  items: jsonb("items").$type<{ productId: number; variantSku: string; quantity: number; price: number; title: string }[]>().notNull(),
  shippingMethod: text("shipping_method").notNull(), // "pickup", "delivery"
  shippingAddress: jsonb("shipping_address"), // { city, street, ... }
  paymentMethod: text("payment_method").notNull(), // "cod", "bank_transfer", "apple_pay", "card"
  paymentStatus: text("payment_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, walletBalance: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true, paymentStatus: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Category = typeof categories.$inferSelect;

// Specific API Types
export type LoginRequest = { username: string; password: string };
export type AuthResponse = User;
