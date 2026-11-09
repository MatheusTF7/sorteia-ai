<template>
  <q-page class="racha-page">
    <div class="racha-container">
      <header class="racha-header">
        <div class="hero-copy">
          <div class="eyebrow">
            <q-icon name="sports_soccer" size="18px" /> {{ t('racha.eyebrow') }}
          </div>
          <h1>{{ t('racha.title') }}</h1>
          <p>{{ t('racha.description') }}</p>
          <q-btn outline icon="add" :label="t('racha.newMatch')" @click="confirmReset" />
        </div>
        <div class="pitch" aria-hidden="true">
          <div class="pitch-circle" />
          <div class="pitch-box pitch-box--left" />
          <div class="pitch-box pitch-box--right" />
          <q-icon name="sports_soccer" size="38px" />
        </div>
      </header>

      <div class="save-status" :class="{ 'text-negative': storageError }" role="status">
        <q-icon :name="storageError ? 'error_outline' : 'check_circle_outline'" size="16px" />
        {{ t(storageError ? 'racha.storageError' : 'racha.localSave') }}
      </div>

      <section class="stats-grid" :aria-label="t('racha.matchDetails')">
        <div class="stat">
          <q-icon name="groups" />
          <div>
            <strong>{{ state.players.length }}</strong
            ><span>{{ t('racha.players') }}</span>
          </div>
        </div>
        <div class="stat">
          <q-icon name="sports_handball" />
          <div>
            <strong>{{ goalkeepers.length }}</strong
            ><span>{{ t('racha.goalkeepers') }}</span>
          </div>
        </div>
        <div class="stat">
          <q-icon name="military_tech" />
          <div>
            <strong>{{ seeds.length }}</strong
            ><span>{{ t('racha.seeds') }}</span>
          </div>
        </div>
        <div class="stat stat--paid">
          <q-icon name="task_alt" />
          <div>
            <strong
              >{{ paid.length }}<small> / {{ state.players.length }}</small></strong
            ><span>{{ t('racha.payments') }}</span>
          </div>
        </div>
      </section>

      <q-card flat class="match-details q-mb-lg">
        <q-expansion-item
          v-model="state.ui.detailsOpen"
          icon="event_note"
          :label="state.title || t('racha.matchDetails')"
          :caption="t('racha.matchDetailsHint')"
          header-class="details-heading"
        >
          <q-card-section class="details-grid">
            <q-input
              v-model="state.title"
              outlined
              dense
              :label="t('racha.matchName')"
              :placeholder="t('racha.matchNamePlaceholder')"
            />
            <q-input v-model="state.location" outlined dense :label="t('racha.location')" />
            <q-input
              v-model="state.date"
              outlined
              dense
              type="datetime-local"
              stack-label
              :label="t('racha.date')"
            />
            <q-input
              v-model.number="state.fee"
              outlined
              dense
              type="number"
              min="0"
              step="0.01"
              :label="t('racha.fee')"
              :rules="[validFee]"
              lazy-rules
            />
          </q-card-section>
        </q-expansion-item>
      </q-card>

      <div class="organizer-grid">
        <section :aria-labelledby="'roster-title'" class="roster-section">
          <q-card flat class="roster-card">
            <q-card-section class="section-heading">
              <div>
                <h2 id="roster-title">{{ t('racha.roster') }}</h2>
                <p>{{ t('racha.rosterHint') }}</p>
              </div>
              <div class="roster-actions">
                <q-btn
                  flat
                  color="primary"
                  icon="playlist_add"
                  :label="t('racha.importList')"
                  @click="importOpen = true"
                />
                <q-btn
                  outline
                  color="positive"
                  icon="content_copy"
                  :label="t('racha.whatsapp.export')"
                  :disable="!state.players.length"
                  @click="state.ui.exportOpen = true"
                />
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-form class="add-form" @submit="addPlayers">
                <q-input
                  v-model="newNames"
                  outlined
                  type="textarea"
                  autogrow
                  :rows="1"
                  :label="t('racha.addPlaceholder')"
                  :hint="t('racha.addHint')"
                />
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  icon="add"
                  :label="t('racha.add')"
                  :disable="!newNames.trim()"
                />
              </q-form>
              <template v-if="state.players.length">
                <q-input
                  v-model="search"
                  class="q-mt-lg"
                  outlined
                  dense
                  clearable
                  :label="t('racha.search')"
                  ><template #prepend><q-icon name="search" /></template
                ></q-input>
                <div class="filter-list" role="group" :aria-label="t('racha.players')">
                  <q-btn
                    v-for="item in filters"
                    :key="item.value"
                    flat
                    dense
                    :label="item.label"
                    :aria-pressed="filter === item.value"
                    :class="{ 'filter-active': filter === item.value }"
                    @click="filter = item.value"
                  />
                </div>
              </template>
              <div v-if="!state.players.length" class="empty-roster">
                <div class="empty-icon"><q-icon name="sports_soccer" size="34px" /></div>
                <h3>{{ t('racha.emptyTitle') }}</h3>
                <p>{{ t('racha.emptyHint') }}</p>
              </div>
              <div v-else-if="!visiblePlayers.length" class="empty-roster">
                <p>{{ t('racha.noMatches') }}</p>
                <q-btn
                  flat
                  color="primary"
                  :label="t('racha.clearFilters')"
                  @click="clearFilters"
                />
              </div>
              <ul v-else class="player-list">
                <li
                  v-for="player in visiblePlayers"
                  :key="player.id"
                  class="player-row"
                  :class="{ 'player-row--goalkeeper': player.goalkeeper }"
                >
                  <div class="player-identity">
                    <q-avatar
                      size="38px"
                      class="player-avatar"
                      :class="{ 'player-avatar--goalkeeper': player.goalkeeper }"
                      ><q-icon v-if="player.goalkeeper" name="sports_handball" size="23px" /><span
                        v-else
                        >{{ initials(player.name) }}</span
                      ></q-avatar
                    >
                    <span class="player-name">{{ player.name }}</span>
                    <q-icon
                      v-if="isRachaSeed(player)"
                      name="military_tech"
                      class="seed-icon"
                      size="18px"
                      ><q-tooltip>{{
                        t(player.goalkeeper ? 'racha.automaticSeed' : 'racha.seed')
                      }}</q-tooltip></q-icon
                    >
                    <q-btn
                      flat
                      round
                      dense
                      icon="more_vert"
                      class="player-menu"
                      :aria-label="t('racha.playerActions', { name: player.name })"
                    >
                      <q-menu
                        ><q-list>
                          <q-item v-close-popup clickable @click="openEdit(player)"
                            ><q-item-section avatar><q-icon name="edit" /></q-item-section
                            ><q-item-section>{{ t('racha.editPlayer') }}</q-item-section></q-item
                          >
                          <q-item v-close-popup clickable @click="confirmRemove(player)"
                            ><q-item-section avatar
                              ><q-icon name="person_remove" color="negative" /></q-item-section
                            ><q-item-section>{{ t('racha.removePlayer') }}</q-item-section></q-item
                          >
                        </q-list></q-menu
                      >
                    </q-btn>
                  </div>
                  <div class="player-controls">
                    <q-btn
                      flat
                      dense
                      class="role-button"
                      :class="{ 'role-button--goalkeeper': player.goalkeeper }"
                      icon="sports_handball"
                      :label="t('racha.goalkeeper')"
                      :aria-label="t('racha.goalkeeperFor', { name: player.name })"
                      :aria-pressed="player.goalkeeper"
                      @click="player.goalkeeper = !player.goalkeeper"
                    />
                    <q-btn
                      flat
                      dense
                      class="role-button"
                      :class="{ 'role-button--seed': isRachaSeed(player) }"
                      icon="military_tech"
                      :label="t('racha.seed')"
                      :aria-label="t('racha.seedFor', { name: player.name })"
                      :aria-pressed="isRachaSeed(player)"
                      :disable="player.goalkeeper"
                      @click="player.seed = !player.seed"
                      ><q-tooltip v-if="player.goalkeeper">{{
                        t('racha.automaticSeed')
                      }}</q-tooltip></q-btn
                    >
                    <q-btn
                      flat
                      dense
                      class="role-button payment-button"
                      :class="{ 'role-button--paid': player.paid }"
                      :icon="player.paid ? 'check_circle' : 'radio_button_unchecked'"
                      :label="t(player.paid ? 'racha.paid' : 'racha.unpaid')"
                      :aria-label="t('racha.paidFor', { name: player.name })"
                      :aria-pressed="player.paid"
                      @click="player.paid = !player.paid"
                    />
                  </div>
                </li>
              </ul>
            </q-card-section>
          </q-card>
        </section>

        <aside class="config-column">
          <q-card flat class="draw-card">
            <q-card-section>
              <div class="config-icon"><q-icon name="shuffle" size="24px" /></div>
              <h2>{{ t('racha.drawTitle') }}</h2>
              <p class="muted">{{ t('racha.drawHint') }}</p>
              <q-btn-toggle
                v-model="state.config.mode"
                spread
                unelevated
                toggle-color="primary"
                :color="$q.dark.isActive ? 'blue-grey-9' : 'grey-2'"
                :text-color="$q.dark.isActive ? 'grey-3' : 'grey-8'"
                class="mode-toggle q-mb-lg"
                :options="[
                  { label: t('racha.bySize'), value: 'size' },
                  { label: t('racha.bySeeds'), value: 'seeds' },
                ]"
              />
              <q-input
                v-if="state.config.mode === 'size'"
                v-model.number="state.config.teamSize"
                type="number"
                outlined
                min="1"
                step="1"
                :label="t('racha.teamSize')"
                :hint="t('racha.includesGoalkeeper')"
                class="q-mb-lg"
              />
              <p v-else class="muted text-body2">{{ t('racha.seedModeHint') }}</p>
              <div class="seed-notice">
                <q-icon name="verified_user" size="22px" /><span>{{ t('racha.seedRule') }}</span>
              </div>
              <q-toggle
                v-model="state.config.defineStarter"
                :label="t('racha.defineStarter')"
                class="q-my-md"
              />
              <div class="draw-preview" role="status" aria-live="polite">
                <template v-if="!drawIssue"
                  ><strong>{{
                    t('racha.preview', { teams: teamCount, players: state.players.length })
                  }}</strong>
                  <p v-if="expandedTeamCount">
                    {{ t('racha.expandedTeams', { seeds: seeds.length, teams: teamCount }) }}
                  </p>
                  <p v-if="teamCount > goalkeepers.length">
                    {{ t('racha.missingGoalkeepers', { count: teamCount - goalkeepers.length }) }}
                  </p>
                </template>
                <p v-else>{{ t(`racha.issues.${drawIssue}`) }}</p>
              </div>
              <q-btn
                unelevated
                color="primary"
                icon="shuffle"
                class="full-width draw-button"
                :label="t(state.teams.length ? 'racha.redraw' : 'racha.generate')"
                :disable="!!drawIssue"
                @click="requestDraw"
              />
              <p class="payment-note">
                <q-icon name="info_outline" size="16px" />{{ t('racha.paymentHint') }}
              </p>
            </q-card-section>
          </q-card>
          <q-card flat class="payment-card">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <h2 class="q-mb-none">{{ t('racha.payments') }}</h2>
                <q-space /><q-icon name="account_balance_wallet" size="22px" class="muted" />
              </div>
              <p class="muted">
                {{ t('racha.paidOf', { paid: paid.length, total: state.players.length }) }}
              </p>
              <q-linear-progress
                :value="state.players.length ? paid.length / state.players.length : 0"
                color="positive"
                rounded
                size="7px"
                :aria-label="t('racha.paidOf', { paid: paid.length, total: state.players.length })"
              />
              <div
                v-if="Number(state.fee) > 0 && Number.isFinite(Number(state.fee))"
                class="money-summary"
              >
                <div>
                  <span>{{ t('racha.received') }}</span
                  ><strong>{{ money(received) }}</strong>
                </div>
                <div>
                  <span>{{ t('racha.pendingAmount') }}</span
                  ><strong>{{ money(pending) }}</strong>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </aside>
      </div>

      <section
        ref="resultsSection"
        class="results-section"
        aria-labelledby="results-title"
        tabindex="-1"
      >
        <div class="section-heading results-heading">
          <div>
            <h2 id="results-title">
              <q-icon name="sports_soccer" class="q-mr-sm" />{{ t('racha.resultTitle') }}
            </h2>
            <p>{{ t(state.teams.length ? 'racha.resultHint' : 'racha.resultEmpty') }}</p>
          </div>
          <q-btn
            v-if="state.teams.length"
            outline
            color="primary"
            icon="content_copy"
            :label="t('racha.copy')"
            @click="copyTeams"
          />
        </div>
        <q-banner v-if="drawChanged" rounded class="changed-notice" role="status">{{
          t('racha.resultChanged')
        }}</q-banner>
        <div v-if="resultTeams.length" class="teams-grid">
          <q-card
            v-for="(team, index) in resultTeams"
            :key="index"
            flat
            class="result-team"
            :style="{ '--team-color': teamColors[index % teamColors.length] }"
          >
            <q-card-section>
              <div class="team-heading">
                <div class="team-number">{{ String(index + 1).padStart(2, '0') }}</div>
                <div>
                  <h3>{{ t('racha.team', { number: index + 1 }) }}</h3>
                  <span class="muted text-caption">{{
                    t('racha.memberCount', { count: team.length })
                  }}</span>
                </div>
              </div>
              <ul class="team-members">
                <li v-for="player in team" :key="player.id">
                  <span class="result-player-name">{{ player.name }}</span
                  ><span class="result-roles"
                    ><q-icon
                      v-if="player.goalkeeper"
                      name="sports_handball"
                      size="19px"
                      :aria-label="t('racha.goalkeeper')"
                      role="img"
                      ><q-tooltip>{{ t('racha.goalkeeper') }}</q-tooltip></q-icon
                    ><q-icon
                      v-if="isRachaSeed(player)"
                      name="military_tech"
                      size="19px"
                      class="seed-icon"
                      :aria-label="t('racha.seed')"
                      role="img"
                      ><q-tooltip>{{ t('racha.seed') }}</q-tooltip></q-icon
                    ><q-icon
                      v-if="state.starter === player.id"
                      name="sports_soccer"
                      size="19px"
                      :aria-label="t('racha.starts', { name: player.name })"
                      role="img"
                  /></span>
                </li>
              </ul>
              <div
                v-if="!team.some((player) => player.goalkeeper)"
                class="muted text-caption q-mt-md"
              >
                <q-icon name="info_outline" /> {{ t('racha.noGoalkeeper') }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div
          v-if="state.teams.length && state.config.defineStarter"
          class="starter-banner"
          role="status"
          aria-live="polite"
        >
          <div>
            <q-icon name="sports_soccer" size="24px" /><strong v-if="starter">{{
              t('racha.starts', { name: starter.name })
            }}</strong>
          </div>
          <q-btn
            flat
            color="primary"
            icon="shuffle"
            :label="t('racha.pickStarter')"
            @click="pickStarter"
          />
        </div>
      </section>
    </div>

    <q-dialog v-model="state.ui.exportOpen">
      <q-card class="racha-dialog whatsapp-dialog">
        <q-card-section class="row items-center no-wrap">
          <h2 class="dialog-title">{{ t('racha.whatsapp.title') }}</h2>
          <q-space />
          <q-btn v-close-popup flat round icon="close" :aria-label="t('shared.cancel')" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <p class="muted">{{ t('racha.whatsapp.hint') }}</p>
          <pre class="whatsapp-preview" tabindex="0" :aria-label="t('racha.whatsapp.preview')">{{
            whatsappMessage
          }}</pre>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn v-close-popup flat :label="t('shared.cancel')" />
          <q-btn
            unelevated
            color="positive"
            icon="content_copy"
            :label="t('racha.whatsapp.copy')"
            @click="copyRoster"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="importOpen"
      ><q-card class="racha-dialog"
        ><q-card-section class="row items-center"
          ><h2 class="dialog-title">{{ t('racha.importList') }}</h2>
          <q-space /><q-btn
            v-close-popup
            flat
            round
            icon="close"
            :aria-label="t('shared.cancel')" /></q-card-section
        ><q-card-section class="q-pt-none"
          ><p class="muted">{{ t('racha.importHint') }}</p>
          <p v-if="!savedLists.length">{{ t('shared.noSavedLists') }}</p>
          <q-list v-else
            ><q-item
              v-for="list in savedLists"
              :key="list.id"
              clickable
              @click="importPlayers(list.items)"
              ><q-item-section avatar><q-icon name="playlist_add" color="primary" /></q-item-section
              ><q-item-section
                ><q-item-label>{{ list.name }}</q-item-label
                ><q-item-label caption>{{
                  t('savedLists.itemCount', { count: list.items.length })
                }}</q-item-label></q-item-section
              ><q-item-section side><q-icon name="add" /></q-item-section></q-item></q-list
          ><q-btn
            v-if="!savedLists.length"
            flat
            color="primary"
            to="/saved-lists"
            :label="t('nav.savedLists')" /></q-card-section></q-card
    ></q-dialog>
    <q-dialog v-model="editOpen"
      ><q-card class="racha-dialog"
        ><q-form @submit="savePlayer"
          ><q-card-section
            ><h2 class="dialog-title q-mb-md">{{ t('racha.editPlayer') }}</h2>
            <q-input
              v-model="editName"
              autofocus
              outlined
              :label="t('racha.playerName')"
              :error="editError"
              :error-message="t('racha.nameError')"
              @update:model-value="editError = false" /></q-card-section
          ><q-card-actions align="right" class="q-pa-md"
            ><q-btn v-close-popup flat :label="t('shared.cancel')" /><q-btn
              type="submit"
              color="primary"
              unelevated
              :label="t('shared.save')" /></q-card-actions></q-form></q-card
    ></q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { copyToClipboard, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRacha } from 'src/composables/useRacha';
import { useSavedConfigs } from 'src/composables/useSavedConfigs';
import type { SavedParticipantList } from 'src/types/saved-lists';
import type { RachaPlayer, RachaState } from 'src/types/racha';
import { isRachaSeed } from 'src/utils/racha';
import { formatRachaMessage } from 'src/utils/racha-message';

const { t, locale } = useI18n();
const $q = useQuasar();
const {
  state,
  storageError,
  drawChanged,
  seeds,
  goalkeepers,
  paid,
  teamCount,
  drawIssue,
  resultTeams,
  starter,
  received,
  pending,
  addNames,
  renamePlayer,
  removePlayer,
  generateTeams,
  pickStarter,
  reset,
} = useRacha();
const { data: savedLists } = useSavedConfigs<SavedParticipantList[]>('saved_lists', []);
function uiField<K extends keyof RachaState['ui']>(key: K) {
  return computed({
    get: () => state.value.ui[key],
    set: (value: RachaState['ui'][K]) => {
      state.value.ui[key] = value;
    },
  });
}
const newNames = uiField('newNames');
const search = computed({
  get: () => state.value.ui.search,
  set: (value: string | null) => {
    state.value.ui.search = value ?? '';
  },
});
const filter = uiField('filter');
const importOpen = uiField('importOpen');
const editName = uiField('editName');
const editId = uiField('editPlayerId');
const editOpen = computed({
  get: () => !!editId.value,
  set: (open: boolean) => {
    if (!open) {
      editId.value = '';
      editName.value = '';
    }
  },
});
const whatsappMessage = computed(() =>
  formatRachaMessage(state.value, (key, values) => t(key, values ?? {}), locale.value),
);
const editError = ref(false);
const resultsSection = ref<HTMLElement>();
const teamColors = ['#4f46e5', '#059669', '#d97706', '#db2777', '#0284c7', '#9333ea'];
const filters = computed(
  () =>
    [
      { value: 'all', label: `${t('racha.all')} (${state.value.players.length})` },
      { value: 'goalkeepers', label: `${t('racha.goalkeepers')} (${goalkeepers.value.length})` },
      { value: 'seeds', label: `${t('racha.seeds')} (${seeds.value.length})` },
      {
        value: 'unpaid',
        label: `${t('racha.unpaidFilter')} (${state.value.players.length - paid.value.length})`,
      },
    ] as const,
);
function searchKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();
}
const visiblePlayers = computed(() =>
  state.value.players.filter((player) => {
    if (!searchKey(player.name).includes(searchKey(search.value ?? ''))) return false;
    return filter.value === 'goalkeepers'
      ? player.goalkeeper
      : filter.value === 'seeds'
        ? isRachaSeed(player)
        : filter.value === 'unpaid'
          ? !player.paid
          : true;
  }),
);
const expandedTeamCount = computed(
  () =>
    state.value.config.mode === 'size' &&
    seeds.value.length > Math.ceil(state.value.players.length / state.value.config.teamSize),
);
function money(value: number) {
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'BRL' }).format(value);
}
function validFee(value: string | number | null) {
  return (
    (value !== '' && value !== null && Number.isFinite(Number(value)) && Number(value) >= 0) ||
    t('racha.fee')
  );
}
function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toLocaleUpperCase();
}
function clearFilters() {
  search.value = '';
  filter.value = 'all';
}
function notifyAdded(count: number) {
  $q.notify({
    message: t(count ? 'racha.added' : 'racha.duplicate', { count }),
    color: count ? 'positive' : 'info',
  });
  if (count) clearFilters();
}
function addPlayers() {
  const count = addNames(newNames.value);
  newNames.value = '';
  notifyAdded(count);
}
function importPlayers(names: string[]) {
  notifyAdded(addNames(names.join('\n')));
  importOpen.value = false;
}
function openEdit(player: RachaPlayer) {
  editId.value = player.id;
  editName.value = player.name;
  editError.value = false;
  editOpen.value = true;
}
function savePlayer() {
  if (!renamePlayer(editId.value, editName.value)) {
    editError.value = true;
    return;
  }
  editOpen.value = false;
}
function confirmRemove(player: RachaPlayer) {
  $q.dialog({
    title: t('racha.removePlayer'),
    message: t('racha.removeMessage', { name: player.name }),
    cancel: t('shared.cancel'),
    ok: { label: t('racha.removePlayer'), color: 'negative' },
  }).onOk(() => removePlayer(player.id));
}
function confirmReset() {
  $q.dialog({
    title: t('racha.resetTitle'),
    message: t('racha.resetMessage'),
    cancel: t('shared.cancel'),
    ok: { label: t('racha.resetConfirm'), color: 'negative' },
  }).onOk(() => {
    reset();
    clearFilters();
    newNames.value = '';
  });
}
function drawAndReveal() {
  generateTeams();
  void nextTick(() => {
    resultsSection.value?.focus({ preventScroll: true });
    resultsSection.value?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    });
  });
}
function requestDraw() {
  if (!state.value.teams.length) {
    drawAndReveal();
    return;
  }
  $q.dialog({
    title: t('racha.confirmRedraw'),
    message: t('racha.redrawMessage'),
    cancel: t('shared.cancel'),
    ok: t('racha.redraw'),
  }).onOk(drawAndReveal);
}
async function copyRoster() {
  try {
    await copyToClipboard(whatsappMessage.value);
    $q.notify({ message: t('racha.whatsapp.copied'), color: 'positive' });
  } catch {
    $q.notify({ message: t('racha.whatsapp.copyError'), color: 'negative' });
  }
}
async function copyTeams() {
  const lines = [state.value.title || t('racha.nav')];
  if (state.value.location) lines.push(state.value.location);
  if (state.value.date) lines.push(state.value.date.replace('T', ' '));
  resultTeams.value.forEach((team, index) => {
    lines.push('', t('racha.team', { number: index + 1 }));
    team.forEach((player) => {
      const roles = [
        player.goalkeeper ? t('racha.goalkeeper') : '',
        isRachaSeed(player) ? t('racha.seed') : '',
      ].filter(Boolean);
      lines.push(`• ${player.name}${roles.length ? ` (${roles.join(', ')})` : ''}`);
    });
  });
  if (starter.value) lines.push('', t('racha.starts', { name: starter.value.name }));
  try {
    await copyToClipboard(lines.join('\n'));
    $q.notify({ message: t('racha.copied'), color: 'positive' });
  } catch {
    $q.notify({ message: t('racha.copyError'), color: 'negative' });
  }
}
</script>

<style scoped lang="scss">
.racha-page {
  padding: 32px;
  color: var(--sa-text);
}
.racha-container {
  max-width: 1240px;
  margin: 0 auto;
}
.racha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  padding: 32px 36px;
  background: #064e3b;
  color: #fff;
  border-radius: 24px;
  overflow: hidden;
}
.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a7f3d0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
h1 {
  margin: 12px 0 8px;
  font-size: clamp(26px, 3vw, 36px);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -1px;
}
.hero-copy p {
  color: #d1fae5;
  margin-bottom: 22px;
  max-width: 500px;
}
.hero-copy .q-btn {
  color: #d1fae5;
}
.pitch {
  position: relative;
  flex: 0 0 245px;
  height: 158px;
  border: 2px solid #ffffff40;
  border-radius: 5px;
  transform: rotate(-7deg);
  background: repeating-linear-gradient(90deg, transparent 0 30px, #ffffff05 30px 60px);
}
.pitch::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  height: 100%;
  width: 2px;
  background: #ffffff40;
}
.pitch-circle {
  position: absolute;
  width: 58px;
  height: 58px;
  border: 2px solid #ffffff40;
  border-radius: 50%;
  top: calc(50% - 29px);
  left: calc(50% - 29px);
}
.pitch-box {
  position: absolute;
  top: 25%;
  height: 50%;
  width: 36px;
  border: 2px solid #ffffff40;
}
.pitch-box--left {
  left: -2px;
}
.pitch-box--right {
  right: -2px;
}
.pitch > .q-icon {
  position: absolute;
  top: 51%;
  left: 62%;
  color: #ecfdf5;
  filter: drop-shadow(0 4px 4px #0004);
}
.save-status {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: flex-end;
  font-size: 11px;
  color: var(--sa-text-muted);
  margin: 12px 2px 22px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}
.stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--sa-border);
  border-radius: 18px;
  background: var(--sa-surface-strong);
}
.stat > .q-icon {
  font-size: 24px;
  color: var(--sa-text-muted);
  background: var(--sa-surface-muted);
  padding: 10px;
  border-radius: 13px;
}
.stat strong {
  display: block;
  font-size: 26px;
  line-height: 1.2;
}
.stat small {
  font-size: 15px;
  color: var(--sa-text-muted);
  font-weight: 500;
}
.stat span {
  display: block;
  font-size: 12px;
  color: var(--sa-text-muted);
  margin-top: 4px;
}
.stat--paid > .q-icon {
  color: #059669;
  background: #10b98114;
}
.match-details,
.roster-card,
.draw-card,
.payment-card,
.result-team {
  background: var(--sa-surface-strong);
  border: 1px solid var(--sa-border);
  box-shadow: none !important;
}
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.match-details :deep(.q-item) {
  margin: 0;
  padding: 18px 22px;
}
.organizer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  align-items: start;
  gap: 24px;
}
.config-column {
  display: grid;
  gap: 20px;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 24px;
}
h2 {
  font-size: 18px;
  line-height: 1.4;
  font-weight: 700;
  margin: 0 0 6px;
  letter-spacing: -0.4px;
}
.section-heading p {
  color: var(--sa-text-muted);
  font-size: 12px;
  margin: 0;
}
.roster-card > .q-card__section:not(.section-heading) {
  padding: 0 24px 24px;
}
.add-form {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.add-form .q-input {
  flex: 1;
  min-width: 0;
}
.add-form > .q-btn {
  min-height: 56px;
}
.filter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 16px 0;
}
.filter-list .q-btn {
  padding: 6px 10px;
  color: var(--sa-text-muted);
  font-size: 11px;
  border-radius: 9px;
}
.filter-list .filter-active {
  background: var(--sa-primary-soft);
  color: var(--sa-text);
}
.empty-roster {
  text-align: center;
  padding: 40px 16px;
  color: var(--sa-text-muted);
}
.empty-icon {
  display: inline-flex;
  padding: 17px;
  border-radius: 22px;
  background: var(--sa-surface-muted);
}
.empty-roster h3 {
  color: var(--sa-text);
  font-size: 17px;
  font-weight: 600;
  margin: 18px 0 8px;
}
.empty-roster p {
  font-size: 13px;
  max-width: 340px;
  margin: 0 auto;
  line-height: 1.7;
}
.player-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}
.player-row {
  border: 1px solid var(--sa-border);
  border-radius: 14px;
  padding: 12px;
}
.player-row--goalkeeper {
  border-left: 3px solid #0d9488;
  padding-left: 10px;
}
.player-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.player-avatar {
  background: var(--sa-surface-muted);
  color: var(--sa-text-muted);
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.player-avatar--goalkeeper {
  background: #0d948818;
  color: #0d9488;
}
.player-name {
  font-size: 14px;
  font-weight: 600;
  overflow-wrap: anywhere;
  min-width: 0;
}
.player-menu {
  margin-left: auto;
  color: var(--sa-text-muted);
  flex-shrink: 0;
}
.seed-icon {
  color: #d97706;
  flex-shrink: 0;
}
.player-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.role-button {
  background: var(--sa-surface-muted);
  color: var(--sa-text-muted);
  font-size: 11px;
  padding: 7px 9px;
  border-radius: 8px;
  min-height: 36px;
}
.role-button :deep(.q-icon) {
  font-size: 16px;
  margin-right: 5px;
}
.role-button--goalkeeper {
  color: #0f766e;
  background: #0d948818;
}
.role-button--seed {
  color: #a16207;
  background: #eab30818;
}
.role-button--paid {
  color: #047857;
  background: #10b98118;
}
.payment-button {
  margin-left: auto;
}
.draw-card > .q-card__section,
.payment-card > .q-card__section {
  padding: 24px;
}
.config-icon {
  display: inline-flex;
  padding: 10px;
  border-radius: 12px;
  background: var(--sa-primary-soft);
  color: var(--sa-primary);
  margin-bottom: 18px;
}
.muted {
  color: var(--sa-text-muted);
}
.draw-card .muted,
.payment-card p {
  font-size: 12px;
  line-height: 1.7;
}
.mode-toggle {
  border-radius: 10px;
  padding: 3px;
  background: var(--sa-surface-muted);
}
.mode-toggle :deep(.q-btn) {
  font-size: 11px;
  min-height: 40px;
  padding: 6px;
  border-radius: 8px;
}
.seed-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px;
  border-radius: 12px;
  background: #0d948810;
  color: #0f766e;
  font-size: 12px;
  line-height: 1.7;
}
.seed-notice .q-icon {
  margin-top: 2px;
  flex-shrink: 0;
}
.draw-card .q-toggle {
  font-size: 13px;
  margin-left: -10px;
}
.draw-preview {
  font-size: 12px;
  margin: 0 0 16px;
  line-height: 1.7;
}
.draw-preview strong {
  display: block;
  font-size: 14px;
}
.draw-preview p {
  margin: 8px 0 0;
  color: var(--sa-text-muted);
}
.draw-button {
  min-height: 48px;
}
.payment-note {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  font-size: 11px;
  line-height: 1.6;
  color: var(--sa-text-muted);
  margin: 14px 0 0;
}
.payment-note .q-icon {
  margin-top: 1px;
  flex-shrink: 0;
}
.money-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  margin-top: 20px;
}
.money-summary span,
.money-summary strong {
  display: block;
}
.money-summary span {
  font-size: 11px;
  color: var(--sa-text-muted);
}
.money-summary strong {
  font-size: 18px;
  margin-top: 5px;
}
.money-summary > div:first-child strong {
  color: #059669;
}
.results-section {
  margin-top: 32px;
  scroll-margin-top: 90px;
  outline-offset: 6px;
  border-radius: 16px;
}
.results-heading {
  padding: 0 0 20px;
}
.results-heading h2 {
  display: flex;
  align-items: center;
}
.changed-notice {
  background: var(--sa-primary-soft);
  color: var(--sa-text);
  font-size: 13px;
}
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}
.result-team {
  border-top: 4px solid var(--team-color);
}
.result-team > .q-card__section {
  padding: 22px;
}
.team-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}
.team-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--sa-surface-muted);
  color: var(--team-color);
  font-size: 18px;
  font-weight: 700;
}
.team-heading h3 {
  font-size: 16px;
  line-height: 1.4;
  margin: 0;
  font-weight: 700;
}
.team-members {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
}
.team-members li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--sa-border);
  font-size: 13px;
}
.team-members li:last-child {
  border-bottom: 0;
}
.result-player-name {
  overflow-wrap: anywhere;
  min-width: 0;
}
.result-roles {
  display: flex;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
  color: #0d9488;
}
.starter-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 18px 22px;
  margin-top: 18px;
  border-radius: 16px;
  background: var(--sa-primary-soft);
}
.starter-banner > div {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  overflow-wrap: anywhere;
  min-width: 0;
}
.starter-banner strong {
  min-width: 0;
}
.racha-dialog {
  width: 460px;
  max-width: 94vw;
}
.roster-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.whatsapp-dialog {
  width: 580px;
}
.whatsapp-preview {
  margin: 0;
  padding: 18px;
  max-height: 50vh;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: inherit;
  font-size: 13px;
  line-height: 1.8;
  color: var(--sa-text);
  background: var(--sa-surface-muted);
  border: 1px solid var(--sa-border);
  border-radius: 12px;
  user-select: text;
}
.dialog-title {
  font-size: 20px;
}
.racha-dialog .muted {
  font-size: 13px;
}
body.body--dark {
  .role-button--goalkeeper,
  .seed-notice {
    color: #5eead4;
  }
  .role-button--seed {
    color: #fcd34d;
  }
  .role-button--paid {
    color: #6ee7b7;
  }
  .player-avatar--goalkeeper {
    color: #5eead4;
  }
}
@media (min-width: 1400px) {
  .player-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .player-identity {
    flex: 1;
  }
  .player-controls {
    margin-top: 0;
  }
  .player-menu {
    order: 4;
  }
  .player-controls .payment-button {
    margin-left: 0;
  }
}
@media (max-width: 1100px) {
  .organizer-grid {
    grid-template-columns: minmax(0, 1fr) 310px;
    gap: 18px;
  }
  .stat {
    padding: 16px 12px;
    gap: 10px;
  }
  .stat > .q-icon {
    padding: 8px;
  }
  .add-form {
    flex-direction: column;
  }
  .add-form .q-input {
    width: 100%;
  }
  .add-form > .q-btn {
    min-height: 40px;
    align-self: flex-end;
  }
}
@media (max-width: 850px) {
  .organizer-grid {
    grid-template-columns: 1fr;
  }
  .config-column {
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
    align-items: start;
  }
  .pitch {
    flex-basis: 190px;
    height: 130px;
  }
  .racha-header {
    padding: 26px;
  }
  .stats-grid {
    gap: 10px;
  }
  .stat > .q-icon {
    display: none;
  }
}
@media (max-width: 599px) {
  .racha-page {
    padding: 16px;
  }
  .racha-header {
    padding: 24px;
  }
  .pitch {
    display: none;
  }
  .save-status {
    justify-content: flex-start;
    margin-bottom: 18px;
  }
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 18px;
  }
  .stat {
    padding: 16px;
  }
  .stat > .q-icon {
    display: block;
    font-size: 21px;
  }
  .stat strong {
    font-size: 23px;
  }
  .details-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .config-column {
    grid-template-columns: 1fr;
  }
  .section-heading {
    padding: 20px 16px;
  }
  .roster-card > .q-card__section:not(.section-heading) {
    padding: 0 16px 16px;
  }
  .player-row {
    padding: 10px;
  }
  .player-controls {
    gap: 5px;
  }
  .role-button {
    font-size: 10px;
    padding: 7px;
  }
  .role-button :deep(.q-icon) {
    margin-right: 4px;
  }
  .filter-list {
    gap: 3px;
  }
  .teams-grid {
    grid-template-columns: 1fr;
  }
  .results-heading {
    padding: 0 0 20px;
  }
  .starter-banner {
    padding: 16px;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
  }
}
</style>
