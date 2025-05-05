import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Truck,
  BarChart3,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  requireAdmin?: boolean;
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Desconectado",
      description: "Você foi desconectado com sucesso",
    });
  };

  const navItems: NavItem[] = [
    {
      title: "Painel",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Produtos",
      href: "/produtos",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Clientes",
      href: "/clientes",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Fornecedores",
      href: "/fornecedores",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      title: "Pedidos",
      href: "/pedidos",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      title: "Transações",
      href: "/transacoes",
      icon: <Receipt className="h-5 w-5" />,
    },
    {
      title: "Relatórios",
      href: "/relatorios",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Usuários",
      href: "/usuarios",
      icon: <User className="h-5 w-5" />,
      requireAdmin: true,
    },
    {
      title: "Configurações",
      href: "/configuracoes",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.requireAdmin || user?.role === "admin"
  );

  const NavItem = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href;

    return (
      <Button
        variant="ghost"
        className={cn(
          "flex w-full items-center justify-start gap-3 px-3",
          isActive && "bg-primary/10 font-medium text-primary"
        )}
        onClick={() => {
          navigate(item.href);
          setIsMenuOpen(false);
        }}
      >
        {item.icon}
        <span>{item.title}</span>
      </Button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4 md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Sistema de Estoque</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Fechar menu</span>
                    </Button>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {filteredNavItems.map((item) => (
                      <NavItem key={item.href} item={item} />
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <Button
              variant="ghost"
              className="flex items-center gap-2 font-semibold"
              onClick={() => navigate("/")}
            >
              <Package className="h-5 w-5" />
              <span className="sr-only sm:not-sr-only">Sistema de Estoque</span>
            </Button>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              className="flex items-center gap-2 font-semibold"
              onClick={() => navigate("/")}
            >
              <Package className="h-5 w-5" />
              <span>Sistema de Estoque</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block">{user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/perfil")}>
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/configuracoes")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/login")}>Entrar</Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-background md:block">
          <nav className="flex flex-col gap-2 p-4">
            {filteredNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}