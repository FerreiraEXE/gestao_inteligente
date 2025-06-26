import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import ProductForm from '@/components/products/ProductForm';
import ProductList from '@/components/products/ProductList';
import { Product } from '@/types';

export default function Products() {
  const [editing, setEditing] = useState<Product | undefined>();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Cadastre e visualize seus produtos"
      />
      <ProductForm
        product={editing}
        onSave={() => setEditing(undefined)}
        onCancel={() => setEditing(undefined)}
      />
      <ProductList onEdit={setEditing} />
    </div>
  );
}
