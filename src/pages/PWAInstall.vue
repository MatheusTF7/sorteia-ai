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

            <div class="text-center">
              <q-btn
                unelevated
                color="primary"
                size="lg"
                class="install-button q-mt-sm"
                :icon="isInstalled ? 'check_circle' : 'get_app'"
                :label="isInstalled ? t('pwa.installed') : t('pwa.installButton')"
                :loading="isPrompting"
                :disable="!canInstall"
                @click="requestPwaInstall"
              />
            </div>

            <div
              v-if="isInstalled"
              class="install-status install-status--success text-body2 q-pa-md q-mt-md"
            >
              <q-icon name="check_circle" color="positive" size="20px" class="q-mr-sm" />
              {{ t('pwa.alreadyInstalled') }}
            </div>
            <div
              v-else-if="!canInstall"
              class="install-status row no-wrap items-start text-body2 q-pa-md q-mt-md"
            >
              <q-icon name="info" color="primary" size="20px" class="q-mr-sm" />
              <span>{{ t('pwa.installUnavailableHelp') }}</span>
            </div>
          </div>

          <q-separator class="q-my-md" />
          <div class="text-h6 text-weight-bold q-mb-md">Manual</div>

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
              <!-- <li>{{ t('pwa.notes.permissions') }}</li> -->
            </ul>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { usePwaInstall } from 'src/composables/usePwaInstall';

const { t } = useI18n();
const $q = useQuasar();
const { canInstall, isInstalled, isPrompting, promptInstall } = usePwaInstall();

async function requestPwaInstall() {
  const outcome = await promptInstall();
  if (outcome === 'accepted') {
    $q.notify({ message: t('pwa.installAccepted'), color: 'positive', position: 'bottom' });
  } else if (outcome === 'dismissed') {
    $q.notify({ message: t('pwa.installDismissed'), color: 'grey-7', position: 'bottom' });
  }
}
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
}
.card {
  border-radius: 16px;
}

.install-button {
  min-width: 220px;
}

.install-status {
  border: 1px solid var(--sa-border);
  border-radius: 14px;
  background: var(--sa-primary-soft);
}

.install-status--success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
}
</style>
