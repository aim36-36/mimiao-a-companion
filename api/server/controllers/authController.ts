import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

/**
 * 邮箱密码注册
 */
export async function register(req: Request, res: Response): Promise<void> {
    console.log('[Auth] Register request received:', { email: req.body.email, username: req.body.username });
    try {
        const { email, password, username } = req.body;

        if (!email || !password) {
            console.log('[Auth] Register missing fields');
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('[Auth] Invalid email format:', email);
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }

        // 验证密码长度
        if (password.length < 6) {
            console.log('[Auth] Password too short');
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }

        // 使用 Supabase Auth Admin 创建用户
        console.log('[Auth] Creating user in Supabase Auth...');
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                username: username || '指挥官'
            }
        });

        if (authError) {
            console.error('[Auth] Registration Supabase Error:', authError);

            if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
                res.status(409).json({ error: 'Email already registered' });
                return;
            }

            res.status(500).json({ error: authError.message });
            return;
        }

        if (!authData.user) {
            console.error('[Auth] User creation failed: No user data return');
            res.status(500).json({ error: 'Failed to create user' });
            return;
        }

        console.log('[Auth] User created successfully:', authData.user.id);

        // 等待触发器创建users表记录 - 带有简单的重试逻辑
        console.log('[Auth] Waiting for trigger to sync users table...');
        let retries = 5;
        let user = null;

        while (retries > 0) {
            // 等待 500ms
            await new Promise(resolve => setTimeout(resolve, 500));

            const { data, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (data) {
                user = data;
                console.log('[Auth] User synced to users table!');
                break;
            }
            if (error && error.code !== 'PGRST116') { // PGRST116 is "row not found"
                console.warn('[Auth] Error checking users table:', error.message);
            }
            console.log(`[Auth] Waiting for trigger... attempts left: ${retries}`);
            retries--;
        }

        // 如果触发器尚未同步完成，只需返回基本信息，不报错
        // 客户端可以在后续请求中获取完整信息
        if (!user) {
            console.warn('[Auth] Trigger slow or failed, returning basic info');
            user = {
                id: authData.user.id,
                email: authData.user.email,
                username: username || '指挥官',
                avatar_url: null
            };
        }

        res.status(201).json({
            message: 'Registration successful',
            user: user,
            auth_user: authData.user
        });
    } catch (error: any) {
        console.error('[Auth] Registration Critical Error:', error);
        // 确保返回JSON
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
}

/**
 * 邮箱密码登录
 */
export async function login(req: Request, res: Response): Promise<void> {
    console.log('[Auth] Login request received:', { email: req.body.email });
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // 创建客户端进行登录验证
        // 注意：必须使用 ANON KEY，不能使用 SERVICE KEY 进行signInWithPassword
        // 并且确保 URL 是有效的
        if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
            console.error('[Auth] Missing Supabase configuration');
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }

        const supabase = createClient(
            config.SUPABASE_URL,
            config.SUPABASE_ANON_KEY
        );

        // 使用普通客户端登录
        console.log('[Auth] Attempting signInWithPassword...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            console.error('[Auth] Login Supabase Error:', authError.message);
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        if (!authData.user || !authData.session) {
            console.error('[Auth] Login failed: No user or session returned');
            res.status(401).json({ error: 'Authentication failed' });
            return;
        }

        console.log('[Auth] Login successful for user:', authData.user.id);

        // 获取用户信息
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (userError) {
            console.warn('[Auth] Could not fetch user details from users table:', userError.message);
        }

        res.json({
            message: 'Login successful',
            user: user || { id: authData.user.id, email: authData.user.email },
            session: {
                access_token: authData.session.access_token,
                refresh_token: authData.session.refresh_token,
                expires_at: authData.session.expires_at
            }
        });
    } catch (error: any) {
        console.error('[Auth] Login Critical Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
}

/**
 * 登出
 */
export async function logout(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        // Supabase Auth 登出
        const { error } = await supabaseAdmin.auth.admin.signOut(req.user.id);

        if (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Failed to logout' });
            return;
        }

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        console.log('[Auth] Getting current user:', req.user.id);

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) {
            console.error('Get user error:', error);
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
