import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, BarChart3, MoreHorizontal, ChevronLeft, Cloud, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export type AppTab = 'dashboard' | 'sales' | 'inventory' | 'expenses' | 'debt' | 'breakeven' | 'analytics' | 'more' | 'calculator';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  user: User | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onAuthClick, onLogout }) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'Home', icon: LayoutDashboard },
    { id: 'sales' as const, label: 'Sales', icon: ShoppingCart },
    { id: 'inventory' as const, label: 'Stock', icon: Package },
    { id: 'analytics' as const, label: 'Reports', icon: BarChart3 },
    { id: 'more' as const, label: 'More', icon: MoreHorizontal },
  ];

  const isMoreActive = ['expenses', 'debt', 'breakeven', 'calculator', 'more'].includes(activeTab);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-foreground overflow-x-hidden font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4">
        {activeTab !== 'dashboard' && (
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-50 active:scale-95 transition-all text-charcoal"
            aria-label="Back to home"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <img 
              src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/90d544cf-dc81-48c5-bdc7-0f4cb3fb00a8/sellsmart-ng-logo-f6cac782-1782447052313.webp" 
              className="w-8 h-8 rounded-[10px] object-cover shadow-sm border border-emerald/10"
              alt="Logo"
            />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald rounded-full border-2 border-white" />
          </div>
          <h1 className="text-lg font-black text-charcoal tracking-tighter uppercase">SellSmart <span className="text-emerald italic">NG</span></h1>
        </div>
        
        {!user ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onAuthClick}
            className="border-emerald text-emerald hover:bg-emerald/5 rounded-2xl h-10 px-4 font-bold flex gap-2 items-center"
          >
            <Cloud size={16} />
            <span className="hidden sm:inline">Save Data</span>
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center active:scale-95 transition-transform">
                <span className="text-xs font-black text-emerald uppercase">{user.email?.charAt(0) || 'U'}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl mt-2 p-1">
              <DropdownMenuItem 
                onClick={onLogout}
                className="rounded-xl text-red-500 font-bold focus:text-red-600 focus:bg-red-50 flex gap-2"
              >
                <LogOut size={16} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <main className="flex-1 pb-36 px-5 pt-6 overflow-y-auto max-w-lg mx-auto w-full">
        {children}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white border border-slate-200/60 flex justify-around p-2 rounded-[2.5rem] z-50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'more' && isMoreActive);
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 px-5 rounded-[2rem] transition-all duration-300",
                isActive ? "text-emerald scale-105" : "text-slate-400 hover:text-slate-500"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-emerald/5 rounded-[2rem]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
              <span className={cn("text-[8px] font-black tracking-widest uppercase relative z-10", isActive ? "opacity-100" : "opacity-60")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
