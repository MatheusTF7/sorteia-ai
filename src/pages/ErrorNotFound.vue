<template>
  <div class="not-found-shell">
    <q-card flat class="panel-card not-found-card">
      <div class="not-found-code">404</div>
      <div class="not-found-title">{{ t('error.title') }}</div>
      <div class="not-found-copy">
        {{ t('error.description') }}
      </div>

      <div class="q-mt-xl">
        <q-btn
          unelevated
          no-caps
          to="/"
          icon="arrow_back"
          :label="t('error.backHome')"
          class="app-btn app-btn--primary"
        />
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
