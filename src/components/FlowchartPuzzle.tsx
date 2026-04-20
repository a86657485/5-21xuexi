import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAITutor } from "../lib/AITutorContext";
import { useAudio } from "../lib/audio";

const BLOCKS = [
  { id: 'b_start', text: '开始' },
  { id: 'b_inita', text: '鸡数量 a=35' },
  { id: 'b_initb', text: '兔数量 b=0' },
  { id: 'b_calc', text: '脚数量 c=a*2+b*4' },
  { id: 'b_cond', text: '脚数量不等于94？' },
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

export default function FlowchartPuzzle({ onComplete }: { onComplete: () => void }) {
  const { askAI } = useAITutor();
  const { playSound } = useAudio();
  
  const [slots, setSlots] = useState<string[]>(Array(10).fill(''));
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  const availableBlocks = BLOCKS.filter(b => !slots.includes(b.id));

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
      playSound('error'); // Need to actually implement error sound or just play step
      const wrongSeqStr = slots.map(id => BLOCKS.find(b => b.id === id)?.text).join(' -> ');
      askAI(
        "学生正在拼接枚举法的算法流程图，正确顺序应该是：1.开始 2.鸡a=35 3.兔b=0 4.计算c 5.判断c!=94 6(是).a=a-1 7.b=b+1 8(否).输出a 9.输出b 10.结束。",
        `学生提交的错误顺序是：${wrongSeqStr}`
      );
    }
  };

  const currentBlockAt = (index: number) => {
    const id = slots[index];
    if (!id) return null;
    return BLOCKS.find(b => b.id === id);
  };

  const SlotNode = ({ idx, label, shape = 'rect' }: { idx: number, label: string, shape?: 'rect' | 'diamond' | 'pill' }) => {
    const block = currentBlockAt(idx);
    const active = selectedBankId && !block;
    
    let shapeClass = "w-[120px] h-[36px] flex items-center justify-center text-[10px] font-sans transition-all cursor-pointer relative";
    if (shape === 'pill') shapeClass += " rounded-full";
    if (shape === 'diamond') shapeClass = "w-[140px] h-[40px] flex items-center justify-center text-[10px] font-sans transition-all cursor-pointer clip-diamond relative"; // Needs clip path in css

    const isEmpty = !block;
    
    return (
      <div className="flex flex-col items-center">
        <div className="text-[9px] text-[#F97316] font-mono tracking-widest mb-1 italic opacity-60">{label}</div>
        <div 
          onClick={() => handleSlotClick(idx)}
          className={`${shapeClass} ${isEmpty ? (active ? 'border-2 border-dashed border-[#F97316] bg-[#FFEDD5]' : 'border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-neutral-400') : 'border border-neutral-900 bg-white text-neutral-900 shadow-[2px_2px_0_0_#171717] hover:-translate-y-[1px]'}`}
          style={shape === 'diamond' ? { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', padding: '0 20px', textAlign: 'center' } : {}}
        >
          {block ? block.text : <span className="opacity-30">Empty</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F9F8F6] border border-neutral-300 p-8 shadow-sm font-sans mb-10 w-full col-span-2">
      <div className="flex justify-between items-end mb-6 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold italic text-neutral-900 mb-1">制作流程图 Builder</h2>
          <p className="text-xs text-neutral-500 font-mono tracking-widest uppercase">先点击下方材料库的图块，再点击流程图的空位放入</p>
        </div>
        <button onClick={checkPuzzle} className="btn btn-primary px-8">验证提交 Verify</button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 border-r border-neutral-200 pr-8">
          <div className="relative w-full flex flex-col items-center gap-4 py-4 bg-white border border-neutral-200 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
            
            <SlotNode idx={0} label="01. 开始" shape="pill" />
            <div className="w-[1px] h-[16px] bg-neutral-900"></div>
            
            <SlotNode idx={1} label="02. 初始值1" />
            <div className="w-[1px] h-[16px] bg-neutral-900"></div>
            
            <SlotNode idx={2} label="03. 初始值2" />
            <div className="w-[1px] h-[16px] bg-neutral-900"></div>
            
            <SlotNode idx={3} label="04. 计算" />
            <div className="w-[1px] h-[16px] bg-neutral-900"></div>
            
            {/* Conditional branching */}
            <div className="relative flex flex-col items-center">
              <SlotNode idx={4} label="05. 判断" shape="diamond" />
              
              <div className="flex w-[240px] justify-between mt-[16px] relative">
                {/* Branch YES (Left) */}
                <div className="flex flex-col items-center absolute left-0" style={{ transform: 'translateX(-30%)' }}>
                  <div className="text-[10px] font-bold text-[#15803D] mb-2 uppercase border border-[#15803D] px-1 bg-[#DCFCE7]">YES 是</div>
                  <SlotNode idx={5} label="06. 循环步1" />
                  <div className="w-[1px] h-[16px] bg-neutral-900 my-1"></div>
                  <SlotNode idx={6} label="07. 循环步2" />
                  <div className="text-[8px] text-neutral-400 mt-2 border border-neutral-300 px-1">Loop Back</div>
                </div>

                {/* Left line drawing from diamond */}
                <svg className="absolute left-[30px] top-[-20px] z-[-1]" width="100" height="30" style={{ pointerEvents: 'none' }}>
                  <polyline points="90,10 20,10 20,30" fill="none" stroke="#171717" strokeWidth="1"></polyline>
                </svg>

                {/* Branch NO (Right) */}
                <div className="flex flex-col items-center absolute right-[30px]">
                  <div className="text-[10px] font-bold text-[#B91C1C] mb-2 uppercase border border-[#B91C1C] px-1 bg-[#FEE2E2]">NO 否</div>
                  <SlotNode idx={7} label="08. 输出" />
                  <div className="w-[1px] h-[16px] bg-neutral-900 my-1"></div>
                  <SlotNode idx={8} label="09. 输出" />
                </div>
                
                {/* Right line drawing from diamond */}
                <svg className="absolute right-[50px] top-[-20px] z-[-1]" width="100" height="30" style={{ pointerEvents: 'none' }}>
                  <polyline points="10,10 50,10 50,30" fill="none" stroke="#171717" strokeWidth="1"></polyline>
                </svg>

              </div>
              <div className="h-[120px]"></div> {/* Spacing for branches */}
            </div>

            <div className="w-[1px] h-[20px] bg-neutral-900 absolute bottom-[70px] right-[100px]"></div>
            <svg className="absolute right-[100px] bottom-[50px]" width="10" height="30" style={{ pointerEvents: 'none' }}>
               <polyline points="0,0 0,20 10,20" fill="none" stroke="#171717" strokeWidth="1"></polyline>
            </svg>

            <SlotNode idx={9} label="10. 结束" shape="pill" />
          </div>
        </div>

        <div className="w-[280px] shrink-0">
          <div className="bg-white border border-neutral-200 p-5 shadow-sm sticky top-24">
            <h3 className="font-bold text-[#1D4ED8] uppercase tracking-widest text-[10px] mb-4 border-b border-neutral-200 pb-2">图块库 Block Bank</h3>
            <div className="flex flex-col gap-2">
              {availableBlocks.length === 0 && <div className="text-xs text-neutral-400 italic">所有图块已放置！</div>}
              {availableBlocks.map(b => (
                <div 
                  key={b.id}
                  onClick={() => handleBankClick(b.id)}
                  className={`p-2 text-center text-xs border cursor-pointer transition-colors font-mono tracking-wide ${selectedBankId === b.id ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-[2px_2px_0_0_#93C5FD]' : 'bg-neutral-50 border-neutral-300 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400'}`}
                >
                  {b.text}
                </div>
              ))}
            </div>
            {selectedBankId && (
              <div className="mt-4 p-2 bg-[#DBEAFE] border border-[#BFDBFE] text-[10px] text-[#1E3A8A] font-bold uppercase tracking-widest text-center animate-pulse">
                已选中！请点击左侧流程图空位放置
              </div>
            )}
            <div className="mt-6 border-t border-neutral-200 pt-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest leading-relaxed">
              [TIP] 想清楚每一步该干什么，可以参考上一关的表格推导过程！
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
