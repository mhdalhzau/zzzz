import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (paymentMethod: string) => void;
  total: number;
  isProcessing: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onPayment,
  total,
  isProcessing,
}: PaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
            <p className="text-2xl font-bold text-primary" data-testid="text-payment-total">
              {formatCurrency(total)}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full success"
              size="lg"
              onClick={() => onPayment("cash")}
              disabled={isProcessing}
              data-testid="button-pay-cash"
            >
              <i className="fas fa-money-bill-wave mr-2"></i>
              Bayar Tunai
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => onPayment("transfer")}
                disabled={isProcessing}
                data-testid="button-pay-transfer"
              >
                <i className="fas fa-university mr-2"></i>
                Transfer
              </Button>
              
              <Button
                variant="outline"
                onClick={() => onPayment("qris")}
                disabled={isProcessing}
                data-testid="button-pay-qris"
              >
                <i className="fas fa-qrcode mr-2"></i>
                QRIS
              </Button>
            </div>
            
            <Button
              className="w-full warning"
              onClick={() => onPayment("debt")}
              disabled={isProcessing}
              data-testid="button-save-as-debt"
            >
              <i className="fas fa-clock mr-2"></i>
              Simpan sebagai Piutang
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={onClose}
            disabled={isProcessing}
            data-testid="button-cancel-payment"
          >
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
