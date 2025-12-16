import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, Loader2, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function PhoneSignInForm() {
  const navigate = useNavigate();
  const { signInWithPhone, verifyOTP, resendOTP } = useAuth();
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Start countdown timer for resend OTP
  React.useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
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
    setIsLoading(true);

    // Validate phone format
    if (!phone.match(/^\+?[1-9]\d{1,14}$/)) {
      setError("Please enter a valid phone number with country code (e.g., +919876543210)");
      setIsLoading(false);
      return;
    }

    // Request OTP using signInWithOtp
    const { error: otpError } = await resendOTP(phone);

    setIsLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    // Move to OTP verification step
    setStep("otp");
    setResendTimer(60);
    setCanResend(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP code");
      setIsLoading(false);
      return;
    }

    const { error: verifyError } = await verifyOTP({
      phone,
      token: otp,
    });

    setIsLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    // Redirect to home on success
    navigate("/");
  };

  const handleResendOTP = async () => {
    setError(null);
    setIsLoading(true);
    setCanResend(false);

    const { error: resendError } = await resendOTP(phone);

    setIsLoading(false);

    if (resendError) {
      setError(resendError.message);
      setCanResend(true);
      return;
    }

    // Restart timer
    setResendTimer(60);
  };

  const handleChangePhone = () => {
    setStep("phone");
    setOtp("");
    setError(null);
  };

  return (
    <form onSubmit={step === "phone" ? handleSendOTP : handleVerifyOTP} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "phone" ? (
        <>
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +91 for India)
            </p>
          </div>

          {/* Send OTP Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
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
                disabled={isLoading}
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Enter the 6-digit code sent to {phone}
            </p>
          </div>

          {/* Verify OTP Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

          {/* Resend OTP */}
          <div className="text-center space-y-2">
            {canResend ? (
              <Button
                type="button"
                variant="link"
                onClick={handleResendOTP}
                disabled={isLoading}
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
              onClick={handleChangePhone}
              disabled={isLoading}
              className="text-sm"
            >
              Change Phone Number
            </Button>
          </div>
        </>
      )}

      {/* Sign Up Link */}
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup/phone" className="text-primary hover:underline font-medium">
          Sign up with phone
        </Link>
        {" or "}
        <Link to="/signup" className="text-primary hover:underline font-medium">
          email
        </Link>
      </p>

      {/* Email Sign In Link */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Link to="/login">
        <Button variant="outline" type="button" className="w-full">
          Sign in with Email
        </Button>
      </Link>
    </form>
  );
}
