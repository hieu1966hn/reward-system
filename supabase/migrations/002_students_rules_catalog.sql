-- ============================================================
-- RewardSystem: Round 2 — Students, Point Rules, Reward Catalog
-- ============================================================

-- ─── 1. STUDENTS ─────────────────────────────────────────────
-- 1:1 với profiles (chỉ có nếu role = 'student')
CREATE TABLE IF NOT EXISTS students (
  id                UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  student_code      TEXT UNIQUE,
  class_name        TEXT NOT NULL DEFAULT '',
  total_points      INTEGER NOT NULL DEFAULT 0,
  enrollment_status TEXT NOT NULL DEFAULT 'active'
                      CHECK (enrollment_status IN ('active', 'inactive')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Học viên đọc hồ sơ của chính mình
CREATE POLICY "Students can read own record"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admin/teacher đọc tất cả students
CREATE POLICY "Admins and teachers can read all students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

-- ─── 2. POINT_RULES ──────────────────────────────────────────
-- Seed sẵn 15 rules từ brief. Read-only trong MVP.
CREATE TABLE IF NOT EXISTS point_rules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code         TEXT UNIQUE NOT NULL,
  title             TEXT NOT NULL,
  category          TEXT NOT NULL
                      CHECK (category IN ('attendance', 'checkpoint', 'homework', 'demo', 'extracurricular')),
  condition_summary TEXT NOT NULL,
  points_awarded    INTEGER NOT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE point_rules ENABLE ROW LEVEL SECURITY;

-- Tất cả users có thể đọc rules
CREATE POLICY "All authenticated users can read point rules"
  ON point_rules FOR SELECT
  TO authenticated
  USING (true);

-- ─── 3. REWARD_CATALOG ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS reward_catalog (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_name     TEXT NOT NULL,
  reward_slug     TEXT UNIQUE NOT NULL,
  points_required INTEGER NOT NULL,
  image_url       TEXT,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'basic'
                    CHECK (category IN ('basic', 'standard', 'premium', 'exclusive')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE reward_catalog ENABLE ROW LEVEL SECURITY;

-- Tất cả users có thể xem catalog
CREATE POLICY "All authenticated users can read reward catalog"
  ON reward_catalog FOR SELECT
  TO authenticated
  USING (true);

-- ─── 4. SEED: 15 Point Rules (từ brief) ─────────────────────
INSERT INTO point_rules (rule_code, title, category, condition_summary, points_awarded) VALUES
  ('ATTENDANCE_14',       'Đi học đủ 14 buổi/khóa',              'attendance',      'Học viên điểm danh đủ 14/14 buổi trong khóa học',       10),
  ('ATTENDANCE_13',       'Đi học đủ 13 buổi/khóa',              'attendance',      'Học viên điểm danh đủ 13/14 buổi trong khóa học',        8),
  ('CHECKPOINT_GT_4_5',   'Điểm checkpoint > 4.5',               'checkpoint',      'Điểm bài kiểm tra giữa khóa đạt trên 4.5/5.0',          10),
  ('CHECKPOINT_GT_4_0',   'Điểm checkpoint > 4.0',               'checkpoint',      'Điểm bài kiểm tra giữa khóa đạt trên 4.0/5.0',           5),
  ('HOMEWORK_7',          'Hoàn thành đủ 7 buổi BTVN',           'homework',        'Nộp bài tập về nhà đầy đủ 7/7 buổi có BTVN',            15),
  ('HOMEWORK_6',          'Hoàn thành đủ 6 buổi BTVN',           'homework',        'Nộp bài tập về nhà đầy đủ 6/7 buổi có BTVN',             8),
  ('HOMEWORK_5',          'Hoàn thành đủ 5 buổi BTVN',           'homework',        'Nộp bài tập về nhà đầy đủ 5/7 buổi có BTVN',             5),
  ('DEMO_1ST',            'Giải nhất Demo / Triển lãm',          'demo',            'Đạt giải nhất tại sự kiện Demo hoặc Triển lãm MindX',    30),
  ('DEMO_2ND',            'Giải nhì Demo / Triển lãm',           'demo',            'Đạt giải nhì tại sự kiện Demo hoặc Triển lãm MindX',     20),
  ('DEMO_3RD',            'Giải ba Demo / Triển lãm',            'demo',            'Đạt giải ba tại sự kiện Demo hoặc Triển lãm MindX',      10),
  ('XSKILL_PARTICIPATE',  'Tham gia Xskill',                     'extracurricular', 'Tham gia ít nhất 1 sự kiện Xskill trong kỳ',              5),
  ('XCHALLENGE_1ST',      'Giải nhất Xchallenge',                'extracurricular', 'Đạt giải nhất tại cuộc thi Xchallenge toàn quốc',       100),
  ('XCHALLENGE_2ND',      'Giải nhì Xchallenge',                 'extracurricular', 'Đạt giải nhì tại cuộc thi Xchallenge toàn quốc',         80),
  ('XCHALLENGE_3RD',      'Giải ba Xchallenge',                  'extracurricular', 'Đạt giải ba tại cuộc thi Xchallenge toàn quốc',          70),
  ('XCHALLENGE_ENCOURAGE','Giải khuyến khích Xchallenge',        'extracurricular', 'Đạt giải khuyến khích tại cuộc thi Xchallenge toàn quốc',60)
ON CONFLICT (rule_code) DO NOTHING;

-- ─── 5. SEED: Reward Catalog ─────────────────────────────────
INSERT INTO reward_catalog (reward_name, reward_slug, points_required, category, description) VALUES
  ('Sticker Pack MindX',          'sticker-pack-mindx',       10,  'basic',     'Bộ sticker MindX phong cách AI/Tech, dán laptop hoặc sổ tay'),
  ('Bút bi MindX',                'but-bi-mindx',             20,  'basic',     'Bút bi cao cấp in logo MindX, viết mượt, dùng hàng ngày'),
  ('Móc khóa MindX',              'moc-khoa-mindx',           30,  'basic',     'Móc khóa kim loại khắc logo MindX, bền đẹp'),
  ('Sổ tay MindX',                'so-tay-mindx',             50,  'standard',  'Sổ tay bìa cứng A5, giấy dày, in logo MindX và quote truyền cảm'),
  ('Áo thun MindX',               'ao-thun-mindx',            80,  'standard',  'Áo thun cotton MindX, thiết kế tech modern, nhiều size'),
  ('Balo MindX',                  'balo-mindx',              150,  'premium',   'Balo đi học MindX, chất liệu tốt, ngăn laptop 15", chống nước'),
  ('Khóa học Online Premium',     'khoa-hoc-online-premium', 200,  'premium',   'Truy cập 1 khóa học online MindX tùy chọn trong 3 tháng'),
  ('Voucher MindX 100k',          'voucher-mindx-100k',       60,  'standard',  'Voucher giảm 100,000đ cho khóa học hoặc dịch vụ tại MindX'),
  ('Tai nghe không dây',          'tai-nghe-khong-day',      300,  'exclusive', 'Tai nghe Bluetooth chất lượng cao, đồng hành học tập'),
  ('Bộ Kit Lập trình Robot',      'kit-lap-trinh-robot',     500,  'exclusive', 'Bộ kit Arduino/ESP32 để tự xây dựng robot tại nhà')
ON CONFLICT (reward_slug) DO NOTHING;

-- ─── 6. SEED: 1 student mẫu ─────────────────────────────────
-- Ghi chú: Row này chỉ INSERT được sau khi profile user test đã tồn tại.
-- Chạy sau khi đã tạo user test trong Supabase Auth Dashboard.
-- Cách dùng: Thay <USER_ID> bằng UUID thật của user test trong Supabase Auth.
-- Ví dụ chạy trong SQL Editor sau khi tạo user:
--
-- INSERT INTO students (id, student_code, class_name, total_points, enrollment_status)
-- VALUES (
--   '<USER_ID>',
--   'MX-2026-001',
--   'AI Kids K01',
--   50,
--   'active'
-- ) ON CONFLICT (id) DO NOTHING;
