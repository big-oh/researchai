import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    // Build query
    let query = supabase
      .from('papers')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,topic.ilike.%${search}%`);
    }

    const { data: papers, error, count } = await query;

    if (error) {
      console.error('Error fetching papers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch papers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      papers: papers || [],
      count: count || 0,
      limit,
      offset
    });
    
  } catch (error) {
    console.error('Error in papers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const paper = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'topic', 'abstract', 'keywords', 'introduction', 'methodology', 'results', 'discussion', 'conclusion', 'references', 'word_count'];
    const missingFields = requiredFields.filter(field => !paper[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('papers')
      .insert({
        user_id: user.id,
        title: paper.title,
        topic: paper.topic,
        abstract: paper.abstract,
        keywords: paper.keywords,
        introduction: paper.introduction,
        methodology: paper.methodology,
        results: paper.results,
        discussion: paper.discussion,
        conclusion: paper.conclusion,
        references: paper.references,
        word_count: paper.word_count,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving paper:', error);
      return NextResponse.json(
        { error: 'Failed to save paper' },
        { status: 500 }
      );
    }

    return NextResponse.json({ paper: data }, { status: 201 });
    
  } catch (error) {
    console.error('Error in papers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
