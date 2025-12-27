import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema, insertOrderSchema, insertCouponSchema } from "@shared/schema";
import { seed } from "./seed";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure storage for uploaded files
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png, webp, gif) are allowed"));
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  setupAuth(app);
  
  // Serve uploaded files statically
  const express = await import("express");
  app.use("/uploads", express.static(uploadDir));

  // Image Upload Endpoint
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });
  
  // Seed data
  try {
    await seed();
  } catch (err) {
    console.error("Seeding failed:", err);
  }

  // Middleware for granular permissions
  const checkPermission = (permission: string) => {
    return (req: any, res: any, next: any) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const user = req.user as any;
      if (user.role === "admin" || (user.permissions && user.permissions.includes(permission))) {
        return next();
      }
      res.status(403).json({ message: "ليس لديك صلاحية للقيام بهذا الإجراء" });
    };
  };

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

  app.patch("/api/products/:id", checkPermission("products.edit"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const product = await storage.updateProduct(req.params.id, req.body);
    res.json(product);
  });

  app.delete("/api/products/:id", checkPermission("products.edit"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteProduct(req.params.id);
    res.sendStatus(200);
  });

  // Orders
  app.get(api.orders.list.path, checkPermission("orders.view"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role === "admin" || (user.permissions && user.permissions.includes("orders.view"))) {
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
    console.log(`[ORDERS] Fetching orders for user: ${user.id || user._id}`);
    const orders = await storage.getOrdersByUser(user.id || user._id);
    res.json(orders);
  });

  app.post("/api/auth/verify-password", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password } = req.body;
    if (!password) return res.status(400).send("كلمة المرور مطلوبة");

    const user = req.user as any;
    const dbUser = await storage.getUser(user.id || user._id);
    if (!dbUser || !dbUser.password) return res.status(401).send("فشل في التحقق من الحساب");

    const { scrypt, timingSafeEqual } = await import("crypto");
    const { promisify } = await import("util");
    const scryptAsync = promisify(scrypt);

    const parts = dbUser.password.split(".");
    if (parts.length === 2) {
      const [hashedPassword, salt] = parts;
      const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
      if (timingSafeEqual(Buffer.from(hashedPassword, "hex"), buffer)) {
        return res.json({ success: true });
      }
    } else if (dbUser.password === password) {
      return res.json({ success: true });
    }

    res.status(401).send("كلمة المرور غير صحيحة");
  });

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    
    // Check wallet balance if payment method is wallet
    if (parsed.data.paymentMethod === "wallet" && parsed.data.userId) {
      const user = await storage.getUser(parsed.data.userId);
      if (user) {
        const balance = Number(user.walletBalance || 0);
        const orderTotal = Number(parsed.data.total);
        if (balance < orderTotal) {
          return res.status(400).json({ message: "رصيد المحفظة غير كافٍ" });
        }
        
        // Deduct from wallet
        const newBalance = (balance - orderTotal).toString();
        await storage.updateUserWallet(user.id, newBalance);
        
        // Create transaction log
        await storage.createWalletTransaction({
          userId: user.id,
          amount: orderTotal,
          type: "withdrawal",
          description: `دفع طلب POS #${new Date().getTime()}`,
        });
      }
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

    // Define valid orders: ignore cancelled and returned
    const validOrders = orders.filter(o => o.status !== "cancelled" && (o.status as string) !== "returned");

    // Total Sales: Sum of all non-cancelled, non-returned orders
    const totalSales = validOrders.reduce((acc, order) => acc + Number(order.total || 0), 0);
    
    // Total Cost: Sum of cost for items in valid orders
    const totalCost = validOrders.reduce((acc, order) => {
      return acc + (order.items || []).reduce((itemAcc, item) => itemAcc + (Number(item.cost || 0) * item.quantity), 0);
    }, 0);

    const netProfit = totalSales - totalCost;
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter daily and monthly sales to only include valid orders
    const dailySales = validOrders.filter(o => new Date(o.createdAt) >= startOfDay).reduce((acc, o) => acc + Number(o.total || 0), 0);
    const monthlySales = validOrders.filter(o => new Date(o.createdAt) >= startOfMonth).reduce((acc, o) => acc + Number(o.total || 0), 0);

    const orderStatusCounts = {
      new: orders.filter(o => o.status === "new").length,
      processing: orders.filter(o => o.status === "processing").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      completed: orders.filter(o => o.status === "completed").length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
      returned: orders.filter(o => (o.status as string) === "returned").length,
    };

    // Top selling products based ONLY on valid orders
    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
    validOrders.forEach(order => {
      (order.items || []).forEach(item => {
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
      dailySales,
      monthlySales,
      topProducts
    });
  });

  app.get("/api/admin/users", checkPermission("staff.manage"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const users = await storage.getUsers();
    // Return all users for admin management
    res.json(users);
  });

  app.patch("/api/admin/users/:id/reset-password", checkPermission("staff.manage"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password } = req.body;
    if (!password) return res.status(400).send("كلمة المرور مطلوبة");

    try {
      const { scrypt, randomBytes } = await import("crypto");
      const { promisify } = await import("util");
      const scryptAsync = promisify(scrypt);
      
      const salt = randomBytes(16).toString("hex");
      const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
      const hashedPassword = `${buffer.toString("hex")}.${salt}`;
      
      await storage.updateUserPassword(req.params.id, hashedPassword);
      
      // Audit log
      await storage.createActivityLog({
        employeeId: (req.user as any).id,
        action: "password_reset",
        targetType: "user",
        targetId: req.params.id,
        details: `تم إعادة تعيين كلمة المرور للموظف من قبل ${(req.user as any).name}`
      });

      res.json({ message: "تم تحديث كلمة المرور بنجاح" });
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });

  app.patch("/api/admin/users/:id/status", checkPermission("staff.manage"), async (req, res) => {
    const { isActive } = req.body;
    try {
      const user = await storage.updateUser(req.params.id, { isActive });
      
      await storage.createActivityLog({
        employeeId: (req.user as any).id,
        action: isActive ? "staff_activate" : "staff_deactivate",
        targetType: "user",
        targetId: req.params.id,
        details: `${isActive ? 'تفعيل' : 'تعطيل'} حساب الموظف`
      });

      res.json(user);
    } catch (err: any) {
      res.status(400).send(err.message);
    }
  });

  app.delete("/api/admin/users/:id", checkPermission("staff.manage"), async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      
      await storage.createActivityLog({
        employeeId: (req.user as any).id,
        action: "staff_delete",
        targetType: "user",
        targetId: req.params.id,
        details: "حذف حساب الموظف"
      });

      res.sendStatus(200);
    } catch (err: any) {
      res.status(400).send(err.message);
    }
  });

  app.post("/api/admin/wallet/deposit", checkPermission("wallet.adjust"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { userId, amount, description } = req.body;
    if (!userId || !amount) return res.status(400).send("بيانات غير مكتملة");

    const targetUser = await storage.getUser(userId);
    if (!targetUser) return res.status(404).send("المستخدم غير موجود");

    const newBalance = (Number(targetUser.walletBalance || 0) + Number(amount)).toString();
    await storage.updateUserWallet(userId, newBalance);
    await storage.createWalletTransaction({
      userId,
      amount: Number(amount),
      type: "deposit",
      description: description || "إيداع من قبل الإدارة",
    });

    res.json({ success: true, newBalance });
  });

  // Wallet Management
  app.patch("/api/user/wallet", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { balance } = req.body;
    // Support both 'balance' and 'walletBalance' in request body for compatibility
    const newBalance = balance || req.body.walletBalance;
    if (newBalance === undefined) return res.status(400).send("Balance is required");
    
    const updatedUser = await storage.updateUserWallet((req.user as any).id, newBalance.toString());
    res.json(updatedUser);
  });

  app.post("/api/wallet/transaction", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { amount, type, description } = req.body;
    const transaction = await storage.createWalletTransaction({
      userId: (req.user as any).id,
      amount,
      type,
      description,
    });
    res.json(transaction);
  });

  // Shipping Integration (Storage Station)
  app.post("/api/shipping/storage-station/create", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { orderId } = req.body;
    
    // In a real scenario, you'd call Storage Station API here
    // const response = await axios.post('https://api.storagestation.io/v1/shipments', {...}, { headers: { Authorization: `Bearer ${API_KEY}` } });
    
    console.log(`[Storage Station] Creating shipment for order: ${orderId}`);
    
    const order = await storage.updateOrderStatus(orderId, "processing", {
      provider: "Storage Station",
      tracking: "SS-" + Math.random().toString(36).substring(7).toUpperCase()
    });
    
    res.json({ success: true, trackingNumber: order.trackingNumber });
  });

  app.post("/api/admin/users", checkPermission("staff.manage"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { password, ...userData } = req.body;
      
      // Clean phone number: remove leading 0 if exists
      let phone = userData.phone || "";
      if (phone.startsWith("0")) phone = phone.substring(1);
      
      // Ensure email exists, if not generate one from phone
      const email = userData.email || `${phone}@genmz.com`;
      
      // Use phone as username if not provided
      const username = userData.username || phone;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(phone);
      if (existingUser) {
        return res.status(400).send("مستخدم بهذا الرقم موجود بالفعل (قد يكون عميلاً)");
      }

      let hashedPassword = "";
      
      if (password) {
        const { scrypt, randomBytes } = await import("crypto");
        const { promisify } = await import("util");
        const scryptAsync = promisify(scrypt);
        const salt = randomBytes(16).toString("hex");
        const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
        hashedPassword = `${buffer.toString("hex")}.${salt}`;
      } else {
        // Default password if not provided
        const { scrypt, randomBytes } = await import("crypto");
        const { promisify } = await import("util");
        const scryptAsync = promisify(scrypt);
        const salt = randomBytes(16).toString("hex");
        const buffer = (await scryptAsync("123456", salt, 64)) as Buffer;
        hashedPassword = `${buffer.toString("hex")}.${salt}`;
      }

      // Ensure permissions are handled correctly
      const permissions = userData.permissions || [];
      const role = userData.role || "employee";

      const user = await storage.createUser({
        ...userData,
        phone,
        email,
        username,
        password: hashedPassword,
        walletBalance: "0",
        addresses: [],
        isActive: true,
        mustChangePassword: true,
        permissions: permissions,
        role: role
      });

      // Log creation
      await storage.createActivityLog({
        employeeId: (req.user as any).id,
        action: "staff_create",
        targetType: "user",
        targetId: user.id,
        details: `إنشاء حساب موظف جديد: ${user.name}`
      });

      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).send(err.message);
    }
  });

  // Update order status
  app.patch("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "employee"].includes((req.user as any).role)) return res.sendStatus(403);
    try {
      const { status } = req.body;
      const updated = await storage.updateOrderStatus(req.params.id, status);
      res.json(updated);
    } catch (err: any) {
      res.status(400).send(err.message);
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (err: any) {
      res.status(400).send(err.message);
    }
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
    const parsed = insertCouponSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid coupon data", details: parsed.error });
    }
    const coupon = await storage.createCoupon(parsed.data);
    res.json(coupon);
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    await storage.deleteCoupon(req.params.id);
    res.sendStatus(200);
  });

  // Hardcoded coupons
  const hardcodedCoupons: Record<string, any> = {
    "GEN@FIRST10": {
      code: "GEN@FIRST10",
      type: "percentage",
      value: 10,
      isFirstOrderOnly: true,
      isActive: true,
    },
    "@10": {
      code: "@10",
      type: "cashback",
      value: 10,
      maxCashback: 10,
      isActive: true,
    },
  };

  app.get("/api/coupons/:code", async (req, res) => {
    const code = req.params.code.toUpperCase();
    
    // Check hardcoded coupons first
    const hardcodedCoupon = hardcodedCoupons[code];
    if (hardcodedCoupon) {
      // Check if first-order-only coupon
      if (hardcodedCoupon.isFirstOrderOnly && req.isAuthenticated()) {
        const user = req.user as any;
        const userOrders = await storage.getOrdersByUser(user.id || user._id);
        if (userOrders && userOrders.length > 0) {
          return res.status(400).json({ message: "هذا الكود صالح للطلب الأول فقط" });
        }
      }
      return res.json(hardcodedCoupon);
    }
    
    // Check database coupons
    const coupon = await storage.getCouponByCode(req.params.code);
    if (!coupon) return res.status(404).json({ message: "كود الخصم غير صحيح أو منتهي" });
    
    // Check if first-order-only coupon from database
    if ((coupon as any).isFirstOrderOnly && req.isAuthenticated()) {
      const user = req.user as any;
      const userOrders = await storage.getOrdersByUser(user.id || user._id);
      if (userOrders && userOrders.length > 0) {
        return res.status(400).json({ message: "هذا الكود صالح للطلب الأول فقط" });
      }
    }
    
    res.json(coupon);
  });

  app.get("/api/admin/users/search", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { phone } = req.query;
    if (!phone) return res.status(400).send("Phone number required");
    
    const users = await storage.getUsers();
    const user = users.find(u => u.phone === phone || u.phone === `5${phone}` || u.phone === `05${phone}`);
    
    if (!user) return res.status(404).json({ message: "Customer not found" });
    res.json(user);
  });

  app.patch("/api/pos/loyalty/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { pointsEarned, pointsUsed } = req.body;
    
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).send("User not found");
      
      const currentPoints = user.loyaltyPoints || 0;
      const newPoints = Math.max(0, currentPoints + (pointsEarned || 0) - (pointsUsed || 0));
      
      await storage.updateUser(req.params.id, { loyaltyPoints: newPoints });
      res.json({ success: true, loyaltyPoints: newPoints });
    } catch (err: any) {
      res.status(400).send(err.message);
    }
  });

  // Audit Logs
  app.get("/api/admin/audit-logs", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const logs = await storage.getActivityLogs();
    res.json(logs);
  });

  // Branch Inventory Routes
  app.get("/api/admin/inventory", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const { branchId } = req.query;
    if (!branchId) return res.status(400).send("Branch ID required");
    // Mocking for now since storage doesn't have it yet, but we'll add it
    const inventory = await (storage as any).getBranchInventory?.(branchId as string) || [];
    res.json(inventory);
  });

  app.patch("/api/admin/inventory/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const { id } = req.params;
    const { stock } = req.body;
    
    try {
      const updated = await storage.updateBranchStock(id, Number(stock));
      
      await storage.createActivityLog({
        employeeId: (req.user as any).id,
        action: "UPDATE_STOCK",
        targetType: "inventory",
        targetId: id,
        details: `تحديث المخزون للقيمة: ${stock}`
      });
      
      res.json(updated);
    } catch (err: any) {
      console.error("[INVENTORY] Update failed:", err);
      res.status(400).send(err.message);
    }
  });

  app.patch("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const updatedUser = await storage.updateUser((req.user as any).id, req.body);
    res.json(updatedUser);
  });

  // Wallet
  app.post("/api/admin/users/:id/deposit", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
    
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const newBalance = (Number(user.walletBalance) + amount).toString();
    const updatedUser = await storage.updateUserWallet(user.id, newBalance);
    
    await storage.createWalletTransaction({
      userId: user.id,
      amount,
      type: "deposit",
      description: "إيداع من قبل الإدارة",
      createdAt: new Date()
    });
    
    res.json(updatedUser);
  });

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

  // Branches
  app.get("/api/branches", async (_req, res) => {
    const branches = await storage.getBranches();
    res.json(branches);
  });

  app.post("/api/branches", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const branch = await storage.createBranch(req.body);
    res.json(branch);
  });

  app.patch("/api/branches/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const branch = await storage.updateBranch(req.params.id, req.body);
    res.json(branch);
  });

  app.delete("/api/branches/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    await storage.deleteBranch(req.params.id);
    res.sendStatus(200);
  });

  // Banners
  app.get("/api/banners", async (_req, res) => {
    const banners = await storage.getBanners();
    res.json(banners);
  });

  app.post("/api/banners", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const banner = await storage.createBanner(req.body);
    res.json(banner);
  });

  app.patch("/api/banners/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const banner = await storage.updateBanner(req.params.id, req.body);
    res.json(banner);
  });

  app.delete("/api/banners/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    await storage.deleteBanner(req.params.id);
    res.sendStatus(200);
  });

  app.get("/api/admin/users/search", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { phone } = req.query;
    if (!phone) return res.status(400).send("Phone required");
    const user = await storage.getUserByUsername(phone as string);
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  });

  // Update loyalty points after order
  app.patch("/api/pos/loyalty/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { pointsEarned, pointsUsed } = req.body;
      const user = await storage.getUser(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const currentPoints = user.loyaltyPoints || 0;
      const newPoints = Math.max(0, currentPoints + pointsEarned - pointsUsed);
      
      const updated = await storage.updateUser(req.params.userId, {
        loyaltyPoints: newPoints
      });
      
      res.json(updated);
    } catch (err: any) {
      res.status(400).send(err.message);
    }
  });
  app.get("/api/pos/shifts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const shifts = await storage.getCashShifts();
    res.json(shifts);
  });

  app.get("/api/pos/active-shift", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const shift = await storage.getActiveShift((req.user as any).id);
    res.json(shift || null);
  });

  app.post("/api/pos/shifts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const shift = await storage.createCashShift({
      ...req.body,
      cashierId: (req.user as any).id,
      status: "open",
      openedAt: new Date()
    });
    res.status(201).json(shift);
  });

  app.patch("/api/pos/shifts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const shift = await storage.updateCashShift(req.params.id, {
      ...req.body,
      closedAt: req.body.status === "closed" ? new Date() : undefined
    });
    res.json(shift);
  });

  // Shipping Companies
  app.get("/api/shipping-companies", async (_req, res) => {
    const companies = await storage.getShippingCompanies();
    res.json(companies);
  });

  app.post("/api/shipping-companies", checkPermission("orders.edit"), async (req, res) => {
    const parsed = z.object({
      name: z.string(),
      price: z.number(),
      estimatedDays: z.number(),
      storageXCode: z.string().optional(),
    }).safeParse(req.body);
    
    if (!parsed.success) return res.status(400).json(parsed.error);
    const company = await storage.createShippingCompany({
      ...parsed.data,
      isActive: true,
    });
    res.status(201).json(company);
  });

  app.patch("/api/shipping-companies/:id", checkPermission("orders.edit"), async (req, res) => {
    const company = await storage.updateShippingCompany(req.params.id, req.body);
    res.json(company);
  });

  app.delete("/api/shipping-companies/:id", checkPermission("orders.edit"), async (req, res) => {
    await storage.deleteShippingCompany(req.params.id);
    res.sendStatus(200);
  });

  return httpServer;
}
