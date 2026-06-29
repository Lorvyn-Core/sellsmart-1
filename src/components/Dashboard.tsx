import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { formatNaira } from '@/utils/formatters';
import { Expense, Sale, InventoryItem, DebtRecord } from '@/types';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  ReceiptText, 
  Calculator, 
  BarChart3, 
  Plus,
  Activity,
  ArrowUpRight,
  AlertCircle,
  Lightbulb,
  Trophy,
  Flame,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppTab } from './Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { isSameDay, startOfMonth, isWithinInterval, subDays } from 'date-fns';
import { BrandMascot } from './BrandMascot';

interface DashboardProps {
  expenses: Expense[];
  sales: Sale[];
  inventory: InventoryItem[];
  debts: DebtRecord[];
  lastProfit?: number;
  onAction: (action: AppTab) => void;
}

const BUSINESS_TIPS = [
  "Always include delivery costs when pricing products.",
  "Track every expense, even transport money.",
  "Review your profit every week.",
  "Increase your prices gradually instead of selling at a loss.",
  "Profit is what remains after every single expense is removed.",
  "Consistency in record keeping is the secret to scaling.",
  "Understand your customers' buying patterns to stock better."
];

const CountUp: React.FC<{ value: number; prefix?: string; suffix?: string; decimals?: number }> = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {decimals > 0 
        ? displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : Math.floor(displayValue).toLocaleString()}
      {suffix}
    </span>
  );
};

const CircularProgress: React.FC<{ score: number; color: string }> = ({ score, color }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-100"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-charcoal">{Math.round(score)}</span>
        <span className="text-[10px] font-black text-slate-gray uppercase tracking-widest">/ 100</span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ expenses, sales, inventory, debts, onAction, lastProfit }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const today = new Date();
  const monthStart = startOfMonth(today);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % BUSINESS_TIPS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const todaySales = useMemo(() => sales
    .filter(s => isSameDay(new Date(s.date), today))
    .reduce((sum, s) => sum + (s.price * s.quantity), 0), [sales, today]);

  const monthlyProfit = useMemo(() => sales
    .filter(s => isWithinInterval(new Date(s.date), { start: monthStart, end: today }))
    .reduce((sum, s) => {
      const item = inventory.find(i => i.id === s.productId);
      const cost = item ? item.unitCost : 0;
      return sum + ((s.price - cost) * s.quantity);
    }, 0), [sales, inventory, monthStart, today]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const lowStockCount = inventory.filter(item => item.stockLevel <= item.minStockLevel).length;
  const totalDebt = debts.reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return { main: "Good Morning! ☀️", sub: "Let's make today productive." };
    if (hour < 17) return { main: "Good Afternoon! ☕", sub: "How's your business doing today?" };
    return { main: "Good Evening! 🌙", sub: "Time to review your progress." };
  };

  const salesStreak = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const day = subDays(today, i);
      const daySales = sales.some(s => isSameDay(new Date(s.date), day));
      if (daySales) streak++;
      else break;
    }
    return streak;
  }, [sales, today]);

  const totalRevenue = useMemo(() => sales.reduce((sum, s) => sum + (s.price * s.quantity), 0), [sales]);
  const totalGrossProfit = useMemo(() => sales.reduce((sum, s) => {
    const item = inventory.find(i => i.id === s.productId);
    const cost = item ? item.unitCost : 0;
    return sum + ((s.price - cost) * s.quantity);
  }, 0), [sales, inventory]);

  const healthScoreData = useMemo(() => {
    let profitPoints = 0;
    const margin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
    if (totalRevenue === 0) profitPoints = 0;
    else if (margin > 30) profitPoints = 40;
    else if (margin >= 20) profitPoints = 30;
    else if (margin >= 10) profitPoints = 20;
    else profitPoints = 10;

    let expensePoints = 0;
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
    if (totalRevenue > 0) {
      if (expenseRatio < 30) expensePoints = 30;
      else if (expenseRatio <= 50) expensePoints = 20;
      else if (expenseRatio <= 70) expensePoints = 10;
      else expensePoints = 0;
    } else {
      expensePoints = totalExpenses > 0 ? 0 : 30;
    }

    let debtPoints = 0;
    const debtRatio = totalRevenue > 0 ? (totalDebt / totalRevenue) * 100 : 0;
    if (totalDebt === 0) debtPoints = 20;
    else if (totalRevenue > 0) {
      if (debtRatio < 20) debtPoints = 15;
      else if (debtRatio <= 50) debtPoints = 10;
      else debtPoints = 0;
    } else {
      debtPoints = 0;
    }

    let consistencyPoints = 0;
    if (salesStreak >= 7) consistencyPoints = 10;
    else if (salesStreak >= 3) consistencyPoints = 7;
    else if (salesStreak >= 1) consistencyPoints = 4;
    else consistencyPoints = 0;

    const totalScore = profitPoints + expensePoints + debtPoints + consistencyPoints;

    const breakdowns = [
      { name: 'Profit Margin', score: profitPoints, max: 40, msg: "Your margins are tight. Try reducing costs or slightly increasing prices to boost profitability." },
      { name: 'Expense Control', score: expensePoints, max: 30, msg: "Your business expenses are eating into your revenue. Review your spending to keep more of what you earn." },
      { name: 'Debt Management', score: debtPoints, max: 20, msg: "High customer debt can stall your growth. Follow up with customers who owe you to keep cash flowing." },
      { name: 'Sales Consistency', score: consistencyPoints, max: 10, msg: "Recording sales regularly helps Sade give you better insights. Try to log something every day!" }
    ];
    
    const biggestLoss = [...breakdowns].sort((a, b) => (b.max - b.score) - (a.max - a.score))[0];

    let grade = "Growing";
    let color = "#D4AF37"; // Gold/Amber
    if (totalScore <= 40) {
      grade = "Needs Attention";
      color = "#DC2626"; // Red
    } else if (totalScore >= 71) {
      grade = "Thriving";
      color = "#0F9D58"; // Emerald
    }

    return { totalScore, grade, color, comment: biggestLoss.msg };
  }, [totalRevenue, totalGrossProfit, totalExpenses, totalDebt, salesStreak]);

  const achievements = [
    { title: "7-Day Streak", icon: Flame, color: "text-orange-500", achieved: salesStreak >= 7 },
    { title: "₦100k Club", icon: Trophy, color: "text-gold", achieved: totalRevenue >= 100000 },
    { title: "Profit Master", icon: Star, color: "text-emerald", achieved: monthlyProfit > 50000 },
    { title: "Expense Pro", icon: ReceiptText, color: "text-blue-500", achieved: expenses.length >= 10 },
  ];

  const metricCards = [
    {
      title: "Today's Sales",
      value: todaySales,
      prefix: "₦",
      subtitle: todaySales === 0 ? "Add your first sale today" : "Daily revenue",
      icon: ShoppingCart,
      variant: 'emerald',
      className: "gradient-emerald text-white"
    },
    {
      title: "Monthly Gross Profit",
      value: monthlyProfit,
      prefix: "₦",
      subtitle: monthlyProfit === 0 ? "Tracking profit helps you grow" : "This month's gain",
      icon: TrendingUp,
      variant: 'teal',
      className: "gradient-teal text-white"
    },
    {
      title: "Expenses",
      value: totalExpenses,
      prefix: "₦",
      subtitle: totalExpenses === 0 ? "No expenses logged yet" : "Business costs",
      icon: ReceiptText,
      accentColor: "bg-red-500",
      iconColor: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      title: "Customer Debts",
      value: totalDebt,
      prefix: "₦",
      subtitle: totalDebt === 0 ? "No outstanding debts" : "Pending payments",
      icon: Users,
      accentColor: "bg-blue-500",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50"
    }
  ];

  const quickActions = [
    { id: 'sales' as AppTab, label: 'New Sale', icon: Plus, color: 'emerald', iconColor: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    { id: 'expenses' as AppTab, label: 'New Expense', icon: ReceiptText, color: 'red', iconColor: 'text-red-600', bgColor: 'bg-red-100' },
    { id: 'inventory' as AppTab, label: 'Add Stock', icon: Package, color: 'indigo', iconColor: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    { id: 'debt' as AppTab, label: 'Track Debt', icon: Users, color: 'blue', iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'breakeven' as AppTab, label: 'Calculator', icon: Calculator, color: 'teal', iconColor: 'text-teal-600', bgColor: 'bg-teal-100' },
    { id: 'analytics' as AppTab, label: 'Reports', icon: BarChart3, color: 'gold', iconColor: 'text-[#D4AF37]', bgColor: 'bg-[#D4AF37]/10' },
  ];

  const greeting = getGreeting();

  const insights = useMemo(() => {
    const list = [];
    if (todaySales > 0) {
      list.push("You've recorded sales today! Great job staying consistent.");
    } else {
      list.push("No sales recorded today yet. Sade is rooting for you!");
    }

    if (monthlyProfit > 0) {
      const bestProduct = [...sales].sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))[0];
      if (bestProduct) {
        list.push(`${bestProduct.productName} is your top performer this month.`);
      }
    }

    if (totalDebt > 50000) {
      list.push("Your customer debt is growing. Remember to follow up on payments.");
    }

    return list;
  }, [todaySales, monthlyProfit, sales, totalDebt]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-lg mx-auto">
      <header className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-black text-charcoal tracking-tight">{greeting.main}</h2>
          <p className="text-slate-gray text-sm font-medium">{greeting.sub}</p>
        </div>
      </header>

      <BrandMascot 
        message={todaySales === 0 ? "Welcome! Let's record your first sale today to track your progress." : "Your business is looking healthy! Keep recording those sales."}
        subMessage={insights[0]}
      />

      {lowStockCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-100 p-5 rounded-3xl flex items-center gap-4 shadow-sm"
        >
          <div className="bg-red-100 p-2.5 rounded-2xl">
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-red-900 uppercase tracking-wider">Low Stock Alert</p>
            <p className="text-xs text-red-700 font-medium">{lowStockCount} items need restocking soon.</p>
          </div>
          <button 
            onClick={() => onAction('inventory')}
            className="text-xs font-black text-red-600 uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-transform"
          >
            Fix Now
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-5">
        <div className="grid grid-cols-2 gap-4">
          {metricCards.slice(0, 2).map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ translateY: -4 }}
              className={cn(
                "premium-card relative overflow-hidden group p-5",
                card.className
              )}
            >
              <div className="flex flex-col h-full justify-between gap-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowUpRight size={16} className="text-white/50" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">
                    {card.title}
                  </p>
                  <h3 className="text-xl font-black text-white leading-tight">
                    {card.value === 0 ? (
                      <span className="text-sm opacity-60">No data</span>
                    ) : (
                      <CountUp value={card.value} prefix={card.prefix} />
                    )}
                  </h3>
                  <p className="text-[10px] text-white/60 font-medium mt-1">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="premium-card p-6 bg-white border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald/10 p-2.5 rounded-2xl">
              <Activity className="w-5 h-5 text-emerald" />
            </div>
            <h3 className="text-base font-black text-charcoal font-display uppercase tracking-widest text-[11px]">Business Health Score</h3>
          </div>

          <div className="flex flex-col items-center">
            <CircularProgress score={healthScoreData.totalScore} color={healthScoreData.color} />
            
            <div className="mt-4 text-center">
              <span 
                className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                style={{ 
                  borderColor: `${healthScoreData.color}33`, 
                  color: healthScoreData.color,
                  backgroundColor: `${healthScoreData.color}11`
                }}
              >
                {healthScoreData.grade}
              </span>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 w-full">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                  <img 
                    src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/90d544cf-dc81-48c5-bdc7-0f4cb3fb00a8/sade---brand-mascot-8e4670b1-1782482460764.webp"
                    alt="Sade"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-gray uppercase tracking-widest">Sade's Insight</p>
                  <p className="text-sm font-bold text-charcoal leading-relaxed">
                    {healthScoreData.comment}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {metricCards.slice(2, 4).map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (0.1 * idx) }}
              whileHover={{ translateY: -4 }}
              className="premium-card p-5 bg-white border border-slate-100"
            >
              <div className="flex flex-col h-full justify-between gap-4">
                <div className="flex justify-between items-start">
                  <div className={cn("p-2 rounded-xl", card.bgColor)}>
                    <card.icon className={cn("w-5 h-5", card.iconColor)} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-gray mb-1">
                    {card.title}
                  </p>
                  <h3 className="text-xl font-black text-charcoal leading-tight">
                    {card.value === 0 ? (
                      <span className="text-sm text-slate-300">No data</span>
                    ) : (
                      <CountUp value={card.value} prefix={card.prefix} />
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-gray/60 font-medium mt-1">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-charcoal px-1 flex items-center gap-2 uppercase tracking-widest text-[11px]">
          <Star size={14} className="text-gold" /> Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "p-3 rounded-2xl flex flex-col items-center gap-2 text-center border shadow-sm transition-all duration-300",
                item.achieved ? "bg-white border-gold/20" : "bg-slate-50/50 border-slate-100 opacity-50 grayscale"
              )}
            >
              <div className={cn("p-2 rounded-full", item.achieved ? "bg-gold/10" : "bg-slate-100")}>
                <item.icon size={18} className={item.achieved ? item.color : "text-slate-400"} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter text-charcoal leading-tight">
                {item.title}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <h3 className="text-lg font-black text-charcoal px-1 flex justify-between items-center uppercase tracking-widest text-[11px]">
          Quick Actions <span className="w-12 h-1 bg-emerald/10 rounded-full" />
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action, idx) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (idx * 0.05) }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onAction(action.id)}
              className="action-card text-center"
            >
              <div className={cn("w-14 h-14 rounded-3xl flex items-center justify-center mb-1 shadow-sm", action.bgColor)}>
                <action.icon className={cn("w-7 h-7", action.iconColor)} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-black text-charcoal leading-tight tracking-tight uppercase">
                {action.label.split(' ')[0]}<br/>{action.label.split(' ')[1] || ''}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tipIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-emerald/5 p-6 rounded-3xl border border-emerald/10 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Lightbulb size={48} className="text-emerald" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-emerald/10 p-2.5 rounded-2xl">
              <Lightbulb className="text-emerald" size={24} />
            </div>
            <div>
              <h4 className="font-black text-emerald text-[10px] uppercase tracking-[0.2em] mb-1">Business Tip from Sade</h4>
              <p className="text-emerald-900 text-sm font-bold leading-relaxed italic">
                "{BUSINESS_TIPS[tipIndex]}"
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="pb-10" />
    </div>
  );
};
