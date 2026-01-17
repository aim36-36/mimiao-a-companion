import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';

// 客户端实例（使用service key，绕过RLS）
export const supabaseAdmin: SupabaseClient = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

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
