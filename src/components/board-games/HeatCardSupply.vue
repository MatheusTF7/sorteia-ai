<template>
  <div class="card-supply">
    <figure v-for="kind in kinds" :key="kind" class="supply-item q-ma-none">
      <img
        :src="images[kind]"
        :alt="t(`heatVisuals.${kind}`)"
        width="70"
        height="100"
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        <strong class="text-h6">{{ circuit[kind] }}</strong>
        <span>{{ t(`heatVisuals.${kind}`) }}</span>
        <small>{{ t('heatVisuals.perPlayer') }}</small>
      </figcaption>
    </figure>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { boardGameImages } from 'src/data/board-game-images';
import type { CircuitReference } from 'src/types/board-games';

defineProps<{ circuit: CircuitReference }>();
const { t } = useI18n();
const images = boardGameImages['heat-pedal-to-the-metal']!;
const kinds = ['heat', 'stress'] as const;
</script>

<style scoped>
.card-supply {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.supply-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--sa-border);
  border-radius: 12px;
}
.supply-item img {
  object-fit: contain;
}
figcaption {
  display: flex;
  flex-direction: column;
}
small {
  color: var(--sa-text-muted);
}
</style>
