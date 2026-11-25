<template>
  <div class="hero-duel">
    <template v-if="pick">
      <div class="hero-class">{{ t('mlbb.classes.' + pick.classId) }}</div>
      <div class="hero-pair">
        <div
          v-for="(hero, index) in heroes"
          :key="index"
          class="hero-slot"
          :class="{ 'is-counter': countering[index] }"
        >
          <div class="hero-avatar">
            <q-avatar size="52px"
              ><img v-if="hero" :src="mlbbHeroImage(hero)" :alt="hero.name"
            /></q-avatar>
            <span v-if="countering[index]" class="counter-badge">{{ t('mlbb.counterBadge') }}</span>
          </div>
          <strong>{{ hero?.name }}</strong
          ><small>{{ index === 0 ? labelA : labelB }}</small>
          <span
            v-if="hero?.stats"
            class="hero-stats"
            :title="
              t('mlbb.heroStatsTitle', {
                wr: percent(hero.stats.winRate),
                pr: percent(hero.stats.pickRate),
                br: percent(hero.stats.banRate),
              })
            "
            >WR {{ percent(hero.stats.winRate) }} · PR {{ percent(hero.stats.pickRate) }} · BR
            {{ percent(hero.stats.banRate) }}</span
          >
        </div>
      </div>
      <div v-if="counterWarnings.length" class="counter-alert" role="note">
        <q-icon name="bolt" size="22px" />
        <div>
          <strong>{{ t('mlbb.counterAlertTitle') }}</strong>
          <span v-for="warning in counterWarnings" :key="warning">{{ warning }}</span>
        </div>
      </div>
    </template>
    <p v-else>{{ t(disabled ? 'mlbb.noHistoricalPick' : 'mlbb.noHeroPool') }}</p>
    <q-btn
      v-if="!disabled"
      flat
      dense
      color="primary"
      icon="shuffle"
      :label="t('mlbb.redrawHeroes')"
      @click="$emit('redraw')"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { mlbbHeroes, mlbbHeroImage } from 'src/data/mlbb/catalog';
import { counterRelations } from 'src/utils/mlbb-heroes';
import type { MlbbHeroPick } from 'src/utils/mlbb-heroes';
const props = defineProps<{
  pick: MlbbHeroPick | undefined;
  disabled: boolean;
  labelA: string;
  labelB: string;
}>();
defineEmits<{ redraw: [] }>();
const { t, locale } = useI18n();
const heroes = computed(() =>
  [props.pick?.heroAId, props.pick?.heroBId].map((id) => mlbbHeroes.find((hero) => hero.id === id)),
);
const relations = computed(() => {
  const [a, b] = heroes.value;
  return a && b ? counterRelations(a, b) : { aCountersB: false, bCountersA: false };
});
/** Whether the hero in each slot counters the other one. */
const countering = computed(() => [relations.value.aCountersB, relations.value.bCountersA]);
const counterWarnings = computed(() => {
  const [a, b] = heroes.value;
  if (!a || !b) return [];
  return [
    ...(relations.value.aCountersB
      ? [t('mlbb.counterWarning', { counter: a.name, hero: b.name })]
      : []),
    ...(relations.value.bCountersA
      ? [t('mlbb.counterWarning', { counter: b.name, hero: a.name })]
      : []),
  ];
});
function percent(value: number) {
  return new Intl.NumberFormat(locale.value, { maximumFractionDigits: 2 }).format(value) + '%';
}
</script>
<style scoped>
.hero-duel {
  border-top: 1px solid var(--mlbb-border);
  padding: 12px 14px;
  text-align: center;
}
.hero-class {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--mlbb-accent-text);
  margin-bottom: 12px;
}
.hero-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.hero-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.hero-slot strong,
.hero-slot small {
  overflow-wrap: anywhere;
  max-width: 100%;
  font-size: 0.875rem;
}
.hero-slot small,
.hero-stats,
p {
  color: var(--mlbb-muted);
  font-size: 0.8125rem;
}
.hero-stats {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
}
.hero-avatar {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero-avatar .q-avatar {
  border-radius: 50%;
}
.is-counter .q-avatar {
  box-shadow:
    0 0 0 3px var(--mlbb-counter, #d97706),
    0 0 14px 2px var(--mlbb-counter-glow, #f59e0b66);
}
.counter-badge {
  margin-top: -9px;
  position: relative;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--mlbb-counter, #d97706);
  color: var(--mlbb-counter-on, #fff);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.5;
}
.counter-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid var(--mlbb-counter-border, #fcd34d);
  border-left-width: 4px;
  border-left-color: var(--mlbb-counter, #d97706);
  border-radius: 8px;
  background: var(--mlbb-counter-bg, #fffbeb);
  color: var(--mlbb-counter-text, #92400e);
  text-align: left;
  font-size: 0.875rem;
  line-height: 1.45;
}
.counter-alert .q-icon {
  color: var(--mlbb-counter, #d97706);
  flex-shrink: 0;
}
.counter-alert > div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.counter-alert strong {
  font-weight: 700;
}
.q-btn {
  margin-top: 8px;
}
</style>
