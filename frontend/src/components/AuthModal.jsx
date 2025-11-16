import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../utils/authService";
import '../assets/authPages.css'

export default function AuthModal({
  open = false,
  initialMode = "login", // 'login' | 'register'
  onClose = () => {},
  onLoginSuccess = () => {},
  onRegisterSuccess = () => {},
}) {
  const navigate = useNavigate();

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

  // Map user_type -> redirect path. Edit mapping if you need different routes.
  const getRedirectForRole = (role) => {
    switch ((role || "").toString().toLowerCase()) {
      case "seller":
        return "/seller/dashboard";
      case "buyer":
        return "/";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/dashboard";
    }
  };

  async function handleSubmit(e) {
    e?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      let user;

      if (mode === "login") {
        // login can accept username or email; authService should handle it
        data = await authService.login(username || email, password);
        user = data?.user ?? data;
      } else {
        const payload = { username, email, password, user_type: userType };
        data = await authService.register(payload);
        user = data?.user ?? data;
      }

      // persist user if provided
      try {
        if (user) localStorage.setItem("user", JSON.stringify(user));
      } catch (err) {
        // ignore localStorage errors
      }

      // notify parent
      if (mode === "login" && onLoginSuccess) onLoginSuccess(user);
      if (mode === "register" && onRegisterSuccess) onRegisterSuccess(user);

      setLoading(false);

      // close modal first (so UI modal disappears), then navigate
      try { onClose(); } catch {}

      // Determine redirect path by role and navigate
      const role = user?.user_type ?? user?.role ?? null;
      const redirectPath = getRedirectForRole(role);
      // navigate only if we have a path
      if (redirectPath) {
        navigate(redirectPath);
      }
    } catch (err) {
      setLoading(false);
      // normalize error message
      if (typeof err === "string") setError(err);
      else if (err && err.detail) setError(err.detail);
      else if (err && err.message) setError(err.message);
      else if (err?.response?.data) {
        // try common shapes from API errors
        const resp = err.response.data;
        if (typeof resp === "string") setError(resp);
        else if (resp.error) setError(resp.error);
        else if (resp.detail) setError(resp.detail);
        else if (resp.message) setError(resp.message);
        else setError("Có lỗi xảy ra. Vui lòng thử lại.");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
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