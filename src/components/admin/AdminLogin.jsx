import React, { useState } from 'react';
import { CONFIG } from '../../game/config.js';

export default function AdminLogin({ onAuthenticated }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim() === CONFIG.ADMIN_KEY) {
      sessionStorage.setItem('campus_admin_auth', 'true');
      setError('');
      onAuthenticated();
    } else {
      setError('❌ Incorrect password. Access restricted to Game Master.');
    }
  };

  return (
    <div id="loginScreen">
      <form className="login-container" onSubmit={handleSubmit}>
        <div className="login-badge">SDMCET Tech Event 2024</div>
        <h1>Admin Panel</h1>
        <p className="login-sub">Among Us: The Skeld — Game Master Control Portal</p>

        <div className="login-input-group">
          <input
            type="password"
            id="adminPass"
            placeholder="Admin Password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="login-btn">
          Enter
        </button>

        <div id="loginError">{error}</div>

        <div className="login-hint">
          Authorized access only. Default: <code>{CONFIG.ADMIN_KEY}</code>
        </div>
      </form>
    </div>
  );
}
