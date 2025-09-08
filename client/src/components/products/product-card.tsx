import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    sku: string;
    priceBuy: string;
    priceSell: string;
    stock: number;
    unit: string;
  };
  onDelete: (productId: string) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  const getStockStatus = () => {
    if (product.stock === 0) {
      return { label: "Habis", color: "text-destructive", icon: "fa-times-circle" };
    } else if (product.stock <= 5) {
      return { label: "Stok Rendah", color: "text-warning", icon: "fa-exclamation-triangle" };
    }
    return { label: "Stok Normal", color: "text-success", icon: "fa-circle" };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="bg-card border rounded-lg p-4" data-testid={`product-${product.id}`}>
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
          <i className="fas fa-image text-2xl text-muted-foreground"></i>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold" data-testid="text-product-name">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-product-sku">
                SKU: {product.sku}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product.id)}
              className="p-1 hover:bg-muted"
              data-testid="button-edit-product"
            >
              <i className="fas fa-edit text-muted-foreground"></i>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary" data-testid="text-sell-price">
                {formatCurrency(parseFloat(product.priceSell))}
              </p>
              <p className="text-xs text-muted-foreground" data-testid="text-buy-price">
                Beli: {formatCurrency(parseFloat(product.priceBuy))}
              </p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium" data-testid="text-stock-quantity">
                  {product.stock}
                </span>
                <span className="text-xs text-muted-foreground">{product.unit}</span>
              </div>
              <div className={`flex items-center text-xs ${stockStatus.color}`} data-testid="text-stock-status">
                <i className={`fas ${stockStatus.icon} mr-1`} style={{ fontSize: '8px' }}></i>
                <span>{stockStatus.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
