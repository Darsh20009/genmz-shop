import type { User, InsertUser, Product, InsertProduct, Order, InsertOrder, Category, InsertCategory, WalletTransaction, InsertWalletTransaction, ActivityLog, InsertActivityLog, Coupon, InsertCoupon, Branch, InsertBranch, Banner, InsertBanner, CashShift, InsertCashShift, ShippingCompany, InsertShippingCompany, AuditLog, InsertAuditLog, Role, InsertRole, StockTransfer, InsertStockTransfer, Invoice, InsertInvoice, BankTransfer, InsertBankTransfer, Shipment, InsertShipment, AbandonedCart, InsertAbandonedCart, Review, InsertReview, StoreSettings, InsertStoreSettings, Page, InsertPage, FAQ, InsertFAQ, CustomerGroup, InsertCustomerGroup, Theme, ContentBlock, InsertContentBlock, Revision, InsertRevision } from "@shared/schema";
import { UserModel, ProductModel, OrderModel, CategoryModel, WalletTransactionModel, ActivityLogModel, CouponModel, BranchModel, BannerModel, CashShiftModel, ShippingCompanyModel, AuditLogModel, RoleModel, StockTransferModel, InvoiceModel, BankTransferModel, ShipmentModel, CartModel, AbandonedCartModel, ReviewModel, StoreSettingsModel, PageModel, RevisionModel, FAQModel, CustomerGroupModel, ThemeModel, ContentBlockModel } from "./models";

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
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

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

  // Pages
  getPages(): Promise<Page[]>;
  getPage(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, page: Partial<InsertPage>): Promise<Page>;
  deletePage(id: string): Promise<void>;

  // Revisions
  getRevisions(pageId: string): Promise<Revision[]>;
  createRevision(revision: InsertRevision): Promise<Revision>;

  // Content Blocks
  getContentBlocks(): Promise<ContentBlock[]>;
  getContentBlock(key: string): Promise<ContentBlock | undefined>;
  updateContentBlock(key: string, data: Partial<InsertContentBlock>): Promise<ContentBlock>;

  // Cart
  getCart(userId: string): Promise<any>;
  saveCart(userId: string, items: any[]): Promise<any>;
  clearCart(userId: string): Promise<void>;
  
  // Dashboard Summary
  getDashboardSummary(): Promise<any>;
  
  // FAQs
  getFAQs(): Promise<FAQ[]>;
  createFAQ(faq: InsertFAQ): Promise<FAQ>;
  updateFAQ(id: string, data: Partial<InsertFAQ>): Promise<FAQ>;
  deleteFAQ(id: string): Promise<void>;

  // Customer Groups
  getCustomerGroups(): Promise<CustomerGroup[]>;
  createCustomerGroup(group: InsertCustomerGroup): Promise<CustomerGroup>;

  // Themes
  getThemes(): Promise<Theme[]>;
  activateTheme(id: string): Promise<Theme>;

  // Orders by user
  getOrdersByUser(userId: string): Promise<Order[]>;
}

export class MongoStorage implements IStorage {
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
    const order = await OrderModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!order) throw new Error("Order not found");
    return { ...order, id: order._id.toString() } as any;
  }
  async updateOrderPaymentStatus(id: string, status: string, provider?: string): Promise<Order> {
    const update: any = { paymentStatus: status };
    if (provider) update.paymentMethod = provider;
    const order = await OrderModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!order) throw new Error("Order not found");
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
    const transfers = await StockTransferModel.find().lean();
    return transfers.map(t => ({ ...t, id: t._id.toString() } as any));
  }
  async createStockTransfer(insertTransfer: InsertStockTransfer): Promise<StockTransfer> {
    const transfer = await StockTransferModel.create(insertTransfer);
    return { ...transfer.toObject(), id: transfer._id.toString() } as any;
  }

  async getInvoices(): Promise<Invoice[]> {
    const invoices = await InvoiceModel.find().lean();
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
    const transfers = await BankTransferModel.find().lean();
    return transfers.map(t => ({ ...t, id: t._id.toString() } as any));
  }
  async createBankTransfer(insertTransfer: InsertBankTransfer): Promise<BankTransfer> {
    const transfer = await BankTransferModel.create(insertTransfer);
    return { ...transfer.toObject(), id: transfer._id.toString() } as any;
  }
  async updateBankTransfer(id: string, data: Partial<BankTransfer>): Promise<BankTransfer> {
    const updated = await BankTransferModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) throw new Error("Transfer not found");
    return { ...updated, id: updated._id.toString() } as any;
  }

  async getShipments(): Promise<Shipment[]> {
    const shipments = await ShipmentModel.find().lean();
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
    const carts = await AbandonedCartModel.find().lean();
    return carts.map(c => ({ ...c, id: c._id.toString() } as any));
  }
  async createAbandonedCart(insertCart: InsertAbandonedCart): Promise<AbandonedCart> {
    const cart = await AbandonedCartModel.create(insertCart);
    return { ...cart.toObject(), id: cart._id.toString() } as any;
  }
  async updateAbandonedCart(id: string, data: Partial<AbandonedCart>): Promise<AbandonedCart> {
    const updated = await AbandonedCartModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) throw new Error("Cart not found");
    return { ...updated, id: updated._id.toString() } as any;
  }

  async getReviews(productId?: string): Promise<Review[]> {
    const query = productId ? { productId } : {};
    const reviews = await ReviewModel.find(query).lean();
    return reviews.map(r => ({ ...r, id: r._id.toString() } as any));
  }
  async createReview(insertReview: InsertReview): Promise<Review> {
    const review = await ReviewModel.create(insertReview);
    return { ...review.toObject(), id: review._id.toString() } as any;
  }
  async updateReviewStatus(id: string, approved: boolean): Promise<Review> {
    const updated = await ReviewModel.findByIdAndUpdate(id, { approved }, { new: true }).lean();
    if (!updated) throw new Error("Review not found");
    return { ...updated, id: updated._id.toString() } as any;
  }
  async deleteReview(id: string): Promise<void> {
    await ReviewModel.findByIdAndDelete(id);
  }

  async getStoreSettings(): Promise<StoreSettings> {
    const settings = await StoreSettingsModel.findOne().lean();
    if (!settings) {
      return await StoreSettingsModel.create({ name: "My Store" }) as any;
    }
    return { ...settings, id: settings._id.toString() } as any;
  }
  async updateStoreSettings(settings: Partial<InsertStoreSettings>): Promise<StoreSettings> {
    const current = await this.getStoreSettings();
    const updated = await StoreSettingsModel.findByIdAndUpdate(current.id, settings, { new: true }).lean();
    if (!updated) throw new Error("Settings not found");
    return { ...updated, id: updated._id.toString() } as any;
  }

  async getPages(): Promise<Page[]> {
    const pages = await PageModel.find().lean();
    return pages.map(p => ({ ...p, id: p._id.toString() } as any));
  }
  async getPage(id: string): Promise<Page | undefined> {
    const page = await PageModel.findById(id).lean();
    return page ? { ...page, id: page._id.toString() } as any : undefined;
  }
  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const page = await PageModel.findOne({ slug }).lean();
    return page ? { ...page, id: page._id.toString() } as any : undefined;
  }
  async createPage(insertPage: InsertPage): Promise<Page> {
    const page = await PageModel.create(insertPage);
    return { ...page.toObject(), id: page._id.toString() } as any;
  }
  async updatePage(id: string, page: Partial<InsertPage>): Promise<Page> {
    const updated = await PageModel.findByIdAndUpdate(id, page, { new: true }).lean();
    if (!updated) throw new Error("Page not found");
    return { ...updated, id: updated._id.toString() } as any;
  }
  async deletePage(id: string): Promise<void> {
    await PageModel.findByIdAndDelete(id);
  }

  async getRevisions(pageId: string): Promise<Revision[]> {
    const revisions = await RevisionModel.find({ pageId }).sort({ createdAt: -1 }).lean();
    return revisions.map(r => ({ ...r, id: r._id.toString() } as any));
  }
  async createRevision(insertRevision: InsertRevision): Promise<Revision> {
    const revision = await RevisionModel.create(insertRevision);
    return { ...revision.toObject(), id: revision._id.toString() } as any;
  }

  async getContentBlocks(): Promise<ContentBlock[]> {
    const blocks = await ContentBlockModel.find().lean();
    return blocks.map(b => ({ ...b, id: b._id.toString() } as any));
  }
  async getContentBlock(key: string): Promise<ContentBlock | undefined> {
    const block = await ContentBlockModel.findOne({ key }).lean();
    return block ? { ...block, id: block._id.toString() } as any : undefined;
  }
  async updateContentBlock(key: string, data: Partial<InsertContentBlock>): Promise<ContentBlock> {
    const updated = await ContentBlockModel.findOneAndUpdate({ key }, data, { upsert: true, new: true }).lean();
    return { ...updated, id: updated._id.toString() } as any;
  }

  async getCart(userId: string): Promise<any> {
    const cart = await CartModel.findOne({ userId }).lean();
    return cart ? { ...cart, id: cart._id.toString() } : null;
  }
  async saveCart(userId: string, items: any[]): Promise<any> {
    const updated = await CartModel.findOneAndUpdate({ userId }, { items }, { upsert: true, new: true }).lean();
    return { ...updated, id: updated._id.toString() };
  }
  async clearCart(userId: string): Promise<void> {
    await CartModel.deleteOne({ userId });
  }

  async getDashboardSummary(): Promise<any> {
    const orders = await OrderModel.find().lean();
    const customers = await UserModel.countDocuments({ role: "customer" });
    
    // Calculate total revenue, excluding cancelled orders
    const totalRevenue = orders
      .filter(o => o.status !== "cancelled")
      .reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);

    // Calculate revenue for different time periods, excluding cancelled
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayRevenue = orders
      .filter(o => o.status !== "cancelled" && new Date(o.createdAt) >= startOfToday)
      .reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);

    const monthRevenue = orders
      .filter(o => o.status !== "cancelled" && new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);

    // Status counts
    const completedOrdersCount = orders.filter(o => o.status === "completed").length;
    const processingOrdersCount = orders.filter(o => o.status === "processing" || o.status === "new").length;
    const cancelledOrdersCount = orders.filter(o => o.status === "cancelled").length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalCustomers: customers,
      recentOrders: orders.slice(-5).map(o => ({ ...o, id: o._id.toString() })),
      allTime: { totalRevenue },
      today: { totalRevenue: todayRevenue },
      thisMonth: { totalRevenue: monthRevenue },
      completedOrdersCount,
      processingOrdersCount,
      cancelledOrdersCount,
      totalOrdersCount: orders.length,
      dailyOrders: orders.filter(o => new Date(o.createdAt) >= startOfToday).length,
      netProfit: totalRevenue * 0.67 // Mock net profit for now
    };
  }

  async getFAQs(): Promise<FAQ[]> {
    const faqs = await FAQModel.find().sort({ order: 1 }).lean();
    return faqs.map(f => ({ ...f, id: f._id.toString() } as any));
  }
  async createFAQ(insertFAQ: InsertFAQ): Promise<FAQ> {
    const faq = await FAQModel.create(insertFAQ);
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
  async createCustomerGroup(insertGroup: InsertCustomerGroup): Promise<CustomerGroup> {
    const group = await CustomerGroupModel.create(insertGroup);
    return { ...group.toObject(), id: group._id.toString() } as any;
  }

  async getThemes(): Promise<Theme[]> {
    const themes = await ThemeModel.find().lean();
    return themes.map(t => ({ ...t, id: t._id.toString() } as any));
  }
  async activateTheme(id: string): Promise<Theme> {
    await ThemeModel.updateMany({}, { isActive: false });
    const updated = await ThemeModel.findByIdAndUpdate(id, { isActive: true }, { new: true }).lean();
    if (!updated) throw new Error("Theme not found");
    return { ...updated, id: updated._id.toString() } as any;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return orders.map(o => ({ ...o, id: o._id.toString() } as any));
  }
}

export const storage = new MongoStorage();
