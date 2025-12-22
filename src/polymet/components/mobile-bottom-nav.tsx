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
      href: "/businesses",
      icon: Search,
      isActive:
        location.pathname.startsWith("/businesses") ||
        location.pathname.startsWith("/franchises"),
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
