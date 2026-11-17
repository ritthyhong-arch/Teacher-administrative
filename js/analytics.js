/**
 * Analytics and Summary Engine for Daily Monitoring & Monthly Aggregations
 */

const PSIS_Analytics = (() => {
  /**
   * Check if a daily record is incomplete (missed scans or missed any of the 4 administrative tasks)
   */
  function isRecordIncomplete(rec, schoolInfo) {
    if (rec.remarks === 'ច្បាប់') return false; // On leave teachers are excused
    if (rec.remarks === 'គ្មានច្បាប់') return true; // Unexcused absence

    const missedScanIn = !rec.scanInTime || rec.scanInTime.trim() === '';
    const missedScanOut = !rec.scanOutTime || rec.scanOutTime.trim() === '';
    const missedAttendance = rec.attendanceRecorded !== 'បានស្រង់';
    const missedScores = rec.scoreEvaluated !== 'បានដាក់ពិន្ទុ';
    const missedTelegram = rec.telegramUsed !== 'បានប្រើ';
    const missedSummary = rec.lessonSummaryWritten !== 'បានសរសេរ';

    return missedScanIn || missedScanOut || missedAttendance || missedScores || missedTelegram || missedSummary;
  }

  /**
   * Check if teacher was late
   */
  function isRecordLate(rec, schoolInfo) {
    if (rec.remarks === 'ច្បាប់' || rec.remarks === 'គ្មានច្បាប់') return false;
    if (rec.remarks === 'យឺត') return true;

    if (!rec.scanInTime) return false;
    const threshold = rec.shift === 'ល្ងាច' 
      ? (schoolInfo?.afternoonScanLateThreshold || '13:15')
      : (schoolInfo?.morningScanLateThreshold || '07:15');

    return rec.scanInTime > threshold;
  }

  /**
   * Calculate summary KPI stats for a given day's records
   */
  function calculateDailyStats(records, schoolInfo) {
    const totalScheduled = records.length;
    let presentCount = 0;
    let leaveCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let incompleteTaskCount = 0;
    let fullyCompletedCount = 0;

    let attendanceCompleted = 0;
    let scoresCompleted = 0;
    let telegramCompleted = 0;
    let summaryCompleted = 0;
    let scanInCompleted = 0;
    let scanOutCompleted = 0;

    records.forEach(rec => {
      if (rec.remarks === 'ច្បាប់') {
        leaveCount++;
        return;
      }
      if (rec.remarks === 'គ្មានច្បាប់') {
        absentCount++;
        incompleteTaskCount++;
        return;
      }

      presentCount++;

      const isLate = isRecordLate(rec, schoolInfo);
      if (isLate) lateCount++;

      if (rec.scanInTime && rec.scanInTime.trim() !== '') scanInCompleted++;
      if (rec.scanOutTime && rec.scanOutTime.trim() !== '') scanOutCompleted++;
      if (rec.attendanceRecorded === 'បានស្រង់') attendanceCompleted++;
      if (rec.scoreEvaluated === 'បានដាក់ពិន្ទុ') scoresCompleted++;
      if (rec.telegramUsed === 'បានប្រើ') telegramCompleted++;
      if (rec.lessonSummaryWritten === 'បានសរសេរ') summaryCompleted++;

      const incomplete = isRecordIncomplete(rec, schoolInfo);
      if (incomplete) {
        incompleteTaskCount++;
      } else {
        fullyCompletedCount++;
      }
    });

    const completionRate = presentCount > 0 ? Math.round((fullyCompletedCount / presentCount) * 100) : 0;
    const attendanceRate = presentCount > 0 ? Math.round((attendanceCompleted / presentCount) * 100) : 0;
    const scoresRate = presentCount > 0 ? Math.round((scoresCompleted / presentCount) * 100) : 0;
    const telegramRate = presentCount > 0 ? Math.round((telegramCompleted / presentCount) * 100) : 0;
    const summaryRate = presentCount > 0 ? Math.round((summaryCompleted / presentCount) * 100) : 0;

    return {
      totalScheduled,
      presentCount,
      leaveCount,
      absentCount,
      lateCount,
      incompleteTaskCount,
      fullyCompletedCount,
      completionRate,
      attendanceRate,
      scoresRate,
      telegramRate,
      summaryRate,
      scanInCompleted,
      scanOutCompleted
    };
  }

  /**
   * Aggregate monthly records for each teacher
   */
  function calculateMonthlyStats(allChecklists, yearMonthStr, teachers, schoolInfo) {
    // yearMonthStr e.g. "2026-10"
    const datesInMonth = Object.keys(allChecklists).filter(d => d.startsWith(yearMonthStr));
    
    // Map teachers to metrics
    const teacherMap = {};
    teachers.forEach(t => {
      teacherMap[t.id] = {
        teacherId: t.id,
        teacherName: t.name,
        level: t.level,
        shift: t.shift,
        subject: t.subject,
        daysScheduled: 0,
        daysPresent: 0,
        daysLeave: 0,
        daysAbsent: 0,
        daysLate: 0,
        completedAttendance: 0,
        completedScores: 0,
        completedTelegram: 0,
        completedSummary: 0,
        completedScanIn: 0,
        completedScanOut: 0,
        fullyCompletedDays: 0
      };
    });

    datesInMonth.forEach(date => {
      const records = allChecklists[date] || [];
      records.forEach(rec => {
        let stats = teacherMap[rec.teacherId];
        if (!stats) {
          stats = {
            teacherId: rec.teacherId,
            teacherName: rec.teacherName,
            level: rec.level,
            shift: rec.shift,
            subject: '',
            daysScheduled: 0,
            daysPresent: 0,
            daysLeave: 0,
            daysAbsent: 0,
            daysLate: 0,
            completedAttendance: 0,
            completedScores: 0,
            completedTelegram: 0,
            completedSummary: 0,
            completedScanIn: 0,
            completedScanOut: 0,
            fullyCompletedDays: 0
          };
          teacherMap[rec.teacherId] = stats;
        }

        stats.daysScheduled++;
        if (rec.remarks === 'ច្បាប់') {
          stats.daysLeave++;
          return;
        }
        if (rec.remarks === 'គ្មានច្បាប់') {
          stats.daysAbsent++;
          return;
        }

        stats.daysPresent++;
        if (isRecordLate(rec, schoolInfo)) stats.daysLate++;

        if (rec.attendanceRecorded === 'បានស្រង់') stats.completedAttendance++;
        if (rec.scoreEvaluated === 'បានដាក់ពិន្ទុ') stats.completedScores++;
        if (rec.telegramUsed === 'បានប្រើ') stats.completedTelegram++;
        if (rec.lessonSummaryWritten === 'បានសរសេរ') stats.completedSummary++;
        if (rec.scanInTime) stats.completedScanIn++;
        if (rec.scanOutTime) stats.completedScanOut++;

        if (!isRecordIncomplete(rec, schoolInfo)) {
          stats.fullyCompletedDays++;
        }
      });
    });

    // Compute rates & evaluation badge
    const teacherStatsList = Object.values(teacherMap)
      .filter(s => s.daysScheduled > 0)
      .map(s => {
        const complianceRate = s.daysPresent > 0 
          ? Math.round((s.fullyCompletedDays / s.daysPresent) * 100) 
          : 0;

        let gradeLabel = 'ល្អប្រសើរ';
        let gradeColor = 'green';
        if (complianceRate >= 90) {
          gradeLabel = 'ល្អប្រសើរ';
          gradeColor = 'green';
        } else if (complianceRate >= 80) {
          gradeLabel = 'ល្អ';
          gradeColor = 'blue';
        } else if (complianceRate >= 65) {
          gradeLabel = 'មធ្យម';
          gradeColor = 'yellow';
        } else {
          gradeLabel = 'ត្រូវកែលម្អ';
          gradeColor = 'red';
        }

        return {
          ...s,
          complianceRate,
          gradeLabel,
          gradeColor
        };
      });

    teacherStatsList.sort((a, b) => b.complianceRate - a.complianceRate);

    return {
      monthStr: yearMonthStr,
      totalDatesTracked: datesInMonth.length,
      teacherStats: teacherStatsList
    };
  }

  return {
    isRecordIncomplete,
    isRecordLate,
    calculateDailyStats,
    calculateMonthlyStats
  };
})();

// Export for module/global usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PSIS_Analytics;
}
