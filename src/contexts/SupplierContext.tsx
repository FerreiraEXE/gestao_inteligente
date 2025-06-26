import React, { createContext, useContext } from 'react';
import { Supplier, SearchParams, PaginatedResponse } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { toast } from '@/hooks/use-toast';

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
    
    toast({
      title: 'Supplier deactivated',
      description: 'Supplier has been deactivated successfully',
    });
  };

  const searchSuppliers = (params: SearchParams): PaginatedResponse<Supplier> => {
    const { page = 1, limit = 10, search = '', sort = 'name', order = 'asc', filters = {} } = params;
    
    // Filter suppliers based on search term and filters
    let filteredSuppliers = suppliers.filter((supplier) => {
      // By default, only show active suppliers
      if (!supplier.isActive) return false;
      
      // Search by name, product, contact name, email, or document
      const matchesSearch = search
        ? supplier.name.toLowerCase().includes(search.toLowerCase()) ||
          supplier.product.toLowerCase().includes(search.toLowerCase()) ||
          supplier.contactName.toLowerCase().includes(search.toLowerCase()) ||
          supplier.email.toLowerCase().includes(search.toLowerCase()) ||
          supplier.document.includes(search)
        : true;
      
      // Apply additional filters
      const matchesCity = filters.city
        ? supplier.address.city.toLowerCase().includes(filters.city.toLowerCase())
        : true;
      
      const matchesState = filters.state
        ? supplier.address.state.toLowerCase() === filters.state.toLowerCase()
        : true;
      
      return (
        matchesSearch &&
        matchesCity &&
        matchesState
      );
    });
    
    // Sort suppliers
    filteredSuppliers.sort((a, b) => {
      // Handle nested properties
      if (sort.includes('.')) {
        const [parentProp, childProp] = sort.split('.');
        const compareA = (a[parentProp as keyof Supplier] as any)[childProp].toLowerCase();
        const compareB = (b[parentProp as keyof Supplier] as any)[childProp].toLowerCase();
        
        if (order === 'asc') {
          return compareA > compareB ? 1 : -1;
        } else {
          return compareA < compareB ? 1 : -1;
        }
      } else {
        let compareA: any = a[sort as keyof Supplier];
        let compareB: any = b[sort as keyof Supplier];
        
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
    const totalItems = filteredSuppliers.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);
    
    return {
      data: paginatedSuppliers,
      total: totalItems,
      page,
      limit,
      totalPages,
    };
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