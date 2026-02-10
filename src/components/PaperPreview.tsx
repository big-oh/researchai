'use client';

import { ResearchPaper } from '@/types/paper';
import { useState } from 'react';
import { 
  Download, 
  FileText, 
  Copy, 
  Check, 
  Eye, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  X,
  FileDown,
  Share2
} from 'lucide-react';

interface PaperPreviewProps {
  paper: ResearchPaper;
}

interface PlagiarismResult {
  score: number;
  status: 'low' | 'medium' | 'high';
  matches: Array<{
    text: string;
    similarity: number;
  }>;
  suggestions: string[];
}

export default function PaperPreview({ paper }: PaperPreviewProps) {
  const [exporting, setExporting] = useState<'html' | 'docx' | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
  const [showPlagiarismPanel, setShowPlagiarismPanel] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const exportPaper = async (format: 'html' | 'docx') => {
    setExporting(format);
    
    try {
      const response = await fetch('/api/research/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper, format }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research-paper.${format === 'html' ? 'html' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const checkPlagiarism = async () => {
    setCheckingPlagiarism(true);
    setShowPlagiarismPanel(true);
    
    try {
      const fullText = `${paper.title}\n${paper.abstract}\n${paper.introduction}\n${paper.methodology}\n${paper.results}\n${paper.discussion}\n${paper.conclusion}`;
      
      const response = await fetch('/api/plagiarism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText }),
      });

      if (!response.ok) throw new Error('Check failed');

      const result = await response.json();
      setPlagiarismResult(result);
    } catch (error) {
      alert('Plagiarism check failed. Please try again.');
    } finally {
      setCheckingPlagiarism(false);
    }
  };

  const copyToClipboard = () => {
    const text = `${paper.title}\n\nAbstract:\n${paper.abstract}\n\nKeywords: ${paper.keywords.join(', ')}\n\nIntroduction:\n${paper.introduction}\n\nMethodology:\n${paper.methodology}\n\nResults:\n${paper.results}\n\nDiscussion:\n${paper.discussion}\n\nConclusion:\n${paper.conclusion}\n\nReferences:\n${paper.references.map((r, i) => `[${i+1}] ${r}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[var(--success)]';
    if (score >= 70) return 'text-[var(--warning)]';
    return 'text-[var(--error)]';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-[var(--success)]/10 border-[var(--success)]/20';
    if (score >= 70) return 'bg-[var(--warning)]/10 border-[var(--warning)]/20';
    return 'bg-[var(--error)]/10 border-[var(--error)]/20';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="w-6 h-6 text-[var(--success)]" />;
    if (score >= 70) return <AlertTriangle className="w-6 h-6 text-[var(--warning)]" />;
    return <AlertTriangle className="w-6 h-6 text-[var(--error)]" />;
  };

  return (
    <div className="surface-glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-default)] flex items-center justify-between flex-wrap gap-3 bg-[var(--bg-tertiary)]/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-indigo)]/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-[var(--accent-indigo-light)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">Paper Preview</h3>
            <p className="text-[var(--text-tertiary)] text-xs">{paper.wordCount.toLocaleString()} words</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Plagiarism Check Button */}
          <button
            onClick={checkPlagiarism}
            disabled={checkingPlagiarism}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 border ${
              plagiarismResult?.score && plagiarismResult.score >= 85
                ? 'bg-[var(--success)]/10 hover:bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/20'
                : plagiarismResult?.score && plagiarismResult.score >= 70
                ? 'bg-[var(--warning)]/10 hover:bg-[var(--warning)]/20 text-[var(--warning)] border-[var(--warning)]/20'
                : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-default)]'
            }`}
          >
            {checkingPlagiarism ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Checking...
              </>
            ) : plagiarismResult ? (
              <>
                <Shield className="w-4 h-4" />
                {plagiarismResult.score}% Original
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Check Originality
              </>
            )}
          </button>

          <div className="h-6 w-px bg-[var(--border-default)] mx-1" />

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-5 h-5 text-[var(--success)]" /> : <Copy className="w-5 h-5" />}
          </button>

          {/* Share Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
            
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 surface-elevated rounded-xl p-2 z-50 animate-scale-in">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm transition-colors">
                  Share via Email
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm transition-colors">
                  Copy Link
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm transition-colors">
                  Export as PDF
                </button>
              </div>
            )}
          </div>
          
          {/* Export Buttons */}
          <button
            onClick={() => exportPaper('html')}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-indigo)]/10 hover:bg-[var(--accent-indigo)]/20 text-[var(--accent-indigo-light)] text-sm font-medium transition-all disabled:opacity-50 border border-[var(--accent-indigo)]/20"
          >
            <FileDown className="w-4 h-4" />
            {exporting === 'html' ? 'Exporting...' : 'HTML'}
          </button>
          
          <button
            onClick={() => exportPaper('docx')}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-purple)]/10 hover:bg-[var(--accent-purple)]/20 text-[var(--accent-purple-light)] text-sm font-medium transition-all disabled:opacity-50 border border-[var(--accent-purple)]/20"
          >
            <FileText className="w-4 h-4" />
            {exporting === 'docx' ? 'Exporting...' : 'DOCX'}
          </button>
        </div>
      </div>

      {/* Plagiarism Result Panel */}
      {showPlagiarismPanel && plagiarismResult && (
        <div className={`border-b border-[var(--border-default)] p-5 ${getScoreBg(plagiarismResult.score)}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              plagiarismResult.score >= 85 ? 'bg-[var(--success)]/20' : 
              plagiarismResult.score >= 70 ? 'bg-[var(--warning)]/20' : 'bg-[var(--error)]/20'
            }`}>
              {getScoreIcon(plagiarismResult.score)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-[var(--text-primary)]">Originality Score</h4>
                  <span className={`text-2xl font-bold ${getScoreColor(plagiarismResult.score)}`}>
                    {plagiarismResult.score}%
                  </span>
                </div>
                <button 
                  onClick={() => setShowPlagiarismPanel(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-[var(--text-secondary)] text-sm mb-4">
                {plagiarismResult.score >= 85 
                  ? 'Your paper shows high originality and is ready for submission.'
                  : plagiarismResult.score >= 70
                  ? 'Your paper shows moderate originality. Consider revising highlighted sections.'
                  : 'Your paper may need significant revisions to improve originality.'}
              </p>

              {/* Suggestions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">Suggestions:</p>
                {plagiarismResult.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-[var(--accent-indigo-light)] mt-1">•</span>
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paper Content */}
      <div className="p-10 max-h-[700px] overflow-y-auto bg-[var(--bg-primary)]/50">
        {/* Paper Header with Glass Effect */}
        <div className="surface-glass p-8 rounded-2xl mb-8">
          <h1 className="ieee-title text-3xl">{paper.title}</h1>
          
          <div className="ieee-abstract text-base">
            <strong className="text-[var(--text-primary)]">Abstract—</strong>
            {paper.abstract}
          </div>
          
          <div className="text-center text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">Keywords: </span>
            {paper.keywords.join(', ')}
          </div>
        </div>

        {/* Paper Sections */}
        <div className="space-y-8">
          <section className="surface-card p-8">
            <h2 className="ieee-heading text-xl flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[var(--accent-indigo)]/10 flex items-center justify-center text-sm text-[var(--accent-indigo-light)]">I</span>
              Introduction
            </h2>
            <p className="ieee-content">{paper.introduction}</p>
          </section>

          <section className="surface-card p-8">
            <h2 className="ieee-heading text-xl flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[var(--accent-purple)]/10 flex items-center justify-center text-sm text-[var(--accent-purple-light)]">II</span>
              Methodology
            </h2>
            <p className="ieee-content">{paper.methodology}</p>
          </section>

          <section className="surface-card p-8">
            <h2 className="ieee-heading text-xl flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[var(--accent-cyan)]/10 flex items-center justify-center text-sm text-[var(--accent-cyan-light)]">III</span>
              Results
            </h2>
            <p className="ieee-content">{paper.results}</p>
          </section>

          <section className="surface-card p-8">
            <h2 className="ieee-heading text-xl flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[var(--accent-amber)]/10 flex items-center justify-center text-sm text-[var(--accent-amber)]">IV</span>
              Discussion
            </h2>
            <p className="ieee-content">{paper.discussion}</p>
          </section>

          <section className="surface-card p-8">
            <h2 className="ieee-heading text-xl flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[var(--success)]/10 flex items-center justify-center text-sm text-[var(--success)]">V</span>
              Conclusion
            </h2>
            <p className="ieee-content">{paper.conclusion}</p>
          </section>

          <section className="surface-card p-8">
            <h2 className="ieee-heading text-xl">References</h2>
            <ol className="ieee-references space-y-3">
              {paper.references.map((ref, i) => (
                <li key={i} className="pl-4 border-l border-[var(--border-default)] hover:border-[var(--accent-indigo)]/50 transition-colors">
                  <span className="text-[var(--accent-indigo-light)] font-medium mr-2">[{i + 1}]</span>
                  {ref}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
