export const GRADE_12_CURRICULUM = [
  {
    chapterId: 'g12-ch-1',
    chapterNumber: 'I',
    chapterName: 'CHƯƠNG I. ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    items: [
      { 
        id: 'g12-b1', 
        name: 'Bài 1. Tính đơn điệu và cực trị của hàm số', 
        type: 'lesson',
        duration: 15,
        defaultQuestions: [
          {
            id: 'q_g12_1_1',
            content: 'Cho hàm số $y = f(x)$ có $f\'(x) = x(x - 1)^2 (x + 2)$. Số điểm cực trị của hàm số là:',
            options: [
              { key: 'A', text: '$2$' },
              { key: 'B', text: '$3$' },
              { key: 'C', text: '$1$' },
              { key: 'D', text: '$4$' }
            ],
            correctAnswer: 'A',
            explanation: '$f\'(x) = 0 \\Leftrightarrow x = 0, x = 1$ (nghiệm bội chẵn) hoặc $x = -2$. Đạo hàm đổi dấu qua 2 nghiệm đơn $x = 0$ và $x = -2$, do đó hàm số có $2$ điểm cực trị.'
          }
        ]
      },
      { id: 'g12-b2', name: 'Bài 2. Giá trị lớn nhất và giá trị nhỏ nhất của hàm số', type: 'lesson', duration: 15 },
      { id: 'g12-b3', name: 'Bài 3. Đường tiệm cận của đồ thị hàm số', type: 'lesson', duration: 15 },
      { id: 'g12-b4', name: 'Bài 4. Khảo sát sự biến thiên và vẽ đồ thị của hàm số', type: 'lesson', duration: 20 },
      { id: 'g12-b5', name: 'Bài 5. Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn', type: 'lesson', duration: 20 },
      { id: 'g12-c1', name: 'Bài tập cuối chương I', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g12-ch-2',
    chapterNumber: 'II',
    chapterName: 'CHƯƠNG II. VECTƠ VÀ HỆ TRỤC TOẠ ĐỘ TRONG KHÔNG GIAN',
    items: [
      { id: 'g12-b6', name: 'Bài 6. Vectơ trong không gian', type: 'lesson', duration: 15 },
      { id: 'g12-b7', name: 'Bài 7. Hệ trục toạ độ trong không gian', type: 'lesson', duration: 15 },
      { id: 'g12-b8', name: 'Bài 8. Biểu thức toạ độ của các phép toán vectơ', type: 'lesson', duration: 20 },
      { id: 'g12-c2', name: 'Bài tập cuối chương II', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g12-ch-3',
    chapterNumber: 'III',
    chapterName: 'CHƯƠNG III. CÁC SỐ ĐẶC TRƯNG ĐO MỨC ĐỘ PHÂN TÁN CỦA MẪU SỐ LIỆU GHÉP NHÓM',
    items: [
      { id: 'g12-b9', name: 'Bài 9. Khoảng biến thiên và khoảng tứ phân vị', type: 'lesson', duration: 15 },
      { id: 'g12-b10', name: 'Bài 10. Phương sai và độ lệch chuẩn', type: 'lesson', duration: 15 },
      { id: 'g12-c3', name: 'Bài tập cuối chương III', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g12-ch-4',
    chapterNumber: 'IV',
    chapterName: 'CHƯƠNG IV. NGUYÊN HÀM VÀ TÍCH PHÂN',
    items: [
      { id: 'g12-b11', name: 'Bài 11. Nguyên hàm', type: 'lesson', duration: 20 },
      { id: 'g12-b12', name: 'Bài 12. Tích phân', type: 'lesson', duration: 20 },
      { id: 'g12-b13', name: 'Bài 13. Ứng dụng hình học của tích phân', type: 'lesson', duration: 20 },
      { id: 'g12-c4', name: 'Bài tập cuối chương IV', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g12-ch-5',
    chapterNumber: 'V',
    chapterName: 'CHƯƠNG V. PHƯƠNG PHÁP TOẠ ĐỘ TRONG KHÔNG GIAN',
    items: [
      { id: 'g12-b14', name: 'Bài 14. Phương trình mặt phẳng', type: 'lesson', duration: 20 },
      { id: 'g12-b15', name: 'Bài 15. Phương trình đường thẳng trong không gian', type: 'lesson', duration: 20 },
      { id: 'g12-b16', name: 'Bài 16. Công thức tính góc trong không gian', type: 'lesson', duration: 20 },
      { id: 'g12-b17', name: 'Bài 17. Phương trình mặt cầu', type: 'lesson', duration: 20 },
      { id: 'g12-c5', name: 'Bài tập cuối chương V', type: 'chapter_test', duration: 30 }
    ]
  },
  {
    chapterId: 'g12-ch-6',
    chapterNumber: 'VI',
    chapterName: 'CHƯƠNG VI. XÁC SUẤT CÓ ĐIỀU KIỆN',
    items: [
      { id: 'g12-b18', name: 'Bài 18. Xác suất có điều kiện', type: 'lesson', duration: 15 },
      { id: 'g12-b19', name: 'Bài 19. Công thức xác suất toàn phần và công thức Bayes', type: 'lesson', duration: 20 },
      { id: 'g12-c6', name: 'Bài tập cuối chương VI', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g12-ch-term-exams',
    chapterNumber: 'THI',
    chapterName: 'KỲ THI ĐỊNH KỲ & HỌC KỲ (TOÁN 12)',
    isTermExams: true,
    items: [
      { 
        id: 'g12-midterm-1', 
        name: 'Đề kiểm tra Giữa học kì 1', 
        type: 'term_exam', 
        duration: 45,
        defaultQuestions: [
          {
            id: 'q_g12_mid1_1',
            content: 'Tìm tiệm cận đứng của đồ thị hàm số $y = \\frac{2x - 1}{x + 3}$:',
            options: [
              { key: 'A', text: '$x = -3$' },
              { key: 'B', text: '$y = 2$' },
              { key: 'C', text: '$x = 2$' },
              { key: 'D', text: '$y = -3$' }
            ],
            correctAnswer: 'A',
            explanation: 'Nghiệm của mẫu số $x + 3 = 0 \\Leftrightarrow x = -3$. Do đó đường tiệm cận đứng là $x = -3$.'
          }
        ]
      },
      { id: 'g12-finalterm-1', name: 'Đề kiểm tra Cuối học kì 1', type: 'term_exam', duration: 90 },
      { id: 'g12-midterm-2', name: 'Đề kiểm tra Giữa học kì 2', type: 'term_exam', duration: 45 },
      { id: 'g12-finalterm-2', name: 'Đề kiểm tra Cuối học kì 2', type: 'term_exam', duration: 90 }
    ]
  }
];
