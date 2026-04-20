import { useState } from "react";
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

const ArrowDown = ({ h = 20, className = "" }) => (
  <div className={`relative flex justify-center w-full z-0 ${className}`} style={{ height: h }}>
    <div className="w-[1.5px] bg-[#3ba7f2] h-full" />
    <div className="absolute bottom-[-1px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#3ba7f2]" />
  </div>
);

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
      playSound('step');
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

  const SlotNode = ({ idx, shape = 'rect' }: { idx: number, shape?: 'rect' | 'diamond' | 'pill' | 'parallelogram' }) => {
    const block = currentBlockAt(idx);
    const active = selectedBankId && !block;
    const isEmpty = !block;
    
    let baseClass = "flex z-10 items-center justify-center text-[12px] font-sans transition-all cursor-pointer shadow-sm relative";
    
    let shapeClass = `${baseClass} w-[140px] h-[36px] bg-white border border-[#3ba7f2]`;
    
    if (shape === 'pill') {
      shapeClass = `${baseClass} w-[110px] h-[36px] bg-[#cce3d1] border border-[#58a76b] rounded-full text-neutral-800`;
    } else if (shape === 'diamond') {
      shapeClass = `${baseClass} w-[170px] h-[48px] bg-[#f9f8f6] border border-[#3ba7f2] text-[#3ba7f2] font-medium`;
    } else if (shape === 'parallelogram') {
      shapeClass = `${baseClass} w-[120px] h-[36px] bg-[#f9f8f6] border border-[#3ba7f2] -skew-x-[15deg] text-[#3ba7f2]`;
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
        style={shape === 'diamond' ? { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' } : {}}
      >
        <span className={shape === 'parallelogram' ? 'skew-x-[15deg]' : ''}>
          {block ? block.text : <span className="opacity-30 text-[10px]">点击放置</span>}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-[#F9F8F6] border border-neutral-300 p-8 shadow-sm font-sans mb-10 w-full col-span-2">
      <div className="flex justify-between items-end mb-6 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold italic text-neutral-900 mb-1">制作流程图 Builder</h2>
          <p className="text-xs text-neutral-500 font-mono tracking-widest uppercase">参考左侧图库，完美还原教材的枚举法流程图</p>
        </div>
        <button onClick={checkPuzzle} className="btn btn-primary px-8">验证提交 Verify</button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 pr-0 md:pr-4 overflow-x-auto min-w-[500px]">
          <div className="relative w-full flex flex-col items-center py-10 bg-[#e4f3fa] border border-neutral-200 shadow-sm z-0 font-serif overflow-visible min-h-[700px]">
             <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>

             <SlotNode idx={0} shape="pill" />
             <ArrowDown h={20} />
             
             <SlotNode idx={1} />
             <ArrowDown h={20} />
             
             <SlotNode idx={2} />
             
             <div className="relative flex flex-col items-center w-full z-10">
                <ArrowDown h={20} />
                <div className="absolute left-[50%] ml-[-125px] top-[10px] w-[55px] border-l-[1.2px] border-t-[1.2px] border-[#3ba7f2] h-[250px] border-b-[1.2px]">
                   <div className="absolute right-[-4px] top-[-4.5px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#3ba7f2]" />
                </div>

                <SlotNode idx={3} />
                <ArrowDown h={20} />
                
                <div className="relative w-full flex flex-col items-center">
                   <SlotNode idx={4} shape="diamond" />
                   
                   <div className="absolute top-[24px] left-[50%] ml-[85px] w-[55px] h-[1.2px] bg-[#3ba7f2] z-0">
                      <div className="absolute top-[-20px] left-[15px] text-[12px] text-neutral-600 font-sans tracking-widest">否</div>
                      <div className="absolute right-[-5px] top-[-3.5px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#3ba7f2]" />
                   </div>

                   <div className="absolute top-[24px] left-[50%] ml-[140px] flex flex-col items-center">
                      <ArrowDown h={24} />
                      <SlotNode idx={7} shape="parallelogram" />
                      <ArrowDown h={20} />
                      <SlotNode idx={8} shape="parallelogram" />
                      <div className="w-[1.2px] bg-[#3ba7f2] h-[46px]" />
                      <div className="absolute bottom-0 right-[50%] w-[140px] h-[1.2px] bg-[#3ba7f2]"></div>
                   </div>

                   <div className="flex flex-col items-center">
                      <div className="absolute top-[50px] left-[50%] ml-[10px] text-[12px] text-neutral-600 font-sans tracking-widest">是</div>
                      <ArrowDown h={30} />
                      <SlotNode idx={5} />
                      <ArrowDown h={20} />
                      <SlotNode idx={6} />
                      <div className="w-[1.2px] bg-[#3ba7f2] h-[18px]" />
                   </div>
                </div>
                
                <div className="relative w-full flex flex-col items-center z-20">
                   <ArrowDown h={20} />
                   <SlotNode idx={9} shape="pill" />
                </div>
             </div>
          </div>
        </div>

        <div className="w-[200px] shrink-0">
          <div className="bg-white border border-neutral-200 p-5 shadow-sm sticky top-24">
             <h3 className="font-bold text-[#3ba7f2] uppercase tracking-widest text-[10px] mb-4 border-b border-neutral-200 pb-2">图块库 Block Bank</h3>
             <div className="flex flex-col gap-2">
                {availableBlocks.length === 0 && <div className="text-xs text-neutral-400 italic">图块已放完！点击左侧验证。</div>}
                {availableBlocks.map(b => (
                  <div 
                    key={b.id}
                    onClick={() => handleBankClick(b.id)}
                    className={`p-2 text-center text-xs border cursor-pointer transition-colors font-sans tracking-wider ${selectedBankId === b.id ? 'bg-[#3ba7f2] text-white border-[#3ba7f2] shadow-[2px_2px_0_0_#bae6fd]' : 'bg-neutral-50 border-neutral-300 text-neutral-800 hover:bg-neutral-100 hover:border-[#3ba7f2]'}`}
                  >
                    {b.text}
                  </div>
                ))}
             </div>
             {selectedBankId && (
                <div className="mt-4 p-2 bg-[#e0f2fe] border border-[#bae6fd] text-[10px] text-[#0369a1] font-bold uppercase tracking-widest text-center animate-pulse">
                   已选中！请放入左侧空位
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
