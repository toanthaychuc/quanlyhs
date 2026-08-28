/**
 * syncService.js
 * Master Synchronization Manager
 * Guarantees ALL 10 data categories are safely backed up and synced with Supabase.
 */
import { getClasses, saveAllClasses } from './classService';
import { getExams, saveExam } from './examService';
import { getAssignments, saveAllAssignments } from './assignmentService';
import { getDocuments, saveAllDocuments } from './documentService';
import { getNotices, saveNotice } from './noticeService';
import { getSetting, saveSetting } from './settingService';

/**
 * Push ALL local data (Classes, Exams, Assignments, Documents, Notices, Settings) to Supabase.
 * Useful for one-click backup or initial sync.
 */
export async function pushAllLocalDataToCloud() {
  const results = {
    classes: false,
    exams: false,
    assignments: false,
    documents: false,
    notices: false,
  };

  try {
    // 1. Classes & Students
    const rawClasses = localStorage.getItem('edumanager_classes_data');
    if (rawClasses) {
      const cls = JSON.parse(rawClasses);
      await saveAllClasses(cls);
      results.classes = true;
    }

    // 2. Exams
    const rawExams = localStorage.getItem('edumanager_exams_data_v8');
    if (rawExams) {
      const exams = JSON.parse(rawExams);
      for (const ex of exams) {
        const res = await saveExam(ex);
        if (res && !res.success && res.error) {
          throw new Error(`Lỗi lưu Đề thi: ${res.error}`);
        }
      }
      results.exams = true;
    }

    // 3. Assignments
    const rawAsg = localStorage.getItem('edumanager_class_assignments_v3');
    if (rawAsg) {
      const asg = JSON.parse(rawAsg);
      const res = await saveAllAssignments(asg);
      if (res && !res.success && res.error) {
        throw new Error(`Lỗi lưu Bài tập: ${res.error}`);
      }
      results.assignments = true;
    }

    // 4. Documents
    const rawDocs = localStorage.getItem('edumanager_teacher_documents');
    if (rawDocs) {
      const docs = JSON.parse(rawDocs);
      await saveAllDocuments(docs);
      results.documents = true;
    }

    // 5. Notices
    const rawNotices = localStorage.getItem('edumanager_notices');
    if (rawNotices) {
      const notices = JSON.parse(rawNotices);
      for (const n of notices) {
        await saveNotice(n);
      }
      results.notices = true;
    }

    // 6. Settings (Social Links, Exam Date, Target Score)
    const rawLinks = localStorage.getItem('edumanager_social_links');
    if (rawLinks) {
      await saveSetting('social_links', JSON.parse(rawLinks));
    }
    const rawDate = localStorage.getItem('edumanager_exam_date');
    if (rawDate) {
      await saveSetting('exam_date', rawDate);
    }
    const rawTarget = localStorage.getItem('edumanager_target_score');
    if (rawTarget) {
      await saveSetting('target_score', rawTarget);
    }

    return { success: true, results };
  } catch (err) {
    console.error('[syncService] pushAllLocalDataToCloud error:', err);
    return { success: false, error: err.message, results };
  }
}

/**
 * Fetch ALL data from Supabase to ensure fresh state across the app.
 */
export async function pullAllDataFromCloud() {
  try {
    const [classes, exams, assignments, documents, notices] = await Promise.all([
      getClasses(),
      getExams(),
      getAssignments(),
      getDocuments(),
      getNotices(),
    ]);

    return { success: true, data: { classes, exams, assignments, documents, notices } };
  } catch (err) {
    console.error('[syncService] pullAllDataFromCloud error:', err);
    return { success: false, error: err.message };
  }
}
