import type { User, InsertUser, Product, InsertProduct, Order, InsertOrder, Category, InsertCategory, WalletTransaction, InsertWalletTransaction, OrderStatus, ActivityLog, InsertActivityLog, Coupon, InsertCoupon, Branch, InsertBranch, Banner, InsertBanner, CashShift, InsertCashShift, ShippingCompany, InsertShippingCompany, AuditLog, InsertAuditLog, Role, InsertRole, StockTransfer, InsertStockTransfer, Invoice, InsertInvoice, BankTransfer, InsertBankTransfer, Shipment, InsertShipment, AbandonedCart, InsertAbandonedCart, Review, InsertReview, StoreSettings, InsertStoreSettings, Page, InsertPage, FAQ, InsertFAQ, CustomerGroup, InsertCustomerGroup, Theme, ContentBlock, InsertContentBlock } from "@shared/schema";
import { UserModel, ProductModel, OrderModel, CategoryModel, WalletTransactionModel, ActivityLogModel, CouponModel, BranchModel, BannerModel, CashShiftModel, ShippingCompanyModel, AuditLogModel, RoleModel, StockTransferModel, InvoiceModel, BankTransferModel, ShipmentModel, CartModel, AbandonedCartModel, ReviewModel, StoreSettingsModel, OptionModel, FilterModel, PageModel, FAQModel, CustomerGroupModel, ThemeModel, ContentBlockModel } from "./models";

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
  getPages(): Promise<Page[]>;
  createPage(data: InsertPage): Promise<Page>;
  updatePage(id: string, data: Partial<InsertPage>): Promise<Page>;
  deletePage(id: string): Promise<void>;

  // FAQ
  getFAQs(): Promise<FAQ[]>;
  createFAQ(data: InsertFAQ): Promise<FAQ>;
  updateFAQ(id: string, data: Partial<InsertFAQ>): Promise<FAQ>;
  deleteFAQ(id: string): Promise<void>;

  // Customer Groups
  getCustomerGroups(): Promise<CustomerGroup[]>;
  createCustomerGroup(data: InsertCustomerGroup): Promise<CustomerGroup>;

  // Themes
  getThemes(): Promise<Theme[]>;
  activateTheme(id: string): Promise<Theme>;

  // Content Blocks
  getContentBlocks(): Promise<ContentBlock[]>;
  getContentBlock(key: string): Promise<ContentBlock | undefined>;
  updateContentBlock(key: string, data: Partial<InsertContentBlock>): Promise<ContentBlock>;

  // Dashboard Summary
  getDashboardSummary(): Promise<any>;
}

export class MongoStorage implements IStorage {
  async getContentBlocks(): Promise<ContentBlock[]> {
    const blocks = await ContentBlockModel.find({ isActive: true }).lean();
    return blocks.map(b => ({ ...b, id: b._id.toString() } as any));
  }

  async getContentBlock(key: string): Promise<ContentBlock | undefined> {
    const block = await ContentBlockModel.findOne({ key }).lean();
    return block ? { ...block, id: block._id.toString() } as any : undefined;
  }

  async updateContentBlock(key: string, data: Partial<InsertContentBlock>): Promise<ContentBlock> {
    const block = await ContentBlockModel.findOneAndUpdate({ key }, data, { upsert: true, new: true }).lean();
    return { ...block, id: block._id.toString() } as any;
  }
  async getDashboardSummary(): Promise<any> {
    const orders = await OrderModel.find().lean();
    const customers = await UserModel.countDocuments({ role: "customer" });
    const products = await ProductModel.find().lean();
    
    const totalRevenue = orders
      .filter(o => o.status !== "cancelled" && (o.paymentStatus === "paid" || o.paymentMethod === "cod"))
      .reduce((sum, order) => sum + parseFloat(order.total || "0"), 0);
    
    const completedOrders = orders.filter(o => o.status === "completed").length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders
      .filter(o => o.status !== "cancelled" && (o.paymentStatus === "paid" || o.paymentMethod === "cod"))
      .reduce((sum, order) => sum + parseFloat(order.total || "0"), 0);

    const netProfit = orders
      .filter(o => o.status !== "cancelled" && (o.paymentStatus === "paid" || o.paymentMethod === "cod"))
      .reduce((sum, order) => sum + parseFloat(order.netProfit || "0"), 0);

    return {
      allTime: { totalRevenue },
      today: { totalRevenue: todayRevenue },
      thisMonth: { totalRevenue: totalRevenue },
      totalOrders: orders.length,
      dailyOrders: todayOrders.length,
      netProfit: netProfit,
      totalSales: totalRevenue,
      totalCustomers: customers,
      completedOrders,
      processingOrders: orders.filter(o => o.status === "processing").length,
      cancelledOrders: orders.filter(o => o.status === "cancelled").length,
      recentOrders: orders.slice(0, 5).map(o => ({ ...o, id: o._id.toString() })),
      topProducts: products.slice(0, 5).map(p => ({
        name: p.name,
        quantity: 0,
        revenue: 0,
        image: p.images?.[0]
      }))
    };
  }

  async getCart(userId: string): Promise<any> {
    const cart = await CartModel.findOne({ userId }).lean();
    return cart ? { ...cart, id: cart._id.toString() } : null;
  }

  async saveCart(userId: string, items: any[]): Promise<any> {
    const cart = await CartModel.findOneAndUpdate({ userId }, { items }, { upsert: true, new: true }).lean();
    return { ...cart, id: cart._id.toString() };
  }

  async clearCart(userId: string): Promise<void> {
    await CartModel.deleteOne({ userId });
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return orders.map(o => ({ ...o, id: o._id.toString() } as any));
  }

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
    const oldOrder = await OrderModel.findById(id).lean();
    if (!oldOrder) throw new Error("Order not found");
    const order = await OrderModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!order) throw new Error("Order not found");
    if (status === "cancelled" && (oldOrder.status as string) !== "cancelled") {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          await ProductModel.updateOne({ _id: item.productId, "variants.sku": item.variantSku }, { $inc: { "variants.$.stock": item.quantity } });
        }
      }
      await OrderModel.findByIdAndUpdate(id, { netProfit: "0" });
    }
    return { ...order, id: order._id.toString() } as any;
  }
  async updateOrderPaymentStatus(id: string, status: string, provider?: string): Promise<Order> {
    const update: any = { paymentStatus: status };
    if (provider) update.paymentMethod = provider;
    if (status === "paid") update.status = "processing";
    const order = await OrderModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!order) throw new Error("Order not found");
    if (status === "refunded") {
      const orderTotal = parseFloat(order.total);
      const user = await UserModel.findById(order.userId);
      if (user) {
        const currentBalance = parseFloat(user.walletBalance || "0");
        await UserModel.findByIdAndUpdate(order.userId, { walletBalance: (currentBalance + orderTotal).toString() });
        await WalletTransactionModel.create({ userId: order.userId, amount: orderTotal, type: "refund", description: `إرجاع قيمة الطلب #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}` });
      }
    }
    return { ...order, id: order._id.toString() } as any;
  }
  async updateOrderReceipt(id: string, receiptUrl: string): Promise<Order> {
    const order = await OrderModel.findByIdAndUpdate(id, { bankTransferReceipt: receiptUrl }, { new: true }).lean();
    if (!order) throw new Error("Order not found");
    return { ...order, id: order._id.toString() } as any;
  }

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

  async getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
    const transactions = await WalletTransactionModel.find({ userId }).lean();
    return transactions.map(t => ({ ...t, id: t._id.toString() } as any));
  }
  async createWalletTransaction(insertTransaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const transaction = await WalletTransactionModel.create(insertTransaction);
    return { ...transaction.toObject(), id: transaction._id.toString() } as any;
  }
  async updateUserWallet(userId: string, balance: number): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(userId, { walletBalance: balance.toString() }, { new: true }).lean();
    if (!user) throw new Error("User not found");
    return { ...user, id: user._id.toString() } as any;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    const logs = await ActivityLogModel.find().sort({ createdAt: -1 }).limit(100).lean();
    return logs.map(l => ({ ...l, id: l._id.toString() } as any));
  }
  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const log = await ActivityLogModel.create(insertLog);
    return { ...log.toObject(), id: log._id.toString() } as any;
  }

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

  async getBanners(): Promise<Banner[]> {
    const banners = await BannerModel.find().lean();
    return banners.map(b => ({ ...b, id: b._id.toString() } as any));
  }
  async createBanner(insertBanner: InsertBanner): Promise<Banner> {
    const banner = await BannerModel.create(insertBanner);
    return { ...banner.toObject(), id: banner._id.toString() } as any;
  }

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

  async getShippingCompanies(): Promise<ShippingCompany[]> {
    const companies = await ShippingCompanyModel.find().lean();
    return companies.map(c => ({ ...c, id: c._id.toString() } as any));
  }
  async createShippingCompany(insertCompany: InsertShippingCompany): Promise<ShippingCompany> {
    const company = await ShippingCompanyModel.create(insertCompany);
    return { ...company.toObject(), id: company._id.toString() } as any;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    const logs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(100).lean();
    return logs.map(l => ({ ...l, id: l._id.toString() } as any));
  }
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const log = await AuditLogModel.create(insertLog);
    return { ...log.toObject(), id: log._id.toString() } as any;
  }

  async getRoles(): Promise<Role[]> {
    const roles = await RoleModel.find().lean();
    return roles.map(r => ({ ...r, id: r._id.toString() } as any));
  }
  async createRole(insertRole: InsertRole): Promise<Role> {
    const role = await RoleModel.create(insertRole);
    return { ...role.toObject(), id: role._id.toString() } as any;
  }

  async getStockTransfers(): Promise<StockTransfer[]> {
    const transfers = await StockTransferModel.find().sort({ createdAt: -1 }).lean();
    return transfers.map(t => ({ ...t, id: t._id.toString() } as any));
  }
  async createStockTransfer(insertTransfer: InsertStockTransfer): Promise<StockTransfer> {
    const transfer = await StockTransferModel.create(insertTransfer);
    return { ...transfer.toObject(), id: transfer._id.toString() } as any;
  }

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

  async getReviews(productId?: string): Promise<Review[]> {
    const query = productId ? { productId } : {};
    const reviews = await ReviewModel.find(query).sort({ createdAt: -1 }).lean();
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
      return { ...r, id: r._id.toString(), customerName, productName: productName || "منتج مجهول", approved: r.status === "approved" || r.approved === true };
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
        navigationLinks: [],
        communication: {
          orderMessages: true,
          abandonedCartAlerts: true,
          reviewRequests: true
        }
      };
      const created = await StoreSettingsModel.create(defaultSettings);
      const obj = created.toObject();
      return { ...obj, id: obj._id.toString() } as any;
    }
    return { ...settings, id: settings._id.toString() } as any;
  }

  async updateStoreSettings(settings: Partial<InsertStoreSettings>): Promise<StoreSettings> {
    const current = await this.getStoreSettings();
    const updated = await StoreSettingsModel.findByIdAndUpdate(current.id, settings, { new: true }).lean();
    if (!updated) throw new Error("Settings not found");
    return { ...updated, id: updated._id.toString() } as any;
  }

  async getFilters(): Promise<any[]> {
    const filters = await FilterModel.find().lean();
    return filters.map(f => ({ ...f, id: f._id.toString() }));
  }
  async createFilter(data: any): Promise<any> {
    const filter = await FilterModel.create(data);
    const obj = filter.toObject();
    return { ...obj, id: obj._id.toString() } as any;
  }
  async updateFilter(id: string, data: any): Promise<any> {
    const filter = await FilterModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!filter) throw new Error("Filter not found");
    return { ...filter, id: filter._id.toString() } as any;
  }
  async deleteFilter(id: string): Promise<void> {
    await FilterModel.findByIdAndDelete(id);
  }

  async getOptionsLibrary(): Promise<any[]> {
    const options = await OptionModel.find().lean();
    return options.map(o => ({ ...o, id: o._id.toString() }));
  }
  async createOption(data: any): Promise<any> {
    const option = await OptionModel.create(data);
    const obj = option.toObject();
    return { ...obj, id: obj._id.toString() } as any;
  }
  async updateOption(id: string, data: any): Promise<any> {
    const option = await OptionModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!option) throw new Error("Option not found");
    return { ...option, id: option._id.toString() } as any;
  }
  async deleteOption(id: string): Promise<void> {
    await OptionModel.findByIdAndDelete(id);
  }

  async getPages(): Promise<Page[]> {
    const pages = await PageModel.find().lean();
    return pages.map(p => ({ ...p, id: p._id.toString() } as any));
  }
  async createPage(data: InsertPage): Promise<Page> {
    const page = await PageModel.create(data);
    return { ...page.toObject(), id: page._id.toString() } as any;
  }
  async updatePage(id: string, data: Partial<InsertPage>): Promise<Page> {
    const updated = await PageModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) throw new Error("Page not found");
    return { ...updated, id: updated._id.toString() } as any;
  }
  async deletePage(id: string): Promise<void> {
    await PageModel.findByIdAndDelete(id);
  }

  async getFAQs(): Promise<FAQ[]> {
    const faqs = await FAQModel.find().sort({ order: 1 }).lean();
    return faqs.map(f => ({ ...f, id: f._id.toString() } as any));
  }
  async createFAQ(data: InsertFAQ): Promise<FAQ> {
    const faq = await FAQModel.create(data);
    return { ...faq.toObject(), id: faq._id.toString() } as any;
  }
  async updateFAQ(id: string, data: Partial<InsertFAQ>): Promise<FAQ> {
    const updated = await FAQModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) throw new Error("FAQ not found");
    return { ...updated, id: updated._id.toString() } as any;
  }
  async deleteFAQ(id: string): Promise<void> {
    await FAQModel.findByIdAndDelete(id);
  }

  async getCustomerGroups(): Promise<CustomerGroup[]> {
    const groups = await CustomerGroupModel.find().lean();
    return groups.map(g => ({ ...g, id: g._id.toString() } as any));
  }
  async createCustomerGroup(data: InsertCustomerGroup): Promise<CustomerGroup> {
    const group = await CustomerGroupModel.create(data);
    return { ...group.toObject(), id: group._id.toString() } as any;
  }

  async getThemes(): Promise<Theme[]> {
    const themes = await ThemeModel.find().lean();
    return themes.map(t => ({ ...t, id: t._id.toString() } as any));
  }
  async activateTheme(id: string): Promise<Theme> {
    await ThemeModel.updateMany({}, { isActive: false });
    const theme = await ThemeModel.findByIdAndUpdate(id, { isActive: true }, { new: true }).lean();
    if (!theme) throw new Error("Theme not found");
    return { ...theme, id: theme._id.toString() } as any;
  }

  async updateCoupon(id: string, data: any): Promise<Coupon> {
    const updated = await CouponModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) throw new Error("Coupon not found");
    return { ...updated, id: updated._id.toString() } as any;
  }
  async deleteCoupon(id: string): Promise<void> {
    await CouponModel.findByIdAndDelete(id);
  }
}

export const storage = new MongoStorage();
