-- ============================================================
-- RewardSystem: Round 1 Initial Schema
-- Tables: campuses, profiles
-- ============================================================

-- ─── 1. CAMPUSES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campuses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_name TEXT NOT NULL,
  region      TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read campuses
CREATE POLICY "Authenticated users can read campuses"
  ON campuses FOR SELECT
  TO authenticated
  USING (true);

-- ─── 2. PROFILES ─────────────────────────────────────────────
-- Extends Supabase auth.users with role + campus info
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'teacher', 'admin')),
  campus_id   UUID REFERENCES campuses(id) ON DELETE SET NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (name, avatar only — not role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── 3. TRIGGER: Auto-create profile on user signup ──────────
-- When a new user signs up via Supabase Auth, automatically create
-- a corresponding profile record with default role = 'student'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    'student',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── 4. SEED: Campus data ────────────────────────────────────
-- MindX campuses across Vietnam
INSERT INTO campuses (campus_name, region, is_active) VALUES
  ('MindX Tây Hồ Tây',        'Hà Nội', true),
  ('MindX Cầu Giấy',          'Hà Nội', true),
  ('MindX Đống Đa',           'Hà Nội', true),
  ('MindX Bình Thạnh',        'Hồ Chí Minh', true),
  ('MindX Quận 7',            'Hồ Chí Minh', true),
  ('MindX Thủ Đức',           'Hồ Chí Minh', true)
ON CONFLICT DO NOTHING;
