import { computed, ref, watch } from 'vue';
import { useSetupParticipants } from './useSetupParticipants';
import type { BoardGame } from 'src/types/board-games';
import {
  dealStartingPotions,
  drawPotionPlayerOrder,
  drawPotionTypes,
  type PotionStartingHand,
} from 'src/utils/potion-setup';

export function usePotionSetup(data: BoardGame) {
  const participants = useSetupParticipants(data.players.max);
  const potions = data.potions ?? [];
  const config = data.potionSetup;
  const activeIds = ref<string[]>([]);
  const order = ref<string[]>([]);
  const hands = ref<PotionStartingHand[]>([]);
  const available = Boolean(
    config &&
    potions.length >= config.activeTypeCount &&
    config.activeTypeCount > 0 &&
    config.startingCopiesPerType > 0 &&
    config.startingPotionsPerPlayer > 0 &&
    config.activeTypeCount * config.startingCopiesPerType >=
      data.players.max * config.startingPotionsPerPlayer,
  );
  const canPrepare = computed(
    () =>
      available &&
      participants.selectedNames.value.length >= data.players.min &&
      participants.selectedNames.value.length <= data.players.max,
  );
  const canDeal = computed(
    () =>
      canPrepare.value &&
      order.value.length === participants.selectedNames.value.length &&
      activeIds.value.length === config?.activeTypeCount,
  );
  const activePotions = computed(() =>
    activeIds.value.flatMap((id) => potions.filter((potion) => potion.id === id)),
  );
  const excludedPotions = computed(() =>
    activeIds.value.length ? potions.filter((potion) => !activeIds.value.includes(potion.id)) : [],
  );

  watch(
    participants.selectedNames,
    () => {
      order.value = [];
      hands.value = [];
    },
    { deep: true, flush: 'sync' },
  );
  watch(
    [order, activeIds],
    () => {
      hands.value = [];
    },
    { deep: true, flush: 'sync' },
  );

  function randomizeStarter(): void {
    if (canPrepare.value) order.value = drawPotionPlayerOrder(participants.selectedNames.value);
  }
  function randomizeTypes(): void {
    if (available && config)
      activeIds.value = drawPotionTypes(
        potions.map((potion) => potion.id),
        config.activeTypeCount,
      );
  }
  function randomizeHands(): void {
    if (canDeal.value && config)
      hands.value = dealStartingPotions(order.value, activeIds.value, config);
  }
  function randomizeAll(): void {
    if (!canPrepare.value) return;
    randomizeTypes();
    randomizeStarter();
    randomizeHands();
  }
  return {
    ...participants,
    available,
    canPrepare,
    canDeal,
    activePotions,
    excludedPotions,
    order,
    hands,
    randomizeStarter,
    randomizeTypes,
    randomizeHands,
    randomizeAll,
  };
}
