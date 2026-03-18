<template>
  <q-page class="q-pa-lg text-center" style="max-width: 1200px; margin: 0 auto">
    <div class="q-mb-xl">
      <div class="text-h4 text-weight-bold q-mb-md text-gradient" style="letter-spacing: -1px">
        {{ t('teams.pageTitle') }}
      </div>
      <div class="text-h6 text-weight-regular text-grey-6">
        {{ t('teams.pageSubtitle') }}
      </div>
    </div>

    <div class="row q-col-gutter-xl text-left">
      <!-- Participants -->
      <div class="col-12 col-md-6">
        <q-card flat class="card shadow-modern">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md row items-center">
              {{ t('teams.participants') }}
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
                icon="save"
                color="primary"
                class="app-icon-btn"
                :disable="participants.length === 0"
                @click="openSaveDialog"
              >
                <q-tooltip>{{ t('shared.saveList') }}</q-tooltip>
              </q-btn>
            </div>

            <q-input
              v-model="newParticipant"
              :label="t('teams.addParticipant')"
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
                  class="q-ml-sm app-icon-btn"
                  @click="addParticipant"
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
              <div v-if="participants.length === 0" class="text-grey-6 text-center q-pa-lg">
                {{ t('teams.noParticipants') }}
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
          </q-card-section>
        </q-card>
      </div>

      <!-- Configuration and result -->
      <div class="col-12 col-md-6">
        <q-card flat class="card shadow-modern">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-lg">Configuração</div>

            <q-input
              v-model.number="teamSize"
              type="number"
              outlined
              class="q-mb-md"
              :label="t('teams.config.teamSize')"
              :min="1"
            >
              <template #prepend>
                <q-icon name="groups" />
              </template>
            </q-input>

            <q-toggle
              v-model="defineStarter"
              :label="t('teams.config.defineStarter')"
              class="text-weight-medium q-mb-lg"
              color="primary"
            />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-btn
                  class="full-width q-py-sm text-weight-bold"
                  color="primary"
                  unelevated
                  :label="t('teams.actions.generateTeams')"
                  :disable="!isValidConfiguration"
                  @click="generateTeams"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-btn
                  class="full-width q-py-sm text-weight-bold"
                  color="amber-8"
                  unelevated
                  :label="t('teams.actions.pickStarter')"
                  icon="star"
                  :disable="!defineStarter || teams.length === 0 || starterCandidates.length === 0"
                  @click="pickStarter()"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator class="q-mx-lg" />

          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md">
              {{ t('teams.result.title') }}
            </div>

            <div
              v-if="teams.length === 0"
              class="text-grey-6 text-center q-pa-lg bg-slate-50 br-20"
              :class="
                $q.dark.isActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              "
              style="border: 1px solid"
            >
              {{ t('teams.result.none') }}
            </div>

            <div v-else class="row q-col-gutter-md">
              <div v-for="(team, index) in teams" :key="index" class="col-12">
                <q-card
                  flat
                  class="team-card q-pa-md br-20"
                  :class="$q.dark.isActive ? 'bg-slate-800' : 'bg-indigo-50'"
                >
                  <div
                    class="text-subtitle1 text-weight-bold q-mb-md text-indigo-8"
                    :class="$q.dark.isActive ? 'text-indigo-3' : 'text-indigo-8'"
                  >
                    <q-icon name="flag" class="q-mr-sm" size="sm" />
                    Time {{ index + 1 }}
                  </div>

                  <div class="row q-gutter-sm">
                    <q-chip
                      v-for="(member, idx) in team"
                      :key="idx"
                      :color="$q.dark.isActive ? 'indigo-9' : 'white'"
                      :text-color="$q.dark.isActive ? 'white' : 'indigo-10'"
                      class="text-weight-medium shadow-1 q-px-md q-py-sm"
                      style="border-radius: 12px; font-size: 14px"
                    >
                      {{ member }}
                      <q-icon
                        v-if="starter === member"
                        name="star"
                        color="amber-6"
                        size="20px"
                        class="q-ml-sm"
                      />
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
              class="col-12 cursor-pointer q-mb-md q-pa-md br-20 row items-center justify-between"
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

const newParticipant = ref<string>('');
const participants = ref<string[]>([]);
const teamSize = ref<number>(2);
const teams = ref<string[][]>([]);
const defineStarter = ref(true);
const starter = ref<string | null>(null);

// ─── Saved lists integration ──────────────────────────────────────────────────
const { data: savedLists } = useSavedConfigs<SavedList[]>('saved_lists', []);
const loadDialogOpen = ref(false);
const saveDialogOpen = ref(false);
const saveListName = ref('');

onMounted(() => {
  const defaultList = savedLists.value.find((l) => l.isDefault);
  if (defaultList) {
    participants.value = [...defaultList.items];
  }
});

function loadList(list: SavedList) {
  participants.value = [...list.items];
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

// ─── Dynamic team count ───────────────────────────────────────────────────────
const teamCount = computed(() => {
  if (!teamSize.value || teamSize.value < 1) return 0;
  return Math.ceil(participants.value.length / teamSize.value);
});

// ─── Starter logic ───────────────────────────────────────────────────────────
function computeStarterCandidates(fromTeams: string[][]) {
  const candidates: string[] = [];
  if (!fromTeams || fromTeams.length === 0) return candidates;

  fromTeams.forEach((team) => {
    if (team.length === teamSize.value) {
      candidates.push(...team);
    }
  });

  if (candidates.length === 0) {
    const maxSize = Math.max(...fromTeams.map((t) => t.length));
    fromTeams.forEach((team) => {
      if (team.length === maxSize) {
        candidates.push(...team);
      }
    });
  }

  return candidates;
}

const starterCandidates = computed(() => computeStarterCandidates(teams.value));

function pickStarter(fromTeams?: string[][]) {
  if (!defineStarter.value) {
    starter.value = null;
    return;
  }

  const pool = fromTeams ? computeStarterCandidates(fromTeams) : starterCandidates.value;
  if (!pool || pool.length === 0) {
    starter.value = null;
    return;
  }

  const idx = Math.floor(Math.random() * pool.length);
  starter.value = pool[idx]!;
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

const isValidConfiguration = computed(() => {
  if (participants.value.length < 2) return false;
  if (!teamSize.value || teamSize.value < 1) return false;
  return true;
});

function generateTeams() {
  const count = teamCount.value;
  if (count < 1) return;

  const shuffled = [...participants.value];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  const result: string[][] = Array.from({ length: count }, () => []);
  let teamIndex = 0;

  shuffled.forEach((participant) => {
    if (result[teamIndex]!.length >= teamSize.value) {
      teamIndex++;
    }
    result[teamIndex]!.push(participant);
  });

  teams.value = result;
  pickStarter(result);
}
</script>

<style scoped>
.card {
  border-radius: 16px;
}

.team-card {
  border-radius: 12px;
}
</style>
