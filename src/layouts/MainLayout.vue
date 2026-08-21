<template>
  <q-layout view="lHh Lpr lFf">
    <q-header flat :class="$q.dark.isActive ? 'header--dark' : 'header--light'">
      <q-toolbar class="q-py-sm">
        <q-btn
          flat
          dense
          round
          :icon="leftDrawerOpen ? 'menu_open' : 'menu'"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          color="primary"
          class="q-mr-sm"
        >
          <q-tooltip anchor="top middle" self="bottom middle">
            {{ leftDrawerOpen ? t('nav.closeMenu') : t('nav.openMenu') }}
          </q-tooltip>
        </q-btn>

        <q-toolbar-title
          class="text-weight-bold text-gradient"
          style="font-size: 1.5rem; letter-spacing: -0.5px"
        >
          Sorteia Aí
        </q-toolbar-title>

        <div>
          <q-btn
            :color="darkMode ? 'amber-4' : 'slate-8'"
            :icon="darkMode ? 'lightbulb' : 'dark_mode'"
            round
            dense
            flat
            class="app-icon-btn q-mr-sm"
            @click="toggleDarkMode"
          >
            <q-tooltip anchor="top middle" self="bottom middle">
              {{ darkMode ? t('theme.light') : t('theme.dark') }}
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="settings"
            class="app-icon-btn"
            aria-label="Settings"
            color="grey-6"
          >
            <q-tooltip anchor="top middle" self="bottom middle">
              {{ t('settings.title') }}
            </q-tooltip>

            <q-menu anchor="top right" self="top right" class="br-20 shadow-modern">
              <q-list padding style="min-width: 280px">
                <q-item>
                  <q-item-section>
                    <div class="text-subtitle1 text-weight-bold">{{ t('settings.title') }}</div>
                  </q-item-section>
                </q-item>

                <q-separator class="q-my-sm" />

                <q-item>
                  <q-item-section>
                    <q-toggle
                      v-model="darkMode"
                      :label="darkMode ? t('theme.dark') : t('theme.light')"
                      dense
                      class="text-weight-medium"
                      keep-color
                      :color="darkMode ? 'primary' : 'grey-8'"
                      checked-icon="dark_mode"
                      unchecked-icon="light_mode"
                      @click="toggleDarkMode()"
                    />
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <div class="row items-center q-pt-sm">
                      <q-select
                        :label="t('theme.language')"
                        class="full-width"
                        v-model="selectedLang"
                        :options="langOptions"
                        dense
                        outlined
                        emit-value
                        map-options
                        @update:model-value="changeLanguage"
                      />
                    </div>
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="changeLanguageInfo"
                  class="q-mt-sm rounded-borders bg-indigo-1 text-indigo-8 q-mx-sm"
                >
                  <q-item-section top avatar>
                    <q-avatar color="indigo" text-color="white" icon="info" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-caption text-weight-medium"
                      >Se houver texto não traduzido, <br />
                      por favor, recarregue a página.</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="280">
      <q-list class="q-pt-lg">
        <q-item-label header class="text-weight-bold text-uppercase text-grey-5 q-mb-sm q-px-lg">
          {{ t('nav.home') }}
        </q-item-label>

        <div class="q-px-sm">
          <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
const $q = useQuasar();
const { locale, t } = useI18n();

const darkMode = ref($q.dark.isActive);
const changeLanguageInfo = ref(false);

const linksList: EssentialLinkProps[] = [
  {
    title: t('nav.home'),
    caption: t('drawList.subtitle'),
    icon: 'house',
    link: '/home',
  },
  {
    title: t('nav.names'),
    caption: t('drawList.nameDraw.desc'),
    icon: 'emoji_events',
    link: '/names',
  },
  {
    title: t('nav.numbers'),
    caption: t('drawList.numberDraw.desc'),
    icon: 'casino',
    link: '/numbers',
  },
  {
    title: t('nav.coinDice'),
    caption: t('drawList.coinDiceDraw.desc'),
    icon: 'toll',
    link: '/coin-dice',
  },
  {
    title: t('nav.teams'),
    caption: t('drawList.teamDraw.desc'),
    icon: 'groups',
    link: '/teams',
  },
  {
    title: t('nav.prizes'),
    caption: t('drawList.prizeDraw.desc'),
    icon: 'card_giftcard',
    link: '/prizes',
  },
  {
    title: t('nav.bingo'),
    caption: t('drawList.bingoDraw.desc'),
    icon: 'grid_on',
    link: '/bingo',
  },
  {
    title: t('nav.tictactoe'),
    caption: t('drawList.tictactoeDraw.desc'),
    icon: 'grid_3x3',
    link: '/tictactoe',
  },
  {
    title: t('nav.donateTime'),
    caption: t('nav.donateTimeSubtitle'),
    icon: 'timer',
    link: '/donate-time',
  },
  {
    title: t('nav.savedLists'),
    caption: t('savedLists.pageSubtitle'),
    icon: 'bookmark',
    link: '/saved-lists',
  },
  {
    title: t('nav.about'),
    caption: t('nav.aboutSubtitle'),
    icon: 'info',
    link: '/about',
  },
  {
    title: t('pwa.pageTitle'),
    caption: t('pwa.subtitle'),
    icon: 'get_app',
    link: '/install',
  },
];

const leftDrawerOpen = ref(false);
const langOptions = [
  { label: 'Português (BR)', value: 'pt-BR' },
  { label: 'English (US)', value: 'en-US' },
];
const selectedLang = ref(locale.value || 'en-US');

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function toggleDarkMode() {
  $q.dark.toggle();
  darkMode.value = $q.dark.isActive;
  localStorage.setItem('dark_mode', String($q.dark.isActive));
}

function changeLanguage(val?: string) {
  const newLang = val ?? selectedLang.value;
  locale.value = newLang;
  selectedLang.value = newLang;
  localStorage.setItem('lang', newLang);
  changeLanguageInfo.value = true;
}

onMounted(() => {
  const savedMode = localStorage.getItem('dark_mode');
  if (savedMode !== null) {
    const isDark = savedMode === 'true';
    if (isDark !== $q.dark.isActive) {
      $q.dark.set(isDark);
      darkMode.value = isDark;
    }
  }

  const savedLang = localStorage.getItem('lang');
  if (savedLang) {
    locale.value = savedLang;
    selectedLang.value = savedLang;
  }
});
</script>
