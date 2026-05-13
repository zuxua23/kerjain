/* global React */
const { useState, useRef, useEffect } = React;

const fmtRp = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

// Default pricing (fallback kalau API belum load)
const DEFAULT_PRICING = {
  master: 75000, transaksi: 100000, laporan: 50000, dashboard: 150000,
  attr: 10000, designCustom: 15000, designDev: 175000,
};

const CATEGORIES = [
  { key: 'master',    label: 'Master Data',  desc: 'Tabel data utama (user, produk, kategori, dll)', namePh: 'cth: Produk'         },
  { key: 'transaksi', label: 'Transaksi',    desc: 'Modul pencatatan transaksi & alurnya',           namePh: 'cth: Penjualan'      },
  { key: 'laporan',   label: 'Laporan',      desc: 'Output laporan (PDF, Excel, cetak)',             namePh: 'cth: Laporan Harian' },
  { key: 'dashboard', label: 'Dashboard',   desc: 'Visualisasi data, grafik, ringkasan KPI',        namePh: 'cth: Dashboard Admin'},
];

const TECH_GROUPS = [
  { key: 'bahasa', label: 'Bahasa Pemrograman', hint: 'Pilih satu atau lebih', options: [
    { id: 'php',        label: 'PHP'                    },
    { id: 'js',         label: 'JavaScript / TypeScript'},
    { id: 'python',     label: 'Python'                 },
    { id: 'java',       label: 'Java'                   },
    { id: 'dart',       label: 'Dart'                   },
    { id: 'cs',         label: 'C#'                     },
    { id: 'bahasa_dev', label: 'Saran developer', auto: true },
  ]},
  { key: 'fe', label: 'Frontend', hint: 'Framework / library untuk tampilan', options: [
    { id: 'react',       label: 'React'           },
    { id: 'next',        label: 'Next.js'         },
    { id: 'vue',         label: 'Vue / Nuxt'      },
    { id: 'svelte',      label: 'Svelte'          },
    { id: 'flutter',     label: 'Flutter (mobile)'},
    { id: 'html_native', label: 'HTML/CSS/JS Native'},
    { id: 'blade',       label: 'Laravel Blade'   },
    { id: 'fe_dev',      label: 'Saran developer', auto: true },
  ]},
  { key: 'be', label: 'Backend', hint: 'Framework server-side', options: [
    { id: 'laravel',     label: 'Laravel'          },
    { id: 'codeigniter', label: 'CodeIgniter'       },
    { id: 'node',        label: 'Node.js + Express' },
    { id: 'django',      label: 'Django'            },
    { id: 'flask',       label: 'Flask'             },
    { id: 'spring',      label: 'Spring Boot'       },
    { id: 'dotnet',      label: '.NET'              },
    { id: 'be_dev',      label: 'Saran developer', auto: true },
  ]},
  { key: 'db', label: 'Database', hint: 'Tempat data disimpan', options: [
    { id: 'mysql',    label: 'MySQL'      },
    { id: 'pg',       label: 'PostgreSQL' },
    { id: 'sqlite',   label: 'SQLite'     },
    { id: 'mongo',    label: 'MongoDB'    },
    { id: 'firebase', label: 'Firebase'   },
    { id: 'supabase', label: 'Supabase'   },
    { id: 'db_dev',   label: 'Saran developer', auto: true },
  ]},
];

const TECH_FLAT = TECH_GROUPS.flatMap(g => g.options.map(o => ({ ...o, group: g.key, groupLabel: g.label })));

const COLOR_PALETTES = [
  { id: 'corp',   label: 'Corporate Blue', colors: ['#1E3A8A', '#3B82F6', '#DBEAFE'] },
  { id: 'fresh',  label: 'Fresh Green',    colors: ['#15803D', '#22C55E', '#DCFCE7'] },
  { id: 'royal',  label: 'Royal Purple',   colors: ['#5B21B6', '#8B5CF6', '#EDE9FE'] },
  { id: 'sunset', label: 'Sunset Warm',    colors: ['#9A3412', '#F97316', '#FFEDD5'] },
  { id: 'mono',   label: 'Mono Pro',       colors: ['#0A0A0A', '#525252', '#E5E5E5'] },
  { id: 'rose',   label: 'Rose Pink',      colors: ['#9F1239', '#F43F5E', '#FFE4E6'] },
];

// ── STEP 1 — DATA DIRI ─────────────────────────────────────────
function StepIdentity({ form, setForm, errors }) {
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-eyebrow">Step 01 / Data Diri</div>
        <h1 className="step-title">Halo, kenalan dulu yuk</h1>
        <p className="step-subtitle">Biar admin bisa kontak kamu setelah pesanan masuk. Data kamu cuma dipake buat keperluan project ini aja.</p>
      </div>
      <div className="card">
        <div className="field">
          <label className="label">Nama Lengkap</label>
          <input className={'input' + (errors.name ? ' error' : '')} placeholder="cth: Andi Pratama"
            value={form.name} onChange={e => upd('name', e.target.value)} />
          {errors.name && <div className="error-msg">Nama wajib diisi</div>}
        </div>
        <div className="field">
          <label className="label">Nomor WhatsApp <span className="label-hint">— buat koordinasi project</span></label>
          <div className="input-wrap">
            <div className="input-prefix">+62</div>
            <input className={'input has-prefix' + (errors.wa ? ' error' : '')} placeholder="81234567890"
              value={form.wa} onChange={e => upd('wa', e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" />
          </div>
          {errors.wa && <div className="error-msg">Nomor WA tidak valid (min. 9 digit)</div>}
          {!errors.wa && form.wa && <div className="helper">+62{form.wa}</div>}
        </div>
        <div className="field">
          <label className="label">Email <span className="label-hint">— opsional, buat invoice</span></label>
          <input className="input" placeholder="kamu@email.com" type="email"
            value={form.email} onChange={e => upd('email', e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ── STEP 2 — SCOPE ─────────────────────────────────────────────
function StepScope({ form, setForm, errors, pricing = DEFAULT_PRICING }) {
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
    setForm(f => ({
      ...f,
      items: { ...f.items, [key]: f.items[key].map((it, i) => i === idx ? { ...it, ...patch } : it) },
    }));
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-eyebrow">Step 02 / Scope</div>
        <h1 className="step-title">Apa aja yang mau dibikin?</h1>
        <p className="step-subtitle">Pilih jumlah tiap kategori, nanti kamu bisa kasih detailnya. Kalau bingung, centang "Decide for me" — developer yang nentuin.</p>
      </div>
      <div className="card">
        <div className="category-grid">
          {CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.key}
              cat={{ ...cat, price: pricing[cat.key] }}
              count={form.counts[cat.key] || 0}
              items={form.items[cat.key] || []}
              onCount={c => upd(cat.key, c)}
              onUpdItem={(idx, patch) => updItem(cat.key, idx, patch)}
              attrPrice={pricing.attr}
            />
          ))}
        </div>
        {errors.scope && <div className="error-msg" style={{ marginTop: 12 }}>Pilih minimal 1 item dari kategori manapun</div>}
      </div>
    </div>
  );
}

function CategoryCard({ cat, count, items, onCount, onUpdItem, attrPrice = 10000 }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (count > 0 && !open) setOpen(true);
    if (count === 0) setOpen(false);
  }, [count]);

  return (
    <div className={'cat-card' + (count > 0 ? ' active' : '')}>
      <div className="cat-header">
        <div className="cat-info">
          <div className="cat-title">{cat.label}</div>
          <div className="cat-desc">{cat.desc}</div>
          <div className="cat-price">{fmtRp(cat.price)} / item</div>
        </div>
        <div className="stepper-ctrl">
          <button className="step-btn" onClick={() => onCount(count - 1)}>−</button>
          <span className="step-val">{count}</span>
          <button className="step-btn" onClick={() => onCount(count + 1)}>+</button>
        </div>
      </div>

      {open && count > 0 && (
        <div className="cat-items">
          {items.map((item, idx) => (
            <div key={idx} className="cat-item">
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', marginBottom: 6 }}>
                {cat.label} #{idx + 1}
              </div>
              <input className="input" style={{ fontSize: 13 }}
                placeholder={cat.namePh} value={item.name}
                onChange={e => onUpdItem(idx, { name: e.target.value })} />

              <div style={{ marginTop: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={item.decideAttrs}
                    onChange={e => onUpdItem(idx, { decideAttrs: e.target.checked, attrs: [] })} />
                  Developer yang tentuin atributnya
                </label>
              </div>

              {!item.decideAttrs && (
                <div style={{ marginTop: 8 }}>
                  <AttrInput
                    value={item.attrs}
                    onChange={attrs => onUpdItem(idx, { attrs })}
                    price={attrPrice}
                  />
                </div>
              )}

              <textarea className="textarea" style={{ marginTop: 8, fontSize: 13, minHeight: 60 }}
                placeholder="Catatan khusus item ini... (opsional)"
                value={item.notes}
                onChange={e => onUpdItem(idx, { notes: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AttrInput({ value, onChange, price }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (t && !value.includes(t)) { onChange([...value, t]); setDraft(''); }
  };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
        Atribut/field — {fmtRp(price)}/atribut
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input className="input" style={{ fontSize: 13 }} placeholder="Tambah atribut (Enter)"
          value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} />
        <button className="btn btn-ghost" style={{ padding: '8px 14px', flexShrink: 0 }} onClick={add}>+</button>
      </div>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {value.map((a, i) => (
            <span key={i} className="attr-tag">
              {a}
              <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0 0 0 4px', fontSize: 14, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── STEP 3 — TECH & DESAIN ─────────────────────────────────────
function StepTechDesign({ form, setForm, errors, pricing = DEFAULT_PRICING }) {
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleTech = (id) => {
    setForm(f => ({
      ...f,
      tech: f.tech.includes(id) ? f.tech.filter(x => x !== id) : [...f.tech, id],
    }));
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-eyebrow">Step 03 / Tech & Desain</div>
        <h1 className="step-title">Tech stack & tampilan UI</h1>
        <p className="step-subtitle">Pilih teknologi yang kamu mau atau biarkan developer yang milih. Kalau bingung, pilih semua "Saran developer".</p>
      </div>

      <div className="card">
        {TECH_GROUPS.map(g => (
          <div key={g.key} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <label className="label" style={{ marginBottom: 0 }}>{g.label}</label>
              <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{g.hint}</span>
            </div>
            <div className="pill-group">
              {g.options.map(t => (
                <button key={t.id} type="button"
                  className={'pill' + (form.tech.includes(t.id) ? ' selected' : '')}
                  onClick={() => toggleTech(t.id)}
                  style={t.auto ? { borderStyle: form.tech.includes(t.id) ? 'solid' : 'dashed' } : {}}
                >
                  {t.auto && '✦ '}{t.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {errors.tech && <div className="error-msg" style={{ marginTop: 8 }}>Minimal pilih 1 teknologi atau "Saran developer"</div>}
      </div>

      <div className="card">
        <label className="label" style={{ marginBottom: 4 }}>Desain UI</label>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
          Mau tampilan default fungsional, kamu kasih warna sendiri, atau full custom by developer?
        </p>
        <div style={{ display: 'grid', gap: 10 }}>
          {[
            { id: 'default',   title: 'Default Developer',         price: null,                    desc: 'Tampilan standar fungsional. Cocok kalo prioritas fungsi bukan estetika.' },
            { id: 'custom',    title: 'Berwarna — kamu kasih warnanya', price: pricing.designCustom, desc: 'Kamu tentuin palette / warna brand sendiri, developer apply ke UI.' },
            { id: 'developer', title: 'Custom UI by Developer ✨',   price: pricing.designDev,       desc: 'Full custom desain UI — developer yang riset & bikin tampilannya.' },
          ].map(opt => (
            <div key={opt.id}
              className={'radio-card' + (form.designMode === opt.id ? ' selected' : '')}
              onClick={() => upd('designMode', opt.id)}
            >
              <div className="radio-dot" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div className="radio-title">{opt.title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13, color: opt.price ? 'var(--primary)' : 'var(--accent)' }}>
                    {opt.price ? '+' + fmtRp(opt.price) : 'Gratis'}
                  </div>
                </div>
                <div className="radio-desc">{opt.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {form.designMode === 'custom' && (
          <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1.5px dashed var(--border)' }}>
            <label className="label">Request Warna Brand</label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Pilih palette siap pakai, atau tentukan warna manual.
            </p>
            <div className="palette-row">
              {COLOR_PALETTES.map(p => (
                <div key={p.id}
                  className={'palette-card' + (form.palette === p.id ? ' selected' : '')}
                  onClick={() => upd('palette', p.id)} title={p.label}
                >
                  {p.colors.map((c, i) => <div key={i} className="palette-color" style={{ background: c }} />)}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="label">Warna utama (opsional)</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="color" value={form.customColor || '#5B3FE5'}
                  onChange={e => upd('customColor', e.target.value)}
                  style={{ width: 44, height: 44, borderRadius: 12, border: '1.5px solid var(--border)', cursor: 'pointer', background: 'transparent' }} />
                <input className="input" style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
                  value={form.customColor || ''} onChange={e => upd('customColor', e.target.value)}
                  placeholder="#5B3FE5 atau 'biru navy & putih'" />
              </div>
            </div>
          </div>
        )}

        {form.designMode === 'developer' && (
          <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1.5px dashed var(--border)' }}>
            <div style={{ background: 'var(--primary-soft)', border: '1.5px solid color-mix(in oklch, var(--primary) 25%, transparent)', padding: 14, borderRadius: 'var(--radius-md)', fontSize: 13 }}>
              <strong>✨ Developer bakal riset visual yang cocok</strong> berdasarkan jenis aplikasinya. Mood / referensi visual bisa kamu kasih di catatan tambahan (Step 4).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── STEP 4 — TIMELINE ─────────────────────────────────────────
function StepTimeline({ form, setForm, errors }) {
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const today = new Date();
  const minDate       = new Date(today.getTime() + 14 * 86400000).toISOString().split('T')[0];
  const suggestedDate = new Date(today.getTime() + 14 * 86400000).toISOString().split('T')[0];
  const daysUntil     = form.deadline ? Math.max(0, Math.ceil((new Date(form.deadline) - today) / 86400000)) : 0;

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-eyebrow">Step 04 / Timeline & Catatan</div>
        <h1 className="step-title">Kapan harus selesai?</h1>
        <p className="step-subtitle">Tentukan deadline yang realistis. Project urgent (&lt; 7 hari) bisa kena biaya rush, tapi kita diskusiin dulu lewat WA.</p>
      </div>
      <div className="card">
        <div className="field">
          <label className="label">Deadline Pengerjaan <span className="label-hint">— opsional</span></label>
          <input className={'input' + (errors.deadline ? ' error' : '')} type="date"
            min={minDate} value={form.deadline} onChange={e => upd('deadline', e.target.value)} />
          {errors.deadline && <div className="error-msg">Pilih tanggal deadline</div>}
          {!errors.deadline && form.deadline && (
            <div className="helper">
              📅 {daysUntil} hari dari sekarang
              {daysUntil < 7 && daysUntil > 0 && <span style={{ color: 'var(--danger)' }}> · ⚡ rush — perlu konfirmasi</span>}
            </div>
          )}
          {!form.deadline && (
            <div className="helper">Minimal 2 minggu dari sekarang · Kosongkan kalau belum tau</div>
          )}
        </div>
        <div className="field">
          <label className="label">Catatan Tambahan <span className="label-hint">— opsional</span></label>
          <textarea className="textarea"
            placeholder="Ada referensi aplikasi mirip? Punya struktur database existing? Mau pakai hosting tertentu? Tulis aja di sini."
            value={form.notes} onChange={e => upd('notes', e.target.value)} rows={5} />
          <div className="helper">{form.notes.length} / 1000 karakter</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  StepIdentity, StepScope, StepTechDesign, StepTimeline,
  DEFAULT_PRICING, CATEGORIES, TECH_GROUPS, TECH_FLAT, COLOR_PALETTES, fmtRp,
});
