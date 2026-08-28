-- ============================================================
-- TOAN THAY CHUC - SUPABASE SCHEMA (FULL UNIFIED MIGRATION)
-- ============================================================

-- Kích hoạt extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: classes (Lớp học)
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  school            TEXT NOT NULL,
  school_full_name  TEXT,
  grade             TEXT NOT NULL,
  academic_year     TEXT NOT NULL,
  teacher           TEXT NOT NULL DEFAULT 'Thầy Lê Công Chức',
  subject           TEXT NOT NULL DEFAULT 'Toán học',
  color             TEXT NOT NULL DEFAULT '#4f46e5',
  score_columns     JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: students (Học sinh trong lớp)
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id            TEXT PRIMARY KEY,
  class_id      TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT,
  scores        JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);

-- ============================================================
-- TABLE: exams (Đề thi & Kiểm tra)
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  class_id        TEXT REFERENCES classes(id) ON DELETE SET NULL,
  questions       JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration        INTEGER NOT NULL DEFAULT 45,
  grade           TEXT,
  curriculum_id   TEXT,
  chapter_id      TEXT,
  topic_id        TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exams_class_id ON exams(class_id);
CREATE INDEX IF NOT EXISTS idx_exams_grade ON exams(grade);

-- ============================================================
-- TABLE: exam_sessions (Phiên thi & Lịch sử làm bài)
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id         TEXT NOT NULL,
  student_id      TEXT NOT NULL,
  student_name    TEXT,
  class_id        TEXT REFERENCES classes(id) ON DELETE SET NULL,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  submitted_at    TIMESTAMPTZ,
  answers         JSONB NOT NULL DEFAULT '{}'::jsonb,
  flagged         JSONB NOT NULL DEFAULT '[]'::jsonb,
  score           NUMERIC(4,1),
  correct_count   INTEGER,
  total_questions INTEGER,
  time_spent      INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_exam_id ON exam_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON exam_sessions(student_id);

-- ============================================================
-- TABLE: gamification (XP, Streak, Huy hiệu học sinh)
-- ============================================================
CREATE TABLE IF NOT EXISTS gamification (
  student_id      TEXT PRIMARY KEY,
  xp              INTEGER NOT NULL DEFAULT 0,
  streak          INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE,
  last_active_date DATE,
  badges          TEXT[] NOT NULL DEFAULT '{}',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: notices (Bảng tin thông báo của Thầy)
-- ============================================================
CREATE TABLE IF NOT EXISTS notices (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info',
  created_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: assignments (Bài tập giao theo lớp / toàn bộ)
-- ============================================================
CREATE TABLE IF NOT EXISTS assignments (
  id           TEXT PRIMARY KEY,
  class_id     TEXT,
  title        TEXT NOT NULL,
  description  TEXT,
  type         TEXT DEFAULT 'latex',
  due_date     TEXT,
  data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON assignments(class_id);

-- ============================================================
-- TABLE: documents (Tài liệu học tập, PDF, chuyên đề)
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  category     TEXT NOT NULL,
  sub_category TEXT,
  subject      TEXT,
  cover_url    TEXT,
  drive_link   TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- ============================================================
-- TABLE: system_settings (Cài đặt chung: Link MXH, Ngày thi...)
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
  key          TEXT PRIMARY KEY,
  value        JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BẬT ROW LEVEL SECURITY (RLS) & CẤP QUYỀN
-- ============================================================
ALTER TABLE classes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams           ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Classes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all writes classes' AND tablename = 'classes') THEN
    CREATE POLICY "Allow all writes classes" ON classes FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Students
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all writes students' AND tablename = 'students') THEN
    CREATE POLICY "Allow all writes students" ON students FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Exams
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all writes exams' AND tablename = 'exams') THEN
    CREATE POLICY "Allow all writes exams" ON exams FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Exam Sessions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all writes sessions' AND tablename = 'exam_sessions') THEN
    CREATE POLICY "Allow all writes sessions" ON exam_sessions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Gamification
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all writes gamification' AND tablename = 'gamification') THEN
    CREATE POLICY "Allow all writes gamification" ON gamification FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Notices
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all writes notices' AND tablename = 'notices') THEN
    CREATE POLICY "Allow all writes notices" ON notices FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Assignments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all writes assignments' AND tablename = 'assignments') THEN
    CREATE POLICY "Allow all writes assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- Documents
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all writes documents' AND tablename = 'documents') THEN
    CREATE POLICY "Allow all writes documents" ON documents FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- System Settings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all writes system_settings' AND tablename = 'system_settings') THEN
    CREATE POLICY "Allow all writes system_settings" ON system_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- CẤP QUYỀN TOÀN DIỆN CHO VAI TRÒ ANON VÀ AUTHENTICATED
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;
