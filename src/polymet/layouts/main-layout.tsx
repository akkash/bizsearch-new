import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useNotifications } from "@/contexts/NotificationsContext";
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
import { FRANCHISE_CATEGORIES } from "@/data/categories";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { savedCount } = useSavedListings();
  const { unreadCount } = useNotifications();

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
      {/* Header - Minimalistic Professional Design */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Logo - Clean and Simple */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight">BizSearch</span>
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
                <DropdownMenuContent align="center" className="w-[600px] p-4">
                  <div className="grid grid-cols-3 gap-4">
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
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-[10px] font-medium bg-red-500 text-white rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>

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
                          Categories
                        </p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {FRANCHISE_CATEGORIES.slice(0, 8).map((category) => (
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
                            View All Categories →
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
      <MobileBottomNav onAIChatOpen={handleAIChatOpen} />

      {/* AI Chat Widget */}
      {showAIChat && <AIChat />}

      {/* Footer */}
      <footer className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">BizSearch</span>
              </div>
              <p className="text-sm text-muted-foreground">
                India's leading AI-powered platform for business acquisitions
                and franchise opportunities.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/businesses"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Browse Businesses
                  </Link>
                </li>
                <li>
                  <Link
                    to="/franchises"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Franchise Opportunities
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sell"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sell Your Business
                  </Link>
                </li>
                <li>
                  <Link
                    to="/valuation"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Business Valuation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/help"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/guides"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Buying Guides
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/privacy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cookies"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/disclaimer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 BizSearch. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Badge variant="outline" className="text-xs">
                Trusted Platform
              </Badge>
              <Badge variant="outline" className="text-xs">
                Verified Listings
              </Badge>
              <Badge variant="outline" className="text-xs">
                Secure Transactions
              </Badge>
            </div>
          </div>
        </div>
      </footer>

      {/* Footer - Only show on non-home pages since home has its own */}
      {location.pathname !== "/" && <Footer />}
    </div>
  );
}
