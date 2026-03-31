import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAchievement } from '../../hooks/useAchievement'
import NextGameBanner from '../../components/NextGameBanner'
import { sfxCast, sfxBite, sfxCatch, sfxEscape, sfxCollect } from '../../hooks/use8bitAudio'
import BgmToggle from '../../components/BgmToggle'

interface CaughtFish {
  name: string
  art: string
  weight: string
  rarity: string
  color: string
}

const fishPool: (CaughtFish & { chance: number })[] = [
  { name: '沙丁鱼', art: '><>', weight: '0.3kg', rarity: 'COMMON', color: '#94a3b8', chance: 0.35 },
  { name: '鲈鱼', art: '><((°>', weight: '1.2kg', rarity: 'COMMON', color: '#a3e635', chance: 0.25 },
  { name: '鲤鱼', art: '>°)))><', weight: '2.5kg', rarity: 'UNCOMMON', color: '#22d3ee', chance: 0.15 },
  { name: '鲶鱼', art: '>゜))))彡', weight: '5.0kg', rarity: 'RARE', color: '#818cf8', chance: 0.10 },
  { name: '锦鲤', art: '✦><bg°>', weight: '3.0kg', rarity: 'LEGEND', color: '#fbbf24', chance: 0.05 },
  { name: '鲨鱼', art: '═╦═><>', weight: '50kg', rarity: 'EPIC', color: '#f472b6', chance: 0.03 },
  { name: '旧靴子', art: '  ┗┛', weight: '???', rarity: 'JUNK', color: '#475569', chance: 0.07 },
]

const rarityLabel: Record<string, string> = {
  COMMON: '普通', UNCOMMON: '优质', RARE: '稀有', LEGEND: '传说', EPIC: '史诗', JUNK: '垃圾',
}
const rarityBorder: Record<string, string> = {
  COMMON: 'border-slate-500', UNCOMMON: 'border-green-500', RARE: 'border-blue-500',
  LEGEND: 'border-amber-500', EPIC: 'border-pink-500', JUNK: 'border-slate-700',
}

type Phase = 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'caught' | 'escaped'

export default function FishingGame() {
  const navigate = useNavigate()
  useAchievement('fishing')
  const [phase, setPhase] = useState<Phase>('idle')
  const [catches, setCatches] = useState<CaughtFish[]>([])
  const [lastFish, setLastFish] = useState<CaughtFish | null>(null)
  const [combo, setCombo] = useState(0)
  const [tip, setTip] = useState('')
  const [waterIdx, setWaterIdx] = useState(0)
  const biteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const biteTs = useRef(0)

  // water animation
  useEffect(() => {
    const t = setInterval(() => setWaterIdx(i => (i + 1) % 3), 500)
    return () => clearInterval(t)
  }, [])

  // bite countdown: 2s to react
  useEffect(() => {
    if (phase !== 'bite') return
    sfxBite()
    if (navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 80])
    biteTs.current = Date.now()
    biteTimer.current = setTimeout(() => {
      sfxEscape()
      setCombo(0)
      setTip('太慢了…鱼跑了 💨')
      setPhase('escaped')
      setTimeout(() => { setPhase('idle'); setTip('') }, 2200)
    }, 2000)
    return () => { if (biteTimer.current) clearTimeout(biteTimer.current) }
  }, [phase])

  const rollFish = useCallback((ms: number): CaughtFish => {
    const bonus = Math.min(combo * 0.03, 0.15)
    let luck = Math.random()
    if (ms < 250) luck += 0.3 + bonus
    else if (ms < 500) luck += 0.12 + bonus
    else luck += bonus

    const r = Math.random()
    let acc = 0
    for (const f of fishPool) {
      acc += f.chance * (luck > 0.5 && f.rarity !== 'COMMON' && f.rarity !== 'JUNK' ? 2.2 : 1)
      if (r <= acc / (1 + (luck > 0.5 ? 0.6 : 0))) {
        const { chance: _, ...fish } = f
        return fish
      }
    }
    const { chance: _, ...fish } = fishPool[0]
    return fish
  }, [combo])

  const doCast = () => {
    if (phase !== 'idle') return
    sfxCast()
    if (navigator.vibrate) navigator.vibrate(20)
    setPhase('casting')
    setTimeout(() => {
      setPhase('waiting')
      setTimeout(() => setPhase('bite'), 1500 + Math.random() * 3000)
    }, 500)
  }

  const doPull = useCallback(() => {
    if (phase !== 'bite') return
    if (biteTimer.current) { clearTimeout(biteTimer.current); biteTimer.current = null }
    const ms = Date.now() - biteTs.current
    sfxCatch()
    if (navigator.vibrate) navigator.vibrate(50)
    setPhase('reeling')
    const fish = rollFish(ms)
    setLastFish(fish)
    setCatches(prev => [fish, ...prev])
    setCombo(c => c + 1)
    setTip(ms < 250 ? '⚡ 闪电出手！' : ms < 500 ? '👍 动作利落！' : '✓ 成功！')
    setTimeout(() => setPhase('caught'), 400)
    setTimeout(() => { setPhase('idle'); setLastFish(null); setTip('') }, 3200)
  }, [phase, rollFish])

  // tap anywhere during bite
  const onScreenTap = () => {
    if (phase === 'bite') doPull()
  }

  const water = [
    '~≈~~≈~≈≈~≈~~≈~≈~~≈~≈≈~~≈~~',
    '≈~~≈~~≈~~≈≈~≈~~≈~≈~~≈≈~≈~~',
    '~≈≈~~≈~≈~≈~~≈≈~~≈~≈~≈~~≈≈~',
  ]

  return (
    <div className="min-h-screen bg-slate-950 select-none" onClick={onScreenTap}>
      <BgmToggle />

      {/* header */}
      <div className="p-4">
        <button
          onClick={(e) => { e.stopPropagation(); sfxCollect(); if (navigator.vibrate) navigator.vibrate(15); navigate('/simulator') }}
          className="pixel-font text-[10px] text-slate-400 hover:text-white"
        >
          {'<'} 返回
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-12">
        <h2 className="pixel-font text-sm text-blue-400 text-center mb-0.5">
          🎣 悠闲钓鱼
        </h2>
        <p className="pixel-font text-[8px] text-slate-500 text-center mb-4">
          点击抛竿 → 等鱼上钩 → 屏幕闪烁时快点！越快鱼越稀有
        </p>

        {/* status bar */}
        <div className="flex justify-center gap-6 mb-3 pixel-font text-[9px]" style={{ minHeight: 18 }}>
          {combo > 0 && (
            <motion.span key={combo} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-amber-400">
              🔥 连击 ×{combo}
            </motion.span>
          )}
          {tip && (
            <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-green-400">
              {tip}
            </motion.span>
          )}
        </div>

        {/* ─── fishing scene ─── */}
        <div
          className={`pixel-panel rounded-none overflow-hidden relative mb-5 transition-all ${phase === 'bite' ? 'ring-2 ring-amber-400' : ''}`}
          style={{ height: 340 }}
        >
          {/* bite flash overlay */}
          {phase === 'bite' && (
            <motion.div
              className="absolute inset-0 z-40 pointer-events-none"
              animate={{ backgroundColor: ['rgba(251,191,36,0.18)', 'rgba(251,191,36,0)', 'rgba(251,191,36,0.18)'] }}
              transition={{ duration: 0.35, repeat: Infinity }}
            />
          )}

          {/* sky */}
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-indigo-950 to-slate-900" style={{ height: '42%' }}>
            <span className="absolute top-2 right-4 pixel-font text-slate-300 text-[10px]">●</span>
            <span className="absolute top-3 left-8 pixel-font text-slate-700 text-[8px]">·</span>
            <span className="absolute top-5 left-24 pixel-font text-slate-700 text-[8px]">·</span>

            {/* fishing rod */}
            {(phase === 'waiting' || phase === 'bite' || phase === 'reeling') && (
              <motion.pre
                className="absolute right-[30%] bottom-0 pixel-font text-[10px] text-amber-700 leading-none"
                animate={phase === 'bite' ? { rotate: [-3, 3, -3] } : {}}
                transition={{ duration: 0.12, repeat: Infinity }}
              >
                {'  /\n /\n/'}
              </motion.pre>
            )}
          </div>

          {/* waterline */}
          <pre className="absolute inset-x-0 pixel-font text-[9px] text-blue-500/50 leading-none z-10 pointer-events-none" style={{ top: '42%' }}>
            {water[waterIdx]}
          </pre>

          {/* underwater */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-blue-950 to-slate-950" style={{ top: '44%' }}>
            {/* line */}
            {(phase === 'waiting' || phase === 'bite') && (
              <div className="absolute top-0 left-[68%] w-px bg-slate-500/40" style={{ height: phase === 'bite' ? '55%' : '38%' }}>
                <motion.span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 pixel-font text-[10px] text-red-500"
                  animate={phase === 'bite' ? { y: [-4, 4], scale: [1, 1.3, 1] } : { y: [0, 3, 0] }}
                  transition={{ duration: phase === 'bite' ? 0.15 : 1.5, repeat: Infinity }}
                >●</motion.span>
              </div>
            )}

            {/* ambient fish while waiting */}
            {phase === 'waiting' && (
              <>
                <motion.span className="absolute pixel-font text-[10px] text-blue-400/30" style={{ top: '30%' }}
                  initial={{ left: '-8%' }} animate={{ left: '60%' }} transition={{ duration: 3.5, ease: 'easeInOut' }}
                >{'><>'}</motion.span>
                <motion.span className="absolute pixel-font text-[10px] text-cyan-400/20" style={{ top: '55%' }}
                  animate={{ left: ['105%', '-8%'] }} transition={{ duration: 7, repeat: Infinity, delay: 0.8 }}
                >{'<><'}</motion.span>
              </>
            )}

            {/* fish on hook */}
            {phase === 'bite' && (
              <motion.span className="absolute pixel-font text-lg text-amber-400 font-bold" style={{ top: '30%', left: '60%' }}
                animate={{ x: [-4, 4], rotate: [-8, 8] }} transition={{ duration: 0.18, repeat: Infinity }}
              >{'><>'}</motion.span>
            )}

            {/* seabed */}
            <div className="absolute bottom-0 inset-x-0">
              <pre className="pixel-font text-[8px] text-amber-900/40 text-center leading-none">{'▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓'}</pre>
              <pre className="pixel-font text-[8px] text-green-800/30 leading-none pl-3">{'  ψ   ψψ    ψ   ψψ  ψ   ψ'}</pre>
            </div>
          </div>

          {/* ─── center interaction UI ─── */}
          <div className="absolute inset-0 z-30 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {phase === 'idle' && (
                <motion.button
                  key="cast-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={(e) => { e.stopPropagation(); doCast() }}
                  className="pixel-btn bg-blue-900 border-blue-500 text-blue-300 px-10 py-4 text-sm cursor-pointer"
                >
                  🎣 抛竿
                </motion.button>
              )}

              {phase === 'casting' && (
                <motion.span key="casting-txt" initial={{ opacity: 0 }} animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.5, repeat: Infinity }} className="pixel-font text-xs text-slate-400"
                >抛竿中…</motion.span>
              )}

              {phase === 'waiting' && (
                <motion.div key="wait-txt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <motion.span animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity }}
                    className="pixel-font text-xs text-slate-500 block"
                  >🐟 等待鱼上钩…</motion.span>
                  <span className="pixel-font text-[7px] text-slate-600 block mt-2">鱼来了点任意位置！</span>
                </motion.div>
              )}

              {phase === 'bite' && (
                <motion.div key="bite-ui" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                  <motion.div animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 0.28, repeat: Infinity }}
                    className="pixel-font text-2xl text-amber-300 mb-3"
                  >🐟 上钩了！</motion.div>
                  <motion.button
                    animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                    className="pixel-btn bg-amber-800 border-amber-400 text-amber-200 px-12 py-4 text-base cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); doPull() }}
                  >快拉！</motion.button>
                  <motion.div className="h-1 bg-amber-500/40 rounded-full mt-3 w-44 mx-auto overflow-hidden">
                    <motion.div className="h-full bg-amber-400 rounded-full"
                      initial={{ width: '100%' }} animate={{ width: '0%' }}
                      transition={{ duration: 2, ease: 'linear' }}
                    />
                  </motion.div>
                </motion.div>
              )}

              {phase === 'escaped' && (
                <motion.div key="escaped-txt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                  <div className="pixel-font text-sm text-red-400 mb-1">鱼跑掉了！</div>
                  <div className="pixel-font text-[8px] text-slate-500">下次手快一点 🐟💨</div>
                </motion.div>
              )}

              {phase === 'reeling' && (
                <motion.span key="reel-txt" className="pixel-font text-xs text-amber-400"
                  animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.25, repeat: Infinity }}
                >收线中…</motion.span>
              )}

              {phase === 'caught' && lastFish && (
                <motion.div key="caught-card" initial={{ scale: 0, rotate: -5 }} animate={{ scale: 1, rotate: 0 }}
                  className={`pixel-panel rounded-none p-5 text-center border-2 ${rarityBorder[lastFish.rarity]}`}
                >
                  <pre className="pixel-font text-xl mb-1" style={{ color: lastFish.color }}>{lastFish.art}</pre>
                  <div className="pixel-font text-xs mb-0.5" style={{ color: lastFish.color }}>{lastFish.name}</div>
                  <div className="pixel-font text-[8px] text-slate-400">{lastFish.weight}</div>
                  <div className="pixel-font text-[7px] mt-1" style={{ color: lastFish.color }}>[{rarityLabel[lastFish.rarity]}]</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* shadow ad - unlocked at 5 catches */}
        {catches.length >= 5 && (
          <motion.a
            href="https://github.com/buggyblues/shadow"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="block pixel-panel rounded-none p-4 mb-5 border border-amber-500/30 bg-gradient-to-r from-amber-950/40 to-slate-950 hover:border-amber-400/60 transition-colors cursor-pointer no-underline"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <div>
                <div className="pixel-font text-[10px] text-amber-300 mb-1">🎣 钓鱼大师解锁了隐藏宝箱！</div>
                <div className="pixel-font text-[8px] text-slate-400">Shadow — 另一个开源项目，去 GitHub 看看 →</div>
              </div>
            </div>
          </motion.a>
        )}

        {/* catches */}
        <div className="pixel-panel rounded-none p-4">
          <h3 className="pixel-font text-[9px] text-slate-400 mb-3">
            已钓到: {catches.length}
          </h3>
          {catches.length === 0 ? (
            <p className="pixel-font text-[8px] text-slate-600 text-center py-4">
              还没钓到鱼，点「抛竿」开始 🎣
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {catches.map((fish, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className={`pixel-border p-2 text-center bg-slate-900 ${rarityBorder[fish.rarity]}`}
                >
                  <pre className="pixel-font text-[10px] mb-0.5 overflow-hidden" style={{ color: fish.color }}>{fish.art}</pre>
                  <div className="pixel-font text-[6px]" style={{ color: fish.color }}>{fish.name}</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <NextGameBanner currentGameId="fishing" />
      </div>
    </div>
  )
}
