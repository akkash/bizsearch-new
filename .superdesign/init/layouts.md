# Shared layouts

Marketplace shell is `MainLayout` (top nav + footer + mobile bottom nav). Admin uses a separate admin layout.

### `src/polymet/layouts/main-layout.tsx`

```tsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useFeatureFlag } from "@/contexts/FeatureFlagsContext";
import {
  Menu,
  User,
  Bell,
  Mail,
  Briefcase,
  Bookmark,
  LogOut,
  Store,
  Shield,
  Building,
  LayoutDashboard,
  Calculator,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileBottomNav } from "@/polymet/components/mobile-bottom-nav";
import { AIChat } from "@/polymet/components/ai-chat";
import { Footer } from "@/polymet/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { name: "Franchises", href: "/franchises" },
  { name: "Match", href: "/match" },
  { name: "Businesses", href: "/businesses" },
  { name: "Franchise Map", href: "/franchise-map" },
];

const TOOLS_LINKS = [
  { name: "Franchise Pipeline", href: "/pipeline", icon: Users },
  { name: "Franchise Match", href: "/match", icon: Search },
  { name: "Smart Search", href: "/smart-search", icon: Search },
  { name: "Franchise Map", href: "/franchise-map", icon: Store },
  { name: "Business Valuation", href: "/business-valuation", icon: Calculator },
];

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { savedCount } = useSavedListings();
  const { unreadCount } = useNotifications();
  const isAIChatEnabled = useFeatureFlag("ai_chat_advisor");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Sign out error:", error);
        return;
      }
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b transition-shadow duration-200",
          "bg-background/95 backdrop-blur-md",
          isScrolled ? "border-border shadow-sm" : "border-border/60"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-14 md:h-16 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/logo.png"
                alt="BizSearch"
                className="h-9 w-auto object-contain block dark:hidden"
              />
              <img
                src="/logo-dark.png"
                alt="BizSearch"
                className="h-9 w-auto object-contain hidden dark:block"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={`${link.name}-${link.href}`}
                  to={link.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActivePath(link.href)
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer"
                    )}
                  >
                    Tools
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  {TOOLS_LINKS.map((tool) => (
                    <Link key={tool.href} to={tool.href}>
                      <DropdownMenuItem className="cursor-pointer">
                        <tool.icon className="mr-2 h-4 w-4" />
                        {tool.name}
                      </DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              <Link to="/saved" className="hidden md:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground"
                  aria-label="Saved listings"
                >
                  <Bookmark className="h-4 w-4" />
                  {savedCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-[10px] font-medium bg-foreground text-background rounded-full">
                      {savedCount > 9 ? "9+" : savedCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link to="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-[10px] font-medium bg-destructive text-white rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>

              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-1 hidden md:flex">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-secondary text-foreground">
                          {profile?.display_name?.[0]?.toUpperCase() ||
                            user?.email?.[0]?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    {profile && (
                      <>
                        <div className="px-2 py-1.5">
                          <p className="text-sm font-medium">{profile.display_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {profile.email}
                          </p>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {(() => {
                      const userRoles: string[] =
                        (profile as any)?.roles?.map((r: any) => r.role) || [
                          profile?.role,
                        ];
                      const hasRole = (role: string) => userRoles.includes(role);
                      return (
                        <>
                          {hasRole("admin") && (
                            <Link to="/admin">
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Admin
                              </DropdownMenuItem>
                            </Link>
                          )}
                          {(hasRole("advisor") || hasRole("broker")) && (
                            <Link to="/advisor/dashboard">
                              <DropdownMenuItem>
                                <Briefcase className="mr-2 h-4 w-4" />
                                Advisor
                              </DropdownMenuItem>
                            </Link>
                          )}
                        </>
                      );
                    })()}
                    <Link to="/dashboard">
                      <DropdownMenuItem>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/my-listings">
                      <DropdownMenuItem>
                        <Store className="mr-2 h-4 w-4" />
                        My Listings
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/messages">
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Messages
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center gap-2 ml-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}

              <Link to="/add-franchise-listing" className="hidden sm:block ml-1">
                <Button
                  size="sm"
                  className="bg-growth-green hover:bg-growth-green/90 text-white font-medium"
                >
                  List Your Franchise
                </Button>
              </Link>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden ml-1 text-muted-foreground"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                      <span className="text-lg font-semibold">BizSearch</span>
                    </div>
                    <div className="flex-1 py-4 overflow-y-auto">
                      <nav className="space-y-1 px-2">
                        {[
                          ...NAV_LINKS,
                          { name: "Smart Search", href: "/smart-search" },
                          { name: "Valuation", href: "/business-valuation" },
                          { name: "Help", href: "/help" },
                        ].map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "block px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                              isActivePath(item.href)
                                ? "bg-secondary text-foreground"
                                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                            )}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </nav>

                      <div className="mt-6 px-4 space-y-3">
                        <Link
                          to="/add-franchise-listing"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button className="w-full bg-growth-green hover:bg-growth-green/90 text-white">
                            List Your Franchise
                          </Button>
                        </Link>
                        {user ? (
                          <>
                            <Link
                              to="/dashboard"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <Button variant="outline" className="w-full">
                                <User className="h-4 w-4 mr-2" />
                                Dashboard
                              </Button>
                            </Link>
                            <div className="flex items-center justify-between px-1">
                              <span className="text-sm text-muted-foreground">Theme</span>
                              <ThemeToggle />
                            </div>
                            <button
                              onClick={() => {
                                handleSignOut();
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-destructive"
                            >
                              Sign Out
                            </button>
                          </>
                        ) : (
                          <>
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                              <Button variant="outline" className="w-full">
                                Sign In
                              </Button>
                            </Link>
                            <div className="flex items-center justify-between px-1 pt-2">
                              <span className="text-sm text-muted-foreground">Theme</span>
                              <ThemeToggle />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MobileBottomNav />
      {isAIChatEnabled && <AIChat />}
      <Footer />
    </div>
  );
}

```

### `src/polymet/components/mobile-bottom-nav.tsx`

```tsx
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, MessageCircle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSavedListings } from "@/contexts/SavedListingsContext";

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({
  className,
}: MobileBottomNavProps) {
  const location = useLocation();
  const { savedCount } = useSavedListings();

  // Hide on admin and auth pages
  const hiddenPaths = ['/admin', '/login', '/signup', '/forgot-password', '/reset-password', '/onboarding'];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      isActive: location.pathname === "/",
    },
    {
      name: "Search",
      href: "/franchises",
      icon: Search,
      isActive:
        location.pathname.startsWith("/businesses") ||
        location.pathname.startsWith("/franchises") ||
        location.pathname.startsWith("/search") ||
        location.pathname.startsWith("/smart-search") ||
        location.pathname.startsWith("/franchise-map") ||
        location.pathname.startsWith("/match"),
    },
    {
      name: "Saved",
      href: "/saved",
      icon: Heart,
      isActive: location.pathname === "/saved",
      badge: savedCount > 0 ? savedCount : undefined,
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageCircle,
      isActive: location.pathname.startsWith("/messages"),
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      isActive: location.pathname.startsWith("/profile"),
    },
  ];

  return (
    <div className={cn("md:hidden", className)}>
      {/* Bottom Navigation - App-like Thumb Zone Design */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Glass background */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50 dark:bg-background/90" />

        {/* Navigation Items */}
        <div className="relative flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.isActive;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 px-4 rounded-2xl transition-all duration-200 min-w-[64px]",
                  isActive
                    ? "bg-primary/10 dark:bg-primary/20"
                    : "active:scale-95"
                )}
              >
                <div className="relative">
                  <IconComponent
                    className={cn(
                      "h-6 w-6 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {/* Badge */}
                  {item.badge && (
                    <Badge
                      className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center p-0 text-[10px] font-semibold bg-growth-green text-white border-0"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>

                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding to prevent content from being hidden behind nav */}
      <div className="h-20" />
    </div>
  );
}

```

### `src/polymet/components/footer.tsx`

```tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Shield,
  CheckCircle,
  Award,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);
    // Simulate API call - in production, connect to email service
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Successfully subscribed to listing alerts!");
    setEmail("");
    setIsSubscribing(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <footer className="bg-[hsl(220,32%,7%)] text-slate-200">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-1">
                Get listing alerts
              </h3>
              <p className="text-sm text-slate-400">
                New franchises and franchise territories, delivered when they go live
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 w-full md:w-64"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="bg-growth-green hover:bg-growth-green/90 text-white whitespace-nowrap"
              >
                {isSubscribing ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content - Desktop */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-growth-green" />
              <span className="text-2xl font-bold text-white">BizSearch</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Find the right franchise. Evaluate investment, territory and fit —
              then connect with brands. Businesses for sale also available.
            </p>
            <div className="flex gap-2">
              <a
                href="https://facebook.com/bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com/@bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Franchises</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/franchises" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  Franchise Opportunities
                </Link>
              </li>
              <li>
                <Link to="/franchises" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  Browse Franchises
                </Link>
              </li>
              <li>
                <Link to="/franchise-map" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  Franchise Map
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">For Franchisors</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/add-franchise-listing" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  List Your Franchise
                </Link>
              </li>
              <li>
                <Link to="/franchisor/applications" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  Franchisee Applications
                </Link>
              </li>
            </ul>
            <h3 className="text-lg font-semibold text-white mb-4 mt-6">Businesses</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/businesses" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  Businesses for Sale
                </Link>
              </li>
              <li>
                <Link to="/add-business-listing" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  Sell a Business
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/smart-search" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  Franchise Matching
                </Link>
              </li>
              <li>
                <Link to="/franchise-map" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  Territory Map
                </Link>
              </li>
              <li>
                <Link to="/business-valuation" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  Investment / ROI
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-slate-400 hover:text-growth-green transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
            <ul className="space-y-3 mt-6">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4 flex-shrink-0 text-growth-green" />
                <a href="mailto:support@bizsearch.in" className="hover:text-growth-green transition-colors">
                  support@bizsearch.in
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="h-4 w-4 flex-shrink-0 text-growth-green" />
                <a href="tel:+911800123456" className="hover:text-growth-green transition-colors">
                  +91 1800 123 456
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Footer Content - Mobile Accordion */}
        <div className="md:hidden space-y-4 mb-8">
          {/* Company Info - Always visible on mobile */}
          <div className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Building2 className="h-8 w-8 text-growth-green" />
              <span className="text-2xl font-bold text-white">BizSearch</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Find the right franchise. Evaluate investment, territory and fit —
              then connect with brands. Businesses for sale also available.
            </p>
            <div className="flex justify-center gap-2">
              <a href="https://facebook.com/bizsearch" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-md"><Facebook className="h-4 w-4" /></a>
              <a href="https://twitter.com/bizsearch" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-md"><Twitter className="h-4 w-4" /></a>
              <a href="https://linkedin.com/company/bizsearch" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-md"><Linkedin className="h-4 w-4" /></a>
              <a href="https://instagram.com/bizsearch" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-md"><Instagram className="h-4 w-4" /></a>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Accordion Sections */}
          {[
            {
              id: 'franchises', title: 'Franchises', links: [
                { to: '/franchises', label: 'Franchise Opportunities' },
                { to: '/franchises', label: 'Browse Franchises' },
                { to: '/franchise-map', label: 'Franchise Map' },
              ]
            },
            {
              id: 'franchisors', title: 'For Franchisors', links: [
                { to: '/add-franchise-listing', label: 'List Your Franchise' },
                { to: '/franchisor/applications', label: 'Franchisee Applications' },
              ]
            },
            {
              id: 'businesses', title: 'Businesses', links: [
                { to: '/businesses', label: 'Businesses for Sale' },
                { to: '/add-business-listing', label: 'Sell a Business' },
              ]
            },
            {
              id: 'tools', title: 'Tools', links: [
                { to: '/smart-search', label: 'Franchise Matching' },
                { to: '/franchise-map', label: 'Territory Map' },
                { to: '/business-valuation', label: 'Investment / ROI' },
              ]
            },
            {
              id: 'company', title: 'Company', links: [
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' },
                { to: '/terms', label: 'Terms' },
                { to: '/privacy', label: 'Privacy' },
              ]
            },
          ].map((section) => (
            <div key={section.id} className="border-b border-white/10">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full py-3 text-left"
              >
                <span className="font-semibold text-white">{section.title}</span>
                {expandedSection === section.id ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>
              {expandedSection === section.id && (
                <ul className="space-y-2 pb-3">
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        to={link.to}
                        className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Contact - Accordion */}
          <div className="border-b border-white/10">
            <button
              onClick={() => toggleSection('contact')}
              className="flex items-center justify-between w-full py-3 text-left"
            >
              <span className="font-semibold text-white">Contact Us</span>
              {expandedSection === 'contact' ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            {expandedSection === 'contact' && (
              <ul className="space-y-3 pb-3">
                <li className="flex items-start gap-2 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-growth-green" />
                  <span>123 Business Hub, MG Road, Bangalore 560001</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="h-4 w-4 flex-shrink-0 text-growth-green" />
                  <a href="mailto:support@bizsearch.in">support@bizsearch.in</a>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <Phone className="h-4 w-4 flex-shrink-0 text-growth-green" />
                  <a href="tel:+911800123456">+91 1800 123 456</a>
                </li>
              </ul>
            )}
          </div>
        </div>

        <Separator className="bg-white/10 mb-6" />

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-md border border-white/10">
            <Shield className="h-5 w-5 text-growth-green flex-shrink-0" />
            <span className="text-xs text-slate-300">Listing moderation</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-md border border-white/10">
            <Lock className="h-5 w-5 text-slate-300 flex-shrink-0" />
            <span className="text-xs text-slate-300">Secure platform</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-md border border-white/10">
            <CheckCircle className="h-5 w-5 text-growth-green flex-shrink-0" />
            <span className="text-xs text-slate-300">Verification levels</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-md border border-white/10">
            <Award className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <span className="text-xs text-slate-300">Transparent listings</span>
          </div>
        </div>

        <Separator className="bg-white/10 mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle className="h-4 w-4 text-growth-green" />
            <span>Listings reviewed before publication where moderation is enabled</span>
          </div>
          <p className="text-sm text-slate-400 text-center">
            © {currentYear} BizSearch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

```

### `src/components/theme-toggle.tsx`

```tsx
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => setTheme('light')}
                    className={theme === 'light' ? 'bg-accent' : ''}
                >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('dark')}
                    className={theme === 'dark' ? 'bg-accent' : ''}
                >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('system')}
                    className={theme === 'system' ? 'bg-accent' : ''}
                >
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

```

### `src/polymet/layouts/admin-layout.tsx`

```tsx
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    FileText,
    BarChart3,
    Shield,
    ShieldCheck,
    Settings,
    ChevronLeft,
    Menu,
    LogOut,
    Home,
    Building2,
    FileCheck,
    Flag,
} from 'lucide-react';

const sidebarItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/admin',
        exact: true
    },
    {
        title: 'Users',
        icon: Users,
        href: '/admin/users'
    },
    {
        title: 'Listings',
        icon: Building2,
        href: '/admin/listings'
    },
    {
        title: 'Verification',
        icon: ShieldCheck,
        href: '/admin/verification'
    },
    {
        title: 'Documents',
        icon: FileCheck,
        href: '/admin/documents'
    },
    {
        title: 'Content',
        icon: FileText,
        href: '/admin/content'
    },
    {
        title: 'Analytics',
        icon: BarChart3,
        href: '/admin/analytics'
    },
    {
        title: 'Fraud Alerts',
        icon: Shield,
        href: '/admin/fraud'
    },
    {
        title: 'Feature Flags',
        icon: Flag,
        href: '/admin/feature-flags'
    },
    {
        title: 'Settings',
        icon: Settings,
        href: '/admin/settings'
    },
];

export function AdminLayout() {
    const { profile, signOut } = useAuth();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (href: string, exact?: boolean) => {
        if (exact) {
            return location.pathname === href;
        }
        return location.pathname.startsWith(href);
    };

    const NavItems = () => (
        <>
            {sidebarItems.map((item) => (
                <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive(item.href, item.exact)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.title}</span>}
                </Link>
            ))}
        </>
    );

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b z-50 flex items-center px-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <span className="ml-4 font-semibold">Admin Dashboard</span>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 h-full bg-background border-r z-50 transition-all duration-200',
                    sidebarCollapsed ? 'w-16' : 'w-64',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b">
                        {!sidebarCollapsed && (
                            <Link to="/admin" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <span className="font-bold text-lg">Admin</span>
                            </Link>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="hidden lg:flex"
                        >
                            <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 py-4">
                        <nav className="space-y-1 px-2">
                            <NavItems />
                        </nav>
                    </ScrollArea>

                    <Separator />

                    {/* Bottom Section */}
                    <div className="p-4 space-y-2">
                        <Link
                            to="/"
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                            )}
                        >
                            <Home className="h-5 w-5 flex-shrink-0" />
                            {!sidebarCollapsed && <span>Back to Site</span>}
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    'min-h-screen transition-all duration-200 pt-16 lg:pt-0',
                    sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
                )}
            >
                {/* Top Bar */}
                <header className="h-16 bg-background border-b flex items-center justify-between px-6">
                    <div>
                        <h1 className="text-lg font-semibold capitalize">
                            {location.pathname === '/admin'
                                ? 'Dashboard'
                                : location.pathname.split('/').pop()?.replace(/-/g, ' ')}
                        </h1>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={profile?.avatar_url || ''} />
                                    <AvatarFallback>
                                        {profile?.display_name?.charAt(0) || 'A'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden md:inline-block">
                                    {profile?.display_name || 'Admin'}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/profile">
                                    <Users className="h-4 w-4 mr-2" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/profile/settings">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

```
