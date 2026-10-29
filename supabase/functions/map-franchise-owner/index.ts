import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
        if (!supabaseUrl || !serviceRoleKey || !anonKey) {
            console.error("Missing Supabase environment variables");
            return jsonResponse({ error: "Server is not configured" }, 500);
        }

        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return jsonResponse({ error: "Authorization required" }, 401);
        }

        const service = createClient(supabaseUrl, serviceRoleKey);
        const token = authHeader.replace("Bearer ", "");
        const { data: authData, error: authError } = await service.auth.getUser(token);
        if (authError || !authData.user) {
            return jsonResponse({ error: "Invalid token" }, 401);
        }

        const { data: adminProfile, error: adminError } = await service
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .maybeSingle();

        if (adminError) {
            console.error("Admin profile lookup failed:", adminError);
            return jsonResponse({ error: "Could not verify admin access" }, 500);
        }
        if (adminProfile?.role !== "admin") {
            return jsonResponse({ error: "You are not allowed to map franchise owners" }, 403);
        }

        const body = await req.json().catch(() => null);
        const franchiseId = typeof body?.franchiseId === "string" ? body.franchiseId.trim() : "";
        const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
        const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
        const redirectTo = safeRedirect(body?.redirectTo);

        if (!UUID_PATTERN.test(franchiseId)) {
            return jsonResponse({ error: "A franchise is required" }, 400);
        }
        if (!EMAIL_PATTERN.test(email) || email.includes("%") || email.includes("_")) {
            return jsonResponse({ error: "Enter a valid email address" }, 400);
        }

        const { data: existing, error: existingError } = await service
            .from("profiles")
            .select("id, is_catalog_account")
            .ilike("email", email)
            .maybeSingle();

        if (existingError) {
            console.error("Owner lookup failed:", existingError);
            return jsonResponse({ error: "Could not look up that email" }, 500);
        }

        let ownerId = existing?.id as string | undefined;
        let invited = false;

        if (existing?.is_catalog_account) {
            return jsonResponse({ error: "The new owner cannot be a catalog account" }, 400);
        }

        if (!ownerId) {
            const inviteOptions: { data: Record<string, string>; redirectTo?: string } = {
                data: {
                    role: "franchisor",
                    display_name: displayName || email.split("@")[0],
                },
            };
            if (redirectTo) inviteOptions.redirectTo = redirectTo;

            const { data: invitedUser, error: inviteError } = await service.auth.admin.inviteUserByEmail(
                email,
                inviteOptions
            );

            if (inviteError || !invitedUser.user) {
                console.error("Invite failed:", inviteError);
                const alreadyRegistered = /already been registered|already exists/i.test(inviteError?.message || "");
                if (!alreadyRegistered) {
                    return jsonResponse({ error: "Could not send the owner invite" }, 400);
                }
                const { data: raced } = await service
                    .from("profiles")
                    .select("id, is_catalog_account")
                    .ilike("email", email)
                    .maybeSingle();
                if (!raced || raced.is_catalog_account) {
                    return jsonResponse({ error: "That email already has an account. Assign the existing owner instead." }, 409);
                }
                ownerId = raced.id;
            } else {
                ownerId = invitedUser.user.id;
                invited = true;
            }
        }

        if (!ownerId) {
            return jsonResponse({ error: "Could not prepare the owner account" }, 500);
        }

        const userClient = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        if (invited) {
            const ownerName = displayName || email.split("@")[0];
            const { data: createdProfile, error: profileReadError } = await service
                .from("profiles")
                .select("id")
                .eq("id", ownerId)
                .maybeSingle();

            if (profileReadError) {
                console.error("Owner profile lookup failed:", profileReadError);
                return jsonResponse({ error: "The invite was sent, but the owner profile could not be prepared" }, 500);
            }

            if (!createdProfile) {
                const { error: insertError } = await service.from("profiles").insert({
                    id: ownerId,
                    email,
                    display_name: ownerName,
                    role: "franchisor",
                });
                if (insertError) {
                    console.error("Owner profile insert failed:", insertError);
                    return jsonResponse({ error: "The invite was sent, but the owner profile could not be prepared" }, 500);
                }
            } else {
                const { error: profileError } = await userClient
                    .from("profiles")
                    .update({ display_name: ownerName, role: "franchisor" })
                    .eq("id", ownerId);
                if (profileError) {
                    console.error("Owner profile update failed:", profileError);
                    return jsonResponse({ error: "The invite was sent, but the owner profile could not be prepared" }, 500);
                }
            }

            await userClient
                .from("profile_roles")
                .update({ is_primary: false })
                .eq("profile_id", ownerId);
            const { error: roleError } = await userClient.from("profile_roles").upsert(
                { profile_id: ownerId, role: "franchisor", is_primary: true },
                { onConflict: "profile_id,role" }
            );
            if (roleError) {
                console.error("Role upsert failed:", roleError);
                return jsonResponse({ error: "The invite was sent, but the franchisor role could not be set" }, 500);
            }
        }
        const { data: mapped, error: mapError } = await userClient.rpc("admin_map_franchise_owner", {
            p_franchise_id: franchiseId,
            p_new_owner_id: ownerId,
        });

        if (mapError) {
            console.error("Franchise map failed:", mapError);
            return jsonResponse({
                error: invited
                    ? "The owner was invited, but the franchise could not be mapped. Assign the existing account."
                    : mapError.message || "Could not map the franchise",
                ownerId,
                invited,
            }, 400);
        }

        return jsonResponse({
            ownerId,
            invited,
            inquiriesMoved: mapped?.inquiries_moved ?? 0,
            conversationsMoved: mapped?.conversations_moved ?? 0,
        });
    } catch (error) {
        console.error("map-franchise-owner failed:", error);
        return jsonResponse({ error: "Could not map the franchise" }, 500);
    }
});

function safeRedirect(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    try {
        const url = new URL(value);
        if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
        if (url.pathname !== "/reset-password") return undefined;
        if (url.username || url.password) return undefined;
        return `${url.origin}/reset-password`;
    } catch {
        return undefined;
    }
}

function jsonResponse(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
