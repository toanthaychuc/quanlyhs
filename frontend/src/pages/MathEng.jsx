import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Languages, 
  Search, 
  X, 
  Volume2, 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Users, 
  Clock, 
  PenTool, 
  BookOpen, 
  MessageCircle, 
  Layers, 
  Triangle, 
  Variable, 
  TrendingUp, 
  BarChart3, 
  Binary, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Shuffle, 
  ArrowRightLeft,
  Lightbulb,
  Sigma,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { 
  MATH_CATEGORIES, 
  CLASSROOM_PHRASE_CATEGORIES, 
  CLASSROOM_PHRASES, 
  MATH_VOCABULARY, 
  MATH_FLASHCARDS,
  MATH_SYMBOL_CATEGORIES,
  MATH_SYMBOLS
} from '../data/mathEnglishData';
import './MathEng.css';

// Render LaTeX formula safely via KaTeX
const renderLatex = (latex) => {
  if (!latex) return '';
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
    });
  } catch {
    return latex;
  }
};

// Vietnamese diacritic normalization for fast, accent-tolerant search
const normalizeText = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd');
};

const CATEGORY_ICON_MAP = {
  all: Layers,
  geometry: Triangle,
  algebra: Variable,
  calculus: TrendingUp,
  statistics: BarChart3,
  arithmetic: Binary,
  general: Sparkles,
  exponents: Sparkles,
  relations: ArrowRightLeft,
  sets_logic: BookOpen,
  algebra_comb: Variable,
  group: Users,
  time: Clock,
  board: PenTool,
  instructions: BookOpen,
  feedback: Sparkles,
  student: MessageCircle
};

// Abbreviations & symbol tokens inside parentheses that should not be read aloud after the main term
const SILENT_PAREN_TOKENS = new Set([
  'add', 'sub', 'mul', 'div', 'cos', 'sin', 'tan', 'cot', 'sec', 'csc', 'cosec',
  'arccos', 'arcsin', 'arctan', 'arccot', 'ap', 'gp', 'gcd', 'lcm', 'iqr', 'lhs',
  'rhs', 'iff', 'us', 'uk', 'oxy', 'oxyz', 'ox', 'oy', 'oz', 'n', 'k', 'm', 'p',
  'q', 'r', 's', 't', 'x', 'y', 'z', 'i', 'e', 'c', 'd', 'l', 'v', 'a', 'b'
]);

// Clean mathematical term or sentence so Google Translate TTS reads naturally
const prepareTextForSpeech = (rawText) => {
  if (!rawText) return '';

  // 1. Handle parentheticals (...)
  let processed = rawText.replace(/\(([^()]*)\)/g, (_, inner) => {
    const trimmed = inner.trim();
    if (!trimmed) return '';
    const lower = trimmed.toLowerCase();

    if (SILENT_PAREN_TOKENS.has(lower)) return '';

    // Strip parentheticals containing math formulas, symbols, digits, or subscripts
    if (/[^a-zA-Z\s,.'-:]/.test(trimmed)) {
      if (lower.includes('median')) return ', Median';
      return '';
    }

    const tokens = lower.split(/[\s,/]+/).filter(Boolean);
    if (tokens.every((t) => SILENT_PAREN_TOKENS.has(t) || t.length <= 2)) {
      return '';
    }

    return `, ${trimmed}`;
  });

  // 2. Remove remaining brackets and replace slashes between words with commas
  processed = processed
    .replace(/[()[\]{}]/g, ' ')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/[*#_~`"]/g, '')
    .replace(/\s*,\s*,+/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/^,\s*|\s*,$/g, '')
    .trim();

  return processed || rawText;
};

// Pick the most natural English neural voice when falling back to Web Speech API
const selectBestBrowserVoice = (voices, preferredLang = 'en-US') => {
  if (!voices || voices.length === 0) return null;
  const isGB = preferredLang === 'en-GB';

  const priorityMatchers = isGB
    ? [
        (v) => v.name === 'Google UK English Female',
        (v) => v.name === 'Google UK English Male',
        (v) => v.name.includes('Sonia Online (Natural)'),
        (v) => v.name.includes('Ryan Online (Natural)'),
        (v) => v.name.includes('Natural') && v.lang.startsWith('en-GB'),
        (v) => v.name.includes('Google') && v.lang.startsWith('en'),
        (v) => v.name.includes('Natural') && v.lang.startsWith('en'),
        (v) => v.lang.startsWith('en-GB'),
      ]
    : [
        (v) => v.name === 'Google US English',
        (v) => v.name.includes('Aria Online (Natural)'),
        (v) => v.name.includes('Jenny Online (Natural)'),
        (v) => v.name.includes('Guy Online (Natural)'),
        (v) => v.name.includes('Natural') && v.lang.startsWith('en-US'),
        (v) => v.name === 'Google UK English Female',
        (v) => v.name.includes('Google') && v.lang.startsWith('en'),
        (v) => v.name.includes('Samantha') || v.name.includes('Ava'),
        (v) => v.lang.startsWith('en-US') && !v.name.includes('David'),
      ];

  for (const matcher of priorityMatchers) {
    const found = voices.find(matcher);
    if (found) return found;
  }

  return voices.find((v) => v.lang && v.lang.startsWith('en')) || null;
};

const MathEng = () => {
  // Navigation Tabs: 'vocab' | 'symbols' | 'classroom' | 'flashcard'
  const [activeTab, setActiveTab] = useState('vocab');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);

  useEffect(() => {
    let prevWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (prevWidth > 768 && currentWidth <= 768) {
        setIsSidebarOpen(false);
      } else if (prevWidth <= 768 && currentWidth > 768) {
        setIsSidebarOpen(true);
      }
      prevWidth = currentWidth;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Unified Search State across all tabs
  const [searchQuery, setSearchQuery] = useState('');

  // Vocabulary States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(60);
  const contentScrollRef = useRef(null);

  // Auto load more when scrolling near bottom
  const handleScrollWrap = useCallback((e) => {
    if (activeTab !== 'vocab') return;
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (displayLimit < filteredVocabulary.length) {
      if (scrollTop + clientHeight >= scrollHeight - 350) {
        setDisplayLimit((prev) => Math.min(prev + 60, filteredVocabulary.length));
      }
    }
  }, [activeTab, displayLimit, filteredVocabulary.length]);

  // Reset scroll to top when filters change
  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  }, [selectedCategory, searchQuery, activeTab, selectedSymbolCat, selectedPhraseCat]);
  const [savedTerms, setSavedTerms] = useState(() => {
    try {
      const stored = localStorage.getItem('matheng_saved_terms');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Classroom English States
  const [selectedPhraseCat, setSelectedPhraseCat] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all'); // 'all' | 'Teacher' | 'Student'

  // Math Symbols & Operations States
  const [selectedSymbolCat, setSelectedSymbolCat] = useState('all');

  // Flashcards States
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardList, setCardList] = useState(MATH_FLASHCARDS);
  const [cardDirection, setCardDirection] = useState('en-first'); // 'en-first' | 'vi-first'
  const [selectedFlashcardCat, setSelectedFlashcardCat] = useState('all');
  const [masteredCards, setMasteredCards] = useState(() => {
    try {
      const stored = localStorage.getItem('matheng_mastered_cards');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // UI Feedback States (Google Translate TTS voice set to en-GB & 1.0x by default)
  const voiceAccent = 'en-GB';
  const voiceSpeed = 'normal';
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);

  const searchInputRef = useRef(null);
  const audioRef = useRef(null);
  const audioCacheRef = useRef(new Map());
  const browserVoicesRef = useRef([]);

  // Preload Web Speech API voices for offline fallback
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const updateVoices = () => {
      browserVoicesRef.current = window.speechSynthesis.getVoices();
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Persist Saved Terms
  useEffect(() => {
    try {
      localStorage.setItem('matheng_saved_terms', JSON.stringify(savedTerms));
    } catch (e) {
      console.error('Lỗi lưu từ vựng yêu thích:', e);
    }
  }, [savedTerms]);

  // Persist Mastered Flashcards
  useEffect(() => {
    try {
      localStorage.setItem('matheng_mastered_cards', JSON.stringify(masteredCards));
    } catch (e) {
      console.error('Lỗi lưu thẻ ghi nhớ:', e);
    }
  }, [masteredCards]);

  // Natural Audio Pronunciation via Google Translate TTS (with Neural Web Speech fallback)
  const speakText = useCallback(
    async (text, id) => {
      const cleanText = prepareTextForSpeech(text);
      if (!cleanText) return;

      // Stop any ongoing playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      // Clicking the same active speaker button stops playback
      if (speakingId === id) {
        setSpeakingId(null);
        return;
      }

      setSpeakingId(id);

      const fallbackToNeuralBrowserVoice = () => {
        if (!('speechSynthesis' in window)) {
          setSpeakingId(null);
          return;
        }
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = voiceAccent;
        utterance.rate = voiceSpeed === 'slow' ? 0.78 : 0.92;
        utterance.pitch = 1.0;

        const voices =
          browserVoicesRef.current.length > 0
            ? browserVoicesRef.current
            : window.speechSynthesis.getVoices();
        const bestVoice = selectBestBrowserVoice(voices, voiceAccent);
        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang;
        }

        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);
        window.speechSynthesis.speak(utterance);
      };

      try {
        const ttsSpeedParam = voiceSpeed === 'slow' ? '0.24' : '1';
        const cacheKey = `${voiceAccent}|${ttsSpeedParam}|${cleanText}`;
        let blobUrl = audioCacheRef.current.get(cacheKey);

        if (!blobUrl) {
          const ttsUrl = `/api/tts?tl=${encodeURIComponent(voiceAccent)}&ttsspeed=${ttsSpeedParam}&q=${encodeURIComponent(cleanText.slice(0, 195))}`;
          const response = await fetch(ttsUrl);
          if (!response.ok) {
            throw new Error(`TTS HTTP ${response.status}`);
          }
          const blob = await response.blob();
          if (!blob || blob.size < 100) {
            throw new Error('Empty TTS audio');
          }
          blobUrl = URL.createObjectURL(blob);
          audioCacheRef.current.set(cacheKey, blobUrl);
        }

        const audio = new Audio(blobUrl);
        audio.playbackRate = voiceSpeed === 'slow' ? 0.88 : 1.0;
        audioRef.current = audio;

        audio.onended = () => {
          setSpeakingId((prev) => (prev === id ? null : prev));
        };
        audio.onerror = () => {
          fallbackToNeuralBrowserVoice();
        };

        await audio.play();
      } catch {
        fallbackToNeuralBrowserVoice();
      }
    },
    [voiceAccent, voiceSpeed, speakingId]
  );

  // Copy to Clipboard
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Toggle Bookmark
  const toggleSaveTerm = (id) => {
    setSavedTerms((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter Vocabulary
  const filteredVocabulary = useMemo(() => {
    const qNorm = normalizeText(searchQuery.trim());

    return MATH_VOCABULARY.filter((term) => {
      // Saved filter
      if (showOnlySaved && !savedTerms.includes(term.id)) return false;

      // Category filter
      if (selectedCategory !== 'all' && term.category !== selectedCategory) return false;

      // Search query
      if (qNorm) {
        const enNorm = normalizeText(term.en);
        const viNorm = normalizeText(term.vi);
        const exampleNorm = normalizeText(term.example || '');
        const subtermsNorm = (term.subterms || [])
          .map((s) => `${normalizeText(s.en)} ${normalizeText(s.vi)}`)
          .join(' ');

        return (
          enNorm.includes(qNorm) ||
          viNorm.includes(qNorm) ||
          exampleNorm.includes(qNorm) ||
          subtermsNorm.includes(qNorm)
        );
      }

      return true;
    });
  }, [searchQuery, selectedCategory, showOnlySaved, savedTerms]);

  // Paginated visible vocabulary for smooth 60fps rendering
  const visibleVocabulary = useMemo(() => {
    return filteredVocabulary.slice(0, displayLimit);
  }, [filteredVocabulary, displayLimit]);

  // Filter Classroom Phrases
  const filteredPhrases = useMemo(() => {
    const qNorm = normalizeText(searchQuery.trim());

    return CLASSROOM_PHRASES.filter((phrase) => {
      if (selectedPhraseCat !== 'all' && phrase.category !== selectedPhraseCat) return false;
      if (selectedRole !== 'all' && phrase.role !== selectedRole) return false;

      if (qNorm) {
        const enNorm = normalizeText(phrase.en);
        const viNorm = normalizeText(phrase.vi);
        const ctxNorm = normalizeText(phrase.context || '');
        const tipNorm = normalizeText(phrase.tip || '');

        return (
          enNorm.includes(qNorm) ||
          viNorm.includes(qNorm) ||
          ctxNorm.includes(qNorm) ||
          tipNorm.includes(qNorm)
        );
      }

      return true;
    });
  }, [searchQuery, selectedPhraseCat, selectedRole]);

  // Filter Math Symbols & Operations
  const filteredSymbols = useMemo(() => {
    const qNorm = normalizeText(searchQuery.trim());

    return MATH_SYMBOLS.filter((item) => {
      if (selectedSymbolCat !== 'all' && item.category !== selectedSymbolCat) return false;

      if (qNorm) {
        const symNorm = normalizeText(item.symbol);
        const viNorm = normalizeText(item.vi);
        const readingsNorm = (item.readings || [])
          .map((r) => `${normalizeText(r.en)} ${normalizeText(r.note || '')}`)
          .join(' ');
        const exNorm = item.example
          ? `${normalizeText(item.example.expr || '')} ${normalizeText(item.example.en || '')} ${normalizeText(item.example.vi || '')}`
          : '';

        return (
          symNorm.includes(qNorm) ||
          viNorm.includes(qNorm) ||
          readingsNorm.includes(qNorm) ||
          exNorm.includes(qNorm)
        );
      }

      return true;
    });
  }, [searchQuery, selectedSymbolCat]);

  // Flashcards filtered list
  const activeFlashcardList = useMemo(() => {
    if (selectedFlashcardCat === 'all') return cardList;
    return cardList.filter((c) => c.category === selectedFlashcardCat);
  }, [cardList, selectedFlashcardCat]);

  // Flashcards navigation
  const currentCard = activeFlashcardList[cardIndex] || activeFlashcardList[0] || cardList[0];
  const isCurrentMastered = currentCard && masteredCards.includes(currentCard.id);

  const nextCard = useCallback(() => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % (activeFlashcardList.length || 1));
  }, [activeFlashcardList.length]);

  const prevCard = useCallback(() => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + (activeFlashcardList.length || 1)) % (activeFlashcardList.length || 1));
  }, [activeFlashcardList.length]);

  const shuffleCards = () => {
    setIsFlipped(false);
    const shuffled = [...cardList].sort(() => Math.random() - 0.5);
    setCardList(shuffled);
    setCardIndex(0);
  };

  const toggleMastered = (cardId) => {
    setMasteredCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  // Keyboard navigation for Flashcards
  useEffect(() => {
    if (activeTab !== 'flashcard') return;

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.code === 'ArrowRight') {
        nextCard();
      } else if (e.code === 'ArrowLeft') {
        prevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, nextCard, prevCard]);

  return (
    <div className="formulas-page matheng-page">
      {/* Top Header matching Tra Công Thức / Quản Lý Lớp Học */}
      <div className="formulas-header matheng-header">
        <div className="formulas-title-area" style={{ flexShrink: 0 }}>
          <h1>
            <Languages className="text-primary" size={28} />
            TOÁN - ENG
          </h1>
        </div>

        {/* Global Search Bar in Header */}
        <div className="formulas-global-search">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={
                activeTab === 'vocab'
                  ? 'Tra cứu từ vựng toán (VD: hypotenuse, đạo hàm, tam giác, prime...)'
                  : activeTab === 'symbols'
                  ? 'Tìm kí hiệu & phép toán (VD: cộng, lũy thừa, căn bậc a của b, logarit...)'
                  : activeTab === 'classroom'
                  ? 'Tìm câu lệnh lớp học (VD: chia nhóm, lên bảng, rút gọn...)'
                  : 'Tìm kiếm trong thẻ ghi nhớ...'
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayLimit(60);
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  setDisplayLimit(60);
                  searchInputRef.current?.focus();
                }}
                title="Xóa tìm kiếm"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Mode Switcher Tabs (Styled identically to school-tabs in Lớp Học) */}
        <div className="school-tabs matheng-header-tabs">
          <button
            type="button"
            className={`school-tab-btn ${activeTab === 'vocab' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('vocab');
              setDisplayLimit(60);
            }}
          >
            <BookOpen size={16} />
            <span>Thuật ngữ</span>
            <span className="matheng-tab-badge">{MATH_VOCABULARY.length}</span>
          </button>
          <button
            type="button"
            className={`school-tab-btn ${activeTab === 'symbols' ? 'active' : ''}`}
            onClick={() => setActiveTab('symbols')}
          >
            <Sigma size={16} />
            <span>Kí hiệu</span>
            <span className="matheng-tab-badge">{MATH_SYMBOLS.length}</span>
          </button>
          <button
            type="button"
            className={`school-tab-btn ${activeTab === 'classroom' ? 'active' : ''}`}
            onClick={() => setActiveTab('classroom')}
          >
            <Users size={16} />
            <span>Giao tiếp</span>
            <span className="matheng-tab-badge">{CLASSROOM_PHRASES.length}</span>
          </button>
          <button
            type="button"
            className={`school-tab-btn ${activeTab === 'flashcard' ? 'active' : ''}`}
            onClick={() => setActiveTab('flashcard')}
          >
            <Sparkles size={16} />
            <span>Thẻ nhớ</span>
            <span className="matheng-tab-badge">{MATH_FLASHCARDS.length}</span>
          </button>
        </div>
      </div>

      {/* Synchronized 2-Column Layout */}
      <div className="formulas-layout matheng-layout">
        {/* Mobile Backdrop when Category Sidebar is Open */}
        {isSidebarOpen && (
          <div 
            className="matheng-mobile-backdrop"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar: Danh mục */}
        <div 
          className={`formulas-sidebar glass matheng-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}
        >
          <div className="matheng-sidebar-inner" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div 
              className="sidebar-title-container" 
              onClick={() => setIsSidebarOpen(false)}
              title="Thu gọn danh mục"
            >
              <h3 className="sidebar-title">Danh mục</h3>
              <span className="sidebar-collapse-chevron" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>«</span>
            </div>

            <div className="sidebar-content-wrapper open">
            {/* Sidebar content for: THUẬT NGỮ TOÁN HỌC */}
            {activeTab === 'vocab' && (
              <ul className="formulas-list">
                {MATH_CATEGORIES.map((cat) => {
                  const IconComp = CATEGORY_ICON_MAP[cat.id] || Layers;
                  const isActive = selectedCategory === cat.id && !showOnlySaved;
                  const count =
                    cat.id === 'all'
                      ? MATH_VOCABULARY.length
                      : MATH_VOCABULARY.filter((t) => t.category === cat.id).length;

                  return (
                    <li
                      key={cat.id}
                      className={`formula-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setShowOnlySaved(false);
                        setDisplayLimit(60);
                        if (window.innerWidth <= 768) setIsSidebarOpen(false);
                      }}
                      title={cat.desc}
                    >
                      <div className="formula-item-content">
                        <IconComp size={16} className="item-icon" />
                        <span className="item-title">{cat.name}</span>
                      </div>
                      <span className="matheng-cat-count-badge">{count}</span>
                    </li>
                  );
                })}

                {/* Bookmarked / Saved Terms */}
                <li
                  className={`formula-item ${showOnlySaved ? 'active' : ''}`}
                  onClick={() => {
                    setShowOnlySaved(!showOnlySaved);
                    setDisplayLimit(60);
                    if (window.innerWidth <= 768) setIsSidebarOpen(false);
                  }}
                  title="Chỉ hiển thị các từ vựng đã đánh dấu yêu thích"
                >
                  <div className="formula-item-content">
                    <BookmarkCheck size={16} className="item-icon" style={{ color: '#d97706' }} />
                    <span className="item-title">Từ vựng đã lưu</span>
                  </div>
                  <span className="matheng-cat-count-badge saved">{savedTerms.length}</span>
                </li>
              </ul>
            )}

            {/* Sidebar content for: KÍ HIỆU TOÁN HỌC */}
            {activeTab === 'symbols' && (
              <ul className="formulas-list">
                {MATH_SYMBOL_CATEGORIES.map((cat) => {
                  const IconComp = CATEGORY_ICON_MAP[cat.id] || Sigma;
                  const isActive = selectedSymbolCat === cat.id;
                  const count =
                    cat.id === 'all'
                      ? MATH_SYMBOLS.length
                      : MATH_SYMBOLS.filter((s) => s.category === cat.id).length;

                  return (
                    <li
                      key={cat.id}
                      className={`formula-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedSymbolCat(cat.id);
                        if (window.innerWidth <= 768) setIsSidebarOpen(false);
                      }}
                      title={cat.desc}
                    >
                      <div className="formula-item-content">
                        <IconComp size={16} className="item-icon" />
                        <span className="item-title">{cat.name}</span>
                      </div>
                      <span className="matheng-cat-count-badge">{count}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Sidebar content for: GIAO TIẾP LỚP HỌC */}
            {activeTab === 'classroom' && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                {/* Role Switcher */}
                <div className="matheng-sidebar-subfilter">
                  <div className="school-tabs mini">
                    <button
                      type="button"
                      className={`school-tab-btn ${selectedRole === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('all')}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      className={`school-tab-btn ${selectedRole === 'Teacher' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('Teacher')}
                    >
                      Giáo viên
                    </button>
                    <button
                      type="button"
                      className={`school-tab-btn ${selectedRole === 'Student' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('Student')}
                    >
                      Học sinh
                    </button>
                  </div>
                </div>

                <ul className="formulas-list">
                  <li
                    className={`formula-item ${selectedPhraseCat === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedPhraseCat('all');
                      if (window.innerWidth <= 768) setIsSidebarOpen(false);
                    }}
                  >
                    <div className="formula-item-content">
                      <Layers size={16} className="item-icon" />
                      <span className="item-title">Tất cả tình huống</span>
                    </div>
                    <span className="matheng-cat-count-badge">{CLASSROOM_PHRASES.length}</span>
                  </li>

                  {CLASSROOM_PHRASE_CATEGORIES.map((cat) => {
                    const IconComp = CATEGORY_ICON_MAP[cat.id] || MessageCircle;
                    const isActive = selectedPhraseCat === cat.id;
                    const count = CLASSROOM_PHRASES.filter((p) => p.category === cat.id).length;

                    return (
                      <li
                        key={cat.id}
                        className={`formula-item ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedPhraseCat(cat.id);
                          if (window.innerWidth <= 768) setIsSidebarOpen(false);
                        }}
                        title={cat.desc}
                      >
                        <div className="formula-item-content">
                          <IconComp size={16} className="item-icon" />
                          <span className="item-title">{cat.name}</span>
                        </div>
                        <span className="matheng-cat-count-badge">{count}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Sidebar content for: THẺ GHI NHỚ */}
            {activeTab === 'flashcard' && (
              <div className="matheng-flashcard-sidebar-panel">
                <div className="matheng-flashcard-stat-card">
                  <div className="matheng-stat-label">Tiến độ ôn tập</div>
                  <div className="matheng-stat-value">
                    {masteredCards.length} / {cardList.length} <span className="stat-unit">đã thuộc</span>
                  </div>
                  <div className="matheng-progress-track">
                    <div
                      className="matheng-progress-fill"
                      style={{ width: `${(masteredCards.length / (cardList.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="matheng-sidebar-actions-list">
                  <button
                    type="button"
                    className="matheng-sidebar-action-btn"
                    onClick={() => setCardDirection(cardDirection === 'en-first' ? 'vi-first' : 'en-first')}
                    title="Đổi mặt thẻ bắt đầu"
                  >
                    <ArrowRightLeft size={15} />
                    <span>Mặt trước: {cardDirection === 'en-first' ? 'Tiếng Anh' : 'Tiếng Việt'}</span>
                  </button>

                  <button
                    type="button"
                    className="matheng-sidebar-action-btn"
                    onClick={shuffleCards}
                    title="Xáo trộn ngẫu nhiên"
                  >
                    <Shuffle size={15} />
                    <span>Xáo trộn ngẫu nhiên</span>
                  </button>

                  <button
                    type="button"
                    className="matheng-sidebar-action-btn"
                    onClick={() => {
                      if (window.confirm('Đặt lại toàn bộ tiến độ đã thuộc của bộ thẻ?')) {
                        setMasteredCards([]);
                      }
                    }}
                    title="Đặt lại tiến độ học"
                  >
                    <RotateCcw size={15} />
                    <span>Đặt lại thẻ đã thuộc</span>
                  </button>
                </div>

                <div className="matheng-flashcard-cat-filter-title">Lọc theo chuyên đề:</div>
                <ul className="formulas-list" style={{ maxHeight: '220px' }}>
                  <li
                    className={`formula-item ${selectedFlashcardCat === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFlashcardCat('all');
                      setCardIndex(0);
                    }}
                  >
                    <div className="formula-item-content">
                      <Layers size={15} className="item-icon" />
                      <span className="item-title">Tất cả chuyên đề</span>
                    </div>
                    <span className="matheng-cat-count-badge">{cardList.length}</span>
                  </li>
                  {MATH_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                    const IconComp = CATEGORY_ICON_MAP[cat.id] || Layers;
                    const isActive = selectedFlashcardCat === cat.id;
                    const count = cardList.filter((c) => c.category === cat.id).length;
                    return (
                      <li
                        key={cat.id}
                        className={`formula-item ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedFlashcardCat(cat.id);
                          setCardIndex(0);
                        }}
                      >
                        <div className="formula-item-content">
                          <IconComp size={15} className="item-icon" />
                          <span className="item-title">{cat.name}</span>
                        </div>
                        <span className="matheng-cat-count-badge">{count}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Right Main Content Panel */}
        <div className="formulas-main glass matheng-main-content">
          {/* Main Meta Header Bar */}
          <div className="matheng-main-meta-bar">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className={`category-toggle-btn ${!isSidebarOpen ? 'is-collapsed' : ''}`}
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                title={isSidebarOpen ? "Thu gọn danh mục" : "Mở danh mục"}
                aria-label={isSidebarOpen ? "Thu gọn danh mục" : "Mở danh mục"}
              >
                {isSidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
              </button>

              {activeTab === 'vocab' && (
                <span>
                  Tìm thấy <strong>{filteredVocabulary.length}</strong> thuật ngữ
                  {filteredVocabulary.length > visibleVocabulary.length ? (
                    <span style={{ opacity: 0.85, fontWeight: 500, fontSize: '0.85em', marginLeft: '6px' }}>
                      (Đang hiển thị {visibleVocabulary.length})
                    </span>
                  ) : null}
                  {selectedCategory !== 'all' &&
                    ` • Lĩnh vực: ${MATH_CATEGORIES.find((c) => c.id === selectedCategory)?.name}`}
                  {showOnlySaved && ' • Danh sách đã lưu'}
                </span>
              )}

              {activeTab === 'symbols' && (
                <span>
                  Hiển thị <strong>{filteredSymbols.length}</strong> phép toán & kí hiệu
                  {selectedSymbolCat !== 'all' &&
                    ` • Nhóm: ${MATH_SYMBOL_CATEGORIES.find((c) => c.id === selectedSymbolCat)?.name}`}
                </span>
              )}

              {activeTab === 'classroom' && (
                <span>
                  Hiển thị <strong>{filteredPhrases.length}</strong> câu khẩu lệnh
                  {selectedPhraseCat !== 'all' &&
                    ` • Tình huống: ${CLASSROOM_PHRASE_CATEGORIES.find((c) => c.id === selectedPhraseCat)?.name}`}
                  {selectedRole !== 'all' &&
                    ` • Đối tượng: ${selectedRole === 'Teacher' ? 'Giáo viên' : 'Học sinh'}`}
                </span>
              )}

              {activeTab === 'flashcard' && (
                <span>
                  Thẻ số <strong>{cardIndex + 1}</strong> / {activeFlashcardList.length} • Nhấn phím cách [Space] hoặc bấm vào thẻ để lật
                </span>
              )}
            </div>

            {/* Reset Filter Buttons on Right */}
            {activeTab === 'vocab' && (searchQuery || selectedCategory !== 'all' || showOnlySaved) && (
              <button
                type="button"
                className="matheng-reset-filter-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setShowOnlySaved(false);
                  setDisplayLimit(60);
                }}
              >
                Đặt lại bộ lọc
              </button>
            )}

            {activeTab === 'symbols' && (searchQuery || selectedSymbolCat !== 'all') && (
              <button
                type="button"
                className="matheng-reset-filter-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSymbolCat('all');
                }}
              >
                Đặt lại bộ lọc
              </button>
            )}

            {activeTab === 'classroom' && (searchQuery || selectedPhraseCat !== 'all' || selectedRole !== 'all') && (
              <button
                type="button"
                className="matheng-reset-filter-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPhraseCat('all');
                  setSelectedRole('all');
                }}
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          {/* Main Scrollable View Area */}
          <div 
            ref={contentScrollRef}
            className="matheng-content-scroll-wrap"
            onScroll={handleScrollWrap}
          >
            {/* ======================= TAB 1: VOCABULARY ======================= */}
            {activeTab === 'vocab' && (
              filteredVocabulary.length > 0 ? (
                <>
                  <div className="matheng-vocab-grid">
                    {visibleVocabulary.map((term) => {
                      const isSaved = savedTerms.includes(term.id);
                      const isSpeaking = speakingId === term.id;
                      const isCopied = copiedId === term.id;
                      const catMeta =
                        MATH_CATEGORIES.find((c) => c.id === term.category) || MATH_CATEGORIES[0];
                      const IconComp = CATEGORY_ICON_MAP[term.category] || Layers;

                      return (
                        <div key={term.id} className="matheng-term-card">
                          <div className="matheng-term-card-header">
                            <span className={`matheng-term-cat-badge cat-${term.category}`}>
                              <IconComp size={12} />
                              {catMeta.name}
                            </span>
                            <div className="matheng-term-actions">
                              <button
                                type="button"
                                className={`matheng-icon-action-btn ${isSpeaking ? 'active' : ''}`}
                                onClick={() => speakText(term.en, term.id)}
                                title="Phát âm tiếng Anh chuẩn"
                              >
                                <Volume2 size={16} />
                              </button>
                              <button
                                type="button"
                                className="matheng-icon-action-btn"
                                onClick={() => handleCopy(`${term.en}: ${term.vi}`, term.id)}
                                title="Sao chép thuật ngữ"
                              >
                                {isCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                              </button>
                              <button
                                type="button"
                                className={`matheng-icon-action-btn ${isSaved ? 'saved' : ''}`}
                                onClick={() => toggleSaveTerm(term.id)}
                                title={isSaved ? 'Bỏ lưu' : 'Lưu vào từ vựng cần ôn'}
                              >
                                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                              </button>
                            </div>
                          </div>

                          <div className="matheng-term-body">
                            <div className="matheng-term-en-line">
                              <span className="matheng-term-en">{term.en}</span>
                              <span className="matheng-term-divider">:</span>
                              <span className="matheng-term-vi">{term.vi}</span>
                            </div>
                            {term.ipa && (
                              <div className="matheng-term-ipa-wrapper">
                                <span className="matheng-term-ipa">{term.ipa}</span>
                              </div>
                            )}
                          </div>

                          {term.example && (
                            <div className="matheng-example-box">
                              <div className="matheng-example-label">
                                <Lightbulb size={13} />
                                <span>Ví dụ trong ngữ cảnh toán học:</span>
                                <button
                                  type="button"
                                  className="matheng-subterm-speak-btn matheng-example-speak-btn"
                                  onClick={() => speakText(term.example, `${term.id}_example`)}
                                  title="Nghe đọc câu ví dụ bằng giọng Google Dịch"
                                >
                                  <Volume2
                                    size={13}
                                    className={speakingId === `${term.id}_example` ? 'speaking' : ''}
                                  />
                                </button>
                              </div>
                              <div className="matheng-example-text">"{term.example}"</div>
                            </div>
                          )}

                          {term.subterms && term.subterms.length > 0 && (
                            <div className="matheng-subterms-box">
                              <div className="matheng-subterms-title">Thuật ngữ liên quan:</div>
                              <ul className="matheng-subterms-list">
                                {term.subterms.map((sub, sIdx) => {
                                  const subId = `${term.id}_sub_${sIdx}`;
                                  const isSubSpeaking = speakingId === subId;
                                  return (
                                    <li key={sIdx} className="matheng-subterm-item">
                                      <span className="matheng-subterm-en">{sub.en}</span>
                                      <span className="matheng-subterm-vi">{sub.vi}</span>
                                      <button
                                        type="button"
                                        className="matheng-subterm-speak-btn"
                                        onClick={() => speakText(sub.en, subId)}
                                        title="Nghe phát âm"
                                      >
                                        <Volume2 size={13} className={isSubSpeaking ? 'speaking' : ''} />
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {displayLimit < filteredVocabulary.length && (
                    <div className="matheng-load-more-wrapper">
                      <button
                        type="button"
                        className="matheng-load-more-btn"
                        onClick={() => setDisplayLimit((prev) => Math.min(prev + 60, filteredVocabulary.length))}
                      >
                        <ChevronDown size={18} />
                        <span>
                          Xem thêm 60 thuật ngữ (Đang hiển thị {visibleVocabulary.length}/{filteredVocabulary.length})
                        </span>
                      </button>
                    </div>
                  )}

                  {displayLimit >= filteredVocabulary.length && filteredVocabulary.length > 20 && (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      ✓ Đã hiển thị toàn bộ {filteredVocabulary.length} thuật ngữ
                    </div>
                  )}
                </>
              ) : (
                <div className="matheng-empty-state">
                  <Languages size={48} className="matheng-empty-icon" />
                  <h3>Không tìm thấy thuật ngữ phù hợp</h3>
                  <p>Hãy thử kiểm tra lại từ khóa hoặc chọn xem lại tất cả danh mục.</p>
                  <button
                    type="button"
                    className="matheng-reset-filter-btn primary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setShowOnlySaved(false);
                      setDisplayLimit(60);
                    }}
                  >
                    Xem lại toàn bộ danh mục từ vựng
                  </button>
                </div>
              )
            )}

            {/* ======================= TAB 2: SYMBOLS & OPERATIONS ======================= */}
            {activeTab === 'symbols' && (
              filteredSymbols.length > 0 ? (
                <div className="matheng-symbols-grid">
                  {filteredSymbols.map((item) => {
                    const catMeta =
                      MATH_SYMBOL_CATEGORIES.find((c) => c.id === item.category) ||
                      MATH_SYMBOL_CATEGORIES[0];
                    const IconComp = CATEGORY_ICON_MAP[item.category] || Sigma;
                    const primaryReading = item.readings?.[0]?.en || item.symbol;
                    const isPrimarySpeaking = speakingId === `${item.id}_primary`;
                    const isCopied = copiedId === item.id;

                    const copyPayload = `${item.symbol} (${item.vi}): ${(item.readings || [])
                      .map((r) => r.en)
                      .join(' / ')}`;

                    return (
                      <div key={item.id} className="matheng-symbol-card">
                        <div className="matheng-term-card-header">
                          <span className={`matheng-term-cat-badge cat-${item.category}`}>
                            <IconComp size={12} />
                            {catMeta.name}
                          </span>
                          <div className="matheng-term-actions">
                            <button
                              type="button"
                              className={`matheng-icon-action-btn ${isPrimarySpeaking ? 'active' : ''}`}
                              onClick={() => speakText(primaryReading, `${item.id}_primary`)}
                              title="Nghe cách đọc phổ biến nhất"
                            >
                              <Volume2 size={16} />
                            </button>
                            <button
                              type="button"
                              className="matheng-icon-action-btn"
                              onClick={() => handleCopy(copyPayload, item.id)}
                              title="Sao chép kí hiệu và các cách đọc"
                            >
                              {isCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="matheng-symbol-hero">
                          <div
                            className="matheng-symbol-formula-badge"
                            dangerouslySetInnerHTML={{ __html: renderLatex(item.latex || item.symbol) }}
                          />
                          <div className="matheng-symbol-vi-title">{item.vi}</div>
                        </div>

                        <div className="matheng-readings-box">
                          <div className="matheng-readings-header">
                            Các cách đọc chuẩn trong tiếng Anh ({item.readings?.length || 0} cách):
                          </div>
                          <ul className="matheng-readings-list">
                            {(item.readings || []).map((r, rIdx) => {
                              const rId = `${item.id}_read_${rIdx}`;
                              const isRSpk = speakingId === rId;
                              return (
                                <li key={rIdx} className="matheng-reading-item">
                                  <div className="matheng-reading-main">
                                    <span className="matheng-reading-index">#{rIdx + 1}</span>
                                    <span className="matheng-reading-en">"{r.en}"</span>
                                    <button
                                      type="button"
                                      className={`matheng-reading-speak-btn ${isRSpk ? 'active' : ''}`}
                                      onClick={() => speakText(r.en, rId)}
                                      title="Nghe phát âm cách đọc này"
                                    >
                                      <Volume2 size={14} />
                                    </button>
                                  </div>
                                  {r.note && <div className="matheng-reading-note">{r.note}</div>}
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {item.example && (
                          <div className="matheng-symbol-example-box">
                            <div className="matheng-example-label">
                              <Lightbulb size={13} />
                              <span>Ví dụ áp dụng:</span>
                              <span
                                className="matheng-symbol-example-math"
                                dangerouslySetInnerHTML={{
                                  __html: renderLatex(item.example.latex || item.example.expr),
                                }}
                              />
                              <button
                                type="button"
                                className="matheng-subterm-speak-btn matheng-example-speak-btn"
                                onClick={() => speakText(item.example.en, `${item.id}_ex`)}
                                title="Nghe đọc câu ví dụ"
                              >
                                <Volume2
                                  size={14}
                                  className={speakingId === `${item.id}_ex` ? 'speaking' : ''}
                                />
                              </button>
                            </div>
                            <div className="matheng-symbol-example-en">"{item.example.en}"</div>
                            {item.example.vi && (
                              <div className="matheng-symbol-example-vi">→ {item.example.vi}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="matheng-empty-state">
                  <Sigma size={48} className="matheng-empty-icon" />
                  <h3>Không tìm thấy kí hiệu hoặc phép toán phù hợp</h3>
                  <p>Hãy thử tìm với từ khóa khác (VD: cộng, lũy thừa, căn bậc, logarit, tích phân...).</p>
                  <button
                    type="button"
                    className="matheng-reset-filter-btn primary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSymbolCat('all');
                    }}
                  >
                    Xem tất cả kí hiệu toán học
                  </button>
                </div>
              )
            )}

            {/* ======================= TAB 3: CLASSROOM ENGLISH ======================= */}
            {activeTab === 'classroom' && (
              filteredPhrases.length > 0 ? (
                <div className="matheng-phrases-grid">
                  {filteredPhrases.map((phrase) => {
                    const isSpeaking = speakingId === phrase.id;
                    const isCopied = copiedId === phrase.id;
                    const catMeta = CLASSROOM_PHRASE_CATEGORIES.find((c) => c.id === phrase.category);
                    const isTeacher = phrase.role === 'Teacher';

                    return (
                      <div key={phrase.id} className="matheng-phrase-card">
                        <div className="matheng-phrase-card-header">
                          <div className="matheng-phrase-badges">
                            <span className={`matheng-role-badge ${isTeacher ? 'teacher' : 'student'}`}>
                              {isTeacher ? '👨‍🏫 Giáo viên' : '🎒 Học sinh'}
                            </span>
                            {catMeta && (
                              <span className="matheng-phrase-cat-badge">
                                {catMeta.name}
                              </span>
                            )}
                          </div>
                          <div className="matheng-term-actions">
                            <button
                              type="button"
                              className={`matheng-icon-action-btn ${isSpeaking ? 'active' : ''}`}
                              onClick={() => speakText(phrase.en, phrase.id)}
                              title="Phát âm câu khẩu lệnh"
                            >
                              <Volume2 size={16} />
                            </button>
                            <button
                              type="button"
                              className="matheng-icon-action-btn"
                              onClick={() => handleCopy(`${phrase.en} (${phrase.vi})`, phrase.id)}
                              title="Sao chép câu"
                            >
                              {isCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="matheng-phrase-body">
                          <div className="matheng-phrase-en">{phrase.en}</div>
                          <div className="matheng-phrase-vi">{phrase.vi}</div>
                        </div>

                        {(phrase.context || phrase.tip) && (
                          <div className="matheng-phrase-footer">
                            {phrase.context && (
                              <div className="matheng-phrase-context">
                                <strong>Ngữ cảnh:</strong> {phrase.context}
                              </div>
                            )}
                            {phrase.tip && (
                              <div className="matheng-phrase-tip">
                                <Lightbulb size={13} />
                                <span>{phrase.tip}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="matheng-empty-state">
                  <MessageCircle size={48} className="matheng-empty-icon" />
                  <h3>Không tìm thấy câu khẩu lệnh phù hợp</h3>
                  <p>Hãy thử tìm bằng từ khóa khác hoặc chuyển sang danh mục tất cả.</p>
                  <button
                    type="button"
                    className="matheng-reset-filter-btn primary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedPhraseCat('all');
                      setSelectedRole('all');
                    }}
                  >
                    Xem lại toàn bộ câu khẩu lệnh
                  </button>
                </div>
              )
            )}

            {/* ======================= TAB 4: FLASHCARDS ======================= */}
            {activeTab === 'flashcard' && currentCard && (
              <div className="matheng-flashcards-section">
                <div 
                  className={`matheng-flashcard-wrapper ${isFlipped ? 'flipped' : ''}`}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front Side */}
                  <div className="matheng-flashcard matheng-card-front">
                    <div className="matheng-flashcard-header">
                      <span className="matheng-flashcard-cat-badge">
                        {MATH_CATEGORIES.find((c) => c.id === currentCard.category)?.name || 'Toán học'}
                      </span>
                      <span className="matheng-flashcard-hint">Chạm để lật mặt sau ↻</span>
                    </div>

                    <div className="matheng-flashcard-main">
                      {cardDirection === 'en-first' ? (
                        <>
                          <h2 className="matheng-card-title">{currentCard.en}</h2>
                          {currentCard.ipa && <div className="matheng-card-ipa">{currentCard.ipa}</div>}
                          <button
                            type="button"
                            className="matheng-card-speak-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(currentCard.en, currentCard.id);
                            }}
                            title="Nghe phát âm"
                          >
                            <Volume2 size={20} />
                            <span>Nghe phát âm</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <h2 className="matheng-card-title vi">{currentCard.vi}</h2>
                          <div className="matheng-card-subtitle">Hãy nhớ thuật ngữ tiếng Anh tương ứng!</div>
                        </>
                      )}
                    </div>

                    <div className="matheng-flashcard-footer">
                      <span>Nhấn phím [Space] hoặc bấm vào thẻ để lật</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="matheng-flashcard matheng-card-back">
                    <div className="matheng-flashcard-header">
                      <span className="matheng-flashcard-cat-badge">Đáp án chi tiết</span>
                      <span className="matheng-flashcard-hint">Chạm để lật lại ↻</span>
                    </div>

                    <div className="matheng-flashcard-main">
                      {cardDirection === 'en-first' ? (
                        <>
                          <h2 className="matheng-card-title vi">{currentCard.vi}</h2>
                          <div className="matheng-card-en-echo">{currentCard.en}</div>
                          {currentCard.example && (
                            <div className="matheng-card-example">
                              "{currentCard.example}"
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <h2 className="matheng-card-title">{currentCard.en}</h2>
                          {currentCard.ipa && <div className="matheng-card-ipa">{currentCard.ipa}</div>}
                          <div className="matheng-card-vi-echo">{currentCard.vi}</div>
                          <button
                            type="button"
                            className="matheng-card-speak-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(currentCard.en, currentCard.id);
                            }}
                            title="Nghe phát âm"
                          >
                            <Volume2 size={20} />
                            <span>Nghe phát âm</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="matheng-flashcard-footer">
                      <span>Đã thành thạo {masteredCards.length} / {cardList.length} thuật ngữ</span>
                    </div>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="matheng-flashcard-nav">
                  <button type="button" className="matheng-nav-arrow-btn" onClick={prevCard} title="Thẻ trước [Phím ←]">
                    <ChevronLeft size={20} />
                    <span>Thẻ trước</span>
                  </button>
                  <button
                    type="button"
                    className="matheng-nav-flip-btn"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <RotateCcw size={16} />
                    <span>Lật thẻ (Space)</span>
                  </button>
                  <button type="button" className="matheng-nav-arrow-btn" onClick={nextCard} title="Thẻ tiếp theo [Phím →]">
                    <span>Thẻ kế tiếp</span>
                    <ChevronRight size={20} />
                  </button>
                  <button
                    type="button"
                    className={`matheng-tool-btn ${isCurrentMastered ? 'mastered' : ''}`}
                    onClick={() => toggleMastered(currentCard.id)}
                    title="Đánh dấu đã thuộc từ này"
                  >
                    <Check size={14} />
                    <span>{isCurrentMastered ? 'Đã thuộc ✓' : 'Đánh dấu đã thuộc'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathEng;
