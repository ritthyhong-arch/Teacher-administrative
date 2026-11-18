/**
 * Sample Master Data for Paññāsāstra International School (សាលាបញ្ញាសាស្រ្តអន្តរជាតិ)
 * Supports 5 Official Branches:
 * 1. សាខាកណ្តាល (Central Norodom Campus)
 * 2. សាខាទួលគោក (Toul Kork Campus)
 * 3. សាខាច្បារអំពៅ (Chbar Ampov Campus)
 * 4. សាខាសែនសុខ (Sen Sok Campus)
 * 5. សាខាបឹងកេងកង (Boeung Keng Kang Campus)
 */

const PSIS_BRANCHES = [
  {
    id: 'branch-central',
    code: 'B01',
    nameKh: 'សាខាកណ្តាល (នរោត្តម)',
    nameEn: 'Central Norodom Campus',
    address: 'មហាវិថីព្រះនរោត្តម សង្កាត់បឹងកេងកង១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ',
    principalName: 'លោកស្រី គង់ វណ្ណារី (នាយិកាសាខា)',
    inspectorName: 'លោក ស៊ុន សុខជា (អ្នកត្រួតពិនិត្យ)',
    phone: '023 990 111',
    iconColor: '#1B365D',
    accentColor: '#D4AF37',
    badgeText: 'ទីស្នាក់ការកណ្តាល'
  },
  {
    id: 'branch-toulkork',
    code: 'B02',
    nameKh: 'សាខាទួលគោក',
    nameEn: 'Toul Kork Campus',
    address: 'ផ្លូវលេខ ៣១៥ សង្កាត់បឹងកក់១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    principalName: 'លោក ឈុន វុទ្ធី (នាយកសាខា)',
    inspectorName: 'កញ្ញា ម៉ៅ ស្រីពៅ (អ្នកត្រួតពិនិត្យ)',
    phone: '023 990 222',
    iconColor: '#0D9488',
    accentColor: '#14B8A6',
    badgeText: 'សាខាទី២'
  },
  {
    id: 'branch-chbarampov',
    code: 'B03',
    nameKh: 'សាខាច្បារអំពៅ',
    nameEn: 'Chbar Ampov Campus',
    address: 'ផ្លូវជាតិលេខ១ សង្កាត់ច្បារអំពៅ១ ខណ្ឌច្បារអំពៅ រាជធានីភ្នំពេញ',
    principalName: 'លោកស្រី កែវ មុនីរ័ត្ន (នាយិកាសាខា)',
    inspectorName: 'លោក ហេង រតនា (អ្នកត្រួតពិនិត្យ)',
    phone: '023 990 333',
    iconColor: '#B45309',
    accentColor: '#F59E0B',
    badgeText: 'សាខាទី៣'
  },
  {
    id: 'branch-sensok',
    code: 'B04',
    nameKh: 'សាខាសែនសុខ',
    nameEn: 'Sen Sok Campus',
    address: 'ផ្លូវលេខ ១០០៣ សង្កាត់ភ្នំពេញថ្មី ខណ្ឌសែនសុខ រាជធានីភ្នំពេញ',
    principalName: 'លោក ឌី ច័ន្ទដារ៉ា (នាយកសាខា)',
    inspectorName: 'លោកស្រី ឡុង គន្ធា (អ្នកត្រួតពិនិត្យ)',
    phone: '023 990 444',
    iconColor: '#7C3AED',
    accentColor: '#8B5CF6',
    badgeText: 'សាខាទី៤'
  },
  {
    id: 'branch-bkk',
    code: 'B05',
    nameKh: 'សាខាបឹងកេងកង',
    nameEn: 'Boeung Keng Kang Campus',
    address: 'ផ្លូវលេខ ៥៧ សង្កាត់បឹងកេងកង១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ',
    principalName: 'លោកស្រី ស៊ឹម វ៉ានដា (នាយិកាសាខា)',
    inspectorName: 'លោក អ៊ុក វិបុល (អ្នកត្រួតពិនិត្យ)',
    phone: '023 990 555',
    iconColor: '#BE123C',
    accentColor: '#F43F5E',
    badgeText: 'សាខាទី៥'
  }
];

const PSIS_SAMPLE_DATA = {
  branches: PSIS_BRANCHES,

  getSchoolInfoForBranch(branchId) {
    const b = PSIS_BRANCHES.find(item => item.id === branchId) || PSIS_BRANCHES[0];
    return {
      nameKh: 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ',
      nameEn: 'PAÑÑĀSĀSTRA INTERNATIONAL SCHOOL',
      mottoKh: 'វិន័យ គុណធម៌ សុភមង្គល',
      branchId: b.id,
      branch: b.nameKh,
      branchEn: b.nameEn,
      principalName: b.principalName,
      inspectorName: b.inspectorName,
      phone: b.phone,
      academicYear: '២០២៦-២០២៧',
      morningScanStart: '06:45',
      morningScanLateThreshold: '07:15',
      morningScanEnd: '11:30',
      afternoonScanStart: '12:45',
      afternoonScanLateThreshold: '13:15',
      afternoonScanEnd: '17:15'
    };
  },

  // Teachers mapped per branch
  getTeachersForBranch(branchId) {
    if (branchId === 'branch-toulkork') {
      return [
        { id: 'TK001', name: 'បេន វី', gender: 'ប្រុស', phone: '010 334 556', level: 'បឋមសិក្សា', shift: 'ល្ងាច', subject: 'ភាសាអង់គ្លេស (ESL)', defaultClass: 'ថ្នាក់ទី 3B', status: 'សកម្ម' },
        { id: 'TK002', name: 'លី សុខុម', gender: 'ប្រុស', phone: '092 445 566', level: 'បឋមសិក្សា', shift: 'ល្ងាច', subject: 'គណិតវិទ្យា', defaultClass: 'ថ្នាក់ទី 4A', status: 'សកម្ម' },
        { id: 'TK003', name: 'ម៉ម សុវណ្ណារ័ត្ន', gender: 'ស្រី', phone: '011 776 655', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ល្ងាច', subject: 'ជីវវិទ្យា', defaultClass: 'ថ្នាក់ទី 8B', status: 'សកម្ម' },
        { id: 'TK004', name: 'ចាន់ ផល្លា', gender: 'ស្រី', phone: '015 990 011', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & តែងសេចក្តី', defaultClass: 'ថ្នាក់ទី 2B', status: 'សកម្ម' },
        { id: 'TK005', name: 'សុខ គឹមលី', gender: 'ស្រី', phone: '012 554 433', level: 'មត្តេយ្យ', shift: 'ព្រឹក', subject: 'មត្តេយ្យសិក្សា', defaultClass: 'K2', status: 'សកម្ម' },
        { id: 'TK006', name: 'ស៊ន វណ្ណា', gender: 'ប្រុស', phone: '077 889 900', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'គីមីវិទ្យា', defaultClass: 'ថ្នាក់ទី 10B', status: 'សកម្ម' }
      ];
    } else if (branchId === 'branch-chbarampov') {
      return [
        { id: 'CA001', name: 'ហែម អឿន', gender: 'ប្រុស', phone: '012 334 455', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'សង្គមសិក្សា & វិទ្យាសាស្ត្រ', defaultClass: 'ថ្នាក់ទី 5A', status: 'សកម្ម' },
        { id: 'CA002', name: 'កែវ សោភា', gender: 'ស្រី', phone: '085 443 322', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & អក្សរសាស្ត្រ', defaultClass: 'ថ្នាក់ទី 12A', status: 'សកម្ម' },
        { id: 'CA003', name: 'នួន វិរៈ', gender: 'ប្រុស', phone: '093 223 344', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'គណិតវិទ្យា', defaultClass: 'ថ្នាក់ទី 3A', status: 'សកម្ម' },
        { id: 'CA004', name: 'ទេព ម៉ាលីស', gender: 'ស្រី', phone: '088 776 655', level: 'មត្តេយ្យ', shift: 'ព្រឹក', subject: 'មត្តេយ្យសិក្សា', defaultClass: 'K2', status: 'សកម្ម' },
        { id: 'CA005', name: 'អ៊ឹម សំបូរ', gender: 'ប្រុស', phone: '016 445 566', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ល្ងាច', subject: 'រូបវិទ្យា', defaultClass: 'ថ្នាក់ទី 9A', status: 'សកម្ម' }
      ];
    } else if (branchId === 'branch-sensok') {
      return [
        { id: 'SS001', name: 'ក ធារិទ្ធ', gender: 'ប្រុស', phone: '017 665 443', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'រូបវិទ្យា & គណិតវិទ្យា', defaultClass: 'ថ្នាក់ទី 9B', status: 'សកម្ម' },
        { id: 'SS002', name: 'សួស ចរិយា', gender: 'ស្រី', phone: '098 221 144', level: 'មត្តេយ្យ', shift: 'ព្រឹក', subject: 'មត្តេយ្យសិក្សា', defaultClass: 'K2', status: 'សកម្ម' },
        { id: 'SS003', name: 'មាស សុជាតិ', gender: 'ប្រុស', phone: '012 998 877', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'ភាសាអង់គ្លេស', defaultClass: 'ថ្នាក់ទី 4B', status: 'សកម្ម' },
        { id: 'SS004', name: 'អ៊ុក សុផល', gender: 'ប្រុស', phone: '070 112 233', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'ប្រវត្តិវិទ្យា & ភូមិវិទ្យា', defaultClass: 'ថ្នាក់ទី 7A', status: 'សកម្ម' },
        { id: 'SS005', name: 'ជា ស្រីមុំ', gender: 'ស្រី', phone: '097 332 211', level: 'បឋមសិក្សា', shift: 'ល្ងាច', subject: 'ភាសាខ្មែរ', defaultClass: 'ថ្នាក់ទី 2A', status: 'សកម្ម' }
      ];
    } else if (branchId === 'branch-bkk') {
      return [
        { id: 'BK001', name: 'ហុក វិសាល', gender: 'ប្រុស', phone: '089 778 899', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'គីមីវិទ្យា & វិទ្យាសាស្ត្រ', defaultClass: 'ថ្នាក់ទី 10A', status: 'សកម្ម' },
        { id: 'BK002', name: 'ព្រះអង្គគ្រូ ស៊ន ប៉ោធី', gender: 'ប្រុស', phone: '097 554 332', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'សីលធម៌ ពលរដ្ឋវិទ្យា & ភាសាបាលី', defaultClass: 'ថ្នាក់ទី 11A', status: 'សកម្ម' },
        { id: 'BK003', name: 'ហេង ឆេងលី', gender: 'ស្រី', phone: '012 889 912', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & គណិតវិទ្យា', defaultClass: 'ថ្នាក់ទី 1A', status: 'សកម្ម' },
        { id: 'BK004', name: 'ស៊ុន ធីតា', gender: 'ស្រី', phone: '011 665 544', level: 'មត្តេយ្យ', shift: 'ព្រឹក', subject: 'មត្តេយ្យសិក្សា', defaultClass: 'K2', status: 'សកម្ម' },
        { id: 'BK005', name: 'ផន ពិសិដ្ឋ', gender: 'ប្រុស', phone: '085 221 133', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ល្ងាច', subject: 'ភាសាអង់គ្លេស', defaultClass: 'ថ្នាក់ទី 8A', status: 'សកម្ម' }
      ];
    }

    // Default Central Campus (branch-central)
    return [
      { id: 'T001', name: 'ហេង ឆេងលី', gender: 'ស្រី', phone: '012 889 912', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & គណិតវិទ្យា', defaultClass: 'ថ្នាក់ទី 1A', status: 'សកម្ម' },
      { id: 'T002', name: 'ព្រះអង្គគ្រូ ស៊ន ប៉ោធី', gender: 'ប្រុស', phone: '097 554 332', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'សីលធម៌ ពលរដ្ឋវិទ្យា & ភាសាបាលី', defaultClass: 'ថ្នាក់ទី 11A', status: 'សកម្ម' },
      { id: 'T003', name: 'បេន វី', gender: 'ប្រុស', phone: '010 334 556', level: 'បឋមសិក្សា', shift: 'ល្ងាច', subject: 'ភាសាអង់គ្លេស (ESL)', defaultClass: 'ថ្នាក់ទី 3B', status: 'សកម្ម' },
      { id: 'T004', name: 'ក ធារិទ្ធ', gender: 'ប្រុស', phone: '017 665 443', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'រូបវិទ្យា & គណិតវិទ្យា', defaultClass: 'ថ្នាក់ទី 9B', status: 'សកម្ម' },
      { id: 'T005', name: 'ហុក វិសាល', gender: 'ប្រុស', phone: '089 778 899', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'គីមីវិទ្យា & វិទ្យាសាស្ត្រ', defaultClass: 'ថ្នាក់ទី 10A', status: 'សកម្ម' },
      { id: 'T006', name: 'ហែម អឿន', gender: 'ប្រុស', phone: '012 334 455', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'សង្គមសិក្សា & វិទ្យាសាស្ត្រ', defaultClass: 'ថ្នាក់ទី 5A', status: 'សកម្ម' },
      { id: 'T007', name: 'សួស ចរិយា', gender: 'ស្រី', phone: '098 221 144', level: 'មត្តេយ្យ', shift: 'ព្រឹក', subject: 'មត្តេយ្យសិក្សា (Kindergarten)', defaultClass: 'K2', status: 'សកម្ម' },
      { id: 'T008', name: 'ចាន់ ផល្លា', gender: 'ស្រី', phone: '015 990 011', level: 'បឋមសិក្សា', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & តែងសេចក្តី', defaultClass: 'ថ្នាក់ទី 2B', status: 'សកម្ម' },
      { id: 'T009', name: 'លី សុខុម', gender: 'ប្រុស', phone: '092 445 566', level: 'បឋមសិក្សា', shift: 'ល្ងាច', subject: 'គណិតវិទ្យា', defaultClass: 'ថ្នាក់ទី 4A', status: 'សកម្ម' },
      { id: 'T010', name: 'អ៊ុក សុផល', gender: 'ប្រុស', phone: '070 112 233', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'ប្រវត្តិវិទ្យា & ភូមិវិទ្យា', defaultClass: 'ថ្នាក់ទី 7A', status: 'សកម្ម' },
      { id: 'T011', name: 'ម៉ម សុវណ្ណារ័ត្ន', gender: 'ស្រី', phone: '011 776 655', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ល្ងាច', subject: 'ជីវវិទ្យា', defaultClass: 'ថ្នាក់ទី 8B', status: 'សកម្ម' },
      { id: 'T012', name: 'កែវ សោភា', gender: 'ស្រី', phone: '085 443 322', level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ', shift: 'ព្រឹក', subject: 'ភាសាខ្មែរ & អក្សរសាស្ត្រ', defaultClass: 'ថ្នាក់ទី 12A', status: 'សកម្ម' }
    ];
  },

  // Schedules generated for branch
  getSchedulesForBranch(branchId, teachers) {
    const schedules = [];
    const days = [1, 2, 3, 4, 5]; // Mon to Fri

    teachers.forEach((t, tIdx) => {
      days.forEach(day => {
        if ((tIdx % 2 === 0) || (day % 2 === 1)) {
          schedules.push({
            id: `SCH_${branchId}_${t.id}_D${day}`,
            teacherId: t.id,
            teacherName: t.name,
            dayOfWeek: day,
            shift: t.shift,
            classGrade: t.defaultClass || 'ថ្នាក់ទី 1',
            level: t.level,
            timeSlot: t.shift === 'ព្រឹក' ? '07:00 - 11:15' : '13:00 - 17:00',
            room: `បន្ទប់ ${100 + (tIdx + 1)}`
          });
        }
      });
    });

    return schedules;
  },

  // Checklist generator
  createDefaultChecklistForDate(dateStr, schedulesList, teachersList) {
    const d = new Date(dateStr + 'T00:00:00');
    let dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) dayOfWeek = 1;

    const daySchedules = schedulesList.filter(s => s.dayOfWeek === dayOfWeek);

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
