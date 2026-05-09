ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS last_empty_at timestamptz;
