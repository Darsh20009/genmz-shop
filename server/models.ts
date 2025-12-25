import mongoose, { Schema } from "mongoose";
import type { User, Product, Order, Category } from "@shared/schema";

const userSchema = new Schema<User>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "employee", "customer", "support"], default: "customer" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    walletBalance: { type: String, default: "0" },
  },
  { timestamps: true }
);

const productSchema = new Schema<Product>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    cost: { type: String, required: true },
    images: [String],
    categoryId: { type: String },
    variants: [{
      color: String,
      size: String,
      sku: String,
      stock: Number,
    }],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const orderSchema = new Schema<Order>(
  {
    userId: { type: String, required: true },
    status: { type: String, enum: ["new", "processing", "shipped", "completed", "cancelled"], default: "new" },
    total: { type: String, required: true },
    items: [{
      productId: String,
      variantSku: String,
      quantity: Number,
      price: Number,
      title: String,
    }],
    shippingMethod: { type: String, enum: ["pickup", "delivery"], required: true },
    shippingAddress: {
      city: String,
      street: String,
      country: String,
    },
    pickupBranch: String,
    paymentMethod: { type: String, enum: ["cod", "bank_transfer", "apple_pay", "card"], required: true },
    bankTransferReceipt: String,
    paymentStatus: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const categorySchema = new Schema<Category>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: false }
);

export const UserModel = mongoose.model<User>("User", userSchema);
export const ProductModel = mongoose.model<Product>("Product", productSchema);
export const OrderModel = mongoose.model<Order>("Order", orderSchema);
export const CategoryModel = mongoose.model<Category>("Category", categorySchema);
