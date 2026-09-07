import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-8xl font-bold text-growth-green mb-4 font-mono tabular-nums">404</h1>
        <h2 className="text-3xl font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto bg-growth-green hover:bg-growth-green/90 text-white">
              <Home className="h-5 w-5" />
              Go to Homepage
            </Button>
          </Link>
          <Link to="/businesses">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 w-full sm:w-auto"
            >
              <Search className="h-5 w-5" />
              Browse Businesses
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            If you believe this is an error, please contact our support team.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
