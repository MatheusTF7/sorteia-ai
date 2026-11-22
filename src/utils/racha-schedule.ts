import type { RachaState } from '../types/racha';

export function isRachaDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isRachaTime(value: unknown): value is string {
  return typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function timeMinutes(time: string): number {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
}

export function addRachaMinutes(time: string, duration = 60): string {
  if (!isRachaTime(time)) return '';
  const minutes = (timeMinutes(time) + duration + 1440) % 1440;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function rachaDuration(start: string, end: string): number | null {
  if (!isRachaTime(start) || !isRachaTime(end)) return null;
  return (timeMinutes(end) - timeMinutes(start) + 1440) % 1440;
}

/** Format the selected calendar day without converting the match to another time zone. */
export function formatRachaDate(value: string, locale = 'pt-BR'): string {
  if (!isRachaDate(value)) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export function formatRachaSchedule(
  state: Pick<RachaState, 'date' | 'startTime' | 'endTime'>,
  locale = 'pt-BR',
  nextDayLabel = '',
): string {
  const parts = [formatRachaDate(state.date, locale)];
  if (isRachaTime(state.startTime)) {
    let time = state.startTime;
    if (isRachaTime(state.endTime)) {
      time += ` – ${state.endTime}`;
      if (state.endTime < state.startTime && nextDayLabel) time += ` (${nextDayLabel})`;
    }
    parts.push(time);
  }
  return parts.filter(Boolean).join(' · ');
}
