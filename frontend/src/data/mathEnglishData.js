/**
 * Dữ liệu chuẩn Thuật ngữ Toán tiếng Anh & Câu lệnh giao tiếp lớp học song ngữ
 * Nguồn tham khảo chính:
 * 1. "Một số từ vựng Toán tiếng Anh thông dụng trong các kỳ thi Toán Quốc tế" - Võ Quốc Bá Cẩn
 * 2. "The Concise Oxford Dictionary of Mathematics" - Oxford University Press
 * 3. "Building Academic Vocabulary: Mathematics" - Washington Educational Service Districts
 * 4. Chuẩn thuật ngữ Toán Cambridge IGCSE, AS/A Level, AP Calculus & SAT Math
 */

export const MATH_CATEGORIES = [
  {
    "id": "all",
    "name": "Tất cả thuật ngữ",
    "enName": "All Categories",
    "icon": "Layers",
    "color": "#4f46e5",
    "desc": "Toàn bộ từ vựng Toán tiếng Anh từ A đến Z"
  },
  {
    "id": "geometry",
    "name": "Hình học & Lượng giác",
    "enName": "Geometry & Trigonometry",
    "icon": "Triangle",
    "color": "#0ea5e9",
    "desc": "Đường tròn, tam giác, đa giác, hình khối không gian, véc-tơ, lượng giác"
  },
  {
    "id": "algebra",
    "name": "Đại số & Hàm số",
    "enName": "Algebra & Functions",
    "icon": "Variable",
    "color": "#8b5cf6",
    "desc": "Phương trình, hệ phương trình, bất đẳng thức, đa thức, hàm số, ma trận"
  },
  {
    "id": "calculus",
    "name": "Giải tích",
    "enName": "Calculus & Analysis",
    "icon": "TrendingUp",
    "color": "#10b981",
    "desc": "Đạo hàm, tích phân, nguyên hàm, giới hạn, tiệm cận, điểm uốn"
  },
  {
    "id": "statistics",
    "name": "Xác suất & Thống kê",
    "enName": "Statistics & Probability",
    "icon": "BarChart3",
    "color": "#f59e0b",
    "desc": "Biến cố, xác suất, phân phối chuẩn, số trung bình, phương sai, chỉnh hợp, tổ hợp"
  },
  {
    "id": "arithmetic",
    "name": "Số học & Lý thuyết số",
    "enName": "Number Theory & Arithmetic",
    "icon": "Binary",
    "color": "#ec4899",
    "desc": "Số nguyên tố, ước số, bội số, đồng dư modulo, chữ số tận cùng, tính chẵn lẻ"
  }
];

export const CLASSROOM_PHRASE_CATEGORIES = [
  {
    "id": "group",
    "name": "Làm việc nhóm & Thảo luận",
    "enName": "Pair & Group Work",
    "icon": "Users",
    "color": "#3b82f6",
    "desc": "Các câu chia cặp, chia tổ, phân công nhiệm vụ và trao đổi cách giải"
  },
  {
    "id": "time",
    "name": "Thời gian & Giờ làm bài",
    "enName": "Time Management & Deadlines",
    "icon": "Clock",
    "color": "#ef4444",
    "desc": "Các khẩu lệnh bắt đầu, đếm ngược thời gian, cảnh báo và hết giờ"
  },
  {
    "id": "board",
    "name": "Lên bảng & Trình bày lời giải",
    "enName": "Board Work & Presentation",
    "icon": "PenTool",
    "color": "#10b981",
    "desc": "Mời học sinh lên bảng, vẽ hình, trình bày các bước tính và giải thích lập luận"
  },
  {
    "id": "instructions",
    "name": "Hiệu lệnh giải toán & Yêu cầu đề thi",
    "enName": "Math Tasks & Exam Prompts",
    "icon": "BookOpen",
    "color": "#8b5cf6",
    "desc": "Rút gọn, giải phương trình, phân tích nhân tử, vẽ đồ thị, làm tròn kết quả"
  },
  {
    "id": "feedback",
    "name": "Đánh giá, Phản hồi & Lưu ý",
    "enName": "Feedback & Common Pitfalls",
    "icon": "Sparkles",
    "color": "#f59e0b",
    "desc": "Khen ngợi, nhắc nhở lỗi dấu trừ, kiểm tra phép tính, bổ sung hằng số và đơn vị"
  },
  {
    "id": "student",
    "name": "Học sinh hỏi bài & Giao tiếp",
    "enName": "Student Classroom Inquiries",
    "icon": "MessageCircle",
    "color": "#06b6d4",
    "desc": "Các mẫu câu học sinh dùng để xin phép, hỏi lại bước giải, trao đổi với thầy cô"
  }
];

export const CLASSROOM_PHRASES = [
  {
    "id": "cp_1",
    "en": "Work in pairs and solve problem number 4 on page 52.",
    "vi": "Các em hãy làm việc theo nhóm đôi và giải bài toán số 4 ở trang 52.",
    "category": "group",
    "role": "Teacher",
    "context": "Khi giáo viên giao bài tập cho hai bạn cùng bàn trao đổi",
    "tip": "\"Work in pairs\" là cách diễn đạt chuẩn mực nhất trong lớp học tiếng Anh, tự nhiên hơn \"work in two people\"."
  },
  {
    "id": "cp_2",
    "en": "Turn to your partner and compare your answers.",
    "vi": "Hãy quay sang bạn cùng bàn và đối chiếu kết quả của các em.",
    "category": "group",
    "role": "Teacher",
    "context": "Sau khi học sinh làm xong bài cá nhân, để kiểm tra chéo lẫn nhau",
    "tip": "Dùng \"partner\" để chỉ bạn ngồi cạnh hoặc bạn cùng cặp."
  },
  {
    "id": "cp_3",
    "en": "Form groups of three or four, please.",
    "vi": "Các em hãy chia thành các nhóm 3 hoặc 4 người.",
    "category": "group",
    "role": "Teacher",
    "context": "Khi tổ chức bài toán thảo luận dự án hoặc bài tập nâng cao",
    "tip": "\"Form groups of [number]\" là cấu trúc chính xác được dùng trong trường học quốc tế."
  },
  {
    "id": "cp_4",
    "en": "Discuss your reasoning with your group members.",
    "vi": "Hãy thảo luận cách lập luận của em với các thành viên trong nhóm.",
    "category": "group",
    "role": "Teacher",
    "context": "Khuyến khích học sinh giải thích phương pháp giải cho bạn",
    "tip": "Trong toán học, \"reasoning\" nghĩa là các bước suy luận logic."
  },
  {
    "id": "cp_5",
    "en": "Choose one spokesperson to present your group's solution.",
    "vi": "Hãy chọn một đại diện để thuyết trình lời giải của nhóm em.",
    "category": "group",
    "role": "Teacher",
    "context": "Khi kết thúc làm việc nhóm và chuẩn bị trình bày trước lớp",
    "tip": "\"Spokesperson\" hoặc \"presenter\" là người đại diện nhóm phát biểu."
  },
  {
    "id": "cp_6",
    "en": "Make sure everyone in your group understands every single step.",
    "vi": "Hãy đảm bảo mọi thành viên trong nhóm đều hiểu tường tận từng bước giải.",
    "category": "group",
    "role": "Teacher",
    "context": "Tránh tình trạng chỉ một bạn làm còn các bạn khác chép theo"
  },
  {
    "id": "cp_7",
    "en": "Time's up! Pens down, please.",
    "vi": "Hết giờ làm bài! Tất cả dừng bút, đặt bút xuống.",
    "category": "time",
    "role": "Teacher",
    "context": "Khi chuông báo hết giờ làm bài thi hoặc kiểm tra trên lớp",
    "tip": "\"Pens down\" (hoặc \"Pencils down\") là hiệu lệnh chuẩn mực trong các kỳ thi SAT, Cambridge, IB."
  },
  {
    "id": "cp_8",
    "en": "You have 5 minutes remaining to complete your calculations.",
    "vi": "Các em còn đúng 5 phút để hoàn thành các phép tính của mình.",
    "category": "time",
    "role": "Teacher",
    "context": "Nhắc nhở học sinh đẩy nhanh tiến độ làm bài",
    "tip": "\"remaining\" mang sắc thái trang trọng và chuẩn xác hơn \"left\"."
  },
  {
    "id": "cp_9",
    "en": "Two minutes left! Start wrapping up and reviewing your answers.",
    "vi": "Còn 2 phút nữa! Hãy bắt đầu chốt lại và rà soát bài làm.",
    "category": "time",
    "role": "Teacher",
    "context": "Cảnh báo chặng cuối trước khi thu bài",
    "tip": "\"Wrap up\" nghĩa là kết thúc, hoàn tất những việc cuối cùng."
  },
  {
    "id": "cp_10",
    "en": "Pass your exam papers forward to the front of the classroom.",
    "vi": "Các em hãy chuyền bài thi lên bàn đầu lớp.",
    "category": "time",
    "role": "Teacher",
    "context": "Thao tác thu bài theo từng dãy bàn",
    "tip": "\"Pass ... forward\" là chuyền lên phía trước; \"pass ... back\" là chuyền về sau."
  },
  {
    "id": "cp_11",
    "en": "Stop writing immediately when the bell rings.",
    "vi": "Dừng bút ngay lập tức khi nghe tiếng chuông báo.",
    "category": "time",
    "role": "Teacher",
    "context": "Quy chế phòng thi kiểm tra định kỳ"
  },
  {
    "id": "cp_12",
    "en": "You may begin now. Good luck!",
    "vi": "Các em có thể bắt đầu làm bài. Chúc các em làm bài tốt!",
    "category": "time",
    "role": "Teacher",
    "context": "Phát lệnh mở đề thi"
  },
  {
    "id": "cp_13",
    "en": "Please come to the board and write down your solution.",
    "vi": "Xin mời em lên bảng và viết lời giải của mình.",
    "category": "board",
    "role": "Teacher",
    "context": "Gọi học sinh lên giải bài toán trước cả lớp",
    "tip": "Dùng \"come to the board\" hoặc \"go to the board\"."
  },
  {
    "id": "cp_14",
    "en": "Show all your working steps clearly; do not skip intermediate calculations.",
    "vi": "Hãy trình bày rõ ràng từng bước giải; không được nhảy cóc phép tính trung gian.",
    "category": "board",
    "role": "Teacher",
    "context": "Rèn luyện thói quen trình bày tự luận chặt chẽ cho học sinh",
    "tip": "Trong toán tiếng Anh, \"working\" hoặc \"working out\" nghĩa là các bước nháp/tính toán chi tiết."
  },
  {
    "id": "cp_15",
    "en": "Explain your reasoning step by step to the whole class.",
    "vi": "Hãy giải thích quá trình suy luận của em từng bước một cho cả lớp nghe.",
    "category": "board",
    "role": "Teacher",
    "context": "Khi học sinh đứng cạnh bảng để thuyết minh lời giải"
  },
  {
    "id": "cp_16",
    "en": "Can you justify why this step follows from the previous equation?",
    "vi": "Em có thể giải thích lý do vì sao bước này lại suy ra được từ phương trình trước không?",
    "category": "board",
    "role": "Teacher",
    "context": "Kiểm tra độ hiểu bản chất toán học của học sinh",
    "tip": "\"Justify\" là từ học thuật cao cấp yêu cầu đưa ra lập luận hoặc định lý chứng minh."
  },
  {
    "id": "cp_17",
    "en": "Draw the geometric diagram clearly and label all vertices.",
    "vi": "Hãy vẽ hình học minh họa thật rõ và đánh dấu tên tất cả các đỉnh.",
    "category": "board",
    "role": "Teacher",
    "context": "Khi giải bài toán hình học trên bảng",
    "tip": "\"Label vertices\" nghĩa là ghi chữ A, B, C, D... vào các đỉnh."
  },
  {
    "id": "cp_18",
    "en": "Could you please erase the board before we start the next section?",
    "vi": "Em có thể giúp thầy/cô lau bảng trước khi sang phần tiếp theo được không?",
    "category": "board",
    "role": "Teacher",
    "context": "Nhờ học sinh lau bảng sạch sẽ"
  },
  {
    "id": "cp_19",
    "en": "Simplify the following algebraic expression as much as possible.",
    "vi": "Hãy rút gọn biểu thức đại số sau đến mức tối giản nhất.",
    "category": "instructions",
    "role": "Teacher",
    "context": "Đề bài rút gọn phân thức hoặc biểu thức chứa căn",
    "tip": "\"Simplify\" là từ chuẩn xác duy nhất cho lệnh \"rút gọn\" trong chương trình quốc tế."
  },
  {
    "id": "cp_20",
    "en": "Solve for x in the given quadratic equation.",
    "vi": "Hãy giải phương trình bậc hai đã cho để tìm nghiệm x.",
    "category": "instructions",
    "role": "Teacher",
    "context": "Câu lệnh giải phương trình",
    "tip": "Cấu trúc \"Solve for [variable]\" là chuẩn ngữ pháp trong toán học."
  },
  {
    "id": "cp_21",
    "en": "Factorize the polynomial completely into linear factors.",
    "vi": "Hãy phân tích đa thức sau thành tích của các nhân tử bậc nhất.",
    "category": "instructions",
    "role": "Teacher",
    "context": "Phân tích đa thức thành nhân tử",
    "tip": "Tiếng Anh Anh dùng \"factorise\", tiếng Anh Mỹ dùng \"factor\" hoặc \"factorize\"."
  },
  {
    "id": "cp_22",
    "en": "Expand the brackets and collect like terms.",
    "vi": "Khai triển các dấu ngoặc và thu gọn các số hạng đồng dạng.",
    "category": "instructions",
    "role": "Teacher",
    "context": "Thao tác nhân đa thức cơ bản",
    "tip": "\"Like terms\" là các số hạng có cùng biến và cùng số mũ (đồng dạng)."
  },
  {
    "id": "cp_23",
    "en": "Sketch the graph of the function, showing all intercepts and turning points.",
    "vi": "Vẽ phác đồ thị hàm số, chỉ rõ các giao điểm với trục tọa độ và điểm cực trị.",
    "category": "instructions",
    "role": "Teacher",
    "context": "Khảo sát và vẽ đồ thị hàm số",
    "tip": "\"Sketch\" nghĩa là vẽ phác đúng dáng điệu đồ thị (khác với \"plot\" là chấm điểm chính xác)."
  },
  {
    "id": "cp_24",
    "en": "Round your final answer to two decimal places / three significant figures.",
    "vi": "Làm tròn kết quả cuối cùng đến 2 chữ số thập phân / 3 chữ số có nghĩa.",
    "category": "instructions",
    "role": "Teacher",
    "context": "Yêu cầu quy chuẩn làm tròn số trong đề thi",
    "tip": "\"Significant figures\" (thường viết tắt là sig fig hoặc s.f.) rất phổ biến trong đề thi Cambridge/IB."
  },
  {
    "id": "cp_25",
    "en": "State your final answer in simplest radical form (surd form).",
    "vi": "Hãy để kết quả cuối cùng dưới dạng căn thức tối giản.",
    "category": "instructions",
    "role": "Teacher",
    "context": "Yêu cầu không bấm máy tính ra số thập phân lẻ",
    "tip": "\"Surd\" là thuật ngữ chuẩn tiếng Anh Anh chỉ số vô tỉ có chứa căn (như căn 2, căn 3)."
  },
  {
    "id": "cp_26",
    "en": "Substitute the given values into the formula to find the unknown.",
    "vi": "Thay các giá trị đã cho vào công thức để tìm đại lượng chưa biết.",
    "category": "instructions",
    "role": "Teacher",
    "context": "Bài toán áp dụng công thức vật lý hoặc hình học"
  },
  {
    "id": "cp_27",
    "en": "Construct the perpendicular bisector of segment AB using a compass and a straightedge.",
    "vi": "Dựng đường trung trực của đoạn thẳng AB bằng compa và thước thẳng.",
    "category": "instructions",
    "role": "Teacher",
    "context": "Bài toán dựng hình chuẩn mực"
  },
  {
    "id": "cp_28",
    "en": "Find the derivative of f(x) with respect to x.",
    "vi": "Tính đạo hàm của hàm số f(x) theo biến x.",
    "category": "instructions",
    "role": "Teacher",
    "context": "Đề bài tính đạo hàm trong giải tích"
  },
  {
    "id": "cp_29",
    "en": "Spot on! That's an extremely elegant and concise solution.",
    "vi": "Chính xác tuyệt đối! Đó là một cách giải rất đẹp và ngắn gọn.",
    "category": "feedback",
    "role": "Teacher",
    "context": "Lời khen khi học sinh tìm ra cách giải thông minh, độc đáo",
    "tip": "\"Spot on\" là thành ngữ khen ngợi \"chuẩn không cần chỉnh\"."
  },
  {
    "id": "cp_30",
    "en": "You're definitely on the right track, keep expanding that idea.",
    "vi": "Em đang đi hoàn toàn đúng hướng rồi đấy, hãy phát triển tiếp ý tưởng đó nhé.",
    "category": "feedback",
    "role": "Teacher",
    "context": "Khích lệ khi học sinh đi đúng hướng nhưng chưa ra kết quả cuối"
  },
  {
    "id": "cp_31",
    "en": "Watch out for the minus sign in front of the parenthesis!",
    "vi": "Hãy cẩn thận với dấu trừ ở ngay phía trước dấu ngoặc nhé!",
    "category": "feedback",
    "role": "Teacher",
    "context": "Nhắc lỗi đổi dấu phổ biến nhất của học sinh",
    "tip": "Lỗi \"sign error\" (sai dấu) là lỗi mất điểm thường gặp nhất trong toán."
  },
  {
    "id": "cp_32",
    "en": "Double-check your arithmetic calculations on line 3.",
    "vi": "Hãy kiểm tra lại phép tính số học ở dòng thứ 3.",
    "category": "feedback",
    "role": "Teacher",
    "context": "Nhắc học sinh rà soát lỗi tính nhẩm"
  },
  {
    "id": "cp_33",
    "en": "Don't forget to add the constant of integration (+ C) for indefinite integrals!",
    "vi": "Đừng bao giờ quên cộng thêm hằng số tích phân (+ C) đối với nguyên hàm!",
    "category": "feedback",
    "role": "Teacher",
    "context": "Nhắc lỗi quên + C muôn thuở khi học tích phân giải tích 12"
  },
  {
    "id": "cp_34",
    "en": "Remember to specify the correct units of measurement in your final answer.",
    "vi": "Nhớ ghi đúng đơn vị đo lường vào câu trả lời cuối cùng nhé.",
    "category": "feedback",
    "role": "Teacher",
    "context": "Ví dụ đơn vị cm², m³, m/s"
  },
  {
    "id": "cp_35",
    "en": "Does anyone have a question or need further clarification?",
    "vi": "Có ai còn câu hỏi nào hoặc cần thầy/cô giải thích rõ hơn chỗ nào không?",
    "category": "feedback",
    "role": "Teacher",
    "context": "Hỏi thăm học sinh sau khi giảng xong bài mới"
  },
  {
    "id": "cp_36",
    "en": "Raise your hand if your final result matches this number.",
    "vi": "Hãy giơ tay nếu kết quả cuối cùng của em khớp với con số này.",
    "category": "feedback",
    "role": "Teacher",
    "context": "Khảo sát nhanh mức độ làm đúng của cả lớp"
  },
  {
    "id": "cp_37",
    "en": "Teacher, could you please explain that step one more time?",
    "vi": "Thưa thầy/cô, thầy/cô có thể giảng lại bước đó một lần nữa được không ạ?",
    "category": "student",
    "role": "Student",
    "context": "Khi học sinh chưa hiểu một bước biến đổi trên bảng",
    "tip": "Mẫu câu lịch sự và chuẩn mực nhất để nhờ giáo viên giảng lại."
  },
  {
    "id": "cp_38",
    "en": "May I come to the board to present an alternative method?",
    "vi": "Em có thể lên bảng để trình bày một cách giải khác được không ạ?",
    "category": "student",
    "role": "Student",
    "context": "Khi học sinh tìm ra cách giải nhanh hoặc khác với bài mẫu"
  },
  {
    "id": "cp_39",
    "en": "I got a different answer; could you please check where my mistake is?",
    "vi": "Em tính ra đáp án khác, thầy/cô có thể xem giúp em bị nhầm ở bước nào không ạ?",
    "category": "student",
    "role": "Student",
    "context": "Nhờ giáo viên chỉ ra lỗi sai trong bài làm"
  },
  {
    "id": "cp_40",
    "en": "Which formula should we apply to this type of question?",
    "vi": "Chúng em nên áp dụng công thức nào cho dạng bài này ạ?",
    "category": "student",
    "role": "Student",
    "context": "Khi gặp dạng bài mới chưa biết xuất phát từ định lý nào"
  },
  {
    "id": "cp_41",
    "en": "Can we leave our answer as an exact fraction, or should we convert it into a decimal?",
    "vi": "Chúng em có thể giữ nguyên đáp số dạng phân số hay phải đổi sang số thập phân ạ?",
    "category": "student",
    "role": "Student",
    "context": "Hỏi rõ quy cách trình bày bài làm bài thi"
  },
  {
    "id": "cp_42",
    "en": "Is it allowed to use a graphing calculator for this section of the test?",
    "vi": "Phần thi này có được phép dùng máy tính vẽ đồ thị (Casio/Graphic) không ạ?",
    "category": "student",
    "role": "Student",
    "context": "Hỏi về quy định sử dụng máy tính bỏ túi"
  }
];

export const MATH_VOCABULARY = [
  {
    "id": "term_1",
    "en": "Absolute value",
    "vi": "Giá trị tuyệt đối",
    "category": "general",
    "letter": "A",
    "ipa": "/ˈæbsəluːt ˈvæljuː/",
    "example": "The absolute value of -5 is 5, written as |-5| = 5."
  },
  {
    "id": "term_2",
    "en": "Acute",
    "vi": "Nhọn",
    "category": "general",
    "letter": "A",
    "subterms": [
      {
        "en": "Acute angle",
        "vi": "Góc nhọn"
      },
      {
        "en": "Acute triangle",
        "vi": "Tam giác nhọn"
      }
    ]
  },
  {
    "id": "term_3",
    "en": "Add (addition)",
    "vi": "Cộng (phép cộng)",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_4",
    "en": "Addend",
    "vi": "Một số hạng (trong tổng)",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_6",
    "en": "Addition rule",
    "vi": "Quy tắc cộng",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_5",
    "en": "Additive",
    "vi": "Cộng tính",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_7",
    "en": "Adjacent",
    "vi": "Liền kề",
    "category": "general",
    "letter": "A",
    "subterms": [
      {
        "en": "Adjacent digits",
        "vi": "Các chữ số kề nhau"
      },
      {
        "en": "Adjacent cells",
        "vi": "Các ô kề nhau"
      }
    ]
  },
  {
    "id": "term_8",
    "en": "Alternative angles",
    "vi": "Góc so le",
    "category": "geometry",
    "letter": "A"
  },
  {
    "id": "term_9",
    "en": "Altitude",
    "vi": "Đường cao",
    "category": "geometry",
    "letter": "A",
    "ipa": "/ˈæltɪtjuːd/",
    "example": "The altitude of a triangle is the perpendicular segment from a vertex to the opposite line."
  },
  {
    "id": "term_10",
    "en": "Angle",
    "vi": "Góc",
    "category": "geometry",
    "letter": "A",
    "subterms": [
      {
        "en": "Angle bisector",
        "vi": "Phân giác của góc"
      },
      {
        "en": "Angle trisectors",
        "vi": "Các tia chia một góc thành ba góc bằng nhau"
      }
    ]
  },
  {
    "id": "term_11",
    "en": "Annulus",
    "vi": "Hình vành khăn",
    "category": "geometry",
    "letter": "A"
  },
  {
    "id": "term_361",
    "en": "Antiderivative",
    "vi": "Nguyên hàm",
    "category": "calculus",
    "ipa": "/ˌænti-dɪˈrɪvətɪv/",
    "example": "F(x) is an antiderivative of f(x) if F'(x) = f(x).",
    "subterms": [],
    "letter": "A"
  },
  {
    "id": "term_12",
    "en": "Arbitrary",
    "vi": "Bất kỳ, tùy ý",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_13",
    "en": "Arc",
    "vi": "Cung",
    "category": "geometry",
    "letter": "A"
  },
  {
    "id": "term_14",
    "en": "Area",
    "vi": "Diện tích",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_15",
    "en": "Argument",
    "vi": "Lập luận, lý lẽ",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_16",
    "en": "Arrange",
    "vi": "Sắp xếp",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_17",
    "en": "Array",
    "vi": "Mảng hình chữ nhật",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_18",
    "en": "Ascending order",
    "vi": "Thứ tự tăng dần",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_19",
    "en": "Assign",
    "vi": "Gán",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_20",
    "en": "Associative",
    "vi": "Tính chất kết hợp",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_21",
    "en": "Assume",
    "vi": "Giả sử",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_22",
    "en": "Assumption",
    "vi": "Giả thiết",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_363",
    "en": "Asymptote",
    "vi": "Đường tiệm cận",
    "category": "calculus",
    "ipa": "/ˈæsɪmptəʊt/",
    "example": "The curve approaches its horizontal asymptote as x tends to infinity.",
    "subterms": [
      {
        "en": "Horizontal asymptote",
        "vi": "Tiệm cận ngang"
      },
      {
        "en": "Vertical asymptote",
        "vi": "Tiệm cận đứng"
      },
      {
        "en": "Slant / Oblique asymptote",
        "vi": "Tiệm cận xiên"
      }
    ],
    "letter": "A"
  },
  {
    "id": "term_23",
    "en": "At most",
    "vi": "Nhiều nhất là",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_24",
    "en": "Attack",
    "vi": "Tấn công",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_25",
    "en": "Attain",
    "vi": "Đạt được",
    "category": "general",
    "letter": "A"
  },
  {
    "id": "term_26",
    "en": "Average",
    "vi": "Trung bình cộng",
    "category": "statistics",
    "letter": "A"
  },
  {
    "id": "term_27",
    "en": "Axis",
    "vi": "Trục",
    "category": "geometry",
    "letter": "A",
    "subterms": [
      {
        "en": "Horizontal axis",
        "vi": "Trục hoành"
      },
      {
        "en": "Vertical axis",
        "vi": "Trục tung"
      }
    ]
  },
  {
    "id": "term_28",
    "en": "Base",
    "vi": "Đáy (tam giác, hình thang)",
    "category": "geometry",
    "letter": "B"
  },
  {
    "id": "term_29",
    "en": "Binomial",
    "vi": "Nhị thức",
    "category": "algebra",
    "letter": "B",
    "ipa": "/baɪˈnəʊmiəl/",
    "example": "A binomial is a polynomial containing exactly two terms, such as (x + y)."
  },
  {
    "id": "term_30",
    "en": "Bisect",
    "vi": "Chia đôi (thành hai phần bằng nhau)",
    "category": "geometry",
    "letter": "B"
  },
  {
    "id": "term_31",
    "en": "Bisector",
    "vi": "Đường phân giác",
    "category": "geometry",
    "letter": "B"
  },
  {
    "id": "term_32",
    "en": "Bold",
    "vi": "Đậm",
    "category": "general",
    "letter": "B"
  },
  {
    "id": "term_33",
    "en": "Cartesian system",
    "vi": "Hệ trục tọa độ Descartes",
    "category": "geometry",
    "letter": "C",
    "ipa": "/kɑːˈtiːziən ˈsɪstəm/",
    "example": "The Cartesian coordinate system uses perpendicular x and y axes."
  },
  {
    "id": "term_34",
    "en": "Center",
    "vi": "Tâm (đường tròn)",
    "category": "geometry",
    "letter": "C"
  },
  {
    "id": "term_37",
    "en": "Centimetre",
    "vi": "Xăng ti mét",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_35",
    "en": "Central",
    "vi": "Ở giữa, trung tâm",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_36",
    "en": "Centroid",
    "vi": "Trọng tâm (của tam giác)",
    "category": "geometry",
    "letter": "C"
  },
  {
    "id": "term_38",
    "en": "Change",
    "vi": "Sự thay đổi, sự biến đổi",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_39",
    "en": "Chessboard",
    "vi": "Bàn cờ",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_40",
    "en": "Choice",
    "vi": "Sự lựa chọn",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_41",
    "en": "Chord",
    "vi": "Dây cung",
    "category": "geometry",
    "letter": "C"
  },
  {
    "id": "term_42",
    "en": "Circle",
    "vi": "Đường tròn",
    "category": "geometry",
    "letter": "C"
  },
  {
    "id": "term_43",
    "en": "Circular",
    "vi": "Dạng hình tròn",
    "category": "general",
    "letter": "C",
    "subterms": [
      {
        "en": "Circular track",
        "vi": "Đường (chạy) tròn"
      }
    ]
  },
  {
    "id": "term_44",
    "en": "Circumcircle",
    "vi": "Đường tròn ngoại tiếp",
    "category": "geometry",
    "letter": "C",
    "ipa": "/ˈsɜːkəmˌsɜːkl/",
    "example": "The circumcircle passes through all three vertices of the triangle."
  },
  {
    "id": "term_45",
    "en": "Circumference",
    "vi": "Chu vi đường tròn",
    "category": "geometry",
    "letter": "C"
  },
  {
    "id": "term_46",
    "en": "Coefficient",
    "vi": "Hệ số",
    "category": "algebra",
    "letter": "C",
    "ipa": "/ˌkəʊɪˈfɪʃnt/",
    "example": "In the quadratic 3x^2, the coefficient of x^2 is 3."
  },
  {
    "id": "term_47",
    "en": "Combination",
    "vi": "Tổ hợp",
    "category": "statistics",
    "letter": "C"
  },
  {
    "id": "term_48",
    "en": "Common Chung,",
    "vi": "thông thường",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_49",
    "en": "Common difference",
    "vi": "Công sai",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_50",
    "en": "Complement",
    "vi": "Phần bù",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_370",
    "en": "Complex numbers",
    "vi": "Số phức",
    "category": "algebra",
    "ipa": "/ˈkɒmpleks ˈnʌmbəz/",
    "example": "A complex number z = a + bi consists of a real part a and an imaginary part b.",
    "subterms": [
      {
        "en": "Real part",
        "vi": "Phần thực"
      },
      {
        "en": "Imaginary part",
        "vi": "Phần ảo"
      },
      {
        "en": "Modulus",
        "vi": "Mô-đun số phức"
      },
      {
        "en": "Complex conjugate",
        "vi": "Số phức liên hợp"
      }
    ],
    "letter": "C"
  },
  {
    "id": "term_51",
    "en": "Composite numbers",
    "vi": "Hợp số",
    "category": "arithmetic",
    "letter": "C"
  },
  {
    "id": "term_52",
    "en": "Comprise",
    "vi": "Gồm có, bao gồm",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_53",
    "en": "Compute",
    "vi": "Tính toán, ước tính",
    "category": "arithmetic",
    "letter": "C"
  },
  {
    "id": "term_54",
    "en": "Concave polygon",
    "vi": "Đa giác lõm",
    "category": "geometry",
    "letter": "C"
  },
  {
    "id": "term_55",
    "en": "Concentric circles",
    "vi": "Các đường tròn đồng tâm",
    "category": "geometry",
    "letter": "C"
  },
  {
    "id": "term_56",
    "en": "Concurent lines",
    "vi": "Các đường thằng đồng quy",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_57",
    "en": "Configuration",
    "vi": "Cách bố trí, cấu hình",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_58",
    "en": "Congruence",
    "vi": "Đồng dư",
    "category": "arithmetic",
    "letter": "C"
  },
  {
    "id": "term_59",
    "en": "Congruent",
    "vi": "Đồng dư (số học), bằng nhau (hình học)",
    "category": "arithmetic",
    "letter": "C",
    "subterms": [
      {
        "en": "Congruent figures",
        "vi": "Các hình bằng nhau"
      },
      {
        "en": "Congruent polygons",
        "vi": "Các đa giác bằng nhau"
      },
      {
        "en": "Congruent octagons",
        "vi": "Các hình bát giác bằng nhau"
      }
    ],
    "ipa": "/ˈkɒŋɡruənt/",
    "example": "Two figures are congruent if they have the exact same shape and size."
  },
  {
    "id": "term_60",
    "en": "Consecutive",
    "vi": "Liên tiếp",
    "category": "general",
    "letter": "C",
    "subterms": [
      {
        "en": "Consecutive odd integers",
        "vi": "Các số nguyên lẻ liên tiếp"
      },
      {
        "en": "Consecutive even integers",
        "vi": "Các số nguyên chẵn liên tiếp"
      }
    ]
  },
  {
    "id": "term_61",
    "en": "Consequence",
    "vi": "Hệ quả",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_62",
    "en": "Consequently Do",
    "vi": "đó, vì vậy",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_63",
    "en": "Consider Xem",
    "vi": "xét",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_64",
    "en": "Consist of",
    "vi": "Gồm có",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_65",
    "en": "Constant",
    "vi": "Hằng số, không đổi",
    "category": "general",
    "letter": "C",
    "subterms": [
      {
        "en": "Constant speed",
        "vi": "Vận tốc không đổi"
      }
    ]
  },
  {
    "id": "term_66",
    "en": "Construction",
    "vi": "Sự xây dựng, sự dựng hình",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_67",
    "en": "Continued fraction",
    "vi": "Liên phân số",
    "category": "arithmetic",
    "letter": "C"
  },
  {
    "id": "term_68",
    "en": "Contradiction",
    "vi": "Sự mâu thuẫn",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_70",
    "en": "Conversely",
    "vi": "Ngược lại",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_69",
    "en": "Convex polygon",
    "vi": "Đa giác lồi",
    "category": "geometry",
    "letter": "C"
  },
  {
    "id": "term_71",
    "en": "Coordinates",
    "vi": "Tọa độ",
    "category": "geometry",
    "letter": "C",
    "ipa": "/kəʊˈɔːdɪnəts/",
    "example": "Point P has Cartesian coordinates (3, 4)."
  },
  {
    "id": "term_72",
    "en": "Coprime",
    "vi": "Nguyên tố cùng nhau",
    "category": "arithmetic",
    "letter": "C",
    "ipa": "/kəʊˈpraɪm/",
    "example": "Numbers 8 and 9 are coprime because their greatest common divisor is 1."
  },
  {
    "id": "term_73",
    "en": "Correspondence",
    "vi": "Phép tương ứng",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_75",
    "en": "Corresponding angles",
    "vi": "Các góc tương ứng",
    "category": "geometry",
    "letter": "C"
  },
  {
    "id": "term_74",
    "en": "Corresponding sides",
    "vi": "Các cạnh tương ứng",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_76",
    "en": "Counting numbers",
    "vi": "Số đếm 1, 2, 3, …",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_373",
    "en": "Cross product",
    "vi": "Tích có hướng của hai véc-tơ",
    "category": "geometry",
    "ipa": "/krɒs ˈprɒdʌkt/",
    "example": "The cross product produces a vector perpendicular to both operand vectors.",
    "subterms": [],
    "letter": "C"
  },
  {
    "id": "term_77",
    "en": "Cross-section",
    "vi": "Mặt cắt",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_78",
    "en": "Cube",
    "vi": "Hình lập phương",
    "category": "geometry",
    "letter": "C"
  },
  {
    "id": "term_79",
    "en": "Cuboid",
    "vi": "Hình khối",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_80",
    "en": "Curved surface area",
    "vi": "Diện tích mặt cong",
    "category": "general",
    "letter": "C"
  },
  {
    "id": "term_81",
    "en": "Cyclic polygon",
    "vi": "Đa giác nội tiếp đường tròn",
    "category": "geometry",
    "letter": "C"
  },
  {
    "id": "term_82",
    "en": "Cylinder",
    "vi": "Hình trụ tròn",
    "category": "geometry",
    "letter": "C"
  },
  {
    "id": "term_83",
    "en": "Decimal",
    "vi": "Số thập phân",
    "category": "arithmetic",
    "letter": "D"
  },
  {
    "id": "term_84",
    "en": "Decompose",
    "vi": "Phân tích ra thừa số",
    "category": "arithmetic",
    "letter": "D"
  },
  {
    "id": "term_85",
    "en": "Decrease",
    "vi": "Giảm",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_86",
    "en": "Decreasing order",
    "vi": "Thứ tự giảm dần",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_87",
    "en": "Deduce",
    "vi": "Suy ra, luận ra",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_88",
    "en": "Deduct",
    "vi": "Trừ đi, khấu trừ",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_89",
    "en": "Define",
    "vi": "Định nghĩa",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_90",
    "en": "Degree",
    "vi": "Độ (số đo của góc)",
    "category": "geometry",
    "letter": "D"
  },
  {
    "id": "term_91",
    "en": "Denominator",
    "vi": "Mẫu số",
    "category": "statistics",
    "letter": "D",
    "ipa": "/dɪˈnɒmɪneɪtə/",
    "example": "In the fraction 3/4, 4 is the denominator."
  },
  {
    "id": "term_92",
    "en": "Depend",
    "vi": "Phụ thuộc",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_360",
    "en": "Derivative",
    "vi": "Đạo hàm",
    "category": "calculus",
    "ipa": "/dɪˈrɪvətɪv/",
    "example": "The derivative f'(x) represents the instantaneous rate of change of f at x.",
    "subterms": [
      {
        "en": "First derivative",
        "vi": "Đạo hàm bậc nhất"
      },
      {
        "en": "Second derivative",
        "vi": "Đạo hàm bậc hai"
      },
      {
        "en": "Partial derivative",
        "vi": "Đạo hàm riêng"
      }
    ],
    "letter": "D"
  },
  {
    "id": "term_93",
    "en": "Descending order",
    "vi": "Thứ tự giảm dần",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_94",
    "en": "Diagonal",
    "vi": "Đường chéo",
    "category": "general",
    "letter": "D",
    "ipa": "/daɪˈæɡənl/",
    "example": "A square has two equal diagonals intersecting at right angles."
  },
  {
    "id": "term_95",
    "en": "Diameter",
    "vi": "Đường kình",
    "category": "geometry",
    "letter": "D",
    "ipa": "/daɪˈæmɪtə/",
    "example": "The diameter of a circle is twice its radius."
  },
  {
    "id": "term_96",
    "en": "Difference",
    "vi": "Hiệu",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_97",
    "en": "Digit",
    "vi": "Chữ số",
    "category": "arithmetic",
    "letter": "D"
  },
  {
    "id": "term_98",
    "en": "Dimenssion",
    "vi": "Kích thước",
    "category": "arithmetic",
    "letter": "D"
  },
  {
    "id": "term_100",
    "en": "Direct proportion",
    "vi": "Tỉ lệ thuận",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_99",
    "en": "Direction",
    "vi": "Hướng",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_101",
    "en": "Distance",
    "vi": "Khoảng cách",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_102",
    "en": "Distinct",
    "vi": "Khác nhau, phân biệt",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_103",
    "en": "Distribute",
    "vi": "Phân chia, xếp (đồ vào túi, vào hộp…)",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_105",
    "en": "Divide (division)",
    "vi": "Chia (phép chia)",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_104",
    "en": "Dividend",
    "vi": "Số bị chia",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_106",
    "en": "Divisible",
    "vi": "Chia hết",
    "category": "arithmetic",
    "letter": "D"
  },
  {
    "id": "term_107",
    "en": "Divisor",
    "vi": "Ước số",
    "category": "arithmetic",
    "letter": "D"
  },
  {
    "id": "term_365",
    "en": "Domain and Range",
    "vi": "Tập xác định và Tập giá trị",
    "category": "algebra",
    "ipa": "/dəʊˈmeɪn ænd reɪndʒ/",
    "example": "The domain is the set of valid inputs; the range is the set of possible outputs.",
    "subterms": [],
    "letter": "D"
  },
  {
    "id": "term_372",
    "en": "Dot product",
    "vi": "Tích vô hướng của hai véc-tơ",
    "category": "geometry",
    "ipa": "/dɒt ˈprɒdʌkt/",
    "example": "The dot product of two perpendicular vectors is equal to zero (u . v = 0).",
    "subterms": [],
    "letter": "D"
  },
  {
    "id": "term_108",
    "en": "Double",
    "vi": "Gấp đôi",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_109",
    "en": "Dozen",
    "vi": "Một tá (12 chiếc/cái)",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_110",
    "en": "Draw",
    "vi": "Vẽ, hòa (một trận đấu)",
    "category": "general",
    "letter": "D"
  },
  {
    "id": "term_111",
    "en": "Edge",
    "vi": "Cạnh (của đa giác)",
    "category": "geometry",
    "letter": "E"
  },
  {
    "id": "term_112",
    "en": "Element",
    "vi": "Phần tử (của tập hợp)",
    "category": "general",
    "letter": "E"
  },
  {
    "id": "term_113",
    "en": "Elevation",
    "vi": "Sự ngước lên, độ cao",
    "category": "arithmetic",
    "letter": "E"
  },
  {
    "id": "term_114",
    "en": "Empty set",
    "vi": "Tập rỗng",
    "category": "general",
    "letter": "E"
  },
  {
    "id": "term_115",
    "en": "Endpoint",
    "vi": "Điểm mút",
    "category": "general",
    "letter": "E"
  },
  {
    "id": "term_116",
    "en": "Enlargement factor",
    "vi": "Tỉ số đồng dạng",
    "category": "general",
    "letter": "E"
  },
  {
    "id": "term_117",
    "en": "Ensure",
    "vi": "Đảm bảo, chắc chắn rằng",
    "category": "general",
    "letter": "E"
  },
  {
    "id": "term_118",
    "en": "Equal",
    "vi": "Bằng nhau",
    "category": "general",
    "letter": "E",
    "subterms": [
      {
        "en": "Equal sized figures",
        "vi": "Các hình bằng nhau"
      }
    ]
  },
  {
    "id": "term_119",
    "en": "Equation",
    "vi": "Phương trình",
    "category": "algebra",
    "letter": "E"
  },
  {
    "id": "term_120",
    "en": "Equilateral triangle",
    "vi": "Tam giác đều",
    "category": "geometry",
    "letter": "E",
    "ipa": "/ˌiːkwɪˈlætərəl ˈtraɪæŋɡl/",
    "example": "All three interior angles of an equilateral triangle equal 60 degrees."
  },
  {
    "id": "term_121",
    "en": "Evaluate",
    "vi": "Tính",
    "category": "general",
    "letter": "E"
  },
  {
    "id": "term_122",
    "en": "Even",
    "vi": "Chẵn",
    "category": "general",
    "letter": "E",
    "subterms": [
      {
        "en": "Even integers",
        "vi": "Các số nguyên chẵn"
      }
    ]
  },
  {
    "id": "term_123",
    "en": "Exactly",
    "vi": "Chính xác, đúng đắn",
    "category": "general",
    "letter": "E"
  },
  {
    "id": "term_124",
    "en": "Expression",
    "vi": "Biểu thức",
    "category": "algebra",
    "letter": "E"
  },
  {
    "id": "term_127",
    "en": "Exterior angle",
    "vi": "Góc ngoài (của tam giác)",
    "category": "geometry",
    "letter": "E"
  },
  {
    "id": "term_125",
    "en": "External",
    "vi": "Bên ngoài",
    "category": "general",
    "letter": "E"
  },
  {
    "id": "term_126",
    "en": "Externally tangent",
    "vi": "Tiếp xúc ngoài",
    "category": "geometry",
    "letter": "E"
  },
  {
    "id": "term_128",
    "en": "Factor",
    "vi": "Ước số",
    "category": "arithmetic",
    "letter": "F"
  },
  {
    "id": "term_129",
    "en": "Factorial Giai",
    "vi": "thừa",
    "category": "general",
    "letter": "F"
  },
  {
    "id": "term_130",
    "en": "Figure",
    "vi": "Hình vẽ",
    "category": "general",
    "letter": "F"
  },
  {
    "id": "term_131",
    "en": "Fill",
    "vi": "Điền vào",
    "category": "general",
    "letter": "F"
  },
  {
    "id": "term_132",
    "en": "Flag",
    "vi": "Lá cờ",
    "category": "general",
    "letter": "F"
  },
  {
    "id": "term_133",
    "en": "Fold",
    "vi": "Gấp (giấy)",
    "category": "general",
    "letter": "F"
  },
  {
    "id": "term_134",
    "en": "Formula",
    "vi": "Công thức",
    "category": "general",
    "letter": "F"
  },
  {
    "id": "term_135",
    "en": "Fraction",
    "vi": "Phân số",
    "category": "arithmetic",
    "letter": "F",
    "subterms": [
      {
        "en": "Fraction written in its lowest form",
        "vi": "Phân số tối giản"
      }
    ]
  },
  {
    "id": "term_136",
    "en": "Frame",
    "vi": "Khung",
    "category": "general",
    "letter": "F"
  },
  {
    "id": "term_137",
    "en": "Frequency",
    "vi": "Tần số",
    "category": "statistics",
    "letter": "F"
  },
  {
    "id": "term_138",
    "en": "Frustrum",
    "vi": "Hình nón cụt",
    "category": "general",
    "letter": "F"
  },
  {
    "id": "term_139",
    "en": "Function",
    "vi": "Hàm số",
    "category": "algebra",
    "letter": "F"
  },
  {
    "id": "term_140",
    "en": "Generate",
    "vi": "Tạo ra",
    "category": "general",
    "letter": "G"
  },
  {
    "id": "term_141",
    "en": "Gradient",
    "vi": "Hệ số góc",
    "category": "geometry",
    "letter": "G"
  },
  {
    "id": "term_142",
    "en": "Greatest",
    "vi": "Lớn nhất",
    "category": "general",
    "letter": "G",
    "subterms": [
      {
        "en": "Greatest common divisor (gcd)",
        "vi": "Ước chung lớn nhất"
      }
    ]
  },
  {
    "id": "term_143",
    "en": "Height",
    "vi": "Chiều cao",
    "category": "general",
    "letter": "H"
  },
  {
    "id": "term_144",
    "en": "Hemisphere",
    "vi": "Bán cầu",
    "category": "geometry",
    "letter": "H"
  },
  {
    "id": "term_145",
    "en": "Hence",
    "vi": "Suy ra",
    "category": "general",
    "letter": "H"
  },
  {
    "id": "term_146",
    "en": "Heptagon",
    "vi": "Hình thất giác",
    "category": "general",
    "letter": "H"
  },
  {
    "id": "term_147",
    "en": "Hexagon",
    "vi": "Hình lục giác",
    "category": "general",
    "letter": "H"
  },
  {
    "id": "term_148",
    "en": "Hold",
    "vi": "Đúng, có hiệu lực",
    "category": "general",
    "letter": "H"
  },
  {
    "id": "term_149",
    "en": "Horizontal",
    "vi": "Phương ngang",
    "category": "general",
    "letter": "H"
  },
  {
    "id": "term_150",
    "en": "Hypotenuse",
    "vi": "Cạnh huyền",
    "category": "geometry",
    "letter": "H",
    "ipa": "/haɪˈpɒtənjuːz/",
    "example": "The hypotenuse is the longest side of a right-angled triangle, opposite the right angle."
  },
  {
    "id": "term_151",
    "en": "Identical",
    "vi": "Giống nhau, bằng nhau",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_152",
    "en": "Identity",
    "vi": "Đẳng thức",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_153",
    "en": "Imply Cho",
    "vi": "thấy, dẫn đến",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_165",
    "en": "In terms of",
    "vi": "Theo, qua",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_168",
    "en": "In the form",
    "vi": "Dưới dạng",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_156",
    "en": "Incircle",
    "vi": "Đường tròn nội tiếp",
    "category": "geometry",
    "letter": "I",
    "ipa": "/ˈɪnˌsɜːkl/",
    "example": "The incircle is tangent to all three sides of a triangle."
  },
  {
    "id": "term_157",
    "en": "Increase",
    "vi": "Tăng",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_158",
    "en": "Increasing order",
    "vi": "Thứ tự tăng dần",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_159",
    "en": "Indefinitely",
    "vi": "Vô hạn",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_154",
    "en": "Induction",
    "vi": "Phép quy nạp",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_155",
    "en": "Inductive",
    "vi": "Quy nạp",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_160",
    "en": "Inequality",
    "vi": "Bất đẳng thức, bất phương trình",
    "category": "algebra",
    "letter": "I",
    "ipa": "/ˌɪnɪˈkwɒləti/",
    "example": "The triangle inequality states that the sum of any two sides exceeds the third side."
  },
  {
    "id": "term_161",
    "en": "Infinite sequence",
    "vi": "Dãy vô hạn",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_364",
    "en": "Inflection point",
    "vi": "Điểm uốn của đồ thị",
    "category": "calculus",
    "ipa": "/ɪnˈflekʃn pɔɪnt/",
    "example": "An inflection point is a point where the concavity of a curve changes.",
    "subterms": [],
    "letter": "I"
  },
  {
    "id": "term_162",
    "en": "Integer",
    "vi": "Số nguyên",
    "category": "arithmetic",
    "letter": "I",
    "subterms": [
      {
        "en": "The set of integers",
        "vi": "Tập các số nguyên"
      }
    ]
  },
  {
    "id": "term_163",
    "en": "Integral",
    "vi": "Nguyên",
    "category": "calculus",
    "letter": "I",
    "subterms": [
      {
        "en": "Integral solution",
        "vi": "Nghiệm nguyên"
      }
    ]
  },
  {
    "id": "term_164",
    "en": "Interior",
    "vi": "Phần trong, phía trong",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_166",
    "en": "Internal",
    "vi": "Bên trong",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_167",
    "en": "Intersection",
    "vi": "Giao điểm (của đường thẳng, đường tròn), giao (của các tập hợp)",
    "category": "geometry",
    "letter": "I"
  },
  {
    "id": "term_169",
    "en": "Inverse proportion",
    "vi": "Tỉ lệ nghịch",
    "category": "general",
    "letter": "I"
  },
  {
    "id": "term_170",
    "en": "Irradius",
    "vi": "Bán kính đường tròn nội tiếp",
    "category": "geometry",
    "letter": "I"
  },
  {
    "id": "term_171",
    "en": "Irreducible fraction",
    "vi": "Phân số tối giản",
    "category": "arithmetic",
    "letter": "I"
  },
  {
    "id": "term_172",
    "en": "Isosceles triangle",
    "vi": "Tam giác cân",
    "category": "geometry",
    "letter": "I",
    "ipa": "/aɪˈsɒsəliːz ˈtraɪæŋɡl/",
    "example": "An isosceles triangle has at least two equal sides and two equal base angles."
  },
  {
    "id": "term_173",
    "en": "Key",
    "vi": "Chìa khóa",
    "category": "general",
    "letter": "K"
  },
  {
    "id": "term_174",
    "en": "Knight Con",
    "vi": "mã",
    "category": "general",
    "letter": "K"
  },
  {
    "id": "term_175",
    "en": "Lap",
    "vi": "Một vòng khén kín",
    "category": "general",
    "letter": "L"
  },
  {
    "id": "term_176",
    "en": "Largest",
    "vi": "Lớn nhất",
    "category": "general",
    "letter": "L"
  },
  {
    "id": "term_177",
    "en": "Last digit",
    "vi": "Chữ số tận cùng",
    "category": "arithmetic",
    "letter": "L"
  },
  {
    "id": "term_178",
    "en": "Least",
    "vi": "Nhỏ nhất",
    "category": "general",
    "letter": "L",
    "subterms": [
      {
        "en": "Least common multiple (lcm)",
        "vi": "Bội chung nhỏ nhất"
      }
    ]
  },
  {
    "id": "term_179",
    "en": "Left hand side",
    "vi": "Vế trái",
    "category": "general",
    "letter": "L"
  },
  {
    "id": "term_180",
    "en": "Left-most digit",
    "vi": "Chữ số đầu tiên (tính từ bên trái sang)",
    "category": "arithmetic",
    "letter": "L"
  },
  {
    "id": "term_181",
    "en": "Liar",
    "vi": "Người nói dối",
    "category": "general",
    "letter": "L"
  },
  {
    "id": "term_182",
    "en": "Lie",
    "vi": "Nằm trên",
    "category": "general",
    "letter": "L"
  },
  {
    "id": "term_362",
    "en": "Limit",
    "vi": "Giới hạn",
    "category": "calculus",
    "ipa": "/ˈlɪmɪt/",
    "example": "The limit of (sin x)/x as x approaches 0 is 1.",
    "subterms": [
      {
        "en": "One-sided limit",
        "vi": "Giới hạn một bên"
      },
      {
        "en": "Limit at infinity",
        "vi": "Giới hạn tại vô cực"
      }
    ],
    "letter": "L"
  },
  {
    "id": "term_183",
    "en": "Line",
    "vi": "Đường thẳng",
    "category": "general",
    "letter": "L",
    "subterms": [
      {
        "en": "Line a is tangent to circle (C)",
        "vi": "Đường thẳng a tiếp xúc đường tròn (C)"
      },
      {
        "en": "Line a touches circle (C) at K",
        "vi": "Đường thẳng a tiếp xúc với đường tròn (C) tại K"
      }
    ]
  },
  {
    "id": "term_184",
    "en": "Linear model",
    "vi": "Mô hình tuyến tính",
    "category": "statistics",
    "letter": "L"
  },
  {
    "id": "term_185",
    "en": "Locus",
    "vi": "Quỹ tích",
    "category": "general",
    "letter": "L"
  },
  {
    "id": "term_186",
    "en": "Magic square Ma",
    "vi": "phương",
    "category": "general",
    "letter": "M"
  },
  {
    "id": "term_187",
    "en": "Major arc",
    "vi": "Cung lớn",
    "category": "geometry",
    "letter": "M"
  },
  {
    "id": "term_188",
    "en": "Mark",
    "vi": "Đánh dấu",
    "category": "general",
    "letter": "M"
  },
  {
    "id": "term_371",
    "en": "Matrix",
    "vi": "Ma trận",
    "category": "algebra",
    "ipa": "/ˈmeɪtrɪks/",
    "example": "A matrix is a rectangular array of numbers arranged in rows and columns.",
    "subterms": [
      {
        "en": "Identity matrix",
        "vi": "Ma trận đơn vị"
      },
      {
        "en": "Determinant",
        "vi": "Định thức của ma trận"
      },
      {
        "en": "Inverse matrix",
        "vi": "Ma trận nghịch đảo"
      }
    ],
    "letter": "M"
  },
  {
    "id": "term_189",
    "en": "Maximum",
    "vi": "Giá trị lớn nhất",
    "category": "general",
    "letter": "M"
  },
  {
    "id": "term_190",
    "en": "Mean",
    "vi": "Trung bình",
    "category": "statistics",
    "letter": "M"
  },
  {
    "id": "term_191",
    "en": "Measure of angle",
    "vi": "Số đo góc",
    "category": "geometry",
    "letter": "M"
  },
  {
    "id": "term_192",
    "en": "Median",
    "vi": "Trung vị (trong thống kê), đư ờng trung tuyến (của tam giác)",
    "category": "geometry",
    "letter": "M"
  },
  {
    "id": "term_194",
    "en": "Midline",
    "vi": "Đường trung bình (của tam giác, hình thang)",
    "category": "geometry",
    "letter": "M"
  },
  {
    "id": "term_193",
    "en": "Midpoint",
    "vi": "Trung điểm",
    "category": "geometry",
    "letter": "M"
  },
  {
    "id": "term_195",
    "en": "Minimum",
    "vi": "Giá trị nhỏ nhất",
    "category": "general",
    "letter": "M"
  },
  {
    "id": "term_196",
    "en": "Minor arc",
    "vi": "Cung nhỏ",
    "category": "geometry",
    "letter": "M"
  },
  {
    "id": "term_197",
    "en": "Minus",
    "vi": "Dấu trừ",
    "category": "general",
    "letter": "M"
  },
  {
    "id": "term_198",
    "en": "Mixed fraction",
    "vi": "Hỗn số",
    "category": "arithmetic",
    "letter": "M"
  },
  {
    "id": "term_199",
    "en": "Mixture",
    "vi": "Hỗn hợp",
    "category": "general",
    "letter": "M"
  },
  {
    "id": "term_200",
    "en": "Mode",
    "vi": "Mốt, thế vị, đa tần (kết quả của biến cố xảy ra nhiều nhất hay phép thử xảy ra tần số cao nhất)",
    "category": "statistics",
    "letter": "M"
  },
  {
    "id": "term_201",
    "en": "Modulo",
    "vi": "Đồng dư",
    "category": "arithmetic",
    "letter": "M"
  },
  {
    "id": "term_202",
    "en": "Multiple",
    "vi": "Bội số",
    "category": "arithmetic",
    "letter": "M"
  },
  {
    "id": "term_203",
    "en": "Multiplication",
    "vi": "Phép nhân",
    "category": "general",
    "letter": "M",
    "subterms": [
      {
        "en": "Multiplication rule",
        "vi": "Quy tắc nhân"
      }
    ]
  },
  {
    "id": "term_204",
    "en": "Multiply",
    "vi": "Nhân",
    "category": "general",
    "letter": "M"
  },
  {
    "id": "term_205",
    "en": "Natural numbers",
    "vi": "Số tự nhiên 1, 2, 3, …",
    "category": "general",
    "letter": "N"
  },
  {
    "id": "term_206",
    "en": "Negative",
    "vi": "Âm",
    "category": "general",
    "letter": "N",
    "subterms": [
      {
        "en": "Negative integers",
        "vi": "Các số nguyên âm"
      }
    ]
  },
  {
    "id": "term_207",
    "en": "Net",
    "vi": "Lưới (trải hình lên mặt phẳng)",
    "category": "geometry",
    "letter": "N"
  },
  {
    "id": "term_369",
    "en": "Normal distribution",
    "vi": "Phân phối chuẩn (đường cong Gauss)",
    "category": "statistics",
    "ipa": "/ˈnɔːml ˌdɪstrɪˈbjuːʃn/",
    "example": "A normal distribution is symmetric about its mean and shaped like a bell curve.",
    "subterms": [],
    "letter": "N"
  },
  {
    "id": "term_208",
    "en": "Number",
    "vi": "Số",
    "category": "general",
    "letter": "N"
  },
  {
    "id": "term_209",
    "en": "Numerator",
    "vi": "Tử số",
    "category": "general",
    "letter": "N"
  },
  {
    "id": "term_210",
    "en": "Observe",
    "vi": "Quan sát, nhận xét",
    "category": "general",
    "letter": "O"
  },
  {
    "id": "term_211",
    "en": "Obtuse triangle",
    "vi": "Tam giác tù",
    "category": "geometry",
    "letter": "O"
  },
  {
    "id": "term_212",
    "en": "Octagon",
    "vi": "Hình bát giác",
    "category": "general",
    "letter": "O"
  },
  {
    "id": "term_213",
    "en": "Odd",
    "vi": "Lẻ",
    "category": "general",
    "letter": "O",
    "subterms": [
      {
        "en": "Odd integers",
        "vi": "Các số nguyên lẻ"
      }
    ]
  },
  {
    "id": "term_214",
    "en": "Once",
    "vi": "Một lần",
    "category": "general",
    "letter": "O"
  },
  {
    "id": "term_215",
    "en": "Operations",
    "vi": "Các phép toán (cộng, trừ, nhân, chia, …)",
    "category": "general",
    "letter": "O"
  },
  {
    "id": "term_216",
    "en": "Order",
    "vi": "Thứ tự",
    "category": "general",
    "letter": "O"
  },
  {
    "id": "term_217",
    "en": "Original",
    "vi": "Ban đầu",
    "category": "general",
    "letter": "O"
  },
  {
    "id": "term_218",
    "en": "Orthocenter",
    "vi": "Trực tâm",
    "category": "general",
    "letter": "O"
  },
  {
    "id": "term_219",
    "en": "Outside",
    "vi": "Bên ngoài, ở ngoài",
    "category": "general",
    "letter": "O"
  },
  {
    "id": "term_220",
    "en": "Pair",
    "vi": "Đôi, cặp",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_221",
    "en": "Pairwise",
    "vi": "Từng đôi một",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_222",
    "en": "Palindromic number",
    "vi": "Số viết xuôi viết ngược đều giống nhau (ví dụ 12321)",
    "category": "arithmetic",
    "letter": "P"
  },
  {
    "id": "term_223",
    "en": "Parabola",
    "vi": "Đường cong parabol",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_224",
    "en": "Parallel",
    "vi": "Song song",
    "category": "geometry",
    "letter": "P"
  },
  {
    "id": "term_225",
    "en": "Parallelogram",
    "vi": "Hình bình hành",
    "category": "geometry",
    "letter": "P",
    "ipa": "/ˌpærəˈleləɡræm/",
    "example": "Opposite sides of a parallelogram are equal and parallel."
  },
  {
    "id": "term_226",
    "en": "Parity",
    "vi": "Tính chẵn lẻ",
    "category": "arithmetic",
    "letter": "P"
  },
  {
    "id": "term_227",
    "en": "Path",
    "vi": "Đường đi, lối đi",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_228",
    "en": "Patterns",
    "vi": "Kiểu lặp lại một kiểu sắp xếp (hình, số) nhiều lần",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_229",
    "en": "Pentagon",
    "vi": "Hình ngũ giác",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_230",
    "en": "Perfect cube",
    "vi": "Số lập phương",
    "category": "geometry",
    "letter": "P"
  },
  {
    "id": "term_231",
    "en": "Perfect square",
    "vi": "Số chính phương",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_232",
    "en": "Perfect square factors",
    "vi": "Các ước số là số chính phương",
    "category": "arithmetic",
    "letter": "P"
  },
  {
    "id": "term_233",
    "en": "Perimeter",
    "vi": "Chu vi (của đa giác)",
    "category": "geometry",
    "letter": "P"
  },
  {
    "id": "term_234",
    "en": "Period",
    "vi": "Chu kỳ",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_235",
    "en": "Permutation",
    "vi": "Hoán vị, Chỉnh hợp",
    "category": "statistics",
    "letter": "P"
  },
  {
    "id": "term_236",
    "en": "Perpendicular",
    "vi": "Vuông góc, trực giao",
    "category": "geometry",
    "letter": "P",
    "subterms": [
      {
        "en": "Perpendicular bisector",
        "vi": "Đường trung trực"
      }
    ],
    "ipa": "/ˌpɜːpənˈdɪkjələ/",
    "example": "Two lines are perpendicular if they intersect at 90 degrees."
  },
  {
    "id": "term_237",
    "en": "Plus",
    "vi": "Dấu cộng",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_242",
    "en": "Point",
    "vi": "Điểm",
    "category": "general",
    "letter": "P",
    "subterms": [
      {
        "en": "Point of concurrency",
        "vi": "Điểm đồng quy"
      },
      {
        "en": "Point of contact",
        "vi": "Tiếp điểm"
      },
      {
        "en": "Point of intersection",
        "vi": "Giao điểm"
      },
      {
        "en": "Point of tangency",
        "vi": "Tiếp điểm"
      }
    ]
  },
  {
    "id": "term_238",
    "en": "Pole",
    "vi": "Cột, que",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_240",
    "en": "Polygon",
    "vi": "Hình đa giác",
    "category": "geometry",
    "letter": "P"
  },
  {
    "id": "term_239",
    "en": "Polyhedron",
    "vi": "Đa diện",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_241",
    "en": "Polynomial",
    "vi": "Đa thức",
    "category": "algebra",
    "letter": "P",
    "ipa": "/ˌpɒlɪˈnəʊmiəl/",
    "example": "P(x) = a_n*x^n + ... + a_0 is a polynomial of degree n."
  },
  {
    "id": "term_243",
    "en": "Positive",
    "vi": "Dương",
    "category": "general",
    "letter": "P",
    "subterms": [
      {
        "en": "Positive factors",
        "vi": "Ước số dương"
      },
      {
        "en": "Positive real numbers",
        "vi": "Các số thực dương"
      }
    ]
  },
  {
    "id": "term_244",
    "en": "Possess",
    "vi": "Có, sở hữu",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_245",
    "en": "Possibility",
    "vi": "Khả năng",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_246",
    "en": "Prime factorisation",
    "vi": "Phân tích ra thừa số nguyên tố",
    "category": "arithmetic",
    "letter": "P"
  },
  {
    "id": "term_247",
    "en": "Prime numbers",
    "vi": "Các số nguyên tố",
    "category": "arithmetic",
    "letter": "P"
  },
  {
    "id": "term_248",
    "en": "Probability",
    "vi": "Xác suất",
    "category": "statistics",
    "letter": "P"
  },
  {
    "id": "term_250",
    "en": "Product",
    "vi": "Tích",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_249",
    "en": "Property",
    "vi": "Tính chất",
    "category": "general",
    "letter": "P"
  },
  {
    "id": "term_251",
    "en": "Pyramid",
    "vi": "Hình chóp",
    "category": "geometry",
    "letter": "P"
  },
  {
    "id": "term_252",
    "en": "Quadrant",
    "vi": "Góc phần tư",
    "category": "geometry",
    "letter": "Q"
  },
  {
    "id": "term_253",
    "en": "Quadratic equation",
    "vi": "Phương trình bậc hai",
    "category": "algebra",
    "letter": "Q",
    "ipa": "/kwɒˈdrætɪk ɪˈkweɪʒn/",
    "example": "ax^2 + bx + c = 0 can be solved using the quadratic formula."
  },
  {
    "id": "term_254",
    "en": "Quadrilateral",
    "vi": "Hình tứ giác",
    "category": "geometry",
    "letter": "Q"
  },
  {
    "id": "term_255",
    "en": "Quarter",
    "vi": "Một phần tư",
    "category": "general",
    "letter": "Q"
  },
  {
    "id": "term_256",
    "en": "Quotient",
    "vi": "Thương (của phép chia)",
    "category": "general",
    "letter": "Q"
  },
  {
    "id": "term_257",
    "en": "Radius",
    "vi": "Bán kính",
    "category": "geometry",
    "letter": "R",
    "ipa": "/ˈreɪdiəs/",
    "example": "The radius of a circle is the distance from its center to any point on its boundary."
  },
  {
    "id": "term_258",
    "en": "Range",
    "vi": "Khoảng giá trị",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_259",
    "en": "Rate",
    "vi": "Mức độ, tốc độ, năng suất",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_260",
    "en": "Ratio",
    "vi": "Tỉ lệ",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_261",
    "en": "Rational number",
    "vi": "Số hữu tỉ",
    "category": "general",
    "letter": "R",
    "subterms": [
      {
        "en": "The set of rational numbers",
        "vi": "Tập các số hữu tỉ"
      }
    ]
  },
  {
    "id": "term_262",
    "en": "Ray",
    "vi": "Tia",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_263",
    "en": "Reach",
    "vi": "Đến, tới",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_264",
    "en": "Real number",
    "vi": "Số thực",
    "category": "general",
    "letter": "R",
    "subterms": [
      {
        "en": "The set of positive real numbers",
        "vi": "Tập các số thực"
      }
    ]
  },
  {
    "id": "term_265",
    "en": "Reciprocal",
    "vi": "Dạng nghịch đảo",
    "category": "general",
    "letter": "R",
    "ipa": "/rɪˈsɪprəkl/",
    "example": "The reciprocal of 2/3 is 3/2."
  },
  {
    "id": "term_266",
    "en": "Rectangle",
    "vi": "Hình chữ nhật",
    "category": "geometry",
    "letter": "R"
  },
  {
    "id": "term_267",
    "en": "Rectangular",
    "vi": "Hình hộp chữ nhật",
    "category": "geometry",
    "letter": "R"
  },
  {
    "id": "term_268",
    "en": "Recursion",
    "vi": "Đệ quy",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_269",
    "en": "Reduce",
    "vi": "Giảm",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_270",
    "en": "Region",
    "vi": "Miền",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_271",
    "en": "Regular polygon",
    "vi": "Đa giác đều",
    "category": "geometry",
    "letter": "R"
  },
  {
    "id": "term_272",
    "en": "Relatively prime",
    "vi": "Nguyên tố cùng nhau",
    "category": "arithmetic",
    "letter": "R"
  },
  {
    "id": "term_273",
    "en": "Remainder",
    "vi": "Số dư",
    "category": "arithmetic",
    "letter": "R"
  },
  {
    "id": "term_274",
    "en": "Remaining numbers",
    "vi": "Các số còn lại",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_275",
    "en": "Remains uchanged",
    "vi": "Không đổi",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_278",
    "en": "Repeating decimal",
    "vi": "Phần thập phân tuần hoàn",
    "category": "arithmetic",
    "letter": "R"
  },
  {
    "id": "term_276",
    "en": "Replace Thay",
    "vi": "thế, thay chỗ",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_277",
    "en": "Represent",
    "vi": "Đại diện",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_279",
    "en": "Respectively",
    "vi": "Tương ứng, theo thứ tự, lần lượt",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_280",
    "en": "Rhombus",
    "vi": "Hình thoi",
    "category": "geometry",
    "letter": "R"
  },
  {
    "id": "term_281",
    "en": "Right angle",
    "vi": "Góc vuông",
    "category": "geometry",
    "letter": "R"
  },
  {
    "id": "term_282",
    "en": "Right hand side",
    "vi": "Vế phải",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_284",
    "en": "Right triangle",
    "vi": "Tam giác vuông",
    "category": "geometry",
    "letter": "R"
  },
  {
    "id": "term_283",
    "en": "Right-most digit",
    "vi": "Chữ số tận cùng bên phải",
    "category": "arithmetic",
    "letter": "R"
  },
  {
    "id": "term_285",
    "en": "Rook",
    "vi": "Quân xe",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_286",
    "en": "Root",
    "vi": "Nghiệm",
    "category": "algebra",
    "letter": "R"
  },
  {
    "id": "term_287",
    "en": "Row",
    "vi": "Hàng, dãy",
    "category": "general",
    "letter": "R"
  },
  {
    "id": "term_288",
    "en": "Satisfy",
    "vi": "Thỏa mãn",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_289",
    "en": "Scale factor",
    "vi": "Tỉ số đồng dạng",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_290",
    "en": "Scalene triangle",
    "vi": "Tam giác có ba cạnh có độ dài khác nhau",
    "category": "geometry",
    "letter": "S"
  },
  {
    "id": "term_291",
    "en": "Schedule",
    "vi": "Lịch trình",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_292",
    "en": "Sector",
    "vi": "Hình quạt",
    "category": "geometry",
    "letter": "S"
  },
  {
    "id": "term_293",
    "en": "Segment",
    "vi": "Đoạn thẳng",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_294",
    "en": "Select",
    "vi": "Lựa chọn",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_295",
    "en": "Semicircle",
    "vi": "Nửa đường tròn",
    "category": "geometry",
    "letter": "S"
  },
  {
    "id": "term_296",
    "en": "Sequence",
    "vi": "Dãy số",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_297",
    "en": "Set",
    "vi": "Tập hợp",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_298",
    "en": "Side length",
    "vi": "Độ dài cạnh",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_299",
    "en": "Sign",
    "vi": "Dấu (của số), ký hiệu",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_300",
    "en": "Similar figures",
    "vi": "Các hình đồng dạng",
    "category": "general",
    "letter": "S",
    "ipa": "/ˈsɪmɪlə ˈfɪɡəz/",
    "example": "Similar figures have congruent corresponding angles and proportional side lengths."
  },
  {
    "id": "term_301",
    "en": "Similarly",
    "vi": "Tương tự",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_302",
    "en": "Simultaneous equations",
    "vi": "Hệ phương trình",
    "category": "algebra",
    "letter": "S",
    "ipa": "/ˌsɪmlˈteɪniəs ɪˈkweɪʒnz/",
    "example": "Solve the simultaneous equations to find common intersection points."
  },
  {
    "id": "term_303",
    "en": "Simultaneously",
    "vi": "Đồng thời, cùng lúc",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_304",
    "en": "Situate",
    "vi": "Đặt ở vị trí",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_307",
    "en": "Sketch",
    "vi": "Phác thảo, hình vẽ",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_305",
    "en": "Slant height",
    "vi": "Đường sinh (của hình nón)",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_306",
    "en": "Slipping",
    "vi": "Trượt",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_308",
    "en": "Slope",
    "vi": "Hệ số góc",
    "category": "geometry",
    "letter": "S"
  },
  {
    "id": "term_310",
    "en": "Solid figures",
    "vi": "Các hình trong không gian",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_309",
    "en": "Solid geometry",
    "vi": "Hình học không gian",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_311",
    "en": "Solution",
    "vi": "Nghiệm, dung dịch",
    "category": "algebra",
    "letter": "S"
  },
  {
    "id": "term_314",
    "en": "Speed",
    "vi": "Tốc độ",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_312",
    "en": "Sphere",
    "vi": "Hình cầu",
    "category": "geometry",
    "letter": "S"
  },
  {
    "id": "term_313",
    "en": "Spherical",
    "vi": "Dạng hình cầu",
    "category": "geometry",
    "letter": "S"
  },
  {
    "id": "term_315",
    "en": "Square",
    "vi": "Hình vuông (hình h ọc), bình phương (s ố học, đại số)",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_367",
    "en": "Standard deviation",
    "vi": "Độ lệch chuẩn",
    "category": "statistics",
    "ipa": "/ˈstændəd ˌdiːviˈeɪʃn/",
    "example": "Standard deviation measures the dispersion of a dataset relative to its mean.",
    "subterms": [],
    "letter": "S"
  },
  {
    "id": "term_316",
    "en": "Statement",
    "vi": "Mệnh đề",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_317",
    "en": "Straight line",
    "vi": "Đường thẳng",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_318",
    "en": "Subset",
    "vi": "Tập con",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_319",
    "en": "Subtract (subtraction)",
    "vi": "Trừ (phép trừ)",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_320",
    "en": "Subtrahend",
    "vi": "Số bị trừ",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_321",
    "en": "Successive",
    "vi": "Liên tiếp",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_322",
    "en": "Suffice",
    "vi": "Chỉ cần",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_323",
    "en": "Sum",
    "vi": "Tổng",
    "category": "general",
    "letter": "S",
    "subterms": [
      {
        "en": "Sum of squares",
        "vi": "Tổng các bình phương"
      }
    ]
  },
  {
    "id": "term_324",
    "en": "Supplementary angles",
    "vi": "Hai góc bù nhau (có tổng bằng 180 độ)",
    "category": "geometry",
    "letter": "S"
  },
  {
    "id": "term_325",
    "en": "Suppose",
    "vi": "Giả sử",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_326",
    "en": "Surd form",
    "vi": "Dạng căn thức",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_327",
    "en": "Survey",
    "vi": "Khảo sát, thống kê, thăm dò",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_328",
    "en": "Symmetry",
    "vi": "Đối xứng",
    "category": "general",
    "letter": "S"
  },
  {
    "id": "term_329",
    "en": "System of equations",
    "vi": "Hệ phương trình",
    "category": "algebra",
    "letter": "S"
  },
  {
    "id": "term_330",
    "en": "Tangent",
    "vi": "Tiếp xúc",
    "category": "geometry",
    "letter": "T"
  },
  {
    "id": "term_331",
    "en": "Term",
    "vi": "Số hạng",
    "category": "general",
    "letter": "T"
  },
  {
    "id": "term_332",
    "en": "Tesselation",
    "vi": "Lát mặt phẳng",
    "category": "geometry",
    "letter": "T"
  },
  {
    "id": "term_333",
    "en": "Therefore",
    "vi": "Bởi vậy, cho nên",
    "category": "general",
    "letter": "T"
  },
  {
    "id": "term_334",
    "en": "Times",
    "vi": "Dấu nhân",
    "category": "general",
    "letter": "T"
  },
  {
    "id": "term_335",
    "en": "Total",
    "vi": "Tổng",
    "category": "general",
    "letter": "T"
  },
  {
    "id": "term_336",
    "en": "Total surface area",
    "vi": "Diện tích toàn phần, diện tích bề mặt",
    "category": "general",
    "letter": "T"
  },
  {
    "id": "term_337",
    "en": "Touch",
    "vi": "Tiếp xúc",
    "category": "geometry",
    "letter": "T"
  },
  {
    "id": "term_338",
    "en": "Touching spheres",
    "vi": "Các hình cầu tiếp xúc nhau",
    "category": "geometry",
    "letter": "T"
  },
  {
    "id": "term_339",
    "en": "Trapezium",
    "vi": "Hình thang",
    "category": "geometry",
    "letter": "T",
    "ipa": "/trəˈpiːziəm/",
    "example": "A trapezium is a quadrilateral with at least one pair of parallel sides."
  },
  {
    "id": "term_340",
    "en": "Triangle",
    "vi": "Tam giác",
    "category": "geometry",
    "letter": "T"
  },
  {
    "id": "term_366",
    "en": "Trigonometric identities",
    "vi": "Hằng đẳng thức lượng giác",
    "category": "geometry",
    "ipa": "/ˌtrɪɡənəˈmetrɪk aɪˈdentətiz/",
    "example": "sin^2(x) + cos^2(x) = 1 is the fundamental Pythagorean trigonometric identity.",
    "subterms": [
      {
        "en": "Sine rule",
        "vi": "Định lý sin"
      },
      {
        "en": "Cosine rule",
        "vi": "Định lý cos"
      },
      {
        "en": "Double angle formulas",
        "vi": "Công thức nhân đôi"
      }
    ],
    "letter": "T"
  },
  {
    "id": "term_341",
    "en": "Triple",
    "vi": "Gấp ba (số lần), bộ ba",
    "category": "general",
    "letter": "T"
  },
  {
    "id": "term_342",
    "en": "Trisect",
    "vi": "Chia ba (góc, cạnh)",
    "category": "geometry",
    "letter": "T"
  },
  {
    "id": "term_343",
    "en": "Tuple",
    "vi": "Bộ số",
    "category": "general",
    "letter": "T",
    "subterms": [
      {
        "en": "k-tuple",
        "vi": "Bộ có k số"
      }
    ]
  },
  {
    "id": "term_344",
    "en": "Twice",
    "vi": "Hai lần",
    "category": "general",
    "letter": "T"
  },
  {
    "id": "term_345",
    "en": "Union",
    "vi": "Hợp (của các tập hợp)",
    "category": "general",
    "letter": "U"
  },
  {
    "id": "term_346",
    "en": "Unit circle",
    "vi": "Đường tròn đơn vị",
    "category": "geometry",
    "letter": "U"
  },
  {
    "id": "term_347",
    "en": "Unit square",
    "vi": "Hình vuông đơn vị",
    "category": "general",
    "letter": "U"
  },
  {
    "id": "term_348",
    "en": "Universal set",
    "vi": "Tập vạn năng",
    "category": "general",
    "letter": "U"
  },
  {
    "id": "term_349",
    "en": "Value",
    "vi": "Giá trị",
    "category": "general",
    "letter": "V"
  },
  {
    "id": "term_350",
    "en": "Variable",
    "vi": "Biến số",
    "category": "algebra",
    "letter": "V"
  },
  {
    "id": "term_368",
    "en": "Variance",
    "vi": "Phương sai",
    "category": "statistics",
    "ipa": "/ˈveəriəns/",
    "example": "Variance is the expectation of the squared deviation of a random variable from its mean.",
    "subterms": [],
    "letter": "V"
  },
  {
    "id": "term_351",
    "en": "Vary",
    "vi": "Biến đổi, biến thiên",
    "category": "general",
    "letter": "V"
  },
  {
    "id": "term_352",
    "en": "Venn diagram",
    "vi": "Giản đồ Venn",
    "category": "general",
    "letter": "V"
  },
  {
    "id": "term_353",
    "en": "Vertex",
    "vi": "Đỉnh (của đa giác, khối đa diện)",
    "category": "geometry",
    "letter": "V"
  },
  {
    "id": "term_354",
    "en": "Vertical angles",
    "vi": "Các góc đối đỉnh",
    "category": "geometry",
    "letter": "V"
  },
  {
    "id": "term_355",
    "en": "Vertices",
    "vi": "Các đỉnh",
    "category": "geometry",
    "letter": "V"
  },
  {
    "id": "term_356",
    "en": "Volume",
    "vi": "Thể tích",
    "category": "general",
    "letter": "V",
    "subterms": [
      {
        "en": "Volume of cylinder",
        "vi": "Thể tích hình trụ tròn"
      }
    ],
    "ipa": "/ˈvɒljuːm/",
    "example": "The volume of a sphere with radius r is (4/3)*pi*r^3."
  },
  {
    "id": "term_357",
    "en": "Wheel",
    "vi": "Bánh xe",
    "category": "general",
    "letter": "W"
  },
  {
    "id": "term_358",
    "en": "Whence",
    "vi": "Từ đó, do đó",
    "category": "general",
    "letter": "W"
  },
  {
    "id": "term_359",
    "en": "Whole numbers",
    "vi": "Tập số 0, 1, 2, 3, …",
    "category": "general",
    "letter": "W"
  }
];

export const MATH_FLASHCARDS = [
  {
    "id": "fc_term_9",
    "en": "Altitude",
    "vi": "Đường cao",
    "category": "geometry",
    "ipa": "/ˈæltɪtjuːd/",
    "example": "The altitude of a triangle is the perpendicular segment from a vertex to the opposite line.",
    "subterms": []
  },
  {
    "id": "fc_term_361",
    "en": "Antiderivative",
    "vi": "Nguyên hàm",
    "category": "calculus",
    "ipa": "/ˌænti-dɪˈrɪvətɪv/",
    "example": "F(x) is an antiderivative of f(x) if F'(x) = f(x).",
    "subterms": []
  },
  {
    "id": "fc_term_363",
    "en": "Asymptote",
    "vi": "Đường tiệm cận",
    "category": "calculus",
    "ipa": "/ˈæsɪmptəʊt/",
    "example": "The curve approaches its horizontal asymptote as x tends to infinity.",
    "subterms": [
      {
        "en": "Horizontal asymptote",
        "vi": "Tiệm cận ngang"
      },
      {
        "en": "Vertical asymptote",
        "vi": "Tiệm cận đứng"
      },
      {
        "en": "Slant / Oblique asymptote",
        "vi": "Tiệm cận xiên"
      }
    ]
  },
  {
    "id": "fc_term_29",
    "en": "Binomial",
    "vi": "Nhị thức",
    "category": "algebra",
    "ipa": "/baɪˈnəʊmiəl/",
    "example": "A binomial is a polynomial containing exactly two terms, such as (x + y).",
    "subterms": []
  },
  {
    "id": "fc_term_44",
    "en": "Circumcircle",
    "vi": "Đường tròn ngoại tiếp",
    "category": "geometry",
    "ipa": "/ˈsɜːkəmˌsɜːkl/",
    "example": "The circumcircle passes through all three vertices of the triangle.",
    "subterms": []
  },
  {
    "id": "fc_term_59",
    "en": "Congruent",
    "vi": "Đồng dư (số học), bằng nhau (hình học)",
    "category": "arithmetic",
    "ipa": "/ˈkɒŋɡruənt/",
    "example": "Two figures are congruent if they have the exact same shape and size.",
    "subterms": [
      {
        "en": "Congruent figures",
        "vi": "Các hình bằng nhau"
      },
      {
        "en": "Congruent polygons",
        "vi": "Các đa giác bằng nhau"
      },
      {
        "en": "Congruent octagons",
        "vi": "Các hình bát giác bằng nhau"
      }
    ]
  },
  {
    "id": "fc_term_72",
    "en": "Coprime",
    "vi": "Nguyên tố cùng nhau",
    "category": "arithmetic",
    "ipa": "/kəʊˈpraɪm/",
    "example": "Numbers 8 and 9 are coprime because their greatest common divisor is 1.",
    "subterms": []
  },
  {
    "id": "fc_term_360",
    "en": "Derivative",
    "vi": "Đạo hàm",
    "category": "calculus",
    "ipa": "/dɪˈrɪvətɪv/",
    "example": "The derivative f'(x) represents the instantaneous rate of change of f at x.",
    "subterms": [
      {
        "en": "First derivative",
        "vi": "Đạo hàm bậc nhất"
      },
      {
        "en": "Second derivative",
        "vi": "Đạo hàm bậc hai"
      },
      {
        "en": "Partial derivative",
        "vi": "Đạo hàm riêng"
      }
    ]
  },
  {
    "id": "fc_term_365",
    "en": "Domain and Range",
    "vi": "Tập xác định và Tập giá trị",
    "category": "algebra",
    "ipa": "/dəʊˈmeɪn ænd reɪndʒ/",
    "example": "The domain is the set of valid inputs; the range is the set of possible outputs.",
    "subterms": []
  },
  {
    "id": "fc_term_150",
    "en": "Hypotenuse",
    "vi": "Cạnh huyền",
    "category": "geometry",
    "ipa": "/haɪˈpɒtənjuːz/",
    "example": "The hypotenuse is the longest side of a right-angled triangle, opposite the right angle.",
    "subterms": []
  },
  {
    "id": "fc_term_156",
    "en": "Incircle",
    "vi": "Đường tròn nội tiếp",
    "category": "geometry",
    "ipa": "/ˈɪnˌsɜːkl/",
    "example": "The incircle is tangent to all three sides of a triangle.",
    "subterms": []
  },
  {
    "id": "fc_term_364",
    "en": "Inflection point",
    "vi": "Điểm uốn của đồ thị",
    "category": "calculus",
    "ipa": "/ɪnˈflekʃn pɔɪnt/",
    "example": "An inflection point is a point where the concavity of a curve changes.",
    "subterms": []
  },
  {
    "id": "fc_term_163",
    "en": "Integral",
    "vi": "Nguyên",
    "category": "calculus",
    "ipa": "",
    "example": "",
    "subterms": [
      {
        "en": "Integral solution",
        "vi": "Nghiệm nguyên"
      }
    ]
  },
  {
    "id": "fc_term_192",
    "en": "Median",
    "vi": "Trung vị (trong thống kê), đư ờng trung tuyến (của tam giác)",
    "category": "geometry",
    "ipa": "",
    "example": "",
    "subterms": []
  },
  {
    "id": "fc_term_225",
    "en": "Parallelogram",
    "vi": "Hình bình hành",
    "category": "geometry",
    "ipa": "/ˌpærəˈleləɡræm/",
    "example": "Opposite sides of a parallelogram are equal and parallel.",
    "subterms": []
  },
  {
    "id": "fc_term_226",
    "en": "Parity",
    "vi": "Tính chẵn lẻ",
    "category": "arithmetic",
    "ipa": "",
    "example": "",
    "subterms": []
  },
  {
    "id": "fc_term_236",
    "en": "Perpendicular",
    "vi": "Vuông góc, trực giao",
    "category": "geometry",
    "ipa": "/ˌpɜːpənˈdɪkjələ/",
    "example": "Two lines are perpendicular if they intersect at 90 degrees.",
    "subterms": [
      {
        "en": "Perpendicular bisector",
        "vi": "Đường trung trực"
      }
    ]
  },
  {
    "id": "fc_term_241",
    "en": "Polynomial",
    "vi": "Đa thức",
    "category": "algebra",
    "ipa": "/ˌpɒlɪˈnəʊmiəl/",
    "example": "P(x) = a_n*x^n + ... + a_0 is a polynomial of degree n.",
    "subterms": []
  },
  {
    "id": "fc_term_253",
    "en": "Quadratic equation",
    "vi": "Phương trình bậc hai",
    "category": "algebra",
    "ipa": "/kwɒˈdrætɪk ɪˈkweɪʒn/",
    "example": "ax^2 + bx + c = 0 can be solved using the quadratic formula.",
    "subterms": []
  },
  {
    "id": "fc_term_300",
    "en": "Similar figures",
    "vi": "Các hình đồng dạng",
    "category": "general",
    "ipa": "/ˈsɪmɪlə ˈfɪɡəz/",
    "example": "Similar figures have congruent corresponding angles and proportional side lengths.",
    "subterms": []
  },
  {
    "id": "fc_term_302",
    "en": "Simultaneous equations",
    "vi": "Hệ phương trình",
    "category": "algebra",
    "ipa": "/ˌsɪmlˈteɪniəs ɪˈkweɪʒnz/",
    "example": "Solve the simultaneous equations to find common intersection points.",
    "subterms": []
  },
  {
    "id": "fc_term_367",
    "en": "Standard deviation",
    "vi": "Độ lệch chuẩn",
    "category": "statistics",
    "ipa": "/ˈstændəd ˌdiːviˈeɪʃn/",
    "example": "Standard deviation measures the dispersion of a dataset relative to its mean.",
    "subterms": []
  },
  {
    "id": "fc_term_326",
    "en": "Surd form",
    "vi": "Dạng căn thức",
    "category": "general",
    "ipa": "",
    "example": "",
    "subterms": []
  },
  {
    "id": "fc_term_339",
    "en": "Trapezium",
    "vi": "Hình thang",
    "category": "geometry",
    "ipa": "/trəˈpiːziəm/",
    "example": "A trapezium is a quadrilateral with at least one pair of parallel sides.",
    "subterms": []
  },
  {
    "id": "fc_term_356",
    "en": "Volume",
    "vi": "Thể tích",
    "category": "general",
    "ipa": "/ˈvɒljuːm/",
    "example": "The volume of a sphere with radius r is (4/3)*pi*r^3.",
    "subterms": [
      {
        "en": "Volume of cylinder",
        "vi": "Thể tích hình trụ tròn"
      }
    ]
  }
];
