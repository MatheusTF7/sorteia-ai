// Portuguese (Brazil) translations
export default {
  // Genérico
  failed: 'Ação falhou',
  success: 'A ação foi bem sucedida',

  // Layout / navegação
  layout: {
    brandTag: 'Estúdio de sorteios',
    brandSubtitle: 'Fluxos mais claros, organizados e 100% locais no navegador.',
    activeWorkspace: 'Área ativa',
    settingsHint: 'Ajuste tema e idioma da interface',
    navTitle: 'Navegação',
    navTipTitle: 'Dica de produtividade',
    navTipDescription:
      'Defina uma lista padrão para abrir os próximos sorteios com participantes preenchidos.',
    privacyBadge: '100% local',
    flowsBadge: 'Fluxos prontos',
    languageReloadHint: 'Se algum texto continuar no idioma anterior, recarregue a página.',
  },
  nav: {
    home: 'Início',
    names: 'Nomes',
    numbers: 'Números',
    teams: 'Times',
    prizes: 'Prêmios',
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
    eyebrow: 'Nova experiência',
    openFlow: 'Abrir fluxo',
    stats: {
      flows: 'Fluxos',
      private: 'Privacidade',
      reusable: 'Listas',
    },
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
    configTitle: 'Configuração',
    configDescription: 'Defina o tamanho dos times e escolha se haverá iniciante.',
    resultDescription: 'Os times aparecem organizados em blocos mais claros e fáceis de ler.',
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
    estimatedTeams: 'Times estimados',
    starterReady: 'Iniciante pronto',
    teamLabel: 'Time',
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
    listDescription: 'Adicione os participantes e mantenha a lista pronta para reutilizar depois.',
    addName: 'Adicionar nome',
    noNames: 'Nenhum nome adicionado',
    preconfig: 'Pre config',
    configTitle: 'Configuração',
    configDescription: 'Escolha quantos nomes devem sair no sorteio antes de executar.',
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
    resultDescription: 'Os nomes sorteados aparecem em destaque para leitura imediata.',
  },

  // Página de números
  numbers: {
    pageTitle: 'Sorteio de Números',
    pageSubtitle: 'Defina o intervalo e quantos números deseja sortear',
    configTitle: 'Configuração',
    configDescription: 'Controle intervalo, quantidade e regras para o sorteio numérico.',
    minLabel: 'Número mínimo',
    maxLabel: 'Número máximo',
    config: {
      quantity: 'Quantidade a sortear',
    },
    allowRepeats: 'Permitir números repetidos',
    sortResult: 'Ordenar resultado',
    rangeSize: 'Amplitude do intervalo',
    modeLabel: 'Modo atual',
    uniqueMode: 'Sem repetição',
    repeatMode: 'Com repetição',
    actions: {
      draw: 'Sortear',
    },
    result: {
      title: 'Resultado',
      none: 'Nenhum sorteio realizado ainda',
    },
    resultDescription: 'Visualização limpa com destaque para os números sorteados.',
  },

  // Página de prêmios
  prizes: {
    pageTitle: 'Sorteio de Prêmios',
    pageSubtitle: 'Configure prêmios, participantes e regras do sorteio',
    prizesTitle: 'Prêmios',
    prizesDescription: 'Cadastre os itens que serão distribuídos no sorteio.',
    addPrize: 'Adicionar prêmio',
    noPrizes: 'Nenhum prêmio adicionado',

    participantsTitle: 'Participantes',
    participantsDescription: 'Use nomes ou uma faixa numérica para montar o grupo participante.',
    useNumberRange: 'Usar números em vez de nomes',
    addParticipant: 'Adicionar participante',
    noParticipants: 'Nenhum participante adicionado',
    rangeMin: 'Min',
    rangeMax: 'Max',
    manualMode: 'Lista manual',
    numberMode: 'Faixa numérica',

    configTitle: 'Configuração',
    configDescription: 'Ajuste a regra do sorteio e execute quando tudo estiver pronto.',
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
    resultDescription: 'Cada rodada mostra com clareza quem recebeu qual prêmio.',
  },

  error: {
    title: 'Página não encontrada',
    description:
      'O caminho que você tentou acessar não existe mais ou ainda não foi criado nesta aplicação.',
    backHome: 'Voltar para o início',
  },

  settings: {
    title: 'Configurações',
  },

  // Página de listas salvas
  savedLists: {
    pageTitle: 'Minhas Listas',
    pageSubtitle: 'Gerencie suas listas de nomes salvas',
    manageDescription: 'Crie, edite e reutilize listas com uma organização mais clara.',
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
    totalItems: 'Itens salvos',
    defaultStatus: 'Lista padrão definida',
    noDefaultStatus: 'Sem lista padrão',
    createdAt: 'Criada em {date}',
  },

  // Compartilhado entre páginas de sorteio
  shared: {
    loadList: 'Carregar Lista',
    saveList: 'Salvar Lista',
    loadListDescription: 'Escolha uma lista salva para preencher este fluxo imediatamente.',
    saveListDescription: 'Salve o conteúdo atual para reutilizar em outro momento.',
    noSavedLists: 'Nenhuma lista salva. Crie uma em "Minhas Listas".',
    listLoaded: 'Lista "{name}" carregada!',
    listSaved: 'Lista "{name}" salva!',
    listNameLabel: 'Nome da lista',
    addNamesHint: 'Separe múltiplos nomes por vírgula ( , ), ponto-e-vírgula ( ; ) ou ponto ( . )',
    addAction: 'Adicionar',
    readyToUse: 'Pronto para usar',
    participantsCount: '{count} participante | {count} participantes',
    itemsCount: '{count} item | {count} itens',
    drawLabel: 'Sorteio',
    cancel: 'Cancelar',
    save: 'Salvar',
  },
};
