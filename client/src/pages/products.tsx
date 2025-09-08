import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MobileLayout from "@/components/layout/mobile-layout";
import ProductCard from "@/components/products/product-card";
import AddProductModal from "@/components/products/add-product-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/products"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest("DELETE", `/api/products/${productId}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Produk berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/products"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus produk",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products?.filter((product: any) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === "all" ||
      (filter === "low-stock" && product.stock <= 5) ||
      (filter === "out-of-stock" && product.stock === 0);
    
    return matchesSearch && matchesFilter;
  });

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  if (isLoading) {
    return (
      <MobileLayout currentPage="products">
        <div className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card border rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout currentPage="products">
      {/* Search & Filters */}
      <div className="p-4 bg-card border-b">
        <div className="relative mb-3">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
          <Input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-products"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "all" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            data-testid="filter-all"
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("low-stock")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "low-stock" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            data-testid="filter-low-stock"
          >
            Stok Rendah
          </button>
          <button
            onClick={() => setFilter("out-of-stock")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "out-of-stock" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            data-testid="filter-out-of-stock"
          >
            Habis
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Produk ({filteredProducts?.length || 0})
          </h3>
          <Button 
            onClick={() => setShowAddModal(true)}
            data-testid="button-add-product"
          >
            <i className="fas fa-plus mr-2"></i>
            Tambah
          </Button>
        </div>

        <div className="space-y-3">
          {filteredProducts?.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDeleteProduct}
            />
          ))}
          
          {filteredProducts?.length === 0 && (
            <div className="text-center py-8">
              <i className="fas fa-boxes text-4xl text-muted-foreground mb-4"></i>
              <p className="text-muted-foreground mb-2">
                {searchQuery || filter !== "all" 
                  ? "Tidak ada produk yang sesuai"
                  : "Belum ada produk"
                }
              </p>
              {!searchQuery && filter === "all" && (
                <Button 
                  onClick={() => setShowAddModal(true)}
                  data-testid="button-add-first-product"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Tambah Produk Pertama
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </MobileLayout>
  );
}
