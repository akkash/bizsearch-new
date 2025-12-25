import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Smartphone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PhoneVerificationModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onVerified: () => void;
}

export function PhoneVerificationModal({
    isOpen,
    onOpenChange,
    onVerified,
}: PhoneVerificationModalProps) {
    const { updateProfile } = useAuth();
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!phone || phone.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        try {
            // 1. Initiate phone update to trigger OTP from Supabase Auth
            const { error } = await supabase.auth.updateUser({
                phone: phone,
            });

            if (error) throw error;

            setStep("otp");
            toast.success("OTP sent to your phone number");
        } catch (error: any) {
            console.error("Error sending OTP:", error);
            toast.error(error.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            toast.error("Please enter a valid OTP");
            return;
        }

        setLoading(true);
        try {
            // 2. Verify OTP
            const { error } = await supabase.auth.verifyOtp({
                phone: phone,
                token: otp,
                type: "phone_change",
            });

            if (error) throw error;

            // 3. Update profile status in database manually since we track it there too
            // NOTE: This is redundant if we rely on auth.users, but we use public.profiles for easier querying
            await updateProfile({
                phone: phone,
                phone_verified: true,
                phone_verified_at: new Date().toISOString() as any,
            });

            toast.success("Phone verified successfully!");
            onVerified();
            onOpenChange(false);
            setStep("phone");
            setOtp("");
        } catch (error: any) {
            console.error("Error verifying OTP:", error);
            toast.error(error.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        Verify Phone Number
                    </DialogTitle>
                    <DialogDescription>
                        To ensure trust and safety, we require phone verification for this action.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {step === "phone" ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="shrink-0 pointer-events-none bg-muted">
                                        +91
                                    </Button>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    We'll send a 6-digit code to verify this number.
                                </p>
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleSendOtp}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                OTP sent to {phone}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="otp">Enter Verification Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    maxLength={6}
                                    className="text-center text-lg tracking-widest"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleVerifyOtp}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
                            </Button>
                            <div className="text-center">
                                <Button variant="link" size="sm" onClick={() => setStep("phone")}>
                                    Change Phone Number
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
