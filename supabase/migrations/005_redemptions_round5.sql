-- ==============================================================================
-- MIGRATION: 005_redemptions_round5.sql
-- DESCRIPTION: Creates the `redemptions` table for Round 5.
-- ==============================================================================

-- 1. Create Redemption Status Enum type if not exists (or just use constraint)
-- We'll use a constraint for simplicity
CREATE TABLE IF NOT EXISTS public.redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.reward_catalog(id) ON DELETE CASCADE,
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Index for performance
CREATE INDEX IF NOT EXISTS idx_redemptions_student_id ON public.redemptions(student_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_reward_id ON public.redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON public.redemptions(status);

-- 3. Enable RLS
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies using the public.get_current_user_role() from Round 3

-- ADMIN / TEACHER: View all redemptions
CREATE POLICY "Admins and Teachers can view all redemptions"
ON public.redemptions
FOR SELECT
USING (
    public.get_current_user_role() IN ('admin', 'teacher')
);

-- STUDENT: View own redemptions
CREATE POLICY "Students can view their own redemptions"
ON public.redemptions
FOR SELECT
USING (
    auth.uid() = student_id
);

-- STUDENT: Insert own redemption
CREATE POLICY "Students can create a redemption"
ON public.redemptions
FOR INSERT
WITH CHECK (
    auth.uid() = student_id
    AND public.get_current_user_role() = 'student'
);

-- STUDENT: Cancel own pending redemption
CREATE POLICY "Students can cancel their own pending redemptions"
ON public.redemptions
FOR UPDATE
USING (
    auth.uid() = student_id
    AND public.get_current_user_role() = 'student'
    AND status = 'pending'
)
WITH CHECK (
    status = 'cancelled'
);

-- ADMIN: Update status (Preparation for Round 6 Approval)
CREATE POLICY "Admins can update any redemption"
ON public.redemptions
FOR UPDATE
USING (
    public.get_current_user_role() = 'admin'
);
