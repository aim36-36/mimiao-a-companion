import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as authController from '../controllers/authController';
import * as chatController from '../controllers/chatController';
import * as momentsController from '../controllers/momentsController';
import * as storyController from '../controllers/storyController';
import * as gameController from '../controllers/gameController';

const router = Router();

// =====================================================
// 认证路由
// =====================================================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authMiddleware, authController.logout);
router.get('/auth/me', authMiddleware, authController.getCurrentUser);

// =====================================================
// 聊天路由
// =====================================================
router.get('/chat/history', authMiddleware, chatController.getChatHistory);
router.post('/chat/message', authMiddleware, chatController.sendMessage);
router.delete('/chat/history', authMiddleware, chatController.clearChatHistory);

// =====================================================
// 动态路由
// =====================================================
router.get('/moments', momentsController.getMoments);
router.post('/moments', authMiddleware, momentsController.createMoment);
router.post('/moments/:id/like', authMiddleware, momentsController.toggleMomentLike);
router.post('/moments/:id/comments', authMiddleware, momentsController.addComment);
router.delete('/moments/comments/:id', authMiddleware, momentsController.deleteComment);
router.post('/moments/comments/:id/like', authMiddleware, momentsController.toggleCommentLike);

// =====================================================
// 故事路由
// =====================================================
router.get('/story/saves', authMiddleware, storyController.getStorySaves);
router.post('/story/saves', authMiddleware, storyController.saveStoryProgress);
router.get('/story/saves/:id', authMiddleware, storyController.loadStorySave);
router.get('/story/cg', authMiddleware, storyController.getCGGallery);
router.post('/story/cg/:id/unlock', authMiddleware, storyController.unlockCG);
router.get('/story/settings', authMiddleware, storyController.getStorySettings);
router.put('/story/settings', authMiddleware, storyController.updateStorySettings);

// =====================================================
// 游戏路由
// =====================================================
router.get('/game/:type/state', authMiddleware, gameController.getGameState);
router.put('/game/:type/state', authMiddleware, gameController.saveGameState);
router.delete('/game/:type/state', authMiddleware, gameController.clearGameState);

export default router;
