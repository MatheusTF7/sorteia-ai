import { onMounted, ref } from 'vue';
import { useSavedConfigs } from './useSavedConfigs';
import type { SavedParticipantList } from 'src/types/saved-lists';
import { initialParticipantListId, playerKey, uniquePlayerNames } from 'src/utils/participants';

export function useSetupParticipants(maxPlayers: number) {
  const { data: savedLists } = useSavedConfigs<SavedParticipantList[]>('saved_lists', []);
  const selectedListId = ref<string>('');
  const names = ref<string[]>([]);
  const selectedNames = ref<string[]>([]);

  function loadList(id: string): void {
    const list = savedLists.value.find((candidate) => candidate.id === id);
    if (!list) return;
    selectedListId.value = id;
    names.value = uniquePlayerNames(list.items);
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

  onMounted(() => {
    const id = initialParticipantListId(savedLists.value);
    if (id) loadList(id);
  });

  return { savedLists, selectedListId, names, selectedNames, loadList, addNames };
}
