import { Routes, Route, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import AgePage from './pages/AgePage'
import RetiredPage from './pages/RetiredPage'
import Dashboard from './pages/Dashboard'
import Simulator from './pages/Simulator'
import VoidPage from './pages/VoidPage'
import PlantGame from './pages/games/PlantGame'
import FishingGame from './pages/games/FishingGame'
import AquariumGame from './pages/games/AquariumGame'
import DrivingGame from './pages/games/DrivingGame'
import Achievements from './pages/Achievements'
import Certificate from './pages/Certificate'
import CareerCountdown from './pages/CareerCountdown'
import DaySchedule from './pages/DaySchedule'
import AiTakeover from './pages/AiTakeover'
import Doctor from './pages/Doctor'
import Meditation from './pages/Meditation'
import DecisionTree from './pages/DecisionTree'
import JobWall from './pages/JobWall'
import GrandPrize from './pages/GrandPrize'
import AgentChat from './components/AgentChat'
import type { GeneratedFile } from './components/AgentChat'
import FilePreview from './components/FilePreview'

export type RetireReason = 'underage' | 'overage' | null

function App() {
  const [userAge, setUserAge] = useState<number | null>(null)
  const [retireReason, setRetireReason] = useState<RetireReason>(null)
  const [previewFile, setPreviewFile] = useState<GeneratedFile | null>(null)
  const location = useLocation()

  // 在入口页和退休页不显示 AgentChat
  const showChat = !['/', '/retired', '/grand-prize', '/meditation', '/void'].includes(location.pathname)

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* 左侧主内容区 */}
      <div className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden ${showChat ? '' : 'w-full'}`}>
        <Routes>
          <Route
            path="/"
            element={
              <AgePage
                onSubmit={(age) => {
                  setUserAge(age)
                  if (age < 18) setRetireReason('underage')
                  else if (age >= 35) setRetireReason('overage')
                  else setRetireReason(null)
                }}
              />
            }
          />
          <Route path="/retired" element={<RetiredPage reason={retireReason} age={userAge} />} />
          <Route path="/dashboard" element={<Dashboard age={userAge} />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/void" element={<VoidPage />} />
          <Route path="/game/plant" element={<PlantGame />} />
          <Route path="/game/fishing" element={<FishingGame />} />
          <Route path="/game/aquarium" element={<AquariumGame />} />
          <Route path="/game/driving" element={<DrivingGame />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/certificate" element={<Certificate />} />
          <Route path="/career" element={<CareerCountdown />} />
          <Route path="/day-schedule" element={<DaySchedule />} />
          <Route path="/ai-takeover" element={<AiTakeover />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/meditation" element={<Meditation />} />
          <Route path="/decision-tree" element={<DecisionTree />} />
          <Route path="/job-wall" element={<JobWall />} />
          <Route path="/grand-prize" element={<GrandPrize />} />
        </Routes>
      </div>

      {/* 右侧 Agent Chat 侧边栏 */}
      {showChat && (
        <div className="hidden md:block w-[380px] flex-shrink-0 h-screen relative z-10">
          <AgentChat onPreviewFile={setPreviewFile} />
        </div>
      )}

      {/* 最右侧文件预览器（可展开） */}
      <AnimatePresence>
        {previewFile && (
          <FilePreview
            key={previewFile.name}
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
