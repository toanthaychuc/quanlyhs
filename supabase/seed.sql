-- ============================================================
-- SEED DATA: Dữ liệu ban đầu 4 lớp học mặc định
-- Chạy sau schema.sql
-- ============================================================

INSERT INTO classes (id, name, school, school_full_name, grade, academic_year, teacher, subject, color)
VALUES
  ('np-10t8',  'Lớp 10T8',  'NP',   'Trung tâm NP (NP)',                    '10', '2025 - 2026', 'Thầy Lê Công Chức', 'Toán học', '#4f46e5'),
  ('np-12t6',  'Lớp 12T6',  'NP',   'Trung tâm NP (NP)',                    '12', '2025 - 2026', 'Thầy Lê Công Chức', 'Toán học', '#0ea5e9'),
  ('thth-10.8','Lớp 10.8',  'THTH', 'Trường Trung học Thực hành (THTH)',    '10', '2025 - 2026', 'Thầy Lê Công Chức', 'Toán học', '#10b981'),
  ('thth-11.1','Lớp 11.1',  'THTH', 'Trường Trung học Thực hành (THTH)',    '11', '2025 - 2026', 'Thầy Lê Công Chức', 'Toán học', '#f59e0b')
ON CONFLICT (id) DO NOTHING;
