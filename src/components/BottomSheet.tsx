import React, { useRef, useState, useEffect, useCallback } from 'react';
import './BottomSheet.css';


function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}


function getClosestSnapPoint(value: number, snapPoints: number[]) {
  let closest = snapPoints[0];
  let minDist = Math.abs(value - snapPoints[0]);
  for (let i = 1; i < snapPoints.length; i++) {
    const dist = Math.abs(value - snapPoints[i]);
    if (dist < minDist) {
      minDist = dist;
      closest = snapPoints[i];
    }
  }
  return closest;
}


function smoothSpring({
  from,
  to,
  velocity,
  set,
  onRest,
  stiffness = 0.12,
  damping = 0.85,
  mass = 1,
}: {
  from: number;
  to: number;
  velocity: number;
  set: (v: number) => void;
  onRest: () => void;
  stiffness?: number;
  damping?: number;
  mass?: number;
}) {
  let current = from;
  let v = velocity;
  let frame: number;
  function animate() {
    const dt = 1;
    const force = -stiffness * (current - to);
    const acc = force / mass;
    v = damping * (v + acc * dt);
    current += v * dt;
    set(current);
    if (Math.abs(v) < 0.2 && Math.abs(to - current) < 0.5) {
      set(to);
      onRest();
      return;
    }
    frame = requestAnimationFrame(animate);
  }
  animate();
  return () => cancelAnimationFrame(frame);
}


function vibrate(ms: number) {
  if (typeof window !== 'undefined' && 'vibrate' in window.navigator) {
    window.navigator.vibrate(ms);
  }
}


interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
  onClose?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  darkMode?: boolean;
}


const DEFAULT_SNAP_POINTS = [0.1, 0.5, 0.9];


const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  snapPoints = DEFAULT_SNAP_POINTS,
  initialSnap = 0,
  onClose,
  header,
  footer,
  darkMode,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const firstFocusable = useRef<HTMLButtonElement | null>(null);
  const lastFocusable = useRef<HTMLButtonElement | null>(null);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startTop = useRef(0);
  const velocity = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(Date.now());
  const [snapIndex, setSnapIndex] = useState(initialSnap);
  const [top, setTop] = useState(window.innerHeight * (1 - snapPoints[initialSnap]));
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOpen, setIsOpen] = useState(initialSnap !== 0);


  useEffect(() => {
    if (isOpen && snapIndex !== 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, snapIndex]);


  useEffect(() => {
    const to = window.innerHeight * (1 - snapPoints[snapIndex]);
    let cancel: (() => void) | undefined;
    setIsAnimating(true);
    cancel = smoothSpring({
      from: top,
      to,
      velocity: velocity.current,
      set: setTop,
      onRest: () => {
        setIsAnimating(false);
        setIsOpen(snapIndex !== 0);
        if (snapIndex === 0 && onClose) onClose();
      },
    });
    return () => cancel && cancel();
  }, [snapIndex, snapPoints]);


  useEffect(() => {
    const handleResize = () => {
      setTop(window.innerHeight * (1 - snapPoints[snapIndex]));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [snapIndex, snapPoints]);


  const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isAnimating) return;
    dragging.current = true;
    startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startTop.current = top;
    lastY.current = startY.current;
    lastTime.current = Date.now();
    document.body.style.userSelect = 'none';
  };


  const onDragMove = (e: TouchEvent | MouseEvent) => {
    if (!dragging.current) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const delta = clientY - startY.current;
    const minTop = window.innerHeight * (1 - snapPoints[snapPoints.length - 1]);
    const maxTop = window.innerHeight * (1 - snapPoints[0]);
    let newTop = startTop.current + delta;
    if (newTop < minTop) {
      newTop = minTop - Math.sqrt(minTop - newTop) * 2;
    } else if (newTop > maxTop) {
      newTop = maxTop + Math.sqrt(newTop - maxTop) * 2;
    }
    setTop(newTop);
    const now = Date.now();
    velocity.current = (clientY - lastY.current) / (now - lastTime.current + 1);
    lastY.current = clientY;
    lastTime.current = now;
  };


  const onDragEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.userSelect = '';
    const percent = 1 - top / window.innerHeight;
    let targetSnap = getClosestSnapPoint(percent, snapPoints);
    if (Math.abs(velocity.current) > 0.7) {
      const dir = velocity.current > 0 ? 1 : -1;
      let idx = snapPoints.indexOf(targetSnap) + dir;
      idx = clamp(idx, 0, snapPoints.length - 1);
      targetSnap = snapPoints[idx];
    }
    setSnapIndex(snapPoints.indexOf(targetSnap));
    vibrate(10);
  };


  useEffect(() => {
    const move = (e: any) => onDragMove(e);
    const up = () => onDragEnd();
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [top, snapPoints]);


  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      setSnapIndex((i) => clamp(i + 1, 0, snapPoints.length - 1));
    } else if (e.key === 'ArrowDown') {
      setSnapIndex((i) => clamp(i - 1, 0, snapPoints.length - 1));
    } else if (e.key === 'Escape') {
      setSnapIndex(0);
      if (onClose) onClose();
    } else if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable.current) {
        e.preventDefault();
        lastFocusable.current?.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable.current) {
        e.preventDefault();
        firstFocusable.current?.focus();
      }
    }
  }, [snapPoints, onClose]);


  useEffect(() => {
    if (isOpen && snapIndex !== 0) {
      setTimeout(() => {
        firstFocusable.current?.focus();
      }, 100);
    }
  }, [isOpen, snapIndex]);


  const handleBackdropClick = () => {
    setSnapIndex(0);
    if (onClose) onClose();
  };


  const prefersDark = useRef(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isDark = darkMode ?? prefersDark.current;


  const openPercent = 1 - top / window.innerHeight;


  const snapIndicator = (
    <div className="bottom-sheet-snap-indicator">
      {snapPoints.map((sp, i) => (
        <div
          key={i}
          className={`bottom-sheet-snap-dot${i === snapIndex ? ' active' : ''}`}
          aria-label={`Snap point ${i + 1}`}
        />
      ))}
    </div>
  );


  return (
    <>
      {isOpen && snapIndex !== 0 && (
        <div
          className="bottom-sheet-backdrop"
          style={{ opacity: openPercent, pointerEvents: isOpen ? 'auto' : 'none' }}
          onClick={handleBackdropClick}
          aria-label="Close bottom sheet"
        />
      )}
      <div
        ref={sheetRef}
        className={`bottom-sheet${isDark ? ' bottom-sheet-dark' : ''}`}
        style={{
          top: `${top}px`,
          boxShadow: `0 -8px 32px 8px rgba(0,0,0,${0.15 + 0.25 * openPercent})`,
          backdropFilter: openPercent > 0.2 ? 'blur(2px)' : 'none',
          transition: isAnimating ? 'box-shadow 0.3s, backdrop-filter 0.3s' : undefined,
        }}
        tabIndex={0}
        aria-label="Bottom Sheet"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="bottom-sheet-handle"
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          aria-label="Drag handle"
          role="button"
          tabIndex={0}
        >
          <div className="bottom-sheet-handle-bar" />
        </div>
        {snapIndicator}
        {header && <div className="bottom-sheet-header">{header}</div>}
        <div className="bottom-sheet-buttons">
          <button ref={firstFocusable} onClick={() => setSnapIndex(0)} disabled={snapIndex === 0}>Closed</button>
          <button onClick={() => setSnapIndex(Math.floor(snapPoints.length / 2))} disabled={snapIndex === Math.floor(snapPoints.length / 2)}>Half</button>
          <button ref={lastFocusable} onClick={() => setSnapIndex(snapPoints.length - 1)} disabled={snapIndex === snapPoints.length - 1}>Open</button>
        </div>
        <div
          className="bottom-sheet-content"
          style={{
            opacity: 0.5 + 0.5 * openPercent,
            transform: `translateY(${(1 - openPercent) * 30}px)`,
            transition: isAnimating ? 'opacity 0.4s, transform 0.4s' : undefined,
          }}
        >
          {children}
        </div>
        {footer && <div className="bottom-sheet-footer">{footer}</div>}
      </div>
    </>
  );
};


export default BottomSheet; 