import mongoose, { Schema } from "mongoose";
import type { User, Product, Order, Category, WalletTransaction, ActivityLog, Coupon, Branch, Banner, CashShift, ShippingCompany, AuditLog, Role, StockTransfer, Invoice, BankTransfer, Shipment, AbandonedCart, Review, StoreSettings, Page, FAQ, CustomerGroup, Theme, Revision, ContentBlock, Size, SizeGroup, Color, Brand, Attribute } from "@shared/schema";

const abandonedCartSchema = new Schema<AbandonedCart>(
  {
    customerId: String,
    customerEmail: String,
    customerPhone: String,
    items: [{
      productId: String,
      productName: String,
      price: Number,
      quantity: Number,
    }],
    total: Number,
    lastActivity: { type: Date, default: Date.now },
    recoveryStatus: { type: String, enum: ["pending", "sent", "recovered", "expired"], default: "pending" },
    emailsSent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const reviewSchema = new Schema<Review>(
  {
    productId: { type: String, required: true },
    userId: { type: String, required: true },
    customerName: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    images: [String],
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const storeSettingsSchema = new Schema<StoreSettings>(
  {
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    name: String,
    logo: String,
    logoEn: String,
    favicon: String,
    coverImage: String,
    primaryColor: { type: String, default: "#000000" },
    secondaryColor: { type: String, default: "#ffffff" },
    copyrightTextAr: String,
    copyrightTextEn: String,
    copyrightText: String,
    languages: { type: [String], default: ["ar", "en"] },
    defaultLanguage: { type: String, default: "ar" },
    currency: { type: String, default: "SAR" },
    taxNumber: String,
    taxPercentage: { type: Number, default: 15 },
    enableReviews: { type: Boolean, default: true },
    enableQuestions: { type: Boolean, default: true },
    enableStockNotifications: { type: Boolean, default: true },
    enableBankTransfer: { type: Boolean, default: true },
    seoTitleAr: String,
    seoTitleEn: String,
    seoTitle: String,
    seoDescriptionAr: String,
    seoDescriptionEn: String,
    seoDescription: String,
    communication: {
      orderMessages: { type: Boolean, default: true },
      abandonedCartAlerts: { type: Boolean, default: true },
      reviewRequests: { type: Boolean, default: true }
    },
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 1 },
    shippingIntegrations: [{
      id: String,
      name: String,
      config: Schema.Types.Mixed,
      isActive: Boolean
    }],
    workingHours: [Schema.Types.Mixed],
    legalPages: [Schema.Types.Mixed],
    navigationLinks: [Schema.Types.Mixed]
  },
  { timestamps: true }
);

const userSchema = new Schema<User>(
  {
    username: { type: String, unique: true },
    password: { type: String, default: "" },
    role: { type: String, enum: ["admin", "employee", "customer", "support", "cashier", "accountant"], default: "customer" },
    permissions: [String],
    branchId: { type: String },
    loginType: { type: String, enum: ["dashboard", "pos", "both"], default: "dashboard" },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    googleId: { type: String, sparse: true },
    walletBalance: { type: String, default: "0" },
    addresses: [{
      id: String,
      name: String,
      city: String,
      street: String,
      isDefault: { type: Boolean, default: false },
    }],
    loyaltyPoints: { type: Number, default: 0 },
    loyaltyTier: { type: String, enum: ["bronze", "silver", "gold", "platinum"], default: "bronze" },
    totalSpent: { type: Number, default: 0 },
    phoneDiscountEligible: { type: Boolean, default: false },
    phoneDiscountUsedCount: { type: Number, default: 0 },
    lastPhoneDiscountDate: Date,
    referralCode: String,
    referredBy: String,
    birthdayMonth: Number
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
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    name: String,
    description: String,
    price: { type: String, required: true },
    cost: { type: String, required: true },
    compareAtPrice: String,
    images: [String],
    categoryId: String,
    subcategoryId: String,
    brandId: String,
    tags: [String],
    colors: [String],
    attributes: [{
      attributeId: String,
      value: String,
    }],
    customizations: [Schema.Types.Mixed],
    variants: [{
      colorId: String,
      colorAr: String,
      colorEn: String,
      sizeId: String,
      sizeAr: String,
      sizeEn: String,
      color: String,
      size: String,
      sku: String,
      stock: Number,
      price: String,
      cost: { type: Number, default: 0 },
      image: String,
      allowBackorder: { type: Boolean, default: false },
      weight: Number,
      barcode: String,
    }],
    weight: Number,
    seoTitle: String,
    seoDescription: String,
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isNew: { type: Boolean, default: false },
    isComingSoon: { type: Boolean, default: false },
    outOfStock: { type: Boolean, default: false },
    barcode: String,
    printBarcode: { type: Boolean, default: true },
    reviews: [Schema.Types.Mixed],
    questions: [Schema.Types.Mixed]
  },
  { timestamps: true }
);

const orderSchema = new Schema<Order>(
  {
    userId: { type: String },
    customerName: String,
    customerPhone: String,
    customerEmail: String,
    type: { type: String, enum: ["online", "pos"], default: "online" },
    branchId: String,
    cashierId: String,
    status: { type: String, enum: ["new", "processing", "shipped", "completed", "cancelled", "returned"], default: "new" },
    total: { type: String, required: true },
    subtotal: { type: String, required: true },
    vatAmount: { type: String, required: true },
    shippingCost: { type: String, required: true },
    shippingCompany: String,
    nationalAddress: String,
    tapCommission: { type: String, default: "0" },
    netProfit: { type: String, default: "0" },
    couponCode: String,
    discountAmount: { type: String, default: "0" },
    cashbackAmount: { type: String, default: "0" },
    items: [{
      productId: String,
      variantSku: String,
      quantity: Number,
      price: Number,
      cost: Number,
      title: String,
      variantColor: String,
      variantSize: String
    }],
    shippingMethod: { type: String, enum: ["pickup", "delivery"], default: "delivery" },
    shippingAddress: {
      city: String,
      street: String,
      country: String,
    },
    paymentMethod: { type: String, enum: ["cod", "bank_transfer", "apple_pay", "card", "cash", "wallet", "tabby", "tamara", "moyasar"] },
    bankTransferReceipt: String,
    paymentStatus: { type: String, default: "pending" },
    trackingNumber: String,
    adminNotes: String,
    notes: String,
    pointsUsed: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    walletAmountUsed: { type: Number, default: 0 },
    orderNumber: String,
    moyasarPaymentId: String,
    moyasarStatus: String,
    moyasarPaymentUrl: String
  },
  { timestamps: true }
);

const categorySchema = new Schema<Category>(
  {
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    descriptionAr: String,
    descriptionEn: String,
    name: String,
    slug: { type: String, required: true, unique: true },
    image: String,
    icon: String,
    parentId: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const sizeGroupSchema = new Schema<SizeGroup>(
  {
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    type: { type: String, enum: ["clothing", "shoes", "accessories", "custom"], default: "clothing" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const sizeSchema = new Schema<Size>(
  {
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    code: { type: String, required: true },
    groupId: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const colorSchema = new Schema<Color>(
  {
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    code: { type: String, required: true },
    hexCode: String,
    image: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const brandSchema = new Schema<Brand>(
  {
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    descriptionAr: String,
    descriptionEn: String,
    logo: String,
    website: String,
    order: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const attributeSchema = new Schema<Attribute>(
  {
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    type: { type: String, enum: ["text", "number", "select", "multiselect", "boolean"], default: "text" },
    options: [{
      valueAr: String,
      valueEn: String,
    }],
    isFilterable: { type: Boolean, default: false },
    isRequired: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const walletTransactionSchema = new Schema<WalletTransaction>(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["deposit", "withdrawal", "payment", "refund", "cashback"], required: true },
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
    type: { type: String, enum: ["percentage", "fixed", "cashback"], required: true },
    value: { type: Number, required: true },
    maxCashback: Number,
    description: String,
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
    titleAr: { type: String, required: true },
    titleEn: { type: String, required: true },
    title: String,
    image: { type: String, required: true },
    link: String,
    type: { type: String, enum: ["banner", "popup"], default: "banner" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const shippingCompanySchema = new Schema<ShippingCompany>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    estimatedDays: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    storageXCode: String,
  },
  { timestamps: true }
);

const auditLogSchema = new Schema<AuditLog>(
  {
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: String,
    changes: { type: Schema.Types.Mixed },
    details: String,
    ipAddress: String,
  },
  { timestamps: true }
);

const roleSchema = new Schema<Role>(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    permissions: [String],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const stockTransferSchema = new Schema<StockTransfer>(
  {
    fromBranchId: { type: String, required: true },
    toBranchId: { type: String, required: true },
    productId: { type: String, required: true },
    variantSku: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
    requestedBy: { type: String, required: true },
    approvedBy: String,
    notes: String,
  },
  { timestamps: true }
);

const invoiceSchema = new Schema<Invoice>(
  {
    userId: { type: String, required: true },
    orderId: String,
    invoiceNumber: { type: String, required: true, unique: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: Date,
    status: { type: String, enum: ["draft", "issued", "paid", "void", "refunded"], default: "draft" },
    items: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      taxRate: { type: Number, default: 15 },
      taxAmount: Number,
      total: Number,
    }],
    subtotal: Number,
    taxTotal: Number,
    total: Number,
    notes: String,
    qrCode: String,
  },
  { timestamps: true }
);

const bankTransferSchema = new Schema<BankTransfer>(
  {
    orderId: { type: String, required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    bankName: { type: String, required: true },
    accountHolder: { type: String, required: true },
    referenceNumber: String,
    receiptImage: { type: String, required: true },
    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    verifiedBy: String,
    verifiedAt: Date,
    rejectionReason: String,
    notes: String,
  },
  { timestamps: true }
);

const shipmentSchema = new Schema<Shipment>(
  {
    orderId: { type: String, required: true },
    trackingNumber: { type: String, required: true, unique: true },
    provider: { type: String, default: "Storage Station" },
    status: { type: String, enum: ["pending", "picked_up", "in_transit", "out_for_delivery", "delivered", "failed"], default: "pending" },
    estimatedDelivery: Date,
    actualDelivery: Date,
    events: [{
      status: String,
      location: String,
      timestamp: Date,
      description: String,
    }],
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    deliveryAddress: {
      city: String,
      street: String,
      country: { type: String, default: "SA" },
    },
  },
  { timestamps: true }
);

const pageSchema = new Schema<Page>(
  {
    titleAr: { type: String, required: true },
    titleEn: { type: String, required: true },
    title: String,
    slug: { type: String, required: true, unique: true },
    contentAr: String,
    contentEn: String,
    content: String,
    draftContentAr: String,
    draftContentEn: String,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    blocks: [{
      id: String,
      type: String,
      props: Schema.Types.Mixed,
      layout: Schema.Types.Mixed,
    }],
    metadata: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
    publishedAt: Date,
  },
  { timestamps: true }
);

const revisionSchema = new Schema<Revision>(
  {
    pageId: { type: String, required: true },
    blocks: { type: Schema.Types.Mixed, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    authorId: { type: String, required: true },
    note: String,
  },
  { timestamps: true }
);

const faqSchema = new Schema<FAQ>(
  {
    questionAr: { type: String, required: true },
    questionEn: { type: String, required: true },
    question: String,
    answerAr: { type: String, required: true },
    answerEn: { type: String, required: true },
    answer: String,
    category: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const customerGroupSchema = new Schema<CustomerGroup>(
  {
    name: { type: String, required: true },
    description: String,
    criteria: Schema.Types.Mixed,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const themeSchema = new Schema<Theme>(
  {
    name: { type: String, required: true },
    version: { type: String, default: "1.0.0" },
    author: String,
    previewImage: String,
    config: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: false },
    isCustom: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const contentBlockSchema = new Schema<ContentBlock>(
  {
    key: { type: String, required: true, unique: true },
    type: { type: String, enum: ["text", "image", "html", "setting"], required: true },
    content: { type: String, required: true },
    draftContent: String,
    status: { type: String, enum: ["draft", "published"], default: "published" },
    metadata: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
    publishedAt: Date,
  },
  { timestamps: true }
);

const cartSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: [{
      productId: String,
      variantSku: String,
      quantity: Number,
      price: Number,
      title: String,
      image: String,
      color: String,
      size: String,
    }],
  },
  { timestamps: true }
);

const optionSchema = new Schema({
  name: { type: String, required: true },
  values: [{ type: String }],
  valuesCount: { type: Number, default: 0 },
});

const filterSchema = new Schema({
  name: { type: String, required: true },
  options: [{ type: String }],
});

export const ContentBlockModel = mongoose.model<ContentBlock>("ContentBlock", contentBlockSchema);
export const AbandonedCartModel = mongoose.model<AbandonedCart>("AbandonedCart", abandonedCartSchema);
export const ReviewModel = mongoose.model<Review>("Review", reviewSchema);
export const StoreSettingsModel = mongoose.model<StoreSettings>("StoreSettings", storeSettingsSchema);
export const OptionModel = mongoose.model("Option", optionSchema);
export const FilterModel = mongoose.model("Filter", filterSchema);
export const PageModel = mongoose.model<Page>("Page", pageSchema);
export const RevisionModel = mongoose.model<Revision>("Revision", revisionSchema);
export const FAQModel = mongoose.model<FAQ>("FAQ", faqSchema);
export const CustomerGroupModel = mongoose.model<CustomerGroup>("CustomerGroup", customerGroupSchema);
export const ThemeModel = mongoose.model<Theme>("Theme", themeSchema);
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
export const ShippingCompanyModel = mongoose.model<ShippingCompany>("ShippingCompany", shippingCompanySchema);
export const AuditLogModel = mongoose.model<AuditLog>("AuditLog", auditLogSchema);
export const RoleModel = mongoose.model<Role>("Role", roleSchema);
export const StockTransferModel = mongoose.model<StockTransfer>("StockTransfer", stockTransferSchema);
export const InvoiceModel = mongoose.model<Invoice>("Invoice", invoiceSchema);
export const BankTransferModel = mongoose.model<BankTransfer>("BankTransfer", bankTransferSchema);
export const ShipmentModel = mongoose.model<Shipment>("Shipment", shipmentSchema);
export const CartModel = mongoose.model("Cart", cartSchema);
export const SizeGroupModel = mongoose.model<SizeGroup>("SizeGroup", sizeGroupSchema);
export const SizeModel = mongoose.model<Size>("Size", sizeSchema);
export const ColorModel = mongoose.model<Color>("Color", colorSchema);
export const BrandModel = mongoose.model<Brand>("Brand", brandSchema);
export const AttributeModel = mongoose.model<Attribute>("Attribute", attributeSchema);
