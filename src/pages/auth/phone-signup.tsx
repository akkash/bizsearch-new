import React from 'react';
import { PhoneSignUpForm } from '@/components/auth/phone-sign-up-form';

export default function PhoneSignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <PhoneSignUpForm />
      </div>
    </div>
  );
}
