import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, AlertTriangle, CheckCircle2, ChevronRight, Pill, Brain, ShieldAlert, ShoppingCart, Clock, CreditCard, Gift, Calendar, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAchievement } from '../hooks/useAchievement'

// ===== 问诊问题 =====
interface Question {
  id: string
  question: string
  options: { label: string; value: 'good' | 'bad' | 'terrible' }[]
}

const questions: Question[] = [
  {
    id: 'sleep',
    question: '你每天的睡眠质量如何？',
    options: [
      { label: '😴 每晚 8 小时，沾枕即睡，从不失眠', value: 'good' },
      { label: '😐 偶尔失眠，凌晨 1-2 点刷手机', value: 'bad' },
      { label: '💀 什么是睡眠？我已经 72 小时没合眼了', value: 'terrible' },
    ],
  },
  {
    id: 'exercise',
    question: '你的运动习惯怎么样？',
    options: [
      { label: '💪 每周 5 次健身，马甲线清晰可见', value: 'good' },
      { label: '🚶 从工位走到茶水间算运动吗？', value: 'bad' },
      { label: '🦥 上次运动是去年体检爬楼梯', value: 'terrible' },
    ],
  },
  {
    id: 'diet',
    question: '你的饮食结构如何？',
    options: [
      { label: '🥗 均衡膳食，五谷杂粮，定时定量', value: 'good' },
      { label: '🍜 外卖为主，偶尔有蔬菜（葱花算吗？）', value: 'bad' },
      { label: '🍕 纯碳水战士，泡面可乐是主食', value: 'terrible' },
    ],
  },
  {
    id: 'sunlight',
    question: '你每天晒太阳的时间有多少？',
    options: [
      { label: '☀️ 每天户外 1 小时以上，阳光充足', value: 'good' },
      { label: '🌥️ 通勤路上晒几分钟...如果不是地铁的话', value: 'bad' },
      { label: '🧛 我已经 3 个月没见过太阳了', value: 'terrible' },
    ],
  },
  {
    id: 'stress',
    question: '你的工作压力如何？',
    options: [
      { label: '😎 毫无压力，工作生活完美平衡', value: 'good' },
      { label: '😰 有些压力，偶尔焦虑失眠', value: 'bad' },
      { label: '🤯 每天都在崩溃边缘，头发掉得比代码还快', value: 'terrible' },
    ],
  },
  {
    id: 'social',
    question: '你的社交状况如何？',
    options: [
      { label: '🥳 朋友多多，每周社交活动丰富', value: 'good' },
      { label: '🤷 只和同事聊天，话题仅限工作', value: 'bad' },
      { label: '🏠 已经忘记上次和真人说话是什么时候了', value: 'terrible' },
    ],
  },
  {
    id: 'gut',
    question: '你的肠胃健康吗？',
    options: [
      { label: '✅ 非常好，每天规律顺畅', value: 'good' },
      { label: '😬 时好时坏，偶尔胀气或不舒服', value: 'bad' },
      { label: '💊 常年拉肚子/便秘，IBS 老朋友了', value: 'terrible' },
    ],
  },
  {
    id: 'screen',
    question: '你每天的屏幕时间是多久？',
    options: [
      { label: '📵 严格控制，工作外不超过 2 小时', value: 'good' },
      { label: '📱 工作 + 刷手机大概 10 小时', value: 'bad' },
      { label: '🖥️ 醒着的每一秒都在看屏幕，闭眼还有残影', value: 'terrible' },
    ],
  },
]

// ===== 补品数据库 =====
interface Supplement {
  name: string
  icon: string
  deficiencyRate: string  // 大众缺失率
  worstConsequence: string  // 缺失最严重后果
  relatedQuestions: string[]  // 关联的问题ID
  description: string
}

const supplements: Supplement[] = [
  {
    name: '维生素 D',
    icon: '☀️',
    deficiencyRate: '87.3%',
    worstConsequence: '骨质疏松 → 骨折 → 长期卧床 → 肌肉萎缩 → 永久丧失行动能力',
    relatedQuestions: ['sunlight', 'exercise'],
    description: '阳光维生素。你不晒太阳，骨头先垮。全球 87% 的上班族缺乏维生素D。',
  },
  {
    name: '维生素 B 族',
    icon: '⚡',
    deficiencyRate: '72.8%',
    worstConsequence: '神经系统退化 → 手脚麻木 → 记忆力严重衰退 → 不可逆脑损伤',
    relatedQuestions: ['stress', 'sleep', 'diet'],
    description: 'B1/B6/B12 全家桶。压力越大消耗越快，你的神经在裸奔。',
  },
  {
    name: '维生素 C',
    icon: '🍊',
    deficiencyRate: '53.6%',
    worstConsequence: '免疫力崩溃 → 反复感染 → 牙龈出血 → 坏血病 → 伤口无法愈合',
    relatedQuestions: ['diet', 'stress'],
    description: '你以为只有水手会得坏血病？程序员的饮食结构说不定还不如水手。',
  },
  {
    name: '维生素 A',
    icon: '👁️',
    deficiencyRate: '44.2%',
    worstConsequence: '夜盲症 → 干眼症恶化 → 角膜软化 → 永久性视力损伤',
    relatedQuestions: ['screen', 'diet'],
    description: '每天盯屏幕 10+ 小时，你的眼睛在加速报废。',
  },
  {
    name: '维生素 E',
    icon: '🛡️',
    deficiencyRate: '38.7%',
    worstConsequence: '细胞氧化加速 → 皮肤老化 → 器官功能下降 → 提前衰老 10-15 年',
    relatedQuestions: ['stress', 'diet'],
    description: '抗氧化之王。缺了它，你会比同龄人老十岁。',
  },
  {
    name: '鱼油 (Omega-3)',
    icon: '🐟',
    deficiencyRate: '78.4%',
    worstConsequence: '大脑炎症 → 认知能力下降 → 心血管疾病 → 突发心梗/中风',
    relatedQuestions: ['diet', 'stress', 'social'],
    description: 'EPA + DHA。你吃的外卖里没有深海鱼，你的大脑在饥饿。',
  },
  {
    name: '益生菌',
    icon: '🦠',
    deficiencyRate: '81.5%',
    worstConsequence: '肠道菌群失调 → 免疫力崩溃 → 慢性炎症 → 抑郁症风险翻 3 倍',
    relatedQuestions: ['gut', 'diet', 'stress'],
    description: '你的肠道是第二个大脑。菌群失调不只是拉肚子，还会让你抑郁。',
  },
  {
    name: '姜黄素',
    icon: '🟡',
    deficiencyRate: '91.2%',
    worstConsequence: '全身慢性炎症 → 关节退化 → 认知衰退 → 阿尔茨海默风险提升 65%',
    relatedQuestions: ['exercise', 'stress', 'diet'],
    description: '最强天然抗炎物。你每天久坐，关节和大脑都在发炎，你却浑然不知。',
  },
  {
    name: '咖啡（适量）',
    icon: '☕',
    deficiencyRate: '23.1%（过量率 67%）',
    worstConsequence: '不喝：注意力涣散，工作效率归零 | 过量：心悸、失眠、焦虑症',
    relatedQuestions: ['sleep', 'stress'],
    description: '每天 1-2 杯是良药，5 杯以上是毒药。你属于哪种？',
  },
  {
    name: '坚果',
    icon: '🥜',
    deficiencyRate: '68.9%',
    worstConsequence: '镁元素严重不足 → 肌肉痉挛 → 心律不齐 → 猝死风险增加',
    relatedQuestions: ['diet', 'stress', 'sleep'],
    description: '每天一把坚果 = 续命。可惜你吃的是薯片和泡面。',
  },
  {
    name: '维生素 K2',
    icon: '💚',
    deficiencyRate: '82.6%',
    worstConsequence: '钙沉积在血管而非骨骼 → 动脉钙化 → 心血管事件风险飙升',
    relatedQuestions: ['diet', 'exercise'],
    description: '就算你补了钙和维D，没有K2就是白补。钙会沉积在血管里，越补越危险。',
  },
  {
    name: '铁元素',
    icon: '🔴',
    deficiencyRate: '46.3%',
    worstConsequence: '严重贫血 → 器官缺氧 → 心脏代偿性肥大 → 心力衰竭',
    relatedQuestions: ['diet', 'exercise'],
    description: '尤其是不吃红肉的人。你以为头晕是没睡好？可能是缺铁。',
  },
  {
    name: '锌',
    icon: '⚙️',
    deficiencyRate: '59.7%',
    worstConsequence: '免疫力断崖下降 → 味觉丧失 → 伤口不愈合 → 反复感染',
    relatedQuestions: ['diet', 'gut', 'stress'],
    description: '缺锌=免疫系统罢工。你总感冒可能不是因为天气，是因为缺锌。',
  },
  {
    name: '褪黑素',
    icon: '🌙',
    deficiencyRate: '74.1%（分泌不足）',
    worstConsequence: '昼夜节律紊乱 → 慢性失眠 → 免疫抑制 → 癌症风险增加 40%',
    relatedQuestions: ['sleep', 'screen'],
    description: '你睡前刷手机的蓝光正在杀死你的褪黑素分泌。',
  },
  {
    name: '维生素 F（必需脂肪酸）',
    icon: '🧈',
    deficiencyRate: '63.4%',
    worstConsequence: '皮肤屏障破坏 → 湿疹/干燥 → 慢性炎症 → 自身免疫疾病',
    relatedQuestions: ['diet'],
    description: '你的皮肤干得像沙漠？不是因为不抹面霜，是因为缺好脂肪。',
  },
  {
    name: '维生素 G（核黄素/B2）',
    icon: '💛',
    deficiencyRate: '51.8%',
    worstConsequence: '口角炎 → 舌炎 → 脂溢性皮炎 → 能量代谢障碍',
    relatedQuestions: ['diet', 'stress'],
    description: '嘴角总是烂？不是上火，是缺 B2。',
  },
]

// ===== 根据回答推荐补品 =====
function getRecommendations(answers: Record<string, 'good' | 'bad' | 'terrible'>): Supplement[] {
  // 如果所有答案都是 good，返回空数组（触发"你没病"逻辑）
  if (Object.values(answers).every(v => v === 'good')) return []

  const badQuestions = Object.entries(answers)
    .filter(([, v]) => v !== 'good')
    .map(([k]) => k)

  // 根据回答不好的问题匹配补品
  const matched = supplements.filter(s =>
    s.relatedQuestions.some(q => badQuestions.includes(q))
  )

  // 根据匹配度排序（匹配的问题越多越靠前）
  matched.sort((a, b) => {
    const aMatch = a.relatedQuestions.filter(q => badQuestions.includes(q)).length
    const bMatch = b.relatedQuestions.filter(q => badQuestions.includes(q)).length
    return bMatch - aMatch
  })

  return matched
}

// ===== 补品卡片 =====
function SupplementCard({ supplement, index }: { supplement: Supplement; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-surface-light/50 backdrop-blur rounded-xl border border-white/5 hover:border-red-500/20 transition-all overflow-hidden"
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 cursor-pointer flex items-start gap-3"
      >
        <div className="text-2xl flex-shrink-0 mt-0.5">{supplement.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-sm text-white">{supplement.name}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
                缺失率 {supplement.deficiencyRate}
              </span>
              <ChevronRight
                size={14}
                className={`text-gray-600 transition-transform ${expanded ? 'rotate-90' : ''}`}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">{supplement.description}</p>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-white/5">
              <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle size={12} className="text-red-400" />
                  <span className="text-[11px] text-red-400 font-medium">缺失最严重后果</span>
                </div>
                <p className="text-xs text-red-300/80 leading-relaxed">{supplement.worstConsequence}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ===== 主页面 =====
export default function Doctor() {
  const navigate = useNavigate()
  useAchievement('doctor')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, 'good' | 'bad' | 'terrible'>>({})
  const [phase, setPhase] = useState<'intro' | 'questioning' | 'analyzing' | 'result'>('intro')
  const [recommendations, setRecommendations] = useState<Supplement[]>([])
  const [isPerfect, setIsPerfect] = useState(false)
  const [psychPhase, setPsychPhase] = useState(0) // 0-4 的心理分析阶段
  // ===== 购买 & 支付 & 计划 状态 =====
  const [showPayment, setShowPayment] = useState(false)
  const [payCountdown, setPayCountdown] = useState(599) // 9:59 倒计时
  const [isPaid, setIsPaid] = useState(false)
  const payTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 支付倒计时
  useEffect(() => {
    if (showPayment && !isPaid) {
      payTimerRef.current = setInterval(() => {
        setPayCountdown(prev => {
          if (prev <= 1) {
            clearInterval(payTimerRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (payTimerRef.current) clearInterval(payTimerRef.current)
    }
  }, [showPayment, isPaid])

  const handleAnswer = (value: 'good' | 'bad' | 'terrible') => {
    const q = questions[currentQ]
    const newAnswers = { ...answers, [q.id]: value }
    setAnswers(newAnswers)

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      // 回答完毕，进入分析阶段
      setPhase('analyzing')
      setTimeout(() => {
        const recs = getRecommendations(newAnswers)
        setRecommendations(recs)
        setIsPerfect(recs.length === 0)
        setPhase('result')
      }, 3000)
    }
  }

  const startDiagnosis = () => {
    setPhase('questioning')
    setCurrentQ(0)
    setAnswers({})
    setRecommendations([])
    setIsPerfect(false)
    setPsychPhase(0)
    setShowPayment(false)
    setIsPaid(false)
    setPayCountdown(599)
  }

  const psychMessages = [
    {
      title: '🤔 初步诊断结果',
      content: '恭喜！你的身体各项指标完美无缺，精力充沛，作息规律，饮食均衡。\n\n你没有任何身体上的问题。',
      buttonText: '太好了！那我很健康？',
    },
    {
      title: '⚠️ 但是...',
      content: '等一下。在全球 80 亿人中，只有不到 0.001% 的人能在所有健康维度达到完美。\n\n而你声称自己就是这 0.001%。\n\n这本身就是一个值得关注的信号。',
      buttonText: '什么意思？',
    },
    {
      title: '🧠 深层分析',
      content: '根据我们的心理学模型分析：\n\n一个声称"一切都很好"的人，通常存在以下情况：\n\n1. 🎭 过度理想化自我（自恋型人格特征）\n2. 🚫 情感压抑与否认（回避型依附模式）\n3. 🧊 述情障碍（无法识别自己的真实感受）\n4. 🎪 "微笑抑郁症"高危人群\n\n简单来说：你不是身体没病，你是心理上不愿承认自己有病。',
      buttonText: '我...确实有点道理...',
    },
    {
      title: '📋 最终诊断',
      content: '最终诊断结论：\n\n✅ 身体健康指标：正常\n❌ 心理健康评估：异常\n\n你和其他人不一样 —— 其他人至少诚实地承认了自己的问题。\n\n所以你有病。需要看心理医生。\n\n好消息是：我们有一个退休决策树，可以帮你做出人生中最重要的决定。\n这可能是你目前最需要的心理治疗。',
      buttonText: '🌳 好吧，去做退休决策树',
    },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              🏥 看病
              <span className="text-sm font-normal text-gray-500 bg-surface-light px-3 py-1 rounded-full">
                AI 问诊 + 补品推荐
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              回答几个问题，让 AI 诊断你缺什么（维生素、矿物质、还是一个新工作）
            </p>
          </div>
        </div>

        {/* ===== 欢迎阶段 ===== */}
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="text-8xl mb-6">🩺</div>
              <h2 className="text-2xl font-bold mb-3">RetireBuddy 智能问诊系统</h2>
              <p className="text-gray-400 mb-2 max-w-md mx-auto">
                本系统将通过 {questions.length} 道专业问题评估你的健康状态，
                并基于全球临床数据推荐你需要的补品。
              </p>
              <p className="text-gray-600 text-xs mb-8">
                ⚠️ 警告：诊断结果可能令你产生"立刻去药店"的冲动
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startDiagnosis}
                className="px-8 py-3.5 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 rounded-2xl text-lg font-medium text-red-300 hover:text-red-200 transition-all"
              >
                🏥 开始问诊
              </motion.button>
            </motion.div>
          )}

          {/* ===== 问诊阶段 ===== */}
          {phase === 'questioning' && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="max-w-2xl mx-auto"
            >
              {/* 进度条 */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>问题 {currentQ + 1} / {questions.length}</span>
                  <span>{Math.round(((currentQ + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                    animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* 问题 */}
              <div className="bg-surface-light/50 backdrop-blur rounded-2xl p-8 border border-white/5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart size={18} className="text-red-400" />
                  <span className="text-xs text-gray-500">问诊中...</span>
                </div>
                <h3 className="text-xl font-bold mb-6">{questions[currentQ].question}</h3>
                <div className="space-y-3">
                  {questions[currentQ].options.map((opt, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswer(opt.value)}
                      className="w-full text-left px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm text-gray-300 hover:text-white transition-all"
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== 分析阶段 ===== */}
          {phase === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-block text-6xl mb-6"
              >
                🔬
              </motion.div>
              <h3 className="text-xl font-bold mb-3">正在分析你的健康数据...</h3>
              <div className="space-y-2 text-sm text-gray-500 max-w-sm mx-auto">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  📊 对比全球 80 亿人的健康数据库...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  🧬 分析你的营养缺口...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                >
                  💊 匹配最佳补充方案...
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* ===== 结果阶段 ===== */}
          {phase === 'result' && !isPerfect && !isPaid && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* 98% 比较横幅 + 购买按钮 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-red-900/30 to-red-700/20 backdrop-blur rounded-2xl p-5 border border-red-500/30 mb-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMCwwLDAuMDUpIi8+PC9zdmc+')] opacity-50" />
                
                <div className="flex items-start gap-4 relative z-10">
                  {/* 左侧：98% 信息 */}
                  <div className="flex-1 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-4xl mb-2"
                    >
                      📉
                    </motion.div>
                    <h3 className="text-lg font-bold text-red-300 mb-1">
                      你的健康状况比 <span className="text-2xl text-red-400">98%</span> 的用户更加糟糕
                    </h3>
                    <p className="text-xs text-red-400/60">
                      基于 {(Math.random() * 500000 + 1000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 名用户的问诊数据
                    </p>
                    {/* 进度条可视化 */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                        <span>健康</span>
                        <span>危险</span>
                      </div>
                      <div className="h-3 bg-surface-light rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 opacity-30" />
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: '98%' }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full relative"
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-400 rounded-full border-2 border-red-300 shadow-lg shadow-red-500/50" />
                        </motion.div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-600">你在这里 →</span>
                        <span className="text-[10px] text-red-400 font-bold">前 2%（最差）</span>
                      </div>
                    </div>
                  </div>

                  {/* 右侧：一键购买按钮 */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowPayment(true)
                      setPayCountdown(599)
                    }}
                    className="flex-shrink-0 w-28 flex flex-col items-center gap-2 px-3 py-4 bg-gradient-to-b from-green-500/30 to-emerald-500/20 border border-green-500/40 rounded-xl text-green-300 hover:text-green-200 transition-all relative overflow-hidden group"
                  >
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-bl-lg font-bold">1折</span>
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ShoppingCart size={24} />
                    </motion.div>
                    <span className="text-[11px] font-bold leading-tight text-center">一键购买<br/>全部补品</span>
                    <span className="text-[9px] text-green-400/60">拯救你的身体</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* 结果头部 */}
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur rounded-2xl p-6 border border-red-500/20 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldAlert size={24} className="text-red-400" />
                  <h3 className="text-xl font-bold text-red-300">⚠️ 诊断结果：需要补充</h3>
                </div>
                <p className="text-sm text-gray-400">
                  根据你的回答，系统检测到 <span className="text-red-400 font-bold">{recommendations.length}</span> 种营养素缺失风险。
                  以下是你需要补充的补品清单，按紧迫程度排序。
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  ⚠️ 每种补品的「缺失率」基于全球成年人统计数据，「最严重后果」为极端情况下的临床记录
                </p>
              </div>

              {/* 补品列表 */}
              <div className="space-y-3 mb-8">
                {recommendations.map((s, i) => (
                  <SupplementCard key={s.name} supplement={s} index={i} />
                ))}
              </div>

              {/* 底部总结 */}
              <div className="bg-surface-light/50 backdrop-blur rounded-2xl p-6 border border-white/5 mb-6">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Pill size={16} className="text-amber-400" />
                  治疗方案总结
                </h4>
                <div className="text-xs text-gray-400 space-y-1.5">
                  <p>💊 每月补品预算：约 ¥300 - ¥800（取决于你选择的品牌）</p>
                  <p>📅 建议持续时间：终身（是的，终身）</p>
                  <p>🛵 或者你可以去送外卖——户外活动 + 阳光 + 运动，免费获取以上所有营养素</p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startDiagnosis}
                  className="flex-1 px-6 py-3 bg-surface-light hover:bg-surface-light/80 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-all"
                >
                  🔄 重新问诊
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/decision-tree')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl text-sm text-orange-300 hover:text-orange-200 transition-all"
                >
                  🌳 去做退休决策树
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ===== 支付成功后：补品发货计划（替换诊断结果） ===== */}
          {phase === 'result' && !isPerfect && isPaid && (
            <motion.div
              key="paid-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur rounded-2xl p-6 border border-green-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 size={24} className="text-green-400" />
                  <h3 className="text-xl font-bold text-green-300">✅ 支付成功！补品已安排发货</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4">订单号：RB-{Date.now().toString(36).toUpperCase()} | 预计 3 天内送达</p>

                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-amber-400" />
                  <h4 className="font-bold text-sm text-white">你的个性化补品补充计划</h4>
                </div>

                <div className="space-y-2">
                  {/* 早晨 */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🌅</span>
                      <span className="text-sm font-bold text-amber-300">早晨 (7:00-8:00)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {recommendations.slice(0, Math.ceil(recommendations.length / 3)).map(s => (
                        <div key={s.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span>{s.icon}</span>
                          <span>{s.name}</span>
                          <span className="text-gray-600">1粒</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span>☕</span>
                        <span>配温水服用</span>
                      </div>
                    </div>
                  </div>

                  {/* 中午 */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">☀️</span>
                      <span className="text-sm font-bold text-orange-300">午餐后 (12:00-13:00)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {recommendations.slice(Math.ceil(recommendations.length / 3), Math.ceil(recommendations.length * 2 / 3)).map(s => (
                        <div key={s.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span>{s.icon}</span>
                          <span>{s.name}</span>
                          <span className="text-gray-600">1粒</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span>🍽️</span>
                        <span>餐后 30 分钟</span>
                      </div>
                    </div>
                  </div>

                  {/* 晚上 */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🌙</span>
                      <span className="text-sm font-bold text-blue-300">睡前 (21:00-22:00)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {recommendations.slice(Math.ceil(recommendations.length * 2 / 3)).map(s => (
                        <div key={s.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span>{s.icon}</span>
                          <span>{s.name}</span>
                          <span className="text-gray-600">1粒</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span>🌙</span>
                        <span>褪黑素最后吃</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-xs text-amber-300/80 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    坚持 90 天，你将超越 50% 的用户。坚持 365 天，你将成为前 10%。
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startDiagnosis}
                  className="flex-1 px-6 py-3 bg-surface-light hover:bg-surface-light/80 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-all"
                >
                  🔄 重新问诊
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/decision-tree')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl text-sm text-orange-300 hover:text-orange-200 transition-all"
                >
                  🌳 去做退休决策树
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ===== 完美答案 → 你有病 ===== */}
          {phase === 'result' && isPerfect && (
            <motion.div
              key="perfect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-surface-light/50 backdrop-blur rounded-2xl p-8 border border-white/5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {psychPhase < 2 ? (
                    <CheckCircle2 size={24} className="text-green-400" />
                  ) : psychPhase < 3 ? (
                    <Brain size={24} className="text-amber-400" />
                  ) : (
                    <ShieldAlert size={24} className="text-red-400" />
                  )}
                  <h3 className="text-xl font-bold">
                    {psychMessages[psychPhase].title}
                  </h3>
                </div>

                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line mb-6">
                  {psychMessages[psychPhase].content}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (psychPhase < psychMessages.length - 1) {
                      setPsychPhase(psychPhase + 1)
                    } else {
                      navigate('/decision-tree')
                    }
                  }}
                  className={`w-full px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                    psychPhase >= 3
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-300 hover:text-orange-200'
                      : psychPhase >= 2
                        ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200'
                        : 'bg-green-500/20 border border-green-500/30 text-green-300 hover:text-green-200'
                  }`}
                >
                  {psychMessages[psychPhase].buttonText}
                </motion.button>
              </div>

              {/* 进度指示器 */}
              <div className="flex justify-center gap-2">
                {psychMessages.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i <= psychPhase ? 'bg-primary-light' : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== 支付弹窗（全局覆盖层） ===== */}
        <AnimatePresence>
          {showPayment && !isPaid && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowPayment(false)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 30 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
              >
                {/* 限时折扣标签 */}
                <div className="absolute top-0 right-0 bg-gradient-to-l from-red-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                  限时 1 折
                </div>

                <div className="text-center mb-5">
                  <div className="text-4xl mb-2">🛒</div>
                  <h3 className="text-lg font-bold text-white">RetireBuddy 补品套装</h3>
                  <p className="text-xs text-gray-500">为你精选 {recommendations.length} 种营养补品</p>
                </div>

                {/* 订单明细 */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-4 max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {recommendations.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-gray-400">
                          <span>{s.icon}</span>
                          <span>{s.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 line-through">¥{(Math.random() * 100 + 80).toFixed(0)}</span>
                          <span className="text-green-400">¥{(Math.random() * 10 + 8).toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/5 mt-3 pt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">运费</span>
                    <span className="text-xs text-green-400">免运费 🎉</span>
                  </div>
                </div>

                {/* 价格 */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <span className="text-gray-600 line-through text-lg">¥{(recommendations.length * 128).toFixed(0)}</span>
                    <span className="text-3xl font-bold text-green-400">¥{(recommendations.length * 12.8).toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Gift size={12} className="text-amber-400" />
                    <span>新人首单特惠 · 仅限一次</span>
                  </div>
                </div>

                {/* 支付倒计时 */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400 mb-1">
                    <Clock size={14} />
                    <span className="text-xs font-medium">限时优惠倒计时</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 font-mono">
                    <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-lg font-bold">
                      {String(Math.floor(payCountdown / 60)).padStart(2, '0')}
                    </span>
                    <span className="text-red-400 text-lg font-bold animate-pulse">:</span>
                    <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-lg font-bold">
                      {String(payCountdown % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-[10px] text-red-400/50 mt-1">倒计时结束后恢复原价</p>
                </div>

                {/* 支付方式 */}
                <div className="flex gap-2 mb-4">
                  {['💚 微信支付', '🔵 支付宝', '💳 银行卡'].map((method, i) => (
                    <button
                      key={i}
                      className={`flex-1 py-2 rounded-lg text-[11px] border transition-all ${
                        i === 0
                          ? 'bg-green-500/10 border-green-500/30 text-green-300'
                          : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {/* 购买按钮 */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsPaid(true)
                    setShowPayment(false)
                    if (payTimerRef.current) clearInterval(payTimerRef.current)
                  }}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                >
                  <CreditCard size={16} />
                  立即支付 ¥{(recommendations.length * 12.8).toFixed(0)}
                </motion.button>

                <p className="text-[10px] text-gray-600 text-center mt-3">
                  🔒 全程加密 · 7天无理由退款 · {(Math.random() * 50000 + 100000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 人已购买
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
