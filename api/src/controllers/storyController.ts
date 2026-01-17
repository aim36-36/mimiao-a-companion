import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';

/**
 * 获取存档列表
 */
export async function getStorySaves(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { data: saves, error } = await supabaseAdmin
            .from('story_saves')
            .select('*')
            .eq('user_id', req.user.id)
            .order('slot_number', { ascending: true });

        if (error) {
            console.error('Get story saves error:', error);
            res.status(500).json({ error: 'Failed to fetch story saves' });
            return;
        }

        // 格式化返回数据
        const formattedSaves = saves.map(save => ({
            id: save.id,
            type: save.save_type,
            title: save.title,
            slot_number: save.slot_number,
            date: new Date(save.updated_at).toLocaleDateString('zh-CN'),
            time: new Date(save.updated_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            save_data: save.save_data,
        }));

        res.json({ saves: formattedSaves });
    } catch (error) {
        console.error('Get story saves error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 保存游戏进度
 */
export async function saveStoryProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { slot_number, title, save_type, save_data } = req.body;

        if (!slot_number || slot_number < 1 || slot_number > 3) {
            res.status(400).json({ error: 'Invalid slot number (must be 1-3)' });
            return;
        }

        if (!title) {
            res.status(400).json({ error: 'Save title is required' });
            return;
        }

        // 使用 upsert 确保只保存一个存档在指定位置
        const { data: save, error } = await supabaseAdmin
            .from('story_saves')
            .upsert({
                user_id: req.user.id,
                slot_number,
                title,
                save_type: save_type || 'MANUAL',
                save_data: save_data || {},
            }, {
                onConflict: 'user_id,slot_number'
            })
            .select()
            .single();

        if (error) {
            console.error('Save story progress error:', error);
            res.status(500).json({ error: 'Failed to save progress' });
            return;
        }

        res.json({ save, message: 'Progress saved successfully' });
    } catch (error) {
        console.error('Save story progress error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 读取存档
 */
export async function loadStorySave(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const saveId = parseInt(req.params.id);

        const { data: save, error } = await supabaseAdmin
            .from('story_saves')
            .select('*')
            .eq('id', saveId)
            .eq('user_id', req.user.id)
            .single();

        if (error || !save) {
            res.status(404).json({ error: 'Save not found' });
            return;
        }

        res.json({ save });
    } catch (error) {
        console.error('Load story save error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 获取CG收藏状态
 */
export async function getCGGallery(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { data: cgList, error } = await supabaseAdmin
            .from('cg_gallery')
            .select('*')
            .eq('user_id', req.user.id)
            .order('cg_id', { ascending: true });

        if (error) {
            console.error('Get CG gallery error:', error);
            res.status(500).json({ error: 'Failed to fetch CG gallery' });
            return;
        }

        res.json({ cgList });
    } catch (error) {
        console.error('Get CG gallery error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 解锁CG
 */
export async function unlockCG(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const cgId = parseInt(req.params.id);

        const { data: cg, error } = await supabaseAdmin
            .from('cg_gallery')
            .upsert({
                user_id: req.user.id,
                cg_id: cgId,
                unlocked: true,
                viewed: true,
            }, {
                onConflict: 'user_id,cg_id'
            })
            .select()
            .single();

        if (error) {
            console.error('Unlock CG error:', error);
            res.status(500).json({ error: 'Failed to unlock CG' });
            return;
        }

        res.json({ cg, message: 'CG unlocked successfully' });
    } catch (error) {
        console.error('Unlock CG error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 获取故事设置
 */
export async function getStorySettings(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { data: settings, error } = await supabaseAdmin
            .from('user_settings')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Get story settings error:', error);
            res.status(500).json({ error: 'Failed to fetch settings' });
            return;
        }

        // 如果不存在设置，返回默认值
        if (!settings) {
            const defaultSettings = {
                story_text_speed: 60,
                story_auto_speed: 40,
                story_opacity: 90,
                story_bgm: true,
            };
            res.json({ settings: defaultSettings });
            return;
        }

        res.json({
            settings: {
                story_text_speed: settings.story_text_speed,
                story_auto_speed: settings.story_auto_speed,
                story_opacity: settings.story_opacity,
                story_bgm: settings.story_bgm,
            }
        });
    } catch (error) {
        console.error('Get story settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 更新故事设置
 */
export async function updateStorySettings(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { story_text_speed, story_auto_speed, story_opacity, story_bgm } = req.body;

        const { data: settings, error } = await supabaseAdmin
            .from('user_settings')
            .upsert({
                user_id: req.user.id,
                story_text_speed,
                story_auto_speed,
                story_opacity,
                story_bgm,
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) {
            console.error('Update story settings error:', error);
            res.status(500).json({ error: 'Failed to update settings' });
            return;
        }

        res.json({ settings, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update story settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
