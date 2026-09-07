import React from "react";
import { PhoneSignInForm } from "@/components/auth/phone-sign-in-form";
import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

export function PhoneLoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">BizSearch</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Sign in with Phone
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your phone number and password to access your account
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <PhoneSignInForm />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="text-growth-green hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-growth-green hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
