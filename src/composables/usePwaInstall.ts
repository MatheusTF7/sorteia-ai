import { computed, ref, shallowRef } from 'vue';

type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const deferredPrompt = shallowRef<BeforeInstallPromptEvent | null>(null);
const isPrompting = ref(false);
const isInstalled = ref(false);
let initialized = false;

function detectInstalled(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const standaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standaloneDisplay || iosStandalone;
}

function initialize() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  isInstalled.value = detectInstalled();

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt.value = event as BeforeInstallPromptEvent;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null;
    isInstalled.value = true;
  });

  window.matchMedia('(display-mode: standalone)').addEventListener('change', () => {
    isInstalled.value = detectInstalled();
  });
}

export function usePwaInstall() {
  initialize();

  const canInstall = computed(
    () => deferredPrompt.value !== null && !isInstalled.value && !isPrompting.value,
  );

  async function promptInstall(): Promise<InstallOutcome> {
    const prompt = deferredPrompt.value;
    if (!prompt || isInstalled.value || isPrompting.value) return 'unavailable';

    isPrompting.value = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      deferredPrompt.value = null;
      return choice.outcome;
    } catch (error) {
      console.warn('[usePwaInstall] Failed to open the installation prompt', error);
      return 'unavailable';
    } finally {
      isPrompting.value = false;
    }
  }

  return {
    canInstall,
    isInstalled,
    isPrompting,
    promptInstall,
  };
}
