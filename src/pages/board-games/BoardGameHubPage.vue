<template>
  <q-page class="q-pa-md hub-page">
    <div class="hub-container">
      <header class="q-mb-lg">
        <h1 class="text-h4 text-weight-bold text-gradient q-mt-none q-mb-sm">
          {{ t('boardGames.title') }}
        </h1>
        <p class="q-mb-none">{{ t('boardGames.hubDescription') }}</p>
      </header>

      <q-input
        v-model="query"
        outlined
        clearable
        type="search"
        :bg-color="$q.dark.isActive ? 'dark' : 'white'"
        :label="t('boardGames.searchGames')"
        class="q-mb-lg"
      >
        <template #prepend><q-icon name="search" /></template>
      </q-input>

      <p class="text-body2" role="status" aria-live="polite" aria-atomic="true">
        {{ t('boardGames.gameCount', { count: games.length }) }}
      </p>

      <div v-if="games.length" class="row q-col-gutter-md">
        <div v-for="game in games" :key="game.id" class="col-12 col-sm-6 col-lg-4">
          <q-card flat bordered class="full-height">
            <q-item clickable :to="`/board-games/${game.id}`" class="game-link">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" :icon="game.icon" />
              </q-item-section>
              <q-item-section>
                <h2 class="text-subtitle1 text-weight-bold q-my-none">{{ game.title }}</h2>
                <p class="text-body2 game-description q-mt-xs q-mb-none">
                  {{ game.description }}
                </p>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" aria-hidden="true" />
              </q-item-section>
            </q-item>
          </q-card>
        </div>
      </div>
      <q-card v-else flat bordered class="text-center q-pa-lg">
        <q-icon name="search_off" size="36px" aria-hidden="true" />
        <h2 class="text-h6">{{ t('boardGames.noGames') }}</h2>
        <q-btn
          v-if="query"
          flat
          color="primary"
          :label="t('boardGames.clear')"
          @click="query = ''"
        />
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { boardGames } from 'src/data/board-games';
import { normalizeSearch } from 'src/utils/board-game-search';

const { t } = useI18n();
const query = ref<string | null>('');
const games = computed(() => {
  const terms = normalizeSearch(query.value ?? '')
    .split(' ')
    .filter(Boolean);
  return Object.entries(boardGames)
    .map(([id, game]) => ({
      id,
      title: game.title,
      icon: game.icon,
      description: t(game.descriptionKey),
    }))
    .filter((game) => {
      const text = normalizeSearch(`${game.title} ${game.description}`);
      return terms.every((term) => text.includes(term));
    });
});
</script>

<style scoped>
.hub-container {
  max-width: 1200px;
  margin: 0 auto;
}
.hub-page {
  color: var(--sa-text);
}
.game-link {
  height: 100%;
  margin: 0;
  padding: 20px;
  overflow-wrap: anywhere;
}
.game-description {
  color: var(--sa-text-muted);
}
@media (min-width: 600px) {
  .hub-page {
    padding: 32px;
  }
}
</style>
