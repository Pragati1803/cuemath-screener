import { useState } from 'react';

const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'];
const CLASSES = ['Class 1–3', 'Class 4–5', 'Class 6–8', 'Class 9–10', 'Class 11–12', 'All Levels'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati'];

export default function WelcomePage({ onStart }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    classLevel: '', board: '',
    languages: [],
    rate: '',
    experience: '',
    consent: false,
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const toggleLang = (lang) => {
    set('languages', form.languages.includes(lang)
      ? form.languages.filter(l => l !== lang)
      : [...form.languages, lang]);
  };

  const step1Valid = form.name.trim() && form.email.trim() && form.phone.trim();
  const step2Valid = form.classLevel && form.board && form.languages.length > 0;
  const step3Valid = form.rate.trim() && form.consent;

  return (
    <>
      <div className="bg-shapes">
        <div className="shape shape-1"/><div className="shape shape-2"/>
        <div className="shape shape-3"/><div className="shape shape-4"/>
      </div>

      <nav className="topnav">
        <div className="topnav-logo">Cue<span>math</span></div>
        <div className="topnav-badge">Tutor Interview</div>
      </nav>

      <div className="page-wrap" style={{ paddingTop: '5rem' }}>
        {/* Step dots */}
        <div className="step-indicator" style={{ marginBottom: '1.5rem' }}>
          {[1,2,3].map((s, i) => (
            <span key={s} style={{ display: 'contents' }}>
              <div className={`step-dot ${step === s ? 'active' : step > s ? 'done' : ''}`}>
                {step > s ? '✓' : s}
              </div>
              {i < 2 && <div className={`step-line ${step > s ? 'done' : ''}`}/>}
            </span>
          ))}
        </div>

        <div className="card">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="emoji-heading">👋</div>
              <div className="form-heading">Let's get started!</div>
              <div className="form-sub">Tell us a bit about yourself. This takes less than 2 minutes.</div>

              <div className="field">
                <label>Full name</label>
                <input placeholder="e.g. Priya Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="field">
                <label>Email address</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="field">
                <label>Phone number</label>
                <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="field">
                <label>Years of teaching experience</label>
                <select value={form.experience} onChange={e => set('experience', e.target.value)}>
                  <option value="">Select experience</option>
                  <option>Fresher (0 years)</option>
                  <option>1–2 years</option>
                  <option>3–5 years</option>
                  <option>5–10 years</option>
                  <option>10+ years</option>
                </select>
              </div>

              <button className="btn btn-primary" disabled={!step1Valid} onClick={() => setStep(2)}>
                Next — Teaching Preferences →
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="emoji-heading">📚</div>
              <div className="form-heading">Teaching preferences</div>
              <div className="form-sub">We'll match you with the right students. You're applying to teach <strong>Mathematics</strong>.</div>

              <div className="field-row">
                <div className="field">
                  <label>Class you want to teach</label>
                  <select value={form.classLevel} onChange={e => set('classLevel', e.target.value)}>
                    <option value="">Select class</option>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Preferred board</label>
                  <select value={form.board} onChange={e => set('board', e.target.value)}>
                    <option value="">Select board</option>
                    {BOARDS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Languages you can teach in</label>
                <div className="lang-grid">
                  {LANGUAGES.map(lang => (
                    <label key={lang} className={`lang-chip ${form.languages.includes(lang) ? 'selected' : ''}`}>
                      <input type="checkbox" checked={form.languages.includes(lang)} onChange={() => toggleLang(lang)} />
                      {form.languages.includes(lang) ? '✓ ' : ''}{lang}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2 }} disabled={!step2Valid} onClick={() => setStep(3)}>
                  Next — Rate & Consent →
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div className="emoji-heading">💰</div>
              <div className="form-heading">Almost there!</div>
              <div className="form-sub">Just your expected rate and consent, then we'll start the interview.</div>

              <div className="field">
                <label>Expected monthly rate (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={form.rate}
                  onChange={e => set('rate', e.target.value)}
                  style={{ fontSize: '1.1rem' }}
                />
              </div>

              <div style={{ background: 'var(--yellow-pale)', border: '2px solid var(--yellow)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', lineHeight: 1.6 }}>
                🎙 <strong>About the interview:</strong> Aria, our AI interviewer, will ask you 5 math teaching questions via voice. Speak naturally — we're looking for your teaching personality, not textbook answers. Use <strong>Google Chrome</strong> for best results.
              </div>

              <label className="consent-box">
                <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)} />
                <span>I consent to this voice interview being recorded and assessed by Cuemath for hiring purposes.</span>
              </label>

              <div className="browser-warn">
                ⚠️ Please use Google Chrome — mic access required
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2 }} disabled={!step3Valid} onClick={() => onStart(form)}>
                  🎙 Start Interview
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
