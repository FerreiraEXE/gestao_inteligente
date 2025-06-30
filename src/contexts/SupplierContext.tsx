import React, { createContext, useContext } from 'react';
import { Supplier, SearchParams, PaginatedResponse } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useProducts } from './ProductContext';
import { toast } from '@/hooks/use-toast';
import searchArray from '@/lib/search';

// Initial suppliers
const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_1',
    name: 'Tech Distributors Inc.',
    contactName: 'Sarah Johnson',
    product: 'Eletrônicos',
    email: 'sjohnson@techdist.com',
    phone: '555-789-1234',
    document: '12.345.678/0001-90',
    address: {
      street: 'Tech Avenue',
      number: '1000',
      complement: 'Suite 200',
      neighborhood: 'Innovation District',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'USA',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sup_2',
    name: 'Office Solutions Ltd.',
    contactName: 'Michael Chen',
    product: 'Móveis para escritório',
    email: 'mchen@officesolutions.com',
    phone: '555-456-7890',
    document: '98.765.432/0001-10',
    address: {
      street: 'Commerce Street',
      number: '500',
      complement: 'Floor 5',
      neighborhood: 'Business Park',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sup_3',
    name: 'Fashion Wholesale Co.',
    contactName: 'Emma Rodriguez',
    product: 'Roupas',
    email: 'erodriguez@fashionwholesale.com',
    phone: '555-321-6547',
    document: '87.654.321/0001-01',
    address: {
      street: 'Fashion Avenue',
      number: '300',
      complement: 'Building B',
      neighborhood: 'Garment District',
      city: 'New York',
      state: 'NY',
      zipCode: '10018',
      country: 'USA',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface SupplierContextType {
  suppliers: Supplier[];
  createSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Supplier;
  getSupplierById: (id: string) => Supplier | undefined;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  searchSuppliers: (params: SearchParams) => PaginatedResponse<Supplier>;
  validateDocument: (document: string) => boolean;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export const SupplierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', INITIAL_SUPPLIERS);
  const { products, updateProduct } = useProducts();

  // Supplier CRUD functions
  const createSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier => {
    // Check if document already exists
    const documentExists = suppliers.some(
      (supplier) => 
        supplier.document === supplierData.document && 
        supplier.isActive
    );

    if (documentExists) {
      toast({
        variant: 'destructive',
        title: 'Error creating supplier',
        description: 'A supplier with this CNPJ already exists',
      });
      throw new Error('A supplier with this CNPJ already exists');
    }

    // Validate document
    if (!validateDocument(supplierData.document)) {
      toast({
        variant: 'destructive',
        title: 'Error creating supplier',
        description: 'Invalid CNPJ format',
      });
      throw new Error('Invalid CNPJ format');
    }

    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSuppliers([...suppliers, newSupplier]);
    
    toast({
      title: 'Supplier created',
      description: 'Supplier has been created successfully',
    });
    
    return newSupplier;
  };

  const getSupplierById = (id: string): Supplier | undefined => 
    suppliers.find((supplier) => supplier.id === id);

  const updateSupplier = (updatedSupplier: Supplier): void => {
    // Check if document is being changed and if it belongs to another supplier
    const documentExists = suppliers.some(
      (supplier) => 
        supplier.document === updatedSupplier.document && 
        supplier.id !== updatedSupplier.id &&
        supplier.isActive
    );

    if (documentExists) {
      toast({
        variant: 'destructive',
        title: 'Error updating supplier',
        description: 'A supplier with this CNPJ already exists',
      });
      throw new Error('A supplier with this CNPJ already exists');
    }

    // Validate document
    if (!validateDocument(updatedSupplier.document)) {
      toast({
        variant: 'destructive',
        title: 'Error updating supplier',
        description: 'Invalid CNPJ format',
      });
      throw new Error('Invalid CNPJ format');
    }

    const updatedSuppliers = suppliers.map((supplier) =>
      supplier.id === updatedSupplier.id
        ? { ...updatedSupplier, updatedAt: new Date().toISOString() }
        : supplier
    );
    
    setSuppliers(updatedSuppliers);
    
    toast({
      title: 'Supplier updated',
      description: 'Supplier has been updated successfully',
    });
  };

  const deleteSupplier = (id: string): void => {
    // In a real application, we'd check if the supplier has associated products
    // Here we'll just mark it as inactive
    const updatedSuppliers = suppliers.map((supplier) =>
      supplier.id === id
        ? { ...supplier, isActive: false, updatedAt: new Date().toISOString() }
        : supplier
    );

    setSuppliers(updatedSuppliers);

    // Remove supplier reference from products
    const affected = products.filter((p) => p.supplierId === id && p.isActive);
    if (affected.length > 0) {
      affected.forEach((p) => {
        updateProduct({ ...p, supplierId: '' });
      });
      toast({
        title: 'Produtos atualizados',
        description: `Fornecedor removido de ${affected.length} produtos`,
      });
    }

    toast({
      title: 'Supplier deactivated',
      description: 'Supplier has been deactivated successfully',
    });
  };

  const searchSuppliers = (params: SearchParams): PaginatedResponse<Supplier> => {
    const { search = '', filters = {} } = params;

    const sortableFields = [
      'name',
      'product',
      'contactName',
      'email',
      'document',
      'address.city',
      'address.state',
      'createdAt',
      'updatedAt',
    ];

    return searchArray(
      suppliers,
      params,
      (supplier) => {
        if (!supplier.isActive) return false;

        const matchesSearch = search
          ? supplier.name.toLowerCase().includes(search.toLowerCase()) ||
            supplier.product.toLowerCase().includes(search.toLowerCase()) ||
            supplier.contactName.toLowerCase().includes(search.toLowerCase()) ||
            supplier.email.toLowerCase().includes(search.toLowerCase()) ||
            supplier.document.includes(search)
          : true;

        const matchesCity = filters.city
          ? supplier.address.city.toLowerCase().includes(filters.city.toLowerCase())
          : true;

        const matchesState = filters.state
          ? supplier.address.state.toLowerCase() === filters.state.toLowerCase()
          : true;

        return matchesSearch && matchesCity && matchesState;
      },
      sortableFields
    );
  };

  // Document validation function - simplified for demo purposes
  const validateDocument = (document: string): boolean => {
    // Remove non-numeric characters
    const cleanDocument = document.replace(/[^\d]/g, '');
    
    // Basic validation for CNPJ (14 digits)
    return cleanDocument.length === 14;
  };

  const value = {
    suppliers,
    createSupplier,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    searchSuppliers,
    validateDocument,
  };

  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>;
};

export const useSuppliers = (): SupplierContextType => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};