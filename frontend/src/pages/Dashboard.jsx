import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Award, 
  ChevronRight, 
  Play, 
  RotateCcw, 
  Bell, 
  Pin, 
  BarChart2, 
  Compass, 
  Sparkles,
  Flame,
  Calendar,
  Layers,
  ArrowUpRight,
  Plus,
  Edit2,
  Trash2,
  X,
  Medal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useRole } from '../context/RoleContext';
import { GRADE_10_CURRICULUM } from '../data/grade10Curriculum';
import { GRADE_11_CURRICULUM } from '../data/grade11Curriculum';
import { GRADE_12_CURRICULUM } from '../data/grade12Curriculum';
import { getClasses } from '../services/classService';
import { getExams, getStudentHistory, getGamification } from '../services/examService';
import { getNotices, saveNotice, deleteNotice } from '../services/noticeService';
import './Dashboard.css';

const CURRICULUM_MAP = {
  '10': GRADE_10_CURRICULUM,
  '11': GRADE_11_CURRICULUM,
  '12': GRADE_12_CURRICULUM,
};

const CHAPTER_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { role, isTeacher, isStudent, currentStudentId } = useRole();
  const hasLocalChangesRef = useRef(false);
  const noticeSaveTimeoutRef = useRef(null);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Xác định thông tin lớp và khối của học sinh
  const [studentInfo, setStudentInfo] = useState({ grade: '12', className: 'Lớp 12T6', classId: '' });
  const [completedExamsMap, setCompletedExamsMap] = useState({});
  const [allExamsList, setAllExamsList] = useState([]);
  const [dueTasks, setDueTasks] = useState([]);
  
  // Gamification (XP, Streak, Badges)
  const [gamificationData, setGamificationData] = useState({ xp: 0, streak: 0, badges: [] });

  // Bảng tin thông báo
  const [notices, setNotices] = useState(() => {
    try {
      const saved = localStorage.getItem('edumanager_notices');
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          title: '📌 Ghim: Lịch khai giảng đợt Luyện đề Nâng cao Toán 12',
          author: 'Thầy Lê Công Chức',
          date: 'Hôm nay lúc 07:30',
          content: 'Tất cả các em tải đề ôn tập đợt 4 tại mục Tài liệu để chuẩn bị cho buổi học tối nay.',
          isPinned: true,
          targetClass: 'ALL'
        },
        {
          id: 2,
          title: 'Cập nhật bộ tài liệu 100 câu Vận dụng cao Oxyz',
          author: 'Bộ môn Toán NP & THTH',
          date: 'Hôm qua',
          content: 'Đã có file PDF lời giải chi tiết và video hướng dẫn bấm máy tính Casio.',
          isPinned: false,
          targetClass: 'ALL'
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // Tải notices từ Supabase (Stale-While-Revalidate)
  useEffect(() => {
    // 1. Local
    getNotices(false).then(data => {
      if (data && data.length > 0) setNotices(data);
      // 2. Cloud
      getNotices(true).then(freshData => {
        if (!hasLocalChangesRef.current && Array.isArray(freshData)) {
          setNotices(freshData);
        }
        setIsCloudSynced(true);
      }).catch(err => {
        console.error('getNotices cloud error:', err);
        setIsCloudSynced(true);
      });
    }).catch(err => console.error('getNotices local error:', err));
  }, []);

  // Tự động đồng bộ lên Supabase mỗi 1.5s
  useEffect(() => {
    localStorage.setItem('edumanager_notices', JSON.stringify(notices));
    if (!isCloudSynced) return;
    
    if (noticeSaveTimeoutRef.current) clearTimeout(noticeSaveTimeoutRef.current);
    noticeSaveTimeoutRef.current = setTimeout(() => {
      import('../services/noticeService').then(({ saveAllNotices }) => {
        saveAllNotices(notices);
      });
    }, 1500);

    return () => {
      if (noticeSaveTimeoutRef.current) clearTimeout(noticeSaveTimeoutRef.current);
    };
  }, [notices, isCloudSynced]);

  const [classList, setClassList] = useState([]);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    targetClass: 'ALL',
    isPinned: false
  });

  // Tải tất cả dữ liệu từ Supabase khi component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Tải danh sách lớp
        const classes = await getClasses();
        setClassList(classes || []);
        for (const cls of (classes || [])) {
          const found = cls.students?.find(s => s.id === currentStudentId);
          if (found) {
            setStudentInfo({ grade: cls.grade || '12', className: cls.name, school: cls.school, classId: cls.id });
            break;
          }
        }

        // 2. Tải danh sách đề thi
        const exams = await getExams();
        setAllExamsList(exams || []);

        // 3. Lịch sử làm bài của học sinh
        if (isStudent && currentStudentId) {
          const history = await getStudentHistory(currentStudentId);
          setCompletedExamsMap(history || {});

          // 4. Gamification
          const myGami = await getGamification(currentStudentId);
          const today = new Date().toLocaleDateString('en-CA');
          if (myGami.lastActiveDate && myGami.lastActiveDate !== today) {
            const diffDays = Math.ceil(Math.abs(new Date(today) - new Date(myGami.lastActiveDate)) / (1000 * 60 * 60 * 24));
            if (diffDays > 1) myGami.streak = 0;
          }
          setGamificationData(myGami);
        }
      } catch (err) {
        console.error('Dashboard loadData error:', err);
      }
    };
    loadData();
  }, [currentStudentId, role, isStudent]);

  const handleOpenNoticeModal = (notice = null) => {
    if (notice) {
      setEditingNotice(notice);
      setNoticeForm({
        title: notice.title,
        content: notice.content,
        targetClass: notice.targetClass || 'ALL',
        isPinned: notice.isPinned || false
      });
    } else {
      setEditingNotice(null);
      setNoticeForm({
        title: '',
        content: '',
        targetClass: 'ALL',
        isPinned: false
      });
    }
    setShowNoticeModal(true);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;
    hasLocalChangesRef.current = true;

    let updatedNotices;
    const now = new Date();
    const formattedDate = `Hôm nay lúc ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const noticeId = editingNotice ? editingNotice.id : crypto.randomUUID();

    if (editingNotice) {
      updatedNotices = notices.map(n => n.id === noticeId ? {
        ...n,
        title: noticeForm.title.trim(),
        content: noticeForm.content.trim(),
        targetClass: noticeForm.targetClass,
        isPinned: noticeForm.isPinned,
        date: formattedDate
      } : n);
    } else {
      const newNotice = {
        id: noticeId,
        title: noticeForm.title.trim(),
        content: noticeForm.content.trim(),
        author: 'Thầy Lê Công Chức',
        date: formattedDate,
        isPinned: noticeForm.isPinned,
        targetClass: noticeForm.targetClass
      };
      updatedNotices = [newNotice, ...notices];
    }

    setNotices(updatedNotices);
    localStorage.setItem('edumanager_notices', JSON.stringify(updatedNotices));
    setShowNoticeModal(false);

    try {
      await saveNotice({ ...noticeForm, id: noticeId });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotice = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      hasLocalChangesRef.current = true;
      const updatedNotices = notices.filter(n => n.id !== id);
      setNotices(updatedNotices);
      localStorage.setItem('edumanager_notices', JSON.stringify(updatedNotices));
      deleteNotice(id);
    }
  };

  const studentGrade = isStudent ? studentInfo.grade : '12';
  const currentCurriculum = CURRICULUM_MAP[studentGrade] || GRADE_12_CURRICULUM;

  // Mục tiêu điểm thi mong muốn của học sinh
  const [targetScore, setTargetScore] = useState(() => {
    return localStorage.getItem('edumanager_target_score') || '8.5';
  });

  // Tính số ngày đếm ngược đến Kỳ thi quan trọng
  const [examDateStr, setExamDateStr] = useState(() => {
    return localStorage.getItem('edumanager_exam_date') || '2027-06-27';
  });
  const [isEditingExamDate, setIsEditingExamDate] = useState(false);

  const examDateObj = new Date(examDateStr + 'T00:00:00');
  const today = new Date();
  const timeDiff = examDateObj.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  const examYear = examDateObj.getFullYear();

  const handleExamDateChange = (e) => {
    const newDate = e.target.value;
    setExamDateStr(newDate);
    localStorage.setItem('edumanager_exam_date', newDate);
    setIsEditingExamDate(false);
  };

  // Tính toán % tiến độ thực tế theo từng chương an toàn
  const validCurriculum = Array.isArray(currentCurriculum) ? currentCurriculum : GRADE_12_CURRICULUM;
  
  const topicProgressList = validCurriculum.map((chap, idx) => {
    const items = chap && Array.isArray(chap.items) ? chap.items : [];
    const itemIds = items.map(i => i.id);

    // Lọc chính xác các đề thi thuộc chương này
    const chapterExams = (allExamsList || []).filter(e => 
      e && !e.isHidden && (e.chapterId === chap.chapterId || itemIds.includes(e.curriculumId) || itemIds.includes(e.id))
    );

    const totalExamsCount = chapterExams.length;

    // Đếm chính xác số đề học sinh đã làm trong chương này
    const doneExamsCount = chapterExams.filter(e => completedExamsMap[e.id]).length;

    // Tính % hoàn thành
    const percent = totalExamsCount > 0 ? Math.round((doneExamsCount / totalExamsCount) * 100) : 0;

    return {
      id: chap.chapterId || `chap-${idx}`,
      title: chap.chapterName || `Chương ${idx + 1}`,
      progress: percent,
      doneCount: doneExamsCount,
      totalCount: totalExamsCount,
      color: CHAPTER_COLORS[idx % CHAPTER_COLORS.length]
    };
  });

  // Tính điểm % trung bình toàn bộ chương
  const totalPercentSum = topicProgressList.reduce((acc, curr) => acc + curr.progress, 0);
  const averageProgressPercent = topicProgressList.length > 0 ? Math.round(totalPercentSum / topicProgressList.length) : 0;

  // Lấy danh sách bài tập sắp đến hạn (Due Soon) cho học sinh
  useEffect(() => {
    if (isStudent && currentStudentId && studentInfo.classId) {
      try {
        const asgRaw = localStorage.getItem('edumanager_class_assignments_v2');
        if (asgRaw) {
          const allAssignments = JSON.parse(asgRaw);
          const now = new Date();
          const msIn3Days = 3 * 24 * 60 * 60 * 1000;
          
          const filtered = allAssignments.filter(asg => {
             if (asg.classId !== studentInfo.classId) return false;
             if (asg.isHidden) return false;
             
             // Bỏ qua các bài đã nộp
             const submissions = asg.submissions || {};
             const submitted = submissions[currentStudentId] || submissions[currentStudentId.replace('10T8-', 'HS')] || submissions[currentStudentId.replace('HS', '10T8-')];
             if (submitted) return false;

             if (!asg.deadline) return false;
             const deadlineDate = new Date(asg.deadline);
             const diff = deadlineDate.getTime() - now.getTime();
             
             // Nằm trong tương lai và trong vòng 3 ngày
             return diff > 0 && diff <= msIn3Days;
          });

          const formattedTasks = filtered.map(asg => {
             const deadlineDate = new Date(asg.deadline);
             const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 3600);
             
             let deadlineText = '';
             const hours = String(deadlineDate.getHours()).padStart(2, '0');
             const mins = String(deadlineDate.getMinutes()).padStart(2, '0');
             if (diffHours <= 24) deadlineText = `Hôm nay, ${hours}:${mins}`;
             else if (diffHours <= 48) deadlineText = `Ngày mai, ${hours}:${mins}`;
             else deadlineText = `${deadlineDate.toLocaleDateString('vi-VN')} ${hours}:${mins}`;

             return {
               id: asg.id,
               title: asg.title,
               subject: asg.className || 'Bài tập',
               deadline: deadlineText,
               isUrgent: diffHours <= 24,
               questions: asg.questionsCount || 0,
               link: '/assignments'
             };
          });

          // Sắp xếp theo hạn nộp gần nhất
          formattedTasks.sort((a, b) => {
             return a.isUrgent === b.isUrgent ? 0 : a.isUrgent ? -1 : 1;
          });

          setDueTasks(formattedTasks);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setDueTasks([]);
    }
  }, [isStudent, currentStudentId, studentInfo.classId]);

  const [inProgressExam, setInProgressExam] = useState(null);
  const [suggestedExams, setSuggestedExams] = useState([]);

  useEffect(() => {
    if (isStudent && currentStudentId) {
      // 1. Kiểm tra đề đang làm dở
      const unfinishedRaw = localStorage.getItem('edumanager_unfinished_exams');
      if (unfinishedRaw) {
        try {
          const unfinishedMap = JSON.parse(unfinishedRaw);
          const myUnfinished = unfinishedMap[currentStudentId];
          if (myUnfinished) {
            setInProgressExam(myUnfinished);
          } else {
            setInProgressExam(null);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setInProgressExam(null);
      }

      // 2. Lấy đề gợi ý (chỉ thuộc khối của học sinh)
      const allExamsRaw = localStorage.getItem('edumanager_exams_data_v7');
      const completedExamsRaw = localStorage.getItem('edumanager_completed_exams');
      if (allExamsRaw) {
        try {
          const allExams = JSON.parse(allExamsRaw);
          const completedMap = completedExamsRaw ? JSON.parse(completedExamsRaw)[currentStudentId] || {} : {};
          
          // Tạo tập hợp ID chương trình học hiện hành
          const currentCurriculumIds = new Set();
          validCurriculum.forEach(chap => {
            if (chap.chapterId) currentCurriculumIds.add(chap.chapterId);
            if (chap.items) {
              chap.items.forEach(i => currentCurriculumIds.add(i.id));
            }
          });

          const notCompleted = allExams.filter(ex => {
            if (completedMap[ex.id] || ex.isHidden || !ex.questions || ex.questions.length === 0) return false;
            // Chỉ lấy những đề thuộc khối hiện hành
            return currentCurriculumIds.has(ex.chapterId) || currentCurriculumIds.has(ex.curriculumId) || currentCurriculumIds.has(ex.id);
          });
          
          setSuggestedExams(notCompleted.sort(() => 0.5 - Math.random()).slice(0, 2));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isStudent, currentStudentId, validCurriculum]);

  const formatTimeMinutes = (seconds) => {
    const m = Math.floor(seconds / 60);
    return `${m} phút`;
  };

  // Biến thiên điểm số qua các lần thi thử gần nhất (Biểu đồ đường)
  const actualScoreHistory = Object.values(completedExamsMap || {})
    .filter(record => record.completedAt !== undefined && record.score !== undefined)
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
    .slice(-10) // Lấy tối đa 10 lần gần nhất
    .map((record, index) => ({
      test: `Lần ${index + 1}`,
      score: record.score
    }));

  const scoreHistory = actualScoreHistory;

  const currentAverageScore = scoreHistory.length > 0 
    ? (scoreHistory.reduce((sum, r) => sum + r.score, 0) / scoreHistory.length).toFixed(1)
    : '0.0';

  const targetGap = (parseFloat(targetScore) - parseFloat(currentAverageScore)).toFixed(1);

  let trendText = '';
  let trendClass = '';
  if (scoreHistory.length >= 2) {
    const firstScore = scoreHistory[0].score;
    const lastScore = scoreHistory[scoreHistory.length - 1].score;
    const diff = (lastScore - firstScore).toFixed(1);
    if (diff > 0) {
      trendText = `📈 Xu hướng tăng (+${diff}đ)`;
      trendClass = 'text-emerald-600';
    } else if (diff < 0) {
      trendText = `📉 Xu hướng giảm (${diff}đ)`;
      trendClass = 'text-rose-600';
    } else {
      trendText = `➖ Phong độ ổn định`;
      trendClass = 'text-slate-500';
    }
  }

  // Đánh giá năng lực theo phân môn (Phân tích mạng nhện / Năng lực)
  const getBranchFromChapterName = (chapterName) => {
    const name = (chapterName || '').toUpperCase();
    if (name.includes('XÁC SUẤT') || name.includes('XAC SUAT') || name.includes('SỐ LIỆU') || name.includes('SO LIEU') || name.includes('TỔ HỢP') || name.includes('TO HOP') || name.includes('THỐNG KÊ') || name.includes('THONG KE')) {
      return 'Xác suất & Thống kê';
    }
    if (name.includes('HÌNH HỌC') || name.includes('HINH HOC') || name.includes('VECTƠ') || name.includes('VECTO') || name.includes('TOẠ ĐỘ') || name.includes('TOA DO') || name.includes('KHÔNG GIAN') || name.includes('KHONG GIAN') || name.includes('HỆ THỨC LƯỢNG') || name.includes('TAM GIÁC') || name.includes('MẶT PHẲNG') || name.includes('SONG SONG') || name.includes('VUÔNG GÓC')) {
      return 'Hình học';
    }
    return 'Đại số & Giải tích';
  };

  const branchStats = {
    'Đại số & Giải tích': { totalScore: 0, count: 0 },
    'Hình học': { totalScore: 0, count: 0 },
    'Xác suất & Thống kê': { totalScore: 0, count: 0 }
  };

  // Tạo tập hợp ID chương trình học hiện hành (để lọc Đánh giá năng lực theo phân môn)
  const branchCurriculumIds = new Set();
  validCurriculum.forEach(chap => {
    if (chap.chapterId) branchCurriculumIds.add(chap.chapterId);
    if (chap.items) {
      chap.items.forEach(i => branchCurriculumIds.add(i.id));
    }
  });

  Object.values(completedExamsMap || {}).forEach(examRecord => {
    const examDetail = (allExamsList || []).find(e => e.id === examRecord.examId);
    if (examDetail && examDetail.chapterName) {
      // KIỂM TRA: Đề thi này có thuộc chương trình học hiện hành của học sinh không?
      const isBelongToCurrentGrade = branchCurriculumIds.has(examDetail.chapterId) 
                                     || branchCurriculumIds.has(examDetail.curriculumId) 
                                     || branchCurriculumIds.has(examDetail.id);
                                     
      if (isBelongToCurrentGrade) {
        const branchName = getBranchFromChapterName(examDetail.chapterName);
        if (branchStats[branchName]) {
          branchStats[branchName].totalScore += (examRecord.score || 0);
          branchStats[branchName].count += 1;
        }
      }
    }
  });

  const branchStrengths = Object.keys(branchStats).map(branch => {
    const stat = branchStats[branch];
    const avgScore = stat.count > 0 ? (stat.totalScore / stat.count).toFixed(1) : '0.0';
    const numScore = parseFloat(avgScore);
    
    let status = 'neutral';
    if (numScore >= 8.0) status = 'strong';
    else if (numScore < 6.5 && stat.count > 0) status = 'weak';

    let dynamicDesc = '';
    if (stat.count === 0) dynamicDesc = 'Chưa có dữ liệu làm bài';
    else if (numScore >= 8.0) dynamicDesc = 'Nắm chắc kiến thức, xử lý nhanh';
    else if (numScore >= 6.5) dynamicDesc = 'Kiến thức khá, cần luyện thêm tốc độ';
    else dynamicDesc = 'Cần ôn lại lý thuyết và bổ sung kỹ năng giải';

    return {
      branch,
      score: stat.count > 0 ? numScore : '-',
      status,
      desc: dynamicDesc
    };
  });

  // Lọc thông báo hiển thị cho học sinh và giáo viên
  const displayedNotices = isTeacher 
    ? notices 
    : notices.filter(n => !n.targetClass || n.targetClass === 'ALL' || n.targetClass === studentInfo.className);

  return (
    <div className="dashboard">
      {/* Hero Welcome & Countdown Banner */}
      <div className="dashboard-hero">
        <div className="hero-text">
          <h1>
            <Sparkles size={24} color="#fef08a" />
            {isTeacher ? 'Bảng Điều Khiển Giảng Dạy & Quản Trị' : 'Bảng Điều Khiển Học Tập'}
          </h1>
          <p>
            {isTeacher 
              ? 'Theo dõi toàn bộ tiến độ lớp học, sĩ số và kết quả rèn luyện của học sinh.'
              : 'Chào mừng bạn trở lại! Hãy duy trì nhịp độ ôn tập để sẵn sàng bứt phá điểm số.'}
          </p>
        </div>

        <div className="hero-countdown" style={{ position: 'relative' }}>
          <div className="countdown-icon">
            <Flame size={28} color="#fef08a" />
          </div>
          <div className="countdown-info">
            <span className="countdown-days">{daysLeft} Ngày</span>
            {isEditingExamDate && isTeacher ? (
              <input 
                type="date" 
                value={examDateStr} 
                onChange={handleExamDateChange}
                onBlur={() => setIsEditingExamDate(false)}
                autoFocus
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  marginTop: '2px'
                }}
              />
            ) : (
              <span className="countdown-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Đến Kỳ Thi Tốt Nghiệp THPT {examYear}
                {isTeacher && (
                  <button 
                    onClick={() => setIsEditingExamDate(true)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0, display: 'flex' }}
                    title="Đổi ngày thi"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gamification Bar (Chỉ Học Sinh) */}
      {isStudent && (
        <div style={{
          display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap'
        }}>
          {/* XP */}
          <div style={{ flex: 1, minWidth: '150px', background: 'var(--surface-color)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04', padding: '0.5rem', borderRadius: '50%' }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TỔNG ĐIỂM (XP)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>{gamificationData.xp}</div>
            </div>
          </div>
          
          {/* Streak */}
          <div style={{ flex: 1, minWidth: '150px', background: 'var(--surface-color)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.5rem', borderRadius: '50%' }}>
              <Flame size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CHUỖI NGÀY</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{gamificationData.streak} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ngày</span></div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ flex: 2, minWidth: '250px', background: 'var(--surface-color)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', padding: '0.5rem', borderRadius: '50%' }}>
              <Medal size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>HUY HIỆU ĐÃ MỞ KHÓA</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {gamificationData.badges && gamificationData.badges.length > 0 ? (
                  gamificationData.badges.map((b, i) => (
                    <span key={i} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {b}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Chưa có huy hiệu nào. Hãy nỗ lực nhé!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row 1: Tổng quan tiến độ, Mục tiêu cá nhân & Bảng tin thông báo */}
      <div className="overview-grid">
        {/* 1. Tiến độ học theo chuyên đề */}
        <div className="card">
          <div className="card-title-bar">
            <h3>
              <Layers size={18} color="var(--primary-color)" />
              Tiến Độ Theo Chuyên Đề
            </h3>
            <span className="text-xs font-semibold" style={{ color: 'var(--primary-color)' }}>
              Trung bình: {averageProgressPercent}%
            </span>
          </div>

          <div className="topic-progress-list" style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {topicProgressList.map(topic => (
              <div key={topic.id} className="topic-item">
                <div className="topic-meta">
                  <span style={{ fontSize: '0.825rem', color: '#334155', fontWeight: 600 }}>
                    {topic.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      ({topic.doneCount}/{topic.totalCount} đề)
                    </span>
                    <span style={{ color: topic.color, fontWeight: 700 }}>
                      {topic.progress}%
                    </span>
                  </div>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${topic.progress}%`, backgroundColor: topic.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* 3. Bảng tin (Notice Board) */}
        <div className="card">
          <div className="card-title-bar">
            <h3>
              <Bell size={18} color="#f59e0b" />
              Bảng Tin {isTeacher ? 'Lớp Học' : 'Giáo Viên'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold">{displayedNotices.length} tin</span>
              {isTeacher && (
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                  onClick={() => handleOpenNoticeModal()}
                >
                  <Plus size={14} /> Thêm tin
                </button>
              )}
            </div>
          </div>

          <div className="notice-list" style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {displayedNotices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Chưa có thông báo nào.
              </div>
            ) : (
              displayedNotices.map(n => (
                <div key={n.id} className={`notice-item ${n.isPinned ? 'pinned' : ''}`} style={{ position: 'relative' }}>
                  <div className="notice-title-row">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="notice-title">{n.title}</span>
                      {n.targetClass && n.targetClass !== 'ALL' && (
                        <span style={{ 
                          fontSize: '0.675rem', 
                          fontWeight: '700', 
                          background: '#e0e7ff', 
                          color: '#4338ca', 
                          padding: '1px 6px', 
                          borderRadius: '4px' 
                        }}>
                          {n.targetClass}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <span className="notice-time">{n.date}</span>
                      {isTeacher && (
                        <div className="flex items-center gap-1.5" style={{ marginLeft: '4px' }}>
                          <button 
                            onClick={() => handleOpenNoticeModal(n)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', padding: '2px' }}
                            title="Sửa"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            onClick={() => handleDeleteNotice(n.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}
                            title="Xóa"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                    {n.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 2: To-Do List, Lịch thi thử & Phân tích phong độ Analytics */}
      <div className="dashboard-main-grid">
        {/* Cột Trái: Quản lý nhiệm vụ (To-Do list) & Bài đang làm dở */}
        <div className="flex flex-col gap-4">
          {/* Bài tập sắp đến hạn */}
          <div className="card">
            <div className="card-title-bar">
              <h3>
                <Clock size={18} color="#dc2626" />
                Nhiệm Vụ & Bài Tập Sắp Đến Hạn (Due Soon)
              </h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => navigate('/exams')}>
                Xem tất cả
              </button>
            </div>

            <div className="task-list">
              {dueTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  🎉 Tuyệt vời! Bạn không có bài tập nào sắp đến hạn nộp.
                </div>
              )}
              {dueTasks.map(t => (
                <div key={t.id} className="task-card">
                  <div className="task-left">
                    <div 
                      className="task-icon-circle" 
                      style={{ 
                        backgroundColor: t.isUrgent ? '#fee2e2' : '#e0e7ff',
                        color: t.isUrgent ? '#dc2626' : '#4338ca'
                      }}
                    >
                      <BookOpen size={18} />
                    </div>
                    <div className="task-details">
                      <h4>{t.title}</h4>
                      <div className="task-meta">
                        <span>{t.subject}</span>
                        <span>•</span>
                        <span className={t.isUrgent ? 'due-urgent' : ''}>Hạn: {t.deadline}</span>
                        <span>•</span>
                        <span>{t.questions} câu</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className={`btn ${t.isUrgent ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    onClick={() => navigate(t.link)}
                  >
                    <span>Làm bài</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tiếp Tục Làm Bài & Đề thi gợi ý */}
          <div className="card">
            <div className="card-title-bar">
              <h3>
                <GraduationCap size={18} color="#059669" />
                Tiến Độ & Gợi Ý Luyện Đề
              </h3>
            </div>

            {/* Bài đang làm dở (In Progress) */}
            {inProgressExam && (
              <div style={{ 
                background: '#f0fdf4', 
                border: '1px solid #bbf7d0', 
                borderRadius: 'var(--radius-md)', 
                padding: '1rem 1.25rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#22c55e', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                      ĐANG LÀM DỞ
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>
                      {inProgressExam.examTitle}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#166534' }}>
                    Đã làm <strong>{inProgressExam.answeredCount}/{inProgressExam.totalCount} câu</strong> • Thời gian còn lại: <strong>{formatTimeMinutes(inProgressExam.timeLeft)}</strong>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                  onClick={() => navigate('/exams', { state: { resumeExamId: inProgressExam.examId } })}
                >
                  <Play size={15} />
                  <span>Tiếp tục làm</span>
                </button>
              </div>
            )}

            {/* Các đề thi gợi ý */}
            <div>
              {suggestedExams.map(ex => (
                <div key={ex.id} className="upcoming-exam-item">
                  <div>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.2rem' }}>
                      <span className="exam-status-tag ongoing" style={{background: '#fef3c7', color: '#d97706'}}>
                        GỢI Ý LÀM BÀI
                      </span>
                      <strong style={{ fontSize: '0.875rem' }}>{ex.title}</strong>
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      Thời gian: {ex.duration} phút • {ex.questions?.length || 0} câu
                    </div>
                  </div>

                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => navigate('/exams')}
                  >
                    Vào phòng thi
                  </button>
                </div>
              ))}
              
              {suggestedExams.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem', fontSize: '0.85rem' }}>
                  Hiện tại không có đề thi gợi ý nào hoặc bạn đã hoàn thành tất cả!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cột Phải: Phân tích phong độ Analytics (Biểu đồ đường & Đánh giá năng lực) */}
        <div className="flex flex-col gap-4">
          {/* Biểu đồ đường thể hiện phong độ thi thử */}
          <div className="card">
            <div className="card-title-bar">
              <h3>
                <TrendingUp size={18} color="#4f46e5" />
                Biến Thiên Phong Độ Thi Thử
              </h3>
              {trendText && (
                <span className={`text-xs font-semibold ${trendClass}`}>{trendText}</span>
              )}
            </div>

            <div className="chart-container-custom" style={{ width: '100%', height: 250 }}>
              {scoreHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreHistory} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="test" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', background: 'var(--surface-color)' }}
                      labelStyle={{ fontWeight: 'bold', color: 'var(--text-primary)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      name="Điểm số"
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                      dot={{ r: 4, fill: '#fff', stroke: '#4f46e5', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Chưa có dữ liệu thi thử. Bạn hãy làm bài để xem biến thiên phong độ nhé!
                </div>
              )}
            </div>
          </div>

          {/* Đánh giá năng lực theo phân môn (Radar / Strength Matrix) */}
          <div className="card hover-lift">
            <div className="card-title-bar">
              <h3>
                <Compass size={18} color="#0ea5e9" />
                Đánh Giá Năng Lực Theo Phân Môn
              </h3>
            </div>

            <div className="radar-grid" style={{ width: '100%', height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={branchStrengths}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="branch" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar 
                    name="Điểm TB" 
                    dataKey="score" 
                    stroke="#0ea5e9" 
                    fill="#0ea5e9" 
                    fillOpacity={0.3} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {branchStrengths.map((b, idx) => (
                <div key={idx} className="radar-sub-item" style={{ padding: '0.5rem' }}>
                  <div className="radar-header">
                    <span>{b.branch}</span>
                    <span className={`radar-tag ${b.status}`}>
                      {b.score} / 10
                    </span>
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                    {b.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Menu Truy Cập Nhanh (Quick Navigation) */}
      <div className="card">
        <div className="card-title-bar">
          <h3>
            <BarChart2 size={18} color="var(--primary-color)" />
            Lối Tắt Truy Cập Nhanh
          </h3>
        </div>

        <div className="quick-tiles-grid">
          <div className="quick-tile hover-lift" onClick={() => navigate('/exams')}>
            <div className="tile-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
              <GraduationCap size={24} />
            </div>
            <strong style={{ fontSize: '0.85rem' }}>Luyện Thi Thử</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>120+ đề thi có lời giải</span>
          </div>

          <div className="quick-tile hover-lift" onClick={() => navigate('/documents')}>
            <div className="tile-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
              <FileText size={24} />
            </div>
            <strong style={{ fontSize: '0.85rem' }}>Kho Tài Liệu</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lý thuyết & công thức</span>
          </div>

          <div className="quick-tile hover-lift" onClick={() => navigate('/classes')}>
            <div className="tile-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
              <BookOpen size={24} />
            </div>
            <strong style={{ fontSize: '0.85rem' }}>Lớp Học Của Tôi</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bảng điểm & bạn cùng lớp</span>
          </div>

          <div className="quick-tile hover-lift" onClick={() => navigate('/leaderboard')}>
            <div className="tile-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
              <Award size={24} />
            </div>
            <strong style={{ fontSize: '0.85rem' }}>Bảng Xếp Hạng</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Top thi đua tuần & tháng</span>
          </div>
        </div>
      </div>

      {/* Notice Management Modal */}
      {showNoticeModal && isTeacher && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowNoticeModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '500px', width: '92%' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{editingNotice ? 'Chỉnh Sửa Thông Báo' : 'Thêm Thông Báo Mới'}</h3>
              <button className="close-btn" onClick={() => setShowNoticeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveNotice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tiêu đề thông báo</label>
                <input 
                  type="text" 
                  className="form-control"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="Ví dụ: Lịch thi thử đợt 5..."
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Gửi đến lớp</label>
                <select 
                  className="form-control"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  value={noticeForm.targetClass}
                  onChange={(e) => setNoticeForm({ ...noticeForm, targetClass: e.target.value })}
                >
                  <option value="ALL">Tất cả các lớp (Công khai)</option>
                  {classList.map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nội dung thông báo</label>
                <textarea 
                  className="form-control"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '120px', resize: 'vertical' }}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="Nhập nội dung thông báo cụ thể gửi học sinh..."
                  required
                />
              </div>

              <div className="form-group flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="isPinned"
                  checked={noticeForm.isPinned}
                  onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })}
                />
                <label htmlFor="isPinned" style={{ fontSize: '0.875rem', cursor: 'pointer', userSelect: 'none' }}>Ghim thông báo lên đầu (Màu đỏ)</label>
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNoticeModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingNotice ? 'Lưu thay đổi' : 'Đăng thông báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
