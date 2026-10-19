<template>
  <section
    ref="help"
    :id="id"
    class="playmat-help"
    :aria-label="t('heatInteractive.help')"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="row items-start justify-between q-gutter-sm">
      <h3 class="text-h6 q-ma-none" lang="pt-BR">{{ playmatTitle(topic) }}</h3>
      <q-badge v-if="step" outline color="primary">{{
        t(step.mandatory ? 'boardGames.mandatory' : 'boardGames.optional')
      }}</q-badge>
    </div>
    <div lang="pt-BR">
      <p v-if="topic.id === topic.ruleId" class="text-body2 q-mt-sm">{{ rule.summary }}</p>
      <h4 class="text-subtitle2 q-mb-xs">{{ t('heatInteractive.how') }}</h4>
      <ol class="q-pl-md q-mt-xs">
        <li v-for="instruction in topic.instructions" :key="instruction" class="q-mb-sm">
          {{ instruction }}
        </li>
      </ol>
      <p class="playmat-example text-body2">
        <strong>{{ t('heatInteractive.example') }}:</strong> {{ topic.example }}
      </p>
    </div>
    <div v-if="related.length" class="row q-gutter-xs" :aria-label="t('heatInteractive.related')">
      <q-btn
        v-for="item in related"
        :key="item.id"
        outline
        dense
        no-caps
        color="primary"
        :label="playmatTitle(item)"
        lang="pt-BR"
        @click="$emit('select', item.id)"
      />
    </div>
    <div class="row justify-between q-mt-md">
      <q-btn
        flat
        dense
        icon="chevron_left"
        :label="t('heatInteractive.previous')"
        :disable="!topic.step || topic.step === 1"
        @click="move(-1)"
      />
      <q-btn
        flat
        dense
        icon-right="chevron_right"
        :label="t('heatInteractive.next')"
        :disable="!topic.step || topic.step === 9"
        @click="move(1)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  heatPlaymatSteps,
  heatPlaymatTopics,
  playmatRule,
  playmatTitle,
} from 'src/data/heat-playmat';
import type { PlaymatTopic } from 'src/data/heat-playmat';

const props = defineProps<{ id: string; topic: PlaymatTopic }>();
const emit = defineEmits<{ select: [id: string] }>();
const { t } = useI18n();
const help = ref<HTMLElement | null>(null);
watch(
  () => props.topic.id,
  () => help.value?.scrollTo({ top: 0 }),
  { flush: 'post' },
);
const rule = computed(() => playmatRule(props.topic));
const step = computed(() => heatPlaymatSteps.find((step) => step.ruleId === props.topic.id));
const related = computed(() =>
  (props.topic.related ?? []).flatMap(
    (id) => heatPlaymatTopics.find((topic) => topic.id === id) ?? [],
  ),
);
function move(delta: number) {
  const next = heatPlaymatSteps.find((step) => step.step === (props.topic.step ?? 0) + delta);
  if (next) emit('select', next.ruleId);
}
</script>

<style scoped>
.playmat-help {
  padding: 20px;
  overflow-wrap: anywhere;
  scroll-margin-top: 90px;
}
.playmat-example {
  background: var(--sa-primary-soft);
  border-radius: 10px;
  padding: 12px;
}
</style>
