<template>
  <div class="hero-duel">
    <template v-if="pick">
      <div class="hero-class">{{ t('mlbb.classes.' + pick.classId) }}</div>
      <div class="hero-pair">
        <div v-for="(hero, index) in heroes" :key="index" class="hero-slot">
          <q-avatar size="52px"
            ><img v-if="hero" :src="mlbbHeroImage(hero)" :alt="hero.name" /></q-avatar
          ><strong>{{ hero?.name }}</strong
          ><small>{{ index === 0 ? labelA : labelB }}</small>
        </div>
      </div>
    </template>
    <p v-else>{{ t(disabled ? 'mlbb.noHistoricalPick' : 'mlbb.noHeroPool') }}</p>
    <q-btn
      v-if="!disabled"
      flat
      dense
      color="primary"
      icon="shuffle"
      :label="t('mlbb.redrawHeroes')"
      @click="$emit('redraw')"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { mlbbHeroes, mlbbHeroImage } from 'src/data/mlbb/catalog';
import type { MlbbHeroPick } from 'src/utils/mlbb-heroes';
const props = defineProps<{
  pick: MlbbHeroPick | undefined;
  disabled: boolean;
  labelA: string;
  labelB: string;
}>();
defineEmits<{ redraw: [] }>();
const { t } = useI18n();
const heroes = computed(() =>
  [props.pick?.heroAId, props.pick?.heroBId].map((id) => mlbbHeroes.find((hero) => hero.id === id)),
);
</script>
<style scoped>
.hero-duel {
  border-top: 1px solid var(--mlbb-border);
  padding: 12px 14px;
  text-align: center;
}
.hero-class {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--mlbb-accent-text);
  margin-bottom: 12px;
}
.hero-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.hero-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.hero-slot strong,
.hero-slot small {
  overflow-wrap: anywhere;
  max-width: 100%;
  font-size: 0.875rem;
}
.hero-slot small,
p {
  color: var(--mlbb-muted);
  font-size: 0.8125rem;
}
.q-btn {
  margin-top: 8px;
}
</style>
