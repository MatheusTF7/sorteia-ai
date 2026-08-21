<template>
  <q-page class="coin-dice-page q-pa-md q-pa-sm-lg">
    <header class="page-heading text-center">
      <div class="heading-icon" aria-hidden="true"><q-icon name="casino" size="30px" /></div>
      <h1 class="page-title text-gradient">{{ t('coinDice.pageTitle') }}</h1>
      <p class="page-subtitle">{{ t('coinDice.pageSubtitle') }}</p>
    </header>

    <main class="game-shell">
      <div class="mode-picker" role="tablist" :aria-label="t('coinDice.modeLabel')">
        <button
          v-for="option in modeOptions"
          :key="option.value"
          type="button"
          class="mode-option"
          :class="{ 'mode-option--active': mode === option.value }"
          role="tab"
          :aria-selected="mode === option.value"
          :disabled="isAnimating"
          @click="selectMode(option.value)"
        >
          <span class="mode-option__icon"><q-icon :name="option.icon" size="23px" /></span>
          <span>
            <strong>{{ option.label }}</strong>
            <small>{{ option.description }}</small>
          </span>
          <q-icon v-if="mode === option.value" name="check_circle" class="mode-check" size="20px" />
        </button>
      </div>

      <div class="content-grid">
        <q-card flat class="config-card">
          <q-card-section class="q-pa-lg">
            <div class="section-heading">
              <span class="section-icon"><q-icon name="tune" size="21px" /></span>
              <div>
                <div class="section-title">{{ t('coinDice.configTitle') }}</div>
                <div class="section-caption">
                  {{
                    mode === 'coin'
                      ? t('coinDice.coin.configDescription')
                      : t('coinDice.dice.configDescription')
                  }}
                </div>
              </div>
            </div>

            <template v-if="mode === 'coin'">
              <div class="coin-preview-row">
                <div class="coin-mini" aria-hidden="true">S</div>
                <div class="col">
                  <div class="text-weight-bold">{{ t('coinDice.coin.fairCoin') }}</div>
                  <div class="text-caption config-muted">{{ t('coinDice.coin.equalChance') }}</div>
                </div>
                <q-badge rounded color="positive" :label="t('coinDice.ready')" />
              </div>
            </template>

            <template v-else>
              <label class="field-label" for="dice-faces">{{ t('coinDice.dice.faces') }}</label>
              <div class="face-presets q-mb-md">
                <button
                  v-for="preset in facePresets"
                  :key="preset"
                  type="button"
                  class="preset-button"
                  :class="{ 'preset-button--active': diceFaces === preset }"
                  :disabled="isAnimating"
                  @click="diceFaces = preset"
                >
                  d{{ preset }}
                </button>
              </div>

              <q-input
                id="dice-faces"
                v-model.number="diceFaces"
                type="number"
                outlined
                dense
                :min="MIN_FACES"
                :max="MAX_FACES"
                :disable="isAnimating"
                :label="t('coinDice.dice.customFaces')"
                :hint="t('coinDice.dice.facesHint')"
                @blur="normalizeFaces"
              >
                <template #prepend><q-icon name="interests" /></template>
              </q-input>

              <div class="quantity-row">
                <div>
                  <div class="field-label q-mb-none">{{ t('coinDice.dice.quantity') }}</div>
                  <div class="text-caption config-muted">{{ t('coinDice.dice.quantityHint') }}</div>
                </div>
                <div class="stepper" role="group" :aria-label="t('coinDice.dice.quantity')">
                  <q-btn
                    flat
                    round
                    dense
                    icon="remove"
                    :disable="isAnimating || diceQuantity <= MIN_DICE"
                    :aria-label="t('coinDice.dice.decrease')"
                    @click="diceQuantity--"
                  />
                  <span aria-live="polite">{{ diceQuantity }}</span>
                  <q-btn
                    flat
                    round
                    dense
                    icon="add"
                    :disable="isAnimating || diceQuantity >= MAX_DICE"
                    :aria-label="t('coinDice.dice.increase')"
                    @click="diceQuantity++"
                  />
                </div>
              </div>
            </template>

            <q-btn
              unelevated
              color="primary"
              class="action-button full-width"
              :icon="mode === 'coin' ? 'toll' : 'casino'"
              :label="actionLabel"
              :loading="isAnimating"
              :disable="!configurationIsValid"
              @click="runDraw"
            />
            <div class="keyboard-hint">
              <q-icon name="touch_app" size="17px" />{{ interactionHint }}
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="stage-card">
          <q-card-section class="stage-section">
            <div class="stage-topline">
              <div>
                <div class="section-title">{{ t('coinDice.resultTitle') }}</div>
                <div class="section-caption">{{ resultCaption }}</div>
              </div>
              <q-badge v-if="hasResult" outline color="primary" rounded>{{
                t('coinDice.lastDraw')
              }}</q-badge>
            </div>

            <div
              ref="resultStage"
              class="result-stage"
              :class="{ 'result-stage--active': hasResult }"
              tabindex="-1"
            >
              <template v-if="mode === 'coin'">
                <div
                  class="coin-scene interactive-draw"
                  :class="{ 'coin-scene--idle': coinResult === null }"
                  role="button"
                  tabindex="0"
                  :aria-label="t('coinDice.coin.flip')"
                  :aria-disabled="isAnimating"
                  @click="runDraw"
                  @keydown.enter.stop.prevent="runDraw"
                  @keydown.space.stop.prevent="runDraw"
                >
                  <div :key="coinAnimationKey" class="coin-toss" :class="coinAnimationClass">
                    <div class="coin-object">
                      <div class="coin-face coin-face--heads">
                        <span class="coin-mark">{{ headsSymbol }}</span>
                        <span class="coin-face-label">{{ t('coinDice.coin.heads') }}</span>
                      </div>
                      <div class="coin-face coin-face--tails">
                        <q-icon name="auto_awesome" size="34px" />
                        <span class="coin-face-label">{{ t('coinDice.coin.tails') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <transition name="result-pop" mode="out-in">
                  <div :key="coinResult ?? 'empty'" class="result-copy">
                    <template v-if="coinResult">
                      <span class="result-eyebrow">{{ t('coinDice.result') }}</span>
                      <strong>{{ t(`coinDice.coin.${coinResult}`) }}</strong>
                      <span>{{
                        t('coinDice.coin.landedOn', { result: t(`coinDice.coin.${coinResult}`) })
                      }}</span>
                    </template>
                    <template v-else>
                      <strong>{{ t('coinDice.coin.waitingTitle') }}</strong>
                      <span>{{ t('coinDice.coin.waitingDescription') }}</span>
                    </template>
                  </div>
                </transition>
              </template>

              <template v-else>
                <div
                  class="dice-area interactive-draw"
                  role="button"
                  tabindex="0"
                  :aria-label="t('coinDice.dice.roll')"
                  :aria-disabled="isAnimating"
                  @click="runDraw"
                  @keydown.enter.stop.prevent="runDraw"
                  @keydown.space.stop.prevent="runDraw"
                >
                  <div
                    v-for="(value, index) in displayedDice"
                    :key="`${diceAnimationKey}-${index}`"
                    class="die-wrap"
                    :style="{ '--die-delay': `${index * 70}ms` }"
                  >
                    <div class="die-shadow" />
                    <div class="die" :class="{ 'die--rolling': isAnimating }">
                      <span class="die-type">d{{ normalizedFaces }}</span>
                      <strong>{{ isAnimating ? animatedDice[index] : value }}</strong>
                    </div>
                  </div>
                </div>
                <transition name="result-pop" mode="out-in">
                  <div :key="diceResultKey" class="result-copy dice-result-copy">
                    <template v-if="diceResults.length">
                      <span class="result-eyebrow">{{ t('coinDice.dice.total') }}</span>
                      <strong>{{ diceTotal }}</strong>
                      <span>{{
                        t('coinDice.dice.rollSummary', {
                          quantity: diceResults.length,
                          faces: normalizedFaces,
                        })
                      }}</span>
                    </template>
                    <template v-else>
                      <strong>{{ t('coinDice.dice.waitingTitle') }}</strong>
                      <span>{{ t('coinDice.dice.waitingDescription') }}</span>
                    </template>
                  </div>
                </transition>
              </template>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <q-card v-if="history.length" flat class="history-card">
        <q-card-section class="history-header">
          <div class="section-heading q-mb-none">
            <span class="section-icon"><q-icon name="history" size="21px" /></span>
            <div>
              <div class="section-title">{{ t('coinDice.history.title') }}</div>
              <div class="section-caption">{{ t('coinDice.history.description') }}</div>
            </div>
          </div>
          <q-btn
            flat
            dense
            color="grey-7"
            icon="delete_outline"
            :label="t('coinDice.history.clear')"
            @click="history = []"
          />
        </q-card-section>
        <q-separator />
        <q-card-section class="history-list">
          <div v-for="entry in history" :key="entry.id" class="history-item">
            <span class="history-item__icon"
              ><q-icon :name="entry.type === 'coin' ? 'toll' : 'casino'" size="19px"
            /></span>
            <div class="col history-item__copy">
              <strong>{{ entry.label }}</strong
              ><small>{{ entry.detail }}</small>
            </div>
            <time>{{ entry.time }}</time>
          </div>
        </q-card-section>
      </q-card>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

type DrawMode = 'coin' | 'dice';
type CoinSide = 'heads' | 'tails';

interface HistoryEntry {
  id: number;
  type: DrawMode;
  label: string;
  detail: string;
  time: string;
}

const MIN_FACES = 2;
const MAX_FACES = 100;
const MIN_DICE = 1;
const MAX_DICE = 10;
const HEAD_SYMBOLS = ['😃', '👽', '🤡', '🐵', '🐶', '🐱', '👻', '💩', '🥶', '👾', '🤖', '🤫'];
const { t, locale } = useI18n();
const mode = ref<DrawMode>('coin');
const diceFaces = ref(6);
const diceQuantity = ref(1);
const coinResult = ref<CoinSide | null>(null);
const headsSymbol = ref(randomItem(HEAD_SYMBOLS));
const diceResults = ref<number[]>([]);
const animatedDice = ref<number[]>([]);
const isAnimating = ref(false);
const coinAnimationKey = ref(0);
const diceAnimationKey = ref(0);
const history = ref<HistoryEntry[]>([]);
const resultStage = ref<HTMLElement | null>(null);
let animationTimer: ReturnType<typeof setTimeout> | undefined;
let shuffleTimer: ReturnType<typeof setInterval> | undefined;

const facePresets = [4, 6, 8, 10, 12, 20, 100];
const modeOptions = computed(() => [
  {
    value: 'coin' as const,
    icon: 'toll',
    label: t('coinDice.coin.title'),
    description: t('coinDice.coin.modeDescription'),
  },
  {
    value: 'dice' as const,
    icon: 'casino',
    label: t('coinDice.dice.title'),
    description: t('coinDice.dice.modeDescription'),
  },
]);
const normalizedFaces = computed(() =>
  clamp(Math.round(Number(diceFaces.value) || 6), MIN_FACES, MAX_FACES),
);
const configurationIsValid = computed(
  () =>
    !isAnimating.value &&
    (mode.value === 'coin' ||
      (diceFaces.value >= MIN_FACES &&
        diceFaces.value <= MAX_FACES &&
        diceQuantity.value >= MIN_DICE &&
        diceQuantity.value <= MAX_DICE)),
);
const hasResult = computed(() =>
  mode.value === 'coin' ? coinResult.value !== null : diceResults.value.length > 0,
);
const actionLabel = computed(() =>
  isAnimating.value
    ? mode.value === 'coin'
      ? t('coinDice.coin.flipping')
      : t('coinDice.dice.rolling')
    : mode.value === 'coin'
      ? t('coinDice.coin.flip')
      : t('coinDice.dice.roll'),
);
const interactionHint = computed(() =>
  mode.value === 'coin' ? t('coinDice.coin.interactionHint') : t('coinDice.dice.interactionHint'),
);
const resultCaption = computed(() =>
  hasResult.value
    ? t('coinDice.resultReady')
    : mode.value === 'coin'
      ? t('coinDice.coin.empty')
      : t('coinDice.dice.empty'),
);
const coinAnimationClass = computed(() =>
  mode.value === 'coin' && coinResult.value ? `coin-toss--${coinResult.value}` : '',
);
const displayedDice = computed(() => {
  if (isAnimating.value && mode.value === 'dice')
    return Array.from({ length: diceQuantity.value }, (_, index) => animatedDice.value[index] ?? 1);
  if (diceResults.value.length) return diceResults.value;
  return Array.from({ length: diceQuantity.value }, (_, index) =>
    Math.min(index + 1, normalizedFaces.value),
  );
});
const diceTotal = computed(() => diceResults.value.reduce((sum, value) => sum + value, 0));
const diceResultKey = computed(() => diceResults.value.join('-') || 'empty');

function selectMode(value: DrawMode) {
  if (!isAnimating.value) mode.value = value;
}

function normalizeFaces() {
  diceFaces.value = normalizedFaces.value;
}

function runDraw() {
  if (!configurationIsValid.value) return;
  if (mode.value === 'coin') flipCoin();
  else rollDice();
}

function flipCoin() {
  clearAnimationTimers();
  const nextResult: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails';
  if (nextResult === 'heads') headsSymbol.value = randomItem(HEAD_SYMBOLS);
  coinResult.value = nextResult;
  coinAnimationKey.value++;
  isAnimating.value = true;
  animationTimer = setTimeout(() => {
    isAnimating.value = false;
    addHistory({
      type: 'coin',
      label: t(`coinDice.coin.${nextResult}`),
      detail: t('coinDice.history.coinDetail'),
    });
    focusResult();
  }, 1250);
}

function rollDice() {
  clearAnimationTimers();
  normalizeFaces();
  diceAnimationKey.value++;
  diceResults.value = [];
  animatedDice.value = createDiceValues();
  isAnimating.value = true;
  shuffleTimer = setInterval(() => {
    animatedDice.value = createDiceValues();
  }, 85);
  animationTimer = setTimeout(
    () => {
      if (shuffleTimer) clearInterval(shuffleTimer);
      const results = createDiceValues();
      diceResults.value = results;
      animatedDice.value = results;
      isAnimating.value = false;
      addHistory({
        type: 'dice',
        label: results.join(' · '),
        detail: t('coinDice.history.diceDetail', {
          quantity: results.length,
          faces: normalizedFaces.value,
          total: results.reduce((sum, value) => sum + value, 0),
        }),
      });
      focusResult();
    },
    1050 + diceQuantity.value * 70,
  );
}

function focusResult() {
  void nextTick(() => {
    resultStage.value?.focus({ preventScroll: true });
    resultStage.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function createDiceValues() {
  return Array.from({ length: diceQuantity.value }, () => randomInteger(1, normalizedFaces.value));
}

function addHistory(entry: Omit<HistoryEntry, 'id' | 'time'>) {
  const time = new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());
  history.value = [{ ...entry, id: Date.now(), time }, ...history.value].slice(0, 8);
}

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clearAnimationTimers() {
  if (animationTimer) clearTimeout(animationTimer);
  if (shuffleTimer) clearInterval(shuffleTimer);
}

function handleKeyboard(event: KeyboardEvent) {
  if (
    (event.code === 'Space' || event.code === 'Enter') &&
    !(event.target instanceof HTMLInputElement)
  ) {
    event.preventDefault();
    runDraw();
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyboard));
onBeforeUnmount(() => {
  clearAnimationTimers();
  window.removeEventListener('keydown', handleKeyboard);
});
</script>

<style scoped>
.coin-dice-page {
  min-height: calc(100vh - 64px);
  color: var(--sa-text);
  /* background: radial-gradient(circle at 50% 10%, rgba(79, 70, 229, 0.09), transparent 31rem); */
}
.page-heading {
  max-width: 720px;
  margin: 16px auto 30px;
}
.heading-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  margin-bottom: 12px;
  border: 1px solid rgba(79, 70, 229, 0.15);
  border-radius: 19px;
  color: #4f46e5;
  background: linear-gradient(145deg, rgba(79, 70, 229, 0.14), rgba(139, 92, 246, 0.06));
  box-shadow: 0 12px 30px -18px rgba(79, 70, 229, 0.8);
}
.page-title {
  margin: 0 0 8px;
  font-size: clamp(2rem, 4vw, 2.6rem);
  line-height: 1.1;
  letter-spacing: -1.5px;
  font-weight: 800;
}
.page-subtitle {
  margin: 0;
  color: var(--sa-text-muted);
  font-size: 1.05rem;
  line-height: 1.55;
}
.game-shell {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}
.mode-picker {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  max-width: 650px;
  padding: 6px;
  margin: 0 auto 24px;
  border: 1px solid var(--sa-border);
  border-radius: 20px;
  background: var(--sa-surface-strong);
  box-shadow: 0 10px 35px -25px rgba(15, 23, 42, 0.45);
}
.mode-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 68px;
  padding: 10px 42px 10px 12px;
  border: 1px solid transparent;
  border-radius: 15px;
  color: var(--sa-text-muted);
  background: transparent;
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: 180ms ease;
}
.mode-option:hover:not(:disabled) {
  color: var(--sa-text);
  background: var(--sa-surface-muted);
}
.mode-option--active {
  color: #4338ca;
  border-color: rgba(79, 70, 229, 0.12);
  background: rgba(79, 70, 229, 0.09);
}
body.body--dark .mode-option--active {
  color: #a5b4fc;
  background: rgba(99, 102, 241, 0.16);
}
.mode-option__icon,
.section-icon,
.history-item__icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.1);
}
.mode-option strong,
.mode-option small {
  display: block;
}
.mode-option strong {
  margin-bottom: 1px;
  color: inherit;
  font-size: 0.95rem;
}
.mode-option small {
  color: var(--sa-text-muted);
  font-size: 0.74rem;
}
.mode-check {
  position: absolute;
  right: 14px;
  color: #4f46e5;
}
.content-grid {
  display: grid;
  grid-template-columns: minmax(290px, 0.72fr) minmax(430px, 1.28fr);
  gap: 20px;
  align-items: stretch;
}
.config-card,
.stage-card,
.history-card {
  overflow: hidden;
  border: 1px solid var(--sa-border-strong);
  border-radius: 24px;
  background: var(--sa-surface-strong);
  box-shadow: 0 18px 50px -32px rgba(15, 23, 42, 0.42) !important;
}
.section-heading,
.stage-topline,
.history-header,
.quantity-row {
  display: flex;
  align-items: center;
}
.section-heading {
  gap: 12px;
  margin-bottom: 26px;
}
.section-title {
  color: var(--sa-text);
  font-size: 1.05rem;
  font-weight: 750;
}
.section-caption,
.config-muted {
  color: var(--sa-text-muted);
}
.section-caption {
  margin-top: 2px;
  font-size: 0.78rem;
  line-height: 1.4;
}
.coin-preview-row {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 78px;
  padding: 14px;
  margin-bottom: 22px;
  border: 1px solid var(--sa-border);
  border-radius: 16px;
  background: var(--sa-surface-muted);
}
.coin-mini {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 4px solid #f8c44d;
  border-radius: 50%;
  color: #7a4b08;
  background: linear-gradient(145deg, #ffe68c, #e7a72a);
  box-shadow:
    inset -3px -4px 8px rgba(132, 75, 4, 0.28),
    0 6px 14px rgba(186, 120, 13, 0.18);
  font-size: 1.1rem;
  font-weight: 900;
}
.field-label {
  display: block;
  margin: 0 0 9px;
  color: var(--sa-text);
  font-size: 0.84rem;
  font-weight: 700;
}
.face-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
}
.preset-button {
  height: 38px;
  border: 1px solid var(--sa-border-strong);
  border-radius: 11px;
  color: var(--sa-text-muted);
  background: var(--sa-surface-strong);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 650;
  cursor: pointer;
  transition: 160ms ease;
}
.preset-button:hover:not(:disabled) {
  color: #4f46e5;
  border-color: rgba(79, 70, 229, 0.32);
}
.preset-button--active {
  color: #fff;
  border-color: #4f46e5;
  background: #4f46e5;
  box-shadow: 0 7px 15px -9px #3730a3;
}
.quantity-row {
  justify-content: space-between;
  gap: 15px;
  padding: 18px 0;
  margin-top: 16px;
  border-top: 1px solid var(--sa-border);
}
.stepper {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 1px solid var(--sa-border-strong);
  border-radius: 14px;
  background: var(--sa-surface-muted);
}
.stepper span {
  min-width: 30px;
  color: var(--sa-text);
  text-align: center;
  font-size: 1rem;
  font-weight: 800;
}
.action-button {
  min-height: 48px;
  margin-top: 4px;
  border-radius: 14px;
  box-shadow: 0 13px 24px -15px rgba(79, 70, 229, 0.95);
}
.keyboard-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 12px;
  color: var(--sa-text-muted);
  font-size: 0.72rem;
}
.stage-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 455px;
  padding: 24px;
}
.stage-topline {
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.result-stage {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 340px;
  overflow: hidden;
  border: 1px dashed var(--sa-border-strong);
  border-radius: 20px;
  background:
    radial-gradient(circle at center, rgba(99, 102, 241, 0.1), transparent 46%),
    var(--sa-surface-muted);
}
.result-stage::before {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image: radial-gradient(var(--sa-border-strong) 1px, transparent 1px);
  background-size: 18px 18px;
  content: '';
  mask-image: linear-gradient(to bottom, #000, transparent 80%);
  pointer-events: none;
}
.result-stage:focus-visible,
.interactive-draw:focus-visible {
  outline: 3px solid rgba(79, 70, 229, 0.38);
  outline-offset: 3px;
}
.interactive-draw {
  cursor: pointer;
}
.interactive-draw[aria-disabled='true'] {
  cursor: wait;
}
.coin-scene {
  position: relative;
  z-index: 1;
  width: 146px;
  height: 160px;
  perspective: 900px;
}
.coin-toss {
  width: 126px;
  height: 126px;
  margin: 13px auto 0;
  transform-style: preserve-3d;
}
.coin-object {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: rotateY(0deg) rotateX(8deg);
}
.coin-toss--heads,
.coin-toss--tails {
  animation: coin-flight 1.25s cubic-bezier(0.22, 0.7, 0.22, 1) both;
}
.coin-toss--heads .coin-object {
  animation: coin-spin-heads 1.25s cubic-bezier(0.18, 0.65, 0.2, 1) both;
}
.coin-toss--tails .coin-object {
  animation: coin-spin-tails 1.25s cubic-bezier(0.18, 0.65, 0.2, 1) both;
}
.coin-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 8px solid #efb62e;
  border-radius: 50%;
  backface-visibility: hidden;
  color: #754607;
  background:
    radial-gradient(circle at 34% 28%, rgba(255, 255, 255, 0.82), transparent 16%),
    linear-gradient(145deg, #ffe98f 8%, #f5c84f 55%, #d89517 100%);
  box-shadow:
    inset 0 0 0 3px rgba(255, 248, 190, 0.55),
    inset -9px -10px 17px rgba(125, 72, 3, 0.24),
    0 17px 27px -13px rgba(161, 96, 7, 0.58);
}
.coin-face::after {
  position: absolute;
  inset: 8px;
  border: 2px dashed rgba(129, 76, 6, 0.25);
  border-radius: 50%;
  content: '';
}
.coin-face--tails {
  transform: rotateY(180deg);
}
.coin-mark {
  z-index: 1;
  font-size: 3.2rem;
  line-height: 1;
  font-weight: 900;
  text-shadow: 0 2px 0 rgba(255, 244, 172, 0.65);
}
.coin-face-label {
  z-index: 1;
  font-size: 0.58rem;
  font-weight: 850;
  letter-spacing: 1.7px;
  text-transform: uppercase;
}
.coin-scene--idle .coin-toss {
  animation: coin-idle 3.2s ease-in-out infinite;
}
.result-copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 72px;
  margin-top: 12px;
  text-align: center;
}
.result-copy strong {
  color: var(--sa-text);
  font-size: 1.55rem;
  line-height: 1.25;
}
.result-copy > span:last-child {
  margin-top: 3px;
  color: var(--sa-text-muted);
  font-size: 0.8rem;
}
.result-eyebrow {
  margin-bottom: 2px;
  color: #4f46e5 !important;
  font-size: 0.66rem !important;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.dice-area {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  width: min(100%, 460px);
  margin: 8px auto;
  perspective: 850px;
}
.die-wrap {
  position: relative;
  display: grid;
  place-items: center;
  width: 76px;
  height: 82px;
}
.die {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  border: 1px solid rgba(79, 70, 229, 0.25);
  border-radius: 18px;
  color: #312e81;
  background:
    radial-gradient(circle at 28% 22%, #fff 0, rgba(255, 255, 255, 0.7) 17%, transparent 35%),
    linear-gradient(145deg, #eef2ff, #c7d2fe);
  box-shadow:
    inset -7px -8px 14px rgba(79, 70, 229, 0.14),
    0 14px 25px -15px rgba(49, 46, 129, 0.65);
  transform: rotateX(8deg) rotateY(-8deg);
  transform-style: preserve-3d;
}
body.body--dark .die {
  color: #e0e7ff;
  background:
    radial-gradient(circle at 28% 22%, rgba(255, 255, 255, 0.2), transparent 32%),
    linear-gradient(145deg, #3730a3, #1e1b4b);
}
.die--rolling {
  animation: die-roll 0.72s cubic-bezier(0.22, 0.75, 0.22, 1) var(--die-delay) infinite;
}
.die strong {
  font-size: 1.72rem;
  line-height: 1;
}
.die-type {
  margin-bottom: 4px;
  opacity: 0.68;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}
.die-shadow {
  position: absolute;
  bottom: 0;
  width: 52px;
  height: 11px;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.18);
  filter: blur(5px);
}
.dice-result-copy {
  margin-top: 8px;
}
.dice-result-copy strong {
  font-size: 2.1rem;
}
.history-card {
  margin-top: 20px;
}
.history-header {
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
}
.history-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 14px;
}
.history-item {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid var(--sa-border);
  border-radius: 14px;
  background: var(--sa-surface-muted);
}
.history-item__icon {
  width: 36px;
  height: 36px;
  border-radius: 11px;
}
.history-item__copy {
  min-width: 0;
}
.history-item strong,
.history-item small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.history-item strong {
  color: var(--sa-text);
  font-size: 0.84rem;
}
.history-item small,
.history-item time {
  color: var(--sa-text-muted);
  font-size: 0.68rem;
}
.result-pop-enter-active,
.result-pop-leave-active {
  transition: 220ms ease;
}
.result-pop-enter-from,
.result-pop-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
@keyframes coin-flight {
  0% {
    transform: translateY(8px) scale(0.92);
  }
  42% {
    transform: translateY(-38px) scale(1.06);
  }
  74% {
    transform: translateY(4px) scale(0.98);
  }
  88% {
    transform: translateY(-7px) scale(1.01);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}
@keyframes coin-spin-heads {
  from {
    transform: rotateY(0deg) rotateX(8deg);
  }
  to {
    transform: rotateY(1800deg) rotateX(8deg);
  }
}
@keyframes coin-spin-tails {
  from {
    transform: rotateY(0deg) rotateX(8deg);
  }
  to {
    transform: rotateY(1980deg) rotateX(8deg);
  }
}
@keyframes coin-idle {
  0%,
  100% {
    transform: translateY(1px);
  }
  50% {
    transform: translateY(-7px);
  }
}
@keyframes die-roll {
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}
@media (max-width: 850px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  .stage-card {
    grid-row: 1;
  }
  .stage-section {
    min-height: 420px;
  }
}
@media (max-width: 599px) {
  .coin-dice-page {
    padding-right: 12px;
    padding-left: 12px;
  }
  .page-heading {
    margin-top: 7px;
    margin-bottom: 20px;
  }
  .heading-icon {
    width: 50px;
    height: 50px;
    border-radius: 16px;
  }
  .page-subtitle {
    font-size: 0.9rem;
  }
  .mode-picker {
    gap: 6px;
    padding: 5px;
  }
  .mode-option {
    min-height: 58px;
    padding: 8px 9px;
  }
  .mode-option__icon {
    width: 36px;
    height: 36px;
  }
  .mode-option small,
  .mode-check {
    display: none;
  }
  .config-card,
  .stage-card,
  .history-card {
    border-radius: 20px;
  }
  .stage-section {
    min-height: 380px;
    padding: 18px;
  }
  .result-stage {
    min-height: 305px;
  }
  .die-wrap {
    width: 62px;
    height: 68px;
  }
  .die {
    width: 58px;
    height: 58px;
    border-radius: 15px;
  }
  .die strong {
    font-size: 1.4rem;
  }
  .dice-area {
    gap: 9px;
  }
  .history-list {
    grid-template-columns: 1fr;
  }
  .history-header .q-btn :deep(.q-btn__content > span) {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .coin-toss,
  .coin-object,
  .die,
  .die-shadow {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
