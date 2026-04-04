-- ============================================================
-- Fix RLS recursion for profiles/students
-- ============================================================

-- Read current user's app role without triggering RLS recursion.
-- SECURITY DEFINER lets the function read profiles safely while
-- still filtering by auth.uid() from the caller's JWT context.
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins and teachers can read all students" ON students;
CREATE POLICY "Admins and teachers can read all students"
  ON students FOR SELECT
  TO authenticated
  USING (public.get_current_user_role() IN ('admin', 'teacher'));
