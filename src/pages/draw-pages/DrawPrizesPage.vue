<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 text-weight-bold q-mb-sm">{{ t('prizes.pageTitle') }}</div>
    <div class="text-subtitle2 text-grey-7 q-mb-lg">
      {{ t('prizes.pageSubtitle') }}
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Prizes -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              {{ t('prizes.prizesTitle') }}
            </div>

            <q-input
              v-model="newPrize"
              :label="t('prizes.addPrize')"
              outlined
              dense
              @keyup.enter="addPrize"
            >
              <template #append>
                <q-btn icon="add" round dense flat @click="addPrize" />
              </template>
            </q-input>

            <q-list bordered separator class="q-mt-md rounded-borders">
              <q-item v-if="prizes.length === 0">
                <q-item-section class="text-grey-6 text-caption">
                  {{ t('prizes.noPrizes') }}
                </q-item-section>
              </q-item>

              <q-item v-for="(prize, index) in prizes" :key="index">
                <q-item-section>{{ prize }}</q-item-section>
                <q-item-section side>
                  <q-btn
                    icon="close"
                    flat
                    dense
                    round
                    color="negative"
                    @click="removePrize(index)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Participants -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm row items-center">
              {{ t('prizes.participantsTitle') }}
              <q-space />
              <q-btn flat dense icon="folder_open" color="primary" @click="loadDialogOpen = true">
                <q-tooltip>{{ t('shared.loadList') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
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
              class="q-mb-sm"
            />

            <template v-if="!useNumberRange">
              <q-input
                v-model="newParticipant"
                :label="t('prizes.addParticipant')"
                :hint="t('shared.addNamesHint')"
                outlined
                dense
                @keyup.enter="addParticipant"
              >
                <template #append>
                  <q-btn icon="add" round dense flat @click="addParticipant" />
                </template>
              </q-input>

              <q-list bordered separator class="q-mt-md rounded-borders">
                <q-item v-if="participants.length === 0">
                  <q-item-section class="text-grey-6 text-caption">
                    {{ t('prizes.noParticipants') }}
                  </q-item-section>
                </q-item>

                <q-item v-for="(participant, index) in participants" :key="index">
                  <q-item-section>{{ participant }}</q-item-section>
                  <q-item-section side>
                    <q-btn
                      icon="close"
                      flat
                      dense
                      round
                      color="negative"
                      @click="removeParticipant(index)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </template>

            <template v-else>
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input
                    v-model.number="rangeMin"
                    type="number"
                    outlined
                    dense
                    :label="t('prizes.rangeMin')"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model.number="rangeMax"
                    type="number"
                    outlined
                    dense
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
        <q-card flat bordered class="card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">
              {{ t('prizes.configTitle') }}
            </div>

            <q-input
              v-model.number="drawCount"
              type="number"
              outlined
              dense
              :label="t('prizes.drawCount')"
              :min="1"
            />

            <q-input
              v-model.number="prizesPerDraw"
              type="number"
              outlined
              dense
              :label="t('prizes.prizesPerDraw')"
              class="q-mt-sm"
              :min="1"
            />

            <q-toggle
              v-model="singleWinnerPerDraw"
              :label="t('prizes.singleWinnerPerDraw')"
              class="q-mt-sm"
            />

            <q-btn
              class="q-mt-md full-width"
              color="primary"
              :label="t('prizes.actions.runDraw')"
              :disable="!isValidConfiguration"
              @click="runDraw"
            />
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              {{ t('prizes.result.title') }}
            </div>
            <div v-if="results.length === 0" class="text-grey-6 text-caption">
              {{ t('prizes.result.none') }}
            </div>

            <div v-for="(draw, index) in results" :key="index" class="q-mb-md">
              <q-card flat bordered class="result-card">
                <q-card-section>
                  <div class="text-subtitle2 text-weight-bold q-mb-sm">Sorteio {{ index + 1 }}</div>

                  <div v-for="(item, idx) in draw" :key="idx" class="q-mb-xs">
                    <q-chip color="primary" text-color="white" icon="emoji_events">
                      {{ item.participant }} → {{ item.prize }}
                    </q-chip>
                  </div>
                </q-card-section>
              </q-card>
            </div>
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
