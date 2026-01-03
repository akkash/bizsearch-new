import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Production limits
const MAX_QUERY_LENGTH = 500;
const MAX_RESULTS = 20;
const MIN_QUERY_LENGTH = 3;

interface ParsedIntent {
    listing_type: "business" | "franchise" | "both";
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
    sort_by?: string;
    sort_order?: "asc" | "desc";
    confidence: number;
    original_query: string;
}

// Industry mapping for fuzzy matching
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
    "Food & Beverage": ["food", "restaurant", "cafe", "coffee", "bakery", "dining", "kitchen", "catering", "pizza", "burger", "ice cream", "sweets", "mithai"],
    "Retail": ["retail", "shop", "store", "boutique", "fashion", "clothing", "apparel", "garment", "footwear", "jewellery", "jewelry"],
    "Technology": ["tech", "software", "it", "computer", "digital", "app", "saas", "web", "mobile", "startup"],
    "Health & Fitness": ["gym", "fitness", "health", "yoga", "spa", "wellness", "clinic", "medical", "hospital", "pharmacy", "diagnostics"],
    "Education": ["education", "school", "coaching", "tuition", "training", "academy", "learning", "preschool", "playschool", "college"],
    "Automotive": ["auto", "car", "vehicle", "garage", "service center", "car wash", "automotive", "bike", "two wheeler"],
    "Beauty & Personal Care": ["beauty", "salon", "parlour", "cosmetic", "skincare", "hair", "makeup", "grooming"],
    "Real Estate": ["real estate", "property", "construction", "builder", "housing"],
    "Manufacturing": ["manufacturing", "factory", "production", "industrial"],
    "Services": ["service", "consulting", "agency", "professional", "cleaning", "laundry", "logistics"],
    "Hospitality": ["hotel", "resort", "travel", "tourism", "lodge", "guest house"],
};

// Location keywords - major Indian cities
const CITIES = ["mumbai", "delhi", "bangalore", "bengaluru", "chennai", "hyderabad", "kolkata", "pune", "ahmedabad", "jaipur", "lucknow", "kanpur", "nagpur", "indore", "thane", "bhopal", "visakhapatnam", "patna", "vadodara", "ghaziabad", "ludhiana", "agra", "nashik", "faridabad", "meerut", "rajkot", "varanasi", "srinagar", "aurangabad", "dhanbad", "amritsar", "allahabad", "ranchi", "howrah", "coimbatore", "gwalior", "vijayawada", "jodhpur", "madurai", "raipur", "kota", "chandigarh", "guwahati", "solapur", "hubli", "dharwad", "mysore", "tiruchirappalli", "bareilly", "aligarh", "tiruppur", "moradabad", "jalandhar", "bhubaneswar", "salem", "warangal", "guntur", "bhiwandi", "saharanpur", "gorakhpur", "bikaner", "amravati", "noida", "gurgaon", "gurugram", "navi mumbai", "kochi", "cochin", "trivandrum", "thiruvananthapuram", "surat", "jamshedpur", "dehradun", "mangalore", "belgaum", "udaipur", "ajmer"];

const STATES = ["maharashtra", "karnataka", "delhi", "tamil nadu", "telangana", "gujarat", "rajasthan", "uttar pradesh", "west bengal", "kerala", "madhya pradesh", "andhra pradesh", "punjab", "haryana", "bihar", "jharkhand", "odisha", "chhattisgarh", "assam", "uttarakhand", "himachal pradesh", "goa", "jammu", "kashmir"];

// Price pattern matching
const PRICE_PATTERNS = [
    { regex: /(\d+(?:\.\d+)?)\s*(?:crore|cr)/i, multiplier: 10000000 },
    { regex: /(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)/i, multiplier: 100000 },
    { regex: /(\d+(?:\.\d+)?)\s*(?:k|thousand)/i, multiplier: 1000 },
];

// Feature keywords
const FEATURE_KEYWORDS: Record<string, string[]> = {
    "training": ["training", "trained", "support provided", "handholding"],
    "marketing_support": ["marketing", "advertising", "promotion", "branding"],
    "financing": ["financing", "loan", "emi", "payment plan"],
    "verified": ["verified", "trusted", "authentic", "genuine"],
    "profitable": ["profitable", "profit", "earning", "revenue generating"],
    "established": ["established", "running", "operational", "existing"],
};

// Sanitize query string
function sanitizeQuery(query: string): string {
    if (!query || typeof query !== "string") return "";
    // Remove potentially harmful characters and limit length
    return query
        .replace(/[<>{}[\]\\]/g, "")
        .trim()
        .slice(0, MAX_QUERY_LENGTH);
}

function parseNaturalLanguage(query: string): ParsedIntent {
    const sanitizedQuery = sanitizeQuery(query);
    const lowerQuery = sanitizedQuery.toLowerCase();
    let confidence = 0;

    // Determine listing type
    let listing_type: "business" | "franchise" | "both" = "both";
    if (lowerQuery.includes("franchise")) {
        listing_type = "franchise";
        confidence += 0.2;
    } else if (lowerQuery.includes("business") || lowerQuery.includes("company")) {
        listing_type = "business";
        confidence += 0.2;
    }

    const filters: ParsedIntent["filters"] = {};

    // Extract industry
    for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
        if (keywords.some(kw => lowerQuery.includes(kw))) {
            filters.industry = industry;
            confidence += 0.15;
            break;
        }
    }

    // Extract location - cities first
    for (const city of CITIES) {
        if (lowerQuery.includes(city)) {
            filters.city = city.charAt(0).toUpperCase() + city.slice(1);
            confidence += 0.15;
            break;
        }
    }

    // Then states if no city found
    if (!filters.city) {
        for (const state of STATES) {
            if (lowerQuery.includes(state)) {
                filters.state = state.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                confidence += 0.1;
                break;
            }
        }
    }

    // Extract price/investment ranges
    for (const pattern of PRICE_PATTERNS) {
        const maxMatches = lowerQuery.match(new RegExp(`(under|below|less than|max|upto|up to|within)\\s*${pattern.regex.source}`, "i"));
        if (maxMatches) {
            const amount = parseFloat(maxMatches[2]) * pattern.multiplier;
            if (!isNaN(amount) && amount > 0 && amount < 10000000000) {
                if (listing_type === "franchise") {
                    filters.max_investment = amount;
                } else {
                    filters.max_price = amount;
                }
                confidence += 0.15;
                break;
            }
        }

        const minMatches = lowerQuery.match(new RegExp(`(above|over|more than|min|minimum|starting)\\s*${pattern.regex.source}`, "i"));
        if (minMatches) {
            const amount = parseFloat(minMatches[2]) * pattern.multiplier;
            if (!isNaN(amount) && amount > 0 && amount < 10000000000) {
                if (listing_type === "franchise") {
                    filters.min_investment = amount;
                } else {
                    filters.min_price = amount;
                }
                confidence += 0.15;
                break;
            }
        }

        // Simple amount detection (assume max if no qualifier)
        const simpleMatch = lowerQuery.match(pattern.regex);
        if (simpleMatch && !filters.max_price && !filters.max_investment) {
            const amount = parseFloat(simpleMatch[1]) * pattern.multiplier;
            if (!isNaN(amount) && amount > 0 && amount < 10000000000) {
                if (listing_type === "franchise") {
                    filters.max_investment = amount;
                } else {
                    filters.max_price = amount;
                }
                confidence += 0.1;
            }
        }
    }

    // Extract features
    const features: string[] = [];
    for (const [feature, keywords] of Object.entries(FEATURE_KEYWORDS)) {
        if (keywords.some(kw => lowerQuery.includes(kw))) {
            features.push(feature);
            confidence += 0.05;
        }
    }
    if (features.length > 0) {
        filters.features = features;
    }

    // Check for verified filter
    if (features.includes("verified")) {
        filters.verification_status = "verified";
    }

    // Determine sort preference
    let sort_by: string | undefined;
    let sort_order: "asc" | "desc" | undefined;

    if (lowerQuery.includes("cheap") || lowerQuery.includes("affordable") || lowerQuery.includes("low cost") || lowerQuery.includes("budget")) {
        sort_by = listing_type === "franchise" ? "total_investment_min" : "price";
        sort_order = "asc";
        confidence += 0.1;
    } else if (lowerQuery.includes("premium") || lowerQuery.includes("high end") || lowerQuery.includes("luxury")) {
        sort_by = listing_type === "franchise" ? "total_investment_min" : "price";
        sort_order = "desc";
        confidence += 0.1;
    } else if (lowerQuery.includes("new") || lowerQuery.includes("latest") || lowerQuery.includes("recent")) {
        sort_by = "created_at";
        sort_order = "desc";
        confidence += 0.1;
    } else if (lowerQuery.includes("popular") || lowerQuery.includes("trending")) {
        sort_by = "featured";
        sort_order = "desc";
        confidence += 0.1;
    }

    confidence = Math.min(confidence, 1.0);

    return {
        listing_type,
        filters,
        sort_by,
        sort_order,
        confidence: Math.round(confidence * 100) / 100,
        original_query: sanitizedQuery,
    };
}

serve(async (req: Request) => {
    const startTime = Date.now();

    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST
    if (req.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing environment variables");
            return jsonResponse({ error: "Server configuration error" }, 500);
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        let body: any;
        try {
            body = await req.json();
        } catch {
            return jsonResponse({ error: "Invalid JSON body" }, 400);
        }

        const { query, execute = true, limit = 10 } = body;

        // Validate query
        if (!query || typeof query !== "string") {
            return jsonResponse({ error: "query is required and must be a string" }, 400);
        }

        if (query.length < MIN_QUERY_LENGTH) {
            return jsonResponse({ error: `Query must be at least ${MIN_QUERY_LENGTH} characters` }, 400);
        }

        if (query.length > MAX_QUERY_LENGTH) {
            return jsonResponse({ error: `Query must not exceed ${MAX_QUERY_LENGTH} characters` }, 400);
        }

        // Validate limit
        const safeLimit = Math.min(Math.max(1, parseInt(limit) || 10), MAX_RESULTS);

        // Parse the natural language query
        const intent = parseNaturalLanguage(query);

        if (!execute) {
            // Just return the parsed intent without executing
            return jsonResponse({
                intent,
                meta: {
                    timestamp: new Date().toISOString(),
                    response_time_ms: Date.now() - startTime,
                },
            });
        }

        // Execute the search based on parsed intent
        const results: any = { businesses: [], franchises: [] };

        try {
            if (intent.listing_type === "both" || intent.listing_type === "business") {
                let businessQuery = supabase
                    .from("businesses")
                    .select("id, slug, name, industry, location, city, state, price, revenue, verification_status, verified_at, data_completeness_score, images, featured, trending")
                    .eq("status", "active");

                if (intent.filters.industry) businessQuery = businessQuery.eq("industry", intent.filters.industry);
                if (intent.filters.city) businessQuery = businessQuery.ilike("city", `%${intent.filters.city}%`);
                if (intent.filters.state) businessQuery = businessQuery.ilike("state", `%${intent.filters.state}%`);
                if (intent.filters.min_price) businessQuery = businessQuery.gte("price", intent.filters.min_price);
                if (intent.filters.max_price) businessQuery = businessQuery.lte("price", intent.filters.max_price);
                if (intent.filters.verification_status) businessQuery = businessQuery.eq("verification_status", intent.filters.verification_status);

                if (intent.sort_by && ["price", "created_at", "data_completeness_score", "featured"].includes(intent.sort_by)) {
                    businessQuery = businessQuery.order(intent.sort_by, { ascending: intent.sort_order === "asc" });
                } else {
                    businessQuery = businessQuery.order("created_at", { ascending: false });
                }

                const { data, error } = await businessQuery.limit(safeLimit);
                if (error) {
                    console.error("Business query error:", error);
                }
                results.businesses = data || [];
            }

            if (intent.listing_type === "both" || intent.listing_type === "franchise") {
                let franchiseQuery = supabase
                    .from("franchises")
                    .select("id, slug, brand_name, industry, total_investment_min, total_investment_max, franchise_fee, total_outlets, verification_status, verified_at, data_completeness_score, logo_url, featured, trending")
                    .eq("status", "active");

                if (intent.filters.industry) franchiseQuery = franchiseQuery.eq("industry", intent.filters.industry);
                if (intent.filters.min_investment) franchiseQuery = franchiseQuery.gte("total_investment_min", intent.filters.min_investment);
                if (intent.filters.max_investment) franchiseQuery = franchiseQuery.lte("total_investment_max", intent.filters.max_investment);
                if (intent.filters.verification_status) franchiseQuery = franchiseQuery.eq("verification_status", intent.filters.verification_status);

                if (intent.sort_by && ["total_investment_min", "created_at", "data_completeness_score", "featured"].includes(intent.sort_by)) {
                    franchiseQuery = franchiseQuery.order(intent.sort_by, { ascending: intent.sort_order === "asc" });
                } else {
                    franchiseQuery = franchiseQuery.order("created_at", { ascending: false });
                }

                const { data, error } = await franchiseQuery.limit(safeLimit);
                if (error) {
                    console.error("Franchise query error:", error);
                }
                results.franchises = data || [];
            }
        } catch (dbError) {
            console.error("Database error:", dbError);
            return jsonResponse({ error: "Failed to search listings" }, 500);
        }

        return jsonResponse({
            intent,
            results,
            meta: {
                total_businesses: results.businesses.length,
                total_franchises: results.franchises.length,
                timestamp: new Date().toISOString(),
                response_time_ms: Date.now() - startTime,
            },
        });

    } catch (error) {
        console.error("NL Search Error:", error);
        return jsonResponse({ error: "Internal server error" }, 500);
    }
});

function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
