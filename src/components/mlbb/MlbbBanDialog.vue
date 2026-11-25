<template>
  <q-dialog
    v-model="open"
    :maximized="$q.screen.lt.md"
    :transition-show="compact ? 'slide-up' : 'scale'"
    :transition-hide="compact ? 'slide-down' : 'scale'"
    @hide="reset"
  >
    <div class="ban-phase" :class="{ compact }" :aria-label="t('mlbb.banPhaseTitle')">
      <header class="ban-header">
        <q-icon name="block" class="title-icon" />
        <div class="ban-title">
          <h2>{{ t('mlbb.banPhaseTitle') }}</h2>
          <p v-if="!compact">{{ t('mlbb.banPhaseHint') }}</p>
        </div>
        <q-btn
          v-close-popup
          flat
          round
          dense
          icon="close"
          class="header-close"
          :aria-label="t('mlbb.banDone')"
        />
      </header>

      <section class="ban-slots" :aria-label="t('mlbb.banSlots', { count: banned.length })">
        <span class="slots-label"><q-icon name="block" size="16px" />{{ banned.length }}</span>
        <div class="slots-row">
          <span v-if="!banned.length" class="slots-empty">{{ t('mlbb.banNone') }}</span>
          <button
            v-for="hero in bannedHeroes"
            :key="hero.id"
            type="button"
            class="slot"
            :title="t('mlbb.banRemove', { hero: hero.name })"
            :aria-label="t('mlbb.banRemove', { hero: hero.name })"
            @click="toggle(hero.id)"
          >
            <img :src="mlbbHeroImage(hero)" alt="" />
            <q-icon name="close" size="12px" />
          </button>
        </div>
      </section>

      <section class="ban-filters">
        <div class="search-row">
          <q-input
            v-model="query"
            :dark="dark"
            dense
            outlined
            clearable
            :autofocus="!compact"
            class="filter-search"
            :placeholder="t('mlbb.banSearch')"
            :aria-label="t('mlbb.banSearch')"
            ><template #prepend><q-icon name="search" /></template
          ></q-input>
          <q-btn
            v-if="compact"
            outline
            no-caps
            class="filters-button"
            :class="{ active: filtersOpen || activeFilters }"
            icon="tune"
            :aria-expanded="filtersOpen"
            aria-controls="ban-extra-filters"
            :aria-label="t('mlbb.banFilters')"
            @click="filtersOpen = !filtersOpen"
            ><q-badge v-if="activeFilters" floating rounded class="filters-badge">{{
              activeFilters
            }}</q-badge></q-btn
          >
        </div>
        <div class="role-tabs" role="tablist" :aria-label="t('mlbb.banRoleFilter')">
          <button
            v-for="role in roleTabs"
            :key="role.value"
            type="button"
            role="tab"
            class="role-tab"
            :class="{ active: role.value === roleFilter }"
            :aria-selected="role.value === roleFilter"
            @click="roleFilter = role.value"
          >
            {{ role.label }} <small>{{ role.count }}</small>
          </button>
        </div>
        <q-slide-transition>
          <div v-show="!compact || filtersOpen" id="ban-extra-filters" class="extra-filters">
            <q-select
              v-model="sortBy"
              :dark="dark"
              dense
              outlined
              emit-value
              map-options
              options-dense
              class="filter-sort"
              :options="sortOptions"
              :label="t('mlbb.banSort')"
            />
            <div class="filter-toggles">
              <q-toggle
                v-model="onlyBanned"
                :dark="dark"
                dense
                color="negative"
                :label="t('mlbb.banOnlyBanned')"
              />
              <q-toggle
                v-model="onlyAllowed"
                :dark="dark"
                dense
                color="amber-8"
                :label="t('mlbb.banOnlyAllowed')"
              />
            </div>
          </div>
        </q-slide-transition>
      </section>

      <section ref="gridWrap" class="ban-grid-wrap">
        <p v-if="!visibleHeroes.length" class="ban-empty">{{ t('mlbb.banEmpty') }}</p>
        <div class="ban-grid">
          <button
            v-for="hero in visibleHeroes"
            :key="hero.id"
            type="button"
            class="hero-card"
            :class="{ banned: isBanned(hero.id), outside: !inAllowedClass(hero) }"
            :aria-pressed="isBanned(hero.id)"
            :aria-label="
              t(isBanned(hero.id) ? 'mlbb.banRemove' : 'mlbb.banAdd', { hero: hero.name })
            "
            @click="toggle(hero.id)"
          >
            <img :src="mlbbHeroPortrait(hero)" alt="" loading="lazy" decoding="async" />
            <span class="card-shade" />
            <span v-if="isBanned(hero.id)" class="banned-mark"
              ><q-icon name="block" /><strong>{{ t('mlbb.banBanned') }}</strong></span
            >
            <span v-if="hero.stats" class="card-stat">{{ statLabel(hero) }}</span>
            <span class="card-info">
              <strong>{{ hero.name }}</strong>
              <small>{{ classLabel(hero) }}</small>
            </span>
          </button>
        </div>
      </section>

      <footer class="ban-footer">
        <span class="footer-count" aria-live="polite">{{
          t('mlbb.banSlots', { count: banned.length })
        }}</span>
        <q-btn
          flat
          no-caps
          class="footer-clear"
          icon="restart_alt"
          :disable="!banned.length"
          :label="compact ? undefined : t('mlbb.banClear')"
          :aria-label="t('mlbb.banClear')"
          @click="setBanned([])"
        />
        <q-btn
          v-close-popup
          unelevated
          no-caps
          class="ban-done"
          icon="check"
          :label="t('mlbb.banDone')"
        />
      </footer>
    </div>
  </q-dialog>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { mlbbHeroes, mlbbHeroImage, mlbbHeroPortrait } from 'src/data/mlbb/catalog';
import { MLBB_CLASSES } from 'src/utils/mlbb-heroes';
import type { MlbbHero } from 'src/utils/mlbb-heroes';
const open = defineModel<boolean>({ required: true });
const banned = defineModel<string[]>('banned', { required: true });
const props = defineProps<{ classes: string[]; overrides: Record<string, string[]> }>();
const { t, locale } = useI18n();
const $q = useQuasar();
const dark = computed(() => $q.dark.isActive);
/** Phone layout: collapsible filters, no autofocus (it would pop the keyboard). */
const compact = computed(() => $q.screen.lt.sm);

type SortKey = 'name' | 'winRate' | 'banRate' | 'pickRate';
const query = ref('');
const roleFilter = ref<string>('all');
const sortBy = ref<SortKey>('name');
const onlyBanned = ref(false);
const onlyAllowed = ref(false);
const filtersOpen = ref(false);
const gridWrap = ref<HTMLElement | null>(null);
const activeFilters = computed(
  () => Number(sortBy.value !== 'name') + Number(onlyBanned.value) + Number(onlyAllowed.value),
);
function reset() {
  query.value = '';
  filtersOpen.value = false;
}
// A new filter or order starts from the top instead of somewhere in the old list.
watch([roleFilter, sortBy, onlyBanned, onlyAllowed], () => gridWrap.value?.scrollTo({ top: 0 }));

function heroClasses(hero: MlbbHero) {
  return props.overrides[hero.id] ?? hero.classes;
}
function inAllowedClass(hero: MlbbHero) {
  return heroClasses(hero).some((id) => props.classes.includes(id));
}
function isBanned(id: string) {
  return banned.value.includes(id);
}
// The model only reflects a change after the parent re-renders, so quick successive taps
// build on the last value sent instead of a stale one.
let latest: string[] | null = null;
watch(banned, () => (latest = null));
function setBanned(value: string[]) {
  latest = value;
  banned.value = value;
}
function toggle(id: string) {
  const current = latest ?? banned.value;
  setBanned(current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
}
function classLabel(hero: MlbbHero) {
  const classes = heroClasses(hero);
  return classes.length
    ? classes.map((id) => t(`mlbb.classes.${id}`)).join(' / ')
    : t('mlbb.banUnclassified');
}
function percent(value: number) {
  return new Intl.NumberFormat(locale.value, { maximumFractionDigits: 1 }).format(value) + '%';
}
function statLabel(hero: MlbbHero) {
  const stats = hero.stats!;
  if (sortBy.value === 'banRate') return 'BR ' + percent(stats.banRate);
  if (sortBy.value === 'pickRate') return 'PR ' + percent(stats.pickRate);
  return 'WR ' + percent(stats.winRate);
}
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();
}

const bannedHeroes = computed(() =>
  banned.value.flatMap((id) => mlbbHeroes.filter((hero) => hero.id === id)),
);
const unclassifiedCount = computed(
  () => mlbbHeroes.filter((hero) => !heroClasses(hero).length).length,
);
const roleTabs = computed(() => [
  { value: 'all', label: t('mlbb.banAllRoles'), count: mlbbHeroes.length },
  ...MLBB_CLASSES.map((id) => ({
    value: id,
    label: t(`mlbb.classes.${id}`),
    count: mlbbHeroes.filter((hero) => heroClasses(hero).includes(id)).length,
  })),
  ...(unclassifiedCount.value
    ? [{ value: 'none', label: t('mlbb.banUnclassified'), count: unclassifiedCount.value }]
    : []),
]);
const sortOptions = computed(() => [
  { value: 'name', label: t('mlbb.banSortName') },
  { value: 'winRate', label: t('mlbb.banSortWinRate') },
  { value: 'banRate', label: t('mlbb.banSortBanRate') },
  { value: 'pickRate', label: t('mlbb.banSortPickRate') },
]);
const visibleHeroes = computed(() => {
  const term = normalize(query.value ?? '').trim();
  const key = sortBy.value;
  return mlbbHeroes
    .filter((hero) => {
      const classes = heroClasses(hero);
      if (
        roleFilter.value === 'none'
          ? classes.length
          : roleFilter.value !== 'all' && !classes.includes(roleFilter.value)
      )
        return false;
      if (onlyBanned.value && !isBanned(hero.id)) return false;
      if (onlyAllowed.value && !inAllowedClass(hero)) return false;
      return !term || normalize(hero.name).includes(term);
    })
    .sort((a, b) =>
      key === 'name'
        ? a.name.localeCompare(b.name)
        : (b.stats?.[key] ?? -1) - (a.stats?.[key] ?? -1) || a.name.localeCompare(b.name),
    );
});
</script>
<style scoped>
/* Light theme by default; the dark block below follows Quasar's body--dark class. */
.ban-phase {
  --ban-bg: linear-gradient(180deg, #ffffff 0%, #f3f5fa 100%);
  --ban-text: #0f172a;
  --ban-muted: #5b6b82;
  --ban-line: #e2e8f0;
  --ban-chip: #f1f5f9;
  --ban-accent: #b45309;
  --ban-accent-soft: #fef3c7;
  --ban-accent-line: #f59e0b;
  --ban-red: #dc2626;
  --ban-red-soft: #fef2f2;
  --ban-red-text: #b91c1c;
  --ban-card-line: #dbe2ec;
  --ban-shadow: 0 24px 60px #0f172a33;
  --ban-footer: #ffffffeb;
  --ban-on-accent: #ffffff;
  width: min(1180px, 100vw);
  max-width: 100vw;
  height: min(860px, 92vh);
  display: flex;
  flex-direction: column;
  color: var(--ban-text);
  background: var(--ban-bg);
  border: 1px solid var(--ban-line);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--ban-shadow);
  -webkit-tap-highlight-color: transparent;
}
body.body--dark .ban-phase {
  --ban-bg:
    radial-gradient(ellipse at top, #1e3a8a55, transparent 60%),
    linear-gradient(180deg, #0b1430 0%, #060b1d 100%);
  --ban-text: #f1f5f9;
  --ban-muted: #b6c2d9;
  --ban-line: #ffffff1f;
  --ban-chip: #ffffff0a;
  --ban-accent: #f2c86b;
  --ban-accent-soft: #f2c86b26;
  --ban-accent-line: #f2c86b;
  --ban-red: #ef4444;
  --ban-red-soft: #ef44440f;
  --ban-red-text: #fca5a5;
  --ban-card-line: #ffffff26;
  --ban-shadow: 0 24px 60px #00000080;
  --ban-footer: #070d22eb;
  --ban-on-accent: #1c1306;
  border-color: #f2c86b40;
}
.q-dialog__inner--maximized .ban-phase {
  width: 100vw;
  height: 100%;
  border: 0;
  border-radius: 0;
}

.ban-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px 12px 20px;
  padding-top: max(14px, env(safe-area-inset-top));
  border-bottom: 1px solid var(--ban-line);
}
.title-icon {
  font-size: 26px;
  color: var(--ban-red);
}
.ban-title {
  flex: 1;
  min-width: 0;
}
.ban-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--ban-accent);
}
.ban-title p {
  margin: 2px 0 0;
  color: var(--ban-muted);
  font-size: 0.8125rem;
}
.header-close {
  color: var(--ban-muted);
}

.ban-slots {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  background: var(--ban-red-soft);
  border-bottom: 1px solid var(--ban-line);
}
.slots-label {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--ban-red-text);
  font-variant-numeric: tabular-nums;
}
.slots-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  min-height: 40px;
  align-items: center;
  padding: 2px;
  scrollbar-width: none;
}
.slots-row::-webkit-scrollbar {
  display: none;
}
.slots-empty {
  color: var(--ban-muted);
  font-size: 0.8125rem;
}
.slot {
  position: relative;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 2px solid var(--ban-red);
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  cursor: pointer;
}
.slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) brightness(0.7);
}
.slot .q-icon {
  position: absolute;
  top: 1px;
  right: 1px;
  color: #fff;
  background: var(--ban-red);
  border-radius: 50%;
  width: 14px;
  height: 14px;
}

.ban-filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--ban-line);
}
.search-row {
  display: flex;
  gap: 8px;
}
.filter-search {
  flex: 1;
}
.filters-button {
  color: var(--ban-muted);
  border-radius: 8px;
  min-width: 44px;
}
.filters-button.active {
  color: var(--ban-accent);
}
.filters-badge {
  background: var(--ban-accent);
  color: var(--ban-on-accent);
}
.role-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  /* Fades the edges so a cut-off tab reads as scrollable. */
  mask-image: linear-gradient(90deg, #000 calc(100% - 24px), transparent);
}
.role-tabs::-webkit-scrollbar {
  display: none;
}
.role-tab {
  flex-shrink: 0;
  min-height: 36px;
  padding: 6px 14px;
  border: 1px solid var(--ban-line);
  border-radius: 999px;
  background: var(--ban-chip);
  color: var(--ban-muted);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  scroll-snap-align: start;
}
.role-tab small {
  opacity: 0.7;
  margin-left: 2px;
}
.role-tab.active {
  border-color: var(--ban-accent-line);
  background: var(--ban-accent-soft);
  color: var(--ban-accent);
}
.role-tab:last-child {
  margin-right: 24px;
}
.role-tab:focus-visible,
.hero-card:focus-visible,
.slot:focus-visible {
  outline: 2px solid var(--ban-accent-line);
  outline-offset: 2px;
}
.extra-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
}
.filter-sort {
  flex: 0 1 220px;
}
.filter-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.ban-grid-wrap {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 16px 20px;
}
.ban-empty {
  color: var(--ban-muted);
  text-align: center;
}
.ban-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  gap: 12px;
}
.hero-card {
  position: relative;
  aspect-ratio: 240 / 390;
  padding: 0;
  border: 2px solid var(--ban-card-line);
  border-radius: 10px;
  overflow: hidden;
  background: #0f172a;
  color: #f8fafc;
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    transform 0.12s ease,
    border-color 0.12s ease,
    box-shadow 0.12s ease;
}
@media (hover: hover) {
  .hero-card:hover {
    transform: translateY(-2px);
    border-color: var(--ban-accent-line);
    box-shadow: 0 6px 18px #f59e0b33;
  }
}
.hero-card:active {
  transform: scale(0.97);
}
.hero-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.15s ease;
}
.hero-card.outside img {
  filter: saturate(0.4) brightness(0.75);
}
.card-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, #000000d9 100%);
}
.card-info {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: 6px 8px 8px;
  text-align: left;
}
.card-info strong {
  font-size: 0.875rem;
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.card-info small {
  color: #cbd5e1;
  font-size: 0.6875rem;
  line-height: 1.3;
}
.card-stat {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #000000a6;
  font-size: 0.6875rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.hero-card.banned {
  border-color: var(--ban-red);
}
.hero-card.banned img {
  filter: grayscale(1) brightness(0.45);
}
.banned-mark {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 40px;
  color: #ef4444;
  background: #ef44441f;
  text-shadow: 0 1px 6px #000;
}
.banned-mark strong {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #fecaca;
  text-transform: uppercase;
}

.ban-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 10px 20px;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
  border-top: 1px solid var(--ban-line);
  background: var(--ban-footer);
  backdrop-filter: blur(8px);
}
.footer-count {
  flex: 1;
  color: var(--ban-red-text);
  font-size: 0.875rem;
  font-weight: 700;
}
.footer-clear {
  color: var(--ban-muted);
}
.ban-done {
  background: linear-gradient(180deg, #f6d68a, #d9a441);
  color: #1c1306;
  font-weight: 700;
  min-height: 40px;
  padding: 0 18px;
}

/* Phones: tighter spacing, three cards per row and larger touch targets. */
.compact .ban-header {
  padding-left: 14px;
  padding-right: 8px;
}
.compact .ban-title h2 {
  font-size: 1.0625rem;
}
.compact .ban-slots,
.compact .ban-filters,
.compact .ban-grid-wrap {
  padding-left: 12px;
  padding-right: 12px;
}
.compact .ban-filters {
  gap: 8px;
  padding-top: 10px;
  padding-bottom: 10px;
}
.compact .extra-filters {
  flex-direction: column;
  align-items: stretch;
  padding-top: 2px;
}
.compact .filter-sort {
  flex-basis: auto;
}
.compact .filter-toggles {
  flex-direction: column;
  gap: 12px;
  padding: 4px 2px;
}
.compact .ban-grid-wrap {
  padding-top: 12px;
  padding-bottom: 12px;
}
.compact .ban-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.compact .card-info {
  padding: 4px 6px 6px;
}
.compact .card-info strong {
  font-size: 0.8125rem;
}
.compact .card-info small {
  font-size: 0.625rem;
}
.compact .card-stat {
  top: 4px;
  right: 4px;
  font-size: 0.625rem;
}
.compact .banned-mark {
  font-size: 30px;
}
.compact .ban-footer {
  padding-left: 14px;
  padding-right: 12px;
}
@media (prefers-reduced-motion: reduce) {
  .hero-card,
  .hero-card img {
    transition: none;
  }
  .hero-card:hover,
  .hero-card:active {
    transform: none;
  }
}
</style>
