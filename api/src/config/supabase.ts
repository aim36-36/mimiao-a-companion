import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';

// 客户端实例（使用service key，绕过RLS）
let adminClient: SupabaseClient;

try {
    if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_KEY) {
        console.warn('Supabase credentials missing, admin client will fail on use.');
    }

    // 如果 URL 无效，createClient 会抛出错误，所以我们做个安全检查
    const url = config.SUPABASE_URL || 'https://placeholder.supabase.co';
    const key = config.SUPABASE_SERVICE_KEY || 'placeholder';

    adminClient = createClient(
        url,
        key,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
} catch (error) {
    console.error('Failed to initialize Supabase Admin Client:', error);
    // 创建一个假的客户端，调用时再报错
    adminClient = new Proxy({} as SupabaseClient, {
        get: () => {
            throw new Error('Supabase Admin Client failed to initialize. Check server logs.');
        }
    });
}

export const supabaseAdmin = adminClient;

// 创建客户端实例（使用anon key，遵守RLS）
export function createSupabaseClient(accessToken?: string): SupabaseClient {
    const client = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_ANON_KEY
    );

    if (accessToken) {
        client.auth.setSession({
            access_token: accessToken,
            refresh_token: ''
        });
    }

    return client;
}

export default supabaseAdmin;
