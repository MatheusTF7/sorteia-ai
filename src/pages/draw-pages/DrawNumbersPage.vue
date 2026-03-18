<template>
  <q-page class="page-shell">
    <AppPageHero
      :eyebrow="t('nav.numbers')"
      :title="t('numbers.pageTitle')"
      :subtitle="t('numbers.pageSubtitle')"
      icon="pin"
      tone="warning"
    >
      <template #meta>
        <div class="metric-pills">
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('numbers.rangeSize') }}</span>
            <strong class="metric-pill__value">{{ intervalo }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('numbers.config.quantity') }}</span>
            <strong class="metric-pill__value">{{ quantidade }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('numbers.modeLabel') }}</span>
            <strong class="metric-pill__value">{{ currentMode }}</strong>
          </div>
        </div>
      </template>
    </AppPageHero>

    <div class="page-grid page-grid--two">
      <q-card flat class="panel-card">
        <q-card-section class="panel-card__header">
          <div>
            <div class="panel-card__eyebrow">{{ t('numbers.configTitle') }}</div>
            <div class="panel-card__title">{{ t('numbers.configTitle') }}</div>
            <div class="panel-card__description">{{ t('numbers.configDescription') }}</div>
          </div>
        </q-card-section>

        <q-card-section class="panel-card__body panel-card__body--spacious">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="min"
                type="number"
                outlined
                dense
                class="app-field"
                :label="t('numbers.minLabel')"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="max"
                type="number"
                outlined
                dense
                class="app-field"
                :label="t('numbers.maxLabel')"
              />
            </div>
          </div>

          <q-input
            v-model.number="quantidade"
            type="number"
            outlined
            dense
            class="app-field"
            :label="t('numbers.config.quantity')"
            :min="1"
            :max="intervalo"
          />

          <div class="page-stack">
            <q-checkbox v-model="permitirRepetidos" :label="t('numbers.allowRepeats')" />
            <q-checkbox v-model="ordenarResultado" :label="t('numbers.sortResult')" />
          </div>

          <q-btn
            unelevated
            no-caps
            class="app-btn app-btn--primary full-width"
            :label="t('numbers.actions.draw')"
            :disable="!configuracaoValida"
            @click="sortear"
          />
        </q-card-section>
      </q-card>

      <q-card flat class="panel-card">
        <q-card-section class="panel-card__header">
          <div>
            <div class="panel-card__eyebrow">{{ t('numbers.result.title') }}</div>
            <div class="panel-card__title">{{ t('numbers.result.title') }}</div>
            <div class="panel-card__description">{{ t('numbers.resultDescription') }}</div>
          </div>
        </q-card-section>

        <q-card-section class="panel-card__body panel-card__body--spacious">
          <div v-if="resultado.length === 0" class="empty-state">
            <q-icon name="casino" size="32px" />
            <div>{{ t('numbers.result.none') }}</div>
          </div>

          <div v-else class="number-results">
            <div v-for="(numero, index) in sortedResultado" :key="index" class="number-token">
              {{ numero }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppPageHero from 'components/AppPageHero.vue';

const { t } = useI18n();

const min = ref<number>(1);
const max = ref<number>(100);
const quantidade = ref<number>(2);
const permitirRepetidos = ref(false);
const ordenarResultado = ref(false);
const resultado = ref<number[]>([]);

const intervalo = computed(() => Math.max(0, max.value - min.value + 1));

const sortedResultado = computed(() => {
  if (ordenarResultado.value) {
    return [...resultado.value].sort((first, second) => first - second);
  }

  return resultado.value;
});

const configuracaoValida = computed(() => {
  if (min.value > max.value) return false;
  if (quantidade.value < 1) return false;
  if (!permitirRepetidos.value && quantidade.value > intervalo.value) return false;
  return true;
});

const currentMode = computed(() =>
  permitirRepetidos.value ? t('numbers.repeatMode') : t('numbers.uniqueMode'),
);

function sortear() {
  const sorteados: number[] = [];

  if (permitirRepetidos.value) {
    for (let index = 0; index < quantidade.value; index += 1) {
      sorteados.push(random(min.value, max.value));
    }
  } else {
    const pool: number[] = [];

    for (let number = min.value; number <= max.value; number += 1) {
      pool.push(number);
    }

    for (let index = 0; index < quantidade.value; index += 1) {
      const selectedIndex = Math.floor(Math.random() * pool.length);
      if (pool[selectedIndex] !== undefined) {
        sorteados.push(pool[selectedIndex]);
      }
      pool.splice(selectedIndex, 1);
    }
  }

  resultado.value = sorteados;
}

function random(minNumber: number, maxNumber: number): number {
  return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
}
</script>
