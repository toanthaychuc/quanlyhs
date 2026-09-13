/**
 * analyticsUtils.js
 * Utility to calculate student analytics based on their exam sessions and tags.
 */

import { decodeTags } from './idDecoder';

/**
 * Compute tag-based stats from a student's history.
 * @param {Object} history - Map of examId to an array of session objects.
 * @param {Array} allExamsList - List of all exams containing questions.
 * @returns {Object} - Aggregated stats for subjects (Đại số, Hình học) and lessons.
 */
export function computeStudentAnalytics(history, allExamsList) {
  let stats = {
    bySubject: {}, // { "D": { total: 0, correct: 0, name: "Đại số" }, "H": { ... } }
    byTopic: {},   // { "D1-1": { total: 0, correct: 0, subject: "D", lesson: "Chương 1 Bài 1" } }
  };

  if (!history || !allExamsList) return stats;

  const examsMap = {};
  allExamsList.forEach(e => {
    examsMap[e.id] = e;
  });

  // Loop through all exam sessions
  Object.keys(history).forEach(examId => {
    const exam = examsMap[examId];
    if (!exam || !exam.questions) return;

    const sessions = history[examId];
    // Take the best or latest session? Let's take all sessions to see overall accuracy,
    // or just the latest session. Let's use the latest session for each exam to avoid duplicate counts.
    // Assuming sessions are sorted by submitted_at descending (latest first)
    const latestSession = sessions[0];
    if (!latestSession || !latestSession.answers) return;

    const userAnswers = latestSession.answers;

    exam.questions.forEach(q => {
      if (!q.tags || q.tags.length === 0) return;

      // Determine correctness
      let isCorrect = false;
      const uAns = userAnswers[q.id];

      if (q.questionType === 'true_false') {
        let subCorrect = 0;
        (q.options || []).forEach(opt => {
          const expected = opt.isCorrectTrue ? 'T' : 'F';
          if (uAns?.[opt.key] === expected) subCorrect++;
        });
        if (subCorrect === 4) isCorrect = true;
      } else if (q.questionType === 'short_answer') {
        const cleanUser = String(uAns || '').trim().replace(/,/g, '.');
        const cleanTarget = String(q.correctAnswer || '').trim().replace(/,/g, '.');
        if (cleanUser === cleanTarget && cleanTarget !== '') isCorrect = true;
      } else {
        if (uAns === q.correctAnswer && q.correctAnswer) isCorrect = true;
      }

      const decodedTags = decodeTags(q.tags);
      decodedTags.forEach(tagInfo => {
        // Accumulate Subject Stats
        const subjCode = tagInfo.subjectCode;
        if (subjCode === 'D' || subjCode === 'H') {
          if (!stats.bySubject[subjCode]) {
            stats.bySubject[subjCode] = { total: 0, correct: 0, name: tagInfo.subjectName };
          }
          stats.bySubject[subjCode].total += 1;
          if (isCorrect) stats.bySubject[subjCode].correct += 1;
        }

        // Accumulate Topic Stats (for specific weak areas)
        const topicGroup = tagInfo.topicGroup;
        if (!stats.byTopic[topicGroup] && (subjCode === 'D' || subjCode === 'H')) {
          stats.byTopic[topicGroup] = { 
            total: 0, 
            correct: 0, 
            subject: subjCode, 
            label: `${tagInfo.chapter} - ${tagInfo.lesson}` 
          };
        }
        if (stats.byTopic[topicGroup]) {
          stats.byTopic[topicGroup].total += 1;
          if (isCorrect) stats.byTopic[topicGroup].correct += 1;
        }
      });
    });
  });

  return stats;
}

/**
 * Determine the weakest topics for recommendation.
 */
export function getWeakTopics(stats, limit = 3) {
  const weak = [];
  Object.keys(stats.byTopic).forEach(topicId => {
    const data = stats.byTopic[topicId];
    if (data.total >= 3) { // Only consider topics with at least 3 attempts
      const accuracy = data.correct / data.total;
      weak.push({ topicId, ...data, accuracy });
    }
  });

  // Sort ascending by accuracy, then descending by total attempts
  weak.sort((a, b) => {
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
    return b.total - a.total;
  });

  return weak.slice(0, limit);
}

/**
 * Compute tag-based stats for an entire class.
 * @param {Object} allSessions - Map of examId to array of sessions from ALL students.
 * @param {Array} allExamsList - List of all exams.
 * @param {String} classId - The class ID to filter by.
 */
export function computeClassAnalytics(allSessions, allExamsList, classId) {
  let stats = {
    bySubject: {},
    byTopic: {},
  };

  if (!allSessions || !allExamsList) return stats;

  const examsMap = {};
  allExamsList.forEach(e => {
    examsMap[e.id] = e;
  });

  Object.keys(allSessions).forEach(examId => {
    const exam = examsMap[examId];
    if (!exam || !exam.questions) return;

    const sessions = allSessions[examId];
    // Filter sessions by classId if provided
    const classSessions = classId ? sessions.filter(s => s.classId === classId || !s.classId) : sessions;
    
    // To avoid duplicates, we should take the latest session per student
    const studentLatest = {};
    classSessions.forEach(s => {
      // Assuming sessions are sorted by date descending, the first one we see for a student is the latest.
      // But just in case, we can simply keep the first one.
      if (!studentLatest[s.studentId]) {
        studentLatest[s.studentId] = s;
      }
    });

    Object.values(studentLatest).forEach(session => {
      const userAnswers = session.answers || {};

      exam.questions.forEach(q => {
        if (!q.tags || q.tags.length === 0) return;

        let isCorrect = false;
        const uAns = userAnswers[q.id];

        if (q.questionType === 'true_false') {
          let subCorrect = 0;
          (q.options || []).forEach(opt => {
            const expected = opt.isCorrectTrue ? 'T' : 'F';
            if (uAns?.[opt.key] === expected) subCorrect++;
          });
          if (subCorrect === 4) isCorrect = true;
        } else if (q.questionType === 'short_answer') {
          const cleanUser = String(uAns || '').trim().replace(/,/g, '.');
          const cleanTarget = String(q.correctAnswer || '').trim().replace(/,/g, '.');
          if (cleanUser === cleanTarget && cleanTarget !== '') isCorrect = true;
        } else {
          if (uAns === q.correctAnswer && q.correctAnswer) isCorrect = true;
        }

        const decodedTags = decodeTags(q.tags);
        decodedTags.forEach(tagInfo => {
          const subjCode = tagInfo.subjectCode;
          if (subjCode === 'D' || subjCode === 'H') {
            if (!stats.bySubject[subjCode]) {
              stats.bySubject[subjCode] = { total: 0, correct: 0, name: tagInfo.subjectName };
            }
            stats.bySubject[subjCode].total += 1;
            if (isCorrect) stats.bySubject[subjCode].correct += 1;
          }

          const topicGroup = tagInfo.topicGroup;
          if (!stats.byTopic[topicGroup] && (subjCode === 'D' || subjCode === 'H')) {
            stats.byTopic[topicGroup] = { 
              total: 0, 
              correct: 0, 
              subject: subjCode, 
              label: `${tagInfo.chapter} - ${tagInfo.lesson}` 
            };
          }
          if (stats.byTopic[topicGroup]) {
            stats.byTopic[topicGroup].total += 1;
            if (isCorrect) stats.byTopic[topicGroup].correct += 1;
          }
        });
      });
    });
  });

  return stats;
}
