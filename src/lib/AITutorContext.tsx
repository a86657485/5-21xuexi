import { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, X, Sparkles, Loader2 } from "lucide-react";

interface AITutorContextType {
  askAI: (context: string, errorDetail: string) => void;
  showTutorial: (level: number, content: string) => void;
}

const AITutorContext = createContext<AITutorContextType | null>(null);

export function useAITutor() {
  const ctx = useContext(AITutorContext);
  if (!ctx) throw new Error("useAITutor must be used within AITutorProvider");
  return ctx;
}

export function AITutorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [tutorialContent, setTutorialContent] = useState<{ level: number, text: string } | null>(null);
  const [hasSeenTutorial, setHasSeenTutorial] = useState<Record<number, boolean>>({});

  const askAI = async (context: string, errorDetail: string) => {
    setIsOpen(true);
    setMessages([{ role: 'user', text: `我在做这步操作时遇到了问题：${errorDetail}` }]);
    setLoading(true);

    try {
      const prompt = `你是一个小学数学"鸡兔同笼"问题的AI伴学导师。
教学上下文：${context}
学生遇到了这个错误：${errorDetail}
请用温和、鼓励的口吻，简单明了地点拨学生，引导他们思考，不要直接给出最终答案。回复限制在150字以内。`;

      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer sk-eb65e011c69a4e1cb667eecdfce990a8`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的AI伴学导师角色。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      const data = await res.json();
      const reply = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "网络好像出现了点小问题，请稍后再试哦~" }]);
    } finally {
      setLoading(false);
    }
  };

  const showTutorial = (level: number, content: string) => {
    if (hasSeenTutorial[level]) return;
    setTutorialContent({ level, text: content });
    setHasSeenTutorial(prev => ({ ...prev, [level]: true }));
  };

  return (
    <AITutorContext.Provider value={{ askAI, showTutorial }}>
      {children}
      
      {/* Floating AI Tutor Icon */}
      <div 
        className="fixed bottom-6 right-6 z-[90] cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <div className="absolute inset-0 bg-[#C8830A] rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
        <div className="w-14 h-14 bg-neutral-900 border-2 border-[#C8830A] rounded-full flex items-center justify-center shadow-xl relative transition-transform hover:scale-105">
          <Bot className="text-[#C8830A] w-7 h-7" />
        </div>
      </div>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 bg-white border border-neutral-300 shadow-2xl z-[100] flex flex-col font-sans font-medium max-h-[500px]"
          >
            <div className="bg-neutral-900 text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F97316]" />
                <span className="font-serif italic font-bold">AI导师 Tutor</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F8F6]">
              {messages.length === 0 ? (
                <div className="text-center text-neutral-500 text-sm py-4">点击关卡中的交互遇到困难时，我会自动出来帮忙！你也可以随时点开我。</div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`p-3 max-w-[85%] text-[13px] leading-relaxed shadow-sm ${m.role === 'ai' ? 'bg-white border text-neutral-800' : 'bg-[#15803D] text-white'}`}>
                      {m.text}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="p-3 bg-white border text-neutral-800 flex items-center gap-2 shadow-sm text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-[#F97316]" />
                    思考中...
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Intro Modal */}
      <AnimatePresence>
        {tutorialContent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900/80 z-[200] flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white max-w-lg w-full p-8 border-t-4 border-[#15803D] shadow-2xl relative"
            >
              <div className="absolute top-0 right-0 bg-neutral-900 text-white font-mono text-[10px] tracking-widest px-2 py-1">
                LEVEL GUIDE
              </div>
              <div className="flex gap-4 mb-6 items-start">
                <div className="w-12 h-12 bg-[#DCFCE7] rounded-none flex items-center justify-center text-[#15803D] border border-[#4ADE80] shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold italic mb-1 text-neutral-900">操作指导</h3>
                  <p className="text-[14px] text-neutral-600 leading-relaxed font-sans whitespace-pre-wrap">{tutorialContent.text}</p>
                </div>
              </div>
              <button 
                className="w-full btn btn-primary mt-4 py-3 bg-[#15803D] hover:bg-[#166534] border-none text-white text-[14px]"
                onClick={() => setTutorialContent(null)}
              >
                我知道了，开始探究
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AITutorContext.Provider>
  );
}
