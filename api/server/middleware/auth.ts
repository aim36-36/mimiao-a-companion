import { Request, Response, NextFunction } from 'express';
import { createSupabaseClient } from '../config/supabase';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        device_id?: string;
        username?: string;
    };
    supabase?: any;
}

export async function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing or invalid authorization header' });
            return;
        }

        const token = authHeader.substring(7);
        const supabase = createSupabaseClient(token);

        // 验证JWT token
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        // 将用户信息和supabase client附加到请求对象
        req.user = {
            id: user.id,
        };
        req.supabase = supabase;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}

// 可选的认证中间件（token可选）
export async function optionalAuthMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authMiddleware(req, res, next);
    }

    next();
}
