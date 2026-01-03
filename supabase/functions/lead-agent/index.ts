import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Qualification criteria weights
const QUALIFICATION_WEIGHTS = {
    has_email: 15,
    has_phone: 20,
    has_name: 10,
    message_length: 15, // longer messages indicate more serious interest
    specific_questions: 20, // asks about price, terms, timeline
    urgency_signals: 10, // mentions "asap", "urgent", "soon"
    experience_mentioned: 10, // mentions relevant experience
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const url = new URL(req.url);
        const path = url.pathname.replace("/lead-agent", "");

        // Process new inquiry and auto-respond
        if (req.method === "POST" && (path === "/process" || path === "/process/")) {
            const { inquiry_id } = await req.json();
            return await processInquiry(supabase, inquiry_id);
        }

        // Get lead queue for a seller
        if (req.method === "GET" && path.startsWith("/seller/")) {
            const sellerId = path.replace("/seller/", "");
            return await getSellerLeads(supabase, sellerId);
        }

        // Update lead status
        if (req.method === "POST" && path.startsWith("/update/")) {
            const leadId = path.replace("/update/", "");
            const { status } = await req.json();
            return await updateLeadStatus(supabase, leadId, status);
        }

        // Process all pending leads (cron job)
        if (req.method === "POST" && path === "/process-all") {
            return await processAllPendingLeads(supabase);
        }

        return jsonResponse({ error: "Not found" }, 404);

    } catch (error) {
        console.error("Lead Agent Error:", error);
        return jsonResponse({ error: "Internal server error" }, 500);
    }
});

async function processInquiry(supabase: any, inquiryId: string) {
    // Get inquiry details
    const { data: inquiry, error } = await supabase
        .from("inquiries")
        .select("*, listing:listing_id(*)")
        .eq("id", inquiryId)
        .single();

    if (error || !inquiry) {
        return jsonResponse({ error: "Inquiry not found" }, 404);
    }

    // Check if already in lead queue
    const { data: existingLead } = await supabase
        .from("lead_queue")
        .select("id")
        .eq("inquiry_id", inquiryId)
        .single();

    if (existingLead) {
        return jsonResponse({ message: "Lead already processed" });
    }

    // Calculate qualification score
    const qualificationResult = qualifyLead(inquiry);

    // Get listing owner
    const listingOwnerId = inquiry.listing?.owner_id || inquiry.listing?.seller_id;

    // Create lead queue entry
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

    // Generate and send auto-response
    const autoResponse = generateAutoResponse(inquiry, qualificationResult.score);

    // Update lead with auto-response info
    await supabase
        .from("lead_queue")
        .update({
            auto_response_sent: true,
            auto_response_at: new Date().toISOString(),
            status: "auto_responded",
        })
        .eq("id", lead.id);

    // Create agent task
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

    // Notify seller about high-quality lead
    if (qualificationResult.score >= 70) {
        await supabase
            .from("lead_queue")
            .update({
                seller_notified: true,
                seller_notified_at: new Date().toISOString(),
            })
            .eq("id", lead.id);

        // Could trigger email/notification here
    }

    return jsonResponse({
        message: "Lead processed",
        lead_id: lead.id,
        qualification_score: qualificationResult.score,
        auto_response_sent: true,
        seller_notified: qualificationResult.score >= 70,
    });
}

function qualifyLead(inquiry: any): { score: number; notes: any } {
    let score = 0;
    const notes: any = {};

    // Has email
    if (inquiry.email && inquiry.email.includes("@")) {
        score += QUALIFICATION_WEIGHTS.has_email;
        notes.has_email = true;
    }

    // Has phone
    if (inquiry.phone && inquiry.phone.length >= 10) {
        score += QUALIFICATION_WEIGHTS.has_phone;
        notes.has_phone = true;
    }

    // Has name
    if (inquiry.name && inquiry.name.length > 2) {
        score += QUALIFICATION_WEIGHTS.has_name;
        notes.has_name = true;
    }

    // Message length (indicates seriousness)
    const message = inquiry.message || "";
    if (message.length > 100) {
        score += QUALIFICATION_WEIGHTS.message_length;
        notes.detailed_message = true;
    } else if (message.length > 50) {
        score += QUALIFICATION_WEIGHTS.message_length / 2;
        notes.moderate_message = true;
    }

    // Specific questions about business
    const lowerMessage = message.toLowerCase();
    const specificKeywords = ["price", "cost", "revenue", "profit", "terms", "timeline", "financing", "training", "support", "roi", "investment"];
    const hasSpecificQuestions = specificKeywords.some(kw => lowerMessage.includes(kw));
    if (hasSpecificQuestions) {
        score += QUALIFICATION_WEIGHTS.specific_questions;
        notes.asks_specifics = true;
    }

    // Urgency signals
    const urgencyKeywords = ["asap", "urgent", "immediately", "soon", "quickly", "this week", "this month"];
    const hasUrgency = urgencyKeywords.some(kw => lowerMessage.includes(kw));
    if (hasUrgency) {
        score += QUALIFICATION_WEIGHTS.urgency_signals;
        notes.shows_urgency = true;
    }

    // Experience mentioned
    const experienceKeywords = ["experience", "background", "years", "currently", "business owner", "entrepreneur"];
    const mentionsExperience = experienceKeywords.some(kw => lowerMessage.includes(kw));
    if (mentionsExperience) {
        score += QUALIFICATION_WEIGHTS.experience_mentioned;
        notes.mentions_experience = true;
    }

    return { score: Math.min(score, 100), notes };
}

function generateAutoResponse(inquiry: any, qualificationScore: number): string {
    const buyerName = inquiry.name || "there";
    const listingName = inquiry.listing?.name || inquiry.listing?.brand_name || "this listing";

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

async function getSellerLeads(supabase: any, sellerId: string) {
    const { data, error } = await supabase
        .from("lead_queue")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        return jsonResponse({ error: error.message }, 400);
    }

    // Group by status
    const byStatus = (data || []).reduce((acc: any, lead: any) => {
        acc[lead.status] = (acc[lead.status] || []).concat(lead);
        return acc;
    }, {});

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

async function updateLeadStatus(supabase: any, leadId: string, status: string) {
    const validStatuses = ["new", "auto_responded", "qualified", "contacted", "converted", "lost"];
    if (!validStatuses.includes(status)) {
        return jsonResponse({ error: "Invalid status" }, 400);
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

async function processAllPendingLeads(supabase: any) {
    // Get all new inquiries not yet in lead queue
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
