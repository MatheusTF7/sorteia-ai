<template>
  <div>
    <h3 class="text-subtitle1 text-weight-bold">{{ t('boardGames.gearReference') }}</h3>
    <q-markup-table flat bordered wrap-cells>
      <caption class="sr-only">
        {{
          t('boardGames.gearReference')
        }}
      </caption>
      <thead>
        <tr>
          <th scope="col">{{ t('boardGames.gear') }}</th>
          <th scope="col">{{ t('boardGames.cards') }}</th>
          <th scope="col">{{ t('boardGames.cooldown') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="gear in reference.gears" :key="gear.id">
          <th scope="row">{{ gear.gear }}</th>
          <td>{{ gear.cards }}</td>
          <td>{{ gear.cooldown }}</td>
        </tr>
      </tbody>
    </q-markup-table>
    <h3 class="text-subtitle1 text-weight-bold q-mt-lg">{{ t('boardGames.circuits') }}</h3>
    <div class="row q-col-gutter-sm">
      <div v-for="circuit in reference.circuits" :key="circuit.id" class="col-12 col-sm-6">
        <q-card flat bordered>
          <q-card-section>
            <h4 class="text-subtitle2 q-mt-none q-mb-sm" :lang="contentLanguage">
              {{ circuit.name }}
            </h4>
            <img
              v-if="images[circuit.id]"
              :src="images[circuit.id]"
              :alt="circuit.name"
              :lang="contentLanguage"
              width="900"
              height="600"
              loading="lazy"
              decoding="async"
              class="circuit-image q-mb-md"
            />
            <dl class="circuit-values q-ma-none">
              <dt>{{ t('boardGames.laps') }}</dt>
              <dd>{{ circuit.laps }}</dd>
              <dt>{{ t('boardGames.corners') }}</dt>
              <dd>{{ circuit.corners }}</dd>
            </dl>
            <HeatCardSupply :circuit="circuit" class="q-mt-md" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { BoardGame } from 'src/types/board-games';
import HeatCardSupply from './HeatCardSupply.vue';

defineProps<{
  reference: NonNullable<BoardGame['racingReference']>;
  contentLanguage: string;
  images: Record<string, string>;
}>();
const { t } = useI18n();
</script>

<style scoped>
.circuit-image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 2;
  object-fit: contain;
  border-radius: 8px;
}
.circuit-values {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 16px;
}
.circuit-values dd {
  margin: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
