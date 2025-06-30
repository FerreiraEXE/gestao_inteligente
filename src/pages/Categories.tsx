import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import CategoryForm from '@/components/categories/CategoryForm';
import CategoryList from '@/components/categories/CategoryList';
import { useProducts } from '@/contexts/ProductContext';
import { Category } from '@/types';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Categories() {
  const { deleteCategory } = useProducts();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openNew = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Gerencie suas categorias de produtos"
        action={{
          label: 'Nova Categoria',
          onClick: openNew,
          icon: <Plus className="h-4 w-4" />,
        }}
      />
      <CategoryList onEdit={openEdit} onDelete={handleDelete} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory ?? undefined}
            onCancel={closeDialog}
            onSuccess={closeDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
