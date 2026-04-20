import { useState, useEffect, useRef } from "react";
import { useProgress } from "../lib/progress";
import { useAudio } from "../lib/audio";
import { motion, useInView } from "motion/react";
import { Chicken, Rabbit } from "../components/Icons";
import { useAITutor } from "../lib/AITutorContext";

export default function Level1() {
  const { completeLevel, showCelebration } = useProgress();
  const { playSound } = useAudio();
  const { showTutorial } = useAITutor();
  const [animals, setAnimals] = useState<string[]>([]);
  const scrollRef = useRef(null);
  const isInView = useInView(scrollRef, { once: true, margin: "-100px" });
  
  useEffect(() => {
    showTutorial(1, "欢迎来到第一关！这道题叫做算经难题。\n如果你想理解故事背景，只要看看下方的原图就行了。\n你可以试着点一下小动物哦~");

    // Generate cage animals
    const initial = [
      ...Array(8).fill('chicken'),
      ...Array(6).fill('rabbit'),
    ].sort(() => Math.random() - 0.5);
    setAnimals(initial);
  }, []);

  const handleAnimalClick = (i: number) => {
    playSound('click');
    const el = document.getElementById(`animal-${i}`);
    if (el) {
      el.style.animation = 'none';
      el.style.transform = 'scale(1.5) rotate(-15deg)';
      
      const rect = el.getBoundingClientRect();
      const div = document.createElement('div');
      div.style.cssText = `position:fixed;pointer-events:none;z-index:999;font-size:1.5rem;animation:confettiFall 1.5s ease forwards;`;
      div.style.left = rect.left + rect.width/2 - 16 + 'px';
      div.style.top = rect.top - 20 + 'px';
      div.textContent = ['🐔','🐰','❤️','✨','🎵'][Math.floor(Math.random()*5)];
      document.body.appendChild(div);
      
      setTimeout(() => {
        el.style.transform = '';
        el.style.animation = `float 3s ease-in-out infinite ${i * 0.15}s`;
        div.remove();
      }, 400);
    }
  };

  const handleComplete = () => {
    completeLevel(1);
    showCelebration({
      icon: '📜',
      title: '故事理解完成！',
      msg: '你已经了解了鸡兔同笼问题的背景。\n接下来用数学假设法来找出答案！',
      nextPage: '/level2',
      nextLabel: '进入关卡2：假设法 →'
    });
  };

  return (
    <div className="container max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-16 flex flex-col items-center"
        style={{ animation: 'fadeIn 0.6s ease forwards' }}
      >
        <div className="inline-flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold mb-5 font-mono">
          [01] THE STORY
        </div>
        <h1 className="text-5xl font-serif font-bold text-neutral-900 mb-3 italic tracking-tighter">故事引入</h1>
        <div className="w-12 h-[1px] bg-neutral-400 mx-auto my-5"></div>
        <p className="text-sm text-neutral-500 uppercase tracking-widest">从一道千年古题出发，开启我们的探究之旅</p>
      </div>

      <motion.div 
        ref={scrollRef}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="mb-16"
      >
        <div className="text-center mb-5">
          <span className="inline-flex items-center gap-1 bg-white border border-neutral-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-600">
            《孙子算经》原文
          </span>
        </div>
        
        <div className="perspective-[800px]">
          <div className="relative bg-white border border-neutral-200 p-[40px_48px] origin-top mx-auto max-w-[400px] shadow-sm">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-serif text-[1.6rem] leading-[2.2] text-neutral-900 text-center"
            >
              今有<span className="text-[#F97316] font-bold text-[1.9rem] italic pr-1">鸡兔同笼</span>，<br/>
              上有<span className="text-[#F97316] font-bold">三十五</span>头，<br/>
              下有<span className="text-[#F97316] font-bold">九十四</span>足，<br/>
              问<span className="text-[#F97316] font-bold">鸡兔各几何</span>？
            </motion.div>
          </div>
        </div>
        <p className="text-center mt-6 text-[10px] text-neutral-400 uppercase tracking-widest">
          ——《孙子算经》卷下第31题，约公元3~5世纪
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-12 border-t border-neutral-300 pt-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between border-b border-neutral-900 pb-2 mb-4">
            <span className="serif italic text-2xl">The Cage</span>
            <span className="text-[10px] font-mono self-end mb-1 text-neutral-500">[01A]</span>
          </div>
          <p className="text-sm text-neutral-600 mb-5 leading-relaxed">笼子里关着若干只鸡和兔，你能看出有几只鸡、几只兔吗？<br/>点击小动物可以进行互动交互。</p>
          
          <div className="relative bg-neutral-100 border border-neutral-300 p-8 min-h-[220px] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" 
              style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 55px, rgba(0,0,0,0.05) 55px, rgba(0,0,0,0.05) 58px)' }} 
            />
            
            <div className="relative z-10 flex flex-wrap gap-3 justify-center pt-2">
              {animals.map((type, i) => (
                <div 
                  key={i} 
                  id={`animal-${i}`}
                  onClick={() => handleAnimalClick(i)}
                  className="cursor-pointer transition-transform duration-300 hover:!scale-[1.3] hover:!-rotate-[8deg]"
                  style={{ animation: `float 3s ease-in-out infinite ${i * 0.15}s` }}
                >
                  {type === 'chicken' ? <Chicken size={48} /> : <Rabbit size={48} />}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center mt-6">
            <motion.div 
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-neutral-200 px-7 py-4 text-center shadow-sm w-36"
            >
              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Total Heads</div>
              <div className="text-5xl font-bold font-serif text-neutral-900 italic">35</div>
            </motion.div>
            <motion.div 
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-neutral-200 px-7 py-4 text-center shadow-sm w-36"
            >
              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Total Feet</div>
              <div className="text-5xl font-bold font-serif text-neutral-900 italic">94</div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between border-b border-neutral-900 pb-2 mb-4">
            <span className="serif italic text-2xl">Problem Breakdown</span>
            <span className="text-[10px] font-mono self-end mb-1 text-neutral-500">[01B]</span>
          </div>
          <div className="flex flex-col gap-4 mt-8">
            {[
              { num: 'A', title: '同一个笼子', desc: '鸡和兔被关在同一个笼子里，无法直接看清数量' },
              { num: 'B', title: <>从上面数：<strong className="text-neutral-900">35个头</strong></>, desc: '鸡和兔各有1个头，所以头数 = 鸡的数量 + 兔的数量' },
              { num: 'C', title: <>从下面数：<strong className="text-neutral-900">94只脚</strong></>, desc: '鸡有2只脚，兔有4只脚，脚数 = 鸡数×2 + 兔数×4' },
              { num: 'D', title: <>求：鸡和兔<strong className="text-neutral-900">各有多少只</strong>？</>, desc: '这是信息科技课的任务：设计算法让计算机来解答！' }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-start gap-4 border-l border-neutral-300 pl-4 py-1"
              >
                <div className="w-8 h-8 rounded-full border border-neutral-900 bg-transparent text-neutral-900 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {step.num}
                </div>
                <div>
                  <h4 className="text-[12px] font-bold uppercase tracking-wider mb-1">{step.title}</h4>
                  <p className="text-[11px] text-neutral-600">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 border-t border-neutral-300 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-neutral-900 text-white p-8 rounded-sm"
        >
          <h3 className="text-[10px] uppercase tracking-widest mb-4 opacity-70">Legacy Solution</h3>
          <h4 className="text-2xl font-serif italic mb-4">抬腿法 —— 古人的解法</h4>
          <p className="text-sm leading-[1.8] text-neutral-300">
            《孙子算经》中记录了一种聪明的解法：<br />
            <strong>如果让所有动物都"抬起"两只脚……</strong><br />
            那么兔子每只会抬起2只脚，而鸡的脚已经全抬起了。<br />
            这样就能算出兔的数量了！
          </p>
          <div className="border border-white/20 p-4 mt-6 font-mono text-[11px] leading-relaxed opacity-90 text-neutral-300">
            ① 全部抬起2只脚后，剩余脚数 = 94 - 35×2 = 24<br />
            ② 剩余都是兔子抬起的脚，兔数 = 24÷2 = <strong className="text-white">12只</strong><br />
            ③ 鸡数 = 35 - 12 = <strong className="text-white">23只</strong>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-neutral-200 p-8 rounded-sm shadow-sm"
        >
          <h3 className="text-[10px] uppercase tracking-[0.2em] mb-4 text-neutral-500 font-bold">Modern Solution</h3>
          <h4 className="text-2xl font-serif italic mb-4 text-neutral-900">计算机的方式 —— 枚举法</h4>
          <p className="text-sm leading-[1.8] text-neutral-600">
            但如果我们不知道这个解法呢？<br />
            计算机可以用<strong>枚举法</strong>——逐一尝试所有可能的组合，<br />
            直到找到正确答案。<br />
            这就是接下来我们要学习的内容！
          </p>
          <div className="border border-neutral-200 bg-[#F9F8F6] p-4 mt-6 font-mono text-[11px] leading-relaxed text-neutral-500">
            鸡=35,兔=0 → 脚=70 ✗<br />
            鸡=34,兔=1 → 脚=72 ✗<br />
            鸡=33,兔=2 → 脚=74 ✗<br />
            …… 继续尝试 ……<br />
            <span className="text-[#15803D] font-bold">鸡=23,兔=12 → 脚=94 ✓ 找到了！</span>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-center pb-16 flex flex-col items-center border-t border-neutral-900 pt-12"
      >
        <button className="btn btn-primary btn-lg" onClick={handleComplete}>
          <span>✓ 理解了！进入关卡2</span>
        </button>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          Next Phase: 数学假设法亲手求解
        </p>
      </motion.div>
      
      {/* Required keyframe for float since inline style animation uses it */}
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes confettiFall {
          to { transform: translateY(-50px) scale(1.5); opacity: 0; }
        }
      `}} />
    </div>
  );
}
