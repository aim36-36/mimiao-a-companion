import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';

/**
 * 获取游戏状态
 */
export async function getGameState(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const gameType = req.params.type;

        if (gameType !== 'gomoku') {
            res.status(400).json({ error: 'Invalid game type' });
            return;
        }

        const { data: state, error } = await supabaseAdmin
            .from('game_states')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('game_type', gameType)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Get game state error:', error);
            res.status(500).json({ error: 'Failed to fetch game state' });
            return;
        }

        // 如果不存在状态，返回空状态
        if (!state) {
            res.json({ state: null });
            return;
        }

        res.json({ state: state.state_data });
    } catch (error) {
        console.error('Get game state error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 保存游戏状态
 */
export async function saveGameState(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const gameType = req.params.type;
        const { state_data } = req.body;

        if (gameType !== 'gomoku') {
            res.status(400).json({ error: 'Invalid game type' });
            return;
        }

        if (!state_data) {
            res.status(400).json({ error: 'State data is required' });
            return;
        }

        const { data: state, error } = await supabaseAdmin
            .from('game_states')
            .upsert({
                user_id: req.user.id,
                game_type: gameType,
                state_data,
            }, {
                onConflict: 'user_id,game_type'
            })
            .select()
            .single();

        if (error) {
            console.error('Save game state error:', error);
            res.status(500).json({ error: 'Failed to save game state' });
            return;
        }

        res.json({ state, message: 'Game state saved successfully' });
    } catch (error) {
        console.error('Save game state error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 清空游戏状态
 */
export async function clearGameState(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const gameType = req.params.type;

        if (gameType !== 'gomoku') {
            res.status(400).json({ error: 'Invalid game type' });
            return;
        }

        const { error } = await supabaseAdmin
            .from('game_states')
            .delete()
            .eq('user_id', req.user.id)
            .eq('game_type', gameType);

        if (error) {
            console.error('Clear game state error:', error);
            res.status(500).json({ error: 'Failed to clear game state' });
            return;
        }

        res.json({ message: 'Game state cleared successfully' });
    } catch (error) {
        console.error('Clear game state error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
