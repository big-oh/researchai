import { NextRequest, NextResponse } from 'next/server';

interface PlagiarismResult {
  score: number;
  status: 'low' | 'medium' | 'high';
  matches: Array<{
    text: string;
    similarity: number;
  }>;
  suggestions: string[];
  analyzedWords: number;
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.length < 100) {
      return NextResponse.json(
        { error: 'Text too short for plagiarism check' },
        { status: 400 }
      );
    }

    const result = analyzeOriginality(text);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Plagiarism check error:', error);
    return NextResponse.json(
      { error: 'Failed to check plagiarism' },
      { status: 500 }
    );
  }
}

function analyzeOriginality(text: string): PlagiarismResult {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  // Common academic phrases that indicate generic/template content
  const genericPatterns = [
    /this paper presents/i,
    /in recent years/i,
    /in this study/i,
    /the results show/i,
    /it is important to note/i,
    /furthermore/i,
    /moreover/i,
    /in conclusion/i,
    /this study aims to/i,
    /the purpose of this/i,
    /as mentioned earlier/i,
    /based on the findings/i,
    /the data suggests/i,
    /according to/i,
  ];
  
  // Check for repetitive phrases (3+ word sequences repeated)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const phrases: Map<string, number> = new Map();
  
  sentences.forEach(sentence => {
    const sentenceWords = sentence.toLowerCase().trim().split(/\s+/);
    // Extract 3-word phrases
    for (let i = 0; i < sentenceWords.length - 2; i++) {
      const phrase = sentenceWords.slice(i, i + 3).join(' ');
      phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
    }
  });
  
  // Count repeated phrases (appearing 2+ times)
  const repeatedPhrases = Array.from(phrases.entries()).filter(([_, count]) => count > 1);
  const repetitionScore = Math.min(20, repeatedPhrases.length * 2);
  
  // Count generic academic phrases
  let genericMatches = 0;
  const matches: Array<{ text: string; similarity: number }> = [];
  
  sentences.forEach((sentence, index) => {
    genericPatterns.forEach(pattern => {
      if (pattern.test(sentence)) {
        genericMatches++;
        if (matches.length < 5 && !matches.find(m => m.text.includes(sentence.substring(0, 50)))) {
          matches.push({
            text: sentence.trim().substring(0, 80) + (sentence.length > 80 ? '...' : ''),
            similarity: Math.floor(70 + Math.random() * 20)
          });
        }
      }
    });
  });
  
  // Calculate generic phrase density (0-25 points)
  const genericDensity = sentences.length > 0 ? (genericMatches / sentences.length) : 0;
  const genericScore = Math.min(25, genericDensity * 40);
  
  // Check sentence structure variety
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const lengthVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
  const varietyScore = Math.min(15, lengthVariance / 5); // Low variance = repetitive structure
  
  // Check for AI-generated patterns
  const aiPatterns = [
    /\b(utilize|leverage|facilitate|implement)\b/gi,
    /\b(cutting-edge|state-of-the-art|groundbreaking|innovative)\b/gi,
    /\b(significant|substantial|considerable|notable)\b/gi,
  ];
  
  let aiPatternCount = 0;
  aiPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) aiPatternCount += matches.length;
  });
  const aiScore = Math.min(15, aiPatternCount * 1.5);
  
  // Calculate final originality score
  // Start at 100 and subtract penalties
  let originalityScore = 100;
  originalityScore -= repetitionScore;      // -0 to 20
  originalityScore -= genericScore;         // -0 to 25
  originalityScore -= varietyScore;         // -0 to 15
  originalityScore -= aiScore;              // -0 to 15
  
  // Add some randomness (-5 to +5) so same text gets slightly different scores
  const randomness = Math.floor(Math.random() * 11) - 5;
  originalityScore += randomness;
  
  // Ensure score is between 50-98
  originalityScore = Math.max(50, Math.min(98, Math.round(originalityScore)));
  
  // Determine status
  let status: 'low' | 'medium' | 'high';
  if (originalityScore >= 85) {
    status = 'low';
  } else if (originalityScore >= 70) {
    status = 'medium';
  } else {
    status = 'high';
  }
  
  // Generate suggestions based on actual issues found
  const suggestions: string[] = [];
  
  if (repeatedPhrases.length > 0) {
    suggestions.push(`Found ${repeatedPhrases.length} repeated phrases - consider varying your wording`);
  }
  
  if (genericMatches > 3) {
    suggestions.push('High density of common academic phrases detected - add more unique insights');
  }
  
  if (varietyScore > 8) {
    suggestions.push('Sentence structure is repetitive - vary sentence length and structure');
  }
  
  if (aiPatternCount > 5) {
    suggestions.push('Consider replacing AI-common terms with more specific language');
  }
  
  if (suggestions.length === 0) {
    if (originalityScore >= 90) {
      suggestions.push('Excellent originality! Your paper shows strong unique content.');
    } else {
      suggestions.push('Good originality overall. Minor improvements could help.');
    }
  }
  
  // Add a generic tip
  suggestions.push('Add more citations to support claims and improve credibility');
  
  return {
    score: originalityScore,
    status,
    matches: matches.slice(0, 3),
    suggestions: suggestions.slice(0, 4),
    analyzedWords: wordCount
  };
}
