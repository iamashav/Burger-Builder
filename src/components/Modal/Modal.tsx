import { useEffect, useRef, type ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Built on native <dialog> deliberately: showModal() gives focus trapping, Escape to
 * close, inertness of the page behind and the ::backdrop layer for free, all of which
 * the previous transform-based modal had to fake and got wrong.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onClose={onClose}
      className="m-auto w-[min(32rem,90vw)] bg-ink p-0 text-bone ring-1 ring-flood/25 backdrop:bg-ink/80 open:animate-[fade-in_180ms_ease-out]"
    >
      <div className="p-6">{children}</div>
    </dialog>
  );
}
