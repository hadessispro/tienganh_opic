import { useState } from "react";

import GoogleIcon from "./GoogleIcon";

export default function AuthCard({ defaultMode = "login" }) {
  const [mode, setMode] = useState(defaultMode);
  const [emailMode, setEmailMode] = useState(false);
  const isRegister = mode === "register";

  return (
    <section className="auth-card" aria-labelledby="auth-card-title">
      <div className="auth-card-title" id="auth-card-title">
        {isRegister ? "Đăng ký" : "Đăng nhập"}
      </div>
      <p className="auth-card-copy">
        {isRegister
          ? "Tạo tài khoản để lưu tiến độ và bắt đầu luyện Speaking ngay"
          : "Dùng Google để đăng nhập nhanh chóng và bắt đầu ngay"}
      </p>

      <button className="auth-primary-button" type="button" aria-label="Sign in with Google">
        <GoogleIcon />
        <span>{isRegister ? "Đăng ký với Google" : "Đăng nhập với Google"}</span>
      </button>

      <div className="auth-muted-line">
        {isRegister ? "Hoặc đăng ký bằng mã gửi về email" : "Hoặc đăng nhập bằng mã gửi về email"}
      </div>

      {emailMode ? (
        <form
          className="auth-email-form"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label className="auth-field">
            <span>Email</span>
            <input type="email" placeholder="you@example.com" autoComplete="email" />
          </label>
          <button className="auth-email-submit" type="submit">
            {isRegister ? "Gửi mã đăng ký" : "Gửi mã đăng nhập"}
          </button>
        </form>
      ) : (
        <button className="auth-text-link" type="button" onClick={() => setEmailMode(true)}>
          {isRegister ? "Đăng ký email" : "Đăng nhập email"}
        </button>
      )}

      <div className="auth-switch-row">
        <span>{isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}</span>
        <button
          className="auth-text-link"
          type="button"
          onClick={() => {
            setMode(isRegister ? "login" : "register");
            setEmailMode(false);
          }}
        >
          {isRegister ? "Đăng nhập" : "Đăng ký"}
        </button>
      </div>
    </section>
  );
}
