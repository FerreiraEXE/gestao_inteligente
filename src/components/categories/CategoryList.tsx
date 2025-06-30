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
import { Edit, Trash } from 'lucide-react';
import { Category } from '@/types';

interface CategoryListProps {
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryList({ onEdit, onDelete }: CategoryListProps) {
  const { categories } = useProducts();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((c) => (
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
  );
}

export default CategoryList;
