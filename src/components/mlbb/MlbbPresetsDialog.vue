<template>
  <q-dialog v-model="open" :maximized="$q.screen.lt.sm" @hide="query = ''">
    <q-card class="presets-dialog">
      <q-card-section class="presets-header">
        <div>
          <h2>{{ t('mlbb.presetsDialogTitle') }}</h2>
          <p>
            {{
              t('mlbb.availablePresets', { count: eligibleIds.size, total: mlbbDuelPresets.length })
            }}
          </p>
        </div>
        <q-btn v-close-popup flat round dense icon="close" :aria-label="t('mlbb.presetsClose')" />
      </q-card-section>
      <q-card-section class="presets-filters">
        <q-input v-model="query" outlined dense clearable autofocus :label="t('mlbb.presetsSearch')"
          ><template #prepend><q-icon name="search" /></template
        ></q-input>
        <q-toggle v-model="onlyAvailable" :label="t('mlbb.presetsOnlyAvailable')" />
      </q-card-section>
      <q-separator />
      <q-card-section class="presets-list">
        <p v-if="!rows.length" class="presets-empty">{{ t('mlbb.presetsEmpty') }}</p>
        <article
          v-for="row in rows"
          :key="row.preset.id"
          class="preset-row"
          :class="{ unavailable: !row.available }"
        >
          <div class="preset-heroes">
            <div v-for="hero in row.heroes" :key="hero.id" class="preset-hero">
              <q-avatar size="44px"><img :src="mlbbHeroImage(hero)" :alt="hero.name" /></q-avatar>
              <strong>{{ hero.name }}</strong>
              <small>{{ classLabel(hero) }}</small>
            </div>
            <span class="versus" aria-hidden="true">×</span>
          </div>
          <div class="preset-copy">
            <strong>{{ presetText(row.preset.title, locale) }}</strong>
            <p>{{ presetText(row.preset.description, locale) }}</p>
            <div class="preset-tags">
              <span v-if="row.counter" class="tag counter"
                ><q-icon name="bolt" size="14px" />{{ row.counter }}</span
              >
              <span v-for="reason in row.reasons" :key="reason" class="tag blocked"
                ><q-icon name="block" size="14px" />{{ reason }}</span
              >
            </div>
          </div>
        </article>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { mlbbDuelPresets, mlbbHeroes, mlbbHeroImage, presetText } from 'src/data/mlbb/catalog';
import { MLBB_CLASSES, counterRelations, eligiblePresets } from 'src/utils/mlbb-heroes';
import type { MlbbHero, MlbbHeroSettings } from 'src/utils/mlbb-heroes';
const open = defineModel<boolean>({ required: true });
const props = defineProps<{ settings: MlbbHeroSettings }>();
const { t, locale } = useI18n();
const query = ref('');
const onlyAvailable = ref(false);
const eligibleIds = computed(
  () =>
    new Set(
      eligiblePresets(mlbbHeroes, props.settings, mlbbDuelPresets).map(({ preset }) => preset.id),
    ),
);
function heroClasses(hero: MlbbHero) {
  return props.settings.overrides[hero.id] ?? hero.classes;
}
function classLabel(hero: MlbbHero) {
  return heroClasses(hero)
    .map((id) => t(`mlbb.classes.${id}`))
    .join(' / ');
}
/** Search ignores case and accents, matching hero names and matchup texts. */
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();
}
const allRows = computed(() =>
  mlbbDuelPresets.flatMap((preset) => {
    const heroes = preset.heroes.map((id) => mlbbHeroes.find((hero) => hero.id === id));
    const [a, b] = heroes;
    if (!a || !b) return [];
    const relations = counterRelations(a, b);
    const counter = relations.aCountersB
      ? t('mlbb.counterWarning', { counter: a.name, hero: b.name })
      : relations.bCountersA
        ? t('mlbb.counterWarning', { counter: b.name, hero: a.name })
        : '';
    const reasons = [a, b].flatMap((hero) =>
      props.settings.bannedIds.includes(hero.id)
        ? [t('mlbb.presetBanned', { hero: hero.name })]
        : MLBB_CLASSES.some(
              (id) => props.settings.classes.includes(id) && heroClasses(hero).includes(id),
            )
          ? []
          : [t('mlbb.presetClassBlocked', { hero: hero.name })],
    );
    const search = normalize(
      [a.name, b.name, ...Object.values(preset.title), ...Object.values(preset.description)].join(
        ' ',
      ),
    );
    return [
      {
        preset,
        heroes: [a, b],
        counter,
        reasons,
        search,
        available: eligibleIds.value.has(preset.id),
      },
    ];
  }),
);
const rows = computed(() => {
  const term = normalize(query.value ?? '').trim();
  return allRows.value
    .filter(
      (row) => (!onlyAvailable.value || row.available) && (!term || row.search.includes(term)),
    )
    .sort(
      (x, y) =>
        Number(y.available) - Number(x.available) ||
        presetText(x.preset.title, locale.value).localeCompare(
          presetText(y.preset.title, locale.value),
        ),
    );
});
</script>
<style scoped>
.presets-dialog {
  --presets-muted: #64748b;
  --presets-border: #e2e8f0;
  --presets-soft: #f8fafc;
  --presets-accent: #4338ca;
  --presets-counter: #d97706;
  --presets-counter-bg: #fffbeb;
  --presets-counter-text: #92400e;
  width: min(760px, 100vw);
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
:global(body.body--dark) .presets-dialog {
  --presets-muted: #a3b1c6;
  --presets-border: #2a3650;
  --presets-soft: #131e33;
  --presets-accent: #c7d2fe;
  --presets-counter: #fbbf24;
  --presets-counter-bg: #451a0340;
  --presets-counter-text: #fde68a;
}
.q-dialog__inner--maximized .presets-dialog {
  max-height: none;
}
.presets-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.presets-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0;
}
.presets-header p,
.presets-empty {
  color: var(--presets-muted);
  font-size: 0.875rem;
  margin: 4px 0 0;
}
.presets-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  padding-top: 0;
}
.presets-filters .q-input {
  flex: 1 1 260px;
}
.presets-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.preset-row {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--presets-border);
  border-radius: 10px;
  background: var(--presets-soft);
}
.preset-row.unavailable {
  opacity: 0.6;
}
.preset-heroes {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.versus {
  position: absolute;
  left: 50%;
  top: 22px;
  transform: translate(-50%, -50%);
  color: var(--presets-muted);
  font-weight: 700;
}
.preset-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 0;
  gap: 2px;
}
.preset-hero strong {
  font-size: 0.875rem;
  overflow-wrap: anywhere;
}
.preset-hero small {
  color: var(--presets-muted);
  font-size: 0.75rem;
}
.preset-copy > strong {
  color: var(--presets-accent);
  font-size: 0.9375rem;
}
.preset-copy p {
  margin: 2px 0 0;
  color: var(--presets-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}
.preset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.preset-tags:empty {
  display: none;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.tag.counter {
  background: var(--presets-counter-bg);
  color: var(--presets-counter-text);
  border: 1px solid var(--presets-counter);
}
.tag.blocked {
  border: 1px solid var(--presets-border);
  color: var(--presets-muted);
}
@media (max-width: 599px) {
  .preset-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .preset-copy {
    text-align: center;
  }
  .preset-tags {
    justify-content: center;
  }
}
</style>
