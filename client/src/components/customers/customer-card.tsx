import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface CustomerCardProps {
  customer: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  debtAmount: number;
  hasOverdueDebt: boolean;
  onSendReminder: (debtId: string) => void;
  isLoadingReminder: boolean;
  onEdit?: () => void;
  debts?: any[];
  onPayDebt?: (debt: any) => void;
  onViewDebtDetail?: () => void;
}

export default function CustomerCard({
  customer,
  debtAmount,
  hasOverdueDebt,
  onSendReminder,
  isLoadingReminder,
  onEdit,
  debts,
  onPayDebt,
  onViewDebtDetail,
}: CustomerCardProps) {
  const hasDebt = debtAmount > 0;

  return (
    <div className="bg-card border rounded-lg p-4" data-testid={`customer-${customer.id}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            hasDebt ? 'bg-primary/10' : 'bg-success/10'
          }`}>
            <i className={`fas fa-user ${hasDebt ? 'text-primary' : 'text-success'}`}></i>
          </div>
          <div>
            <h3 className="font-semibold" data-testid="text-customer-name">
              {customer.name}
            </h3>
            <p className="text-sm text-muted-foreground" data-testid="text-customer-phone">
              {customer.phone || customer.email || "Tidak ada kontak"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="p-2 hover:bg-muted rounded"
              data-testid="button-edit-customer"
            >
              <i className="fas fa-edit text-muted-foreground"></i>
            </button>
          )}
          <button 
            onClick={onViewDebtDetail}
            className="p-2 hover:bg-muted rounded"
            data-testid="button-customer-detail"
          >
            <Eye className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Piutang</p>
          {hasDebt ? (
            <p className={`font-semibold ${hasOverdueDebt ? 'text-destructive' : 'text-warning'}`} data-testid="text-debt-amount">
              {formatCurrency(debtAmount)}
            </p>
          ) : (
            <p className="font-semibold text-success" data-testid="text-debt-status">
              Lunas
            </p>
          )}
        </div>
        
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Status</p>
          {hasDebt ? (
            <p className={`text-sm font-medium ${hasOverdueDebt ? 'text-destructive' : 'text-warning'}`} data-testid="text-payment-status">
              {hasOverdueDebt ? 'Jatuh Tempo' : 'Belum Lunas'}
            </p>
          ) : (
            <p className="text-sm font-medium text-success" data-testid="text-payment-status">
              Lancar
            </p>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          {hasDebt ? (
            <>
              <Button
                size="sm"
                className={hasOverdueDebt ? 'warning' : 'bg-primary text-primary-foreground hover:bg-primary/90'}
                onClick={() => onSendReminder(customer.id)}
                disabled={isLoadingReminder}
                data-testid="button-send-reminder"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                {isLoadingReminder ? 'Mengirim...' : 'Ingatkan'}
              </Button>
              
              {onPayDebt && debts && debts.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="success"
                  onClick={() => onPayDebt(debts[0])}
                  data-testid="button-pay-debt"
                >
                  <i className="fas fa-money-bill mr-2"></i>
                  Bayar
                </Button>
              )}
            </>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              disabled
              data-testid="button-customer-status"
            >
              <i className="fas fa-check mr-2"></i>
              Lancar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
