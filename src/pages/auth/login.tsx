import { SignInForm } from '@/components/auth/sign-in-form';
import { SEOHead } from '@/components/seo-head';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEOHead title="Sign in" description="Sign in to BizSearch." noIndex canonicalUrl="/login" />
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  );
}
