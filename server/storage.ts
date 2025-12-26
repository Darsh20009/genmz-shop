import { UserModel, ProductModel, OrderModel, CategoryModel, WalletTransactionModel, ActivityLogModel, CouponModel } from "./models";
import type { User, InsertUser, Product, InsertProduct, Order, InsertOrder, Category, InsertCategory, WalletTransaction, InsertWalletTransaction, OrderStatus, ActivityLog, InsertActivityLog, Coupon, InsertCoupon } from "@shared/schema";

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
    const coupon = await CouponModel.findOne({ code, isActive: true }).lean();
    return coupon ? { ...coupon, id: coupon._id.toString() } : undefined;
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
}

export const storage = new MongoDBStorage();
