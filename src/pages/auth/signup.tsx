import { SignUpForm } from '@/components/auth/sign-up-form';

export function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
}
