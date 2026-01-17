-- 米缪OS 数据库更新 - 添加邮箱认证支持
-- 版本: 1.1.0

-- =====================================================
-- 1. 更新 users 表添加 email 字段
-- =====================================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 更新索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 将 device_id 改为可空（因为邮箱用户不需要device_id）
ALTER TABLE users 
ALTER COLUMN device_id DROP NOT NULL;

-- =====================================================
-- 2. 创建 Auth 用户自动同步到 users 表的触发器
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 当 Supabase Auth 创建新用户时，自动在 users 表创建对应记录
  INSERT INTO public.users (id, email, username, device_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', '指挥官'),
    NULL  -- 邮箱注册的用户不需要 device_id
  )
  ON CONFLICT (id) DO NOTHING;  -- 如果用户已存在则跳过
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建新触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 3. 创建用户设置自动初始化触发器
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger AS $$
BEGIN
  -- 当 users 表创建新用户时，自动创建默认设置
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS on_user_created_init_settings ON users;

-- 创建新触发器
CREATE TRIGGER on_user_created_init_settings
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();

-- =====================================================
-- 4. 清理旧的米缪机器人测试数据（可选）
-- =====================================================
-- 如果需要保留米缪机器人用户，可以跳过此步骤
-- DELETE FROM users WHERE device_id = 'mimiu-bot';
