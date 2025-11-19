import React from 'react';
import { SignInForm } from '@/components/auth/sign-in-form';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <SignInForm />
    </div>
  );
}
