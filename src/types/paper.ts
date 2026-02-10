export interface ResearchPaper {
  title: string;
  abstract: string;
  keywords: string[];
  introduction: string;
  methodology: string;
  results: string;
  discussion: string;
  conclusion: string;
  references: string[];
  wordCount: number;
}

export interface ResearchRequest {
  topic: string;
  wordCount: number;
}

export interface SavedPaper {
  id: string;
  user_id: string;
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
  updated_at: string;
}
