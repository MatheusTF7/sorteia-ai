<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 text-weight-bold q-mb-sm">{{ t('names.pageTitle') }}</div>
    <div class="text-subtitle2 text-grey-7 q-mb-lg">
      {{ t('names.pageSubtitle') }}
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Entrada de nomes -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ t('names.listTitle') }}</div>

            <q-input
              v-model="novoNome"
              :label="t('names.addName')"
              outlined
              dense
              @keyup.enter="adicionarNome"
            >
              <template #append>
                <q-btn icon="add" round dense flat @click="adicionarNome" />
              </template>
            </q-input>

            <q-list bordered separator class="q-mt-md rounded-borders">
              <q-item v-if="nomes.length === 0">
                <q-item-section class="text-grey-6 text-caption">
                  {{ t('names.noNames') }}
                </q-item-section>
              </q-item>

              <q-item v-for="(nome, index) in nomes" :key="index">
                <q-item-section>{{ nome }}</q-item-section>
                <q-item-section side>
                  <q-btn
                    icon="close"
                    flat
                    dense
                    round
                    color="negative"
                    @click="removerNome(index)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Configuração e resultado -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">
              {{ t('names.configTitle') }}
            </div>

            <q-input
              v-model.number="quantidade"
              type="number"
              outlined
              dense
              :label="t('names.config.quantity')"
              :min="1"
              :max="nomes.length"
            />

            <q-btn
              class="q-mt-md full-width"
              color="primary"
              :label="t('names.actions.draw')"
              :disable="nomes.length === 0 || quantidade < 1"
              @click="sortear"
            />
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              {{ t('names.result.title') }}
            </div>

            <div v-if="resultado.length === 0" class="text-grey-6 text-caption">
              {{ t('names.result.none') }}
            </div>

            <q-chip
              v-for="(nome, index) in resultado"
              :key="index"
              color="primary"
              text-color="white"
              icon="emoji_events"
              class="q-mr-sm q-mb-sm"
            >
              {{ nome }}
            </q-chip>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const novoNome = ref('');
const nomes = ref<string[]>([]);
const quantidade = ref<number>(1);
const resultado = ref<string[]>([]);

function adicionarNome() {
  const nome = novoNome.value.trim();
  if (!nome) return;

  nomes.value.push(nome);
  novoNome.value = '';

  if (quantidade.value > nomes.value.length) {
    quantidade.value = nomes.value.length;
  }
}

function removerNome(index: number) {
  nomes.value.splice(index, 1);

  if (quantidade.value > nomes.value.length) {
    quantidade.value = nomes.value.length;
  }
}

function sortear() {
  const copia = [...nomes.value];
  const sorteados: string[] = [];

  const qtd = Math.min(quantidade.value, copia.length);

  for (let i = 0; i < qtd; i++) {
    const index = Math.floor(Math.random() * copia.length);
    if (copia[index]) sorteados.push(copia[index]);
    copia.splice(index, 1);
  }

  resultado.value = sorteados;
}
</script>

<style scoped>
.card {
  border-radius: 16px;
}
</style>
