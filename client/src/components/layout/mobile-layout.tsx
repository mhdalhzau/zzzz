import { ReactNode, useState } from "react";
import BottomNavigation from "./bottom-navigation";
import { Store, Circle, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileLayoutProps {
  children: ReactNode;
  currentPage: string;
}

export default function MobileLayout({ children, currentPage }: MobileLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold" data-testid="store-name">BukuWarung</h1>
            <div className="flex items-center text-xs opacity-90">
              <Circle className="w-1.5 h-1.5 text-success mr-1 fill-current" />
              <span data-testid="sync-status">Tersinkronisasi</span>
            </div>
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
