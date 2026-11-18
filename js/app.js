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
   * Initialize Application
   */
  function init() {
    renderBranchPortalCards();

    // Check if user has already selected a branch in localStorage
    const savedBranchId = PSIS_Storage.getCurrentBranchId();
    if (savedBranchId) {
      selectBranch(savedBranchId, false);
    } else {
      showBranchPortal();
    }

    setupEventListeners();
  }

  /**
   * Render the 5 Branch Selection Cards in the Portal
   */
  function renderBranchPortalCards() {
    const grid = document.getElementById('portal-branches-grid');
    if (!grid) return;

    const branches = PSIS_Storage.getBranches();
    let html = '';

    branches.forEach((b, idx) => {
      const teachers = PSIS_Storage.getTeachers(b.id);

      html += `
        <div class="branch-card" onclick="PSIS_App.handleSelectBranch('${b.id}')">
          <div>
            <div class="branch-card-header">
              <span class="branch-card-badge" style="background: ${b.iconColor}15; color: ${b.iconColor}; border: 1px solid ${b.iconColor}30;">
                ${b.code} • ${b.badgeText}
              </span>
              <div class="branch-card-icon" style="background: ${b.iconColor};">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
            </div>

            <h3 class="branch-card-name-kh">${escapeHtml(b.nameKh)}</h3>
            <div class="branch-card-name-en">${escapeHtml(b.nameEn)}</div>

            <div class="branch-card-meta">
              <div class="branch-card-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${escapeHtml(b.address)}</span>
              </div>
              <div class="branch-card-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>គ្រូបង្រៀន: <strong>${KhmerCalendar.toKhmerNumber(teachers.length)} នាក់</strong></span>
              </div>
              <div class="branch-card-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>នាយិកា/នាយក: ${escapeHtml(b.principalName.split('(')[0])}</span>
              </div>
            </div>
          </div>

          <button type="button" class="branch-card-btn">
            <span>ចូលប្រើប្រាស់សាខានេះ</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      `;
    });

    grid.innerHTML = html;
  }

  /**
   * Display Branch Selection Portal
   */
  function showBranchPortal() {
    const portal = document.getElementById('branch-selection-portal');
    const mainApp = document.getElementById('main-app-layout');
    if (portal) portal.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Switch view
    const portal = document.getElementById('branch-selection-portal');
    const mainApp = document.getElementById('main-app-layout');
    if (portal) portal.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';

    // Update active branch indicators
    const branchNameEl = document.getElementById('header-active-branch-name');
    if (branchNameEl) {
      branchNameEl.textContent = state.schoolInfo.branch;
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
    renderBranchPortalCards();
    showBranchPortal();
  }

  /**
   * Load daily records for current date & active branch
   */
  function loadDailyRecords() {
    state.dailyRecords = PSIS_Storage.getDailyChecklist(state.currentDate, state.currentBranchId);
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
      if (state.selectedShift !== 'all' && rec.shift !== state.selectedShift) return false;
      if (state.selectedLevel !== 'all' && rec.level !== state.selectedLevel) return false;

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
        const matchName = rec.teacherName.toLowerCase().includes(q);
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

      html += `
        <tr class="${rowClass}" data-record-id="${rec.id}">
          <!-- 1. ល.រ -->
          <td style="text-align: center; font-weight: 700; width: 42px;">
            ${KhmerCalendar.toKhmerNumber(idx + 1)}
          </td>

          <!-- 2. ឈ្មោះគ្រូ -->
          <td style="font-weight: 700; color: #1B365D; min-width: 140px;">
            <div style="display: flex; flex-direction: column;">
              <span>${escapeHtml(rec.teacherName)}</span>
              <span style="font-size: 0.75rem; font-weight: normal; color: #64748B;">
                ${escapeHtml(rec.level)} • 
                <span class="shift-pill ${rec.shift === 'ព្រឹក' ? 'shift-morning' : 'shift-afternoon'}">${escapeHtml(rec.shift)}</span>
              </span>
            </div>
          </td>

          <!-- 3. ថ្នាក់ -->
          <td style="text-align: center; font-weight: 600; min-width: 85px;">
            <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #EEF2F6; border-radius: 4px; font-size: 0.82rem;">
              ${escapeHtml(rec.classGrade)}
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
              ${scoreDone ? '✓ បានដាក់ពិន្ទុ' : '✕ មិនបានដាក់'}
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
   */
  function renderPrintReport() {
    const printArea = document.getElementById('print-document-content');
    if (!printArea) return;

    const lunarDateStr = KhmerCalendar.getKhmerLunarDateString(state.currentDate);
    const solarDateStr = KhmerCalendar.getKhmerGregorianDateString(state.currentDate);
    const shortDate = KhmerCalendar.formatKhmerShortDate(state.currentDate);

    let rowsHtml = '';
    state.dailyRecords.forEach((r, idx) => {
      const isLeave = r.remarks === 'ច្បាប់';
      const scanIn = isLeave ? '-' : (r.scanInTime || '-');
      const att = isLeave ? '-' : r.attendanceRecorded;
      const score = isLeave ? '-' : r.scoreEvaluated;
      const tg = isLeave ? '-' : r.telegramUsed;
      const summ = isLeave ? '-' : r.lessonSummaryWritten;
      const scanOut = isLeave ? '-' : (r.scanOutTime || '-');
      const tdLeaveClass = isLeave ? 'col-leave' : '';

      rowsHtml += `
        <tr>
          <td class="col-center" style="width: 32px;">${KhmerCalendar.toKhmerNumber(idx + 1)}</td>
          <td class="col-name" style="width: 130px;">${escapeHtml(r.teacherName)}</td>
          <td class="col-center" style="width: 65px;">${escapeHtml(r.classGrade)}</td>
          <td class="col-center ${tdLeaveClass}" style="width: 68px;">${escapeHtml(scanIn)}</td>
          <td class="col-center ${tdLeaveClass}" style="width: 82px;">${escapeHtml(att)}</td>
          <td class="col-center ${tdLeaveClass}" style="width: 85px;">${escapeHtml(score)}</td>
          <td class="col-center ${tdLeaveClass}" style="width: 85px;">${escapeHtml(tg)}</td>
          <td class="col-center ${tdLeaveClass}" style="width: 85px;">${escapeHtml(summ)}</td>
          <td class="col-center ${tdLeaveClass}" style="width: 68px;">${escapeHtml(scanOut)}</td>
          <td class="col-center" style="width: 65px; font-weight: bold;">${escapeHtml(r.remarks)}</td>
          <td style="font-size: 7.5pt; padding-left: 4px;">${escapeHtml(r.note || '')}</td>
        </tr>
      `;
    });

    const docHtml = `
      <div class="official-document-sheet" id="official-sheet">
        <div class="official-top-header">
          <div class="official-school-side">
            <div class="official-school-name">
              <img src="assets/logo.svg" alt="PSIS Logo" class="official-school-logo-print" />
              <span>${escapeHtml(state.schoolInfo.nameKh || 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ')}</span>
            </div>
            <div class="official-school-en">${escapeHtml(state.schoolInfo.nameEn || 'PAÑÑĀSĀSTRA INTERNATIONAL SCHOOL')}</div>
            <div class="official-school-motto">បាវចនា: ${escapeHtml(state.schoolInfo.mottoKh || 'វិន័យ គុណធម៌ សុភមង្គល')}</div>
            <div class="official-school-branch">សាខា: <strong>${escapeHtml(state.schoolInfo.branch)}</strong></div>
          </div>

          <div class="official-kingdom-side">
            <div class="official-kingdom-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div class="official-kingdom-motto">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            <div class="official-kingdom-flourish">🙣 🙡 🙣 🙡</div>
          </div>
        </div>

        <div class="official-report-title-block">
          <div class="official-report-title">របាយការណ៍ត្រួតពិនិត្យរដ្ឋបាលគ្រូប្រចាំថ្ងៃ</div>
          <div class="official-report-subtitle">
            កាលបរិច្ឆេទ: <strong>${escapeHtml(shortDate)}</strong>
            &nbsp;|&nbsp;
            ${escapeHtml(lunarDateStr)}
          </div>
        </div>

        <table class="official-print-table">
          <thead>
            <tr>
              <th rowspan="2">ល.រ</th>
              <th rowspan="2">ឈ្មោះគ្រូ</th>
              <th rowspan="2">ថ្នាក់</th>
              <th rowspan="2">ម៉ោងស្កេនចូល</th>
              <th colspan="4" style="background-color: #E2E8F0 !important;">កិច្ចការរដ្ឋបាលក្នុងថ្នាក់រៀន</th>
              <th rowspan="2">ម៉ោងស្កេនចេញ</th>
              <th rowspan="2">ផ្សេងៗ</th>
              <th rowspan="2">កំណត់សម្គាល់</th>
            </tr>
            <tr>
              <th>ស្រង់វត្តមាន</th>
              <th>វាយតម្លៃពិន្ទុ</th>
              <th>ប្រើ Telegram</th>
              <th>សម្រង់អត្ថបទ</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="official-signature-block">
          <div class="signature-col-left">
            <div class="sig-agree">បានឃើញ និង ឯកភាព</div>
            <div class="sig-role">នាយិកាសាខា</div>
            <div class="sig-name">${escapeHtml(state.schoolInfo.principalName || 'លោកស្រី គង់ វណ្ណារី')}</div>
            <div class="sig-line">ហត្ថលេខា និង ត្រា</div>
          </div>

          <div class="signature-col-right">
            <div class="sig-lunar-date">${escapeHtml(lunarDateStr)}</div>
            <div class="sig-solar-date">${escapeHtml(solarDateStr)}</div>
            <div class="sig-role" style="margin-top: 4px; margin-bottom: 50px;">អ្នកត្រួតពិនិត្យ</div>
            <div class="sig-name">${escapeHtml(state.schoolInfo.inspectorName || 'លោក ស៊ុន សុខជា')}</div>
            <div class="sig-line">ហត្ថលេខា</div>
          </div>
        </div>
      </div>
    `;

    printArea.innerHTML = docHtml;
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
          <td style="text-align: center;"><span class="shift-pill ${t.shift === 'ព្រឹក' ? 'shift-morning' : 'shift-afternoon'}">${escapeHtml(t.shift)}</span></td>
          <td>${escapeHtml(t.subject || '-')}</td>
          <td style="text-align: center;">${escapeHtml(t.defaultClass || '-')}</td>
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

  function renderSchedulesTable() {
    const tbody = document.getElementById('schedules-table-body');
    if (!tbody) return;

    const dayNames = {
      1: 'ចន្ទ (Monday)',
      2: 'អង្គារ (Tuesday)',
      3: 'ពុធ (Wednesday)',
      4: 'ព្រហស្បតិ៍ (Thursday)',
      5: 'សុក្រ (Friday)'
    };

    let html = '';
    state.schedules.forEach((s, idx) => {
      html += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${KhmerCalendar.toKhmerNumber(idx + 1)}</td>
          <td style="font-weight: 700; color: #1B365D;">${escapeHtml(s.teacherName)}</td>
          <td style="font-weight: 600; color: #0A2540;">${dayNames[s.dayOfWeek] || s.dayOfWeek}</td>
          <td style="text-align: center;"><span class="shift-pill ${s.shift === 'ព្រឹក' ? 'shift-morning' : 'shift-afternoon'}">${escapeHtml(s.shift)}</span></td>
          <td style="text-align: center; font-weight: 600;"><span style="padding: 2px 8px; background: #EEF2F6; border-radius: 4px;">${escapeHtml(s.classGrade)}</span></td>
          <td>${escapeHtml(s.level)}</td>
          <td style="text-align: center;">${escapeHtml(s.timeSlot || '-')}</td>
          <td>${escapeHtml(s.room || '-')}</td>
          <td style="text-align: center;">
            <button class="btn btn-sm btn-outline btn-icon" style="color: #EF4444;" title="លុបកាលវិភាគ" onclick="PSIS_App.handleDeleteSchedule('${s.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
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
    document.getElementById('teacher-shift').value = t.shift || 'ព្រឹក';
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
      shift: document.getElementById('teacher-shift').value,
      subject: document.getElementById('teacher-subject').value.trim(),
      defaultClass: document.getElementById('teacher-default-class').value.trim(),
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
    renderTeachersTable();
    closeModal('teacher-modal');
  }

  function handleDeleteTeacher(id) {
    const t = state.teachers.find(item => item.id === id);
    if (!t) return;
    if (confirm(`តើអ្នកពិតជាចង់លុបគ្រូ "${t.name}" មែនទេ?`)) {
      PSIS_Storage.deleteTeacher(id, state.currentBranchId);
      state.teachers = PSIS_Storage.getTeachers(state.currentBranchId);
      state.schedules = PSIS_Storage.getSchedules(state.currentBranchId);
      renderTeachersTable();
      renderSchedulesTable();
      showToast(`បានលុបគ្រូ ${t.name}`, 'warning');
    }
  }

  function openAddScheduleModal() {
    const teacherSelect = document.getElementById('schedule-teacher-select');
    teacherSelect.innerHTML = state.teachers.map(t => 
      `<option value="${t.id}" data-name="${escapeHtml(t.name)}" data-level="${escapeHtml(t.level)}" data-shift="${escapeHtml(t.shift)}">${escapeHtml(t.name)} (${escapeHtml(t.level)} - ${escapeHtml(t.shift)})</option>`
    ).join('');

    openModal('schedule-modal');
  }

  function handleSaveSchedule(e) {
    e.preventDefault();
    const teacherSelect = document.getElementById('schedule-teacher-select');
    const selectedOption = teacherSelect.options[teacherSelect.selectedIndex];

    const teacherId = selectedOption.value;
    const teacherName = selectedOption.getAttribute('data-name');
    const level = selectedOption.getAttribute('data-level');

    const dayOfWeek = parseInt(document.getElementById('schedule-day').value, 10);
    const shift = document.getElementById('schedule-shift').value;
    const classGrade = document.getElementById('schedule-class').value.trim();
    const timeSlot = document.getElementById('schedule-time').value.trim();
    const room = document.getElementById('schedule-room').value.trim();

    if (!classGrade) {
      alert('សូមបញ្ចូលថ្នាក់!');
      return;
    }

    const schData = {
      teacherId,
      teacherName,
      dayOfWeek,
      shift,
      classGrade,
      level,
      timeSlot,
      room
    };

    PSIS_Storage.addSchedule(schData, state.currentBranchId);
    state.schedules = PSIS_Storage.getSchedules(state.currentBranchId);
    renderSchedulesTable();
    closeModal('schedule-modal');
    showToast('បានចាត់ចែងកាលវិភាគថ្មីជោគជ័យ!', 'success');
  }

  function handleDeleteSchedule(id) {
    if (confirm('តើអ្នកពិតជាចង់លុបកាលវិភាគនេះមែនទេ?')) {
      PSIS_Storage.deleteSchedule(id, state.currentBranchId);
      state.schedules = PSIS_Storage.getSchedules(state.currentBranchId);
      renderSchedulesTable();
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
          <td style="text-align: center;">${escapeHtml(m.classGrade)} (${escapeHtml(m.shift)})</td>
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

    const shiftSelect = document.getElementById('filter-shift');
    if (shiftSelect) {
      shiftSelect.addEventListener('change', (e) => {
        state.selectedShift = e.target.value;
        renderChecklistTable();
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
    handleDeleteSchedule,
    openBiometricModal,
    handlePreviewBiometricData,
    handleApplyBiometricData,
    handleExportDailyExcel,
    handleExportMonthlyExcel,
    handlePrint,
    openSettingsModal,
    handleResetBranchData,
    switchTab,
    closeModal,
    showToast
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  PSIS_App.init();
});
