<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 text-weight-bold q-mb-sm">{{ t('numbers.pageTitle') }}</div>
    <div class="text-subtitle2 text-grey-7 q-mb-lg">
      {{ t('numbers.pageSubtitle') }}
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Configurações -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">
              {{ t('numbers.configTitle') }}
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model.number="min"
                  type="number"
                  outlined
                  dense
                  :label="t('numbers.minLabel')"
                />
              </div>

              <div class="col-6">
                <q-input
                  v-model.number="max"
                  type="number"
                  outlined
                  dense
                  :label="t('numbers.maxLabel')"
                />
              </div>
            </div>

            <q-input
              v-model.number="quantidade"
              type="number"
              outlined
              dense
              :label="t('numbers.config.quantity')"
              class="q-mt-md"
              :min="2"
              :max="intervalo"
            />

            <q-checkbox
              v-model="permitirRepetidos"
              :label="t('numbers.allowRepeats')"
              class="q-mt-sm"
            />

            <q-checkbox
              v-model="ordenarResultado"
              :label="t('numbers.sortResult')"
              class="q-mt-sm"
            />

            <q-btn
              class="q-mt-md full-width"
              color="primary"
              :label="t('numbers.actions.draw')"
              :disable="!configuracaoValida"
              @click="sortear"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Resultado -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              {{ t('numbers.result.title') }}
            </div>

            <div v-if="resultado.length === 0" class="text-grey-6 text-caption">
              {{ t('numbers.result.none') }}
            </div>

            <div class="row q-col-gutter-sm">
              <div v-for="(numero, index) in sortedResultado" :key="index" class="col-auto">
                <q-chip color="primary" text-color="white" icon="casino">
                  {{ numero }}
                </q-chip>
              </div>
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
