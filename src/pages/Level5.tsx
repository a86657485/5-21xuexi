import { useState, useEffect } from "react";
import { useProgress } from "../lib/progress";
import { useAudio } from "../lib/audio";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useAITutor } from "../lib/AITutorContext";
import CageVisualizer from "../components/CageVisualizer";

export default function Level5() {
  const { completeLevel, resetProgress, stars } = useProgress();
  const { playSound } = useAudio();
  const { showTutorial, askAI } = useAITutor();

  useEffect(() => {
    showTutorial(5, "最后一关啦！\n这里你可以看着Python代码，点击「运行程序」，观察代码是怎么一行行执行的。它完全还原了前面你拼的流程图哦！");
  }, []);

  const [running, setRunning] = useState(false);
  const [programDone, setProgramDone] = useState(false);
  const [activeLines, setActiveLines] = useState<string[]>([]);
  
  const [a, setA] = useState(35);
  const [b, setB] = useState(0);
  const [c, setC] = useState<number | null>(null);
  
  const [iter, setIter] = useState(0);
  const MAX = 35;
  const [out1, setOut1] = useState("");
  const [out2, setOut2] = useState("");

  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [litStars, setLitStars] = useState(0);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runProgram = async () => {
    if (running) return;
    setRunning(true);
    setOut1("");
    setOut2("");
    setProgramDone(false);

    const initLines = ['el-1', 'el-2', 'el-3'];
    for (const l of initLines) {
      await sleep(200);
      setActiveLines([l]);
      playSound('step');
    }

    let localA = 35;
    let localB = 0;
    let localIter = 0;

    const doLoop = async (): Promise<void> => {
      localIter++;
      setIter(localIter);
      const localC = localA * 2 + localB * 4;

      setActiveLines(['el-4']);
      await sleep(60);
      setA(localA);
      setB(localB);
      setC(localC);

      setActiveLines(['el-5']);
      await sleep(60);

      if (localC === 94) {
        setActiveLines(['el-6']);
        await sleep(200);
        setActiveLines(['el-7']);
        await sleep(200);
        setActiveLines(['el-8']);
        await sleep(200);

        const msg1 = ">>> 鸡的数量: 23";
        const msg2 = ">>> 兔的数量: 12";

        for (let i = 0; i <= msg1.length; i++) {
          setOut1(msg1.slice(0, i));
          await sleep(40);
        }
        for (let j = 0; j <= msg2.length; j++) {
          setOut2(msg2.slice(0, j));
          await sleep(40);
        }

        setProgramDone(true);
        playSound('win');
        return;
      } else {
        setActiveLines(['el-9']);
        await sleep(40);
        setActiveLines(['el-10']);
        localA--;
        await sleep(40);
        setActiveLines(['el-11']);
        localB++;
        await sleep(40);
        await doLoop();
      }
    };

    await doLoop();
  };

  const checkAnswer = (choice: number) => {
    if (selectedChoice === 1 || selectedChoice === 2) return;
    
    setSelectedChoice(choice);
    if (choice === 1 || choice === 2) {
      playSound('correct');
    } else {
      playSound('step');
      if (choice === 3) {
        askAI("最后一关挑战题：10头，28脚。选择枚举法初始化变量。", "选择了 a=5, b=5 (从中间开始)。这虽然能算出来答案，但在标准程序枚举里，通常是从一个极限端点开始！请告诉学生这一点。");
      } else {
        askAI("最后一关挑战题：10头，28脚。选择枚举法初始化变量。", "选择了 a=28, b=0 (用脚数当做了初始动物数量)。提示他应该用头数来初始化！");
      }
    }
  };

  const getChoiceClasses = (choice: number) => {
    const base = "p-[14px_16px] bg-white border border-neutral-300 rounded-none cursor-pointer text-[0.95rem] font-sans font-medium transition-all text-center";
    
    if (selectedChoice === null) return `${base} hover:border-[#F97316] hover:bg-[#FFEDD5] hover:-translate-y-1`;
    
    if (choice === 1 || choice === 2) {
      return `${base} border-[#4ADE80] bg-[#DCFCE7] text-[#15803D]`;
    }
    
    if (selectedChoice === choice) {
      return `${base} border-[#B91C1C] bg-[#FEE2E2]`;
    }

    return `${base} opacity-50`;
  };

  const handleCompleteAll = () => {
    completeLevel(5);
    setShowSummary(true);
    
    const count = stars === 4 ? 5 : stars; // if calling completeLevel(5) now, it will be 5.
    let index = 0;
    
    const animateStars = setInterval(() => {
      index++;
      if (index <= count) {
        setLitStars(index);
        playSound('correct');
      } else {
        clearInterval(animateStars);
        playSound('win');
      }
    }, 500);
  };

  const codeLinesClass = (id: string) => {
    return `block p-[3px_8px] rounded transition-colors border-l-4 border-transparent text-[0.95rem] ${activeLines.includes(id) ? 'bg-[#F97316]/20 border-l-[#F97316]' : ''}`;
  };

  return (
    <div className="container max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-16 flex flex-col items-center" style={{ animation: 'fadeIn 0.6s ease forwards' }}>
        <div className="inline-flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold mb-5 font-mono">
          [05] 程序验证
        </div>
        <h1 className="text-5xl font-serif font-bold text-neutral-900 mb-3 italic tracking-tighter">程序验证</h1>
        <div className="w-12 h-[1px] bg-neutral-400 mx-auto my-5"></div>
        <p className="text-sm text-neutral-500 uppercase tracking-widest">运行程序，看算法在计算机中真正执行的过程</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <CageVisualizer chickens={a} rabbits={b} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start mb-16 border-t border-neutral-300 pt-12"
      >
        <div className="bg-white border border-neutral-200 p-8 shadow-sm">
          <div className="flex justify-between items-baseline mb-4 border-b border-neutral-300 pb-2">
            <h2 className="mb-2 text-2xl font-serif font-bold italic">▶ 运行原题程序</h2>
            <span className="text-[10px] font-mono text-[#F97316] uppercase tracking-widest">Live Script</span>
          </div>
          <p className="text-[0.9rem] text-neutral-600 mb-5 leading-relaxed font-sans mt-2">
            点击运行按钮，观察程序如何逐行执行，找出35头、94脚的答案。
          </p>
          <div className="code-block h-[260px] mb-6">
            <span className={codeLinesClass('el-1')}><span className="var">a</span> = <span className="num">35</span></span>
            <span className={codeLinesClass('el-2')}><span className="var">b</span> = <span className="num">0</span></span>
            <span className={codeLinesClass('el-3')}><span className="kw">while</span> <span className="fn">True</span>:</span>
            <span className={codeLinesClass('el-4')}>    <span className="var">c</span> = <span className="var">a</span>*<span className="num">2</span>+<span className="var">b</span>*<span className="num">4</span></span>
            <span className={codeLinesClass('el-5')}>    <span className="kw">if</span> <span className="var">c</span> == <span className="num">94</span>:</span>
            <span className={codeLinesClass('el-6')}>        <span className="fn">print</span>(<span className="str">'鸡的数量:'</span>, <span className="var">a</span>)</span>
            <span className={codeLinesClass('el-7')}>        <span className="fn">print</span>(<span className="str">'兔的数量:'</span>, <span className="var">b</span>)</span>
            <span className={codeLinesClass('el-8')}>        <span className="kw">break</span></span>
            <span className={codeLinesClass('el-9')}>    <span className="kw">else</span>:</span>
            <span className={codeLinesClass('el-10')}>        <span className="var">a</span> = <span className="var">a</span>-<span className="num">1</span></span>
            <span className={codeLinesClass('el-11')}>        <span className="var">b</span> = <span className="var">b</span>+<span className="num">1</span></span>
          </div>
          <button 
            className="inline-flex items-center justify-center w-full gap-2.5 bg-neutral-900 text-white border-[1px] border-neutral-900 p-[14px_24px] font-mono text-[1rem] transition-all hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-neutral-900 cursor-pointer uppercase tracking-widest text-[11px]"
            onClick={runProgram}
            disabled={running}
          >
            <span className="text-[1.1rem]">▶</span>
            <span>运行程序</span>
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white border border-neutral-200 p-8 shadow-sm">
            <div className="flex justify-between items-baseline mb-4 border-b border-neutral-300 pb-2">
              <h2 className="mb-2 text-2xl font-serif font-bold italic">📺 程序输出</h2>
              <span className="text-[10px] font-mono text-[#1D4ED8] uppercase tracking-widest">Stdout</span>
            </div>
            <div className="bg-[#171717] rounded-none p-6 font-mono text-[0.95rem] min-h-[140px] border border-neutral-900 border-l-4 border-l-[#1D4ED8] shadow-inner">
              {!running && !programDone && <span className="text-neutral-500 uppercase tracking-widest text-[10px]">等待执行...<span className="animate-pulse">▋</span></span>}
              <div className="text-[#4ADE80] leading-loose">{out1}</div>
              <div className="text-[#4ADE80] leading-loose">{out2}</div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 p-8 shadow-sm">
             <div className="flex justify-between items-baseline mb-4 border-b border-neutral-300 pb-2">
              <h3 className="mb-2.5 font-serif font-bold text-xl italic">🔄 执行进度</h3>
            </div>
            
            <div className="bg-[#F9F8F6] border border-neutral-200 p-5 mt-2">
              <div className="flex justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2 font-mono">
                <span>迭代次数</span><span>[{iter}]</span>
              </div>
              <div className="h-[4px] bg-neutral-200 overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${(iter / MAX) * 100}%`,
                    backgroundColor: programDone ? '#15803D' : '#F97316' 
                  }}
                />
              </div>
              <div className="mt-4 text-[11px] font-mono uppercase tracking-widest">
                {!running && !programDone ? (
                  <span className="text-neutral-400">线程空闲</span>
                ) : programDone ? (
                  <span className="text-[#15803D] font-bold">✅ 完成: {iter} 次迭代</span>
                ) : (
                  <span className="text-[#1D4ED8] font-bold">I={iter} | a={a} | b={b} | c={c}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 mt-6 bg-neutral-200 border border-neutral-300 p-1">
              <div className="bg-white px-2 py-4 text-center">
                <div className="text-[10px] text-neutral-400 font-bold font-mono tracking-widest mb-1.5 hidden md:block">变量[a]</div>
                <div className="text-[2rem] font-bold font-serif transition-colors text-[#F97316] italic leading-none">{a}</div>
              </div>
              <div className="bg-white px-2 py-4 text-center">
                <div className="text-[10px] text-neutral-400 font-bold font-mono tracking-widest mb-1.5 hidden md:block">变量[b]</div>
                <div className="text-[2rem] font-bold font-serif transition-colors text-[#15803D] italic leading-none">{b}</div>
              </div>
              <div className="bg-white px-2 py-4 text-center">
                <div className="text-[10px] text-[#1D4ED8] font-bold font-mono tracking-widest mb-1.5 hidden md:block">求值[c]</div>
                <div className="text-[2rem] font-bold font-serif transition-colors text-neutral-900 italic leading-none">{c === null ? '—' : c}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {programDone && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 border-t border-neutral-400 pt-16"
          >
            <div className="bg-white border-2 border-neutral-900 p-8 shadow-[8px_8px_0_0_#171717] md:p-12 relative">
              <div className="absolute top-0 right-0 bg-neutral-900 text-white px-3 py-1 font-mono text-[10px] font-bold tracking-widest border-b-2 border-l-2 border-neutral-900 shadow-[-4px_4px_0_0_#F97316]">
                最终挑战
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[3rem]">🏆</span>
                <div>
                  <h2 className="mb-1 text-2xl font-bold font-serif italic">挑战题</h2>
                  <span className="inline-block bg-[#FDBA74] text-neutral-900 uppercase font-mono tracking-widest font-bold text-[10px] px-2 py-1">韩信点兵</span>
                </div>
              </div>
              <div className="text-xl text-neutral-900 font-serif mb-8 leading-[1.8] border-l-[3px] border-[#F97316] pl-4 italic">
                现有鸡兔同笼，上有 <strong className="not-italic text-2xl">10</strong> 个头，下有 <strong className="not-italic text-2xl">28</strong> 只脚。<br />
                如果用枚举法求解，应该怎么初始化变量？
              </div>

              <h4 className="mb-4 text-neutral-500 font-bold uppercase tracking-widest text-[10px] border-b border-neutral-200 pb-2">选择：第1步应该怎么初始化？</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className={getChoiceClasses(1)} onClick={() => checkAnswer(1)}>
                  a = 0, b = 10<br/><small className="text-neutral-500 font-mono tracking-widest uppercase mt-2 block">假设全是兔</small>
                </button>
                <button className={getChoiceClasses(2)} onClick={() => checkAnswer(2)}>
                  a = 10, b = 0<br/><small className="text-neutral-500 font-mono tracking-widest uppercase mt-2 block">假设全是鸡</small>
                </button>
                <button className={getChoiceClasses(3)} onClick={() => checkAnswer(3)}>
                  a = 5, b = 5<br/><small className="text-neutral-500 font-mono tracking-widest uppercase mt-2 block">从中间开始</small>
                </button>
                <button className={getChoiceClasses(4)} onClick={() => checkAnswer(4)}>
                  a = 28, b = 0<br/><small className="text-neutral-500 font-mono tracking-widest uppercase mt-2 block">用脚数初始化</small>
                </button>
              </div>

              {selectedChoice !== null && (selectedChoice === 1 || selectedChoice === 2) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8"
                >
                  <div className="bg-[#DCFCE7] border border-[#4ADE80] border-l-4 border-l-[#15803D] p-6 mb-6">
                    <h4 className="mb-3 font-bold text-[#15803D] uppercase tracking-widest text-[11px]">✅ CORRECT! 正确！两种方式都可以</h4>
                    <p className="text-[0.95rem] text-neutral-800 m-0 leading-relaxed font-sans">
                      方式1（a=10, b=0，假设全是鸡）或方式2（a=0, b=10，假设全是兔）都对！枚举可以从任意端点开始。<br />
                      本题答案：鸡=<strong className="text-xl">6只</strong>，兔=<strong className="text-xl">4只</strong> （6×2+4×4=12+16=28✓）
                    </p>
                  </div>
                  <div className="text-center mt-8">
                    <button className="btn btn-primary btn-lg w-full max-w-sm" onClick={handleCompleteAll}>
                      <span>🎉 完成所有关卡</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSummary && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 bg-neutral-900/95 flex flex-col items-center justify-center p-6 overflow-y-auto backdrop-blur-sm"
          >
            <div className="bg-white rounded-none p-10 max-w-4xl w-full border border-neutral-700 shadow-2xl relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#F97316] via-[#15803D] to-[#1D4ED8]" />
              
              <div className="text-center mb-10">
                <div className="text-[10px] text-neutral-400 font-mono tracking-[0.3em] uppercase mb-4">全部完成</div>
                <h2 className="text-5xl font-serif text-neutral-900 mb-4 font-bold italic tracking-tighter">本课知识地图 <br className="md:hidden" /></h2>
                <p className="text-neutral-500 text-[13px] font-sans">
                  你已经掌握了从数学到算法的完整链路！
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-4 flex-wrap mb-16">
                <div className="bg-[#F9F8F6] border border-neutral-300 p-6 text-center min-w-[130px] flex-1">
                  <div className="text-[2rem] mb-3 grayscale opacity-80">📜</div>
                  <div className="text-[12px] font-bold text-neutral-900 uppercase tracking-widest mb-1">问题提出</div>
                  <div className="text-[10px] text-neutral-500 font-mono">鸡兔同笼</div>
                </div>
                <div className="text-[1.5rem] opacity-30 text-neutral-900 hidden md:block">→</div>
                
                <div className="bg-[#F9F8F6] border border-neutral-300 p-6 text-center min-w-[130px] flex-1">
                  <div className="text-[2rem] mb-3 grayscale opacity-80">🧮</div>
                  <div className="text-[12px] font-bold text-neutral-900 uppercase tracking-widest mb-1">数学方法</div>
                  <div className="text-[10px] text-neutral-500 font-mono">假设法公式</div>
                </div>
                <div className="text-[1.5rem] opacity-30 text-neutral-900 hidden md:block">→</div>
                
                <div className="bg-[#F9F8F6] border border-neutral-300 p-6 text-center min-w-[130px] flex-1">
                  <div className="text-[2rem] mb-3 grayscale opacity-80">📊</div>
                  <div className="text-[12px] font-bold text-neutral-900 uppercase tracking-widest mb-1">枚举思想</div>
                  <div className="text-[10px] text-neutral-500 font-mono">逐一遍历</div>
                </div>
                <div className="text-[1.5rem] opacity-30 text-neutral-900 hidden md:block">→</div>
                
                <div className="bg-[#F9F8F6] border border-neutral-300 p-6 text-center min-w-[130px] flex-1 border-b-4 border-b-[#1D4ED8]">
                  <div className="text-[2rem] mb-3 opacity-90">🔀</div>
                  <div className="text-[12px] font-bold text-[#1D4ED8] uppercase tracking-widest mb-1">算法设计</div>
                  <div className="text-[10px] text-[#1D4ED8]/70 font-mono">流程图</div>
                </div>
                <div className="text-[1.5rem] opacity-30 text-neutral-900 hidden md:block">→</div>
                
                <div className="bg-neutral-900 border border-neutral-900 p-6 text-center min-w-[130px] flex-1">
                  <div className="text-[2rem] mb-3 opacity-90">💻</div>
                  <div className="text-[12px] font-bold text-white uppercase tracking-widest mb-1">程序实现</div>
                  <div className="text-[10px] text-[#4ADE80] font-mono">Python代码</div>
                </div>
              </div>

              <div className="text-center mt-12 border-t border-neutral-200 pt-12">
                <div className="flex gap-4 justify-center mb-8">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span 
                      key={s} 
                      className={`text-[3.5rem] transition-all duration-400 ${s <= litStars ? 'grayscale-0 opacity-100 scale-110 drop-shadow-md' : 'grayscale opacity-20'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <h2 className="mb-4 text-4xl font-bold font-serif italic text-neutral-900 tracking-tighter">探究之旅完成！</h2>
                <p className="text-neutral-500 text-sm uppercase tracking-widest mb-10 font-bold">你已掌握鸡兔同笼的算法思维与编程方法</p>
                
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link to="/" className="btn btn-primary btn-lg">退回主页</Link>
                  <button 
                    className="btn btn-outline btn-lg" 
                    onClick={() => {
                      resetProgress();
                      window.location.href = '/';
                    }}
                  >
                    重新探究
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
