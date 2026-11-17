/**
 * Biometric Scanner (Fingerprint / Face Attendance) CSV & Text Parser
 * Auto-matches teacher names and updates Scan-In & Scan-Out times.
 */

const PSIS_BiometricImport = (() => {
  /**
   * Sample CSV data for immediate testing
   */
  const SAMPLE_BIOMETRIC_CSV = `Employee ID,Name,Date,Time,State
101,ហេង ឆេងលី,2026-10-05,06:52,Check-In
102,ព្រះអង្គគ្រូ ស៊ន ប៉ោធី,2026-10-05,06:48,Check-In
103,បេន វី,2026-10-05,12:45,Check-In
104,ក ធារិទ្ធ,2026-10-05,07:22,Check-In
105,ហែម អឿន,2026-10-05,06:58,Check-In
107,សួស ចរិយា,2026-10-05,07:12,Check-In
108,ចាន់ ផល្លា,2026-10-05,06:56,Check-In
101,ហេង ឆេងលី,2026-10-05,11:32,Check-Out
102,ព្រះអង្គគ្រូ ស៊ន ប៉ោធី,2026-10-05,11:38,Check-Out
103,បេន វី,2026-10-05,17:08,Check-Out
104,ក ធារិទ្ធ,2026-10-05,11:35,Check-Out
107,សួស ចរិយា,2026-10-05,11:15,Check-Out
108,ចាន់ ផល្លា,2026-10-05,11:28,Check-Out`;

  function parseCsvText(csvText) {
    if (!csvText) return [];
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(';') ? ';' : ',');
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

    // Find column indexes
    const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('ឈ្មោះ') || h.includes('person') || h.includes('user'));
    const timeIdx = headers.findIndex(h => h.includes('time') || h.includes('ម៉ោង') || h.includes('timestamp'));
    const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('ថ្ងៃ'));
    const stateIdx = headers.findIndex(h => h.includes('state') || h.includes('type') || h.includes('status') || h.includes('action'));

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));

      let name = nameIdx !== -1 ? parts[nameIdx] : (parts[1] || parts[0]);
      let timeVal = timeIdx !== -1 ? parts[timeIdx] : parts[3];
      let state = stateIdx !== -1 ? parts[stateIdx] : '';

      // Normalize time format to HH:mm
      let normalizedTime = '';
      if (timeVal) {
        // e.g. "06:52:10" or "6:52 AM" or "2026-10-05 06:52"
        const timeMatch = timeVal.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          let h = parseInt(timeMatch[1], 10);
          const m = timeMatch[2];
          if (/pm/i.test(timeVal) && h < 12) h += 12;
          if (/am/i.test(timeVal) && h === 12) h = 0;
          normalizedTime = `${String(h).padStart(2, '0')}:${m}`;
        }
      }

      if (name && normalizedTime) {
        rows.push({
          rawName: name,
          time: normalizedTime,
          state: state.toLowerCase()
        });
      }
    }

    return rows;
  }

  /**
   * Match parsed scan events with scheduled teachers
   */
  function matchWithDailyRecords(parsedRows, dailyRecords, schoolInfo) {
    // Group scan times by teacher name
    const teacherScans = {};

    parsedRows.forEach(row => {
      // Find matching teacher
      const matchedRecord = dailyRecords.find(rec => {
        const rName = rec.teacherName.replace(/\s+/g, '').toLowerCase();
        const pName = row.rawName.replace(/\s+/g, '').toLowerCase();
        return rName.includes(pName) || pName.includes(rName);
      });

      if (matchedRecord) {
        const id = matchedRecord.id;
        if (!teacherScans[id]) {
          teacherScans[id] = {
            record: matchedRecord,
            scans: []
          };
        }
        teacherScans[id].scans.push(row);
      }
    });

    // For each teacher, determine Scan-In and Scan-Out
    const previewResults = [];

    dailyRecords.forEach(rec => {
      const match = teacherScans[rec.id];
      if (match && match.scans.length > 0) {
        // Sort scans chronologically
        const sorted = match.scans.map(s => s.time).sort();
        let inTime = sorted[0];
        let outTime = sorted.length > 1 ? sorted[sorted.length - 1] : '';

        // Check if there are explicit Check-In / Check-Out states
        const explicitIn = match.scans.find(s => s.state.includes('in') || s.state.includes('ចូល'));
        const explicitOut = match.scans.find(s => s.state.includes('out') || s.state.includes('ចេញ'));
        if (explicitIn) inTime = explicitIn.time;
        if (explicitOut) outTime = explicitOut.time;

        const isLate = PSIS_Analytics.isRecordLate({ ...rec, scanInTime: inTime }, schoolInfo);

        previewResults.push({
          recordId: rec.id,
          teacherName: rec.teacherName,
          classGrade: rec.classGrade,
          shift: rec.shift,
          oldScanIn: rec.scanInTime,
          newScanIn: inTime,
          oldScanOut: rec.scanOutTime,
          newScanOut: outTime,
          isLate: isLate,
          matched: true
        });
      } else {
        previewResults.push({
          recordId: rec.id,
          teacherName: rec.teacherName,
          classGrade: rec.classGrade,
          shift: rec.shift,
          oldScanIn: rec.scanInTime,
          newScanIn: '',
          oldScanOut: rec.scanOutTime,
          newScanOut: '',
          isLate: false,
          matched: false
        });
      }
    });

    return previewResults;
  }

  /**
   * Apply matched scan times to daily checklist
   */
  function applyMatchesToRecords(previewResults, dailyRecords, schoolInfo) {
    const updated = [...dailyRecords];

    previewResults.forEach(res => {
      if (!res.matched) return;
      const idx = updated.findIndex(r => r.id === res.recordId);
      if (idx !== -1) {
        const item = { ...updated[idx] };
        if (res.newScanIn) item.scanInTime = res.newScanIn;
        if (res.newScanOut) item.scanOutTime = res.newScanOut;

        // If late and was normal, flag as late
        if (res.isLate && item.remarks === 'ធម្មតា') {
          item.remarks = 'យឺត';
          if (!item.note) item.note = 'ស្កេនចូលយឺត (ប្រព័ន្ធកត់ត្រាស្វ័យប្រវត្ត)';
        }
        updated[idx] = item;
      }
    });

    return updated;
  }

  function downloadSampleCsv() {
    const blob = new Blob([SAMPLE_BIOMETRIC_CSV], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'គំរូនាំចូលទិន្នន័យស្កេនមេដៃ_PSIS.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 150);
  }

  return {
    SAMPLE_BIOMETRIC_CSV,
    parseCsvText,
    matchWithDailyRecords,
    applyMatchesToRecords,
    downloadSampleCsv
  };
})();

// Export for module/global usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PSIS_BiometricImport;
}
