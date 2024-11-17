import Dexie from 'dexie';

// Main Database for user authentication and management
export class MainDatabase extends Dexie {
  users!: Dexie.Table<{
    id?: number;
    email: string;
    password: string;
    name: string;
    dbName: string;
    role: 'admin' | 'user';
    status: 'active' | 'suspended' | 'deleted';
    subscription?: {
      type: 'free' | 'premium';
      expiresAt: string;
      autoRenew: boolean;
    };
    createdAt: string;
    updatedAt: string;
  }, number>;

  constructor() {
    super('MainDB');
    this.version(1).stores({
      users: '++id, email, role, status'
    });
  }

  async createUser(email: string, password: string, name: string) {
    try {
      // Input validation
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }

      // Check if user exists
      const existingUser = await this.users.where('email').equals(email).first();
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create unique database name for user
      const dbName = `UserDB_${Date.now()}`;

      // Determine if this is the first user (admin)
      const isFirstUser = (await this.users.count()) === 0;

      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7-day free trial

      const user = {
        email,
        password, // In a real app, hash the password
        name,
        dbName,
        role: isFirstUser ? 'admin' : 'user' as const,
        status: 'active' as const,
        subscription: {
          type: 'free' as const,
          expiresAt: expiresAt.toISOString(),
          autoRenew: false
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      const id = await this.users.add(user);
      return { ...user, id };
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async createAdminUser(email: string, password: string, name: string) {
    try {
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }

      const existingUser = await this.users.where('email').equals(email).first();
      if (existingUser) {
        throw new Error('User already exists');
      }

      const dbName = `UserDB_${Date.now()}`;
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 100); // Effectively permanent

      const user = {
        email,
        password,
        name,
        dbName,
        role: 'admin' as const,
        status: 'active' as const,
        subscription: {
          type: 'premium' as const,
          expiresAt: expiresAt.toISOString(),
          autoRenew: true
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      const id = await this.users.add(user);
      return { ...user, id };
    } catch (error) {
      console.error('Failed to create admin user:', error);
      throw error;
    }
  }

  async authenticateUser(email: string, password: string) {
    try {
      const user = await this.users.where('email').equals(email).first();
      if (!user) {
        throw new Error('User not found');
      }

      if (user.status === 'suspended') {
        throw new Error('Account is suspended. Please contact support.');
      }

      // In a real app, compare hashed passwords
      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      // Check subscription expiry
      if (user.subscription && new Date(user.subscription.expiresAt) < new Date()) {
        if (user.subscription.autoRenew) {
          // Renew subscription
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + (user.subscription.type === 'premium' ? 30 : 7));
          
          await this.users.update(user.id!, {
            subscription: {
              ...user.subscription,
              expiresAt: expiresAt.toISOString()
            }
          });
        } else {
          // Suspend account if subscription expired
          await this.users.update(user.id!, { status: 'suspended' });
          throw new Error('Your subscription has expired. Please renew to continue.');
        }
      }

      return user;
    } catch (error) {
      console.error('Failed to authenticate user:', error);
      throw error;
    }
  }

  async upgradeToAdmin(userId: number) {
    try {
      const user = await this.users.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role === 'admin') {
        throw new Error('User is already an admin');
      }

      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 100); // Effectively permanent

      await this.users.update(userId, {
        role: 'admin',
        status: 'active',
        subscription: {
          type: 'premium',
          expiresAt: expiresAt.toISOString(),
          autoRenew: true
        },
        updatedAt: now.toISOString()
      });

      return true;
    } catch (error) {
      console.error('Failed to upgrade user to admin:', error);
      throw error;
    }
  }

  async removeAdminRole(userId: number) {
    try {
      const user = await this.users.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'admin') {
        throw new Error('User is not an admin');
      }

      // Check if this is the last admin
      const adminCount = await this.users.where('role').equals('admin').count();
      if (adminCount <= 1) {
        throw new Error('Cannot remove the last admin user');
      }

      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Reset to free trial

      await this.users.update(userId, {
        role: 'user',
        subscription: {
          type: 'free',
          expiresAt: expiresAt.toISOString(),
          autoRenew: false
        },
        updatedAt: now.toISOString()
      });

      return true;
    } catch (error) {
      console.error('Failed to remove admin role:', error);
      throw error;
    }
  }

  async updateUserSubscription(userId: number, type: 'free' | 'premium', autoRenew: boolean) {
    try {
      const user = await this.users.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (type === 'premium' ? 30 : 7));

      await this.users.update(userId, {
        subscription: {
          type,
          expiresAt: expiresAt.toISOString(),
          autoRenew
        },
        status: 'active',
        updatedAt: now.toISOString()
      });

      return true;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: number, status: 'active' | 'suspended') {
    try {
      const user = await this.users.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role === 'admin' && status === 'suspended') {
        throw new Error('Cannot suspend admin users');
      }

      await this.users.update(userId, { 
        status,
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw error;
    }
  }

  async getAllUsers() {
    return this.users.toArray();
  }

  async deleteUser(userId: number) {
    try {
      const user = await this.users.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role === 'admin') {
        const adminCount = await this.users.where('role').equals('admin').count();
        if (adminCount <= 1) {
          throw new Error('Cannot delete the last admin user');
        }
      }

      // Delete user's database
      await Dexie.delete(user.dbName);

      // Delete user from main database
      await this.users.delete(userId);
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }
}

// User Database for individual user data
export class UserDatabase extends Dexie {
  positions!: Dexie.Table<any, number>;
  settings!: Dexie.Table<any, number>;

  constructor(name: string) {
    super(name);
    this.version(1).stores({
      positions: '++id, symbol, type, createdAt, updatedAt',
      settings: '++id'
    });
  }

  async clearData() {
    await this.positions.clear();
    await this.settings.clear();
    
    // Reset settings to default
    await this.settings.add({
      accountValue: 100000,
      profitRiskRatio: 2,
      lossRiskRatio: 1,
      riskPercentage: 1,
      setupCompleted: false,
      updatedAt: new Date().toISOString()
    });
  }

  async getSettings() {
    let settings = await this.settings.toArray();
    if (settings.length === 0) {
      const defaultSettings = {
        accountValue: 100000,
        profitRiskRatio: 2,
        lossRiskRatio: 1,
        riskPercentage: 1,
        setupCompleted: false,
        updatedAt: new Date().toISOString()
      };
      await this.settings.add(defaultSettings);
      return defaultSettings;
    }
    return settings[0];
  }

  async updateSettings(updates: Partial<any>) {
    const settings = await this.getSettings();
    await this.settings.update(settings.id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async getAllPositions() {
    return this.positions.toArray();
  }

  async addPosition(position: any) {
    return this.positions.add(position);
  }

  async updatePosition(id: number, updates: any) {
    return this.positions.update(id, updates);
  }

  async deletePosition(id: number) {
    return this.positions.delete(id);
  }

  async getAccountValue() {
    const settings = await this.getSettings();
    return settings.accountValue;
  }

  async updateAccountValue(value: number) {
    const settings = await this.getSettings();
    await this.settings.update(settings.id, {
      accountValue: value,
      updatedAt: new Date().toISOString()
    });
  }
}

// Initialize databases
export const mainDB = new MainDatabase();
export const getUserDB = (dbName: string) => new UserDatabase(dbName);