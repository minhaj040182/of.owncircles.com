/**
 * Cron Expression Parser & Calculation Engine
 * Strictly implements standard 5-field Unix crontab syntax:
 * [minute] [hour] [day-of-month] [month] [day-of-week]
 *
 * Implements POSIX standard OR semantics when both day-of-month
 * and day-of-week are specified.
 */

export interface CronFieldValidation {
  valid: boolean;
  set?: Set<number>;
  error?: string;
  raw: string;
}

export interface CronValidationResult {
  valid: boolean;
  error?: string;
  fields?: {
    minute: CronFieldValidation;
    hour: CronFieldValidation;
    dayOfMonth: CronFieldValidation;
    month: CronFieldValidation;
    dayOfWeek: CronFieldValidation;
  };
  explanation?: string;
}

export interface NextOccurrence {
  formatted: string;
  iso: string;
  relative: string;
  date: Date;
}

export const MONTH_NAMES = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export const MONTH_ALIASES: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12
};

export const DOW_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const DOW_ALIASES: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6
};

/**
 * Validates and parses a single cron field into an allowed integer set
 */
export function parseCronField(
  rawField: string,
  fieldName: string,
  min: number,
  max: number,
  aliases?: Record<string, number>
): CronFieldValidation {
  const trimmed = rawField.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: `Field "${fieldName}" cannot be empty.`,
      raw: rawField
    };
  }

  let str = trimmed.toUpperCase();

  // Replace recognized 3-letter word aliases with their numeric values
  if (aliases) {
    for (const [alias, val] of Object.entries(aliases)) {
      const regex = new RegExp(`\\b${alias}\\b`, 'g');
      str = str.replace(regex, val.toString());
    }
  }

  // Check for forbidden characters (allowing only digits, *, /, -, and ,)
  if (/[^0-9*,\/-]/.test(str)) {
    return {
      valid: false,
      error: `Invalid character or unrecognized name in ${fieldName}: "${rawField}".`,
      raw: rawField
    };
  }

  // Check for empty elements in comma-separated lists (e.g. "1,,3" or "1,")
  if (str.startsWith(',') || str.endsWith(',') || str.includes(',,')) {
    return {
      valid: false,
      error: `Invalid comma syntax in ${fieldName}: empty list items or trailing commas are not allowed.`,
      raw: rawField
    };
  }

  const parts = str.split(',');
  const resultSet = new Set<number>();

  for (const part of parts) {
    if (!part) {
      return {
        valid: false,
        error: `Empty list item in ${fieldName}.`,
        raw: rawField
      };
    }

    if (part.includes('/')) {
      const stepParts = part.split('/');
      if (stepParts.length !== 2) {
        return {
          valid: false,
          error: `Multiple slash operators in ${fieldName}: "${part}".`,
          raw: rawField
        };
      }

      const [rangePart, stepStr] = stepParts;
      const step = parseInt(stepStr, 10);
      if (isNaN(step) || step <= 0) {
        return {
          valid: false,
          error: `Invalid step value in ${fieldName}: step must be a positive integer greater than 0.`,
          raw: rawField
        };
      }

      let start = min;
      let end = max;

      if (rangePart === '*') {
        start = min;
        end = max;
      } else if (rangePart.includes('-')) {
        const subParts = rangePart.split('-');
        if (subParts.length !== 2) {
          return {
            valid: false,
            error: `Invalid range syntax in ${fieldName}: "${rangePart}".`,
            raw: rawField
          };
        }
        start = parseInt(subParts[0], 10);
        end = parseInt(subParts[1], 10);
        if (isNaN(start) || isNaN(end)) {
          return {
            valid: false,
            error: `Invalid numeric range in ${fieldName}: "${rangePart}".`,
            raw: rawField
          };
        }
        if (start > end) {
          return {
            valid: false,
            error: `Range start (${start}) is greater than range end (${end}) in ${fieldName}.`,
            raw: rawField
          };
        }
      } else {
        start = parseInt(rangePart, 10);
        if (isNaN(start)) {
          return {
            valid: false,
            error: `Invalid start value in step expression for ${fieldName}: "${rangePart}".`,
            raw: rawField
          };
        }
        end = max;
      }

      if (start < min || end > max) {
        return {
          valid: false,
          error: `Values in "${part}" are out of bounds for ${fieldName}. Allowed range is ${min}–${max}.`,
          raw: rawField
        };
      }

      for (let i = start; i <= end; i += step) {
        resultSet.add(i);
      }
    } else if (part.includes('-')) {
      const rangeParts = part.split('-');
      if (rangeParts.length !== 2) {
        return {
          valid: false,
          error: `Invalid range syntax in ${fieldName}: "${part}".`,
          raw: rawField
        };
      }
      const start = parseInt(rangeParts[0], 10);
      const end = parseInt(rangeParts[1], 10);
      if (isNaN(start) || isNaN(end)) {
        return {
          valid: false,
          error: `Invalid range values in ${fieldName}: "${part}".`,
          raw: rawField
        };
      }
      if (start > end) {
        return {
          valid: false,
          error: `Range start (${start}) is greater than range end (${end}) in ${fieldName}.`,
          raw: rawField
        };
      }
      if (start < min || end > max) {
        return {
          valid: false,
          error: `Range "${part}" is out of bounds for ${fieldName}. Allowed range is ${min}–${max}.`,
          raw: rawField
        };
      }
      for (let i = start; i <= end; i++) {
        resultSet.add(i);
      }
    } else if (part === '*') {
      for (let i = min; i <= max; i++) {
        resultSet.add(i);
      }
    } else {
      const val = parseInt(part, 10);
      if (isNaN(val)) {
        return {
          valid: false,
          error: `Invalid number in ${fieldName}: "${part}".`,
          raw: rawField
        };
      }
      if (val < min || val > max) {
        return {
          valid: false,
          error: `Value "${val}" is out of bounds for ${fieldName}. Allowed range is ${min}–${max}.`,
          raw: rawField
        };
      }
      resultSet.add(val);
    }
  }

  // For day-of-week, 7 is standardly mapped to 0 (Sunday) as well
  if (fieldName === 'day-of-week') {
    if (resultSet.has(7)) {
      resultSet.add(0);
    }
    if (resultSet.has(0)) {
      resultSet.add(7);
    }
  }

  return {
    valid: true,
    set: resultSet,
    raw: rawField
  };
}

/**
 * Validates the full 5-field cron expression
 */
export function validateCronExpression(expression: string): CronValidationResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Please enter a 5-field cron expression.'
    };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length < 5) {
    return {
      valid: false,
      error: `Too few fields: found ${parts.length} field${parts.length === 1 ? '' : 's'}. Standard cron requires exactly 5 fields (minute hour day-of-month month day-of-week).`
    };
  }
  if (parts.length > 5) {
    return {
      valid: false,
      error: `Too many fields: found ${parts.length} fields. This tool parses standard 5-field Unix cron syntax. (6-field or 7-field Quartz expressions with seconds or years are not supported).`
    };
  }

  const minute = parseCronField(parts[0], 'minute', 0, 59);
  if (!minute.valid) return { valid: false, error: minute.error };

  const hour = parseCronField(parts[1], 'hour', 0, 23);
  if (!hour.valid) return { valid: false, error: hour.error };

  const dayOfMonth = parseCronField(parts[2], 'day-of-month', 1, 31);
  if (!dayOfMonth.valid) return { valid: false, error: dayOfMonth.error };

  const month = parseCronField(parts[3], 'month', 1, 12, MONTH_ALIASES);
  if (!month.valid) return { valid: false, error: month.error };

  const dayOfWeek = parseCronField(parts[4], 'day-of-week', 0, 7, DOW_ALIASES);
  if (!dayOfWeek.valid) return { valid: false, error: dayOfWeek.error };

  const fields = { minute, hour, dayOfMonth, month, dayOfWeek };
  const explanation = explainCronExpression(parts[0], parts[1], parts[2], parts[3], parts[4]);

  return {
    valid: true,
    fields,
    explanation
  };
}

/**
 * Generates an accurate, human-readable description for standard 5-field cron syntax
 */
export function explainCronExpression(
  minute: string,
  hour: string,
  dom: string,
  month: string,
  dow: string
): string {
  // Common preset phrases
  const full = `${minute} ${hour} ${dom} ${month} ${dow}`.trim();
  if (full === '* * * * *') return 'At every minute of every day.';
  if (full === '*/5 * * * *') return 'At every 5th minute.';
  if (full === '*/10 * * * *') return 'At every 10th minute.';
  if (full === '*/15 * * * *') return 'At every 15th minute.';
  if (full === '*/30 * * * *') return 'At every 30th minute.';
  if (full === '0 * * * *') return 'At minute 0 of every hour.';
  if (full === '0 0 * * *') return 'At 00:00 (midnight), every day.';
  if (full === '0 12 * * *') return 'At 12:00 (noon), every day.';
  if (full === '0 9 * * 1-5') return 'At 09:00, Monday through Friday.';
  if (full === '0 0 1 * *') return 'At 00:00 (midnight), on day 1 of every month.';
  if (full === '0 0 * * 0' || full === '0 0 * * 7') return 'At 00:00 (midnight), on every Sunday.';

  // Construct composite natural description
  let timeStr = '';

  const pad = (n: number | string) => n.toString().padStart(2, '0');

  // Exact single time (e.g. 0 9 -> 09:00)
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (h === 0 && m === 0) {
      timeStr = 'At 00:00 (midnight)';
    } else if (h === 12 && m === 0) {
      timeStr = 'At 12:00 (noon)';
    } else {
      timeStr = `At ${pad(h)}:${pad(m)}`;
    }
  } else {
    // Variable minute description
    let mStr = '';
    if (minute === '*') {
      mStr = 'every minute';
    } else if (minute.startsWith('*/')) {
      mStr = `every ${minute.substring(2)} minutes`;
    } else if (minute.includes(',')) {
      mStr = `at minutes ${minute.split(',').join(', ')}`;
    } else if (minute.includes('-')) {
      mStr = `every minute from minute ${minute.split('-')[0]} through ${minute.split('-')[1]}`;
    } else {
      mStr = `at minute ${minute}`;
    }

    // Variable hour description
    let hStr = '';
    if (hour === '*') {
      hStr = 'of every hour';
    } else if (hour.startsWith('*/')) {
      hStr = `past every ${hour.substring(2)} hours`;
    } else if (hour.includes(',')) {
      hStr = `during hours ${hour.split(',').map(pad).join(', ')}`;
    } else if (hour.includes('-')) {
      const [h1, h2] = hour.split('-');
      hStr = `between ${pad(h1)}:00 and ${pad(h2)}:00`;
    } else {
      hStr = `past hour ${pad(hour)}:00`;
    }

    timeStr = `At ${mStr} ${hStr}`.trim();
  }

  // Days description (DOM and DOW)
  const isDomStar = dom === '*';
  const isDowStar = dow === '*';

  let daysStr = '';

  const formatDow = (val: string): string => {
    let clean = val.toUpperCase();
    for (const [alias, num] of Object.entries(DOW_ALIASES)) {
      clean = clean.replace(new RegExp(`\\b${alias}\\b`, 'g'), num.toString());
    }
    if (clean === '1-5') return 'Monday through Friday';
    if (clean === '0,6' || clean === '6,0' || clean === '6,7' || clean === '0-6') {
      if (clean === '0-6') return 'every day of the week';
      return 'Saturday and Sunday';
    }
    if (/^\d+$/.test(clean)) {
      const num = parseInt(clean, 10);
      return DOW_NAMES[num] ? DOW_NAMES[num] : val;
    }
    if (clean.includes('-')) {
      const [s, e] = clean.split('-');
      const sN = parseInt(s, 10);
      const eN = parseInt(e, 10);
      return `${DOW_NAMES[sN] || s} through ${DOW_NAMES[eN] || e}`;
    }
    if (clean.includes(',')) {
      return clean
        .split(',')
        .map(p => DOW_NAMES[parseInt(p, 10)] || p)
        .join(', ');
    }
    return val;
  };

  const formatMonth = (val: string): string => {
    let clean = val.toUpperCase();
    for (const [alias, num] of Object.entries(MONTH_ALIASES)) {
      clean = clean.replace(new RegExp(`\\b${alias}\\b`, 'g'), num.toString());
    }
    if (/^\d+$/.test(clean)) {
      const num = parseInt(clean, 10);
      return MONTH_NAMES[num] || val;
    }
    if (clean.includes('-')) {
      const [s, e] = clean.split('-');
      const sN = parseInt(s, 10);
      const eN = parseInt(e, 10);
      return `${MONTH_NAMES[sN] || s} through ${MONTH_NAMES[eN] || e}`;
    }
    if (clean.includes(',')) {
      return clean
        .split(',')
        .map(p => MONTH_NAMES[parseInt(p, 10)] || p)
        .join(', ');
    }
    return val;
  };

  if (isDomStar && isDowStar) {
    daysStr = 'every day';
  } else if (!isDomStar && isDowStar) {
    daysStr = `on day ${dom} of the month`;
  } else if (isDomStar && !isDowStar) {
    daysStr = `on ${formatDow(dow)}`;
  } else {
    // POSIX standard rule: when both are specified, it is an OR union
    daysStr = `on day ${dom} of the month OR on ${formatDow(dow)} (POSIX union rule)`;
  }

  // Month description
  let monthStr = '';
  if (month !== '*') {
    monthStr = `in ${formatMonth(month)}`;
  }

  const parts = [timeStr, daysStr, monthStr].filter(Boolean);
  return parts.join(', ') + '.';
}

/**
 * Calculates the next N occurrences starting from the current or reference date
 */
export function calculateNextOccurrences(
  expression: string,
  timezoneMode: 'local' | 'utc' = 'utc',
  count: number = 5,
  fromDate?: Date
): { occurrences: NextOccurrence[]; error?: string } {
  const validation = validateCronExpression(expression);
  if (!validation.valid || !validation.fields) {
    return { occurrences: [], error: validation.error };
  }

  const { minute, hour, dayOfMonth, month, dayOfWeek } = validation.fields;
  const minSet = minute.set!;
  const hourSet = hour.set!;
  const domSet = dayOfMonth.set!;
  const monthSet = month.set!;
  const dowSet = dayOfWeek.set!;

  const isDomStar = dayOfMonth.raw === '*';
  const isDowStar = dayOfWeek.raw === '*';

  const base = fromDate || new Date();
  const occurrences: NextOccurrence[] = [];

  // Start checking from the next whole minute
  let current: Date;
  if (timezoneMode === 'utc') {
    current = new Date(Date.UTC(
      base.getUTCFullYear(),
      base.getUTCMonth(),
      base.getUTCDate(),
      base.getUTCHours(),
      base.getUTCMinutes() + 1,
      0,
      0
    ));
  } else {
    current = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      base.getHours(),
      base.getMinutes() + 1,
      0,
      0
    );
  }

  // Search horizon: up to 5 years into the future
  const maxSearchTime = base.getTime() + 5 * 366 * 24 * 60 * 60 * 1000;
  let iterations = 0;
  const maxIterations = 25000;

  while (occurrences.length < count && current.getTime() <= maxSearchTime && iterations < maxIterations) {
    iterations++;

    const yr = timezoneMode === 'utc' ? current.getUTCFullYear() : current.getFullYear();
    const mo = (timezoneMode === 'utc' ? current.getUTCMonth() : current.getMonth()) + 1; // 1-12
    const dt = timezoneMode === 'utc' ? current.getUTCDate() : current.getDate(); // 1-31
    const dy = timezoneMode === 'utc' ? current.getUTCDay() : current.getDay(); // 0-6 (Sun-Sat)
    const hr = timezoneMode === 'utc' ? current.getUTCHours() : current.getHours(); // 0-23
    const mn = timezoneMode === 'utc' ? current.getUTCMinutes() : current.getMinutes(); // 0-59

    // 1. Month check: if month doesn't match, fast-forward to 1st of next month at 00:00:00
    if (!monthSet.has(mo)) {
      if (timezoneMode === 'utc') {
        current = new Date(Date.UTC(yr, mo, 1, 0, 0, 0, 0));
      } else {
        current = new Date(yr, mo, 1, 0, 0, 0, 0);
      }
      continue;
    }

    // 2. Day check (POSIX standard rule for DOM and DOW)
    let dayMatches = false;
    if (isDomStar && isDowStar) {
      dayMatches = true;
    } else if (!isDomStar && isDowStar) {
      dayMatches = domSet.has(dt);
    } else if (isDomStar && !isDowStar) {
      dayMatches = dowSet.has(dy);
    } else {
      // Both specified: OR semantics
      dayMatches = domSet.has(dt) || dowSet.has(dy);
    }

    if (!dayMatches) {
      // Advance to next day at 00:00:00
      if (timezoneMode === 'utc') {
        current = new Date(Date.UTC(yr, mo - 1, dt + 1, 0, 0, 0, 0));
      } else {
        current = new Date(yr, mo - 1, dt + 1, 0, 0, 0, 0);
      }
      continue;
    }

    // 3. Hour check: if hour doesn't match, fast-forward to next hour at :00:00
    if (!hourSet.has(hr)) {
      if (timezoneMode === 'utc') {
        current = new Date(Date.UTC(yr, mo - 1, dt, hr + 1, 0, 0, 0));
      } else {
        current = new Date(yr, mo - 1, dt, hr + 1, 0, 0, 0);
      }
      continue;
    }

    // 4. Minute check
    if (minSet.has(mn)) {
      // Match found!
      const matchedDate = new Date(current.getTime());
      occurrences.push({
        date: matchedDate,
        iso: matchedDate.toISOString(),
        formatted: formatExecutionDate(matchedDate, timezoneMode),
        relative: getRelativeTimeStr(matchedDate, base)
      });
    }

    // Advance 1 minute
    if (timezoneMode === 'utc') {
      current = new Date(Date.UTC(yr, mo - 1, dt, hr, mn + 1, 0, 0));
    } else {
      current = new Date(yr, mo - 1, dt, hr, mn + 1, 0, 0);
    }
  }

  if (occurrences.length === 0) {
    return {
      occurrences: [],
      error: 'No scheduled run times found within the next 5 years. (Check if date constraints such as February 30 or impossible month/day combinations were specified).'
    };
  }

  return { occurrences };
}

/**
 * Formats a Date object cleanly with unambiguous timezone indicators
 */
export function formatExecutionDate(d: Date, timezoneMode: 'local' | 'utc'): string {
  if (timezoneMode === 'utc') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dow = days[d.getUTCDay()];
    const mon = months[d.getUTCMonth()];
    const day = d.getUTCDate().toString().padStart(2, '0');
    const yr = d.getUTCFullYear();
    const hr = d.getUTCHours().toString().padStart(2, '0');
    const mn = d.getUTCMinutes().toString().padStart(2, '0');
    const sc = d.getUTCSeconds().toString().padStart(2, '0');
    return `${dow}, ${day} ${mon} ${yr} ${hr}:${mn}:${sc} UTC`;
  }

  // Local timezone format
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  });

  return formatter.format(d);
}

/**
 * Returns a human-friendly relative time string (e.g. "in 12 minutes", "in 2 days")
 */
export function getRelativeTimeStr(target: Date, base: Date): string {
  const diffMs = target.getTime() - base.getTime();
  if (diffMs <= 0) return 'right now';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffMin < 1) return `in ${diffSec}s`;
  if (diffMin < 60) return `in ${diffMin} min${diffMin === 1 ? '' : 's'}`;
  if (diffHr < 24) {
    const remMin = diffMin % 60;
    return remMin > 0 ? `in ${diffHr}h ${remMin}m` : `in ${diffHr} hour${diffHr === 1 ? '' : 's'}`;
  }
  const remHr = diffHr % 24;
  return remHr > 0 ? `in ${diffDays}d ${remHr}h` : `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
}
