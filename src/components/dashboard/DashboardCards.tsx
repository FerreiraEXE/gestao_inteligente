import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/contexts/ProductContext';
import { useClients } from '@/contexts/ClientContext';
import { useOrders } from '@/contexts/OrderContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export function DashboardCards() {
  const { products } = useProducts();
  const { clients } = useClients();
  const { orders } = useOrders();
  const { transactions } = useTransactions();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    totalClients: 0,
    activeClients: 0,
    totalOrders: 0,
    ordersThisMonth: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
  });
  
  const [salesData, setSalesData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    // Calculate statistics
    const activeProducts = products.filter((p) => p.isActive);
    const lowStockProducts = activeProducts.filter((p) => p.stockQuantity < 10);
    const activeClients = clients.filter((c) => c.isActive);
    
    // Current date info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Orders and revenue this month
    const ordersThisMonth = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth;
    });
    
    const revenueThisMonth = ordersThisMonth.reduce((total, order) => total + order.total, 0);
    const totalRevenue = orders.reduce((total, order) => total + order.total, 0);
    
    setStats({
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      lowStockProducts: lowStockProducts.length,
      totalClients: clients.length,
      activeClients: activeClients.length,
      totalOrders: orders.length,
      ordersThisMonth: ordersThisMonth.length,
      totalRevenue,
      revenueThisMonth,
    });
    
    // Prepare sales data for the last 6 months
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: format(date, 'MMM'),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
      };
    }).reverse();
    
    const salesByMonth = last6Months.map((monthData) => {
      const monthOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getFullYear() === monthData.year &&
          orderDate.getMonth() === monthData.monthIndex
        );
      });
      
      const revenue = monthOrders.reduce((total, order) => total + order.total, 0);
      
      return {
        name: monthData.month,
        revenue: revenue,
        orders: monthOrders.length,
      };
    });
    
    setSalesData(salesByMonth);
    
    // Prepare inventory data (top 5 products by value)
    const productInventoryValue = activeProducts
      .map((product) => ({
        name: product.name,
        value: product.price * product.stockQuantity,
        stock: product.stockQuantity,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    setInventoryData(productInventoryValue);
    
  }, [products, clients, orders, transactions]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Product Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Produtos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeProducts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.lowStockProducts > 0 ? (
              <span className="flex items-center text-destructive">
                <TrendingDown className="mr-1 h-3 w-3" />
                {stats.lowStockProducts} Estoque baixo
              </span>
            ) : (
              <span className="flex items-center text-primary">
                <TrendingUp className="mr-1 h-3 w-3" />
                Todos os produtos em estoque
              </span>
            )}
          </p>
        </CardContent>
      </Card>
      
      {/* Clients Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeClients}</div>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center">
              {stats.activeClients === stats.totalClients ? (
                <TrendingUp className="mr-1 h-3 w-3 text-primary" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-muted-foreground" />
              )}
              {((stats.activeClients / stats.totalClients) * 100).toFixed(0)}% ativo
            </span>
          </p>
        </CardContent>
      </Card>
      
      {/* Orders Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Vendas</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            {stats.ordersThisMonth > 0 ? (
              <span className="flex items-center text-primary">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                {stats.ordersThisMonth} Este mês
              </span>
            ) : (
              <span className="flex items-center">
                <ArrowDownRight className="mr-1 h-3 w-3" />
                Sem vendas este mês
              </span>
            )}
          </p>
        </CardContent>
      </Card>
      
      {/* Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Receita</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.revenueThisMonth > 0 ? (
              <span className="flex items-center text-primary">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                {stats.revenueThisMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} Este mês
              </span>
            ) : (
              <span className="flex items-center">
                <ArrowDownRight className="mr-1 h-3 w-3" />
                Sem receita este mês
              </span>
            )}
          </p>
        </CardContent>
      </Card>
      
      {/* Visão geral de vendas Chart */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Visão geral de vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--chart-1))" name="Receita" />
                <Bar yAxisId="right" dataKey="orders" fill="hsl(var(--chart-2))" name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Valor de inventário Chart */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Valor de inventário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    'Valor'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}