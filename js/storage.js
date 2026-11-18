/**
 * Storage Layer with Multi-Branch Support & LocalStorage Persistence
 * Manages 5 PSIS Branches independently with branch switching.
 */

const PSIS_Storage = (() => {
  const CURRENT_BRANCH_KEY = 'psis_active_branch_id_v6';

  function getCurrentBranchId() {
    return localStorage.getItem(CURRENT_BRANCH_KEY) || null;
  }

  function setCurrentBranchId(branchId) {
    if (branchId) {
      localStorage.setItem(CURRENT_BRANCH_KEY, branchId);
    } else {
      localStorage.removeItem(CURRENT_BRANCH_KEY);
    }
  }

  function getBranches() {
    return PSIS_BRANCHES;
  }

  function getBranchById(id) {
    return PSIS_BRANCHES.find(b => b.id === id) || PSIS_BRANCHES[0];
  }

  // Branch-specific storage key generator
  function getKey(type, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    return `psis_${bId}_${type}_v6`;
  }

  // Init storage for a branch if not already existing
  function initBranchStorage(branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';

    const teachersKey = getKey('teachers', bId);
    const schedulesKey = getKey('schedules', bId);
    const schoolInfoKey = getKey('school_info', bId);
    const checklistsKey = getKey('checklists', bId);

    if (!localStorage.getItem(teachersKey)) {
      const teachers = PSIS_SAMPLE_DATA.getTeachersForBranch(bId);
      localStorage.setItem(teachersKey, JSON.stringify(teachers));
    }

    if (!localStorage.getItem(schedulesKey)) {
      const teachers = JSON.parse(localStorage.getItem(teachersKey));
      const schedules = PSIS_SAMPLE_DATA.getSchedulesForBranch(bId, teachers);
      localStorage.setItem(schedulesKey, JSON.stringify(schedules));
    }

    if (!localStorage.getItem(schoolInfoKey)) {
      const info = PSIS_SAMPLE_DATA.getSchoolInfoForBranch(bId);
      localStorage.setItem(schoolInfoKey, JSON.stringify(info));
    }

    if (!localStorage.getItem(checklistsKey)) {
      const checklists = {};
      const today = new Date().toISOString().split('T')[0];
      const demoDate = '2026-10-05';

      const schedules = JSON.parse(localStorage.getItem(schedulesKey));
      const teachers = JSON.parse(localStorage.getItem(teachersKey));

      checklists[today] = PSIS_SAMPLE_DATA.createDefaultChecklistForDate(today, schedules, teachers);
      if (today !== demoDate) {
        checklists[demoDate] = PSIS_SAMPLE_DATA.createDefaultChecklistForDate(demoDate, schedules, teachers);
      }
      localStorage.setItem(checklistsKey, JSON.stringify(checklists));
    }
  }

  function cleanClassGrade(str) {
    if (!str) return '';
    return String(str).replace(/^ថ្នាក់ទី\s*/g, '').trim();
  }

  // Teachers
  function getTeachers(branchId) {
    const bId = branchId || getCurrentBranchId() || 'branch-central';
    initBranchStorage(bId);
    try {
      const data = localStorage.getItem(getKey('teachers', bId));
      let list = data ? JSON.parse(data) : PSIS_SAMPLE_DATA.getTeachersForBranch(bId);
      let changed = false;
      if (Array.isArray(list)) {
        list.forEach(t => {
          if (t.defaultClass && t.defaultClass.includes('ថ្នាក់ទី')) {
            t.defaultClass = cleanClassGrade(t.defaultClass);
            changed = true;
          }
        });
        if (changed) {
          saveTeachers(list, bId);
        }
      }
      return list;
    } catch (e) {
      return PSIS_SAMPLE_DATA.getTeachersForBranch(bId);
    }
  }

  function saveTeachers(teachers, branchId) {
    const bId = branchId || getCurrentBranchId() || 'branch-central';
    localStorage.setItem(getKey('teachers', bId), JSON.stringify(teachers));
    if (typeof PSIS_SupabaseSync !== 'undefined' && typeof PSIS_SupabaseSync.saveBranchToCloud === 'function') {
      PSIS_SupabaseSync.saveBranchToCloud(bId);
    }
  }

  function addTeacher(teacher, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    const list = getTeachers(bId);
    if (!teacher.id) {
      teacher.id = 'T' + String(Date.now()).slice(-4);
    }
    if (teacher.defaultClass) {
      teacher.defaultClass = cleanClassGrade(teacher.defaultClass);
    }
    list.push(teacher);
    saveTeachers(list, bId);

    // Auto-create a default schedule if none exists for this teacher
    const schedules = getSchedules(bId);
    if (!schedules.some(s => s.teacherId === teacher.id)) {
      const days = (teacher.level === 'មត្តេយ្យ' || teacher.level === 'បឋមសិក្សា') ? [1, 2, 3, 4, 5] : [1, 3, 5];
      addSchedule({
        teacherId: teacher.id,
        teacherName: teacher.name,
        days: days,
        dayOfWeek: days[0],
        shift: teacher.shift || 'ព្រឹក',
        classGrade: teacher.defaultClass || '1A',
        level: teacher.level,
        timeSlot: (teacher.shift === 'ល្ងាច' ? '13:00 - 17:00' : '07:00 - 11:15'),
        room: 'បន្ទប់ ១០១'
      }, bId);
    }

    return teacher;
  }

  function updateTeacher(updated, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    const list = getTeachers(bId);
    const idx = list.findIndex(t => t.id === updated.id);
    if (idx !== -1) {
      if (updated.defaultClass) {
        updated.defaultClass = cleanClassGrade(updated.defaultClass);
      }
      list[idx] = { ...list[idx], ...updated };
      saveTeachers(list, bId);

      // Cascade update to all schedules for this teacher (including classGrade)
      let schedules = getSchedules(bId);
      let schedChanged = false;
      schedules = schedules.map(s => {
        if (s.teacherId === updated.id) {
          schedChanged = true;
          return {
            ...s,
            teacherName: updated.name,
            level: updated.level,
            classGrade: updated.defaultClass || s.classGrade
          };
        }
        return s;
      });
      if (schedChanged) {
        saveSchedules(schedules, bId);
      }

      // Cascade update to all daily checklists (including classGrade)
      const allChecklists = getAllChecklists(bId);
      let checkChanged = false;
      for (const d in allChecklists) {
        if (Array.isArray(allChecklists[d])) {
          allChecklists[d] = allChecklists[d].map(rec => {
            if (rec.teacherId === updated.id) {
              checkChanged = true;
              return {
                ...rec,
                teacherName: updated.name,
                level: updated.level,
                classGrade: updated.defaultClass || rec.classGrade
              };
            }
            return rec;
          });
        }
      }
      if (checkChanged) {
        saveAllChecklists(allChecklists, bId);
      }

      return list[idx];
    }
    return null;
  }

  function deleteTeacher(id, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    let list = getTeachers(bId);
    list = list.filter(t => t.id !== id);
    saveTeachers(list, bId);

    let schedules = getSchedules(bId);
    schedules = schedules.filter(s => s.teacherId !== id);
    saveSchedules(schedules, bId);

    // Cascading delete across all daily checklists for this branch
    const allChecklists = getAllChecklists(bId);
    let checkChanged = false;
    for (const d in allChecklists) {
      if (Array.isArray(allChecklists[d])) {
        const prevLen = allChecklists[d].length;
        allChecklists[d] = allChecklists[d].filter(rec => rec.teacherId !== id);
        if (allChecklists[d].length !== prevLen) {
          checkChanged = true;
        }
      }
    }
    if (checkChanged) {
      saveAllChecklists(allChecklists, bId);
    }
  }

  // Schedules
  function getSchedules(branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    initBranchStorage(bId);
    try {
      const data = localStorage.getItem(getKey('schedules', bId));
      let schedules = data ? JSON.parse(data) : [];
      const teachers = getTeachers(bId);
      const teacherMap = new Map(teachers.map(t => [t.id, t]));
      let changed = false;

      // Filter out orphan schedules for deleted teachers
      const initLen = schedules.length;
      schedules = schedules.filter(s => teacherMap.has(s.teacherId));
      if (schedules.length !== initLen) {
        changed = true;
      }

      schedules.forEach(s => {
        if (s.classGrade && s.classGrade.includes('ថ្នាក់ទី')) {
          s.classGrade = cleanClassGrade(s.classGrade);
          changed = true;
        }
        const t = teacherMap.get(s.teacherId);
        if (t) {
          if (t.defaultClass && s.classGrade !== t.defaultClass) {
            s.classGrade = t.defaultClass;
            changed = true;
          }
          if (s.level !== t.level || s.teacherName !== t.name) {
            s.level = t.level;
            s.teacherName = t.name;
            changed = true;
          }
        }
      });
      if (changed) {
        saveSchedules(schedules, bId);
      }
      return schedules;
    } catch (e) {
      return [];
    }
  }

  function saveSchedules(schedules, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    localStorage.setItem(getKey('schedules', bId), JSON.stringify(schedules));
    if (typeof PSIS_SupabaseSync !== 'undefined' && typeof PSIS_SupabaseSync.saveBranchToCloud === 'function') {
      PSIS_SupabaseSync.saveBranchToCloud(bId);
    }
  }

  function addSchedule(sch, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    const list = getSchedules(bId);
    if (!sch.id) {
      sch.id = 'SCH' + String(Date.now()).slice(-4);
    }
    if (sch.classGrade) {
      sch.classGrade = cleanClassGrade(sch.classGrade);
    }
    list.push(sch);
    saveSchedules(list, bId);

    // Sync teacher defaultClass
    if (sch.teacherId && sch.classGrade) {
      const teachers = getTeachers(bId);
      const tIdx = teachers.findIndex(t => t.id === sch.teacherId);
      if (tIdx !== -1 && teachers[tIdx].defaultClass !== sch.classGrade) {
        teachers[tIdx].defaultClass = sch.classGrade;
        saveTeachers(teachers, bId);
      }
    }

    // Cascade update to all daily checklists
    const allChecklists = getAllChecklists(bId);
    let checkChanged = false;
    for (const d in allChecklists) {
      if (Array.isArray(allChecklists[d])) {
        const existing = allChecklists[d].find(rec => rec.teacherId === sch.teacherId);
        if (existing) {
          if (existing.classGrade !== sch.classGrade || existing.teacherName !== sch.teacherName || existing.level !== sch.level) {
            existing.classGrade = sch.classGrade;
            existing.teacherName = sch.teacherName;
            existing.level = sch.level;
            checkChanged = true;
          }
        } else {
          allChecklists[d].push({
            id: 'REC_' + sch.teacherId + '_' + d,
            date: d,
            teacherId: sch.teacherId,
            teacherName: sch.teacherName,
            level: sch.level,
            classGrade: sch.classGrade,
            shift: sch.shift || 'ព្រឹក',
            scanInTime: '',
            scanOutTime: '',
            attendanceRecorded: 'បានស្រង់',
            scoreEvaluated: 'បានដាក់ពិន្ទុ',
            telegramUsed: 'បានប្រើ',
            lessonSummaryWritten: 'បានសរសេរ',
            remarks: 'ធម្មតា',
            note: ''
          });
          checkChanged = true;
        }
      }
    }
    if (checkChanged) {
      saveAllChecklists(allChecklists, bId);
    }

    return sch;
  }

  function updateSchedule(updated, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    const list = getSchedules(bId);
    const idx = list.findIndex(s => s.id === updated.id);
    if (idx !== -1) {
      if (updated.classGrade) {
        updated.classGrade = cleanClassGrade(updated.classGrade);
      }
      list[idx] = { ...list[idx], ...updated };
      saveSchedules(list, bId);

      // Sync teacher defaultClass
      if (updated.teacherId && updated.classGrade) {
        const teachers = getTeachers(bId);
        const tIdx = teachers.findIndex(t => t.id === updated.teacherId);
        if (tIdx !== -1 && teachers[tIdx].defaultClass !== updated.classGrade) {
          teachers[tIdx].defaultClass = updated.classGrade;
          saveTeachers(teachers, bId);
        }
      }

      // Cascade update to all daily checklists
      const allChecklists = getAllChecklists(bId);
      let checkChanged = false;
      for (const d in allChecklists) {
        if (Array.isArray(allChecklists[d])) {
          allChecklists[d] = allChecklists[d].map(rec => {
            if (rec.teacherId === updated.teacherId) {
              checkChanged = true;
              return {
                ...rec,
                teacherName: updated.teacherName || rec.teacherName,
                level: updated.level || rec.level,
                classGrade: updated.classGrade || rec.classGrade
              };
            }
            return rec;
          });
        }
      }
      if (checkChanged) {
        saveAllChecklists(allChecklists, bId);
      }

      return list[idx];
    }
    return null;
  }

  function deleteSchedule(id, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    let list = getSchedules(bId);
    list = list.filter(s => s.id !== id);
    saveSchedules(list, bId);
  }

  // Checklists
  function getAllChecklists(branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    initBranchStorage(bId);
    try {
      const data = localStorage.getItem(getKey('checklists', bId));
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveAllChecklists(all, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    localStorage.setItem(getKey('checklists', bId), JSON.stringify(all));
    if (typeof PSIS_SupabaseSync !== 'undefined' && typeof PSIS_SupabaseSync.saveBranchToCloud === 'function') {
      PSIS_SupabaseSync.saveBranchToCloud(bId);
    }
  }

  function clearDailyChecklists(branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    localStorage.removeItem(getKey('checklists', bId));
  }

  function getDailyChecklist(dateStr, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    const all = getAllChecklists(bId);
    const teachers = getTeachers(bId);
    const teacherMap = new Map(teachers.map(t => [t.id, t]));

    if (all[dateStr] && Array.isArray(all[dateStr]) && all[dateStr].length > 0) {
      let changed = false;

      // 1. Purge records of any deleted teacher!
      const initialCount = all[dateStr].length;
      all[dateStr] = all[dateStr].filter(rec => teacherMap.has(rec.teacherId));
      if (all[dateStr].length !== initialCount) {
        changed = true;
      }

      // 2. Sync level, teacherName & classGrade with active teachers and schedules
      const schedules = getSchedules(bId);
      const scheduleMap = new Map(schedules.map(s => [s.teacherId, s]));

      all[dateStr].forEach(rec => {
        if (rec.classGrade && rec.classGrade.includes('ថ្នាក់ទី')) {
          rec.classGrade = cleanClassGrade(rec.classGrade);
          changed = true;
        }
        const t = teacherMap.get(rec.teacherId);
        if (t) {
          const sch = scheduleMap.get(rec.teacherId);
          const targetClass = (sch && sch.classGrade) || t.defaultClass;
          if (targetClass && rec.classGrade !== targetClass) {
            rec.classGrade = targetClass;
            changed = true;
          }
          if (rec.level !== t.level || rec.teacherName !== t.name) {
            rec.level = t.level;
            rec.teacherName = t.name;
            changed = true;
          }
        }
      });

      // 3. Ensure any active teacher missing from today's checklist is automatically appended
      const existingTeacherIds = new Set(all[dateStr].map(r => r.teacherId));
      teachers.forEach(t => {
        if (!existingTeacherIds.has(t.id)) {
          const sch = scheduleMap.get(t.id);
          all[dateStr].push({
            id: 'REC_' + t.id + '_' + dateStr,
            date: dateStr,
            teacherId: t.id,
            teacherName: t.name,
            level: t.level,
            classGrade: (sch && sch.classGrade) || t.defaultClass || '1A',
            shift: t.shift || (sch && sch.shift) || 'ព្រឹក',
            scanInTime: '',
            scanOutTime: '',
            attendanceRecorded: 'បានស្រង់',
            scoreEvaluated: 'បានដាក់ពិន្ទុ',
            telegramUsed: 'បានប្រើ',
            lessonSummaryWritten: 'បានសរសេរ',
            remarks: 'ធម្មតា',
            note: ''
          });
          changed = true;
        }
      });
      if (changed) {
        saveAllChecklists(all, bId);
      }
      return all[dateStr];
    }

    const schedules = getSchedules(bId);
    const generated = PSIS_SAMPLE_DATA.createDefaultChecklistForDate(dateStr, schedules, teachers);
    all[dateStr] = generated;
    saveAllChecklists(all, bId);
    return generated;
  }

  function saveDailyChecklist(dateStr, records, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    const all = getAllChecklists(bId);
    all[dateStr] = records;
    saveAllChecklists(all, bId);
  }

  // School Info
  function getSchoolInfo(branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    initBranchStorage(bId);
    try {
      const data = localStorage.getItem(getKey('school_info', bId));
      let info = data ? JSON.parse(data) : PSIS_SAMPLE_DATA.getSchoolInfoForBranch(bId);
      const defaultInfo = PSIS_SAMPLE_DATA.getSchoolInfoForBranch(bId);
      if (!info.principalName || info.principalName.includes('គង់ វណ្ណារី') || info.principalName.includes('ស៊ឹម វ៉ានដា') || info.principalName.includes('កែវ មុនីរ័ត្ន') || info.principalName.includes('ឌី ច័ន្ទដារ៉ា')) {
        info.principalName = defaultInfo.principalName;
      }
      if (!info.inspectorName || info.inspectorName.includes('ស៊ុន សុខជា') || info.inspectorName.includes('អ៊ុក វិបុល') || info.inspectorName.includes('ហេង រតនា') || info.inspectorName.includes('ឡុង គន្ធា') || info.inspectorName.includes('ម៉ៅ ស្រីពៅ')) {
        info.inspectorName = defaultInfo.inspectorName;
      }
      if (!info.branchPrint || info.branchPrint.includes('ទួលគោក')) {
        info.branchPrint = defaultInfo.branchPrint;
      }
      if (!info.branchKh || info.branchKh.includes('ទួលគោក')) {
        info.branchKh = defaultInfo.branchKh;
      }
      if (!info.branchShort || info.branchShort.includes('ទួលគោក')) {
        info.branchShort = defaultInfo.branchShort;
      }
      return info;
    } catch (e) {
      return PSIS_SAMPLE_DATA.getSchoolInfoForBranch(bId);
    }
  }

  function saveSchoolInfo(info, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    localStorage.setItem(getKey('school_info', bId), JSON.stringify(info));
    if (typeof PSIS_SupabaseSync !== 'undefined' && typeof PSIS_SupabaseSync.saveBranchToCloud === 'function') {
      PSIS_SupabaseSync.saveBranchToCloud(bId);
    }
  }

  // Reset current branch data
  function resetBranchData(branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    localStorage.removeItem(getKey('teachers', bId));
    localStorage.removeItem(getKey('schedules', bId));
    localStorage.removeItem(getKey('school_info', bId));
    localStorage.removeItem(getKey('checklists', bId));
    initBranchStorage(bId);
  }

  // Full backup export & import for transferring data between computers
  function exportAllData() {
    const backup = {
      version: 'v6',
      exportedAt: new Date().toISOString(),
      branches: {}
    };
    PSIS_BRANCHES.forEach(b => {
      backup.branches[b.id] = {
        teachers: getTeachers(b.id),
        schedules: getSchedules(b.id),
        schoolInfo: getSchoolInfo(b.id),
        checklists: getAllChecklists(b.id)
      };
    });
    return JSON.stringify(backup, null, 2);
  }

  function importAllData(jsonStr) {
    try {
      const data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      if (!data || !data.branches) {
        throw new Error('ទម្រង់ទិន្នន័យមិនត្រឹមត្រូវ (Invalid Backup File)');
      }
      for (const bId in data.branches) {
        const bData = data.branches[bId];
        if (Array.isArray(bData.teachers)) saveTeachers(bData.teachers, bId);
        if (Array.isArray(bData.schedules)) saveSchedules(bData.schedules, bId);
        if (bData.schoolInfo && typeof bData.schoolInfo === 'object') saveSchoolInfo(bData.schoolInfo, bId);
        if (bData.checklists && typeof bData.checklists === 'object') saveAllChecklists(bData.checklists, bId);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return {
    getCurrentBranchId,
    setCurrentBranchId,
    getBranches,
    getBranchById,
    initBranchStorage,
    getTeachers,
    saveTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    getSchedules,
    saveSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getAllChecklists,
    getDailyChecklist,
    saveDailyChecklist,
    clearDailyChecklists,
    getSchoolInfo,
    saveSchoolInfo,
    resetBranchData,
    exportAllData,
    importAllData
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PSIS_Storage;
}
