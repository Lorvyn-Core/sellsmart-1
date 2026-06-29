import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sale, InventoryItem } from "@/types";
import { formatNaira } from "@/utils/formatters";
import { ShoppingCart, Plus, Calendar as CalendarIcon, Trash2, Sparkles } from "lucide-react";
import { format, startOfDay, startOfWeek, startOfMonth, isWithinInterval } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface SalesTrackerProps {
  sales: Sale[];
  inventory: InventoryItem[];
  onAddSale: (sale: Omit<Sale, "id">) => void;
  onDeleteSale: (id: string) => void;
}

export function SalesTracker({ sales, inventory, onAddSale, onDeleteSale }: SalesTrackerProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const handleAdd = () => {
    const product = inventory.find(p => p.id === selectedProductId);
    if (!product) return;

    onAddSale({
      productId: selectedProductId,
      productName: product.name,
      quantity,
      price,
      date,
    });
    
    setQuantity(1);
    setPrice(0);
    setSelectedProductId("");
  };

  const calculateRevenue = (period: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    let start: Date;

    if (period === 'daily') start = startOfDay(now);
    else if (period === 'weekly') start = startOfWeek(now);
    else start = startOfMonth(now);

    return sales
      .filter(s => {
        const saleDate = new Date(s.date);
        return isWithinInterval(saleDate, { start, end: now });
      })
      .reduce((acc, s) => acc + (s.price * s.quantity), 0);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-lg mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="premium-card gradient-emerald text-white p-5 border-none">
            <div className="space-y-1">
              <p className="text-[10px] opacity-80 uppercase tracking-[0.2em] font-black">Today's Revenue</p>
              <h3 className="text-2xl font-black">{formatNaira(calculateRevenue('daily'))}</h3>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="premium-card gradient-teal text-white p-5 border-none">
            <div className="space-y-1">
              <p className="text-[10px] opacity-80 uppercase tracking-[0.2em] font-black">This Week</p>
              <h3 className="text-2xl font-black">{formatNaira(calculateRevenue('weekly'))}</h3>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="premium-card bg-indigo text-white p-5 border-none">
            <div className="space-y-1">
              <p className="text-[10px] opacity-80 uppercase tracking-[0.2em] font-black">This Month</p>
              <h3 className="text-2xl font-black">{formatNaira(calculateRevenue('monthly'))}</h3>
            </div>
          </Card>
        </motion.div>
      </div>

      <Card className="premium-card p-6 bg-white border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald/10 p-2.5 rounded-2xl">
            <ShoppingCart className="w-5 h-5 text-emerald" />
          </div>
          <h3 className="text-base font-black text-charcoal font-display uppercase tracking-widest text-[11px]">Record New Sale</h3>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-gray">Select Product</Label>
              <Select value={selectedProductId} onValueChange={(val) => {
                setSelectedProductId(val);
                const p = inventory.find(item => item.id === val);
                if (p) setPrice(p.unitCost * 1.2); 
              }}>
                <SelectTrigger className="bg-slate-50/80 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-emerald/20 transition-all">
                  <SelectValue placeholder="Which item was sold?" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.length === 0 ? (
                    <div className="p-4 text-center text-xs font-bold text-slate-gray italic">No products in inventory yet</div>
                  ) : (
                    inventory.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.stockLevel} left)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-gray">Sale Date</Label>
              <div className="relative group">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald transition-colors pointer-events-none" />
                <Input
                  type="date"
                  className="pl-11 bg-slate-50/80 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-emerald/20 transition-all"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-gray">Quantity Sold</Label>
              <Input
                type="number"
                className="bg-slate-50/80 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-emerald/20 transition-all font-bold"
                value={quantity || ""}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-gray">Price per Unit (₦)</Label>
              <Input
                type="number"
                className="bg-slate-50/80 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-emerald/20 transition-all font-bold"
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="0.00"
              />
              {selectedProductId && (
                <p className="text-[10px] font-bold text-emerald mt-1 animate-in fade-in slide-in-from-top-1">
                  Auto-filled from cost price — adjust to your actual selling price.
                </p>
              )}
            </div>
          </div>
          <Button 
            className="w-full h-14 rounded-2xl bg-emerald hover:bg-emerald/90 text-white font-black uppercase tracking-[0.15em] shadow-lg shadow-emerald/20 active:scale-95 transition-all" 
            onClick={handleAdd} 
            disabled={!selectedProductId || quantity <= 0 || price <= 0}
          >
            <Plus className="w-5 h-5 mr-2 stroke-[3px]" /> Record Sale
          </Button>
        </div>
      </Card>

      <div className="space-y-5">
        <h3 className="text-base font-black text-charcoal font-display uppercase tracking-widest text-[11px] px-1">Recent Sales Activity</h3>
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {sales.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-slate-200 shadow-sm"
              >
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="text-slate-300" size={32} />
                </div>
                <h4 className="text-charcoal font-black text-sm uppercase tracking-wider mb-1">No sales recorded yet</h4>
                <p className="text-slate-gray text-xs font-medium px-8 leading-relaxed">
                  Start tracking your business growth by adding your first sale today!
                </p>
              </motion.div>
            ) : (
              [...sales].reverse().map((sale, idx) => (
                <motion.div
                  key={sale.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx < 5 ? idx * 0.05 : 0 }}
                >
                  <Card className="premium-card overflow-hidden bg-white border border-slate-100 group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald group-hover:scale-110 transition-transform">
                          <ShoppingCart size={20} className="stroke-[2.5px]" />
                        </div>
                        <div>
                          <h4 className="font-black text-charcoal leading-tight uppercase tracking-tight text-xs">{sale.productName}</h4>
                          <p className="text-[10px] text-slate-gray font-bold mt-0.5">
                            {sale.quantity} units • {format(new Date(sale.date), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-slate-gray/50 mb-0.5 tracking-widest">Total</p>
                          <p className="text-sm font-black text-emerald">{formatNaira(sale.price * sale.quantity)}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDeleteSale(sale.id)} 
                          className="text-slate-200 hover:text-red-500 hover:bg-red-50 h-9 w-9 rounded-xl active:scale-90 transition-all"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.5px]" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
