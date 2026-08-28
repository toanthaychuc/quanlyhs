export const GRADE_10_CURRICULUM = [
  {
    chapterId: 'ch-1',
    chapterNumber: 'I',
    chapterName: 'CHƯƠNG I. MỆNH ĐỀ VÀ TẬP HỢP',
    items: [
      { 
        id: 'g10-b1', 
        name: 'Bài 1. Mệnh đề', 
        type: 'lesson',
        duration: 15,
        defaultQuestions: [
          {
            id: 'q_g10_1_1',
            content: 'Trong các câu sau, câu nào là một mệnh đề toán học?',
            options: [
              { key: 'A', text: '$x + 2 > 5$' },
              { key: 'B', text: '$2 + 3 = 7$' },
              { key: 'C', text: 'Hôm nay trời đẹp quá!' },
              { key: 'D', text: 'Bạn có thích học Toán không?' }
            ],
            correctAnswer: 'B',
            explanation: 'Mệnh đề toán học là một khẳng định có tính đúng hoặc sai rõ ràng. Câu $2 + 3 = 7$ là một mệnh đề sai.'
          },
          {
            id: 'q_g10_1_2',
            content: 'Mệnh đề phủ định của mệnh đề $P: \"\\forall x \\in \\mathbb{R}, x^2 + 1 > 0\"$ là:',
            options: [
              { key: 'A', text: '$\\overline{P}: \"\\exists x \\in \\mathbb{R}, x^2 + 1 \\le 0\"$' },
              { key: 'B', text: '$\\overline{P}: \"\\forall x \\in \\mathbb{R}, x^2 + 1 \\le 0\"$' },
              { key: 'C', text: '$\\overline{P}: \"\\exists x \\in \\mathbb{R}, x^2 + 1 < 0\"$' },
              { key: 'D', text: '$\\overline{P}: \"\\forall x \\in \\mathbb{R}, x^2 + 1 < 0\"$' }
            ],
            correctAnswer: 'A',
            explanation: 'Phủ định của $\\forall$ là $\\exists$, phủ định của $>$ là $\\le$. Do đó $\\overline{P}: \"\\exists x \\in \\mathbb{R}, x^2 + 1 \\le 0\"$.'
          }
        ]
      },
      { 
        id: 'g10-b2', 
        name: 'Bài 2. Tập hợp và các phép toán trên tập hợp', 
        type: 'lesson',
        duration: 15,
        defaultQuestions: [
          {
            id: 'q_g10_2_1',
            content: 'Cho hai tập hợp $A = [-2; 3)$ và $B = [1; 5]$. Giao của hai tập hợp $A \\cap B$ là:',
            options: [
              { key: 'A', text: '$[-2; 5]$' },
              { key: 'B', text: '$[1; 3)$' },
              { key: 'C', text: '$[-2; 1)$' },
              { key: 'D', text: '$(3; 5]$' }
            ],
            correctAnswer: 'B',
            explanation: '$A \\cap B = [-2; 3) \\cap [1; 5] = [1; 3)$.'
          }
        ]
      },
      { id: 'g10-c1', name: 'Bài tập cuối chương I', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'ch-2',
    chapterNumber: 'II',
    chapterName: 'CHƯƠNG II. BẤT PHƯƠNG TRÌNH VÀ HỆ BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    items: [
      { id: 'g10-b3', name: 'Bài 3. Bất phương trình bậc nhất hai ẩn', type: 'lesson', duration: 15 },
      { id: 'g10-b4', name: 'Bài 4. Hệ bất phương trình bậc nhất hai ẩn', type: 'lesson', duration: 15 },
      { id: 'g10-c2', name: 'Bài tập cuối chương II', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'ch-3',
    chapterNumber: 'III',
    chapterName: 'CHƯƠNG III. HỆ THỨC LƯỢNG TRONG TAM GIÁC',
    items: [
      { id: 'g10-b5', name: 'Bài 5. Giá trị lượng giác của một góc từ 0° đến 180°', type: 'lesson', duration: 15 },
      { id: 'g10-b6', name: 'Bài 6. Hệ thức lượng trong tam giác', type: 'lesson', duration: 20 },
      { id: 'g10-c3', name: 'Bài tập cuối chương III', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'ch-4',
    chapterNumber: 'IV',
    chapterName: 'CHƯƠNG IV. VECTƠ',
    items: [
      { id: 'g10-b7', name: 'Bài 7. Các khái niệm mở đầu', type: 'lesson', duration: 15 },
      { id: 'g10-b8', name: 'Bài 8. Tổng và hiệu của hai vectơ', type: 'lesson', duration: 15 },
      { id: 'g10-b9', name: 'Bài 9. Tích của một vectơ với một số', type: 'lesson', duration: 15 },
      { id: 'g10-b10', name: 'Bài 10. Vectơ trong mặt phẳng toạ độ', type: 'lesson', duration: 20 },
      { id: 'g10-b11', name: 'Bài 11. Tích vô hướng của hai vectơ', type: 'lesson', duration: 20 },
      { id: 'g10-c4', name: 'Bài tập cuối chương IV', type: 'chapter_test', duration: 30 }
    ]
  },
  {
    chapterId: 'ch-5',
    chapterNumber: 'V',
    chapterName: 'CHƯƠNG V. CÁC SỐ ĐẶC TRƯNG CỦA MẪU SỐ LIỆU KHÔNG GHÉP NHÓM',
    items: [
      { id: 'g10-b12', name: 'Bài 12. Số gần đúng và sai số', type: 'lesson', duration: 15 },
      { id: 'g10-b13', name: 'Bài 13. Các số đặc trưng đo xu thế trung tâm', type: 'lesson', duration: 15 },
      { id: 'g10-b14', name: 'Bài 14. Các số đặc trưng đo độ phân tán', type: 'lesson', duration: 15 },
      { id: 'g10-c5', name: 'Bài tập cuối chương V', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'ch-6',
    chapterNumber: 'VI',
    chapterName: 'CHƯƠNG VI. HÀM SỐ, ĐỒ THỊ VÀ ỨNG DỤNG',
    items: [
      { id: 'g10-b15', name: 'Bài 15. Hàm số', type: 'lesson', duration: 15 },
      { id: 'g10-b16', name: 'Bài 16. Hàm số bậc hai', type: 'lesson', duration: 20 },
      { id: 'g10-b17', name: 'Bài 17. Dấu của tam thức bậc hai', type: 'lesson', duration: 20 },
      { id: 'g10-b18', name: 'Bài 18. Phương trình quy về phương trình bậc hai', type: 'lesson', duration: 20 },
      { id: 'g10-c6', name: 'Bài tập cuối chương VI', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'ch-7',
    chapterNumber: 'VII',
    chapterName: 'CHƯƠNG VII. PHƯƠNG PHÁP TOẠ ĐỘ TRONG MẶT PHẲNG',
    items: [
      { id: 'g10-b19', name: 'Bài 19. Phương trình đường thẳng', type: 'lesson', duration: 20 },
      { id: 'g10-b20', name: 'Bài 20. Đường thẳng trong mặt phẳng toạ độ', type: 'lesson', duration: 20 },
      { id: 'g10-b21', name: 'Bài 21. Đường tròn trong mặt phẳng toạ độ', type: 'lesson', duration: 20 },
      { id: 'g10-b22', name: 'Bài 22. Ba đường conic', type: 'lesson', duration: 20 },
      { id: 'g10-c7', name: 'Bài tập cuối chương VII', type: 'chapter_test', duration: 30 }
    ]
  },
  {
    chapterId: 'ch-8',
    chapterNumber: 'VIII',
    chapterName: 'CHƯƠNG VIII. ĐẠI SỐ TỔ HỢP',
    items: [
      { id: 'g10-b23', name: 'Bài 23. Quy tắc đếm', type: 'lesson', duration: 15 },
      { id: 'g10-b24', name: 'Bài 24. Hoán vị, chỉnh hợp và tổ hợp', type: 'lesson', duration: 20 },
      { id: 'g10-b25', name: 'Bài 25. Nhị thức Newton', type: 'lesson', duration: 20 },
      { id: 'g10-c8', name: 'Bài tập cuối chương VIII', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'ch-9',
    chapterNumber: 'IX',
    chapterName: 'CHƯƠNG IX. TÍNH XÁC SUẤT THEO ĐỊNH NGHĨA CỔ ĐIỂN',
    items: [
      { id: 'g10-b26', name: 'Bài 26. Biến cố và định nghĩa cổ điển của xác suất', type: 'lesson', duration: 20 },
      { id: 'g10-b27', name: 'Bài 27. Thực hành tính xác suất theo định nghĩa cổ điển', type: 'lesson', duration: 20 },
      { id: 'g10-c9', name: 'Bài tập cuối chương IX', type: 'chapter_test', duration: 25 }
    ]
  },
  {
    chapterId: 'ch-term-exams',
    chapterNumber: 'THI',
    chapterName: 'KỲ THI ĐỊNH KỲ & HỌC KỲ (TOÁN 10)',
    isTermExams: true,
    items: [
      { 
        id: 'g10-midterm-1', 
        name: 'Đề kiểm tra Giữa học kì 1', 
        type: 'term_exam', 
        duration: 45,
        defaultQuestions: [
          {
            id: 'q_mid1_1',
            content: 'Cho tam giác $ABC$ có $AB = 4, AC = 6, \\widehat{A} = 60^\\circ$. Độ dài cạnh $BC$ bằng:',
            options: [
              { key: 'A', text: '$2\\sqrt{7}$' },
              { key: 'B', text: '$28$' },
              { key: 'C', text: '$2\\sqrt{19}$' },
              { key: 'D', text: '$76$' }
            ],
            correctAnswer: 'A',
            explanation: 'Theo định lí cosin: $BC^2 = AB^2 + AC^2 - 2AB \\cdot AC \\cos A = 16 + 36 - 2(4)(6)\\cos 60^\\circ = 52 - 24 = 28 \\Rightarrow BC = \\sqrt{28} = 2\\sqrt{7}$.'
          }
        ]
      },
      { id: 'g10-finalterm-1', name: 'Đề kiểm tra Cuối học kì 1', type: 'term_exam', duration: 90 },
      { id: 'g10-midterm-2', name: 'Đề kiểm tra Giữa học kì 2', type: 'term_exam', duration: 45 },
      { id: 'g10-finalterm-2', name: 'Đề kiểm tra Cuối học kì 2', type: 'term_exam', duration: 90 },
      { id: 'g10-year-end', name: 'Bài tập ôn tập cuối năm', type: 'term_exam', duration: 90 }
    ]
  }
];
