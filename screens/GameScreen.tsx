import React, { useState, useEffect, useCallback } from 'react';
import { GameView } from '../types';

// Board logic
const GRID_SIZE = 15;
type Cell = 'black' | 'white' | null;
const generateGrid = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

const GameScreen: React.FC = () => {
  const [view, setView] = useState<GameView>(GameView.MENU);
  const [board, setBoard] = useState<Cell[][]>(generateGrid());
  const [turn, setTurn] = useState<'black' | 'white'>('black'); // Black = Player, White = Computer
  const [winner, setWinner] = useState<'black' | 'white' | 'draw' | null>(null);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [difficulty, setDifficulty] = useState<number>(1); // 0: Easy, 1: Normal, 2: Hard

  // Check for win condition (5 in a row)
  const checkWin = (currentBoard: Cell[][], r: number, c: number, player: Cell) => {
    if (!player) return false;
    const directions = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonal \
      [1, -1]  // Diagonal /
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      // Check forward
      let i = 1;
      while (
        r + i * dr >= 0 && r + i * dr < GRID_SIZE &&
        c + i * dc >= 0 && c + i * dc < GRID_SIZE &&
        currentBoard[r + i * dr][c + i * dc] === player
      ) {
        count++;
        i++;
      }
      // Check backward
      i = 1;
      while (
        r - i * dr >= 0 && r - i * dr < GRID_SIZE &&
        c - i * dc >= 0 && c - i * dc < GRID_SIZE &&
        currentBoard[r - i * dr][c - i * dc] === player
      ) {
        count++;
        i++;
      }
      if (count >= 5) return true;
    }
    return false;
  };

  // Simple AI to block or win
  const computerMove = useCallback(() => {
    if (winner) return;

    const availableMoves: { r: number; c: number; score: number }[] = [];
    
    // Heuristic scoring: 
    // High score for winning move, Med-High for blocking player win, Med for creating connections
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r][c] === null) {
            let score = 0;
            // Simulate computer move (Attack)
            board[r][c] = 'white';
            if (checkWin(board, r, c, 'white')) score += 10000;
            board[r][c] = null; // Reset

            // Simulate player move (Defense) - heavily weight blocking a win
            board[r][c] = 'black';
            if (checkWin(board, r, c, 'black')) score += 5000 + (difficulty * 1000); // Higher difficulty defends better
            board[r][c] = null; // Reset
            
            // Prefer center/clusters if no critical moves
            // Check neighbors
            let neighbors = 0;
            for(let nr = r-1; nr <= r+1; nr++) {
                for(let nc = c-1; nc <= c+1; nc++) {
                    if(nr>=0 && nr<GRID_SIZE && nc>=0 && nc<GRID_SIZE && board[nr][nc] !== null) {
                        neighbors++;
                    }
                }
            }
            if(neighbors > 0) score += neighbors * (10 + difficulty * 5);
            // Small random factor to vary gameplay
            score += Math.random();

            availableMoves.push({ r, c, score });
        }
      }
    }

    if (availableMoves.length === 0) {
        setWinner('draw');
        setIsComputerThinking(false);
        return;
    }

    // Pick best move
    availableMoves.sort((a, b) => b.score - a.score);
    // Add some randomness for lower difficulties
    let moveIndex = 0;
    if (difficulty === 0 && availableMoves.length > 1) {
        moveIndex = Math.random() > 0.7 ? 1 : 0; // 30% chance to pick 2nd best move
    }
    const bestMove = availableMoves[moveIndex];

    // Execute move
    const newBoard = [...board];
    newBoard[bestMove.r][bestMove.c] = 'white';
    setBoard(newBoard);

    if (checkWin(newBoard, bestMove.r, bestMove.c, 'white')) {
        setWinner('white');
    } else {
        setTurn('black');
    }
    setIsComputerThinking(false);
  }, [board, winner, difficulty]);

  // Trigger computer turn
  useEffect(() => {
    if (turn === 'white' && !winner) {
        setIsComputerThinking(true);
        const timer = setTimeout(() => {
            computerMove();
        }, 800); // Artificial delay for realism
        return () => clearTimeout(timer);
    }
  }, [turn, winner, computerMove]);

  const handleCellClick = (r: number, c: number) => {
    if (board[r][c] || winner || isComputerThinking || turn !== 'black') return;
    
    const newBoard = [...board];
    newBoard[r][c] = 'black';
    setBoard(newBoard);

    if (checkWin(newBoard, r, c, 'black')) {
        setWinner('black');
    } else {
        setTurn('white');
    }
  };

  const resetGame = () => {
      setBoard(generateGrid());
      setTurn('black');
      setWinner(null);
      setIsComputerThinking(false);
  };

  const renderMenu = () => (
    <div className="flex flex-col h-full bg-paper relative overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center bg-paper border-b-2 border-ink shadow-sm z-10 px-6 py-4 shrink-0">
        <div className="flex items-center gap-2">
            <span className="material-icons-round text-primary text-3xl">rocket_launch</span>
            <h1 className="font-sans text-xl tracking-wide font-bold text-ink">五子棋</h1>
        </div>
        <div className="flex gap-3">
            {/* Settings button removed */}
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 gap-6 flex flex-col pb-28 no-scrollbar">
        {/* Opponent Card */}
        <div className="flex items-center justify-between bg-paper p-4 rounded-xl border-2 border-ink shadow-sketch transform transition hover:-translate-y-1">
          <div className="flex items-center gap-4">
              <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary bg-indigo-100">
                      <img alt="MiMiu" className="w-full h-full object-cover opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0cSAshqqSE19xB8tmlgsvG1KStCq62SVmM9WwIul4aKudCUKi8eud9OO-2rowdx23kg9FHlG_2y2AAA279etAwEyhU1aqEV8uibplouHVVpeCqFfU8hGsjlbWYo-ZmohrA4fSnCF4MGi1ZdiP0MgvPEqK2RA4vwmM2QTSCFG81__lylmcDYynTQQLEG32EfScaUDbNFctqU50FymWZdpiEUZMlftCRy1nD1DdaQSEmNw5PIJlbx9RiGD-c4hHD4YeJi820bT3gm4"/>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded border border-black font-bold font-sans">AI</div>
              </div>
              <div>
                  <h2 className="font-sans text-xl leading-none font-bold text-primary">米缪</h2>
                  <p className="text-xs text-ink/60 mt-1 font-sans">状态: <span className="text-green-600 animate-pulse">等待挑战...</span></p>
              </div>
          </div>
          <div className="text-right">
              <div className="text-xs tracking-widest text-ink/50 mb-1 font-sans">模式</div>
              <div className="font-display text-xl font-bold">人机对战</div>
          </div>
        </div>

        {/* Banner */}
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-ink shadow-lg group">
           <img alt="Cosmic" className="w-full h-full object-cover filter sepia-[0.3] contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkqULH7JmuZSIN6C5eKuiQsYK-Tdb4mFGya4JZXxQgc2m5jrZvJQooTT_VFs_kVN7x3KwiU1BaQLZHwlRdREXkNMnHs2OjaUVN_edvG4ie58eTyrlDSY-ikmWTxjMkI57nGoWxus-EOHpMues_um_JBlaEwhrsXCIkrCzaphEQ9NWVXU_Yk10CcEBLhR1xcfd6yVN5iIETsRKi3yfiaNWYF5MZU8YLE1AzISaKiX-XHmoeaJgxTQlaYipOzHBOePvJtiBROfvz-_Y"/>
           <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
              <div className="text-white drop-shadow-md">
                  <p className="text-[10px] font-mono opacity-80 mb-0.5">TARGET: GOMOKU_SECTOR_7</p>
                  <h3 className="font-display text-2xl font-bold tracking-wide">战术预备</h3>
              </div>
           </div>
        </div>

        {/* Difficulty Selection */}
        <div className="flex flex-col gap-3">
           <h3 className="text-primary font-sans text-sm font-bold tracking-wider border-b-2 border-primary/20 pb-2 flex justify-between items-center">
               <span>&gt; 同步率设定 (难度)</span>
           </h3>
           {['简单 · Easy', '一般 · Normal', '困难 · Hard'].map((level, idx) => (
               <label key={idx} className="cursor-pointer group relative" onClick={() => setDifficulty(idx)}>
                   <input type="radio" name="difficulty" checked={difficulty === idx} onChange={() => setDifficulty(idx)} className="peer sr-only" />
                   <div className="flex items-center p-3 rounded-lg border-2 border-ink/20 bg-white/50 hover:border-primary peer-checked:border-primary peer-checked:bg-primary/5 transition-all shadow-sm">
                      <div className="w-10 h-10 rounded border border-ink/20 flex items-center justify-center bg-white mr-3 peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary text-gray-400 transition-colors">
                          <span className="material-icons-round">{idx === 0 ? 'child_care' : idx === 1 ? 'psychology' : 'smart_toy'}</span>
                      </div>
                      <div className="flex-1">
                          <div className="font-bold text-ink peer-checked:text-primary">{level}</div>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-ink/20 peer-checked:border-ink peer-checked:bg-ink flex items-center justify-center">
                          <span className="material-icons-round text-white text-sm opacity-0 peer-checked:opacity-100">check</span>
                      </div>
                   </div>
               </label>
           ))}
        </div>

        {/* Start Button */}
        <div className="mt-auto">
           <button onClick={() => { resetGame(); setView(GameView.BOARD); }} className="w-full bg-primary text-white border-2 border-ink py-4 px-6 rounded-xl font-sans font-bold text-xl shadow-sketch active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-3 relative overflow-hidden">
               <span className="material-icons-round text-2xl animate-pulse">play_circle</span>
               <span className="tracking-widest">开始对局</span>
           </button>
        </div>
      </div>
    </div>
  );

  const renderBoard = () => (
    <div className="h-full flex flex-col p-4 bg-paper relative overflow-hidden">
       {/* Header */}
       <header className="flex justify-between items-center mb-6 pt-4">
           <button onClick={() => setView(GameView.MENU)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 transition border border-ink/20">
                <span className="material-icons-round text-ink text-2xl">arrow_back</span>
           </button>
           <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border-2 border-ink shadow-sketch">
               <div className="w-8 h-8 rounded-full overflow-hidden border border-primary">
                    <img alt="MiMiu" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0cSAshqqSE19xB8tmlgsvG1KStCq62SVmM9WwIul4aKudCUKi8eud9OO-2rowdx23kg9FHlG_2y2AAA279etAwEyhU1aqEV8uibplouHVVpeCqFfU8hGsjlbWYo-ZmohrA4fSnCF4MGi1ZdiP0MgvPEqK2RA4vwmM2QTSCFG81__lylmcDYynTQQLEG32EfScaUDbNFctqU50FymWZdpiEUZMlftCRy1nD1DdaQSEmNw5PIJlbx9RiGD-c4hHD4YeJi820bT3gm4"/>
               </div>
               <div className="flex flex-col pr-2">
                  <span className="text-[10px] text-ink/50 font-bold tracking-wider leading-none uppercase mb-0.5">VS MiMiu</span>
                  <span className={`text-sm font-bold ${isComputerThinking ? 'text-primary animate-pulse' : 'text-green-600'}`}>
                      {winner ? (winner === 'black' ? '你赢了！' : '米缪赢了！') : (turn === 'black' ? '你的回合' : '思考中...')}
                  </span>
               </div>
           </div>
           <div className="w-10"></div> {/* Placeholder to balance flex layout after removing settings button */}
       </header>

       <div className="flex-1 flex flex-col items-center justify-center gap-6">
           <div className="font-display text-4xl text-ink/30 tracking-widest tabular-nums opacity-0">00:00</div>
           
           <div className="relative w-full aspect-square bg-[#1a1b26] rounded-xl shadow-2xl border-4 border-ink overflow-hidden mx-4">
                {/* Background Image Board */}
                <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover mix-blend-screen"></div>
                {/* Grid */}
                <div className="absolute inset-4 border-2 border-white/20 box-content shadow-inner bg-black/20 grid grid-cols-15 grid-rows-15" 
                     style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}>
                     
                     {board.map((row, rIdx) => (
                        row.map((cell, cIdx) => (
                             <div 
                                key={`${rIdx}-${cIdx}`} 
                                onClick={() => handleCellClick(rIdx, cIdx)}
                                className="relative border-[0.5px] border-white/10 cursor-crosshair flex items-center justify-center"
                             >
                                 {cell === 'black' && (
                                     <div className="w-[85%] h-[85%] rounded-full bg-gradient-to-br from-gray-800 to-black shadow-[2px_2px_4px_rgba(0,0,0,0.5)] border border-white/10 animate-[pop_0.2s_ease-out]"></div>
                                 )}
                                 {cell === 'white' && (
                                     <div className="w-[85%] h-[85%] rounded-full bg-gradient-to-br from-white to-gray-300 shadow-[2px_2px_4px_rgba(0,0,0,0.3)] border border-black/10 animate-[pop_0.2s_ease-out]"></div>
                                 )}
                                 {/* Last move highlight could go here */}
                             </div>
                        ))
                     ))}
                </div>
           </div>

           <div className="w-full grid grid-cols-2 gap-6 px-2">
                <button onClick={resetGame} className="border-2 border-ink bg-paper rounded-[255px_15px_225px_15px/15px_225px_15px_255px] text-ink py-4 px-6 font-bold font-sans text-lg shadow-sketch active:shadow-none active:translate-y-[2px] transition-all flex items-center justify-center gap-2 group hover:bg-white">
                    <span className="material-icons-round text-2xl group-hover:-translate-x-1 transition-transform">refresh</span>
                    重置
                </button>
                <button onClick={() => setWinner('white')} className="border-2 border-ink bg-primary text-white rounded-[255px_15px_225px_15px/15px_225px_15px_255px] py-4 px-6 font-bold font-sans text-lg shadow-sketch active:shadow-none active:translate-y-[2px] transition-all flex items-center justify-center gap-2 group hover:bg-primary/90">
                    <span className="material-icons-round text-2xl group-hover:rotate-12 transition-transform">flag</span>
                    认输
                </button>
           </div>
       </div>

       {/* Game Over Modal */}
       {winner && (
           <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fade-in_0.3s]" onClick={() => {}}></div>
               <div className="bg-paper border-4 border-ink rounded-sketch-2 p-8 w-full max-w-sm relative z-10 shadow-2xl flex flex-col items-center gap-4 animate-[slide-up_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
                   <div className="absolute -top-10">
                       {winner === 'black' ? (
                           <div className="bg-yellow-400 border-4 border-ink rounded-full p-4 shadow-sketch transform rotate-12">
                               <span className="material-icons-round text-5xl text-white">emoji_events</span>
                           </div>
                       ) : (
                           <div className="bg-gray-700 border-4 border-ink rounded-full p-4 shadow-sketch transform -rotate-6">
                               <span className="material-icons-round text-5xl text-white">sentiment_very_dissatisfied</span>
                           </div>
                       )}
                   </div>
                   
                   <h2 className="text-3xl font-black font-display text-ink mt-6 transform -rotate-1">
                       {winner === 'black' ? 'VICTORY!' : winner === 'draw' ? 'DRAW' : 'DEFEAT'}
                   </h2>
                   
                   <p className="text-center font-bold text-ink/60">
                       {winner === 'black' 
                         ? '恭喜！你的战术成功压制了AI核心！' 
                         : winner === 'draw'
                         ? '棋逢对手，未分胜负。'
                         : '很遗憾，米缪的计算更胜一筹...'}
                   </p>

                   <div className="flex gap-4 w-full mt-4">
                       <button onClick={() => setView(GameView.MENU)} className="flex-1 py-3 border-2 border-ink rounded-lg font-bold text-ink/60 hover:bg-ink/5 hover:text-ink transition-colors">
                           返回
                       </button>
                       <button onClick={resetGame} className="flex-1 py-3 bg-primary border-2 border-ink rounded-lg font-bold text-white shadow-[2px_2px_0_#231f20] active:translate-y-[2px] active:shadow-none transition-all">
                           再来一局
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );

  return view === GameView.MENU ? renderMenu() : renderBoard();
};

export default GameScreen;