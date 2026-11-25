<template>
  <q-dialog v-model="open" :maximized="$q.screen.lt.md" @hide="query = ''">
    <div class="ban-phase" :aria-label="t('mlbb.banPhaseTitle')">
      <header class="ban-header">
        <div class="ban-title">
          <q-icon name="block" size="26px" />
          <div>
            <h2>{{ t('mlbb.banPhaseTitle') }}</h2>
            <p>{{ t('mlbb.banPhaseHint') }}</p>
          </div>
        </div>
        <div class="ban-actions">
          <q-btn
            flat
            no-caps
            color="white"
            icon="restart_alt"
            :disable="!banned.length"
            :label="t('mlbb.banClear')"
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
        </div>
      </header>

      <section class="ban-slots" :aria-label="t('mlbb.banSlots', { count: banned.length })">
        <span class="slots-label">{{ t('mlbb.banSlots', { count: banned.length }) }}</span>
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
            <q-icon name="close" size="14px" />
          </button>
        </div>
      </section>

      <section class="ban-filters">
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
        <div class="filter-row">
          <q-input
            v-model="query"
            dark
            dense
            outlined
            clearable
            autofocus
            class="filter-search"
            :label="t('mlbb.banSearch')"
            ><template #prepend><q-icon name="search" /></template
          ></q-input>
          <q-select
            v-model="sortBy"
            dark
            dense
            outlined
            emit-value
            map-options
            class="filter-sort"
            :options="sortOptions"
            :label="t('mlbb.banSort')"
          />
          <div class="filter-toggles">
            <q-toggle
              v-model="onlyBanned"
              dark
              dense
              color="red-5"
              :label="t('mlbb.banOnlyBanned')"
            />
            <q-toggle
              v-model="onlyAllowed"
              dark
              dense
              color="amber-6"
              :label="t('mlbb.banOnlyAllowed')"
            />
          </div>
        </div>
      </section>

      <section class="ban-grid-wrap">
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
              ><q-icon name="block" size="40px" /><strong>{{ t('mlbb.banBanned') }}</strong></span
            >
            <span v-if="hero.stats" class="card-stat">{{ statLabel(hero) }}</span>
            <span class="card-info">
              <strong>{{ hero.name }}</strong>
              <small>{{ classLabel(hero) }}</small>
            </span>
          </button>
        </div>
      </section>
    </div>
  </q-dialog>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { mlbbHeroes, mlbbHeroImage, mlbbHeroPortrait } from 'src/data/mlbb/catalog';
import { MLBB_CLASSES } from 'src/utils/mlbb-heroes';
import type { MlbbHero } from 'src/utils/mlbb-heroes';
const open = defineModel<boolean>({ required: true });
const banned = defineModel<string[]>('banned', { required: true });
const props = defineProps<{ classes: string[]; overrides: Record<string, string[]> }>();
const { t, locale } = useI18n();

type SortKey = 'name' | 'winRate' | 'banRate' | 'pickRate';
const query = ref('');
const roleFilter = ref<string>('all');
const sortBy = ref<SortKey>('name');
const onlyBanned = ref(false);
const onlyAllowed = ref(false);

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
.ban-phase {
  --ban-gold: #f2c86b;
  --ban-red: #ef4444;
  --ban-line: #ffffff1f;
  --ban-muted: #b6c2d9;
  width: min(1180px, 100vw);
  max-width: 100vw;
  height: min(860px, 92vh);
  display: flex;
  flex-direction: column;
  color: #f1f5f9;
  background:
    radial-gradient(ellipse at top, #1e3a8a55, transparent 60%),
    linear-gradient(180deg, #0b1430 0%, #060b1d 100%);
  border: 1px solid #f2c86b40;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 60px #00000080;
}
.q-dialog__inner--maximized .ban-phase {
  height: 100%;
  width: 100vw;
  border-radius: 0;
  border: 0;
}
.ban-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--ban-line);
}
.ban-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ban-title > .q-icon {
  color: var(--ban-red);
}
.ban-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--ban-gold);
}
.ban-title p {
  margin: 2px 0 0;
  color: var(--ban-muted);
  font-size: 0.8125rem;
}
.ban-actions {
  display: flex;
  gap: 8px;
}
.ban-done {
  background: linear-gradient(180deg, #f6d68a, #d9a441);
  color: #1c1306;
  font-weight: 700;
}
.ban-slots {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: #ef44440f;
  border-bottom: 1px solid var(--ban-line);
}
.slots-label {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fca5a5;
}
.slots-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  min-height: 44px;
  align-items: center;
  padding: 2px;
}
.slots-empty {
  color: var(--ban-muted);
  font-size: 0.8125rem;
}
.slot {
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
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
  inset: 0;
  margin: auto;
  color: #fff;
  background: #ef4444cc;
  border-radius: 50%;
  width: 18px;
  height: 18px;
}
.slot:hover img,
.slot:focus-visible img {
  filter: none;
}
.ban-filters {
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid var(--ban-line);
}
.role-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.role-tab {
  flex-shrink: 0;
  padding: 6px 14px;
  border: 1px solid var(--ban-line);
  border-radius: 999px;
  background: #ffffff0a;
  color: var(--ban-muted);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}
.role-tab small {
  opacity: 0.7;
  margin-left: 2px;
}
.role-tab.active {
  border-color: var(--ban-gold);
  background: #f2c86b26;
  color: var(--ban-gold);
}
.role-tab:focus-visible,
.hero-card:focus-visible,
.slot:focus-visible {
  outline: 2px solid var(--ban-gold);
  outline-offset: 2px;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
}
.filter-search {
  flex: 1 1 220px;
}
.filter-sort {
  flex: 0 1 200px;
}
.filter-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}
.ban-grid-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 20px;
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
  border: 2px solid #ffffff26;
  border-radius: 10px;
  overflow: hidden;
  background: #0f172a;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    border-color 0.12s ease,
    box-shadow 0.12s ease;
}
.hero-card:hover {
  transform: translateY(-2px);
  border-color: var(--ban-gold);
  box-shadow: 0 6px 18px #f2c86b33;
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
  color: var(--ban-red);
  background: #ef44441f;
  text-shadow: 0 1px 6px #000;
}
.banned-mark strong {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #fecaca;
}
@media (max-width: 599px) {
  .ban-header,
  .ban-slots,
  .ban-filters,
  .ban-grid-wrap {
    padding-left: 12px;
    padding-right: 12px;
  }
  .ban-grid {
    grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
    gap: 8px;
  }
  .ban-filters {
    gap: 8px;
  }
  .filter-search,
  .filter-sort {
    flex-basis: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero-card,
  .hero-card img {
    transition: none;
  }
  .hero-card:hover {
    transform: none;
  }
}
</style>
