"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function MobileDrawer({ isOpen, onClose, title, children }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";

    const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const focusFirst = () => drawerRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    const frame = window.requestAnimationFrame(focusFirst);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" data-mobile-drawer>
      <button
        type="button"
        aria-label="Fechar menu"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-taupe-950/55 backdrop-blur-[2px]"
      />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 left-0 flex h-[100dvh] w-[min(86vw,360px)] flex-col overflow-y-auto border-r border-taupe-200 bg-white shadow-2xl dark:border-taupe-800 dark:bg-taupe-900"
      >
        <div className="flex min-h-16 items-center justify-between border-b border-taupe-100 px-5 dark:border-taupe-800">
          <h2 className="text-base font-bold text-taupe-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-taupe-600 transition-colors hover:bg-taupe-100 hover:text-taupe-950 dark:text-taupe-300 dark:hover:bg-taupe-800 dark:hover:text-white"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-1 flex-col p-4">{children}</div>
      </aside>
    </div>
  );
}
