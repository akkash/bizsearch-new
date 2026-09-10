# Routes

Router: `src/App.tsx` (React Router v6). Marketplace pages wrap `MainLayout`. Auth/app pages wrap `ProtectedRoute` + `MainLayout`. Admin uses `AdminRouteGuard` + `AdminLayout`.

## Public marketplace

| Path | File | Layout | Summary |
|---|---|---|---|
| `/` | `src/polymet/pages/home.tsx` | MainLayout | Franchise-first homepage: search hero, franchise inventory, secondary businesses, match preview, ROI preview, verification, list-franchise CTA |
| `/franchises` | `src/polymet/pages/franchise-listings.tsx` | MainLayout | Franchise search/browse with filters, grid/list, compare |
| `/franchise/:id` | `src/polymet/pages/franchise-detail.tsx` | MainLayout | Public franchise detail, enquire, apply, compare |
| `/franchise/:id/locations` | `src/polymet/pages/franchise-locations.tsx` | MainLayout | Brand location map |
| `/franchise-map` | `src/polymet/pages/franchise-map-discovery.tsx` | MainLayout | Map discovery |
| `/match` | `src/polymet/pages/franchise-match.tsx` | MainLayout | Franchisee matcher → enquire |
| `/businesses` | `src/polymet/pages/business-listings.tsx` | MainLayout | Secondary business-sale inventory |
| `/business/:id` | `src/polymet/pages/business-detail.tsx` | MainLayout | Business listing detail |
| `/search` `/smart-search` | search pages | MainLayout | NL / smart search |
| `/login` `/signup` | auth pages | none | Auth |

## Franchise commercial spine (protected)

| Path | File | Notes |
|---|---|---|
| `/dashboard` | `src/polymet/pages/dashboard/overview.tsx` | Franchisors see `FranchisorGrowthDashboard` |
| `/add-franchise-listing` | `src/polymet/pages/add-franchise-listing.tsx` | Wizard; role franchisor |
| `/franchise/:franchiseId/apply` | `src/polymet/pages/franchise-application.tsx` | Apply; writes inquiry_id |
| `/my-applications` | applications page | Franchisee inbox |
| `/franchisor/applications` | `src/polymet/pages/franchisor-applications.tsx` | Franchisor application inbox |
| `/leads` `/pipeline` | `src/polymet/pages/lead-management.tsx` | Canonical inquiry pipeline |
| `/messages` | messaging | Threads |

Full route table lives in `src/App.tsx`.
