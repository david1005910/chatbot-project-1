import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { keyword, category, memo } = body;

    if (!keyword || !category) {
      return NextResponse.json(
        { success: false, error: 'keyword와 category는 필수입니다' },
        { status: 400 }
      );
    }

    const { error } = await (supabase as any).from('favorites').insert({
      user_id: user.id,
      keyword,
      category,
      memo,
    });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: '이미 즐겨찾기에 추가된 키워드입니다' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorites POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: 'keyword는 필수입니다' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('keyword', keyword);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorites DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete favorite' },
      { status: 500 }
    );
  }
}
