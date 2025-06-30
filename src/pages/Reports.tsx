import { useState } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/common/PageHeader';
import { useProducts } from '@/contexts/ProductContext';
import { useOrders } from '@/contexts/OrderContext';
import { useTransactions } from '@/contexts/TransactionContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Reports() {
  const { generateStockReport } = useProducts();
  const { generateSalesReport } = useOrders();
  const { generateFinancialReport } = useTransactions();

  const [salesStart, setSalesStart] = useState('');
  const [salesEnd, setSalesEnd] = useState('');

  const [finStart, setFinStart] = useState('');
  const [finEnd, setFinEnd] = useState('');
  const [finType, setFinType] = useState<'income' | 'expense' | ''>('');

  const stockData = generateStockReport();
  const salesData = generateSalesReport({ startDate: salesStart, endDate: salesEnd });
  const financialData = generateFinancialReport({
    startDate: finStart,
    endDate: finEnd,
    type: finType || undefined,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios" description="Visão geral do sistema" />
      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Estoque</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>
        <TabsContent value="stock">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Custo Médio</TableHead>
                <TableHead>Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockData.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.currentStock}</TableCell>
                  <TableCell>
                    {item.averageCost.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                  <TableCell>
                    {item.totalValue.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="sales">
          <div className="flex flex-wrap gap-4 pb-4">
            <Input type="date" value={salesStart} onChange={(e) => setSalesStart(e.target.value)} />
            <Input type="date" value={salesEnd} onChange={(e) => setSalesEnd(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((s) => (
                <TableRow key={s.orderId}>
                  <TableCell>{s.orderNumber}</TableCell>
                  <TableCell>{s.clientName}</TableCell>
                  <TableCell>{format(new Date(s.date), 'P')}</TableCell>
                  <TableCell>
                    {s.total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>{s.paymentStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="financial">
          <div className="flex flex-wrap gap-4 pb-4">
            <Input type="date" value={finStart} onChange={(e) => setFinStart(e.target.value)} />
            <Input type="date" value={finEnd} onChange={(e) => setFinEnd(e.target.value)} />
            <Select value={finType} onValueChange={setFinType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="income">Entrada</SelectItem>
                <SelectItem value="expense">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialData.map((f) => (
                <TableRow key={f.transactionId}>
                  <TableCell>{format(new Date(f.date), 'P')}</TableCell>
                  <TableCell>{f.description}</TableCell>
                  <TableCell>
                    {f.amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                  <TableCell>{f.type === 'income' ? 'Entrada' : 'Saída'}</TableCell>
                  <TableCell>
                    {f.balance.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
