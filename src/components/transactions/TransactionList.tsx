import { useState } from "react";
import { format } from "date-fns";
import { useTransactions } from "@/contexts/TransactionContext";
import { useOrders } from "@/contexts/OrderContext";
import { useSuppliers } from "@/contexts/SupplierContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function TransactionList() {
  const { transactions } = useTransactions();
  const { orders } = useOrders();
  const { suppliers } = useSuppliers();
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((t) => {
    const term = search.toLowerCase();
    const orderNumber = t.orderId
      ? orders.find((o) => o.id === t.orderId)?.orderNumber.toLowerCase() || ""
      : "";
    const supplierName = t.supplierId
      ? suppliers.find((s) => s.id === t.supplierId)?.name.toLowerCase() || ""
      : "";
    return (
      t.description.toLowerCase().includes(term) ||
      orderNumber.includes(term) ||
      supplierName.includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar transação..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Tipo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{format(new Date(t.date), "P")}</TableCell>
              <TableCell>{t.description}</TableCell>
              <TableCell>
                {t.amount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
              <TableCell>{t.type === "income" ? "Entrada" : "Saída"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
