import { useEffect } from 'react';
import { DashboardCards } from '@/components/dashboard/DashboardCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { format } from 'date-fns';

export function Dashboard() {
  const { user } = useAuth();
  const { searchOrders } = useOrders();
  
  // Get recent orders - just the last 5
  const recentOrders = searchOrders({
    page: 1,
    limit: 5,
    sort: 'createdAt',
    order: 'desc',
  }).data;

  useEffect(() => {
    // Set page title
    document.title = 'Gestão inteligente';
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Bem vindo de volta, {user?.name || 'User'}!
        </p>
      </div>
      
      <DashboardCards />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Compras recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center">
                    <div className="flex items-center justify-center rounded-full border p-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Compra #{order.orderNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), 'PPP')}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      ${order.total.toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  Sem compras recentes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* System Stats */}
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Status do sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    Status da base de dados
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Operacional</span>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    Espaço usado
                  </div>
                  <div className="pt-1 text-sm font-medium">
                    {(
                      (JSON.stringify(localStorage).length / 1024 / 1024) *
                      100
                    ).toFixed(2)}
                    % of 5MB
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border p-3">
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  Informação do sistema
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Versão</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Último update</span>
                    <span>{format(new Date(), 'PPP')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ambiente</span>
                    <span>Produção</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;