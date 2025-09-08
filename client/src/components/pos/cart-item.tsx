import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    stock: number;
  };
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="bg-card border rounded-lg p-3" data-testid={`cart-item-${item.id}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium" data-testid="text-item-name">{item.name}</h4>
          <p className="text-sm text-muted-foreground" data-testid="text-item-price">
            {formatCurrency(item.price)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="p-2 hover:bg-destructive/10 text-destructive"
          data-testid="button-remove-item"
        >
          <i className="fas fa-times"></i>
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 bg-muted rounded-full p-0 hover:bg-muted/80"
            data-testid="button-decrease-quantity"
          >
            <i className="fas fa-minus text-xs"></i>
          </Button>
          
          <span className="w-12 text-center font-medium" data-testid="text-item-quantity">
            {item.quantity}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 bg-primary rounded-full p-0 hover:bg-primary/90 text-primary-foreground"
            data-testid="button-increase-quantity"
          >
            <i className="fas fa-plus text-xs"></i>
          </Button>
        </div>
        
        <div className="text-right">
          <p className="font-semibold" data-testid="text-item-subtotal">
            {formatCurrency(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}
