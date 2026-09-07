import { Search, Shield, FileText, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SuccessStoriesCarouselProps {
    className?: string;
}

/**
 * Dormant product-capability section — no fabricated testimonials.
 * Kept export-compatible for any future wiring.
 */
export function SuccessStoriesCarousel({ className }: SuccessStoriesCarouselProps) {
    const capabilities = [
        {
            icon: Search,
            title: "Structured discovery",
            description: "Filter businesses and franchises by industry, investment range, and location.",
        },
        {
            icon: Shield,
            title: "Verification signals",
            description: "Review verification status and data completeness before you engage.",
        },
        {
            icon: FileText,
            title: "Deal workflows",
            description: "Manage documents, messages, and deal progress in one place.",
        },
        {
            icon: MapPin,
            title: "Territory mapping",
            description: "Explore franchise locations and available territories on the map.",
        },
    ];

    return (
        <section className={cn("py-16 border-t border-border bg-background", className)}>
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <Badge className="mb-4" variant="secondary">
                        Platform capabilities
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                        Built for serious acquisition work
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Tools to discover, evaluate, and progress business and franchise opportunities.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                    {capabilities.map((item) => (
                        <div
                            key={item.title}
                            className="p-5 rounded-lg border border-border bg-card"
                        >
                            <div className="w-10 h-10 rounded-lg bg-growth-green/15 flex items-center justify-center mb-3">
                                <item.icon className="h-5 w-5 text-growth-green" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
