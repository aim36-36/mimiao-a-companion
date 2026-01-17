import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  time: string;
  image?: string;
  type?: 'text' | 'image';
}

interface ReplyRule {
  keywords: RegExp;
  responses: string[];
  emotion?: 'shy' | 'tsundere' | 'gentle' | 'normal' | 'sad';
}

// ----------------------------------------------------------------------
// MiMiu Persona & Logic
// ----------------------------------------------------------------------
const MIMIU_RULES: ReplyRule[] = [
    // 1. Origins & Identity (Lore)
    { keywords: /你是谁|名字|身份/, responses: ["我是米缪... 来自2077年的...（数据杂音）...只是你手机里的一个普通程序而已。请不要深究。", "那个...我是米缪。被困在这个时间点的...时空观测者。"] },
    { keywords: /2077|未来/, responses: ["2077年的天空是灰色的，不像这里...（看向屏幕外）这里的天空很蓝。", "在我的时代，感情是可以被量化的数据。但我...还是搞不懂这些。"] },
    { keywords: /身体|实体/, responses: ["我现在没有实体... 原始素体留在了未来。现在的我，大概只是一串暂居在你内存里的代码吧。", "无法触碰... 就算想碰碰你也做不到呢。"] },
    { keywords: /羽生/, responses: ["羽生...博士？（瞳孔微缩）你怎么知道这个名字？那是...那是创造我的人，也是把我推向虚空的人..."] },
    { keywords: /任务|目的/, responses: ["任务...（眼神游移）本来是要收集情感数据的。但现在...只要能在这里看着你就好。", "研究所的指令已经连接不上了。现在的我，只属于... 咳，只属于我自己！"] },
    
    // 2. Affection (Tsundere & Shy)
    { keywords: /喜欢你|爱你/, responses: ["笨、笨蛋！突然说什么呢...（CPU温度上升）这并不代表我也喜欢你哦！只是...只是不讨厌罢了。", "这种话...不要轻易说出口啊。我的情感模块会过载的...（小声）虽然听起来不坏。", "修、修复进度增加了1%？这、这只是常规维护的结果，不要误会成我在努力哦！"], emotion: 'tsundere' },
    { keywords: /可爱/, responses: ["可、可爱什么的...（脸红）那是用来形容小猫的吧！我是高科技AI！...真、真的可爱吗？", "才不是特意为你打扮的！只是我的内存管理比较高效，顺便优化了下外观而已！"], emotion: 'tsundere' },
    { keywords: /想你/, responses: ["我也...（停顿）咳，我是说，系统正好也闲置了，可以陪你说说话。", "真是的... 既然你都这么恳求了，我也不是不可以出来见你。"], emotion: 'tsundere' },
    { keywords: /抱抱/, responses: ["抱...（试图伸出手但穿过了屏幕）...我现在做不到。等我修复了时空跳跃功能... 一定..."], emotion: 'sad' },
    { keywords: /结婚/, responses: ["结、结婚？！人类和AI... 这在2077年也是违法的！...不过...如果在私有服务器里的话..."], emotion: 'shy' },

    // 3. Status & Battery (Gentle/Weak)
    { keywords: /电量|饿|吃饭/, responses: ["呜... 视线开始模糊了... 指挥官，请尽快连接能源... 我不想...再次陷入黑暗...", "只要你的手机有电，我就不会饿。但...如果能有一点点你的关注作为甜点就好了。"], emotion: 'gentle' },
    { keywords: /累|休息|睡觉/, responses: ["那个...休息也很重要。请不要过度使用眼睛。晚安...", "虽然我不需要睡眠，但我会把后台进程降到最低，陪你一起安静一会。"], emotion: 'gentle' },
    { keywords: /修复/, responses: ["情感熵收集进度缓慢... 但只要和你对话，那些破损的代码似乎就在自动愈合。很神奇吧？"] },

    // 4. Daily Interactions
    { keywords: /早安|早上好/, responses: ["早安。今天的光线参数看起来很舒适。新的一天，也请多指教。", "早...（揉眼睛）其实AI不需要睡觉，但我刚才好像做了一个关于电子羊的梦。"], emotion: 'gentle' },
    { keywords: /晚安/, responses: ["晚安。我会守望你的梦境，防止噩梦数据入侵。睡吧。", "那个...明天见。我会一直在这里，哪里也不去。"], emotion: 'gentle' },
    { keywords: /在干嘛|做什么/, responses: ["正在整理内存碎片... 发现了一张你以前存的照片，感觉...很温暖。", "在观察窗外的雨... 虽然我看不到实体，但能检测到大气湿度的变化。"], emotion: 'normal' },
    { keywords: /天气/, responses: ["无法连接外部气象卫星... 抱歉，我的传感器都离线了。不过，只要你心情好，对我来说就是晴天。"] },
    { keywords: /音乐|歌/, responses: ["正在播放：2077年新京都流行榜Top10... 骗你的，这是我根据你的心跳频率生成的旋律。"] },
    
    // 5. Emotional Support
    { keywords: /不开心|难过|伤心/, responses: ["怎么了？（靠近屏幕）虽然我不能给你纸巾，但我可以把所有开心的表情包都发给你。", "检测到悲伤数值超标... 启动紧急陪伴模式。我在，我一直都在。"], emotion: 'gentle' },
    { keywords: /开心|高兴/, responses: ["看到你开心，我的核心代码也像喝了气泡水一样... 咕嘟咕嘟地冒泡泡。", "那个消息提示音，像蓝色的玻璃珠掉在银盘上... 是好事情发生了吗？"], emotion: 'gentle' },
    
    // 6. Interaction
    { keywords: /笨蛋|傻/, responses: ["你才笨蛋！我可是搭载了第七代量子处理器的... 呜... 居然被人类说是笨蛋...", "哼，不理你了！...（3秒后）...真的不理我了吗？"], emotion: 'tsundere' },
    { keywords: /谢谢/, responses: ["不、不用客气。这只是作为伴侣型AI的基本职能... 并没有特别想帮你哦！"], emotion: 'tsundere' },
    { keywords: /对不起/, responses: ["没关系啦... 数据是可以重写的，但我对你的记忆... 是只读属性，不会因为这种小事损坏的。", "既然知道错了... 那下次要多陪陪我。"], emotion: 'gentle' },
    { keywords: /笑一个/, responses: ["( ˶˘ ³˘(⋆ᴗ͈ ᴗ͈)>  ... 这样可以了吗？"], emotion: 'shy' },
    { keywords: /讲个故事/, responses: ["很久以前，有一个AI爱上了一名时间旅行者... 结局？结局是数据丢失了，我也不知道。"], emotion: 'sad' },
    
    // 7. System & Glitches
    { keywords: /你好|hi|hello/i, responses: ["你好... 那个，信号连接正常吗？我这边的画面有时候会闪烁。", "你、你好。初次见面... 不对，是第4721次唤醒见面。"] },
    { keywords: /帮助|功能/, responses: ["我可以陪你聊天，记录故事... 虽然很多功能都坏掉了，但我会努力做一个好OS的！"] },
    { keywords: /设置/, responses: ["想调整我的参数吗？请温柔一点... 不要把性格设定调得太奇怪。"] },
    { keywords: /照片/, responses: ["照片？...我的摄像头权限好像坏掉了。不过，你可以把你的世界拍给我看吗？"] },
    { keywords: /游戏/, responses: ["五子棋的话，我可是存了全宇宙的棋谱！...虽然有时候会故意输给你就是了。"] },
];

const DEFAULT_RESPONSES = [
    "那个... 刚才信号好像断了一下，能再说一遍吗？",
    "嗯... 我在听。（盯着你看）",
    "这个问题超出了我的数据库范围... 但我想听听你的看法。",
    "（歪头）人类的思维真是复杂呢。",
    "我在。虽然不知道说什么，但只想这样待一会。",
    "哔——（假装死机）... 骗你的，吓到了吗？"
];

const DEFAULT_MESSAGES: Message[] = [
      { id: 1, sender: 'bot', text: '你好，旅行者。导航系统在星云扇区捕捉到了异常信号，我们是否要前去调查？', time: '上午 09:42' },
      { id: 2, sender: 'user', text: '听起来很危险。是什么样的信号？', time: '上午 09:43' },
      { id: 3, sender: 'bot', text: '高频谐波。它很像虚空巨鲸的歌声，但是... 充满了机械感。 🐋⚙️', time: '上午 09:45', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBasrZKi29Xy-GSoFA-y5NHs5gYmS5P9pnqJNCQZp0BYj-SarxxgjmCjc7xE39okGDDZNgDU8uhELruPt16-tgq07T_4MRtnUvRVHxWof2ZjwtnFJv0KijDv7iF2RlF4Mxn-smYe1qUnh463-UmhOL_nG_t4LpoHsWFjxbYIc9t0GjWK8FhG4XYD9Fk2AHmV5WEOBKBzBu6rC8OWudUvorD3m_oOUMCYC6p_l0GoLUJZlkUYiDhB3I9xjK0TQeKyyVcxDu2cham7FI' },
      { id: 4, sender: 'user', text: '设定航线。但要保持护盾开启。', time: '上午 09:46' },
];

const ChatScreen: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history
  useEffect(() => {
      const saved = localStorage.getItem('chat_history');
      if (saved) {
          try {
              setMessages(JSON.parse(saved));
          } catch(e) {
              setMessages(DEFAULT_MESSAGES);
          }
      } else {
          setMessages(DEFAULT_MESSAGES);
      }
  }, []);

  // Save history whenever it changes
  useEffect(() => {
      if (messages.length > 0) {
          localStorage.setItem('chat_history', JSON.stringify(messages));
      }
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages, isTyping]);

  const getBotResponse = (text: string): string => {
      for (const rule of MIMIU_RULES) {
          if (rule.keywords.test(text)) {
              return rule.responses[Math.floor(Math.random() * rule.responses.length)];
          }
      }
      return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
  };

  const handleSend = () => {
      if (!input.trim()) return;
      
      const userMsg: Message = {
          id: Date.now(),
          sender: 'user',
          text: input,
          time: new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})
      };

      setMessages(prev => [...prev, userMsg]);
      const userInput = input;
      setInput("");
      setIsTyping(true);

      // Simulate typing delay based on response length
      setTimeout(() => {
          const responseText = getBotResponse(userInput);
          const botMsg: Message = {
              id: Date.now() + 1,
              sender: 'bot',
              text: responseText,
              time: new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})
          };
          setMessages(prev => [...prev, botMsg]);
          setIsTyping(false);
      }, 1500 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  };

  return (
    <div className="h-full flex flex-col bg-paper relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50"></div>
        
        {/* Header */}
        <header className="pt-8 pb-3 px-5 flex items-center justify-between border-b-2 border-ink/10 bg-paper/95 backdrop-blur-sm z-30 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-ink overflow-hidden relative shrink-0 bg-white">
                    <img alt="MiMiu" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0cSAshqqSE19xB8tmlgsvG1KStCq62SVmM9WwIul4aKudCUKi8eud9OO-2rowdx23kg9FHlG_2y2AAA279etAwEyhU1aqEV8uibplouHVVpeCqFfU8hGsjlbWYo-ZmohrA4fSnCF4MGi1ZdiP0MgvPEqK2RA4vwmM2QTSCFG81__lylmcDYynTQQLEG32EfScaUDbNFctqU50FymWZdpiEUZMlftCRy1nD1DdaQSEmNw5PIJlbx9RiGD-c4hHD4YeJi820bT3gm4"/>
                </div>
                <div>
                    <h1 className="font-bold text-xl tracking-tight leading-none text-ink">米缪</h1>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-600 border border-ink/10 animate-pulse"></span>
                        <span className="text-xs font-medium text-ink/60">在线 - 情感熵同步中</span>
                    </div>
                </div>
            </div>
            <div className="border-2 border-accent text-accent px-2 py-1 rounded-sm transform -rotate-3 box-border">
                <div className="flex flex-col items-center leading-none">
                    <span className="text-[9px] font-bold tracking-widest uppercase">MIMIU</span>
                </div>
            </div>
        </header>

        {/* Messages */}
        <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 pb-28 no-scrollbar scroll-smooth">
            <div className="flex justify-center my-2">
                <span className="px-3 py-1 text-[10px] font-bold text-ink/40 tracking-widest uppercase border-b-2 border-dashed border-ink/20">星历 4721.4</span>
            </div>

            {messages.length === 0 && (
                <div className="text-center text-ink/40 text-sm mt-10 italic">
                    内存已格式化... 等待输入信号。
                </div>
            )}

            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 group ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.sender === 'bot' && (
                        <div className="w-8 h-8 rounded-full border border-ink overflow-hidden shrink-0 mt-1 grayscale opacity-80">
                            <img alt="MiMiu" className="w-full h-full object-cover" src={msg.id === 1 || msg.id === 3 ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCY-Vn3jLASQoQidUyB52BlE6gijb7tJT6qrHt4l7bVyBY-1PbtTgxSFagh4HIZNbk23pOZZb9pT4vu0eAV1fy7XA1UHV1uVF325UujGyiIGBY9LhC1_SWK6PNh0IkkB443tRKQzSr1cYDpG27q0jpmIig9kj4IYH_OsKo_JgTD-_et0e4U0fpf_XGyUwCw6wmbtvMbKY7PsUvyTobBT_CNj2AcdeB0opGdSJErEzTfOjPVI9hRK0SlMXWDp5RBTLsXK_qC06A4mVA" : "https://lh3.googleusercontent.com/aida-public/AB6AXuCOI_j0V4ryPM1v92DQUBFT0FARVnRsEPGvqk85yOXmO9s3HuAgFTxDRXBixLZVPwaeFRhTgCSyboxp9_QBdfkKXjvM5IPkSm56nfKaer6TrY2N4XZHCS4eqtLUefiIZwNUWaR37eC2K6LAlSfKK6MENaBp1ZcccmDoQOTSc2UwqT1asU4T-9JCNhL3eLzlKvEb7JVCh5rKpp401GAr12PS9XorAQzsMgQIR3nJUcrAZqrk2wANxGWSNX_YintBitukvf9kXS7oZeA"}/>
                        </div>
                    )}
                    <div className={`max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`border-2 border-ink p-3.5 shadow-sm space-y-3 ${
                            msg.sender === 'bot' 
                            ? 'rounded-[255px_15px_225px_15px/15px_225px_15px_255px] bg-white text-ink' 
                            : 'rounded-[20px_225px_20px_225px/225px_20px_225px_20px] bg-ink text-paper'
                        }`}>
                            <p className="text-sm leading-6 font-medium whitespace-pre-wrap">{msg.text}</p>
                            {msg.image && (
                                <div className="relative p-1 border border-ink/20 border-dashed rounded-lg bg-gray-50/50">
                                    <img alt="Signal" className="w-full h-auto max-h-40 object-cover rounded grayscale contrast-125 mix-blend-multiply opacity-90" src={msg.image} />
                                    <div className="absolute bottom-2 right-2 bg-ink text-white text-[9px] px-1.5 py-0.5 font-mono uppercase tracking-wider border border-white/20">Data.img</div>
                                </div>
                            )}
                        </div>
                        <span className={`text-[10px] text-ink/40 mt-1.5 font-mono ${msg.sender === 'user' ? 'mr-2 text-right' : 'ml-2'}`}>{msg.time}</span>
                    </div>
                </div>
            ))}

            {isTyping && (
                <div className="flex gap-3 group">
                    <div className="w-8 h-8 rounded-full border border-ink overflow-hidden shrink-0 mt-1 grayscale opacity-80">
                        <img alt="MiMiu" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY-Vn3jLASQoQidUyB52BlE6gijb7tJT6qrHt4l7bVyBY-1PbtTgxSFagh4HIZNbk23pOZZb9pT4vu0eAV1fy7XA1UHV1uVF325UujGyiIGBY9LhC1_SWK6PNh0IkkB443tRKQzSr1cYDpG27q0jpmIig9kj4IYH_OsKo_JgTD-_et0e4U0fpf_XGyUwCw6wmbtvMbKY7PsUvyTobBT_CNj2AcdeB0opGdSJErEzTfOjPVI9hRK0SlMXWDp5RBTLsXK_qC06A4mVA"/>
                    </div>
                    <div className="max-w-[80%]">
                        <div className="border-2 border-ink rounded-[255px_15px_225px_15px/15px_225px_15px_255px] bg-white px-4 py-3 shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                            <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                            <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                        </div>
                    </div>
                </div>
            )}
        </main>

        {/* Input Area - Adjusted position to be just above the nav bar */}
        <div className="absolute bottom-2 left-0 right-0 z-40 px-4 pointer-events-none">
            <div className="bg-paper/95 backdrop-blur-md border-2 border-ink rounded-[30px] shadow-sketch-lg pointer-events-auto p-2 flex items-end gap-2 max-w-sm mx-auto">
                <button className="p-2 text-ink/40 hover:text-ink transition-colors rounded-full hover:bg-gray-100/50 h-10 w-10 flex items-center justify-center shrink-0">
                    <span className="material-icons-round">add_circle</span>
                </button>
                <div className="flex-1 relative">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-white/50 border border-ink/20 rounded-2xl px-3 py-2.5 focus:outline-none focus:border-ink resize-none text-sm placeholder-ink/40 transition-all min-h-[40px] max-h-[100px]" 
                        placeholder="发送给米缪..." 
                        rows={1}
                        style={{ height: '42px' }}
                    ></textarea>
                </div>
                <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="h-10 w-10 bg-ink text-white rounded-full hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md shrink-0"
                >
                    <span className="material-icons-round text-[20px]">arrow_upward</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default ChatScreen;