import { Link } from "react-router-dom";
import { useProgress } from "../lib/progress";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useAITutor } from "../lib/AITutorContext";

const LEVELS = [
  { n: 1, icon: '📜', title: '故事引入', desc: '探索古代算题\n的历史渊源', page: '/level1' },
  { n: 2, icon: '🧮', title: '数学假设法', desc: '用假设法快速\n找到答案', page: '/level2' },
  { n: 3, icon: '📊', title: '表格枚举', desc: '用遍历法逐一\n发现规律', page: '/level3' },
  { n: 4, icon: '🔀', title: '算法流程图', desc: '理解算法步骤\n与计算机思维', page: '/level4' },
  { n: 5, icon: '💻', title: '程序验证', desc: '代码与算法的\n完美对应', page: '/level5' },
];

export default function Home() {
  const { unlocked, completed, resetProgress } = useProgress();
  const { showTutorial } = useAITutor();

  useEffect(() => {
    showTutorial(0, "你好！我是你的AI伴学导师。这节课我们要探索一个著名的中国古代数学问题《鸡兔同笼》。\n\n你可以随时点击右下角的图标呼叫我。如果操作遇到问题，我也会出来帮你。\n\n点击【开始探究】，跟我一起挑战吧！");
  }, []);

  const handleReset = () => {
    if (confirm('确认重置所有学习进度吗？')) {
      resetProgress();
    }
  };

  const isLocked = (n: number) => !unlocked.includes(n) && !completed.includes(n) && n !== 1;
  const isDone = (n: number) => completed.includes(n);

  return (
    <div className="w-full bg-[#F9F8F6]">
      <section className="relative flex min-h-[calc(100vh-80px)] items-center overflow-hidden">
        
        <div className="container relative z-10 max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-5 flex items-center gap-3 font-sans text-[10px] tracking-[0.2em] font-bold text-neutral-500 uppercase overflow-hidden">
              <span className="shrink-0 tracking-widest">System Analysis · Mod 21</span>
              <div className="h-[1px] w-full bg-neutral-300"></div>
            </div>
            
            <h1 className="mb-4 text-8xl font-bold font-serif leading-[0.9] tracking-tighter">
              鸡兔<span className="italic text-[#F97316] font-normal">同笼</span><br />
              <span className="not-italic font-extrabold tracking-tighter">探究之旅</span>
            </h1>
            
            <div className="flex gap-4">
              <div className="w-[2px] bg-neutral-300 self-stretch mt-2 mb-8"></div>
              <p className="mb-10 max-w-[520px] text-sm leading-relaxed text-neutral-600 font-sans">
                从古代算题到现代枚举算法，用5个互动关卡发现数学与计算机思维的奇妙联系。我们正在从模块化传统模式过渡到核心互动交互。
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link to="/level1" className="btn btn-primary btn-lg">
                <span>开始探究</span>
              </Link>
              <button 
                className="btn btn-outline btn-lg" 
                onClick={handleReset}
              >
                重置进度
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-24 border-t border-neutral-300 pt-8"
          >
            <div className="flex justify-between items-baseline mb-8">
              <h2 className="text-3xl font-serif italic text-neutral-900">学习路径</h2>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">Ref_ID: 2024-NF-BUILD</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-4">
              {LEVELS.map((lv) => {
                const locked = isLocked(lv.n);
                const done = isDone(lv.n);

                return (
                  <Link
                    key={lv.n}
                    to={locked ? "#" : lv.page}
                    className={`relative overflow-hidden bg-white border border-neutral-200 p-[22px_16px] text-center shadow-sm transition-all duration-300 group ${locked ? "cursor-not-allowed opacity-50 grayscale-[30%]" : "hover:-translate-y-1 hover:border-neutral-400"}`}
                    onClick={(e) => locked && e.preventDefault()}
                  >
                    <div className="absolute top-0 right-0 bg-neutral-900 text-white text-[10px] px-2 py-1 font-mono">
                      0{lv.n}
                    </div>
                    {done && (
                      <div className="absolute left-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-sm bg-[#15803D] text-[10px] text-white">
                        ✓
                      </div>
                    )}
                    <span className="mt-4 mb-2.5 block text-3xl group-hover:scale-110 transition-transform">{lv.icon}</span>
                    <div className="mb-1.5 font-serif text-[0.95rem] font-bold text-neutral-900">
                      {lv.title}
                    </div>
                    <div 
                      className="text-[0.7rem] leading-[1.5] text-neutral-500 uppercase tracking-widest mt-2 border-t border-neutral-100 pt-2"
                      dangerouslySetInnerHTML={{ __html: lv.desc.replace('\n', '<br>') }}
                    />
                    {locked && (
                      <div className="mt-2 text-[0.65rem] text-neutral-400 uppercase tracking-widest">
                        🔒 锁定
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mt-24 bg-[#171717] py-16 text-white">
        <div className="mx-auto max-w-[600px] text-center">
          <div className="mb-6 text-[10px] uppercase tracking-[0.3em] text-white/50 border-b border-white/20 pb-4 inline-block">
            — THE ORIGIN —
          </div>
          <div className="text-2xl font-serif italic leading-[1.8] text-white/90">
            今有<span className="font-extrabold not-italic text-[#F97316]">鸡兔同笼</span>，上有三十五头，<br />
            下有九十四足，问鸡兔各几何？
          </div>
          <div className="mt-8 text-[11px] font-sans uppercase tracking-[0.15em] text-white/40">
            [《孙子算经》· 约成书于公元3~5世纪]
          </div>
        </div>
      </section>
    </div>
  );
}
