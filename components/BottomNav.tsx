import React from 'react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'chat', icon: 'chat_bubble_outline', label: '聊天' },
    { id: 'moments', icon: 'rss_feed', label: '动态' },
    { id: 'game', icon: 'sports_esports', label: '下棋' },
    { id: 'story', icon: 'auto_stories', label: '故事' },
    { id: 'settings', icon: 'settings', label: '设置' },
  ];

  return (
    <nav className="relative z-50 bg-paper/95 backdrop-blur-md border-t-2 border-ink px-2 pb-4 pt-2">
      <div className="flex justify-between items-end">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          if (item.id === 'story') {
             // Special styling for Story button if desired, or just standard
             return (
               <button
                 key={item.id}
                 onClick={() => onTabChange(item.id)}
                 className="flex flex-col items-center justify-end gap-1 group w-1/5 h-14 relative"
               >
                 {isActive ? (
                    <div className="absolute -top-6 bg-primary p-3 rounded-sketch-1 shadow-sketch border-2 border-ink transform -rotate-3 transition-all duration-300">
                        <span className="material-icons-round text-white text-xl">{item.icon}</span>
                    </div>
                 ) : (
                    <span className="material-icons-round text-ink/40 group-hover:text-primary transition-colors text-2xl group-hover:-translate-y-0.5 duration-300">{item.icon}</span>
                 )}
                 <span className={`text-[10px] font-bold ${isActive ? 'text-primary mt-4' : 'text-ink/50 group-hover:text-ink'} transition-colors`}>
                   {item.label}
                 </span>
               </button>
             )
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center justify-end gap-1 group w-1/5 h-14 pb-1"
            >
              <span className={`material-icons-round text-2xl transition-all duration-300 group-hover:-translate-y-0.5 ${isActive ? 'text-ink' : 'text-ink/40 group-hover:text-primary'}`}>
                {isActive ? item.icon.replace('_outline', '') : item.icon}
              </span>
              <span className={`text-[10px] font-bold ${isActive ? 'text-ink' : 'text-ink/50 group-hover:text-ink'} transition-colors`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;