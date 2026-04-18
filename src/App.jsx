import { useState } from 'react';
import WelcomePage from './pages/WelcomePage';
import InterviewPage from './pages/InterviewPage';
import ThankYouPage from './pages/ThankYouPage';
import ResultsPage from './pages/ResultsPage';
import './App.css';

export default function App() {
  const [view, setView] = useState('welcome');
  const [candidate, setCandidate] = useState(null);
  const [assessment, setAssessment] = useState(null);

  return (
    <div className="app">
      {view === 'welcome'  && <WelcomePage onStart={c => { setCandidate(c); setView('interview'); }} />}
      {view === 'interview' && <InterviewPage candidate={candidate} onComplete={(a, c) => { setAssessment(a); setCandidate(c); setView('thankyou'); }} />}
      {view === 'thankyou' && <ThankYouPage candidate={candidate} onViewResults={() => setView('results')} />}
      {view === 'results'  && <ResultsPage assessment={assessment} candidate={candidate} onRestart={() => { setView('welcome'); setCandidate(null); setAssessment(null); }} />}
    </div>
  );
}
