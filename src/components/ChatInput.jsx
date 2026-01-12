import { useState, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

import { useSpeechToText } from '../hooks/useSpeechToText';

export function ChatInput({ onSendMessage, disabled, selectedLanguage }) {
  const [input, setInput] = useState('');
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSpeechRecognitionSupported
  } = useSpeechToText(selectedLanguage);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      resetTranscript();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (newValue === '') {
      resetTranscript();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-200">
      <div className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={isListening ? "Listening..." : (disabled ? "Waiting for response..." : "Find me a product...")}
          className="bg-gray-100 w-full py-3 pl-5 pr-20 text-sm text-gray-800 placeholder-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent"
          disabled={disabled}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {isSpeechRecognitionSupported && (
            <motion.button
              type="button"
              onClick={handleMicClick}
              className={`relative p-2 rounded-full transition-colors 
              ${isListening ? 'text-white bg-green-600 shadow-lg shadow-red-400/50' : 'text-gray-600 hover:bg-gray-200'}`}
              disabled={disabled}
              animate={isListening ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={isListening ? { repeat: Infinity, duration: 1.2 } : {}}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </motion.button>

          )}
          <button
            type="submit"
            className="ml-1 p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white disabled:bg-indigo-300"
            disabled={disabled || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </form>
  );
}
