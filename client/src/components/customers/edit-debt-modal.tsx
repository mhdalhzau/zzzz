import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { z } from "zod";

const editDebtSchema = z.object({
  amount: z.string().min(1, "Jumlah piutang wajib diisi"),
  paidAmount: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["pending", "paid"]),
  notes: z.string().optional(),
});

type EditDebtFormData = z.infer<typeof editDebtSchema>;

interface EditDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: any;
}

export default function EditDebtModal({ 
  isOpen, 
  onClose, 
  debt 
}: EditDebtModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<EditDebtFormData>({
    resolver: zodResolver(editDebtSchema),
    defaultValues: {
      amount: debt?.amount || "",
      paidAmount: debt?.paidAmount || "0",
      dueDate: debt?.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : "",
      status: debt?.status || "pending",
      notes: debt?.notes || "",
    },
  });

  const updateDebtMutation = useMutation({
    mutationFn: async (debtData: any) => {
      return await apiRequest("PUT", `/api/debts/${debt.id}`, debtData);
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Piutang berhasil diperbarui",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/debts"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/customers", debt.customerId, "debts"] 
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui piutang",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditDebtFormData) => {
    updateDebtMutation.mutate(data);
  };

  const remainingAmount = parseFloat(debt?.amount || '0') - parseFloat(form.watch('paidAmount') || '0');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Piutang</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Piutang</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Masukkan jumlah piutang"
                      {...field}
                      data-testid="input-debt-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paidAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah yang Sudah Dibayar</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      data-testid="input-paid-amount"
                    />
                  </FormControl>
                  <FormMessage />
                  {remainingAmount !== parseFloat(debt?.amount || '0') && (
                    <p className="text-sm text-muted-foreground">
                      Sisa: {formatCurrency(remainingAmount)}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Jatuh Tempo (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      data-testid="input-due-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-debt-status">
                        <SelectValue placeholder="Pilih status piutang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Belum Lunas</SelectItem>
                      <SelectItem value="paid">Lunas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan..."
                      {...field}
                      data-testid="textarea-debt-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={updateDebtMutation.isPending}
                data-testid="button-cancel-edit"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateDebtMutation.isPending}
                data-testid="button-save-debt"
              >
                {updateDebtMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}