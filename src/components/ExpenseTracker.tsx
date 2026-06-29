import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatNaira, formatDate } from '@/utils/formatters';
import { Expense } from '@/types';
import { Plus, Trash2, ReceiptText, Tag, Calendar as CalendarIcon, Search, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpenseTrackerProps {
  expenses: Expense[];
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = ['Stock', 'Rent', 'Transport', 'Utilities', 'Marketing', 'Salary', 'Others'];

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ expenses, onAdd, onDelete }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    amount: 0,
    category: 'Others',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAdd = () => {
    if (newExpense.amount <= 0 || !newExpense.description) return;
    onAdd(newExpense);
    setNewExpense({
      amount: 0,
      category: 'Others',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsAddModalOpen(false);
  };

  const filteredExpenses = expenses
    .filter(exp => 
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      exp.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-lg mx-auto">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl font-black text-charcoal font-display tracking-tight">Business Expenses</h2>
          <p className="text-sm text-slate-gray font-medium">Keep track of every kobo spent.</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-2xl h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest shadow-lg shadow-red-100 active:scale-95 transition-all">
              <Plus size={20} className="mr-2 stroke-[3px]" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-8 bg-white/95 backdrop-blur-xl">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-display font-black text-2xl text-charcoal tracking-tight">New Expense</DialogTitle>
              <p className="text-xs text-slate-gray font-bold uppercase tracking-widest mt-1">Recording is the first step to profit</p>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">Amount Spent (₦)</Label>
                <Input
                  type="number"
                  className="bg-slate-50 border-none rounded-2xl h-14 text-lg font-black shadow-none focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">Category</Label>
                <Select 
                  value={newExpense.category} 
                  onValueChange={(val) => setNewExpense({ ...newExpense, category: val })}
                >
                  <SelectTrigger className="bg-slate-50 border-none rounded-2xl h-14 shadow-none focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-bold">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">What was this for?</Label>
                <Input
                  className="bg-slate-50 border-none rounded-2xl h-14 shadow-none focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-bold"
                  placeholder="e.g. Fuel for generator"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-gray">Date</Label>
                <Input
                  type="date"
                  className="bg-slate-50 border-none rounded-2xl h-14 shadow-none focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-bold"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button 
                onClick={handleAdd} 
                className="w-full h-14 rounded-2xl bg-charcoal hover:bg-black text-white font-black uppercase tracking-[0.15em] shadow-xl shadow-slate-200 active:scale-95 transition-all"
              >
                Save Expense Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative group px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors pointer-events-none" size={20} />
        <Input 
          className="pl-12 bg-white border-slate-100 h-14 rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-red-50/50 transition-all font-bold border-none" 
          placeholder="Find an expense..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4 px-1">
        <AnimatePresence mode="popLayout">
          {filteredExpenses.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm"
            >
              <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ReceiptText className="text-red-200" size={40} />
              </div>
              <h4 className="text-charcoal font-black text-base uppercase tracking-wider mb-2">No expenses yet</h4>
              <p className="text-slate-gray text-xs font-bold px-12 leading-relaxed opacity-60">
                Understanding your real profit starts with tracking every expense. Let's record your first one!
              </p>
            </motion.div>
          ) : (
            filteredExpenses.map((expense, idx) => (
              <motion.div
                key={expense.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx < 8 ? idx * 0.04 : 0 }}
              >
                <Card className="premium-card overflow-hidden bg-white border border-slate-100 hover:border-red-100/50 group">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <Tag size={22} className="stroke-[2.5px]" />
                      </div>
                      <div>
                        <h4 className="font-black text-charcoal leading-tight text-xs uppercase tracking-tight">{expense.description}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] bg-red-100/50 text-red-700 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest">
                            {expense.category}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-gray font-black uppercase opacity-40">
                            <CalendarIcon size={12} strokeWidth={3} />
                            {formatDate(expense.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-black text-charcoal text-base">{formatNaira(expense.amount)}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl active:scale-90"
                        onClick={() => onDelete(expense.id)}
                      >
                        <Trash2 size={20} strokeWidth={2.5} />
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
  );
};
