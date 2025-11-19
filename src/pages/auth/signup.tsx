import React from 'react';
import { SignUpForm } from '@/components/auth/sign-up-form';

export function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <SignUpForm />
    </div>
  );
}
