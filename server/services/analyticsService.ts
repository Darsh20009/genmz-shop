import mongoose from 'mongoose';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface SalesOverview {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  conversionRate: number;
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
  image?: string;
}

interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  averageLifetimeValue: number;
  topSpenders: Array<{
    customerId: string;
    name: string;
    totalSpent: number;
    ordersCount: number;
  }>;
}

interface InventoryHealth {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  overstocked: number;
  topSellingProducts: TopProduct[];
  slowMovingProducts: TopProduct[];
}

export class AnalyticsService {
  private getOrdersCollection() {
    return mongoose.connection.collection('orders');
  }

  private getUsersCollection() {
    return mongoose.connection.collection('users');
  }

  private getProductsCollection() {
    return mongoose.connection.collection('products');
  }

  async getSalesOverview(dateRange?: DateRange): Promise<SalesOverview> {
    const ordersCollection = this.getOrdersCollection();
    const usersCollection = this.getUsersCollection();
    
    const matchStage: any = { 
      status: { $nin: ['cancelled', 'returned'] },
      paymentStatus: 'paid' 
    };
    
    if (dateRange) {
      matchStage.createdAt = {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate
      };
    }

    const orderStats = await ordersCollection.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: '$total' } },
          totalOrders: { $sum: 1 },
          uniqueCustomers: { $addToSet: '$userId' }
        }
      }
    ]).toArray();

    const stats = orderStats[0] || { totalRevenue: 0, totalOrders: 0, uniqueCustomers: [] };
    
    const totalCustomers = await usersCollection.countDocuments({ role: 'customer' });
    
    const newCustomersMatch: any = { role: 'customer' };
    if (dateRange) {
      newCustomersMatch.createdAt = {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate
      };
    }
    const newCustomers = await usersCollection.countDocuments(newCustomersMatch);

    return {
      totalRevenue: stats.totalRevenue || 0,
      totalOrders: stats.totalOrders || 0,
      averageOrderValue: stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0,
      totalCustomers,
      newCustomers,
      returningCustomers: (stats.uniqueCustomers?.length || 0) - newCustomers,
      conversionRate: totalCustomers > 0 ? (stats.uniqueCustomers?.length || 0) / totalCustomers * 100 : 0
    };
  }

  async getTimeSeries(dateRange: DateRange, interval: 'day' | 'week' | 'month' = 'day'): Promise<TimeSeriesData[]> {
    const ordersCollection = this.getOrdersCollection();
    
    const dateFormat = interval === 'day' ? '%Y-%m-%d' : 
                       interval === 'week' ? '%Y-W%V' : '%Y-%m';

    const result = await ordersCollection.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
          status: { $nin: ['cancelled', 'returned'] },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: { $toDouble: '$total' } },
          orders: { $sum: 1 },
          customers: { $addToSet: '$userId' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          orders: 1,
          customers: { $size: '$customers' }
        }
      }
    ]).toArray();

    return result.map(item => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders,
      customers: item.customers
    }));
  }

  async getTopProducts(limit: number = 10, dateRange?: DateRange): Promise<TopProduct[]> {
    const ordersCollection = this.getOrdersCollection();
    const productsCollection = this.getProductsCollection();

    const matchStage: any = { 
      status: { $nin: ['cancelled', 'returned'] },
      paymentStatus: 'paid' 
    };
    if (dateRange) {
      matchStage.createdAt = {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate
      };
    }

    const topProducts = await ordersCollection.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          name: { $first: '$items.title' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: limit }
    ]).toArray();

    const productsWithImages = await Promise.all(
      topProducts.map(async (product) => {
        const productDoc = await productsCollection.findOne({ _id: new mongoose.Types.ObjectId(product._id) });
        return {
          productId: product._id,
          name: product.name,
          quantity: product.quantity,
          revenue: product.revenue,
          image: productDoc?.images?.[0]
        };
      })
    );

    return productsWithImages;
  }

  async getCustomerAnalytics(dateRange?: DateRange): Promise<CustomerAnalytics> {
    const usersCollection = this.getUsersCollection();
    const ordersCollection = this.getOrdersCollection();

    const totalCustomers = await usersCollection.countDocuments({ role: 'customer' });
    
    const matchStage: any = { 
      status: { $nin: ['cancelled', 'returned'] },
      paymentStatus: 'paid' 
    };
    if (dateRange) {
      matchStage.createdAt = {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate
      };
    }

    const activeCustomersResult = await ordersCollection.aggregate([
      { $match: matchStage },
      { $group: { _id: '$userId' } },
      { $count: 'count' }
    ]).toArray();

    const activeCustomers = activeCustomersResult[0]?.count || 0;

    const topSpenders = await ordersCollection.aggregate([
      { $match: { 
        status: { $nin: ['cancelled', 'returned'] },
        paymentStatus: 'paid'
      } },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: { $toDouble: '$total' } },
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]).toArray();

    const topSpendersWithNames = await Promise.all(
      topSpenders.map(async (spender) => {
        const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(spender._id) });
        return {
          customerId: spender._id,
          name: user?.name || 'Unknown',
          totalSpent: spender.totalSpent,
          ordersCount: spender.ordersCount
        };
      })
    );

    const avgLTV = topSpenders.length > 0 
      ? topSpenders.reduce((sum, s) => sum + s.totalSpent, 0) / topSpenders.length 
      : 0;

    return {
      totalCustomers,
      activeCustomers,
      averageLifetimeValue: avgLTV,
      topSpenders: topSpendersWithNames
    };
  }

  async getInventoryHealth(): Promise<InventoryHealth> {
    const productsCollection = this.getProductsCollection();

    const products = await productsCollection.find({}).toArray();
    
    let lowStock = 0;
    let outOfStock = 0;
    let overstocked = 0;

    products.forEach((product: any) => {
      const variants = product.variants || [];
      variants.forEach((variant: any) => {
        if (variant.stock === 0) outOfStock++;
        else if (variant.stock < 10) lowStock++;
        else if (variant.stock > 100) overstocked++;
      });
    });

    const topSellingProducts = await this.getTopProducts(5);
    
    const slowMoving = await this.getOrdersCollection().aggregate([
      { $match: { 
        status: { $nin: ['cancelled', 'returned'] },
        paymentStatus: 'paid'
      } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          quantity: { $sum: '$items.quantity' },
          name: { $first: '$items.title' }
        }
      },
      { $sort: { quantity: 1 } },
      { $limit: 5 }
    ]).toArray();

    return {
      totalProducts: products.length,
      lowStock,
      outOfStock,
      overstocked,
      topSellingProducts,
      slowMovingProducts: slowMoving.map(p => ({
        productId: p._id,
        name: p.name,
        quantity: p.quantity,
        revenue: 0
      }))
    };
  }

  async getRevenueByCategory(dateRange?: DateRange): Promise<Array<{ category: string; revenue: number; percentage: number }>> {
    const ordersCollection = this.getOrdersCollection();
    const productsCollection = this.getProductsCollection();

    const matchStage: any = { 
      status: { $nin: ['cancelled', 'returned'] },
      paymentStatus: 'paid' 
    };
    if (dateRange) {
      matchStage.createdAt = {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate
      };
    }

    const orderItems = await ordersCollection.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      }
    ]).toArray();

    const categoryRevenue: { [key: string]: number } = {};
    let totalRevenue = 0;

    for (const item of orderItems) {
      try {
        const product = await productsCollection.findOne({ _id: new mongoose.Types.ObjectId(item._id) });
        const categoryId = product?.categoryId || 'uncategorized';
        categoryRevenue[categoryId] = (categoryRevenue[categoryId] || 0) + item.revenue;
        totalRevenue += item.revenue;
      } catch (e) {
        categoryRevenue['uncategorized'] = (categoryRevenue['uncategorized'] || 0) + item.revenue;
        totalRevenue += item.revenue;
      }
    }

    return Object.entries(categoryRevenue).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
    }));
  }

  async getOrderStatusDistribution(dateRange?: DateRange): Promise<Array<{ status: string; count: number; percentage: number }>> {
    const ordersCollection = this.getOrdersCollection();

    const matchStage: any = {};
    if (dateRange) {
      matchStage.createdAt = {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate
      };
    }

    const result = await ordersCollection.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const total = result.reduce((sum, item) => sum + item.count, 0);

    return result.map(item => ({
      status: item._id,
      count: item.count,
      percentage: total > 0 ? (item.count / total) * 100 : 0
    }));
  }

  async getDashboardSummary(): Promise<{
    today: SalesOverview;
    thisWeek: SalesOverview;
    thisMonth: SalesOverview;
    allTime: SalesOverview;
  }> {
    const ordersCollection = this.getOrdersCollection();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [today, thisWeek, thisMonth, allTime] = await Promise.all([
      this.getSalesOverview({ startDate: todayStart, endDate: now }),
      this.getSalesOverview({ startDate: weekStart, endDate: now }),
      this.getSalesOverview({ startDate: monthStart, endDate: now }),
      this.getSalesOverview()
    ]);

    const pendingPayments = await ordersCollection.countDocuments({
      paymentMethod: 'bank_transfer',
      paymentStatus: { $in: ['pending', null] }
    });

    // Additional dashboard-specific calculations
    const statsResult = await ordersCollection.aggregate([
      {
        $facet: {
          counts: [
            { $group: {
              _id: null,
              totalOrders: { $sum: { $cond: [{ $nin: ["$status", ["cancelled", "returned"]] }, 1, 0] } },
              dailyOrders: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", todayStart] }, { $nin: ["$status", ["cancelled", "returned"]] }] }, 1, 0] } },
              cancelledOrders: { $sum: { $cond: [{ $in: ["$status", ["cancelled", "returned"]] }, 1, 0] } },
              processingOrders: { $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] } },
              completedOrders: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
            }}
          ]
        }
      }
    ]).toArray() as any[];

    const counts = statsResult[0]?.counts?.[0] || {
      totalOrders: 0,
      dailyOrders: 0,
      cancelledOrders: 0,
      processingOrders: 0,
      completedOrders: 0
    };

    return { 
      today, 
      thisWeek, 
      thisMonth, 
      allTime,
      ...counts,
      pendingPayments,
      totalSales: allTime.totalRevenue,
      netProfit: allTime.totalRevenue * 0.67 
    };
  }
}

export const analyticsService = new AnalyticsService();
