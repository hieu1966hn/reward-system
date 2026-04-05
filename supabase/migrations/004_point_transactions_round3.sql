-- ============================================================
-- RewardSystem: Round 3 — Point Transactions + Manual Awarding
-- ============================================================

-- ─── 1. POINT_TRANSACTIONS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS point_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  rule_id      UUID REFERENCES point_rules(id) ON DELETE SET NULL,
  points_delta INTEGER NOT NULL,
  source_type  TEXT NOT NULL
               CHECK (source_type IN ('rule', 'manual', 'redemption')),
  event_key    TEXT NOT NULL UNIQUE,
  note         TEXT,
  created_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT point_transactions_event_key_not_blank
    CHECK (length(trim(event_key)) > 0),
  CONSTRAINT point_transactions_non_zero_delta
    CHECK (points_delta <> 0)
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_student_created_at
  ON point_transactions (student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at
  ON point_transactions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_point_transactions_rule_id
  ON point_transactions (rule_id);

ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can read own point transactions" ON point_transactions;
CREATE POLICY "Students can read own point transactions"
  ON point_transactions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins and teachers can read all point transactions" ON point_transactions;
CREATE POLICY "Admins and teachers can read all point transactions"
  ON point_transactions FOR SELECT
  TO authenticated
  USING (public.get_current_user_role() IN ('admin', 'teacher'));

-- ─── 2. RPC: Manual award points (atomic) ─────────────────────
CREATE OR REPLACE FUNCTION public.award_points_manual(
  p_student_id UUID,
  p_rule_id UUID,
  p_note TEXT,
  p_event_key TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_actor_role TEXT;
  v_points INTEGER;
  v_tx_id UUID;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT public.get_current_user_role() INTO v_actor_role;
  IF v_actor_role NOT IN ('admin', 'teacher') THEN
    RAISE EXCEPTION 'Only admin or teacher can award points';
  END IF;

  IF p_student_id IS NULL OR p_rule_id IS NULL THEN
    RAISE EXCEPTION 'student_id and rule_id are required';
  END IF;

  IF p_event_key IS NULL OR length(trim(p_event_key)) = 0 THEN
    RAISE EXCEPTION 'event_key is required';
  END IF;

  IF p_note IS NULL OR length(trim(p_note)) = 0 THEN
    RAISE EXCEPTION 'note is required for manual awarding';
  END IF;

  SELECT points_awarded
    INTO v_points
  FROM point_rules
  WHERE id = p_rule_id
    AND is_active = true
  LIMIT 1;

  IF v_points IS NULL THEN
    RAISE EXCEPTION 'Point rule not found or inactive';
  END IF;

  INSERT INTO point_transactions (
    student_id,
    rule_id,
    points_delta,
    source_type,
    event_key,
    note,
    created_by
  ) VALUES (
    p_student_id,
    p_rule_id,
    v_points,
    'manual',
    trim(p_event_key),
    trim(p_note),
    v_actor_id
  )
  RETURNING id INTO v_tx_id;

  UPDATE students
  SET total_points = total_points + v_points
  WHERE id = p_student_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found';
  END IF;

  RETURN v_tx_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Duplicate event_key: %', p_event_key
      USING ERRCODE = '23505';
END;
$$;

REVOKE ALL ON FUNCTION public.award_points_manual(UUID, UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_points_manual(UUID, UUID, TEXT, TEXT) TO authenticated;
