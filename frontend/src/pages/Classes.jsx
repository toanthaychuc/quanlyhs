import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertCircle, 
  School, 
  GraduationCap, 
  X, 
  UserMinus,
  FileDown,
  RotateCcw,
  UserX,
  ChevronLeft,
  ChevronRight,
  FolderPlus
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import StudentName from '../components/StudentName';
import { exportStudentsToExcel, downloadTemplateExcel, parseStudentExcelFile } from '../utils/excelUtils';
import { getClasses, saveAllClasses, deleteClass } from '../services/classService';
import './Classes.css';

const DEFAULT_SCORE_COLUMNS = [
  { id: 'regular1', name: 'TX 1', weight: 1 },
  { id: 'regular2', name: 'TX 2', weight: 1 },
  { id: 'midterm', name: 'Giữa Kỳ', weight: 2 },
  { id: 'final', name: 'Cuối Kỳ', weight: 3 }
];

const LOCAL_STORAGE_KEY = 'edumanager_classes_data_v2';

const Classes = () => {
  const { isTeacher, isStudent, currentStudentId } = useRole();

  // State danh sách lớp học — khởi tạo từ localStorage cache, sau đó sync từ Supabase
  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(c => ({ ...c, teacher: 'Thầy Lê Công Chức' }));
        }
      } catch (e) {
        console.error('Failed to parse classes from localStorage', e);
      }
    }
    return [];
  });

  // Tab active: classes, docs, homework, ranks (Mobile)
  const [activeTab, setActiveTab] = useState('classes');

  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Tải dữ liệu từ Supabase (Stale-While-Revalidate)
  useEffect(() => {
    // 1. Lấy dữ liệu local (nhanh, 0 độ trễ)
    getClasses(false).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setClasses(data.map(c => ({ ...c, teacher: 'Thầy Lê Công Chức' })));
      }
      // 2. Kéo dữ liệu mới nhất từ mây ở chế độ nền
      getClasses(true).then(freshData => {
        if (Array.isArray(freshData)) {
          setClasses(freshData.map(c => ({ ...c, teacher: 'Thầy Lê Công Chức' })));
        }
        setIsCloudSynced(true);
      }).catch(err => {
        console.error('Background sync getClasses error:', err);
        setIsCloudSynced(true);
      });
    }).catch(err => {
      console.error('Local getClasses error:', err);
      setIsCloudSynced(true);
    });
  }, []);

  // Tự động lưu cache vào localStorage và đồng bộ lên Supabase mỗi khi có thay đổi ở classes
  // Giúp dữ liệu không bị mất khi F5 và học sinh cập nhật được ngay lập tức
  useEffect(() => {
    if (classes && classes.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(classes));
      if (!isCloudSynced) return;
      saveAllClasses(classes).catch(err => console.error('Auto-sync error:', err));
    } else if (classes && classes.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(classes));
    }
  }, [classes, isCloudSynced]);

  // Tìm lớp của học sinh đang đăng nhập
  const myEnrolledClass = classes.find(cls => 
    (cls.students || []).some(s => s.id === currentStudentId)
  ) || classes[0];

  // Tìm thông tin cá nhân của học sinh đang đăng nhập
  const myStudentProfile = myEnrolledClass?.students?.find(s => s.id === currentStudentId);

  // Tab lọc trường: 'ALL', 'NP', 'THTH'
  const [selectedSchool, setSelectedSchool] = useState('ALL');
  // Lớp đang được chọn xem danh sách
  const [activeClassId, setActiveClassId] = useState(() => {
    return classes[0]?.id || 'np-10t8';
  });

  // State for editing academic year
  const [isEditingYear, setIsEditingYear] = useState(false);
  const [tempYear, setTempYear] = useState('');

  // Tự động chuyển activeClassId sang đúng lớp của học sinh khi ở chế độ Student
  useEffect(() => {
    if (isStudent && myEnrolledClass) {
      setActiveClassId(myEnrolledClass.id);
    }
  }, [isStudent, currentStudentId, myEnrolledClass?.id]);

  // Tìm kiếm học sinh
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc lớp theo trường
  const filteredClasses = selectedSchool === 'ALL' 
    ? classes 
    : classes.filter(c => c.school === selectedSchool);

  // Lớp hiện tại
  const currentClass = classes.find(c => c.id === activeClassId) || filteredClasses[0];

  // Học sinh của lớp hiện tại
  const currentStudents = currentClass?.students || [];

  // Lọc học sinh theo tìm kiếm
  const filteredStudents = currentStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selected students for batch delete
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    id: '', name: '', dob: '', gender: 'Nam', phone: '', email: '', note: '', scores: {}
  });

  // State Cấu hình cột điểm
  const [showScoreConfigModal, setShowScoreConfigModal] = useState(false);
  const [tempScoreColumns, setTempScoreColumns] = useState([...DEFAULT_SCORE_COLUMNS]);

  // State Điểm danh
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  
  // State Import Excel
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [newScoreColumnsFromExcel, setNewScoreColumnsFromExcel] = useState([]);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [importMode, setImportMode] = useState('merge');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);


  // State Thêm / Sửa Lớp Học Mới
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [newClassForm, setNewClassForm] = useState({
    name: '',
    school: 'NP',
    customSchool: '',
    grade: '10',
    academicYear: '2025 - 2026',
    color: '#4f46e5'
  });

  // Handler: Mở modal sửa lớp học
  const handleOpenEditClass = (cls, e) => {
    e?.stopPropagation();
    setEditingClassId(cls.id);
    const isStandardSchool = ['NP', 'THTH'].includes(cls.school);
    setNewClassForm({
      name: cls.name,
      school: isStandardSchool ? cls.school : 'OTHER',
      customSchool: isStandardSchool ? '' : (cls.schoolFullName || cls.school),
      grade: String(cls.grade || '10'),
      academicYear: cls.academicYear || '2025 - 2026',
      color: cls.color || '#4f46e5'
    });
    setShowAddClassModal(true);
  };

  // Handler: Mở modal thêm lớp học
  const handleOpenAddClass = () => {
    setEditingClassId(null);
    setNewClassForm({
      name: '',
      school: 'NP',
      customSchool: '',
      grade: '10',
      academicYear: '2025 - 2026',
      color: '#4f46e5'
    });
    setShowAddClassModal(true);
  };

  // Handler: Di chuyển thứ tự lớp học
  const handleMoveClass = (classId, direction, e) => {
    e?.stopPropagation();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) return;

    if (direction === 'left' && index > 0) {
      const newClasses = [...classes];
      const temp = newClasses[index - 1];
      newClasses[index - 1] = newClasses[index];
      newClasses[index] = temp;
      setClasses(newClasses);
    } else if (direction === 'right' && index < classes.length - 1) {
      const newClasses = [...classes];
      const temp = newClasses[index + 1];
      newClasses[index + 1] = newClasses[index];
      newClasses[index] = temp;
      setClasses(newClasses);
    }
  };

  // Handler: Xóa lớp học (Cho phép xóa sạch toàn bộ các lớp)
  const handleDeleteClass = async (classId, className, e) => {
    e?.stopPropagation();
    if (window.confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa lớp "${className}" cùng toàn bộ dữ liệu học sinh của lớp này?`)) {
      try {
        await deleteClass(classId);
        const remainingClasses = classes.filter(c => c.id !== classId);
        setClasses(remainingClasses);
        if (activeClassId === classId) {
          setActiveClassId(remainingClasses[0]?.id || '');
        }
      } catch (err) {
        console.error('Lỗi xóa lớp:', err);
        alert('Không thể xóa lớp. Vui lòng thử lại.');
      }
    }
  };

  // Handler: Thêm hoặc Cập nhật lớp học
  const handleSaveNewClass = (e) => {
    e.preventDefault();
    if (!newClassForm.name.trim()) return;

    const schoolCode = newClassForm.school === 'OTHER' 
      ? (newClassForm.customSchool.trim().toUpperCase() || 'TRUONG') 
      : newClassForm.school;

    const schoolFullName = schoolCode === 'NP' 
      ? 'Trung tâm NP (NP)' 
      : schoolCode === 'THTH' 
        ? 'Trường Trung học Thực hành (THTH)' 
        : (newClassForm.customSchool.trim() || 'Trường học');

    if (editingClassId) {
      // Cập nhật lớp đã có
      setClasses(prev => prev.map(c => {
        if (c.id !== editingClassId) return c;
        return {
          ...c,
          name: newClassForm.name.trim(),
          school: schoolCode,
          schoolFullName: schoolFullName,
          grade: newClassForm.grade,
          academicYear: newClassForm.academicYear || '2025 - 2026',
          color: newClassForm.color || c.color || '#4f46e5',
        };
      }));
    } else {
      // Thêm lớp mới
      const newClassObj = {
        id: `cls_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: newClassForm.name.trim(),
        school: schoolCode,
        schoolFullName: schoolFullName,
        grade: newClassForm.grade,
        academicYear: newClassForm.academicYear || '2025 - 2026',
        teacher: 'Thầy Lê Công Chức',
        subject: 'Toán học',
        color: newClassForm.color || '#4f46e5',
        scoreColumns: DEFAULT_SCORE_COLUMNS,
        students: []
      };

      setClasses(prev => [...prev, newClassObj]);
      setActiveClassId(newClassObj.id);
    }

    setShowAddClassModal(false);
    setEditingClassId(null);
    setNewClassForm({
      name: '',
      school: 'NP',
      customSchool: '',
      grade: '10',
      academicYear: '2025 - 2026',
      color: '#4f46e5'
    });
  };

  // Handler: Mở modal thêm/sửa học sinh
  const handleOpenStudentModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setStudentForm({ 
        ...student,
        scores: student.scores || {}
      });
    } else {
      setEditingStudent(null);
      setStudentForm({
        id: `HS${String((currentClass?.students?.length || 0) + 1).padStart(2, '0')}`,
        name: '',
        gender: 'Nam',
        dob: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        scores: {}
      });
    }
    setShowAddModal(true);
  };

  // Handler: Lưu học sinh (Thêm mới hoặc Cập nhật)
  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!studentForm.name.trim()) return;

    // Tính điểm trung bình tự động dựa trên scoreColumns
    const activeColumns = currentClass?.scoreColumns || DEFAULT_SCORE_COLUMNS;
    let totalWeightedScore = 0;
    let totalWeight = 0;
    let hasAnyScore = false;

    activeColumns.forEach(col => {
       const val = parseFloat(studentForm.scores?.[col.id]);
       if (!isNaN(val)) {
          totalWeightedScore += val * col.weight;
          totalWeight += col.weight;
          hasAnyScore = true;
       }
    });

    let avg = '';
    if (hasAnyScore && totalWeight > 0) {
      avg = (totalWeightedScore / totalWeight).toFixed(1);
    }

    const finalScores = {
      ...studentForm.scores,
      avg: avg || studentForm.scores?.avg || ''
    };

    setClasses(prevClasses => prevClasses.map(cls => {
      if (cls.id !== currentClass.id) return cls;

      let updatedStudents;
      if (editingStudent) {
        // Edit
        updatedStudents = cls.students.map(s => s.id === editingStudent.id ? { ...studentForm, scores: finalScores } : s);
      } else {
        // Add
        const newStudent = {
          ...studentForm,
          scores: finalScores,
          id: studentForm.id.trim() || `HS-${Date.now().toString().slice(-4)}`,
          status: 'active'
        };
        updatedStudents = [...cls.students, newStudent];
      }

      return { ...cls, students: updatedStudents };
    }));

    setShowAddModal(false);
  };

  // Handler: Xóa 1 học sinh cụ thể
  const handleDeleteStudent = (student) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${student.name}" (Mã: ${student.id}) ra khỏi lớp ${currentClass.name}?`)) {
      setClasses(prevClasses => prevClasses.map(cls => {
        if (cls.id !== currentClass.id) return cls;
        return {
          ...cls,
          students: cls.students.filter(s => s.id !== student.id)
        };
      }));
      setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
    }
  };

  // Handler: Xóa hàng loạt học sinh đã chọn
  const handleBatchDelete = () => {
    if (selectedStudentIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedStudentIds.length} học sinh đã chọn ra khỏi lớp ${currentClass.name}?`)) {
      setClasses(prevClasses => prevClasses.map(cls => {
        if (cls.id !== currentClass.id) return cls;
        return {
          ...cls,
          students: cls.students.filter(s => !selectedStudentIds.includes(s.id))
        };
      }));
      setSelectedStudentIds([]);
    }
  };

  // Handler: Xóa toàn bộ học sinh trong lớp
  const handleClearAllStudents = () => {
    if (window.confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ học sinh trong lớp ${currentClass.name}?`)) {
      setClasses(prevClasses => prevClasses.map(cls => {
        if (cls.id !== currentClass.id) return cls;
        return {
          ...cls,
          students: []
        };
      }));
      setSelectedStudentIds([]);
    }
  };

  // Handler: Khôi phục danh sách học sinh mẫu ban đầu
  const handleResetToDefault = () => {
    if (window.confirm('Khôi phục danh sách lớp và học sinh về dữ liệu mặc định ban đầu?')) {
      setClasses(INITIAL_CLASSES_DATA);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CLASSES_DATA));
      saveAllClasses(INITIAL_CLASSES_DATA);
      setSelectedStudentIds([]);
    }
  };

  // Handler: Toggle chọn tất cả học sinh đang hiển thị
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredStudents.map(s => s.id);
      setSelectedStudentIds(allIds);
    } else {
      setSelectedStudentIds([]);
    }
  };

  // Handler: Toggle chọn 1 học sinh
  const handleToggleSelectStudent = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Xử lý đọc file từ input hoặc drag drop
  const processUploadedFile = async (file) => {
    if (!file) return;
    setImportFile(file);
    setImportError('');
    setImportSuccess('');

    try {
      const { parsedStudents, newScoreColumns } = await parseStudentExcelFile(file);
      if (parsedStudents.length === 0) {
        setImportError('File không có dữ liệu học sinh hoặc sai định dạng!');
      } else {
        setImportPreview(parsedStudents);
        setNewScoreColumnsFromExcel(newScoreColumns);
      }
    } catch (err) {
      console.error(err);
      setImportError('Có lỗi khi đọc file. Vui lòng kiểm tra lại định dạng file Excel (.xlsx, .xls, .csv)!');
    }
  };

  // Handler: Chọn file qua dialog
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Handler: Drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file);
      e.dataTransfer.clearData();
    }
  };

  // Handler: Xác nhận Import dữ liệu học sinh vào lớp
  const handleConfirmImport = () => {
    if (importPreview.length === 0) return;

    setClasses(prevClasses => prevClasses.map(cls => {
      if (cls.id !== currentClass.id) return cls;

      let existingCols = cls.scoreColumns || DEFAULT_SCORE_COLUMNS;
      let updatedScoreColumns = newScoreColumnsFromExcel.map(newCol => {
         const existing = existingCols.find(c => c.id === newCol.id);
         return {
            ...newCol,
            weight: newCol.weight !== null ? newCol.weight : (existing ? existing.weight : 1)
         };
      });

      // Add back any columns that were in the class but NOT in the excel file
      existingCols.forEach(oldCol => {
         if (!updatedScoreColumns.some(c => c.id === oldCol.id)) {
            updatedScoreColumns.push(oldCol);
         }
      });

      if (importMode === 'replace') {
        // Thay thế toàn bộ danh sách lớp bằng file mới
        return {
          ...cls,
          students: importPreview,
          scoreColumns: updatedScoreColumns
        };
      } else {
        // Gộp thêm vào danh sách lớp hiện tại (cập nhật nếu trùng mã HS)
        const existingMap = new Map(cls.students.map(s => [s.id, s]));
        importPreview.forEach(s => {
          existingMap.set(s.id, { 
            ...existingMap.get(s.id), 
            ...s, 
            scores: { ...(existingMap.get(s.id)?.scores || {}), ...s.scores }
          });
        });

        return {
          ...cls,
          students: Array.from(existingMap.values()),
          scoreColumns: updatedScoreColumns
        };
      }
    }));

    setImportSuccess(`Đã cập nhật ${importPreview.length} học sinh vào ${currentClass.name}!`);
    setTimeout(() => {
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      setImportSuccess('');
    }, 1200);
  };

  // Handler: Xuất Excel danh sách học sinh lớp hiện tại
  const handleExportExcel = () => {
    if (!currentClass || !(currentClass?.students?.length || 0)) {
      alert('Lớp học chưa có học sinh để xuất danh sách!');
      return;
    }
    exportStudentsToExcel(currentClass.students, currentClass.name, currentClass.scoreColumns);
  };

  const activeColumns = currentClass?.scoreColumns || DEFAULT_SCORE_COLUMNS;
  const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.includes(s.id));

  return (
    <div className="classes-page">
      {/* Top Header & School Tabs */}
      <div className="classes-header">
        <div className="classes-title-area">
          <h1>
            <Users className="text-primary" size={28} />
            Quản Lý Lớp Học & Học Sinh
          </h1>
          <p className="classes-subtitle">
            Hệ thống phân lớp theo đơn vị: <strong>Trung tâm NP (NP)</strong> và <strong>Trung học Thực hành (THTH)</strong>
          </p>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="school-tabs">
              <button 
                className={`school-tab-btn ${selectedSchool === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedSchool('ALL')}
              >
                Tất cả
              </button>
              <button 
                className={`school-tab-btn ${selectedSchool === 'NP' ? 'active' : ''}`}
                onClick={() => setSelectedSchool('NP')}
              >
                <School size={16} />
                Trung tâm NP (NP)
              </button>
              <button 
                className={`school-tab-btn ${selectedSchool === 'THTH' ? 'active' : ''}`}
                onClick={() => setSelectedSchool('THTH')}
              >
                <School size={16} />
                TH Thực hành (THTH)
              </button>
            </div>

            <button 
              className="btn btn-primary flex items-center gap-1.5"
              style={{ padding: '0.55rem 1.15rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
              onClick={handleOpenAddClass}
            >
              <Plus size={16} /> Thêm Lớp Học Mới
            </button>
          </div>
        )}
      </div>

      {/* Grid Danh Sách Lớp Học */}
      {filteredClasses.length === 0 ? (
        <div className="empty-classes-card" style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'var(--card-bg, #1e293b)',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px dashed var(--border-color, #334155)',
          margin: '1.5rem 0',
          color: '#94a3b8'
        }}>
          <School size={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: '#6366f1' }} />
          <h3 style={{ color: 'var(--text-color, #f8fafc)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            Chưa Có Lớp Học Nào
          </h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Hệ thống hiện tại chưa có lớp học nào. Hãy nhấn nút bên dưới để tạo lớp học đầu tiên của thầy!
          </p>
          {isTeacher && (
            <button 
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
              onClick={handleOpenAddClass}
            >
              <Plus size={16} /> Thêm Lớp Học Mới
            </button>
          )}
        </div>
      ) : (
        <div className="classes-grid">
          {filteredClasses.map((cls) => {
            const isSelected = cls.id === activeClassId;
            const globalIndex = classes.findIndex(c => c.id === cls.id);
            return (
              <div 
                key={cls.id} 
                className={`class-card ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveClassId(cls.id)}
              >
                <div className="class-card-top">
                  <span 
                    className="class-badge" 
                    style={{ 
                      backgroundColor: cls.school === 'NP' ? '#e0e7ff' : (cls.school === 'THTH' ? '#ecfdf5' : '#fef3c7'),
                      color: cls.school === 'NP' ? '#4338ca' : (cls.school === 'THTH' ? '#047857' : '#b45309')
                    }}
                  >
                    Trường {cls.school}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">Khối {cls.grade}</span>
                </div>
                
                <div className="class-name">{cls.name}</div>
                <div className="class-school-desc">{cls.schoolFullName}</div>

                <div className="class-card-stats">
                  <div className="stat-item">
                    <GraduationCap size={15} />
                    <span>Sĩ số: <strong>{cls.students?.length || 0}</strong></span>
                  </div>
                  <div className="stat-item">
                    <span>GV: <strong>{cls.teacher || 'Thầy Lê Công Chức'}</strong></span>
                  </div>
                </div>

                {/* Điều chỉnh thứ tự lớp, Sửa lớp & Xóa lớp (Dành cho Giáo viên) */}
                {isTeacher && (
                  <div className="class-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button" 
                      className="class-action-btn"
                      title="Di chuyển sang trái / lên trước"
                      onClick={(e) => handleMoveClass(cls.id, 'left', e)}
                      disabled={globalIndex === 0}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      type="button" 
                      className="class-action-btn"
                      title="Di chuyển sang phải / về sau"
                      onClick={(e) => handleMoveClass(cls.id, 'right', e)}
                      disabled={globalIndex === classes.length - 1}
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button 
                      type="button" 
                      className="class-action-btn"
                      style={{ marginLeft: 'auto', marginRight: '0.25rem', color: '#4f46e5' }}
                      title={`Chỉnh sửa thông tin lớp ${cls.name}`}
                      onClick={(e) => handleOpenEditClass(cls, e)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      type="button" 
                      className="class-action-btn btn-delete"
                      title={`Xóa lớp ${cls.name}`}
                      onClick={(e) => handleDeleteClass(cls.id, cls.name, e)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Banner Cá Nhân Dành Riêng Cho Học Sinh Đang Đăng Nhập */}
      {isStudent && myStudentProfile && currentClass && (
        <div className="student-banner">
          <div className="student-banner-left">
            <div className="student-banner-avatar">
              {myStudentProfile.name ? myStudentProfile.name.charAt(myStudentProfile.name.lastIndexOf(' ') + 1) || myStudentProfile.name.charAt(0) : 'H'}
            </div>
            <div className="student-banner-info">
              <h3>{myStudentProfile.name} <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>({myStudentProfile.id})</span></h3>
              <p>
                Lớp: <strong>{currentClass.name}</strong> • Trường: <strong>{currentClass.schoolFullName}</strong> • GV: <strong>{currentClass.teacher}</strong>
              </p>
            </div>
          </div>

          <div className="student-banner-right">
            {activeColumns.map(col => (
               <div key={col.id} className="student-score-stat">
                 <span className="label">{col.name}</span>
                 <span className="val">{myStudentProfile.scores?.[col.id] ?? '—'}</span>
               </div>
            ))}
            <div className="student-score-stat" style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '0.75rem' }}>
              <span className="label" style={{ color: '#fef08a' }}>ĐTB Môn</span>
              <span className="val" style={{ color: '#fef08a', fontWeight: 900 }}>
                {myStudentProfile.scores?.avg ?? '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chi Tiết Lớp Học & Bảng Quản Lý Danh Sách Học Sinh */}
      {currentClass && (
        <div className="class-detail-container">
          {/* Header Chi Tiết Lớp */}
          <div className="detail-header">
            <div className="detail-title-group">
              <h2>
                <GraduationCap size={24} color={currentClass.school === 'NP' ? '#4f46e5' : '#10b981'} />
                Danh Sách Lớp {currentClass.name}
              </h2>
              <div className="detail-meta-info">
                <span>Đơn vị: <strong>{currentClass.schoolFullName}</strong></span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>Niên khóa: 
                  {isEditingYear && isTeacher ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                      <input
                        type="text"
                        value={tempYear}
                        onChange={(e) => setTempYear(e.target.value)}
                        onBlur={() => {
                          setClasses(prev => prev.map(c => c.id === currentClass.id ? { ...c, academicYear: tempYear } : c));
                          setIsEditingYear(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setClasses(prev => prev.map(c => c.id === currentClass.id ? { ...c, academicYear: tempYear } : c));
                            setIsEditingYear(false);
                          }
                        }}
                        autoFocus
                        className="input"
                        style={{ padding: '2px 4px', width: '100px', fontSize: '0.85rem' }}
                      />
                    </span>
                  ) : (
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                      {currentClass.academicYear}
                      {isTeacher && (
                        <button 
                          onClick={() => {
                            setTempYear(currentClass.academicYear || '2025 - 2026');
                            setIsEditingYear(true);
                          }}
                          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '0', display: 'flex' }}
                          title="Sửa niên khóa"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </strong>
                  )}
                </span>
                <span>•</span>
                <span>Sĩ số: <strong>{(currentClass?.students?.length || 0)} học sinh</strong></span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="detail-actions">
              <button 
                className="btn btn-secondary" 
                onClick={handleExportExcel}
                title="Tải về danh sách học sinh định dạng Excel (.xlsx)"
              >
                <Download size={16} />
                <span>Xuất Excel</span>
              </button>

              {isTeacher && (
                <>
                  <button 
                    className="btn btn-secondary"
                    style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setAttendanceDate(today);
                      const existingRecord = currentClass?.attendance?.[today];
                      if (existingRecord) {
                        setAttendanceData(existingRecord);
                      } else {
                        const initialData = {};
                        currentClass?.students?.forEach(s => {
                          initialData[s.id] = 'present'; // Default to present
                        });
                        setAttendanceData(initialData);
                      }
                      setShowAttendanceModal(true);
                    }}
                    title="Điểm danh buổi học"
                  >
                    <CheckCircle2 size={16} />
                    <span>Điểm Danh</span>
                  </button>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setImportFile(null);
                      setImportPreview([]);
                      setNewScoreColumnsFromExcel([]);
                      setImportError('');
                      setImportSuccess('');
                      setImportMode('merge');
                      setShowImportModal(true);
                    }}
                    title="Nhập danh sách học sinh từ file Excel (.xlsx, .xls, .csv)"
                  >
                    <FileSpreadsheet size={16} className="text-emerald-600" />
                    <span>Nhập từ Excel</span>
                  </button>

                  <button 
                    className="btn btn-primary"
                    onClick={() => handleOpenStudentModal()}
                  >
                    <Plus size={16} />
                    <span>Thêm Học Sinh</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Thanh công cụ tìm kiếm, lọc và các nút xóa */}
          <div className="filter-toolbar">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                className="input" 
                placeholder="Tìm học sinh theo tên, mã số, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              {/* Batch Actions khi chọn nhiều học sinh */}
              {selectedStudentIds.length > 0 && isTeacher && (
                <button 
                  className="btn" 
                  style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.4rem 0.8rem', fontSize: '0.825rem' }}
                  onClick={handleBatchDelete}
                  title="Xóa các học sinh đã chọn"
                >
                  <UserMinus size={15} />
                  <span>Xóa {selectedStudentIds.length} học sinh đã chọn</span>
                </button>
              )}

              {isTeacher && (currentClass?.students?.length || 0) > 0 && (
                <button 
                  className="btn-icon delete" 
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', border: '1px solid #fee2e2', color: '#dc2626' }}
                  onClick={handleClearAllStudents}
                  title="Xóa toàn bộ danh sách lớp này"
                >
                  <UserX size={15} />
                  <span style={{ marginLeft: '4px' }}>Xóa hết</span>
                </button>
              )}

              {isTeacher && (
                <button 
                  className="btn-icon" 
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', color: '#64748b' }}
                  onClick={() => {
                    if (window.confirm('Đặt lại tất cả các lớp về trạng thái danh sách trống để giáo viên chủ động nhập từ đầu?')) {
                      setClasses(INITIAL_CLASSES_DATA);
                      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CLASSES_DATA));
                      saveAllClasses(INITIAL_CLASSES_DATA);
                      setSelectedStudentIds([]);
                    }
                  }}
                  title="Đặt lại danh sách học sinh rỗng để nhập mới"
                >
                  <RotateCcw size={14} />
                  <span style={{ marginLeft: '4px' }}>Làm trống để nhập mới</span>
                </button>
              )}

              <span className="text-xs text-gray-500" style={{ marginLeft: '0.5rem' }}>
                Hiển thị <strong>{filteredStudents.length}</strong> / {(currentClass?.students?.length || 0)} HS
              </span>
            </div>
          </div>

          {/* Bảng danh sách học sinh */}
          <div className="table-responsive">
            {filteredStudents.length > 0 ? (
              <table className="students-table">
                <thead>
                  <tr>
                    {isTeacher && (
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          title="Chọn tất cả"
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                    )}
                    <th style={{ width: '50px' }}>STT</th>
                    <th style={{ width: '90px' }}>Mã HS</th>
                    <th>Họ và Tên</th>
                    <th style={{ width: '80px' }}>Giới Tính</th>
                    {activeColumns.map(col => (
                      <th key={col.id} style={{ width: '75px', textAlign: 'center' }}>{col.name}</th>
                    ))}
                    <th style={{ width: '75px', textAlign: 'center' }}>ĐTB</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Chuyên Cần</th>
                    <th>Ghi Chú</th>
                    {isTeacher && <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const isChecked = selectedStudentIds.includes(student.id);
                    const isMe = isStudent && student.id === currentStudentId;
                    const canSeeScore = isTeacher || isMe;

                    return (
                      <tr 
                        key={student.id || idx} 
                        className={`${isMe ? 'my-row-highlight' : ''} ${isChecked ? 'row-selected' : ''}`}
                      >
                        {isTeacher && (
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => handleToggleSelectStudent(student.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                        )}
                        <td style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{idx + 1}</td>
                        <td>
                          {canSeeScore ? (
                            <span style={{ fontFamily: 'monospace', fontWeight: '600', color: isMe ? '#2563eb' : '#4f46e5' }}>
                              {student.id}
                            </span>
                          ) : (
                            <span className="score-hidden" style={{ fontSize: '0.775rem' }}>
                              🔒 Ẩn
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="student-avatar" style={isMe ? { background: '#2563eb', color: '#fff' } : {}}>
                              {student.name ? student.name.charAt(student.name.lastIndexOf(' ') + 1) || student.name.charAt(0) : 'H'}
                            </div>
                            <div>
                              <StudentName 
                                studentId={student.id} 
                                name={student.name} 
                                style={{ fontWeight: isMe ? '700' : '600', color: isMe ? '#1e40af' : 'inherit' }} 
                              />
                              {isMe && <span style={{ marginLeft: '6px', fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', verticalAlign: 'middle' }}>Chính bạn</span>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`gender-badge ${student.gender === 'Nữ' ? 'nu' : 'nam'}`}>
                            {student.gender || 'Nam'}
                          </span>
                        </td>

                        {activeColumns.map(col => (
                           <td key={col.id} style={{ textAlign: 'center' }}>
                             {canSeeScore ? (
                               <span className="score-badge">{student.scores?.[col.id] ?? '—'}</span>
                             ) : (
                               <span className="score-hidden">🔒 Ẩn</span>
                             )}
                           </td>
                        ))}

                        {/* Điểm Trung Bình Môn */}
                        <td style={{ textAlign: 'center' }}>
                          {canSeeScore ? (
                            <span className={`score-badge ${Number(student.scores?.avg) >= 8 ? 'high' : Number(student.scores?.avg) >= 6.5 ? 'medium' : 'low'}`}>
                              {student.scores?.avg ?? '—'}
                            </span>
                          ) : (
                            <span className="score-hidden">🔒 Ẩn</span>
                          )}
                        </td>

                        {/* Chuyên cần */}
                        <td style={{ textAlign: 'center' }}>
                          {(() => {
                            const attendanceRecords = currentClass?.attendance || {};
                            const totalSessions = Object.keys(attendanceRecords).length;
                            if (totalSessions === 0) return <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>;
                            
                            let presentCount = 0;
                            Object.values(attendanceRecords).forEach(session => {
                               if (session[student.id] === 'present' || session[student.id] === 'excused') presentCount++;
                            });
                            
                            const percent = Math.round((presentCount / totalSessions) * 100);
                            let color = '#22c55e'; // Green
                            if (percent < 80) color = '#ef4444'; // Red
                            else if (percent < 90) color = '#f59e0b'; // Orange
                            
                            return (
                              <span style={{ fontWeight: 'bold', color: color, fontSize: '0.85rem' }}>
                                {percent}%
                              </span>
                            );
                          })()}
                        </td>

                        <td>
                          {student.note ? (
                            <span style={{ 
                              background: '#fef3c7', 
                              color: '#92400e', 
                              padding: '0.15rem 0.5rem', 
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {student.note}
                            </span>
                          ) : '—'}
                        </td>
                        {isTeacher && (
                          <td>
                            <div className="action-btns" style={{ justifyContent: 'center' }}>
                              <button 
                                className="btn-icon edit" 
                                onClick={() => handleOpenStudentModal(student)}
                                title="Chỉnh sửa thông tin & điểm số"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button 
                                className="btn-icon delete" 
                                onClick={() => handleDeleteStudent(student)}
                                title={`Xóa ${student.name} khỏi lớp`}
                                style={{ color: '#ef4444' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Users size={36} />
                </div>
                <h3>Không có học sinh nào</h3>
                <p>
                  {searchTerm ? 'Không tìm thấy học sinh khớp với từ khóa tìm kiếm.' : 'Lớp học hiện tại đang trống.'}
                </p>
                {isTeacher && !searchTerm && (
                  <div className="flex gap-2">
                    <button className="btn btn-primary" onClick={() => handleOpenStudentModal()}>
                      <Plus size={16} />
                      <span>Thêm học sinh</span>
                    </button>
                    <button className="btn btn-secondary" onClick={handleResetToDefault}>
                      <RotateCcw size={16} />
                      <span>Nạp danh sách mẫu</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Thêm / Sửa Học Sinh */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingStudent ? 'Chỉnh Sửa Thông Tin Học Sinh' : `Thêm Học Sinh Vào ${currentClass?.name}`}</h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveStudent}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Mã Học Sinh (Dùng đăng nhập) *</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={studentForm.id}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStudentForm({ ...studentForm, id: val, phone: studentForm.phone || val });
                      }}
                      placeholder="Trùng với Số điện thoại (VD: 0984746761)"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giới Tính</label>
                    <select 
                      className="input"
                      value={studentForm.gender}
                      onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Họ và Tên Học Sinh *</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    placeholder="VD: Nguyễn Văn An"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày Sinh</label>
                    <input 
                      type="date" 
                      className="input" 
                      value={studentForm.dob}
                      onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Số Điện Thoại (Mã đăng nhập) *</label>
                    <input 
                      type="tel" 
                      className="input" 
                      value={studentForm.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStudentForm({ 
                          ...studentForm, 
                          phone: val, 
                          // Tự động đồng bộ Mã HS nếu chưa nhập hoặc đang trùng
                          id: (!studentForm.id || studentForm.id === studentForm.phone) ? val : studentForm.id 
                        });
                      }}
                      placeholder="VD: 0984746761"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Liên Hệ</label>
                  <input 
                    type="email" 
                    className="input" 
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="VD: hocsinh@gmail.com"
                  />
                </div>

                <div className="form-group">
                  <label>Ghi Chú / Chức Vụ</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={studentForm.note}
                    onChange={(e) => setStudentForm({ ...studentForm, note: e.target.value })}
                    placeholder="VD: Lớp trưởng, Tổ trưởng..."
                  />
                </div>

                {/* Phần Nhập Điểm Số Môn Học */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4f46e5', margin: 0 }}>
                      📊 Bảng Điểm Môn Toán
                    </label>
                    <button 
                      type="button"
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        setTempScoreColumns([...(currentClass?.scoreColumns || DEFAULT_SCORE_COLUMNS)]);
                        setShowScoreConfigModal(true);
                      }}
                    >
                      <Edit2 size={12} style={{ marginRight: '4px' }}/> Cấu hình cột điểm
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                    {activeColumns.map(col => (
                       <div key={col.id} className="form-group" style={{ margin: 0 }}>
                         <label style={{ fontSize: '0.75rem' }}>{col.name} (x{col.weight})</label>
                         <input 
                           type="number" 
                           step="0.1" min="0" max="10"
                           className="input" 
                           value={studentForm.scores?.[col.id] ?? ''}
                           onChange={(e) => setStudentForm({ 
                             ...studentForm, 
                             scores: { ...studentForm.scores, [col.id]: e.target.value } 
                           })}
                           placeholder="0.0"
                         />
                       </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStudent ? 'Cập Nhật' : 'Thêm Vào Lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nhập từ Excel / CSV */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nhập Danh Sách Học Sinh Từ Excel</h3>
              <button className="btn-icon" onClick={() => setShowImportModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Đang nhập cho lớp: <strong style={{ color: 'var(--text-primary)' }}>{currentClass?.name} ({currentClass?.school})</strong>
              </p>

              {/* Tải file mẫu */}
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Tải file mẫu Excel chuẩn:</strong>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.75rem' }}>File Excel định dạng .xlsx có sẵn các cột tiêu chuẩn</p>
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => downloadTemplateExcel(currentClass?.name, currentClass?.scoreColumns)}
                >
                  <FileDown size={14} />
                  <span>Tải Excel Mẫu</span>
                </button>
              </div>

              {/* Tùy chọn chế độ nhập */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Chế độ nhập:
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="importMode" 
                      value="merge" 
                      checked={importMode === 'merge'} 
                      onChange={() => setImportMode('merge')} 
                    />
                    <span>Thêm mới / Cập nhật (giữ HS cũ)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="importMode" 
                      value="replace" 
                      checked={importMode === 'replace'} 
                      onChange={() => setImportMode('replace')} 
                    />
                    <span>Thay thế toàn bộ danh sách lớp</span>
                  </label>
                </div>
              </div>

              {/* Vùng thả file */}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".xlsx, .xls, .csv" 
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              
              <div 
                className={`upload-dropzone ${isDragging ? 'dragover' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload size={40} color={isDragging ? '#4338ca' : '#4f46e5'} style={{ transform: isDragging ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s' }} />
                <div>
                  <strong>{isDragging ? 'Thả file Excel vào đây ngay!' : 'Kéo thả file Excel vào đây hoặc bấm để chọn file'}</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Hỗ trợ định dạng <strong>.xlsx, .xls, .csv</strong> (tất cả phiên bản Excel)
                  </p>
                </div>
              </div>

              {importFile && (
                <div className="file-info-preview">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet size={20} color="#10b981" />
                    <div>
                      <strong style={{ fontSize: '0.85rem' }}>{importFile.name}</strong>
                      <p style={{ fontSize: '0.75rem', color: '#15803d', margin: 0 }}>
                        Đã đọc thành công {importPreview.length} học sinh
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 size={20} color="#10b981" />
                </div>
              )}

              {importError && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  padding: '0.75rem', 
                  background: '#fef2f2', 
                  border: '1px solid #fecaca', 
                  borderRadius: 'var(--radius-md)', 
                  color: '#b91c1c', 
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  padding: '0.75rem', 
                  background: '#f0fdf4', 
                  border: '1px solid #bbf7d0', 
                  borderRadius: 'var(--radius-md)', 
                  color: '#15803d', 
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowImportModal(false)}
              >
                Đóng
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                disabled={!importPreview.length}
                onClick={handleConfirmImport}
              >
                <Upload size={16} />
                <span>Xác nhận nhập ({importPreview.length} HS)</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Cấu Hình Cột Điểm */}
      {showScoreConfigModal && (
        <div className="modal-overlay" onClick={() => setShowScoreConfigModal(false)} style={{ zIndex: 1100 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Cấu Hình Cột Điểm</h3>
              <button className="btn-icon" onClick={() => setShowScoreConfigModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Thay đổi này sẽ áp dụng cho lớp <strong>{currentClass?.name}</strong>. Các cột điểm sẽ đồng bộ khi xuất/nhập Excel.
              </p>
              
              {tempScoreColumns.map((col, index) => (
                <div key={col.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Tên Cột</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={col.name} 
                      onChange={(e) => {
                         const newCols = [...tempScoreColumns];
                         newCols[index].name = e.target.value;
                         setTempScoreColumns(newCols);
                      }}
                    />
                  </div>
                  <div style={{ width: '80px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Hệ Số</label>
                    <input 
                      type="number" 
                      className="input" 
                      min="1" step="0.5"
                      value={col.weight} 
                      onChange={(e) => {
                         const newCols = [...tempScoreColumns];
                         newCols[index].weight = parseFloat(e.target.value) || 1;
                         setTempScoreColumns(newCols);
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '1.25rem' }}>
                    <button 
                      className="btn-icon delete"
                      onClick={() => {
                        const newCols = tempScoreColumns.filter((_, i) => i !== index);
                        setTempScoreColumns(newCols);
                      }}
                      style={{ color: '#ef4444' }}
                      title="Xóa cột này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              <button 
                type="button"
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: '0.5rem', borderStyle: 'dashed' }}
                onClick={() => {
                  setTempScoreColumns([
                    ...tempScoreColumns, 
                    { id: `col_${Date.now()}`, name: 'Cột mới', weight: 1 }
                  ]);
                }}
              >
                <Plus size={16} /> Thêm Cột Điểm
              </button>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowScoreConfigModal(false)}>
                Hủy Bỏ
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  setClasses(prev => prev.map(c => c.id === currentClass.id ? { ...c, scoreColumns: tempScoreColumns } : c));
                  setShowScoreConfigModal(false);
                }}
              >
                Lưu Cấu Hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Điểm Danh */}
      {showAttendanceModal && isTeacher && (
        <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)} style={{ zIndex: 1100 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <h3>Điểm Danh Lớp {currentClass?.name}</h3>
              <button className="btn-icon" onClick={() => setShowAttendanceModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1rem' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ngày điểm danh:</label>
                <input 
                  type="date" 
                  className="input" 
                  value={attendanceDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setAttendanceDate(newDate);
                    const existingRecord = currentClass?.attendance?.[newDate];
                    if (existingRecord) {
                      setAttendanceData(existingRecord);
                    } else {
                      const initialData = {};
                      currentClass?.students?.forEach(s => {
                        initialData[s.id] = 'present';
                      });
                      setAttendanceData(initialData);
                    }
                  }}
                  style={{ width: '150px' }}
                />
              </div>

              <div className="table-responsive" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <table className="students-table" style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
                      <th>Họ và Tên</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Có Mặt</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Có Phép</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Không Phép</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClass?.students?.map((s, i) => (
                      <tr key={s.id}>
                        <td style={{ textAlign: 'center' }}>{i + 1}</td>
                        <td>
                          <strong style={{ fontSize: '0.9rem' }}>{s.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.id}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="radio" 
                            name={`att_${s.id}`} 
                            checked={attendanceData[s.id] === 'present'}
                            onChange={() => setAttendanceData(prev => ({ ...prev, [s.id]: 'present' }))}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#22c55e' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="radio" 
                            name={`att_${s.id}`} 
                            checked={attendanceData[s.id] === 'excused'}
                            onChange={() => setAttendanceData(prev => ({ ...prev, [s.id]: 'excused' }))}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#f59e0b' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="radio" 
                            name={`att_${s.id}`} 
                            checked={attendanceData[s.id] === 'absent'}
                            onChange={() => setAttendanceData(prev => ({ ...prev, [s.id]: 'absent' }))}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ef4444' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAttendanceModal(false)}>
                Hủy Bỏ
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                style={{ backgroundColor: '#22c55e', borderColor: '#16a34a' }}
                onClick={() => {
                  setClasses(prev => prev.map(c => {
                    if (c.id !== currentClass.id) return c;
                    const newAttendance = { ...(c.attendance || {}) };
                    newAttendance[attendanceDate] = attendanceData;
                    return { ...c, attendance: newAttendance };
                  }));
                  setShowAttendanceModal(false);
                }}
              >
                Lưu Điểm Danh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm / Chỉnh Sửa Lớp Học */}
      {showAddClassModal && (
        <div className="modal-overlay" onClick={() => setShowAddClassModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <School size={22} color="var(--primary-color)" />
                <h3>{editingClassId ? 'Chỉnh Sửa Thông Tin Lớp Học' : 'Thêm Lớp Học Mới'}</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowAddClassModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewClass}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>1. Tên Lớp Học * (VD: Lớp 10A1, Lớp 12T6, Lớp Luyện Đề...)</label>
                  <input
                    type="text"
                    className="input"
                    value={newClassForm.name}
                    onChange={(e) => setNewClassForm({ ...newClassForm, name: e.target.value })}
                    placeholder="Nhập tên lớp học..."
                    required
                    autoFocus
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>2. Đơn Vị / Trường Học *</label>
                    <select
                      className="input"
                      value={newClassForm.school}
                      onChange={(e) => setNewClassForm({ ...newClassForm, school: e.target.value })}
                    >
                      <option value="NP">Trung tâm NP (NP)</option>
                      <option value="THTH">TH Thực hành (THTH)</option>
                      <option value="OTHER">Trường / Đơn vị khác...</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>3. Khối Lớp *</label>
                    <select
                      className="input"
                      value={newClassForm.grade}
                      onChange={(e) => setNewClassForm({ ...newClassForm, grade: e.target.value })}
                    >
                      <option value="10">Khối 10</option>
                      <option value="11">Khối 11</option>
                      <option value="12">Khối 12</option>
                    </select>
                  </div>
                </div>

                {newClassForm.school === 'OTHER' && (
                  <div className="form-group">
                    <label>Nhập Tên Trường / Đơn Vị Mới *</label>
                    <input
                      type="text"
                      className="input"
                      value={newClassForm.customSchool}
                      onChange={(e) => setNewClassForm({ ...newClassForm, customSchool: e.target.value })}
                      placeholder="VD: Trường THPT Lê Hồng Phong..."
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>4. Niên Khóa</label>
                  <input
                    type="text"
                    className="input"
                    value={newClassForm.academicYear}
                    onChange={(e) => setNewClassForm({ ...newClassForm, academicYear: e.target.value })}
                    placeholder="VD: 2025 - 2026"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddClassModal(false)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-primary flex items-center gap-1.5">
                  {editingClassId ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                  <span>{editingClassId ? 'Lưu Thay Đổi' : 'Tạo Lớp Học'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
