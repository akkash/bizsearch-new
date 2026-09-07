import React from "react";
import { Building2, TrendingUp, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  type?: "no-results" | "no-data" | "error" | "coming-soon";
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export function EmptyState({
  type = "no-results",
  title,
  description,
  actionText,
  actionLink,
  onAction,
}: EmptyStateProps) {
  const configs = {
    "no-results": {
      icon: Search,
      defaultTitle: "No businesses match all your filters.",
      defaultDescription:
        "Relax filters or try a broader search. Suggested: businesses under ₹1Cr, food businesses in Chennai, or similar listings.",
      defaultActionText: "Relax Filters",
      illustration: (
        <svg
          className="w-48 h-48 mx-auto mb-6 opacity-50"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="80" fill="currentColor" className="text-muted" opacity="0.3" />
          <circle cx="100" cy="100" r="60" fill="currentColor" className="text-muted" opacity="0.4" />
          <path
            d="M100 60 L100 100 L130 130"
            stroke="currentColor"
            className="text-muted-foreground"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    "no-data": {
      icon: Building2,
      defaultTitle: "No details found in the table.",
      defaultDescription:
        "Listings will appear here when available. You can also list a business or browse franchises.",
      defaultActionText: "Browse Franchises",
      illustration: (
        <svg
          className="w-48 h-48 mx-auto mb-6 opacity-50"
          viewBox="0 0 200 200"
          fill="none"
        >
          <rect x="40" y="60" width="120" height="100" fill="currentColor" className="text-muted" opacity="0.3" rx="8" />
          <rect x="60" y="80" width="30" height="25" fill="currentColor" className="text-muted" opacity="0.5" rx="2" />
          <rect x="110" y="80" width="30" height="25" fill="currentColor" className="text-muted" opacity="0.5" rx="2" />
        </svg>
      ),
    },
    error: {
      icon: AlertCircle,
      defaultTitle: "Unable to load businesses.",
      defaultDescription:
        "Something went wrong while loading listings. Try again.",
      defaultActionText: "Try Again",
      illustration: (
        <svg
          className="w-48 h-48 mx-auto mb-6 opacity-50"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="80" fill="#FEE2E2" />
          <circle cx="100" cy="100" r="60" fill="#FECACA" />
          <path
            d="M100 70 L100 110"
            stroke="#EF4444"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="100" cy="130" r="5" fill="#EF4444" />
        </svg>
      ),
    },
    "coming-soon": {
      icon: TrendingUp,
      defaultTitle: "Coming Soon",
      defaultDescription:
        "We're working on bringing you amazing opportunities in this category. Stay tuned!",
      defaultActionText: "Explore Other Categories",
      illustration: (
        <svg
          className="w-64 h-64 mx-auto mb-6 opacity-50"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="80" fill="#DBEAFE" />
          <circle cx="100" cy="100" r="60" fill="#BFDBFE" />
          <path
            d="M80 100 L95 115 L120 85"
            stroke="#3B82F6"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {config.illustration}

      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-2">
        {title || config.defaultTitle}
      </h3>

      <p className="text-muted-foreground max-w-md mb-6">
        {description || config.defaultDescription}
      </p>

      {(actionText || actionLink || onAction) && (
        <>
          {actionLink ? (
            <Link to={actionLink}>
              <Button size="lg" className="gap-2">
                {actionText || config.defaultActionText}
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={onAction} className="gap-2">
              {actionText || config.defaultActionText}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
