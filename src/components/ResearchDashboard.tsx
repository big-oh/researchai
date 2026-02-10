'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  Settings, 
  User, 
  Sparkles, 
  Loader2,
  LayoutDashboard,
  History,
  BookOpen,
  HelpCircle,
  LogOut,
  Plus,
  Search,
  ChevronRight,
  Trash2,
  X
} from 'lucide-react';
import ResearchForm from './ResearchForm';
import PaperPreview from './PaperPreview';
import AuthModal from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { ResearchPaper } from '@/types/paper';

interface SavedPaper {
  id: string;
  title: string;
  topic: string;
  abstract: string;
  keywords: string[];
  introduction: string;
  methodology: string;
  results: string;
  discussion: string;
  conclusion: string;
  references: string[];
  word_count: number;
  created_at: string;
}

interface ResearchDashboardProps {
  onBack?: () => void;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: History, label: 'History', id: 'history' },
  { icon: BookOpen, label: 'Library', id: 'library' },
  { icon: Settings, label: 'Settings', id: 'settings' },
  { icon: HelpCircle, label: 'Help', id: 'help' },
];

export default function ResearchDashboard({ onBack }: ResearchDashboardProps) {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'signin' | 'signup'>('signin');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Paper history states
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [papersLoading, setPapersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);

  // Load saved papers when user is authenticated
  useEffect(() => {
    if (user) {
      loadSavedPapers();
    } else {
      setSavedPapers([]);
    }
  }, [user]);

  const loadSavedPapers = async () => {
    if (!user) return;
    
    setPapersLoading(true);
    try {
      const response = await fetch('/api/papers?limit=50');
      if (response.ok) {
        const data = await response.json();
        setSavedPapers(data.papers || []);
      }
    } catch (err) {
      console.error('Error loading papers:', err);
    } finally {
      setPapersLoading(false);
    }
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
      
      // Refresh saved papers list if user is authenticated
      if (user) {
        loadSavedPapers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadPaper = async (paperId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/papers/${paperId}`);
      if (response.ok) {
        const data = await response.json();
        const savedPaper = data.paper;
        
        // Convert to ResearchPaper format
        const researchPaper: ResearchPaper = {
          title: savedPaper.title,
          abstract: savedPaper.abstract,
          keywords: savedPaper.keywords,
          introduction: savedPaper.introduction,
          methodology: savedPaper.methodology,
          results: savedPaper.results,
          discussion: savedPaper.discussion,
          conclusion: savedPaper.conclusion,
          references: savedPaper.references,
          wordCount: savedPaper.word_count,
        };
        
        setPaper(researchPaper);
        setActiveView('dashboard');
      }
    } catch (err) {
      console.error('Error loading paper:', err);
    }
  };

  const deletePaper = async (paperId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !confirm('Are you sure you want to delete this paper?')) return;
    
    try {
      const response = await fetch(`/api/papers/${paperId}`, { method: 'DELETE' });
      if (response.ok) {
        setSavedPapers(prev => prev.filter(p => p.id !== paperId));
      }
    } catch (err) {
      console.error('Error deleting paper:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setSavedPapers([]);
    setPaper(null);
    setActiveView('dashboard');
    // Redirect to home page
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/';
    }
  };

  const openSignIn = () => {
    setAuthModalView('signin');
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalView('signup');
    setAuthModalOpen(true);
  };

  const filteredPapers = savedPapers.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return '?';
    return user.email.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render paper history sidebar
  const renderHistorySidebar = () => (
    <div className={`fixed inset-y-0 right-0 z-40 w-80 bg-[var(--bg-secondary)] border-l border-[var(--border-default)] transform transition-transform duration-300 ${showHistorySidebar ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-default)]">
          <h3 className="font-semibold text-[var(--text-primary)]">Previous Papers</h3>
          <button 
            onClick={() => setShowHistorySidebar(false)}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[var(--border-default)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-indigo)]"
            />
          </div>
        </div>

        {/* Paper List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {papersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[var(--accent-indigo)] animate-spin" />
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {searchQuery ? 'No papers found' : 'No papers yet'}
              </p>
              {!searchQuery && (
                <p className="text-xs mt-1 text-[var(--text-tertiary)]">
                  Generate your first paper to see it here
                </p>
              )}
            </div>
          ) : (
            filteredPapers.map((savedPaper) => (
              <div
                key={savedPaper.id}
                onClick={() => loadPaper(savedPaper.id)}
                className="group p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] cursor-pointer hover:border-[var(--accent-indigo)]/50 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[var(--text-primary)] text-sm truncate">
                      {savedPaper.title}
                    </h4>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      {formatDate(savedPaper.created_at)} • {savedPaper.word_count.toLocaleString()} words
                    </p>
                  </div>
                  <button
                    onClick={(e) => deletePaper(savedPaper.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[var(--error)]/10 text-[var(--text-tertiary)] hover:text-[var(--error)] transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultView={authModalView}
      />

      {/* History Sidebar */}
      {user && renderHistorySidebar()}

      {/* Backdrop for history sidebar */}
      {showHistorySidebar && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setShowHistorySidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-[var(--bg-secondary)] border-r border-[var(--border-default)] backdrop-blur-xl transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-indigo)] via-[var(--accent-purple)] to-[var(--accent-pink)]" />
              <div className="absolute inset-[2px] bg-[var(--bg-primary)] rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[var(--accent-indigo)]" />
              </div>
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg tracking-tight">
                Research<span className="text-[var(--accent-indigo)]">AI</span>
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeView === item.id
                  ? 'bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo-light)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-default)]">
          {user ? (
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
            </button>
          ) : (
            <button 
              onClick={openSignIn}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo-light)] hover:bg-[var(--accent-indigo)]/20 transition-all duration-200"
            >
              <User className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-sm">Sign In</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="h-20 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-default)] sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-bold text-xl tracking-tight">Research Dashboard</h1>
              <p className="text-[var(--text-tertiary)] text-sm">Generate publication-ready papers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Toggle Sidebar */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>

            {/* History Button (only when logged in) */}
            {user && (
              <button 
                onClick={() => setShowHistorySidebar(true)}
                className="hidden md:flex items-center gap-2 p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-all"
              >
                <History className="w-5 h-5" />
                <span className="text-sm font-medium">History</span>
              </button>
            )}

            {/* AI Badge */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-indigo)]/10 border border-[var(--accent-indigo)]/20">
              <Sparkles className="w-4 h-4 text-[var(--accent-indigo-light)]" />
              <span className="text-[var(--accent-indigo-light)] text-sm font-medium">Gemini 2.5 Pro</span>
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--accent-indigo)] to-[var(--accent-purple)] flex items-center justify-center text-white font-semibold text-sm">
                    {getUserInitials()}
                  </div>
                  <ChevronRight className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 surface-elevated rounded-xl p-2 z-50 animate-fade-in">
                      {/* User Info */}
                      <div className="px-3 py-2 border-b border-[var(--border-default)] mb-2">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {user.user_metadata?.full_name || 'Researcher'}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <button
                        onClick={() => {
                          setActiveView('settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all text-sm"
                      >
                        <User className="w-4 h-4" />
                        My Account
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all text-sm"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>

                      <div className="h-px bg-[var(--border-default)] my-2" />

                      <button
                        onClick={() => {
                          handleSignOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--error)] hover:bg-[var(--error)]/10 transition-all text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={openSignIn}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={openSignUp}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent-indigo)] text-white hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="surface-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-indigo)]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[var(--accent-indigo-light)]" />
                </div>
                <span className="badge-indigo">+12%</span>
              </div>
              <p className="text-[var(--text-tertiary)] text-sm mb-1">Papers Generated</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{savedPapers.length}</p>
            </div>

            <div className="surface-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-cyan)]/10 flex items-center justify-center">
                  <History className="w-5 h-5 text-[var(--accent-cyan-light)]" />
                </div>
                <span className="badge-cyan">This month</span>
              </div>
              <p className="text-[var(--text-tertiary)] text-sm mb-1">Words Written</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {savedPapers.reduce((acc, p) => acc + p.word_count, 0).toLocaleString()}
              </p>
            </div>

            <div className="surface-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-purple)]/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[var(--accent-purple-light)]" />
                </div>
                <span className="badge-purple">Saved</span>
              </div>
              <p className="text-[var(--text-tertiary)] text-sm mb-1">Drafts</p>
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

              {/* Recent Papers List (Mobile/Desktop when no history sidebar) */}
              {user && savedPapers.length > 0 && (
                <div className="mt-8 surface-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[var(--text-primary)]">Recent Papers</h3>
                    <button 
                      onClick={() => setShowHistorySidebar(true)}
                      className="text-sm text-[var(--accent-indigo-light)] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {savedPapers.slice(0, 3).map((savedPaper) => (
                      <div
                        key={savedPaper.id}
                        onClick={() => loadPaper(savedPaper.id)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] cursor-pointer hover:border-[var(--accent-indigo)]/50 border border-transparent transition-all"
                      >
                        <FileText className="w-5 h-5 text-[var(--text-tertiary)]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {savedPaper.title}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {formatDate(savedPaper.created_at)}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </div>
                    ))}
                  </div>
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
                  {!user && !loading && (
                    <div className="mt-6 p-4 rounded-xl bg-[var(--accent-indigo)]/10 border border-[var(--accent-indigo)]/20">
                      <p className="text-sm text-[var(--text-secondary)]">
                        <button onClick={openSignIn} className="text-[var(--accent-indigo-light)] hover:underline font-medium">Sign in</button>
                        {' '}to save your papers and access them later
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
