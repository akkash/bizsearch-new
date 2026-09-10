import { NaturalLanguageSearch } from '@/components/natural-language-search';
import { MessageSquare, Search, ListChecks } from 'lucide-react';
import { PageHero } from '@/components/page-hero';

export function SmartSearchPage() {
    return (
        <div className="min-h-[80vh] bg-background">
            <PageHero
                eyebrow="Search"
                title="Search by description"
                description="Describe the franchise you want — location, industry, budget. Businesses for sale appear only as a secondary result."
            />

            <div className="container mx-auto px-4 py-10 md:py-12">
                <NaturalLanguageSearch />

                <div className="mt-16">
                    <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground mb-6">How it works</h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
                        <div className="border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
                            <div className="w-10 h-10 border border-border flex items-center justify-center mb-3 text-trust-blue">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">Describe your need</h3>
                            <p className="text-sm text-muted-foreground">
                                Type naturally, e.g. &quot;cafe franchise under 10L in Mumbai&quot;
                            </p>
                        </div>
                        <div className="border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
                            <div className="w-10 h-10 border border-border flex items-center justify-center mb-3 text-trust-blue">
                                <Search className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">Parse criteria</h3>
                            <p className="text-sm text-muted-foreground">
                                The search extracts industry, location, budget, and features from your text
                            </p>
                        </div>
                        <div className="border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
                            <div className="w-10 h-10 border border-border flex items-center justify-center mb-3 text-trust-blue">
                                <ListChecks className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">Review matches</h3>
                            <p className="text-sm text-muted-foreground">
                                Franchise listings first. Businesses only when the query is not franchise-only.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
