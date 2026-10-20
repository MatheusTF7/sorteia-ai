<template>
  <span class="brand-logo" :class="`brand-logo--${variant}`" role="img" aria-label="Sorteia Aí">
    <template v-if="variant === 'header'">
      <img
        class="gt-xs brand-logo__symbol"
        src="logos/sorteia-ai-logo-min.png"
        width="600"
        height="600"
        alt=""
      />
      <img
        class="brand-logo__name"
        src="logos/sorteia-ai-logo-name.png"
        width="1080"
        height="388"
        alt=""
      />
    </template>
    <img
      v-else
      class="brand-logo__full"
      src="logos/sorteia-ai-logo-full.png"
      width="1080"
      height="1080"
      alt=""
    />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'header' | 'full' }>(), { variant: 'full' });
</script>

<style scoped lang="scss">
.brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  flex-shrink: 0;
  // A light backing preserves the original purple lettering in dark mode.
  background: #fff;
  border-radius: 12px;
  padding: 6px 10px;
}

.brand-logo--header {
  gap: 8px;
  height: 52px;
}

.brand-logo img {
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}

.brand-logo__symbol {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.brand-logo__name {
  width: 112px;
  height: 40px;
}

.brand-logo--full {
  padding: 12px;
  width: 200px;
  max-width: 100%;
  aspect-ratio: 1;
}

.brand-logo__full {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
}

@media (max-width: 399px) {
  .brand-logo--header {
    padding: 4px;
  }

  .brand-logo__name {
    display: none;
  }
}
</style>
