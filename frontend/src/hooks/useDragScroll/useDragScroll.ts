import { useRef, useState, useEffect } from 'react';
import type { MouseEvent } from 'react';

interface UseDragScrollOptions {
  axis?: 'x' | 'y';
  speed?: number;
  momentum?: boolean;
  friction?: number; // 0.9 a 0.99 (deslize pós-arraste)
  maxVelocity?: number;
  lerpFactor?: number; // Amortecimento do arraste: menor = mais suave/liso, maior = mais rígido (padrão: 0.1)
}

export const useDragScroll = ({
  axis = 'x',
  speed = 1.5,
  momentum = true,
  friction = 0.965,
  maxVelocity = 90,
  lerpFactor = 0.1, // Adicionado para controlar a suavidade do arraste ativo
}: UseDragScrollOptions = {}) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isDown = useRef(false);
  const startPos = useRef(0);
  const startScroll = useRef(0);
  const hasDraggedRef = useRef(false);

  const [hasDragged, setHasDragged] = useState(false);

  // targetScroll armazena onde o mouse QUER que o scroll esteja
  const targetScroll = useRef(0);
  // currentScroll faz o meio de campo suave
  const currentScroll = useRef(0);
  const rafId = useRef<number | null>(null);

  const history = useRef<{ pos: number; time: number }[]>([]);
  const velocity = useRef(0);
  const momentumRafId = useRef<number | null>(null);

  const getClientPos = (e: { pageX: number; pageY: number }) =>
    axis === 'x' ? e.pageX : e.pageY;

  const getOffset = (el: HTMLDivElement) =>
    axis === 'x' ? el.offsetLeft : el.offsetTop;

  const getScroll = (el: HTMLDivElement) =>
    axis === 'x' ? el.scrollLeft : el.scrollTop;

  const getMaxScroll = (el: HTMLDivElement) =>
    axis === 'x' ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;

  const setScroll = (el: HTMLDivElement, value: number) => {
    const max = getMaxScroll(el);
    const clamped = Math.max(0, Math.min(value, max));
    if (axis === 'x') el.scrollLeft = clamped;
    else el.scrollTop = clamped;
    return clamped;
  };

  const resetHasDragged = () => {
    hasDraggedRef.current = false;
    setHasDragged(false);
  };

  const stopMomentum = () => {
    if (momentumRafId.current !== null) {
      cancelAnimationFrame(momentumRafId.current);
      momentumRafId.current = null;
    }
  };

  const runMomentum = () => {
    const el = carouselRef.current;
    if (!el || Math.abs(velocity.current) < 0.3) {
      momentumRafId.current = null;
      return;
    }

    velocity.current *= friction;
    const current = getScroll(el);
    const applied = setScroll(el, current - velocity.current);

    if (applied === 0 || applied === getMaxScroll(el)) {
      momentumRafId.current = null;
      return;
    }

    momentumRafId.current = requestAnimationFrame(runMomentum);
  };

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    stopMomentum();
    isDown.current = true;
    resetHasDragged();
    
    startPos.current = getClientPos(e) - getOffset(carouselRef.current);
    startScroll.current = getScroll(carouselRef.current);
    targetScroll.current = startScroll.current;
    currentScroll.current = startScroll.current;

    history.current = [{ pos: getClientPos(e), time: performance.now() }];
    velocity.current = 0;
  };

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      resetHasDragged();
    }
  };

  useEffect(() => {
    // Loop de animação contínuo que suaviza o arraste ativo
    const applyScroll = () => {
      const el = carouselRef.current;
      if (el && isDown.current) {
        // LERP: caminha uma porcentagem (lerpFactor) em direção ao alvo a cada frame
        currentScroll.current += (targetScroll.current - currentScroll.current) * lerpFactor;
        setScroll(el, currentScroll.current);
      }
      rafId.current = requestAnimationFrame(applyScroll);
    };
    rafId.current = requestAnimationFrame(applyScroll);

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

      // Atualiza apenas o alvo. O loop 'applyScroll' cuida de deslizar suavemente até ele
      targetScroll.current = startScroll.current - walk;

      const now = performance.now();
      history.current.push({ pos: getClientPos(e), time: now });
      history.current = history.current.filter((h) => now - h.time < 100);
    };

    const onMouseUp = () => {
      if (isDown.current && momentum && hasDraggedRef.current) {
        const now = performance.now();
        const recent = history.current.filter((h) => now - h.time < 100);
        const first = recent[0];
        const last = recent[recent.length - 1];

        if (first && last && last.time !== first.time) {
          const dt = last.time - first.time;
          const dPos = last.pos - first.pos;
          let v = ((dPos * speed) / dt) * 16.67;
          v = Math.max(-maxVelocity, Math.min(maxVelocity, v));
          velocity.current = v;
        }

        stopMomentum();
        momentumRafId.current = requestAnimationFrame(runMomentum);
      }
      isDown.current = false;
      history.current = [];
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      stopMomentum();
    };
  }, [axis, speed, momentum, friction, maxVelocity, lerpFactor]);

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