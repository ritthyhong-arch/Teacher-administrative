/**
 * Storage Layer with LocalStorage persistence and backup/restore capabilities
 */

const PSIS_Storage = (() => {
  const KEYS = {
    TEACHERS: 'psis_teachers_v1',
    SCHEDULES: 'psis_schedules_v1',
    CHECKLISTS: 'psis_checklists_v1',
    SCHOOL_INFO: 'psis_school_info_v1',
    SETTINGS: 'psis_settings_v1'
  };

  function initStorage() {
    if (!localStorage.getItem(KEYS.TEACHERS)) {
      localStorage.setItem(KEYS.TEACHERS, JSON.stringify(PSIS_SAMPLE_DATA.teachers));
    }
    if (!localStorage.getItem(KEYS.SCHEDULES)) {
      localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(PSIS_SAMPLE_DATA.schedules));
    }
    if (!localStorage.getItem(KEYS.SCHOOL_INFO)) {
      localStorage.setItem(KEYS.SCHOOL_INFO, JSON.stringify(PSIS_SAMPLE_DATA.schoolInfo));
    }
    if (!localStorage.getItem(KEYS.CHECKLISTS)) {
      // Pre-populate with initial checklists for today and demo date
      const checklists = {};
      const today = new Date().toISOString().split('T')[0];
      const demoDate = '2026-10-05';

      const schedules = JSON.parse(localStorage.getItem(KEYS.SCHEDULES));
      const teachers = JSON.parse(localStorage.getItem(KEYS.TEACHERS));

      checklists[today] = PSIS_SAMPLE_DATA.createDefaultChecklistForDate(today, schedules, teachers);
      if (today !== demoDate) {
        checklists[demoDate] = PSIS_SAMPLE_DATA.createDefaultChecklistForDate(demoDate, schedules, teachers);
      }
      localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(checklists));
    }
  }

  // Teachers
  function getTeachers() {
    try {
      const data = localStorage.getItem(KEYS.TEACHERS);
      return data ? JSON.parse(data) : [...PSIS_SAMPLE_DATA.teachers];
    } catch (e) {
      console.error('Error reading teachers:', e);
      return [...PSIS_SAMPLE_DATA.teachers];
    }
  }

  function saveTeachers(teachers) {
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(teachers));
  }

  function addTeacher(teacher) {
    const list = getTeachers();
    if (!teacher.id) {
      teacher.id = 'T' + String(Date.now()).slice(-4);
    }
    list.push(teacher);
    saveTeachers(list);
    return teacher;
  }

  function updateTeacher(updated) {
    const list = getTeachers();
    const idx = list.findIndex(t => t.id === updated.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updated };
      saveTeachers(list);
      return list[idx];
    }
    return null;
  }

  function deleteTeacher(id) {
    let list = getTeachers();
    list = list.filter(t => t.id !== id);
    saveTeachers(list);

    // Also remove from schedules
    let schedules = getSchedules();
    schedules = schedules.filter(s => s.teacherId !== id);
    saveSchedules(schedules);
  }

  // Schedules
  function getSchedules() {
    try {
      const data = localStorage.getItem(KEYS.SCHEDULES);
      return data ? JSON.parse(data) : [...PSIS_SAMPLE_DATA.schedules];
    } catch (e) {
      console.error('Error reading schedules:', e);
      return [...PSIS_SAMPLE_DATA.schedules];
    }
  }

  function saveSchedules(schedules) {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
  }

  function addSchedule(sch) {
    const list = getSchedules();
    if (!sch.id) {
      sch.id = 'SCH' + String(Date.now()).slice(-4);
    }
    list.push(sch);
    saveSchedules(list);
    return sch;
  }

  function updateSchedule(updated) {
    const list = getSchedules();
    const idx = list.findIndex(s => s.id === updated.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updated };
      saveSchedules(list);
      return list[idx];
    }
    return null;
  }

  function deleteSchedule(id) {
    let list = getSchedules();
    list = list.filter(s => s.id !== id);
    saveSchedules(list);
  }

  // Daily Checklists
  function getAllChecklists() {
    try {
      const data = localStorage.getItem(KEYS.CHECKLISTS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Error reading checklists:', e);
      return {};
    }
  }

  function saveAllChecklists(all) {
    localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(all));
  }

  function getDailyChecklist(dateStr) {
    const all = getAllChecklists();
    if (all[dateStr] && Array.isArray(all[dateStr]) && all[dateStr].length > 0) {
      return all[dateStr];
    }
    // Generate new checklist for this date based on schedule
    const schedules = getSchedules();
    const teachers = getTeachers();
    const generated = PSIS_SAMPLE_DATA.createDefaultChecklistForDate(dateStr, schedules, teachers);
    all[dateStr] = generated;
    saveAllChecklists(all);
    return generated;
  }

  function saveDailyChecklist(dateStr, records) {
    const all = getAllChecklists();
    all[dateStr] = records;
    saveAllChecklists(all);
  }

  function updateDailyRecord(dateStr, recordId, updates) {
    const records = getDailyChecklist(dateStr);
    const idx = records.findIndex(r => r.id === recordId);
    if (idx !== -1) {
      records[idx] = { ...records[idx], ...updates };
      saveDailyChecklist(dateStr, records);
      return records[idx];
    }
    return null;
  }

  // School Info
  function getSchoolInfo() {
    try {
      const data = localStorage.getItem(KEYS.SCHOOL_INFO);
      return data ? JSON.parse(data) : { ...PSIS_SAMPLE_DATA.schoolInfo };
    } catch (e) {
      return { ...PSIS_SAMPLE_DATA.schoolInfo };
    }
  }

  function saveSchoolInfo(info) {
    localStorage.setItem(KEYS.SCHOOL_INFO, JSON.stringify(info));
  }

  // Reset to default
  function resetToDefault() {
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(PSIS_SAMPLE_DATA.teachers));
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(PSIS_SAMPLE_DATA.schedules));
    localStorage.setItem(KEYS.SCHOOL_INFO, JSON.stringify(PSIS_SAMPLE_DATA.schoolInfo));

    const checklists = {};
    const today = new Date().toISOString().split('T')[0];
    const demoDate = '2026-10-05';
    checklists[today] = PSIS_SAMPLE_DATA.createDefaultChecklistForDate(today, PSIS_SAMPLE_DATA.schedules, PSIS_SAMPLE_DATA.teachers);
    checklists[demoDate] = PSIS_SAMPLE_DATA.createDefaultChecklistForDate(demoDate, PSIS_SAMPLE_DATA.schedules, PSIS_SAMPLE_DATA.teachers);
    localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(checklists));
  }

  // Export full JSON backup
  function exportBackup() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      schoolInfo: getSchoolInfo(),
      teachers: getTeachers(),
      schedules: getSchedules(),
      checklists: getAllChecklists()
    }, null, 2);
  }

  // Import JSON backup
  function importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.teachers && Array.isArray(parsed.teachers)) {
        saveTeachers(parsed.teachers);
      }
      if (parsed.schedules && Array.isArray(parsed.schedules)) {
        saveSchedules(parsed.schedules);
      }
      if (parsed.schoolInfo) {
        saveSchoolInfo(parsed.schoolInfo);
      }
      if (parsed.checklists) {
        saveAllChecklists(parsed.checklists);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Self-initialize
  initStorage();

  return {
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
    getDailyChecklist,
    saveDailyChecklist,
    updateDailyRecord,
    getAllChecklists,
    getSchoolInfo,
    saveSchoolInfo,
    resetToDefault,
    exportBackup,
    importBackup
  };
})();

// Export for module/global usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PSIS_Storage;
}
