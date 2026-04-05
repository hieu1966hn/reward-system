-- ==============================================================================
-- MIGRATION: 006_inventory_and_approvals_round6.sql
-- DESCRIPTION: Creates the `inventory` table, seeds data, and creates `approve_redemption` RPC for Round 6.
-- ==============================================================================

-- 1. Alter redemption constraint to add 'fulfilled'
ALTER TABLE public.redemptions DROP CONSTRAINT IF EXISTS redemptions_status_check;
ALTER TABLE public.redemptions ADD CONSTRAINT redemptions_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'fulfilled'));

-- 2. Create Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id UUID NOT NULL REFERENCES public.reward_catalog(id) ON DELETE CASCADE,
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(reward_id, campus_id)
);

-- RLS for Inventory
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Teachers can view inventory" 
ON public.inventory FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'teacher'));

CREATE POLICY "Admins and Teachers can update inventory" 
ON public.inventory FOR UPDATE 
USING (public.get_current_user_role() IN ('admin', 'teacher'));

CREATE POLICY "Admins and Teachers can insert inventory" 
ON public.inventory FOR INSERT 
WITH CHECK (public.get_current_user_role() IN ('admin', 'teacher'));

-- 3. Seed some initial inventory data
-- First, find a campus ID and some reward IDs
DO $$
DECLARE
  v_campus_id UUID;
  v_reward1_id UUID;
  v_reward2_id UUID;
  v_reward3_id UUID;
BEGIN
  -- Get first campus
  SELECT id INTO v_campus_id FROM public.campuses LIMIT 1;
  
  IF v_campus_id IS NOT NULL THEN
    -- Get some rewards
    SELECT id INTO v_reward1_id FROM public.reward_catalog LIMIT 1 OFFSET 0;
    SELECT id INTO v_reward2_id FROM public.reward_catalog LIMIT 1 OFFSET 1;
    SELECT id INTO v_reward3_id FROM public.reward_catalog LIMIT 1 OFFSET 2;
    
    -- Insert with ON CONFLICT DO NOTHING just in case
    IF v_reward1_id IS NOT NULL THEN
      INSERT INTO public.inventory(reward_id, campus_id, stock_quantity) 
      VALUES (v_reward1_id, v_campus_id, 10)
      ON CONFLICT DO NOTHING;
    END IF;
    
    IF v_reward2_id IS NOT NULL THEN
      INSERT INTO public.inventory(reward_id, campus_id, stock_quantity) 
      VALUES (v_reward2_id, v_campus_id, 3) -- Low stock simulation
      ON CONFLICT DO NOTHING;
    END IF;
    
    IF v_reward3_id IS NOT NULL THEN
      INSERT INTO public.inventory(reward_id, campus_id, stock_quantity) 
      VALUES (v_reward3_id, v_campus_id, 0) -- Out of stock simulation
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- 4. RPC for fulfilling an approval with atomic checking
CREATE OR REPLACE FUNCTION public.approve_redemption(
  p_redemption_id UUID,
  p_campus_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_actor_role TEXT;
  v_redem RECORD;
  v_stock INTEGER;
  v_current_points INTEGER;
BEGIN
  -- Authenticate
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT public.get_current_user_role() INTO v_actor_role;
  IF v_actor_role NOT IN ('admin', 'teacher') THEN
    RAISE EXCEPTION 'Only admin or teacher can approve redemptions';
  END IF;

  -- 1. Lock redemption row
  SELECT * INTO v_redem 
  FROM public.redemptions 
  WHERE id = p_redemption_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Redemption request not found';
  END IF;

  IF v_redem.status != 'pending' THEN
    RAISE EXCEPTION 'Request is already processed (status: %)', v_redem.status;
  END IF;

  -- 2. Check stock
  SELECT stock_quantity INTO v_stock
  FROM public.inventory
  WHERE reward_id = v_redem.reward_id AND campus_id = p_campus_id
  FOR UPDATE;

  IF NOT FOUND OR v_stock <= 0 THEN
    RAISE EXCEPTION 'Out of stock for this reward at specified campus';
  END IF;

  -- 3. Check student points 
  SELECT total_points INTO v_current_points
  FROM public.students
  WHERE id = v_redem.student_id;

  IF v_current_points < v_redem.points_cost THEN
    RAISE EXCEPTION 'Student does not have enough points (Hack attempt detected)';
  END IF;

  -- 4. Deduct stock
  UPDATE public.inventory
  SET stock_quantity = stock_quantity - 1, updated_at = now()
  WHERE reward_id = v_redem.reward_id AND campus_id = p_campus_id;

  -- 5. Deduct points from student
  UPDATE public.students
  SET total_points = total_points - v_redem.points_cost
  WHERE id = v_redem.student_id;

  -- 6. Insert negative point transaction
  INSERT INTO public.point_transactions (
    student_id,
    rule_id,
    points_delta,
    source_type,
    event_key,
    note,
    created_by
  ) VALUES (
    v_redem.student_id,
    NULL,
    -(v_redem.points_cost),
    'redemption',
    'redemption_approve_' || p_redemption_id,
    'Trừ điểm duyệt đơn đổi quà hợp lệ',
    v_actor_id
  );

  -- 7. Update redemption status
  UPDATE public.redemptions
  SET status = 'approved', updated_at = now()
  WHERE id = p_redemption_id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_redemption(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_redemption(UUID, UUID) TO authenticated;
