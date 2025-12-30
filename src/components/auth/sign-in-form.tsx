import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function SignInForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signIn, resetPasswordRequest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Get the redirect path from query params OR location state (set by ProtectedRoute)
  const redirectParam = searchParams.get('redirect');
  const from = redirectParam || (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setFieldErrors({ password: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    const { error: signInError } = await signIn({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    // Small delay to ensure profile is loaded
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user needs onboarding (profile incomplete)
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('phone, city, state')
          .eq('id', currentUser.id)
          .single();

        const needsOnboarding = !profileData?.phone || !profileData?.city || !profileData?.state;

        if (needsOnboarding) {
          navigate('/onboarding', { replace: true });
          return;
        }
      }
    } catch (err) {
      console.warn('Could not check onboarding status:', err);
    }

    // Redirect to the intended page or home
    navigate(from, { replace: true });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const { error: resetError } = await resetPasswordRequest(email);

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setResetEmailSent(true);
  };

  if (showForgotPassword) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resetEmailSent ? (
              <Alert>
                <AlertDescription>
                  Password reset email sent! Check your inbox and follow the link to reset your password.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => {
                setShowForgotPassword(false);
                setError(null);
                setResetEmailSent(false);
              }}
            >
              Back to Sign In
            </Button>
          </form>
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
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
        <CardDescription className="text-base">
          Sign in to continue to <span className="font-semibold text-primary">BizSearch</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                }}
                className={`pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                required
                disabled={loading}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-xs text-primary hover:text-primary/80"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </Button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                }}
                className={`pl-10 pr-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                required
                disabled={loading}
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
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={loading}
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm font-normal text-muted-foreground cursor-pointer"
            >
              Remember me for 30 days
            </Label>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
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
              <span className="bg-white px-2 text-muted-foreground">New to BizSearch?</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11"
            onClick={() => navigate(redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : '/signup')}
          >
            Create an Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
