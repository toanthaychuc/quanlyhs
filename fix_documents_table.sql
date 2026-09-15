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

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Cấp quyền công khai cho phép đọc/ghi tài liệu
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access documents' AND tablename = 'documents') THEN
    CREATE POLICY "Allow all access documents" ON documents FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;
