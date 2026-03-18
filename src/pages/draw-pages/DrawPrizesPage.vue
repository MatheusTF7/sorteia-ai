<template>
  <q-page class="q-pa-lg text-center" style="max-width: 1400px; margin: 0 auto">
    <div class="q-mb-xl">
      <div class="text-h4 text-weight-bold q-mb-md text-gradient" style="letter-spacing: -1px">
        {{ t('prizes.pageTitle') }}
      </div>
      <div class="text-h6 text-weight-regular text-grey-6">
        {{ t('prizes.pageSubtitle') }}
      </div>
    </div>

    <div class="row q-col-gutter-xl text-left">
      <!-- Prizes -->
      <div class="col-12 col-md-4">
        <q-card flat class="card shadow-modern">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md">
              {{ t('prizes.prizesTitle') }}
            </div>

            <q-input
              v-model="newPrize"
              :label="t('prizes.addPrize')"
              outlined
              class="q-mb-md"
              @keyup.enter="addPrize"
            >
              <template #append>
                <q-btn
                  icon="add"
                  round
                  color="primary"
                  class="app-icon-btn q-ml-sm"
                  @click="addPrize"
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
              <div v-if="prizes.length === 0" class="text-grey-6 text-center q-pa-lg">
                {{ t('prizes.noPrizes') }}
              </div>
              <div v-else class="row q-col-gutter-sm">
                <div v-for="(prize, index) in prizes" :key="index" class="col-12">
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
                    <span class="text-weight-medium">{{ prize }}</span>
                    <q-btn
                      icon="close"
                      flat
                      dense
                      rounded
                      color="negative"
                      @click="removePrize(index)"
                    />
                  </q-card>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Participants -->
      <div class="col-12 col-md-4">
        <q-card flat class="card shadow-modern">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md row items-center">
              {{ t('prizes.participantsTitle') }}
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
                :disable="participants.length === 0"
                @click="openSaveDialog"
              >
                <q-tooltip>{{ t('shared.saveList') }}</q-tooltip>
              </q-btn>
            </div>

            <q-toggle
              v-model="useNumberRange"
              :label="t('prizes.useNumberRange')"
              class="text-weight-medium q-mb-md"
              color="primary"
            />

            <template v-if="!useNumberRange">
              <q-input
                v-model="newParticipant"
                :label="t('prizes.addParticipant')"
                :hint="t('shared.addNamesHint')"
                outlined
                class="q-mb-md"
                @keyup.enter="addParticipant"
              >
                <template #append>
                  <q-btn
                    icon="add"
                    round
                    color="primary"
                    class="app-icon-btn q-ml-sm"
                    @click="addParticipant"
                  />
                </template>
              </q-input>

              <div
                class="bg-slate-50 dark-bg-slate-900 br-20 q-pa-sm"
                :class="
                  $q.dark.isActive
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                "
                style="border: 1px solid; min-height: 200px"
              >
                <div v-if="participants.length === 0" class="text-grey-6 text-center q-pa-lg">
                  {{ t('prizes.noParticipants') }}
                </div>
                <div v-else class="row q-col-gutter-sm">
                  <div v-for="(participant, index) in participants" :key="index" class="col-12">
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
                      <span class="text-weight-medium">{{ participant }}</span>
                      <q-btn
                        icon="close"
                        flat
                        dense
                        rounded
                        color="negative"
                        @click="removeParticipant(index)"
                      />
                    </q-card>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input
                    v-model.number="rangeMin"
                    type="number"
                    outlined
                    :label="t('prizes.rangeMin')"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model.number="rangeMax"
                    type="number"
                    outlined
                    :label="t('prizes.rangeMax')"
                  />
                </div>
              </div>
            </template>
          </q-card-section>
        </q-card>
      </div>

      <!-- Configuration & Result -->
      <div class="col-12 col-md-4">
        <q-card flat class="card shadow-modern">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-lg">
              {{ t('prizes.configTitle') }}
            </div>

            <q-input
              v-model.number="drawCount"
              type="number"
              outlined
              class="q-mb-md"
              :label="t('prizes.drawCount')"
              :min="1"
            />

            <q-input
              v-model.number="prizesPerDraw"
              type="number"
              outlined
              class="q-mb-md"
              :label="t('prizes.prizesPerDraw')"
              :min="1"
            />

            <q-toggle
              v-model="singleWinnerPerDraw"
              :label="t('prizes.singleWinnerPerDraw')"
              class="text-weight-medium q-mb-lg"
              color="primary"
            />

            <q-btn
              class="full-width q-py-sm text-weight-bold"
              color="primary"
              unelevated
              :label="t('prizes.actions.runDraw')"
              :disable="!isValidConfiguration"
              @click="runDraw"
            />
          </q-card-section>

          <q-separator class="q-mx-lg" />

          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md">
              {{ t('prizes.result.title') }}
            </div>

            <div
              v-if="results.length === 0"
              class="text-grey-6 text-center q-pa-lg bg-slate-50 br-20"
              :class="
                $q.dark.isActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              "
              style="border: 1px solid"
            >
              {{ t('prizes.result.none') }}
            </div>

            <div v-else class="row q-col-gutter-md">
              <div v-for="(draw, index) in results" :key="index" class="col-12">
                <q-card
                  flat
                  class="team-card q-pa-md br-20"
                  :class="$q.dark.isActive ? 'bg-slate-800' : 'bg-indigo-50'"
                >
                  <div
                    class="text-subtitle1 text-weight-bold q-mb-md text-indigo-8"
                    :class="$q.dark.isActive ? 'text-indigo-3' : 'text-indigo-8'"
                  >
                    <q-icon name="emoji_events" class="q-mr-sm" size="sm" />
                    Sorteio {{ index + 1 }}
                  </div>

                  <div class="column q-gutter-y-sm">
                    <q-chip
                      v-for="(item, idx) in draw"
                      :key="idx"
                      :color="$q.dark.isActive ? 'indigo-9' : 'white'"
                      :text-color="$q.dark.isActive ? 'white' : 'indigo-10'"
                      icon="person"
                      class="text-weight-medium shadow-1 q-px-md q-py-sm q-ma-none"
                      style="border-radius: 12px; font-size: 14px; width: fit-content"
                    >
                      <span class="text-weight-bold q-mr-sm">{{ item.participant }}</span>
                      <q-icon name="arrow_forward" size="14px" class="q-mx-xs text-grey-5" />
                      <span class="q-ml-sm">{{ item.prize }}</span>
                    </q-chip>
                  </div>
                </q-card>
              </div>
            </div>
          </q-card-section>
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

const { t } = useI18n();
const $q = useQuasar();

interface SavedList {
  [key: string]: string | string[] | boolean;
  id: string;
  name: string;
  items: string[];
  createdAt: string;
  isDefault: boolean;
}

interface DrawResult {
  participant: string | number;
  prize: string;
}

const newPrize = ref('');
const prizes = ref<string[]>([]);

const newParticipant = ref('');
const participants = ref<string[]>([]);

const useNumberRange = ref(false);
const rangeMin = ref<number>(1);
const rangeMax = ref<number>(100);

const drawCount = ref<number>(1);
const prizesPerDraw = ref<number>(1);
const singleWinnerPerDraw = ref<boolean>(false);

const results = ref<DrawResult[][]>([]);

// ─── Saved lists integration ──────────────────────────────────────────────────
const { data: savedLists } = useSavedConfigs<SavedList[]>('saved_lists', []);
const loadDialogOpen = ref(false);
const saveDialogOpen = ref(false);
const saveListName = ref('');

onMounted(() => {
  const defaultList = savedLists.value.find((l) => l.isDefault);
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

// ─── Prizes ──────────────────────────────────────────────────────────────────
function addPrize() {
  const value = newPrize.value.trim();
  if (!value) return;
  prizes.value.push(value);
  newPrize.value = '';
}

function removePrize(index: number) {
  prizes.value.splice(index, 1);
}

// ─── Participants ─────────────────────────────────────────────────────────────
function addParticipant() {
  const raw = newParticipant.value;
  if (!raw.trim()) return;

  const parsed = raw
    .split(/[,;.]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  participants.value.push(...parsed);
  newParticipant.value = '';
}

function removeParticipant(index: number) {
  participants.value.splice(index, 1);
}

const participantPool = computed<(string | number)[]>(() => {
  if (!useNumberRange.value) return participants.value;

  const pool: number[] = [];
  for (let i = rangeMin.value; i <= rangeMax.value; i++) {
    pool.push(i);
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
  const availablePrizes = [...prizes.value];
  const pool = [...participantPool.value];

  // Shuffle prizes
  for (let i = availablePrizes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availablePrizes[i], availablePrizes[j]] = [availablePrizes[j]!, availablePrizes[i]!];
  }

  results.value = [];

  for (let d = 0; d < drawCount.value; d++) {
    const drawResult: DrawResult[] = [];

    let selectedParticipant: string | number | null = null;

    if (singleWinnerPerDraw.value) {
      const index = Math.floor(Math.random() * pool.length);
      selectedParticipant = pool[index]!;
    }

    for (let p = 0; p < prizesPerDraw.value; p++) {
      const prize = availablePrizes.shift();
      if (!prize) break;

      const participant = singleWinnerPerDraw.value
        ? selectedParticipant!
        : pool[Math.floor(Math.random() * pool.length)]!;

      drawResult.push({ participant, prize });
    }

    results.value.push(drawResult);
  }
}
</script>

<style scoped>
.card {
  border-radius: 16px;
}

.result-card {
  border-radius: 12px;
}
</style>
