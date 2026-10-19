<template>
  <div
    ref="viewport"
    class="playmat-viewport"
    :class="{ 'playmat-viewport--fit': fit }"
    :aria-label="t('heatInteractive.map')"
    role="group"
  >
    <div
      class="playmat-artwork"
      :class="{ 'playmat-artwork--fit': fit, 'playmat-artwork--rotated': rotated && fit }"
      :style="artworkStyle"
    >
      <img
        :src="playmat"
        :alt="t('heatVisuals.playmatAlt')"
        width="2171"
        height="1434"
        decoding="async"
        class="playmat-image"
      />
      <button
        v-for="topic in hotspots"
        :key="topic.id"
        type="button"
        class="playmat-hotspot"
        :class="{ 'playmat-hotspot--active': active === topic.id }"
        :style="{
          left: `${topic.x}%`,
          top: `${topic.y}%`,
          width: `${topic.width}%`,
          height: `${topic.height}%`,
        }"
        :aria-label="playmatTitle(topic)"
        :title="playmatTitle(topic)"
        :aria-pressed="active === topic.id"
        :aria-controls="helpId"
        @click="$emit('select', topic.id)"
      >
        <span class="hotspot-label">{{ topic.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import playmat from 'src/assets/heat-pedal-to-the-metal/playmat.jpg';
import { heatPlaymatTopics, playmatTitle } from 'src/data/heat-playmat';
import { fitPlaymat } from 'src/utils/playmat-layout';

const props = withDefaults(
  defineProps<{ active: string; helpId: string; fit?: boolean; rotated?: boolean }>(),
  { fit: false, rotated: false },
);
defineEmits<{ select: [id: string] }>();
const { t } = useI18n();
const viewport = ref<HTMLElement | null>(null);
const size = ref({ width: 0, height: 0 });
const hotspots = heatPlaymatTopics.filter((topic) => topic.width > 0);
let observer: ResizeObserver | undefined;
const artworkStyle = computed(() => {
  if (!props.fit) return {};
  const fitted = fitPlaymat(size.value.width, size.value.height, props.rotated);
  return { width: `${fitted.width}px`, height: `${fitted.height}px` };
});
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    if (entry) size.value = { width: entry.contentRect.width, height: entry.contentRect.height };
  });
  if (viewport.value) observer.observe(viewport.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped>
.playmat-viewport {
  overflow: auto;
  border-radius: 12px;
}
.playmat-artwork {
  position: relative;
  width: 100%;
  min-width: 760px;
  aspect-ratio: 2171 / 1434;
}
.playmat-image {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 12px;
}
.playmat-hotspot {
  position: absolute;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 3px;
  border: 2px solid rgba(255, 224, 130, 0.85);
  border-radius: 16%;
  background: rgba(0, 0, 0, 0.06);
  color: #fff;
  cursor: pointer;
  transition:
    background 0.15s,
    box-shadow 0.15s;
}
.playmat-hotspot:hover,
.playmat-hotspot--active {
  background: rgba(255, 193, 7, 0.18);
  box-shadow: inset 0 0 0 2px #ffca28;
}
.playmat-hotspot:focus-visible {
  outline: 4px solid #fff;
  outline-offset: 2px;
  z-index: 2;
}
.hotspot-label {
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 4px;
  border-radius: 6px;
  background: #17202c;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 1px 4px #0008;
}
.playmat-hotspot--active .hotspot-label {
  background: #ffca28;
  color: #17202c;
}
.playmat-viewport--fit {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0;
}
.playmat-artwork--fit {
  position: absolute;
  left: 50%;
  top: 50%;
  min-width: 0;
  transform: translate(-50%, -50%);
}
.playmat-artwork--rotated {
  transform: translate(-50%, -50%) rotate(90deg);
}
.playmat-artwork--fit .playmat-hotspot {
  padding: 1px;
  overflow: hidden;
}
.playmat-artwork--fit .hotspot-label {
  min-width: 16px;
  height: 18px;
  padding: 0 2px;
  font-size: 11px;
}
@media (prefers-reduced-motion: reduce) {
  .playmat-hotspot {
    transition: none;
  }
}
</style>
