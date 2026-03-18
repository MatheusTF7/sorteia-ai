<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 text-weight-bold q-mb-sm">{{ t('teams.pageTitle') }}</div>
    <div class="text-subtitle2 text-grey-7 q-mb-lg">
      {{ t('teams.pageSubtitle') }}
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Participants -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm row items-center">
              {{ t('teams.participants') }}
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

            <q-input
              v-model="newParticipant"
              :label="t('teams.addParticipant')"
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
                  {{ t('teams.noParticipants') }}
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
          </q-card-section>
        </q-card>
      </div>

      <!-- Configuration and result -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">Configuração</div>

            <q-input
              v-model.number="teamSize"
              type="number"
              outlined
              dense
              :label="t('teams.config.teamSize')"
              :min="1"
            />

            <q-toggle
              v-model="defineStarter"
              :label="t('teams.config.defineStarter')"
              dense
              class="q-mt-sm"
            />

            <q-btn
              class="q-mt-md full-width"
              color="primary"
              :label="t('teams.actions.generateTeams')"
              :disable="!isValidConfiguration"
              @click="generateTeams"
            />
            <q-btn
              class="q-mt-sm full-width"
              color="amber"
              :label="t('teams.actions.pickStarter')"
              icon="star"
              :disable="!defineStarter || teams.length === 0 || starterCandidates.length === 0"
              @click="pickStarter()"
            />
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              {{ t('teams.result.title') }}
            </div>
            <div v-if="teams.length === 0" class="text-grey-6 text-caption">
              {{ t('teams.result.none') }}
            </div>

            <div v-for="(team, index) in teams" :key="index" class="q-mb-md">
              <q-card flat bordered class="team-card">
                <q-card-section>
                  <div class="text-subtitle2 text-weight-bold q-mb-sm">Time {{ index + 1 }}</div>

                  <q-chip
                    v-for="(member, idx) in team"
                    :key="idx"
                    color="primary"
                    text-color="white"
                    icon="person"
                    class="q-mr-sm q-mb-sm"
                  >
                    {{ member }}
                    <q-icon v-if="starter === member" name="star" color="amber" class="q-ml-sm" />
                  </q-chip>
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
