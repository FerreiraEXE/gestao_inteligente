import React, { createContext, useContext } from 'react';
import { Product, Category, SearchParams, PaginatedResponse } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { toast } from '@/hooks/use-toast';

// Initial categories
const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_1',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_2',
    name: 'Furniture',
    description: 'Home and office furniture',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_3',
    name: 'Clothing',
    description: 'Apparel and fashion items',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial products
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Monitor',
    description: 'Monitor para computador',
    sku: 'LPT-001',
    price: 1299.99,
    cost: 800,
    stockQuantity: 25,
    categoryId: 'cat_1',
    supplierId: 'sup_1',
    imageUrl: 'https://images.pexels.com/photos/18104/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_2',
    name: 'Cadeira',
    description: 'Cadeira de escritório',
    sku: 'OFC-001',
    price: 249.99,
    cost: 150,
    stockQuantity: 15,
    categoryId: 'cat_2',
    supplierId: 'sup_2',
    imageUrl: 'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_3',
    name: 'Camiseta',
    description: 'Camiseta polo',
    sku: 'TSH-001',
    price: 19.99,
    cost: 5,
    stockQuantity: 100,
    categoryId: 'cat_3',
    supplierId: 'sup_3',
    imageUrl: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface ProductContextType {
  // Product CRUD
  products: Product[];
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  getProductById: (id: string) => Product | undefined;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  searchProducts: (params: SearchParams) => PaginatedResponse<Product>;
  
  // Category CRUD
  categories: Category[];
  createCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Category;
  getCategoryById: (id: string) => Category | undefined;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  
  // Image handling
  uploadProductImage: (file: File) => Promise<string>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', INITIAL_PRODUCTS);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', INITIAL_CATEGORIES);

  // Product CRUD functions
  const createProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts([...products, newProduct]);
    
    toast({
      title: 'Product created',
      description: 'Product has been created successfully',
    });
    
    return newProduct;
  };

  const getProductById = (id: string): Product | undefined => 
    products.find((product) => product.id === id);

  const updateProduct = (updatedProduct: Product): void => {
    const updatedProducts = products.map((product) =>
      product.id === updatedProduct.id
        ? { ...updatedProduct, updatedAt: new Date().toISOString() }
        : product
    );
    
    setProducts(updatedProducts);
    
    toast({
      title: 'Product updated',
      description: 'Product has been updated successfully',
    });
  };

  const deleteProduct = (id: string): void => {
    const updatedProducts = products.map((product) =>
      product.id === id
        ? { ...product, isActive: false, updatedAt: new Date().toISOString() }
        : product
    );
    
    setProducts(updatedProducts);
    
    toast({
      title: 'Product deleted',
      description: 'Product has been deleted successfully',
    });
  };

  const searchProducts = (params: SearchParams): PaginatedResponse<Product> => {
    const { page = 1, limit = 10, search = '', sort = 'name', order = 'asc', filters = {} } = params;
    
    // Filter products based on search term and filters
    let filteredProducts = products.filter((product) => {
      // By default, only show active products
      if (!product.isActive) return false;
      
      // Search by name, description, or SKU
      const matchesSearch = search
        ? product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase()) ||
          product.sku.toLowerCase().includes(search.toLowerCase())
        : true;
      
      // Apply additional filters
      const matchesCategory = filters.categoryId
        ? product.categoryId === filters.categoryId
        : true;
      
      const matchesSupplier = filters.supplierId
        ? product.supplierId === filters.supplierId
        : true;
      
      const matchesPriceMin = filters.priceMin
        ? product.price >= filters.priceMin
        : true;
      
      const matchesPriceMax = filters.priceMax
        ? product.price <= filters.priceMax
        : true;
      
      const matchesStock = filters.inStock
        ? product.stockQuantity > 0
        : true;
      
      return (
        matchesSearch &&
        matchesCategory &&
        matchesSupplier &&
        matchesPriceMin &&
        matchesPriceMax &&
        matchesStock
      );
    });
    
    // Sort products
    filteredProducts.sort((a, b) => {
      let compareA: any = a[sort as keyof Product];
      let compareB: any = b[sort as keyof Product];
      
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
    });
    
    // Calculate pagination
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      data: paginatedProducts,
      total: totalItems,
      page,
      limit,
      totalPages,
    };
  };

  // Category CRUD functions
  const createCategory = (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCategories([...categories, newCategory]);
    
    toast({
      title: 'Category created',
      description: 'Category has been created successfully',
    });
    
    return newCategory;
  };

  const getCategoryById = (id: string): Category | undefined => 
    categories.find((category) => category.id === id);

  const updateCategory = (updatedCategory: Category): void => {
    const updatedCategories = categories.map((category) =>
      category.id === updatedCategory.id
        ? { ...updatedCategory, updatedAt: new Date().toISOString() }
        : category
    );
    
    setCategories(updatedCategories);
    
    toast({
      title: 'Category updated',
      description: 'Category has been updated successfully',
    });
  };

  const deleteCategory = (id: string): void => {
    // Check if any products use this category
    const productsWithCategory = products.filter(
      (product) => product.categoryId === id && product.isActive
    );
    
    if (productsWithCategory.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot delete category',
        description: `This category is used by ${productsWithCategory.length} active products`,
      });
      return;
    }
    
    const updatedCategories = categories.filter((category) => category.id !== id);
    setCategories(updatedCategories);
    
    toast({
      title: 'Category deleted',
      description: 'Category has been deleted successfully',
    });
  };

  // Image upload function (simulated)
  const uploadProductImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // In a real application, we'd upload the file to a server
        // Here we'll use a FileReader to convert it to a data URL
        const reader = new FileReader();
        
        reader.onload = () => {
          // In a real app, resolve would be a URL from a storage service
          // Here we'll just resolve with the data URL
          resolve(reader.result as string);
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const value = {
    products,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
    
    categories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory,
    
    uploadProductImage,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};