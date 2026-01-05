import mongoose from 'mongoose';

interface LoyaltyTier {
  name: string;
  minSpent: number;
  pointsMultiplier: number;
  discountPercent: number;
}

interface LoyaltyConfig {
  pointsPerSAR: number;
  SARPerPoint: number;
  minRedeemPoints: number;
  maxRedeemPercent: number;
  birthdayBonusPoints: number;
  referralBonusPoints: number;
  firstOrderBonusPoints: number;
  expiryMonths: number;
  tiers: { [key: string]: LoyaltyTier };
}

interface LoyaltyTransaction {
  userId: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'referral' | 'birthday' | 'adjustment';
  description: string;
  orderId?: string;
  expiresAt?: Date;
}

export class LoyaltyService {
  private config: LoyaltyConfig = {
    pointsPerSAR: 1,
    SARPerPoint: 0.1,
    minRedeemPoints: 100,
    maxRedeemPercent: 50,
    birthdayBonusPoints: 500,
    referralBonusPoints: 200,
    firstOrderBonusPoints: 100,
    expiryMonths: 12,
    tiers: {
      bronze: { name: 'برونزي', minSpent: 0, pointsMultiplier: 1, discountPercent: 0 },
      silver: { name: 'فضي', minSpent: 1000, pointsMultiplier: 1.25, discountPercent: 3 },
      gold: { name: 'ذهبي', minSpent: 5000, pointsMultiplier: 1.5, discountPercent: 5 },
      platinum: { name: 'بلاتيني', minSpent: 15000, pointsMultiplier: 2, discountPercent: 10 }
    }
  };

  private getUsersCollection() {
    return mongoose.connection.collection('users');
  }

  private getLoyaltyTransactionsCollection() {
    return mongoose.connection.collection('loyaltyTransactions');
  }

  calculateTier(totalSpent: number): string {
    const tiers = Object.entries(this.config.tiers)
      .sort((a, b) => b[1].minSpent - a[1].minSpent);
    
    for (const [tierKey, tier] of tiers) {
      if (totalSpent >= tier.minSpent) {
        return tierKey;
      }
    }
    return 'bronze';
  }

  getTierInfo(tierKey: string): LoyaltyTier {
    return this.config.tiers[tierKey] || this.config.tiers.bronze;
  }

  calculatePointsForOrder(orderTotal: number, tier: string): number {
    const tierInfo = this.getTierInfo(tier);
    const basePoints = Math.floor(orderTotal * this.config.pointsPerSAR);
    return Math.floor(basePoints * tierInfo.pointsMultiplier);
  }

  calculateRedemptionValue(points: number): number {
    return points * this.config.SARPerPoint;
  }

  calculatePointsNeeded(sarValue: number): number {
    return Math.ceil(sarValue / this.config.SARPerPoint);
  }

  canRedeem(points: number, orderTotal: number): { canRedeem: boolean; maxRedeemable: number; reason?: string } {
    if (points < this.config.minRedeemPoints) {
      return { 
        canRedeem: false, 
        maxRedeemable: 0, 
        reason: `الحد الأدنى للاستبدال هو ${this.config.minRedeemPoints} نقطة` 
      };
    }

    const maxRedeemValue = orderTotal * (this.config.maxRedeemPercent / 100);
    const maxRedeemablePoints = this.calculatePointsNeeded(maxRedeemValue);
    const actualRedeemable = Math.min(points, maxRedeemablePoints);

    return {
      canRedeem: true,
      maxRedeemable: actualRedeemable
    };
  }

  async earnPoints(userId: string, orderId: string, orderTotal: number): Promise<{ points: number; newBalance: number; tier: string }> {
    const usersCollection = this.getUsersCollection();
    const transactionsCollection = this.getLoyaltyTransactionsCollection();

    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user) throw new Error('User not found');

    const currentTier = user.loyaltyTier || 'bronze';
    const pointsEarned = this.calculatePointsForOrder(orderTotal, currentTier);

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + this.config.expiryMonths);

    await transactionsCollection.insertOne({
      userId,
      points: pointsEarned,
      type: 'earned',
      description: `نقاط مكتسبة من الطلب`,
      orderId,
      expiresAt,
      createdAt: new Date()
    });

    const newPoints = (user.loyaltyPoints || 0) + pointsEarned;
    const newTotalSpent = (user.totalSpent || 0) + orderTotal;
    const newTier = this.calculateTier(newTotalSpent);

    await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          loyaltyPoints: newPoints,
          loyaltyTier: newTier,
          totalSpent: newTotalSpent
        }
      }
    );

    return {
      points: pointsEarned,
      newBalance: newPoints,
      tier: newTier
    };
  }

  async redeemPoints(userId: string, orderId: string, pointsToRedeem: number): Promise<{ redeemed: number; sarValue: number; newBalance: number }> {
    const usersCollection = this.getUsersCollection();
    const transactionsCollection = this.getLoyaltyTransactionsCollection();

    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user) throw new Error('User not found');

    const currentPoints = user.loyaltyPoints || 0;
    if (pointsToRedeem > currentPoints) {
      throw new Error('رصيد النقاط غير كافٍ');
    }

    if (pointsToRedeem < this.config.minRedeemPoints) {
      throw new Error(`الحد الأدنى للاستبدال هو ${this.config.minRedeemPoints} نقطة`);
    }

    const sarValue = this.calculateRedemptionValue(pointsToRedeem);

    await transactionsCollection.insertOne({
      userId,
      points: -pointsToRedeem,
      type: 'redeemed',
      description: `استبدال نقاط للخصم`,
      orderId,
      createdAt: new Date()
    });

    const newBalance = currentPoints - pointsToRedeem;

    await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { loyaltyPoints: newBalance } }
    );

    return {
      redeemed: pointsToRedeem,
      sarValue,
      newBalance
    };
  }

  async addBonusPoints(userId: string, points: number, type: 'birthday' | 'referral' | 'bonus', description: string): Promise<number> {
    const usersCollection = this.getUsersCollection();
    const transactionsCollection = this.getLoyaltyTransactionsCollection();

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + this.config.expiryMonths);

    await transactionsCollection.insertOne({
      userId,
      points,
      type,
      description,
      expiresAt,
      createdAt: new Date()
    });

    const result = await usersCollection.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $inc: { loyaltyPoints: points } },
      { returnDocument: 'after' }
    );

    return result?.loyaltyPoints || points;
  }

  async adjustPoints(userId: string, points: number, description: string, adminId: string): Promise<number> {
    const usersCollection = this.getUsersCollection();
    const transactionsCollection = this.getLoyaltyTransactionsCollection();

    await transactionsCollection.insertOne({
      userId,
      points,
      type: 'adjustment',
      description: `${description} (بواسطة المسؤول)`,
      createdAt: new Date()
    });

    const result = await usersCollection.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $inc: { loyaltyPoints: points } },
      { returnDocument: 'after' }
    );

    return result?.loyaltyPoints || 0;
  }

  async getTransactionHistory(userId: string, limit: number = 20): Promise<LoyaltyTransaction[]> {
    const transactionsCollection = this.getLoyaltyTransactionsCollection();
    
    const transactions = await transactionsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return transactions as unknown as LoyaltyTransaction[];
  }

  async getUserLoyaltyStatus(userId: string): Promise<{
    points: number;
    tier: string;
    tierInfo: LoyaltyTier;
    totalSpent: number;
    nextTier: { name: string; required: number } | null;
    recentTransactions: LoyaltyTransaction[];
  }> {
    const usersCollection = this.getUsersCollection();
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    
    if (!user) throw new Error('User not found');

    const tier = user.loyaltyTier || 'bronze';
    const tierInfo = this.getTierInfo(tier);
    const totalSpent = user.totalSpent || 0;

    const tiers = Object.entries(this.config.tiers)
      .sort((a, b) => a[1].minSpent - b[1].minSpent);
    
    const currentTierIndex = tiers.findIndex(([key]) => key === tier);
    const nextTierData = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

    const recentTransactions = await this.getTransactionHistory(userId, 10);

    return {
      points: user.loyaltyPoints || 0,
      tier,
      tierInfo,
      totalSpent,
      nextTier: nextTierData ? {
        name: nextTierData[1].name,
        required: nextTierData[1].minSpent - totalSpent
      } : null,
      recentTransactions
    };
  }

  async processExpiredPoints(): Promise<number> {
    const usersCollection = this.getUsersCollection();
    const transactionsCollection = this.getLoyaltyTransactionsCollection();

    const now = new Date();
    
    const expiredTransactions = await transactionsCollection.find({
      type: { $in: ['earned', 'bonus', 'referral', 'birthday'] },
      expiresAt: { $lte: now },
      processed: { $ne: true }
    }).toArray();

    let totalExpired = 0;

    for (const transaction of expiredTransactions) {
      await usersCollection.updateOne(
        { _id: new mongoose.Types.ObjectId(transaction.userId) },
        { $inc: { loyaltyPoints: -transaction.points } }
      );

      await transactionsCollection.insertOne({
        userId: transaction.userId,
        points: -transaction.points,
        type: 'expired',
        description: 'انتهاء صلاحية النقاط',
        createdAt: new Date()
      });

      await transactionsCollection.updateOne(
        { _id: transaction._id },
        { $set: { processed: true } }
      );

      totalExpired += transaction.points;
    }

    return totalExpired;
  }

  getLoyaltyRules(): LoyaltyConfig {
    return this.config;
  }

  async updateLoyaltyRules(newConfig: Partial<LoyaltyConfig>): Promise<LoyaltyConfig> {
    this.config = { ...this.config, ...newConfig };
    return this.config;
  }
}

export const loyaltyService = new LoyaltyService();
