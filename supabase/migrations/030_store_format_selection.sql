-- Multi-format franchise support: persist selected format on enquire + apply

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS selected_store_format_id TEXT,
  ADD COLUMN IF NOT EXISTS selected_store_format_name TEXT,
  ADD COLUMN IF NOT EXISTS selected_store_format_snapshot JSONB;

ALTER TABLE public.franchise_applications
  ADD COLUMN IF NOT EXISTS selected_store_format_id TEXT,
  ADD COLUMN IF NOT EXISTS selected_store_format_name TEXT,
  ADD COLUMN IF NOT EXISTS selected_store_format_snapshot JSONB;

COMMENT ON COLUMN public.inquiries.selected_store_format_id IS
  'Store format id chosen by franchisee at enquire time';
COMMENT ON COLUMN public.franchise_applications.selected_store_format_id IS
  'Store format id chosen on application';
