import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const GAME_ORDER = [
  { id: 'plant', name: 'PLANT SIM', label: '🌱 植物养成', path: '/game/plant', color: '#22c55e' },
  { id: 'fishing', name: 'FISHING', label: '🎣 悠闲钓鱼', path: '/game/fishing', color: '#3b82f6' },
  { id: 'aquarium', name: 'AQUARIUM', label: '🐠 养鱼观赏', path: '/game/aquarium', color: '#06b6d4' },
  { id: 'driving', name: 'ROAD TRIP', label: '🚗 长途旅行', path: '/game/driving', color: '#f59e0b' },
]

export default function NextGameBanner({ currentGameId }: { currentGameId: string }) {
  const navigate = useNavigate()
  const currentIdx = GAME_ORDER.findIndex(g => g.id === currentGameId)
  const nextGame = GAME_ORDER[(currentIdx + 1) % GAME_ORDER.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 pixel-panel rounded-none p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="pixel-font text-[8px] text-slate-500 mb-1">试试下一个游戏</div>
          <div className="pixel-font text-[10px]" style={{ color: nextGame.color }}>
            {nextGame.label}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(30)
            navigate(nextGame.path)
          }}
          className="pixel-btn py-2 px-4 text-[9px]"
          style={{
            borderColor: nextGame.color,
            color: nextGame.color,
            backgroundColor: `${nextGame.color}15`,
          }}
        >
          GO {'>>'}
        </motion.button>
      </div>
      {/* All games row */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
        {GAME_ORDER.filter(g => g.id !== currentGameId).map(game => (
          <button
            key={game.id}
            onClick={() => navigate(game.path)}
            className="flex-1 text-center py-1.5 pixel-font text-[8px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors"
            style={{ color: game.color }}
          >
            {game.label.split(' ')[0]}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
