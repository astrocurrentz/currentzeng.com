"use client";

import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type RefObject,
} from "react";
import styles from "./modal.module.css";

type ModalProps = Omit<ComponentPropsWithoutRef<"dialog">, "onClose"> & {
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

/** Native top-layer dialogs make the rest of the document inert, including
 * navigation outside the current panel. Nested dialogs retain that behaviour. */
export function Modal({
  children,
  className = "",
  onClose,
  returnFocusRef,
  ...props
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = returnFocusRef?.current ?? document.activeElement;
    dialog.showModal();
    const initial =
      dialog.querySelector<HTMLElement>("[data-modal-close]") ??
      dialog.querySelector<HTMLElement>(
        "button, a[href], input, select, [tabindex='0']",
      );
    initial?.focus({ preventScroll: true });
    return () => {
      dialog.close();
      // The caller's inert background is removed in the same React commit.
      requestAnimationFrame(() => {
        if (
          trigger instanceof HTMLElement &&
          trigger.isConnected &&
          !trigger.closest("[inert]")
        ) {
          trigger.focus({ preventScroll: true });
        }
      });
    };
  }, [returnFocusRef]);

  return (
    <dialog
      {...props}
      ref={dialogRef}
      className={`${styles.modal} ${className}`}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const dialog = dialogRef.current;
        if (
          !dialog ||
          (event.target instanceof Element &&
            event.target.closest("dialog") !== dialog)
        )
          return;
        const controls = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            "a[href], button, input, select, textarea, summary, [tabindex]",
          ),
        ).filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(":disabled") &&
            !element.closest("[inert]") &&
            element.getClientRects().length > 0,
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!first) {
          event.preventDefault();
          dialog.focus();
          return;
        }
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialog)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      {children}
    </dialog>
  );
}
