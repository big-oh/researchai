-- ============================================================
-- ResearchAI - Supabase Database Schema
-- Complete schema for AI-powered research paper generator
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Subscription/plan info
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  plan_status TEXT DEFAULT 'active' CHECK (plan_status IN ('active', 'cancelled', 'past_due')),
  plan_expires_at TIMESTAMPTZ,
  
  -- Usage limits tracking
  papers_generated_this_month INTEGER DEFAULT 0,
  words_generated_this_month INTEGER DEFAULT 0,
  monthly_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()),
  
  -- Preferences
  default_word_count INTEGER DEFAULT 2000,
  preferred_export_format TEXT DEFAULT 'docx' CHECK (preferred_export_format IN ('html', 'docx', 'pdf')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  last_sign_in_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url
  )
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. PAPERS TABLE (generated research papers)
-- ============================================================

CREATE TABLE IF NOT EXISTS papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Paper content
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  introduction TEXT NOT NULL,
  methodology TEXT NOT NULL,
  results TEXT NOT NULL,
  discussion TEXT NOT NULL,
  conclusion TEXT NOT NULL,
  references TEXT[] NOT NULL DEFAULT '{}',
  
  -- Metadata
  word_count INTEGER NOT NULL,
  plagiarism_score INTEGER, -- 0-100 originality score
  
  -- Status
  status TEXT DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'edited', 'archived')),
  is_favorite BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  generated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

-- Papers policies
CREATE POLICY "Users can view own papers" 
  ON papers FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own papers" 
  ON papers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own papers" 
  ON papers FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own papers" 
  ON papers FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes for papers
CREATE INDEX IF NOT EXISTS idx_papers_user_id ON papers(user_id);
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON papers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_papers_user_created ON papers(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_papers_favorites ON papers(user_id, is_favorite) WHERE is_favorite = true;

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_papers_search ON papers 
  USING gin(to_tsvector('english', title || ' ' || topic || ' ' || abstract));

-- ============================================================
-- 3. PAPER_EXPORTS TABLE (track exports/downloads)
-- ============================================================

CREATE TABLE IF NOT EXISTS paper_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  format TEXT NOT NULL CHECK (format IN ('html', 'docx', 'pdf')),
  downloaded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  ip_address INET
);

-- Enable RLS
ALTER TABLE paper_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports" 
  ON paper_exports FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exports" 
  ON paper_exports FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_exports_user ON paper_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_paper ON paper_exports(paper_id);

-- ============================================================
-- 4. USAGE_LOGS TABLE (track API usage for analytics/limits)
-- ============================================================

CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL CHECK (action IN ('paper_generate', 'paper_export', 'plagiarism_check', 'login', 'signup')),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'limit_exceeded')),
  
  -- Request details
  topic TEXT,
  word_count INTEGER,
  error_message TEXT,
  
  -- Performance
  duration_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs" 
  ON usage_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_usage_user ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_created ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_action ON usage_logs(user_id, action);

-- ============================================================
-- 5. SUBSCRIPTIONS TABLE (if using custom billing)
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
  
  -- Billing details
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  
  -- Period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" 
  ON subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE UNIQUE INDEX idx_subscriptions_user ON subscriptions(user_id);

-- ============================================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_papers_updated_at ON papers;
CREATE TRIGGER update_papers_updated_at
  BEFORE UPDATE ON papers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment paper count on profile
CREATE OR REPLACE FUNCTION increment_paper_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET papers_generated_this_month = papers_generated_this_month + 1,
      words_generated_this_month = words_generated_this_month + NEW.word_count
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_paper_created ON papers;
CREATE TRIGGER on_paper_created
  AFTER INSERT ON papers
  FOR EACH ROW EXECUTE FUNCTION increment_paper_count();

-- Function to reset monthly usage (call via cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET papers_generated_this_month = 0,
      words_generated_this_month = 0,
      monthly_reset_at = DATE_TRUNC('month', NOW())
  WHERE monthly_reset_at < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. VIEWS FOR ANALYTICS
-- ============================================================

-- Daily paper generation stats
CREATE OR REPLACE VIEW daily_paper_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as papers_generated,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(word_count) as avg_word_count,
  SUM(word_count) as total_words
FROM papers
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- User activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.plan,
  COUNT(DISTINCT papers.id) as total_papers,
  COALESCE(SUM(papers.word_count), 0) as total_words,
  MAX(papers.created_at) as last_paper_date,
  p.created_at as joined_at
FROM profiles p
LEFT JOIN papers ON papers.user_id = p.id
GROUP BY p.id, p.email, p.full_name, p.plan, p.created_at;

-- ============================================================
-- 8. ROW COUNT ESTIMATES & STORAGE NOTES
-- ============================================================

/*
Expected table sizes:
- profiles: 1 row per user (small)
- papers: ~10-100 rows per user (medium, stores full text)
- paper_exports: ~10-50 rows per user (small)
- usage_logs: ~100-1000 rows per user (can grow large, consider retention policy)
- subscriptions: 1 row per user (small)

Storage considerations:
- Papers table stores full text content, expect ~5-20KB per paper
- For 10K users with 50 papers each: ~5GB+ storage
- Consider archiving old papers or using Supabase Storage for large content
*/

-- ============================================================
-- END OF SCHEMA
-- ============================================================
