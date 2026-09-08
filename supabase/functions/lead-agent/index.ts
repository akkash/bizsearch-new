import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-edge-function-secret",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Qualification criteria weights
const QUALIFICATION_WEIGHTS = {
    has_email: 15,
    has_phone: 20,
    has_name: 10,
    message_length: 15,
    specific_questions: 20,
    urgency_signals: 10,
    experience_mentioned: 10,
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const serviceClient = createClient(supabaseUrl, serviceRoleKey);

        const url = new URL(req.url);
        const path = url.pathname.replace("/lead-agent", "");

        // Internal/cron endpoints — require shared secret
        if (req.method === "POST" && (path === "/process-all" || path === "/process-all/")) {
            if (!isInternalCaller(req)) {
                return jsonResponse({ error: "Unauthorized" }, 401);
            }
            return await processAllPendingLeads(serviceClient);
        }

        if (req.method === "POST" && (path === "/process" || path === "/process/")) {
            if (!isInternalCaller(req)) {
                return jsonResponse({ error: "Unauthorized" }, 401);
            }
            const { inquiry_id } = await req.json();
            return await processInquiry(serviceClient, inquiry_id);
        }

        // User-facing endpoints — require authenticated JWT
        const user = await getAuthenticatedUser(req, supabaseUrl, anonKey);
        if (!user) {
            return jsonResponse({ error: "Unauthorized" }, 401);
        }

        if (req.method === "GET" && path.startsWith("/seller/")) {
            const sellerId = path.replace("/seller/", "").replace(/\/$/, "");
            if (!sellerId) {
                return jsonResponse({ error: "Seller ID required" }, 400);
            }
            if (user.id !== sellerId && !(await isAdminUser(serviceClient, user.id))) {
                return jsonResponse({ error: "Forbidden" }, 403);
            }
            return await getSellerLeads(serviceClient, sellerId);
        }

        if (req.method === "POST" && path.startsWith("/update/")) {
            const leadId = path.replace("/update/", "").replace(/\/$/, "");
            const { status } = await req.json();
            return await updateLeadStatus(serviceClient, leadId, status, user.id);
        }

        return jsonResponse({ error: "Not found" }, 404);

    } catch (error) {
        console.error("Lead Agent Error:", error);
        return jsonResponse({ error: "Internal server error" }, 500);
    }
});

async function getAuthenticatedUser(
    req: Request,
    supabaseUrl: string,
    anonKey: string
): Promise<User | null> {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }

    const supabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        return null;
    }

    return user;
}

function isInternalCaller(req: Request): boolean {
    const secret = Deno.env.get("EDGE_FUNCTION_SECRET");
    if (!secret) {
        console.error("EDGE_FUNCTION_SECRET is not configured");
        return false;
    }
    return req.headers.get("x-edge-function-secret") === secret;
}

async function isAdminUser(supabase: SupabaseClient, userId: string): Promise<boolean> {
    const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

    return data?.role === "admin";
}

async function processInquiry(supabase: SupabaseClient, inquiryId: string) {
    const { data: inquiry, error } = await supabase
        .from("inquiries")
        .select("*, listing:listing_id(*)")
        .eq("id", inquiryId)
        .single();

    if (error || !inquiry) {
        return jsonResponse({ error: "Inquiry not found" }, 404);
    }

    const { data: existingLead } = await supabase
        .from("lead_queue")
        .select("id")
        .eq("inquiry_id", inquiryId)
        .single();

    if (existingLead) {
        return jsonResponse({ message: "Lead already processed" });
    }

    const qualificationResult = qualifyLead(inquiry);
    const listingOwnerId = inquiry.listing?.owner_id || inquiry.listing?.seller_id;

    const { data: lead, error: leadError } = await supabase
        .from("lead_queue")
        .insert({
            inquiry_id: inquiryId,
            listing_id: inquiry.listing_id,
            listing_type: inquiry.listing_type || "business",
            seller_id: listingOwnerId,
            buyer_id: inquiry.user_id,
            buyer_name: inquiry.name,
            buyer_email: inquiry.email,
            buyer_phone: inquiry.phone,
            qualification_score: qualificationResult.score,
            qualification_notes: qualificationResult.notes,
            status: "new",
        })
        .select()
        .single();

    if (leadError) {
        return jsonResponse({ error: leadError.message }, 400);
    }

    const autoResponse = generateAutoResponse(inquiry, qualificationResult.score);

    await supabase
        .from("lead_queue")
        .update({
            auto_response_sent: true,
            auto_response_at: new Date().toISOString(),
            status: "auto_responded",
        })
        .eq("id", lead.id);

    await supabase.from("agent_tasks").insert({
        type: "lead_response",
        status: "completed",
        listing_id: inquiry.listing_id,
        listing_type: inquiry.listing_type || "business",
        metadata: {
            lead_id: lead.id,
            inquiry_id: inquiryId,
            qualification_score: qualificationResult.score,
            auto_response_sent: true,
        },
        result: {
            response_message: autoResponse,
        },
        completed_at: new Date().toISOString(),
    });

    if (qualificationResult.score >= 70) {
        await supabase
            .from("lead_queue")
            .update({
                seller_notified: true,
                seller_notified_at: new Date().toISOString(),
            })
            .eq("id", lead.id);
    }

    return jsonResponse({
        message: "Lead processed",
        lead_id: lead.id,
        qualification_score: qualificationResult.score,
        auto_response_sent: true,
        seller_notified: qualificationResult.score >= 70,
    });
}

function qualifyLead(inquiry: Record<string, unknown>): { score: number; notes: Record<string, boolean> } {
    let score = 0;
    const notes: Record<string, boolean> = {};

    const email = typeof inquiry.email === "string" ? inquiry.email : "";
    const phone = typeof inquiry.phone === "string" ? inquiry.phone : "";
    const name = typeof inquiry.name === "string" ? inquiry.name : "";
    const message = typeof inquiry.message === "string" ? inquiry.message : "";

    if (email.includes("@")) {
        score += QUALIFICATION_WEIGHTS.has_email;
        notes.has_email = true;
    }

    if (phone.length >= 10) {
        score += QUALIFICATION_WEIGHTS.has_phone;
        notes.has_phone = true;
    }

    if (name.length > 2) {
        score += QUALIFICATION_WEIGHTS.has_name;
        notes.has_name = true;
    }

    if (message.length > 100) {
        score += QUALIFICATION_WEIGHTS.message_length;
        notes.detailed_message = true;
    } else if (message.length > 50) {
        score += QUALIFICATION_WEIGHTS.message_length / 2;
        notes.moderate_message = true;
    }

    const lowerMessage = message.toLowerCase();
    const specificKeywords = ["price", "cost", "revenue", "profit", "terms", "timeline", "financing", "training", "support", "roi", "investment"];
    if (specificKeywords.some((kw) => lowerMessage.includes(kw))) {
        score += QUALIFICATION_WEIGHTS.specific_questions;
        notes.asks_specifics = true;
    }

    const urgencyKeywords = ["asap", "urgent", "immediately", "soon", "quickly", "this week", "this month"];
    if (urgencyKeywords.some((kw) => lowerMessage.includes(kw))) {
        score += QUALIFICATION_WEIGHTS.urgency_signals;
        notes.shows_urgency = true;
    }

    const experienceKeywords = ["experience", "background", "years", "currently", "business owner", "entrepreneur"];
    if (experienceKeywords.some((kw) => lowerMessage.includes(kw))) {
        score += QUALIFICATION_WEIGHTS.experience_mentioned;
        notes.mentions_experience = true;
    }

    return { score: Math.min(score, 100), notes };
}

function generateAutoResponse(inquiry: Record<string, unknown>, qualificationScore: number): string {
    const listing = inquiry.listing as Record<string, unknown> | undefined;
    const buyerName = typeof inquiry.name === "string" ? inquiry.name : "there";
    const listingName =
        (typeof listing?.name === "string" ? listing.name : null) ||
        (typeof listing?.brand_name === "string" ? listing.brand_name : null) ||
        "this listing";

    let response = `Hi ${buyerName},\n\n`;
    response += `Thank you for your interest in ${listingName}!\n\n`;

    if (qualificationScore >= 70) {
        response += `Your inquiry has been marked as high-priority and the seller will be reaching out to you shortly.\n\n`;
    } else {
        response += `We've received your inquiry and shared it with the seller. You can expect a response within 24-48 hours.\n\n`;
    }

    response += `In the meantime, here are a few things you can do:\n`;
    response += `• Review the complete listing details on BizSearch\n`;
    response += `• Prepare any questions you'd like to ask\n`;
    response += `• Check out similar opportunities in your area\n\n`;
    response += `Best regards,\nBizSearch Concierge\n\n`;
    response += `---\nThis is an automated message from BizSearch Lead Agent.`;

    return response;
}

async function getSellerLeads(supabase: SupabaseClient, sellerId: string) {
    const { data, error } = await supabase
        .from("lead_queue")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        return jsonResponse({ error: error.message }, 400);
    }

    const byStatus: Record<string, unknown[]> = {};
    for (const lead of data || []) {
        const status = lead.status as string;
        if (!byStatus[status]) {
            byStatus[status] = [];
        }
        byStatus[status].push(lead);
    }

    return jsonResponse({
        leads: data || [],
        summary: {
            total: data?.length || 0,
            new: byStatus.new?.length || 0,
            auto_responded: byStatus.auto_responded?.length || 0,
            qualified: byStatus.qualified?.length || 0,
            contacted: byStatus.contacted?.length || 0,
            converted: byStatus.converted?.length || 0,
        },
    });
}

async function updateLeadStatus(
    supabase: SupabaseClient,
    leadId: string,
    status: string,
    userId: string
) {
    const validStatuses = ["new", "auto_responded", "qualified", "contacted", "converted", "lost"];
    if (!validStatuses.includes(status)) {
        return jsonResponse({ error: "Invalid status" }, 400);
    }

    const { data: lead, error: leadError } = await supabase
        .from("lead_queue")
        .select("seller_id")
        .eq("id", leadId)
        .single();

    if (leadError || !lead) {
        return jsonResponse({ error: "Lead not found" }, 404);
    }

    if (lead.seller_id !== userId && !(await isAdminUser(supabase, userId))) {
        return jsonResponse({ error: "Forbidden" }, 403);
    }

    const { error } = await supabase
        .from("lead_queue")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", leadId);

    if (error) {
        return jsonResponse({ error: error.message }, 400);
    }

    return jsonResponse({ message: "Lead status updated" });
}

async function processAllPendingLeads(supabase: SupabaseClient) {
    const { data: pendingInquiries } = await supabase
        .from("inquiries")
        .select("id")
        .not("id", "in", supabase.from("lead_queue").select("inquiry_id"));

    let processed = 0;
    for (const inquiry of pendingInquiries || []) {
        try {
            await processInquiry(supabase, inquiry.id);
            processed++;
        } catch (e) {
            console.error(`Failed to process inquiry ${inquiry.id}:`, e);
        }
    }

    return jsonResponse({
        message: "Batch processing complete",
        processed,
    });
}

function jsonResponse(data: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
