import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { Ref } from 'vue';

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: OrientationType) => Promise<void>;
};

/** Only release fullscreen/orientation resources acquired by this viewer. */
export function usePlaymatOrientation(viewer: Ref<HTMLElement | null>) {
  const locked = ref(false);
  const pending = ref(false);
  const message = ref('');
  let revision = 0;
  let ownsLock = false;
  let fullscreenElement: HTMLElement | null = null;

  function unlock() {
    if (ownsLock) screen.orientation?.unlock();
    ownsLock = false;
    locked.value = false;
  }

  function onFullscreenChange() {
    if (fullscreenElement && document.fullscreenElement !== fullscreenElement) {
      revision++;
      unlock();
      fullscreenElement = null;
      pending.value = false;
      message.value = '';
    }
  }

  async function release() {
    revision++;
    unlock();
    pending.value = false;
    message.value = '';
    const acquired = fullscreenElement;
    fullscreenElement = null;
    if (acquired && document.fullscreenElement === acquired) {
      try {
        await document.exitFullscreen();
      } catch {
        /* Already left fullscreen. */
      }
    }
  }

  async function toggleLock() {
    if (pending.value) return;
    if (locked.value) {
      await release();
      return;
    }
    const element = viewer.value;
    if (!element) return;
    const version = ++revision;
    pending.value = true;
    message.value = '';
    const orientation = screen.orientation as LockableOrientation | undefined;
    try {
      // Mobile browsers generally require fullscreen before allowing lock().
      if (document.fullscreenElement !== element && element.requestFullscreen) {
        await element.requestFullscreen();
        if (version !== revision) {
          if (document.fullscreenElement === element) await document.exitFullscreen();
          return;
        }
        fullscreenElement = element;
      }
      if (!orientation?.lock) {
        message.value = 'heatInteractive.lockUnavailable';
        return;
      }
      const target = orientation.type;
      await orientation.lock(target);
      if (version !== revision) {
        orientation.unlock();
        return;
      }
      ownsLock = true;
      locked.value = true;
      message.value = 'heatInteractive.lockedHint';
    } catch {
      if (version === revision) message.value = 'heatInteractive.lockUnavailable';
    } finally {
      if (version === revision) pending.value = false;
    }
  }

  onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange));
  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    void release();
  });
  return { locked, pending, message, toggleLock, release };
}
