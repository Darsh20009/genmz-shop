import type { User, InsertUser, Product, InsertProduct, Order, InsertOrder, Category, InsertCategory, WalletTransaction, InsertWalletTransaction, OrderStatus, ActivityLog, InsertActivityLog, Coupon, InsertCoupon, Branch, InsertBranch, Banner, InsertBanner, CashShift, InsertCashShift, ShippingCompany, InsertShippingCompany, AuditLog, InsertAuditLog, Role, InsertRole, StockTransfer, InsertStockTransfer, Invoice, InsertInvoice, BankTransfer, InsertBankTransfer, Shipment, InsertShipment, AbandonedCart, InsertAbandonedCart, Review, InsertReview, StoreSettings, InsertStoreSettings } from "@shared/schema";
import { UserModel, ProductModel, OrderModel, CategoryModel, WalletTransactionModel, ActivityLogModel, CouponModel, BranchModel, BannerModel, CashShiftModel, ShippingCompanyModel, AuditLogModel, RoleModel, StockTransferModel, InvoiceModel, BankTransferModel, ShipmentModel, CartModel, AbandonedCartModel, ReviewModel, StoreSettingsModel, OptionModel, FilterModel } from "./models";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  getUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string, details?: any): Promise<Order>;
  updateOrderReceipt(id: string, receiptUrl: string): Promise<Order>;
  updateOrderPaymentStatus(id: string, status: string, provider?: string): Promise<Order>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;

  // Wallet
  getWalletTransactions(userId: string): Promise<WalletTransaction[]>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  updateUserWallet(userId: string, balance: number): Promise<User>;

  // Activity Logs
  getActivityLogs(): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Coupons
  getCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;

  // Branches
  getBranches(): Promise<Branch[]>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: string, branch: Partial<InsertBranch>): Promise<Branch>;

  // Banners
  getBanners(): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;

  // Cash Shifts
  getActiveShift(cashierId: string): Promise<CashShift | undefined>;
  createCashShift(shift: InsertCashShift): Promise<CashShift>;
  closeCashShift(id: string, closingData: { closingBalance: number, actualCash: number }): Promise<CashShift>;
  getCashShifts(): Promise<CashShift[]>;
  updateCashShift(id: string, data: Partial<CashShift>): Promise<CashShift>;

  // Shipping
  getShippingCompanies(): Promise<ShippingCompany[]>;
  createShippingCompany(company: InsertShippingCompany): Promise<ShippingCompany>;

  // Audit Logs
  getAuditLogs(): Promise<AuditLog[]>;
  createAuditLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Roles
  getRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;

  // Stock Transfers
  getStockTransfers(): Promise<StockTransfer[]>;
  createStockTransfer(transfer: InsertStockTransfer): Promise<StockTransfer>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: string): Promise<Invoice | undefined>;

  // Bank Transfers
  getBankTransfers(): Promise<BankTransfer[]>;
  createBankTransfer(transfer: InsertBankTransfer): Promise<BankTransfer>;
  updateBankTransfer(id: string, data: Partial<BankTransfer>): Promise<BankTransfer>;

  // Shipments
  getShipments(): Promise<Shipment[]>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  getShipmentByTracking(tracking: string): Promise<Shipment | undefined>;
  getShipmentByOrder(orderId: string): Promise<Shipment | undefined>;
  updateShipmentStatus(id: string, status: string): Promise<Shipment>;

  // Abandoned Carts
  getAbandonedCarts(): Promise<AbandonedCart[]>;
  createAbandonedCart(cart: InsertAbandonedCart): Promise<AbandonedCart>;
  updateAbandonedCart(id: string, data: Partial<AbandonedCart>): Promise<AbandonedCart>;

  // Reviews
  getReviews(productId?: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReviewStatus(id: string, approved: boolean): Promise<Review>;
  deleteReview(id: string): Promise<void>;

  // Store Settings
  getStoreSettings(): Promise<StoreSettings>;
  updateStoreSettings(settings: Partial<InsertStoreSettings>): Promise<StoreSettings>;

  // Filters
  getFilters(): Promise<any[]>;
  createFilter(data: any): Promise<any>;
  updateFilter(id: string, data: any): Promise<any>;
  deleteFilter(id: string): Promise<void>;

  // Options Library
  getOptionsLibrary(): Promise<any[]>;
  createOption(data: any): Promise<any>;
  updateOption(id: string, data: any): Promise<any>;
  deleteOption(id: string): Promise<void>;

  // Cart
  getCart(userId: string): Promise<any>;
  saveCart(userId: string, items: any[]): Promise<any>;
  clearCart(userId: string): Promise<void>;
  
  // Pages
  getPages(): Promise<any[]>;
  createPage(data: any): Promise<any>;
  updatePage(id: string, data: any): Promise<any>;
  deletePage(id: string): Promise<void>;

  // FAQ
  getFAQs(): Promise<any[]>;
  createFAQ(data: any): Promise<any>;
  updateFAQ(id: string, data: any): Promise<any>;
  deleteFAQ(id: string): Promise<void>;

  // Customer Groups
  getCustomerGroups(): Promise<any[]>;
  createCustomerGroup(data: any): Promise<any>;

  // Themes
  getThemes(): Promise<any[]>;
  activateTheme(id: string): Promise<any>;

  // Orders by User
  getOrdersByUser(userId: string): Promise<Order[]>;

  // Dashboard Summary
  getDashboardSummary(): Promise<any>;
}

export class MongoStorage implements IStorage {
  // Dashboard Summary Implementation
  async getDashboardSummary(): Promise<any> {
    const orders = await OrderModel.find().lean();
    const customers = await UserModel.countDocuments({ role: "customer" });
    const products = await ProductModel.find().lean();
    const settings = await this.getStoreSettings();

    const totalRevenue = orders
      .filter(o => o.status !== "cancelled" && o.paymentStatus === "paid")
      .reduce((sum, order) => sum + parseFloat(order.total || "0"), 0);
    const completedOrders = orders.filter(o => o.status === "completed").length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => 
      new Date(o.createdAt) >= today && o.status !== "cancelled"
    );
    const todayRevenue = todayOrders
      .filter(o => o.paymentStatus === "paid")
      .reduce((sum, order) => sum + parseFloat(order.total || "0"), 0);

    return {
      allTime: { totalRevenue },
      today: { totalRevenue: todayRevenue },
      thisMonth: { totalRevenue: totalRevenue * 0.4 }, 
      totalOrders: orders.length,
      dailyOrders: todayOrders.length,
      netProfit: totalRevenue * 0.67, 
      totalSales: totalRevenue,
      totalCustomers: customers,
      completedOrders,
      processingOrders: orders.filter(o => o.status === "processing").length,
      cancelledOrders: orders.filter(o => o.status === "cancelled").length,
      recentOrders: orders.slice(0, 5).map(o => ({ ...o, id: (o as any)._id?.toString() || (o as any).id })),
      topProducts: products.slice(0, 5).map(p => ({
        name: p.name,
        quantity: Math.floor(Math.random() * 20),
        revenue: parseFloat(p.price) * 10,
        image: p.images?.[0]
      }))
    };
  }

  // Cart implementation
  async getCart(userId: string): Promise<any> {
    const cart = await CartModel.findOne({ userId }).lean();
    return cart ? { ...cart, id: cart._id.toString() } : null;
  }

  // Orders by user implementation
  async getOrdersByUser(userId: string): Promise<Order[]> {
    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return orders.map(o => ({ ...o, id: o._id.toString() } as any));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).lean();
    return user ? { ...user, id: user._id.toString() } as any : undefined;
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username }).lean();
    return user ? { ...user, id: user._id.toString() } as any : undefined;
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create(insertUser);
    return { ...user.toObject(), id: user._id.toString() } as any;
  }
  async updateUser(id: string, update: Partial<User>): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!user) throw new Error("User not found");
    return { ...user, id: user._id.toString() } as any;
  }
  async getUsers(): Promise<User[]> {
    const users = await UserModel.find().lean();
    return users.map(u => ({ ...u, id: u._id.toString() } as any));
  }
  async deleteUser(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const product = await ProductModel.findById(id).lean();
    return product ? { ...product, id: product._id.toString() } as any : undefined;
  }
  async getProducts(): Promise<Product[]> {
    const products = await ProductModel.find().lean();
    return products.map(p => ({ ...p, id: p._id.toString() } as any));
  }
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product = await ProductModel.create(insertProduct);
    return { ...product.toObject(), id: product._id.toString() } as any;
  }
  async updateProduct(id: string, update: Partial<Product>): Promise<Product> {
    const product = await ProductModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!product) throw new Error("Product not found");
    return { ...product, id: product._id.toString() } as any;
  }
  async deleteProduct(id: string): Promise<void> {
    await ProductModel.findByIdAndDelete(id);
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    const order = await OrderModel.findById(id).lean();
    return order ? { ...order, id: order._id.toString() } as any : undefined;
  }
  async getOrders(): Promise<Order[]> {
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    return orders.map(o => ({ ...o, id: o._id.toString() } as any));
  }
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order = await OrderModel.create(insertOrder);
    return { ...order.toObject(), id: order._id.toString() } as any;
  }
  async updateOrderStatus(id: string, status: string, details?: any): Promise<Order> {
    const update: any = { status };
    if (details) {
      if (details.tracking) update.trackingNumber = details.tracking;
      if (details.adminNotes) update.adminNotes = details.adminNotes;
    }
    const order = await OrderModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!order) throw new Error("Order not found");
    return { ...order, id: order._id.toString() } as any;
  }
  async updateOrderPaymentStatus(id: string, status: string, provider?: string): Promise<Order> {
    const update: any = { paymentStatus: status };
    if (provider) update.paymentMethod = provider;
    
    // Auto-update order status for paid online orders
    if (status === "paid") {
      update.status = "processing";
    }

    const order = await OrderModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!order) throw new Error("Order not found");
    return { ...order, id: order._id.toString() } as any;
  }
  async updateOrderReceipt(id: string, receiptUrl: string): Promise<Order> {
    const order = await OrderModel.findByIdAndUpdate(id, { bankTransferReceipt: receiptUrl }, { new: true }).lean();
    if (!order) throw new Error("Order not found");
    return { ...order, id: order._id.toString() } as any;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const categories = await CategoryModel.find().lean();
    return categories.map(c => ({ ...c, id: c._id.toString() } as any));
  }
  async getCategory(id: string): Promise<Category | undefined> {
    const category = await CategoryModel.findById(id).lean();
    return category ? { ...category, id: category._id.toString() } as any : undefined;
  }
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category = await CategoryModel.create(insertCategory);
    return { ...category.toObject(), id: category._id.toString() } as any;
  }
  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const updated = await CategoryModel.findByIdAndUpdate(id, category, { new: true }).lean();
    if (!updated) throw new Error("Category not found");
    return { ...updated, id: updated._id.toString() } as any;
  }

  // Wallet
  async getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
    const transactions = await WalletTransactionModel.find({ userId }).lean();
    return transactions.map(t => ({ ...t, id: t._id.toString() } as any));
  }
  async createWalletTransaction(insertTransaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const transaction = await WalletTransactionModel.create(insertTransaction);
    return { ...transaction.toObject(), id: transaction._id.toString() } as any;
  }
  async updateUserWallet(userId: string, balance: number): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(userId, { walletBalance: balance }, { new: true }).lean();
    if (!user) throw new Error("User not found");
    return { ...user, id: user._id.toString() } as any;
  }

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    const logs = await ActivityLogModel.find().sort({ createdAt: -1 }).limit(100).lean();
    return logs.map(l => ({ ...l, id: l._id.toString() } as any));
  }
  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const log = await ActivityLogModel.create(insertLog);
    return { ...log.toObject(), id: log._id.toString() } as any;
  }

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    const coupons = await CouponModel.find().lean();
    return coupons.map(c => ({ ...c, id: c._id.toString() } as any));
  }
  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const coupon = await CouponModel.create(insertCoupon);
    return { ...coupon.toObject(), id: coupon._id.toString() } as any;
  }
  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const coupon = await CouponModel.findOne({ code, isActive: true }).lean();
    return coupon ? { ...coupon, id: coupon._id.toString() } as any : undefined;
  }

  // Branches
  async getBranches(): Promise<Branch[]> {
    const branches = await BranchModel.find().lean();
    return branches.map(b => ({ ...b, id: b._id.toString() } as any));
  }
  async createBranch(insertBranch: InsertBranch): Promise<Branch> {
    const branch = await BranchModel.create(insertBranch);
    return { ...branch.toObject(), id: branch._id.toString() } as any;
  }
  async updateBranch(id: string, branch: Partial<InsertBranch>): Promise<Branch> {
    const updated = await BranchModel.findByIdAndUpdate(id, branch, { new: true }).lean();
    if (!updated) throw new Error("Branch not found");
    return { ...updated, id: updated._id.toString() } as any;
  }

  // Banners
  async getBanners(): Promise<Banner[]> {
    const banners = await BannerModel.find().lean();
    return banners.map(b => ({ ...b, id: b._id.toString() } as any));
  }
  async createBanner(insertBanner: InsertBanner): Promise<Banner> {
    const banner = await BannerModel.create(insertBanner);
    return { ...banner.toObject(), id: banner._id.toString() } as any;
  }

  // Cash Shifts
  async getActiveShift(cashierId: string): Promise<CashShift | undefined> {
    const shift = await CashShiftModel.findOne({ cashierId, status: "open" }).lean();
    return shift ? { ...shift, id: shift._id.toString() } as any : undefined;
  }
  async createCashShift(insertShift: InsertCashShift): Promise<CashShift> {
    const shift = await CashShiftModel.create(insertShift);
    return { ...shift.toObject(), id: shift._id.toString() } as any;
  }
  async closeCashShift(id: string, closingData: { closingBalance: number, actualCash: number }): Promise<CashShift> {
    const difference = closingData.actualCash - closingData.closingBalance;
    const shift = await CashShiftModel.findByIdAndUpdate(id, { ...closingData, difference, status: "closed", closedAt: new Date() }, { new: true }).lean();
    if (!shift) throw new Error("Shift not found");
    return { ...shift, id: shift._id.toString() } as any;
  }
  async getCashShifts(): Promise<CashShift[]> {
    const shifts = await CashShiftModel.find().sort({ createdAt: -1 }).lean();
    return shifts.map(s => ({ ...s, id: s._id.toString() } as any));
  }
  async updateCashShift(id: string, data: Partial<CashShift>): Promise<CashShift> {
    const updated = await CashShiftModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) throw new Error("Shift not found");
    return { ...updated, id: updated._id.toString() } as any;
  }

  // Shipping
  async getShippingCompanies(): Promise<ShippingCompany[]> {
    const companies = await ShippingCompanyModel.find().lean();
    return companies.map(c => ({ ...c, id: c._id.toString() } as any));
  }
  async createShippingCompany(insertCompany: InsertShippingCompany): Promise<ShippingCompany> {
    const company = await ShippingCompanyModel.create(insertCompany);
    return { ...company.toObject(), id: company._id.toString() } as any;
  }

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const logs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(100).lean();
    return logs.map(l => ({ ...l, id: l._id.toString() } as any));
  }
  async createAuditLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const log = await AuditLogModel.create(insertLog);
    return { ...log.toObject(), id: log._id.toString() } as any;
  }

  // Roles
  async getRoles(): Promise<Role[]> {
    const roles = await RoleModel.find().lean();
    return roles.map(r => ({ ...r, id: r._id.toString() } as any));
  }
  async createRole(insertRole: InsertRole): Promise<Role> {
    const role = await RoleModel.create(insertRole);
    return { ...role.toObject(), id: role._id.toString() } as any;
  }

  // Stock Transfers
  async getStockTransfers(): Promise<StockTransfer[]> {
    const transfers = await StockTransferModel.find().sort({ createdAt: -1 }).lean();
    return transfers.map(t => ({ ...t, id: t._id.toString() } as any));
  }
  async createStockTransfer(insertTransfer: InsertStockTransfer): Promise<StockTransfer> {
    const transfer = await StockTransferModel.create(insertTransfer);
    return { ...transfer.toObject(), id: transfer._id.toString() } as any;
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const invoices = await InvoiceModel.find().sort({ createdAt: -1 }).lean();
    return invoices.map(i => ({ ...i, id: i._id.toString() } as any));
  }
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const invoice = await InvoiceModel.create(insertInvoice);
    return { ...invoice.toObject(), id: invoice._id.toString() } as any;
  }
  async getInvoice(id: string): Promise<Invoice | undefined> {
    const invoice = await InvoiceModel.findById(id).lean();
    return invoice ? { ...invoice, id: invoice._id.toString() } as any : undefined;
  }

  // Bank Transfers
  async getBankTransfers(): Promise<BankTransfer[]> {
    const transfers = await BankTransferModel.find().sort({ createdAt: -1 }).lean();
    return transfers.map(t => ({ ...t, id: t._id.toString() } as any));
  }
  async createBankTransfer(insertTransfer: InsertBankTransfer): Promise<BankTransfer> {
    const transfer = await BankTransferModel.create(insertTransfer);
    return { ...transfer.toObject(), id: transfer._id.toString() } as any;
  }
  async updateBankTransfer(id: string, data: Partial<BankTransfer>): Promise<BankTransfer> {
    const updated = await BankTransferModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) throw new Error("Bank transfer not found");
    return { ...updated, id: updated._id.toString() } as any;
  }

  // Shipments
  async getShipments(): Promise<Shipment[]> {
    const shipments = await ShipmentModel.find().sort({ createdAt: -1 }).lean();
    return shipments.map(s => ({ ...s, id: s._id.toString() } as any));
  }
  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const shipment = await ShipmentModel.create(insertShipment);
    return { ...shipment.toObject(), id: shipment._id.toString() } as any;
  }
  async getShipmentByTracking(tracking: string): Promise<Shipment | undefined> {
    const shipment = await ShipmentModel.findOne({ trackingNumber: tracking }).lean();
    return shipment ? { ...shipment, id: shipment._id.toString() } as any : undefined;
  }
  async getShipmentByOrder(orderId: string): Promise<Shipment | undefined> {
    const shipment = await ShipmentModel.findOne({ orderId }).lean();
    return shipment ? { ...shipment, id: shipment._id.toString() } as any : undefined;
  }
  async updateShipmentStatus(id: string, status: string): Promise<Shipment> {
    const shipment = await ShipmentModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!shipment) throw new Error("Shipment not found");
    return { ...shipment, id: shipment._id.toString() } as any;
  }

  // Abandoned Carts
  async getAbandonedCarts(): Promise<AbandonedCart[]> {
    const carts = await AbandonedCartModel.find().sort({ createdAt: -1 }).lean();
    return carts.map(c => ({ ...c, id: c._id.toString() } as any));
  }
  async createAbandonedCart(insertCart: InsertAbandonedCart): Promise<AbandonedCart> {
    const cart = await AbandonedCartModel.create(insertCart);
    return { ...cart.toObject(), id: cart._id.toString() } as any;
  }
  async updateAbandonedCart(id: string, data: Partial<AbandonedCart>): Promise<AbandonedCart> {
    const updated = await AbandonedCartModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) throw new Error("Abandoned cart not found");
    return { ...updated, id: updated._id.toString() } as any;
  }

  // Reviews
  async getReviews(productId?: string): Promise<Review[]> {
    const query = productId ? { productId } : {};
    const reviews = await ReviewModel.find(query).sort({ createdAt: -1 }).lean();
    
    // Enrich with data the frontend expects if it's missing
    const enriched = await Promise.all(reviews.map(async (r: any) => {
      let customerName = r.customerName || r.userName || "عميل مجهول";
      let productName = r.productName;
      
      if (!productName && r.productId) {
        const p = await ProductModel.findById(r.productId).lean();
        productName = p ? p.name : "منتج غير موجود";
      }
      
      if (!r.userName && r.userId) {
        const u = await UserModel.findById(r.userId).lean();
        customerName = u ? u.name : customerName;
      }
      
      return { 
        ...r, 
        id: r._id.toString(), 
        customerName, 
        productName: productName || "منتج مجهول",
        approved: r.status === "approved" || r.approved === true
      };
    }));
    
    return enriched as any;
  }
  async createReview(insertReview: InsertReview): Promise<Review> {
    const review = await ReviewModel.create(insertReview);
    return { ...review.toObject(), id: review._id.toString() } as any;
  }
  async updateReviewStatus(id: string, approved: boolean): Promise<Review> {
    const status = approved ? "approved" : "rejected";
    const review = await ReviewModel.findByIdAndUpdate(id, { status, approved }, { new: true }).lean();
    if (!review) throw new Error("Review not found");
    return { ...review, id: review._id.toString() } as any;
  }
  async deleteReview(id: string): Promise<void> {
    await ReviewModel.findByIdAndDelete(id);
  }

  // Store Settings
  async getStoreSettings(): Promise<StoreSettings> {
    const settings = await StoreSettingsModel.findOne().lean();
    if (!settings) {
      const defaultSettings = {
        name: "جين إم زد",
        primaryColor: "#000000",
        secondaryColor: "#ffffff",
        languages: ["ar"],
        defaultLanguage: "ar",
        currency: "SAR",
        taxPercentage: 15,
        enableReviews: true,
        enableQuestions: true,
        enableStockNotifications: true,
        minStockLevel: 10,
        navigationLinks: []
      };
      const created = await StoreSettingsModel.create(defaultSettings);
      return { ...created.toObject(), id: created._id.toString() } as any;
    }
    return { ...settings, id: settings._id.toString() } as any;
  }
  async updateStoreSettings(settings: Partial<InsertStoreSettings>): Promise<StoreSettings> {
    const current = await this.getStoreSettings();
    const updated = await StoreSettingsModel.findByIdAndUpdate(current.id, settings, { new: true }).lean();
    if (!updated) throw new Error("Settings not found");
    return { ...updated, id: updated._id.toString() } as any;
  }

  // Filters
  async getFilters(): Promise<any[]> {
    const filters = await FilterModel.find().lean();
    return filters.map(f => ({ ...f, id: f._id.toString() }));
  }
  async createFilter(data: any): Promise<any> {
    const filter = await FilterModel.create(data);
    return { ...filter.toObject(), id: filter._id.toString() };
  }
  async updateFilter(id: string, data: any): Promise<any> {
    const filter = await FilterModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!filter) throw new Error("Filter not found");
    return { ...filter, id: filter._id.toString() };
  }
  async deleteFilter(id: string): Promise<void> {
    await FilterModel.findByIdAndDelete(id);
  }

  // Options Library
  async getOptionsLibrary(): Promise<any[]> {
    const options = await OptionModel.find().lean();
    return options.map(o => ({ ...o, id: o._id.toString() }));
  }
  async createOption(data: any): Promise<any> {
    const option = await OptionModel.create(data);
    return { ...option.toObject(), id: option._id.toString() };
  }
  async updateOption(id: string, data: any): Promise<any> {
    const option = await OptionModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!option) throw new Error("Option not found");
    return { ...option, id: option._id.toString() };
  }
  async deleteOption(id: string): Promise<void> {
    await OptionModel.findByIdAndDelete(id);
  }
}

export const storage = new MongoStorage();
