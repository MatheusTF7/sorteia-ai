<template>
  <q-page class="page-shell">
    <AppPageHero
      :eyebrow="t('drawList.eyebrow')"
      :title="t('drawList.title')"
      :subtitle="t('drawList.subtitle')"
      icon="auto_awesome"
      tone="primary"
    >
      <template #meta>
        <div class="metric-pills">
          <div v-for="metric in heroMetrics" :key="metric.label" class="metric-pill">
            <span class="metric-pill__label">{{ metric.label }}</span>
            <strong class="metric-pill__value">{{ metric.value }}</strong>
          </div>
        </div>
      </template>

      <template #actions>
        <q-btn
          unelevated
          no-caps
          class="app-btn app-btn--primary"
          icon="bookmarks"
          :label="t('nav.savedLists')"
          to="/saved-lists"
        />
        <q-btn
          outline
          no-caps
          class="app-btn app-btn--secondary"
          icon="download"
          :label="t('pwa.pageTitle')"
          to="/install"
        />
      </template>
    </AppPageHero>

    <section class="page-grid page-grid--three">
      <q-card
        v-for="item in sorteios"
        :key="item.id"
        flat
        class="home-card interactive-card"
        @click="openRoute(item.route)"
      >
        <q-card-section class="home-card__body">
          <div class="home-card__accent" :style="{ background: item.accentGlow }" />

          <div class="home-card__icon" :style="{ background: item.iconBg, color: item.iconColor }">
            <q-icon :name="item.icon" />
          </div>

          <div class="panel-card__eyebrow">{{ item.eyebrow }}</div>
          <div class="home-card__title q-mt-md">{{ item.nome }}</div>
          <div class="panel-card__description">{{ item.descricao }}</div>

          <div class="metric-pills q-mt-lg">
            <div class="metric-pill">
              <span class="metric-pill__label">{{ t('drawList.openFlow') }}</span>
              <strong class="metric-pill__value">{{ item.cta }}</strong>
            </div>
          </div>

          <div class="home-card__footer">
            <span>{{ t('drawList.openFlow') }}</span>
            <q-icon name="arrow_forward" size="20px" />
          </div>
        </q-card-section>
      </q-card>
    </section>

    <section class="info-grid">
      <div class="info-block">
        <div class="info-block__title">{{ t('nav.savedLists') }}</div>
        <div class="info-block__body">{{ t('savedLists.manageDescription') }}</div>
      </div>

      <div class="info-block">
        <div class="info-block__title">{{ t('layout.privacyBadge') }}</div>
        <div class="info-block__body">{{ t('layout.navTipDescription') }}</div>
      </div>

      <div class="info-block">
        <div class="info-block__title">{{ t('shared.readyToUse') }}</div>
        <div class="info-block__body">{{ t('pwa.subtitle') }}</div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import AppPageHero from 'components/AppPageHero.vue';
import { useSavedConfigs } from 'src/composables/useSavedConfigs';
import type { SavedList } from 'src/utils/draw';

interface Sorteio {
  id: number;
  nome: string;
  descricao: string;
  eyebrow: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  accentGlow: string;
  cta: string;
  route: string;
}

const { t } = useI18n();
const router = useRouter();
const { data: savedLists } = useSavedConfigs<SavedList[]>('saved_lists', []);

const sorteios = computed<Sorteio[]>(() => [
  {
    id: 1,
    nome: t('drawList.nameDraw.title'),
    descricao: t('drawList.nameDraw.desc'),
    eyebrow: t('nav.names'),
    icon: 'person_search',
    iconBg: 'rgba(36, 87, 245, 0.12)',
    iconColor: '#2457f5',
    accentGlow: 'linear-gradient(135deg, rgba(36, 87, 245, 0.42), rgba(36, 87, 245, 0.08))',
    cta: t('shared.readyToUse'),
    route: '/names',
  },
  {
    id: 2,
    nome: t('drawList.numberDraw.title'),
    descricao: t('drawList.numberDraw.desc'),
    eyebrow: t('nav.numbers'),
    icon: 'pin',
    iconBg: 'rgba(233, 162, 59, 0.16)',
    iconColor: '#b26d13',
    accentGlow: 'linear-gradient(135deg, rgba(233, 162, 59, 0.38), rgba(233, 162, 59, 0.08))',
    cta: t('numbers.uniqueMode'),
    route: '/numbers',
  },
  {
    id: 3,
    nome: t('drawList.teamDraw.title'),
    descricao: t('drawList.teamDraw.desc'),
    eyebrow: t('nav.teams'),
    icon: 'groups_2',
    iconBg: 'rgba(13, 148, 136, 0.15)',
    iconColor: '#0d9488',
    accentGlow: 'linear-gradient(135deg, rgba(13, 148, 136, 0.34), rgba(13, 148, 136, 0.08))',
    cta: t('teams.actions.generateTeams'),
    route: '/teams',
  },
  {
    id: 4,
    nome: t('drawList.prizeDraw.title'),
    descricao: t('drawList.prizeDraw.desc'),
    eyebrow: t('nav.prizes'),
    icon: 'workspace_premium',
    iconBg: 'rgba(99, 102, 241, 0.14)',
    iconColor: '#4f46e5',
    accentGlow: 'linear-gradient(135deg, rgba(79, 70, 229, 0.34), rgba(79, 70, 229, 0.08))',
    cta: t('prizes.actions.runDraw'),
    route: '/prizes',
  },
  {
    id: 5,
    nome: t('nav.about'),
    descricao: t('drawList.subtitle'),
    eyebrow: t('nav.about'),
    icon: 'lightbulb',
    iconBg: 'rgba(148, 163, 184, 0.18)',
    iconColor: '#475569',
    accentGlow: 'linear-gradient(135deg, rgba(71, 85, 105, 0.24), rgba(71, 85, 105, 0.06))',
    cta: t('layout.privacyBadge'),
    route: '/about',
  },
  {
    id: 6,
    nome: t('pwa.pageTitle'),
    descricao: t('pwa.subtitle'),
    eyebrow: 'PWA',
    icon: 'download',
    iconBg: 'rgba(14, 165, 233, 0.15)',
    iconColor: '#0284c7',
    accentGlow: 'linear-gradient(135deg, rgba(2, 132, 199, 0.32), rgba(2, 132, 199, 0.06))',
    cta: t('shared.readyToUse'),
    route: '/install',
  },
]);

const heroMetrics = computed(() => [
  { label: t('drawList.stats.flows'), value: String(sorteios.value.length) },
  { label: t('drawList.stats.private'), value: t('layout.privacyBadge') },
  { label: t('drawList.stats.reusable'), value: String(savedLists.value.length) },
]);

function openRoute(route: string) {
  void router.push(route);
}
</script>
