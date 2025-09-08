import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MobileLayout from "@/components/layout/mobile-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CreditCard, User } from "lucide-react";

export default function CashFlow() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [entryData, setEntryData] = useState({
    type: "expense",
    category: "",
    description: "",
    amount: "",
    paymentMethod: "cash",
    customerId: "",
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: entries, isLoading } = useQuery({
    queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/cashflow", filterType],
    queryFn: () => {
      const params = filterType !== "all" ? `?type=${filterType}` : "";
      return fetch(`/api/stores/550e8400-e29b-41d4-a716-446655440001/cashflow${params}`)
        .then(res => res.json());
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/customers"],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (entry: any) => {
      return await apiRequest("POST", "/api/stores/550e8400-e29b-41d4-a716-446655440001/cashflow", entry);
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Entry arus kas berhasil ditambahkan",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/cashflow"] 
      });
      setEntryData({
        type: "expense",
        category: "",
        description: "",
        amount: "",
        paymentMethod: "cash",
        customerId: "",
      });
      setShowAddForm(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menambahkan entry arus kas",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryData.category || !entryData.description || !entryData.amount) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }
    
    if (entryData.category === "debt" && !entryData.customerId) {
      toast({
        title: "Error",
        description: "Pilih pelanggan untuk pembayaran piutang",
        variant: "destructive",
      });
      return;
    }
    
    createEntryMutation.mutate({
      ...entryData,
      amount: parseFloat(entryData.amount).toFixed(2),
      customerId: entryData.category === "debt" ? entryData.customerId : null,
    });
  };

  const incomeEntries = entries?.filter((entry: any) => entry.type === "income") || [];
  const expenseEntries = entries?.filter((entry: any) => entry.type === "expense") || [];
  
  const totalIncome = incomeEntries.reduce((sum: number, entry: any) => 
    sum + parseFloat(entry.amount), 0);
  const totalExpense = expenseEntries.reduce((sum: number, entry: any) => 
    sum + parseFloat(entry.amount), 0);
  const netCashFlow = totalIncome - totalExpense;

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      sales: "fas fa-store",
      purchase: "fas fa-shopping-cart",
      operational: "fas fa-cogs",
      marketing: "fas fa-bullhorn",
      salary: "fas fa-users",
      rent: "fas fa-building",
      utilities: "fas fa-bolt",
      loan: "fas fa-money-bill",
      debt: "fas fa-credit-card",
      other: "fas fa-list",
    };
    return iconMap[category] || "fas fa-list";
  };

  const getPaymentMethodIcon = (method: string) => {
    const iconMap: Record<string, string> = {
      cash: "fas fa-money-bill",
      transfer: "fas fa-university",
      qris: "fas fa-qrcode",
      ewallet: "fas fa-mobile-alt",
    };
    return iconMap[method] || "fas fa-money-bill";
  };

  return (
    <MobileLayout title="Arus Kas" showBackButton>
      {/* Summary Cards */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-arrow-up text-success"></i>
              <div>
                <p className="text-sm text-success">Pemasukan</p>
                <p className="text-lg font-bold text-success" data-testid="text-total-income">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-arrow-down text-destructive"></i>
              <div>
                <p className="text-sm text-destructive">Pengeluaran</p>
                <p className="text-lg font-bold text-destructive" data-testid="text-total-expense">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`rounded-lg p-4 ${netCashFlow >= 0 ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Arus Kas Bersih</p>
              <p className={`text-xl font-bold ${netCashFlow >= 0 ? 'text-success' : 'text-destructive'}`} data-testid="text-net-cashflow">
                {formatCurrency(netCashFlow)}
              </p>
            </div>
            <i className={`fas ${netCashFlow >= 0 ? 'fa-trending-up text-success' : 'fa-trending-down text-destructive'} text-2xl`}></i>
          </div>
        </div>
      </div>

      {/* Filter and Add Button */}
      <div className="p-4 flex items-center justify-between">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40" data-testid="select-filter-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="income">Pemasukan</SelectItem>
            <SelectItem value="expense">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          data-testid="button-toggle-add-form"
        >
          <i className="fas fa-plus mr-2"></i>
          Tambah Entry
        </Button>
      </div>

      {/* Add Entry Form */}
      {showAddForm && (
        <div className="p-4 bg-card border-t">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tipe</label>
                <Select value={entryData.type} onValueChange={(value) => setEntryData({...entryData, type: value})}>
                  <SelectTrigger data-testid="select-entry-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Kategori</label>
                <Select value={entryData.category} onValueChange={(value) => setEntryData({...entryData, category: value})}>
                  <SelectTrigger data-testid="select-entry-category">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {entryData.type === "income" ? (
                      <>
                        <SelectItem value="sales">Penjualan</SelectItem>
                        <SelectItem value="debt">Pembayaran Piutang</SelectItem>
                        <SelectItem value="loan">Pinjaman</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="purchase">Pembelian</SelectItem>
                        <SelectItem value="operational">Operasional</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="salary">Gaji</SelectItem>
                        <SelectItem value="rent">Sewa</SelectItem>
                        <SelectItem value="utilities">Listrik/Air</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Deskripsi</label>
              <Input
                type="text"
                placeholder="Deskripsi transaksi"
                value={entryData.description}
                onChange={(e) => setEntryData({...entryData, description: e.target.value})}
                data-testid="input-entry-description"
              />
            </div>

            {/* Customer Selection for Debt Payment */}
            {entryData.category === "debt" && (
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Pelanggan
                </label>
                <Select value={entryData.customerId} onValueChange={(value) => setEntryData({...entryData, customerId: value})}>
                  <SelectTrigger data-testid="select-debt-customer">
                    <SelectValue placeholder="Pilih pelanggan yang membayar piutang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.phone && `(${customer.phone})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  <CreditCard className="w-3 h-3 inline mr-1" />
                  Catat pembayaran piutang dari pelanggan
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Jumlah</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={entryData.amount}
                  onChange={(e) => setEntryData({...entryData, amount: e.target.value})}
                  data-testid="input-entry-amount"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Metode</label>
                <Select value={entryData.paymentMethod} onValueChange={(value) => setEntryData({...entryData, paymentMethod: value})}>
                  <SelectTrigger data-testid="select-entry-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                    <SelectItem value="ewallet">E-Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                data-testid="button-cancel-add"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={createEntryMutation.isPending}
                data-testid="button-save-entry"
              >
                {createEntryMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry: any) => (
              <div 
                key={entry.id} 
                className="bg-card border rounded-lg p-4"
                data-testid={`entry-${entry.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${entry.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                      <i className={`${getCategoryIcon(entry.category)} text-sm ${entry.type === 'income' ? 'text-success' : 'text-destructive'}`}></i>
                    </div>
                    <div>
                      <p className="font-medium">{entry.description}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {entry.category} • {format(new Date(entry.createdAt), "dd MMM yyyy", { locale: id })}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <i className={`${getPaymentMethodIcon(entry.paymentMethod)} text-xs text-muted-foreground`}></i>
                        <p className="text-xs text-muted-foreground capitalize">{entry.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${entry.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {entry.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(entry.amount))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="fas fa-chart-line text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">Belum ada data arus kas</p>
            <p className="text-sm text-muted-foreground">Tambah entry pertama Anda</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}