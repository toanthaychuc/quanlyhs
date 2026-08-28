export const GRADE_11_CURRICULUM = [
  {
    chapterId: 'g11-ch-1',
    chapterNumber: 'I',
    chapterName: 'CHƯƠNG I. HÀM SỐ LƯỢNG GIÁC VÀ PHƯƠNG TRÌNH LƯỢNG GIÁC',
    items: [
      { 
        id: 'g11-b1', 
        name: 'Bài 1. Giá trị lượng giác của góc lượng giác', 
        type: 'lesson',
        duration: 15,
        defaultQuestions: [
          {
            id: 'q_g11_1_1',
            content: 'Cho góc $\\alpha$ thoả mãn $\\frac{\\pi}{2} < \\alpha < \\pi$. Khẳng định nào sau đây là đúng?',
            options: [
              { key: 'A', text: '$\\sin \\alpha > 0, \\cos \\alpha < 0$' },
              { key: 'B', text: '$\\sin \\alpha < 0, \\cos \\alpha < 0$' },
              { key: 'C', text: '$\\sin \\alpha > 0, \\cos \\alpha > 0$' },
              { key: 'D', text: '$\\sin \\alpha < 0, \\cos \\alpha > 0$' }
            ],
            correctAnswer: 'A',
            explanation: 'Trong góc phần tư thứ II ($\\frac{\\pi}{2} < \\alpha < \\pi$), điểm biểu diễn có hoành độ âm ($\\cos \\alpha < 0$) và tung độ dương ($\\sin \\alpha > 0$).'
          }
        ]
      },
      { id: 'g11-b2', name: 'Bài 2. Công thức lượng giác', type: 'lesson', duration: 15 },
      { id: 'g11-b3', name: 'Bài 3. Hàm số lượng giác', type: 'lesson', duration: 20 },
      { id: 'g11-b4', name: 'Bài 4. Phương trình lượng giác cơ bản', type: 'lesson', duration: 20 },
      { id: 'g11-c1', name: 'Bài tập cuối chương I', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g11-ch-2',
    chapterNumber: 'II',
    chapterName: 'CHƯƠNG II. DÃY SỐ. CẤP SỐ CỘNG VÀ CẤP SỐ NHÂN',
    items: [
      { id: 'g11-b5', name: 'Bài 5. Dãy số', type: 'lesson', duration: 15 },
      { id: 'g11-b6', name: 'Bài 6. Cấp số cộng', type: 'lesson', duration: 15 },
      { id: 'g11-b7', name: 'Bài 7. Cấp số nhân', type: 'lesson', duration: 15 },
      { id: 'g11-c2', name: 'Bài tập cuối chương II', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g11-ch-3',
    chapterNumber: 'III',
    chapterName: 'CHƯƠNG III. CÁC SỐ ĐẶC TRƯNG ĐO XU THẾ TRUNG TÂM CỦA MẪU SỐ LIỆU GHÉP NHÓM',
    items: [
      { id: 'g11-b8', name: 'Bài 8. Mẫu số liệu ghép nhóm', type: 'lesson', duration: 15 },
      { id: 'g11-b9', name: 'Bài 9. Các số đặc trưng đo xu thế trung tâm', type: 'lesson', duration: 15 },
      { id: 'g11-c3', name: 'Bài tập cuối chương III', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g11-ch-4',
    chapterNumber: 'IV',
    chapterName: 'CHƯƠNG IV. QUAN HỆ SONG SONG TRONG KHÔNG GIAN',
    items: [
      { id: 'g11-b10', name: 'Bài 10. Đường thẳng và mặt phẳng trong không gian', type: 'lesson', duration: 20 },
      { id: 'g11-b11', name: 'Bài 11. Hai đường thẳng song song', type: 'lesson', duration: 15 },
      { id: 'g11-b12', name: 'Bài 12. Đường thẳng và mặt phẳng song song', type: 'lesson', duration: 20 },
      { id: 'g11-b13', name: 'Bài 13. Hai mặt phẳng song song', type: 'lesson', duration: 20 },
      { id: 'g11-b14', name: 'Bài 14. Phép chiếu song song', type: 'lesson', duration: 15 },
      { id: 'g11-c4', name: 'Bài tập cuối chương IV', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g11-ch-5',
    chapterNumber: 'V',
    chapterName: 'CHƯƠNG V. GIỚI HẠN. HÀM SỐ LIÊN TỤC',
    items: [
      { id: 'g11-b15', name: 'Bài 15. Giới hạn của dãy số', type: 'lesson', duration: 15 },
      { id: 'g11-b16', name: 'Bài 16. Giới hạn của hàm số', type: 'lesson', duration: 20 },
      { id: 'g11-b17', name: 'Bài 17. Hàm số liên tục', type: 'lesson', duration: 20 },
      { id: 'g11-c5', name: 'Bài tập cuối chương V', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g11-ch-6',
    chapterNumber: 'VI',
    chapterName: 'CHƯƠNG VI. HÀM SỐ MŨ VÀ HÀM SỐ LÔGARIT',
    items: [
      { id: 'g11-b18', name: 'Bài 18. Luỹ thừa với số mũ thực', type: 'lesson', duration: 15 },
      { id: 'g11-b19', name: 'Bài 19. Lôgarit', type: 'lesson', duration: 20 },
      { id: 'g11-b20', name: 'Bài 20. Hàm số mũ và hàm số lôgarit', type: 'lesson', duration: 20 },
      { id: 'g11-b21', name: 'Bài 21. Phương trình, bất phương trình mũ và lôgarit', type: 'lesson', duration: 20 },
      { id: 'g11-c6', name: 'Bài tập cuối chương VI', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g11-ch-7',
    chapterNumber: 'VII',
    chapterName: 'CHƯƠNG VII. QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN',
    items: [
      { id: 'g11-b22', name: 'Bài 22. Hai đường thẳng vuông góc', type: 'lesson', duration: 15 },
      { id: 'g11-b23', name: 'Bài 23. Đường thẳng vuông góc với mặt phẳng', type: 'lesson', duration: 20 },
      { id: 'g11-b24', name: 'Bài 24. Phép chiếu vuông góc. Góc giữa đường thẳng và mặt phẳng', type: 'lesson', duration: 20 },
      { id: 'g11-b25', name: 'Bài 25. Hai mặt phẳng vuông góc', type: 'lesson', duration: 20 },
      { id: 'g11-b26', name: 'Bài 26. Khoảng cách', type: 'lesson', duration: 25 },
      { id: 'g11-b27', name: 'Bài 27. Thể tích', type: 'lesson', duration: 25 },
      { id: 'g11-c7', name: 'Bài tập cuối chương VII', type: 'chapter_test', duration: 30 }
    ]
  },
  {
    chapterId: 'g11-ch-8',
    chapterNumber: 'VIII',
    chapterName: 'CHƯƠNG VIII. CÁC QUY TẮC TÍNH XÁC SUẤT',
    items: [
      { id: 'g11-b28', name: 'Bài 28. Biến cố hợp, biến cố giao, biến cố độc lập', type: 'lesson', duration: 15 },
      { id: 'g11-b29', name: 'Bài 29. Công thức cộng xác suất', type: 'lesson', duration: 20 },
      { id: 'g11-b30', name: 'Bài 30. Công thức nhân xác suất cho hai biến cố độc lập', type: 'lesson', duration: 20 },
      { id: 'g11-c8', name: 'Bài tập cuối chương VIII', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g11-ch-9',
    chapterNumber: 'IX',
    chapterName: 'CHƯƠNG IX. ĐẠO HÀM',
    items: [
      { id: 'g11-b31', name: 'Bài 31. Định nghĩa và ý nghĩa của đạo hàm', type: 'lesson', duration: 20 },
      { id: 'g11-b32', name: 'Bài 32. Các quy tắc tính đạo hàm', type: 'lesson', duration: 20 },
      { id: 'g11-b33', name: 'Bài 33. Đạo hàm cấp hai', type: 'lesson', duration: 20 },
      { id: 'g11-c9', name: 'Bài tập cuối chương IX', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'g11-ch-term-exams',
    chapterNumber: 'THI',
    chapterName: 'KỲ THI ĐỊNH KỲ & HỌC KỲ (TOÁN 11)',
    isTermExams: true,
    items: [
      { 
        id: 'g11-midterm-1', 
        name: 'Đề kiểm tra Giữa học kì 1', 
        type: 'term_exam', 
        duration: 45,
        defaultQuestions: [
          {
            id: 'q_g11_mid1_1',
            content: 'Nghiệm của phương trình $\\cos x = \\frac{1}{2}$ là:',
            options: [
              { key: 'A', text: '$x = \\pm \\frac{\\pi}{3} + k2\\pi, k \\in \\mathbb{Z}$' },
              { key: 'B', text: '$x = \\pm \\frac{\\pi}{6} + k2\\pi, k \\in \\mathbb{Z}$' },
              { key: 'C', text: '$x = \\frac{\\pi}{3} + k\\pi, k \\in \\mathbb{Z}$' },
              { key: 'D', text: '$x = \\pm \\frac{2\\pi}{3} + k2\\pi, k \\in \\mathbb{Z}$' }
            ],
            correctAnswer: 'A',
            explanation: '$\\cos x = \\frac{1}{2} = \\cos \\frac{\\pi}{3} \\Leftrightarrow x = \\pm \\frac{\\pi}{3} + k2\\pi, k \\in \\mathbb{Z}$.'
          }
        ]
      },
      { id: 'g11-finalterm-1', name: 'Đề kiểm tra Cuối học kì 1', type: 'term_exam', duration: 90 },
      { id: 'g11-midterm-2', name: 'Đề kiểm tra Giữa học kì 2', type: 'term_exam', duration: 45 },
      { id: 'g11-finalterm-2', name: 'Đề kiểm tra Cuối học kì 2', type: 'term_exam', duration: 90 },
      { id: 'g11-year-end', name: 'Bài tập ôn tập cuối năm', type: 'term_exam', duration: 90 }
    ]
  }
];
