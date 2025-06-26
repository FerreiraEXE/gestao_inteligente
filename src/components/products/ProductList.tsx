import { useProducts } from '@/contexts/ProductContext';
import { useSuppliers } from '@/contexts/SupplierContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ProductList() {
  const { products, categories = [] } = useProducts();
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
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default ProductList;
