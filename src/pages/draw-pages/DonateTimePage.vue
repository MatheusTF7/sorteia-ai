<template>
  <q-page class="q-pa-lg text-center" style="max-width: 800px; margin: 0 auto">
    <div class="q-mb-md">
      <div class="text-h4 text-weight-bold q-mb-sm text-gradient" style="letter-spacing: -1px">
        {{ t('donateTime.pageTitle') }}
      </div>
      <div class="text-h6 text-weight-regular text-grey-6">
        {{ t('donateTime.pageSubtitle') }}
      </div>
    </div>

    <div class="row q-col-gutter-lg text-left justify-center">
      <!-- Configurações -->
      <div class="col-12 col-md-8">
        <q-card flat class="card shadow-modern">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-sm">
              {{ t('donateTime.configTitle') }}
            </div>

            <!-- Seleção de modo -->
            <div class="q-mb-lg">
              <div class="text-caption text-grey-6 q-mb-xs">{{ t('donateTime.modeLabel') }}</div>
              <q-btn-toggle
                v-model="mode"
                spread
                unelevated
                rounded
                toggle-color="primary"
                color="grey-3"
                text-color="grey-8"
                toggle-text-color="white"
                :options="[
                  { label: t('donateTime.modeSeconds'), value: 'seconds' },
                  { label: t('donateTime.modeMinute'), value: 'minute' },
                ]"
                @update:model-value="calculate"
              />
            </div>

            <!-- Valor do donate -->
            <q-input
              v-model="donateValueStr"
              outlined
              class="q-mb-md"
              :label="t('donateTime.donateValueLabel')"
              :hint="t('donateTime.donateValueHint')"
              type="number"
              min="0"
              :step="!donateValueStr || parseInt(donateValueStr) < 1 ? '1' : '0.01'"
              prefix="R$"
              @update:model-value="calculate"
            />

            <!-- Modo: segundos por real -->
            <template v-if="mode === 'seconds'">
              <q-input
                v-model="referenceValueStr"
                outlined
                class="q-mb-md"
                :label="t('donateTime.referenceValueLabel')"
                :hint="t('donateTime.referenceValueHint')"
                type="number"
                min="0"
                step="0.01"
                prefix="R$"
                @update:model-value="calculate"
              />
              <q-input
                v-model="secondsPerRealStr"
                outlined
                class="q-mb-md"
                :label="t('donateTime.secondsPerRealLabel')"
                :hint="t('donateTime.secondsPerRealHint')"
                type="number"
                min="0"
                step="1"
                :suffix="t('donateTime.secondsSuffix')"
                @update:model-value="calculate"
              />
            </template>

            <!-- Modo: valor por minuto -->
            <q-input
              v-if="mode === 'minute'"
              v-model="valuePerMinuteStr"
              outlined
              class="q-mb-md"
              :label="t('donateTime.valuePerMinuteLabel')"
              :hint="t('donateTime.valuePerMinuteHint')"
              type="number"
              min="0"
              step="0.01"
              prefix="R$"
              :suffix="t('donateTime.valuePerMinuteSuffix')"
              @update:model-value="calculate"
            />

            <q-separator class="q-my-lg" />

            <!-- Tempo atual da live (opcional) -->
            <div class="text-subtitle2 text-weight-medium q-mb-xs">
              {{ t('donateTime.currentLiveTimeSection') }}
            </div>
            <q-input
              v-model="currentLiveTimeStr"
              outlined
              :label="t('donateTime.currentLiveTimeLabel')"
              :hint="t('donateTime.currentLiveTimeHint')"
              mask="##:##:##"
              placeholder="00:00:00"
              :error="currentLiveTimeError"
              :error-message="t('donateTime.currentLiveTimeError')"
              @update:model-value="calculate"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Resultado -->
      <div class="col-12 col-md-8">
        <q-card flat class="card shadow-modern">
          <q-card-section class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-lg">
              {{ t('donateTime.resultTitle') }}
            </div>

            <div v-if="result !== null">
              <!-- Tempo adicionado -->
              <div class="text-caption text-grey-6 text-uppercase q-mb-xs letter-spacing-wide">
                {{ t('donateTime.addedTimeTitle') }}
              </div>
              <div
                class="text-h2 text-weight-bold text-primary q-mb-md"
                style="font-variant-numeric: tabular-nums; letter-spacing: 2px"
              >
                {{ result }}
              </div>

              <div class="row justify-center q-col-gutter-lg q-mt-sm">
                <div class="col-auto text-center">
                  <div class="text-h5 text-weight-bold text-secondary">{{ addedHours }}</div>
                  <div class="text-caption text-grey-6">{{ t('donateTime.hours') }}</div>
                </div>
                <div class="col-auto text-center">
                  <div class="text-h5 text-weight-bold text-secondary">{{ addedMinutes }}</div>
                  <div class="text-caption text-grey-6">{{ t('donateTime.minutes') }}</div>
                </div>
                <div class="col-auto text-center">
                  <div class="text-h5 text-weight-bold text-secondary">{{ addedSecondsLabel }}</div>
                  <div class="text-caption text-grey-6">{{ t('donateTime.seconds') }}</div>
                </div>
              </div>

              <div class="q-mt-md text-body2 text-grey-6">
                {{ t('donateTime.totalSeconds', { total: totalSeconds }) }}
              </div>

              <!-- Tempo final da live -->
              <template v-if="finalTime !== null">
                <q-separator class="q-my-lg" />

                <div class="text-caption text-grey-6 text-uppercase q-mb-xs letter-spacing-wide">
                  {{ t('donateTime.finalTimeTitle') }}
                </div>
                <div
                  class="text-h2 text-weight-bold text-positive q-mb-md"
                  style="font-variant-numeric: tabular-nums; letter-spacing: 2px"
                >
                  {{ finalTime }}
                </div>

                <div class="row justify-center q-col-gutter-lg q-mt-sm">
                  <div class="col-auto text-center">
                    <div class="text-h5 text-weight-bold text-secondary">{{ finalHours }}</div>
                    <div class="text-caption text-grey-6">{{ t('donateTime.hours') }}</div>
                  </div>
                  <div class="col-auto text-center">
                    <div class="text-h5 text-weight-bold text-secondary">{{ finalMinutes }}</div>
                    <div class="text-caption text-grey-6">{{ t('donateTime.minutes') }}</div>
                  </div>
                  <div class="col-auto text-center">
                    <div class="text-h5 text-weight-bold text-secondary">
                      {{ finalSecondsLabel }}
                    </div>
                    <div class="text-caption text-grey-6">{{ t('donateTime.seconds') }}</div>
                  </div>
                </div>
              </template>
            </div>

            <div v-else class="text-center text-grey-5 q-py-xl">
              <q-icon name="timer" size="48px" class="q-mb-md" />
              <div class="text-body1">{{ t('donateTime.resultNone') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

type Mode = 'seconds' | 'minute';

const { t } = useI18n();

const mode = ref<Mode>('seconds');
const donateValueStr = ref<string>('');
const referenceValueStr = ref<string>('1');
const secondsPerRealStr = ref<string>('');
const valuePerMinuteStr = ref<string>('');
const currentLiveTimeStr = ref<string>('');
const currentLiveTimeError = ref<boolean>(false);
const totalSeconds = ref<number>(0);
const totalFinalSeconds = ref<number | null>(null);
const result = ref<string | null>(null);
const finalTime = ref<string | null>(null);

// Breakdown: tempo adicionado
const addedHours = computed(() => String(Math.floor(totalSeconds.value / 3600)).padStart(2, '0'));
const addedMinutes = computed(() =>
  String(Math.floor((totalSeconds.value % 3600) / 60)).padStart(2, '0'),
);
const addedSecondsLabel = computed(() => String(totalSeconds.value % 60).padStart(2, '0'));

// Breakdown: tempo final da live
const finalHours = computed(() =>
  totalFinalSeconds.value !== null
    ? String(Math.floor(totalFinalSeconds.value / 3600)).padStart(2, '0')
    : '00',
);
const finalMinutes = computed(() =>
  totalFinalSeconds.value !== null
    ? String(Math.floor((totalFinalSeconds.value % 3600) / 60)).padStart(2, '0')
    : '00',
);
const finalSecondsLabel = computed(() =>
  totalFinalSeconds.value !== null ? String(totalFinalSeconds.value % 60).padStart(2, '0') : '00',
);

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function parseCurrentLiveTime(str: string): number | null {
  const trimmed = str.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d+):([0-5]\d):([0-5]\d)$/);
  if (!match) return null;
  return (
    (match[1] ? parseInt(match[1], 10) : 0) * 3600 +
    (match[2] ? parseInt(match[2], 10) : 0) * 60 +
    (match[3] ? parseInt(match[3], 10) : 0)
  );
}

function calculate() {
  const donateValue = parseFloat(donateValueStr.value);

  if (isNaN(donateValue) || donateValue < 0 || donateValueStr.value === '') {
    result.value = null;
    finalTime.value = null;
    totalSeconds.value = 0;
    totalFinalSeconds.value = null;
    return;
  }

  let addedSecs = 0;

  if (mode.value === 'seconds') {
    const referenceValue = parseFloat(referenceValueStr.value);
    const secondsPerReal = parseFloat(secondsPerRealStr.value);
    if (
      isNaN(referenceValue) ||
      referenceValue <= 0 ||
      referenceValueStr.value === '' ||
      isNaN(secondsPerReal) ||
      secondsPerReal < 0 ||
      secondsPerRealStr.value === ''
    ) {
      result.value = null;
      finalTime.value = null;
      totalSeconds.value = 0;
      totalFinalSeconds.value = null;
      return;
    }
    addedSecs = Math.floor((donateValue / referenceValue) * secondsPerReal);
  } else {
    const valuePerMinute = parseFloat(valuePerMinuteStr.value);
    if (isNaN(valuePerMinute) || valuePerMinute <= 0 || valuePerMinuteStr.value === '') {
      result.value = null;
      finalTime.value = null;
      totalSeconds.value = 0;
      totalFinalSeconds.value = null;
      return;
    }
    addedSecs = Math.floor((donateValue / valuePerMinute) * 60);
  }

  totalSeconds.value = addedSecs;
  result.value = formatTime(addedSecs);

  // Tempo atual da live
  currentLiveTimeError.value = false;
  const liveStr = currentLiveTimeStr.value.trim();
  if (liveStr) {
    const liveSecs = parseCurrentLiveTime(liveStr);
    if (liveSecs === null) {
      currentLiveTimeError.value = true;
      finalTime.value = null;
      totalFinalSeconds.value = null;
    } else {
      totalFinalSeconds.value = liveSecs + addedSecs;
      finalTime.value = formatTime(liveSecs + addedSecs);
    }
  } else {
    finalTime.value = null;
    totalFinalSeconds.value = null;
  }
}
</script>
