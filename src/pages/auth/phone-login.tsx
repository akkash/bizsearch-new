import React from "react";
import { PhoneSignInForm } from "@/components/auth/phone-sign-in-form";
import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

export function PhoneLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">BizSearch</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Sign in with Phone
          </h1>
          <p className="text-muted-foreground">
            Enter your phone number and password to access your account
          </p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <PhoneSignInForm />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
