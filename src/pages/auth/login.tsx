import { SignInForm } from '@/components/auth/sign-in-form';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  );
}
