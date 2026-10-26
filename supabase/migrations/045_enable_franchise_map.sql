-- The franchise map plots published brands. Keep the flag on so nav and admin match the page.
UPDATE public.feature_flags
SET enabled = true, updated_at = NOW()
WHERE key = 'franchise_map';
