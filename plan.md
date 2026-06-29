# Implementation Plan: Business Health Score & Dashboard Enhancements

This plan details the implementation of a "Business Health Score" card on the Dashboard, presented as a personal report card from Sade.

## Scope Summary
- **Business Health Score Calculation**:
  - Profit Margin (up to 40 pts)
  - Expense Control (up to 30 pts)
  - Debt Management (up to 20 pts)
  - Sales Consistency (up to 10 pts)
- **Dashboard UI Integration**:
  - Large circular progress indicator.
  - Dynamic ring colors based on score (Red/Gold/Emerald).
  - One-line grade label ("Needs Attention", "Growing", "Thriving").
  - Personalized comment from Sade.
- **Placement**: Between the metric cards and achievements section on the Dashboard.

## Non-Goals
- Real-time data sync via Supabase (already handled by prior phases).
- Modifying underlying data structures or existing charts.

## Auth & RLS model
**Auth in scope:** No
**Model:** `no_auth_public_read`
**RLS strategy:** Existing (anon access)

## Affected Areas
- `src/components/Dashboard.tsx`: Primary component for the new card and logic.
- `src/components/ui/progress.tsx`: (Optional) Check if shadcn progress fits or create custom SVG ring.
- `src/components/BrandMascot.tsx`: Review if needed for Sade's comment styling.

## Ordered Phases

### Phase 1: Logic Implementation
- Define score calculation functions in `Dashboard.tsx` (or a utility file).
- Calculate:
  - `marginScore`: Based on (Total Gross Profit / Total Revenue).
  - `expenseScore`: Based on (Total Expenses / Total Revenue).
  - `debtScore`: Based on (Outstanding Debts / Total Revenue).
  - `consistencyScore`: Based on sales streak.
- Implement logic for Sade's personalized comment based on the lowest scoring category.

### Phase 2: UI Component Development
- Create a `HealthScoreCard` component within `Dashboard.tsx`.
- Implement the SVG circular progress ring with transitions.
- Apply dynamic coloring:
  - 0-40: `#DC2626` (Red)
  - 41-70: `#D4AF37` (Gold)
  - 71-100: `#0F9D58` (Emerald)

### Phase 3: Integration & Styling
- Insert the card into the Dashboard layout.
- Ensure styling matches `premium-card` and existing typography.
- Add "Sade's Insight" badge/header to the comment section.

## Execution Handoff

**Plan status:** ready

**Dispatch order:**
1. frontend_engineer — Implement Health Score logic and Dashboard UI.

**Per-agent instructions:**

### 1. frontend_engineer
- **Phases:** Phase 1, 2, 3
- **Scope:** 
    - Implement the score calculation logic using the criteria provided (Profit Margin, Expense Control, Debt Management, Sales Consistency).
    - Build a circular progress indicator (SVG-based preferred for styling control).
    - Create a new section in `Dashboard.tsx` between the metrics and achievements.
    - Add Sade's personalized comment logic: identify which category lost the most points and provide actionable advice.
- **Files:** `src/components/Dashboard.tsx`
- **Acceptance criteria:**
    - Score is calculated accurately based on sales, expenses, and debts.
    - Ring color changes correctly based on the score threshold.
    - Grade label and Sade's comment update dynamically.
    - Card fits seamlessly into the existing "Premium" design.

IS_SUPABASE_REQUIRED: false
