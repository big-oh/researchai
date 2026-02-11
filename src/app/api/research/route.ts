import { NextRequest, NextResponse } from 'next/server';
import { ResearchPaper, ResearchRequest } from '@/types/paper';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body: ResearchRequest = await request.json();
    const { topic, wordCount, format = 'ieee' } = body;

    console.log('API called with:', { topic: topic?.substring(0, 50), wordCount, format });

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not set');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }
    
    console.log('API key exists, length:', apiKey.length);

    // Format-specific citation styles
    const citationStyles: Record<string, string> = {
      ieee: 'IEEE: [1] A. Author, "Title," Journal, vol. X, no. Y, pp. Z, Month Year.',
      apa: 'APA: Author, A. A. (Year). Title. Journal Name, vol(issue), pp-pp.',
      mla: 'MLA: Author. "Title." Journal Name, vol. X, no. Y, Year, pp. Z.',
      chicago: 'Chicago: Author. Title. Journal Name vol, no. X (Year): pp-pp.',
      harvard: 'Harvard: Author, A.A. (Year) Title, Journal Name, Volume(Issue), pp. xx-xx.'
    };

    const citationStyle = citationStyles[format] || citationStyles.ieee;

    const prompt = `Write a research paper about "${topic}" in ${wordCount} words. 

Use ${format.toUpperCase()} citation style: ${citationStyle}

IMPORTANT: Return ONLY a valid JSON object. No markdown, no explanations, no code blocks.

Required JSON structure:
{
  "title": "Research Paper Title",
  "abstract": "Abstract text (150-200 words)...",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "introduction": "Introduction section...",
  "methodology": "Methodology section...",
  "results": "Results section...",
  "discussion": "Discussion section...",
  "conclusion": "Conclusion section...",
  "references": [
    "[1] First reference in ${format.toUpperCase()} style",
    "[2] Second reference in ${format.toUpperCase()} style"
  ]
}

Rules:
1. Return ONLY the JSON object, no markdown
2. No text before or after the JSON
3. Valid JSON syntax only
4. Abstract: 150-200 words
5. Include 5-8 references in ${format.toUpperCase()} format`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.7, 
            maxOutputTokens: 8192,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error status:', response.status);
      console.error('Gemini API error text:', errorText);
      let errorMessage = 'Gemini API error';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Multiple cleanup strategies
    // 1. Remove markdown code blocks
    text = text.replace(/```json\s*/gi, '');
    text = text.replace(/```\s*/gi, '');
    
    // 2. Extract JSON if wrapped in other text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    text = text.trim();
    
    // 3. Try to fix common JSON issues
    // Remove trailing commas before closing brackets
    text = text.replace(/,\s*}/g, '}');
    text = text.replace(/,\s*]/g, ']');
    
    // 4. Validate and parse
    let paper: ResearchPaper;
    try {
      paper = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw text:', text.substring(0, 1000));
      
      // Try one more time with relaxed parsing
      try {
        // Replace smart quotes with regular quotes
        text = text.replace(/[\u201C\u201D]/g, '"');
        text = text.replace(/[\u2018\u2019]/g, "'");
        paper = JSON.parse(text);
      } catch (secondError) {
        return NextResponse.json(
          { error: 'Failed to parse AI response. Please try a different topic or word count.' },
          { status: 500 }
        );
      }
    }
    
    // Validate required fields
    const requiredFields = ['title', 'abstract', 'keywords', 'introduction', 'methodology', 'results', 'discussion', 'conclusion', 'references'];
    const missingFields = requiredFields.filter(field => !paper[field as keyof ResearchPaper]);
    
    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields);
      return NextResponse.json(
        { error: `AI response missing fields: ${missingFields.join(', ')}. Please try again.` },
        { status: 500 }
      );
    }
    
    paper.wordCount = wordCount;
    paper.format = format;

    paper.format = format;

    // Skip Supabase save for now since auth is removed
    // Papers are saved to localStorage on the client side

    return NextResponse.json({ paper });
    
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error?.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: error?.message || 'Failed to generate research paper' },
      { status: 500 }
    );
  }
}
