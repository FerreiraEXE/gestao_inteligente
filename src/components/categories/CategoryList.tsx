import { useState } from 'react';
import { useProducts } from '@/contexts/ProductContext';
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
import { Edit, Trash } from 'lucide-react';
import { Category } from '@/types';

interface CategoryListProps {
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryList({ onEdit, onDelete }: CategoryListProps) {
  const { categories } = useProducts();
  const [search, setSearch] = useState('');

  const filtered = categories.filter((c) =>
    `${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar categoria..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {filtered.map((c) => (
          <TableRow key={c.id}>
            <TableCell>{c.name}</TableCell>
            <TableCell>{c.description}</TableCell>
            <TableCell className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(c)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDelete(c.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default CategoryList;
