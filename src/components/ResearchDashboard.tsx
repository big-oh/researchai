'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Loader2,
  History,
  BookOpen,
  Plus
} from 'lucide-react';
import ResearchForm from './ResearchForm';
import PaperPreview from './PaperPreview';
import { ResearchPaper } from '@/types/paper';

interface SavedPaper {
  id: string;
  title: string;
  topic: string;
  word_count: number;
  created_at: string;
}

interface ResearchDashboardProps {
  onBack?: () => void;
}

export default function ResearchDashboard({ onBack }: ResearchDashboardProps) {
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load papers from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('researchai_papers');
    if (stored) {
      try {
        const papers = JSON.parse(stored);
        setSavedPapers(papers);
      } catch {
        console.error('Failed to load papers');
      }
    }
  }, []);

  // Save papers to localStorage
  const savePapers = (papers: SavedPaper[]) => {
    localStorage.setItem('researchai_papers', JSON.stringify(papers));
    setSavedPapers(papers);
  };

  const generateResearch = async (topic: string, wordCount: number) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, wordCount }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate research');
      }

      const data = await response.json();
      setPaper(data.paper);
      
      // Save to local history
      const newPaper: SavedPaper = {
        id: Date.now().toString(),
        title: data.paper.title,
        topic: topic,
        word_count: wordCount,
        created_at: new Date().toISOString(),
      };
      
      const updatedPapers = [newPaper, ...savedPapers].slice(0, 50); // Keep last 50
      savePapers(updatedPapers);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadPaper = async (paperId: string) => {
    // Find in saved papers and regenerate
    const saved = savedPapers.find(p => p.id === paperId);
    if (saved) {
      await generateResearch(saved.topic, saved.word_count);
    }
  };

  const deletePaper = (paperId: string) => {
    const updated = savedPapers.filter(p => p.id !== paperId);
    savePapers(updated);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="h-20 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] sticky top-0 z-30 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-indigo)] via-[var(--accent-purple)] to-[var(--accent-pink)]" />
              <div className="absolute inset-[2px] bg-[var(--bg-primary)] rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[var(--accent-indigo)]" />
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              Research<span className="text-[var(--accent-indigo)]">AI</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-all"
          >
            <History className="w-5 h-5" />
            <span className="hidden sm:inline">History</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-indigo)]/10 border border-[var(--accent-indigo)]/20">
            <Sparkles className="w-4 h-4 text-[var(--accent-indigo-light)]" />
            <span className="text-[var(--accent-indigo-light)] text-sm font-medium">Gemini 2.5 Pro</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* History Sidebar */}
        {showHistory && (
          <aside className="w-80 bg-[var(--bg-secondary)] border-r border-[var(--border-default)] min-h-[calc(100vh-5rem)] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Previous Papers</h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {savedPapers.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No papers yet</p>
                </div>
              ) : (
                savedPapers.map((saved) => (
                  <div
                    key={saved.id}
                    className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] cursor-pointer hover:border-[var(--accent-indigo)]/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div 
                        className="flex-1 min-w-0"
                        onClick={() => loadPaper(saved.id)}
                      >
                        <h4 className="font-medium text-[var(--text-primary)] text-sm truncate">
                          {saved.title}
                        </h4>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">
                          {formatDate(saved.created_at)} • {saved.word_count.toLocaleString()} words
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePaper(saved.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-400 transition-all"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="surface-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-indigo)]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[var(--accent-indigo-light)]" />
                </div>
              </div>
              <p className="text-[var(--text-tertiary)] text-sm mb-1">Papers Generated</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{savedPapers.length}</p>
            </div>

            <div className="surface-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-cyan)]/10 flex items-center justify-center">
                  <History className="w-5 h-5 text-[var(--accent-cyan-light)]" />
                </div>
              </div>
              <p className="text-[var(--text-tertiary)] text-sm mb-1">Words Written</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {savedPapers.reduce((acc, p) => acc + p.word_count, 0).toLocaleString()}
              </p>
            </div>

            <div className="surface-card p-6 hidden md:block">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-purple)]/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[var(--accent-purple-light)]" />
                </div>
              </div>
              <p className="text-[var(--text-tertiary)] text-sm mb-1">Saved</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{savedPapers.length}</p>
            </div>

            <button 
              onClick={() => { setPaper(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="surface-card p-6 flex flex-col items-center justify-center gap-3 hover:border-[var(--accent-indigo)]/50 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-indigo)]/10 flex items-center justify-center group-hover:bg-[var(--accent-indigo)]/20 transition-colors">
                <Plus className="w-6 h-6 text-[var(--accent-indigo-light)]" />
              </div>
              <span className="text-[var(--accent-indigo-light)] font-medium">New Paper</span>
            </button>
          </div>

          {/* Main Workspace */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Panel - Form */}
            <div className="lg:col-span-2">
              <ResearchForm 
                onSubmit={generateResearch} 
                loading={loading} 
              />
              
              {error && (
                <div className="mt-4 p-4 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] animate-fade-in">
                  {error}
                </div>
              )}
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:col-span-3">
              {paper ? (
                <PaperPreview paper={paper} />
              ) : (
                <div className="surface-card rounded-2xl p-16 text-center min-h-[600px] flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--accent-indigo)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center mb-6">
                    {loading ? (
                      <Loader2 className="w-10 h-10 text-[var(--accent-indigo-light)] animate-spin" />
                    ) : (
                      <Sparkles className="w-10 h-10 text-[var(--accent-indigo-light)]" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                    {loading ? 'Generating Your Paper...' : 'Your Paper Will Appear Here'}
                  </h3>
                  <p className="text-[var(--text-secondary)] max-w-sm">
                    {loading 
                      ? 'Our AI is researching and writing your paper. This takes about 30-60 seconds.'
                      : 'Enter your research topic and click Generate to create a publication-ready IEEE paper.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
