import React, { useState, useEffect } from 'react';
import { Target, X, Check, ArrowRight, Play, BookOpen, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateDailyReviewQuestions, submitDailyReviewAnswer } from '../services/dailyReviewService';
import { decodeQuestionId } from '../utils/idDecoder';
import MathView from './MathView';
import './DailyReview.css';

const DailyReview = ({ studentId, studentGrade }) => {
  const [reviewState, setReviewState] = useState(null);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!studentId) return;
    
    const loadQuestions = async () => {
      setIsLoading(true);
      const state = await generateDailyReviewQuestions(studentId, studentGrade);
      setReviewState(state);
      setIsLoading(false);
    };
    
    loadQuestions();
  }, [studentId, studentGrade]);

  const pendingQuestions = reviewState?.pendingQuestions || [];

  const handleStart = () => {
    setSessionQuestions([...pendingQuestions]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (location.state?.action === 'startDailyReview' && pendingQuestions.length > 0 && !isLoading) {
      // Clear the state so it doesn't reopen on refresh
      navigate(location.pathname, { replace: true, state: {} });
      handleStart();
    }
  }, [location.state, pendingQuestions, isLoading, navigate, location.pathname]);
  
  if (isLoading) {
    return (
      <div className="daily-review-card loading">
        <div className="spinner"></div>
        <span>Đang tải bài tập hôm nay...</span>
      </div>
    );
  }

  if (pendingQuestions.length === 0 && !isModalOpen) {
    return (
      <div className="daily-review-card empty">
        <div className="dr-icon-wrapper success">
          <Check size={24} />
        </div>
        <div className="dr-content">
          <h3>Ôn tập mỗi ngày</h3>
          <p>Tuyệt vời! Bạn đã hoàn thành tất cả bài ôn tập hôm nay.</p>
        </div>
      </div>
    );
  }

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSelectOption = (key) => {
    if (showResult) return;
    setSelectedAnswer(key);
  };

  const currentQ = sessionQuestions[currentIndex];

  const handleSubmit = () => {
    if (!selectedAnswer || !currentQ) return;
    
    const correct = selectedAnswer === currentQ.correctAnswer;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    // Ghi nhận vào localStorage nhưng sessionQuestions trong phiên vẫn giữ nguyên không bị dịch chuyển
    const newState = submitDailyReviewAnswer(studentId, currentQ.id, correct, currentQ.tags || []);
    if (newState) {
      setReviewState(newState);
    }
  };

  const handleNext = () => {
    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsModalOpen(false);
    }
  };

  const decodedTag = currentQ?.tags && currentQ.tags.length > 0 ? decodeQuestionId(currentQ.tags[0]) : null;

  return (
    <>
      <div className="daily-review-card">
        <div className="dr-icon-wrapper pending">
          <Target size={24} />
        </div>
        <div className="dr-content">
          <h3>Ôn tập mỗi ngày</h3>
          <p>Bạn có <strong>{pendingQuestions.length}</strong> câu hỏi cần ôn tập.</p>
          <div className="dr-progress-bar">
             <div 
               className="dr-progress-fill" 
               style={{ 
                 width: `${reviewState?.totalAssigned ? Math.max(0, ((reviewState.totalAssigned - pendingQuestions.length) / reviewState.totalAssigned) * 100) : 0}%` 
               }}
             ></div>
          </div>
        </div>
        <button className="dr-start-btn" onClick={handleStart}>
          <Play size={16} /> Bắt đầu
        </button>
      </div>

      {isModalOpen && currentQ && (
        <div className="dr-modal-overlay">
          <div className="dr-modal">
            <div className="dr-modal-header">
              <h3>
                <BookOpen size={18}/> Ôn tập mỗi ngày 
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '8px' }}>
                  (Câu {currentIndex + 1}/{sessionQuestions.length})
                </span>
              </h3>
              <button className="close-btn" onClick={handleClose}><X size={20}/></button>
            </div>
            
            <div className="dr-modal-body">
              <div className="dr-question-reason">
                {currentQ.reviewReason === 'failed_in_review' && (
                  <span className="badge danger"><AlertCircle size={14}/> Ôn lại: Câu đã làm sai hôm trước</span>
                )}
                {currentQ.reviewReason === 'same_tag_failed' && (
                  <span className="badge warning"><AlertCircle size={14}/> Cùng dạng với câu vừa sai hôm trước</span>
                )}
                {currentQ.reviewReason === 'wrong' && (
                  <span className="badge warning"><AlertCircle size={14}/> Câu đã làm sai trong đề thi</span>
                )}
                {currentQ.reviewReason === 'same_tag' && (
                  <span className="badge info"><AlertCircle size={14}/> Cùng dạng với câu đã sai</span>
                )}
                {currentQ.reviewReason === 'random' && (
                  <span className="badge plain">Câu hỏi ngẫu nhiên</span>
                )}
              </div>

              {decodedTag && decodedTag.subjectCode !== 'OTHER' && (
                <div className="dr-question-tags-info">
                  <span className="dr-tag-pill">
                    🏷️ {decodedTag.subjectName} • {decodedTag.chapter} • {decodedTag.lesson} {decodedTag.format ? `• ${decodedTag.format}` : ''}
                  </span>
                  {decodedTag.level && <span className="dr-level-pill">{decodedTag.level}</span>}
                </div>
              )}

              <div className="dr-question-content">
                {currentQ.clusterContext && (
                  <div className="dr-cluster-context-box">
                    <div className="dr-cluster-context-badge">Dữ liệu bài toán:</div>
                    <MathView text={currentQ.clusterContext} />
                  </div>
                )}
                <MathView text={currentQ.content} />
              </div>

              <div className="dr-options-grid">
                {(currentQ.options || []).map((opt) => {
                  let className = "dr-option";
                  if (selectedAnswer === opt.key) className += " selected";
                  
                  if (showResult) {
                    if (opt.key === currentQ.correctAnswer) {
                      className += " correct";
                    } else if (selectedAnswer === opt.key && !isCorrect) {
                      className += " incorrect";
                    }
                  }

                  return (
                    <button 
                      key={opt.key}
                      className={className}
                      onClick={() => handleSelectOption(opt.key)}
                      disabled={showResult}
                    >
                      <span className="dr-option-label">{opt.key}</span>
                      <div className="dr-option-text"><MathView text={opt.text} /></div>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className={`dr-result-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? (
                    <div className="feedback-title"><Check size={20}/> Chính xác!</div>
                  ) : (
                    <div className="feedback-title"><X size={20}/> Chưa chính xác. Đáp án đúng là {currentQ.correctAnswer}.</div>
                  )}
                  {currentQ.explanation && (
                    <div className="dr-explanation">
                      <strong>Lời giải:</strong>
                      <MathView text={currentQ.explanation} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="dr-modal-footer">
              {!showResult ? (
                <button 
                  className="dr-submit-btn" 
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                >
                  Kiểm tra
                </button>
              ) : (
                <button className="dr-next-btn" onClick={handleNext}>
                  {currentIndex < sessionQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'} <ArrowRight size={16}/>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DailyReview;
