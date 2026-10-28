import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export function Modal({ title, label, close, children, wide = false }: { title: string; label?: string; close: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close); closeRef.current = close;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const root = ref.current;
    const selectors = 'button:not(:disabled),[href],input,select,textarea,[tabindex="0"]';
    const getItems = () => Array.from(root?.querySelectorAll<HTMLElement>(selectors) ?? []).filter(el => el.getClientRects().length > 0);
    const items = getItems(); (items[1] ?? items[0] ?? root)?.focus();
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab') {
        const current = getItems(), first = current[0], last = current[current.length - 1];
        if (!root?.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handle);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handle); previous?.focus(); };
  }, []);
  return <div className="modal-scrim" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
    <div ref={ref} className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1}>
      <header className="modal-header"><div><span className="eyebrow">{label || 'CASE #001 / 기록 열람'}</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" aria-label="창 닫기" onClick={close}><X size={22} /></button></header>
      {children}
    </div>
  </div>;
}
