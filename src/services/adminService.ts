import { dbService, Wallet, Transaction } from './dbService';

export interface PlatformStats {
  totalUsers: number;
  activeUsers24h: number;
  totalRevenue: number;
  revenueGrowth: number;
  activeProSubscriptions: number;
  systemHealth: 'Healthy' | 'Warning' | 'Critical';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  joinedAt: string;
  tier: 'Free' | 'Starter' | 'Pro';
  status: 'Active' | 'Suspended';
  lastActive: string;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  userName: string;
  plan: 'Starter' | 'Pro';
  amount: number;
  date: string;
  status: 'Success' | 'Pending' | 'Failed';
}

export const adminService = {
  async getPlatformStats(): Promise<PlatformStats> {
    // Simulated platform stats
    return {
      totalUsers: 1248,
      activeUsers24h: 312,
      totalRevenue: 45200000,
      revenueGrowth: 12.5,
      activeProSubscriptions: 85,
      systemHealth: 'Healthy'
    };
  },

  async getUsers(): Promise<AdminUser[]> {
    // Simulated users
    return [
      { id: 'u1', email: 'budi@example.com', name: 'Budi Santoso', joinedAt: '2026-03-01', tier: 'Pro', status: 'Active', lastActive: '2026-04-10' },
      { id: 'u2', email: 'siti@example.com', name: 'Siti Aminah', joinedAt: '2026-03-05', tier: 'Free', status: 'Active', lastActive: '2026-04-09' },
      { id: 'u3', email: 'agus@web.com', name: 'Agus Setiawan', joinedAt: '2026-03-10', tier: 'Starter', status: 'Active', lastActive: '2026-04-10' },
      { id: 'u4', email: 'bad@user.com', name: 'User Nakal', joinedAt: '2026-03-12', tier: 'Free', status: 'Suspended', lastActive: '2026-03-15' },
      { id: 'u5', email: 'rina@gmail.com', name: 'Rina Wijaya', joinedAt: '2026-04-01', tier: 'Pro', status: 'Active', lastActive: '2026-04-10' },
    ];
  },

  async getRecentSubscriptions(): Promise<AdminSubscription[]> {
    return [
      { id: 's1', userId: 'u1', userName: 'Budi Santoso', plan: 'Pro', amount: 149000, date: '2026-04-09', status: 'Success' },
      { id: 's2', userId: 'u3', userName: 'Agus Setiawan', plan: 'Starter', amount: 99000, date: '2026-04-08', status: 'Success' },
      { id: 's3', userId: 'u5', userName: 'Rina Wijaya', plan: 'Pro', amount: 149000, date: '2026-04-10', status: 'Success' },
    ];
  },

  async updateUserStatus(userId: string, status: 'Active' | 'Suspended') {
    console.log(`Updating user ${userId} status to ${status}`);
    return true;
  },

  async updateUserTier(userId: string, tier: 'Free' | 'Starter' | 'Pro') {
    console.log(`Updating user ${userId} tier to ${tier}`);
    return true;
  }
};
