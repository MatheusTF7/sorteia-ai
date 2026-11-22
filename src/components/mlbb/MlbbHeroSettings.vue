<template>
  <div class="hero-settings">
    <h3>{{ t('mlbb.heroDraw') }}</h3>
    <p>{{ t('mlbb.heroDrawHint') }}</p>
    <q-select
      v-model="settings.classes"
      outlined
      multiple
      emit-value
      map-options
      use-chips
      :options="classOptions"
      :label="t('mlbb.baseClasses')"
    />
    <q-select
      v-model="settings.bannedIds"
      class="q-mt-md"
      outlined
      multiple
      emit-value
      map-options
      use-input
      use-chips
      input-debounce="0"
      :options="filteredHeroes"
      :label="t('mlbb.bannedHeroes')"
      @filter="filterHeroes"
    >
      <template #option="scope"
        ><q-item v-bind="scope.itemProps"
          ><q-item-section avatar
            ><q-avatar
              ><img :src="mlbbHeroImage(scope.opt.hero)" alt="" /></q-avatar></q-item-section
          ><q-item-section>{{ scope.opt.label }}</q-item-section
          ><q-item-section side
            ><q-icon
              :name="
                settings.bannedIds.includes(scope.opt.value) ? 'block' : 'add'
              " /></q-item-section></q-item
      ></template>
    </q-select>
    <p v-if="!pools.length" class="text-negative" role="alert">{{ t('mlbb.noHeroPool') }}</p>
    <p v-else>{{ t('mlbb.availableClasses', { count: pools.length }) }}</p>
    <q-expansion-item icon="manage_search" :label="t('mlbb.editHeroClasses')">
      <p class="q-mt-sm">{{ t('mlbb.unclassifiedHint', { count: unclassified }) }}</p>
      <q-select
        v-model="editingId"
        outlined
        emit-value
        map-options
        use-input
        :options="filteredHeroes"
        :label="t('mlbb.chooseHero')"
        @filter="filterHeroes"
      />
      <q-select
        v-if="editingId"
        :model-value="
          settings.overrides[editingId] ??
          mlbbHeroes.find((hero) => hero.id === editingId)?.classes ??
          []
        "
        outlined
        multiple
        emit-value
        map-options
        use-chips
        :options="classOptions"
        :label="t('mlbb.baseClasses')"
        class="q-mt-md"
        @update:model-value="(value) => (settings.overrides[editingId] = value)"
      />
    </q-expansion-item>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { mlbbHeroes, mlbbHeroImage } from 'src/data/mlbb/catalog';
import { MLBB_CLASSES, heroPools } from 'src/utils/mlbb-heroes';
import type { MlbbHeroSettings } from 'src/utils/mlbb-heroes';
const settings = defineModel<MlbbHeroSettings>({ required: true });
const { t } = useI18n();
const classOptions = computed(() =>
  MLBB_CLASSES.map((value) => ({ value, label: t(`mlbb.classes.${value}`) })),
);
const options = mlbbHeroes
  .map((hero) => ({ value: hero.id, label: hero.name, hero }))
  .sort((a, b) => a.label.localeCompare(b.label));
const filteredHeroes = ref(options);
const editingId = ref('');
function filterHeroes(value: string, update: (callback: () => void) => void) {
  update(() => {
    filteredHeroes.value = options.filter((option) =>
      option.label.toLocaleLowerCase().includes(value.toLocaleLowerCase()),
    );
  });
}
const pools = computed(() => heroPools(mlbbHeroes, settings.value));
const unclassified = computed(
  () =>
    mlbbHeroes.filter((hero) => !(settings.value.overrides[hero.id] ?? hero.classes).length).length,
);
</script>
<style scoped>
.hero-settings {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--mlbb-border);
}
h3 {
  font-size: 1.125rem;
  margin: 0;
}
p {
  font-size: 0.875rem;
  color: var(--mlbb-muted);
  line-height: 1.6;
  margin: 12px 0;
}
</style>
