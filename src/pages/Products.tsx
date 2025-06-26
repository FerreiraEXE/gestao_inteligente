import { PageHeader } from '@/components/common/PageHeader';
import ProductForm from '@/components/products/ProductForm';
import ProductList from '@/components/products/ProductList';

export default function Products() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Cadastre e visualize seus produtos"
      />
      <ProductForm />
      <ProductList />
    </div>
  );
}
