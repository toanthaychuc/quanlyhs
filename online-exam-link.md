# Tạo Link Thi Trực Tuyến & Chống Gian Lận (Online Exam Link & Anti-Cheat)

## Goal
Tạo chức năng "Tạo link thi" cho giáo viên bên phải nút "Làm bài", hỗ trợ tùy chọn trộn đề/đáp án, tạo link & mã QR, tiền biên dịch và giải phóng bộ nhớ TikZ, đồng thời kiểm soát chống gian lận chuyển tab nghiêm ngặt (tối đa 1 lần cảnh báo, tái phạm tự động nộp bài) và đảm bảo mỗi học sinh chỉ thi 1 lần.

## Tasks
- [x] Task 1: Tạo tiện ích tạo mã QR client-side độc lập (`frontend/src/utils/qrCodeUtils.js`) không phụ thuộc mạng ngoài.
- [x] Task 2: Mở rộng `examService.js` với các API quản lý phòng thi trực tuyến (`createExamRoom`, `getExamRoom`, `closeExamRoom`, `getExamRoomSubmissions`, `submitRoomSession`) hỗ trợ cả Supabase và localStorage.
- [x] Task 3: Bổ sung tiện ích tiền biên dịch TikZ và dọn dẹp bộ nhớ cho Đề thi trong `frontend/src/utils/tikzCacheUtils.js`.
- [x] Task 4: Xây dựng Modal "Tạo Link Thi Trực Tuyến" (`frontend/src/components/OnlineExamModal.jsx`) với các thiết lập: trộn câu hỏi, trộn đáp án, thời gian, số lần cảnh báo chuyển tab, thanh tiến trình render TikZ, hiển thị link sao chép và mã QR.
- [x] Task 5: Cập nhật giao diện giáo viên trong `frontend/src/pages/Exams.jsx`: thêm nút "Tạo link thi" bên phải nút "Làm bài", hiển thị trạng thái phòng thi đang mở, nút hủy link thi để xóa bộ nhớ cache TikZ.
- [x] Task 6: Tích hợp chế độ làm bài thi qua link (`?room=...`), nhận diện học sinh (họ tên, lớp, mã HS nếu chưa login), kiểm tra 1 lượt thi duy nhất, xáo trộn câu hỏi/đáp án theo cấu hình phòng.
- [x] Task 7: Tích hợp cơ chế chống gian lận nghiêm ngặt: theo dõi `visibilitychange` & `blur`, hiển thị cảnh báo vi phạm, tự động nộp bài và khóa điểm khi tái phạm, truyền `cachedSvgs` vào `MathView` để hình TikZ hiển thị tức thì.
- [x] Task 8: Kiểm thử toàn diện quy trình: tạo link thi -> quét QR/mở link -> kiểm tra hiển thị TikZ tức thì -> thử chuyển tab cảnh báo -> thử tái phạm tự nộp -> hủy link thi và xác nhận giải phóng bộ nhớ cache.

## Done When
- Giáo viên thấy nút "Tạo link thi" ngay bên phải nút "Làm bài".
- Bấm vào mở popup tùy chỉnh: trộn đề, trộn đáp án, thời gian, số lần cảnh báo vi phạm.
- Có link và mã QR trực quan; hình TikZ được tiền xử lý để hiển thị tức thì.
- Học sinh vào thi qua link/QR chỉ được thi 1 lần; nếu chuyển tab sẽ bị cảnh báo, tái phạm sẽ tự động thu bài.
- Khi giáo viên hủy link thi, bộ nhớ cache TikZ của đề thi được xóa sạch để tiết kiệm dung lượng.
