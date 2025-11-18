import React, { useRef } from 'react';
import Icon from './Icon';

export default function ImageSearchUpload({
  endpoint = 'http://localhost:8000/api/search/image/',
  k = 48,
  label = 'Tìm bằng ảnh',
  onStart,
  onFinish,
  onResults,
  onError,
  className = 'btn btn-primary',
  icon = 'image'
}) {
  const inputRef = useRef(null);

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      onStart?.();
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch(`${endpoint}?k=${k}`, { method: 'POST', body: fd });
      const text = await res.text();
      let json = {};
      try { json = JSON.parse(text); } catch { /* HTML error page */ }

      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      const results = Array.isArray(json.results) ? json.results : [];
      const mapped = results.map(p => ({ ...p, image: p.image || p.image_url || '' }));
      onResults?.(mapped);
    } catch (err) {
      console.error(err);
      onError?.(String(err?.message || 'Tìm kiếm bằng ảnh thất bại.'));
    } finally {
      onFinish?.();
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const content = typeof label === 'string'
    ? (
        <>
          {icon && <Icon name={icon} size={16} style={{ marginRight: 6 }} />}
          <span>{label}</span>
        </>
      )
    : label;

  return (
    <label
      className={className}
      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      {content}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </label>
  );
}