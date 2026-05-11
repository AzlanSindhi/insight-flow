
ALTER TABLE public.datasets
  ADD COLUMN IF NOT EXISTS schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sample jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS dataset_id uuid;

CREATE INDEX IF NOT EXISTS chat_messages_user_dataset_idx
  ON public.chat_messages(user_id, dataset_id, created_at);
