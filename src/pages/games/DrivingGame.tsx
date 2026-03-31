import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAchievement } from '../../hooks/useAchievement'
import NextGameBanner from '../../components/NextGameBanner'
import { sfxCollect, sfxHit, sfxStart, startEngine, stopEngine, updateEngineSpeed } from '../../hooks/use8bitAudio'
import BgmToggle from '../../components/BgmToggle'

interface Obstacle {
  id: number
  lane: number // -1 left, 0 center, 1 right
  y: number // 0 (far) to 100 (close)
  type: 'cone' | 'rock' | 'tire'
}

interface Collectible {
  id: number
  lane: number
  y: number
  type: 'coin' | 'star' | 'fuel'
  points: number
}

const sceneries = [
  {
    name: 'HIGHWAY',
    sky: 'from-slate-800 to-slate-900',
    groundColor: '#1a1a2e',
    roadColor: '#374151',
    sideArt: ['▓▓', '||', '▓▓', '||'],
    skyArt: ['  ___', ' |___|', '  ___', ' |HH|'],
    skyColor: '#334155',
    sideColor: '#475569',
  },
  {
    name: 'COUNTRYSIDE',
    sky: 'from-green-950 to-emerald-950',
    groundColor: '#14532d',
    roadColor: '#57534e',
    sideArt: ['♠', '♣', '♠', '♣'],
    skyArt: [' /\\', '/  \\', '♠', '♣♠'],
    skyColor: '#166534',
    sideColor: '#15803d',
  },
  {
    name: 'BEACH ROAD',
    sky: 'from-blue-950 to-cyan-950',
    groundColor: '#164e63',
    roadColor: '#475569',
    sideArt: ['~', '≈', '~', '≈'],
    skyArt: ['  ⛵', '~≈~', ' ~', '≈~≈'],
    skyColor: '#0e7490',
    sideColor: '#06b6d4',
  },
  {
    name: 'MOUNTAIN',
    sky: 'from-stone-900 to-stone-950',
    groundColor: '#292524',
    roadColor: '#57534e',
    sideArt: ['/\\', '▲', '/\\', '▲'],
    skyArt: ['  /\\', ' /  \\', '/    \\', ' ▲▲'],
    skyColor: '#44403c',
    sideColor: '#57534e',
  },
  {
    name: 'DESERT',
    sky: 'from-amber-950 to-orange-950',
    groundColor: '#78350f',
    roadColor: '#92400e',
    sideArt: ['†', '¥', '†', '¥'],
    skyArt: ['  ☼', '†', ' ¥', '  †'],
    skyColor: '#b45309',
    sideColor: '#a16207',
  },
  {
    name: 'NIGHT SKY',
    sky: 'from-indigo-950 to-slate-950',
    groundColor: '#0f172a',
    roadColor: '#1e293b',
    sideArt: ['·', ' ', '·', ' '],
    skyArt: ['·  ★', ' ·', '★  ·', ' ★'],
    skyColor: '#4338ca',
    sideColor: '#312e81',
  },
]

const OBSTACLE_ART: Record<string, string> = { cone: '⚠', rock: '◆', tire: '◎' }
const COLLECTIBLE_ART: Record<string, string> = { coin: '●', star: '★', fuel: '⛽' }
const COLLECTIBLE_COLOR: Record<string, string> = { coin: '#fbbf24', star: '#f472b6', fuel: '#22d3ee' }

export default function DrivingGame() {
  const navigate = useNavigate()
  useAchievement('driving')
  const [driving, setDriving] = useState(true)
  const [distance, setDistance] = useState(0)
  const [speed, setSpeed] = useState(80)
  const [sceneIdx, setSceneIdx] = useState(0)
  const [lane, setLane] = useState(0) // -1 left, 0 center, 1 right
  const [score, setScore] = useState(0)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [collectibles, setCollectibles] = useState<Collectible[]>([])
  const [flash, setFlash] = useState<'red' | 'gold' | null>(null)
  const [combo, setCombo] = useState(0)

  const animRef = useRef(0)
  const lastRef = useRef(0)
  const nextObstacleRef = useRef(0)
  const nextCollectibleRef = useRef(0)
  const idRef = useRef(0)

  const scene = sceneries[sceneIdx]

  // Engine sound: start/stop with driving, update pitch with speed
  useEffect(() => {
    if (driving) {
      startEngine()
      updateEngineSpeed(speed)
    } else {
      stopEngine()
    }
    return () => { stopEngine() }
  }, [driving])

  useEffect(() => {
    if (driving) updateEngineSpeed(speed)
  }, [speed, driving])

  // Keyboard steering
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!driving) return
      if (e.key === 'ArrowLeft' || e.key === 'a') setLane(l => Math.max(l - 1, -1))
      if (e.key === 'ArrowRight' || e.key === 'd') setLane(l => Math.min(l + 1, 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [driving])

  const steerLeft = useCallback(() => { if (driving) { if (navigator.vibrate) navigator.vibrate(10); setLane(l => Math.max(l - 1, -1)) } }, [driving])
  const steerRight = useCallback(() => { if (driving) { if (navigator.vibrate) navigator.vibrate(10); setLane(l => Math.min(l + 1, 1)) } }, [driving])

  useEffect(() => {
    if (!driving) {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      return
    }
    const tick = (t: number) => {
      if (!lastRef.current) lastRef.current = t
      const dt = (t - lastRef.current) / 1000
      lastRef.current = t

      const speedFactor = speed / 80

      setDistance(d => {
        const nd = d + (speed / 3600) * dt
        if (Math.floor(nd / 50) !== Math.floor(d / 50)) {
          setSceneIdx(i => (i + 1) % sceneries.length)
        }
        return nd
      })

      // Spawn obstacles
      nextObstacleRef.current -= dt * speedFactor
      if (nextObstacleRef.current <= 0) {
        nextObstacleRef.current = 1.2 + Math.random() * 1.5
        const types: Obstacle['type'][] = ['cone', 'rock', 'tire']
        setObstacles(prev => [...prev, {
          id: idRef.current++,
          lane: Math.floor(Math.random() * 3) - 1,
          y: 0,
          type: types[Math.floor(Math.random() * types.length)],
        }])
      }

      // Spawn collectibles
      nextCollectibleRef.current -= dt * speedFactor
      if (nextCollectibleRef.current <= 0) {
        nextCollectibleRef.current = 2 + Math.random() * 2
        const types: { t: Collectible['type']; p: number }[] = [
          { t: 'coin', p: 10 }, { t: 'star', p: 25 }, { t: 'fuel', p: 5 },
        ]
        const pick = types[Math.floor(Math.random() * types.length)]
        setCollectibles(prev => [...prev, {
          id: idRef.current++,
          lane: Math.floor(Math.random() * 3) - 1,
          y: 0,
          type: pick.t,
          points: pick.p,
        }])
      }

      // Move obstacles & check collision
      setObstacles(prev => {
        const updated = prev.map(o => ({ ...o, y: o.y + dt * 60 * speedFactor })).filter(o => o.y < 110)
        return updated
      })

      setCollectibles(prev => {
        const updated = prev.map(c => ({ ...c, y: c.y + dt * 60 * speedFactor })).filter(c => c.y < 110)
        return updated
      })

      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(animRef.current); lastRef.current = 0 }
  }, [driving, speed])

  // Collision detection
  useEffect(() => {
    // Check obstacles
    setObstacles(prev => {
      const remaining: Obstacle[] = []
      let hit = false
      for (const o of prev) {
        if (o.y >= 80 && o.y <= 100 && o.lane === lane) {
          hit = true
        } else {
          remaining.push(o)
        }
      }
      if (hit) {
        setScore(s => Math.max(s - 20, 0))
        setCombo(0)
        sfxHit()
        setFlash('red')
        setTimeout(() => setFlash(null), 300)
      }
      return remaining
    })
    // Check collectibles
    setCollectibles(prev => {
      const remaining: Collectible[] = []
      let collected = false
      for (const c of prev) {
        if (c.y >= 75 && c.y <= 100 && c.lane === lane) {
          setScore(s => s + c.points)
          collected = true
        } else {
          remaining.push(c)
        }
      }
      if (collected) {
        setCombo(c => c + 1)
        sfxCollect()
        setFlash('gold')
        setTimeout(() => setFlash(null), 200)
      }
      return remaining
    })
  }, [lane, obstacles, collectibles])


  return (
    <div className="min-h-screen bg-surface">
      <BgmToggle />
      <div className="p-4 sm:p-6">
        <button
          onClick={() => { sfxCollect(); if (navigator.vibrate) navigator.vibrate(15); navigate('/simulator') }}
          className="pixel-font text-[10px] text-slate-400 hover:text-white transition-colors"
        >
          {'<'} BACK
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-2 pb-12">
        <h2 className="pixel-font text-sm text-amber-400 text-center mb-1">
          ROAD TRIP
        </h2>
        <p className="pixel-font text-[8px] text-slate-500 text-center mb-6">
          Endless road. Free soul.
        </p>

        {/* 驾驶视图 */}
        <div className={`pixel-panel rounded-none overflow-hidden min-h-[360px] relative mb-6 bg-gradient-to-b ${scene.sky}`}>

          {/* 场景名 */}
          <motion.div
            key={sceneIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-2 left-2 pixel-font text-[7px] z-10 bg-black/50 px-2 py-1"
            style={{ color: scene.skyColor }}
          >
            ▶ {scene.name}
          </motion.div>

          {/* 速度显示 */}
          <div className="absolute top-2 right-2 pixel-font text-right z-10">
            <div className="text-lg font-bold" style={{ color: speed > 120 ? '#ef4444' : '#94a3b8' }}>
              {driving ? speed : 0}
            </div>
            <div className="text-[7px] text-slate-500">KM/H</div>
          </div>

          {/* Score display */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 pixel-font text-center z-10">
            <div className="text-sm font-bold text-amber-400">{score}</div>
            <div className="text-[7px] text-slate-500">SCORE{combo > 1 ? ` ×${combo}` : ''}</div>
          </div>

          {/* Flash effect */}
          {flash && (
            <div className={`absolute inset-0 z-20 pointer-events-none ${flash === 'red' ? 'bg-red-500/20' : 'bg-amber-400/15'}`} />
          )}

          {/* 天空元素 */}
          <div className="absolute top-[10%] left-0 right-0 flex justify-around px-8 overflow-hidden h-[30%]">
            {scene.skyArt.map((art, i) => (
              <motion.span
                key={`${sceneIdx}-${i}`}
                className="pixel-font text-[10px]"
                style={{ color: scene.skyColor }}
                animate={driving ? { x: [0, -100 - i * 30] } : {}}
                transition={{ duration: 5 + i, repeat: Infinity, ease: 'linear' }}
              >
                {art}
              </motion.span>
            ))}
          </div>

          {/* 地平线 */}
          <div className="absolute top-[42%] left-0 right-0 h-px" style={{ background: scene.skyColor }} />

          {/* 路面 */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[58%]"
            style={{ background: scene.groundColor }}
          >
            {/* 透视道路 */}
            <div
              className="absolute inset-0"
              style={{
                background: scene.roadColor,
                clipPath: 'polygon(40% 0%, 60% 0%, 95% 100%, 5% 100%)',
              }}
            />

            {/* 道路中线 */}
            <div className="absolute inset-0 flex flex-col items-center pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="mb-3"
                  style={{
                    width: `${1 + i * 2}px`,
                    height: `${4 + i * 5}px`,
                    background: '#fbbf24',
                    opacity: 0.6,
                  }}
                  animate={driving ? {
                    y: [0, 40],
                    opacity: [0.6, 0],
                  } : {}}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: 'linear',
                  }}
                />
              ))}
            </div>

            {/* 路边元素 */}
            {driving && scene.sideArt.map((art, i) => (
              <motion.span
                key={`left-${i}`}
                className="absolute pixel-font text-xs"
                style={{ color: scene.sideColor }}
                animate={{
                  top: ['42%', '100%'],
                  left: ['38%', '-5%'],
                  opacity: [0, 0.5, 0],
                  scale: [0.3, 1.5],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              >
                {art}
              </motion.span>
            ))}
            {driving && scene.sideArt.map((art, i) => (
              <motion.span
                key={`right-${i}`}
                className="absolute pixel-font text-xs"
                style={{ color: scene.sideColor }}
                animate={{
                  top: ['42%', '100%'],
                  right: ['38%', '-5%'],
                  opacity: [0, 0.5, 0],
                  scale: [0.3, 1.5],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 + 0.25 }}
              >
                {art}
              </motion.span>
            ))}
          </div>

          {/* 车辆 (像素) */}
          <motion.pre
            className="absolute bottom-5 pixel-font text-[8px] text-white z-10 leading-none select-none"
            animate={driving ? { x: [-1, 1, -1, 0] } : {}}
            transition={driving ? { duration: 0.3, repeat: Infinity } : {}}
            style={{ left: `calc(${50 + lane * 15}% - 20px)` }}
          >
{`  ┌──┐
 ┌┤  ├┐
─┤├──┤├─
 └┤▓▓├┘
  └──┘`}
          </motion.pre>

          {/* Obstacles */}
          {obstacles.map(o => {
            const x = 50 + o.lane * 15
            const scale = 0.3 + o.y / 100 * 1.2
            return (
              <span
                key={o.id}
                className="absolute pixel-font z-10 text-red-400 pointer-events-none"
                style={{
                  left: `${x}%`,
                  top: `${42 + o.y * 0.55}%`,
                  transform: `translate(-50%,-50%) scale(${scale})`,
                  fontSize: 14,
                  opacity: Math.min(o.y / 20, 1),
                }}
              >
                {OBSTACLE_ART[o.type]}
              </span>
            )
          })}

          {/* Collectibles */}
          {collectibles.map(c => {
            const x = 50 + c.lane * 15
            const scale = 0.3 + c.y / 100 * 1.2
            return (
              <span
                key={c.id}
                className="absolute pixel-font z-10 pointer-events-none"
                style={{
                  left: `${x}%`,
                  top: `${42 + c.y * 0.55}%`,
                  transform: `translate(-50%,-50%) scale(${scale})`,
                  fontSize: 14,
                  color: COLLECTIBLE_COLOR[c.type],
                  opacity: Math.min(c.y / 20, 1),
                }}
              >
                {COLLECTIBLE_ART[c.type]}
              </span>
            )
          })}
        </div>

        {/* 仪表盘 */}
        <div className="pixel-panel rounded-none p-4 mb-4">
          <div className="grid grid-cols-4 gap-3 mb-4 text-center">
            <div>
              <div className="pixel-font text-[7px] text-slate-500 mb-1">DISTANCE</div>
              <div className="pixel-font text-sm text-white/80">{distance.toFixed(1)}<span className="text-[7px] text-slate-500"> km</span></div>
            </div>
            <div>
              <div className="pixel-font text-[7px] text-slate-500 mb-1">SCENE</div>
              <div className="pixel-font text-[9px]" style={{ color: scene.skyColor }}>{scene.name}</div>
            </div>
            <div>
              <div className="pixel-font text-[7px] text-slate-500 mb-1">SCORE</div>
              <div className="pixel-font text-sm text-amber-400">{score}</div>
            </div>
            <div>
              <div className="pixel-font text-[7px] text-slate-500 mb-1">COMBO</div>
              <div className="pixel-font text-sm text-pink-400">{combo > 0 ? `×${combo}` : '-'}</div>
            </div>
          </div>

          {/* 速度条 */}
          <div className="mb-4">
            <div className="flex justify-between pixel-font text-[7px] text-slate-500 mb-1">
              <span>SPEED</span>
              <span>{speed} KM/H</span>
            </div>
            <div className="pixel-border border-slate-600 bg-slate-900 h-5 relative overflow-hidden">
              <div
                className="h-full transition-all duration-200"
                style={{
                  width: `${((speed - 40) / 140) * 100}%`,
                  background: speed > 140 ? '#ef4444' : speed > 100 ? '#f59e0b' : '#22c55e',
                }}
              />
              <input
                type="range"
                min={40}
                max={180}
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* 控制 */}
          <div className="flex gap-3 mb-3">
            <button
            onClick={() => { sfxStart(); if (navigator.vibrate) navigator.vibrate(30); setDriving(!driving) }}
              className={`flex-1 pixel-btn py-3 text-[10px] ${
                driving
                  ? 'bg-amber-900 border-amber-500 text-amber-300'
                  : 'bg-green-900 border-green-500 text-green-300'
              }`}
            >
              {driving ? '■ STOP' : '▶ DRIVE'}
            </button>
            <button
              onClick={() => { sfxCollect(); if (navigator.vibrate) navigator.vibrate(15); setSceneIdx(i => (i + 1) % sceneries.length) }}
              className="pixel-btn bg-slate-800 border-slate-500 text-slate-300 px-4 py-3 text-[10px]"
            >
              ↻ ROUTE
            </button>
          </div>

          {/* Steering controls (mobile) */}
          <div className="flex gap-3">
            <button
              onClick={steerLeft}
              className={`flex-1 pixel-btn py-3 text-[12px] ${lane === -1 ? 'bg-blue-900 border-blue-400 text-blue-300' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
            >
              ← LEFT
            </button>
            <div className="flex items-center pixel-font text-[8px] text-slate-500 px-2">
              {lane === -1 ? '◀ · ·' : lane === 0 ? '· ▼ ·' : '· · ▶'}
            </div>
            <button
              onClick={steerRight}
              className={`flex-1 pixel-btn py-3 text-[12px] ${lane === 1 ? 'bg-blue-900 border-blue-400 text-blue-300' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
            >
              RIGHT →
            </button>
          </div>
          <div className="pixel-font text-[7px] text-slate-600 text-center mt-2">
            Use ← → or A/D keys to steer · Collect ★ · Avoid ⚠
          </div>
        </div>

        <NextGameBanner currentGameId="driving" />
      </div>
    </div>
  )
}
