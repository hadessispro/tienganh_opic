import { useEffect } from "react";

import AuthCard from "./AuthCard";

export default function AuthModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.classList.add("auth-modal-open");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("auth-modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="auth-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="auth-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Đăng nhập"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="auth-modal-close" type="button" aria-label="Đóng" onClick={onClose}>
          x
        </button>
        <AuthCard />
      </div>
    </div>
  );
}
