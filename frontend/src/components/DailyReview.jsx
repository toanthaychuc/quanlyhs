import React, { useState, useEffect } from 'react';
import { Target, X, Check, ArrowRight, Play, BookOpen, AlertCircle } from 'lucide-react';
import { generateDailyReviewQuestions, submitDailyReviewAnswer } from '../services/dailyReviewService';
import MathView from './MathView';
import './DailyReview.css';

const DailyReview = ({ studentId, studentGrade }) => {
  const [reviewState, setReviewState] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  
  if (isLoading) {
    return (
      <div className="daily-review-card loading">
        <div className="spinner"></div>
        <span>Đang tải bài tập hôm nay...</span>
      </div>
    );
  }

  if (pendingQuestions.length === 0) {
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

  const handleStart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSelectOption = (key) => {
    if (showResult) return;
    setSelectedAnswer(key);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    const currentQ = pendingQuestions[currentIndex];
    const correct = selectedAnswer === currentQ.correctAnswer;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    // Ghi nhận vào localStorage
    const newState = submitDailyReviewAnswer(studentId, currentQ.id, correct);
    if (newState) {
      setReviewState(newState);
    }
  };

  const handleNext = () => {
    if (currentIndex < pendingQuestions.length - 1) {
      // Vì mảng pendingQuestions đã bị filter đi câu vừa rồi trong state, 
      // nhưng ở component này state pendingQuestions vẫn chưa cập nhật ngay lập tức nếu dùng index cũ.
      // Cần chú ý: vì submitDailyReviewAnswer thay đổi mảng pendingQuestions, currentIndex có thể bị lệch.
      // Cách an toàn nhất là luôn giữ currentIndex = 0 và lấy câu hỏi đầu tiên.
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsModalOpen(false);
    }
  };

  // Vì pendingQuestions bị thay đổi (xóa đi câu vừa làm) sau khi ấn Submit,
  // nên câu hỏi tiếp theo luôn luôn nằm ở vị trí index 0.
  const currentQ = pendingQuestions[0];

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
             <div className="dr-progress-fill" style={{ width: `${(10 - pendingQuestions.length) * 10}%` }}></div>
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
              <h3><BookOpen size={18}/> Ôn tập mỗi ngày</h3>
              <button className="close-btn" onClick={handleClose}><X size={20}/></button>
            </div>
            
            <div className="dr-modal-body">
              <div className="dr-question-reason">
                {currentQ.reviewReason === 'wrong' && <span className="badge warning"><AlertCircle size={14}/> Câu đã làm sai</span>}
                {currentQ.reviewReason === 'same_tag' && <span className="badge info">Cùng dạng với câu đã sai</span>}
                {currentQ.reviewReason === 'random' && <span className="badge plain">Câu hỏi ngẫu nhiên</span>}
              </div>

              <div className="dr-question-content">
                <MathView content={currentQ.content} />
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
                      <div className="dr-option-text"><MathView content={opt.text} /></div>
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
                      <MathView content={currentQ.explanation} />
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
                  {pendingQuestions.length > 1 ? 'Câu tiếp theo' : 'Hoàn thành'} <ArrowRight size={16}/>
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
