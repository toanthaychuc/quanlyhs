-- Tạo bảng lưu trữ các mục công thức
CREATE TABLE IF NOT EXISTS formulas (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  content      TEXT NOT NULL DEFAULT '',
  order_index  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Bật RLS
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;

-- Cấp quyền (tạm thời mở cho phép đọc ghi - theo cấu trúc RLS cũ của dự án)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all writes formulas' AND tablename = 'formulas') THEN
    CREATE POLICY "Allow all writes formulas" ON formulas FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Cấp quyền
GRANT ALL ON TABLE formulas TO anon, authenticated;
