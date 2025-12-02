import { useEffect, useCallback } from "react";

type ShortcutHandler = () => void;

type Shortcuts = {
  onSave?: ShortcutHandler;
  onNew?: ShortcutHandler;
};

/**
 * Hook for handling keyboard shortcuts
 * - Ctrl/Cmd + S: Save
 * - Ctrl/Cmd + N: New strategy
 */
export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (modifier && event.key === "s") {
        event.preventDefault();
        shortcuts.onSave?.();
      }

      if (modifier && event.key === "n") {
        event.preventDefault();
        shortcuts.onNew?.();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

