-- 米缪OS 数据库初始化脚本
-- 版本: 1.0.0

-- =====================================================
-- 1. 创建用户表
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL DEFAULT '指挥官',
    avatar_url TEXT DEFAULT 'https://lh3.googleusercontent.com/aida-public/AB6AXuBebSjkAHEgLVM62u_KQWuIESENqyfTJVxl3JbAeJdPHbjlkYucj8MuWYMlzWdM4qzoiAm5ARur62wOt6Eu-Z-HjNPWt5K0igQb7jy-2twjPx1rbL7U7HfKvJVw61SSACL904yFPt92luux6DJm4NkUufLcNpA_WKaeMVWqdZHo4C5Ad3mmLFXLuJFkA-HgdvVGobfntuoiAvvyE6_UtyeUu_Rs1fgDxLmYyWGaQP9X_4aGsIkvbBmV8bIXfTAVwUyTfp04y7sOL1o',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);

-- =====================================================
-- 2. 创建聊天消息表
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- =====================================================
-- 3. 创建动态表
-- =====================================================
CREATE TABLE IF NOT EXISTS moments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    location TEXT,
    likes_count INTEGER DEFAULT 0,
    rotation TEXT DEFAULT 'rotate-0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moments_user_id ON moments(user_id);
CREATE INDEX IF NOT EXISTS idx_moments_created_at ON moments(created_at DESC);

-- =====================================================
-- 4. 创建动态评论表
-- =====================================================
CREATE TABLE IF NOT EXISTS moment_comments (
    id BIGSERIAL PRIMARY KEY,
    moment_id BIGINT NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moment_comments_moment_id ON moment_comments(moment_id);
CREATE INDEX IF NOT EXISTS idx_moment_comments_created_at ON moment_comments(created_at DESC);

-- =====================================================
-- 5. 创建动态点赞表
-- =====================================================
CREATE TABLE IF NOT EXISTS moment_likes (
    id BIGSERIAL PRIMARY KEY,
    moment_id BIGINT NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(moment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_moment_likes_moment_id ON moment_likes(moment_id);
CREATE INDEX IF NOT EXISTS idx_moment_likes_user_id ON moment_likes(user_id);

-- =====================================================
-- 6. 创建评论点赞表
-- =====================================================
CREATE TABLE IF NOT EXISTS comment_likes (
    id BIGSERIAL PRIMARY KEY,
    comment_id BIGINT NOT NULL REFERENCES moment_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- =====================================================
-- 7. 创建故事存档表
-- =====================================================
CREATE TABLE IF NOT EXISTS story_saves (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 3),
    title TEXT NOT NULL,
    save_type TEXT NOT NULL CHECK (save_type IN ('AUTO', 'MANUAL')),
    save_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, slot_number)
);

CREATE INDEX IF NOT EXISTS idx_story_saves_user_id ON story_saves(user_id);

-- =====================================================
-- 8. 创建CG画廊表
-- =====================================================
CREATE TABLE IF NOT EXISTS cg_gallery (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cg_id INTEGER NOT NULL,
    unlocked BOOLEAN DEFAULT false,
    viewed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cg_id)
);

CREATE INDEX IF NOT EXISTS idx_cg_gallery_user_id ON cg_gallery(user_id);

-- =====================================================
-- 9. 创建用户设置表
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    story_text_speed INTEGER DEFAULT 60 CHECK (story_text_speed BETWEEN 1 AND 100),
    story_auto_speed INTEGER DEFAULT 40 CHECK (story_auto_speed BETWEEN 1 AND 100),
    story_opacity INTEGER DEFAULT 90 CHECK (story_opacity BETWEEN 1 AND 100),
    story_bgm BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- =====================================================
-- 10. 创建游戏状态表
-- =====================================================
CREATE TABLE IF NOT EXISTS game_states (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL CHECK (game_type IN ('gomoku')),
    state_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_type)
);

CREATE INDEX IF NOT EXISTS idx_game_states_user_id ON game_states(user_id);

-- =====================================================
-- 11. 创建自动更新时间戳的函数
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. 为需要的表添加触发器
-- =====================================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moments_updated_at BEFORE UPDATE ON moments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_saves_updated_at BEFORE UPDATE ON story_saves
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_states_updated_at BEFORE UPDATE ON game_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. 创建函数：更新动态点赞数
-- =====================================================
CREATE OR REPLACE FUNCTION update_moment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE moments SET likes_count = likes_count + 1 WHERE id = NEW.moment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE moments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.moment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_moment_likes_count
    AFTER INSERT OR DELETE ON moment_likes
    FOR EACH ROW EXECUTE FUNCTION update_moment_likes_count();

-- =====================================================
-- 14. 创建函数：更新评论点赞数
-- =====================================================
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE moment_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE moment_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_likes_count
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- =====================================================
-- 15. Row Level Security (RLS) 策略
-- =====================================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE moment_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE moment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Users: 所有人可以查看，只能修改自己的
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Chat Messages: 只能访问自己的消息
CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat messages" ON chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Moments: 所有人可以查看，只能创建/修改/删除自己的
CREATE POLICY "Moments are viewable by everyone" ON moments FOR SELECT USING (true);
CREATE POLICY "Users can insert own moments" ON moments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own moments" ON moments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own moments" ON moments FOR DELETE USING (auth.uid() = user_id);

-- Moment Comments: 所有人可以查看，只能创建/删除自己的评论
CREATE POLICY "Comments are viewable by everyone" ON moment_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON moment_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON moment_comments FOR DELETE USING (auth.uid() = user_id);

-- Moment Likes: 只能看到和操作自己的点赞
CREATE POLICY "Users can view all likes" ON moment_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON moment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON moment_likes FOR DELETE USING (auth.uid() = user_id);

-- Comment Likes: 只能看到和操作自己的点赞
CREATE POLICY "Users can view all comment likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own comment likes" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment likes" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Story Saves: 只能访问自己的存档
CREATE POLICY "Users can view own saves" ON story_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saves" ON story_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saves" ON story_saves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saves" ON story_saves FOR DELETE USING (auth.uid() = user_id);

-- CG Gallery: 只能访问自己的收藏
CREATE POLICY "Users can view own cg" ON cg_gallery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cg" ON cg_gallery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cg" ON cg_gallery FOR UPDATE USING (auth.uid() = user_id);

-- User Settings: 只能访问自己的设置
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Game States: 只能访问自己的游戏状态
CREATE POLICY "Users can view own game states" ON game_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game states" ON game_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own game states" ON game_states FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 16. 插入初始测试数据（可选）
-- =====================================================

-- 插入米缪机器人用户（如果需要）
INSERT INTO users (id, device_id, username, avatar_url)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'mimiu-bot',
    '米缪',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCd7YiKH3_7h1HpQqgU-yu4IF9JHKBWkByfKjh_rwTe0KyI6IxkLkC-G2p3o-8LQ1Wo_fUgMd7hNTkg6I3TSUFKlf1SGgdP724X8dBJHfa6LHz_nrlUq_LytrRmI86iQF27cvH2ctz3ybdh1nJlMww7OmPYHoiOOCccj0PrEtcE05smfduJV7lAA-XqltKsZPXMZN4-kK_6yd70KDakv7dH0fy9QKyyR5u45wh789tT44dNiL5wf1Ce5L3PkLOmdRPqyvGdlmrtGEQ'
)
ON CONFLICT (device_id) DO NOTHING;
