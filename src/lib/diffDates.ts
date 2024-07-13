export function diffDates(start: Date, end: Date) {
  const HOURS_DAY = 24;
  const MINUTES_HOUR = 60;
  const SECONDS_MINUTE = 60;
  const MILLISECONDS_SECOND = 1000;

  return Math.round(
    (end.getTime() - start.getTime()) / (HOURS_DAY * MINUTES_HOUR * SECONDS_MINUTE * MILLISECONDS_SECOND)
  )
}