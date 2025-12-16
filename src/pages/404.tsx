import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <svg
            className="w-64 h-64 mx-auto"
            viewBox="0 0 200 200"
            fill="none"
          >
            {/* Lost icon illustration */}
            <circle cx="100" cy="100" r="80" fill="#DBEAFE" opacity="0.5" />
            <circle cx="100" cy="100" r="60" fill="#BFDBFE" opacity="0.7" />
            <path
              d="M70 90 Q100 60 130 90"
              stroke="#3B82F6"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="80" cy="95" r="5" fill="#3B82F6" />
            <circle cx="120" cy="95" r="5" fill="#3B82F6" />
            <path
              d="M75 120 Q100 130 125 120"
              stroke="#3B82F6"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 404 Text */}
        <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Sorry, the page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
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

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t">
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
