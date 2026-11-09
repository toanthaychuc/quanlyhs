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
  GraduationCap, 
  ArrowRightLeft,
  Lightbulb
} from 'lucide-react';
import { 
  MATH_CATEGORIES, 
  CLASSROOM_PHRASE_CATEGORIES, 
  CLASSROOM_PHRASES, 
  MATH_VOCABULARY, 
  MATH_FLASHCARDS 
} from '../data/mathEnglishData';
import './MathEng.css';

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
  // Navigation Tabs: 'vocab' | 'classroom' | 'flashcard'
  const [activeTab, setActiveTab] = useState('vocab');

  // Vocabulary States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(60);
  const [savedTerms, setSavedTerms] = useState(() => {
    try {
      const stored = localStorage.getItem('matheng_saved_terms');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Classroom English States
  const [phraseSearchQuery, setPhraseSearchQuery] = useState('');
  const [selectedPhraseCat, setSelectedPhraseCat] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all'); // 'all' | 'Teacher' | 'Student'

  // Flashcards States
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardList, setCardList] = useState(MATH_FLASHCARDS);
  const [cardDirection, setCardDirection] = useState('en-first'); // 'en-first' | 'vi-first'
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
    const qNorm = normalizeText(phraseSearchQuery.trim());

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
  }, [phraseSearchQuery, selectedPhraseCat, selectedRole]);

  // Flashcards navigation
  const currentCard = cardList[cardIndex] || cardList[0];
  const isCurrentMastered = currentCard && masteredCards.includes(currentCard.id);

  const nextCard = useCallback(() => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % cardList.length);
  }, [cardList.length]);

  const prevCard = useCallback(() => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + cardList.length) % cardList.length);
  }, [cardList.length]);

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
    <div className="matheng-container">
      {/* Top Banner Header */}
      <header className="matheng-header">
        <div className="matheng-header-title-wrapper">
          <div className="matheng-icon-badge">
            <Languages size={28} />
          </div>
          <div>
            <h1 className="matheng-main-title">
              Toán - Eng <span className="matheng-title-tag">English for Mathematics</span>
            </h1>
            <p className="matheng-subtitle">
              Tra cứu thuật ngữ Toán học chuẩn quốc tế & Các câu lệnh giao tiếp lớp học song ngữ Anh - Việt
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="matheng-mode-tabs">
          <button
            className={`matheng-mode-tab ${activeTab === 'vocab' ? 'active' : ''}`}
            onClick={() => setActiveTab('vocab')}
          >
            <BookOpen size={17} />
            <span>Thuật ngữ Toán học</span>
            <span className="matheng-tab-count">{MATH_VOCABULARY.length}</span>
          </button>
          <button
            className={`matheng-mode-tab ${activeTab === 'classroom' ? 'active' : ''}`}
            onClick={() => setActiveTab('classroom')}
          >
            <Users size={17} />
            <span>Giao tiếp lớp học</span>
            <span className="matheng-tab-count">{CLASSROOM_PHRASES.length}</span>
          </button>
          <button
            className={`matheng-mode-tab ${activeTab === 'flashcard' ? 'active' : ''}`}
            onClick={() => setActiveTab('flashcard')}
          >
            <Sparkles size={17} />
            <span>Thẻ ghi nhớ</span>
            <span className="matheng-tab-count">{MATH_FLASHCARDS.length}</span>
          </button>
        </div>
      </header>

      {/* ======================= TAB 1: MATH VOCABULARY ======================= */}
      {activeTab === 'vocab' && (
        <div className="matheng-vocab-section">
          {/* Controls Bar: Search & Direction & Bookmarks */}
          <div className="matheng-search-box-card">
            <div className="matheng-search-input-wrapper">
              <Search size={18} className="matheng-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="matheng-search-input"
                placeholder="Tra cứu từ vựng toán (VD: hypotenuse, đạo hàm, tam giác, asymptote, prime...)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayLimit(60);
                }}
              />
              {searchQuery && (
                <button
                  className="matheng-clear-btn"
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

            <button
              className={`matheng-bookmark-toggle-btn ${showOnlySaved ? 'active' : ''}`}
              onClick={() => {
                setShowOnlySaved(!showOnlySaved);
                setDisplayLimit(60);
              }}
              title="Chỉ hiển thị các từ vựng đã đánh dấu yêu thích"
            >
              <BookmarkCheck size={16} />
              <span>Đã lưu ({savedTerms.length})</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="matheng-categories-bar">
            {MATH_CATEGORIES.map((cat) => {
              const IconComp = CATEGORY_ICON_MAP[cat.id] || Layers;
              const isActive = selectedCategory === cat.id;
              const count = cat.id === 'all' 
                ? MATH_VOCABULARY.length 
                : MATH_VOCABULARY.filter((t) => t.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  className={`matheng-cat-pill ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setDisplayLimit(60);
                  }}
                  title={cat.desc}
                >
                  <IconComp size={15} />
                  <span>{cat.name}</span>
                  <span className="matheng-cat-pill-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Results Summary Bar */}
          <div className="matheng-results-meta">
            <span>
              Tìm thấy <strong>{filteredVocabulary.length}</strong> thuật ngữ
              {selectedCategory !== 'all' && ` • Lĩnh vực: ${MATH_CATEGORIES.find((c) => c.id === selectedCategory)?.name}`}
              {showOnlySaved && ' • Danh sách đã lưu'}
            </span>
            {(searchQuery || selectedCategory !== 'all' || showOnlySaved) && (
              <button
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
          </div>

          {/* Vocabulary Cards Grid */}
          {filteredVocabulary.length > 0 ? (
            <>
              <div className="matheng-vocab-grid">
                {visibleVocabulary.map((term) => {
                  const isSaved = savedTerms.includes(term.id);
                  const isSpeaking = speakingId === term.id;
                  const isCopied = copiedId === term.id;
                  const catMeta = MATH_CATEGORIES.find((c) => c.id === term.category) || MATH_CATEGORIES[0];
                  const IconComp = CATEGORY_ICON_MAP[term.category] || Layers;

                  return (
                    <div key={term.id} className="matheng-term-card">
                      {/* Card Header: Category Badge, Audio & Actions */}
                      <div className="matheng-term-card-header">
                        <span className={`matheng-term-cat-badge cat-${term.category}`}>
                          <IconComp size={12} />
                          {catMeta.name}
                        </span>
                        <div className="matheng-term-actions">
                          <button
                            className={`matheng-icon-action-btn ${isSpeaking ? 'active' : ''}`}
                            onClick={() => speakText(term.en, term.id)}
                            title="Phát âm tiếng Anh chuẩn"
                          >
                            <Volume2 size={16} />
                          </button>
                          <button
                            className="matheng-icon-action-btn"
                            onClick={() => handleCopy(`${term.en}: ${term.vi}`, term.id)}
                            title="Sao chép thuật ngữ"
                          >
                            {isCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                          </button>
                          <button
                            className={`matheng-icon-action-btn ${isSaved ? 'saved' : ''}`}
                            onClick={() => toggleSaveTerm(term.id)}
                            title={isSaved ? 'Bỏ lưu' : 'Lưu vào từ vựng cần ôn'}
                          >
                            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Main Term: English & Vietnamese side-by-side */}
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

                      {/* Example Sentence */}
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

                      {/* Subterms / Collocations (if any) */}
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
                    onClick={() => setDisplayLimit((prev) => prev + 60)}
                  >
                    <ChevronDown size={18} />
                    <span>
                      Xem thêm 60 thuật ngữ (Đang hiển thị {visibleVocabulary.length}/{filteredVocabulary.length})
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="matheng-empty-state">
              <Languages size={48} className="matheng-empty-icon" />
              <h3>Không tìm thấy thuật ngữ phù hợp</h3>
              <p>Hãy thử kiểm tra lại từ khóa hoặc chọn xem lại tất cả danh mục.</p>
              <button
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
          )}
        </div>
      )}

      {/* ======================= TAB 2: CLASSROOM ENGLISH ======================= */}
      {activeTab === 'classroom' && (
        <div className="matheng-classroom-section">
          {/* Header intro card */}
          <div className="matheng-classroom-intro-card">
            <div className="matheng-intro-icon">
              <GraduationCap size={28} />
            </div>
            <div>
              <h3>Câu lệnh & Giao tiếp trong lớp học Toán song ngữ</h3>
              <p>
                Tuyển tập các mẫu câu chuẩn xác mà giáo viên và học sinh bản ngữ sử dụng thường nhật: 
                từ chia nhóm, quy định giờ làm bài, hiệu lệnh lên bảng đến các lời nhắc nhở kỹ năng giải toán.
              </p>
            </div>
          </div>

          {/* Search & Role Filter Bar */}
          <div className="matheng-search-box-card">
            <div className="matheng-search-input-wrapper">
              <Search size={18} className="matheng-search-icon" />
              <input
                type="text"
                className="matheng-search-input"
                placeholder="Tìm câu lệnh lớp học (VD: nhóm đôi, hết giờ, lên bảng, rút gọn, dấu trừ...)"
                value={phraseSearchQuery}
                onChange={(e) => setPhraseSearchQuery(e.target.value)}
              />
              {phraseSearchQuery && (
                <button
                  className="matheng-clear-btn"
                  onClick={() => setPhraseSearchQuery('')}
                  title="Xóa tìm kiếm"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <div className="matheng-direction-toggle">
              <button
                className={`matheng-dir-btn ${selectedRole === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedRole('all')}
              >
                Tất cả đối tượng
              </button>
              <button
                className={`matheng-dir-btn ${selectedRole === 'Teacher' ? 'active' : ''}`}
                onClick={() => setSelectedRole('Teacher')}
              >
                👨‍🏫 Giáo viên dùng ({CLASSROOM_PHRASES.filter((p) => p.role === 'Teacher').length})
              </button>
              <button
                className={`matheng-dir-btn ${selectedRole === 'Student' ? 'active' : ''}`}
                onClick={() => setSelectedRole('Student')}
              >
                🎒 Học sinh dùng ({CLASSROOM_PHRASES.filter((p) => p.role === 'Student').length})
              </button>
            </div>
          </div>

          {/* Scenario Tabs */}
          <div className="matheng-categories-bar">
            <button
              className={`matheng-cat-pill ${selectedPhraseCat === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedPhraseCat('all')}
            >
              <Layers size={15} />
              <span>Tất cả tình huống</span>
              <span className="matheng-cat-pill-count">{CLASSROOM_PHRASES.length}</span>
            </button>
            {CLASSROOM_PHRASE_CATEGORIES.map((cat) => {
              const IconComp = CATEGORY_ICON_MAP[cat.id] || MessageCircle;
              const isActive = selectedPhraseCat === cat.id;
              const count = CLASSROOM_PHRASES.filter((p) => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  className={`matheng-cat-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedPhraseCat(cat.id)}
                  title={cat.desc}
                >
                  <IconComp size={15} />
                  <span>{cat.name}</span>
                  <span className="matheng-cat-pill-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Phrases Grid */}
          {filteredPhrases.length > 0 ? (
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
                          className={`matheng-icon-action-btn ${isSpeaking ? 'active' : ''}`}
                          onClick={() => speakText(phrase.en, phrase.id)}
                          title="Phát âm câu khẩu lệnh"
                        >
                          <Volume2 size={16} />
                        </button>
                        <button
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

                    {/* Context & Pedagogical Tip */}
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
                className="matheng-reset-filter-btn primary"
                onClick={() => {
                  setPhraseSearchQuery('');
                  setSelectedPhraseCat('all');
                  setSelectedRole('all');
                }}
              >
                Xem lại toàn bộ câu khẩu lệnh
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 3: FLASHCARDS ======================= */}
      {activeTab === 'flashcard' && currentCard && (
        <div className="matheng-flashcards-section">
          {/* Controls Bar */}
          <div className="matheng-flashcard-controls-bar">
            <div className="matheng-flashcard-progress">
              <span>Thẻ <strong>{cardIndex + 1}</strong> / {cardList.length}</span>
              <div className="matheng-progress-track">
                <div 
                  className="matheng-progress-fill" 
                  style={{ width: `${((cardIndex + 1) / cardList.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="matheng-flashcard-toolbar">
              <button
                className="matheng-tool-btn"
                onClick={() => setCardDirection(cardDirection === 'en-first' ? 'vi-first' : 'en-first')}
                title="Đổi mặt thẻ bắt đầu"
              >
                <ArrowRightLeft size={14} />
                <span>Mặt trước: {cardDirection === 'en-first' ? 'Tiếng Anh' : 'Tiếng Việt'}</span>
              </button>
              <button
                className="matheng-tool-btn"
                onClick={shuffleCards}
                title="Xáo trộn ngẫu nhiên bộ thẻ"
              >
                <Shuffle size={14} />
                <span>Xáo thẻ</span>
              </button>
              <button
                className={`matheng-tool-btn ${isCurrentMastered ? 'mastered' : ''}`}
                onClick={() => toggleMastered(currentCard.id)}
                title="Đánh dấu đã thuộc từ này"
              >
                <Check size={14} />
                <span>{isCurrentMastered ? 'Đã thuộc ✓' : 'Đánh dấu đã thuộc'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Flip Card Container */}
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
            <button className="matheng-nav-arrow-btn" onClick={prevCard} title="Thẻ trước [Phím ←]">
              <ChevronLeft size={20} />
              <span>Thẻ trước</span>
            </button>
            <button
              className="matheng-nav-flip-btn"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <RotateCcw size={16} />
              <span>Lật thẻ (Space)</span>
            </button>
            <button className="matheng-nav-arrow-btn" onClick={nextCard} title="Thẻ tiếp theo [Phím →]">
              <span>Thẻ kế tiếp</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathEng;
