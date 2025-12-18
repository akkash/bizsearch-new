import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Phone, CheckCircle, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface PhoneVerificationProps {
    onVerified?: () => void;
}

export function PhoneVerification({ onVerified }: PhoneVerificationProps) {
    const { user, profile, refreshProfile } = useAuth();
    const [phone, setPhone] = useState(profile?.phone || '');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [canResend, setCanResend] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);

    // Pre-fill phone if exists
    useEffect(() => {
        if (profile?.phone) {
            setPhone(profile.phone);
        }
    }, [profile]);

    // Countdown timer for resend
    useEffect(() => {
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

    const formatPhone = (value: string) => {
        // Remove non-digits
        const digits = value.replace(/\D/g, '');
        // Ensure it starts with +91 for India
        if (!value.startsWith('+')) {
            return '+91' + digits.slice(0, 10);
        }
        return '+' + digits.slice(0, 12);
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validate phone format (Indian format)
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10 || phoneDigits.length > 12) {
            setError('Please enter a valid phone number');
            setLoading(false);
            return;
        }

        try {
            // First, update the phone in profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ phone: phone })
                .eq('id', user?.id);

            if (updateError) throw updateError;

            // Send OTP via Supabase
            const { error: otpError } = await supabase.auth.signInWithOtp({
                phone: phone,
            });

            if (otpError) throw otpError;

            setStep('otp');
            setResendTimer(60);
            setCanResend(false);
            toast.success('OTP sent to your phone');
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            setLoading(false);
            return;
        }

        try {
            // Verify OTP
            const { error: verifyError } = await supabase.auth.verifyOtp({
                phone: phone,
                token: otp,
                type: 'sms',
            });

            if (verifyError) throw verifyError;

            // Update profile to mark phone as verified
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    phone: phone,
                    phone_verified: true,
                    phone_verified_at: new Date().toISOString(),
                })
                .eq('id', user?.id);

            if (updateError) throw updateError;

            // Refresh profile
            await refreshProfile();

            toast.success('Phone verified successfully!');
            onVerified?.();
        } catch (err: any) {
            setError(err.message || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError(null);
        setLoading(true);
        setCanResend(false);

        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                phone: phone,
            });

            if (otpError) throw otpError;

            setResendTimer(60);
            toast.success('OTP resent');
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP');
            setCanResend(true);
        } finally {
            setLoading(false);
        }
    };

    // If already verified, show success state
    if (profile?.phone_verified) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Phone Verification</CardTitle>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{profile.phone}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Verify Your Phone</CardTitle>
                </div>
                <CardDescription>
                    Verify your phone number to enhance account security and enable SMS notifications
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={step === 'phone' ? handleSendOTP : handleVerifyOTP} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {step === 'phone' ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    We'll send a 6-digit OTP to verify your number
                                </p>
                            </div>

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
                            <div className="space-y-2">
                                <Label htmlFor="otp">Enter OTP</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="text-center text-2xl tracking-widest"
                                    maxLength={6}
                                    required
                                    disabled={loading}
                                    autoFocus
                                />
                                <p className="text-xs text-muted-foreground text-center">
                                    Enter the 6-digit code sent to {phone}
                                </p>
                            </div>

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
                                    'Verify Phone'
                                )}
                            </Button>

                            <div className="flex items-center justify-between text-sm">
                                {canResend ? (
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                        className="p-0 h-auto"
                                    >
                                        Resend OTP
                                    </Button>
                                ) : (
                                    <span className="text-muted-foreground">
                                        Resend in {resendTimer}s
                                    </span>
                                )}
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => {
                                        setStep('phone');
                                        setOtp('');
                                        setError(null);
                                    }}
                                    disabled={loading}
                                    className="p-0 h-auto"
                                >
                                    Change Number
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
