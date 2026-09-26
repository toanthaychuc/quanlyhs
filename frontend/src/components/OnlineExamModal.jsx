import React, { useState, useEffect } from 'react';
import { 
  X, QrCode, Link2, Copy, Check, 
  Settings, Users, Clock, ShieldAlert, Sparkles, Trash2, 
  ExternalLink, CheckCircle, RefreshCw, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import './OnlineExamModal.css';
import { generateQRCodeSVG } from '../utils/qrCodeUtils';
import { 
  createExamRoom, getActiveRoomsByExamId, closeExamRoom, 
  getExamRoomSubmissions 
} from '../services/examService';
import { 
  extractExamTikzBlocks, buildExamCachedSvgs, checkBackendHealth 
} from '../utils/tikzCacheUtils';

export default function OnlineExamModal({ isOpen, onClose, exam, initialRoom = null, onRoomUpdated }) {
  if (!isOpen || !exam) return null;

  const [activeRoom, setActiveRoom] = useState(initialRoom || null);
  const [isLoadingActive, setIsLoadingActive] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [roomTitle, setRoomTitle] = useState(`${exam.title || 'Đề kiểm tra'} - Thi trực tuyến`);
  const [duration, setDuration] = useState(exam.duration || 45);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [maxViolations, setMaxViolations] = useState(1); // 1 lần cảnh báo, lần 2 nộp
  const [forceFullscreen, setForceFullscreen] = useState(true);

  // TikZ Pre-rendering State
  const [isCompilingTikz, setIsCompilingTikz] = useState(false);
  const [compileProgress, setCompileProgress] = useState({ done: 0, total: 0 });
  const [tikzBlocksCount, setTikzBlocksCount] = useState(0);

  // Submissions list for active room
  const [submissions, setSubmissions] = useState([]);

  // Đồng bộ tức thời phòng thi đang mở nếu có initialRoom
  useEffect(() => {
    if (initialRoom && initialRoom.status === 'active') {
      setActiveRoom(initialRoom);
    }
  }, [initialRoom, isOpen]);

  // Kiểm tra phòng thi đang hoạt động của đề này
  useEffect(() => {
    let isMounted = true;
    async function loadRoom() {
      if (initialRoom && initialRoom.status === 'active') {
        setActiveRoom(initialRoom);
        try {
          const subs = await getExamRoomSubmissions(initialRoom.id);
          if (isMounted) setSubmissions(Array.isArray(subs) ? subs : []);
        } catch (_) {}
      }

      setIsLoadingActive(true);
      try {
        const rooms = await getActiveRoomsByExamId(exam.id);
        if (isMounted) {
          if (rooms && rooms.length > 0) {
            setActiveRoom(rooms[0]);
            const subs = await getExamRoomSubmissions(rooms[0].id);
            if (isMounted) setSubmissions(Array.isArray(subs) ? subs : []);
          } else if (!initialRoom) {
            setActiveRoom(null);
            setSubmissions([]);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải phòng thi:', err);
      } finally {
        if (isMounted) setIsLoadingActive(false);
      }
    }

    if (isOpen && exam) {
      const blocks = extractExamTikzBlocks(exam);
      setTikzBlocksCount(blocks.length);
      loadRoom();
    }
    return () => { isMounted = false; };
  }, [isOpen, exam, initialRoom]);

  // Tự động làm mới danh sách bài nộp định kỳ khi phòng thi đang mở
  useEffect(() => {
    if (!isOpen || !activeRoom) return;

    const interval = setInterval(async () => {
      try {
        const subs = await getExamRoomSubmissions(activeRoom.id);
        if (Array.isArray(subs)) {
          setSubmissions(subs);
        }
      } catch (_) {}
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, activeRoom]);

  // Sinh đường link thi
  const getExamLink = (roomId) => {
    const origin = window.location.origin;
    const pathname = window.location.pathname.replace(/\/$/, '');
    return `${origin}${pathname}/#/exams?room=${roomId}`;
  };

  const handleCopyLink = () => {
    if (!activeRoom) return;
    const link = getExamLink(activeRoom.id);
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Tạo link thi & Pre-render TikZ
  const handleCreateRoom = async () => {
    let cached_svgs = {};

    // 1. Kiểm tra hình vẽ TikZ
    if (tikzBlocksCount > 0) {
      const isBackendLive = await checkBackendHealth();
      if (isBackendLive) {
        setIsCompilingTikz(true);
        setCompileProgress({ done: 0, total: tikzBlocksCount });
        try {
          cached_svgs = await buildExamCachedSvgs(exam, {}, null, (done, total) => {
            setCompileProgress({ done, total });
          });
        } catch (err) {
          console.warn('Lỗi tiền biên dịch TikZ:', err);
        } finally {
          setIsCompilingTikz(false);
        }
      } else {
        const proceedWithoutTikz = window.confirm(
          `Phát hiện đề có ${tikzBlocksCount} hình vẽ TikZ, nhưng máy chủ biên dịch LaTeX (backend) chưa được bật.\n\n` +
          `Thầy có muốn tiếp tục tạo link thi không? (Hình vẽ sẽ được hiển thị theo bộ vẽ đồ thị thông thường của hệ thống).`
        );
        if (!proceedWithoutTikz) return;
      }
    }

    // 2. Tạo phòng thi
    try {
      const newRoom = await createExamRoom({
        exam_id: exam.id,
        exam_title: roomTitle,
        duration: Number(duration),
        shuffle_questions: shuffleQuestions,
        shuffle_answers: shuffleAnswers,
        max_violations: Number(maxViolations),
        force_fullscreen: forceFullscreen,
        cached_svgs: cached_svgs,
        exam_data: {
          id: exam.id,
          title: exam.title,
          duration: Number(duration),
          questions: exam.questions || [],
          pointsConfig: exam.pointsConfig || null,
          latexBulkCode: exam.latexBulkCode || ''
        }
      });

      setActiveRoom(newRoom);
      if (onRoomUpdated) onRoomUpdated(exam.id, newRoom);
    } catch (err) {
      alert('Không thể tạo link thi: ' + err.message);
    }
  };

  // Hủy link thi & Giải phóng bộ nhớ TikZ
  const handleCloseRoom = async () => {
    if (!activeRoom) return;
    const confirmClose = window.confirm(
      'Thầy có chắc chắn muốn hủy link thi này?\n\n' +
      '• Học sinh sẽ không thể nộp bài vào link này nữa.\n' +
      '• Toàn bộ hình ảnh TikZ lưu tạm trong bộ nhớ đệm sẽ được xóa bỏ để tiết kiệm dung lượng bộ nhớ.'
    );
    if (!confirmClose) return;

    try {
      await closeExamRoom(activeRoom.id);
      setActiveRoom(null);
      setSubmissions([]);
      if (onRoomUpdated) onRoomUpdated(exam.id, null);
    } catch (err) {
      alert('Lỗi khi hủy phòng thi: ' + err.message);
    }
  };

  // Xuất bảng điểm danh sách học sinh ra file Excel (.xlsx)
  const handleExportExcel = () => {
    if (!submissions || submissions.length === 0) {
      alert('Chưa có học sinh nào nộp bài trong phòng thi này để xuất bảng Excel!');
      return;
    }

    const data = submissions.map((sub, index) => ({
      'STT': index + 1,
      'Họ và tên': sub.studentName || '',
      'Lớp': sub.studentClass || '',
      'Mã HS': sub.studentId || sub.studentPhone || '',
      'Điểm': sub.score !== undefined ? Number(sub.score) : 0,
      'Số câu đúng': `${sub.correctCount || 0}/${sub.totalQuestions || 0}`,
      'Thời gian làm (phút)': sub.timeSpent ? Math.ceil(sub.timeSpent / 60) : '',
      'Ghi chú': sub.isViolationSubmit ? `Bị thu bài do rời tab (${sub.violationsCount || 1} lần)` : 'Hoàn thành',
      'Thời gian nộp': sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('vi-VN') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BangDiem');

    // Căn chỉnh độ rộng các cột
    worksheet['!cols'] = [
      { wch: 6 },  // STT
      { wch: 25 }, // Họ và tên
      { wch: 12 }, // Lớp
      { wch: 18 }, // Mã HS
      { wch: 10 }, // Điểm
      { wch: 14 }, // Số câu đúng
      { wch: 20 }, // Thời gian làm
      { wch: 24 }, // Ghi chú
      { wch: 22 }  // Thời gian nộp
    ];

    const cleanTitle = (activeRoom?.exam_title || exam?.title || 'Thi_Truc_Tuyen')
      .replace(/[\/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `BangDiem_${cleanTitle}_${dateStr}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="oem-overlay" onClick={onClose}>
      <div className="oem-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="oem-header">
          <div className="oem-header-left">
            <div className="oem-icon-badge">
              <QrCode size={22} />
            </div>
            <div className="oem-title-wrap">
              <h3>Tạo link thi trực tuyến</h3>
            </div>
          </div>
          <button className="oem-close-btn" onClick={onClose} title="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="oem-body">
          {/* Exam Summary Banner */}
          <div className="oem-exam-banner">
            <div className="oem-exam-banner-info">
              <h4>{exam.title}</h4>
              <div className="oem-exam-banner-meta">
                <span><Clock size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} /> {exam.duration} phút</span>
                <span><CheckCircle size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} /> {exam.questions?.length || 0} câu hỏi</span>
              </div>
            </div>
            <div>
              {tikzBlocksCount > 0 ? (
                <span className="oem-tikz-status-badge has-tikz">
                  <Sparkles size={13} /> {tikzBlocksCount} hình TikZ (Tự động nạp tốc độ cao)
                </span>
              ) : (
                <span className="oem-tikz-status-badge">
                  <Check size={13} /> Đề lý thuyết / công thức chuẩn
                </span>
              )}
            </div>
          </div>

          {/* Đang nạp TikZ */}
          {isCompilingTikz && (
            <div className="oem-progress-box">
              <div style={{ fontWeight: 600, color: 'var(--primary-color, #4f46e5)', fontSize: '0.9rem' }}>
                <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
                Đang tiền biên dịch hình vẽ TikZ: {compileProgress.done} / {compileProgress.total} hình...
              </div>
              <div className="oem-progress-bar-bg">
                <div 
                  className="oem-progress-bar-fill" 
                  style={{ width: `${Math.round((compileProgress.done / (compileProgress.total || 1)) * 100)}%` }} 
                />
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary, #6b7280)' }}>
                Các hình vẽ sau khi biên dịch xong sẽ hiển thị ngay lập tức khi học sinh mở đề thi.
              </p>
            </div>
          )}

          {/* NẾU ĐÃ CÓ PHÒNG THI ĐANG MỞ */}
          {activeRoom ? (
            <div className="oem-result-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.95rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Phòng thi trực tuyến đang mở & sẵn sàng nhận bài
              </div>

              {/* QR Code SVG */}
              <div 
                className="oem-qr-wrapper"
                dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(getExamLink(activeRoom.id), 220) }}
              />

              {/* Link thi & Nút Copy */}
              <div className="oem-link-box">
                <input 
                  type="text" 
                  className="oem-link-input" 
                  readOnly 
                  value={getExamLink(activeRoom.id)} 
                  onClick={e => e.target.select()}
                />
                <button 
                  className={`oem-copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopyLink}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Đã sao chép!' : 'Sao chép link'}
                </button>
              </div>

              {/* Thông số phòng thi */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-secondary, #6b7280)' }}>
                <span style={{ background: 'var(--bg-color-alt)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                  ⏳ Thời gian: <b>{activeRoom.duration} phút</b>
                </span>
                <span style={{ background: 'var(--bg-color-alt)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                  🔀 Trộn câu: <b>{activeRoom.shuffle_questions ? 'Bật' : 'Tắt'}</b>
                </span>
                <span style={{ background: 'var(--bg-color-alt)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                  🔀 Trộn đáp án: <b>{activeRoom.shuffle_answers ? 'Bật' : 'Tắt'}</b>
                </span>
                <span style={{ background: 'var(--bg-color-alt)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                  🛡️ Cảnh báo chuyển tab: <b>Tối đa {activeRoom.max_violations} lần</b>
                </span>
                {activeRoom.cached_svgs && Object.keys(activeRoom.cached_svgs).length > 0 && (
                  <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                    ⚡ {Object.keys(activeRoom.cached_svgs).length} hình TikZ đã lưu đệm
                  </span>
                )}
              </div>

              {/* Danh sách bài nộp vào phòng này */}
              <div className="oem-sub-stats">
                <div className="oem-sub-stats-header">
                  <div className="oem-sub-stats-title">
                    <Users size={16} /> Danh sách học sinh đã nộp ({submissions.length})
                  </div>
                  <button 
                    className="oem-btn oem-btn-secondary" 
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                    onClick={async () => {
                      if (activeRoom) {
                        const subs = await getExamRoomSubmissions(activeRoom.id);
                        setSubmissions(Array.isArray(subs) ? subs : []);
                      }
                    }}
                  >
                    <RefreshCw size={12} /> Làm mới
                  </button>
                </div>

                {submissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.25rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary, #6b7280)' }}>
                    Chưa có học sinh nào nộp bài. Hãy chia sẻ link hoặc cho học sinh quét mã QR phía trên!
                  </div>
                ) : (
                  <div className="oem-submissions-table-wrap">
                    <table className="oem-submissions-table">
                      <thead>
                        <tr>
                          <th style={{ width: 45, textAlign: 'center' }}>STT</th>
                          <th>Họ và tên</th>
                          <th style={{ width: 75, textAlign: 'center' }}>Lớp</th>
                          <th style={{ width: 120 }}>Mã HS</th>
                          <th style={{ width: 95, textAlign: 'center' }}>Điểm</th>
                          <th style={{ width: 85, textAlign: 'right' }}>Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((sub, sIdx) => (
                          <tr key={sub.id || sIdx}>
                            <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{sIdx + 1}</td>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {sub.studentName}
                              </div>
                              {sub.isViolationSubmit && (
                                <span className="oem-submission-violation" style={{ display: 'inline-block', marginTop: 2 }}>
                                  ⚠️ Rời tab ({sub.violationsCount || 1} lần)
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="oem-class-badge">{sub.studentClass || '-'}</span>
                            </td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>
                              {sub.studentId || sub.studentPhone || '-'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="oem-submission-score">{sub.score}đ</span>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                ({sub.correctCount}/{sub.totalQuestions})
                              </div>
                            </td>
                            <td style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
                              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* NẾU CHƯA CÓ PHÒNG THI -> FORM TÙY CHỌN TẠO LINK */
            <>
              {/* Tên phòng thi */}
              <div className="oem-form-group">
                <label className="oem-label">Tên phòng thi / Đợt thi</label>
                <input 
                  type="text" 
                  className="oem-input" 
                  value={roomTitle} 
                  onChange={e => setRoomTitle(e.target.value)}
                  placeholder="Nhập tên đợt thi..."
                />
              </div>

              {/* Thời gian làm bài */}
              <div className="oem-form-group">
                <label className="oem-label">
                  <Clock size={15} /> Thời gian làm bài (phút)
                </label>
                <input 
                  type="number" 
                  min="5" 
                  max="180" 
                  className="oem-input" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)}
                />
              </div>

              {/* Tùy chọn trộn đề & Chống gian lận */}
              <div className="oem-form-group">
                <label className="oem-label">
                  <Settings size={15} /> Tùy chọn đề & Bảo mật phòng thi
                </label>
                <div className="oem-toggles-grid">
                  {/* Trộn câu hỏi */}
                  <label className={`oem-toggle-card ${shuffleQuestions ? 'active' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={shuffleQuestions} 
                      onChange={e => setShuffleQuestions(e.target.checked)}
                    />
                    <span className="oem-toggle-title">Trộn thứ tự câu hỏi</span>
                  </label>

                  {/* Trộn đáp án */}
                  <label className={`oem-toggle-card ${shuffleAnswers ? 'active' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={shuffleAnswers} 
                      onChange={e => setShuffleAnswers(e.target.checked)}
                    />
                    <span className="oem-toggle-title">Trộn đáp án</span>
                  </label>

                  {/* Ép Toàn màn hình */}
                  <label className={`oem-toggle-card ${forceFullscreen ? 'active' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={forceFullscreen} 
                      onChange={e => setForceFullscreen(e.target.checked)}
                    />
                    <span className="oem-toggle-title">Toàn màn hình</span>
                  </label>
                </div>
              </div>

              {/* Thiết lập chống gian lận */}
              <div className="oem-form-group">
                <label className="oem-label">
                  <ShieldAlert size={15} /> Xử lý chuyển tab / Rời màn hình làm bài
                </label>
                <select 
                  className="oem-select" 
                  value={maxViolations} 
                  onChange={e => setMaxViolations(Number(e.target.value))}
                >
                  <option value={1}>Cảnh báo 1 lần duy nhất — Tái phạm lần 2 sẽ TỰ ĐỘNG NỘP BÀI (Khuyến nghị)</option>
                  <option value={2}>Cảnh báo 2 lần — Tái phạm lần 3 sẽ TỰ ĐỘNG NỘP BÀI</option>
                  <option value={0}>Cực kỳ nghiêm ngặt — Rời tab lần đầu tiên là TỰ ĐỘNG NỘP BÀI ngay</option>
                </select>
              </div>

            </>
          )}
        </div>

        {/* Footer */}
        <div className="oem-footer">
          {activeRoom ? (
            <>
              <button 
                className="oem-btn oem-btn-danger" 
                onClick={handleCloseRoom}
              >
                <Trash2 size={16} /> Hủy link thi
              </button>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="oem-btn oem-btn-excel"
                  onClick={handleExportExcel}
                  title="Xuất bảng điểm danh sách học sinh ra file Excel (.xlsx)"
                >
                  <FileSpreadsheet size={16} /> Xuất excel
                </button>
                <a 
                  href={getExamLink(activeRoom.id)} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="oem-btn oem-btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  <ExternalLink size={16} /> Mở link
                </a>
                <button className="oem-btn oem-btn-primary" onClick={onClose}>
                  Đóng cửa sổ
                </button>
              </div>
            </>
          ) : (
            <>
              <button className="oem-btn oem-btn-secondary" onClick={onClose} disabled={isCompilingTikz}>
                Hủy bỏ
              </button>
              <button 
                className="oem-btn oem-btn-primary" 
                onClick={handleCreateRoom}
                disabled={isCompilingTikz}
              >
                {isCompilingTikz ? (
                  <>Đang tiền xử lý TikZ ({compileProgress.done}/{compileProgress.total})...</>
                ) : (
                  <><Link2 size={16} /> Tạo Link & Mã QR phòng thi</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
