import { useQuery } from "@tanstack/react-query";
import MobileLayout from "@/components/layout/mobile-layout";
import { formatCurrency } from "@/lib/currency";
import { Link } from "wouter";
import type { DashboardStats } from "@shared/schema";
import { TrendingUp, Receipt, Clock, AlertTriangle, Plus, Eye } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/dashboard"],
  });

  if (isLoading) {
    return (
      <MobileLayout currentPage="dashboard">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-4 border shadow-sm animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-1"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout currentPage="dashboard">
      <div className="p-4">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Omzet Hari Ini</h3>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success" data-testid="text-daily-sales">
              {formatCurrency(stats?.dailySales || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">+15% dari kemarin</p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Transaksi</h3>
              <Receipt className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-transaction-count">
              {stats?.transactionCount || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Transaksi hari ini</p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Piutang</h3>
              <Clock className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning" data-testid="text-total-debt">
              {formatCurrency(stats?.totalDebt || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">12 pelanggan</p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Stok Kritis</h3>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive" data-testid="text-low-stock">
              {stats?.lowStockCount || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Produk perlu restock</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/pos">
              <a className="bg-primary text-primary-foreground p-4 rounded-lg flex flex-col items-center space-y-2 hover:bg-primary/90 transition-colors" data-testid="button-create-transaction">
                <Receipt className="w-8 h-8" />
                <span className="font-medium">Buat Transaksi</span>
              </a>
            </Link>
            
            <Link href="/products">
              <a className="bg-secondary text-secondary-foreground p-4 rounded-lg flex flex-col items-center space-y-2 hover:bg-secondary/90 transition-colors" data-testid="button-manage-products">
                <Plus className="w-8 h-8" />
                <span className="font-medium">Kelola Produk</span>
              </a>
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Transaksi Terakhir</h3>
            <Link href="/reports">
              <a className="text-primary text-sm font-medium" data-testid="link-view-all-transactions">
                Lihat Semua
              </a>
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats?.recentTransactions?.slice(0, 3).map((transaction: any) => (
              <div key={transaction.id} className="bg-card rounded-lg p-3 border flex items-center justify-between" data-testid={`transaction-${transaction.id}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.paymentStatus === 'paid' 
                      ? 'bg-success/10' 
                      : 'bg-warning/10'
                  }`}>
                    {transaction.paymentStatus === 'paid' ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-warning" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(parseFloat(transaction.total))}</p>
                  <p className={`text-xs ${
                    transaction.paymentStatus === 'paid' 
                      ? 'text-success' 
                      : 'text-warning'
                  }`}>
                    {transaction.paymentMethod || 'Belum Bayar'}
                  </p>
                </div>
              </div>
            ))}
            
            {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
              <div className="text-center py-8">
                <Receipt className="w-16 h-16 text-muted-foreground mb-4 mx-auto" />
                <p className="text-muted-foreground">Belum ada transaksi hari ini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
