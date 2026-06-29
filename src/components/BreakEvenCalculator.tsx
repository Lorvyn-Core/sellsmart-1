import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/utils/formatters";
import { Calculator, Sparkles, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandMascot } from "./BrandMascot";

export function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState<number>(0);
  const [variableCost, setVariableCost] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  
  const [result, setResult] = useState<{ units: number; revenue: number } | null>(null);

  const calculate = () => {
    const contributionMargin = sellingPrice - variableCost;
    if (contributionMargin <= 0) {
      return;
    }
    const units = Math.ceil(fixedCosts / contributionMargin);
    const revenue = units * sellingPrice;
    setResult({ units, revenue });
  };

  const sadeMessage = useMemo(() => {
    if (result && result.units > 100) return `You need to sell ${result.units} units to break even. This is a high target! Let's see if we can reduce your variable costs.`;
    if (result) return `To cover your fixed costs of ${formatNaira(fixedCosts)}, you only need to sell ${result.units} units. You can do this!`;
    return "The break-even point is where you start making real profit. Let's find yours.";
  }, [result, fixedCosts]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-lg mx-auto">
      <div className="px-1">
        <h2 className="text-2xl font-black text-charcoal font-display tracking-tight">Break-even Point</h2>
        <p className="text-sm text-slate-gray font-medium italic">Know your survival targets</p>
      </div>

      <BrandMascot message={sadeMessage} />

      <Card className="premium-card p-6 bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-teal-100 p-2.5 rounded-2xl">
            <Target className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="text-base font-black text-charcoal font-display uppercase tracking-widest text-[11px]">Survival Math</h3>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">Fixed Costs (Rent, Salaries, etc) (₦)</Label>
            <Input
              type="number"
              className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all font-bold"
              value={fixedCosts || ""}
              onChange={(e) => setFixedCosts(Number(e.target.value))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">Variable Cost per Unit (₦)</Label>
            <Input
              type="number"
              className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all font-bold"
              value={variableCost || ""}
              onChange={(e) => setVariableCost(Number(e.target.value))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">Selling Price per Unit (₦)</Label>
            <Input
              type="number"
              className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all font-bold"
              value={sellingPrice || ""}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              placeholder="0.00"
            />
            {sellingPrice > 0 && variableCost > 0 && sellingPrice <= variableCost && (
              <p className="text-[10px] text-red-500 font-bold italic mt-1">Selling price must be higher than variable cost to calculate.</p>
            )}
          </div>
          <Button 
            className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-[0.15em] shadow-lg shadow-teal-100 active:scale-95 transition-all" 
            onClick={calculate}
            disabled={sellingPrice <= variableCost}
          >
            Calculate Point
          </Button>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            <Card className="gradient-teal text-white border-none overflow-hidden relative shadow-xl shadow-teal-100 p-8 rounded-[2.5rem]">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Sparkles size={100} />
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/20 pb-6">
                  <div>
                    <p className="text-[10px] opacity-70 uppercase font-black tracking-[0.2em] mb-1">Target Units</p>
                    <p className="text-4xl font-black">{result.units} units</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-sm">
                    <Target className="text-white" size={32} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] opacity-70 uppercase font-black tracking-[0.2em] mb-1">Break-even Revenue</p>
                    <p className="text-2xl font-black text-white">{formatNaira(result.revenue)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-sm font-bold text-charcoal leading-relaxed">
                "You need to sell <span className="text-teal-600 font-black">{result.units} items</span> to pay for your overheads. Everything you sell after this is <span className="text-emerald font-black underline decoration-2 underline-offset-4">pure profit</span>!"
              </p>
              <p className="text-[10px] text-slate-gray font-black uppercase tracking-widest mt-4 opacity-40">Sade's Survival Tip</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
