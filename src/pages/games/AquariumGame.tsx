import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAchievement } from '../../hooks/useAchievement'
import NextGameBanner from '../../components/NextGameBanner'
import BgmToggle from '../../components/BgmToggle'
import { sfxCollect, sfxCatch, sfxPlant } from '../../hooks/use8bitAudio'

interface PixelFish {
  id: number
  art: string
  artFlip: string
  name: string
  color: string
  x: number
  y: number
  speed: number
  dir: number
  hunger: number // 0-100, 0 = starving
  happiness: number // 0-100
  size: number // 1-3 growth level
  fedCount: number
}

interface FoodParticle {
  id: number
  x: number
  y: number
  eaten: boolean
  size: number  // 1-3 visual size
  sway: number  // horizontal drift speed
  fallSpeed: number // vertical fall speed
}

const fishShop = [
  { art: '><>', artFlip: '<><', name: 'GUPPY', color: '#60a5fa', cost: 0, rarity: 'COMMON' },
  { art: '><((°>', artFlip: '<°))><', name: 'BASS', color: '#4ade80', cost: 10, rarity: 'COMMON' },
  { art: '>°))彡', artFlip: '彡((°<', name: 'CARP', color: '#fbbf24', cost: 20, rarity: 'UNCOMMON' },
  { art: '><{{°>', artFlip: '<°}}><', name: 'PUFFER', color: '#c084fc', cost: 30, rarity: 'UNCOMMON' },
  { art: '~><>', artFlip: '<><~', name: 'EEL', color: '#22d3ee', cost: 40, rarity: 'RARE' },
  { art: '>==>', artFlip: '<==<', name: 'SWORD', color: '#f472b6', cost: 60, rarity: 'RARE' },
  { art: '♦><>', artFlip: '<><♦', name: 'ANGEL', color: '#fb923c', cost: 80, rarity: 'EPIC' },
  { art: '-<><', artFlip: '><>-', name: 'SHRIMP', color: '#f87171', cost: 50, rarity: 'RARE' },
]

const RARITY_COLOR: Record<string, string> = {
  COMMON: '#94a3b8',
  UNCOMMON: '#4ade80',
  RARE: '#60a5fa',
  EPIC: '#c084fc',
}

export default function AquariumGame() {
  const navigate = useNavigate()
  useAchievement('aquarium')

  const [coins, setCoins] = useState(30)
  const [fishes, setFishes] = useState<PixelFish[]>([
    { id: 1, ...fishShop[0], x: 20, y: 30, speed: 0.4, dir: 1, hunger: 80, happiness: 70, size: 1, fedCount: 0 },
    { id: 2, ...fishShop[1], x: 60, y: 55, speed: 0.3, dir: -1, hunger: 60, happiness: 60, size: 1, fedCount: 0 },
    { id: 3, ...fishShop[3], x: 40, y: 70, speed: 0.25, dir: 1, hunger: 70, happiness: 65, size: 1, fedCount: 0 },
  ])
  const [food, setFood] = useState<FoodParticle[]>([])
  const [showShop, setShowShop] = useState(false)
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([])
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number }[]>([])
  const [waterFrame, setWaterFrame] = useState(0)
  const [totalFed, setTotalFed] = useState(0)
  const [selectedFish, setSelectedFish] = useState<PixelFish | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const tankRef = useRef<HTMLDivElement>(null)

  // Achievements / milestones
  const uniqueTypes = new Set(fishes.map(f => f.name)).size
  const avgHappiness = fishes.length > 0 ? Math.round(fishes.reduce((s, f) => s + f.happiness, 0) / fishes.length) : 0
  const maxSizeFish = fishes.filter(f => f.size >= 3).length

  // Water animation
  useEffect(() => {
    const t = setInterval(() => setWaterFrame(f => (f + 1) % 3), 500)
    return () => clearInterval(t)
  }, [])

  // Coin generation from happy fish
  useEffect(() => {
    const t = setInterval(() => {
      setFishes(prev => {
        let coinGain = 0
        prev.forEach(f => {
          if (f.happiness > 60) coinGain += 1
          if (f.happiness > 80) coinGain += 1
          if (f.size >= 3) coinGain += 1
        })
        if (coinGain > 0) setCoins(c => c + coinGain)
        return prev
      })
    }, 3000)
    return () => clearInterval(t)
  }, [])

  // Fish movement + hunger decay + chase food
  useEffect(() => {
    const interval = setInterval(() => {
      setFishes(prev => {
        // Read current food for chasing
        let currentFood: FoodParticle[] = []
        setFood(f => { currentFood = f; return f })

        return prev.map(fish => {
          let nx = fish.x + fish.speed * fish.dir * (0.8 + fish.size * 0.1)
          let nd = fish.dir

          // If hungry and food exists, swim toward nearest food
          const nearbyFood = currentFood.filter(f => !f.eaten)
          if (fish.hunger < 70 && nearbyFood.length > 0) {
            let nearest = nearbyFood[0]
            let minDist = Infinity
            for (const f of nearbyFood) {
              const d = Math.abs(f.x - fish.x) + Math.abs(f.y - fish.y)
              if (d < minDist) { minDist = d; nearest = f }
            }
            // Swim toward food
            const dx = nearest.x - fish.x
            const dy = nearest.y - fish.y
            const chaseSpeed = fish.hunger < 30 ? 1.2 : 0.6
            nx = fish.x + Math.sign(dx) * Math.min(Math.abs(dx), chaseSpeed)
            nd = dx > 0 ? 1 : -1

            // Also move vertically toward food
            const newY = fish.y + Math.sign(dy) * Math.min(Math.abs(dy), chaseSpeed * 0.8)
            fish = { ...fish, y: Math.max(12, Math.min(82, newY)) }
          }

          if (nx > 88) { nd = -1; nx = 88 }
          if (nx < 2) { nd = 1; nx = 2 }
          const ny = fish.y + Math.sin(Date.now() * 0.0008 + fish.id * 2) * 0.25

        // Hunger decreases over time
        let newHunger = Math.max(0, fish.hunger - 0.03)
        // Happiness tied to hunger
        let newHappiness = fish.happiness
        if (newHunger < 20) {
          newHappiness = Math.max(0, newHappiness - 0.05)
        } else if (newHunger > 60) {
          newHappiness = Math.min(100, newHappiness + 0.01)
        }

        // Growth
        let newSize = fish.size
        if (fish.fedCount >= 15 && fish.size < 3) newSize = 3
        else if (fish.fedCount >= 6 && fish.size < 2) newSize = 2

        return {
          ...fish,
          x: nx,
          y: Math.max(12, Math.min(82, ny)),
          dir: nd,
          hunger: newHunger,
          happiness: newHappiness,
          size: newSize,
        }
      })
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Food falling + fish eating
  useEffect(() => {
    const t = setInterval(() => {
      setFood(prev => {
        const updated = prev
          .map(f => ({
            ...f,
            y: f.y + f.fallSpeed,
            x: f.x + Math.sin(Date.now() * 0.003 + f.id) * f.sway,
          }))
          .filter(f => f.y < 95 && !f.eaten)

        // Check if fish eat food
        setFishes(fishPrev =>
          fishPrev.map(fish => {
            let ate = false
            updated.forEach(fp => {
              if (!fp.eaten && Math.abs(fish.x - fp.x) < 8 && Math.abs(fish.y - fp.y) < 8) {
                fp.eaten = true
                ate = true
              }
            })
            if (ate) {
              setTotalFed(t => t + 1)
              return {
                ...fish,
                hunger: Math.min(100, fish.hunger + 20),
                happiness: Math.min(100, fish.happiness + 5),
                fedCount: fish.fedCount + 1,
              }
            }
            return fish
          })
        )

        return updated.filter(f => !f.eaten)
      })
    }, 100)
    return () => clearInterval(t)
  }, [])

  // Auto bubbles
  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() > 0.5) {
        const id = Date.now()
        setBubbles(b => [...b, { id, x: 10 + Math.random() * 80, y: 85 }])
        setTimeout(() => setBubbles(b => b.filter(bb => bb.id !== id)), 3000)
      }
    }, 1500)
    return () => clearInterval(t)
  }, [])

  const dropFood = useCallback((clickX: number, clickY: number) => {
    // Scatter 5-8 food particles in a spread pattern
    const count = 5 + Math.floor(Math.random() * 4)
    const newFood: FoodParticle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + Math.random() + i,
      x: clickX + (Math.random() - 0.5) * 16, // spread ±8%
      y: clickY + (Math.random() - 0.5) * 4,
      eaten: false,
      size: 1 + Math.floor(Math.random() * 3),
      sway: (Math.random() - 0.5) * 0.3,
      fallSpeed: 0.3 + Math.random() * 0.4,
    }))
    setFood(prev => [...prev, ...newFood])

    // Splash effect
    const splashId = Date.now()
    setSplashes(prev => [...prev, { id: splashId, x: clickX, y: clickY }])
    setTimeout(() => setSplashes(prev => prev.filter(s => s.id !== splashId)), 600)
  }, [])

  const handleTankClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tankRef.current) return
    const rect = tankRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    if (y < 10) return // above water
    sfxCollect()
    dropFood(x, y)
    if (navigator.vibrate) navigator.vibrate(10)
  }, [dropFood])

  const addFish = (item: typeof fishShop[number]) => {
    if (coins < item.cost) {
      setMessage('金币不够！让鱼开心来赚更多金币 🪙')
      setTimeout(() => setMessage(null), 2000)
      return
    }
    if (fishes.length >= 12) {
      setMessage('鱼缸满了！最多 12 条鱼')
      setTimeout(() => setMessage(null), 2000)
      return
    }
    setCoins(c => c - item.cost)
    setFishes(prev => [...prev, {
      id: Date.now(),
      ...item,
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 55,
      speed: 0.15 + Math.random() * 0.4,
      dir: Math.random() > 0.5 ? 1 : -1,
      hunger: 80,
      happiness: 70,
      size: 1,
      fedCount: 0,
    }])
    setShowShop(false)
  }

  const feedAll = () => {
    // Scatter food from 3 points across the top
    const points = [25, 50, 75]
    points.forEach((cx, pi) => {
      setTimeout(() => {
        const count = 4 + Math.floor(Math.random() * 3)
        const newFood: FoodParticle[] = Array.from({ length: count }, (_, i) => ({
          id: Date.now() + Math.random() + pi * 10 + i,
          x: cx + (Math.random() - 0.5) * 20,
          y: 8 + Math.random() * 4,
          eaten: false,
          size: 1 + Math.floor(Math.random() * 3),
          sway: (Math.random() - 0.5) * 0.3,
          fallSpeed: 0.3 + Math.random() * 0.4,
        }))
        setFood(prev => [...prev, ...newFood])
        const splashId = Date.now() + pi
        setSplashes(prev => [...prev, { id: splashId, x: cx, y: 10 }])
        setTimeout(() => setSplashes(prev => prev.filter(s => s.id !== splashId)), 600)
      }, pi * 150)
    })
    if (navigator.vibrate) navigator.vibrate([20, 50, 20, 50, 20])
  }

  const waterLines = [
    '~≈~≈~~≈~≈≈~~≈~≈~~≈~≈≈~~≈~≈~~≈',
    '≈~~≈~≈~~≈≈~≈~~≈~≈~~≈≈~≈~~≈~≈~',
    '~≈≈~~≈~≈~≈~~≈≈~~≈~≈~≈~~≈≈~~≈~',
  ]

  const sizeScale = (s: number) => s === 3 ? 'text-base sm:text-lg' : s === 2 ? 'text-sm' : 'text-xs sm:text-sm'

  return (
    <div className="min-h-screen bg-slate-950">
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
        <h2 className="pixel-font text-sm text-cyan-400 text-center mb-1">
          AQUARIUM
        </h2>
        <p className="pixel-font text-[8px] text-slate-500 text-center mb-2">
          Feed · Grow · Collect them all!
        </p>

        {/* Stats bar */}
        <div className="flex justify-center gap-5 mb-4 pixel-font text-[8px]">
          <span className="text-amber-400">🪙 {coins}</span>
          <span className="text-cyan-400">🐟 {fishes.length}/12</span>
          <span className="text-green-400">📖 {uniqueTypes}/{fishShop.length}</span>
          <span className="text-pink-400">😊 {avgHappiness}%</span>
        </div>

        {/* Goals */}
        <div className="pixel-panel rounded-none p-3 mb-4">
          <div className="pixel-font text-[7px] text-slate-500 mb-2">GOALS</div>
          <div className="grid grid-cols-3 gap-2 pixel-font text-[7px]">
            <div className={`p-1.5 text-center border ${uniqueTypes >= fishShop.length ? 'border-green-500 text-green-400 bg-green-950/30' : 'border-slate-700 text-slate-500'}`}>
              {uniqueTypes >= fishShop.length ? '✓' : '○'} 收集全部 {fishShop.length} 种鱼
            </div>
            <div className={`p-1.5 text-center border ${maxSizeFish >= 3 ? 'border-green-500 text-green-400 bg-green-950/30' : 'border-slate-700 text-slate-500'}`}>
              {maxSizeFish >= 3 ? '✓' : '○'} 养大 3 条鱼
            </div>
            <div className={`p-1.5 text-center border ${avgHappiness >= 80 ? 'border-green-500 text-green-400 bg-green-950/30' : 'border-slate-700 text-slate-500'}`}>
              {avgHappiness >= 80 ? '✓' : '○'} 平均快乐 80+
            </div>
          </div>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pixel-font text-[9px] text-amber-400 text-center mb-2 bg-amber-950/30 border border-amber-800 py-2"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fish tank - clickable to drop food */}
        <div
          ref={tankRef}
          onClick={handleTankClick}
          className="pixel-panel rounded-none overflow-hidden min-h-[420px] relative mb-4 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 cursor-crosshair select-none"
        >
          {/* Water surface */}
          <pre className="pixel-font text-[8px] text-cyan-500/30 leading-none overflow-hidden">
            {waterLines[waterFrame]}
          </pre>

          {/* Fish count & coins */}
          <div className="absolute top-2 right-2 pixel-font text-[8px] text-cyan-400/60 bg-black/40 px-2 py-1 z-10">
            🐟{fishes.length} · 🪙{coins}
          </div>

          {/* Tap hint */}
          <div className="absolute top-2 left-2 pixel-font text-[7px] text-slate-600 z-10">
            TAP TO FEED
          </div>

          {/* Bubbles */}
          <AnimatePresence>
            {bubbles.map(b => (
              <motion.span
                key={b.id}
                className="absolute pixel-font text-[8px] text-white/20 pointer-events-none"
                initial={{ left: `${b.x}%`, top: `${b.y}%`, opacity: 0.4 }}
                animate={{ top: '2%', opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, ease: 'linear' }}
              >
                °
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Splash effects */}
          <AnimatePresence>
            {splashes.map(s => (
              <motion.div
                key={s.id}
                className="absolute pointer-events-none z-20"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                initial={{ opacity: 1, scale: 0.3 }}
                animate={{ opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative w-8 h-8 -ml-4 -mt-4">
                  {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <motion.span
                      key={i}
                      className="absolute left-1/2 top-1/2 text-[6px] text-amber-300/80"
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{
                        x: Math.cos(angle * Math.PI / 180) * 12,
                        y: Math.sin(angle * Math.PI / 180) * 8,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      •
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Food particles */}
          {food.map(fp => {
            const foodChar = fp.size === 3 ? '●' : fp.size === 2 ? '◆' : '•'
            const fontSize = fp.size === 3 ? 'text-[10px]' : fp.size === 2 ? 'text-[8px]' : 'text-[6px]'
            return (
              <motion.span
                key={fp.id}
                className={`absolute pixel-font ${fontSize} text-amber-400 pointer-events-none z-10`}
                style={{ left: `${fp.x}%`, top: `${fp.y}%` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
              >
                {foodChar}
              </motion.span>
            )
          })}

          {/* Fish */}
          {fishes.map(fish => {
            const hungerColor = fish.hunger < 20 ? 'bg-red-500' : fish.hunger < 50 ? 'bg-yellow-500' : 'bg-green-500'
            return (
              <div
                key={fish.id}
                className={`absolute pixel-font transition-all duration-100 select-none cursor-pointer ${sizeScale(fish.size)}`}
                style={{
                  left: `${fish.x}%`,
                  top: `${fish.y}%`,
                  color: fish.color,
                  filter: fish.hunger < 15 ? 'grayscale(0.5)' : 'none',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFish(selectedFish?.id === fish.id ? null : fish)
                }}
              >
                {fish.dir > 0 ? fish.art : fish.artFlip}
                {/* Hunger indicator */}
                {fish.hunger < 30 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px]">
                    {fish.hunger < 10 ? '💀' : '😰'}
                  </span>
                )}
                {/* Mini hunger bar */}
                <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-slate-800 rounded-full overflow-hidden" style={{ width: 20 }}>
                  <div className={`h-full ${hungerColor}`} style={{ width: `${fish.hunger}%` }} />
                </div>
              </div>
            )
          })}

          {/* Seaweed & bottom */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <pre className="pixel-font text-[10px] text-green-800/40 leading-none px-2">
              {' ψ    ψψ   ψ     ψψ   ψ    ψψ'}
            </pre>
            <pre className="pixel-font text-[8px] text-amber-900/30 leading-none">
              {'▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓'}
            </pre>
            <pre className="pixel-font text-[8px] text-amber-950/40 leading-none">
              {'████████████████████████████████'}
            </pre>
          </div>
        </div>

        {/* Selected fish info */}
        <AnimatePresence>
          {selectedFish && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pixel-panel rounded-none p-3 mb-4 overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <pre className="pixel-font text-lg" style={{ color: selectedFish.color }}>
                  {selectedFish.art}
                </pre>
                <div className="flex-1 pixel-font text-[8px]">
                  <div className="text-sm mb-1" style={{ color: selectedFish.color }}>{selectedFish.name}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
                    <span>HUNGER: <span className={selectedFish.hunger < 20 ? 'text-red-400' : 'text-green-400'}>{Math.floor(selectedFish.hunger)}%</span></span>
                    <span>HAPPY: <span className={selectedFish.happiness < 30 ? 'text-red-400' : 'text-green-400'}>{Math.floor(selectedFish.happiness)}%</span></span>
                    <span>SIZE: {'★'.repeat(selectedFish.size)}{'☆'.repeat(3 - selectedFish.size)}</span>
                    <span>FED: {selectedFish.fedCount}x</span>
                  </div>
                  {selectedFish.size < 3 && (
                    <div className="text-[7px] text-slate-500 mt-1">
                      Feed {(selectedFish.size < 2 ? 6 : 15) - selectedFish.fedCount} more times to grow!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button bar */}
        <div className="flex gap-3 mb-3">
          <button
            onClick={() => { sfxCollect(); if (navigator.vibrate) navigator.vibrate(15); setShowShop(!showShop) }}
            className="flex-1 pixel-btn bg-cyan-900 border-cyan-500 text-cyan-300 py-3 text-[10px]"
          >
            + BUY FISH
          </button>
          <button
            onClick={() => { sfxPlant(); if (navigator.vibrate) navigator.vibrate(20); feedAll() }}
            className="flex-1 pixel-btn bg-amber-900 border-amber-500 text-amber-300 py-3 text-[10px]"
          >
            °° FEED ALL
          </button>
        </div>

        {/* Fish shop */}
        <AnimatePresence>
          {showShop && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pixel-panel rounded-none p-4 overflow-hidden mb-4"
            >
              <h3 className="pixel-font text-[8px] text-slate-400 mb-3">FISH SHOP · 🪙 {coins}</h3>
              <div className="grid grid-cols-4 gap-2">
                {fishShop.map((item, i) => {
                  const canAfford = coins >= item.cost
                  return (
                    <button
                      key={i}
                      onClick={() => { sfxCatch(); if (navigator.vibrate) navigator.vibrate(30); addFish(item) }}
                      disabled={!canAfford}
                      className={`pixel-border p-3 transition-colors text-center ${
                        canAfford
                          ? 'border-slate-600 bg-slate-900 hover:bg-slate-800'
                          : 'border-slate-800 bg-slate-950 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <pre className="pixel-font text-[10px] mb-1" style={{ color: item.color }}>
                        {item.art}
                      </pre>
                      <div className="pixel-font text-[6px]" style={{ color: item.color }}>{item.name}</div>
                      <div className="pixel-font text-[6px] mt-0.5" style={{ color: RARITY_COLOR[item.rarity] }}>
                        {item.cost === 0 ? 'FREE' : `🪙${item.cost}`}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collection progress */}
        <div className="pixel-panel rounded-none p-3">
          <div className="pixel-font text-[8px] text-slate-400 mb-2 flex justify-between">
            <span>COLLECTION {uniqueTypes}/{fishShop.length}</span>
            <span className="text-amber-400/60">FED: {totalFed} TIMES</span>
          </div>
          <div className="grid grid-cols-8 gap-1">
            {fishShop.map((item, i) => {
              const owned = fishes.some(f => f.name === item.name)
              return (
                <div
                  key={i}
                  className={`pixel-border p-1 text-center text-[8px] ${
                    owned ? 'border-slate-600 bg-slate-900' : 'border-slate-800 bg-slate-950 opacity-30'
                  }`}
                  style={{ color: owned ? item.color : '#334155' }}
                >
                  <pre className="pixel-font text-[7px] overflow-hidden leading-tight">
                    {owned ? item.art : '???'}
                  </pre>
                </div>
              )
            })}
          </div>
        </div>

        <NextGameBanner currentGameId="aquarium" />
      </div>
    </div>
  )
}
