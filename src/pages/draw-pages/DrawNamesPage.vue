<template>
  <q-page class="page-shell">
    <AppPageHero
      :eyebrow="t('nav.names')"
      :title="t('names.pageTitle')"
      :subtitle="t('names.pageSubtitle')"
      icon="person_search"
      tone="primary"
    >
      <template #meta>
        <div class="metric-pills">
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('names.listTitle') }}</span>
            <strong class="metric-pill__value">{{ nomes.length }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('names.config.quantity') }}</span>
            <strong class="metric-pill__value">{{ quantidade }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('names.result.title') }}</span>
            <strong class="metric-pill__value">{{ resultado.length }}</strong>
          </div>
        </div>
      </template>
    </AppPageHero>

    <div class="page-grid page-grid--two">
      <q-card flat class="panel-card">
        <q-card-section class="panel-card__header">
          <div>
            <div class="panel-card__eyebrow">{{ t('names.listTitle') }}</div>
            <div class="panel-card__title">{{ t('names.listTitle') }}</div>
            <div class="panel-card__description">{{ t('names.listDescription') }}</div>
          </div>

          <div class="inline-tool-actions">
            <q-btn
              flat
              round
              class="app-icon-btn"
              icon="folder_open"
              @click="loadDialogOpen = true"
            >
              <q-tooltip>{{ t('shared.loadList') }}</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              class="app-icon-btn app-icon-btn--brand"
              icon="save"
              :disable="nomes.length === 0"
              @click="openSaveDialog"
            >
              <q-tooltip>{{ t('shared.saveList') }}</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-section class="panel-card__body panel-card__body--spacious">
          <q-input
            v-model="novoNome"
            :label="t('names.addName')"
            outlined
            dense
            class="app-field"
            @keyup.enter="adicionarNome"
          >
            <template #append>
              <q-btn
                flat
                round
                class="app-icon-btn app-icon-btn--brand"
                icon="add"
                @click="adicionarNome"
              />
            </template>
          </q-input>

          <div class="field-hint">{{ t('shared.addNamesHint') }}</div>

          <div v-if="nomes.length === 0" class="empty-state empty-state--compact">
            <q-icon name="group" size="28px" />
            <div>{{ t('names.noNames') }}</div>
          </div>

          <div v-else class="collection-list">
            <div v-for="(nome, index) in nomes" :key="`${nome}-${index}`" class="collection-item">
              <div class="collection-item__body">
                <span class="collection-item__title">{{ nome }}</span>
                <span class="collection-item__meta">#{{ index + 1 }}</span>
              </div>

              <q-btn
                flat
                round
                class="app-icon-btn app-icon-btn--danger"
                icon="close"
                @click="removerNome(index)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="page-stack">
        <q-card flat class="panel-card">
          <q-card-section class="panel-card__header">
            <div>
              <div class="panel-card__eyebrow">{{ t('names.configTitle') }}</div>
              <div class="panel-card__title">{{ t('names.configTitle') }}</div>
              <div class="panel-card__description">{{ t('names.configDescription') }}</div>
            </div>
          </q-card-section>

          <q-card-section class="panel-card__body panel-card__body--spacious">
            <q-input
              v-model.number="quantidade"
              type="number"
              outlined
              dense
              class="app-field"
              :label="t('names.config.quantity')"
              :min="1"
              :max="nomes.length"
            />

            <q-btn
              unelevated
              no-caps
              class="app-btn app-btn--primary full-width"
              :label="t('names.actions.draw')"
              :disable="nomes.length === 0 || quantidade < 1"
              @click="sortear"
            />
          </q-card-section>
        </q-card>

        <q-card flat class="panel-card">
          <q-card-section class="panel-card__header">
            <div>
              <div class="panel-card__eyebrow">{{ t('names.result.title') }}</div>
              <div class="panel-card__title">{{ t('names.result.title') }}</div>
              <div class="panel-card__description">{{ t('names.resultDescription') }}</div>
            </div>
          </q-card-section>

          <q-card-section class="panel-card__body">
            <div v-if="resultado.length === 0" class="empty-state empty-state--compact">
              <q-icon name="emoji_events" size="28px" />
              <div>{{ t('names.result.none') }}</div>
            </div>

            <div v-else class="tag-grid">
              <div v-for="(nome, index) in resultado" :key="`${nome}-${index}`" class="result-pill">
                <q-icon name="emoji_events" size="18px" />
                <span>{{ nome }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="loadDialogOpen">
      <q-card flat class="dialog-card">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">{{ t('shared.loadList') }}</div>
            <div class="dialog-caption">{{ t('shared.loadListDescription') }}</div>
          </div>

          <q-btn v-close-popup flat round class="app-icon-btn" icon="close" />
        </q-card-section>

        <q-card-section class="dialog-body">
          <div v-if="savedLists.length === 0" class="empty-state empty-state--compact">
            <q-icon name="bookmarks" size="28px" />
            <div>{{ t('shared.noSavedLists') }}</div>
          </div>

          <div v-else class="dialog-list">
            <button
              v-for="list in savedLists"
              :key="list.id"
              type="button"
              class="dialog-list__item"
              @click="loadList(list)"
            >
              <div class="dialog-list__body">
                <span class="dialog-list__title">{{ list.name }}</span>
                <span class="dialog-list__meta">
                  {{ t('savedLists.itemCount', { count: list.items.length }) }}
                </span>
              </div>

              <q-badge v-if="list.isDefault" color="warning" text-color="dark">
                {{ t('savedLists.isDefault') }}
              </q-badge>
            </button>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="saveDialogOpen">
      <q-card flat class="dialog-card">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">{{ t('shared.saveList') }}</div>
            <div class="dialog-caption">{{ t('shared.saveListDescription') }}</div>
          </div>

          <q-btn v-close-popup flat round class="app-icon-btn" icon="close" />
        </q-card-section>

        <q-card-section class="dialog-body panel-card__body--spacious">
          <q-input
            v-model="saveListName"
            :label="t('shared.listNameLabel')"
            outlined
            dense
            autofocus
            class="app-field"
            @keyup.enter="saveCurrentList"
          />
        </q-card-section>

        <div class="dialog-actions">
          <q-btn v-close-popup outline no-caps class="app-btn app-btn--secondary">
            {{ t('shared.cancel') }}
          </q-btn>
          <q-btn
            unelevated
            no-caps
            class="app-btn app-btn--primary"
            :disable="!saveListName.trim()"
            @click="saveCurrentList"
          >
            {{ t('shared.save') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import AppPageHero from 'components/AppPageHero.vue';
import { useSavedConfigs } from 'src/composables/useSavedConfigs';
import { parseDelimitedEntries, type SavedList } from 'src/utils/draw';

const { t } = useI18n();
const $q = useQuasar();

const novoNome = ref('');
const nomes = ref<string[]>([]);
const quantidade = ref<number>(1);
const resultado = ref<string[]>([]);

const { data: savedLists } = useSavedConfigs<SavedList[]>('saved_lists', []);
const loadDialogOpen = ref(false);
const saveDialogOpen = ref(false);
const saveListName = ref('');

onMounted(() => {
  const defaultList = savedLists.value.find((list) => list.isDefault);
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

function adicionarNome() {
  const raw = novoNome.value.trim();
  if (!raw) return;

  nomes.value.push(...parseDelimitedEntries(raw));
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
  const total = Math.min(quantidade.value, copia.length);

  for (let index = 0; index < total; index += 1) {
    const selectedIndex = Math.floor(Math.random() * copia.length);
    if (copia[selectedIndex]) {
      sorteados.push(copia[selectedIndex]);
    }
    copia.splice(selectedIndex, 1);
  }

  resultado.value = sorteados;
}
</script>
