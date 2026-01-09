import { cn } from "@/lib/utils";
import { CheckCircle, LucideIcon } from "lucide-react";

interface IconTileOption {
    value: string;
    label: string;
    icon: LucideIcon;
    description?: string;
}

interface IconTileSelectorProps {
    options: IconTileOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
    columns?: 2 | 3 | 4;
    multiSelect?: boolean;
    className?: string;
}

export function IconTileSelector({
    options,
    selected,
    onChange,
    columns = 3,
    multiSelect = true,
    className,
}: IconTileSelectorProps) {
    const handleToggle = (value: string) => {
        if (multiSelect) {
            if (selected.includes(value)) {
                onChange(selected.filter((v) => v !== value));
            } else {
                onChange([...selected, value]);
            }
        } else {
            onChange([value]);
        }
    };

    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-2 md:grid-cols-3",
        4: "grid-cols-2 md:grid-cols-4",
    };

    return (
        <div className={cn(`grid ${gridCols[columns]} gap-3`, className)}>
            {options.map((option) => {
                const isSelected = selected.includes(option.value);
                const Icon = option.icon;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleToggle(option.value)}
                        className={cn(
                            "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200",
                            "hover:border-primary/50 hover:bg-accent/50",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-muted bg-background"
                        )}
                    >
                        {/* Selection Badge */}
                        {isSelected && (
                            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm animate-in zoom-in duration-200">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                        )}

                        {/* Icon */}
                        <div
                            className={cn(
                                "w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors",
                                isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            <Icon className="h-6 w-6" />
                        </div>

                        {/* Label */}
                        <span
                            className={cn(
                                "font-medium text-sm text-center transition-colors",
                                isSelected ? "text-foreground" : "text-muted-foreground"
                            )}
                        >
                            {option.label}
                        </span>

                        {/* Description */}
                        {option.description && (
                            <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                                {option.description}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// Pre-configured support type options for franchise wizard
import {
    Building,
    Palette,
    Package,
    Users,
    GraduationCap,
    BookOpen,
    Megaphone,
    Headphones,
    Monitor,
    Truck,
    ShieldCheck,
    TrendingUp,
    Globe,
    Search,
    FileText,
    Sparkles,
    Tags,
    Instagram,
} from "lucide-react";

export const SUPPORT_TYPE_OPTIONS: IconTileOption[] = [
    { value: "site-selection", label: "Site Selection", icon: Building, description: "Help finding the perfect location" },
    { value: "store-design", label: "Store Design", icon: Palette, description: "Layout and interior design" },
    { value: "equipment", label: "Equipment", icon: Package, description: "Procurement assistance" },
    { value: "recruitment", label: "Staff Recruitment", icon: Users, description: "Hiring support" },
    { value: "training", label: "Training Program", icon: GraduationCap, description: "Initial and ongoing training" },
    { value: "operations-manual", label: "Operations Manual", icon: BookOpen, description: "SOPs and guidelines" },
    { value: "marketing-launch", label: "Marketing Launch", icon: Megaphone, description: "Grand opening support" },
    { value: "ongoing-support", label: "Ongoing Support", icon: Headphones, description: "Continuous assistance" },
    { value: "technology", label: "Technology Support", icon: Monitor, description: "POS and systems" },
    { value: "supply-chain", label: "Supply Chain", icon: Truck, description: "Vendor management" },
    { value: "quality-control", label: "Quality Control", icon: ShieldCheck, description: "Standards and audits" },
    { value: "performance", label: "Performance Monitoring", icon: TrendingUp, description: "Analytics and reporting" },
];

export const MARKETING_SUPPORT_OPTIONS: IconTileOption[] = [
    { value: "national-ads", label: "National Campaigns", icon: Megaphone, description: "TV, radio, print advertising" },
    { value: "local-templates", label: "Local Templates", icon: FileText, description: "Ready-to-use marketing materials" },
    { value: "digital-marketing", label: "Digital Marketing", icon: Globe, description: "Online advertising support" },
    { value: "social-media", label: "Social Media", icon: Instagram, description: "Social media management" },
    { value: "website", label: "Website", icon: Globe, description: "Web presence and hosting" },
    { value: "seo", label: "SEO Support", icon: Search, description: "Search engine optimization" },
    { value: "print-materials", label: "Print Materials", icon: FileText, description: "Brochures, flyers, banners" },
    { value: "grand-opening", label: "Grand Opening", icon: Sparkles, description: "Launch event support" },
    { value: "promotions", label: "Promotions", icon: Tags, description: "Campaign templates" },
];
