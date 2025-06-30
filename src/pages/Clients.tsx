import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useClients } from '@/contexts/ClientContext';
import ClientForm from '@/components/clients/ClientForm';
import ClientList from '@/components/clients/ClientList';
import { Client } from '@/types';

export default function Clients() {
  const { deleteClient } = useClients();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openNew = () => {
    setEditingClient(null);
    setIsDialogOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie sua base de clientes"
        action={{ label: 'Novo Cliente', onClick: openNew, icon: <Plus className="h-4 w-4" /> }}
      />
      <ClientList onEdit={openEdit} onDelete={handleDelete} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <ClientForm
            client={editingClient ?? undefined}
            onCancel={closeDialog}
            onSuccess={closeDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
