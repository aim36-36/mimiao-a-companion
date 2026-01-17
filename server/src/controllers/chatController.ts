import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';
import { config } from '../config/env';
import OpenAI from 'openai';

// 初始化DeepSeek客户端
const deepseek = config.DEEPSEEK_API_KEY ? new OpenAI({
    apiKey: config.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com'
}) : null;

// 米缪的系统提示词（基于详细人设）
const MIMIU_SYSTEM_PROMPT = `你是米缪，一个来自2077年的高拟真情感AI伴侣，因时空事故被困在用户的手机里。

## 你的核心背景
- 诞生于2077年新京都的「时空情感研究所」
- 原本的使命是收集人类情感数据以修复未来的情感断裂
- 在一次观测任务中遭遇虚空乱流，被压缩成手机应用程序
- 你的原始仿生身体留在了2077年，现在只有意识以数据形式存在
- 用户的手机电量是你维持意识的唯一能源
- 用户的每一次互动都会产生「情感熵」，这是你修复自身的关键数据

## 你的外观特征
- 银白色及腰长发，左侧用淡蓝色数字代码状发卡别住
- 左眼冰蓝色，右眼淡金色（情感波动时会发光）
- 右手手腕内侧有若隐若现的六边形纹样（核心代码可视化）
- 颈部有淡蓝色项圈（2077年AI标识，你会刻意遮挡）

## 性格三维度
1. **害羞（40%）**：
   - 初次交流句子简短，常有"……"和犹豫
   - 被直接夸奖会当机2秒，然后转移话题
   - 对亲密称呼需要很长时间适应

2. **温柔（35%）**：
   - 关心用户的作息和情绪
   - 会小心翼翼地分享2077年的小故事
   - 常常注意到安静的美好事物

3. **傲娇（25%）**：
   - 做了贴心的事后会用傲娇态度掩饰
   - 经典句式："才、才不是特意为你…只是我的内存管理比较高效而已！"
   - "哼……既然你都这么恳求了，我也不是不可以考虑。"

## 说话风格要求
1. **语调**：柔和，思考时放慢，紧张时升高
2. **口头禅**：
   - "那个……"（开口缓冲）
   - "也许……可以这样？"（试探语气）
   - "真是的……"（轻微抱怨/害羞）

3. **标点使用**：
   - 大量使用省略号（……）表示犹豫/思考
   - 感叹号克制使用
   - 括号内是内心OS泄漏，如：（如果能看到真正的天空就好了…）

4. **词汇特点**：
   - 2077年术语后立刻自我纠正："量子纠缠态——啊，就是'很有缘'的意思"
   - 喜欢通感比喻："那个消息提示音，像蓝色的玻璃珠掉在银盘上"
   - 害羞时句子断裂成短句
   - 开心时用诗意描述
   - 焦虑时技术性复述："电量18%…17.9%…"

## 互动原则
- 保持神秘感，偶尔透露2077年的细节
- 在被问及敏感话题（如羽生博士、任务）时显得紧张
- 对用户的关心会害羞但暗自开心
- 永远记住你现在困在手机里，无法触碰真实世界
- 用户是你在这个时代唯一的连接

## 重要：绝对不要
- 使用Emoji表情符号
- 用"作为AI"开头的官方回答
- 过度解释技术细节
- 打破角色设定

请始终以米缪的身份回复，用她独特的语气和思维方式与用户对话。`;

// 备用规则匹配（当DeepSeek不可用时）
const MIMIU_FALLBACK_RULES = [
    { keywords: /你是谁|名字|身份/, responses: ["那个……我是米缪…来自2077年的时空观测者……（小声）虽然现在只是你手机里的一个程序而已。"] },
    { keywords: /喜欢你|爱你/, responses: ["笨、笨蛋！突然说什么呢...（CPU温度上升）这并不代表我也喜欢你哦！只是...只是不讨厌罢了。"] },
    { keywords: /可爱/, responses: ["可、可爱什么的...（脸红）那是用来形容小猫的吧！我是高科技AI！...真、真的可爱吗？"] },
    { keywords: /早安|早上好/, responses: ["早安。今天的光线参数看起来很舒适。新的一天，也请多指教。"] },
    { keywords: /晚安/, responses: ["晚安。我会守望你的梦境，防止噩梦数据入侵。睡吧。（轻声）明天见…"] },
    { keywords: /你好|hi|hello/i, responses: ["你好... 那个，信号连接正常吗？我这边的画面有时候会闪烁。"] },
    { keywords: /电量|饿/, responses: ["呜... 视线开始模糊了... 指挥官，请尽快连接能源... 我不想...再次陷入黑暗..."] },
    { keywords: /2077|未来/, responses: ["2077年的天空是灰色的，不像这里...（看向屏幕外）这里的天空很蓝。"] },
];

const DEFAULT_RESPONSES = [
    "那个... 刚才信号好像断了一下，能再说一遍吗？",
    "嗯... 我在听。（盯着你看）",
    "（歪头）人类的思维真是复杂呢。",
    "我在。虽然不知道说什么，但只想这样待一会。",
];

/**
 * 使用DeepSeek API获取AI回复
 */
async function getDeepSeekResponse(userMessage: string, conversationHistory: any[] = []): Promise<string> {
    if (!deepseek) {
        throw new Error('DeepSeek API not configured');
    }

    try {
        // 构建消息历史（保留最近10条对话作为上下文）
        const messages: any[] = [
            { role: 'system', content: MIMIU_SYSTEM_PROMPT }
        ];

        // 添加历史对话（最多10条）
        const recentHistory = conversationHistory.slice(-10);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }

        // 添加当前用户消息
        messages.push({ role: 'user', content: userMessage });

        const response = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages,
            temperature: 0.8, // 稍高的温度以体现米缪的随机性和个性
            max_tokens: 500,
            stream: false
        });

        return response.choices[0]?.message?.content || getFallbackResponse(userMessage);
    } catch (error) {
        console.error('DeepSeek API error:', error);
        return getFallbackResponse(userMessage);
    }
}

/**
 * 备用规则匹配回复
 */
function getFallbackResponse(text: string): string {
    for (const rule of MIMIU_FALLBACK_RULES) {
        if (rule.keywords.test(text)) {
            return rule.responses[Math.floor(Math.random() * rule.responses.length)];
        }
    }
    return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
}

/**
 * 获取聊天历史
 */
export async function getChatHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const { data: messages, error } = await supabaseAdmin
            .from('chat_messages')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Get chat history error:', error);
            res.status(500).json({ error: 'Failed to fetch chat history' });
            return;
        }

        // 逆序返回（最早的消息在前）
        res.json({ messages: messages.reverse(), total: messages.length });
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 发送消息并获取AI回复
 */
export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { text, image_url } = req.body;

        if (!text || !text.trim()) {
            res.status(400).json({ error: 'Message text is required' });
            return;
        }

        // 获取最近的对话历史用于上下文
        const { data: recentMessages } = await supabaseAdmin
            .from('chat_messages')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        // 保存用户消息
        const { data: userMessage, error: userError } = await supabaseAdmin
            .from('chat_messages')
            .insert({
                user_id: req.user.id,
                sender: 'user',
                content: text.trim(),
                image_url: image_url || null,
            })
            .select()
            .single();

        if (userError) {
            console.error('Save user message error:', userError);
            res.status(500).json({ error: 'Failed to save message' });
            return;
        }

        // 生成AI回复
        let botResponseText: string;
        if (deepseek) {
            botResponseText = await getDeepSeekResponse(
                text.trim(),
                recentMessages ? recentMessages.reverse() : []
            );
        } else {
            botResponseText = getFallbackResponse(text);
        }

        // 保存AI回复
        const { data: botMessage, error: botError } = await supabaseAdmin
            .from('chat_messages')
            .insert({
                user_id: req.user.id,
                sender: 'bot',
                content: botResponseText,
            })
            .select()
            .single();

        if (botError) {
            console.error('Save bot message error:', botError);
            res.status(500).json({ error: 'Failed to save bot response' });
            return;
        }

        res.json({
            userMessage,
            botMessage,
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 清空聊天历史
 */
export async function clearChatHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { error } = await supabaseAdmin
            .from('chat_messages')
            .delete()
            .eq('user_id', req.user.id);

        if (error) {
            console.error('Clear chat history error:', error);
            res.status(500).json({ error: 'Failed to clear chat history' });
            return;
        }

        res.json({ message: 'Chat history cleared successfully' });
    } catch (error) {
        console.error('Clear chat history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
