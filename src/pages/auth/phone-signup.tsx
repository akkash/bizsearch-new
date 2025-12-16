import React from 'react';
import { PhoneSignUpForm } from '@/components/auth/phone-sign-up-form';

export default function PhoneSignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <PhoneSignUpForm />
    </div>
  );
}
