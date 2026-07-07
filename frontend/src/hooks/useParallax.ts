import { useEffect, useRef } from 'react';

// Tilts the element under `ref` based on cursor position relative to the
// viewport center. Mutates the DOM node's style directly (not React state) so
// mousemove doesn't trigger a re-render on every pixel of movement.
export function useParallax<T extends HTMLElement>(divisor = 50) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const node = ref.current;
      if (!node) return;
      const xAxis = (window.innerWidth / 2 - event.pageX) / divisor;
      const yAxis = (window.innerHeight / 2 - event.pageY) / divisor;
      node.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    }
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [divisor]);

  return ref;
}
