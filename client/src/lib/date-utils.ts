import { getISOWeek, getISOWeekYear, startOfISOWeek, addDays, format } from "date-fns";

export function getCurrentWeek() {
  const now = new Date();
  return {
    year: getISOWeekYear(now),
    week: getISOWeek(now),
  };
}

export function getWeekDates(year: number, week: number) {
  const startOfWeek = startOfISOWeek(new Date(year, 0, 1));
  const weekStart = addDays(startOfWeek, (week - 1) * 7);
  
  const dates = [];
  for (let i = 0; i < 6; i++) { // Monday to Saturday
    dates.push(addDays(weekStart, i));
  }
  
  return dates;
}

export function formatWeekRange(year: number, week: number) {
  const dates = getWeekDates(year, week);
  const start = format(dates[0], "MMM d");
  const end = format(dates[5], "MMM d, yyyy");
  return `${start} - ${end}`;
}

export function getDayName(dayIndex: number) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayIndex];
}

export function formatTaskDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function parseTaskDate(dateString: string) {
  return new Date(dateString);
}
