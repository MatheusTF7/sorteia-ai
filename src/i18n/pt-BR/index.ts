// Portuguese (Brazil) translations
export default {
  // Genérico
  failed: 'Ação falhou',
  success: 'A ação foi bem sucedida',

  // Layout / navegação
  nav: {
    home: 'Início',
    names: 'Nomes',
    numbers: 'Números',
    teams: 'Times',
    prizes: 'Prêmios',
    about: 'Sobre',
  },
  pwa: {
    pageTitle: 'Instalar este app',
    subtitle:
      'Este app pode ser instalado no seu dispositivo para acesso rápido e uso offline. Siga os passos abaixo conforme a sua plataforma.',
    installPromptTitle: 'Prompt de instalação',
    installPromptDesc:
      'Em navegadores compatíveis você pode ver um prompt de "Instalar" — use-o para adicionar o app ao dispositivo.',
    android: {
      title: 'Android (Chrome / Edge)',
      step1: 'Abra o menu do navegador (três pontos) enquanto estiver nesta página.',
      step2: 'Toque em "Instalar app" ou "Adicionar à Tela de Início".',
      step3: 'Confirme para adicionar o app à sua tela de início.',
    },
    ios: {
      title: 'iOS (Safari)',
      step1: 'Abra o Safari e navegue até esta página.',
      step2: 'Toque no botão Compartilhar (quadrado com seta).',
      step3: 'Selecione "Adicionar à Tela de Início" e confirme.',
    },
    desktop: {
      title: 'Desktop (Chrome / Edge)',
      step1: 'Procure um ícone de instalação na barra de endereço ou no menu do navegador.',
      step2: 'Escolha "Instalar" para adicionar o app ao seu sistema.',
    },
    notes: {
      title: 'Observações',
      offline: 'Após a instalação o app pode funcionar offline para páginas já visitadas.',
      permissions:
        'Algumas funcionalidades podem solicitar permissões (notificações, câmera) — conceda apenas se confiar no site.',
    },
  },

  // Página de tipos de sorteio
  drawList: {
    title: 'Tipos de Sorteios',
    subtitle: 'Escolha o tipo de sorteio que deseja realizar',
    nameDraw: {
      title: 'Sorteio de Nomes',
      desc: 'Ideal para rifas, salas de aula ou eventos',
    },
    numberDraw: {
      title: 'Sorteio de Números',
      desc: 'Perfeito para loterias e sorteios numéricos',
    },
    teamDraw: {
      title: 'Sorteio de Times',
      desc: 'Crie equipes de forma aleatória',
    },
    prizeDraw: {
      title: 'Sorteio de Prêmios',
      desc: 'Distribua prêmios automaticamente',
    },
  },

  // Página de times
  teams: {
    pageTitle: 'Sorteio de Times',
    pageSubtitle: 'Adicione participantes e gere times aleatórios',
    participants: 'Participantes',
    addParticipant: 'Adicionar participante',
    noParticipants: 'Nenhum participante adicionado',
    preconfig: 'Pre config',
    config: {
      teamCount: 'Número de times',
      teamSize: 'Tamanho do time (opcional)',
      defineStarter: 'Definir iniciante',
    },
    actions: {
      generateTeams: 'Gerar Times',
      pickStarter: 'Sortear Iniciante',
    },
    result: {
      title: 'Resultado',
      none: 'Nenhum time gerado ainda',
    },
    starterLabel: 'Iniciante',
  },

  // Tema
  theme: {
    dark: 'Modo Escuro',
    light: 'Modo Claro',
    language: 'Idioma',
  },

  // Página de nomes
  names: {
    pageTitle: 'Sorteio de Nomes',
    pageSubtitle: 'Insira os nomes e defina quantos serão sorteados',
    listTitle: 'Lista de nomes',
    addName: 'Adicionar nome',
    noNames: 'Nenhum nome adicionado',
    preconfig: 'Pre config',
    configTitle: 'Configuração',
    config: {
      quantity: 'Quantidade a sortear',
    },
    actions: {
      draw: 'Sortear',
    },
    result: {
      title: 'Resultado',
      none: 'Nenhum sorteio realizado ainda',
    },
  },

  // Página de números
  numbers: {
    pageTitle: 'Sorteio de Números',
    pageSubtitle: 'Defina o intervalo e quantos números deseja sortear',
    configTitle: 'Configuração',
    minLabel: 'Número mínimo',
    maxLabel: 'Número máximo',
    config: {
      quantity: 'Quantidade a sortear',
    },
    allowRepeats: 'Permitir números repetidos',
    sortResult: 'Ordenar resultado',
    actions: {
      draw: 'Sortear',
    },
    result: {
      title: 'Resultado',
      none: 'Nenhum sorteio realizado ainda',
    },
  },

  // Página de prêmios
  prizes: {
    pageTitle: 'Sorteio de Prêmios',
    pageSubtitle: 'Configure prêmios, participantes e regras do sorteio',
    prizesTitle: 'Prêmios',
    addPrize: 'Adicionar prêmio',
    noPrizes: 'Nenhum prêmio adicionado',

    participantsTitle: 'Participantes',
    useNumberRange: 'Usar números em vez de nomes',
    addParticipant: 'Adicionar participante',
    noParticipants: 'Nenhum participante adicionado',
    rangeMin: 'Min',
    rangeMax: 'Max',

    configTitle: 'Configuração',
    drawCount: 'Número de sorteios',
    prizesPerDraw: 'Prêmios por sorteio',
    singleWinnerPerDraw: 'Um participante ganha todos os prêmios por sorteio',
    actions: {
      runDraw: 'Executar Sorteio',
    },

    result: {
      title: 'Resultado',
      none: 'Nenhum sorteio executado ainda',
    },
  },

  settings: {
    title: 'Configurações',
  },
};
