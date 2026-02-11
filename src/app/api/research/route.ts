import { NextRequest, NextResponse } from 'next/server';
import { ResearchPaper, ResearchRequest } from '@/types/paper';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body: ResearchRequest = await request.json();
    const { topic, wordCount, format = 'ieee' } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Format-specific instructions
    const formatInstructions: Record<string, string> = {
      ieee: `IEEE Format Instructions:
- Use IEEE citation style: [1] Author, "Title," Journal, vol. X, no. Y, pp. Z, Month Year.
- Structure: Title, Abstract, Keywords, Introduction, Methodology, Results, Discussion, Conclusion, References
- Use formal academic tone`,
      
      apa: `APA Format Instructions:
- Use APA 7th edition citation style: Author, A. A. (Year). Title. Journal Name, vol(issue), pp-pp. https://doi.org/xxxxx
- Structure: Title Page, Abstract, Introduction, Method, Results, Discussion, References
- Include running head and page numbers
- Use author-date in-text citations (Author, Year)`,
      
      mla: `MLA Format Instructions:
- Use MLA 9th edition citation style: Author. "Title." Journal Name, vol. X, no. Y, Year, pp. Z.
- Structure: Heading, Title, Introduction, Body (with sections), Conclusion, Works Cited
- Use parenthetical in-text citations (Author page)`,
      
      chicago: `Chicago Format Instructions:
- Use Chicago 17th edition (Notes-Bibliography) citation style
- Use footnotes for citations
- Bibliography format: Author. Title. Journal Name vol, no. X (Year): pp-pp.
- Structure: Title, Introduction, Body with footnotes, Conclusion, Bibliography`,
      
      harvard: `Harvard Format Instructions:
- Use Harvard referencing style: Author, A.A. (Year) 'Title', Journal Name, Volume(Issue), pp. xx-xx.
- Structure: Title, Abstract, Introduction, Literature Review, Methodology, Results, Discussion, Conclusion, References
- Use author-date in-text citations (Author, Year)`
    };

    const formatPrompt = formatInstructions[format] || formatInstructions.ieee;

    const prompt = `Write a ${format.toUpperCase()} research paper about "${topic}" in ${wordCount} words. 

${formatPrompt}

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
    "Reference 1 in ${format.toUpperCase()} format",
    "Reference 2 in ${format.toUpperCase()} format"
  ]
}

Rules:
1. Return ONLY the JSON object
2. No markdown formatting (no \`\`\`json)
3. No text before or after the JSON
4. Ensure valid JSON syntax
5. Abstract should be 150-200 words
6. Include 5-8 references in ${format.toUpperCase()} format
7. Follow the specific ${format.toUpperCase()} formatting guidelines above`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
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
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Gemini API error' },
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

    // Try to save to Supabase if user is authenticated
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('papers').insert({
          user_id: user.id,
          title: paper.title,
          topic: topic,
          abstract: paper.abstract,
          keywords: paper.keywords,
          introduction: paper.introduction,
          methodology: paper.methodology,
          results: paper.results,
          discussion: paper.discussion,
          conclusion: paper.conclusion,
          references: paper.references,
          word_count: wordCount,
        });
      }
    } catch (saveError) {
      // Don't fail the request if saving fails - user still gets their paper
      console.error('Error saving paper to database:', saveError);
    }

    return NextResponse.json({ paper });
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      );
    }
    
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate research paper' },
      { status: 500 }
    );
  }
}
