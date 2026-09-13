import { useEffect } from 'react';

const TEXT_INPUT_TYPES = new Set(['text', 'email', 'password', 'search', 'tel', 'url', 'number']);

// Text fields keep their own native undo; stealing Ctrl+Z there would undo the drink
// instead of the typing.
function isTextEntry(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target instanceof HTMLTextAreaElement) return true;
  return target instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(target.type);
}

export function useUndoShortcuts(onUndo: () => void, onRedo: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || isTextEntry(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        onUndo();
      } else if ((key === 'z' && event.shiftKey) || key === 'y') {
        event.preventDefault();
        onRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo]);
}
