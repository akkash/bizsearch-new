# BizSearch — Franchise-First Master Product Plan

**Status:** Blueprint — **P0 implemented in app (2026-09-08)**  
**Date:** 2026-09-08  
**Principle:** Build the long-term Business Acquisition OS architecture; **optimize GTM and product effort for franchises for 12 months.**

**P0 shipped:** qualified enquire → Franchise Pipeline (`/leads`, `/pipeline`) → inquiry↔application link → schema migration `029` → listing gates → IA/hygiene. Apply migration to Supabase before relying on new columns/RPC.

---

## 0. Strategic north star

| Dimension | Decision |
|-----------|----------|
| Primary market | Franchise discovery + franchisee acquisition |
| Primary customer (supply) | Franchisors / franchise brands |
| Primary demand | Prospective franchisees / investors |
| Secondary capability | Businesses for sale — available, not GTM-primary |
| Commercial wedge | Qualified leads + pipeline + territory/ROI tools — **not** directory listings alone |
| Flywheel | Franchisor → Opportunity → Qualified franchisee → Match → Territory eval → Financial eval → Lead → Application → Deal |

**80/20 rule:** ~80% of product effort for 12 months goes to the Franchise domain; Business Sale domain stays maintainable and quiet.

---

## 1. Current application inventory

### 1.1 Stack

- Vite + React + TypeScript + Tailwind
- Supabase (Postgres, Auth, RLS, Edge Functions)
- Entry: `src/App.tsx` → `MainLayout` wraps most public/app routes

### 1.2 Domain surfaces already in code

| Domain | Maturity | Notes |
|--------|----------|-------|
| Franchise marketplace (browse/detail/create) | **Strong** | Live Supabase listings, wizard, compare |
| Franchise applications | **Strong** | Apply + my-applications + franchisor review |
| Franchise lead CRM (`/leads`) | **Present** | Inquiry status pipeline (Phase 1) |
| Franchise map / locations / territories | **Partial** | Schema + services exist; UI often empty/mock/flag-gated |
| AI franchise match / territory / application assist | **Present as services** | Not the GTM spine yet; mixed reliability |
| Business marketplace | **Strong** | Secondary GTM |
| Business deal room / NDA / seller analytics | **Present** | Business-sale oriented |
| Advisor CRM (clients/deals/commissions) | **Present** | Parallel to franchisor CRM — **do not confuse** |
| Financing | **Stub** | Static partners + coming-soon |
| Report generator | **Stub** | Mock content |
| Monetization / billing | **Not implemented** | Legal/help copy mentions subscriptions; no Stripe/Razorpay |

### 1.3 Homepage posture (as of franchise-first reposition)

1. Nav  
2. Franchise search hero  
3. Franchise inventory (primary)  
4. Businesses for sale (secondary)  
5. Franchise match preview (SAMPLE)  
6. Franchise ROI preview (SAMPLE)  
7. Verification  
8. List Your Franchise CTA  
9. Footer  

---

## 2. Current database / schema

**Source of truth:** `supabase/migrations/` (27 files).  
**Gap:** `src/types/supabase.ts` is incomplete (profiles/role details only — not full listing schema).

### 2.1 Franchise core

| Table | Migration | Role |
|-------|-----------|------|
| `franchises` | `002` + alters (`010`,`015`,`022`,`025`–`027`) | Brand / opportunity listings |
| `franchise_locations` | `004` | Outlet / looking-for-franchise pins |
| `franchise_territories` | `004` | Territory inventory + market fields |
| `saved_territories`, `territory_comparisons`, `territory_requests`, `territory_waitlist` | `005` | Territory UX |
| `franchise_applications` | `011` | Formal franchisee applications (JSON packets) |
| `franchisor_details`, `franchisee_details` | `021` | Role profile extras |

### 2.2 Lead / pipeline (franchisor CRM)

| Table | Migration | Role |
|-------|-----------|------|
| `inquiries` | `014` + `028` | **Primary franchisor lead pipeline** |
| Statuses (`028`) | `new → contacted → qualified → information_sent → meeting → application → negotiation → converted \| lost` | Matches `src/types/franchise-domain.ts` |
| Priority | `low \| medium \| high \| hot` | |

### 2.3 Parallel / overlapping systems (consolidation risk)

| System | Table | Status |
|--------|-------|--------|
| Formal applications | `franchise_applications` | Separate statuses; **no FK** to inquiry |
| Agent lead queue | `lead_queue` (`024`) | Parallel qualification scoring |
| Advisor deals | `deals` (`013`) | Advisor M&A pipeline — not franchisor CRM |
| Business inquiries | `business_inquiries` (`012`) | Business-only duplicate path |

### 2.4 Shared

`profiles`, `profile_roles`, `notifications`, `conversations`/`messages`, `saved_listings`, `listing_analytics`, verification tables, feature flags (`017`).

### 2.5 Known schema/app mismatches (fix before new features)

1. Application UI may reference `investment_range_min/max` — DB uses `total_investment_min/max`  
2. Mapper expects `badges`; franchises table has `awards`  
3. RPC `increment_franchise_views` called from service — not clearly defined as callable RPC in migrations  
4. Location/territory defaults include `United States` while brand HQ defaults `India`  
5. Incomplete generated Supabase types  

---

## 3. Current routes / screens

### 3.1 Franchise-primary (keep / deepen)

| Route | Screen |
|-------|--------|
| `/` | Franchise-first home |
| `/franchises` | Browse / filter / compare |
| `/franchise/:id` | Detail |
| `/franchise/:id/locations` | Locations + bulk upload |
| `/franchise-map` | Map discovery (flag `franchise_map`) |
| `/add-franchise-listing` | Create listing |
| `/franchise/:franchiseId/apply` | Franchisee application |
| `/my-applications` | Applicant tracker |
| `/franchisor/applications` | Franchisor application review |
| `/leads` | Franchisor inquiry CRM |
| `/smart-search` | NL search (shared) |
| `/messages` | Messaging (shared) |
| `/dashboard` | Role-aware; franchisor CTAs |
| `/signup` / `/onboarding` | Franchisor & franchisee roles |

### 3.2 Business-sale secondary (maintain, do not expand GTM)

`/businesses`, `/business/:id`, `/add-business-listing`, `/business/edit/:id`, `/business-valuation`, `/buyer-inquiries`, `/nda-management`, `/deal-room/:businessId`, `/seller-analytics`, `/listing-optimizer/:businessId`, `/buyer/mandate`

### 3.3 Advisor / broker (deprioritize for franchise GTM)

`/clients`, `/deal-pipeline`, `/commissions`, `/advisors`, `/advisor/*`, `/report-generator`

### 3.4 Admin

`/admin/*` — users, listings, documents, analytics, fraud, content, settings, feature flags, verification

---

## 4. Existing franchise functionality (capability map)

### What works today

- Franchisor signup/onboarding + list franchise (wizard)  
- Public franchise search/browse/detail/compare (session compare, max 3)  
- Franchisee inquiry → `/leads` pipeline statuses  
- Formal multi-step application + franchisor review  
- My applications  
- Locations CRUD + CSV bulk upload + geocoding path  
- Territory tables + some request/waitlist services  
- Feature-flagged franchise map discovery  
- AI services: franchisee matcher, territory analyzer, application assistant (exist; not productized as the core funnel)  
- Verification fields on listings  
- Homepage franchise-first positioning  

### What is partial / mock / stub

| Area | Reality |
|------|---------|
| Listings page map tab | “Coming soon” stub |
| Franchise metrics charts | Default mock data |
| Territory availability UI | Mock defaults common |
| Financing | Static / coming soon |
| ROI on homepage | SAMPLE illustration only |
| Unified pipeline inquiry ↔ application | Not linked |
| Franchisor “money machine” dashboard | Split across `/leads`, `/franchisor/applications`, `/dashboard` — not one Pipeline OS |
| Qualification (investment, timeline, funds, experience) | Partially in application JSON; **not** required at first lead capture |
| Territory intelligence (population, competition, rent) | Columns exist; product UX incomplete |
| Billing / featured placement | Copy only |

---

## 5. Franchisee journey — gap analysis

**Ideal journey**

Discover → Search/filter → Compare → Match score → Territory eval → ROI/assumptions → Qualify (intent form) → Enquire → Apply → Interview → Agreement → Open

| Stage | Today | Gap |
|-------|-------|-----|
| Discover | Home + browse | Thin inventory; map/search UX uneven |
| Search | `/franchises`, smart-search | Mobile Search tab still defaults to `/businesses` |
| Compare | Hook + UI (max 3) | Needs investment/fee/payback parity; deeper side-by-side |
| Match | SAMPLE + AI service | Persist match scores; explainability; not in core funnel |
| Territory | Map/locations pages | Empty states; weak India market data; analyzer not productized |
| ROI | SAMPLE + `roi-calculator` component | Not wired to live brand assumptions with disclosed inputs |
| Qualify | Application form late | **No high-value lead form before enquire** (investment, location, start date, funds, experience) |
| Enquire | Inquiry create | Qualification fields not first-class on inquiry |
| Apply | `/apply` | Field mismatches; AI assist optional |
| Track | `/my-applications` | Weak status messaging / next steps |
| Finance | Coming soon | Out of P0 |

---

## 6. Franchisor journey — gap analysis

**Ideal journey**

List brand → Publish → Receive qualified leads → Pipeline → Qualify → Meeting → Application → Approve → Territory assign → Opened unit

| Stage | Today | Gap |
|-------|-------|-----|
| List | Wizard | Long; quality gates incomplete |
| Publish / verify | Status + verification fields | Clear “what was verified” still uneven across UI |
| Lead inbox | `/leads` | Exists but not positioned as **the** product |
| Pipeline | Inquiry statuses | Missing stages user wants: **Approved → Agreement → Opened**; naming differs slightly |
| Candidate card | Partial (contact + status) | Missing structured: investment capacity, preferred location/industry, experience, funding status, opening timeline, territory preference, match score, docs, comms history |
| Applications | Separate page | Not linked from inquiry stage `application` |
| Territory ops | Locations + bulk upload | Territory CRM weak |
| Analytics | listing_analytics | No franchisor conversion funnel KPI UI |
| Monetization | None | No paid lead / seat / featured SKU |

**Critical product thesis:** If BizSearch only sells listings, it competes with directories. Value = **qualified franchise leads + territory intelligence + applicant qualification + conversion workflow.**

---

## 7. P0 / P1 / P2 feature matrix

### Definitions

- **P0 (prove the train):** Make franchisee acquisition engine usable end-to-end for first franchisors. Ship gates below.  
- **P1 (strengthen the engine):** Matching, territory intelligence, ROI, qualification depth.  
- **P2 (expand / OS):** Deeper AI, financing, multi-brand enterprise, business-sale GTM revival.

### Matrix

| ID | Feature | Priority | Depends on | Notes |
|----|---------|----------|------------|-------|
| F0.1 | Franchise-first IA consistency (nav, mobile Search → franchises, meta, CTAs) | **P0** | — | Mobile bottom nav still points Search → `/businesses` |
| F0.2 | Schema/type fixes (investment fields, views RPC, badges/awards, India defaults) | **P0** | — | Unblocks reliability |
| F0.3 | Lead capture qualification form (5 questions) before/with inquiry | **P0** | inquiries metadata or columns | Creates economic lead value |
| F0.4 | Franchisor Pipeline dashboard (single screen) | **P0** | `/leads` | New Lead → … → Converted; unify copy with desired stages |
| F0.5 | Candidate profile panel (capacity, location, funding, timeline, score, history) | **P0** | F0.3 | |
| F0.6 | Link inquiry ↔ `franchise_applications` | **P0** | schema FK or metadata | Stop dual-orphan workflows |
| F0.7 | Franchise inventory density & honest empty states | **P0** | sales motion | No fake counts |
| F0.8 | Listing quality gate (required investment, fee, industry, HQ, description) | **P0** | wizard | |
| F0.9 | Franchisor onboarding checklist → first lead | **P0** | dashboard | |
| F1.1 | Franchise Match (scored, explained, SAMPLE→live) | **P1** | franchisee prefs + listing fields | |
| F1.2 | Territory Analyzer productized (real territory rows + disclosed assumptions) | **P1** | territories data | |
| F1.3 | Franchise ROI calculator (assumptions exposed) | **P1** | listing unit economics | |
| F1.4 | Comparison v2 (investment, fee, royalty, payback, space, support) | **P1** | — | |
| F1.5 | Application assistant polish + document checklist | **P1** | applications | |
| F1.6 | Pipeline stages: Agreement / Opened (or map to converted + metadata) | **P1** | F0.4 | |
| F1.7 | Franchisor analytics (conversion rates by stage) | **P1** | inquiries | |
| F1.8 | Featured / paid placement + basic billing | **P1** | payments | Monetization start |
| F2.1 | Financing integrations | **P2** | partners | |
| F2.2 | Multi-brand enterprise franchisor seats | **P2** | billing | |
| F2.3 | Business-sale GTM expansion | **P2** | after franchise PMF | |
| F2.4 | Full Transaction Layer for franchises | **P2** | legal | |
| F2.5 | Advisor franchise brokerage tools | **P2** | optional | |

**Do not start coding P1/P2 until P0 blueprint is accepted and sequenced into implementation prompts.**

---

## 8. 12-month roadmap

| Quarter | Theme | Outcomes |
|---------|-------|----------|
| **Q1** | P0 — Franchisee acquisition MVP | Qualified leads; franchisor pipeline; inquiry↔application; IA consistency; schema hygiene; 3–10 design-partner franchisors |
| **Q2** | P1a — Intelligence | Live match scores; ROI with assumptions; comparison v2; territory v1 for India metros |
| **Q3** | P1b — Monetization + depth | Paid featured + lead/seat pricing; pipeline Agreement/Opened; franchisor analytics; application docs |
| **Q4** | Harden + optional P2 pilots | Reliability, inventory growth, financing pilot OR business-sale soft relaunch **only if** franchise flywheel proven |

**Exit criteria for “franchise PMF signal” (example):**  
franchisors returning weekly; lead→meeting conversion tracked; paid conversion or contracted pilots; franchisee completion of qualification form > X%.

---

## 9. Technical architecture (keep extensible)

```
                 BizSearch Platform
                        │
          ┌─────────────┴─────────────┐
          │                           │
   Franchise Domain             Business Sale Domain
   (12-mo focus)                (maintain / quiet)
          │                           │
   Brands                         Businesses
   Territories                    Financials
   Opportunities                  Assets
   Franchisees                    Property
   Applications                   Due Diligence
   Inquiries/Leads                Deal Room / NDA
          │                           │
          └─────────────┬─────────────┘
                        │
                Intelligence Layer
             Matching / ROI / Territory /
             Risk / Recommendations
                        │
                Transaction Layer
             (defer heavy franchise legal
              workflows until P2)
```

**Implementation rules**

- Shared: Auth, profiles, messaging, notifications, verification primitives, feature flags  
- Franchise CRM owns `inquiries` (franchise) + `franchise_applications` + territories  
- Advisor `deals` stays advisor-scoped — **do not** rebuild franchisor CRM on advisor tables  
- Business deal room remains business-scoped  

---

## 10. Target data model (franchise focus)

### 10.1 Canonical entities

- **Brand / Franchise listing** (`franchises`)  
- **Location** (`franchise_locations`)  
- **Territory** (`franchise_territories`)  
- **Franchisee profile** (`profiles` + `franchisee_details`)  
- **Franchisor profile** (`profiles` + `franchisor_details`)  
- **Lead / Inquiry** (`inquiries`) — pipeline spine  
- **Application** (`franchise_applications`) — linked to lead  
- **Qualification snapshot** — store on inquiry (`metadata` or dedicated columns):  
  investment capacity, preferred location(s), preferred industry, experience, funding status, expected opening timeline, territory preference  
- **Match score** — computed + optional persist on inquiry/metadata  
- **Communication** — `conversations`/`messages` + inquiry notes  

### 10.2 Pipeline stages (product language)

Align UI to:

`New Lead → Qualified → Contacted → Meeting → Application → Approved → Agreement → Opened`

Map to DB (proposed):

| Product stage | DB `inquiries.status` (near-term) |
|---------------|-----------------------------------|
| New Lead | `new` |
| Contacted | `contacted` |
| Qualified | `qualified` |
| Meeting | `meeting` |
| Application | `application` (+ link to `franchise_applications`) |
| Approved | application status `approved` **or** inquiry `negotiation`/`converted` + metadata |
| Agreement / Opened | metadata flags or extend status enum in P1 |

**Decision needed in implementation plan:** extend enum vs metadata for Agreement/Opened.

### 10.3 Unification work (P0)

1. On “Start application” from lead → create `franchise_applications` row with `inquiry_id` (add column)  
2. Status sync rules documented  
3. Deprecate reliance on `lead_queue` for franchisor UX until agents are intentional  

---

## 11. API / workflow requirements

### 11.1 Franchisee workflows

1. Search franchises (filters: investment, location, industry, ROI/payback if present)  
2. View detail (fee, investment range, royalty, territories, verification precision)  
3. Compare ≤3–4  
4. Submit **qualification + enquiry**  
5. Receive match explanation (P1)  
6. Apply with structured packet  
7. Track application status  

### 11.2 Franchisor workflows

1. Create/publish listing (quality gate)  
2. Manage locations/territories (CSV ok)  
3. Inbox: new qualified leads  
4. Move pipeline stages; add notes; message  
5. Review applications; approve/reject  
6. View simple conversion metrics (P1)  

### 11.3 System workflows

- Notifications on new lead / status change  
- RLS: franchisor sees only own franchise inquiries/applications  
- Feature flags for map / AI modules  
- Admin verification queue  

### 11.4 Services to treat as core vs experimental

| Core (P0) | Experimental (gate behind flags) |
|-----------|----------------------------------|
| `franchise-service` | `ai-franchisee-matcher-service` |
| `inquiry-service` | `ai-territory-analyzer-service` |
| `franchise-locations-service` | `ai-application-assistant-service` |
| `franchisor-tools-service` | `lead-agent` edge heuristics |

---

## 12. AI boundaries

**AI may:**

- Score franchise↔franchisee fit with **explicit factors** (investment band, territory, industry, experience, payback compatibility)  
- Suggest territories with **labeled assumptions**  
- Help fill application drafts  
- Summarize lead quality for franchisors  

**AI must not:**

- Invent inventory, reviews, “8,400 franchises,” or social proof  
- Present SAMPLE figures as live  
- Auto-approve applications or auto-advance pipeline without human action  
- Hide assumptions in ROI / territory outputs  
- Imply platform-wide “Verified” without listing-specific state  

**Product language:** job-specific (“Franchise Match”, “Territory Intelligence”, “Franchise ROI”) — never “AI-powered everything.”

---

## 13. Analytics / KPIs

### Product KPIs (franchise)

| KPI | Why |
|-----|-----|
| Franchise search → detail CTR | Discovery |
| Detail → qualified enquiry rate | Funnel |
| Qualification form completion rate | Lead quality |
| Lead → meeting rate | Franchisor value |
| Lead → application rate | Conversion |
| Application → approved rate | Process health |
| Franchisor weekly active (pipeline users) | Habit |
| Time-to-first-lead after publish | Onboarding |
| Paid conversion / pilot retention (Q3+) | Monetization |

### Ops / quality

- % listings with complete investment + fee + industry  
- Stale listing rate (`is_stale`)  
- Verification completion by type  
- Inventory count by industry/city (honest)  

### Instrumentation needs

Event taxonomy on: search, compare, enquire, qualify, apply, stage_change.  
Prefer first-party events into `listing_analytics` or dedicated `funnel_events` (P0 light / P1 full).

---

## 14. Monetization (12-month)

| Model | Timing | Notes |
|-------|--------|-------|
| Free listing + free basic leads (design partners) | Q1 | Learn quality bar |
| Featured franchise placement | Q2–Q3 | Homepage / browse boost |
| Franchisor seat / pipeline SaaS | Q3 | Money machine |
| Pay-per-qualified-lead | Q3 pilot | Only after qualification form trusted |
| Success fee on opened unit | P2 | Legal/ops heavy |
| Business-sale monetization | P2 | After franchise wedge works |

**Do not** ship billing before P0 pipeline + qualification exist — otherwise you monetize a directory.

---

## 15. Release gates

### Gate A — P0 launch (internal / design partners)

- [ ] Franchise-first IA (including mobile Search → franchises)  
- [ ] Schema mismatches fixed for apply/views  
- [ ] Qualification questions captured on lead  
- [ ] Franchisor can move lead through pipeline on one primary screen  
- [ ] Application linkable from lead  
- [ ] No fake inventory/stats  
- [ ] Verification labels precise  
- [ ] SAMPLE analysis clearly labeled  

### Gate B — P1 public intelligence

- [ ] Match scores reproducible from listed factors  
- [ ] ROI assumptions visible  
- [ ] Territory outputs cite data source or “estimate”  
- [ ] Comparison includes unit economics  

### Gate C — Monetization

- [ ] At least N franchisors using pipeline weekly  
- [ ] Lead quality SLA defined  
- [ ] Billing + refund policy operational  

---

## 16. What to delete / deprioritize

### Deprioritize (no new investment for 12 months unless critical bug)

- Advisor GTM expansion (`/advisor/*`, commissions marketing)  
- Business deal room / NDA feature expansion  
- Listing optimizer for businesses as homepage narrative  
- Report generator (mock)  
- Financing as core promise  
- Broad “Business Acquisition OS” marketing language on public pages  
- Building commercial property / full M&A transaction suite  

### Soft-hide or demote in UX

- Businesses section remains reachable but secondary (already started)  
- Mobile nav Search destination should not prefer businesses  
- “Buy a Business” as primary nav (already removed from desktop primary)  

### Delete / clean when safe (engineering hygiene — not GTM)

- Duplicate `/business/edit/:businessId` route declaration  
- Admin settings toast-only flag toggles (confusing vs real feature flags)  
- Orphan marketing homepage components no longer mounted (if unused)  
- Mock-default props in production paths for metrics/territories (replace with empty states)

### Do not delete

- Business listing schema/routes (long-term domain)  
- Shared messaging, auth, verification primitives  
- Franchise applications + inquiries foundations  

---

## 17. Recommended next artifacts (still no P1/P2 coding)

1. **This document** — Franchise-First Master Product Plan ✅  
2. **Master implementation prompt** — single prompt for app builder covering P0 only, referencing this plan  
3. **Execution prompts** — sliced:  
   - P0-A: IA + schema hygiene  
   - P0-B: Qualification capture  
   - P0-C: Franchisor Pipeline OS  
   - P0-D: Inquiry ↔ Application link  
4. **Design-partner script** — 5 franchisor interview / pilot checklist  

---

## 18. One-page summary for stakeholders

BizSearch already has more franchise machinery than a typical MVP (listings, apply, leads, locations). The failure mode is **diffused product surface**: business M&A tools, advisor CRM, and franchise CRM compete for attention.

For 12 months: **make franchisors win franchisees through BizSearch.**  
Architecture stays dual-domain. GTM, homepage, funnel, KPIs, and engineering priority go left (Franchise).  

P0 is not “more AI.” P0 is **qualified leads + one pipeline + linked applications + honest marketplace.**

---

*End of Master Product Plan. Await approval before generating the master implementation prompt or writing P0 code.*
