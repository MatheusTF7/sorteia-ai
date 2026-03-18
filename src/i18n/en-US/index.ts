// This is just an example,
// so you can safely delete all default props below
export default {
  // Generic
  failed: 'Action failed',
  success: 'Action was successful',

  // Main layout / navigation
  nav: {
    home: 'Home',
    names: 'Names',
    numbers: 'Numbers',
    teams: 'Teams',
    prizes: 'Prizes',
    bingo: 'Bingo',
    about: 'About',
    savedLists: 'Saved Lists',
  },
  pwa: {
    pageTitle: 'Install this app',
    subtitle:
      'This app can be installed on your device for quicker access and offline usage. Follow the steps below depending on your platform.',
    installPromptTitle: 'Install prompt',
    installPromptDesc:
      'On supported browsers you may see an "Install" prompt — you can use it to add this app to your device.',
    android: {
      title: 'Android (Chrome / Edge)',
      step1: 'Open the browser menu (three dots) while on this page.',
      step2: 'Tap "Install app" or "Add to Home screen".',
      step3: 'Confirm to add the app to your home screen.',
    },
    ios: {
      title: 'iOS (Safari)',
      step1: 'Open Safari and navigate to this page.',
      step2: 'Tap the Share button (square with arrow).',
      step3: 'Select "Add to Home Screen" and confirm.',
    },
    desktop: {
      title: 'Desktop (Chrome / Edge)',
      step1: 'Look for an install icon in the address bar or the browser menu.',
      step2: 'Choose "Install" to add the app to your system.',
    },
    notes: {
      title: 'Notes',
      offline: 'After installation the app can work offline for previously visited pages.',
      permissions:
        'Some features may request permissions (notifications, camera) — grant only if you trust the site.',
    },
  },

  // Draw list page
  drawList: {
    title: 'Draw Types',
    subtitle: 'Choose the type of draw you want to perform',
    nameDraw: {
      title: 'Name Draw',
      desc: 'Good for raffles, classrooms or events',
    },
    numberDraw: {
      title: 'Number Draw',
      desc: 'Perfect for lotteries and numeric draws',
    },
    teamDraw: {
      title: 'Team Draw',
      desc: 'Create teams randomly',
    },
    prizeDraw: {
      title: 'Prize Draw',
      desc: 'Distribute prizes automatically',
    },
    bingoDraw: {
      title: 'Bingo',
      desc: 'Play a full bingo game with cards and drawing',
    },
  },

  // Draw teams page
  teams: {
    pageTitle: 'Team Draw',
    pageSubtitle: 'Add participants and generate random teams',
    participants: 'Participants',
    addParticipant: 'Add participant',
    noParticipants: 'No participants added',
    preconfig: 'Pre config',
    config: {
      teamCount: 'Number of teams',
      teamSize: 'Team size',
      defineStarter: 'Define starter',
    },
    actions: {
      generateTeams: 'Generate Teams',
      pickStarter: 'Pick Starter',
    },
    result: {
      title: 'Result',
      none: 'No teams generated yet',
    },
    starterLabel: 'Starter',
  },

  // Theme
  theme: {
    dark: 'Dark Mode',
    light: 'Light Mode',
    language: 'Language',
  },

  // Draw names page
  names: {
    pageTitle: 'Name Draw',
    pageSubtitle: 'Insert names and define how many will be drawn',
    listTitle: 'Name list',
    addName: 'Add name',
    noNames: 'No names added',
    preconfig: 'Pre config',
    configTitle: 'Configuration',
    config: {
      quantity: 'Quantity to draw',
    },
    actions: {
      draw: 'Draw',
    },
    result: {
      title: 'Result',
      none: 'No draw performed yet',
    },
  },

  // Draw numbers page
  numbers: {
    pageTitle: 'Number Draw',
    pageSubtitle: 'Define the range and how many numbers to draw',
    configTitle: 'Configuration',
    minLabel: 'Minimum number',
    maxLabel: 'Maximum number',
    config: {
      quantity: 'Quantity to draw',
    },
    allowRepeats: 'Allow repeated numbers',
    sortResult: 'Sort result',
    actions: {
      draw: 'Draw',
    },
    result: {
      title: 'Result',
      none: 'No draw performed yet',
    },
  },

  // Draw prizes page
  prizes: {
    pageTitle: 'Prize Draw',
    pageSubtitle: 'Configure prizes, participants and draw rules',
    prizesTitle: 'Prizes',
    addPrize: 'Add prize',
    noPrizes: 'No prizes added',

    participantsTitle: 'Participants',
    useNumberRange: 'Use numbers instead of names',
    addParticipant: 'Add participant',
    noParticipants: 'No participants added',
    rangeMin: 'Min',
    rangeMax: 'Max',

    configTitle: 'Configuration',
    drawCount: 'Number of draws',
    prizesPerDraw: 'Prizes per draw',
    singleWinnerPerDraw: 'Single winner per draw (wins all prizes)',
    actions: {
      runDraw: 'Run Draw',
    },

    result: {
      title: 'Result',
      none: 'No draw performed yet',
    },
  },

  // Bingo page
  bingo: {
    pageTitle: 'Bingo',
    pageSubtitle: 'Play bingo with friends! Draw numbers, mark your card and shout BINGO!',
    startGame: 'Start Game',
    roles: {
      drawer: 'Drawer',
      drawerDesc: 'Draws numbers and controls the game',
      player: 'Player',
      playerDesc: 'Gets a card and marks the drawn numbers',
      both: 'Drawer & Player',
      bothDesc: 'Draws numbers and plays with your own card',
    },
    drawerPanel: 'Drawer Panel',
    toggleTts: 'Toggle voice announcement',
    toggleSuspense: 'Toggle suspense animation',
    drawNumber: 'Draw Number',
    newGame: 'New Game',
    progress: 'Progress',
    calledNumbers: 'Called Numbers',
    yourCard: 'Your Card',
    newCard: 'New Card',
    markAllToShout: 'Complete a row, column or diagonal to shout BINGO!',
    congratulations: 'Congratulations! You completed Bingo!',
    verifyWithDrawer: 'Show your card to the drawer for verification.',
    confirmReset: 'Reset game',
    confirmResetDesc: 'All drawn numbers and marks will be lost. Continue?',
    confirmChangeRoleDesc: 'The current game will be lost. Change role?',
    reset: 'Reset',
    changeRole: 'Change role',
    validateCard: 'Validate Card',
    validateCardDesc: "Enter the 24 numbers on the participant's card to verify all were called.",
    validateModeType: 'Type',
    validateModeSelect: 'Select',
    validateInputLabel: 'Card numbers',
    validateInputHint: 'Separate with comma ( , ), period ( . ) or semicolon ( ; )',
    validateCountLabel: 'Numbers entered',
    validateAction: 'Validate',
    validateResultValid: 'Valid card!',
    validateResultInvalid: 'Invalid card!',
    validateCalledLabel: 'Called numbers ✓',
    validateNotCalledLabel: 'NOT called numbers ✗',
  },

  settings: {
    title: 'Settings',
  },

  // Saved lists page
  savedLists: {
    pageTitle: 'My Lists',
    pageSubtitle: 'Manage your saved name lists',
    noLists: 'No saved lists yet',
    firstList: 'Create my first list',
    createList: 'New List',
    editList: 'Edit List',
    deleteList: 'Delete List',
    listName: 'List name',
    addItemsLabel: 'Add names',
    addItemsHint: 'Separate multiple names with comma ( , ), semicolon ( ; ) or period ( . )',
    itemsLabel: 'Names',
    noItems: 'No names added',
    confirmDelete: 'Delete the list "{name}"? This cannot be undone.',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Delete',
    itemCount: '{count} name | {count} names',
    isDefault: 'Default',
    setDefault: 'Set as default',
    unsetDefault: 'Remove as default',
  },

  // Shared across draw pages
  shared: {
    loadList: 'Load List',
    saveList: 'Save List',
    noSavedLists: 'No saved lists. Create one in "My Lists".',
    listLoaded: 'List "{name}" loaded!',
    listSaved: 'List "{name}" saved!',
    listNameLabel: 'List name',
    addNamesHint: 'Separate multiple names with comma ( , ), semicolon ( ; ) or period ( . )',
    cancel: 'Cancel',
    save: 'Save',
  },
};
