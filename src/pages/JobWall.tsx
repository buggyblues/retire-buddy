import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, MapPin, X, AlertCircle, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAchievement } from '../hooks/useAchievement'

// ===== 数据池 =====
const companies = [
  // 跨企业拼接组合 —— 互联网
  '阿讯科技', '腾里巴巴', '字度跳动', '百节科技', '美多多', '京团商城', '拼东东', '网易迅', '华为度',
  '小鹅科技', '快团视频', '滴讯出行', '蚂里金服', '字为跳动', '百鹅科技', '腾节云', '阿度搜索',
  '美易电商', '京拼优选', '网多多团购', '华里智能',
  // 跨企业拼接组合 —— 科技制造
  '比芯国际', '联为科技', '海力电器', '格尔智能', '美信通讯', '中积电子', '大想无人机', '商从科技',
  '旷兔视觉', '科武纪', '寒大讯飞', '创尔科技', '长信电子', '太力电', '格维智造', '中海芯片',
  // 跨企业拼接组合 —— 新能源车
  '蔚鹏汽车', '小来智驾', '理跑汽车', '零想汽车', '哪氪新能源', '极吒电动', '问己智能', '智界出行',
  '飞维塔', '阿凡汽车', '蔚想联盟', '小跑电动',
  // 跨企业拼接组合 —— 茶饮咖啡
  '星幸咖啡', '瑞巴克', '喜雪冰茶', '蜜茶道', '奶百の茗', '霸迪茶姬', '古上阿姨', '沪茗茶铺',
  '库王咖啡', '茶雪冰橙',
  // 跨企业拼接组合 —— 社交内容
  '抖红书', '快哩视频', '小音薯', '知噗社区', '微瓣笔记', '虎乎问答', '豆脖热搜', '哔手短视频',
  '灵魂即刻', '围球社交',
  // 跨企业拼接组合 —— 电商物流
  '得品会', '唯物优选', '当宁易购', '苏当优品', '国美拉拉', '考拉码头', '蘑菇得物', '寺品库',
  '顺兔速递', '中达快运', '圆丰物流', '韵通快递', '极鸟驿站', '菜邦物流', '德通速运',
  // 跨企业拼接组合 —— 地产银行
  '万桂地产', '碧科置业', '融大集团', '恒创地产', '保润置地', '华利集团', '龙地控股', '绿湖物业',
  '中商银行', '招信银行', '平发银行', '浦安银行', '兴大银行', '光业银行', '民夏银行', '华生银行',
  // 跨企业拼接组合 —— 保险旅游
  '平康保险', '中洋人寿', '太华保险', '新安保险', '泰光保险', '阳众保险', '水蚁互助', '微滴保障',
  '携猪旅行', '飞程网', '去蜂窝', '马哪儿旅行', '同牛旅游', '途穷游记', '驴住旅行', '春秋马蜂',
  // 跨企业拼接组合 —— 教育游戏
  '猿业帮', '作思辅导', '学东方', '新而思', '好辅来', '掌花思维', '火马编程', '斑猫学堂',
  '米莉丝', '哈角游戏', '叠纸居', '散爆世界', '西山互娱', '完美游族', '三七巨人', '游山网络',
  // 跨企业拼接组合 —— 健康招聘理财
  '字香健康', '丁节医疗', '微雨医生', '春安好医', '平狸健康', '阿年体检', '京咚医疗', '美荷健康',
  '贝如找房', '自壳公寓', '链居客', '安家地产', '58赶集', '猎勾招聘', 'BOSS聘聘', '拉猎网',
  '陆蚁理财', '蚂金所', '天花顺', '同天基金', '东球财经', '雪方财富', '老途证券', '富虎证券',
  '货满物流', '满拉拉', '福化智联', '传佑卡车', '壹天运通', '中储歌', '路满运力', '运帮集团',
]

const positions = [
  '高级前端工程师', '资深后端工程师', '全栈开发工程师', 'AI算法工程师', '机器学习工程师',
  '深度学习研究员', 'NLP算法专家', 'CV算法工程师', '推荐系统工程师', '搜索引擎工程师',
  '大数据工程师', '数据分析师', '数据科学家', 'ETL开发工程师', '数据仓库工程师',
  'DevOps工程师', 'SRE运维工程师', '云原生架构师', 'Kubernetes专家', '安全工程师',
  'iOS开发工程师', 'Android开发工程师', 'Flutter开发工程师', 'React Native开发', '鸿蒙开发工程师',
  '产品经理', '高级产品经理', '产品总监', '用户增长产品经理', '商业化产品经理',
  'UI设计师', 'UX设计师', '交互设计师', '视觉设计总监', '品牌设计师',
  '项目经理', '技术项目经理', 'PMO', '敏捷教练', 'Scrum Master',
  '测试工程师', '自动化测试', '性能测试工程师', '安全测试工程师', '测试开发工程师',
  '技术总监', 'CTO', '架构师', '技术VP', '工程效能负责人',
  '运营经理', '内容运营', '社区运营', '用户运营', '活动运营',
  '市场总监', '品牌经理', '公关经理', '渠道经理', '新媒体运营',
  '销售经理', '大客户经理', '商务拓展', '战略合作', '招商经理',
  'HR经理', 'HRBP', '招聘专员', '薪酬绩效专家', '组织发展',
  '财务经理', '审计师', '风控专家', '投资经理', '融资经理',
  '法务顾问', '合规经理', '知识产权专家', '隐私保护官', '法务总监',
  '供应链经理', '采购经理', '仓储经理', '物流经理', '品质经理',
  '客服主管', '投诉处理专家', 'VIP客户经理', '客户成功经理', '售后支持',
  '行政主管', '前台接待', '办公室管理', '差旅管理', '企业文化',
  'Golang开发工程师', 'Rust开发工程师', 'Java资深开发', 'Python工程师', 'C++开发',
]

const salaryRanges = [
  '3-5K', '5-8K', '8-12K', '10-15K', '12-18K', '15-25K', '18-30K',
  '20-35K', '25-40K', '30-50K', '35-60K', '40-70K', '50-80K', '60-100K',
  '面议（意思是很低）', '有竞争力（信我）', '不低于行业平均（平均多少不知道）',
]

const cities = [
  '北京', '上海', '深圳', '广州', '杭州', '成都', '南京', '武汉', '西安', '苏州',
  '长沙', '重庆', '郑州', '东莞', '佛山', '合肥', '青岛', '厦门', '宁波', '大连',
  '天津', '珠海', '无锡', '济南', '福州', '昆明', '贵阳', '南宁', '海口', '三亚',
]

const tags = [
  '六险一金', '弹性工作', '免费三餐', '扁平管理', '期权激励',
  '年终奖', '带薪年假', '健身房', '下午茶', '团建旅游',
  '加班严重', '大小周', '随时oncall', '周末团建', '狼性文化',
  '996福报', '007奋斗', '内卷到秃', '33岁优化', '毕业典礼',
  '远程办公', '不打卡', '外企氛围', '国企编制', '事业单位',
]

// ===== 100 种拒绝理由 =====
const rejections = [
  '❌ 系统错误：您的简历被防火墙拦截了，原因是"内容过于优秀"',
  '❌ 抱歉，该职位已在 0.003 秒前被一个 AI 应聘成功',
  '❌ 投递失败：检测到您的年龄已超过 25 岁（我们说的"年轻团队"是认真的）',
  '❌ 对不起，您的专业不够对口（我们需要既会写代码又会修空调的全栈）',
  '❌ 投递被拒：招聘者正在投递简历，暂时无法处理您的请求',
  '❌ 网络异常：您的简历在传输过程中被 AI 分析了一下，AI 笑了',
  '❌ 很遗憾，此岗位要求"有相关行业10年经验的应届生"',
  '❌ 系统提示：由于投递人数过多（2人），本岗位已提前关闭',
  '❌ 您的学历不匹配（我们要求985本科+海外博士+3年社会经验的应届生）',
  '❌ 投递失败：该公司已被收购、拆分、重组、再收购',
  '❌ 面试官出差了，预计回来时间：退休后',
  '❌ 该岗位属于内推专属通道，建议您先认识CEO的表弟',
  '❌ HR正在开会讨论为什么总是招不到人，暂时无法处理投递',
  '❌ 您的简历评分 99 分！很遗憾，及格线是 100 分',
  '❌ 投递成功！但简历已被自动归入"以后再看"文件夹（永远不看）',
  '❌ 对不起，该公司上周刚裁掉这个岗位所有员工，现在需要人来裁人',
  '❌ 检测到您有独立思考能力，不符合我们的"高度服从"文化',
  '❌ 系统崩溃：您的工作经历太丰富，数据库装不下了',
  '❌ 投递失败：您所在城市的空气质量不达标，影响工作效率',
  '❌ 请上传您的基因报告以便我们进行"文化适配度"评估',
  '❌ 该岗位薪资已调整为"奋斗补贴+梦想期权"，请确认是否仍要投递',
  '❌ 抱歉，我们的AI面试官刚刚学会说"不"，正在疯狂练习',
  '❌ 投递超时：建议您使用5G网络或亲自跑到公司门口等',
  '❌ 您的简历中检测到"work-life balance"关键词，已自动拉黑',
  '❌ 公司正在进行"降本增笑"改革，该岗位已被一个Excel宏替代',
  '❌ 此岗位要求"能承受高压"（字面意思，公司在地下3层）',
  '❌ 投递失败：今天是周五，HR已进入"表面在线实际摸鱼"模式',
  '❌ 系统识别到您有"准点下班"倾向，请先完成996思想改造课程',
  '❌ 该职位已改为无薪实习，但我们提供无限量的泡面和鸡汤',
  '❌ 很抱歉，招聘系统发现您上份工作薪资太高，我们怕您嫌弃',
  '❌ 投递异常：您的职业规划显示3年后想当CEO，这让现任CEO很不安',
  '❌ 对不起，您的星座与我们团队不兼容（我们是全白羊座团队）',
  '❌ 投递被退回：HR手滑点了"不合适"（第1000次手滑了）',
  '❌ 您的简历已进入"人才库"（注：人才库是一个/dev/null链接）',
  '❌ 该岗位要求"会Python, Java, Go, Rust, C++, 以及做饭"',
  '❌ 公司搬家了，新地址在月球基地B区，请自行安排交通',
  '❌ 投递失败：公司服务器被实习生格式化了',
  '❌ HR表示：已读不回是一种态度，请您尊重这种沉默的艺术',
  '❌ 此岗位需要"能吃苦耐劳"（翻译：工资很低但活很多）',
  '❌ 系统繁忙：前面还有 99999 人排队，预计处理时间 3 年',
  '❌ 该公司的使命是"让天下没有好做的工作"',
  '❌ 投递被AI筛掉了，理由：您的名字笔画数不吉利',
  '❌ 岗位要求熟练使用 ChatGPT，但 ChatGPT 表示它不需要同事',
  '❌ 您的投递被转发到了HR的家庭群里作为饭后笑料',
  '❌ 对不起，该公司只招属龙的、1995年出生的、家住三环内的',
  '❌ 投递失败：公司预算只够付服务器电费了',
  '❌ 很遗憾，面试流程包含12轮面试+3次笔试+1次才艺展示',
  '❌ 该岗位因"组织架构调整"已冻结（第17次调整了）',
  '❌ 您的期望薪资超过了公司全年IT预算',
  '❌ 抱歉，公司要求男性候选人身高175+、女性候选人会瑜伽',
  '❌ 该职位已被老板的侄子/侄女/表弟/发小提前预定',
  '❌ 投递成功！请耐心等待，处理周期约 6-8 个冰河世纪',
  '❌ 您的简历太长了，HR已经在第二行处睡着了',
  '❌ 此岗位"双休"的意思是：每月休两天',
  '❌ 对不起，办公室已被改造成直播间，该岗位不再需要人类',
  '❌ 检测到您没有在朋友圈转发公司宣传文章，投递无效',
  '❌ 该公司的slogan是"我们不需要员工，我们需要家人"（不发工资的那种）',
  '❌ 投递失败：您的照片不够好看（我们说的"形象气质佳"是门槛）',
  '❌ 系统推荐您去投递"CEO"岗位——因为其他岗位都不配您（实际上是嘲讽）',
  '❌ 公司即将IPO（I Pray and Overthink），暂停招聘',
  '❌ 该岗位需要一个人完成整个部门的工作，我们称之为"核心骨干"',
  '❌ 投递被拒：发现您在竞对公司待过，请先签署"灵魂转让协议"',
  '❌ 您的简历里写了"熟悉"二字，我们只要"精通"——精通宇宙万物的那种',
  '❌ HR正在被裁，暂时无法处理投递。如果您想应聘HR……也在被裁名单上',
  '❌ 该岗位需要同时会前端、后端、运维、设计、产品、保洁',
  '❌ 您的投递被安排在了"下辈子再看"队列中',
  '❌ 对不起，公司团建太频繁，实在没时间上班也没时间面试',
  '❌ 此岗位要求自带电脑、自带工位、自带办公室、自带客户',
  '❌ 系统发现您上一份工作是正常下班的，这在我们公司是禁忌',
  '❌ 该公司已被ChatGPT-6全面接管，人类简历暂不接受',
  '❌ 投递成功！不过公司已经搬到元宇宙了，请准备好VR设备报到',
  '❌ 岗位描述中的"弹性工作制"指的是弹性上班（可以早来）但不弹性下班',
  '❌ 您的简历关键词命中了我们的"太正常了不适合我们"过滤器',
  '❌ 面试安排在凌晨3点，以测试您对"随时待命"的理解',
  '❌ 该岗位的前任离职原因：头发掉光了。请评估自身风险后投递',
  '❌ 投递失败：该公司已转型做直播带货，程序员请改投"才艺主播"',
  '❌ 抱歉，您没有在招聘贴下留言"已投，求捞"，投递无效',
  '❌ 该公司的面试流程被外包给另一家公司了，那家公司又外包了出去',
  '❌ 投递异常：系统发现您还没关注公司公众号，请先关注再投递',
  '❌ HR当前正在与 AI 就"谁来面试谁"展开激烈辩论',
  '❌ 公司政策：所有候选人必须先通过"办公室政治模拟考试"',
  '❌ 该岗位月薪 3000，但你可以接触到"价值百万的人脉"',
  '❌ 投递失败：您没有推荐人（我们的推荐人要求：马云or马化腾）',
  '❌ 此岗位实际上是"志愿者"，但为了好看我们写成了"工程师"',
  '❌ 对不起，算法预测您入职3个月后会提离职，所以我们直接帮您省了这3个月',
  '❌ 该公司正处于"战略收缩期"（翻译：快倒闭了）',
  '❌ 投递被退回：您的微信步数太少，不符合"热爱运动"的要求',
  '❌ 面试已满，排到了2028年。届时该岗位大概率已不存在',
  '❌ 投递失败：公司要求候选人的朋友圈必须设置为"全部可见"',
  '❌ 你的简历在众多候选人中脱颖而出——被我们的垃圾邮件过滤器拦截了',
  '❌ 对不起，您的职级太高了，我们怕管不住您',
  '❌ 该岗位预算因为老板买了一辆新保时捷而被砍掉了',
  '❌ 投递成功！但PDF解析失败，我们只看到了一堆乱码和您的证件照',
  '❌ 招聘系统升级中，预计完成时间：等新一代HR入职之后',
  '❌ 对不起，我们需要一个"35岁以下、10年以上经验"的候选人（请从15岁开始工作）',
  '❌ 此岗位试用期6个月，试用期薪资为正式薪资的30%，正式薪资为市场价的30%',
  '❌ 公司不提供办公椅，我们相信站立办公更健康（实际上是没钱买椅子）',
  '❌ 投递失败：我们用情感分析了您的简历，检测到"不够狼性"',
  '❌ 岗位已关闭，原因：这个岗位本来就不存在，只是为了收集简历充KPI',
  '❌ 该公司的核心竞争力是"画饼"，投递请自备消化药',
  '❌ 抱歉，面试流程新增"直系领导相亲环节"，请先提交单身证明',
]

// ===== 生成 1000 个职位 =====
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

interface Job {
  id: number
  company: string
  position: string
  salary: string
  city: string
  tags: string[]
  color: string
}

function generateJobs(): Job[] {
  const cardColors = [
    'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    'from-purple-500/10 to-pink-500/10 border-purple-500/20',
    'from-green-500/10 to-emerald-500/10 border-green-500/20',
    'from-orange-500/10 to-yellow-500/10 border-orange-500/20',
    'from-red-500/10 to-pink-500/10 border-red-500/20',
    'from-indigo-500/10 to-violet-500/10 border-indigo-500/20',
    'from-teal-500/10 to-cyan-500/10 border-teal-500/20',
    'from-amber-500/10 to-orange-500/10 border-amber-500/20',
  ]

  const jobs: Job[] = []
  for (let i = 0; i < 1000; i++) {
    const r = (offset: number) => seededRandom(i * 13 + offset)
    const company = companies[Math.floor(r(1) * companies.length)]
    const position = positions[Math.floor(r(2) * positions.length)]
    const salary = salaryRanges[Math.floor(r(3) * salaryRanges.length)]
    const city = cities[Math.floor(r(4) * cities.length)]
    const tagCount = 2 + Math.floor(r(5) * 3)
    const jobTags: string[] = []
    for (let t = 0; t < tagCount; t++) {
      const tag = tags[Math.floor(r(6 + t) * tags.length)]
      if (!jobTags.includes(tag)) jobTags.push(tag)
    }
    jobs.push({
      id: i,
      company,
      position,
      salary,
      city,
      tags: jobTags,
      color: cardColors[i % cardColors.length],
    })
  }
  return jobs
}

const ALL_JOBS = generateJobs()

// ===== 职位卡片 =====
function JobCard({ job, onApply }: { job: Job; onApply: (job: Job) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${job.color} backdrop-blur rounded-xl p-4 border hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-sm text-white leading-tight line-clamp-1">{job.position}</h4>
        <span className="text-xs text-amber-400 font-medium whitespace-nowrap ml-2">{job.salary}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <Briefcase size={12} />
        <span className="line-clamp-1">{job.company}</span>
        <MapPin size={12} />
        <span>{job.city}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {job.tags.slice(0, 3).map((tag, i) => (
          <span
            key={i}
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              tag.includes('996') || tag.includes('007') || tag.includes('加班') || tag.includes('内卷') || tag.includes('oncall') || tag.includes('狼性') || tag.includes('优化') || tag.includes('毕业')
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white/10 text-gray-400'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onApply(job) }}
        className="w-full py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 hover:border-primary/50 rounded-lg text-xs font-medium text-primary-light hover:text-white transition-all flex items-center justify-center gap-1.5 group"
      >
        <Briefcase size={12} className="group-hover:scale-110 transition-transform" />
        我要应聘
      </button>
    </motion.div>
  )
}

// ===== 拒绝弹窗 =====
function RejectionModal({ job, reason, onClose }: { job: Job; reason: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-light rounded-2xl p-8 max-w-md w-full border border-red-500/30 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-red-400">投递失败</h3>
            <p className="text-xs text-gray-500">{job.company} · {job.position}</p>
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-300 leading-relaxed">{reason}</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-gray-600">ERROR CODE: 0x{Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase()}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-colors"
          >
            我知道了（不甘心）
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ===== 主页面 =====
export default function JobWall() {
  const navigate = useNavigate()
  useAchievement('job-wall')
  const [search, setSearch] = useState('')
  const [rejection, setRejection] = useState<{ job: Job; reason: string } | null>(null)
  const [page, setPage] = useState(1)
  const [appliedCount, setAppliedCount] = useState(0)
  const pageSize = 60

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_JOBS
    const q = search.toLowerCase()
    return ALL_JOBS.filter(j =>
      j.company.toLowerCase().includes(q) ||
      j.position.toLowerCase().includes(q) ||
      j.city.toLowerCase().includes(q) ||
      j.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [search])

  const displayed = useMemo(() => filtered.slice(0, page * pageSize), [filtered, page])

  const handleApply = useCallback((job: Job) => {
    const reason = rejections[Math.floor(Math.random() * rejections.length)]
    setRejection({ job, reason })
    setAppliedCount(prev => prev + 1)
  }, [])

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                💼 招聘墙
                <span className="text-sm font-normal text-gray-500 bg-surface-light px-3 py-1 rounded-full">
                  {filtered.length} 个职位
                </span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                精选 1000 个热门岗位，总有一个拒绝你的方式让你耳目一新
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-400">{appliedCount}</div>
            <div className="text-xs text-gray-500">已被拒次数</div>
          </div>
        </div>

        {/* 搜索 */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="搜索公司、职位、城市、标签..."
            className="w-full pl-12 pr-4 py-3 bg-surface-light border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 快捷标签 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['AI', '前端', '后端', '产品', '设计', '运营', '996', '远程办公', '鹅厂', '字节抖动'].map(tag => (
            <button
              key={tag}
              onClick={() => { setSearch(tag); setPage(1) }}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                search === tag
                  ? 'bg-primary/20 text-primary-light border border-primary/30'
                  : 'bg-surface-light text-gray-400 hover:text-white border border-white/5 hover:border-white/20'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 职位网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {displayed.map(job => (
            <JobCard key={job.id} job={job} onApply={handleApply} />
          ))}
        </div>

        {/* 加载更多 */}
        {displayed.length < filtered.length && (
          <div className="text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-8 py-3 bg-surface-light hover:bg-surface-light/80 border border-white/10 rounded-2xl text-sm text-gray-300 hover:text-white transition-all"
            >
              加载更多（还有 {filtered.length - displayed.length} 个职位等着拒绝你）
            </button>
          </div>
        )}

        {displayed.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🫥</div>
            <p className="text-gray-400">没有找到相关职位...也许你可以试试送外卖？</p>
          </div>
        )}
      </main>

      {/* 拒绝弹窗 */}
      <AnimatePresence>
        {rejection && (
          <RejectionModal
            job={rejection.job}
            reason={rejection.reason}
            onClose={() => setRejection(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
