-- Add ended_at to track when a workspace session ended
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS ended_at timestamptz;
