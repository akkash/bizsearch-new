import { useState } from "react";
import {
    Quote,
    Star,
    ChevronLeft,
    ChevronRight,
    Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SuccessStoriesCarouselProps {
    className?: string;
}

const successStories = [
    {
        id: "1",
        buyerName: "Rajesh Kumar",
        buyerRole: "First-time Business Owner",
        businessName: "TechStart Solutions",
        industry: "Technology",
        dealValue: "₹2.5 Cr",
        timeline: "45 days",
        roi: "32% YoY",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        videoThumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop",
        testimonial: "BizSearch made finding and acquiring my dream tech business incredibly smooth. The AI-powered matching found exactly what I was looking for, and the due diligence tools saved me weeks of work.",
        rating: 5,
        hasVideo: true,
    },
    {
        id: "2",
        buyerName: "Priya Sharma",
        buyerRole: "Serial Entrepreneur",
        businessName: "Café Delight Franchise",
        industry: "Food & Beverage",
        dealValue: "₹35 L",
        timeline: "30 days",
        roi: "45% YoY",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        videoThumbnail: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=250&fit=crop",
        testimonial: "The franchise matching algorithm understood my budget and experience level perfectly. Within a month, I was running my own café. The ROI projections were spot-on!",
        rating: 5,
        hasVideo: true,
    },
    {
        id: "3",
        buyerName: "Amit Patel",
        buyerRole: "Healthcare Professional",
        businessName: "HealthCare Plus Clinic",
        industry: "Healthcare",
        dealValue: "₹1.8 Cr",
        timeline: "60 days",
        roi: "28% YoY",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        videoThumbnail: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=250&fit=crop",
        testimonial: "The verification process and document management made the entire acquisition transparent and secure. I felt confident every step of the way. Highly recommend!",
        rating: 5,
        hasVideo: false,
    },
];

export function SuccessStoriesCarousel({ className }: SuccessStoriesCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % successStories.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + successStories.length) % successStories.length);
    };

    const currentStory = successStories[currentIndex];

    return (
        <section className={cn("py-16 bg-gradient-to-br from-trust-blue/5 via-background to-growth-green/5", className)}>
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <Badge className="mb-4" variant="secondary">
                        <Award className="h-3 w-3 mr-1" />
                        Real Success Stories
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Entrepreneurs Who Found Their Perfect Match
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of successful business owners who started their journey with BizSearch
                    </p>
                </div>

                {/* Main Carousel */}
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Video/Image Side */}
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-muted">
                            <img
                                src={currentStory.videoThumbnail}
                                alt={currentStory.businessName}
                                className="w-full h-full object-cover"
                            />
                            {/* Deal badge */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <Badge className="bg-growth-green text-white border-0">
                                    {currentStory.dealValue}
                                </Badge>
                                <Badge variant="secondary" className="bg-white/90">
                                    {currentStory.timeline}
                                </Badge>
                            </div>
                        </div>

                        {/* Testimonial Side */}
                        <div>
                            {/* Quote */}
                            <div className="relative mb-6">
                                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-growth-green/30" />
                                <p className="text-lg md:text-xl text-foreground/90 leading-relaxed pl-6">
                                    {currentStory.testimonial}
                                </p>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-5 w-5",
                                            i < currentStory.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={currentStory.image}
                                    alt={currentStory.buyerName}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-growth-green/20"
                                />
                                <div>
                                    <div className="font-semibold text-lg">{currentStory.buyerName}</div>
                                    <div className="text-sm text-muted-foreground">{currentStory.buyerRole}</div>
                                    <div className="text-sm text-growth-green font-medium">
                                        {currentStory.businessName} • {currentStory.industry}
                                    </div>
                                </div>
                            </div>

                            {/* ROI Badge */}
                            <Badge variant="outline" className="text-growth-green border-growth-green">
                                📈 {currentStory.roi} Return on Investment
                            </Badge>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prevSlide}
                            className="rounded-full"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>

                        {/* Dots */}
                        <div className="flex gap-2">
                            {successStories.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                    }}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        index === currentIndex
                                            ? "w-8 bg-growth-green"
                                            : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                    )}
                                />
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={nextSlide}
                            className="rounded-full"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
