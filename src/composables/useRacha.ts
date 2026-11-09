import { computed, ref, watch } from 'vue';
import type { RachaPlayer } from 'src/types/racha';
import { playerKey } from 'src/utils/participants';
import {
  drawRachaStarter,
  drawRachaTeams,
  emptyRacha,
  isRachaSeed,
  parseRachaNames,
  rachaDrawIssue,
  rachaTeamCount,
  restoreRacha,
} from 'src/utils/racha';

export const RACHA_STORAGE_KEY = 'sorteia-ai-racha-v1';

export function useRacha() {
  const storageError = ref(false);
  function load() {
    try {
      const raw = localStorage.getItem(RACHA_STORAGE_KEY);
      return restoreRacha(raw ? (JSON.parse(raw) as unknown) : null);
    } catch {
      storageError.value = true;
      return emptyRacha();
    }
  }
  const state = ref(load());
  const drawChanged = computed({
    get: () => state.value.drawChanged,
    set: (value: boolean) => {
      state.value.drawChanged = value;
    },
  });
  const seeds = computed(() => state.value.players.filter(isRachaSeed));
  const goalkeepers = computed(() => state.value.players.filter((player) => player.goalkeeper));
  const paid = computed(() => state.value.players.filter((player) => player.paid));
  const teamCount = computed(() => rachaTeamCount(state.value.players, state.value.config));
  const drawIssue = computed(() => rachaDrawIssue(state.value.players, state.value.config));
  const playersById = computed(
    () => new Map(state.value.players.map((player) => [player.id, player])),
  );
  const resultTeams = computed(() =>
    state.value.teams.map((team) =>
      team
        .map((id) => playersById.value.get(id))
        .filter((player): player is RachaPlayer => !!player),
    ),
  );
  const starter = computed(() => playersById.value.get(state.value.starter ?? ''));
  const feeCents = computed(() => Math.round(Math.max(0, Number(state.value.fee) || 0) * 100));
  const received = computed(() => (paid.value.length * feeCents.value) / 100);
  const pending = computed(
    () => ((state.value.players.length - paid.value.length) * feeCents.value) / 100,
  );

  // Names and payments can change without invalidating assignments, which use stable IDs.
  watch(
    () =>
      JSON.stringify([
        state.value.players.map(({ id, goalkeeper, seed }) => [id, goalkeeper, seed]),
        state.value.config.mode,
        state.value.config.mode === 'size' ? state.value.config.teamSize : null,
      ]),
    () => {
      if (state.value.teams.length) drawChanged.value = true;
      state.value.teams = [];
      state.value.starter = null;
    },
    { flush: 'sync' },
  );

  watch(
    () => state.value.config.defineStarter,
    (enabled) => {
      if (!enabled) state.value.starter = null;
    },
    { flush: 'sync' },
  );
  watch(
    state,
    () => {
      try {
        localStorage.setItem(RACHA_STORAGE_KEY, JSON.stringify(state.value));
        storageError.value = false;
      } catch {
        storageError.value = true;
      }
    },
    { deep: true, flush: 'sync' },
  );

  function addNames(raw: string) {
    const names = parseRachaNames(raw, state.value.players);
    const added = names.map((name) => ({
      id: crypto.randomUUID(),
      name,
      goalkeeper: false,
      seed: false,
      paid: false,
    }));
    state.value.players.push(...added);
    return added.length;
  }
  function renamePlayer(id: string, name: string) {
    const normalized = name.trim().replace(/\s+/g, ' ');
    if (
      !normalized ||
      state.value.players.some(
        (player) => player.id !== id && playerKey(player.name) === playerKey(normalized),
      )
    )
      return false;
    const player = playersById.value.get(id);
    if (!player) return false;
    player.name = normalized;
    return true;
  }
  function removePlayer(id: string) {
    state.value.players = state.value.players.filter((player) => player.id !== id);
  }
  function generateTeams() {
    if (drawIssue.value) return;
    state.value.teams = drawRachaTeams(state.value.players, state.value.config);
    state.value.starter = state.value.config.defineStarter
      ? drawRachaStarter(state.value.teams)
      : null;
    drawChanged.value = false;
  }
  function pickStarter() {
    if (state.value.config.defineStarter) state.value.starter = drawRachaStarter(state.value.teams);
  }
  function reset() {
    state.value = emptyRacha();
    drawChanged.value = false;
  }
  return {
    state,
    storageError,
    drawChanged,
    seeds,
    goalkeepers,
    paid,
    teamCount,
    drawIssue,
    resultTeams,
    starter,
    received,
    pending,
    addNames,
    renamePlayer,
    removePlayer,
    generateTeams,
    pickStarter,
    reset,
  };
}
