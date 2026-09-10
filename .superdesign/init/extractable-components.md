# Extractable Superdesign DraftComponents

## MainLayout / NavBar
- Source: `src/polymet/layouts/main-layout.tsx`
- Category: layout
- Description: Top marketplace nav with logo, Search/Match/Dashboard links, saved, notifications, user menu, theme toggle
- Extractable props: activePath (string), isAuthenticated (boolean), unreadCount (number)
- Hardcoded: BizSearch wordmark, IBM Plex, growth-green CTA, lucide icons, footer inclusion

## MobileBottomNav
- Source: `src/polymet/components/mobile-bottom-nav.tsx`
- Category: layout
- Description: Mobile tab bar; Search active on /franchises, /search, /match
- Extractable props: activePath (string)
- Hardcoded: tab labels Home/Search/Saved/Inbox, growth-green active indicator

## Footer
- Source: `src/polymet/components/footer.tsx`
- Category: layout
- Description: Site footer with marketplace links
- Extractable props: none
- Hardcoded: link lists, legal copy

## MarketplaceHero
- Source: `src/polymet/components/marketplace-hero.tsx`
- Category: layout
- Description: Dark navy franchise search hero with intent chips and popular queries
- Extractable props: query (string), activeIntent (string)
- Hardcoded: headline, popular chips, growth-green Search button, dark `hsl(220,32%,7%)` bar

## FranchiseCard
- Source: `src/polymet/components/franchise-card.tsx`
- Category: basic
- Description: Listing card for franchise inventory and search results
- Extractable props: franchise (object), saved (boolean)
- Hardcoded: card chrome, investment mono type, badges

## MatchResultCard
- Source: `src/components/franchisee-matcher.tsx`
- Category: basic
- Description: Matcher result with score, location/experience/commitment fit bars, Enquire CTA
- Extractable props: matchScore, matchLevel, financialFitScore, experienceFitScore, locationFitScore, commitmentFitScore
- Hardcoded: growth-green Enquire button, progress bars, strength/concern copy
