-- ============================================================
-- Round 6: allow teacher/admin to process redemptions
-- ============================================================

DROP POLICY IF EXISTS "Admins can update any redemption" ON public.redemptions;

CREATE POLICY "Admins and Teachers can update any redemption"
ON public.redemptions
FOR UPDATE
USING (
  public.get_current_user_role() IN ('admin', 'teacher')
)
WITH CHECK (
  public.get_current_user_role() IN ('admin', 'teacher')
);
