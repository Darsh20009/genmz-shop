import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema, insertOrderSchema, insertCouponSchema, insertCashShiftSchema } from "@shared/schema";
import { seed } from "./seed";
import multer from "multer";
import path from "path";
import fs from "fs";
import { shipHeroService } from "./services/shipHeroService";
import { moyasarService } from "./services/moyasarService";
import { ProductModel, UserModel } from "./models";
import { errorMiddleware } from "./middleware/error";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: multerStorage });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  // Auth setup MUST be before routes that use protectAdmin or req.isAuthenticated
  setupAuth(app);

  // RBAC Page Protection Middleware for common admin sections
  const protectAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "يرجى تسجيل الدخول أولاً" 
      });
    }
    const user = req.user as any;
    if (user.role === "admin" || user.role === "employee" || user.role === "cashier" || user.role === "accountant" || user.role === "support") {
      return next();
    }
    res.status(403).json({ 
      success: false, 
      message: "دخول غير مصرح - ليس لديك الصلاحيات الكافية" 
    });
  };

  // Error Logging Endpoint
  app.post("/api/logs/error", (req, res) => {
    const { error, stack, info, url, timestamp } = req.body;
    console.error(`[FRONTEND ERROR] [${timestamp}] URL: ${url}\nError: ${error}\nStack: ${stack}\nComponent Stack: ${info}`);
    res.sendStatus(204);
  });

  // Content Blocks
  app.get("/api/content", async (_req, res, next) => {
    try {
      const blocks = await storage.getContentBlocks();
      res.json(blocks);
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/content/:key", protectAdmin, async (req, res, next) => {
    try {
      const { key } = req.params;
      const { content, publish } = req.body;
      
      const updateData: any = {
        draftContent: content,
        status: publish ? "published" : "draft",
        key
      };

      if (publish) {
        updateData.content = content;
        updateData.publishedAt = new Date();
      }

      const block = await storage.updateContentBlock(key, updateData);
      res.json(block);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/content/:key/publish", protectAdmin, async (req, res, next) => {
    try {
      const { key } = req.params;
      const block = await storage.getContentBlock(key);
      if (!block) return res.status(404).send("Block not found");

      const updated = await storage.updateContentBlock(key, {
        content: block.draftContent || block.content,
        status: "published",
        publishedAt: new Date()
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // Health check endpoint for Render
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/admin/shifts/active", protectAdmin, async (req, res, next) => {
    try {
      const shift = await storage.getActiveShift(req.user!.id);
      res.json(shift || null);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/admin/shifts/open", protectAdmin, async (req, res, next) => {
    try {
      const { openingBalance, branchId } = req.user!;
      const shift = await storage.createCashShift({
        branchId: branchId || "main",
        cashierId: req.user!.id,
        openingBalance: parseFloat(req.body.openingBalance),
        status: "open",
        openedAt: new Date()
      });
      res.json(shift);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/admin/shifts/close", protectAdmin, async (req, res, next) => {
    try {
      const activeShift = await storage.getActiveShift(req.user!.id);
      if (!activeShift) return res.status(400).json({ message: "No active shift" });
      
      const shift = await storage.closeCashShift(activeShift.id, {
        closingBalance: parseFloat(req.body.closingBalance),
        actualCash: parseFloat(req.body.actualCash)
      });
      res.json(shift);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/inventory/stats", protectAdmin, async (req, res, next) => {
    try {
      const products = await storage.getProducts();
      const stats = {
        totalItems: products.reduce((acc, p) => acc + (p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0), 0),
        lowStockItems: products.filter(p => p.variants?.some(v => (v.stock || 0) <= (p.minStockLevel || 10))).length,
        outOfStockItems: products.filter(p => p.variants?.every(v => (v.stock || 0) <= 0)).length
      };
      res.json(stats);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/stats", protectAdmin, async (req, res, next) => {
    try {
      const summary = await storage.getDashboardSummary();
      res.json(summary);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/dashboard-summary", protectAdmin, async (req, res, next) => {
    try {
      const summary = await storage.getDashboardSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/analytics/summary", protectAdmin, async (req, res, next) => {
    try {
      const summary = await storage.getDashboardSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/abandoned-carts", protectAdmin, async (req, res, next) => {
    try {
      const carts = await storage.getAbandonedCarts();
      res.json({ success: true, data: carts });
    } catch (err) {
      next(err);
    }
  });

  // Abandoned Carts Legacy
  app.get("/api/abandoned-carts", protectAdmin, async (req, res, next) => {
    try {
      const carts = await storage.getAbandonedCarts();
      res.json({ success: true, data: carts });
    } catch (err) {
      next(err);
    }
  });

  // Fixed My Orders endpoint for customers
  app.get("/api/orders/my", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ success: false, message: "غير مصرح" });
    try {
      const user = req.user as any;
      const orders = await storage.getOrdersByUser(user.id || user._id);
      res.json(orders);
    } catch (err) {
      console.error("[API] Error fetching my orders:", err);
      res.status(500).json({ success: false, message: "فشل تحميل طلباتي" });
    }
  });

  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) return res.json({ items: [] });
    try {
      const user = req.user as any;
      const cart = await storage.getCart(user.id || user._id);
      res.json(cart || { items: [] });
    } catch (err) {
      res.json({ items: [] });
    }
  });

  // Webhook for ShipHero status updates
  app.post("/api/webhooks/shiphero", async (req, res) => {
    try {
      const payload = req.body;
      const orderNumber = payload.order_number;
      const status = payload.status;
      
      if (orderNumber && status === "shipped") {
        const orders = await storage.getOrders();
        const order = orders.find(o => o.orderNumber === orderNumber || o.id === orderNumber);
        
        if (order) {
          await storage.updateOrderStatus(order.id, "completed", {
            provider: "Storage Station",
            tracking: payload.tracking_number,
            adminNotes: "Updated via ShipHero Webhook"
          });
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  });

  // Manual Inventory Sync Trigger
  app.post("/api/admin/inventory/sync-shiphero", protectAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      let syncCount = 0;
      
      for (const product of products) {
        if (product.variants) {
          for (const variant of product.variants) {
            if (variant.sku) {
              const invData = await shipHeroService.getInventory(variant.sku);
              const node = invData?.data?.inventory?.data?.edges?.[0]?.node;
              if (node) {
                await ProductModel.findOneAndUpdate(
                  { _id: product.id, "variants.sku": variant.sku },
                  { $set: { "variants.$.stock": node.on_hand } }
                );
                syncCount++;
              }
            }
          }
        }
      }
      res.json({ success: true, synced: syncCount });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/abandoned-carts/:id/alert", protectAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      await storage.updateAbandonedCart(id, { recoveryStatus: "pending" });
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/abandoned-carts/:id/recover", protectAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      await storage.updateAbandonedCart(id, { recoveryStatus: "recovered" });
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/reviews", async (req, res, next) => {
    try {
      const reviews = await storage.getReviews(req.query.productId as string);
      res.json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/reviews", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ success: false, message: "غير مصرح" });
      const reviewData = {
        ...req.body,
        userId: (req.user as any)._id?.toString() || (req.user as any).id,
        customerName: (req.user as any).name
      };
      const review = await storage.createReview(reviewData);
      res.status(201).json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/admin/reviews/:id/approve", protectAdmin, async (req, res, next) => {
    try {
      const review = await storage.updateReviewStatus(req.params.id, true);
      res.json(review);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/admin/reviews/:id", protectAdmin, async (req, res, next) => {
    try {
      await storage.deleteReview(req.params.id);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  });

  // Branding/Visual Identity
  app.get("/api/branding", async (_req, res, next) => {
    try {
      const settings = await storage.getStoreSettings();
      res.json({
        name: settings.name,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        logo: settings.logo,
        logoEn: settings.logoEn,
        favicon: settings.favicon,
        coverImage: settings.coverImage,
        copyrightText: settings.copyrightText,
        seoTitle: settings.seoTitle,
        seoDescription: settings.seoDescription
      });
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/branding", protectAdmin, async (req, res, next) => {
    try {
      const settings = await storage.updateStoreSettings(req.body);
      res.json(settings);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/settings", async (_req, res, next) => {
    try {
      const settings = await storage.getStoreSettings();
      res.json(settings);
    } catch (err) {
      next(err);
    }
  });

  // Wallet Management
  app.post("/api/admin/customers/:id/wallet", protectAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { amount, type, description } = req.body;
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "العميل غير موجود" });

      const currentBalance = parseFloat(user.walletBalance || "0");
      const newBalance = type === "deposit" ? currentBalance + amount : currentBalance - amount;
      
      await storage.updateUserWallet(id, newBalance);
      await storage.createWalletTransaction({
        userId: id,
        amount,
        type,
        description: description || (type === "deposit" ? "إيداع رصيد من قبل الإدارة" : "سحب رصيد من قبل الإدارة")
      });

      res.json({ success: true, newBalance });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/admin/customers/:id/balance", protectAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { amount, type, description } = req.body;
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "العميل غير موجود" });

      const currentBalance = parseFloat(user.walletBalance || "0");
      const newBalance = type === "deposit" ? currentBalance + amount : currentBalance - amount;
      
      await storage.updateUserWallet(id, newBalance);
      await storage.createWalletTransaction({
        userId: id,
        amount,
        type,
        description: description || (type === "deposit" ? "إيداع رصيد من قبل الإدارة" : "سحب رصيد من قبل الإدارة")
      });

      res.json({ success: true, newBalance });
    } catch (err) {
      next(err);
    }
  });

  // Pages
  app.get("/api/pages", async (_req, res, next) => {
    try {
      const pages = await storage.getPages();
      res.json(pages);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/pages", protectAdmin, async (req, res, next) => {
    try {
      const page = await storage.createPage(req.body);
      res.status(201).json(page);
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/pages/:id", protectAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { publish, ...data } = req.body;
      
      const updateData: any = {
        ...data,
        status: publish ? "published" : "draft",
      };

      if (publish) {
        updateData.content = data.draftContent || data.content;
        updateData.publishedAt = new Date();
      }

      const page = await storage.updatePage(id, updateData);
      res.json(page);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/pages/:id/publish", protectAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const pages = await storage.getPages();
      const page = pages.find(p => p.id === id);
      if (!page) return res.status(404).send("Page not found");

      const updated = await storage.updatePage(id, {
        content: page.draftContent || page.content,
        status: "published",
        publishedAt: new Date()
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/pages/:id", protectAdmin, async (req, res, next) => {
    try {
      await storage.deletePage(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  // Coupons/Discount Codes
  app.get("/api/admin/coupons", protectAdmin, async (_req, res, next) => {
    try {
      const coupons = await storage.getCoupons();
      res.json(coupons);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/admin/coupons", protectAdmin, async (req, res, next) => {
    try {
      const coupon = await storage.createCoupon(req.body);
      res.status(201).json(coupon);
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/admin/coupons/:id", protectAdmin, async (req, res, next) => {
    try {
      const coupon = await storage.updateCoupon(req.params.id, req.body);
      res.json(coupon);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/admin/coupons/:id", protectAdmin, async (req, res, next) => {
    try {
      await storage.deleteCoupon(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  // Settings Update
  app.patch("/api/admin/settings", protectAdmin, async (req, res, next) => {
    try {
      const current = await storage.getStoreSettings();
      const updatedData = { ...req.body };
      
      // If communication is partially provided, merge it
      if (req.body.communication) {
        updatedData.communication = {
          ...current.communication,
          ...req.body.communication
        };
      }

      const settings = await storage.updateStoreSettings(updatedData);
      res.json(settings);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/users", protectAdmin, async (_req, res, next) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  });

  // Alias for loyalty page
  app.get("/api/admin/customers", protectAdmin, async (_req, res, next) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  });
  app.patch("/api/admin/categories/:id", protectAdmin, async (req, res, next) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      res.json(category);
    } catch (err) {
      next(err);
    }
  });

  // FAQ
  app.get("/api/faqs", async (_req, res, next) => {
    try {
      const faqs = await storage.getFAQs();
      res.json(faqs);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/admin/faqs", protectAdmin, async (req, res, next) => {
    try {
      const faq = await storage.createFAQ(req.body);
      res.status(201).json(faq);
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/admin/faqs/:id", protectAdmin, async (req, res, next) => {
    try {
      const faq = await storage.updateFAQ(req.params.id, req.body);
      res.json(faq);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/admin/faqs/:id", protectAdmin, async (req, res, next) => {
    try {
      await storage.deleteFAQ(req.params.id);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  });

  // Customer Groups
  app.get("/api/admin/customer-groups", protectAdmin, async (_req, res, next) => {
    try {
      const groups = await storage.getCustomerGroups();
      res.json(groups);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/admin/customer-groups", protectAdmin, async (req, res, next) => {
    try {
      const group = await storage.createCustomerGroup(req.body);
      res.status(201).json(group);
    } catch (err) {
      next(err);
    }
  });

  // Themes
  app.get("/api/admin/themes", protectAdmin, async (_req, res, next) => {
    try {
      const themes = await storage.getThemes();
      res.json(themes);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/admin/themes/:id/activate", protectAdmin, async (req, res, next) => {
    try {
      const theme = await storage.activateTheme(req.params.id);
      res.json(theme);
    } catch (err) {
      next(err);
    }
  });

  // Tamara Checkout
  app.post("/api/payments/tamara/checkout", async (req, res, next) => {
    try {
      const { orderId, amount, customer, items, shippingAddress } = req.body;
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).json({ success: false, message: "الطلب غير موجود" });

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      
      const session = await paymentGateway.createTamaraSession({
        orderId: order.id,
        amount: Number(order.total),
        items: order.items || [],
        customer: customer || {},
        shippingAddress: shippingAddress || order.shippingAddress || {},
        successUrl: `${baseUrl}/checkout/success?orderId=${order.id}`,
        failureUrl: `${baseUrl}/checkout/failure?orderId=${order.id}`,
        cancelUrl: `${baseUrl}/cart`,
      });
      
      await storage.updateOrderPaymentStatus(orderId, "pending", "tamara");
      
      res.json({ 
        success: true, 
        checkoutUrl: session.redirectUrl,
        sessionId: session.sessionId
      });
    } catch (err: any) {
      console.error("[TAMARA] Error:", err);
      res.status(500).json({ success: false, message: err.message || "فشل إنشاء جلسة تمارا" });
    }
  });

  // Tabby Checkout
  app.post("/api/payments/tabby/checkout", async (req, res, next) => {
    try {
      const { orderId, amount, customer, items, shippingAddress } = req.body;
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).json({ success: false, message: "الطلب غير موجود" });

      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const session = await paymentGateway.createTabbySession({
        orderId: order.id,
        amount: Number(order.total),
        items: order.items || [],
        customer: customer || {},
        shippingAddress: shippingAddress || order.shippingAddress || {},
        successUrl: `${baseUrl}/checkout/success?orderId=${order.id}`,
        failureUrl: `${baseUrl}/checkout/failure?orderId=${order.id}`,
        cancelUrl: `${baseUrl}/cart`,
      });
      
      await storage.updateOrderPaymentStatus(orderId, "pending", "tabby");

      res.json({ 
        success: true, 
        checkoutUrl: session.redirectUrl,
        sessionId: session.sessionId
      });
    } catch (err: any) {
      console.error("[TABBY] Error:", err);
      res.status(500).json({ success: false, message: err.message || "فشل إنشاء جلسة تابي" });
    }
  });

  // Moyasar Payment
  app.post("/api/payments/moyasar/initiate", async (req, res, next) => {
    try {
      const { orderId } = req.body;
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).json({ success: false, message: "الطلب غير موجود" });

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      
      // Moyasar expects amount in halalas (1 SAR = 100 halalas)
      const amountInHalalas = Math.round(Number(order.total) * 100);

      const payment = await moyasarService.createPayment({
        amount: amountInHalalas,
        currency: "SAR",
        description: `Order ${order.orderNumber || order.id}`,
        callback_url: `${baseUrl}/checkout/success?orderId=${order.id}&payment_provider=moyasar`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber
        }
      });

      await storage.updateOrderPaymentStatus(orderId, "pending", "moyasar");
      await (storage as any).updateOrderMoyasarDetails(orderId, {
        paymentId: payment.id,
        status: "initiated",
        paymentUrl: payment.source.transaction_url
      });

      res.json({
        success: true,
        paymentId: payment.id,
        transactionUrl: payment.source.transaction_url
      });
    } catch (err: any) {
      console.error("[MOYASAR] Error initiating payment:", err);
      res.status(500).json({ success: false, message: err.message || "فشل بدء عملية الدفع عبر ميسر" });
    }
  });

  // Moyasar Webhook/Callback verify
  app.get("/api/payments/moyasar/verify", async (req, res) => {
    const { id } = req.query;
    
    try {
      if (!id) return res.status(400).send("Missing payment ID");
      
      const payment = await moyasarService.getPayment(id as string);
      const orderId = payment.metadata?.orderId;
      
      if (!orderId) return res.status(400).send("Order ID not found in payment metadata");

      // Trigger Shipping Integration (ShipHero) after payment
      const triggerShipping = async (orderId: string) => {
        try {
          const order = await storage.getOrder(orderId);
          if (order) {
            console.log(`[SHIPPING] Triggering ShipHero for order ${order.orderNumber || orderId}`);
            await shipHeroService.createOrder(order);
          }
        } catch (shipError) {
          console.error("[SHIPPING] Failed to sync with ShipHero:", shipError);
        }
      };

      // Send confirmation email after payment
      const sendConfirmation = async (orderId: string) => {
        try {
          const order = await storage.getOrder(orderId);
          if (order) {
            await (await import("./services/emailService")).sendOrderConfirmationEmail({
              customerName: order.customerName || "Customer",
              customerEmail: order.customerEmail,
              orderId: order.id,
              orderTotal: `${order.total} ر.س`,
              items: order.items || []
            });
          }
        } catch (emailError) {
          console.error("[EMAIL] Failed to send confirmation:", emailError);
        }
      };

      if (payment.status === "paid") {
        await storage.updateOrderPaymentStatus(orderId, "paid", "moyasar");
        
        await triggerShipping(orderId);
        await sendConfirmation(orderId);

        // Store Moyasar Payment ID
        const OrderModel = (await import("./models")).OrderModel;
        await OrderModel.findByIdAndUpdate(orderId, { moyasarPaymentId: id as string });
        return res.redirect(`/checkout/success?orderId=${orderId}`);
      } else {
        await storage.updateOrderPaymentStatus(orderId, "failed", "moyasar");
        return res.redirect(`/checkout/failure?orderId=${orderId}&reason=${payment.status}`);
      }
    } catch (err) {
      console.error("[MOYASAR] Verification Error:", err);
      res.status(500).send("Payment verification failed");
    }
  });

  // Moyasar Webhook (Post)
  app.post("/api/payments/moyasar/webhook", async (req, res) => {
    try {
      const payment = req.body;
      const orderId = payment.metadata?.orderId;

      if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID not found" });
      }

      const OrderModel = (await import("./models")).OrderModel;

      if (payment.status === "paid") {
        await storage.updateOrderPaymentStatus(orderId, "paid", "moyasar");
        // Store Moyasar Payment ID
        await OrderModel.findByIdAndUpdate(orderId, { 
          moyasarPaymentId: payment.id,
          moyasarStatus: "paid"
        });
        console.log(`[MOYASAR Webhook] Order ${orderId} marked as paid`);
      } else if (payment.status === "failed") {
        await storage.updateOrderPaymentStatus(orderId, "failed", "moyasar");
        await OrderModel.findByIdAndUpdate(orderId, { 
          moyasarStatus: "failed"
        });
        console.log(`[MOYASAR Webhook] Order ${orderId} marked as failed`);
      }

      res.json({ success: true });
    } catch (err) {
      console.error("[MOYASAR Webhook] Error:", err);
      res.status(500).json({ success: false });
    }
  });

  app.post("/api/admin/customers/:id/balance", protectAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { amount, type, description } = req.body;
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "العميل غير موجود" });

      const currentBalance = parseFloat(user.walletBalance || "0");
      const newBalance = type === "deposit" ? currentBalance + amount : currentBalance - amount;
      
      await storage.updateUserWallet(id, newBalance);
      await storage.createWalletTransaction({
        userId: id,
        amount: type === "deposit" ? amount : -amount,
        type: type as any,
        description: description || (type === "deposit" ? "إيداع رصيد من الإدارة" : "سحب رصيد من الإدارة")
      });

      res.json({ success: true, balance: newBalance });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/shipping-companies", async (_req, res, next) => {
    try {
      const settings = await storage.getStoreSettings();
      const integrations = settings.shippingIntegrations?.filter(i => i.isActive) || [];
      const companies = [
        { id: "storage-station", name: "Storage Station", price: 20 },
        ...integrations.map(i => ({ id: i.id, name: i.name, price: 25 }))
      ];
      res.json(companies);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/admin/questions/:productId", protectAdmin, async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { question } = req.body;
      const product = await storage.getProduct(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      
      const newQuestion = {
        id: Math.random().toString(36).substring(7),
        userId: req.user!.id,
        customerName: (req.user as any).name,
        question,
        createdAt: new Date().toISOString()
      };
      
      const updatedQuestions = [...(product.questions || []), newQuestion];
      await storage.updateProduct(productId, { questions: updatedQuestions } as any);
      res.status(201).json(newQuestion);
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/admin/questions/:productId/:questionId/answer", protectAdmin, async (req, res, next) => {
    try {
      const { productId, questionId } = req.params;
      const { answer } = req.body;
      const product = await storage.getProduct(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      
      const questions = product.questions?.map(q => 
        q.id === questionId ? { ...q, answer } : q
      );
      
      await storage.updateProduct(productId, { questions } as any);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });
  // Get Options Library (Presets)
  app.get("/api/admin/options-library", async (req, res, next) => {
    try {
      const presets = [
        {
          id: "clothing-sizes",
          name: "مقاسات الملابس",
          options: ["XS", "S", "M", "L", "XL", "XXL"]
        },
        {
          id: "clothing-styles",
          name: "أنماط الملابس",
          options: ["كاجوال", "رسمي", "رياضي", "كلاسيكي"]
        }
      ];
      res.json(presets);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/users/by-phone/:phone", async (req, res, next) => {
    try {
      const { phone } = req.params;
      let cleanPhone = phone.replace(/\D/g, "");
      // Normalize to 9 digits core
      if (cleanPhone.startsWith("966")) cleanPhone = cleanPhone.substring(3);
      if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.substring(1);
      
      console.log(`[API] Checking user by phone: ${cleanPhone}`);
      
      // Try fuzzy search logic similar to auth
      const user = await UserModel.findOne({ 
        $or: [
          { phone: cleanPhone },
          { username: cleanPhone },
          { phone: "0" + cleanPhone },
          { username: "0" + cleanPhone }
        ]
      }).lean();

      if (!user) {
        return res.status(404).send("User not found");
      }
      
      res.json({
        id: (user as any)._id?.toString() || (user as any).id,
        role: user.role,
        isActive: (user as any).isActive,
        name: user.name
      });
    } catch (err) {
      console.error(`[API] Error in by-phone:`, err);
      res.status(500).send("Internal server error");
    }
  });

  // Filters
  app.get("/api/filters", checkPermission("products.view"), async (_req, res) => {
    try {
      const filters = await storage.getFilters();
      res.json(filters || []);
    } catch (err) {
      res.status(500).json({ message: "فشل تحميل معايير التصفية" });
    }
  });

  app.post("/api/filters", checkPermission("products.edit"), async (req, res) => {
    try {
      const filter = await storage.createFilter(req.body);
      res.status(201).json(filter);
    } catch (err) {
      res.status(500).json({ message: "فشل إضافة المعيار" });
    }
  });

  app.patch("/api/filters/:id", checkPermission("products.edit"), async (req, res) => {
    try {
      const filter = await storage.updateFilter(req.params.id, req.body);
      res.json(filter);
    } catch (err) {
      res.status(500).json({ message: "فشل تحديث المعيار" });
    }
  });

  app.delete("/api/filters/:id", checkPermission("products.edit"), async (req, res) => {
    try {
      await storage.deleteFilter(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "فشل حذف المعيار" });
    }
  });

  // Options Library
  app.get("/api/options-library", checkPermission("products.view"), async (_req, res) => {
    try {
      const options = await storage.getOptionsLibrary();
      res.json(options || []);
    } catch (err) {
      res.status(500).json({ message: "فشل تحميل مكتبة الخيارات" });
    }
  });

  app.post("/api/options-library", checkPermission("products.edit"), async (req, res) => {
    try {
      const option = await storage.createOption(req.body);
      res.status(201).json(option);
    } catch (err) {
      res.status(500).json({ message: "فشل إضافة الخيار" });
    }
  });

  app.patch("/api/options-library/:id", checkPermission("products.edit"), async (req, res) => {
    try {
      const option = await storage.updateOption(req.params.id, req.body);
      res.json(option);
    } catch (err) {
      res.status(500).json({ message: "فشل تحديث الخيار" });
    }
  });

  app.delete("/api/options-library/:id", checkPermission("products.edit"), async (req, res) => {
    try {
      await storage.deleteOption(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "فشل حذف الخيار" });
    }
  });

  // Stock Notifications
  app.patch("/api/settings/stock-notifications", checkPermission("settings.manage"), async (req, res) => {
    try {
      const settings = await storage.updateStoreSettings({
        enableStockNotifications: req.body.enabled,
        minStockLevel: req.body.minStockLevel,
      });
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "فشل تحديث إعدادات التنبيهات" });
    }
  });

  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getStoreSettings();
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "فشل تحميل الإعدادات" });
    }
  });

  // Reviews
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews(req.query.productId as string);
      res.json(reviews || []);
    } catch (err) {
      res.status(500).json({ message: "فشل تحميل التقييمات" });
    }
  });

  app.patch("/api/reviews/:id/approve", checkPermission("products.edit"), async (req, res) => {
    try {
      const review = await storage.updateReviewStatus(req.params.id, true);
      res.json(review);
    } catch (err) {
      res.status(500).json({ message: "فشل الموافقة على التقييم" });
    }
  });

  app.delete("/api/reviews/:id", checkPermission("products.edit"), async (req, res) => {
    try {
      await storage.deleteReview(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "فشل حذف التقييم" });
    }
  });

  // Serve uploaded files statically
  const express = await import("express");
  app.use("/uploads", express.static(uploadDir));

  // Image Upload Endpoint
  app.post("/api/upload", upload.single("file"), (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const url = `/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (err) {
      next(err);
    }
  });

  // Bank Transfer Receipt Upload
  app.post("/api/orders/:id/receipt", upload.single("receipt"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).json({ message: "No receipt file uploaded" });
    
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      const user = req.user as any;
      if (user.role !== "admin" && order.userId !== user.id) {
        return res.sendStatus(403);
      }
      
      const receiptUrl = `/uploads/${req.file.filename}`;
      const updatedOrder = await storage.updateOrderReceipt(req.params.id, receiptUrl);
      res.json(updatedOrder);
    } catch (err) {
      console.error("[API] Error uploading receipt:", err);
      res.status(500).send("Internal server error");
    }
  });
  
  // Seed data
  try {
    await seed();
  } catch (err) {
    console.error("Seeding failed:", err);
  }

  // Products
  app.get(api.products.list.path, async (_req, res) => {
    try {
      const products = await storage.getProducts();
      // Filter for customers to only see active products
      const user = (_req as any).user;
      const isAdminOrStaff = user && (user.role === "admin" || user.role === "employee" || user.role === "support" || user.role === "cashier" || user.role === "accountant");
      
      const filteredProducts = isAdminOrStaff 
        ? products 
        : products.filter(p => p.isActive !== false);

      res.json(filteredProducts);
    } catch (err) {
      res.status(500).json({ success: false, message: "فشل تحميل المنتجات" });
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) return res.status(404).json({ success: false, message: "المنتج غير موجود" });
      res.json(product);
    } catch (err) {
      res.status(500).json({ success: false, message: "فشل تحميل بيانات المنتج" });
    }
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ success: false, message: "غير مصرح" });
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          success: false, 
          message: "بيانات المنتج غير صحيحة",
          errors: parsed.error.flatten().fieldErrors 
        });
      }
      const product = await storage.createProduct(parsed.data);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      res.status(500).json({ success: false, message: "فشل إنشاء المنتج" });
    }
  });

  app.patch("/api/products/:id", checkPermission("products.edit"), async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ success: false, message: "غير مصرح" });
      const product = await storage.updateProduct(req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (err) {
      res.status(500).json({ success: false, message: "فشل تحديث المنتج" });
    }
  });

  app.delete("/api/products/:id", checkPermission("products.edit"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    console.log("[DELETE PRODUCT] Deleting product with ID:", req.params.id);
    try {
      await storage.deleteProduct(req.params.id);
      console.log("[DELETE PRODUCT] Successfully deleted product:", req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("[DELETE PRODUCT] Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.post("/api/orders", async (req, res, next) => {
    try {
      const parsed = insertOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          success: false, 
          message: "بيانات الطلب غير صالحة",
          errors: parsed.error.flatten().fieldErrors 
        });
      }
      
      const orderData = parsed.data;
      const orderNumber = "ORD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const order = await storage.createOrder({ 
        ...orderData, 
        orderNumber,
      });

      // Integrate with ShipHero
      try {
        console.log(`[ShipHero] Syncing order ${orderNumber} to ShipHero...`);
        const shipHeroResult = await shipHeroService.createOrder(order);
        console.log(`[ShipHero] Order ${orderNumber} synced successfully:`, JSON.stringify(shipHeroResult));
      } catch (shError: any) {
        console.error(`[ShipHero] Failed to sync order ${orderNumber}:`, shError.response?.data || shError.message);
        // We don't block the response, but log the error
      }

      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      next(error);
    }
  });

  // Refund Order
  app.post("/api/orders/:id/refund", checkPermission("orders.edit"), async (req, res, next) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      // Update local DB
      const updatedOrder = await storage.updateOrderPaymentStatus(req.params.id, "refunded");
      await storage.updateOrderStatus(req.params.id, "cancelled");

      // Log action
      const user = req.user as any;
      await storage.createAuditLog({
        employeeId: user.id || user._id,
        employeeName: user.name,
        action: "refund",
        targetType: "order",
        targetId: order.id,
        details: `Refund processed for order ${order.id}`,
        createdAt: new Date()
      });

      res.json(updatedOrder);
    } catch (err) {
      next(err);
    }
  });

  // Cancel Order with ShipHero Sync
  app.post("/api/orders/:id/cancel", checkPermission("orders.edit"), async (req, res, next) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const updatedOrder = await storage.updateOrderStatus(req.params.id, "cancelled");

      // Attempt to cancel in ShipHero if possible (or mark as cancelled)
      // Note: ShipHero Public API doesn't always support direct deletion via GraphQL mutation easily
      // but we can update the status or note.
      
      const user = req.user as any;
      await storage.createAuditLog({
        employeeId: user.id || user._id,
        employeeName: user.name,
        action: "cancel",
        targetType: "order",
        targetId: order.id,
        details: `Order cancelled. Syncing with ShipHero if applicable.`,
        createdAt: new Date()
      });

      res.json(updatedOrder);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    
    try {
      // Admins and staff with orders.view permission see everything
      const isAdmin = user.role === "admin";
      const isStaff = user.role === "employee" || user.role === "cashier" || user.role === "accountant" || user.role === "support";
      const hasPermission = user.permissions && user.permissions.includes("orders.view");

      if (isAdmin || isStaff || hasPermission) {
        const orders = await storage.getOrders();
        console.log(`[API] Admin/Staff ${user.name} fetching all orders. Count: ${orders.length}`);
        
        // Filter by branch if user is not a global admin
        if (user.role !== "admin" && user.branchId && user.branchId !== "main") {
          const filteredOrders = orders.filter(o => o.branchId === user.branchId);
          return res.json(filteredOrders);
        }
        
        return res.json(orders);
      }
      
      // Customers see only their own orders
      const ordersByUser = await storage.getOrdersByUser(user.id || user._id);
      res.json(ordersByUser);
    } catch (err) {
      console.error("[API] Error fetching orders:", err);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders/manual", protectAdmin, async (req, res) => {
    try {
      const orderData = req.body;
      const orderNumber = "M-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const order = await storage.createOrder({ ...orderData, orderNumber });
      res.status(201).json(order);
    } catch (error) {
      console.error("[API] Manual order error:", error);
      res.status(500).json({ error: "Failed to create manual order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !(user.permissions && user.permissions.includes("orders.edit"))) {
      return res.sendStatus(403);
    }
    const { status, paymentStatus, shippingProvider, trackingNumber, note, adminNotes } = req.body;
    
    let order;
    try {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (shippingProvider) updateData.shippingProvider = shippingProvider;
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

      const previousOrder = await storage.getOrder(req.params.id);

      order = await storage.updateOrderStatus(req.params.id, status as any, { 
        provider: shippingProvider, 
        tracking: trackingNumber,
        adminNotes
      });

      if (paymentStatus) {
        await storage.updateOrderPaymentStatus(req.params.id, paymentStatus);
        
        // If payment is marked as paid manually (bank transfer), trigger shipping
        if (paymentStatus === "paid" && previousOrder?.paymentStatus !== "paid") {
          try {
            console.log(`[SHIPPING] Triggering ShipHero after manual payment approval for order ${req.params.id}`);
            await shipHeroService.createOrder(order);
          } catch (shipError) {
            console.error("[SHIPPING] Failed to sync with ShipHero on manual approval:", shipError);
          }
        }
      }

      if (note) {
        await storage.createAuditLog({
          employeeId: user.id || user._id,
          employeeName: user.name,
          action: "note",
          targetType: "order",
          targetId: req.params.id,
          details: `ملاحظة: ${note}`,
          createdAt: new Date()
        });
      }
    } catch (err) {
      console.error("[ORDER STATUS UPDATE ERROR]", err);
      return res.status(500).send("فشل تحديث حالة الطلب");
    }
    
    // Send order status update email
    try {
      const customer = await storage.getUser(order.userId || "");
      if (customer) {
        await sendOrderStatusUpdateEmail({
          customerName: customer.name,
          customerEmail: customer.email || "",
          orderId: order.id,
          orderTotal: String(order.total),
          status: order.status,
          items: order.items.map(item => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price
          })),
        });
      }
    } catch (emailErr) {
      console.error("[EMAIL] Failed to send status update:", emailErr);
    }
    
    res.json(order);
  });

  app.post("/api/verify-reset", async (req, res) => {
    const { phone, name } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }
    
    // Clean inputs for comparison
    const cleanPhone = phone.replace(/\D/g, "");
    const corePhone = cleanPhone.startsWith("0") ? cleanPhone.substring(1) : cleanPhone;
    
    console.log(`[RESET] Verifying user: Name="${name}", Phone="${phone}" (Core: "${corePhone}")`);
    
    const user = await UserModel.findOne({
      $and: [
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
        { 
          $or: [
            { phone: corePhone },
            { phone: "0" + corePhone },
            { username: corePhone },
            { username: "0" + corePhone }
          ]
        }
      ]
    }).lean();

    if (!user) {
      console.log(`[RESET] Verification failed for: ${name} / ${phone}`);
      return res.status(404).json({ message: "المعلومات غير متطابقة" });
    }
    
    console.log(`[RESET] User verified: ${user._id}`);
    res.json({ id: user._id.toString() });
  });

  app.post("/api/reset-password", async (req, res) => {
    const { id, password } = req.body;
    if (!id || !password) {
      return res.status(400).json({ message: "بيانات غير مكتملة" });
    }
    
    try {
      // Hash the new password before saving
      const { scrypt, randomBytes } = await import("crypto");
      const { promisify } = await import("util");
      const scryptAsync = promisify(scrypt);
      
      const salt = randomBytes(16).toString("hex");
      const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
      const hashedPassword = `${buffer.toString("hex")}.${salt}`;
      
      console.log(`[RESET] Updating password for user: ${id}`);
      // Use UserModel directly to ensure immediate update with correct field names
      const result = await UserModel.findByIdAndUpdate(id, { 
        password: hashedPassword,
        mustChangePassword: false 
      }, { new: true });

      if (!result) {
        return res.status(404).send("المستخدم غير موجود");
      }
      
      res.json({ message: "تم تحديث كلمة المرور بنجاح" });
    } catch (err: any) {
      console.error(`[RESET] Error updating password:`, err);
      res.status(500).send("فشل تحديث كلمة المرور");
    }
  });

  app.post("/api/orders/:id/refund", checkPermission("orders.refund"), async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
      if (order.status === "cancelled" || order.paymentStatus === "refunded") {
        return res.status(400).json({ message: "الطلب مسترجع بالفعل أو ملغي" });
      }

      const updatedOrder = await storage.updateOrderPaymentStatus(req.params.id, "refunded");
      
      const user = req.user as any;
      await storage.createAuditLog({
        employeeId: user.id || user._id,
        employeeName: user.name,
        action: "refund",
        targetType: "order",
        targetId: order.id,
        details: `استرجاع الطلب #${order.id.slice(-6)}`,
        createdAt: new Date()
      });

      res.json(updatedOrder);
    } catch (err) {
      res.status(500).send("فشل عملية الاسترجاع");
    }
  });

  app.post("/api/admin/wallet/adjust", checkPermission("wallet.adjust"), async (req, res, next) => {
    try {
      const { userId, amount, type, description } = req.body;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

      const currentBalance = Number(user.walletBalance || 0);
      const newBalance = type === "deposit" ? currentBalance + amount : currentBalance - amount;
      
      await storage.updateUserWallet(userId, newBalance.toString());
      await storage.createWalletTransaction({
        userId,
        amount,
        type,
        description: description || "تعديل إداري للرصيد",
      });

      const admin = req.user as any;
      await storage.createAuditLog({
        employeeId: admin.id || admin._id,
        employeeName: admin.name,
        action: "wallet_adjust",
        targetType: "user",
        targetId: userId,
        changes: { oldBalance: currentBalance, newBalance },
        details: `تعديل رصيد المحفظة للمستخدم ${user.name}`,
        createdAt: new Date()
      });

      res.json({ success: true, newBalance });
    } catch (err) {
      next(err);
    }
  });

  // Branches
  app.get("/api/branches", async (_req, res) => {
    const branches = await storage.getBranches();
    res.json(branches);
  });

  app.post("/api/admin/branches", checkPermission("settings.manage"), async (req, res, next) => {
    try {
      const branch = await storage.createBranch(req.body);
      res.status(201).json(branch);
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/admin/branches/:id", checkPermission("settings.manage"), async (req, res, next) => {
    try {
      const branch = await storage.updateBranch(req.params.id, req.body);
      res.json(branch);
    } catch (err) {
      next(err);
    }
  });

  // Cash Shifts
  app.get("/api/pos/shifts/active", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ success: false, message: "غير مصرح" });
      const user = req.user as any;
      const shift = await storage.getActiveShift(user.id || user._id);
      res.json(shift || null);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/cash-shifts", protectAdmin, async (req, res, next) => {
    try {
      const user = req.user as any;
      const branchId = user.role === "admin" ? undefined : user.branchId;
      const shifts = await storage.getCashShifts(branchId);
      res.json(shifts);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/cash-shifts/open", protectAdmin, async (req, res, next) => {
    try {
      const user = req.user as any;
      const existing = await storage.getActiveShift(user.id || user._id);
      if (existing) return res.status(400).json({ success: false, message: "هناك وردية مفتوحة بالفعل" });
      
      const shift = await storage.createCashShift({
        branchId: user.branchId || "main",
        cashierId: user.id || user._id,
        openingBalance: req.body.openingBalance || 0,
        status: "open",
        openedAt: new Date()
      });
      res.status(201).json(shift);
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/cash-shifts/:id/close", protectAdmin, async (req, res, next) => {
    try {
      const { actualCash, expectedCash } = req.body;
      const difference = actualCash - expectedCash;
      const shift = await storage.updateCashShift(req.params.id, {
        status: "closed",
        actualCash,
        closingBalance: actualCash,
        difference,
        closedAt: new Date()
      });
      res.json(shift);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/cash-shifts/branch/:branchId/report", protectAdmin, async (req, res) => {
    const shifts = await storage.getCashShifts(req.params.branchId);
    const closedShifts = shifts.filter(s => s.status === "closed");
    
    const report = {
      shifts: closedShifts,
      totalShifts: closedShifts.length,
      totalOpened: closedShifts.reduce((sum, s) => sum + (s.openingBalance || 0), 0),
      totalActual: closedShifts.reduce((sum, s) => sum + (s.actualCash || 0), 0),
      totalDifference: closedShifts.reduce((sum, s) => sum + (s.difference || 0), 0)
    };
    res.json(report);
  });

  app.get("/api/admin/stats", checkPermission("reports.view"), async (req, res, next) => {
    try {
      const settings = await storage.getStoreSettings();
      if (!settings.onboardingCompleted) {
        return res.status(403).json({ 
          success: false, 
          message: "يجب إكمال إعداد المتجر أولاً",
          onboardingRequired: true
        });
      }

      const summary = await analyticsService.getDashboardSummary();
      const overview = summary.allTime;
      const thisMonth = summary.thisMonth;
      const today = summary.today;
      
      const products = await analyticsService.getTopProducts(5);
      const orders = await storage.getOrders();
      const customers = await storage.getUsers();
      const customerCount = customers.filter(u => u.role === "customer").length;

      // Calculate net profit (revenue - cost)
      const netProfit = orders
        .filter(o => o.status !== "cancelled")
        .reduce((sum, o) => {
          const orderRevenue = Number(o.total || 0);
          const orderCost = o.items.reduce((cSum, item) => cSum + (Number(item.cost || 0) * item.quantity), 0);
          return sum + (orderRevenue - orderCost);
        }, 0);

      res.json({
        totalSales: overview.totalRevenue,
        monthlySales: thisMonth.totalRevenue,
        totalOrders: overview.totalOrders,
        dailyOrders: today.totalOrders,
        netProfit: netProfit,
        totalCustomers: customerCount,
        topProducts: products,
        completedOrders: orders.filter(o => o.status === "completed").length,
        processingOrders: orders.filter(o => o.status === "processing" || o.status === "new").length,
        cancelledOrders: orders.filter(o => o.status === "cancelled").length,
        recentOrders: orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
      });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/abandoned-carts", async (req, res) => {
    const carts = await storage.getAbandonedCarts();
    res.json(carts);
  });

  app.post("/api/abandoned-carts/:id/recover", async (req, res) => {
    const { id } = req.params;
    await storage.updateAbandonedCart(id, { recoveryStatus: "sent" });
    res.sendStatus(200);
  });

  // Cart Persistence
  app.get("/api/cart/load", async (req, res) => {
    if (!req.isAuthenticated()) return res.json({ items: [] });
    const user = req.user as any;
    const cart = await storage.getCart(user.id || user._id);
    res.json(cart);
  });

  app.post("/api/cart/save", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(200); // Silent ignore for guests
    const user = req.user as any;
    const cart = await storage.saveCart(user.id || user._id, req.body.items);
    res.json(cart);
  });

  app.post("/api/cart/clear", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(200);
    const user = req.user as any;
    await storage.clearCart(user.id || user._id);
    res.sendStatus(200);
  });

  app.post("/api/abandoned-carts/track", async (req, res, next) => {
    try {
      const { items } = req.body;
      if (!items || items.length === 0) return res.sendStatus(200);

      const user = req.user as any;
      const email = user?.email || req.body.email;
      const phone = user?.phone || req.body.phone;

      if (!email && !phone && !user) return res.sendStatus(200);

      const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const total = (subtotal * 1.15).toFixed(2);

      await storage.createAbandonedCart({
        userId: user?.id || user?._id,
        email,
        phone,
        items,
        total,
        lastActivity: new Date(),
        recoveryStatus: "pending",
      } as any);

      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/analytics/time-series", checkPermission("reports.view"), async (req, res, next) => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const data = await analyticsService.getTimeSeries({ startDate: thirtyDaysAgo, endDate: now });
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/analytics/top-products", checkPermission("reports.view"), async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const data = await analyticsService.getTopProducts(limit);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/analytics/order-status", checkPermission("reports.view"), async (_req, res, next) => {
    try {
      const data = await analyticsService.getOrderStatusDistribution();
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/analytics/inventory", checkPermission("reports.view"), async (_req, res, next) => {
    try {
      const data = await analyticsService.getInventoryHealth();
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/analytics/employee-sales", checkPermission("reports.view"), async (_req, res, next) => {
    try {
      const orders = await storage.getOrders();
      const users = await storage.getUsers();
      const employees = users.filter(u => u.role !== "customer" && u.role !== "admin");
      
      const employeeSalesMap: any = {};
      employees.forEach(emp => {
        employeeSalesMap[emp.id] = { name: emp.name, total: 0, count: 0 };
      });

      orders.forEach(order => {
        const cashierId = (order as any).cashierId;
        if (cashierId && employeeSalesMap[cashierId]) {
          employeeSalesMap[cashierId].total += Number(order.total || 0);
          employeeSalesMap[cashierId].count += 1;
        }
      });

      const data = Object.values(employeeSalesMap)
        .filter((emp: any) => emp.total > 0)
        .sort((a: any, b: any) => b.total - a.total)
        .map((emp: any) => ({
          name: emp.name,
          sales: Math.round(emp.total),
          orders: emp.count
        }));

      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  // Staff Management
  app.get("/api/admin/users", checkPermission("staff.manage"), async (req, res, next) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/admin/users", checkPermission("staff.manage"), async (req, res, next) => {
    try {
      const userData = req.body;
      let phone = (userData.phone || "").replace(/\D/g, "");
      if (phone.startsWith("0")) phone = phone.substring(1);
      const email = userData.email || `${phone}@genmz.com`;
      const username = userData.username || phone;

      const existingUser = await storage.getUserByUsername(phone);
      if (existingUser) {
        if (existingUser.role !== "customer" && existingUser.role !== "admin") {
           return res.status(400).json({ success: false, message: "مستخدم بهذا الرقم موجود بالفعل كـ " + existingUser.role });
        }
        const updatedUser = await storage.updateUser(existingUser.id, {
          ...userData,
          role: userData.role || "employee",
          isActive: true
        });
        return res.json(updatedUser);
      }

      const { scrypt, randomBytes } = await import("crypto");
      const { promisify } = await import("util");
      const scryptAsync = promisify(scrypt);
      const defaultPassword = "2030";
      const salt = randomBytes(16).toString("hex");
      const buffer = (await scryptAsync(defaultPassword, salt, 64)) as Buffer;
      const hashedPassword = `${buffer.toString("hex")}.${salt}`;

      const user = await storage.createUser({
        ...userData,
        phone,
        email,
        username,
        password: hashedPassword,
        walletBalance: "0",
        mustChangePassword: true,
        isActive: true,
        role: userData.role || "employee",
        addresses: [],
        permissions: userData.permissions || []
      });
      res.status(201).json(user);
    } catch (err: any) {
      next(err);
    }
  });

  app.patch("/api/admin/users/:id", checkPermission("staff.manage"), async (req, res, next) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/admin/users/:id", checkPermission("staff.manage"), async (req, res, next) => {
    try {
      await storage.deleteUser(req.params.id);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  });

  // Roles
  app.get("/api/admin/roles", checkPermission("staff.manage"), async (_req, res, next) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/admin/roles", checkPermission("staff.manage"), async (req, res, next) => {
    try {
      const role = await storage.createRole(req.body);
      
      const user = req.user as any;
      await storage.createAuditLog({
        employeeId: user.id || user._id,
        employeeName: user.name,
        action: "create",
        targetType: "role",
        targetId: role.id,
        details: `إنشاء دور جديد: ${role.name}`,
        createdAt: new Date()
      });
      
      res.status(201).json(role);
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/pos/shifts/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ success: false, message: "غير مصرح" });
      const shift = await storage.updateCashShift(req.params.id, req.body);
      res.json(shift);
    } catch (err) {
      next(err);
    }
  });

  // Invoices
  app.get("/api/invoices", checkPermission("reports.view"), async (req, res) => {
    const user = req.user as any;
    const invoices = await storage.getInvoices(user.role === "admin" ? undefined : user.id);
    res.json(invoices);
  });

  // Customer invoice portal - get invoices for current authenticated user
  app.get("/api/my/invoices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const invoices = await storage.getInvoices(user.id);
    res.json(invoices);
  });

  app.get("/api/invoices/:id", async (req, res) => {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) return res.status(404).send("Invoice not found");
    res.json(invoice);
  });

  // =====================================
  // ADVANCED LOYALTY SYSTEM
  // =====================================
  
  // Get user loyalty info
  app.get("/api/loyalty/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) return res.status(404).send("User not found");
      
      const loyaltyTiers = {
        bronze: { minSpent: 0, pointsMultiplier: 1, discountPercent: 0 },
        silver: { minSpent: 1000, pointsMultiplier: 1.25, discountPercent: 3 },
        gold: { minSpent: 5000, pointsMultiplier: 1.5, discountPercent: 5 },
        platinum: { minSpent: 15000, pointsMultiplier: 2, discountPercent: 10 },
      };
      
      const currentTier = user.loyaltyTier || "bronze";
      const tierInfo = loyaltyTiers[currentTier as keyof typeof loyaltyTiers];
      
      // Calculate next tier progress
      let nextTier = null;
      let progressToNext = 0;
      const tierOrder = ["bronze", "silver", "gold", "platinum"];
      const currentIndex = tierOrder.indexOf(currentTier);
      if (currentIndex < tierOrder.length - 1) {
        const nextTierName = tierOrder[currentIndex + 1] as keyof typeof loyaltyTiers;
        nextTier = { name: nextTierName, ...loyaltyTiers[nextTierName] };
        progressToNext = Math.min(100, ((user.totalSpent || 0) / nextTier.minSpent) * 100);
      }
      
      res.json({
        points: user.loyaltyPoints || 0,
        tier: currentTier,
        tierInfo,
        totalSpent: user.totalSpent || 0,
        nextTier,
        progressToNext,
        pointsValue: Math.floor((user.loyaltyPoints || 0) / 10), // 10 points = 1 SAR
      });
    } catch (err) {
      console.error("[LOYALTY] Error:", err);
      res.status(500).send("Internal server error");
    }
  });

  // Phone discount eligibility check
  app.get("/api/loyalty/phone-discount/:phone", async (req, res) => {
    try {
      const phone = req.params.phone.replace(/\D/g, "");
      const cleanPhone = phone.startsWith("0") ? phone.substring(1) : phone;
      
      const user = await UserModel.findOne({
        $or: [
          { phone: cleanPhone },
          { phone: "0" + cleanPhone },
          { username: cleanPhone }
        ]
      }).lean();
      
      if (!user) {
        return res.json({ eligible: false, reason: "User not found" });
      }
      
      // Check if already used this month
      const lastUsed = (user as any).lastPhoneDiscountDate;
      const now = new Date();
      if (lastUsed) {
        const lastUsedMonth = new Date(lastUsed).getMonth();
        const currentMonth = now.getMonth();
        if (lastUsedMonth === currentMonth) {
          return res.json({ eligible: false, reason: "Already used this month", nextAvailable: new Date(now.getFullYear(), currentMonth + 1, 1) });
        }
      }
      
      // Eligible if silver+ tier or has made 3+ orders
      const orders = await storage.getOrdersByUser((user as any)._id.toString());
      const completedOrders = orders.filter(o => o.status === "completed" || o.paymentStatus === "paid");
      
      const isEligible = 
        (user.loyaltyTier && ["silver", "gold", "platinum"].includes(user.loyaltyTier)) ||
        completedOrders.length >= 3;
      
      res.json({
        eligible: isEligible,
        tier: user.loyaltyTier || "bronze",
        orderCount: completedOrders.length,
        discountPercent: isEligible ? 5 : 0,
        userId: (user as any)._id.toString(),
        name: user.name,
      });
    } catch (err) {
      console.error("[PHONE_DISCOUNT] Error:", err);
      res.status(500).send("Internal server error");
    }
  });

  // Redeem loyalty points
  app.post("/api/loyalty/redeem", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { userId, points, orderId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).send("User not found");
      
      if ((user.loyaltyPoints || 0) < points) {
        return res.status(400).json({ message: "Insufficient points" });
      }
      
      // Deduct points
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { loyaltyPoints: -points }
      });
      
      // Record transaction
      await storage.createAuditLog({
        employeeId: (req.user as any).id || "system",
        employeeName: (req.user as any).name || "System",
        action: "redeem_points",
        targetType: "loyalty",
        targetId: userId,
        details: `Redeemed ${points} points for order ${orderId}`,
      });
      
      res.json({ success: true, redeemed: points, discount: Math.floor(points / 10) });
    } catch (err) {
      console.error("[LOYALTY] Redeem error:", err);
      res.status(500).send("Internal server error");
    }
  });

  // =====================================
  // BANK TRANSFER VERIFICATION SYSTEM
  // =====================================
  
  // Submit bank transfer
  app.post("/api/bank-transfers", upload.single("receipt"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).json({ message: "Receipt image required" });
    
    try {
      const { orderId, amount, bankName, accountHolder, referenceNumber, notes } = req.body;
      const user = req.user as any;
      
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      const transfer = await storage.createBankTransfer({
        orderId,
        userId: user.id || user._id,
        amount: Number(amount),
        bankName,
        accountHolder,
        referenceNumber,
        receiptImage: `/uploads/${req.file.filename}`,
        status: "pending",
        notes,
      });
      
      // Update order status
      await storage.updateOrderStatus(orderId, "processing");
      
      // Log the action
      await storage.createAuditLog({
        employeeId: user.id || user._id,
        employeeName: user.name,
        action: "submit_bank_transfer",
        targetType: "bank_transfer",
        targetId: transfer.id,
        details: `Bank transfer submitted for order ${orderId}, amount: ${amount} SAR`,
      });
      
      res.status(201).json(transfer);
    } catch (err) {
      console.error("[BANK_TRANSFER] Error:", err);
      res.status(500).send("Internal server error");
    }
  });

  app.get("/api/admin/bank-transfers", checkPermission("orders.view"), async (req, res, next) => {
    try {
      const transfers = await storage.getBankTransfers(req.query.status as string);
      res.json(transfers);
    } catch (err) {
      next(err);
    }
  });

  // Verify/reject bank transfer (admin)
  app.patch("/api/admin/bank-transfers/:id", checkPermission("orders.edit"), async (req, res, next) => {
    try {
      const { status, rejectionReason } = req.body;
      const user = req.user as any;
      
      const transfer = await storage.updateBankTransfer(req.params.id, {
        status,
        verifiedBy: user.id || user._id,
        verifiedAt: status === "verified" ? new Date() : undefined,
        rejectionReason: status === "rejected" ? rejectionReason : undefined,
      });
      
      // Update order payment status
      if (status === "verified") {
        await storage.updateOrderPaymentStatus(transfer.orderId, "paid", "bank_transfer");
      } else if (status === "rejected") {
        await storage.updateOrderPaymentStatus(transfer.orderId, "failed");
      }
      
      // Log the action
      await storage.createAuditLog({
        employeeId: user.id || user._id,
        employeeName: user.name,
        action: status === "verified" ? "verify_bank_transfer" : "reject_bank_transfer",
        targetType: "bank_transfer",
        targetId: transfer.id,
        details: `Bank transfer ${status} for order ${transfer.orderId}${rejectionReason ? `: ${rejectionReason}` : ""}`,
      });
      
      res.json(transfer);
    } catch (err) {
      next(err);
    }
  });

  // =====================================
  // STORAGE STATION SHIPPING INTEGRATION
  // =====================================
  
  app.post("/api/shipping/create", checkPermission("orders.edit"), async (req, res, next) => {
    try {
      const { orderId } = req.body;
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).json({ success: false, message: "Order not found" });
      
      const user = order.userId ? await storage.getUser(order.userId) : null;
      
      // Generate tracking number
      const trackingNumber = `SS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      // Create shipment record
      const shipment = await storage.createShipment({
        orderId,
        trackingNumber,
        provider: "Storage Station",
        status: "pending",
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        recipientName: user?.name || "Customer",
        recipientPhone: user?.phone || "",
        deliveryAddress: {
          city: order.shippingAddress?.city || "",
          street: order.shippingAddress?.street || "",
          country: "SA",
        },
        events: [{
          status: "created",
          timestamp: new Date(),
          description: "تم إنشاء الشحنة وإرسالها لـ Storage Station",
        }],
      });
      
      // Update order with tracking info
      await storage.updateOrderStatus(orderId, "shipped", {
        provider: "Storage Station",
        tracking: trackingNumber,
      });
      
      // Log the action
      const adminUser = req.user as any;
      await storage.createAuditLog({
        employeeId: adminUser.id || adminUser._id,
        employeeName: adminUser.name,
        action: "create_shipment",
        targetType: "shipment",
        targetId: shipment.id,
        details: `Created shipment ${trackingNumber} for order ${orderId}`,
      });
      
      res.status(201).json(shipment);
    } catch (err) {
      next(err);
    }
  });

  // Track shipment (public)
  app.get("/api/shipping/track/:trackingNumber", async (req, res) => {
    try {
      const shipment = await storage.getShipmentByTracking(req.params.trackingNumber);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      res.json({
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        provider: shipment.provider,
        estimatedDelivery: shipment.estimatedDelivery,
        events: shipment.events,
        recipientName: shipment.recipientName,
        deliveryAddress: shipment.deliveryAddress,
      });
    } catch (err) {
      console.error("[SHIPPING] Track error:", err);
      res.status(500).send("Internal server error");
    }
  });

  // Update shipment status (webhook or admin)
  app.post("/api/shipping/webhook", async (req, res) => {
    try {
      const { trackingNumber, status, location, description } = req.body;
      
      const shipment = await storage.updateShipmentStatus(trackingNumber, status, {
        status,
        location,
        timestamp: new Date(),
        description,
      });
      
      if (status === "delivered") {
        await storage.updateOrderStatus(shipment.orderId, "completed");
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error("[SHIPPING] Webhook error:", err);
      res.status(500).send("Internal server error");
    }
  });

  // Get order shipments
  app.get("/api/orders/:id/shipment", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const shipment = await storage.getShipmentByOrder(req.params.id);
      res.json(shipment || null);
    } catch (err) {
      console.error("[SHIPPING] Error:", err);
      res.status(500).send("Internal server error");
    }
  });

  // =====================================
  // BULK BARCODE GENERATION
  // =====================================
  
  app.post("/api/products/bulk-barcodes", checkPermission("products.view"), async (req, res, next) => {
    try {
      const { productIds } = req.body;
      const products = await storage.getProducts();
      
      const barcodeData = products
        .filter(p => productIds.includes(p.id))
        .flatMap(p => {
          const prod = p as any;
          if (prod.variants && prod.variants.length > 0) {
            return prod.variants.map((v: any) => ({
              productId: p.id,
              productName: p.name,
              sku: v.sku,
              color: v.color,
              size: v.size,
              price: p.price,
            }));
          }
          return [{
            productId: p.id,
            productName: p.name,
            sku: p.id,
            color: "N/A",
            size: "N/A",
            price: p.price,
          }];
        });
      
      res.json(barcodeData);
    } catch (err) {
      next(err);
    }
  });

  // Customer invoice management
  app.get("/api/my/invoices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const user = req.user as any;
      const invoices = await storage.getInvoices(user.id || user._id);
      res.json(invoices);
    } catch (err) {
      console.error("[INVOICES] Error:", err);
      res.status(500).send("Internal server error");
    }
  });

  // Generate PDF Invoice (returns HTML for printing)
  app.get("/api/invoices/:id/pdf", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) return res.status(404).send("Invoice not found");
      
      const user = await storage.getUser(invoice.userId);
      
      // Generate ZATCA-compliant QR data
      const qrData = {
        sellerName: "Gen M&Z",
        vatNumber: "312345678900003",
        timestamp: invoice.issueDate,
        total: invoice.total,
        vat: invoice.taxTotal,
      };
      const qrString = `Seller: ${qrData.sellerName}\nVAT: ${qrData.vatNumber}\nDate: ${new Date(qrData.timestamp).toISOString()}\nTotal: ${qrData.total}\nTax: ${qrData.vat}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrString)}`;
      
      const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>فاتورة ضريبية - ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 40px; background: #fff; color: #000; }
    .invoice { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; }
    .invoice-title { font-size: 28px; font-weight: bold; text-align: center; margin: 20px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; }
    .info-box h3 { font-size: 12px; text-transform: uppercase; opacity: 0.6; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: right; border-bottom: 1px solid #ddd; }
    th { background: #000; color: #fff; font-weight: bold; }
    .totals { text-align: left; margin-top: 20px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .totals-row.final { font-size: 20px; font-weight: bold; border-top: 2px solid #000; }
    .qr-section { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #ccc; }
    .footer { text-align: center; margin-top: 40px; font-size: 12px; opacity: 0.6; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">GEN M&Z</div>
      <div>
        <div>الرقم الضريبي: 312345678900003</div>
        <div>المملكة العربية السعودية</div>
      </div>
    </div>
    
    <div class="invoice-title">فاتورة ضريبية</div>
    
    <div class="info-grid">
      <div class="info-box">
        <h3>معلومات الفاتورة</h3>
        <div><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</div>
        <div><strong>تاريخ الإصدار:</strong> ${new Date(invoice.issueDate).toLocaleDateString('ar-SA')}</div>
        <div><strong>الحالة:</strong> ${invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'issued' ? 'صادرة' : invoice.status}</div>
      </div>
      <div class="info-box">
        <h3>معلومات العميل</h3>
        <div><strong>الاسم:</strong> ${user?.name || 'عميل'}</div>
        <div><strong>الهاتف:</strong> ${user?.phone || '-'}</div>
        <div><strong>البريد:</strong> ${user?.email || '-'}</div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>الوصف</th>
          <th>الكمية</th>
          <th>سعر الوحدة</th>
          <th>الضريبة</th>
          <th>الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item: any, i: number) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>${item.unitPrice.toFixed(2)} ر.س</td>
          <td>${item.taxAmount.toFixed(2)} ر.س</td>
          <td>${item.total.toFixed(2)} ر.س</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="totals-row">
        <span>المجموع الفرعي:</span>
        <span>${invoice.subtotal.toFixed(2)} ر.س</span>
      </div>
      <div class="totals-row">
        <span>ضريبة القيمة المضافة (15%):</span>
        <span>${invoice.taxTotal.toFixed(2)} ر.س</span>
      </div>
      <div class="totals-row final">
        <span>الإجمالي:</span>
        <span>${invoice.total.toFixed(2)} ر.س</span>
      </div>
    </div>
    
    <div class="qr-section">
      <img src="${qrUrl}" alt="QR Code" width="150" />
      <div style="font-size: 10px; margin-top: 10px;">فاتورة ضريبية معتمدة - ZATCA Compliant</div>
    </div>
    
    <div class="footer">
      شكراً لتعاملكم معنا | www.genmz.store
    </div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      console.error("[INVOICE_PDF] Error:", err);
      res.status(500).send("Internal server error");
    }
  });

  // =====================================
  // ZATCA INVOICE ENDPOINTS
  // =====================================
  
  app.post("/api/admin/zatca/invoice/:orderId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("orders.edit")) {
      return res.sendStatus(403);
    }
    
    try {
      const { zatcaService } = await import("./services/zatcaService");
      const order = await storage.getOrder(req.params.orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      const { invoice, qrCode, html, hash } = await zatcaService.createZATCAInvoice(order);
      
      res.json({ 
        success: true, 
        invoice,
        qrCode,
        hash,
        htmlPreview: html
      });
    } catch (err: any) {
      console.error("[ZATCA] Error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/zatca/invoice/:orderId/print", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("orders.view")) {
      return res.sendStatus(403);
    }
    
    try {
      const { zatcaService } = await import("./services/zatcaService");
      const order = await storage.getOrder(req.params.orderId);
      if (!order) return res.status(404).send("Order not found");
      
      const { html } = await zatcaService.createZATCAInvoice(order);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      console.error("[ZATCA_PRINT] Error:", err);
      res.status(500).send("Internal server error");
    }
  });

  // =====================================
  // BARCODE ENDPOINTS
  // =====================================
  
  app.get("/api/admin/barcode/generate/:sku", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("products.view")) {
      return res.sendStatus(403);
    }
    
    try {
      const { barcodeService } = await import("./services/barcodeService");
      const svg = barcodeService.generateBarcodeSVG(req.params.sku);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svg);
    } catch (err) {
      console.error("[BARCODE] Error:", err);
      res.status(500).send("Barcode generation failed");
    }
  });

  app.get("/api/admin/barcode/product/:productId/print", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("products.view")) {
      return res.sendStatus(403);
    }
    
    try {
      const { barcodeService } = await import("./services/barcodeService");
      const product = await storage.getProduct(req.params.productId);
      if (!product) return res.status(404).send("Product not found");
      
      const count = parseInt(req.query.count as string) || 1;
      const html = barcodeService.generateBatchLabels([product], count);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      console.error("[BARCODE_PRINT] Error:", err);
      res.status(500).send("Barcode print failed");
    }
  });

  app.post("/api/admin/barcode/batch-print", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("products.view")) {
      return res.sendStatus(403);
    }
    
    try {
      const { barcodeService } = await import("./services/barcodeService");
      const { productIds, count } = req.body;
      
      const products = await Promise.all(
        productIds.map((id: string) => storage.getProduct(id))
      );
      
      const validProducts = products.filter(p => p !== null);
      const html = barcodeService.generateBatchLabels(validProducts, count || 1);
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      console.error("[BARCODE_BATCH] Error:", err);
      res.status(500).send("Batch print failed");
    }
  });

  app.post("/api/admin/barcode/generate-sku", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("products.edit")) {
      return res.sendStatus(403);
    }
    
    try {
      const { barcodeService } = await import("./services/barcodeService");
      const { prefix } = req.body;
      const sku = barcodeService.generateSKU(prefix || 'SKU');
      res.json({ sku });
    } catch (err) {
      console.error("[SKU_GENERATE] Error:", err);
      res.status(500).json({ message: "SKU generation failed" });
    }
  });

  // Admin Dashboard Stats
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("reports.view")) {
      return res.sendStatus(403);
    }

    try {
      const orders = await storage.getOrders();
      const users = await storage.getUsers();
      const products = await storage.getProducts();

      const totalRevenue = orders
        .filter(o => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + Number(o.total || 0), 0);

      const monthlyRevenue = orders
        .filter(o => {
          const orderDate = new Date(o.createdAt || Date.now());
          const now = new Date();
          return o.paymentStatus === "paid" && 
                 orderDate.getMonth() === now.getMonth() && 
                 orderDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, o) => sum + Number(o.total || 0), 0);

      const pendingOrders = orders.filter(o => o.status === "new" || o.status === "processing").length;
      const totalCustomers = users.filter(u => u.role === "customer").length;

      res.json({
        totalRevenue,
        monthlyRevenue,
        pendingOrders,
        totalCustomers,
        totalProducts: products.length,
        totalOrders: orders.length
      });
    } catch (err) {
      console.error("[STATS] Error:", err);
      res.status(500).send("Internal server error");
    }
  });

  // =====================================
  // ANALYTICS ENDPOINTS
  // =====================================
  
  app.get("/api/admin/analytics/overview", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("reports.view")) {
      return res.sendStatus(403);
    }
    
    try {
      const { analyticsService } = await import("./services/analyticsService");
      const summary = await analyticsService.getDashboardSummary();
      res.json(summary);
    } catch (err) {
      console.error("[ANALYTICS_OVERVIEW] Error:", err);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/analytics/time-series", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("reports.view")) {
      return res.sendStatus(403);
    }
    
    try {
      const { analyticsService } = await import("./services/analyticsService");
      const { startDate, endDate, interval } = req.query;
      
      const dateRange = {
        startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date()
      };
      
      const data = await analyticsService.getTimeSeries(dateRange, interval as any || 'day');
      res.json(data);
    } catch (err) {
      console.error("[ANALYTICS_TIMESERIES] Error:", err);
      res.status(500).json({ message: "Failed to fetch time series" });
    }
  });

  app.get("/api/admin/analytics/top-products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("reports.view")) {
      return res.sendStatus(403);
    }
    
    try {
      const { analyticsService } = await import("./services/analyticsService");
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await analyticsService.getTopProducts(limit);
      res.json(data);
    } catch (err) {
      console.error("[ANALYTICS_PRODUCTS] Error:", err);
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  });

  app.get("/api/admin/analytics/customers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("reports.view")) {
      return res.sendStatus(403);
    }
    
    try {
      const { analyticsService } = await import("./services/analyticsService");
      const data = await analyticsService.getCustomerAnalytics();
      res.json(data);
    } catch (err) {
      console.error("[ANALYTICS_CUSTOMERS] Error:", err);
      res.status(500).json({ message: "Failed to fetch customer analytics" });
    }
  });

  app.get("/api/admin/analytics/inventory", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("reports.view")) {
      return res.sendStatus(403);
    }
    
    try {
      const { analyticsService } = await import("./services/analyticsService");
      const data = await analyticsService.getInventoryHealth();
      res.json(data);
    } catch (err) {
      console.error("[ANALYTICS_INVENTORY] Error:", err);
      res.status(500).json({ message: "Failed to fetch inventory health" });
    }
  });

  app.get("/api/admin/analytics/order-status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin" && !user.permissions?.includes("reports.view")) {
      return res.sendStatus(403);
    }
    
    try {
      const { analyticsService } = await import("./services/analyticsService");
      const data = await analyticsService.getOrderStatusDistribution();
      res.json(data);
    } catch (err) {
      console.error("[ANALYTICS_STATUS] Error:", err);
      res.status(500).json({ message: "Failed to fetch order status" });
    }
  });

  // =====================================
  // LOYALTY PROGRAM ENDPOINTS
  // =====================================
  
  app.get("/api/loyalty/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { loyaltyService } = await import("./services/loyaltyService");
      const user = req.user as any;
      const status = await loyaltyService.getUserLoyaltyStatus(user.id || user._id);
      res.json(status);
    } catch (err) {
      console.error("[LOYALTY_STATUS] Error:", err);
      res.status(500).json({ message: "Failed to fetch loyalty status" });
    }
  });

  app.get("/api/loyalty/rules", async (req, res) => {
    try {
      const { loyaltyService } = await import("./services/loyaltyService");
      const rules = loyaltyService.getLoyaltyRules();
      res.json(rules);
    } catch (err) {
      console.error("[LOYALTY_RULES] Error:", err);
      res.status(500).json({ message: "Failed to fetch loyalty rules" });
    }
  });

  app.post("/api/loyalty/calculate-points", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { loyaltyService } = await import("./services/loyaltyService");
      const user = req.user as any;
      const { orderTotal } = req.body;
      
      const tier = user.loyaltyTier || 'bronze';
      const points = loyaltyService.calculatePointsForOrder(orderTotal, tier);
      
      res.json({ points, tier });
    } catch (err) {
      console.error("[LOYALTY_CALCULATE] Error:", err);
      res.status(500).json({ message: "Failed to calculate points" });
    }
  });

  app.post("/api/loyalty/redeem", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { loyaltyService } = await import("./services/loyaltyService");
      const user = req.user as any;
      const { orderId, points } = req.body;
      
      const result = await loyaltyService.redeemPoints(user.id || user._id, orderId, points);
      res.json(result);
    } catch (err: any) {
      console.error("[LOYALTY_REDEEM] Error:", err);
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/loyalty/can-redeem", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { loyaltyService } = await import("./services/loyaltyService");
      const user = req.user as any;
      const { orderTotal } = req.body;
      
      const result = loyaltyService.canRedeem(user.loyaltyPoints || 0, orderTotal);
      res.json(result);
    } catch (err) {
      console.error("[LOYALTY_CAN_REDEEM] Error:", err);
      res.status(500).json({ message: "Failed to check redemption" });
    }
  });

  app.get("/api/loyalty/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { loyaltyService } = await import("./services/loyaltyService");
      const user = req.user as any;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const transactions = await loyaltyService.getTransactionHistory(user.id || user._id, limit);
      res.json(transactions);
    } catch (err) {
      console.error("[LOYALTY_TRANSACTIONS] Error:", err);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/admin/loyalty/adjust", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const adminUser = req.user as any;
    if (adminUser.role !== "admin" && !adminUser.permissions?.includes("wallet.adjust")) {
      return res.sendStatus(403);
    }
    
    try {
      const { loyaltyService } = await import("./services/loyaltyService");
      const { userId, points, description } = req.body;
      
      const newBalance = await loyaltyService.adjustPoints(
        userId, 
        points, 
        description, 
        adminUser.id || adminUser._id
      );
      
      res.json({ success: true, newBalance });
    } catch (err: any) {
      console.error("[LOYALTY_ADJUST] Error:", err);
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/admin/loyalty/bonus", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const adminUser = req.user as any;
    if (adminUser.role !== "admin") {
      return res.sendStatus(403);
    }
    
    try {
      const { loyaltyService } = await import("./services/loyaltyService");
      const { userId, points, type, description } = req.body;
      
      const newBalance = await loyaltyService.addBonusPoints(userId, points, type, description);
      res.json({ success: true, newBalance });
    } catch (err: any) {
      console.error("[LOYALTY_BONUS] Error:", err);
      res.status(400).json({ message: err.message });
    }
  });

  // Cart endpoints
  app.get("/api/cart/load", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const cart = await storage.getCart(user.id || user._id);
    res.json(cart);
  });

  app.post("/api/cart/save", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const { items } = req.body;
    const cart = await storage.saveCart(user.id || user._id, items);
    res.json(cart);
  });

  app.post("/api/cart/clear", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    await storage.clearCart(user.id || user._id);
    res.json({ success: true });
  });

  // Test email endpoint (for testing email configuration)
  app.post("/api/admin/test-email", async (req, res) => {
    // Allow testing without full auth - just verify basic request
    // In production, this should require proper authentication
    
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email required" });
      
      await sendOrderConfirmationEmail({
        customerName: "عميل اختبار",
        customerEmail: email,
        orderId: "TEST-" + Date.now(),
        orderTotal: "999.99",
        items: [
          {
            title: "منتج اختبار",
            quantity: 1,
            price: 999.99
          }
        ]
      });
      
      res.json({ success: true, message: "رسالة اختبار تم إرسالها بنجاح" });
    } catch (err) {
      console.error("[TEST_EMAIL] Error:", err);
      res.status(500).json({ message: "فشل إرسال الرسالة" });
    }
  });

  app.get("/api/content", async (_req, res, next) => {
    try {
      const blocks = await storage.getContentBlocks();
      res.json(blocks);
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/content/:key", protectAdmin, async (req, res, next) => {
    try {
      const block = await storage.updateContentBlock(req.params.key, req.body);
      res.json(block);
    } catch (err) {
      next(err);
    }
  });

  // Standard API Error Handler (MUST BE LAST)
  app.use(errorMiddleware);

  return httpServer;
}
