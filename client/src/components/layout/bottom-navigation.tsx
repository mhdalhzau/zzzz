import { Link, useLocation } from "wouter";
import { Home, Calculator, Package, Users, TrendingUp } from "lucide-react";

interface BottomNavigationProps {
  currentPage: string;
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Beranda", id: "dashboard" },
    { path: "/pos", icon: Calculator, label: "Kasir", id: "pos" },
    { path: "/products", icon: Package, label: "Produk", id: "products" },
    { path: "/customers", icon: Users, label: "Pelanggan", id: "customers" },
    { path: "/cashflow", icon: TrendingUp, label: "Arus Kas", id: "cashflow" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-card border-t shadow-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const IconComponent = item.icon;
          return (
            <Link key={item.id} href={item.path}>
              <a 
                className={`flex flex-col items-center space-y-1 py-2 px-4 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
                data-testid={`nav-${item.id}`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
