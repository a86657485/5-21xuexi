import { useState, useEffect } from "react";
import { useProgress } from "../lib/progress";
import { useAudio } from "../lib/audio";
import { motion, AnimatePresence } from "motion/react";
import { Chicken, Rabbit } from "../components/Icons";
import { useAITutor } from "../lib/AITutorContext";

export default function Level2() {
  const { completeLevel, showCelebration } = useProgress();
  const { playSound } = useAudio();
  const { showTutorial } = useAITutor();

  useEffect(() => {
    showTutorial(2, "这一关我们要用假设法。先试试热身练习，拖动滑块寻找正确的鸡兔数量。\n你会发现，假设全是一种动物时，脚的数量就不对了，我们需要一只只替换，观察脚数的变化！");
  }, []);

  const [warmupChickens, setWarmupChickens] = useState(0);
  const [warmupSolved, setWarmupSolved] = useState(false);
  
  const [mainMethod, setMainMethod] = useState<1 | 2>(1); // 1 = assume all rabbits and slide chickens, 2 = assume all chickens and slide rabbits
  const [mainSliderVal, setMainSliderVal] = useState(0);
  const [mainSolved, setMainSolved] = useState(false);

  // Warmup logic
  const warmupRabbits = 6 - warmupChickens;
  const warmupFeet = warmupChickens * 2 + warmupRabbits * 4;

  useEffect(() => {
    if (warmupFeet === 18 && !warmupSolved) {
      setWarmupSolved(true);
      playSound('correct');
    }
  }, [warmupFeet, warmupSolved, playSound]);

  const handleWarmupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWarmupChickens(parseInt(e.target.value));
  };

  // Main logic
  const mainChickens = mainMethod === 1 ? mainSliderVal : 35 - mainSliderVal;
  const mainRabbits = mainMethod === 1 ? 35 - mainSliderVal : mainSliderVal;
  const mainFeet = mainChickens * 2 + mainRabbits * 4;

  useEffect(() => {
    if (mainFeet === 94 && !mainSolved) {
      setMainSolved(true);
      playSound('correct');
    }
  }, [mainFeet, mainSolved, playSound]);

  const handleMethodChange = (m: 1 | 2) => {
    setMainMethod(m);
    setMainSliderVal(0);
    playSound('click');
  };

  const handleComplete = () => {
    completeLevel(2);
    showCelebration({
      icon: '🧮',
      title: '假设法掌握！',
      msg: '很好！你用假设法找到了答案。\n但如果不知道公式怎么办？下面用枚举法逐一尝试！',
      nextPage: '/level3',
      nextLabel: '进入关卡3：表格枚举 →'
    });
  };

  return (
    <div className="container max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-16 flex flex-col items-center" style={{ animation: 'fadeIn 0.6s ease forwards' }}>
        <div className="inline-flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold mb-5 font-mono">
          [02] MATHEMATICAL HYPOTHESIS
        </div>
        <h1 className="text-5xl font-serif font-bold text-neutral-900 mb-3 italic tracking-tighter">数学假设法</h1>
        <div className="w-12 h-[1px] bg-neutral-400 mx-auto my-5"></div>
        <p className="text-sm text-neutral-500 uppercase tracking-widest">拖动滑条，亲手用假设法找到答案！</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 border-t border-neutral-300 pt-12"
      >
        <div className="bg-[#DBEAFE] border-[1.5px] border-[#1D4ED8] p-[20px_24px] mb-8">
          <h3 className="text-[#1D4ED8] text-[0.8rem] uppercase tracking-widest font-bold mb-2">🌟 热身练习 Warmup</h3>
          <p className="text-sm text-neutral-700 m-0 leading-relaxed font-serif">
            先用简化版练手：<strong className="text-neutral-900">鸡兔同笼，共6个头，18只脚</strong>，问鸡兔各几只？
          </p>
        </div>

        <div className="bg-[#F3F1EC] border border-neutral-300 p-8 my-5 shadow-sm">
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 font-mono text-center">
            [COMBINATION] CHICKEN vs RABBIT
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center min-h-[70px] items-center p-3 mb-6 bg-white border border-neutral-200">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-end w-[58px] h-[68px]">
                {i < warmupChickens ? <Chicken size={46} /> : <Rabbit size={46} />}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 py-3 border-t border-neutral-300 pt-6">
            <span className="text-xs uppercase tracking-widest text-neutral-600 whitespace-nowrap font-bold min-w-[80px]">鸡的数量</span>
            <input 
              type="range" 
              className="custom-slider" 
              min="0" max="6" 
              value={warmupChickens} 
              onChange={handleWarmupChange} 
            />
            <span className="text-[1.8rem] font-bold font-serif min-w-[40px] text-right text-[#F97316] italic">
              {warmupChickens}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">只鸡</span>
          </div>

          <div className={`flex items-center gap-4 p-5 mt-6 border transition-colors duration-400 ${warmupFeet === 18 ? 'bg-[#DCFCE7] border-[#4ADE80]' : warmupFeet > 18 || warmupFeet < 18 ? 'bg-[#FEE2E2] border-[#B91C1C]/20' : 'bg-white border-neutral-300'}`}>
            <span className="text-2xl shrink-0 opacity-80">🦶</span>
            <div>
              <div className="text-sm font-bold font-serif mb-1 text-neutral-900">脚数 = {warmupChickens}×2 + {warmupRabbits}×4 = {warmupFeet}只</div>
              <div className="text-xs text-neutral-600 uppercase tracking-wide">
                {warmupFeet === 18 ? `✓ 等于目标18只脚！答案：鸡${warmupChickens}只，兔${warmupRabbits}只` :
                 warmupFeet < 18 ? `目标：18只脚 — 还少${18-warmupFeet}只，需要增加兔的数量` :
                 `目标：18只脚 — 多了${warmupFeet-18}只，需要减少兔的数量`}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {warmupSolved && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden mb-16 border-t border-neutral-300 pt-12"
          >
            <div className="text-center mb-8">
              <span className="inline-flex items-center bg-neutral-900 text-white px-3 py-1 font-mono text-[10px] tracking-widest uppercase">
                 [RULE] 规律总结
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#171717] text-white p-8 text-center font-serif relative">
                <div className="absolute top-0 right-0 bg-neutral-700 text-white font-mono text-[10px] px-2 py-1">Rule_A</div>
                <div className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-60 mb-6 border-b border-white/20 pb-4">假设全是兔 → 求鸡的数量</div>
                <div className="text-[#F97316] text-[1.4rem] font-bold tracking-tight mb-4 italic">鸡 = (头数×4 - 脚数) ÷ 2</div>
                <div className="text-sm opacity-80 font-mono tracking-wide">= (6×4 - 18) ÷ 2 = 3只</div>
              </div>
              <div className="bg-[#171717] text-white p-8 text-center font-serif relative">
                <div className="absolute top-0 right-0 bg-neutral-700 text-white font-mono text-[10px] px-2 py-1">Rule_B</div>
                <div className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-60 mb-6 border-b border-white/20 pb-4">假设全是鸡 → 求兔的数量</div>
                <div className="text-[#F97316] text-[1.4rem] font-bold tracking-tight mb-4 italic">兔 = (脚数 - 头数×2) ÷ 2</div>
                <div className="text-sm opacity-80 font-mono tracking-wide">= (18 - 6×2) ÷ 2 = 3只</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4 my-16 text-neutral-400 text-[10px] font-bold font-mono tracking-[0.2em] uppercase before:flex-1 before:h-[1px] before:bg-neutral-300 after:flex-1 after:h-[1px] after:bg-neutral-300">
        Challenge 挑战正式题目
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white border-[1px] border-neutral-300 p-10 mb-12 shadow-sm"
      >
        <div className="text-center mb-8 border-b border-neutral-200 pb-8">
          <span className="inline-block bg-[#FDBA74] text-neutral-900 px-3 py-1 text-[10px] uppercase font-bold tracking-widest font-mono">Formal Challenge</span>
          <h2 className="mt-6 text-4xl font-serif font-bold italic">35头，94脚，各几只？</h2>
        </div>

        <div className="mb-8">
          <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-4">Select Hypothesis: 先选择你的假设方向</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className={`flex-1 flex flex-col items-start p-5 border text-left transition-all duration-300 font-sans ${mainMethod === 1 ? 'border-[#F97316] bg-[#FFEDD5]' : 'border-neutral-300 hover:border-[#F97316] hover:bg-[#FFEDD5]'} group`}
              onClick={() => handleMethodChange(1)}
            >
              <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">🐰</span>
              <span className="text-sm font-bold text-neutral-800">假设35只全是<strong className="text-[#F97316] font-extrabold text-base mx-1">兔</strong><br className="sm:hidden" />再求鸡的数量</span>
            </button>
            <button 
              className={`flex-1 flex flex-col items-start p-5 border text-left transition-all duration-300 font-sans ${mainMethod === 2 ? 'border-[#15803D] bg-[#DCFCE7]' : 'border-neutral-300 hover:border-[#15803D] hover:bg-[#DCFCE7]'} group`}
              onClick={() => handleMethodChange(2)}
            >
              <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">🐔</span>
              <span className="text-sm font-bold text-neutral-800">假设35只全是<strong className="text-[#15803D] font-extrabold text-base mx-1">鸡</strong><br className="sm:hidden" />再求兔的数量</span>
            </button>
          </div>
        </div>

        <div className="bg-[#F3F1EC] border border-neutral-300 p-8 mt-10">
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-6 border-b border-neutral-300 pb-2 inline-block">
            SLIDER: FIND THE ANSWER
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-1 justify-center min-w-[300px] min-h-[70px] items-center p-4 bg-white border border-neutral-300">
              {Array.from({ length: 35 }).slice(0, 20).map((_, i) => {
                // Determine what to show.  If chickens < 20, show those, then rabbits.
                const isChicken = i < Math.min(mainChickens, 20);
                // Also pad with rabbits if we run out of drawn chickens up to 20 drawn items.
                const type = isChicken ? 'chicken' : 'rabbit';
                return (
                  <div key={i} className="flex flex-col items-center justify-end w-[40px] h-[50px] shrink-0">
                    {type === 'chicken' ? <Chicken size={36} /> : <Rabbit size={36} />}
                  </div>
                );
              })}
              {35 > 20 && (
                <div className="text-[10px] font-mono text-neutral-500 ml-4 self-center shrink-0 uppercase tracking-widest bg-neutral-100 p-2 border border-neutral-200">
                  ... Total: 35
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 py-6 border-t border-neutral-300 mt-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-600 whitespace-nowrap min-w-[80px]">
              {mainMethod === 1 ? '鸡的数量' : '兔的数量'}
            </span>
            <input 
              type="range" 
              className="custom-slider" 
              min="0" max="35" 
              value={mainSliderVal} 
              onChange={(e) => setMainSliderVal(parseInt(e.target.value))} 
            />
            <span className={`text-[1.8rem] font-bold font-serif min-w-[40px] text-right italic ${mainMethod === 1 ? 'text-[#F97316]' : 'text-[#15803D]'}`}>
              {mainSliderVal}
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">只</span>
          </div>

          <div className={`flex items-center gap-4 p-5 mt-4 border transition-colors duration-400 ${mainFeet === 94 ? 'bg-[#DCFCE7] border-[#4ADE80]' : mainSliderVal === 0 ? 'bg-white border-neutral-300' : 'bg-[#FEE2E2] border-[#B91C1C]/20'}`}>
            <span className="text-2xl shrink-0 opacity-80">🦶</span>
            <div>
              <div className="text-sm font-bold font-serif text-neutral-900 mb-1">脚数 = {mainChickens}×2 + {mainRabbits}×4 = {mainFeet}只</div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-600">
                {mainFeet === 94 ? `✓ 正好94只脚！答案：鸡${mainChickens}只，兔${mainRabbits}只` :
                 mainFeet < 94 ? `目标：94只脚 — 还少${94-mainFeet}只，${mainMethod===1?'增加兔减少鸡':'增加鸡减少兔'}试试` :
                 `目标：94只脚 — 多了${mainFeet-94}只，${mainMethod===1?'增加鸡减少兔':'增加兔减少鸡'}试试`}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mainSolved && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.6 }}
              className="overflow-hidden mt-8 border-t border-neutral-200 pt-8"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#FFEDD5] border border-[#FDBA74] p-8 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[#F97316] opacity-0 group-hover:opacity-5 transition-opacity"></div>
                  <div className="text-[3rem] mb-4 leading-none transform group-hover:scale-110 transition-transform">🐔</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#F97316] mb-2 opacity-80">Rabbits assumed...<br/>Chicken Count</div>
                  <div className="text-[4rem] font-bold font-serif leading-none tracking-tight text-[#F97316] mb-1 italic">23</div>
                  <div className="text-[10px] font-mono text-[#F97316]/60">Units</div>
                </div>
                <div className="bg-[#DCFCE7] border border-[#4ADE80] p-8 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[#15803D] opacity-0 group-hover:opacity-5 transition-opacity"></div>
                  <div className="text-[3rem] mb-4 leading-none transform group-hover:scale-110 transition-transform">🐰</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#15803D] mb-2 opacity-80">Chickens assumed...<br/>Rabbit Count</div>
                  <div className="text-[4rem] font-bold font-serif leading-none tracking-tight text-[#15803D] mb-1 italic">12</div>
                  <div className="text-[10px] font-mono text-[#15803D]/60">Units</div>
                </div>
              </div>
              <div className="bg-neutral-900 border border-neutral-900 text-white p-5 mt-6 text-[11px] font-mono tracking-wide flex flex-col md:flex-row justify-between items-center opacity-90">
                <strong className="text-[#A3A3A3] mb-2 md:mb-0">[VERIFICATION PING]</strong>
                <div>
                  23 + 12 = 35 <span className="text-[#4ADE80] mr-4">✓</span>
                  23×2 + 12×4 = 46 + 48 = 94 <span className="text-[#4ADE80]">✓</span>
                </div>
              </div>
              <div className="text-center mt-12 flex justify-center border-t border-neutral-200 pt-8">
                <button className="btn btn-primary btn-lg w-full max-w-sm" onClick={handleComplete}>
                  <span>✓ 完成！进入关卡3</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
