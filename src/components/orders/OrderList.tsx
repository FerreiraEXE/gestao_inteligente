import { useState } from "react";
import { format } from "date-fns";
import { useOrders } from "@/contexts/OrderContext";
import { useClients } from "@/contexts/ClientContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function OrderList() {
  const { orders } = useOrders();
  const { clients } = useClients();
  const [search, setSearch] = useState("");

  const filtered = orders.filter((order) => {
    const term = search.toLowerCase();
    const client = clients.find((c) => c.id === order.clientId);
    const clientName = client ? client.name.toLowerCase() : "";
    return (
      order.orderNumber.toLowerCase().includes(term) ||
      clientName.includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar pedido..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((order) => {
            const client = clients.find((c) => c.id === order.clientId);
            return (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{client?.name ?? "-"}</TableCell>
                <TableCell>{format(new Date(order.createdAt), "P")}</TableCell>
                <TableCell>
                  {order.total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell>{order.status}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
