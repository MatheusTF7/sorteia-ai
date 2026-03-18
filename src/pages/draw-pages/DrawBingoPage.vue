<template>
  <q-page
    class="text-center"
    :class="{
      'q-pa-lg': $q.screen.gt.sm,
      'q-pa-xs': $q.screen.lt.md,
    }"
    style="max-width: 1200px; margin: 0 auto"
  >
    <div class="q-mb-xl">
      <div class="text-h4 text-weight-bold q-mb-md text-gradient" style="letter-spacing: -1px">
        {{ t('bingo.pageTitle') }}
      </div>
      <div class="text-h6 text-weight-regular text-grey-6">
        {{ t('bingo.pageSubtitle') }}
      </div>
    </div>

    <!-- Role Selection -->
    <div v-if="!gameStarted" class="row q-col-gutter-lg justify-center q-mb-xl">
      <div v-for="role in roles" :key="role.value" class="col-12 col-sm-4" style="max-width: 340px">
        <q-card
          flat
          class="card shadow-modern cursor-pointer full-height q-pa-lg text-center"
          :class="selectedRole === role.value ? 'ring-active' : ''"
          @click="selectedRole = role.value"
        >
          <q-icon :name="role.icon" size="48px" color="primary" class="q-mb-md" />
          <div class="text-h6 text-weight-bold q-mb-sm">{{ role.label }}</div>
          <div class="text-body2 text-grey-6">{{ role.desc }}</div>
        </q-card>
      </div>

      <div class="col-12 text-center q-mt-md">
        <q-btn
          color="primary"
          unelevated
          class="q-py-sm q-px-xl text-weight-bold"
          :label="t('bingo.startGame')"
          :disable="!selectedRole"
          @click="startGame"
        />
      </div>
    </div>

    <!-- Game Area -->
    <div v-else class="text-left">
      <!-- Drawer Controls -->
      <div v-if="isDrawer" class="q-mb-xl">
        <q-card flat class="card shadow-modern">
          <q-card-section
            :class="{
              'q-pa-lg': $q.screen.gt.sm,
              'q-pa-md': $q.screen.lt.md,
            }"
          >
            <div class="text-h6 text-weight-bold q-mb-lg row items-center">
              {{ t('bingo.drawerPanel') }}
              <q-space />
              <q-btn
                flat
                round
                class="app-icon-btn q-mr-sm"
                :icon="ttsEnabled ? 'volume_up' : 'volume_off'"
                :color="ttsEnabled ? 'primary' : 'grey-6'"
                @click="ttsEnabled = !ttsEnabled"
              >
                <q-tooltip>{{ t('bingo.toggleTts') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                class="app-icon-btn q-mr-sm"
                :icon="suspenseEnabled ? 'hourglass_top' : 'hourglass_disabled'"
                :color="suspenseEnabled ? 'primary' : 'grey-6'"
                @click="suspenseEnabled = !suspenseEnabled"
              >
                <q-tooltip>{{ t('bingo.toggleSuspense') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                class="app-icon-btn"
                icon="fact_check"
                color="primary"
                @click="openValidateDialog"
              >
                <q-tooltip>{{ t('bingo.validateCard') }}</q-tooltip>
              </q-btn>
            </div>

            <!-- Current Number Display -->
            <div class="text-center q-mb-lg">
              <transition name="bingo-pop" mode="out-in">
                <div
                  v-if="suspenseAnimating"
                  key="suspense"
                  class="bingo-ball bingo-ball--suspense q-mx-auto"
                >
                  <q-icon name="hourglass_top" size="42px" class="suspense-spin" />
                </div>
                <div
                  v-else-if="lastDrawnNumber !== null"
                  :key="lastDrawnNumber"
                  class="bingo-ball q-mx-auto"
                  :class="getBallColorClass(lastDrawnNumber)"
                >
                  <div class="bingo-ball__letter">{{ getLetterForNumber(lastDrawnNumber) }}</div>
                  <div class="bingo-ball__number">{{ lastDrawnNumber }}</div>
                </div>
                <div v-else key="empty" class="bingo-ball bingo-ball--empty q-mx-auto">
                  <span class="text-grey-5 text-h6">?</span>
                </div>
              </transition>
            </div>

            <div class="row q-col-gutter-md justify-center">
              <div class="col-12 col-sm-6">
                <q-btn
                  class="full-width q-py-sm text-weight-bold"
                  color="primary"
                  unelevated
                  icon="casino"
                  :label="t('bingo.drawNumber')"
                  :disable="availableNumbers.length === 0 || suspenseAnimating"
                  @click="drawNumber"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-btn
                  class="full-width q-py-sm text-weight-bold"
                  color="amber-8"
                  unelevated
                  icon="restart_alt"
                  :label="t('bingo.newGame')"
                  @click="confirmReset"
                />
              </div>
            </div>

            <!-- Progress -->
            <div class="q-mt-lg">
              <div class="row items-center justify-between q-mb-xs">
                <span class="text-caption text-grey-6">{{ t('bingo.progress') }}</span>
                <span class="text-caption text-weight-bold">{{ calledNumbers.length }} / 75</span>
              </div>
              <q-linear-progress
                :value="calledNumbers.length / 75"
                color="primary"
                rounded
                size="8px"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Called Numbers Board -->
        <q-card flat class="card shadow-modern q-mt-lg">
          <q-card-section
            :class="{
              'q-pa-lg': $q.screen.gt.sm,
              'q-pa-md': $q.screen.lt.md,
            }"
          >
            <div class="text-h6 text-weight-bold q-mb-md row items-center">
              {{ t('bingo.calledNumbers') }}
              <q-badge class="q-ml-sm" color="primary" :label="calledNumbers.length" rounded />
            </div>

            <div class="bingo-board">
              <div v-for="letter in bingoLetters" :key="letter.char" class="bingo-board__column">
                <div class="bingo-board__header" :class="letter.colorClass">
                  {{ letter.char }}
                </div>
                <div
                  v-for="n in letter.numbers"
                  :key="n"
                  class="bingo-board__cell"
                  :class="{
                    'bingo-board__cell--called': calledNumbers.includes(n),
                    [letter.colorClass]: calledNumbers.includes(n),
                  }"
                >
                  {{ n }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Player Card -->
      <div v-if="isPlayer" class="q-mb-xl">
        <q-card flat class="card shadow-modern">
          <q-card-section
            :class="{
              'q-pa-lg': $q.screen.gt.sm,
              'q-pa-md': $q.screen.lt.md,
            }"
          >
            <div class="text-h6 text-weight-bold q-mb-md row items-center">
              {{ t('bingo.yourCard') }}
              <q-space />
              <q-btn
                flat
                round
                class="app-icon-btn"
                icon="refresh"
                color="primary"
                :disable="markedCells.size > 0"
                @click="generateCard"
              >
                <q-tooltip>{{ t('bingo.newCard') }}</q-tooltip>
              </q-btn>
            </div>

            <div class="bingo-card q-mx-auto">
              <div class="bingo-card__header">
                <div
                  v-for="(letter, idx) in ['B', 'I', 'N', 'G', 'O']"
                  :key="letter"
                  class="bingo-card__header-cell"
                  :class="headerColors[idx]"
                >
                  {{ letter }}
                </div>
              </div>
              <div v-for="(row, rowIdx) in cardRows" :key="rowIdx" class="bingo-card__row">
                <div
                  v-for="(cell, colIdx) in row"
                  :key="`${rowIdx}-${colIdx}`"
                  class="bingo-card__cell"
                  :class="{
                    'bingo-card__cell--free': cell === 0,
                    'bingo-card__cell--marked': cell === 0 || markedCells.has(cell),
                    'bingo-card__cell--clickable': cell !== 0 && !markedCells.has(cell),
                  }"
                  @click="toggleMark(cell)"
                >
                  <template v-if="cell === 0">
                    <q-icon name="star" size="24px" color="amber" />
                  </template>
                  <template v-else>
                    <span :class="{ 'text-weight-bold': markedCells.has(cell) }">{{ cell }}</span>
                    <q-icon
                      v-if="markedCells.has(cell)"
                      name="check_circle"
                      size="16px"
                      color="positive"
                      class="marked-icon"
                    />
                  </template>
                </div>
              </div>
            </div>

            <!-- Bingo Button -->
            <div class="text-center q-mt-lg">
              <q-btn
                class="bingo-shout-btn text-weight-bold"
                :class="{ 'bingo-shout-btn--ready': hasBingo }"
                color="amber-8"
                unelevated
                icon="celebration"
                label="BINGO!"
                size="lg"
                :disable="!hasBingo"
                @click="shoutBingo"
              />
              <div v-if="!hasBingo" class="text-caption text-grey-5 q-mt-sm">
                {{ t('bingo.markAllToShout') }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Back to role selection -->
      <div class="text-center q-mt-md q-mb-lg">
        <q-btn
          flat
          color="grey-7"
          icon="arrow_back"
          :label="t('bingo.changeRole')"
          class="text-weight-bold"
          @click="confirmChangeRole"
        />
      </div>
    </div>

    <!-- Bingo Celebration Dialog -->
    <q-dialog v-model="showCelebration" persistent>
      <q-card
        class="shadow-modern q-pa-md text-center"
        style="min-width: 340px; border-radius: 24px"
      >
        <q-card-section>
          <div class="celebration-container">
            <div class="confetti-piece" v-for="i in 30" :key="i" :style="confettiStyle(i)" />
          </div>
          <q-icon name="celebration" size="64px" color="amber" class="q-mb-md" />
          <div class="text-h4 text-weight-bold text-gradient q-mb-sm">BINGO!</div>
          <div class="text-h6 text-grey-6 q-mb-md">{{ t('bingo.congratulations') }}</div>
          <div
            class="q-pa-md br-20 q-mb-md"
            :class="$q.dark.isActive ? 'bg-slate-800' : 'bg-indigo-50'"
          >
            <q-icon name="info" color="primary" size="20px" class="q-mr-sm" />
            <span class="text-weight-medium">{{ t('bingo.verifyWithDrawer') }}</span>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pb-md">
          <q-btn
            v-close-popup
            color="primary"
            unelevated
            class="q-px-xl q-py-sm text-weight-bold"
            label="OK"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reset Confirmation Dialog -->
    <q-dialog v-model="showResetDialog">
      <q-card class="shadow-modern q-pa-sm" style="min-width: 340px; border-radius: 24px">
        <q-card-section>
          <div class="text-h6 text-weight-bold">{{ t('bingo.confirmReset') }}</div>
          <div class="text-grey-6 q-mt-sm">{{ t('bingo.confirmResetDesc') }}</div>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            v-close-popup
            flat
            :label="t('shared.cancel')"
            color="grey-7"
            class="text-weight-bold q-px-md"
          />
          <q-btn
            color="negative"
            unelevated
            class="text-weight-bold q-px-md"
            :label="t('bingo.reset')"
            @click="resetGame"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Validate Card Dialog -->
    <q-dialog v-model="showValidateDialog">
      <q-card
        class="shadow-modern"
        style="
          width: 95vw;
          max-width: 600px;
          border-radius: 24px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        "
      >
        <q-card-section class="row items-center q-pb-none" style="flex-shrink: 0">
          <div class="text-h6 text-weight-bold">{{ t('bingo.validateCard') }}</div>
          <q-space />
          <q-btn v-close-popup flat round icon="close" color="grey-6" />
        </q-card-section>

        <div class="q-px-lg q-pb-md q-pt-sm" style="flex: 1; overflow-y: auto">
          <div class="text-body2 text-grey-6 q-mb-md">{{ t('bingo.validateCardDesc') }}</div>

          <q-btn-toggle
            v-model="validateMode"
            spread
            unelevated
            rounded
            :options="[
              { label: t('bingo.validateModeType'), value: 'type', icon: 'edit' },
              { label: t('bingo.validateModeSelect'), value: 'select', icon: 'grid_on' },
            ]"
            color="white"
            text-color="grey-7"
            toggle-color="primary"
            toggle-text-color="white"
            class="q-mb-lg"
            @update:model-value="resetValidate"
          />

          <!-- Type mode -->
          <template v-if="validateMode === 'type'">
            <q-input
              v-model="validateInputText"
              type="textarea"
              outlined
              autogrow
              rows="2"
              :label="t('bingo.validateInputLabel')"
              :hint="t('bingo.validateInputHint')"
              class="q-mb-md"
              @update:model-value="validateResult = null"
            />
            <div v-if="validateNumbers.size > 0" class="row q-gutter-xs q-mb-md">
              <q-chip
                v-for="n in [...validateNumbers].sort((a, b) => a - b)"
                :key="n"
                dense
                :color="
                  validateResult
                    ? validateResult.called.includes(n)
                      ? 'positive'
                      : 'negative'
                    : 'primary'
                "
                text-color="white"
                :icon="
                  validateResult ? (validateResult.called.includes(n) ? 'check' : 'close') : 'tag'
                "
                size="sm"
              >
                {{ n }}
              </q-chip>
            </div>
          </template>

          <!-- Select mode -->
          <template v-else>
            <div class="bingo-board q-mb-md" style="max-width: 100%">
              <div v-for="letter in bingoLetters" :key="letter.char" class="bingo-board__column">
                <div class="bingo-board__header" :class="letter.colorClass">
                  {{ letter.char }}
                </div>
                <div
                  v-for="n in letter.numbers"
                  :key="n"
                  class="bingo-board__cell bingo-board__cell--selectable"
                  :class="{
                    'bingo-board__cell--selected':
                      validateSelected.has(n) &&
                      !(validateResult && validateResult.notCalled.includes(n)),
                    'bingo-board__cell--v-invalid':
                      validateSelected.has(n) &&
                      !!(validateResult && validateResult.notCalled.includes(n)),
                    'bingo-board__cell--maxed':
                      validateSelected.size >= 24 && !validateSelected.has(n),
                  }"
                  @click="toggleValidateSelect(n)"
                >
                  {{ n }}
                </div>
              </div>
            </div>
          </template>

          <!-- Progress counter -->
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-caption text-grey-6">{{ t('bingo.validateCountLabel') }}</span>
            <span
              class="text-caption text-weight-bold"
              :class="validateNumbers.size === 24 ? 'text-positive' : 'text-grey-7'"
            >
              {{ validateNumbers.size }} / 24
            </span>
          </div>
          <q-linear-progress
            :value="Math.min(validateNumbers.size / 24, 1)"
            :color="validateNumbers.size === 24 ? 'positive' : 'primary'"
            rounded
            size="6px"
            class="q-mb-lg"
          />

          <!-- Result -->
          <template v-if="validateResult">
            <q-separator class="q-mb-md" />
            <div
              class="q-pa-md br-20 row items-center justify-center q-mb-md"
              :class="validateResult.valid ? 'bg-positive' : 'bg-negative'"
            >
              <q-icon
                :name="validateResult.valid ? 'check_circle' : 'cancel'"
                size="28px"
                color="white"
                class="q-mr-sm"
              />
              <span class="text-subtitle1 text-weight-bold text-white">
                {{
                  validateResult.valid
                    ? t('bingo.validateResultValid')
                    : t('bingo.validateResultInvalid')
                }}
              </span>
            </div>
            <div v-if="validateResult.notCalled.length > 0" class="q-mb-md">
              <div class="text-caption text-weight-bold text-negative q-mb-xs">
                {{ t('bingo.validateNotCalledLabel') }} ({{ validateResult.notCalled.length }})
              </div>
              <div class="row q-gutter-xs">
                <q-chip
                  v-for="n in validateResult.notCalled"
                  :key="n"
                  dense
                  color="negative"
                  text-color="white"
                  icon="close"
                  size="sm"
                >
                  {{ n }}
                </q-chip>
              </div>
            </div>
            <div v-if="validateResult.called.length > 0">
              <div class="text-caption text-weight-bold text-positive q-mb-xs">
                {{ t('bingo.validateCalledLabel') }} ({{ validateResult.called.length }})
              </div>
              <div class="row q-gutter-xs">
                <q-chip
                  v-for="n in validateResult.called"
                  :key="n"
                  dense
                  color="positive"
                  text-color="white"
                  icon="check"
                  size="sm"
                >
                  {{ n }}
                </q-chip>
              </div>
            </div>
          </template>
        </div>

        <q-separator style="flex-shrink: 0" />
        <q-card-actions align="right" class="q-px-md q-py-sm" style="flex-shrink: 0">
          <q-btn
            v-close-popup
            flat
            :label="t('shared.cancel')"
            color="grey-7"
            class="text-weight-bold q-px-md"
          />
          <q-btn
            color="primary"
            unelevated
            class="text-weight-bold q-px-md"
            :label="t('bingo.validateAction')"
            :disable="validateNumbers.size !== 24"
            @click="runValidation"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

const { t, locale } = useI18n();
const $q = useQuasar();

// ─── Role selection ──────────────────────────────────────────────────────────
type Role = 'drawer' | 'player' | 'both';

const roles = computed(() => [
  {
    value: 'drawer' as Role,
    label: t('bingo.roles.drawer'),
    desc: t('bingo.roles.drawerDesc'),
    icon: 'record_voice_over',
  },
  {
    value: 'player' as Role,
    label: t('bingo.roles.player'),
    desc: t('bingo.roles.playerDesc'),
    icon: 'style',
  },
  {
    value: 'both' as Role,
    label: t('bingo.roles.both'),
    desc: t('bingo.roles.bothDesc'),
    icon: 'hub',
  },
]);

const selectedRole = ref<Role | null>(null);
const gameStarted = ref(false);

const isDrawer = computed(() => selectedRole.value === 'drawer' || selectedRole.value === 'both');
const isPlayer = computed(() => selectedRole.value === 'player' || selectedRole.value === 'both');

// ─── Drawer state ────────────────────────────────────────────────────────────
const calledNumbers = ref<number[]>([]);
const lastDrawnNumber = ref<number | null>(null);
const ttsEnabled = ref(false);
const suspenseEnabled = ref(true);
const suspenseAnimating = ref(false);

const availableNumbers = computed(() => {
  const all: number[] = [];
  for (let i = 1; i <= 75; i++) all.push(i);
  return all.filter((n) => !calledNumbers.value.includes(n));
});

const bingoLetters = computed(() => [
  { char: 'B', numbers: range(1, 15), colorClass: 'ball-blue' },
  { char: 'I', numbers: range(16, 30), colorClass: 'ball-red' },
  { char: 'N', numbers: range(31, 45), colorClass: 'ball-white' },
  { char: 'G', numbers: range(46, 60), colorClass: 'ball-green' },
  { char: 'O', numbers: range(61, 75), colorClass: 'ball-orange' },
]);

function range(start: number, end: number): number[] {
  const arr: number[] = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

function getLetterForNumber(n: number): string {
  if (n <= 15) return 'B';
  if (n <= 30) return 'I';
  if (n <= 45) return 'N';
  if (n <= 60) return 'G';
  return 'O';
}

function getBallColorClass(n: number): string {
  if (n <= 15) return 'ball-blue';
  if (n <= 30) return 'ball-red';
  if (n <= 45) return 'ball-white';
  if (n <= 60) return 'ball-green';
  return 'ball-orange';
}

function drawNumber() {
  if (availableNumbers.value.length === 0) return;

  const idx = Math.floor(Math.random() * availableNumbers.value.length);
  const number = availableNumbers.value[idx]!;

  if (suspenseEnabled.value) {
    suspenseAnimating.value = true;
    setTimeout(() => {
      suspenseAnimating.value = false;
      revealNumber(number);
    }, 1500);
  } else {
    revealNumber(number);
  }
}

function revealNumber(number: number) {
  lastDrawnNumber.value = number;
  calledNumbers.value.push(number);

  if (ttsEnabled.value) {
    speakNumber(number);
  }
}

function speakNumber(n: number) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const letter = getLetterForNumber(n);
  const lang = locale.value === 'pt-BR' ? 'pt-BR' : 'en-US';
  const text = `${letter}, ${n}`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

// ─── Player card state ───────────────────────────────────────────────────────
const cardColumns = reactive<number[][]>([[], [], [], [], []]);
const markedCells = reactive(new Set<number>());

const headerColors = ['ball-blue', 'ball-red', 'ball-white', 'ball-green', 'ball-orange'];

const cardRows = computed(() => {
  const rows: number[][] = [];
  for (let r = 0; r < 5; r++) {
    const row: number[] = [];
    for (let c = 0; c < 5; c++) {
      row.push(cardColumns[c]![r]!);
    }
    rows.push(row);
  }
  return rows;
});

function generateCard() {
  markedCells.clear();

  const colRanges = [
    [1, 15],
    [16, 30],
    [31, 45],
    [46, 60],
    [61, 75],
  ];

  for (let c = 0; c < 5; c++) {
    const [min, max] = colRanges[c]!;
    const pool = range(min!, max!);
    const picked: number[] = [];
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool[idx]!);
      pool.splice(idx, 1);
    }
    cardColumns[c] = picked;
  }

  // Free space in center (row 2, col 2)
  cardColumns[2]![2] = 0;
}

function toggleMark(cell: number) {
  if (cell === 0) return; // free space
  if (markedCells.has(cell)) {
    markedCells.delete(cell);
  } else {
    markedCells.add(cell);
  }
}

// ─── Bingo detection ─────────────────────────────────────────────────────────
const hasBingo = computed(() => {
  const marked = (r: number, c: number) => {
    const val = cardRows.value[r]![c]!;
    return val === 0 || markedCells.has(val);
  };

  // Check rows
  for (let r = 0; r < 5; r++) {
    if ([0, 1, 2, 3, 4].every((c) => marked(r, c))) return true;
  }
  // Check columns
  for (let c = 0; c < 5; c++) {
    if ([0, 1, 2, 3, 4].every((r) => marked(r, c))) return true;
  }
  // Diagonals
  if ([0, 1, 2, 3, 4].every((i) => marked(i, i))) return true;
  if ([0, 1, 2, 3, 4].every((i) => marked(i, 4 - i))) return true;

  return false;
});

// ─── Celebration ─────────────────────────────────────────────────────────────
const showCelebration = ref(false);

function shoutBingo() {
  if (!hasBingo.value) return;
  showCelebration.value = true;

  if (ttsEnabled.value && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('BINGO!');
    utterance.lang = locale.value === 'pt-BR' ? 'pt-BR' : 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.3;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }
}

function confettiStyle(i: number) {
  const colors = ['#4f46e5', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
  const color = colors[i % colors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = 2 + Math.random() * 2;
  const size = 6 + Math.random() * 6;
  return {
    backgroundColor: color,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`,
  };
}

// ─── Game flow ───────────────────────────────────────────────────────────────
function startGame() {
  if (!selectedRole.value) return;
  gameStarted.value = true;
  calledNumbers.value = [];
  lastDrawnNumber.value = null;
  if (isPlayer.value) {
    generateCard();
  }
}

const showResetDialog = ref(false);

function confirmReset() {
  showResetDialog.value = true;
}

function resetGame() {
  showResetDialog.value = false;
  calledNumbers.value = [];
  lastDrawnNumber.value = null;
  markedCells.clear();
  if (isPlayer.value) {
    generateCard();
  }
}

function confirmChangeRole() {
  $q.dialog({
    title: t('bingo.confirmReset'),
    message: t('bingo.confirmChangeRoleDesc'),
    cancel: { flat: true, label: t('shared.cancel'), color: 'grey-7' },
    ok: { unelevated: true, label: 'OK', color: 'primary' },
    persistent: false,
  }).onOk(() => {
    gameStarted.value = false;
    calledNumbers.value = [];
    lastDrawnNumber.value = null;
    markedCells.clear();
  });
}

// ─── Validate card ────────────────────────────────────────────────────────────
interface ValidateResult {
  called: number[];
  notCalled: number[];
  valid: boolean;
}

const showValidateDialog = ref(false);
const validateMode = ref<'type' | 'select'>('type');
const validateInputText = ref('');
const validateSelected = reactive(new Set<number>());
const validateResult = ref<ValidateResult | null>(null);

const validateNumbers = computed(() => {
  if (validateMode.value === 'select') {
    return new Set(validateSelected);
  }
  const parts = validateInputText.value
    .split(/[,;.\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const nums = new Set<number>();
  for (const p of parts) {
    const n = parseInt(p, 10);
    if (!isNaN(n) && n >= 1 && n <= 75) nums.add(n);
  }
  return nums;
});

function resetValidate() {
  validateInputText.value = '';
  validateSelected.clear();
  validateResult.value = null;
}

function openValidateDialog() {
  resetValidate();
  showValidateDialog.value = true;
}

function toggleValidateSelect(n: number) {
  if (validateSelected.has(n)) {
    validateSelected.delete(n);
    validateResult.value = null;
  } else if (validateSelected.size < 24) {
    validateSelected.add(n);
    validateResult.value = null;
  }
}

function runValidation() {
  const nums = [...validateNumbers.value];
  const called: number[] = [];
  const notCalled: number[] = [];
  for (const n of nums) {
    if (calledNumbers.value.includes(n)) {
      called.push(n);
    } else {
      notCalled.push(n);
    }
  }
  validateResult.value = {
    called,
    notCalled,
    valid: notCalled.length === 0,
  };
}
</script>

<style scoped lang="scss">
.card {
  border-radius: 16px;
}

.ring-active {
  outline: 3px solid $primary;
  outline-offset: 2px;
}

// ─── Bingo Ball ──────────────────────────────────────────────────────────────
.bingo-ball {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 -4px 8px rgba(0, 0, 0, 0.1);
  position: relative;

  &--empty {
    background: #e2e8f0;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }

  &--suspense {
    background: linear-gradient(135deg, #4f46e5, #8b5cf6);
    color: white;
  }

  &__letter {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    opacity: 0.8;
    line-height: 1;
  }

  &__number {
    font-size: 38px;
    font-weight: 800;
    line-height: 1.1;
  }
}

body.body--dark .bingo-ball--empty {
  background: #1e293b;
}

.ball-blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}
.ball-red {
  background: linear-gradient(135deg, #f43f5e, #e11d48);
  color: white;
}
.ball-white {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  color: #1e293b;
}
.ball-green {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}
.ball-orange {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

// ─── Bingo Board (called numbers) ───────────────────────────────────────────
.bingo-board {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  max-width: 500px;
  margin: 0 auto;

  &__column {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__header {
    text-align: center;
    font-weight: 800;
    font-size: 18px;
    padding: 8px 0;
    border-radius: 10px;
    color: white;
  }

  &__cell {
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    padding: 5px 2px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.03);
    color: #94a3b8;
    border: 2px solid rgba(0, 0, 0, 0.05);
    transition: all 0.25s ease;

    &--called {
      color: white;
      background: $indigo-5;
      font-weight: 700;
      border-color: $primary;
    }

    &--selectable {
      cursor: pointer;
      &:hover {
        border-color: rgba(79, 70, 229, 0.5);
        background: rgba(79, 70, 229, 0.1);
        color: $primary;
        transform: scale(1.06);
      }
    }

    &--selected {
      background: $primary;
      color: white;
      font-weight: 700;
      border-color: $primary;
    }

    &--v-invalid {
      background: $negative !important;
      color: white !important;
      border-color: rgba($negative, 0.1) !important;
    }

    &--maxed {
      cursor: not-allowed;
      opacity: 0.35;
      pointer-events: none;
    }
  }
}

body.body--dark .bingo-board__cell {
  background: rgba(255, 255, 255, 0.04);
  color: #475569;
  &--called {
    color: white;
    background: $primary;
    font-weight: 700;
    border-color: $indigo-3;
  }
  &--selected {
    color: white;
    background: $primary;
    font-weight: 700;
    border-color: $indigo-3;
  }
}

// ─── Bingo Card (player) ────────────────────────────────────────────────────
.bingo-card {
  max-width: 380px;

  &__header {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
    margin-bottom: 6px;
  }

  &__header-cell {
    text-align: center;
    font-weight: 800;
    font-size: 20px;
    padding: 10px 0;
    border-radius: 12px;
    color: white;
  }

  &__row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
    margin-bottom: 6px;
  }

  &__cell {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    position: relative;
    background: rgba(0, 0, 0, 0.03);
    user-select: none;

    &--clickable {
      cursor: pointer;
      &:hover {
        border-color: $primary;
        background: rgba(79, 70, 229, 0.06);
      }
      &:active {
        transform: scale(0.95);
      }
    }

    &--marked {
      background: rgba(79, 70, 229, 0.12);
      border-color: $primary;
      color: $primary;
    }

    &--free {
      background: rgba(245, 158, 11, 0.1);
      border-color: #f59e0b;
      cursor: default;
    }
  }
}

body.body--dark .bingo-card__cell {
  background: rgba(255, 255, 255, 0.04);
}

body.body--dark .bingo-card__cell--marked {
  background: rgba(79, 70, 229, 0.2);
}

body.body--dark .bingo-card__cell--free {
  background: rgba(245, 158, 11, 0.15);
}

.marked-icon {
  position: absolute;
  top: 2px;
  right: 2px;
}

// ─── Bingo Shout Button ─────────────────────────────────────────────────────
.bingo-shout-btn {
  border-radius: 16px;
  font-size: 18px;
  letter-spacing: 2px;
  transition: all 0.3s ease;

  &--ready {
    animation: pulse-bingo 1.5s infinite;
  }
}

@keyframes pulse-bingo {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5);
  }
  50% {
    box-shadow: 0 0 0 14px rgba(245, 158, 11, 0);
  }
}

// ─── Animations ──────────────────────────────────────────────────────────────
.bingo-pop-enter-active {
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bingo-pop-leave-active {
  animation: pop-out 0.2s ease-in;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.4) rotate(-15deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

@keyframes pop-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.6);
  }
}

.suspense-spin {
  animation: spin-suspense 0.7s linear infinite;
}

@keyframes spin-suspense {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// ─── Celebration ─────────────────────────────────────────────────────────────
.celebration-container {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  top: -10px;
  border-radius: 2px;
  animation: confetti-fall linear forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-10px) rotate(0deg);
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateY(130px) rotate(720deg);
    opacity: 0;
  }
}

// ─── Responsive ──────────────────────────────────────────────────────────────
@media (max-width: 599px) {
  .bingo-ball {
    width: 90px;
    height: 90px;

    &__number {
      font-size: 30px;
    }
    &__letter {
      font-size: 12px;
    }
  }

  .bingo-card {
    max-width: 100%;

    &__header-cell {
      font-size: 16px;
      padding: 8px 0;
    }

    &__cell {
      font-size: 15px;
      border-radius: 8px;
    }
  }

  .bingo-board {
    &__header {
      font-size: 14px;
      padding: 6px 0;
    }
    &__cell {
      font-size: 11px;
      padding: 3px 1px;
    }
  }
}
</style>
