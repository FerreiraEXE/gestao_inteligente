import React, { createContext, useContext } from 'react';
import { Order, OrderItem, SearchParams, PaginatedResponse } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { toast } from '@/hooks/use-toast';
import { useProducts } from './ProductContext';

// Initial orders
const INITIAL_ORDERS: Order[] = [
  {
    id: 'order_1',
    clientId: 'client_1',
    userId: '1',
    orderNumber: 'ORD-001',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'credit',
    items: [
      {
        id: 'item_1',
        productId: 'prod_1',
        quantity: 1,
        unitPrice: 1299.99,
        discount: 0,
        total: 1299.99,
      },
    ],
    discount: 0,
    tax: 130,
    shipping: 0,
    total: 1429.99,
    notes: 'Standard delivery',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order_2',
    clientId: 'client_2',
    userId: '1',
    orderNumber: 'ORD-002',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'credit',
    items: [
      {
        id: 'item_2',
        productId: 'prod_2',
        quantity: 5,
        unitPrice: 249.99,
        discount: 0,
        total: 1249.95,
      },
    ],
    discount: 125,
    tax: 112.5,
    shipping: 0,
    total: 1237.45,
    notes: 'Corporate discount applied',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

interface OrderContextType {
  orders: Order[];
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Order;
  getOrderById: (id: string) => Order | undefined;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  searchOrders: (params: SearchParams) => PaginatedResponse<Order>;
  calculateOrderTotal: (items: OrderItem[], discount: number, tax: number, shipping: number) => number;
  generateOrderNumber: () => string;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', INITIAL_ORDERS);
  const { products, updateProduct } = useProducts();

  // Order CRUD functions
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
    // Validate order
    if (orderData.items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error creating order',
        description: 'Order must have at least one item',
      });
      throw new Error('Order must have at least one item');
    }

    // Validate item quantities and update product stock
    for (const item of orderData.items) {
      const product = products.find(p => p.id === item.productId);
      
      if (!product) {
        toast({
          variant: 'destructive',
          title: 'Error creating order',
          description: `Product with ID ${item.productId} not found`,
        });
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      
      if (product.stockQuantity < item.quantity) {
        toast({
          variant: 'destructive',
          title: 'Error creating order',
          description: `Not enough stock for product: ${product.name}`,
        });
        throw new Error(`Not enough stock for product: ${product.name}`);
      }
      
      // Update product stock quantity
      updateProduct({
        ...product,
        stockQuantity: product.stockQuantity - item.quantity,
      });
    }

    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders([...orders, newOrder]);
    
    toast({
      title: 'Order created',
      description: 'Order has been created successfully',
    });
    
    return newOrder;
  };

  const getOrderById = (id: string): Order | undefined => 
    orders.find((order) => order.id === id);

  const updateOrder = (updatedOrder: Order): void => {
    const existingOrder = orders.find(order => order.id === updatedOrder.id);
    
    if (!existingOrder) {
      toast({
        variant: 'destructive',
        title: 'Error updating order',
        description: 'Order not found',
      });
      throw new Error('Order not found');
    }

    // Handle stock adjustments if items changed
    // This is simplified - a real app would have more complex logic
    if (existingOrder.status !== 'cancelled' && updatedOrder.status === 'cancelled') {
      // Return items to stock if order is being cancelled
      for (const item of existingOrder.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          updateProduct({
            ...product,
            stockQuantity: product.stockQuantity + item.quantity,
          });
        }
      }
    }

    const updatedOrders = orders.map((order) =>
      order.id === updatedOrder.id
        ? { ...updatedOrder, updatedAt: new Date().toISOString() }
        : order
    );
    
    setOrders(updatedOrders);
    
    toast({
      title: 'Order updated',
      description: 'Order has been updated successfully',
    });
  };

  const deleteOrder = (id: string): void => {
    const order = orders.find(o => o.id === id);
    
    if (!order) {
      toast({
        variant: 'destructive',
        title: 'Error deleting order',
        description: 'Order not found',
      });
      return;
    }

    // Return items to stock if order is being deleted
    if (order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          updateProduct({
            ...product,
            stockQuantity: product.stockQuantity + item.quantity,
          });
        }
      }
    }

    // In a real app, you might want to just mark as deleted rather than remove
    const updatedOrders = orders.filter((order) => order.id !== id);
    setOrders(updatedOrders);
    
    toast({
      title: 'Order deleted',
      description: 'Order has been deleted successfully',
    });
  };

  const searchOrders = (params: SearchParams): PaginatedResponse<Order> => {
    const { page = 1, limit = 10, search = '', sort = 'createdAt', order = 'desc', filters = {} } = params;
    
    // Filter orders based on search term and filters
    let filteredOrders = orders.filter((order) => {
      // Search by order number
      const matchesSearch = search
        ? order.orderNumber.toLowerCase().includes(search.toLowerCase())
        : true;
      
      // Apply additional filters
      const matchesClient = filters.clientId
        ? order.clientId === filters.clientId
        : true;
      
      const matchesStatus = filters.status
        ? order.status === filters.status
        : true;
      
      const matchesPaymentStatus = filters.paymentStatus
        ? order.paymentStatus === filters.paymentStatus
        : true;
      
      const matchesPaymentMethod = filters.paymentMethod
        ? order.paymentMethod === filters.paymentMethod
        : true;
      
      const matchesStartDate = filters.startDate
        ? new Date(order.createdAt) >= new Date(filters.startDate)
        : true;
      
      const matchesEndDate = filters.endDate
        ? new Date(order.createdAt) <= new Date(filters.endDate)
        : true;
      
      return (
        matchesSearch &&
        matchesClient &&
        matchesStatus &&
        matchesPaymentStatus &&
        matchesPaymentMethod &&
        matchesStartDate &&
        matchesEndDate
      );
    });
    
    // Sort orders
    filteredOrders.sort((a, b) => {
      let compareA: any = a[sort as keyof Order];
      let compareB: any = b[sort as keyof Order];
      
      // Handle date comparison
      if (sort === 'createdAt' || sort === 'updatedAt') {
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
    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    return {
      data: paginatedOrders,
      total: totalItems,
      page,
      limit,
      totalPages,
    };
  };

  // Calculate order total
  const calculateOrderTotal = (
    items: OrderItem[], 
    discount: number, 
    tax: number, 
    shipping: number
  ): number => {
    // Calculate sum of all items
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    
    // Calculate final total
    return subtotal - discount + tax + shipping;
  };

  // Generate a unique order number
  const generateOrderNumber = (): string => {
    const prefix = 'ORD';
    const latestOrder = [...orders].sort((a, b) => {
      return b.orderNumber.localeCompare(a.orderNumber);
    })[0];
    
    if (!latestOrder) {
      return `${prefix}-001`;
    }
    
    const latestNumber = parseInt(latestOrder.orderNumber.split('-')[1], 10);
    const nextNumber = (latestNumber + 1).toString().padStart(3, '0');
    
    return `${prefix}-${nextNumber}`;
  };

  const value = {
    orders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    searchOrders,
    calculateOrderTotal,
    generateOrderNumber,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};