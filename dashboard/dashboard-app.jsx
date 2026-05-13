/* global React, ReactDOM */
const { useState, useEffect, useCallback } = React;

// ⚠️ Sama dengan di app.jsx — ganti setelah deploy Apps Script
const API = 'https://script.google.com/macros/s/AKfycbwyW8N7sdclBS5KSJXThUM7z2SnO0LJkCIiB-fuidRvMQ_ZqQ4B9upWxyl8efT0bZfmeA/exec';

const STATUS_LIST = ['Menunggu Verifikasi', 'Terverifikasi', 'Dikerjakan', 'Selesai', 'Dibatalkan'];
const STATUS_CLASS = {
  'Menunggu Verifikasi': 'menunggu',
  'Terverifikasi':       'terverifikasi',
  'Dikerjakan':          'dikerjakan',
  'Selesai':             'selesai',
  'Dibatalkan':          'dibatalkan',
};

const fmtRp = n => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
const fmtDate = s => s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const LOGO_STYLE = {
  bca:       { background: '#0060AF', color: 'white' },
  blu:       { background: '#2B55CC', color: 'white' },
  dana:      { background: '#118EEA', color: 'white' },
  shopeepay: { background: '#EE4D2D', color: 'white' },
};

// ── MAIN APP ───────────────────────────────────────────────────
function App() {
  const [token, setToken]   = useState(() => localStorage.getItem('kj_token') || '');
  const [authed, setAuthed] = useState(false);
  const [tab, setTab]       = useState('orders');
  const [theme, setTheme]   = useState(() => localStorage.getItem('kj_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? '' : theme);
    localStorage.setItem('kj_theme', theme);
  }, [theme]);

  const login = (pw) => {
    setToken(pw);
    localStorage.setItem('kj_token', pw);
    setAuthed(true);
  };
  const logout = () => {
    setToken('');
    setAuthed(false);
    localStorage.removeItem('kj_token');
  };

  // Auto-verify stored token
  useEffect(() => {
    if (token) setAuthed(true);
  }, []);

  if (!authed) return <LoginScreen onLogin={login} />;

  return (
    <div className="dash-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">{'{K}'}</div>
          Kerjain
        </div>
        {[
          { id: 'orders',  icon: '📋', label: 'Pesanan'        },
          { id: 'pricing', icon: '💰', label: 'Harga'           },
          { id: 'payment', icon: '🏦', label: 'Metode Bayar'    },
        ].map(n => (
          <button key={n.id} className={'nav-item' + (tab === n.id ? ' active' : '')} onClick={() => setTab(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
        <div className="sidebar-footer">
          <button className="btn btn-ghost" style={{ width: '100%', marginBottom: 8, fontSize: 13 }}
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="dash-main">
        {tab === 'orders'  && <OrdersTab  token={token} />}
        {tab === 'pricing' && <PricingTab token={token} />}
        {tab === 'payment' && <PaymentTab token={token} />}
      </main>
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw]     = useState('');
  const [err, setErr]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!pw) { setErr('Masukkan password'); return; }
    setLoading(true);
    // Verifikasi dengan ambil orders — kalau forbidden berarti salah pw
    fetch(`${API}?action=getOrders&token=${encodeURIComponent(pw)}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) { onLogin(pw); }
        else { setErr('Password salah'); setLoading(false); }
      })
      .catch(() => { setErr('Gagal konek ke server'); setLoading(false); });
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-logo-wrap">
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary)', display: 'grid', placeItems: 'center', color: 'white', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 20 }}>{'{K}'}</div>
        </div>
        <h1 className="login-title">Kerjain Admin</h1>
        <p className="login-sub">Masuk ke dashboard untuk kelola pesanan & konfigurasi</p>
        <input className="input" type="password" placeholder="Password admin"
          value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()} />
        {err && <p className="login-error">{err}</p>}
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }}
          onClick={submit} disabled={loading}>
          {loading ? 'Verifikasi…' : 'Masuk →'}
        </button>
      </div>
    </div>
  );
}

// ── ORDERS TAB ─────────────────────────────────────────────────
function OrdersTab({ token }) {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('Semua');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`${API}?action=getOrders&token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => { if (d.ok) setOrders(d.orders); })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const setStatus = (orderId, status) => {
    fetch(`${API}?action=setStatus&token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ orderId, status }),
    })
      .then(r => r.json())
      .then(d => { if (d.ok) load(); else alert('Gagal update status'); });
  };

  const filtered = filter === 'Semua' ? orders : orders.filter(o => o['Status'] === filter);

  const totalRevenue = orders.filter(o => o['Status'] !== 'Dibatalkan').reduce((s, o) => s + (Number(o['Total']) || 0), 0);
  const totalDP      = orders.filter(o => ['Terverifikasi','Dikerjakan','Selesai'].includes(o['Status'])).reduce((s, o) => s + (Number(o['DP']) || 0), 0);
  const countByStatus = (s) => orders.filter(o => o['Status'] === s).length;

  return (
    <>
      <div className="dash-header">
        <h1 className="dash-title">Pesanan Masuk</h1>
        <p className="dash-sub">Semua order dari form publik</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Order" val={orders.length} sub="semua waktu" />
        <StatCard label="Menunggu Bayar" val={countByStatus('Menunggu Verifikasi')} sub="perlu dicek" accent="var(--danger)" />
        <StatCard label="Lagi Dikerjain" val={countByStatus('Dikerjakan')} sub="in progress" accent="var(--primary)" />
        <StatCard label="Est. Revenue" val={fmtRp(totalRevenue)} sub={`DP masuk ${fmtRp(totalDP)}`} />
      </div>

      <div className="filter-row">
        {['Semua', ...STATUS_LIST].map(s => (
          <button key={s} className={'filter-chip' + (filter === s ? ' active' : '')} onClick={() => setFilter(s)}>{s}</button>
        ))}
        <button className="filter-chip" style={{ marginLeft: 'auto' }} onClick={load}>🔄 Refresh</button>
      </div>

      {loading ? (
        <p className="loading-text">Memuat pesanan…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">Belum ada pesanan</div>
          <p>Pesanan akan muncul di sini setelah form diisi</p>
        </div>
      ) : (
        filtered.map(order => (
          <OrderCard key={order['Order ID']} order={order}
            expanded={expanded === order['Order ID']}
            onToggle={() => setExpanded(x => x === order['Order ID'] ? null : order['Order ID'])}
            onSetStatus={status => setStatus(order['Order ID'], status)}
          />
        ))
      )}
    </>
  );
}

function OrderCard({ order, expanded, onToggle, onSetStatus }) {
  const id     = order['Order ID'];
  const status = order['Status'] || 'Menunggu Verifikasi';
  const scope  = order['Scope'];

  const scopeSummary = scope?.counts
    ? Object.entries(scope.counts).filter(([,v]) => v > 0).map(([k,v]) => `${v} ${k}`).join(', ')
    : '—';

  return (
    <div className="order-card">
      <div className="order-head" onClick={onToggle}>
        <div>
          <div className="order-id">{id}</div>
          <div className="order-name">{order['Nama'] || '—'}</div>
          <div className="order-meta">{order['WhatsApp']} · {fmtDate(order['Timestamp'])}</div>
        </div>
        <span className={`status-badge status-${STATUS_CLASS[status] || 'menunggu'}`}>{status}</span>
        <div className="order-amount">{fmtRp(order['Total'])}</div>
        <span style={{ color: 'var(--text-faint)', fontSize: 18 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="order-body">
          <div className="order-detail-grid">
            <div className="od-item"><div className="od-label">Scope</div><div className="od-val">{scopeSummary}</div></div>
            <div className="od-item"><div className="od-label">Tech</div><div className="od-val">{Array.isArray(order['Tech']) ? order['Tech'].join(', ') : (order['Tech'] || '—')}</div></div>
            <div className="od-item"><div className="od-label">Desain</div><div className="od-val">{order['Desain Mode'] || '—'}</div></div>
            <div className="od-item"><div className="od-label">Deadline</div><div className="od-val">{fmtDate(order['Deadline'])}</div></div>
            <div className="od-item"><div className="od-label">Metode Bayar</div><div className="od-val">{order['Metode Bayar'] || '—'}</div></div>
            <div className="od-item"><div className="od-label">DP</div><div className="od-val" style={{ color: 'var(--accent)', fontWeight: 700 }}>{fmtRp(order['DP'])}</div></div>
            {order['Email'] && <div className="od-item"><div className="od-label">Email</div><div className="od-val">{order['Email']}</div></div>}
            {order['Warna/Palette'] && <div className="od-item"><div className="od-label">Warna</div><div className="od-val">{order['Warna/Palette']}</div></div>}
          </div>

          {order['Catatan'] && (
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              <strong>Catatan:</strong> {order['Catatan']}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {order['Bukti Bayar'] && order['Bukti Bayar'].startsWith('http') && (
              <a className="proof-link" href={order['Bukti Bayar']} target="_blank" rel="noreferrer">
                📎 Lihat Bukti Bayar
              </a>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ubah status:</span>
              <select className="status-select" value={status} onChange={e => onSetStatus(e.target.value)}>
                {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PRICING TAB ────────────────────────────────────────────────
function PricingTab({ token }) {
  const FIELDS = [
    { key: 'pricing_master',       label: 'Harga per Master Data',          desc: 'Tabel data utama' },
    { key: 'pricing_transaksi',    label: 'Harga per Transaksi',            desc: 'Modul transaksi' },
    { key: 'pricing_laporan',      label: 'Harga per Laporan',              desc: 'Output laporan PDF/Excel' },
    { key: 'pricing_dashboard',    label: 'Harga per Dashboard',            desc: 'Visualisasi & grafik' },
    { key: 'pricing_attr',         label: 'Harga per Atribut',              desc: 'Tambahan per kolom/field' },
    { key: 'pricing_designCustom', label: 'Tambahan Desain Berwarna',       desc: 'Customer kasih warna' },
    { key: 'pricing_designDev',    label: 'Tambahan Custom UI by Dev',      desc: 'Full custom developer' },
  ];

  const [values, setValues]   = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    fetch(`${API}?action=getConfig`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          const p = d.pricing;
          setValues({
            pricing_master:       p.master,
            pricing_transaksi:    p.transaksi,
            pricing_laporan:      p.laporan,
            pricing_dashboard:    p.dashboard,
            pricing_attr:         p.attr,
            pricing_designCustom: p.designCustom,
            pricing_designDev:    p.designDev,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const save = () => {
    setSaving(true);
    fetch(`${API}?action=saveConfig&token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ updates: values }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
        else alert('Gagal simpan: ' + d.error);
      })
      .finally(() => setSaving(false));
  };

  if (loading) return <p className="loading-text">Memuat konfigurasi harga…</p>;

  return (
    <>
      <div className="dash-header">
        <h1 className="dash-title">Konfigurasi Harga</h1>
        <p className="dash-sub">Harga yang diset di sini otomatis muncul di form order</p>
      </div>

      <div className="pricing-grid">
        {FIELDS.map(f => (
          <div key={f.key} className="pricing-card">
            <div className="pricing-label">{f.label}</div>
            <div className="pricing-desc">{f.desc}</div>
            <div className="pricing-input-wrap">
              <span className="pricing-prefix">Rp</span>
              <input className="input" type="number" min="0" step="1000"
                style={{ fontFamily: 'var(--font-mono)' }}
                value={values[f.key] || 0}
                onChange={e => setValues(v => ({ ...v, [f.key]: Number(e.target.value) }))}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="save-bar">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Menyimpan…' : saved ? '✓ Tersimpan!' : 'Simpan Perubahan'}
        </button>
        {saved && <span className="save-hint">Harga berhasil diperbarui — form langsung pakai harga baru</span>}
      </div>
    </>
  );
}

// ── PAYMENT METHODS TAB ────────────────────────────────────────
function PaymentTab({ token }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    fetch(`${API}?action=getConfig`)
      .then(r => r.json())
      .then(d => { if (d.ok && d.paymentMethods) setMethods(d.paymentMethods); })
      .finally(() => setLoading(false));
  }, []);

  const upd = (id, field, val) => {
    setMethods(ms => ms.map(m => m.id === id ? { ...m, [field]: val } : m));
  };

  const save = () => {
    setSaving(true);
    fetch(`${API}?action=saveConfig&token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ updates: { payment_methods: methods } }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
        else alert('Gagal simpan: ' + d.error);
      })
      .finally(() => setSaving(false));
  };

  if (loading) return <p className="loading-text">Memuat metode pembayaran…</p>;

  return (
    <>
      <div className="dash-header">
        <h1 className="dash-title">Metode Pembayaran</h1>
        <p className="dash-sub">Nomor rekening & e-wallet yang muncul di form order</p>
      </div>

      {methods.map(m => (
        <div key={m.id} className="pm-card">
          <div className="pm-head">
            <div className="pm-logo" style={LOGO_STYLE[m.id] || { background: 'var(--bg-subtle)', color: 'var(--text)' }}>
              {m.name.slice(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="pm-name">{m.name}</div>
              <div className="pm-type">{m.type === 'bank' ? 'Transfer Bank' : 'E-Wallet'}</div>
            </div>
          </div>
          <div className="pm-fields">
            <div className="field">
              <label className="label">{m.type === 'bank' ? 'No. Rekening' : 'Nomor ' + m.name}</label>
              <input className="input" value={m.norek || ''} onChange={e => upd(m.id, 'norek', e.target.value)}
                placeholder={m.type === 'bank' ? '1234567890' : '08xxxxxxxxxx'} />
            </div>
            {m.type === 'bank' && (
              <div className="field">
                <label className="label">Atas Nama</label>
                <input className="input" value={m.atasNama || ''} onChange={e => upd(m.id, 'atasNama', e.target.value)}
                  placeholder="Nama rekening" />
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="save-bar">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Menyimpan…' : saved ? '✓ Tersimpan!' : 'Simpan Perubahan'}
        </button>
        {saved && <span className="save-hint">Info pembayaran berhasil diperbarui</span>}
      </div>
    </>
  );
}

// ── SHARED ─────────────────────────────────────────────────────
function StatCard({ label, val, sub, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-val" style={accent ? { color: accent } : {}}>{val}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
