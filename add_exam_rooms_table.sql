-- Tạo bảng lưu trữ các phòng thi trực tuyến (Exam Rooms)
CREATE TABLE IF NOT EXISTS exam_rooms (
  id                TEXT PRIMARY KEY,
  exam_id           TEXT NOT NULL,
  exam_title        TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active',
  duration          INTEGER NOT NULL DEFAULT 45,
  shuffle_questions BOOLEAN NOT NULL DEFAULT true,
  shuffle_answers   BOOLEAN NOT NULL DEFAULT true,
  max_violations    INTEGER NOT NULL DEFAULT 1,
  force_fullscreen  BOOLEAN NOT NULL DEFAULT true,
  cached_svgs       JSONB DEFAULT NULL,
  exam_data         JSONB DEFAULT NULL,
  students_attempted JSONB DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Bật RLS
ALTER TABLE exam_rooms ENABLE ROW LEVEL SECURITY;

-- Cấp quyền đọc ghi cho anon & authenticated
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all writes exam_rooms' AND tablename = 'exam_rooms') THEN
    CREATE POLICY "Allow all writes exam_rooms" ON exam_rooms FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Cấp quyền
GRANT ALL ON TABLE exam_rooms TO anon, authenticated;
