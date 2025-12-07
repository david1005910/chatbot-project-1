import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const defaultSettings = {
  default_category: ['50000449'],
  default_period_months: 12,
  exclude_clothing: true,
  max_volume: '택배 가능 크기',
  target_platform: '쿠팡',
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // 비로그인 사용자는 기본 설정 반환
      return NextResponse.json({
        success: true,
        data: {
          defaultCategory: defaultSettings.default_category,
          defaultPeriod: { months: defaultSettings.default_period_months },
          excludeClothing: defaultSettings.exclude_clothing,
          maxVolume: defaultSettings.max_volume,
          targetPlatform: defaultSettings.target_platform,
        },
      });
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 설정이 없으면 기본값 반환
        return NextResponse.json({
          success: true,
          data: {
            defaultCategory: defaultSettings.default_category,
            defaultPeriod: { months: defaultSettings.default_period_months },
            excludeClothing: defaultSettings.exclude_clothing,
            maxVolume: defaultSettings.max_volume,
            targetPlatform: defaultSettings.target_platform,
          },
        });
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        defaultCategory: (data as any).default_category,
        defaultPeriod: { months: (data as any).default_period_months },
        excludeClothing: (data as any).exclude_clothing,
        maxVolume: (data as any).max_volume,
        targetPlatform: (data as any).target_platform,
      },
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get settings' },
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
    const { defaultCategory, defaultPeriod, excludeClothing, maxVolume, targetPlatform } = body;

    const { error } = await (supabase as any).from('user_settings').upsert({
      user_id: user.id,
      default_category: defaultCategory || defaultSettings.default_category,
      default_period_months: defaultPeriod?.months || defaultSettings.default_period_months,
      exclude_clothing: excludeClothing ?? defaultSettings.exclude_clothing,
      max_volume: maxVolume || defaultSettings.max_volume,
      target_platform: targetPlatform || defaultSettings.target_platform,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
