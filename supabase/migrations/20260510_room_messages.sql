-- Room chat messages for LiveKit rooms
CREATE TABLE IF NOT EXISTS room_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT       NOT NULL,
  avatar_url  TEXT,
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS room_messages_room_id_created_at_idx
  ON room_messages (room_id, created_at);

ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read messages
CREATE POLICY "room_messages_select" ON room_messages
  FOR SELECT TO authenticated USING (true);

-- Users may only insert their own messages
CREATE POLICY "room_messages_insert" ON room_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
