import { computed, onMounted, ref, watch } from 'vue';
import { useSavedConfigs } from './useSavedConfigs';
import type { HeatDataset } from 'src/types/heat';
import type { SavedParticipantList } from 'src/types/saved-lists';
import type { CircuitReference } from 'src/types/board-games';
import {
  assignPlayerColors,
  changePlayerColor,
  drawCircuit,
  drawStartingGrid,
  initialParticipantListId,
  playerKey,
  uniquePlayerNames,
  validColorPreferences,
  type HeatPlayer,
  type HeatGridPosition,
} from 'src/utils/heat-setup';

const COLOR_STORAGE_KEY = 'heat_player_colors_v1';

export function useHeatSetup(data: HeatDataset) {
  const enabledRandomizers = data.randomizers.filter(
    (item) => item.module === 'base' && item.enabled,
  );
  const gridConfig = enabledRandomizers.find((item) => item.id === 'starting-grid');
  const trackConfig = enabledRandomizers.find((item) => item.id === 'track');
  const colorConfig = enabledRandomizers.find((item) => item.id === 'car-colors');
  const colors = colorConfig?.options ?? [];
  const minPlayers = Math.max(data.players.min, gridConfig?.input?.playersMin ?? data.players.min);
  const maxPlayers = Math.min(
    data.players.max,
    gridConfig?.input?.playersMax ?? data.players.max,
    colors.length,
  );
  const available = Boolean(
    gridConfig &&
    trackConfig?.optionsSource === 'circuits' &&
    colors.length &&
    data.circuits.length,
  );
  const { data: savedLists } = useSavedConfigs<SavedParticipantList[]>('saved_lists', []);
  const { data: preferences, save } = useSavedConfigs<Record<string, string>>(
    COLOR_STORAGE_KEY,
    {},
  );
  const selectedListId = ref<string>('');
  const names = ref<string[]>([]);
  const selectedNames = ref<string[]>([]);
  const players = ref<HeatPlayer[]>([]);
  const grid = ref<HeatGridPosition[]>([]);
  const circuit = ref<CircuitReference | null>(null);
  const canDrawGrid = computed(
    () => available && players.value.length >= minPlayers && players.value.length <= maxPlayers,
  );

  watch(
    selectedNames,
    (selection) => {
      players.value = assignPlayerColors(
        selection,
        colors,
        validColorPreferences(preferences.value, colors),
        players.value,
      );
    },
    { deep: true },
  );
  // A previous grid must not represent a different roster or different car colors.
  watch(
    players,
    () => {
      grid.value = [];
    },
    { deep: true, flush: 'sync' },
  );

  function loadList(id: string): void {
    const list = savedLists.value.find((candidate) => candidate.id === id);
    if (!list) return;
    selectedListId.value = id;
    names.value = uniquePlayerNames(list.items);
    players.value = [];
    selectedNames.value = names.value.length <= maxPlayers ? [...names.value] : [];
  }

  function addNames(raw: string): void {
    const incoming = uniquePlayerNames(raw.split(/[,;\n]+/));
    const existing = new Set(names.value.map(playerKey));
    const additions = incoming.filter((name) => !existing.has(playerKey(name)));
    names.value = [...names.value, ...additions];
    selectedNames.value = [
      ...selectedNames.value,
      ...additions.slice(0, Math.max(0, maxPlayers - selectedNames.value.length)),
    ];
  }

  function setColor(name: string, color: string): void {
    if (colors.includes(color)) players.value = changePlayerColor(players.value, name, color);
  }

  function saveColors(): boolean {
    if (!canDrawGrid.value) return false;
    preferences.value = {
      ...validColorPreferences(preferences.value, colors),
      ...Object.fromEntries(players.value.map((player) => [playerKey(player.name), player.color])),
    };
    save();
    try {
      return localStorage.getItem(COLOR_STORAGE_KEY) === JSON.stringify(preferences.value);
    } catch {
      return false;
    }
  }

  function randomizeGrid(): void {
    if (canDrawGrid.value) grid.value = drawStartingGrid(players.value);
  }

  function randomizeCircuit(): void {
    if (available) circuit.value = drawCircuit(data.circuits) ?? null;
  }

  onMounted(() => {
    const initialId = initialParticipantListId(savedLists.value);
    if (initialId) loadList(initialId);
  });

  return {
    available,
    colors,
    minPlayers,
    maxPlayers,
    savedLists,
    selectedListId,
    names,
    selectedNames,
    players,
    grid,
    circuit,
    canDrawGrid,
    loadList,
    addNames,
    setColor,
    saveColors,
    randomizeGrid,
    randomizeCircuit,
  };
}
