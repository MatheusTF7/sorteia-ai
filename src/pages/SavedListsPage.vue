<template>
  <q-page class="page-shell">
    <section class="page-hero page-hero--primary">
      <div class="page-hero__main">
        <div class="page-hero__eyebrow">{{ t('nav.savedLists') }}</div>

        <div class="page-hero__headline">
          <div class="page-hero__icon">
            <q-icon name="bookmarks" />
          </div>

          <div class="page-hero__copy">
            <h1 class="page-hero__title cursor-pointer" @click="easterEggClick">
              {{ t('savedLists.pageTitle') }}
            </h1>
            <p class="page-hero__subtitle">{{ t('savedLists.manageDescription') }}</p>
          </div>
        </div>

        <div class="page-hero__meta">
          <div class="metric-pills">
            <div class="metric-pill">
              <span class="metric-pill__label">{{ t('savedLists.pageTitle') }}</span>
              <strong class="metric-pill__value">{{ lists.length }}</strong>
            </div>
            <div class="metric-pill">
              <span class="metric-pill__label">{{ t('savedLists.totalItems') }}</span>
              <strong class="metric-pill__value">{{ totalItems }}</strong>
            </div>
            <div class="metric-pill">
              <span class="metric-pill__label">{{ t('savedLists.isDefault') }}</span>
              <strong class="metric-pill__value">
                {{
                  hasDefaultList ? t('savedLists.defaultStatus') : t('savedLists.noDefaultStatus')
                }}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div class="page-hero__actions">
        <q-btn
          unelevated
          no-caps
          class="app-btn app-btn--primary"
          icon="add"
          :label="t('savedLists.createList')"
          @click="openCreate"
        />
      </div>
    </section>

    <div v-if="sortedLists.length === 0" class="q-mt-lg">
      <div class="empty-state">
        <q-icon name="list_alt" size="40px" />
        <div>{{ t('savedLists.noLists') }}</div>
        <q-btn
          unelevated
          no-caps
          class="app-btn app-btn--primary"
          icon="add"
          :label="t('savedLists.firstList')"
          @click="openCreate"
        />
      </div>
    </div>

    <div v-else class="page-grid page-grid--three">
      <q-card
        v-for="list in sortedLists"
        :key="list.id"
        flat
        class="saved-list-card interactive-card"
      >
        <div class="saved-list-card__header">
          <div>
            <div class="saved-list-card__title">{{ list.name }}</div>
            <div class="saved-list-card__meta">
              {{ t('savedLists.createdAt', { date: formatDate(list.createdAt) }) }}
            </div>
          </div>

          <div class="inline-tool-actions">
            <q-btn
              flat
              round
              :class="['app-icon-btn', { 'app-icon-btn--brand': list.isDefault }]"
              :icon="list.isDefault ? 'star' : 'star_border'"
              @click="setDefault(list)"
            />

            <q-btn flat round class="app-icon-btn" icon="edit" @click="openEdit(list)" />

            <q-btn
              flat
              round
              class="app-icon-btn app-icon-btn--danger"
              icon="delete"
              @click="confirmDelete(list)"
            />
          </div>
        </div>

        <div class="saved-list-card__footer">
          <q-badge v-if="list.isDefault" color="warning" text-color="dark">
            {{ t('savedLists.isDefault') }}
          </q-badge>

          <div class="saved-list-card__meta">
            {{ t('savedLists.itemCount', { count: list.items.length }) }}
          </div>
        </div>

        <div v-if="list.items.length === 0" class="empty-state empty-state--compact q-mt-md">
          <q-icon name="tag" size="24px" />
          <div>{{ t('savedLists.noItems') }}</div>
        </div>

        <div v-else class="saved-list-card__tags">
          <div v-for="item in list.items.slice(0, 8)" :key="item" class="tag-pill">
            {{ item }}
          </div>
          <div v-if="list.items.length > 8" class="tag-pill">+{{ list.items.length - 8 }}</div>
        </div>
      </q-card>
    </div>

    <q-dialog v-model="dialogOpen" persistent>
      <q-card flat class="dialog-card">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">
              {{ editingList ? t('savedLists.editList') : t('savedLists.createList') }}
            </div>
            <div class="dialog-caption">{{ t('savedLists.manageDescription') }}</div>
          </div>

          <q-btn v-close-popup flat round class="app-icon-btn" icon="close" />
        </q-card-section>

        <q-card-section class="dialog-body panel-card__body--spacious">
          <q-input
            v-model="form.name"
            :label="t('savedLists.listName')"
            outlined
            dense
            autofocus
            class="app-field"
          />

          <q-toggle v-model="form.isDefault" :label="t('savedLists.setDefault')" />

          <q-input
            v-model="itemInput"
            :label="t('savedLists.addItemsLabel')"
            outlined
            dense
            class="app-field"
            @keyup.enter="addItems"
          >
            <template #append>
              <q-btn
                flat
                round
                class="app-icon-btn app-icon-btn--brand"
                icon="add"
                @click="addItems"
              />
            </template>
          </q-input>

          <div class="field-hint">{{ t('savedLists.addItemsHint') }}</div>

          <div v-if="form.items.length === 0" class="empty-state empty-state--compact">
            <q-icon name="sell" size="24px" />
            <div>{{ t('savedLists.noItems') }}</div>
          </div>

          <div v-else class="tag-grid">
            <q-chip
              v-for="(item, index) in form.items"
              :key="`${item}-${index}`"
              removable
              dense
              @remove="removeItem(index)"
            >
              {{ item }}
            </q-chip>
          </div>
        </q-card-section>

        <div class="dialog-actions">
          <q-btn v-close-popup outline no-caps class="app-btn app-btn--secondary">
            {{ t('savedLists.cancel') }}
          </q-btn>
          <q-btn
            unelevated
            no-caps
            class="app-btn app-btn--primary"
            :disable="!form.name.trim()"
            @click="saveList"
          >
            {{ t('savedLists.save') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialogOpen">
      <q-card flat class="dialog-card">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">{{ t('savedLists.deleteList') }}</div>
            <div class="dialog-caption">
              {{ t('savedLists.confirmDelete', { name: deletingList?.name }) }}
            </div>
          </div>

          <q-btn v-close-popup flat round class="app-icon-btn" icon="close" />
        </q-card-section>

        <div class="dialog-actions">
          <q-btn v-close-popup outline no-caps class="app-btn app-btn--secondary">
            {{ t('savedLists.cancel') }}
          </q-btn>
          <q-btn unelevated no-caps class="app-btn app-btn--danger" @click="doDelete">
            {{ t('savedLists.confirm') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useSavedConfigs } from 'src/composables/useSavedConfigs';
import { parseDelimitedEntries, type SavedList } from 'src/utils/draw';

const { t, locale } = useI18n();
const $q = useQuasar();

const { data: lists } = useSavedConfigs<SavedList[]>('saved_lists', []);

const EASTER_EGG_ITEMS = [
  'Matheus',
  'Pedro Henrique',
  'Caio',
  'Rafael',
  'Anderson',
  'Jefferson',
  'Marcellus',
];
const EASTER_EGG_TOTAL = 8;
const EASTER_EGG_HINT_FROM = 5;

let eggClicks = 0;
let eggTimer: ReturnType<typeof setTimeout> | null = null;
let eggNotifyDismiss: (() => void) | null = null;

const totalItems = computed(() =>
  lists.value.reduce((total, currentList) => total + currentList.items.length, 0),
);

const hasDefaultList = computed(() => lists.value.some((list) => list.isDefault));

const sortedLists = computed(() =>
  [...lists.value].sort((first, second) => {
    if (first.isDefault !== second.isDefault) {
      return Number(second.isDefault) - Number(first.isDefault);
    }

    return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
  }),
);

function easterEggClick() {
  if (lists.value.some((list) => list.id === '77777777-7777-7777-7777-777777777777')) return;

  eggClicks += 1;

  if (eggTimer) clearTimeout(eggTimer);
  eggTimer = setTimeout(() => {
    eggClicks = 0;
    eggNotifyDismiss?.();
    eggNotifyDismiss = null;
  }, 3000);

  if (eggClicks >= EASTER_EGG_HINT_FROM && eggClicks < EASTER_EGG_TOTAL) {
    const remaining = EASTER_EGG_TOTAL - eggClicks;
    const message = `Faltam +${remaining} toque${remaining > 1 ? 's' : ''} para carregar a lista do admin`;

    eggNotifyDismiss?.();
    eggNotifyDismiss = $q.notify({
      message,
      color: 'grey-8',
      position: 'bottom',
      timeout: 0,
      icon: 'touch_app',
    });
  }

  if (eggClicks >= EASTER_EGG_TOTAL) {
    eggClicks = 0;
    if (eggTimer) clearTimeout(eggTimer);
    eggNotifyDismiss?.();
    eggNotifyDismiss = null;
    activateEasterEgg();
  }
}

function activateEasterEgg() {
  lists.value.forEach((list) => {
    list.isDefault = false;
  });

  lists.value.unshift({
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Admin',
    items: [...EASTER_EGG_ITEMS],
    createdAt: new Date().toISOString(),
    isDefault: true,
  });

  $q.notify({
    message: 'Lista do admin carregada como padrão!',
    color: 'warning',
    textColor: 'dark',
    position: 'bottom',
    timeout: 2500,
    icon: 'star',
  });
}

const dialogOpen = ref(false);
const editingList = ref<SavedList | null>(null);
const form = ref<{ name: string; items: string[]; isDefault: boolean }>({
  name: '',
  items: [],
  isDefault: false,
});
const itemInput = ref('');

function openCreate() {
  editingList.value = null;
  form.value = { name: '', items: [], isDefault: false };
  itemInput.value = '';
  dialogOpen.value = true;
}

function openEdit(list: SavedList) {
  editingList.value = list;
  form.value = { name: list.name, items: [...list.items], isDefault: list.isDefault };
  itemInput.value = '';
  dialogOpen.value = true;
}

function setDefault(list: SavedList) {
  const nextValue = !list.isDefault;
  lists.value.forEach((currentList) => {
    currentList.isDefault = currentList.id === list.id ? nextValue : false;
  });
}

function addItems() {
  const raw = itemInput.value.trim();
  if (!raw) return;

  parseDelimitedEntries(raw).forEach((item) => {
    if (!form.value.items.includes(item)) {
      form.value.items.push(item);
    }
  });

  itemInput.value = '';
}

function removeItem(index: number) {
  form.value.items.splice(index, 1);
}

function saveList() {
  if (itemInput.value.trim()) addItems();
  if (!form.value.name.trim()) return;

  if (form.value.isDefault) {
    lists.value.forEach((list) => {
      list.isDefault = false;
    });
  }

  if (editingList.value) {
    const index = lists.value.findIndex((list) => list.id === editingList.value?.id);
    if (index !== -1) {
      lists.value[index] = {
        id: editingList.value.id,
        createdAt: editingList.value.createdAt,
        isDefault: form.value.isDefault,
        name: form.value.name.trim(),
        items: [...form.value.items],
      };
    }
  } else {
    lists.value.push({
      id: crypto.randomUUID(),
      name: form.value.name.trim(),
      items: [...form.value.items],
      createdAt: new Date().toISOString(),
      isDefault: form.value.isDefault,
    });
  }

  dialogOpen.value = false;
}

const deleteDialogOpen = ref(false);
const deletingList = ref<SavedList | null>(null);

function confirmDelete(list: SavedList) {
  deletingList.value = list;
  deleteDialogOpen.value = true;
}

function doDelete() {
  if (!deletingList.value) return;

  const index = lists.value.findIndex((list) => list.id === deletingList.value?.id);
  if (index !== -1) {
    lists.value.splice(index, 1);
  }

  deleteDialogOpen.value = false;
  deletingList.value = null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
</script>
