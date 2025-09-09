import { ReactNode, useState } from "react";
import BottomNavigation from "./bottom-navigation";
import { Store, Circle, Bell, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface MobileLayoutProps {
  children: ReactNode;
  currentPage: string;
}

export default function MobileLayout({ children, currentPage }: MobileLayoutProps) {
  const { user, logout } = useAuth();
  const { activeStore, stores, switchStore, isLoadingStores } = useStore();

  return (
    <>
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div className="flex-1">
            {stores.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto p-0 text-left hover:bg-white/10 text-primary-foreground">
                    <div>
                      <div className="flex items-center">
                        <h1 className="text-lg font-semibold" data-testid="store-name">
                          {isLoadingStores ? "Memuat..." : (activeStore?.name || "Pilih Toko")}
                        </h1>
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </div>
                      <div className="flex items-center text-xs opacity-90">
                        <Circle className="w-1.5 h-1.5 text-success mr-1 fill-current" />
                        <span data-testid="sync-status">Tersinkronisasi</span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Pilih Toko</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {stores.map((store: any) => (
                    <DropdownMenuItem
                      key={store.id}
                      onClick={() => switchStore(store.id)}
                      className={activeStore?.id === store.id ? "bg-accent" : ""}
                    >
                      <Store className="w-4 h-4 mr-2" />
                      <div>
                        <p className="font-medium">{store.name}</p>
                        <p className="text-xs text-muted-foreground">{store.address}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div>
                <h1 className="text-lg font-semibold" data-testid="store-name">
                  {isLoadingStores ? "Memuat..." : (activeStore?.name || "BukuWarung")}
                </h1>
                <div className="flex items-center text-xs opacity-90">
                  <Circle className="w-1.5 h-1.5 text-success mr-1 fill-current" />
                  <span data-testid="sync-status">Tersinkronisasi</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="relative p-2 hover:bg-white/10 rounded-full" data-testid="button-notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-destructive w-4 h-4 rounded-full text-xs flex items-center justify-center">3</span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10 rounded-full text-primary-foreground" data-testid="button-profile">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive" data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage={currentPage} />
    </>
  );
}
