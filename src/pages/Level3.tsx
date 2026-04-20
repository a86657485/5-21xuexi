import { useState, useRef, useEffect } from "react";
import { useProgress } from "../lib/progress";
import { useAudio } from "../lib/audio";
import { motion, AnimatePresence } from "motion/react";
import { Line } from "react-chartjs-2";
import { useAITutor } from "../lib/AITutorContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MAX_CHICKENS = 35;

export default function Level3() {
  const { completeLevel, showCelebration } = useProgress();
  const { playSound } = useAudio();
  const { showTutorial } = useAITutor();

  const [currentRow, setCurrentRow] = useState(0);

  useEffect(() => {
    showTutorial(3, "现在我们来进行'表格枚举法'。\n如果一时想不到公式，我们可以从0只兔子开始，把每一种可能列成表格。\n点击「添加下一组」观察表格和折线图，看看脚的数量是如何随着兔子的增加而升高的？");
  }, []);
  const [isRunning, setIsRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const [rows, setRows] = useState<{ c: number; r: number; f: number; isCorrect: boolean }[]>([]);
  const tableWrapRef = useRef<HTMLDivElement>(null);

  const addOneRow = () => {
    if (solved || currentRow > MAX_CHICKENS) return;
    
    const chickens = MAX_CHICKENS - currentRow;
    const rabbits = currentRow;
    const feet = chickens * 2 + rabbits * 4;
    const isCorrect = feet === 94;

    setRows(prev => [...prev, { c: chickens, r: rabbits, f: feet, isCorrect }]);
    setCurrentRow(prev => prev + 1);

    if (isCorrect) {
      setSolved(true);
      playSound('correct');
    } else {
      playSound('step');
    }
  };

  useEffect(() => {
    if (tableWrapRef.current) {
      tableWrapRef.current.scrollTop = tableWrapRef.current.scrollHeight;
    }
  }, [rows]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setRows(prev => {
          const current = prev.length;
          if (current > MAX_CHICKENS || prev.some(r => r.isCorrect)) {
            setIsRunning(false);
            return prev;
          }
          const ch = MAX_CHICKENS - current;
          const ra = current;
          const fe = ch * 2 + ra * 4;
          const isCorrect = fe === 94;
          if (isCorrect) {
            setSolved(true);
            playSound('correct');
          }
          return [...prev, { c: ch, r: ra, f: fe, isCorrect }];
        });
        setCurrentRow(prev => prev + 1);
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isRunning, playSound]);

  const autoRun = () => {
    if (isRunning || solved) return;
    setIsRunning(true);
  };

  const resetTable = () => {
    setCurrentRow(0);
    setSolved(false);
    setIsRunning(false);
    setRows([]);
  };

  const currentFeet = rows.length > 0 ? rows[rows.length - 1].f : 0;
  const statusStr = solved ? "🎉 找到了" : currentFeet === 0 ? "待命" : currentFeet < 94 ? "MISS: < 94" : "MISS: > 94";

  const chartData = {
    labels: rows.map(r => r.r),
    datasets: [{
      label: '脚的数量',
      data: rows.map(r => r.f),
      borderColor: '#171717',
      backgroundColor: 'rgba(212,212,212,0.1)',
      tension: 0,
      pointRadius: 2,
      pointBackgroundColor: rows.map(r => r.isCorrect ? '#15803D' : '#171717'),
      fill: true,
    }, {
      label: '目标：94脚',
      data: Array(rows.length > 0 ? rows.length : 1).fill(94), // keep the line rendered even at start? Chart.js handles different length arrays poorly, let's just use the same length
      borderColor: '#F97316',
      borderDash: [4, 4],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 } as any,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: any) => `鸡=${MAX_CHICKENS - parseInt(items[0].label)}，兔=${items[0].label}`,
          label: (item: any) => `脚数：${item.raw}`
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: '兔的数量', font: { size: 10, family: 'Inter' } },
        ticks: { font: { size: 9, family: 'sans-serif' } },
        grid: { color: '#E5E5E5' }
      },
      y: {
        min: 60, max: 145,
        title: { display: true, text: '脚数', font: { size: 10, family: 'Inter' } },
        ticks: { font: { size: 9, family: 'sans-serif' } },
        grid: { color: '#E5E5E5' }
      }
    }
  };

  const handleComplete = () => {
    completeLevel(3);
    showCelebration({
      icon: '📊',
      title: '枚举法掌握！',
      msg: '你发现了枚举法的规律。\n接下来学习如何用算法流程图来描述这个过程！',
      nextPage: '/level4',
      nextLabel: '进入关卡4：算法流程图 →'
    });
  };

  return (
    <div className="container max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-16 flex flex-col items-center" style={{ animation: 'fadeIn 0.6s ease forwards' }}>
        <div className="inline-flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold mb-5 font-mono">
          [03] TABULAR ENUMERATION
        </div>
        <h1 className="text-5xl font-serif font-bold text-neutral-900 mb-3 italic tracking-tighter">表格枚举法</h1>
        <div className="w-12 h-[1px] bg-neutral-400 mx-auto my-5"></div>
        <p className="text-sm text-neutral-500 uppercase tracking-widest">逐一列出所有可能，在表格中发现规律</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-9 border-t border-neutral-300 pt-12"
      >
        <div className="bg-[#F3F1EC] border border-neutral-300 p-8 shadow-sm">
          <h4 className="text-neutral-900 font-bold mb-4 uppercase tracking-[0.2em] text-[10px]">💡 枚举思路 Logic</h4>
          <p className="text-[13px] text-neutral-600 m-0 leading-[1.8]">
            如果不知道公式，怎么办？<br />
            <strong>把所有可能都列出来！</strong><br />
            从鸡=35、兔=0开始，每次鸡减1、兔加1，一直到找到脚数=94的那一组。
          </p>
        </div>
        
        <div className="flex gap-4 justify-center flex-wrap m-0">
          <div className="bg-white border border-neutral-200 p-[16px_24px] text-center min-w-[100px] shadow-sm">
            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Target Goal</div>
            <div className="text-[2.2rem] font-bold font-serif italic text-neutral-900 mt-2">94</div>
          </div>
          <div className="bg-white border border-neutral-200 p-[16px_24px] text-center min-w-[100px] shadow-sm">
            <div className="text-[10px] text-[#1D4ED8] font-bold uppercase tracking-widest">Curr Row</div>
            <div className="text-[2.2rem] font-bold font-serif italic text-[#1D4ED8] mt-2">{currentRow}</div>
          </div>
          <div className="bg-white border border-neutral-200 p-[16px_24px] text-center min-w-[100px] shadow-sm">
            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Status / Flag</div>
            <div className={`text-sm font-bold font-mono tracking-wider transition-colors mt-5 ${solved ? 'text-[#15803D]' : 'text-neutral-500'}`}>{statusStr}</div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mb-8 bg-neutral-100 p-4 border border-neutral-200 text-center shadow-sm"
      >
        <div className="flex gap-[10px] flex-wrap justify-center items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1D4ED8] mr-4 hidden md:inline">Operations Menu</span>
          <button className="btn btn-outline" onClick={addOneRow} disabled={solved || isRunning}>
            + 添加下一组 Step
          </button>
          <button className="btn btn-primary" onClick={autoRun} disabled={solved || isRunning}>
            ⚡ 快速推进 Auto Run
          </button>
          <button className="btn btn-outline border-dashed text-neutral-500" onClick={resetTable}>
            ↻ 重置 Reset
          </button>
        </div>
        <p className="text-[10px] text-neutral-400 mt-4 uppercase tracking-widest">
          手动点击"添加下一组"逐行观察，或点"快速推进"看完整过程
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12"
      >
        {/* Table */}
        <div className="bg-white border border-neutral-200 p-8 shadow-sm">
          <div className="flex justify-between items-baseline mb-6 border-b border-neutral-300 pb-2">
             <h3 className="font-serif italic font-bold">📋 枚举表格 Table Output</h3>
             <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Live_Data</span>
          </div>
          
          <div 
            ref={tableWrapRef}
            className="overflow-auto border border-neutral-200 max-h-[380px] bg-[#F9F8F6] scroll-smooth"
          >
            <table className="data-table">
              <thead className="sticky top-0 z-10 font-bold bg-[#F3F1EC]">
                <tr>
                  <th style={{ width: 32 }}>#</th>
                  <th>🐔 鸡</th>
                  <th>🐰 兔</th>
                  <th>🦶 脚数</th>
                  <th style={{ width: 48 }}>结果</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={`animate-slideIn font-mono text-[11px] ${row.isCorrect ? 'bg-[#DCFCE7] text-[#15803D] font-bold border-b-[#4ADE80]' : row.f > 94 ? 'opacity-80' : ''}`}>
                    <td className="text-[10px] text-neutral-400 font-normal">{i + 1}</td>
                    <td><strong>{row.c}</strong></td>
                    <td><strong>{row.r}</strong></td>
                    <td className={row.isCorrect ? "text-[#15803D]" : row.f > 94 ? "text-[#B91C1C]" : "text-neutral-700"}>
                      <strong>{row.f}</strong>
                    </td>
                    <td>{row.isCorrect || row.f === 94 ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-neutral-500 mt-4 uppercase tracking-[0.05em]">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#B91C1C] mr-1"></span>Out of bounds &nbsp;
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#15803D] mr-1"></span>Target &nbsp;
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-neutral-400 mr-1"></span>Waiting
          </p>
        </div>

        {/* Chart */}
        <div className="bg-white border border-neutral-200 p-8 shadow-sm">
          <div className="flex justify-between items-baseline mb-6 border-b border-neutral-300 pb-2">
            <h3 className="font-serif italic font-bold text-neutral-900">📈 脚数变化趋势 Chart</h3>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#F97316]">Linear_Viz</span>
          </div>

          <div className="relative h-[260px] bg-[#F9F8F6] p-4 border border-neutral-200">
            <Line data={chartData} options={chartOptions} />
          </div>
          <p className="text-[10px] text-neutral-500 mt-4 uppercase tracking-widest flex items-center justify-between">
            <span>观察：随着兔增多，脚数如何变化？</span>
            <span className="font-bold underline cursor-pointer decoration-neutral-300 hover:decoration-[#1D4ED8]">Analyze Rate</span>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {solved && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 border-t border-neutral-300 pt-12"
          >
            <div className="bg-neutral-900 text-white p-12 text-center relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-neutral-950 opacity-50 bg-[radial-gradient(#525252_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="relative z-10">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#A3A3A3] mb-4 border-b border-white/20 pb-2 inline-block">Rule Analysis Discovered</div>
                <span className="text-[#F97316] text-3xl font-serif font-bold italic block my-6 leading-tight">
                  每减少1只鸡、增加1只兔<br />脚数增加 2
                </span>
                <p className="text-neutral-400 text-sm font-mono m-0 uppercase">
                  (Rabbit Diff = +4) AND (Chicken Diff = -2) THEN Net = +2
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-[#FFEDD5] border border-[#FDBA74] p-10 text-center transition-transform hover:-translate-y-1 group">
                <h4 className="mb-4 text-[10px] uppercase font-bold tracking-widest text-[#F97316]">🐔 最终答案 Chicken Result</h4>
                <div className="text-[3.5rem] font-bold font-serif text-neutral-900 leading-none italic group-hover:scale-110 transition-transform">
                  23<span className="text-xl not-italic ml-2 font-sans font-normal text-neutral-500">只</span>
                </div>
                <p className="text-xs text-neutral-600 mt-4 font-mono font-bold tracking-wider">FEET: 23 × 2 = 46</p>
              </div>
              <div className="bg-[#DCFCE7] border border-[#4ADE80] p-10 text-center transition-transform hover:-translate-y-1 group">
                <h4 className="mb-4 text-[10px] uppercase font-bold tracking-widest text-[#15803D]">🐰 最终答案 Rabbit Result</h4>
                <div className="text-[3.5rem] font-bold font-serif text-neutral-900 leading-none italic group-hover:scale-110 transition-transform">
                  12<span className="text-xl not-italic ml-2 font-sans font-normal text-neutral-500">只</span>
                </div>
                <p className="text-xs text-neutral-600 mt-4 font-mono font-bold tracking-wider">FEET: 12 × 4 = 48</p>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-10 mt-6 shadow-sm">
              <h4 className="mb-6 font-serif italic text-xl border-b border-neutral-300 pb-2 text-neutral-900">🤔 思考：这种方法有什么特点？ Characteristics</h4>
              <div className="flex gap-6 flex-col md:flex-row mt-4">
                <div className="bg-[#F3F1EC] p-6 flex-1 border border-neutral-200">
                  <strong className="text-[#15803D] uppercase text-[10px] tracking-widest font-bold block mb-2">Human Approach - PROS</strong>
                  <p className="text-sm text-neutral-700 m-0 leading-relaxed font-sans">不需要公式，每步都很简单，逻辑清晰</p>
                </div>
                <div className="bg-neutral-100 p-6 flex-1 border border-neutral-200 border-l-[3px] border-l-[#F97316]">
                  <strong className="text-[#F97316] uppercase text-[10px] tracking-widest font-bold block mb-2">⚡ Computer Advantage</strong>
                  <p className="text-sm text-neutral-700 m-0 leading-relaxed font-sans">重复简单操作，速度快，不会出错，适合机器算法</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 flex justify-center border-t border-neutral-300 pt-8">
              <button className="btn btn-primary btn-lg w-full max-w-sm" onClick={handleComplete}>
                <span>✓ 完成！进入关卡4</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
