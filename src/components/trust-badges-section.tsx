import { useState } from "react";
import {
    Shield,
    Award,
    Newspaper,
    BadgeCheck,
    Lock,
    FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgesSectionProps {
    className?: string;
}

const mediaLogos = [
    { name: "Economic Times", logo: "https://ui-avatars.com/api/?name=Economic+Times&background=random&color=fff", fallback: "ET" },
    { name: "Business Standard", logo: "https://ui-avatars.com/api/?name=Business+Standard&background=random&color=fff", fallback: "BS" },
    { name: "YourStory", logo: "https://ui-avatars.com/api/?name=YourStory&background=random&color=fff", fallback: "YS" },
    { name: "Inc42", logo: "https://ui-avatars.com/api/?name=Inc42&background=random&color=fff", fallback: "I42" },
    { name: "Forbes India", logo: "https://ui-avatars.com/api/?name=Forbes+India&background=random&color=fff", fallback: "FI" },
];

const partnerLogos = [
    { name: "HDFC Bank", logo: "https://ui-avatars.com/api/?name=HDFC+Bank&background=004c8f&color=fff", fallback: "HDFC" },
    { name: "ICICI Bank", logo: "https://ui-avatars.com/api/?name=ICICI+Bank&background=f37e20&color=fff", fallback: "ICICI" },
    { name: "Kotak Mahindra", logo: "https://ui-avatars.com/api/?name=Kotak+Mahindra&background=ed1c24&color=fff", fallback: "Kotak" },
    { name: "Axis Bank", logo: "https://ui-avatars.com/api/?name=Axis+Bank&background=97144d&color=fff", fallback: "Axis" },
    { name: "SBI", logo: "https://ui-avatars.com/api/?name=SBI&background=280071&color=fff", fallback: "SBI" },
];

const trustBadges = [
    {
        icon: Shield,
        title: "100% Verified Listings",
        description: "Every listing is manually verified before going live",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
        icon: Lock,
        title: "Secure Transactions",
        description: "Bank-grade encryption protects your data",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
        icon: FileCheck,
        title: "Legal Compliance",
        description: "All deals comply with SEBI & RBI guidelines",
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
        icon: BadgeCheck,
        title: "Verified Sellers",
        description: "KYC-verified sellers with background checks",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
];

export function TrustBadgesSection({ className }: TrustBadgesSectionProps) {
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    const handleImageError = (name: string) => {
        setFailedImages(prev => new Set([...prev, name]));
    };

    return (
        <section className={cn("py-12 bg-muted/30", className)}>
            <div className="container mx-auto px-4">
                {/* Trust Badges */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {trustBadges.map((badge, index) => {
                        const Icon = badge.icon;
                        return (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center p-4 rounded-xl bg-background border hover:shadow-md transition-shadow"
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

                {/* Partner Logos */}
                <div className="text-center mb-8">
                    <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
                        <Award className="h-4 w-4" />
                        Financing Partners
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        {partnerLogos.map((partner) => (
                            <div
                                key={partner.name}
                                className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
                            >
                                {!failedImages.has(partner.name) ? (
                                    <img
                                        src={partner.logo}
                                        alt={partner.name}
                                        className="h-8 w-auto object-contain"
                                        onError={() => handleImageError(partner.name)}
                                    />
                                ) : (
                                    <div className="h-8 px-4 flex items-center justify-center bg-muted rounded text-sm font-medium text-muted-foreground">
                                        {partner.fallback}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Media Mentions */}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
                        <Newspaper className="h-4 w-4" />
                        Featured In
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        {mediaLogos.map((media) => (
                            <div
                                key={media.name}
                                className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
                            >
                                {!failedImages.has(media.name) ? (
                                    <img
                                        src={media.logo}
                                        alt={media.name}
                                        className="h-6 w-auto object-contain"
                                        onError={() => handleImageError(media.name)}
                                    />
                                ) : (
                                    <div className="h-6 px-3 flex items-center justify-center bg-muted rounded text-xs font-medium text-muted-foreground">
                                        {media.fallback}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
