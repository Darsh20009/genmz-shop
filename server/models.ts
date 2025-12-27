import mongoose, { Schema } from "mongoose";
import type { User, Product, Order, Category, WalletTransaction, ActivityLog, Coupon, Branch, Banner, CashShift } from "@shared/schema";

const userSchema = new Schema<User>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, default: "" },
    role: { type: String, enum: ["admin", "employee", "customer", "support"], default: "customer" },
    permissions: [String],
    branchId: { type: String },
    loginType: { type: String, enum: ["dashboard", "pos", "both"], default: "dashboard" },
    isActive: { type: Boolean, default: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    walletBalance: { type: String, default: "0" },
    addresses: [{
      id: String,
      name: String,
      city: String,
      street: String,
      isDefault: { type: Boolean, default: false },
    }],
  },
  { timestamps: true }
);

const cashShiftSchema = new Schema<CashShift>(
  {
    branchId: { type: String, required: true },
    cashierId: { type: String, required: true },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    openingBalance: { type: Number, required: true },
    closingBalance: Number,
    actualCash: Number,
    difference: Number,
    openedAt: { type: Date, default: Date.now },
    closedAt: Date,
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
      cost: { type: Number, default: 0 },
      image: String,
    }],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const orderSchema = new Schema<Order>(
  {
    userId: { type: String, required: true },
    type: { type: String, enum: ["online", "pos"], default: "online" },
    branchId: String,
    cashierId: String,
    status: { type: String, enum: ["new", "processing", "shipped", "completed", "cancelled"], default: "new" },
    total: { type: String, required: true },
    subtotal: { type: String, required: true },
    vatAmount: { type: String, required: true },
    shippingCost: { type: String, required: true },
    tapCommission: { type: String, required: true },
    netProfit: { type: String, required: true },
    couponCode: String,
    discountAmount: { type: String, default: "0" },
    items: [{
      productId: String,
      variantSku: String,
      quantity: Number,
      price: Number,
      cost: Number,
      title: String,
    }],
    shippingMethod: { type: String, enum: ["pickup", "delivery"], required: true },
    shippingAddress: {
      city: String,
      street: String,
      country: String,
    },
    pickupBranch: String,
    paymentMethod: { type: String, enum: ["cod", "bank_transfer", "apple_pay", "card", "cash", "wallet"], required: true },
    bankTransferReceipt: String,
    paymentStatus: { type: String, default: "pending" },
    shippingProvider: { type: String },
    trackingNumber: { type: String },
    returnRequest: {
      status: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
      reason: String,
      type: { type: String, enum: ["return", "exchange"] },
      createdAt: Date,
    },
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

const walletTransactionSchema = new Schema<WalletTransaction>(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["deposit", "withdrawal", "payment", "refund"], required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const activityLogSchema = new Schema<ActivityLog>(
  {
    employeeId: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: String,
    details: String,
  },
  { timestamps: true }
);

const couponSchema = new Schema<Coupon>(
  {
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    expiryDate: Date,
    usageLimit: Number,
    perUserLimit: { type: Number, default: 1 },
    minOrderAmount: Number,
    targetCategoryIds: [String],
    targetProductIds: [String],
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const branchSchema = new Schema<Branch>(
  {
    name: { type: String, required: true },
    location: String,
    phone: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const bannerSchema = new Schema<Banner>(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    link: String,
    type: { type: String, enum: ["banner", "popup"], default: "banner" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<User>("User", userSchema);
export const ProductModel = mongoose.model<Product>("Product", productSchema);
export const OrderModel = mongoose.model<Order>("Order", orderSchema);
export const CategoryModel = mongoose.model<Category>("Category", categorySchema);
export const WalletTransactionModel = mongoose.model<WalletTransaction>("WalletTransaction", walletTransactionSchema);
export const ActivityLogModel = mongoose.model<ActivityLog>("ActivityLog", activityLogSchema);
export const CouponModel = mongoose.model<Coupon>("Coupon", couponSchema);
export const BranchModel = mongoose.model<Branch>("Branch", branchSchema);
export const BannerModel = mongoose.model<Banner>("Banner", bannerSchema);
export const CashShiftModel = mongoose.model<CashShift>("CashShift", cashShiftSchema);
