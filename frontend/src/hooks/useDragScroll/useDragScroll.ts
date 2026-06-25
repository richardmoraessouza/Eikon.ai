import { useRef, useState } from 'react';
import type { MouseEvent } from 'react';

export const useDragScroll = () => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  
  // Adicionado o state de controle de clique vs arraste
  const [hasDragged, setHasDragged] = useState(false);

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    isDown.current = true;
    setHasDragged(false); // Reseta a flag no clique inicial
    carouselRef.current.classList.add('active');
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
  };

  const onMouseLeave = () => {
    isDown.current = false;
    if (carouselRef.current) carouselRef.current.classList.remove('active');
  };

  const onMouseUp = () => {
    isDown.current = false;
    if (carouselRef.current) carouselRef.current.classList.remove('active');
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
  if (!isDown.current || !carouselRef.current) return;
  const x = e.pageX - carouselRef.current.offsetLeft;
  const walk = (x - startX.current) * 1.5; 
    
  if (Math.abs(walk) > 3) {
    setHasDragged(true);
    e.preventDefault();
  }
    
  carouselRef.current.scrollLeft = scrollLeft.current - walk;
};

  return {
    carouselRef,
    hasDragged,
    dragProps: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
    },
  };
};