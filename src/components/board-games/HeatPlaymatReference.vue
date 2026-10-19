<template>
  <q-card flat bordered>
    <q-card-section>
      <h2 class="text-h6 q-mt-none q-mb-sm">{{ t('heatVisuals.playmat') }}</h2>
      <p class="text-body2">{{ t('heatVisuals.playmatHint') }}</p>
      <img
        :src="playmat"
        :alt="t('heatVisuals.playmatAlt')"
        width="2171"
        height="1434"
        loading="lazy"
        decoding="async"
        class="playmat-image"
      />
      <q-btn
        flat
        color="primary"
        icon="zoom_in"
        :label="t('heatVisuals.enlarge')"
        class="q-mt-sm"
        @click="expanded = true"
      />
      <dl class="playmat-legend q-mb-none">
        <div v-for="area in areas" :key="area">
          <dt class="text-weight-bold">{{ t(`heatVisuals.${area}`) }}</dt>
          <dd class="q-ma-none text-body2">{{ t(`heatVisuals.${area}Hint`) }}</dd>
        </div>
      </dl>
    </q-card-section>
    <q-dialog v-model="expanded" maximized>
      <q-card class="column no-wrap">
        <q-card-section class="row items-center justify-between">
          <h2 class="text-h6 q-ma-none">{{ t('heatVisuals.playmat') }}</h2>
          <q-btn v-close-popup flat round icon="close" :aria-label="t('heatVisuals.close')" />
        </q-card-section>
        <q-card-section class="col playmat-zoom">
          <img :src="playmat" :alt="t('heatVisuals.playmatAlt')" width="2171" height="1434" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import playmat from 'src/assets/heat-pedal-to-the-metal/playmat.jpg';

const { t } = useI18n();
const expanded = ref(false);
const areas = ['deck', 'engine', 'discard', 'gears'] as const;
</script>

<style scoped>
.playmat-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
}
.playmat-legend {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.playmat-zoom {
  overflow: auto;
}
.playmat-zoom img {
  display: block;
  width: 100%;
  min-width: 1000px;
  height: auto;
}
@media (max-width: 599px) {
  .playmat-legend {
    grid-template-columns: 1fr;
  }
}
</style>
