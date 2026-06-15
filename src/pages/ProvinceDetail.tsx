import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import ReactECharts from 'echarts-for-react'
import { ChevronRight, ArrowLeft, Activity, Cable, AlertTriangle, Clock } from 'lucide-react'

const cityColors = ['#00D4FF', '#00E676', '#FF9100', '#B388FF', '#FFD740', '#FF4081']

export default function ProvinceDetail() {
  const { provinceId } = useParams<{ provinceId: string }>()
  const navigate = useNavigate()
  const getProvinceSummary = useAppStore((s) => s.getProvinceSummary)
  const getFilteredCableSegments = useAppStore((s) => s.getFilteredCableSegments)
  const summary = getProvinceSummary(provinceId || '')
  const segments = getFilteredCableSegments().filter((s) => s.province === provinceId)

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        <p>未找到该省份数据</p>
        <button className="btn-primary ml-4" onClick={() => navigate('/')}>返回首页</button>
      </div>
    )
  }

  const healthColor = (v: number) => v > 85 ? '#00E676' : v >= 70 ? '#FF9100' : '#FF1744'
  const healthBadge = (v: number) => v > 85 ? 'badge-green' : v >= 70 ? 'badge-orange' : 'badge-red'

  const powerTrendOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#152238', borderColor: '#1E3A5F', textStyle: { color: '#E8F0FE' } },
    legend: { data: summary.cityDetails.map((c) => c.city), textStyle: { color: '#8BA3C7' }, top: 0 },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: summary.cityDetails[0]?.powerTrend.map((d) => d.date) || [], axisLabel: { color: '#8BA3C7' }, axisLine: { lineStyle: { color: '#1E3A5F' } } },
    yAxis: { type: 'value', name: 'dBm', nameTextStyle: { color: '#8BA3C7' }, axisLabel: { color: '#8BA3C7' }, splitLine: { lineStyle: { color: '#1E3A5F' } }, axisLine: { lineStyle: { color: '#1E3A5F' } } },
    series: summary.cityDetails.map((c, i) => ({
      name: c.city, type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
      lineStyle: { color: cityColors[i % cityColors.length], width: 2 },
      itemStyle: { color: cityColors[i % cityColors.length] },
      data: c.powerTrend.map((d) => d.value),
    })),
  }

  const combinedFaults: Record<string, number> = {}
  let totalFaults = 0
  summary.cityDetails.forEach((c) => {
    Object.entries(c.faultTypeDistribution).forEach(([k, v]) => {
      combinedFaults[k] = (combinedFaults[k] || 0) + v
      totalFaults += v
    })
  })
  const faultColors = ['#00D4FF', '#00E676', '#FF9100', '#FF1744', '#B388FF', '#FFD740']
  const faultTypeOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: '#152238', borderColor: '#1E3A5F', textStyle: { color: '#E8F0FE' } },
    graphic: [{ type: 'text', left: 'center', top: 'middle', style: { text: `${totalFaults}`, fill: '#E8F0FE', fontSize: 28, fontWeight: 700, fontFamily: 'DIN Alternate' } }, { type: 'text', left: 'center', top: 'middle', style: { text: '总故障', fill: '#8BA3C7', fontSize: 12, y: 22 } }],
    series: [{
      type: 'pie', radius: ['50%', '75%'], center: ['50%', '50%'],
      label: { color: '#8BA3C7', fontSize: 11 },
      data: Object.entries(combinedFaults).map(([name, value], i) => ({ name, value, itemStyle: { color: faultColors[i % faultColors.length] } })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,212,255,0.3)' } },
    }],
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span className="cursor-pointer hover:text-cyan transition-colors" onClick={() => navigate('/')}>全国总览</span>
        <ChevronRight size={14} />
        <span className="text-text-primary">{provinceId}</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="btn-secondary flex items-center gap-1" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />返回
        </button>
        <h1 className="text-xl font-bold">{provinceId}省光纤网络运维详情</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '平均健康指数', value: summary.avgHealthIndex, icon: Activity, suffix: '' },
          { label: '光缆总里程', value: summary.totalCableKm, icon: Cable, suffix: ' km' },
          { label: '故障率', value: summary.faultRate, icon: AlertTriangle, suffix: '%' },
          { label: '平均修复时长', value: summary.avgRepairTime, icon: Clock, suffix: ' h' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
              <s.icon size={14} />{s.label}
            </div>
            <div className="stat-value font-din text-cyan">{s.value}<span className="text-sm text-text-muted font-normal">{s.suffix}</span></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {summary.cityDetails.map((city) => (
          <div key={city.city} className="card-glow p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{city.city}</span>
              <span className={`badge ${healthBadge(city.healthIndex)}`}>{city.healthIndex}</span>
            </div>
            <div className="health-bar"><div className="health-bar-fill" style={{ width: `${city.healthIndex}%`, background: healthColor(city.healthIndex) }} /></div>
            <div className="flex justify-between text-xs text-text-muted">
              <span>光缆: {city.cableCount}</span>
              <span>故障: {city.faultCount}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">近30天光功率趋势</h2>
        <ReactECharts option={powerTrendOption} style={{ height: 300 }} />
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">故障类型分布</h2>
        <ReactECharts option={faultTypeOption} style={{ height: 300 }} />
      </div>

      <div className="card p-5 overflow-x-auto">
        <h2 className="font-semibold mb-3">光缆段明细</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-left border-b border-border">
              <th className="pb-2 pr-4">光缆段名称</th>
              <th className="pb-2 pr-4">运营商</th>
              <th className="pb-2 pr-4">类型</th>
              <th className="pb-2 pr-4">健康指数</th>
              <th className="pb-2 pr-4">光功率(dBm)</th>
              <th className="pb-2 pr-4">衰耗(dB/km)</th>
              <th className="pb-2 pr-4">温度(℃)</th>
              <th className="pb-2 pr-4">振动</th>
              <th className="pb-2 pr-4">运维班组</th>
              <th className="pb-2">最近巡检</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((seg) => (
              <tr key={seg.id} className="border-b border-border/50 hover:bg-card-hover transition-colors">
                <td className="py-2.5 pr-4 text-text-primary">{seg.name}</td>
                <td className="py-2.5 pr-4">{seg.carrier}</td>
                <td className="py-2.5 pr-4">{seg.cableType}</td>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="health-bar w-16"><div className="health-bar-fill" style={{ width: `${seg.healthIndex}%`, background: healthColor(seg.healthIndex) }} /></div>
                    <span className="font-din text-xs" style={{ color: healthColor(seg.healthIndex) }}>{seg.healthIndex}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 font-din">{seg.opticalPower}</td>
                <td className="py-2.5 pr-4 font-din">{seg.attenuation}</td>
                <td className="py-2.5 pr-4 font-din">{seg.temperature}</td>
                <td className="py-2.5 pr-4 font-din">{seg.vibrationLevel}</td>
                <td className="py-2.5 pr-4 text-text-secondary">{seg.teamName}</td>
                <td className="py-2.5 text-text-muted">{seg.lastInspection}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
