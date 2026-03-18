<template>
  <q-layout view="lHh Lpr lFf" class="app-layout">
    <q-header class="app-header">
      <q-toolbar class="app-toolbar">
        <q-btn
          flat
          round
          icon="menu"
          aria-label="Menu"
          class="app-icon-btn lt-lg"
          @click="toggleLeftDrawer"
        />

        <div class="brand-lockup">
          <div class="brand-mark">SA</div>
          <div>
            <div class="brand-title">Sorteia Aí</div>
            <div class="brand-subtitle">{{ t('layout.brandSubtitle') }}</div>
          </div>
        </div>

        <div class="toolbar-context gt-sm">
          <div class="toolbar-context__label">{{ t('layout.activeWorkspace') }}</div>
          <div class="toolbar-context__value">{{ currentEntry.title }}</div>
          <div class="toolbar-context__caption">{{ currentEntry.caption }}</div>
        </div>

        <q-space />

        <div class="toolbar-actions">
          <div class="toolbar-chip gt-xs">
            <q-icon name="shield_lock" size="16px" />
            <span>{{ t('layout.privacyBadge') }}</span>
          </div>

          <q-btn
            flat
            round
            :icon="darkMode ? 'dark_mode' : 'light_mode'"
            :aria-label="darkMode ? t('theme.dark') : t('theme.light')"
            class="app-icon-btn"
            @click="toggleDarkMode"
          />

          <q-btn flat round icon="tune" aria-label="Settings" class="app-icon-btn">
            <q-menu anchor="bottom right" self="top right" :offset="[0, 12]" class="app-menu">
              <div class="settings-menu">
                <div class="settings-menu__header">
                  <div class="settings-menu__title">{{ t('settings.title') }}</div>
                  <div class="settings-menu__caption">{{ t('layout.settingsHint') }}</div>
                </div>

                <div class="settings-menu__section">
                  <q-toggle
                    v-model="darkMode"
                    :label="darkMode ? t('theme.dark') : t('theme.light')"
                    checked-icon="dark_mode"
                    unchecked-icon="light_mode"
                    @click="toggleDarkMode"
                  />
                </div>

                <div class="settings-menu__section">
                  <q-select
                    v-model="selectedLang"
                    :label="t('theme.language')"
                    :options="langOptions"
                    dense
                    outlined
                    emit-value
                    map-options
                    class="app-field"
                    @update:model-value="changeLanguage"
                  />
                </div>

                <div v-if="changeLanguageInfo" class="settings-menu__notice">
                  <q-icon name="info" size="18px" />
                  <span>{{ t('layout.languageReloadHint') }}</span>
                </div>
              </div>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="308"
      :breakpoint="1024"
      class="app-drawer"
    >
      <div class="drawer-scroll fit">
        <div class="drawer-shell">
          <div class="drawer-brand">
            <div class="drawer-brand__badge">{{ t('layout.brandTag') }}</div>
            <div class="drawer-brand__title">Sorteia Aí</div>
            <div class="drawer-brand__caption">{{ t('layout.brandSubtitle') }}</div>
          </div>

          <div class="drawer-metrics">
            <div class="drawer-metric">
              <span>{{ t('layout.flowsBadge') }}</span>
              <strong>{{ linksList.length }}</strong>
            </div>
            <div class="drawer-metric">
              <span>{{ t('nav.savedLists') }}</span>
              <strong>{{ savedLists.length }}</strong>
            </div>
          </div>

          <div class="drawer-nav">
            <div class="drawer-label">{{ t('layout.navTitle') }}</div>
            <q-list class="drawer-list">
              <EssentialLink v-for="link in linksList" :key="link.link" v-bind="link" />
            </q-list>
          </div>

          <div class="drawer-tip">
            <div class="drawer-tip__title">{{ t('layout.navTipTitle') }}</div>
            <div class="drawer-tip__description">{{ t('layout.navTipDescription') }}</div>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="app-page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useSavedConfigs } from 'src/composables/useSavedConfigs';
import type { SavedList } from 'src/utils/draw';

const $q = useQuasar();
const { locale, t } = useI18n();
const route = useRoute();

const darkMode = ref($q.dark.isActive);
const changeLanguageInfo = ref(false);

const { data: savedLists } = useSavedConfigs<SavedList[]>('saved_lists', []);

const linksList = computed<EssentialLinkProps[]>(() => [
  {
    title: t('nav.home'),
    caption: t('drawList.subtitle'),
    icon: 'grid_view',
    link: '/home',
  },
  {
    title: t('nav.names'),
    caption: t('drawList.nameDraw.desc'),
    icon: 'person_search',
    link: '/names',
  },
  {
    title: t('nav.numbers'),
    caption: t('drawList.numberDraw.desc'),
    icon: 'pin',
    link: '/numbers',
  },
  {
    title: t('nav.teams'),
    caption: t('drawList.teamDraw.desc'),
    icon: 'groups_2',
    link: '/teams',
  },
  {
    title: t('nav.prizes'),
    caption: t('drawList.prizeDraw.desc'),
    icon: 'workspace_premium',
    link: '/prizes',
  },
  {
    title: t('nav.savedLists'),
    caption: t('savedLists.pageSubtitle'),
    icon: 'bookmarks',
    link: '/saved-lists',
  },
  {
    title: t('nav.about'),
    caption: t('drawList.subtitle'),
    icon: 'lightbulb',
    link: '/about',
  },
  {
    title: t('pwa.pageTitle'),
    caption: t('pwa.subtitle'),
    icon: 'download',
    link: '/install',
  },
]);

const currentEntry = computed(() => {
  return linksList.value.find((entry) => entry.link === route.path) ?? linksList.value[0]!;
});

const leftDrawerOpen = ref($q.screen.gt.md);
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
