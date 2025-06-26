import React, { createContext, useContext } from 'react';
import { Transaction, ReportFilter, FinancialReport, SearchParams, PaginatedResponse } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { toast } from '@/hooks/use-toast';

// Initial transactions
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'trans_1',
    type: 'income',
    amount: 1429.99,
    description: 'Payment for order ORD-001',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    category: 'sale',
    orderId: 'order_1',
    userId: '1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trans_2',
    type: 'income',
    amount: 1237.45,
    description: 'Payment for order ORD-002',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    category: 'sale',
    orderId: 'order_2',
    userId: '1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trans_3',
    type: 'expense',
    amount: 2500,
    description: 'Supplier payment',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    category: 'purchase',
    supplierId: 'sup_1',
    userId: '1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trans_4',
    type: 'expense',
    amount: 1200,
    description: 'Monthly rent',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    category: 'rent',
    userId: '1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

interface TransactionContextType {
  transactions: Transaction[];
  createTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction;
  getTransactionById: (id: string) => Transaction | undefined;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  searchTransactions: (params: SearchParams) => PaginatedResponse<Transaction>;
  generateFinancialReport: (filter: ReportFilter) => FinancialReport[];
  getBalanceByPeriod: (startDate: string, endDate: string) => { income: number; expense: number; balance: number };
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', INITIAL_TRANSACTIONS);

  // Transaction CRUD functions
  const createTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction => {
    // Validate transaction
    if (transactionData.amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar transação',
        description: 'O valor deve ser maior que zero',
      });
      throw new Error('Transaction amount must be greater than zero');
    }

    const newTransaction: Transaction = {
      ...transactionData,
      id: `trans_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);
    
    toast({
      title: 'Transação criada',
      description: 'Transação registrada com sucesso',
    });
    
    return newTransaction;
  };

  const getTransactionById = (id: string): Transaction | undefined => 
    transactions.find((transaction) => transaction.id === id);

  const updateTransaction = (updatedTransaction: Transaction): void => {
    // Validate transaction
    if (updatedTransaction.amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar transação',
        description: 'O valor deve ser maior que zero',
      });
      throw new Error('Transaction amount must be greater than zero');
    }

    const updatedTransactions = transactions.map((transaction) =>
      transaction.id === updatedTransaction.id
        ? { ...updatedTransaction, updatedAt: new Date().toISOString() }
        : transaction
    );
    
    setTransactions(updatedTransactions);
    
    toast({
      title: 'Transação atualizada',
      description: 'Transação atualizada com sucesso',
    });
  };

  const deleteTransaction = (id: string): void => {
    const updatedTransactions = transactions.filter((transaction) => transaction.id !== id);
    setTransactions(updatedTransactions);
    
    toast({
      title: 'Transação removida',
      description: 'Transação removida com sucesso',
    });
  };

  const searchTransactions = (params: SearchParams): PaginatedResponse<Transaction> => {
    const { page = 1, limit = 10, search = '', sort = 'date', order = 'desc', filters = {} } = params;
    
    // Filter transactions based on search term and filters
    let filteredTransactions = transactions.filter((transaction) => {
      // Search by description
      const matchesSearch = search
        ? transaction.description.toLowerCase().includes(search.toLowerCase())
        : true;
      
      // Apply additional filters
      const matchesType = filters.type
        ? transaction.type === filters.type
        : true;
      
      const matchesCategory = filters.category
        ? transaction.category === filters.category
        : true;
      
      const matchesStartDate = filters.startDate
        ? new Date(transaction.date) >= new Date(filters.startDate)
        : true;
      
      const matchesEndDate = filters.endDate
        ? new Date(transaction.date) <= new Date(filters.endDate)
        : true;
      
      const matchesOrderId = filters.orderId
        ? transaction.orderId === filters.orderId
        : true;
      
      const matchesSupplierId = filters.supplierId
        ? transaction.supplierId === filters.supplierId
        : true;
      
      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesStartDate &&
        matchesEndDate &&
        matchesOrderId &&
        matchesSupplierId
      );
    });
    
    // Sort transactions
    filteredTransactions.sort((a, b) => {
      let compareA: any = a[sort as keyof Transaction];
      let compareB: any = b[sort as keyof Transaction];
      
      // Handle date comparison
      if (sort === 'date' || sort === 'createdAt' || sort === 'updatedAt') {
        compareA = new Date(compareA);
        compareB = new Date(compareB);
      }
      // Handle string comparison
      else if (typeof compareA === 'string' && typeof compareB === 'string') {
        compareA = compareA.toLowerCase();
        compareB = compareB.toLowerCase();
      }
      
      if (order === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
    
    // Calculate pagination
    const totalItems = filteredTransactions.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    return {
      data: paginatedTransactions,
      total: totalItems,
      page,
      limit,
      totalPages,
    };
  };

  // Generate financial report
  const generateFinancialReport = (filter: ReportFilter): FinancialReport[] => {
    const { startDate, endDate, category, type } = filter;
    
    // Filter transactions based on provided filters
    const filteredTransactions = transactions.filter((transaction) => {
      const matchesStartDate = startDate
        ? new Date(transaction.date) >= new Date(startDate)
        : true;
      
      const matchesEndDate = endDate
        ? new Date(transaction.date) <= new Date(endDate)
        : true;
      
      const matchesCategory = category
        ? transaction.category === category
        : true;
      
      const matchesType = type
        ? transaction.type === type
        : true;
      
      return matchesStartDate && matchesEndDate && matchesCategory && matchesType;
    });
    
    // Sort transactions by date (oldest first)
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Calculate running balance for each transaction
    let runningBalance = 0;
    
    return sortedTransactions.map((transaction) => {
      // Update running balance
      if (transaction.type === 'income') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
      
      return {
        transactionId: transaction.id,
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
        balance: runningBalance,
      };
    });
  };

  // Get balance for a specific period
  const getBalanceByPeriod = (startDate: string, endDate: string): { income: number; expense: number; balance: number } => {
    // Filter transactions by date range
    const filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        (!startDate || transactionDate >= new Date(startDate)) &&
        (!endDate || transactionDate <= new Date(endDate))
      );
    });
    
    // Calculate totals
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expense,
      balance: income - expense,
    };
  };

  const value = {
    transactions,
    createTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    searchTransactions,
    generateFinancialReport,
    getBalanceByPeriod,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};