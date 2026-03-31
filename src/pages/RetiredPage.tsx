import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { RetireReason } from '../App'
import { PartyPopper, ArrowRight } from 'lucide-react'

interface Props {
  reason: RetireReason
  age: number | null
}

export default function RetiredPage({ reason, age }: Props) {
  const navigate = useNavigate()

  const configs = {
    underage: {
      emoji: '🎒',
      title: '恭喜！直接退休！',
      subtitle: `${age}岁？还没到打工的年纪就已经退休了！`,
      description: 'AI 都还没来得及替代你，你已经赢在了起跑线。去享受你的无忧童年/青少年吧！',
      gradient: 'from-green-400 to-emerald-600',
    },
    overage: {
      emoji: '🎉',
      title: '强制退休！',
      subtitle: `${age}岁？在 AI 时代，35+ 岁已经光荣退休！`,
      description: '别再卷了，AI 已经接管了你的工作。恭喜你正式进入退休生活，去过你想过的日子吧！',
      gradient: 'from-amber-400 to-orange-600',
    },
  }

  const config = reason ? configs[reason] : configs.overage

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* 🎊 Confetti Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              background: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#8b5cf6'][i % 6],
              left: `${Math.random() * 100}%`,
            }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 20 : 900,
              opacity: [1, 1, 0],
              rotate: Math.random() * 720 - 360,
              x: (Math.random() - 0.5) * 200,
            }}
            transition={{
              duration: 2.5 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="text-center"
      >
        <motion.div
          className="text-8xl mb-6"
          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          {config.emoji}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className={`text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
            {config.title}
          </h1>
          <p className="text-xl text-gray-300 mb-3">{config.subtitle}</p>
          <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
            {config.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/simulator')}
            className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark rounded-2xl text-white font-semibold
              shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow flex items-center gap-2 justify-center"
          >
            <PartyPopper size={20} />
            体验退休生活
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/void')}
            className="px-8 py-4 bg-surface-light border border-white/10 rounded-2xl text-gray-300 font-medium
              hover:bg-surface-lighter transition-colors flex items-center gap-2 justify-center"
          >
            一键放空
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
