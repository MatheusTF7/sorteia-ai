import type { RachaState } from '../types/racha';

type Translate = (key: string, values?: Record<string, string | number>) => string;

function singleLine(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

/** Keep the match's selected wall-clock time; exporting must not shift it between time zones. */
function matchDate(value: string, locale: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (!parts) return singleLine(value);
  const [, year, month, day, hour, minute] = parts;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)),
  );
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date);
}

/** A roster update is independent of draws and of the page's search/filter state. */
export function formatRachaMessage(state: RachaState, t: Translate, locale = 'pt-BR'): string {
  const lines = [`⚽ *${singleLine(state.title) || t('racha.nav')}*`];
  if (state.location.trim()) lines.push(`📍 ${singleLine(state.location)}`);
  if (state.date) lines.push(`📅 ${matchDate(state.date, locale)}`);
  const fee = Number(state.fee);
  const feeCents = Number.isFinite(fee) && fee > 0 ? Math.round(fee * 100) : 0;
  const money = (cents: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  if (feeCents) lines.push(`💰 *${t('racha.whatsapp.fee')}:* ${money(feeCents)}`);
  lines.push('', `*${t('racha.whatsapp.players', { count: state.players.length })}*`);
  state.players.forEach((player, index) => {
    const roles = [
      player.goalkeeper ? `🧤 ${t('racha.goalkeeper')}` : '',
      player.seed && !player.goalkeeper ? `⭐ ${t('racha.seed')}` : '',
      player.paid ? `✅ ${t('racha.paid')}` : `⏳ ${t('racha.unpaid')}`,
    ].filter(Boolean);
    lines.push(`${index + 1}. ${singleLine(player.name)} — ${roles.join(' · ')}`);
  });
  const paid = state.players.filter((player) => player.paid).length;
  lines.push(
    '',
    `*${t('racha.payments')}*`,
    `✅ ${t('racha.paidOf', { paid, total: state.players.length })}`,
    `⏳ ${t('racha.whatsapp.pending', { count: state.players.length - paid })}`,
  );
  if (feeCents)
    lines.push(
      `💵 ${t('racha.received')}: ${money(paid * feeCents)}`,
      `💰 ${t('racha.pendingAmount')}: ${money((state.players.length - paid) * feeCents)}`,
    );
  return lines.join('\n');
}
