/**
 * Main Application Controller for PSIS Daily Teacher Administration Monitoring System
 * (ប្រព័ន្ធត្រួតពិនិត្យរដ្ឋបាលគ្រូប្រចាំថ្ងៃ - សាលាបញ្ញាសាស្រ្តអន្តរជាតិ)
 * With 5-Branch Selection Portal & Switching Support.
 */

const PSIS_App = (() => {
  // Application State
  const state = {
    currentBranchId: null,      // Active branch ID
    currentDate: '2026-10-05',  // Default anchor date for demonstration
    selectedShift: 'all',        // 'all', 'ព្រឹក', 'ល្ងាច'
    selectedLevel: 'all',        // 'all', 'មត្តេយ្យ', 'បឋមសិក្សា', 'មធ្យមសិក្សា'
    selectedStatus: 'all',       // 'all', 'complete', 'incomplete', 'leave', 'late'
    searchQuery: '',
    activeTab: 'tab-dashboard',
    schoolInfo: {},
    teachers: [],
    schedules: [],
    dailyRecords: [],
    monthlyYearMonth: '2026-10'
  };

  /**
   * Passwords for each school branch
   */
  const BRANCH_PASSWORDS = {
    'psis-ii': ['002', 'TK002'],
    'psis-iii': ['003', 'TK003'],
    'psis-vii': ['007', 'TK007'],
    'psis-viii': ['008', 'TK008'],
    'psis-ix': ['009', 'TK009']
  };

  /**
   * Helper to strip "ថ្នាក់ទី" prefix from class name (e.g. "ថ្នាក់ទី 1A" -> "1A")
   */
  function cleanClassGrade(str, fallback = '-') {
    if (!str) return fallback;
    const cleaned = String(str).replace(/^ថ្នាក់ទី\s*/g, '').trim();
    return cleaned || fallback;
  }

  /**
   * Toggle Password Visibility in Modal
   */
  function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  /**
   * Initialize Application
   */
  function init() {
    const savedBranchId = PSIS_Storage.getCurrentBranchId() || 'psis-ix';
    const authBranch = sessionStorage.getItem('psis_auth_branch');
    const branchModal = document.getElementById('branch-modal-overlay');
    const branchSelect = document.getElementById('branch-select-input');
    const pwdInput = document.getElementById('branch-password-input');

    if (branchSelect) branchSelect.value = savedBranchId;

    if (authBranch && authBranch === savedBranchId) {
      // User is already authenticated for this branch during this browser session
      selectBranch(savedBranchId, false);
      if (branchModal) branchModal.style.display = 'none';
    } else {
      // Prompt user to enter branch password
      selectBranch(savedBranchId, false);
      if (branchModal) {
        branchModal.style.display = 'flex';
        branchModal.classList.add('active');
        if (pwdInput) {
          pwdInput.value = '';
          setTimeout(() => pwdInput.focus(), 250);
        }
      }
    }

    setupEventListeners();
  }

  /**
   * Open the "ចូលទៅកាន់សាខា" Branch Selection Modal
   */
  function openBranchModal() {
    const modal = document.getElementById('branch-modal-overlay');
    const select = document.getElementById('branch-select-input');
    const pwdInput = document.getElementById('branch-password-input');
    const pwdError = document.getElementById('branch-password-error');

    if (select && state.currentBranchId) {
      select.value = state.currentBranchId;
    }
    if (pwdInput) {
      pwdInput.value = '';
      pwdInput.style.borderColor = '';
    }
    if (pwdError) {
      pwdError.style.display = 'none';
    }
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
      if (pwdInput) setTimeout(() => pwdInput.focus(), 200);
    }
  }

  /**
   * Close the "ចូលទៅកាន់សាខា" Branch Selection Modal
   */
  function closeBranchModal(force = false) {
    const authBranch = sessionStorage.getItem('psis_auth_branch');
    const modal = document.getElementById('branch-modal-overlay');

    if (!force && (!authBranch || authBranch !== state.currentBranchId)) {
      const pwdError = document.getElementById('branch-password-error');
      if (pwdError) {
        pwdError.style.display = 'block';
        pwdError.textContent = '⚠️ សូមបញ្ចូលលេខកូដសម្ងាត់សាខាដើម្បីចូលប្រើប្រព័ន្ធ!';
      }
      const pwdInput = document.getElementById('branch-password-input');
      if (pwdInput) pwdInput.focus();
      return;
    }

    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
  }

  /**
   * Handle Branch Dropdown Change in Modal
   */
  function onBranchSelectChange(branchId) {
    const pwdInput = document.getElementById('branch-password-input');
    const pwdError = document.getElementById('branch-password-error');
    if (pwdInput) {
      pwdInput.value = '';
      pwdInput.style.borderColor = '';
      pwdInput.focus();
    }
    if (pwdError) {
      pwdError.style.display = 'none';
    }
  }

  /**
   * Confirm Branch Selection and Enter System with Password Check
   */
  function confirmBranchSelection() {
    const select = document.getElementById('branch-select-input');
    const branchId = select ? select.value : (state.currentBranchId || 'psis-ix');
    const pwdInput = document.getElementById('branch-password-input');
    const pwdError = document.getElementById('branch-password-error');
    const enteredPwd = pwdInput ? pwdInput.value.trim() : '';

    const validPasswords = BRANCH_PASSWORDS[branchId] || [];
    const validList = Array.isArray(validPasswords) ? validPasswords : [validPasswords];
    const isMatch = enteredPwd && validList.some(p => p.toUpperCase() === enteredPwd.toUpperCase());

    if (!isMatch) {
      if (pwdError) {
        pwdError.style.display = 'block';
        pwdError.textContent = `⚠️ លេខកូដសម្ងាត់មិនត្រឹមត្រូវទេសម្រាប់ ${select ? select.options[select.selectedIndex].text : 'សាខានេះ'}!`;
      }
      if (pwdInput) {
        pwdInput.focus();
        pwdInput.style.borderColor = '#dc2626';
      }
      return;
    }

    // Success: Password matched
    if (pwdError) pwdError.style.display = 'none';
    if (pwdInput) {
      pwdInput.style.borderColor = '';
      pwdInput.value = '';
    }

    sessionStorage.setItem('psis_auth_branch', branchId);
    selectBranch(branchId, true);
    closeBranchModal(true);
    showToast(`ជោគជ័យ! បានចូលទៅកាន់ ${state.schoolInfo.branch}`, 'success');
  }

  /**
   * Select a Branch and enter the main monitoring dashboard
   */
  function selectBranch(branchId, showNotification = true) {
    state.currentBranchId = branchId;
    PSIS_Storage.setCurrentBranchId(branchId);

    state.schoolInfo = PSIS_Storage.getSchoolInfo(branchId);
    state.teachers = PSIS_Storage.getTeachers(branchId);
    state.schedules = PSIS_Storage.getSchedules(branchId);

    // Update active branch indicators in header
    const branchNameEl = document.getElementById('header-active-branch-name');
    if (branchNameEl) {
      branchNameEl.textContent = state.schoolInfo.branch;
    }

    // Sync modal select dropdown
    const branchSelect = document.getElementById('branch-select-input');
    if (branchSelect && branchSelect.value !== branchId) {
      branchSelect.value = branchId;
    }

    loadDailyRecords();
    updateHeaderDateDisplay();
    renderAll();

    if (showNotification) {
      showToast(`បានចូលប្រើប្រាស់ ${state.schoolInfo.branch}`, 'success');
    }
  }

  function handleSelectBranch(branchId) {
    selectBranch(branchId, true);
  }

  function handleSwitchBranch() {
    openBranchModal();
  }

  /**
   * Load daily records for current date & active branch
   */
  function loadDailyRecords() {
    state.teachers = PSIS_Storage.getTeachers(state.currentBranchId);
    state.schedules = PSIS_Storage.getSchedules(state.currentBranchId);
    state.dailyRecords = PSIS_Storage.getDailyChecklist(state.currentDate, state.currentBranchId);
    // Ensure all daily records strictly belong to active teachers who have a schedule on this day of week!
    const d = new Date(state.currentDate + 'T00:00:00');
    const dayOfWeek = d.getDay();
    state.dailyRecords = state.dailyRecords.filter(r => {
      const teacher = state.teachers.find(t => t.id === r.teacherId && t.status !== 'អសកម្ម');
      if (!teacher) return false;
      return PSIS_Storage.isTeacherScheduledOnDay(r.teacherId, dayOfWeek, state.currentBranchId);
    });
  }

  function saveCurrentRecords() {
    PSIS_Storage.saveDailyChecklist(state.currentDate, state.dailyRecords, state.currentBranchId);
    updateKPIs();
    renderPrintReport();
  }

  function updateHeaderDateDisplay() {
    const lunarHeaderEl = document.getElementById('header-lunar-text');
    if (lunarHeaderEl) {
      lunarHeaderEl.textContent = KhmerCalendar.getFullOfficialKhmerDate(state.currentDate);
    }

    const datePickerInput = document.getElementById('filter-date');
    if (datePickerInput) {
      datePickerInput.value = state.currentDate;
    }
  }

  function renderAll() {
    renderKPIs();
    renderChecklistTable();
    renderTeachersTable();
    renderSchedulesTable();
    renderPrintReport();
    renderMonthlySummary();
  }

  function refreshAllData() {
    state.schoolInfo = PSIS_Storage.getSchoolInfo(state.currentBranchId);
    state.teachers = PSIS_Storage.getTeachers(state.currentBranchId);
    state.schedules = PSIS_Storage.getSchedules(state.currentBranchId);
    loadDailyRecords();
    renderAll();
  }

  function updateKPIs() {
    renderKPIs();
  }

  function renderKPIs() {
    const stats = PSIS_Analytics.calculateDailyStats(state.dailyRecords, state.schoolInfo);

    const elTotal = document.getElementById('kpi-total-scheduled');
    const elPresent = document.getElementById('kpi-present');
    const elLeave = document.getElementById('kpi-leave');
    const elLate = document.getElementById('kpi-late');
    const elIncomplete = document.getElementById('kpi-incomplete');
    const elRate = document.getElementById('kpi-completion-rate');

    if (elTotal) elTotal.textContent = KhmerCalendar.toKhmerNumber(stats.totalScheduled);
    if (elPresent) elPresent.textContent = KhmerCalendar.toKhmerNumber(stats.presentCount);
    if (elLeave) elLeave.textContent = KhmerCalendar.toKhmerNumber(stats.leaveCount);
    if (elLate) elLate.textContent = KhmerCalendar.toKhmerNumber(stats.lateCount);
    if (elIncomplete) elIncomplete.textContent = KhmerCalendar.toKhmerNumber(stats.incompleteTaskCount);
    if (elRate) elRate.textContent = KhmerCalendar.toKhmerNumber(stats.completionRate) + '%';
  }

  function getFilteredRecords() {
    return state.dailyRecords.filter(rec => {
      const teacher = state.teachers.find(t => t.id === rec.teacherId);
      if (!teacher) return false;
      const recLevel = teacher.level;
      const recTeacherName = teacher.name;

      if (state.selectedLevel !== 'all' && recLevel !== state.selectedLevel) return false;

      if (state.selectedStatus !== 'all') {
        const isLate = PSIS_Analytics.isRecordLate(rec, state.schoolInfo);
        const isIncomplete = PSIS_Analytics.isRecordIncomplete(rec, state.schoolInfo);

        if (state.selectedStatus === 'leave' && rec.remarks !== 'ច្បាប់') return false;
        if (state.selectedStatus === 'late' && !isLate) return false;
        if (state.selectedStatus === 'incomplete' && !isIncomplete) return false;
        if (state.selectedStatus === 'complete' && (isIncomplete || rec.remarks === 'ច្បាប់' || rec.remarks === 'គ្មានច្បាប់')) return false;
      }

      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const matchName = recTeacherName.toLowerCase().includes(q);
        const matchClass = rec.classGrade.toLowerCase().includes(q);
        if (!matchName && !matchClass) return false;
      }

      return true;
    });
  }

  /**
   * Render Interactive Monitoring Checklist Table
   */
  function renderChecklistTable() {
    const tbody = document.getElementById('monitoring-table-body');
    if (!tbody) return;

    const filtered = getFilteredRecords();
    const countBadge = document.getElementById('filtered-count-badge');
    if (countBadge) {
      countBadge.textContent = `${KhmerCalendar.toKhmerNumber(filtered.length)} / ${KhmerCalendar.toKhmerNumber(state.dailyRecords.length)}`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="padding: 2.5rem; text-align: center; color: #64748B;">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 0.5rem auto; color: #94A3B8;"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            <p style="font-size: 1rem; font-weight: 600;">មិនមានទិន្នន័យគ្រូបង្រៀនត្រូវនឹងលក្ខខណ្ឌចម្រាញ់នេះទេ</p>
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    filtered.forEach((rec, idx) => {
      const isLeave = rec.remarks === 'ច្បាប់';
      const isLate = PSIS_Analytics.isRecordLate(rec, state.schoolInfo);
      const isIncomplete = PSIS_Analytics.isRecordIncomplete(rec, state.schoolInfo);

      let rowClass = 'row-normal';
      if (isLeave) {
        rowClass = 'row-leave';
      } else if (rec.remarks === 'គ្មានច្បាប់') {
        rowClass = 'row-danger';
      } else if (isLate) {
        rowClass = 'row-late';
      } else if (isIncomplete) {
        rowClass = 'row-incomplete';
      }

      const attDone = rec.attendanceRecorded === 'បានស្រង់';
      const scoreDone = rec.scoreEvaluated === 'បានដាក់ពិន្ទុ';
      const tgDone = rec.telegramUsed === 'បានប្រើ';
      const summDone = rec.lessonSummaryWritten === 'បានសរសេរ';

      const leaveDisabledAttr = isLeave ? 'disabled' : '';
      const leaveColClass = isLeave ? 'leave-disabled-col' : '';

      const teacher = state.teachers.find(t => t.id === rec.teacherId);
      const displayName = teacher ? teacher.name : rec.teacherName;
      const displayLevel = teacher ? teacher.level : rec.level;

      html += `
        <tr class="${rowClass}" data-record-id="${rec.id}">
          <!-- 1. ល.រ -->
          <td style="text-align: center; font-weight: 700; width: 42px;">
            ${KhmerCalendar.toKhmerNumber(idx + 1)}
          </td>

          <!-- 2. ឈ្មោះគ្រូ -->
          <td style="font-weight: 700; color: #1B365D; min-width: 140px;">
            <div style="display: flex; flex-direction: column;">
              <span>${escapeHtml(displayName)}</span>
              <span style="font-size: 0.75rem; font-weight: normal; color: #64748B;">
                ${escapeHtml(displayLevel)}
              </span>
            </div>
          </td>

          <!-- 3. ថ្នាក់ -->
          <td style="text-align: center; font-weight: 600; min-width: 85px;">
            <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #EEF2F6; border-radius: 4px; font-size: 0.82rem;">
              ${escapeHtml(cleanClassGrade(rec.classGrade))}
            </span>
          </td>

          <!-- 4. ម៉ោងស្កេនចូល -->
          <td class="${leaveColClass}" style="text-align: center; width: 125px;">
            <div class="time-input-container">
              <input type="time" class="time-input" value="${rec.scanInTime || ''}" 
                ${leaveDisabledAttr}
                onchange="PSIS_App.handleFieldChange('${rec.id}', 'scanInTime', this.value)" />
              <button type="button" class="time-btn-now" title="ដាក់ម៉ោងបច្ចុប្បន្ន"
                ${leaveDisabledAttr}
                onclick="PSIS_App.handleSetCurrentTime('${rec.id}', 'scanInTime')">
                ឥឡូវ
              </button>
            </div>
          </td>

          <!-- 5. ស្រង់វត្តមានសិស្ស -->
          <td class="${leaveColClass}" style="text-align: center; width: 115px;">
            <button type="button" 
              class="task-toggle-btn ${attDone ? 'completed' : 'missing'}"
              ${leaveDisabledAttr}
              onclick="PSIS_App.handleToggleTask('${rec.id}', 'attendanceRecorded')">
              ${attDone ? '✓ បានស្រង់' : '✕ មិនបានស្រង់'}
            </button>
          </td>

          <!-- 6. វាយតម្លៃពិន្ទុសិស្ស -->
          <td class="${leaveColClass}" style="text-align: center; width: 120px;">
            <button type="button" 
              class="task-toggle-btn ${scoreDone ? 'completed' : 'missing'}"
              ${leaveDisabledAttr}
              onclick="PSIS_App.handleToggleTask('${rec.id}', 'scoreEvaluated')">
              ${scoreDone ? '✓ បានដាក់ពិន្ទុ' : '✕ មិនបានដាក់ពិន្ទុ'}
            </button>
          </td>

          <!-- 7. ការប្រើប្រាស់ Telegram -->
          <td class="${leaveColClass}" style="text-align: center; width: 115px;">
            <button type="button" 
              class="task-toggle-btn ${tgDone ? 'completed' : 'missing'}"
              ${leaveDisabledAttr}
              onclick="PSIS_App.handleToggleTask('${rec.id}', 'telegramUsed')">
              ${tgDone ? '✓ បានប្រើ' : '✕ មិនបានប្រើ'}
            </button>
          </td>

          <!-- 8. សម្រង់អត្ថបទ -->
          <td class="${leaveColClass}" style="text-align: center; width: 115px;">
            <button type="button" 
              class="task-toggle-btn ${summDone ? 'completed' : 'missing'}"
              ${leaveDisabledAttr}
              onclick="PSIS_App.handleToggleTask('${rec.id}', 'lessonSummaryWritten')">
              ${summDone ? '✓ បានសរសេរ' : '✕ មិនបានសរសេរ'}
            </button>
          </td>

          <!-- 9. ម៉ោងស្កេនចេញ -->
          <td class="${leaveColClass}" style="text-align: center; width: 125px;">
            <div class="time-input-container">
              <input type="time" class="time-input" value="${rec.scanOutTime || ''}" 
                ${leaveDisabledAttr}
                onchange="PSIS_App.handleFieldChange('${rec.id}', 'scanOutTime', this.value)" />
              <button type="button" class="time-btn-now" title="ដាក់ម៉ោងបច្ចុប្បន្ន"
                ${leaveDisabledAttr}
                onclick="PSIS_App.handleSetCurrentTime('${rec.id}', 'scanOutTime')">
                ឥឡូវ
              </button>
            </div>
          </td>

          <!-- 10. ផ្សេងៗ / ស្ថានភាព -->
          <td style="text-align: center; min-width: 130px;">
            <div style="display: flex; flex-direction: column; gap: 0.25rem; align-items: center;">
              <select class="select-remarks" onchange="PSIS_App.handleRemarksChange('${rec.id}', this.value)">
                <option value="ធម្មតា" ${rec.remarks === 'ធម្មតា' ? 'selected' : ''}>ធម្មតា (Normal)</option>
                <option value="ច្បាប់" ${rec.remarks === 'ច្បាប់' ? 'selected' : ''}>ច្បាប់ (On Leave)</option>
                <option value="យឺត" ${rec.remarks === 'យឺត' ? 'selected' : ''}>យឺត (Late)</option>
                <option value="គ្មានច្បាប់" ${rec.remarks === 'គ្មានច្បាប់' ? 'selected' : ''}>គ្មានច្បាប់ (Absent)</option>
              </select>
              <input type="text" placeholder="កំណត់សម្គាល់..." 
                value="${escapeHtml(rec.note || '')}" 
                style="width: 115px; font-size: 0.75rem; padding: 2px 5px; border: 1px solid #CBD5E1; border-radius: 3px;"
                onchange="PSIS_App.handleFieldChange('${rec.id}', 'note', this.value)" />
            </div>
          </td>

          <!-- 11. សកម្មភាព -->
          <td style="text-align: center; width: 110px;">
            <button type="button" class="btn btn-sm btn-outline" 
              title="បំពេញគ្រប់កិច្ចការទាំងអស់សម្រាប់គ្រូនេះតែម្តង"
              onclick="PSIS_App.handleMarkRowCompleted('${rec.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>បំពេញគ្រប់</span>
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  function handleFieldChange(recordId, field, value) {
    const rec = state.dailyRecords.find(r => r.id === recordId);
    if (!rec) return;

    rec[field] = value;
    saveCurrentRecords();
    renderChecklistTable();
    updateKPIs();
  }

  function handleSetCurrentTime(recordId, field) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hh}:${mm}`;

    handleFieldChange(recordId, field, timeStr);
    showToast(`បានបញ្ចូលម៉ោង ${timeStr}`, 'success');
  }

  function handleToggleTask(recordId, field) {
    const rec = state.dailyRecords.find(r => r.id === recordId);
    if (!rec || rec.remarks === 'ច្បាប់') return;

    if (field === 'attendanceRecorded') {
      rec[field] = rec[field] === 'បានស្រង់' ? 'មិនបានស្រង់' : 'បានស្រង់';
    } else if (field === 'scoreEvaluated') {
      rec[field] = rec[field] === 'បានដាក់ពិន្ទុ' ? 'មិនបានដាក់ពិន្ទុ' : 'បានដាក់ពិន្ទុ';
    } else if (field === 'telegramUsed') {
      rec[field] = rec[field] === 'បានប្រើ' ? 'មិនបានប្រើ' : 'បានប្រើ';
    } else if (field === 'lessonSummaryWritten') {
      rec[field] = rec[field] === 'បានសរសេរ' ? 'មិនបានសរសេរ' : 'បានសរសេរ';
    }

    saveCurrentRecords();
    renderChecklistTable();
    updateKPIs();
  }

  function handleRemarksChange(recordId, newRemarks) {
    const rec = state.dailyRecords.find(r => r.id === recordId);
    if (!rec) return;

    rec.remarks = newRemarks;

    if (newRemarks === 'ច្បាប់') {
      rec.attendanceRecorded = 'មិនបានស្រង់';
      rec.scoreEvaluated = 'មិនបានដាក់ពិន្ទុ';
      rec.telegramUsed = 'មិនបានប្រើ';
      rec.lessonSummaryWritten = 'មិនបានសរសេរ';
      rec.scanInTime = '';
      rec.scanOutTime = '';
      if (!rec.note) rec.note = 'គ្រូសុំច្បាប់សម្រាក';
      showToast(`គ្រូ ${rec.teacherName} បានជ្រើសរើសច្បាប់ (បិទជួរឈរ ៤ ដល់ ៩)`, 'warning');
    } else if (newRemarks === 'ធម្មតា' && rec.attendanceRecorded === 'មិនបានស្រង់') {
      rec.attendanceRecorded = 'បានស្រង់';
      rec.scoreEvaluated = 'បានដាក់ពិន្ទុ';
      rec.telegramUsed = 'បានប្រើ';
      rec.lessonSummaryWritten = 'បានសរសេរ';
    }

    saveCurrentRecords();
    renderChecklistTable();
    updateKPIs();
  }

  function handleMarkRowCompleted(recordId) {
    const rec = state.dailyRecords.find(r => r.id === recordId);
    if (!rec) return;

    const isMorning = rec.shift === 'ព្រឹក';
    rec.scanInTime = isMorning ? '06:55' : '12:55';
    rec.attendanceRecorded = 'បានស្រង់';
    rec.scoreEvaluated = 'បានដាក់ពិន្ទុ';
    rec.telegramUsed = 'បានប្រើ';
    rec.lessonSummaryWritten = 'បានសរសេរ';
    rec.scanOutTime = isMorning ? '11:35' : '17:15';
    rec.remarks = 'ធម្មតា';

    saveCurrentRecords();
    renderChecklistTable();
    updateKPIs();
    showToast(`បានបំពេញកិច្ចការគ្រប់ជ្រុងជ្រោយសម្រាប់ ${rec.teacherName}`, 'success');
  }

  function handleBulkCompleteAll() {
    let count = 0;
    state.dailyRecords.forEach(rec => {
      if (rec.remarks === 'ច្បាប់') return;
      const isMorning = rec.shift === 'ព្រឹក';
      rec.scanInTime = rec.scanInTime || (isMorning ? '06:55' : '12:55');
      rec.attendanceRecorded = 'បានស្រង់';
      rec.scoreEvaluated = 'បានដាក់ពិន្ទុ';
      rec.telegramUsed = 'បានប្រើ';
      rec.lessonSummaryWritten = 'បានសរសេរ';
      rec.scanOutTime = rec.scanOutTime || (isMorning ? '11:35' : '17:15');
      rec.remarks = 'ធម្មតា';
      count++;
    });

    saveCurrentRecords();
    renderChecklistTable();
    updateKPIs();
    showToast(`បានបំពេញគ្រប់កិច្ចការទាំងអស់សម្រាប់គ្រូ ${KhmerCalendar.toKhmerNumber(count)} នាក់`, 'success');
  }

  function handleBulkColumnAction(taskField, completedValue) {
    let count = 0;
    state.dailyRecords.forEach(rec => {
      if (rec.remarks === 'ច្បាប់') return;
      rec[taskField] = completedValue;
      count++;
    });

    saveCurrentRecords();
    renderChecklistTable();
    updateKPIs();
    showToast(`បានកែប្រែទិន្នន័យជួរឈរសម្រាប់គ្រូ ${KhmerCalendar.toKhmerNumber(count)} នាក់`, 'success');
  }

  function handleBulkFillScanTimes(type) {
    let count = 0;
    state.dailyRecords.forEach(rec => {
      if (rec.remarks === 'ច្បាប់') return;
      const isMorning = rec.shift === 'ព្រឹក';
      if (type === 'in' && !rec.scanInTime) {
        rec.scanInTime = isMorning ? '06:55' : '12:55';
        count++;
      } else if (type === 'out' && !rec.scanOutTime) {
        rec.scanOutTime = isMorning ? '11:35' : '17:15';
        count++;
      }
    });

    saveCurrentRecords();
    renderChecklistTable();
    updateKPIs();
    showToast(`បានបញ្ចូលម៉ោងស្វ័យប្រវត្តសម្រាប់គ្រូ ${KhmerCalendar.toKhmerNumber(count)} នាក់`, 'success');
  }

  /**
   * Render Official A4 Print & PDF Preview (Reflects Active Branch)
   * Designed to exactly match the Official PSIS Daily Teacher Administrative Form template
   */
  function renderPrintReport() {
    const printArea = document.getElementById('print-document-content');
    if (!printArea) return;

    const d = typeof state.currentDate === 'string' ? new Date(state.currentDate + 'T00:00:00') : new Date(state.currentDate);
    const dayOfWeekKh = KhmerCalendar.DAYS_OF_WEEK[d.getDay()].replace('ថ្ងៃ', '');
    const dayKh = KhmerCalendar.toKhmerNumber(d.getDate());
    const monthKh = KhmerCalendar.GREGORIAN_MONTHS_KH[d.getMonth()];
    const yearKh = KhmerCalendar.toKhmerNumber(d.getFullYear());

    const shortLunarStr = KhmerCalendar.getShortOfficialLunarDate 
      ? KhmerCalendar.getShortOfficialLunarDate(state.currentDate) 
      : KhmerCalendar.getKhmerLunarDateString(state.currentDate).replace('ពុទ្ធសករាជ', 'ព.ស.');

    const branchPrint = state.schoolInfo.branchPrint || (state.currentBranchId === 'psis-ix' ? 'សាខាទី ៩' : (state.schoolInfo.branchShort || 'សាខា...'));
    const principal = state.schoolInfo.principalName || 'ហៀង ពលៈ';
    const inspector = state.schoolInfo.inspectorName || 'ឈុន វុទ្ធី';

    let rowsHtml = '';
    const activeRecords = state.dailyRecords.filter(r => state.teachers.some(t => t.id === r.teacherId));
    activeRecords.forEach((r, idx) => {
      const isLeave = r.remarks === 'ច្បាប់';
      const scanIn = isLeave ? '-' : (r.scanInTime || '-');
      const att = isLeave ? '-' : (r.attendanceRecorded || 'បានស្រង់');
      const score = isLeave ? '-' : (r.scoreEvaluated || 'បានដាក់ពិន្ទុ');
      const tg = isLeave ? '-' : (r.telegramUsed || 'បានប្រើ');
      const summ = isLeave ? '-' : (r.lessonSummaryWritten || 'បានសរសេរ');
      const scanOut = isLeave ? '-' : (r.scanOutTime || '-');

      const teacher = state.teachers.find(t => t.id === r.teacherId);
      const teacherName = teacher ? teacher.name : r.teacherName;

      let remarksText = r.remarks || '';
      if (r.note && r.note.trim()) {
        remarksText = (r.remarks && r.remarks !== 'ធម្មតា') ? `${r.remarks} (${r.note})` : r.note;
      }

      const isAttNotDone = att && att.includes('មិន');
      const isScoreNotDone = score && score.includes('មិន');
      const isTgNotDone = tg && tg.includes('មិន');
      const isSummNotDone = summ && summ.includes('មិន');
      const isRemarksNotDone = remarksText && (remarksText.includes('មិនបាន') || remarksText.includes('មិនទាន់'));

      rowsHtml += `
        <tr>
          <td class="col-center">${KhmerCalendar.toKhmerNumber(idx + 1)}</td>
          <td class="col-name">${escapeHtml(teacherName)}</td>
          <td class="col-center">${escapeHtml(cleanClassGrade(r.classGrade))}</td>
          <td class="col-center">${escapeHtml(scanIn)}</td>
          <td class="col-center ${isAttNotDone ? 'cell-not-done' : ''}" ${isAttNotDone ? 'style="color: #DC2626 !important; font-weight: 700;"' : ''}>${escapeHtml(att)}</td>
          <td class="col-center ${isScoreNotDone ? 'cell-not-done' : ''}" ${isScoreNotDone ? 'style="color: #DC2626 !important; font-weight: 700;"' : ''}>${escapeHtml(score)}</td>
          <td class="col-center ${isTgNotDone ? 'cell-not-done' : ''}" ${isTgNotDone ? 'style="color: #DC2626 !important; font-weight: 700;"' : ''}>${escapeHtml(tg)}</td>
          <td class="col-center ${isSummNotDone ? 'cell-not-done' : ''}" ${isSummNotDone ? 'style="color: #DC2626 !important; font-weight: 700;"' : ''}>${escapeHtml(summ)}</td>
          <td class="col-center">${escapeHtml(scanOut)}</td>
          <td class="col-center ${isRemarksNotDone ? 'cell-not-done' : ''}" ${isRemarksNotDone ? 'style="color: #DC2626 !important; font-weight: 600;"' : ''}>${escapeHtml(remarksText)}</td>
        </tr>
      `;
    });

    const docHtml = `
      <div class="official-document-sheet" id="official-sheet">
        <div class="official-top-header">
          <div class="official-school-side">
            <img src="assets/logo.png" alt="PSIS Logo" class="official-school-logo-print" />
            <div class="official-school-name-line">
              សាលាបញ្ញាសាស្រ្តអន្តរជាតិ ${escapeHtml(branchPrint)}
            </div>
          </div>

          <div class="official-kingdom-side">
            <div class="official-kingdom-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div class="official-kingdom-motto">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            <div class="official-kingdom-kbach-wrap">
              <svg class="official-kingdom-kbach" viewBox="0 0 160 20" width="135" height="17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M80 1 C76.5 4.8 75.2 8.5 80 14 C84.8 8.5 83.5 4.8 80 1 Z" fill="#1B365D" />
                <path d="M80 5 C75 7.5 72.5 11 77.5 14.5 C78.8 13.2 79.5 10.5 80 8.5 Z" fill="#1B365D" />
                <path d="M80 5 C85 7.5 87.5 11 82.5 14.5 C81.2 13.2 80.5 10.5 80 8.5 Z" fill="#1B365D" />
                <circle cx="80" cy="17" r="1.5" fill="#1B365D" />
                <path d="M76 11.5 C68 13 58 7 49 9.5 C42 11.2 37 14 30 11.8 C24 10 18 8.5 11 11 C7 12 3 10.5 0 8.5 C5 7.5 12 8.5 17 9.5 C23 10.7 30 8.5 36 7.5 C45 6 55 10 65 8.5 C69 8 73.5 9.5 76 11.5 Z" fill="#1B365D" />
                <path d="M84 11.5 C92 13 102 7 111 9.5 C118 11.2 123 14 130 11.8 C136 10 142 8.5 149 11 C153 12 157 10.5 160 8.5 C155 7.5 148 8.5 143 9.5 C137 10.7 130 8.5 124 7.5 C115 6 105 10 95 8.5 C91 8 86.5 9.5 84 11.5 Z" fill="#1B365D" />
                <circle cx="63" cy="6" r="1.2" fill="#1B365D" />
                <circle cx="97" cy="6" r="1.2" fill="#1B365D" />
                <circle cx="45" cy="12.5" r="1.1" fill="#1B365D" />
                <circle cx="115" cy="12.5" r="1.1" fill="#1B365D" />
                <circle cx="28" cy="9.5" r="1" fill="#1B365D" />
                <circle cx="132" cy="9.5" r="1" fill="#1B365D" />
                <circle cx="12" cy="10" r="1.2" fill="#1B365D" />
                <circle cx="148" cy="10" r="1.2" fill="#1B365D" />
              </svg>
            </div>
          </div>
        </div>

        <div class="official-report-title-block">
          <div class="official-report-title">របាយការណ៍ត្រួតពិនិត្យរដ្ឋបាលគ្រូប្រចាំថ្ងៃ</div>
          <div class="official-report-date-line">
            ថ្ងៃ <span class="print-dotted-field">${escapeHtml(dayOfWeekKh)}</span> ទី <span class="print-dotted-field" style="min-width: 45px;">${escapeHtml(dayKh)}</span> ខែ <span class="print-dotted-field">${escapeHtml(monthKh)}</span> ឆ្នាំ <span class="print-dotted-field" style="min-width: 65px;">${escapeHtml(yearKh)}</span>
          </div>
        </div>

        <table class="official-print-table">
          <thead>
            <tr>
              <th style="width: 45px;">ល.រ</th>
              <th style="width: 155px;">ឈ្មោះគ្រូ</th>
              <th style="width: 65px;">ថ្នាក់</th>
              <th style="width: 80px;">ម៉ោងស្កេន<br>ចូល</th>
              <th style="width: 85px;">ស្រង់វត្តមាន<br>សិស្ស</th>
              <th style="width: 85px;">វាយតម្លៃ<br>ពិន្ទុសិស្ស</th>
              <th style="width: 95px;">ការប្រើប្រាស់<br>Telegram</th>
              <th style="width: 80px;">សម្រង់<br>អត្ថបទ</th>
              <th style="width: 80px;">ម៉ោងស្កេន<br>ចេញ</th>
              <th style="width: 90px;">ផ្សេងៗ</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="official-signature-block">
          <div class="signature-col-left">
            <div class="sig-title-moul">បានឃើញនិងឯកភាព</div>
            <div class="sig-title-moul">នាយកសាលា</div>
            <div class="sig-space sig-space-interactive" onclick="PSIS_App.openSignatureModal('principal')" title="ចុចត្រង់នេះដើម្បីបញ្ចូល ឬប្តូរហត្ថលេខាឌីជីថល (Upload Digital Signature)">
              ${state.schoolInfo.principalSignature ? `<img src="${state.schoolInfo.principalSignature}" alt="ហត្ថលេខានាយកសាលា" class="digital-signature-img" />` : `<span class="sig-upload-hint no-print">✍️ បញ្ចូលហត្ថលេខា Digital</span>`}
            </div>
            <div class="sig-name-moul">${escapeHtml(principal)}</div>
          </div>

          <div class="signature-col-right">
            <div class="sig-lunar-date">${escapeHtml(shortLunarStr)}</div>
            <div class="sig-solar-date">${escapeHtml(branchPrint)} ថ្ងៃទី${escapeHtml(dayKh)} ខែ${escapeHtml(monthKh)} ឆ្នាំ${escapeHtml(yearKh)}</div>
            <div class="sig-title-moul" style="margin-top: 4px;">អ្នកត្រួតពិនិត្យ</div>
            <div class="sig-space sig-space-interactive" onclick="PSIS_App.openSignatureModal('inspector')" title="ចុចត្រង់នេះដើម្បីបញ្ចូល ឬប្តូរហត្ថលេខាឌីជីថល (Upload Digital Signature)">
              ${state.schoolInfo.inspectorSignature ? `<img src="${state.schoolInfo.inspectorSignature}" alt="ហត្ថលេខាអ្នកត្រួតពិនិត្យ" class="digital-signature-img" />` : `<span class="sig-upload-hint no-print">✍️ បញ្ចូលហត្ថលេខា Digital</span>`}
            </div>
            <div class="sig-name-moul">${escapeHtml(inspector)}</div>
          </div>
        </div>
      </div>
    `;

    printArea.innerHTML = docHtml;
  }

  /**
   * Open Digital Signature Upload Modal
   */
  function openSignatureModal(focusType = null) {
    const modal = document.getElementById('signature-modal');
    if (!modal) return;

    // Populate current principal info
    const principalNameEl = document.getElementById('sig-principal-name-label');
    if (principalNameEl) {
      principalNameEl.textContent = `ឈ្មោះ៖ ${state.schoolInfo.principalName || 'ហៀង ពលៈ'}`;
    }
    const principalImg = document.getElementById('sig-principal-img');
    const principalEmpty = document.getElementById('sig-principal-empty-text');
    const principalRemoveBtn = document.getElementById('sig-principal-remove-btn');
    if (state.schoolInfo.principalSignature) {
      if (principalImg) {
        principalImg.src = state.schoolInfo.principalSignature;
        principalImg.style.display = 'block';
      }
      if (principalEmpty) principalEmpty.style.display = 'none';
      if (principalRemoveBtn) principalRemoveBtn.style.display = 'block';
    } else {
      if (principalImg) {
        principalImg.src = '';
        principalImg.style.display = 'none';
      }
      if (principalEmpty) principalEmpty.style.display = 'block';
      if (principalRemoveBtn) principalRemoveBtn.style.display = 'none';
    }

    // Populate current inspector info
    const inspectorNameEl = document.getElementById('sig-inspector-name-label');
    if (inspectorNameEl) {
      inspectorNameEl.textContent = `ឈ្មោះ៖ ${state.schoolInfo.inspectorName || 'ឈុន វុទ្ធី'}`;
    }
    const inspectorImg = document.getElementById('sig-inspector-img');
    const inspectorEmpty = document.getElementById('sig-inspector-empty-text');
    const inspectorRemoveBtn = document.getElementById('sig-inspector-remove-btn');
    if (state.schoolInfo.inspectorSignature) {
      if (inspectorImg) {
        inspectorImg.src = state.schoolInfo.inspectorSignature;
        inspectorImg.style.display = 'block';
      }
      if (inspectorEmpty) inspectorEmpty.style.display = 'none';
      if (inspectorRemoveBtn) inspectorRemoveBtn.style.display = 'block';
    } else {
      if (inspectorImg) {
        inspectorImg.src = '';
        inspectorImg.style.display = 'none';
      }
      if (inspectorEmpty) inspectorEmpty.style.display = 'block';
      if (inspectorRemoveBtn) inspectorRemoveBtn.style.display = 'none';
    }

    modal.classList.add('active');
  }

  /**
   * Handle Signature File Selection & Upload (converts image to DataURL and persists in localStorage)
   */
  function handleSignatureFileChange(event, type) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសឯកសារជារូបភាព (PNG, JPG, WEBP)!');
      return;
    }

    // Max size: 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('ទំហំរូបភាពមិនត្រូវលើសពី 2MB ឡើយ!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (type === 'principal') {
        state.schoolInfo.principalSignature = dataUrl;
      } else if (type === 'inspector') {
        state.schoolInfo.inspectorSignature = dataUrl;
      }

      // Save to localStorage
      PSIS_Storage.saveSchoolInfo(state.schoolInfo, state.currentBranchId);

      // Re-render modal preview and document
      openSignatureModal();
      renderPrintReport();
      showToast(`បានបញ្ចូលហត្ថលេខាឌីជីថលដោយជោគជ័យ!`, 'success');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  /**
   * Remove Digital Signature
   */
  function handleRemoveSignature(type) {
    if (type === 'principal') {
      delete state.schoolInfo.principalSignature;
    } else if (type === 'inspector') {
      delete state.schoolInfo.inspectorSignature;
    }

    // Save to localStorage
    PSIS_Storage.saveSchoolInfo(state.schoolInfo, state.currentBranchId);

    // Re-render modal preview and document
    openSignatureModal();
    renderPrintReport();
    showToast(`បានលុបហត្ថលេខាឌីជីថលរួចរាល់`, 'info');
  }

  /**
   * Render Monthly Summary
   */
  function renderMonthlySummary() {
    const container = document.getElementById('monthly-summary-container');
    if (!container) return;

    const allChecklists = PSIS_Storage.getAllChecklists(state.currentBranchId);
    const stats = PSIS_Analytics.calculateMonthlyStats(allChecklists, state.monthlyYearMonth, state.teachers, state.schoolInfo);

    let rowsHtml = '';
    stats.teacherStats.forEach((t, idx) => {
      let badgeBg = '#ECFDF5';
      let badgeColor = '#065F46';
      if (t.gradeColor === 'blue') { badgeBg = '#EFF6FF'; badgeColor = '#1E40AF'; }
      if (t.gradeColor === 'yellow') { badgeBg = '#FFFBEB'; badgeColor = '#92400E'; }
      if (t.gradeColor === 'red') { badgeBg = '#FEF2F2'; badgeColor = '#991B1B'; }

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${KhmerCalendar.toKhmerNumber(idx + 1)}</td>
          <td style="font-weight: 700; color: #1B365D;">${escapeHtml(t.teacherName)}</td>
          <td>${escapeHtml(t.level)} <span style="color: #64748B; font-size: 0.8rem;">(${escapeHtml(t.subject || 'ទូទៅ')})</span></td>
          <td style="text-align: center;">${KhmerCalendar.toKhmerNumber(t.daysScheduled)}</td>
          <td style="text-align: center; color: #059669; font-weight: 600;">${KhmerCalendar.toKhmerNumber(t.daysPresent)}</td>
          <td style="text-align: center; color: #64748B;">${KhmerCalendar.toKhmerNumber(t.daysLeave)}</td>
          <td style="text-align: center; color: #D97706; font-weight: 600;">${KhmerCalendar.toKhmerNumber(t.daysLate)}</td>
          <td style="text-align: center; font-weight: 600;">${KhmerCalendar.toKhmerNumber(t.fullyCompletedDays)}</td>
          <td style="text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <div style="width: 60px; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden;">
                <div style="width: ${t.complianceRate}%; height: 100%; background: ${t.complianceRate >= 80 ? '#10B981' : (t.complianceRate >= 65 ? '#F59E0B' : '#EF4444')};"></div>
              </div>
              <span style="font-weight: 700;">${KhmerCalendar.toKhmerNumber(t.complianceRate)}%</span>
            </div>
          </td>
          <td style="text-align: center;">
            <span style="padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 700; background: ${badgeBg}; color: ${badgeColor};">
              ${escapeHtml(t.gradeLabel)}
            </span>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-header-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            <span>របាយការណ៍សង្ខេបការអនុវត្តរដ្ឋបាលគ្រូប្រចាំខែ (${escapeHtml(state.monthlyYearMonth)}) - ${escapeHtml(state.schoolInfo.branch)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="month" class="form-control" value="${state.monthlyYearMonth}" 
              onchange="PSIS_App.handleMonthChange(this.value)" />
            <button class="btn btn-outline btn-sm" onclick="PSIS_App.handleExportMonthlyExcel()">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>នាំចេញ Excel</span>
            </button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="psis-table">
            <thead>
              <tr>
                <th>ល.រ</th>
                <th>ឈ្មោះគ្រូ</th>
                <th>កម្រិត/មុខវិជ្ជា</th>
                <th>ថ្ងៃបង្រៀនសរុប</th>
                <th>វត្តមាន</th>
                <th>សុំច្បាប់</th>
                <th>មកយឺត</th>
                <th>បំពេញគ្រប់</th>
                <th>អត្រាអនុវត្ត (%)</th>
                <th>ការវាយតម្លៃ</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="10" style="text-align: center; padding: 2rem;">មិនមានទិន្នន័យក្នុងខែនេះទេ</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function handleMonthChange(val) {
    state.monthlyYearMonth = val;
    renderMonthlySummary();
  }

  function renderTeachersTable() {
    const tbody = document.getElementById('teachers-table-body');
    if (!tbody) return;

    let html = '';
    state.teachers.forEach((t, idx) => {
      html += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${KhmerCalendar.toKhmerNumber(idx + 1)}</td>
          <td style="font-weight: 700; color: #1B365D;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #E0E7FF; color: #1B365D; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;">
                ${t.name.charAt(0)}
              </div>
              <span>${escapeHtml(t.name)}</span>
            </div>
          </td>
          <td style="text-align: center;">${escapeHtml(t.gender || 'ប្រុស')}</td>
          <td>${escapeHtml(t.phone || '-')}</td>
          <td><span class="badge" style="background: #F1F5F9; color: #334155; font-size: 0.8rem; padding: 2px 8px; border-radius: 4px;">${escapeHtml(t.level)}</span></td>
          <td>${escapeHtml(t.subject || '-')}</td>
          <td style="text-align: center;">${escapeHtml(cleanClassGrade(t.defaultClass))}</td>
          <td style="text-align: center;">
            <span class="badge-status badge-normal">សកម្ម</span>
          </td>
          <td style="text-align: center;">
            <div style="display: flex; justify-content: center; gap: 0.35rem;">
              <button class="btn btn-sm btn-outline btn-icon" title="កែប្រែ" onclick="PSIS_App.openEditTeacherModal('${t.id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <button class="btn btn-sm btn-outline btn-icon" style="color: #EF4444;" title="លុប" onclick="PSIS_App.handleDeleteTeacher('${t.id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  function formatScheduleDaysBadge(days, singleDay) {
    const list = (Array.isArray(days) && days.length > 0) ? days.map(Number) : [Number(singleDay || 1)];
    const sorted = [...list].sort((a,b) => a - b);
    if (sorted.length === 5 && sorted[0] === 1 && sorted[4] === 5) {
      return '<span class="day-badge day-badge-all">ចន្ទ ដល់ សុក្រ</span>';
    }
    const names = { 1: 'ចន្ទ', 2: 'អង្គារ', 3: 'ពុធ', 4: 'ព្រហស្បតិ៍', 5: 'សុក្រ' };
    const text = sorted.map(d => names[d] || d).join(', ');
    return `<span class="day-badge day-badge-partial">${escapeHtml(text)}</span>`;
  }

  function renderSchedulesTable() {
    const tbody = document.getElementById('schedules-table-body');
    if (!tbody) return;

    let html = '';
    state.schedules.forEach((s, idx) => {
      const teacher = state.teachers.find(t => t.id === s.teacherId);
      const teacherName = teacher ? teacher.name : s.teacherName;
      const teacherLevel = teacher ? teacher.level : s.level;

      html += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${KhmerCalendar.toKhmerNumber(idx + 1)}</td>
          <td style="font-weight: 700; color: #1B365D;">${escapeHtml(teacherName)}</td>
          <td style="font-weight: 600; color: #0A2540;">${formatScheduleDaysBadge(s.days, s.dayOfWeek)}</td>
          <td style="text-align: center; font-weight: 600;"><span style="padding: 2px 8px; background: #EEF2F6; border-radius: 4px;">${escapeHtml(cleanClassGrade(s.classGrade))}</span></td>
          <td>${escapeHtml(teacherLevel)}</td>
          <td style="text-align: center;">
            <div style="display: flex; justify-content: center; gap: 0.35rem;">
              <button class="btn btn-sm btn-outline btn-icon" title="កែប្រែកាលវិភាគ" onclick="PSIS_App.openEditScheduleModal('${s.id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <button class="btn btn-sm btn-outline btn-icon" style="color: #EF4444;" title="លុបកាលវិភាគ" onclick="PSIS_App.handleDeleteSchedule('${s.id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  function openAddTeacherModal() {
    document.getElementById('teacher-form').reset();
    document.getElementById('teacher-id').value = '';
    document.getElementById('teacher-modal-title').textContent = 'បន្ថែមព័ត៌មានគ្រូបង្រៀនថ្មី';
    openModal('teacher-modal');
  }

  function openEditTeacherModal(id) {
    const t = state.teachers.find(item => item.id === id);
    if (!t) return;

    document.getElementById('teacher-id').value = t.id;
    document.getElementById('teacher-name').value = t.name;
    document.getElementById('teacher-gender').value = t.gender || 'ប្រុស';
    document.getElementById('teacher-phone').value = t.phone || '';
    document.getElementById('teacher-level').value = t.level || 'បឋមសិក្សា';
    document.getElementById('teacher-subject').value = t.subject || '';
    document.getElementById('teacher-default-class').value = t.defaultClass || '';

    document.getElementById('teacher-modal-title').textContent = 'កែប្រែព័ត៌មានគ្រូបង្រៀន';
    openModal('teacher-modal');
  }

  function handleSaveTeacher(e) {
    e.preventDefault();
    const id = document.getElementById('teacher-id').value;
    const name = document.getElementById('teacher-name').value.trim();
    if (!name) {
      alert('សូមបញ្ចូលឈ្មោះគ្រូបង្រៀន!');
      return;
    }

    const teacherData = {
      name: name,
      gender: document.getElementById('teacher-gender').value,
      phone: document.getElementById('teacher-phone').value.trim(),
      level: document.getElementById('teacher-level').value,
      subject: document.getElementById('teacher-subject').value.trim(),
      defaultClass: cleanClassGrade(document.getElementById('teacher-default-class').value.trim(), ''),
      status: 'សកម្ម'
    };

    if (id) {
      teacherData.id = id;
      PSIS_Storage.updateTeacher(teacherData, state.currentBranchId);
      showToast('បានកែប្រែព័ត៌មានគ្រូជោគជ័យ!', 'success');
    } else {
      PSIS_Storage.addTeacher(teacherData, state.currentBranchId);
      showToast('បានបន្ថែមគ្រូបង្រៀនថ្មីជោគជ័យ!', 'success');
    }

    state.teachers = PSIS_Storage.getTeachers(state.currentBranchId);
    state.schedules = PSIS_Storage.getSchedules(state.currentBranchId);
    loadDailyRecords();
    renderAll();
    closeModal('teacher-modal');
  }

  function handleDeleteTeacher(id) {
    const t = state.teachers.find(item => item.id === id);
    if (!t) return;
    if (confirm(`តើអ្នកពិតជាចង់លុបគ្រូ "${t.name}" មែនទេ?`)) {
      PSIS_Storage.deleteTeacher(id, state.currentBranchId);
      state.teachers = PSIS_Storage.getTeachers(state.currentBranchId);
      state.schedules = PSIS_Storage.getSchedules(state.currentBranchId);
      loadDailyRecords();
      renderAll();
      showToast(`បានលុបគ្រូ ${t.name}`, 'warning');
    }
  }

  function applyDayPreset(preset) {
    const checkboxes = document.querySelectorAll('input[name="schedule-days"]');
    let targetDays = [];
    if (preset === 'mon-fri') {
      targetDays = [1, 2, 3, 4, 5];
    } else if (preset === 'mon-wed') {
      targetDays = [1, 3];
    } else if (preset === 'mon-wed-fri') {
      targetDays = [1, 3, 5];
    } else if (preset === 'tue-thu') {
      targetDays = [2, 4];
    } else if (preset === 'clear') {
      targetDays = [];
    }

    checkboxes.forEach(cb => {
      cb.checked = targetDays.includes(parseInt(cb.value, 10));
    });

    document.querySelectorAll('.btn-day-preset').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`preset-${preset}`);
    if (activeBtn) activeBtn.classList.add('active');

    updateSelectedDaysSummary();
  }

  function updateSelectedDaysSummary() {
    const checked = Array.from(document.querySelectorAll('input[name="schedule-days"]:checked'))
      .map(cb => parseInt(cb.value, 10))
      .sort((a,b) => a - b);
    const summaryEl = document.getElementById('selected-days-summary');
    if (!summaryEl) return;

    if (checked.length === 0) {
      summaryEl.textContent = 'មិនទាន់ជ្រើសរើសថ្ងៃ!';
      summaryEl.style.color = '#EF4444';
      summaryEl.style.background = '#FEE2E2';
      return;
    }

    summaryEl.style.color = '#1B365D';
    summaryEl.style.background = '#EEF2F6';

    if (checked.length === 5 && checked[0] === 1 && checked[4] === 5) {
      summaryEl.textContent = 'បានជ្រើសរើស: ចន្ទ ដល់ សុក្រ';
    } else {
      const names = { 1: 'ចន្ទ', 2: 'អង្គារ', 3: 'ពុធ', 4: 'ព្រហ', 5: 'សុក្រ' };
      summaryEl.textContent = 'បានជ្រើសរើស: ' + checked.map(d => names[d] || d).join(', ');
    }
  }

  function onScheduleDayCheckboxChange() {
    const checked = Array.from(document.querySelectorAll('input[name="schedule-days"]:checked'))
      .map(cb => parseInt(cb.value, 10))
      .sort((a,b) => a - b);
    const str = checked.join(',');

    document.querySelectorAll('.btn-day-preset').forEach(btn => btn.classList.remove('active'));
    if (str === '1,2,3,4,5') {
      const b = document.getElementById('preset-mon-fri');
      if (b) b.classList.add('active');
    } else if (str === '1,3') {
      const b = document.getElementById('preset-mon-wed');
      if (b) b.classList.add('active');
    } else if (str === '1,3,5') {
      const b = document.getElementById('preset-mon-wed-fri');
      if (b) b.classList.add('active');
    } else if (str === '2,4') {
      const b = document.getElementById('preset-tue-thu');
      if (b) b.classList.add('active');
    }

    updateSelectedDaysSummary();
  }

  function onScheduleTeacherSelectChange(selectEl) {
    if (!selectEl) return;
    const selectedOption = selectEl.options[selectEl.selectedIndex];
    if (!selectedOption) return;
    const level = selectedOption.getAttribute('data-level');
    const defaultClass = selectedOption.getAttribute('data-class');

    const classInput = document.getElementById('schedule-class');
    if (classInput && defaultClass) {
      classInput.value = cleanClassGrade(defaultClass, '');
    }

    // Auto-suggest preset based on teacher's education level
    if (level === 'មត្តេយ្យ' || level === 'បឋមសិក្សា') {
      applyDayPreset('mon-fri');
    } else if (level === 'អនុវិទ្យាល័យ-វិទ្យាល័យ') {
      applyDayPreset('mon-wed');
    }
  }

  function openAddScheduleModal() {
    const form = document.getElementById('schedule-form');
    if (form) form.reset();
    const idInput = document.getElementById('schedule-id');
    if (idInput) idInput.value = '';
    const titleEl = document.getElementById('schedule-modal-title');
    if (titleEl) titleEl.textContent = 'ចាត់ចែងកាលវិភាគបង្រៀនថ្មី';

    const teacherSelect = document.getElementById('schedule-teacher-select');
    teacherSelect.innerHTML = state.teachers.map(t => 
      `<option value="${t.id}" data-name="${escapeHtml(t.name)}" data-level="${escapeHtml(t.level)}" data-class="${escapeHtml(cleanClassGrade(t.defaultClass, ''))}">${escapeHtml(t.name)} (${escapeHtml(t.level)})</option>`
    ).join('');

    if (state.teachers.length > 0) {
      onScheduleTeacherSelectChange(teacherSelect);
    } else {
      applyDayPreset('mon-fri');
    }

    openModal('schedule-modal');
  }

  function openEditScheduleModal(id) {
    const s = state.schedules.find(item => item.id === id);
    if (!s) return;

    const idInput = document.getElementById('schedule-id');
    if (idInput) idInput.value = s.id;
    const titleEl = document.getElementById('schedule-modal-title');
    if (titleEl) titleEl.textContent = 'កែប្រែកាលវិភាគបង្រៀន';

    const teacherSelect = document.getElementById('schedule-teacher-select');
    teacherSelect.innerHTML = state.teachers.map(t => 
      `<option value="${t.id}" data-name="${escapeHtml(t.name)}" data-level="${escapeHtml(t.level)}" data-class="${escapeHtml(cleanClassGrade(t.defaultClass, ''))}">${escapeHtml(t.name)} (${escapeHtml(t.level)})</option>`
    ).join('');

    if (s.teacherId) {
      teacherSelect.value = s.teacherId;
    }

    const classInput = document.getElementById('schedule-class');
    if (classInput) {
      classInput.value = cleanClassGrade(s.classGrade, '');
    }

    // Populate day checkboxes
    const days = (Array.isArray(s.days) && s.days.length > 0) ? s.days.map(Number) : [Number(s.dayOfWeek || 1)];
    const checkboxes = document.querySelectorAll('input[name="schedule-days"]');
    checkboxes.forEach(cb => {
      cb.checked = days.includes(parseInt(cb.value, 10));
    });
    onScheduleDayCheckboxChange();

    openModal('schedule-modal');
  }

  function handleSaveSchedule(e) {
    e.preventDefault();
    const scheduleId = document.getElementById('schedule-id') ? document.getElementById('schedule-id').value : '';
    const teacherSelect = document.getElementById('schedule-teacher-select');
    const selectedOption = teacherSelect.options[teacherSelect.selectedIndex];

    const teacherId = selectedOption.value;
    const teacherName = selectedOption.getAttribute('data-name');
    const level = selectedOption.getAttribute('data-level');

    const checkedDays = Array.from(document.querySelectorAll('input[name="schedule-days"]:checked'))
      .map(cb => parseInt(cb.value, 10))
      .sort((a,b) => a - b);

    if (checkedDays.length === 0) {
      alert('សូមជ្រើសរើសយ៉ាងហោចណាស់មួយថ្ងៃ!');
      return;
    }

    const classGrade = cleanClassGrade(document.getElementById('schedule-class').value.trim(), '');

    if (!classGrade) {
      alert('សូមបញ្ចូលថ្នាក់!');
      return;
    }

    const schData = {
      teacherId,
      teacherName,
      days: checkedDays,
      dayOfWeek: checkedDays[0],
      classGrade,
      level
    };

    if (scheduleId) {
      schData.id = scheduleId;
      PSIS_Storage.updateSchedule(schData, state.currentBranchId);
      showToast(`បានកែប្រែកាលវិភាគជូន ${teacherName} ជោគជ័យ!`, 'success');
    } else {
      PSIS_Storage.addSchedule(schData, state.currentBranchId);
      showToast(`បានចាត់ចែងកាលវិភាគថ្មីជូន ${teacherName} ជោគជ័យ!`, 'success');
    }

    state.schedules = PSIS_Storage.getSchedules(state.currentBranchId);

    // Refresh daily records with new schedule
    loadDailyRecords();
    renderAll();

    closeModal('schedule-modal');
  }

  function handleDeleteSchedule(id) {
    if (confirm('តើអ្នកពិតជាចង់លុបកាលវិភាគនេះមែនទេ?')) {
      PSIS_Storage.deleteSchedule(id, state.currentBranchId);
      state.schedules = PSIS_Storage.getSchedules(state.currentBranchId);
      loadDailyRecords();
      renderAll();
      showToast('បានលុបកាលវិភាគ', 'warning');
    }
  }

  /**
   * Biometric CSV Import Handling
   */
  let matchedImportPreview = [];

  function openBiometricModal() {
    const csvInput = document.getElementById('biometric-csv-text');
    if (csvInput) csvInput.value = PSIS_BiometricImport.SAMPLE_BIOMETRIC_CSV;
    handlePreviewBiometricData();
    openModal('biometric-modal');
  }

  function handlePreviewBiometricData() {
    const csvText = document.getElementById('biometric-csv-text').value;
    const parsed = PSIS_BiometricImport.parseCsvText(csvText);
    matchedImportPreview = PSIS_BiometricImport.matchWithDailyRecords(parsed, state.dailyRecords, state.schoolInfo);

    const tbody = document.getElementById('biometric-preview-tbody');
    if (!tbody) return;

    let html = '';
    matchedImportPreview.forEach((m, idx) => {
      html += `
        <tr style="${m.matched ? 'background-color: #F0FDF4;' : 'background-color: #FEF2F2;'}">
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td style="font-weight: 700;">${escapeHtml(m.teacherName)}</td>
          <td style="text-align: center;">${escapeHtml(cleanClassGrade(m.classGrade))}</td>
          <td style="text-align: center; color: #64748B;">${escapeHtml(m.oldScanIn || '-')}</td>
          <td style="text-align: center; font-weight: 700; color: #059669;">${escapeHtml(m.newScanIn || '-')}</td>
          <td style="text-align: center; color: #64748B;">${escapeHtml(m.oldScanOut || '-')}</td>
          <td style="text-align: center; font-weight: 700; color: #059669;">${escapeHtml(m.newScanOut || '-')}</td>
          <td style="text-align: center;">
            ${m.matched 
              ? `<span style="color: #059669; font-weight: bold;">✓ ផ្គូផ្គងជោគជ័យ ${m.isLate ? '<span style="color: #D97706;">(យឺត)</span>' : ''}</span>`
              : '<span style="color: #DC2626;">✕ រកមិនឃើញទិន្នន័យ</span>'
            }
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  function handleApplyBiometricData() {
    if (!matchedImportPreview || matchedImportPreview.length === 0) {
      alert('មិនមានទិន្នន័យស្កេនដែលផ្គូផ្គងទេ!');
      return;
    }

    state.dailyRecords = PSIS_BiometricImport.applyMatchesToRecords(matchedImportPreview, state.dailyRecords, state.schoolInfo);
    saveCurrentRecords();
    renderChecklistTable();
    updateKPIs();
    closeModal('biometric-modal');
    showToast('បានអនុវត្តទិន្នន័យស្កេនចូលក្នុងតារាងត្រួតពិនិត្យជោគជ័យ!', 'success');
  }

  function handleExportDailyExcel() {
    PSIS_XlsxExport.exportDailyToExcel(state.currentDate, state.dailyRecords, state.schoolInfo);
    showToast('បានទាញយកឯកសារ Excel សម្រាប់របាយការណ៍ប្រចាំថ្ងៃ!', 'success');
  }

  function handleExportMonthlyExcel() {
    const allChecklists = PSIS_Storage.getAllChecklists(state.currentBranchId);
    const stats = PSIS_Analytics.calculateMonthlyStats(allChecklists, state.monthlyYearMonth, state.teachers, state.schoolInfo);
    PSIS_XlsxExport.exportMonthlyToExcel(stats, state.schoolInfo);
    showToast('បានទាញយកឯកសារ Excel សម្រាប់របាយការណ៍សង្ខេបប្រចាំខែ!', 'success');
  }

  function handlePrint() {
    switchTab('tab-print');
    setTimeout(() => {
      window.print();
    }, 300);
  }

  function handleDateChange(newDateStr) {
    state.currentDate = newDateStr;
    loadDailyRecords();
    updateHeaderDateDisplay();
    renderAll();
    showToast(`បានប្តូរទៅកាន់កាលបរិច្ឆេទ ${KhmerCalendar.formatKhmerShortDate(newDateStr)}`, 'success');
  }

  function handleQuickDate(offsetDays) {
    const d = new Date(state.currentDate + 'T00:00:00');
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split('T')[0];
    handleDateChange(dateStr);
  }

  function openSettingsModal() {
    document.getElementById('school-name-kh').value = state.schoolInfo.nameKh || '';
    document.getElementById('school-branch').value = state.schoolInfo.branch || '';
    document.getElementById('school-principal').value = state.schoolInfo.principalName || '';
    document.getElementById('school-inspector').value = state.schoolInfo.inspectorName || '';
    document.getElementById('school-morning-late').value = state.schoolInfo.morningScanLateThreshold || '07:15';
    document.getElementById('school-afternoon-late').value = state.schoolInfo.afternoonScanLateThreshold || '13:15';
    openModal('settings-modal');
  }

  function handleSaveSettings(e) {
    e.preventDefault();
    state.schoolInfo.nameKh = document.getElementById('school-name-kh').value.trim();
    state.schoolInfo.branch = document.getElementById('school-branch').value.trim();
    state.schoolInfo.principalName = document.getElementById('school-principal').value.trim();
    state.schoolInfo.inspectorName = document.getElementById('school-inspector').value.trim();
    state.schoolInfo.morningScanLateThreshold = document.getElementById('school-morning-late').value.trim();
    state.schoolInfo.afternoonScanLateThreshold = document.getElementById('school-afternoon-late').value.trim();

    PSIS_Storage.saveSchoolInfo(state.schoolInfo, state.currentBranchId);
    closeModal('settings-modal');
    renderPrintReport();
    updateKPIs();
    showToast('បានរក្សាទុកការកំណត់សាខាជោគជ័យ!', 'success');
  }

  function handleResetBranchData() {
    if (confirm(`តើអ្នកពិតជាចង់កំណត់ទិន្នន័យសម្រាប់ "${state.schoolInfo.branch}" ឡើងវិញទៅទម្រង់ដើមគំរូមែនទេ?`)) {
      PSIS_Storage.resetBranchData(state.currentBranchId);
      showToast('បានកំណត់ទិន្នន័យឡើងវិញជោគជ័យ!', 'success');
      setTimeout(() => window.location.reload(), 800);
    }
  }

  function handleExportBackup() {
    const jsonStr = PSIS_Storage.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psis_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('បានទាញយកទិន្នន័យបម្រុងទុក (JSON) ជោគជ័យ!', 'success');
  }

  function openBackupModal() {
    openModal('backup-modal');
  }

  function handleCopyBackupJson() {
    const jsonStr = PSIS_Storage.exportAllData();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jsonStr).then(() => {
        showToast('បានចម្លងកូដទិន្នន័យជោគជ័យ! សូមចុច Paste (Ctrl+V) ផ្ញើក្នុង Chat នេះ', 'success');
      }).catch(() => {
        copyFallback(jsonStr);
      });
    } else {
      copyFallback(jsonStr);
    }
  }

  function copyFallback(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('បានចម្លងកូដទិន្នន័យជោគជ័យ! សូមចុច Paste (Ctrl+V) ផ្ញើក្នុង Chat នេះ', 'success');
    } catch (e) {
      prompt('សូម Copy កូដខាងក្រោមដោយដៃ៖', text);
    }
    document.body.removeChild(ta);
  }

  function handleImportBackup(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = PSIS_Storage.importAllData(e.target.result);
      if (res.success) {
        showToast('បាននាំចូលទិន្នន័យជោគជ័យ! ប្រព័ន្ធកំពុងផ្ទុកទិន្នន័យ...', 'success');
        setTimeout(() => window.location.reload(), 800);
      } else {
        alert('បរាជ័យក្នុងការនាំចូលទិន្នន័យ៖ ' + res.error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });

    if (tabId === 'tab-print') {
      renderPrintReport();
    } else if (tabId === 'tab-monthly') {
      renderMonthlySummary();
    }
  }

  function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  }

  function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '✓';
    if (type === 'danger') icon = '✕';
    if (type === 'warning') icon = '⚠';

    toast.innerHTML = `
      <span style="font-weight: bold; font-size: 1.1rem;">${icon}</span>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => container.removeChild(toast), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupEventListeners() {
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    const dateInput = document.getElementById('filter-date');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        handleDateChange(e.target.value);
      });
    }

    const levelSelect = document.getElementById('filter-level');
    if (levelSelect) {
      levelSelect.addEventListener('change', (e) => {
        state.selectedLevel = e.target.value;
        renderChecklistTable();
      });
    }

    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        state.selectedStatus = e.target.value;
        renderChecklistTable();
      });
    }

    const searchInput = document.getElementById('filter-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderChecklistTable();
      });
    }

    const teacherForm = document.getElementById('teacher-form');
    if (teacherForm) {
      teacherForm.addEventListener('submit', handleSaveTeacher);
    }

    const scheduleForm = document.getElementById('schedule-form');
    if (scheduleForm) {
      scheduleForm.addEventListener('submit', handleSaveSchedule);
    }

    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', handleSaveSettings);
    }

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });
  }

  return {
    init,
    togglePasswordVisibility,
    openBranchModal,
    closeBranchModal,
    onBranchSelectChange,
    confirmBranchSelection,
    handleSelectBranch,
    handleSwitchBranch,
    handleFieldChange,
    handleSetCurrentTime,
    handleToggleTask,
    handleRemarksChange,
    handleMarkRowCompleted,
    handleBulkCompleteAll,
    handleBulkColumnAction,
    handleBulkFillScanTimes,
    handleDateChange,
    handleQuickDate,
    handleMonthChange,
    openAddTeacherModal,
    openEditTeacherModal,
    handleDeleteTeacher,
    openAddScheduleModal,
    openEditScheduleModal,
    applyDayPreset,
    onScheduleDayCheckboxChange,
    onScheduleTeacherSelectChange,
    handleDeleteSchedule,
    openBiometricModal,
    handlePreviewBiometricData,
    handleApplyBiometricData,
    handleExportDailyExcel,
    handleExportMonthlyExcel,
    handlePrint,
    openSignatureModal,
    handleSignatureFileChange,
    handleRemoveSignature,
    openSettingsModal,
    openBackupModal,
    handleCopyBackupJson,
    handleResetBranchData,
    handleExportBackup,
    handleImportBackup,
    refreshAllData,
    switchTab,
    closeModal,
    showToast
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  PSIS_App.init();
});
