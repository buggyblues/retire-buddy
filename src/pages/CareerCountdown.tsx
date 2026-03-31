import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Bot, Clock, TrendingUp, Zap } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAchievement } from '../hooks/useAchievement'

interface CareerResult {
  career: string
  replaceRate: number
  daysLeft: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  aiCapabilities: string[]
  humanAdvantage: string
  suggestion: string
}

const CAREER_DATABASE: Record<string, Omit<CareerResult, 'career'>> = {
  '程序员': { replaceRate: 78, daysLeft: 420, riskLevel: 'high', aiCapabilities: ['代码生成', '自动调试', 'Review 代码', '写测试'], humanAdvantage: '创造性架构设计', suggestion: '赶紧学 AI 提示工程，或者...直接退休 🏖️' },
  '设计师': { replaceRate: 65, daysLeft: 730, riskLevel: 'high', aiCapabilities: ['UI 生成', 'Logo 设计', '配色方案', '排版布局'], humanAdvantage: '品牌情感洞察', suggestion: '转型做 AI 艺术指导，或享受退休生活' },
  '产品经理': { replaceRate: 45, daysLeft: 1200, riskLevel: 'medium', aiCapabilities: ['需求分析', '用户画像', '数据分析', 'PRD 撰写'], humanAdvantage: '人际沟通协调', suggestion: '暂时安全，但建议提前规划退休理财' },
  '前端工程师': { replaceRate: 82, daysLeft: 300, riskLevel: 'critical', aiCapabilities: ['组件开发', '样式编写', '响应式适配', '性能优化'], humanAdvantage: '极端 edge case 处理', suggestion: '⚠️ 高危！建议立即开启退休模拟器' },
  '后端工程师': { replaceRate: 72, daysLeft: 500, riskLevel: 'high', aiCapabilities: ['API 开发', '数据库设计', '微服务架构', '运维自动化'], humanAdvantage: '复杂系统决策', suggestion: '还有一点时间，先规划退休旅行路线' },
  '数据分析师': { replaceRate: 85, daysLeft: 200, riskLevel: 'critical', aiCapabilities: ['报表生成', '趋势预测', '异常检测', '可视化'], humanAdvantage: '业务直觉判断', suggestion: '⚠️ 超高危！AI 已经比你快 100 倍了' },
  '会计': { replaceRate: 90, daysLeft: 150, riskLevel: 'critical', aiCapabilities: ['账目处理', '报税', '审计', '财务预测'], humanAdvantage: '合规咨询', suggestion: '🚨 最高警报！建议今天就退休' },
  '教师': { replaceRate: 35, daysLeft: 2000, riskLevel: 'low', aiCapabilities: ['知识传授', '作业批改', '个性化教学'], humanAdvantage: '人格影响与关怀', suggestion: '相对安全，但在线教育 AI 来势汹汹' },
  '医生': { replaceRate: 40, daysLeft: 1800, riskLevel: 'medium', aiCapabilities: ['影像诊断', '药方推荐', '手术规划'], humanAdvantage: '临床经验与人文关怀', suggestion: '短期安全，但 AI 诊断准确率已超过人类' },
  '销售': { replaceRate: 55, daysLeft: 900, riskLevel: 'medium', aiCapabilities: ['客户画像', '话术生成', '数据跟进', '自动外呼'], humanAdvantage: '人情世故', suggestion: '还能撑一阵，但 AI 销售机器人越来越强了' },
  '律师': { replaceRate: 60, daysLeft: 800, riskLevel: 'high', aiCapabilities: ['法律检索', '合同审查', '案例分析', '法律咨询'], humanAdvantage: '法庭辩论', suggestion: '大量基础工作将被替代，转型专注高端案件' },
  '运营': { replaceRate: 68, daysLeft: 600, riskLevel: 'high', aiCapabilities: ['内容生成', '用户运营', '数据分析', '活动策划'], humanAdvantage: '品牌感知', suggestion: '日常运营正在被 AI 接管，考虑退休吧' },
  '外卖骑手': { replaceRate: 50, daysLeft: 1000, riskLevel: 'medium', aiCapabilities: ['路线规划', '订单分配'], humanAdvantage: '复杂环境导航', suggestion: '等无人配送普及还有几年，暂时安全' },
  '作家': { replaceRate: 70, daysLeft: 550, riskLevel: 'high', aiCapabilities: ['文章生成', '故事创作', '翻译', '编辑润色'], humanAdvantage: '原创灵感与个人风格', suggestion: 'AI 写作已经很强了，转型做 IP 运营' },
}

function getDefaultResult(career: string): Omit<CareerResult, 'career'> {
  const hash = career.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const replaceRate = 40 + (hash % 50)
  return {
    replaceRate,
    daysLeft: Math.floor((100 - replaceRate) * 20),
    riskLevel: replaceRate > 80 ? 'critical' : replaceRate > 60 ? 'high' : replaceRate > 40 ? 'medium' : 'low',
    aiCapabilities: ['任务自动化', '数据处理', '决策辅助'],
    humanAdvantage: '不可预测的创造力',
    suggestion: replaceRate > 70 ? '建议认真考虑退休 🏖️' : '暂时安全，持续关注 AI 发展',
  }
}

const RISK_COLORS = {
  low: { bg: 'bg-green-900/30', text: 'text-green-400', label: '低风险' },
  medium: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', label: '中风险' },
  high: { bg: 'bg-orange-900/30', text: 'text-orange-400', label: '高风险' },
  critical: { bg: 'bg-red-900/30', text: 'text-red-400', label: '⚠️ 极危' },
}

export default function CareerCountdown() {
  const navigate = useNavigate()
  useAchievement('career')
  const [career, setCareer] = useState('')
  const [result, setResult] = useState<CareerResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleAnalyze = () => {
    if (!career.trim()) return
    setAnalyzing(true)
    setTimeout(() => {
      const data = CAREER_DATABASE[career.trim()] || getDefaultResult(career.trim())
      setResult({ career: career.trim(), ...data })
      setAnalyzing(false)
    }, 1500)
  }

  const risk = result ? RISK_COLORS[result.riskLevel] : null

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
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
            <h1 className="text-3xl sm:text-4xl font-bold">你的职业还能撑多久？</h1>
          </div>
          <p className="text-gray-400 text-sm">输入你的职业，看看 AI 什么时候接管你的工作</p>
        </motion.div>

        {/* 搜索框 */}
        <div className="max-w-lg mx-auto mb-10">
          <div className="flex gap-3">
            <input
              type="text"
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="输入你的职业，如：程序员、设计师、会计..."
              className="flex-1 px-5 py-4 bg-surface-light/50 border border-white/10 rounded-2xl text-white
                placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              disabled={!career.trim() || analyzing}
              className="px-6 py-4 bg-gradient-to-r from-danger to-orange-600 rounded-2xl text-white font-semibold
                shadow-lg shadow-danger/25 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {analyzing ? '分析中...' : '🔍 分析'}
            </motion.button>
          </div>

          {/* 热门职业标签 */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {Object.keys(CAREER_DATABASE).slice(0, 8).map(c => (
              <button
                key={c}
                onClick={() => { setCareer(c); }}
                className="px-3 py-1 bg-surface-light/50 border border-white/5 rounded-full text-xs text-gray-400
                  hover:text-white hover:border-white/20 transition-all"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 分析结果 */}
        <AnimatePresence mode="wait">
          {analyzing && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-5xl mb-4 inline-block"
              >
                🤖
              </motion.div>
              <p className="text-gray-400 text-lg">AI 正在评估你的职业前景...</p>
              <p className="text-gray-600 text-sm mt-2">（其实 AI 正在盘算怎么替代你）</p>
            </motion.div>
          )}

          {!analyzing && result && risk && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              {/* 风险等级大标题 */}
              <div className={`text-center p-8 rounded-3xl mb-8 ${risk.bg} border border-white/5`}>
                <div className={`text-6xl font-bold mb-2 ${risk.text}`}>
                  {result.replaceRate}%
                </div>
                <div className={`text-xl font-bold mb-1 ${risk.text}`}>
                  AI 替代概率
                </div>
                <div className="text-gray-400 text-sm">
                  你的职业「{result.career}」被 AI 替代的可能性
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 倒计时 */}
                <div className="bg-surface-light/50 rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <Clock size={16} />
                    预计被替代倒计时
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-accent mb-1 token-counter">
                      {result.daysLeft}
                    </div>
                    <div className="text-gray-400 text-sm">天</div>
                  </div>
                  <div className="mt-4 h-3 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${risk.text.includes('green') ? '#10b981' : risk.text.includes('yellow') ? '#f59e0b' : risk.text.includes('orange') ? '#f97316' : '#ef4444'}, transparent)`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.replaceRate}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* AI 能力 */}
                <div className="bg-surface-light/50 rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <Zap size={16} />
                    AI 已掌握的能力
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.aiCapabilities.map((cap, i) => (
                      <motion.span
                        key={cap}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="px-3 py-1 bg-red-900/30 border border-red-800/50 rounded-full text-sm text-red-300"
                      >
                        🤖 {cap}
                      </motion.span>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="text-xs text-gray-500 mb-1">人类仅存优势</div>
                    <div className="text-success text-sm">💚 {result.humanAdvantage}</div>
                  </div>
                </div>

                {/* 建议 */}
                <div className="md:col-span-2 bg-gradient-to-r from-primary/10 to-purple-900/10 rounded-2xl p-6 border border-primary/20">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                    <TrendingUp size={16} />
                    RetireBuddy 建议
                  </div>
                  <p className="text-lg text-gray-200">{result.suggestion}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/simulator')}
                    className="mt-4 px-6 py-3 bg-primary/20 border border-primary/30 rounded-xl text-primary-light text-sm font-medium
                      hover:bg-primary/30 transition-colors"
                  >
                    🏖️ 去体验退休生活
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
