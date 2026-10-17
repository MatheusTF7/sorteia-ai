<template>
  <div>
    <q-select
      v-if="savedLists.length"
      :model-value="selectedListId"
      :options="listOptions"
      outlined
      emit-value
      map-options
      :label="t('shared.loadList')"
      :bg-color="$q.dark.isActive ? 'dark' : 'white'"
      class="q-mb-md"
      @update:model-value="emit('loadList', $event)"
    />
    <p v-else class="text-body2">{{ t('boardSetup.noLists') }}</p>
    <q-btn
      flat
      icon="list_alt"
      color="primary"
      to="/saved-lists"
      :label="t('savedLists.pageTitle')"
      class="q-mb-md"
    />
    <q-input
      v-model="nameInput"
      outlined
      :label="t('boardSetup.addPlayers')"
      :hint="t('boardSetup.addHint')"
      :bg-color="$q.dark.isActive ? 'dark' : 'white'"
      class="q-mb-lg"
      @keyup.enter="addPlayers"
    >
      <template #append>
        <q-btn
          flat
          round
          icon="add"
          color="primary"
          :aria-label="t('boardSetup.addPlayers')"
          :disable="!nameInput.trim()"
          @click="addPlayers"
        />
      </template>
    </q-input>
    <p role="status" aria-live="polite" class="text-body2">
      {{ t('boardSetup.selectedCount', { count: modelValue.length, max: maxPlayers }) }}
    </p>
    <p v-if="names.length > maxPlayers" class="text-body2">
      {{ t('boardSetup.choosePlayers', { max: maxPlayers }) }}
    </p>
    <p v-if="!names.length" class="text-body2">{{ t('boardSetup.emptyPlayers') }}</p>
    <ul v-else class="players-list" role="list">
      <li v-for="name in names" :key="name" class="player-row row items-center q-col-gutter-sm">
        <div :class="$slots.player ? 'col-12 col-sm-6' : 'col-12'">
          <q-checkbox
            :model-value="modelValue"
            :val="name"
            :label="name"
            :disable="modelValue.length >= maxPlayers && !modelValue.includes(name)"
            @update:model-value="emit('update:modelValue', $event)"
          />
        </div>
        <div v-if="$slots.player && modelValue.includes(name)" class="col-12 col-sm-6">
          <slot name="player" :player-name="name" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SavedParticipantList } from 'src/types/saved-lists';

const props = defineProps<{
  savedLists: SavedParticipantList[];
  selectedListId: string;
  names: string[];
  modelValue: string[];
  maxPlayers: number;
}>();
const emit = defineEmits<{
  'update:modelValue': [names: string[]];
  loadList: [id: string];
  addNames: [raw: string];
}>();
const { t } = useI18n();
const nameInput = ref<string>('');
const listOptions = computed(() =>
  props.savedLists.map((list) => ({ label: list.name, value: list.id })),
);
function addPlayers(): void {
  emit('addNames', nameInput.value);
  nameInput.value = '';
}
</script>

<style scoped>
.players-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.player-row {
  padding: 10px 0;
  border-bottom: 1px solid var(--sa-border);
}
</style>
