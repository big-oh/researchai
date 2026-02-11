'use client';

import { useState } from 'react';
import { Sparkles, BookOpen, Hash, FileText, Lightbulb, ChevronDown, ChevronUp, FileType } from 'lucide-react';
import { PaperFormat } from '@/types/paper';

interface ResearchFormProps {
  onSubmit: (topic: string, wordCount: number, format: PaperFormat) => void;
  loading: boolean;
}

const suggestedTopics = [
  'Machine Learning in Healthcare',
  'Blockchain Technology Applications',
  'Renewable Energy Solutions',
  'Cybersecurity in IoT',
  'Quantum Computing Advances',
];

const formats: { value: PaperFormat; label: string; description: string }[] = [
  { value: 'ieee', label: 'IEEE', description: 'Institute of Electrical and Electronics Engineers' },
  { value: 'apa', label: 'APA', description: 'American Psychological Association' },
  { value: 'mla', label: 'MLA', description: 'Modern Language Association' },
  { value: 'chicago', label: 'Chicago', description: 'Chicago Manual of Style' },
  { value: 'harvard', label: 'Harvard', description: 'Harvard Referencing Style' },
];

export default function ResearchForm({ onSubmit, loading }: ResearchFormProps) {
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState(2000);
  const [format, setFormat] = useState<PaperFormat>('ieee');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim(), wordCount, format);
    }
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(e.target.value);
    setCharCount(e.target.value.length);
  };

  const selectSuggestion = (suggestion: string) => {
    setTopic(suggestion);
    setCharCount(suggestion.length);
    setShowSuggestions(false);
  };

  // Calculate progress bar width for word count
  const wordCountProgress = ((wordCount - 500) / (10000 - 500)) * 100;

  return (
    <div className="surface-card rounded-2xl p-8">
      {/* Form Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-12 h-12 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-indigo)] to-[var(--accent-purple)]" />
          <div className="absolute inset-[2px] bg-[var(--bg-primary)] rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[var(--accent-indigo-light)]" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">New Research Paper</h2>
          <p className="text-[var(--text-tertiary)] text-sm">Fill in the details to generate</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent-indigo-light)]" />
              Research Topic
            </div>
          </label>
          
          <div className={`relative transition-all duration-300 ${focusedField === 'topic' ? 'scale-[1.02]' : ''}`}>
            <textarea
              value={topic}
              onChange={handleTopicChange}
              onFocus={() => setFocusedField('topic')}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g., Impact of Artificial Intelligence on Healthcare Delivery Systems"
              className="input h-36 resize-none"
              maxLength={500}
              required
            />
            
            {/* Character Counter */}
            <div className="absolute bottom-3 right-3 text-xs text-[var(--text-tertiary)]">
              {charCount}/500
            </div>

            {/* Focus Glow */}
            <div 
              className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 ${
                focusedField === 'topic' ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                boxShadow: '0 0 30px rgba(99, 102, 241, 0.15)',
              }}
            />
          </div>

          {/* Suggestions Toggle */}
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center gap-2 mt-3 text-sm text-[var(--accent-indigo-light)] hover:text-[var(--accent-indigo)] transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Suggested Topics</span>
            {showSuggestions ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* Suggestions Panel */}
          <div 
            className={`overflow-hidden transition-all duration-300 ${
              showSuggestions ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm hover:bg-[var(--accent-indigo)]/10 hover:text-[var(--accent-indigo-light)] transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Word Count Slider */}
        <div className="relative">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[var(--accent-cyan-light)]" />
                Word Count
              </div>
              <span className="text-[var(--accent-cyan-light)] font-bold text-xl">
                {wordCount.toLocaleString()}
              </span>
            </div>
          </label>

          {/* Custom Slider Container */}
          <div className="relative pt-2">
            {/* Progress Bar Background */}
            <div className="absolute top-4 left-0 right-0 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-indigo)] transition-all duration-300"
                style={{ width: `${wordCountProgress}%` }}
              />
            </div>

            {/* Range Input */}
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="relative w-full h-2 bg-transparent rounded-full appearance-none cursor-pointer z-10 slider-thumb"
              style={{
                WebkitAppearance: 'none',
              }}
            />

            {/* Tick Marks */}
            <div className="flex justify-between mt-2 text-xs text-[var(--text-tertiary)]">
              <span>500</span>
              <span>2.5K</span>
              <span>5K</span>
              <span>7.5K</span>
              <span>10K</span>
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
            <div className="flex items-center gap-2">
              <FileType className="w-4 h-4 text-[var(--accent-purple-light)]" />
              Paper Format
            </div>
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {formats.map((fmt) => (
              <button
                key={fmt.value}
                type="button"
                onClick={() => setFormat(fmt.value)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                  format === fmt.value
                    ? 'bg-[var(--accent-indigo)]/10 border-[var(--accent-indigo)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                }`}
              >
                <div className="font-semibold text-sm">{fmt.label}</div>
                <div className="text-xs opacity-70 mt-0.5 truncate">{fmt.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="btn btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none group"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Paper...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              <span>Generate Paper</span>
            </>
          )}
        </button>

        {/* AI Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-tertiary)] pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
          <span>Powered by Gemini 2.5 Pro</span>
          <span className="text-[var(--border-default)]">•</span>
          <span>~30s generation time</span>
        </div>
      </form>

      {/* Custom CSS for Slider */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo));
          cursor: pointer;
          border: 3px solid var(--bg-primary);
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.5);
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo));
          cursor: pointer;
          border: 3px solid var(--bg-primary);
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.4);
        }
      `}</style>
    </div>
  );
}
