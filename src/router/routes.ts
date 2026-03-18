import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: 'home' },
      { path: 'home', component: () => import('pages/draw-pages/DrawListPage.vue') },
      { path: 'names', component: () => import('pages/draw-pages/DrawNamesPage.vue') },
      { path: 'numbers', component: () => import('pages/draw-pages/DrawNumbersPage.vue') },
      { path: 'teams', component: () => import('pages/draw-pages/DrawTeamsPage.vue') },
      { path: 'prizes', component: () => import('pages/draw-pages/DrawPrizesPage.vue') },
      { path: 'bingo', component: () => import('pages/draw-pages/DrawBingoPage.vue') },
      { path: 'about', component: () => import('pages/AboutPage.vue') },
      { path: 'install', component: () => import('pages/PWAInstall.vue') },
      { path: 'saved-lists', component: () => import('pages/SavedListsPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
