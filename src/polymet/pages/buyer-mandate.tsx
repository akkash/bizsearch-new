import { BuyerMandateForm } from "@/polymet/components/forms/buyer-mandate-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BuyerMandatePage() {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>
            <BuyerMandateForm />
        </div>
    );
}
