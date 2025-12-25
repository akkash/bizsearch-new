import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function usePhoneVerification() {
    const { profile, refreshProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const isVerified = profile?.phone_verified || false;

    const verifyPhone = useCallback(() => {
        if (isVerified) return true;
        setIsOpen(true);
        return false;
    }, [isVerified]);

    const onVerificationComplete = async () => {
        setIsOpen(false);
        await refreshProfile();
        toast.success("Phone verified successfully!");
    };

    return {
        isVerified,
        verifyPhone,
        isOpen,
        setIsOpen,
        onVerificationComplete,
    };
}
