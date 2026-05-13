/* global React, ReactDOM, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakColor, TweakToggle,
   StepIdentity, StepScope, StepTechDesign, StepTimeline, StepSummary, StepPayment, SuccessScreen,
   calcTotal, fmtRp */
const { useState, useEffect } = React;

// ⚠️ Ganti dengan URL Apps Script lo setelah deploy
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwyW8N7sdclBS5KSJXThUM7z2SnO0LJkCIiB-fuidRvMQ_ZqQ4B9upWxyl8efT0bZfmeA/exec';

const DEFAULT_PRICING = {
  master: 75000, transaksi: 100000, laporan: 50000, dashboard: 150000,
  attr: 10000, designCustom: 15000, designDev: 175000,
};

const DEFAULT_PAYMENT_METHODS = [
  { id: 'bca',       name: 'BCA',                norek: '—', atasNama: '—', type: 'bank'    },
  { id: 'blu',       name: 'Blu by BCA Digital', norek: '—', atasNama: '—', type: 'bank'    },
  { id: 'dana',      name: 'Dana',               norek: '—', type: 'ewallet' },
  { id: 'shopeepay', name: 'ShopeePay',          norek: '—', type: 'ewallet' },
];

const STEPS = [
  { id: 'identity', label: 'Data Diri' },
  { id: 'scope',    label: 'Scope'     },
  { id: 'tech',     label: 'Tech & Desain' },
  { id: 'timeline', label: 'Timeline'  },
  { id: 'summary',  label: 'Ringkasan' },
  { id: 'payment',  label: 'Pembayaran'},
];

const INITIAL_FORM = {
  name: '', wa: '', email: '',
  counts: { master: 0, transaksi: 0, laporan: 0, dashboard: 0 },
  items:  { master: [], transaksi: [], laporan: [], dashboard: [] },
  tech: [], designMode: 'default', palette: '', customColor: '',
  deadline: '', notes: '', paymentMethod: '', proof: null,
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "primaryColor": "#5B3FE5",
  "fontPair": "jakarta",
  "showEstimate": true
}/*EDITMODE-END*/;

function App() {
  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState(INITIAL_FORM);
  const [errors, setErrors]     = useState({});
  const [done, setDone]         = useState(false);
  const [t, setTweak]           = useTweaks(TWEAK_DEFAULTS);
  const [pricing, setPricing]   = useState(DEFAULT_PRICING);
  const [payMethods, setPayMethods] = useState(DEFAULT_PAYMENT_METHODS);
  const [cfgLoaded, setCfgLoaded]   = useState(false);
  const [cfgError, setCfgError]     = useState(false);

  // Fetch dynamic config on mount
  useEffect(() => {
    fetch(APPS_SCRIPT_URL + '?action=getConfig')
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setPricing(data.pricing);
          setPayMethods(data.paymentMethods);
        }
        setCfgLoaded(true);
      })
      .catch(() => {
        setCfgError(true);
        setCfgLoaded(true); // fallback ke default
      });
  }, []);

  useEffect(() => {
    const map = { light: '', cream: 'cream', dark: 'dark' };
    document.documentElement.setAttribute('data-theme', map[t.theme] || '');
  }, [t.theme]);

  useEffect(() => {
    if (t.theme === 'light' && t.primaryColor) {
      document.documentElement.style.setProperty('--primary', t.primaryColor);
      document.documentElement.style.setProperty('--primary-hover', adjust(t.primaryColor, -15));
      document.documentElement.style.setProperty('--primary-soft', hexToRgba(t.primaryColor, 0.12));
    } else {
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-hover');
      document.documentElement.style.removeProperty('--primary-soft');
    }
  }, [t.primaryColor, t.theme]);

  useEffect(() => {
    const fontMap = {
      jakarta: "'Plus Jakarta Sans', sans-serif",
      inter:   "'Inter', sans-serif",
      manrope: "'Manrope', sans-serif",
    };
    document.documentElement.style.setProperty('--font-sans', fontMap[t.fontPair] || fontMap.jakarta);
  }, [t.fontPair]);

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = true;
      if (!form.wa || form.wa.length < 9) e.wa = true;
    }
    if (s === 1) {
      if (Object.values(form.counts).reduce((a, b) => a + b, 0) === 0) e.scope = true;
    }
    if (s === 2) {
      if (form.tech.length === 0) e.tech = true;
    }
    if (s === 3) {
      // deadline opsional, tidak divalidasi
    }
    if (s === 5) {
      if (!form.paymentMethod) e.paymentMethod = true;
      if (!form.proof)         e.proof         = true;
    }
    return e;
  };

  const next = () => {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (step === STEPS.length - 1) { submitForm(); return; }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => {
    setErrors({});
    setStep(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => { setForm(INITIAL_FORM); setStep(0); setDone(false); setErrors({}); };

  const submitForm = () => {
    const { total, dp } = calcTotal(form, pricing);

    const proofData = form.proof ? {
      base64:   form.proof.base64,
      name:     form.proof.name,
      mimeType: form.proof.type,
    } : null;

    const payload = {
      name: form.name, wa: form.wa, email: form.email,
      scope: { counts: form.counts, items: form.items },
      tech: form.tech,
      designMode: form.designMode,
      designColor: form.designMode === 'custom'
        ? (form.palette || form.customColor)
        : (form.designMode === 'developer' ? 'Developer picks' : ''),
      deadline: form.deadline,
      notes: form.notes,
      paymentMethod: form.paymentMethod,
      total, dp,
      proof: proofData,
    };

    fetch(APPS_SCRIPT_URL + '?action=submitOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) setDone(true);
        else alert('Gagal submit: ' + (data.error || 'Unknown error'));
      })
      .catch(() => {
        // Tetap tampilkan success screen walau network error
        // (data sudah ada di form, bisa dicek manual)
        setDone(true);
      });
  };

  const { total } = calcTotal(form, pricing);

  // Loading state
  if (!cfgLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary)', display: 'grid', placeItems: 'center', color: 'white', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16 }}>{'{K}'}</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Memuat form…</p>
      </div>
    );
  }

  if (done) {
    return (
      <>
        <Topbar />
        <div className="main">
          <SuccessScreen form={form} pricing={pricing} onReset={reset} />
        </div>
        <TweaksUI t={t} setTweak={setTweak} />
      </>
    );
  }

  return (
    <div className="app">
      <Topbar />
      <Stepper step={step} />

      <div className="main">
        {step === 0 && <StepIdentity form={form} setForm={setForm} errors={errors} />}
        {step === 1 && <StepScope    form={form} setForm={setForm} errors={errors} pricing={pricing} />}
        {step === 2 && <StepTechDesign form={form} setForm={setForm} errors={errors} pricing={pricing} />}
        {step === 3 && <StepTimeline   form={form} setForm={setForm} errors={errors} />}
        {step === 4 && <StepSummary    form={form} pricing={pricing} />}
        {step === 5 && <StepPayment    form={form} setForm={setForm} errors={errors} pricing={pricing} paymentMethods={payMethods} />}

        <div className="nav-bar">
          <button className="btn btn-ghost" onClick={prev} style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
            ← Kembali
          </button>
          <div className="right">
            <button className="btn btn-primary btn-lg" onClick={next}>
              {step === STEPS.length - 1 ? 'Kirim Pesanan ✓' : step === 4 ? 'Lanjut ke Pembayaran' : 'Lanjut'} →
            </button>
          </div>
        </div>
      </div>

      {t.showEstimate && total > 0 && step < 4 && (
        <div className="estimate-pill">
          <span className="ep-dot" />
          <span style={{ color: 'var(--text-muted)' }}>Estimasi total:</span>
          <span className="ep-val">{fmtRp(total)}</span>
        </div>
      )}

      {total > 0 && step < 4 && (
        <div className="mobile-total">
          <div>
            <div className="label">Estimasi Total</div>
            <div className="val">{fmtRp(total)}</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            DP {fmtRp(total * 0.25)}
          </div>
        </div>
      )}

      <TweaksUI t={t} setTweak={setTweak} />
    </div>
  );
}

function Topbar() {
  return (
    <div className="topbar">
      <div className="logo">
        <div className="logo-mark">{'{K}'}</div>
        Kerjain
      </div>
      <div className="topbar-meta">
        <span>Aman & terenkripsi</span>
        <span className="dot-secure" />
      </div>
    </div>
  );
}

function Stepper({ step }) {
  return (
    <div className="stepper-wrap">
      <div className="stepper">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={'step-item ' + (i === step ? 'active' : i < step ? 'done' : '')}>
              <div className="step-num">{i < step ? '✓' : String(i + 1).padStart(2, '0')}</div>
              <span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={'step-line' + (i < step ? ' done' : '')} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function TweaksUI({ t, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="Tema Visual" />
      <TweakRadio label="Theme" value={t.theme} onChange={v => setTweak('theme', v)}
        options={[{ value: 'light', label: 'Light' }, { value: 'cream', label: 'Cream' }, { value: 'dark', label: 'Dark' }]}
      />
      {t.theme === 'light' && (
        <TweakColor label="Aksen" value={t.primaryColor} onChange={v => setTweak('primaryColor', v)}
          options={['#5B3FE5', '#0891B2', '#16A34A', '#DC2626', '#EA580C']}
        />
      )}
      <TweakSection label="Typography" />
      <TweakRadio label="Font" value={t.fontPair} onChange={v => setTweak('fontPair', v)}
        options={[{ value: 'jakarta', label: 'Jakarta' }, { value: 'inter', label: 'Inter' }, { value: 'manrope', label: 'Manrope' }]}
      />
      <TweakSection label="Tampilan" />
      <TweakToggle label="Pill estimasi total" value={t.showEstimate} onChange={v => setTweak('showEstimate', v)} />
    </TweaksPanel>
  );
}

function hexToRgba(hex, a) {
  const m = hex.replace('#', '');
  return `rgba(${parseInt(m.slice(0,2),16)}, ${parseInt(m.slice(2,4),16)}, ${parseInt(m.slice(4,6),16)}, ${a})`;
}
function adjust(hex, amt) {
  const m = hex.replace('#', '');
  return '#' + [0,2,4].map(i => Math.max(0,Math.min(255, parseInt(m.slice(i,i+2),16)+amt)).toString(16).padStart(2,'0')).join('');
}

(function loadExtraFonts() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(link);
})();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
