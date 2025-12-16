import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, KeyRound } from 'lucide-react';

export function SignInForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, verifyEmailOTP, resendEmailOTP } = useAuth();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Get the redirect path from location state (set by ProtectedRoute)
  const from = (location.state as any)?.from?.pathname || '/';

  // Start countdown timer for resend OTP
  React.useEffect(() => {
    if (step === 'otp' && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
        if (resendTimer === 1) {
          setCanResend(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const { error: otpError } = await signInWithEmail(email);

    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    // Move to OTP verification step
    setStep('otp');
    setResendTimer(60);
    setCanResend(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      setLoading(false);
      return;
    }

    const { error: verifyError } = await verifyEmailOTP({
      email,
      token: otp,
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    // Small delay to ensure profile is loaded
    await new Promise(resolve => setTimeout(resolve, 500));

    // Redirect to the intended page or home
    navigate(from, { replace: true });
  };

  const handleResendOTP = async () => {
    setError(null);
    setLoading(true);
    setCanResend(false);

    const { error: resendError } = await resendEmailOTP(email);

    setLoading(false);

    if (resendError) {
      setError(resendError.message);
      setCanResend(true);
      return;
    }

    // Restart timer
    setResendTimer(60);
  };

  const handleChangeEmail = () => {
    setStep('email');
    setOtp('');
    setError(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Welcome back to BizSearch
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={step === 'email' ? handleSendOTP : handleVerifyOTP} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'email' ? (
            <>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Send OTP Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </>
          ) : (
            <>
              {/* OTP Verification */}
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>

              {/* Verify OTP Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>

              {/* Resend OTP */}
              <div className="text-center space-y-2">
                {canResend ? (
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm"
                  >
                    Resend OTP
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Resend OTP in {resendTimer}s
                  </p>
                )}
                <Button
                  type="button"
                  variant="link"
                  onClick={handleChangeEmail}
                  disabled={loading}
                  className="text-sm"
                >
                  Change Email Address
                </Button>
              </div>
            </>
          )}

          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </Button>
          </p>

          {/* Phone Sign In Option */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/login/phone')}
            disabled={loading}
          >
            Sign in with Phone Number
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
