import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAchievement } from '../hooks/useAchievement'

const PHASES = [
  { label: '吸气', duration: 4000, color: '#818cf8', scale: 1.4 },
  { label: '屏住', duration: 4000, color: '#f59e0b', scale: 1.4 },
  { label: '呼气', duration: 6000, color: '#10b981', scale: 1 },
  { label: '放松', duration: 2000, color: '#6366f1', scale: 1 },
]

const AMBIENT_MESSAGES = [
  '让思绪像云一样飘过...',
  '你不需要做任何事...',
  '感受此刻的宁静...',
  '呼吸是你唯一需要做的事...',
  '放下焦虑，拥抱平静...',
  '你值得这份安宁...',
  'AI 在替你工作，你只需要呼吸...',
  '每一次呼吸都在靠近退休...',
  '现在这个瞬间，完美无缺...',
  '你已经做得够好了...',
]

function playBowlSound(freq: number, duration: number) {
  try {
    const ctx = new AudioContext()
    
    // 正弦波 - 颂钵主音
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    
    // 谐波
    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(freq * 2.01, ctx.currentTime) // 微失谐产生拍频

    const osc3 = ctx.createOscillator()
    osc3.type = 'sine'
    osc3.frequency.setValueAtTime(freq * 3, ctx.currentTime)

    // 缓慢衰减
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.5)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    const gain2 = ctx.createGain()
    gain2.gain.setValueAtTime(0.02, ctx.currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.7)

    const gain3 = ctx.createGain()
    gain3.gain.setValueAtTime(0.01, ctx.currentTime)
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.5)

    osc.connect(gain)
    osc2.connect(gain2)
    osc3.connect(gain3)
    gain.connect(ctx.destination)
    gain2.connect(ctx.destination)
    gain3.connect(ctx.destination)

    osc.start()
    osc2.start()
    osc3.start()
    osc.stop(ctx.currentTime + duration)
    osc2.stop(ctx.currentTime + duration)
    osc3.stop(ctx.currentTime + duration)

    setTimeout(() => ctx.close(), duration * 1000 + 200)
  } catch {
    // Audio not available
  }
}

export default function Meditation() {
  const navigate = useNavigate()
  useAchievement('meditation')
  const [started, setStarted] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [message, setMessage] = useState(AMBIENT_MESSAGES[0])
  const [showMessage, setShowMessage] = useState(false)
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const secondTimerRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const currentPhase = PHASES[phaseIndex]

  const start = useCallback(() => {
    setStarted(true)
    setPhaseIndex(0)
    setCycleCount(0)
    setTotalSeconds(0)
    playBowlSound(261.63, 4) // C4
  }, [])

  // 呼吸循环
  useEffect(() => {
    if (!started) return

    phaseTimerRef.current = setTimeout(() => {
      const nextIndex = (phaseIndex + 1) % PHASES.length
      setPhaseIndex(nextIndex)
      
      // 一个完整循环
      if (nextIndex === 0) {
        setCycleCount(c => c + 1)
      }

      // 每次进入吸气阶段时播放颂钵音
      if (nextIndex === 0) {
        playBowlSound(261.63, 4)
      } else if (nextIndex === 2) {
        playBowlSound(392, 3)
      }
    }, currentPhase.duration)

    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
    }
  }, [started, phaseIndex, currentPhase.duration])

  // 计时器
  useEffect(() => {
    if (!started) return
    secondTimerRef.current = setInterval(() => {
      setTotalSeconds(s => s + 1)
    }, 1000)
    return () => {
      if (secondTimerRef.current) clearInterval(secondTimerRef.current)
    }
  }, [started])

  // 随机禅意消息
  useEffect(() => {
    if (!started) return
    const interval = setInterval(() => {
      setMessage(AMBIENT_MESSAGES[Math.floor(Math.random() * AMBIENT_MESSAGES.length)])
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 4000)
    }, 8000)
    // 初始显示
    setTimeout(() => { setShowMessage(true); setTimeout(() => setShowMessage(false), 4000) }, 3000)
    return () => clearInterval(interval)
  }, [started])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    return `${m}:${String(s % 60).padStart(2, '0')}`
  }

  if (!started) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-40">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          whileHover={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="fixed top-6 right-6 z-50 p-2 rounded-full bg-white/5 text-white/30 hover:text-white transition-all cursor-pointer"
        >
          <X size={20} />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            className="text-8xl mb-8"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🧘
          </motion.div>
          <h1 className="text-3xl font-bold text-white/80 mb-4">冥想呼吸</h1>
          <p className="text-white/30 text-sm mb-8 max-w-md">
            4-4-6-2 呼吸法：吸气 4 秒，屏住 4 秒，呼气 6 秒，放松 2 秒
          </p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={start}
            className="px-8 py-4 bg-primary/20 border border-primary/30 rounded-full text-primary-light font-medium
              hover:bg-primary/30 transition-colors text-lg"
          >
            开始冥想
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden z-40">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        whileHover={{ opacity: 1 }}
        onClick={() => navigate(-1)}
        className="fixed top-6 right-6 z-50 p-2 rounded-full bg-white/5 text-white/30 hover:text-white transition-all cursor-pointer"
      >
        <X size={20} />
      </motion.button>

      {/* 环境粒子 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ background: currentPhase.color + '40' }}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000) - 500,
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800) - 400,
          }}
          animate={{
            x: [null, (Math.random() - 0.5) * 800],
            y: [null, (Math.random() - 0.5) * 600],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* 呼吸圆环 */}
      <div className="relative flex items-center justify-center">
        {/* 外圈光晕 */}
        <motion.div
          className="absolute rounded-full"
          animate={{
            scale: currentPhase.scale * 1.2,
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: currentPhase.duration / 1000, ease: 'easeInOut' }}
          style={{
            width: 300,
            height: 300,
            background: `radial-gradient(circle, ${currentPhase.color}20, transparent)`,
            filter: 'blur(40px)',
          }}
        />

        {/* 主呼吸圆 */}
        <motion.div
          className="rounded-full flex items-center justify-center relative"
          animate={{
            scale: currentPhase.scale,
          }}
          transition={{
            duration: currentPhase.duration / 1000,
            ease: phaseIndex === 0 ? 'easeIn' : phaseIndex === 2 ? 'easeOut' : 'linear',
          }}
          style={{
            width: 200,
            height: 200,
            background: `radial-gradient(circle, ${currentPhase.color}30, ${currentPhase.color}10)`,
            border: `2px solid ${currentPhase.color}40`,
          }}
        >
          <div className="text-center">
            <motion.p
              key={phaseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-light"
              style={{ color: currentPhase.color }}
            >
              {currentPhase.label}
            </motion.p>
          </div>
        </motion.div>

        {/* 进度环 */}
        <svg className="absolute w-[220px] h-[220px]" viewBox="0 0 220 220">
          <circle cx="110" cy="110" r="104" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          {PHASES.map((phase, i) => {
            const totalDuration = PHASES.reduce((s, p) => s + p.duration, 0)
            const startAngle = PHASES.slice(0, i).reduce((s, p) => s + (p.duration / totalDuration) * 360, 0) - 90
            const arcAngle = (phase.duration / totalDuration) * 360
            const endAngle = startAngle + arcAngle
            const startRad = (startAngle * Math.PI) / 180
            const endRad = (endAngle * Math.PI) / 180
            const x1 = 110 + 104 * Math.cos(startRad)
            const y1 = 110 + 104 * Math.sin(startRad)
            const x2 = 110 + 104 * Math.cos(endRad)
            const y2 = 110 + 104 * Math.sin(endRad)
            const largeArc = arcAngle > 180 ? 1 : 0

            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A 104 104 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={phase.color}
                strokeWidth={i === phaseIndex ? 3 : 1}
                opacity={i === phaseIndex ? 0.8 : 0.2}
              />
            )
          })}
        </svg>
      </div>

      {/* 禅意消息 */}
      <AnimatePresence>
        {showMessage && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-32 text-white/30 text-sm font-light tracking-wide"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* 底部信息 */}
      <div className="absolute bottom-8 flex items-center gap-8 text-white/20 text-sm">
        <span>🔄 第 {cycleCount + 1} 轮</span>
        <span>⏱ {formatTime(totalSeconds)}</span>
      </div>
    </div>
  )
}
