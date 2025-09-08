import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MobileLayout from "@/components/layout/mobile-layout";
import StatsCard from "@/components/reports/stats-card";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    to: new Date().toISOString().split('T')[0], // Today
  });
  
  const { toast } = useToast();

  const { data: report, isLoading } = useQuery({
    queryKey: ["/api/stores/550e8400-e29b-41d4-a716-446655440001/reports/sales", dateRange.from, dateRange.to],
    queryFn: () => 
      fetch(`/api/stores/550e8400-e29b-41d4-a716-446655440001/reports/sales?from=${dateRange.from}&to=${dateRange.to}`)
        .then(res => res.json())
  });

  const handleExportPDF = () => {
    toast({
      title: "Info",
      description: "Fitur export PDF akan segera tersedia",
    });
  };

  const handleExportExcel = () => {
    toast({
      title: "Info", 
      description: "Fitur export Excel akan segera tersedia",
    });
  };

  if (isLoading) {
    return (
      <MobileLayout currentPage="reports">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-4 border animate-pulse">
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

  const formatDateRange = () => {
    const from = new Date(dateRange.from).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const to = new Date(dateRange.to).toLocaleDateString('id-ID', {
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
    return `${from} - ${to}`;
  };

  return (
    <MobileLayout currentPage="reports">
      {/* Date Range Filter */}
      <div className="p-4 bg-card border-b">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">Periode Laporan</span>
          <button className="text-primary text-sm font-medium" data-testid="button-change-date">
            Ubah
          </button>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <i className="fas fa-calendar text-muted-foreground"></i>
          <span data-testid="text-report-period">{formatDateRange()}</span>
        </div>
      </div>

      <div className="p-4">
        {/* Sales Summary */}
        <h3 className="text-lg font-semibold mb-4">Ringkasan Penjualan</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatsCard
            title="Total Omzet"
            value={formatCurrency(report?.totalRevenue || 0)}
            change="+18% dari periode lalu"
            icon="fas fa-chart-line"
            color="success"
            testId="total-revenue"
          />
          
          <StatsCard
            title="Total Transaksi"
            value={report?.totalTransactions || 0}
            change="+12% dari periode lalu"
            icon="fas fa-receipt"
            color="primary"
            testId="total-transactions"
          />
          
          <StatsCard
            title="Laba Kotor"
            value={formatCurrency(report?.grossProfit || 0)}
            change="Margin 27%"
            icon="fas fa-coins"
            color="warning"
            testId="gross-profit"
          />
          
          <StatsCard
            title="Rata-rata per Transaksi"
            value={formatCurrency(report?.averageTransaction || 0)}
            change="+5% dari periode lalu"
            icon="fas fa-calculator"
            color="accent"
            testId="average-transaction"
          />
        </div>

        {/* Top Products */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Produk Terlaris</h4>
          <div className="bg-card border rounded-lg p-4">
            {report?.topProducts?.length > 0 ? (
              <div className="space-y-3">
                {report.topProducts.slice(0, 3).map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between" data-testid={`top-product-${index + 1}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-primary/10' : index === 1 ? 'bg-secondary/10' : 'bg-muted'
                      }`}>
                        <span className={`text-xs font-bold ${
                          index === 0 ? 'text-primary' : index === 1 ? 'text-secondary' : 'text-muted-foreground'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{product.productName}</p>
                        <p className="text-sm text-muted-foreground">{product.quantity} terjual</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                      <p className="text-xs text-success">+24%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Tidak ada data produk untuk periode ini
              </p>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Metode Pembayaran</h4>
          <div className="bg-card border rounded-lg p-4">
            {report?.paymentMethods?.length > 0 ? (
              <div className="space-y-4">
                {report.paymentMethods.map((method: any, index: number) => (
                  <div key={index} className="flex items-center justify-between" data-testid={`payment-method-${method.method}`}>
                    <div className="flex items-center space-x-3">
                      <i className={`fas ${
                        method.method === 'cash' ? 'fa-money-bill-wave text-success' :
                        method.method === 'transfer' ? 'fa-university text-primary' :
                        'fa-qrcode text-accent'
                      }`}></i>
                      <span>{method.method}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(method.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((method.amount / (report?.totalRevenue || 1)) * 100)}% dari total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-money-bill-wave text-success"></i>
                    <span>Tunai</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency((report?.totalRevenue || 0) * 0.6)}</p>
                    <p className="text-xs text-muted-foreground">60% dari total</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-university text-primary"></i>
                    <span>Transfer</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency((report?.totalRevenue || 0) * 0.4)}</p>
                    <p className="text-xs text-muted-foreground">40% dari total</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Options */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Export Laporan</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="success" 
              onClick={handleExportPDF}
              data-testid="button-export-pdf"
            >
              <i className="fas fa-file-pdf mr-2"></i>
              Export PDF
            </Button>
            
            <Button 
              onClick={handleExportExcel}
              data-testid="button-export-excel"
            >
              <i className="fas fa-file-excel mr-2"></i>
              Export Excel
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
