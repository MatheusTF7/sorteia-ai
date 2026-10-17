<template>
  <q-page class="q-pa-md setup-page">
    <div class="setup-container">
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        to="/board-games/heat-pedal-to-the-metal"
        :label="t('heatSetup.backToGuide')"
        class="q-mb-md"
      />
      <header class="q-mb-lg">
        <p class="text-overline text-primary q-mb-xs">{{ heat.name }}</p>
        <h1 class="text-h4 text-weight-bold text-gradient q-mt-none q-mb-sm">
          {{ t('heatSetup.title') }}
        </h1>
        <p>{{ t('heatSetup.subtitle', { min: minPlayers, max: maxPlayers }) }}</p>
        <q-chip outline icon="sports_motorsports" :lang="heat.locale">{{
          baseModule?.name
        }}</q-chip>
      </header>

      <q-banner v-if="!available" rounded role="alert" class="bg-negative text-white">
        {{ t('heatSetup.unavailable') }}
      </q-banner>
      <template v-else>
        <q-card flat bordered class="q-mb-lg">
          <q-card-section>
            <h2 class="text-h6 q-mt-none">1. {{ t('heatSetup.players') }}</h2>
            <SetupPlayerPicker
              v-model="selectedNames"
              :saved-lists="savedLists"
              :selected-list-id="selectedListId"
              :names="names"
              :max-players="maxPlayers"
              @load-list="loadList"
              @add-names="addNames"
            >
              <template #player="{ playerName: name }">
                <q-select
                  :model-value="playerColor(name)"
                  :options="colorOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  :label="t('heatSetup.colorFor', { name })"
                  :bg-color="$q.dark.isActive ? 'dark' : 'white'"
                  @update:model-value="setColor(name, $event)"
                >
                  <template #selected>
                    <span
                      class="car-color q-mr-sm"
                      :style="{ backgroundColor: colorCss(playerColor(name)) }"
                      aria-hidden="true"
                    />
                    {{ colorLabel(playerColor(name)) }}
                  </template>
                  <template #option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar
                        ><span
                          class="car-color"
                          :style="{ backgroundColor: colorCss(scope.opt.value) }"
                          aria-hidden="true"
                      /></q-item-section>
                      <q-item-section>{{ scope.opt.label }}</q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </template>
            </SetupPlayerPicker>
            <p class="text-caption q-mt-md">{{ t('heatSetup.colorHint') }}</p>
            <q-btn
              outline
              color="primary"
              icon="save"
              :label="t('heatSetup.saveColors')"
              :disable="!canDrawGrid"
              @click="persistColors"
            />
            <p class="text-caption q-mt-sm q-mb-none">{{ t('heatSetup.storageHint') }}</p>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-lg">
          <section class="col-12 col-md-6" aria-labelledby="circuit-title">
            <q-card flat bordered class="full-height">
              <q-card-section>
                <h2 id="circuit-title" class="text-h6 q-mt-none">
                  2. {{ t('heatSetup.circuit') }}
                </h2>
                <q-btn
                  color="primary"
                  icon="shuffle"
                  :label="t(circuit ? 'heatSetup.redrawCircuit' : 'heatSetup.drawCircuit')"
                  @click="randomizeCircuit"
                />
                <p class="text-caption q-mt-sm">
                  {{ t('heatSetup.circuitHint', { count: heat.circuits.length }) }}
                </p>
                <div role="status" aria-live="polite" aria-atomic="true">
                  <template v-if="circuit">
                    <h3 class="text-h6" :lang="heat.locale">{{ circuit.name }}</h3>
                    <img
                      v-if="circuitImages[circuit.id]"
                      :src="circuitImages[circuit.id]"
                      :alt="circuit.name"
                      :lang="heat.locale"
                      width="900"
                      height="600"
                      class="circuit-image q-mb-md"
                      decoding="async"
                    />
                    <dl class="circuit-values q-ma-none">
                      <dt>{{ t('boardGames.laps') }}</dt>
                      <dd>{{ circuit.laps }}</dd>
                      <dt>{{ t('boardGames.corners') }}</dt>
                      <dd>{{ circuit.corners }}</dd>
                      <dt>Heat</dt>
                      <dd>{{ circuit.heat }}</dd>
                      <dt>{{ t('boardGames.stress') }}</dt>
                      <dd>{{ circuit.stress }}</dd>
                    </dl>
                  </template>
                  <p v-else class="q-mt-md">{{ t('heatSetup.noCircuit') }}</p>
                </div>
              </q-card-section>
            </q-card>
          </section>

          <section class="col-12 col-md-6" aria-labelledby="grid-title">
            <q-card flat bordered class="full-height">
              <q-card-section>
                <h2 id="grid-title" class="text-h6 q-mt-none">3. {{ t('heatSetup.grid') }}</h2>
                <q-btn
                  color="primary"
                  icon="shuffle"
                  :disable="!canDrawGrid"
                  :label="t(grid.length ? 'heatSetup.redrawGrid' : 'heatSetup.drawGrid')"
                  @click="randomizeGrid"
                />
                <p v-if="!canDrawGrid" class="text-body2 q-mt-md">
                  {{ t('heatSetup.selectFirst', { min: minPlayers, max: maxPlayers }) }}
                </p>
                <div role="status" aria-live="polite" aria-atomic="true">
                  <ol v-if="grid.length" class="grid-list q-mt-md q-mb-none">
                    <li v-for="player in grid" :key="player.position" class="q-py-sm">
                      <span
                        class="car-color q-mr-sm"
                        :style="{ backgroundColor: colorCss(player.color) }"
                        aria-hidden="true"
                      />
                      <strong>{{ player.name }}</strong> — {{ colorLabel(player.color) }}
                    </li>
                  </ol>
                  <p v-else class="q-mt-md">{{ t('heatSetup.noGrid') }}</p>
                </div>
              </q-card-section>
            </q-card>
          </section>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import heatJson from '../../../public/data/board-games/heat-pedal-to-the-metal.json';
import type { HeatDataset } from 'src/types/heat';
import { useHeatSetup } from 'src/composables/useHeatSetup';
import { boardGameImages } from 'src/data/board-game-images';
import { heatColors } from 'src/data/heat-colors';
import SetupPlayerPicker from 'components/board-games/SetupPlayerPicker.vue';

const heat: HeatDataset = heatJson;
const { t } = useI18n();
const $q = useQuasar();
const {
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
} = useHeatSetup(heat);
const baseModule = heat.modules.find((module) => module.id === 'base');
const circuitImages = boardGameImages[heat.id] ?? {};
const colorOptions = computed(() =>
  colors.map((color) => ({ label: colorLabel(color), value: color })),
);

function colorCss(color: string): string {
  return heatColors[color]?.css ?? color;
}
function colorLabel(color: string): string {
  const labelKey = heatColors[color]?.labelKey;
  return labelKey ? t(labelKey) : color;
}
function playerColor(name: string): string {
  return players.value.find((player) => player.name === name)?.color ?? '';
}
function persistColors(): void {
  const saved = saveColors();
  $q.notify({
    message: t(saved ? 'heatSetup.colorsSaved' : 'heatSetup.saveError'),
    color: saved ? 'positive' : 'negative',
    position: 'bottom',
  });
}
</script>

<style scoped>
.setup-container {
  max-width: 1000px;
  margin: 0 auto;
  overflow-wrap: anywhere;
}
.setup-page {
  color: var(--sa-text);
}
.car-color {
  display: inline-block;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  border-radius: 50%;
  border: 1px solid var(--sa-text-muted);
  vertical-align: middle;
}
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
.grid-list {
  padding-left: 28px;
}
@media (min-width: 600px) {
  .setup-page {
    padding: 32px;
  }
}
</style>
