import { useState, useEffect } from "react";
import { useAITutor } from "../lib/AITutorContext";
import { useAudio } from "../lib/audio";

const BLOCKS = [
  { id: 'b_start', text: '开始' },
  { id: 'b_inita', text: '鸡数量 a=35' },
  { id: 'b_initb', text: '兔数量 b=0' },
  { id: 'b_calc', text: '脚数量 c=a*2+b*4' },
  { id: 'b_cond', text: '脚数量不等于94?' },
  { id: 'b_outa', text: '输出 a 的值' },
  { id: 'b_outb', text: '输出 b 的值' },
  { id: 'b_deca', text: '鸡数量 a=a-1' },
  { id: 'b_incb', text: '兔数量 b=b+1' },
  { id: 'b_end', text: '结束' },
];

const CORRECT_SEQUENCE = [
  'b_start', 'b_inita', 'b_initb', 'b_calc', 'b_cond',
  'b_deca', 'b_incb', 'b_outa', 'b_outb', 'b_end'
];

const BOXES = [
  { w: 100, h: 34, shape: 'pill' }, // n0
  { w: 130, h: 34, shape: 'rect' }, // n1
  { w: 130, h: 34, shape: 'rect' }, // n2
  { w: 130, h: 34, shape: 'rect' }, // n3
  { w: 170, h: 52, shape: 'diamond' }, // n4
  { w: 130, h: 34, shape: 'rect' }, // n5
  { w: 130, h: 34, shape: 'rect' }, // n6
  { w: 130, h: 34, shape: 'parallelogram' }, // n7
  { w: 130, h: 34, shape: 'parallelogram' }, // n8
  { w: 100, h: 34, shape: 'pill' }, // n9
];

const CENTERS = [
  { x: 140, y: 30 },
  { x: 140, y: 90 },
  { x: 140, y: 150 },
  { x: 140, y: 210 },
  { x: 140, y: 280 },
  { x: 140, y: 360 }, // 5
  { x: 140, y: 420 }, // 6
  { x: 340, y: 360 }, // 7
  { x: 340, y: 420 }, // 8
  { x: 340, y: 490 }, // 9
];

const FlowLines = () => (
  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
      </marker>
    </defs>
    
    <line x1="140" y1="47" x2="140" y2="71" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow)" />
    <line x1="140" y1="107" x2="140" y2="131" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow)" />
    <line x1="140" y1="167" x2="140" y2="191" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow)" />
    <line x1="140" y1="227" x2="140" y2="252" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow)" />
    
    {/* n4 to n5 (Yes) */}
    <line x1="140" y1="306" x2="140" y2="341" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow)" />
    <text x="145" y="325" fill="#475569" fontSize="12" fontWeight="bold">是</text>
    
    <line x1="140" y1="377" x2="140" y2="401" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow)" />
    
    {/* n6 loop to n3 */}
    <path d="M140,437 L140,455 L30,455 L30,195 L138,195" fill="none" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow)" />
    
    {/* n4 to n7 (No) */}
    <path d="M225,280 L340,280 L340,341" fill="none" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow)" />
    <text x="280" y="275" fill="#475569" fontSize="12" fontWeight="bold">否</text>
    
    <line x1="340" y1="377" x2="340" y2="401" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow)" />
    
    <line x1="340" y1="437" x2="340" y2="471" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow)" />
  </svg>
);


export default function FlowchartPuzzle({ onComplete }: { onComplete: () => void }) {
  const { askAI } = useAITutor();
  const { playSound } = useAudio();
  
  const [slots, setSlots] = useState<string[]>(Array(10).fill(''));
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [shuffledBlocks, setShuffledBlocks] = useState([...BLOCKS]);

  useEffect(() => {
    setShuffledBlocks([...BLOCKS].sort(() => Math.random() - 0.5));
  }, []);

  const availableBlocks = shuffledBlocks.filter(b => !slots.includes(b.id));

  const handleBankClick = (id: string) => {
    setSelectedBankId(id === selectedBankId ? null : id);
    playSound('click');
  };

  const handleSlotClick = (index: number) => {
    if (selectedBankId) {
      const newSlots = [...slots];
      newSlots[index] = selectedBankId;
      setSlots(newSlots);
      setSelectedBankId(null);
      playSound('step');
    } else if (slots[index] !== '') {
      // Remove from slot
      const newSlots = [...slots];
      newSlots[index] = '';
      setSlots(newSlots);
      playSound('click');
    }
  };

  const checkPuzzle = () => {
    if (slots.includes('')) {
      alert("请填满所有空位！");
      return;
    }
    
    const isCorrect = slots.every((id, idx) => id === CORRECT_SEQUENCE[idx]);
    if (isCorrect) {
      playSound('win');
      onComplete();
    } else {
      playSound('step');
      const wrongSeqStr = slots.map(id => BLOCKS.find(b => b.id === id)?.text).join(' -> ');
      askAI(
        "学生正在拼接枚举法的算法流程图，正确顺序应该是：1.开始 2.鸡a=35 3.兔b=0 4.计算c 5.判断c!=94 6(是).a=a-1 7.b=b+1 8(否).输出a 9.输出b 10.结束。",
        `学生提交的错误顺序是：${wrongSeqStr}。提示他注意判断节点的两条分支。`
      );
    }
  };

  const currentBlockAt = (index: number) => {
    const id = slots[index];
    if (!id) return null;
    return BLOCKS.find(b => b.id === id);
  };

  const SlotNode = ({ idx }: { idx: number }) => {
    const block = currentBlockAt(idx);
    const active = selectedBankId && !block;
    const isEmpty = !block;
    
    const box = BOXES[idx];
    const center = CENTERS[idx];
    
    let baseClass = "flex items-center justify-center text-[13px] tracking-wider font-sans transition-all cursor-pointer";
    let shapeClass = `${baseClass} bg-white border border-[#0284c7]`;
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: center.x - box.w / 2,
      top: center.y - box.h / 2,
      width: box.w,
      height: box.h,
      zIndex: 10,
    };

    if (box.shape === 'pill') {
      shapeClass = `${baseClass} bg-[#dcfce7] border border-[#86efac] rounded-full text-neutral-800`;
    } else if (box.shape === 'diamond') {
      shapeClass = `${baseClass} bg-[#f0f9ff] border border-[#0284c7] text-[#0284c7] font-medium`;
      style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    } else if (box.shape === 'parallelogram') {
      shapeClass = `${baseClass} bg-[#f0f9ff] border border-[#0284c7] text-[#0284c7]`;
      style.transform = 'skewX(-15deg)';
    }

    if (isEmpty) {
      if (active) {
        shapeClass = shapeClass.replace('border-', 'border-2 border-dashed ').replace(/bg-\[#?[a-zA-Z0-9]+\]/g, 'bg-[#FFEDD5]').replace('bg-white', 'bg-[#FFEDD5]').replace(/border-\[#?[a-zA-Z0-9]+\]/g, 'border-[#F97316]');
      } else {
        shapeClass = shapeClass.replace('border-', 'border-2 border-dashed border-neutral-300').replace(/bg-\[#?[a-zA-Z0-9]+\]/g, 'bg-white/50').replace('bg-white', 'bg-white/50').replace(/border-\[#?[a-zA-Z0-9]+\]/g, 'border-neutral-300');
      }
    } else {
      shapeClass += ' hover:-translate-y-[1px] hover:shadow-md text-neutral-800';
    }
    
    return (
      <div 
        onClick={() => handleSlotClick(idx)}
        className={shapeClass}
        style={style}
      >
        <div style={box.shape === 'parallelogram' ? { transform: 'skewX(15deg)' } : {}} className="w-full text-center px-1">
          {block ? block.text : <span className="opacity-30 text-[10px]">点击放置</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F9F8F6] border border-neutral-300 p-8 shadow-sm font-sans mb-10 w-full col-span-2">
      <div className="flex justify-between items-end mb-6 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold italic text-neutral-900 mb-1">制作流程图</h2>
          <p className="text-xs text-neutral-500 font-mono tracking-widest uppercase">参考左侧图库，完美还原教材的枚举法流程图</p>
        </div>
        <button onClick={checkPuzzle} className="btn btn-primary px-8">验证提交</button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 pr-0 md:pr-4 overflow-x-auto min-w-[450px]">
          <div className="relative w-full h-[550px] bg-[#e0f2fe]/40 border border-neutral-200 shadow-sm z-0 font-serif">
             <FlowLines />
             {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <SlotNode key={i} idx={i} />)}
          </div>
        </div>

        <div className="w-[200px] shrink-0 z-20">
          <div className="bg-white border border-neutral-200 p-5 shadow-sm sticky top-24">
             <h3 className="font-bold text-[#0284c7] uppercase tracking-widest text-[10px] mb-4 border-b border-neutral-200 pb-2">步骤图块库</h3>
             <div className="flex flex-col gap-2">
                {availableBlocks.length === 0 && <div className="text-xs text-neutral-400 italic">图块已用尽！点击验证按钮。</div>}
                {availableBlocks.map(b => (
                  <div 
                    key={b.id}
                    onClick={() => handleBankClick(b.id)}
                    className={`p-2 text-center text-xs border cursor-pointer transition-colors font-sans tracking-wider ${selectedBankId === b.id ? 'bg-[#38bdf8] text-white border-[#38bdf8] shadow-inner' : 'bg-neutral-50 border-neutral-300 text-neutral-800 hover:bg-neutral-100 hover:border-[#38bdf8]'}`}
                  >
                    {b.text}
                  </div>
                ))}
             </div>
             {selectedBankId && (
                <div className="mt-4 p-2 bg-[#f0f9ff] border border-[#bae6fd] text-[10px] text-[#0369a1] font-bold uppercase tracking-widest text-center animate-pulse">
                   已选中！请放入左侧空位
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
