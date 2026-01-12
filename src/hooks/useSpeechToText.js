import { useState, useEffect, useRef } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

export function useSpeechToText(language = 'en-US') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      // We start from the event.resultIndex to avoid processing old results again
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      // Append the new final transcript to the previous state
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript + ' ');
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      // Update language if it has changed
      recognitionRef.current.lang = language;
      // We still clear here to ensure a fresh start for each distinct "mic on" click
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSpeechRecognitionSupported,
  };
}

// Updated useTextToSpeech hook (no changes needed for multilingual output)
let isAudioContextUnlocked = false;

function tryResumeAudioContext() {
  // Implementation for audio context unlocking
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  // State to hold audio that was blocked by autoplay policy
  const [pendingAudioUrl, setPendingAudioUrl] = useState(null);

  useEffect(() => {
    const unlockAudioAndPlayPending = async () => {
      await tryResumeAudioContext();
      isAudioContextUnlocked = true;

      // If there is a pending audio URL, try to play it now
      if (pendingAudioUrl) {
        // Clear the pending URL before playing to avoid loops
        const urlToPlay = pendingAudioUrl;
        setPendingAudioUrl(null); 
        playSpeech(urlToPlay);
      }
      
      // Clean up listeners after the first successful interaction
      window.removeEventListener('click', unlockAudioAndPlayPending);
      window.removeEventListener('keydown', unlockAudioAndPlayPending);
      window.removeEventListener('touchstart', unlockAudioAndPlayPending);
    };

    // If the context is not yet unlocked, add the listeners
    if (!isAudioContextUnlocked) {
      window.addEventListener('click', unlockAudioAndPlayPending, { once: true });
      window.addEventListener('keydown', unlockAudioAndPlayPending, { once: true });
      window.addEventListener('touchstart', unlockAudioAndPlayPending, { once: true });
    }

    // Return a cleanup function
    return () => {
      window.removeEventListener('click', unlockAudioAndPlayPending);
      window.removeEventListener('keydown', unlockAudioAndPlayPending);
      window.removeEventListener('touchstart', unlockAudioAndPlayPending);
    };
  }, [pendingAudioUrl]); // Rerun this effect if a pending URL is set

  const playSpeech = async (audioUrl) => {
    if (!audioUrl) {
      console.error("No audio URL provided.");
      return;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    audio.onended = () => {
      setIsSpeaking(false);
      audioRef.current = null;
    };
    
    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      setIsSpeaking(false);
      audioRef.current = null;
    };

    try {
      await audio.play();
      setIsSpeaking(true);
    } catch (error) {
      // Check if the error is the specific autoplay block error
      if (error.name === 'NotAllowedError') {
        console.warn('Playback blocked by browser. It will start after the first user interaction.');
        
        setPendingAudioUrl(audioUrl);
      } else {
        console.error("Error playing speech:", error);
      }
      // Do NOT set isSpeaking(true) if it fails
      setIsSpeaking(false);
    }
  };

  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // If user stops a pending audio, clear it as well
    if (pendingAudioUrl) {
      setPendingAudioUrl(null);
    }
    setIsSpeaking(false);
  };

  return { playSpeech, stopSpeech, isSpeaking };
}