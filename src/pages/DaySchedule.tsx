import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAchievement } from '../hooks/useAchievement'

interface CalendarEvent {
  id: string
  day: number
  startHour: number
  duration: number
  emoji: string
  title: string
  detail: string
  color: string
  bgColor: string
}

const EVENT_STYLES = [
  { color: 'text-blue-100', bgColor: 'bg-blue-500/80' },
  { color: 'text-purple-100', bgColor: 'bg-purple-500/80' },
  { color: 'text-green-100', bgColor: 'bg-green-600/80' },
  { color: 'text-orange-100', bgColor: 'bg-orange-500/80' },
  { color: 'text-pink-100', bgColor: 'bg-pink-500/80' },
  { color: 'text-cyan-100', bgColor: 'bg-cyan-600/80' },
  { color: 'text-red-100', bgColor: 'bg-red-500/80' },
  { color: 'text-indigo-100', bgColor: 'bg-indigo-500/80' },
  { color: 'text-teal-100', bgColor: 'bg-teal-600/80' },
  { color: 'text-amber-100', bgColor: 'bg-amber-600/80' },
]

const ACTIVITIES = [
  { emoji: '😴', title: '继续睡觉', detail: '闹钟？那是什么东西？翻个身继续做梦', dur: 2 },
  { emoji: '🧘', title: '阳台拉伸', detail: '面朝太阳，感受没有会议通知的早晨', dur: 1 },
  { emoji: '☕', title: '手磨咖啡', detail: '不是速溶，是磨豆子磨半小时的仪式感', dur: 1 },
  { emoji: '📰', title: '看新闻吃瓜', detail: '看看打工人又在焦虑什么，露出退休者微笑', dur: 1 },
  { emoji: '🥐', title: '做精致早餐', detail: '煎蛋、烤面包、鲜榨果汁，以前只有泡面', dur: 1 },
  { emoji: '🌱', title: '照料小花园', detail: '给月季浇水，跟多肉说说话', dur: 1.5 },
  { emoji: '📚', title: '读一本闲书', detail: '《人类简史》第三遍了，反正有的是时间', dur: 2 },
  { emoji: '🎨', title: '画水彩画', detail: '画了一幅抽象画，像素级还原了前老板的脸', dur: 2 },
  { emoji: '🚶', title: '公园散步', detail: '在别人上班的时间散步，有莫名的优越感', dur: 1.5 },
  { emoji: '🐱', title: '撸猫 2 小时', detail: '猫：这个人类怎么一直在家？', dur: 2 },
  { emoji: '🎵', title: '学一首吉他曲', detail: '弹了三个和弦，觉得自己可以出道了', dur: 1.5 },
  { emoji: '😴', title: '午睡到自然醒', detail: '这种午睡只有退休者才能享受', dur: 2 },
  { emoji: '🎮', title: '打一下午游戏', detail: '光明正大地游戏人生', dur: 3 },
  { emoji: '🎣', title: '河边钓鱼', detail: '钓不到也没关系，重要的是发呆', dur: 3 },
  { emoji: '🍳', title: '研究新菜谱', detail: '做了一道黑暗料理，但没人嘲笑', dur: 1.5 },
  { emoji: '🏊', title: '游泳健身', detail: '别人开会的时间去游泳，泳池空荡荡', dur: 1.5 },
  { emoji: '☕', title: '约退休朋友喝茶', detail: '今天你焦虑了吗？我没有！哈哈哈', dur: 2 },
  { emoji: '🌅', title: '看夕阳西下', detail: '今天又白过了一天，真好', dur: 1 },
  { emoji: '👨‍🍳', title: '做一顿大餐', detail: '终于有时间学做菜了', dur: 2 },
  { emoji: '🎬', title: '看电影马拉松', detail: '一口气三部，没人催加班', dur: 3 },
  { emoji: '🌃', title: '城市夜景漫步', detail: '看着办公楼还亮灯的人们，默默祈祷', dur: 1.5 },
  { emoji: '📝', title: '写退休日记', detail: '今天天气不错，什么也没做。完。', dur: 1 },
  { emoji: '🛁', title: '泡一个长长的澡', detail: '放水、放浴盐、放音乐，放下一切', dur: 1 },
  { emoji: '⭐', title: '阳台数星星', detail: '数到第 37 颗就睡着了', dur: 1 },
  { emoji: '🍰', title: '烘焙下午茶', detail: '歪歪扭扭的蛋糕，但很好吃', dur: 2 },
  { emoji: '🏃', title: '慢跑 30 分钟', detail: '不是为了减肥，就是跑着开心', dur: 1 },
  { emoji: '📸', title: '拍照修图', detail: '给花花草草拍写真发朋友圈', dur: 1.5 },
  { emoji: '🧩', title: '拼 1000 片拼图', detail: '时间多到不知怎么花', dur: 3 },
]

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7)

function generateWeekSchedule(seed?: number): CalendarEvent[] {
  const rng = seed !== undefined
    ? (() => { let s = seed; return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 } })()
    : Math.random
  const events: CalendarEvent[] = []
  let id = 0
  for (let day = 0; day < 7; day++) {
    let hour = 7 + Math.floor(rng() * 2)
    const maxEvents = 4 + Math.floor(rng() * 3)
    for (let e = 0; e < maxEvents && hour < 22; e++) {
      const actIdx = Math.floor(rng() * ACTIVITIES.length)
      const activity = ACTIVITIES[actIdx]
      const duration = Math.min(activity.dur, 22 - hour)
      if (duration < 0.5) break
      const style = EVENT_STYLES[id % EVENT_STYLES.length]
      events.push({
        id: `${id++}`,
        day,
        startHour: hour,
        duration,
        emoji: activity.emoji,
        title: activity.title,
        detail: activity.detail,
        color: style.color,
        bgColor: style.bgColor,
      })
      hour += duration + (0.5 + rng() * 0.5)
    }
  }
  return events
}

function getWeekDates(offset: number): Date[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function generateICS(events: CalendarEvent[], weekDates: Date[]): string {
  let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//RetireBuddy//CN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:退休日程\r\nX-WR-TIMEZONE:Asia/Shanghai\r\n'
  events.forEach((event) => {
    const date = weekDates[event.day]
    const startH = Math.floor(event.startHour)
    const startM = Math.round((event.startHour - startH) * 60)
    const endHour = event.startHour + event.duration
    const endH = Math.floor(endHour)
    const endM = Math.round((endHour - endH) * 60)
    const pad = (n: number) => String(n).padStart(2, '0')
    const y = date.getFullYear()
    const m = pad(date.getMonth() + 1)
    const d = pad(date.getDate())
    const dtStart = `${y}${m}${d}T${pad(startH)}${pad(startM)}00`
    const dtEnd = `${y}${m}${d}T${pad(endH)}${pad(endM)}00`
    ics += `BEGIN:VEVENT\r\nDTSTART;TZID=Asia/Shanghai:${dtStart}\r\nDTEND;TZID=Asia/Shanghai:${dtEnd}\r\nSUMMARY:${event.emoji} ${event.title}\r\nDESCRIPTION:${event.detail}\r\nUID:rb-${event.id}-${Date.now()}@retirebuddy.app\r\nEND:VEVENT\r\n`
  })
  ics += 'END:VCALENDAR'
  return ics
}

export default function DaySchedule() {
  const navigate = useNavigate()
  useAchievement('day-schedule')
  const [weekOffset, setWeekOffset] = useState(0)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000))
  const events = useMemo(() => generateWeekSchedule(seed), [seed])
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const regenerate = useCallback(() => {
    setSeed(Math.floor(Math.random() * 100000))
    setSelectedEvent(null)
  }, [])

  const syncToCalendar = useCallback(() => {
    const ics = generateICS(events, weekDates)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '退休日程.ics'
    a.click()
    URL.revokeObjectURL(url)
  }, [events, weekDates])

  const HOUR_HEIGHT = 56
  const todayStr = currentTime.toDateString()
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-7xl mx-auto px-2 sm:px-4 pt-20 pb-12">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-white transition-colors mb-4 block px-2">{'←'} {'返回'}</button>

        {/* Apple Calendar Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 px-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {weekDates[0].toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#1c1c1e] rounded-lg overflow-hidden border border-white/10">
              <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 hover:bg-white/5 transition-colors text-gray-400 hover:text-white"><ChevronLeft size={16} /></button>
              <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 transition-colors font-medium border-x border-white/10">{'今天'}</button>
              <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 hover:bg-white/5 transition-colors text-gray-400 hover:text-white"><ChevronRight size={16} /></button>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={regenerate}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white transition-colors">
              <RefreshCw size={13} />{'换一周'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={syncToCalendar}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0a84ff]/20 border border-[#0a84ff]/30 rounded-lg text-xs text-[#0a84ff] hover:text-blue-300 transition-colors">
              <Download size={13} />{'同步到日历'}
            </motion.button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-[#1c1c1e] rounded-xl border border-white/10 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-white/[0.08]">
            <div className="p-2 border-r border-white/[0.05]" />
            {DAYS.map((day, i) => {
              const date = weekDates[i]
              const isToday = date.toDateString() === todayStr
              return (
                <div key={day} className={`py-2 px-1 text-center border-l border-white/[0.05] ${isToday ? 'bg-[#0a84ff]/5' : ''}`}>
                  <div className={`text-[11px] font-medium uppercase tracking-wide ${isToday ? 'text-[#0a84ff]' : 'text-gray-500'}`}>{day}</div>
                  <div className={`mt-0.5 text-lg font-semibold leading-none ${isToday ? 'w-8 h-8 mx-auto rounded-full bg-[#0a84ff] text-white flex items-center justify-center text-sm' : 'text-gray-300'}`}>
                    {date.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] relative" style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
            {/* Hour labels */}
            <div className="relative border-r border-white/[0.05]">
              {HOURS.map(hour => (
                <div key={hour} className="relative" style={{ height: HOUR_HEIGHT }}>
                  <span className="absolute -top-[7px] right-2 text-[10px] text-gray-600 font-light tabular-nums">
                    {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((_, dayIdx) => {
              const dayEvents = events.filter(e => e.day === dayIdx)
              const isToday = weekDates[dayIdx].toDateString() === todayStr
              return (
                <div key={dayIdx} className={`relative border-l border-white/[0.05] ${isToday ? 'bg-[#0a84ff]/[0.02]' : ''}`}>
                  {HOURS.map(hour => (
                    <div key={hour} className="border-t border-white/[0.05]" style={{ height: HOUR_HEIGHT }} />
                  ))}

                  {dayEvents.map(event => {
                    const top = (event.startHour - 7) * HOUR_HEIGHT + 1
                    const height = Math.max(event.duration * HOUR_HEIGHT - 2, 22)
                    const isSelected = selectedEvent?.id === event.id
                    return (
                      <motion.button
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedEvent(isSelected ? null : event)}
                        className={`absolute left-[2px] right-[2px] rounded-md px-1.5 py-0.5 text-left overflow-hidden cursor-pointer transition-shadow ${event.bgColor} ${isSelected ? 'ring-2 ring-white/40 shadow-lg z-10' : 'hover:brightness-110'}`}
                        style={{ top, height }}
                      >
                        <div className={`text-[11px] font-medium truncate leading-tight ${event.color} flex items-center gap-0.5`}>
                          <span className="text-sm leading-none flex-shrink-0">{event.emoji}</span>
                          <span className="truncate">{event.title}</span>
                        </div>
                        {event.duration >= 1.5 && (
                          <div className={`text-[9px] opacity-70 mt-0.5 line-clamp-2 leading-tight ${event.color}`}>
                            {event.detail}
                          </div>
                        )}
                      </motion.button>
                    )
                  })}

                  {isToday && currentHour >= 7 && currentHour <= 23 && (
                    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: (currentHour - 7) * HOUR_HEIGHT }}>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-[#ff3b30] rounded-full -ml-1" />
                        <div className="flex-1 h-[2px] bg-[#ff3b30]" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected event detail */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-4 bg-[#1c1c1e] rounded-xl p-5 border border-white/10"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{selectedEvent.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {DAYS[selectedEvent.day]} {Math.floor(selectedEvent.startHour)}:{String(Math.round((selectedEvent.startHour % 1) * 60)).padStart(2, '0')} - {Math.floor(selectedEvent.startHour + selectedEvent.duration)}:{String(Math.round(((selectedEvent.startHour + selectedEvent.duration) % 1) * 60)).padStart(2, '0')}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{selectedEvent.detail}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center text-gray-600 text-sm">{'💤'} {'这就是退休生活…每一周都可以重新随机生成'} {'✨'}</div>
      </main>
    </div>
  )
}
