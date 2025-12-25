import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema, insertOrderSchema, insertCouponSchema } from "@shared/schema";
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

  app.patch("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const product = await storage.updateProduct(req.params.id, req.body);
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    await storage.deleteProduct(req.params.id);
    res.sendStatus(200);
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

  app.patch("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin") return res.sendStatus(403);
    
    const { status, shippingProvider, trackingNumber } = req.body;
    const order = await storage.updateOrderStatus(req.params.id, status, {
      provider: shippingProvider,
      tracking: trackingNumber
    });
    res.json(order);
  });

  app.patch("/api/orders/:id/return", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { returnRequest } = req.body;
    const order = await storage.updateOrderReturn(req.params.id, returnRequest);
    res.json(order);
  });

  // Categories API
  app.post("/api/categories", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const category = await storage.createCategory(req.body);
    res.json(category);
  });

  app.delete("/api/categories/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    await storage.deleteCategory(req.params.id);
    res.sendStatus(200);
  });

  // Categories
  app.get(api.categories.list.path, async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Password Reset
  app.post("/api/verify-reset", async (req, res) => {
    const { phone, name } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }
    const user = await storage.verifyUserForReset(phone, name);
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
    
    // Hash the new password before saving
    const { scrypt, randomBytes } = await import("crypto");
    const { promisify } = await import("util");
    const scryptAsync = promisify(scrypt);
    
    const salt = randomBytes(16).toString("hex");
    const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
    const hashedPassword = `${buffer.toString("hex")}.${salt}`;
    
    await storage.updateUserPassword(id, hashedPassword);
    res.json({ message: "تم تحديث كلمة المرور بنجاح" });
  });

  // Admin Stats
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin") return res.sendStatus(403);

    const orders = await storage.getOrders();
    const products = await storage.getProducts();

    const totalSales = orders.reduce((acc, order) => acc + Number(order.total), 0);
    const totalCost = orders.reduce((acc, order) => {
      return acc + order.items.reduce((itemAcc, item) => {
        const product = products.find(p => p.id === item.productId);
        return itemAcc + (Number(product?.cost || 0) * item.quantity);
      }, 0);
    }, 0);

    const netProfit = totalSales - totalCost;
    
    const orderStatusCounts = {
      new: orders.filter(o => o.status === "new").length,
      processing: orders.filter(o => o.status === "processing").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      completed: orders.filter(o => o.status === "completed").length,
    };

    // Top selling products
    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.title, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += (item.price * item.quantity);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      totalSales,
      totalOrders: orders.length,
      orderStatusCounts,
      netProfit,
      topProducts
    });
  });

  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin") return res.sendStatus(403);
    const users = await storage.getUsers();
    res.json(users);
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const user = await storage.updateUser(req.params.id, req.body);
    res.json(user);
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    await storage.deleteUser(req.params.id);
    res.sendStatus(200);
  });

  // Coupons
  app.get("/api/coupons", async (req, res) => {
    const coupons = await storage.getCoupons();
    res.json(coupons);
  });

  app.post("/api/coupons", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const coupon = await storage.createCoupon(req.body);
    res.json(coupon);
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    await storage.deleteCoupon(req.params.id);
    res.sendStatus(200);
  });

  app.get("/api/coupons/:code", async (req, res) => {
    const coupon = await storage.getCouponByCode(req.params.code);
    if (!coupon) return res.status(404).json({ message: "كود الخصم غير صحيح أو منتهي" });
    res.json(coupon);
  });

  // Activity Logs
  app.get("/api/admin/logs", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const logs = await storage.getActivityLogs();
    res.json(logs);
  });

  // Wallet
  app.get("/api/wallet/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const transactions = await storage.getWalletTransactions(user.id);
    res.json(transactions);
  });

  // Addresses
  app.patch("/api/user/addresses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const { addresses } = req.body;
    if (!Array.isArray(addresses)) return res.status(400).json({ message: "Invalid addresses format" });
    const updatedUser = await storage.updateUserAddresses(user.id, addresses);
    res.json(updatedUser);
  });

  return httpServer;
}
