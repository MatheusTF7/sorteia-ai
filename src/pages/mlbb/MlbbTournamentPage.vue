<template>
  <q-page class="mlbb-page">
    <div class="mlbb-container">
      <header class="arena-hero">
        <div class="hero-copy">
          <div class="eyebrow">
            <q-icon name="sports_esports" size="20px" />{{ t('mlbb.eyebrow') }}
          </div>
          <h1>{{ t('mlbb.title') }}</h1>
          <p>{{ t('mlbb.subtitle') }}</p>
          <span class="hero-tag"
            >X1 <span> / </span>
            {{ t('mlbb.status' + (championId ? 'Finished' : locked ? 'Playing' : 'Draft')) }}</span
          >
        </div>
        <div class="hero-emblem" aria-hidden="true">
          <div class="emblem-orbit" />
          <q-icon name="emoji_events" />
        </div>
      </header>

      <q-banner v-if="storageError" rounded class="bg-negative text-white q-mt-md" role="alert">{{
        t('mlbb.storageError')
      }}</q-banner>
      <q-banner
        v-if="recoveryWarning"
        rounded
        class="bg-orange-2 text-brown-10 q-mt-md"
        role="alert"
      >
        {{ t('mlbb.recoveryWarning') }}
        <template #action
          ><q-btn
            flat
            icon="close"
            :aria-label="t('mlbb.confirm')"
            @click="recoveryWarning = false"
        /></template>
      </q-banner>

      <section class="tournament-toolbar" :aria-label="t('mlbb.tournament')">
        <q-select
          v-model="store.activeId"
          outlined
          dense
          emit-value
          map-options
          :options="tournamentOptions"
          :label="t('mlbb.tournament')"
          class="tournament-picker"
        />
        <div class="toolbar-actions">
          <q-btn
            outline
            color="primary"
            icon="add"
            :label="t('mlbb.newTournament')"
            @click="newTournament"
          />
          <q-btn flat icon="more_horiz" :aria-label="t('mlbb.tournament')">
            <q-menu
              ><q-list style="min-width: 220px">
                <q-item v-close-popup clickable @click="downloadBackup"
                  ><q-item-section avatar><q-icon name="download" /></q-item-section
                  ><q-item-section>{{ t('mlbb.backup') }}</q-item-section></q-item
                >
                <q-item v-close-popup clickable @click="fileInput?.click()"
                  ><q-item-section avatar><q-icon name="upload" /></q-item-section
                  ><q-item-section>{{ t('mlbb.restore') }}</q-item-section></q-item
                >
                <q-separator />
                <q-item v-close-popup clickable class="text-negative" @click="deleteTournament"
                  ><q-item-section avatar><q-icon name="delete_outline" /></q-item-section
                  ><q-item-section>{{ t('mlbb.delete') }}</q-item-section></q-item
                >
              </q-list></q-menu
            >
          </q-btn>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          hidden
          @change="importBackup"
        />
      </section>

      <section class="summary-grid" :aria-label="t('mlbb.tournament')">
        <div class="summary-item">
          <q-icon name="people_outline" />
          <div>
            <strong>{{ current.players.length }}<small> / 64</small></strong
            ><span>{{ t('mlbb.players') }}</span>
          </div>
        </div>
        <div class="summary-item">
          <q-icon name="sports_martial_arts" />
          <div>
            <strong
              >{{ completedCount
              }}<small>
                / {{ Math.max(0, current.players.length - 1) + (bronzeMatch ? 1 : 0) }}</small
              ></strong
            ><span>{{ t('mlbb.matches') }}</span>
          </div>
        </div>
        <div class="summary-item">
          <q-icon name="skip_next" />
          <div>
            <strong>{{
              locked ? mlbbBracketSize(current.players.length) - current.players.length : 0
            }}</strong
            ><span>{{ t('mlbb.byes') }}</span>
          </div>
        </div>
      </section>

      <div id="mlbb-before-bracket" />
      <Teleport to="body" :disabled="!bracketFullscreen">
        <section
          id="mlbb-bracket"
          ref="bracketPanel"
          class="bracket-section"
          :class="{ 'bracket-fullscreen': bracketFullscreen, 'mlbb-page': bracketFullscreen }"
          :role="bracketFullscreen ? 'dialog' : undefined"
          :aria-modal="bracketFullscreen ? true : undefined"
          :aria-label="t('mlbb.bracket')"
          :tabindex="bracketFullscreen ? -1 : undefined"
          @keydown.esc.stop="closeBracketFullscreen"
          @keydown.tab="trapBracketFocus"
        >
          <div class="bracket-title">
            <div>
              <h2><q-icon name="account_tree" />{{ t('mlbb.bracket') }}</h2>
              <p v-if="locked">{{ t('mlbb.bracketHint') }}</p>
            </div>
            <div class="bracket-header-actions">
              <q-btn
                v-if="locked"
                outline
                color="primary"
                :icon="bracketFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                :label="t(bracketFullscreen ? 'mlbb.exitFullscreen' : 'mlbb.fullscreen')"
                @click="toggleBracketFullscreen"
              />
              <q-btn
                v-if="current.players.length"
                outline
                color="primary"
                icon="content_copy"
                :label="t('mlbb.share')"
                @click="shareOpen = true"
              />
            </div>
          </div>
          <div v-if="currentMatch" class="current-match-summary">
            <div class="current-match-copy">
              <span class="current-match-eyebrow"
                ><q-icon name="sports_esports" size="20px" />{{ t('mlbb.currentMatch') }} &middot;
                {{ t('mlbb.game', { number: matchNumber(currentMatch.id) }) }} &middot; MD{{
                  currentMatch.bestOf
                }}</span
              >
              <strong
                >{{ playerName(currentMatch.playerAId) }} <span class="versus">&times;</span>
                {{ playerName(currentMatch.playerBId) }}</strong
              >
              <p>{{ t('mlbb.currentMatchHint') }}</p>
            </div>
            <div class="current-match-actions">
              <q-btn
                color="primary"
                unelevated
                icon="edit"
                :label="t('mlbb.recordResult')"
                @click="openResult(currentMatch)"
              />
              <q-btn
                color="primary"
                flat
                icon="my_location"
                :label="t('mlbb.locateMatch')"
                @click="locateCurrentMatch"
              />
            </div>
          </div>
          <div v-if="championId" class="champion-banner" role="status">
            <q-icon name="emoji_events" size="48px" />
            <div>
              <span>{{ t('mlbb.champion') }}</span
              ><strong>{{ playerName(championId) }}</strong>
              <p>{{ t('mlbb.championHint') }}</p>
            </div>
          </div>
          <p v-if="thirdPlaceId" class="third-place-award">
            <q-icon name="workspace_premium" /> {{ t('mlbb.thirdPlace') }}:
            <strong>{{ playerName(thirdPlaceId) }}</strong>
          </p>
          <div v-if="!locked" class="empty-state bracket-empty">
            <div class="empty-bracket-art" aria-hidden="true">
              <q-icon name="account_tree" size="54px" />
            </div>
            <strong>{{ t('mlbb.emptyBracket') }}</strong>
            <p>{{ t('mlbb.emptyBracketHint') }}</p>
          </div>
          <div
            v-else
            ref="bracketViewport"
            class="bracket-scroll"
            role="region"
            :aria-label="t('mlbb.bracketRegion')"
            tabindex="0"
          >
            <div class="bracket-rounds">
              <section v-for="(round, index) in rounds" :key="index" class="bracket-round">
                <div class="round-heading">
                  <h3>{{ roundLabel(index) }}</h3>
                  <span>MD{{ round[0]?.bestOf }}</span>
                </div>
                <div class="round-matches">
                  <div
                    v-for="match in round"
                    :key="match.id"
                    class="match-position"
                    :data-current-match="match.id === currentMatch?.id ? 'true' : undefined"
                  >
                    <span v-if="index > 0" class="connector-in" aria-hidden="true" />
                    <span
                      v-if="index < rounds.length - 1"
                      class="connector-out"
                      aria-hidden="true"
                    />
                    <span
                      v-if="index < rounds.length - 1 && match.index % 2 === 0"
                      class="connector-join"
                      aria-hidden="true"
                    />
                    <MlbbMatchCard
                      :match="match"
                      :current="match.id === currentMatch?.id"
                      :players="current.players"
                      :number="matchNumber(match.id)"
                      :source-a="sourceLabel(match.sourceA)"
                      :source-b="sourceLabel(match.sourceB)"
                      @result="openResult"
                    />
                  </div>
                </div>
              </section>
              <section v-if="bronzeMatch" class="bracket-round">
                <div class="round-heading">
                  <h3>{{ t('mlbb.thirdPlace') }}</h3>
                  <span>MD{{ bronzeMatch.bestOf }}</span>
                </div>
                <div class="round-matches">
                  <div
                    v-if="bronzeMatch"
                    class="match-position"
                    :data-current-match="bronzeMatch.id === currentMatch?.id ? 'true' : undefined"
                  >
                    <MlbbMatchCard
                      :match="bronzeMatch"
                      :title="t('mlbb.thirdPlace')"
                      :players="current.players"
                      :number="matchNumber(bronzeMatch.id)"
                      :current="bronzeMatch.id === currentMatch?.id"
                      :source-a="t('mlbb.loserOf', { number: matchNumber(bronzeMatch.sourceA!) })"
                      :source-b="t('mlbb.loserOf', { number: matchNumber(bronzeMatch.sourceB!) })"
                      @result="openResult"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </Teleport>

      <div id="mlbb-after-bracket" />
      <Teleport defer :to="locked ? '#mlbb-after-bracket' : '#mlbb-before-bracket'">
        <section class="setup-grid">
          <q-card flat class="setup-card">
            <q-card-section>
              <div class="section-heading">
                <h2><q-icon name="people_outline" />{{ t('mlbb.players') }}</h2>
                <span>{{ t('mlbb.playerLimit') }}</span>
              </div>
              <q-input
                v-model="current.name"
                outlined
                :label="t('mlbb.name')"
                :placeholder="t('mlbb.namePlaceholder')"
                maxlength="80"
                class="q-mb-lg"
              />
              <template v-if="!locked">
                <q-input
                  v-model="current.draftNames"
                  outlined
                  type="textarea"
                  rows="3"
                  :label="t('mlbb.playerNames')"
                  :hint="t('mlbb.namesHint')"
                  maxlength="10000"
                />
                <div class="player-actions">
                  <q-btn
                    color="primary"
                    unelevated
                    icon="person_add_alt"
                    :label="t('mlbb.addPlayers')"
                    :disable="!current.draftNames.trim()"
                    @click="addDraft"
                  />
                  <q-btn
                    flat
                    color="primary"
                    icon="bookmarks"
                    :label="t('mlbb.importList')"
                    @click="openListImport"
                  />
                </div>
              </template>
              <div v-if="!current.players.length" class="empty-state player-empty">
                <q-icon name="person_add_alt" size="36px" /><strong>{{
                  t('mlbb.emptyPlayers')
                }}</strong>
                <p>{{ t('mlbb.emptyPlayersHint') }}</p>
              </div>
              <ul v-else class="player-list">
                <li v-for="(player, index) in current.players" :key="player.id">
                  <span class="player-number">{{ String(index + 1).padStart(2, '0') }}</span>
                  <div class="player-identity">
                    <strong>{{ player.name }}</strong
                    ><small v-if="player.gameId || player.serverId"
                      >{{ player.gameId
                      }}{{ player.serverId ? ` (${player.serverId})` : '' }}</small
                    >
                  </div>
                  <template v-if="!locked">
                    <q-btn
                      flat
                      round
                      dense
                      icon="edit"
                      color="grey-6"
                      :aria-label="t('mlbb.editPlayer') + ': ' + player.name"
                      @click="editPlayer(player)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      color="grey-6"
                      :aria-label="t('mlbb.removePlayer', { name: player.name })"
                      @click="removePlayer(player.id)"
                    />
                  </template>
                </li>
              </ul>
            </q-card-section>
          </q-card>

          <q-card flat class="setup-card">
            <q-card-section>
              <div class="section-heading">
                <h2><q-icon name="tune" />{{ t('mlbb.rules') }}</h2>
              </div>
              <div class="format-grid">
                <div v-for="field in formatFields" :key="field.key" class="mdx-control">
                  <q-btn
                    outline
                    color="primary"
                    icon="remove"
                    :disable="locked || current.rules[field.key] <= 1"
                    :aria-label="t('mlbb.decreaseMdx', { format: t(field.label) })"
                    @click="stepFormat(field.key, -1)"
                  />
                  <q-input
                    v-model.number="current.rules[field.key]"
                    outlined
                    type="number"
                    min="1"
                    max="99"
                    step="1"
                    :disable="locked"
                    :label="t(field.label)"
                  />
                  <q-btn
                    outline
                    color="primary"
                    icon="add"
                    :disable="locked || current.rules[field.key] >= 99"
                    :aria-label="t('mlbb.increaseMdx', { format: t(field.label) })"
                    @click="stepFormat(field.key, 1)"
                  />
                </div>
              </div>
              <q-select
                :model-value="current.rules.thirdPlace"
                :options="thirdPlaceOptions"
                emit-value
                map-options
                outlined
                :disable="current.players.length < 4"
                :label="t('mlbb.thirdPlaceMode')"
                class="q-mt-md"
                @update:model-value="changeThirdPlace"
              />
              <p class="field-help">{{ t('mlbb.thirdPlaceHint') }}</p>
              <q-input
                v-if="current.rules.thirdPlace === 'match'"
                v-model.number="current.rules.thirdPlaceBestOf"
                type="number"
                min="1"
                max="99"
                step="1"
                outlined
                :disable="locked"
                :label="t('mlbb.thirdPlaceFormat')"
                class="q-mt-md"
              />
              <p class="field-help">{{ t('mlbb.formatHint') }}</p>
              <p v-if="hasEvenSeries" class="field-help even-help">
                <q-icon name="info_outline" /> {{ t('mlbb.evenHint') }}
              </p>
              <q-input
                v-model="current.rules.lane"
                outlined
                :disable="locked"
                :label="t('mlbb.lane')"
                maxlength="80"
                class="q-mt-md"
              />
              <q-select
                :model-value="presetValue('victory')"
                outlined
                emit-value
                map-options
                :disable="locked"
                :options="presetOptions('victory')"
                :label="t('mlbb.victoryModel')"
                class="q-mt-lg"
                @update:model-value="(value) => applyPreset('victory', value)"
              />
              <q-input
                v-model="current.rules.victory"
                outlined
                :disable="locked"
                :label="t('mlbb.victory')"
                maxlength="200"
                class="q-mt-md"
              />
              <q-select
                :model-value="presetValue('notes')"
                outlined
                emit-value
                map-options
                :disable="locked"
                :options="presetOptions('notes')"
                :label="t('mlbb.rulesModel')"
                class="q-mt-lg"
                @update:model-value="(value) => applyPreset('notes', value)"
              />
              <q-input
                v-model="current.rules.notes"
                outlined
                type="textarea"
                rows="4"
                :disable="locked"
                :label="t('mlbb.rulesDescription')"
                :placeholder="t('mlbb.rulesPlaceholder')"
                maxlength="2000"
                class="q-mt-md"
              />
              <p class="field-help q-mt-md">{{ t('mlbb.suggestedRules') }}</p>
            </q-card-section>
          </q-card>
        </section>

        <div class="draw-bar">
          <div>
            <q-icon :name="locked ? 'lock_outline' : 'shuffle'" size="22px" />
            <p>{{ t(locked ? 'mlbb.locked' : 'mlbb.drawHint') }}</p>
          </div>
          <q-btn
            v-if="!locked"
            color="primary"
            unelevated
            size="lg"
            icon="account_tree"
            :label="t('mlbb.draw')"
            :disable="!canDraw"
            @click="generateBracket"
          />
          <q-btn
            v-else
            outline
            color="primary"
            icon="lock_open"
            :label="t('mlbb.reopen')"
            @click="confirmReopen"
          />
        </div>
        <p v-if="!locked && !canDraw" class="field-help">{{ t('mlbb.drawInvalid') }}</p>
      </Teleport>

      <footer class="module-footer">
        <span
          ><q-icon :name="storageError ? 'cloud_off' : 'save'" />
          {{ t(storageError ? 'mlbb.storageError' : 'mlbb.local') }}</span
        >
        <p>{{ t('mlbb.backupHint') }}</p>
        <div>
          <q-btn
            flat
            dense
            icon="download"
            :label="t('mlbb.backup')"
            @click="downloadBackup"
          /><q-btn
            flat
            dense
            icon="upload"
            :label="t('mlbb.restore')"
            @click="fileInput?.click()"
          />
        </div>
      </footer>
    </div>

    <q-dialog v-model="playerOpen"
      ><q-card class="mlbb-dialog"
        ><q-card-section
          ><h2 class="dialog-title">{{ t('mlbb.editPlayer') }}</h2></q-card-section
        ><q-card-section class="q-gutter-md">
          <q-input
            v-model="playerForm.name"
            outlined
            autofocus
            :label="t('mlbb.nick')"
            maxlength="60"
            :error="playerError"
            :error-message="t('mlbb.invalidNick')"
          />
          <q-input v-model="playerForm.gameId" outlined :label="t('mlbb.gameId')" maxlength="30" />
          <q-input
            v-model="playerForm.serverId"
            outlined
            :label="t('mlbb.serverId')"
            maxlength="20"
          /> </q-card-section
        ><q-card-actions align="right"
          ><q-btn v-close-popup flat :label="t('mlbb.cancel')" /><q-btn
            unelevated
            color="primary"
            :label="t('mlbb.save')"
            @click="savePlayer" /></q-card-actions></q-card
    ></q-dialog>

    <q-dialog v-model="listOpen"
      ><q-card class="mlbb-dialog"
        ><q-card-section
          ><h2 class="dialog-title">{{ t('mlbb.importList') }}</h2></q-card-section
        ><q-card-section>
          <q-select
            v-if="savedLists.length"
            v-model="listId"
            outlined
            emit-value
            map-options
            :options="savedLists.map((list) => ({ label: list.name, value: list.id }))"
            :label="t('mlbb.chooseList')"
          />
          <p v-else>{{ t('mlbb.noLists') }}</p> </q-card-section
        ><q-card-actions align="right"
          ><q-btn v-close-popup flat :label="t('mlbb.cancel')" /><q-btn
            color="primary"
            unelevated
            :label="t('mlbb.import')"
            :disable="!listId"
            @click="importList" /></q-card-actions></q-card
    ></q-dialog>

    <q-dialog v-model="resultOpen"
      ><q-card v-if="selectedMatch" class="mlbb-dialog"
        ><q-card-section
          ><h2 class="dialog-title">
            {{ t('mlbb.resultTitle', { number: matchNumber(selectedMatch.id) }) }}
          </h2>
          <p class="field-help">
            {{ roundLabel(selectedMatch.round) }} · MD{{ selectedMatch.bestOf }}
          </p></q-card-section
        ><q-card-section>
          <q-select
            v-model="resultKind"
            outlined
            emit-value
            map-options
            :label="t('mlbb.resultKind')"
            :options="[
              { label: t('mlbb.played'), value: 'score' },
              { label: t('mlbb.wo'), value: 'wo' },
            ]"
          />
          <q-select
            v-if="resultKind === 'score'"
            v-model="scoreMode"
            outlined
            emit-value
            map-options
            :label="t('mlbb.scoreMode')"
            :options="[
              { label: t('mlbb.gameScores'), value: 'games' },
              { label: t('mlbb.seriesWins'), value: 'series' },
            ]"
            class="q-mt-md"
          />
          <div v-if="resultKind === 'score' && scoreMode === 'games'" class="game-scores-editor">
            <p class="field-help">{{ t('mlbb.gameScoreHint') }}</p>
            <div v-for="(game, index) in gameScores" :key="index" class="game-score-entry">
              <div class="row items-center justify-between">
                <strong>{{ t('mlbb.gameScoreTitle', { number: index + 1 }) }}</strong
                ><q-btn
                  v-if="gameScores.length > 1"
                  flat
                  round
                  icon="close"
                  :aria-label="t('mlbb.removeGame')"
                  @click="gameScores.splice(index, 1)"
                />
              </div>
              <div class="score-inputs q-mt-sm">
                <q-input
                  v-model.number="game.scoreA"
                  outlined
                  type="number"
                  min="0"
                  step="1"
                  :label="playerName(selectedMatch.playerAId)"
                /><span>&times;</span
                ><q-input
                  v-model.number="game.scoreB"
                  outlined
                  type="number"
                  min="0"
                  step="1"
                  :label="playerName(selectedMatch.playerBId)"
                />
              </div>
              <q-select
                :model-value="gameWinner(game)"
                outlined
                emit-value
                map-options
                :options="winnerOptions"
                :label="t('mlbb.selectWinner')"
                class="q-mt-md"
                @update:model-value="(value) => (game.winnerId = value)"
              />
            </div>
            <q-btn
              v-if="canAddGame"
              outline
              color="primary"
              icon="add"
              :label="t('mlbb.addGame')"
              class="q-mt-md"
              @click="gameScores.push({ scoreA: 0, scoreB: 0, winnerId: '' })"
            />
            <p class="text-weight-bold q-mt-md">
              {{ t('mlbb.seriesScore', { a: resultTotals.a, b: resultTotals.b }) }}
            </p>
          </div>
          <div v-if="resultKind === 'score' && scoreMode === 'series'" class="score-inputs q-mt-lg">
            <q-input
              v-model.number="scoreA"
              type="number"
              outlined
              min="0"
              :max="selectedMatch.bestOf"
              step="1"
              :label="playerName(selectedMatch.playerAId)"
            /><span>×</span
            ><q-input
              v-model.number="scoreB"
              type="number"
              outlined
              min="0"
              :max="selectedMatch.bestOf"
              step="1"
              :label="playerName(selectedMatch.playerBId)"
            />
          </div>
          <p v-if="resultKind === 'wo' || scoreMode === 'series'" class="field-help q-mt-md">
            {{
              resultKind === 'wo'
                ? t('mlbb.woHint')
                : t('mlbb.scoreHint', { count: selectedMatch.bestOf })
            }}
          </p>
          <p v-if="resultKind === 'score' && isTied" class="field-help">{{ t('mlbb.tieHint') }}</p>
          <q-select
            :model-value="effectiveWinner"
            outlined
            emit-value
            map-options
            :disable="resultKind === 'score' && !isTied"
            :options="winnerOptions"
            :label="t('mlbb.selectWinner')"
            @update:model-value="(value) => (selectedWinner = value)"
          />
          <p v-if="resultError" class="text-negative q-mt-md" role="alert">
            {{ t('mlbb.invalidScore') }}
          </p> </q-card-section
        ><q-card-actions align="right"
          ><q-btn
            v-if="selectedMatch.result"
            flat
            color="negative"
            :label="t('mlbb.clearResult')"
            @click="clearResult" /><q-space /><q-btn
            v-close-popup
            flat
            :label="t('mlbb.cancel')" /><q-btn
            color="primary"
            unelevated
            :label="t('mlbb.save')"
            @click="submitResult" /></q-card-actions></q-card
    ></q-dialog>

    <q-dialog v-model="shareOpen"
      ><q-card class="mlbb-dialog share-dialog"
        ><q-card-section
          ><h2 class="dialog-title">{{ t('mlbb.shareTitle') }}</h2></q-card-section
        ><q-card-section>
          <textarea
            class="share-text"
            readonly
            :value="shareText"
            :aria-label="t('mlbb.shareTitle')"
          /></q-card-section
        ><q-card-actions align="right"
          ><q-btn v-close-popup flat :label="t('mlbb.cancel')" /><q-btn
            color="primary"
            unelevated
            icon="content_copy"
            :label="t('mlbb.copy')"
            @click="copySummary" /></q-card-actions></q-card
    ></q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { copyToClipboard, exportFile, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import MlbbMatchCard from 'src/components/mlbb/MlbbMatchCard.vue';
import { useMlbb } from 'src/composables/useMlbb';
import type { MlbbGameScore, MlbbMatch, MlbbPlayer } from 'src/types/mlbb';
import {
  buildMlbbThirdPlaceMatch,
  mlbbThirdPlaceId,
  mlbbBracketSize,
  mlbbRulePresets,
  mlbbDescendants,
  restoreMlbbTournament,
  setMlbbResult,
} from 'src/utils/mlbb';

const { t, locale } = useI18n();
const $q = useQuasar();
const {
  store,
  current,
  rounds,
  locked,
  championId,
  storageError,
  recoveryWarning,
  create,
  removeCurrent,
  addNames,
  updatePlayer,
  removePlayer,
  draw,
  reopen,
  saveResult,
} = useMlbb(locale.value.startsWith('en'));
const fileInput = ref<HTMLInputElement | null>(null);
const tournamentOptions = computed(() =>
  store.value.tournaments.map((item) => ({
    label: item.name || t('mlbb.unnamed'),
    value: item.id,
  })),
);
const bronzeMatch = computed(() => buildMlbbThirdPlaceMatch(current.value));
const thirdPlaceId = computed(() => mlbbThirdPlaceId(current.value));
const allMatches = computed(() => [
  ...rounds.value.flat(),
  ...(bronzeMatch.value ? [bronzeMatch.value] : []),
]);
const currentMatch = computed(
  () => allMatches.value.find((match) => match.status === 'ready') ?? null,
);
const thirdPlaceOptions = computed(() => [
  { label: t('mlbb.thirdPlaceNone'), value: 'none' },
  { label: t('mlbb.thirdPlaceMatch'), value: 'match' },
  { label: t('mlbb.thirdPlaceChampion'), value: 'champion-loser' },
]);
function changeThirdPlace(value: 'none' | 'match' | 'champion-loser') {
  const commit = () => {
    delete current.value.results['third-place'];
    current.value.rules.thirdPlace = value;
  };
  if (current.value.results['third-place'])
    confirmAction('mlbb.thirdPlaceChange', 'mlbb.thirdPlaceChangeMessage', commit);
  else commit();
}
const bracketFullscreen = ref(false);
const bracketPanel = ref<HTMLElement | null>(null);
let fullscreenReturnFocus: HTMLElement | null = null;
let previousBodyOverflow = '';
async function toggleBracketFullscreen() {
  if (bracketFullscreen.value) {
    closeBracketFullscreen();
    return;
  }
  fullscreenReturnFocus =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  bracketFullscreen.value = true;
  await nextTick();
  bracketPanel.value?.focus();
  locateCurrentMatch();
}
function closeBracketFullscreen() {
  if (!bracketFullscreen.value) return;
  bracketFullscreen.value = false;
  document.body.style.overflow = previousBodyOverflow;
  void nextTick(() => {
    fullscreenReturnFocus?.focus();
    locateCurrentMatch();
  });
}
function trapBracketFocus(event: KeyboardEvent) {
  if (!bracketFullscreen.value) return;
  const elements = Array.from(
    bracketPanel.value?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex="0"], a[href]',
    ) ?? [],
  ).filter((element) => element.getClientRects().length > 0);
  const first = elements[0];
  const last = elements.at(-1);
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === bracketPanel.value)
  ) {
    event.preventDefault();
    last?.focus();
  } else if (
    !event.shiftKey &&
    (document.activeElement === last || document.activeElement === bracketPanel.value)
  ) {
    event.preventDefault();
    first?.focus();
  }
}
onBeforeUnmount(() => {
  if (bracketFullscreen.value) document.body.style.overflow = previousBodyOverflow;
});
const bracketViewport = ref<HTMLElement | null>(null);
function locateCurrentMatch() {
  const viewport = bracketViewport.value;
  const card = viewport?.querySelector<HTMLElement>('[data-current-match="true"] .duel');
  if (!viewport || !card) return;
  const bounds = viewport.getBoundingClientRect();
  const target = card.getBoundingClientRect();
  viewport.scrollTo({
    left: Math.max(
      0,
      viewport.scrollLeft + target.left - bounds.left - (viewport.clientWidth - target.width) / 2,
    ),
    top: Math.max(
      0,
      viewport.scrollTop + target.top - bounds.top - (viewport.clientHeight - target.height) / 2,
    ),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
}
watch(
  () => [current.value.id, currentMatch.value?.id],
  async () => {
    await nextTick();
    locateCurrentMatch();
  },
  { immediate: true },
);
const completedCount = computed(
  () => allMatches.value.filter((match) => match.status === 'completed').length,
);
const formatFields = [
  { key: 'bestOf', label: 'mlbb.generalBestOf' },
  { key: 'semifinalBestOf', label: 'mlbb.semifinalBestOf' },
  { key: 'finalBestOf', label: 'mlbb.finalBestOf' },
] as const;
type FormatKey = (typeof formatFields)[number]['key'];
function stepFormat(key: FormatKey, delta: number) {
  if (locked.value) return;
  const value = Number(current.value.rules[key]);
  current.value.rules[key] = Math.min(
    99,
    Math.max(1, (Number.isFinite(value) ? Math.trunc(value) : 1) + delta),
  );
}
const presets = computed(() => mlbbRulePresets(locale.value.startsWith('en')));
function presetOptions(field: 'victory' | 'notes') {
  const values = field === 'victory' ? presets.value.victories : presets.value.rules;
  const labels = ['mlbb.presetLive', 'mlbb.presetFirstKill', 'mlbb.presetBase'];
  return [
    ...values.map((value, index) => ({
      label: field === 'victory' ? value : t(labels[index]!),
      value,
    })),
    { label: t('mlbb.customModel'), value: '__custom__' },
  ];
}
function presetValue(field: 'victory' | 'notes') {
  return presetOptions(field).some((option) => option.value === current.value.rules[field])
    ? current.value.rules[field]
    : '__custom__';
}
function applyPreset(field: 'victory' | 'notes', value: string) {
  if (!locked.value) current.value.rules[field] = value === '__custom__' ? '' : value;
}
const formats = computed(() => [
  current.value.rules.bestOf,
  current.value.rules.semifinalBestOf,
  current.value.rules.finalBestOf,
  current.value.rules.thirdPlaceBestOf,
]);
const hasEvenSeries = computed(() => formats.value.some((value) => value > 0 && value % 2 === 0));
const canDraw = computed(
  () =>
    current.value.players.length >= 2 &&
    current.value.players.length <= 64 &&
    formats.value.every((value) => Number.isInteger(value) && value >= 1 && value <= 99),
);
function notify(key: string, color = 'positive', values = {}) {
  $q.notify({ message: t(key, values), color, position: 'bottom' });
}
function confirmAction(title: string, message: string, action: () => void) {
  $q.dialog({
    title: t(title),
    message: t(message),
    cancel: { label: t('mlbb.cancel'), flat: true },
    ok: { label: t('mlbb.confirm'), color: 'primary' },
    persistent: true,
  }).onOk(action);
}
function newTournament() {
  if (!create()) notify('mlbb.limit', 'warning');
}
function deleteTournament() {
  confirmAction('mlbb.deleteTitle', 'mlbb.deleteMessage', removeCurrent);
}
function confirmReopen() {
  confirmAction('mlbb.reopenTitle', 'mlbb.reopenMessage', reopen);
}
function addPlayers(raw: string) {
  const count = addNames(raw);
  if (count < 0) notify('mlbb.tooMany', 'warning');
  else if (!count) notify('mlbb.noNewPlayers', 'info');
  else notify('mlbb.added', 'positive', { count });
  return count;
}
function addDraft() {
  if (addPlayers(current.value.draftNames) >= 0) current.value.draftNames = '';
}
async function generateBracket() {
  if (!canDraw.value) return;
  draw();
  await nextTick();
  document.getElementById('mlbb-bracket')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
const playerOpen = ref(false);
const playerError = ref(false);
const playerForm = ref<MlbbPlayer>({ id: '', name: '', gameId: '', serverId: '' });
function editPlayer(player: MlbbPlayer) {
  playerForm.value = { ...player };
  playerError.value = false;
  playerOpen.value = true;
}
function savePlayer() {
  const { id, name, gameId, serverId } = playerForm.value;
  playerError.value = !updatePlayer(id, name, gameId, serverId);
  if (!playerError.value) playerOpen.value = false;
}
const listOpen = ref(false);
const listId = ref('');
const savedLists = ref<{ id: string; name: string; items: string[] }[]>([]);
function openListImport() {
  savedLists.value = [];
  listId.value = '';
  try {
    const data: unknown = JSON.parse(localStorage.getItem('saved_lists') || '[]');
    if (Array.isArray(data))
      for (const item of data as unknown[]) {
        if (!item || typeof item !== 'object') continue;
        const list = item as Record<string, unknown>;
        if (
          typeof list.id === 'string' &&
          typeof list.name === 'string' &&
          Array.isArray(list.items)
        )
          savedLists.value.push({
            id: list.id,
            name: list.name,
            items: list.items.filter((name): name is string => typeof name === 'string'),
          });
      }
  } catch {
    /* An unavailable saved list does not affect the tournament. */
  }
  listOpen.value = true;
}
function importList() {
  const list = savedLists.value.find((item) => item.id === listId.value);
  if (list && addPlayers(list.items.join('\n')) >= 0) listOpen.value = false;
}
function playerName(id: string | null) {
  return current.value.players.find((player) => player.id === id)?.name ?? t('mlbb.waiting');
}
function matchNumber(id: string) {
  return allMatches.value.findIndex((match) => match.id === id) + 1;
}
function sourceLabel(id: string | null) {
  return id ? t('mlbb.winnerOf', { number: matchNumber(id) }) : '';
}
function roundLabel(index: number) {
  if (index === rounds.value.length) return t('mlbb.thirdPlace');
  const remaining = rounds.value.length - index;
  return remaining === 1
    ? t('mlbb.final')
    : remaining === 2
      ? t('mlbb.semifinal')
      : remaining === 3
        ? t('mlbb.quarterfinal')
        : t('mlbb.round', { number: index + 1 });
}

const resultOpen = ref(false);
const selectedMatch = ref<MlbbMatch | null>(null);
const resultKind = ref<'score' | 'wo'>('score');
const scoreA = ref<number | null>(0);
const scoreB = ref<number | null>(0);
const selectedWinner = ref('');
const resultError = ref(false);
const scoreMode = ref<'games' | 'series'>('games');
const gameScores = ref<MlbbGameScore[]>([]);
function gameWinner(game: MlbbGameScore) {
  return (
    game.winnerId ||
    (game.scoreA === game.scoreB
      ? ''
      : ((Number(game.scoreA) > Number(game.scoreB)
          ? selectedMatch.value?.playerAId
          : selectedMatch.value?.playerBId) ?? ''))
  );
}
const resultTotals = computed(() =>
  scoreMode.value === 'series'
    ? { a: scoreA.value, b: scoreB.value }
    : {
        a: gameScores.value.filter((game) => gameWinner(game) === selectedMatch.value?.playerAId)
          .length,
        b: gameScores.value.filter((game) => gameWinner(game) === selectedMatch.value?.playerBId)
          .length,
      },
);
const canAddGame = computed(
  () =>
    !!selectedMatch.value &&
    gameScores.value.length < selectedMatch.value.bestOf &&
    Math.max(Number(resultTotals.value.a), Number(resultTotals.value.b)) <=
      selectedMatch.value.bestOf / 2,
);
const isTied = computed(() => resultTotals.value.a === resultTotals.value.b);
const effectiveWinner = computed(() =>
  resultKind.value === 'wo' || isTied.value
    ? selectedWinner.value
    : ((Number(resultTotals.value.a) > Number(resultTotals.value.b)
        ? selectedMatch.value?.playerAId
        : selectedMatch.value?.playerBId) ?? ''),
);
const winnerOptions = computed(() =>
  [selectedMatch.value?.playerAId, selectedMatch.value?.playerBId]
    .filter((id): id is string => !!id)
    .map((id) => ({ label: playerName(id), value: id })),
);
function openResult(match: MlbbMatch) {
  selectedMatch.value = match;
  resultKind.value = match.result?.kind ?? 'score';
  scoreMode.value = match.result?.kind === 'score' && !match.result.games ? 'series' : 'games';
  gameScores.value = match.result?.games?.map((game) => ({ ...game })) ?? [
    { scoreA: 0, scoreB: 0, winnerId: '' },
  ];
  scoreA.value = match.result?.scoreA ?? 0;
  scoreB.value = match.result?.scoreB ?? 0;
  selectedWinner.value = match.result?.winnerId ?? '';
  resultError.value = false;
  resultOpen.value = true;
}
function submitResult() {
  const match = selectedMatch.value;
  if (!match) return;
  const input =
    resultKind.value === 'wo'
      ? { kind: 'wo' as const, winnerId: selectedWinner.value }
      : {
          kind: 'score' as const,
          scoreA: resultTotals.value.a ?? NaN,
          scoreB: resultTotals.value.b ?? NaN,
          ...(scoreMode.value === 'games'
            ? { games: gameScores.value.map((game) => ({ ...game, winnerId: gameWinner(game) })) }
            : {}),
          winnerId: effectiveWinner.value,
        };
  try {
    const updated = setMlbbResult(current.value, match.id, input);
    const nextWinner = updated.results[match.id]?.winnerId;
    const commit = () => {
      saveResult(match.id, input);
      resultOpen.value = false;
    };
    if (
      match.winnerId !== nextWinner &&
      mlbbDescendants(current.value, match.id).some((id) => current.value.results[id])
    )
      confirmAction('mlbb.correctionTitle', 'mlbb.correctionMessage', commit);
    else commit();
  } catch {
    resultError.value = true;
  }
}
function clearResult() {
  const id = selectedMatch.value?.id;
  if (id)
    confirmAction('mlbb.clearTitle', 'mlbb.clearMessage', () => {
      saveResult(id, null);
      resultOpen.value = false;
    });
}

const shareOpen = ref(false);
const shareText = computed(() => {
  const tournament = current.value;
  const lines = [
    tournament.name || t('mlbb.unnamed'),
    'Mobile Legends: Bang Bang · X1',
    t('mlbb.formatSummary', {
      general: tournament.rules.bestOf,
      semi: tournament.rules.semifinalBestOf,
      final: tournament.rules.finalBestOf,
    }),
    '',
  ];
  if (tournament.rules.lane) lines.push(`${t('mlbb.lane')}: ${tournament.rules.lane}`);
  if (tournament.rules.victory) lines.push(`${t('mlbb.victory')}: ${tournament.rules.victory}`);
  if (tournament.rules.notes)
    lines.push(`${t('mlbb.rulesDescription')}:\n${tournament.rules.notes}`);
  lines.push('', t('mlbb.playersCount', { count: tournament.players.length }));
  tournament.players.forEach((player, index) => lines.push(`${index + 1}. ${player.name}`));
  rounds.value.forEach((round, index) => {
    lines.push('', `${roundLabel(index)} · MD${round[0]?.bestOf}`);
    round.forEach((match) => {
      const a = match.playerAId ? playerName(match.playerAId) : sourceLabel(match.sourceA);
      const b = match.playerBId ? playerName(match.playerBId) : sourceLabel(match.sourceB);
      const result = match.result;
      const duel =
        match.status === 'bye'
          ? `${a} — ${t('mlbb.bye')}`
          : `${a} ${result?.kind === 'score' ? `${result.scoreA} × ${result.scoreB}` : '×'} ${b}`;
      lines.push(
        `${t('mlbb.game', { number: matchNumber(match.id) })}: ${duel}${result ? ` · ${result.kind === 'wo' ? t('mlbb.wo') : t('mlbb.winner')}: ${playerName(result.winnerId)}` : ''}`,
      );
      result?.games?.forEach((game, index) =>
        lines.push(
          `  ${t('mlbb.gameScoreTitle', { number: index + 1 })}: ${game.scoreA} x ${game.scoreB} (${t('mlbb.winner')}: ${playerName(game.winnerId)})`,
        ),
      );
    });
  });
  if (bronzeMatch.value) {
    const match = bronzeMatch.value;
    lines.push(
      '',
      `${t('mlbb.thirdPlace')}: ${match.playerAId ? playerName(match.playerAId) : t('mlbb.loserOf', { number: matchNumber(match.sourceA!) })} x ${match.playerBId ? playerName(match.playerBId) : t('mlbb.loserOf', { number: matchNumber(match.sourceB!) })}`,
    );
    if (match.result) {
      lines.push(t('mlbb.seriesScore', { a: match.result.scoreA, b: match.result.scoreB }));
      match.result.games?.forEach((game, index) =>
        lines.push(
          `${t('mlbb.gameScoreTitle', { number: index + 1 })}: ${game.scoreA} x ${game.scoreB} (${t('mlbb.winner')}: ${playerName(game.winnerId)})`,
        ),
      );
    }
  }
  if (thirdPlaceId.value) lines.push(`${t('mlbb.thirdPlace')}: ${playerName(thirdPlaceId.value)}`);
  if (championId.value) lines.push('', `${t('mlbb.champion')} ${playerName(championId.value)}`);
  return lines.join('\n');
});
async function copySummary() {
  try {
    await copyToClipboard(shareText.value);
    notify('mlbb.copied');
  } catch {
    notify('mlbb.copyError', 'warning');
  }
}
function downloadBackup() {
  const content = JSON.stringify(
    { type: 'sorteia-ai-mlbb', version: 1, tournament: current.value },
    null,
    2,
  );
  const result = exportFile(`mlbb-x1-${current.value.id}.json`, content, 'application/json');
  if (result !== true) notify('mlbb.backupError', 'negative');
}
async function importBackup(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 1024 * 1024) throw new Error('size');
    const value: unknown = JSON.parse(await file.text());
    if (!value || typeof value !== 'object') throw new Error('file');
    const data = value as Record<string, unknown>;
    if (data.type !== 'sorteia-ai-mlbb' || data.version !== 1) throw new Error('version');
    const tournament = restoreMlbbTournament(data.tournament);
    if (!tournament) throw new Error('tournament');
    tournament.id = crypto.randomUUID();
    if (!create(tournament)) notify('mlbb.limit', 'warning');
    else notify('mlbb.imported');
  } catch {
    notify('mlbb.importError', 'negative');
  } finally {
    input.value = '';
  }
}
</script>

<style scoped lang="scss">
.mlbb-page {
  --mlbb-surface: #fff;
  --mlbb-soft: #f8fafc;
  --mlbb-border: #e2e8f0;
  --mlbb-muted: #64748b;
  --mlbb-winner: #047857;
  --mlbb-winner-bg: #ecfdf5;
  --mlbb-complete-border: #a7d6c5;
  padding: 32px 24px 48px;
  color: #1e293b;
}
.mlbb-container {
  max-width: 1360px;
  margin: auto;
}
.arena-hero {
  min-height: 260px;
  border-radius: 28px;
  padding: 36px 40px;
  background:
    radial-gradient(ellipse at 85% 20%, #4338ca99, transparent 50%),
    linear-gradient(120deg, #111d39, #1e1b4b);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  position: relative;
}
.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 650px;
}
.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #c7d2fe;
}
h1 {
  font-size: clamp(2rem, 3.5vw, 3rem);
  line-height: 1.15;
  letter-spacing: -0.04em;
  margin: 18px 0 14px;
  font-weight: 700;
}
.hero-copy p {
  max-width: 510px;
  font-size: 1rem;
  color: #cbd5e1;
  line-height: 1.7;
  margin: 0 0 20px;
}
.hero-tag {
  display: inline-flex;
  gap: 12px;
  border: 1px solid #a5b4fc40;
  border-radius: 8px;
  padding: 7px 12px;
  color: #e0e7ff;
  font-size: 0.875rem;
}
.hero-tag > span {
  color: #818cf8;
}
.hero-emblem {
  width: 220px;
  height: 180px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  position: relative;
  transform: rotate(-8deg);
}
.hero-emblem > .q-icon {
  font-size: 108px;
  color: #fcd34d;
  filter: drop-shadow(0 8px 18px #0004);
}
.emblem-orbit {
  position: absolute;
  width: 180px;
  height: 180px;
  border: 1px solid #a5b4fc50;
  border-radius: 40px;
  transform: rotate(35deg);
  background: #a5b4fc0a;
}
.emblem-orbit::after {
  content: '';
  position: absolute;
  inset: 16px;
  border: 1px solid #a5b4fc30;
  border-radius: 28px;
}
.tournament-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 28px 0 20px;
}
.tournament-picker {
  width: 360px;
  max-width: 100%;
}
.toolbar-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.summary-item {
  display: flex;
  gap: 16px;
  align-items: center;
  background: var(--mlbb-surface);
  border: 1px solid var(--mlbb-border);
  border-radius: 18px;
  padding: 20px;
}
.summary-item > .q-icon {
  padding: 12px;
  background: #6366f112;
  color: #6366f1;
  font-size: 26px;
  border-radius: 14px;
}
.summary-item strong {
  display: block;
  font-size: 1.75rem;
  line-height: 1.25;
  font-weight: 700;
}
.summary-item strong small {
  font-size: 1rem;
  color: var(--mlbb-muted);
  font-weight: 400;
}
.summary-item span {
  display: block;
  font-size: 0.875rem;
  color: var(--mlbb-muted);
  margin-top: 4px;
}
.setup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}
.setup-card {
  min-width: 0;
  border-color: var(--mlbb-border);
}
.setup-card > .q-card__section {
  padding: 24px;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
h2 {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 1.25rem;
  line-height: 1.4;
  letter-spacing: -0.025em;
  margin: 0;
  font-weight: 700;
}
.section-heading > span {
  font-size: 0.875rem;
  color: var(--mlbb-muted);
}
.player-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
}
.player-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 390px;
  overflow-y: auto;
}
.player-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--mlbb-border);
}
.player-list li:last-child {
  border-bottom: 0;
}
.player-number {
  color: var(--mlbb-muted);
  background: var(--mlbb-soft);
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  font-size: 0.875rem;
}
.player-identity {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.player-identity strong {
  font-size: 1rem;
  font-weight: 500;
}
.player-identity small {
  display: block;
  color: var(--mlbb-muted);
  font-size: 0.8125rem;
}
.format-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.field-help {
  color: var(--mlbb-muted, #64748b);
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 0;
}
.format-grid + .field-help {
  margin-top: 10px;
}
.even-help {
  padding: 10px 12px;
  background: var(--mlbb-soft);
  border-radius: 10px;
}
.empty-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 32px 16px;
  color: var(--mlbb-muted);
}
.empty-state strong {
  color: inherit;
  font-size: 1.125rem;
  margin-top: 16px;
}
.empty-state p {
  max-width: 420px;
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 8px 0 0;
}
.draw-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
  padding: 24px;
  background: var(--mlbb-surface);
  border: 1px solid var(--mlbb-border);
  border-radius: 20px;
}
.draw-bar > div {
  display: flex;
  gap: 14px;
  align-items: center;
  color: var(--mlbb-muted);
}
.draw-bar p {
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
  max-width: 650px;
}
.draw-bar > .q-btn {
  flex-shrink: 0;
}
.bracket-section {
  margin-top: 40px;
  scroll-margin-top: 90px;
}
.bracket-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
.bracket-title p {
  font-size: 0.9375rem;
  color: var(--mlbb-muted);
  margin: 8px 0 0;
  line-height: 1.6;
}
.bracket-title > .q-btn {
  flex-shrink: 0;
}
.bracket-empty {
  background: var(--mlbb-surface);
  border: 1px dashed var(--mlbb-border);
  border-radius: 24px;
  padding: 52px 20px;
}
.empty-bracket-art {
  padding: 20px;
  border-radius: 20px;
  background: #6366f10a;
  color: #818cf8;
}
.bracket-scroll {
  overflow: auto;
  padding: 24px;
  border: 1px solid var(--mlbb-border);
  background: var(--mlbb-soft);
  border-radius: 24px;
  max-height: 900px;
}
.bracket-scroll:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 3px;
}
.bracket-rounds {
  display: flex;
  align-items: stretch;
  gap: 40px;
  width: max-content;
  min-width: 100%;
}
.bracket-round {
  display: flex;
  flex-direction: column;
  width: 300px;
  flex-shrink: 0;
}
.round-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 18px;
}
h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.5;
}
.round-heading > span {
  font-size: 0.875rem;
  color: var(--mlbb-muted);
}
.round-matches {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 0;
  flex: 1;
}
.match-position {
  position: relative;
  flex: 1;
  min-height: 240px;
  display: flex;
  align-items: center;
  padding: 10px 0;
}
.match-position > .duel {
  width: 100%;
}
.connector-in,
.connector-out {
  position: absolute;
  top: 50%;
  width: 20px;
  border-top: 2px solid var(--mlbb-border);
}
.connector-in {
  left: -20px;
}
.connector-out {
  right: -20px;
}
.connector-join {
  position: absolute;
  top: 50%;
  right: -20px;
  height: 100%;
  border-right: 2px solid var(--mlbb-border);
}
.champion-banner {
  display: flex;
  align-items: center;
  gap: 22px;
  background: linear-gradient(120deg, #fef3c7, #fffbeb);
  border: 1px solid #fcd34d;
  border-radius: 20px;
  padding: 24px 28px;
  color: #92400e;
  margin-bottom: 24px;
}
.champion-banner span {
  font-size: 0.875rem;
  font-weight: 600;
}
.champion-banner strong {
  display: block;
  font-size: 1.75rem;
  overflow-wrap: anywhere;
}
.champion-banner p {
  margin: 4px 0 0;
  font-size: 0.9375rem;
}
.module-footer {
  padding-top: 28px;
  font-size: 0.875rem;
  color: var(--mlbb-muted);
  text-align: center;
}
.module-footer > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.module-footer p {
  margin: 8px 0 6px;
  line-height: 1.6;
}
.mlbb-dialog {
  width: 520px;
  max-width: 94vw;
}
.dialog-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.4;
}
.score-inputs {
  display: flex;
  align-items: center;
  gap: 14px;
}
.score-inputs > .q-field {
  flex: 1;
  min-width: 0;
}
.score-inputs > span {
  font-size: 1.5rem;
  color: #94a3b8;
}
.share-dialog {
  width: 680px;
}
.share-text {
  width: 100%;
  min-height: 360px;
  height: 50vh;
  resize: vertical;
  border: 1px solid #94a3b8;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  padding: 16px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.7;
}
body.body--dark .mlbb-page {
  --mlbb-surface: #0f172a;
  --mlbb-soft: #131e33;
  --mlbb-border: #2a3650;
  --mlbb-muted: #a3b1c6;
  --mlbb-winner: #6ee7b7;
  --mlbb-winner-bg: #064e3b40;
  --mlbb-complete-border: #285747;
  color: #f1f5f9;
}
body.body--dark .champion-banner {
  background: linear-gradient(120deg, #422c12, #2b251a);
  border-color: #91681b;
  color: #fde68a;
}
@media (max-width: 1100px) {
  .setup-grid {
    grid-template-columns: 1fr;
  }
  .format-grid {
    gap: 14px;
  }
}
@media (max-width: 650px) {
  .mlbb-page {
    padding: 16px 12px 32px;
  }
  .arena-hero {
    padding: 28px 24px;
    min-height: 260px;
    border-radius: 22px;
  }
  .hero-emblem {
    position: absolute;
    right: -60px;
    top: 16px;
    opacity: 0.15;
  }
  .hero-copy p {
    max-width: 310px;
  }
  .eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.06em;
  }
  .tournament-toolbar {
    flex-wrap: wrap;
  }
  .tournament-picker {
    width: 100%;
  }
  .toolbar-actions {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }
  .summary-grid {
    gap: 8px;
  }
  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 10px;
  }
  .summary-item > .q-icon {
    padding: 8px;
    font-size: 22px;
  }
  .summary-item strong {
    font-size: 1.5rem;
  }
  .summary-item span {
    font-size: 0.8125rem;
  }
  .setup-card > .q-card__section {
    padding: 20px 16px;
  }
  .format-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .draw-bar,
  .bracket-title {
    flex-direction: column;
    align-items: stretch;
    gap: 18px;
  }
  .draw-bar {
    padding: 20px 16px;
  }
  .bracket-scroll {
    padding: 16px;
  }
  .bracket-round {
    width: 280px;
  }
  .champion-banner {
    padding: 20px;
    gap: 14px;
  }
  .champion-banner strong {
    font-size: 1.5rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto;
  }
}
.mdx-control {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mdx-control > .q-field {
  flex: 1;
  min-width: 0;
}
.mdx-control > .q-btn {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.mlbb-page {
  --mlbb-accent: #4f46e5;
  --mlbb-accent-text: #4338ca;
  --mlbb-accent-soft: #eef2ff;
  --mlbb-connector: #a5b4fc;
}
.bracket-section {
  margin: 4px 0 32px;
  padding: 28px;
  border: 1px solid #a5b4fc;
  border-top: 4px solid var(--mlbb-accent);
  border-radius: 26px;
  background: var(--mlbb-surface);
  box-shadow: 0 12px 36px #312e8110;
}
.bracket-title h2 {
  font-size: 1.5rem;
}
.bracket-title h2 > .q-icon {
  color: var(--mlbb-accent-text);
}
.bracket-scroll {
  background-color: var(--mlbb-soft);
  background-image: radial-gradient(var(--mlbb-border) 1px, transparent 1px);
  background-size: 20px 20px;
  border: 1px solid var(--mlbb-connector);
  padding: 28px;
  max-height: 75vh;
  min-height: 360px;
  scroll-padding: 28px;
}
.round-heading {
  position: sticky;
  top: -28px;
  z-index: 2;
  background: var(--mlbb-soft);
  padding: 14px;
  border: 1px solid var(--mlbb-border);
  border-radius: 12px;
  margin-bottom: 16px;
}
.round-heading h3 {
  color: var(--mlbb-accent-text);
}
.connector-in,
.connector-out {
  border-top-color: var(--mlbb-connector);
}
.connector-join {
  border-right-color: var(--mlbb-connector);
}
.match-position {
  min-height: 280px;
}
.current-match-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px;
  border: 1px solid var(--mlbb-connector);
  background: var(--mlbb-accent-soft);
  border-radius: 18px;
  margin-bottom: 24px;
}
.current-match-copy {
  min-width: 0;
}
.current-match-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--mlbb-accent-text);
  font-weight: 700;
  font-size: 0.875rem;
  flex-wrap: wrap;
}
.current-match-copy > strong {
  display: block;
  margin: 10px 0;
  font-size: 1.5rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.versus {
  color: var(--mlbb-muted);
  padding: 0 8px;
  font-weight: 400;
}
.current-match-copy p {
  font-size: 0.875rem;
  color: var(--mlbb-muted);
  line-height: 1.6;
  margin: 0;
}
.current-match-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}
body.body--dark .mlbb-page {
  --mlbb-accent-text: #c7d2fe;
  --mlbb-accent-soft: #222449;
  --mlbb-connector: #6366a3;
}
body.body--dark .bracket-section {
  border-color: #6366a3;
  border-top-color: #818cf8;
}
@media (max-width: 650px) {
  .bracket-section {
    padding: 20px 12px;
    border-radius: 20px;
  }
  .bracket-title h2 {
    font-size: 1.25rem;
  }
  .bracket-scroll {
    padding: 20px;
  }
  .round-heading {
    top: -20px;
  }
  .current-match-summary {
    flex-direction: column;
    align-items: stretch;
    padding: 18px;
    gap: 16px;
  }
  .current-match-copy > strong {
    font-size: 1.25rem;
  }
}

.bracket-header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.bracket-section.bracket-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 5000;
  width: 100%;
  height: 100dvh;
  margin: 0;
  padding: max(20px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  border: 0;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: var(--mlbb-surface);
}
.bracket-fullscreen .bracket-scroll {
  flex: 1;
  min-height: 240px;
  max-height: none;
}
.bracket-fullscreen .bracket-title {
  flex-shrink: 0;
}
.bracket-fullscreen .current-match-summary {
  flex-shrink: 0;
}
@media (max-width: 650px) {
  .bracket-header-actions {
    justify-content: flex-start;
  }
  .bracket-fullscreen .current-match-copy p {
    display: none;
  }
  .bracket-fullscreen .current-match-summary {
    padding: 12px;
    gap: 8px;
    margin-bottom: 12px;
  }
  .bracket-fullscreen .current-match-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.game-score-entry {
  padding: 16px;
  border: 1px solid #94a3b8;
  border-radius: 12px;
  margin-top: 16px;
}
.third-place-award {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  padding: 16px;
  background: var(--mlbb-accent-soft);
  border-radius: 12px;
}
</style>
