import { useEffect, useState } from "react";
import {
    TrendingUp,
    Users,
    Building2,
    DollarSign,
    Shield,
    Clock,
    CheckCircle2,
    Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveMetricsDashboardProps {
    className?: string;
}

interface Metric {
    label: string;
    value: string;
    numericValue: number;
    prefix?: string;
    suffix?: string;
    icon: React.ElementType;
    color: string;
    trend?: string;
}

export function LiveMetricsDashboard({ className }: LiveMetricsDashboardProps) {
    const [metrics, setMetrics] = useState<Metric[]>([
        {
            label: "Active Deals Today",
            value: "127",
            numericValue: 127,
            icon: TrendingUp,
            color: "text-growth-green",
            trend: "+12 today"
        },
        {
            label: "Buyers Online Now",
            value: "2,847",
            numericValue: 2847,
            icon: Users,
            color: "text-blue-500",
            trend: "Live"
        },
        {
            label: "Total Deal Value",
            value: "850",
            numericValue: 850,
            prefix: "₹",
            suffix: "Cr+",
            icon: DollarSign,
            color: "text-amber-500"
        },
        {
            label: "Verified Listings",
            value: "3,850",
            numericValue: 3850,
            suffix: "+",
            icon: Building2,
            color: "text-purple-500"
        },
    ]);

    // Simulate live updates
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => prev.map(metric => {
                if (metric.label === "Active Deals Today") {
                    const newValue = metric.numericValue + Math.floor(Math.random() * 3);
                    return { ...metric, numericValue: newValue, value: newValue.toString() };
                }
                if (metric.label === "Buyers Online Now") {
                    const change = Math.floor(Math.random() * 20) - 10;
                    const newValue = Math.max(2800, metric.numericValue + change);
                    return { ...metric, numericValue: newValue, value: newValue.toLocaleString() };
                }
                return metric;
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn(
            "bg-trust-blue text-white py-3 overflow-hidden",
            className
        )}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* Live indicator */}
                    <div className="hidden md:flex items-center gap-2 mr-6">
                        <div className="relative flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-white/80">LIVE</span>
                        </div>
                    </div>

                    {/* Scrolling metrics on mobile, grid on desktop */}
                    <div className="flex-1 overflow-hidden">
                        <div className="flex md:grid md:grid-cols-4 gap-6 md:gap-4 animate-marquee md:animate-none">
                            {metrics.map((metric, index) => {
                                const Icon = metric.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 whitespace-nowrap min-w-max md:min-w-0"
                                    >
                                        <Icon className={cn("h-5 w-5 shrink-0", metric.color)} />
                                        <div>
                                            <div className="font-bold text-sm md:text-base font-mono">
                                                {metric.prefix}{metric.value}{metric.suffix}
                                            </div>
                                            <div className="text-[10px] md:text-xs text-white/70">
                                                {metric.label}
                                                {metric.trend && (
                                                    <span className="ml-1 text-green-300">• {metric.trend}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
