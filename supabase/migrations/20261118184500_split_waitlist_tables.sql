BEGIN;

CREATE TABLE public.customer_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 5 AND 255),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 30),
  city TEXT CHECK (city IS NULL OR char_length(city) <= 80),
  country TEXT CHECK (country IS NULL OR char_length(country) BETWEEN 2 AND 80),
  persona TEXT CHECK (persona IS NULL OR persona IN ('homemaker', 'student', 'professional', 'everyday')),
  interests TEXT[] NOT NULL DEFAULT '{}',
  note TEXT CHECK (note IS NULL OR char_length(note) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX customer_waitlist_email_key ON public.customer_waitlist (email);
CREATE INDEX customer_waitlist_created_idx ON public.customer_waitlist (created_at DESC);
GRANT INSERT ON public.customer_waitlist TO anon, authenticated;
GRANT ALL ON public.customer_waitlist TO service_role;
ALTER TABLE public.customer_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join customer waitlist"
  ON public.customer_waitlist FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE TABLE public.vendor_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT CHECK (business_name IS NULL OR char_length(business_name) BETWEEN 2 AND 120),
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 5 AND 255),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 30),
  city TEXT CHECK (city IS NULL OR char_length(city) <= 80),
  country TEXT CHECK (country IS NULL OR char_length(country) BETWEEN 2 AND 80),
  persona TEXT CHECK (persona IS NULL OR persona IN ('market', 'shop', 'home', 'farmer')),
  interests TEXT[] NOT NULL DEFAULT '{}',
  note TEXT CHECK (note IS NULL OR char_length(note) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX vendor_waitlist_email_key ON public.vendor_waitlist (email);
CREATE INDEX vendor_waitlist_created_idx ON public.vendor_waitlist (created_at DESC);
GRANT INSERT ON public.vendor_waitlist TO anon, authenticated;
GRANT ALL ON public.vendor_waitlist TO service_role;
ALTER TABLE public.vendor_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join vendor waitlist"
  ON public.vendor_waitlist FOR INSERT TO anon, authenticated
  WITH CHECK (true);

INSERT INTO public.customer_waitlist (
  id, full_name, email, phone, note, created_at
)
SELECT
  id, name, email, phone, what_they_sell, created_at
FROM public.waitlist_entries
WHERE role = 'customer';

WITH legacy_vendor_rows AS (
  SELECT
    id,
    name,
    email,
    phone,
    what_they_sell,
    created_at,
    string_to_array(COALESCE(what_they_sell, ''), ' · ') AS parts
  FROM public.waitlist_entries
  WHERE role = 'vendor'
), classified_vendor_rows AS (
  SELECT
    legacy_vendor_rows.*,
    (
      SELECT subscript
      FROM generate_subscripts(parts, 1) AS subscripts(subscript)
      WHERE subscript >= 3
        AND parts[subscript] IN ('market', 'shop', 'home', 'farmer')
      ORDER BY subscript
      LIMIT 1
    ) AS persona_position
  FROM legacy_vendor_rows
)
INSERT INTO public.vendor_waitlist (
  id, business_name, full_name, email, phone, city, country, persona, interests, note, created_at
)
SELECT
  id,
  CASE WHEN persona_position IS NOT NULL THEN NULLIF(parts[1], '') END,
  name,
  email,
  phone,
  CASE
    WHEN persona_position > 3 THEN NULLIF(parts[persona_position - 2], '')
  END,
  CASE
    WHEN persona_position IS NOT NULL THEN NULLIF(parts[persona_position - 1], '')
  END,
  CASE
    WHEN persona_position IS NOT NULL THEN parts[persona_position]
  END,
  CASE
    WHEN persona_position IS NOT NULL
      AND NULLIF(parts[persona_position + 1], '') IS NOT NULL
      THEN string_to_array(parts[persona_position + 1], ', ')
    ELSE '{}'::TEXT[]
  END,
  CASE
    WHEN persona_position IS NOT NULL
      THEN NULLIF(array_to_string(parts[persona_position + 2:array_length(parts, 1)], ' · '), '')
    ELSE what_they_sell
  END,
  created_at
FROM classified_vendor_rows;

CREATE OR REPLACE FUNCTION public.customer_waitlist_count()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*) FROM public.customer_waitlist
$$;
GRANT EXECUTE ON FUNCTION public.customer_waitlist_count() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.vendor_waitlist_count()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*) FROM public.vendor_waitlist
$$;
GRANT EXECUTE ON FUNCTION public.vendor_waitlist_count() TO anon, authenticated, service_role;

ALTER TABLE public.waitlist_entries RENAME TO waitlist_entries_legacy;
DROP POLICY IF EXISTS "Anyone can join the waitlist" ON public.waitlist_entries_legacy;
REVOKE ALL ON public.waitlist_entries_legacy FROM anon, authenticated;

COMMIT;
