import { useState } from "react";

/**
 * usePersistedState - Custom hook for state that persists in localStorage
 * 
 * Automatically syncs state with localStorage, similar to useState but with persistence.
 * 
 * @param {any} initialState - Initial state value
 * @param {string} key - localStorage key to store the state
 * @returns {array} [state, setState] - Similar to useState
 */
export function usePersistedState(initialState, key) {
  const [state, setState] = useState(() => {
    try {
      const storageData = localStorage.getItem(key);

      if (!storageData) {
        return initialState;
      }

                const data = JSON.parse(storageData);
                return data;
            } catch {
                // If parsing fails, return initial state
                return initialState;
            }
  });

  const setPersistedState = (input) => {
    let value = input;
    
    if (typeof input === 'function') {
      value = input(state);
    }

            try {
                localStorage.setItem(key, JSON.stringify(value));
                setState(value);
            } catch {
                // If localStorage fails, still update state
                setState(value);
            }
  };

  return [state, setPersistedState];
}

