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
    bingo: 'Bingo',
    about: 'Sobre',
    savedLists: 'Minhas Listas',
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
    bingoDraw: {
      title: 'Bingo',
      desc: 'Jogue bingo completo com cartela e sorteio',
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
      teamSize: 'Tamanho do time',
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

  // Página de bingo
  bingo: {
    pageTitle: 'Bingo',
    pageSubtitle: 'Jogue bingo com amigos! Sorteie pedras, marque sua cartela e grite BINGO!',
    startGame: 'Iniciar Jogo',
    roles: {
      drawer: 'Sorteador',
      drawerDesc: 'Sorteia os números e controla o jogo',
      player: 'Participante',
      playerDesc: 'Recebe uma cartela e marca os números sorteados',
      both: 'Sorteador Participante',
      bothDesc: 'Sorteia os números e joga com sua própria cartela',
    },
    drawerPanel: 'Painel do Sorteador',
    toggleTts: 'Alternar leitura em voz alta',
    toggleSuspense: 'Alternar animação de suspense',
    drawNumber: 'Sortear Número',
    newGame: 'Novo Jogo',
    progress: 'Progresso',
    calledNumbers: 'Números Sorteados',
    yourCard: 'Sua Cartela',
    newCard: 'Nova Cartela',
    markAllToShout: 'Complete uma linha, coluna ou diagonal para gritar BINGO!',
    congratulations: 'Parabéns! Você completou o Bingo!',
    verifyWithDrawer: 'Apresente sua cartela ao sorteador para conferência.',
    confirmReset: 'Reiniciar jogo',
    confirmResetDesc: 'Todos os números sorteados e marcações serão perdidos. Deseja continuar?',
    confirmChangeRoleDesc: 'O jogo atual será perdido. Deseja trocar de modo?',
    reset: 'Reiniciar',
    changeRole: 'Trocar modo',
  },

  settings: {
    title: 'Configurações',
  },

  // Página de listas salvas
  savedLists: {
    pageTitle: 'Minhas Listas',
    pageSubtitle: 'Gerencie suas listas de nomes salvas',
    noLists: 'Nenhuma lista salva ainda',
    firstList: 'Criar minha primeira lista',
    createList: 'Nova Lista',
    editList: 'Editar Lista',
    deleteList: 'Excluir Lista',
    listName: 'Nome da lista',
    addItemsLabel: 'Adicionar nomes',
    addItemsHint: 'Separe múltiplos nomes por vírgula ( , ), ponto-e-vírgula ( ; ) ou ponto ( . )',
    itemsLabel: 'Nomes',
    noItems: 'Nenhum nome adicionado',
    confirmDelete: 'Deseja excluir a lista "{name}"? Esta ação não pode ser desfeita.',
    save: 'Salvar',
    cancel: 'Cancelar',
    confirm: 'Excluir',
    itemCount: '{count} nome | {count} nomes',
    isDefault: 'Padrão',
    setDefault: 'Marcar como padrão',
    unsetDefault: 'Remover como padrão',
  },

  // Compartilhado entre páginas de sorteio
  shared: {
    loadList: 'Carregar Lista',
    saveList: 'Salvar Lista',
    noSavedLists: 'Nenhuma lista salva. Crie uma em "Minhas Listas".',
    listLoaded: 'Lista "{name}" carregada!',
    listSaved: 'Lista "{name}" salva!',
    listNameLabel: 'Nome da lista',
    addNamesHint: 'Separe múltiplos nomes por vírgula ( , ), ponto-e-vírgula ( ; ) ou ponto ( . )',
    cancel: 'Cancelar',
    save: 'Salvar',
  },
};
