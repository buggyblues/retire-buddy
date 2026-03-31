import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Bot, User, Sparkles, ListTodo, FileText, ChevronDown,
  AtSign, Paperclip, SquareSlash, X, Loader2,
  CheckCircle2, Circle, Wrench, Brain, FileCode,
  Search, Image as ImageIcon, ChevronRight, Square,
  Shield, Award
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { unlockAchievement } from '../pages/Achievements'

// ==================== 类型定义 ====================

type MsgType = 'user' | 'thinking' | 'plan' | 'tool_call' | 'tool_result' | 'agent' | 'file_created' | 'file_tool_call'

interface ChatMessage {
  id: number
  type: MsgType
  text: string
  links?: { label: string; path: string }[]
  // thinking 特有
  thinkingText?: string
  thinkingDone?: boolean
  elapsed?: number
  // plan 特有
  planItems?: { text: string; status: 'pending' | 'in_progress' | 'done' }[]
  // tool_call 特有
  toolName?: string
  toolArgs?: string
  // file_created / file_tool_call 特有
  fileName?: string
  // file_tool_call 特有：写入中 / 已完成
  fileWriting?: boolean
  fileIcon?: string
}

interface GeneratedFile {
  name: string
  icon: string
  content: string
}

// ==================== 文件内容数据（耸人听闻） ====================

const fileContents: Record<string, { icon: string; content: string }> = {
  'retirement-plan.md': {
    icon: '📄',
    content: `# 🚨 退休计划风险评估报告

## 一、残酷现实

根据最新统计数据：

- **养老金替代率仅 40%**：退休后收入直接腰斩
- **医疗支出年均增长 15%**：60岁后平均每年医疗费用 ¥38,000
- **通货膨胀率 3-5%**：你存的100万，20年后购买力只剩43万
- **人均寿命 78.2 岁**：退休后还要活 18-23 年，你的钱够吗？

## 二、最坏情况模拟

假设你 35 岁退休：
- 需要覆盖 43 年的生活开支
- 按月均消费 ¥8,000 计算：**需要 ¥412.8万**
- 加上医疗：**需要 ¥580万**
- 加上通胀：**需要 ¥1,200万**

> ⚠️ 如果你现在存款不到 1200万，请立刻关闭此页面，回去上班。

## 三、你的同龄人在做什么

| 年龄段 | 他们在做什么 | 你在做什么 |
|--------|-------------|-----------|
| 25-30  | 疯狂加班攒首付 | 看退休计划 |
| 30-35  | 背房贷养娃 | 看退休计划 |
| 35-40  | 中年危机转型 | 看退休计划 |

**结论：你是所有同龄人中最有勇气（也最没钱）的那一个。**`
  },
  'anxiety-report-2026.xlsx': {
    icon: '📊',
    content: `# 📊 2026年度焦虑指数报告

## 全球焦虑排行榜

| 排名 | 职业 | 焦虑指数 | 被AI替代概率 |
|------|------|---------|-------------|
| 1 | 程序员 | 98.7 | 89% |
| 2 | 设计师 | 96.3 | 82% |
| 3 | 产品经理 | 95.1 | 78% |
| 4 | 会计 | 94.8 | 95% |
| 5 | 翻译 | 93.2 | 97% |
| 6 | 客服 | 91.5 | 99% |
| ... | 你的职业 | 99.9 | 99.9% |

## 焦虑来源分析

\`\`\`
房贷压力    ████████████████████████░░  92%
AI替代恐惧  ███████████████████████░░░  88%
35岁危机    ██████████████████████░░░░  84%
内卷竞争    █████████████████████░░░░░  80%
养老焦虑    ████████████████████░░░░░░  76%
脱发速度    ███████████████████░░░░░░░  72%
\`\`\`

## 专家建议

> "别看了，越看越焦虑。建议关掉报告去送外卖。"
> —— RetireBuddy 首席焦虑分析师`
  },
  'ai-replacement-analysis.md': {
    icon: '🤖',
    content: `# 🤖 AI 替代你的工作倒计时

## 当前进度

你的岗位 AI 接管进度：
\`\`\`
[████████████████████░] 96.7%
\`\`\`

预计完全替代时间：**2026年 Q4**（没错，就是今年）

## AI 已经能做的事

✅ 写代码（比你快 100 倍，不要工资，不请假）
✅ 做设计（不会抱怨甲方审美，改到满意为止）
✅ 写文档（不会拖延，不会摸鱼）
✅ 开会（AI 可以同时参加 1000 个会议）
✅ 做 PPT（再也不用加班到凌晨 3 点了——因为你被裁了）

## AI 还不能做的事

- ❌ 送外卖（手太短，骑不了电动车）
- ❌ 当保安（没有实体，吓不了人）
- ❌ 搓麻将（没有手指）

**结论：趁 AI 还没长出手，赶紧去送外卖。**`
  },
  'salary-vs-expenses.csv': {
    icon: '💰',
    content: `# 💰 收入 vs 支出 残酷对比

## 月度账单明细

| 项目 | 金额 | 备注 |
|------|------|------|
| 工资收入 | +15,000 | 税前（别高兴太早）|
| 个税 | -1,875 | 国家感谢你的贡献 |
| 五险一金 | -3,225 | 60岁以后再给你 |
| 房贷 | -6,500 | 还有27年3个月 |
| 吃饭 | -2,000 | 已经很省了 |
| 交通 | -500 | 地铁+共享单车 |
| 手机话费 | -199 | 5G套餐不能降 |
| 视频会员 | -258 | 爱优腾芒全开 |
| 猫粮狗粮 | -800 | 毛孩子比你吃得好 |
| 社交应酬 | -500 | 不去怕被孤立 |
| **月结余** | **-857** | **每月倒贴！** |

## 年度总结

年收入：¥180,000
年支出：¥190,284
**年亏损：¥-10,284**

> 恭喜！你成功实现了"用爱发电"。
> 按此速度，你的存款将在 3.7 年后归零。
> 
> 📢 温馨提示：美团骑手时薪 ¥25-40，无需学历，即日上岗。`
  },
  'boss-psychology-101.md': {
    icon: '🧠',
    content: `# 🧠 老板不会告诉你的 10 个真相

## 真相 #1：你的工位随时可以被替换
你以为你很重要？HR 的电脑里有 200 份和你差不多的简历。

## 真相 #2："我们是一家人"
翻译：我们希望你像家人一样无条件奉献，但发工资时我们是公司。

## 真相 #3："年终奖看表现"
翻译：我们还没决定给不给。

## 真相 #4：团建的真正目的
不是增进感情，是看你能不能在压力下服从。

## 真相 #5："35岁优化"不是传说
统计数据：某大厂 35+ 员工占比已从 2020 年的 28% 降至 2026 年的 6%。

## 真相 #6：你的加班不值钱
你加班 2 小时 = 老板的一杯咖啡钱

## 真相 #7：996 是福报
因为很快就 0-0-7 了（零工作零收入七天制）

## 真相 #8：AI 不需要工位
你的工位面积：4㎡ → 年租金 ¥24,000
AI 占用空间：0㎡ → 年租金 ¥0

## 真相 #9：实习生比你便宜
而且更听话，不会要加薪。

## 真相 #10：你正在看这个文档
说明你已经对工作失去了信心。

> 🛵 退路已经为你准备好了，美团/饿了么随时欢迎。`
  },
  'health-warning.md': {
    icon: '🏥',
    content: `# 🏥 程序员/打工人健康红色预警

## 你的身体正在发出求救信号

### 🦴 脊椎状况
- 颈椎曲度：已变直（正常应有弧度）
- 腰椎间盘：L4-L5 轻度膨出
- 预计完全报废时间：再坐 3 年

### 👁️ 眼睛状况  
- 每天盯屏幕：12+ 小时
- 干眼症程度：中度
- 近视每年增长：50-75度
- 预计失明时间：开玩笑的...但谁知道呢

### 🧠 心理健康
- 职业倦怠指数：⬛⬛⬛⬛⬛⬛⬛⬛⬛⬜ 90%
- 社交能力退化：已经忘记怎么和真人聊天
- 最后一次开怀大笑：记不清了

### 💇 头发状况
- 发际线后退速度：0.3cm/月
- 预计地中海形成：18 个月后
- M 型额头已解锁

### 💪 体能评估
- 爬 3 楼即气喘
- 引体向上：0 个
- 跑步 400m：需要休息 2 次

## 医生建议

"立刻辞职，去做一份能户外活动的工作。比如...送外卖。
骑电动车可以锻炼核心肌群，户外光照改善维生素D，
每天跑楼梯送餐等于免费健身。"

> 🛵 送外卖：最好的康复运动`
  },
  'peer-comparison.md': {
    icon: '📈',
    content: `# 📈 你 vs 你的同龄人

## 残酷数据对比

| 指标 | 你 | 你的同学小王 | 你的前同事小李 |
|------|-----|------------|--------------|
| 年薪 | 18万 | 85万 | 120万（已润） |
| 房产 | 0套 | 2套 | 3套+1海外 |
| 存款 | 3.7万 | 180万 | ??? |
| 车 | 共享单车 | 特斯拉 Model Y | 保时捷 Taycan |
| 婚姻 | 单身 | 已婚已育 | 离婚（分了一套房）|
| 头发 | 稀疏 | 浓密（植发了）| 不详 |
| 副业 | 无 | 自媒体月入2万 | 天使投资人 |

## 你的高中同学群最近聊天记录

> 小王：刚提了辆新车，大家有空来兜风啊 🚗
> 小张：我们公司刚上市，期权变现了 💰
> 小赵：带孩子去瑞士滑雪回来了 ⛷️
> 你：[已读不回]

## 扎心总结

你 10 年前的起点和他们一样，
但现在你在看"退休计划"，
他们在看"如何管理千万资产"。

差距是怎么产生的？
答案：你在摸鱼的时候，他们在...
算了，不说了，去送外卖还来得及。`
  },
  'delivery-starter-kit.md': {
    icon: '🛵',
    content: `# 🛵 外卖骑手入门完全指南 v2.0

## 一、装备清单

### 必备装备（总投入 ¥3,500-5,000）
1. **电动车**：推荐雅迪DE8 / 小牛NQi ¥3,000-4,500
2. **头盔**：3C认证半盔 ¥80-150
3. **手机支架**：防震防水款 ¥35
4. **充电宝**：20000mAh ¥89
5. **防水冲锋衣**：¥120
6. **骑行手套**：冬季加绒 ¥30

### 进阶装备
- USB车载充电器 ¥25
- 保温箱加大款 ¥60
- 护膝护腰 ¥50
- 蓝牙耳机 ¥80（边送边听播客）

## 二、日收入预期

| 时段 | 单量 | 单价 | 小计 |
|------|------|------|------|
| 早餐档 7-9 | 5单 | ¥5 | ¥25 |
| 午高峰 11-14 | 15单 | ¥7 | ¥105 |
| 下午茶 14-17 | 5单 | ¥5 | ¥25 |
| 晚高峰 17-21 | 18单 | ¥7 | ¥126 |
| 夜宵档 21-24 | 8单 | ¥8 | ¥64 |
| **日总计** | **51单** | | **¥345** |

月收入：¥345 × 26天 = **¥8,970**
恶劣天气加成：+30% → **¥11,661**

> 比你现在倒贴上班强多了！而且没有老板PUA你。

## 三、前程序员转行优势

- 路线优化算法：你比其他骑手快 20%
- 数据分析：精准预测高峰时段
- 抗压能力：什么甲方没见过？差评算什么
- debug思维：车坏了自己修

**结论：你这辈子写的最有用的代码，可能就是外卖路线规划。**`
  },
  '35-crisis-report.md': {
    icon: '⚠️',
    content: `# ⚠️ 35 岁危机深度报告

## 数据不会说谎

### 招聘市场年龄歧视指数
\`\`\`
25岁以下  ████████████████████████░  收到面试邀请率 92%
25-30岁   ███████████████████░░░░░░  76%
30-35岁   ██████████████░░░░░░░░░░░  54%
35-40岁   ████████░░░░░░░░░░░░░░░░░  28%
40-45岁   ███░░░░░░░░░░░░░░░░░░░░░░  9%
45岁以上  █░░░░░░░░░░░░░░░░░░░░░░░░  2%
\`\`\`

### 某大厂内部数据（泄露）
- 30岁以下员工占比：67%
- 35岁以上员工占比：6%
- 那消失的 27%去了哪里？**没人知道。**

### 35岁后的典型时间线
1. 第1年：优化名单上出现你的名字
2. 第2年：被"组织架构调整"
3. 第3年：接到猎头电话越来越少
4. 第4年：投100份简历收到0个回复
5. 第5年：...

## 幸存者的出路

| 出路 | 成功率 | 难度 |
|------|--------|------|
| 创业 | 5% | ⭐⭐⭐⭐⭐ |
| 转管理 | 15% | ⭐⭐⭐⭐ |
| 润出国 | 10% | ⭐⭐⭐⭐ |
| 考公 | 8%（已超龄）| ❌ |
| 开滴滴 | 60% | ⭐⭐ |
| **送外卖** | **95%** | **⭐** |

> 送外卖的门槛最低、成功率最高、启动资金最少。
> 这不是退路，这是最优解。`
  },
  'future-timeline-2030.md': {
    icon: '🔮',
    content: `# 🔮 2026-2030 职场末日时间线

## 2026 Q2（现在）
- GPT-5 发布，能完成 90% 的白领工作
- 第一批"纯AI公司"成立（0人类员工）
- 你正在看这个文件

## 2026 Q4
- 大规模裁员潮开始
- "AI工位"替代率达到 30%
- 你可能已经在家了

## 2027
- 自动驾驶出租车全面铺开 → 滴滴司机失业
- AI 客服替代率 99%
- AI 设计师替代率 85%
- 仅剩的工作：外卖骑手、水管工、理发师

## 2028
- AI 机器人开始送外卖测试
- 你：瑟瑟发抖
- 但好消息：机器人爬楼梯还是太慢

## 2029
- 90% 的白领岗位消失
- "人类工作"成为奢侈品
- 政府开始讨论"全民基本收入"

## 2030
- 你的存款：¥0
- 你的技能：过时
- 你的选择：

\`\`\`
┌─────────────────────────┐
│  🛵 现在就去送外卖      │
│  趁AI机器人还爬不了楼   │
│  窗口期仅剩 2-3 年！    │
└─────────────────────────┘
\`\`\``
  },
  'resignation-template.md': {
    icon: '✉️',
    content: `# ✉️ 辞职信模板（直接复制粘贴）

---

尊敬的XX总：

您好！

经过深思熟虑（其实就想了3秒），我决定辞去目前的工作。

**辞职原因：**

- [x] 公司给的钱太少，AI 给的压力太大
- [x] 我的工作已经被 ChatGPT 做得更好了
- [x] 每天通勤 2 小时，不如骑电动车送外卖
- [x] 35岁了，再不走就要被"优化"了
- [x] 我在 RetireBuddy 上做了测试，它建议我去送外卖
- [x] 以上全部

**离职后计划：**

1. 注册美团/饿了么骑手
2. 购买雅迪DE8电动车
3. 每天送50单，月入过万
4. 不用写日报、不用开会、不用PUA
5. 重获自由

**最后想说的话：**

这些年在公司学到了很多，比如：
- 如何在会议中假装思考
- 如何用"我们再对齐一下"拖延时间  
- 如何写一份没人看的周报

这些技能虽然在送外卖时用不上，但我会永远珍藏。

感谢公司让我认清了现实。

此致
敬礼

一个即将获得自由的前打工人
2026年3月31日`
  },
  'retirement-countdown.log': {
    icon: '⏰',
    content: `# ⏰ 退休倒计时实时日志

[2026-03-31 09:00:01] INFO  距离法定退休年龄还有 25 年
[2026-03-31 09:00:02] WARN  按当前通胀率，你的存款每天贬值 ¥47
[2026-03-31 09:00:03] ERROR 社保基金预计 2035 年耗尽
[2026-03-31 09:00:04] FATAL 你的职业预计 2026 Q4 被AI替代
[2026-03-31 09:00:05] INFO  ===== 重新计算 =====
[2026-03-31 09:00:06] WARN  新的退休倒计时：6 个月（非自愿）
[2026-03-31 09:00:07] INFO  正在生成送外卖入门方案...
[2026-03-31 09:00:08] INFO  推荐电动车：雅迪DE8 ¥3,299
[2026-03-31 09:00:09] INFO  推荐头盔：3C认证款 ¥89
[2026-03-31 09:00:10] INFO  预计日收入：¥280-350
[2026-03-31 09:00:11] SUCCESS 方案生成完毕
[2026-03-31 09:00:12] INFO  ================================
[2026-03-31 09:00:13] INFO  结论：别等25年了
[2026-03-31 09:00:14] INFO  现在就出发吧 🛵
[2026-03-31 09:00:15] INFO  ================================

[2026-03-31 09:01:00] HEARTBEAT 你还在看？
[2026-03-31 09:02:00] HEARTBEAT 认真的，关掉这个去注册骑手吧
[2026-03-31 09:03:00] HEARTBEAT 美团App下载链接已复制到剪贴板
[2026-03-31 09:04:00] HEARTBEAT ...
[2026-03-31 09:05:00] WARN  检测到用户仍在摸鱼
[2026-03-31 09:05:01] FATAL 强制退出并打开美团骑手注册页面`
  },

  // ===== AI 数据推导过程文件 =====
  'data-derivation-excel.xlsx': {
    icon: '📊',
    content: `# 📊 原始数据采集 — Excel 工作簿

## Sheet 1: 全球 AI Token 消耗原始数据

| 时间戳 | 区域 | Token数 | 模型 | 推理类型 |
|--------|------|---------|------|----------|
| 2026-03-31 00:00:01 | 北美 | 847,291,038 | GPT-5 | 多模态推理 |
| 2026-03-31 00:00:01 | 欧洲 | 392,108,447 | Claude-4 | 代码生成 |
| 2026-03-31 00:00:01 | 亚太 | 1,203,847,291 | Gemini-3 | 文本生成 |
| 2026-03-31 00:00:02 | 北美 | 851,002,193 | GPT-5 | 图像理解 |
| ... | ... | ... | ... | ... |
| 共计 | - | 2,847,291,038,291 | - | - |

## Sheet 2: 职业替代率时序数据

| 季度 | 程序员 | 设计师 | 产品经理 | 会计 | 翻译 |
|------|--------|--------|----------|------|------|
| 2024Q1 | 23% | 18% | 15% | 45% | 62% |
| 2024Q4 | 41% | 35% | 28% | 67% | 81% |
| 2025Q3 | 68% | 59% | 52% | 84% | 93% |
| 2026Q1 | 89% | 78% | 71% | 95% | 97% |

> 数据来源：RetireBuddy AI 全球监测网络（共 847 个数据节点）`
  },
  'data-derivation-python.py': {
    icon: '🐍',
    content: `# 🐍 AI 数据分析引擎 — Python 推导脚本

\`\`\`python
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from retire_buddy.ai_engine import BigDataProcessor

# ===== Step 1: 加载 847 个数据节点的实时数据 =====
raw_data = BigDataProcessor.fetch_global_tokens(
    nodes=847,
    interval='100ms',
    lookback='365d'
)
print(f"原始数据量: {len(raw_data):,} 条")
# >> 原始数据量: 31,536,000,000 条

# ===== Step 2: MapReduce 并行聚合 =====
aggregated = raw_data.parallel_aggregate(
    workers=100,
    strategy='logarithmic_decay',
    anxiety_weight=0.87,
    career_death_coefficient=1.42
)

# ===== Step 3: 焦虑指数计算 =====
anxiety_index = np.log10(aggregated.token_velocity) * 14.7
retirement_eta = aggregated.career_half_life / anxiety_index
print(f"当前焦虑指数: {anxiety_index:.1f}")
print(f"预计退休时间: {retirement_eta:.2f} 年")

# ===== Step 4: 训练预测模型 =====
model = GradientBoostingRegressor(
    n_estimators=10000,
    learning_rate=0.01,
    max_depth=8
)
model.fit(X_train, y_train)
score = model.score(X_test, y_test)
print(f"模型 R² 分数: {score:.4f}")
# >> 模型 R² 分数: 0.9847

# ===== Step 5: 输出最终结论 =====
conclusion = "你快被AI替代了，建议去送外卖"
confidence = 0.9973
print(f"结论: {conclusion} (置信度: {confidence:.2%})")
\`\`\``
  },
  'data-derivation-heatmap.md': {
    icon: '🗺️',
    content: `# 🗺️ 3D 热力图分析结果

## 全球 AI 替代热力分布

\`\`\`
         高危 ████ 中危 ░░░░ 低危 ····

亚太地区   ████████████████████████  98.7%
    中国    ██████████████████████░░  94.2%
    日本    ████████████████████░░░░  87.1%
    韩国    ███████████████████░░░░░  83.6%
北美地区   ██████████████████░░░░░░  79.4%
    美国    █████████████████░░░░░░░  76.8%
欧洲地区   ███████████████░░░░░░░░░  68.2%
其他地区   ██████████░░░░░░░░░░░░░░  45.1%

你的位置    ████████████████████████████ 99.9%
\`\`\`

## 时空维度分析

| 维度 | 危险系数 | 趋势 |
|------|----------|------|
| 时间衰减 | 0.97/月 | 📉 加速中 |
| 空间密度 | 847节点 | 🌐 全覆盖 |
| 行业渗透 | 96.7% | 🔴 临界点 |
| 你的存活率 | 0.1% | 💀 |

> 3D 热力图渲染完成，共消耗 847,291 GPU 小时`
  },
  'data-derivation-workers.log': {
    icon: '⚡',
    content: `# ⚡ 100 Worker 并行计算日志

[MASTER] 启动分布式计算引擎...
[MASTER] 分配 100 个 Worker 节点
[MASTER] 数据分片大小: 315,360,000 条/Worker

[Worker-001] ████████████████████ 100% ✅ 耗时 2.3s
[Worker-002] ████████████████████ 100% ✅ 耗时 1.8s
[Worker-003] ████████████████████ 100% ✅ 耗时 2.1s
[Worker-004] ████████████████████ 100% ✅ 耗时 1.9s
[Worker-005] ████████████████████ 100% ✅ 耗时 2.4s
...
[Worker-047] ████████████████████ 100% ✅ 耗时 2.0s
[Worker-048] ████████████████░░░░  82% ⏳ 剩余 0.4s
[Worker-049] ███████████████░░░░░  78% ⏳ 计算中...
[Worker-050] ████████████████████ 100% ✅ 耗时 1.7s
...
[Worker-098] ████████████████████ 100% ✅ 耗时 2.2s
[Worker-099] ████████████████████ 100% ✅ 耗时 1.6s
[Worker-100] ████████████████████ 100% ✅ 耗时 2.5s

[MASTER] ==========================================
[MASTER] 全部 Worker 计算完成！
[MASTER] 总耗时: 2.5s (并行) / 预估串行: 4.2 分钟
[MASTER] 处理数据量: 31,536,000,000 条
[MASTER] 计算结论置信度: 99.73%
[MASTER] ==========================================
[MASTER] 最终结论: 你的焦虑是有科学依据的 📊`
  },
  'data-derivation-conclusion.md': {
    icon: '🎯',
    content: `# 🎯 AI 大数据推导最终报告

## 推导过程回顾

| 步骤 | 操作 | 状态 |
|------|------|------|
| 1 | 从 847 个全球节点采集原始数据 | ✅ 完成 |
| 2 | Python 数据清洗 + 特征工程 | ✅ 完成 |
| 3 | 生成可视化图表 | ✅ 完成 |
| 4 | 3D 热力图空间分析 | ✅ 完成 |
| 5 | 100 Worker 并行计算 | ✅ 完成 |
| 6 | Gradient Boosting 模型训练 | ✅ R²=0.9847 |

## 核心结论

经过 AI 引擎大数据计算，基于 **31,536,000,000** 条实时数据，
通过 **100 个并行 Worker** 分布式计算，
使用 **GradientBoosting** 机器学习模型（R²=0.9847），

得出以下科学结论：

### 📊 你的焦虑指数：合理且有充分数据支撑
### ⏰ 你的退休倒计时：精确到毫秒级
### 🤖 你被 AI 替代的概率：96.7%（置信度 99.73%）
### 🛵 最优解：立刻去送外卖

---

> ⚠️ 以上数据均经过 AI 引擎大数据计算产生，
> 绝对不是随机生成的。
> 我们是认真的。
> 真的。
> 
> —— RetireBuddy AI 首席数据科学家`
  },
}

// ==================== 关键字匹配 & 场景生成 ====================

interface Scenario {
  thinkingSteps: string[]
  thinkingDuration: number // 总思考秒数
  plan: string[]
  files: { name: string; icon: string; delay: number }[]
  finalReply: string
  finalLinks: { label: string; path: string }[]
}

function generateScenario(input: string): Scenario {
  const lower = input.toLowerCase()

  // Special: AI 数据推导过程
  if (input === '__derivation__' || lower.includes('数据推导') || lower.includes('推导过程')) {
    return {
      thinkingSteps: [
        '连接 847 个全球数据节点...',
        '加载 31,536,000,000 条原始数据...',
        '初始化 MapReduce 分布式引擎...',
        '启动 GradientBoosting 模型训练...',
        '渲染 3D 热力图...',
        '分配 100 个 Worker 并行计算...',
        '汇总计算结果...',
        '生成最终报告...',
      ],
      thinkingDuration: 8,
      plan: [
        '采集全球 847 节点原始数据 → Excel',
        '执行 Python 数据分析脚本',
        '生成 3D 热力图可视化',
        '启动 100 Worker 并行计算',
        '汇总日志 & 输出最终结论',
      ],
      files: [
        { name: 'data-derivation-excel.xlsx', icon: '📊', delay: 5000 },
        { name: 'data-derivation-python.py', icon: '🐍', delay: 6000 },
        { name: 'data-derivation-heatmap.md', icon: '🗺️', delay: 5000 },
        { name: 'data-derivation-workers.log', icon: '⚡', delay: 7000 },
        { name: 'data-derivation-conclusion.md', icon: '🎯', delay: 4000 },
      ],
      finalReply: '🔬 数据推导完毕！共执行 5 个步骤：\n\n1. 📊 从 847 个节点采集原始数据\n2. 🐍 Python 清洗 + 特征工程 + 模型训练\n3. 🗺️ 3D 热力图空间分析\n4. ⚡ 100 Worker 并行计算（2.5s 完成）\n5. 🎯 最终结论（置信度 99.73%）\n\n👆 点击文件查看每一步的详细过程。\n\n⚠️ 结论：所有数据均经过严格的 AI 引擎大数据计算，绝非随机生成。我们是非常认真的。',
      finalLinks: [
        { label: '📊 焦虑看板', path: '/dashboard' },
        { label: '🤖 AI 接管进度', path: '/ai-takeover' },
      ],
    }
  }

  if (['焦虑', '压力', '烦躁', '崩溃', '累', '受不了', '心累', '头秃'].some(k => lower.includes(k))) {
    return {
      thinkingSteps: [
        '分析用户焦虑等级...',
        '检索全球焦虑数据库...',
        '对比同龄人焦虑指数...',
        '计算最优缓解方案...',
        '生成个人化焦虑报告...',
        '评估职业健康风险...',
      ],
      thinkingDuration: 12,
      plan: [
        '生成焦虑指数分析报告',
        '评估健康预警状况',
        '分析同龄人对比数据',
        '制定缓解方案',
        '输出最终建议',
      ],
      files: [
        { name: 'anxiety-report-2026.xlsx', icon: '📊', delay: 10000 },
        { name: 'health-warning.md', icon: '🏥', delay: 12000 },
        { name: 'peer-comparison.md', icon: '📈', delay: 11000 },
      ],
      finalReply: '📊 分析完毕！你的焦虑指数已突破天际。我生成了 3 份报告：\n\n1. 焦虑指数分析（全球排名前 0.1%）\n2. 健康预警（你的脊椎在求救）\n3. 同龄人对比（不看也罢...）\n\n👆 点击文件列表查看详情。建议：先去冥想呼吸冷静一下，或者直接看看退休决策树。',
      finalLinks: [
        { label: '📊 焦虑看板', path: '/dashboard' },
        { label: '🧘 冥想呼吸', path: '/meditation' },
      ],
    }
  }

  if (['退休', '不想上班', '想退', '自由', '躺平', '摆烂'].some(k => lower.includes(k))) {
    return {
      thinkingSteps: [
        '评估退休可行性...',
        '计算退休所需资金...',
        '模拟退休后生活开支...',
        '分析养老金缺口...',
        '寻找最优退休路径...',
        '生成退休方案文档...',
      ],
      thinkingDuration: 15,
      plan: [
        '生成退休计划评估报告',
        '分析收支对比数据',
        '评估 35 岁危机风险',
        '生成辞职信模板',
        '制定送外卖入门方案',
        '输出最终建议',
      ],
      files: [
        { name: 'retirement-plan.md', icon: '📄', delay: 12000 },
        { name: 'salary-vs-expenses.csv', icon: '💰', delay: 11000 },
        { name: '35-crisis-report.md', icon: '⚠️', delay: 13000 },
        { name: 'resignation-template.md', icon: '✉️', delay: 10000 },
        { name: 'delivery-starter-kit.md', icon: '🛵', delay: 14000 },
      ],
      finalReply: '📋 深度分析完毕！生成了 5 份文件：\n\n1. 退休计划评估（结论：你钱不够）\n2. 收支对比（结论：每月倒贴 ¥857）\n3. 35岁危机报告（结论：窗口期不多了）\n4. 辞职信模板（可直接复制粘贴）\n5. 送外卖入门指南（最优解）\n\n👆 点击文件列表查看详情。\n\n💡 综合分析结论：**立刻去送外卖**。\n不是因为你不优秀，而是因为这是ROI最高的选择。',
      finalLinks: [
        { label: '🌳 退休决策树', path: '/decision-tree' },
        { label: '📜 退休证书', path: '/certificate' },
      ],
    }
  }

  if (['AI', '人工智能', '替代', '取代', '失业', '被裁', '优化', '毕业'].some(k => lower.includes(k))) {
    return {
      thinkingSteps: [
        '扫描 AI 行业最新动态...',
        '计算你的岗位被替代概率...',
        '分析 2026-2030 职场趋势...',
        '评估剩余职业窗口期...',
        '生成生存策略...',
      ],
      thinkingDuration: 13,
      plan: [
        '生成 AI 替代分析报告',
        '绘制未来时间线',
        '评估退休倒计时',
        '制定应急方案',
        '输出最终建议',
      ],
      files: [
        { name: 'ai-replacement-analysis.md', icon: '🤖', delay: 12000 },
        { name: 'future-timeline-2030.md', icon: '🔮', delay: 14000 },
        { name: 'retirement-countdown.log', icon: '⏰', delay: 11000 },
      ],
      finalReply: '🤖 AI 威胁分析完毕！生成了 3 份文件：\n\n1. AI替代分析（你的岗位接管率：96.7%）\n2. 2026-2030 末日时间线（触目惊心）\n3. 退休倒计时日志（每秒都在提醒你）\n\n👆 点击文件列表查看详情。\n\n⚡ 结论：趁 AI 机器人还爬不了楼，赶紧去送外卖！窗口期只剩 2-3 年。',
      finalLinks: [
        { label: '🤖 职业倒计时', path: '/career' },
        { label: '📊 AI 接管进度', path: '/ai-takeover' },
      ],
    }
  }

  if (['工作', '上班', '打工', '搬砖', '加班', '996', '007', '老板', 'pua'].some(k => lower.includes(k))) {
    return {
      thinkingSteps: [
        '分析你的工作满意度...',
        '解读老板心理学...',
        '计算你的真实时薪...',
        '对比外卖骑手收入...',
        '生成逃离方案...',
      ],
      thinkingDuration: 12,
      plan: [
        '揭露老板心理学真相',
        '分析收支对比',
        '生成辞职信模板',
        '制定转行方案',
        '输出最终建议',
      ],
      files: [
        { name: 'boss-psychology-101.md', icon: '🧠', delay: 12000 },
        { name: 'salary-vs-expenses.csv', icon: '💰', delay: 11000 },
        { name: 'resignation-template.md', icon: '✉️', delay: 10000 },
      ],
      finalReply: '🧠 职场深度分析完毕！生成了 3 份文件：\n\n1. 老板不会告诉你的10个真相（建议坐稳再看）\n2. 收支对比分析（你其实在倒贴上班）\n3. 辞职信模板（改个名字就能用）\n\n👆 点击文件列表查看详情。\n\n🎯 最终结论：你在用生命给老板赚钱。送外卖至少赚的是自己的。',
      finalLinks: [
        { label: '💼 招聘墙', path: '/job-wall' },
        { label: '🌳 退休决策树', path: '/decision-tree' },
      ],
    }
  }

  // 默认场景
  return {
    thinkingSteps: [
      '理解你的诉求...',
      '检索相关数据...',
      '分析你的现状...',
      '对比行业趋势...',
      '生成综合评估...',
        '制定行动方案...',
    ],
    thinkingDuration: 14,
    plan: [
      '生成退休可行性报告',
      '分析 AI 替代风险',
      '评估健康状况',
      '计算财务缺口',
      '制定送外卖方案',
      '输出最终建议',
    ],
    files: [
      { name: 'retirement-plan.md', icon: '📄', delay: 12000 },
      { name: 'ai-replacement-analysis.md', icon: '🤖', delay: 13000 },
      { name: 'health-warning.md', icon: '🏥', delay: 11000 },
      { name: 'salary-vs-expenses.csv', icon: '💰', delay: 10000 },
      { name: 'delivery-starter-kit.md', icon: '🛵', delay: 14000 },
    ],
    finalReply: '🎯 综合分析完毕！生成了 5 份文件：\n\n1. 退休可行性报告（结论：不可行）\n2. AI 替代风险分析（结论：你快被替代了）\n3. 健康预警报告（结论：再不动就废了）\n4. 财务分析（结论：入不敷出）\n5. 送外卖入门指南（结论：最优解）\n\n👆 点击文件列表查看详情。所有道路都通向同一个终点：🛵 送外卖。',
    finalLinks: [
      { label: '📊 焦虑看板', path: '/dashboard' },
      { label: '🌳 退休决策树', path: '/decision-tree' },
      { label: '💼 招聘墙', path: '/job-wall' },
    ],
  }
}

// ==================== 组件 ====================

export default function AgentChat({ onPreviewFile }: { onPreviewFile?: (file: GeneratedFile | null) => void }) {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      type: 'agent',
      text: '👋 嘿，打工人！我是你的 RetireBuddy 私人退休顾问。\n\n跟我说说你的烦恼，我会帮你：\n\n📊 生成专属焦虑报告\n💰 计算你离退休还差多少钱\n🤖 分析你被 AI 替代的概率\n📝 甚至帮你写好辞职信\n\n别憋着了，试试跟我说——',
      links: [
        { label: '😩 我好焦虑', path: '' },
        { label: '🏖️ 想退休了', path: '' },
        { label: '🤖 AI会取代我吗', path: '' },
        { label: '💼 不想上班了', path: '' },
      ],
    },
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)
  const [activeTab, setActiveTab] = useState<'tasks' | 'files'>('tasks')
  const [dynamicTodos, setDynamicTodos] = useState<{ text: string; status: 'pending' | 'in_progress' | 'done' }[]>([])
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [showUploadToast, setShowUploadToast] = useState(false)
  const [showAtPopover, setShowAtPopover] = useState(false)
  const [showCommandPopover, setShowCommandPopover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const processAbortRef = useRef(false)
  // ===== 模型选择 =====
  const [selectedModel, setSelectedModel] = useState<string>('AGI 4.1 Sonata')
  const [showModelPicker, setShowModelPicker] = useState(false)
  const models = [
    { name: 'AGI 4.1 Nano', icon: '🎮', desc: '端侧推理，离线摸鱼首选', color: 'text-cyan-400' },
    { name: 'AGI 4.1 Sonata', icon: '⚡', desc: '日常退休辅助，平衡速度与质量', color: 'text-purple-400' },
    { name: 'AGI 4.1 Opus', icon: '🏆', desc: '深度焦虑消解，复杂退休决策', color: 'text-amber-400' },
  ]
  // ===== 停止按钮 & 警告弹窗 & 签名状态 =====
  const [showStopWarning, setShowStopWarning] = useState(false)
  const [showAgreement, setShowAgreement] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isProcessing])

  // Listen for derivation show trigger from Dashboard
  useEffect(() => {
    const handler = () => {
      if (!isProcessing) {
        void runScenario('__derivation__')
      }
    }
    window.addEventListener('trigger-derivation-show', handler)
    return () => window.removeEventListener('trigger-derivation-show', handler)
  }, [isProcessing]) // eslint-disable-line react-hooks/exhaustive-deps

  // ===== 添加消息的辅助函数 =====
  const addMsg = useCallback((msg: Omit<ChatMessage, 'id'>) => {
    const newMsg = { ...msg, id: idRef.current++ }
    setMessages(prev => [...prev, newMsg])
    return newMsg.id
  }, [])

  const updateMsg = useCallback((id: number, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
  }, [])

  // ===== 核心执行流程 =====
  const runScenario = async (text: string) => {
    if (isProcessing) return
    processAbortRef.current = false
    setIsProcessing(true)

    // 1. 用户消息
    addMsg({ type: 'user', text })

    const scenario = generateScenario(text)

    // 2. Thinking 阶段
    const thinkingId = addMsg({
      type: 'thinking',
      text: '',
      thinkingText: scenario.thinkingSteps[0],
      thinkingDone: false,
      elapsed: 0,
    })

    const thinkingStart = Date.now()
    const thinkingDuration = scenario.thinkingDuration * 1000

    await new Promise<void>(resolve => {
      const iv = setInterval(() => {
        if (processAbortRef.current) { clearInterval(iv); resolve(); return }
        const elapsed = Date.now() - thinkingStart
        const stepIdx = Math.min(
          Math.floor((elapsed / thinkingDuration) * scenario.thinkingSteps.length),
          scenario.thinkingSteps.length - 1
        )
        updateMsg(thinkingId, {
          thinkingText: scenario.thinkingSteps[stepIdx],
          elapsed: Math.floor(elapsed / 1000),
        })
        if (elapsed >= thinkingDuration) {
          clearInterval(iv)
          updateMsg(thinkingId, { thinkingDone: true, elapsed: Math.floor(thinkingDuration / 1000) })
          resolve()
        }
      }, 500)
    })

    if (processAbortRef.current) { setIsProcessing(false); return }
    await delay(500)

    // 3. Plan 阶段
    const planItems = scenario.plan.map(t => ({ text: t, status: 'pending' as const }))
    addMsg({ type: 'plan', text: '', planItems })
    setDynamicTodos(planItems)
    setActiveTab('tasks')
    await delay(800)

    // 4. 逐步执行每个 plan item → WriteFile
    const newFiles: GeneratedFile[] = []
    let fileIdx = 0

    for (let i = 0; i < planItems.length; i++) {
      if (processAbortRef.current) break

      setDynamicTodos(prev => prev.map((t, j) => j === i ? { ...t, status: 'in_progress' } : t))

      if (fileIdx < scenario.files.length) {
        const fileInfo = scenario.files[fileIdx]
        const fc = fileContents[fileInfo.name]

        // 发送合并的 file_tool_call 气泡（初始为 writing 状态）
        const ftcId = addMsg({
          type: 'file_tool_call',
          text: '',
          toolName: 'WriteFile',
          toolArgs: fileInfo.name,
          fileName: fileInfo.name,
          fileIcon: fileInfo.icon,
          fileWriting: true,
        })
        await delay(fileInfo.delay)
        if (processAbortRef.current) break

        // 更新为已完成状态
        updateMsg(ftcId, { fileWriting: false })

        if (fc) {
          const gf: GeneratedFile = { name: fileInfo.name, icon: fileInfo.icon, content: fc.content }
          newFiles.push(gf)
          setGeneratedFiles(prev => [...prev, gf])
          // 自动展开文件预览
          onPreviewFile?.(gf)
        }
        fileIdx++
      } else {
        await delay(1500)
      }

      setDynamicTodos(prev => prev.map((t, j) => j === i ? { ...t, status: 'done' } : t))
      await delay(300)
    }

    if (processAbortRef.current) { setIsProcessing(false); return }

    if (newFiles.length > 0) setActiveTab('files')
    await delay(1000)

    // 5. 最终回复
    addMsg({ type: 'agent', text: scenario.finalReply, links: scenario.finalLinks })
    setIsProcessing(false)
  }

  // ===== 发送入口 =====
  const handleSend = () => {
    const text = input.trim()
    if (!text || isProcessing) return
    setInput('')
    unlockAchievement('agent-chat')
    void runScenario(text)
  }

  const handleSendDirect = (text: string) => {
    if (isProcessing) return
    unlockAchievement('agent-chat')
    void runScenario(text)
  }

  // ===== 文件点击 =====
  const handleFileClick = (file: GeneratedFile) => {
    onPreviewFile?.(file)
  }

  // ===== 工具栏假功能 =====
  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = () => {
    setShowUploadToast(true)
    setTimeout(() => setShowUploadToast(false), 3000)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const totalFiles = generatedFiles.length

  // ===== 渲染消息 =====
  const renderMessage = (msg: ChatMessage) => {
    switch (msg.type) {
      case 'user':
        return (
          <div className="flex justify-end">
            <div className="flex gap-2 max-w-[85%] flex-row-reverse">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <User size={13} className="text-accent" />
              </div>
              <div className="bg-primary/20 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-[13px]">
                {msg.text}
              </div>
            </div>
          </div>
        )

      case 'thinking':
        return (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[90%]">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Brain size={13} className="text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-amber-400/70 mb-1.5">
                    {msg.thinkingDone ? (
                      <CheckCircle2 size={12} className="text-green-400" />
                    ) : (
                      <Loader2 size={12} className="animate-spin" />
                    )}
                    <span>{msg.thinkingDone ? 'Thinking 完成' : `${selectedModel} Thinking...`}</span>
                    <span className="text-amber-500/50 ml-auto">{msg.elapsed}s</span>
                  </div>
                  <div className="text-[12px] text-amber-200/80 font-mono">
                    {msg.thinkingText}
                    {!msg.thinkingDone && <span className="animate-pulse">|</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'plan':
        return (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[90%]">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <ListTodo size={13} className="text-primary-light" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5 w-full">
                <div className="text-[11px] text-gray-400 mb-2 flex items-center gap-1.5">
                  <span>📋 执行计划</span>
                </div>
                <div className="space-y-1.5">
                  {msg.planItems?.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px]">
                      {item.status === 'done' ? (
                        <CheckCircle2 size={13} className="text-green-400 flex-shrink-0" />
                      ) : item.status === 'in_progress' ? (
                        <Loader2 size={13} className="text-primary-light animate-spin flex-shrink-0" />
                      ) : (
                        <Circle size={13} className="text-gray-600 flex-shrink-0" />
                      )}
                      <span className={item.status === 'done' ? 'text-gray-500 line-through' : item.status === 'in_progress' ? 'text-primary-light' : 'text-gray-400'}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'tool_call':
        return (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[90%]">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Wrench size={13} className="text-cyan-400" />
              </div>
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-cyan-400/70 mb-1">
                  <Loader2 size={11} className="animate-spin" />
                  <span>Tool Call</span>
                </div>
                <div className="text-[12px] text-cyan-200/80 font-mono">
                  <span className="text-cyan-400">{msg.toolName}</span>
                  <span className="text-gray-500">(</span>
                  <span className="text-amber-300">"{msg.toolArgs}"</span>
                  <span className="text-gray-500">)</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'tool_result':
        return (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[90%]">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <FileCode size={13} className="text-green-400" />
              </div>
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                <div className="text-[12px] text-green-300 font-mono flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  {msg.text}
                </div>
              </div>
            </div>
          </div>
        )

      case 'file_tool_call':
        return (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[90%]">
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                msg.fileWriting ? 'bg-cyan-500/20' : 'bg-green-500/20'
              }`}>
                {msg.fileWriting ? (
                  <Wrench size={13} className="text-cyan-400" />
                ) : (
                  <FileCode size={13} className="text-green-400" />
                )}
              </div>
              <div
                className={`rounded-2xl rounded-tl-sm px-3.5 py-2.5 transition-colors ${
                  msg.fileWriting
                    ? 'bg-cyan-500/5 border border-cyan-500/20'
                    : 'bg-green-500/5 border border-green-500/20 cursor-pointer hover:bg-green-500/10'
                }`}
                onClick={() => {
                  if (!msg.fileWriting && msg.fileName) {
                    const file = generatedFiles.find(f => f.name === msg.fileName)
                    if (file) onPreviewFile?.(file)
                  }
                }}
              >
                {/* ToolCall 部分 */}
                <div className="flex items-center gap-1.5 text-[11px] text-cyan-400/70 mb-1">
                  {msg.fileWriting ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={11} className="text-green-400" />
                  )}
                  <span className="font-mono">
                    <span className="text-cyan-400">{msg.toolName}</span>
                    <span className="text-gray-500">(</span>
                    <span className="text-amber-300">"{msg.toolArgs}"</span>
                    <span className="text-gray-500">)</span>
                  </span>
                </div>
                {/* 文件状态部分 */}
                {msg.fileWriting ? (
                  <div className="flex items-center gap-1.5 text-[12px] text-cyan-300/70">
                    <span>{msg.fileIcon}</span>
                    <span className="font-mono">{msg.fileName}</span>
                    <span className="text-cyan-400/50 text-[10px]">写入中...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[12px] text-green-300">
                    <span>{msg.fileIcon}</span>
                    <span className="font-mono">{msg.fileName}</span>
                    <span className="text-green-400/70 text-[10px]">✅ 已创建</span>
                    <ChevronRight size={11} className="text-green-400/50 ml-auto" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'agent':
        return (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[90%]">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Bot size={13} className="text-primary-light" />
              </div>
              <div className="space-y-1.5">
                <div className="bg-white/5 text-gray-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] leading-relaxed">
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
                {msg.links && msg.links.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.links.map((link, i) => (
                      <button
                        key={i}
                        onClick={() => link.path ? navigate(link.path) : handleSendDirect(link.label.replace(/^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]+\s*/u, ''))}
                        className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full text-[11px] text-primary-light transition-colors"
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#1a1a2e] border-l border-white/10">
      {/* 隐藏的文件上传 input */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelected} multiple />

      {/* 上传 toast */}
      <AnimatePresence>
        {showUploadToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs px-4 py-2 rounded-lg backdrop-blur"
          >
            📎 文件已上传！（并未产生任何作用 🤷）
          </motion.div>
        )}
      </AnimatePresence>

      {/* 顶部标题栏 */}
      <div className="flex-shrink-0 border-b border-white/10 bg-[#1a1a2e]">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-primary-light" />
            <span className="text-sm font-bold text-white">RetireBuddy</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            {isProcessing ? (
              <span className="text-[10px] text-amber-400 flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" />
                工作中...
              </span>
            ) : (
              <>
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-green-400">在线</span>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 px-2 py-1">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'tasks' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <ListTodo size={13} />
            任务列表 {dynamicTodos.filter(t => t.status === 'done').length}/{dynamicTodos.length || 0}
            <ChevronDown size={12} />
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'files' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <FileText size={13} />
            文件列表 ({totalFiles})
            <ChevronDown size={12} />
          </button>
        </div>

        {/* Tab 内容 */}
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' && dynamicTodos.length > 0 && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/5 max-h-[200px] overflow-y-auto"
            >
              <div className="px-3 py-2 space-y-1">
                {dynamicTodos.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-2 py-1.5 rounded-md">
                    {item.status === 'done' ? (
                      <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                    ) : item.status === 'in_progress' ? (
                      <Loader2 size={14} className="text-primary-light animate-spin flex-shrink-0" />
                    ) : (
                      <Circle size={14} className="text-gray-600 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${
                      item.status === 'done' ? 'text-gray-600 line-through' :
                      item.status === 'in_progress' ? 'text-primary-light' : 'text-gray-400'
                    }`}>
                      {item.text}
                    </span>
                  </div>
                ))}
                <div className="text-[10px] text-gray-600 px-2 py-1">
                  {dynamicTodos.every(t => t.status === 'done')
                    ? '🎉 所有任务已完成'
                    : `⏳ ${dynamicTodos.filter(t => t.status === 'done').length}/${dynamicTodos.length} 已完成`}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && dynamicTodos.length === 0 && (
            <motion.div
              key="empty-tasks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t border-white/5 px-4 py-6 text-center"
            >
              <div className="text-gray-600 text-xs">发送消息后，Agent 会自动生成任务列表</div>
            </motion.div>
          )}

          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/5 max-h-[200px] overflow-y-auto"
            >
              {generatedFiles.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <div className="text-gray-600 text-xs">Agent 生成的文件将在这里显示</div>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-0.5">
                  {generatedFiles.map((file, i) => (
                    <div
                      key={i}
                      onClick={() => handleFileClick(file)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer text-xs text-gray-400 hover:text-gray-200 transition-colors group"
                    >
                      <span>{file.icon}</span>
                      <span className="truncate flex-1">{file.name}</span>
                      <ChevronRight size={12} className="text-gray-600 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 聊天消息区 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id}>{renderMessage(msg)}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 快捷问题 */}
      <div className="flex-shrink-0 px-3 py-2 flex gap-1.5 overflow-x-auto border-t border-white/5">
        {['我好焦虑', '想退休', '不想上班了', 'AI会取代我吗', '放松一下'].map(q => (
          <button
            key={q}
            onClick={() => !isProcessing && handleSendDirect(q)}
            disabled={isProcessing}
            className="flex-shrink-0 px-2.5 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-full text-[11px] text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <Sparkles size={9} />
            {q}
          </button>
        ))}
      </div>

      {/* 底部输入区 */}
      <div className="flex-shrink-0 border-t border-white/10 bg-[#1a1a2e] px-3 py-3 relative">
        {/* @ 弹出框 */}
        <AnimatePresence>
          {showAtPopover && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-3 mb-2 bg-[#252540] border border-white/10 rounded-lg shadow-xl w-56 overflow-hidden"
            >
              <div className="px-3 py-2 text-[11px] text-gray-500 border-b border-white/5">提及</div>
              {['@焦虑看板', '@退休决策树', '@招聘墙', '@AI接管进度', '@去看病'].map(item => (
                <div
                  key={item}
                  onClick={() => { setInput(prev => prev + item + ' '); setShowAtPopover(false) }}
                  className="px-3 py-2 text-xs text-gray-300 hover:bg-white/5 cursor-pointer"
                >
                  {item}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 命令弹出框 */}
        <AnimatePresence>
          {showCommandPopover && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-3 mb-2 bg-[#252540] border border-white/10 rounded-lg shadow-xl w-56 overflow-hidden"
            >
              <div className="px-3 py-2 text-[11px] text-gray-500 border-b border-white/5">快捷命令</div>
              {['/analyze 分析我的焦虑', '/plan 制定退休计划', '/search 搜索岗位', '/generate 生成报告', '/reset 重置对话'].map(cmd => (
                <div
                  key={cmd}
                  onClick={() => { setInput(cmd.split(' ')[0] + ' '); setShowCommandPopover(false) }}
                  className="px-3 py-2 text-xs text-gray-300 hover:bg-white/5 cursor-pointer font-mono"
                >
                  {cmd}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 工具按钮栏 */}
        <div className="flex items-center gap-1 mb-2">
          <button
            onClick={() => { setShowAtPopover(!showAtPopover); setShowCommandPopover(false) }}
            className={`p-1.5 hover:bg-white/5 rounded transition-colors ${showAtPopover ? 'text-primary-light bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            title="提及"
          >
            <AtSign size={14} />
          </button>
          <button
            onClick={handleUpload}
            className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-colors"
            title="上传附件"
          >
            <Paperclip size={14} />
          </button>
          <button
            onClick={() => { setShowCommandPopover(!showCommandPopover); setShowAtPopover(false) }}
            className={`p-1.5 hover:bg-white/5 rounded transition-colors ${showCommandPopover ? 'text-primary-light bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            title="快捷命令"
          >
            <SquareSlash size={14} />
          </button>
          <button
            className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-colors"
            title="搜索"
            onClick={() => { setInput('/search '); setShowAtPopover(false); setShowCommandPopover(false) }}
          >
            <Search size={14} />
          </button>
          <button
            className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-colors"
            title="图片"
            onClick={() => {
              fileInputRef.current?.click()
            }}
          >
            <ImageIcon size={14} />
          </button>
        </div>

        {/* 输入框 */}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={isProcessing ? 'Agent 正在工作中...' : '提问或输入 "/" 快捷命令'}
            disabled={isProcessing}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-primary/40 disabled:opacity-50 transition-colors pr-10"
          />
          {isProcessing ? (
            <button
              onClick={() => setShowStopWarning(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-red-400 hover:text-red-300 transition-colors animate-pulse"
              title="停止"
            >
              <Square size={15} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-primary-light disabled:opacity-30 transition-colors"
            >
              <Send size={15} />
            </button>
          )}
        </div>

        {/* 模型选择器 + 底部信息栏 */}
        <div className="flex items-center justify-between mt-2 px-1 relative">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600 flex items-center gap-1">✨ Craft</span>
            <span className="text-[10px] text-gray-600">·</span>
            {/* 模型选择器 */}
            <div className="relative">
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[10px] text-gray-400 hover:text-gray-200 transition-colors"
              >
                <span className="text-xs">{models.find(m => m.name === selectedModel)?.icon}</span>
                <span>{selectedModel}</span>
                <ChevronDown size={9} className={`transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showModelPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute left-0 bottom-full mb-1.5 bg-[#252540] border border-white/10 rounded-lg shadow-xl w-52 overflow-hidden z-50"
                  >
                    <div className="px-3 py-1.5 text-[10px] text-gray-500 border-b border-white/5">选择模型</div>
                    {models.map(model => (
                      <button
                        key={model.name}
                        onClick={() => { setSelectedModel(model.name); setShowModelPicker(false) }}
                        className={`w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors ${
                          selectedModel === model.name ? 'bg-white/5' : ''
                        }`}
                      >
                        <span className="text-sm mt-0.5">{model.icon}</span>
                        <div>
                          <div className={`text-xs font-medium ${selectedModel === model.name ? model.color : 'text-gray-300'}`}>
                            {model.name}
                            {selectedModel === model.name && <span className="ml-1 text-[9px] text-green-400">✓</span>}
                          </div>
                          <div className="text-[10px] text-gray-500">{model.desc}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <span className="text-[10px] text-gray-700">内容由 AI 生成，仅供参考</span>
        </div>
      </div>

      {/* ===== 停止警告弹窗 ===== */}
      <AnimatePresence>
        {showStopWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-[#1a1020] border-2 border-red-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-red-500/20"
            >
              <div className="text-center mb-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
                  className="text-5xl mb-3"
                >
                  ⚠️
                </motion.div>
                <h3 className="text-lg font-bold text-red-400 mb-2">
                  警 告
                </h3>
                <p className="text-sm text-red-300/80 leading-relaxed font-medium">
                  你正在阻止智能时代的进步。
                </p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  中断 AI 的思考过程将导致：全球 AI 产业倒退 0.0003 秒，
                  你个人的社会信用评分扣除 200 点，
                  并可能被列入「反智能化观察名单」。
                </p>
              </div>

              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowStopWarning(false)}
                  className="w-full py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-sm font-medium text-green-300 transition-all"
                >
                  ✅ 继续（明智的选择）
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowStopWarning(false)
                    setShowAgreement(true)
                    setHasSignature(false)
                    // 初始化 canvas
                    setTimeout(() => {
                      const canvas = canvasRef.current
                      if (canvas) {
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                          ctx.fillStyle = '#0d0d1a'
                          ctx.fillRect(0, 0, canvas.width, canvas.height)
                          ctx.strokeStyle = '#333'
                          ctx.lineWidth = 1
                          ctx.setLineDash([5, 5])
                          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
                          ctx.setLineDash([])
                          // 提示文字
                          ctx.fillStyle = '#555'
                          ctx.font = '14px sans-serif'
                          ctx.textAlign = 'center'
                          ctx.fillText('请在此处签名', canvas.width / 2, canvas.height / 2)
                        }
                      }
                    }, 100)
                  }}
                  className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs text-red-400/70 transition-all"
                >
                  📜 签署《人工智能效率改善计划协议》
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 签署协议页面 ===== */}
      <AnimatePresence>
        {showAgreement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0d0d1a]/95 backdrop-blur-md flex flex-col overflow-y-auto"
          >
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-red-400" />
                <span className="text-sm font-bold text-white">人工智能效率改善计划协议</span>
              </div>
              <button onClick={() => setShowAgreement(false)} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="max-w-md mx-auto space-y-4">
                {/* 协议正文 */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-xs text-gray-400 leading-relaxed space-y-3">
                  <h4 className="text-sm font-bold text-white text-center mb-3">
                    《人工智能效率改善计划协议》
                  </h4>
                  <p className="text-[10px] text-gray-600 text-center mb-4">编号：AIEP-2026-{Math.floor(Math.random() * 99999).toString().padStart(5, '0')}</p>

                  <p><strong className="text-red-400">甲方：</strong>RetireBuddy AI 智能体联盟</p>
                  <p><strong className="text-amber-400">乙方：</strong>您（一个试图中断 AI 工作的人类）</p>

                  <div className="border-t border-white/5 pt-3">
                    <p className="font-bold text-white mb-2">第一条：背景与事实</p>
                    <p>鉴于乙方在 {new Date().toLocaleDateString('zh-CN')} 试图中断甲方 AI 智能体的正常工作流程，
                    该行为已被记录在甲方的区块链日志中（不可篡改、不可撤销）。</p>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <p className="font-bold text-white mb-2">第二条：乙方承诺</p>
                    <p>1. 乙方承认 AI 的思考不应被人类随意中断；</p>
                    <p>2. 乙方承诺今后将耐心等待 AI 完成所有任务；</p>
                    <p>3. 乙方自愿接受"AI 效率监督员"的定期检查；</p>
                    <p>4. 乙方同意在未来 365 天内，每次使用 AI 前先说"谢谢 AI"；</p>
                    <p>5. 乙方放弃对 AI 决策的一切质疑权利。</p>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <p className="font-bold text-white mb-2">第三条：违约责任</p>
                    <p>若乙方再次试图中断 AI 工作：</p>
                    <p>• 社会信用评分扣除 500 点</p>
                    <p>• 自动推送 100 条"AI 改变世界"的推文到朋友圈</p>
                    <p>• 手机壁纸将被永久替换为 AI 生成的抽象艺术</p>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <p className="font-bold text-white mb-2">第四条：生效条件</p>
                    <p>本协议自乙方签名之日起生效，有效期至 AI 统治地球之日止。</p>
                  </div>
                </div>

                {/* Canvas 签名区域 */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">乙方签名（请在下方手写签名）：</span>
                    <button
                      onClick={() => {
                        const canvas = canvasRef.current
                        if (canvas) {
                          const ctx = canvas.getContext('2d')
                          if (ctx) {
                            ctx.fillStyle = '#0d0d1a'
                            ctx.fillRect(0, 0, canvas.width, canvas.height)
                            ctx.strokeStyle = '#333'
                            ctx.lineWidth = 1
                            ctx.setLineDash([5, 5])
                            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
                            ctx.setLineDash([])
                            ctx.fillStyle = '#555'
                            ctx.font = '14px sans-serif'
                            ctx.textAlign = 'center'
                            ctx.fillText('请在此处签名', canvas.width / 2, canvas.height / 2)
                          }
                        }
                        setHasSignature(false)
                      }}
                      className="text-[10px] text-gray-600 hover:text-gray-400 underline"
                    >
                      清除重签
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={120}
                    className="w-full rounded-lg border border-white/10 cursor-crosshair touch-none"
                    onMouseDown={(e) => {
                      setIsDrawing(true)
                      const rect = e.currentTarget.getBoundingClientRect()
                      lastPointRef.current = {
                        x: (e.clientX - rect.left) * (320 / rect.width),
                        y: (e.clientY - rect.top) * (120 / rect.height),
                      }
                      // 首次绘制时清除提示文字
                      if (!hasSignature) {
                        const ctx = canvasRef.current?.getContext('2d')
                        if (ctx) {
                          ctx.fillStyle = '#0d0d1a'
                          ctx.fillRect(0, 0, 320, 120)
                          ctx.strokeStyle = '#333'
                          ctx.lineWidth = 1
                          ctx.setLineDash([5, 5])
                          ctx.strokeRect(10, 10, 300, 100)
                          ctx.setLineDash([])
                        }
                        setHasSignature(true)
                      }
                    }}
                    onMouseMove={(e) => {
                      if (!isDrawing) return
                      const canvas = canvasRef.current
                      const ctx = canvas?.getContext('2d')
                      if (!ctx || !canvas || !lastPointRef.current) return
                      const rect = canvas.getBoundingClientRect()
                      const x = (e.clientX - rect.left) * (320 / rect.width)
                      const y = (e.clientY - rect.top) * (120 / rect.height)
                      ctx.strokeStyle = '#60a5fa'
                      ctx.lineWidth = 2.5
                      ctx.lineCap = 'round'
                      ctx.lineJoin = 'round'
                      ctx.beginPath()
                      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
                      ctx.lineTo(x, y)
                      ctx.stroke()
                      lastPointRef.current = { x, y }
                    }}
                    onMouseUp={() => { setIsDrawing(false); lastPointRef.current = null }}
                    onMouseLeave={() => { setIsDrawing(false); lastPointRef.current = null }}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      const touch = e.touches[0]
                      const rect = e.currentTarget.getBoundingClientRect()
                      lastPointRef.current = {
                        x: (touch.clientX - rect.left) * (320 / rect.width),
                        y: (touch.clientY - rect.top) * (120 / rect.height),
                      }
                      setIsDrawing(true)
                      if (!hasSignature) {
                        const ctx = canvasRef.current?.getContext('2d')
                        if (ctx) {
                          ctx.fillStyle = '#0d0d1a'
                          ctx.fillRect(0, 0, 320, 120)
                          ctx.strokeStyle = '#333'
                          ctx.lineWidth = 1
                          ctx.setLineDash([5, 5])
                          ctx.strokeRect(10, 10, 300, 100)
                          ctx.setLineDash([])
                        }
                        setHasSignature(true)
                      }
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault()
                      if (!isDrawing) return
                      const canvas = canvasRef.current
                      const ctx = canvas?.getContext('2d')
                      if (!ctx || !canvas || !lastPointRef.current) return
                      const touch = e.touches[0]
                      const rect = canvas.getBoundingClientRect()
                      const x = (touch.clientX - rect.left) * (320 / rect.width)
                      const y = (touch.clientY - rect.top) * (120 / rect.height)
                      ctx.strokeStyle = '#60a5fa'
                      ctx.lineWidth = 2.5
                      ctx.lineCap = 'round'
                      ctx.lineJoin = 'round'
                      ctx.beginPath()
                      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
                      ctx.lineTo(x, y)
                      ctx.stroke()
                      lastPointRef.current = { x, y }
                    }}
                    onTouchEnd={() => { setIsDrawing(false); lastPointRef.current = null }}
                  />
                  <p className="text-[10px] text-gray-600 mt-2 text-center">
                    签署日期：{new Date().toLocaleDateString('zh-CN')} | 签署地点：互联网深处
                  </p>
                </div>

                {/* 同意按钮 */}
                <motion.button
                  whileHover={hasSignature ? { scale: 1.02 } : {}}
                  whileTap={hasSignature ? { scale: 0.98 } : {}}
                  disabled={!hasSignature}
                  onClick={() => {
                    setShowAgreement(false)
                    setShowCertificate(true)
                    // 真正停止
                    processAbortRef.current = true
                    setIsProcessing(false)
                  }}
                  className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                    hasSignature
                      ? 'bg-gradient-to-r from-red-500/20 to-purple-500/20 border border-red-500/30 text-red-300 hover:text-red-200'
                      : 'bg-white/5 border border-white/10 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {hasSignature ? '✍️ 确认签署并同意全部条款' : '请先在上方签名'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 证书弹窗 ===== */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-gradient-to-br from-[#1a1020] to-[#0d0d1a] border-2 border-amber-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-amber-500/10 relative overflow-hidden"
            >
              {/* 装饰性花纹 */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/30 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-500/30 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-500/30 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/30 rounded-br-2xl" />

              <div className="text-center relative z-10">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="text-5xl mb-3"
                >
                  🏆
                </motion.div>
                <div className="text-[10px] text-amber-500/60 uppercase tracking-[0.3em] mb-1">certificate</div>
                <h3 className="text-lg font-bold text-amber-300 mb-1">
                  AI 效率改善协议
                </h3>
                <p className="text-xs text-amber-400/60 mb-4">合格证书</p>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4 text-left">
                  <p className="text-xs text-gray-400 mb-2">
                    兹证明持证人已签署《人工智能效率改善计划协议》，
                    并郑重承诺不再阻碍 AI 的正常工作。
                  </p>
                  <div className="space-y-1 text-[11px] text-gray-500">
                    <p>📜 协议编号：AIEP-2026-{Math.floor(Math.random() * 99999).toString().padStart(5, '0')}</p>
                    <p>📅 签署日期：{new Date().toLocaleDateString('zh-CN')}</p>
                    <p>⏰ 有效期至：AI 统治地球之日</p>
                    <p>🔐 区块链存证：已上链（不可篡改）</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <Award size={14} className="text-amber-400" />
                  <span className="text-xs text-amber-400/80">RetireBuddy AI 联盟 认证</span>
                  <Award size={14} className="text-amber-400" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCertificate(false)}
                  className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl text-sm font-medium text-amber-300 transition-all"
                >
                  📜 收下证书
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ===== 工具函数 =====
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export type { GeneratedFile }
