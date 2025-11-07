import React, { useEffect, useState } from "react";
import authService from "../utils/authService";
import '../assets/authPages.css'

export default function AuthModal({
  open = false,
  initialMode = "login", // 'login' | 'register'
  onClose = () => {},
  onLoginSuccess = () => {},
  onRegisterSuccess = () => {},
}) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("buyer");

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setLoading(false);
    // reset fields when opening
    if (open) {
      setUsername("");
      setEmail("");
      setPassword("");
      setUserType("buyer");
    }
  }, [initialMode, open]);

  if (!open) return null;

  async function handleSubmit(e) {
    e?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const data = await authService.login(username || email, password);
        // authService.login returns parsed API response or fallback object
        const user = data.user ?? data;
        // persist user if provided
        try { if (user) localStorage.setItem("user", JSON.stringify(user)); } catch {}
        if (onLoginSuccess) onLoginSuccess(user);
      } else {
        const payload = { username, email, password, user_type: userType };
        const data = await authService.register(payload);
        const user = data.user ?? data;
        try { if (user) localStorage.setItem("user", JSON.stringify(user)); } catch {}
        if (onRegisterSuccess) onRegisterSuccess(user);
      }
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
      // normalize error message
      if (typeof err === "string") setError(err);
      else if (err && err.detail) setError(err.detail);
      else if (err && err.message) setError(err.message);
      else setError("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  }

  return (
    <div className="auth-modal-overlay" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <header className="auth-header">
          <h3>{mode === "login" ? "Đăng nhập" : "Đăng ký"}</h3>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="auth-tabs">
          <button
            type="button"
            className={`tab ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`tab ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Đăng ký
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label>
                Tên đăng nhập
                <input value={username} onChange={(e) => setUsername(e.target.value)} />
              </label>
              <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label>
                Loại tài khoản
                <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </label>
            </>
          )}

          {mode === "login" && (
            <>
              <label>
                Email hoặc username
                <input value={username} onChange={(e) => setUsername(e.target.value)} />
              </label>
            </>
          )}

          <label>
            Mật khẩu
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          {error && <div className="auth-error" role="alert">{String(error)}</div>}

          <div className="auth-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>

            <button
              type="button"
              className="switch-btn"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
