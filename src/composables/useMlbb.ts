import { computed, ref, watch } from 'vue';
import type { MlbbTournament } from 'src/types/mlbb';
import { playerKey } from 'src/utils/participants';
import {
  buildMlbbRounds,
  drawMlbbBracket,
  emptyMlbbTournament,
  MLBB_MAX_PLAYERS,
  MLBB_MAX_TOURNAMENTS,
  parseMlbbNames,
  restoreMlbbStore,
  setMlbbResult,
} from 'src/utils/mlbb';

export const MLBB_STORAGE_KEY = 'sorteia-ai-mlbb-v1';

export function useMlbb(english = false) {
  const storageError = ref(false);
  const recoveryWarning = ref(false);
  function load() {
    try {
      const raw = localStorage.getItem(MLBB_STORAGE_KEY);
      const restored = restoreMlbbStore(raw ? (JSON.parse(raw) as unknown) : null);
      if (raw && !restored.tournaments.length) recoveryWarning.value = true;
      return restored;
    } catch {
      recoveryWarning.value = true;
      return restoreMlbbStore(null);
    }
  }
  const store = ref(load());
  if (!store.value.tournaments.length) {
    const tournament = emptyMlbbTournament(crypto.randomUUID(), english);
    store.value.tournaments.push(tournament);
    store.value.activeId = tournament.id;
  }
  const current = computed(
    () => store.value.tournaments.find((item) => item.id === store.value.activeId)!,
  );
  const rounds = computed(() => buildMlbbRounds(current.value));
  const championId = computed(() => rounds.value.at(-1)?.[0]?.winnerId ?? null);
  const locked = computed(() => current.value.seededIds.length > 0);

  watch(
    store,
    () => {
      try {
        localStorage.setItem(MLBB_STORAGE_KEY, JSON.stringify(store.value));
        storageError.value = false;
      } catch {
        storageError.value = true;
      }
    },
    { deep: true, flush: 'sync', immediate: true },
  );

  function replace(tournament: MlbbTournament) {
    const index = store.value.tournaments.findIndex((item) => item.id === tournament.id);
    if (index >= 0) store.value.tournaments[index] = tournament;
  }
  function create(tournament = emptyMlbbTournament(crypto.randomUUID(), english)) {
    if (store.value.tournaments.length >= MLBB_MAX_TOURNAMENTS) return false;
    store.value = {
      version: 1,
      activeId: tournament.id,
      tournaments: [...store.value.tournaments, tournament],
    };
    return true;
  }
  function removeCurrent() {
    const tournaments = store.value.tournaments.filter((item) => item.id !== current.value.id);
    if (!tournaments.length) tournaments.push(emptyMlbbTournament(crypto.randomUUID(), english));
    store.value = { version: 1, activeId: tournaments[0]!.id, tournaments };
  }
  function addNames(raw: string) {
    if (locked.value) return 0;
    const names = parseMlbbNames(raw, current.value.players);
    if (current.value.players.length + names.length > MLBB_MAX_PLAYERS) return -1;
    current.value.players.push(
      ...names.map((name) => ({ id: crypto.randomUUID(), name, gameId: '', serverId: '' })),
    );
    return names.length;
  }
  function updatePlayer(id: string, name: string, gameId: string, serverId: string) {
    if (locked.value) return false;
    const player = current.value.players.find((item) => item.id === id);
    const normalized = name.trim().normalize('NFC').replace(/\s+/g, ' ').slice(0, 60);
    if (
      !player ||
      !normalized ||
      current.value.players.some(
        (item) => item.id !== id && playerKey(item.name) === playerKey(normalized),
      )
    )
      return false;
    Object.assign(player, {
      name: normalized,
      gameId: gameId.trim().slice(0, 30),
      serverId: serverId.trim().slice(0, 20),
    });
    return true;
  }
  function removePlayer(id: string) {
    if (!locked.value)
      current.value.players = current.value.players.filter((item) => item.id !== id);
  }
  function draw() {
    if (!locked.value) replace(drawMlbbBracket(current.value));
  }
  function reopen() {
    replace({ ...current.value, seededIds: [], results: {} });
  }
  function saveResult(matchId: string, input: Parameters<typeof setMlbbResult>[2]) {
    replace(setMlbbResult(current.value, matchId, input));
  }
  return {
    store,
    current,
    rounds,
    locked,
    championId,
    storageError,
    recoveryWarning,
    create,
    removeCurrent,
    addNames,
    updatePlayer,
    removePlayer,
    draw,
    reopen,
    saveResult,
  };
}
