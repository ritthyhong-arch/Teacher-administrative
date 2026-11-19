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

  function getLocalDateString(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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
      const today = getLocalDateString();

      const schedules = JSON.parse(localStorage.getItem(schedulesKey));
      const teachers = JSON.parse(localStorage.getItem(teachersKey));

      checklists[today] = PSIS_SAMPLE_DATA.createDefaultChecklistForDate(today, schedules, teachers);
      localStorage.setItem(checklistsKey, JSON.stringify(checklists));
    }
  }

  function cleanClassGrade(str) {
    if (!str) return '';
    return String(str).replace(/^ថ្នាក់ទី\s*/g, '').trim();
  }

  // Helper for sorting by teaching level in order: 1. មត្តេយ្យ, 2. បឋមសិក្សា, 3. អនុវិទ្យាល័យ-វិទ្យាល័យ
  function getLevelOrderWeight(level) {
    if (!level) return 99;
    const l = String(level).trim();
    if (l.includes('មត្តេយ្យ') || l.toLowerCase().includes('kindergarten')) return 1;
    if (l.includes('បឋម') || l.toLowerCase().includes('primary')) return 2;
    if (l.includes('អនុវិទ្យាល័យ') || l.includes('វិទ្យាល័យ') || l.includes('មធ្យម') || l.toLowerCase().includes('secondary') || l.toLowerCase().includes('high')) return 3;
    return 4;
  }

  // Helper for sorting classes from Grade 1 upwards (e.g. 1, 2, 3... 12, K1, K2...)
  function getGradeWeight(gradeStr) {
    if (!gradeStr) return 999;
    let s = String(gradeStr).trim().toUpperCase();

    // Convert Khmer numerals to Arabic digits if any
    const khmerDigits = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    khmerDigits.forEach((kd, idx) => {
      s = s.replaceAll(kd, idx.toString());
    });

    // Kindergarten check
    if (s.includes('K1')) return 0.1;
    if (s.includes('K2')) return 0.2;
    if (s.includes('K3')) return 0.3;
    if (s.includes('មត្តេយ្យ') || s.startsWith('K')) return 0.5;

    // Extract all numbers
    const nums = s.match(/\d+/g);
    if (!nums || nums.length === 0) return 999;

    const firstNum = parseInt(nums[0], 10);

    // Letter offset (e.g. 1A -> 1.001, 1B -> 1.002)
    const letterMatch = s.match(/[A-Z]/);
    let letterOffset = 0;
    if (letterMatch) {
      letterOffset = (letterMatch[0].charCodeAt(0) - 64) * 0.001;
    }

    // Secondary number tie-breaker for multi-grades like 5&6, 7,8,9
    let secondOffset = 0;
    if (nums.length > 1) {
      secondOffset = parseInt(nums[1], 10) * 0.0001;
    }

    return firstNum + letterOffset + secondOffset;
  }

  function sortTeachersByLevel(teachers) {
    if (!Array.isArray(teachers)) return [];
    return [...teachers].sort((a, b) => {
      const wA = getLevelOrderWeight(a.level);
      const wB = getLevelOrderWeight(b.level);
      if (wA !== wB) return wA - wB;
      const gA = getGradeWeight(a.defaultClass);
      const gB = getGradeWeight(b.defaultClass);
      if (gA !== gB) return gA - gB;
      return (a.name || '').localeCompare(b.name || '', 'km');
    });
  }

  // Teachers
  function getTeachers(branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
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
      return sortTeachersByLevel(list);
    } catch (e) {
      return sortTeachersByLevel(PSIS_SAMPLE_DATA.getTeachersForBranch(bId));
    }
  }

  function saveTeachers(teachers, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    localStorage.setItem(getKey('teachers', bId), JSON.stringify(teachers));
    if (typeof PSIS_SupabaseSync !== 'undefined' && typeof PSIS_SupabaseSync.saveBranchToCloud === 'function') {
      if (!PSIS_SupabaseSync.isSyncingFromCloud()) {
        PSIS_SupabaseSync.saveBranchToCloud(bId);
      }
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
      if (!PSIS_SupabaseSync.isSyncingFromCloud()) {
        PSIS_SupabaseSync.saveBranchToCloud(bId);
      }
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

    // Cascade update to all daily checklists: only affect dates where this schedule applies!
    const allChecklists = getAllChecklists(bId);
    let checkChanged = false;
    for (const d in allChecklists) {
      if (Array.isArray(allChecklists[d])) {
        const dObj = new Date(d + 'T00:00:00');
        const dayOfWeek = dObj.getDay();
        const appliesToday = Array.isArray(sch.days) && sch.days.length > 0
          ? sch.days.map(Number).includes(dayOfWeek)
          : Number(sch.dayOfWeek) === dayOfWeek;

        const existingIdx = allChecklists[d].findIndex(rec => rec.teacherId === sch.teacherId);
        if (appliesToday) {
          if (existingIdx !== -1) {
            allChecklists[d][existingIdx].classGrade = sch.classGrade;
            allChecklists[d][existingIdx].teacherName = sch.teacherName;
            allChecklists[d][existingIdx].level = sch.level;
            checkChanged = true;
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

      // Cascade update to all daily checklists:
      // If teacher is NO LONGER scheduled on that day of week, remove their record from that date!
      // If teacher is scheduled on that day of week, sync their details.
      const allChecklists = getAllChecklists(bId);
      let checkChanged = false;
      for (const d in allChecklists) {
        if (Array.isArray(allChecklists[d])) {
          const dObj = new Date(d + 'T00:00:00');
          const dayOfWeek = dObj.getDay();
          const isScheduledToday = list.some(s => s.teacherId === updated.teacherId && (
            Array.isArray(s.days) && s.days.length > 0 
              ? s.days.map(Number).includes(dayOfWeek) 
              : Number(s.dayOfWeek) === dayOfWeek
          ));

          const existingIdx = allChecklists[d].findIndex(rec => rec.teacherId === updated.teacherId);
          if (isScheduledToday) {
            if (existingIdx !== -1) {
              allChecklists[d][existingIdx].teacherName = updated.teacherName || allChecklists[d][existingIdx].teacherName;
              allChecklists[d][existingIdx].level = updated.level || allChecklists[d][existingIdx].level;
              allChecklists[d][existingIdx].classGrade = updated.classGrade || allChecklists[d][existingIdx].classGrade;
              checkChanged = true;
            } else {
              allChecklists[d].push({
                id: 'REC_' + updated.teacherId + '_' + d,
                date: d,
                teacherId: updated.teacherId,
                teacherName: updated.teacherName || '',
                level: updated.level || '',
                classGrade: updated.classGrade || '1A',
                shift: updated.shift || 'ព្រឹក',
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
          } else {
            if (existingIdx !== -1) {
              allChecklists[d].splice(existingIdx, 1);
              checkChanged = true;
            }
          }
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
    const deletedSch = list.find(s => s.id === id);
    list = list.filter(s => s.id !== id);
    saveSchedules(list, bId);

    // If teacher has no schedule on a date, purge their record from that date
    if (deletedSch && deletedSch.teacherId) {
      const allChecklists = getAllChecklists(bId);
      let checkChanged = false;
      for (const d in allChecklists) {
        if (Array.isArray(allChecklists[d])) {
          const dObj = new Date(d + 'T00:00:00');
          const dayOfWeek = dObj.getDay();
          const hasRemainingSch = list.some(s => s.teacherId === deletedSch.teacherId && (
            Array.isArray(s.days) && s.days.length > 0 
              ? s.days.map(Number).includes(dayOfWeek) 
              : Number(s.dayOfWeek) === dayOfWeek
          ));
          if (!hasRemainingSch) {
            const idx = allChecklists[d].findIndex(r => r.teacherId === deletedSch.teacherId);
            if (idx !== -1) {
              allChecklists[d].splice(idx, 1);
              checkChanged = true;
            }
          }
        }
      }
      if (checkChanged) {
        saveAllChecklists(allChecklists, bId);
      }
    }
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
      if (!PSIS_SupabaseSync.isSyncingFromCloud()) {
        PSIS_SupabaseSync.saveBranchToCloud(bId);
      }
    }
  }

  function clearDailyChecklists(branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    localStorage.removeItem(getKey('checklists', bId));
  }

  function isTeacherScheduledOnDay(teacherId, dayOfWeek, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    const schedules = getSchedules(bId);
    const teacherSchedules = schedules.filter(s => s.teacherId === teacherId);
    if (teacherSchedules.length === 0) {
      // Default to active on weekdays (Mon-Fri) if no specific schedule row exists yet
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    return teacherSchedules.some(s => {
      if (Array.isArray(s.days) && s.days.length > 0) {
        return s.days.map(Number).includes(Number(dayOfWeek));
      }
      return Number(s.dayOfWeek) === Number(dayOfWeek);
    });
  }

  function isTeacherScheduledForDate(teacherId, dateStr, branchId) {
    const d = new Date(dateStr + 'T00:00:00');
    return isTeacherScheduledOnDay(teacherId, d.getDay(), branchId);
  }

  function getDailyChecklist(dateStr, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    const all = getAllChecklists(bId);
    const teachers = getTeachers(bId);
    const teacherMap = new Map(teachers.map(t => [t.id, t]));
    const schedules = getSchedules(bId);

    const d = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = d.getDay();

    function isTeacherScheduled(tId) {
      const tSchedules = schedules.filter(s => s.teacherId === tId);
      if (tSchedules.length === 0) {
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      }
      return tSchedules.some(s => {
        if (Array.isArray(s.days) && s.days.length > 0) {
          return s.days.map(Number).includes(dayOfWeek);
        }
        return Number(s.dayOfWeek) === dayOfWeek;
      });
    }

    if (all[dateStr] && Array.isArray(all[dateStr]) && all[dateStr].length > 0) {
      let changed = false;

      // 1. Never purge records that have existing teacher data!
      // Only filter out teachers that have been explicitly marked inactive
      const initialCount = all[dateStr].length;
      all[dateStr] = all[dateStr].filter(rec => {
        const t = teacherMap.get(rec.teacherId) || teachers.find(teacher => teacher.name === rec.teacherName);
        if (t && t.status === 'អសកម្ម') return false;
        return true;
      });
      if (all[dateStr].length !== initialCount) {
        changed = true;
      }

      // 2. Sync level, teacherName & classGrade with active teachers and schedules
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

      // 3. Ensure any active teacher who IS SCHEDULED on this day of week but missing from today's checklist is appended
      const existingTeacherIds = new Set(all[dateStr].map(r => r.teacherId));
      teachers.forEach(t => {
        if (t.status !== 'អសកម្ម' && !existingTeacherIds.has(t.id) && isTeacherScheduled(t.id)) {
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
      all[dateStr].sort((a, b) => {
        const teacherA = teacherMap.get(a.teacherId) || teachers.find(t => t.name === a.teacherName);
        const teacherB = teacherMap.get(b.teacherId) || teachers.find(t => t.name === b.teacherName);
        const lvlA = (teacherA && teacherA.level) || a.level;
        const lvlB = (teacherB && teacherB.level) || b.level;
        const wA = getLevelOrderWeight(lvlA);
        const wB = getLevelOrderWeight(lvlB);
        if (wA !== wB) return wA - wB;
        const gA = getGradeWeight(a.classGrade || (teacherA && teacherA.defaultClass));
        const gB = getGradeWeight(b.classGrade || (teacherB && teacherB.defaultClass));
        if (gA !== gB) return gA - gB;
        const nameA = (teacherA && teacherA.name) || a.teacherName || '';
        const nameB = (teacherB && teacherB.name) || b.teacherName || '';
        return nameA.localeCompare(nameB, 'km');
      });
      return all[dateStr];
    }

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
      if (!PSIS_SupabaseSync.isSyncingFromCloud()) {
        PSIS_SupabaseSync.saveBranchToCloud(bId);
      }
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
    isTeacherScheduledOnDay,
    isTeacherScheduledForDate,
    getSchoolInfo,
    saveSchoolInfo,
    resetBranchData,
    getLocalDateString,
    exportAllData,
    importAllData,
    getLevelOrderWeight,
    getGradeWeight,
    sortTeachersByLevel
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PSIS_Storage;
}
