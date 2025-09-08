import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z.string().min(1, "Jumlah bayar wajib diisi"),
  paymentMethod: z.string().min(1, "Metode pembayaran wajib dipilih"),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: any;
}

export default function DebtPaymentModal({ 
  isOpen, 
  onClose, 
  debt 
}: DebtPaymentModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: "",
      paymentMethod: "",
      notes: "",
    },
  });

  const payDebtMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const amountPaid = parseFloat(paymentData.amount);
      const currentPaidAmount = parseFloat(debt.paidAmount || '0');
      const newPaidAmount = currentPaidAmount + amountPaid;
      const totalAmount = parseFloat(debt.amount);
      
      return await apiRequest("PUT", `/api/debts/${debt.id}`, {
        paidAmount: newPaidAmount.toString(),
        status: newPaidAmount >= totalAmount ? "paid" : "pending",
      });
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Pembayaran piutang berhasil dicatat",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/debts"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/dashboard"] 
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal mencatat pembayaran",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    payDebtMutation.mutate(data);
  };

  const remainingDebt = debt ? parseFloat(debt.amount) - parseFloat(debt.paidAmount || '0') : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Bayar Piutang</DialogTitle>
        </DialogHeader>
        
        {debt && (
          <>
            <div className="space-y-3 mb-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">Total Piutang</p>
                <p className="text-lg font-bold text-primary" data-testid="text-total-debt">
                  {formatCurrency(parseFloat(debt.amount))}
                </p>
              </div>
              
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">Sisa Piutang</p>
                <p className="text-lg font-bold text-warning" data-testid="text-remaining-debt">
                  {formatCurrency(remainingDebt)}
                </p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Bayar</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="0" 
                          {...field} 
                          data-testid="input-payment-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metode Pembayaran</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-payment-method">
                            <SelectValue placeholder="Pilih metode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Tunai</SelectItem>
                          <SelectItem value="transfer">Transfer Bank</SelectItem>
                          <SelectItem value="qris">QRIS</SelectItem>
                          <SelectItem value="ewallet">E-Wallet</SelectItem>
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
                        <Input 
                          placeholder="Catatan pembayaran" 
                          {...field} 
                          data-testid="input-payment-notes"
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
                    disabled={payDebtMutation.isPending}
                    data-testid="button-save-payment"
                  >
                    {payDebtMutation.isPending ? "Menyimpan..." : "Bayar"}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}