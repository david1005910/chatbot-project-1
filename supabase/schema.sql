-- ============================================
-- 쿠팡 소싱 도우미 Supabase 스키마
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM 타입
-- ============================================
CREATE TYPE analysis_type AS ENUM ('trend', 'competition', 'niche');

-- ============================================
-- 분석 결과 테이블
-- ============================================
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type analysis_type NOT NULL,
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_type ON analyses(type);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);

-- RLS 정책
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own analyses"
  ON analyses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 분석 히스토리 테이블
-- ============================================
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  analyses JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_analysis_history_user_id ON analysis_history(user_id);
CREATE INDEX idx_analysis_history_created_at ON analysis_history(created_at DESC);

-- RLS 정책
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history"
  ON analysis_history FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own history"
  ON analysis_history FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own history"
  ON analysis_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history"
  ON analysis_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 사용자 설정 테이블
-- ============================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_category TEXT[] NOT NULL DEFAULT ARRAY['50000449'],
  default_period_months INTEGER NOT NULL DEFAULT 12,
  exclude_clothing BOOLEAN NOT NULL DEFAULT true,
  max_volume VARCHAR(50) NOT NULL DEFAULT '택배 가능 크기',
  target_platform VARCHAR(50) NOT NULL DEFAULT '쿠팡',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- RLS 정책
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 즐겨찾기 테이블
-- ============================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, keyword)
);

-- 인덱스
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_keyword ON favorites(keyword);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- RLS 정책
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
  ON favorites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 키워드 트렌드 캐시 테이블
-- ============================================
CREATE TABLE keyword_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data_points JSONB NOT NULL DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(keyword, category, period_start, period_end)
);

-- 인덱스
CREATE INDEX idx_keyword_trends_keyword ON keyword_trends(keyword);
CREATE INDEX idx_keyword_trends_category ON keyword_trends(category);
CREATE INDEX idx_keyword_trends_period ON keyword_trends(period_start, period_end);

-- RLS 정책 (캐시는 모두 읽기 가능)
ALTER TABLE keyword_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view keyword trends"
  ON keyword_trends FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert keyword trends"
  ON keyword_trends FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- ============================================
-- 트리거: updated_at 자동 갱신
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analysis_history_updated_at
  BEFORE UPDATE ON analysis_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 함수: 사용자 설정 초기화
-- ============================================
CREATE OR REPLACE FUNCTION initialize_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 새 사용자 등록 시 설정 자동 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_settings();

-- ============================================
-- 소싱 상품 테이블
-- ============================================
CREATE TABLE sourcing_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('1688', 'taobao', 'aliexpress', 'coupang')),
  keyword VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  title_ko TEXT,
  price DECIMAL(15, 2) NOT NULL,
  original_price DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'KRW',
  moq INTEGER,
  sales_count INTEGER,
  rating DECIMAL(3, 2),
  supplier_rating VARCHAR(50),
  shipping_estimate VARCHAR(50),
  image_url TEXT,
  product_url TEXT NOT NULL,
  specifications JSONB,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_sourcing_products_user_id ON sourcing_products(user_id);
CREATE INDEX idx_sourcing_products_platform ON sourcing_products(platform);
CREATE INDEX idx_sourcing_products_keyword ON sourcing_products(keyword);
CREATE INDEX idx_sourcing_products_created_at ON sourcing_products(created_at DESC);

-- RLS 정책
ALTER TABLE sourcing_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own products"
  ON sourcing_products FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert products"
  ON sourcing_products FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own products"
  ON sourcing_products FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 틈새 키워드 테이블
-- ============================================
CREATE TABLE niche_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  main_keyword VARCHAR(255) NOT NULL,
  keyword VARCHAR(255) NOT NULL,
  search_volume INTEGER NOT NULL,
  competition VARCHAR(20) NOT NULL,
  cpc INTEGER NOT NULL,
  relevance_score INTEGER NOT NULL,
  recommended_title TEXT,
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_niche_keywords_user_id ON niche_keywords(user_id);
CREATE INDEX idx_niche_keywords_main_keyword ON niche_keywords(main_keyword);
CREATE INDEX idx_niche_keywords_created_at ON niche_keywords(created_at DESC);

-- RLS 정책
ALTER TABLE niche_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own keywords"
  ON niche_keywords FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert keywords"
  ON niche_keywords FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own keywords"
  ON niche_keywords FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 경쟁 분석 테이블
-- ============================================
CREATE TABLE competition_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL DEFAULT 'coupang',
  total_products INTEGER NOT NULL,
  avg_review_count INTEGER NOT NULL,
  avg_price INTEGER NOT NULL,
  price_min INTEGER NOT NULL,
  price_max INTEGER NOT NULL,
  rocket_delivery_ratio INTEGER NOT NULL,
  competition_score INTEGER NOT NULL,
  competition_level VARCHAR(20) NOT NULL,
  insights TEXT,
  top_products JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_competition_analyses_user_id ON competition_analyses(user_id);
CREATE INDEX idx_competition_analyses_keyword ON competition_analyses(keyword);
CREATE INDEX idx_competition_analyses_created_at ON competition_analyses(created_at DESC);

-- RLS 정책
ALTER TABLE competition_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses"
  ON competition_analyses FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert analyses"
  ON competition_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own analyses"
  ON competition_analyses FOR DELETE
  USING (auth.uid() = user_id);
