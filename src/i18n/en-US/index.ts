// This is just an example,
// so you can safely delete all default props below
export default {
  // Generic
  failed: 'Action failed',
  success: 'Action was successful',

  // Main layout / navigation
  layout: {
    brandTag: 'Draw studio',
    brandSubtitle: 'Cleaner, faster and fully local draw flows in your browser.',
    activeWorkspace: 'Active area',
    settingsHint: 'Adjust theme and language',
    navTitle: 'Navigation',
    navTipTitle: 'Productivity tip',
    navTipDescription:
      'Set a default list to start the next draws with participants already filled in.',
    privacyBadge: '100% local',
    flowsBadge: 'Ready flows',
    languageReloadHint: 'If any text stays in the previous language, refresh the page.',
  },
  nav: {
    home: 'Home',
    names: 'Names',
    numbers: 'Numbers',
    teams: 'Teams',
    prizes: 'Prizes',
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
    eyebrow: 'New experience',
    openFlow: 'Open flow',
    stats: {
      flows: 'Flows',
      private: 'Privacy',
      reusable: 'Lists',
    },
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
  },

  // Draw teams page
  teams: {
    pageTitle: 'Team Draw',
    pageSubtitle: 'Add participants and generate random teams',
    participants: 'Participants',
    addParticipant: 'Add participant',
    noParticipants: 'No participants added',
    preconfig: 'Pre config',
    configTitle: 'Configuration',
    configDescription: 'Set team size and decide whether to choose a starter automatically.',
    resultDescription: 'Teams are displayed in clearer blocks for fast scanning.',
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
    estimatedTeams: 'Estimated teams',
    starterReady: 'Starter ready',
    teamLabel: 'Team',
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
    listDescription: 'Add participants and keep the list ready for reuse later.',
    addName: 'Add name',
    noNames: 'No names added',
    preconfig: 'Pre config',
    configTitle: 'Configuration',
    configDescription: 'Choose how many names should be drawn before running the draw.',
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
    resultDescription: 'Chosen names appear in a highlighted, easy-to-read format.',
  },

  // Draw numbers page
  numbers: {
    pageTitle: 'Number Draw',
    pageSubtitle: 'Define the range and how many numbers to draw',
    configTitle: 'Configuration',
    configDescription: 'Control the range, quantity and rules for the numeric draw.',
    minLabel: 'Minimum number',
    maxLabel: 'Maximum number',
    config: {
      quantity: 'Quantity to draw',
    },
    allowRepeats: 'Allow repeated numbers',
    sortResult: 'Sort result',
    rangeSize: 'Range size',
    modeLabel: 'Current mode',
    uniqueMode: 'No repeats',
    repeatMode: 'With repeats',
    actions: {
      draw: 'Draw',
    },
    result: {
      title: 'Result',
      none: 'No draw performed yet',
    },
    resultDescription: 'Clean visualization with strong emphasis on the chosen numbers.',
  },

  // Draw prizes page
  prizes: {
    pageTitle: 'Prize Draw',
    pageSubtitle: 'Configure prizes, participants and draw rules',
    prizesTitle: 'Prizes',
    prizesDescription: 'Register the items that will be distributed in the draw.',
    addPrize: 'Add prize',
    noPrizes: 'No prizes added',

    participantsTitle: 'Participants',
    participantsDescription: 'Use names or a numeric range to define the participant pool.',
    useNumberRange: 'Use numbers instead of names',
    addParticipant: 'Add participant',
    noParticipants: 'No participants added',
    rangeMin: 'Min',
    rangeMax: 'Max',
    manualMode: 'Manual list',
    numberMode: 'Number range',

    configTitle: 'Configuration',
    configDescription: 'Adjust the draw rule and run it when everything is ready.',
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
    resultDescription: 'Each round clearly shows who received which prize.',
  },

  settings: {
    title: 'Settings',
  },

  // Saved lists page
  savedLists: {
    pageTitle: 'My Lists',
    pageSubtitle: 'Manage your saved name lists',
    manageDescription: 'Create, edit and reuse lists with a clearer organization.',
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
    totalItems: 'Saved items',
    defaultStatus: 'Default list ready',
    noDefaultStatus: 'No default list',
    createdAt: 'Created on {date}',
  },

  error: {
    title: 'Page not found',
    description: 'The route you tried to access no longer exists or has not been created yet.',
    backHome: 'Back to home',
  },

  // Shared across draw pages
  shared: {
    loadList: 'Load List',
    saveList: 'Save List',
    loadListDescription: 'Pick a saved list to instantly fill this flow.',
    saveListDescription: 'Save the current content to reuse it later.',
    noSavedLists: 'No saved lists. Create one in "My Lists".',
    listLoaded: 'List "{name}" loaded!',
    listSaved: 'List "{name}" saved!',
    listNameLabel: 'List name',
    addNamesHint: 'Separate multiple names with comma ( , ), semicolon ( ; ) or period ( . )',
    addAction: 'Add',
    readyToUse: 'Ready to use',
    participantsCount: '{count} participant | {count} participants',
    itemsCount: '{count} item | {count} items',
    drawLabel: 'Draw',
    cancel: 'Cancel',
    save: 'Save',
  },
};
