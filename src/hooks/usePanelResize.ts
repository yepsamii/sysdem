import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  /** Selector for the element whose width should be set inline. */
  targetSelector: string;
  /** Minimum width (px). */
  minWidth?: number;
  /** Maximum width as fraction of viewport width (e.g. 0.5 → 50vw). */
  maxFraction?: number;
  /** Local-storage key for persistence (optional). */
  storageKey?: string;
}

interface Result {
  /** Pointer-event props to spread onto the separator element. */
  separatorProps: {
    role: 'separator';
    'aria-orientation': 'vertical';
    style: React.CSSProperties;
    className: string;
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  };
  /** Current panel width (px) — `null` if not yet measured. */
  width: number | null;
}

/**
 * Vertical-resize logic for a fixed-width side panel.
 *
 * On pointerdown of the separator, captures the pointer and tracks pointermove on
 * the window. Updates the target element's inline `width` style (so the existing
 * Tailwind `w-[280px]` is overridden). Persists the width to localStorage when
 * a `storageKey` is provided.
 */
export function usePanelResize({
  targetSelector,
  minWidth = 200,
  maxFraction = 0.5,
  storageKey,
}: Options): Result {
  const startRef = useRef<{ x: number; w: number } | null>(null);
  const [width, setWidth] = useState<number | null>(null);

  // Restore persisted width on mount
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const n = Number(raw);
        if (Number.isFinite(n) && n >= minWidth && n <= window.innerWidth * maxFraction) {
          setWidth(n);
          applyWidth(targetSelector, n, maxFraction);
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const target = document.querySelector<HTMLElement>(targetSelector);
      if (!target) return;
      const currentWidth = target.getBoundingClientRect().width;
      startRef.current = { x: e.clientX, w: currentWidth };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [targetSelector]
  );

  // Move/up handlers must live on the separator to work while the pointer is captured.
  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!startRef.current) return;
      const target = document.querySelector<HTMLElement>(targetSelector);
      if (!target) return;
      const maxWidth = window.innerWidth * maxFraction;
      const nextWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startRef.current.w + (e.clientX - startRef.current.x))
      );
      applyWidth(targetSelector, nextWidth, maxFraction);
      setWidth(nextWidth);
    },
    [targetSelector, minWidth, maxFraction]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!startRef.current) return;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      startRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      // Persist final width
      const target = document.querySelector<HTMLElement>(targetSelector);
      if (target && storageKey) {
        try {
          localStorage.setItem(storageKey, String(target.getBoundingClientRect().width));
        } catch {
          /* ignore */
        }
      }
    },
    [targetSelector, storageKey]
  );

  const separatorProps = {
    role: 'separator' as const,
    'aria-orientation': 'vertical' as const,
    style: { touchAction: 'none' } as React.CSSProperties,
    className:
      'hidden lg:block absolute top-0 bottom-0 w-1.5 cursor-col-resize select-none hover:bg-accent/40 active:bg-accent/60 transition-colors right-0 z-10',
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };

  return { separatorProps, width };
}

function applyWidth(selector: string, width: number, maxFraction: number) {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;
  target.style.width = `${width}px`;
  target.style.maxWidth = `calc(${Math.round(maxFraction * 100)}% - 1.5rem)`;
}