import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, MessageCircle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MobileBottomNavProps {
  onAIChatOpen?: () => void;
  className?: string;
}

export function MobileBottomNav({
  onAIChatOpen,
  className,
}: MobileBottomNavProps) {
  const location = useLocation();

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
      badge: 5, // Example saved items count
    },
    {
      name: "AI Chat",
      href: "#",
      icon: MessageCircle,
      isActive: false,
      isAIChat: true,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      isActive: location.pathname === "/profile",
    },
  ];

  const handleNavClick = (item: any) => {
    if (item.isAIChat && onAIChatOpen) {
      onAIChatOpen();
    }
  };

  return (
    <div className={`md:hidden ${className}`}>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const IconComponent = item.icon;

            if (item.isAIChat) {
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-3 relative"
                >
                  <div className="relative">
                    <div className="p-1.5 bg-primary rounded-full">
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <span className="text-xs font-medium text-primary">
                    {item.name}
                  </span>
                </Button>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors relative ${
                  item.isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <IconComponent
                    className={`h-5 w-5 ${item.isActive ? "text-primary" : ""}`}
                  />

                  {item.badge && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom padding to prevent content from being hidden behind nav */}
      <div className="h-20" />
    </div>
  );
}
