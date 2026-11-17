/**
 * Khmer Lunar Calendar & Date Converter (ប្រតិទិនចន្ទគតិខ្មែរ)
 * Provides accurate Khmer Lunar date strings (e.g. ថ្ងៃ ចន្ទ ៩រោច ខែភទ្របទ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០)
 * and Khmer Gregorian date formatting (e.g. ត្រូវនឹងថ្ងៃទី៥ ខែតុលា ឆ្នាំ២០២៦).
 */

const KhmerCalendar = (() => {
  // Khmer Numerals
  const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

  function toKhmerNumber(num) {
    if (num === null || num === undefined) return '';
    return String(num).replace(/[0-9]/g, d => KHMER_DIGITS[d]);
  }

  // Days of Week in Khmer
  const DAYS_OF_WEEK = [
    'ថ្ងៃអាទិត្យ', // Sunday
    'ថ្ងៃចន្ទ',    // Monday
    'ថ្ងៃអង្គារ',   // Tuesday
    'ថ្ងៃពុធ',     // Wednesday
    'ថ្ងៃព្រហស្បតិ៍', // Thursday
    'ថ្ងៃសុក្រ',   // Friday
    'ថ្ងៃសៅរ៍'    // Saturday
  ];

  // Gregorian Months in Khmer
  const GREGORIAN_MONTHS_KH = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];

  // 12 Khmer Animal Years (ឆ្នាំសត្វ)
  const ANIMAL_YEARS = [
    'ជូត', 'ឆ្លូវ', 'ខាល', 'ថោះ', 'រោង', 'ម្សាញ់',
    'មមី', 'មមែ', 'វក', 'រកា', 'ច', 'កុរ'
  ];

  // 10 Sak (ស័ក)
  const SAKS = [
    'សំរឹទ្ធិស័ក', // 0
    'ឯកស័ក',     // 1
    'ទោស័ក',     // 2
    'ត្រីស័ក',     // 3
    'ចត្វាស័ក',    // 4
    'បញ្ចស័ក',    // 5
    'ឆស័ក',      // 6
    'សប្តស័ក',    // 7
    'អដ្ឋស័ក',    // 8
    'នព្វស័ក'     // 9
  ];

  // 12 Lunar Months (ខែចន្ទគតិ)
  const LUNAR_MONTHS = [
    'មិគសិរ', 'បុស្ស', 'មាឃ', 'ផល្គុន', 'ចេត្រ', 'ពិសាខ',
    'ជេស្ឋ', 'អាសាឍ', 'ស្រាពណ៍', 'ភទ្របទ', 'អស្សុជ', 'កត្តិក'
  ];

  // Reference Anchor: 2026-10-05
  // Gregorian: 2026-10-05 (Monday)
  // Lunar: 9 Roch, Month Photrobot (index 9 in LUNAR_MONTHS), Year Momee (Horse, index 6), Atthasak (8), BE 2570
  const REF_DATE = new Date(2026, 9, 5); // Month is 0-indexed in JS (9 = Oct)
  const SYNODIC_MONTH = 29.53058867; // Average synodic lunar month length in days

  /**
   * Calculate Animal Year based on Gregorian year & month (Khmer New Year usually in mid-April)
   */
  function getAnimalYear(year, month, day) {
    // If before Khmer New Year (~April 14), it belongs to previous animal year
    let effectiveYear = year;
    if (month < 3 || (month === 3 && day < 14)) {
      effectiveYear -= 1;
    }
    // Animal year formula: 2026 (after April) is Horse (index 6: មមី)
    // (2026 + 9) % 12 = 2035 % 12 = 7 -> 7-1 = 6
    const index = ((effectiveYear + 8) % 12 + 12) % 12;
    return ANIMAL_YEARS[index];
  }

  /**
   * Calculate Sak (ស័ក)
   */
  function getSak(year, month, day) {
    let effectiveYear = year;
    if (month < 3 || (month === 3 && day < 14)) {
      effectiveYear -= 1;
    }
    // Sak is based on last digit of Buddhist Era / year
    // For 2026: Atthasak (8)
    const index = ((effectiveYear + 2) % 10 + 10) % 10;
    return SAKS[index];
  }

  /**
   * Calculate Buddhist Era (ពុទ្ធសករាជ)
   * Visak Bochea (Full moon of Pisakh, ~May) marks the change of Buddhist Era
   */
  function getBuddhistEra(year, month, day) {
    // Before Visak Bochea (approx mid-May), BE is Gregorian + 543; after, Gregorian + 544
    if (month < 4 || (month === 4 && day < 15)) {
      return year + 543;
    }
    return year + 544;
  }

  /**
   * Compute Lunar Day and Phase (កើត / រោច)
   */
  function getLunarDayAndMonth(date) {
    const diffTime = date.getTime() - REF_DATE.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // Anchor is 9 Roch (which is 15 days of Kaet + 9 days of Roch = day 24 of lunar cycle 1-30)
    // In Photrobot (month index 9)
    const anchorPhaseDay = 24; // 15 + 9
    const totalLunarDays = anchorPhaseDay + diffDays;
    
    // Total months since anchor
    const monthsPassed = Math.floor(totalLunarDays / SYNODIC_MONTH);
    let dayInCycle = (totalLunarDays % SYNODIC_MONTH + SYNODIC_MONTH) % SYNODIC_MONTH;
    dayInCycle = Math.round(dayInCycle);
    if (dayInCycle === 0) dayInCycle = 30;

    let phaseStr = '';
    let phaseNumber = 1;

    if (dayInCycle <= 15) {
      phaseStr = 'កើត';
      phaseNumber = Math.max(1, dayInCycle);
    } else {
      phaseStr = 'រោច';
      phaseNumber = Math.max(1, dayInCycle - 15);
      if (phaseNumber > 15) phaseNumber = 15;
    }

    // Determine lunar month
    // Anchor month index = 9 (ភទ្របទ)
    let monthIdx = (9 + monthsPassed) % 12;
    if (monthIdx < 0) monthIdx += 12;

    return {
      phaseStr,
      phaseNumber,
      monthName: LUNAR_MONTHS[monthIdx]
    };
  }

  /**
   * Main formatting function: returns full official Khmer Lunar date string
   * e.g. "ថ្ងៃ ចន្ទ ៩រោច ខែភទ្របទ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០"
   */
  function getKhmerLunarDateString(dateInput) {
    const d = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : new Date(dateInput);
    const dayOfWeek = DAYS_OF_WEEK[d.getDay()];
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();

    const animalYear = getAnimalYear(year, month, day);
    const sak = getSak(year, month, day);
    const be = toKhmerNumber(getBuddhistEra(year, month, day));

    const lunar = getLunarDayAndMonth(d);
    const lunarDayNum = toKhmerNumber(lunar.phaseNumber);

    return `${dayOfWeek} ${lunarDayNum}${lunar.phaseStr} ខែ${lunar.monthName} ឆ្នាំ${animalYear} ${sak} ពុទ្ធសករាជ ${be}`;
  }

  /**
   * Returns Gregorian date in Khmer format
   * e.g. "ត្រូវនឹងថ្ងៃទី៥ ខែតុលា ឆ្នាំ២០២៦"
   */
  function getKhmerGregorianDateString(dateInput) {
    const d = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : new Date(dateInput);
    const day = toKhmerNumber(d.getDate());
    const month = GREGORIAN_MONTHS_KH[d.getMonth()];
    const year = toKhmerNumber(d.getFullYear());

    return `ត្រូវនឹងថ្ងៃទី${day} ខែ${month} ឆ្នាំ${year}`;
  }

  /**
   * Full combined official signature header
   */
  function getFullOfficialKhmerDate(dateInput) {
    const lunar = getKhmerLunarDateString(dateInput);
    const solar = getKhmerGregorianDateString(dateInput);
    return `${lunar} / ${solar}`;
  }

  /**
   * Returns short date in Khmer: e.g. "០៥ តុលា ២០២៦"
   */
  function formatKhmerShortDate(dateInput) {
    const d = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : new Date(dateInput);
    const day = toKhmerNumber(String(d.getDate()).padStart(2, '0'));
    const month = GREGORIAN_MONTHS_KH[d.getMonth()];
    const year = toKhmerNumber(d.getFullYear());
    return `${day} ${month} ${year}`;
  }

  /**
   * Convert 24-hr time (HH:mm) to Khmer formatted time
   */
  function formatKhmerTime(timeStr) {
    if (!timeStr) return '-';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const khHour = toKhmerNumber(parts[0]);
    const khMin = toKhmerNumber(parts[1]);
    return `${khHour}:${khMin}`;
  }

  return {
    toKhmerNumber,
    DAYS_OF_WEEK,
    GREGORIAN_MONTHS_KH,
    ANIMAL_YEARS,
    SAKS,
    LUNAR_MONTHS,
    getKhmerLunarDateString,
    getKhmerGregorianDateString,
    getFullOfficialKhmerDate,
    formatKhmerShortDate,
    formatKhmerTime
  };
})();

// Export for module/global usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KhmerCalendar;
}
