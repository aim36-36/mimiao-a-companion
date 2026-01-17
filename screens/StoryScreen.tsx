import React, { useState, useEffect, useRef } from 'react';
import { StoryView, CGItem } from '../types';

const cgData: CGItem[] = [
    { id: 1, title: '星际地图', chapter: 'Chapter 1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpTZ9eOSukhWZ7_SsInZ3wCEn4Dhl0tXV79oFbg-C9I4e6t9gTmGhHqx04I6idPDUMd6sY5fgkvgy69IZLP2xeyI0VlxYeldD4YD3DpHgm41dtuZRX5BfbzysedUl5RIYdYVmMCRlBR-wzrk3OCNQAq4w8mdx3-UVcigNKX53OCRgVrW1xYW_IJi64xgywMhHEzgJ45YEGABDcfc4HDIysqzpmtbFa75vpZW3PdB4ij12aGwh9Vy1JTQrrK6vhw1UZiyg2LZXM-NQ', isLocked: false, isNew: true },
    { id: 2, title: '未来都市', chapter: 'Chapter 2', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6s2WFMCbD4CKucxYgzyivTNI06yVvnjoIjwnsfScZ73rg2j-5rB9nmLy5tvNpGwmTFPPLXBQHiA9yO_AfCbh1qLK-IyeQ222JrYSIijrafODuj9_K3zJb4HnmxWnGv3tuoeVpDxENj_2NXaANO3q61q3bd9WZofns3ly6fkIXfqQVRx18GBrWplIOnCrb35oA4cnAkg8NQN94pCAdulk072OHUZOBbZG_PxRyE2NuFxD-fd6AjyZcqpCE3ClXYe9HKwfmswyPpmE', isLocked: false },
    { id: 3, title: '机械花朵', chapter: 'Side Story', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDn2E_nSgO6u7k0WQoAn0GhUhNTGcUaGR_5AzAIYgqQjsIODv6z1DDtxsSL65nchVwgu2H1wFZN0_jHE9BBh1Xx30y6tAAlAVR8h49Xf-Xi1Rrw_Uac1FDCGRvb1lkVtL4ctt9WvDOqa4yKl75YPs1kDtD-oJLuM8Th68az4-GWV9Y_xGWlOFxmklK6Wgog8qf0z96YLEpywBJsvcTyETybdh1nJlMww7OmPYHoiOOCccj0PrEtcE05smfduJV7lAA-XqltKsZPXMZN4-kK_6yd70KDakv7dH0fy9QKyyR5u45wh789tT44dNiL5wf1Ce5L3PkLOmdRPqyvGdlmrtGEQ', isLocked: false },
    { id: 4, title: '未解锁', chapter: 'Chapter 3', image: '', isLocked: true },
];

interface StorySettings {
    textSpeed: number; // 1-100, higher is faster
    autoSpeed: number;
    opacity: number;
    bgm: boolean;
}

const Toast = ({ message, visible }: { message: string, visible: boolean }) => (
    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] transition-all duration-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="bg-ink text-paper px-6 py-4 rounded-xl shadow-2xl border-2 border-white/20 flex flex-col items-center gap-2 min-w-[150px]">
            <span className="material-icons-round text-secondary text-3xl">check_circle</span>
            <span className="font-bold text-sm tracking-wide text-center">{message}</span>
        </div>
    </div>
);

const StoryScreen: React.FC = () => {
    const [view, setView] = useState<StoryView>(StoryView.MENU);
    const [selectedCG, setSelectedCG] = useState<CGItem | null>(null);
    const [toast, setToast] = useState<{msg: string, visible: boolean}>({ msg: '', visible: false });
    const [settings, setSettings] = useState<StorySettings>({
        textSpeed: 60,
        autoSpeed: 40,
        opacity: 90,
        bgm: true
    });

    // Scene State
    const [dialogText, setDialogText] = useState("那个... 指挥官，昨晚的数据... 我好像弄丢了一部分... 那些关于「感动」的数据碎片，怎么也找不到了。");
    const [displayedText, setDisplayedText] = useState("");
    const [isPaused, setIsPaused] = useState(false);
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Typewriter Effect
    useEffect(() => {
        if (view === StoryView.VN_SCENE && !isPaused && !showSaveMenu && !showHistory) {
            let currentIndex = 0;
            setDisplayedText(""); // Reset on new dialog
            const speed = 110 - settings.textSpeed; // Map 1-100 to delay ms (10ms to 110ms)
            
            const timer = setInterval(() => {
                if (currentIndex < dialogText.length) {
                    setDisplayedText(prev => dialogText.slice(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    clearInterval(timer);
                }
            }, speed);

            return () => clearInterval(timer);
        }
    }, [view, dialogText, settings.textSpeed, isPaused, showSaveMenu, showHistory]);

    const showToast = (msg: string) => {
        setToast({ msg, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
    };

    const handleSaveCG = () => {
        showToast("CG 已保存到相册");
    };

    const handleSaveGame = () => {
        showToast("游戏进度已保存");
        setShowSaveMenu(false);
    };

    const handleLoadGame = (slotId: number) => {
        showToast(`读取存档 ${slotId} 成功`);
        setView(StoryView.VN_SCENE);
        // Reset dialog for demo
        setDialogText("正在读取记忆数据... 指挥官，欢迎回来。");
    };

    // --- SUB-COMPONENT: MENU ---
    const renderMenu = () => (
        <div className="h-full relative p-6 flex flex-col justify-between overflow-hidden">
             {/* Background */}
             <div className="absolute inset-0 z-0">
                <img alt="Bg" className="w-full h-full object-cover opacity-80 mix-blend-multiply grayscale contrast-125 brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9McgE_hJ6QxPj25_Q5UoClwMU6w46xtAM3lP4gVUe8k9by4JlwVW0ZKq78BWLGjtJJrSseJjQpkmNclQujwJYk9X7eQ0piGBHjRZo541rIW7r770XaOV6GoCAwW5R3HUJBS34ffvJPwtb-IvmEhEBV3W6te4XVgMhQVX_h66oKT_043lqyvHFGklu4yhp7C7_TNLPAcXu-DvGwogkRV6zKqKXdxRfZ0xSshFV4AmvIeL1m0gPrD5jVIx4pKisAwa5VHX6GnWUeAw"/>
                <div className="absolute inset-0 bg-paper/60 mix-blend-lighten"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-paper/20 to-paper/80"></div>
            </div>

            <div className="relative z-10 pt-12">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block w-6 h-[2px] bg-ink/60 rounded-full transform -rotate-2"></span>
                        <span className="text-[10px] font-bold text-ink/60 tracking-[0.2em] uppercase transform rotate-1">第一章</span>
                    </div>
                    <h1 className="font-display text-4xl font-black text-ink leading-[0.9] tracking-tight">
                        米缪的<br/>
                        <span className="text-6xl text-primary drop-shadow-sm italic font-sans">故事</span>
                    </h1>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-sm mx-auto mb-20 space-y-6">
                 {/* Start Button */}
                 <button onClick={() => setView(StoryView.VN_SCENE)} className="group w-full flex items-center justify-between px-6 py-5 bg-white/60 backdrop-blur-sm border-2 border-ink rounded-sketch-1 shadow-sm hover:shadow-sketch hover:-translate-y-0.5 hover:rotate-1 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <span className="material-icons-round text-3xl text-ink/80">explore</span>
                        <span className="font-display text-xl font-bold tracking-widest text-ink">开始故事</span>
                    </div>
                    <span className="material-icons-round text-2xl text-primary transform group-hover:translate-x-1 transition-transform">auto_fix_high</span>
                 </button>

                 <div className="grid grid-cols-2 gap-x-8 w-full px-2 mt-4">
                    <div className="transform -translate-y-2">
                        <button onClick={() => setView(StoryView.LOAD)} className="group w-full flex flex-col items-center justify-center h-24 p-2 bg-white/40 hover:bg-white/60 backdrop-blur-sm border-[1.5px] border-ink rounded-sketch-2 transition-all duration-300 hover:rotate-2">
                            <span className="material-icons-round text-primary text-3xl mb-1 group-hover:scale-110 transition-transform">history_edu</span>
                            <span className="text-xs font-bold text-ink tracking-widest">读取故事</span>
                        </button>
                    </div>
                    <div className="transform translate-y-4">
                        <button onClick={() => setView(StoryView.CG_GALLERY)} className="group w-full flex flex-col items-center justify-center h-24 p-2 bg-white/40 hover:bg-white/60 backdrop-blur-sm border-[1.5px] border-ink rounded-sketch-1 transition-all duration-300 hover:-rotate-2">
                            <span className="material-icons-round text-primary text-3xl mb-1 group-hover:scale-110 transition-transform">auto_awesome_motion</span>
                            <span className="text-xs font-bold text-ink tracking-widest">CG屋</span>
                        </button>
                    </div>
                </div>

                <button onClick={() => setView(StoryView.SETTINGS)} className="w-full flex items-center justify-center gap-2 py-2 mt-6 bg-transparent border-b-[1.5px] border-ink/30 hover:border-ink text-ink/60 hover:text-ink transition-all group">
                    <span className="material-icons-round text-lg group-hover:rotate-90 transition-transform duration-500">settings</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase">故事设置</span>
                </button>
            </div>
        </div>
    );

    // --- SUB-COMPONENT: LOAD ---
    const renderLoad = () => (
        <div className="h-full flex flex-col p-6 pb-28">
            <header className="flex items-center justify-between mb-6">
                <button onClick={() => setView(StoryView.MENU)} className="w-10 h-10 flex items-center justify-center rounded-full border border-ink bg-white/40 hover:bg-ink hover:text-white transition-all">
                    <span className="material-icons-round">arrow_back</span>
                </button>
                <div className="flex items-center gap-2">
                    <span className="material-icons-round text-primary">history_edu</span>
                    <h1 className="font-bold text-xl text-ink tracking-widest">读取故事</h1>
                </div>
                <div className="w-10"></div>
            </header>
            <div className="space-y-4 overflow-y-auto no-scrollbar">
                {[
                    { id: 1, type: '自动', title: '第五章：星际尘埃', time: '2023年11月02日 21:45', active: true },
                    { id: 2, type: '存档1', title: '第三章：机械之心', time: '2023年10月28日 10:20', active: false },
                    { id: 3, type: '存档2', title: '第一章：初遇', time: '2023年10月15日 14:30', active: false },
                ].map((save) => (
                    <button key={save.id} onClick={() => handleLoadGame(save.id)} className="group w-full relative bg-white/70 backdrop-blur-sm border-[1.5px] border-ink p-3 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-300 rounded-sketch-sm shadow-sketch hover:shadow-lg text-left">
                        <div className="h-16 w-20 bg-ink/5 border border-ink/30 rounded-md shrink-0 flex items-center justify-center relative overflow-hidden">
                             {save.active ? <span className="material-icons-round text-ink/20 text-3xl">auto_stories</span> : <div className="w-8 h-8 rounded-full border border-ink/10 bg-white/40"></div>}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-1.5 py-[2px] text-[9px] font-bold ${save.type==='自动' ? 'text-white bg-primary' : 'text-ink border border-ink/20'} rounded-sm transform ${save.id%2===0?'rotate-1':'-rotate-1'}`}>{save.type}</span>
                                <h3 className="font-bold text-ink text-sm truncate">{save.title}</h3>
                            </div>
                            <p className="text-[10px] text-ink/60 font-mono flex items-center gap-1">
                                <span className="material-icons-round text-[10px]">schedule</span>
                                {save.time}
                            </p>
                        </div>
                        <div className="w-10 h-10 flex items-center justify-center rounded-full border-[1.5px] border-ink text-ink group-hover:bg-ink group-hover:text-white transition-colors shadow-sm">
                            <span className="material-icons-round text-xl ml-0.5">play_arrow</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    // --- SUB-COMPONENT: CG GALLERY ---
    const renderCGGallery = () => (
        <div className="h-full flex flex-col p-4 bg-paper/90 overflow-hidden">
             <header className="flex items-center justify-between mb-4 border-b border-ink/10 pb-2">
                <button onClick={() => setView(StoryView.MENU)} className="w-10 h-10 flex items-center justify-center text-ink hover:opacity-70">
                    <span className="material-icons-round text-3xl">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold tracking-wider font-display">CG屋</h2>
                <div className="w-10 flex justify-end"><span className="text-sm font-bold font-mono text-ink/60">3/4</span></div>
             </header>
             <div className="grid grid-cols-2 gap-4 overflow-y-auto no-scrollbar pb-24">
                {cgData.map(cg => (
                    <div key={cg.id} onClick={() => !cg.isLocked && setSelectedCG(cg)} className={`group flex flex-col gap-2 ${cg.isLocked ? 'opacity-70' : 'cursor-pointer'}`}>
                        <div className={`relative p-1.5 border ${cg.isLocked ? 'border-dashed border-ink/30 bg-paper' : 'border-ink/40 bg-white shadow-sketch hover:-translate-y-1'} rounded-sm transition-transform duration-300`}>
                             {cg.isLocked ? (
                                <div className="w-full aspect-[3/4] bg-ink/5 rounded-sm flex flex-col items-center justify-center gap-2 border border-ink/10">
                                    <div className="w-10 h-10 rounded-full border border-ink/40 flex items-center justify-center bg-white/50"><span className="material-icons-round text-ink/60">lock</span></div>
                                    <p className="text-xs text-ink/60 font-medium">未解锁</p>
                                </div>
                             ) : (
                                <div className="w-full aspect-[3/4] bg-cover bg-center rounded-sm grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 relative" style={{backgroundImage: `url(${cg.image})`}}>
                                    {cg.isNew && <div className="absolute top-2 right-2 bg-primary/90 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm font-bold">NEW</div>}
                                </div>
                             )}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold tracking-wide text-ink">{cg.title}</p>
                            <p className="text-xs text-ink/50">{cg.chapter}</p>
                        </div>
                    </div>
                ))}
             </div>
             {/* CG Preview Overlay */}
             {selectedCG && (
                 <div className="absolute inset-0 z-50 bg-paper flex flex-col">
                     <div className="relative h-[65vh] w-full">
                         <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${selectedCG.image})`}}></div>
                         <button onClick={() => setSelectedCG(null)} className="absolute top-4 left-4 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary transition-colors border border-white/20">
                             <span className="material-icons-round">arrow_back</span>
                         </button>
                     </div>
                     <div className="flex-1 -mt-10 bg-paper rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] relative z-10 flex flex-col p-6 overflow-hidden">
                        <div className="w-12 h-1.5 rounded-full bg-ink/10 mx-auto mb-6"></div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase border border-primary/20">Sketch #{selectedCG.id}</span>
                             <span className="text-xs text-ink/40 font-medium">2042.10.24</span>
                        </div>
                        <h1 className="text-3xl font-bold font-display text-ink mb-4">{selectedCG.title}</h1>
                        <p className="text-ink/60 text-sm leading-relaxed mb-auto">
                            MiMiu凝视着破碎的时空窗，手中的罗盘早已停摆。在这片无尽的静谧中，只有铅笔的沙沙声记录着时间的流逝。
                        </p>
                        <button onClick={handleSaveCG} className="w-full h-14 bg-primary text-white rounded-full flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-primary/40 active:scale-[0.98] transition-all">
                            <span className="material-icons-round">download</span>
                            保存到相册
                        </button>
                     </div>
                 </div>
             )}
        </div>
    );

    // --- SUB-COMPONENT: SETTINGS ---
    const renderSettings = () => (
         <div className="h-full flex flex-col p-6">
            <header className="flex items-center justify-between mb-6 shrink-0">
                <button onClick={() => setView(StoryView.MENU)} className="w-10 h-10 flex items-center justify-center border-[1.5px] border-ink rounded-full bg-white/40 hover:bg-white/80 transition-all">
                    <span className="material-icons-round text-ink">arrow_back</span>
                </button>
                <h1 className="font-display text-2xl font-black text-ink tracking-widest uppercase transform -rotate-1">故事设置</h1>
                <div className="w-10"></div>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pb-24">
                 <div className="bg-white/60 backdrop-blur-sm border-[2px] border-ink rounded-sketch-1 p-6 shadow-sketch">
                    <div className="flex items-center gap-2 mb-6 border-b border-ink/10 pb-2">
                        <span className="material-icons-round text-primary text-xl">speed</span>
                        <h2 className="font-bold text-ink tracking-widest text-sm">播放体验</h2>
                    </div>
                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-bold text-ink/70 mb-3 px-1">
                            <span>文字速度</span>
                            <span className="font-mono text-[10px] bg-ink/5 px-2 py-0.5 rounded-sm">{settings.textSpeed}%</span>
                        </div>
                        <input 
                            type="range" className="w-full" min="1" max="100" 
                            value={settings.textSpeed} 
                            onChange={(e) => setSettings({...settings, textSpeed: Number(e.target.value)})} 
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs font-bold text-ink/70 mb-3 px-1">
                            <span>自动播放速度</span>
                            <span className="font-mono text-[10px] bg-ink/5 px-2 py-0.5 rounded-sm">{settings.autoSpeed}%</span>
                        </div>
                        <input 
                            type="range" className="w-full" min="1" max="100" 
                            value={settings.autoSpeed}
                            onChange={(e) => setSettings({...settings, autoSpeed: Number(e.target.value)})}
                        />
                    </div>
                 </div>

                 <div className="bg-white/60 backdrop-blur-sm border-[2px] border-ink rounded-sketch-2 p-6 shadow-sketch transform rotate-1">
                    <div className="flex items-center gap-2 mb-6 border-b border-ink/10 pb-2">
                        <span className="material-icons-round text-primary text-xl">opacity</span>
                        <h2 className="font-bold text-ink tracking-widest text-sm">视觉呈现</h2>
                    </div>
                    <div className="mb-2">
                        <div className="flex justify-between text-xs font-bold text-ink/70 mb-3 px-1">
                            <span>文本透明度</span>
                            <span className="font-mono text-[10px] bg-ink/5 px-2 py-0.5 rounded-sm">{settings.opacity}%</span>
                        </div>
                        <input 
                            type="range" className="w-full" min="1" max="100" 
                            value={settings.opacity}
                            onChange={(e) => setSettings({...settings, opacity: Number(e.target.value)})}
                        />
                        <div className="mt-4 p-3 bg-paper border border-ink/30 rounded-sketch-1 text-xs text-ink/90 font-serif leading-relaxed shadow-sm">
                            <p style={{opacity: settings.opacity / 100}}>“米缪静静地看着远方的星云，机械心脏缓慢地跳动着...”</p>
                        </div>
                    </div>
                 </div>

                 <div className="bg-white/60 backdrop-blur-sm border-[2px] border-ink rounded-sketch-3 p-6 shadow-sketch">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-icons-round text-primary text-xl">music_note</span>
                            <h2 className="font-bold text-ink tracking-widest text-sm">背景音乐</h2>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={settings.bgm}
                                onChange={(e) => setSettings({...settings, bgm: e.target.checked})}
                                className="sr-only peer" 
                            />
                            <div className="w-12 h-6 bg-paper border-[1.5px] border-ink rounded-full peer-checked:bg-primary/20 transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-ink after:border after:border-transparent after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-300 peer-checked:after:translate-x-full peer-checked:after:bg-primary"></div>
                        </label>
                    </div>
                 </div>
            </div>
         </div>
    );

    // --- SUB-COMPONENT: VN SCENE ---
    const renderScene = () => (
        <div className="absolute inset-0 z-50 bg-black overflow-hidden flex flex-col">
             {/* Background */}
             <div className="absolute inset-0 opacity-80 bg-cover bg-center transition-opacity duration-1000" style={{backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBELL7fBLYnNbpPNOz1C0JvsXpLmsT0763JpRuTrcXHPGIvMDLnHlHFmCZg6nvjAFAgqtu_ceFBch-cp7C77P6G7yd51QHdis08wvjN9AOHBRNKVLZQtKGj2a07VFlVsM95p3h4YLldbS0Hgs8d9dTVvFmgrNgKK04PvvEY1ZCky55dNAI4PlL9PtMjsTM19uf0WgpIh4BME0-3xRss1iCjVpDSDaA9hrRrG-n2w59E2sLuNBm9jwvAu_y6JbBDiBPfmD8bzvaruR8')`}}></div>
             {/* Character */}
             <div className="absolute inset-0 flex items-end justify-center pb-[20vh] pointer-events-none">
                 <img className="w-[120%] max-w-lg object-contain drop-shadow-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFoWEIFlYzdaBx38smT1EojJtzL1OwtxssVoeBAWj2iNZoZOw3d4Q5yh77Wn3gxJsi0Hnt-AeNkKIIVcQH5-1ez1815HOh7ccma60_LLvJWEIdsYFfyO1upIu20Qvii9XHWkym4UKnC7KLeTuWkXbCLSU4dbnT3ozBhhIBz6XISDuvJSb8hXV1jWdDoPeaAgXFT8-w79PW6du6qgCP9s4ZwtUAd3PK5qvNnD-HU4s9xKH7RxKbh6HR-2iKtK0QkIDfxcjxUeqozxU" style={{maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'}} />
             </div>
             
             {/* Menus Overlays */}
             {(isPaused || showSaveMenu || showHistory) && (
                 <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-[fade-in_0.2s]">
                     {isPaused && (
                         <div className="bg-paper border-2 border-ink rounded-sketch-1 p-8 flex flex-col items-center gap-4 min-w-[240px] animate-[slide-up_0.2s]">
                             <h2 className="text-xl font-bold font-display text-ink mb-2">暂停</h2>
                             <button onClick={() => setIsPaused(false)} className="w-full py-3 bg-primary text-white font-bold rounded-lg border-2 border-ink shadow-sketch active:translate-y-0.5 active:shadow-none transition-all">继续故事</button>
                             <button onClick={() => setView(StoryView.MENU)} className="w-full py-3 bg-white text-ink font-bold rounded-lg border-2 border-ink hover:bg-gray-100 transition-colors">返回主菜单</button>
                         </div>
                     )}
                     {showSaveMenu && (
                         <div className="bg-paper border-2 border-ink rounded-sketch-2 p-6 w-full max-w-sm animate-[slide-up_0.2s]">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold font-display text-ink">保存进度</h2>
                                <button onClick={() => setShowSaveMenu(false)} className="material-icons-round text-ink/50 hover:text-ink">close</button>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <button key={i} onClick={handleSaveGame} className="w-full p-4 border border-ink/30 bg-white/50 hover:bg-white hover:border-primary rounded-lg text-left transition-all">
                                        <div className="text-sm font-bold text-ink">存档位置 {i}</div>
                                        <div className="text-xs text-ink/40 font-mono">空槽位</div>
                                    </button>
                                ))}
                            </div>
                         </div>
                     )}
                     {showHistory && (
                        <div className="bg-paper border-2 border-ink rounded-sketch-1 p-6 w-full h-[60vh] flex flex-col animate-[slide-up_0.2s]">
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <h2 className="text-xl font-bold font-display text-ink">历史记录</h2>
                                <button onClick={() => setShowHistory(false)} className="material-icons-round text-ink/50 hover:text-ink">close</button>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 p-2">
                                <div className="text-sm text-ink/80 leading-relaxed font-serif border-l-2 border-primary/30 pl-3">
                                    <span className="text-primary font-bold text-xs block mb-1">MiMiu</span>
                                    {dialogText}
                                </div>
                                <div className="text-sm text-ink/80 leading-relaxed font-serif border-l-2 border-ink/10 pl-3 opacity-60">
                                    <span className="text-ink/60 font-bold text-xs block mb-1">System</span>
                                    系统连接已建立。正在同步情感模块...
                                </div>
                            </div>
                        </div>
                     )}
                 </div>
             )}

             {/* UI Layer */}
             <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end p-4 pb-8 max-w-md mx-auto w-full">
                <div className="flex flex-col w-full gap-4">
                    {/* Dialog Box */}
                    <div className="relative w-full" onClick={() => {
                        // Click to finish typing immediately
                        if (displayedText.length < dialogText.length) {
                            setDisplayedText(dialogText);
                        }
                    }}>
                        <div className="absolute -top-3 left-4 z-30">
                            <div className="bg-primary text-white font-display font-bold text-sm tracking-wide px-4 py-1 rounded-full shadow-md border-2 border-white transform -rotate-1">MiMiu</div>
                        </div>
                        <div className="w-full bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl p-5 pt-7 min-h-[140px] flex flex-col relative">
                            <p className="font-sans text-ink text-[17px] leading-relaxed font-medium tracking-wide" style={{ opacity: settings.opacity / 100 }}>
                                {displayedText}
                                <span className="animate-pulse">|</span>
                            </p>
                            {displayedText.length === dialogText.length && (
                                <div className="absolute bottom-3 right-3 text-primary animate-bounce"><span className="material-icons-round text-3xl">arrow_drop_down_circle</span></div>
                            )}
                        </div>
                    </div>
                    {/* Controls */}
                    <div className="grid grid-cols-4 gap-2 w-full pt-1">
                        {[
                            {icon:'undo', label:'回退', action:() => setView(StoryView.MENU)}, 
                            {icon:'pause', label:'暂停', action:() => setIsPaused(true)}, 
                            {icon:'save', label:'存档', action:() => setShowSaveMenu(true)}, 
                            {icon:'history_edu', label:'查看历史', action:() => setShowHistory(true)}
                        ].map((btn, i) => (
                            <button key={i} onClick={btn.action} className="group flex flex-col items-center gap-1.5">
                                <div className="w-12 h-12 rounded-full border-2 border-gray-300 bg-background-light text-gray-600 flex items-center justify-center transition-all group-hover:border-primary group-hover:text-primary active:scale-95 shadow-sm">
                                    <span className="material-icons-round text-[22px]">{btn.icon}</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
             </div>
        </div>
    );

    return (
        <>
            {view === StoryView.LOAD && renderLoad()}
            {view === StoryView.SETTINGS && renderSettings()}
            {view === StoryView.CG_GALLERY && renderCGGallery()}
            {view === StoryView.VN_SCENE && renderScene()}
            {view === StoryView.MENU && renderMenu()}
            <Toast message={toast.msg} visible={toast.visible} />
        </>
    );
};

export default StoryScreen;