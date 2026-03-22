import { useState, useEffect } from 'react';
import { AppData, Transaction, Budget } from '../types';

const STORAGE_KEY = 'fintrack_data_v2';

const INITIAL_DATA: AppData = {
  transactions: [],
  budgets: [],
  savingsGoal: 0,
};

export function useStorage() {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
    };
    setData(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
    }));
  };

  const deleteTransaction = (id: string) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  };

  const updateBudget = (budget: Budget) => {
    setData(prev => {
      const existing = prev.budgets.findIndex(b => b.category === budget.category);
      const newBudgets = [...prev.budgets];
      if (existing >= 0) {
        newBudgets[existing] = budget;
      } else {
        newBudgets.push(budget);
      }
      return { ...prev, budgets: newBudgets };
    });
  };

  return {
    data,
    addTransaction,
    deleteTransaction,
    updateBudget,
  };
}
