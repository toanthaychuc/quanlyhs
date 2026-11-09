/**
 * Dữ liệu chuẩn Thuật ngữ Toán tiếng Anh & Câu lệnh giao tiếp lớp học song ngữ
 * 100% Thuật ngữ có đầy đủ: Từ tiếng Anh, Phiên âm quốc tế (IPA), Nghĩa tiếng Việt, Ví dụ toán học & Thuật ngữ liên quan.
 */

export const GRADE_LEVELS = [
  {
    "id": "all",
    "name": "Tất cả các khối lớp (1 - 12)",
    "shortName": "Tất cả lớp",
    "badge": "K-12",
    "color": "#4f46e5",
    "desc": "Toàn bộ từ vựng toán từ Tiểu học đến THPT",
    "count": 456
  },
  {
    "id": "primary",
    "name": "Tiểu học (Lớp 1 - 5)",
    "shortName": "Lớp 1-5",
    "badge": "Lớp 1-5",
    "color": "#10b981",
    "desc": "Số tự nhiên, phép tính cơ bản, phân số, số thập phân, hình phẳng, chu vi, diện tích",
    "count": 51
  },
  {
    "id": "middle",
    "name": "THCS (Lớp 6 - 9)",
    "shortName": "Lớp 6-9",
    "badge": "Lớp 6-9",
    "color": "#0ea5e9",
    "desc": "Số nguyên, số hữu tỉ, phương trình, tam giác đồng dạng, định lý Pythagoras, đường tròn",
    "count": 330
  },
  {
    "id": "grade10",
    "name": "THPT - Lớp 10",
    "shortName": "Lớp 10",
    "badge": "Lớp 10",
    "color": "#8b5cf6",
    "desc": "Mệnh đề, tập hợp, bất phương trình, véc-tơ Oxy, tam thức bậc hai, lượng giác tam giác, tổ hợp",
    "count": 27
  },
  {
    "id": "grade11",
    "name": "THPT - Lớp 11",
    "shortName": "Lớp 11",
    "badge": "Lớp 11",
    "color": "#f59e0b",
    "desc": "Hàm số lượng giác, cấp số cộng/nhân, giới hạn, đạo hàm, hình học không gian, xác suất nâng cao",
    "count": 24
  },
  {
    "id": "grade12",
    "name": "THPT - Lớp 12",
    "shortName": "Lớp 12",
    "badge": "Lớp 12",
    "color": "#ef4444",
    "desc": "Khảo sát hàm số, nguyên hàm - tích phân, tọa độ không gian Oxyz, số liệu ghép nhóm, Bayes",
    "count": 24
  }
];

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
    "en": "3D Cartesian coordinate system (Oxyz)",
    "vi": "Hệ tọa độ Descartes trong không gian Oxyz",
    "category": "geometry",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/kɑːˈtiːziən kəʊˈɔːdɪnət ˈsɪstəm/",
    "example": "Space defined by three mutually perpendicular axes: Ox, Oy, Oz.",
    "id": "term_449",
    "letter": "#",
    "subterms": []
  },
  {
    "id": "term_1",
    "en": "Absolute value",
    "vi": "Giá trị tuyệt đối",
    "category": "general",
    "letter": "A",
    "ipa": "/ˈæbsəluːt ˈvæljuː/",
    "example": "The absolute value of -5 is 5, written as |-5| = 5.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/əˈkjuːt/",
    "example": "An acute angle measures strictly between 0° and 90°."
  },
  {
    "id": "term_3",
    "en": "Add (addition)",
    "vi": "Cộng (phép cộng)",
    "category": "general",
    "letter": "A",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/æd/",
    "example": "In standard mathematical curriculum, 'Add (addition)' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_4",
    "en": "Addend",
    "vi": "Một số hạng (trong tổng)",
    "category": "general",
    "letter": "A",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈædənd/",
    "example": "In the addition 8 + 5 = 13, both 8 and 5 are addends.",
    "subterms": []
  },
  {
    "en": "Addition",
    "vi": "Phép cộng",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/əˈdɪʃn/",
    "example": "Addition is finding the total of two or more numbers (e.g. 3 + 5 = 8).",
    "id": "term_374",
    "letter": "A",
    "subterms": []
  },
  {
    "id": "term_6",
    "en": "Addition rule",
    "vi": "Quy tắc cộng",
    "category": "general",
    "letter": "A",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/əˈdɪʃn ruːl/",
    "example": "By the addition rule of combinatorics, if task A has 3 options and task B has 4 options, there are 7 total choices.",
    "subterms": []
  },
  {
    "id": "term_5",
    "en": "Additive",
    "vi": "Cộng tính",
    "category": "general",
    "letter": "A",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈædɪtɪv/",
    "example": "The additive identity for real numbers is 0, since x + 0 = x.",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/əˈdʒeɪsnt/",
    "example": "Adjacent angles share a common vertex and a common ray."
  },
  {
    "id": "term_8",
    "en": "Alternative angles",
    "vi": "Góc so le",
    "category": "geometry",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɔːlˈtɜːnətɪv ˈæŋɡlz/",
    "example": "Alternative interior angles are equal when two parallel lines are cut by a transversal.",
    "subterms": []
  },
  {
    "id": "term_9",
    "en": "Altitude",
    "vi": "Đường cao",
    "category": "geometry",
    "letter": "A",
    "ipa": "/ˈæltɪtjuːd/",
    "example": "The altitude of a triangle is the perpendicular segment from a vertex to the opposite line.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈæŋɡl/",
    "example": "In standard mathematical curriculum, 'Angle' is used to analyze properties and solve equations in geometry."
  },
  {
    "id": "term_11",
    "en": "Annulus",
    "vi": "Hình vành khăn",
    "category": "geometry",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈænjələs/",
    "example": "The area of an annulus between concentric circles of radius R and r is pi*(R^2 - r^2).",
    "subterms": []
  },
  {
    "id": "term_361",
    "en": "Antiderivative",
    "vi": "Nguyên hàm",
    "category": "calculus",
    "ipa": "/ˌænti-dɪˈrɪvətɪv/",
    "example": "F(x) is an antiderivative of f(x) if F'(x) = f(x).",
    "subterms": [],
    "letter": "A",
    "gradeId": "grade12",
    "grade": "Lớp 12"
  },
  {
    "en": "Antiderivative and Indefinite integral",
    "vi": "Nguyên hàm và Tích phân bất định (∫ f(x)dx = F(x) + C)",
    "category": "calculus",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ˌæntidɪˈrɪvətɪv ænd ɪnˈdefɪnət ˈɪntɪɡrəl/",
    "example": "F'(x) = f(x); never forget the integration constant C.",
    "id": "term_445",
    "letter": "A",
    "subterms": []
  },
  {
    "id": "term_12",
    "en": "Arbitrary",
    "vi": "Bất kỳ, tùy ý",
    "category": "general",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈɑːbɪtrəri/",
    "example": "Let c be an arbitrary real constant in the general solution.",
    "subterms": []
  },
  {
    "id": "term_13",
    "en": "Arc",
    "vi": "Cung",
    "category": "geometry",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɑːk/",
    "example": "The length of an arc subtending central angle theta is s = r * theta.",
    "subterms": []
  },
  {
    "id": "term_14",
    "en": "Area",
    "vi": "Diện tích",
    "category": "general",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈeəriə/",
    "example": "In standard mathematical curriculum, 'Area' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_15",
    "en": "Argument",
    "vi": "Lập luận, lý lẽ",
    "category": "general",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈɑːɡjumənt/",
    "example": "In standard mathematical curriculum, 'Argument' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Arithmetic progression (AP)",
    "vi": "Cấp số cộng (u_n = u_1 + (n-1)d)",
    "category": "algebra",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/əˈrɪθmətɪk prəˈɡreʃn/",
    "example": "For the arithmetic progression 3, 7, 11, 15, ..., the first term is u1 = 3 and the common difference is d = 4.",
    "id": "term_428",
    "letter": "A",
    "subterms": [
      {
        "en": "Arithmetic sequence",
        "vi": "Dãy số cấp số cộng"
      },
      {
        "en": "Common difference (d)",
        "vi": "Công sai (d)"
      },
      {
        "en": "Sum of first n terms",
        "vi": "Tổng n số hạng đầu của cấp số cộng"
      }
    ]
  },
  {
    "id": "term_16",
    "en": "Arrange",
    "vi": "Sắp xếp",
    "category": "general",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/əˈreɪndʒ/",
    "example": "The statistical range is the difference between the maximum and minimum observations.",
    "subterms": []
  },
  {
    "id": "term_17",
    "en": "Array",
    "vi": "Mảng hình chữ nhật",
    "category": "general",
    "letter": "A",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/əˈreɪ/",
    "example": "A 3 by 4 array contains 12 elements arranged in 3 rows and 4 columns.",
    "subterms": []
  },
  {
    "id": "term_18",
    "en": "Ascending order",
    "vi": "Thứ tự tăng dần",
    "category": "general",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/əˈsendɪŋ ˈɔːdə/",
    "example": "The sequence 2, 5, 9, 14 is arranged in ascending order.",
    "subterms": []
  },
  {
    "id": "term_19",
    "en": "Assign",
    "vi": "Gán",
    "category": "general",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/əˈsaɪn/",
    "example": "We assign the value x = 3 to the variable.",
    "subterms": []
  },
  {
    "id": "term_20",
    "en": "Associative",
    "vi": "Tính chất kết hợp",
    "category": "general",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/əˈsəʊʃiətɪv/",
    "example": "Addition is associative: (a + b) + c = a + (b + c).",
    "subterms": []
  },
  {
    "id": "term_21",
    "en": "Assume",
    "vi": "Giả sử",
    "category": "general",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/əˈsjuːm/",
    "example": "Assume for contradiction that sqrt(2) is a rational number.",
    "subterms": []
  },
  {
    "id": "term_22",
    "en": "Assumption",
    "vi": "Giả thiết",
    "category": "general",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/əˈsʌmpʃn/",
    "example": "Assume for contradiction that sqrt(2) is a rational number.",
    "subterms": []
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
    "letter": "A",
    "gradeId": "grade12",
    "grade": "Lớp 12"
  },
  {
    "en": "Asymptotes (Vertical, Horizontal, Oblique)",
    "vi": "Đường tiệm cận (Tiệm cận đứng, ngang, xiên)",
    "category": "calculus",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ˈæsɪmptəʊts/",
    "example": "Lines that the curve approaches arbitrarily closely as coordinates tend to infinity or singularities.",
    "id": "term_444",
    "letter": "A",
    "subterms": []
  },
  {
    "id": "term_23",
    "en": "At most",
    "vi": "Nhiều nhất là",
    "category": "general",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/æt məʊst/",
    "example": "The polynomial has at most n distinct real roots.",
    "subterms": []
  },
  {
    "id": "term_24",
    "en": "Attack",
    "vi": "Tấn công",
    "category": "general",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/əˈtæk/",
    "example": "In standard mathematical curriculum, 'Attack' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_25",
    "en": "Attain",
    "vi": "Đạt được",
    "category": "general",
    "letter": "A",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/əˈteɪn/",
    "example": "The quadratic function attains its minimum value at the vertex.",
    "subterms": []
  },
  {
    "id": "term_26",
    "en": "Average",
    "vi": "Trung bình cộng",
    "category": "statistics",
    "letter": "A",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈævərɪdʒ/",
    "example": "The average of 10, 20, and 30 is (10 + 20 + 30) / 3 = 20.",
    "subterms": []
  },
  {
    "en": "Average (Mean)",
    "vi": "Số trung bình cộng",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈævərɪdʒ/",
    "example": "The average of 4, 6, and 8 is (4 + 6 + 8) / 3 = 6.",
    "id": "term_386",
    "letter": "A",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈæksɪs/",
    "example": "The curve is symmetric about the vertical y-axis."
  },
  {
    "id": "term_28",
    "en": "Base",
    "vi": "Đáy (tam giác, hình thang)",
    "category": "geometry",
    "letter": "B",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/beɪs/",
    "example": "The area of a triangle equals one half base times height.",
    "subterms": []
  },
  {
    "en": "Bayes' theorem",
    "vi": "Công thức Bayes và Công thức xác suất toàn phần",
    "category": "statistics",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/beɪz ˈθɪərəm/",
    "example": "Calculates posterior probability by updating prior probability with new evidence.",
    "id": "term_455",
    "letter": "B",
    "subterms": []
  },
  {
    "id": "term_29",
    "en": "Binomial",
    "vi": "Nhị thức",
    "category": "algebra",
    "letter": "B",
    "ipa": "/baɪˈnəʊmiəl/",
    "example": "A binomial is a polynomial containing exactly two terms, such as (x + y).",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "subterms": []
  },
  {
    "en": "Binomial theorem",
    "vi": "Định lý nhị thức Niu-tơn (Newton)",
    "category": "algebra",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/baɪˈnəʊmiəl ˈθɪərəm/",
    "example": "Expands powers of a binomial (a + b)^n using combinatorial coefficients.",
    "id": "term_423",
    "letter": "B",
    "subterms": []
  },
  {
    "id": "term_30",
    "en": "Bisect",
    "vi": "Chia đôi (thành hai phần bằng nhau)",
    "category": "geometry",
    "letter": "B",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/baɪˈsekt/",
    "example": "The perpendicular bisector divides a line segment into two equal halves at 90°.",
    "subterms": []
  },
  {
    "id": "term_31",
    "en": "Bisector",
    "vi": "Đường phân giác",
    "category": "geometry",
    "letter": "B",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/baɪˈsektə/",
    "example": "The perpendicular bisector divides a line segment into two equal halves at 90°.",
    "subterms": []
  },
  {
    "id": "term_32",
    "en": "Bold",
    "vi": "Đậm",
    "category": "general",
    "letter": "B",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/bəʊld/",
    "example": "Vectors are frequently printed in bold font (e.g. v).",
    "subterms": []
  },
  {
    "id": "term_33",
    "en": "Cartesian system",
    "vi": "Hệ trục tọa độ Descartes",
    "category": "geometry",
    "letter": "C",
    "ipa": "/kɑːˈtiːziən ˈsɪstəm/",
    "example": "The Cartesian coordinate system uses perpendicular x and y axes.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_34",
    "en": "Center",
    "vi": "Tâm (đường tròn)",
    "category": "geometry",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsentə/",
    "example": "The central angle has its vertex at the center of the circle.",
    "subterms": []
  },
  {
    "id": "term_37",
    "en": "Centimetre",
    "vi": "Xăng ti mét",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsentɪmiːtə/",
    "example": "One metre contains exactly 100 centimetres.",
    "subterms": []
  },
  {
    "id": "term_35",
    "en": "Central",
    "vi": "Ở giữa, trung tâm",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsentrəl/",
    "example": "The central angle has its vertex at the center of the circle.",
    "subterms": []
  },
  {
    "en": "Central angle",
    "vi": "Góc ở tâm",
    "category": "geometry",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsentrəl ˈæŋɡl/",
    "example": "The measure of a central angle equals the degree measure of its intercepted arc.",
    "id": "term_406",
    "letter": "C",
    "subterms": []
  },
  {
    "id": "term_36",
    "en": "Centroid",
    "vi": "Trọng tâm (của tam giác)",
    "category": "geometry",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsentrɔɪd/",
    "example": "The centroid of a triangle divides each median in the ratio 2:1.",
    "subterms": []
  },
  {
    "en": "Chain rule",
    "vi": "Quy tắc đạo hàm hàm hợp (y'_x = y'_u * u'_x)",
    "category": "calculus",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/tʃeɪn ruːl/",
    "example": "Differentiating composite function: [f(g(x))]' = f'(g(x)) * g'(x).",
    "id": "term_436",
    "letter": "C",
    "subterms": []
  },
  {
    "id": "term_38",
    "en": "Change",
    "vi": "Sự thay đổi, sự biến đổi",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/tʃeɪndʒ/",
    "example": "The derivative represents the instantaneous rate of change of y with respect to x.",
    "subterms": []
  },
  {
    "id": "term_39",
    "en": "Chessboard",
    "vi": "Bàn cờ",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈtʃesbɔːd/",
    "example": "A standard chessboard has 64 unit squares arranged in an 8 by 8 grid.",
    "subterms": []
  },
  {
    "id": "term_40",
    "en": "Choice",
    "vi": "Sự lựa chọn",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/tʃɔɪs/",
    "example": "There are 10 choices for the first digit and 9 choices for the second digit.",
    "subterms": []
  },
  {
    "id": "term_41",
    "en": "Chord",
    "vi": "Dây cung",
    "category": "geometry",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kɔːd/",
    "example": "The diameter is the longest chord of a circle.",
    "subterms": []
  },
  {
    "id": "term_42",
    "en": "Circle",
    "vi": "Đường tròn",
    "category": "geometry",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsɜːkl/",
    "example": "A circle is the locus of points equidistant from a fixed center.",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsɜːkjələ/",
    "example": "In standard mathematical curriculum, 'Circular' is used to analyze properties and solve equations in general."
  },
  {
    "id": "term_44",
    "en": "Circumcircle",
    "vi": "Đường tròn ngoại tiếp",
    "category": "geometry",
    "letter": "C",
    "ipa": "/ˈsɜːkəmˌsɜːkl/",
    "example": "The circumcircle passes through all three vertices of the triangle.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_45",
    "en": "Circumference",
    "vi": "Chu vi đường tròn",
    "category": "geometry",
    "letter": "C",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/səˈkʌmfərəns/",
    "example": "The circumference of a circle with radius r is C = 2*pi*r.",
    "subterms": []
  },
  {
    "id": "term_46",
    "en": "Coefficient",
    "vi": "Hệ số",
    "category": "algebra",
    "letter": "C",
    "ipa": "/ˌkəʊɪˈfɪʃnt/",
    "example": "In the quadratic 3x^2, the coefficient of x^2 is 3.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "en": "Collinear vectors",
    "vi": "Hai véc-tơ cùng phương",
    "category": "geometry",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/kəʊˈlɪniə ˈvektəz/",
    "example": "Two vectors are collinear if one is a scalar multiple of the other: u = k*v.",
    "id": "term_419",
    "letter": "C",
    "subterms": []
  },
  {
    "id": "term_47",
    "en": "Combination",
    "vi": "Tổ hợp",
    "category": "statistics",
    "letter": "C",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˌkɒmbɪˈneɪʃn/",
    "example": "The number of combinations of choosing 3 items from 5 is C(5, 3) = 10.",
    "subterms": []
  },
  {
    "id": "term_48",
    "en": "Common",
    "vi": "Chung, thông thường",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈkɒmən/",
    "example": "The greatest common divisor of 12 and 18 is 6.",
    "subterms": []
  },
  {
    "id": "term_49",
    "en": "Common difference",
    "vi": "Công sai",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈkɒmən ˈdɪfrəns/",
    "example": "In the arithmetic sequence 3, 7, 11, 15, the common difference is d = 4.",
    "subterms": []
  },
  {
    "id": "term_50",
    "en": "Complement",
    "vi": "Phần bù",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈkɒmplɪmənt/",
    "example": "The probability of the complement event A' is P(A') = 1 - P(A).",
    "subterms": []
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
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)"
  },
  {
    "id": "term_51",
    "en": "Composite numbers",
    "vi": "Hợp số",
    "category": "arithmetic",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈkɒmpəzɪt ˈnʌmbəz/",
    "example": "12 is a composite number because it has positive divisors other than 1 and 12.",
    "subterms": []
  },
  {
    "id": "term_52",
    "en": "Comprise",
    "vi": "Gồm có, bao gồm",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kəmˈpraɪz/",
    "example": "The real numbers comprise both rational and irrational numbers.",
    "subterms": []
  },
  {
    "id": "term_53",
    "en": "Compute",
    "vi": "Tính toán, ước tính",
    "category": "arithmetic",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kəmˈpjuːt/",
    "example": "Compute the value of f(2) by substituting x = 2 into the formula.",
    "subterms": []
  },
  {
    "id": "term_54",
    "en": "Concave polygon",
    "vi": "Đa giác lõm",
    "category": "geometry",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kɒnˈkeɪv ˈpɒlɪɡən/",
    "example": "A concave polygon has at least one interior angle greater than 180 degrees.",
    "subterms": []
  },
  {
    "id": "term_55",
    "en": "Concentric circles",
    "vi": "Các đường tròn đồng tâm",
    "category": "geometry",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kənˈsentrɪk circles/",
    "example": "A circle is the locus of points equidistant from a fixed center.",
    "subterms": []
  },
  {
    "id": "term_56",
    "en": "Concurrent lines",
    "vi": "Các đường thẳng đồng quy",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kənˈkʌrənt lines/",
    "example": "The three altitudes of any triangle are concurrent at the orthocenter.",
    "subterms": []
  },
  {
    "en": "Conditional probability (P(A|B))",
    "vi": "Xác suất có điều kiện",
    "category": "statistics",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/kənˈdɪʃənl ˌprɒbəˈbɪləti/",
    "example": "P(A|B) = P(AB) / P(B), the probability of event A given that B has occurred.",
    "id": "term_454",
    "letter": "C",
    "subterms": []
  },
  {
    "id": "term_57",
    "en": "Configuration",
    "vi": "Cách bố trí, cấu hình",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kənˌfɪɡəˈreɪʃn/",
    "example": "The geometric configuration satisfies the conditions of Menelaus' theorem.",
    "subterms": []
  },
  {
    "id": "term_58",
    "en": "Congruence",
    "vi": "Đồng dư",
    "category": "arithmetic",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈkɒŋɡruəns/",
    "example": "Two triangles are congruent if all corresponding sides and angles are equal.",
    "subterms": []
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
    "example": "Two figures are congruent if they have the exact same shape and size.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)"
  },
  {
    "en": "Congruent triangles",
    "vi": "Hai tam giác bằng nhau",
    "category": "geometry",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈkɒŋɡruənt ˈtraɪæŋɡlz/",
    "example": "Triangles can be proved congruent by SSS, SAS, or ASA criteria.",
    "id": "term_403",
    "letter": "C",
    "subterms": []
  },
  {
    "en": "Conic sections (Ellipse, Hyperbola, Parabola)",
    "vi": "Ba đường cô-núc (Elip, Hypebol, Parabol)",
    "category": "geometry",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˈkɒnɪk ˈsekʃnz/",
    "example": "The canonical equation of an ellipse is x^2/a^2 + y^2/b^2 = 1.",
    "subterms": [
      {
        "en": "Focal length",
        "vi": "Tiêu cự (2c)"
      },
      {
        "en": "Major axis / Minor axis",
        "vi": "Trục lớn / Trục nhỏ của Elip"
      },
      {
        "en": "Eccentricity",
        "vi": "Tâm sai (e = c/a)"
      }
    ],
    "id": "term_421",
    "letter": "C"
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kənˈsekjətɪv/",
    "example": "The sum of three consecutive integers n, n+1, n+2 is always divisible by 3."
  },
  {
    "id": "term_61",
    "en": "Consequence",
    "vi": "Hệ quả",
    "category": "general",
    "letter": "C",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˈkɒnsɪkwəns/",
    "example": "Since triangle ABC is equilateral, consequently all three angles equal 60°.",
    "subterms": []
  },
  {
    "id": "term_62",
    "en": "Consequently",
    "vi": "Do đó, vì vậy",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈkɒnsɪkwəntli/",
    "example": "Since triangle ABC is equilateral, consequently all three angles equal 60°.",
    "subterms": []
  },
  {
    "id": "term_63",
    "en": "Consider",
    "vi": "Xem xét, xét",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kənˈsɪdə/",
    "example": "Consider the continuous function f(x) = x^3 - 3x on the interval [0, 2].",
    "subterms": []
  },
  {
    "id": "term_64",
    "en": "Consist of",
    "vi": "Gồm có",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kənˈsɪst of/",
    "example": "The sample space consists of all possible outcomes of the experiment.",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈkɒnstənt/",
    "example": "The derivative of any constant function is zero."
  },
  {
    "id": "term_66",
    "en": "Construction",
    "vi": "Sự xây dựng, sự dựng hình",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kənˈstrʌkʃn/",
    "example": "Construct a tangent line to the circle using only a compass and straightedge.",
    "subterms": []
  },
  {
    "id": "term_67",
    "en": "Continued fraction",
    "vi": "Liên phân số",
    "category": "arithmetic",
    "letter": "C",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/continued ˈfrækʃn/",
    "example": "The golden ratio phi has the simplest continued fraction [1; 1, 1, 1, ...].",
    "subterms": []
  },
  {
    "en": "Continuous function",
    "vi": "Hàm số liên tục",
    "category": "calculus",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/kənˈtɪnjuəs ˈfʌŋkʃn/",
    "example": "f is continuous at x0 if lim f(x) as x->x0 equals f(x0).",
    "id": "term_432",
    "letter": "C",
    "subterms": []
  },
  {
    "id": "term_68",
    "en": "Contradiction",
    "vi": "Sự mâu thuẫn",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌkɒntrəˈdɪkʃn/",
    "example": "Reaching 1 = 0 yields a contradiction, which proves the original claim.",
    "subterms": []
  },
  {
    "id": "term_70",
    "en": "Conversely",
    "vi": "Ngược lại",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/conversely/",
    "example": "If a triangle is equilateral, it is equiangular; conversely, if it is equiangular, it is equilateral.",
    "subterms": []
  },
  {
    "id": "term_69",
    "en": "Convex polygon",
    "vi": "Đa giác lồi",
    "category": "geometry",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈkɒnveks ˈpɒlɪɡən/",
    "example": "A polygon is convex if any line segment between two interior points lies entirely inside.",
    "subterms": []
  },
  {
    "id": "term_71",
    "en": "Coordinates",
    "vi": "Tọa độ",
    "category": "geometry",
    "letter": "C",
    "ipa": "/kəʊˈɔːdɪnəts/",
    "example": "Point P has Cartesian coordinates (3, 4).",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_72",
    "en": "Coprime",
    "vi": "Nguyên tố cùng nhau",
    "category": "arithmetic",
    "letter": "C",
    "ipa": "/kəʊˈpraɪm/",
    "example": "Numbers 8 and 9 are coprime because their greatest common divisor is 1.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_73",
    "en": "Correspondence",
    "vi": "Phép tương ứng",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌkɒrɪˈspɒndəns/",
    "example": "In standard mathematical curriculum, 'Correspondence' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_75",
    "en": "Corresponding angles",
    "vi": "Các góc tương ứng",
    "category": "geometry",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌkɒrɪˈspɒndɪŋ ˈæŋɡlz/",
    "example": "In standard mathematical curriculum, 'Corresponding angles' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_74",
    "en": "Corresponding sides",
    "vi": "Các cạnh tương ứng",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌkɒrɪˈspɒndɪŋ sides/",
    "example": "In standard mathematical curriculum, 'Corresponding sides' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_76",
    "en": "Counting numbers",
    "vi": "Số đếm 1, 2, 3, …",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈkaʊntɪŋ ˈnʌmbəz/",
    "example": "In standard mathematical curriculum, 'Counting numbers' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_373",
    "en": "Cross product",
    "vi": "Tích có hướng của hai véc-tơ",
    "category": "geometry",
    "ipa": "/krɒs ˈprɒdʌkt/",
    "example": "The cross product produces a vector perpendicular to both operand vectors.",
    "subterms": [],
    "letter": "C",
    "gradeId": "grade12",
    "grade": "Lớp 12"
  },
  {
    "id": "term_77",
    "en": "Cross-section",
    "vi": "Mặt cắt",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/cross-section/",
    "example": "A cross-section parallel to the base of a cylinder is a circle.",
    "subterms": []
  },
  {
    "id": "term_78",
    "en": "Cube",
    "vi": "Hình lập phương",
    "category": "geometry",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kjuːb/",
    "example": "A cube with edge length s has volume V = s^3 and surface area A = 6*s^2.",
    "subterms": []
  },
  {
    "en": "Cube root",
    "vi": "Căn bậc ba",
    "category": "algebra",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kjuːb ruːt/",
    "example": "The cube root of 27 is 3, because 3^3 = 27.",
    "id": "term_392",
    "letter": "C",
    "subterms": []
  },
  {
    "id": "term_79",
    "en": "Cuboid",
    "vi": "Hình khối",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈkjuːbɔɪd/",
    "example": "In standard mathematical curriculum, 'Cuboid' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_80",
    "en": "Curved surface area",
    "vi": "Diện tích mặt cong",
    "category": "general",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kɜːvd ˈsɜːfɪs ˈeəriə/",
    "example": "In standard mathematical curriculum, 'Curved surface area' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_81",
    "en": "Cyclic polygon",
    "vi": "Đa giác nội tiếp đường tròn",
    "category": "geometry",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsaɪklɪk ˈpɒlɪɡən/",
    "example": "In standard mathematical curriculum, 'Cyclic polygon' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_82",
    "en": "Cylinder",
    "vi": "Hình trụ tròn",
    "category": "geometry",
    "letter": "C",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsɪlɪndə/",
    "example": "In standard mathematical curriculum, 'Cylinder' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "en": "Cylinder, Cone, Sphere",
    "vi": "Hình trụ, Hình nón, Hình cầu",
    "category": "geometry",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsɪlɪndə, kəʊn, sfɪə/",
    "example": "Key 3D curved solids studied in Grade 9 geometry.",
    "id": "term_407",
    "letter": "C",
    "subterms": []
  },
  {
    "id": "term_83",
    "en": "Decimal",
    "vi": "Số thập phân",
    "category": "arithmetic",
    "letter": "D",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈdesɪml/",
    "example": "The fraction 3/4 can be written as the terminating decimal 0.75.",
    "subterms": []
  },
  {
    "en": "Decimal number",
    "vi": "Số thập phân",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈdesɪml ˈnʌmbə/",
    "example": "A decimal uses a decimal point to separate the whole number part from fractional parts (e.g. 3.14).",
    "id": "term_383",
    "letter": "D",
    "subterms": []
  },
  {
    "id": "term_84",
    "en": "Decompose",
    "vi": "Phân tích ra thừa số",
    "category": "arithmetic",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌdiːkəmˈpəʊz/",
    "example": "In standard mathematical curriculum, 'Decompose' is used to analyze properties and solve equations in arithmetic.",
    "subterms": []
  },
  {
    "id": "term_85",
    "en": "Decrease",
    "vi": "Giảm",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/dɪˈkriːs/",
    "example": "A function is strictly decreasing when f'(x) < 0 for all x in the interval.",
    "subterms": []
  },
  {
    "id": "term_86",
    "en": "Decreasing order",
    "vi": "Thứ tự giảm dần",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/dɪˈkriːsɪŋ ˈɔːdə/",
    "example": "A function is strictly decreasing when f'(x) < 0 for all x in the interval.",
    "subterms": []
  },
  {
    "id": "term_87",
    "en": "Deduce",
    "vi": "Suy ra, luận ra",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/dɪˈdjuːs/",
    "example": "In standard mathematical curriculum, 'Deduce' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_88",
    "en": "Deduct",
    "vi": "Trừ đi, khấu trừ",
    "category": "general",
    "letter": "D",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/deduct/",
    "example": "In standard mathematical curriculum, 'Deduct' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_89",
    "en": "Define",
    "vi": "Định nghĩa",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/define/",
    "example": "In standard mathematical curriculum, 'Define' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Definite integral",
    "vi": "Tích phân xác định (tích phân từ a đến b)",
    "category": "calculus",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ˈdefɪnət ˈɪntɪɡrəl/",
    "example": "Evaluated by Newton-Leibniz formula: integral_a^b f(x)dx = F(b) - F(a).",
    "id": "term_446",
    "letter": "D",
    "subterms": []
  },
  {
    "id": "term_90",
    "en": "Degree",
    "vi": "Độ (số đo của góc)",
    "category": "geometry",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/dɪˈɡriː/",
    "example": "The degree of the polynomial P(x) = 4x^5 - 2x + 1 is 5.",
    "subterms": []
  },
  {
    "id": "term_91",
    "en": "Denominator",
    "vi": "Mẫu số",
    "category": "statistics",
    "letter": "D",
    "ipa": "/dɪˈnɒmɪneɪtə/",
    "example": "In the fraction 3/4, 4 is the denominator.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_92",
    "en": "Depend",
    "vi": "Phụ thuộc",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/depend/",
    "example": "In standard mathematical curriculum, 'Depend' is used to analyze properties and solve equations in general.",
    "subterms": []
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
    "letter": "D",
    "gradeId": "grade11",
    "grade": "Lớp 11"
  },
  {
    "id": "term_93",
    "en": "Descending order",
    "vi": "Thứ tự giảm dần",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/dɪˈsendɪŋ ˈɔːdə/",
    "example": "In standard mathematical curriculum, 'Descending order' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_94",
    "en": "Diagonal",
    "vi": "Đường chéo",
    "category": "general",
    "letter": "D",
    "ipa": "/daɪˈæɡənl/",
    "example": "A square has two equal diagonals intersecting at right angles.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_95",
    "en": "Diameter",
    "vi": "Đường kình",
    "category": "geometry",
    "letter": "D",
    "ipa": "/daɪˈæmɪtə/",
    "example": "The diameter of a circle is twice its radius.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_96",
    "en": "Difference",
    "vi": "Hiệu",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈdɪfrəns/",
    "example": "The difference between 15 and 7 is 8 (15 - 7 = 8).",
    "subterms": []
  },
  {
    "id": "term_97",
    "en": "Digit",
    "vi": "Chữ số",
    "category": "arithmetic",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈdɪdʒɪt/",
    "example": "A four-digit integer cannot have 0 as its first digit.",
    "subterms": []
  },
  {
    "en": "Dihedral angle",
    "vi": "Góc nhị diện (góc giữa hai nửa mặt phẳng)",
    "category": "geometry",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/daɪˈhiːdrəl ˈæŋɡl/",
    "example": "The angle formed by two intersecting half-planes sharing a common edge.",
    "id": "term_439",
    "letter": "D",
    "subterms": []
  },
  {
    "id": "term_98",
    "en": "Dimension",
    "vi": "Kích thước, chiều không gian",
    "category": "arithmetic",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/daɪˈmenʃn/",
    "example": "A line has dimension 1, a plane has dimension 2, and physical space has dimension 3.",
    "subterms": []
  },
  {
    "id": "term_100",
    "en": "Direct proportion",
    "vi": "Tỉ lệ thuận",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/dəˈrekt prəˈpɔːʃn/",
    "example": "In direct proportion, y = k*x for some non-zero constant of proportionality k.",
    "subterms": []
  },
  {
    "id": "term_99",
    "en": "Direction",
    "vi": "Hướng",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/dəˈrekʃn/",
    "example": "In standard mathematical curriculum, 'Direction' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Direction vector & Normal vector",
    "vi": "Véc-tơ chỉ phương & Véc-tơ pháp tuyến của đường thẳng",
    "category": "geometry",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/daɪˈrekʃn ˈvektə & ˈnɔːml ˈvektə/",
    "example": "A normal vector n(A, B) is perpendicular to the direction vector u(-B, A).",
    "id": "term_420",
    "letter": "D",
    "subterms": []
  },
  {
    "id": "term_101",
    "en": "Distance",
    "vi": "Khoảng cách",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈdɪstəns/",
    "example": "The distance between (x1, y1) and (x2, y2) is sqrt((x2 - x1)^2 + (y2 - y1)^2).",
    "subterms": []
  },
  {
    "id": "term_102",
    "en": "Distinct",
    "vi": "Khác nhau, phân biệt",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/dɪˈstɪŋkt/",
    "example": "The quadratic equation has two distinct real roots when Delta > 0.",
    "subterms": []
  },
  {
    "id": "term_103",
    "en": "Distribute",
    "vi": "Phân chia, xếp (đồ vào túi, vào hộp…)",
    "category": "general",
    "letter": "D",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/dɪˈstrɪbjuːt/",
    "example": "Distribute 10 identical balls into 3 distinct boxes using stars and bars.",
    "subterms": []
  },
  {
    "id": "term_105",
    "en": "Divide (division)",
    "vi": "Chia (phép chia)",
    "category": "general",
    "letter": "D",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/dɪˈvaɪd/",
    "example": "In standard mathematical curriculum, 'Divide (division)' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_104",
    "en": "Dividend",
    "vi": "Số bị chia",
    "category": "general",
    "letter": "D",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈdɪvɪdend/",
    "example": "Dividend = Divisor * Quotient + Remainder.",
    "subterms": []
  },
  {
    "id": "term_106",
    "en": "Divisible",
    "vi": "Chia hết",
    "category": "arithmetic",
    "letter": "D",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/dɪˈvɪzəbl/",
    "example": "An integer is divisible by 3 if the sum of its digits is divisible by 3.",
    "subterms": []
  },
  {
    "en": "Division",
    "vi": "Phép chia",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/dɪˈvɪʒn/",
    "example": "Division splits a number into equal parts (e.g. 20 ÷ 4 = 5).",
    "id": "term_376",
    "letter": "D",
    "subterms": []
  },
  {
    "id": "term_107",
    "en": "Divisor",
    "vi": "Ước số",
    "category": "arithmetic",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/dɪˈvaɪzə/",
    "example": "The positive divisors of 6 are 1, 2, 3, and 6.",
    "subterms": []
  },
  {
    "id": "term_365",
    "en": "Domain and Range",
    "vi": "Tập xác định và Tập giá trị",
    "category": "algebra",
    "ipa": "/dəʊˈmeɪn ænd reɪndʒ/",
    "example": "The domain is the set of valid inputs; the range is the set of possible outputs.",
    "subterms": [],
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)"
  },
  {
    "id": "term_372",
    "en": "Dot product",
    "vi": "Tích vô hướng của hai véc-tơ",
    "category": "geometry",
    "ipa": "/dɒt ˈprɒdʌkt/",
    "example": "The dot product of two perpendicular vectors is equal to zero (u . v = 0).",
    "subterms": [],
    "letter": "D",
    "gradeId": "grade10",
    "grade": "Lớp 10"
  },
  {
    "id": "term_108",
    "en": "Double",
    "vi": "Gấp đôi",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈdʌbl/",
    "example": "Doubling the radius of a circle quadruples its area.",
    "subterms": []
  },
  {
    "id": "term_109",
    "en": "Dozen",
    "vi": "Một tá (12 chiếc/cái)",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈdʌzn/",
    "example": "One dozen items means a group of 12 items.",
    "subterms": []
  },
  {
    "id": "term_110",
    "en": "Draw",
    "vi": "Vẽ, hòa (một trận đấu)",
    "category": "general",
    "letter": "D",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/drɔː/",
    "example": "In standard mathematical curriculum, 'Draw' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_111",
    "en": "Edge",
    "vi": "Cạnh (của đa giác)",
    "category": "geometry",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/edʒ/",
    "example": "Euler's formula states V - E + F = 2 for any convex polyhedron.",
    "subterms": []
  },
  {
    "id": "term_112",
    "en": "Element",
    "vi": "Phần tử (của tập hợp)",
    "category": "general",
    "letter": "E",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˈelɪmənt/",
    "example": "3 is an element of the set of odd primes (3 in P).",
    "subterms": []
  },
  {
    "id": "term_113",
    "en": "Elevation",
    "vi": "Sự ngước lên, độ cao",
    "category": "arithmetic",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/elevation/",
    "example": "In standard mathematical curriculum, 'Elevation' is used to analyze properties and solve equations in arithmetic.",
    "subterms": []
  },
  {
    "id": "term_114",
    "en": "Empty set",
    "vi": "Tập rỗng",
    "category": "general",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/empty set/",
    "example": "The empty set contains no elements, denoted by symbol ∅.",
    "subterms": []
  },
  {
    "id": "term_115",
    "en": "Endpoint",
    "vi": "Điểm mút",
    "category": "general",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈendpɔɪnt/",
    "example": "In standard mathematical curriculum, 'Endpoint' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_116",
    "en": "Enlargement factor",
    "vi": "Tỉ số đồng dạng",
    "category": "general",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/enlargement ˈfæktə/",
    "example": "5! = 5 * 4 * 3 * 2 * 1 = 120.",
    "subterms": []
  },
  {
    "id": "term_117",
    "en": "Ensure",
    "vi": "Đảm bảo, chắc chắn rằng",
    "category": "general",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ensure/",
    "example": "In standard mathematical curriculum, 'Ensure' is used to analyze properties and solve equations in general.",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈiːkwəl/",
    "example": "In standard mathematical curriculum, 'Equal' is used to analyze properties and solve equations in general."
  },
  {
    "id": "term_119",
    "en": "Equation",
    "vi": "Phương trình",
    "category": "algebra",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɪˈkweɪʒn/",
    "example": "The quadratic equation x^2 - 5x + 6 = 0 has roots x = 2 and x = 3.",
    "subterms": []
  },
  {
    "en": "Equation of a sphere",
    "vi": "Phương trình mặt cầu ((x-a)^2 + (y-b)^2 + (z-c)^2 = R^2)",
    "category": "geometry",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ɪˈkweɪʒn əv ə sfɪə/",
    "example": "Represents all points equidistant from center I(a, b, c) by radius R.",
    "id": "term_451",
    "letter": "E",
    "subterms": []
  },
  {
    "id": "term_120",
    "en": "Equilateral triangle",
    "vi": "Tam giác đều",
    "category": "geometry",
    "letter": "E",
    "ipa": "/ˌiːkwɪˈlætərəl ˈtraɪæŋɡl/",
    "example": "All three interior angles of an equilateral triangle equal 60 degrees.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_121",
    "en": "Evaluate",
    "vi": "Tính",
    "category": "general",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɪˈvæljueɪt/",
    "example": "Evaluate the expression 2x^2 - 3x when x = 4.",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈiːvn/",
    "example": "Any even integer can be expressed in the form 2k, where k is an integer."
  },
  {
    "en": "Even number",
    "vi": "Số chẵn",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈiːvn ˈnʌmbə/",
    "example": "An even number ends in 0, 2, 4, 6, or 8 and is divisible by 2.",
    "id": "term_379",
    "letter": "E",
    "subterms": []
  },
  {
    "id": "term_123",
    "en": "Exactly",
    "vi": "Chính xác, đúng đắn",
    "category": "general",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/exactly/",
    "example": "In standard mathematical curriculum, 'Exactly' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Exponential function (y = a^x)",
    "vi": "Hàm số mũ",
    "category": "algebra",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˌekspəˈnenʃl ˈfʌŋkʃn/",
    "example": "y = a^x has domain R, range (0, +infinity), always passes through (0, 1).",
    "id": "term_434",
    "letter": "E",
    "subterms": []
  },
  {
    "id": "term_124",
    "en": "Expression",
    "vi": "Biểu thức",
    "category": "algebra",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɪkˈspreʃn/",
    "example": "In standard mathematical curriculum, 'Expression' is used to analyze properties and solve equations in algebra.",
    "subterms": []
  },
  {
    "id": "term_127",
    "en": "Exterior angle",
    "vi": "Góc ngoài (của tam giác)",
    "category": "geometry",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/exterior ˈæŋɡl/",
    "example": "In standard mathematical curriculum, 'Exterior angle' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_125",
    "en": "External",
    "vi": "Bên ngoài",
    "category": "general",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/external/",
    "example": "In standard mathematical curriculum, 'External' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_126",
    "en": "Externally tangent",
    "vi": "Tiếp xúc ngoài",
    "category": "geometry",
    "letter": "E",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/externally ˈtændʒənt/",
    "example": "A tangent line touches a curve at a single point without crossing it locally.",
    "subterms": []
  },
  {
    "en": "Extrema of a function",
    "vi": "Cực trị của hàm số (Cực đại & Cực tiểu)",
    "category": "calculus",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ɪkˈstriːmə əv ə ˈfʌŋkʃn/",
    "example": "Local maximum and minimum points where f'(x) changes sign.",
    "id": "term_442",
    "letter": "E",
    "subterms": []
  },
  {
    "id": "term_128",
    "en": "Factor",
    "vi": "Ước số",
    "category": "arithmetic",
    "letter": "F",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈfæktə/",
    "example": "5! = 5 * 4 * 3 * 2 * 1 = 120.",
    "subterms": []
  },
  {
    "id": "term_129",
    "en": "Factorial",
    "vi": "Giai thừa",
    "category": "general",
    "letter": "F",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/fækˈtɔːriəl/",
    "example": "5! = 5 * 4 * 3 * 2 * 1 = 120.",
    "subterms": []
  },
  {
    "id": "term_130",
    "en": "Figure",
    "vi": "Hình vẽ",
    "category": "general",
    "letter": "F",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈfɪɡə/",
    "example": "In standard mathematical curriculum, 'Figure' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_131",
    "en": "Fill",
    "vi": "Điền vào",
    "category": "general",
    "letter": "F",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/fill/",
    "example": "In standard mathematical curriculum, 'Fill' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_132",
    "en": "Flag",
    "vi": "Lá cờ",
    "category": "general",
    "letter": "F",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/flag/",
    "example": "In standard mathematical curriculum, 'Flag' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_133",
    "en": "Fold",
    "vi": "Gấp (giấy)",
    "category": "general",
    "letter": "F",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/fold/",
    "example": "In standard mathematical curriculum, 'Fold' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_134",
    "en": "Formula",
    "vi": "Công thức",
    "category": "general",
    "letter": "F",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈfɔːmjələ/",
    "example": "In standard mathematical curriculum, 'Formula' is used to analyze properties and solve equations in general.",
    "subterms": []
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
    ],
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈfrækʃn/",
    "example": "An improper fraction has a numerator greater than or equal to its denominator."
  },
  {
    "id": "term_136",
    "en": "Frame",
    "vi": "Khung",
    "category": "general",
    "letter": "F",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/frame/",
    "example": "In standard mathematical curriculum, 'Frame' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_137",
    "en": "Frequency",
    "vi": "Tần số",
    "category": "statistics",
    "letter": "F",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈfriːkwənsi/",
    "example": "The frequency table shows how often each test score occurred.",
    "subterms": []
  },
  {
    "id": "term_138",
    "en": "Frustrum",
    "vi": "Hình nón cụt",
    "category": "general",
    "letter": "F",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/frustrum/",
    "example": "In standard mathematical curriculum, 'Frustrum' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_139",
    "en": "Function",
    "vi": "Hàm số",
    "category": "algebra",
    "letter": "F",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈfʌŋkʃn/",
    "example": "A function assigns each input in the domain to exactly one output in the range.",
    "subterms": []
  },
  {
    "en": "General equation of a plane",
    "vi": "Phương trình tổng quát của mặt phẳng (Ax + By + Cz + D = 0)",
    "category": "geometry",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ˈdʒenrəl ɪˈkweɪʒn əv ə pleɪn/",
    "example": "Defined by normal vector n(A, B, C) perpendicular to the plane.",
    "id": "term_452",
    "letter": "G",
    "subterms": []
  },
  {
    "id": "term_140",
    "en": "Generate",
    "vi": "Tạo ra",
    "category": "general",
    "letter": "G",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈdʒenəreɪt/",
    "example": "In standard mathematical curriculum, 'Generate' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Geometric progression (GP)",
    "vi": "Cấp số nhân (u_n = u_1 * q^(n-1))",
    "category": "algebra",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˌdʒiːəˈmetrɪk prəˈɡreʃn/",
    "example": "For the geometric progression 2, 6, 18, 54, ..., the first term is u1 = 2 and the common ratio is q = 3.",
    "id": "term_429",
    "letter": "G",
    "subterms": [
      {
        "en": "Geometric sequence",
        "vi": "Dãy số cấp số nhân"
      },
      {
        "en": "Common ratio (q)",
        "vi": "Công bội (q)"
      },
      {
        "en": "Sum of first n terms",
        "vi": "Tổng n số hạng đầu của cấp số nhân"
      }
    ]
  },
  {
    "en": "Global maximum and minimum",
    "vi": "Giá trị lớn nhất (GTLN) và Giá trị nhỏ nhất (GTNN)",
    "category": "calculus",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ˈɡləʊbl ˈmæksɪməm ænd ˈmɪnɪməm/",
    "example": "Max and min values of a continuous function on a closed interval [a, b].",
    "id": "term_443",
    "letter": "G",
    "subterms": []
  },
  {
    "id": "term_141",
    "en": "Gradient",
    "vi": "Hệ số góc",
    "category": "geometry",
    "letter": "G",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈɡreɪdiənt/",
    "example": "The gradient of the tangent line equals the first derivative of the curve.",
    "subterms": []
  },
  {
    "en": "Greater than (>)",
    "vi": "Lớn hơn (>)",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈɡreɪtə ðæn/",
    "example": "8 is greater than 5, written as 8 > 5.",
    "id": "term_381",
    "letter": "G",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈɡreɪtɪst/",
    "example": "In standard mathematical curriculum, 'Greatest' is used to analyze properties and solve equations in general."
  },
  {
    "en": "Grouped data variance & standard deviation",
    "vi": "Phương sai và độ lệch chuẩn của mẫu số liệu ghép nhóm",
    "category": "statistics",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ɡruːpt ˈdeɪtə ˈveəriəns/",
    "example": "Measures spread for binned numerical data in Grade 12 statistics.",
    "id": "term_456",
    "letter": "G",
    "subterms": []
  },
  {
    "id": "term_143",
    "en": "Height",
    "vi": "Chiều cao",
    "category": "general",
    "letter": "H",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/haɪt/",
    "example": "The height of the cylinder is 10 cm and its base radius is 3 cm.",
    "subterms": []
  },
  {
    "id": "term_144",
    "en": "Hemisphere",
    "vi": "Bán cầu",
    "category": "geometry",
    "letter": "H",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ˈhemɪsfɪə/",
    "example": "The surface area of a sphere of radius r is 4 * pi * r^2.",
    "subterms": []
  },
  {
    "id": "term_145",
    "en": "Hence",
    "vi": "Suy ra",
    "category": "general",
    "letter": "H",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/hence/",
    "example": "In standard mathematical curriculum, 'Hence' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_146",
    "en": "Heptagon",
    "vi": "Hình thất giác",
    "category": "general",
    "letter": "H",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈheptəɡən/",
    "example": "In standard mathematical curriculum, 'Heptagon' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Heron's formula",
    "vi": "Công thức Hê-rông tính diện tích tam giác",
    "category": "geometry",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˈherənz ˈfɔːmjələ/",
    "example": "S = sqrt(p(p-a)(p-b)(p-c)), where p is the semi-perimeter.",
    "id": "term_417",
    "letter": "H",
    "subterms": []
  },
  {
    "id": "term_147",
    "en": "Hexagon",
    "vi": "Hình lục giác",
    "category": "general",
    "letter": "H",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈheksəɡən/",
    "example": "A regular hexagon can be partitioned into six congruent equilateral triangles.",
    "subterms": []
  },
  {
    "id": "term_148",
    "en": "Hold",
    "vi": "Đúng, có hiệu lực",
    "category": "general",
    "letter": "H",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/hold/",
    "example": "In standard mathematical curriculum, 'Hold' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_149",
    "en": "Horizontal",
    "vi": "Phương ngang",
    "category": "general",
    "letter": "H",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌhɒrɪˈzɒntl/",
    "example": "In standard mathematical curriculum, 'Horizontal' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_150",
    "en": "Hypotenuse",
    "vi": "Cạnh huyền",
    "category": "geometry",
    "letter": "H",
    "ipa": "/haɪˈpɒtənjuːz/",
    "example": "The hypotenuse is the longest side of a right-angled triangle, opposite the right angle.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_151",
    "en": "Identical",
    "vi": "Giống nhau, bằng nhau",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/aɪˈdentɪkl/",
    "example": "In standard mathematical curriculum, 'Identical' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_152",
    "en": "Identity",
    "vi": "Đẳng thức",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/aɪˈdentəti/",
    "example": "sin^2(x) + cos^2(x) = 1 is an identity holding true for all real values of x.",
    "subterms": []
  },
  {
    "id": "term_153",
    "en": "Imply",
    "vi": "Cho thấy, dẫn đến, kéo theo",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɪmˈplaɪ/",
    "example": "Statement A implies statement B (written as A => B).",
    "subterms": []
  },
  {
    "id": "term_165",
    "en": "In terms of",
    "vi": "Theo, qua",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/in tɜːmz of/",
    "example": "In the polynomial 3x^2 + 5x - 7, there are three terms: 3x^2, 5x, and -7.",
    "subterms": []
  },
  {
    "id": "term_168",
    "en": "In the form",
    "vi": "Dưới dạng",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/in the form/",
    "example": "In standard mathematical curriculum, 'In the form' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_156",
    "en": "Incircle",
    "vi": "Đường tròn nội tiếp",
    "category": "geometry",
    "letter": "I",
    "ipa": "/ˈɪnˌsɜːkl/",
    "example": "The incircle is tangent to all three sides of a triangle.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_157",
    "en": "Increase",
    "vi": "Tăng",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɪnˈkriːs/",
    "example": "In standard mathematical curriculum, 'Increase' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_158",
    "en": "Increasing order",
    "vi": "Thứ tự tăng dần",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɪnˈkriːsɪŋ ˈɔːdə/",
    "example": "In standard mathematical curriculum, 'Increasing order' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_159",
    "en": "Indefinitely",
    "vi": "Vô hạn",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/indefinitely/",
    "example": "In standard mathematical curriculum, 'Indefinitely' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Independent events",
    "vi": "Hai biến cố độc lập (P(AB) = P(A) * P(B))",
    "category": "statistics",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˌɪndɪˈpendənt ɪˈvents/",
    "example": "Occurrence of one event does not affect the probability of the other.",
    "id": "term_440",
    "letter": "I",
    "subterms": []
  },
  {
    "id": "term_154",
    "en": "Induction",
    "vi": "Phép quy nạp",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɪnˈdʌkʃn/",
    "example": "Mathematical induction proves a statement for all natural numbers n >= 1.",
    "subterms": []
  },
  {
    "id": "term_155",
    "en": "Inductive",
    "vi": "Quy nạp",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɪnˈdʌktɪv/",
    "example": "In standard mathematical curriculum, 'Inductive' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_160",
    "en": "Inequality",
    "vi": "Bất đẳng thức, bất phương trình",
    "category": "algebra",
    "letter": "I",
    "ipa": "/ˌɪnɪˈkwɒləti/",
    "example": "The triangle inequality states that the sum of any two sides exceeds the third side.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_161",
    "en": "Infinite sequence",
    "vi": "Dãy vô hạn",
    "category": "general",
    "letter": "I",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˈɪnfɪnət ˈsiːkwəns/",
    "example": "An infinite sequence is a function whose domain is the set of positive integers.",
    "subterms": []
  },
  {
    "id": "term_364",
    "en": "Inflection point",
    "vi": "Điểm uốn của đồ thị",
    "category": "calculus",
    "ipa": "/ɪnˈflekʃn pɔɪnt/",
    "example": "An inflection point is a point where the concavity of a curve changes.",
    "subterms": [],
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)"
  },
  {
    "en": "Inscribed angle",
    "vi": "Góc nội tiếp đường tròn",
    "category": "geometry",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɪnˈskraɪbd ˈæŋɡl/",
    "example": "An inscribed angle is half of the central angle subtending the same arc.",
    "id": "term_405",
    "letter": "I",
    "subterms": []
  },
  {
    "en": "Inscribed quadrilateral",
    "vi": "Tứ giác nội tiếp đường tròn",
    "category": "geometry",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɪnˈskraɪbd ˌkwɒdrɪˈlætərəl/",
    "example": "In a cyclic/inscribed quadrilateral, opposite angles sum to 180 degrees.",
    "id": "term_404",
    "letter": "I",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈɪntɪdʒə/",
    "example": "The set of integers Z includes positive numbers, negative numbers, and zero."
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
    ],
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ˈɪntɪɡrəl/",
    "example": "The definite integral from 0 to 1 of x dx equals 1/2."
  },
  {
    "en": "Integration by parts",
    "vi": "Phương pháp tích phân từng phần (∫ u dv = uv - ∫ v du)",
    "category": "calculus",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ˌɪntɪˈɡreɪʃn baɪ pɑːts/",
    "example": "Used for products of polynomial, logarithmic, exponential, and trigonometric functions.",
    "id": "term_447",
    "letter": "I",
    "subterms": []
  },
  {
    "id": "term_164",
    "en": "Interior",
    "vi": "Phần trong, phía trong",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/interior/",
    "example": "In standard mathematical curriculum, 'Interior' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_166",
    "en": "Internal",
    "vi": "Bên trong",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/internal/",
    "example": "In standard mathematical curriculum, 'Internal' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Interquartile range (IQR)",
    "vi": "Khoảng tứ phân vị (Delta Q = Q3 - Q1)",
    "category": "statistics",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˌɪntəkwaɪˈtaɪl reɪndʒ/",
    "example": "The IQR measures statistical dispersion and is resistant to outliers.",
    "id": "term_424",
    "letter": "I",
    "subterms": []
  },
  {
    "id": "term_167",
    "en": "Intersection",
    "vi": "Giao điểm (của đường thẳng, đường tròn), giao (của các tập hợp)",
    "category": "geometry",
    "letter": "I",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˌɪntəˈsekʃn/",
    "example": "The intersection A ∩ B contains only elements that belong to both A and B.",
    "subterms": []
  },
  {
    "en": "Intersection and Union of sets",
    "vi": "Giao (∩) và Hợp (∪) của hai tập hợp",
    "category": "algebra",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˌɪntəˈsekʃn ænd ˈjuːniən/",
    "example": "A ∩ B contains elements in both sets; A ∪ B contains elements in either set.",
    "id": "term_412",
    "letter": "I",
    "subterms": []
  },
  {
    "en": "Intervals and Segments (R)",
    "vi": "Khoảng, đoạn, nửa khoảng trên tập số thực",
    "category": "algebra",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˈɪntəvlz ænd ˈseɡmənts/",
    "example": "Open interval (a, b), closed interval [a, b], half-open interval [a, b).",
    "id": "term_413",
    "letter": "I",
    "subterms": []
  },
  {
    "id": "term_169",
    "en": "Inverse proportion",
    "vi": "Tỉ lệ nghịch",
    "category": "general",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌɪnˈvɜːs prəˈpɔːʃn/",
    "example": "The inverse function f^(-1)(x) reflects the graph of f across the line y = x.",
    "subterms": []
  },
  {
    "id": "term_170",
    "en": "Inradius",
    "vi": "Bán kính đường tròn nội tiếp",
    "category": "geometry",
    "letter": "I",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈɪnˌreɪdiəs/",
    "example": "The area of a circle is calculated using the formula A = pi * r^2.",
    "subterms": []
  },
  {
    "en": "Irrational number",
    "vi": "Số vô tỉ (I)",
    "category": "arithmetic",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɪˈræʃnəl ˈnʌmbə/",
    "example": "An irrational number cannot be expressed as a simple fraction (e.g. pi and sqrt(2)).",
    "id": "term_389",
    "letter": "I",
    "subterms": []
  },
  {
    "id": "term_171",
    "en": "Irreducible fraction",
    "vi": "Phân số tối giản",
    "category": "arithmetic",
    "letter": "I",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˌɪrɪˈdjuːsəbl ˈfrækʃn/",
    "example": "An improper fraction has a numerator greater than or equal to its denominator.",
    "subterms": []
  },
  {
    "id": "term_172",
    "en": "Isosceles triangle",
    "vi": "Tam giác cân",
    "category": "geometry",
    "letter": "I",
    "ipa": "/aɪˈsɒsəliːz ˈtraɪæŋɡl/",
    "example": "An isosceles triangle has at least two equal sides and two equal base angles.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_173",
    "en": "Key",
    "vi": "Chìa khóa",
    "category": "general",
    "letter": "K",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/key/",
    "example": "In standard mathematical curriculum, 'Key' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_174",
    "en": "Knight",
    "vi": "Con mã (quân cờ vua)",
    "category": "general",
    "letter": "K",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/naɪt/",
    "example": "In standard mathematical curriculum, 'Knight' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_175",
    "en": "Lap",
    "vi": "Một vòng khén kín",
    "category": "general",
    "letter": "L",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/lap/",
    "example": "In standard mathematical curriculum, 'Lap' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_176",
    "en": "Largest",
    "vi": "Lớn nhất",
    "category": "general",
    "letter": "L",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/largest/",
    "example": "In standard mathematical curriculum, 'Largest' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_177",
    "en": "Last digit",
    "vi": "Chữ số tận cùng",
    "category": "arithmetic",
    "letter": "L",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/last ˈdɪdʒɪt/",
    "example": "A four-digit integer cannot have 0 as its first digit.",
    "subterms": []
  },
  {
    "en": "Law of Cosines",
    "vi": "Định lý côsin trong tam giác (a^2 = b^2 + c^2 - 2bc.cosA)",
    "category": "geometry",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/lɔː əv ˈkəʊsaɪnz/",
    "example": "Used to find the remaining side or angles in any non-right triangle.",
    "id": "term_415",
    "letter": "L",
    "subterms": []
  },
  {
    "en": "Law of Sines",
    "vi": "Định lý sin trong tam giác (a/sinA = b/sinB = c/sinC = 2R)",
    "category": "geometry",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/lɔː əv saɪnz/",
    "example": "Relates the side lengths of a triangle to the sines of its angles and circumradius R.",
    "id": "term_416",
    "letter": "L",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/liːst/",
    "example": "In standard mathematical curriculum, 'Least' is used to analyze properties and solve equations in general."
  },
  {
    "id": "term_179",
    "en": "Left hand side",
    "vi": "Vế trái",
    "category": "general",
    "letter": "L",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/left hand saɪd/",
    "example": "In standard mathematical curriculum, 'Left hand side' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_180",
    "en": "Left-most digit",
    "vi": "Chữ số đầu tiên (tính từ bên trái sang)",
    "category": "arithmetic",
    "letter": "L",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/left-most ˈdɪdʒɪt/",
    "example": "A four-digit integer cannot have 0 as its first digit.",
    "subterms": []
  },
  {
    "en": "Less than (<)",
    "vi": "Bé hơn (<)",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/les ðæn/",
    "example": "3 is less than 7, written as 3 < 7.",
    "id": "term_382",
    "letter": "L",
    "subterms": []
  },
  {
    "id": "term_181",
    "en": "Liar",
    "vi": "Người nói dối",
    "category": "general",
    "letter": "L",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/liar/",
    "example": "In standard mathematical curriculum, 'Liar' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_182",
    "en": "Lie",
    "vi": "Nằm trên",
    "category": "general",
    "letter": "L",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/lie/",
    "example": "In standard mathematical curriculum, 'Lie' is used to analyze properties and solve equations in general.",
    "subterms": []
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
    "letter": "L",
    "gradeId": "grade11",
    "grade": "Lớp 11"
  },
  {
    "en": "Limit of a function",
    "vi": "Giới hạn của hàm số (lim f(x) khi x -> x0)",
    "category": "calculus",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˈlɪmɪt əv ə ˈfʌŋkʃn/",
    "example": "The value that f(x) approaches as x gets arbitrarily close to x0.",
    "id": "term_431",
    "letter": "L",
    "subterms": []
  },
  {
    "en": "Limit of a sequence",
    "vi": "Giới hạn của dãy số (lim u_n)",
    "category": "calculus",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˈlɪmɪt əv ə ˈsiːkwəns/",
    "example": "lim (1/n) as n approaches infinity equals 0.",
    "id": "term_430",
    "letter": "L",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/laɪn/",
    "example": "In standard mathematical curriculum, 'Line' is used to analyze properties and solve equations in general."
  },
  {
    "en": "Line perpendicular to a plane",
    "vi": "Đường thẳng vuông góc với mặt phẳng (d ⊥ (P))",
    "category": "geometry",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/laɪn ˌpɜːpənˈdɪkjələ tu ə pleɪn/",
    "example": "If a line is perpendicular to two intersecting lines in a plane, it is perpendicular to the plane.",
    "id": "term_438",
    "letter": "L",
    "subterms": []
  },
  {
    "en": "Linear equation",
    "vi": "Phương trình bậc nhất một ẩn (ax + b = 0)",
    "category": "algebra",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈlɪniə ɪˈkweɪʒn/",
    "example": "A linear equation in one variable has the standard form ax + b = 0 (a != 0).",
    "id": "term_393",
    "letter": "L",
    "subterms": []
  },
  {
    "en": "Linear function",
    "vi": "Hàm số bậc nhất (y = ax + b)",
    "category": "algebra",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈlɪniə ˈfʌŋkʃn/",
    "example": "The graph of the linear function y = ax + b is a straight line with slope a.",
    "id": "term_395",
    "letter": "L",
    "subterms": []
  },
  {
    "id": "term_184",
    "en": "Linear model",
    "vi": "Mô hình tuyến tính",
    "category": "statistics",
    "letter": "L",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈlɪniə model/",
    "example": "The graph of a linear equation ax + by = c is a straight line.",
    "subterms": []
  },
  {
    "id": "term_185",
    "en": "Locus",
    "vi": "Quỹ tích",
    "category": "general",
    "letter": "L",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈləʊkəs/",
    "example": "In standard mathematical curriculum, 'Locus' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Logarithm (log, ln)",
    "vi": "Lôgarit (cơ số a, tự nhiên ln, thập phân log)",
    "category": "algebra",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˈlɒɡərɪðəm/",
    "example": "log_a(b) = c means a^c = b (a > 0, a != 1, b > 0).",
    "id": "term_433",
    "letter": "L",
    "subterms": []
  },
  {
    "id": "term_186",
    "en": "Magic square",
    "vi": "Ma phương",
    "category": "general",
    "letter": "M",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈmædʒɪk skweə/",
    "example": "A square is both a rectangle and a rhombus, having four equal sides and four right angles.",
    "subterms": []
  },
  {
    "id": "term_187",
    "en": "Major arc",
    "vi": "Cung lớn",
    "category": "geometry",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈmeɪdʒə ɑːk/",
    "example": "The length of an arc subtending central angle theta is s = r * theta.",
    "subterms": []
  },
  {
    "id": "term_188",
    "en": "Mark",
    "vi": "Đánh dấu",
    "category": "general",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/mark/",
    "example": "In standard mathematical curriculum, 'Mark' is used to analyze properties and solve equations in general.",
    "subterms": []
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
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)"
  },
  {
    "id": "term_189",
    "en": "Maximum",
    "vi": "Giá trị lớn nhất",
    "category": "general",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈmæksɪməm/",
    "example": "The parabola y = -x^2 + 4 achieves its maximum value of 4 at x = 0.",
    "subterms": []
  },
  {
    "id": "term_190",
    "en": "Mean",
    "vi": "Trung bình",
    "category": "statistics",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/miːn/",
    "example": "The sample mean is computed by dividing the sum of observations by the sample size.",
    "subterms": []
  },
  {
    "id": "term_191",
    "en": "Measure of angle",
    "vi": "Số đo góc",
    "category": "geometry",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈmeʒə of ˈæŋɡl/",
    "example": "In standard mathematical curriculum, 'Measure of angle' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_192",
    "en": "Median",
    "vi": "Trung vị (trong thống kê), đư ờng trung tuyến (của tam giác)",
    "category": "geometry",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈmiːdiən/",
    "example": "The median is the middle value in an ordered set of data.",
    "subterms": []
  },
  {
    "id": "term_194",
    "en": "Midline",
    "vi": "Đường trung bình (của tam giác, hình thang)",
    "category": "geometry",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/midline/",
    "example": "In standard mathematical curriculum, 'Midline' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_193",
    "en": "Midpoint",
    "vi": "Trung điểm",
    "category": "geometry",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈmɪdpɔɪnt/",
    "example": "The midpoint of segment AB has coordinates ((xA+xB)/2, (yA+yB)/2).",
    "subterms": []
  },
  {
    "id": "term_195",
    "en": "Minimum",
    "vi": "Giá trị nhỏ nhất",
    "category": "general",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈmɪnɪməm/",
    "example": "A function has a local minimum where its derivative changes from negative to positive.",
    "subterms": []
  },
  {
    "id": "term_196",
    "en": "Minor arc",
    "vi": "Cung nhỏ",
    "category": "geometry",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈmaɪnə ɑːk/",
    "example": "The length of an arc subtending central angle theta is s = r * theta.",
    "subterms": []
  },
  {
    "id": "term_197",
    "en": "Minus",
    "vi": "Dấu trừ",
    "category": "general",
    "letter": "M",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈmaɪnəs/",
    "example": "In standard mathematical curriculum, 'Minus' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_198",
    "en": "Mixed fraction",
    "vi": "Hỗn số",
    "category": "arithmetic",
    "letter": "M",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/mɪkst ˈfrækʃn/",
    "example": "An improper fraction has a numerator greater than or equal to its denominator.",
    "subterms": []
  },
  {
    "id": "term_199",
    "en": "Mixture",
    "vi": "Hỗn hợp",
    "category": "general",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/mixture/",
    "example": "In standard mathematical curriculum, 'Mixture' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_200",
    "en": "Mode",
    "vi": "Mốt, thế vị, đa tần (kết quả của biến cố xảy ra nhiều nhất hay phép thử xảy ra tần số cao nhất)",
    "category": "statistics",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/məʊd/",
    "example": "The mode is the value that appears most frequently in a dataset.",
    "subterms": []
  },
  {
    "id": "term_201",
    "en": "Modulo",
    "vi": "Đồng dư",
    "category": "arithmetic",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈmɒdjələʊ/",
    "example": "17 is congruent to 2 modulo 5 because 17 - 2 is a multiple of 5.",
    "subterms": []
  },
  {
    "en": "Monotonicity of functions",
    "vi": "Tính đơn điệu của hàm số (đồng biến / nghịch biến)",
    "category": "calculus",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ˌmɒnətəˈnɪsəti əv ˈfʌŋkʃnz/",
    "example": "f'(x) > 0 implies f is strictly increasing; f'(x) < 0 implies f is decreasing.",
    "id": "term_441",
    "letter": "M",
    "subterms": []
  },
  {
    "id": "term_202",
    "en": "Multiple",
    "vi": "Bội số",
    "category": "arithmetic",
    "letter": "M",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈmʌltɪpl/",
    "example": "The least common multiple of 4 and 6 is lcm(4, 6) = 12.",
    "subterms": []
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
    ],
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˌmʌltɪplɪˈkeɪʃn/",
    "example": "In standard mathematical curriculum, 'Multiplication' is used to analyze properties and solve equations in general."
  },
  {
    "en": "Multiplication table",
    "vi": "Bảng cửu chương",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˌmʌltɪplɪˈkeɪʃn ˈteɪbl/",
    "example": "Students memorize the multiplication table from 2 to 9.",
    "id": "term_377",
    "letter": "M",
    "subterms": []
  },
  {
    "id": "term_204",
    "en": "Multiply",
    "vi": "Nhân",
    "category": "general",
    "letter": "M",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈmʌltɪplaɪ/",
    "example": "In standard mathematical curriculum, 'Multiply' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_205",
    "en": "Natural numbers",
    "vi": "Số tự nhiên 1, 2, 3, …",
    "category": "general",
    "letter": "N",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈnætʃrəl ˈnʌmbəz/",
    "example": "Natural numbers N = {1, 2, 3, ...} are used for counting.",
    "subterms": []
  },
  {
    "en": "Negation of a proposition",
    "vi": "Mệnh đề phủ định (~P)",
    "category": "algebra",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/nɪˈɡeɪʃn əv ə ˌprɒpəˈzɪʃn/",
    "example": "The negation of P is false when P is true, and true when P is false.",
    "id": "term_409",
    "letter": "N",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈneɡətɪv/",
    "example": "The product of two negative real numbers is always positive."
  },
  {
    "en": "Negative integer",
    "vi": "Số nguyên âm",
    "category": "arithmetic",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈneɡətɪv ˈɪntɪdʒə/",
    "example": "Negative integers are integers less than zero, such as -1, -2, -3.",
    "id": "term_388",
    "letter": "N",
    "subterms": []
  },
  {
    "id": "term_207",
    "en": "Net",
    "vi": "Lưới (trải hình lên mặt phẳng)",
    "category": "geometry",
    "letter": "N",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/net/",
    "example": "In standard mathematical curriculum, 'Net' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_369",
    "en": "Normal distribution",
    "vi": "Phân phối chuẩn (đường cong Gauss)",
    "category": "statistics",
    "ipa": "/ˈnɔːml ˌdɪstrɪˈbjuːʃn/",
    "example": "A normal distribution is symmetric about its mean and shaped like a bell curve.",
    "subterms": [],
    "letter": "N",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)"
  },
  {
    "id": "term_208",
    "en": "Number",
    "vi": "Số",
    "category": "general",
    "letter": "N",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈnʌmbə/",
    "example": "In standard mathematical curriculum, 'Number' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Number line",
    "vi": "Tia số / Trục số",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈnʌmbə laɪn/",
    "example": "A number line displays numbers in order along a straight line.",
    "id": "term_378",
    "letter": "N",
    "subterms": []
  },
  {
    "id": "term_209",
    "en": "Numerator",
    "vi": "Tử số",
    "category": "general",
    "letter": "N",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈnjuːməreɪtə/",
    "example": "In the rational fraction 5/8, 5 is the numerator.",
    "subterms": []
  },
  {
    "id": "term_210",
    "en": "Observe",
    "vi": "Quan sát, nhận xét",
    "category": "general",
    "letter": "O",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/observe/",
    "example": "In standard mathematical curriculum, 'Observe' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_211",
    "en": "Obtuse triangle",
    "vi": "Tam giác tù",
    "category": "geometry",
    "letter": "O",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/əbˈtjuːs ˈtraɪæŋɡl/",
    "example": "An obtuse angle has a measure strictly between 90° and 180°.",
    "subterms": []
  },
  {
    "id": "term_212",
    "en": "Octagon",
    "vi": "Hình bát giác",
    "category": "general",
    "letter": "O",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈɒktəɡən/",
    "example": "A regular octagon has 8 equal sides and interior angles of 135°.",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ɒd/",
    "example": "An odd integer cannot be evenly divided by 2."
  },
  {
    "en": "Odd number",
    "vi": "Số lẻ",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ɒd ˈnʌmbə/",
    "example": "An odd number ends in 1, 3, 5, 7, or 9 and leaves a remainder of 1 when divided by 2.",
    "id": "term_380",
    "letter": "O",
    "subterms": []
  },
  {
    "id": "term_214",
    "en": "Once",
    "vi": "Một lần",
    "category": "general",
    "letter": "O",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/once/",
    "example": "In standard mathematical curriculum, 'Once' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_215",
    "en": "Operations",
    "vi": "Các phép toán (cộng, trừ, nhân, chia, …)",
    "category": "general",
    "letter": "O",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/operations/",
    "example": "In standard mathematical curriculum, 'Operations' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_216",
    "en": "Order",
    "vi": "Thứ tự",
    "category": "general",
    "letter": "O",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈɔːdə/",
    "example": "In standard mathematical curriculum, 'Order' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_217",
    "en": "Original",
    "vi": "Ban đầu",
    "category": "general",
    "letter": "O",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/original/",
    "example": "In standard mathematical curriculum, 'Original' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_218",
    "en": "Orthocenter",
    "vi": "Trực tâm",
    "category": "general",
    "letter": "O",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈɔːθəʊˌsentə/",
    "example": "The central angle has its vertex at the center of the circle.",
    "subterms": []
  },
  {
    "id": "term_219",
    "en": "Outside",
    "vi": "Bên ngoài, ở ngoài",
    "category": "general",
    "letter": "O",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/outside/",
    "example": "In standard mathematical curriculum, 'Outside' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_220",
    "en": "Pair",
    "vi": "Đôi, cặp",
    "category": "general",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/peə/",
    "example": "In standard mathematical curriculum, 'Pair' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_221",
    "en": "Pairwise",
    "vi": "Từng đôi một",
    "category": "general",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/pairwise/",
    "example": "In standard mathematical curriculum, 'Pairwise' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_222",
    "en": "Palindromic number",
    "vi": "Số viết xuôi viết ngược đều giống nhau (ví dụ 12321)",
    "category": "arithmetic",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌpælɪnˈdrɒmɪk ˈnʌmbə/",
    "example": "In standard mathematical curriculum, 'Palindromic number' is used to analyze properties and solve equations in arithmetic.",
    "subterms": []
  },
  {
    "id": "term_223",
    "en": "Parabola",
    "vi": "Đường cong parabol",
    "category": "general",
    "letter": "P",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/pəˈræbələ/",
    "example": "A parabola is the locus of points equidistant from a focus and a directrix.",
    "subterms": []
  },
  {
    "en": "Parabola (y = ax^2)",
    "vi": "Đường parabol (đồ thị hàm số y = ax^2)",
    "category": "algebra",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/pəˈræbələ/",
    "example": "The graph of y = ax^2 is a parabola with its vertex at the origin.",
    "id": "term_397",
    "letter": "P",
    "subterms": []
  },
  {
    "id": "term_224",
    "en": "Parallel",
    "vi": "Song song",
    "category": "geometry",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈpærəlel/",
    "example": "Parallel lines lie in the same plane and never intersect.",
    "subterms": []
  },
  {
    "id": "term_225",
    "en": "Parallelogram",
    "vi": "Hình bình hành",
    "category": "geometry",
    "letter": "P",
    "ipa": "/ˌpærəˈleləɡræm/",
    "example": "Opposite sides of a parallelogram are equal and parallel.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "en": "Parametric equations of a line in 3D",
    "vi": "Phương trình tham số của đường thẳng trong không gian",
    "category": "geometry",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ˌpærəˈmetrɪk ɪˈkweɪʒnz əv ə laɪn/",
    "example": "x = x0 + at, y = y0 + bt, z = z0 + ct with direction vector u(a, b, c).",
    "id": "term_453",
    "letter": "P",
    "subterms": []
  },
  {
    "id": "term_226",
    "en": "Parity",
    "vi": "Tính chẵn lẻ",
    "category": "arithmetic",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈpærəti/",
    "example": "In standard mathematical curriculum, 'Parity' is used to analyze properties and solve equations in arithmetic.",
    "subterms": []
  },
  {
    "id": "term_227",
    "en": "Path",
    "vi": "Đường đi, lối đi",
    "category": "general",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/path/",
    "example": "In standard mathematical curriculum, 'Path' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_228",
    "en": "Patterns",
    "vi": "Kiểu lặp lại một kiểu sắp xếp (hình, số) nhiều lần",
    "category": "general",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/patterns/",
    "example": "In standard mathematical curriculum, 'Patterns' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_229",
    "en": "Pentagon",
    "vi": "Hình ngũ giác",
    "category": "general",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈpentəɡən/",
    "example": "In standard mathematical curriculum, 'Pentagon' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Percentage",
    "vi": "Tỉ số phần trăm (%)",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/pəˈsentɪdʒ/",
    "example": "50 percent (50%) equals one half (1/2).",
    "id": "term_384",
    "letter": "P",
    "subterms": []
  },
  {
    "id": "term_230",
    "en": "Perfect cube",
    "vi": "Số lập phương",
    "category": "geometry",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈpɜːfɪkt kjuːb/",
    "example": "A cube with edge length s has volume V = s^3 and surface area A = 6*s^2.",
    "subterms": []
  },
  {
    "id": "term_231",
    "en": "Perfect square",
    "vi": "Số chính phương",
    "category": "general",
    "letter": "P",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈpɜːfɪkt skweə/",
    "example": "A square is both a rectangle and a rhombus, having four equal sides and four right angles.",
    "subterms": []
  },
  {
    "id": "term_232",
    "en": "Perfect square factors",
    "vi": "Các ước số là số chính phương",
    "category": "arithmetic",
    "letter": "P",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈpɜːfɪkt skweə factors/",
    "example": "5! = 5 * 4 * 3 * 2 * 1 = 120.",
    "subterms": []
  },
  {
    "id": "term_233",
    "en": "Perimeter",
    "vi": "Chu vi (của đa giác)",
    "category": "geometry",
    "letter": "P",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/pəˈrɪmɪtə/",
    "example": "The perimeter of a square with side length s is P = 4s.",
    "subterms": []
  },
  {
    "id": "term_234",
    "en": "Period",
    "vi": "Chu kỳ",
    "category": "general",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈpɪəriəd/",
    "example": "In standard mathematical curriculum, 'Period' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Periodic function",
    "vi": "Hàm số tuần hoàn",
    "category": "geometry",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˌpɪəriˈɒdɪk ˈfʌŋkʃn/",
    "example": "f(x + T) = f(x); sin(x) and cos(x) have period T = 2*pi.",
    "id": "term_427",
    "letter": "P",
    "subterms": []
  },
  {
    "id": "term_235",
    "en": "Permutation",
    "vi": "Hoán vị, Chỉnh hợp",
    "category": "statistics",
    "letter": "P",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/permutation/",
    "example": "The number of permutations of 4 distinct objects is 4! = 24.",
    "subterms": []
  },
  {
    "en": "Permutations and Combinations",
    "vi": "Hoán vị (Pn), Chỉnh hợp (An^k) và Tổ hợp (Cn^k)",
    "category": "algebra",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˌpɜːmjuˈteɪʃnz ænd ˌkɒmbɪˈneɪʃnz/",
    "example": "Permutations care about order; combinations disregard order.",
    "id": "term_422",
    "letter": "P",
    "subterms": []
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
    "example": "Two lines are perpendicular if they intersect at 90 degrees.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)"
  },
  {
    "id": "term_237",
    "en": "Plus",
    "vi": "Dấu cộng",
    "category": "general",
    "letter": "P",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/plus/",
    "example": "In standard mathematical curriculum, 'Plus' is used to analyze properties and solve equations in general.",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/pɔɪnt/",
    "example": "In standard mathematical curriculum, 'Point' is used to analyze properties and solve equations in general."
  },
  {
    "id": "term_238",
    "en": "Pole",
    "vi": "Cột, que",
    "category": "general",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/pole/",
    "example": "In standard mathematical curriculum, 'Pole' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_240",
    "en": "Polygon",
    "vi": "Hình đa giác",
    "category": "geometry",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈpɒlɪɡən/",
    "example": "In standard mathematical curriculum, 'Polygon' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_239",
    "en": "Polyhedron",
    "vi": "Đa diện",
    "category": "general",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌpɒliˈhiːdrən/",
    "example": "In standard mathematical curriculum, 'Polyhedron' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_241",
    "en": "Polynomial",
    "vi": "Đa thức",
    "category": "algebra",
    "letter": "P",
    "ipa": "/ˌpɒlɪˈnəʊmiəl/",
    "example": "P(x) = a_n*x^n + ... + a_0 is a polynomial of degree n.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈpɒzətɪv/",
    "example": "Real numbers strictly greater than 0 are positive."
  },
  {
    "id": "term_244",
    "en": "Possess",
    "vi": "Có, sở hữu",
    "category": "general",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/possess/",
    "example": "In standard mathematical curriculum, 'Possess' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_245",
    "en": "Possibility",
    "vi": "Khả năng",
    "category": "general",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/possibility/",
    "example": "In standard mathematical curriculum, 'Possibility' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_246",
    "en": "Prime factorisation",
    "vi": "Phân tích ra thừa số nguyên tố",
    "category": "arithmetic",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/praɪm ˌfæktəraɪˈzeɪʃn/",
    "example": "5! = 5 * 4 * 3 * 2 * 1 = 120.",
    "subterms": []
  },
  {
    "id": "term_247",
    "en": "Prime numbers",
    "vi": "Các số nguyên tố",
    "category": "arithmetic",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/praɪm ˈnʌmbəz/",
    "example": "2 is the only even prime number; all other primes are odd.",
    "subterms": []
  },
  {
    "id": "term_248",
    "en": "Probability",
    "vi": "Xác suất",
    "category": "statistics",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌprɒbəˈbɪləti/",
    "example": "The probability of any event E always satisfies 0 <= P(E) <= 1.",
    "subterms": []
  },
  {
    "id": "term_250",
    "en": "Product",
    "vi": "Tích",
    "category": "general",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈprɒdʌkt/",
    "example": "The product of 6 and 7 is 42 (6 * 7 = 42).",
    "subterms": []
  },
  {
    "id": "term_249",
    "en": "Property",
    "vi": "Tính chất",
    "category": "general",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/property/",
    "example": "In standard mathematical curriculum, 'Property' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Proposition / Statement",
    "vi": "Mệnh đề toán học",
    "category": "algebra",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˌprɒpəˈzɪʃn/",
    "example": "A proposition is a declarative sentence that is either strictly true or false.",
    "id": "term_408",
    "letter": "P",
    "subterms": []
  },
  {
    "id": "term_251",
    "en": "Pyramid",
    "vi": "Hình chóp",
    "category": "geometry",
    "letter": "P",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈpɪrəmɪd/",
    "example": "The volume of any pyramid is one-third base area times height (V = 1/3 * B * h).",
    "subterms": []
  },
  {
    "en": "Pythagorean theorem",
    "vi": "Định lý Pythagoras (Pytago)",
    "category": "geometry",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/paɪˌθæɡəˈriːən ˈθɪərəm/",
    "example": "In a right triangle, a^2 + b^2 = c^2, where c is the hypotenuse.",
    "id": "term_400",
    "letter": "P",
    "subterms": []
  },
  {
    "id": "term_252",
    "en": "Quadrant",
    "vi": "Góc phần tư",
    "category": "geometry",
    "letter": "Q",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈkwɒdrənt/",
    "example": "In quadrant II, x-coordinates are negative and y-coordinates are positive.",
    "subterms": []
  },
  {
    "id": "term_253",
    "en": "Quadratic equation",
    "vi": "Phương trình bậc hai",
    "category": "algebra",
    "letter": "Q",
    "ipa": "/kwɒˈdrætɪk ɪˈkweɪʒn/",
    "example": "ax^2 + bx + c = 0 can be solved using the quadratic formula.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "en": "Quadratic equation (ax^2 + bx + c = 0)",
    "vi": "Phương trình bậc hai một ẩn",
    "category": "algebra",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/kwɒˈdrætɪk ɪˈkweɪʒn/",
    "example": "Solved using the quadratic formula: x = (-b +- sqrt(Delta)) / (2a).",
    "id": "term_398",
    "letter": "Q",
    "subterms": []
  },
  {
    "id": "term_254",
    "en": "Quadrilateral",
    "vi": "Hình tứ giác",
    "category": "geometry",
    "letter": "Q",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌkwɒdrɪˈlætərəl/",
    "example": "The sum of the four interior angles of any convex quadrilateral is 360°.",
    "subterms": []
  },
  {
    "id": "term_255",
    "en": "Quarter",
    "vi": "Một phần tư",
    "category": "general",
    "letter": "Q",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/quarter/",
    "example": "In standard mathematical curriculum, 'Quarter' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_256",
    "en": "Quotient",
    "vi": "Thương (của phép chia)",
    "category": "general",
    "letter": "Q",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈkwəʊʃnt/",
    "example": "Dividing 20 by 4 yields a quotient of 5.",
    "subterms": []
  },
  {
    "en": "Radian (rad)",
    "vi": "Đơn vị góc ra-đi-an",
    "category": "geometry",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˈreɪdiən/",
    "example": "pi radians is equal to 180 degrees (pi rad = 180°).",
    "id": "term_426",
    "letter": "R",
    "subterms": []
  },
  {
    "id": "term_257",
    "en": "Radius",
    "vi": "Bán kính",
    "category": "geometry",
    "letter": "R",
    "ipa": "/ˈreɪdiəs/",
    "example": "The radius of a circle is the distance from its center to any point on its boundary.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_258",
    "en": "Range",
    "vi": "Khoảng giá trị",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/reɪndʒ/",
    "example": "The statistical range is the difference between the maximum and minimum observations.",
    "subterms": []
  },
  {
    "id": "term_259",
    "en": "Rate",
    "vi": "Mức độ, tốc độ, năng suất",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/reɪt/",
    "example": "In standard mathematical curriculum, 'Rate' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_260",
    "en": "Ratio",
    "vi": "Tỉ lệ",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈreɪʃiəʊ/",
    "example": "In standard mathematical curriculum, 'Ratio' is used to analyze properties and solve equations in general.",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈræʃnəl ˈnʌmbə/",
    "example": "Every terminating or repeating decimal is a rational number."
  },
  {
    "id": "term_262",
    "en": "Ray",
    "vi": "Tia",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/reɪ/",
    "example": "A ray has one fixed starting endpoint and extends indefinitely in one direction.",
    "subterms": []
  },
  {
    "id": "term_263",
    "en": "Reach",
    "vi": "Đến, tới",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/reach/",
    "example": "In standard mathematical curriculum, 'Reach' is used to analyze properties and solve equations in general.",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈriːəl ˈnʌmbə/",
    "example": "Every point on the continuous number line corresponds to a unique real number."
  },
  {
    "en": "Real numbers",
    "vi": "Số thực (R)",
    "category": "arithmetic",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈriːəl ˈnʌmbəz/",
    "example": "The set of real numbers R comprises both rational and irrational numbers.",
    "id": "term_390",
    "letter": "R",
    "subterms": []
  },
  {
    "id": "term_265",
    "en": "Reciprocal",
    "vi": "Dạng nghịch đảo",
    "category": "general",
    "letter": "R",
    "ipa": "/rɪˈsɪprəkl/",
    "example": "The reciprocal of 2/3 is 3/2.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_266",
    "en": "Rectangle",
    "vi": "Hình chữ nhật",
    "category": "geometry",
    "letter": "R",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈrektæŋɡl/",
    "example": "A rectangle is a parallelogram with four right angles.",
    "subterms": []
  },
  {
    "id": "term_267",
    "en": "Rectangular",
    "vi": "Hình hộp chữ nhật",
    "category": "geometry",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/rekˈtæŋɡjələ/",
    "example": "In standard mathematical curriculum, 'Rectangular' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_268",
    "en": "Recursion",
    "vi": "Đệ quy",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/recursion/",
    "example": "In standard mathematical curriculum, 'Recursion' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_269",
    "en": "Reduce",
    "vi": "Giảm",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/reduce/",
    "example": "In standard mathematical curriculum, 'Reduce' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_270",
    "en": "Region",
    "vi": "Miền",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈriːdʒən/",
    "example": "In standard mathematical curriculum, 'Region' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_271",
    "en": "Regular polygon",
    "vi": "Đa giác đều",
    "category": "geometry",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈreɡjələ ˈpɒlɪɡən/",
    "example": "In standard mathematical curriculum, 'Regular polygon' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_272",
    "en": "Relatively prime",
    "vi": "Nguyên tố cùng nhau",
    "category": "arithmetic",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/relatively praɪm/",
    "example": "2 is the only even prime number; all other primes are odd.",
    "subterms": []
  },
  {
    "id": "term_273",
    "en": "Remainder",
    "vi": "Số dư",
    "category": "arithmetic",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/rɪˈmeɪndə/",
    "example": "Dividing 17 by 5 leaves a remainder of 2, since 17 = 5 * 3 + 2.",
    "subterms": []
  },
  {
    "id": "term_274",
    "en": "Remaining numbers",
    "vi": "Các số còn lại",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/remaining ˈnʌmbəz/",
    "example": "In standard mathematical curriculum, 'Remaining numbers' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_275",
    "en": "Remains unchanged",
    "vi": "Không đổi, giữ nguyên",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/remains unchanged/",
    "example": "The derivative represents the instantaneous rate of change of y with respect to x.",
    "subterms": []
  },
  {
    "id": "term_278",
    "en": "Repeating decimal",
    "vi": "Phần thập phân tuần hoàn",
    "category": "arithmetic",
    "letter": "R",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/repeating ˈdesɪml/",
    "example": "The fraction 3/4 can be written as the terminating decimal 0.75.",
    "subterms": []
  },
  {
    "id": "term_276",
    "en": "Replace",
    "vi": "Thay thế, thay chỗ",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/replace/",
    "example": "In standard mathematical curriculum, 'Replace' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_277",
    "en": "Represent",
    "vi": "Đại diện",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/represent/",
    "example": "In standard mathematical curriculum, 'Represent' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_279",
    "en": "Respectively",
    "vi": "Tương ứng, theo thứ tự, lần lượt",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/respectively/",
    "example": "In standard mathematical curriculum, 'Respectively' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_280",
    "en": "Rhombus",
    "vi": "Hình thoi",
    "category": "geometry",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈrɒmbəs/",
    "example": "The diagonals of a rhombus are perpendicular bisectors of each other.",
    "subterms": []
  },
  {
    "id": "term_281",
    "en": "Right angle",
    "vi": "Góc vuông",
    "category": "geometry",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/raɪt ˈæŋɡl/",
    "example": "In a right triangle, the hypotenuse satisfies the Pythagorean theorem: a^2 + b^2 = c^2.",
    "subterms": []
  },
  {
    "id": "term_282",
    "en": "Right hand side",
    "vi": "Vế phải",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/raɪt hand saɪd/",
    "example": "In standard mathematical curriculum, 'Right hand side' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_284",
    "en": "Right triangle",
    "vi": "Tam giác vuông",
    "category": "geometry",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/raɪt ˈtraɪæŋɡl/",
    "example": "In a right triangle, the hypotenuse satisfies the Pythagorean theorem: a^2 + b^2 = c^2.",
    "subterms": []
  },
  {
    "id": "term_283",
    "en": "Right-most digit",
    "vi": "Chữ số tận cùng bên phải",
    "category": "arithmetic",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/right-most ˈdɪdʒɪt/",
    "example": "A four-digit integer cannot have 0 as its first digit.",
    "subterms": []
  },
  {
    "id": "term_285",
    "en": "Rook",
    "vi": "Quân xe",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/rook/",
    "example": "In standard mathematical curriculum, 'Rook' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_286",
    "en": "Root",
    "vi": "Nghiệm",
    "category": "algebra",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ruːt/",
    "example": "A root of the equation f(x) = 0 is any value of x that makes the statement true.",
    "subterms": []
  },
  {
    "en": "Rounding off",
    "vi": "Làm tròn số",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈraʊndɪŋ ɒf/",
    "example": "Rounding 4.67 to the nearest tenth gives 4.7.",
    "id": "term_385",
    "letter": "R",
    "subterms": []
  },
  {
    "id": "term_287",
    "en": "Row",
    "vi": "Hàng, dãy",
    "category": "general",
    "letter": "R",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/row/",
    "example": "In standard mathematical curriculum, 'Row' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_288",
    "en": "Satisfy",
    "vi": "Thỏa mãn",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/satisfy/",
    "example": "In standard mathematical curriculum, 'Satisfy' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_289",
    "en": "Scale factor",
    "vi": "Tỉ số đồng dạng",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/skeɪl ˈfæktə/",
    "example": "5! = 5 * 4 * 3 * 2 * 1 = 120.",
    "subterms": []
  },
  {
    "id": "term_290",
    "en": "Scalene triangle",
    "vi": "Tam giác có ba cạnh có độ dài khác nhau",
    "category": "geometry",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈskeɪliːn ˈtraɪæŋɡl/",
    "example": "The sum of the three interior angles of any planar triangle is always 180°.",
    "subterms": []
  },
  {
    "id": "term_291",
    "en": "Schedule",
    "vi": "Lịch trình",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/schedule/",
    "example": "In standard mathematical curriculum, 'Schedule' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_292",
    "en": "Sector",
    "vi": "Hình quạt",
    "category": "geometry",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsektə/",
    "example": "The area of a circular sector is A = 1/2 * r^2 * theta (in radians).",
    "subterms": []
  },
  {
    "id": "term_293",
    "en": "Segment",
    "vi": "Đoạn thẳng",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈseɡmənt/",
    "example": "A line segment connects two endpoints and has a finite measurable length.",
    "subterms": []
  },
  {
    "id": "term_294",
    "en": "Select",
    "vi": "Lựa chọn",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/select/",
    "example": "In standard mathematical curriculum, 'Select' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_295",
    "en": "Semicircle",
    "vi": "Nửa đường tròn",
    "category": "geometry",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/semicircle/",
    "example": "A circle is the locus of points equidistant from a fixed center.",
    "subterms": []
  },
  {
    "id": "term_296",
    "en": "Sequence",
    "vi": "Dãy số",
    "category": "general",
    "letter": "S",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˈsiːkwəns/",
    "example": "The sequence of prime numbers begins with 2, 3, 5, 7, 11, ...",
    "subterms": []
  },
  {
    "id": "term_297",
    "en": "Set",
    "vi": "Tập hợp",
    "category": "general",
    "letter": "S",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/set/",
    "example": "A set is a well-defined collection of distinct mathematical objects.",
    "subterms": []
  },
  {
    "en": "Set and Subset",
    "vi": "Tập hợp và Tập con",
    "category": "algebra",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/set ænd ˈsʌbset/",
    "example": "A is a subset of B (A ⊆ B) if every element of A is also in B.",
    "id": "term_411",
    "letter": "S",
    "subterms": []
  },
  {
    "id": "term_298",
    "en": "Side length",
    "vi": "Độ dài cạnh",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/saɪd leŋθ/",
    "example": "In standard mathematical curriculum, 'Side length' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_299",
    "en": "Sign",
    "vi": "Dấu (của số), ký hiệu",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/saɪn/",
    "example": "In standard mathematical curriculum, 'Sign' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_300",
    "en": "Similar figures",
    "vi": "Các hình đồng dạng",
    "category": "general",
    "letter": "S",
    "ipa": "/ˈsɪmɪlə ˈfɪɡəz/",
    "example": "Similar figures have congruent corresponding angles and proportional side lengths.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "en": "Similar triangles",
    "vi": "Hai tam giác đồng dạng",
    "category": "geometry",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsɪmɪlə ˈtraɪæŋɡlz/",
    "example": "Similar triangles have corresponding congruent angles and proportional sides.",
    "id": "term_402",
    "letter": "S",
    "subterms": []
  },
  {
    "id": "term_301",
    "en": "Similarly",
    "vi": "Tương tự",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/similarly/",
    "example": "Similar polygons have congruent corresponding angles and proportional side lengths.",
    "subterms": []
  },
  {
    "id": "term_302",
    "en": "Simultaneous equations",
    "vi": "Hệ phương trình",
    "category": "algebra",
    "letter": "S",
    "ipa": "/ˌsɪmlˈteɪniəs ɪˈkweɪʒnz/",
    "example": "Solve the simultaneous equations to find common intersection points.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_303",
    "en": "Simultaneously",
    "vi": "Đồng thời, cùng lúc",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/simultaneously/",
    "example": "In standard mathematical curriculum, 'Simultaneously' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_304",
    "en": "Situate",
    "vi": "Đặt ở vị trí",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/situate/",
    "example": "In standard mathematical curriculum, 'Situate' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_307",
    "en": "Sketch",
    "vi": "Phác thảo, hình vẽ",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/sketch/",
    "example": "In standard mathematical curriculum, 'Sketch' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Skew lines",
    "vi": "Hai đường thẳng chéo nhau trong không gian",
    "category": "geometry",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/skjuː laɪnz/",
    "example": "Lines that do not intersect and are not parallel because they lie in different planes.",
    "id": "term_437",
    "letter": "S",
    "subterms": []
  },
  {
    "id": "term_305",
    "en": "Slant height",
    "vi": "Đường sinh (của hình nón)",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/slɑːnt haɪt/",
    "example": "The height of the cylinder is 10 cm and its base radius is 3 cm.",
    "subterms": []
  },
  {
    "id": "term_306",
    "en": "Slipping",
    "vi": "Trượt",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/slipping/",
    "example": "In standard mathematical curriculum, 'Slipping' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_308",
    "en": "Slope",
    "vi": "Hệ số góc",
    "category": "geometry",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/sləʊp/",
    "example": "The slope of a horizontal line is 0, while a vertical line has undefined slope.",
    "subterms": []
  },
  {
    "en": "Slope / Gradient",
    "vi": "Hệ số góc của đường thẳng",
    "category": "algebra",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/sləʊp / ˈɡreɪdiənt/",
    "example": "The slope m = (y2 - y1) / (x2 - x1) measures the steepness of a line.",
    "id": "term_396",
    "letter": "S",
    "subterms": []
  },
  {
    "id": "term_310",
    "en": "Solid figures",
    "vi": "Các hình trong không gian",
    "category": "general",
    "letter": "S",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˈsɒlɪd ˈfɪɡəz/",
    "example": "In standard mathematical curriculum, 'Solid figures' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_309",
    "en": "Solid geometry",
    "vi": "Hình học không gian",
    "category": "general",
    "letter": "S",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˈsɒlɪd dʒiˈɒmətri/",
    "example": "Euclidean geometry studies points, lines, angles, and shapes in flat space.",
    "subterms": []
  },
  {
    "id": "term_311",
    "en": "Solution",
    "vi": "Nghiệm, dung dịch",
    "category": "algebra",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/səˈluːʃn/",
    "example": "The solution set of x^2 = 9 is {-3, 3}.",
    "subterms": []
  },
  {
    "id": "term_314",
    "en": "Speed",
    "vi": "Tốc độ",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/spiːd/",
    "example": "In standard mathematical curriculum, 'Speed' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Speed, Distance, Time",
    "vi": "Vận tốc, Quãng đường, Thời gian",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/spiːd, ˈdɪstəns, taɪm/",
    "example": "Distance equals speed multiplied by time: s = v × t.",
    "id": "term_387",
    "letter": "S",
    "subterms": []
  },
  {
    "id": "term_312",
    "en": "Sphere",
    "vi": "Hình cầu",
    "category": "geometry",
    "letter": "S",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/sfɪə/",
    "example": "The surface area of a sphere of radius r is 4 * pi * r^2.",
    "subterms": []
  },
  {
    "id": "term_313",
    "en": "Spherical",
    "vi": "Dạng hình cầu",
    "category": "geometry",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/spherical/",
    "example": "In standard mathematical curriculum, 'Spherical' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_315",
    "en": "Square",
    "vi": "Hình vuông (hình h ọc), bình phương (s ố học, đại số)",
    "category": "general",
    "letter": "S",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/skweə/",
    "example": "A square is both a rectangle and a rhombus, having four equal sides and four right angles.",
    "subterms": []
  },
  {
    "en": "Square root",
    "vi": "Căn bậc hai",
    "category": "algebra",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/skweə ruːt/",
    "example": "The square root of 25 is 5, written as sqrt(25) = 5.",
    "id": "term_391",
    "letter": "S",
    "subterms": []
  },
  {
    "id": "term_367",
    "en": "Standard deviation",
    "vi": "Độ lệch chuẩn",
    "category": "statistics",
    "ipa": "/ˈstændəd ˌdiːviˈeɪʃn/",
    "example": "Standard deviation measures the dispersion of a dataset relative to its mean.",
    "subterms": [],
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)"
  },
  {
    "id": "term_316",
    "en": "Statement",
    "vi": "Mệnh đề",
    "category": "general",
    "letter": "S",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˈsteɪtmənt/",
    "example": "In standard mathematical curriculum, 'Statement' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_317",
    "en": "Straight line",
    "vi": "Đường thẳng",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/streɪt laɪn/",
    "example": "In standard mathematical curriculum, 'Straight line' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_318",
    "en": "Subset",
    "vi": "Tập con",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsʌbset/",
    "example": "A set is a well-defined collection of distinct mathematical objects.",
    "subterms": []
  },
  {
    "id": "term_319",
    "en": "Subtract (subtraction)",
    "vi": "Trừ (phép trừ)",
    "category": "general",
    "letter": "S",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/səbˈtrækt/",
    "example": "Subtraction is the inverse operation of addition (a - b = c <=> c + b = a).",
    "subterms": []
  },
  {
    "en": "Subtraction",
    "vi": "Phép trừ",
    "category": "arithmetic",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/səbˈtrækʃn/",
    "example": "Subtraction is taking one number away from another (e.g. 9 - 4 = 5).",
    "id": "term_375",
    "letter": "S",
    "subterms": []
  },
  {
    "id": "term_320",
    "en": "Subtrahend",
    "vi": "Số bị trừ",
    "category": "general",
    "letter": "S",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/subtrahend/",
    "example": "In standard mathematical curriculum, 'Subtrahend' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_321",
    "en": "Successive",
    "vi": "Liên tiếp",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/successive/",
    "example": "In standard mathematical curriculum, 'Successive' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_322",
    "en": "Suffice",
    "vi": "Chỉ cần",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/suffice/",
    "example": "In standard mathematical curriculum, 'Suffice' is used to analyze properties and solve equations in general.",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/sʌm/",
    "example": "The sum of the interior angles of an n-sided polygon is (n - 2) * 180°."
  },
  {
    "id": "term_324",
    "en": "Supplementary angles",
    "vi": "Hai góc bù nhau (có tổng bằng 180 độ)",
    "category": "geometry",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌsʌplɪˈmentri ˈæŋɡlz/",
    "example": "In standard mathematical curriculum, 'Supplementary angles' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_325",
    "en": "Suppose",
    "vi": "Giả sử",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/suppose/",
    "example": "In standard mathematical curriculum, 'Suppose' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_326",
    "en": "Surd form",
    "vi": "Dạng căn thức",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/surd form/",
    "example": "In standard mathematical curriculum, 'Surd form' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_327",
    "en": "Survey",
    "vi": "Khảo sát, thống kê, thăm dò",
    "category": "general",
    "letter": "S",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/survey/",
    "example": "In standard mathematical curriculum, 'Survey' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_328",
    "en": "Symmetry",
    "vi": "Đối xứng",
    "category": "general",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsɪmətri/",
    "example": "In standard mathematical curriculum, 'Symmetry' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_329",
    "en": "System of equations",
    "vi": "Hệ phương trình",
    "category": "algebra",
    "letter": "S",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsɪstəm of ɪˈkweɪʒnz/",
    "example": "The quadratic equation x^2 - 5x + 6 = 0 has roots x = 2 and x = 3.",
    "subterms": []
  },
  {
    "en": "System of linear equations",
    "vi": "Hệ hai phương trình bậc nhất hai ẩn",
    "category": "algebra",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈsɪstəm əv ˈlɪniə ɪˈkweɪʒnz/",
    "example": "Solve the system using substitution or elimination method.",
    "id": "term_394",
    "letter": "S",
    "subterms": []
  },
  {
    "en": "System of linear inequalities in two variables",
    "vi": "Hệ bất phương trình bậc nhất hai ẩn",
    "category": "algebra",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˈsɪstəm əv ˈlɪniə ˌɪnɪˈkwɒlətiz/",
    "example": "The feasible solution region is represented by the intersection of half-planes.",
    "id": "term_414",
    "letter": "S",
    "subterms": []
  },
  {
    "id": "term_330",
    "en": "Tangent",
    "vi": "Tiếp xúc",
    "category": "geometry",
    "letter": "T",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈtændʒənt/",
    "example": "A tangent line touches a curve at a single point without crossing it locally.",
    "subterms": []
  },
  {
    "en": "Tangent line slope (f'(x0))",
    "vi": "Hệ số góc của tiếp tuyến tại tiếp điểm",
    "category": "calculus",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˈtændʒənt laɪn sləʊp/",
    "example": "The slope of the tangent line to y = f(x) at x0 equals the derivative f'(x0).",
    "id": "term_435",
    "letter": "T",
    "subterms": []
  },
  {
    "id": "term_331",
    "en": "Term",
    "vi": "Số hạng",
    "category": "general",
    "letter": "T",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/tɜːm/",
    "example": "In the polynomial 3x^2 + 5x - 7, there are three terms: 3x^2, 5x, and -7.",
    "subterms": []
  },
  {
    "id": "term_332",
    "en": "Tesselation",
    "vi": "Lát mặt phẳng",
    "category": "geometry",
    "letter": "T",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/tesselation/",
    "example": "In standard mathematical curriculum, 'Tesselation' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "en": "Thales' theorem",
    "vi": "Định lý Ta-lét (Thalès)",
    "category": "geometry",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈθeɪliːz ˈθɪərəm/",
    "example": "If a line parallel to one side of a triangle intersects the other two sides, it divides them proportionally.",
    "id": "term_401",
    "letter": "T",
    "subterms": []
  },
  {
    "id": "term_333",
    "en": "Therefore",
    "vi": "Bởi vậy, cho nên",
    "category": "general",
    "letter": "T",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/therefore/",
    "example": "In standard mathematical curriculum, 'Therefore' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_334",
    "en": "Times",
    "vi": "Dấu nhân",
    "category": "general",
    "letter": "T",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/times/",
    "example": "In standard mathematical curriculum, 'Times' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_335",
    "en": "Total",
    "vi": "Tổng",
    "category": "general",
    "letter": "T",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈtəʊtl/",
    "example": "In standard mathematical curriculum, 'Total' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_336",
    "en": "Total surface area",
    "vi": "Diện tích toàn phần, diện tích bề mặt",
    "category": "general",
    "letter": "T",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈtəʊtl ˈsɜːfɪs ˈeəriə/",
    "example": "In standard mathematical curriculum, 'Total surface area' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_337",
    "en": "Touch",
    "vi": "Tiếp xúc",
    "category": "geometry",
    "letter": "T",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/touch/",
    "example": "In standard mathematical curriculum, 'Touch' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_338",
    "en": "Touching spheres",
    "vi": "Các hình cầu tiếp xúc nhau",
    "category": "geometry",
    "letter": "T",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/touching spheres/",
    "example": "The surface area of a sphere of radius r is 4 * pi * r^2.",
    "subterms": []
  },
  {
    "id": "term_339",
    "en": "Trapezium",
    "vi": "Hình thang",
    "category": "geometry",
    "letter": "T",
    "ipa": "/trəˈpiːziəm/",
    "example": "A trapezium is a quadrilateral with at least one pair of parallel sides.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "subterms": []
  },
  {
    "id": "term_340",
    "en": "Triangle",
    "vi": "Tam giác",
    "category": "geometry",
    "letter": "T",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈtraɪæŋɡl/",
    "example": "The sum of the three interior angles of any planar triangle is always 180°.",
    "subterms": []
  },
  {
    "en": "Trigonometric circle / Unit circle",
    "vi": "Đường tròn lượng giác",
    "category": "geometry",
    "gradeId": "grade11",
    "grade": "Lớp 11",
    "ipa": "/ˌtrɪɡənəˈmetrɪk ˈsɜːkl/",
    "example": "A circle of radius 1 centered at the origin, with positive counterclockwise orientation.",
    "id": "term_425",
    "letter": "T",
    "subterms": []
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
    "letter": "T",
    "gradeId": "grade11",
    "grade": "Lớp 11"
  },
  {
    "id": "term_341",
    "en": "Triple",
    "vi": "Gấp ba (số lần), bộ ba",
    "category": "general",
    "letter": "T",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/triple/",
    "example": "In standard mathematical curriculum, 'Triple' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_342",
    "en": "Trisect",
    "vi": "Chia ba (góc, cạnh)",
    "category": "geometry",
    "letter": "T",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/trisect/",
    "example": "In standard mathematical curriculum, 'Trisect' is used to analyze properties and solve equations in geometry.",
    "subterms": []
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
    ],
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/tuple/",
    "example": "In standard mathematical curriculum, 'Tuple' is used to analyze properties and solve equations in general."
  },
  {
    "id": "term_344",
    "en": "Twice",
    "vi": "Hai lần",
    "category": "general",
    "letter": "T",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/twice/",
    "example": "In standard mathematical curriculum, 'Twice' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_345",
    "en": "Union",
    "vi": "Hợp (của các tập hợp)",
    "category": "general",
    "letter": "U",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˈjuːniən/",
    "example": "The union A ∪ B consists of all elements that belong to A, to B, or to both.",
    "subterms": []
  },
  {
    "id": "term_346",
    "en": "Unit circle",
    "vi": "Đường tròn đơn vị",
    "category": "geometry",
    "letter": "U",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈjuːnɪt ˈsɜːkl/",
    "example": "A circle is the locus of points equidistant from a fixed center.",
    "subterms": []
  },
  {
    "id": "term_347",
    "en": "Unit square",
    "vi": "Hình vuông đơn vị",
    "category": "general",
    "letter": "U",
    "gradeId": "primary",
    "grade": "Tiểu học (Lớp 1-5)",
    "ipa": "/ˈjuːnɪt skweə/",
    "example": "A square is both a rectangle and a rhombus, having four equal sides and four right angles.",
    "subterms": []
  },
  {
    "en": "Universal and Existential quantifiers (∀, ∃)",
    "vi": "Ký hiệu với mọi (∀) và tồn tại (∃)",
    "category": "algebra",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˌjuːnɪˈvɜːsl ænd ˌeɡzɪˈstenʃl ˈkwɒntɪfaɪəz/",
    "example": "∀x ∈ R: x^2 >= 0 and ∃n ∈ N: n^2 = n.",
    "id": "term_410",
    "letter": "U",
    "subterms": []
  },
  {
    "id": "term_348",
    "en": "Universal set",
    "vi": "Tập vạn năng",
    "category": "general",
    "letter": "U",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˌjuːnɪˈvɜːsl set/",
    "example": "A set is a well-defined collection of distinct mathematical objects.",
    "subterms": []
  },
  {
    "id": "term_349",
    "en": "Value",
    "vi": "Giá trị",
    "category": "general",
    "letter": "V",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈvæljuː/",
    "example": "Substitute x = 5 into the function to evaluate its corresponding output value.",
    "subterms": []
  },
  {
    "id": "term_350",
    "en": "Variable",
    "vi": "Biến số",
    "category": "algebra",
    "letter": "V",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈveəriəbl/",
    "example": "A variable is a symbol, such as x or y, used to represent an unspecified quantity.",
    "subterms": []
  },
  {
    "id": "term_368",
    "en": "Variance",
    "vi": "Phương sai",
    "category": "statistics",
    "ipa": "/ˈveəriəns/",
    "example": "Variance is the expectation of the squared deviation of a random variable from its mean.",
    "subterms": [],
    "letter": "V",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)"
  },
  {
    "id": "term_351",
    "en": "Vary",
    "vi": "Biến đổi, biến thiên",
    "category": "general",
    "letter": "V",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/vary/",
    "example": "In standard mathematical curriculum, 'Vary' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "en": "Vector cross product",
    "vi": "Tích có hướng của hai véc-tơ trong không gian ([u, v])",
    "category": "geometry",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ˈvektə krɒs ˈprɒdʌkt/",
    "example": "Vector perpendicular to both u and v, used to find normal vectors and calculate areas/volumes.",
    "id": "term_450",
    "letter": "V",
    "subterms": []
  },
  {
    "en": "Vector dot product",
    "vi": "Tích vô hướng của hai véc-tơ (u . v = |u||v|cosθ)",
    "category": "geometry",
    "gradeId": "grade10",
    "grade": "Lớp 10",
    "ipa": "/ˈvektə dɒt ˈprɒdʌkt/",
    "example": "If two non-zero vectors are perpendicular, their dot product equals 0.",
    "id": "term_418",
    "letter": "V",
    "subterms": []
  },
  {
    "id": "term_352",
    "en": "Venn diagram",
    "vi": "Giản đồ Venn",
    "category": "general",
    "letter": "V",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ven ˈdaɪəɡræm/",
    "example": "In standard mathematical curriculum, 'Venn diagram' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_353",
    "en": "Vertex",
    "vi": "Đỉnh (của đa giác, khối đa diện)",
    "category": "geometry",
    "letter": "V",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈvɜːteks/",
    "example": "A triangle has three vertices and three sides.",
    "subterms": []
  },
  {
    "id": "term_354",
    "en": "Vertical angles",
    "vi": "Các góc đối đỉnh",
    "category": "geometry",
    "letter": "V",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈvɜːtɪkl ˈæŋɡlz/",
    "example": "In standard mathematical curriculum, 'Vertical angles' is used to analyze properties and solve equations in geometry.",
    "subterms": []
  },
  {
    "id": "term_355",
    "en": "Vertices",
    "vi": "Các đỉnh",
    "category": "geometry",
    "letter": "V",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/ˈvɜːtɪsiːz/",
    "example": "A triangle has three vertices and three sides.",
    "subterms": []
  },
  {
    "en": "Vieta's formulas",
    "vi": "Hệ thức Vi-ét",
    "category": "algebra",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/viˈeɪtəz ˈfɔːmjələz/",
    "example": "For ax^2 + bx + c = 0: x1 + x2 = -b/a and x1 * x2 = c/a.",
    "id": "term_399",
    "letter": "V",
    "subterms": []
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
    "example": "The volume of a sphere with radius r is (4/3)*pi*r^3.",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)"
  },
  {
    "en": "Volume of solid of revolution",
    "vi": "Thể tích khối tròn xoay (V = π ∫ f(x)^2 dx)",
    "category": "calculus",
    "gradeId": "grade12",
    "grade": "Lớp 12",
    "ipa": "/ˈvɒljuːm əv ˈsɒlɪd əv ˌrevəˈluːʃn/",
    "example": "Calculates the volume generated by revolving a plane region around an axis.",
    "id": "term_448",
    "letter": "V",
    "subterms": []
  },
  {
    "id": "term_357",
    "en": "Wheel",
    "vi": "Bánh xe",
    "category": "general",
    "letter": "W",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/wheel/",
    "example": "In standard mathematical curriculum, 'Wheel' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_358",
    "en": "Whence",
    "vi": "Từ đó, do đó",
    "category": "general",
    "letter": "W",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/whence/",
    "example": "In standard mathematical curriculum, 'Whence' is used to analyze properties and solve equations in general.",
    "subterms": []
  },
  {
    "id": "term_359",
    "en": "Whole numbers",
    "vi": "Tập số 0, 1, 2, 3, …",
    "category": "general",
    "letter": "W",
    "gradeId": "middle",
    "grade": "THCS (Lớp 6-9)",
    "ipa": "/həʊl ˈnʌmbəz/",
    "example": "The whole numbers are the non-negative integers: {0, 1, 2, 3, ...}.",
    "subterms": []
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
    "ipa": "/ˈɪntɪɡrəl/",
    "example": "The definite integral from 0 to 1 of x dx equals 1/2.",
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
    "ipa": "/ˈmiːdiən/",
    "example": "The median is the middle value in an ordered set of data.",
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
    "ipa": "/ˈpærəti/",
    "example": "In standard mathematical curriculum, 'Parity' is used to analyze properties and solve equations in arithmetic.",
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
    "ipa": "/surd form/",
    "example": "In standard mathematical curriculum, 'Surd form' is used to analyze properties and solve equations in general.",
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
