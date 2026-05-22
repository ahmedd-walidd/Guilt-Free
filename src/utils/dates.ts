import { endOfMonth, format, startOfMonth } from 'date-fns';

export function toDateInputValue(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

export function getCurrentMonthRange(date = new Date()) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return {
    start,
    end,
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
    monthKey: format(date, 'yyyy-MM'),
    label: format(date, 'MMMM yyyy'),
  };
}

export function isValidDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export function formatDisplayDate(value: string) {
  try {
    return format(new Date(`${value}T00:00:00`), 'dd MMM yyyy');
  } catch {
    return value;
  }
}
