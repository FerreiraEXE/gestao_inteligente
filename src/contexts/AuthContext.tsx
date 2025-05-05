import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginCredentials, AuthState } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { toast } from '@/hooks/use-toast';

// usuarios iniciais
const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    // pode ser aplicado em uma aplicação real
    password: 'admin123', 
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    // pode ser aplicado em uma aplicação real
    password: 'user123',
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => Promise<boolean>;
  updateUser: (user: User) => void;
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<User[]>('users', INITIAL_USERS);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // localstorage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser) as User;
        setAuthState({
          user,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Failed to parse stored user', error);
        setAuthState({ ...authState, isLoading: false });
      }
    } else {
      setAuthState({ ...authState, isLoading: false });
    }
  }, []);

  // simulando autenticação
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // simulando requests
      await new Promise(resolve => setTimeout(resolve, 500));

      // encontrando credenciais
      const user = users.find(
        (u) => u.email === credentials.email && u.password === credentials.password && u.isActive
      );

      if (user) {
        // fake token
        const token = `fake-token-${Date.now()}`;
        
        // updating
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // guardando em localstorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', token);

        toast({
          title: 'Login realizado com sucesso',
          description: `Bem vindo de volta, ${user.name}!`,
        });
        
        return true;
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Credenciais invalidas',
        });
        
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'Credenciais invalidas',
        });
        
        return false;
      }
    } catch (error) {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erro inesperado',
      });
      
      toast({
        variant: 'destructive',
        title: 'Login error',
        description: 'Erro inesperado',
      });
      
      return false;
    }
  };

  // função de logout
  const logout = () => {
    // limpando auth save
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    // removendo do localstorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');

    toast({
      title: 'Saindo',
      description: 'Você saiu com sucesso',
    });
  };

  // Register new user
  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      // valida se o email existe
      if (users.some((user) => user.email === userData.email)) {
        setAuthState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Este email já existe' 
        }));
        
        toast({
          variant: 'destructive',
          title: 'Falha no registro',
          description: 'O usuário com este email já existe',
        });
        
        return false;
      }

      // criando new user
      const newUser: User = {
        ...userData,
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // adicionando email no array
      setUsers([...users, newUser]);

      toast({
        title: 'Registrado com sucesso',
        description: 'Sua conta foi criada com sucesso',
      });

      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      setAuthState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Falha no registro' 
      }));
      
      toast({
        variant: 'destructive',
        title: 'Registration error',
        description: 'Falha ao criar usuário',
      });
      
      return false;
    }
  };

  // Update user
  const updateUser = (updatedUser: User) => {
    const updatedUsers = users.map((user) =>
      user.id === updatedUser.id ? { ...updatedUser, updatedAt: new Date().toISOString() } : user
    );
    
    setUsers(updatedUsers);

    // Update usuário atual se já estiver logado
    if (authState.user?.id === updatedUser.id) {
      const updated = { ...updatedUser, updatedAt: new Date().toISOString() };
      setAuthState((prev) => ({ ...prev, user: updated }));
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }

    toast({
      title: 'User updated',
      description: 'Informações do usuário foram atualizadas',
    });
  };

  // Pega todos os usuários
  const getUsers = () => users;

  // Get user by ID
  const getUserById = (id: string) => users.find((user) => user.id === id);

  // Delete user
  const deleteUser = (id: string) => {
    // Impedir a exclusão do usuário logado
    if (authState.user?.id === id) {
      toast({
        variant: 'destructive',
        title: 'Operation failed',
        description: 'Você não pode excluir sua própria conta enquanto estiver conectado',
      });
      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === id ? { ...user, isActive: false, updatedAt: new Date().toISOString() } : user
    );
    
    setUsers(updatedUsers);
    
    toast({
      title: 'User deleted',
      description: 'Usuário desativado com sucesso',
    });
  };

  const value = {
    ...authState,
    login,
    logout,
    register,
    updateUser,
    getUsers,
    getUserById,
    deleteUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};