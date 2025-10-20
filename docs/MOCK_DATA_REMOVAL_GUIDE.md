# Mock Data Removal and Production Readiness Guide

This guide defines how to manage, control, and remove mock data across the project when transitioning to production. No code changes are required now; follow this document later to cleanly disable mock data.

## Scope and Principles
- Keep mock data available in development for faster iteration.
- Ensure production never serves mock values or test accounts.
- Control behavior via environment flags and replace hardcoded mocks with API/DB calls behind the same interfaces.

## Project Areas Using Mock Data (current)
- Admin – Points: `src/app/admin/points/page.tsx` (hardcoded totals)
- Marketing Automation: `src/app/admin/marketing/automation/page.tsx` (example metrics)
- Recommendation engines:
  - `src/lib/advancedRecommendationEngine.ts` (dummy products)
  - `src/lib/personalizationEngine.ts` (dummy products)
  - `src/lib/advancedSegmentation.ts` (random/placeholder behavior data)
- Address search (local fallback lists):
  - `src/components/ui/HybridAddressSearch.tsx`
  - `src/components/ui/SimplePostcodeSearch.tsx`
- Test data scripts (do not run on production):
  - `scripts/create-test-data.js`
  - `scripts/create-product-test-data.js`
  - `scripts/create-analytics-test-data.js`

## Control Switch (recommended)
- Add the following env toggle and use it in code branches:
  - `USE_MOCK_DATA=true|false`
- Behavior:
  - Development: `USE_MOCK_DATA=true` → use mock values/fallback data.
  - Production: `USE_MOCK_DATA=false` → call real APIs/DB, disable seeds.

Example decision pattern to apply later (do not change now):
```ts
const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || process.env.USE_MOCK_DATA === 'true';
if (useMock) {
  return mockData; // existing hardcoded values
}
return await fetchRealData();
```

## Step-by-step Removal Plan (by area)
1) Admin – Points (`src/app/admin/points/page.tsx`)
  - Replace hardcoded `setStats({ ... })` with `GET /api/admin/points/history` aggregate response.
  - Guard with env toggle to keep mock in dev.

2) Marketing Automation (`src/app/admin/marketing/automation/page.tsx`)
  - Move monthly metrics to a stats API (or reuse analytics service) and fetch on load.
  - Keep mock timeline behind `USE_MOCK_DATA` for local runs.

3) Recommendation/Personalization libs
  - Replace `getProductsByCategory/Brand` dummy arrays with product repository calls.
  - Replace random behavior with analytics-derived aggregates.
  - Wrap dummy data providers with `if (useMock) return dummy;`.

4) Address Search components
  - Keep local arrays only when `USE_MOCK_DATA=true` or external API quota fails.
  - Prefer NAVER/POSTCODE API in production.

5) Test data scripts
  - Ensure CI/CD never runs `scripts/create-*-test-data*` on production.
  - Gate with `if (process.env.NODE_ENV !== 'production')`.

## Pre-deploy Checklist (production)
- [ ] Set `USE_MOCK_DATA=false` and commit env changes in project settings (do not commit secrets).
- [ ] Verify pages no longer call hardcoded mock setters.
- [ ] Ensure no seed/test scripts run in build hooks.
- [ ] Confirm analytics and database connectivity.
- [ ] Smoke-test admin dashboards for real values.

## Verification Steps
- Points admin: totals reflect DB values; no round placeholder numbers.
- Marketing: charts load from API and vary with filters.
- Recommendations: product IDs exist in DB; no "상품 1/2/3" placeholders.
- Address search: external API results present; local list used only on API failure in development.

## Rollback Plan
- If a real API is unstable, temporarily set `USE_MOCK_DATA=true` in the affected environment to keep UI functional while investigating.

## Ownership and Review
- Code owners per area should own the switch removal and API wiring.
- Require code review to verify `USE_MOCK_DATA` gating and absence of hardcoded values in production paths.

## Future Improvements
- Centralize a `MockDataProvider` with strongly typed interfaces to avoid scattered literals.
- Add an automated lint rule to detect suspicious literals in admin dashboards.

This guide is intended for operational readiness; keep mock data for now, and apply these steps before production cutover.
