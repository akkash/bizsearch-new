import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  const handleSearch = () => {
    // This will be handled by Link component instead
    console.log("Search clicked");
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    // In a real app, this would show a notifications panel
    console.log("Notifications clicked");
  };

  const handleSavedItems = () => {
    // In a real app, this would navigate to saved items page
    console.log("Saved items clicked");
    alert("Saved items feature - would navigate to saved listings page");
  };

  const handleProfile = () => {
    console.log("Profile clicked");
    alert("Profile feature - would navigate to user profile page");
  };

  const handleSavedListings = () => {
    console.log("Saved listings clicked");
    alert("Saved listings feature - would show user's saved listings");
  };

  const handleNotificationsMenu = () => {
    console.log("Notifications menu clicked");
    alert("Notifications feature - would show user notifications");
  };

  const handleHelpSupport = () => {
    // This will be handled by Link component instead
    console.log("Help & Support clicked");
  };

  const handleSignOut = () => {
    console.log("Sign out clicked");
    alert("Sign out feature - would log out the user");
  };

  const handleAIChatOpen = () => {
    console.log("AI Chat opened from bottom nav");
    alert("AI Chat feature - would open floating AI chat interface");
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
              {/* List Your Business Dropdown - Removed per user request */}

              {/* AI Chat Button - Prominent */}
              <Button
                variant="default"
                size="sm"
                onClick={handleAIChatOpen}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSavedItems}
                className="relative"
              >
                <Bookmark className="h-4 w-4" />

                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-blue-600">
                  5
                </Badge>
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={handleNotifications}
              >
                <Bell className="h-4 w-4" />

                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://github.com/polymet-ai.png" />

                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <Link to="/profile">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={handleSavedListings}>
                    <Bookmark className="mr-2 h-4 w-4" />

                    <div className="flex items-center justify-between w-full">
                      <span>Saved Listings</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        5
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleNotificationsMenu}>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  <Link to="/contact">
                    <DropdownMenuItem onClick={handleHelpSupport}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help & Support
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
    </div>
  );
}
