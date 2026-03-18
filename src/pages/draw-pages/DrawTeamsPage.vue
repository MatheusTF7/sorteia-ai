<template>
  <q-page class="page-shell">
    <AppPageHero
      :eyebrow="t('nav.teams')"
      :title="t('teams.pageTitle')"
      :subtitle="t('teams.pageSubtitle')"
      icon="groups_2"
      tone="success"
    >
      <template #meta>
        <div class="metric-pills">
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('teams.participants') }}</span>
            <strong class="metric-pill__value">{{ participants.length }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('teams.estimatedTeams') }}</span>
            <strong class="metric-pill__value">{{ teamCount }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('teams.starterLabel') }}</span>
            <strong class="metric-pill__value">
              {{ starter ? t('teams.starterReady') : '--' }}
            </strong>
          </div>
        </div>
      </template>
    </AppPageHero>

    <div class="page-grid page-grid--two">
      <q-card flat class="panel-card">
        <q-card-section class="panel-card__header">
          <div>
            <div class="panel-card__eyebrow">{{ t('teams.participants') }}</div>
            <div class="panel-card__title">{{ t('teams.participants') }}</div>
            <div class="panel-card__description">{{ t('shared.addNamesHint') }}</div>
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
              :disable="participants.length === 0"
              @click="openSaveDialog"
            >
              <q-tooltip>{{ t('shared.saveList') }}</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-section class="panel-card__body panel-card__body--spacious">
          <q-input
            v-model="newParticipant"
            :label="t('teams.addParticipant')"
            outlined
            dense
            class="app-field"
            @keyup.enter="addParticipant"
          >
            <template #append>
              <q-btn
                flat
                round
                class="app-icon-btn app-icon-btn--brand"
                icon="add"
                @click="addParticipant"
              />
            </template>
          </q-input>

          <div class="field-hint">{{ t('shared.addNamesHint') }}</div>

          <div v-if="participants.length === 0" class="empty-state empty-state--compact">
            <q-icon name="groups" size="28px" />
            <div>{{ t('teams.noParticipants') }}</div>
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
        </q-card-section>
      </q-card>

      <div class="page-stack">
        <q-card flat class="panel-card">
          <q-card-section class="panel-card__header">
            <div>
              <div class="panel-card__eyebrow">{{ t('teams.configTitle') }}</div>
              <div class="panel-card__title">{{ t('teams.configTitle') }}</div>
              <div class="panel-card__description">{{ t('teams.configDescription') }}</div>
            </div>
          </q-card-section>

          <q-card-section class="panel-card__body panel-card__body--spacious">
            <q-input
              v-model.number="teamSize"
              type="number"
              outlined
              dense
              class="app-field"
              :label="t('teams.config.teamSize')"
              :min="1"
            />

            <q-toggle v-model="defineStarter" :label="t('teams.config.defineStarter')" />

            <div class="action-group">
              <q-btn
                unelevated
                no-caps
                class="app-btn app-btn--primary col-grow"
                :label="t('teams.actions.generateTeams')"
                :disable="!isValidConfiguration"
                @click="generateTeams"
              />

              <q-btn
                unelevated
                no-caps
                class="app-btn app-btn--accent col-grow"
                icon="star"
                :label="t('teams.actions.pickStarter')"
                :disable="!defineStarter || teams.length === 0 || starterCandidates.length === 0"
                @click="pickStarter()"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="panel-card">
          <q-card-section class="panel-card__header">
            <div>
              <div class="panel-card__eyebrow">{{ t('teams.result.title') }}</div>
              <div class="panel-card__title">{{ t('teams.result.title') }}</div>
              <div class="panel-card__description">{{ t('teams.resultDescription') }}</div>
            </div>
          </q-card-section>

          <q-card-section class="panel-card__body">
            <div v-if="teams.length === 0" class="empty-state empty-state--compact">
              <q-icon name="shield" size="28px" />
              <div>{{ t('teams.result.none') }}</div>
            </div>

            <div v-else class="team-grid">
              <div v-for="(team, index) in teams" :key="index" class="team-board">
                <div class="team-board__header">
                  <div>
                    <div class="team-board__title">{{ t('teams.teamLabel') }} {{ index + 1 }}</div>
                    <div class="team-board__meta">
                      {{ team.length }} {{ t('teams.participants').toLowerCase() }}
                    </div>
                  </div>

                  <q-badge
                    v-if="starter && team.includes(starter)"
                    color="warning"
                    text-color="dark"
                  >
                    {{ t('teams.starterLabel') }}
                  </q-badge>
                </div>

                <div class="saved-list-card__tags q-mt-md">
                  <div
                    v-for="(member, memberIndex) in team"
                    :key="`${member}-${memberIndex}`"
                    :class="['member-pill', { 'member-pill--starter': starter === member }]"
                  >
                    <q-icon :name="starter === member ? 'star' : 'person'" size="18px" />
                    <span>{{ member }}</span>
                  </div>
                </div>
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
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import AppPageHero from 'components/AppPageHero.vue';
import { useSavedConfigs } from 'src/composables/useSavedConfigs';
import { parseDelimitedEntries, shuffleItems, type SavedList } from 'src/utils/draw';

const { t } = useI18n();
const $q = useQuasar();

const newParticipant = ref('');
const participants = ref<string[]>([]);
const teamSize = ref<number>(2);
const teams = ref<string[][]>([]);
const defineStarter = ref(true);
const starter = ref<string | null>(null);

const { data: savedLists } = useSavedConfigs<SavedList[]>('saved_lists', []);
const loadDialogOpen = ref(false);
const saveDialogOpen = ref(false);
const saveListName = ref('');

onMounted(() => {
  const defaultList = savedLists.value.find((list) => list.isDefault);
  if (defaultList) {
    participants.value = [...defaultList.items];
  }
});

watch(defineStarter, (enabled) => {
  if (!enabled) {
    starter.value = null;
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

const teamCount = computed(() => {
  if (!teamSize.value || teamSize.value < 1) return 0;
  return Math.ceil(participants.value.length / teamSize.value);
});

function computeStarterCandidates(sourceTeams: string[][]) {
  const candidates: string[] = [];
  if (!sourceTeams.length) return candidates;

  sourceTeams.forEach((team) => {
    if (team.length === teamSize.value) {
      candidates.push(...team);
    }
  });

  if (!candidates.length) {
    const maxSize = Math.max(...sourceTeams.map((team) => team.length));
    sourceTeams.forEach((team) => {
      if (team.length === maxSize) {
        candidates.push(...team);
      }
    });
  }

  return candidates;
}

const starterCandidates = computed(() => computeStarterCandidates(teams.value));

function pickStarter(sourceTeams?: string[][]) {
  if (!defineStarter.value) {
    starter.value = null;
    return;
  }

  const pool = sourceTeams ? computeStarterCandidates(sourceTeams) : starterCandidates.value;
  if (!pool.length) {
    starter.value = null;
    return;
  }

  starter.value = pool[Math.floor(Math.random() * pool.length)]!;
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

const isValidConfiguration = computed(() => {
  if (participants.value.length < 2) return false;
  if (!teamSize.value || teamSize.value < 1) return false;
  return true;
});

function generateTeams() {
  const count = teamCount.value;
  if (count < 1) return;

  const shuffled = shuffleItems(participants.value);
  const generatedTeams: string[][] = Array.from({ length: count }, () => []);
  let currentTeamIndex = 0;

  shuffled.forEach((participant) => {
    if (generatedTeams[currentTeamIndex]!.length >= teamSize.value) {
      currentTeamIndex += 1;
    }
    generatedTeams[currentTeamIndex]!.push(participant);
  });

  teams.value = generatedTeams;
  pickStarter(generatedTeams);
}
</script>
