import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { ProfitCalculator } from "@/components/ProfitCalculator";
import { ExpenseTracker } from "@/components/ExpenseTracker";
import { SalesTracker } from "@/components/SalesTracker";
import { InventoryManager } from "@/components/InventoryManager";
import { DebtTracker } from "@/components/DebtTracker";
import { BreakEvenCalculator } from "@/components/BreakEvenCalculator";
import { Analytics } from "@/components/Analytics";
import { Expense, ProfitResult, Sale, InventoryItem, DebtRecord } from "./types";
import { AppTab } from "@/components/Layout";
import { Toaster, toast } from "sonner";
import { nanoid } from "nanoid";
import { ReceiptText, Users, Calculator, TrendingUp, Plus } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { AuthModal } from "@/components/AuthModal";
import { toastSupabaseError } from "@/utils/supabase-errors";

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('sellsmart_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('sellsmart_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('sellsmart_inventory');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Sample Product', stockLevel: 10, minStockLevel: 5, unitCost: 1000 }
    ];
  });

  const [debts, setDebts] = useState<DebtRecord[]>(() => {
    const saved = localStorage.getItem('sellsmart_debts');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastResult, setLastResult] = useState<ProfitResult | null>(() => {
    const saved = localStorage.getItem('sellsmart_last_result');
    return saved ? JSON.parse(saved) : null;
  });

  // ─── Load from localStorage (for guest mode) ───
  const loadFromLocalStorage = useCallback(() => {
    const savedExpenses = localStorage.getItem('sellsmart_expenses');
    const savedSales = localStorage.getItem('sellsmart_sales');
    const savedInventory = localStorage.getItem('sellsmart_inventory');
    const savedDebts = localStorage.getItem('sellsmart_debts');

    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedDebts) setDebts(JSON.parse(savedDebts));
  }, []);

  // ─── Fetch user data from Supabase ───
  const fetchUserData = useCallback(async () => {
    try {
      const [invRes, salesRes, expRes, debtsRes] = await Promise.all([
        supabase.from('inventory').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('debts').select('*')
      ]);

      if (invRes.error) throw invRes.error;
      if (salesRes.error) throw salesRes.error;
      if (expRes.error) throw expRes.error;
      if (debtsRes.error) throw debtsRes.error;

      setInventory(invRes.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        stockLevel: item.stock_level,
        minStockLevel: item.min_stock_level,
        unitCost: item.unit_cost
      })));

      setSales(salesRes.data.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: Number(item.price),
        date: item.date
      })));

      setExpenses(expRes.data.map((item: any) => ({
        id: item.id,
        category: item.category,
        amount: Number(item.amount),
        description: item.description,
        date: item.date
      })));

      setDebts(debtsRes.data.map((item: any) => ({
        id: item.id,
        customerName: item.customer_name,
        totalAmount: Number(item.total_amount),
        paidAmount: Number(item.paid_amount),
        status: item.status as 'pending' | 'partially_paid' | 'cleared',
        date: item.date,
        history: Array.isArray(item.history) ? item.history : []
      })));

    } catch (error) {
      toastSupabaseError(error, "Failed to load data from cloud");
    }
  }, []);

  // ─── Migrate localStorage data to Supabase ───
  const migrateData = useCallback(async (userId: string) => {
    const toastId = toast.loading("Migrating your data to the cloud...");

    try {
      const invToInsert = inventory.map(item => ({
        user_id: userId,
        name: item.name,
        stock_level: item.stockLevel,
        min_stock_level: item.minStockLevel,
        unit_cost: item.unitCost
      }));

      const salesToInsert = sales.map(item => ({
        user_id: userId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
        date: item.date
      }));

      const expToInsert = expenses.map(item => ({
        user_id: userId,
        category: item.category,
        amount: item.amount,
        description: item.description,
        date: item.date
      }));

      const debtsToInsert = debts.map(item => ({
        user_id: userId,
        customer_name: item.customerName,
        total_amount: item.totalAmount,
        paid_amount: item.paidAmount,
        status: item.status,
        date: item.date,
        history: item.history
      }));

      if (invToInsert.length) {
        const { error } = await supabase.from('inventory').insert(invToInsert);
        if (error) throw error;
      }
      if (salesToInsert.length) {
        const { error } = await supabase.from('sales').insert(salesToInsert);
        if (error) throw error;
      }
      if (expToInsert.length) {
        const { error } = await supabase.from('expenses').insert(expToInsert);
        if (error) throw error;
      }
      if (debtsToInsert.length) {
        const { error } = await supabase.from('debts').insert(debtsToInsert);
        if (error) throw error;
      }

      // Clear local storage and migration flag
      localStorage.removeItem('sellsmart_expenses');
      localStorage.removeItem('sellsmart_sales');
      localStorage.removeItem('sellsmart_inventory');
      localStorage.removeItem('sellsmart_debts');
      localStorage.removeItem('sellsmart_last_result');
      localStorage.removeItem('sellsmart_needs_migration');

      toast.success("Your data is saved to your account!", { id: toastId });
      fetchUserData();
    } catch (error) {
      toast.dismiss(toastId);
      toastSupabaseError(error, "Migration failed");
    }
  }, [inventory, sales, expenses, debts, fetchUserData]);

  // ─── Auth state listener ───
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const needsMigration = localStorage.getItem('sellsmart_needs_migration') === 'true';
        if (needsMigration) {
          migrateData(session.user.id);
        } else if (event === 'SIGNED_IN') {
          fetchUserData();
        }
      } else if (event === 'SIGNED_OUT') {
        loadFromLocalStorage();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData, migrateData, loadFromLocalStorage]);

  // ─── Persist to localStorage only when NOT logged in ───
  useEffect(() => {
    if (!user) {
      localStorage.setItem('sellsmart_expenses', JSON.stringify(expenses));
      localStorage.setItem('sellsmart_sales', JSON.stringify(sales));
      localStorage.setItem('sellsmart_inventory', JSON.stringify(inventory));
      localStorage.setItem('sellsmart_debts', JSON.stringify(debts));
      localStorage.setItem('sellsmart_last_result', JSON.stringify(lastResult));
    }
  }, [expenses, sales, inventory, debts, lastResult, user]);

  // ─── Logout ───
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toastSupabaseError(error, "Logout failed");
    } else {
      toast.success("Logged out successfully");
      setActiveTab('dashboard');
    }
  };

  // ─── Auth modal success handler ───
  const handleAuthSuccess = () => {
    // Auth state change listener will handle data loading/migration
  };

  // ═══════════════════════════════════════════
  // EXPENSES
  // ═══════════════════════════════════════════
  const addExpense = async (newExpense: Omit<Expense, 'id'>) => {
    if (user) {
      const { data, error } = await supabase.from('expenses').insert([{
        user_id: user.id,
        category: newExpense.category,
        amount: newExpense.amount,
        description: newExpense.description,
        date: newExpense.date
      }]).select().single();

      if (error) {
        toastSupabaseError(error, "Could not save expense");
        return;
      }
      
      if (data) {
        const savedExpense: Expense = {
          id: data.id,
          category: data.category,
          amount: Number(data.amount),
          description: data.description,
          date: data.date
        };
        setExpenses(prev => [savedExpense, ...prev]);
      }
    } else {
      const expense: Expense = { ...newExpense, id: nanoid() };
      setExpenses((prev) => [expense, ...prev]);
      localStorage.setItem('sellsmart_needs_migration', 'true');
    }
    toast.success("Expense added successfully");
  };

  const deleteExpense = async (id: string) => {
    if (user) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) {
        toastSupabaseError(error, "Could not delete expense");
        return;
      }
    }
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    if (!user) {
      localStorage.setItem('sellsmart_needs_migration', 'true');
    }
    toast.success("Expense deleted");
  };

  // ═══════════════════════════════════════════
  // SALES
  // ═══════════════════════════════════════════
  const addSale = async (newSale: Omit<Sale, 'id'>) => {
    if (user) {
      const { data: saleData, error: saleError } = await supabase.from('sales').insert([{
        user_id: user.id,
        product_id: newSale.productId,
        product_name: newSale.productName,
        quantity: newSale.quantity,
        price: newSale.price,
        date: newSale.date
      }]).select().single();

      if (saleError) {
        toastSupabaseError(saleError, "Could not record sale");
        return;
      }

      // Update inventory stock level
      const item = inventory.find(i => i.id === newSale.productId);
      if (item) {
        await supabase.from('inventory')
          .update({ stock_level: item.stockLevel - newSale.quantity })
          .eq('id', item.id);
      }

      if (saleData) {
        setSales(prev => [{
          id: saleData.id,
          productId: saleData.product_id,
          productName: saleData.product_name,
          quantity: saleData.quantity,
          price: Number(saleData.price),
          date: saleData.date
        }, ...prev]);
        
        setInventory(prev => prev.map(i => 
          i.id === newSale.productId 
            ? { ...i, stockLevel: i.stockLevel - newSale.quantity }
            : i
        ));
      }
    } else {
      const sale: Sale = { ...newSale, id: nanoid() };
      setSales(prev => [sale, ...prev]);
      setInventory(prev => prev.map(i => 
        i.id === sale.productId 
          ? { ...i, stockLevel: i.stockLevel - sale.quantity }
          : i
      ));
      localStorage.setItem('sellsmart_needs_migration', 'true');
    }
    toast.success("Sale recorded");
  };

  const deleteSale = async (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;

    if (user) {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) {
        toastSupabaseError(error, "Could not delete sale");
        return;
      }
      
      // Reverse inventory update
      const item = inventory.find(i => i.id === sale.productId);
      if (item) {
        await supabase.from('inventory')
          .update({ stock_level: item.stockLevel + sale.quantity })
          .eq('id', item.id);
      }
    } else {
      localStorage.setItem('sellsmart_needs_migration', 'true');
    }

    setInventory(prev => prev.map(i => 
      i.id === sale.productId 
        ? { ...i, stockLevel: i.stockLevel + sale.quantity }
        : i
    ));
    
    setSales(prev => prev.filter(s => s.id !== id));
    toast.success("Sale deleted");
  };

  // ═══════════════════════════════════════════
  // INVENTORY
  // ═══════════════════════════════════════════
  const addInventoryItem = async (newItem: Omit<InventoryItem, 'id'>) => {
    if (user) {
      const { data, error } = await supabase.from('inventory').insert([{
        user_id: user.id,
        name: newItem.name,
        stock_level: newItem.stockLevel,
        min_stock_level: newItem.minStockLevel,
        unit_cost: newItem.unitCost
      }]).select().single();

      if (error) {
        toastSupabaseError(error, "Could not add inventory item");
        return;
      }

      if (data) {
        setInventory(prev => [...prev, {
          id: data.id,
          name: data.name,
          stockLevel: data.stock_level,
          minStockLevel: data.min_stock_level,
          unitCost: data.unit_cost
        }]);
      }
    } else {
      const item: InventoryItem = { ...newItem, id: nanoid() };
      setInventory(prev => [...prev, item]);
      localStorage.setItem('sellsmart_needs_migration', 'true');
    }
    toast.success("Item added to inventory");
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    if (user) {
      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.stockLevel !== undefined) dbUpdates.stock_level = updates.stockLevel;
      if (updates.minStockLevel !== undefined) dbUpdates.min_stock_level = updates.minStockLevel;
      if (updates.unitCost !== undefined) dbUpdates.unit_cost = updates.unitCost;

      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase.from('inventory').update(dbUpdates).eq('id', id);
        if (error) {
          toastSupabaseError(error, "Could not update inventory item");
          return;
        }
      }
    } else {
      localStorage.setItem('sellsmart_needs_migration', 'true');
    }

    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    toast.success("Inventory updated");
  };

  const deleteInventoryItem = async (id: string) => {
    if (user) {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) {
        toastSupabaseError(error, "Could not delete inventory item");
        return;
      }
    } else {
      localStorage.setItem('sellsmart_needs_migration', 'true');
    }
    
    setInventory(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed from inventory");
  };

  // Wrapper for InventoryManager's onUpdateStock prop
  const updateStock = (id: string, newLevel: number) => {
    updateInventoryItem(id, { stockLevel: newLevel });
  };

  // ═══════════════════════════════════════════
  // DEBTS
  // ═══════════════════════════════════════════
  const addDebt = async (newDebt: Omit<DebtRecord, 'id'>) => {
    if (user) {
      const { data, error } = await supabase.from('debts').insert([{
        user_id: user.id,
        customer_name: newDebt.customerName,
        total_amount: newDebt.totalAmount,
        paid_amount: newDebt.paidAmount,
        status: newDebt.status,
        date: newDebt.date,
        history: newDebt.history
      }]).select().single();

      if (error) {
        toastSupabaseError(error, "Could not save debt record");
        return;
      }

      if (data) {
        const savedDebt: DebtRecord = {
          id: data.id,
          customerName: data.customer_name,
          totalAmount: Number(data.total_amount),
          paidAmount: Number(data.paid_amount),
          status: data.status,
          date: data.date,
          history: Array.isArray(data.history) ? data.history : []
        };
        setDebts(prev => [savedDebt, ...prev]);
      }
    } else {
      const debt: DebtRecord = { ...newDebt, id: nanoid() };
      setDebts(prev => [debt, ...prev]);
      localStorage.setItem('sellsmart_needs_migration', 'true');
    }
    toast.success("Debt record added");
  };

  const updatePayment = async (id: string, amount: number) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const newPaid = debt.paidAmount + amount;
    const status = newPaid >= debt.totalAmount ? 'cleared' : 'partially_paid';
    const newHistory = [...debt.history, { date: new Date().toISOString(), amount }];

    if (user) {
      const { error } = await supabase.from('debts').update({
        paid_amount: newPaid,
        status,
        history: newHistory
      }).eq('id', id);

      if (error) {
        toastSupabaseError(error, "Could not update payment");
        return;
      }
    } else {
      localStorage.setItem('sellsmart_needs_migration', 'true');
    }

    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          paidAmount: newPaid,
          status,
          history: newHistory
        };
      }
      return d;
    }));
    toast.success("Payment added");
  };

  const deleteDebt = async (id: string) => {
    if (user) {
      const { error } = await supabase.from('debts').delete().eq('id', id);
      if (error) {
        toastSupabaseError(error, "Could not delete debt record");
        return;
      }
    } else {
      localStorage.setItem('sellsmart_needs_migration', 'true');
    }
    
    setDebts(prev => prev.filter(d => d.id !== id));
    toast.success("Debt record removed");
  };

  // ═══════════════════════════════════════════
  // PROFIT CALCULATOR
  // ═══════════════════════════════════════════
  const handleProfitResult = useCallback((result: ProfitResult) => {
    setLastResult(result);
  }, []);

  const handleInputsChange = useCallback((inputs: any) => {
    localStorage.setItem('sellsmart_inputs', JSON.stringify(inputs));
  }, []);

  // ═══════════════════════════════════════════
  // MORE MENU
  // ═══════════════════════════════════════════
  const renderMoreMenu = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => setActiveTab('expenses')}
          className="premium-card p-6 flex items-center justify-between text-left group active:bg-slate-50"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-2xl text-red-600">
              <ReceiptText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal">Business Expenses</h3>
              <p className="text-xs text-slate-gray">Track your spending</p>
            </div>
          </div>
          <Plus className="text-slate-300 group-hover:text-emerald transition-colors" />
        </button>
        
        <button 
          onClick={() => setActiveTab('debt')}
          className="premium-card p-6 flex items-center justify-between text-left group active:bg-slate-50"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal">Debt Tracker</h3>
              <p className="text-xs text-slate-gray">Manage "Pay Small Small"</p>
            </div>
          </div>
          <Plus className="text-slate-300 group-hover:text-emerald transition-colors" />
        </button>
        <button 
          onClick={() => setActiveTab('breakeven')}
          className="premium-card p-6 flex items-center justify-between text-left group active:bg-slate-50"
        >
          <div className="flex items-center gap-4">
            <div className="bg-teal-100 p-3 rounded-2xl text-teal-600">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal">Break-even Calculator</h3>
              <p className="text-xs text-slate-gray">Know your targets</p>
            </div>
          </div>
          <Plus className="text-slate-300 group-hover:text-emerald transition-colors" />
        </button>

        <button 
          onClick={() => setActiveTab('calculator')}
          className="premium-card p-6 flex items-center justify-between text-left group active:bg-slate-50"
        >
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal">Profit Calculator</h3>
              <p className="text-xs text-slate-gray">Price your products right</p>
            </div>
          </div>
          <Plus className="text-slate-300 group-hover:text-emerald transition-colors" />
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // RENDER CONTENT
  // ═══════════════════════════════════════════
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            expenses={expenses} 
            sales={sales}
            inventory={inventory}
            debts={debts}
            onAction={setActiveTab} 
            lastProfit={lastResult?.expectedProfit} 
          />
        );
      case 'sales':
        return <SalesTracker sales={sales} inventory={inventory} onAddSale={addSale} onDeleteSale={deleteSale} />;
      case 'inventory':
        return <InventoryManager items={inventory} onAddItem={addInventoryItem} onDeleteItem={deleteInventoryItem} onUpdateStock={updateStock} />;
      case 'expenses':
        return <ExpenseTracker expenses={expenses} onAdd={addExpense} onDelete={deleteExpense} />;
      case 'debt':
        return <DebtTracker debts={debts} onAddDebt={addDebt} onUpdatePayment={updatePayment} onDeleteDebt={deleteDebt} />;
      case 'breakeven':
        return <BreakEvenCalculator />;
      case 'analytics':
        return <Analytics sales={sales} expenses={expenses} inventory={inventory} />;
      case 'more':
        return renderMoreMenu();
      /* For backward compatibility if someone still has 'calculator' in storage */
      // @ts-ignore
      case 'calculator': {
        const savedInputs = localStorage.getItem('sellsmart_inputs');
        const initialInputs = savedInputs ? JSON.parse(savedInputs) : null;
        return (
            <ProfitCalculator 
              onResult={handleProfitResult} 
              initialInputs={initialInputs}
              onInputsChange={handleInputsChange} 
            />
          );
      }
      default:
        return <Dashboard expenses={expenses} sales={sales} inventory={inventory} debts={debts} onAction={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onAuthClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
      
      <AuthModal 
        open={isAuthModalOpen} 
        onOpenChange={setIsAuthModalOpen}
        onSuccess={handleAuthSuccess}
      />
      
      <Toaster position="top-center" expand={true} richColors />
    </div>
  );
}

export default App;
