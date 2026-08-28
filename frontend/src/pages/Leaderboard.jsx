import React, { useState, useEffect, useMemo } from 'react';
import { Award, Trophy, Medal, Search, Filter } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import StudentName from '../components/StudentName';
import './Leaderboard.css';

const Leaderboard = () => {
  const { isTeacher, currentStudentId } = useRole();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [examHistory, setExamHistory] = useState({});
  const [gamificationMap, setGamificationMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Tải danh sách lớp
    const savedClasses = localStorage.getItem('edumanager_classes_data');
    let loadedClasses = [];
    if (savedClasses) {
      try {
        loadedClasses = JSON.parse(savedClasses);
        setClasses(loadedClasses);
      } catch (e) {
        console.error(e);
      }
    }

    // Tải lịch sử thi
    const historyKey = 'edumanager_completed_exams';
    const historyAll = JSON.parse(localStorage.getItem(historyKey) || '{}');
    setExamHistory(historyAll);

    // Tải dữ liệu Gamification (XP, Streak)
    const gamiKey = 'edumanager_gamification';
    const gamiAll = JSON.parse(localStorage.getItem(gamiKey) || '{}');
    setGamificationMap(gamiAll);

    // Xác định lớp được chọn mặc định
    if (loadedClasses.length > 0) {
      if (!isTeacher && currentStudentId) {
        const studentClass = loadedClasses.find(cls => 
          (cls.students || []).some(s => s.id === currentStudentId)
        );
        if (studentClass) {
          setSelectedClassId(studentClass.id);
        }
      } else {
        setSelectedClassId(loadedClasses[0].id);
      }
    }
  }, [isTeacher, currentStudentId]);

  const activeClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  const rankedStudents = useMemo(() => {
    if (!activeClass || !activeClass.students) return [];

    const studentsWithScore = activeClass.students.map(student => {
      const studentHistory = examHistory[student.id] || {};
      const completedCount = Object.keys(studentHistory).length;
      
      const gami = gamificationMap[student.id] || { xp: 0, badges: [] };
      const xp = gami.xp || 0;
      const badges = gami.badges || [];

      return {
        ...student,
        completedCount,
        xp,
        badges
      };
    });

    // Xếp hạng: XP cao nhất xếp trên, nếu bằng nhau thì theo completedCount, bằng nữa thì theo tên
    studentsWithScore.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
      return (a.name || '').localeCompare(b.name || '');
    });

    // Đánh số thứ hạng (đồng hạng nếu cùng điểm XP và số bài làm)
    let currentRank = 1;
    let prevStudentStr = null;
    let tieCount = 0;

    return studentsWithScore.map((student, index) => {
      const currentStr = `${student.xp}-${student.completedCount}`;
      if (currentStr !== prevStudentStr) {
        currentRank = currentRank + tieCount;
        prevStudentStr = currentStr;
        tieCount = 1;
        if (index === 0) currentRank = 1;
      } else {
        tieCount++;
      }
      
      return {
        ...student,
        rank: currentRank
      };
    });
  }, [activeClass, examHistory, gamificationMap]);

  const filteredRankings = useMemo(() => {
    if (!searchTerm) return rankedStudents;
    return rankedStudents.filter(s => 
      (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rankedStudents, searchTerm]);

  const getRankBadge = (rank) => {
    switch(rank) {
      case 1:
        return <div className="rank-badge gold"><Trophy size={16} /> Hạng 1</div>;
      case 2:
        return <div className="rank-badge silver"><Medal size={16} /> Hạng 2</div>;
      case 3:
        return <div className="rank-badge bronze"><Medal size={16} /> Hạng 3</div>;
      default:
        return <div className="rank-badge normal">#{rank}</div>;
    }
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <div className="title-area">
          <h1>
            <Award className="text-primary" size={28} />
            Bảng Xếp Hạng Học Tập
          </h1>
          <p className="subtitle">
            Dựa trên số lượng bài tập và đề thi đã hoàn thành trên hệ thống.
          </p>
        </div>

        {isTeacher && classes.length > 0 && (
          <div className="class-selector">
            <Filter size={16} className="text-gray-500" />
            <select 
              className="input" 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name} ({cls.schoolFullName})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!activeClass ? (
        <div className="empty-state">
          <h3>Không tìm thấy dữ liệu lớp học</h3>
        </div>
      ) : (
        <div className="leaderboard-content">
          {/* Top 3 Podium (Optional to display beautifully) */}
          {rankedStudents.length > 0 && !searchTerm && (
            <div className="podium-container">
              {/* Hạng 2 */}
              {rankedStudents.find(s => s.rank === 2) && (
                <div className="podium-item silver">
                  <div className="podium-avatar">
                    {rankedStudents.find(s => s.rank === 2).name.charAt(0)}
                  </div>
                  <div className="podium-name"><StudentName studentId={rankedStudents.find(s => s.rank === 2).id} name={rankedStudents.find(s => s.rank === 2).name} /></div>
                  <div className="podium-score" style={{color: '#ca8a04'}}>{rankedStudents.find(s => s.rank === 2).xp} XP</div>
                  <div className="podium-step step-2">2</div>
                </div>
              )}
              {/* Hạng 1 */}
              {rankedStudents.find(s => s.rank === 1) && (
                <div className="podium-item gold">
                  <div className="podium-avatar">
                    {rankedStudents.find(s => s.rank === 1).name.charAt(0)}
                    <Trophy className="crown-icon" size={20} />
                  </div>
                  <div className="podium-name"><StudentName studentId={rankedStudents.find(s => s.rank === 1).id} name={rankedStudents.find(s => s.rank === 1).name} /></div>
                  <div className="podium-score" style={{color: '#ca8a04'}}>{rankedStudents.find(s => s.rank === 1).xp} XP</div>
                  <div className="podium-step step-1">1</div>
                </div>
              )}
              {/* Hạng 3 */}
              {rankedStudents.find(s => s.rank === 3) && (
                <div className="podium-item bronze">
                  <div className="podium-avatar">
                    {rankedStudents.find(s => s.rank === 3).name.charAt(0)}
                  </div>
                  <div className="podium-name">{rankedStudents.find(s => s.rank === 3).name}</div>
                  <div className="podium-score" style={{color: '#ca8a04'}}>{rankedStudents.find(s => s.rank === 3).xp} XP</div>
                  <div className="podium-step step-3">3</div>
                </div>
              )}
            </div>
          )}

          {/* Search bar */}
          <div className="toolbar">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                className="input" 
                placeholder="Tìm kiếm học sinh..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="total-info">
              Sĩ số: <strong>{activeClass.students?.length || 0} học sinh</strong>
            </div>
          </div>

          {/* List */}
          <div className="ranking-list">
            {filteredRankings.length > 0 ? (
              <div className="table-responsive">
                <table className="ranking-table">
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>Thứ Hạng</th>
                    <th>Học Sinh</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Mã HS</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Kinh Nghiệm</th>
                    <th style={{ width: '150px', textAlign: 'center' }}>Đã Hoàn Thành</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRankings.map(student => {
                    const isMe = !isTeacher && student.id === currentStudentId;
                    return (
                      <tr key={student.id} className={isMe ? 'my-row-highlight' : ''}>
                        <td>{getRankBadge(student.rank)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="student-mini-avatar">
                              {student.name ? student.name.charAt(student.name.lastIndexOf(' ') + 1) || student.name.charAt(0) : 'H'}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <StudentName 
                                studentId={student.id} 
                                name={student.name} 
                                style={{ fontWeight: isMe ? '700' : '600', color: isMe ? '#1e40af' : 'inherit' }} 
                              />
                              {isMe && <span style={{ marginLeft: '6px', fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', verticalAlign: 'middle' }}>Bạn</span>}
                              {student.badges && student.badges.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                                  {student.badges.map((b, i) => (
                                    <span key={i} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>
                                      🏅 {b}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          {isTeacher || isMe ? (
                            student.id
                          ) : (
                            <span style={{ fontSize: '0.775rem', color: '#9ca3af' }}>🔒 Ẩn</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '800', color: '#ca8a04' }}>
                          {student.xp} <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ca8a04' }}>XP</span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#059669' }}>
                          {student.completedCount} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>bài</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                Không tìm thấy học sinh nào.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
