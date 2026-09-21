import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Edit, Trash2, Upload, FileText, ChevronRight, Save, Sigma, Search, ChevronDown, ChevronUp, SquareSigma, BookOpen, Download } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { getFormulas, addFormula, updateFormula, deleteFormula, updateFormulaOrders } from '../services/formulaService';
import MathView from '../components/MathView';
import { extractTikzBlocks, buildFormulaCachedSvgs } from '../utils/tikzCacheUtils';
import './Formulas.css';

const Formulas = () => {
  const { isTeacher } = useRole();
  const [formulas, setFormulas] = useState([]);
  const [activeFormulaId, setActiveFormulaId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', order_index: 0, class_level: '', cached_svgs: {} });
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingTikz, setIsSyncingTikz] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ done: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Drag and drop states for list reordering
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const fileInputRef = useRef(null);
  const texTextareaRef = useRef(null);
  const texSearchInputRef = useRef(null);
  const dragCounter = useRef(0);

  // Global search state
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  const normalizeString = (str) => {
    return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd') : '';
  };

  const searchIndex = React.useMemo(() => {
    if (!formulas || formulas.length === 0) return [];
    
    const index = [];
    formulas.forEach(formula => {
      index.push({
        id: `title-${formula.id}`,
        type: 'title',
        text: formula.title,
        normalizedText: normalizeString(formula.title),
        formulaId: formula.id,
        classLevel: formula.class_level || ''
      });

      if (formula.content) {
        // Regex to match \section{...} or \subsection{...} or \subsubsection{...} (with or without *)
        const sectionRegex = /\\(sub)?(sub)?section\*?\{([^}]+)\}/g;
        let match;
        while ((match = sectionRegex.exec(formula.content)) !== null) {
          const sectionTitle = match[3];
          index.push({
            id: `sec-${formula.id}-${match.index}`,
            type: 'section',
            text: sectionTitle,
            normalizedText: normalizeString(sectionTitle),
            formulaId: formula.id,
            parentTitle: formula.title,
            classLevel: formula.class_level || ''
          });
        }
      }
    });
    return index;
  }, [formulas]);

  const searchResults = React.useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    
    const query = normalizeString(globalSearchQuery.trim());
    return searchIndex.filter(item => item.normalizedText.includes(query)).slice(0, 15);
  }, [globalSearchQuery, searchIndex]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeTexSearch = (query, exactSearchText = '', fromIndex = 0) => {
    if (!texTextareaRef.current || !query) return;
    const textArea = texTextareaRef.current;
    const rawText = textArea.value || '';
    
    // Strip internal placeholders added by normalizeLatexString
    let cleanQuery = query.replace(/__(BEGIN|END|MID)_[A-Z_]+__/g, ' ').trim().normalize('NFC');
    if (!cleanQuery) return;

    const normalizedText = rawText.normalize('NFC');
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const allWords = cleanQuery.split(/\s+/).filter(w => w.length > 0);
    if (allWords.length === 0) return;
    
    // Filter out LaTeX commands to avoid mismatch due to macro replacements (e.g. \vv -> \overrightarrow)
    // Keep \begin and \end as they are structurally important and usually unmutated.
    const safeWords = allWords.filter(w => !w.includes('\\') || w.startsWith('\\begin') || w.startsWith('\\end'));
    
    // Take up to 15 robust words to form an anchor
    let searchWords = safeWords.slice(0, 15);
    if (searchWords.length === 0) {
      searchWords = allWords.slice(0, 5); // fallback
    }
    
    searchWords = searchWords.map(escapeRegExp);
    // Join with a lazy wildcard gap to span across unrendered raw LaTeX (up to 150 chars per gap)
    const regexPattern = searchWords.join('[\\s\\S]{0,150}?');
    
    try {
      const regex = new RegExp(regexPattern, 'ig');
      regex.lastIndex = fromIndex;
      
      let match = regex.exec(normalizedText);
      if (!match && fromIndex > 0) {
         regex.lastIndex = 0;
         match = regex.exec(normalizedText);
      }
      
      if (match) {
         let index = match.index;
         let matchLength = match[0].length;
         
         if (exactSearchText) {
             const exactSearchClean = exactSearchText.normalize('NFC');
             // Search for the exact text within the next 1500 characters from the block start
             const exactIdx = normalizedText.indexOf(exactSearchClean, index);
             if (exactIdx !== -1 && exactIdx < index + 1500) {
                 index = exactIdx;
                 matchLength = exactSearchClean.length;
             }
         }
         
         setTimeout(() => {
           textArea.focus({ preventScroll: true });
           textArea.setSelectionRange(index, index + matchLength);
           
           const textBefore = rawText.substring(0, index);
           const lines = textBefore.split('\n');
           let visualLinesBefore = 0;
           for (let i = 0; i < lines.length; i++) {
               visualLinesBefore += Math.max(1, Math.ceil(lines[i].length / 90));
           }
           
           const lineHeight = 21;
           textArea.scrollTop = Math.max(0, visualLinesBefore * lineHeight - 100);
         }, 50);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchAction = () => {
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
    executeTexSearch(query, '', startIndex);
  };

  const handleTexSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchAction();
    }
  };

  const handlePreviewDoubleClick = (e) => {
    let selectedText = '';
    let blockSource = '';
    
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      selectedText = selection.toString().trim();
    }
    
    if (e && e.target) {
      let targetElement = e.target;
      if (targetElement.nodeType === 3) {
        targetElement = targetElement.parentElement;
      }
      
      if (targetElement && targetElement.closest) {
        const target = targetElement.closest('[data-source]');
        if (target) {
          const sourceLatex = decodeURIComponent(target.getAttribute('data-source'));
          if (sourceLatex) {
            blockSource = sourceLatex;
          }
        }
      }
    }

    if (!blockSource && !selectedText) return;
    
    executeTexSearch(blockSource || selectedText, selectedText);
  };

  const fetchFormulas = async () => {
    try {
      setIsLoading(true);
      const data = await getFormulas();
      setFormulas(data || []);
      if (data && data.length > 0 && !activeFormulaId) {
        setActiveFormulaId(data[0].id);
      }
    } catch (error) {
      console.error('Lỗi khi tải công thức:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFormulas();
  }, []);

  const openAddModal = () => {
    if (!isTeacher) return;
    setEditId(null);
    setFormData({ title: '', content: '', order_index: formulas.length, class_level: '', cached_svgs: {} });
    setIsModalOpen(true);
  };

  const openEditModal = (e, formula) => {
    e.stopPropagation();
    if (!isTeacher) return;
    setEditId(formula.id);
    setFormData({ 
      title: formula.title, 
      content: formula.content || '', 
      order_index: formula.order_index, 
      class_level: formula.class_level || '',
      cached_svgs: formula.cached_svgs || {}
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!isTeacher) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa mục công thức này?')) {
      try {
        await deleteFormula(id);
        const newData = formulas.filter(f => f.id !== id);
        setFormulas(newData);
        if (activeFormulaId === id) {
          setActiveFormulaId(newData.length > 0 ? newData[0].id : null);
        }
      } catch (error) {
        console.error('Error deleting formula:', error);
        alert('Có lỗi xảy ra khi xóa công thức');
      }
    }
  };

  const handleDownload = (e, formula) => {
    e.stopPropagation();
    if (!formula.content) {
      alert('Công thức này không có nội dung để tải về.');
      return;
    }
    const blob = new Blob([formula.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formula.title || 'cong-thuc'}.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSaving(true);
    try {
      let cached_svgs = formData.cached_svgs || {};
      const blocks = extractTikzBlocks(formData.content || '');
      if (blocks.length > 0) {
        try {
          cached_svgs = await buildFormulaCachedSvgs(formData.content, cached_svgs);
        } catch (tikzErr) {
          console.warn('Lỗi khi biên dịch trước TikZ:', tikzErr);
        }
      }

      const payload = { ...formData, cached_svgs };

      if (editId) {
        const updated = await updateFormula(editId, payload);
        setFormulas(formulas.map(f => f.id === editId ? updated : f));
      } else {
        const added = await addFormula(payload);
        setFormulas([...formulas, added]);
        setActiveFormulaId(added.id);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving formula:', error);
      alert('Có lỗi xảy ra khi lưu: ' + (error.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncAllTikz = async () => {
    if (!isTeacher) return;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Kiểm tra xem backend có đang phản hồi không
    try {
      const pingRes = await fetch(`${apiUrl}/api/compile-tikz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tikzCode: '\\begin{tikzpicture}\\end{tikzpicture}' })
      });
      if (!pingRes.ok) throw new Error();
    } catch {
      alert("Máy chủ biên dịch LaTeX (backend) chưa được bật hoặc không phản hồi trên cổng 3001.\n\nThầy hãy mở terminal và chạy lệnh:\ncd backend && npm start\n(hoặc 'npm run dev:backend') rồi bấm lại nút này nhé!");
      return;
    }

    const formulasWithTikz = formulas.filter(f => f.content && extractTikzBlocks(f.content).length > 0);
    if (formulasWithTikz.length === 0) {
      alert("Hiện không có mục công thức nào chứa hình TikZ cần đồng bộ.");
      return;
    }

    setIsSyncingTikz(true);
    setSyncProgress({ done: 0, total: formulasWithTikz.length });

    let successCount = 0;
    const updatedFormulas = [...formulas];

    for (let i = 0; i < formulasWithTikz.length; i++) {
      const formula = formulasWithTikz[i];
      try {
        const cached_svgs = await buildFormulaCachedSvgs(formula.content, formula.cached_svgs || {});
        const updated = await updateFormula(formula.id, { cached_svgs });
        const idx = updatedFormulas.findIndex(f => f.id === formula.id);
        if (idx !== -1) {
          updatedFormulas[idx] = { ...updatedFormulas[idx], cached_svgs };
        }
        successCount++;
      } catch (err) {
        console.error(`Lỗi khi đồng bộ TikZ cho ${formula.title}:`, err);
      }
      setSyncProgress({ done: i + 1, total: formulasWithTikz.length });
    }

    setFormulas(updatedFormulas);
    setIsSyncingTikz(false);
    alert(`Đã hoàn tất đồng bộ hình TikZ lên Cloud cho ${successCount}/${formulasWithTikz.length} mục công thức!`);
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setFormData(prev => ({ ...prev, content }));
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Đặt lại value để có thể tải lên cùng 1 file nhiều lần nếu muốn
    e.target.value = null;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleListDragStart = (e, formula) => {
    if (!isTeacher) return;
    setDraggedId(formula.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleListDragOver = (e, formula) => {
    e.preventDefault();
    if (!isTeacher || draggedId === formula.id) return;
    setDragOverId(formula.id);
  };

  const handleListDragLeave = () => {
    setDragOverId(null);
  };

  const handleListDrop = async (e, targetFormula) => {
    e.preventDefault();
    setDragOverId(null);
    if (!isTeacher || !draggedId || draggedId === targetFormula.id) {
      setDraggedId(null);
      return;
    }

    const newFormulas = [...formulas];
    const draggedIdx = newFormulas.findIndex(f => f.id === draggedId);
    const targetIdx = newFormulas.findIndex(f => f.id === targetFormula.id);

    const [draggedItem] = newFormulas.splice(draggedIdx, 1);
    newFormulas.splice(targetIdx, 0, draggedItem);

    setFormulas(newFormulas);
    setDraggedId(null);

    try {
      await updateFormulaOrders(newFormulas);
    } catch (error) {
      console.error(error);
      alert('Không thể lưu thứ tự mới!');
      // Re-fetch to revert if failed
      fetchFormulas();
    }
  };

  const handleListDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const activeFormula = formulas.find(f => f.id === activeFormulaId);

  return (
    <div className="formulas-page">
      <div className="formulas-header">
        <div className="formulas-title-area" style={{ flexShrink: 0 }}>
          <h1>
            <SquareSigma className="text-primary" size={28} />
            TRA CÔNG THỨC
          </h1>
        </div>
        
        <div className="formulas-global-search" ref={searchContainerRef}>
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text"
              placeholder="Tìm kiếm danh mục, mục con (VD: Tập hợp, Định lý...)"
              value={globalSearchQuery}
              onChange={(e) => {
                setGlobalSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
            />
            {globalSearchQuery && (
              <button className="clear-search-btn" onClick={() => setGlobalSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
          
          {isSearchFocused && globalSearchQuery.trim() && (
            <div className="search-suggestions-dropdown">
              {searchResults.length > 0 ? (
                <ul>
                  {searchResults.map(result => (
                    <li 
                      key={result.id} 
                      onClick={() => {
                        setActiveFormulaId(result.formulaId);
                        setGlobalSearchQuery('');
                        setIsSearchFocused(false);
                      }}
                      style={{ paddingLeft: result.type === 'section' ? '2.5rem' : '1rem' }}
                    >
                      <div className="result-icon">
                        {result.type === 'title' ? <BookOpen size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="result-info">
                        <span className="result-title">{result.text}</span>
                        {result.type === 'section' && (
                          <span className="result-subtitle">Thuộc: {result.parentTitle}</span>
                        )}
                      </div>
                      {result.classLevel && (
                        <span className="result-badge">{result.classLevel.replace(/^[lL]ớp\s*/, '')}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-results">Không tìm thấy kết quả nào cho "{globalSearchQuery}"</div>
              )}
            </div>
          )}
        </div>

        {isTeacher && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleSyncAllTikz}
              disabled={isSyncingTikz}
              title="Biên dịch và lưu sẵn hình TikZ lên Cloud để học sinh và thầy mở tức thì 0 giây"
              style={{ fontSize: '0.875rem', padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {isSyncingTikz ? (
                <>⏳ Đang lưu hình ({syncProgress.done}/{syncProgress.total})...</>
              ) : (
                <>⚡ Đồng bộ hình TikZ</>
              )}
            </button>
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={20} />
              Thêm mục mới
            </button>
          </div>
        )}
      </div>

      <div className="formulas-layout">
        <div className="formulas-sidebar glass" style={{ alignSelf: isSidebarOpen ? 'stretch' : 'flex-start' }}>
          <div 
            className="sidebar-title-container" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <h3 className="sidebar-title" style={{ border: 'none', background: 'transparent' }}>Danh mục</h3>
            {isSidebarOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          <div className={`sidebar-content-wrapper ${isSidebarOpen ? 'open' : 'closed'}`}>
            {isLoading ? (
              <div className="loading-state" style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>Đang tải...</div>
            ) : formulas.length > 0 ? (
            <ul className="formulas-list">
              {formulas.map(formula => (
                <li 
                  key={formula.id} 
                  className={`formula-item ${activeFormulaId === formula.id ? 'active' : ''} ${dragOverId === formula.id ? 'drag-over' : ''} ${draggedId === formula.id ? 'dragging-item' : ''}`}
                  onClick={() => setActiveFormulaId(formula.id)}
                  draggable={isTeacher}
                  onDragStart={(e) => handleListDragStart(e, formula)}
                  onDragOver={(e) => handleListDragOver(e, formula)}
                  onDragLeave={handleListDragLeave}
                  onDrop={(e) => handleListDrop(e, formula)}
                  onDragEnd={handleListDragEnd}
                >
                  <div className="formula-item-content">
                    {formula.class_level && <span className="badge" style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--primary-color)', color: 'white', borderRadius: '4px', marginRight: '8px' }}>{formula.class_level.replace(/^[lL]ớp\s*/, '')}</span>}
                    <span className="item-title">{formula.title}</span>
                  </div>
                  
                  {isTeacher && (
                    <div className="formula-item-actions">
                      <button className="icon-btn edit-btn" onClick={(e) => openEditModal(e, formula)} title="Sửa">
                        <Edit size={14} />
                      </button>
                      <button className="icon-btn download-btn" onClick={(e) => handleDownload(e, formula)} title="Tải về file TeX" style={{ color: 'var(--text-muted)' }}>
                        <Download size={14} />
                      </button>
                      <button className="icon-btn delete-btn" onClick={(e) => handleDelete(e, formula.id)} title="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  {activeFormulaId === formula.id && !isTeacher && <ChevronRight size={16} className="active-indicator" />}
                </li>
              ))}
                </ul>
              ) : (
                <div className="empty-state">Chưa có công thức nào.</div>
              )}
          </div>
        </div>

        <div className="formulas-main glass">
          {activeFormula ? (
            <div className="formula-content-container">
              <h2 className="formula-main-title">{activeFormula.title}</h2>
              <div className="formula-viewer">
                {activeFormula.content ? (
                  <MathView text={activeFormula.content} cachedSvgs={activeFormula.cached_svgs} />
                ) : (
                  <div className="empty-content">Nội dung trống.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-main">
              <Sigma size={48} className="empty-icon" />
              <p>Vui lòng chọn một mục để xem công thức</p>
            </div>
          )}
        </div>
      </div>

      {isTeacher && isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content formulas-modal" style={{ maxWidth: '1700px', width: '98vw', height: '96vh' }}>
            <div className="modal-header">
              <h3>{editId ? 'Sửa mục công thức' : 'Thêm mục công thức'}</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-form flex-col h-full" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: '1rem' }}>
              <div className="form-row" style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
                <div className="form-group" style={{ width: '200px' }}>
                  <label>Khối lớp <span className="required">*</span></label>
                  <input 
                    type="text" 
                    list="class-levels"
                    className="input" 
                    value={formData.class_level || ''}
                    onChange={(e) => setFormData({...formData, class_level: e.target.value})}
                    placeholder="VD: Lớp 10"
                    required
                  />
                  <datalist id="class-levels">
                    <option value="Lớp 10" />
                    <option value="Lớp 11" />
                    <option value="Lớp 12" />
                  </datalist>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tên mục <span className="required">*</span></label>
                  <input 
                    type="text" 
                    className="input" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ví dụ: Đạo hàm cơ bản"
                    required
                  />
                </div>
              </div>

              {/* Toolbar cho search/upload */}
              <div className="editor-toolbar" style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                 <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={16} /> Nhập từ file .tex
                 </button>
                 <input 
                    type="file" 
                    accept=".tex,.txt" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    style={{display: 'none'}} 
                 />
                 
                 <div className="search-bar" style={{ display: 'flex', flex: 1, gap: '0.5rem', alignItems: 'center' }}>
                    <Search size={18} className="text-muted" style={{ marginLeft: '1rem' }} />
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Tìm kiếm trong mã LaTeX (nhấn Enter để tìm tiếp)..." 
                      ref={texSearchInputRef}
                      onKeyDown={handleTexSearchKeyDown}
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleSearchAction}
                    >
                      Tìm
                    </button>
                 </div>
                 {/* Removed hint text */}
              </div>

              <div 
                className={`split-view-container ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ flex: 1, display: 'flex', gap: '1rem', minHeight: 0, overflow: 'hidden' }}
              >
                <div className="editor-pane" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <textarea 
                    ref={texTextareaRef}
                    className="input textarea latex-editor w-full" 
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Nhập mã LaTeX của bạn vào đây..."
                    style={{ flex: 1, resize: 'none', margin: 0, padding: '1rem', border: 'none', fontFamily: 'monospace' }}
                  />
                  {isDragging && (
                    <div className="drag-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(var(--bg-color-rgb, 255, 255, 255), 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none', borderRadius: '8px', backdropFilter: 'blur(2px)' }}>
                      <Upload size={48} className="text-primary" style={{ marginBottom: '1rem' }} />
                      <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-color)' }}>Thả file .tex vào đây để nhập</p>
                    </div>
                  )}
                </div>

                <div className="preview-pane" 
                     onMouseUp={handlePreviewDoubleClick}
                     style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
                  {formData.content ? (
                    <MathView text={formData.content} cachedSvgs={formData.cached_svgs} />
                  ) : (
                    <div className="empty-content" style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>Chưa có nội dung xem trước.</div>
                  )}
                </div>
              </div>

              <div className="modal-actions" style={{ flexShrink: 0, marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  <Save size={16} /> {isSaving ? 'Đang lưu & nén hình...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Formulas;
