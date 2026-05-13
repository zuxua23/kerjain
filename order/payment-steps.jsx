/* global React, fmtRp, DEFAULT_PRICING, CATEGORIES, TECH_GROUPS, TECH_FLAT, COLOR_PALETTES */
const { useState: usePS, useRef: useRefPS } = React;

// calcTotal sekarang terima pricing sebagai param (bukan hardcoded)
function calcTotal(form, pricing = DEFAULT_PRICING) {
  let total = 0;
  const lines = [];

  CATEGORIES.forEach(cat => {
    const count = form.counts[cat.key] || 0;
    if (count > 0) {
      const base = count * (pricing[cat.key] || 0);
      total += base;
      lines.push({ label: `${cat.label} × ${count}`, val: base });

      const items = form.items[cat.key] || [];
      const attrCount = items.reduce((s, it) => s + (it.decideAttrs ? 0 : (it.attrs?.length || 0)), 0);
      if (attrCount > 0) {
        const attrCost = attrCount * (pricing.attr || 0);
        total += attrCost;
        lines.push({ label: `↳ ${attrCount} atribut × ${fmtRp(pricing.attr || 0)}`, val: attrCost, sub: true });
      }
    }
  });

  if (form.designMode === 'custom') {
    total += pricing.designCustom || 0;
    lines.push({ label: 'Desain berwarna (warna dari kamu)', val: pricing.designCustom || 0 });
  } else if (form.designMode === 'developer') {
    total += pricing.designDev || 0;
    lines.push({ label: 'Custom UI by Developer', val: pricing.designDev || 0 });
  }

  return { total, lines, dp: total * 0.25, sisa: total * 0.75 };
}

// ── STEP 5 — RINGKASAN ─────────────────────────────────────────
function StepSummary({ form, pricing = DEFAULT_PRICING }) {
  const { total, lines, dp, sisa } = calcTotal(form, pricing);
  const paletteLabel = form.palette ? COLOR_PALETTES.find(p => p.id === form.palette)?.label : null;

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-eyebrow">Step 05 / Ringkasan</div>
        <h1 className="step-title">Cek pesanan kamu</h1>
        <p className="step-subtitle">Pastikan semua udah bener sebelum lanjut ke pembayaran.</p>
      </div>

      <div className="summary-card">
        <div className="summary-section">
          <div className="summary-section-title">Pelanggan</div>
          <SRow label="Nama" val={form.name || '—'} />
          <SRow label="WhatsApp" val={'+62' + (form.wa || '—')} />
          {form.email && <SRow label="Email" val={form.email} />}
        </div>

        <div className="summary-section">
          <div className="summary-section-title">Scope Pekerjaan</div>
          {CATEGORIES.map(cat => {
            const count = form.counts[cat.key] || 0;
            if (!count) return null;
            const items = form.items[cat.key] || [];
            const attrTotal = items.reduce((s, it) => s + (it.decideAttrs ? 0 : (it.attrs?.length || 0)), 0);
            return (
              <div key={cat.key} style={{ marginBottom: 12 }}>
                <SRow label={cat.label} val={`${count} item${attrTotal > 0 ? ` + ${attrTotal} atribut` : ''}`} />
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  {items.map((it, i) => (
                    <div key={i} style={{ paddingLeft: 12, borderLeft: '2px solid var(--border)', marginTop: 6 }}>
                      <div>↳ <strong>{it.name || <span style={{ color: 'var(--text-faint)' }}>(Belum diisi #{i+1})</span>}</strong></div>
                      {it.decideAttrs
                        ? <div style={{ color: 'var(--text-faint)', fontStyle: 'italic', marginTop: 2 }}>· atribut ditentukan developer</div>
                        : it.attrs.length > 0 && <div style={{ color: 'var(--text-faint)', marginTop: 2 }}>· atribut: {it.attrs.join(', ')}</div>
                      }
                      {it.notes && <div style={{ color: 'var(--text-faint)', marginTop: 2, fontStyle: 'italic' }}>· catatan: "{it.notes}"</div>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="summary-section">
          <div className="summary-section-title">Tech Stack</div>
          {TECH_GROUPS.map(g => {
            const labels = form.tech.filter(id => g.options.some(o => o.id === id))
                                    .map(id => g.options.find(o => o.id === id)?.label)
                                    .filter(Boolean);
            return (
              <SRow key={g.key} label={g.label}
                val={labels.length > 0 ? labels.join(', ') : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                wide />
            );
          })}
        </div>

        <div className="summary-section">
          <div className="summary-section-title">Desain</div>
          <SRow label="Mode" val={
            form.designMode === 'developer' ? `Custom UI by Developer (+${fmtRp(pricing.designDev)})` :
            form.designMode === 'custom'    ? `Berwarna - warna dari kamu (+${fmtRp(pricing.designCustom)})` :
            'Default Developer'
          } wide />
          {form.designMode === 'custom' && paletteLabel && <SRow label="Palette" val={paletteLabel} />}
          {form.designMode === 'custom' && form.customColor && (
            <div className="summary-row">
              <span className="label">Warna utama</span>
              <span className="val" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {form.customColor.startsWith('#') && <span style={{ width: 14, height: 14, borderRadius: 4, background: form.customColor, border: '1px solid var(--border)' }} />}
                <span style={{ fontFamily: 'var(--font-mono)' }}>{form.customColor}</span>
              </span>
            </div>
          )}
        </div>

        <div className="summary-section">
          <div className="summary-section-title">Timeline</div>
          <SRow label="Deadline" val={
            form.deadline ? new Date(form.deadline).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'
          } wide />
          {form.notes && (
            <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
              "{form.notes}"
            </div>
          )}
        </div>

        <div className="summary-section">
          <div className="summary-section-title">Rincian Biaya</div>
          {lines.map((l, i) => (
            <div key={i} className="summary-row" style={l.sub ? { paddingLeft: 14, fontSize: 12, color: 'var(--text-muted)' } : {}}>
              <span className="label" style={l.sub ? { fontWeight: 400 } : {}}>{l.label}</span>
              <span className="val" style={l.sub ? { fontWeight: 500 } : {}}>{fmtRp(l.val)}</span>
            </div>
          ))}
        </div>

        <div className="summary-total">
          <div>
            <div className="summary-total-label">Total Pesanan</div>
            <div className="summary-total-amount">{fmtRp(total)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>DP sekarang</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 20 }}>{fmtRp(dp)}</div>
            <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>Sisa {fmtRp(sisa)} pas selesai</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SRow({ label, val, wide }) {
  return (
    <div className="summary-row">
      <span className="label">{label}</span>
      <span className="val" style={wide ? { maxWidth: '60%', textAlign: 'right' } : {}}>{val}</span>
    </div>
  );
}

// ── STEP 6 — PEMBAYARAN ────────────────────────────────────────
function StepPayment({ form, setForm, errors, pricing = DEFAULT_PRICING, paymentMethods = [] }) {
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const fileRef = useRefPS(null);
  const [dragOver, setDragOver] = usePS(false);
  const [copied, setCopied]     = usePS('');

  const { dp } = calcTotal(form, pricing);
  const selectedMethod = paymentMethods.find(m => m.id === form.paymentMethod);

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran file maks. 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      upd('proof', { name: file.name, type: file.type, size: file.size, base64, dataUrl: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  const copyAccount = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-eyebrow">Step 06 / Pembayaran</div>
        <h1 className="step-title">Bayar DP untuk mulai</h1>
        <p className="step-subtitle">Bayar DP dulu buat konfirmasi pesanan. Pelunasan setelah aplikasi selesai dikerjakan.</p>
      </div>

      <div className="payment-banner">
        <div className="payment-banner-icon">💰</div>
        <div className="payment-banner-text">
          DP yang harus dibayar sekarang: <strong>{fmtRp(dp)}</strong><br />
          <span style={{ fontSize: 12, opacity: 0.8 }}>25% dari total estimasi</span>
        </div>
      </div>

      <div className="card">
        <label className="label" style={{ marginBottom: 12 }}>Pilih Metode Pembayaran</label>
        <div className="method-grid">
          {paymentMethods.map(m => (
            <div key={m.id}
              className={'method-card' + (form.paymentMethod === m.id ? ' selected' : '')}
              onClick={() => upd('paymentMethod', m.id)}
            >
              <div className="method-logo" style={getLogoStyle(m.id)}>{m.name.slice(0, 3).toUpperCase()}</div>
              <div>
                <div className="method-name">{m.name}</div>
                <div className="method-detail">{m.norek}</div>
              </div>
              <div className="method-radio" />
            </div>
          ))}
        </div>
        {errors.paymentMethod && <div className="error-msg" style={{ marginTop: 10 }}>Pilih metode pembayaran</div>}

        {selectedMethod && (
          <div className="account-card">
            {selectedMethod.type === 'bank' ? (
              <>
                <div className="account-row">
                  <span className="account-label">No. Rekening</span>
                  <span className="account-val">
                    {selectedMethod.norek}
                    <button className={'copy-btn' + (copied === selectedMethod.norek ? ' copied' : '')}
                      onClick={() => copyAccount(selectedMethod.norek)}>
                      {copied === selectedMethod.norek ? '✓ Tersalin' : 'Salin'}
                    </button>
                  </span>
                </div>
                {selectedMethod.atasNama && (
                  <div className="account-row">
                    <span className="account-label">Atas nama</span>
                    <span className="account-val">{selectedMethod.atasNama}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="account-row">
                <span className="account-label">Nomor {selectedMethod.name}</span>
                <span className="account-val">
                  {selectedMethod.norek}
                  <button className={'copy-btn' + (copied === selectedMethod.norek ? ' copied' : '')}
                    onClick={() => copyAccount(selectedMethod.norek)}>
                    {copied === selectedMethod.norek ? '✓ Tersalin' : 'Salin'}
                  </button>
                </span>
              </div>
            )}
            <div className="account-row" style={{ borderTop: '1px dashed var(--border)', marginTop: 8, paddingTop: 12 }}>
              <span className="account-label">Nominal DP</span>
              <span className="account-val" style={{ color: 'var(--primary)', fontSize: 16 }}>{fmtRp(dp)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <label className="label" style={{ marginBottom: 12 }}>Upload Bukti Transfer</label>

        {!form.proof ? (
          <div className={'upload-zone' + (dragOver ? ' dragging' : '')}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <div className="upload-icon">↑</div>
            <div className="upload-title">Tap atau drop bukti transfer di sini</div>
            <div className="upload-hint">JPG, PNG, atau PDF · max 5MB</div>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden
              onChange={e => handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="upload-preview">
            <div className="upload-thumb">
              {form.proof.type?.startsWith('image/')
                ? <img src={form.proof.dataUrl} alt="preview" />
                : '📄'}
            </div>
            <div className="upload-info">
              <div className="upload-name">{form.proof.name}</div>
              <div className="upload-meta">{(form.proof.size / 1024).toFixed(1)} KB · Siap dikirim</div>
            </div>
            <button className="upload-remove" onClick={() => upd('proof', null)}>✕</button>
          </div>
        )}

        {errors.proof && <div className="error-msg" style={{ marginTop: 10 }}>Bukti transfer wajib diupload</div>}
      </div>
    </div>
  );
}

function getLogoStyle(id) {
  return ({
    bca:       { background: '#0060AF', color: 'white', border: 'none' },
    blu:       { background: '#2B55CC', color: 'white', border: 'none' },
    dana:      { background: '#118EEA', color: 'white', border: 'none' },
    shopeepay: { background: '#EE4D2D', color: 'white', border: 'none' },
    mandiri:   { background: '#003D79', color: '#FFD700', border: 'none', fontSize: 10 },
    gopay:     { background: '#00AED6', color: 'white', border: 'none' },
    qris:      { background: '#ED1C24', color: 'white', border: 'none' },
  })[id] || {};
}

// ── SUCCESS SCREEN ─────────────────────────────────────────────
function SuccessScreen({ form, pricing = DEFAULT_PRICING, onReset }) {
  const { dp, total, sisa } = calcTotal(form, pricing);
  const orderCode = 'KJ-' + Date.now().toString(36).toUpperCase().slice(-7);

  return (
    <div className="success-shell step-content">
      <div className="success-badge">✓</div>
      <h1 className="success-title">Pesanan berhasil dikirim!</h1>
      <p className="success-sub">
        Datamu udah masuk ke sistem. Admin bakal kontak via WhatsApp <strong>+62{form.wa}</strong> dalam <strong>1×24 jam</strong> untuk konfirmasi & koordinasi pengerjaan.
      </p>
      <div className="success-code">#{orderCode}</div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18, maxWidth: 420, width: '100%', marginBottom: 24, textAlign: 'left', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: 12 }}>
          Apa Selanjutnya?
        </div>
        <NextStep n={1} title="Admin verifikasi pembayaran" desc="DP yang udah kamu kirim akan dicek dalam beberapa jam ke depan." />
        <NextStep n={2} title="Diskusi detail via WhatsApp" desc="Kita bahas spek detail, kasih timeline pasti, dan progress update." />
        <NextStep n={3} title="Pengerjaan & delivery" desc={`Aplikasi dikerjain sesuai deadline. Pelunasan ${fmtRp(sisa)} pas selesai.`} />
      </div>

      <div className="success-actions">
        <button className="btn btn-ghost" onClick={onReset}>Pesan project lain</button>
      </div>
    </div>
  );
}

function NextStep({ n, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px dashed var(--border)' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{n}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

Object.assign(window, { StepSummary, StepPayment, SuccessScreen, calcTotal });