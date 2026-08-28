# Quy Tắc Bất Biến & Bộ Nhớ Hệ Thống (Project Conventions & Rules)

## 1. 🛡️ QUY TẮC BẢO TOÀN DỮ LIỆU NGƯỜI DÙNG (P0 - MANDATORY)
- **Tuyệt đối không can thiệp, ghi đè hoặc làm mất dữ liệu hiện có trong `localStorage`**:
  - Dữ liệu lớp học & học sinh do giáo viên đã nhập/import: `edumanager_classes_data`.
  - Dữ liệu bài tập, đề bài đã giao, trạng thái nộp bài: `edumanager_class_assignments_v2`.
  - Mật khẩu & thông tin tài khoản giáo viên: `edumanager_teacher_password`, `edumanager_user_email`.
  - Kết quả thi thử và bài làm học sinh: `edumanager_completed_exams`.
- **Mọi chỉnh sửa code UI, tính năng, logic parser hoặc render**:
  - Chỉ bổ sung hoặc tinh chỉnh giao diện, logic xử lý.
  - Phải luôn đọc từ dữ liệu người dùng đang lưu trữ trước, nếu chưa có mới dùng fallback khởi tạo.
  - Tuyệt đối không hardcode chèn lại dữ liệu ảo làm mất dữ liệu thật của giáo viên.

## 2. 🔐 QUY TẮC PHÂN QUYỀN & XÁC THỰC
- Tài khoản Giáo viên độc quyền: **`lecongchuc02@gmail.com`** (Thầy Lê Công Chức).
- Mọi email khác tự động là Học sinh.
- Chế độ "Góc nhìn học sinh" trên Header chỉ dành riêng cho Giáo viên khi chuyển sang tab Học sinh.
- Màn hình slide chào mừng (Landing Modal) có 3 nút lựa chọn, không lộ email riêng và không hiện gợi ý mã học sinh.
