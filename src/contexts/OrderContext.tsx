import React, { createContext, useContext } from 'react';
import {
  Order,
  OrderItem,
  SearchParams,
  PaginatedResponse,
  SalesReport,
  ReportFilter,
} from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { toast } from '@/hooks/use-toast';
import { useProducts } from './ProductContext';
import { useClients } from './ClientContext';
import searchArray from '@/lib/search';
import {
  calculateOrderTotal as calculateOrderTotalLib,
  generateOrderNumber as generateOrderNumberLib,
} from '@/lib/order';

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
  generateSalesReport: (filter: ReportFilter) => SalesReport[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', INITIAL_ORDERS);
  const { products, updateProduct } = useProducts();
  const { clients } = useClients();

  // Order CRUD functions
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
    // Validate order
    if (orderData.items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar pedido',
        description: 'O pedido deve ter ao menos um item',
      });
      throw new Error('Order must have at least one item');
    }

    // Validate item quantities and update product stock
    for (const item of orderData.items) {
      const product = products.find(p => p.id === item.productId);
      
      if (!product) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar pedido',
          description: `Produto com ID ${item.productId} não encontrado`,
        });
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      
      if (product.stockQuantity < item.quantity) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar pedido',
          description: `Estoque insuficiente para o produto: ${product.name}`,
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
      title: 'Pedido criado',
      description: 'Pedido registrado com sucesso',
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
        title: 'Erro ao atualizar pedido',
        description: 'Pedido não encontrado',
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
      title: 'Pedido atualizado',
      description: 'Pedido atualizado com sucesso',
    });
  };

  const deleteOrder = (id: string): void => {
    const order = orders.find(o => o.id === id);
    
    if (!order) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir pedido',
        description: 'Pedido não encontrado',
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
      title: 'Pedido excluído',
      description: 'Pedido excluído com sucesso',
    });
  };

  const searchOrders = (params: SearchParams): PaginatedResponse<Order> => {
    const { search = '', filters = {} } = params;

    const sortableFields = [
      'orderNumber',
      'status',
      'paymentStatus',
      'paymentMethod',
      'createdAt',
      'updatedAt',
      'total',
    ];

    return searchArray(
      orders,
      params,
      (order) => {
        const matchesSearch = search
          ? order.orderNumber.toLowerCase().includes(search.toLowerCase())
          : true;

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
      },
      sortableFields
    );
  };

  // Generate sales report
  const generateSalesReport = (filter: ReportFilter): SalesReport[] => {
    const { startDate, endDate } = filter;

    return orders
      .filter((order) => {
        const orderDate = new Date(order.createdAt);
        const matchesStart = startDate ? orderDate >= new Date(startDate) : true;
        const matchesEnd = endDate ? orderDate <= new Date(endDate) : true;
        return matchesStart && matchesEnd;
      })
      .map((order) => {
        const client = clients.find((c) => c.id === order.clientId);
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          clientName: client ? client.name : 'N/A',
          date: order.createdAt,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
        } as SalesReport;
      });
  };

  // Calculate order total using shared utility
  const calculateOrderTotal = (
    items: OrderItem[],
    discount: number,
    tax: number,
    shipping: number
  ): number => calculateOrderTotalLib(items, discount, tax, shipping);

  // Generate a unique order number based on existing orders
  const generateOrderNumber = (): string => generateOrderNumberLib(orders);

  const value = {
    orders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    searchOrders,
    calculateOrderTotal,
    generateOrderNumber,
    generateSalesReport,
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