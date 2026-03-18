<template>
  <q-page :class="['page-container', isCompact ? 'q-pa-md' : 'q-pa-xl']">
    <div :class="['text-center', isCompact ? 'q-mb-md' : 'q-mb-xl']">
      <div
        class="text-h3 text-weight-bold q-mb-md text-gradient"
        :class="{
          'text-h3': !isCompact,
          'text-h4': isCompact,
        }"
        style="letter-spacing: -1px"
      >
        {{ t('drawList.title') }}
      </div>
      <div
        class="text-h6 text-weight-regular text-grey-6"
        style="max-width: 600px; margin: 0 auto; line-height: 1.3rem"
      >
        {{ t('drawList.subtitle') }}
      </div>
    </div>

    <div class="row justify-end max-width-container">
      <q-btn-toggle
        v-model="isCompact"
        dense
        flat
        rounded
        toggle-color="primary"
        :options="[
          { icon: 'view_module', value: false },
          { icon: 'view_list', value: true },
        ]"
        @update:model-value="saveViewMode"
      />
    </div>

    <!-- Normal grid view -->
    <div v-if="!isCompact" class="row q-col-gutter-xl justify-center max-width-container">
      <div v-for="item in sorteios" :key="item.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          class="sorteio-card cursor-pointer full-height flex flex-center text-center q-pa-md"
          flat
          @click="item.route ? $router.push(item.route) : null"
        >
          <q-card-section class="column items-center q-pa-none w-full">
            <div
              class="icon-wrapper q-mb-lg flex flex-center"
              :style="{ backgroundColor: `rgba(${item.rgb}, 0.1)` }"
            >
              <q-icon :name="item.icon" size="36px" :style="{ color: `rgb(${item.rgb})` }" />
            </div>

            <div>
              <div class="text-h6 text-weight-bold q-mb-sm text-dark-mode-adjust">
                {{ item.nome }}
              </div>
              <div class="text-body2 text-grey-6 line-height-relaxed">
                {{ item.descricao }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Compact list view -->
    <div v-else class="column q-gutter-sm max-width-container">
      <q-card
        v-for="item in sorteios"
        :key="item.id"
        class="sorteio-card-compact cursor-pointer"
        flat
        @click="item.route ? $router.push(item.route) : null"
      >
        <q-card-section class="row items-center q-pa-sm">
          <div
            class="icon-wrapper-compact flex flex-center q-mr-md"
            :style="{ backgroundColor: `rgba(${item.rgb}, 0.1)` }"
          >
            <q-icon :name="item.icon" size="24px" :style="{ color: `rgb(${item.rgb})` }" />
          </div>
          <div class="col">
            <div class="text-subtitle2 text-weight-bold text-dark-mode-adjust">{{ item.nome }}</div>
            <div class="text-caption text-grey-6">{{ item.descricao }}</div>
          </div>
          <q-icon name="chevron_right" color="grey-5" size="20px" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

const { t } = useI18n();
const $q = useQuasar();

const STORAGE_KEY = 'sorteia-view-mode';
const isCompact = ref(false);

function saveViewMode(value: boolean) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    isCompact.value = JSON.parse(saved) as boolean;
  } else {
    isCompact.value = $q.screen.lt.md;
  }
});

interface Sorteio {
  id: number;
  nome: string;
  descricao: string;
  icon: string;
  rgb: string;
  route?: string;
}

const sorteios: Sorteio[] = [
  {
    id: 1,
    nome: t('drawList.nameDraw.title'),
    descricao: t('drawList.nameDraw.desc'),
    icon: 'person',
    rgb: '79, 70, 229', // Indigo
    route: '/names',
  },
  {
    id: 2,
    nome: t('drawList.numberDraw.title'),
    descricao: t('drawList.numberDraw.desc'),
    icon: 'pin',
    rgb: '244, 63, 94', // Rose
    route: '/numbers',
  },
  {
    id: 3,
    nome: t('drawList.teamDraw.title'),
    descricao: t('drawList.teamDraw.desc'),
    icon: 'groups',
    rgb: '16, 185, 129', // Emerald
    route: '/teams',
  },
  {
    id: 4,
    nome: t('drawList.prizeDraw.title'),
    descricao: t('drawList.prizeDraw.desc'),
    icon: 'emoji_events',
    rgb: '245, 158, 11', // Amber
    route: '/prizes',
  },
  {
    id: 5,
    nome: t('drawList.bingoDraw.title'),
    descricao: t('drawList.bingoDraw.desc'),
    icon: 'grid_on',
    rgb: '6, 182, 212', // Cyan
    route: '/bingo',
  },
  {
    id: 6,
    nome: t('drawList.tictactoeDraw.title'),
    descricao: t('drawList.tictactoeDraw.desc'),
    icon: 'grid_3x3',
    rgb: '236, 72, 153', // Pink
    route: '/tictactoe',
  },
  {
    id: 7,
    nome: t('nav.savedLists'),
    descricao: t('savedLists.pageSubtitle'),
    icon: 'bookmark',
    rgb: '102, 126, 234', // Blue
    route: '/saved-lists',
  },
  {
    id: 8,
    nome: t('nav.about'),
    descricao: t('nav.aboutSubtitle'),
    icon: 'info',
    rgb: '139, 92, 246', // Violet
    route: '/about',
  },
  {
    id: 9,
    nome: t('pwa.pageTitle'),
    descricao: t('pwa.subtitle'),
    icon: 'get_app',
    rgb: '100, 116, 139', // Slate
    route: '/install',
  },
];
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.max-width-container {
  width: 100%;
  max-width: 1200px;
}

.sorteio-card {
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.body--dark .sorteio-card {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.sorteio-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08) !important;
  border-color: rgba(79, 70, 229, 0.1);
}

body.body--dark .sorteio-card:hover {
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4) !important;
  border-color: rgba(79, 70, 229, 0.3);
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  transition: transform 0.3s ease;
}

.sorteio-card:hover .icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.line-height-relaxed {
  line-height: 1.6;
}

.w-full {
  width: 100%;
}

.text-dark-mode-adjust {
  color: #1e293b;
}

body.body--dark .text-dark-mode-adjust {
  color: #f8fafc;
}

/* Compact list card */
.sorteio-card-compact {
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

body.body--dark .sorteio-card-compact {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.sorteio-card-compact:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.08) !important;
  border-color: rgba(79, 70, 229, 0.15);
}

body.body--dark .sorteio-card-compact:hover {
  box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.4) !important;
  border-color: rgba(79, 70, 229, 0.3);
}

.icon-wrapper-compact {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.sorteio-card-compact:hover .icon-wrapper-compact {
  transform: scale(1.08);
}
</style>
