<template>
  <q-page class="q-pa-md companion-page">
    <div class="companion-container">
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        to="/board-games"
        :label="t('boardGames.backToHub')"
        class="q-mb-md"
      />
      <div v-if="loading" role="status" class="text-center q-pa-xl">
        <q-spinner color="primary" size="32px" aria-hidden="true" />
        <p>{{ t('boardGames.loading') }}</p>
      </div>
      <q-banner v-else-if="error" rounded class="bg-negative text-white" role="alert">
        {{ t(error) }}
        <template #action>
          <q-btn v-if="registration" flat :label="t('boardGames.retry')" @click="loadGame" />
          <q-btn flat to="/board-games" :label="t('boardGames.title')" />
        </template>
      </q-banner>
      <template v-else-if="game">
        <header class="q-mb-lg">
          <p class="text-overline text-primary q-mb-xs">{{ t('boardGames.title') }}</p>
          <h1 class="text-h4 text-weight-bold text-gradient q-mt-none q-mb-sm">{{ game.title }}</h1>
          <p class="q-mb-sm">{{ t('boardGames.subtitle') }}</p>
          <q-btn
            v-if="registration?.setupRoute"
            color="primary"
            icon="sports_motorsports"
            :to="registration.setupRoute"
            :label="t('boardGames.prepareMatch')"
            class="q-mb-md"
          />
          <div class="row q-gutter-sm">
            <q-chip icon="groups" outline>
              {{ t('boardGames.players', { min: game.players.min, max: game.players.max }) }}
            </q-chip>
            <q-chip icon="schedule" outline>
              {{ game.durationMinutes.min
              }}<template v-if="game.durationMinutes.min !== game.durationMinutes.max"
                >–{{ game.durationMinutes.max }}</template
              >
              min
            </q-chip>
            <q-chip outline class="edition-chip">{{ game.edition }}</q-chip>
          </div>
        </header>

        <q-banner rounded class="language-notice q-mb-md" role="note">
          <template #avatar><q-icon name="translate" /></template>
          {{ t('boardGames.languageNotice', { language: game.language }) }}
        </q-banner>

        <q-card flat bordered class="q-mb-lg">
          <q-expansion-item :label="t('boardGames.overview')" icon="menu_book">
            <q-card-section>
              <p :lang="game.language">{{ game.disclaimer }}</p>
              <p v-if="game.scoring" class="q-mb-sm">
                <strong>{{ t('boardGames.scoring') }}:</strong>
                <span :lang="game.language"> {{ game.scoring.formula }}</span>
              </p>
              <div v-if="game.endGameSkillTokensByPlayerCount" class="q-mb-md">
                <strong>{{ t('boardGames.countdown') }}:</strong>
                <ul class="q-my-xs q-pl-lg">
                  <li
                    v-for="(tokens, players) in game.endGameSkillTokensByPlayerCount"
                    :key="players"
                  >
                    {{ t('boardGames.countdownValue', { players, tokens }) }}
                  </li>
                </ul>
              </div>
              <q-expansion-item
                v-if="game.ingredients.length"
                :label="t('boardGames.ingredients')"
                icon="science"
                dense
              >
                <ul :lang="game.language" class="ingredient-list" role="list">
                  <li
                    v-for="ingredient in game.ingredients"
                    :key="ingredient.id"
                    class="ingredient-item"
                  >
                    <span
                      class="ingredient-marble"
                      :style="{ backgroundColor: ingredient.color }"
                      aria-hidden="true"
                    />
                    <span>{{ ingredient.name }}</span>
                  </li>
                </ul>
              </q-expansion-item>
              <q-expansion-item
                v-if="game.racingReference && selectedModule === game.racingReference.module"
                :label="t('boardGames.racingReference')"
                icon="sports_motorsports"
              >
                <RacingReferenceTables
                  :reference="game.racingReference"
                  :content-language="game.language"
                  :images="boardGameImages[game.id] ?? {}"
                  class="q-pa-sm"
                />
              </q-expansion-item>
            </q-card-section>
          </q-expansion-item>
        </q-card>

        <q-banner v-if="game.modules?.length" rounded class="language-notice q-mb-md" role="note">
          {{ t('boardGames.referenceOnlyNotice') }}
        </q-banner>

        <section :aria-label="t('boardGames.searchTitle')" class="search-panel">
          <q-input
            v-model="query"
            outlined
            clearable
            clear-icon="close"
            type="search"
            :label="t(game.potions?.length ? 'boardGames.search' : 'boardGames.searchRules')"
            :hint="t('boardGames.searchHint')"
            :debounce="150"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <q-select
            v-if="moduleOptions.length"
            v-model="selectedModule"
            outlined
            emit-value
            map-options
            :options="moduleOptions"
            :label="t('boardGames.module')"
            :hint="t('boardGames.moduleHint')"
            class="q-mt-md"
            @update:model-value="category = ''"
          />
          <q-select
            v-model="category"
            outlined
            emit-value
            map-options
            :options="categoryOptions"
            :label="t('boardGames.category')"
            class="q-mt-md"
          />
          <div class="row items-center justify-between q-mt-sm q-gutter-sm">
            <p class="text-body2 q-mb-none" role="status" aria-live="polite" aria-atomic="true">
              {{ t('boardGames.results', { count: results.length }) }}
            </p>
            <q-btn
              v-if="query || category || selectedModule !== defaultModule"
              flat
              color="primary"
              :label="t('boardGames.clear')"
              @click="clearFilters"
            />
          </div>
        </section>

        <q-banner
          v-if="selectedModule && selectedModule !== defaultModule"
          rounded
          class="language-notice q-mt-md"
          role="note"
        >
          {{ t('boardGames.moduleSummaryNotice') }}
        </q-banner>

        <nav
          v-if="results.length"
          class="row q-gutter-sm q-mt-md"
          :aria-label="t('boardGames.sections')"
        >
          <q-btn
            v-for="section in sections"
            :key="section.id"
            outline
            color="primary"
            :label="section.title"
            @click="goToSection(section.id)"
          />
        </nav>

        <q-card v-if="!results.length" flat bordered class="q-mt-lg text-center q-pa-lg">
          <q-icon name="search_off" size="36px" aria-hidden="true" />
          <h2 class="text-h6">{{ t('boardGames.empty') }}</h2>
          <p>{{ t('boardGames.emptyHint') }}</p>
          <q-btn color="primary" :label="t('boardGames.clear')" @click="clearFilters" />
        </q-card>

        <RuleEntrySection
          v-for="section in sections"
          :id="section.id"
          :key="section.id"
          :title="section.title"
          :entries="section.entries"
          :details-label="t('boardGames.details')"
          :content-language="game.language"
        />

        <footer class="q-mt-xl">
          <h2 class="text-h6">{{ t('boardGames.sources') }}</h2>
          <p class="text-body2">{{ t('boardGames.externalNotice') }}</p>
          <div class="column items-start q-gutter-sm">
            <q-btn
              v-for="source in game.sources"
              :key="source.id"
              outline
              color="primary"
              icon-right="open_in_new"
              :label="source.label"
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
              class="source-link"
            />
          </div>
          <q-expansion-item :label="t('boardGames.sourceNotes')" icon="fact_check" class="q-mt-md">
            <ul class="q-pr-md" :lang="game.language">
              <li v-for="(note, key) in game.sourceNotes" :key="key" class="q-mb-sm">{{ note }}</li>
            </ul>
          </q-expansion-item>
        </footer>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import RuleEntrySection from 'components/board-games/RuleEntrySection.vue';
import RacingReferenceTables from 'components/board-games/RacingReferenceTables.vue';
import { boardGames } from 'src/data/board-games';
import { boardGameImages } from 'src/data/board-game-images';
import { createGameSearch, getGameEntries } from 'src/utils/board-game-search';
import type { BoardGame, BoardGameEntry } from 'src/types/board-games';

const props = defineProps<{ gameId: string }>();
const { t } = useI18n();
const game = ref<BoardGame | null>(null);
const loading = ref<boolean>(false);
const error = ref<string>('');
const query = ref<string | null>('');
const category = ref<string>('');
const selectedModule = ref<string>('');
const defaultModule = computed(() => {
  const modules = game.value?.modules ?? [];
  return modules.find((module) => module.defaultEnabled)?.id ?? modules[0]?.id ?? '';
});
const moduleOptions = computed(() =>
  (game.value?.modules ?? []).map((module) => ({ label: module.name, value: module.id })),
);
const registration = computed(() =>
  Object.prototype.hasOwnProperty.call(boardGames, props.gameId)
    ? boardGames[props.gameId]
    : undefined,
);
let loadVersion = 0;

async function loadGame(): Promise<void> {
  const version = ++loadVersion;
  loading.value = true;
  error.value = '';
  game.value = null;
  clearFilters();
  try {
    const loader = registration.value;
    if (!loader) {
      error.value = 'boardGames.notFound';
      return;
    }
    const data = await loader.load();
    if (version === loadVersion) {
      game.value = data;
      selectedModule.value = defaultModule.value;
    }
  } catch {
    if (version === loadVersion) error.value = 'boardGames.loadError';
  } finally {
    if (version === loadVersion) loading.value = false;
  }
}

watch(() => props.gameId, loadGame, { immediate: true });

const entries = computed<BoardGameEntry[]>(() => {
  if (!game.value) return [];
  const images = boardGameImages[game.value.id];
  return getGameEntries(game.value).map((entry) => {
    const image = images?.[entry.id];
    return image ? { ...entry, image } : entry;
  });
});
const search = computed(() => createGameSearch(entries.value, game.value?.searchSynonyms ?? {}));
const results = computed(() =>
  search.value(query.value ?? '', category.value, selectedModule.value),
);
const categoryOptions = computed(() => [
  { label: t('boardGames.allCategories'), value: '' },
  ...[
    ...new Set(
      entries.value
        .filter((entry) => !selectedModule.value || entry.module === selectedModule.value)
        .map((entry) => entry.category),
    ),
  ].map((value) => ({
    label: ['preparacao', 'turno', 'pocoes', 'pontuacao', 'regras'].includes(value)
      ? t(`boardGames.categories.${value}`)
      : value,
    value,
  })),
]);

interface EntrySection {
  id: string;
  title: string;
  entries: BoardGameEntry[];
}

const sections = computed<EntrySection[]>(() => {
  const setupIds = new Set(game.value?.setup.map((entry) => entry.id));
  const potionIds = new Set(game.value?.potions?.map((entry) => entry.id));
  const groups: EntrySection[] = [
    { id: 'setup', title: t('boardGames.setup'), entries: [] },
    {
      id: 'turn',
      title: t(game.value?.modules?.length ? 'boardGames.playerAid' : 'boardGames.turn'),
      entries: [],
    },
    { id: 'potions', title: t('boardGames.potions'), entries: [] },
    { id: 'rules', title: t('boardGames.rules'), entries: [] },
  ];
  for (const entry of results.value) {
    const index = setupIds.has(entry.id)
      ? 0
      : potionIds.has(entry.id)
        ? 2
        : entry.category === 'turno'
          ? 1
          : 3;
    groups[index]?.entries.push(entry);
  }
  return groups.filter((section) => section.entries.length > 0);
});

function clearFilters(): void {
  query.value = '';
  category.value = '';
  selectedModule.value = defaultModule.value;
}

function goToSection(id: string): void {
  const heading = document.getElementById(`${id}-title`);
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: 'start' });
  }
}
</script>

<style scoped>
.companion-container {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 32px;
  overflow-wrap: anywhere;
}
.companion-page {
  color: var(--sa-text);
}
.language-notice {
  color: var(--sa-text);
  background: var(--sa-primary-soft);
}
.edition-chip {
  max-width: 100%;
  height: auto;
  min-height: 2em;
}
.edition-chip :deep(.q-chip__content) {
  white-space: normal;
}
.ingredient-list {
  list-style: none;
  padding-left: 16px;
}
.ingredient-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}
.ingredient-marble {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid var(--sa-text-muted);
  box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.35);
}
.search-panel {
  padding: 16px;
  border: 1px solid var(--sa-border);
  border-radius: 20px;
  background: var(--sa-surface-strong);
}
.source-link {
  max-width: 100%;
  text-align: left;
}
:deep(h2) {
  scroll-margin-top: 90px;
}
@media (min-width: 600px) {
  .companion-page {
    padding: 32px;
  }
}
</style>
