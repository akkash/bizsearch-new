-- Auto-generate SEO-friendly slugs for businesses and franchises
-- Format: brand-name-a3b2 (lowercase, hyphenated, with 4-char random suffix)

-- Function to generate URL-friendly slug from text
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  random_suffix TEXT;
BEGIN
  -- Convert to lowercase
  slug := lower(input_text);
  
  -- Replace special characters and spaces with hyphens
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := trim(both '-' from slug);
  
  -- Generate 4-character alphanumeric random suffix
  random_suffix := substring(md5(random()::text || clock_timestamp()::text) from 1 for 4);
  
  -- Combine slug with random suffix
  RETURN slug || '-' || random_suffix;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for businesses
CREATE OR REPLACE FUNCTION set_business_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if not provided or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for franchises
CREATE OR REPLACE FUNCTION set_franchise_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if not provided or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.brand_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_set_business_slug ON public.businesses;
DROP TRIGGER IF EXISTS trigger_set_franchise_slug ON public.franchises;

-- Create triggers
CREATE TRIGGER trigger_set_business_slug
  BEFORE INSERT ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION set_business_slug();

CREATE TRIGGER trigger_set_franchise_slug
  BEFORE INSERT ON public.franchises
  FOR EACH ROW
  EXECUTE FUNCTION set_franchise_slug();

-- Backfill existing records that have NULL or empty slugs
UPDATE public.businesses
SET slug = generate_slug(name)
WHERE slug IS NULL OR slug = '';

UPDATE public.franchises
SET slug = generate_slug(brand_name)
WHERE slug IS NULL OR slug = '';

-- Add comment for documentation
COMMENT ON FUNCTION generate_slug(TEXT) IS 'Generates URL-friendly slug from text with random 4-char suffix';
