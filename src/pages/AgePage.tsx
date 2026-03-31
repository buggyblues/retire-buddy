import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onSubmit: (age: number) => void
}

export default function AgePage({ onSubmit }: Props) {
  const [age, setAge] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numAge = parseInt(age)
    if (isNaN(numAge) || numAge < 0 || numAge > 150) {
      setError('请输入有效年龄 (0-150)')
      return
    }
    setError('')
    setIsSubmitting(true)
    onSubmit(numAge)

    setTimeout(() => {
      if (numAge < 18 || numAge >= 35) {
        navigate('/retired')
      } else {
        navigate('/dashboard')
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* 背景动画粒子 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-light/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <motion.div
          className="text-7xl mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🏖️
        </motion.div>
        <h1 className="text-5xl sm:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-primary-light via-purple-400 to-accent bg-clip-text text-transparent">
            RetireBuddy
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
          AI 接管一切，人类放心退休
          <br />
          <span className="text-sm text-gray-500">Don't Worry, Just Retire 🌴</span>
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="bg-surface-light/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <label className="block text-gray-300 text-sm font-medium mb-3">
            请输入你的年龄
          </label>
          <div className="relative mb-4">
            <input
              type="number"
              value={age}
              onChange={(e) => {
                setAge(e.target.value)
                setError('')
              }}
              placeholder="你的年龄"
              className="w-full px-5 py-4 bg-surface/80 border border-white/10 rounded-2xl text-white text-lg
                placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all duration-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              min={0}
              max={150}
              autoFocus
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-danger text-sm mb-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={!age || isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark rounded-2xl text-white font-semibold
              text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-primary/25"
          >
            {isSubmitting ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                正在评估你的退休状态...
              </motion.span>
            ) : (
              '开始评估 →'
            )}
          </motion.button>
        </div>


      </motion.form>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 text-center text-gray-600 text-xs leading-relaxed px-4 max-w-lg"
      >
        本游戏由 AI 生成，所有数据纯属虚构，一切观点不代表任何平台或个人立场
      </motion.footer>
    </div>
  )
}
