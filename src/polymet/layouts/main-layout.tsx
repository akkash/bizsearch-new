import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useFeatureFlag } from "@/contexts/FeatureFlagsContext";
import {
  Menu,
  Search,
  User,
  Bell,
  Phone,
  Mail,
  Briefcase,
  Bookmark,
  LogOut,
  Plus,
  Store,
  ChevronDown,
  HelpCircle,
  Globe,
  Shield,
  Building,
  LayoutDashboard,
  GitCompareArrows,
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileBottomNav } from "@/polymet/components/mobile-bottom-nav";
import { AIChat } from "@/polymet/components/ai-chat";
import { Footer } from "@/polymet/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { FRANCHISE_CATEGORIES, SMERGERS_BUSINESS_CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { savedCount } = useSavedListings();
  const { unreadCount } = useNotifications();

  // Feature flags
  const isAIChatEnabled = useFeatureFlag('ai_chat_advisor');

  // Smart Sticky Header - hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);

      if (currentScrollY < 80) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsHeaderVisible(false); // Scrolling down
      } else {
        setIsHeaderVisible(true); // Scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
        return;
      }
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };



  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Top Utility Bar - Hidden on mobile */}
      <div className="hidden md:block bg-trust-blue text-white text-xs">
        <div className="container mx-auto px-4">
          <div className="flex h-8 items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="tel:+911234567890" className="flex items-center gap-1 hover:text-white/80 transition-colors">
                <Phone className="h-3 w-3" />
                <span>+91 123 456 7890</span>
              </a>
              <a href="mailto:support@bizsearch.in" className="flex items-center gap-1 hover:text-white/80 transition-colors">
                <Mail className="h-3 w-3" />
                <span>support@bizsearch.in</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/help" className="flex items-center gap-1 hover:text-white/80 transition-colors">
                <HelpCircle className="h-3 w-3" />
                <span>Help Center</span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-white/80 transition-colors">
                  <Globe className="h-3 w-3" />
                  <span>English</span>
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[120px]">
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>हिंदी</DropdownMenuItem>
                  <DropdownMenuItem>தமிழ்</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Header - Smart Sticky */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          "bg-background/95 backdrop-blur-md border-b",
          isScrolled ? "border-border shadow-sm" : "border-transparent",
          !isHeaderVisible && isScrolled ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="BizSearch" className="h-10 w-auto object-contain block dark:hidden" />
              <img src="/logo-dark.png" alt="BizSearch" className="h-10 w-auto object-contain hidden dark:block" />
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Franchise — primary */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent text-sm font-semibold text-gray-900 hover:text-gray-900 data-[state=open]:text-gray-900 h-auto p-0">
                      <Link to="/franchises" className={isActivePath("/franchises") ? "text-growth-green" : ""}>
                        Find a Franchise
                      </Link>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[600px] p-4 bg-white rounded-md shadow-lg border">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b">
                          <h4 className="font-semibold text-sm">Franchise Categories</h4>
                          <Link to="/franchises" className="text-xs text-blue-600 hover:underline">
                            View All Franchises &rarr;
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {FRANCHISE_CATEGORIES.slice(0, 8).map((category) => (
                            <Link
                              key={category.id}
                              to={`/franchises?industry=${category.slug}`}
                              className="group block space-y-1 p-2 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <div className="font-medium text-sm text-gray-900 group-hover:text-blue-600">
                                {category.name}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {category.subcategories.slice(0, 3).map(s => s.name).join(", ")}...
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <Link
                    to="/franchise-map"
                    className={cn(
                      "ml-4 text-sm font-medium transition-colors hover:text-gray-900",
                      isActivePath("/franchise-map") ? "text-gray-900" : "text-gray-500"
                    )}
                  >
                    Locations
                  </Link>

                  <Link
                    to="/franchises"
                    className={cn(
                      "ml-4 text-sm font-medium transition-colors hover:text-gray-900 inline-flex items-center gap-1",
                      isActivePath("/franchises") ? "text-gray-900" : "text-gray-500"
                    )}
                  >
                    <GitCompareArrows className="h-3.5 w-3.5" />
                    Compare
                  </Link>

                  <Link
                    to="/add-franchise-listing"
                    className={cn(
                      "ml-4 text-sm font-medium transition-colors hover:text-gray-900",
                      isActivePath("/add-franchise-listing") ? "text-gray-900" : "text-gray-500"
                    )}
                  >
                    For Franchisors
                  </Link>

                  <Link
                    to="/help"
                    className={cn(
                      "ml-4 text-sm font-medium transition-colors hover:text-gray-900",
                      isActivePath("/help") ? "text-gray-900" : "text-gray-500"
                    )}
                  >
                    Resources
                  </Link>

                  {/* Business for Sale — secondary */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent text-sm font-medium text-gray-400 hover:text-gray-600 data-[state=open]:text-gray-600 h-auto p-0 ml-4">
                      <Link to="/businesses" className={isActivePath("/businesses") ? "text-gray-700" : ""}>
                        Businesses for Sale
                      </Link>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[600px] p-4 bg-white rounded-md shadow-lg border">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b">
                          <h4 className="font-semibold text-sm text-gray-600">Business Categories</h4>
                          <Link to="/businesses" className="text-xs text-blue-600 hover:underline">
                            View All &rarr;
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {SMERGERS_BUSINESS_CATEGORIES.slice(0, 8).map((category) => (
                            <Link
                              key={category.id}
                              to={`/businesses?category=${category.slug}`}
                              className="group block space-y-1 p-2 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <div className="font-medium text-sm text-gray-900 group-hover:text-blue-600">
                                {category.name}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {category.subcategories.slice(0, 3).map(s => s.name).join(", ")}...
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>


            {/* Right Side Actions */}
            < div className="flex items-center gap-1" >
              {/* List Business - Only for logged in users */}
              {
                user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm">List</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <Link to="/add-business-listing">
                        <DropdownMenuItem>
                          <Store className="mr-2 h-4 w-4" />
                          Sell Business
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/add-franchise-listing">
                        <DropdownMenuItem>
                          <Briefcase className="mr-2 h-4 w-4" />
                          List Franchise
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }

              {/* Search */}
              <Link to="/franchises" className="hidden md:block">
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                  <Search className="h-4 w-4" />
                </Button>
              </Link>

              {/* Saved - with count badge */}
              <Link to="/saved" className="hidden md:block">
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
                  <Bookmark className="h-4 w-4" />
                  {savedCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-[10px] font-medium bg-gray-900 text-white rounded-full">
                      {savedCount > 9 ? '9+' : savedCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Notifications */}
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-[10px] font-medium bg-red-500 text-white rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Theme Toggle */}
              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              {/* User Menu or Auth Buttons */}
              {
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-1 hidden md:flex">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                            {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {profile && (
                        <>
                          <div className="px-2 py-1.5">
                            <p className="text-sm font-medium">{profile.display_name}</p>
                            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                            <p className="text-[10px] text-gray-400 capitalize mt-0.5">{profile.role}</p>
                          </div>
                          <DropdownMenuSeparator />
                        </>
                      )}

                      {/* Role-Specific Dashboards - Check roles array */}
                      {(() => {
                        // Get roles from profile.roles array or fallback to profile.role
                        const userRoles: string[] = (profile as any)?.roles?.map((r: any) => r.role) || [profile?.role];
                        const hasRole = (role: string) => userRoles.includes(role);

                        return (
                          <>
                            {hasRole('admin') && (
                              <Link to="/admin">
                                <DropdownMenuItem className="text-purple-600 font-medium">
                                  <Shield className="mr-2 h-4 w-4" />
                                  Admin Dashboard
                                </DropdownMenuItem>
                              </Link>
                            )}

                            {(hasRole('advisor') || hasRole('broker')) && (
                              <Link to="/advisor/dashboard">
                                <DropdownMenuItem className="text-blue-600 font-medium">
                                  <Briefcase className="mr-2 h-4 w-4" />
                                  Advisor Dashboard
                                </DropdownMenuItem>
                              </Link>
                            )}

                            {hasRole('seller') && (
                              <Link to="/seller/dashboard">
                                <DropdownMenuItem className="text-green-600 font-medium">
                                  <Building className="mr-2 h-4 w-4" />
                                  Seller Dashboard
                                </DropdownMenuItem>
                              </Link>
                            )}

                            {hasRole('franchisor') && (
                              <Link to="/franchisor/dashboard">
                                <DropdownMenuItem className="text-orange-600 font-medium">
                                  <Store className="mr-2 h-4 w-4" />
                                  Franchisor Dashboard
                                </DropdownMenuItem>
                              </Link>
                            )}

                            {(hasRole('buyer') || hasRole('franchisee')) && (
                              <Link to="/buyer/dashboard">
                                <DropdownMenuItem className="text-indigo-600 font-medium">
                                  <User className="mr-2 h-4 w-4" />
                                  Buyer Dashboard
                                </DropdownMenuItem>
                              </Link>
                            )}
                          </>
                        );
                      })()}

                      <DropdownMenuSeparator />

                      {/* General Management - Visible to Everyone */}
                      {/* General Management - Visible to Everyone */}
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

                      <Link to="/my-applications">
                        <DropdownMenuItem>
                          <Briefcase className="mr-2 h-4 w-4" />
                          My Applications
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
                        className="text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2 ml-2 hidden md:flex">
                    <Link to="/login">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )
              }

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden ml-1 text-gray-500">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                      <span className="text-lg font-semibold">BizSearch</span>
                    </div>
                    <div className="flex-1 py-4">
                      <nav className="space-y-1 px-2">
                        {[
                          { name: "Find a Franchise", href: "/franchises" },
                          { name: "Locations", href: "/franchise-map" },
                          { name: "Smart Search", href: "/smart-search" },
                          { name: "For Franchisors", href: "/add-franchise-listing" },
                          { name: "Businesses for Sale", href: "/businesses" },
                          { name: "Help", href: "/help" },
                          { name: "About", href: "/about" },
                          { name: "Contact", href: "/contact" },
                        ].map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath(item.href)
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </nav>

                      {/* Franchise Categories - Mobile (primary) */}
                      <div className="mt-4 px-2">
                        <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                          Franchise Categories
                        </p>
                        <div className="space-y-1 max-h-36 overflow-y-auto">
                          {FRANCHISE_CATEGORIES.slice(0, 6).map((category) => (
                            <Link
                              key={category.id}
                              to={`/franchises?industry=${category.slug}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            >
                              {category.name}
                            </Link>
                          ))}
                          <Link
                            to="/franchises"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3 py-1.5 rounded-md text-sm text-blue-600 hover:bg-blue-50 font-medium"
                          >
                            View All Franchises →
                          </Link>
                        </div>
                      </div>

                      {/* Business Categories - Mobile (secondary) */}
                      <div className="mt-4 px-2">
                        <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                          Businesses for Sale
                        </p>
                        <div className="space-y-1 max-h-36 overflow-y-auto">
                          {SMERGERS_BUSINESS_CATEGORIES.slice(0, 6).map((category) => (
                            <Link
                              key={category.id}
                              to={`/businesses?category=${category.slug}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            >
                              {category.name}
                            </Link>
                          ))}
                          <Link
                            to="/businesses"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3 py-1.5 rounded-md text-sm text-blue-600 hover:bg-blue-50 font-medium"
                          >
                            View All Businesses →
                          </Link>
                        </div>
                      </div>

                      {user ? (
                        <div className="mt-6 px-2">
                          <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                            List on BizSearch
                          </p>
                          <Link
                            to="/add-franchise-listing"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50"
                          >
                            List Franchise
                          </Link>
                          <Link
                            to="/add-business-listing"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50"
                          >
                            Sell Business
                          </Link>
                          <div className="mt-4 px-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Theme</span>
                            <ThemeToggle />
                          </div>
                          <button
                            onClick={() => {
                              handleSignOut();
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full text-left mt-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Sign Out
                          </button>
                        </div>
                      ) : (
                        <div className="mt-6 px-4 space-y-3">
                          <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full justify-center">Sign In</Button>
                          </Link>
                          <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full justify-center">Get Started</Button>
                          </Link>
                          <div className="pt-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Theme</span>
                            <ThemeToggle />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div >
          </div >
        </div >
      </header >

      {/* Main Content */}
      < main className="flex-1 pb-20 md:pb-0" > {children}</main >

      {/* Mobile Bottom Navigation */}
      < MobileBottomNav />

      {/* AI Chat Widget - Only show if enabled via feature flag */}
      {isAIChatEnabled && <AIChat />}

      {/* Footer - Show on all pages */}
      <Footer />
    </div >
  );
}
