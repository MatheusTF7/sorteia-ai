<template>
  <div class="hero-settings">
    <h3>{{ t('mlbb.heroDraw') }}</h3>
    <p>{{ t('mlbb.heroDrawHint') }}</p>
    <q-select
      v-model="settings.classes"
      outlined
      multiple
      emit-value
      map-options
      use-chips
      :options="classOptions"
      :label="t('mlbb.baseClasses')"
    />
    <q-select
      v-model="settings.bannedIds"
      class="q-mt-md"
      outlined
      multiple
      emit-value
      map-options
      use-input
      use-chips
      input-debounce="0"
      :options="filteredHeroes"
      :label="t('mlbb.bannedHeroes')"
      @filter="filterHeroes"
    >
      <template #option="scope"
        ><q-item v-bind="scope.itemProps"
          ><q-item-section avatar
            ><q-avatar
              ><img :src="mlbbHeroImage(scope.opt.hero)" alt="" /></q-avatar></q-item-section
          ><q-item-section>{{ scope.opt.label }}</q-item-section
          ><q-item-section side
            ><q-icon
              :name="
                settings.bannedIds.includes(scope.opt.value) ? 'block' : 'add'
              " /></q-item-section></q-item
      ></template>
    </q-select>
    <q-btn
      outline
      no-caps
      color="negative"
      icon="block"
      class="q-mt-sm"
      :label="t('mlbb.openBanPhase')"
      @click="bansOpen = true"
    />
    <MlbbBanDialog
      v-model="bansOpen"
      v-model:banned="settings.bannedIds"
      :classes="settings.classes"
      :overrides="settings.overrides"
    />
    <div class="draw-mode q-mt-md">
      <div class="draw-mode-title">{{ t('mlbb.drawMode') }}</div>
      <q-option-group v-model="drawMode" :options="drawModeOptions" type="radio">
        <template #label="opt"
          ><div class="draw-mode-option">
            <span>{{ opt.label }}</span
            ><small>{{ opt.hint }}</small>
          </div></template
        >
      </q-option-group>
      <q-btn
        flat
        dense
        no-caps
        color="primary"
        icon="view_list"
        class="q-mt-xs"
        :label="t('mlbb.viewPresets', { count: mlbbDuelPresets.length })"
        @click="presetsOpen = true"
      />
      <MlbbPresetsDialog v-model="presetsOpen" :settings="settings" />
      <div v-if="drawMode === 'balanced'" class="win-rate-gap">
        <label :for="gapId">{{ t('mlbb.maxWinRateGap', { value: formatGap(winRateGap) }) }}</label>
        <q-slider
          :id="gapId"
          v-model="winRateGap"
          :min="MLBB_WIN_RATE_GAP.min"
          :max="MLBB_WIN_RATE_GAP.max"
          :step="0.5"
          label
          :label-value="t('mlbb.winRateGapValue', { value: formatGap(winRateGap) })"
        />
      </div>
      <small class="stats-source"
        >{{
          t('mlbb.statsSource', {
            rank: mlbbStatsSource.rank === 'all' ? t('mlbb.allRanks') : mlbbStatsSource.rank,
            days: mlbbStatsSource.periodDays,
            date: new Intl.DateTimeFormat(locale).format(new Date(mlbbStatsSource.collectedAt)),
          })
        }}
        <a :href="mlbbStatsSource.url" target="_blank" rel="noopener noreferrer">{{
          t('mlbb.statsSourceLink')
        }}</a></small
      >
    </div>
    <p v-if="!available" class="text-negative" role="alert">
      {{
        t(
          drawMode === 'presets'
            ? 'mlbb.noPresetPool'
            : drawMode === 'free'
              ? 'mlbb.noFreePool'
              : 'mlbb.noHeroPool',
        )
      }}
    </p>
    <p v-else-if="drawMode === 'free'">
      {{ t('mlbb.availableFreeHeroes', { count: freeHeroes.length }) }}
    </p>
    <p v-else-if="drawMode === 'presets'">
      {{ t('mlbb.availablePresets', { count: presets.length, total: mlbbDuelPresets.length }) }}
    </p>
    <p v-else>{{ t('mlbb.availableClasses', { count: pools.length }) }}</p>
    <q-expansion-item icon="manage_search" :label="t('mlbb.editHeroClasses')">
      <p class="q-mt-sm">{{ t('mlbb.unclassifiedHint', { count: unclassified }) }}</p>
      <q-select
        v-model="editingId"
        outlined
        emit-value
        map-options
        use-input
        :options="filteredHeroes"
        :label="t('mlbb.chooseHero')"
        @filter="filterHeroes"
      />
      <q-select
        v-if="editingId"
        :model-value="
          settings.overrides[editingId] ??
          mlbbHeroes.find((hero) => hero.id === editingId)?.classes ??
          []
        "
        outlined
        multiple
        emit-value
        map-options
        use-chips
        :options="classOptions"
        :label="t('mlbb.baseClasses')"
        class="q-mt-md"
        @update:model-value="(value) => (settings.overrides[editingId] = value)"
      />
    </q-expansion-item>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import MlbbPresetsDialog from './MlbbPresetsDialog.vue';
import MlbbBanDialog from './MlbbBanDialog.vue';
import { mlbbDuelPresets, mlbbHeroes, mlbbHeroImage, mlbbStatsSource } from 'src/data/mlbb/catalog';
import {
  MLBB_CLASSES,
  MLBB_DRAW_MODES,
  MLBB_WIN_RATE_GAP,
  eligiblePresets,
  freeHeroPool,
  heroPools,
} from 'src/utils/mlbb-heroes';
import type { MlbbHeroDrawMode, MlbbHeroSettings } from 'src/utils/mlbb-heroes';
const settings = defineModel<MlbbHeroSettings>({ required: true });
const { t, locale } = useI18n();
const classOptions = computed(() =>
  MLBB_CLASSES.map((value) => ({ value, label: t(`mlbb.classes.${value}`) })),
);
const drawModeKeys: Record<MlbbHeroDrawMode, string> = {
  uniform: 'uniform',
  free: 'free',
  'avoid-counters': 'avoidCounters',
  balanced: 'balanced',
  presets: 'presets',
};
const drawModeOptions = computed(() =>
  MLBB_DRAW_MODES.map((value) => ({
    value,
    label: t(`mlbb.drawModes.${drawModeKeys[value]}.label`),
    hint: t(`mlbb.drawModes.${drawModeKeys[value]}.hint`),
  })),
);
const drawMode = computed<MlbbHeroDrawMode>({
  get: () => settings.value.drawMode ?? 'uniform',
  set: (value) => {
    // Uniform is the implicit default, so it is stored as an absent field like older tournaments.
    if (value === 'uniform') delete settings.value.drawMode;
    else settings.value.drawMode = value;
  },
});
const winRateGap = computed<number>({
  get: () => settings.value.maxWinRateGap ?? MLBB_WIN_RATE_GAP.default,
  set: (value) => {
    settings.value.maxWinRateGap = value;
  },
});
const gapId = 'mlbb-win-rate-gap';
const presetsOpen = ref(false);
const bansOpen = ref(false);
function formatGap(value: number) {
  return new Intl.NumberFormat(locale.value, { maximumFractionDigits: 1 }).format(value);
}
const options = mlbbHeroes
  .map((hero) => ({ value: hero.id, label: hero.name, hero }))
  .sort((a, b) => a.label.localeCompare(b.label));
const filteredHeroes = ref(options);
const editingId = ref('');
function filterHeroes(value: string, update: (callback: () => void) => void) {
  update(() => {
    filteredHeroes.value = options.filter((option) =>
      option.label.toLocaleLowerCase().includes(value.toLocaleLowerCase()),
    );
  });
}
const pools = computed(() => heroPools(mlbbHeroes, settings.value));
const presets = computed(() => eligiblePresets(mlbbHeroes, settings.value, mlbbDuelPresets));
const freeHeroes = computed(() => freeHeroPool(mlbbHeroes, settings.value));
const available = computed(() =>
  drawMode.value === 'presets'
    ? presets.value.length > 0
    : drawMode.value === 'free'
      ? freeHeroes.value.length >= 2
      : pools.value.length > 0,
);
const unclassified = computed(
  () =>
    mlbbHeroes.filter((hero) => !(settings.value.overrides[hero.id] ?? hero.classes).length).length,
);
</script>
<style scoped>
.hero-settings {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--mlbb-border);
}
h3 {
  font-size: 1.125rem;
  margin: 0;
}
p {
  font-size: 0.875rem;
  color: var(--mlbb-muted);
  line-height: 1.6;
  margin: 12px 0;
}
.draw-mode-title {
  font-size: 0.875rem;
  font-weight: 600;
}
.draw-mode-option {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}
.draw-mode-option small,
.stats-source {
  color: var(--mlbb-muted);
  font-size: 0.8125rem;
  line-height: 1.5;
}
.win-rate-gap {
  padding: 4px 12px 0 44px;
  font-size: 0.875rem;
}
.stats-source {
  display: block;
  margin-top: 8px;
}
</style>
