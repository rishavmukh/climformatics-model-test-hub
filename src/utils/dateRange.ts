import type { TimeRange } from '../api/seriesTypes';

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Open-Meteo natively understands forecast_days/past_days, but providers
 * like Visual Crossing only take explicit start/end dates — this resolves
 * either time-range mode into concrete yyyy-mm-dd bounds for those clients.
 */
export function resolveTimeRange(timeRange: TimeRange): { startDate: string; endDate: string } {
  if (timeRange.mode === 'range') {
    return { startDate: timeRange.startDate, endDate: timeRange.endDate };
  }

  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - timeRange.pastDays);
  const end = new Date(today);
  end.setDate(end.getDate() + Math.max(timeRange.forecastDays - 1, 0));

  return { startDate: isoDate(start), endDate: isoDate(end) };
}
