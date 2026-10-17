<template>
  <section :id="id" :aria-labelledby="`${id}-title`" class="q-mt-xl entry-section">
    <h2 :id="`${id}-title`" class="text-h6 text-weight-bold q-mb-md">
      {{ title }} <span class="text-body2">({{ entries.length }})</span>
    </h2>
    <div class="row q-col-gutter-md">
      <div v-for="entry in entries" :key="entry.id" class="col-12 col-md-6">
        <RuleEntryCard
          :entry="entry"
          :details-label="detailsLabel"
          :content-language="contentLanguage"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import RuleEntryCard from './RuleEntryCard.vue';
import type { BoardGameEntry } from 'src/types/board-games';

defineProps<{
  id: string;
  title: string;
  entries: BoardGameEntry[];
  detailsLabel: string;
  contentLanguage: string;
}>();
</script>

<style scoped>
.entry-section {
  scroll-margin-top: 90px;
}
</style>
