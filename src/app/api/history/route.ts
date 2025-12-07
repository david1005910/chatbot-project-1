import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 비로그인 사용자도 null user_id로 조회 가능
    const query = supabase
      .from('analysis_history')
      .select('*')
      .order('updated_at', { ascending: false });

    if (user) {
      query.eq('user_id', user.id);
    } else {
      query.is('user_id', null);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    const transformedData = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      analyses: item.analyses,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return NextResponse.json({ success: true, data: transformedData });
  } catch (error) {
    console.error('History GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { id, name, analyses } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'name은 필수입니다' },
        { status: 400 }
      );
    }

    const { error } = await (supabase as any).from('analysis_history').upsert({
      id,
      user_id: user?.id || null,
      name,
      analyses: analyses || [],
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('History POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id는 필수입니다' },
        { status: 400 }
      );
    }

    const query = supabase
      .from('analysis_history')
      .delete()
      .eq('id', id);

    if (user) {
      query.eq('user_id', user.id);
    } else {
      query.is('user_id', null);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('History DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete history' },
      { status: 500 }
    );
  }
}
