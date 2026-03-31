import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Trophy, Lock, Star, Sparkles, Gift, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'

export interface Achievement {
  id: string
  icon: string
  name: string
  description: string
  howToUnlock: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// 成就ID到页面路径的映射
export const ACHIEVEMENT_PATHS: Record<string, string> = {
  'dashboard': '/dashboard',
  'decision-tree': '/decision-tree',
  'job-wall': '/job-wall',
  'doctor': '/doctor',
  'career': '/career',
  'day-schedule': '/day-schedule',
  'ai-takeover': '/ai-takeover',
  'certificate': '/certificate',
  'simulator': '/simulator',
  'plant': '/game/plant',
  'fishing': '/game/fishing',
  'aquarium': '/game/aquarium',
  'driving': '/game/driving',
  'meditation': '/meditation',
  'void': '/void',
  'agent-chat': '/dashboard', // agent-chat 在侧边栏，导航到 dashboard
}

// 每个玩法对应一个成就
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'dashboard', icon: '📊', name: '焦虑观测者', description: '查看了全球焦虑值看板', howToUnlock: '访问焦虑看板页面', rarity: 'common' },
  { id: 'decision-tree', icon: '🌳', name: '人生抉择', description: '完成退休决策树的选择', howToUnlock: '访问退休决策树页面', rarity: 'rare' },
  { id: 'job-wall', icon: '💼', name: '求职达人', description: '浏览过退休后的招聘墙', howToUnlock: '访问招聘墙页面', rarity: 'common' },
  { id: 'doctor', icon: '🏥', name: '补品达人', description: '完成一次 AI 问诊', howToUnlock: '访问看病页面', rarity: 'rare' },
  { id: 'career', icon: '⏰', name: '时间流逝', description: '查看了职业生涯倒计时', howToUnlock: '访问职业倒计时页面', rarity: 'common' },
  { id: 'day-schedule', icon: '📅', name: '退休规划师', description: '安排了退休日程', howToUnlock: '访问退休日程页面', rarity: 'common' },
  { id: 'ai-takeover', icon: '🤖', name: 'AI 觉醒', description: '见证了 AI 接管进度', howToUnlock: '访问 AI 接管页面', rarity: 'epic' },
  { id: 'certificate', icon: '📜', name: '持证退休', description: '生成了退休证书', howToUnlock: '访问退休证书页面', rarity: 'rare' },
  { id: 'simulator', icon: '🎮', name: '模拟人生', description: '体验了退休模拟器', howToUnlock: '访问模拟器页面', rarity: 'common' },
  { id: 'plant', icon: '🌱', name: '绿手指', description: '在植物养成中培育植物', howToUnlock: '玩一次植物养成游戏', rarity: 'rare' },
  { id: 'fishing', icon: '🎣', name: '垂钓翁', description: '在钓鱼游戏中甩出鱼竿', howToUnlock: '玩一次钓鱼游戏', rarity: 'rare' },
  { id: 'aquarium', icon: '🐠', name: '水族馆长', description: '拥有了自己的水族馆', howToUnlock: '玩一次养鱼游戏', rarity: 'epic' },
  { id: 'driving', icon: '🚗', name: '公路之王', description: '驾车穿越公路旅途', howToUnlock: '玩一次驾车游戏', rarity: 'epic' },
  { id: 'meditation', icon: '🧘', name: '禅定', description: '完成一次冥想呼吸', howToUnlock: '访问冥想呼吸页面', rarity: 'rare' },
  { id: 'void', icon: '🕳️', name: '虚空凝视', description: '在放空页中什么都不做', howToUnlock: '访问放空页面', rarity: 'legendary' },
  { id: 'agent-chat', icon: '💬', name: '灵魂对话', description: '和 AI Agent 进行了一次对话', howToUnlock: '在 Agent Chat 中发送一条消息', rarity: 'common' },
]

const RARITY_COLORS = {
  common: { bg: 'bg-slate-800/50', border: 'border-slate-600', text: 'text-slate-400', label: 'COMMON', glow: '' },
  rare: { bg: 'bg-blue-900/30', border: 'border-blue-600', text: 'text-blue-400', label: 'RARE', glow: 'shadow-blue-500/20' },
  epic: { bg: 'bg-purple-900/30', border: 'border-purple-600', text: 'text-purple-400', label: 'EPIC', glow: 'shadow-purple-500/20' },
  legendary: { bg: 'bg-amber-900/30', border: 'border-amber-500', text: 'text-amber-400', label: '✦ LEGENDARY', glow: 'shadow-amber-500/30' },
}

export function getUnlockedAchievements(): Set<string> {
  try {
    const data = localStorage.getItem('rb-achievements')
    if (data) return new Set(JSON.parse(data))
  } catch { /* */ }
  return new Set()
}

export function unlockAchievement(id: string) {
  const unlocked = getUnlockedAchievements()
  if (!unlocked.has(id)) {
    unlocked.add(id)
    localStorage.setItem('rb-achievements', JSON.stringify([...unlocked]))
  }
}

export default function Achievements() {
  const navigate = useNavigate()
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [sparkle, setSparkle] = useState<string | null>(null)
  const [unlockedSet, setUnlockedSet] = useState<Set<string>>(new Set())

  useEffect(() => {
    // 访问成就页面本身不算成就，但加载已有的
    setUnlockedSet(getUnlockedAchievements())
  }, [])

  const unlocked = ACHIEVEMENTS.filter(a => unlockedSet.has(a.id)).length
  const total = ACHIEVEMENTS.length
  const percentage = Math.round((unlocked / total) * 100)
  const allUnlocked = unlocked === total

  const filtered = ACHIEVEMENTS.filter(a => {
    if (filter === 'unlocked') return unlockedSet.has(a.id)
    if (filter === 'locked') return !unlockedSet.has(a.id)
    return true
  })

  // 随机 sparkle 效果
  useEffect(() => {
    const interval = setInterval(() => {
      const unlockedIds = ACHIEVEMENTS.filter(a => unlockedSet.has(a.id)).map(a => a.id)
      if (unlockedIds.length > 0) {
        setSparkle(unlockedIds[Math.floor(Math.random() * unlockedIds.length)])
        setTimeout(() => setSparkle(null), 1000)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [unlockedSet])

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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 text-accent mb-3">
            <Trophy size={28} />
            <h1 className="text-3xl sm:text-4xl font-bold">退休成就墙</h1>
          </div>
          <p className="text-gray-400 text-sm mb-2">游玩所有项目，解锁全部成就，赢取终极大奖！</p>
          <p className="text-gray-600 text-xs mb-6">每个功能页面对应一个成就，访问即可解锁</p>

          {/* 总进度 */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">已解锁 {unlocked}/{total}</span>
              <span className="text-accent font-bold">{percentage}%</span>
            </div>
            <div className="h-3 bg-surface-light rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-yellow-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* 🏆 大奖入口 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mb-8 rounded-2xl p-6 border-2 text-center transition-all ${
            allUnlocked
              ? 'bg-gradient-to-r from-amber-900/40 via-yellow-900/30 to-amber-900/40 border-amber-500/60 shadow-lg shadow-amber-500/20'
              : 'bg-surface-light/30 border-white/10'
          }`}
        >
          {allUnlocked ? (
            <>
              <motion.div
                animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-3"
              >
                🎁
              </motion.div>
              <h3 className="text-xl font-bold text-amber-300 mb-2">🎉 恭喜！你已解锁全部成就！</h3>
              <p className="text-sm text-amber-400/70 mb-4">终极大奖已解锁，点击领取你的专属奖品</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/grand-prize')}
                className="px-8 py-3 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-500/50 rounded-xl text-amber-200 font-bold text-lg flex items-center gap-2 mx-auto hover:from-amber-500/40 hover:to-yellow-500/40 transition-all"
              >
                <Gift size={20} />
                领取大奖
                <ChevronRight size={18} />
              </motion.button>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3 opacity-40">🎁</div>
              <h3 className="text-lg font-bold text-gray-500 mb-2">终极大奖</h3>
              <p className="text-sm text-gray-600 mb-2">
                解锁全部 {total} 个成就即可领取
              </p>
              <p className="text-xs text-gray-700">
                还差 <span className="text-amber-400 font-bold">{total - unlocked}</span> 个成就
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                {ACHIEVEMENTS.filter(a => !unlockedSet.has(a.id)).map(a => (
                  <span key={a.id} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-gray-500">
                    {a.icon} {a.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Filter */}
        <div className="flex gap-2 mb-8 justify-center">
          {(['all', 'unlocked', 'locked'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${filter === f
                  ? 'bg-primary/20 text-primary-light border border-primary/30'
                  : 'bg-surface-light/50 text-gray-400 border border-white/5 hover:text-white'
                }`}
            >
              {f === 'all' ? '全部' : f === 'unlocked' ? `已解锁 (${unlocked})` : `未解锁 (${total - unlocked})`}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((achievement, i) => {
            const rarity = RARITY_COLORS[achievement.rarity]
            const isUnlocked = unlockedSet.has(achievement.id)
            return (
              <motion.button
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAchievement(achievement)}
                className={`relative p-4 rounded-2xl border transition-all text-center group
                  ${isUnlocked
                    ? `${rarity.bg} ${rarity.border} ${rarity.glow ? `shadow-lg ${rarity.glow}` : ''}`
                    : 'bg-surface-light/30 border-white/5 opacity-60'
                  }`}
              >
                {/* Sparkle */}
                {sparkle === achievement.id && (
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: [0, 1.5, 0], rotate: 180 }}
                    className="absolute -top-2 -right-2 text-yellow-400"
                  >
                    <Sparkles size={20} />
                  </motion.div>
                )}

                <div className="text-3xl mb-2">
                  {isUnlocked ? achievement.icon : '🔒'}
                </div>
                <div className="text-xs font-medium text-white mb-1 line-clamp-1">
                  {achievement.name}
                </div>
                <div className={`text-[10px] ${rarity.text}`}>
                  {rarity.label}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedAchievement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
              onClick={() => setSelectedAchievement(null)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className={`max-w-sm w-full rounded-3xl p-8 border-2 text-center
                  ${RARITY_COLORS[selectedAchievement.rarity].bg}
                  ${RARITY_COLORS[selectedAchievement.rarity].border}`}
                onClick={e => e.stopPropagation()}
              >
                <div className="text-6xl mb-4">
                  {unlockedSet.has(selectedAchievement.id) ? selectedAchievement.icon : '🔒'}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedAchievement.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{selectedAchievement.description}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${RARITY_COLORS[selectedAchievement.rarity].text} border ${RARITY_COLORS[selectedAchievement.rarity].border}`}>
                  {RARITY_COLORS[selectedAchievement.rarity].label}
                </span>
                {unlockedSet.has(selectedAchievement.id) ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-center gap-1 text-green-400 text-sm">
                      <Star size={14} />
                      已解锁
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAchievement(null)
                        navigate(ACHIEVEMENT_PATHS[selectedAchievement.id] || '/dashboard')
                      }}
                      className="w-full py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl text-sm text-primary-light transition-all flex items-center justify-center gap-1"
                    >
                      前往页面 <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
                      <Lock size={14} />
                      尚未解锁
                    </div>
                    <p className="text-xs text-gray-600 bg-white/5 rounded-lg px-3 py-2">
                      💡 解锁方式：{selectedAchievement.howToUnlock}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedAchievement(null)
                        navigate(ACHIEVEMENT_PATHS[selectedAchievement.id] || '/dashboard')
                      }}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1"
                    >
                      去解锁 <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
