/**
 * Sample Master Data for Paññāsāstra International School (សាលាបញ្ញាសាស្រ្តអន្តរជាតិ)
 * Includes the requested teachers:
 * - ហេង ឆេងលី
 * - ព្រះអង្គគ្រូ ស៊ន ប៉ោធី
 * - បេន វី
 * - ក ធារិទ្ធ
 * - ហុក វិសាល
 * - ហែម អឿន
 * and other teachers across Kindergarten (K2), Primary (Grades 1-6), Secondary (Grades 7-12).
 */

const PSIS_SAMPLE_DATA = {
  schoolInfo: {
    nameKh: 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ',
    nameEn: 'PAÑÑĀSĀSTRA INTERNATIONAL SCHOOL',
    mottoKh: 'វិន័យ គុណធម៌ សុភមង្គល',
    branch: 'សាខាកណ្តាល (Central Campus)',
    principalName: 'លោកស្រី គង់ វណ្ណារី (នាយិកាសាខា)',
    inspectorName: 'លោក ស៊ុន សុខជា (អ្នកត្រួតពិនិត្យរដ្ឋបាល)',
    academicYear: '២០២៦-២០២៧',
    morningScanStart: '06:45',
    morningScanLateThreshold: '07:15',
    morningScanEnd: '11:30',
    afternoonScanStart: '12:45',
    afternoonScanLateThreshold: '13:15',
    afternoonScanEnd: '17:15'
  },

  teachers: [
    {
      id: 'T001',
      name: 'ហេង ឆេងលី',
      gender: 'ស្រី',
      phone: '012 889 912',
      level: 'បឋមសិក្សា',
      shift: 'ព្រឹក',
      subject: 'ភាសាខ្មែរ & គណិតវិទ្យា',
      defaultClass: 'ថ្នាក់ទី 1A',
      status: 'សកម្ម'
    },
    {
      id: 'T002',
      name: 'ព្រះអង្គគ្រូ ស៊ន ប៉ោធី',
      gender: 'ប្រុស',
      phone: '097 554 332',
      level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ',
      shift: 'ព្រឹក',
      subject: 'សីលធម៌ ពលរដ្ឋវិទ្យា & ភាសាបាលី',
      defaultClass: 'ថ្នាក់ទី 11A',
      status: 'សកម្ម'
    },
    {
      id: 'T003',
      name: 'បេន វី',
      gender: 'ប្រុស',
      phone: '010 334 556',
      level: 'បឋមសិក្សា',
      shift: 'ល្ងាច',
      subject: 'ភាសាអង់គ្លេស (ESL)',
      defaultClass: 'ថ្នាក់ទី 3B',
      status: 'សកម្ម'
    },
    {
      id: 'T004',
      name: 'ក ធារិទ្ធ',
      gender: 'ប្រុស',
      phone: '017 665 443',
      level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ',
      shift: 'ព្រឹក',
      subject: 'រូបវិទ្យា & គណិតវិទ្យា',
      defaultClass: 'ថ្នាក់ទី 9B',
      status: 'សកម្ម'
    },
    {
      id: 'T005',
      name: 'ហុក វិសាល',
      gender: 'ប្រុស',
      phone: '089 778 899',
      level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ',
      shift: 'ព្រឹក',
      subject: 'គីមីវិទ្យា & វិទ្យាសាស្ត្រ',
      defaultClass: 'ថ្នាក់ទី 10A',
      status: 'សកម្ម'
    },
    {
      id: 'T006',
      name: 'ហែម អឿន',
      gender: 'ប្រុស',
      phone: '012 334 455',
      level: 'បឋមសិក្សា',
      shift: 'ព្រឹក',
      subject: 'សង្គមសិក្សា & វិទ្យាសាស្ត្រ',
      defaultClass: 'ថ្នាក់ទី 5A',
      status: 'សកម្ម'
    },
    {
      id: 'T007',
      name: 'សួស ចរិយា',
      gender: 'ស្រី',
      phone: '098 221 144',
      level: 'មត្តេយ្យ',
      shift: 'ព្រឹក',
      subject: 'មត្តេយ្យសិក្សា (Kindergarten)',
      defaultClass: 'K2 (កម្រិតមធ្យម)',
      status: 'សកម្ម'
    },
    {
      id: 'T008',
      name: 'ចាន់ ផល្លា',
      gender: 'ស្រី',
      phone: '015 990 011',
      level: 'បឋមសិក្សា',
      shift: 'ព្រឹក',
      subject: 'ភាសាខ្មែរ & តែងសេចក្តី',
      defaultClass: 'ថ្នាក់ទី 2B',
      status: 'សកម្ម'
    },
    {
      id: 'T009',
      name: 'លី សុខុម',
      gender: 'ប្រុស',
      phone: '092 445 566',
      level: 'បឋមសិក្សា',
      shift: 'ល្ងាច',
      subject: 'គណិតវិទ្យា',
      defaultClass: 'ថ្នាក់ទី 4A',
      status: 'សកម្ម'
    },
    {
      id: 'T010',
      name: 'អ៊ុក សុផល',
      gender: 'ប្រុស',
      phone: '070 112 233',
      level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ',
      shift: 'ព្រឹក',
      subject: 'ប្រវត្តិវិទ្យា & ភូមិវិទ្យា',
      defaultClass: 'ថ្នាក់ទី 7A',
      status: 'សកម្ម'
    },
    {
      id: 'T011',
      name: 'ម៉ម សុវណ្ណារ័ត្ន',
      gender: 'ស្រី',
      phone: '011 776 655',
      level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ',
      shift: 'ល្ងាច',
      subject: 'ជីវវិទ្យា',
      defaultClass: 'ថ្នាក់ទី 8B',
      status: 'សកម្ម'
    },
    {
      id: 'T012',
      name: 'កែវ សោភា',
      gender: 'ស្រី',
      phone: '085 443 322',
      level: 'អនុវិទ្យាល័យ-វិទ្យាល័យ',
      shift: 'ព្រឹក',
      subject: 'ភាសាខ្មែរ & អក្សរសាស្ត្រ',
      defaultClass: 'ថ្នាក់ទី 12A',
      status: 'សកម្ម'
    }
  ],

  // Weekly Schedule Mappings (ចាត់ចែងតាមថ្ងៃ ចន្ទ ដល់ សុក្រ)
  // Day: 1=ចន្ទ (Mon), 2=អង្គារ (Tue), 3=ពុធ (Wed), 4=ព្រហស្បតិ៍ (Thu), 5=សុក្រ (Fri)
  schedules: [
    // ថ្ងៃចន្ទ (Monday - Day 1) - ព្រឹក (Morning)
    { id: 'SCH001', teacherId: 'T007', teacherName: 'សួស ចរិយា', dayOfWeek: 1, shift: 'ព្រឹក', classGrade: 'K2', level: 'មត្តេយ្យ', timeSlot: '07:30 - 11:00', room: 'បន្ទប់ K2-A' },
    { id: 'SCH002', teacherId: 'T001', teacherName: 'ហេង ឆេងលី', dayOfWeek: 1, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 1A', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០១' },
    { id: 'SCH003', teacherId: 'T008', teacherName: 'ចាន់ ផល្លា', dayOfWeek: 1, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 2B', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០២' },
    { id: 'SCH004', teacherId: 'T006', teacherName: 'ហែម អឿន', dayOfWeek: 1, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 5A', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០៥' },
    { id: 'SCH005', teacherId: 'T010', teacherName: 'អ៊ុក សុផល', dayOfWeek: 1, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 7A', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ២០១' },
    { id: 'SCH006', teacherId: 'T004', teacherName: 'ក ធារិទ្ធ', dayOfWeek: 1, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 9B', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ២០៣' },
    { id: 'SCH007', teacherId: 'T005', teacherName: 'ហុក វិសាល', dayOfWeek: 1, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 10A', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ៣០១' },
    { id: 'SCH008', teacherId: 'T002', teacherName: 'ព្រះអង្គគ្រូ ស៊ន ប៉ោធី', dayOfWeek: 1, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 11A', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ៣០២' },
    { id: 'SCH009', teacherId: 'T012', teacherName: 'កែវ សោភា', dayOfWeek: 1, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 12A', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ៣០៣' },

    // ថ្ងៃចន្ទ (Monday - Day 1) - ល្ងាច (Afternoon)
    { id: 'SCH010', teacherId: 'T003', teacherName: 'បេន វី', dayOfWeek: 1, shift: 'ល្ងាច', classGrade: 'ថ្នាក់ទី 3B', level: 'បឋមសិក្សា', timeSlot: '13:00 - 17:00', room: 'បន្ទប់ ១០៣' },
    { id: 'SCH011', teacherId: 'T009', teacherName: 'លី សុខុម', dayOfWeek: 1, shift: 'ល្ងាច', classGrade: 'ថ្នាក់ទី 4A', level: 'បឋមសិក្សា', timeSlot: '13:00 - 17:00', room: 'បន្ទប់ ១០៤' },
    { id: 'SCH012', teacherId: 'T011', teacherName: 'ម៉ម សុវណ្ណារ័ត្ន', dayOfWeek: 1, shift: 'ល្ងាច', classGrade: 'ថ្នាក់ទី 8B', level: 'មធ្យមសិក្សា', timeSlot: '13:00 - 17:15', room: 'បន្ទប់ ២០២' },

    // ថ្ងៃអង្គារ (Tuesday - Day 2)
    { id: 'SCH013', teacherId: 'T007', teacherName: 'សួស ចរិយា', dayOfWeek: 2, shift: 'ព្រឹក', classGrade: 'K2', level: 'មត្តេយ្យ', timeSlot: '07:30 - 11:00', room: 'បន្ទប់ K2-A' },
    { id: 'SCH014', teacherId: 'T001', teacherName: 'ហេង ឆេងលី', dayOfWeek: 2, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 1A', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០១' },
    { id: 'SCH015', teacherId: 'T008', teacherName: 'ចាន់ ផល្លា', dayOfWeek: 2, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 2B', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០២' },
    { id: 'SCH016', teacherId: 'T006', teacherName: 'ហែម អឿន', dayOfWeek: 2, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 6A', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០៦' },
    { id: 'SCH017', teacherId: 'T004', teacherName: 'ក ធារិទ្ធ', dayOfWeek: 2, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 8A', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ២០២' },
    { id: 'SCH018', teacherId: 'T005', teacherName: 'ហុក វិសាល', dayOfWeek: 2, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 11B', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ៣០២' },
    { id: 'SCH019', teacherId: 'T002', teacherName: 'ព្រះអង្គគ្រូ ស៊ន ប៉ោធី', dayOfWeek: 2, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 12A', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ៣០៣' },
    { id: 'SCH020', teacherId: 'T003', teacherName: 'បេន វី', dayOfWeek: 2, shift: 'ល្ងាច', classGrade: 'ថ្នាក់ទី 5B', level: 'បឋមសិក្សា', timeSlot: '13:00 - 17:00', room: 'បន្ទប់ ១០៥' },

    // ថ្ងៃពុធ (Wednesday - Day 3)
    { id: 'SCH021', teacherId: 'T007', teacherName: 'សួស ចរិយា', dayOfWeek: 3, shift: 'ព្រឹក', classGrade: 'K2', level: 'មត្តេយ្យ', timeSlot: '07:30 - 11:00', room: 'បន្ទប់ K2-A' },
    { id: 'SCH022', teacherId: 'T001', teacherName: 'ហេង ឆេងលី', dayOfWeek: 3, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 1B', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០១' },
    { id: 'SCH023', teacherId: 'T006', teacherName: 'ហែម អឿន', dayOfWeek: 3, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 5A', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០៥' },
    { id: 'SCH024', teacherId: 'T004', teacherName: 'ក ធារិទ្ធ', dayOfWeek: 3, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 9B', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ២០៣' },
    { id: 'SCH025', teacherId: 'T005', teacherName: 'ហុក វិសាល', dayOfWeek: 3, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 10A', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ៣០១' },
    { id: 'SCH026', teacherId: 'T002', teacherName: 'ព្រះអង្គគ្រូ ស៊ន ប៉ោធី', dayOfWeek: 3, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 11A', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ៣០២' },
    { id: 'SCH027', teacherId: 'T003', teacherName: 'បេន វី', dayOfWeek: 3, shift: 'ល្ងាច', classGrade: 'ថ្នាក់ទី 3B', level: 'បឋមសិក្សា', timeSlot: '13:00 - 17:00', room: 'បន្ទប់ ១០៣' },

    // ថ្ងៃព្រហស្បតិ៍ (Thursday - Day 4)
    { id: 'SCH028', teacherId: 'T007', teacherName: 'សួស ចរិយា', dayOfWeek: 4, shift: 'ព្រឹក', classGrade: 'K2', level: 'មត្តេយ្យ', timeSlot: '07:30 - 11:00', room: 'បន្ទប់ K2-A' },
    { id: 'SCH029', teacherId: 'T001', teacherName: 'ហេង ឆេងលី', dayOfWeek: 4, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 1A', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០១' },
    { id: 'SCH030', teacherId: 'T006', teacherName: 'ហែម អឿន', dayOfWeek: 4, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 5A', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០៥' },
    { id: 'SCH031', teacherId: 'T004', teacherName: 'ក ធារិទ្ធ', dayOfWeek: 4, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 9A', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ២០៣' },
    { id: 'SCH032', teacherId: 'T005', teacherName: 'ហុក វិសាល', dayOfWeek: 4, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 12B', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ៣០៣' },
    { id: 'SCH033', teacherId: 'T002', teacherName: 'ព្រះអង្គគ្រូ ស៊ន ប៉ោធី', dayOfWeek: 4, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 10B', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ៣០១' },
    { id: 'SCH034', teacherId: 'T003', teacherName: 'បេន វី', dayOfWeek: 4, shift: 'ល្ងាច', classGrade: 'ថ្នាក់ទី 4B', level: 'បឋមសិក្សា', timeSlot: '13:00 - 17:00', room: 'បន្ទប់ ១០៤' },

    // ថ្ងៃសុក្រ (Friday - Day 5)
    { id: 'SCH035', teacherId: 'T007', teacherName: 'សួស ចរិយា', dayOfWeek: 5, shift: 'ព្រឹក', classGrade: 'K2', level: 'មត្តេយ្យ', timeSlot: '07:30 - 11:00', room: 'បន្ទប់ K2-A' },
    { id: 'SCH036', teacherId: 'T001', teacherName: 'ហេង ឆេងលី', dayOfWeek: 5, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 1A', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០១' },
    { id: 'SCH037', teacherId: 'T008', teacherName: 'ចាន់ ផល្លា', dayOfWeek: 5, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 2B', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០២' },
    { id: 'SCH038', teacherId: 'T006', teacherName: 'ហែម អឿន', dayOfWeek: 5, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 5A', level: 'បឋមសិក្សា', timeSlot: '07:00 - 11:15', room: 'បន្ទប់ ១០៥' },
    { id: 'SCH039', teacherId: 'T004', teacherName: 'ក ធារិទ្ធ', dayOfWeek: 5, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 9B', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ២០៣' },
    { id: 'SCH040', teacherId: 'T005', teacherName: 'ហុក វិសាល', dayOfWeek: 5, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 10A', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ៣០១' },
    { id: 'SCH041', teacherId: 'T002', teacherName: 'ព្រះអង្គគ្រូ ស៊ន ប៉ោធី', dayOfWeek: 5, shift: 'ព្រឹក', classGrade: 'ថ្នាក់ទី 11A', level: 'មធ្យមសិក្សា', timeSlot: '07:00 - 11:30', room: 'បន្ទប់ ៣០២' },
    { id: 'SCH042', teacherId: 'T003', teacherName: 'បេន វី', dayOfWeek: 5, shift: 'ល្ងាច', classGrade: 'ថ្នាក់ទី 3B', level: 'បឋមសិក្សា', timeSlot: '13:00 - 17:00', room: 'បន្ទប់ ១០៣' }
  ],

  // Default checklist templates generator for dates
  createDefaultChecklistForDate(dateStr, schedulesList, teachersList) {
    const d = new Date(dateStr + 'T00:00:00');
    let dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    // If weekend, map to Monday for easy demo testing
    if (dayOfWeek === 0 || dayOfWeek === 6) dayOfWeek = 1;

    // Filter schedules for this day
    const daySchedules = schedulesList.filter(s => s.dayOfWeek === dayOfWeek);

    return daySchedules.map((sch, index) => {
      // Create varied realistic records for demonstration
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

      // Demonstration variations for testing alerts
      if (sch.teacherName === 'ក ធារិទ្ធ') {
        // Teacher is Late
        scanIn = '07:25';
        remarks = 'យឺត';
        note = 'មកយឺតដោយសារស្ទះចរាចរណ៍';
      } else if (sch.teacherName === 'ហុក វិសាល') {
        // Teacher on leave (ច្បាប់) -> Columns 4 to 9 should be grayed out!
        scanIn = '';
        attendance = 'មិនបានស្រង់';
        scoreEvaluation = 'មិនបានដាក់ពិន្ទុ';
        telegram = 'មិនបានប្រើ';
        lessonSummary = 'មិនបានសរសេរ';
        scanOut = '';
        remarks = 'ច្បាប់';
        note = 'សុំច្បាប់មើលជំងឺ';
      } else if (sch.teacherName === 'ហែម អឿន') {
        // Incomplete admin tasks (missed grading and summary)
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
        remarks: remarks, // ធម្មតា, ច្បាប់, យឺត, គ្មានច្បាប់
        note: note
      };
    });
  }
};

// Export for module/global usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PSIS_SAMPLE_DATA;
}
