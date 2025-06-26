import { Edit, Trash } from 'lucide-react';
import { useProducts } from '@/contexts/ProductContext';
import { useSuppliers } from '@/contexts/SupplierContext';
import { Product } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export interface ProductListProps {
  onEdit?: (product: Product) => void;
}

export function ProductList({ onEdit }: ProductListProps) {
  const { products, categories = [], deleteProduct } = useProducts();
  const { suppliers } = useSuppliers();

  const active = products.filter((p) => p.isActive);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Fornecedor</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Estoque</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {active.map((p) => {
          const category = categories.find((c) => c.id === p.categoryId);
          const supplier = suppliers.find((s) => s.id === p.supplierId);
          return (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.sku}</TableCell>
              <TableCell>{category?.name || 'N/A'}</TableCell>
              <TableCell>{supplier?.name || 'N/A'}</TableCell>
              <TableCell>
                {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </TableCell>
              <TableCell>{p.stockQuantity}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit?.(p)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteProduct(p.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default ProductList;
