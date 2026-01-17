import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';

/**
 * 获取动态列表
 */
export async function getMoments(req: AuthRequest, res: Response): Promise<void> {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        // 获取动态及其作者信息
        const { data: moments, error } = await supabaseAdmin
            .from('moments')
            .select(`
        *,
        users!inner(id, username, avatar_url)
      `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Get moments error:', error);
            res.status(500).json({ error: 'Failed to fetch moments' });
            return;
        }

        // 对每个动态获取评论和点赞状态
        const momentsWithDetails = await Promise.all(
            moments.map(async (moment) => {
                // 获取评论
                const { data: comments } = await supabaseAdmin
                    .from('moment_comments')
                    .select(`
            *,
            users!inner(id, username, avatar_url)
          `)
                    .eq('moment_id', moment.id)
                    .order('created_at', { ascending: true });

                // 获取当前用户是否点赞
                let isLiked = false;
                if (req.user) {
                    const { data: likeData } = await supabaseAdmin
                        .from('moment_likes')
                        .select('id')
                        .eq('moment_id', moment.id)
                        .eq('user_id', req.user.id)
                        .single();
                    isLiked = !!likeData;
                }

                // 处理评论的点赞状态
                const commentsWithLikes = await Promise.all(
                    (comments || []).map(async (comment) => {
                        let commentIsLiked = false;
                        if (req.user) {
                            const { data: commentLikeData } = await supabaseAdmin
                                .from('comment_likes')
                                .select('id')
                                .eq('comment_id', comment.id)
                                .eq('user_id', req.user.id)
                                .single();
                            commentIsLiked = !!commentLikeData;
                        }

                        return {
                            id: comment.id,
                            user: comment.users.username,
                            avatar: comment.users.avatar_url,
                            content: comment.content,
                            time: formatTime(comment.created_at),
                            likes: comment.likes_count,
                            isLiked: commentIsLiked,
                        };
                    })
                );

                return {
                    id: moment.id,
                    avatar: moment.users.avatar_url,
                    name: moment.users.username,
                    time: formatTime(moment.created_at),
                    loc: moment.location,
                    image: moment.image_url,
                    likes: moment.likes_count,
                    isLiked,
                    comments: commentsWithLikes,
                    content: moment.content,
                    rotation: moment.rotation,
                };
            })
        );

        res.json({ moments: momentsWithDetails });
    } catch (error) {
        console.error('Get moments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 创建动态
 */
export async function createMoment(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { content, image_url, location } = req.body;

        if (!content || !content.trim()) {
            res.status(400).json({ error: 'Content is required' });
            return;
        }

        // 随机旋转角度
        const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-0'];
        const rotation = rotations[Math.floor(Math.random() * rotations.length)];

        const { data: moment, error } = await supabaseAdmin
            .from('moments')
            .insert({
                user_id: req.user.id,
                content: content.trim(),
                image_url: image_url || null,
                location: location || null,
                rotation,
            })
            .select()
            .single();

        if (error) {
            console.error('Create moment error:', error);
            res.status(500).json({ error: 'Failed to create moment' });
            return;
        }

        res.json({ moment });
    } catch (error) {
        console.error('Create moment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 点赞/取消点赞动态
 */
export async function toggleMomentLike(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const momentId = parseInt(req.params.id);

        // 检查是否已点赞
        const { data: existingLike } = await supabaseAdmin
            .from('moment_likes')
            .select('id')
            .eq('moment_id', momentId)
            .eq('user_id', req.user.id)
            .single();

        if (existingLike) {
            // 取消点赞
            const { error } = await supabaseAdmin
                .from('moment_likes')
                .delete()
                .eq('id', existingLike.id);

            if (error) {
                console.error('Unlike moment error:', error);
                res.status(500).json({ error: 'Failed to unlike moment' });
                return;
            }

            res.json({ action: 'unliked', momentId });
        } else {
            // 添加点赞
            const { error } = await supabaseAdmin
                .from('moment_likes')
                .insert({
                    moment_id: momentId,
                    user_id: req.user.id,
                });

            if (error) {
                console.error('Like moment error:', error);
                res.status(500).json({ error: 'Failed to like moment' });
                return;
            }

            res.json({ action: 'liked', momentId });
        }
    } catch (error) {
        console.error('Toggle moment like error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 添加评论
 */
export async function addComment(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const momentId = parseInt(req.params.id);
        const { content } = req.body;

        if (!content || !content.trim()) {
            res.status(400).json({ error: 'Comment content is required' });
            return;
        }

        const { data: comment, error } = await supabaseAdmin
            .from('moment_comments')
            .insert({
                moment_id: momentId,
                user_id: req.user.id,
                content: content.trim(),
            })
            .select()
            .single();

        if (error) {
            console.error('Add comment error:', error);
            res.status(500).json({ error: 'Failed to add comment' });
            return;
        }

        res.json({ comment });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 删除评论
 */
export async function deleteComment(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const commentId = parseInt(req.params.id);

        // 验证评论所有权
        const { data: comment } = await supabaseAdmin
            .from('moment_comments')
            .select('user_id')
            .eq('id', commentId)
            .single();

        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        if (comment.user_id !== req.user.id) {
            res.status(403).json({ error: 'Not authorized to delete this comment' });
            return;
        }

        const { error } = await supabaseAdmin
            .from('moment_comments')
            .delete()
            .eq('id', commentId);

        if (error) {
            console.error('Delete comment error:', error);
            res.status(500).json({ error: 'Failed to delete comment' });
            return;
        }

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 点赞/取消点赞评论
 */
export async function toggleCommentLike(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const commentId = parseInt(req.params.id);

        // 检查是否已点赞
        const { data: existingLike } = await supabaseAdmin
            .from('comment_likes')
            .select('id')
            .eq('comment_id', commentId)
            .eq('user_id', req.user.id)
            .single();

        if (existingLike) {
            // 取消点赞
            const { error } = await supabaseAdmin
                .from('comment_likes')
                .delete()
                .eq('id', existingLike.id);

            if (error) {
                console.error('Unlike comment error:', error);
                res.status(500).json({ error: 'Failed to unlike comment' });
                return;
            }

            res.json({ action: 'unliked', commentId });
        } else {
            // 添加点赞
            const { error } = await supabaseAdmin
                .from('comment_likes')
                .insert({
                    comment_id: commentId,
                    user_id: req.user.id,
                });

            if (error) {
                console.error('Like comment error:', error);
                res.status(500).json({ error: 'Failed to like comment' });
                return;
            }

            res.json({ action: 'liked', commentId });
        }
    } catch (error) {
        console.error('Toggle comment like error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 辅助函数：格式化时间
function formatTime(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;

    return time.toLocaleDateString('zh-CN');
}
