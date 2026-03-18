import { defineBoot } from '#q-app/wrappers';

const RESIZE_OBSERVER_MESSAGES = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded',
];

function extractMessage(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Error) {
    return value.message;
  }

  if (typeof value === 'object' && value !== null && 'message' in value) {
    const nestedMessage = (value as { message?: unknown }).message;

    if (typeof nestedMessage === 'string') {
      return nestedMessage;
    }

    if (nestedMessage instanceof Error) {
      return nestedMessage.message;
    }
  }

  return '';
}

function isResizeObserverNoise(value: unknown): boolean {
  const message = extractMessage(value);
  return RESIZE_OBSERVER_MESSAGES.some((entry) => message.includes(entry));
}

export default defineBoot(() => {
  if (typeof window === 'undefined') {
    return;
  }

  window.addEventListener(
    'error',
    (event) => {
      if (!isResizeObserverNoise(event.message) && !isResizeObserverNoise(event.error)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
    },
    { capture: true },
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      if (!isResizeObserverNoise(event.reason)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
    },
    { capture: true },
  );
});
