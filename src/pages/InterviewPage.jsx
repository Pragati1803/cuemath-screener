import { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { sendMessage, assessInterview } from '../api';

const PHASES = { LOADING: 'loading', SPEAKING: 'speaking', LISTENING: 'listening', PROCESSING: 'processing', DONE: 'done' };

export default function InterviewPage({ candidate, onComplete }) {
  const [phase, setPhase] = useState(PHASES.LOADING);
  const [transcript, setTranscript] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [statusText, setStatusText] = useState('Connecting to Aria…');
  const [liveText, setLiveText] = useState('');
  const [pulseLevel, setPulseLevel] = useState(0);
  const { isListening, isSpeaking, speak, startListening, stopListening } = useSpeech();
  const isInterviewDone = useRef(false);
  const messagesRef = useRef([]);
  const questionCountRef = useRef(0);
  const pulseRef = useRef(null);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    if (isListening) {
      pulseRef.current = setInterval(() => setPulseLevel(Math.random()), 130);
    } else {
      clearInterval(pulseRef.current);
      setPulseLevel(0);
    }
    return () => clearInterval(pulseRef.current);
  }, [isListening]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, liveText]);

  const ariaSpeak = useCallback((text, after) => {
    setPhase(PHASES.SPEAKING);
    setStatusText('Aria is speaking…');
    speak(text, after);
  }, [speak]);

  const processAnswer = useCallback(async (candidateText) => {
    const currentMessages = messagesRef.current;
    const currentCount = questionCountRef.current;

    if (!candidateText?.trim()) {
      setStatusText("Didn't catch that — please try again");
      setTimeout(() => listenToCandidate(), 1500);
      return;
    }

    setPhase(PHASES.PROCESSING);
    setStatusText('Aria is thinking…');
    setLiveText('');

    const userMsg = { role: 'user', content: candidateText };
    const updated = [...currentMessages, userMsg];
    messagesRef.current = updated;
    setTranscript(prev => [...prev, { type: 'candidate', text: candidateText }]);

    try {
      const { reply } = await sendMessage(updated, candidate);
      const assistantMsg = { role: 'assistant', content: reply };
      const final = [...updated, assistantMsg];
      messagesRef.current = final;
      setTranscript(prev => [...prev, { type: 'aria', text: reply }]);

      const newCount = currentCount + 1;
      questionCountRef.current = newCount;
      setQuestionCount(newCount);

      const isDone =
        reply.toLowerCase().includes('interview is complete') ||
        reply.toLowerCase().includes("we'll be in touch") ||
        reply.toLowerCase().includes('best of luck') ||
        reply.toLowerCase().includes('thank you so much') ||
        newCount >= 6;

      if (isDone && !isInterviewDone.current) {
        isInterviewDone.current = true;
        ariaSpeak(reply, async () => {
          setPhase(PHASES.DONE);
          setStatusText('Generating your report…');
          const fullTranscript = final
            .filter((_, i) => i > 0)
            .map(m => `${m.role === 'user' ? candidate.name : 'Aria'}: ${m.content}`)
            .join('\n');
          const assessment = await assessInterview(fullTranscript);
          onComplete(assessment, candidate);
        });
      } else {
        ariaSpeak(reply, () => listenToCandidate());
      }
    } catch (err) {
      setStatusText('Retrying…');
      setTimeout(() => listenToCandidate(), 2000);
    }
  }, [ariaSpeak, candidate, onComplete]);

  const listenToCandidate = useCallback(() => {
    setPhase(PHASES.LISTENING);
    setStatusText('Your turn — speak your answer');
    setLiveText('');
    startListening(
      (live) => setLiveText(live),
      (final) => processAnswer(final)
    );
  }, [startListening, processAnswer]);

  useEffect(() => {
    const init = [{
      role: 'user',
      content: `Hi, my name is ${candidate.name}. I want to teach Mathematics for ${candidate.classLevel || 'various classes'}. Please start the interview warmly.`,
    }];
    (async () => {
      try {
        const { reply } = await sendMessage(init, candidate);
        const msgs = [...init, { role: 'assistant', content: reply }];
        messagesRef.current = msgs;
        setTranscript([{ type: 'aria', text: reply }]);
        ariaSpeak(reply, () => listenToCandidate());
      } catch (err) {
        setStatusText('Connection error: ' + err.message);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusDotClass = { loading: 'idle', speaking: 'speaking', listening: 'listening', processing: 'thinking', done: 'idle' }[phase];
  const statusIcon = { loading: '⏳', speaking: '🔊', listening: '🎙️', processing: '⚙️', done: '✅' }[phase];

  return (
    <>
      <nav className="topnav">
        <div className="topnav-logo">Cue<span>math</span></div>
        <div className="topnav-badge">Live Interview</div>
      </nav>

      <div className="interview-wrap">
        {/* Sidebar */}
        <div className="aria-sidebar">
          <div className={`aria-blob ${isSpeaking ? 'speaking' : ''} ${isListening ? 'listening' : ''}`}>
            {isSpeaking && <><div className="pulse-ring"/><div className="pulse-ring"/><div className="pulse-ring"/></>}
            <div className="aria-blob-inner">A</div>
          </div>
          <div className="aria-name">Aria</div>
          <div className="aria-role">AI Interviewer · Cuemath</div>

          <div className="status-chip">
            <div className={`status-dot ${statusDotClass}`}/>
            <span>{statusText}</span>
          </div>

          {isListening && (
            <div className="mic-bars">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="mic-bar" style={{ height: `${6 + Math.floor(pulseLevel * 32)}px` }} />
              ))}
            </div>
          )}

          <div className="q-progress">
            <div className="q-label">Progress</div>
            <div className="q-bar-track">
              <div className="q-bar-fill" style={{ width: `${Math.min(questionCount / 5 * 100, 100)}%` }} />
            </div>
            <div className="q-dots">
              {[1,2,3,4,5].map(n => (
                <div key={n} className={`q-dot ${questionCount >= n ? 'done' : questionCount === n - 1 ? 'active' : ''}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div className="transcript-area">
          <div className="transcript-topbar">
            Live Transcript
            {isListening && <span className="live-badge">● LIVE</span>}
          </div>

          <div className="transcript-scroll">
            {transcript.map((entry, i) => (
              <div key={i} className={`bubble ${entry.type}`}>
                <div className="bubble-speaker">{entry.type === 'aria' ? 'Aria' : candidate.name}</div>
                <div className="bubble-text">{entry.text}</div>
              </div>
            ))}
            {liveText && isListening && (
              <div className="bubble candidate live">
                <div className="bubble-speaker">{candidate.name} (speaking…)</div>
                <div className="bubble-text">{liveText}<span className="cursor-blink">|</span></div>
              </div>
            )}
            {phase === PHASES.DONE && (
              <div className="bubble system">
                <div className="bubble-text">🎉 Interview complete! Generating your assessment report…</div>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>

          {isListening && (
            <button className="done-speaking-btn" onClick={stopListening}>
              ✓ Done Speaking
            </button>
          )}
        </div>
      </div>
    </>
  );
}
