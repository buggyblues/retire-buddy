import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAchievement } from '../hooks/useAchievement'
import { startBGM, stopBGM, isBGMPlaying, sfxStart } from '../hooks/use8bitAudio'

const games = [
  {
    id: 'plant',
    name: 'PLANT SIM',
    label: '🌱 植物养成',
    desc: '种下种子，浇水施肥，看它从嫩芽长成参天大树。',
    art: ' ♠\n |\n▓▓▓',
    color: '#22c55e',
    border: 'border-green-700 hover:border-green-500',
    bg: 'bg-green-950/40',
    path: '/game/plant',
  },
  {
    id: 'fishing',
    name: 'FISHING',
    label: '🎣 悠闲钓鱼',
    desc: '在宁静湖畔抛竿，耐心等待鱼儿上钩。',
    art: ' /\n/\n~≈><>',
    color: '#3b82f6',
    border: 'border-blue-700 hover:border-blue-500',
    bg: 'bg-blue-950/40',
    path: '/game/fishing',
  },
  {
    id: 'aquarium',
    name: 'AQUARIUM',
    label: '🐠 养鱼观赏',
    desc: '打理像素水族箱，看鱼儿自由游弋。',
    art: '><> <><\n ><((°>\n~≈~~≈~',
    color: '#06b6d4',
    border: 'border-cyan-700 hover:border-cyan-500',
    bg: 'bg-cyan-950/40',
    path: '/game/aquarium',
  },
  {
    id: 'driving',
    name: 'ROAD TRIP',
    label: '🚗 长途旅行',
    desc: '驰骋在无尽公路，穿越城市、山川与沙漠。',
    art: '  ═══\n─┤ ├─\n └─┘',
    color: '#f59e0b',
    border: 'border-amber-700 hover:border-amber-500',
    bg: 'bg-amber-950/40',
    path: '/game/driving',
  },
]

export default function Simulator() {
  const navigate = useNavigate()
  useAchievement('simulator')
  const [bgmOn, setBgmOn] = useState(isBGMPlaying)

  // Auto-start BGM when entering simulator
  useEffect(() => {
    if (!isBGMPlaying()) {
      startBGM()
      setBgmOn(true)
    }
    return () => { stopBGM(); setBgmOn(false) }
  }, [])

  const toggleBGM = () => {
    if (navigator.vibrate) navigator.vibrate(20)
    if (bgmOn) {
      stopBGM()
      setBgmOn(false)
    } else {
      startBGM()
      setBgmOn(true)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="pixel-font text-[10px] text-slate-400 hover:text-white transition-colors mb-8 block"
        >
          {'<'} BACK
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block pixel-font text-[9px] text-primary-light bg-primary/10 px-4 py-2 border border-primary/30 mb-4">
            ⏱ 15 MIN RETIRE LIFE
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              退休模拟器
            </span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-sm">
            选择一个项目，体验退休生活。放下焦虑，感受宁静。
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleBGM}
            className={`mt-4 inline-flex items-center gap-2 pixel-font text-[10px] px-5 py-2 rounded-full border transition-colors ${
              bgmOn
                ? 'bg-primary/20 border-primary/40 text-primary-light'
                : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:text-white'
            }`}
          >
            {bgmOn ? '🔊' : '🔇'} 8-BIT BGM {bgmOn ? 'ON' : 'OFF'}
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {games.map((game, i) => (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sfxStart()
                if (navigator.vibrate) navigator.vibrate(30)
                navigate(game.path)
              }}
              className={`${game.bg} pixel-border ${game.border} p-6 text-left group relative overflow-hidden transition-all`}
            >
              {/* 像素 art 预览 */}
              <pre
                className="pixel-font text-[9px] leading-tight mb-4 opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ color: game.color }}
              >
                {game.art}
              </pre>

              <div className="pixel-font text-[10px] mb-1" style={{ color: game.color }}>
                {game.name}
              </div>
              <h3 className="text-lg font-semibold mb-1">{game.label}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{game.desc}</p>

              <div className="absolute top-3 right-3 pixel-font text-[8px] text-slate-600 group-hover:text-slate-400 transition-colors">
                {'>>'}
              </div>
            </motion.button>
          ))}
        </div>

        <p className="pixel-font text-[8px] text-slate-600 text-center mt-10">
          TIP: RETIREMENT IS NOT A RACE. TAKE YOUR TIME.
        </p>
      </main>
    </div>
  )
}
