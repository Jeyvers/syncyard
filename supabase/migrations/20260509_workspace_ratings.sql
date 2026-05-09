-- Workspace ratings (guests use their temp_id as user_id)
CREATE TABLE IF NOT EXISTS workspace_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id text NOT NULL,
  stars smallint NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE workspace_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can insert their own rating
CREATE POLICY "insert own rating" ON workspace_ratings
  FOR INSERT WITH CHECK (true);

-- Anyone can read ratings
CREATE POLICY "read ratings" ON workspace_ratings
  FOR SELECT USING (true);

GRANT SELECT, INSERT ON workspace_ratings TO authenticated;
GRANT SELECT, INSERT ON workspace_ratings TO anon;

-- Also allow anon to read active workspaces (needed for landing page)
CREATE POLICY IF NOT EXISTS "anon can read active workspaces" ON workspaces
  FOR SELECT USING (true);
