import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProgressProvider } from "./lib/progress";
import { AITutorProvider } from "./lib/AITutorContext";
import Navbar from "./components/Navbar";
import Celebration from "./components/Celebration";
import TestPanel from "./components/TestPanel";

import Home from "./pages/Home";
import Level1 from "./pages/Level1";
import Level2 from "./pages/Level2";
import Level3 from "./pages/Level3";
import Level4 from "./pages/Level4";
import Level5 from "./pages/Level5";

export default function App() {
  return (
    <ProgressProvider>
      <AITutorProvider>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            <Navbar />
            <main className="flex-1 pt-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/level1" element={<Level1 />} />
                <Route path="/level2" element={<Level2 />} />
                <Route path="/level3" element={<Level3 />} />
                <Route path="/level4" element={<Level4 />} />
                <Route path="/level5" element={<Level5 />} />
              </Routes>
            </main>
            <Celebration />
            <TestPanel />
          </div>
        </BrowserRouter>
      </AITutorProvider>
    </ProgressProvider>
  );
}
