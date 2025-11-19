import React from 'react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <ResetPasswordForm />
    </div>
  );
}

