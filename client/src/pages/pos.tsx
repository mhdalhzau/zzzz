import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MobileLayout from "@/components/layout/mobile-layout";
import CartItem from "@/components/pos/cart-item";
import PaymentModal from "@/components/pos/payment-modal";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { User, Plus } from "lucide-react";

interface CartItemType {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export default function POS() {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/products"],
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/customers"],
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      return await apiRequest("POST", "/api/stores/550e8400-e29b-41d4-a716-446655440001/transactions", transactionData);
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Transaksi berhasil disimpan",
      });
      setCart([]);
      setDiscount(0);
      setTax(0);
      setSelectedCustomer("");
      queryClient.invalidateQueries({ queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/debts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menyimpan transaksi",
        variant: "destructive",
      });
    },
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - discount + tax;

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Stok tidak cukup",
          description: `Stok ${product.name} hanya ${product.stock}`,
          variant: "destructive",
        });
        return;
      }
      
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (product.stock <= 0) {
        toast({
          title: "Stok habis",
          description: `${product.name} sedang habis`,
          variant: "destructive",
        });
        return;
      }
      
      setCart([...cart, {
        id: Date.now().toString(),
        productId: product.id,
        name: product.name,
        price: parseFloat(product.priceSell),
        quantity: 1,
        stock: product.stock,
      }]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    const item = cart.find(i => i.id === itemId);
    if (item && newQuantity > item.stock) {
      toast({
        title: "Stok tidak cukup",
        description: `Stok ${item.name} hanya ${item.stock}`,
        variant: "destructive",
      });
      return;
    }
    
    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setTax(0);
  };

  const handlePayment = (paymentMethod: string) => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang kosong",
        description: "Tambahkan produk terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'debt' && !selectedCustomer) {
      toast({
        title: "Pilih pelanggan",
        description: "Pilih pelanggan terlebih dahulu untuk transaksi hutang",
        variant: "destructive",
      });
      return;
    }

    const transactionData = {
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        discount: 0,
      })),
      subtotal: subtotal.toString(),
      discount: discount.toString(),
      tax: tax.toString(),
      total: total.toString(),
      paymentStatus: paymentMethod === 'debt' ? 'unpaid' : 'paid',
      paymentMethod: paymentMethod === 'debt' ? null : paymentMethod,
      customerId: paymentMethod === 'debt' ? selectedCustomer : null,
    };

    createTransactionMutation.mutate(transactionData);
    setShowPaymentModal(false);
  };

  const filteredProducts = products?.filter((product: any) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MobileLayout currentPage="pos">
      {/* Search */}
      <div className="p-4 bg-card border-b">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
          <Input
            type="text"
            placeholder="Cari produk atau scan barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12"
            data-testid="input-search-product"
          />
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-muted rounded"
            data-testid="button-scan-barcode"
          >
            <i className="fas fa-qrcode"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        {/* Product List */}
        {searchQuery && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Hasil Pencarian</h3>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {filteredProducts?.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-muted/50 text-left"
                  data-testid={`product-${product.id}`}
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(parseFloat(product.priceSell))} • Stok: {product.stock}
                    </p>
                  </div>
                  <i className="fas fa-plus text-primary"></i>
                </button>
              ))}
              
              {filteredProducts?.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Tidak ada produk yang ditemukan
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Keranjang Belanja</h3>
            {cart.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCart}
                data-testid="button-clear-cart"
              >
                <i className="fas fa-trash text-destructive mr-2"></i>
                Kosongkan
              </Button>
            )}
          </div>
          
          <div className="space-y-3 mb-6">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
            
            {cart.length === 0 && (
              <div className="text-center py-8">
                <i className="fas fa-shopping-cart text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">Keranjang masih kosong</p>
                <p className="text-sm text-muted-foreground">Cari dan tambahkan produk di atas</p>
              </div>
            )}
          </div>

          {/* Customer Selection */}
          {cart.length > 0 && (
            <div className="bg-card border rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-primary" />
                <h4 className="font-medium">Pilih Pelanggan (Opsional)</h4>
              </div>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="w-full" data-testid="select-customer">
                  <SelectValue placeholder="Pilih pelanggan untuk transaksi hutang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Pembeli umum</SelectItem>
                  {customers?.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone && `(${customer.phone})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCustomer && (
                <p className="text-sm text-muted-foreground mt-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Transaksi akan dicatat atas nama: {customers?.find((c: any) => c.id === selectedCustomer)?.name}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        {cart.length > 0 && (
          <div className="bg-card border rounded-lg p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span data-testid="text-subtotal">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Diskon:</span>
                  <span data-testid="text-discount">- {formatCurrency(discount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Pajak:</span>
                  <span data-testid="text-tax">{formatCurrency(tax)}</span>
                </div>
              )}
              <hr className="border-muted" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className="text-primary" data-testid="text-total">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Actions */}
      {cart.length > 0 && (
        <div className="bg-card border-t p-4">
          <Button 
            className="w-full mb-3"
            size="lg"
            onClick={() => setShowPaymentModal(true)}
            data-testid="button-process-payment"
          >
            <i className="fas fa-money-bill-wave mr-2"></i>
            Bayar - {formatCurrency(total)}
          </Button>
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPayment={handlePayment}
        total={total}
        isProcessing={createTransactionMutation.isPending}
      />
    </MobileLayout>
  );
}
