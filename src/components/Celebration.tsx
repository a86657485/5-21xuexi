import { useProgress } from "../lib/progress";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function Celebration() {
  const { celebration, hideCelebration } = useProgress();

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-md bg-white p-12 text-center border-t-4 border-t-[#F97316] shadow-2xl relative"
          >
            <div className="absolute top-0 right-0 bg-neutral-900 text-white font-mono text-[10px] tracking-widest px-2 py-1">
              ACHIEVEMENT UNLOCKED
            </div>

            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="mb-6 text-6xl"
            >
              {celebration.icon}
            </motion.div>
            <h2 className="mb-4 text-3xl font-bold font-serif italic text-neutral-900 leading-tight">
              {celebration.title}
            </h2>
            <div className="w-12 h-[1px] bg-neutral-300 mx-auto mb-5"></div>
            <p className="mb-8 text-neutral-600 whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {celebration.msg}
            </p>
            
            {celebration.nextPage && (
              <Link
                to={celebration.nextPage}
                onClick={hideCelebration}
                className="btn btn-primary btn-lg mb-6 w-full justify-center"
              >
                {celebration.nextLabel || "下一关 →"}
              </Link>
            )}
            
            <button
              onClick={hideCelebration}
              className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              再看看 REVIEW
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
