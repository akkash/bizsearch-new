import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface QuoteRequestPayload {
    listing_ids: string[];
    listing_type: "business" | "franchise";
    requirements: {
        budget_range?: { min?: number; max?: number };
        timeline?: string;
        location_preference?: string;
        experience_level?: string;
        additional_notes?: string;
    };
}

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get user from auth header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return jsonResponse({ error: "Authorization required" }, 401);
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return jsonResponse({ error: "Invalid token" }, 401);
        }

        const url = new URL(req.url);
        const path = url.pathname.replace("/quote-agent", "");

        // Create new quote request
        if (req.method === "POST" && (path === "/create" || path === "/create/")) {
            const payload: QuoteRequestPayload = await req.json();
            return await createQuoteRequest(supabase, user.id, payload);
        }

        // Get quote request status
        if (req.method === "GET" && path.startsWith("/status/")) {
            const requestId = path.replace("/status/", "");
            return await getQuoteStatus(supabase, user.id, requestId);
        }

        // List user's quote requests
        if (req.method === "GET" && (path === "/list" || path === "/list/")) {
            return await listQuoteRequests(supabase, user.id);
        }

        // Process pending quotes (called by cron job)
        if (req.method === "POST" && path === "/process") {
            return await processQuotes(supabase);
        }

        return jsonResponse({ error: "Not found" }, 404);

    } catch (error) {
        console.error("Quote Agent Error:", error);
        return jsonResponse({ error: "Internal server error" }, 500);
    }
});

async function createQuoteRequest(supabase: any, userId: string, payload: QuoteRequestPayload) {
    const { listing_ids, listing_type, requirements } = payload;

    if (!listing_ids || listing_ids.length === 0) {
        return jsonResponse({ error: "At least one listing is required" }, 400);
    }

    if (listing_ids.length > 5) {
        return jsonResponse({ error: "Maximum 5 listings per quote request" }, 400);
    }

    // Get user profile for personalized messages
    const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, email, phone")
        .eq("id", userId)
        .single();

    // Create quote request
    const { data: quoteRequest, error: createError } = await supabase
        .from("quote_requests")
        .insert({
            user_id: userId,
            listing_ids,
            listing_type,
            requirements,
            status: "collecting",
        })
        .select()
        .single();

    if (createError) {
        return jsonResponse({ error: createError.message }, 400);
    }

    // Get listing details
    const table = listing_type === "franchise" ? "franchises" : "businesses";
    const nameField = listing_type === "franchise" ? "brand_name" : "name";

    const { data: listings } = await supabase
        .from(table)
        .select(`id, ${nameField}, owner_id, industry`)
        .in("id", listing_ids);

    // Create individual quote responses for each listing
    const responses = (listings || []).map((listing: any) => ({
        quote_request_id: quoteRequest.id,
        listing_id: listing.id,
        listing_type,
        responder_id: listing.owner_id,
        initial_message: generateInquiryMessage(profile, listing, requirements, listing_type),
        status: "pending",
    }));

    await supabase.from("quote_responses").insert(responses);

    // Create agent task
    await supabase.from("agent_tasks").insert({
        type: "quote_request",
        status: "in_progress",
        user_id: userId,
        metadata: {
            quote_request_id: quoteRequest.id,
            listing_count: listing_ids.length,
        },
    });

    return jsonResponse({
        message: "Quote request created",
        quote_request_id: quoteRequest.id,
        listings_contacted: listing_ids.length,
        estimated_response_time: "24-48 hours",
    });
}

function generateInquiryMessage(
    profile: any,
    listing: any,
    requirements: any,
    listingType: string
): string {
    const listingName = listing.brand_name || listing.name;
    const buyerName = profile?.display_name || "A potential buyer";

    let message = `Dear ${listingName} Team,\n\n`;
    message += `${buyerName} is interested in learning more about your ${listingType} opportunity.\n\n`;

    if (requirements.budget_range) {
        const budget = requirements.budget_range;
        if (budget.min && budget.max) {
            message += `Budget Range: ₹${formatAmount(budget.min)} - ₹${formatAmount(budget.max)}\n`;
        } else if (budget.max) {
            message += `Maximum Budget: ₹${formatAmount(budget.max)}\n`;
        }
    }

    if (requirements.timeline) {
        message += `Preferred Timeline: ${requirements.timeline}\n`;
    }

    if (requirements.location_preference) {
        message += `Location Preference: ${requirements.location_preference}\n`;
    }

    if (requirements.experience_level) {
        message += `Experience Level: ${requirements.experience_level}\n`;
    }

    if (requirements.additional_notes) {
        message += `\nAdditional Notes: ${requirements.additional_notes}\n`;
    }

    message += `\nPlease provide details on pricing, terms, and next steps.\n\n`;
    message += `This inquiry was sent via BizSearch Quote Collection Agent.\n`;
    message += `Reply directly to continue the conversation.`;

    return message;
}

function formatAmount(amount: number): string {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(0)}L`;
    return amount.toLocaleString();
}

async function getQuoteStatus(supabase: any, userId: string, requestId: string) {
    // Get quote request
    const { data: request, error } = await supabase
        .from("quote_requests")
        .select("*")
        .eq("id", requestId)
        .eq("user_id", userId)
        .single();

    if (error || !request) {
        return jsonResponse({ error: "Quote request not found" }, 404);
    }

    // Get individual responses
    const { data: responses } = await supabase
        .from("quote_responses")
        .select("listing_id, listing_type, status, response_message, response_data, responded_at")
        .eq("quote_request_id", requestId);

    // Get listing details for names
    const listingType = request.listing_type;
    const table = listingType === "franchise" ? "franchises" : "businesses";
    const nameField = listingType === "franchise" ? "brand_name" : "name";

    const { data: listings } = await supabase
        .from(table)
        .select(`id, ${nameField}`)
        .in("id", request.listing_ids);

    const listingMap = (listings || []).reduce((acc: any, l: any) => {
        acc[l.id] = l[nameField] || l.name;
        return acc;
    }, {});

    const enrichedResponses = (responses || []).map((r: any) => ({
        ...r,
        listing_name: listingMap[r.listing_id] || "Unknown",
    }));

    return jsonResponse({
        id: request.id,
        status: request.status,
        created_at: request.created_at,
        expires_at: request.expires_at,
        requirements: request.requirements,
        responses: enrichedResponses,
        summary: {
            total: enrichedResponses.length,
            responded: enrichedResponses.filter((r: any) => r.status === "responded").length,
            pending: enrichedResponses.filter((r: any) => r.status === "pending" || r.status === "sent").length,
        },
        comparison: request.comparison_data,
    });
}

async function listQuoteRequests(supabase: any, userId: string) {
    const { data, error } = await supabase
        .from("quote_requests")
        .select("id, status, listing_type, created_at, expires_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        return jsonResponse({ error: error.message }, 400);
    }

    return jsonResponse({ quote_requests: data || [] });
}

async function processQuotes(supabase: any) {
    // This would be called by a cron job to:
    // 1. Send pending inquiry emails
    // 2. Check for expired requests
    // 3. Generate comparison reports for completed requests

    // Mark expired requests
    await supabase
        .from("quote_requests")
        .update({ status: "expired" })
        .eq("status", "collecting")
        .lt("expires_at", new Date().toISOString());

    // Update completed requests
    const { data: completable } = await supabase
        .from("quote_requests")
        .select("id")
        .eq("status", "collecting")
        .gte("expires_at", new Date().toISOString());

    for (const request of completable || []) {
        const { data: responses } = await supabase
            .from("quote_responses")
            .select("status")
            .eq("quote_request_id", request.id);

        const allResponded = responses?.every((r: any) =>
            r.status === "responded" || r.status === "declined" || r.status === "expired"
        );

        if (allResponded && responses?.length > 0) {
            await supabase
                .from("quote_requests")
                .update({ status: "completed" })
                .eq("id", request.id);
        }
    }

    return jsonResponse({ message: "Processing complete" });
}

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
