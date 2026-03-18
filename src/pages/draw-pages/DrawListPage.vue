<template>
  <q-page class="q-pa-xl page-container">
    <div class="text-center q-mb-xl">
      <div class="text-h3 text-weight-bold q-mb-md text-gradient" style="letter-spacing: -1px">
        {{ t('drawList.title') }}
      </div>
      <div class="text-h6 text-weight-regular text-grey-6" style="max-width: 600px; margin: 0 auto">
        {{ t('drawList.subtitle') }}
      </div>
    </div>

    <div class="row q-col-gutter-xl justify-center max-width-container">
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
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

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
    nome: t('nav.about'),
    descricao: t('drawList.subtitle'),
    icon: 'info',
    rgb: '139, 92, 246', // Violet
    route: '/about',
  },
  {
    id: 6,
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
</style>
