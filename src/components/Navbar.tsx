import { Link, useLocation } from "react-router-dom";
import { useProgress } from "../lib/progress";

const STEPS = [
  { n: 1, label: "故事", path: "/level1" },
  { n: 2, label: "假设", path: "/level2" },
  { n: 3, label: "枚举", path: "/level3" },
  { n: 4, label: "流程", path: "/level4" },
  { n: 5, label: "程序", path: "/level5" },
];

export default function Navbar() {
  const { isUnlocked, isCompleted, stars } = useProgress();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between border-b border-neutral-300 bg-white px-6 py-3">
      <Link to="/" className="flex items-center gap-2 font-serif text-[1.1rem] font-bold text-neutral-900 tracking-wider hover:-translate-y-0.5 transition-transform">
        <span className="text-2xl leading-none">🐔</span>
        <span className="italic">鸡兔同笼</span>
      </Link>

      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const completed = isCompleted(s.n);
          const unlocked = isUnlocked(s.n);
          const current = location.pathname === s.path;
          
          let cls = "bg-white text-neutral-400 border-neutral-300"; // locked
          
          if (completed) {
            cls = "bg-neutral-900 text-white border-neutral-900";
          } else if (current) {
            cls = "bg-white text-[#F97316] border-[#F97316] shadow-[2px_2px_0_#F97316]";
          } else if (unlocked) {
            cls = "bg-white text-neutral-900 border-neutral-900";
          }

          const showConnector = i < STEPS.length - 1;
          const nextUnlocked = isUnlocked(s.n + 1) || isCompleted(s.n);

          return (
            <div key={s.n} className="flex items-center gap-2">
              <Link
                to={unlocked ? s.path : "#"}
                onClick={(e) => !unlocked && e.preventDefault()}
                className={`flex h-8 w-8 items-center justify-center border font-mono text-[11px] font-bold transition-all ${cls} ${!unlocked ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                title={`关卡${s.n}：${s.label}`}
              >
                {s.n}
              </Link>
              {showConnector && (
                <div className={`h-[1px] w-6 ${nextUnlocked ? 'bg-neutral-900' : 'bg-neutral-300 border-dashed border-b border-neutral-300'}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#F97316] font-mono">
        <span>STARS: {stars}/5</span>
      </div>
    </nav>
  );
}
