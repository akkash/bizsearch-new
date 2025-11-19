import React from 'react';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <ForgotPasswordForm />
    </div>
  );
}

