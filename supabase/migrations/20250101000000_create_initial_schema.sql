-- ============================================================
-- SellSmart Initial Schema
-- Tables: inventory, sales, expenses, debts
-- Auth model: no_auth_public_read (anon access via RLS policies)
-- ============================================================

-- 1. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stock_level INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  unit_cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE SET DEFAULT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'other',
  description TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. DEBTS TABLE
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially_paid', 'cleared')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES (foreign keys + common query patterns)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON public.sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_debts_status ON public.debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_date ON public.debts(date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Auth model: no_auth_public_read
-- RLS is enabled; policies allow anon key access for all operations.
-- ============================================================
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Inventory policies
CREATE POLICY "Allow anon select on inventory"
  ON public.inventory FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on inventory"
  ON public.inventory FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on inventory"
  ON public.inventory FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete on inventory"
  ON public.inventory FOR DELETE TO anon USING (true);

-- Sales policies
CREATE POLICY "Allow anon select on sales"
  ON public.sales FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on sales"
  ON public.sales FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on sales"
  ON public.sales FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete on sales"
  ON public.sales FOR DELETE TO anon USING (true);

-- Expenses policies
CREATE POLICY "Allow anon select on expenses"
  ON public.expenses FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on expenses"
  ON public.expenses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on expenses"
  ON public.expenses FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete on expenses"
  ON public.expenses FOR DELETE TO anon USING (true);

-- Debts policies
CREATE POLICY "Allow anon select on debts"
  ON public.debts FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on debts"
  ON public.debts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on debts"
  ON public.debts FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete on debts"
  ON public.debts FOR DELETE TO anon USING (true);
