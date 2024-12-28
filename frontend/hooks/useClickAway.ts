import { useState, useEffect, useRef } from 'react';

export const useClickAway = (
  ref: React.RefObject<HTMLElement>, 
  onClickAway: (e: MouseEvent | TouchEvent) => void, 
  delay = 100
) => {
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (listening) {
      const handleClick = (event: MouseEvent | TouchEvent) => {
        // Ignore clicks on MenuItems and the Select's popup
        const target = event.target as HTMLElement;
        if (target.closest('.MuiMenu-paper')) {
          return;
        }

        if (ref.current && !ref.current.contains(event.target as Node)) {
          onClickAway(event);
          setListening(false);
        }
      };

      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick);
      }, delay);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClick);
        document.removeEventListener('touchstart', handleClick);
      };
    }
  }, [ref, onClickAway, listening, delay]);

  return (shouldListen: boolean) => setListening(shouldListen);
}; 