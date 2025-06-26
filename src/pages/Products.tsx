import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import ProductForm from '@/components/products/ProductForm';
import ProductList from '@/components/products/ProductList';
import { useProducts } from '@/contexts/ProductContext';
import { Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Products() {
  const { deleteProduct } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Cadastre e visualize seus produtos"
      />
      <ProductForm />
      <ProductList onEdit={openEdit} onDelete={handleDelete} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onCancel={closeDialog}
              onSuccess={closeDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
