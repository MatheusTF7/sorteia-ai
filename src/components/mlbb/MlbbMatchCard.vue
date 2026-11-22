<template>
  <article
    class="duel"
    :class="{
      'duel--bye': match.status === 'bye',
      'duel--complete': match.result,
      'duel--current': current,
    }"
    :aria-current="current ? 'step' : undefined"
  >
    <div class="duel-heading">
      <span class="text-weight-bold">{{ title || t('mlbb.game', { number }) }}</span>
      <span>MD{{ match.bestOf }}</span>
    </div>
    <div v-if="current" class="duel-current-label">
      <q-icon name="sports_esports" size="18px" />{{ t('mlbb.currentMatch') }}
    </div>
    <div
      v-for="side in sides"
      :key="side.key"
      class="duel-player"
      :class="{ 'duel-player--winner': side.id && match.winnerId === side.id }"
    >
      <q-icon
        :name="side.id && match.winnerId === side.id ? 'emoji_events' : 'person_outline'"
        size="19px"
      />
      <div class="duel-name">
        <span>{{ side.name }}</span>
        <small v-if="side.source && side.id">{{ side.source }}</small>
      </div>
      <strong v-if="match.result?.kind === 'score'">{{ side.score }}</strong>
      <q-icon v-else-if="side.id && match.winnerId === side.id" name="check" size="18px" />
    </div>
    <div v-if="match.result?.games" class="duel-series-details">
      <strong>{{
        t('mlbb.seriesScore', { a: match.result.scoreA, b: match.result.scoreB })
      }}</strong>
      <div v-for="(game, index) in match.result.games" :key="index">
        {{ t('mlbb.gameScoreTitle', { number: index + 1 }) }}: {{ game.scoreA }} ×
        {{ game.scoreB }} · {{ players.find((player) => player.id === game.winnerId)?.name }}
      </div>
    </div>
    <div class="duel-footer">
      <span :class="{ 'text-positive': match.status === 'ready' }">{{
        t(`mlbb.${match.result?.kind === 'wo' ? 'wo' : match.status}`)
      }}</span>
      <q-btn
        v-if="match.status === 'ready' || match.status === 'completed'"
        :flat="!current"
        :unelevated="current"
        dense
        color="primary"
        :label="t(match.result ? 'mlbb.editResult' : 'mlbb.recordResult')"
        @click="$emit('result', match)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MlbbMatch, MlbbPlayer } from 'src/types/mlbb';

const props = defineProps<{
  match: MlbbMatch;
  players: MlbbPlayer[];
  number: number;
  sourceA: string;
  sourceB: string;
  current?: boolean;
  title?: string;
}>();
defineEmits<{ result: [match: MlbbMatch] }>();
const { t } = useI18n();
const sides = computed(() =>
  [
    {
      key: 'a',
      id: props.match.playerAId,
      source: props.sourceA,
      score:
        props.match.result?.games?.length === 1
          ? props.match.result.games[0]?.scoreA
          : props.match.result?.scoreA,
    },
    {
      key: 'b',
      id: props.match.playerBId,
      source: props.sourceB,
      score:
        props.match.result?.games?.length === 1
          ? props.match.result.games[0]?.scoreB
          : props.match.result?.scoreB,
    },
  ].map((side) => ({
    ...side,
    name:
      props.players.find((player) => player.id === side.id)?.name ??
      (props.match.status === 'bye' ? t('mlbb.noOpponent') : side.source),
  })),
);
</script>

<style scoped lang="scss">
.duel {
  border: 1px solid var(--mlbb-border);
  border-radius: 16px;
  background: var(--mlbb-surface);
  overflow: hidden;
  position: relative;
}
.duel--complete {
  border-color: var(--mlbb-complete-border);
}
.duel--bye {
  opacity: 0.75;
}
.duel--current {
  border: 2px solid var(--mlbb-accent);
  box-shadow:
    0 0 0 5px var(--mlbb-accent-soft),
    0 12px 30px #312e8126;
}
.duel--current .duel-heading {
  background: var(--mlbb-accent);
  color: #fff;
}
.duel-current-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  color: var(--mlbb-accent-text);
  background: var(--mlbb-accent-soft);
  font-size: 0.875rem;
  font-weight: 700;
}
.duel--current .duel-name > span {
  font-weight: 700;
}
.duel-heading {
  display: flex;
  justify-content: space-between;
  padding: 12px 14px;
  font-size: 0.875rem;
  color: var(--mlbb-muted);
  background: var(--mlbb-soft);
}
.duel-player {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 58px;
  padding: 10px 14px;
}
.duel-player + .duel-player {
  border-top: 1px solid var(--mlbb-border);
}
.duel-player--winner {
  color: var(--mlbb-winner);
  background: var(--mlbb-winner-bg);
}
.duel-name {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 1rem;
}
.duel-name small {
  display: block;
  color: var(--mlbb-muted);
  font-size: 0.8125rem;
  margin-top: 2px;
}
.duel-name small:first-child {
  display: none;
}
.duel-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid var(--mlbb-border);
  min-height: 49px;
}
.duel-footer > span {
  font-size: 0.8125rem;
  color: var(--mlbb-muted);
}
.duel-series-details {
  padding: 10px 14px;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--mlbb-muted);
  border-top: 1px solid var(--mlbb-border);
  overflow-wrap: anywhere;
}
</style>
