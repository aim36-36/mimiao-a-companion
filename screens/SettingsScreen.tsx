import React, { useState, useEffect } from 'react';

const Toast = ({ message, visible }: { message: string, visible: boolean }) => (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="bg-ink text-paper px-6 py-3 rounded-full shadow-xl border-2 border-white/20 flex items-center gap-2">
            <span className="material-icons-round text-secondary">check_circle</span>
            <span className="font-bold text-sm tracking-wide">{message}</span>
        </div>
    </div>
);

const SettingsScreen: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [fontSize, setFontSize] = useState(50);
  const [toast, setToast] = useState<{msg: string, visible: boolean}>({ msg: '', visible: false });

  useEffect(() => {
    // Load settings from localStorage
    const savedKey = localStorage.getItem('deepseek_api_key');
    if (savedKey) setApiKey(savedKey);

    const savedFontSize = localStorage.getItem('app_font_size');
    if (savedFontSize) {
        const size = parseInt(savedFontSize);
        setFontSize(size);
        updateRootFontSize(size);
    }
  }, []);

  const showToast = (msg: string) => {
      setToast({ msg, visible: true });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  };

  const updateRootFontSize = (val: number) => {
      // Map 1-100 to 80% - 120%
      // 50 => 100%
      const percentage = 75 + (val * 0.5); 
      document.documentElement.style.fontSize = `${percentage}%`;
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      setFontSize(val);
      updateRootFontSize(val);
      localStorage.setItem('app_font_size', val.toString());
  };

  const handleSaveApiKey = () => {
      localStorage.setItem('deepseek_api_key', apiKey);
      showToast("神经连接已同步 (API Key Saved)");
  };

  const handleClearChat = () => {
      if (window.confirm("确定要删除所有记忆数据吗？此操作不可逆。")) {
          localStorage.removeItem('chat_history');
          showToast("内存缓存已清除");
      }
  };

  return (
    <div className="h-full flex flex-col bg-paper relative overflow-hidden">
      {/* Header - Fixed at top, no overlap issues */}
      <header className="shrink-0 z-40 bg-paper border-b-2 border-ink px-6 py-4 flex justify-between items-end relative shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink transform -rotate-1 font-display">
            系统设置
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-primary border border-ink inline-block"></span>
            <p className="text-xs font-bold font-mono tracking-tighter text-ink/70">Ver 2.5.0 // MiMiu 系统</p>
          </div>
        </div>
        {/* Removed top-right icon as requested */}
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-8 no-scrollbar">
        {/* DeepSeek API Card */}
        <section className="relative group">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#e6ddc5]/90 border border-ink/20 transform -rotate-2 z-10 backdrop-blur-[1px]"></div>
          <div className="bg-white/50 border-2 border-ink rounded-sketch-2 p-6 relative overflow-hidden shadow-sketch backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5 border-b-2 border-ink/10 pb-4 border-dashed">
              <div className="w-12 h-12 bg-secondary/10 rounded-full border-2 border-ink flex items-center justify-center text-secondary transform -rotate-3">
                <span className="material-icons-round text-2xl">psychology</span>
              </div>
              <div>
                <h2 className="font-bold text-lg leading-none">DeepSeek 接口</h2>
                <p className="text-xs text-ink/60 mt-1 font-medium">建立与智能核心的神经连接</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="relative">
                <label className="block text-xs font-black uppercase mb-2 ml-1 flex items-center gap-1">
                  <span className="material-icons-round text-[14px]">vpn_key</span>
                  API Key 输入
                </label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-white/60 border-2 border-ink rounded-sketch-sm p-3 pr-10 font-mono text-sm focus:outline-none focus:border-primary focus:shadow-[2px_2px_0_#D0BB95] transition-all placeholder-ink/40"
                  placeholder="sk-..."
                />
                <div className="absolute right-3 bottom-3 text-green-700">
                  {apiKey && <span className="material-icons-round text-sm">check_circle</span>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100/50 border border-ink rounded-full transform -rotate-1">
                  <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-600 animate-pulse' : 'bg-gray-400'} border border-ink`}></div>
                  <span className={`text-xs font-bold ${apiKey ? 'text-green-900' : 'text-gray-500'}`}>{apiKey ? '连接已激活' : '未连接'}</span>
                </div>
                <button 
                    onClick={handleSaveApiKey}
                    className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2 border-2 border-ink shadow-sketch active:shadow-none active:translate-x-[2px] active:translate-y-[3px] transition-all rounded-lg transform rotate-1"
                >
                  保存设置
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* General Settings */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pl-2">
            <span className="material-icons-round text-ink">tune</span>
            <h3 className="font-black text-lg text-ink tracking-wide border-b-4 border-secondary/30 inline-block transform -rotate-1">常规设置</h3>
          </div>

          <div className="bg-white/50 border-2 border-ink rounded-sketch-1 p-5 flex flex-col gap-4 shadow-sketch">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-ink/70">format_size</span>
                <span className="font-bold text-sm">字体大小调节</span>
              </div>
              <span className="font-mono text-xs font-bold bg-ink text-paper px-2 py-0.5 rounded transform rotate-1">{fontSize}%</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center hover:bg-ink/10 active:bg-ink/20 transition-colors" onClick={() => handleFontSizeChange({target: {value: Math.max(1, fontSize-10)}} as any)}>
                <span className="font-bold text-xs text-ink">A</span>
              </button>
              <div className="flex-1">
                <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={fontSize} 
                    onChange={handleFontSizeChange}
                    className="w-full" 
                />
              </div>
              <button className="w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center hover:bg-ink/10 active:bg-ink/20 transition-colors" onClick={() => handleFontSizeChange({target: {value: Math.min(100, fontSize+10)}} as any)}>
                <span className="font-bold text-lg text-ink">A</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/50 border-2 border-ink rounded-sketch-sm p-4 flex items-center justify-between group active:scale-[0.99] transition-transform cursor-pointer hover:bg-white/70 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border-2 border-ink bg-secondary/20 flex items-center justify-center transform -rotate-2">
                  <span className="material-icons-round text-ink">language</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm">语言选择</h4>
                  <p className="text-[10px] opacity-70 font-mono">界面语言</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-paper/50 px-2 py-1 rounded border border-ink transform rotate-1 shadow-[1px_1px_0_#231f20]">
                <span className="text-xs font-bold font-mono">简体中文</span>
                <span className="material-icons-round text-sm">expand_more</span>
              </div>
            </div>

            <div className="bg-white/50 border-2 border-ink rounded-sketch-sm p-4 flex items-center justify-between hover:bg-red-50 transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border-2 border-ink bg-red-100/50 flex items-center justify-center transform -rotate-1">
                  <span className="material-icons-round text-ink">delete_outline</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-ink">删除聊天记录</h4>
                  <p className="text-[10px] opacity-70 font-mono">操作不可逆</p>
                </div>
              </div>
              <button 
                onClick={handleClearChat}
                className="px-3 py-1.5 border-2 border-ink bg-white hover:bg-red-50 text-red-700 rounded-lg text-xs font-black shadow-[2px_2px_0_#231f20] active:translate-y-[2px] active:shadow-none transition-all transform rotate-1"
              >
                清理
              </button>
            </div>
          </div>
        </section>

        {/* Status Card */}
        <section className="mt-8 pt-6 border-t-2 border-dashed border-ink/20">
          <div className="bg-white border-2 border-ink p-1 rounded-xl shadow-sketch transform rotate-1">
            <div className="border border-ink rounded-lg p-4 flex gap-4 items-center bg-white/60 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary rounded-full opacity-10 border border-ink border-dashed"></div>
              <div className="relative w-16 h-16 shrink-0 bg-ink border-2 border-ink rounded-full flex items-center justify-center overflow-hidden">
                 <img 
                    alt="MiMiu Character Avatar" 
                    className="w-full h-full object-cover grayscale contrast-125 sepia-[0.3]" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlqtyCNJyrFwUDwcwVqrIm4LZdyptFqTu6TclXqBy-rjSF_CsENNQ4IkIxBMeTThnGbrCwKF03E9sDRT_muUTtOSDQowlzWWdoMVQPd0DdTbmL5HgSnVgzvrR2E51_DvEBJKqpg1IpUaunh3lxIaawOqrud6RjtwfFYfxiP_CHQotrxFVfi9vk0cVMjeQg3mgWXEzNgVlLpYjT448Ty76bsfBv-rVIo1Vr7f-2l_BuoP6g8Ba_Xg5f1nOJ_yL6t3SNf3EltTIjIco"
                 />
              </div>
              <div className="flex-1 z-10 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-lg text-ink">米缪状态</h4>
                  <div className="flex items-center gap-1 px-2 py-0.5 border border-ink bg-secondary/20 rounded-full shadow-[1px_1px_0_rgba(0,0,0,0.1)] transform -rotate-2">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full border border-ink"></span>
                    <span className="text-[10px] font-black text-ink">好奇</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold text-ink/70 flex items-center gap-1">
                      <span className="material-icons-round text-xs text-primary">favorite</span>
                      好感度
                    </p>
                    <span className="text-[10px] font-mono font-bold">Lv.4</span>
                  </div>
                  <div className="w-full border-2 border-ink h-3.5 rounded-full p-[2px] bg-white/50">
                    <div className="h-full bg-primary rounded-full w-[65%] border-r-2 border-ink relative" style={{backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 4px)"}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
};

export default SettingsScreen;