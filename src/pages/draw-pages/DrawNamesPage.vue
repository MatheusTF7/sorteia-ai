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
            <div class="text-subtitle1 text-weight-medium q-mb-sm row items-center">
              {{ t('names.listTitle') }}
              <q-space />
              <q-btn flat dense icon="folder_open" color="primary" @click="loadDialogOpen = true">
                <q-tooltip>{{ t('shared.loadList') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                icon="save"
                color="primary"
                :disable="nomes.length === 0"
                @click="openSaveDialog"
              >
                <q-tooltip>{{ t('shared.saveList') }}</q-tooltip>
              </q-btn>
            </div>

            <q-input
              v-model="novoNome"
              :label="t('names.addName')"
              :hint="t('shared.addNamesHint')"
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

    <!-- Load list dialog -->
    <q-dialog v-model="loadDialogOpen">
      <q-card style="min-width: 360px; max-width: 500px; width: 90vw">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t('shared.loadList') }}</div>
          <q-space />
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div v-if="savedLists.length === 0" class="text-grey-6 text-center q-pa-md">
            {{ t('shared.noSavedLists') }}
          </div>
          <q-list v-else bordered separator class="rounded-borders">
            <q-item
              v-for="list in savedLists"
              :key="list.id"
              clickable
              v-ripple
              @click="loadList(list)"
            >
              <q-item-section>
                <q-item-label>{{ list.name }}</q-item-label>
                <q-item-label caption>
                  {{ t('savedLists.itemCount', { count: list.items.length }) }}
                </q-item-label>
              </q-item-section>
              <q-item-section v-if="list.isDefault" side>
                <q-badge color="amber" :label="t('savedLists.isDefault')" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Save list dialog -->
    <q-dialog v-model="saveDialogOpen">
      <q-card style="min-width: 320px">
        <q-card-section>
          <div class="text-h6">{{ t('shared.saveList') }}</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="saveListName"
            :label="t('shared.listNameLabel')"
            outlined
            dense
            autofocus
            @keyup.enter="saveCurrentList"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat :label="t('shared.cancel')" />
          <q-btn
            color="primary"
            :label="t('shared.save')"
            :disable="!saveListName.trim()"
            @click="saveCurrentList"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useSavedConfigs } from 'src/composables/useSavedConfigs';

interface SavedList {
  [key: string]: string | string[] | boolean;
  id: string;
  name: string;
  items: string[];
  createdAt: string;
  isDefault: boolean;
}

const { t } = useI18n();
const $q = useQuasar();

const novoNome = ref('');
const nomes = ref<string[]>([]);
const quantidade = ref<number>(1);
const resultado = ref<string[]>([]);

// ─── Saved lists integration ──────────────────────────────────────────────────
const { data: savedLists } = useSavedConfigs<SavedList[]>('saved_lists', []);
const loadDialogOpen = ref(false);
const saveDialogOpen = ref(false);
const saveListName = ref('');

onMounted(() => {
  const defaultList = savedLists.value.find((l) => l.isDefault);
  if (defaultList) {
    nomes.value = [...defaultList.items];
  }
});

function loadList(list: SavedList) {
  nomes.value = [...list.items];
  loadDialogOpen.value = false;
  $q.notify({
    message: t('shared.listLoaded', { name: list.name }),
    color: 'positive',
    position: 'bottom',
    timeout: 2000,
  });
}

function openSaveDialog() {
  saveListName.value = '';
  saveDialogOpen.value = true;
}

function saveCurrentList() {
  const name = saveListName.value.trim();
  if (!name) return;

  savedLists.value.push({
    id: crypto.randomUUID(),
    name,
    items: [...nomes.value],
    createdAt: new Date().toISOString(),
    isDefault: false,
  });

  saveDialogOpen.value = false;
  $q.notify({
    message: t('shared.listSaved', { name }),
    color: 'positive',
    position: 'bottom',
    timeout: 2000,
  });
}

// ─── Core logic ───────────────────────────────────────────────────────────────
function adicionarNome() {
  const raw = novoNome.value;
  if (!raw.trim()) return;

  const parsed = raw
    .split(/[,;.]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  nomes.value.push(...parsed);
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
