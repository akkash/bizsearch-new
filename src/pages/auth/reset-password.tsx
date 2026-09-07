import React from 'react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
