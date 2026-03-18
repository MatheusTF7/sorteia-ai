<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-mb-sm">
      <div>
        <div class="text-h5 text-weight-bold">{{ t('savedLists.pageTitle') }}</div>
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
                <div class="text-subtitle1 text-weight-medium ellipsis">{{ list.name }}</div>
                <div class="text-caption text-grey-7">
                  {{ t('savedLists.itemCount', { count: list.items.length }) }}
                </div>
              </div>
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
import { useSavedConfigs } from 'src/composables/useSavedConfigs';

const { t } = useI18n();

interface SavedList {
  [key: string]: string | string[];
  id: string;
  name: string;
  items: string[];
  createdAt: string;
}

const { data: lists } = useSavedConfigs<SavedList[]>('saved_lists', []);

// ─── Dialog (create / edit) ───────────────────────────────────────────────────
const dialogOpen = ref(false);
const editingList = ref<SavedList | null>(null);
const form = ref<{ name: string; items: string[] }>({ name: '', items: [] });
const itemInput = ref('');

function openCreate() {
  editingList.value = null;
  form.value = { name: '', items: [] };
  itemInput.value = '';
  dialogOpen.value = true;
}

function openEdit(list: SavedList) {
  editingList.value = list;
  form.value = { name: list.name, items: [...list.items] };
  itemInput.value = '';
  dialogOpen.value = true;
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

  if (editingList.value) {
    const idx = lists.value.findIndex((l) => l.id === editingList.value!.id);
    if (idx !== -1) {
      lists.value[idx] = {
        id: editingList.value.id,
        createdAt: editingList.value.createdAt,
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
