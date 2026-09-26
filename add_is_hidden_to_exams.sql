-- Thêm cột is_hidden vào bảng exams nếu chưa có
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
