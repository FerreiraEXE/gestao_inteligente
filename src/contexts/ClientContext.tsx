import React, { createContext, useContext } from 'react';
import { Client, SearchParams, PaginatedResponse } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { toast } from '@/hooks/use-toast';

// Initial clients
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client_1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    document: '123.456.789-00',
    documentType: 'cpf',
    address: {
      street: 'Main Street',
      number: '123',
      complement: 'Apt 4B',
      neighborhood: 'Downtown',
      city: 'Metropolis',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'client_2',
    name: 'ABC Corp',
    email: 'contact@abccorp.com',
    phone: '555-987-6543',
    document: '12.345.678/0001-90',
    documentType: 'cnpj',
    address: {
      street: 'Business Avenue',
      number: '500',
      complement: '10th Floor',
      neighborhood: 'Financial District',
      city: 'Metropolis',
      state: 'CA',
      zipCode: '90220',
      country: 'USA',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface ClientContextType {
  clients: Client[];
  createClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Client;
  getClientById: (id: string) => Client | undefined;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  searchClients: (params: SearchParams) => PaginatedResponse<Client>;
  validateDocument: (document: string, type: 'cpf' | 'cnpj') => boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useLocalStorage<Client[]>('clients', INITIAL_CLIENTS);

  // tentativa de crud
  const createClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client => {
    // valida se documento existe
    const documentExists = clients.some(
      (client) => 
        client.document === clientData.document && 
        client.isActive
    );

    if (documentExists) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar cliente',
        description: `Já existe cliente com este ${clientData.documentType === 'cpf' ? 'CPF' : 'CNPJ'}`,
      });
      throw new Error(`A client with this ${clientData.documentType === 'cpf' ? 'CPF' : 'CNPJ'} already exists`);
    }

    // Validate document
    if (!validateDocument(clientData.document, clientData.documentType)) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar cliente',
        description: `Formato de ${clientData.documentType === 'cpf' ? 'CPF' : 'CNPJ'} inválido`,
      });
      throw new Error(`Invalid ${clientData.documentType === 'cpf' ? 'CPF' : 'CNPJ'} format`);
    }

    const newClient: Client = {
      ...clientData,
      id: `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClients([...clients, newClient]);
    
    toast({
      title: 'Cliente criado',
      description: 'Cliente cadastrado com sucesso',
    });
    
    return newClient;
  };

  const getClientById = (id: string): Client | undefined => 
    clients.find((client) => client.id === id);

  const updateClient = (updatedClient: Client): void => {
    // Check if document is being changed and if it belongs to another client
    const documentExists = clients.some(
      (client) => 
        client.document === updatedClient.document && 
        client.id !== updatedClient.id &&
        client.isActive
    );

    if (documentExists) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: `Já existe cliente com este ${updatedClient.documentType === 'cpf' ? 'CPF' : 'CNPJ'}`,
      });
      throw new Error(`A client with this ${updatedClient.documentType === 'cpf' ? 'CPF' : 'CNPJ'} already exists`);
    }

    // Validate document
    if (!validateDocument(updatedClient.document, updatedClient.documentType)) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: `Formato de ${updatedClient.documentType === 'cpf' ? 'CPF' : 'CNPJ'} inválido`,
      });
      throw new Error(`Invalid ${updatedClient.documentType === 'cpf' ? 'CPF' : 'CNPJ'} format`);
    }

    const updatedClients = clients.map((client) =>
      client.id === updatedClient.id
        ? { ...updatedClient, updatedAt: new Date().toISOString() }
        : client
    );
    
    setClients(updatedClients);
    
    toast({
      title: 'Cliente atualizado',
      description: 'Cliente atualizado com sucesso',
    });
  };

  const deleteClient = (id: string): void => {
// Em uma aplicação real, verificaríamos se o cliente tem pedidos
// Aqui, apenas marcaremos como inativo
    const updatedClients = clients.map((client) =>
      client.id === id
        ? { ...client, isActive: false, updatedAt: new Date().toISOString() }
        : client
    );
    
    setClients(updatedClients);
    
    toast({
      title: 'Cliente desativado',
      description: 'Cliente desativado com sucesso',
    });
  };

  const searchClients = (params: SearchParams): PaginatedResponse<Client> => {
    const { page = 1, limit = 10, search = '', sort = 'name', order = 'asc', filters = {} } = params;
    
    // Filter clients based on search term and filters
    let filteredClients = clients.filter((client) => {
      // By default, only show active clients
      if (!client.isActive) return false;
      
      // Search by name, email, or document
      const matchesSearch = search
        ? client.name.toLowerCase().includes(search.toLowerCase()) ||
          client.email.toLowerCase().includes(search.toLowerCase()) ||
          client.document.includes(search)
        : true;
      
      // Apply additional filters
      const matchesDocumentType = filters.documentType
        ? client.documentType === filters.documentType
        : true;
      
      const matchesCity = filters.city
        ? client.address.city.toLowerCase().includes(filters.city.toLowerCase())
        : true;
      
      const matchesState = filters.state
        ? client.address.state.toLowerCase() === filters.state.toLowerCase()
        : true;
      
      return (
        matchesSearch &&
        matchesDocumentType &&
        matchesCity &&
        matchesState
      );
    });
    
    // Sort clients
    filteredClients.sort((a, b) => {
      // Handle nested properties
      if (sort.includes('.')) {
        const [parentProp, childProp] = sort.split('.');
        const compareA = (a[parentProp as keyof Client] as any)[childProp].toLowerCase();
        const compareB = (b[parentProp as keyof Client] as any)[childProp].toLowerCase();
        
        if (order === 'asc') {
          return compareA > compareB ? 1 : -1;
        } else {
          return compareA < compareB ? 1 : -1;
        }
      } else {
        let compareA: any = a[sort as keyof Client];
        let compareB: any = b[sort as keyof Client];
        
        // Handle string comparison
        if (typeof compareA === 'string' && typeof compareB === 'string') {
          compareA = compareA.toLowerCase();
          compareB = compareB.toLowerCase();
        }
        
        if (order === 'asc') {
          return compareA > compareB ? 1 : -1;
        } else {
          return compareA < compareB ? 1 : -1;
        }
      }
    });
    
    // Calculate pagination
    const totalItems = filteredClients.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);
    
    return {
      data: paginatedClients,
      total: totalItems,
      page,
      limit,
      totalPages,
    };
  };

  // Document validation function - simplified for demo purposes
  const validateDocument = (document: string, type: 'cpf' | 'cnpj'): boolean => {
    // Remove non-numeric characters
    const cleanDocument = document.replace(/[^\d]/g, '');
    
    // Basic validation
    if (type === 'cpf') {
      return cleanDocument.length === 11;
    } else if (type === 'cnpj') {
      return cleanDocument.length === 14;
    }
    
    return false;
  };

  const value = {
    clients,
    createClient,
    getClientById,
    updateClient,
    deleteClient,
    searchClients,
    validateDocument,
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};

export const useClients = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};