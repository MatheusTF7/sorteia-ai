<template>
  <q-page class="q-pa-md setup-page">
    <div class="setup-container">
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        to="/board-games/potion-explosion"
        :label="t('potionSetup.backToGuide')"
        class="q-mb-md"
      />
      <header class="q-mb-lg">
        <p class="text-overline text-primary q-mb-xs">{{ game.title }}</p>
        <h1 class="text-h4 text-weight-bold text-gradient q-mt-none q-mb-sm">
          {{ t('boardGames.prepareMatch') }}
        </h1>
        <p>{{ t('potionSetup.subtitle', { min: game.players.min, max: game.players.max }) }}</p>
      </header>
      <q-banner v-if="!available" rounded role="alert" class="bg-negative text-white">{{
        t('potionSetup.unavailable')
      }}</q-banner>
      <template v-else>
        <q-card flat bordered class="q-mb-lg">
          <q-card-section>
            <h2 class="text-h6 q-mt-none">1. {{ t('boardSetup.players') }}</h2>
            <SetupPlayerPicker
              v-model="selectedNames"
              :saved-lists="savedLists"
              :selected-list-id="selectedListId"
              :names="names"
              :max-players="game.players.max"
              @load-list="loadList"
              @add-names="addNames"
            />
            <p v-if="!canPrepare" class="text-body2">
              {{ t('potionSetup.selectFirst', { min: game.players.min, max: game.players.max }) }}
            </p>
            <q-btn
              color="primary"
              icon="shuffle"
              :label="t('potionSetup.drawAll')"
              :disable="!canPrepare"
              @click="randomizeAll"
              class="q-mt-md"
            />
          </q-card-section>
        </q-card>

        <section aria-labelledby="starter-title" class="q-mb-lg">
          <q-card flat bordered>
            <q-card-section>
              <h2 id="starter-title" class="text-h6 q-mt-none">
                2. {{ t('potionSetup.starter') }}
              </h2>
              <q-btn
                outline
                color="primary"
                icon="shuffle"
                :label="t('potionSetup.drawStarter')"
                :disable="!canPrepare"
                @click="randomizeStarter"
              />
              <p class="text-caption q-mt-sm">{{ t('potionSetup.orderHint') }}</p>
              <div role="status" aria-live="polite" aria-atomic="true">
                <template v-if="order.length">
                  <p class="text-subtitle1 text-weight-bold">
                    {{ t('potionSetup.starts', { name: order[0] }) }}
                  </p>
                  <ol class="q-pl-lg q-mb-none">
                    <li v-for="player in order" :key="player" class="q-mb-xs">{{ player }}</li>
                  </ol>
                </template>
                <p v-else>{{ t('potionSetup.noStarter') }}</p>
              </div>
            </q-card-section>
          </q-card>
        </section>

        <section aria-labelledby="types-title" class="q-mb-lg">
          <q-card flat bordered>
            <q-card-section>
              <h2 id="types-title" class="text-h6 q-mt-none">
                3. {{ t('potionSetup.activeTypes') }}
              </h2>
              <p>
                {{
                  t('potionSetup.typesHint', {
                    active: game.potionSetup?.activeTypeCount,
                    total: game.potions?.length,
                  })
                }}
              </p>
              <q-btn
                outline
                color="primary"
                icon="shuffle"
                :label="t('potionSetup.drawTypes')"
                @click="randomizeTypes"
              />
              <p role="status" aria-live="polite" class="q-mt-md">
                {{ t('potionSetup.activeCount', { count: activePotions.length }) }}
              </p>
              <div v-if="activePotions.length" class="row q-col-gutter-md q-mt-sm">
                <div v-for="potion in activePotions" :key="potion.id" class="col-6 col-sm-4">
                  <PotionTypePreview
                    :potion="potion"
                    :image="images[potion.id]"
                    :content-language="game.language"
                  />
                </div>
              </div>
              <div v-if="excludedPotions.length" class="q-mt-lg">
                <h3 class="text-subtitle2">{{ t('potionSetup.excluded') }}</h3>
                <ul class="q-pl-lg" :lang="game.language">
                  <li v-for="potion in excludedPotions" :key="potion.id">{{ potion.name }}</li>
                </ul>
              </div>
            </q-card-section>
          </q-card>
        </section>

        <section aria-labelledby="hands-title">
          <h2 id="hands-title" class="text-h6">4. {{ t('potionSetup.startingPotions') }}</h2>
          <p>
            {{
              t('potionSetup.stockHint', {
                each: game.potionSetup?.startingPotionsPerPlayer,
                copies: game.potionSetup?.startingCopiesPerType,
              })
            }}
          </p>
          <q-banner rounded class="setup-notice q-mb-md" role="note">{{
            t('potionSetup.optionalDraw')
          }}</q-banner>
          <RuleEntryCard
            v-if="starterRule"
            :entry="starterRule"
            :details-label="t('boardGames.details')"
            :content-language="game.language"
            class="q-mb-md"
          />
          <q-btn
            color="primary"
            icon="shuffle"
            :label="t('potionSetup.drawHands')"
            :disable="!canDeal"
            @click="randomizeHands"
          />
          <p v-if="!canDeal" class="text-body2 q-mt-sm">{{ t('potionSetup.dealFirst') }}</p>
          <p role="status" aria-live="polite" class="q-mt-md">
            {{ t('potionSetup.dealtCount', { count: hands.length }) }}
          </p>
          <div v-if="hands.length" class="row q-col-gutter-md q-mt-sm">
            <div v-for="(hand, index) in hands" :key="hand.player" class="col-12 col-sm-6">
              <q-card flat bordered class="full-height">
                <q-card-section>
                  <h3 class="text-subtitle1 text-weight-bold q-mt-none">
                    {{ index + 1 }}. {{ hand.player }}
                  </h3>
                  <div class="row q-col-gutter-sm">
                    <div v-for="(id, slot) in hand.potionIds" :key="slot" class="col-6">
                      <PotionTypePreview
                        v-if="potionsById[id]"
                        :potion="potionsById[id]"
                        :image="images[id]"
                        :content-language="game.language"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          <p class="text-caption q-mt-md">{{ t('potionSetup.physicalTiles') }}</p>
          <p class="text-caption" :lang="game.language">{{ game.sourceNotes.tileRecipes }}</p>
        </section>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import potionJson from '../../../public/data/board-games/potion-explosion.json';
import type { BoardGame, BoardGamePotion } from 'src/types/board-games';
import { useI18n } from 'vue-i18n';
import { usePotionSetup } from 'src/composables/usePotionSetup';
import { boardGameImages } from 'src/data/board-game-images';
import SetupPlayerPicker from 'components/board-games/SetupPlayerPicker.vue';
import PotionTypePreview from 'components/board-games/PotionTypePreview.vue';
import RuleEntryCard from 'components/board-games/RuleEntryCard.vue';

const game: BoardGame = potionJson;
const { t } = useI18n();
const {
  savedLists,
  selectedListId,
  names,
  selectedNames,
  loadList,
  addNames,
  available,
  canPrepare,
  canDeal,
  activePotions,
  excludedPotions,
  order,
  hands,
  randomizeStarter,
  randomizeTypes,
  randomizeHands,
  randomizeAll,
} = usePotionSetup(game);
const images = boardGameImages[game.id] ?? {};
const potionsById: Record<string, BoardGamePotion> = Object.fromEntries(
  (game.potions ?? []).map((potion) => [potion.id, potion]),
);
const starterRule = game.setup.find((rule) => rule.id === 'setup-starters');
</script>

<style scoped>
.setup-container {
  max-width: 1000px;
  margin: 0 auto;
  overflow-wrap: anywhere;
}
.setup-page {
  color: var(--sa-text);
}
.setup-notice {
  color: var(--sa-text);
  background: var(--sa-primary-soft);
}
@media (min-width: 600px) {
  .setup-page {
    padding: 32px;
  }
}
</style>
