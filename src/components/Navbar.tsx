import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, Gamepad2, Eclipse, FileText,
  Bot, CalendarDays, TrendingUp, Heart, Menu, X, GitBranch, Briefcase, Wind
} from 'lucide-react'

const allNav = [
  { path: '/dashboard', label: '焦虑看板', icon: BarChart3 },
  { path: '/decision-tree', label: '决策树', icon: GitBranch },
  { path: '/doctor', label: '看病', icon: Heart },
  { path: '/ai-takeover', label: 'AI接管', icon: TrendingUp },
  { path: '/job-wall', label: '招聘墙', icon: Briefcase },
  { path: '/day-schedule', label: '退休日程', icon: CalendarDays },
  { path: '/simulator', label: '退休模拟器', icon: Gamepad2 },
  { path: '/meditation', label: '冥想', icon: Wind },
  { path: '/void', label: '放空', icon: Eclipse },
  { path: '/career', label: '职业倒计时', icon: Bot },
  { path: '/certificate', label: '证书', icon: FileText },
]

export default function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-2">
          <Link to="/dashboard" className="flex items-center gap-2 group flex-shrink-0">
            <span className="text-xl">🏖️</span>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent hidden sm:inline">
              RetireBuddy
            </span>
          </Link>

          {/* Desktop Nav - 自动折行 */}
          <div className="hidden lg:flex items-center flex-wrap justify-end gap-x-0.5 gap-y-1">
            {allNav.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
                    ${active
                      ? 'bg-primary/20 text-primary-light shadow-sm shadow-primary/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 bg-surface/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 grid grid-cols-2 gap-1">
              {allNav.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${active
                        ? 'bg-primary/20 text-primary-light'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
