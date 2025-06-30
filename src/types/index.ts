// Common interfaces
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User extends BaseEntity {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

// Tipos de produto
export interface Product extends BaseEntity {
  name: string;
  description: string;
  sku: string;
  price: number;
  cost: number;
  stockQuantity: number;
  categoryId: string;
  supplierId: string;
  imageUrl: string;
  isActive: boolean;
}

export interface Category extends BaseEntity {
  name: string;
  description: string;
}

// Client types
export interface Client extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  document: string; // CPF or CNPJ
  documentType: 'cpf' | 'cnpj';
  address: Address;
  isActive: boolean;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Supplier types
export interface Supplier extends BaseEntity {
  name: string;
  /** Produto fornecido pelo fornecedor */
  product: string;
  contactName: string;
  email: string;
  phone: string;
  document: string; // CNPJ
  address: Address;
  isActive: boolean;
}

// Order types
export interface Order extends BaseEntity {
  clientId: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  paymentMethod: 'cash' | 'credit' | 'debit' | 'transfer' | 'other';
  items: OrderItem[];
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

// Transaction types
export interface Transaction extends BaseEntity {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  orderId?: string;
  supplierId?: string;
  userId: string;
}

// Report types
export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
  clientId?: string;
  supplierId?: string;
  productId?: string;
}

export interface StockReport {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  averageCost: number;
  totalValue: number;
}

export interface SalesReport {
  orderId: string;
  orderNumber: string;
  clientName: string;
  date: string;
  total: number;
  status: string;
  paymentStatus: string;
}

export interface FinancialReport {
  transactionId: string;
  date: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  balance: number;
}

// Search and filter types
export interface SearchParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}