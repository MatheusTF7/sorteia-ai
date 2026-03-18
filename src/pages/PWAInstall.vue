<template>
  <q-page class="page-shell page-shell--narrow">
    <AppPageHero
      eyebrow="PWA"
      :title="t('pwa.pageTitle')"
      :subtitle="t('pwa.subtitle')"
      icon="download"
      tone="primary"
    >
      <template #meta>
        <div class="metric-pills">
          <div class="metric-pill">
            <span class="metric-pill__label">PWA</span>
            <strong class="metric-pill__value">{{ t('shared.readyToUse') }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-pill__label">{{ t('pwa.notes.title') }}</span>
            <strong class="metric-pill__value">Offline</strong>
          </div>
        </div>
      </template>
    </AppPageHero>

    <section class="page-grid page-grid--three">
      <q-card v-for="platform in platforms" :key="platform.title" flat class="panel-card">
        <q-card-section class="panel-card__header">
          <div>
            <div class="panel-card__eyebrow">{{ platform.kicker }}</div>
            <div class="panel-card__title">{{ platform.title }}</div>
          </div>
        </q-card-section>

        <q-card-section class="panel-card__body">
          <ol class="steps-list">
            <li v-for="step in platform.steps" :key="step">{{ step }}</li>
          </ol>
        </q-card-section>
      </q-card>
    </section>

    <q-card flat class="panel-card q-mt-lg">
      <q-card-section class="panel-card__header">
        <div>
          <div class="panel-card__eyebrow">{{ t('pwa.notes.title') }}</div>
          <div class="panel-card__title">{{ t('pwa.installPromptTitle') }}</div>
          <div class="panel-card__description">{{ t('pwa.installPromptDesc') }}</div>
        </div>
      </q-card-section>

      <q-card-section class="panel-card__body">
        <ul class="content-list">
          <li>{{ t('pwa.notes.offline') }}</li>
          <li>{{ t('pwa.notes.permissions') }}</li>
        </ul>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppPageHero from 'components/AppPageHero.vue';

const { t } = useI18n();

const platforms = computed(() => [
  {
    title: t('pwa.android.title'),
    kicker: 'Android',
    steps: [t('pwa.android.step1'), t('pwa.android.step2'), t('pwa.android.step3')],
  },
  {
    title: t('pwa.ios.title'),
    kicker: 'iOS',
    steps: [t('pwa.ios.step1'), t('pwa.ios.step2'), t('pwa.ios.step3')],
  },
  {
    title: t('pwa.desktop.title'),
    kicker: 'Desktop',
    steps: [t('pwa.desktop.step1'), t('pwa.desktop.step2')],
  },
]);
</script>
