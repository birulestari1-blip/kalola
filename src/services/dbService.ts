import { supabase } from '../lib/supabase';

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: string;
  balance: number;
  target_balance?: number;
  color: string;
  account_number?: string;
  account_holder?: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  date: string;
  note?: string;
  created_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  created_at?: string;
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  type: string;
  value: number;
  purchase_date?: string;
  note?: string;
  created_at?: string;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  lender: string;
  amount: number;
  interest_rate?: number;
  due_date?: string;
  status: 'active' | 'paid';
  created_at?: string;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: string;
  platform: string;
  amount_invested: number;
  current_value: number;
  risk?: 'Low' | 'Medium' | 'High';
  purchase_date?: string;
  last_updated?: string;
  created_at?: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: string;
  created_at?: string;
}

export const dbService = {
  // Wallets
  async getWallets() {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as Wallet[];
  },

  async createWallet(wallet: Omit<Wallet, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('wallets')
      .insert([{ ...wallet, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Wallet;
  },

  async updateWallet(id: string, wallet: Partial<Omit<Wallet, 'id' | 'user_id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('wallets')
      .update(wallet)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Wallet;
  },

  async deleteWallet(id: string) {
    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Transactions
  async getTransactions(walletId?: string) {
    let query = supabase
      .from('transactions')
      .select('*, wallets(name)')
      .order('date', { ascending: false });
    
    if (walletId) {
      query = query.eq('wallet_id', walletId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;

    // Update wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('id', transaction.wallet_id)
      .single();

    if (wallet) {
      const newBalance = transaction.type === 'income' 
        ? wallet.balance + transaction.amount 
        : wallet.balance - transaction.amount;
      
      await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', transaction.wallet_id);
    }

    return data as Transaction;
  },

  async updateTransaction(id: string, transaction: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>) {
    // Get old transaction to adjust wallet balance
    const { data: oldTrans } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldTrans) throw new Error('Transaction not found');

    const { data, error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // Adjust wallet balance if amount, type, or wallet changed
    if (transaction.amount !== undefined || transaction.type !== undefined || transaction.wallet_id !== undefined) {
      // Reverse old transaction
      const { data: oldWallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', oldTrans.wallet_id)
        .single();
      
      if (oldWallet) {
        const reversedBalance = oldTrans.type === 'income'
          ? oldWallet.balance - oldTrans.amount
          : oldWallet.balance + oldTrans.amount;
        
        await supabase
          .from('wallets')
          .update({ balance: reversedBalance })
          .eq('id', oldTrans.wallet_id);
      }

      // Apply new transaction
      const newTrans = { ...oldTrans, ...transaction };
      const { data: newWallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', newTrans.wallet_id)
        .single();
      
      if (newWallet) {
        const appliedBalance = newTrans.type === 'income'
          ? newWallet.balance + newTrans.amount
          : newWallet.balance - newTrans.amount;
        
        await supabase
          .from('wallets')
          .update({ balance: appliedBalance })
          .eq('id', newTrans.wallet_id);
      }
    }

    return data as Transaction;
  },

  async deleteTransaction(id: string) {
    const { data: trans } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (trans) {
      // Reverse wallet balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', trans.wallet_id)
        .single();
      
      if (wallet) {
        const newBalance = trans.type === 'income'
          ? wallet.balance - trans.amount
          : wallet.balance + trans.amount;
        
        await supabase
          .from('wallets')
          .update({ balance: newBalance })
          .eq('id', trans.wallet_id);
      }
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Budgets
  async getBudgets() {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createBudget(budget: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('budgets')
      .insert([{ ...budget, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateBudget(id: string, budget: any) {
    const { data, error } = await supabase
      .from('budgets')
      .update(budget)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteBudget(id: string) {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Goals
  async getGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createGoal(goal: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goal, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateGoal(id: string, goal: any) {
    const { data, error } = await supabase
      .from('goals')
      .update(goal)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteGoal(id: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Assets
  async getAssets() {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as Asset[];
  },

  async createAsset(asset: Omit<Asset, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('assets')
      .insert([{ ...asset, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Asset;
  },

  async updateAsset(id: string, asset: Partial<Omit<Asset, 'id' | 'user_id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('assets')
      .update(asset)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Asset;
  },

  async deleteAsset(id: string) {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Debts
  async getDebts() {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as Debt[];
  },

  async createDebt(debt: Omit<Debt, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('debts')
      .insert([{ ...debt, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Debt;
  },

  async updateDebt(id: string, debt: Partial<Omit<Debt, 'id' | 'user_id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('debts')
      .update(debt)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Debt;
  },

  async deleteDebt(id: string) {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Transfers
  async transfer(fromWalletId: string, toWalletId: string, amount: number, note?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Create Expense Transaction for source wallet
    await this.createTransaction({
      name: 'Transfer Keluar',
      wallet_id: fromWalletId,
      amount: amount,
      type: 'transfer' as any,
      category: 'Transfer',
      date: new Date().toISOString().split('T')[0],
      note: note || `Transfer ke dompet lain`
    });

    // 2. Create Income Transaction for destination wallet
    await this.createTransaction({
      name: 'Transfer Masuk',
      wallet_id: toWalletId,
      amount: amount,
      type: 'income',
      category: 'Transfer',
      date: new Date().toISOString().split('T')[0],
      note: note || `Transfer dari dompet lain`
    });
  },

  // Investments
  async getInvestments() {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as Investment[];
  },

  async createInvestment(investment: Omit<Investment, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('investments')
      .insert([{ ...investment, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Investment;
  },

  async updateInvestment(id: string, investment: Partial<Omit<Investment, 'id' | 'user_id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('investments')
      .update(investment)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Investment;
  },

  async deleteInvestment(id: string) {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Notes
  async getNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Note[];
  },

  async createNote(note: Omit<Note, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .insert([{ ...note, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Note;
  },

  async updateNote(id: string, note: Partial<Omit<Note, 'id' | 'user_id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('notes')
      .update(note)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Note;
  },

  async deleteNote(id: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
