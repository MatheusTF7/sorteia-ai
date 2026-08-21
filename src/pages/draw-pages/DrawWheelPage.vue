<template>
  <q-page class="wheel-page q-pa-md q-pa-sm-lg">
    <header class="text-center q-mb-lg q-mb-md-xl">
      <div class="text-h4 text-weight-bold text-gradient q-mb-sm">
        {{ t('wheel.pageTitle') }}
      </div>
      <div class="text-subtitle1 text-grey-6">
        {{ t('wheel.pageSubtitle') }}
      </div>
    </header>

    <div class="row q-col-gutter-lg items-start">
      <div class="col-12 col-lg-5">
        <q-card flat class="wheel-card shadow-modern">
          <q-card-section class="q-pa-md q-pa-sm-lg">
            <div class="row items-center q-mb-md no-wrap">
              <div>
                <div class="text-h6 text-weight-bold">{{ t('wheel.optionsTitle') }}</div>
                <div class="text-caption text-grey-6">
                  {{ t('wheel.optionCount', { count: items.length }) }}
                </div>
              </div>
              <q-space />
              <q-btn
                flat
                round
                icon="folder_open"
                color="primary"
                class="app-icon-btn q-mr-sm"
                :disable="isSpinning"
                :aria-label="t('wheel.loadOptions')"
                @click="loadDialogOpen = true"
              >
                <q-tooltip>{{ t('wheel.loadOptions') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="save"
                color="primary"
                class="app-icon-btn q-mr-sm"
                :disable="items.length === 0 || hasBlankItem || isSpinning"
                :aria-label="t('shared.saveList')"
                @click="openSaveDialog"
              >
                <q-tooltip>{{ t('shared.saveList') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="shuffle"
                color="secondary"
                class="app-icon-btn"
                :disable="items.length < 2 || isSpinning"
                :aria-label="t('wheel.shuffle')"
                @click="shuffleItems"
              >
                <q-tooltip>{{ t('wheel.shuffle') }}</q-tooltip>
              </q-btn>
            </div>

            <q-input
              v-model="newItem"
              outlined
              :label="t('wheel.addOption')"
              :hint="t('shared.addNamesHint')"
              :disable="isSpinning"
              class="q-mb-lg"
              @keyup.enter="addItems"
            >
              <template #append>
                <q-btn
                  round
                  unelevated
                  color="primary"
                  icon="add"
                  class="app-icon-btn"
                  :disable="!newItem.trim()"
                  :aria-label="t('wheel.add')"
                  @click="addItems"
                />
              </template>
            </q-input>

            <div v-if="items.length === 0" class="empty-options text-center q-pa-xl">
              <q-icon name="donut_large" size="46px" color="grey-5" class="q-mb-sm" />
              <div class="text-weight-medium text-grey-7">{{ t('wheel.noOptions') }}</div>
              <div class="text-caption text-grey-6 q-mt-xs">{{ t('wheel.noOptionsHint') }}</div>
            </div>

            <q-scroll-area
              v-else
              class="options-scroll"
              :style="{ height: optionsScrollHeight }"
              :content-style="{ width: '100%' }"
              :thumb-style="scrollThumbStyle"
              :bar-style="scrollBarStyle"
            >
              <div class="options-list column q-gutter-sm q-pr-md">
                <div
                  v-for="(item, index) in items"
                  :key="item.id"
                  class="option-row row items-center no-wrap q-pa-sm"
                >
                  <div class="position-badge text-caption text-weight-bold q-mr-sm">
                    {{ index + 1 }}
                  </div>

                  <label class="color-control q-mr-sm" :title="t('wheel.changeColor')">
                    <span class="color-swatch" :style="{ backgroundColor: item.color }" />
                    <input
                      v-model="item.color"
                      type="color"
                      :disabled="isSpinning"
                      :aria-label="t('wheel.changeColor')"
                      @change="resetDrawState"
                    />
                  </label>

                  <q-input
                    v-model="item.label"
                    dense
                    outlined
                    :bg-color="$q.dark.isActive ? 'blue-grey-10' : 'white'"
                    class="option-name col"
                    :disable="isSpinning"
                    :aria-label="t('wheel.optionName')"
                    @update:model-value="resetDrawState"
                  />

                  <div class="weight-control q-ml-sm">
                    <q-input
                      v-model.number="item.weight"
                      dense
                      outlined
                      type="number"
                      :bg-color="$q.dark.isActive ? 'blue-grey-10' : 'white'"
                      input-class="text-center text-weight-bold"
                      :min="1"
                      :max="100"
                      :disable="isSpinning"
                      :aria-label="t('wheel.weight')"
                      @blur="normalizeWeight(item)"
                      @update:model-value="resetDrawState"
                    >
                      <template #prepend>
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="remove"
                          :disable="isSpinning || safeWeight(item.weight) <= 1"
                          :aria-label="t('wheel.decreaseWeight')"
                          @click="adjustWeight(item, -1)"
                        />
                      </template>
                      <template #append>
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="add"
                          :disable="isSpinning || safeWeight(item.weight) >= 100"
                          :aria-label="t('wheel.increaseWeight')"
                          @click="adjustWeight(item, 1)"
                        />
                      </template>
                    </q-input>
                    <!-- TODO: verificar um meio melhor de adicionar
                     esta informação pois quebra o layout visual -->
                    <!-- <div class="text-caption text-center text-grey-6 q-mt-xs">
                      {{ formatProbability(item.weight) }}
                    </div> -->
                    <q-tooltip>
                      {{ t('wheel.weightHint') }}
                    </q-tooltip>
                  </div>

                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    color="negative"
                    class="q-ml-xs"
                    :disable="isSpinning"
                    :aria-label="t('wheel.removeOption', { name: item.label })"
                    @click="removeItem(index)"
                  />
                </div>
              </div>
            </q-scroll-area>

            <q-btn
              v-if="items.length > 0"
              outline
              color="primary"
              icon-right="south"
              class="full-width q-mt-md"
              :label="t('wheel.goToWheel')"
              @click="scrollToWheel"
            />

            <div v-if="items.length > 0" class="probability-note row no-wrap q-mt-md q-pa-sm">
              <q-icon name="info" size="18px" color="primary" class="q-mr-sm q-mt-xs" />
              <span class="text-caption text-grey-7">{{ t('wheel.probabilityHint') }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-7">
        <q-card flat class="wheel-card wheel-stage-card shadow-modern">
          <q-card-section class="column items-center q-pa-md q-pa-sm-lg">
            <div
              ref="wheelStageRef"
              class="wheel-stage"
              :class="{ 'wheel-stage--clickable': canSpin }"
              role="button"
              :tabindex="canSpin ? 0 : -1"
              :aria-label="t('wheel.spin')"
              :aria-disabled="!canSpin"
              @click="spin"
              @keydown.enter.prevent="spin"
              @keydown.space.prevent="spin"
            >
              <div class="wheel-pointer" aria-hidden="true">
                <div class="pointer-dot" />
              </div>

              <svg
                class="wheel-svg"
                viewBox="0 0 320 320"
                role="img"
                :aria-label="t('wheel.wheelAriaLabel', { count: items.length })"
              >
                <defs>
                  <filter id="wheel-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="5" stdDeviation="7" flood-opacity="0.18" />
                  </filter>
                </defs>

                <circle cx="160" cy="160" r="151" class="wheel-rim" />

                <g
                  class="wheel-disc"
                  :class="{ 'wheel-disc--spinning': isSpinning }"
                  :style="{ transform: `rotate(${rotation}deg)` }"
                  @transitionend="finishSpin"
                >
                  <template v-if="sectors.length > 0">
                    <g v-for="sector in sectors" :key="sector.item.id">
                      <circle
                        v-if="sectors.length === 1"
                        cx="160"
                        cy="160"
                        r="145"
                        :fill="sector.item.color"
                        class="wheel-sector"
                      />
                      <path
                        v-else
                        :d="sector.path"
                        :fill="sector.item.color"
                        class="wheel-sector"
                      />
                      <g
                        v-if="sector.angle >= 5"
                        :transform="`rotate(${sector.midAngle} 160 160)`"
                        class="wheel-label-group"
                      >
                        <text
                          x="194"
                          y="160"
                          transform="rotate(-90 160 160)"
                          class="wheel-label"
                          :style="{ fontSize: `${wheelLabelFontSize(sector.angle)}px` }"
                        >
                          {{ truncateLabel(sector.item.label, sector.angle) }}
                        </text>
                      </g>
                      <title>
                        {{ sector.item.label }} — {{ formatProbability(sector.item.weight) }}
                      </title>
                    </g>
                  </template>

                  <g v-else>
                    <circle cx="160" cy="160" r="145" class="wheel-empty" />
                    <text x="160" y="149" text-anchor="middle" class="wheel-empty-icon">?</text>
                    <text x="160" y="181" text-anchor="middle" class="wheel-empty-label">
                      {{ t('wheel.emptyWheel') }}
                    </text>
                  </g>

                  <circle cx="160" cy="160" r="25" class="wheel-hub-ring" />
                  <circle cx="160" cy="160" r="17" class="wheel-hub" />
                </g>
              </svg>
            </div>

            <transition name="winner" mode="out-in">
              <div
                v-if="winner"
                :key="winner.id"
                class="winner-panel text-center q-mt-md q-pa-md"
                role="status"
                aria-live="polite"
              >
                <div class="text-caption text-uppercase text-weight-bold winner-kicker">
                  {{ t('wheel.winner') }}
                </div>
                <div class="text-h5 text-weight-bold winner-name q-mt-xs">
                  {{ winner.label }}
                </div>
              </div>
              <div v-else class="wheel-helper text-center q-mt-md q-pa-md text-grey-6">
                {{ isSpinning ? t('wheel.spinning') : t('wheel.ready') }}
              </div>
            </transition>

            <q-btn
              color="primary"
              unelevated
              rounded
              size="lg"
              icon="play_arrow"
              class="spin-button q-mt-md text-weight-bold"
              :label="isSpinning ? t('wheel.spinning') : t('wheel.spin')"
              :loading="isSpinning"
              :disable="!canSpin"
              @click="spin"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="loadDialogOpen" @show="ensurePresetsLoaded">
      <q-card class="load-dialog shadow-modern">
        <q-card-section class="row items-center q-pb-sm">
          <div>
            <div class="text-h6 text-weight-bold">{{ t('wheel.loadTitle') }}</div>
            <div class="text-caption text-grey-6">{{ t('wheel.loadSubtitle') }}</div>
          </div>
          <q-space />
          <q-btn v-close-popup flat round icon="close" color="grey-6" />
        </q-card-section>

        <q-tabs
          v-model="loadTab"
          dense
          align="justify"
          active-color="primary"
          indicator-color="primary"
          class="q-px-md"
        >
          <q-tab name="saved" icon="bookmark" :label="t('wheel.myLists')" />
          <q-tab name="system" icon="auto_awesome" :label="t('wheel.systemLists')" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="loadTab" animated>
          <q-tab-panel name="saved" class="q-pa-md">
            <div v-if="savedLists.length === 0" class="dialog-empty text-center q-pa-xl">
              <q-icon name="bookmark_border" size="38px" color="grey-5" />
              <div class="text-grey-6 q-mt-sm">{{ t('shared.noSavedLists') }}</div>
            </div>
            <div v-else class="column q-gutter-sm">
              <q-card
                v-for="list in savedLists"
                :key="list.id"
                flat
                class="preset-row cursor-pointer q-pa-md"
                @click="loadSavedList(list)"
              >
                <div class="row items-center no-wrap">
                  <q-avatar color="primary" text-color="white" icon="list" size="42px" />
                  <div class="col q-ml-md">
                    <div class="text-weight-bold">{{ list.name }}</div>
                    <div class="text-caption text-grey-6">
                      {{ t('wheel.optionCount', { count: list.items.length }) }}
                    </div>
                  </div>
                  <q-badge
                    v-if="list.isDefault"
                    color="amber-8"
                    :label="t('savedLists.isDefault')"
                  />
                  <q-icon name="chevron_right" color="grey-5" size="22px" class="q-ml-sm" />
                </div>
              </q-card>
            </div>
          </q-tab-panel>

          <q-tab-panel name="system" class="q-pa-md">
            <div v-if="presetsLoading" class="text-center q-pa-xl">
              <q-spinner color="primary" size="36px" />
              <div class="text-grey-6 q-mt-sm">{{ t('wheel.loadingPresets') }}</div>
            </div>
            <div v-else-if="presetsError" class="dialog-empty text-center q-pa-lg">
              <q-icon name="cloud_off" size="38px" color="negative" />
              <div class="text-grey-7 q-mt-sm q-mb-md">{{ t('wheel.presetsError') }}</div>
              <q-btn
                outline
                color="primary"
                icon="refresh"
                :label="t('wheel.tryAgain')"
                @click="loadPresets"
              />
            </div>
            <div v-else class="column q-gutter-sm">
              <q-card
                v-for="preset in systemPresets"
                :key="preset.id"
                flat
                class="preset-row cursor-pointer q-pa-md"
                @click="loadSystemPreset(preset)"
              >
                <div class="row items-center no-wrap">
                  <q-avatar
                    color="secondary"
                    text-color="white"
                    :icon="preset.icon || 'stars'"
                    size="42px"
                  />
                  <div class="col q-ml-md">
                    <div class="text-weight-bold">{{ preset.name }}</div>
                    <div class="text-caption text-grey-6">{{ preset.description }}</div>
                  </div>
                  <q-icon name="chevron_right" color="grey-5" size="22px" />
                </div>
              </q-card>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-dialog>

    <q-dialog v-model="saveDialogOpen">
      <q-card class="save-dialog shadow-modern q-pa-sm">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ t('shared.saveList') }}</div>
          <q-space />
          <q-btn v-close-popup flat round icon="close" color="grey-6" />
        </q-card-section>

        <q-card-section class="q-mt-sm">
          <q-input
            v-model="saveListName"
            outlined
            autofocus
            :label="t('shared.listNameLabel')"
            @keyup.enter="saveCurrentList"
          />
          <div class="text-caption text-grey-6 q-mt-sm">
            {{ t('wheel.saveListHint', { count: items.length }) }}
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            v-close-popup
            flat
            color="grey-7"
            class="text-weight-bold q-px-md"
            :label="t('shared.cancel')"
          />
          <q-btn
            unelevated
            color="primary"
            class="text-weight-bold q-px-md"
            :label="t('shared.save')"
            :disable="!saveListName.trim()"
            @click="saveCurrentList"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useSavedConfigs } from 'src/composables/useSavedConfigs';

interface WheelItem {
  id: string;
  label: string;
  weight: number;
  color: string;
}

interface WheelSector {
  item: WheelItem;
  startAngle: number;
  angle: number;
  midAngle: number;
  path: string;
}

interface SavedWheelItem {
  [key: string]: string | number;
  label: string;
  weight: number;
  color: string;
}

interface SavedList {
  [key: string]: string | string[] | boolean | SavedWheelItem[];
  id: string;
  name: string;
  items: string[];
  createdAt: string;
  isDefault: boolean;
}

interface PresetItem {
  label: string;
  weight?: number;
  color?: string;
}

interface SystemPreset {
  id: string;
  name: string;
  description: string;
  icon?: string;
  items: PresetItem[];
}

interface PresetManifestEntry {
  id: string;
  file: string;
}

const COLORS = [
  '#4F46E5',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#8B5CF6',
  '#F43F5E',
  '#14B8A6',
  '#3B82F6',
  '#D946EF',
  '#84CC16',
  '#F97316',
];
const PRESETS_PATH = 'data/wheel-presets/';
const SPIN_DURATION = 4600;

const { t } = useI18n();
const $q = useQuasar();
const { data: savedLists } = useSavedConfigs<SavedList[]>('saved_lists', []);

const items = ref<WheelItem[]>([]);
const newItem = ref('');
const winner = ref<WheelItem | null>(null);
const pendingWinner = ref<WheelItem | null>(null);
const rotation = ref(0);
const isSpinning = ref(false);
const loadDialogOpen = ref(false);
const saveDialogOpen = ref(false);
const saveListName = ref('');
const wheelStageRef = ref<HTMLElement | null>(null);
const loadTab = ref<'saved' | 'system'>('saved');
const systemPresets = ref<SystemPreset[]>([]);
const presetsLoading = ref(false);
const presetsLoaded = ref(false);
const presetsError = ref(false);
let nextColor = 0;
let spinTimer: ReturnType<typeof setTimeout> | null = null;

const totalWeight = computed(() =>
  items.value.reduce((total, item) => total + safeWeight(item.weight), 0),
);
const hasBlankItem = computed(() => items.value.some((item) => !item.label.trim()));
const canSpin = computed(
  () => items.value.length > 0 && !isSpinning.value && !hasBlankItem.value,
);
const optionsScrollHeight = computed(() => `${Math.min(items.value.length * 78, 480)}px`);
const scrollThumbStyle = {
  right: '1px',
  borderRadius: '6px',
  backgroundColor: '#4f46e5',
  width: '6px',
  opacity: '0.75',
};
const scrollBarStyle = {
  right: '1px',
  borderRadius: '6px',
  backgroundColor: 'rgba(100, 116, 139, 0.16)',
  width: '6px',
  opacity: '1',
};

const sectors = computed<WheelSector[]>(() => {
  if (items.value.length === 0 || totalWeight.value <= 0) return [];

  let startAngle = 0;
  return items.value.map((item) => {
    const angle = (safeWeight(item.weight) / totalWeight.value) * 360;
    const sector: WheelSector = {
      item,
      startAngle,
      angle,
      midAngle: items.value.length === 1 ? 0 : startAngle + angle / 2,
      path: describeSector(startAngle, startAngle + angle),
    };
    startAngle += angle;
    return sector;
  });
});

function safeWeight(value: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(100, Math.max(1, parsed)) : 1;
}

function polarPoint(angle: number, radius = 145) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: 160 + radius * Math.cos(radians),
    y: 160 + radius * Math.sin(radians),
  };
}

function describeSector(startAngle: number, endAngle: number): string {
  const start = polarPoint(startAngle);
  const end = polarPoint(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M 160 160 L ${start.x} ${start.y} A 145 145 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function randomUnit(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return (values[0] ?? 0) / 4294967296;
  }
  return Math.random();
}

function makeItem(label: string, weight = 1, color?: string): WheelItem {
  const assignedColor =
    color && /^#[0-9a-f]{6}$/i.test(color) ? color : COLORS[nextColor % COLORS.length]!;
  nextColor += 1;
  return {
    id: crypto.randomUUID(),
    label: label.trim(),
    weight: safeWeight(weight),
    color: assignedColor,
  };
}

function replaceItems(nextItems: PresetItem[]) {
  nextColor = 0;
  items.value = nextItems
    .filter((item) => typeof item.label === 'string' && item.label.trim())
    .map((item) => makeItem(item.label, item.weight, item.color));
  resetDrawState();
}

function addItems() {
  const parsed = newItem.value
    .split(/[\n,;.]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  if (parsed.length === 0) return;

  items.value.push(...parsed.map((label) => makeItem(label)));
  newItem.value = '';
  resetDrawState();
}

function removeItem(index: number) {
  items.value.splice(index, 1);
  resetDrawState();
}

function normalizeWeight(item: WheelItem) {
  item.weight = safeWeight(item.weight);
  resetDrawState();
}

function adjustWeight(item: WheelItem, amount: -1 | 1) {
  item.weight = safeWeight(safeWeight(item.weight) + amount);
  resetDrawState();
}

function shuffleItems() {
  for (let index = items.value.length - 1; index > 0; index -= 1) {
    const target = Math.floor(randomUnit() * (index + 1));
    const currentItem = items.value[index];
    const targetItem = items.value[target];
    if (currentItem && targetItem) {
      items.value[index] = targetItem;
      items.value[target] = currentItem;
    }
  }
  resetDrawState();
  $q.notify({
    message: t('wheel.shuffled'),
    color: 'secondary',
    position: 'bottom',
    timeout: 1400,
  });
}

function formatProbability(weight: number): string {
  if (totalWeight.value <= 0) return '0%';
  const probability = (safeWeight(weight) / totalWeight.value) * 100;
  const digits = probability >= 10 ? 1 : 2;
  return `${probability.toFixed(digits).replace(/\.0$/, '')}%`;
}

function truncateLabel(label: string, angle: number): string {
  const maximum = angle < 8 ? 6 : angle < 14 ? 9 : angle < 24 ? 12 : 15;
  return label.length > maximum ? `${label.slice(0, maximum - 1)}…` : label;
}

function wheelLabelFontSize(angle: number): number {
  if (angle < 8) return 8;
  if (angle < 14) return 9;
  if (angle < 24) return 10;
  return 11;
}

function resetDrawState() {
  if (isSpinning.value) return;
  winner.value = null;
  pendingWinner.value = null;
  rotation.value = 0;
}

function scrollToWheel() {
  wheelStageRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  wheelStageRef.value?.focus({ preventScroll: true });
}

function spin() {
  if (isSpinning.value || items.value.length === 0 || totalWeight.value <= 0) return;

  winner.value = null;
  let cursor = randomUnit() * totalWeight.value;
  let selectedIndex = items.value.length - 1;
  for (let index = 0; index < items.value.length; index += 1) {
    const item = items.value[index];
    if (!item) continue;
    cursor -= safeWeight(item.weight);
    if (cursor < 0) {
      selectedIndex = index;
      break;
    }
  }

  const selectedSector = sectors.value[selectedIndex];
  if (!selectedSector) return;

  const landingOffset = 0.2 + randomUnit() * 0.6;
  const landingAngle = selectedSector.startAngle + selectedSector.angle * landingOffset;
  const currentModulo = ((rotation.value % 360) + 360) % 360;
  const targetModulo = (360 - landingAngle) % 360;
  const finalOffset = (targetModulo - currentModulo + 360) % 360;

  pendingWinner.value = selectedSector.item;
  isSpinning.value = true;
  rotation.value += 5 * 360 + finalOffset;

  if (spinTimer) clearTimeout(spinTimer);
  spinTimer = setTimeout(finishSpin, SPIN_DURATION + 150);
}

function finishSpin() {
  if (!isSpinning.value || !pendingWinner.value) return;
  isSpinning.value = false;
  winner.value = pendingWinner.value;
  pendingWinner.value = null;
  if (spinTimer) {
    clearTimeout(spinTimer);
    spinTimer = null;
  }
}

function loadSavedList(list: SavedList) {
  const configuredItems = readSavedWheelItems(list);
  replaceItems(configuredItems ?? list.items.map((label) => ({ label })));
  loadDialogOpen.value = false;
  $q.notify({
    message: t('shared.listLoaded', { name: list.name }),
    color: 'positive',
    position: 'bottom',
    timeout: 1800,
  });
}

function readSavedWheelItems(list: SavedList): PresetItem[] | null {
  const stored: unknown = list.wheelItems;
  if (!Array.isArray(stored) || stored.length === 0) return null;

  const configuredItems: PresetItem[] = [];
  for (const value of stored) {
    if (!isRecord(value) || typeof value.label !== 'string') return null;
    const item: PresetItem = { label: value.label };
    if (typeof value.weight === 'number') item.weight = value.weight;
    if (typeof value.color === 'string') item.color = value.color;
    configuredItems.push(item);
  }
  return configuredItems;
}

function openSaveDialog() {
  saveListName.value = '';
  saveDialogOpen.value = true;
}

function saveCurrentList() {
  const name = saveListName.value.trim();
  if (!name || items.value.length === 0 || hasBlankItem.value) return;

  savedLists.value.push({
    id: crypto.randomUUID(),
    name,
    items: items.value.map((item) => item.label.trim()),
    wheelItems: items.value.map((item) => ({
      label: item.label.trim(),
      weight: safeWeight(item.weight),
      color: item.color,
    })),
    createdAt: new Date().toISOString(),
    isDefault: false,
  });

  saveDialogOpen.value = false;
  $q.notify({
    message: t('shared.listSaved', { name }),
    color: 'positive',
    position: 'bottom',
    timeout: 1800,
  });
}

function loadSystemPreset(preset: SystemPreset) {
  replaceItems(preset.items);
  loadDialogOpen.value = false;
  $q.notify({
    message: t('shared.listLoaded', { name: preset.name }),
    color: 'positive',
    position: 'bottom',
    timeout: 1800,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parsePreset(value: unknown, fallbackId: string): SystemPreset | null {
  if (!isRecord(value) || !Array.isArray(value.items)) return null;
  const name = typeof value.name === 'string' ? value.name : fallbackId;
  const description = typeof value.description === 'string' ? value.description : '';
  const icon = typeof value.icon === 'string' ? value.icon : undefined;
  const parsedItems: PresetItem[] = [];

  for (const rawItem of value.items) {
    if (typeof rawItem === 'string') {
      parsedItems.push({ label: rawItem });
    } else if (isRecord(rawItem) && typeof rawItem.label === 'string') {
      const presetItem: PresetItem = { label: rawItem.label };
      if (typeof rawItem.weight === 'number') presetItem.weight = rawItem.weight;
      if (typeof rawItem.color === 'string') presetItem.color = rawItem.color;
      parsedItems.push(presetItem);
    }
  }

  if (parsedItems.length === 0) return null;
  const preset: SystemPreset = { id: fallbackId, name, description, items: parsedItems };
  if (icon) preset.icon = icon;
  return preset;
}

async function loadPresets() {
  presetsLoading.value = true;
  presetsError.value = false;
  try {
    const directoryUrl = new URL(PRESETS_PATH, document.baseURI);
    const manifestResponse = await fetch(new URL('index.json', directoryUrl));
    if (!manifestResponse.ok) throw new Error(`Manifest: ${manifestResponse.status}`);
    const manifest: unknown = await manifestResponse.json();
    if (!isRecord(manifest) || !Array.isArray(manifest.presets))
      throw new Error('Invalid manifest');

    const entries: PresetManifestEntry[] = manifest.presets.filter(
      (entry): entry is PresetManifestEntry =>
        isRecord(entry) && typeof entry.id === 'string' && typeof entry.file === 'string',
    );
    const loaded = await Promise.all(
      entries.map(async (entry) => {
        const response = await fetch(new URL(entry.file, directoryUrl));
        if (!response.ok) throw new Error(`${entry.file}: ${response.status}`);
        return parsePreset((await response.json()) as unknown, entry.id);
      }),
    );

    systemPresets.value = loaded.filter((preset): preset is SystemPreset => preset !== null);
    presetsLoaded.value = true;
  } catch (error) {
    console.warn('[DrawWheelPage] Failed to load system presets', error);
    presetsError.value = true;
  } finally {
    presetsLoading.value = false;
  }
}

function ensurePresetsLoaded() {
  if (!presetsLoaded.value && !presetsLoading.value) void loadPresets();
}

onMounted(() => {
  const defaultList = savedLists.value.find((list) => list.isDefault && list.items.length > 0);
  if (defaultList) {
    const configuredItems = readSavedWheelItems(defaultList);
    replaceItems(configuredItems ?? defaultList.items.map((label) => ({ label })));
  }
});

onBeforeUnmount(() => {
  if (spinTimer) clearTimeout(spinTimer);
});
</script>

<style scoped>
.wheel-page {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.wheel-card {
  border-radius: 24px;
  overflow: hidden;
}

.wheel-stage-card {
  min-height: 640px;
  background:
    radial-gradient(circle at 50% 36%, rgba(79, 70, 229, 0.1), transparent 40%),
    var(--sa-surface-strong);
}

.options-scroll {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  overscroll-behavior: contain;
}

.options-list {
  width: 100%;
  min-width: 0;
}

.option-row,
.preset-row,
.empty-options,
.dialog-empty,
.probability-note {
  border: 1px solid var(--sa-border);
  background: var(--sa-surface-muted);
  border-radius: 16px;
}

.option-row {
  width: 100%;
  min-width: 0;
  min-height: 68px;
}

.position-badge {
  width: 26px;
  height: 26px;
  line-height: 26px;
  text-align: center;
  border-radius: 9px;
  color: var(--sa-text-muted);
  background: var(--sa-surface-strong);
  border: 1px solid var(--sa-border);
  flex: 0 0 auto;
}

.color-control {
  position: relative;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  cursor: pointer;
}

.color-swatch {
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  border: 3px solid var(--sa-surface-strong);
  box-shadow: 0 0 0 1px var(--sa-border-strong);
  pointer-events: none;
}

.color-control input {
  width: 30px;
  height: 30px;
  padding: 0;
  opacity: 0;
  cursor: pointer;
}

.option-name :deep(.q-field__native) {
  color: var(--sa-text);
  font-weight: 600;
}

.option-name {
  min-width: 0;
}

.weight-control {
  width: 124px;
  flex: 0 0 auto;
}

.weight-control :deep(.q-field__control) {
  height: 38px;
  min-height: 38px;
}

.weight-control :deep(.q-field__prepend),
.weight-control :deep(.q-field__append) {
  height: 38px;
  padding: 0;
}

.weight-control :deep(.q-field__native) {
  min-width: 24px;
  padding: 0;
}

.weight-control :deep(input[type='number']) {
  appearance: textfield;
}

.weight-control :deep(input::-webkit-outer-spin-button),
.weight-control :deep(input::-webkit-inner-spin-button) {
  margin: 0;
  appearance: none;
}

.probability-note {
  background: var(--sa-primary-soft);
  border-color: transparent;
}

.wheel-stage {
  position: relative;
  width: min(100%, 530px);
  aspect-ratio: 1;
  padding: 18px;
  border-radius: 50%;
  outline: none;
}

.wheel-stage--clickable {
  cursor: pointer;
}

.wheel-stage--clickable:focus-visible {
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.22);
}

.wheel-stage--clickable .wheel-svg {
  transition: transform 0.2s ease;
}

.wheel-stage--clickable:hover .wheel-svg {
  transform: scale(1.012);
}

.wheel-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.wheel-rim {
  fill: var(--sa-surface-strong);
  stroke: rgba(79, 70, 229, 0.15);
  stroke-width: 7;
  filter: url('#wheel-shadow');
}

.wheel-disc {
  transform-origin: 160px 160px;
  will-change: transform;
}

.wheel-disc--spinning {
  transition: transform 4.6s cubic-bezier(0.12, 0.72, 0.15, 1);
}

.wheel-sector {
  stroke: rgba(255, 255, 255, 0.72);
  stroke-width: 2;
}

.wheel-label {
  fill: #fff;
  font-weight: 700;
  text-anchor: start;
  dominant-baseline: middle;
  paint-order: stroke;
  stroke: rgba(15, 23, 42, 0.2);
  stroke-width: 2px;
  stroke-linejoin: round;
}

.wheel-empty {
  fill: var(--sa-surface-muted);
  stroke: var(--sa-border-strong);
  stroke-width: 2;
  stroke-dasharray: 7 7;
}

.wheel-empty-icon {
  fill: var(--sa-text-muted);
  font-size: 52px;
  font-weight: 300;
}

.wheel-empty-label {
  fill: var(--sa-text-muted);
  font-size: 12px;
  font-weight: 600;
}

.wheel-hub-ring {
  fill: rgba(255, 255, 255, 0.92);
  stroke: rgba(15, 23, 42, 0.12);
  stroke-width: 2;
}

.wheel-hub {
  fill: #4f46e5;
  stroke: rgba(255, 255, 255, 0.9);
  stroke-width: 3;
}

.wheel-pointer {
  position: absolute;
  z-index: 2;
  top: 4px;
  left: 50%;
  width: 40px;
  height: 54px;
  transform: translateX(-50%);
  background: #fff;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
  filter: drop-shadow(0 4px 5px rgba(15, 23, 42, 0.25));
}

.pointer-dot {
  width: 14px;
  height: 14px;
  margin: 4px auto 0;
  border-radius: 50%;
  background: #f43f5e;
}

.winner-panel,
.wheel-helper {
  width: min(100%, 430px);
  min-height: 88px;
  border-radius: 18px;
}

.winner-panel {
  color: var(--sa-text);
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.14), rgba(217, 70, 239, 0.12));
  border: 1px solid rgba(79, 70, 229, 0.18);
}

.winner-kicker {
  color: #4f46e5;
  letter-spacing: 1.4px;
}

body.body--dark .winner-kicker {
  color: #a5b4fc;
}

.winner-name {
  overflow-wrap: anywhere;
}

.wheel-helper {
  display: grid;
  place-items: center;
  border: 1px dashed var(--sa-border-strong);
}

.spin-button {
  width: min(100%, 300px);
  min-height: 54px;
  border-radius: 16px !important;
  box-shadow: 0 12px 25px -12px rgba(79, 70, 229, 0.75);
}

.load-dialog {
  width: min(92vw, 580px);
  min-height: 440px;
  border-radius: 24px;
}

.save-dialog {
  width: min(90vw, 440px);
  border-radius: 24px;
}

.preset-row {
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.preset-row:hover {
  transform: translateX(3px);
  border-color: rgba(79, 70, 229, 0.28);
  background: var(--sa-primary-soft);
}

.winner-enter-active,
.winner-leave-active {
  transition: all 0.25s ease;
}

.winner-enter-from,
.winner-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

@media (max-width: 599px) {
  .wheel-stage-card {
    min-height: auto;
  }

  .wheel-stage {
    padding: 14px;
  }

  .wheel-pointer {
    top: 1px;
    width: 34px;
    height: 46px;
  }

  .wheel-label {
    font-size: 10px;
  }

  .option-row {
    padding-left: 6px;
    padding-right: 4px;
  }

  .position-badge {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wheel-disc--spinning {
    transition-duration: 1.2s;
  }
}
</style>
