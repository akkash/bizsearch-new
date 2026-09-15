import { SignUpForm } from '@/components/auth/sign-up-form';
import { SEOHead } from '@/components/seo-head';

export function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEOHead title="Create an account" description="Create a BizSearch account." noIndex canonicalUrl="/signup" />
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
}
