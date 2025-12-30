import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Eye, EyeOff, Mail, CheckCircle, RefreshCw, User, Lock, ArrowRight } from 'lucide-react';
import { signUpSchema } from '@/utils/validation';
import {
  formatZodError,
  formatSupabaseError,
  validatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
} from '@/utils/validation';
import type { UserRole } from '@/types/auth.types';
import { supabase } from '@/lib/supabase';

export function SignUpForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { } = useAuth();

  // Get redirect param to use after signup
  const redirectParam = searchParams.get('redirect');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [existingUnconfirmedUser, setExistingUnconfirmedUser] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'buyer' as UserRole,
    acceptTerms: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordStrength = validatePasswordStrength(formData.password);

  const handleResendConfirmation = async () => {
    setResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });

      if (error) throw error;
      setResendSuccess(true);
    } catch (err: any) {
      setError(formatSupabaseError(err));
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setExistingUnconfirmedUser(false);

    // Validate input
    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      setFieldErrors(formatZodError(result.error));
      return;
    }

    setLoading(true);

    try {
      // Try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.displayName,
            role: formData.role,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Check if user already exists but is unconfirmed
      // Supabase returns the user but with identities as empty array for existing unconfirmed users
      if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        // User already exists but hasn't confirmed email
        setExistingUnconfirmedUser(true);
        setLoading(false);
        return;
      }

      // Check if signup response already contains a session (auto-confirm enabled)
      if (signUpData.session) {
        // User is logged in, redirect to onboarding (which will then redirect to final destination)
        navigate(redirectParam ? `/onboarding?redirect=${encodeURIComponent(redirectParam)}` : '/onboarding', { replace: true });
        return;
      }

      // Wait a moment for auth state to update (for some edge cases)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Double-check if we have a session
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentSession) {
        // User is logged in, redirect to onboarding (which will then redirect to final destination)
        navigate(redirectParam ? `/onboarding?redirect=${encodeURIComponent(redirectParam)}` : '/onboarding', { replace: true });
      } else {
        // Email confirmation required - new user
        setSignupSuccess(true);
      }
    } catch (err: any) {
      // Check for "User already registered" error
      const errorMessage = err.message || '';
      if (errorMessage.toLowerCase().includes('already registered') ||
        errorMessage.toLowerCase().includes('already exists')) {
        setExistingUnconfirmedUser(true);
      } else {
        setError(formatSupabaseError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // Show success message if signup was successful but email confirmation needed
  if (signupSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation link to <strong>{formData.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Click the link in your email to activate your account. The link will expire in 24 hours.
            </AlertDescription>
          </Alert>

          {resendSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Confirmation email sent! Check your inbox.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>Didn't receive the email?</p>
            <ul className="mt-2 space-y-1">
              <li>• Check your spam folder</li>
              <li>• Make sure you entered the correct email</li>
            </ul>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleResendConfirmation}
            disabled={resending}
          >
            {resending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Confirmation Email
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate(redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login')}
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show UI for existing unconfirmed user
  if (existingUnconfirmedUser) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle>Email Already Registered</CardTitle>
          <CardDescription>
            An account with <strong>{formData.email}</strong> already exists but hasn't been verified yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-amber-50 border-amber-200">
            <Mail className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              We can send you a new confirmation email to verify your account.
            </AlertDescription>
          </Alert>

          {resendSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Confirmation email sent! Check your inbox.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            variant="default"
            className="w-full"
            onClick={handleResendConfirmation}
            disabled={resending}
          >
            {resending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Confirmation Email
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setExistingUnconfirmedUser(false);
                setFormData({ ...formData, email: '' });
              }}
            >
              Use Different Email
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => navigate(redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login')}
            >
              Sign In Instead
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        {/* Brand Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/logo.png"
            alt="BizSearch"
            className="h-12 w-auto"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
        <CardDescription className="text-base">
          Join <span className="font-semibold text-primary">BizSearch</span> to discover opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="displayName"
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="John Doe"
                disabled={loading}
                className={`pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${fieldErrors.display_name ? 'border-red-500 focus:border-red-500' : ''}`}
              />
            </div>
            {fieldErrors.display_name && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                {fieldErrors.display_name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                disabled={loading}
                className={`pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">I am a</Label>
            <Select
              value={formData.role}
              onValueChange={(value: any) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger className="h-11 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer - Looking to buy a business</SelectItem>
                <SelectItem value="seller">Seller - Looking to sell my business</SelectItem>
                <SelectItem value="franchisee">Franchisee - Looking for franchise opportunities</SelectItem>
                <SelectItem value="franchisor">Franchisor - Offering franchise opportunities</SelectItem>
                <SelectItem value="advisor">Advisor - Business consultant</SelectItem>
                <SelectItem value="broker">Broker - Business broker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                disabled={loading}
                className={`pl-10 pr-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                {fieldErrors.password}
              </p>
            )}

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span
                    className={`font-medium ${passwordStrength.score <= 1
                      ? 'text-red-500'
                      : passwordStrength.score === 2
                        ? 'text-orange-500'
                        : passwordStrength.score === 3
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                  >
                    {getPasswordStrengthLabel(passwordStrength.score)}
                  </span>
                </div>
                <Progress
                  value={(passwordStrength.score / 4) * 100}
                  className={`h-2 ${getPasswordStrengthColor(passwordStrength.score)}`}
                />
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                disabled={loading}
                className={`pl-10 pr-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, acceptTerms: checked as boolean })
              }
              disabled={loading}
            />
            <Label
              htmlFor="acceptTerms"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I accept the{' '}
              <a href="/terms" className="text-primary hover:underline" target="_blank">
                Terms and Conditions
              </a>
            </Label>
          </div>
          {fieldErrors.acceptTerms && (
            <p className="text-sm text-red-500">{fieldErrors.acceptTerms}</p>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            disabled={loading || passwordStrength.score < 3}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Already a member?</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11"
            onClick={() => navigate(redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login')}
          >
            Sign In Instead
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
