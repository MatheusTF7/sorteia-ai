<template>
  <q-item
    v-if="isExternalLink(link)"
    clickable
    tag="a"
    target="_blank"
    :href="link"
    class="modern-item"
  >
    <q-item-section v-if="icon" avatar class="item-icon-section">
      <q-icon :name="icon" size="24px" />
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-weight-bold">{{ title }}</q-item-label>
      <q-item-label caption class="text-caption" style="font-size: 12px; opacity: 0.8">{{
        caption
      }}</q-item-label>
    </q-item-section>
  </q-item>
  <q-item v-else clickable :to="link" class="modern-item">
    <q-item-section v-if="icon" avatar class="item-icon-section">
      <q-icon :name="icon" size="24px" />
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-weight-bold">{{ title }}</q-item-label>
      <q-item-label caption class="text-caption" style="font-size: 12px; opacity: 0.8">{{
        caption
      }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
}

withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
});

function isExternalLink(url: string): boolean {
  return /^(https?:)?\/\//.test(url);
}
</script>

<style scoped>
.modern-item {
  border-radius: 12px;
  margin: 8px 0;
  transition: all 0.3s ease;
}

.item-icon-section {
  min-width: 44px;
  padding-right: 12px;
}

body.body--dark .modern-item:not(.q-router-link--active):hover {
  background: rgba(255, 255, 255, 0.05);
}

body:not(.body--dark) .modern-item:not(.q-router-link--active):hover {
  background: rgba(0, 0, 0, 0.03);
}
</style>
