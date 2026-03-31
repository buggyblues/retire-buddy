import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Download, Share2, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAchievement } from '../hooks/useAchievement'

export default function Certificate() {
  const navigate = useNavigate()
  useAchievement('certificate')
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [generated, setGenerated] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const retireDate = new Date()
  retireDate.setDate(retireDate.getDate() + Math.floor(Math.random() * 365))
  const formattedDate = retireDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

  const anxietyScore = Math.floor(60 + Math.random() * 35)

  const generateCertificate = () => {
    if (!name.trim()) return
    setGenerated(true)

    // 生成 canvas 证书
    setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = 800
      canvas.height = 600

      // 背景渐变
      const gradient = ctx.createLinearGradient(0, 0, 800, 600)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(0.5, '#1e1b4b')
      gradient.addColorStop(1, '#0f172a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 800, 600)

      // 装饰边框
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 3
      ctx.strokeRect(20, 20, 760, 560)
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 1
      ctx.strokeRect(30, 30, 740, 540)

      // 角落装饰
      const corners = [[30, 30], [740, 30], [30, 540], [740, 540]]
      corners.forEach(([x, y]) => {
        ctx.fillStyle = '#f59e0b'
        ctx.beginPath()
        ctx.arc(x + 15, y + 15, 6, 0, Math.PI * 2)
        ctx.fill()
      })

      // 标题
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 36px serif'
      ctx.textAlign = 'center'
      ctx.fillText('🏖️ 退 休 证 书 🏖️', 400, 90)

      ctx.fillStyle = '#6366f1'
      ctx.font = '14px sans-serif'
      ctx.fillText('RETIREMENT CERTIFICATE', 400, 115)

      // 分割线
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(100, 130)
      ctx.lineTo(700, 130)
      ctx.stroke()

      // 正文
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '18px sans-serif'
      ctx.fillText('兹证明', 400, 180)

      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 32px sans-serif'
      ctx.fillText(name, 400, 230)

      if (title) {
        ctx.fillStyle = '#94a3b8'
        ctx.font = '16px sans-serif'
        ctx.fillText(`前职位：${title}`, 400, 265)
      }

      ctx.fillStyle = '#e2e8f0'
      ctx.font = '18px sans-serif'
      ctx.fillText('已在 AI 时代光荣退休', 400, 310)

      // 数据
      ctx.fillStyle = '#94a3b8'
      ctx.font = '14px sans-serif'
      ctx.fillText(`退休日期：${formattedDate}`, 400, 360)
      ctx.fillText(`焦虑解除指数：${anxietyScore}/100`, 400, 385)
      ctx.fillText(`证书编号：RB-${Date.now().toString(36).toUpperCase()}`, 400, 410)

      // 分割线
      ctx.strokeStyle = '#334155'
      ctx.beginPath()
      ctx.moveTo(100, 440)
      ctx.lineTo(700, 440)
      ctx.stroke()

      // 底部
      ctx.fillStyle = '#6366f1'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText('RetireBuddy 退休委员会', 400, 480)

      ctx.fillStyle = '#64748b'
      ctx.font = '12px sans-serif'
      ctx.fillText('AI 接管一切，人类放心退休', 400, 505)
      ctx.fillText("Don't Worry, Just Retire 🌴", 400, 525)

      // 印章
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(650, 480, 35, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText('已退休', 650, 476)
      ctx.font = '10px sans-serif'
      ctx.fillText('RETIRED', 650, 496)
    }, 100)
  }

  const downloadCertificate = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `退休证书-${name}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

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
          <div className="inline-flex items-center gap-2 text-accent mb-3">
            <Sparkles size={28} />
            <h1 className="text-3xl sm:text-4xl font-bold">退休证书生成器</h1>
          </div>
          <p className="text-gray-400 text-sm">生成专属退休证书，宣告你的退休身份</p>
        </motion.div>

        {!generated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-surface-light/50 backdrop-blur rounded-3xl p-8 border border-white/10">
              <label className="block text-gray-300 text-sm font-medium mb-2">你的姓名 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入你的大名"
                className="w-full px-5 py-3 bg-surface/80 border border-white/10 rounded-2xl text-white text-lg
                  placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all duration-200 mb-4"
                autoFocus
              />

              <label className="block text-gray-300 text-sm font-medium mb-2">前职位（可选）</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：高级打工人"
                className="w-full px-5 py-3 bg-surface/80 border border-white/10 rounded-2xl text-white
                  placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all duration-200 mb-6"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateCertificate}
                disabled={!name.trim()}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark rounded-2xl text-white font-semibold
                  text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🎓 生成退休证书
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-surface-light/50 backdrop-blur rounded-3xl p-6 border border-white/10 inline-block mb-6">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-xl"
                style={{ maxHeight: '400px' }}
              />
            </div>

            <div className="flex gap-4 justify-center mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadCertificate}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark rounded-xl
                  text-white font-medium shadow-lg shadow-primary/25"
              >
                <Download size={18} />
                下载证书
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: '我的退休证书', text: `${name} 已在 AI 时代光荣退休！—— RetireBuddy` })
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-surface-light border border-white/10 rounded-xl
                  text-gray-300 hover:text-white transition-colors"
              >
                <Share2 size={18} />
                分享
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGenerated(false)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              重新生成
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  )
}
