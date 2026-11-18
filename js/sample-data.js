/**
 * Sample Master Data for Paññāsāstra International School (សាលាបញ្ញាសាស្រ្តអន្តរជាតិ)
 * Exactly matching the 5 Official Branches from the school system:
 * 1. Paññāsāstra International School II
 * 2. Paññāsāstra International School III
 * 3. Paññāsāstra International School VII
 * 4. Paññāsāstra International School VIII
 * 5. Paññāsāstra International School IX
 */

const PSIS_BRANCHES = [
  {
    id: 'psis-ii',
    code: 'PSIS II',
    nameEn: 'Paññāsāstra International School II',
    nameKh: 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ សាខាទី ២ (PSIS II)',
    shortKh: 'សាខាទី ២ (PSIS II)',
    branchPrint: 'សាខាទី ២',
    principalName: 'ហៀង ពលៈ',
    inspectorName: 'ឈុន វុទ្ធី',
    color: '#1B365D'
  },
  {
    id: 'psis-iii',
    code: 'PSIS III',
    nameEn: 'Paññāsāstra International School III',
    nameKh: 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ សាខាទី ៣ (PSIS III)',
    shortKh: 'សាខាទី ៣ (PSIS III)',
    branchPrint: 'សាខាទី ៣',
    principalName: 'ហៀង ពលៈ',
    inspectorName: 'ឈុន វុទ្ធី',
    color: '#0D9488'
  },
  {
    id: 'psis-vii',
    code: 'PSIS VII',
    nameEn: 'Paññāsāstra International School VII',
    nameKh: 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ សាខាទី ៧ (PSIS VII)',
    shortKh: 'សាខាទី ៧ (PSIS VII)',
    branchPrint: 'សាខាទី ៧',
    principalName: 'ហៀង ពលៈ',
    inspectorName: 'ឈុន វុទ្ធី',
    color: '#B45309'
  },
  {
    id: 'psis-viii',
    code: 'PSIS VIII',
    nameEn: 'Paññāsāstra International School VIII',
    nameKh: 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ សាខាទី ៨ (PSIS VIII)',
    shortKh: 'សាខាទី ៨ (PSIS VIII)',
    branchPrint: 'សាខាទី ៨',
    principalName: 'ហៀង ពលៈ',
    inspectorName: 'ឈុន វុទ្ធី',
    color: '#7C3AED'
  },
  {
    id: 'psis-ix',
    code: 'PSIS IX',
    nameEn: 'Paññāsāstra International School IX',
    nameKh: 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ សាខាទួលគោក',
    shortKh: 'សាខាទួលគោក',
    branchPrint: 'សាខាទួលគោក',
    principalName: 'ហៀង ពលៈ',
    inspectorName: 'ឈុន វុទ្ធី',
    color: '#BE123C'
  }
];

const PSIS_SAMPLE_DATA = {
  branches: PSIS_BRANCHES,

  getSchoolInfoForBranch(branchId) {
    const b = PSIS_BRANCHES.find(item => item.id === branchId) || PSIS_BRANCHES[4]; // Default to PSIS IX as in user's image
    return {
      nameKh: 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ',
      nameEn: 'PAÑÑĀSĀSTRA INTERNATIONAL SCHOOL',
      mottoKh: 'វិន័យ គុណធម៌ សុភមង្គល',
      branchId: b.id,
      branch: b.nameEn,
      branchKh: b.nameKh,
      branchShort: b.shortKh,
      branchPrint: b.branchPrint || b.shortKh,
      principalName: b.principalName,
      inspectorName: b.inspectorName,
      academicYear: '២០២៦-២០២៧',
      morningScanStart: '06:45',
      morningScanLateThreshold: '07:15',
      morningScanEnd: '11:30',
      afternoonScanStart: '12:45',
      afternoonScanLateThreshold: '13:15',
      afternoonScanEnd: '17:15'
    };
  },

  // Teachers for each branch
  getTeachersForBranch(branchId) {
    if (branchId === 'psis-ii') {
      return [
        { id: 'T001', name: 'ហេង ឆេងលី', gender: 'ស្រី', phone: '012 889 912', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & គណិតវិទ្យា', defaultClass: '1A', status: 'សកម្ម' },
        { id: 'T002', name: 'ព្រះអង្គគ្រូ ស៊ន ប៉ោធី', gender: 'ប្រុស', phone: '097 554 332', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'សីលធម៌ ពលរដ្ឋវិទ្យា & ភាសាបាលី', defaultClass: '11A', status: 'សកម្ម' },
        { id: 'T004', name: 'ក ធារិទ្ធ', gender: 'ប្រុស', phone: '017 665 443', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'រូបវិទ្យា & គណិតវិទ្យា', defaultClass: '9B', status: 'សកម្ម' },
        { id: 'T005', name: 'ហុក វិសាល', gender: 'ប្រុស', phone: '089 778 899', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'គីមីវិទ្យា & វិទ្យាសាស្ត្រ', defaultClass: '10A', status: 'សកម្ម' },
        { id: 'T006', name: 'ហែម អឿន', gender: 'ប្រុស', phone: '012 334 455', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'សង្គមសិក្សា & វិទ្យាសាស្ត្រ', defaultClass: '5A', status: 'សកម្ម' },
        { id: 'T007', name: 'សួស ចរិយា', gender: 'ស្រី', phone: '098 221 144', level: 'មត្តេយ្យ', shift: 'ព្រឹក', subject: 'មត្តេយ្យសិក្សា (Kindergarten)', defaultClass: 'K2', status: 'សកម្ម' }
      ];
    } else if (branchId === 'psis-iii') {
      return [
        { id: 'T003', name: 'បេន វី', gender: 'ប្រុស', phone: '010 334 556', level: 'បឋមសិក្សា', shift: 'ល្ងាច', subject: 'ភាសាអង់គ្លេស (ESL)', defaultClass: '3B', status: 'សកម្ម' },
        { id: 'T008', name: 'ចាន់ ផល្លា', gender: 'ស្រី', phone: '015 990 011', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & តែងសេចក្តី', defaultClass: '2B', status: 'សកម្ម' },
        { id: 'T009', name: 'លី សុខុម', gender: 'ប្រុស', phone: '092 445 566', level: 'បឋមសិក្សា', shift: 'ល្ងាច', subject: 'គណិតវិទ្យា', defaultClass: '4A', status: 'សកម្ម' },
        { id: 'T010', name: 'អ៊ុក សុផល', gender: 'ប្រុស', phone: '070 112 233', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'ប្រវត្តិវិទ្យា & ភូមិវិទ្យា', defaultClass: '7A', status: 'សកម្ម' },
        { id: 'T011', name: 'ម៉ម សុវណ្ណារ័ត្ន', gender: 'ស្រី', phone: '011 776 655', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ល្ងាច', subject: 'ជីវវិទ្យា', defaultClass: '8B', status: 'សកម្ម' },
        { id: 'T012', name: 'កែវ សោភា', gender: 'ស្រី', phone: '085 443 322', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & អក្សរសាស្ត្រ', defaultClass: '12A', status: 'សកម្ម' }
      ];
    } else if (branchId === 'psis-vii') {
      return [
        { id: 'V001', name: 'ហែម អឿន', gender: 'ប្រុស', phone: '012 334 455', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'សង្គមសិក្សា & វិទ្យាសាស្ត្រ', defaultClass: '5A', status: 'សកម្ម' },
        { id: 'V002', name: 'បេន វី', gender: 'ប្រុស', phone: '010 334 556', level: 'បឋមសិក្សា', shift: 'ល្ងាច', subject: 'ភាសាអង់គ្លេស (ESL)', defaultClass: '3B', status: 'សកម្ម' },
        { id: 'V003', name: 'សួស ចរិយា', gender: 'ស្រី', phone: '098 221 144', level: 'មត្តេយ្យ', shift: 'ព្រឹក', subject: 'មត្តេយ្យសិក្សា (Kindergarten)', defaultClass: 'K2', status: 'សកម្ម' },
        { id: 'V004', name: 'នួន វិរៈ', gender: 'ប្រុស', phone: '093 223 344', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'គណិតវិទ្យា', defaultClass: '3A', status: 'សកម្ម' },
        { id: 'V005', name: 'ទេព ម៉ាលីស', gender: 'ស្រី', phone: '088 776 655', level: 'មត្តេយ្យ', shift: 'ព្រឹក', subject: 'មត្តេយ្យសិក្សា', defaultClass: 'K2', status: 'សកម្ម' }
      ];
    } else if (branchId === 'psis-viii') {
      return [
        { id: 'W001', name: 'ក ធារិទ្ធ', gender: 'ប្រុស', phone: '017 665 443', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'រូបវិទ្យា & គណិតវិទ្យា', defaultClass: '9B', status: 'សកម្ម' },
        { id: 'W002', name: 'ហុក វិសាល', gender: 'ប្រុស', phone: '089 778 899', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'គីមីវិទ្យា & វិទ្យាសាស្ត្រ', defaultClass: '10A', status: 'សកម្ម' },
        { id: 'W003', name: 'ហេង ឆេងលី', gender: 'ស្រី', phone: '012 889 912', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & គណិតវិទ្យា', defaultClass: '1A', status: 'សកម្ម' },
        { id: 'W004', name: 'អ៊ឹម សំបូរ', gender: 'ប្រុស', phone: '016 445 566', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ល្ងាច', subject: 'រូបវិទ្យា', defaultClass: '9A', status: 'សកម្ម' }
      ];
    }

    // Default Paññāsāstra International School IX (PSIS IX)
    return [
      { id: 'T001', name: 'ហេង ឆេងលី', gender: 'ស្រី', phone: '012 889 912', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & គណិតវិទ្យា', defaultClass: '1A', status: 'សកម្ម' },
      { id: 'T002', name: 'ព្រះអង្គគ្រូ ស៊ន ប៉ោធី', gender: 'ប្រុស', phone: '097 554 332', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'សីលធម៌ ពលរដ្ឋវិទ្យា & ភាសាបាលី', defaultClass: '11A', status: 'សកម្ម' },
      { id: 'T003', name: 'បេន វី', gender: 'ប្រុស', phone: '010 334 556', level: 'បឋមសិក្សា', shift: 'ល្ងាច', subject: 'ភាសាអង់គ្លេស (ESL)', defaultClass: '3B', status: 'សកម្ម' },
      { id: 'T004', name: 'ក ធារិទ្ធ', gender: 'ប្រុស', phone: '017 665 443', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'រូបវិទ្យា & គណិតវិទ្យា', defaultClass: '9B', status: 'សកម្ម' },
      { id: 'T005', name: 'ហុក វិសាល', gender: 'ប្រុស', phone: '089 778 899', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'គីមីវិទ្យា & វិទ្យាសាស្ត្រ', defaultClass: '10A', status: 'សកម្ម' },
      { id: 'T006', name: 'ហែម អឿន', gender: 'ប្រុស', phone: '012 334 455', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'សង្គមសិក្សា & វិទ្យាសាស្ត្រ', defaultClass: '5A', status: 'សកម្ម' },
      { id: 'T007', name: 'សួស ចរិយា', gender: 'ស្រី', phone: '098 221 144', level: 'មត្តេយ្យ', shift: 'ព្រឹក', subject: 'មត្តេយ្យសិក្សា (Kindergarten)', defaultClass: 'K2', status: 'សកម្ម' },
      { id: 'T008', name: 'ចាន់ ផល្លា', gender: 'ស្រី', phone: '015 990 011', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & តែងសេចក្តី', defaultClass: '2B', status: 'សកម្ម' },
      { id: 'T009', name: 'លី សុខុម', gender: 'ប្រុស', phone: '092 445 566', level: 'បឋមសិក្សា', shift: 'ល្ងាច', subject: 'គណិតវិទ្យា', defaultClass: '4A', status: 'សកម្ម' },
      { id: 'T010', name: 'អ៊ុក សុផល', gender: 'ប្រុស', phone: '070 112 233', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'ប្រវត្តិវិទ្យា & ភូមិវិទ្យា', defaultClass: '7A', status: 'សកម្ម' },
      { id: 'T011', name: 'ម៉ម សុវណ្ណារ័ត្ន', gender: 'ស្រី', phone: '011 776 655', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ល្ងាច', subject: 'ជីវវិទ្យា', defaultClass: '8B', status: 'សកម្ម' },
      { id: 'T012', name: 'កែវ សោភា', gender: 'ស្រី', phone: '085 443 322', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & អក្សរសាស្ត្រ', defaultClass: '12A', status: 'សកម្ម' }
    ];
  },

  getSchedulesForBranch(branchId, teachers) {
    const schedules = [];

    teachers.forEach((t, tIdx) => {
      // Determine teaching days based on education level requested:
      // មត្តេយ្យ & បឋមសិក្សា -> ចន្ទ ដល់ សុក្រ (Days 1, 2, 3, 4, 5)
      // អនុវិទ្យាល័យ-វិទ្យាល័យ -> ចន្ទ, ពុធ [1, 3] ឬ ចន្ទ ដល់ សុក្រ [1, 2, 3, 4, 5] ឬ ចន្ទ, ពុធ, សុក្រ [1, 3, 5]
      let days = [1, 2, 3, 4, 5];
      if (t.level === 'អនុវិទ្យាល័យ-វិទ្យាល័យ') {
        if (tIdx % 3 === 0) {
          days = [1, 3]; // ចន្ទ, ពុធ
        } else if (tIdx % 3 === 1) {
          days = [1, 3, 5]; // ចន្ទ, ពុធ, សុក្រ
        } else {
          days = [1, 2, 3, 4, 5]; // ចន្ទ ដល់ សុក្រ
        }
      }

      schedules.push({
        id: `SCH_${branchId}_${t.id}`,
        teacherId: t.id,
        teacherName: t.name,
        days: days,
        dayOfWeek: days[0],
        shift: t.shift,
        classGrade: t.defaultClass || '1A',
        level: t.level,
        timeSlot: t.shift === 'ព្រឹក' ? '07:00 - 11:15' : '13:00 - 17:00',
        room: `បន្ទប់ ${100 + (tIdx + 1)}`
      });
    });

    return schedules;
  },

  createDefaultChecklistForDate(dateStr, schedulesList, teachersList) {
    const d = new Date(dateStr + 'T00:00:00');
    let dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) dayOfWeek = 1;

    // Filter schedules where current dayOfWeek matches scheduled days
    const daySchedules = schedulesList.filter(s => {
      if (Array.isArray(s.days) && s.days.length > 0) {
        return s.days.map(Number).includes(dayOfWeek);
      }
      return Number(s.dayOfWeek) === dayOfWeek;
    });

    return daySchedules.map((sch, index) => {
      let scanIn = '06:55';
      let attendance = 'បានស្រង់';
      let scoreEvaluation = 'បានដាក់ពិន្ទុ';
      let telegram = 'បានប្រើ';
      let lessonSummary = 'បានសរសេរ';
      let scanOut = '11:35';
      let remarks = 'ធម្មតា';
      let note = '';

      if (sch.shift === 'ល្ងាច') {
        scanIn = '12:50';
        scanOut = '17:10';
      }

      if (index === 2) {
        scanIn = '07:25';
        remarks = 'យឺត';
        note = 'មកយឺតដោយសារស្ទះចរាចរណ៍';
      } else if (index === 4) {
        scanIn = '';
        attendance = 'មិនបានស្រង់';
        scoreEvaluation = 'មិនបានដាក់ពិន្ទុ';
        telegram = 'មិនបានប្រើ';
        lessonSummary = 'មិនបានសរសេរ';
        scanOut = '';
        remarks = 'ច្បាប់';
        note = 'សុំច្បាប់មើលជំងឺ';
      } else if (index === 5) {
        attendance = 'បានស្រង់';
        scoreEvaluation = 'មិនបានដាក់ពិន្ទុ';
        telegram = 'បានប្រើ';
        lessonSummary = 'មិនបានសរសេរ';
        scanOut = '';
        remarks = 'ធម្មតា';
        note = 'មិនទាន់បានបញ្ចូលពិន្ទុប្រចាំខែ';
      }

      return {
        id: `LOG_${dateStr}_${sch.id}`,
        scheduleId: sch.id,
        teacherId: sch.teacherId,
        teacherName: sch.teacherName,
        classGrade: sch.classGrade,
        level: sch.level,
        shift: sch.shift,
        timeSlot: sch.timeSlot,
        room: sch.room,
        scanInTime: scanIn,
        attendanceRecorded: attendance,
        scoreEvaluated: scoreEvaluation,
        telegramUsed: telegram,
        lessonSummaryWritten: lessonSummary,
        scanOutTime: scanOut,
        remarks: remarks,
        note: note
      };
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PSIS_SAMPLE_DATA, PSIS_BRANCHES };
}
