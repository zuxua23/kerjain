/* global React */
const { useState, useRef, useEffect } = React;

// ============================================
// SHARED HELPERS
// ============================================
const fmtRp = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

const PRICING = {
  master: 75000,
  transaksi: 100000,
  laporan: 50000,
  dashboard: 150000,
  attr: 10000,         // per atribut
  designCustom: 15000, // berwarna dari customer
  designDev: 175000,   // full custom UI dari developer
};

const CATEGORIES = [
  { key: 'master', label: 'Master Data', desc: 'Tabel data utama (user, produk, kategori, dll)', price: PRICING.master, namePh: 'cth: Produk' },
  { key: 'transaksi', label: 'Transaksi', desc: 'Modul pencatatan transaksi & alurnya', price: PRICING.transaksi, namePh: 'cth: Penjualan' },
  { key: 'laporan', label: 'Laporan', desc: 'Output laporan (PDF, Excel, cetak)', price: PRICING.laporan, namePh: 'cth: Laporan harian' },
  { key: 'dashboard', label: 'Dashboard', desc: 'Visualisasi data, grafik, ringkasan KPI', price: PRICING.dashboard, namePh: 'cth: Dashboard Admin' },
];

const TECH_GROUPS = [
  {
    key: 'bahasa', label: 'Bahasa Pemrograman', hint: 'Pilih satu atau lebih',
    options: [
      { id: 'php', label: 'PHP' },
      { id: 'js', label: 'JavaScript / TypeScript' },
      { id: 'python', label: 'Python' },
      { id: 'java', label: 'Java' },
      { id: 'dart', label: 'Dart' },
      { id: 'cs', label: 'C#' },
      { id: 'bahasa_dev', label: 'Saran developer', auto: true },
    ],
  },
  {
    key: 'fe', label: 'Frontend', hint: 'Framework / library untuk tampilan',
    options: [
      { id: 'react', label: 'React' },
      { id: 'next', label: 'Next.js' },
      { id: 'vue', label: 'Vue / Nuxt' },
      { id: 'svelte', label: 'Svelte' },
      { id: 'flutter', label: 'Flutter (mobile)' },
      { id: 'html_native', label: 'HTML/CSS/JS Native' },
      { id: 'blade', label: 'Laravel Blade' },
      { id: 'fe_dev', label: 'Saran developer', auto: true },
    ],
  },
  {
    key: 'be', label: 'Backend', hint: 'Framework server-side',
    options: [
      { id: 'laravel', label: 'Laravel' },
      { id: 'codeigniter', label: 'CodeIgniter' },
      { id: 'node', label: 'Node.js + Express' },
      { id: 'django', label: 'Django' },
      { id: 'flask', label: 'Flask' },
      { id: 'spring', label: 'Spring Boot' },
      { id: 'dotnet', label: '.NET' },
      { id: 'be_dev', label: 'Saran developer', auto: true },
    ],
  },
  {
    key: 'db', label: 'Database', hint: 'Tempat data disimpan',
    options: [
      { id: 'mysql', label: 'MySQL' },
      { id: 'pg', label: 'PostgreSQL' },
      { id: 'sqlite', label: 'SQLite' },
      { id: 'mongo', label: 'MongoDB' },
      { id: 'firebase', label: 'Firebase' },
      { id: 'supabase', label: 'Supabase' },
      { id: 'db_dev', label: 'Saran developer', auto: true },
    ],
  },
];

// Flat list buat lookup by id (dipake di summary)
const TECH_FLAT = TECH_GROUPS.flatMap(g => g.options.map(o => ({ ...o, group: g.key, groupLabel: g.label })));

const COLOR_PALETTES = [
  { id: 'corp', label: 'Corporate Blue', colors: ['#1E3A8A', '#3B82F6', '#DBEAFE'] },
  { id: 'fresh', label: 'Fresh Green', colors: ['#15803D', '#22C55E', '#DCFCE7'] },
  { id: 'royal', label: 'Royal Purple', colors: ['#5B21B6', '#8B5CF6', '#EDE9FE'] },
  { id: 'sunset', label: 'Sunset Warm', colors: ['#9A3412', '#F97316', '#FFEDD5'] },
  { id: 'mono', label: 'Mono Pro', colors: ['#0A0A0A', '#525252', '#E5E5E5'] },
  { id: 'rose', label: 'Rose Pink', colors: ['#9F1239', '#F43F5E', '#FFE4E6'] },
];

// ============================================
// STEP 1 — DATA DIRI
// ============================================
function StepIdentity({ form, setForm, errors }) {
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-eyebrow">Step 01 / Data Diri</div>
        <h1 className="step-title">Halo, kenalan dulu yuk</h1>
        <p className="step-subtitle">Biar admin bisa kontak kamu setelah pesanan masuk. Datamu cuma kepake buat keperluan project ini aja.</p>
      </div>

      <div className="card">
        <div className="field">
          <label className="label">Nama Lengkap</label>
          <input
            className={'input' + (errors.name ? ' error' : '')}
            placeholder="cth: Andi Pratama"
            value={form.name}
            onChange={e => upd('name', e.target.value)}
          />
          {errors.name && <div className="error-msg">Nama wajib diisi</div>}
        </div>
        <div className="field">
          <label className="label">Nomor WhatsApp <span className="label-hint">— buat koordinasi project</span></label>
          <div className="input-wrap">
            <div className="input-prefix">+62</div>
            <input
              className={'input has-prefix' + (errors.wa ? ' error' : '')}
              placeholder="81234567890"
              value={form.wa}
              onChange={e => upd('wa', e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
            />
          </div>
          {errors.wa && <div className="error-msg">Nomor WA tidak valid (min. 9 digit)</div>}
          {!errors.wa && form.wa && <div className="helper">+62{form.wa}</div>}
        </div>
        <div className="field">
          <label className="label">Email <span className="label-hint">— opsional, buat invoice</span></label>
          <input
            className="input"
            placeholder="kamu@email.com"
            value={form.email}
            onChange={e => upd('email', e.target.value)}
            type="email"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 2 — SCOPE KERJAAN
// ============================================
function StepScope({ form, setForm, errors }) {
  const upd = (key, count) => {
    const c = Math.max(0, Math.min(20, count));
    setForm(f => {
      const items = [...(f.items[key] || [])];
      while (items.length < c) items.push({ name: '', attrs: [], decideAttrs: false, notes: '' });
      while (items.length > c) items.pop();
      return { ...f, counts: { ...f.counts, [key]: c }, items: { ...f.items, [key]: items } };
    });
  };

  const updItem = (key, idx, patch) => {
    setForm(f => {
      const arr = f.items[key].map((it, i) => i === idx ? { ...it, ...patch } : it);
      return { ...f, items: { ...f.items, [key]: arr } };
    });
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-eyebrow">Step 02 / Scope</div>
        <h1 className="step-title">Apa aja yang mau dibikin?</h1>
        <p className="step-subtitle">Pilih jumlah tiap kategori, nanti kamu bisa kasih detailnya. Kalau bingung, centang "Decide for me" — gw yang nentuin.</p>
      </div>

      <div className="card">
        <div className="category-grid">
          {CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.key}
              cat={cat}
              count={form.counts[cat.key] || 0}
              items={form.items[cat.key] || []}
              onCount={(c) => upd(cat.key, c)}
              onUpdItem={(idx, patch) => updItem(cat.key, idx, patch)}
            />
          ))}
        </div>
      </div>

      {errors.scope && (
        <div className="card" style={{ borderColor: 'var(--danger)', background: 'color-mix(in oklch, var(--danger) 6%, var(--bg-card))', marginTop: 12 }}>
          <div style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 14 }}>⚠ Minimal pilih 1 kategori dulu ya</div>
        </div>
      )}
    </div>
  );
}

function CategoryCard({ cat, count, items, onCount, onUpdItem }) {
  return (
    <div className={'category-card' + (count > 0 ? ' active' : '')}>
      <div className="category-head">
        <div className="category-title-block">
          <div className="category-title">{cat.label}</div>
          <div className="category-price">{fmtRp(cat.price)} / item</div>
        </div>
        <div className="counter">
          <button
            className="counter-btn"
            onClick={() => onCount(count - 1)}
            disabled={count <= 0}
            aria-label="kurangi"
          >−</button>
          <div className="counter-val">{count}</div>
          <button
            className="counter-btn"
            onClick={() => onCount(count + 1)}
            aria-label="tambah"
          >+</button>
        </div>
      </div>
      <div className="category-desc">{cat.desc}</div>

      {count > 0 && (
        <div className="subitems-wrap">
          {items.map((it, idx) => (
            <SubItem
              key={idx}
              idx={idx}
              kategori={cat.label}
              item={it}
              namePh={cat.namePh}
              onUpd={(patch) => onUpdItem(idx, patch)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubItem({ idx, kategori, item, namePh, onUpd }) {
  const [attrInput, setAttrInput] = useState('');
  const addAttr = () => {
    const v = attrInput.trim();
    if (!v) return;
    onUpd({ attrs: [...item.attrs, v] });
    setAttrInput('');
  };
  const rmAttr = (i) => onUpd({ attrs: item.attrs.filter((_, ix) => ix !== i) });

  return (
    <div className="subitem">
      <div className="subitem-head">{kategori} #{idx + 1}</div>

      <input
        className="subitem-input"
        placeholder={`Nama ${kategori.toLowerCase()} — ${namePh}`}
        value={item.name}
        onChange={e => onUpd({ name: e.target.value })}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10, marginBottom: 6 }}>
        <div style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          Atribut / Field
          <span style={{ color: 'var(--text-faint)', textTransform: 'none', letterSpacing: 0, fontWeight: 400, marginLeft: 6 }}>
            +{fmtRp(PRICING.attr)}/atribut
          </span>
        </div>
        <div
          className={'decide-toggle' + (item.decideAttrs ? ' active' : '')}
          onClick={() => onUpd({ decideAttrs: !item.decideAttrs })}
          style={{ marginTop: 0, padding: '4px 10px', fontSize: 11 }}
        >
          <span style={{ fontSize: 12 }}>{item.decideAttrs ? '✓' : '○'}</span>
          Biar developer aja
        </div>
      </div>

      {!item.decideAttrs ? (
        <div className="attr-chips">
          {item.attrs.map((a, i) => (
            <span key={i} className="attr-chip">
              {a}
              <button className="attr-chip-remove" onClick={() => rmAttr(i)}>×</button>
            </span>
          ))}
          <input
            className="attr-add-input"
            placeholder={item.attrs.length === 0 ? "+ tambah atribut (cth: nama, harga)" : "+ tambah"}
            value={attrInput}
            onChange={e => setAttrInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addAttr(); } }}
            onBlur={addAttr}
          />
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
          → Developer akan menentukan atribut yang sesuai
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 6 }}>
          Catatan <span style={{ color: 'var(--text-faint)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>— opsional</span>
        </div>
        <textarea
          className="subitem-input"
          style={{ minHeight: 56, resize: 'vertical', lineHeight: 1.4 }}
          placeholder={`Catatan khusus buat ${kategori.toLowerCase()} ini (cth: harus ada export Excel, perlu approval, dll)`}
          value={item.notes || ''}
          onChange={e => onUpd({ notes: e.target.value })}
        />
      </div>
    </div>
  );
}

// ============================================
// STEP 3 — TECH + DESAIN
// ============================================
function StepTechDesign({ form, setForm, errors }) {
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleTech = (id) => {
    setForm(f => ({
      ...f,
      tech: f.tech.includes(id) ? f.tech.filter(x => x !== id) : [...f.tech, id]
    }));
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-eyebrow">Step 03 / Tech & Desain</div>
        <h1 className="step-title">Tech stack & visual</h1>
        <p className="step-subtitle">Pilih bahasa, framework FE/BE, sama database-nya. Kalo bingung, pilih “Saran developer” aja.</p>
      </div>

      <div className="card">
        {TECH_GROUPS.map((g, gi) => (
          <div key={g.key} style={{ marginBottom: gi === TECH_GROUPS.length - 1 ? 0 : 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <label className="label" style={{ marginBottom: 0 }}>{g.label}</label>
              <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{g.hint}</span>
            </div>
            <div className="pill-grid">
              {g.options.map(t => (
                <button
                  key={t.id}
                  className={'pill' + (form.tech.includes(t.id) ? ' selected' : '')}
                  onClick={() => toggleTech(t.id)}
                  type="button"
                  style={t.auto ? { borderStyle: form.tech.includes(t.id) ? 'solid' : 'dashed' } : {}}
                >
                  {t.auto && '✦ '}{t.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {errors.tech && <div className="error-msg" style={{ marginTop: 12 }}>Minimal pilih 1 dari tiap kategori, atau pilih “Saran developer”</div>}
      </div>

      <div className="card">
        <label className="label" style={{ marginBottom: 4 }}>Desain UI</label>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
          Mau tampilan default fungsional, kamu kasih warna sendiri, atau full custom by developer?
        </p>
        <div style={{ display: 'grid', gap: 10 }}>
          <div
            className={'radio-card' + (form.designMode === 'default' ? ' selected' : '')}
            onClick={() => upd('designMode', 'default')}
          >
            <div className="radio-dot" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div className="radio-title">Default Developer</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13, color: 'var(--accent)' }}>Gratis</div>
              </div>
              <div className="radio-desc">Tampilan standar fungsional. Cocok kalo prioritas fungsi, bukan estetika.</div>
            </div>
          </div>

          <div
            className={'radio-card' + (form.designMode === 'custom' ? ' selected' : '')}
            onClick={() => upd('designMode', 'custom')}
          >
            <div className="radio-dot" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div className="radio-title">Berwarna — kamu kasih warnanya</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13, color: 'var(--primary)' }}>+{fmtRp(PRICING.designCustom)}</div>
              </div>
              <div className="radio-desc">Kamu tentuin palette / warna brand sendiri, developer apply ke UI.</div>
            </div>
          </div>

          <div
            className={'radio-card' + (form.designMode === 'developer' ? ' selected' : '')}
            onClick={() => upd('designMode', 'developer')}
          >
            <div className="radio-dot" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div className="radio-title">Custom UI by Developer ✨</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13, color: 'var(--primary)' }}>+{fmtRp(PRICING.designDev)}</div>
              </div>
              <div className="radio-desc">Full custom desain UI — developer yang riset & bikin tampilannya.</div>
            </div>
          </div>
        </div>

        {form.designMode === 'custom' && (
          <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1.5px dashed var(--border)' }}>
            <label className="label">Request Warna Brand</label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Pilih palette siap pakai, atau tentukan warna manual.
            </p>
            <div className="palette-row">
              {COLOR_PALETTES.map(p => (
                <div
                  key={p.id}
                  className={'palette-card' + (form.palette === p.id ? ' selected' : '')}
                  onClick={() => upd('palette', p.id)}
                  title={p.label}
                >
                  {p.colors.map((c, i) => (
                    <div key={i} className="palette-color" style={{ background: c }} />
                  ))}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="label">Warna utama (opsional)</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="color"
                  value={form.customColor || '#5B3FE5'}
                  onChange={e => upd('customColor', e.target.value)}
                  style={{ width: 44, height: 44, borderRadius: 12, border: '1.5px solid var(--border)', cursor: 'pointer', background: 'transparent' }}
                />
                <input
                  className="input"
                  style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
                  value={form.customColor || ''}
                  onChange={e => upd('customColor', e.target.value)}
                  placeholder="#5B3FE5 atau 'biru navy & putih'"
                />
              </div>
            </div>
          </div>
        )}

        {form.designMode === 'developer' && (
          <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1.5px dashed var(--border)' }}>
            <div style={{ background: 'var(--primary-soft)', border: '1.5px solid color-mix(in oklch, var(--primary) 25%, transparent)', padding: 14, borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text)' }}>
              <strong>✨ Developer bakal riset visual yang cocok</strong> berdasarkan jenis aplikasinya. Mood / referensi visual bisa kamu kasih di catatan tambahan (Step 4).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// STEP 4 — TIMELINE + CATATAN
// ============================================
function StepTimeline({ form, setForm, errors }) {
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // calculate min date (tomorrow) and suggested
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date();
  const suggestedDate = new Date(today.getTime() + 14 * 86400000).toISOString().split('T')[0];
  const minDate = new Date(today.getTime() + 86400000).toISOString().split('T')[0];

  const daysUntil = form.deadline ? Math.max(0, Math.ceil((new Date(form.deadline) - today) / 86400000)) : 0;

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-eyebrow">Step 04 / Timeline & Catatan</div>
        <h1 className="step-title">Kapan harus selesai?</h1>
        <p className="step-subtitle">Tentukan deadline yang realistis. Project urgent (&lt; 7 hari) bisa kena biaya rush, tapi kita diskusiin dulu lewat WA.</p>
      </div>

      <div className="card">
        <div className="field">
          <label className="label">Deadline Pengerjaan</label>
          <input
            className={'input' + (errors.deadline ? ' error' : '')}
            type="date"
            min={minDate}
            value={form.deadline}
            onChange={e => upd('deadline', e.target.value)}
          />
          {errors.deadline && <div className="error-msg">Pilih tanggal deadline</div>}
          {!errors.deadline && form.deadline && (
            <div className="helper">
              📅 {daysUntil} hari dari sekarang
              {daysUntil < 7 && daysUntil > 0 && <span style={{ color: 'var(--danger)' }}> · ⚡ rush — perlu konfirmasi</span>}
            </div>
          )}
          {!form.deadline && (
            <div className="helper">Saran: {new Date(suggestedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (~2 minggu)</div>
          )}
        </div>

        <div className="field">
          <label className="label">Catatan Tambahan <span className="label-hint">— opsional</span></label>
          <textarea
            className="textarea"
            placeholder="Ada referensi aplikasi mirip? Punya struktur database existing? Mau pakai hosting tertentu? Tulis aja di sini."
            value={form.notes}
            onChange={e => upd('notes', e.target.value)}
            rows={5}
          />
          <div className="helper">{form.notes.length} / 1000 karakter</div>
        </div>
      </div>
    </div>
  );
}

// Export to window so other files can use them
Object.assign(window, {
  StepIdentity, StepScope, StepTechDesign, StepTimeline,
  PRICING, CATEGORIES, TECH_GROUPS, TECH_FLAT, COLOR_PALETTES, fmtRp,
});
