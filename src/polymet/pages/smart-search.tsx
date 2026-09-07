import { NaturalLanguageSearch } from '@/components/natural-language-search';
import { MessageSquare, Search, ListChecks } from 'lucide-react';

export function SmartSearchPage() {
    return (
        <div className="min-h-[80vh] bg-background">
            <div className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-8 md:py-10">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        Search by description
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
                        Describe the business or franchise you want — location, industry, budget, revenue.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 md:py-12">
                <NaturalLanguageSearch />

                <div className="mt-16">
                    <h2 className="text-lg font-semibold text-foreground mb-6">How it works</h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
                        <div className="rounded-lg border border-border bg-card p-5">
                            <div className="w-10 h-10 rounded-md bg-growth-green/10 flex items-center justify-center mb-3">
                                <MessageSquare className="h-5 w-5 text-growth-green" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">Describe your need</h3>
                            <p className="text-sm text-muted-foreground">
                                Type naturally, e.g. &quot;cafe franchise under 10L in Mumbai&quot;
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-5">
                            <div className="w-10 h-10 rounded-md bg-growth-green/10 flex items-center justify-center mb-3">
                                <Search className="h-5 w-5 text-growth-green" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">Parse criteria</h3>
                            <p className="text-sm text-muted-foreground">
                                The search extracts industry, location, budget, and features from your text
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-5">
                            <div className="w-10 h-10 rounded-md bg-growth-green/10 flex items-center justify-center mb-3">
                                <ListChecks className="h-5 w-5 text-growth-green" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">Review matches</h3>
                            <p className="text-sm text-muted-foreground">
                                Browse businesses and franchises that fit the parsed criteria
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
