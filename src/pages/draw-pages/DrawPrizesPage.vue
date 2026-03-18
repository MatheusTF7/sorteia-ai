<template>
  <q-page class="page-shell">
    <AppPageHero
      :eyebrow="t('nav.prizes')"
      :title="t('prizes.pageTitle')"
      :subtitle="t('prizes.pageSubtitle')"
      icon="workspace_premium"
      tone="warning"
    >
      <template #meta>
        <div class="metric-pills">
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('prizes.prizesTitle') }}</span>
            <strong class="metric-pill__value">{{ prizes.length }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('prizes.participantsTitle') }}</span>
            <strong class="metric-pill__value">{{ participantPool.length }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('prizes.drawCount') }}</span>
            <strong class="metric-pill__value">{{ drawCount }}</strong>
          </div>
        </div>
      </template>
    </AppPageHero>

    <div class="page-grid page-grid--three">
      <q-card flat class="panel-card">
        <q-card-section class="panel-card__header">
          <div>
            <div class="panel-card__eyebrow">{{ t('prizes.prizesTitle') }}</div>
            <div class="panel-card__title">{{ t('prizes.prizesTitle') }}</div>
            <div class="panel-card__description">{{ t('prizes.prizesDescription') }}</div>
          </div>
        </q-card-section>

        <q-card-section class="panel-card__body panel-card__body--spacious">
          <q-input
            v-model="newPrize"
            :label="t('prizes.addPrize')"
            :placeholder="t('prizes.addPrize')"
            outlined
            dense
            class="app-field app-field--action"
            @keyup.enter="addPrize"
          >
            <template #append>
              <q-btn
                flat
                class="app-icon-btn app-icon-btn--brand app-field__action"
                icon="add"
                @click="addPrize"
              />
            </template>
          </q-input>

          <div v-if="prizes.length === 0" class="empty-state empty-state--compact">
            <q-icon name="redeem" size="28px" />
            <div>{{ t('prizes.noPrizes') }}</div>
          </div>

          <div v-else class="collection-list">
            <div
              v-for="(prize, index) in prizes"
              :key="`${prize}-${index}`"
              class="collection-item"
            >
              <div class="collection-item__body">
                <span class="collection-item__title">{{ prize }}</span>
                <span class="collection-item__meta">#{{ index + 1 }}</span>
              </div>

              <q-btn
                flat
                round
                class="app-icon-btn app-icon-btn--danger"
                icon="close"
                @click="removePrize(index)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat class="panel-card">
        <q-card-section class="panel-card__header">
          <div>
            <div class="panel-card__eyebrow">{{ t('prizes.participantsTitle') }}</div>
            <div class="panel-card__title">{{ t('prizes.participantsTitle') }}</div>
            <div class="panel-card__description">{{ t('prizes.participantsDescription') }}</div>
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
              :disable="participants.length === 0 || useNumberRange"
              @click="openSaveDialog"
            >
              <q-tooltip>{{ t('shared.saveList') }}</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-section class="panel-card__body panel-card__body--spacious">
          <div class="segmented-control">
            <button
              type="button"
              :class="[
                'segmented-control__button',
                { 'segmented-control__button--active': !useNumberRange },
              ]"
              @click="useNumberRange = false"
            >
              {{ t('prizes.manualMode') }}
            </button>
            <button
              type="button"
              :class="[
                'segmented-control__button',
                { 'segmented-control__button--active': useNumberRange },
              ]"
              @click="useNumberRange = true"
            >
              {{ t('prizes.numberMode') }}
            </button>
          </div>

          <template v-if="!useNumberRange">
            <q-input
              v-model="newParticipant"
              :label="t('prizes.addParticipant')"
              :placeholder="t('prizes.addParticipant')"
              outlined
              dense
              class="app-field app-field--action"
              @keyup.enter="addParticipant"
            >
              <template #append>
                <q-btn
                  flat
                  class="app-icon-btn app-icon-btn--brand app-field__action"
                  icon="add"
                  @click="addParticipant"
                />
              </template>
            </q-input>

            <div class="field-hint">{{ t('shared.addNamesHint') }}</div>

            <div v-if="participants.length === 0" class="empty-state empty-state--compact">
              <q-icon name="group" size="28px" />
              <div>{{ t('prizes.noParticipants') }}</div>
            </div>

            <div v-else class="collection-list">
              <div
                v-for="(participant, index) in participants"
                :key="`${participant}-${index}`"
                class="collection-item"
              >
                <div class="collection-item__body">
                  <span class="collection-item__title">{{ participant }}</span>
                  <span class="collection-item__meta">#{{ index + 1 }}</span>
                </div>

                <q-btn
                  flat
                  round
                  class="app-icon-btn app-icon-btn--danger"
                  icon="close"
                  @click="removeParticipant(index)"
                />
              </div>
            </div>
          </template>

          <template v-else>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="rangeMin"
                  type="number"
                  outlined
                  dense
                  class="app-field"
                  :label="t('prizes.rangeMin')"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="rangeMax"
                  type="number"
                  outlined
                  dense
                  class="app-field"
                  :label="t('prizes.rangeMax')"
                />
              </div>
            </div>

            <div class="section-note">
              {{ t('prizes.useNumberRange') }}
            </div>
          </template>
        </q-card-section>
      </q-card>

      <q-card flat class="panel-card">
        <q-card-section class="panel-card__header">
          <div>
            <div class="panel-card__eyebrow">{{ t('prizes.configTitle') }}</div>
            <div class="panel-card__title">{{ t('prizes.configTitle') }}</div>
            <div class="panel-card__description">{{ t('prizes.configDescription') }}</div>
          </div>
        </q-card-section>

        <q-card-section class="panel-card__body panel-card__body--spacious">
          <q-input
            v-model.number="drawCount"
            type="number"
            outlined
            dense
            class="app-field"
            :label="t('prizes.drawCount')"
            :min="1"
          />

          <q-input
            v-model.number="prizesPerDraw"
            type="number"
            outlined
            dense
            class="app-field"
            :label="t('prizes.prizesPerDraw')"
            :min="1"
          />

          <q-toggle v-model="singleWinnerPerDraw" :label="t('prizes.singleWinnerPerDraw')" />

          <q-btn
            unelevated
            no-caps
            class="app-btn app-btn--primary full-width"
            :label="t('prizes.actions.runDraw')"
            :disable="!isValidConfiguration"
            @click="runDraw"
          />

          <div class="panel-divider" />

          <div>
            <div class="panel-card__title">{{ t('prizes.result.title') }}</div>
            <div class="panel-card__description">{{ t('prizes.resultDescription') }}</div>
          </div>

          <div v-if="results.length === 0" class="empty-state empty-state--compact">
            <q-icon name="emoji_events" size="28px" />
            <div>{{ t('prizes.result.none') }}</div>
          </div>

          <div v-else class="page-stack">
            <div v-for="(draw, index) in results" :key="index" class="result-card">
              <div class="team-board__header">
                <div>
                  <div class="team-board__title">{{ t('shared.drawLabel') }} {{ index + 1 }}</div>
                  <div class="team-board__meta">
                    {{ t('shared.itemsCount', { count: draw.length }) }}
                  </div>
                </div>
              </div>

              <div class="saved-list-card__tags q-mt-md">
                <div
                  v-for="(item, itemIndex) in draw"
                  :key="`${item.prize}-${itemIndex}`"
                  class="result-pill"
                >
                  <q-icon name="workspace_premium" size="18px" />
                  <span>{{ item.participant }} -> {{ item.prize }}</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
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
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import AppPageHero from 'components/AppPageHero.vue';
import { useSavedConfigs } from 'src/composables/useSavedConfigs';
import { parseDelimitedEntries, shuffleItems, type SavedList } from 'src/utils/draw';

interface DrawResult {
  participant: string | number;
  prize: string;
}

const { t } = useI18n();
const $q = useQuasar();

const newPrize = ref('');
const prizes = ref<string[]>([]);

const newParticipant = ref('');
const participants = ref<string[]>([]);

const useNumberRange = ref(false);
const rangeMin = ref<number>(1);
const rangeMax = ref<number>(100);

const drawCount = ref<number>(1);
const prizesPerDraw = ref<number>(1);
const singleWinnerPerDraw = ref(false);
const results = ref<DrawResult[][]>([]);

const { data: savedLists } = useSavedConfigs<SavedList[]>('saved_lists', []);
const loadDialogOpen = ref(false);
const saveDialogOpen = ref(false);
const saveListName = ref('');

onMounted(() => {
  const defaultList = savedLists.value.find((list) => list.isDefault);
  if (defaultList) {
    participants.value = [...defaultList.items];
    useNumberRange.value = false;
  }
});

function loadList(list: SavedList) {
  participants.value = [...list.items];
  useNumberRange.value = false;
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
    items: [...participants.value],
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

function addPrize() {
  const value = newPrize.value.trim();
  if (!value) return;

  prizes.value.push(value);
  newPrize.value = '';
}

function removePrize(index: number) {
  prizes.value.splice(index, 1);
}

function addParticipant() {
  const raw = newParticipant.value.trim();
  if (!raw) return;

  participants.value.push(...parseDelimitedEntries(raw));
  newParticipant.value = '';
}

function removeParticipant(index: number) {
  participants.value.splice(index, 1);
}

const participantPool = computed<(string | number)[]>(() => {
  if (!useNumberRange.value) return participants.value;

  const pool: number[] = [];
  for (let number = rangeMin.value; number <= rangeMax.value; number += 1) {
    pool.push(number);
  }

  return pool;
});

const isValidConfiguration = computed(() => {
  if (prizes.value.length === 0) return false;
  if (participantPool.value.length === 0) return false;
  if (drawCount.value < 1 || prizesPerDraw.value < 1) return false;
  return prizesPerDraw.value * drawCount.value <= prizes.value.length;
});

function runDraw() {
  const availablePrizes = shuffleItems(prizes.value);
  const pool = [...participantPool.value];

  results.value = [];

  for (let drawIndex = 0; drawIndex < drawCount.value; drawIndex += 1) {
    const drawResult: DrawResult[] = [];
    let selectedParticipant: string | number | null = null;

    if (singleWinnerPerDraw.value) {
      selectedParticipant = pool[Math.floor(Math.random() * pool.length)] ?? null;
    }

    for (let prizeIndex = 0; prizeIndex < prizesPerDraw.value; prizeIndex += 1) {
      const prize = availablePrizes.shift();
      if (!prize) break;

      const participant = singleWinnerPerDraw.value
        ? selectedParticipant
        : (pool[Math.floor(Math.random() * pool.length)] ?? null);

      if (participant === null) break;
      drawResult.push({ participant, prize });
    }

    results.value.push(drawResult);
  }
}
</script>
