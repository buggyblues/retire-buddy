import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Bot, TrendingUp, Zap } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAchievement } from '../hooks/useAchievement'

interface Industry {
  name: string
  icon: string
  progress: number
  speed: number // 每秒增长率
  status: string
}

const INITIAL_INDUSTRIES: Industry[] = [
  { name: '客服与电话销售', icon: '📞', progress: 92.3, speed: 0.008, status: '几乎完全接管' },
  { name: '数据录入', icon: '⌨️', progress: 96.7, speed: 0.003, status: '即将完全替代' },
  { name: '会计与审计', icon: '📊', progress: 85.4, speed: 0.012, status: '大规模替代中' },
  { name: '翻译与本地化', icon: '🌐', progress: 88.1, speed: 0.010, status: '高度自动化' },
  { name: '软件开发', icon: '💻', progress: 72.6, speed: 0.020, status: '加速替代中' },
  { name: '内容创作', icon: '✍️', progress: 78.3, speed: 0.015, status: '大量替代中' },
  { name: 'UI/UX 设计', icon: '🎨', progress: 65.2, speed: 0.018, status: '快速渗透中' },
  { name: '法律服务', icon: '⚖️', progress: 58.7, speed: 0.014, status: '逐步替代中' },
  { name: '金融分析', icon: '📈', progress: 80.5, speed: 0.013, status: '深度替代中' },
  { name: '医疗诊断', icon: '🏥', progress: 45.3, speed: 0.016, status: '快速进入中' },
  { name: '教育教学', icon: '📚', progress: 38.9, speed: 0.012, status: '逐步渗透中' },
  { name: '物流配送', icon: '🚚', progress: 52.1, speed: 0.011, status: '自动化推进中' },
  { name: '科学研究', icon: '🔬', progress: 42.8, speed: 0.019, status: 'AI 辅助大增' },
  { name: '艺术与音乐', icon: '🎵', progress: 55.6, speed: 0.017, status: '创作力爆发' },
  { name: '管理与决策', icon: '👔', progress: 35.2, speed: 0.010, status: '初步渗透' },
  { name: '心理咨询', icon: '🧠', progress: 28.4, speed: 0.008, status: '缓慢进入' },
  { name: '建筑工程', icon: '🏗️', progress: 32.1, speed: 0.009, status: '设计端渗透' },
  { name: '农业种植', icon: '🌾', progress: 41.5, speed: 0.007, status: '智能化推进' },
]

export default function AiTakeover() {
  const navigate = useNavigate()
  useAchievement('ai-takeover')
  const [industries, setIndustries] = useState(INITIAL_INDUSTRIES)
  const [totalProgress, setTotalProgress] = useState(0)
  const [sortBy, setSortBy] = useState<'progress' | 'speed'>('progress')
  const animRef = useRef<number>(0)
  const lastTickRef = useRef(Date.now())

  // 实时增长
  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      const delta = (now - lastTickRef.current) / 1000
      lastTickRef.current = now

      setIndustries(prev => prev.map(ind => ({
        ...ind,
        progress: Math.min(99.99, ind.progress + ind.speed * delta + (Math.random() - 0.3) * 0.005),
      })))

      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  // 总进度
  useEffect(() => {
    const avg = industries.reduce((sum, ind) => sum + ind.progress, 0) / industries.length
    setTotalProgress(avg)
  }, [industries])

  const sorted = [...industries].sort((a, b) =>
    sortBy === 'progress' ? b.progress - a.progress : b.speed - a.speed
  )

  const getProgressColor = (p: number) => {
    if (p > 90) return 'bg-red-500'
    if (p > 70) return 'bg-orange-500'
    if (p > 50) return 'bg-yellow-500'
    if (p > 30) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getTextColor = (p: number) => {
    if (p > 90) return 'text-red-400'
    if (p > 70) return 'text-orange-400'
    if (p > 50) return 'text-yellow-400'
    if (p > 30) return 'text-blue-400'
    return 'text-green-400'
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-400 hover:text-white transition-colors mb-6 block"
        >
          ← 返回
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 text-danger mb-3">
            <Bot size={28} />
            <h1 className="text-3xl sm:text-4xl font-bold">AI 接管进度</h1>
          </div>
          <p className="text-gray-400 text-sm mb-4">实时监控各行业被 AI 接管的进度</p>

          {/* 总进度 */}
          <div className="max-w-xl mx-auto bg-surface-light/50 rounded-2xl p-6 border border-red-900/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400 flex items-center gap-2">
                <TrendingUp size={14} />
                全行业总接管率
              </span>
              <span className="flex items-center gap-1 text-[10px] text-red-400">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="text-5xl font-bold text-danger token-counter mb-3">
              {totalProgress.toFixed(2)}%
            </div>
            <div className="h-4 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-full transition-all duration-100"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              当接管率达到 100%，人类将全面退休 🏖️
            </p>
          </div>
        </motion.div>

        {/* 排序 */}
        <div className="flex gap-2 mb-6 justify-center">
          <button
            onClick={() => setSortBy('progress')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1
              ${sortBy === 'progress'
                ? 'bg-danger/20 text-red-400 border border-red-800/50'
                : 'bg-surface-light/50 text-gray-400 border border-white/5'
              }`}
          >
            <TrendingUp size={14} />
            按接管率
          </button>
          <button
            onClick={() => setSortBy('speed')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1
              ${sortBy === 'speed'
                ? 'bg-accent/20 text-accent border border-amber-800/50'
                : 'bg-surface-light/50 text-gray-400 border border-white/5'
              }`}
          >
            <Zap size={14} />
            按接管速度
          </button>
        </div>

        {/* 行业列表 */}
        <div className="space-y-3">
          {sorted.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-surface-light/50 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl w-10 text-center flex-shrink-0">{ind.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{ind.name}</span>
                      <span className="text-[10px] text-gray-500">{ind.status}</span>
                    </div>
                    <span className={`font-bold token-counter text-sm ${getTextColor(ind.progress)}`}>
                      {ind.progress.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-100 ${getProgressColor(ind.progress)}`}
                      style={{ width: `${ind.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-600 text-xs mt-8"
        >
          * 数据基于 OpenRouter Token 消耗趋势模拟，仅供娱乐参考。<br />
          * 如果你的行业接管率超过 80%，建议尽快使用 RetireBuddy 模拟退休生活 🏖️
        </motion.p>
      </main>
    </div>
  )
}
