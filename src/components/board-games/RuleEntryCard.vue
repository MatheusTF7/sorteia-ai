<template>
  <q-card flat bordered class="full-height">
    <q-card-section :lang="contentLanguage">
      <img
        v-if="entry.image"
        :src="entry.image"
        :alt="entry.title"
        width="120"
        height="220"
        loading="lazy"
        decoding="async"
        class="entry-image q-mb-md"
      />
      <h3 class="text-subtitle1 text-weight-bold q-my-none">{{ entry.title }}</h3>
      <p v-if="entry.moduleName" class="text-caption entry-subtitle q-mt-xs q-mb-none">
        {{ entry.moduleName }}
      </p>
      <q-badge v-if="entry.mandatory !== undefined" outline color="primary" class="q-mt-sm">
        {{ t(entry.mandatory ? 'boardGames.mandatory' : 'boardGames.optional') }}
      </q-badge>
      <p v-if="entry.subtitle" class="text-caption entry-subtitle q-mt-xs q-mb-sm">
        {{ entry.subtitle }}
      </p>
      <p class="text-body2 q-mt-sm q-mb-none">{{ entry.summary }}</p>
    </q-card-section>
    <q-expansion-item
      v-if="entry.details.length"
      :label="detailsLabel"
      :aria-label="`${detailsLabel}: ${entry.title}`"
      icon="info_outline"
      class="entry-details"
    >
      <ul class="text-body2 q-pr-md q-pb-md q-my-none" :lang="contentLanguage">
        <li v-for="detail in entry.details" :key="detail" class="q-mb-xs">{{ detail }}</li>
      </ul>
    </q-expansion-item>
  </q-card>
</template>

<script setup lang="ts">
import type { BoardGameEntry } from 'src/types/board-games';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{ entry: BoardGameEntry; detailsLabel: string; contentLanguage: string }>();
</script>

<style scoped>
.entry-image {
  display: block;
  width: 100%;
  height: 220px;
  object-fit: contain;
}
.entry-subtitle {
  color: var(--sa-text-muted);
}
.entry-details :deep(.q-item) {
  margin: 0;
}
</style>
