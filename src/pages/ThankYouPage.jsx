export default function ThankYouPage({ candidate, onViewResults }) {
  return (
    <>
      <div className="bg-shapes">
        <div className="shape shape-1"/><div className="shape shape-2"/>
        <div className="shape shape-3"/><div className="shape shape-4"/>
      </div>
      <nav className="topnav">
        <div className="topnav-logo">Cue<span>math</span></div>
        <div className="topnav-badge">Interview Complete</div>
      </nav>
      <div className="thankyou-wrap">
        <div className="thankyou-card">
          <div className="confetti-row">🎉 ⭐ 🎊</div>
          <div className="ty-heading">You did amazing, {candidate?.name?.split(' ')[0]}!</div>
          <div className="ty-sub">
            Your interview with Aria is complete. We loved learning about your passion for teaching Mathematics.
            Our team will review your assessment shortly.
          </div>

          <div className="ty-steps">
            <div className="ty-step">
              <div className="ty-step-icon">📋</div>
              <div>
                <div className="ty-step-title">Application submitted</div>
                <div className="ty-step-desc">Your voice interview has been recorded and assessed by our AI</div>
              </div>
            </div>
            <div className="ty-step">
              <div className="ty-step-icon">🔍</div>
              <div>
                <div className="ty-step-title">Under review</div>
                <div className="ty-step-desc">Our team will review within 2–3 business days</div>
              </div>
            </div>
            <div className="ty-step">
              <div className="ty-step-icon">📬</div>
              <div>
                <div className="ty-step-title">We'll reach out</div>
                <div className="ty-step-desc">If selected, you'll hear from us at {candidate?.email || 'your email'}</div>
              </div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={onViewResults}>
            View Your Assessment Report →
          </button>
        </div>
      </div>
    </>
  );
}
