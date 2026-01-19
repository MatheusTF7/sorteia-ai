<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 text-weight-bold q-mb-md">{{ t('drawList.title') }}</div>
    <div class="text-subtitle2 text-grey-7 q-mb-lg">
      {{ t('drawList.subtitle') }}
    </div>

    <div class="row q-col-gutter-lg">
      <div v-for="item in sorteios" :key="item.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          class="sorteio-card cursor-pointer full-height"
          flat
          bordered
          @click="item.route ? $router.push(item.route) : null"
        >
          <q-card-section class="row items-center no-wrap">
            <q-avatar size="56px" :color="item.color" text-color="white" class="q-mr-md">
              <q-icon :name="item.icon" size="28px" />
            </q-avatar>

            <div>
              <div class="text-subtitle1 text-weight-medium">
                {{ item.nome }}
              </div>
              <div class="text-caption text-grey-7">
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
  color: string;
  route?: string;
}

const sorteios: Sorteio[] = [
  {
    id: 1,
    nome: t('drawList.nameDraw.title'),
    descricao: t('drawList.nameDraw.desc'),
    icon: 'person',
    color: 'primary',
    route: '/names',
  },
  {
    id: 2,
    nome: t('drawList.numberDraw.title'),
    descricao: t('drawList.numberDraw.desc'),
    icon: 'pin',
    color: 'deep-orange',
    route: '/numbers',
  },
  {
    id: 3,
    nome: t('drawList.teamDraw.title'),
    descricao: t('drawList.teamDraw.desc'),
    icon: 'groups',
    color: 'teal',
    route: '/teams',
  },
  {
    id: 4,
    nome: t('drawList.prizeDraw.title'),
    descricao: t('drawList.prizeDraw.desc'),
    icon: 'emoji_events',
    color: 'amber',
    route: '/prizes',
  },
  {
    id: 5,
    nome: t('nav.about'),
    descricao: t('drawList.subtitle'),
    icon: 'info',
    color: 'purple',
    route: '/about',
  },
  {
    id: 6,
    nome: t('pwa.pageTitle'),
    descricao: t('pwa.subtitle'),
    icon: 'get_app',
    color: 'grey',
    route: '/install',
  },
];
</script>

<style scoped>
.sorteio-card {
  border-radius: 16px;
  transition: all 0.25s ease;
}

.sorteio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}
</style>
