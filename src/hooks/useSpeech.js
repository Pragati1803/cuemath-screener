import { useState, useRef, useCallback } from 'react';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const speak = useCallback((text, onEnd) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Soft, warm, natural settings
    utterance.rate = 0.82;    // slower = more natural, easier to follow
    utterance.pitch = 1.0;    // neutral pitch sounds more human
    utterance.volume = 0.92;  // slightly below max = softer feel

    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      // Priority: warm, natural-sounding female voices
      const preferred = [
        'Samantha',                   // macOS — warm and clear
        'Karen',                      // macOS Australian — soft
        'Moira',                      // macOS Irish — gentle
        'Google UK English Female',   // Chrome — soft British
        'Google US English',          // Chrome fallback
        'Microsoft Jenny Online',     // Windows — very natural
        'Microsoft Aria Online',      // Windows — warm
        'Microsoft Zira',             // Windows fallback
      ];
      let voice = null;
      for (const name of preferred) {
        voice = voices.find(v => v.name.includes(name));
        if (voice) break;
      }
      // Final fallback: any en-US voice
      if (!voice) voice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en'));
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); if (onEnd) onEnd(); };
      utterance.onerror = () => { setIsSpeaking(false); if (onEnd) onEnd(); };
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
    } else {
      doSpeak();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback((onLiveUpdate, onDone) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Please use Google Chrome for voice support.');
      return;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    let accumulated = '';
    let silenceTimer = null;

    const resetSilence = () => {
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => recognition.stop(), 3500);
    };

    recognition.onstart = () => {
      setIsListening(true);
      accumulated = '';
      silenceTimer = setTimeout(() => recognition.stop(), 60000);
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          accumulated += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      onLiveUpdate((accumulated + interim).trim());
      resetSilence();
    };

    recognition.onend = () => {
      clearTimeout(silenceTimer);
      setIsListening(false);
      onDone(accumulated.trim());
    };

    recognition.onerror = (e) => {
      clearTimeout(silenceTimer);
      if (e.error === 'no-speech') return;
      setIsListening(false);
      onDone(accumulated.trim());
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    setIsListening(false);
  }, []);

  return { isListening, isSpeaking, speak, stopSpeaking, startListening, stopListening };
}
