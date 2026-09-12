import { Link, useLocation } from "react-router-dom";
import { Home, Search, Bookmark, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationsContext";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/franchises",
    label: "Search",
    icon: Search,
    match: (p: string) => p.startsWith("/franchises") || p.startsWith("/franchise/"),
  },
  {
    href: "/saved",
    label: "Saved",
    icon: Bookmark,
    match: (p: string) => p.startsWith("/saved"),
  },
  {
    href: "/messages",
    label: "Inbox",
    icon: Inbox,
    match: (p: string) =>
      p.startsWith("/messages") || p.startsWith("/my-enquiries") || p.startsWith("/my-applications"),
  },
] as const;

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto grid h-14 max-w-lg grid-cols-4">
        {tabs.map((tab) => {
          const active = tab.match(location.pathname);
          const showBadge = tab.href === "/messages" && user && unreadCount > 0;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span className="relative">
                <tab.icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                {showBadge && (
                  <span className="absolute -right-2 -top-1 min-w-[14px] rounded-none bg-foreground px-1 text-center text-[9px] font-semibold text-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
