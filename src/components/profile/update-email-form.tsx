import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Check } from 'lucide-react';
import { updateEmailSchema } from '@/utils/validation';
import { formatZodError, formatSupabaseError } from '@/utils/validation';
import { toast } from 'sonner';

/**
 * UpdateEmailForm Component
 * 
 * Allows users to change their email address.
 * Requires re-verification of the new email.
 */
export function UpdateEmailForm() {
  const { profile, updateEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    newEmail: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    // Validate input
    const result = updateEmailSchema.safeParse(formData);
    if (!result.success) {
      setFieldErrors(formatZodError(result.error));
      return;
    }

    // Check if new email is same as current
    if (formData.newEmail === profile?.email) {
      setError('New email is the same as your current email');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await updateEmail(formData.newEmail);

      if (updateError) throw updateError;

      setSuccess(true);
      setFormData({ newEmail: '', password: '' });
      toast.success('Verification email sent! Please check your new email address.');
    } catch (err: any) {
      setError(formatSupabaseError(err));
      toast.error('Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-4">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-center">Verification Email Sent</CardTitle>
          <CardDescription className="text-center">
            Please check your new email address to confirm the change
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              We've sent a verification link to <strong>{formData.newEmail}</strong>.
              Click the link to confirm your new email address.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => setSuccess(false)}
            variant="outline"
            className="w-full mt-4"
          >
            Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Email Address</CardTitle>
        <CardDescription>
          Update your email address. You'll need to verify the new email.
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
            <Label htmlFor="currentEmail">Current Email</Label>
            <Input
              id="currentEmail"
              type="email"
              value={profile?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email</Label>
            <Input
              id="newEmail"
              type="email"
              required
              value={formData.newEmail}
              onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
              placeholder="newemail@example.com"
              disabled={loading}
              className={fieldErrors.newEmail ? 'border-red-500' : ''}
            />
            {fieldErrors.newEmail && (
              <p className="text-sm text-red-500">{fieldErrors.newEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Confirm Your Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your current password"
              disabled={loading}
              className={fieldErrors.password ? 'border-red-500' : ''}
            />
            {fieldErrors.password && (
              <p className="text-sm text-red-500">{fieldErrors.password}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter your password to confirm this change
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Email
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

