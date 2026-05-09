-- Atomic participant-count helpers
-- These eliminate the read-modify-write race when multiple clients join/leave simultaneously.

CREATE OR REPLACE FUNCTION increment_participant_count(workspace_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE workspaces
  SET participant_count = participant_count + 1,
      is_active         = true
  WHERE id = workspace_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_participant_count(workspace_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE workspaces
  SET participant_count = GREATEST(participant_count - 1, 0)
  WHERE id = workspace_id
  RETURNING participant_count INTO new_count;

  IF new_count = 0 THEN
    UPDATE workspaces
    SET is_active     = false,
        last_empty_at = NOW()
    WHERE id = workspace_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_participant_count TO authenticated, anon;
GRANT EXECUTE ON FUNCTION decrement_participant_count TO authenticated, anon;

-- ── One-time cleanup: reset rooms that are flagged active but have been empty for 30+ minutes ──
-- These are stale rows left behind before the webhook + atomic RPCs were in place.
UPDATE workspaces
SET is_active         = false,
    participant_count = 0
WHERE is_active  = true
  AND ended_at   IS NULL
  AND last_empty_at IS NOT NULL
  AND last_empty_at < NOW() - INTERVAL '30 minutes';

-- Also reset rooms that show positive participant_count but have been untouched since creation
-- (no one ever actually joined after the initial create), using a conservative 2-hour window.
UPDATE workspaces
SET is_active         = false,
    participant_count = 0,
    last_empty_at     = NOW()
WHERE is_active        = true
  AND ended_at         IS NULL
  AND last_empty_at    IS NULL
  AND participant_count > 0
  AND created_at < NOW() - INTERVAL '2 hours';
