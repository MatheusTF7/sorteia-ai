<template>
  <q-page class="q-pa-lg">
    <div class="container">
      <q-card flat bordered class="card">
        <q-card-section>
          <div class="text-h5 text-weight-bold q-mb-md">{{ t('title') }}</div>

          <div class="text-subtitle1 text-weight-medium q-mb-sm">
            {{ t('howItWorks.title') }}
          </div>

          <p class="text-body2 q-mb-md">
            {{ t('howItWorks.p1') }}
          </p>

          <p class="text-body2 q-mb-md">
            {{ t('howItWorks.p2') }}
          </p>

          <q-separator class="q-my-md" />

          <div class="text-subtitle1 text-weight-medium q-mb-sm">
            {{ t('considerations.title') }}
          </div>

          <ul class="text-body2 q-pl-lg">
            <li>{{ t('considerations.i1') }}</li>
            <li>{{ t('considerations.i2') }}</li>
            <li>{{ t('considerations.i3') }}</li>
            <li>{{ t('considerations.i4') }}</li>
          </ul>

          <q-separator class="q-my-md" />

          <div class="text-subtitle1 text-weight-medium q-mb-sm">
            {{ t('disclaimer.title') }}
          </div>

          <p class="text-body2 q-mb-md">
            {{ t('disclaimer.p1') }}
          </p>

          <p class="text-body2 q-mb-md">
            {{ t('disclaimer.p2') }}
          </p>

          <p class="text-body2">
            {{ t('disclaimer.p3') }}
          </p>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n({
  locale: 'pt-BR',
  fallbackLocale: 'en-US',
  messages: {
    'pt-BR': {
      title: 'Sobre o aplicativo',
      howItWorks: {
        title: 'Como os sorteios funcionam',
        p1: 'Todos os sorteios deste aplicativo utilizam lógica de pseudo-randomização baseada na função Math.random() do JavaScript. Os dados informados (participantes, números ou prêmios) são organizados em listas e processados de acordo com as regras escolhidas pelo usuário.',
        p2: 'Quando aplicável, os dados são embaralhados para garantir uma distribuição justa, como na criação de times ou na atribuição de prêmios. Nenhum serviço externo ou sistema de randomização de terceiros é utilizado.',
      },
      considerations: {
        title: 'Considerações importantes',
        i1: 'Este aplicativo não garante randomização criptográfica ou de nível oficial.',
        i2: 'Os resultados podem variar a cada execução, mesmo com os mesmos dados.',
        i3: 'Todo o processamento ocorre localmente no navegador do usuário.',
        i4: 'Nenhum dado ou informação fornecida é armazenado ou compartilhado com terceiros. Os dados permanecem apenas no dispositivo do usuário.',
      },
      disclaimer: {
        title: 'Isenção de responsabilidade',
        p1: 'Este aplicativo foi criado para uso pessoal por seu desenvolvedor, com o objetivo principal de realizar sorteios de times para atividades e jogos informais.',
        p2: 'O aplicativo é fornecido "como está", sem garantias de funcionamento, precisão ou adequação a qualquer finalidade específica.',
        p3: 'O desenvolvedor não se responsabiliza por bugs, problemas, resultados inesperados ou pelo uso indevido das informações geradas.',
      },
    },
    'en-US': {
      title: 'About this app',
      howItWorks: {
        title: 'How the draws work',
        p1: "All draws in this application use pseudo-random logic based on JavaScript's Math.random() function. The provided data (participants, numbers or prizes) is organized into lists and processed according to the rules chosen by the user.",
        p2: 'Whenever applicable, the data is shuffled to ensure fair distribution, such as when creating teams or assigning prizes. No external services or third-party randomization systems are used.',
      },
      considerations: {
        title: 'Important considerations',
        i1: 'This application does not provide cryptographic or official-grade randomness.',
        i2: 'Results may vary between executions even with the same input data.',
        i3: "All processing happens locally in the user's browser.",
        i4: "No data or information provided is stored or shared with third parties. Data remains only on the user's device.",
      },
      disclaimer: {
        title: 'Disclaimer',
        p1: 'This app was created for personal use by its developer, mainly to generate random teams for casual games and activities.',
        p2: 'The application is provided "as is", without any guarantees regarding correctness, reliability or fitness for a particular purpose.',
        p3: 'The developer is not responsible for bugs, issues, unexpected results or misuse of the generated information.',
      },
    },
  },
});
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
}

.card {
  border-radius: 16px;
}
</style>
