import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MobileLayout from "@/components/layout/mobile-layout";
import CustomerCard from "@/components/customers/customer-card";
import AddCustomerModal from "@/components/customers/add-customer-modal";
import DebtPaymentModal from "@/components/customers/debt-payment-modal";
import DebtListModal from "@/components/customers/debt-list-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [payingDebt, setPayingDebt] = useState<any>(null);
  const [viewingDebtDetail, setViewingDebtDetail] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/customers"],
  });

  const { data: debts } = useQuery({
    queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/debts"],
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (debtId: string) => {
      return await apiRequest("POST", `/api/debts/${debtId}/reminder`, undefined);
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Reminder berhasil dikirim",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal mengirim reminder",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers?.filter((customer: any) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDebt = debts?.reduce((sum: number, debt: any) => 
    debt.status === 'pending' ? sum + (parseFloat(debt.amount) - parseFloat(debt.paidAmount || '0')) : sum, 0) || 0;
  
  const overdueDebts = debts?.filter((debt: any) => 
    debt.status === 'pending' && debt.dueDate && new Date(debt.dueDate) < new Date()) || [];
  
  const overdueAmount = overdueDebts.reduce((sum: number, debt: any) => 
    sum + (parseFloat(debt.amount) - parseFloat(debt.paidAmount || '0')), 0);

  const customersWithDebt = debts?.filter((debt: any) => 
    debt.status === 'pending' && parseFloat(debt.amount) > parseFloat(debt.paidAmount || '0')
  ).length || 0;

  if (isLoading) {
    return (
      <MobileLayout currentPage="customers">
        <div className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card border rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div>
                      <div className="h-4 bg-muted rounded mb-1 w-24"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout currentPage="customers">
      {/* Search */}
      <div className="p-4 bg-card border-b">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
          <Input
            type="text"
            placeholder="Cari pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-customers"
          />
        </div>
      </div>

      {/* Debt Summary */}
      <div className="p-4 bg-card border-b">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-warning" data-testid="text-total-debt">
              {formatCurrency(totalDebt).replace('.00', '')}
            </p>
            <p className="text-xs text-muted-foreground">Total Piutang</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive" data-testid="text-overdue-debt">
              {formatCurrency(overdueAmount).replace('.00', '')}
            </p>
            <p className="text-xs text-muted-foreground">Jatuh Tempo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" data-testid="text-customers-with-debt">
              {customersWithDebt}
            </p>
            <p className="text-xs text-muted-foreground">Pelanggan</p>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Pelanggan ({filteredCustomers?.length || 0})
          </h3>
          <Button 
            onClick={() => setShowAddModal(true)}
            data-testid="button-add-customer"
          >
            <i className="fas fa-plus mr-2"></i>
            Tambah
          </Button>
        </div>

        <div className="space-y-3">
          {filteredCustomers?.map((customer: any) => {
            const customerDebts = debts?.filter((debt: any) => 
              debt.customerId === customer.id && debt.status === 'pending'
            ) || [];
            
            const customerDebtAmount = customerDebts.reduce((sum: number, debt: any) => 
              sum + (parseFloat(debt.amount) - parseFloat(debt.paidAmount || '0')), 0);

            const hasOverdueDebt = customerDebts.some((debt: any) => 
              debt.dueDate && new Date(debt.dueDate) < new Date()
            );

            return (
              <CustomerCard
                key={customer.id}
                customer={customer}
                debtAmount={customerDebtAmount}
                hasOverdueDebt={hasOverdueDebt}
                onSendReminder={(debtId) => sendReminderMutation.mutate(debtId)}
                isLoadingReminder={sendReminderMutation.isPending}
                onEdit={() => setEditingCustomer(customer)}
                debts={customerDebts}
                onPayDebt={(debt) => setPayingDebt(debt)}
                onViewDebtDetail={() => setViewingDebtDetail(customer)}
              />
            );
          })}
          
          {filteredCustomers?.length === 0 && (
            <div className="text-center py-8">
              <i className="fas fa-users text-4xl text-muted-foreground mb-4"></i>
              <p className="text-muted-foreground mb-2">
                {searchQuery 
                  ? "Tidak ada pelanggan yang sesuai"
                  : "Belum ada pelanggan"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <AddCustomerModal
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        customer={editingCustomer}
        isEdit={true}
      />

      <DebtPaymentModal
        isOpen={!!payingDebt}
        onClose={() => setPayingDebt(null)}
        debt={payingDebt}
      />

      <DebtListModal
        isOpen={!!viewingDebtDetail}
        onClose={() => setViewingDebtDetail(null)}
        customer={viewingDebtDetail}
      />
    </MobileLayout>
  );
}
