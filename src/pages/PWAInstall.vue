<template>
  <q-page class="q-pa-lg">
    <div class="container">
      <q-card flat bordered class="card">
        <q-card-section>
          <div class="text-h5 text-weight-bold q-mb-md">{{ t('pwa.pageTitle') }}</div>
          <div class="text-subtitle2 text-grey-7 q-mb-lg">{{ t('pwa.subtitle') }}</div>

          <q-separator class="q-my-md" />

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">{{ t('pwa.installPromptTitle') }}</div>
            <p class="text-body2">{{ t('pwa.installPromptDesc') }}</p>
          </div>

          <q-separator class="q-my-md" />

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">{{ t('pwa.android.title') }}</div>
            <ol>
              <li>{{ t('pwa.android.step1') }}</li>
              <li>{{ t('pwa.android.step2') }}</li>
              <li>{{ t('pwa.android.step3') }}</li>
            </ol>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">{{ t('pwa.ios.title') }}</div>
            <ol>
              <li>{{ t('pwa.ios.step1') }}</li>
              <li>{{ t('pwa.ios.step2') }}</li>
              <li>{{ t('pwa.ios.step3') }}</li>
            </ol>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">{{ t('pwa.desktop.title') }}</div>
            <ol>
              <li>{{ t('pwa.desktop.step1') }}</li>
              <li>{{ t('pwa.desktop.step2') }}</li>
            </ol>
          </div>

          <q-separator class="q-my-md" />

          <div>
            <div class="text-subtitle1 q-mb-sm">{{ t('pwa.notes.title') }}</div>
            <ul>
              <li>{{ t('pwa.notes.offline') }}</li>
              <li>{{ t('pwa.notes.permissions') }}</li>
            </ul>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
}
.card {
  border-radius: 16px;
}
</style>
