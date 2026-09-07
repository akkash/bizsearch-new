import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SkeletonLoaderProps {
  type?: "card" | "list" | "detail";
  count?: number;
}

export function SkeletonLoader({ type = "card", count = 3 }: SkeletonLoaderProps) {
  if (type === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="overflow-hidden border-border bg-card animate-pulse">
            <div className="h-48 bg-muted" />
            <CardContent className="p-4 space-y-3">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-5/6" />
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-8 bg-muted rounded flex-1" />
                <div className="h-8 bg-muted rounded flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex gap-4 p-4 bg-card border border-border rounded-lg animate-pulse"
          >
            <div className="h-24 w-24 bg-muted rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-96 bg-muted rounded-lg" />
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
    </div>
  );
}
