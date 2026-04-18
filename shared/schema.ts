import { z } from "zod";

// Enums and Types
export const userRoles = ["admin", "employee", "customer", "support", "cashier", "accountant"] as const;
export type UserRole = typeof userRoles[number];

export const employeePermissions = [
  "orders.view", "orders.edit", "orders.refund",
  "products.view", "products.edit",
  "customers.view", "wallet.adjust",
  "reports.view", "staff.manage",
  "pos.access", "settings.manage"
] as const;
export type EmployeePermission = typeof employeePermissions[number];

export const orderStatuses = ["new", "processing", "shipped", "completed", "cancelled", "returned"] as const;
export type OrderStatus = typeof orderStatuses[number];

export const orderTypes = ["online", "pos"] as const;
export type OrderType = typeof orderTypes[number];

// Loyalty Tiers Configuration
export const loyaltyTiers = {
  bronze: { minSpent: 0, pointsMultiplier: 1, discountPercent: 0 },
  silver: { minSpent: 1000, pointsMultiplier: 1.25, discountPercent: 3 },
  gold: { minSpent: 5000, pointsMultiplier: 1.5, discountPercent: 5 },
  platinum: { minSpent: 15000, pointsMultiplier: 2, discountPercent: 10 },
} as const;

// User Schema
export const insertUserSchema = z.object({
  name: z.string().min(1, "اسم العميل مطلوب"),
  phone: z.string().regex(/^0?5\d{8}$/, "رقم الهاتف يجب أن يبدأ بـ 5 أو 05 ويتكون من 9 أو 10 أرقام"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  password: z.string().optional().default(""),
  googleId: z.string().optional(),
  role: z.enum(userRoles).default("customer"),
  permissions: z.array(z.string()).default([]),
  branchId: z.string().optional(),
  loginType: z.enum(["dashboard", "pos", "both"]).default("dashboard"),
  isActive: z.boolean().default(true),
  mustChangePassword: z.boolean().default(false),
  loyaltyPoints: z.number().default(0),
  loyaltyTier: z.enum(["bronze", "silver", "gold", "platinum"]).default("bronze"),
  totalSpent: z.number().default(0),
  phoneDiscountEligible: z.boolean().default(false),
  phoneDiscountUsedCount: z.number().default(0),
  lastPhoneDiscountDate: z.date().optional(),
  referralCode: z.string().optional(),
  referredBy: z.string().optional(),
  birthdayMonth: z.number().optional(),
  username: z.string().optional(),
  walletBalance: z.string().default("0"),
  addresses: z.array(z.object({
    id: z.string(),
    name: z.string(),
    city: z.string(),
    street: z.string(),
    isDefault: z.boolean().default(false),
  })).default([]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = InsertUser & { _id: string; id: string; createdAt: Date; __v?: number };

// Cash Shift Schema
export const insertCashShiftSchema = z.object({
  branchId: z.string(),
  cashierId: z.string(),
  status: z.enum(["open", "closed"]).default("open"),
  openingBalance: z.number(),
  closingBalance: z.number().optional(),
  actualCash: z.number().optional(),
  difference: z.number().optional(),
  openedAt: z.date().optional(),
  closedAt: z.date().optional(),
});

export type InsertCashShift = z.infer<typeof insertCashShiftSchema>;
export type CashShift = InsertCashShift & { _id: string; id: string };

// Audit Log Schema (Immutable logs for compliance)
export const insertAuditLogSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string(),
  action: z.string(), // create, update, delete, view, etc.
  targetType: z.string(), // order, product, customer, staff, etc.
  targetId: z.string().optional(),
  changes: z.record(z.any()).optional(), // Track what changed
  details: z.string().optional(),
  ipAddress: z.string().optional(),
  createdAt: z.date().optional(),
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = InsertAuditLog & { _id: string; id: string; createdAt: Date };

// Employee Activity Log (Legacy - for backward compatibility)
export const insertActivityLogSchema = z.object({
  employeeId: z.string(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string().optional(),
  details: z.string().optional(),
  createdAt: z.date().optional(),
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = InsertActivityLog & { _id: string; id: string; createdAt: Date };

// Role Schema
export const insertRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.enum(employeePermissions)).default([]),
  isSystem: z.boolean().default(false), // Super Admin, Admin, etc.
});

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = InsertRole & { _id: string; id: string };

// Coupon Schema
export const insertCouponSchema = z.object({
  code: z.string().min(1),
  type: z.enum(["percentage", "fixed", "cashback"]),
  value: z.number(),
  maxCashback: z.number().optional(),
  description: z.string().optional(),
  expiryDate: z.date().optional(),
  usageLimit: z.number().optional(),
  perUserLimit: z.number().default(1),
  minOrderAmount: z.number().optional(),
  targetCategoryIds: z.array(z.string()).default([]),
  targetProductIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = InsertCoupon & { _id: string; id: string; usageCount: number };

// Review Schema
export const insertReviewSchema = z.object({
  productId: z.string(),
  userId: z.string(),
  customerName: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
  images: z.array(z.string()).default([]),
  approved: z.boolean().default(false),
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = InsertReview & { _id: string; id: string; createdAt: Date };

// Product Schema
export const insertProductSchema = z.object({
  nameAr: z.string().min(1, "اسم المنتج مطلوب"),
  nameEn: z.string().min(1, "Product name is required"),
  descriptionAr: z.string().min(1, "وصف المنتج مطلوب"),
  descriptionEn: z.string().min(1, "Product description is required"),
  price: z.string(),
  cost: z.string(),
  compareAtPrice: z.string().optional(),
  images: z.array(z.string()),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isNew: z.boolean().default(false),
  isComingSoon: z.boolean().default(false),
  outOfStock: z.boolean().default(false),
  barcode: z.string().optional(),
  printBarcode: z.boolean().default(true),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  attributes: z.array(z.object({
    attributeId: z.string(),
    value: z.string(),
  })).default([]),
  customizations: z.array(z.object({
    nameAr: z.string(),
    nameEn: z.string(),
    options: z.array(z.object({
      nameAr: z.string(),
      nameEn: z.string(),
    }))
  })).default([]),
  variants: z.array(z.object({
    colorId: z.string().optional(),
    colorAr: z.string().optional(),
    colorEn: z.string().optional(),
    sizeId: z.string().optional(),
    sizeAr: z.string().optional(),
    sizeEn: z.string().optional(),
    sku: z.string(),
    stock: z.number().default(0),
    price: z.string().optional(),
    cost: z.number().default(0),
    image: z.string().optional(),
    allowBackorder: z.boolean().default(false),
    weight: z.number().optional(),
    barcode: z.string().optional(),
  })).default([]),
  weight: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  reviews: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    customerName: z.string(),
    rating: z.number(),
    comment: z.string(),
    createdAt: z.string(),
  })).default([]),
  questions: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    customerName: z.string(),
    question: z.string(),
    answer: z.string().optional(),
    createdAt: z.string(),
  })).default([]),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = InsertProduct & { _id: string; id: string; createdAt: Date };

// Category Schema (Enhanced with subcategories support)
export const insertCategorySchema = z.object({
  nameAr: z.string().min(1, "اسم القسم مطلوب"),
  nameEn: z.string().min(1, "Category name is required"),
  slug: z.string().min(1),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  name: z.string().optional(),
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = InsertCategory & { _id: string; id: string; createdAt: Date };

// Size Schema
export const insertSizeSchema = z.object({
  nameAr: z.string().min(1, "اسم المقاس مطلوب"),
  nameEn: z.string().min(1, "Size name is required"),
  code: z.string().min(1, "رمز المقاس مطلوب"),
  groupId: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export type InsertSize = z.infer<typeof insertSizeSchema>;
export type Size = InsertSize & { _id: string; id: string };

// Size Group Schema (e.g., Clothing Sizes, Shoe Sizes)
export const insertSizeGroupSchema = z.object({
  nameAr: z.string().min(1, "اسم مجموعة المقاسات مطلوب"),
  nameEn: z.string().min(1, "Size group name is required"),
  type: z.enum(["clothing", "shoes", "accessories", "custom"]).default("clothing"),
  isActive: z.boolean().default(true),
});

export type InsertSizeGroup = z.infer<typeof insertSizeGroupSchema>;
export type SizeGroup = InsertSizeGroup & { _id: string; id: string };

// Color Schema
export const insertColorSchema = z.object({
  nameAr: z.string().min(1, "اسم اللون مطلوب"),
  nameEn: z.string().min(1, "Color name is required"),
  code: z.string().min(1, "رمز اللون مطلوب"),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "كود اللون غير صحيح").optional(),
  image: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export type InsertColor = z.infer<typeof insertColorSchema>;
export type Color = InsertColor & { _id: string; id: string };

// Brand Schema
export const insertBrandSchema = z.object({
  nameAr: z.string().min(1, "اسم العلامة التجارية مطلوب"),
  nameEn: z.string().min(1, "Brand name is required"),
  slug: z.string().min(1),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().optional(),
  order: z.number().default(0),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = InsertBrand & { _id: string; id: string; createdAt: Date };

// Product Attribute Schema (e.g., Material, Warranty, etc.)
export const insertAttributeSchema = z.object({
  nameAr: z.string().min(1, "اسم السمة مطلوب"),
  nameEn: z.string().min(1, "Attribute name is required"),
  type: z.enum(["text", "number", "select", "multiselect", "boolean"]).default("text"),
  options: z.array(z.object({
    valueAr: z.string(),
    valueEn: z.string(),
  })).default([]),
  isFilterable: z.boolean().default(false),
  isRequired: z.boolean().default(false),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export type InsertAttribute = z.infer<typeof insertAttributeSchema>;
export type Attribute = InsertAttribute & { _id: string; id: string };

// FAQ Schema
export const insertFAQSchema = z.object({
  questionAr: z.string().min(1, "السؤال مطلوب"),
  questionEn: z.string().min(1, "Question is required"),
  answerAr: z.string().min(1, "الإجابة مطلوبة"),
  answerEn: z.string().min(1, "Answer is required"),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
  question: z.string().optional(),
  answer: z.string().optional(),
});

export type InsertFAQ = z.infer<typeof insertFAQSchema>;
export type FAQ = InsertFAQ & { _id: string; id: string; createdAt: Date };

// Customer Group Schema
export const insertCustomerGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  criteria: z.record(z.any()).optional(), // e.g., { minSpent: 1000 }
  isActive: z.boolean().default(true),
});

export type InsertCustomerGroup = z.infer<typeof insertCustomerGroupSchema>;
export type CustomerGroup = InsertCustomerGroup & { _id: string; id: string };

// Theme Schema
export const insertThemeSchema = z.object({
  name: z.string().min(1),
  version: z.string().default("1.0.0"),
  author: z.string().optional(),
  previewImage: z.string().optional(),
  config: z.record(z.any()).default({}),
  isActive: z.boolean().default(false),
  isCustom: z.boolean().default(false),
});

export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = InsertTheme & { _id: string; id: string; createdAt: Date };

// Store Settings Schema
export const insertStoreSettingsSchema = z.object({
  nameAr: z.string().min(1, "اسم المتجر مطلوب"),
  nameEn: z.string().min(1, "Store name is required"),
  logo: z.string().optional(),
  logoEn: z.string().optional(),
  favicon: z.string().optional(),
  coverImage: z.string().optional(),
  primaryColor: z.string().default("#000000"),
  secondaryColor: z.string().default("#ffffff"),
  copyrightTextAr: z.string().optional(),
  copyrightTextEn: z.string().optional(),
  languages: z.array(z.string()).default(["ar", "en"]),
  defaultLanguage: z.string().default("ar"),
  currency: z.string().default("SAR"),
  taxNumber: z.string().optional(),
  taxPercentage: z.number().default(15),
  enableReviews: z.boolean().default(true),
  enableQuestions: z.boolean().default(true),
  enableStockNotifications: z.boolean().default(true),
  enableBankTransfer: z.boolean().default(true),
  seoTitleAr: z.string().optional(),
  seoTitleEn: z.string().optional(),
  seoDescriptionAr: z.string().optional(),
  seoDescriptionEn: z.string().optional(),
  shippingIntegrations: z.array(z.object({
    id: z.string(),
    name: z.string(),
    config: z.record(z.any()),
    isActive: z.boolean().default(false),
  })).default([]),
  workingHours: z.array(z.object({
    dayAr: z.string(),
    dayEn: z.string(),
    open: z.string(),
    close: z.string(),
    isClosed: z.boolean().default(false),
  })).optional(),
  legalPages: z.array(z.object({
    titleAr: z.string(),
    titleEn: z.string(),
    slug: z.string(),
    contentAr: z.string(),
    contentEn: z.string(),
    isActive: z.boolean().default(true),
  })).optional(),
  navigationLinks: z.array(z.object({
    id: z.string(),
    titleAr: z.string(),
    titleEn: z.string(),
    url: z.string(),
    order: z.number().default(0),
    isActive: z.boolean().default(true),
  })).default([]),
  communication: z.object({
    orderMessages: z.boolean().default(true),
    abandonedCartAlerts: z.boolean().default(true),
    reviewRequests: z.boolean().default(true),
  }).default({}),
  onboardingCompleted: z.boolean().default(false),
  onboardingStep: z.number().default(1),
  name: z.string().optional(),
  copyrightText: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type InsertStoreSettings = z.infer<typeof insertStoreSettingsSchema>;
export type StoreSettings = InsertStoreSettings & { _id: string; id: string };

// Order Schema
export const insertOrderSchema = z.object({
  userId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    title: z.string(),
    price: z.number(),
    quantity: z.number(),
    variantSku: z.string().optional(),
    variantColor: z.string().optional(),
    variantSize: z.string().optional(),
    cost: z.number().optional(),
  })),
  subtotal: z.string(),
  discount: z.string().default("0"),
  vatAmount: z.string(),
  total: z.string(),
  status: z.enum(orderStatuses).default("new"),
  type: z.enum(orderTypes).default("online"),
  paymentMethod: z.enum(["cod", "bank_transfer", "apple_pay", "card", "cash", "wallet", "tabby", "tamara", "moyasar"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "refunded", "failed"]).default("pending"),
  paymentTransferNote: z.string().optional(),
  adminNotes: z.string().optional(),
  shippingAddress: z.object({
    city: z.string().optional(),
    street: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  branchId: z.string().optional(),
  cashierId: z.string().optional(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  pointsUsed: z.number().default(0),
  pointsEarned: z.number().default(0),
  walletAmountUsed: z.number().default(0),
  orderNumber: z.string().optional(),
  tapCommission: z.string().default("0"),
  shippingCost: z.string(),
  netProfit: z.string().default("0"),
  shippingMethod: z.enum(["pickup", "delivery"]).default("delivery"),
  shippingCompany: z.string().optional(),
  discountAmount: z.string().default("0"),
  cashbackAmount: z.string().default("0"),
  nationalAddress: z.string().optional(),
  moyasarPaymentId: z.string().optional(),
  trackingNumber: z.string().optional(),
  moyasarStatus: z.enum(["initiated", "paid", "failed", "authorized", "captured", "refunded", "voided"]).optional(),
  moyasarPaymentUrl: z.string().optional(),
  bankTransferReceipt: z.string().optional(),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = InsertOrder & { _id: string; id: string; createdAt: Date; orderNumber: string };

// Wallet Transaction Schema
export const insertWalletTransactionSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  type: z.enum(["deposit", "withdrawal", "payment", "refund", "cashback"]),
  description: z.string(),
});

export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = InsertWalletTransaction & { _id: string; id: string; createdAt: Date };

// Branch Schema
export const insertBranchSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = InsertBranch & { _id: string; id: string };

// Banner Schema
export const insertBannerSchema = z.object({
  titleAr: z.string().min(1, "العنوان مطلوب"),
  titleEn: z.string().min(1, "Title is required"),
  image: z.string().min(1, "الصورة مطلوبة"),
  link: z.string().optional(),
  type: z.enum(["banner", "popup"]).default("banner"),
  isActive: z.boolean().default(true),
  title: z.string().optional(),
});

export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = InsertBanner & { _id: string; id: string };

// Shipping Company Schema
export const insertShippingCompanySchema = z.object({
  name: z.string().min(1),
  price: z.number(),
  estimatedDays: z.number(),
  isActive: z.boolean().default(true),
  storageXCode: z.string().optional(),
});

export type InsertShippingCompany = z.infer<typeof insertShippingCompanySchema>;
export type ShippingCompany = InsertShippingCompany & { _id: string; id: string };

// Page Schema
export const insertPageSchema = z.object({
  titleAr: z.string().min(1, "العنوان مطلوب"),
  titleEn: z.string().min(1, "Title is required"),
  slug: z.string().min(1),
  contentAr: z.string().optional(),
  contentEn: z.string().optional(),
  draftContentAr: z.string().optional(),
  draftContentEn: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  blocks: z.array(z.object({
    id: z.string(),
    type: z.string(),
    props: z.record(z.any()),
    layout: z.record(z.any()).optional()
  })).default([]),
  metadata: z.record(z.any()).default({}),
  isActive: z.boolean().default(true),
  title: z.string().optional(),
  content: z.string().optional(),
});

export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = InsertPage & { _id: string; id: string; createdAt: Date; updatedAt: Date; publishedAt?: Date };

// CMS Revision Schema
export const insertRevisionSchema = z.object({
  pageId: z.string(),
  blocks: z.array(z.any()),
  metadata: z.record(z.any()).optional(),
  authorId: z.string(),
  note: z.string().optional(),
});

export type InsertRevision = z.infer<typeof insertRevisionSchema>;
export type Revision = InsertRevision & { _id: string; id: string; createdAt: Date };

// Stock Transfer Schema
export const insertStockTransferSchema = z.object({
  fromBranchId: z.string(),
  toBranchId: z.string(),
  productId: z.string(),
  variantSku: z.string(),
  quantity: z.number(),
  status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
  requestedBy: z.string(),
  approvedBy: z.string().optional(),
  notes: z.string().optional(),
});

export type InsertStockTransfer = z.infer<typeof insertStockTransferSchema>;
export type StockTransfer = InsertStockTransfer & { _id: string; id: string; createdAt: Date };

// Invoice Schema
export const insertInvoiceSchema = z.object({
  userId: z.string(),
  orderId: z.string().optional(),
  invoiceNumber: z.string(),
  issueDate: z.date().default(new Date()),
  dueDate: z.date().optional(),
  status: z.enum(["draft", "issued", "paid", "void", "refunded"]).default("draft"),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    taxRate: z.number().default(15),
    taxAmount: z.number(),
    total: z.number(),
  })),
  subtotal: z.number(),
  taxTotal: z.number(),
  total: z.number(),
  notes: z.string().optional(),
  qrCode: z.string().optional(),
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = InsertInvoice & { _id: string; id: string; createdAt: Date };

// Bank Transfer Schema
export const insertBankTransferSchema = z.object({
  orderId: z.string(),
  userId: z.string(),
  amount: z.number(),
  bankName: z.string(),
  accountHolder: z.string(),
  referenceNumber: z.string().optional(),
  receiptImage: z.string(),
  status: z.enum(["pending", "verified", "rejected"]).default("pending"),
  verifiedBy: z.string().optional(),
  verifiedAt: z.date().optional(),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
});

export type InsertBankTransfer = z.infer<typeof insertBankTransferSchema>;
export type BankTransfer = InsertBankTransfer & { _id: string; id: string; createdAt: Date };

// Shipment Schema
export const insertShipmentSchema = z.object({
  orderId: z.string(),
  trackingNumber: z.string(),
  provider: z.string().default("Storage Station"),
  status: z.enum(["pending", "picked_up", "in_transit", "out_for_delivery", "delivered", "failed"]).default("pending"),
  estimatedDelivery: z.date().optional(),
  actualDelivery: z.date().optional(),
  events: z.array(z.object({
    status: z.string(),
    location: z.string().optional(),
    timestamp: z.date(),
    description: z.string(),
  })).default([]),
  recipientName: z.string(),
  recipientPhone: z.string(),
  deliveryAddress: z.object({
    city: z.string(),
    street: z.string(),
    country: z.string().default("SA"),
  }),
});

export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = InsertShipment & { _id: string; id: string; createdAt: Date };

// Abandoned Cart Schema
export const insertAbandonedCartSchema = z.object({
  customerId: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    price: z.number(),
    quantity: z.number(),
  })),
  total: z.number(),
  lastActivity: z.date().optional(),
  recoveryStatus: z.enum(["pending", "recovered", "expired", "sent"]).default("pending"),
  emailsSent: z.number().default(0),
});

export type InsertAbandonedCart = z.infer<typeof insertAbandonedCartSchema>;
export type AbandonedCart = InsertAbandonedCart & { _id: string; id: string; createdAt: Date };

// Product Stock Schema (Inventory Management)
export const insertInventorySchema = z.object({
  productId: z.string(),
  branchId: z.string(),
  stock: z.number().default(0),
  lowStockThreshold: z.number().default(5),
  location: z.string().optional(),
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = InsertInventory & { _id: string; id: string };

// Content Block Schema for Visual Editing
export const insertContentBlockSchema = z.object({
  key: z.string().min(1),
  type: z.enum(["text", "image", "html", "setting"]),
  content: z.string().min(1),
  draftContent: z.string().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  metadata: z.record(z.any()).default({}),
  isActive: z.boolean().default(true),
});

export type InsertContentBlock = z.infer<typeof insertContentBlockSchema>;
export type ContentBlock = InsertContentBlock & { _id: string; id: string; updatedAt: Date; publishedAt?: Date };

// API Types
export type LoginRequest = { username: string; password: string };
export type AuthResponse = User;
