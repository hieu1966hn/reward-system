-- ============================================================
-- Round 3 test-user role backfill
-- ============================================================

-- Ensure the two provided accounts have the expected roles for manual testing.
UPDATE public.profiles
SET role = 'admin'
WHERE id = '9ca15c45-1460-48de-a2d5-65bae5eee118';

UPDATE public.profiles
SET role = 'student'
WHERE id = 'e7e0f727-570c-42ec-91ae-9cc57ec79e55';
