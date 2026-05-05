<template>
  <q-page class="q-pa-lg text-center" style="max-width: 1200px; margin: 0 auto">
    <div class="q-mb-xl">
      <div class="text-h4 text-weight-bold q-mb-md text-gradient" style="letter-spacing: -1px">
        {{ t('names.pageTitle') }}
      </div>
      <div class="text-h6 text-weight-regular text-grey-6">
        {{ t('names.pageSubtitle') }}
      </div>
    </div>

    <div class="row q-col-gutter-xl text-left">
      <!-- Entrada de nomes -->
      <div class="col-12 col-md-6">
        <q-card flat class="card shadow-modern">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md row items-center">
              {{ t('names.listTitle') }}
              <q-space />
              <q-btn
                flat
                round
                class="app-icon-btn q-mr-sm"
                icon="folder_open"
                color="primary"
                @click="loadDialogOpen = true"
              >
                <q-tooltip>{{ t('shared.loadList') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                class="app-icon-btn"
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
              class="q-mb-md"
              @keyup.enter="adicionarNome"
            >
              <template #append>
                <q-btn
                  icon="add"
                  round
                  color="primary"
                  class="app-icon-btn q-ml-sm"
                  @click="adicionarNome"
                />
              </template>
            </q-input>

            <div
              class="bg-slate-50 dark-bg-slate-900 br-20 q-pa-sm"
              :class="
                $q.dark.isActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              "
              style="border: 1px solid; min-height: 200px"
            >
              <div v-if="nomes.length === 0" class="text-grey-6 text-center q-pa-lg">
                {{ t('names.noNames') }}
              </div>
              <div v-else class="row q-col-gutter-sm">
                <div v-for="(nome, index) in nomes" :key="index" class="col-12">
                  <q-card
                    flat
                    class="bg-white dark-bg-slate-800 row items-center justify-between q-py-sm q-px-md br-20"
                    :class="
                      $q.dark.isActive
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-slate-200'
                    "
                    style="border: 1px solid"
                  >
                    <span class="text-weight-medium">{{ nome }}</span>
                    <q-btn
                      icon="close"
                      flat
                      dense
                      rounded
                      color="negative"
                      @click="removerNome(index)"
                    />
                  </q-card>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Configuração e resultado -->
      <div class="col-12 col-md-6">
        <q-card flat class="card shadow-modern">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-lg">
              {{ t('names.configTitle') }}
            </div>

            <q-input
              v-model.number="quantidade"
              type="number"
              outlined
              class="q-mb-md"
              :label="t('names.config.quantity')"
              :min="1"
              :max="nomes.length"
            />

            <q-toggle
              v-model="skipDrawn"
              :label="t('names.skipDrawn')"
              color="primary"
              class="q-mb-xs"
            />

            <q-toggle
              v-model="stackDrawn"
              :label="t('names.stackDrawn')"
              color="secondary"
              class="q-mb-md"
            />

            <div v-if="skipDrawn && nomes.length > 0" class="q-mb-md">
              <div class="text-caption text-grey-6 q-mb-xs">
                {{ t('names.drawnCount', { count: jasorteados.length, total: nomes.length }) }}
              </div>
              <q-linear-progress
                :value="jasorteados.length / nomes.length"
                color="primary"
                rounded
                size="6px"
              />
              <div
                v-if="jasorteados.length === nomes.length"
                class="text-caption text-warning q-mt-xs"
              >
                {{ t('names.allDrawn') }}
              </div>
            </div>

            <div class="row q-gutter-sm">
              <q-btn
                class="col q-py-sm text-weight-bold"
                color="primary"
                unelevated
                :label="t('names.actions.draw')"
                :disable="
                  nomes.length === 0 ||
                  quantidade < 1 ||
                  (skipDrawn && jasorteados.length === nomes.length)
                "
                @click="sortear"
              />
              <q-btn
                v-if="skipDrawn && jasorteados.length > 0"
                flat
                round
                color="grey-6"
                icon="refresh"
                @click="resetDrawn"
              >
                <q-tooltip>{{ t('names.resetDrawn') }}</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>

          <q-separator class="q-mx-lg" />

          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md">
              {{ t('names.result.title') }}
            </div>

            <div
              v-if="resultado.length === 0"
              class="text-grey-6 text-center q-pa-lg bg-slate-50 br-20"
              :class="
                $q.dark.isActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              "
              style="border: 1px solid"
            >
              {{ t('names.result.none') }}
            </div>

            <div
              v-else
              class="row q-gutter-sm q-pa-md br-20"
              :class="$q.dark.isActive ? 'bg-slate-800' : 'bg-indigo-50'"
              style="border: 1px solid rgba(0, 0, 0, 0.05)"
            >
              <q-chip
                v-for="(nome, index) in resultado"
                :key="index"
                :color="$q.dark.isActive ? 'indigo-9' : 'white'"
                :text-color="$q.dark.isActive ? 'white' : 'indigo-10'"
                icon="emoji_events"
                class="text-weight-medium shadow-1 q-px-md q-py-sm"
                style="border-radius: 12px; font-size: 14px"
              >
                {{ nome }}
              </q-chip>
            </div>
          </q-card-section>

          <template v-if="stackDrawn && historico.length > 0">
            <q-separator class="q-mx-lg" />

            <q-card-section class="q-pa-lg">
              <div class="row items-center q-mb-md">
                <div class="text-h6 text-weight-bold">
                  {{ t('names.history.title') }}
                </div>
                <q-space />
                <q-btn flat round dense icon="delete_outline" color="grey-6" @click="clearHistory">
                  <q-tooltip>{{ t('names.history.clear') }}</q-tooltip>
                </q-btn>
              </div>

              <div class="column q-gutter-sm">
                <div
                  v-for="(rodada, ri) in historicoOrdenado"
                  :key="ri"
                  class="br-20 q-pa-sm"
                  :class="$q.dark.isActive ? 'bg-slate-800' : 'bg-slate-50'"
                  style="border: 1px solid rgba(0, 0, 0, 0.07)"
                >
                  <div class="text-caption text-grey-6 q-mb-xs q-ml-xs">
                    {{ t('names.history.round', { round: historico.length - ri }) }}
                  </div>
                  <div class="row q-gutter-xs">
                    <q-chip
                      v-for="(nome, ni) in rodada"
                      :key="ni"
                      :color="$q.dark.isActive ? 'indigo-9' : 'indigo-1'"
                      :text-color="$q.dark.isActive ? 'white' : 'indigo-10'"
                      dense
                      class="text-weight-medium"
                      style="border-radius: 10px; font-size: 13px"
                    >
                      {{ nome }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </q-card-section>
          </template>
        </q-card>
      </div>
    </div>

    <!-- Load list dialog -->
    <q-dialog v-model="loadDialogOpen">
      <q-card
        class="shadow-modern q-pa-sm"
        style="min-width: 360px; max-width: 500px; width: 90vw; border-radius: 24px"
      >
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ t('shared.loadList') }}</div>
          <q-space />
          <q-btn v-close-popup icon="close" flat round color="grey-6" />
        </q-card-section>
        <q-card-section class="q-mt-sm">
          <div
            v-if="savedLists.length === 0"
            class="text-grey-6 text-center q-pa-xl bg-slate-50 br-20"
          >
            {{ t('shared.noSavedLists') }}
          </div>
          <div v-else class="row q-col-gutter-sm">
            <q-card
              v-for="list in savedLists"
              :key="list.id"
              flat
              class="col-12 cursor-pointer q-mb-sm q-pa-md br-20 row items-center justify-between"
              :class="
                $q.dark.isActive
                  ? 'bg-slate-800 hover-bg-slate-700'
                  : 'bg-slate-50 hover-bg-slate-100'
              "
              @click="loadList(list)"
              style="transition: background 0.2s"
            >
              <div>
                <div class="text-weight-bold text-subtitle1">{{ list.name }}</div>
                <div class="text-grey-6 text-caption">
                  {{ t('savedLists.itemCount', { count: list.items.length }) }}
                </div>
              </div>
              <q-badge
                v-if="list.isDefault"
                color="amber-8"
                :label="t('savedLists.isDefault')"
                rounded
                class="q-px-sm q-py-xs"
              />
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Save list dialog -->
    <q-dialog v-model="saveDialogOpen">
      <q-card class="shadow-modern q-pa-sm" style="min-width: 340px; border-radius: 24px">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-weight-bold">{{ t('shared.saveList') }}</div>
        </q-card-section>
        <q-card-section class="q-mt-sm">
          <q-input
            v-model="saveListName"
            :label="t('shared.listNameLabel')"
            outlined
            autofocus
            @keyup.enter="saveCurrentList"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            v-close-popup
            flat
            :label="t('shared.cancel')"
            color="grey-7"
            class="text-weight-bold q-px-md"
          />
          <q-btn
            color="primary"
            unelevated
            class="text-weight-bold q-px-md"
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
import { ref, computed, onMounted } from 'vue';
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
const skipDrawn = ref(false);
const jasorteados = ref<string[]>([]);
const stackDrawn = ref(false);
const historico = ref<string[][]>([]);

const historicoOrdenado = computed(() => [...historico.value].reverse());

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
  jasorteados.value = [];
  historico.value = [];
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
  jasorteados.value = [];
  historico.value = [];

  if (quantidade.value > nomes.value.length) {
    quantidade.value = nomes.value.length;
  }
}

function sortear() {
  const pool = skipDrawn.value
    ? nomes.value.filter((n) => !jasorteados.value.includes(n))
    : [...nomes.value];

  const sorteados: string[] = [];
  const qtd = Math.min(quantidade.value, pool.length);

  for (let i = 0; i < qtd; i++) {
    const index = Math.floor(Math.random() * pool.length);
    if (pool[index]) sorteados.push(pool[index]);
    pool.splice(index, 1);
  }

  resultado.value = sorteados;

  if (skipDrawn.value) {
    jasorteados.value.push(...sorteados);
  }

  if (stackDrawn.value && sorteados.length > 0) {
    historico.value.push([...sorteados]);
  }
}

function resetDrawn() {
  jasorteados.value = [];
}

function clearHistory() {
  historico.value = [];
}
</script>

<style scoped>
.card {
  border-radius: 16px;
}
</style>
