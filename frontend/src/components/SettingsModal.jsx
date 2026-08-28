import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Cpu, 
  FileCode, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  Sliders, 
  Sparkles, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRole } from '../context/RoleContext';

export const DEFAULT_LATEX_PREAMBLE = `\\usepackage{amsmath,amssymb}
\\usepackage{tikz}
\\usepackage{tkz-tab}
\\usetikzlibrary{calc,intersections,angles,quotes,patterns,positioning,arrows,arrows.meta,decorations.pathreplacing,decorations.markings,shapes.geometric,math}`;

const SettingsModal = ({ isOpen, onClose }) => {
  const { isTeacher } = useRole();

  const [activeTab, setActiveTab] = useState('latex'); // 'latex' | 'ai'
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiModel, setAiModel] = useState('gemini-1.5-flash');
  const [latexPreamble, setLatexPreamble] = useState(DEFAULT_LATEX_PREAMBLE);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [customModel, setCustomModel] = useState('');

  // Nạp cấu hình từ localStorage khi mở modal
  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('app_teacher_ai_apikey') || '';
      const savedModel = localStorage.getItem('app_teacher_ai_model') || 'gemini-1.5-flash';
      const savedPreamble = localStorage.getItem('app_teacher_latex_preamble');

      setApiKey(savedKey);
      setAiModel(savedModel);
      setLatexPreamble(savedPreamble !== null ? savedPreamble : DEFAULT_LATEX_PREAMBLE);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !isTeacher) return null;

  const handleSave = () => {
    localStorage.setItem('app_teacher_ai_apikey', apiKey.trim());
    localStorage.setItem('app_teacher_ai_model', aiModel === 'custom' ? customModel.trim() : aiModel);
    localStorage.setItem('app_teacher_latex_preamble', latexPreamble);

    // Kích hoạt sự kiện để các component khác (MathView, TikZ) nhận biết thay đổi
    window.dispatchEvent(new Event('app-settings-updated'));

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleResetPreamble = () => {
    if (window.confirm('Khôi phục phần Preamble về mặc định tiêu chuẩn (hỗ trợ tikz, tkz-tab, amsmath)?')) {
      setLatexPreamble(DEFAULT_LATEX_PREAMBLE);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div className="flex items-center gap-2.5">
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Sliders size={19} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Cấu Hình Hệ Thống (Giáo Viên)</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Thiết lập AI Key, Mô hình ngôn ngữ & Preamble biên dịch LaTeX</span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} title="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.85rem 1.5rem 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <button
            type="button"
            onClick={() => setActiveTab('latex')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'latex' ? '2.5px solid #4f46e5' : '2.5px solid transparent',
              color: activeTab === 'latex' ? '#4f46e5' : '#64748b',
              fontWeight: activeTab === 'latex' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <FileCode size={16} />
            <span>Preamble PDFLaTeX</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'ai' ? '2.5px solid #4f46e5' : '2.5px solid transparent',
              color: activeTab === 'ai' ? '#4f46e5' : '#64748b',
              fontWeight: activeTab === 'ai' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={16} />
            <span>Cấu Hình Trợ Lý AI</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {activeTab === 'latex' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.5, display: 'flex', gap: '0.5rem' }}>
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Preamble cho pdflatex:</strong> Các gói lệnh <code>\usepackage{'{{...}}'}</code>, <code>\usetikzlibrary{'{{...}}'}</code> hoặc <code>\input{'{{...}}'}</code> đặt tại đây sẽ được tự động chèn vào trước <code>{`\\begin{document}`}</code> khi biên dịch TikZ và Bảng biến thiên (tkz-tab).
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>
                    Nội dung Preamble (LaTeX Header)
                  </label>
                  <button 
                    type="button" 
                    onClick={handleResetPreamble} 
                    className="btn btn-outline" 
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    title="Khôi phục preamble chuẩn"
                  >
                    <RotateCcw size={12} /> Mặc định
                  </button>
                </div>
                <textarea
                  className="input"
                  style={{
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: '0.82rem',
                    lineHeight: '1.45',
                    minHeight: '220px',
                    whiteSpace: 'pre',
                    background: '#0f172a',
                    color: '#e2e8f0',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '0.75rem'
                  }}
                  value={latexPreamble}
                  onChange={(e) => setLatexPreamble(e.target.value)}
                  placeholder="Nhập các gói \usepackage{...}, \usetikzlibrary{...} hoặc \input{...}"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#3730a3', lineHeight: 1.5, display: 'flex', gap: '0.5rem' }}>
                  <Sparkles size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Cấu hình Trí Tuệ Nhân Tạo (AI):</strong> Dùng để sinh đề thi, tự động soạn lời giải chi tiết, phân tích dạng toán và gợi ý hình vẽ TikZ.
                  </div>
                </div>
              </div>

              {/* API Key */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Key size={15} color="#4f46e5" /> API Key (Google AI Studio / OpenAI)
                </label>
                <div style={{ position: 'relative', marginTop: '0.35rem' }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    className="input"
                    style={{ paddingRight: '2.5rem', fontFamily: showApiKey ? 'monospace' : 'inherit' }}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy... (Nhập Gemini API Key hoặc OpenAI Key)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}>
                  Khóa API được lưu an toàn cục bộ trên trình duyệt của riêng bạn (LocalStorage).
                </span>
              </div>

              {/* Model AI */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Cpu size={15} color="#06b6d4" /> Chọn Model AI
                </label>
                <div style={{ marginTop: '0.35rem' }}>
                  <select
                    className="input"
                    value={['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gpt-4o', 'gpt-4o-mini'].includes(aiModel) ? aiModel : 'custom'}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setAiModel('custom');
                      } else {
                        setAiModel(e.target.value);
                      }
                    }}
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Tốc độ cao, tối ưu toán học)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Phiên bản mới nhất)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Suy luận sâu, giải đề phức tạp)</option>
                    <option value="gpt-4o">GPT-4o (OpenAI)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini (OpenAI)</option>
                    <option value="custom">Tùy chỉnh model khác...</option>
                  </select>
                </div>

                {aiModel === 'custom' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      className="input"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder="Nhập định danh model (vd: claude-3-5-sonnet-20241022, deepseek-r1)"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '1rem 1.5rem', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {saveSuccess && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle size={16} /> Đã lưu cấu hình thành công!
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
            <button type="button" className="btn btn-primary flex items-center gap-1.5" onClick={handleSave}>
              <Save size={16} /> Lưu Cấu Hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
