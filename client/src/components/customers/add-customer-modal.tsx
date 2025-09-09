import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/hooks/useStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(1, "Nama pelanggan wajib diisi"),
  phone: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
  isEdit?: boolean;
}

export default function AddCustomerModal({ 
  isOpen, 
  onClose, 
  customer, 
  isEdit = false 
}: AddCustomerModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeStoreId } = useStore();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      address: customer?.address || "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const url = isEdit 
        ? `/api/customers/${customer.id}`
        : `/api/stores/${activeStoreId}/customers`;
      const method = isEdit ? "PUT" : "POST";
      return await apiRequest(method, url, customerData);
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: isEdit 
          ? "Pelanggan berhasil diperbarui" 
          : "Pelanggan berhasil ditambahkan",
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/stores/${activeStoreId}/customers`] 
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: isEdit 
          ? "Gagal memperbarui pelanggan" 
          : "Gagal menambahkan pelanggan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    createCustomerMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Pelanggan</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Masukkan nama pelanggan" 
                      {...field} 
                      data-testid="input-customer-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+62812-3456-7890" 
                      {...field} 
                      data-testid="input-customer-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Opsional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="nama@email.com" 
                      {...field} 
                      data-testid="input-customer-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Masukkan alamat pelanggan" 
                      {...field} 
                      data-testid="input-customer-address"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={onClose}
                data-testid="button-cancel"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={createCustomerMutation.isPending}
                data-testid="button-save-customer"
              >
                {createCustomerMutation.isPending 
                  ? "Menyimpan..." 
                  : isEdit ? "Perbarui" : "Simpan"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}