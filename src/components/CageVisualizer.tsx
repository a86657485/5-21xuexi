import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Chicken, Rabbit } from "./Icons";

interface CageVisualizerProps {
  chickens: number;
  rabbits: number;
}

export default function CageVisualizer({ chickens, rabbits }: CageVisualizerProps) {
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 300, h: 200 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        w: containerRef.current.clientWidth,
        h: containerRef.current.clientHeight
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const total = chickens + rabbits;
  const items = Array.from({ length: total }).map((_, i) => ({
    id: i,
    type: i < chickens ? 'chicken' : 'rabbit'
  }));

  return (
    <div className="relative w-full border border-neutral-300 bg-[#F3F1EC] p-4 flex flex-col pt-12 shadow-inner" ref={containerRef}>
      <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-center border-b border-neutral-200 bg-white/50 z-20">
        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2">
          笼中动物展示 (鸡: {chickens}, 兔: {rabbits})
        </div>
        <button 
          onClick={() => setPlaying(!playing)}
          className={`px-3 py-1 text-xs border shadow-sm transition-colors ${playing ? 'bg-[#FEE2E2] border-[#B91C1C]/30 text-[#B91C1C]' : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`}
        >
          {playing ? '⏸ 暂停互动' : '▶ 播放动画'}
        </button>
      </div>
      
      <div className="relative w-full h-[220px] overflow-hidden mt-2">
        {items.map((item, i) => (
          <AnimalEntity key={`${item.type}-${item.id}`} type={item.type} playing={playing} bounds={dimensions} index={i} />
        ))}
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
            笼子是空的
          </div>
        )}
      </div>
    </div>
  )
}

function AnimalEntity({ type, playing, bounds, index }: { type: string, playing: boolean, bounds: {w:number, h:number}, index: number }) {
  const getPos = () => {
    // leave some padding to avoid overflowing
    let paddingX = 40;
    let paddingY = 40;
    let safeW = Math.max(10, bounds.w - paddingX);
    let safeH = Math.max(10, bounds.h - paddingY - 30); // account for top bar
    return {
      x: Math.random() * safeW,
      y: Math.random() * safeH,
    }
  };

  const [pos, setPos] = useState(() => getPos());
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!playing) return;
    
    // random walk interval
    const interval = setInterval(() => {
      const newPos = getPos();
      setDirection(newPos.x > pos.x ? 1 : -1);
      setPos(newPos);
    }, 1500 + Math.random() * 2000);
    
    return () => clearInterval(interval);
  }, [playing, bounds]);

  return (
    <motion.div
      animate={{ x: pos.x, y: pos.y }}
      transition={{ duration: playing ? (1.5 + Math.random()) : 0.5, ease: "easeInOut" }}
      className="absolute"
      style={{ left: 10, top: 10 }}
    >
      <div 
        className={`${playing ? 'animate-bounce' : ''}`} 
        style={{ 
          animationDuration: `${0.4 + Math.random()*0.3}s`,
          transform: `scaleX(${direction})`, 
          transition: 'transform 0.3s'
        }}
      >
        {type === 'chicken' ? <Chicken size={36} /> : <Rabbit size={36} />}
      </div>
    </motion.div>
  )
}
