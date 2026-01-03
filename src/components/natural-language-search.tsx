import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    ArrowRight,
    Building2,
    Store,
    MapPin,
    IndianRupee,
    Filter,
    Loader2,
    X,
    Lightbulb
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ParsedIntent {
    listing_type: 'business' | 'franchise' | 'both';
    filters: {
        industry?: string;
        location?: string;
        city?: string;
        state?: string;
        min_price?: number;
        max_price?: number;
        min_investment?: number;
        max_investment?: number;
        features?: string[];
        verification_status?: string;
    };
    confidence: number;
    original_query: string;
}

interface SearchResult {
    intent: ParsedIntent;
    results: {
        businesses: any[];
        franchises: any[];
    };
    meta: {
        total_businesses: number;
        total_franchises: number;
    };
}

const EXAMPLE_QUERIES = [
    "Cafe franchise under 10L in Mumbai",
    "Tech business in Bangalore above 50L",
    "Verified food franchise with training",
    "Budget gym franchise in Delhi",
    "Profitable salon business in Maharashtra",
];

export function NaturalLanguageSearch() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsSearching(true);
        setShowSuggestions(false);

        try {
            const { data, error } = await supabase.functions.invoke('nl-search', {
                body: { query, execute: true, limit: 6 },
            });

            if (error) throw error;
            setResult(data);
        } catch (err) {
            console.error('NL Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const formatPrice = (price: number) => {
        if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
        if (price >= 100000) return `₹${(price / 100000).toFixed(0)}L`;
        return `₹${price.toLocaleString()}`;
    };

    const handleExampleClick = (example: string) => {
        setQuery(example);
        setShowSuggestions(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const clearSearch = () => {
        setQuery('');
        setResult(null);
        inputRef.current?.focus();
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="relative">
                <div className="relative flex items-center">
                    <div className="absolute left-4 flex items-center gap-2 text-muted-foreground">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <Input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => !result && setShowSuggestions(true)}
                        placeholder="Try: 'Cafe franchise under 10L in Mumbai with training'"
                        className="pl-12 pr-24 h-14 text-lg rounded-full border-2 focus:border-primary shadow-lg"
                    />
                    <div className="absolute right-2 flex items-center gap-2">
                        {query && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={clearSearch}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            onClick={handleSearch}
                            disabled={isSearching || !query.trim()}
                            className="rounded-full h-10 px-6"
                        >
                            {isSearching ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Search
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Example Queries Dropdown */}
                {showSuggestions && !result && (
                    <Card className="absolute top-full mt-2 w-full z-50 shadow-xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <Lightbulb className="h-4 w-4" />
                                Try these examples:
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {EXAMPLE_QUERIES.map((example) => (
                                    <Button
                                        key={example}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => handleExampleClick(example)}
                                    >
                                        {example}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Results */}
            {result && (
                <div className="mt-8 space-y-6">
                    {/* Intent Understanding */}
                    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">I understood:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {result.intent.listing_type !== 'both' && (
                                            <Badge variant="secondary">
                                                {result.intent.listing_type === 'franchise' ? <Store className="h-3 w-3 mr-1" /> : <Building2 className="h-3 w-3 mr-1" />}
                                                {result.intent.listing_type}
                                            </Badge>
                                        )}
                                        {result.intent.filters.industry && (
                                            <Badge variant="outline">{result.intent.filters.industry}</Badge>
                                        )}
                                        {(result.intent.filters.city || result.intent.filters.state) && (
                                            <Badge variant="outline">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {result.intent.filters.city || result.intent.filters.state}
                                            </Badge>
                                        )}
                                        {(result.intent.filters.max_price || result.intent.filters.max_investment) && (
                                            <Badge variant="outline">
                                                <IndianRupee className="h-3 w-3 mr-1" />
                                                Under {formatPrice(result.intent.filters.max_price || result.intent.filters.max_investment || 0)}
                                            </Badge>
                                        )}
                                        {result.intent.filters.features?.map((f) => (
                                            <Badge key={f} variant="outline" className="capitalize">{f.replace('_', ' ')}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <Badge className={result.intent.confidence >= 0.5 ? 'bg-green-500' : 'bg-yellow-500'}>
                                    {Math.round(result.intent.confidence * 100)}% confident
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Business Results */}
                    {result.results.businesses.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Businesses ({result.meta.total_businesses})
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {result.results.businesses.map((business) => (
                                    <Card
                                        key={business.id}
                                        className="cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => navigate(`/business/${business.slug || business.id}`)}
                                    >
                                        <CardContent className="p-4">
                                            <h4 className="font-semibold line-clamp-1">{business.name}</h4>
                                            <p className="text-sm text-muted-foreground">{business.industry}</p>
                                            <div className="flex items-center gap-2 mt-2 text-sm">
                                                <MapPin className="h-3 w-3" />
                                                {business.city}, {business.state}
                                            </div>
                                            <div className="mt-3 font-bold text-lg text-primary">
                                                {formatPrice(business.price)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Franchise Results */}
                    {result.results.franchises.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Franchises ({result.meta.total_franchises})
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {result.results.franchises.map((franchise) => (
                                    <Card
                                        key={franchise.id}
                                        className="cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => navigate(`/franchise/${franchise.slug || franchise.id}`)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                {franchise.logo_url && (
                                                    <img src={franchise.logo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                                                )}
                                                <div>
                                                    <h4 className="font-semibold line-clamp-1">{franchise.brand_name}</h4>
                                                    <p className="text-sm text-muted-foreground">{franchise.industry}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 font-bold text-lg text-primary">
                                                {formatPrice(franchise.total_investment_min)} - {formatPrice(franchise.total_investment_max)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {result.results.businesses.length === 0 && result.results.franchises.length === 0 && (
                        <Card className="p-8 text-center">
                            <p className="text-muted-foreground">No results found. Try a different search.</p>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
