import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LYRICS = [
  'Work it harder',
  'Make it better',
  'Do it faster',
  'Makes us stronger',
  'More than ever',
  'Hour after hour',
  'Work is never over',
]

// 不同频率的电流音，每句歌词对应一个频率
const FREQUENCIES = [220, 277, 330, 392, 440, 523, 659]

interface Bubble {
  id: number
  text: string
  x: number
  y: number
}

function playElectroBeep(freq: number, duration = 0.25) {
  try {
    const ctx = new AudioContext()
    
    // 主振荡器（方波 = 电子音）
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration * 0.3)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + duration)

    // 副振荡器（锯齿波，叠加音色）
    const osc2 = ctx.createOscillator()
    osc2.type = 'sawtooth'
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime)
    osc2.frequency.exponentialRampToValueAtTime(freq * 1.2, ctx.currentTime + duration)

    // 增益控制（音量包络）
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    const gain2 = ctx.createGain()
    gain2.gain.setValueAtTime(0.05, ctx.currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    // 失真效果
    const distortion = ctx.createWaveShaper()
    const curve = new Float32Array(256)
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1
      curve[i] = (Math.PI + 100) * x / (Math.PI + 100 * Math.abs(x))
    }
    distortion.curve = curve

    osc.connect(gain)
    osc2.connect(gain2)
    gain.connect(distortion)
    gain2.connect(distortion)
    distortion.connect(ctx.destination)

    osc.start()
    osc2.start()
    osc.stop(ctx.currentTime + duration)
    osc2.stop(ctx.currentTime + duration)

    setTimeout(() => ctx.close(), duration * 1000 + 200)
  } catch {
    // Web Audio not available
  }
}

export default function WorkButton() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const idRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleClick = useCallback(() => {
    if (isPlaying) return

    setIsPlaying(true)
    let idx = 0

    const showNext = () => {
      if (idx >= LYRICS.length) {
        setIsPlaying(false)
        setCurrentIndex(0)
        return
      }

      const bubbleId = ++idRef.current
      const x = 50 + (Math.random() - 0.5) * 40
      const y = 30 + (Math.random() - 0.5) * 20

      setBubbles(prev => [...prev, {
        id: bubbleId,
        text: LYRICS[idx],
        x,
        y,
      }])

      playElectroBeep(FREQUENCIES[idx], 0.3)
      setCurrentIndex(idx + 1)

      // 移除气泡
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== bubbleId))
      }, 2000)

      idx++
      timeoutRef.current = setTimeout(showNext, 600)
    }

    showNext()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isPlaying])

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        disabled={isPlaying}
        className={`
          relative px-8 py-4 rounded-2xl font-bold text-lg
          transition-all duration-300 overflow-hidden
          ${isPlaying
            ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white shadow-lg shadow-red-500/30 animate-shake'
            : 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/30 hover:shadow-primary/50'
          }
        `}
      >
        {/* 闪烁背景 */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 bg-white/10"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {isPlaying ? (
            <>
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                ⚡
              </motion.span>
              {LYRICS[currentIndex - 1] || 'WORK!'}
            </>
          ) : (
            <>💼 WORK</>
          )}
        </span>
      </motion.button>

      {/* 气泡 */}
      <AnimatePresence>
        {bubbles.map(bubble => (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -80 }}
            exit={{ opacity: 0, scale: 0.3, y: -150 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute pointer-events-none z-50 whitespace-nowrap"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full
              text-sm font-bold shadow-lg shadow-orange-500/50 border-2 border-yellow-300">
              {bubble.text}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-500 rotate-45" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
