/**
 * idDecoder.js
 * Utility to decode standard LaTeX question IDs (e.g., "1D1H5-5")
 * Format: [Grade][Subject][Chapter][Level][Lesson]-[Format]
 */

const GRADE_MAP = {
  '6': 'Lớp 6',
  '7': 'Lớp 7',
  '8': 'Lớp 8',
  '9': 'Lớp 9',
  '0': 'Lớp 10',
  '1': 'Lớp 11',
  '2': 'Lớp 12',
};

const SUBJECT_MAP = {
  'D': 'Đại số / Giải tích',
  'H': 'Hình học',
  'C': 'Chuyên đề',
};

const LEVEL_MAP = {
  'Y': 'Nhận biết (Yếu)',
  'N': 'Nhận biết',
  'B': 'Thông hiểu', // Sometimes B is used instead of H for Basic? Let's use H & B
  'H': 'Thông hiểu',
  'V': 'Vận dụng',
  'K': 'Vận dụng', // Khá
  'C': 'Vận dụng cao',
  'G': 'Vận dụng cao', // Giỏi
};

export function decodeQuestionId(idStr) {
  if (!idStr || typeof idStr !== 'string') return null;
  
  // Format typically: 1D1H5-5 or 2H3V1-2
  // We can use a regex to safely extract the parts if it matches the pattern
  const match = idStr.trim().match(/^([0-9])([DHC])([0-9])([YNBHVKCG])([0-9]+)-([0-9]+)$/i);
  
  if (match) {
    const [_, gradeCode, subCode, chapterCode, levelCode, lessonCode, formatCode] = match;
    const subUpper = subCode.toUpperCase();
    return {
      raw: idStr,
      grade: GRADE_MAP[gradeCode] || `Lớp ? (${gradeCode})`,
      subjectCode: subUpper,
      subjectName: SUBJECT_MAP[subUpper] || 'Khác',
      chapter: `Chương ${chapterCode}`,
      level: LEVEL_MAP[levelCode.toUpperCase()] || `Mức độ ${levelCode}`,
      lesson: `Bài ${lessonCode}`,
      format: `Dạng ${formatCode}`,
      // For grouping stats:
      categoryGroup: `${subUpper}`, // "D" or "H"
      topicGroup: `${subUpper}${chapterCode}-${lessonCode}` // e.g. D1-5
    };
  }

  // Fallback for non-standard IDs (if any)
  return {
    raw: idStr,
    subjectCode: 'OTHER',
    subjectName: 'Khác',
    categoryGroup: 'OTHER'
  };
}

/**
 * Extracts and decodes all valid tags from an array of strings
 */
export function decodeTags(tagsArray) {
  if (!Array.isArray(tagsArray)) return [];
  return tagsArray.map(decodeQuestionId).filter(Boolean);
}
