<template>
  <figure class="potion-preview q-ma-none" :lang="contentLanguage">
    <img
      v-if="image"
      :src="image"
      :alt="potion.name"
      width="110"
      height="150"
      loading="lazy"
      decoding="async"
      class="potion-image q-mb-sm"
    />
    <figcaption class="text-body2 text-weight-medium">{{ potion.name }}</figcaption>
  </figure>
</template>
<script setup lang="ts">
import type { BoardGamePotion } from 'src/types/board-games';
defineProps<{ potion: BoardGamePotion; image: string | undefined; contentLanguage: string }>();
</script>
<style scoped>
.potion-preview {
  text-align: center;
  overflow-wrap: anywhere;
}
.potion-image {
  display: block;
  width: 100%;
  height: 150px;
  object-fit: contain;
}
</style>
