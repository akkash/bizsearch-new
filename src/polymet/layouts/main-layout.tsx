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
  MapPin,
  Building2,
  Briefcase,
  Bookmark,
  LogOut,
  Plus,
  Store,
  ChevronDown,
  HelpCircle,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { FRANCHISE_CATEGORIES, SMERGERS_BUSINESS_CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { savedCount } = useSavedListings();
  const { unreadCount } = useNotifications();
  const [categoryTab, setCategoryTab] = useState<"business" | "franchise">("business");

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

  const handleAIChatOpen = () => {
    setShowAIChat(true);
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
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/businesses"
                className={`text-sm font-medium transition-colors hover:text-gray-900 ${isActivePath("/businesses")
                  ? "text-gray-900"
                  : "text-gray-500"
                  }`}
              >
                Business for Sale
              </Link>
              <Link
                to="/franchises"
                className={`text-sm font-medium transition-colors hover:text-gray-900 ${isActivePath("/franchises")
                  ? "text-gray-900"
                  : "text-gray-500"
                  }`}
              >
                Franchise
              </Link>

              {/* Categories Mega Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    Categories
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[700px] p-0">
                  {/* Category Type Tabs */}
                  <div className="flex border-b">
                    <button
                      onClick={() => setCategoryTab("business")}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${categoryTab === "business"
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      Business Categories
                    </button>
                    <button
                      onClick={() => setCategoryTab("franchise")}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${categoryTab === "franchise"
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      Franchise Categories
                    </button>
                  </div>

                  {/* Business Categories */}
                  {categoryTab === "business" && (
                    <div className="grid grid-cols-3 gap-4 p-4">
                      {SMERGERS_BUSINESS_CATEGORIES.slice(0, 12).map((category) => (
                        <div key={category.id} className="space-y-2">
                          <Link
                            to={`/businesses?category=${category.slug}`}
                            className="font-medium text-sm text-gray-900 hover:text-blue-600 block"
                          >
                            {category.name}
                          </Link>
                          <div className="space-y-1">
                            {category.subcategories.slice(0, 4).map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/businesses?category=${category.slug}&subcategory=${sub.slug}`}
                                className="block text-xs text-gray-500 hover:text-gray-900 py-0.5"
                              >
                                {sub.name}
                              </Link>
                            ))}
                            {category.subcategories.length > 4 && (
                              <Link
                                to={`/businesses?category=${category.slug}`}
                                className="block text-xs text-blue-600 hover:text-blue-700 py-0.5 font-medium"
                              >
                                +{category.subcategories.length - 4} more
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Franchise Categories */}
                  {categoryTab === "franchise" && (
                    <div className="grid grid-cols-3 gap-4 p-4">
                      {FRANCHISE_CATEGORIES.map((category) => (
                        <div key={category.id} className="space-y-2">
                          <Link
                            to={`/franchises?category=${category.slug}`}
                            className="font-medium text-sm text-gray-900 hover:text-blue-600 block"
                          >
                            {category.name}
                          </Link>
                          <div className="space-y-1">
                            {category.subcategories.slice(0, 4).map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/franchises?category=${category.slug}&subcategory=${sub.slug}`}
                                className="block text-xs text-gray-500 hover:text-gray-900 py-0.5"
                              >
                                {sub.name}
                              </Link>
                            ))}
                            {category.subcategories.length > 4 && (
                              <Link
                                to={`/franchises?category=${category.slug}`}
                                className="block text-xs text-blue-600 hover:text-blue-700 py-0.5 font-medium"
                              >
                                +{category.subcategories.length - 4} more
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1">
              {/* List Business - Only for logged in users */}
              {user && (
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
              )}

              {/* Search */}
              <Link to="/businesses">
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                  <Search className="h-4 w-4" />
                </Button>
              </Link>

              {/* Saved - with count badge */}
              <Link to="/saved">
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
              <ThemeToggle />

              {/* User Menu or Auth Buttons */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-1">
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
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <Link to="/profile">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/my-listings">
                      <DropdownMenuItem>
                        <Store className="mr-2 h-4 w-4" />
                        My Listings
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
                <div className="flex items-center gap-2 ml-2">
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
              )}

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
                          { name: "Businesses", href: "/businesses" },
                          { name: "Franchises", href: "/franchises" },
                          { name: "Advisors", href: "/advisors" },
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

                      {/* Categories Section - Mobile */}
                      <div className="mt-4 px-2">
                        <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                          Business Categories
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

                      {/* Franchise Categories - Mobile */}
                      <div className="mt-4 px-2">
                        <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                          Franchise Categories
                        </p>
                        <div className="space-y-1 max-h-36 overflow-y-auto">
                          {FRANCHISE_CATEGORIES.slice(0, 6).map((category) => (
                            <Link
                              key={category.id}
                              to={`/franchises?category=${category.slug}`}
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

                      {user && (
                        <div className="mt-6 px-2">
                          <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                            List Your Business
                          </p>
                          <Link
                            to="/add-business-listing"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50"
                          >
                            Sell Business
                          </Link>
                          <Link
                            to="/add-franchise-listing"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50"
                          >
                            List Franchise
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* AI Chat Widget - Only show if enabled via feature flag */}
      {isAIChatEnabled && showAIChat && <AIChat />}

      {/* Footer - Show on all pages */}
      <Footer />
    </div>
  );
}
