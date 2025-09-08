import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, DollarSign, Edit, MessageCircle, Trash2 } from "lucide-react";
import EditDebtModal from "./edit-debt-modal";

interface DebtListModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
}

export default function DebtListModal({
  isOpen,
  onClose,
  customer,
}: DebtListModalProps) {
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: debts = [], isLoading } = useQuery({
    queryKey: ["/api/customers", customer?.id, "debts"],
    enabled: isOpen && !!customer?.id,
  });

  const deleteDebtMutation = useMutation({
    mutationFn: async (debtId: string) => {
      return await apiRequest("DELETE", `/api/debts/${debtId}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Piutang berhasil dihapus",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/debts"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/customers", customer.id, "debts"] 
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus piutang",
        variant: "destructive",
      });
    },
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

  const getStatusBadge = (debt: any) => {
    const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date();
    
    if (debt.status === 'paid') {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Lunas</Badge>;
    }
    
    if (isOverdue) {
      return <Badge variant="destructive">Jatuh Tempo</Badge>;
    }
    
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Belum Lunas</Badge>;
  };

  const getRemainingAmount = (debt: any) => {
    return parseFloat(debt.amount) - parseFloat(debt.paidAmount || '0');
  };

  if (!customer) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-left">
              Piutang {customer.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : debts.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Tidak ada piutang</p>
              </div>
            ) : (
              (debts as any[]).map((debt: any) => (
                <div 
                  key={debt.id} 
                  className="bg-card border rounded-lg p-4 space-y-3"
                  data-testid={`debt-${debt.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium" data-testid="text-debt-reference">
                          #{debt.transactionId || debt.id.slice(-8)}
                        </h4>
                        {getStatusBadge(debt)}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span>Total: {formatCurrency(parseFloat(debt.amount))}</span>
                        </div>
                        
                        {parseFloat(debt.paidAmount || '0') > 0 && (
                          <div className="flex items-center gap-2 text-success">
                            <DollarSign className="w-4 h-4" />
                            <span>Dibayar: {formatCurrency(parseFloat(debt.paidAmount))}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 font-medium">
                          <DollarSign className="w-4 h-4" />
                          <span data-testid="text-remaining-amount">
                            Sisa: {formatCurrency(getRemainingAmount(debt))}
                          </span>
                        </div>
                        
                        {debt.dueDate && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Jatuh tempo: {new Date(debt.dueDate).toLocaleDateString('id-ID')}</span>
                          </div>
                        )}
                        
                        {debt.notes && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <MessageCircle className="w-4 h-4 mt-0.5" />
                            <span className="text-xs">{debt.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingDebt(debt)}
                      data-testid="button-edit-debt"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    
                    {debt.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendReminderMutation.mutate(debt.id)}
                        disabled={sendReminderMutation.isPending}
                        data-testid="button-send-debt-reminder"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {sendReminderMutation.isPending ? 'Mengirim...' : 'Ingatkan'}
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteDebtMutation.mutate(debt.id)}
                      disabled={deleteDebtMutation.isPending}
                      data-testid="button-delete-debt"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {deleteDebtMutation.isPending ? 'Hapus...' : 'Hapus'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {editingDebt && (
        <EditDebtModal
          isOpen={!!editingDebt}
          onClose={() => setEditingDebt(null)}
          debt={editingDebt}
        />
      )}
    </>
  );
}