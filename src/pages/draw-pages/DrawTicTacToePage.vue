<template>
  <q-page class="q-pa-lg text-center" style="max-width: 800px; margin: 0 auto">
    <!-- Header -->
    <div class="q-mb-xl">
      <div class="text-h4 text-weight-bold q-mb-md text-gradient" style="letter-spacing: -1px">
        {{ t('tictactoe.pageTitle') }}
      </div>
      <div class="text-h6 text-weight-regular text-grey-6">
        {{ t('tictactoe.pageSubtitle') }}
      </div>
    </div>

    <!-- Player Cards -->
    <div class="row q-col-gutter-lg q-mb-xl text-left justify-center">
      <div class="col-12 col-sm-5">
        <q-card
          flat
          class="card shadow-modern player-card"
          :class="{
            'player-card--active-x': gameStarted && currentPlayer === 'X' && !winner && !isDraw,
          }"
        >
          <q-card-section class="q-pa-lg">
            <div class="row items-center q-mb-md">
              <q-icon name="close" size="20px" color="negative" class="q-mr-sm" />
              <span class="text-weight-bold">{{ playerXName || t('tictactoe.playerX') }}</span>
              <q-space />
              <div class="text-h5 text-weight-bold text-negative">{{ scores.X }}</div>
            </div>
            <q-input
              v-model="playerXName"
              :label="t('tictactoe.playerName')"
              outlined
              dense
              :disable="gameStarted"
            />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-5">
        <q-card
          flat
          class="card shadow-modern player-card"
          :class="{
            'player-card--active-o': gameStarted && currentPlayer === 'O' && !winner && !isDraw,
          }"
        >
          <q-card-section class="q-pa-lg">
            <div class="row items-center q-mb-md">
              <q-icon name="radio_button_unchecked" size="20px" color="primary" class="q-mr-sm" />
              <span class="text-weight-bold">{{ playerOName || t('tictactoe.playerO') }}</span>
              <q-space />
              <div class="text-h5 text-weight-bold text-primary">{{ scores.O }}</div>
            </div>
            <q-input
              v-model="playerOName"
              :label="t('tictactoe.playerName')"
              outlined
              dense
              :disable="gameStarted"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Status Message -->
    <transition name="fade" mode="out-in">
      <div class="q-mb-lg" :key="statusKey">
        <div v-if="!gameStarted" class="text-body1 text-grey-6">
          {{ t('tictactoe.pressToStart') }}
        </div>
        <div v-else-if="winner" class="text-h5 text-weight-bold">
          🎉 {{ winnerName }} {{ t('tictactoe.wins') }}!
        </div>
        <div v-else-if="isDraw" class="text-h5 text-weight-bold text-amber-8">
          🤝 {{ t('tictactoe.draw') }}
        </div>
        <div v-else class="text-h6 text-weight-medium">
          {{ t('tictactoe.turn') }}:
          <span
            :class="currentPlayer === 'X' ? 'text-negative' : 'text-primary'"
            class="text-weight-bold"
          >
            {{ currentPlayerName }}
          </span>
        </div>
      </div>
    </transition>

    <!-- Board -->
    <div class="flex flex-center q-mb-xl">
      <div class="ttt-board" :class="$q.dark.isActive ? 'ttt-board--dark' : 'ttt-board--light'">
        <div
          v-for="(cell, index) in board"
          :key="index"
          class="ttt-cell flex flex-center"
          :class="[
            $q.dark.isActive ? 'ttt-cell--dark' : 'ttt-cell--light',
            { 'cursor-pointer ttt-cell--hoverable': gameStarted && !cell && !winner && !isDraw },
            { 'ttt-cell--winning': winningCells.includes(index) },
          ]"
          @click="makeMove(index)"
        >
          <transition name="pop">
            <q-icon
              v-if="cell"
              :name="cell === 'X' ? 'close' : 'radio_button_unchecked'"
              :color="cell === 'X' ? 'negative' : 'primary'"
              :class="{ 'ttt-icon--winning': winningCells.includes(index) }"
              size="52px"
            />
          </transition>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="row justify-center q-gutter-md q-mb-xl">
      <q-btn
        v-if="!gameStarted"
        color="primary"
        icon="casino"
        :label="t('tictactoe.startGame')"
        unelevated
        rounded
        size="lg"
        class="q-px-xl"
        @click="startGame"
      />
      <q-btn
        v-else
        color="primary"
        icon="refresh"
        :label="t('tictactoe.newGame')"
        unelevated
        rounded
        size="lg"
        class="q-px-xl"
        @click="newGame"
      />
      <q-btn
        v-if="scores.X > 0 || scores.O > 0 || scores.draws > 0"
        color="grey-6"
        icon="clear_all"
        :label="t('tictactoe.resetScores')"
        flat
        rounded
        size="lg"
        @click="resetAll"
      />
    </div>

    <!-- Scoreboard -->
    <transition name="fade">
      <div v-if="scores.X > 0 || scores.O > 0 || scores.draws > 0">
        <q-card flat class="card shadow-modern" style="max-width: 400px; margin: 0 auto">
          <q-card-section class="q-pa-lg">
            <div class="text-subtitle1 text-weight-bold q-mb-md">{{ t('tictactoe.scores') }}</div>
            <div class="row justify-around items-center">
              <div class="col text-center">
                <div class="text-h4 text-weight-bold text-negative">{{ scores.X }}</div>
                <div class="text-caption text-grey-6">
                  {{ playerXName || t('tictactoe.playerX') }}
                </div>
              </div>
              <div class="col text-center">
                <div class="text-h5 text-weight-bold text-grey-5">{{ scores.draws }}</div>
                <div class="text-caption text-grey-6">{{ t('tictactoe.draws') }}</div>
              </div>
              <div class="col text-center">
                <div class="text-h4 text-weight-bold text-primary">{{ scores.O }}</div>
                <div class="text-caption text-grey-6">
                  {{ playerOName || t('tictactoe.playerO') }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </transition>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

const { t } = useI18n();
const $q = useQuasar();

const WINNING_COMBINATIONS: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const playerXName = ref('');
const playerOName = ref('');
const board = ref<(string | null)[]>(Array(9).fill(null));
const currentPlayer = ref<'X' | 'O'>('X');
const gameStarted = ref(false);
const winningCells = ref<number[]>([]);
const scores = ref({ X: 0, O: 0, draws: 0 });
const statusKey = ref(0);

const winner = computed<'X' | 'O' | null>(() => {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board.value[a] && board.value[a] === board.value[b] && board.value[a] === board.value[c]) {
      return board.value[a] as 'X' | 'O';
    }
  }
  return null;
});

const isDraw = computed(() => !winner.value && board.value.every(Boolean));

const winnerName = computed(() =>
  winner.value === 'X'
    ? playerXName.value || t('tictactoe.playerX')
    : playerOName.value || t('tictactoe.playerO'),
);

const currentPlayerName = computed(() =>
  currentPlayer.value === 'X'
    ? playerXName.value || t('tictactoe.playerX')
    : playerOName.value || t('tictactoe.playerO'),
);

function startGame() {
  currentPlayer.value = Math.random() < 0.5 ? 'X' : 'O';
  board.value = Array(9).fill(null);
  winningCells.value = [];
  gameStarted.value = true;
  statusKey.value++;

  $q.notify({
    message: `${currentPlayer.value === 'X' ? playerXName.value || t('tictactoe.playerX') : playerOName.value || t('tictactoe.playerO')} ${t('tictactoe.startsFirst')}`,
    icon: 'casino',
    color: 'primary',
    position: 'top',
    timeout: 2000,
  });
}

function makeMove(index: number) {
  if (!gameStarted.value || board.value[index] || winner.value || isDraw.value) return;

  board.value = board.value.map((cell, i) => (i === index ? currentPlayer.value : cell));

  if (winner.value) {
    scores.value[winner.value]++;
    resolveWinningCells();
    statusKey.value++;
    return;
  }

  if (isDraw.value) {
    scores.value.draws++;
    statusKey.value++;
    return;
  }

  currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X';
  statusKey.value++;
}

function resolveWinningCells() {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board.value[a] && board.value[a] === board.value[b] && board.value[a] === board.value[c]) {
      winningCells.value = [a, b, c];
      return;
    }
  }
}

function newGame() {
  currentPlayer.value = Math.random() < 0.5 ? 'X' : 'O';
  board.value = Array(9).fill(null);
  winningCells.value = [];
  gameStarted.value = true;
  statusKey.value++;
}

function resetAll() {
  board.value = Array(9).fill(null);
  winningCells.value = [];
  scores.value = { X: 0, O: 0, draws: 0 };
  gameStarted.value = false;
  statusKey.value++;
}
</script>

<style scoped lang="scss">
.ttt-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 16px;
  border-radius: 24px;

  &--light {
    background: rgba(0, 0, 0, 0.04);
  }
  &--dark {
    background: rgba(255, 255, 255, 0.04);
  }
}

.ttt-cell {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  border: 2px solid;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;

  &--light {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.08);
  }

  &--dark {
    background: #0f172a;
    border-color: rgba(255, 255, 255, 0.08);
  }

  &--hoverable:hover {
    background: rgba(79, 70, 229, 0.08) !important;
    border-color: rgba(79, 70, 229, 0.35) !important;
    transform: scale(1.04);
  }

  &--winning {
    background: rgba(79, 70, 229, 0.14) !important;
    border-color: rgba(79, 70, 229, 0.5) !important;
  }
}

.ttt-icon--winning {
  filter: drop-shadow(0 0 6px currentColor);
}

.player-card {
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.player-card--active-x {
  border-color: rgba(var(--q-negative-rgb), 0.4) !important;
  box-shadow: 0 4px 20px rgba(var(--q-negative-rgb), 0.12) !important;
}

.player-card--active-o {
  border-color: rgba(var(--q-primary-rgb), 0.4) !important;
  box-shadow: 0 4px 20px rgba(var(--q-primary-rgb), 0.12) !important;
}

.pop-enter-active {
  animation: pop-in 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in {
  from {
    transform: scale(0.3);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 420px) {
  .ttt-cell {
    width: 80px;
    height: 80px;
  }
}
</style>
