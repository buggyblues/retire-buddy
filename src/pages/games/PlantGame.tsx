import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAchievement } from '../../hooks/useAchievement'
import NextGameBanner from '../../components/NextGameBanner'
import BgmToggle from '../../components/BgmToggle'
import { sfxPlant, sfxCollect } from '../../hooks/use8bitAudio'

const plantStages = [
  {
    name: '种子',
    art: [
      '      ',
      '  ██  ',
      ' ████ ',
      '  ██  ',
      '      ',
    ],
    color: '#92400e',
    message: '一颗充满希望的种子',
  },
  {
    name: '发芽',
    art: [
      '  ▓▓  ',
      ' ▓██▓ ',
      '  ▓▓  ',
      '  ██  ',
      '  ██  ',
      ' ▓▓▓▓ ',
    ],
    color: '#22c55e',
    message: '嫩芽破土而出！',
  },
  {
    name: '幼苗',
    art: [
      '    ▓▓    ',
      ' ▓▓██▓▓   ',
      '  ▓██▓  ▓ ',
      '   ██  ▓█▓',
      '   ██   ▓ ',
      '   ██     ',
      '  ▓██▓    ',
      ' ▓▓▓▓▓▓  ',
    ],
    color: '#16a34a',
    message: '正在茁壮成长...',
  },
  {
    name: '开花',
    art: [
      '   ░██░   ',
      '  ██████  ',
      ' ░██████░ ',
      '  ██████  ',
      '   ░██░   ',
      '    ██    ',
      '   ████   ',
      '  ██████  ',
      '    ██    ',
      '  ▓▓▓▓▓▓  ',
    ],
    color: '#ec4899',
    message: '开出了美丽的花朵！',
  },
  {
    name: '大树',
    art: [
      '     ░▓██▓░     ',
      '   ▓████████▓   ',
      '  ████████████  ',
      ' ██████████████ ',
      '  ████████████  ',
      '   ▓████████▓   ',
      '     ▓████▓     ',
      '      ████      ',
      '      ████      ',
      '      ████      ',
      '    ▓▓████▓▓    ',
      '  ▓▓▓▓▓▓▓▓▓▓▓▓  ',
    ],
    color: '#15803d',
    message: '长成了参天大树！！',
  },
]

export default function PlantGame() {
  const navigate = useNavigate()
  useAchievement('plant')
  const [stage, setStage] = useState(0)
  const [water, setWater] = useState(50)
  const [sun, setSun] = useState(50)
  const [love, setLove] = useState(0)
  const [showMessage, setShowMessage] = useState('')
  const [particles, setParticles] = useState<{ id: number; type: string; x: number; y: number }[]>([])
  const [dayNight, setDayNight] = useState<'day' | 'night'>('day')

  const plant = plantStages[stage]

  useEffect(() => {
    const timer = setInterval(() => {
      setWater(w => Math.max(0, w - 1.5))
      setSun(s => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (love >= (stage + 1) * 20 && stage < plantStages.length - 1) {
      setStage(s => s + 1)
      setShowMessage(plantStages[Math.min(stage + 1, plantStages.length - 1)].message)
      setTimeout(() => setShowMessage(''), 3000)
    }
  }, [love, stage])

  const addParticle = useCallback((type: string) => {
    const id = Date.now() + Math.random()
    const x = 35 + Math.random() * 30
    const y = 30 + Math.random() * 20
    setParticles(p => [...p, { id, type, x, y }])
    setTimeout(() => setParticles(p => p.filter(pp => pp.id !== id)), 1200)
  }, [])

  const doWater = () => { sfxPlant(); if (navigator.vibrate) navigator.vibrate(20); setWater(w => Math.min(100, w + 25)); setLove(l => l + 3); addParticle('~') }
  const doSun = () => { sfxPlant(); if (navigator.vibrate) navigator.vibrate(20); setSun(s => Math.min(100, s + 25)); setLove(l => l + 3); addParticle('*'); setDayNight('day') }
  const doLove = () => { sfxCollect(); if (navigator.vibrate) navigator.vibrate(20); setLove(l => l + 5); addParticle('♥') }

  const PixelBar = ({ value, color, label }: { value: number; color: string; label: string }) => (
    <div className="flex items-center gap-2">
      <span className="pixel-font text-[8px] w-12 text-right" style={{ color }}>{label}</span>
      <div className="flex-1 h-4 pixel-border border-slate-600 bg-slate-900 relative overflow-hidden">
        <motion.div
          className="h-full"
          style={{ background: color }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-black/30" />
          ))}
        </div>
      </div>
      <span className="pixel-font text-[8px] w-10 text-slate-400">{Math.floor(value)}%</span>
    </div>
  )

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${dayNight === 'night' ? 'bg-slate-950' : 'bg-surface'}`}>
      <BgmToggle />
      {/* Header */}
      <div className="p-4 sm:p-6">
        <button
          onClick={() => { sfxCollect(); if (navigator.vibrate) navigator.vibrate(15); navigate('/simulator') }}
          className="pixel-font text-[10px] text-slate-400 hover:text-white transition-colors"
        >
          {'<'} BACK
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-2 pb-12">
        <h2 className="pixel-font text-sm text-green-400 text-center mb-1">
          PLANT SIMULATOR
        </h2>
        <p className="pixel-font text-[8px] text-slate-500 text-center mb-6">
          Water it. Love it. Watch it grow.
        </p>

        {/* 像素场景区域 */}
        <div className={`relative pixel-panel rounded-none p-6 mb-6 min-h-[300px] flex flex-col items-center justify-end
          ${dayNight === 'night' ? 'bg-slate-950' : 'bg-slate-900'}`}>

          {/* 天空 */}
          {dayNight === 'day' ? (
            <div className="absolute top-3 right-4 pixel-font text-yellow-400 text-lg animate-pixel-blink">
              ☼
            </div>
          ) : (
            <>
              <div className="absolute top-3 right-4 pixel-font text-slate-300 text-sm">●</div>
              <div className="absolute top-5 left-6 pixel-font text-slate-600 text-[8px]">·</div>
              <div className="absolute top-8 left-16 pixel-font text-slate-600 text-[8px]">·</div>
              <div className="absolute top-4 left-28 pixel-font text-slate-600 text-[8px]">·</div>
            </>
          )}

          {/* 阶段标签 */}
          <div className="absolute top-3 left-3 pixel-font text-[8px] text-green-500 bg-green-950 px-2 py-1 border border-green-800">
            LV.{stage + 1} {plant.name}
          </div>

          {/* 粒子 */}
          <AnimatePresence>
            {particles.map(p => (
              <motion.span
                key={p.id}
                className="absolute pixel-font text-sm pointer-events-none"
                style={{ color: p.type === '~' ? '#60a5fa' : p.type === '*' ? '#fbbf24' : '#f472b6' }}
                initial={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 1, scale: 1 }}
                animate={{ top: `${p.y - 15}%`, opacity: 0, scale: 1.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                {p.type}
              </motion.span>
            ))}
          </AnimatePresence>

          {/* 植物 ASCII Art */}
          <motion.div
            className="relative z-10 mb-4"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <pre
              className="pixel-font text-[10px] sm:text-xs leading-tight text-center select-none"
              style={{ color: plant.color }}
            >
              {plant.art.join('\n')}
            </pre>
          </motion.div>

          {/* 地面 */}
          <div className="w-full">
            <div className="pixel-font text-[10px] text-amber-800 text-center tracking-[4px] leading-none">
              {'▓'.repeat(30)}
            </div>
            <div className="pixel-font text-[10px] text-amber-900 text-center tracking-[4px] leading-none">
              {'█'.repeat(30)}
            </div>
          </div>

          {/* 消息 */}
          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-black/80 border-2 border-green-500 px-4 py-2 z-20"
              >
                <p className="pixel-font text-[8px] text-green-400 whitespace-nowrap">
                  ★ {showMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 状态条 */}
        <div className="pixel-panel rounded-none p-4 mb-4 space-y-2">
          <PixelBar value={water} color="#3b82f6" label="WATER" />
          <PixelBar value={sun} color="#f59e0b" label="SUN" />
          <PixelBar
            value={Math.min(100, (love / (plantStages.length * 20)) * 100)}
            color="#ec4899"
            label="LOVE"
          />
        </div>

        {/* 操作按钮 */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={doWater}
            className="pixel-btn bg-blue-900 border-blue-600 text-blue-300 py-3 px-2 text-[10px] hover:bg-blue-800 active:bg-blue-950"
          >
            💧 WATER
          </button>
          <button
            onClick={doSun}
            className="pixel-btn bg-amber-900 border-amber-600 text-amber-300 py-3 px-2 text-[10px] hover:bg-amber-800 active:bg-amber-950"
          >
            ☀ SUN
          </button>
          <button
            onClick={doLove}
            className="pixel-btn bg-pink-900 border-pink-600 text-pink-300 py-3 px-2 text-[10px] hover:bg-pink-800 active:bg-pink-950"
          >
            ♥ LOVE
          </button>
        </div>

        {/* 日夜切换 */}
        <button
          onClick={() => { sfxCollect(); if (navigator.vibrate) navigator.vibrate(15); setDayNight(d => d === 'day' ? 'night' : 'day') }}
          className="mt-3 w-full pixel-btn bg-slate-800 border-slate-600 text-slate-400 py-2 text-[9px] hover:bg-slate-700"
        >
          {dayNight === 'day' ? '🌙 NIGHT MODE' : '☀ DAY MODE'}
        </button>

        <NextGameBanner currentGameId="plant" />
      </div>
    </div>
  )
}
