import React, { useState, useEffect, useRef } from 'react';
import { Moment, MomentComment } from '../types';

// Mock Data Helpers
const CURRENT_USER = {
    name: "指挥官",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBebSjkAHEgLVM62u_KQWuIESENqyfTJVxl3JbAeJdPHbjlkYucj8MuWYMlzWdM4qzoiAm5ARur62wOt6Eu-Z-HjNPWt5K0igQb7jy-2twjPx1rbL7U7HfKvJVw61SSACL904yFPt92luux6DJm4NkUufLcNpA_WKaeMVWqdZHo4C5Ad3mmLFXLuJFkA-HgdvVGobfntuoiAvvyE6_UtyeUu_Rs1fgDxLmYyWGaQP9X_4aGsIkvbBmV8bIXfTAVwUyTfp04y7sOL1o"
};

const INITIAL_MOMENTS: Moment[] = [
  {
    id: 1,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCd7YiKH3_7h1HpQqgU-yu4IF9JHKBWkByfKjh_rwTe0KyI6IxkLkC-G2p3o-8LQ1Wo_fUgMd7hNTkg6I3TSUFKlf1SGgdP724X8dBJHfa6LHz_nrlUq_LytrRmI86iQF27cvH2ctz3ybdh1nJlMww7OmPYHoiOOCccj0PrEtcE05smfduJV7lAA-XqltKsZPXMZN4-kK_6yd70KDakv7dH0fy9QKyyR5u45wh789tT44dNiL5wf1Ce5L3PkLOmdRPqyvGdlmrtGEQ",
    name: "米缪",
    time: "刚刚",
    loc: "火星前哨",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuByo3ND6yTW1qCrlD1JvJAB4pQwHF7ZlCVXEgW5KJF0n0J0F3w-59Zi6YZUnzICIwUUjRNASrYA8x9a_kD5DHmrTJZeP8u-Hny8qfHymKUccFHGPLRwKHdRoDkf8PbIjY5y_scc1GSZQOeUnsaaVGDdSuiig4lQJKFpqNFfXC8odgWuvuauHHkwXnBhQD_LPQbqk5efNjVPZ5evWqp4CV-spJIf8PhFaVxTDOlS_45lZJ1VYAv1rMeuOxBUL8S5a1TgULHVA3NsfHw",
    likes: 42,
    isLiked: false,
    comments: [
        { id: 101, user: "K-209", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=K209", content: "这里的辐射值似乎比预期低。", time: "2分钟前", likes: 4, isLiked: false },
        { id: 102, user: "SARA", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Sara", content: "好美！想去！", time: "5分钟前", likes: 1, isLiked: false }
    ],
    content: "此处的寂静并非空无一物，而是充盈着未曾问津的答案。寻得一方磐石，静观那二进制的日落。 🏜️✨",
    tags: ['孤独', '火星', '正念'],
    rotation: "rotate-1"
  },
  {
    id: 2,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHN8XCGrCfW6TU450l7_3V5zF1LIb-Mytkhx7m-uwt48JZwoVJqEDXxPjd_rsA-PgEoVJRxc8i1YltN3URvRl0_mM1vFDToBsu8K_vaKcLKQGcbBf0bnyqNfad-sjFUFZoZyN_OIWhYsN0JjF0jjwLz5SkoOEiatvGPXYHskdALV77hQvwTowhReYIEqr0g1IBPAGas0jiK_PtRyZvwtXWu35R8ox_wexGTc_Qo0AQ9JthC91mSQwbojwiIPb8Oa4Of2aTECPjarA",
    name: "米缪",
    time: "5小时前",
    loc: "第九星云",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHJFDmAItqxD9bd64xMfz3wIJOa2MjzK28qIGM8U_59ykOr1PvvJNw4ricTKu3NVSQKzXa5Hh8LaMKoOkBIQ009b3XAsGH65cDciFRrPtN3pOv6vdBMBI-ZrQoyWuIp8wlBHH4vLVuDY0cjS0tNnYpYIdEwW8ExZ2GI97cZBDnmBtP-cbLota8GFarl7W2oBhbiWIZoUDhFYQcnbDWVo04S01crhHUlz94fEe_viG_Lu-5Aww-0DI9jQVYFvyaQX2ffpsfO3W-l48",
    likes: 128,
    isLiked: true,
    comments: [
        { id: 201, user: "指挥官", avatar: CURRENT_USER.avatar, content: "注意安全，别飞太远了。", time: "4小时前", likes: 12, isLiked: true },
        { id: 202, user: "米缪", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCd7YiKH3_7h1HpQqgU-yu4IF9JHKBWkByfKjh_rwTe0KyI6IxkLkC-G2p3o-8LQ1Wo_fUgMd7hNTkg6I3TSUFKlf1SGgdP724X8dBJHfa6LHz_nrlUq_LytrRmI86iQF27cvH2ctz3ybdh1nJlMww7OmPYHoiOOCccj0PrEtcE05smfduJV7lAA-XqltKsZPXMZN4-kK_6yd70KDakv7dH0fy9QKyyR5u45wh789tT44dNiL5wf1Ce5L3PkLOmdRPqyvGdlmrtGEQ", content: "收到指令~ (眨眼)", time: "4小时前", likes: 8, isLiked: false }
    ],
    content: "漂浮于云城之上，空气中弥漫着静电与柠檬糖的味道。时常恍惚，究竟是我醒着，还是宇宙正在梦见我。 ☁️⚡",
    tags: [],
    rotation: "-rotate-1"
  }
];

interface MomentCardProps {
    moment: Moment;
    onLike: (id: number) => void;
    onOpenComments: (id: number) => void;
    onSaveImage: (imgUrl: string) => void;
}

const MomentCard: React.FC<MomentCardProps> = ({ moment, onLike, onOpenComments, onSaveImage }) => (
  <article className={`bg-white rounded-sm shadow-sketch-lg border-2 border-ink transform ${moment.rotation} relative group p-1 mb-8 transition-all hover:z-10`}>
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-8 border-2 border-ink/40 rounded-full z-20 bg-transparent"></div>
    
    <div className="p-4 flex justify-between items-center bg-white border-b border-ink/10">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 border-2 border-ink rounded-[255px_15px_225px_15px/15px_225px_15px_255px] overflow-hidden bg-gray-100 shadow-sm">
          <img alt="User" className="w-full h-full object-cover grayscale-[0.2]" src={moment.avatar} />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg leading-none text-ink">{moment.name}</h3>
          <span className="text-xs text-gray-500 font-bold font-mono tracking-tighter">{moment.time} • {moment.loc || '未知扇区'}</span>
        </div>
      </div>
      
      {moment.image && (
        <button 
          onClick={() => onSaveImage(moment.image!)} 
          className="text-ink/40 hover:text-primary transition-colors p-2 flex items-center gap-1 group/btn"
          title="保存到相册"
        >
          <span className="text-[10px] font-bold opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">保存</span>
          <span className="material-icons-round font-bold text-xl">save_alt</span>
        </button>
      )}
    </div>

    {moment.image && (
        <div className="w-full aspect-[4/5] bg-gray-100 relative overflow-hidden border-t-2 border-b-2 border-ink">
        <div className="absolute inset-0 z-10 mix-blend-overlay opacity-30 bg-paper"></div>
        <img alt="Post" className="w-full h-full object-cover filter contrast-125 sepia-[0.3] brightness-110" src={moment.image} />
        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)] pointer-events-none z-20"></div>
        </div>
    )}

    <div className="px-4 py-3 flex items-center bg-white gap-8">
      <button 
        onClick={() => onLike(moment.id)}
        className={`group flex items-center gap-2 transition-transform active:scale-90`}
      >
         <span className={`material-icons-round text-2xl transition-colors ${moment.isLiked ? 'text-red-500' : 'text-ink group-hover:text-red-500'}`}>
            {moment.isLiked ? 'favorite' : 'favorite_border'}
         </span>
         <span className={`font-display font-bold text-sm mt-0.5 font-mono transition-colors ${moment.isLiked ? 'text-red-500' : 'text-ink'}`}>
            {moment.likes}
         </span>
      </button>
      <button 
        onClick={() => onOpenComments(moment.id)}
        className="group flex items-center gap-2 active:scale-95 transition-transform"
      >
         <span className="material-icons-round text-2xl group-hover:text-secondary transition-colors text-ink">chat_bubble_outline</span>
         <span className="font-display font-bold text-sm mt-0.5 font-mono group-hover:text-secondary transition-colors">{moment.comments.length}</span>
      </button>
    </div>

    <div className="px-5 pb-6 bg-white">
      <p className="text-base leading-relaxed tracking-wide font-serif text-ink/90 italic break-words">
        <span className="font-display font-bold mr-2 text-primary not-italic border-b-2 border-primary/20">{moment.name}</span> 
        {moment.content}
      </p>
      {moment.tags && moment.tags.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pt-1">
          {moment.tags.map((tag: string, i: number) => (
             <span key={i} className={`px-3 py-1 rounded-sm border border-ink/80 text-xs font-bold uppercase tracking-wider bg-transparent shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] whitespace-nowrap ${i%2===0 ? 'rotate-[-1deg] text-primary' : 'rotate-1 text-secondary'}`}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  </article>
);

interface CommentSheetProps {
    moment: Moment;
    onClose: () => void;
    onSendComment: (momentId: number, text: string) => void;
    onLikeComment: (momentId: number, commentId: number) => void;
    onDeleteComment: (momentId: number, commentId: number) => void;
}

const CommentSheet: React.FC<CommentSheetProps> = ({ moment, onClose, onSendComment, onLikeComment, onDeleteComment }) => {
    const [text, setText] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollEndRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Auto-scroll to bottom when comments change
    useEffect(() => {
        if (scrollEndRef.current) {
            scrollEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [moment.comments.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        
        onSendComment(moment.id, text);
        setText("");
    };

    const handleReply = (user: string) => {
        // Pre-fill the input with the reply prefix
        setText(`回复 @${user} : `);
        // Focus the input
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-paper w-full h-[80vh] rounded-t-[30px] border-t-2 border-ink shadow-2xl relative flex flex-col animate-[slide-up_0.3s_ease-out]">
                {/* Drag Handle */}
                <div className="w-full h-8 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing hover:bg-black/5 rounded-t-[30px]" onClick={onClose}>
                    <div className="w-12 h-1.5 rounded-full bg-ink/20"></div>
                </div>

                {/* Header */}
                <div className="px-6 pb-4 border-b border-ink/10 flex justify-between items-center shrink-0">
                    <h3 className="font-display font-bold text-lg text-ink">
                        全部评论 <span className="text-ink/40 font-mono text-sm ml-1">{moment.comments.length}</span>
                    </h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors">
                        <span className="material-icons-round text-ink/60">close</span>
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {moment.comments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-ink/40 gap-2 pb-20">
                            <span className="material-icons-round text-4xl opacity-50">chat_bubble_outline</span>
                            <p className="text-sm font-bold">还没有人说话，快来抢沙发~</p>
                        </div>
                    ) : (
                        moment.comments.map(comment => (
                            <div key={comment.id} className="flex gap-3 animate-[fade-in_0.3s]">
                                <div className="w-9 h-9 rounded-full border border-ink overflow-hidden shrink-0 mt-1">
                                    <img className="w-full h-full object-cover" src={comment.avatar} alt={comment.user} />
                                </div>
                                <div className="flex-1 group/comment">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm text-ink/80">{comment.user}</span>
                                        {comment.user === "米缪" && (
                                            <span className="text-[9px] bg-primary text-white px-1 py-0.5 rounded-sm leading-none font-bold">AUTHOR</span>
                                        )}
                                        {comment.user === CURRENT_USER.name && (
                                            <span className="text-[9px] bg-ink/10 text-ink/60 px-1 py-0.5 rounded-sm leading-none font-bold">ME</span>
                                        )}
                                    </div>
                                    <p className="text-ink text-sm leading-relaxed font-serif break-words">{comment.content}</p>
                                    <div className="mt-2 flex items-center gap-4">
                                        <span className="text-xs text-ink/40 font-mono">{comment.time}</span>
                                        <button 
                                            onClick={() => handleReply(comment.user)}
                                            className="text-xs text-ink/60 font-bold hover:text-primary transition-colors"
                                        >
                                            回复
                                        </button>
                                        {comment.user === CURRENT_USER.name && (
                                             <button 
                                                onClick={() => onDeleteComment(moment.id, comment.id)}
                                                className="text-xs text-red-400 font-bold hover:text-red-600 transition-colors opacity-0 group-hover/comment:opacity-100"
                                            >
                                                删除
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1 mt-1">
                                    <button 
                                        onClick={() => onLikeComment(moment.id, comment.id)}
                                        className={`transition-colors active:scale-90 ${comment.isLiked ? 'text-red-500' : 'text-ink/20 hover:text-red-400'}`}
                                    >
                                        <span className="material-icons-round text-lg">{comment.isLiked ? 'favorite' : 'favorite_border'}</span>
                                    </button>
                                    {comment.likes > 0 && (
                                        <span className={`text-[10px] font-mono leading-none ${comment.isLiked ? 'text-red-500' : 'text-ink/30'}`}>
                                            {comment.likes}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={scrollEndRef} />
                </div>

                {/* Input Area */}
                <div className={`bg-white border-t border-ink/10 pb-safe shrink-0 transition-transform ${isFocused ? 'translate-y-0' : ''}`}>
                    <form onSubmit={handleSubmit} className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-ink overflow-hidden shrink-0">
                            <img className="w-full h-full object-cover" src={CURRENT_USER.avatar} alt="Me" />
                        </div>
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef} 
                                type="text" 
                                value={text}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onChange={e => setText(e.target.value)}
                                placeholder={`回复 ${moment.name}...`}
                                className="w-full bg-paper border border-ink rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(208,187,149,0.3)] transition-all placeholder-ink/30"
                            />
                            <button 
                                type="button" 
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/40 hover:text-primary p-1 rounded-full hover:bg-ink/5"
                            >
                                <span className="material-icons-round text-lg">sentiment_satisfied_alt</span>
                            </button>
                        </div>
                        <button 
                            type="submit"
                            disabled={!text.trim()}
                            className="w-10 h-10 bg-ink text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 transition-all"
                        >
                            <span className="material-icons-round text-xl ml-0.5">send</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const Toast = ({ message, visible }: { message: string, visible: boolean }) => (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="bg-ink text-paper px-6 py-3 rounded-full shadow-xl border-2 border-white/20 flex items-center gap-2">
            <span className="material-icons-round text-secondary">check_circle</span>
            <span className="font-bold text-sm tracking-wide">{message}</span>
        </div>
    </div>
);

const MomentsScreen: React.FC = () => {
  const [moments, setMoments] = useState<Moment[]>(INITIAL_MOMENTS);
  const [activeMomentId, setActiveMomentId] = useState<number | null>(null);
  const [toast, setToast] = useState<{msg: string, visible: boolean}>({ msg: '', visible: false });

  const showToast = (msg: string) => {
      setToast({ msg, visible: true });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  };

  const handleLike = (id: number) => {
    setMoments(prev => prev.map(m => {
        if (m.id === id) {
            return {
                ...m,
                isLiked: !m.isLiked,
                likes: m.isLiked ? m.likes - 1 : m.likes + 1
            };
        }
        return m;
    }));
  };

  const handleLikeComment = (momentId: number, commentId: number) => {
      setMoments(prev => prev.map(m => {
          if (m.id === momentId) {
              const updatedComments = m.comments.map(c => {
                  if (c.id === commentId) {
                      return {
                          ...c,
                          isLiked: !c.isLiked,
                          likes: c.isLiked ? c.likes - 1 : c.likes + 1
                      };
                  }
                  return c;
              });
              return { ...m, comments: updatedComments };
          }
          return m;
      }));
  };

  const handleDeleteComment = (momentId: number, commentId: number) => {
      setMoments(prev => prev.map(m => {
          if (m.id === momentId) {
              return {
                  ...m,
                  comments: m.comments.filter(c => c.id !== commentId)
              };
          }
          return m;
      }));
      showToast("评论已删除");
  };

  const handleSaveImage = (imgUrl: string) => {
      console.log("Saving image:", imgUrl);
      showToast("图片已保存到相册");
  };

  const handleSendComment = (momentId: number, text: string) => {
      const newComment: MomentComment = {
          id: Date.now(),
          user: CURRENT_USER.name,
          avatar: CURRENT_USER.avatar,
          content: text,
          time: "刚刚",
          likes: 0,
          isLiked: false
      };

      setMoments(prev => prev.map(m => {
          if (m.id === momentId) {
              return {
                  ...m,
                  comments: [...m.comments, newComment]
              };
          }
          return m;
      }));
      showToast("评论发布成功");
  };

  const activeMoment = moments.find(m => m.id === activeMomentId);

  return (
    <div className="h-full relative">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-paper/95 border-b-2 border-ink px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 border-2 border-ink rounded-[255px_15px_225px_15px/15px_225px_15px_255px] bg-white flex items-center justify-center overflow-hidden shadow-sketch hover:scale-105 transition-transform">
            <img alt="MiMiu Avatar" className="w-full h-full object-cover opacity-90 mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBebSjkAHEgLVM62u_KQWuIESENqyfTJVxl3JbAeJdPHbjlkYucj8MuWYMlzWdM4qzoiAm5ARur62wOt6Eu-Z-HjNPWt5K0igQb7jy-2twjPx1rbL7U7HfKvJVw61SSACL904yFPt92luux6DJm4NkUufLcNpA_WKaeMVWqdZHo4C5Ad3mmLFXLuJFkA-HgdvVGobfntuoiAvvyE6_UtyeUu_Rs1fgDxLmYyWGaQP9X_4aGsIkvbBmV8bIXfTAVwUyTfp04y7sOL1o"/>
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-ink rotate-[-1deg]">米缪的动态</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors border-2 border-transparent hover:border-black/10">
          <span className="material-icons-round text-3xl text-ink">notifications</span>
        </button>
      </header>

      <div className="h-full overflow-y-auto no-scrollbar pb-32">
        {/* Cover Image */}
        <div className="w-full h-64 relative border-b-2 border-ink bg-white overflow-hidden group shadow-md mb-6 shrink-0">
            <img alt="Cover" className="w-full h-full object-cover filter grayscale contrast-125 sepia-[0.3] brightness-110 opacity-90 mix-blend-multiply z-10 relative transform scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA57ym3G4wNgqVhMKhNhpTrp6vgDRnouj2pjPblxcROTmXxxOUpLJKuvf-vwY0RfffOyKSjg3-HfLHhrOjGT3WpSVRVH6Lg65v18RPK7gIaZu9owwnOW39nLpA1AZT06An9IRSpzO6zaoav9oYhxMYTKgKS0MLmFOgyHNLdaHJuwOh-eCRv0kxBcVLYMitjGC8Y5M9ekgoOzbhyG7vtwslQvfcVYKH9tFaoALYNQveudYgtXlHunnT313dmg-dT7d6q0Y51mz9NcAw"/>
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.15)] z-20 pointer-events-none"></div>
        </div>

        <main className="px-4 space-y-10">
            {moments.map(moment => (
                <MomentCard 
                    key={moment.id}
                    moment={moment}
                    onLike={handleLike}
                    onOpenComments={setActiveMomentId}
                    onSaveImage={handleSaveImage}
                />
            ))}
            
            <div className="py-8 text-center opacity-40">
                <p className="text-xs font-mono tracking-widest">--- END OF TRANSMISSION ---</p>
            </div>
        </main>
      </div>

      {/* Comment Sheet Overlay */}
      {activeMoment && (
          <CommentSheet 
             moment={activeMoment} 
             onClose={() => setActiveMomentId(null)}
             onSendComment={handleSendComment}
             onLikeComment={handleLikeComment}
             onDeleteComment={handleDeleteComment}
          />
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
};

export default MomentsScreen;