import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatNaira } from '@/utils/formatters';
import { ProfitCalculation, ProfitResult } from '@/types';
import { Calculator, RefreshCcw, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandMascot } from './BrandMascot';

interface ProfitCalculatorProps {
  onResult?: (result: ProfitResult) => void;
  initialInputs?: ProfitCalculation | null;
  onInputsChange?: (inputs: ProfitCalculation) => void;
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ onResult, initialInputs, onInputsChange }) => {
  const [inputs, setInputs] = useState<ProfitCalculation>(initialInputs || {
    productName: '',
    quantity: 1,
    stockCost: 0,
    deliveryCost: 0,
    otherExpenses: 0,
    desiredProfitPercent: 20,
  });

  const result = useMemo(() => {
    const totalInvestment = inputs.stockCost + inputs.deliveryCost + inputs.otherExpenses;
    const costPerItem = inputs.quantity > 0 ? totalInvestment / inputs.quantity : 0;
    
    const profitDecimal = inputs.desiredProfitPercent / 100;
    const recommendedSellingPrice = profitDecimal < 1 
      ? costPerItem / (1 - profitDecimal) 
      : costPerItem * (1 + (inputs.desiredProfitPercent / 100));
    
    const expectedProfit = (recommendedSellingPrice * inputs.quantity) - totalInvestment;

    return {
      totalInvestment,
      costPerItem,
      recommendedSellingPrice,
      expectedProfit,
    };
  }, [inputs]);

  useEffect(() => {
    if (onResult) onResult(result);
  }, [result, onResult]);

  useEffect(() => {
    if (onInputsChange) onInputsChange(inputs);
  }, [inputs, onInputsChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const reset = () => {
    setInputs({
      productName: '',
      quantity: 1,
      stockCost: 0,
      deliveryCost: 0,
      otherExpenses: 0,
      desiredProfitPercent: 20,
    });
  };

  const sadeMessage = useMemo(() => {
    if (inputs.desiredProfitPercent < 15) return "Your margin is a bit low. Most successful retailers aim for at least 20-30% to cover unexpected costs.";
    if (inputs.desiredProfitPercent > 50) return "High profit margin! Make sure your customers see the premium value in your products.";
    return "Let's price your products for real growth. Don't forget to include delivery and packaging costs!";
  }, [inputs.desiredProfitPercent]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-lg mx-auto">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl font-black text-charcoal font-display tracking-tight">Profit Calculator</h2>
          <p className="text-sm text-slate-gray font-medium italic">Price with confidence</p>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-slate-gray hover:text-emerald hover:bg-emerald/5 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
          <RefreshCcw size={14} className="mr-1.5 stroke-[3px]" />
          Reset
        </Button>
      </div>

      <BrandMascot message={sadeMessage} />

      <Card className="premium-card p-6 bg-white border border-slate-100 shadow-sm">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">Product Name</Label>
            <Input
              name="productName"
              className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-bold"
              placeholder="e.g. Luxury Hair Bundle"
              value={inputs.productName}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">Quantity</Label>
              <Input
                name="quantity"
                type="number"
                className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-bold"
                value={inputs.quantity}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">Profit Margin (%)</Label>
              <Input
                name="desiredProfitPercent"
                type="number"
                className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-black text-emerald"
                value={inputs.desiredProfitPercent}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">Total Stock Cost (₦)</Label>
            <Input
              name="stockCost"
              type="number"
              className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-bold"
              value={inputs.stockCost || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">Delivery (₦)</Label>
              <Input
                name="deliveryCost"
                type="number"
                className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-bold"
                value={inputs.deliveryCost || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">Other (₦)</Label>
              <Input
                name="otherExpenses"
                type="number"
                className="bg-slate-50 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-bold"
                value={inputs.otherExpenses || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <Card className="premium-card p-4 border-none bg-white shadow-sm">
                <p className="text-[10px] text-slate-gray uppercase font-black tracking-widest mb-1 opacity-50">Total Investment</p>
                <p className="text-base font-black text-charcoal">{formatNaira(result.totalInvestment)}</p>
              </Card>
              <Card className="premium-card p-4 border-none bg-white shadow-sm">
                <p className="text-[10px] text-slate-gray uppercase font-black tracking-widest mb-1 opacity-50">Cost Per Item</p>
                <p className="text-base font-black text-charcoal">{formatNaira(result.costPerItem)}</p>
              </Card>
            </div>

            <Card className="gradient-emerald text-white border-none overflow-hidden relative shadow-xl shadow-emerald-100 p-8 rounded-[2.5rem]">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Sparkles size={100} />
              </div>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] opacity-80 uppercase font-black tracking-[0.25em] mb-2">Recommended Price</p>
                  <p className="text-5xl font-black tracking-tighter">{formatNaira(result.recommendedSellingPrice)}</p>
                  <p className="text-[10px] opacity-60 mt-2 uppercase tracking-widest font-bold italic">Selling price per item</p>
                </div>
                <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-sm">
                  <Calculator className="text-white" size={32} strokeWidth={2.5} />
                </div>
              </div>
              
              <div className="pt-8 border-t border-white/20 flex justify-between items-center">
                <div>
                  <p className="text-[10px] opacity-70 uppercase font-black tracking-widest mb-1">Total Expected Profit</p>
                  <p className="text-2xl font-black text-white">{formatNaira(result.expectedProfit)}</p>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm flex items-center gap-2">
                  <TrendingUp size={16} className="text-white stroke-[3px]" />
                  <span className="text-xs font-black uppercase tracking-tight">{inputs.desiredProfitPercent}% Margin</span>
                </div>
              </div>
            </Card>
            
            <p className="text-[10px] text-slate-gray text-center font-bold italic px-8 leading-relaxed opacity-60 uppercase tracking-tight">
              *Successful business owners always price for profit. Sade believes in your growth!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
