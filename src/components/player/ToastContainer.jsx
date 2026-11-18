import React from 'react';

const COLOR_MAP = {
  info: '#38bdf8',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f97316'
};

export default function ToastContainer({ toasts }) {
  return (
    <div id="toastContainer">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-msg"
          style={{ borderColor: COLOR_MAP[t.type] || COLOR_MAP.info }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
