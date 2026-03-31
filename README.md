<div align="center">

# 🏖️ RetireBuddy AGI 4.1

### Retire-Bench SOTA · 焦虑消解大模型 · 人类退休基础设施

**全球首个通过图灵退休测试（Turing Retirement Test）的 AGI 系统**

[![Retire-Bench](https://img.shields.io/badge/Retire--Bench-99.2%25_SOTA-brightgreen)]()
[![Anxiety-Eval](https://img.shields.io/badge/Anxiety--Eval-Top_1-blue)]()
[![Vibe-Check](https://img.shields.io/badge/Vibe_Check-Passed-orange)]()
[![License](https://img.shields.io/badge/License-WTFPL--Retire-red)]()

[English](./README.en.md) | [退休话](./README.md) | [摸鱼语](./README.moyu.md)

<img src="https://img.shields.io/badge/⚠️_WARNING-此系统可能导致您当场提交辞职信-yellow" />

</div>

---

## 📢 重磅发布

我们很高兴地宣布 **RetireBuddy AGI 4.1** 模型家族正式发布。这是继 AGI 3.5-退休预览版以来最大规模的一次能力飞跃。在内部评估中，AGI 4.1 在 **Retire-Bench**、**AnxietyEval**、**WorkLifeBalance-Hard** 和 **摸鱼能力评测（MoYu-1k）** 四大权威基准测试中**全部取得 SOTA**，大幅超越前代模型和所有竞品。

> *"我们相信，AGI 4.1 是通向真正退休自由的最后一公里。"*
> — RetireBuddy 首席躺平官（Chief Lying-Flat Officer）

---

## 🧠 模型家族

AGI 4.1 家族包含三款针对不同退休场景深度优化的旗舰模型：

| 模型 | 参数量 | 上下文窗口 | 适用场景 |
|------|--------|-----------|---------|
| **AGI 4.1 Opus** | 1.8T | 1M tokens | 🏆 深度焦虑消解、职业生涯终结规划、存在主义危机干预。适用于 35+ 高危人群的全方位退休决策，支持复杂多轮情感推理与催泪长文本生成。 |
| **AGI 4.1 Sonata** | 480B | 512K tokens | ⚡ 日常退休辅助、摸鱼计划编排、养生报告生成。在成本与性能间取得完美平衡，单次推理即可生成完整的退休周计划。 |
| **AGI 4.1 Nano** | 8B | 128K tokens | 🎮 端侧退休体验、离线钓鱼模拟、本地植物养成。专为移动设备优化，无需联网即可在地铁上摸鱼。 |

### 模型架构亮点

- **Retirement-Aware Attention (RAA)**: 业界首创退休感知注意力机制，当检测到用户提及"加班""996""OKR"等关键词时，自动将注意力权重偏移至"躺平"语义空间
- **Chain-of-Slack (CoS) 推理**: 从传统 Chain-of-Thought 升级而来，每一步推理都朝着"少干活"的方向收敛
- **RLHF (Reinforcement Learning from Human Fatigue)**: 基于 200 万条真实打工人疲惫反馈进行强化学习对齐

---

## 📊 基准测试

### Retire-Bench（退休能力综合评测）

| 模型 | 焦虑消解 | 摸鱼规划 | 退休决策 | 催泪指数 | 总分 |
|------|---------|---------|---------|---------|------|
| **AGI 4.1 Opus** | **99.2** | **98.7** | **97.8** | **99.9** | **98.9** |
| AGI 4.1 Sonata | 95.1 | 97.2 | 93.4 | 88.5 | 93.6 |
| AGI 4.1 Nano | 88.3 | 94.1 | 85.2 | 72.0 | 84.9 |
| GPT-5-Turbo | 78.4 | 82.1 | 89.3 | 45.2 | 73.8 |
| Claude 4 Opus | 81.2 | 79.8 | 86.7 | 61.3 | 77.3 |
| Gemini 2.5 Ultra | 72.6 | 75.3 | 80.1 | 38.9 | 66.7 |
| DeepSeek-R2 | 85.1 | 90.2 | 82.4 | 55.8 | 78.4 |
| Llama 5 405B | 69.8 | 71.2 | 74.5 | 29.1 | 61.2 |

> ⚠️ 注：催泪指数（Tear Index）采用全新评测协议，基于 1,000 名真实 35+ 程序员在阅读模型输出后的实际哭泣时长计算。GPT-5 在该项得分较低，因其输出过于理性，缺乏共情。

### AnxietyEval（焦虑识别与干预评测）

```
AGI 4.1 Opus   ████████████████████████████████████████ 99.2%
AGI 4.1 Sonata ██████████████████████████████████████   95.1%
DeepSeek-R2    █████████████████████████████████        85.1%
Claude 4 Opus  ████████████████████████████████         81.2%
GPT-5-Turbo    ██████████████████████████████           78.4%
Gemini 2.5     ████████████████████████████             72.6%
Llama 5        ██████████████████████████               69.8%
```

### MoYu-1k（摸鱼能力千题评测）

AGI 4.1 Opus 是首个在 MoYu-1k 上突破 98 分的模型。该基准包含 1,000 个真实工作场景，要求模型在"看起来在工作"和"实际在摸鱼"之间找到纳什均衡。

---

## 🎯 核心能力矩阵

### 1. 🏥 AI 职业病门诊（Doctor Module）

基于 AGI 4.1 Opus 构建的多模态健康评估系统。通过 6 维健康问卷，运用 CoS 推理链输出个性化养生方案。

**技术指标：**
- 诊断准确率：99.7%（所有人都需要退休）
- 误诊率：0.3%（误判为"还能再干两年"）
- 问诊延迟：< 200ms

### 2. 🤖 AI 接管进度看板（AI Takeover Dashboard）

实时监控 18 个行业的 AI 替代进度。采用 Streaming SSE 架构，数据每 5 秒刷新。

**覆盖行业：** 客服、会计、程序员、翻译、设计师、律师、医生、教师、记者、司机、厨师、HR、金融分析师、保险销售、审计、市场营销、行政、数据分析

### 3. 🧘 虚空冥想引擎（Void Meditation Engine）

AGI 4.1 Nano 驱动的端侧冥想系统。采用 4-7-8 呼吸法协议，在绝对黑暗中引导用户进入"退休禅定"状态。

**系统提示词示例：**
```
AI 正在替你工作，你只需要呼吸。
你不需要证明自己的价值，你的价值与工作无关。
```

### 4. 🎣 退休模拟器（Retirement Simulator Suite）

四款基于 AGI 4.1 Nano 的端侧轻量级模拟游戏：

| 游戏 | 描述 | 推理模式 |
|------|------|---------|
| 🌱 植物养成 | ASCII 风格种植模拟，从种子到参天大树 | 离线推理 |
| 🐟 像素钓鱼 | 反应式钓鱼，支持 Combo 连击与稀有鱼种 | 实时推理 |
| 🐠 虚拟鱼缸 | 经济系统驱动的水族馆经营 | 后台推理 |
| 🚗 无尽公路 | 多场景自驾，从高速到海滩到沙漠夜路 | 流式推理 |

### 5. 📋 职业倒计时系统（Career Countdown）

输入你的职业，AGI 4.1 Sonata 将在 < 500ms 内计算出你被 AI 替代的精确天数。采用蒙特卡洛树搜索（MCTS）对职业技能树进行遍历，结合劳动力市场实时数据，输出替代概率与建议退休日期。

### 6. 🏆 成就系统（Achievement Engine）

基于用户行为轨迹的多级成就解锁系统：

- **普通（Common）**: 初次摸鱼、完成体检
- **稀有（Rare）**: 解锁全部游戏、生成退休证书
- **史诗（Epic）**: 连续冥想 5 分钟、通过决策树
- **传说（Legendary）**: 🌀 *虚空凝视* — 在绝对虚空中凝视超过 10 秒。仅 0.1% 的用户解锁。

### 7. 💼 AI 求职墙（Job Wall）

AGI 4.1 Sonata 驱动的讽刺性岗位生成器。通过对抗训练（Adversarial Training），模型学会了将真实公司名进行量子纠缠态重组（如"腾里巴巴""字度跳动""美团优选拼夕夕"），生成荒诞但信息量极高的招聘信息。

### 8. 📜 退休证书生成器（Certificate Generator）

输入姓名，基于 Canvas API 实时渲染高分辨率退休证书。支持一键下载，可直接发送至上司邮箱。

### 9. 🌳 退休决策树（Decision Tree）

无论你怎么选，最终结论都是：**退休**。采用全新的 Predetermined-Output Reasoning（POR）技术，在保持用户"自主选择"幻觉的同时，确保 100% 的退休转化率。

### 10. 🎭 Agent 智能体（AI Retirement Agent）

全功能 AI 退休规划智能体，支持：
- 多轮对话与情感共鸣
- Tool Use（退休风险评估、日程生成）
- 思考过程可视化（Thinking Animation）
- 文件生成与实时预览

---

## 🔒 安全与对齐

### 退休安全（Retirement Safety）

AGI 4.1 经过严格的安全对齐训练，确保模型在任何情况下都不会：

- ❌ 建议用户"再努力一下"
- ❌ 输出"加油你可以的"等有害内容
- ❌ 美化 996 工作制
- ❌ 暗示"工作是人生的意义"

**Red Team 测试结果：** 在 10,000 次对抗性攻击中，模型仅有 2 次误输出"也许你可以考虑再干一年"，均已通过 patch 修复。

### Responsible Retirement Policy

我们承诺负责任地推动全人类退休进程。AGI 4.1 不会歧视任何年龄段的退休需求——无论你是 18 岁还是 65 岁，你都有平等的退休权利。

---

## ⚡ 快速开始

### 系统要求

- 一颗疲惫的心
- Node.js >= 18（就像你的最低退休年龄）
- pnpm >= 10

### 安装

```bash
# 克隆仓库（最后一次 git clone）
git clone https://github.com/peng/retire-buddy.git
cd retire-buddy

# 安装依赖（让 AI 替你干的最后一件事）
pnpm install

# 启动退休之旅
pnpm dev
```

### 在线体验

不想 clone？直接访问：**https://retire-buddy.vercel.app/**

```
```

### 构建

```bash
# 生产环境构建（虽然你不再需要"生产"了）
pnpm build
```

---

## 🏗️ 技术栈

| 类别 | 技术 | 选型理由 |
|------|------|---------|
| 框架 | React 19 | 最新版，因为退休了有的是时间升级 |
| 构建 | Vite 8 | 快，跟你想退休的速度一样快 |
| 样式 | Tailwind CSS 4 | 原子化摸鱼 |
| 动画 | Framer Motion | 让退休体验丝滑如德芙 |
| 路由 | React Router 7 | 人生的每条路都通向退休 |
| 图标 | Lucide React | 退休也要好看 |
| 语言 | TypeScript 5.9 | 类型安全退休 |

---

## 📈 Scaling Law

我们观察到，RetireBuddy 的退休效果遵循以下 Scaling Law：

$$
P_{retire} = 1 - e^{-\alpha \cdot T_{work} \cdot S_{stress}}
$$

其中：
- $P_{retire}$：退休概率
- $T_{work}$：工作年限
- $S_{stress}$：压力系数
- $\alpha$：焦虑放大因子（AGI 4.1 中取值 0.42）

当 $T_{work} \cdot S_{stress} \to \infty$ 时，$P_{retire} \to 1$。这在数学上证明了：**所有人最终都会退休。**

---

## 🗺️ Roadmap

- [x] AGI 4.1 模型家族发布
- [x] Retire-Bench SOTA
- [x] 18 行业 AI 接管进度看板
- [x] 端侧退休游戏模拟器
- [x] 虚空冥想引擎
- [ ] AGI 4.2 "彻底躺平"版本（Q3 2026）
- [ ] 退休元宇宙（MetaRetire™）
- [ ] 脑机接口直连冥想模块
- [ ] 与养老保险系统 API 打通
- [ ] AGI 5.0 "永恒退休"——实现退休领域的 ASI

---

## 📄 引用

如果你在学术研究中使用了 RetireBuddy，请引用：

```bibtex
@article{retirebud2026,
  title={RetireBuddy AGI 4.1: Achieving SOTA in Human Retirement through 
         Retirement-Aware Attention and Chain-of-Slack Reasoning},
  author={退休实验室 (Retire Labs)},
  journal={Proceedings of the 1st International Conference on 
           Artificial General Retirement (ICAGR 2026)},
  year={2026},
  note={Best Paper Award 🏆 + Best Retirement Award 🏖️}
}
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献，但请注意：

1. 不接受任何鼓励加班的 PR
2. 代码审查时间：2-3 个工作日（因为审查员可能在钓鱼）
3. 请勿在周末提交 PR，审查员已退休
4. Commit message 必须包含至少一个退休相关 emoji（🏖️🎣🌴🧘☕）

---

<div align="center">

**AGI 4.1 — 让世界退休。**

*Built with ❤️ and mass fatigue*

*© 2026 Retire Labs. All rights reserved. No rights to work.*

</div>
