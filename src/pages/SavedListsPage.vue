<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-mb-sm">
      <div>
        <div class="text-h5 text-weight-bold" @click="easterEggClick">
          {{ t('savedLists.pageTitle') }}
        </div>
        <div class="text-subtitle2 text-grey-7">{{ t('savedLists.pageSubtitle') }}</div>
      </div>
      <q-space />
      <q-btn
        color="primary"
        icon="add"
        :label="t('savedLists.createList')"
        class="q-mt-sm"
        @click="openCreate"
      />
    </div>

    <!-- Empty state -->
    <div v-if="lists.length === 0" class="column items-center q-mt-xl text-grey-6">
      <q-icon name="list_alt" size="4rem" class="q-mb-sm" />
      <div class="text-subtitle1">{{ t('savedLists.noLists') }}</div>
      <div>
        <q-btn
          color="primary"
          icon="add"
          :label="t('savedLists.firstList')"
          class="q-mt-sm"
          @click="openCreate"
        />
      </div>
    </div>

    <!-- Lists grid -->
    <div class="row q-col-gutter-md q-mt-md">
      <div v-for="list in lists" :key="list.id" class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="card full-height">
          <q-card-section>
            <div class="row items-start no-wrap">
              <div class="col">
                <div class="row items-center no-wrap">
                  <div class="text-subtitle1 text-weight-medium ellipsis">{{ list.name }}</div>
                  <q-badge
                    v-if="list.isDefault"
                    color="amber"
                    :label="t('savedLists.isDefault')"
                    class="q-ml-sm"
                  />
                </div>
                <div class="text-caption text-grey-7">
                  {{ t('savedLists.itemCount', { count: list.items.length }) }}
                </div>
              </div>
              <q-btn
                :icon="list.isDefault ? 'star' : 'star_border'"
                flat
                dense
                round
                :color="list.isDefault ? 'amber' : 'grey-5'"
                :title="list.isDefault ? t('savedLists.unsetDefault') : t('savedLists.setDefault')"
                @click="setDefault(list)"
              />
              <q-btn
                icon="edit"
                flat
                dense
                round
                color="primary"
                :title="t('savedLists.editList')"
                @click="openEdit(list)"
              />
              <q-btn
                icon="delete"
                flat
                dense
                round
                color="negative"
                :title="t('savedLists.deleteList')"
                @click="confirmDelete(list)"
              />
            </div>

            <q-separator class="q-my-sm" />

            <div v-if="list.items.length === 0" class="text-caption text-grey-5">
              {{ t('savedLists.noItems') }}
            </div>

            <div v-else class="row q-gutter-xs">
              <q-chip
                v-for="item in list.items.slice(0, 8)"
                :key="item"
                dense
                color="primary"
                text-color="white"
              >
                {{ item }}
              </q-chip>
              <q-chip v-if="list.items.length > 8" dense color="grey-5" text-color="white">
                +{{ list.items.length - 8 }}
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Create / Edit Dialog -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 360px; max-width: 600px; width: 90vw">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ editingList ? t('savedLists.editList') : t('savedLists.createList') }}
          </div>
          <q-space />
          <q-btn
            :icon="form.isDefault ? 'star' : 'star_border'"
            flat
            round
            dense
            :color="form.isDefault ? 'amber' : 'grey-5'"
            :title="form.isDefault ? t('savedLists.unsetDefault') : t('savedLists.setDefault')"
            @click="form.isDefault = !form.isDefault"
          />
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <!-- List name -->
          <q-input v-model="form.name" :label="t('savedLists.listName')" outlined dense autofocus />

          <!-- Add items input -->
          <q-input
            v-model="itemInput"
            :label="t('savedLists.addItemsLabel')"
            outlined
            dense
            :hint="t('savedLists.addItemsHint')"
            @keyup.enter="addItems"
          >
            <template #append>
              <q-btn icon="add" round dense flat @click="addItems" />
            </template>
          </q-input>

          <!-- Added items -->
          <div v-if="form.items.length > 0">
            <div class="text-caption text-grey-7 q-mb-xs">
              {{ t('savedLists.itemsLabel') }} ({{ form.items.length }})
            </div>
            <div class="row q-gutter-xs">
              <q-chip
                v-for="(item, index) in form.items"
                :key="index"
                removable
                color="primary"
                text-color="white"
                @remove="removeItem(index)"
              >
                {{ item }}
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn v-close-popup flat :label="t('savedLists.cancel')" />
          <q-btn
            color="primary"
            :label="t('savedLists.save')"
            :disable="!form.name.trim()"
            @click="saveList"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialogOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t('savedLists.deleteList') }}</div>
        </q-card-section>
        <q-card-section>
          {{ t('savedLists.confirmDelete', { name: deletingList?.name }) }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat :label="t('savedLists.cancel')" />
          <q-btn color="negative" :label="t('savedLists.confirm')" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useSavedConfigs } from 'src/composables/useSavedConfigs';

const { t } = useI18n();
const $q = useQuasar();

interface SavedList {
  [key: string]: string | string[] | boolean;
  id: string;
  name: string;
  items: string[];
  createdAt: string;
  isDefault: boolean;
}

const { data: lists } = useSavedConfigs<SavedList[]>('saved_lists', []);

// ─── Easter egg ──────────────────────────────────────────────────────────────
const EASTER_EGG_ITEMS = [
  'Matheus',
  'Pedro Henrique',
  'Rafael',
  'Jefferson',
  'Gilcelio',
  'Anderson',
  'Caio',
  'Marcellus',
];
const EASTER_EGG_TOTAL = 8;
const EASTER_EGG_HINT_FROM = 5;

let eggClicks = 0;
let eggTimer: ReturnType<typeof setTimeout> | null = null;
let eggNotifyDismiss: (() => void) | null = null;

function easterEggClick() {
  // Disabled if admin list already exists
  if (lists.value.some((l) => l.id === '77777777-7777-7777-7777-777777777777')) return;

  eggClicks++;

  // Reset counter after 3 s of inactivity
  if (eggTimer) clearTimeout(eggTimer);
  eggTimer = setTimeout(() => {
    eggClicks = 0;
    eggNotifyDismiss?.();
    eggNotifyDismiss = null;
  }, 3000);

  if (eggClicks >= EASTER_EGG_HINT_FROM && eggClicks < EASTER_EGG_TOTAL) {
    const remaining = EASTER_EGG_TOTAL - eggClicks;
    const message = `🔐 Faltam +${remaining} toque${remaining > 1 ? 's' : ''} para pré‑carregar a lista do admin`;

    if (eggNotifyDismiss) {
      // Update the existing notification instead of creating a new one
      eggNotifyDismiss();
    }
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
  // Clear default flag from all lists
  for (const l of lists.value) l.isDefault = false;

  // Insert at position 0
  lists.value.unshift({
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Admin',
    items: [...EASTER_EGG_ITEMS],
    createdAt: new Date().toISOString(),
    isDefault: true,
  });

  $q.notify({
    message: '⭐ Lista do admin carregada como padrão!',
    color: 'amber-9',
    textColor: 'white',
    position: 'bottom',
    timeout: 2500,
    icon: 'star',
  });
}

// ─── Dialog (create / edit) ───────────────────────────────────────────────────
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

/** Toggle default — only one list can be default at a time. Clicking the star
 *  of the current default removes it (no default). */
function setDefault(list: SavedList) {
  const next = !list.isDefault;
  for (const l of lists.value) {
    l.isDefault = l.id === list.id ? next : false;
  }
}

/** Split raw input by ,  ;  or . and push each non-empty, non-duplicate token */
function addItems() {
  const raw = itemInput.value;
  if (!raw.trim()) return;

  const parsed = raw
    .split(/[,;.]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const item of parsed) {
    if (!form.value.items.includes(item)) {
      form.value.items.push(item);
    }
  }

  itemInput.value = '';
}

function removeItem(index: number) {
  form.value.items.splice(index, 1);
}

function saveList() {
  // Flush any text still in the input field before saving
  if (itemInput.value.trim()) addItems();
  if (!form.value.name.trim()) return;

  // If this list is being set as default, clear all others first
  if (form.value.isDefault) {
    for (const l of lists.value) l.isDefault = false;
  }

  if (editingList.value) {
    const idx = lists.value.findIndex((l) => l.id === editingList.value!.id);
    if (idx !== -1) {
      lists.value[idx] = {
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

// ─── Delete dialog ────────────────────────────────────────────────────────────
const deleteDialogOpen = ref(false);
const deletingList = ref<SavedList | null>(null);

function confirmDelete(list: SavedList) {
  deletingList.value = list;
  deleteDialogOpen.value = true;
}

function doDelete() {
  if (!deletingList.value) return;
  const idx = lists.value.findIndex((l) => l.id === deletingList.value!.id);
  if (idx !== -1) lists.value.splice(idx, 1);
  deleteDialogOpen.value = false;
  deletingList.value = null;
}
</script>

<style scoped>
.card {
  border-radius: 16px;
}
</style>
