import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sale, Expense, InventoryItem } from "@/types";
import { formatNaira } from "@/utils/formatters";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  FileText, 
  FileSpreadsheet, 
  File as FilePdf,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Sparkles
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BrandMascot } from "./BrandMascot";

interface AnalyticsProps {
  sales: Sale[];
  expenses: Expense[];
  inventory: InventoryItem[];
}

export function Analytics({ sales, expenses, inventory }: AnalyticsProps) {
  const today = new Date();
  
  const stats = useMemo(() => {
    const weeklySalesData = sales.filter(s => isWithinInterval(new Date(s.date), { start: startOfWeek(today), end: endOfWeek(today) }));
    const weeklySales = weeklySalesData.reduce((acc, s) => acc + (s.price * s.quantity), 0);

    const weeklyProfit = weeklySalesData.reduce((acc, s) => {
      const item = inventory.find(i => i.id === s.productId);
      const cost = item ? item.unitCost : 0;
      return acc + ((s.price - cost) * s.quantity);
    }, 0);

    const monthlySales = sales
      .filter(s => isWithinInterval(new Date(s.date), { start: startOfMonth(today), end: endOfMonth(today) }))
      .reduce((acc, s) => acc + (s.price * s.quantity), 0);

    const totalRevenue = sales.reduce((acc, s) => acc + (s.price * s.quantity), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    
    // Profit Calculation
    const totalProfit = sales.reduce((acc, s) => {
      const item = inventory.find(i => i.id === s.productId);
      const cost = item ? item.unitCost : 0;
      return acc + ((s.price - cost) * s.quantity);
    }, 0);

    return {
      weeklySales,
      weeklyProfit,
      monthlySales,
      totalRevenue,
      totalExpenses,
      totalProfit,
      margin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    };
  }, [sales, expenses, inventory, today]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return format(date, "yyyy-MM-dd");
    }).reverse();

    return last7Days.map(date => {
      const dailySales = sales
        .filter(s => s.date === date)
        .reduce((acc, s) => acc + (s.price * s.quantity), 0);
      
      const dailyExpenses = expenses
        .filter(e => e.date === date)
        .reduce((acc, e) => acc + e.amount, 0);

      const dailyProfit = sales
        .filter(s => s.date === date)
        .reduce((acc, s) => {
          const item = inventory.find(i => i.id === s.productId);
          const cost = item ? item.unitCost : 0;
          return acc + ((s.price - cost) * s.quantity);
        }, 0);

      return {
        name: format(new Date(date), "MMM dd"),
        revenue: dailySales,
        expense: dailyExpenses,
        profit: dailyProfit,
      };
    });
  }, [sales, expenses, inventory]);

  const categoryPerformance = useMemo(() => {
    const performance: { [key: string]: number } = {};
    expenses.forEach(e => {
      performance[e.category] = (performance[e.category] || 0) + e.amount;
    });
    return Object.entries(performance).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const productPerformance = useMemo(() => {
    const performance: { [key: string]: { name: string, total: number } } = {};
    sales.forEach(s => {
      if (!performance[s.productId]) {
        performance[s.productId] = { name: s.productName, total: 0 };
      }
      performance[s.productId].total += s.price * s.quantity;
    });
    return Object.values(performance).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [sales]);

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Name", "Category/Item", "Amount/Price", "Quantity", "Total"];
    const salesRows = sales.map(s => [
      s.date,
      "Sale",
      s.productName,
      "-",
      s.price.toString(),
      s.quantity.toString(),
      (s.price * s.quantity).toString()
    ]);
    const expenseRows = expenses.map(e => [
      e.date,
      "Expense",
      e.description,
      e.category,
      e.amount.toString(),
      "1",
      e.amount.toString()
    ]);

    const csvContent = [
      headers.join(","),
      ...salesRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")),
      ...expenseRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `business_report_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV Report downloaded successfully!");
  };

  const exportToPDF = () => {
    toast.error("PDF Export is currently unavailable.");
  };

  const COLORS = ['#0F9D58', '#0F766E', '#D4AF37', '#4F46E5', '#3B82F6'];

  const sadeMessage = useMemo(() => {
    if (stats.margin > 30) return "Impressive! Your profit margin is over 30%. You're pricing your products very effectively.";
    if (stats.totalExpenses > stats.totalRevenue) return "Watch out! Your expenses are currently higher than your revenue. Let's look at where we can cut costs.";
    if (stats.weeklySales > 0) return "You're making moves this week! Keep that momentum going to hit your monthly targets.";
    return "Ready to analyze your business? Sade is here to help you understand every kobo.";
  }, [stats]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-lg mx-auto">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-black text-charcoal font-display">Business Reports</h2>
          <p className="text-sm text-slate-gray font-medium italic">Powered by Sade's Insights</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="icon" className="rounded-2xl border-slate-200 shadow-sm w-11 h-11 bg-white">
            <FileSpreadsheet className="w-5 h-5 text-emerald" />
          </Button>
        </div>
      </div>

      <BrandMascot 
        message={sadeMessage}
        subMessage="Review your performance regularly to make better business decisions."
      />

      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card p-5 bg-white border border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-gray mb-1">Weekly Gross Profit</p>
          <h3 className="text-xl font-black text-charcoal">{formatNaira(stats.weeklyProfit)}</h3>
          <div className="flex items-center gap-1 mt-2 text-emerald">
            <ArrowUpRight size={12} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase">Good progress</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="premium-card p-5 bg-white border border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-gray mb-1">Profit Margin</p>
          <h3 className="text-xl font-black text-charcoal">{stats.margin.toFixed(1)}%</h3>
          <div className="flex items-center gap-1 mt-2 text-gold">
            <Target size={12} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase">Goal: 25%</span>
          </div>
        </motion.div>
      </div>

      <Card className="premium-card p-6 bg-white border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <TrendingUp size={120} className="text-emerald" />
        </div>
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald/10 p-2.5 rounded-2xl">
            <TrendingUp className="w-5 h-5 text-emerald" />
          </div>
          <h3 className="text-base font-black text-charcoal font-display uppercase tracking-widest text-[11px]">Revenue vs Gross Profit</h3>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F9D58" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0F9D58" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 700 }} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 700 }} tickFormatter={(val) => `₦${val / 1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '16px' }}
                itemStyle={{ fontWeight: 800, fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0F9D58" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" name="Gross Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="premium-card p-6 bg-white border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gold/10 p-2.5 rounded-2xl">
            <PieIcon className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h3 className="text-base font-black text-charcoal font-display uppercase tracking-widest text-[11px]">Top Selling Products</h3>
        </div>
        {productPerformance.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Sparkles className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-xs text-slate-gray font-bold uppercase tracking-widest">No sales data yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="total"
                    nameKey="name"
                  >
                    {productPerformance.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatNaira(val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {productPerformance.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-black text-charcoal truncate max-w-[150px] uppercase tracking-tight">{p.name}</span>
                  </div>
                  <span className="text-xs font-black text-emerald font-display">{formatNaira(p.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="premium-card p-6 bg-white border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-100 p-2.5 rounded-2xl">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-base font-black text-charcoal font-display uppercase tracking-widest text-[11px]">Expense Breakdown</h3>
        </div>
        {categoryPerformance.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Sparkles className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-xs text-slate-gray font-bold uppercase tracking-widest">No expenses logged</p>
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={10} width={80} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 10, 10, 0]} barSize={20} name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="premium-card p-6 bg-emerald text-white border-none shadow-premium overflow-hidden">
        <div className="absolute -bottom-6 -right-6 opacity-20 transform rotate-12">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10">
          <h3 className="text-lg font-black uppercase tracking-widest mb-4">Quick Summary</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Total Sales</p>
              <p className="text-3xl font-black">{sales.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Stock Value</p>
              <p className="text-lg font-black leading-tight">
                {formatNaira(inventory.reduce((acc, item) => acc + (item.unitCost * item.stockLevel), 0))}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
