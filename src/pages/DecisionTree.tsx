import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight, Bike, HardHat, MapPin, Timer, Star, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAchievement } from '../hooks/useAchievement'

// ===== 50 条弹幕文案 =====
const danmakuTexts = [
  '🌍 环游世界', '👨‍👩‍👧‍👦 陪伴家人', '🎮 打游戏到天亮', '🃏 打牌搓麻', '🎣 湖边钓鱼',
  '📚 读完书架上的书', '🏄 学冲浪', '🏥 每天吃补品', '🎨 学画画', '🍳 研究美食',
  '🏔️ 爬遍名山', '🎸 学吉他', '✈️ 说走就走', '🏡 种花养草', '📷 街头摄影',
  '🐕 遛狗散步', '🎬 追剧到凌晨', '🏊 海边游泳', '🎭 学话剧', '🛒 逛菜市场',
  '☕ 开间咖啡馆', '🎹 弹钢琴', '🧶 织毛衣', '🎯 飞镖高手', '🚗 自驾环游',
  '🏕️ 露营看星星', '💃 广场舞C位', '🎤 KTV麦霸', '🌸 赏樱花', '🍺 精酿啤酒',
  '📝 写回忆录', '🎾 网球对打', '🧗 攀岩挑战', '🎪 看马戏', '🚴 骑行318',
  '🦜 养鹦鹉', '🎲 桌游之夜', '🌅 看日出日落', '🧩 拼拼图', '🎻 学小提琴',
  '🏠 装修房子', '🌿 阳台菜园', '📻 听播客', '🎧 DJ打碟', '🛶 皮划艇',
  '🧊 冰壶运动', '🎑 赏月品茶', '⛷️ 滑雪度假', '🎰 去澳门', '🌺 夏威夷躺平',
]

// ===== 问题树 =====
interface Question {
  id: string
  text: string
  subtext?: string
  options: { label: string; next: string }[]
}

const questions: Question[] = [
  {
    id: 'q1',
    text: '你现在每天工作多少小时？',
    subtext: '请诚实回答',
    options: [
      { label: '8小时以内（表面上）', next: 'q2' },
      { label: '996 是基本操作', next: 'q2' },
      { label: '保密（已经数不清了）', next: 'q2' },
    ],
  },
  {
    id: 'q2',
    text: '你觉得自己的存款够退休吗？',
    subtext: '别骗自己了',
    options: [
      { label: '差不多了吧...', next: 'q3' },
      { label: '远远不够', next: 'q3' },
      { label: '保密（看了余额不想说话）', next: 'q3' },
    ],
  },
  {
    id: 'q3',
    text: '你相信社保能养老吗？',
    subtext: '心理学研究表明，人们倾向于过度乐观',
    options: [
      { label: '是的，我相信', next: 'q4' },
      { label: '不太相信...', next: 'q4' },
      { label: '保密（心里苦）', next: 'q4' },
    ],
  },
  {
    id: 'q4',
    text: '如果明天退休，你最想做的第一件事是什么？',
    subtext: '延迟满足理论：你越渴望的东西，说明你越缺少它',
    options: [
      { label: '睡到自然醒', next: 'q5' },
      { label: '辞职信甩在老板脸上', next: 'q5' },
      { label: '保密（怕说了实现不了）', next: 'q5' },
    ],
  },
  {
    id: 'q5',
    text: '你有什么特殊技能可以退休后变现吗？',
    subtext: '达克效应：人们往往高估自己的能力',
    options: [
      { label: '有！我会 Excel', next: 'q6' },
      { label: '会写代码（但 AI 已经会了）', next: 'q6' },
      { label: '保密（我什么都不会）', next: 'q6' },
    ],
  },
  {
    id: 'q6',
    text: '你对"灵活就业"这个词有什么感受？',
    subtext: '框架效应：同一件事换个说法，感受完全不同',
    options: [
      { label: '听起来挺自由的！', next: 'q7' },
      { label: '就是失业的委婉说法吧', next: 'q7' },
      { label: '保密（不敢想）', next: 'q7' },
    ],
  },
  {
    id: 'q7',
    text: '你每天花多少时间刷手机逃避现实？',
    subtext: '研究发现：逃避行为与焦虑程度成正比',
    options: [
      { label: '不多，2-3小时', next: 'q8' },
      { label: '醒着的时候都在刷', next: 'q8' },
      { label: '保密（手机已经成为我的器官）', next: 'q8' },
    ],
  },
  {
    id: 'q8',
    text: '你觉得 AI 多久会取代你的工作？',
    subtext: '锚定效应：你的答案会被这个问题本身暗示',
    options: [
      { label: '至少还有 10 年', next: 'q9' },
      { label: '可能已经在发生了', next: 'q9' },
      { label: '保密（已经被优化了）', next: 'q9' },
    ],
  },
  {
    id: 'q9',
    text: '你有想过退休后的收入来源吗？',
    subtext: '心理账户理论：人们很少为未来真正做规划',
    options: [
      { label: '投资理财！', next: 'q10' },
      { label: '啃老（或者被啃）', next: 'q10' },
      { label: '保密（根本不敢想）', next: 'q10' },
    ],
  },
  {
    id: 'q10',
    text: '你愿意为了自由，接受一份"低但稳定"的收入吗？',
    subtext: '损失厌恶：人们对失去的感受是获得的2倍',
    options: [
      { label: '当然愿意！自由最重要', next: 'q11' },
      { label: '不，我需要体面的收入', next: 'q11' },
      { label: '保密（内心在挣扎）', next: 'q11' },
    ],
  },
  {
    id: 'q11',
    text: '你身体素质怎么样？',
    subtext: '身体是革命的本钱，也是第二职业的本钱',
    options: [
      { label: '还不错，能跑能跳', next: 'q12' },
      { label: '一般般，坐久了腰疼', next: 'q12' },
      { label: '保密（体检报告不敢看）', next: 'q12' },
    ],
  },
  {
    id: 'q12',
    text: '最后一个问题：你认命了吗？',
    subtext: '存在主义心理学：接受现实是改变的第一步',
    options: [
      { label: '是的...', next: 'result' },
      { label: '不！我要反抗！', next: 'result' },
      { label: '保密（眼眶湿润了）', next: 'result' },
    ],
  },
]

// ===== 弹幕组件 =====
function DanmakuStage({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [countdown, setCountdown] = useState(8)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    interface Bullet {
      text: string
      x: number
      y: number
      speed: number
      size: number
      color: string
      opacity: number
    }

    const colors = [
      '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899',
      '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
    ]

    const bullets: Bullet[] = []
    let spawnTimer = 0

    const spawn = () => {
      const text = danmakuTexts[Math.floor(Math.random() * danmakuTexts.length)]
      const size = 16 + Math.random() * 20
      bullets.push({
        text,
        x: window.innerWidth + 10,
        y: 80 + Math.random() * (window.innerHeight - 160),
        speed: 1.5 + Math.random() * 3,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.7 + Math.random() * 0.3,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      spawnTimer++
      if (spawnTimer % 6 === 0) spawn()
      if (spawnTimer % 10 === 0) spawn()

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i]
        b.x -= b.speed

        ctx.font = `bold ${b.size}px "Noto Sans SC", sans-serif`
        ctx.globalAlpha = b.opacity
        // 描边文字
        ctx.strokeStyle = 'rgba(0,0,0,0.8)'
        ctx.lineWidth = 3
        ctx.strokeText(b.text, b.x, b.y)
        // 填充文字
        ctx.fillStyle = b.color
        ctx.fillText(b.text, b.x, b.y)

        if (b.x < -300) bullets.splice(i, 1)
      }
      ctx.globalAlpha = 1

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    // 倒计时
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      cancelAnimationFrame(animId)
      clearInterval(timer)
      window.removeEventListener('resize', resize)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-6"
        >
          退休后可以干嘛？
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-lg mb-8"
        >
          看看这些美好的选项正在飞过...
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="text-8xl font-bold text-white tabular-nums">{countdown}</div>
          <p className="text-gray-500 text-sm">秒后开始你的退休决策测试</p>
          <button
            onClick={onComplete}
            className="mt-4 px-6 py-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/30 rounded-full transition-all"
          >
            跳过 →
          </button>
        </motion.div>
      </div>
    </div>
  )
}

// ===== 送外卖结果页 =====
function DeliveryResult() {
  const navigate = useNavigate()

  const equipmentGuide = [
    {
      icon: Bike,
      title: '电动车选购指南',
      items: [
        '品牌推荐：雅迪冠能 / 小牛NQi / 九号 E300P',
        '续航至少 80km+，避免跑到一半没电',
        '碟刹是必须的，紧急情况能救命',
        '前后减震要好，颠簸路多（你的腰会感谢你）',
        '手机支架 + USB充电口 一定要有',
        '预算：3000-5000 元，别太贵（万一干不下去）',
      ],
    },
    {
      icon: HardHat,
      title: '头盔 & 装备选购',
      items: [
        '3C 认证头盔，半盔轻便但全盔更安全',
        '夏天要带风扇头盔（热到中暑影响接单效率）',
        '防水冲锋衣：迪卡侬 199 元款足够',
        '骑行手套：防滑+触屏功能，冬天必备',
        '保温箱：美团/饿了么发的就行，额外买一个备用',
        '充电宝至少 20000mAh × 2（手机是你的命）',
      ],
    },
    {
      icon: MapPin,
      title: '路线规划技巧',
      items: [
        '熟记商圈 3km 内所有小区和写字楼入口',
        '掌握外卖聚集区的高峰时段（11:00-13:00, 17:30-20:00）',
        '雨天单量翻倍但事故率也翻倍，酌情接单',
        '电梯楼优先，6楼以上无电梯果断放弃',
        '学会合理拒单，超时罚款比少接一单亏得多',
        '和保安搞好关系，节省找路时间',
      ],
    },
    {
      icon: Timer,
      title: '效率提升秘籍',
      items: [
        '新手期别贪多，每次最多接 2 单',
        '午高峰提前 10 分钟到热门商家门口等',
        '学会看订单距离，超过 4km 的谨慎接',
        '准备多个平台账号：美团 + 饿了么 + 闪送',
        '每月收入目标：6000-10000（取决于你的肝度）',
        '记得交社保！灵活就业人员可以自己交',
      ],
    },
    {
      icon: Star,
      title: '好评维护攻略',
      items: [
        '微笑服务（虽然客户看不到但电话里听得出）',
        '提前报备："您好，您的外卖大约X分钟到"',
        '随身带纸巾和一次性筷子，客户忘记备注时救场',
        '差评申诉要及时，恶意差评可以打客服',
        '月度好评率 > 98% 有额外奖励',
        '遇到不讲理的客户...深呼吸（想想你的退休梦想）',
      ],
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* 结果标题 */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-8xl mb-6"
        >
          🛵
        </motion.div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl sm:text-5xl font-bold mb-4"
        >
          <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            去送外卖！
          </span>
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-lg max-w-lg mx-auto"
        >
          经过严谨的心理学分析和大数据计算，我们为你量身定制了最优退休方案。
          <br />
          <span className="text-gray-500 text-sm">（不管你选什么，结果都一样 😊）</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-orange-500/20 border border-orange-500/30 rounded-2xl"
        >
          <Sparkles size={18} className="text-orange-400" />
          <span className="text-orange-300 font-medium">系统推荐指数：⭐⭐⭐⭐⭐</span>
        </motion.div>
      </div>

      {/* 优势清单 */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl p-8 border border-orange-500/20 mb-10"
      >
        <h3 className="text-xl font-bold text-orange-400 mb-4">🎯 为什么是送外卖？</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { emoji: '💪', text: '零门槛，有电动车就行' },
            { emoji: '🕐', text: '灵活工时，想干就干' },
            { emoji: '🏃', text: '锻炼身体，比健身房便宜' },
            { emoji: '🗺️', text: '熟悉城市，比导航还准' },
            { emoji: '💰', text: '日结/周结，现金流充沛' },
            { emoji: '🧘', text: '没有office politics，精神自由' },
            { emoji: '🍜', text: '试吃各种餐厅（虽然买不起）' },
            { emoji: '📈', text: '雨天翻倍，越惨越赚' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-gray-300">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 入门指南 */}
      <div className="space-y-6 mb-10">
        <h3 className="text-2xl font-bold text-center mb-8">
          📖 外卖骑手入门指南
        </h3>
        {equipmentGuide.map((section, si) => (
          <motion.div
            key={si}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 + si * 0.15 }}
            className="bg-surface-light/50 rounded-2xl p-6 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <section.icon size={20} className="text-orange-400" />
              </div>
              <h4 className="text-lg font-bold">{section.title}</h4>
            </div>
            <ul className="space-y-2">
              {section.items.map((item, ii) => (
                <li key={ii} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-orange-500 mt-0.5 flex-shrink-0">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* 鼓励语 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="text-center py-10 border-t border-white/10"
      >
        <p className="text-2xl mb-2">🫡</p>
        <p className="text-gray-400 mb-6">
          "人生没有白走的路，每一步都算数。"
          <br />
          <span className="text-gray-600 text-sm">—— 包括送外卖的每一单</span>
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-medium transition-colors"
        >
          回到焦虑看板，继续上班
        </button>
      </motion.div>
    </motion.div>
  )
}

// ===== 主决策树页面 =====
export default function DecisionTree() {
  const navigate = useNavigate()
  useAchievement('decision-tree')
  const [phase, setPhase] = useState<'danmaku' | 'questions' | 'result'>('danmaku')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showQuestion, setShowQuestion] = useState(true)

  const handleDanmakuComplete = useCallback(() => {
    setPhase('questions')
  }, [])

  const handleAnswer = (label: string, next: string) => {
    setAnswers(prev => [...prev, label])
    setShowQuestion(false)

    setTimeout(() => {
      if (next === 'result') {
        setPhase('result')
      } else {
        setCurrentQ(prev => prev + 1)
        setShowQuestion(true)
      }
    }, 400)
  }

  const question = questions[currentQ]

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* 弹幕阶段 */}
      <AnimatePresence>
        {phase === 'danmaku' && (
          <DanmakuStage onComplete={handleDanmakuComplete} />
        )}
      </AnimatePresence>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          返回看板
        </button>

        {phase === 'questions' && question && (
          <>
            {/* 进度 */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>问题 {currentQ + 1} / {questions.length}</span>
                <span>{Math.round(((currentQ + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #f59e0b, #ef4444)' }}
                  animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* 问题卡片 */}
            <AnimatePresence mode="wait">
              {showQuestion && (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="bg-surface-light/50 rounded-3xl p-8 border border-white/5 mb-6">
                    <div className="text-sm text-primary-light/60 mb-2 font-mono">Q{currentQ + 1}</div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3">{question.text}</h2>
                    {question.subtext && (
                      <p className="text-gray-500 text-sm italic">💡 {question.subtext}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {question.options.map((opt, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(opt.label, opt.next)}
                        className="w-full flex items-center justify-between p-5 bg-surface-light/30 hover:bg-surface-light/60
                          border border-white/5 hover:border-primary/30 rounded-2xl transition-all group text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center
                            text-primary-light text-sm font-bold group-hover:bg-primary/20 transition-colors">
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-gray-200 group-hover:text-white transition-colors">
                            {opt.label}
                          </span>
                        </div>
                        <ChevronRight size={18} className="text-gray-600 group-hover:text-primary-light transition-colors" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 已回答记录 */}
            {answers.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-gray-600 text-xs mb-3">已回答：</p>
                <div className="flex flex-wrap gap-2">
                  {answers.map((a, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-500">
                      Q{i + 1}: {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {phase === 'result' && <DeliveryResult />}
      </main>
    </div>
  )
}
