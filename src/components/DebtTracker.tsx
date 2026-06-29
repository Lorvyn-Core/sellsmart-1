import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DebtRecord } from "@/types";
import { formatNaira } from "@/utils/formatters";
import { Users, Plus, CreditCard, CheckCircle2, History, Trash2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DebtTrackerProps {
  debts: DebtRecord[];
  onAddDebt: (debt: Omit<DebtRecord, "id">) => void;
  onUpdatePayment: (id: string, amount: number) => void;
  onDeleteDebt: (id: string) => void;
}

export function DebtTracker({ debts, onAddDebt, onUpdatePayment, onDeleteDebt }: DebtTrackerProps) {
  const [customerName, setCustomerName] = useState("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  
  const [paymentInput, setPaymentInput] = useState<{ [key: string]: string }>({});

  const handleAdd = () => {
    if (!customerName || totalAmount <= 0) return;
    
    const status = paidAmount >= totalAmount ? 'cleared' : (paidAmount > 0 ? 'partially_paid' : 'pending');
    
    onAddDebt({
      customerName,
      totalAmount,
      paidAmount,
      status,
      date: new Date().toISOString(),
      history: paidAmount > 0 ? [{ date: new Date().toISOString(), amount: paidAmount }] : []
    });

    setCustomerName("");
    setTotalAmount(0);
    setPaidAmount(0);
  };

  const totalOutstanding = debts.reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="premium-card bg-blue-600 border-none p-6 text-white shadow-xl shadow-blue-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users size={120} />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px] text-blue-100 uppercase tracking-[0.25em] font-black mb-2 opacity-80">Total Outstanding Debt</p>
              <h3 className="text-3xl font-black font-display">{formatNaira(totalOutstanding)}</h3>
              <p className="text-[10px] text-blue-100 font-bold mt-2 uppercase opacity-60">Collect your money, grow your shop</p>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>
      </motion.div>

      <Card className="premium-card p-6 bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 p-2.5 rounded-2xl">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-base font-black text-charcoal font-display uppercase tracking-widest text-[11px]">New Debt Record</h3>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-gray">Customer Name</Label>
              <Input
                className="bg-slate-50/80 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Sister Amina"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-gray">Total Debt (₦)</Label>
              <Input
                type="number"
                className="bg-slate-50/80 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                value={totalAmount || ""}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-gray">Deposit Paid (₦)</Label>
              <Input
                type="number"
                className="bg-slate-50/80 border-none rounded-2xl h-12 shadow-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                value={paidAmount || ""}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
          </div>
          <Button 
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.15em] shadow-lg shadow-blue-100 active:scale-95 transition-all" 
            onClick={handleAdd} 
            disabled={!customerName || totalAmount <= 0}
          >
            <Plus className="w-5 h-5 mr-2 stroke-[3px]" /> Track This Debt
          </Button>
        </div>
      </Card>

      <div className="space-y-5 px-1">
        <h3 className="text-base font-black text-charcoal font-display uppercase tracking-widest text-[11px]">Debt Tracking List</h3>
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {debts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm"
              >
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="text-blue-200" size={40} />
                </div>
                <h4 className="text-charcoal font-black text-base uppercase tracking-wider mb-2">No debts tracked</h4>
                <p className="text-slate-gray text-xs font-bold px-12 leading-relaxed opacity-60">
                  Tracking "Pay Small Small" ensures you never lose money. Let's record your first debt record!
                </p>
              </motion.div>
            ) : (
              debts.map((debt, idx) => {
                const balance = debt.totalAmount - debt.paidAmount;
                const progress = Math.min((debt.paidAmount / debt.totalAmount) * 100, 100);
                
                return (
                  <motion.div
                    key={debt.id}
                    layout
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx < 10 ? idx * 0.04 : 0 }}
                  >
                    <Card className={cn(
                      "premium-card overflow-hidden bg-white border border-slate-100 transition-all duration-500", 
                      debt.status === 'cleared' && 'opacity-60 bg-slate-50 border-emerald-100'
                    )}>
                      <CardContent className="p-5 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500", 
                              debt.status === 'cleared' ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
                            )}>
                              <Users size={24} className="stroke-[2.5px]" />
                            </div>
                            <div>
                              <h4 className="font-black text-charcoal leading-tight text-xs uppercase tracking-widest">{debt.customerName}</h4>
                              <p className="text-[10px] text-slate-gray font-black uppercase opacity-40 mt-1">Started: {format(new Date(debt.date), "MMM dd, yyyy")}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {debt.status === 'cleared' ? (
                              <span className="inline-flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-[0.15em]">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 stroke-[3px]" /> Cleared
                              </span>
                            ) : (
                              <div className="text-right">
                                <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-0.5">Owes You</p>
                                <p className="text-lg font-black text-red-600 leading-tight">
                                  {formatNaira(balance)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-gray/50">
                            <span>Payment Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden p-0.5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className={cn(
                                "h-full transition-all duration-1000 rounded-full", 
                                debt.status === 'cleared' ? "bg-emerald" : "bg-blue-500 shadow-sm shadow-blue-200"
                              )}
                            />
                          </div>
                        </div>

                        {debt.status !== 'cleared' && (
                          <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl">
                            <Input
                              type="number"
                              placeholder="Amount to pay"
                              className="h-12 bg-white border-none rounded-xl text-sm font-black shadow-sm focus:ring-2 focus:ring-blue-100 transition-all"
                              value={paymentInput[debt.id] || ""}
                              onChange={(e) => setPaymentInput({ ...paymentInput, [debt.id]: e.target.value })}
                            />
                            <Button 
                              size="sm" 
                              className="h-12 px-6 bg-charcoal hover:bg-black text-white font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all"
                              onClick={() => {
                                onUpdatePayment(debt.id, Number(paymentInput[debt.id]));
                                setPaymentInput({ ...paymentInput, [debt.id]: "" });
                              }}
                              disabled={!paymentInput[debt.id]}
                            >
                              Add
                            </Button>
                          </div>
                        )}

                        {debt.history.length > 0 && (
                          <div className="pt-2">
                            <p className="text-[9px] text-slate-gray font-black uppercase tracking-[0.2em] flex items-center mb-3 opacity-40">
                              <History className="w-3 h-3 mr-1.5 stroke-[3px]" /> Payment History
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {debt.history.slice(-3).reverse().map((h, i) => (
                                <motion.span 
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  key={i} 
                                  className="text-[10px] bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl font-black uppercase tracking-tight border border-slate-100"
                                >
                                  {formatNaira(h.amount)} • {format(new Date(h.date), "MMM d")}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end pt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onDeleteDebt(debt.id)} 
                            className="text-slate-200 hover:text-red-500 hover:bg-red-50 text-[10px] h-9 px-4 font-black uppercase tracking-widest rounded-xl active:scale-90 transition-all"
                          >
                            <Trash2 size={16} className="mr-1.5 stroke-[2.5px]" /> Delete Record
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
