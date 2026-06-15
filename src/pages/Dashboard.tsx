import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { MapPin, Activity, AlertTriangle, Clock, TrendingUp, ChevronRight, Shield, Zap, Network, BarChart3 } from 'lucide-react'

const HEATMAP = [
  { province: '黑龙江', r: 1, c: 6 },
  { province: '内蒙古', r: 2, c: 3 },
  { province: '吉林', r: 2, c: 7 },
  { province: '新疆', r: 3, c: 1 },
  { province: '北京', r: 3, c: 5 },
  { province: '辽宁', r: 3, c: 7 },
  { province: '甘肃', r: 4, c: 2 },
  { province: '宁夏', r: 4, c: 3 },
  { province: '河北', r: 4, c: 5 },
  { province: '天津', r: 4, c: 6 },
  { province: '西藏', r: 5, c: 1 },
  { province: '青海', r: 5, c: 2 },
  { province: '陕西', r: 5, c: 4 },
  { province: '山西', r: 5, c: 5 },
  { province: '山东', r: 5, c: 6 },
  { province: '四川', r: 6, c: 3 },
  { province: '河南', r: 6, c: 4 },
  { province: '安徽', r: 6, c: 5 },
  { province: '江苏', r: 6, c: 6 },
  { province: '上海', r: 6, c: 7 },
  { province: '重庆', r: 7, c: 3 },
  { province: '湖北', r: 7, c: 4 },
  { province: '浙江', r: 7, c: 6 },
  { province: '云南', r: 8, c: 2 },
  { province: '贵州', r: 8, c: 3 },
  { province: '湖南', r: 8, c: 4 },
  { province: '江西', r: 8, c: 5 },
  { province: '福建', r: 8, c: 6 },
  { province: '广西', r: 9, c: 3 },
  { province: '广东', r: 9, c: 4 },
  { province: '海南', r: 10, c: 4 },
]

const healthBg = (v: number) => {
  if (v > 90) return 'linear-gradient(135deg, rgba(0,230,118,0.35) 0%, rgba(0,184,95,0.2) 100%)'
  if (v > 80) return 'linear-gradient(135deg, rgba(0,212,255,0.3) 0%, rgba(0,150,180,0.15) 100%)'
  if (v > 70) return 'linear-gradient(135deg, rgba(255,145,0,0.3) 0%, rgba(200,110,0,0.15) 100%)'
  if (v > 60) return 'linear-gradient(135deg, rgba(255,67,54,0.4) 0%, rgba(200,40,30,0.2) 100%)'
  return 'linear-gradient(135deg, rgba(255,23,68,0.5) 0%, rgba(180,10,40,0.25) 100%)'
}

const healthBorder = (v: number) => {
  if (v > 90) return 'rgba(0,230,118,0.5)'
  if (v > 80) return 'rgba(0,212,255,0.4)'
  if (v > 70) return 'rgba(255,145,0,0.5)'
  if (v > 60) return 'rgba(255,67,54,0.6)'
  return 'rgba(255,23,68,0.7)'
}

const healthColor = (v: number) =>
  v > 85 ? '#00E676' : v >= 70 ? '#FF9100' : '#FF1744'

const faultColor = (v: number) =>
  v > 1.2 ? '#FF1744' : v > 0.8 ? '#FF9100' : '#00E676'

const faultRankColor = (i: number) =>
  i === 0 ? 'text-danger' : i === 1 ? 'text-warning' : i === 2 ? 'text-yellow-400' : 'text-text-muted'

const faultRankBg = (i: number) =>
  i === 0 ? 'bg-danger/10' : i === 1 ? 'bg-warning/10' : i === 2 ? 'bg-yellow-400/10' : 'bg-transparent'

export default function Dashboard() {
  const navigate = useNavigate()
  const getComputedStats = useAppStore(s => s.getComputedStats)
  const getFilteredSummaries = useAppStore(s => s.getFilteredProvinceSummaries)
  const getFilteredAlerts = useAppStore(s => s.getFilteredAlerts)
  const selectedProvince = useAppStore(s => s.selectedProvince)
  const selectedCarrier = useAppStore(s => s.selectedCarrier)
  const setSelectedProvince = useAppStore(s => s.setSelectedProvince)
  const setSelectedCarrier = useAppStore(s => s.setSelectedCarrier)
  const stats = getComputedStats()
  const summaries = getFilteredSummaries()
  const alerts = getFilteredAlerts()

  const provinceMap = useMemo(() => new Map(summaries.map(s => [s.province, s])), [summaries])
  const faultRanking = useMemo(() => [...summaries].sort((a, b) => b.faultRate - a.faultRate).slice(0, 10), [summaries])
  const recentAlerts = useMemo(() => alerts.filter(a => a.status === 'pending' || a.status === 'escalated').slice(0, 4), [alerts])
  const carriers: Array<'全部' | '移动' | '联通' | '电信'> = ['全部', '移动', '联通', '电信']

  const maxFaultRate = useMemo(() => Math.max(...faultRanking.map(p => p.faultRate), 1), [faultRanking])

  const statIcons = [
    { icon: Network, label: '光缆总里程', value: `${stats.totalCableKm}万`, unit: '公里', color: '#00D4FF', trend: '+2.3%' },
    { icon: Activity, label: '健康指数均值', value: String(stats.avgHealthIndex), unit: '', color: healthColor(stats.avgHealthIndex), trend: '+0.8' },
    { icon: AlertTriangle, label: '本月故障率', value: String(stats.monthlyFaultRate), unit: '%', color: faultColor(stats.monthlyFaultRate), trend: '-0.3%' },
    { icon: Clock, label: '平均修复时长', value: String(stats.avgRepairTime), unit: '小时', color: '#8BA3C7', trend: '-12%' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={selectedProvince ?? '全国'}
              onChange={e => setSelectedProvince(e.target.value === '全国' ? null : e.target.value)}
              className="bg-secondary border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-medium focus:outline-none focus:border-cyan appearance-none pr-10 cursor-pointer"
            >
              <option value="全国">全国</option>
              {summaries.map(s => <option key={s.province} value={s.province}>{s.province}</option>)}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none rotate-90" />
          </div>
          <div className="flex bg-secondary rounded-lg p-1 border border-border">
            {carriers.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCarrier(c)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedCarrier === c
                    ? 'bg-cyan/15 text-cyan shadow-inner'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>数据更新时间: {new Date().toLocaleString('zh-CN')}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statIcons.map((stat, i) => (
          <div key={i} className="card-glow p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity" style={{ background: stat.color }} />
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                stat.trend.startsWith('-') ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-text-muted text-sm mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="font-din text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
              <span className="text-sm text-text-secondary">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="card-glow p-5 w-[60%]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-text-primary font-semibold flex items-center gap-2">
              <Shield size={18} className="text-cyan" />
              全国光缆健康热力图
            </h3>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(0,230,118,0.5)' }} />
                <span>优秀</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(0,212,255,0.35)' }} />
                <span>良好</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,145,0,0.4)' }} />
                <span>一般</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,23,68,0.5)' }} />
                <span>较差</span>
              </div>
            </div>
          </div>
          <div className="relative h-[380px]">
            <div className="absolute inset-0 grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(10, 1fr)' }}>
              {HEATMAP.map(({ province, r, c }) => {
                const data = provinceMap.get(province)
                const hasData = !!data
                return (
                  <div
                    key={province}
                    className={`rounded-md flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${hasData ? 'hover:scale-105 hover:z-10' : 'opacity-25'}`}
                    style={{
                      gridRow: r,
                      gridColumn: c,
                      background: hasData ? healthBg(data!.avgHealthIndex) : 'rgba(90,122,158,0.1)',
                      border: hasData ? `1px solid ${healthBorder(data!.avgHealthIndex)}` : '1px solid rgba(90,122,158,0.1)',
                      boxShadow: hasData ? `inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
                    }}
                    title={hasData ? `${province} - 健康指数:${data!.avgHealthIndex} | 故障率:${data!.faultRate}%` : ''}
                    onClick={() => hasData && navigate(`/province/${province}`)}
                  >
                    <span className="text-text-primary font-medium text-sm leading-tight">{province}</span>
                    {hasData ? (
                      <span className="font-din text-xs mt-0.5" style={{ color: healthColor(data!.avgHealthIndex) }}>
                        {data!.avgHealthIndex}
                      </span>
                    ) : (
                      <span className="text-text-muted text-[10px] leading-tight opacity-50">无数据</span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan/40 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan/40 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan/40 rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan/40 rounded-br-lg pointer-events-none" />
          </div>
        </div>

        <div className="card-glow p-5 w-[40%] flex flex-col">
          <h3 className="text-text-primary font-semibold mb-4 flex items-center gap-2">
            <Zap size={18} className="text-warning" />
            故障率排名
          </h3>
          <div className="flex-1 space-y-2">
            {faultRanking.map((p, i) => (
              <div
                key={p.province}
                className={`flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-card-hover ${faultRankBg(i)}`}
                onClick={() => navigate(`/province/${p.province}`)}
              >
                <span className={`font-din w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-danger/20 text-danger' :
                  i === 1 ? 'bg-warning/20 text-warning' :
                  i === 2 ? 'bg-yellow-400/20 text-yellow-400' :
                  'bg-card text-text-muted'
                }`}>
                  {i + 1}
                </span>
                <span className="text-text-primary text-sm font-medium w-16">{p.province}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(p.faultRate / maxFaultRate) * 100}%`,
                      background: `linear-gradient(90deg, ${faultColor(p.faultRate)}33, ${faultColor(p.faultRate)})`,
                    }}
                  />
                </div>
                <span className={`font-din text-sm font-bold w-12 text-right ${faultRankColor(i)}`}>
                  {p.faultRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-glow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-text-primary font-semibold flex items-center gap-2">
            <AlertTriangle size={18} className="text-danger" />
            最新告警
            <span className="badge badge-red text-xs">{recentAlerts.length}</span>
          </h3>
          <button onClick={() => navigate('/alerts')} className="btn-secondary text-xs flex items-center gap-1 hover:text-cyan">
            查看全部
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {recentAlerts.map(a => (
            <div
              key={a.id}
              className={`flex items-center gap-4 bg-secondary/50 rounded-xl px-4 py-3.5 cursor-pointer hover:bg-card-hover transition-all group border border-transparent hover:border-cyan/30 ${
                a.level === 2 ? 'border-l-2 border-l-danger' : 'border-l-2 border-l-warning'
              }`}
              onClick={() => navigate('/alerts')}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                a.level === 2 ? 'bg-danger/15' : 'bg-warning/15'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${a.level === 2 ? 'text-danger' : 'text-warning'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-text-primary text-sm font-medium truncate">{a.cableSegmentName}</p>
                  <span className={`badge ${a.level === 2 ? 'badge-red' : 'badge-orange'} shrink-0 text-[10px]`}>
                    {a.level === 2 ? '二级' : '一级'}
                  </span>
                </div>
                <p className="text-text-muted text-xs truncate">{a.triggerReason}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-text-secondary text-xs font-mono">{a.createdAt.split(' ')[1]}</p>
                <span className={`badge ${a.status === 'escalated' ? 'badge-red' : 'badge-orange'} text-[10px] mt-1`}>
                  {a.status === 'escalated' ? '已升级' : '待处理'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
