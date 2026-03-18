<template>
  <section class="page-hero" :class="heroClasses">
    <div class="page-hero__main">
      <div v-if="eyebrow" class="page-hero__eyebrow">{{ eyebrow }}</div>

      <div class="page-hero__headline">
        <div v-if="icon" class="page-hero__icon">
          <q-icon :name="icon" />
        </div>

        <div class="page-hero__copy">
          <h1 class="page-hero__title">{{ title }}</h1>
          <p v-if="subtitle" class="page-hero__subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <div v-if="$slots.default" class="page-hero__body">
        <slot />
      </div>

      <div v-if="$slots.meta" class="page-hero__meta">
        <slot name="meta" />
      </div>
    </div>

    <div v-if="$slots.actions" class="page-hero__actions">
      <slot name="actions" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    subtitle?: string;
    icon?: string;
    tone?: 'default' | 'primary' | 'success' | 'warning';
    compact?: boolean;
  }>(),
  {
    eyebrow: '',
    subtitle: '',
    icon: '',
    tone: 'default',
    compact: false,
  },
);

const heroClasses = computed(() => ({
  'page-hero--compact': props.compact,
  [`page-hero--${props.tone}`]: true,
}));
</script>
