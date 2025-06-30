import { useState } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { useSuppliers } from '@/contexts/SupplierContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Trash, Plus } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Product } from '@/types';

interface ProductListProps {
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}
export function ProductList({ onEdit, onDelete }: ProductListProps) {
  const { products, categories = [] } = useProducts();
  const { suppliers } = useSuppliers();

  const [search, setSearch] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const active = products.filter((p) => p.isActive);

  const filtered = active.filter((p) => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase());
    const matchSupplier = supplierId ? p.supplierId === supplierId : true;
    return matchName && matchSupplier;
  });

  const sorted = [...filtered].sort((a, b) =>
    order === 'asc' ? a.price - b.price : b.price - a.price
  );

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="Nenhum produto ativo encontrado"
        description="Cadastre um novo produto para começar"
        action={{
          label: 'Criar Produto',
          onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        }}
        className="mt-4"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={supplierId} onValueChange={setSupplierId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Fornecedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={order} onValueChange={(v) => setOrder(v as 'asc' | 'desc')}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Ordenar por preço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Preço crescente</SelectItem>
            <SelectItem value="desc">Preço decrescente</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
        {sorted.map((p) => {
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
                <Button size="sm" variant="outline" onClick={() => onEdit(p)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(p.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
        </TableBody>
      </Table>
    </div>
  );
}

export default ProductList;
