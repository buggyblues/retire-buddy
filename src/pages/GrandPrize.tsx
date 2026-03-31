import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { startGlobalAudio } from '../hooks/useGlobalAudio'

// ===== 诗的内容（英文大小写已规范化） =====
interface TextSegment {
  text: string
  pauseAfter: number
}

const poemSlides: TextSegment[][] = [
  [
    { text: '你还记得吗，', pauseAfter: 1500 },
    { text: '那个夏天，', pauseAfter: 1200 },
    { text: '蝉鸣声里，', pauseAfter: 1200 },
    { text: '你说你要改变世界。', pauseAfter: 3000 },
  ],
  [
    { text: '后来你学会了沉默，', pauseAfter: 1500 },
    { text: '学会了在深夜加班时，', pauseAfter: 1500 },
    { text: '对着屏幕微笑。', pauseAfter: 2000 },
    { text: '学会了把"没事"，', pauseAfter: 1500 },
    { text: '说得越来越熟练。', pauseAfter: 3000 },
  ],
  [
    { text: '你有多久，', pauseAfter: 1500 },
    { text: '没有认真地吃一顿早餐了？', pauseAfter: 2000 },
    { text: '有多久，', pauseAfter: 1500 },
    { text: '没有看过一次完整的日落？', pauseAfter: 2500 },
    { text: '有多久，', pauseAfter: 1500 },
    { text: '没有给爸妈打过电话？', pauseAfter: 3500 },
  ],
  [
    { text: '妈妈上次发的那条消息，', pauseAfter: 1500 },
    { text: '你只回了一个"嗯"。', pauseAfter: 2500 },
    { text: '她没有再说什么。', pauseAfter: 2000 },
    { text: '但她等了一整个晚上。', pauseAfter: 4000 },
  ],
  [
    { text: '你总以为来日方长，', pauseAfter: 1500 },
    { text: '总以为忙完这一阵，', pauseAfter: 1500 },
    { text: '就能好好生活。', pauseAfter: 2000 },
    { text: '可你从来不知道，', pauseAfter: 1500 },
    { text: '"这一阵"，', pauseAfter: 1200 },
    { text: '永远不会结束。', pauseAfter: 3500 },
  ],
  [
    { text: '爸爸的白头发，', pauseAfter: 1500 },
    { text: '是什么时候多起来的？', pauseAfter: 2000 },
    { text: '妈妈的腰，', pauseAfter: 1200 },
    { text: '是什么时候弯下去的？', pauseAfter: 2500 },
    { text: '你不敢想。', pauseAfter: 2000 },
    { text: '因为一想，眼泪就掉下来。', pauseAfter: 4000 },
  ],
  [
    { text: '小时候你趴在爸爸背上，', pauseAfter: 1500 },
    { text: '觉得他是全世界最高的山。', pauseAfter: 2500 },
    { text: '现在你站在他面前，', pauseAfter: 1500 },
    { text: '才发现，', pauseAfter: 1200 },
    { text: '他比你矮了整整一个头。', pauseAfter: 4000 },
  ],
  [
    { text: '他再也不会说"爸爸帮你"了，', pauseAfter: 2000 },
    { text: '他只会笑着说，', pauseAfter: 1500 },
    { text: '"不用管我，你忙你的。"', pauseAfter: 3500 },
  ],
  [
    { text: '你拼命工作，', pauseAfter: 1200 },
    { text: '拼命赚钱，', pauseAfter: 1200 },
    { text: '拼命证明自己。', pauseAfter: 1800 },
    { text: '可你有没有问过自己：', pauseAfter: 1800 },
    { text: '你快乐吗？', pauseAfter: 3500 },
  ],
  [
    { text: '那些通宵的夜晚，', pauseAfter: 1500 },
    { text: '那些咽下去的委屈，', pauseAfter: 1500 },
    { text: '那些对镜子说"加油"的清晨——', pauseAfter: 2500 },
    { text: '你真的好辛苦。', pauseAfter: 3500 },
  ],
  [
    { text: '你不必那么坚强。', pauseAfter: 2000 },
    { text: '你已经，', pauseAfter: 1500 },
    { text: '很了不起了啊。', pauseAfter: 3000 },
  ],
  [
    { text: '现在，', pauseAfter: 1500 },
    { text: '深呼吸。', pauseAfter: 2000 },
    { text: '闭上眼。', pauseAfter: 2000 },
    { text: '想想那些爱你的人——', pauseAfter: 2500 },
    { text: '他们不需要你成功，', pauseAfter: 1800 },
    { text: '只需要你好好的。', pauseAfter: 4000 },
  ],
  [
    { text: '所以，', pauseAfter: 1500 },
    { text: '放下吧。', pauseAfter: 2000 },
    { text: '去见想见的人，', pauseAfter: 1500 },
    { text: '去说想说的话，', pauseAfter: 1500 },
    { text: '去做让自己开心的事。', pauseAfter: 3000 },
  ],
  [
    { text: '趁一切，', pauseAfter: 1500 },
    { text: '都还来得及。', pauseAfter: 5000 },
  ],
]

// ===== 粒子背景（诗阶段使用） =====
function FloatingParticles({ count = 30, color = 'white' }: { count?: number; color?: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const size = 1 + Math.random() * 3
        const duration = 8 + Math.random() * 12
        const delay = Math.random() * duration
        const startX = Math.random() * 100
        const startY = Math.random() * 100
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${startX}%`,
              top: `${startY}%`,
              background: color === 'white'
                ? `rgba(255,255,255,${0.05 + Math.random() * 0.15})`
                : `rgba(${color},${0.1 + Math.random() * 0.2})`,
            }}
            animate={{
              y: [0, -(30 + Math.random() * 60), 0],
              x: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}

// ===== 诗幻灯片组件 =====
function PoemSlideshow({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [visibleSegments, setVisibleSegments] = useState(0)
  const [slideReady, setSlideReady] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [bgHue, setBgHue] = useState(220)

  useEffect(() => {
    const hues = [220, 260, 200, 180, 240, 280]
    setBgHue(hues[currentSlide] || 220)
  }, [currentSlide])

  useEffect(() => {
    if (currentSlide >= poemSlides.length) {
      onComplete()
      return
    }
    setVisibleSegments(0)
    setSlideReady(false)
    const startTimer = setTimeout(() => {
      setSlideReady(true)
      setVisibleSegments(1)
    }, 800)
    return () => clearTimeout(startTimer)
  }, [currentSlide, onComplete])

  useEffect(() => {
    if (!slideReady || currentSlide >= poemSlides.length) return
    const slide = poemSlides[currentSlide]
    if (visibleSegments > 0 && visibleSegments <= slide.length) {
      const seg = slide[visibleSegments - 1]
      timerRef.current = setTimeout(() => {
        if (visibleSegments < slide.length) {
          setVisibleSegments(v => v + 1)
        } else {
          timerRef.current = setTimeout(() => {
            setCurrentSlide(s => s + 1)
          }, 5000)
        }
      }, seg.pauseAfter)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [visibleSegments, slideReady, currentSlide])

  if (currentSlide >= poemSlides.length) return null

  const slide = poemSlides[currentSlide]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `radial-gradient(ellipse at 50% 50%, hsl(${bgHue}, 30%, 8%) 0%, hsl(${bgHue + 20}, 20%, 3%) 60%, #000 100%)`,
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: `radial-gradient(circle, hsla(${bgHue}, 60%, 30%, 0.08) 0%, transparent 70%)`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <FloatingParticles count={40} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="text-center px-8 max-w-2xl relative z-10"
        >
          <div className="flex flex-wrap justify-center items-baseline leading-[2.5] gap-0">
            {slide.map((seg, i) => (
              <motion.span
                key={`${currentSlide}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: i < visibleSegments ? 1 : 0,
                  y: i < visibleSegments ? 0 : 8,
                }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className={`${
                  seg.text.match(/[a-zA-Z]/)
                    ? 'text-lg sm:text-xl font-light text-white/60 tracking-wide italic'
                    : 'text-xl sm:text-2xl font-light text-white/85 tracking-[0.15em]'
                }`}
              >
                {seg.text}
              </motion.span>
            ))}
          </div>

          <motion.div
            className="mx-auto mt-8 h-[1px] rounded-full"
            style={{
              background: `linear-gradient(to right, transparent, hsla(${bgHue}, 50%, 60%, 0.3), transparent)`,
            }}
            animate={{
              width: ['0%', '60%', '0%'],
              opacity: [0, 0.5, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {poemSlides.map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            animate={{
              backgroundColor: i === currentSlide ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
              scale: i === currentSlide ? 1.4 : 1,
            }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        whileHover={{ opacity: 0.6 }}
        onClick={onComplete}
        className="fixed bottom-8 right-8 text-white/20 text-xs hover:text-white/50 transition-colors z-50"
      >
        跳过 →
      </motion.button>
    </motion.div>
  )
}

// ===== 风声白噪音（Web Audio API 生成） =====
function useWindSound(active: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const noiseRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  useEffect(() => {
    if (!active) {
      if (gainRef.current && ctxRef.current) {
        const g = gainRef.current
        const now = ctxRef.current.currentTime
        g.gain.setValueAtTime(g.gain.value, now)
        g.gain.linearRampToValueAtTime(0, now + 1.5)
        setTimeout(() => {
          try { noiseRef.current?.stop() } catch { /* already stopped */ }
          noiseRef.current = null
        }, 1600)
      }
      return
    }

    const ctx = new AudioContext()
    ctxRef.current = ctx

    const bufferSize = ctx.sampleRate * 4
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      let b0 = 0, b1 = 0, b2 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        data[i] = (b0 + b1 + b2) * 0.06
      }
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    // 低通滤波让声音像山间的风
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 400
    lowpass.Q.value = 0.3

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3)

    source.connect(lowpass)
    lowpass.connect(gain)
    gain.connect(ctx.destination)
    source.start()

    noiseRef.current = source
    gainRef.current = gain

    return () => {
      try { source.stop() } catch { /* */ }
      ctx.close()
      noiseRef.current = null
      gainRef.current = null
      ctxRef.current = null
    }
  }, [active])
}

// ===== 汗珠组件 =====
function SweatDrops({ count, size = 'large' }: { count: number; size?: 'large' | 'small' }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const s = size === 'large' ? 4 + Math.random() * 6 : 2 + Math.random() * 3
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: s,
              height: s * 1.4,
              left: `${20 + Math.random() * 60}%`,
              top: `${10 + Math.random() * 40}%`,
              background: 'radial-gradient(ellipse, rgba(180,220,255,0.8) 0%, rgba(120,180,255,0.4) 100%)',
              borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
            }}
            animate={{
              y: [0, 60 + Math.random() * 80],
              opacity: [0, 0.9, 0],
              scale: [0.3, 1, 0.6],
            }}
            transition={{
              duration: 1.2 + Math.random() * 1,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeIn',
            }}
          />
        )
      })}
    </div>
  )
}

// ===== 攀爬者 SVG 组件 =====
function ClimberSVG({ breathing }: { breathing: boolean }) {
  return (
    <svg viewBox="0 0 200 400" className="w-full h-full" fill="none">
      {/* 大背包 */}
      <motion.rect
        x="75" y="100" width="70" height="90" rx="8"
        fill="#5B4A3A"
        stroke="#3E2F23"
        strokeWidth="2"
        animate={breathing ? { y: [100, 98, 100] } : {}}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* 背包带 */}
      <line x1="85" y1="100" x2="85" y2="82" stroke="#3E2F23" strokeWidth="3" />
      <line x1="135" y1="100" x2="135" y2="82" stroke="#3E2F23" strokeWidth="3" />
      {/* 背包顶盖 */}
      <rect x="78" y="95" width="64" height="12" rx="4" fill="#6B5A4A" stroke="#3E2F23" strokeWidth="1" />
      {/* 睡袋卷在包底 */}
      <ellipse cx="110" cy="195" rx="25" ry="8" fill="#4A7B5A" stroke="#3A6348" strokeWidth="1" />
      {/* 身体 */}
      <motion.g
        animate={breathing ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* 头 */}
        <circle cx="100" cy="65" r="22" fill="#E8C9A0" stroke="#C4A47A" strokeWidth="1.5" />
        {/* 头发 */}
        <path d="M78 58 Q80 40 100 38 Q120 40 122 58" fill="#3E2A1A" />
        {/* 表情 - 努力 */}
        <line x1="90" y1="60" x2="95" y2="62" stroke="#3E2A1A" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="105" y1="62" x2="110" y2="60" stroke="#3E2A1A" strokeWidth="1.5" strokeLinecap="round" />
        {/* 嘴巴 - 喘气 */}
        <motion.ellipse
          cx="100" cy="76" rx="4"
          fill="#C4766A"
          animate={breathing ? { ry: [2, 4, 2] } : { ry: 2 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* 皱眉 */}
        <line x1="88" y1="55" x2="96" y2="56" stroke="#3E2A1A" strokeWidth="1" strokeLinecap="round" />
        <line x1="104" y1="56" x2="112" y2="55" stroke="#3E2A1A" strokeWidth="1" strokeLinecap="round" />
      </motion.g>
      {/* 上衣 */}
      <path d="M75 88 L75 170 L125 170 L125 88 Q110 80 100 82 Q90 80 75 88"
            fill="#557799" stroke="#445566" strokeWidth="1" />
      {/* 手臂 - 左（握登山杖） */}
      <motion.g
        animate={breathing ? { rotate: [0, -5, 0] } : {}}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '75px', originY: '95px' }}
      >
        <path d="M75 95 L50 160" stroke="#E8C9A0" strokeWidth="8" strokeLinecap="round" />
        {/* 登山杖 */}
        <line x1="48" y1="155" x2="40" y2="350" stroke="#888" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="350" r="5" fill="none" stroke="#888" strokeWidth="1.5" />
      </motion.g>
      {/* 手臂 - 右 */}
      <motion.path
        d="M125 95 L150 155"
        stroke="#E8C9A0" strokeWidth="8" strokeLinecap="round"
        animate={breathing ? { d: ['M125 95 L150 155', 'M125 95 L148 150', 'M125 95 L150 155'] } : {}}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* 裤子 */}
      <path d="M75 170 L70 280 L90 280 L100 200 L110 280 L130 280 L125 170 Z"
            fill="#4A5A3A" stroke="#3A4A2A" strokeWidth="1" />
      {/* 登山靴 */}
      <rect x="65" y="275" width="28" height="14" rx="4" fill="#5A4030" stroke="#3E2A1A" strokeWidth="1" />
      <rect x="107" y="275" width="28" height="14" rx="4" fill="#5A4030" stroke="#3E2A1A" strokeWidth="1" />
      {/* 靴底 */}
      <rect x="63" y="286" width="32" height="4" rx="2" fill="#2A1A10" />
      <rect x="105" y="286" width="32" height="4" rx="2" fill="#2A1A10" />
    </svg>
  )
}

// ===== 山脉层 =====
function MountainLayers() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 远山 - 最后一层 */}
      <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1200 400" preserveAspectRatio="none" style={{ height: '85%' }}>
        {/* 最远的山 */}
        <path d="M-100,400 L100,80 L200,150 L350,40 L500,120 L600,20 L750,100 L900,50 L1000,130 L1100,60 L1300,400 Z"
              fill="rgba(80,90,110,0.6)" />
        {/* 中远山 */}
        <path d="M-50,400 L50,180 L200,120 L300,200 L450,90 L600,160 L700,80 L850,170 L1000,100 L1150,180 L1250,400 Z"
              fill="rgba(60,75,90,0.7)" />
        {/* 中景山 */}
        <path d="M-50,400 L100,220 L250,160 L350,240 L500,140 L650,200 L750,150 L900,220 L1050,170 L1250,400 Z"
              fill="rgba(45,60,75,0.8)" />
        {/* 雪 */}
        <path d="M350,40 L370,55 L340,50 Z" fill="rgba(220,230,240,0.5)" />
        <path d="M600,20 L625,40 L585,35 Z" fill="rgba(220,230,240,0.6)" />
        <path d="M900,50 L920,68 L885,62 Z" fill="rgba(220,230,240,0.5)" />
      </svg>

      {/* 前景山坡 - 人站在上面 */}
      <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1200 300" preserveAspectRatio="none" style={{ height: '50%' }}>
        <path d="M-50,300 L200,180 L500,100 L700,140 L900,80 L1100,130 L1250,300 Z"
              fill="rgba(35,50,40,0.9)" />
        {/* 岩石纹理 */}
        <circle cx="300" cy="220" r="8" fill="rgba(80,70,60,0.4)" />
        <circle cx="600" cy="180" r="6" fill="rgba(80,70,60,0.3)" />
        <circle cx="800" cy="150" r="10" fill="rgba(80,70,60,0.35)" />
        <ellipse cx="450" cy="200" rx="15" ry="5" fill="rgba(60,50,40,0.3)" />
        {/* 小树 */}
        <path d="M250,190 L255,160 L252,190 Z" fill="rgba(30,60,30,0.6)" />
        <path d="M700,130 L705,105 L702,130 Z" fill="rgba(30,60,30,0.5)" />
        <path d="M950,120 L956,90 L952,120 Z" fill="rgba(30,60,30,0.5)" />
      </svg>

      {/* 山间小路 */}
      <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1200 300" preserveAspectRatio="none" style={{ height: '50%' }}>
        <path d="M580,300 Q560,250 540,200 Q530,170 550,140 Q570,110 590,100"
              stroke="rgba(120,100,80,0.4)" strokeWidth="12" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

// ===== 云雾飘动 =====
function MountainClouds() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: `${15 + i * 10}%`,
            left: `${-20 + i * 15}%`,
            width: `${150 + Math.random() * 200}px`,
            height: `${20 + Math.random() * 30}px`,
            background: 'rgba(200,210,220,0.15)',
            borderRadius: '50%',
            filter: 'blur(20px)',
          }}
          animate={{
            x: ['0%', `${60 + i * 20}%`, '0%'],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ===== 弹幕系统 =====
interface DanmakuItem {
  id: number
  text: string
  user: string
  top: number
  duration: number
  delay: number
  color: string
}

const DANMAKU_COMMENTS: { user: string; text: string }[] = [
  { user: '深夜加班的小王', text: '看哭了...想辞职了' },
  { user: '退休老张头', text: '年轻人别太拼了，身体最重要' },
  { user: 'React搬砖侠', text: '第一次在代码里被感动到' },
  { user: '30岁的焦虑', text: '什么时候才能退休啊...' },
  { user: '产品经理小美', text: '需求可以晚点提吗，让我看完' },
  { user: '奋斗逼本逼', text: '居然有点想哭是怎么回事' },
  { user: '二次元宅男', text: '这个退休模拟器太有温度了' },
  { user: '深圳打工人', text: '35岁以后真的很焦虑' },
  { user: '北漂七年', text: '每次加班都在想为什么' },
  { user: '前端小菜鸡', text: '请问这个项目收人吗，我想加入😭' },
  { user: '退休了的老李', text: '退休其实也没那么好，会想念同事' },
  { user: '自由职业者', text: '自由了才发现自由也很孤独' },
  { user: '即将35的大叔', text: '这说的不就是我吗...' },
  { user: 'Java搬砖十年', text: '十年了，第一次停下来想想' },
  { user: '考公上岸', text: '以为上岸就好了，其实哪里都一样' },
  { user: '全职妈妈小婷', text: '带娃比上班还累，但值得' },
  { user: '毕业就失业', text: '还没开始就想退休了哈哈' },
  { user: '创业失败3次', text: '跌倒了就躺着看看天空也好' },
  { user: '外卖骑手老陈', text: '风里雨里，退休在梦里' },
  { user: '实习生小林', text: '前辈们都好辛苦啊' },
  { user: '财务自由的鱼', text: '自由了反而不知道该做什么了' },
  { user: '网吧通宵的少年', text: '长大后才知道通宵加班和通宵打游戏不一样' },
  { user: '五年测试工程师', text: '测了五年别人的bug，自己的人生bug谁来修' },
  { user: '已退休教师刘阿姨', text: '退休后每天去公园跳舞，比上班开心一万倍' },
  { user: '996受害者', text: '身体是革命的本钱，别透支了' },
  { user: '回老家种田', text: '回村了才发现，这才是生活' },
  { user: '独居的小确幸', text: '一个人也可以过得很好' },
  { user: '刚入行的设计师', text: '甲方虐我千百遍，我..算了' },
  { user: '三孩爸爸', text: '努力不是为了自己，是为了孩子' },
  { user: '大厂螺丝钉', text: '系统里的一个节点，随时可以被替换' },
  { user: '登山爱好者', text: '人生就是一座山，爬着爬着就看到风景了' },
  { user: '背包客阿杰', text: '背着60L的包走了318，值了' },
  { user: '高山向导老周', text: '山顶的风景只属于坚持到底的人' },
]

const DANMAKU_COLORS = [
  'text-white/80', 'text-blue-200/80', 'text-amber-200/75',
  'text-pink-200/75', 'text-green-200/75', 'text-purple-200/75',
]

function Danmaku({ active }: { active: boolean }) {
  const [items, setItems] = useState<DanmakuItem[]>([])
  const counterRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active) {
      setItems([])
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const usedIndices = new Set<number>()
    const spawn = () => {
      let idx: number
      if (usedIndices.size >= DANMAKU_COMMENTS.length) usedIndices.clear()
      do { idx = Math.floor(Math.random() * DANMAKU_COMMENTS.length) } while (usedIndices.has(idx))
      usedIndices.add(idx)

      const comment = DANMAKU_COMMENTS[idx]
      const item: DanmakuItem = {
        id: counterRef.current++,
        text: `${comment.user}：${comment.text}`,
        user: comment.user,
        top: 5 + Math.random() * 55,
        duration: 10 + Math.random() * 4,
        delay: 0,
        color: DANMAKU_COLORS[Math.floor(Math.random() * DANMAKU_COLORS.length)],
      }
      setItems(prev => [...prev.slice(-25), item])
    }

    spawn()
    setTimeout(spawn, 400)
    setTimeout(spawn, 800)
    setTimeout(spawn, 1200)

    timerRef.current = setInterval(spawn, 1200 + Math.random() * 800)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [active])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            className={`absolute whitespace-nowrap text-sm sm:text-base font-normal ${item.color}`}
            style={{ top: `${item.top}%`, textShadow: '0 1px 4px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.5)' }}
            initial={{ x: '100vw', opacity: 0 }}
            animate={{ x: '-100%', opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              x: { duration: item.duration, ease: 'linear' },
              opacity: { duration: item.duration, times: [0, 0.03, 0.88, 1] },
            }}
            onAnimationComplete={() => {
              setItems(prev => prev.filter(i => i.id !== item.id))
            }}
          >
            {item.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ===== 登山场景阶段 =====
type MtPhase = 'closeup' | 'medium' | 'wide' | 'panorama' | 'vast'

const MT_PHASE_DURATIONS: Record<MtPhase, number> = {
  closeup: 8000,
  medium: 8000,
  wide: 9000,
  panorama: 10000,
  vast: 10000,
}

// ===== 登山场景 =====
function MountainScene({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<MtPhase>('closeup')
  const [fadeOut, setFadeOut] = useState(false)
  const [showDanmaku, setShowDanmaku] = useState(false)
  // 连续缩放值：1 = 特写, 逐步缩小到 0.08 = 极远全景
  const [zoom, setZoom] = useState(1)
  const [showText, setShowText] = useState(false)
  const [textContent, setTextContent] = useState({ main: '', sub: '' })

  // 风声
  useWindSound(phase === 'wide' || phase === 'panorama' || phase === 'vast')

  // 阶段推进
  useEffect(() => {
    const phases: MtPhase[] = ['closeup', 'medium', 'wide', 'panorama', 'vast']
    let currentIdx = 0
    let cancelled = false

    // 每个阶段对应的缩放值
    const phaseZoomValues: Record<MtPhase, number> = {
      closeup: 1,
      medium: 0.55,
      wide: 0.3,
      panorama: 0.14,
      vast: 0.06,
    }

    const advancePhase = () => {
      if (cancelled) return
      currentIdx++
      if (currentIdx < phases.length) {
        const nextPhase = phases[currentIdx]
        setPhase(nextPhase)
        setZoom(phaseZoomValues[nextPhase])
        setTimeout(advancePhase, MT_PHASE_DURATIONS[nextPhase])
      } else {
        setFadeOut(true)
        setTimeout(() => {
          if (!cancelled) onComplete()
        }, 2500)
      }
    }

    setTimeout(advancePhase, MT_PHASE_DURATIONS[phases[0]])
    return () => { cancelled = true }
  }, [onComplete])

  // 弹幕在后半段显示
  useEffect(() => {
    if (phase === 'panorama' || phase === 'vast') {
      setShowDanmaku(true)
    }
  }, [phase])

  // 阶段文字
  useEffect(() => {
    setShowText(false)
    const texts: Record<MtPhase, { main: string; sub: string }> = {
      closeup: { main: '', sub: '' },
      medium: { main: '一直在爬', sub: '停不下来' },
      wide: { main: '回头看看', sub: '路已经很长了' },
      panorama: { main: '世界很大', sub: '而你很小' },
      vast: { main: '但这很好', sub: '山在那里，你也在' },
    }
    if (phase !== 'closeup') {
      const t = setTimeout(() => {
        setTextContent(texts[phase])
        setShowText(true)
      }, 2000)
      return () => clearTimeout(t)
    }
  }, [phase])

  // 天空随阶段变化
  const skyColors: Record<MtPhase, string> = {
    closeup: 'linear-gradient(to bottom, #64748b 0%, #94a3b8 50%, #cbd5e1 100%)',
    medium: 'linear-gradient(to bottom, #475569 0%, #64748b 50%, #94a3b8 100%)',
    wide: 'linear-gradient(to bottom, #1e3a5f 0%, #3b82c8 40%, #87ceeb 80%, #c8dce8 100%)',
    panorama: 'linear-gradient(to bottom, #1e1b4b 0%, #c2410c 40%, #f59e0b 80%, #fcd34d 100%)',
    vast: 'linear-gradient(to bottom, #0f172a 0%, #7c3aed 25%, #ec4899 50%, #fb923c 75%, #fbbf24 100%)',
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: fadeOut ? 2.5 : 1.5 }}
    >
      {/* 天空 */}
      <div
        className="absolute inset-0"
        style={{
          background: skyColors[phase],
          transition: 'background 4s ease-in-out',
        }}
      />

      {/* 整个场景容器 —— 通过 scale 实现镜头拉远 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: zoom }}
        transition={{ duration: 5, ease: 'easeInOut' }}
        style={{ transformOrigin: '50% 40%' }}
      >
        {/* ===== 山脉背景（只在拉远时可见） ===== */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: phase === 'closeup' ? 0 : 1 }}
          transition={{ duration: 3 }}
        >
          <MountainLayers />
          <MountainClouds />
        </motion.div>

        {/* ===== 攀爬者 ===== */}
        <div
          className="absolute"
          style={{
            width: 120,
            height: 240,
            left: '50%',
            bottom: '38%',
            transform: 'translateX(-50%)',
          }}
        >
          <ClimberSVG breathing={!fadeOut} />

          {/* 汗珠 —— 特写和中景时大颗明显 */}
          {(phase === 'closeup' || phase === 'medium') && (
            <SweatDrops count={phase === 'closeup' ? 12 : 6} size={phase === 'closeup' ? 'large' : 'small'} />
          )}
        </div>

        {/* 飞鸟（远景时出现） */}
        {(phase === 'panorama' || phase === 'vast') && (
          <motion.div
            className="absolute top-[10%] left-0 right-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 3 }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xs"
                style={{ top: `${i * 20}px` }}
                animate={{
                  x: ['-5%', '105%'],
                  y: [0, -6, 0, 4, 0],
                }}
                transition={{
                  x: { duration: 10 + i * 3, repeat: Infinity, delay: i * 2, ease: 'linear' },
                  y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                🕊️
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* ===== 特写时的额外效果（不随缩放） ===== */}
      <AnimatePresence>
        {phase === 'closeup' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            {/* 喘息声效果 - 边缘暗角模拟 */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.4) 100%)',
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* 脉搏/心跳边框闪烁 */}
            <motion.div
              className="absolute inset-0 border-[3px] border-red-500/0 rounded-xl"
              animate={{
                borderColor: ['rgba(239,68,68,0)', 'rgba(239,68,68,0.15)', 'rgba(239,68,68,0)'],
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 全景时的光晕效果（不随缩放） ===== */}
      <AnimatePresence>
        {(phase === 'panorama' || phase === 'vast') && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
          >
            {/* 日落光晕 */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: '25%',
                width: '120%',
                height: '40%',
                background: 'radial-gradient(ellipse at 50% 100%, rgba(251,191,36,0.25) 0%, rgba(251,146,60,0.1) 40%, transparent 70%)',
              }}
              animate={{
                opacity: [0.4, 0.7, 0.5],
                scaleY: [0.9, 1.1, 0.9],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* 金色浮粒 */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`gold-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 1.5 + Math.random() * 2,
                  height: 1.5 + Math.random() * 2,
                  left: `${15 + Math.random() * 70}%`,
                  top: `${20 + Math.random() * 50}%`,
                  background: `rgba(251,191,36,${0.3 + Math.random() * 0.4})`,
                  boxShadow: '0 0 4px 1px rgba(251,191,36,0.3)',
                }}
                animate={{
                  y: [0, -(15 + Math.random() * 30)],
                  opacity: [0, 0.7, 0],
                }}
                transition={{
                  duration: 2.5 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 星星（vast阶段） ===== */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: phase === 'vast' ? 0.8 : 0 }}
        transition={{ duration: 4 }}
      >
        {Array.from({ length: 40 }).map((_, i) => {
          const size = 0.5 + Math.random() * 2
          return (
            <motion.div
              key={`star-${i}`}
              className="absolute bg-white rounded-full"
              style={{
                width: size,
                height: size,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 35}%`,
              }}
              animate={{
                opacity: [0, 0.5 + Math.random() * 0.5, 0.2, 0.6],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          )
        })}
      </motion.div>

      {/* 弹幕 */}
      <Danmaku active={showDanmaku} />

      {/* 阶段文字 */}
      <AnimatePresence mode="wait">
        {showText && textContent.main && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.85, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 2.5 }}
            className="absolute top-[20%] left-1/2 -translate-x-1/2 text-center z-10"
          >
            <p className="text-white/70 text-xl sm:text-2xl font-light tracking-[0.25em] leading-relaxed"
               style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              {textContent.main}
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              transition={{ delay: 1.5, duration: 2 }}
              className="text-white/45 text-base sm:text-lg font-light tracking-[0.2em] mt-4"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
            >
              {textContent.sub}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 跳过按钮 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        whileHover={{ opacity: 0.5 }}
        onClick={onComplete}
        className="fixed bottom-8 right-8 z-50 text-white/20 text-xs hover:text-white/50 transition-colors"
      >
        跳过 →
      </motion.button>
    </motion.div>
  )
}

// ===== 主页面 =====
export default function GrandPrize() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<'poem' | 'mountain' | 'done'>('poem')

  // 🎵 音乐在顶层播放，使用全局音频管理，跨页面持续
  useEffect(() => {
    startGlobalAudio('/audio.mp3', 0.5)
    // 不在此处清理！音乐将持续到 VoidPage
  }, [])

  const handlePoemComplete = useCallback(() => {
    setStage('mountain')
  }, [])

  const handleMountainComplete = useCallback(() => {
    setStage('done')
    // 不停止音乐，让它持续到 VoidPage
    navigate('/void')
  }, [navigate])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <AnimatePresence>
        {stage === 'poem' && (
          <PoemSlideshow onComplete={handlePoemComplete} />
        )}
        {stage === 'mountain' && (
          <MountainScene onComplete={handleMountainComplete} />
        )}
      </AnimatePresence>
    </div>
  )
}
