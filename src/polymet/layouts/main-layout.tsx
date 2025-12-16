import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import {
  Menu,
  X,
  Search,
  User,
  Heart,
  Bell,
  Phone,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Bookmark,
  LogOut,
  Plus,
  Store,
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

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { savedCount } = useSavedListings();
  const { unreadCount } = useNotifications();

  const handleSearch = () => {
    // This will be handled by Link component instead
    console.log("Search clicked");
  };

  const handleNotifications = () => {
    navigate("/notifications");
  };

  const handleSavedItems = () => {
    navigate("/saved");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleSavedListings = () => {
    navigate("/saved");
  };

  const handleNotificationsMenu = () => {
    navigate("/notifications");
  };

  const handleHelpSupport = () => {
    // This will be handled by Link component instead
    console.log("Help & Support clicked");
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
        return;
      }
      // Force navigation after successful sign out
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleAIChatOpen = () => {
    setShowAIChat(true);
  };

  const navigation = [
    { name: "Home", href: "/", icon: Building2 },
    { name: "Businesses", href: "/businesses", icon: Building2 },
    { name: "Franchises", href: "/franchises", icon: Briefcase },
    { name: "About", href: "/about", icon: HelpCircle },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">BizSearch</span>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                AI-Powered
              </Badge>
            </Link>

            {/* Desktop Navigation - Business & Franchise Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/businesses"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActivePath("/businesses")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Business for Sale
              </Link>
              <Link
                to="/franchises"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActivePath("/franchises")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Franchise
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Sell Business Dropdown - NEW */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="hidden sm:flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>List Your Business</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <Link to="/add-business-listing">
                      <DropdownMenuItem>
                        <Store className="mr-2 h-4 w-4" />
                        <div>
                          <div className="font-medium">Sell a Business</div>
                          <div className="text-xs text-muted-foreground">
                            List your business for sale
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/add-franchise-listing">
                      <DropdownMenuItem>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <div>
                          <div className="font-medium">List Franchise</div>
                          <div className="text-xs text-muted-foreground">
                            Offer franchise opportunities
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* AI Chat Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIChatOpen}
                className="hidden sm:flex items-center space-x-2"
                data-ai-chat
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">AI Advisor</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </Button>

              {/* Search Button */}
              <Link to="/businesses">
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Search className="h-4 w-4" />
                </Button>
              </Link>

              {/* Saved Items - Enhanced */}
              <Link to="/saved">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                >
                  <Bookmark className="h-4 w-4" />
                  {savedCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-blue-600">
                      {savedCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Notifications */}
              <Link to="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu - Show only if logged in */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {profile && (
                      <div className="px-2 py-1.5 text-sm">
                        <p className="font-medium">{profile.display_name}</p>
                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                      </div>
                    )}
                    <DropdownMenuSeparator />
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
                    <Link to="/saved">
                      <DropdownMenuItem>
                        <Bookmark className="mr-2 h-4 w-4" />
                        <div className="flex items-center justify-between w-full">
                          <span>Saved Listings</span>
                          {savedCount > 0 && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {savedCount}
                            </Badge>
                          )}
                        </div>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/notifications">
                      <DropdownMenuItem>
                        <Bell className="mr-2 h-4 w-4" />
                        <div className="flex items-center justify-between w-full">
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <Badge className="ml-2 text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <Link to="/contact">
                      <DropdownMenuItem onClick={handleHelpSupport}>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Help & Support
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="default" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActivePath(item.href)
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />

                        <span>{item.name}</span>
                      </Link>
                    ))}

                    {/* List Your Business - Mobile */}
                    <div className="space-y-2">
                      <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                        List Your Business
                      </div>
                      <Link
                        to="/add-business-listing"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground"
                      >
                        <Building2 className="h-5 w-5" />

                        <div className="flex flex-col">
                          <span>Sell Your Business</span>
                          <span className="text-xs opacity-80">
                            List your business for sale
                          </span>
                        </div>
                      </Link>
                      <Link
                        to="/add-franchise-listing"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Briefcase className="h-5 w-5" />

                        <div className="flex flex-col">
                          <span>List Franchise</span>
                          <span className="text-xs opacity-80">
                            Offer franchise opportunities
                          </span>
                        </div>
                      </Link>
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
