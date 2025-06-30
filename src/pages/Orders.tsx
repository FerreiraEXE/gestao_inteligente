import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrders } from "@/contexts/OrderContext";
import { useClients } from "@/contexts/ClientContext";
import { useProducts } from "@/contexts/ProductContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Plus } from "lucide-react";
import OrderList from "@/components/orders/OrderList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const orderSchema = z.object({
  clientId: z.string().min(1, "Cliente obrigatório"),
  productId: z.string().min(1, "Produto obrigatório"),
  quantity: z.number().int().min(1, "Quantidade mínima 1"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function Orders() {
  const { clients } = useClients();
  const { products } = useProducts();
  const { createOrder, generateOrderNumber, calculateOrderTotal } = useOrders();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { clientId: "", productId: "", quantity: 1 },
  });

  const onSubmit = async (data: OrderFormValues) => {
    const product = products.find((p) => p.id === data.productId);
    if (!product) return;

    const item = {
      id: `item_${Date.now()}`,
      productId: product.id,
      quantity: data.quantity,
      unitPrice: product.price,
      discount: 0,
      total: product.price * data.quantity,
    };

    await createOrder({
      clientId: data.clientId,
      userId: "1",
      orderNumber: generateOrderNumber(),
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "cash",
      items: [item],
      discount: 0,
      tax: 0,
      shipping: 0,
      total: calculateOrderTotal([item], 0, 0, 0),
      notes: "",
    });

    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Registre novos pedidos"
        action={{
          label: "Novo Pedido",
          onClick: () => setIsDialogOpen(true),
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <OrderList />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Pedido</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
