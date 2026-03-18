<template>
  <q-page class="q-pa-lg text-center" style="max-width: 1200px; margin: 0 auto">
    <div class="q-mb-xl">
      <div class="text-h4 text-weight-bold q-mb-md text-gradient" style="letter-spacing: -1px">
        {{ t('numbers.pageTitle') }}
      </div>
      <div class="text-h6 text-weight-regular text-grey-6">
        {{ t('numbers.pageSubtitle') }}
      </div>
    </div>

    <div class="row q-col-gutter-xl text-left">
      <!-- Configurações -->
      <div class="col-12 col-md-6">
        <q-card flat class="card shadow-modern">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-lg">
              {{ t('numbers.configTitle') }}
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <q-input
                  v-model.number="min"
                  type="number"
                  outlined
                  :label="t('numbers.minLabel')"
                />
              </div>

              <div class="col-6">
                <q-input
                  v-model.number="max"
                  type="number"
                  outlined
                  :label="t('numbers.maxLabel')"
                />
              </div>
            </div>

            <q-input
              v-model.number="quantidade"
              type="number"
              outlined
              class="q-mb-md"
              :label="t('numbers.config.quantity')"
              :min="2"
              :max="intervalo"
            />

            <div class="q-mb-md q-gutter-y-sm">
              <div>
                <q-checkbox
                  v-model="permitirRepetidos"
                  :label="t('numbers.allowRepeats')"
                  color="primary"
                />
              </div>
              <div>
                <q-checkbox
                  v-model="ordenarResultado"
                  :label="t('numbers.sortResult')"
                  color="primary"
                />
              </div>
            </div>

            <q-btn
              class="full-width q-py-sm text-weight-bold"
              color="primary"
              unelevated
              :label="t('numbers.actions.draw')"
              :disable="!configuracaoValida"
              @click="sortear"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Resultado -->
      <div class="col-12 col-md-6">
        <q-card flat class="card shadow-modern">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md">
              {{ t('numbers.result.title') }}
            </div>

            <div
              v-if="resultado.length === 0"
              class="text-grey-6 text-center q-pa-lg bg-slate-50 br-20"
              :class="
                $q.dark.isActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              "
              style="border: 1px solid"
            >
              {{ t('numbers.result.none') }}
            </div>

            <div v-else class="row q-gutter-sm">
              <q-chip
                v-for="(numero, index) in sortedResultado"
                :key="index"
                :color="$q.dark.isActive ? 'primary' : 'primary'"
                text-color="white"
                icon="casino"
                class="text-weight-medium shadow-1 q-px-md q-py-sm"
                style="border-radius: 12px; font-size: 16px"
              >
                {{ numero }}
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const min = ref<number>(1);
const max = ref<number>(100);
const quantidade = ref<number>(2);
const permitirRepetidos = ref<boolean>(false);
const ordenarResultado = ref<boolean>(false);
const resultado = ref<number[]>([]);

const intervalo = computed(() => {
  return Math.max(0, max.value - min.value + 1);
});

const sortedResultado = computed(() => {
  if (ordenarResultado.value) return [...resultado.value].sort((a, b) => a - b);
  return resultado.value;
});

const configuracaoValida = computed(() => {
  if (min.value > max.value) return false;
  if (quantidade.value < 1) return false;
  if (!permitirRepetidos.value && quantidade.value > intervalo.value) return false;
  return true;
});

function sortear() {
  const sorteados: number[] = [];

  if (permitirRepetidos.value) {
    for (let i = 0; i < quantidade.value; i++) {
      sorteados.push(random(min.value, max.value));
    }
  } else {
    const pool: number[] = [];
    for (let i = min.value; i <= max.value; i++) {
      pool.push(i);
    }

    for (let i = 0; i < quantidade.value; i++) {
      const index = Math.floor(Math.random() * pool.length);
      if (pool[index]) sorteados.push(pool[index]);
      pool.splice(index, 1);
    }
  }

  resultado.value = sorteados;
}

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
</script>

<style scoped>
.card {
  border-radius: 16px;
}
</style>
