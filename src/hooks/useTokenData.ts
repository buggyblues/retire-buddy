import { useState, useEffect, useCallback, useRef } from 'react'

export interface TokenData {
  daily: number
  monthly: number
  yearly: number
  cumulative: number
  anxietyLevel: number // 0-100
  retireDate: Date
  trend: number[] // last 30 days
  retireTimestamp: number // 精确到毫秒的退休时间戳
}

// 基础数据（每次刷新时重新生成）
function generateBaseTokenData(): TokenData {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  )

  const baseDaily = 2_800_000_000 + Math.sin(dayOfYear * 0.1) * 500_000_000
  const daily = Math.floor(baseDaily + Math.random() * 200_000_000)
  const monthly = Math.floor(daily * 30.4 * (0.9 + Math.random() * 0.2))
  const yearly = Math.floor(monthly * 12 * (0.85 + Math.random() * 0.3))
  const cumulative = Math.floor(yearly * 2.5 + Math.random() * yearly)

  // 焦虑值基础值 80-100 之间（在极度焦虑附近徘徊，有概率达到100%）
  const anxietyLevel = Math.floor(80 + Math.random() * 21)

  const tokenThreshold = 1e15
  const progress = Math.min(cumulative / tokenThreshold, 0.99)
  const daysUntilRetire = Math.max(1, Math.floor((1 - progress) * 3650))
  const retireDate = new Date(now.getTime() + daysUntilRetire * 86400000)

  const trend = Array.from({ length: 30 }, (_, i) => {
    const base = baseDaily * (0.7 + (i / 30) * 0.3)
    return Math.floor(base + (Math.random() - 0.3) * 300_000_000)
  })

  return {
    daily, monthly, yearly, cumulative,
    anxietyLevel, retireDate, trend,
    retireTimestamp: retireDate.getTime(),
  }
}

export function useTokenData() {
  const [data, setData] = useState<TokenData>(generateBaseTokenData)
  const [loading, setLoading] = useState(false)
  const animFrameRef = useRef<number>(0)
  const lastTickRef = useRef<number>(Date.now())

  const refresh = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      setData(generateBaseTokenData())
      lastTickRef.current = Date.now()
      setLoading(false)
    }, 800)
  }, [])

  // 实时 Token 增长 + 焦虑值抖动 + 退休日期逼近
  useEffect(() => {
    const tokensPerSecond = Math.floor(data.daily / 86400) // 每秒增长的 token 数
    const retireApproachSpeed = 50 // 退休日期每秒逼近 50 毫秒

    const tick = () => {
      const now = Date.now()
      const delta = (now - lastTickRef.current) / 1000 // 秒
      lastTickRef.current = now

      setData(prev => {
        const increment = Math.floor(tokensPerSecond * delta)
        const newDaily = prev.daily + increment
        const newMonthly = prev.monthly + increment
        const newYearly = prev.yearly + increment
        const newCumulative = prev.cumulative + increment

        // 焦虑值实时在极度附近小幅波动 (85-100)
        const jitter = (Math.random() - 0.5) * 10
        const baseAnxiety = prev.anxietyLevel + (Math.random() - 0.5) * 5
        const newAnxiety = Math.max(85, Math.min(100, Math.round(baseAnxiety + jitter)))

        // 退休时间持续逼近（每秒减少一些毫秒）
        const newRetireTimestamp = prev.retireTimestamp - retireApproachSpeed * delta

        return {
          ...prev,
          daily: newDaily,
          monthly: newMonthly,
          yearly: newYearly,
          cumulative: newCumulative,
          anxietyLevel: newAnxiety,
          retireTimestamp: newRetireTimestamp,
          retireDate: new Date(newRetireTimestamp),
        }
      })

      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [data.daily])

  // 每30秒重新同步基础数据
  useEffect(() => {
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [refresh])

  return { data, loading, refresh }
}

export function formatTokenCount(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toString()
}

// 精确到毫秒的格式化
export function formatPreciseCountdown(targetTimestamp: number): {
  days: number
  hours: number
  minutes: number
  seconds: number
  ms: number
  total: string
} {
  const diff = Math.max(0, targetTimestamp - Date.now())
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  const ms = Math.floor(diff % 1000)

  return {
    days, hours, minutes, seconds, ms,
    total: `${days}天 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`,
  }
}
