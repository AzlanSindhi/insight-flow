ALTER TABLE public.datasets
  ADD COLUMN IF NOT EXISTS domain text,
  ADD COLUMN IF NOT EXISTS understanding text,
  ADD COLUMN IF NOT EXISTS insights jsonb NOT NULL DEFAULT '{}'::jsonb;