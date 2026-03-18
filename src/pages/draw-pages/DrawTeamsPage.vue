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
            <div class="text-subtitle1 text-weight-medium q-mb-sm row">
              {{ t('teams.participants') }} <q-space />
              <q-btn
                color="primary"
                icon="engineering"
                :label="t('teams.preconfig')"
                @click="myAutoConfig"
              >
                <q-tooltip>
                  Uma pré configuração criada pelo autor com os <br />
                  participantes e configurações já definidas.
                </q-tooltip>
              </q-btn>
            </div>

            <q-input
              v-model="newParticipant"
              :label="t('teams.addParticipant')"
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
              v-model.number="teamCount"
              type="number"
              outlined
              dense
              :label="t('teams.config.teamCount')"
              :min="2"
              :max="participants.length"
            />

            <q-input
              v-model.number="teamSize"
              type="number"
              outlined
              dense
              :label="t('teams.config.teamSize')"
              class="q-mt-sm"
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const newParticipant = ref<string>('');
const participants = ref<string[]>([]);
const teamCount = ref<number>(1);
const teamSize = ref<number | null>(null);
const teams = ref<string[][]>([]);
const defineStarter = ref(false);
const starter = ref<string | null>(null);

// Compute eligible candidates based on current teams and configuration
function computeStarterCandidates(fromTeams: string[][]) {
  const candidates: string[] = [];

  if (!fromTeams || fromTeams.length === 0) return candidates;

  if (teamSize.value) {
    // Only members in teams that reached the configured teamSize are eligible
    fromTeams.forEach((team) => {
      if (team.length === teamSize.value) {
        candidates.push(...team);
      }
    });
  } else {
    // When no teamSize provided, only members of the largest teams are eligible
    const maxSize = Math.max(...fromTeams.map((t) => t.length));
    fromTeams.forEach((team) => {
      if (team.length === maxSize) {
        candidates.push(...team);
      }
    });
  }

  return candidates;
}

// Reactive computed list of current eligible candidates
const starterCandidates = computed(() => computeStarterCandidates(teams.value));

// Pick a starter from provided teams or from current state
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

function addParticipant() {
  const name = newParticipant.value.trim();
  if (!name) return;

  participants.value.push(name);
  newParticipant.value = '';

  if (teamCount.value > participants.value.length) {
    teamCount.value = participants.value.length;
  }
}

function removeParticipant(index: number) {
  participants.value.splice(index, 1);

  if (teamCount.value > participants.value.length) {
    teamCount.value = participants.value.length;
  }
}

const isValidConfiguration = computed(() => {
  if (participants.value.length < 2) return false;
  if (teamCount.value < 2) return false;

  if (teamSize.value) {
    return teamSize.value * teamCount.value >= participants.value.length;
  }

  return teamCount.value <= participants.value.length;
});

function generateTeams() {
  const shuffled = [...participants.value];

  // Shuffle participants
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  const result: string[][] = Array.from({ length: teamCount.value }, () => []);

  if (teamSize.value) {
    let teamIndex = 0;

    shuffled.forEach((participant) => {
      while (result[teamIndex]!.length >= teamSize.value!) {
        teamIndex = (teamIndex + 1) % teamCount.value;
      }
      result[teamIndex]!.push(participant);
    });
  } else {
    shuffled.forEach((participant, index) => {
      result[index % teamCount.value]!.push(participant);
    });
  }

  teams.value = result;
  // Automatically pick starter if option enabled
  pickStarter(result);
}
function myAutoConfig() {
  participants.value = [
    'Matheus',
    'Pedro Henrique',
    'Caio',
    'Rafael',
    'Anderson',
    'Jefferson',
    'Marcellus',
  ];
  teamSize.value = 2;
  teamCount.value = Math.ceil(participants.value.length / teamSize.value);
  defineStarter.value = true;
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
