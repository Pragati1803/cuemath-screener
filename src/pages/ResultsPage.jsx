const DIMS = {
  clarity:           { label: 'Communication Clarity', emoji: '💬' },
  warmth:            { label: 'Warmth & Patience',      emoji: '❤️' },
  simplification:    { label: 'Ability to Simplify',    emoji: '🧩' },
  fluency:           { label: 'English Fluency',        emoji: '🗣️' },
  handling_confusion:{ label: 'Handling Confusion',     emoji: '🧘' },
};

function ScorePips({ score }) {
  return (
    <div className="score-pip-row">
      {[1,2,3,4,5].map(n => (
        <div key={n} className={`score-pip ${n <= score ? 'filled' : ''}`} />
      ))}
      <span className="score-num-sm">{score}/5</span>
    </div>
  );
}

export default function ResultsPage({ assessment, candidate, onRestart }) {
  const { dimensions, recommendation, summary } = assessment;
  const overall = Math.round(Object.values(dimensions).reduce((s, d) => s + d.score, 0) / 5);

  return (
    <>
      <nav className="topnav">
        <div className="topnav-logo">Cue<span>math</span></div>
        <div className="topnav-badge">Assessment Report</div>
      </nav>

      <div className="results-wrap">
        <div className="results-inner">
          {/* Header */}
          <div className="results-header">
            <div>
              <div className="results-title">Assessment Report</div>
              <div className="results-sub">{candidate.name} · Mathematics · {candidate.classLevel || ''}</div>
            </div>
            <div className={`rec-pill ${recommendation}`}>{recommendation}</div>
          </div>

          {/* Summary banner */}
          <div className="summary-banner">
            <div className="overall-score">
              <div className="score-big">{overall}</div>
              <div className="score-denom">/5</div>
              <div className="score-lbl">Overall</div>
            </div>
            <div className="summary-text">{summary}</div>
          </div>

          {/* Dimension cards */}
          <div className="dim-grid">
            {Object.entries(dimensions).map(([key, data]) => {
              const dim = DIMS[key] || { label: key, emoji: '📊' };
              return (
                <div key={key} className="dim-card">
                  <div className="dim-top">
                    <span className="dim-emoji">{dim.emoji}</span>
                    <span className="dim-name">{dim.label}</span>
                  </div>
                  <ScorePips score={data.score} />
                  <div className="dim-just">{data.justification}</div>
                  {data.quote && (
                    <div className="dim-quote">"{data.quote}"</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Candidate info summary */}
          <div style={{ background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Board', value: candidate.board },
              { label: 'Class Level', value: candidate.classLevel },
              { label: 'Languages', value: candidate.languages?.join(', ') },
              { label: 'Expected Rate', value: candidate.rate ? `₹${Number(candidate.rate).toLocaleString('en-IN')}/month` : '—' },
              { label: 'Experience', value: candidate.experience },
            ].map(({ label, value }) => value ? (
              <div key={label}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)' }}>{value}</div>
              </div>
            ) : null)}
          </div>

          <div className="results-actions">
            <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '0.85rem 2rem' }} onClick={onRestart}>
              Start New Interview
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
