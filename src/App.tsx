import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { ClientProvider } from './contexts/ClientContext';
import { SupplierProvider } from './contexts/SupplierContext';
import { OrderProvider } from './contexts/OrderContext';
import { TransactionProvider } from './contexts/TransactionContext';
import { Toaster } from './components/ui/toaster';
import Layout from './components/layout/layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Products from './pages/Products';
import Clients from './pages/Clients';
import Suppliers from './pages/Suppliers';
import Orders from './pages/Orders';
import Transactions from './pages/Transactions';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <ClientProvider>
            <SupplierProvider>
              <OrderProvider>
                <TransactionProvider>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Dashboard />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/produtos"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Products />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clientes"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Clients />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/fornecedores"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Suppliers />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pedidos"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Orders />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/transacoes"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Transactions />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  <Toaster />
                </TransactionProvider>
              </OrderProvider>
            </SupplierProvider>
          </ClientProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;