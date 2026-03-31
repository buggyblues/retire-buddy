import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAchievement } from '../hooks/useAchievement'
import { fadeOutGlobalAudio } from '../hooks/useGlobalAudio'

export default function VoidPage() {
  const navigate = useNavigate()
  useAchievement('void')
  const [showHint, setShowHint] = useState(true)

  // 离开虚空页面时淡出全局音乐
  useEffect(() => {
    return () => {
      fadeOutGlobalAudio(3000)
    }
  }, [])
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [breathPhase, setBreathPhase] = useState(0) // 0: inhale, 1: hold, 2: exhale

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const cycle = setInterval(() => {
      setBreathPhase(p => (p + 1) % 3)
    }, 4000)
    return () => clearInterval(cycle)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    })
  }

  const breathLabels = ['吸气...', '屏住...', '呼气...']

  return (
    <div
      className="fixed inset-0 bg-black cursor-none overflow-hidden z-40"
      onMouseMove={handleMouseMove}
      onClick={() => setShowHint(false)}
    >
      {/* 退出按钮 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        whileHover={{ opacity: 1, scale: 1.05 }}
        onClick={() => navigate('/dashboard')}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full bg-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-all cursor-pointer backdrop-blur-sm border border-white/10 text-sm flex items-center gap-2"
      >
        <X size={16} />
        退出虚空
      </motion.button>

      {/* 中心光晕 - 主环 */}
      <motion.div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="w-64 h-64 sm:w-96 sm:h-96 rounded-full"
          style={{
            background: `conic-gradient(
              from 0deg,
              transparent,
              rgba(99, 102, 241, 0.15),
              transparent,
              rgba(139, 92, 246, 0.1),
              transparent,
              rgba(99, 102, 241, 0.15),
              transparent
            )`,
            filter: 'blur(30px)',
          }}
        />
      </motion.div>

      {/* 第二层光环 - 反向旋转 */}
      <motion.div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full"
          style={{
            background: `conic-gradient(
              from 90deg,
              transparent,
              rgba(236, 72, 153, 0.08),
              transparent,
              rgba(99, 102, 241, 0.08),
              transparent
            )`,
            filter: 'blur(50px)',
          }}
        />
      </motion.div>

      {/* 第三层 - 脉冲光环 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-48 h-48 sm:w-72 sm:h-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </motion.div>

      {/* 鼠标跟随的微光 */}
      <motion.div
        className="absolute w-32 h-32 rounded-full pointer-events-none"
        animate={{
          left: mousePos.x * 100 + '%',
          top: mousePos.y * 100 + '%',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        style={{
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(15px)',
        }}
      />

      {/* 漂浮的微小粒子 */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
            y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* 呼吸引导 */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 3 }}
      >
        <motion.p
          className="text-white/30 text-sm tracking-[0.3em] font-light"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          {breathLabels[breathPhase]}
        </motion.p>
      </motion.div>

      {/* 初始提示 */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <p className="text-white/20 text-lg font-light tracking-widest">
              放空一切...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
