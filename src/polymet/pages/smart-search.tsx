import { MainLayout } from '@/polymet/layouts/main-layout';
import { NaturalLanguageSearch } from '@/components/natural-language-search';

export function SmartSearchPage() {
    return (
        <MainLayout>
            <div className="min-h-[80vh] bg-gradient-to-b from-slate-50 to-white">
                <div className="container mx-auto px-4 py-16">
                    {/* Hero */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                                Smart Search
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Just describe what you're looking for in plain English. Our AI understands your intent.
                        </p>
                    </div>

                    {/* Search Component */}
                    <NaturalLanguageSearch />

                    {/* How It Works */}
                    <div className="mt-20 text-center">
                        <h2 className="text-2xl font-semibold mb-8">How It Works</h2>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="p-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">💬</span>
                                </div>
                                <h3 className="font-semibold mb-2">Describe Your Need</h3>
                                <p className="text-sm text-muted-foreground">
                                    Type naturally like "cafe franchise under 10L in Mumbai"
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🧠</span>
                                </div>
                                <h3 className="font-semibold mb-2">AI Understands</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our system extracts industry, location, budget, and features
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🎯</span>
                                </div>
                                <h3 className="font-semibold mb-2">Get Matches</h3>
                                <p className="text-sm text-muted-foreground">
                                    See relevant businesses and franchises instantly
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
