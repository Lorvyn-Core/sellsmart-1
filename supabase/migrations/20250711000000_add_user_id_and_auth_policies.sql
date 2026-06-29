-- ============================================================
-- Add user_id column to all tables for authenticated access
-- Add authenticated user RLS policies
-- ============================================================

-- 1. Add user_id columns (nullable for backward compatibility)
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create indexes on user_id for performance
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);

-- 3. Create authenticated user RLS policies
-- Users can only access their own data

-- Inventory: authenticated user policies
CREATE POLICY "Authenticated users can select own inventory"
  ON public.inventory FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can insert own inventory"
  ON public.inventory FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated users can update own inventory"
  ON public.inventory FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated users can delete own inventory"
  ON public.inventory FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Sales: authenticated user policies
CREATE POLICY "Authenticated users can select own sales"
  ON public.sales FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can insert own sales"
  ON public.sales FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated users can update own sales"
  ON public.sales FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated users can delete own sales"
  ON public.sales FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Expenses: authenticated user policies
CREATE POLICY "Authenticated users can select own expenses"
  ON public.expenses FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can insert own expenses"
  ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated users can update own expenses"
  ON public.expenses FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated users can delete own expenses"
  ON public.expenses FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Debts: authenticated user policies
CREATE POLICY "Authenticated users can select own debts"
  ON public.debts FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can insert own debts"
  ON public.debts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated users can update own debts"
  ON public.debts FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated users can delete own debts"
  ON public.debts FOR DELETE TO authenticated
  USING (user_id = auth.uid());
