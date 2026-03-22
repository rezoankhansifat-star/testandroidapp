export type CategoryType = 'Salary' | 'Medicine' | 'Restaurant' | 'Cloth' | 'Fuel' | 'House' | 'Transport' | 'Office' | 'Education' | 'Other';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: CategoryType;
  date: string;
  note?: string;
}

export interface Budget {
  category: CategoryType;
  limit: number;
}

export interface AppData {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoal: number;
}
