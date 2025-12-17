import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Eye, EyeOff, Phone, KeyRound } from 'lucide-react';
import {
  validatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  formatSupabaseError,
} from '@/utils/validation';
import type { UserRole } from '@/types/auth.types';

export function PhoneSignUpForm() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'buyer' as UserRole,
    acceptTerms: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordStrength = validatePasswordStrength(formData.password);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional)
    if (formData.phone && !formData.phone.match(/^\+?[1-9]\d{1,14}$/)) {
      errors.phone = 'Please enter a valid phone number with country code (e.g., +919876543210)';
    }

    // Display name validation
    if (formData.displayName.length < 2) {
      errors.displayName = 'Name must be at least 2 characters';
    }

    // Password validation
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (passwordStrength.score < 3) {
      errors.password = 'Password is too weak. Please use a stronger password.';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }

    // Terms acceptance
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const signUpData: any = {
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        role: formData.role,
      };
      
      // Add phone if provided
      if (formData.phone) {
        signUpData.phone = formData.phone;
      }
      
      const { error: signUpError } = await signUp(signUpData);

      if (signUpError) throw signUpError;

      // Wait a moment for the database trigger to create the profile
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to home page
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(formatSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Join BizSearch with your email and phone number
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
            <Label htmlFor="displayName">Full Name</Label>
            <Input
              id="displayName"
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="John Doe"
              disabled={loading}
              className={fieldErrors.displayName ? 'border-red-500' : ''}
            />
            {fieldErrors.displayName && (
              <p className="text-sm text-red-500">{fieldErrors.displayName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+919876543210"
                className={fieldErrors.phone ? 'border-red-500 pl-10' : 'pl-10'}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +91 for India, +1 for USA)
            </p>
            {fieldErrors.phone && (
              <p className="text-sm text-red-500">{fieldErrors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              disabled={loading}
              className={fieldErrors.email ? 'border-red-500' : ''}
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">I am a</Label>
            <Select
              value={formData.role}
              onValueChange={(value: any) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer - Looking to buy a business</SelectItem>
                <SelectItem value="seller">Seller - Looking to sell my business</SelectItem>
                <SelectItem value="franchisee">Franchisee - Looking for franchise opportunities</SelectItem>
                <SelectItem value="franchisor">Franchisor - Offering franchise opportunities</SelectItem>
                <SelectItem value="advisor">Advisor - Business consultant</SelectItem>
                <SelectItem value="broker">Broker - Business broker</SelectItem>
                <SelectItem value="admin">Admin - Platform administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                disabled={loading}
                className={fieldErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
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
              <p className="text-sm text-red-500">{fieldErrors.password}</p>
            )}

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span
                    className={`font-medium ${
                      passwordStrength.score <= 1
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                disabled={loading}
                className={fieldErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
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
              <p className="text-sm text-red-500">{fieldErrors.confirmPassword}</p>
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
            className="w-full"
            disabled={loading || passwordStrength.score < 3}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => navigate('/login')}
            >
              Sign in
            </Button>
          </p>

          {/* Email Sign Up Option */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/signup')}
            disabled={loading}
          >
            Sign up with Email
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
