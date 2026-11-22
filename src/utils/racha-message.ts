import type { RachaState } from '../types/racha';
import { formatRachaSchedule } from './racha-schedule';

type Translate = (key: string, values?: Record<string, string | number>) => string;

function singleLine(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

/** A roster update is independent of draws and of the page's search/filter state. */
export function formatRachaMessage(state: RachaState, t: Translate, locale = 'pt-BR'): string {
  const lines = [`⚽ *${singleLine(state.title) || t('racha.nav')}*`];
  if (state.location.trim()) lines.push(`📍 ${singleLine(state.location)}`);
  const schedule = formatRachaSchedule(state, locale, t('racha.nextDay'));
  if (schedule) lines.push(`📅 ${schedule}`);
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
