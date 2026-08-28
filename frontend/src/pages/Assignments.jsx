import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Play, 
  Check, 
  BarChart2, 
  FileText, 
  Sparkles,
  ArrowRight,
  School,
  X,
  Code2,
  UploadCloud,
  FileCheck,
  Eye,
  EyeOff,
  Edit,
  Globe,
  Lock,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import MathView from '../components/MathView';
import { stripLatexComments, extractBracedBlocks, parseImminiBlock, cleanQuestionObj } from '../utils/latexUtils';
import './Assignments.css';

// Phân tích mã nguồn LaTeX đa năng hỗ trợ các dạng câu hỏi chuẩn
const parseLatexStringToQuestions = (rawText) => {
  if (!rawText || !rawText.trim()) return [];

  try {
    const cleanSource = stripLatexComments(rawText);
    let blocks = [];

    const envRegex = /\\begin\s*\{\s*(?:ex|bt|vd|cau)\s*\}(?:\[[^\]]*\])*([\s\S]*?)\\end\s*\{\s*(?:ex|bt|vd|cau)\s*\}/gi;
    let match;
    while ((match = envRegex.exec(cleanSource)) !== null) {
      blocks.push(match[1]);
    }

    if (blocks.length === 0) {
      blocks = cleanSource.split(/(?:^|\n)(?:Câu\s*\d+[:.]|Bài\s*\d+[:.])/i).filter(b => b.trim().length > 0);
    }

    if (blocks.length === 0) {
      blocks = [cleanSource];
    }

    return blocks.map((rawBlock, index) => {
      let block = rawBlock.trim();
      block = block.replace(/^\s*(?:\[[^\]]*\]\s*)+/g, '').trim();
      block = block.replace(/\\par\s*(?=\\shortans)/gi, '').trim();

      const imData = parseImminiBlock(block);
      if (imData) {
        const { isLeftMode, leftPart, rightPart, beforeText, afterText } = imData;
        const choiceMatch = leftPart.match(/\\(?:choice|haicot|boncot|motcot|choiceTF|shortans)\b/i);
        if (choiceMatch) {
          const pureText = leftPart.slice(0, choiceMatch.index).trim();
          const choicesPart = leftPart.slice(choiceMatch.index).trim();
          const macro = isLeftMode ? '\\imminiL' : '\\immini';
          block = `${beforeText}\n${macro}{${pureText}}{\n${rightPart}\n}\n${choicesPart}\n${afterText}`.trim();
        }
      }

      let explanation = '';
      const loigiaiEnvMatch = block.match(/\\begin\{loigiai\}([\s\S]*?)\\end\{loigiai\}/i);
      if (loigiaiEnvMatch) {
        explanation = loigiaiEnvMatch[1].trim();
        block = block.replace(loigiaiEnvMatch[0], '');
      } else {
        const loigiaiIdx = block.indexOf('\\loigiai');
        if (loigiaiIdx !== -1) {
          const afterLoigiai = block.slice(loigiaiIdx + 8).trim();
          const braced = extractBracedBlocks(afterLoigiai);
          if (braced.length > 0) {
            explanation = braced[0].trim();
          } else {
            explanation = afterLoigiai;
          }
          block = block.slice(0, loigiaiIdx).trim();
        }
      }

      let questionType = 'multiple_choice';
      let options = [];
      let correctAnswer = 'A';
      let questionContent = block;

      const choiceTFMatch = block.match(/\\choiceTF/i);
      if (choiceTFMatch) {
        questionType = 'true_false';
        const tfIndex = choiceTFMatch.index;
        questionContent = block.slice(0, tfIndex).trim();
        const choicesPart = block.slice(tfIndex + choiceTFMatch[0].length).trim();
        const rawChoices = extractBracedBlocks(choicesPart);
        const keys = ['a', 'b', 'c', 'd'];
        rawChoices.slice(0, 4).forEach((cText, optIdx) => {
          const key = keys[optIdx] || `ý ${optIdx + 1}`;
          const isTrue = /\\True/i.test(cText);
          const cleanedText = cText.replace(/\\True/gi, '').trim();
          options.push({ key, text: cleanedText, isCorrectTrue: isTrue });
        });
      } else if (/\\shortans/i.test(block)) {
        questionType = 'short_answer';
        const shortansIdx = block.indexOf('\\shortans');
        questionContent = block.slice(0, shortansIdx).trim();
        if (questionContent.endsWith('\\par')) {
          questionContent = questionContent.slice(0, -4).trim();
        }
        const afterShortans = block.slice(shortansIdx + 9).trim();
        const braced = extractBracedBlocks(afterShortans);
        if (braced.length > 0) {
          correctAnswer = braced[0].replace(/\{,\}/g, ',').replace(/\$/g, '').trim();
        } else {
          const simpleMatch = afterShortans.match(/^\{?([^{}\n]+)\}?/);
          correctAnswer = simpleMatch ? simpleMatch[1].replace(/\{,\}/g, ',').replace(/\$/g, '').trim() : '';
        }
      } else if (/\\(?:choice|haicot|boncot|motcot)/i.test(block)) {
        questionType = 'multiple_choice';
        const choiceMatch = block.match(/\\(?:choice|haicot|boncot|motcot)/i);
        const choiceIndex = choiceMatch.index;
        questionContent = block.slice(0, choiceIndex).trim();
        const choicesPart = block.slice(choiceIndex + choiceMatch[0].length).trim();
        const rawChoices = extractBracedBlocks(choicesPart);
        const keys = ['A', 'B', 'C', 'D'];
        rawChoices.slice(0, 4).forEach((cText, optIdx) => {
          const key = keys[optIdx] || 'A';
          if (/\\True/i.test(cText)) {
            correctAnswer = key;
          }
          const cleanedText = cText.replace(/\\True/gi, '').trim();
          options.push({ key, text: cleanedText });
        });
      } else {
        questionType = 'multiple_choice';
      }

      return cleanQuestionObj({
        id: 'q_' + Date.now() + '_' + index,
        questionType,
        content: questionContent || `Câu hỏi ${index + 1}`,
        options,
        correctAnswer,
        explanation
      });
    });
  } catch (err) {
    console.error('Error parsing LaTeX in assignments:', err);
    return [];
  }
};

const ASSIGNMENTS_STORAGE_KEY = 'edumanager_class_assignments_v2';

const INITIAL_ASSIGNMENTS = [
  {
    id: 'asg-10t8-1',
    classId: 'np-10t8',
    className: 'Lớp 10T8',
    school: 'NP',
    type: 'online_latex', // 1: Làm trực tiếp trên web (LaTeX)
    title: 'Bài tập Chuyên đề 1: Mệnh đề & Tập hợp (Trực tuyến LaTeX)',
    description: 'Yêu cầu các em hoàn thành các câu hỏi trắc nghiệm dưới đây.',
    deadline: '2026-03-01T23:59',
    duration: 45,
    questionsCount: 3,
    assignedAt: '2026-02-20',
    latexCode: `\\begin{ex}
  Trong các câu sau, câu nào là một mệnh đề toán học?
  \\choice
  {$x + 2 > 5$}
  {\\True $2 + 3 = 7$}
  {Hôm nay trời đẹp quá!}
  {Bạn có thích học Toán không?}
  \\loigiai{
    Mệnh đề toán học là một khẳng định có tính đúng hoặc sai rõ ràng.
  }
\\end{ex}
\\begin{ex}
  Cho hai tập hợp $A = [-2; 3)$ và $B = [1; 5]$. Giao của hai tập hợp $A \\cap B$ là:
  \\choice
  {$[-2; 5]$}
  {\\True $[1; 3)$}
  {$[-2; 1)$}
  {$(3; 5]$}
\\end{ex}`,
    submissions: {
      '10T8-01': { submittedAt: '2026-02-22 14:30', score: 9.0, status: 'submitted', type: 'online' },
      '10T8-02': { submittedAt: '2026-02-21 19:15', score: 9.5, status: 'submitted', type: 'online' },
      '10T8-03': { submittedAt: '2026-02-22 20:00', score: 7.5, status: 'submitted', type: 'online' },
    }
  },
  {
    id: 'asg-10t8-2',
    classId: 'np-10t8',
    className: 'Lớp 10T8',
    school: 'NP',
    type: 'file_upload', // 2: Nộp file PDF / Hình ảnh
    title: 'Nộp bài tập tự luận: Phương trình Đường thẳng trong Mặt phẳng Oxy',
    description: 'Các em giải chi tiết bài 1, 2, 3 trang 45 SGK ra giấy vở, sau đó chụp ảnh rõ nét hoặc scan file PDF tải lên đây.',
    deadline: '2026-03-05T23:59',
    duration: 60,
    questionsCount: 3,
    assignedAt: '2026-02-22',
    attachmentUrl: '',
    submissions: {
      '10T8-01': { 
        submittedAt: '2026-02-23 08:00', 
        score: 8.5, 
        status: 'submitted', 
        type: 'file',
        fileName: 'BaiTap_NguyenVanAn_Oxy.pdf',
        fileSize: '1.8 MB'
      },
    }
  },
  {
    id: 'asg-12t6-1',
    classId: 'np-12t6',
    className: 'Lớp 12T6',
    school: 'NP',
    type: 'online_latex',
    title: 'Nhiệm vụ tuần 24: Khảo sát hàm số & Tích phân nâng cao',
    description: 'Bộ 40 câu trắc nghiệm chuẩn cấu trúc đề thi Tốt nghiệp THPT 2026.',
    deadline: '2026-03-02T23:59',
    duration: 90,
    questionsCount: 40,
    assignedAt: '2026-02-21',
    submissions: {
      '12T6-01': { submittedAt: '2026-02-22 16:40', score: 9.5, status: 'submitted', type: 'online' },
      '12T6-02': { submittedAt: '2026-02-22 21:10', score: 8.2, status: 'submitted', type: 'online' },
    }
  },
  {
    id: 'asg-thth108-1',
    classId: 'thth-10.8',
    className: 'Lớp 10.8',
    school: 'THTH',
    type: 'file_upload',
    title: 'Nộp vở bài tập: Hình học Vectơ & Tích vô hướng',
    description: 'Chụp ảnh các bài tập tự luyện chương Vectơ và tải lên file ảnh hoặc PDF.',
    deadline: '2026-02-28T23:59',
    duration: 45,
    questionsCount: 5,
    assignedAt: '2026-02-22',
    submissions: {
      '10.8-01': { submittedAt: '2026-02-22 10:15', score: 10.0, status: 'submitted', type: 'file', fileName: 'VoGiai_NguyenTHTH.pdf', fileSize: '2.4 MB' },
    }
  }
];

const Assignments = () => {
  const navigate = useNavigate();
  const { isTeacher, isStudent, currentStudentId } = useRole();

  const [classesList, setClassesList] = useState([]);
  const [activeClassId, setActiveClassId] = useState('np-10t8');

  const [assignments, setAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ASSIGNMENTS;
  });

  useEffect(() => {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    const saved = localStorage.getItem('edumanager_classes_data');
    if (saved) {
      try {
        const cls = JSON.parse(saved);
        setClassesList(cls);
        if (cls.length > 0) {
          if (isStudent) {
            const myCls = cls.find(c => (c.students || []).some(s => s.id === currentStudentId));
            if (myCls) setActiveClassId(myCls.id);
          } else {
            setActiveClassId(cls[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isStudent, currentStudentId]);



  // Modal nộp file của học sinh
  const [submittingFileAsg, setSubmittingFileAsg] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');

  // Kéo thả & Nạp file LaTeX
  const texFileInputRef = useRef(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const processUploadedTexFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setFormData(prev => ({ ...prev, latexCode: content }));
      alert(`Đã nạp thành công mã nguồn từ file "${file.name}"!`);
    };
    reader.readAsText(file);
  };

  const handleUploadTexFile = (e) => {
    const file = e.target.files?.[0];
    processUploadedTexFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processUploadedTexFile(file);
    }
  };

  // Form giao bài tập
  const [formData, setFormData] = useState({
    classId: 'np-10t8',
    type: 'online_latex', // 'online_latex' | 'file_upload'
    title: '',
    description: '',
    deadline: '',
    duration: 45,
    questionsCount: 20,
    latexCode: ''
  });

  // Modal tạo / chỉnh sửa bài tập
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [expandedProgressId, setExpandedProgressId] = useState(null);

  const currentClass = classesList.find(c => c.id === activeClassId) || classesList[0];
  
  // Lọc nhiệm vụ: Nếu là học sinh chỉ thấy các bài tập ĐÃ CÔNG KHAI (isPublic !== false); Giáo viên thấy toàn bộ
  const currentClassAssignments = assignments.filter(asg => {
    if (asg.classId !== activeClassId) return false;
    if (isStudent && asg.isHidden) return false;
    return true;
  });
  
  const totalStudentsInClass = currentClass?.students?.length || 1;

  // Mở modal tạo bài tập mới
  const handleOpenCreateModal = () => {
    setEditingAssignmentId(null);
    setFormData({
      classId: activeClassId,
      type: 'online_latex',
      title: '',
      description: '',
      deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
      duration: 45,
      questionsCount: 20,
      latexCode: ''
    });
    setShowCreateModal(true);
  };

  // Mở modal chỉnh sửa đề bài đã có
  const handleOpenEditAssignment = (asg) => {
    setEditingAssignmentId(asg.id);
    setFormData({
      classId: asg.classId,
      type: asg.type || 'online_latex',
      title: asg.title,
      description: asg.description || '',
      deadline: asg.deadline || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
      duration: asg.duration || 45,
      questionsCount: asg.questionsCount || 20,
      latexCode: asg.latexCode || ''
    });
    setShowCreateModal(true);
  };

  // Bật / Tắt trạng thái Ẩn / Hiện (Public / Hide) bài tập
  const handleToggleAssignmentVisibility = (asgId) => {
    setAssignments(prev => prev.map(a => {
      if (a.id !== asgId) return a;
      const nextHidden = !a.isHidden;
      return { ...a, isHidden: nextHidden };
    }));
  };

  // Lưu bài tập (Tạo mới hoặc Cập nhật)
  const handleSaveAssignment = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const targetCls = classesList.find(c => c.id === formData.classId);

    if (editingAssignmentId) {
      // Cập nhật bài tập đã có
      setAssignments(prev => prev.map(a => {
        if (a.id !== editingAssignmentId) return a;
        return {
          ...a,
          classId: formData.classId,
          className: targetCls?.name || a.className,
          school: targetCls?.school || a.school,
          type: formData.type,
          title: formData.title.trim(),
          description: formData.description.trim(),
          deadline: formData.deadline,
          duration: Number(formData.duration) || 45,
          questionsCount: Number(formData.questionsCount) || (formData.type === 'online_latex' ? 10 : 5),
          latexCode: formData.type === 'online_latex' ? formData.latexCode : '',
        };
      }));
    } else {
      // Tạo bài tập mới
      const newAsg = {
        id: `asg-${Date.now()}`,
        classId: formData.classId,
        className: targetCls?.name || 'Lớp học',
        school: targetCls?.school || 'NP',
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        deadline: formData.deadline,
        duration: Number(formData.duration) || 45,
        questionsCount: Number(formData.questionsCount) || (formData.type === 'online_latex' ? 10 : 5),
        latexCode: formData.type === 'online_latex' ? formData.latexCode : '',
        assignedAt: new Date().toISOString().slice(0, 10),
        isHidden: false, // Mặc định là Public hiển thị cho học sinh
        submissions: {}
      };

      setAssignments([newAsg, ...assignments]);
    }

    setShowCreateModal(false);
    setEditingAssignmentId(null);
  };

  // Xóa bài tập
  const handleDeleteAssignment = (asgId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhiệm vụ bài tập này khỏi lớp?')) {
      setAssignments(assignments.filter(a => a.id !== asgId));
    }
  };

  // Học sinh nộp file PDF / Hình ảnh
  const handleStudentFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadedFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    }
  };

  const handleConfirmSubmitFile = () => {
    if (!uploadedFileName) {
      alert('Vui lòng chọn file PDF hoặc hình ảnh bài làm trước khi nộp!');
      return;
    }

    setAssignments(prev => prev.map(a => {
      if (a.id !== submittingFileAsg.id) return a;
      return {
        ...a,
        submissions: {
          ...a.submissions,
          [currentStudentId]: {
            submittedAt: new Date().toLocaleString('vi-VN'),
            score: 9.0, // Điểm chờ giáo viên chấm hoặc chấm mẫu
            status: 'submitted',
            type: 'file',
            fileName: uploadedFileName,
            fileSize: uploadedFileSize
          }
        }
      };
    }));

    alert(`🎉 Đã tải lên và nộp thành công file "${uploadedFileName}"!`);
    setSubmittingFileAsg(null);
    setUploadedFileName('');
    setUploadedFileSize('');
  };

  // Học sinh làm bài online trực tiếp
  const handleStudentDoOnline = (asg) => {
    const randomScore = (8.0 + Math.random() * 2.0).toFixed(1);
    setAssignments(prev => prev.map(a => {
      if (a.id !== asg.id) return a;
      return {
        ...a,
        submissions: {
          ...a.submissions,
          [currentStudentId]: {
            submittedAt: new Date().toLocaleString('vi-VN'),
            score: Number(randomScore),
            status: 'submitted',
            type: 'online'
          }
        }
      };
    }));
    alert(`🎉 Bạn đã hoàn thành bài tập trực tuyến! Kết quả: ${randomScore}/10 điểm.`);
  };

  return (
    <div className="assignments-page">
      {/* Header */}
      <div className="assignments-header">
        <div className="assignments-title-area">
          <h1>
            <BookOpen className="text-primary" size={28} />
            Quản Lý Giao Bài Tập & Báo Cáo Tiến Độ Lớp
          </h1>
          <p className="assignments-subtitle">
            {isTeacher 
              ? 'Giao bài tập theo lớp: Làm trực tiếp trên web (đề chuẩn LaTeX) hoặc Nộp file PDF/Hình ảnh tự luận.'
              : `Nhiệm vụ & Bài tập được giáo viên giao cho ${currentClass?.name || 'lớp bạn'}.`}
          </p>
        </div>

        {isTeacher && (
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={18} />
            <span>Giao Bài Tập Mới</span>
          </button>
        )}
      </div>

      {/* Tabs chọn lớp cho Giáo viên */}
      {isTeacher && classesList.length > 0 && (
        <div className="class-selector-tabs">
          {classesList.map(cls => {
            const count = assignments.filter(a => a.classId === cls.id).length;
            return (
              <button
                key={cls.id}
                className={`class-tab-item ${activeClassId === cls.id ? 'active' : ''}`}
                onClick={() => setActiveClassId(cls.id)}
              >
                <School size={16} />
                <span>{cls.name} ({cls.school})</span>
                <span className="class-tab-badge">{count} bài</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Thống kê tiến độ */}
      <div className="assignment-stats-grid">
        <div className="asg-stat-card">
          <div className="asg-stat-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <h3 className="asg-stat-val">{currentClassAssignments.length}</h3>
            <p className="asg-stat-lbl">Nhiệm vụ đã giao ({currentClass?.name})</p>
          </div>
        </div>

        <div className="asg-stat-card">
          <div className="asg-stat-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
            <Users size={22} />
          </div>
          <div>
            <h3 className="asg-stat-val">{totalStudentsInClass} học sinh</h3>
            <p className="asg-stat-lbl">Sĩ số lớp hiện tại</p>
          </div>
        </div>

        <div className="asg-stat-card">
          <div className="asg-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <BarChart2 size={22} />
          </div>
          <div>
            <h3 className="asg-stat-val">
              {currentClassAssignments.length > 0 && totalStudentsInClass > 0 ? (
                Math.round(
                  (currentClassAssignments.reduce((acc, a) => {
                    const classStudents = currentClass?.students || [];
                    const submitted = classStudents.filter(st => {
                      return !!(a.submissions?.[st.id] || 
                                a.submissions?.[st.id?.replace('10T8-', 'HS')] || 
                                a.submissions?.[st.id?.replace('HS', '10T8-')] ||
                                (st.id?.startsWith('HS') ? a.submissions?.[`10T8-${st.id.replace('HS', '')}`] : null));
                    }).length;
                    return acc + submitted;
                  }, 0) / (currentClassAssignments.length * totalStudentsInClass)) * 100
                ) + '%'
              ) : '0%'}
            </h3>
            <p className="asg-stat-lbl">Tỷ lệ nộp bài trung bình</p>
          </div>
        </div>
      </div>

      {/* Danh sách nhiệm vụ */}
      <div className="assignments-list">
        {currentClassAssignments.length > 0 ? (
          currentClassAssignments.map((asg) => {
            const classStudents = currentClass?.students || [];
            // Đếm chính xác số học sinh trong lớp này đã có bài nộp
            const submittedStudents = classStudents.filter(st => {
              const sub = asg.submissions?.[st.id] || asg.submissions?.[st.id.replace('10T8-', 'HS')] || asg.submissions?.[st.id.replace('HS', '10T8-')];
              return !!sub;
            });
            const submittedCount = submittedStudents.length;
            const submitPercent = totalStudentsInClass > 0 ? Math.min(100, Math.round((submittedCount / totalStudentsInClass) * 100)) : 0;
            const isDrawerOpen = expandedProgressId === asg.id;

            const mySubmission = asg.submissions?.[currentStudentId] || asg.submissions?.[currentStudentId?.replace('10T8-', 'HS')] || asg.submissions?.[currentStudentId?.replace('HS', '10T8-')];
            const hasSubmitted = !!mySubmission;
            const isOnline = asg.type === 'online_latex';

            return (
              <div key={asg.id} className="assignment-item-card">
                <div className="assignment-top-row">
                  <div className="assignment-title-group">
                    <div className="assignment-type-icon" style={{ background: isOnline ? '#eef2ff' : '#fef3c7', color: isOnline ? '#4f46e5' : '#b45309' }}>
                      {isOnline ? <Code2 size={20} /> : <UploadCloud size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2" style={{ marginBottom: '0.2rem' }}>
                        <span className={`badge-tag ${isOnline ? 'type-online' : 'type-file'}`}>
                          {isOnline ? '💻 Trực Tuyến (LaTeX)' : '📁 Nộp File PDF / Ảnh'}
                        </span>
                        {isTeacher && asg.isHidden && (
                          <span className="badge-tag" style={{ background: '#fee2e2', color: '#dc2626' }}>
                            🔒 Đang ẩn với học sinh
                          </span>
                        )}
                        {isTeacher && !asg.isHidden && (
                          <span className="badge-tag" style={{ background: '#dcfce7', color: '#15803d' }}>
                            🌐 Đang mở cho học sinh
                          </span>
                        )}
                        <h3 className="assignment-name" style={{ margin: 0 }}>{asg.title}</h3>
                      </div>
                      <div className="assignment-meta-tags">
                        <span>Lớp: <strong>{asg.className}</strong></span>
                        <span>•</span>
                        <span>{asg.questionsCount} câu hỏi</span>
                        <span>•</span>
                        <span>Thời lượng: {asg.duration} phút</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          Hạn nộp: <strong>{new Date(asg.deadline).toLocaleString('vi-VN')}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {hasSubmitted ? (
                      <span className="badge-tag active">
                        ✓ Đã nộp bài ({mySubmission.score}/10đ)
                      </span>
                    ) : (
                      <span className="badge-tag urgent">
                        ⏳ Chưa nộp bài
                      </span>
                    )}
                  </div>
                </div>

                {asg.description && (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                    {asg.description}
                  </p>
                )}

                {/* Khung xem trước đề LaTeX nếu là dạng trực tuyến */}
                {isOnline && asg.latexCode && (
                  <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem' }}>
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-2">
                      <Sparkles size={14} color="#4f46e5" />
                      Nội dung đề bài LaTeX hiển thị công thức:
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      <MathView text={asg.latexCode} />
                    </div>
                  </div>
                )}

                {/* Báo cáo tiến độ */}
                <div className="assignment-progress-section">
                  <div className="progress-header-row">
                    <span>
                      Báo cáo tiến độ nộp bài: <strong>{submittedCount}/{totalStudentsInClass} học sinh</strong> ({submitPercent}%)
                    </span>
                    <span style={{ color: submitPercent >= 80 ? '#16a34a' : '#b45309' }}>
                      {submitPercent >= 80 ? 'Tiến độ tốt' : 'Cần đôn đốc thêm'}
                    </span>
                  </div>

                  <div className="progress-track" style={{ height: '8px' }}>
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${submitPercent}%`, 
                        backgroundColor: submitPercent >= 80 ? '#10b981' : '#4f46e5' 
                      }} 
                    />
                  </div>
                </div>

                {/* Hàng nút bấm hành động */}
                <div className="assignment-actions-row">
                  <div>
                    {isTeacher && (
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => setExpandedProgressId(isDrawerOpen ? null : asg.id)}
                      >
                        <Users size={15} />
                        <span>{isDrawerOpen ? 'Thu gọn danh sách học sinh' : 'Xem danh sách chi tiết nộp bài'}</span>
                        {isDrawerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isStudent && (
                      isOnline ? (
                        <button 
                          className="btn btn-primary"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                          onClick={() => handleStudentDoOnline(asg)}
                        >
                          <Play size={15} />
                          <span>{hasSubmitted ? 'Làm lại bài trực tuyến' : 'Làm bài trực tuyến'}</span>
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', backgroundColor: '#d97706', borderColor: '#d97706' }}
                          onClick={() => {
                            setSubmittingFileAsg(asg);
                            setUploadedFileName('');
                          }}
                        >
                          <UploadCloud size={15} />
                          <span>{hasSubmitted ? 'Nộp lại file khác' : 'Tải lên File PDF / Ảnh bài làm'}</span>
                        </button>
                      )
                    )}

                    {isTeacher && (
                      <div className="flex items-center gap-2">
                        {/* Nút bật/tắt Ẩn/Hiện (Public / Hide) */}
                        <button 
                          className="btn btn-secondary"
                          style={{ 
                            padding: '0.35rem 0.75rem', 
                            fontSize: '0.8rem',
                            backgroundColor: asg.isHidden ? '#fef2f2' : '#f0fdf4',
                            borderColor: asg.isHidden ? '#fecaca' : '#bbf7d0',
                            color: asg.isHidden ? '#dc2626' : '#15803d'
                          }}
                          onClick={() => handleToggleAssignmentVisibility(asg.id)}
                          title={asg.isHidden ? "Đang ẩn với học sinh - Nhấn để Hiện (Public)" : "Đang hiển thị cho học sinh - Nhấn để Ẩn (Hide)"}
                        >
                          {asg.isHidden ? (
                            <>
                              <EyeOff size={15} />
                              <span>Đang Ẩn (Hide)</span>
                            </>
                          ) : (
                            <>
                              <Eye size={15} />
                              <span>Công Khai (Public)</span>
                            </>
                          )}
                        </button>

                        {/* Nút Chỉnh sửa đề bài */}
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleOpenEditAssignment(asg)}
                          title="Chỉnh sửa đề bài & thông tin nhiệm vụ"
                        >
                          <Edit size={15} />
                          <span>Sửa đề bài</span>
                        </button>

                        {/* Nút Xóa bài tập */}
                        <button 
                          className="btn-icon delete"
                          onClick={() => handleDeleteAssignment(asg.id)}
                          title="Xóa bài tập này khỏi lớp"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chi tiết danh sách nộp bài từng học sinh */}
                {isTeacher && isDrawerOpen && (
                  <div className="submissions-drawer">
                    <div className="drawer-header">
                      <span>Chi tiết học sinh lớp {asg.className} ({isOnline ? 'Làm bài Trực tuyến' : 'Nộp File PDF/Ảnh'})</span>
                      <span className="text-xs text-gray-500">Đã nộp {submittedCount}/{totalStudentsInClass}</span>
                    </div>
                    <div className="table-responsive">
                      <table className="students-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}>STT</th>
                          <th style={{ width: '90px' }}>Mã HS</th>
                          <th>Họ và Tên</th>
                          <th style={{ width: '130px' }}>Trạng thái</th>
                          <th>Bài nộp</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>Điểm</th>
                          <th>Thời gian nộp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(currentClass?.students || []).map((st, i) => {
                          const sub = asg.submissions?.[st.id] || 
                                      asg.submissions?.[st.id?.replace('10T8-', 'HS')] || 
                                      asg.submissions?.[st.id?.replace('HS', '10T8-')] ||
                                      (st.id?.startsWith('HS') ? asg.submissions?.[`10T8-${st.id.replace('HS', '')}`] : null);
                          const isDone = !!sub;

                          return (
                            <tr key={st.id || i}>
                              <td>{i + 1}</td>
                              <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5' }}>{st.id}</td>
                              <td style={{ fontWeight: 600 }}>{st.name}</td>
                              <td>
                                {isDone ? (
                                  <span className="status-chip submitted">
                                    <CheckCircle2 size={13} /> Đã nộp
                                  </span>
                                ) : (
                                  <span className="status-chip pending">
                                    <AlertCircle size={13} /> Chưa nộp
                                  </span>
                                )}
                              </td>
                              <td>
                                {isDone ? (
                                  sub.type === 'file' ? (
                                    <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold cursor-pointer">
                                      <Paperclip size={13} />
                                      <span>{sub.fileName} ({sub.fileSize})</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-600">Trắc nghiệm Online</span>
                                  )
                                ) : '—'}
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 700 }}>
                                {isDone ? (
                                  <span style={{ color: sub.score >= 8 ? '#15803d' : '#b45309' }}>
                                    {sub.score}
                                  </span>
                                ) : '—'}
                              </td>
                              <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {isDone ? sub.submittedAt : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card empty-state" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <BookOpen size={40} color="#94a3b8" />
            <h3 style={{ marginTop: '0.75rem' }}>Chưa có nhiệm vụ bài tập nào cho {currentClass?.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {isTeacher ? 'Hãy nhấn nút "Giao Bài Tập Mới" ở góc phải để tạo bài tập cho lớp này.' : 'Lớp của bạn hiện chưa có bài tập mới nào được giao.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal 1: Giáo viên Giao Bài Tập Mới (Chia 2 hình thức: Làm trực tuyến LaTeX kèm Live Preview / Nộp file PDF, Ảnh) */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content modal-content-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAssignmentId ? 'Chỉnh Sửa Đề Bài & Nhiệm Vụ' : 'Giao Nhiệm Vụ Bài Tập Cho Lớp'}</h3>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '1.25rem' }}>
                {/* 2 Lựa chọn hình thức giao bài */}
                <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  Hình thức làm bài của học sinh *
                </label>
                <div className="asg-type-tabs">
                  <div 
                    className={`asg-type-btn ${formData.type === 'online_latex' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, type: 'online_latex' })}
                  >
                    <div className="asg-type-title">
                      <Code2 size={18} color="#4f46e5" />
                      <span>1. Làm trực tiếp trên Web</span>
                    </div>
                    <span className="asg-type-desc">Nhập đề bài LaTeX & Biên dịch trực tiếp bên phải</span>
                  </div>

                  <div 
                    className={`asg-type-btn ${formData.type === 'file_upload' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, type: 'file_upload' })}
                  >
                    <div className="asg-type-title">
                      <UploadCloud size={18} color="#d97706" />
                      <span>2. Nộp File PDF / Hình ảnh</span>
                    </div>
                    <span className="asg-type-desc">Học sinh làm ra giấy và tải file chụp lên</span>
                  </div>
                </div>

                {/* Bố cục 2 Cột khi chọn dạng Làm trực tiếp LaTeX */}
                <div className={formData.type === 'online_latex' ? 'asg-split-layout' : ''}>
                  {/* Cột Trái: Các trường nhập liệu & Code LaTeX */}
                  <div className="asg-editor-column">
                    <div className="form-group">
                      <label>Chọn Lớp Học Được Giao *</label>
                      <select 
                        className="input"
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      >
                        {classesList.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} - {c.schoolFullName} ({c.students?.length || 0} HS)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Tiêu Đề Bài Tập / Nhiệm Vụ *</label>
                      <input 
                        type="text" 
                        className="input" 
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="VD: Bài tập Chuyên đề Vectơ & Tọa độ Oxy tuần 24"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Mô Tả & Hướng Dẫn Làm Bài</label>
                      <textarea 
                        className="input" 
                        rows={2}
                        value={formData.description}
                        onInput={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.max(60, e.target.scrollHeight)}px`;
                        }}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="VD: Yêu cầu các em hoàn thành các bài tập trước buổi học tối Thứ 5..."
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Hạn Chót Nộp Bài *</label>
                        <input 
                          type="datetime-local" 
                          className="input" 
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Thời Lượng (Phút)</label>
                        <input 
                          type="number" 
                          min="5" 
                          max="180" 
                          className="input" 
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Nếu chọn hình thức 1: Nhập đề LaTeX */}
                    {formData.type === 'online_latex' ? (
                      <div className="form-group">
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.4rem' }}>
                          <label style={{ margin: 0 }}>Mã Nguồn Đề Bài (LaTeX):</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="file" 
                              ref={texFileInputRef} 
                              accept=".tex,.txt"
                              style={{ display: 'none' }}
                              onChange={handleUploadTexFile}
                            />
                            <button 
                              type="button" 
                              className="btn btn-outline"
                              style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
                              onClick={() => texFileInputRef.current?.click()}
                            >
                              <Paperclip size={13} /> Tải file .tex
                            </button>
                          </div>
                        </div>

                        <div 
                          className={`latex-dropzone-container ${isDraggingFile ? 'is-dragging' : ''}`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          style={{ position: 'relative' }}
                        >
                          {isDraggingFile && (
                            <div className="drag-overlay-indicator" style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(79, 70, 229, 0.92)',
                              borderRadius: 'var(--radius-md)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              zIndex: 10,
                              pointerEvents: 'none'
                            }}>
                              <UploadCloud size={36} />
                              <strong style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>📂 Thả file .tex hoặc .txt vào đây</strong>
                              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>Tự động nạp mã nguồn đề bài</span>
                            </div>
                          )}

                          <textarea 
                            className="input latex-input-box" 
                            rows={8}
                            spellCheck="false"
                            value={formData.latexCode}
                            onInput={(e) => {
                              e.target.style.height = 'auto';
                              e.target.style.height = `${Math.max(160, e.target.scrollHeight)}px`;
                            }}
                            onChange={(e) => setFormData({ ...formData, latexCode: e.target.value })}
                            placeholder={`\\begin{ex}%[Mã câu hỏi]
	Nhập câu hỏi với công thức LaTeX $...$
	\\choice
	{Phương án A}
	{\\True Phương án B đúng}
	{Phương án C}
	{Phương án D}
	\\loigiai{
		Lời giải chi tiết bài toán...
	}
\\end{ex}`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>File Đề Bài Đính Kèm Của Giáo Viên (Nếu có):</label>
                        <div className="file-drop-zone">
                          <UploadCloud size={28} color="#64748b" />
                          <span style={{ fontSize: '0.825rem', color: '#475569' }}>
                            Kéo thả file PDF / Word đề bài hoặc click để chọn tệp
                          </span>
                          <input type="file" style={{ display: 'none' }} id="teacher-asg-file" />
                          <label htmlFor="teacher-asg-file" className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                            Chọn file đề bài
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cột Phải: XEM TRƯỚC BIÊN DỊCH LATEX (LIVE PREVIEW GIỐNG TAB THI THỬ) */}
                  {formData.type === 'online_latex' && (() => {
                    const parsedQuestions = parseLatexStringToQuestions(formData.latexCode);
                    return (
                      <div className="asg-preview-column">
                        <div className="asg-preview-header">
                          <span className="flex items-center gap-1">
                            <Eye size={15} color="var(--primary-color)" />
                            Kết quả biên dịch hiển thị
                          </span>
                          <span className="parsed-count-pill" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '9999px' }}>
                            {parsedQuestions.length} câu hỏi
                          </span>
                        </div>

                        <div className="asg-preview-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          {parsedQuestions.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 1rem' }}>
                              <FileText size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>Chưa có câu hỏi nào được biên dịch.</p>
                              <span style={{ fontSize: '0.775rem' }}>Nhập mã LaTeX hoặc kéo thả file <code>.tex</code> ở cột bên trái để xem kết quả.</span>
                            </div>
                          ) : (
                            parsedQuestions.map((q, qIdx) => (
                              <div key={q.id || qIdx} className="asg-preview-question-card">
                                <div className="asg-q-header">
                                  <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                    Câu {qIdx + 1}
                                  </span>
                                  {q.questionType === 'multiple_choice' && q.correctAnswer && (
                                    <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
                                      Đáp án đúng: <strong>{q.correctAnswer}</strong>
                                    </span>
                                  )}
                                </div>

                                <div style={{ fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                                  <MathView text={q.content} />
                                </div>

                                {/* 4 Lựa chọn phương án */}
                                {q.options && q.options.length > 0 && (
                                  <div className="asg-options-preview">
                                    {q.options.map(opt => {
                                      const isCorrect = opt.key === q.correctAnswer || opt.isCorrectTrue;
                                      return (
                                        <div 
                                          key={opt.key} 
                                          className={`asg-opt-pill ${isCorrect ? 'correct' : ''}`}
                                          style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}
                                        >
                                          <strong>{opt.key})</strong>
                                          <div>
                                            <MathView text={opt.text} />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Lời giải chi tiết */}
                                {q.explanation && (
                                  <div style={{ marginTop: '0.75rem', background: '#f8fafc', borderLeft: '3px solid #6366f1', padding: '0.5rem 0.75rem', borderRadius: '0 4px 4px 0', fontSize: '0.8rem' }}>
                                    <strong style={{ color: '#4338ca', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.2rem' }}>
                                      <Sparkles size={13} /> Lời giải chi tiết:
                                    </strong>
                                    <MathView text={q.explanation} />
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '0.75rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAssignmentId ? (
                    <>
                      <Check size={16} /> Lưu Thay Đổi Đề Bài
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Giao Bài Cho Lớp
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Học sinh Nộp File PDF / Hình ảnh */}
      {submittingFileAsg && (
        <div className="modal-overlay" onClick={() => setSubmittingFileAsg(null)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nộp File Bài Làm: {submittingFileAsg.title}</h3>
              <button className="btn-icon" onClick={() => setSubmittingFileAsg(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                Vui lòng tải lên file bài làm dạng <strong>PDF</strong> hoặc hình ảnh chụp bài vở (<strong>PNG, JPG</strong>).
              </p>

              <div className="file-drop-zone" onClick={() => document.getElementById('student-file-input').click()}>
                <UploadCloud size={36} color="var(--primary-color)" />
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>Nhấn để chọn file hoặc kéo thả vào đây</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Hỗ trợ: .PDF, .PNG, .JPG, .JPEG (Tối đa 25MB)
                  </div>
                </div>
                <input 
                  id="student-file-input"
                  type="file" 
                  accept=".pdf,image/*" 
                  style={{ display: 'none' }}
                  onChange={handleStudentFileUpload}
                />
              </div>

              {uploadedFileName && (
                <div className="file-chip">
                  <FileCheck size={16} />
                  <span>{uploadedFileName} ({uploadedFileSize})</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSubmittingFileAsg(null)}>
                Hủy Bỏ
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmSubmitFile}>
                <Check size={16} /> Xác Nhận Nộp Bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
