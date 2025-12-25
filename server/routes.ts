import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema, insertOrderSchema } from "@shared/schema";
import { seed } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  setupAuth(app);
  
  // Seed data
  try {
    await seed();
  } catch (err) {
    console.error("Seeding failed:", err);
  }

  // Products
  app.get(api.products.list.path, async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    // Only admin usually, but for MVP open or check role
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  // Orders
  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role === "admin") {
      const orders = await storage.getOrders();
      res.json(orders);
    } else {
      const orders = await storage.getOrdersByUser(user.id);
      res.json(orders);
    }
  });

  app.get(api.orders.my.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const orders = await storage.getOrdersByUser(user.id);
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const order = await storage.createOrder(parsed.data);
    res.status(201).json(order);
  });

  // Categories
  app.get(api.categories.list.path, async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Password Reset
  app.post("/api/verify-reset", async (req, res) => {
    const { username, email, phone } = req.body;
    if (!username || !email || !phone) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }
    const user = await storage.verifyUserForReset(username, email, phone);
    if (!user) {
      return res.status(404).json({ message: "المعلومات غير متطابقة" });
    }
    res.json({ id: user.id });
  });

  app.post("/api/reset-password", async (req, res) => {
    const { id, password } = req.body;
    if (!id || !password) {
      return res.status(400).json({ message: "بيانات غير مكتملة" });
    }
    await storage.updateUserPassword(id, password);
    res.json({ message: "تم تحديث كلمة المرور بنجاح" });
  });

  return httpServer;
}
