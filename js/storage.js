/**
 * Storage Layer with Multi-Branch Support & LocalStorage Persistence
 * Manages 5 PSIS Branches independently with branch switching.
 */

const PSIS_Storage = (() => {
  const CURRENT_BRANCH_KEY = 'psis_active_branch_id_v5';

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
    return `psis_${bId}_${type}_v5`;
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

  // Teachers
  function getTeachers(branchId) {
    const bId = branchId || getCurrentBranchId() || 'branch-central';
    initBranchStorage(bId);
    try {
      const data = localStorage.getItem(getKey('teachers', bId));
      return data ? JSON.parse(data) : PSIS_SAMPLE_DATA.getTeachersForBranch(bId);
    } catch (e) {
      return PSIS_SAMPLE_DATA.getTeachersForBranch(bId);
    }
  }

  function saveTeachers(teachers, branchId) {
    const bId = branchId || getCurrentBranchId() || 'branch-central';
    localStorage.setItem(getKey('teachers', bId), JSON.stringify(teachers));
  }

  function addTeacher(teacher, branchId) {
    const list = getTeachers(branchId);
    if (!teacher.id) {
      teacher.id = 'T' + String(Date.now()).slice(-4);
    }
    list.push(teacher);
    saveTeachers(list, branchId);
    return teacher;
  }

  function updateTeacher(updated, branchId) {
    const list = getTeachers(branchId);
    const idx = list.findIndex(t => t.id === updated.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updated };
      saveTeachers(list, branchId);
      return list[idx];
    }
    return null;
  }

  function deleteTeacher(id, branchId) {
    let list = getTeachers(branchId);
    list = list.filter(t => t.id !== id);
    saveTeachers(list, branchId);

    let schedules = getSchedules(branchId);
    schedules = schedules.filter(s => s.teacherId !== id);
    saveSchedules(schedules, branchId);
  }

  // Schedules
  function getSchedules(branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    initBranchStorage(bId);
    try {
      const data = localStorage.getItem(getKey('schedules', bId));
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveSchedules(schedules, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    localStorage.setItem(getKey('schedules', bId), JSON.stringify(schedules));
  }

  function addSchedule(sch, branchId) {
    const list = getSchedules(branchId);
    if (!sch.id) {
      sch.id = 'SCH' + String(Date.now()).slice(-4);
    }
    list.push(sch);
    saveSchedules(list, branchId);
    clearDailyChecklists(branchId);
    return sch;
  }

  function deleteSchedule(id, branchId) {
    let list = getSchedules(branchId);
    list = list.filter(s => s.id !== id);
    saveSchedules(list, branchId);
    clearDailyChecklists(branchId);
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
  }

  function clearDailyChecklists(branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    localStorage.removeItem(getKey('checklists', bId));
  }

  function getDailyChecklist(dateStr, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    const all = getAllChecklists(bId);
    if (all[dateStr] && Array.isArray(all[dateStr]) && all[dateStr].length > 0) {
      return all[dateStr];
    }

    const schedules = getSchedules(bId);
    const teachers = getTeachers(bId);
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
      return data ? JSON.parse(data) : PSIS_SAMPLE_DATA.getSchoolInfoForBranch(bId);
    } catch (e) {
      return PSIS_SAMPLE_DATA.getSchoolInfoForBranch(bId);
    }
  }

  function saveSchoolInfo(info, branchId) {
    const bId = branchId || getCurrentBranchId() || 'psis-ix';
    localStorage.setItem(getKey('school_info', bId), JSON.stringify(info));
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
    deleteSchedule,
    getAllChecklists,
    getDailyChecklist,
    saveDailyChecklist,
    clearDailyChecklists,
    getSchoolInfo,
    saveSchoolInfo,
    resetBranchData
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PSIS_Storage;
}
