import React from "react";
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

const EMPTY_COPY = "No details found in the table.";

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
      defaultTitle: EMPTY_COPY,
      defaultDescription: "Try a broader search or clear filters.",
      defaultActionText: "Clear filters",
    },
    "no-data": {
      defaultTitle: EMPTY_COPY,
      defaultDescription: "Listings will appear here when they are published.",
      defaultActionText: "Browse franchises",
    },
    error: {
      defaultTitle: EMPTY_COPY,
      defaultDescription: "Something went wrong while loading. Try again.",
      defaultActionText: "Try again",
    },
    "coming-soon": {
      defaultTitle: EMPTY_COPY,
      defaultDescription: "This section is not available yet.",
      defaultActionText: "Browse franchises",
    },
  };

  const config = configs[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-border bg-card shadow-[var(--shadow-sm)]">
      <h3 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground mb-3">
        {title || config.defaultTitle}
      </h3>

      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {description || config.defaultDescription}
      </p>

      {(actionText || actionLink || onAction) && (
        <>
          {actionLink ? (
            <Link to={actionLink}>
              <Button size="lg">{actionText || config.defaultActionText}</Button>
            </Link>
          ) : (
            <Button size="lg" onClick={onAction}>
              {actionText || config.defaultActionText}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
