import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function IosSheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const sheetRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ pointerId: number; startY: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => sheetRef.current?.focus({ preventScroll: true }));
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [onClose, open]);

  function startDrag(event: ReactPointerEvent<HTMLSpanElement>) {
    dragRef.current = { pointerId: event.pointerId, startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent<HTMLSpanElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !sheetRef.current) return;
    sheetRef.current.style.transform = `translate3d(0,${Math.max(0, event.clientY - drag.startY)}px,0)`;
  }

  function endDrag(event: ReactPointerEvent<HTMLSpanElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !sheetRef.current) return;
    const distance = Math.max(0, event.clientY - drag.startY);
    dragRef.current = null;
    sheetRef.current.style.removeProperty("transform");
    if (distance > 100) onClose();
  }

  if (!open) return null;
  return createPortal(<div className="sheet-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={sheetRef} className="ios-sheet" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
      <span className="sheet-grabber-zone" aria-hidden="true" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><span className="sheet-grabber" /></span>
      {children}
    </section>
  </div>, document.body);
}
