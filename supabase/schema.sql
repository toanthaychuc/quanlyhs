-- ============================================================
-- SCHEMA: App Quản lý Học Sinh - Toán Thầy Công Chức
-- Chạy file này trong Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: classes (Danh sách lớp học)
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
  id            TEXT PRIMARY KEY,               -- e.g. 'np-10t8'
  name          TEXT NOT NULL,                  -- 'Lớp 10T8'
  school        TEXT NOT NULL DEFAULT 'NP',
  school_full_name TEXT,
  grade         TEXT NOT NULL DEFAULT '10',
  academic_year TEXT NOT NULL DEFAULT '2025 - 2026',
  teacher       TEXT NOT NULL DEFAULT 'Thầy Lê Công Chức',
  subject       TEXT NOT NULL DEFAULT 'Toán học',
  color         TEXT NOT NULL DEFAULT '#4f46e5',
  score_columns JSONB NOT NULL DEFAULT '[
    {"id":"regular1","name":"TX 1","weight":1},
    {"id":"regular2","name":"TX 2","weight":1},
    {"id":"midterm","name":"Giữa Kỳ","weight":2},
    {"id":"final","name":"Cuối Kỳ","weight":3}
  ]'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: students (Danh sách học sinh)
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id            TEXT PRIMARY KEY,               -- e.g. '10T8-01'
  class_id      TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT,
  scores        JSONB NOT NULL DEFAULT '{}'::jsonb,  -- {regular1: 8, midterm: 7.5, ...}
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);

-- ============================================================
-- TABLE: exams (Đề thi)
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  class_id        TEXT REFERENCES classes(id) ON DELETE SET NULL,  -- null = tất cả lớp
  questions       JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration        INTEGER NOT NULL DEFAULT 45,  -- phút
  grade           TEXT,                         -- 'grade-10', 'grade-11', 'grade-12'
  curriculum_id   TEXT,
  chapter_id      TEXT,
  topic_id        TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  created_by      TEXT,                         -- email của giáo viên
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exams_class_id    ON exams(class_id);
CREATE INDEX IF NOT EXISTS idx_exams_grade       ON exams(grade);
CREATE INDEX IF NOT EXISTS idx_exams_is_published ON exams(is_published);

-- ============================================================
-- TABLE: exam_sessions (Phiên thi của học sinh)
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id         UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id      TEXT NOT NULL,               -- student identifier
  student_name    TEXT,
  class_id        TEXT REFERENCES classes(id) ON DELETE SET NULL,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  submitted_at    TIMESTAMPTZ,
  answers         JSONB NOT NULL DEFAULT '{}'::jsonb,   -- {questionId: answer}
  flagged         JSONB NOT NULL DEFAULT '[]'::jsonb,   -- [questionId, ...]
  score           NUMERIC(4,1),                -- 0.0 - 10.0
  correct_count   INTEGER,
  total_questions INTEGER,
  time_spent      INTEGER,                     -- giây
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_exam_id    ON exam_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON exam_sessions(student_id);

-- ============================================================
-- TABLE: gamification (XP, Streak, Badges của học sinh)
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
-- TABLE: notices (Thông báo của giáo viên trên Dashboard)
-- ============================================================
CREATE TABLE IF NOT EXISTS notices (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info',   -- 'info' | 'warning' | 'success'
  created_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCTION: auto update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_gamification_updated_at
  BEFORE UPDATE ON gamification
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Tất cả đều đọc được (học sinh xem đề thi), chỉ giáo viên ghi
-- ============================================================
ALTER TABLE classes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams         ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices       ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc tất cả (anonymous & authenticated)
CREATE POLICY "Public read classes"       ON classes       FOR SELECT USING (true);
CREATE POLICY "Public read students"      ON students      FOR SELECT USING (true);
CREATE POLICY "Public read published exams" ON exams       FOR SELECT USING (is_published = true OR true);
CREATE POLICY "Public read sessions"      ON exam_sessions FOR SELECT USING (true);
CREATE POLICY "Public read gamification"  ON gamification  FOR SELECT USING (true);
CREATE POLICY "Public read notices"       ON notices       FOR SELECT USING (true);

-- Cho phép ghi tất cả (dùng anon key, giáo viên được kiểm tra phía app)
-- NOTE: Trong môi trường production thực sự, nên dùng Supabase Auth thật.
-- Hiện tại dùng "open write" để đơn giản hóa không cần auth service.
CREATE POLICY "Allow all writes classes"       ON classes       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all writes students"      ON students      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all writes exams"         ON exams         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all writes sessions"      ON exam_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all writes gamification"  ON gamification  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all writes notices"       ON notices       FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- REALTIME: Bật realtime cho exam_sessions và gamification
-- (Để thầy thấy kết quả học sinh ngay khi nộp bài)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE exam_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE gamification;
