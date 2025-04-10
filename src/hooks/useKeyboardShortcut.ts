
import { useEffect, useCallback } from 'react';

type KeyboardShortcutOptions = {
  /**
   * Should the shortcut trigger even when focus is on form elements (input, textarea, etc.)
   * @default false
   */
  triggerOnFormElements?: boolean;
  /**
   * Should preventDefault be called on the event
   * @default true
   */
  preventDefault?: boolean;
  /**
   * Modifier keys required to be pressed
   */
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  };
};

/**
 * Hook to add keyboard shortcuts to a component
 * 
 * @param key The key to listen for (e.g., 'Enter', 'Escape')
 * @param callback Function to call when the key is pressed
 * @param options Configuration options
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: KeyboardShortcutOptions = {}
) {
  const {
    triggerOnFormElements = false,
    preventDefault = true,
    modifiers = {}
  } = options;
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if the pressed key matches our target key
    if (event.key !== key) return;
    
    // Check if required modifier keys are pressed
    if (modifiers.ctrl && !event.ctrlKey) return;
    if (modifiers.alt && !event.altKey) return; 
    if (modifiers.shift && !event.shiftKey) return;
    if (modifiers.meta && !event.metaKey) return;
    
    // If we don't want to trigger on form elements, check the active element
    if (!triggerOnFormElements) {
      const activeElement = document.activeElement;
      const isInputActive = activeElement instanceof HTMLInputElement || 
                           activeElement instanceof HTMLTextAreaElement ||
                           activeElement instanceof HTMLSelectElement ||
                           activeElement instanceof HTMLButtonElement;
      
      if (isInputActive) return;
    }
    
    if (preventDefault) {
      event.preventDefault();
    }
    
    callback();
  }, [key, callback, triggerOnFormElements, preventDefault, modifiers]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}