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
  { name: "Businesses", href: "/businesses" },
  { name: "Franchises", href: "/franchises" },
  { name: "Buy a Business", href: "/smart-search" },
  { name: "Sell a Business", href: "/add-business-listing" },
];

const TOOLS_LINKS = [
  { name: "Smart Search", href: "/smart-search", icon: Search },
  { name: "Business Valuation", href: "/business-valuation", icon: Calculator },
  { name: "Franchise Map", href: "/franchise-map", icon: Store },
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

              <Link to="/add-business-listing" className="hidden sm:block ml-1">
                <Button
                  size="sm"
                  className="bg-growth-green hover:bg-growth-green/90 text-white font-medium"
                >
                  List Your Business
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
                          to="/add-business-listing"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button className="w-full bg-growth-green hover:bg-growth-green/90 text-white">
                            List Your Business
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
