import { UserModel, ProductModel, OrderModel, CategoryModel, WalletTransactionModel, ActivityLogModel, CouponModel, BranchModel, BannerModel, CashShiftModel } from "./models";
import type { User, InsertUser, Product, InsertProduct, Order, InsertOrder, Category, InsertCategory, WalletTransaction, InsertWalletTransaction, OrderStatus, ActivityLog, InsertActivityLog, Coupon, InsertCoupon, Branch, InsertBranch, Banner, InsertBanner, CashShift, InsertCashShift, BranchInventory } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  verifyUserForReset(phone: string, name: string): Promise<User | undefined>;
  updateUserPassword(id: string, password: string): Promise<void>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, update: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  updateUserAddresses(id: string, addresses: any[]): Promise<User>;
  updateUserWallet(id: string, newBalance: string): Promise<User>;
  
  // Activity Logs
  getActivityLogs(): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Coupons
  getCoupons(): Promise<Coupon[]>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, update: Partial<InsertCoupon>): Promise<Coupon>;
  deleteCoupon(id: string): Promise<void>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: OrderStatus, shippingInfo?: { provider?: string, tracking?: string }): Promise<Order>;
  updateOrderReturn(id: string, returnRequest: any): Promise<Order>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Wallet Transactions
  getWalletTransactions(userId: string): Promise<WalletTransaction[]>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;

  // Branches
  getBranches(): Promise<Branch[]>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: string, branch: Partial<InsertBranch>): Promise<Branch>;
  deleteBranch(id: string): Promise<void>;

  // Banners
  getBanners(): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: string, banner: Partial<InsertBanner>): Promise<Banner>;
  deleteBanner(id: string): Promise<void>;

  // Cash Shifts
  getCashShifts(branchId?: string): Promise<CashShift[]>;
  createCashShift(shift: InsertCashShift): Promise<CashShift>;
  updateCashShift(id: string, shift: Partial<InsertCashShift>): Promise<CashShift>;
  getActiveShift(cashierId: string): Promise<CashShift | undefined>;
  
  // Branch Inventory
  getBranchInventory(branchId: string): Promise<BranchInventory[]>;
  updateBranchStock(id: string, stock: number): Promise<BranchInventory>;
}

export class MongoDBStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).lean();
    return user ? { ...user, id: user._id.toString() } : undefined;
  }

  async getUserByUsername(phone: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ 
      $or: [
        { phone },
        { username: phone }
      ]
    }).lean();
    return user ? { ...user, id: user._id.toString() } : undefined;
  }

  async getUsers(): Promise<User[]> {
    const users = await UserModel.find().lean();
    return users.map(u => ({ ...u, id: u._id.toString(), permissions: u.permissions || [] }));
  }

  async updateUser(id: string, update: Partial<InsertUser>): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!user) throw new Error("User not found");
    return { ...user, id: user._id.toString(), permissions: user.permissions || [] };
  }

  async resetUserPassword(id: string, password: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { password });
  }

  async deleteUser(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    const logs = await ActivityLogModel.find().sort({ createdAt: -1 }).lean();
    return logs.map(l => ({ ...l, id: (l as any)._id.toString() } as any));
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const log = await ActivityLogModel.create(insertLog);
    return { ...log.toObject(), id: log._id.toString() };
  }

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    const coupons = await CouponModel.find().lean();
    return coupons.map(c => ({ ...c, id: (c as any)._id.toString() } as any));
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const coupon = await CouponModel.findOne({ 
      code: { $regex: new RegExp(`^${code}$`, 'i') }, 
      isActive: true 
    }).lean();
    
    if (!coupon) return undefined;

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
      return undefined;
    }

    // Check usage limit
    if (coupon.usageLimit !== undefined && coupon.usageLimit !== null && (coupon.usageCount || 0) >= coupon.usageLimit) {
      return undefined;
    }

    return { ...coupon, id: coupon._id.toString() };
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const coupon = await CouponModel.create(insertCoupon);
    return { ...coupon.toObject(), id: coupon._id.toString(), usageCount: 0 };
  }

  async updateCoupon(id: string, update: Partial<InsertCoupon>): Promise<Coupon> {
    const coupon = await CouponModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!coupon) throw new Error("Coupon not found");
    return { ...coupon, id: coupon._id.toString() };
  }

  async deleteCoupon(id: string): Promise<void> {
    await CouponModel.findByIdAndDelete(id);
  }

  async verifyUserForReset(phone: string, name: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ 
      phone: phone,
      name: name
    }).lean();
    return user ? { ...user, id: (user as any)._id.toString() } : undefined;
  }

  async updateUserPassword(id: string, password: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { password });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create(insertUser);
    return { ...user.toObject(), id: user._id.toString() };
  }

  async updateUserAddresses(id: string, addresses: any[]): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(id, { addresses }, { new: true }).lean();
    if (!user) throw new Error("User not found");
    return { ...user, id: user._id.toString() };
  }

  async updateUserWallet(id: string, newBalance: string): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(id, { walletBalance: newBalance }, { new: true }).lean();
    if (!user) throw new Error("User not found");
    return { ...user, id: user._id.toString() };
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const products = await ProductModel.find().lean();
    return products.map(p => ({ ...p, id: p._id.toString() }));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const product = await ProductModel.findById(id).lean();
    return product ? { ...product, id: product._id.toString() } : undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product = await ProductModel.create(insertProduct);
    return { ...product.toObject(), id: product._id.toString() };
  }

  async updateProduct(id: string, update: Partial<InsertProduct>): Promise<Product> {
    const product = await ProductModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!product) throw new Error("Product not found");
    return { ...product, id: product._id.toString() };
  }

  async deleteProduct(id: string): Promise<void> {
    await ProductModel.findByIdAndDelete(id);
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const orders = await OrderModel.find().lean();
    return orders.map(o => ({ ...o, id: o._id.toString() }));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    // 1. Deduct stock from products
    for (const item of insertOrder.items) {
      try {
        await ProductModel.findOneAndUpdate(
          { _id: item.productId, "variants.sku": item.variantSku },
          { $inc: { "variants.$.stock": -item.quantity } }
        );
      } catch (err) {
        console.error(`Failed to deduct stock for product ${item.productId}, variant ${item.variantSku}:`, err);
      }
    }

    const order = await OrderModel.create({
      ...insertOrder,
      status: insertOrder.status || "new",
      paymentStatus: insertOrder.paymentStatus || "pending",
      subtotal: insertOrder.subtotal || "0",
      vatAmount: insertOrder.vatAmount || "0",
      shippingCost: insertOrder.shippingCost || "0",
      tapCommission: insertOrder.tapCommission || "0",
      netProfit: insertOrder.netProfit || "0",
      discountAmount: insertOrder.discountAmount || "0"
    });
    return { ...order.toObject(), id: order._id.toString() };
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    // Check for both string and potentially cast to string
    const orders = await OrderModel.find({ 
      $or: [
        { userId: userId },
        { userId: userId.toString() }
      ]
    }).sort({ createdAt: -1 }).lean();
    return orders.map(o => ({ ...o, id: o._id.toString() }));
  }

  async updateOrderStatus(id: string, status: OrderStatus, shippingInfo?: { provider?: string, tracking?: string }): Promise<Order> {
    const update: any = { status };
    if (shippingInfo?.provider) update.shippingProvider = shippingInfo.provider;
    if (shippingInfo?.tracking) update.trackingNumber = shippingInfo.tracking;
    
    const order = await OrderModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!order) throw new Error("Order not found");
    return { ...order, id: order._id.toString() };
  }

  async updateOrderReturn(id: string, returnRequest: any): Promise<Order> {
    const order = await OrderModel.findByIdAndUpdate(id, { returnRequest }, { new: true }).lean();
    if (!order) throw new Error("Order not found");
    return { ...order, id: order._id.toString() };
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const categories = await CategoryModel.find().lean();
    return categories.map(c => ({ ...c, id: (c as any)._id.toString() }));
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category = await CategoryModel.create(insertCategory);
    return { ...category.toObject(), id: category._id.toString() };
  }

  async deleteCategory(id: string): Promise<void> {
    await CategoryModel.findByIdAndDelete(id);
  }

  // Wallet Transactions
  async getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
    const transactions = await WalletTransactionModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return transactions.map(t => ({
      ...t,
      id: t._id.toString(),
      _id: t._id.toString(),
      userId: t.userId.toString(),
      amount: Number(t.amount),
      type: t.type as any,
      description: t.description,
      createdAt: t.createdAt
    })) as WalletTransaction[];
  }

  async createWalletTransaction(insertTransaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const transaction = await WalletTransactionModel.create(insertTransaction);
    return { ...transaction.toObject(), id: transaction._id.toString() };
  }

  // Branches
  async getBranches(): Promise<Branch[]> {
    const branches = await BranchModel.find().lean();
    return branches.map(b => ({ ...b, id: (b as any)._id.toString() } as any));
  }

  async createBranch(insertBranch: InsertBranch): Promise<Branch> {
    const branch = await BranchModel.create(insertBranch);
    return { ...branch.toObject(), id: branch._id.toString() };
  }

  async updateBranch(id: string, update: Partial<InsertBranch>): Promise<Branch> {
    const branch = await BranchModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!branch) throw new Error("Branch not found");
    return { ...branch, id: branch._id.toString() };
  }

  async deleteBranch(id: string): Promise<void> {
    await BranchModel.findByIdAndDelete(id);
  }

  // Banners
  async getBanners(): Promise<Banner[]> {
    const banners = await BannerModel.find().lean();
    return banners.map(b => ({ ...b, id: (b as any)._id.toString() } as any));
  }

  async createBanner(insertBanner: InsertBanner): Promise<Banner> {
    const banner = await BannerModel.create(insertBanner);
    return { ...banner.toObject(), id: banner._id.toString() };
  }

  async updateBanner(id: string, update: Partial<InsertBanner>): Promise<Banner> {
    const banner = await BannerModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!banner) throw new Error("Banner not found");
    return { ...banner, id: banner._id.toString() };
  }

  async deleteBanner(id: string): Promise<void> {
    await BannerModel.findByIdAndDelete(id);
  }

  // Cash Shifts
  async getCashShifts(branchId?: string): Promise<CashShift[]> {
    const query = branchId ? { branchId } : {};
    const shifts = await CashShiftModel.find(query).sort({ openedAt: -1 }).lean();
    return shifts.map(s => ({ ...s, id: (s as any)._id.toString() } as any));
  }

  async createCashShift(insertShift: InsertCashShift): Promise<CashShift> {
    const shift = await CashShiftModel.create(insertShift);
    return { ...shift.toObject(), id: shift._id.toString() };
  }

  async updateCashShift(id: string, update: Partial<InsertCashShift>): Promise<CashShift> {
    const shift = await CashShiftModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!shift) throw new Error("Shift not found");
    return { ...shift, id: shift._id.toString() };
  }

  async getActiveShift(cashierId: string): Promise<CashShift | undefined> {
    const shift = await CashShiftModel.findOne({ cashierId, status: "open" }).lean();
    return shift ? { ...shift, id: shift._id.toString() } : undefined;
  }

  // Branch Inventory (Stub for POS prep)
  async getBranchInventory(branchId: string): Promise<BranchInventory[]> {
    return [];
  }

  async updateBranchStock(id: string, stock: number): Promise<BranchInventory> {
    throw new Error("Inventory update not implemented in MongoDB yet");
  }

  async getAllUsers(): Promise<User[]> {
    return this.getUsers();
  }
}

export const storage = new MongoDBStorage();
