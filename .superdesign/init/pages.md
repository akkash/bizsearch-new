# Page dependency trees

## / (Home)
Entry: `src/polymet/pages/home.tsx`
Dependencies:
- `src/polymet/components/marketplace-hero.tsx`
  - `src/components/ui/button.tsx`
  - `src/components/ui/input.tsx`
- `src/polymet/components/home-inventory.tsx`
  - `src/polymet/components/franchise-card.tsx`
  - `src/polymet/components/business-card.tsx`
- `src/polymet/components/match-preview-section.tsx`
- `src/polymet/components/valuation-preview-section.tsx`
- `src/polymet/components/trust-verification-section.tsx`
- `src/polymet/components/seller-cta-section.tsx`
- Shell: `src/polymet/layouts/main-layout.tsx`
  - `src/polymet/components/mobile-bottom-nav.tsx`
  - `src/polymet/components/footer.tsx`
  - `src/components/theme-toggle.tsx`
  - `src/components/ui/dropdown-menu.tsx`
  - `src/components/ui/sheet.tsx`
  - `src/components/ui/avatar.tsx`

## /match
Entry: `src/polymet/pages/franchise-match.tsx`
Dependencies:
- `src/components/franchisee-matcher.tsx`
  - `src/components/ui/card.tsx`
  - `src/components/ui/button.tsx`
  - `src/components/ui/input.tsx`
  - `src/components/ui/label.tsx`
  - `src/components/ui/badge.tsx`
  - `src/components/ui/progress.tsx`
- Shell: MainLayout (same as home)

## /franchises
Entry: `src/polymet/pages/franchise-listings.tsx`
Dependencies:
- `src/polymet/components/franchise-card.tsx`
- `src/polymet/components/filters.tsx`
- `src/polymet/components/comparison-feature.tsx`
- `src/polymet/components/skeleton-loader.tsx`
- `src/polymet/components/empty-state.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/toggle-group.tsx`
- Shell: MainLayout

## /franchise/:id
Entry: `src/polymet/pages/franchise-detail.tsx`
Dependencies:
- `src/components/franchise-bento-view.tsx`
- `src/components/inquiry-dialog.tsx`
- `src/polymet/components/comparison-feature.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/separator.tsx`
- Shell: MainLayout

## /dashboard
Entry: `src/polymet/pages/dashboard/overview.tsx`
Dependencies:
- `src/polymet/pages/dashboard/franchisor-growth.tsx` (franchisor branch)
- `src/polymet/components/business-card.tsx`
- `src/polymet/components/franchise-card.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/tabs.tsx`
- Shell: MainLayout

## /add-franchise-listing
Entry: `src/polymet/pages/add-franchise-listing.tsx`
Dependencies:
- `src/polymet/components/franchise-listing-wizard.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/badge.tsx`
- ProtectedRoute requiredRole=franchisor + MainLayout

## /leads and /pipeline
Entry: `src/polymet/pages/lead-management.tsx`
Dependencies:
- `src/components/ui/card.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/avatar.tsx`
- Shell: MainLayout
