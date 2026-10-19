<template>
  <q-card flat bordered class="playmat-reference">
    <q-card-section>
      <div class="row items-center justify-between q-gutter-sm">
        <h2 class="text-h6 q-ma-none">{{ t('heatInteractive.title') }}</h2>
        <q-btn
          outline
          color="primary"
          icon="open_in_full"
          :label="t('heatInteractive.open')"
          @click="openViewer"
        />
      </div>
      <p class="text-body2 q-mt-sm q-mb-none">{{ t('heatInteractive.hint') }}</p>
      <p class="text-caption playmat-hint q-mt-xs q-mb-none">
        {{ t('heatInteractive.scrollHint') }}
      </p>
    </q-card-section>
    <div v-if="!expanded">
      <div class="inline-playmat q-px-md">
        <HeatPlaymatCanvas :active="active" :help-id="inlineHelpId" @select="select" />
      </div>
      <nav class="step-navigation q-pa-md" :aria-label="t('boardGames.playerAid')" lang="pt-BR">
        <q-btn
          v-for="step in heatPlaymatSteps"
          :key="step.ruleId"
          :outline="active !== step.ruleId"
          :unelevated="active === step.ruleId"
          color="primary"
          no-caps
          :label="playmatTitle(step.topic)"
          :aria-pressed="active === step.ruleId"
          :aria-controls="inlineHelpId"
          @click="select(step.ruleId)"
        />
      </nav>
      <HeatPlaymatHelp :id="inlineHelpId" :topic="topic" @select="select" />
    </div>
    <q-dialog v-model="expanded" maximized @before-hide="releaseOrientation">
      <div ref="viewer" class="interactive-viewer">
        <header class="viewer-toolbar">
          <div class="row items-center justify-between no-wrap q-gutter-sm">
            <h2 class="text-subtitle1 text-weight-bold q-ma-none">
              {{ t('heatInteractive.title') }}
            </h2>
            <q-btn
              flat
              round
              icon="close"
              :aria-label="t('heatVisuals.close')"
              @click="expanded = false"
            />
          </div>
          <div class="row items-center q-gutter-xs">
            <q-btn
              outline
              dense
              no-caps
              icon="screen_rotation"
              :label="t('heatInteractive.rotate')"
              :aria-pressed="rotated"
              @click="rotated = !rotated"
            />
            <q-btn
              outline
              dense
              no-caps
              :icon="locked ? 'lock_open' : 'screen_lock_rotation'"
              :label="t(locked ? 'heatInteractive.unlock' : 'heatInteractive.lock')"
              :loading="pending"
              @click="toggleLock"
            />
            <label class="topic-picker">
              <span class="text-caption">{{ t('heatInteractive.choose') }}</span>
              <select
                v-model="active"
                class="topic-select"
                lang="pt-BR"
                :aria-controls="expandedHelpId"
              >
                <option v-for="option in topicOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>
          <p v-if="message" role="status" class="text-caption q-mt-sm q-mb-none">
            {{ t(message) }}
          </p>
        </header>
        <div class="viewer-body">
          <div class="viewer-stage">
            <HeatPlaymatCanvas
              :active="active"
              :help-id="expandedHelpId"
              fit
              :rotated="rotated"
              @select="select"
            />
          </div>
          <HeatPlaymatHelp
            :id="expandedHelpId"
            :topic="topic"
            class="viewer-help"
            @select="select"
          />
        </div>
      </div>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue';
import { useI18n } from 'vue-i18n';
import HeatPlaymatCanvas from './HeatPlaymatCanvas.vue';
import HeatPlaymatHelp from './HeatPlaymatHelp.vue';
import { heatPlaymatTopics, heatPlaymatSteps, playmatTitle } from 'src/data/heat-playmat';
import { usePlaymatOrientation } from 'src/composables/usePlaymatOrientation';

const { t } = useI18n();
const id = useId();
const inlineHelpId = id + '-inline-help';
const expandedHelpId = id + '-expanded-help';
const expanded = ref(false);
const rotated = ref(false);
const active = ref('gear');
const viewer = ref<HTMLElement | null>(null);
const { locked, pending, message, toggleLock, release } = usePlaymatOrientation(viewer);
const topic = computed(
  () => heatPlaymatTopics.find((topic) => topic.id === active.value) ?? heatPlaymatTopics[0]!,
);
const topicOptions = heatPlaymatTopics.map((topic) => ({
  label: playmatTitle(topic),
  value: topic.id,
}));
function select(id: string) {
  if (!heatPlaymatTopics.some((topic) => topic.id === id)) return;
  active.value = id;
  if (!expanded.value) {
    void nextTick(() => {
      document.getElementById(inlineHelpId)?.scrollIntoView({
        block: 'nearest',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
  }
}
function openViewer() {
  rotated.value = window.matchMedia('(max-width: 899px) and (orientation: portrait)').matches;
  expanded.value = true;
}
function releaseOrientation() {
  void release();
}
</script>

<style scoped>
.playmat-reference {
  container-type: inline-size;
}
.inline-playmat {
  display: none;
}
@media (min-width: 1024px) and (hover: hover) and (pointer: fine) {
  @container (min-width: 792px) {
    .inline-playmat {
      display: block;
    }
  }
}
.playmat-hint {
  color: var(--sa-text-muted);
}
.step-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-bottom: 1px solid var(--sa-border);
}
.interactive-viewer {
  width: 100%;
  height: 100%;
  height: 100dvh;
  max-width: none !important;
  max-height: none !important;
  display: flex;
  flex-direction: column;
  background: var(--sa-surface-strong);
  color: var(--sa-text);
  overflow: hidden;
}
.viewer-toolbar {
  flex: none;
  padding: 8px max(16px, env(safe-area-inset-right)) 12px max(16px, env(safe-area-inset-left));
  background: var(--sa-surface-strong);
  border-bottom: 1px solid var(--sa-border);
}
.topic-select {
  width: 220px;
  max-width: 100%;
  min-height: 44px;
  padding: 8px;
  border: 1px solid var(--sa-border);
  border-radius: 6px;
  background: var(--sa-surface-strong);
  color: var(--sa-text);
  font: inherit;
}
.topic-picker {
  display: flex;
  flex-direction: column;
}
.viewer-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
}
.viewer-stage {
  min-height: 0;
  min-width: 0;
  padding: 12px;
  background: #101720;
}
.viewer-help {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  background: var(--sa-surface-strong);
}
@media (max-width: 899px) and (orientation: portrait) {
  .viewer-body {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) minmax(120px, 34%);
  }
  .viewer-stage {
    padding: 8px;
  }
  .viewer-help {
    border-top: 1px solid var(--sa-border);
  }
  .topic-picker {
    flex: 1 1 100%;
    width: 100%;
  }
  .topic-select {
    width: 100%;
  }
}
@media (orientation: landscape) and (max-height: 500px) {
  .viewer-body {
    grid-template-columns: minmax(0, 1fr) 38%;
  }
  .viewer-toolbar {
    padding-top: 0;
    padding-bottom: 6px;
  }
  .viewer-toolbar h2 {
    font-size: 14px;
  }
  .viewer-help {
    padding: 12px;
  }
  .topic-select {
    width: 180px;
  }
}
</style>
