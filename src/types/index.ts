export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface ProfitCalculation {
  productName: string;
  quantity: number;
  stockCost: number;
  deliveryCost: number;
  otherExpenses: number;
  desiredProfitPercent: number;
}

export interface ProfitResult {
  totalInvestment: number;
  costPerItem: number;
  recommendedSellingPrice: number;
  expectedProfit: number;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  date: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stockLevel: number;
  minStockLevel: number;
  unitCost: number;
}

export interface DebtRecord {
  id: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partially_paid' | 'cleared';
  date: string;
  history: { date: string; amount: number }[];
}

export interface BreakEvenResult {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
}
