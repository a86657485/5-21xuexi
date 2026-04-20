import { useState, useEffect, useRef } from "react";
import { useProgress } from "../lib/progress";
import { useAudio } from "../lib/audio";
import { motion } from "motion/react";
import { useAITutor } from "../lib/AITutorContext";
import FlowchartPuzzle from "../components/FlowchartPuzzle";

const NODE_INFO: Record<string, { title: string; desc: string }> = {
  'start': { title: '开始节点', desc: '程序从这里启动，准备好开始求解鸡兔同笼问题。' },
  'init-a': { title: '初始化：a = 35', desc: '将鸡的数量 a 设为35（全部假设是鸡），这是枚举的起点。' },
  'init-b': { title: '初始化：b = 0', desc: '将兔的数量 b 设为0，与 a=35 对应，共35只。' },
  'calc': { title: '计算脚的数量', desc: '根据当前鸡(a)和兔(b)的数量，计算总脚数 c = a×2 + b×4。' },
  'cond': { title: '判断条件：c ≠ 94？', desc: '如果脚数不等于94，说明答案还没找到，继续循环调整。如果等于94，答案找到了！' },
  'dec-a': { title: '鸡的数量减1', desc: '当前组合脚数不对，尝试减少一只鸡（a = a - 1）。' },
  'inc-b': { title: '兔的数量加1', desc: '同时增加一只兔（b = b + 1），保持总头数35不变，回到计算步骤。' },
  'output': { title: '输出结果', desc: '找到答案！将鸡(a=23)和兔(b=12)的正确数量输出。' },
  'end': { title: '结束节点', desc: '程序执行完毕，找到了答案：鸡23只，兔12只！' },
};

export default function Level4() {
  const { completeLevel, showCelebration } = useProgress();
  const { playSound } = useAudio();
  const { showTutorial } = useAITutor();

  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);

  useEffect(() => {
    showTutorial(4, "这一关我们把之前的想法画成流程图！先把右侧散落的流程模块拼装成正确的执行顺序。拼对之后，你就可以运行并清晰地看到每一步计算机是怎么做的了。");
  }, []);

  const [a, setA] = useState(35);
  const [b, setB] = useState(0);
  const [c, setC] = useState<number | null>(null);
  
  const [execStep, setExecStep] = useState(0);
  const [isAuto, setIsAuto] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [doneNodes, setDoneNodes] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ id: number; msg: string; phase?: boolean }[]>([{ id: 0, msg: "WAITING FOR EXECUTION //", phase: true }]);
  const [infoNode, setInfoNode] = useState<string | null>(null);
  
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, []);

  const getNextStep = () => {
    if (execStep === 0) return { node: 'start', cl: null, log: 'Program Boot' };
    if (execStep === 1) return { node: 'init-a', cl: 'cl-1', log: 'Init: a = 35' };
    if (execStep === 2) return { node: 'init-b', cl: 'cl-2', log: 'Init: b = 0' };
    if (execStep >= 3) {
      const phase = (execStep - 3) % 3;
      if (phase === 0) return { node: 'calc', cl: 'cl-4', log: `Loop #${loopCount+1} | c: ${a}*2 + ${b}*4 = ${a*2+b*4}`, action: 'calc' };
      if (phase === 1) return { node: 'cond', cl: 'cl-5', log: `Eval: ${a*2+b*4} ${a*2+b*4===94?'=':'≠'} 94`, action: 'cond' };
      if (phase === 2) {
        if (c === 94) return { node: 'output', cl: 'cl-6', log: `[SUCCESS] Output generated.`, action: 'output' };
        return { node: 'dec-a', cl: 'cl-10', log: `Adjust -> a=${a-1}, b=${b+1}`, action: 'adjust' };
      }
    }
  };

  const stepForward = () => {
    if (finished) return;
    const step = getNextStep();
    if (!step) return;

    setActiveNode(step.node);
    setActiveLine(step.cl);
    
    // add log
    setLogs(prev => [...prev, { id: prev.length, msg: step.log, phase: false }]);

    if (step.action === 'calc') {
      const nextC = a * 2 + b * 4;
      setC(nextC);
      setLoopCount(l => l + 1);
    } else if (step.action === 'adjust') {
      setA(prev => prev - 1);
      setB(prev => prev + 1);
      setDoneNodes(prev => [...prev, step.node]);
      
      // trigger inc-b visual immediately
      setTimeout(() => {
        setActiveNode('inc-b');
        setActiveLine('cl-11');
      }, 200);
    } else if (step.action === 'output') {
      setFinished(true);
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        setIsAuto(false);
      }
      setTimeout(() => {
        setActiveNode('end');
        typeOutput();
      }, 600);
    }

    setExecStep(s => s + 1);
    playSound('step');
  };

  const autoExecute = () => {
    if (isAuto || finished) return;
    setIsAuto(true);
    autoTimerRef.current = setInterval(() => {
      // we need to use a slightly different approach for state updates in interval,
      // but to keep it simple we can just trigger a click or use functional state updates.
      // Better way in React is to put stepForward logic in effect depending on isAuto.
    }, 180);
  };

  // Hacky effect for auto execute to see latest state
  useEffect(() => {
    if (isAuto && !finished) {
      const timer = setTimeout(() => {
        stepForward();
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [isAuto, finished, execStep]);

  const [out1, setOut1] = useState("");
  const [out2, setOut2] = useState("");

  const typeOutput = async () => {
    const msg1 = ">>> 鸡的数量: 23";
    const msg2 = ">>> 兔的数量: 12";
    
    for (let i = 0; i <= msg1.length; i++) {
        setOut1(msg1.slice(0, i));
        await new Promise(r => setTimeout(r, 60));
    }
    for (let j = 0; j <= msg2.length; j++) {
        setOut2(msg2.slice(0, j));
        await new Promise(r => setTimeout(r, 60));
    }
    playSound('win');
  };

  const resetExec = () => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    setIsAuto(false);
    setFinished(false);
    setA(35);
    setB(0);
    setC(null);
    setExecStep(0);
    setLoopCount(0);
    setActiveNode(null);
    setDoneNodes([]);
    setActiveLine(null);
    setLogs([{ id: 0, msg: "WAITING FOR EXECUTION //", phase: true }]);
    setOut1("");
    setOut2("");
  };

  const handleNodeClick = (nodeId: string) => {
    setInfoNode(nodeId);
    playSound('click');
  };

  const handleComplete = () => {
    completeLevel(4);
    showCelebration({
      icon: '🔀',
      title: '算法理解完成！',
      msg: '你已经能读懂算法流程图了！\n最后一关：看看程序是怎么跑起来的！',
      nextPage: '/level5',
      nextLabel: '进入关卡5：程序验证 →'
    });
  };

  const getNodeClass = (id: string) => {
    return `fc-node ${activeNode === id ? 'active' : ''} ${doneNodes.includes(id) ? 'done' : ''}`;
  };

  return (
    <div className="container max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-16 flex flex-col items-center" style={{ animation: 'fadeIn 0.6s ease forwards' }}>
        <div className="inline-flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold mb-5 font-mono">
          [04] ALGORITHM FLOWCHART
        </div>
        <h1 className="text-5xl font-serif font-bold text-neutral-900 mb-3 italic tracking-tighter">算法流程图</h1>
        <div className="w-12 h-[1px] bg-neutral-400 mx-auto my-5"></div>
        <p className="text-sm text-neutral-500 uppercase tracking-widest">单步执行流程图，看清算法的每一步思路</p>
      </div>

      {!isPuzzleSolved ? (
        <FlowchartPuzzle onComplete={() => setIsPuzzleSolved(true)} />
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#DCFCE7] border border-[#4ADE80] text-[#15803D] p-4 text-center mb-8 font-bold text-sm tracking-widest uppercase shadow-sm"
          >
            ✓ 流程图拼装完成！接下面来进行计算机模拟执行：
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 bg-neutral-100 p-4 border border-neutral-200 text-center shadow-sm"
          >
            <div className="flex flex-wrap justify-center items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1D4ED8] mr-4 hidden md:inline">Operations Menu</span>
              <button className="btn btn-outline" onClick={stepForward} disabled={finished || isAuto}>
                ▶ 单步执行 Step
              </button>
              <button className="btn btn-primary" onClick={() => setIsAuto(true)} disabled={finished || isAuto}>
                ⚡ 自动运行 Auto
              </button>
              <button className="btn btn-outline border-dashed text-neutral-500" onClick={resetExec}>
                ↺ 重置 Reset
              </button>
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 ml-4 border-l border-neutral-300 pl-4 py-1">Steps: <strong>{execStep}</strong></span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-4 uppercase tracking-widest">
              点击流程图中的节点，了解每个步骤的含义
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-1 mb-8 bg-neutral-200 border border-neutral-300 p-1"
          >
            <div className="bg-white p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold font-mono mb-2">Vars: [a]</div>
              <div className="text-3xl font-bold font-serif transition-colors text-[#F97316] italic">{a}</div>
            </div>
            <div className="bg-white p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold font-mono mb-2">Vars: [b]</div>
              <div className="text-3xl font-bold font-serif transition-colors text-[#15803D] italic">{b}</div>
            </div>
            <div className="bg-white p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-[#1D4ED8] font-bold font-mono mb-2">Target Eval: [c]</div>
              <div className="text-3xl font-bold font-serif transition-colors text-neutral-900 italic">{c === null ? '—' : c}</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-10"
          >
            {/* Flowchart */}
            <div className="bg-white border border-neutral-200 p-6 shadow-sm">
              <div className="flex justify-between items-baseline mb-6 border-b border-neutral-300 pb-2">
                <h3 className="font-serif italic font-bold text-neutral-900">🔀 算法流程图 FLOWCHART</h3>
              </div>
              <div className="bg-[#F9F8F6] border border-neutral-200 p-6 overflow-auto shadow-inner h-[500px] flex justify-center items-start pt-6">
                <svg className="block" viewBox="0 0 300 600" width="100%" height="560">
                  <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="7" refX="6" refY="3.5" orient="auto">
                      <polygon points="0 0, 8 3.5, 0 7" fill="#525252"/>
                    </marker>
                  </defs>

                  <g className={getNodeClass('start')} onClick={() => handleNodeClick('start')}>
                    <ellipse cx="150" cy="36" rx="50" ry="22" fill="#FFFFFF" stroke="#525252" strokeWidth="1.5"/>
                    <text x="150" y="41" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="#171717" fontWeight="600" letterSpacing="0.1em">START</text>
                  </g>
                  <line x1="150" y1="58" x2="150" y2="82" stroke="#525252" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>

                  <g className={getNodeClass('init-a')} onClick={() => handleNodeClick('init-a')}>
                    <rect x="80" y="84" width="140" height="38" rx="0" fill="#FFFFFF" stroke="#525252" strokeWidth="1.5"/>
                    <text x="150" y="108" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#171717">a = 35</text>
                  </g>
                  <line x1="150" y1="122" x2="150" y2="144" stroke="#525252" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>

                  <g className={getNodeClass('init-b')} onClick={() => handleNodeClick('init-b')}>
                    <rect x="80" y="146" width="140" height="38" rx="0" fill="#FFFFFF" stroke="#525252" strokeWidth="1.5"/>
                    <text x="150" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#171717">b = 0</text>
                  </g>
                  <line x1="150" y1="184" x2="150" y2="206" stroke="#525252" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>

                  <g className={getNodeClass('calc')} onClick={() => handleNodeClick('calc')}>
                    <rect x="60" y="208" width="180" height="38" rx="0" fill="#FFFFFF" stroke="#525252" strokeWidth="1.5"/>
                    <text x="150" y="232" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#171717">c = a*2 + b*4</text>
                  </g>
                  <line x1="150" y1="246" x2="150" y2="272" stroke="#525252" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>

                  <g className={getNodeClass('cond')} onClick={() => handleNodeClick('cond')}>
                    <polygon points="150,274 230,310 150,346 70,310" fill="#FFFFFF" stroke="#525252" strokeWidth="1.5"/>
                    <text x="150" y="305" textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="#171717" fontWeight="bold">c ≠ 94 ?</text>
                  </g>

                  <text x="90" y="370" textAnchor="middle" fontSize="10" fill="#171717" fontWeight="600" fontFamily="monospace">YES</text>
                  <path d="M 100 315 L 55 315 L 55 410" stroke="#525252" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead)"/>

                  <text x="248" y="305" textAnchor="middle" fontSize="10" fill="#171717" fontWeight="600" fontFamily="monospace">NO</text>
                  <path d="M 230 310 L 260 310 L 260 480 L 200 480" stroke="#525252" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead)"/>

                  <g className={getNodeClass('dec-a')} onClick={() => handleNodeClick('dec-a')}>
                    <rect x="5" y="412" width="130" height="34" rx="0" fill="#FFFFFF" stroke="#525252" strokeWidth="1.5"/>
                    <text x="70" y="434" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#171717">a = a - 1</text>
                  </g>
                  <line x1="70" y1="446" x2="70" y2="468" stroke="#525252" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>

                  <g className={getNodeClass('inc-b')} onClick={() => handleNodeClick('inc-b')}>
                    <rect x="5" y="470" width="130" height="34" rx="0" fill="#FFFFFF" stroke="#525252" strokeWidth="1.5"/>
                    <text x="70" y="492" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#171717">b = b + 1</text>
                  </g>
                  <path d="M 70 504 L 70 536 L 150 536 L 150 246" stroke="#525252" strokeWidth="1.5" fill="none" strokeDasharray="4 3" markerEnd="url(#arrowhead)"/>
                  <text x="105" y="548" textAnchor="middle" fontSize="9" fill="#A3A3A3" fontFamily="monospace">LOOP</text>

                  <g className={getNodeClass('output')} onClick={() => handleNodeClick('output')}>
                    <rect x="108" y="462" width="150" height="38" rx="0" fill="#FFFFFF" stroke="#525252" strokeWidth="1.5"/>
                    <text x="183" y="486" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="#171717" letterSpacing="0.05em">OUTPUT</text>
                  </g>
                  <line x1="183" y1="500" x2="183" y2="526" stroke="#525252" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>

                  <g className={getNodeClass('end')} onClick={() => handleNodeClick('end')}>
                    <ellipse cx="183" cy="546" rx="50" ry="22" fill="#FFFFFF" stroke="#525252" strokeWidth="1.5"/>
                    <text x="183" y="551" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="#171717" fontWeight="600" letterSpacing="0.1em">END</text>
                  </g>
                </svg>
              </div>

              <div className="bg-[#171717] text-white rounded-none p-[16px_20px] text-[0.8rem] min-h-[90px] mt-4 shadow-sm border border-neutral-900 border-l-4 border-l-[#F97316]">
                <div className="font-bold text-[#F97316] mb-2 uppercase tracking-widest font-mono text-[10px]">
                  {infoNode ? NODE_INFO[infoNode].title : 'AWAITING NODE SELECTION //'}
                </div>
                <div className="text-neutral-400 font-sans leading-relaxed">
                  {infoNode ? NODE_INFO[infoNode].desc : '点击流程图中任意节点，这里会显示该步骤的详细说明'}
                </div>
              </div>
            </div>

            {/* Code & Logs */}
            <div className="flex flex-col gap-6">
              <div className="bg-white border border-neutral-200 p-6 shadow-sm">
                <div className="flex justify-between items-baseline mb-4 border-b border-neutral-300 pb-2">
                   <h3 className="font-serif italic font-bold">💻 代码逻辑 Python Logic</h3>
                   <span className="text-[10px] uppercase font-mono tracking-widest text-[#15803D]">Source</span>
                </div>
                <div className="code-block h-[220px]">
                  <span className={`code-exec-line ${activeLine === 'cl-1' ? 'exec' : ''}`}><span className="var">a</span> = <span className="num">35</span>              <span className="cm"># 鸡的初始值</span></span>
                  <span className={`code-exec-line ${activeLine === 'cl-2' ? 'exec' : ''}`}><span className="var">b</span> = <span className="num">0</span>               <span className="cm"># 兔的初始值</span></span>
                  <span className={`code-exec-line ${activeLine === 'cl-3' ? 'exec' : ''}`}><span className="kw">while</span> <span className="fn">True</span>:</span>
                  <span className={`code-exec-line ${activeLine === 'cl-4' ? 'exec' : ''}`}>    <span className="var">c</span> = <span className="var">a</span>*<span className="num">2</span>+<span className="var">b</span>*<span className="num">4</span>    <span className="cm"># 计算脚数</span></span>
                  <span className={`code-exec-line ${activeLine === 'cl-5' ? 'exec' : ''}`}>    <span className="kw">if</span> <span className="var">c</span> == <span className="num">94</span>:</span>
                  <span className={`code-exec-line ${activeLine === 'cl-6' ? 'exec' : ''}`}>        <span className="fn">print</span>(<span className="str">'鸡:'</span>, <span className="var">a</span>)</span>
                  <span className={`code-exec-line ${activeLine === 'cl-7' ? 'exec' : ''}`}>        <span className="fn">print</span>(<span className="str">'兔:'</span>, <span className="var">b</span>)</span>
                  <span className={`code-exec-line ${activeLine === 'cl-8' ? 'exec' : ''}`}>        <span className="kw">break</span>         <span className="cm"># 退出循环</span></span>
                  <span className={`code-exec-line ${activeLine === 'cl-9' ? 'exec' : ''}`}>    <span className="kw">else</span>:</span>
                  <span className={`code-exec-line ${activeLine === 'cl-10' ? 'exec' : ''}`}>        <span className="var">a</span> = <span className="var">a</span>-<span className="num">1</span>      <span className="cm"># 鸡减1</span></span>
                  <span className={`code-exec-line ${activeLine === 'cl-11' ? 'exec' : ''}`}>        <span className="var">b</span> = <span className="var">b</span>+<span className="num">1</span>      <span className="cm"># 兔加1</span></span>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 p-6 shadow-sm">
                <div className="flex justify-between items-baseline mb-4 border-b border-neutral-300 pb-2">
                   <h3 className="font-serif italic font-bold">📋 执行日志 Action Logs</h3>
                   <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Terminal</span>
                </div>
                <div className="bg-[#F9F8F6] border border-neutral-200 p-4 h-[160px] overflow-y-auto font-mono text-[10px] tracking-widest scroll-smooth">
                  {logs.map((log) => (
                    <div key={log.id} className="py-1.5 flex items-start gap-3 animate-fadeIn" style={log.phase ? {color: '#A3A3A3'} : {color: '#525252'}}>
                      {!log.phase && (
                        <div className="w-4 h-4 bg-neutral-300 text-neutral-700 flex items-center justify-center font-bold shrink-0 mt-[1px]">
                          {log.id}
                        </div>
                      )}
                      <span className="uppercase">{log.msg}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>

              {finished && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <div className="bg-[#171717] p-5 font-mono text-[11px] min-h-[80px] shadow-sm uppercase tracking-widest border border-neutral-900 border-l-4 border-l-[#15803D]">
                    <div className="text-[#4ADE80] leading-loose">{out1}</div>
                    <div className="text-[#4ADE80] leading-loose">{out2}</div>
                  </div>
                  <div className="mt-8 text-center flex justify-center">
                    <button className="btn btn-primary btn-lg w-full" onClick={handleComplete}>
                      <span>✓ 算法理解了！进入最终程序验证</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
