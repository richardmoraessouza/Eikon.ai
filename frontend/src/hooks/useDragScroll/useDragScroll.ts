import { useRef, useState, useEffect } from 'react';
import type { MouseEvent } from 'react';

interface UseDragScrollOptions {
  axis?: 'x' | 'y';
  speed?: number;
}

export const useDragScroll = ({ axis = 'x', speed = 1.5 }: UseDragScrollOptions = {}) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isDown = useRef(false);
  const startPos = useRef(0);
  const startScroll = useRef(0);
  const hasDraggedRef = useRef(false);

  // Controle de clique vs arraste
  const [hasDragged, setHasDragged] = useState(false);

  const getClientPos = (e: { pageX: number; pageY: number }) =>
    axis === 'x' ? e.pageX : e.pageY;

  const getOffset = (el: HTMLDivElement) =>
    axis === 'x' ? el.offsetLeft : el.offsetTop;

  const getScroll = (el: HTMLDivElement) =>
    axis === 'x' ? el.scrollLeft : el.scrollTop;

  const setScroll = (el: HTMLDivElement, value: number) => {
    if (axis === 'x') el.scrollLeft = value;
    else el.scrollTop = value;
  };

  const resetHasDragged = () => {
    hasDraggedRef.current = false;
    setHasDragged(false);
  };

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    isDown.current = true;
    resetHasDragged();
    startPos.current = getClientPos(e) - getOffset(carouselRef.current);
    startScroll.current = getScroll(carouselRef.current);
  };

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      resetHasDragged();
    }
  };
  
  useEffect(() => {
    const onMouseMove = (e: globalThis.MouseEvent) => {
      const el = carouselRef.current;
      if (!isDown.current || !el) return;

      const pos = getClientPos(e) - getOffset(el);
      const walk = (pos - startPos.current) * speed;

      if (Math.abs(walk) > 3) {
        hasDraggedRef.current = true;
        setHasDragged(true);
        e.preventDefault();
      }

      setScroll(el, startScroll.current - walk);
    };

    const onMouseUp = () => {
      isDown.current = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axis, speed]);

  return {
    carouselRef,
    hasDragged,
    resetHasDragged,
    dragProps: {
      onMouseDown,
      onClick,
    },
  };
};