<template>
  <q-page class="page-shell page-shell--narrow">
    <AppPageHero :title="t('title')" :subtitle="t('intro')" icon="lightbulb">
      <template #meta>
        <div class="metric-pills">
          <div v-for="item in highlights" :key="item.label" class="metric-pill">
            <span class="metric-pill__label">{{ item.label }}</span>
            <strong class="metric-pill__value">{{ item.value }}</strong>
          </div>
        </div>
      </template>
    </AppPageHero>

    <div class="page-grid page-grid--two">
      <q-card flat class="panel-card">
        <q-card-section class="panel-card__header">
          <div>
            <div class="panel-card__eyebrow">{{ t('howItWorks.title') }}</div>
            <div class="panel-card__title">{{ t('howItWorks.title') }}</div>
          </div>
        </q-card-section>

        <q-card-section class="panel-card__body">
          <div class="info-block__body">
            <p>{{ t('howItWorks.p1') }}</p>
            <p class="q-mt-md">{{ t('howItWorks.p2') }}</p>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat class="panel-card">
        <q-card-section class="panel-card__header">
          <div>
            <div class="panel-card__eyebrow">{{ t('considerations.title') }}</div>
            <div class="panel-card__title">{{ t('considerations.title') }}</div>
          </div>
        </q-card-section>

        <q-card-section class="panel-card__body">
          <ul class="content-list">
            <li>{{ t('considerations.i1') }}</li>
            <li>{{ t('considerations.i2') }}</li>
            <li>{{ t('considerations.i3') }}</li>
            <li>{{ t('considerations.i4') }}</li>
          </ul>
        </q-card-section>
      </q-card>
    </div>

    <q-card flat class="panel-card q-mt-lg">
      <q-card-section class="panel-card__header">
        <div>
          <div class="panel-card__eyebrow">{{ t('disclaimer.title') }}</div>
          <div class="panel-card__title">{{ t('disclaimer.title') }}</div>
        </div>
      </q-card-section>

      <q-card-section class="panel-card__body">
        <div class="info-block__body">
          <p>{{ t('disclaimer.p1') }}</p>
          <p class="q-mt-md">{{ t('disclaimer.p2') }}</p>
          <p class="q-mt-md">{{ t('disclaimer.p3') }}</p>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppPageHero from 'components/AppPageHero.vue';

const { t } = useI18n({
  inheritLocale: true,
  messages: {
    'pt-BR': {
      title: 'Sobre o aplicativo',
      intro:
        'O Sorteia Ai foi pensado para manter os sorteios simples, locais e fáceis de operar sem depender de serviços externos.',
      howItWorks: {
        title: 'Como os sorteios funcionam',
        p1: 'Todos os sorteios deste aplicativo utilizam lógica de pseudo-randomização baseada na função Math.random() do JavaScript. Os dados informados são organizados em listas e processados conforme as regras escolhidas pelo usuário.',
        p2: 'Quando necessário, os dados são embaralhados para garantir distribuição justa, como na criação de times ou na atribuição de prêmios. Nenhum serviço externo ou sistema de randomização de terceiros é utilizado.',
      },
      considerations: {
        title: 'Considerações importantes',
        i1: 'Este aplicativo não garante randomização criptográfica ou de nível oficial.',
        i2: 'Os resultados podem variar a cada execução, mesmo com os mesmos dados.',
        i3: 'Todo o processamento ocorre localmente no navegador do usuário.',
        i4: 'Nenhum dado fornecido é armazenado ou compartilhado com terceiros.',
      },
      disclaimer: {
        title: 'Isenção de responsabilidade',
        p1: 'Este aplicativo foi criado para uso pessoal, principalmente em atividades informais e operacionais do dia a dia.',
        p2: 'O aplicativo é fornecido "como está", sem garantias de funcionamento, precisão ou adequação a qualquer finalidade específica.',
        p3: 'O desenvolvedor não se responsabiliza por bugs, resultados inesperados ou uso indevido das informações geradas.',
      },
      highlights: {
        local: 'Processamento',
        randomness: 'Método',
        privacy: 'Privacidade',
      },
      values: {
        local: 'No navegador',
        randomness: 'Pseudo-aleatório',
        privacy: 'Sem terceiros',
      },
    },
    'en-US': {
      title: 'About this app',
      intro:
        'Sorteia Ai is designed to keep draws simple, local and easy to operate without relying on external services.',
      howItWorks: {
        title: 'How the draws work',
        p1: "All draws in this application use pseudo-random logic based on JavaScript's Math.random() function. The provided data is organized into lists and processed according to the rules chosen by the user.",
        p2: 'When needed, the data is shuffled to ensure fair distribution, such as when creating teams or assigning prizes. No external services or third-party randomization systems are used.',
      },
      considerations: {
        title: 'Important considerations',
        i1: 'This application does not provide cryptographic or official-grade randomness.',
        i2: 'Results may vary between executions even with the same input data.',
        i3: "All processing happens locally in the user's browser.",
        i4: 'No provided data is stored or shared with third parties.',
      },
      disclaimer: {
        title: 'Disclaimer',
        p1: 'This application was created for personal use, especially for informal and day-to-day operational activities.',
        p2: 'The application is provided "as is", without guarantees regarding correctness, reliability or fitness for a particular purpose.',
        p3: 'The developer is not responsible for bugs, unexpected results or misuse of the generated information.',
      },
      highlights: {
        local: 'Processing',
        randomness: 'Method',
        privacy: 'Privacy',
      },
      values: {
        local: 'In browser',
        randomness: 'Pseudo-random',
        privacy: 'No third parties',
      },
    },
  },
});

const highlights = computed(() => [
  { label: t('highlights.local'), value: t('values.local') },
  { label: t('highlights.randomness'), value: t('values.randomness') },
  { label: t('highlights.privacy'), value: t('values.privacy') },
]);
</script>
