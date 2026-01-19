<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated :class="$q.dark.isActive ? 'header--dark' : 'header--light'">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Sorteia Aí </q-toolbar-title>

        <div>
          <q-btn
            :color="darkMode ? 'yellow' : 'blue-grey-9'"
            :icon="darkMode ? 'dark_mode' : 'light_mode'"
            round
            dense
            flat
            class="q-mr-sm"
            @click="toggleDarkMode"
          />
          <q-btn flat dense round icon="settings" aria-label="Settings">
            <q-menu anchor="top right" self="top right">
              <q-list padding style="min-width: 280px">
                <q-item>
                  <q-item-section>
                    <div class="text-subtitle2">{{ t('settings.title') }}</div>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item>
                  <q-item-section>
                    <q-toggle
                      v-model="darkMode"
                      :label="darkMode ? t('theme.dark') : t('theme.light')"
                      dense
                      keep-color
                      :color="darkMode ? 'light-blue-10' : 'yellow'"
                      checked-icon="dark_mode"
                      unchecked-icon="light_mode"
                      @click="toggleDarkMode()"
                    />
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <div class="row items-center">
                      <q-select
                        :label="t('theme.language')"
                        class="full-width"
                        v-model="selectedLang"
                        :options="langOptions"
                        dense
                        filled
                        emit-value
                        map-options
                        @update:model-value="changeLanguage"
                      />
                    </div>
                  </q-item-section>
                </q-item>
                <q-item v-if="changeLanguageInfo" class="bg-blue-1 text-blue">
                  <q-item-section top avatar>
                    <q-avatar color="primary" text-color="white" icon="info" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label
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

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> {{ t('nav.home') }}</q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
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
    title: t('nav.about'),
    caption: t('drawList.subtitle'),
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
