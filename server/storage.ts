import { UserModel, ProductModel, OrderModel, CategoryModel } from "./models";
import type { User, InsertUser, Product, InsertProduct, Order, InsertOrder, Category, InsertCategory } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  verifyUserForReset(username: string, email: string, phone: string): Promise<User | undefined>;
  updateUserPassword(id: string, password: string): Promise<void>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  
  // Categories
  getCategories(): Promise<Category[]>;
}

export class MongoDBStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).lean();
    return user ? { ...user, id: user._id.toString() } : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username }).lean();
    return user ? { ...user, id: user._id.toString() } : undefined;
  }

  async verifyUserForReset(username: string, email: string, phone: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ 
      username: username,
      email: email.toLowerCase(),
      phone: phone
    }).lean();
    return user ? { ...user, id: user._id.toString() } : undefined;
  }

  async updateUserPassword(id: string, password: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { password });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create(insertUser);
    return { ...user.toObject(), id: user._id.toString() };
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

  // Orders
  async getOrders(): Promise<Order[]> {
    const orders = await OrderModel.find().lean();
    return orders.map(o => ({ ...o, id: o._id.toString() }));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order = await OrderModel.create(insertOrder);
    return { ...order.toObject(), id: order._id.toString() };
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const orders = await OrderModel.find({ userId }).lean();
    return orders.map(o => ({ ...o, id: o._id.toString() }));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const categories = await CategoryModel.find().lean();
    return categories.map(c => ({ ...c, id: c._id.toString() }));
  }
}

export const storage = new MongoDBStorage();
