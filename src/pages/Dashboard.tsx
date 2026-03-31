import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, Clock, RefreshCw, Zap, Sparkles,
  Gamepad2, Eclipse, AlertTriangle, GitBranch, Trophy, ChevronRight, Shuffle,
  Bot, Heart, Briefcase, CalendarDays, FileText, Wind, Star
} from 'lucide-react'
import Navbar from '../components/Navbar'
import WorkButton from '../components/WorkButton'
import { useTokenData, formatTokenCount, formatPreciseCountdown } from '../hooks/useTokenData'
import { useAchievement } from '../hooks/useAchievement'
import { getUnlockedAchievements, ACHIEVEMENTS, ACHIEVEMENT_PATHS } from '../pages/Achievements'

interface Props {
  age: number | null
}

function AnxietyGauge({ level }: { level: number }) {
  const color = level >= 100 ? '#dc2626' : level > 85 ? '#ef4444' : level > 70 ? '#f59e0b' : level > 50 ? '#eab308' : '#10b981'
  const label = level >= 100 ? '💀 爆表' : level > 85 ? '极度焦虑' : level > 70 ? '高度焦虑' : level > 50 ? '中度焦虑' : '轻微焦虑'
  const circumference = 2 * Math.PI * 50
  const offset = circumference * (1 - level / 100)

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.3s ease-out, stroke 0.3s ease-out',
              filter: level > 70 ? `drop-shadow(0 0 6px ${color})` : 'none',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold tabular-nums"
            style={{
              color,
              transition: 'color 0.3s ease-out',
              textShadow: level > 70 ? `0 0 10px ${color}` : 'none',
            }}
          >
            {level}
          </span>
          <span className="text-xs text-gray-400 mt-1">{label}</span>
        </div>
      </div>
    </div>
  )
}

export function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-[2px] h-16">
      {data.map((val, i) => {
        const h = ((val - min) / range) * 100
        return (
          <motion.div
            key={i}
            className="flex-1 bg-primary/60 rounded-t-sm min-w-[3px] hover:bg-primary transition-colors"
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(h, 5)}%` }}
            transition={{ duration: 0.5, delay: i * 0.02 }}
          />
        )
      })}
    </div>
  )
}

// 实时 Token 计数器组件
function LiveTokenCounter({ value, color = 'text-white' }: { value: number; color?: string }) {
  return (
    <span className={`text-2xl sm:text-3xl font-bold ${color} token-counter`}>
      {formatTokenCount(value)}
    </span>
  )
}

// Token 弹幕组件 - 不断飘出 +xxx
function TokenDanmaku({ rate }: { rate: number }) {
  const [particles, setParticles] = useState<{ id: number; value: string; x: number; color: string }[]>([])
  const idRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      // 每次生成 1~2 个弹幕
      const count = Math.random() > 0.5 ? 2 : 1
      const newParticles = Array.from({ length: count }, () => {
        const val = Math.floor(rate * (0.2 + Math.random() * 1.5))
        const formatted = val >= 1e6 ? `+${(val / 1e6).toFixed(1)}M` : `+${(val / 1e3).toFixed(0)}K`
        const colors = ['text-green-400', 'text-emerald-400', 'text-lime-400', 'text-teal-400', 'text-cyan-400']
        return {
          id: idRef.current++,
          value: formatted,
          x: 10 + Math.random() * 60,
          color: colors[Math.floor(Math.random() * colors.length)],
        }
      })
      setParticles(prev => [...prev.slice(-12), ...newParticles])
    }, 600 + Math.random() * 400)

    return () => clearInterval(interval)
  }, [rate])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 40, x: `${p.x}%` }}
            animate={{ opacity: 0, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className={`absolute text-sm font-bold ${p.color} whitespace-nowrap`}
            style={{ left: `${p.x}%` }}
          >
            {p.value}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// 毫秒级退休倒计时组件
function RetireCountdown({ timestamp }: { timestamp: number }) {
  const [countdown, setCountdown] = useState(formatPreciseCountdown(timestamp))

  useEffect(() => {
    const tick = () => {
      setCountdown(formatPreciseCountdown(timestamp))
      rafId = requestAnimationFrame(tick)
    }
    let rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [timestamp])

  return (
    <div className="text-center py-4">
      <div className="flex items-center justify-center gap-2 mb-3">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent token-counter">
            {countdown.days}
          </div>
          <span className="text-xs text-gray-500">天</span>
        </div>
        <span className="text-2xl text-gray-600 font-light">:</span>
        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-4xl font-bold text-primary-light token-counter">
            {String(countdown.hours).padStart(2, '0')}
          </div>
          <span className="text-xs text-gray-500">时</span>
        </div>
        <span className="text-2xl text-gray-600 font-light">:</span>
        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-4xl font-bold text-primary-light token-counter">
            {String(countdown.minutes).padStart(2, '0')}
          </div>
          <span className="text-xs text-gray-500">分</span>
        </div>
        <span className="text-2xl text-gray-600 font-light">:</span>
        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-4xl font-bold text-accent token-counter">
            {String(countdown.seconds).padStart(2, '0')}
          </div>
          <span className="text-xs text-gray-500">秒</span>
        </div>
        <span className="text-xl text-gray-700 font-light">.</span>
        {/* Milliseconds */}
        <div className="flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-danger token-counter animate-ticker">
            {String(countdown.ms).padStart(3, '0')}
          </div>
          <span className="text-xs text-gray-500">毫秒</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-1">
        预计 {new Date(timestamp).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <p className="text-gray-600 text-xs">
        随着 AI Token 消耗持续增长，退休日期会逐渐提前 📈
      </p>
    </div>
  )
}

// 长进度条组件
function RetireProgressBar({ timestamp, age }: { timestamp: number; age: number | null }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const workStartAge = 18
    const currentAge = age || 25 // 默认25岁
    const workedYears = Math.max(0, currentAge - workStartAge)
    
    const update = () => {
      const diff = Math.max(0, timestamp - Date.now())
      const remainingYears = diff / (365.25 * 86400000)
      const totalWorkYears = workedYears + remainingYears
      const p = totalWorkYears > 0 
        ? Math.min(99.99, Math.max(0.01, (workedYears / totalWorkYears) * 100))
        : 0.01
      setProgress(p)
      rafId = requestAnimationFrame(update)
    }
    let rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [timestamp, age])

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>退休进度</span>
        <span className="token-counter text-accent font-bold">{progress.toFixed(4)}%</span>
      </div>
      <div className="h-4 bg-surface rounded-full overflow-hidden relative border border-white/5">
        {/* 进度条背景网格 */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-white/[0.03]" />
          ))}
        </div>
        {/* 进度填充 */}
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7, #f59e0b)',
            transition: 'width 0.1s linear',
          }}
        >
          {/* 流光动画 */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
        {/* 闪烁的头部 */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white/80 rounded-full"
          style={{
            left: `${progress}%`,
            boxShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 16px rgba(99,102,241,0.4)',
            animation: 'ticker 0.5s ease-in-out infinite',
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-600 mt-1">
        <span>🏢 {age ? `${18}岁` : '18岁'} 开始上班</span>
        <span>🏖️ 退休！</span>
      </div>
    </div>
  )
}

function AiBadge() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => window.dispatchEvent(new CustomEvent('trigger-derivation-show'))}
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[9px] text-primary-light/70 hover:text-primary-light hover:bg-primary/20 transition-colors cursor-pointer ml-1"
      title="点击查看 AI 数据推导过程"
    >
      <Sparkles size={10} />
      AI 大数据计算
    </motion.button>
  )
}

export function StatCard({ icon: Icon, label, value, sub, color = 'text-white', live = false, danmakuRate = 0 }: {
  icon: typeof TrendingUp
  label: string
  value: string | number
  sub?: string
  color?: string
  live?: boolean
  danmakuRate?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-light/50 backdrop-blur rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors relative overflow-hidden"
    >
      {danmakuRate > 0 && <TokenDanmaku rate={danmakuRate} />}
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3 relative z-10">
        <Icon size={16} />
        {label}
        {live && (
          <span className="flex items-center gap-1 text-[10px] text-green-400">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            LIVE
          </span>
        )}
      </div>
      <div className="relative z-10">
        {live ? (
          <LiveTokenCounter value={value as number} color={color} />
        ) : (
          <div className={`text-2xl sm:text-3xl font-bold ${color}`}>{value as string}</div>
        )}
      </div>
      {sub && <div className="text-xs text-gray-500 mt-1 relative z-10">{sub}</div>}
    </motion.div>
  )
}

// 所有功能 - 用于换一换
const ALL_FEATURES = [
  { path: '/decision-tree', label: '退休决策树', desc: '12 道灵魂拷问，测测你的退休之路', icon: GitBranch, iconColor: 'text-orange-400', bg: 'bg-gradient-to-br from-orange-500/10 to-red-500/10', border: 'border-orange-500/20 hover:border-orange-500/40' },
  { path: '/simulator', label: 'Retire 模拟器', desc: '体验退休生活，植物养成、钓鱼、养鱼...', icon: Gamepad2, iconColor: 'text-primary-light', bg: 'bg-surface-light/50', border: 'border-white/5 hover:border-primary/30' },
  { path: '/void', label: '一键放空', desc: '黑色虚空，旋转光晕，暂时忘却一切', icon: Eclipse, iconColor: 'text-purple-400', bg: 'bg-surface-light/50', border: 'border-white/5 hover:border-purple-500/30' },
  { path: '/career', label: '职业倒计时', desc: '查看你的职业被 AI 替代的倒计时', icon: Bot, iconColor: 'text-red-400', bg: 'bg-gradient-to-br from-red-500/10 to-pink-500/10', border: 'border-red-500/20 hover:border-red-500/40' },
  { path: '/doctor', label: '去看病', desc: '8 道问诊，买点补品压压惊', icon: Heart, iconColor: 'text-pink-400', bg: 'bg-gradient-to-br from-pink-500/10 to-rose-500/10', border: 'border-pink-500/20 hover:border-pink-500/40' },
  { path: '/ai-takeover', label: 'AI 接管进度', desc: '实时监控各行业被 AI 接管的进度', icon: TrendingUp, iconColor: 'text-red-400', bg: 'bg-gradient-to-br from-red-500/10 to-orange-500/10', border: 'border-red-500/20 hover:border-red-500/40' },
  { path: '/job-wall', label: '招聘墙', desc: '1000 个岗位，投递必被拒', icon: Briefcase, iconColor: 'text-blue-400', bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20 hover:border-blue-500/40' },
  { path: '/day-schedule', label: '退休日程', desc: '苹果日历风格的退休一周安排', icon: CalendarDays, iconColor: 'text-green-400', bg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10', border: 'border-green-500/20 hover:border-green-500/40' },
  { path: '/meditation', label: '冥想呼吸', desc: '4-4-6-2 呼吸法，暂时忘却焦虑', icon: Wind, iconColor: 'text-cyan-400', bg: 'bg-gradient-to-br from-cyan-500/10 to-teal-500/10', border: 'border-cyan-500/20 hover:border-cyan-500/40' },
  { path: '/certificate', label: '退休证书', desc: 'Canvas 绘制你的退休证书', icon: FileText, iconColor: 'text-indigo-400', bg: 'bg-gradient-to-br from-indigo-500/10 to-violet-500/10', border: 'border-indigo-500/20 hover:border-indigo-500/40' },
]

export default function Dashboard({ age }: Props) {
  const navigate = useNavigate()
  useAchievement('dashboard')
  const { data, loading, refresh } = useTokenData()
  const [showTokenExplain, setShowTokenExplain] = useState(false)
  const [unlockedSet, setUnlockedSet] = useState<Set<string>>(new Set())
  const [randomFeatures, setRandomFeatures] = useState<typeof ALL_FEATURES>([])

  useEffect(() => {
    setUnlockedSet(getUnlockedAchievements())
  }, [])

  const unlockedCount = ACHIEVEMENTS.filter(a => unlockedSet.has(a.id)).length
  const totalCount = ACHIEVEMENTS.length
  const achievePercent = Math.round((unlockedCount / totalCount) * 100)

  const shuffleFeatures = useCallback(() => {
    const shuffled = [...ALL_FEATURES].sort(() => Math.random() - 0.5)
    setRandomFeatures(shuffled.slice(0, 3))
  }, [])

  useEffect(() => {
    shuffleFeatures()
  }, [shuffleFeatures])

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-light via-accent to-primary-light bg-clip-text text-transparent">
                RetireBuddy
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/20 text-primary-light border border-primary/30 rounded-full tracking-wider">
                AI
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              AI 驱动的退休预测引擎 · 实时焦虑监测 · 成就系统 · 退休模拟{age ? ` · ${age}岁` : ''}
              <a
                href="https://github.com/buggyblues/retire-buddy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 ml-2 text-gray-500 hover:text-primary-light transition-colors"
              >
                <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                <span className="text-xs">免费开源</span>
              </a>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WorkButton />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-surface-light border border-white/10 rounded-xl
                text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              刷新
            </motion.button>
          </div>
        </div>

        {/* 🏆 终极大奖横幅 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 rounded-2xl p-4 sm:p-5 border relative overflow-hidden ${
            unlockedCount === totalCount
              ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-amber-500/40'
              : 'bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 border-purple-500/20'
          }`}
        >
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <motion.span
                className="text-3xl flex-shrink-0"
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {unlockedCount === totalCount ? '🎁' : '🏆'}
              </motion.span>
              <div className="min-w-0">
                <h3 className="text-white font-bold text-sm sm:text-base">
                  {unlockedCount === totalCount ? '🎉 恭喜！你已解锁全部成就！' : '完成全部成就，解锁终极大奖'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {unlockedCount === totalCount
                    ? '点击领取你的退休大奖吧~'
                    : `已解锁 ${unlockedCount}/${totalCount} 个成就 · 还差 ${totalCount - unlockedCount} 个`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Mini progress */}
              <div className="hidden sm:block w-32">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${unlockedCount === totalCount ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-gradient-to-r from-purple-500 to-indigo-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${achievePercent}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="text-[10px] text-gray-500 text-right mt-0.5">{achievePercent}%</div>
              </div>
              {unlockedCount === totalCount ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/grand-prize')}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl text-sm font-bold text-black shadow-lg shadow-amber-500/30"
                >
                  领取大奖 →
                </motion.button>
              ) : (
                <button
                  onClick={() => navigate('/achievements')}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  查看成就 <ChevronRight size={12} />
                </button>
              )}
            </div>
          </div>
          {/* Shimmer decoration */}
          {unlockedCount === totalCount && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.div>

        {/* 焦虑指数 + Token 消耗 合并卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface-light/50 backdrop-blur rounded-2xl p-6 border border-white/5 mb-8 relative overflow-hidden"
        >
          <TokenDanmaku rate={Math.floor(data.cumulative / 100000000)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
            {/* Left: Anxiety */}
            <div className="flex flex-col items-center">
              <h3 className="text-gray-400 text-sm mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className={data.anxietyLevel > 70 ? 'text-red-400 animate-pulse' : ''} />
                全球焦虑指数
                <span className="flex items-center gap-1 text-[10px] text-red-400">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  LIVE
                </span>
              </h3>
              <AnxietyGauge level={data.anxietyLevel} />
              <p className="text-gray-600 text-[10px] mt-3 text-center">基于每日 Token 消耗量对数折算 · 实时波动中</p>
              <div className="mt-1 text-center"><AiBadge /></div>
            </div>
            {/* Right: Token */}
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-gray-400 text-sm mb-4 flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                全球 Token 累计消耗
                <span className="flex items-center gap-1 text-[10px] text-green-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  LIVE
                </span>
              </h3>
              <LiveTokenCounter value={data.cumulative} color="text-danger" />
              <p className="text-gray-500 text-xs mt-2">all time global total</p>
              <div className="mt-1"><AiBadge /></div>
              {/* 翻译翻译 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTokenExplain(!showTokenExplain)}
                className="mt-4 px-4 py-2 bg-amber-500/15 border border-amber-500/30 rounded-full text-xs text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1.5 font-medium"
              >
                🤔 翻译翻译，什么叫 Token？
              </motion.button>
            </div>
          </div>
          {/* Token explanation panel */}
          <AnimatePresence>
            {showTokenExplain && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative z-10"
              >
                <div className="mt-6 pt-5 border-t border-white/5">
                  <div className="max-w-2xl mx-auto space-y-3 text-sm leading-relaxed">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">🍕</span>
                      <p className="text-gray-300"><span className="text-white font-bold">Token 就是 AI 的食物。</span>每次你跟 AI 说话、让它写代码、画图，AI 都要吃掉一堆 Token。</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">📈</span>
                      <p className="text-gray-300">全世界的人每天都在<span className="text-amber-400 font-medium">疯狂喂 AI</span>，Token 消耗量以指数级增长...</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">🔗</span>
                      <p className="text-gray-300">
                        AI 吃的越多 → <span className="text-red-400">AI 越聪明</span> → 它能干的活越多 → 你能干的活越少 → <span className="text-red-400 font-bold">你就被退休了</span> 🏖️
                      </p>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 text-center">
                      <p className="text-red-300 text-xs font-medium">💡 简单来说：AI 的每一口饭，都在吃掉你的工作。Token 消耗越多，你退休越快。</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 退休倒计时 & 我的成就 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 退休倒计时 - 精确到毫秒 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-primary/10 to-purple-900/20 backdrop-blur rounded-2xl p-6 border border-primary/20"
          >
            <h3 className="text-gray-400 text-sm mb-4 flex items-center gap-2">
              <Clock size={16} />
              预计退休日期
              <span className="flex items-center gap-1 text-[10px] text-accent">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                ms精度
              </span>
              <AiBadge />
            </h3>
            <RetireCountdown timestamp={data.retireTimestamp} />
            {/* 长进度条 */}
            <div className="mt-4">
              <RetireProgressBar timestamp={data.retireTimestamp} age={age} />
            </div>
          </motion.div>

          {/* 我的成就 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-light/50 backdrop-blur rounded-2xl p-6 border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                我的成就
              </h3>
              <button
                onClick={() => navigate('/achievements')}
                className="text-xs text-primary-light hover:text-white transition-colors flex items-center gap-1"
              >
                查看全部 <ChevronRight size={12} />
              </button>
            </div>

            {/* 进度条 */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400">已解锁 {unlockedCount}/{totalCount}</span>
                <span className="text-amber-400 font-bold">{achievePercent}%</span>
              </div>
              <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${achievePercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* 成就图标网格 */}
            <div className="grid grid-cols-4 gap-2">
              {ACHIEVEMENTS.map(a => {
                const isUnlocked = unlockedSet.has(a.id)
                return (
                  <button
                    key={a.id}
                    onClick={() => navigate(ACHIEVEMENT_PATHS[a.id] || '/dashboard')}
                    className={`rounded-lg flex items-center gap-1.5 px-2 py-1.5 text-left transition-all hover:scale-105 ${
                      isUnlocked
                        ? 'bg-white/5 hover:bg-white/10'
                        : 'bg-white/[0.02] opacity-40'
                    }`}
                  >
                    <span className="text-sm flex-shrink-0">{isUnlocked ? a.icon : '🔒'}</span>
                    <span className={`text-[10px] leading-tight truncate ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                      {a.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* 换一换 - 随机功能推荐 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm flex items-center gap-2">
              <Star size={16} className="text-primary-light" />
              探索更多功能
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, rotate: 180 }}
              onClick={shuffleFeatures}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-light/50 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Shuffle size={12} />
              换一换
            </motion.button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AnimatePresence mode="wait">
              {randomFeatures.map((feat) => (
                <motion.button
                  key={feat.path}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(feat.path)}
                  className={`${feat.bg} backdrop-blur rounded-2xl p-5 border ${feat.border} transition-all text-left group`}
                >
                  <feat.icon size={22} className={`mb-2 group-hover:scale-110 transition-transform ${feat.iconColor}`} />
                  <h3 className="font-semibold text-sm mb-1">{feat.label}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* shimmer 动画 */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
