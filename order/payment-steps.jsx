/* global React, fmtRp, PRICING, CATEGORIES, TECH_GROUPS, TECH_FLAT, COLOR_PALETTES */
const { useState: usePS, useRef: useRefPS, useEffect: useEffectPS } = React;

// ============================================
// PRICING CALCULATOR
// ============================================
function calcTotal(form) {
  let total = 0;
  const lines = [];
  CATEGORIES.forEach(cat => {
    const count = form.counts[cat.key] || 0;
    if (count > 0) {
      const base = count * cat.price;
      total += base;
      lines.push({ label: `${cat.label} × ${count}`, val: base });

      // Per-attribute cost
      const items = form.items[cat.key] || [];
      const attrCount = items.reduce((s, it) => s + (it.decideAttrs ? 0 : (it.attrs?.length || 0)), 0);
      if (attrCount > 0) {
        const attrCost = attrCount * PRICING.attr;
        total += attrCost;
        lines.push({
          label: `↳ ${attrCount} atribut × ${fmtRp(PRICING.attr)}`,
          val: attrCost, sub: true
        });
      }
    }
  });
  if (form.designMode === 'custom') {
    total += PRICING.designCustom;
    lines.push({ label: 'Desain berwarna (warna dari kamu)', val: PRICING.designCustom });
  } else if (form.designMode === 'developer') {
    total += PRICING.designDev;
    lines.push({ label: 'Custom UI by Developer', val: PRICING.designDev });
  }
  return { total, lines, dp: total * 0.25, sisa: total * 0.75 };
}

// ============================================
// STEP 5 — RINGKASAN
// ============================================
function StepSummary({ form }) {
  const { total, lines, dp, sisa } = calcTotal(form);
  const paletteLabel = form.palette ? COLOR_PALETTES.find(p => p.id === form.palette)?.label : null;

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-eyebrow">Step 05 / Ringkasan</div>
        <h1 className="step-title">Cek pesanan kamu</h1>
        <p className="step-subtitle">Pastikan semua udah bener sebelum lanjut ke pembayaran. Bisa balik ke step sebelumnya kalau mau revisi.</p>
      </div>

      <div className="summary-card">
        <div className="summary-section">
          <div className="summary-section-title">Pelanggan</div>
          <div className="summary-row">
            <span className="label">Nama</span>
            <span className="val">{form.name || '—'}</span>
          </div>
          <div className="summary-row">
            <span className="label">WhatsApp</span>
            <span className="val">+62{form.wa || '—'}</span>
          </div>
          {form.email && (
            <div className="summary-row">
              <span className="label">Email</span>
              <span className="val">{form.email}</span>
            </div>
          )}
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
                <div className="summary-row">
                  <span className="label">{cat.label}</span>
                  <span className="val">{count} item{attrTotal > 0 ? ` + ${attrTotal} atribut` : ''}</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  {items.map((it, i) => (
                    <div key={i} style={{ paddingLeft: 12, borderLeft: '2px solid var(--border)', marginTop: 6 }}>
                      <div>
                        ↳ <strong>{it.name || <span style={{ color: 'var(--text-faint)' }}>{`(Belum diisi #${i+1})`}</span>}</strong>
                      </div>
                      {it.decideAttrs ? (
                        <div style={{ color: 'var(--text-faint)', fontStyle: 'italic', marginTop: 2 }}>
                          · atribut ditentukan developer
                        </div>
                      ) : it.attrs.length > 0 && (
                        <div style={{ color: 'var(--text-faint)', marginTop: 2 }}>
                          · atribut: {it.attrs.join(', ')}
                        </div>
                      )}
                      {it.notes && (
                        <div style={{ color: 'var(--text-faint)', marginTop: 2, fontStyle: 'italic' }}>
                          · catatan: “{it.notes}”
                        </div>
                      )}
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
            const selected = form.tech.filter(id => g.options.some(o => o.id === id));
            const labels = selected.map(id => g.options.find(o => o.id === id)?.label).filter(Boolean);
            return (
              <div key={g.key} className="summary-row">
                <span className="label">{g.label}</span>
                <span className="val" style={{ maxWidth: '60%' }}>
                  {labels.length > 0 ? labels.join(', ') : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                </span>
              </div>
            );
          })}
        </div>

        <div className="summary-section">
          <div className="summary-section-title">Desain</div>
          <div className="summary-row">
            <span className="label">Mode</span>
            <span className="val">
              {form.designMode === 'developer' ? `Custom UI by Developer (+${fmtRp(PRICING.designDev)})` :
               form.designMode === 'custom' ? `Berwarna - warna dari kamu (+${fmtRp(PRICING.designCustom)})` :
               'Default Developer'}
            </span>
          </div>
          {form.designMode === 'custom' && paletteLabel && (
            <div className="summary-row">
              <span className="label">Palette</span>
              <span className="val">{paletteLabel}</span>
            </div>
          )}
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
          <div className="summary-row">
            <span className="label">Deadline</span>
            <span className="val">
              {form.deadline ? new Date(form.deadline).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
            </span>
          </div>
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
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              DP 25% = {fmtRp(dp)} · Pelunasan {fmtRp(sisa)} saat selesai
            </div>
          </div>
          <div className="summary-total-amount">{fmtRp(total)}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 6 — PEMBAYARAN
// ============================================
const PAYMENT_METHODS = [
  { id: 'bca', name: 'BCA Transfer', logo: 'BCA', detail: '8290-456-789 · a.n. DevOrder Studio' },
  { id: 'mandiri', name: 'Mandiri Transfer', logo: 'MNDR', detail: '1410-0098-7654 · a.n. DevOrder Studio' },
  { id: 'dana', name: 'DANA', logo: 'DANA', detail: '0812-3456-7890' },
  { id: 'gopay', name: 'GoPay', logo: 'GO', detail: '0812-3456-7890' },
  { id: 'qris', name: 'QRIS', logo: 'QR', detail: 'Scan dari semua e-wallet' },
];

function StepPayment({ form, setForm, errors }) {
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const { dp, total } = calcTotal(form);
  const [copied, setCopied] = usePS(null);
  const [dragOver, setDragOver] = usePS(false);
  const fileRef = useRefPS(null);

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === form.paymentMethod);

  const copyAccount = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      upd('proof', { name: file.name, size: file.size, dataUrl: e.target.result, type: file.type });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-eyebrow">Step 06 / Pembayaran</div>
        <h1 className="step-title">Bayar DP & upload bukti</h1>
        <p className="step-subtitle">Pesanan baru diproses setelah DP 25% masuk. Sisa 75% dilunasi saat aplikasi sudah selesai dikerjain.</p>
      </div>

      <div className="payment-banner">
        <div className="payment-banner-icon">💰</div>
        <div className="payment-banner-text">
          DP yang harus dibayar sekarang: <strong>{fmtRp(dp)}</strong> dari total {fmtRp(total)}
        </div>
      </div>

      <div className="card">
        <label className="label" style={{ marginBottom: 12 }}>Pilih Metode Pembayaran</label>
        <div className="method-grid">
          {PAYMENT_METHODS.map(m => (
            <div
              key={m.id}
              className={'method-card' + (form.paymentMethod === m.id ? ' selected' : '')}
              onClick={() => upd('paymentMethod', m.id)}
            >
              <div className="method-logo" style={getLogoStyle(m.id)}>{m.logo}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="method-name">{m.name}</div>
                <div className="method-detail">{m.id === 'qris' ? 'Universal' : 'Tap untuk lihat detail'}</div>
              </div>
              <div className="method-radio" />
            </div>
          ))}
        </div>

        {errors.paymentMethod && <div className="error-msg" style={{ marginTop: 10 }}>Pilih dulu metode pembayarannya</div>}

        {selectedMethod && (
          <div className="account-card">
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Detail {selectedMethod.name}
            </div>
            {selectedMethod.id === 'qris' ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                <div style={{ width: 180, height: 180, background: 'white', borderRadius: 12, padding: 12, border: '1.5px solid var(--border)' }}>
                  <FakeQR />
                </div>
              </div>
            ) : (
              <>
                <div className="account-row">
                  <span className="account-label">No. Rekening</span>
                  <span className="account-val">
                    {selectedMethod.detail.split(' · ')[0]}
                    <button
                      className={'copy-btn' + (copied === selectedMethod.detail.split(' · ')[0] ? ' copied' : '')}
                      onClick={() => copyAccount(selectedMethod.detail.split(' · ')[0])}
                    >
                      {copied === selectedMethod.detail.split(' · ')[0] ? '✓ Tersalin' : 'Salin'}
                    </button>
                  </span>
                </div>
                {selectedMethod.detail.includes(' · ') && (
                  <div className="account-row">
                    <span className="account-label">Atas nama</span>
                    <span className="account-val">{selectedMethod.detail.split(' · ')[1].replace('a.n. ', '')}</span>
                  </div>
                )}
              </>
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
          <div
            className={'upload-zone' + (dragOver ? ' dragging' : '')}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault(); setDragOver(false);
              handleFile(e.dataTransfer.files[0]);
            }}
          >
            <div className="upload-icon">↑</div>
            <div className="upload-title">Tap atau drop bukti transfer di sini</div>
            <div className="upload-hint">JPG, PNG, atau PDF · max 5MB</div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              hidden
              onChange={e => handleFile(e.target.files[0])}
            />
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
  const map = {
    bca: { background: '#0060AF', color: 'white', border: 'none' },
    mandiri: { background: '#003D79', color: '#FFD700', border: 'none', fontSize: 10 },
    dana: { background: '#118EEA', color: 'white', border: 'none' },
    gopay: { background: '#00AED6', color: 'white', border: 'none' },
    qris: { background: '#ED1C24', color: 'white', border: 'none' },
  };
  return map[id] || {};
}

function FakeQR() {
  // Generate a stable fake QR pattern
  const cells = [];
  const seed = 7;
  for (let i = 0; i < 21; i++) {
    for (let j = 0; j < 21; j++) {
      const isFinder =
        (i < 7 && j < 7) ||
        (i < 7 && j > 13) ||
        (i > 13 && j < 7);
      const isFinderInner =
        ((i >= 2 && i <= 4) && (j >= 2 && j <= 4)) ||
        ((i >= 2 && i <= 4) && (j >= 16 && j <= 18)) ||
        ((i >= 16 && i <= 18) && (j >= 2 && j <= 4));
      const isFinderRing =
        (isFinder && (i === 0 || i === 6 || j === 0 || j === 6 ||
                      (i < 7 && j === 14) || (i === 14 && j < 7))) ||
        ((i >= 14) && (j === 0 || j === 6)) ||
        ((j >= 14) && (i === 0 || i === 6));
      const hash = ((i * 31 + j * seed + i * j) % 5) === 0;
      const fill = isFinderInner || isFinderRing || (isFinder && (i === 0 || i === 6 || j === 0 || j === 6 || i === 14 || j === 14)) || (!isFinder && hash);
      cells.push(
        <rect
          key={`${i}-${j}`}
          x={j * 7}
          y={i * 7}
          width={7}
          height={7}
          fill={fill ? '#0A0A0A' : 'transparent'}
        />
      );
    }
  }
  return (
    <svg viewBox="0 0 147 147" width="100%" height="100%">
      <rect width="147" height="147" fill="white" />
      {cells}
    </svg>
  );
}

// ============================================
// SUCCESS SCREEN
// ============================================
function SuccessScreen({ form, onReset }) {
  const { dp, total } = calcTotal(form);
  const orderCode = 'DV-' + Date.now().toString(36).toUpperCase().slice(-7);

  return (
    <div className="success-shell step-content">
      <div className="success-badge">✓</div>
      <h1 className="success-title">Pesanan berhasil dikirim!</h1>
      <p className="success-sub">
        Datamu udah masuk ke sistem. Admin bakal kontak via WhatsApp <strong>+62{form.wa}</strong> dalam <strong>1×24 jam</strong> buat konfirmasi & koordinasi pengerjaan.
      </p>
      <div className="success-code">#{orderCode}</div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18, maxWidth: 420, width: '100%', marginBottom: 24, textAlign: 'left', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: 12 }}>
          Apa Selanjutnya?
        </div>
        <Step n={1} title="Admin verifikasi pembayaran" desc="DP yang udah kamu kirim akan dicek dalam beberapa jam ke depan." />
        <Step n={2} title="Diskusi detail via WhatsApp" desc="Kita bahas spek detail, kasih timeline pasti, dan progress update." />
        <Step n={3} title="Pengerjaan & delivery" desc={`Aplikasi dikerjain sesuai deadline. Pelunasan ${fmtRp(total - dp)} pas selesai.`} />
      </div>

      <div className="success-actions">
        <button className="btn btn-primary" onClick={() => window.open('https://wa.me/6281234567890?text=Halo, saya baru order dengan kode ' + orderCode, '_blank')}>
          💬 Chat Admin di WhatsApp
        </button>
        <button className="btn btn-ghost" onClick={onReset}>
          Pesan project lain
        </button>
      </div>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px dashed var(--border)' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
        {n}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  StepSummary, StepPayment, SuccessScreen, calcTotal,
});
