import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Production constants
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const MAX_SEARCH_LENGTH = 100;
const ALLOWED_SORT_FIELDS = ["created_at", "price", "total_investment_min", "name", "brand_name", "data_completeness_score"];
const ALLOWED_VERIFICATION_STATUSES = ["verified", "pending", "unverified", "rejected"];

interface QueryParams {
    page?: number;
    limit?: number;
    industry?: string;
    location?: string;
    city?: string;
    state?: string;
    min_price?: number;
    max_price?: number;
    min_investment?: number;
    max_investment?: number;
    verification_status?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    search?: string;
}

// Sanitize string input to prevent injection
function sanitizeString(input: string | null, maxLength: number = 100): string | undefined {
    if (!input) return undefined;
    // Remove special characters that could be used for injection
    const sanitized = input.replace(/[%_'";\\\x00]/g, "").trim();
    return sanitized.slice(0, maxLength) || undefined;
}

// Validate and parse integer with bounds
function parsePositiveInt(value: string | null, defaultValue: number, max: number): number {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) return defaultValue;
    return Math.min(parsed, max);
}

// Validate sort field
function validateSortField(field: string | null, defaultField: string): string {
    if (!field) return defaultField;
    return ALLOWED_SORT_FIELDS.includes(field) ? field : defaultField;
}

// Validate verification status
function validateVerificationStatus(status: string | null): string | undefined {
    if (!status) return undefined;
    return ALLOWED_VERIFICATION_STATUSES.includes(status) ? status : undefined;
}

serve(async (req: Request) => {
    const startTime = Date.now();

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    // Only allow GET requests for this API
    if (req.method !== "GET") {
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

        const url = new URL(req.url);
        const path = url.pathname.replace("/api-v1", "").replace(/\/$/, ""); // Normalize trailing slash

        // Parse and validate query parameters
        const params: QueryParams = {
            page: parsePositiveInt(url.searchParams.get("page"), 1, 1000),
            limit: parsePositiveInt(url.searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT),
            industry: sanitizeString(url.searchParams.get("industry")),
            location: sanitizeString(url.searchParams.get("location")),
            city: sanitizeString(url.searchParams.get("city")),
            state: sanitizeString(url.searchParams.get("state")),
            min_price: parsePositiveInt(url.searchParams.get("min_price"), 0, 10000000000),
            max_price: parsePositiveInt(url.searchParams.get("max_price"), 0, 10000000000),
            min_investment: parsePositiveInt(url.searchParams.get("min_investment"), 0, 10000000000),
            max_investment: parsePositiveInt(url.searchParams.get("max_investment"), 0, 10000000000),
            verification_status: validateVerificationStatus(url.searchParams.get("verification_status")),
            sort_by: validateSortField(url.searchParams.get("sort_by"), "created_at"),
            sort_order: url.searchParams.get("sort_order") === "asc" ? "asc" : "desc",
            search: sanitizeString(url.searchParams.get("search"), MAX_SEARCH_LENGTH),
        };

        // Route handling
        if (path === "/businesses" || path === "") {
            return await handleBusinesses(supabase, params, startTime);
        }

        if (path.startsWith("/businesses/")) {
            const id = sanitizeString(path.replace("/businesses/", ""), 50);
            if (!id) return jsonResponse({ error: "Invalid business ID" }, 400);
            return await handleBusinessById(supabase, id, startTime);
        }

        if (path === "/franchises") {
            return await handleFranchises(supabase, params, startTime);
        }

        if (path.startsWith("/franchises/")) {
            const id = sanitizeString(path.replace("/franchises/", ""), 50);
            if (!id) return jsonResponse({ error: "Invalid franchise ID" }, 400);
            return await handleFranchiseById(supabase, id, startTime);
        }

        if (path === "/search") {
            return await handleSearch(supabase, params, startTime);
        }

        if (path === "/" || path === "") {
            return jsonResponse({
                name: "BizSearch API",
                version: "1.0.0",
                status: "healthy",
                endpoints: {
                    businesses: "/api-v1/businesses",
                    franchises: "/api-v1/franchises",
                    search: "/api-v1/search",
                },
                documentation: "https://bizsearch.in/api/docs",
            });
        }

        return jsonResponse({ error: "Endpoint not found", path }, 404);
    } catch (error) {
        console.error("API Error:", error);
        return jsonResponse({ error: "Internal server error" }, 500);
    }
});

// Handler Functions
async function handleBusinesses(supabase: any, params: QueryParams, startTime: number) {
    const { page = 1, limit = DEFAULT_LIMIT } = params;
    const offset = (page - 1) * limit;

    try {
        let query = supabase
            .from("businesses")
            .select("id, slug, name, industry, location, city, state, price, revenue, established_year, employees, business_type, description, images, verified_at, verification_status, data_completeness_score, featured, trending, created_at", { count: "exact" })
            .eq("status", "active");

        // Apply filters with sanitized inputs
        if (params.industry) query = query.eq("industry", params.industry);
        if (params.city) query = query.ilike("city", `%${params.city}%`);
        if (params.state) query = query.ilike("state", `%${params.state}%`);
        if (params.location) query = query.or(`city.ilike.%${params.location}%,state.ilike.%${params.location}%`);
        if (params.min_price && params.min_price > 0) query = query.gte("price", params.min_price);
        if (params.max_price && params.max_price > 0) query = query.lte("price", params.max_price);
        if (params.verification_status) query = query.eq("verification_status", params.verification_status);
        if (params.search) query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);

        // Apply sorting and pagination
        query = query.order(params.sort_by || "created_at", { ascending: params.sort_order === "asc" });
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error("Database error:", error);
            return jsonResponse({ error: "Failed to fetch businesses" }, 400);
        }

        return jsonResponse({
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / limit),
                has_next: offset + limit < (count || 0),
                has_prev: page > 1,
            },
            meta: {
                timestamp: new Date().toISOString(),
                response_time_ms: Date.now() - startTime,
            },
        });
    } catch (error) {
        console.error("Handler error:", error);
        return jsonResponse({ error: "Failed to process request" }, 500);
    }
}

async function handleBusinessById(supabase: any, id: string, startTime: number) {
    try {
        // Validate UUID format
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let query = supabase.from("businesses").select("*").eq("status", "active");

        if (isUUID) {
            query = query.eq("id", id);
        } else {
            // Slug lookup - validate slug format
            if (!/^[a-z0-9-]+$/.test(id)) {
                return jsonResponse({ error: "Invalid identifier format" }, 400);
            }
            query = query.eq("slug", id);
        }

        const { data, error } = await query.single();

        if (error || !data) {
            return jsonResponse({ error: "Business not found" }, 404);
        }

        return jsonResponse({
            data,
            meta: {
                timestamp: new Date().toISOString(),
                response_time_ms: Date.now() - startTime,
            },
        });
    } catch (error) {
        console.error("Handler error:", error);
        return jsonResponse({ error: "Failed to process request" }, 500);
    }
}

async function handleFranchises(supabase: any, params: QueryParams, startTime: number) {
    const { page = 1, limit = DEFAULT_LIMIT } = params;
    const offset = (page - 1) * limit;

    try {
        let query = supabase
            .from("franchises")
            .select("id, slug, brand_name, industry, description, total_investment_min, total_investment_max, franchise_fee, royalty_percentage, total_outlets, logo_url, images, verified_at, verification_status, data_completeness_score, featured, trending, created_at", { count: "exact" })
            .eq("status", "active");

        // Apply filters
        if (params.industry) query = query.eq("industry", params.industry);
        if (params.min_investment && params.min_investment > 0) query = query.gte("total_investment_min", params.min_investment);
        if (params.max_investment && params.max_investment > 0) query = query.lte("total_investment_max", params.max_investment);
        if (params.verification_status) query = query.eq("verification_status", params.verification_status);
        if (params.search) query = query.or(`brand_name.ilike.%${params.search}%,description.ilike.%${params.search}%`);

        // Apply sorting and pagination
        query = query.order(params.sort_by || "created_at", { ascending: params.sort_order === "asc" });
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error("Database error:", error);
            return jsonResponse({ error: "Failed to fetch franchises" }, 400);
        }

        return jsonResponse({
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / limit),
                has_next: offset + limit < (count || 0),
                has_prev: page > 1,
            },
            meta: {
                timestamp: new Date().toISOString(),
                response_time_ms: Date.now() - startTime,
            },
        });
    } catch (error) {
        console.error("Handler error:", error);
        return jsonResponse({ error: "Failed to process request" }, 500);
    }
}

async function handleFranchiseById(supabase: any, id: string, startTime: number) {
    try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let query = supabase.from("franchises").select("*").eq("status", "active");

        if (isUUID) {
            query = query.eq("id", id);
        } else {
            if (!/^[a-z0-9-]+$/.test(id)) {
                return jsonResponse({ error: "Invalid identifier format" }, 400);
            }
            query = query.eq("slug", id);
        }

        const { data, error } = await query.single();

        if (error || !data) {
            return jsonResponse({ error: "Franchise not found" }, 404);
        }

        return jsonResponse({
            data,
            meta: {
                timestamp: new Date().toISOString(),
                response_time_ms: Date.now() - startTime,
            },
        });
    } catch (error) {
        console.error("Handler error:", error);
        return jsonResponse({ error: "Failed to process request" }, 500);
    }
}

async function handleSearch(supabase: any, params: QueryParams, startTime: number) {
    if (!params.search || params.search.length < 2) {
        return jsonResponse({ error: "Search query must be at least 2 characters" }, 400);
    }

    const searchTerm = params.search;
    const { limit = 10 } = params;

    try {
        // Search businesses
        const { data: businesses, error: bizError } = await supabase
            .from("businesses")
            .select("id, slug, name, industry, location, price, verified_at, verification_status")
            .eq("status", "active")
            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`)
            .limit(limit);

        // Search franchises
        const { data: franchises, error: franError } = await supabase
            .from("franchises")
            .select("id, slug, brand_name, industry, total_investment_min, total_investment_max, verified_at, verification_status")
            .eq("status", "active")
            .or(`brand_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`)
            .limit(limit);

        if (bizError || franError) {
            console.error("Search error:", bizError || franError);
            return jsonResponse({ error: "Search failed" }, 400);
        }

        return jsonResponse({
            data: {
                businesses: businesses || [],
                franchises: franchises || [],
            },
            meta: {
                search_term: searchTerm,
                total_results: (businesses?.length || 0) + (franchises?.length || 0),
                timestamp: new Date().toISOString(),
                response_time_ms: Date.now() - startTime,
            },
        });
    } catch (error) {
        console.error("Search handler error:", error);
        return jsonResponse({ error: "Search failed" }, 500);
    }
}

function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": status === 200 ? "public, max-age=60" : "no-cache",
        },
    });
}
