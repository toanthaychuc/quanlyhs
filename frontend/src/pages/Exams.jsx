import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  GraduationCap, Clock, HelpCircle, CheckCircle, XCircle, X,
  Award, Play, RotateCcw, ArrowLeft, ArrowRight, Plus, 
  Trash2, Edit, Save, FileText, Check, AlertTriangle, Sparkles, 
  BookOpen, Flag, ChevronDown, ChevronRight, Search, Calendar, CheckSquare, Upload, Target, Zap, FileCode, Eye, EyeOff, CheckSquare2
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useLocation, useNavigate } from 'react-router-dom';
import MathView from '../components/MathView';
import { stripLatexComments, normalizeLatexString, extractBracedBlocks, parseImminiBlock, cleanQuestionObj } from '../utils/latexUtils';
import { GRADE_10_CURRICULUM } from '../data/grade10Curriculum';
import { GRADE_11_CURRICULUM } from '../data/grade11Curriculum';
import { GRADE_12_CURRICULUM } from '../data/grade12Curriculum';
import './Exams.css';
import {
  getExams, saveExam, deleteExam,
  submitExamSession, getStudentHistory,
  updateGamification, getGamification,
  saveUnfinishedExam, getUnfinishedExam, clearUnfinishedExam
} from '../services/examService';

const EXAMS_STORAGE_KEY = 'edumanager_exams_data_v8';

const getInitialExams = () => {
  return [];
};

const ALL_CURRICULA = {
  'grade-10': { label: 'Khối 10', data: GRADE_10_CURRICULUM },
  'grade-11': { label: 'Khối 11', data: GRADE_11_CURRICULUM },
  'grade-12': { label: 'Khối 12', data: GRADE_12_CURRICULUM },
  'grade-thptqg': { label: 'THPTQG', data: null },
  'grade-vact': { label: 'VACT', data: null }
};

// Chuyển danh sách câu hỏi thành chuỗi mã LaTeX chuẩn theo 4 dạng
const questionsToLatexString = (questions) => {
  if (!questions || questions.length === 0) return '';
  return questions.map((q, index) => {
    let str = `%%%=== Câu ${index + 1} ===%%%\n\\begin{ex}\n\t${q.content}\n`;
    
    if (q.questionType === 'true_false') {
      str += `\t\\choiceTF\n`;
      (q.options || []).forEach(opt => {
        if (opt.isCorrectTrue) {
          str += `\t{\\True ${opt.text}}\n`;
        } else {
          str += `\t{${opt.text}}\n`;
        }
      });
    } else if (q.questionType === 'short_answer') {
      const cleanAns = String(q.correctAnswer || '').replace(/\{,\}/g, ',').replace(/\$/g, '').trim();
      str += `\t\\shortans{${cleanAns}}\n`;
    } else if (q.questionType === 'multiple_choice') {
      str += `\t\\choice\n`;
      (q.options || []).forEach(opt => {
        if (opt.key === q.correctAnswer) {
          str += `\t{\\True ${opt.text}}\n`;
        } else {
          str += `\t{${opt.text}}\n`;
        }
      });
    }

    if (q.explanation) {
      str += `\t\\loigiai{\n\t\t${q.explanation}\n\t}\n`;
    }
    str += `\\end{ex}\n`;
    return str;
  }).join('\n');
};

// Phân tích mã nguồn LaTeX đa năng hỗ trợ 4 dạng câu hỏi chuẩn Bộ GD&ĐT
const parseLatexStringToQuestions = (rawText) => {
  if (!rawText || !rawText.trim()) return [];

  try {
    // Loại bỏ tất cả comment % trước khi bóc tách
    const cleanSource = stripLatexComments(rawText);

    let blocks = [];

    const envRegex = /\\begin\s*\{\s*(?:ex|bt|vd|cau)\s*\}(?:\[[^\]]*\])*([\s\S]*?)\\end\s*\{\s*(?:ex|bt|vd|cau)\s*\}/gi;
    let match;
    while ((match = envRegex.exec(cleanSource)) !== null) {
      blocks.push(match[1]);
    }

  // Nếu không tìm thấy môi trường ex|bt|vd, thử tách theo Câu 1: / Câu 2:...
  if (blocks.length === 0) {
    blocks = cleanSource.split(/(?:^|\n)(?:Câu\s*\d+[:.]|Bài\s*\d+[:.])/i).filter(b => b.trim().length > 0);
  }

  if (blocks.length === 0) {
    blocks = [cleanSource];
  }

  return blocks.map((rawBlock, index) => {
    let block = rawBlock.trim();
    // Bỏ qua các tag phân loại câu hỏi dạng [thm], [2D1B1-1] ở đầu khối nếu còn sót
    block = block.replace(/^\s*(?:\[[^\]]*\]\s*)+/g, '').trim();
    block = block.replace(/\\par\s*(?=\\shortans)/gi, '').trim();

    // 0. Nếu \choice / \choiceTF / \shortans bị lồng bên trong khối thứ nhất của \immini, tự động tách ra ngoài
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

    // 1. Tách lời giải (\loigiai{...} hoặc \begin{loigiai}...\end{loigiai})
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
      } else {
        const matchExp = block.match(/(?:Lời giải|HD|Hướng dẫn)[:\s]*([\s\S]+)/i);
        if (matchExp) {
          explanation = matchExp[1].trim();
          block = block.replace(matchExp[0], '').trim();
        }
      }
    }

    let questionType = 'multiple_choice'; // 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
    let options = [];
    let correctAnswer = 'A';
    let questionContent = block;

    // 2. Kiểm tra dạng: TRẮC NGHIỆM ĐÚNG SAI (\choiceTF)
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
        options.push({
          key,
          text: cleanedText,
          isCorrectTrue: isTrue
        });
      });
    } 
    // 3. Kiểm tra dạng: TRẮC NGHIỆM TRẢ LỜI NGẮN (\shortans{...})
    else if (/\\shortans/i.test(block)) {
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
    } 
    // 4. Kiểm tra dạng: TRẮC NGHIỆM 4 PHƯƠNG ÁN (\choice, \haicot, \boncot, \motcot)
    else if (/\\(?:choice|haicot|boncot|motcot)/i.test(block)) {
      questionType = 'multiple_choice';
      const choiceMatch = block.match(/\\(?:choice|haicot|boncot|motcot)/i);
      const choiceIndex = choiceMatch.index;
      questionContent = block.slice(0, choiceIndex).trim();
      const choicesPart = block.slice(choiceIndex + choiceMatch[0].length).trim();
      const rawChoices = extractBracedBlocks(choicesPart);

      const keys = ['A', 'B', 'C', 'D'];
      rawChoices.slice(0, 4).forEach((cText, optIdx) => {
        const key = keys[optIdx] || 'A';
        const hasTrue = /\\True/i.test(cText);
        if (hasTrue) {
          correctAnswer = key;
        }
        const cleanedText = cText.replace(/\\True/gi, '').trim();
        options.push({
          key,
          text: cleanedText
        });
      });
    } 
    // 5. Kiểm tra dạng truyền thống A. ... B. ... C. ... D. ...
    else if (/[A-D][.]\s+/.test(block)) {
      questionType = 'multiple_choice';
      questionContent = block.split(/(?:[A-D][.]|\{[A-D]\}|Đáp án|Lời giải)/)[0].trim();

      const matchA = block.match(/A[.\s]+([^\nB-D]+)/);
      const matchB = block.match(/B[.\s]+([^\nC-D]+)/);
      const matchC = block.match(/C[.\s]+([^\nD\n]+)/);
      const matchD = block.match(/D[.\s]+([^\n]+)/);

      const matchAns = block.match(/(?:Đáp án|ĐA|Key)[:\s]*([A-D])/i);
      if (matchAns) {
        correctAnswer = matchAns[1].toUpperCase();
      }

      options = [
        { key: 'A', text: matchA ? matchA[1].trim() : 'Đáp án A' },
        { key: 'B', text: matchB ? matchB[1].trim() : 'Đáp án B' },
        { key: 'C', text: matchC ? matchC[1].trim() : 'Đáp án C' },
        { key: 'D', text: matchD ? matchD[1].trim() : 'Đáp án D' }
      ];
    } 
    // 6. CÂU HỎI TỰ LUẬN (Không có choice / shortans)
    else {
      questionType = 'essay';
      correctAnswer = 'Xem lời giải chi tiết';
    }

    // Đảm bảo đủ 4 lựa chọn nếu là multiple_choice
    if (questionType === 'multiple_choice') {
      const defaultKeys = ['A', 'B', 'C', 'D'];
      while (options.length < 4) {
        const nextKey = defaultKeys[options.length];
        options.push({ key: nextKey, text: `Đáp án ${nextKey}` });
      }
    }

      return cleanQuestionObj({
        id: 'q_' + Date.now() + '_' + index,
        questionType,
        content: questionContent || `Câu hỏi ${index + 1}`,
        options,
        correctAnswer,
        explanation: explanation || 'Xem lại kiến thức lý thuyết và phương pháp giải.',
        _searchSnippet: rawBlock
      });
    });
  } catch (err) {
    console.error('Error parsing LaTeX questions:', err);
    return [];
  }
};



const Exams = () => {
  const { isTeacher, isStudent, currentStudentId } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  // Xác định khối của học sinh hiện tại nếu đang ở chế độ Student
  const [studentGradeKey, setStudentGradeKey] = useState(null);

  useEffect(() => {
    if (isStudent) {
      const saved = localStorage.getItem('edumanager_classes_data');
      if (saved) {
        try {
          const classes = JSON.parse(saved);
          for (const cls of classes) {
            const found = cls.students?.find(s => s.id === currentStudentId);
            if (found) {
              const gradeKey = `grade-${cls.grade || '10'}`;
              setStudentGradeKey(gradeKey);
              setActiveGradeFilter(gradeKey);
              break;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setStudentGradeKey(null);
    }
  }, [isStudent, currentStudentId]);

  const [activeGradeFilter, setActiveGradeFilter] = useState('grade-12');
  const [searchLessonQuery, setSearchLessonQuery] = useState('');
  const [expandedChapters, setExpandedChapters] = useState({});
  const texFileInputRef = useRef(null);
  const texTextareaRef = useRef(null);
  const texSearchInputRef = useRef(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isTexSearchOpen, setIsTexSearchOpen] = useState(false);

  const executeTexSearch = (query, fromIndex = 0) => {
    if (!texTextareaRef.current || !query) return;
    const textArea = texTextareaRef.current;
    const rawText = textArea.value || '';
    
    let index = rawText.toLowerCase().indexOf(query.toLowerCase(), fromIndex);
    if (index === -1 && fromIndex > 0) {
       index = rawText.toLowerCase().indexOf(query.toLowerCase()); // wrap around
    }
    
    if (index !== -1) {
       // Focus để trình duyệt có thể tự động cuộn đến vị trí bôi đen và giữ highlight
       textArea.focus();
       textArea.setSelectionRange(index, index + query.length);
       
       const textBefore = rawText.substring(0, index);
       const linesBefore = textBefore.split('\n').length;
       const lineHeight = 24; 
       textArea.scrollTop = Math.max(0, (linesBefore - 4) * lineHeight);
    } else {
       alert(`Không tìm thấy "${query}" trong mã nguồn!`);
    }
  };

  const handleTexSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = texSearchInputRef.current?.value;
      if (!query) return;

      let startIndex = 0;
      if (texTextareaRef.current) {
        if (texTextareaRef.current.selectionStart !== texTextareaRef.current.selectionEnd) {
          startIndex = texTextareaRef.current.selectionStart + 1;
        } else {
          startIndex = texTextareaRef.current.selectionEnd;
        }
      }
      executeTexSearch(query, startIndex);
    }
  };

  const handleQuestionClick = (question) => {
    if (!texTextareaRef.current) return;
    const textArea = texTextareaRef.current;
    const rawText = textArea.value || '';
    
    const snippetSource = question._searchSnippet || question.content || '';
    const snippetTokens = snippetSource.replace(/\s+/g, '').substring(0, 30);
    if (!snippetTokens) return;

    let targetIndex = -1;
    let inComment = false;
    let matchedCount = 0;
    let potentialStartIndex = -1;
    
    for (let i = 0; i < rawText.length; i++) {
      const char = rawText[i];
      if (char === '%') inComment = true;
      if (char === '\n') {
        inComment = false;
        continue;
      }
      
      if (!inComment && !/\s/.test(char)) {
        if (matchedCount === 0) potentialStartIndex = i;
        
        if (char === snippetTokens[matchedCount]) {
          matchedCount++;
          if (matchedCount === snippetTokens.length) {
            targetIndex = potentialStartIndex;
            break;
          }
        } else {
          matchedCount = 0;
          if (char === snippetTokens[0]) {
             matchedCount = 1;
             potentialStartIndex = i;
          }
        }
      }
    }

    if (targetIndex === -1) {
       const simpleSearch = snippetSource.substring(0, 20).trim();
       targetIndex = rawText.indexOf(simpleSearch);
    }

    if (targetIndex !== -1) {
       textArea.focus();
       textArea.setSelectionRange(targetIndex, targetIndex + 25);
       
       const textBefore = rawText.substring(0, targetIndex);
       const linesBefore = textBefore.split('\n').length;
       
       const lineHeight = 24; 
       textArea.scrollTop = Math.max(0, (linesBefore - 4) * lineHeight);
    }
  };

  const [exams, setExams] = useState(() => {
    try {
      const saved = localStorage.getItem(EXAMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed; // Chấp nhận mảng rỗng nếu user đã xóa hết
      }
    } catch (e) {
      console.error(e);
    }
    return getInitialExams();
  });

  // Tải đề thi từ Supabase khi component mount
  // Tải danh sách đề thi (Stale-While-Revalidate)
  useEffect(() => {
    // 1. Lấy dữ liệu local (nhanh, 0 độ trễ)
    getExams(false).then(data => {
      if (Array.isArray(data) && data.length > 0) setExams(data);
      // 2. Kéo dữ liệu mới nhất từ mây ở chế độ nền
      getExams(true).then(freshData => {
        if (Array.isArray(freshData)) setExams(freshData);
      }).catch(err => console.error('Background sync exams error:', err));
    }).catch(err => console.error('Local exams error:', err));
  }, []);

  // Lưu cache localStorage khi exams thay đổi (đồng bộ Supabase xảy ra trong từng action)
  useEffect(() => {
    localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
  }, [exams]);

  const currentCurriculum = ALL_CURRICULA[activeGradeFilter]?.data || null;

  useEffect(() => {
    if (currentCurriculum) {
      const initialExpanded = {};
      currentCurriculum.forEach(c => { initialExpanded[c.chapterId] = true; });
      setExpandedChapters(initialExpanded);
    }
  }, [activeGradeFilter]);

  const toggleChapterExpand = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const scrollToChapter = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: true }));
    setTimeout(() => {
      const el = document.getElementById(`chapter-${chapterId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('highlight-flash');
        setTimeout(() => {
          el.classList.remove('highlight-flash');
        }, 1600);
      }
    }, 80);
  };

  // Trạng thái làm bài thi
  const [currentExam, setCurrentExam] = useState(null);
  const [examMode, setExamMode] = useState('list'); // 'list' | 'taking' | 'result'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examResult, setExamResult] = useState(null);
  const timerRef = useRef(null);

  // Modal Soạn đề LaTeX
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorQuestions, setEditorQuestions] = useState([]);
  const [editingExamId, setEditingExamId] = useState(null);
  const [examFormData, setExamFormData] = useState({
    grade: 'grade-12',
    chapterId: '',
    itemId: '',
    title: '',
    duration: 15,
    latexBulkCode: '',
    pointsConfig: {
      multipleChoice: 0.25,
      shortAnswer: 0.5,
      trueFalse: { correct1: 0.1, correct2: 0.25, correct3: 0.5, correct4: 1.0 }
    }
  });

  // Auto-resume from Dashboard
  useEffect(() => {
    if (location.state?.resumeExamId && isStudent && currentStudentId && exams.length > 0) {
      const raw = getUnfinishedExam(currentStudentId);
      if (raw) {
        const entry = raw.examId === location.state.resumeExamId ? raw : null;
        if (entry) {
          const ex = exams.find(e => e.id === entry.examId);
          if (ex) {
            setCurrentExam(ex);
            setUserAnswers(entry.answers || {});
            setFlaggedQuestions(entry.flagged || {});
            setTimeLeft(entry.timeLeft || (ex.duration * 60));
            setExamMode('taking');
            setCurrentQuestionIndex(0);
            
            navigate(location.pathname, { replace: true });
          }
        }
      }
    }
  }, [location.state, isStudent, currentStudentId, exams, navigate, location.pathname]);

  // Bắt đầu làm bài thi
  const handleStartExam = (exam) => {
    if (!exam.questions || exam.questions.length === 0) {
      if (isTeacher) {
        handleOpenEditCurriculumExam({ id: exam.id, name: exam.title, duration: exam.duration }, { chapterId: exam.chapterId }, exam.grade);
      } else {
        alert('Bài kiểm tra này đang được giáo viên cập nhật đề. Vui lòng quay lại sau!');
      }
      return;
    }

    setCurrentExam(exam);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimeLeft(exam.duration * 60);
    setExamMode('taking');
  };

  // Đồng hồ đếm ngược
  useEffect(() => {
    if (examMode === 'taking' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [examMode, timeLeft]);

  // Tự động lưu tiến độ làm bài (debounced 2 giây)
  const unfinishedSaveRef = useRef(null);
  useEffect(() => {
    if (examMode !== 'taking' || !currentExam || !isStudent || !currentStudentId) return;
    if (unfinishedSaveRef.current) clearTimeout(unfinishedSaveRef.current);
    unfinishedSaveRef.current = setTimeout(() => {
      saveUnfinishedExam(currentStudentId, currentExam.id, {
        answers: userAnswers,
        flagged: flaggedQuestions,
        timeLeft,
      });
    }, 2000);
    return () => {
      if (unfinishedSaveRef.current) clearTimeout(unfinishedSaveRef.current);
    };
  }, [userAnswers, flaggedQuestions, examMode, currentExam, isStudent, currentStudentId]);

  // Nộp bài thi
  const handleSubmitExam = async (autoSubmit = false) => {
    if (!currentExam) return;

    if (!autoSubmit) {
      const answeredCount = Object.keys(userAnswers).length;
      const totalCount = currentExam.questions.length;
      if (answeredCount < totalCount) {
        if (!window.confirm(`Bạn mới làm ${answeredCount}/${totalCount} câu. Bạn có chắc chắn muốn nộp bài không?`)) {
          return;
        }
      } else {
        if (!window.confirm('Bạn có chắc chắn muốn nộp bài thi không?')) {
          return;
        }
      }
    }

    clearInterval(timerRef.current);

    let correctCount = 0;
    let totalCalculatedScore = 0;
    const hasPointsConfig = !!currentExam.pointsConfig;
    const pConfig = currentExam.pointsConfig || {
      multipleChoice: 0,
      shortAnswer: 0,
      trueFalse: { correct1: 0, correct2: 0, correct3: 0, correct4: 0 }
    };

    currentExam.questions.forEach((q) => {
      const uAns = userAnswers[q.id];
      if (q.questionType === 'true_false') {
        let subCorrect = 0;
        (q.options || []).forEach(opt => {
          const userPick = uAns?.[opt.key];
          const expected = opt.isCorrectTrue ? 'T' : 'F';
          if (userPick === expected) subCorrect += 1;
        });

        if (subCorrect === 4 && uAns) correctCount += 1;

        if (hasPointsConfig && uAns) {
          if (subCorrect === 1) totalCalculatedScore += pConfig.trueFalse.correct1;
          else if (subCorrect === 2) totalCalculatedScore += pConfig.trueFalse.correct2;
          else if (subCorrect === 3) totalCalculatedScore += pConfig.trueFalse.correct3;
          else if (subCorrect === 4) totalCalculatedScore += pConfig.trueFalse.correct4;
        }
      } else if (q.questionType === 'short_answer') {
        const cleanUser = String(uAns || '').trim().replace(/,/g, '.');
        const cleanTarget = String(q.correctAnswer || '').trim().replace(/,/g, '.');
        if (cleanUser === cleanTarget) {
          correctCount += 1;
          if (hasPointsConfig) totalCalculatedScore += pConfig.shortAnswer;
        }
      } else {
        if (uAns === q.correctAnswer) {
          correctCount += 1;
          if (hasPointsConfig) totalCalculatedScore += pConfig.multipleChoice;
        }
      }
    });

    const totalQuestions = currentExam.questions.length;
    const score = hasPointsConfig 
      ? Number(totalCalculatedScore.toFixed(2)) 
      : (totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 10).toFixed(1)) : 0);
    const timeSpentSeconds = (currentExam.duration * 60) - timeLeft;

    setExamResult({
      score,
      correctCount,
      totalQuestions,
      timeSpentSeconds,
      submittedAt: new Date().toLocaleTimeString('vi-VN')
    });

    // Lưu kết quả lên Supabase và cập nhật gamification
    try {
      // 1. Lưu phiên thi
      if (isStudent && currentStudentId) {
        await submitExamSession({
          examId: currentExam.id,
          studentId: currentStudentId,
          classId: null,
          answers: userAnswers,
          flagged: flaggedQuestions,
          score: Number(score),
          correctCount,
          totalQuestions,
          timeSpent: timeSpentSeconds,
        });
      }

      // 2. Gamification (XP, Streak, Badges)
      if (isStudent && currentStudentId) {
        const myGami = await getGamification(currentStudentId);
        const today = new Date().toLocaleDateString('en-CA');

        // Cập nhật Streak
        if (myGami.lastActiveDate !== today) {
          if (!myGami.lastActiveDate) {
            myGami.streak = 1;
          } else {
            const lastDate = new Date(myGami.lastActiveDate);
            const currentDate = new Date(today);
            const diffDays = Math.ceil(Math.abs(currentDate - lastDate) / (1000 * 60 * 60 * 24));
            myGami.streak = diffDays === 1 ? (myGami.streak || 0) + 1 : 1;
          }
          myGami.lastActiveDate = today;
        }

        // Tính XP
        let gainedXP = Math.floor(Number(score) * 10);
        let isSpeedster = false;
        if (timeSpentSeconds <= (currentExam.duration * 60) * 0.5) {
          gainedXP += 50;
          isSpeedster = true;
        }
        myGami.xp = (myGami.xp || 0) + gainedXP;

        // Huy hiệu
        const currentBadges = new Set(myGami.badges || []);
        if (Number(score) === 10) currentBadges.add('Điểm Tuyệt Đối');
        if (isSpeedster)           currentBadges.add('Tốc Độ');
        if (myGami.streak >= 3)    currentBadges.add('Chăm Chỉ');
        myGami.badges = Array.from(currentBadges);

        await updateGamification(currentStudentId, myGami);
      }

      // 3. Xóa trạng thái làm dở
      if (isStudent && currentStudentId) {
        clearUnfinishedExam(currentStudentId);
      }
    } catch (e) {
      console.error('Lỗi khi lưu kết quả thi:', e);
    }

    setExamMode('result');
  };

  const handleSelectOption = (questionId, optionKey) => {
    setUserAnswers({ ...userAnswers, [questionId]: optionKey });
  };

  const handleSelectTrueFalse = (questionId, subKey, val) => {
    const currentTF = userAnswers[questionId] || {};
    setUserAnswers({
      ...userAnswers,
      [questionId]: {
        ...currentTF,
        [subKey]: val
      }
    });
  };

  const handleInputShortAns = (questionId, textVal) => {
    setUserAnswers({ ...userAnswers, [questionId]: textVal });
  };

  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions({ ...flaggedQuestions, [questionId]: !flaggedQuestions[questionId] });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateMaxScore = (exam) => {
    if (!exam || !exam.pointsConfig) return 10;
    let max = 0;
    const pConfig = exam.pointsConfig;
    (exam.questions || []).forEach(q => {
      if (q.questionType === 'multiple_choice' || !q.questionType) max += pConfig.multipleChoice;
      else if (q.questionType === 'short_answer') max += pConfig.shortAnswer;
      else if (q.questionType === 'true_false') max += pConfig.trueFalse.correct4;
    });
    return Number(max.toFixed(2));
  };

  // ===================== CRUD GIÁO VIÊN (SOẠN ĐỀ LATEX) =====================
  const handleOpenAddExam = () => {
    const defaultGrade = activeGradeFilter;
    const cur = ALL_CURRICULA[defaultGrade]?.data;
    const firstChap = cur ? cur[0] : null;
    const firstItem = firstChap ? firstChap.items[0] : null;

    setEditingExamId(null);
    setExamFormData({
      grade: defaultGrade,
      chapterId: firstChap?.chapterId || '',
      itemId: firstItem?.id || '',
      title: defaultGrade === 'grade-thptqg' ? 'Đề thi thử THPT Quốc Gia mới' : (defaultGrade === 'grade-vact' ? 'Đề thi thử VACT mới' : (firstItem?.name ? `${firstItem.name} (Đề mới)` : 'Bài kiểm tra mới')),
      duration: defaultGrade === 'grade-thptqg' ? 90 : (defaultGrade === 'grade-vact' ? 60 : 15),
      latexBulkCode: '', // Để trống để hiển thị placeholder mờ gợi ý
      pointsConfig: {
        multipleChoice: 0.25,
        shortAnswer: 0.5,
        trueFalse: { correct1: 0.1, correct2: 0.25, correct3: 0.5, correct4: 1.0 }
      }
    });
    setEditorQuestions([]);
    setIsEditorOpen(true);
  };

  const handleOpenAddNewExamToLesson = (item, chapter, gradeKey) => {
    const existingList = getExamsByCurriculumId(item.id);
    const newIndex = existingList.length + 1;

    setEditingExamId(null); // Tạo đề mới độc lập
    setExamFormData({
      grade: gradeKey,
      chapterId: chapter?.chapterId || '',
      itemId: item.id,
      title: `${item.name} - Đề số ${newIndex}`,
      duration: item.duration || 15,
      latexBulkCode: '',
      pointsConfig: {
        multipleChoice: 0.25,
        shortAnswer: 0.5,
        trueFalse: { correct1: 0.1, correct2: 0.25, correct3: 0.5, correct4: 1.0 }
      }
    });
    setEditorQuestions([]);
    setIsEditorOpen(true);
  };

  const handleOpenEditSpecificExam = (exam, item, chapter, gradeKey) => {
    try {
      const qs = exam.questions || [];
      const hasExistingQs = qs.length > 0;
      const latexStr = hasExistingQs ? questionsToLatexString(qs) : '';

      setEditingExamId(exam.id);
      setExamFormData({
        grade: exam.grade || gradeKey,
        chapterId: exam.chapterId || chapter?.chapterId || '',
        itemId: exam.curriculumId || item?.id || exam.id,
        title: exam.title,
        duration: exam.duration || 15,
        latexBulkCode: latexStr,
        pointsConfig: exam.pointsConfig || {
          multipleChoice: 0.25,
          shortAnswer: 0.5,
          trueFalse: { correct1: 0.1, correct2: 0.25, correct3: 0.5, correct4: 1.0 }
        }
      });
      setEditorQuestions(hasExistingQs ? qs.map(cleanQuestionObj) : []);
      setIsEditorOpen(true);
    } catch (e) {
      alert("Error in handleOpenEditSpecificExam: " + e.message);
      console.error(e);
    }
  };

  const handleDeleteSpecificExam = async (examId, examTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đề thi "${examTitle}" không?`)) {
      try {
        await deleteExam(examId);
        setExams(prev => prev.filter(e => e.id !== examId));
      } catch (err) {
        console.error('Lỗi khi xóa đề thi:', err);
        alert('Không thể xóa đề thi. Vui lòng thử lại.');
      }
    }
  };

  const handleOpenEditFreeformExam = (exam) => {
    const qs = exam.questions || [];
    const hasExistingQs = qs.length > 0;
    const latexStr = hasExistingQs ? questionsToLatexString(qs) : '';

    setEditingExamId(exam.id);
    setExamFormData({
      grade: exam.grade,
      chapterId: '',
      itemId: exam.curriculumId || exam.id,
      title: exam.title,
      duration: exam.duration || 60,
      latexBulkCode: latexStr,
      pointsConfig: exam.pointsConfig || {
        multipleChoice: 0.25,
        shortAnswer: 0.5,
        trueFalse: { correct1: 0.1, correct2: 0.25, correct3: 0.5, correct4: 1.0 }
      }
    });
    setEditorQuestions(hasExistingQs ? qs.map(cleanQuestionObj) : []);
    setIsEditorOpen(true);
  };

  const handleDeleteFreeformExam = async (examId, examTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đề thi "${examTitle}" không?`)) {
      try {
        await deleteExam(examId);
        setExams(prev => prev.filter(e => e.id !== examId));
      } catch (err) {
        console.error('Lỗi khi xóa đề thi:', err);
        alert('Không thể xóa đề thi tự do. Vui lòng thử lại.');
      }
    }
  };

  const handleToggleHideExam = (examId) => {
    setExams(prev => prev.map(ex => ex.id === examId ? { ...ex, isHidden: !ex.isHidden } : ex));
  };

  const handleGradeChangeInModal = (newGrade) => {
    const cur = ALL_CURRICULA[newGrade]?.data;
    const firstChap = cur ? cur[0] : null;
    const firstItem = firstChap ? firstChap.items[0] : null;

    setExamFormData(prev => ({
      ...prev,
      grade: newGrade,
      chapterId: firstChap?.chapterId || '',
      itemId: firstItem?.id || '',
      title: newGrade === 'grade-thptqg' ? 'Đề thi THPT Quốc Gia mới' : (newGrade === 'grade-vact' ? 'Đề thi ĐGNL VACT mới' : (firstItem?.name || prev.title)),
      duration: newGrade === 'grade-thptqg' ? 90 : (newGrade === 'grade-vact' ? 60 : 15)
    }));
  };

  const handleChapterChangeInModal = (newChapId) => {
    const cur = ALL_CURRICULA[examFormData.grade]?.data;
    const targetChap = cur?.find(c => c.chapterId === newChapId);
    const firstItem = targetChap?.items[0];

    setExamFormData(prev => ({
      ...prev,
      chapterId: newChapId,
      itemId: firstItem?.id || '',
      title: firstItem?.name || prev.title
    }));
  };

  const handleItemChangeInModal = (newItemId) => {
    const cur = ALL_CURRICULA[examFormData.grade]?.data;
    const targetChap = cur?.find(c => c.chapterId === examFormData.chapterId);
    const targetItem = targetChap?.items.find(i => i.id === newItemId);

    setExamFormData(prev => ({
      ...prev,
      itemId: newItemId,
      title: targetItem?.name || prev.title,
      duration: targetItem?.duration || prev.duration
    }));
  };

  const processUploadedFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const parsed = parseLatexStringToQuestions(content);
      if (parsed.length > 0) {
        setEditorQuestions(parsed);
        const standardizedLatex = questionsToLatexString(parsed);
        setExamFormData(prev => ({ ...prev, latexBulkCode: standardizedLatex }));
        setTimeout(() => {
          alert(`Đã nhận diện và chuẩn hóa thành công ${parsed.length} câu hỏi từ tệp "${file.name}"!`);
        }, 100);
      } else {
        setExamFormData(prev => ({ ...prev, latexBulkCode: content }));
        setTimeout(() => {
          alert(`Đã tải nội dung file "${file.name}". Vui lòng kiểm tra lại cấu trúc LaTeX!`);
        }, 100);
      }
    };
    reader.readAsText(file);
  };

  const handleUploadTexFile = (e) => {
    const file = e.target.files?.[0];
    processUploadedFile(file);
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
      processUploadedFile(file);
    }
  };

  const handleParseLatexInput = () => {
    const parsed = parseLatexStringToQuestions(examFormData.latexBulkCode);
    if (parsed.length > 0) {
      setEditorQuestions(parsed);
      
      const standardizedLatex = questionsToLatexString(parsed);
      setExamFormData(prev => ({ ...prev, latexBulkCode: standardizedLatex }));
      
      setTimeout(() => {
        alert(`Đã nhận diện và chuẩn hóa thành công ${parsed.length} câu hỏi chuẩn LaTeX!`);
      }, 100);
    } else {
      setTimeout(() => {
        alert('Không nhận diện được định dạng câu hỏi. Vui lòng kiểm tra lại mã (VD: \\begin{ex}...\\choice{...}{\\True ...}\\loigiai{...}\\end{ex})');
      }, 100);
    }
  };

  const handleSaveExam = (e) => {
    e.preventDefault();
    
    let finalQuestions = editorQuestions;
    const parsed = parseLatexStringToQuestions(examFormData.latexBulkCode);
    if (parsed.length > 0) {
      finalQuestions = parsed;
    }

    if (finalQuestions.length === 0) {
      alert('Vui lòng nhập nội dung đề thi với ít nhất 1 câu hỏi!');
      return;
    }

    const examId = editingExamId || ('exam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5));

    const newExamObj = {
      id: examId,
      curriculumId: examFormData.itemId,
      chapterId: examFormData.chapterId,
      title: examFormData.title || 'Bài kiểm tra',
      grade: examFormData.grade,
      gradeLabel: ALL_CURRICULA[examFormData.grade]?.label || 'Toán học',
      duration: parseInt(examFormData.duration, 10) || 15,
      questions: finalQuestions,
      pointsConfig: examFormData.pointsConfig
    };

    if (editingExamId) {
      setExams(prev => prev.map(e => e.id === editingExamId ? newExamObj : e));
    } else {
      setExams(prev => [newExamObj, ...prev]);
    }

    // Lưu trực tiếp lên Supabase
    saveExam(newExamObj);

    setIsEditorOpen(false);
    alert(`Đã lưu thành công bài kiểm tra: "${newExamObj.title}" với ${finalQuestions.length} câu hỏi!`);
  };

  const getExamsByCurriculumId = (currId) => {
    const filtered = exams.filter(e => (e.curriculumId === currId || e.id === currId) && e.questions?.length > 0);
    // Sắp xếp đề cũ lên trên (Đề 1), đề mới xuống dưới (Đề 2, 3...)
    return filtered.sort((a, b) => {
      const timeA = parseInt(a.id.split('_')[1]) || 0;
      const timeB = parseInt(b.id.split('_')[1]) || 0;
      return timeA - timeB;
    });
  };

  const getCurriculumStatText = () => {
    if (activeGradeFilter === 'grade-10') return '9 Chương • 27 Bài học • 5 Kỳ thi định kỳ';
    if (activeGradeFilter === 'grade-11') return '9 Chương • 33 Bài học • 5 Kỳ thi định kỳ';
    if (activeGradeFilter === 'grade-12') return '6 Chương • 19 Bài học • 4 Kỳ thi định kỳ';
    return 'Kho đề thi';
  };

  // Helper trả về nhãn loại câu hỏi
  const getQuestionTypeBadge = (type) => {
    if (type === 'true_false') return <span className="qtype-pill is-tf">Trắc nghiệm Đúng / Sai</span>;
    if (type === 'short_answer') return <span className="qtype-pill is-sa">Trả lời ngắn</span>;
    if (type === 'essay') return <span className="qtype-pill is-essay">Tự luận</span>;
    return <span className="qtype-pill is-mc">Trắc nghiệm 4 lựa chọn</span>;
  };

  // ===================== RENDER: GIAO DIỆN LÀM BÀI THI =====================
  if (examMode === 'taking' && currentExam) {
    const q = currentExam.questions[currentQuestionIndex];
    const isFlagged = !!flaggedQuestions[q.id];
    const currentAnswer = userAnswers[q.id];

    return (
      <div className="exam-taking-view">
        <div className="exam-taking-header glass">
          <div className="exam-title-box">
            <h3 className="exam-live-title">{currentExam.title}</h3>
            <span className="exam-question-progress">
              {Object.keys(userAnswers).length} / {currentExam.questions.length} câu đã làm
            </span>
          </div>

          <div className="exam-timer-box">
            <Clock size={20} className={timeLeft < 180 ? 'timer-icon-warning' : ''} />
            <span className={`timer-text ${timeLeft < 180 ? 'timer-warning' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button className="btn btn-submit-exam" onClick={() => handleSubmitExam(false)}>
            <CheckCircle size={18} /> Nộp bài thi
          </button>
        </div>

        <div className="exam-taking-body">
          <div className="exam-questions-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '10px' }}>
            {currentExam.questions.map((q, index) => {
              const currentAnswer = userAnswers[q.id];
              const isFlagged = !!flaggedQuestions[q.id];

              return (
                <div key={q.id} id={`question-${index}`} className="question-display-card card" style={{ scrollMarginTop: '20px' }}>
                  <div className="question-card-header">
                    <div className="question-number-badge">
                      Câu {index + 1} {getQuestionTypeBadge(q.questionType)}
                    </div>
                    <button 
                      className={`btn-flag ${isFlagged ? 'flagged' : ''}`}
                      onClick={() => toggleFlagQuestion(q.id)}
                      title="Đánh dấu câu này để kiểm tra lại sau"
                    >
                      <Flag size={16} /> {isFlagged ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}
                    </button>
                  </div>

                  <div className="question-math-content">
                    <MathView text={q.content} />
                  </div>

                  {q.questionType === 'true_false' && (
                    <div className="tf-options-taking-table">
                      <div className="tf-table-header">
                        <span>Mệnh đề phát biểu</span>
                        <div className="tf-col-actions">
                          <span>Đúng</span>
                          <span>Sai</span>
                        </div>
                      </div>
                      {(q.options || []).map(opt => {
                        const userChoice = currentAnswer?.[opt.key];
                        return (
                          <div key={opt.key} className="tf-taking-row">
                            <div className="tf-statement-text">
                              <strong>{opt.key})</strong> <MathView text={opt.text} />
                            </div>
                            <div className="tf-btn-group">
                              <button
                                type="button"
                                className={`tf-pick-btn btn-true ${userChoice === 'T' ? 'selected' : ''}`}
                                onClick={() => handleSelectTrueFalse(q.id, opt.key, 'T')}
                              >
                                Đúng
                              </button>
                              <button
                                type="button"
                                className={`tf-pick-btn btn-false ${userChoice === 'F' ? 'selected' : ''}`}
                                onClick={() => handleSelectTrueFalse(q.id, opt.key, 'F')}
                              >
                                Sai
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.questionType === 'short_answer' && (
                    <div className="short-ans-taking-box">
                      <label className="sa-input-label">Trả lời:</label>
                      <div className="sa-input-wrap">
                        <input 
                          type="text"
                          className="input sa-taking-input"
                          placeholder="VD: 59 hoặc -2.5"
                          maxLength={4}
                          value={currentAnswer || ''}
                          onChange={(e) => handleInputShortAns(q.id, e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {q.questionType === 'essay' && (
                    <div className="essay-taking-box">
                      <p className="essay-taking-hint">
                        📝 Đây là câu hỏi tự luận. Bạn hãy làm ra giấy nháp trước, sau khi nộp bài hệ thống sẽ cung cấp lời giải và biểu điểm chi tiết.
                      </p>
                      <textarea 
                        className="input textarea-input" 
                        rows="4" 
                        placeholder="Ghi chú câu trả lời hoặc tóm tắt lời giải của bạn..."
                        value={currentAnswer || ''}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                      />
                    </div>
                  )}

                  {(!q.questionType || q.questionType === 'multiple_choice') && (
                    <div className="options-grid">
                      {q.options.map((opt) => {
                        const isSelected = currentAnswer === opt.key;
                        return (
                          <div 
                            key={opt.key} 
                            className={`option-choice-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectOption(q.id, opt.key)}
                          >
                            <div className="option-key-circle">{opt.key}</div>
                            <div className="option-text">
                              <MathView text={opt.text} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="questions-palette-sidebar card">
            <h4 className="palette-title">Danh sách câu hỏi</h4>
            <div className="palette-grid">
              {currentExam.questions.map((item, idx) => {
                const answered = !!userAnswers[item.id];
                const flagged = !!flaggedQuestions[item.id];

                let btnClass = 'palette-num-btn';
                if (answered) btnClass += ' answered';
                if (flagged) btnClass += ' flagged';

                return (
                  <button 
                    key={item.id} 
                    className={btnClass}
                    onClick={() => {
                      const el = document.getElementById(`question-${idx}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {idx + 1}
                    {flagged && <span className="flag-dot"></span>}
                  </button>
                );
              })}
            </div>

            <div className="palette-legend">
              <div className="legend-item"><span className="dot answered"></span> Đã làm</div>
              <div className="legend-item"><span className="dot unanswered"></span> Chưa làm</div>
              <div className="legend-item"><span className="dot flagged"></span> Đánh dấu</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== RENDER: KẾT QUẢ THI =====================
  if (examMode === 'result' && currentExam && examResult) {
    return (
      <div className="exam-result-view">
        <div className="result-score-card card glass">
          <div className="score-badge-circle">
            <span className="score-number">{examResult.score}</span>
            <span className="score-max">/ {calculateMaxScore(currentExam)}</span>
          </div>

          <div className="score-summary-info">
            <h2>Kết quả làm bài thi</h2>
            <p className="result-exam-name">{currentExam.title}</p>
            
            <div className="result-stats-row">
              <div className="stat-pill">
                <CheckCircle size={18} className="text-emerald" />
                <span>Số câu đúng: <strong>{examResult.correctCount} / {examResult.totalQuestions}</strong></span>
              </div>
              <div className="stat-pill">
                <Clock size={18} className="text-indigo" />
                <span>Thời gian: <strong>{formatTime(examResult.timeSpentSeconds)}</strong></span>
              </div>
              <div className="stat-pill">
                <Award size={18} className="text-amber" />
                <span>Chính xác: <strong>{examResult.totalQuestions > 0 ? Math.round((examResult.correctCount / examResult.totalQuestions) * 100) : 0}%</strong></span>
              </div>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn btn-primary" onClick={() => handleStartExam(currentExam)}>
              <RotateCcw size={16} /> Làm lại đề này
            </button>
            <button className="btn btn-outline" onClick={() => setExamMode('list')}>
              <ArrowLeft size={16} /> Về danh sách đề
            </button>
          </div>
        </div>

        <div className="review-questions-list">
          <h3 className="section-heading">Chi tiết bài làm & Lời giải</h3>

          {currentExam.questions.map((q, idx) => {
            const userChoice = userAnswers[q.id];

            return (
              <div key={q.id} className="review-question-card card">
                <div className="review-card-header">
                  <span className="review-q-num">Câu {idx + 1} {getQuestionTypeBadge(q.questionType)}</span>
                </div>

                <div className="review-question-content">
                  <MathView text={q.content} />
                </div>

                {/* Đúng sai review */}
                {q.questionType === 'true_false' && (
                  <div className="tf-review-table">
                    {(q.options || []).map(opt => {
                      const userPick = userChoice?.[opt.key];
                      const correctPick = opt.isCorrectTrue ? 'T' : 'F';
                      const isSubCorrect = userPick === correctPick;

                      return (
                        <div key={opt.key} className={`tf-review-row ${isSubCorrect ? 'is-sub-correct' : 'is-sub-wrong'}`}>
                          <div className="tf-statement-text">
                            <strong>{opt.key})</strong> <MathView text={opt.text} />
                          </div>
                          <div className="tf-status-pills">
                            <span className="badge-expected">Đáp án: <strong>{opt.isCorrectTrue ? 'Đúng' : 'Sai'}</strong></span>
                            <span className={isSubCorrect ? 'badge-user-ok' : 'badge-user-bad'}>
                              Bạn chọn: {userPick === 'T' ? 'Đúng' : (userPick === 'F' ? 'Sai' : 'Chưa làm')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Trả lời ngắn review */}
                {q.questionType === 'short_answer' && (
                  <div className="sa-review-box">
                    <div className="sa-review-pill">
                      <span>Đáp án đúng: <strong>{q.correctAnswer}</strong></span>
                    </div>
                    <div className="sa-review-user">
                      <span>Bạn đã điền: <strong>{userChoice || 'Chưa điền'}</strong></span>
                    </div>
                  </div>
                )}

                {/* 4 phương án review */}
                {(!q.questionType || q.questionType === 'multiple_choice') && (
                  <div className="review-options-grid">
                    {q.options.map(opt => {
                      const isUserPick = userChoice === opt.key;
                      const isKeyCorrect = opt.key === q.correctAnswer;

                      let optClass = 'review-option';
                      if (isKeyCorrect) optClass += ' correct-option';
                      if (isUserPick && !isKeyCorrect) optClass += ' wrong-option';

                      return (
                        <div key={opt.key} className={optClass}>
                          <span className="review-opt-key">{opt.key}</span>
                          <div className="review-opt-text">
                            <MathView text={opt.text} />
                          </div>
                          {isKeyCorrect && <Check size={16} className="text-emerald check-icon" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.explanation && (
                  <div className="review-explanation-box">
                    <div className="explanation-title">
                      <Sparkles size={16} /> Lời giải chi tiết:
                    </div>
                    <div className="explanation-text">
                      <MathView text={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===================== RENDER: DANH SÁCH BÀI KIỂM TRA =====================
  return (
    <div className="exams-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Phòng Thi Thử & Kiểm Tra Trực Tuyến</h2>
          <p className="page-subtitle">
            Hệ thống bài kiểm tra theo từng bài học (SGK Kết Nối Tri Thức), kiểm tra chương, THPT Quốc Gia & VACT chuẩn LaTeX
          </p>
        </div>

        {isTeacher && (
          <button className="btn btn-primary" onClick={handleOpenAddExam}>
            <Plus size={20} />
            Soạn đề thi mới (LaTeX)
          </button>
        )}
      </div>

      {/* Filter Tabs (Mở tự do cho toàn bộ học sinh và giáo viên) */}
      <div className="exam-filter-tabs">
        {[
          { id: 'grade-10', label: '🎓 Khối 10' },
          { id: 'grade-11', label: '🎓 Khối 11' },
          { id: 'grade-12', label: '🎓 Khối 12' },
          { id: 'grade-thptqg', label: '🎯 THPTQG' },
          { id: 'grade-vact', label: '⚡ VACT' }
        ].map(filter => (
          <button
            key={filter.id}
            className={`filter-pill ${activeGradeFilter === filter.id ? 'active' : ''}`}
            onClick={() => {
              setActiveGradeFilter(filter.id);
              setSearchLessonQuery('');
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* GIAO DIỆN MỤC LỤC CHI TIẾT (CHO KHỐI 10, 11 VÀ 12) */}
      {currentCurriculum ? (
        <div className="grade10-curriculum-container">
          <div className="curriculum-top-bar card">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text"
                className="input search-curriculum-input"
                placeholder={`Tìm nhanh bài học ${ALL_CURRICULA[activeGradeFilter]?.label}...`}
                value={searchLessonQuery}
                onChange={(e) => setSearchLessonQuery(e.target.value)}
              />
            </div>
            <span className="curriculum-stat-badge">
              {getCurriculumStatText()}
            </span>
          </div>

          {/* Thanh cuộn nhanh đến Chương & Kiểm tra định kì */}
          <div className="quick-jump-container card">
            <span className="quick-jump-label">⚡ Cuộn nhanh đến:</span>
            <div className="quick-jump-pills">
              {currentCurriculum.map((chap) => (
                <button
                  key={chap.chapterId}
                  className={`quick-jump-pill ${chap.isTermExams ? 'is-term' : ''}`}
                  onClick={() => scrollToChapter(chap.chapterId)}
                  title={`Cuộn nhanh đến ${chap.chapterName}`}
                >
                  {chap.isTermExams ? '🏆 Kiểm tra định kì' : `Chương ${chap.chapterNumber}`}
                </button>
              ))}
            </div>
          </div>

          <div className="chapters-list">
            {currentCurriculum.map((chapter) => {
              const matchingItems = chapter.items.filter(item => 
                item.name.toLowerCase().includes(searchLessonQuery.toLowerCase())
              );

              if (searchLessonQuery && matchingItems.length === 0) return null;

              const isExpanded = expandedChapters[chapter.chapterId] !== false;

              return (
                <div 
                  key={chapter.chapterId} 
                  id={`chapter-${chapter.chapterId}`}
                  className={`chapter-block card ${chapter.isTermExams ? 'term-exams-chapter' : ''}`}
                >
                  <div 
                    className="chapter-header"
                    onClick={() => toggleChapterExpand(chapter.chapterId)}
                  >
                    <div className="chapter-header-left">
                      <div className="chapter-num-badge">
                        {chapter.chapterNumber}
                      </div>
                      <h3 className="chapter-title">{chapter.chapterName}</h3>
                    </div>

                    <div className="chapter-header-right">
                      <span className="item-count-text">
                        {chapter.items.length} bài kiểm tra
                      </span>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="chapter-items-grid">
                      {(searchLessonQuery ? matchingItems : chapter.items).map((item) => {
                        const lessonExams = getExamsByCurriculumId(item.id);
                        const hasExams = lessonExams.length > 0;

                        return (
                          <div 
                            key={item.id} 
                            className={`lesson-exam-block card ${item.type === 'chapter_test' ? 'is-chapter-test' : ''} ${item.type === 'term_exam' ? 'is-term-exam' : ''}`}
                          >
                            <div className="lesson-exam-header-row">
                              <div className="lesson-exam-left">
                                <div className="lesson-type-icon">
                                  {item.type === 'term_exam' ? (
                                    <Calendar size={18} className="text-amber" />
                                  ) : item.type === 'chapter_test' ? (
                                    <Award size={18} className="text-indigo" />
                                  ) : (
                                    <BookOpen size={18} className="text-emerald" />
                                  )}
                                </div>
                                <div className="lesson-meta-box">
                                  <h4 className="lesson-name">{item.name}</h4>
                                  <div className="lesson-sub-meta">
                                    <span className="meta-q-count">
                                      {hasExams ? (
                                        <span className="badge-has-q">
                                          <CheckSquare size={13} /> {lessonExams.length} bộ đề thi
                                        </span>
                                      ) : (
                                        <span className="badge-no-q">Chưa có đề</span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {isTeacher && (
                                <button 
                                  className="btn btn-outline btn-sm btn-add-sub-exam"
                                  onClick={() => handleOpenAddNewExamToLesson(item, chapter, activeGradeFilter)}
                                  title="Thêm một bộ đề thi mới cho bài học này"
                                >
                                  <Plus size={14} /> Thêm đề thi mới
                                </button>
                              )}
                            </div>

                            {/* DANH SÁCH TẤT CẢ CÁC ĐỀ THI ĐÃ TẠO CHO BÀI NÀY */}
                            {hasExams ? (
                              <div className="lesson-sub-exams-list">
                                {lessonExams.filter(ex => isTeacher || !ex.isHidden).map((ex, exIdx) => (
                                  <div key={ex.id} className={`sub-exam-item-row ${ex.isHidden ? 'opacity-60' : ''}`}>
                                    <div className="sub-exam-left-info">
                                      <span className="sub-exam-tag" style={ex.isHidden ? {background: '#e5e7eb', color: '#6b7280'} : {}}>Đề {exIdx + 1}</span>
                                      <h5 className="sub-exam-title">
                                        {ex.title}
                                      </h5>
                                      <span className="sub-exam-pill"><Clock size={12} /> {ex.duration} phút</span>
                                      <span className="sub-exam-pill is-count"><CheckSquare size={12} /> {ex.questions?.length || 0} câu</span>
                                    </div>

                                    <div className="sub-exam-actions">
                                      <button 
                                        className="btn btn-primary btn-sm btn-take-sub-exam"
                                        onClick={() => handleStartExam(ex)}
                                      >
                                        <Play size={14} /> Làm bài
                                      </button>

                                      {isTeacher && (
                                        <div className="teacher-sub-btn-group">
                                          <button 
                                            className="icon-btn"
                                            onClick={() => handleToggleHideExam(ex.id)}
                                            title={ex.isHidden ? "Hiển thị đề thi này" : "Ẩn đề thi này"}
                                          >
                                            {ex.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                          </button>
                                          <button 
                                            className="icon-btn edit-sub-btn"
                                            onClick={() => handleOpenEditSpecificExam(ex, item, chapter, activeGradeFilter)}
                                            title="Chỉnh sửa đề thi này (LaTeX)"
                                          >
                                            <Edit size={14} />
                                          </button>
                                          <button 
                                            className="icon-btn delete-sub-btn"
                                            onClick={() => handleDeleteSpecificExam(ex.id, ex.title)}
                                            title="Xóa đề thi này"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              !isTeacher && (
                                <div className="no-exam-empty-hint">
                                  <span className="text-muted-status">Giáo viên đang cập nhật đề thi cho bài học này...</span>
                                </div>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* GIAO DIỆN CHO CÁC ĐỀ THI TỰ DO (THPT QUỐC GIA & VACT) */
        <div className="freeform-exams-wrapper">
          <div className="freeform-header-bar card">
            <div className="freeform-info">
              <h3>{ALL_CURRICULA[activeGradeFilter]?.label === 'THPTQG' ? '🎯 Đề Thi Thử Tốt Nghiệp THPT Quốc Gia Môn Toán' : '⚡ Đề Thi Thử Đánh Giá Năng Lực VACT'}</h3>
              <p>Tổng hợp các bộ đề thi thử chất lượng cao có đầy đủ công thức LaTeX và lời giải chi tiết</p>
            </div>
            {isTeacher && (
              <button className="btn btn-primary" onClick={handleOpenAddExam}>
                <Plus size={16} /> Thêm đề {ALL_CURRICULA[activeGradeFilter]?.label} mới
              </button>
            )}
          </div>

          <div className="exams-grid">
            {exams.filter(ex => ex.grade === activeGradeFilter && (isTeacher || !ex.isHidden)).map((exam) => (
              <div key={exam.id} className={`exam-card card ${exam.isHidden ? 'opacity-60' : ''}`}>
                <div className="exam-card-badge-row">
                  <span className="exam-grade-badge">{exam.gradeLabel || 'THPTQG'}</span>
                  <div className="exam-meta-pill">
                    <Clock size={14} /> {exam.duration} phút
                  </div>
                </div>

                <h3 className="exam-card-title">
                  {exam.title}
                </h3>

                <div className="exam-card-details">
                  <div className="detail-item">
                    <HelpCircle size={15} /> {exam.questions?.length || 0} câu hỏi (Đầy đủ 4 dạng)
                  </div>
                  <div className="detail-item">
                    <BookOpen size={15} /> Chuẩn công thức LaTeX & Lời giải
                  </div>
                </div>

                <div className="exam-card-footer">
                  <button className="btn btn-primary btn-start-exam" onClick={() => handleStartExam(exam)}>
                    <Play size={16} /> Bắt đầu làm bài
                  </button>

                  {isTeacher && (
                    <div className="teacher-exam-actions">
                      <button className="icon-btn" onClick={() => handleToggleHideExam(exam.id)} title={exam.isHidden ? "Hiển thị đề thi" : "Ẩn đề thi"}>
                        {exam.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button className="icon-btn edit-btn" onClick={() => handleOpenEditFreeformExam(exam)} title="Sửa đề (LaTeX)">
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDeleteFreeformExam(exam.id, exam.title)} title="Xóa đề">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== MODAL SOẠN ĐỀ 2 CỘT (IDE LATEX & LIVE COMPILED VIEW) ===================== */}
      {isTeacher && isEditorOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content glass exam-editor-modal modal-dual-pane">
            <div className="modal-header">
              <div className="modal-title-box">
                <div className="modal-title-left">
                  <FileCode size={22} className="text-indigo" />
                  <h3>{editingExamId ? 'Soạn & Biên dịch đề thi LaTeX' : 'Tạo đề thi mới (Trình soạn LaTeX)'}</h3>
                </div>
                <span className="modal-sub-badge">
                  {ALL_CURRICULA[examFormData.grade]?.label} • {examFormData.title}
                </span>
              </div>
              <button className="icon-btn" onClick={() => setIsEditorOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="modal-form-dual">
              <div className="editor-two-columns-layout">
                {/* CỘT TRÁI */}
                <div className="editor-left-column">
                  <div className="editor-dropdowns-compact">
                    <div className="form-group">
                      <label>Khối:</label>
                      <select 
                        className="input select-input select-compact"
                        value={examFormData.grade}
                        onChange={(e) => handleGradeChangeInModal(e.target.value)}
                      >
                        <option value="grade-10">Khối 10</option>
                        <option value="grade-11">Khối 11</option>
                        <option value="grade-12">Khối 12</option>
                        <option value="grade-thptqg">THPTQG</option>
                        <option value="grade-vact">VACT</option>
                      </select>
                    </div>

                    {ALL_CURRICULA[examFormData.grade]?.data && (
                      <div className="form-group">
                        <label>Chương:</label>
                        <select 
                          className="input select-input select-compact"
                          value={examFormData.chapterId}
                          onChange={(e) => handleChapterChangeInModal(e.target.value)}
                        >
                          {ALL_CURRICULA[examFormData.grade]?.data.map(chap => (
                            <option key={chap.chapterId} value={chap.chapterId}>
                              {chap.isTermExams ? '🏆 ĐỊNH KỲ (GK1, CK1...)' : `${chap.chapterName}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {ALL_CURRICULA[examFormData.grade]?.data && (
                      <div className="form-group">
                        <label>Bài học / Kỳ thi:</label>
                        <select 
                          className="input select-input select-compact"
                          value={examFormData.itemId}
                          onChange={(e) => handleItemChangeInModal(e.target.value)}
                        >
                          {ALL_CURRICULA[examFormData.grade]?.data
                            .find(c => c.chapterId === examFormData.chapterId)
                            ?.items?.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    )}

                    <div className="form-group time-group">
                      <label>Thời gian:</label>
                      <div className="time-input-wrap">
                        <input 
                          type="number" 
                          className="input select-compact" 
                          min="5" 
                          max="180"
                          value={examFormData.duration}
                          onChange={(e) => setExamFormData({ ...examFormData, duration: e.target.value })}
                          required
                        />
                        <span className="unit-text">phút</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group title-compact-group">
                    <label>Tiêu đề bài kiểm tra:</label>
                    <input 
                      type="text" 
                      className="input input-sm" 
                      value={examFormData.title}
                      onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* POINTS CONFIG UI */}
                  <div className="points-config-box card" style={{ padding: '12px', marginBottom: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text-color, #f8fafc)' }}>Cấu hình điểm số</h4>
                      <span style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '14px', background: 'rgba(var(--primary-color-rgb), 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                        Tổng điểm: {
                          ((editorQuestions.filter(q => q.questionType === 'multiple_choice' || !q.questionType).length * (examFormData.pointsConfig?.multipleChoice || 0)) + 
                          (editorQuestions.filter(q => q.questionType === 'short_answer').length * (examFormData.pointsConfig?.shortAnswer || 0)) + 
                          (editorQuestions.filter(q => q.questionType === 'true_false').length * (examFormData.pointsConfig?.trueFalse?.correct4 || 0))).toFixed(2)
                        }
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>Trắc nghiệm 4 PA ({editorQuestions.filter(q => q.questionType === 'multiple_choice' || !q.questionType).length} câu)</label>
                        <input 
                          type="number" step="0.01" min="0" className="input input-sm" 
                          value={examFormData.pointsConfig?.multipleChoice ?? 0.25} 
                          onChange={(e) => setExamFormData(prev => ({ ...prev, pointsConfig: { ...prev.pointsConfig, multipleChoice: parseFloat(e.target.value) || 0 } }))} 
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>Trả lời ngắn ({editorQuestions.filter(q => q.questionType === 'short_answer').length} câu)</label>
                        <input 
                          type="number" step="0.01" min="0" className="input input-sm" 
                          value={examFormData.pointsConfig?.shortAnswer ?? 0.5} 
                          onChange={(e) => setExamFormData(prev => ({ ...prev, pointsConfig: { ...prev.pointsConfig, shortAnswer: parseFloat(e.target.value) || 0 } }))} 
                        />
                      </div>
                    </div>
                    
                    {editorQuestions.filter(q => q.questionType === 'true_false').length > 0 && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-color, #334155)' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', marginBottom: '8px', display: 'block' }}>Trắc nghiệm Đúng/Sai ({editorQuestions.filter(q => q.questionType === 'true_false').length} câu)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          <div>
                            <span style={{ fontSize: '11px', display: 'block', color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>Đúng 1 ý</span>
                            <input type="number" step="0.01" min="0" className="input input-sm" value={examFormData.pointsConfig?.trueFalse?.correct1 ?? 0.1} onChange={(e) => setExamFormData(prev => ({ ...prev, pointsConfig: { ...prev.pointsConfig, trueFalse: { ...prev.pointsConfig.trueFalse, correct1: parseFloat(e.target.value) || 0 } } }))} />
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', display: 'block', color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>Đúng 2 ý</span>
                            <input type="number" step="0.01" min="0" className="input input-sm" value={examFormData.pointsConfig?.trueFalse?.correct2 ?? 0.25} onChange={(e) => setExamFormData(prev => ({ ...prev, pointsConfig: { ...prev.pointsConfig, trueFalse: { ...prev.pointsConfig.trueFalse, correct2: parseFloat(e.target.value) || 0 } } }))} />
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', display: 'block', color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>Đúng 3 ý</span>
                            <input type="number" step="0.01" min="0" className="input input-sm" value={examFormData.pointsConfig?.trueFalse?.correct3 ?? 0.5} onChange={(e) => setExamFormData(prev => ({ ...prev, pointsConfig: { ...prev.pointsConfig, trueFalse: { ...prev.pointsConfig.trueFalse, correct3: parseFloat(e.target.value) || 0 } } }))} />
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', display: 'block', color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>Đúng 4 ý</span>
                            <input type="number" step="0.01" min="0" className="input input-sm" value={examFormData.pointsConfig?.trueFalse?.correct4 ?? 1.0} onChange={(e) => setExamFormData(prev => ({ ...prev, pointsConfig: { ...prev.pointsConfig, trueFalse: { ...prev.pointsConfig.trueFalse, correct4: parseFloat(e.target.value) || 0 } } }))} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="latex-toolbar-compact">
                    <div className="toolbar-status-badge">
                      <span>Mã nguồn LaTeX (Hỗ trợ 4 dạng & ex_test.sty)</span>
                    </div>

                    <div className="toolbar-actions-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        type="button" 
                        className={`btn btn-outline btn-xs ${isTexSearchOpen ? 'btn-active' : ''}`}
                        onClick={() => setIsTexSearchOpen(!isTexSearchOpen)}
                        title="Tìm kiếm trong mã LaTeX"
                      >
                        <Search size={13} />
                      </button>
                      
                      <input 
                        type="file" 
                        ref={texFileInputRef} 
                        accept=".tex,.txt"
                        style={{ display: 'none' }}
                        onChange={handleUploadTexFile}
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline btn-xs"
                        onClick={() => texFileInputRef.current?.click()}
                      >
                        <Upload size={13} /> Tải file .tex
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary btn-xs"
                        onClick={handleParseLatexInput}
                      >
                        <Sparkles size={13} /> Biên dịch lại
                      </button>
                    </div>
                  </div>

                  {isTexSearchOpen && (
                    <div className="tex-search-bar" style={{ padding: '8px', background: 'var(--bg-secondary, #1e293b)', borderBottom: '1px solid var(--border-color, #334155)', display: 'flex', gap: '8px' }}>
                      <div className="search-input-wrapper" style={{ margin: 0, padding: 0, position: 'relative', flex: 1 }}>
                        <Search size={13} className="search-icon" style={{ left: '8px', top: '50%', transform: 'translateY(-50%)', position: 'absolute', color: '#94a3b8' }} />
                        <input 
                          type="text"
                          ref={texSearchInputRef}
                          className="input input-sm"
                          placeholder="Gõ từ khóa và ấn Enter để tìm..."
                          defaultValue=""
                          onKeyDown={handleTexSearchKeyDown}
                          autoFocus
                          style={{ paddingLeft: '28px', height: '28px', fontSize: '12px', width: '100%', borderRadius: '4px', border: '1px solid var(--border-color, #334155)', background: 'var(--bg-primary, #0f172a)', color: '#fff' }}
                        />
                      </div>
                      <button 
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={(e) => { e.preventDefault(); handleTexSearchKeyDown({ key: 'Enter', preventDefault: () => {} }); }}
                        style={{ height: '28px', minHeight: '28px', fontSize: '12px' }}
                      >
                        Tìm tiếp
                      </button>
                    </div>
                  )}

                  <div 
                    className={`latex-dropzone-container flex-grow-editor ${isDraggingFile ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {isDraggingFile && (
                      <div className="drag-overlay-indicator">
                        <div className="drag-overlay-card">
                          <div className="drag-icon-glow">
                            <Upload size={32} />
                          </div>
                          <p className="drag-main-title">📂 Thả tệp .tex hoặc .txt vào đây</p>
                          <span className="drag-sub-hint">Hệ thống sẽ tự động nạp và biên dịch tức thì</span>
                        </div>
                      </div>
                    )}

                    <textarea 
                      ref={texTextareaRef}
                      className="input textarea-input latex-code-box full-height-textarea"
                      style={{ height: '100%', minHeight: '100%', flex: 1, resize: 'none' }}
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
                      value={examFormData.latexBulkCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamFormData({ ...examFormData, latexBulkCode: val });
                        const parsed = parseLatexStringToQuestions(val);
                        setEditorQuestions(parsed);
                      }}
                    />
                  </div>
                </div>

                {/* CỘT PHẢI: KẾT QUẢ BIÊN DỊCH */}
                <div className="editor-right-column">
                  <div className="preview-column-header">
                    <div className="preview-title-wrap">
                      <Eye size={18} className="text-emerald" />
                      <h4>Kết quả biên dịch hiển thị</h4>
                    </div>
                    <span className="parsed-count-pill">
                      {editorQuestions.length} câu hỏi
                    </span>
                  </div>

                  <div className="compiled-questions-scroll-area">
                    {editorQuestions.length === 0 ? (
                      <div className="empty-preview-state">
                        <FileCode size={36} className="text-muted" />
                        <p>Chưa có câu hỏi nào được biên dịch.</p>
                        <span>Nhập mã LaTeX hoặc kéo thả file <code>.tex</code> ở cột bên trái để xem kết quả.</span>
                      </div>
                    ) : (
                      editorQuestions.map((question, qIdx) => (
                        <div 
                          key={question.id || qIdx} 
                          className="compiled-question-card"
                          onClick={() => handleQuestionClick(question)}
                          style={{ cursor: 'pointer' }}
                          title="Nhấn để cuộn đến mã nguồn LaTeX của câu này"
                        >
                          <div className="compiled-q-header">
                            <span className="compiled-q-badge">Câu {qIdx + 1} {getQuestionTypeBadge(question.questionType)}</span>
                            {question.questionType === 'multiple_choice' && (
                              <span className="compiled-correct-badge">
                                Đáp án đúng: <strong>{question.correctAnswer}</strong>
                              </span>
                            )}
                            {question.questionType === 'short_answer' && (
                              <span className="compiled-correct-badge">
                                Đáp án: <strong>{question.correctAnswer}</strong>
                              </span>
                            )}
                          </div>

                          <div className="compiled-q-content">
                            <MathView text={question.content} />
                          </div>

                          {/* 1. Dạng Trắc nghiệm Đúng / Sai */}
                          {question.questionType === 'true_false' && (
                            <div className="compiled-tf-list">
                              {(question.options || []).map((opt) => (
                                <div key={opt.key} className={`compiled-tf-item ${opt.isCorrectTrue ? 'is-tf-true' : 'is-tf-false'}`}>
                                  <span className="tf-key-badge">{opt.key})</span>
                                  <div className="tf-item-text">
                                    <MathView text={opt.text} />
                                  </div>
                                  <span className={`tf-val-badge ${opt.isCorrectTrue ? 'val-true' : 'val-false'}`}>
                                    {opt.isCorrectTrue ? '✓ ĐÚNG' : '✗ SAI'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 2. Dạng Trả lời ngắn */}
                          {question.questionType === 'short_answer' && (
                            <div className="compiled-shortans-box">
                              <span className="sa-label">Đáp án điền ngắn:</span>
                              <span className="sa-value-badge">{String(question.correctAnswer || '').replace(/\{,\}/g, ',').replace(/\$/g, '').trim()}</span>
                            </div>
                          )}

                          {/* 3. Dạng 4 phương án */}
                          {(!question.questionType || question.questionType === 'multiple_choice') && (
                            <div className="compiled-options-grid">
                              {question.options.map((opt) => {
                                const isCorrect = opt.key === question.correctAnswer;
                                return (
                                  <div key={opt.key} className={`compiled-option-item ${isCorrect ? 'is-correct-choice' : ''}`}>
                                    <div className="opt-key-circle-sm">{opt.key}</div>
                                    <div className="opt-text-sm">
                                      <MathView text={opt.text} />
                                    </div>
                                    {isCorrect && <Check size={14} className="text-emerald check-icon-sm" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Lời giải chi tiết */}
                          {question.explanation && (
                            <div className="compiled-explanation-box">
                              <span className="exp-label">Lời giải:</span>
                              <div className="exp-content">
                                <MathView text={question.explanation} />
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-actions modal-dual-footer">
                <div className="footer-left-hint">
                  <span>💡 Hệ thống đã tự động lọc bỏ các comment <code>%</code> và hỗ trợ đầy đủ 4 dạng câu hỏi chuẩn Bộ GD&ĐT.</span>
                </div>
                <div className="footer-right-buttons">
                  <button type="button" className="btn btn-outline" onClick={() => setIsEditorOpen(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} /> Lưu đề thi ({editorQuestions.length} câu) vào hệ thống
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Exams;
