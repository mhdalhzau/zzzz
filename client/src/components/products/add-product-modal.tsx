import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/hooks/useStore";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  sku: z.string().min(1, "SKU wajib diisi"),
  priceBuy: z.string().min(1, "Harga beli wajib diisi"),
  priceSell: z.string().min(1, "Harga jual wajib diisi"),
  stock: z.string().min(0, "Stok tidak boleh negatif"),
  unit: z.string().default("pcs"),
  category: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeStoreId } = useStore();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      priceBuy: "",
      priceSell: "",
      stock: "0",
      unit: "pcs",
      category: "",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return await apiRequest("POST", `/api/stores/${activeStoreId}/products`, productData);
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Produk berhasil ditambahkan",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${activeStoreId}/products`] });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menambahkan produk",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate({
      ...data,
      priceBuy: parseFloat(data.priceBuy).toString(),
      priceSell: parseFloat(data.priceSell).toString(),
      stock: parseInt(data.stock),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Produk</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Masukkan nama produk" 
                      {...field} 
                      data-testid="input-product-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Masukkan SKU" 
                      {...field} 
                      data-testid="input-product-sku"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priceBuy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Beli</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0" 
                        {...field} 
                        data-testid="input-price-buy"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceSell"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Jual</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0" 
                        {...field} 
                        data-testid="input-price-sell"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0" 
                        {...field} 
                        data-testid="input-stock"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="pcs" 
                        {...field} 
                        data-testid="input-unit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori (Opsional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Masukkan kategori" 
                      {...field} 
                      data-testid="input-category"
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
                disabled={createProductMutation.isPending}
                data-testid="button-save-product"
              >
                {createProductMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
