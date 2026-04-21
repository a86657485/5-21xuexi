import { useState } from "react";
import { Settings, Check, Unlock, ExternalLink } from "lucide-react";
import { useProgress } from "../lib/progress";

export default function TestPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  
  const { completeLevel } = useProgress();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "141710") {
      setAuthenticated(true);
    } else {
      alert("密码错误");
      setPassword("");
    }
  };

  const unlockAll = () => {
    for (let i = 1; i <= 5; i++) completeLevel(i);
    alert("所有关卡已解锁！");
  };

  const autoCompleteCurrent = () => {
    // Basic completion. Note this doesn't navigate automatically, just gives the star.
    const path = window.location.pathname;
    const match = path.match(/level(\d)/);
    if (match) {
      completeLevel(parseInt(match[1]));
      alert(`关卡 ${match[1]} 测试完成（已亮星）`);
    } else {
      alert("请在关卡页使用此功能。");
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[200] font-sans">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-10 h-10 bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white rounded flex items-center justify-center transition-colors shadow-lg"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && !authenticated && (
        <form onSubmit={handleLogin} className="absolute bottom-12 left-0 w-48 bg-white border border-neutral-300 shadow-xl p-3 flex flex-col gap-2">
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">测试面板</div>
          <input 
            type="password" 
            placeholder="输入密码" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-neutral-300 p-1.5 text-xs focus:outline-none focus:border-neutral-900"
            autoFocus
          />
          <button type="submit" className="bg-neutral-900 text-white text-xs p-1.5 hover:bg-neutral-800">验证</button>
        </form>
      )}

      {isOpen && authenticated && (
        <div className="absolute bottom-12 left-0 w-64 bg-white border border-neutral-300 shadow-xl p-4 flex flex-col gap-3">
          <div className="text-[10px] font-bold text-[#F97316] uppercase tracking-widest font-mono border-b border-neutral-200 pb-2 mb-1">
            调试模式 [验证: 成功]
          </div>
          
          <button onClick={unlockAll} className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 p-2 border border-transparent hover:border-neutral-200 transition-colors text-left w-full">
            <Unlock className="w-4 h-4" /> 解锁所有关卡
          </button>
          
          <button onClick={autoCompleteCurrent} className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 p-2 border border-transparent hover:border-neutral-200 transition-colors text-left w-full">
            <Check className="w-4 h-4" /> 一键测试(强制完成当前关卡)
          </button>
          
          <div className="text-xs text-neutral-500 uppercase tracking-widest mt-2 border-t border-neutral-200 pt-3 mb-1">跳转至指定关卡</div>
          <div className="grid grid-cols-5 gap-1">
            {[1,2,3,4,5].map(n => (
              <a key={n} href={`/level${n}`} className="bg-neutral-100 border border-neutral-300 text-center py-1 hover:bg-[#F97316] hover:text-white transition-colors text-xs font-mono font-bold">
                {n}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
