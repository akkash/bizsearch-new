import {
    Shield,
    BadgeCheck,
    Lock,
    FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgesSectionProps {
    className?: string;
}

const trustBadges = [
    {
        icon: Shield,
        title: "Reviewed before going live",
        description: "New listings are checked by the BizSearch team before they appear in search",
        color: "text-growth-green",
        bgColor: "bg-growth-green/10",
    },
    {
        icon: Lock,
        title: "In-platform enquiry",
        description: "Your phone number stays hidden until a brand accepts the enquiry",
        color: "text-trust-blue dark:text-trust-blue-light",
        bgColor: "bg-trust-blue/10",
    },
    {
        icon: FileCheck,
        title: "Documents stay with the listing",
        description: "FDD and brand files are stored for review. A listing is not verified just because a file was uploaded",
        color: "text-trust-blue",
        bgColor: "bg-trust-blue/10",
    },
    {
        icon: BadgeCheck,
        title: "Verified only when earned",
        description: "The verified badge appears only after identity checks, not after signup",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
];

export function TrustBadgesSection({ className }: TrustBadgesSectionProps) {
    return (
        <section className={cn("py-12 bg-muted/30", className)}>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {trustBadges.map((badge) => {
                        const Icon = badge.icon;
                        return (
                            <div
                                key={badge.title}
                                className="flex flex-col items-center text-center p-4 rounded-xl bg-background border"
                            >
                                <div className={cn("p-3 rounded-full mb-3", badge.bgColor)}>
                                    <Icon className={cn("h-6 w-6", badge.color)} />
                                </div>
                                <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
                                <p className="text-xs text-muted-foreground">{badge.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
