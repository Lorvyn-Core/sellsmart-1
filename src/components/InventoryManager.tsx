import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/types";
import { formatNaira } from "@/utils/formatters";
import { Package, Plus, Trash2, AlertTriangle, Search, Minus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface InventoryManagerProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, "id">) => void;
  onDeleteItem: (id: string) => void;
  onUpdateStock: (id: string, newLevel: number) => void;
}

export function InventoryManager({ items, onAddItem, onDeleteItem, onUpdateStock }: InventoryManagerProps) {
  const [name, setName] = useState("");
  const [stockLevel, setStockLevel] = useState<number>(0);
  const [minStockLevel, setMinStockLevel] = useState<number>(5);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [search, setSearch] = useState("");

  const handleAdd = () => {
    if (!name) return;
    onAddItem({ name, stockLevel, minStockLevel, unitCost });
    setName("");
    setStockLevel(0);
    setUnitCost(0);
    setMinStockLevel(5);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = items.filter(item => item.stockLevel <= item.minStockLevel);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-lg mx-auto">
      <div className="px-1">
        <h2 className="text-2xl font-black text-charcoal font-display tracking-tight">Stock Management</h2>
        <p className="text-sm text-slate-gray font-medium">Never run out of your best-sellers.</p>
      </div>

      <AnimatePresence mode="wait">
        {lowStockItems.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="premium-card bg-red-50 border-none p-5 shadow-sm border-red-100 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-2 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-red-900 uppercase tracking-widest leading-none mb-1">Restock Required</p>
                  <p className="text-xs text-red-700 font-bold opacity-70">
                    {lowStockItems.length} item(s) are below your safe stock level.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="premium-card p-6 bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-100 p-2.5 rounded-2xl">
            <Package className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-base font-black text-charcoal font-display uppercase tracking-widest text-[11px]">Add New Product</h3>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-gray">Product Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
                placeholder="e.g. Lavender Perfume"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-gray">Unit Cost (₦)</Label>
              <Input
                type="number"
                value={unitCost || ""}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-gray">Initial Stock</Label>
              <Input
                type="number"
                value={stockLevel || ""}
                onChange={(e) => setStockLevel(Number(e.target.value))}
                className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-gray">Alert Level</Label>
              <Input
                type="number"
                value={minStockLevel || ""}
                onChange={(e) => setMinStockLevel(Number(e.target.value))}
                className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
                placeholder="5"
              />
            </div>
          </div>
          <Button 
            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.15em] shadow-lg shadow-indigo-100 active:scale-95 transition-all" 
            onClick={handleAdd} 
            disabled={!name}
          >
            <Plus className="w-5 h-5 mr-2 stroke-[3px]" /> Add to Inventory
          </Button>
        </div>
      </Card>

      <div className="space-y-5 px-1">
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-black text-charcoal font-display uppercase tracking-widest text-[11px]">Product Inventory</h3>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
            <Input
              placeholder="Search products..."
              className="pl-11 bg-white border-slate-100 rounded-2xl h-12 shadow-sm focus:ring-2 focus:ring-indigo-50/50 transition-all font-bold border-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm"
              >
                <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="text-indigo-200" size={40} />
                </div>
                <h4 className="text-charcoal font-black text-base uppercase tracking-wider mb-2">Inventory is empty</h4>
                <p className="text-slate-gray text-xs font-bold px-12 leading-relaxed opacity-60">
                  Keeping a tight inventory is key to a profitable business. Add your first product to get started!
                </p>
              </motion.div>
            ) : (
              filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx < 10 ? idx * 0.03 : 0 }}
                >
                  <Card className="premium-card overflow-hidden bg-white border border-slate-100 group">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                            <Package size={24} className="stroke-[2.5px]" />
                          </div>
                          <div>
                            <h4 className="font-black text-charcoal leading-tight text-xs uppercase tracking-widest">{item.name}</h4>
                            <p className="text-[10px] text-slate-gray font-black opacity-40 uppercase tracking-widest mt-1">Cost: {formatNaira(item.unitCost)}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDeleteItem(item.id)} 
                          className="text-slate-200 hover:text-red-500 hover:bg-red-50 h-10 w-10 rounded-xl active:scale-90 transition-all"
                        >
                          <Trash2 className="w-5 h-5 stroke-[2.5px]" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "px-4 py-1.5 rounded-full flex items-center gap-2",
                            item.stockLevel <= item.minStockLevel ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                          )}>
                            <span className="text-xs font-black uppercase tracking-widest">{item.stockLevel} In Stock</span>
                            {item.stockLevel <= item.minStockLevel && <AlertTriangle className="w-4 h-4 animate-pulse" />}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm text-charcoal transition-all active:scale-90" 
                            onClick={() => onUpdateStock(item.id, Math.max(0, item.stockLevel - 1))}
                          >
                            <Minus className="w-4 h-4 stroke-[3px]" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm text-charcoal transition-all active:scale-90" 
                            onClick={() => onUpdateStock(item.id, item.stockLevel + 1)}
                          >
                            <Plus className="w-4 h-4 stroke-[3px]" />
                          </Button>
                        </div>
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
